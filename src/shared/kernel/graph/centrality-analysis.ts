/**
 * OneOS 中心性分析算法
 * 从graph-algorithm-engine提取
 * 实现度中心性、介数中心性、接近中心性、PageRank
 * 
 * 作者：A07 梅罗文加（算法工程师）
 */

import { GraphNode, GraphEdge, CentralityResult } from './graph-types';
import { buildAdjacencyList, getNeighbors, bfsDistances, calculateDegrees } from './graph-utils';

/**
 * 计算度中心性
 */
export function calculateDegreeCentrality(
  nodes: GraphNode[],
  adjacency: Map<string, Map<string, number>>
): Map<string, number> {
  const degrees = calculateDegrees(nodes, adjacency);
  const maxDegree = nodes.length > 1 ? nodes.length - 1 : 1;

  const centrality = new Map<string, number>();
  for (const [nodeId, degree] of degrees) {
    centrality.set(nodeId, degree / maxDegree);
  }
  return centrality;
}

/**
 * 计算接近中心性
 * 节点到其他所有节点的平均距离的倒数
 */
export function calculateClosenessCentrality(
  nodes: GraphNode[],
  adjacency: Map<string, Map<string, number>>
): Map<string, number> {
  const centrality = new Map<string, number>();
  const n = nodes.length;

  for (const node of nodes) {
    const distances = bfsDistances(node.id, adjacency);
    let totalDistance = 0;
    let reachableNodes = 0;

    for (const [, distance] of distances) {
      if (distance > 0 && distance !== Infinity) {
        totalDistance += distance;
        reachableNodes++;
      }
    }

    if (totalDistance > 0 && reachableNodes > 0) {
      // 标准化的接近中心性
      centrality.set(node.id, (reachableNodes / (n - 1)) * (reachableNodes / totalDistance));
    } else {
      centrality.set(node.id, 0);
    }
  }

  return centrality;
}

/**
 * 计算介数中心性
 * 节点作为最短路径中间点的次数
 * 使用Brandes算法
 */
export function calculateBetweennessCentrality(
  nodes: GraphNode[],
  adjacency: Map<string, Map<string, number>>
): Map<string, number> {
  const betweenness = new Map<string, number>();
  nodes.forEach((node) => betweenness.set(node.id, 0));

  const n = nodes.length;

  // Brandes算法
  for (const source of nodes) {
    // BFS从source出发
    const stack: string[] = [];
    const predecessors = new Map<string, string[]>();
    const sigma = new Map<string, number>(); // 最短路径数
    const distance = new Map<string, number>();
    const delta = new Map<string, number>();

    nodes.forEach((node) => {
      predecessors.set(node.id, []);
      sigma.set(node.id, 0);
      distance.set(node.id, -1);
      delta.set(node.id, 0);
    });

    sigma.set(source.id, 1);
    distance.set(source.id, 0);

    const queue: string[] = [source.id];

    while (queue.length > 0) {
      const v = queue.shift()!;
      stack.push(v);
      const neighbors = getNeighbors(v, adjacency);

      for (const w of neighbors) {
        // 第一次发现w
        if (distance.get(w) === -1) {
          distance.set(w, distance.get(v)! + 1);
          queue.push(w);
        }
        // 最短路径经过v
        if (distance.get(w) === distance.get(v)! + 1) {
          sigma.set(w, sigma.get(w)! + sigma.get(v)!);
          predecessors.get(w)!.push(v);
        }
      }
    }

    // 反向累积
    while (stack.length > 0) {
      const w = stack.pop()!;
      for (const v of predecessors.get(w)!) {
        delta.set(v, delta.get(v)! + (sigma.get(v)! / sigma.get(w)!) * (1 + delta.get(w)!));
      }
      if (w !== source.id) {
        betweenness.set(w, betweenness.get(w)! + delta.get(w)!);
      }
    }
  }

  // 标准化（无向图除以2）
  const scale = n > 2 ? 1 / ((n - 1) * (n - 2)) : 1;
  for (const [nodeId, value] of betweenness) {
    betweenness.set(nodeId, value * scale * 2); // 无向图
  }

  return betweenness;
}

/**
 * 计算PageRank
 * 简化版PageRank算法
 */
export function calculatePageRank(
  nodes: GraphNode[],
  adjacency: Map<string, Map<string, number>>,
  dampingFactor: number = 0.85,
  maxIterations: number = 100,
  tolerance: number = 1e-6
): Map<string, number> {
  const n = nodes.length;
  if (n === 0) return new Map();

  // 初始化PageRank值
  let pageRank = new Map<string, number>();
  nodes.forEach((node) => pageRank.set(node.id, 1 / n));

  const outDegree = new Map<string, number>();
  for (const node of nodes) {
    outDegree.set(node.id, getNeighbors(node.id, adjacency).length);
  }

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    const newPageRank = new Map<string, number>();
    let maxDiff = 0;

    for (const node of nodes) {
      // 计算来自其他节点的贡献
      let rankSum = 0;
      for (const otherNode of nodes) {
        if (otherNode.id === node.id) continue;
        const neighbors = getNeighbors(otherNode.id, adjacency);
        if (neighbors.includes(node.id)) {
          const degree = outDegree.get(otherNode.id) || 1;
          rankSum += pageRank.get(otherNode.id)! / degree;
        }
      }

      // PageRank公式
      const newRank = (1 - dampingFactor) / n + dampingFactor * rankSum;
      newPageRank.set(node.id, newRank);

      const diff = Math.abs(newRank - pageRank.get(node.id)!);
      maxDiff = Math.max(maxDiff, diff);
    }

    pageRank = newPageRank;

    if (maxDiff < tolerance) break;
  }

  // 归一化
  let sum = 0;
  for (const value of pageRank.values()) sum += value;
  if (sum > 0) {
    for (const [nodeId, value] of pageRank) {
      pageRank.set(nodeId, value / sum);
    }
  }

  return pageRank;
}

/**
 * 综合计算所有中心性指标
 */
export function calculateAllCentralities(
  nodes: GraphNode[],
  edges: GraphEdge[]
): CentralityResult {
  const adjacency = buildAdjacencyList(nodes, edges);

  const degreeCentrality = calculateDegreeCentrality(nodes, adjacency);
  const closenessCentrality = calculateClosenessCentrality(nodes, adjacency);
  const betweennessCentrality = calculateBetweennessCentrality(nodes, adjacency);
  const pageRank = calculatePageRank(nodes, adjacency);

  const result: CentralityResult = {};
  for (const node of nodes) {
    result[node.id] = {
      degree: degreeCentrality.get(node.id) || 0,
      betweenness: betweennessCentrality.get(node.id) || 0,
      closeness: closenessCentrality.get(node.id) || 0,
      pagerank: pageRank.get(node.id) || 0,
    };
  }

  return result;
}

/**
 * 计算影响力排名
 * 综合PageRank、度中心性、介数中心性
 */
export function calculateInfluenceRanking(
  nodes: GraphNode[],
  edges: GraphEdge[],
  topN: number = 10
): Array<{ nodeId: string; influence: number; type: string }> {
  const centralities = calculateAllCentralities(nodes, edges);

  const influences = nodes.map((node) => {
    const c = centralities[node.id];
    if (!c) return { nodeId: node.id, influence: 0, type: 'composite' as const };

    // 综合影响力：PageRank权重最高
    const influence = c.pagerank * 0.5 + c.degree * 0.3 + c.betweenness * 0.2;
    return { nodeId: node.id, influence, type: 'composite' as const };
  });

  // 排序并取前N个
  influences.sort((a, b) => b.influence - a.influence);
  return influences.slice(0, topN);
}
