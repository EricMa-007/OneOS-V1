/**
 * OneOS 事件总线（Event Bus）
 * 模块间通信的核心基础设施，实现发布-订阅模式
 * 
 * 设计原则：
 * - 模块间不直接引用，通过事件总线通信
 * - 事件命名规范：领域:动作（如 note:created）
 * - 支持一次性订阅、取消订阅
 * - 事件处理错误不影响其他订阅者
 * 
 * 作者：A01 崔尼蒂（首席架构师）
 */

export type EventHandler<T = unknown> = (payload: T) => void;

export interface EventBus {
  emit<T>(event: string, payload: T): void;
  on<T>(event: string, handler: EventHandler<T>): () => void;
  off<T>(event: string, handler: EventHandler<T>): void;
  once<T>(event: string, handler: EventHandler<T>): () => void;
  clear(event?: string): void;
  listenerCount(event: string): number;
}

class EventBusImpl implements EventBus {
  private handlers = new Map<string, Set<EventHandler>>();
  private debug = false;

  /**
   * 发布事件
   * @param event 事件名称（领域:动作）
   * @param payload 事件数据
   */
  emit<T>(event: string, payload: T): void {
    if (this.debug) {
      // console.log(`[EventBus] emit: ${event}`, payload);
    }

    const handlers = this.handlers.get(event);
    if (!handlers || handlers.size === 0) return;

    // 复制一份，避免在处理过程中修改集合
    const handlersCopy = Array.from(handlers);
    for (const handler of handlersCopy) {
      try {
        handler(payload);
      } catch (err) {
        console.error(`[EventBus] 事件 ${event} 处理失败:`, err);
      }
    }
  }

  /**
   * 订阅事件
   * @param event 事件名称
   * @param handler 事件处理函数
   * @returns 取消订阅函数
   */
  on<T>(event: string, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler as EventHandler);
    return () => this.off(event, handler);
  }

  /**
   * 取消订阅
   */
  off<T>(event: string, handler: EventHandler<T>): void {
    this.handlers.get(event)?.delete(handler as EventHandler);
  }

  /**
   * 一次性订阅（触发一次后自动取消）
   */
  once<T>(event: string, handler: EventHandler<T>): () => void {
    const wrapper: EventHandler<T> = (payload) => {
      this.off(event, wrapper);
      handler(payload);
    };
    return this.on(event, wrapper);
  }

  /**
   * 清除事件监听器
   * @param event 事件名称，不传则清除所有
   */
  clear(event?: string): void {
    if (event) {
      this.handlers.delete(event);
    } else {
      this.handlers.clear();
    }
  }

  /**
   * 获取事件监听器数量
   */
  listenerCount(event: string): number {
    return this.handlers.get(event)?.size ?? 0;
  }

  /**
   * 开启调试模式
   */
  setDebug(debug: boolean): void {
    this.debug = debug;
  }
}

// 全局单例
export const eventBus = new EventBusImpl();

// ============================================
// 事件名称常量（集中管理，避免拼写错误）
// ============================================

export const EVENTS = {
  // 笔记事件
  NOTE: {
    CREATED: 'note:created',
    UPDATED: 'note:updated',
    DELETED: 'note:deleted',
    SELECTED: 'note:selected',
    CONTENT_CHANGED: 'note:content-changed',
    SAVED: 'note:saved',
  },
  // 文件夹事件
  FOLDER: {
    CREATED: 'folder:created',
    UPDATED: 'folder:updated',
    DELETED: 'folder:deleted',
    EXPANDED: 'folder:expanded',
    COLLAPSED: 'folder:collapsed',
  },
  // 标签事件
  TAG: {
    CREATED: 'tag:created',
    DELETED: 'tag:deleted',
    CLICKED: 'tag:clicked',
  },
  // 知识图谱事件
  GRAPH: {
    NODE_SELECTED: 'graph:node-selected',
    NODE_DRAGGED: 'graph:node-dragged',
    LAYOUT_CHANGED: 'graph:layout-changed',
    ZOOM_CHANGED: 'graph:zoom-changed',
  },
  // 日历事件
  CALENDAR: {
    DATE_SELECTED: 'calendar:date-selected',
    VIEW_CHANGED: 'calendar:view-changed',
    MONTH_CHANGED: 'calendar:month-changed',
  },
  // 搜索事件
  SEARCH: {
    OPENED: 'search:opened',
    CLOSED: 'search:closed',
    QUERY_CHANGED: 'search:query-changed',
    RESULT_SELECTED: 'search:result-selected',
    NAVIGATE: 'search:navigate',
  },
  // AI事件
  AI: {
    MESSAGE_SENT: 'ai:message-sent',
    MESSAGE_RECEIVED: 'ai:message-received',
    CONVERSATION_CREATED: 'ai:conversation-created',
    CONVERSATION_SELECTED: 'ai:conversation-selected',
    STREAM_STARTED: 'ai:stream-started',
    STREAM_FINISHED: 'ai:stream-finished',
  },
  // 社交事件
  SOCIAL: {
    MESSAGE_SENT: 'social:message-sent',
    CONTACT_ADDED: 'social:contact-added',
    CIRCLE_JOINED: 'social:circle-joined',
  },
  // 语音事件
  VOICE: {
    RECORDING_STARTED: 'voice:recording-started',
    RECORDING_STOPPED: 'voice:recording-stopped',
    TRANSCRIPTION_READY: 'voice:transcription-ready',
    SPEECH_STARTED: 'voice:speech-started',
    SPEECH_FINISHED: 'voice:speech-finished',
  },
  // 设置事件
  SETTINGS: {
    CHANGED: 'settings:changed',
    THEME_CHANGED: 'settings:theme-changed',
    FONT_CHANGED: 'settings:font-changed',
    DENSITY_CHANGED: 'settings:density-changed',
  },
  // 应用事件
  APP: {
    NAV_CHANGED: 'app:nav-changed',
    FOCUS_MODE_TOGGLED: 'app:focus-mode-toggled',
    TOAST: 'app:toast',
    LOADING_STARTED: 'app:loading-started',
    LOADING_FINISHED: 'app:loading-finished',
    DATA_MIGRATION_STARTED: 'app:data-migration-started',
    DATA_MIGRATION_FINISHED: 'app:data-migration-finished',
  },
  // 数据事件
  DATA: {
    BACKUP_CREATED: 'data:backup-created',
    RESTORE_STARTED: 'data:restore-started',
    RESTORE_FINISHED: 'data:restore-finished',
    IMPORT_STARTED: 'data:import-started',
    IMPORT_FINISHED: 'data:import-finished',
    EXPORT_STARTED: 'data:export-started',
    EXPORT_FINISHED: 'data:export-finished',
  },
} as const;

// 挂载到全局（兼容旧代码）
if (typeof window !== 'undefined') {
  window.OneOSEventBus = eventBus;
  window.OneOSEvents = EVENTS;
}
