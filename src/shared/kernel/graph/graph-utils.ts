/**
 * OneOS 图算法工具函数
 * 从graph-algorithm-engine提取
 * 
 * 作者：A07 梅罗文加（算法工程师）
 */

import { GraphNode, GraphEdge } from './graph-types';

/**
 * 构建邻接表
 */
export function buildAdjacencyList(
  nodes: GraphNode[],
  edges: GraphEdge[]
): Map<string, Map<string, number>> {
  const adjacency = new Map<string, Map<string, number>>();

  // 初始化所有节点
  for (const node of nodes) {
    adjacency.set(node.id, new Map());
  }

  // 添加边
  for (const edge of edges) {
    if (!adjacency.has(edge.source)) adjacency.set(edge.source, new Map());
    if (!adjacency.has(edge.target)) adjacency.set(edge.target, new Map());

    adjacency.get(edge.source)!.set(edge.target, edge.weight);
    adjacency.get(edge.target)!.set(edge.source, edge.weight); // 无向图
  }

  return adjacency;
}

/**
 * 计算节点度
 */
export function calculateDegrees(
  nodes: GraphNode[],
  adjacency: Map<string, Map<string, number>>
): Map<string, number> {
  const degrees = new Map<string, number>();
  for (const node of nodes) {
    degrees.set(node.id, adjacency.get(node.id)?.size || 0);
  }
  return degrees;
}

/**
 * 获取节点的邻居
 */
export function getNeighbors(
  nodeId: string,
  adjacency: Map<string, Map<string, number>>
): string[] {
  return Array.from(adjacency.get(nodeId)?.keys() || []);
}

/**
 * 获取边的权重
 */
export function getEdgeWeight(
  source: string,
  target: string,
  adjacency: Map<string, Map<string, number>>
): number {
  return adjacency.get(source)?.get(target) || 0;
}

/**
 * 计算图密度
 */
export function calculateDensity(nodeCount: number, edgeCount: number): number {
  if (nodeCount <= 1) return 0;
  const maxEdges = (nodeCount * (nodeCount - 1)) / 2;
  return edgeCount / maxEdges;
}

/**
 * 计算平均度
 */
export function calculateAverageDegree(
  degrees: Map<string, number>,
  nodeCount: number
): number {
  if (nodeCount === 0) return 0;
  let sum = 0;
  for (const degree of degrees.values()) {
    sum += degree;
  }
  return sum / nodeCount;
}

/**
 * BFS遍历，返回从起点到所有节点的距离
 */
export function bfsDistances(
  start: string,
  adjacency: Map<string, Map<string, number>>
): Map<string, number> {
  const distances = new Map<string, number>();
  const visited = new Set<string>();
  const queue: string[] = [start];

  distances.set(start, 0);
  visited.add(start);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentDist = distances.get(current)!;
    const neighbors = getNeighbors(current, adjacency);

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        distances.set(neighbor, currentDist + 1);
        queue.push(neighbor);
      }
    }
  }

  return distances;
}

/**
 * Dijkstra最短路径算法
 */
export function dijkstra(
  start: string,
  end: string,
  adjacency: Map<string, Map<string, number>>
): { distance: number; path: string[] } {
  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const visited = new Set<string>();
  const unvisited = new Set<string>();

  // 初始化
  for (const nodeId of adjacency.keys()) {
    distances.set(nodeId, nodeId === start ? 0 : Infinity);
    previous.set(nodeId, null);
    unvisited.add(nodeId);
  }

  while (unvisited.size > 0) {
    // 找到未访问节点中距离最小的
    let minDist = Infinity;
    let minNode: string | null = null;
    for (const nodeId of unvisited) {
      const dist = distances.get(nodeId)!;
      if (dist < minDist) {
        minDist = dist;
        minNode = nodeId;
      }
    }

    if (minNode === null || minDist === Infinity) break;
    if (minNode === end) break;

    unvisited.delete(minNode);
    visited.add(minNode);

    // 更新邻居距离
    const neighbors = getNeighbors(minNode, adjacency);
    for (const neighbor of neighbors) {
      if (visited.has(neighbor)) continue;
      const weight = getEdgeWeight(minNode, neighbor, adjacency);
      const alt = distances.get(minNode)! + weight;
      if (alt < distances.get(neighbor)!) {
        distances.set(neighbor, alt);
        previous.set(neighbor, minNode);
      }
    }
  }

  // 重建路径
  const path: string[] = [];
  let current: string | null = end;
  while (current !== null) {
    path.unshift(current);
    current = previous.get(current) || null;
  }

  return {
    distance: distances.get(end) || Infinity,
    path: path[0] === start ? path : [],
  };
}

/**
 * 计算连通分量
 */
export function findConnectedComponents(
  nodes: GraphNode[],
  adjacency: Map<string, Map<string, number>>
): string[][] {
  const visited = new Set<string>();
  const components: string[][] = [];

  for (const node of nodes) {
    if (visited.has(node.id)) continue;

    const component: string[] = [];
    const queue: string[] = [node.id];
    visited.add(node.id);

    while (queue.length > 0) {
      const current = queue.shift()!;
      component.push(current);
      const neighbors = getNeighbors(current, adjacency);
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }

    components.push(component);
  }

  return components;
}

/**
 * 计算局部聚类系数
 */
export function calculateClusteringCoefficient(
  nodeId: string,
  adjacency: Map<string, Map<string, number>>
): number {
  const neighbors = getNeighbors(nodeId, adjacency);
  const k = neighbors.length;
  if (k < 2) return 0;

  // 计算邻居之间的边数
  let edgesBetweenNeighbors = 0;
  for (let i = 0; i < neighbors.length; i++) {
    for (let j = i + 1; j < neighbors.length; j++) {
      if (adjacency.get(neighbors[i])?.has(neighbors[j])) {
        edgesBetweenNeighbors++;
      }
    }
  }

  const maxEdges = (k * (k - 1)) / 2;
  return edgesBetweenNeighbors / maxEdges;
}

/**
 * 计算全局聚类系数
 */
export function calculateGlobalClusteringCoefficient(
  nodes: GraphNode[],
  adjacency: Map<string, Map<string, number>>
): number {
  if (nodes.length === 0) return 0;
  let sum = 0;
  for (const node of nodes) {
    sum += calculateClusteringCoefficient(node.id, adjacency);
  }
  return sum / nodes.length;
}
