/**
 * OneOS 图算法类型定义
 * 从graph-algorithm-engine提取
 * 
 * 作者：A07 梅罗文加（算法工程师）
 */

export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
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
  metadata?: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
}

export interface Community {
  id: number;
  name: string;
  color: string;
  nodeIds: string[];
  size: number;
  internalEdges: number;
  externalEdges: number;
  modularity: number;
}

export interface PathResult {
  path: string[];
  distance: number;
  edges: GraphEdge[];
}

export interface Recommendation {
  nodeId: string;
  score: number;
  reason: string;
  commonNeighbors: string[];
}

export interface CentralityResult {
  [nodeId: string]: {
    degree: number;
    betweenness: number;
    closeness: number;
    pagerank: number;
  };
}

export interface GraphStats {
  nodeCount: number;
  edgeCount: number;
  density: number;
  avgDegree: number;
  maxDegree: number;
  minDegree: number;
  connectedComponents: number;
  diameter: number;
  avgPathLength: number;
  clusteringCoefficient: number;
}

export interface InfluenceResult {
  nodeId: string;
  influence: number;
  type: 'pagerank' | 'degree' | 'betweenness' | 'composite';
}

// 社区颜色调色板
export const COMMUNITY_COLORS = [
  '#8B5CF6', // 紫色
  '#00CEC9', // 青色
  '#FD79A8', // 粉色
  '#FDCB6E', // 黄色
  '#0984E3', // 蓝色
  '#00B894', // 绿色
  '#E17055', // 橙色
  '#6C5CE7', // 靛蓝
  '#A29BFE', // 淡紫
  '#74B9FF', // 淡蓝
  '#55EFC4', // 淡绿
  '#FFEAA7', // 淡黄
];

// 根据社区ID获取颜色
export function getCommunityColor(communityId: number): string {
  return COMMUNITY_COLORS[communityId % COMMUNITY_COLORS.length];
}

// 根据社区ID生成社区名称
export function getCommunityName(communityId: number): string {
  const names = ['阿尔法', '贝塔', '伽马', '德尔塔', '艾普西隆', '泽塔', '伊塔', '西塔', '约塔', '卡帕', '拉姆达', '缪'];
  return names[communityId % names.length] + `社区${communityId + 1}`;
}
