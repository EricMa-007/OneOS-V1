/**
 * OneOS IndexedDB 通用基类
 * 所有Repository的IndexedDB实现都继承此类
 * 
 * 作者：A08 多泽（数据架构师）
 */

import { BaseEntity, touchEntity, softDeleteEntity } from '../../domain/models/base-entity';

const DB_NAME = 'OneOS';
const DB_VERSION = 2;

export abstract class IndexedDBRepository<T extends BaseEntity> {
  protected db: IDBDatabase | null = null;
  protected abstract storeName: string;
  protected abstract createEntity(input: Partial<T> & Record<string, unknown>): T;

  /**
   * 获取或创建数据库连接
   */
  protected async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.onCreateStore(db);
      };
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 子类重写此方法创建ObjectStore和索引
   */
  protected onCreateStore(db: IDBDatabase): void {
    if (!db.objectStoreNames.contains(this.storeName)) {
      const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
      store.createIndex('createdAt', 'createdAt', { unique: false });
      store.createIndex('updatedAt', 'updatedAt', { unique: false });
      store.createIndex('deleted', 'deleted', { unique: false });
    }
  }

  /**
   * 执行事务
   */
  protected async transaction<R>(
    mode: IDBTransactionMode,
    callback: (store: IDBObjectStore) => IDBRequest<R> | Promise<R>
  ): Promise<R> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, mode);
      const store = tx.objectStore(this.storeName);
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

  // ============================================
  // 通用CRUD方法
  // ============================================

  async getById(id: string): Promise<T | null> {
    return this.transaction<T>('readonly', (store) => store.get(id)) as Promise<T | null>;
  }

  async getByIds(ids: string[]): Promise<T[]> {
    const all = await this.getAll();
    return all.filter((item) => ids.includes(item.id));
  }

  async getAll(includeDeleted = false): Promise<T[]> {
    const all = await this.transaction<T[]>('readonly', (store) => store.getAll());
    return includeDeleted ? all : all.filter((item) => !item.deleted);
  }

  async create(input: Partial<T> & Record<string, unknown>): Promise<T> {
    const entity = this.createEntity(input);
    await this.transaction('readwrite', (store) => store.add(entity));
    return entity;
  }

  async update(id: string, updates: Partial<T>): Promise<T> {
    const existing = await this.getById(id);
    if (!existing) throw new Error(`实体不存在: ${id}`);
    const updated: T = {
      ...existing,
      ...updates,
      ...touchEntity(existing),
    };
    await this.transaction('readwrite', (store) => store.put(updated));
    return updated;
  }

  async delete(id: string): Promise<void> {
    const existing = await this.getById(id);
    if (!existing) return;
    const deleted = softDeleteEntity(existing);
    await this.transaction('readwrite', (store) => store.put(deleted));
  }

  async hardDelete(id: string): Promise<void> {
    await this.transaction('readwrite', (store) => store.delete(id));
  }

  async restore(id: string): Promise<T> {
    const existing = await this.getById(id);
    if (!existing) throw new Error(`实体不存在: ${id}`);
    const restored: T = {
      ...existing,
      deleted: false,
      deletedAt: undefined,
      ...touchEntity(existing),
    };
    await this.transaction('readwrite', (store) => store.put(restored));
    return restored;
  }

  async count(includeDeleted = false): Promise<number> {
    const all = await this.getAll(includeDeleted);
    return all.length;
  }

  async clear(): Promise<void> {
    await this.transaction('readwrite', (store) => store.clear());
  }

  async bulkCreate(inputs: Array<Partial<T> & Record<string, unknown>>): Promise<T[]> {
    const created: T[] = [];
    for (const input of inputs) {
      created.push(await this.create(input));
    }
    return created;
  }

  async bulkUpdate(updates: Array<{ id: string; input: Partial<T> }>): Promise<T[]> {
    const updated: T[] = [];
    for (const { id, input } of updates) {
      updated.push(await this.update(id, input));
    }
    return updated;
  }

  /**
   * 通用查询方法（内存过滤，适用于中小数据量）
   */
  protected queryItems(
    items: T[],
    filters: Record<string, unknown>,
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'desc',
    limit?: number,
    offset?: number
  ): T[] {
    let result = [...items];

    // 过滤
    for (const [key, value] of Object.entries(filters)) {
      if (value === undefined || value === null) continue;
      if (key === 'keyword') {
        const kw = String(value).toLowerCase();
        result = result.filter((item: T) =>
          item.title?.toLowerCase().includes(kw) ||
          item.content?.toLowerCase().includes(kw) ||
          item.name?.toLowerCase().includes(kw)
        );
      } else if (key === 'tagId') {
        result = result.filter((item: T) => item.tagIds?.includes(value));
      } else {
        result = result.filter((item: T) => item[key] === value);
      }
    }

    // 排序
    if (sortBy) {
      result.sort((a: T, b: T) => {
        const av = a[sortBy];
        const bv = b[sortBy];
        if (av < bv) return sortOrder === 'asc' ? -1 : 1;
        if (av > bv) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // 分页
    if (offset) result = result.slice(offset);
    if (limit) result = result.slice(0, limit);

    return result;
  }

  close(): void {
    this.db?.close();
    this.db = null;
  }
}
