/**
 * OneOS 数据同步机制
 * 支持多设备同步、冲突解决、增量同步
 */

import { Logger } from '../kernel/logger';

const logger = new Logger('SyncService');

/**
 * 同步状态枚举
 */
export enum SyncStatus {
  IDLE = 'idle',
  SYNCING = 'syncing',
  CONFLICT = 'conflict',
  ERROR = 'error',
  OFFLINE = 'offline',
}

/**
 * 同步策略枚举
 */
export enum SyncStrategy {
  LAST_WRITE_WINS = 'last_write_wins',
  FIRST_WRITE_WINS = 'first_write_wins',
  MANUAL_MERGE = 'manual_merge',
  FIELD_LEVEL_MERGE = 'field_level_merge',
}

/**
 * 同步记录
 */
export interface SyncRecord {
  id: string;
  entityType: string;
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  timestamp: string;
  deviceId: string;
  syncStatus: 'pending' | 'synced' | 'conflict';
  data?: unknown;
  conflictData?: unknown;
}

/**
 * 设备信息
 */
export interface DeviceInfo {
  id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet' | 'web';
  lastSyncTime: string;
  isActive: boolean;
}

/**
 * 同步配置
 */
export interface SyncConfig {
  enabled: boolean;
  strategy: SyncStrategy;
  autoSync: boolean;
  syncInterval: number; // 毫秒
  conflictResolution: SyncStrategy;
  maxRetries: number;
  batchSize: number;
}

/**
 * 默认同步配置
 */
export const DEFAULT_SYNC_CONFIG: SyncConfig = {
  enabled: false,
  strategy: SyncStrategy.LAST_WRITE_WINS,
  autoSync: true,
  syncInterval: 5 * 60 * 1000, // 5分钟
  conflictResolution: SyncStrategy.LAST_WRITE_WINS,
  maxRetries: 3,
  batchSize: 50,
};

/**
 * 同步服务
 */
export class SyncService {
  private config: SyncConfig;
  private status: SyncStatus = SyncStatus.IDLE;
  private pendingRecords: SyncRecord[] = [];
  private devices: DeviceInfo[] = [];
  private currentDeviceId: string;
  private syncTimer: ReturnType<typeof setInterval> | null = null;
  private lastSyncTime: string | null = null;

  constructor(config: Partial<SyncConfig> = {}) {
    this.config = { ...DEFAULT_SYNC_CONFIG, ...config };
    this.currentDeviceId = this.getOrCreateDeviceId();
    this.loadPendingRecords();
    this.loadDevices();

    if (this.config.enabled && this.config.autoSync) {
      this.startAutoSync();
    }

    logger.info('同步服务初始化完成', { deviceId: this.currentDeviceId });
  }

