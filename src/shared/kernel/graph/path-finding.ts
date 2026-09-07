/**
 * OneOS 路径查找与推荐算法
 * 从graph-algorithm-engine提取
 * 实现最短路径、相关节点推荐、相似节点发现
 * 
 * 作者：A07 梅罗文加（算法工程师）
 */

import { GraphNode, GraphEdge, PathResult, Recommendation } from './graph-types';
import { buildAdjacencyList, getNeighbors, dijkstra, bfsDistances } from './graph-utils';

/**
 * 查找最短路径
 * 支持BFS（无权图）和Dijkstra（有权图）
 */
export function findShortestPath(
  source: string,
  target: string,
  nodes: GraphNode[],
  edges: GraphEdge[],
  weighted: boolean = true
): PathResult | null {
  const adjacency = buildAdjacencyList(nodes, edges);

  if (!adjacency.has(source) || !adjacency.has(target)) {
    return null;
  }

  if (weighted) {
    // Dijkstra算法
    const result = dijkstra(source, target, adjacency);
    if (result.path.length === 0 || result.distance === Infinity) {
      return null;
    }

    // 构建边列表
    const pathEdges: GraphEdge[] = [];
    for (let i = 0; i < result.path.length - 1; i++) {
      const edge = edges.find(
        (e) =>
          (e.source === result.path[i] && e.target === result.path[i + 1]) ||
          (e.source === result.path[i + 1] && e.target === result.path[i])
      );
      if (edge) pathEdges.push(edge);
    }

    return {
      path: result.path,
      distance: result.distance,
      edges: pathEdges,
    };
  } else {
    // BFS算法（无权图）
    const distances = bfsDistances(source, adjacency);
    if (!distances.has(target) || distances.get(target) === Infinity) {
      return null;
    }

    // 重建路径
    const path: string[] = [];
    let current = target;
    const visited = new Set<string>([target]);

    while (current !== source) {
      path.unshift(current);
      const neighbors = getNeighbors(current, adjacency);
      let found = false;
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor) && distances.has(neighbor) && distances.get(neighbor) === distances.get(current)! - 1) {
          current = neighbor;
          visited.add(neighbor);
          found = true;
          break;
        }
      }
      if (!found) break;
    }
    path.unshift(source);

    // 构建边列表
    const pathEdges: GraphEdge[] = [];
    for (let i = 0; i < path.length - 1; i++) {
      const edge = edges.find(
        (e) =>
          (e.source === path[i] && e.target === path[i + 1]) ||
          (e.source === path[i + 1] && e.target === path[i])
      );
      if (edge) pathEdges.push(edge);
    }

    return {
      path,
      distance: distances.get(target)!,
      edges: pathEdges,
    };
  }
}

/**
 * 推荐相关节点
 * 基于共同邻居和路径距离
 */
export function recommendNodes(
  targetNodeId: string,
  nodes: GraphNode[],
  edges: GraphEdge[],
  topN: number = 10
): Recommendation[] {
  const adjacency = buildAdjacencyList(nodes, edges);

  if (!adjacency.has(targetNodeId)) {
    return [];
  }

  const targetNeighbors = new Set(getNeighbors(targetNodeId, adjacency));
  const distances = bfsDistances(targetNodeId, adjacency);

  const recommendations: Recommendation[] = [];

  for (const node of nodes) {
    // 跳过目标节点和已直接连接的节点
    if (node.id === targetNodeId || targetNeighbors.has(node.id)) continue;

    const nodeNeighbors = new Set(getNeighbors(node.id, adjacency));

    // 计算共同邻居
    const commonNeighbors: string[] = [];
    for (const neighbor of targetNeighbors) {
      if (nodeNeighbors.has(neighbor)) {
        commonNeighbors.push(neighbor);
      }
    }

    // 计算相似度（Jaccard系数）
    const unionSize = targetNeighbors.size + nodeNeighbors.size - commonNeighbors.length;
    const jaccardSimilarity = unionSize > 0 ? commonNeighbors.length / unionSize : 0;

    // 距离因子（距离越近分数越高）
    const distance = distances.get(node.id) || Infinity;
    const distanceFactor = distance > 0 && distance !== Infinity ? 1 / distance : 0;

    // 综合评分
    const score = jaccardSimilarity * 0.6 + distanceFactor * 0.4;

    if (score > 0) {
      // 生成推荐理由
      let reason = '';
      if (commonNeighbors.length > 0) {
        reason = `有${commonNeighbors.length}个共同邻居`;
      } else if (distance < Infinity) {
        reason = `距离${distance}跳`;
      }

      recommendations.push({
        nodeId: node.id,
        score,
        reason,
        commonNeighbors,
      });
    }
  }

  // 排序并取前N个
  recommendations.sort((a, b) => b.score - a.score);
  return recommendations.slice(0, topN);
}

