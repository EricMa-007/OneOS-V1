/**
 * 知识图谱Repository IndexedDB实现
 */

import { GraphNode, GraphEdge, GraphData, createGraphNode, createGraphEdge } from '../../domain/models/graph';
import { IGraphRepository } from '../../domain/repositories/graph-repository';

export class IndexedDBGraphRepository implements IGraphRepository {
  private db: IDBDatabase | null = null;
  private nodeStore = 'graph_nodes';
  private edgeStore = 'graph_edges';

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('OneOS', 2);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.nodeStore)) {
          const store = db.createObjectStore(this.nodeStore, { keyPath: 'id' });
          store.createIndex('entityId', 'entityId', { unique: false });
          store.createIndex('type', 'type', { unique: false });
        }
        if (!db.objectStoreNames.contains(this.edgeStore)) {
          const store = db.createObjectStore(this.edgeStore, { keyPath: 'id' });
          store.createIndex('source', 'source', { unique: false });
          store.createIndex('target', 'target', { unique: false });
        }
      };
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  private async transaction<R>(storeName: string, mode: IDBTransactionMode, callback: (store: IDBObjectStore) => IDBRequest<R> | Promise<R>): Promise<R> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);
      const result = callback(store);
      if (result instanceof IDBRequest) {
        result.onsuccess = () => resolve(result.result);
        result.onerror = () => reject(result.error);
      } else {
        result.then(resolve).catch(reject);
      }
      tx.onerror = () => reject(tx.error);
    });
  }

  // 节点
  async getNodeById(id: string): Promise<GraphNode | null> {
    return this.transaction<GraphNode>(this.nodeStore, 'readonly', (store) => store.get(id)) as Promise<GraphNode | null>;
  }

  async getNodeByEntityId(entityId: string): Promise<GraphNode | null> {
    const all = await this.getAllNodes();
    return all.find((n) => n.entityId === entityId) || null;
  }

  async getAllNodes(): Promise<GraphNode[]> {
    return this.transaction<GraphNode[]>(this.nodeStore, 'readonly', (store) => store.getAll());
  }

  async createNode(input: Omit<GraphNode, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'deviceId' | 'syncState' | 'deleted'>): Promise<GraphNode> {
    const node = createGraphNode(input.entityId, input.type, input.label, input.x, input.y);
    Object.assign(node, input);
    await this.transaction(this.nodeStore, 'readwrite', (store) => store.add(node));
    return node;
  }

  async updateNode(id: string, updates: Partial<GraphNode>): Promise<GraphNode> {
    const existing = await this.getNodeById(id);
    if (!existing) throw new Error(`节点不存在: ${id}`);
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString(), version: existing.version + 1 };
    await this.transaction(this.nodeStore, 'readwrite', (store) => store.put(updated));
    return updated;
  }

  async deleteNode(id: string): Promise<void> {
    await this.transaction(this.nodeStore, 'readwrite', (store) => store.delete(id));
    // 同时删除关联的边
    const edges = await this.getEdgesByNode(id);
    for (const edge of edges) {
      await this.deleteEdge(edge.id);
    }
  }

  async hardDeleteNode(id: string): Promise<void> {
    return this.deleteNode(id);
  }

  // 边
  async getEdgeById(id: string): Promise<GraphEdge | null> {
    return this.transaction<GraphEdge>(this.edgeStore, 'readonly', (store) => store.get(id)) as Promise<GraphEdge | null>;
  }

  async getEdgesByNode(nodeId: string): Promise<GraphEdge[]> {
    const all = await this.getAllEdges();
    return all.filter((e) => e.source === nodeId || e.target === nodeId);
  }

  async getAllEdges(): Promise<GraphEdge[]> {
    return this.transaction<GraphEdge[]>(this.edgeStore, 'readonly', (store) => store.getAll());
  }

  async createEdge(input: Omit<GraphEdge, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'deviceId' | 'syncState' | 'deleted'>): Promise<GraphEdge> {
    const edge = createGraphEdge(input.source, input.target, input.type, input.weight);
    Object.assign(edge, input);
    await this.transaction(this.edgeStore, 'readwrite', (store) => store.add(edge));
    return edge;
  }

  async updateEdge(id: string, updates: Partial<GraphEdge>): Promise<GraphEdge> {
    const existing = await this.getEdgeById(id);
    if (!existing) throw new Error(`边不存在: ${id}`);
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString(), version: existing.version + 1 };
    await this.transaction(this.edgeStore, 'readwrite', (store) => store.put(updated));
    return updated;
  }

  async deleteEdge(id: string): Promise<void> {
    await this.transaction(this.edgeStore, 'readwrite', (store) => store.delete(id));
  }

  async hardDeleteEdge(id: string): Promise<void> {
    return this.deleteEdge(id);
  }

  // 整体
  async getGraphData(): Promise<GraphData> {
    const [nodes, edges] = await Promise.all([this.getAllNodes(), this.getAllEdges()]);
    return { nodes, edges };
  }

  async saveGraphData(data: GraphData): Promise<void> {
    // 清空现有数据
    await this.clear();
    // 批量写入
    for (const node of data.nodes) {
      await this.transaction(this.nodeStore, 'readwrite', (store) => store.put(node));
    }
    for (const edge of data.edges) {
      await this.transaction(this.edgeStore, 'readwrite', (store) => store.put(edge));
    }
  }

  async rebuildFromNotes(): Promise<GraphData> {
    // 从笔记数据重建图谱（实际实现中需要读取笔记并解析双向链接）
    return { nodes: [], edges: [] };
  }

  async clear(): Promise<void> {
    await this.transaction(this.nodeStore, 'readwrite', (store) => store.clear());
    await this.transaction(this.edgeStore, 'readwrite', (store) => store.clear());
  }
}
