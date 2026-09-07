/**
 * OneOS 力导向图模拟Hook
 * 从GraphPage提取，负责节点力模拟和动画
 * 
 * 作者：A07 梅罗文加（算法工程师）
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  degree: number;
  community?: number;
  centrality?: {
    degree: number;
    betweenness: number;
    closeness: number;
    pagerank: number;
  };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
}

interface UseForceSimulationOptions {
  repulsionStrength?: number;
  attractionStrength?: number;
  damping?: number;
  idealDistance?: number;
}

/**
 * 力导向图模拟Hook
 */
export function useForceSimulation(
  initialNodes: GraphNode[] = [],
  initialEdges: GraphEdge[] = [],
  options: UseForceSimulationOptions = {}
) {
  const {
    repulsionStrength = 3000,
    attractionStrength = 0.02,
    damping = 0.85,
    idealDistance = 120,
  } = options;

  const [nodes, setNodes] = useState<GraphNode[]>(initialNodes);
  const [edges, setEdges] = useState<GraphEdge[]>(initialEdges);
  const [dragNode, setDragNode] = useState<GraphNode | null>(null);
  const animationRef = useRef<number>();

  // 力导向模拟
  useEffect(() => {
    if (nodes.length === 0) return;

    const simulate = () => {
      setNodes((prev) => {
        const updatedNodes = prev.map((n) => ({ ...n }));

        // 斥力（节点之间）
        for (let i = 0; i < updatedNodes.length; i++) {
          for (let j = i + 1; j < updatedNodes.length; j++) {
            const dx = updatedNodes[j].x - updatedNodes[i].x;
            const dy = updatedNodes[j].y - updatedNodes[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = -repulsionStrength / (dist * dist);
            updatedNodes[i].vx += (dx / dist) * force;
            updatedNodes[i].vy += (dy / dist) * force;
            updatedNodes[j].vx -= (dx / dist) * force;
            updatedNodes[j].vy -= (dy / dist) * force;
          }
        }

        // 引力（边连接的节点）
        for (const edge of edges) {
          const s = updatedNodes.find((n) => n.id === edge.source);
          const t = updatedNodes.find((n) => n.id === edge.target);
          if (!s || !t) continue;
          const dx = t.x - s.x;
          const dy = t.y - s.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = (dist - idealDistance) * attractionStrength;
          s.vx += (dx / dist) * force;
          s.vy += (dy / dist) * force;
          t.vx -= (dx / dist) * force;
          t.vy -= (dy / dist) * force;
        }

        // 阻尼和位置更新
        for (const node of updatedNodes) {
          if (node === dragNode) continue;
          node.vx *= damping;
          node.vy *= damping;
          node.x += node.vx;
          node.y += node.vy;
        }

        return updatedNodes;
      });

      animationRef.current = requestAnimationFrame(simulate);
    };

    animationRef.current = requestAnimationFrame(simulate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [edges, dragNode, repulsionStrength, attractionStrength, damping, idealDistance]);

  // 更新节点位置（拖拽时）
  const updateNodePosition = useCallback((nodeId: string, x: number, y: number) => {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === nodeId ? { ...n, x, y, vx: 0, vy: 0 } : n
      )
    );
  }, []);

  // 重置布局
  const resetLayout = useCallback(() => {
    setNodes((prev) =>
      prev.map((node, index) => {
        const angle = (index / prev.length) * Math.PI * 2;
        const radius = 150 + Math.random() * 100;
        return {
          ...node,
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          vx: 0,
          vy: 0,
        };
      })
    );
  }, []);

  return {
    nodes,
    edges,
    setNodes,
    setEdges,
    dragNode,
    setDragNode,
    updateNodePosition,
    resetLayout,
  };
}

export default useForceSimulation;