  /**
   * 获取或创建设备ID
   */
  private getOrCreateDeviceId(): string {
    let deviceId = localStorage.getItem('oneos_device_id');
    if (!deviceId) {
      deviceId = `device_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
      localStorage.setItem('oneos_device_id', deviceId);
    }
    return deviceId;
  }

  /**
   * 加载待同步记录
   */
  private loadPendingRecords(): void {
    try {
      const records = localStorage.getItem('oneos_sync_pending');
      this.pendingRecords = records ? JSON.parse(records) : [];
    } catch (error) {
      logger.error('加载待同步记录失败', error);
      this.pendingRecords = [];
    }
  }

  /**
   * 保存待同步记录
   */
  private savePendingRecords(): void {
    try {
      localStorage.setItem('oneos_sync_pending', JSON.stringify(this.pendingRecords));
    } catch (error) {
      logger.error('保存待同步记录失败', error);
    }
  }

  /**
   * 加载设备列表
   */
  private loadDevices(): void {
    try {
      const devices = localStorage.getItem('oneos_sync_devices');
      this.devices = devices ? JSON.parse(devices) : [];
    } catch (error) {
      logger.error('加载设备列表失败', error);
      this.devices = [];
    }
  }

  /**
   * 保存设备列表
   */
  private saveDevices(): void {
    try {
      localStorage.setItem('oneos_sync_devices', JSON.stringify(this.devices));
    } catch (error) {
      logger.error('保存设备列表失败', error);
    }
  }

  /**
   * 记录变更
   */
  recordChange(entityType: string, entityId: string, operation: 'create' | 'update' | 'delete', data?: unknown): void {
    const record: SyncRecord = {
      id: `sync_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`,
      entityType,
      entityId,
      operation,
      timestamp: new Date().toISOString(),
      deviceId: this.currentDeviceId,
      syncStatus: 'pending',
      data,
    };

    this.pendingRecords.push(record);
    this.savePendingRecords();

    logger.info('记录变更', { entityType, entityId, operation });
  }

  /**
   * 执行同步
   */
  async sync(): Promise<{ success: boolean; synced: number; conflicts: number; errors: number }> {
    if (!this.config.enabled) {
      return { success: false, synced: 0, conflicts: 0, errors: 0 };
    }

    if (this.status === SyncStatus.SYNCING) {
      logger.warn('同步正在进行中，跳过');
      return { success: false, synced: 0, conflicts: 0, errors: 0 };
    }

    this.status = SyncStatus.SYNCING;
    logger.info('开始同步', { pendingCount: this.pendingRecords.length });

    let synced = 0;
    let conflicts = 0;
    let errors = 0;

    try {
      // 1. 推送本地变更
      const pushResult = await this.pushChanges();
      synced += pushResult.synced;
      conflicts += pushResult.conflicts;
      errors += pushResult.errors;

      // 2. 拉取远程变更
      const pullResult = await this.pullChanges();
      synced += pullResult.synced;
      conflicts += pullResult.conflicts;
      errors += pullResult.errors;

      // 3. 解决冲突
      if (conflicts > 0) {
        await this.resolveConflicts();
      }

      this.lastSyncTime = new Date().toISOString();
      this.status = SyncStatus.IDLE;

      logger.info('同步完成', { synced, conflicts, errors });
      return { success: errors === 0, synced, conflicts, errors };
    } catch (error) {
      this.status = SyncStatus.ERROR;
      errors++;
      logger.error('同步失败', error);
      return { success: false, synced, conflicts, errors };
    }
  }

  /**
   * 推送本地变更
   */
  private async pushChanges(): Promise<{ synced: number; conflicts: number; errors: number }> {
    let synced = 0;
    let conflicts = 0;
    let errors = 0;

    const pending = this.pendingRecords.filter((r) => r.syncStatus === 'pending');
    const batches = this.chunkArray(pending, this.config.batchSize);

    for (const batch of batches) {
      for (const record of batch) {
        try {
          // 模拟推送（实际实现需要后端API）
          const result = await this.pushToRemote(record);

          if (result.conflict) {
            record.syncStatus = 'conflict';
            record.conflictData = result.remoteData;
            conflicts++;
          } else {
            record.syncStatus = 'synced';
            synced++;
          }
        } catch (error) {
          errors++;
          logger.error('推送变更失败', { recordId: record.id, error });
        }
      }
    }

    // 清理已同步记录
    this.pendingRecords = this.pendingRecords.filter((r) => r.syncStatus !== 'synced');
    this.savePendingRecords();

    return { synced, conflicts, errors };
  }

  /**
   * 推送到远程（模拟实现）
   */
  private async pushToRemote(record: SyncRecord): Promise<{ conflict: boolean; remoteData?: unknown }> {
    // 实际实现需要调用后端API
    // 这里模拟成功
    await new Promise((resolve) => setTimeout(resolve, 10));
    return { conflict: false };
  }

  /**
   * 拉取远程变更
   */
  private async pullChanges(): Promise<{ synced: number; conflicts: number; errors: number }> {
    // 实际实现需要调用后端API
    // 这里模拟没有新变更
    await new Promise((resolve) => setTimeout(resolve, 10));
    return { synced: 0, conflicts: 0, errors: 0 };
  }

  /**
   * 解决冲突
   */
  private async resolveConflicts(): Promise<void> {
    const conflicts = this.pendingRecords.filter((r) => r.syncStatus === 'conflict');

    for (const conflict of conflicts) {
      switch (this.config.conflictResolution) {
        case SyncStrategy.LAST_WRITE_WINS:
          // 本地覆盖远程
          conflict.syncStatus = 'synced';
          break;
        case SyncStrategy.FIRST_WRITE_WINS:
          // 远程覆盖本地
          conflict.syncStatus = 'synced';
          break;
        case SyncStrategy.MANUAL_MERGE:
          // 等待用户手动解决
          this.status = SyncStatus.CONFLICT;
          break;
        case SyncStrategy.FIELD_LEVEL_MERGE:
          // 字段级合并
          conflict.syncStatus = 'synced';
          break;
      }
    }

    this.pendingRecords = this.pendingRecords.filter((r) => r.syncStatus !== 'synced');
    this.savePendingRecords();
  }

  /**
   * 启动自动同步
   */
  startAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    this.syncTimer = setInterval(() => {
      if (this.pendingRecords.length > 0 && this.status === SyncStatus.IDLE) {
        this.sync();
      }
    }, this.config.syncInterval);

    logger.info('自动同步已启动', { interval: this.config.syncInterval });
  }

  /**
   * 停止自动同步
   */
  stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
    logger.info('自动同步已停止');
  }

  /**
   * 注册设备
   */
  registerDevice(name: string, type: DeviceInfo['type']): DeviceInfo {
    const device: DeviceInfo = {
      id: this.currentDeviceId,
      name,
      type,
      lastSyncTime: new Date().toISOString(),
      isActive: true,
    };

    const existingIndex = this.devices.findIndex((d) => d.id === this.currentDeviceId);
    if (existingIndex >= 0) {
      this.devices[existingIndex] = device;
    } else {
      this.devices.push(device);
    }

    this.saveDevices();
    logger.info('设备已注册', { deviceId: this.currentDeviceId, name });
    return device;
  }

  /**
   * 获取当前设备
   */
  getCurrentDevice(): DeviceInfo | undefined {
    return this.devices.find((d) => d.id === this.currentDeviceId);
  }

  /**
   * 获取所有设备
   */
  getDevices(): DeviceInfo[] {
    return this.devices;
  }

  /**
   * 获取同步状态
   */
  getStatus(): SyncStatus {
    return this.status;
  }

  /**
   * 获取待同步记录数
   */
  getPendingCount(): number {
    return this.pendingRecords.filter((r) => r.syncStatus === 'pending').length;
  }

  /**
   * 获取冲突记录数
   */
  getConflictCount(): number {
    return this.pendingRecords.filter((r) => r.syncStatus === 'conflict').length;
  }

  /**
   * 获取最后同步时间
   */
  getLastSyncTime(): string | null {
    return this.lastSyncTime;
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<SyncConfig>): void {
    this.config = { ...this.config, ...config };

    if (config.autoSync !== undefined) {
      if (config.autoSync && this.config.enabled) {
        this.startAutoSync();
      } else {
        this.stopAutoSync();
      }
    }

    logger.info('同步配置已更新', config);
  }

  /**
   * 获取配置
   */
  getConfig(): SyncConfig {
    return { ...this.config };
  }

  /**
   * 清除所有待同步记录
   */
  clearPendingRecords(): void {
    this.pendingRecords = [];
    this.savePendingRecords();
    logger.info('待同步记录已清除');
  }

  /**
   * 分块数组
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * 销毁服务
   */
  destroy(): void {
    this.stopAutoSync();
    this.savePendingRecords();
    this.saveDevices();
    logger.info('同步服务已销毁');
  }
}

/**
 * 同步事件类型
 */
export enum SyncEventType {
  SYNC_STARTED = 'sync_started',
  SYNC_COMPLETED = 'sync_completed',
  SYNC_ERROR = 'sync_error',
  CONFLICT_DETECTED = 'conflict_detected',
  DEVICE_REGISTERED = 'device_registered',
  CONFIG_CHANGED = 'config_changed',
}

/**
 * 同步事件
 */
export interface SyncEvent {
  type: SyncEventType;
  timestamp: string;
  data?: unknown;
}
