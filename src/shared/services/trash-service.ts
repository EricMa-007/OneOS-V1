/**
 * OneOS 回收站服务
 * 支持软删除、恢复、永久删除、自动清理
 * 
 * 作者：A03 多泽（数据工程师）
 */

import { BaseEntity } from '../../domain/models/base-entity';

export interface TrashItem {
  id: string;
  entityType: string;
  entityId: string;
  entityData: Record<string, unknown>;
  deletedAt: string;
  deletedBy?: string;
  reason?: string;
  expiresAt: string; // 30天后自动永久删除
}

const TRASH_STORE = 'oneos-trash';
const DEFAULT_RETENTION_DAYS = 30;

/**
 * 回收站服务
 */
export class TrashService {
  private static instance: TrashService | null = null;
  private db: IDBDatabase | null = null;

  private constructor() {}

  static getInstance(): TrashService {
    if (!TrashService.instance) {
      TrashService.instance = new TrashService();
    }
    return TrashService.instance;
  }

  /**
   * 初始化数据库
   */
  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open('OneOS-Trash', 1);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(TRASH_STORE)) {
          const store = db.createObjectStore(TRASH_STORE, { keyPath: 'id' });
          store.createIndex('entityType', 'entityType', { unique: false });
          store.createIndex('deletedAt', 'deletedAt', { unique: false });
          store.createIndex('expiresAt', 'expiresAt', { unique: false });
        }
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 将实体移入回收站
   */
  async moveToTrash<T extends BaseEntity>(
    entity: T,
    entityType: string,
    options?: { reason?: string; retentionDays?: number }
  ): Promise<void> {
    const db = await this.getDB();
    const now = new Date();
    const retentionDays = options?.retentionDays || DEFAULT_RETENTION_DAYS;
    const expiresAt = new Date(now.getTime() + retentionDays * 24 * 60 * 60 * 1000);

    const trashItem: TrashItem = {
      id: `trash_${entityType}_${entity.id}_${Date.now()}`,
      entityType,
      entityId: entity.id,
      entityData: JSON.parse(JSON.stringify(entity)),
      deletedAt: now.toISOString(),
      reason: options?.reason,
      expiresAt: expiresAt.toISOString(),
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(TRASH_STORE, 'readwrite');
      const store = tx.objectStore(TRASH_STORE);
      const request = store.add(trashItem);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 从回收站恢复实体
   */
  async restoreFromTrash(trashItemId: string): Promise<TrashItem | null> {
    const db = await this.getDB();
    
    const item = await this.getTrashItem(trashItemId);
    if (!item) return null;

    // 从回收站删除
    await this.deleteFromTrash(trashItemId);
    
    return item;
  }

  /**
   * 从回收站永久删除
   */
  async deleteFromTrash(trashItemId: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(TRASH_STORE, 'readwrite');
      const store = tx.objectStore(TRASH_STORE);
      const request = store.delete(trashItemId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 获取回收站项目
   */
  async getTrashItem(trashItemId: string): Promise<TrashItem | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(TRASH_STORE, 'readonly');
      const store = tx.objectStore(TRASH_STORE);
      const request = store.get(trashItemId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 获取所有回收站项目
   */
  async getAllTrash(entityType?: string): Promise<TrashItem[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(TRASH_STORE, 'readonly');
      const store = tx.objectStore(TRASH_STORE);
      const request = store.getAll();
      request.onsuccess = () => {
        let items = request.result as TrashItem[];
        if (entityType) {
          items = items.filter((item) => item.entityType === entityType);
        }
        // 按删除时间倒序
        items.sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());
        resolve(items);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 清空回收站
   */
  async clearTrash(entityType?: string): Promise<void> {
    const items = await this.getAllTrash(entityType);
    for (const item of items) {
      await this.deleteFromTrash(item.id);
    }
  }

  /**
   * 清理过期项目（自动永久删除）
   */
  async cleanupExpired(): Promise<number> {
    const now = new Date().toISOString();
    const allItems = await this.getAllTrash();
    const expiredItems = allItems.filter((item) => item.expiresAt < now);
    
    for (const item of expiredItems) {
      await this.deleteFromTrash(item.id);
    }
    
    return expiredItems.length;
  }

  /**
   * 获取回收站统计
   */
  async getTrashStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    expiredCount: number;
  }> {
    const items = await this.getAllTrash();
    const now = new Date().toISOString();
    
    const byType: Record<string, number> = {};
    let expiredCount = 0;
    
    for (const item of items) {
      byType[item.entityType] = (byType[item.entityType] || 0) + 1;
      if (item.expiresAt < now) {
        expiredCount++;
      }
    }
    
    return {
      total: items.length,
      byType,
      expiredCount,
    };
  }

  /**
   * 检查实体是否在回收站中
   */
  async isInTrash(entityId: string, entityType?: string): Promise<boolean> {
    const items = await this.getAllTrash(entityType);
    return items.some((item) => item.entityId === entityId);
  }

  /**
   * 关闭数据库连接
   */
  close(): void {
    this.db?.close();
    this.db = null;
  }
}

export default TrashService;
