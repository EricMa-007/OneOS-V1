/**
 * OneOS 图谱Canvas渲染组件
 * 从GraphPage提取，负责Canvas绘制、鼠标交互、缩放平移
 * 
 * 作者：A02 墨菲斯（全栈工程师）
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GraphNode, GraphEdge } from '../../shared/hooks/useForceSimulation';

interface GraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  zoom: number;
  panX: number;
  panY: number;
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string | null) => void;
  onNodeDrag: (nodeId: string, x: number, y: number) => void;
  onPan: (x: number, y: number) => void;
  onZoom: (zoom: number) => void;
  highlightCommunity?: boolean;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  nodes,
  edges,
  zoom,
  panX,
  panY,
  selectedNodeId,
  onNodeSelect,
  onNodeDrag,
  onPan,
  onZoom,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragNode, setDragNode] = useState<GraphNode | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

  // Canvas渲染
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2 + panX;
      const cy = canvas.height / 2 + panY;

      // 绘制边
      for (const edge of edges) {
        const s = nodes.find((n) => n.id === edge.source);
        const t = nodes.find((n) => n.id === edge.target);
        if (!s || !t) continue;

        ctx.beginPath();
        ctx.moveTo(cx + s.x * zoom, cy + s.y * zoom);
        ctx.lineTo(cx + t.x * zoom, cy + t.y * zoom);
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 绘制节点
      for (const node of nodes) {
        const x = cx + node.x * zoom;
        const y = cy + node.y * zoom;
        const r = node.size * zoom;
        const isSelected = selectedNodeId === node.id;
        const isHovered = hoveredNode?.id === node.id;

        // 节点光晕（悬停时）
        if (isHovered) {
          ctx.beginPath();
          ctx.arc(x, y, r + 6, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(139, 92, 246, 0.15)';
          ctx.fill();
        }

        // 节点本体
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();

        // 选中边框
        if (isSelected) {
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        // 节点标签
        ctx.font = `${12 * zoom}px Inter, sans-serif`;
        ctx.fillStyle = 'var(--text-primary)';
        ctx.textAlign = 'center';
        const label = node.label.length > 10 ? node.label.slice(0, 10) + '...' : node.label;
        ctx.fillText(label, x, y + r + 16);
      }

      requestAnimationFrame(draw);
    };

    const animId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [nodes, edges, zoom, panX, panY, selectedNodeId, hoveredNode]);

  // 获取鼠标在图谱坐标系中的位置
  const getMousePos = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left - canvas.width / 2 - panX,
      y: e.clientY - rect.top - canvas.height / 2 - panY,
    };
  }, [panX, panY]);

  // 查找指定位置的节点
  const findNodeAtPos = useCallback((x: number, y: number): GraphNode | null => {
    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i];
      const dx = x / zoom - node.x;
      const dy = y / zoom - node.y;
      if (Math.sqrt(dx * dx + dy * dy) < node.size + 5) return node;
    }
    return null;
  }, [nodes, zoom]);

  // 鼠标按下
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const pos = getMousePos(e);
    const node = findNodeAtPos(pos.x, pos.y);
    if (node) {
      setIsDragging(true);
      setDragNode(node);
      onNodeSelect(node.id);
    } else {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panX, y: e.clientY - panY });
      onNodeSelect(null);
    }
  }, [getMousePos, findNodeAtPos, onNodeSelect, panX, panY]);

  // 鼠标移动
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && dragNode) {
      const pos = getMousePos(e);
      onNodeDrag(dragNode.id, pos.x / zoom, pos.y / zoom);
    } else if (isPanning) {
      onPan(e.clientX - panStart.x, e.clientY - panStart.y);
    } else {
      // 悬停检测
      const pos = getMousePos(e);
      const node = findNodeAtPos(pos.x, pos.y);
      setHoveredNode(node);
    }
  }, [isDragging, dragNode, isPanning, getMousePos, onNodeDrag, zoom, panStart, onPan, findNodeAtPos]);

  // 鼠标释放
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragNode(null);
    setIsPanning(false);
  }, []);

  // 鼠标滚轮缩放
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.2, Math.min(5, zoom * delta));
    onZoom(newZoom);
  }, [zoom, onZoom]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        cursor: isPanning ? 'grabbing' : isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      />

      {/* 悬停节点信息 */}
      {hoveredNode && (
        <div
          style={{
            position: 'absolute',
            left: `calc(50% + ${hoveredNode.x * zoom + panX}px)`,
            top: `calc(50% + ${hoveredNode.y * zoom + panY - 50}px)`,
            transform: 'translateX(-50%)',
            padding: '6px 10px',
            background: 'rgba(0,0,0,0.8)',
            color: '#FFFFFF',
            borderRadius: 6,
            fontSize: 12,
            pointerEvents: 'none',
            zIndex: 20,
            whiteSpace: 'nowrap',
          }}
        >
          <div style={{ fontWeight: 600 }}>{hoveredNode.label}</div>
          {hoveredNode.centrality && (
            <div style={{ fontSize: 10, opacity: 0.8, marginTop: 2 }}>
              PageRank: {(hoveredNode.centrality.pagerank * 1000).toFixed(2)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GraphCanvas;
