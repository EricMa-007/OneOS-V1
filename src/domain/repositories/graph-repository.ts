/**
 * 知识图谱Repository接口
 */

import { GraphNode, GraphEdge, GraphData } from '../models/graph';

export interface IGraphRepository {
  // 节点
  getNodeById(id: string): Promise<GraphNode | null>;
  getNodeByEntityId(entityId: string): Promise<GraphNode | null>;
  getAllNodes(): Promise<GraphNode[]>;
  createNode(node: Omit<GraphNode, keyof import('../models/base-entity').BaseEntity>): Promise<GraphNode>;
  updateNode(id: string, updates: Partial<GraphNode>): Promise<GraphNode>;
  deleteNode(id: string): Promise<void>;
  hardDeleteNode(id: string): Promise<void>;

  // 边
  getEdgeById(id: string): Promise<GraphEdge | null>;
  getEdgesByNode(nodeId: string): Promise<GraphEdge[]>;
  getAllEdges(): Promise<GraphEdge[]>;
  createEdge(edge: Omit<GraphEdge, keyof import('../models/base-entity').BaseEntity>): Promise<GraphEdge>;
  updateEdge(id: string, updates: Partial<GraphEdge>): Promise<GraphEdge>;
  deleteEdge(id: string): Promise<void>;
  hardDeleteEdge(id: string): Promise<void>;

  // 整体
  getGraphData(): Promise<GraphData>;
  saveGraphData(data: GraphData): Promise<void>;
  rebuildFromNotes(): Promise<GraphData>;
  clear(): Promise<void>;
}
