/**
 * OneOS 社区发现算法
 * 从graph-algorithm-engine提取
 * 实现Louvain算法简化版和标签传播算法
 * 
 * 作者：A07 梅罗文加（算法工程师）
 */

import { GraphNode, GraphEdge, Community, getCommunityColor, getCommunityName } from './graph-types';
import { buildAdjacencyList, getNeighbors, calculateDegrees } from './graph-utils';

/**
 * Louvain社区发现算法（简化版）
 * 基于模块度优化的贪心算法
 */
export function detectCommunities(
  nodes: GraphNode[],
  edges: GraphEdge[],
  maxIterations: number = 10
): { communities: Community[]; nodeCommunityMap: Map<string, number>; modularity: number } {
  if (nodes.length === 0) {
    return { communities: [], nodeCommunityMap: new Map(), modularity: 0 };
  }

  const adjacency = buildAdjacencyList(nodes, edges);
  const degrees = calculateDegrees(nodes, adjacency);
  const totalWeight = edges.reduce((sum, e) => sum + e.weight, 0) * 2; // 无向图

  // 初始化：每个节点一个社区
  const nodeCommunity = new Map<string, number>();
  nodes.forEach((node, index) => nodeCommunity.set(node.id, index));

  let modularity = calculateModularity(nodes, edges, nodeCommunity, totalWeight);

  // 迭代优化
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    let improved = false;

    for (const node of nodes) {
      const currentCommunity = nodeCommunity.get(node.id)!;
      const neighbors = getNeighbors(node.id, adjacency);

      // 计算邻居社区的权重
      const communityWeights = new Map<number, number>();
      for (const neighbor of neighbors) {
        const neighborCommunity = nodeCommunity.get(neighbor);
        if (neighborCommunity !== undefined) {
          communityWeights.set(
            neighborCommunity,
            (communityWeights.get(neighborCommunity) || 0) + 1
          );
        }
      }

      // 找到增益最大的社区
      let bestCommunity = currentCommunity;
      let bestGain = 0;

      for (const [community, weight] of communityWeights) {
        if (community === currentCommunity) continue;
        const gain = calculateModularityGain(
          node.id,
          currentCommunity,
          community,
          nodeCommunity,
          degrees,
          totalWeight,
          adjacency
        );
        if (gain > bestGain) {
          bestGain = gain;
          bestCommunity = community;
        }
      }

      // 移动节点
      if (bestCommunity !== currentCommunity) {
        nodeCommunity.set(node.id, bestCommunity);
        improved = true;
      }
    }

    // 重新计算模块度
    const newModularity = calculateModularity(nodes, edges, nodeCommunity, totalWeight);
    if (newModularity > modularity) {
      modularity = newModularity;
    }

    if (!improved) break;
  }

  // 压缩社区ID（使其连续）
  const communityMap = new Map<number, number>();
  let newId = 0;
  for (const communityId of nodeCommunity.values()) {
    if (!communityMap.has(communityId)) {
      communityMap.set(communityId, newId++);
    }
  }

  const compressedCommunity = new Map<string, number>();
  for (const [nodeId, communityId] of nodeCommunity) {
    compressedCommunity.set(nodeId, communityMap.get(communityId)!);
  }

  // 构建社区对象
  const communities = buildCommunities(nodes, edges, compressedCommunity);

  return {
    communities,
    nodeCommunityMap: compressedCommunity,
    modularity,
  };
}

/**
 * 计算模块度
 */
function calculateModularity(
  nodes: GraphNode[],
  edges: GraphEdge[],
  nodeCommunity: Map<string, number>,
  totalWeight: number
): number {
  if (totalWeight === 0) return 0;

  let modularity = 0;
  for (const edge of edges) {
    const sourceCommunity = nodeCommunity.get(edge.source);
    const targetCommunity = nodeCommunity.get(edge.target);
    if (sourceCommunity === targetCommunity) {
      modularity += edge.weight;
    }
  }

  // 简化的模块度计算
  return (2 * modularity) / totalWeight;
}

/**
 * 计算模块度增益
 */
