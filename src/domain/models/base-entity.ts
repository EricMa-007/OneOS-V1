/**
 * 基础实体模型
 * 所有领域实体的公共字段
 */

export interface BaseEntity {
  /** 唯一ID */
  id: string;
  /** 创建时间（ISO 8601） */
  createdAt: string;
  /** 更新时间（ISO 8601） */
  updatedAt: string;
  /** 版本号（用于乐观锁和同步） */
  version: number;
  /** 设备ID（标识数据来源设备） */
  deviceId: string;
  /** 同步状态 */
  syncState: 'local' | 'synced' | 'conflict';
  /** 软删除标记 */
  deleted: boolean;
  /** 删除时间（软删除时记录） */
  deletedAt?: string;
}

/**
 * 创建基础实体的工厂函数
 */
export function createBaseEntity(id?: string): Omit<BaseEntity, 'id'> & { id: string } {
  const now = new Date().toISOString();
  return {
    id: id || `n_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: now,
    updatedAt: now,
    version: 1,
    deviceId: typeof navigator !== 'undefined' ? (navigator as unknown).userAgent?.slice(0, 20) || 'unknown' : 'unknown',
    syncState: 'local',
    deleted: false,
  };
}

/**
 * 更新实体的时间戳和版本号
 */
export function touchEntity<T extends BaseEntity>(entity: T): T {
  return {
    ...entity,
    updatedAt: new Date().toISOString(),
    version: entity.version + 1,
    syncState: 'local',
  };
}

/**
 * 软删除实体
 */
export function softDeleteEntity<T extends BaseEntity>(entity: T): T {
  return {
    ...entity,
    deleted: true,
    deletedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: entity.version + 1,
    syncState: 'local',
  };
}
