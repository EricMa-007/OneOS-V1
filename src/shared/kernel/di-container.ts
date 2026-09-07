/**
 * OneOS 依赖注入容器（DI Container）
 * 管理服务的创建和获取，实现控制反转（IoC）
 * 
 * 设计原则：
 * - 服务通过接口定义，实现可替换
 * - 支持单例和瞬态两种生命周期
 * - 支持服务替换（测试时用Mock替换）
 * 
 * 作者：A01 崔尼蒂（首席架构师）
 */

type ServiceFactory<T = unknown> = () => T;

interface ServiceEntry<T = unknown> {
  instance?: T;
  factory?: ServiceFactory<T>;
  singleton: boolean;
}

class DIContainer {
  private services = new Map<string, ServiceEntry>();

  /**
   * 注册单例服务（首次获取时创建，之后复用）
   */
  registerSingleton<T>(name: string, factory: ServiceFactory<T>): void {
    this.services.set(name, { factory, singleton: true });
  }

  /**
   * 注册单例实例（直接提供实例）
   */
  registerInstance<T>(name: string, instance: T): void {
    this.services.set(name, { instance, singleton: true });
  }

  /**
   * 注册瞬态服务（每次获取都创建新实例）
   */
  registerTransient<T>(name: string, factory: ServiceFactory<T>): void {
    this.services.set(name, { factory, singleton: false });
  }

  /**
   * 获取服务
   */
  resolve<T>(name: string): T {
    const entry = this.services.get(name);
    if (!entry) {
      throw new Error(`[DI] 服务未注册: ${name}`);
    }

    if (entry.singleton) {
      if (!entry.instance) {
        if (!entry.factory) {
          throw new Error(`[DI] 服务 ${name} 没有工厂函数`);
        }
        entry.instance = entry.factory();
      }
      return entry.instance as T;
    }

    // 瞬态服务，每次创建新实例
    if (!entry.factory) {
      throw new Error(`[DI] 瞬态服务 ${name} 没有工厂函数`);
    }
    return entry.factory() as T;
  }

  /**
   * 尝试获取服务（不存在返回null，不抛异常）
   */
  tryResolve<T>(name: string): T | null {
    try {
      return this.resolve<T>(name);
    } catch {
      return null;
    }
  }

  /**
   * 检查服务是否已注册
   */
  has(name: string): boolean {
    return this.services.has(name);
  }

  /**
   * 替换服务（测试时用Mock替换）
   */
  replace<T>(name: string, instance: T): void {
    this.services.set(name, { instance, singleton: true });
  }

  /**
   * 移除服务
   */
  remove(name: string): void {
    this.services.delete(name);
  }

  /**
   * 清空所有服务
   */
  clear(): void {
    this.services.clear();
  }

  /**
   * 获取所有已注册服务名称
   */
  getServiceNames(): string[] {
    return Array.from(this.services.keys());
  }
}

// 全局单例
export const container = new DIContainer();

// ============================================
// 服务名称常量（集中管理）
// ============================================

export const SERVICES = {
  // 数据层
  NOTE_REPOSITORY: 'NoteRepository',
  FOLDER_REPOSITORY: 'FolderRepository',
  TAG_REPOSITORY: 'TagRepository',
  SETTINGS_REPOSITORY: 'SettingsRepository',
  CALENDAR_REPOSITORY: 'CalendarRepository',
  CONVERSATION_REPOSITORY: 'ConversationRepository',
  MESSAGE_REPOSITORY: 'MessageRepository',
  GRAPH_NODE_REPOSITORY: 'GraphNodeRepository',
  GRAPH_EDGE_REPOSITORY: 'GraphEdgeRepository',
  PERSON_REPOSITORY: 'PersonRepository',
  CIRCLE_REPOSITORY: 'CircleRepository',
  POST_REPOSITORY: 'PostRepository',
  PERSONA_REPOSITORY: 'PersonaRepository',
  BACKUP_REPOSITORY: 'BackupRepository',
  MIGRATION_REPOSITORY: 'MigrationRepository',

  // 领域服务
  NOTE_SERVICE: 'NoteService',
  SEARCH_SERVICE: 'SearchService',
  TAG_SERVICE: 'TagService',
  BACKLINK_SERVICE: 'BacklinkService',
  GRAPH_DATA_SERVICE: 'GraphDataService',
  FORCE_LAYOUT: 'ForceLayout',
  MARKDOWN_PARSER: 'MarkdownParser',
  VOICE_SERVICE: 'VoiceService',
  AI_SERVICE: 'AIService',
  RAG_SERVICE: 'RAGService',
  PERSONA_MANAGER: 'PersonaManager',
  BACKUP_SERVICE: 'BackupService',
  MIGRATION_MANAGER: 'MigrationManager',
  DATA_HEALTH_CHECKER: 'DataHealthChecker',

  // 基础设施
  EVENT_BUS: 'EventBus',
  LOGGER: 'Logger',
  INDEXEDDB: 'IndexedDB',
} as const;

// 挂载到全局（兼容旧代码）
if (typeof window !== 'undefined') {
  window.OneOSContainer = container;
  window.OneOSServices = SERVICES;
}