/**
 * 发现相似节点
 * 基于节点属性和结构的相似度
 */
export function findSimilarNodes(
  targetNodeId: string,
  nodes: GraphNode[],
  edges: GraphEdge[],
  topN: number = 10
): Array<{ nodeId: string; similarity: number; reasons: string[] }> {
  const adjacency = buildAdjacencyList(nodes, edges);
  const targetNode = nodes.find((n) => n.id === targetNodeId);

  if (!targetNode || !adjacency.has(targetNodeId)) {
    return [];
  }

  const targetNeighbors = new Set(getNeighbors(targetNodeId, adjacency));
  const targetDegree = targetNeighbors.size;

  const similarities: Array<{ nodeId: string; similarity: number; reasons: string[] }> = [];

  for (const node of nodes) {
    if (node.id === targetNodeId) continue;

    const nodeNeighbors = new Set(getNeighbors(node.id, adjacency));
    const reasons: string[] = [];
    let similarity = 0;

    // 1. 结构相似度（共同邻居比例）
    const commonNeighbors: string[] = [];
    for (const neighbor of targetNeighbors) {
      if (nodeNeighbors.has(neighbor)) {
        commonNeighbors.push(neighbor);
      }
    }
    const unionSize = targetNeighbors.size + nodeNeighbors.size - commonNeighbors.length;
    const structuralSimilarity = unionSize > 0 ? commonNeighbors.length / unionSize : 0;
    similarity += structuralSimilarity * 0.4;
    if (commonNeighbors.length > 0) {
      reasons.push(`结构相似（${commonNeighbors.length}个共同邻居）`);
    }

    // 2. 度相似度
    const nodeDegree = nodeNeighbors.size;
    const degreeSimilarity = 1 - Math.abs(targetDegree - nodeDegree) / Math.max(targetDegree, nodeDegree, 1);
    similarity += degreeSimilarity * 0.2;
    if (Math.abs(targetDegree - nodeDegree) <= 2) {
      reasons.push(`度相近（${targetDegree} vs ${nodeDegree}）`);
    }

    // 3. 社区相似度（如果有社区信息）
    if (targetNode.community !== undefined && node.community !== undefined) {
      if (targetNode.community === node.community) {
        similarity += 0.3;
        reasons.push('同一社区');
      }
    }

    // 4. 中心性相似度
    if (targetNode.centrality && node.centrality) {
      const prDiff = Math.abs(targetNode.centrality.pagerank - node.centrality.pagerank);
      const centralitySimilarity = 1 - Math.min(prDiff * 100, 1);
      similarity += centralitySimilarity * 0.1;
    }

    if (similarity > 0.1) {
      similarities.push({
        nodeId: node.id,
        similarity,
        reasons,
      });
    }
  }

  // 排序并取前N个
  similarities.sort((a, b) => b.similarity - a.similarity);
  return similarities.slice(0, topN);
}

/**
 * 计算图直径（最长最短路径）
 */
export function calculateDiameter(
  nodes: GraphNode[],
  edges: GraphEdge[]
): number {
  const adjacency = buildAdjacencyList(nodes, edges);
  let diameter = 0;

  for (const source of nodes) {
    const distances = bfsDistances(source.id, adjacency);
    for (const [, distance] of distances) {
      if (distance !== Infinity && distance > diameter) {
        diameter = distance;
      }
    }
  }

  return diameter;
}

/**
 * 计算平均路径长度
 */
export function calculateAveragePathLength(
  nodes: GraphNode[],
  edges: GraphEdge[]
): number {
  const adjacency = buildAdjacencyList(nodes, edges);
  let totalDistance = 0;
  let pathCount = 0;

  for (const source of nodes) {
    const distances = bfsDistances(source.id, adjacency);
    for (const [, distance] of distances) {
      if (distance > 0 && distance !== Infinity) {
        totalDistance += distance;
        pathCount++;
      }
    }
  }

  return pathCount > 0 ? totalDistance / pathCount : 0;
}
