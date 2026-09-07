/**
 * 知识图谱领域模型
 */

import { BaseEntity } from './base-entity';

export type NodeType = 'note' | 'tag' | 'folder' | 'person' | 'concept';
export type EdgeType = 'link' | 'tag' | 'folder' | 'mention' | 'related';

export interface GraphNode extends BaseEntity {
  entityId: string; // 关联的实体ID（笔记ID/标签ID等）
  type: NodeType;
  label: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  degree: number;
  metadata?: Record<string, unknown>;
}

export interface GraphEdge extends BaseEntity {
  source: string; // 源节点ID
  target: string; // 目标节点ID
  type: EdgeType;
  weight: number;
  label?: string;
  metadata?: Record<string, unknown>;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphLayoutConfig {
  linkDistance: number;
  chargeStrength: number;
  collisionRadius: number;
  alphaDecay: number;
  velocityDecay: number;
}

export interface GraphViewState {
  zoom: number;
  panX: number;
  panY: number;
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  showLabels: boolean;
  colorBy: 'type' | 'tag' | 'folder' | 'degree';
  filterTypes: NodeType[];
}

export const DEFAULT_GRAPH_LAYOUT: GraphLayoutConfig = {
  linkDistance: 120,
  chargeStrength: -300,
  collisionRadius: 40,
  alphaDecay: 0.02,
  velocityDecay: 0.4,
};

export const DEFAULT_GRAPH_VIEW: GraphViewState = {
  zoom: 1,
  panX: 0,
  panY: 0,
  selectedNodeId: null,
  hoveredNodeId: null,
  showLabels: true,
  colorBy: 'type',
  filterTypes: ['note', 'tag', 'folder', 'person', 'concept'],
};

export function createGraphNode(
  entityId: string,
  type: NodeType,
  label: string,
  x = 0,
  y = 0
): GraphNode {
  const now = new Date().toISOString();
  const colors: Record<NodeType, string> = {
    note: '#8B5CF6',
    tag: '#00CEC9',
    folder: '#FDCB6E',
    person: '#FD79A8',
    concept: '#00B894',
  };
  return {
    id: `gn_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    entityId,
    type,
    label,
    x,
    y,
    vx: 0,
    vy: 0,
    size: 20,
    color: colors[type],
    degree: 0,
    createdAt: now,
    updatedAt: now,
    version: 1,
    deviceId: 'web',
    syncState: 'local',
    deleted: false,
  };
}

export function createGraphEdge(
  source: string,
  target: string,
  type: EdgeType,
  weight = 1
): GraphEdge {
  const now = new Date().toISOString();
  return {
    id: `ge_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    source,
    target,
    type,
    weight,
    createdAt: now,
    updatedAt: now,
    version: 1,
    deviceId: 'web',
    syncState: 'local',
    deleted: false,
  };
}
