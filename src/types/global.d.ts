/**
 * OneOS 全局类型定义
 * 扩展Window对象，避免使用 (window as any)
 */

import type { IDIContainer } from '../kernel/di-container';
import type { IEventBus } from '../kernel/event-bus';
import type { ILogger } from '../kernel/logger';

// OneOS 全局服务类型
export interface OneOSGlobalServices {
  [key: string]: unknown;
}

// 扩展 Window 接口
declare global {
  interface Window {
    // OneOS 容器
    OneOSContainer?: IDIContainer;
    OneOSServices?: OneOSGlobalServices;

    // 事件总线
    OneOSEventBus?: IEventBus;
    OneOSEvents?: Record<string, string>;

    // 日志
    OneOSLogger?: ILogger;

    // 环境标识
    __ONEOS_ENV__?: 'development' | 'production' | 'test';

    // 自定义事件
    addEventListener(type: 'oneos:open-command-palette', listener: () => void): void;
    addEventListener(type: 'oneos:new-note', listener: () => void): void;
    addEventListener(type: 'oneos:show-shortcuts', listener: () => void): void;
  }
}

// 图统计类型
export interface GraphStats {
  nodeCount: number;
  edgeCount: number;
  density: number;
  avgDegree: number;
  connectedComponents: number;
  [key: string]: unknown;
}

// 排序模式类型
export type SortMode = 'updated' | 'created' | 'title' | 'custom';

// 主题类型
export type ThemeKey = 'light' | 'dark' | 'auto' | string;

export {};
