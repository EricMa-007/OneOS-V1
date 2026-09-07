/**
 * OneOS 应用初始化器
 */

import { logger } from './logger';
import { eventBus, EVENTS } from './event-bus';
import { container, SERVICES } from './di-container';
import { IndexedDBNoteRepository } from '../../infrastructure/indexeddb/note-repository';
import { NoteService } from '../../modules/note/services/note-service';
import { useAppStore } from '../../stores/app-store';
import { useNoteStore } from '../../stores/note-store';
import { performanceMonitor } from './performance-monitor';
import { errorMonitor } from './error-monitor';

export class AppInitializer {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) {
      logger.warn('应用已初始化，跳过重复初始化');
      return;
    }

    logger.info('OneOS 应用初始化开始');
    const startTime = performance.now();

    try {
      // 初始化监控系统（最先启动）
      this.initializeMonitoring();

      this.registerServices();
      this.loadTheme();
      await this.initializeDataLayer();
      await this.loadInitialData();
      this.registerGlobalEvents();
      this.registerKeyboardShortcuts();

      this.initialized = true;
      useAppStore.getState().setInitialized(true);

      const duration = (performance.now() - startTime).toFixed(2);
      logger.info(`OneOS 应用初始化完成，耗时 ${duration}ms`);

      // 记录初始化性能
      performanceMonitor.onMetric(() => {
        const evaluation = performanceMonitor.evaluatePerformance();
        logger.info(`性能评估: ${evaluation.grade} (${evaluation.score}分)`, evaluation.issues);
      });

      eventBus.emit(EVENTS.APP.LOADING_FINISHED, null);
    } catch (err) {
      logger.error('应用初始化失败', err);
      errorMonitor.reportReactError(err as Error, 'AppInitializer.initialize');
      useAppStore.getState().setLoading(false, '初始化失败');
      throw err;
    }
  }

  /**
   * 初始化性能监控和错误监控
   */
  private initializeMonitoring(): void {
    logger.debug('初始化监控系统');

    // 初始化错误监控
    errorMonitor.init();

    // 初始化性能监控
    performanceMonitor.init();

    // 注册错误回调，记录到日志
    errorMonitor.onError((error) => {
      if (error.level === 'critical' || error.level === 'error') {
        logger.error(`[${error.type}] ${error.message}`, error.stack);
      } else if (error.level === 'warning') {
        logger.warn(`[${error.type}] ${error.message}`);
      }
    });

    // 注册性能回调
    performanceMonitor.onMetric((metrics) => {
      if (metrics.LCP && metrics.LCP > 4000) {
        errorMonitor.reportPerformanceIssue(`LCP 过慢: ${metrics.LCP}ms`, { LCP: metrics.LCP });
      }
    });

    logger.debug('监控系统初始化完成');
  }

  private registerServices(): void {
    logger.debug('注册DI容器服务');
    const noteRepository = new IndexedDBNoteRepository();
    container.registerInstance(SERVICES.NOTE_REPOSITORY, noteRepository);
    const noteService = new NoteService(noteRepository);
    container.registerInstance(SERVICES.NOTE_SERVICE, noteService);
    container.registerInstance(SERVICES.EVENT_BUS, eventBus);
    container.registerInstance(SERVICES.LOGGER, logger);
    logger.debug('DI容器服务注册完成', container.getServiceNames());
  }

  private loadTheme(): void {
    const savedTheme = localStorage.getItem('oneos-theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      useAppStore.getState().setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      useAppStore.getState().setTheme(prefersDark ? 'dark' : 'light');
    }
  }

  private async initializeDataLayer(): Promise<void> {
    logger.debug('初始化数据层');
    const noteRepo = container.resolve<IndexedDBNoteRepository>(SERVICES.NOTE_REPOSITORY);
    await noteRepo.count();
    logger.debug('数据层初始化完成');
  }

  private async loadInitialData(): Promise<void> {
    logger.debug('加载初始数据');
    const noteStore = useNoteStore.getState();
    await Promise.all([noteStore.fetchNotes(), noteStore.fetchStats()]);
    logger.debug('初始数据加载完成', { notesCount: noteStore.notes.length });
  }

  private registerGlobalEvents(): void {
    logger.debug('注册全局事件监听');
    eventBus.on(EVENTS.NOTE.CREATED, () => useNoteStore.getState().fetchStats());
    eventBus.on(EVENTS.NOTE.DELETED, () => useNoteStore.getState().fetchStats());
    window.addEventListener('error', (event) => logger.error('全局错误', { message: event.message }));
    window.addEventListener('unhandledrejection', (event) => logger.error('未处理的Promise拒绝', { reason: event.reason }));
  }

  private registerKeyboardShortcuts(): void {
    logger.debug('注册键盘快捷键');
    document.addEventListener('keydown', (event) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? event.metaKey : event.ctrlKey;
      if (modKey && event.key === 'k') {
        event.preventDefault();
        const { commandPaletteOpen, setCommandPaletteOpen } = useAppStore.getState();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (modKey && event.key === 'n') {
        event.preventDefault();
        useNoteStore.getState().createNote({ title: '新笔记' });
      }
      if (event.key === 'Escape') {
        const { commandPaletteOpen, setCommandPaletteOpen } = useAppStore.getState();
        if (commandPaletteOpen) setCommandPaletteOpen(false);
      }
      if (modKey && event.key >= '1' && event.key <= '9') {
        const navs = ['dashboard', 'notes', 'editor', 'graph', 'calendar', 'ai', 'social', 'voice', 'settings'];
        const index = parseInt(event.key) - 1;
        if (navs[index]) {
          event.preventDefault();
          useAppStore.getState().setCurrentNav(navs[index] as unknown);
        }
      }
    });
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

export const appInitializer = new AppInitializer();
