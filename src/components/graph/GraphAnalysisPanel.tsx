/**
 * OneOS 图谱分析面板组件
 * 从GraphPage提取，负责社区发现、中心性分析、影响力分析的UI
 * 
 * 作者：A05 娜奥米（UI/UX设计师）
 */

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Tag } from '../ui/Tag';
import { GraphNode } from '../../shared/hooks/useForceSimulation';
import { Community } from '../../shared/kernel/graph-algorithm-engine';

export type AnalysisMode = 'none' | 'community' | 'centrality' | 'influence';

interface GraphAnalysisPanelProps {
  mode: AnalysisMode;
  onModeChange: (mode: AnalysisMode) => void;
  communities: Community[];
  influentialNodes: Array<{ nodeId: string; influence: number; type: string }>;
  graphStats: Record<string, unknown> | null;
  isAnalyzing: boolean;
  onAnalyze: (mode: AnalysisMode) => void;
  nodes: GraphNode[];
  onNodeClick: (nodeId: string) => void;
}

export const GraphAnalysisPanel: React.FC<GraphAnalysisPanelProps> = ({
  mode,
  onModeChange,
  communities,
  influentialNodes,
  graphStats,
  isAnalyzing,
  onAnalyze,
  nodes,
  onNodeClick,
}) => {
  const [expanded, setExpanded] = useState(true);

  const analysisModes: Array<{ key: AnalysisMode; label: string; icon: string }> = [
    { key: 'community', label: '社区发现', icon: '👥' },
    { key: 'centrality', label: '中心性', icon: '🎯' },
    { key: 'influence', label: '影响力', icon: '⭐' },
  ];

  return (
    <Card
      style={{
        position: 'absolute',
        top: 16,
        right: 16,
        width: 320,
        maxHeight: 'calc(100% - 32px)',
        overflow: 'auto',
        zIndex: 10,
      }}
    >
      <div style={{ padding: 16 }}>
        {/* 标题栏 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>图谱分析</h3>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 18,
              color: 'var(--color-text-secondary)',
            }}
          >
            {expanded ? '−' : '+'}
          </button>
        </div>

        {expanded && (
          <>
            {/* 分析模式选择 */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {analysisModes.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    onModeChange(mode === item.key ? 'none' : item.key);
                    if (mode !== item.key) onAnalyze(item.key);
                  }}
                  style={{
                    flex: 1,
                    minWidth: 80,
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid',
                    borderColor: mode === item.key ? 'var(--color-primary-500)' : 'var(--color-border)',
                    background: mode === item.key ? 'var(--color-primary-100)' : 'transparent',
                    color: mode === item.key ? 'var(--color-primary-500)' : 'var(--color-text-primary)',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span style={{ marginRight: 4 }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>

            {/* 加载状态 */}
            {isAnalyzing && (
              <div style={{ textAlign: 'center', padding: 20, color: 'var(--color-text-secondary)' }}>
                <div style={{ fontSize: 24, marginBottom: 8, animation: 'spin 1s linear infinite' }}>⚙️</div>
                <div style={{ fontSize: 13 }}>分析中...</div>
              </div>
            )}

            {/* 图统计 */}
            {graphStats && !isAnalyzing && (
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ fontSize: 13, fontWeight: 600, margin: '0 0 8px 0', color: 'var(--color-text-secondary)' }}>
                  图谱统计
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <StatItem label="节点数" value={graphStats.nodeCount as number} />
                  <StatItem label="边数" value={graphStats.edgeCount as number} />
                  <StatItem label="密度" value={(graphStats.density as number)?.toFixed(3)} />
                  <StatItem label="平均度" value={(graphStats.avgDegree as number)?.toFixed(1)} />
                </div>
              </div>
            )}

            {/* 社区发现结果 */}
            {mode === 'community' && communities.length > 0 && !isAnalyzing && (
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ fontSize: 13, fontWeight: 600, margin: '0 0 8px 0', color: 'var(--color-text-secondary)' }}>
                  发现 {communities.length} 个社区
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {communities.slice(0, 5).map((community, index) => (
                    <div
                      key={community.id}
                      style={{
                        padding: 8,
                        borderRadius: 8,
                        background: 'var(--color-bg-tertiary)',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>
                          社区 {index + 1}
                        </span>
                        <Tag color={community.color}>{community.nodeIds.length} 节点</Tag>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 影响力节点 */}
            {mode === 'influence' && influentialNodes.length > 0 && !isAnalyzing && (
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ fontSize: 13, fontWeight: 600, margin: '0 0 8px 0', color: 'var(--color-text-secondary)' }}>
                  最具影响力节点
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {influentialNodes.slice(0, 5).map((item, index) => {
                    const node = nodes.find((n) => n.id === item.nodeId);
                    return (
                      <div
                        key={item.nodeId}
                        onClick={() => onNodeClick(item.nodeId)}
                        style={{
                          padding: 8,
                          borderRadius: 8,
                          background: 'var(--color-bg-tertiary)',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary-500)' }}>
                            #{index + 1}
                          </span>
                          <span style={{ fontSize: 12, fontWeight: 500 }}>
                            {node?.label || item.nodeId}
                          </span>
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                          {(item.influence * 100).toFixed(1)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 中心性分析提示 */}
            {mode === 'centrality' && !isAnalyzing && (
              <div style={{ padding: 12, background: 'var(--color-info-bg)', borderRadius: 8, fontSize: 12, color: 'var(--color-info)' }}>
                节点大小已按中心性调整。悬停节点查看详细中心性指标。
              </div>
            )}
          </>
        )}
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Card>
  );
};

const StatItem: React.FC<{ label: string; value: string | number | undefined }> = ({ label, value }) => (
  <div style={{ padding: 8, background: 'var(--color-bg-tertiary)', borderRadius: 6 }}>
    <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 2 }}>{label}</div>
    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>{value ?? '-'}</div>
  </div>
);

export default GraphAnalysisPanel;
