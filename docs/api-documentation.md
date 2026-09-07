# OneOS API 文档

> **版本**：V1.2.0
> **更新日期**：2026-08-29
> **文档主管**：A10 珀耳塞福涅

---

## 目录

1. [概述](#1-概述)
2. [核心模块 API](#2-核心模块-api)
3. [状态管理 Store API](#3-状态管理-store-api)
4. [算法引擎 API](#4-算法引擎-api)
5. [UI 组件 API](#5-ui-组件-api)
6. [事件系统 API](#6-事件系统-api)

---

## 1. 概述

### 1.1 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 框架 | React 18 | UI框架 |
| 语言 | TypeScript | 类型安全 |
| 构建 | Vite 5 | 快速构建 |
| 状态 | Zustand | 轻量级状态管理 |
| 存储 | IndexedDB | 本地数据库 |
| 样式 | CSS Variables | 设计系统 |
| 测试 | Vitest + Cypress | 单元测试 + E2E |

### 1.2 架构分层

```
┌─────────────────────────────────────────┐
│              UI Layer (React)            │
│  Pages / Components / Layouts            │
├─────────────────────────────────────────┤
│           State Layer (Zustand)          │
│  Stores / Selectors / Actions            │
├─────────────────────────────────────────┤
│          Service Layer (Business)        │
│  NoteService / AIService / SearchService │
├─────────────────────────────────────────┤
│        Repository Layer (Data Access)    │
│  NoteRepository / IndexedDB / Cache      │
├─────────────────────────────────────────┤
│          Kernel Layer (Infrastructure)   │
│  EventBus / Logger / DI / Algorithms     │
└─────────────────────────────────────────┘
```

### 1.3 目录结构

```
src/
├── components/          # 通用UI组件
│   └── ui/             # 基础UI组件库
├── pages/              # 页面组件
├── stores/             # Zustand状态管理
├── modules/            # 业务模块
│   ├── note/           # 笔记模块
│   ├── ai/             # AI模块
│   └── ...
├── infrastructure/     # 基础设施
│   └── indexeddb/      # IndexedDB实现
├── shared/             # 共享代码
│   ├── kernel/         # 核心内核
│   │   ├── event-bus.ts
│   │   ├── logger.ts
│   │   ├── di-container.ts
│   │   ├── graph-algorithm-engine.ts
│   │   ├── search-algorithm-engine.ts
│   │   ├── performance-monitor.ts
│   │   └── error-monitor.ts
│   ├── models/         # 数据模型
│   └── types/          # 类型定义
├── styles/             # 全局样式
└── App.tsx             # 应用入口
```

---

## 2. 核心模块 API

### 2.1 笔记服务 (NoteService)

```typescript
class NoteService {
  // 创建笔记
  createNote(input: CreateNoteInput): Promise<Note>;

  // 获取笔记
  getNote(id: string): Promise<Note | null>;
  getNotes(filter?: NoteFilter): Promise<Note[]>;
  getNoteStats(): Promise<NoteStats>;

  // 更新笔记
  updateNote(id: string, input: UpdateNoteInput): Promise<Note>;

  // 删除笔记
  deleteNote(id: string): Promise<void>;

  // 搜索笔记
  searchNotes(query: string): Promise<SearchResult[]>;

  // 批量操作
  batchDelete(ids: string[]): Promise<void>;
  exportNotes(ids?: string[]): Promise<string>;
}
```

**数据模型**：

```typescript
interface Note {
  id: string;
  title: string;
  content: string;
  tagIds: string[];
  createdAt: number;
  updatedAt: number;
  meta: {
    wordCount: number;
    readingTime: number;
    version: number;
  };
}

interface CreateNoteInput {
  title?: string;
  content?: string;
  tagIds?: string[];
}

interface NoteFilter {
  tagIds?: string[];
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}
```

### 2.2 AI 服务 (AIService)

```typescript
class AIService {
  // 发送消息
  sendMessage(input: SendMessageInput): Promise<AsyncIterable<AIResponse>>;

  // 流式对话
  streamChat(input: ChatInput): AsyncGenerator<StreamChunk>;

  // 获取人设列表
  getPersonas(): Persona[];

  // 获取对话历史
  getConversations(): Conversation[];
  getConversation(id: string): Conversation | null;

  // 管理对话
  createConversation(title?: string): Conversation;
  deleteConversation(id: string): void;
  clearConversation(id: string): void;

  // RAG检索
  retrieveContext(query: string, limit?: number): RetrievedContext[];
}
```

**AI人设**：

```typescript
interface Persona {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
}
```

### 2.3 日历服务 (CalendarService)

```typescript
class CalendarService {
  // 日程CRUD
  createEvent(input: CreateEventInput): Promise<CalendarEvent>;
  getEvent(id: string): Promise<CalendarEvent | null>;
  getEvents(range: DateRange): Promise<CalendarEvent[]>;
  updateEvent(id: string, input: UpdateEventInput): Promise<CalendarEvent>;
  deleteEvent(id: string): Promise<void>;

  // 提醒
  setReminder(eventId: string, reminder: Reminder): void;
  getUpcomingReminders(): Reminder[];
}
```

---

## 3. 状态管理 Store API

### 3.1 App Store

```typescript
interface AppState {
  // 状态
  initialized: boolean;
  loading: boolean;
  loadingMessage: string;
  theme: 'light' | 'dark';
  currentNav: string;
  sidebarOpen: boolean;
  commandPaletteOpen: boolean;

  // 动作
  setInitialized(value: boolean): void;
  setLoading(loading: boolean, message?: string): void;
  setTheme(theme: 'light' | 'dark'): void;
  setCurrentNav(nav: string): void;
  toggleSidebar(): void;
  setCommandPaletteOpen(open: boolean): void;
}

// 使用
const { currentNav, setCurrentNav } = useAppStore();
```

### 3.2 Note Store

```typescript
interface NoteState {
  // 状态
  notes: Note[];
  currentNoteId: string | null;
  stats: NoteStats;
  loading: boolean;
  error: string | null;

  // 动作
  fetchNotes(): Promise<void>;
  fetchStats(): Promise<void>;
  selectNote(id: string): void;
  createNote(input: CreateNoteInput): Promise<Note>;
  updateNote(id: string, input: UpdateNoteInput): Promise<void>;
  deleteNote(id: string): Promise<void>;
  searchNotes(query: string): Note[];
}
```

### 3.3 Editor Store

```typescript
interface EditorState {
  // 状态
  currentNoteId: string | null;
  title: string;
  content: string;
  isDirty: boolean;
  mode: 'edit' | 'preview' | 'split';
  history: HistoryEntry[];
  historyIndex: number;

  // 动作
  setCurrentNote(note: Note): void;
  setTitle(title: string): void;
  setContent(content: string): void;
  setMode(mode: 'edit' | 'preview' | 'split'): void;
  save(): Promise<void>;
  undo(): void;
  redo(): void;
  formatText(format: TextFormat): void;
  markClean(): void;
  canUndo: boolean;
  canRedo: boolean;
}
```

### 3.4 AI Store

```typescript
interface AIState {
  // 状态
  conversations: Conversation[];
  currentConversationId: string | null;
  messages: Message[];
  isStreaming: boolean;
  streamingProgress: number;
  currentPersona: Persona;
  searchQuery: string;

  // 动作
  sendMessage(content: string): Promise<void>;
  stopStreaming(): void;
  setPersona(persona: Persona): void;
  createConversation(): void;
  selectConversation(id: string): void;
  deleteConversation(id: string): void;
  searchMessages(query: string): Message[];
  regenerateLastMessage(): void;
}
```

### 3.5 Graph Store

```typescript
interface GraphState {
  // 状态
  nodes: GraphNode[];
  edges: GraphEdge[];
  communities: Community[];
  view: {
    zoom: number;
    panX: number;
    panY: number;
    selectedNodeId: string | null;
  };
  layout: 'force' | 'circular' | 'hierarchical';

  // 动作
  rebuild(): void;
  setZoom(zoom: number): void;
  setPan(x: number, y: number): void;
  selectNode(id: string | null): void;
  setLayout(layout: string): void;
  runCommunityDetection(): Community[];
  calculateCentrality(): Map<string, Centrality>;
}
```

---

## 4. 算法引擎 API

### 4.1 图算法引擎 (GraphAlgorithmEngine)

```typescript
class GraphAlgorithmEngine {
  // 设置图数据
  setGraph(nodes: GraphNode[], edges: GraphEdge[]): void;

  // 社区发现（标签传播算法）
  detectCommunities(maxIterations?: number): Community[];

  // 中心性分析
  calculateCentrality(): Map<string, {
    degree: number;        // 度中心性
    betweenness: number;   // 介数中心性
    closeness: number;     // 接近中心性
    pagerank: number;      // PageRank
  }>;

  // 路径算法
  bfsShortestPaths(sourceId: string): Map<string, number>;
  dijkstraShortestPath(sourceId: string, targetId: string): PathResult | null;

  // 推荐算法
  recommendNodes(nodeId: string, limit?: number): Recommendation[];
  findInfluentialNodes(limit?: number): Array<{
    nodeId: string;
    influence: number;
    type: string;
  }>;

  // 图统计
  getGraphStats(): {
    nodeCount: number;
    edgeCount: number;
    density: number;
    averageDegree: number;
    maxDegree: number;
    minDegree: number;
    diameter: number;
    averagePathLength: number;
    clusteringCoefficient: number;
    connectedComponents: number;
  };

  // 查询
  getNeighbors(nodeId: string): string[];
  getDegree(nodeId: string): number;
  getNodes(): GraphNode[];
  getEdges(): GraphEdge[];
  getCommunities(): Community[];
}

// 单例使用
import { graphAlgorithmEngine } from '@/shared/kernel/graph-algorithm-engine';

const communities = graphAlgorithmEngine.detectCommunities();
const centrality = graphAlgorithmEngine.calculateCentrality();
const recommendations = graphAlgorithmEngine.recommendNodes('node-1', 5);
```

### 4.2 搜索算法引擎 (SearchAlgorithmEngine)

```typescript
class SearchAlgorithmEngine {
  // 索引管理
  indexItem(item: SearchableItem): void;
  indexItems(items: SearchableItem[]): void;
  removeItem(itemId: string): void;
  clear(): void;

  // 搜索
  search(query: SearchQuery): SearchResult[];

  // 搜索建议
  getSuggestions(query: string, limit?: number): SearchSuggestion[];

  // 统计
  getStats(): {
    indexedItems: number;
    totalSearches: number;
    uniqueQueries: number;
    averageResults: number;
  };
}

// 搜索查询示例
const results = searchAlgorithmEngine.search({
  text: '人工智能',
  filters: {
    types: ['note', 'task'],
    tags: ['AI'],
  },
  options: {
    fuzzy: true,
    fuzzyThreshold: 0.6,
    limit: 20,
    sortBy: 'relevance',
  },
});

// 搜索结果结构
interface SearchResult {
  item: SearchableItem;
  score: number;                    // 相关度得分
  matchedFields: string[];         // 匹配的字段
  highlightedTitle: string;        // 高亮标题
  highlightedContent: string;      // 高亮内容摘要
  matchPositions: Array<{          // 匹配位置
    field: string;
    start: number;
    end: number;
  }>;
  explanation: string;              // 搜索解释
}
```

### 4.3 性能监控 (PerformanceMonitor)

```typescript
class PerformanceMonitor {
  init(): void;
  getMetrics(): PerformanceMetrics;
  generateReport(): PerformanceReport;
  evaluatePerformance(): {
    grade: 'A' | 'B' | 'C' | 'D';
    score: number;
    issues: string[];
  };
  onMetric(callback: (metrics: PerformanceMetrics) => void): () => void;
  reset(): void;
  destroy(): void;
}

// 性能指标
interface PerformanceMetrics {
  LCP?: number;        // Largest Contentful Paint
  FID?: number;        // First Input Delay
  CLS?: number;        // Cumulative Layout Shift
  FCP?: number;        // First Contentful Paint
  TTFB?: number;       // Time to First Byte
  INP?: number;        // Interaction to Next Paint
  appLoadTime?: number;
  firstRenderTime?: number;
  bundleSize?: number;
}

// 使用
import { performanceMonitor } from '@/shared/kernel/performance-monitor';

performanceMonitor.init();
const evaluation = performanceMonitor.evaluatePerformance();
console.log(`性能等级: ${evaluation.grade} (${evaluation.score}分)`);
```

### 4.4 错误监控 (ErrorMonitor)

```typescript
class ErrorMonitor {
  init(): void;
  reportCustom(message: string, extra?: Record<string, any>, level?: ErrorLevel): void;
  reportHttpError(status: number, url: string, method: string, response?: any): void;
  reportReactError(error: Error, componentStack?: string): void;
  reportPerformanceIssue(message: string, metrics?: Record<string, number>): void;
  getErrors(): ErrorReport[];
  getErrorsByType(type: ErrorType): ErrorReport[];
  getErrorsByLevel(level: ErrorLevel): ErrorReport[];
  getErrorStats(): ErrorStats;
  clearErrors(): void;
  setUserId(userId: string): void;
  exportErrors(): string;
  onError(callback: (error: ErrorReport) => void): () => void;
  destroy(): void;
}

// 使用
import { errorMonitor } from '@/shared/kernel/error-monitor';

errorMonitor.init();
errorMonitor.reportCustom('自定义错误信息', { userId: '123' }, 'warning');
const stats = errorMonitor.getErrorStats();
```

---

## 5. UI 组件 API

### 5.1 基础组件

#### Button

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  children: React.ReactNode;
  icon?: IconName;
}

// 使用
<Button variant="primary" size="md" onClick={handleClick}>
  保存
</Button>
```

#### Card

```typescript
interface CardProps {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}
```

#### Input

```typescript
interface InputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: 'text' | 'password' | 'email' | 'number';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  error?: string;
  icon?: IconName;
  onIconClick?: () => void;
}
```

#### Tag

```typescript
interface TagProps {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
  closable?: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}
```

#### EmptyState

```typescript
interface EmptyStateProps {
  icon: IconName;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  size?: 'sm' | 'md' | 'lg';
}
```

### 5.2 图标系统

```typescript
// 支持的图标名称
type IconName =
  | 'home' | 'edit' | 'note' | 'calendar' | 'ai' | 'chat'
  | 'graph' | 'network' | 'social' | 'users' | 'voice' | 'mic'
  | 'search' | 'settings' | 'user' | 'bell' | 'menu' | 'plus'
  | 'save' | 'delete' | 'edit' | 'copy' | 'share' | 'download'
  | 'upload' | 'close' | 'check' | 'arrow-left' | 'arrow-right'
  | 'chevron-down' | 'chevron-up' | 'chevron-left' | 'chevron-right'
  | 'zoom-in' | 'zoom-out' | 'maximize' | 'minimize' | 'refresh'
  | 'bold' | 'italic' | 'underline' | 'code' | 'quote' | 'list'
  | 'list-ordered' | 'link' | 'image' | 'table' | 'heading'
  | 'eye' | 'columns' | 'file' | 'folder' | 'tag' | 'clock'
  | 'calendar' | 'star' | 'heart' | 'thumbs-up' | 'message'
  | 'send' | 'paperclip' | 'attachment' | 'more-horizontal'
  | 'more-vertical' | 'filter' | 'sort' | 'grid' | 'layout'
  | 'dashboard' | 'chart' | 'trending-up' | 'trending-down'
  | 'info' | 'warning' | 'error' | 'success' | 'help'
  | 'cursor' | 'mouse-pointer' | 'hand' | 'move' | 'drag'
  | 'play' | 'pause' | 'stop' | 'skip-forward' | 'skip-back'
  | 'volume' | 'volume-off' | 'volume-up' | 'volume-down'
  | 'wifi' | 'bluetooth' | 'battery' | 'signal'
  | 'sun' | 'moon' | 'globe' | 'map' | 'location'
  | 'phone' | 'mail' | 'message-square' | 'at-sign'
  | 'lock' | 'unlock' | 'key' | 'shield' | 'shield-check'
  | 'database' | 'server' | 'cloud' | 'cloud-upload' | 'cloud-download'
  | 'git-branch' | 'git-commit' | 'git-pull-request' | 'merge'
  | 'terminal' | 'console' | 'code-2' | 'bug' | 'zap'
  | 'rocket' | 'target' | 'flag' | 'bookmark' | 'bookmark-check'
  | 'archive' | 'inbox' | 'trash' | 'trash-2' | 'restore'
  | 'printer' | 'scissors' | 'clipboard' | 'clipboard-check'
  | 'camera' | 'video' | 'video-off' | 'image-2' | 'film'
  | 'music' | 'headphones' | 'radio' | 'mic-off'
  | 'gift' | 'award' | 'trophy' | 'medal' | 'crown'
  | 'fire' | 'sparkles' | 'star-2' | 'magic' | 'wand'
  | 'cpu' | 'processor' | 'memory' | 'hard-drive' | 'monitor'
  | 'smartphone' | 'tablet' | 'laptop' | 'watch' | 'tv'
  | 'car' | 'bike' | 'bus' | 'train' | 'plane'
  | 'coffee' | 'food' | 'drink' | 'shopping-cart' | 'bag'
  | 'briefcase' | 'building' | 'factory' | 'store' | 'bank'
  | 'graduation-cap' | 'book' | 'book-open' | 'library' | 'pen-tool'
  | 'brush' | 'palette' | 'droplet' | 'sunrise' | 'sunset'
  | 'umbrella' | 'snowflake' | 'wind' | 'cloud-rain' | 'cloud-snow'
  | 'activity' | 'pulse' | 'heart-pulse' | 'thermometer' | 'scale'
  | 'ruler' | 'compass' | 'target-2' | 'crosshair' | 'locate'
  | 'navigation' | 'navigation-2' | 'map-pin' | 'map-2' | 'globe-2'
  | 'world' | 'flag-2' | 'flag-3' | 'landmark' | 'mountain';

// 使用
<Icon name="search" size="sm" color="var(--color-primary-600)" />
```

### 5.3 反馈组件

#### Toast

```typescript
// 使用 Hook
const toast = useToast();

toast.success('保存成功');
toast.error('保存失败，请重试');
toast.warning('请注意');
toast.info('这是一条信息');

// 自定义
toast.show({
  type: 'success',
  title: '操作成功',
  description: '数据已保存',
  duration: 3000,
});
```

#### Modal

```typescript
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
}
```

---

## 6. 事件系统 API

### 6.1 事件总线 (EventBus)

```typescript
// 事件定义
const EVENTS = {
  APP: {
    LOADING_START: 'app:loading:start',
    LOADING_FINISHED: 'app:loading:finished',
    THEME_CHANGED: 'app:theme:changed',
  },
  NOTE: {
    CREATED: 'note:created',
    UPDATED: 'note:updated',
    DELETED: 'note:deleted',
    SELECTED: 'note:selected',
  },
  AI: {
    MESSAGE_SENT: 'ai:message:sent',
    MESSAGE_RECEIVED: 'ai:message:received',
    STREAMING_START: 'ai:streaming:start',
    STREAMING_END: 'ai:streaming:end',
  },
  SEARCH: {
    QUERY_CHANGED: 'search:query:changed',
    RESULTS_UPDATED: 'search:results:updated',
  },
  GRAPH: {
    NODE_SELECTED: 'graph:node:selected',
    LAYOUT_CHANGED: 'graph:layout:changed',
  },
} as const;

// 使用
import { eventBus } from '@/shared/kernel/event-bus';

// 监听事件
const unsubscribe = eventBus.on(EVENTS.NOTE.CREATED, (note) => {
  console.log('笔记创建:', note);
});

// 发送事件
eventBus.emit(EVENTS.NOTE.CREATED, note);

// 取消监听
unsubscribe();

// 一次性监听
eventBus.once(EVENTS.AI.STREAMING_END, () => {
  console.log('流式输出结束');
});
```

### 6.2 依赖注入容器 (DIContainer)

```typescript
// 服务标识
const SERVICES = {
  NOTE_REPOSITORY: 'NoteRepository',
  NOTE_SERVICE: 'NoteService',
  AI_SERVICE: 'AIService',
  CALENDAR_SERVICE: 'CalendarService',
  SEARCH_SERVICE: 'SearchService',
  EVENT_BUS: 'EventBus',
  LOGGER: 'Logger',
} as const;

// 使用
import { container } from '@/shared/kernel/di-container';

// 注册服务
container.registerInstance(SERVICES.NOTE_SERVICE, noteService);
container.registerFactory(SERVICES.AI_SERVICE, () => new AIService());

// 解析服务
const noteService = container.resolve<NoteService>(SERVICES.NOTE_SERVICE);

// 检查服务是否存在
if (container.has(SERVICES.AI_SERVICE)) {
  // ...
}

// 获取所有服务名称
const services = container.getServiceNames();
```

### 6.3 日志系统 (Logger)

```typescript
// 使用
import { logger } from '@/shared/kernel/logger';

logger.debug('调试信息', { data });
logger.info('普通信息', { userId });
logger.warn('警告信息', { potentialIssue });
logger.error('错误信息', error);
logger.fatal('致命错误', error);

// 设置日志级别
logger.setLevel('debug'); // debug | info | warn | error | fatal

// 日志格式
// [2026-08-29T10:30:00.000Z] [INFO] [NoteService] 笔记创建成功 { noteId: '123' }
```

---

## 附录

### A. 设计令牌 (Design Tokens)

```css
:root {
  /* 颜色 - 主色调 */
  --color-primary-50: #EEF2FF;
  --color-primary-100: #E0E7FF;
  --color-primary-200: #C7D2FE;
  --color-primary-300: #A5B4FC;
  --color-primary-400: #818CF8;
  --color-primary-500: #6366F1;
  --color-primary-600: #4F46E5;
  --color-primary-700: #4338CA;

  /* 颜色 - 语义色 */
  --color-success-500: #10B981;
  --color-success-600: #059669;
  --color-warning-500: #F59E0B;
  --color-warning-600: #D97706;
  --color-error-500: #EF4444;
  --color-error-600: #DC2626;

  /* 颜色 - 中性色 */
  --color-neutral-50: #F9FAFB;
  --color-neutral-100: #F3F4F6;
  --color-neutral-200: #E5E7EB;
  --color-neutral-300: #D1D5DB;
  --color-neutral-400: #9CA3AF;
  --color-neutral-500: #6B7280;
  --color-neutral-600: #4B5563;
  --color-neutral-700: #374151;
  --color-neutral-800: #1F2937;
  --color-neutral-900: #111827;

  /* 文字颜色 */
  --text-primary: #111827;
  --text-secondary: #4B5563;
  --text-tertiary: #9CA3AF;

  /* 边框 */
  --border-light: #E5E7EB;
  --border-medium: #D1D5DB;

  /* 圆角 */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* 阴影 */
  --shadow-xs: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05);
  --shadow-xl: 0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04);

  /* 间距 (8px基准) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;

  /* 字体 */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* 字体大小 */
  --text-xs: 12px;
  --text-sm: 13px;
  --text-base: 14px;
  --text-lg: 16px;
  --text-xl: 18px;
  --text-2xl: 20px;
  --text-3xl: 24px;
  --text-4xl: 30px;

  /* 动画 */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow: 350ms ease;
}
```

### B. 浏览器兼容性

| 浏览器 | 最低版本 | 说明 |
|--------|----------|------|
| Chrome | 90+ | 推荐使用 |
| Firefox | 88+ | 完整支持 |
| Safari | 14+ | 完整支持 |
| Edge | 90+ | 完整支持 |

### C. 性能预算

| 指标 | 目标 | 警告阈值 |
|------|------|----------|
| 首次加载 | < 2s | < 3s |
| LCP | < 2.5s | < 4s |
| FID | < 100ms | < 300ms |
| CLS | < 0.1 | < 0.25 |
| 主包体积 (gzip) | < 100KB | < 150KB |
| 笔记列表渲染 | < 100ms | < 200ms |
| 搜索响应 | < 200ms | < 500ms |

---

> **OneOS API 文档**
>
> 好的API是自解释的，好的文档是不需要读的。