function calculateModularityGain(
  nodeId: string,
  currentCommunity: number,
  targetCommunity: number,
  nodeCommunity: Map<string, number>,
  degrees: Map<string, number>,
  totalWeight: number,
  adjacency: Map<string, Map<string, number>>
): number {
  // 简化的增益计算：目标社区中邻居的权重
  let gain = 0;
  const neighbors = getNeighbors(nodeId, adjacency);
  for (const neighbor of neighbors) {
    if (nodeCommunity.get(neighbor) === targetCommunity) {
      gain += 1;
    }
  }
  return gain;
}

/**
 * 构建社区对象
 */
function buildCommunities(
  nodes: GraphNode[],
  edges: GraphEdge[],
  nodeCommunity: Map<string, number>
): Community[] {
  const communityMap = new Map<number, string[]>();

  for (const [nodeId, communityId] of nodeCommunity) {
    if (!communityMap.has(communityId)) {
      communityMap.set(communityId, []);
    }
    communityMap.get(communityId)!.push(nodeId);
  }

  const communities: Community[] = [];
  for (const [communityId, nodeIds] of communityMap) {
    // 计算内部边和外部边
    let internalEdges = 0;
    let externalEdges = 0;

    for (const edge of edges) {
      const sourceInCommunity = nodeIds.includes(edge.source);
      const targetInCommunity = nodeIds.includes(edge.target);
      if (sourceInCommunity && targetInCommunity) {
        internalEdges++;
      } else if (sourceInCommunity || targetInCommunity) {
        externalEdges++;
      }
    }

    communities.push({
      id: communityId,
      name: getCommunityName(communityId),
      color: getCommunityColor(communityId),
      nodeIds,
      size: nodeIds.length,
      internalEdges,
      externalEdges,
      modularity: 0, // 可以进一步计算
    });
  }

  // 按大小排序
  communities.sort((a, b) => b.size - a.size);
  return communities;
}

/**
 * 标签传播社区发现算法
 * 更简单、更快的社区发现算法
 */
export function labelPropagation(
  nodes: GraphNode[],
  edges: GraphEdge[],
  maxIterations: number = 20
): { communities: Community[]; nodeCommunityMap: Map<string, number> } {
  if (nodes.length === 0) {
    return { communities: [], nodeCommunityMap: new Map() };
  }

  const adjacency = buildAdjacencyList(nodes, edges);

  // 初始化：每个节点一个标签
  const labels = new Map<string, number>();
  nodes.forEach((node, index) => labels.set(node.id, index));

  // 迭代传播
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    let changed = false;

    // 随机打乱节点顺序
    const shuffledNodes = [...nodes].sort(() => Math.random() - 0.5);

    for (const node of shuffledNodes) {
      const neighbors = getNeighbors(node.id, adjacency);
      if (neighbors.length === 0) continue;

      // 统计邻居标签频率
      const labelCounts = new Map<number, number>();
      for (const neighbor of neighbors) {
        const label = labels.get(neighbor);
        if (label !== undefined) {
          labelCounts.set(label, (labelCounts.get(label) || 0) + 1);
        }
      }

      // 找到频率最高的标签
      let maxCount = 0;
      let bestLabel = labels.get(node.id)!;
      for (const [label, count] of labelCounts) {
        if (count > maxCount) {
          maxCount = count;
          bestLabel = label;
        }
      }

      if (bestLabel !== labels.get(node.id)) {
        labels.set(node.id, bestLabel);
        changed = true;
      }
    }

    if (!changed) break;
  }

  // 压缩标签ID
  const labelMap = new Map<number, number>();
  let newId = 0;
  for (const label of labels.values()) {
    if (!labelMap.has(label)) {
      labelMap.set(label, newId++);
    }
  }

  const compressedLabels = new Map<string, number>();
  for (const [nodeId, label] of labels) {
    compressedLabels.set(nodeId, labelMap.get(label)!);
  }

  // 构建社区对象
  const communities = buildCommunities(nodes, edges, compressedLabels);

  return {
    communities,
    nodeCommunityMap: compressedLabels,
  };
}
