/**
 * OneOS 知识图谱算法引擎
 * 主引擎类，整合社区发现、中心性分析、路径查找等算法
 * 
 * 由 A11 梅罗文加（首席算法科学家）设计实现
 * 
 * 核心算法：
 * - 社区发现（Louvain算法简化版 + 标签传播）
 * - 中心性分析（度中心性、介数中心性、接近中心性、PageRank）
 * - 路径推荐（最短路径、相关节点推荐、相似节点发现）
 * - 图统计（密度、直径、平均路径长度、聚类系数）
 */

import {
  GraphNode,
  GraphEdge,
  Community,
  PathResult,
  Recommendation,
  CentralityResult,
  GraphStats,
  InfluenceResult,
} from './graph/graph-types';
import {
  buildAdjacencyList,
  calculateDensity,
  calculateAverageDegree,
  findConnectedComponents,
  calculateGlobalClusteringCoefficient,
} from './graph/graph-utils';
import { detectCommunities, labelPropagation } from './graph/community-detection';
import {
  calculateAllCentralities,
  calculateInfluenceRanking,
} from './graph/centrality-analysis';
import {
  findShortestPath,
  recommendNodes,
  findSimilarNodes,
  calculateDiameter,
  calculateAveragePathLength,
} from './graph/path-finding';

// 重新导出类型，保持向后兼容
export type {
  GraphNode,
  GraphEdge,
  Community,
  PathResult,
  Recommendation,
  CentralityResult,
  GraphStats,
  InfluenceResult,
};

/**
 * 图算法引擎
 */
export class GraphAlgorithmEngine {
  private nodes: GraphNode[] = [];
  private edges: GraphEdge[] = [];

  constructor(nodes: GraphNode[] = [], edges: GraphEdge[] = []) {
    this.setGraph(nodes, edges);
  }

  /**
   * 设置图数据
   */
  setGraph(nodes: GraphNode[], edges: GraphEdge[]): void {
    this.nodes = nodes.map((n) => ({ ...n }));
    this.edges = edges.map((e) => ({ ...e }));
  }

  /**
   * 获取当前图数据
   */
  getGraph(): { nodes: GraphNode[]; edges: GraphEdge[] } {
    return { nodes: this.nodes, edges: this.edges };
  }

  /**
   * 社区发现（Louvain算法）
   */
  async detectCommunities(maxIterations: number = 10): Promise<{
    communities: Community[];
    nodeCommunityMap: Map<string, number>;
    modularity: number;
  }> {
    return detectCommunities(this.nodes, this.edges, maxIterations);
  }

  /**
   * 社区发现（标签传播算法，更快）
   */
  async detectCommunitiesFast(maxIterations: number = 20): Promise<{
    communities: Community[];
    nodeCommunityMap: Map<string, number>;
  }> {
    return labelPropagation(this.nodes, this.edges, maxIterations);
  }

  /**
   * 中心性分析
   */
  async calculateCentrality(): Promise<{ centralities: CentralityResult }> {
    const centralities = calculateAllCentralities(this.nodes, this.edges);
    return { centralities };
  }

  /**
   * 影响力分析
   */
  async calculateInfluence(topN: number = 10): Promise<{
    topInfluential: InfluenceResult[];
  }> {
    const topInfluential = calculateInfluenceRanking(this.nodes, this.edges, topN);
    return { topInfluential };
  }

  /**
   * 最短路径
   */
  async findPath(
    source: string,
    target: string,
    weighted: boolean = true
  ): Promise<PathResult | null> {
    return findShortestPath(source, target, this.nodes, this.edges, weighted);
  }

  /**
   * 推荐相关节点
   */
  async recommend(
    targetNodeId: string,
    topN: number = 10
  ): Promise<Recommendation[]> {
    return recommendNodes(targetNodeId, this.nodes, this.edges, topN);
  }

  /**
   * 发现相似节点
   */
  async findSimilar(
    targetNodeId: string,
    topN: number = 10
  ): Promise<Array<{ nodeId: string; similarity: number; reasons: string[] }>> {
    return findSimilarNodes(targetNodeId, this.nodes, this.edges, topN);
  }

  /**
   * 图统计
   */
  async getGraphStats(): Promise<GraphStats> {
    const adjacency = buildAdjacencyList(this.nodes, this.edges);
    const nodeCount = this.nodes.length;
    const edgeCount = this.edges.length;
    const density = calculateDensity(nodeCount, edgeCount);
    const avgDegree = calculateAverageDegree(
      new Map(this.nodes.map((n) => [n.id, adjacency.get(n.id)?.size || 0])),
      nodeCount
    );
    const degrees = Array.from(adjacency.values()).map((m) => m.size);
    const connectedComponents = findConnectedComponents(this.nodes, adjacency);
    const diameter = calculateDiameter(this.nodes, this.edges);
    const avgPathLength = calculateAveragePathLength(this.nodes, this.edges);
    const clusteringCoefficient = calculateGlobalClusteringCoefficient(this.nodes, adjacency);

    return {
      nodeCount,
      edgeCount,
      density,
      avgDegree,
      maxDegree: degrees.length > 0 ? Math.max(...degrees) : 0,
      minDegree: degrees.length > 0 ? Math.min(...degrees) : 0,
      connectedComponents: connectedComponents.length,
      diameter,
      avgPathLength,
      clusteringCoefficient,
    };
  }

  /**
   * 全量分析（社区+中心性+统计）
   */
  async fullAnalysis(): Promise<{
    communities: Community[];
    centralities: CentralityResult;
    stats: GraphStats;
    topInfluential: InfluenceResult[];
  }> {
    const [communityResult, centralityResult, stats, influenceResult] = await Promise.all([
      this.detectCommunities(),
      this.calculateCentrality(),
      this.getGraphStats(),
      this.calculateInfluence(10),
    ]);

    return {
      communities: communityResult.communities,
      centralities: centralityResult.centralities,
      stats,
      topInfluential: influenceResult.topInfluential,
    };
  }
}

// 单例实例
export const graphAlgorithmEngine = new GraphAlgorithmEngine();

export default GraphAlgorithmEngine;
