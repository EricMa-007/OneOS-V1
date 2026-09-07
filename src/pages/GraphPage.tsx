/**
 * OneOS 知识图谱页面
 * 主页面组件，负责状态管理和布局
 * 具体渲染和交互委托给GraphCanvas和GraphAnalysisPanel
 * 
 * 作者：A07 梅罗文加（算法工程师）
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useGraphStore } from '../stores/graph-store';
import { useNoteStore } from '../stores/note-store';
import { useAppStore } from '../stores/app-store';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { EmptyState } from '../components/ui/EmptyState';
import { useToast } from '../components/ui/Toast';
import { GraphCanvas } from '../components/graph/GraphCanvas';
import { GraphAnalysisPanel, AnalysisMode } from '../components/graph/GraphAnalysisPanel';
import { useForceSimulation, GraphNode, GraphEdge } from '../shared/hooks/useForceSimulation';
import { graphAlgorithmEngine, Community } from '../shared/kernel/graph-algorithm-engine';
import type { GraphStats } from '../types/global';

export const GraphPage: React.FC = () => {
  const { view, setZoom, setPan, selectNode, rebuild } = useGraphStore();
  const { notes } = useNoteStore();
  const { setCurrentNav } = useAppStore();
  const toast = useToast();

  // 力导向模拟
  const {
    nodes: simNodes,
    edges: simEdges,
    setNodes: setSimNodes,
    setEdges: setSimEdges,
    setDragNode,
    updateNodePosition,
    resetLayout,
  } = useForceSimulation([], []);

  // 分析状态
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('none');
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(true);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [graphStats, setGraphStats] = useState<GraphStats | null>(null);
  const [influentialNodes, setInfluentialNodes] = useState<
    Array<{ nodeId: string; influence: number; type: string }>
  >([]);

  // 从笔记生成图谱数据
  useEffect(() => {
    if (notes.length === 0) return;

    const newNodes: GraphNode[] = notes.slice(0, 30).map((note, index) => {
      const angle = (index / Math.min(notes.length, 30)) * Math.PI * 2;
      const radius = 150 + Math.random() * 100;
      return {
        id: note.id,
        label: note.title || '无标题',
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        size: 15 + (note.tagIds?.length || 0) * 3,
        color: note.tagIds?.length > 0 ? '#8B5CF6' : '#00CEC9',
        degree: 0,
      };
    });

    const newEdges: GraphEdge[] = [];
    for (let i = 0; i < newNodes.length; i++) {
      for (let j = i + 1; j < newNodes.length; j++) {
        if (Math.random() > 0.7) {
          newEdges.push({
            id: `edge_${i}_${j}`,
            source: newNodes[i].id,
            target: newNodes[j].id,
            weight: 1,
          });
        }
      }
    }

    setSimNodes(newNodes);
    setSimEdges(newEdges);
  }, [notes, setSimNodes, setSimEdges]);

  // 执行图谱分析
  const handleAnalyze = useCallback(
    async (mode: AnalysisMode) => {
      if (simNodes.length === 0) {
        toast.warning('暂无图谱数据，请先创建笔记');
        return;
      }

      setIsAnalyzing(true);
      try {
        // 转换为算法引擎需要的格式
        const graphData = {
          nodes: simNodes.map((n) => ({ id: n.id, label: n.label })),
          edges: simEdges.map((e) => ({ source: e.source, target: e.target, weight: e.weight })),
        };

        if (mode === 'community') {
          const result = await graphAlgorithmEngine.detectCommunities(graphData);
          setCommunities(result.communities);
          // 给节点添加社区信息
          setSimNodes((prev) =>
            prev.map((node) => {
              const community = result.communities.find((c) => c.nodeIds.includes(node.id));
              return { ...node, community: community ? parseInt(community.id) : undefined };
            })
          );
          toast.success(`发现 ${result.communities.length} 个社区`);
        } else if (mode === 'centrality') {
          const result = await graphAlgorithmEngine.calculateCentrality(graphData);
          setSimNodes((prev) =>
            prev.map((node) => {
              const centrality = result.centralities[node.id];
              return {
                ...node,
                centrality: centrality
                  ? {
                      degree: centrality.degree,
                      betweenness: centrality.betweenness,
                      closeness: centrality.closeness,
                      pagerank: centrality.pagerank,
                    }
                  : undefined,
                size: centrality ? 15 + centrality.pagerank * 200 : node.size,
              };
            })
          );
          toast.success('中心性分析完成');
        } else if (mode === 'influence') {
          const result = await graphAlgorithmEngine.calculateInfluence(graphData);
          setInfluentialNodes(result.topInfluential);
          toast.success('影响力分析完成');
        }

        // 计算图谱统计
        const stats = await graphAlgorithmEngine.getGraphStats(graphData);
        setGraphStats(stats as GraphStats);
      } catch (error) {
        console.error('图谱分析失败:', error);
        toast.error('分析失败，请重试');
      } finally {
        setIsAnalyzing(false);
      }
    },
    [simNodes, simEdges, setSimNodes, toast]
  );

  // 节点拖拽
  const handleNodeDrag = useCallback(
    (nodeId: string, x: number, y: number) => {
      updateNodePosition(nodeId, x, y);
    },
    [updateNodePosition]
  );

  // 空状态
  if (notes.length === 0) {
    return (
      <EmptyState
        icon="graph"
        title="暂无图谱数据"
        description="创建笔记后，知识图谱将自动生成"
        action={
          <Button onClick={() => setCurrentNav('notes')}>去创建笔记</Button>
        }
      />
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* 图谱Canvas */}
      <GraphCanvas
        nodes={simNodes}
        edges={simEdges}
        zoom={view.zoom}
        panX={view.panX}
        panY={view.panY}
        selectedNodeId={view.selectedNodeId}
        onNodeSelect={selectNode}
        onNodeDrag={handleNodeDrag}
        onPan={setPan}
        onZoom={setZoom}
      />

      {/* 工具栏 */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          zIndex: 10,
        }}
      >
        <Card style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(Math.min(5, view.zoom * 1.2))}
            title="放大"
          >
            <Icon name="zoom-in" size={18} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(Math.max(0.2, view.zoom / 1.2))}
            title="缩小"
          >
            <Icon name="zoom-out" size={18} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setZoom(1);
              setPan(0, 0);
            }}
            title="重置视图"
          >
            <Icon name="maximize" size={18} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetLayout}
            title="重新布局"
          >
            <Icon name="refresh" size={18} />
          </Button>
        </Card>

        {/* 缩放比例 */}
        <Card style={{ padding: '4px 8px', textAlign: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            {Math.round(view.zoom * 100)}%
          </span>
        </Card>
      </div>

      {/* 分析面板切换按钮 */}
      {!showAnalysisPanel && (
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowAnalysisPanel(true)}
          style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}
        >
          <Icon name="chart" size={16} style={{ marginRight: 6 }} />
          图谱分析
        </Button>
      )}

      {/* 分析面板 */}
      {showAnalysisPanel && (
        <div style={{ position: 'relative' }}>
          <GraphAnalysisPanel
            mode={analysisMode}
            onModeChange={setAnalysisMode}
            communities={communities}
            influentialNodes={influentialNodes}
            graphStats={graphStats}
            isAnalyzing={isAnalyzing}
            onAnalyze={handleAnalyze}
            nodes={simNodes}
            onNodeClick={selectNode}
          />
          {/* 关闭按钮 */}
          <button
            onClick={() => setShowAnalysisPanel(false)}
            style={{
              position: 'absolute',
              top: 24,
              right: 24,
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: 'var(--color-bg-tertiary)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              color: 'var(--color-text-secondary)',
              zIndex: 11,
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* 选中节点信息 */}
      {view.selectedNodeId && (
        <Card
          style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            padding: 12,
            minWidth: 200,
            zIndex: 10,
          }}
        >
          {(() => {
            const node = simNodes.find((n) => n.id === view.selectedNodeId);
            if (!node) return null;
            return (
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{node.label}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                  度: {node.degree} | 大小: {node.size.toFixed(1)}
                </div>
                {node.community !== undefined && (
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                    社区: #{node.community + 1}
                  </div>
                )}
                {node.centrality && (
                  <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 4, lineHeight: 1.5 }}>
                    PageRank: {(node.centrality.pagerank * 1000).toFixed(2)}
                    <br />
                    介数: {node.centrality.betweenness.toFixed(3)}
                  </div>
                )}
              </div>
            );
          })()}
        </Card>
      )}
    </div>
  );
};

export default GraphPage;
