/**
 * OneOS 操作历史服务
 * 支持撤销、重做、操作历史记录
 * 
 * 作者：A02 墨菲斯（全栈工程师）
 */

export interface HistoryAction {
  id: string;
  type: string; // 操作类型：create/update/delete/custom
  label: string; // 操作描述
  timestamp: string;
  entityType?: string;
  entityId?: string;
  before?: unknown; // 操作前状态
  after?: unknown; // 操作后状态
  metadata?: Record<string, unknown>;
  undo?: () => Promise<void> | void; // 撤销函数
  redo?: () => Promise<void> | void; // 重做函数
}

export interface HistoryOptions {
  maxSize?: number; // 最大历史记录数
  groupInterval?: number; // 合并连续操作的时间间隔（ms）
}

const DEFAULT_OPTIONS: Required<HistoryOptions> = {
  maxSize: 100,
  groupInterval: 500,
};

/**
 * 操作历史服务
 */
export class HistoryService {
  private static instance: HistoryService | null = null;
  private undoStack: HistoryAction[] = [];
  private redoStack: HistoryAction[] = [];
  private options: Required<HistoryOptions>;
  private lastActionTime = 0;
  private listeners: Set<() => void> = new Set();

  private constructor(options?: HistoryOptions) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  static getInstance(options?: HistoryOptions): HistoryService {
    if (!HistoryService.instance) {
      HistoryService.instance = new HistoryService(options);
    }
    return HistoryService.instance;
  }

  /**
   * 记录操作
   */
  record(action: Omit<HistoryAction, 'id' | 'timestamp'>): void {
    const now = Date.now();
    const historyAction: HistoryAction = {
      ...action,
      id: `history_${now}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    // 检查是否需要合并连续操作
    if (this.undoStack.length > 0 && 
        now - this.lastActionTime < this.options.groupInterval &&
        this.shouldGroup(this.undoStack[this.undoStack.length - 1], historyAction)) {
      // 合并：更新最后一个操作的after状态
      const lastAction = this.undoStack[this.undoStack.length - 1];
      lastAction.after = historyAction.after;
      lastAction.timestamp = historyAction.timestamp;
    } else {
      // 新操作
      this.undoStack.push(historyAction);
      
      // 限制最大记录数
      if (this.undoStack.length > this.options.maxSize) {
        this.undoStack.shift();
      }
    }

    // 清空重做栈
    this.redoStack = [];
    this.lastActionTime = now;
    this.notifyListeners();
  }

  /**
   * 判断是否应该合并操作
   */
  private shouldGroup(prev: HistoryAction, curr: HistoryAction): boolean {
    return prev.type === curr.type &&
           prev.entityType === curr.entityType &&
           prev.entityId === curr.entityId &&
           prev.type === 'update'; // 只合并连续的更新操作
  }

  /**
   * 撤销
   */
  async undo(): Promise<HistoryAction | null> {
    if (this.undoStack.length === 0) return null;

    const action = this.undoStack.pop()!;
    
    try {
      if (action.undo) {
        await action.undo();
      }
      this.redoStack.push(action);
      this.notifyListeners();
      return action;
    } catch (error) {
      console.error('[History] 撤销失败:', error);
      // 撤销失败，将操作放回撤销栈
      this.undoStack.push(action);
      return null;
    }
  }

  /**
   * 重做
   */
  async redo(): Promise<HistoryAction | null> {
    if (this.redoStack.length === 0) return null;

    const action = this.redoStack.pop()!;
    
    try {
      if (action.redo) {
        await action.redo();
      }
      this.undoStack.push(action);
      this.notifyListeners();
      return action;
    } catch (error) {
      console.error('[History] 重做失败:', error);
      // 重做失败，将操作放回重做栈
      this.redoStack.push(action);
      return null;
    }
  }

  /**
   * 批量撤销（撤销到指定操作）
   */
  async undoTo(actionId: string): Promise<number> {
    const index = this.undoStack.findIndex((a) => a.id === actionId);
    if (index === -1) return 0;

    let count = 0;
    while (this.undoStack.length > index) {
      const result = await this.undo();
      if (result) count++;
      else break;
    }
    return count;
  }

  /**
   * 获取撤销栈
   */
  getUndoStack(): HistoryAction[] {
    return [...this.undoStack].reverse(); // 最新的在前面
  }

  /**
   * 获取重做栈
   */
  getRedoStack(): HistoryAction[] {
    return [...this.redoStack].reverse();
  }

  /**
   * 获取最近的撤销操作
   */
  getLastUndo(): HistoryAction | null {
    return this.undoStack[this.undoStack.length - 1] || null;
  }

  /**
   * 获取最近的重做操作
   */
  getLastRedo(): HistoryAction | null {
    return this.redoStack[this.redoStack.length - 1] || null;
  }

  /**
   * 是否可以撤销
   */
  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /**
   * 是否可以重做
   */
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /**
   * 清空历史
   */
  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.notifyListeners();
  }

  /**
   * 获取历史统计
   */
  getStats(): {
    undoCount: number;
    redoCount: number;
    canUndo: boolean;
    canRedo: boolean;
    lastAction?: HistoryAction;
  } {
    return {
      undoCount: this.undoStack.length,
      redoCount: this.redoStack.length,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      lastAction: this.getLastUndo(),
    };
  }

  /**
   * 订阅历史变化
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * 通知监听器
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }
}

/**
 * React Hook：使用操作历史
 */
export function useHistory() {
  const historyService = HistoryService.getInstance();
  
  return {
    record: historyService.record.bind(historyService),
    undo: historyService.undo.bind(historyService),
    redo: historyService.redo.bind(historyService),
    undoTo: historyService.undoTo.bind(historyService),
    canUndo: historyService.canUndo.bind(historyService),
    canRedo: historyService.canRedo.bind(historyService),
    getUndoStack: historyService.getUndoStack.bind(historyService),
    getRedoStack: historyService.getRedoStack.bind(historyService),
    getLastUndo: historyService.getLastUndo.bind(historyService),
    getLastRedo: historyService.getLastRedo.bind(historyService),
    clear: historyService.clear.bind(historyService),
    getStats: historyService.getStats.bind(historyService),
    subscribe: historyService.subscribe.bind(historyService),
  };
}

export default HistoryService;
