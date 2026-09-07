/**
 * UniSci Platform V2 - Core System (板块10: 通用功能系统)
 * 包含: 全局状态管理 | 路由导航 | 数据持久化 | 主题系统 | UI组件库 |
 *       全局搜索 | 通知中心 | 国际化 | 错误处理 | 性能监控 | 启动引导 | 无障碍
 * 版本: 2.0.0
 */

'use strict';

// ============================================================
// 第一部分: 全局状态管理 (Global State Management)
// ============================================================

const UniSci = {
  version: '2.0.0',
  
  // 用户状态
  user: {
    isLoggedIn: true,
    currentUser: null,
    currentUserIndex: 0,
    switching: false
  },
  
  // UI状态
  ui: {
    theme: 'light',
    language: 'zh-CN',
    currentPage: 'page-home',
    pageParams: {},
    loading: false,
    modalStack: [],
    toastQueue: [],
    sidebarOpen: false
  },
  
  // 导航状态
  navigation: {
    tab: 'home',
    stack: ['page-home'],
    history: [],
    maxStackDepth: 20
  },
  
  // 通知状态
  notifications: {
    unreadCount: 3,
    list: [],
    lastFetched: null
  },
  
  // 缓存
  cache: {
    api: new Map(),
    page: new Map(),
    image: new Map()
  },
  
  // 离线状态
  offline: {
    isOnline: true,
    pendingActions: [],
    lastSync: null
  },
  
  // 性能监控
  performance: {
    startTime: Date.now(),
    metrics: {},
    fpsHistory: []
  },
  
  // 全局导航数据存储 (兼容旧版)
  _navStore: {},
  _navCounter: 0,
  
  // 事件总线
  _events: {},
  
  // 国际化词典
  i18n: {
    'zh-CN': {},
    'en-US': {}
  },
  currentLang: 'zh-CN'
};

// 事件总线
UniSci.on = function(event, callback) {
  if (!this._events[event]) this._events[event] = [];
  this._events[event].push(callback);
  return () => this.off(event, callback);
};
UniSci.off = function(event, callback) {
  if (!this._events[event]) return;
  this._events[event] = this._events[event].filter(cb => cb !== callback);
};
UniSci.emit = function(event, data) {
  if (!this._events[event]) return;
  this._events[event].forEach(cb => {
    try { cb(data); } catch(e) { console.error('[Event Error]', event, e); }
  });
};

// 全局导航数据存储 (兼容旧版API)
UniSci._store = function(data) {
  const id = 'nd' + (++this._navCounter);
  this._navStore[id] = data;
  return id;
};

// ============================================================
// 第二部分: 路由与导航系统 (Router & Navigation)
// FP-10-007
// ============================================================

const Router = {
  // 页面元数据配置
  pageConfig: {
    'page-home': { tab: 'home', isSub: false, title: '首页', requireAuth: false },
    'page-compute': { tab: 'compute', isSub: false, title: '计算', requireAuth: false },
    'page-learn': { tab: 'learn', isSub: false, title: '学习', requireAuth: false },
    'page-ai': { tab: 'ai', isSub: false, title: 'AI智能', requireAuth: false },
    'page-profile': { tab: 'profile', isSub: false, title: '我的', requireAuth: true },
    'page-job-detail': { tab: null, isSub: true, title: '任务详情', requireAuth: true },
    'page-results': { tab: null, isSub: true, title: '计算结果', requireAuth: true },
    'page-job-new': { tab: null, isSub: true, title: '新建任务', requireAuth: true },
    'page-course-detail': { tab: null, isSub: true, title: '课程详情', requireAuth: false },
    'page-lesson': { tab: null, isSub: true, title: '课时学习', requireAuth: true },
    'page-experiments': { tab: null, isSub: true, title: '虚拟实验', requireAuth: false },
    'page-ai-chat': { tab: null, isSub: true, title: 'AI对话', requireAuth: true },
    'page-knowledge-graph': { tab: null, isSub: true, title: '知识图谱', requireAuth: false },
    'page-notebook-list': { tab: null, isSub: true, title: '我的Notebook', requireAuth: true },
    'page-notebook-detail': { tab: null, isSub: true, title: 'Notebook', requireAuth: true },
    'page-workflow-editor': { tab: null, isSub: true, title: '工作流编辑器', requireAuth: true },
    'page-molecules': { tab: null, isSub: true, title: '分子建模', requireAuth: true },
    'page-materials': { tab: null, isSub: true, title: '材料数据库', requireAuth: false },
    'page-material-detail': { tab: null, isSub: true, title: '材料详情', requireAuth: false },
    'page-article-detail': { tab: null, isSub: true, title: '文章详情', requireAuth: false },
    'page-article-publish': { tab: null, isSub: true, title: '发布文章', requireAuth: true },
    'page-my-content': { tab: null, isSub: true, title: '我的内容', requireAuth: true },
    'page-settings': { tab: null, isSub: true, title: '设置', requireAuth: true },
    'page-search': { tab: null, isSub: true, title: '搜索', requireAuth: false },
    'page-notifications': { tab: null, isSub: true, title: '通知中心', requireAuth: true },
    'page-login': { tab: null, isSub: true, title: '登录', requireAuth: false }
  },
  
  // 页面生命周期回调
  _lifecycleHooks: {
    onLoad: {},
    onShow: {},
    onHide: {},
    onUnload: {}
  },
  
  // 注册页面生命周期
  onLoad(pageId, callback) { this._lifecycleHooks.onLoad[pageId] = callback; },
  onShow(pageId, callback) { this._lifecycleHooks.onShow[pageId] = callback; },
  onHide(pageId, callback) { this._lifecycleHooks.onHide[pageId] = callback; },
  onUnload(pageId, callback) { this._lifecycleHooks.onUnload[pageId] = callback; },
  
  // 触发生命周期
  _trigger(pageId, hook) {
    const cb = this._lifecycleHooks[hook] && this._lifecycleHooks[hook][pageId];
    if (cb) {
      try { cb(UniSci.ui.pageParams[pageId] || {}); } catch(e) { console.error('[Lifecycle Error]', pageId, hook, e); }
    }
  },
  
  // 1. navigateTo: 保留当前页，跳转到新页面 (压栈)
  navigateTo(pageId, data, options = {}) {
    // 兼容旧版: 如果data是字符串且以'nd'开头，从全局存储获取
    if (typeof data === 'string' && data.startsWith('nd') && UniSci._navStore[data]) {
      data = UniSci._navStore[data];
    }
    
    const config = this.pageConfig[pageId];
    if (!config) {
      console.error('[Router] 页面不存在:', pageId);
      UI.toast.error('页面不存在: ' + pageId);
      return false;
    }
    
    // 登录权限检查
    if (config.requireAuth && !UniSci.user.isLoggedIn) {
      this.navigateTo('page-login', { redirect: pageId, redirectData: data });
      return false;
    }
    
    // 返回栈深度限制
    if (UniSci.navigation.stack.length >= UniSci.navigation.maxStackDepth) {
      console.warn('[Router] 返回栈已达最大深度，自动清理早期页面');
      UniSci.navigation.stack.splice(1, 5);
    }
    
    // 触发当前页面onHide
    this._trigger(UniSci.ui.currentPage, 'onHide');
    
    // 保存参数 (同时兼容旧版currentData全局变量)
    if (data) {
      UniSci.ui.pageParams[pageId] = data;
      if (typeof currentData !== 'undefined') { try { currentData[pageId] = data; } catch(e) {} }
    }
    
    // 切换页面
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(pageId);
    if (target) {
      target.classList.add('active');
      UniSci.navigation.stack.push(pageId);
      UniSci.ui.currentPage = pageId;
      
      // 子页面隐藏底部导航和FAB
      const isSub = config.isSub;
      const nav = document.querySelector('.bottom-nav');
      const fab = document.querySelector('.fab');
      if (nav) nav.style.display = isSub ? 'none' : 'flex';
      if (fab) fab.style.display = isSub ? 'none' : 'flex';
      
      // 滚动到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // 触发生命周期
      this._trigger(pageId, 'onLoad');
      this._trigger(pageId, 'onShow');
      
      // 渲染子页面内容 (兼容旧版) - 添加异常保护，防止单个渲染函数异常导致整个页面空白
      try {
        if (typeof renderSubPage === 'function') renderSubPage(pageId);
      } catch(e) {
        console.error('[Router] renderSubPage error for', pageId, e);
      }
      try {
        if (typeof renderIcons === 'function') renderIcons();
      } catch(e) {
        console.error('[Router] renderIcons error for', pageId, e);
      }
      
      // 记录浏览历史
      UniSci.navigation.history.push({ pageId, time: Date.now() });
      if (UniSci.navigation.history.length > 100) UniSci.navigation.history.shift();
      
      UniSci.emit('navigate', { pageId, data, type: 'navigateTo' });
      return true;
    } else {
      console.error('[Router] DOM元素不存在:', pageId);
      return false;
    }
  },
  
  // 2. redirectTo: 关闭当前页，跳转到新页面 (不压栈)
  redirectTo(pageId, data) {
    if (typeof data === 'string' && data.startsWith('nd') && UniSci._navStore[data]) {
      data = UniSci._navStore[data];
    }
    const config = this.pageConfig[pageId];
    if (!config) { UI.toast.error('页面不存在'); return false; }
    
    // 触发当前页面onUnload
    this._trigger(UniSci.ui.currentPage, 'onUnload');
    
    // 替换栈顶
    if (UniSci.navigation.stack.length > 0) {
      UniSci.navigation.stack[UniSci.navigation.stack.length - 1] = pageId;
    }
    
    if (data) UniSci.ui.pageParams[pageId] = data;
    
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(pageId);
    if (target) {
      target.classList.add('active');
      UniSci.ui.currentPage = pageId;
      const isSub = config.isSub;
      const nav = document.querySelector('.bottom-nav');
      const fab = document.querySelector('.fab');
      if (nav) nav.style.display = isSub ? 'none' : 'flex';
      if (fab) fab.style.display = isSub ? 'none' : 'flex';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      this._trigger(pageId, 'onLoad');
      this._trigger(pageId, 'onShow');
      if (typeof renderSubPage === 'function') renderSubPage(pageId);
      if (typeof renderIcons === 'function') renderIcons();
      UniSci.emit('navigate', { pageId, data, type: 'redirectTo' });
      return true;
    }
    return false;
  },
  
  // 3. navigateBack: 返回上N页
  navigateBack(delta = 1) {
    if (UniSci.navigation.stack.length <= 1) {
      // 已经在首页，不执行返回
      return false;
    }
    
    // 返回拦截检查 (表单未保存等)
    const currentPage = UniSci.ui.currentPage;
    if (this._beforeUnload && this._beforeUnload(currentPage)) {
      UI.modal.confirm({
        title: '确认离开',
        content: '当前页面有未保存的更改，确定离开吗？',
        confirmText: '离开',
        cancelText: '继续编辑',
        onConfirm: () => { this._doNavigateBack(delta); }
      });
      return false;
    }
    
    return this._doNavigateBack(delta);
  },
  
  _doNavigateBack(delta) {
    // 触发当前页面onUnload
    this._trigger(UniSci.ui.currentPage, 'onUnload');
    
    // 弹出delta个页面
    for (let i = 0; i < delta && UniSci.navigation.stack.length > 1; i++) {
      UniSci.navigation.stack.pop();
    }
    
    const prev = UniSci.navigation.stack[UniSci.navigation.stack.length - 1];
    const config = this.pageConfig[prev];
    
    UniSci.ui.currentPage = prev;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(prev);
    if (target) {
      target.classList.add('active');
      const isSub = config ? config.isSub : false;
      const nav = document.querySelector('.bottom-nav');
      const fab = document.querySelector('.fab');
      if (nav) nav.style.display = isSub ? 'none' : 'flex';
      if (fab) fab.style.display = isSub ? 'none' : 'flex';
      
      // 更新底部导航激活状态
      if (config && config.tab) {
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        const tabEl = document.querySelector('.nav-item[data-page="' + config.tab + '"]');
        if (tabEl) tabEl.classList.add('active');
        UniSci.navigation.tab = config.tab;
      }
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
      this._trigger(prev, 'onShow');
      if (typeof renderSubPage === 'function') renderSubPage(prev);
      if (typeof renderIcons === 'function') renderIcons();
      UniSci.emit('navigateBack', { pageId: prev, delta });
      return true;
    }
    return false;
  },
  
  // 4. switchTab: 切换到底部Tab (清空返回栈)
  switchTab(tab) {
    const pageId = 'page-' + tab;
    const config = this.pageConfig[pageId];
    if (!config || !config.tab) { UI.toast.error('无效的Tab'); return false; }
    
    // 触发当前页面onUnload
    this._trigger(UniSci.ui.currentPage, 'onUnload');
    
    // 清空返回栈，重置为Tab页
    UniSci.navigation.stack = [pageId];
    UniSci.navigation.tab = tab;
    UniSci.ui.currentPage = pageId;
    
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(pageId);
    if (target) {
      target.classList.add('active');
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      const tabEl = document.querySelector('.nav-item[data-page="' + tab + '"]');
      if (tabEl) tabEl.classList.add('active');
      const nav = document.querySelector('.bottom-nav');
      const fab = document.querySelector('.fab');
      if (nav) nav.style.display = 'flex';
      if (fab) fab.style.display = 'flex';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      this._trigger(pageId, 'onShow');
      if (typeof renderIcons === 'function') renderIcons();
      UniSci.emit('switchTab', { tab });
      return true;
    }
    return false;
  },
  
  // 5. reLaunch: 重启应用到指定页面 (清空所有栈)
  reLaunch(pageId, data) {
    if (typeof data === 'string' && data.startsWith('nd') && UniSci._navStore[data]) {
      data = UniSci._navStore[data];
    }
    const config = this.pageConfig[pageId];
    if (!config) { UI.toast.error('页面不存在'); return false; }
    
    // 触发所有页面onUnload
    UniSci.navigation.stack.forEach(p => this._trigger(p, 'onUnload'));
    
    UniSci.navigation.stack = [pageId];
    UniSci.ui.currentPage = pageId;
    if (data) UniSci.ui.pageParams[pageId] = data;
    
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(pageId);
    if (target) {
      target.classList.add('active');
      const isSub = config.isSub;
      const nav = document.querySelector('.bottom-nav');
      const fab = document.querySelector('.fab');
      if (nav) nav.style.display = isSub ? 'none' : 'flex';
      if (fab) fab.style.display = isSub ? 'none' : 'flex';
      if (config.tab) {
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        const tabEl = document.querySelector('.nav-item[data-page="' + config.tab + '"]');
        if (tabEl) tabEl.classList.add('active');
        UniSci.navigation.tab = config.tab;
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      this._trigger(pageId, 'onLoad');
      this._trigger(pageId, 'onShow');
      if (typeof renderSubPage === 'function') renderSubPage(pageId);
      if (typeof renderIcons === 'function') renderIcons();
      UniSci.emit('reLaunch', { pageId, data });
      return true;
    }
    return false;
  },
  
  // 6. 返回拦截器设置
  setBeforeUnload(callback) { this._beforeUnload = callback; },
  clearBeforeUnload() { this._beforeUnload = null; },
  
  // 获取当前页面参数
  getParams(pageId) {
    return UniSci.ui.pageParams[pageId || UniSci.ui.currentPage] || {};
  },
  
  // 返回到指定页面
  navigateBackTo(pageId) {
    const index = UniSci.navigation.stack.lastIndexOf(pageId);
    if (index === -1) {
      // 不在栈中，用redirectTo
      return this.redirectTo(pageId);
    }
    const delta = UniSci.navigation.stack.length - 1 - index;
    return this.navigateBack(delta);
  }
};

// 兼容旧版全局函数
window.navigateTo = function(pageId, data) { return Router.navigateTo(pageId, data); };
window.goBack = function(delta) { return Router.navigateBack(delta || 1); };
window.switchTab = function(tab) { return Router.switchTab(tab); };
window.redirectTo = function(pageId, data) { return Router.redirectTo(pageId, data); };
window.reLaunch = function(pageId, data) { return Router.reLaunch(pageId, data); };
window._store = function(data) { return UniSci._store(data); };
window._navStore = UniSci._navStore;

// 物理返回键 (移动端)
document.addEventListener('backbutton', function(e) {
  e.preventDefault();
  Router.navigateBack(1);
}, false);

// 键盘ESC返回
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    // 先关闭最上层弹窗
    if (UniSci.ui.modalStack.length > 0) {
      UI.modal.closeTop();
    } else if (UniSci.navigation.stack.length > 1) {
      Router.navigateBack(1);
    }
  }
});

// ============================================================
// 第三部分: 数据持久化与缓存 (Data Persistence & Cache)
// FP-10-008
// ============================================================

const Storage = {
  // LocalStorage 封装
  local: {
    set(key, value) {
      try {
        localStorage.setItem('unisci_' + key, JSON.stringify(value));
        return true;
      } catch(e) {
        console.error('[Storage] LocalStorage set error:', e);
        return false;
      }
    },
    get(key, defaultValue = null) {
      try {
        const item = localStorage.getItem('unisci_' + key);
        return item ? JSON.parse(item) : defaultValue;
      } catch(e) {
        return defaultValue;
      }
    },
    remove(key) { localStorage.removeItem('unisci_' + key); },
    clear() {
      Object.keys(localStorage).filter(k => k.startsWith('unisci_')).forEach(k => localStorage.removeItem(k));
    },
    size() {
      let total = 0;
      for (let key in localStorage) {
        if (key.startsWith('unisci_')) total += localStorage[key].length * 2;
      }
      return total; // bytes
    }
  },
  
  // SessionStorage 封装
  session: {
    set(key, value) {
      try { sessionStorage.setItem('unisci_' + key, JSON.stringify(value)); return true; }
      catch(e) { return false; }
    },
    get(key, defaultValue = null) {
      try {
        const item = sessionStorage.getItem('unisci_' + key);
        return item ? JSON.parse(item) : defaultValue;
      } catch(e) { return defaultValue; }
    },
    remove(key) { sessionStorage.removeItem('unisci_' + key); },
    clear() {
      Object.keys(sessionStorage).filter(k => k.startsWith('unisci_')).forEach(k => sessionStorage.removeItem(k));
    }
  },
  
  // IndexedDB 封装 (大量结构化数据)
  db: {
    _db: null,
    _dbName: 'UniSciDB',
    _version: 1,
    
    async init() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this._dbName, this._version);
        request.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains('notebooks')) {
            db.createObjectStore('notebooks', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('calculations')) {
            db.createObjectStore('calculations', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('workflows')) {
            db.createObjectStore('workflows', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('molecules')) {
            db.createObjectStore('molecules', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('cache')) {
            const store = db.createObjectStore('cache', { keyPath: 'key' });
            store.createIndex('timestamp', 'timestamp', { unique: false });
          }
        };
        request.onsuccess = (e) => { this._db = e.target.result; resolve(this._db); };
        request.onerror = (e) => reject(e.target.error);
      });
    },
    
    async put(storeName, data) {
      if (!this._db) await this.init();
      return new Promise((resolve, reject) => {
        const tx = this._db.transaction(storeName, 'readwrite');
        tx.objectStore(storeName).put(data);
        tx.oncomplete = () => resolve(true);
        tx.onerror = (e) => reject(e.target.error);
      });
    },
    
    async get(storeName, key) {
      if (!this._db) await this.init();
      return new Promise((resolve, reject) => {
        const tx = this._db.transaction(storeName, 'readonly');
        const request = tx.objectStore(storeName).get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = (e) => reject(e.target.error);
      });
    },
    
    async getAll(storeName) {
      if (!this._db) await this.init();
      return new Promise((resolve, reject) => {
        const tx = this._db.transaction(storeName, 'readonly');
        const request = tx.objectStore(storeName).getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = (e) => reject(e.target.error);
      });
    },
    
    async delete(storeName, key) {
      if (!this._db) await this.init();
      return new Promise((resolve, reject) => {
        const tx = this._db.transaction(storeName, 'readwrite');
        tx.objectStore(storeName).delete(key);
        tx.oncomplete = () => resolve(true);
        tx.onerror = (e) => reject(e.target.error);
      });
    },
    
    async clear(storeName) {
      if (!this._db) await this.init();
      return new Promise((resolve, reject) => {
        const tx = this._db.transaction(storeName, 'readwrite');
        tx.objectStore(storeName).clear();
        tx.oncomplete = () => resolve(true);
        tx.onerror = (e) => reject(e.target.error);
      });
    }
  },
  
  // API响应缓存
  apiCache: {
    _cache: new Map(),
    _maxSize: 100,
    _ttl: 5 * 60 * 1000, // 5分钟
    
    set(url, data) {
      if (this._cache.size >= this._maxSize) {
        const firstKey = this._cache.keys().next().value;
        this._cache.delete(firstKey);
      }
      this._cache.set(url, { data, timestamp: Date.now() });
    },
    
    get(url) {
      const entry = this._cache.get(url);
      if (!entry) return null;
      if (Date.now() - entry.timestamp > this._ttl) {
        this._cache.delete(url);
        return null;
      }
      return entry.data;
    },
    
    invalidate(url) { this._cache.delete(url); },
    invalidatePattern(pattern) {
      for (const key of this._cache.keys()) {
        if (key.includes(pattern)) this._cache.delete(key);
      }
    },
    clear() { this._cache.clear(); }
  },
  
  // 离线操作队列
  offlineQueue: {
    _queue: [],
    
    add(action) {
      this._queue.push({ ...action, timestamp: Date.now(), retries: 0 });
      Storage.local.set('offline_queue', this._queue);
    },
    
    async process() {
      if (!UniSci.offline.isOnline) return;
      const pending = [...this._queue];
      for (const action of pending) {
        try {
          await action.execute();
          this._queue = this._queue.filter(a => a !== action);
        } catch(e) {
          action.retries++;
          if (action.retries >= 3) {
            console.error('[OfflineQueue] 操作失败3次，移除:', action);
            this._queue = this._queue.filter(a => a !== action);
          }
        }
      }
      Storage.local.set('offline_queue', this._queue);
    },
    
    load() {
      this._queue = Storage.local.get('offline_queue', []);
    },
    
    size() { return this._queue.length; }
  },
  
  // 缓存清理
  async clearAll() {
    this.local.clear();
    this.session.clear();
    this.apiCache.clear();
    try {
      await this.db.clear('cache');
    } catch(e) {}
  },
  
  // 获取缓存大小
  async getCacheSize() {
    const localSize = this.local.size();
    let idbSize = 0;
    try {
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        idbSize = estimate.usage || 0;
      }
    } catch(e) {}
    return { local: localSize, indexedDB: idbSize, total: localSize + idbSize };
  }
};

// 离线状态监听
window.addEventListener('online', function() {
  UniSci.offline.isOnline = true;
  UI.toast.success('网络已连接，正在同步数据...');
  Storage.offlineQueue.process();
  UniSci.emit('online');
});
window.addEventListener('offline', function() {
  UniSci.offline.isOnline = false;
  UI.toast.warning('网络已断开，部分功能不可用');
  UniSci.emit('offline');
});

// ============================================================
// 第四部分: 主题系统 (Theme System)
// FP-10-009
// ============================================================

const Theme = {
  current: 'light',
  
  // 主题变量定义
  themes: {
    light: {
      '--bg': '#f0f4f8',
      '--bg-card': '#ffffff',
      '--bg-secondary': '#f7f9fc',
      '--text': '#1e293b',
      '--text2': '#64748b',
      '--text3': '#94a3b8',
      '--primary': '#ff6b4a',
      '--primary2': '#ff8c6b',
      '--blue': '#5ba3d9',
      '--blue2': '#7ec0e8',
      '--green': '#5ccf8e',
      '--green2': '#7edda8',
      '--purple': '#9b7ed8',
      '--purple2': '#b8a0e8',
      '--yellow': '#ffc857',
      '--orange': '#ff9f43',
      '--red': '#ef4444',
      '--border': '#e2e8f0',
      '--border-light': '#f1f5f9',
      '--shadow': 'rgba(0,0,0,0.06)',
      '--shadow-md': 'rgba(0,0,0,0.1)',
      '--overlay': 'rgba(30,41,59,0.5)',
      '--code-bg': '#1e293b',
      '--code-text': '#a5f3fc'
    },
    dark: {
      '--bg': '#0f172a',
      '--bg-card': '#1e293b',
      '--bg-secondary': '#334155',
      '--text': '#f1f5f9',
      '--text2': '#94a3b8',
      '--text3': '#64748b',
      '--primary': '#ff8c6b',
      '--primary2': '#ff6b4a',
      '--blue': '#7ec0e8',
      '--blue2': '#5ba3d9',
      '--green': '#7edda8',
      '--green2': '#5ccf8e',
      '--purple': '#b8a0e8',
      '--purple2': '#9b7ed8',
      '--yellow': '#ffd870',
      '--orange': '#ffb066',
      '--red': '#f87171',
      '--border': '#334155',
      '--border-light': '#1e293b',
      '--shadow': 'rgba(0,0,0,0.3)',
      '--shadow-md': 'rgba(0,0,0,0.4)',
      '--overlay': 'rgba(0,0,0,0.7)',
      '--code-bg': '#0f172a',
      '--code-text': '#67e8f9'
    }
  },
  
  // 自定义主题
  customTheme: null,
  
  // 应用主题
  apply(themeName) {
    let theme = this.themes[themeName];
    if (!theme && themeName === 'custom' && this.customTheme) {
      theme = this.customTheme;
    }
    if (!theme) {
      console.error('[Theme] 主题不存在:', themeName);
      return;
    }
    
    const root = document.documentElement;
    Object.entries(theme).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    
    this.current = themeName;
    document.body.setAttribute('data-theme', themeName);
    Storage.local.set('theme', themeName);
    UniSci.ui.theme = themeName;
    UniSci.emit('themeChange', themeName);
  },
  
  // 切换主题
  toggle() {
    const next = this.current === 'light' ? 'dark' : 'light';
    this.apply(next);
    UI.toast.success(next === 'dark' ? '已切换到深色模式' : '已切换到浅色模式');
  },
  
  // 设置自定义主题
  setCustom(colors) {
    this.customTheme = { ...this.themes.light, ...colors };
    this.apply('custom');
    Storage.local.set('customTheme', colors);
  },
  
  // 跟随系统
  followSystem() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.apply(prefersDark ? 'dark' : 'light');
    
    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (Storage.local.get('theme_follow_system', false)) {
        this.apply(e.matches ? 'dark' : 'light');
      }
    });
  },
  
  // 初始化
  init() {
    const savedTheme = Storage.local.get('theme', 'light');
    const followSystem = Storage.local.get('theme_follow_system', false);
    
    if (followSystem) {
      this.followSystem();
    } else if (savedTheme === 'custom') {
      const customColors = Storage.local.get('customTheme', null);
      if (customColors) {
        this.customTheme = { ...this.themes.light, ...customColors };
        this.apply('custom');
      } else {
        this.apply('light');
      }
    } else {
      this.apply(savedTheme || 'light');
    }
  }
};

// 暴露到全局
window.UniSci = UniSci;
window.Router = Router;
window.Storage = Storage;
window.Theme = Theme;

// ============================================================
// 第五部分: UI组件库 (UI Component Library)
// FP-10-003/004/005/006
// ============================================================

const UI = {
  // ===== Toast 系统 (FP-10-006) =====
  toast: {
    _container: null,
    _queue: [],
    _maxVisible: 3,
    
    _init() {
      if (this._container) return;
      this._container = document.createElement('div');
      this._container.id = 'toast-container';
      this._container.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:10000;display:flex;flex-direction:column;gap:8px;pointer-events:none;width:90%;max-width:400px';
      document.body.appendChild(this._container);
    },
    
    _create(config) {
      const { type = 'info', message = '', duration = 2500, action = null, position = 'top' } = config;
      
      const icons = {
        success: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
        error: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
        warning: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
        info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
        loading: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation:unisci-spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>'
      };
      
      const colors = {
        success: 'background:linear-gradient(135deg,#5ccf8e,#7edda8);color:#fff',
        error: 'background:linear-gradient(135deg,#ef4444,#f87171);color:#fff',
        warning: 'background:linear-gradient(135deg,#ff9f43,#ffc857);color:#fff',
        info: 'background:linear-gradient(135deg,#5ba3d9,#7ec0e8);color:#fff',
        loading: 'background:linear-gradient(135deg,#64748b,#94a3b8);color:#fff'
      };
      
      const el = document.createElement('div');
      el.className = 'unisci-toast unisci-toast-' + type;
      el.style.cssText = colors[type] + ';padding:12px 16px;border-radius:14px;display:flex;align-items:center;gap:10px;font-size:14px;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,0.15);pointer-events:auto;opacity:0;transform:translateY(-20px);transition:all 0.3s cubic-bezier(0.4,0,0.2,1);max-width:100%;word-break:break-word';
      
      let html = '<span style="flex-shrink:0;display:flex;align-items:center">' + (icons[type] || icons.info) + '</span>';
      html += '<span style="flex:1;min-width:0">' + message + '</span>';
      if (action) {
        html += '<button style="background:rgba(255,255,255,0.25);border:none;color:#fff;padding:4px 10px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;flex-shrink:0" data-toast-action>' + action.text + '</button>';
      }
      if (type !== 'loading') {
        html += '<button style="background:none;border:none;color:rgba(255,255,255,0.7);cursor:pointer;padding:0;flex-shrink:0;display:flex;align-items:center" data-toast-close><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>';
      }
      el.innerHTML = html;
      
      // 事件
      const closeBtn = el.querySelector('[data-toast-close]');
      if (closeBtn) closeBtn.addEventListener('click', () => this._remove(el));
      const actionBtn = el.querySelector('[data-toast-action]');
      if (actionBtn && action && action.onClick) {
        actionBtn.addEventListener('click', () => { action.onClick(); this._remove(el); });
      }
      
      return { el, duration, type };
    },
    
    _show(config) {
      this._init();
      const item = this._create(config);
      this._container.appendChild(item.el);
      
      // 入场动画
      requestAnimationFrame(() => {
        item.el.style.opacity = '1';
        item.el.style.transform = 'translateY(0)';
      });
      
      // loading类型不自动关闭
      if (item.type !== 'loading' && item.duration > 0) {
        setTimeout(() => this._remove(item.el), item.duration);
      }
      
      return item.el;
    },
    
    _remove(el) {
      if (!el || !el.parentNode) return;
      el.style.opacity = '0';
      el.style.transform = 'translateY(-20px)';
      setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 300);
    },
    
    // 公开API
    show(message, options = {}) { return this._show({ message, ...options }); },
    success(message, options = {}) { return this._show({ type: 'success', message, duration: 2000, ...options }); },
    error(message, options = {}) { return this._show({ type: 'error', message, duration: 3000, ...options }); },
    warning(message, options = {}) { return this._show({ type: 'warning', message, duration: 3000, ...options }); },
    info(message, options = {}) { return this._show({ type: 'info', message, duration: 2000, ...options }); },
    loading(message = '加载中...') { return this._show({ type: 'loading', message, duration: 0 }); },
    close(el) { if (el) this._remove(el); else this._container.innerHTML = ''; },
    
    // 可操作Toast (如撤销)
    action(message, actionText, onAction, options = {}) {
      return this._show({ type: 'info', message, duration: 4000, action: { text: actionText, onClick: onAction }, ...options });
    }
  },
  
  // ===== 加载组件 (FP-10-003) =====
  loading: {
    // 全屏加载
    fullscreen(message = '加载中...') {
      let el = document.getElementById('unisci-loading-fullscreen');
      if (!el) {
        el = document.createElement('div');
        el.id = 'unisci-loading-fullscreen';
        el.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(240,244,248,0.95);backdrop-filter:blur(10px);z-index:9998;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px';
        document.body.appendChild(el);
      }
      el.innerHTML = '<div style="width:56px;height:56px;border:4px solid rgba(91,163,217,0.2);border-top-color:#5ba3d9;border-radius:50%;animation:unisci-spin 0.8s linear infinite"></div><div style="font-size:15px;font-weight:600;color:#64748b">' + message + '</div>';
      el.style.display = 'flex';
      return el;
    },
    
    hideFullscreen() {
      const el = document.getElementById('unisci-loading-fullscreen');
      if (el) el.style.display = 'none';
    },
    
    // 骨架屏生成
    skeleton(count = 3, type = 'card') {
      let html = '';
      for (let i = 0; i < count; i++) {
        if (type === 'card') {
          html += '<div style="background:var(--bg-card);border-radius:16px;padding:16px;margin-bottom:12px"><div style="height:16px;width:60%;background:linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%);background-size:200% 100%;animation:unisci-shimmer 1.5s infinite;border-radius:6px;margin-bottom:10px"></div><div style="height:12px;width:90%;background:linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%);background-size:200% 100%;animation:unisci-shimmer 1.5s infinite;border-radius:4px;margin-bottom:6px"></div><div style="height:12px;width:70%;background:linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%);background-size:200% 100%;animation:unisci-shimmer 1.5s infinite;border-radius:4px"></div></div>';
        } else if (type === 'list') {
          html += '<div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border-light)"><div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%);background-size:200% 100%;animation:unisci-shimmer 1.5s infinite;flex-shrink:0"></div><div style="flex:1"><div style="height:14px;width:50%;background:linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%);background-size:200% 100%;animation:unisci-shimmer 1.5s infinite;border-radius:4px;margin-bottom:6px"></div><div style="height:12px;width:80%;background:linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%);background-size:200% 100%;animation:unisci-shimmer 1.5s infinite;border-radius:4px"></div></div></div>';
        } else if (type === 'avatar') {
          html += '<div style="display:flex;align-items:center;gap:12px;padding:8px 0"><div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%);background-size:200% 100%;animation:unisci-shimmer 1.5s infinite;flex-shrink:0"></div><div style="flex:1"><div style="height:14px;width:40%;background:linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%);background-size:200% 100%;animation:unisci-shimmer 1.5s infinite;border-radius:4px;margin-bottom:6px"></div><div style="height:12px;width:60%;background:linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%);background-size:200% 100%;animation:unisci-shimmer 1.5s infinite;border-radius:4px"></div></div></div>';
        }
      }
      return html;
    },
    
    // 旋转加载器 (小尺寸)
    spinner(size = 20, color = '#5ba3d9') {
      return '<div style="width:' + size + 'px;height:' + size + 'px;border:' + Math.max(2, size/8) + 'px solid ' + color + '22;border-top-color:' + color + ';border-radius:50%;animation:unisci-spin 0.8s linear infinite;display:inline-block"></div>';
    },
    
    // 脉冲点 (文本加载)
    pulseDots(color = '#64748b') {
      return '<span style="display:inline-flex;gap:3px;align-items:center"><span style="width:6px;height:6px;border-radius:50%;background:' + color + ';animation:unisci-pulse 1.4s infinite ease-in-out both"></span><span style="width:6px;height:6px;border-radius:50%;background:' + color + ';animation:unisci-pulse 1.4s infinite ease-in-out both;animation-delay:0.16s"></span><span style="width:6px;height:6px;border-radius:50%;background:' + color + ';animation:unisci-pulse 1.4s infinite ease-in-out both;animation-delay:0.32s"></span></span>';
    },
    
    // 进度条
    progress(percent = 0, color = null) {
      const c = color || (percent >= 80 ? '#5ccf8e' : percent >= 50 ? '#5ba3d9' : percent >= 20 ? '#ff9f43' : '#9b7ed8');
      return '<div style="width:100%;height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden"><div style="height:100%;width:' + percent + '%;background:linear-gradient(90deg,' + c + ',' + c + 'cc);border-radius:4px;transition:width 0.3s ease"></div></div>';
    }
  },
  
  // ===== 错误与空状态组件 (FP-10-004) =====
  state: {
    // 错误状态
    error(type = 'unknown', options = {}) {
      const configs = {
        network: { icon: 'wifi-off', title: '网络连接失败', desc: '请检查网络连接后重试', action: '重试', actionIcon: 'refresh-cw' },
        server: { icon: 'server-off', title: '服务暂时不可用', desc: '服务器开小差了，请稍后再试', action: '重试', actionIcon: 'refresh-cw' },
        '404': { icon: 'search-x', title: '页面不存在', desc: '您访问的页面已被删除或不存在', action: '返回首页', actionIcon: 'home' },
        '403': { icon: 'lock', title: '没有访问权限', desc: '您没有权限访问此内容', action: '申请权限', actionIcon: 'key' },
        timeout: { icon: 'clock', title: '加载超时', desc: '网络较慢，加载时间过长', action: '重试', actionIcon: 'refresh-cw' },
        data: { icon: 'alert-triangle', title: '数据异常', desc: '数据格式错误或已损坏', action: '反馈问题', actionIcon: 'message-square' },
        unknown: { icon: 'alert-circle', title: '出了点问题', desc: '发生未知错误，请稍后再试', action: '重试', actionIcon: 'refresh-cw' }
      };
      const cfg = configs[type] || configs.unknown;
      const onAction = options.onAction || (() => location.reload());
      
      return '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 24px;text-align:center"><div style="width:72px;height:72px;background:linear-gradient(135deg,#fef3c7,#fde68a);border-radius:24px;display:flex;align-items:center;justify-content:center;margin-bottom:16px;box-shadow:0 8px 24px rgba(255,193,7,0.2)"><i data-lucide="' + cfg.icon + '" style="width:36px;height:36px;color:#f59e0b"></i></div><h3 style="font-size:18px;font-weight:800;color:var(--text);margin:0 0 8px 0">' + cfg.title + '</h3><p style="font-size:14px;color:var(--text2);margin:0 0 24px 0;max-width:280px">' + (options.desc || cfg.desc) + '</p><button onclick="(' + onAction.toString() + ')()" style="padding:12px 28px;background:linear-gradient(135deg,var(--primary),var(--primary2));color:#fff;border:none;border-radius:14px;font-size:14px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:8px;box-shadow:0 4px 12px rgba(255,107,74,0.3)"><i data-lucide="' + cfg.actionIcon + '" style="width:16px;height:16px"></i>' + (options.actionText || cfg.action) + '</button></div>';
    },
    
    // 空状态
    empty(type = 'default', options = {}) {
      const configs = {
        default: { icon: 'inbox', title: '暂无内容', desc: '这里还没有内容', action: null },
        search: { icon: 'search', title: '未找到相关内容', desc: '试试其他关键词或筛选条件', action: '清除搜索' },
        notification: { icon: 'bell', title: '暂无通知', desc: '有新通知时会在这里显示', action: null },
        favorite: { icon: 'star', title: '还没有收藏', desc: '浏览内容时点击收藏按钮', action: '去探索' },
        history: { icon: 'clock', title: '暂无历史记录', desc: '您的浏览和操作记录会在这里显示', action: '去探索' },
        data: { icon: 'database', title: '暂无数据', desc: '点击下方按钮创建第一条数据', action: '新建' },
        offline: { icon: 'wifi-off', title: '当前处于离线状态', desc: '部分功能不可用，连接网络后恢复', action: '检查网络' },
        message: { icon: 'message-square', title: '暂无消息', desc: '开始对话吧', action: '发消息' }
      };
      const cfg = configs[type] || configs.default;
      
      let html = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 24px;text-align:center">';
      html += '<div style="width:64px;height:64px;background:linear-gradient(135deg,#e0e7ff,#c7d2fe);border-radius:20px;display:flex;align-items:center;justify-content:center;margin-bottom:14px"><i data-lucide="' + cfg.icon + '" style="width:32px;height:32px;color:#6366f1"></i></div>';
      html += '<h3 style="font-size:16px;font-weight:700;color:var(--text);margin:0 0 6px 0">' + (options.title || cfg.title) + '</h3>';
      html += '<p style="font-size:13px;color:var(--text3);margin:0 0 20px 0;max-width:240px">' + (options.desc || cfg.desc) + '</p>';
      if (cfg.action || options.actionText) {
        html += '<button onclick="' + (options.onAction ? '(' + options.onAction.toString() + ')()' : 'void(0)') + '" style="padding:10px 24px;background:linear-gradient(135deg,var(--blue),var(--blue2));color:#fff;border:none;border-radius:12px;font-size:13px;font-weight:700;cursor:pointer">' + (options.actionText || cfg.action) + '</button>';
      }
      html += '</div>';
      return html;
    }
  },
  
  // ===== 弹窗与选择器 (FP-10-005) =====
  modal: {
    _zIndex: 1000,
    
    // 确认弹窗
    confirm(options) {
      const { title = '确认', content = '', confirmText = '确定', cancelText = '取消', type = 'default', onConfirm, onCancel } = options;
      const colors = {
        default: 'var(--primary)',
        danger: '#ef4444',
        warning: '#f59e0b',
        success: '#5ccf8e'
      };
      const c = colors[type] || colors.default;
      
      const id = 'unisci-modal-' + Date.now();
      const overlay = document.createElement('div');
      overlay.id = id;
      overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15,23,42,0.6);backdrop-filter:blur(4px);z-index:' + (++this._zIndex) + ';display:flex;align-items:center;justify-content:center;padding:24px;opacity:0;transition:opacity 0.2s ease';
      
      overlay.innerHTML = '<div style="background:var(--bg-card);border-radius:20px;padding:24px;max-width:340px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.2);transform:scale(0.9);transition:transform 0.2s cubic-bezier(0.34,1.56,0.64,1)"><div style="display:flex;align-items:center;gap:12px;margin-bottom:16px"><div style="width:40px;height:40px;border-radius:12px;background:' + c + '18;display:flex;align-items:center;justify-content:center;flex-shrink:0"><i data-lucide="alert-circle" style="width:20px;height:20px;color:' + c + '"></i></div><h3 style="font-size:17px;font-weight:800;color:var(--text);margin:0">' + title + '</h3></div><p style="font-size:14px;color:var(--text2);margin:0 0 24px 0;line-height:1.6">' + content + '</p><div style="display:flex;gap:12px"><button data-modal-cancel style="flex:1;padding:12px;background:var(--bg-secondary);color:var(--text2);border:none;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer">' + cancelText + '</button><button data-modal-confirm style="flex:1;padding:12px;background:linear-gradient(135deg,' + c + ',' + c + 'cc);color:#fff;border:none;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 4px 12px ' + c + '33">' + confirmText + '</button></div></div>';
      
      document.body.appendChild(overlay);
      UniSci.ui.modalStack.push(id);
      
      requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        overlay.querySelector('div').style.transform = 'scale(1)';
        if (typeof renderIcons === 'function') renderIcons();
      });
      
      const close = (result) => {
        overlay.style.opacity = '0';
        overlay.querySelector('div').style.transform = 'scale(0.9)';
        setTimeout(() => {
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
          UniSci.ui.modalStack = UniSci.ui.modalStack.filter(m => m !== id);
        }, 200);
        if (result && onConfirm) onConfirm();
        if (!result && onCancel) onCancel();
      };
      
      overlay.querySelector('[data-modal-confirm]').addEventListener('click', () => close(true));
      overlay.querySelector('[data-modal-cancel]').addEventListener('click', () => close(false));
      overlay.addEventListener('click', (e) => { if (e.target === overlay) close(false); });
      
      return { close: () => close(false), confirm: () => close(true) };
    },
    
    // 输入弹窗
    prompt(options) {
      const { title = '输入', content = '', placeholder = '请输入', defaultValue = '', confirmText = '确定', cancelText = '取消', inputType = 'text', onConfirm, onCancel } = options;
      
      const id = 'unisci-prompt-' + Date.now();
      const overlay = document.createElement('div');
      overlay.id = id;
      overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15,23,42,0.6);backdrop-filter:blur(4px);z-index:' + (++this._zIndex) + ';display:flex;align-items:center;justify-content:center;padding:24px;opacity:0;transition:opacity 0.2s ease';
      
      overlay.innerHTML = '<div style="background:var(--bg-card);border-radius:20px;padding:24px;max-width:340px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.2);transform:scale(0.9);transition:transform 0.2s cubic-bezier(0.34,1.56,0.64,1)"><h3 style="font-size:17px;font-weight:800;color:var(--text);margin:0 0 8px 0">' + title + '</h3>' + (content ? '<p style="font-size:13px;color:var(--text2);margin:0 0 16px 0">' + content + '</p>' : '') + '<input data-prompt-input type="' + inputType + '" placeholder="' + placeholder + '" value="' + defaultValue + '" style="width:100%;padding:12px 14px;border:2px solid var(--border);border-radius:12px;font-size:14px;background:var(--bg-secondary);color:var(--text);margin-bottom:20px;outline:none;transition:border-color 0.2s;box-sizing:border-box" onfocus="this.style.borderColor=\'var(--primary)\'" onblur="this.style.borderColor=\'var(--border)\'"><div style="display:flex;gap:12px"><button data-prompt-cancel style="flex:1;padding:12px;background:var(--bg-secondary);color:var(--text2);border:none;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer">' + cancelText + '</button><button data-prompt-confirm style="flex:1;padding:12px;background:linear-gradient(135deg,var(--primary),var(--primary2));color:#fff;border:none;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 4px 12px rgba(255,107,74,0.3)">' + confirmText + '</button></div></div>';
      
      document.body.appendChild(overlay);
      UniSci.ui.modalStack.push(id);
      
      requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        overlay.querySelector('div').style.transform = 'scale(1)';
        const input = overlay.querySelector('[data-prompt-input]');
        input.focus();
        input.select();
      });
      
      const close = (result, value) => {
        overlay.style.opacity = '0';
        overlay.querySelector('div').style.transform = 'scale(0.9)';
        setTimeout(() => {
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
          UniSci.ui.modalStack = UniSci.ui.modalStack.filter(m => m !== id);
        }, 200);
        if (result && onConfirm) onConfirm(value);
        if (!result && onCancel) onCancel();
      };
      
      const input = overlay.querySelector('[data-prompt-input]');
      overlay.querySelector('[data-prompt-confirm]').addEventListener('click', () => close(true, input.value));
      overlay.querySelector('[data-prompt-cancel]').addEventListener('click', () => close(false));
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') close(true, input.value); if (e.key === 'Escape') close(false); });
      overlay.addEventListener('click', (e) => { if (e.target === overlay) close(false); });
      
      return { close: () => close(false), getValue: () => input.value };
    },
    
    // 选择弹窗 (单选/多选)
    select(options) {
      const { title = '选择', items = [], multiple = false, selected = [], confirmText = '确定', cancelText = '取消', onConfirm, onCancel } = options;
      
      const id = 'unisci-select-' + Date.now();
      const overlay = document.createElement('div');
      overlay.id = id;
      overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15,23,42,0.6);backdrop-filter:blur(4px);z-index:' + (++this._zIndex) + ';display:flex;align-items:flex-end;justify-content:center;opacity:0;transition:opacity 0.2s ease';
      
      let selectedSet = new Set(selected);
      
      const renderItems = () => items.map((item, index) => {
        const isSelected = selectedSet.has(item.value !== undefined ? item.value : item);
        const label = item.label !== undefined ? item.label : item;
        const icon = item.icon ? '<i data-lucide="' + item.icon + '" style="width:18px;height:18px;color:var(--text2)"></i>' : '';
        return '<div data-select-item="' + index + '" style="display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:12px;cursor:pointer;transition:background 0.15s;background:' + (isSelected ? 'var(--primary)12' : 'transparent') + '" onmouseover="this.style.background=\'' + (isSelected ? 'var(--primary)18' : 'var(--bg-secondary)') + '\'" onmouseout="this.style.background=\'' + (isSelected ? 'var(--primary)12' : 'transparent') + '\'">' + icon + '<span style="flex:1;font-size:14px;font-weight:600;color:var(--text)">' + label + '</span>' + (multiple ? '<div style="width:22px;height:22px;border:2px solid ' + (isSelected ? 'var(--primary)' : 'var(--border)') + ';border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:' + (isSelected ? 'var(--primary)' : 'transparent') + '">' + (isSelected ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' : '') + '</div>' : (isSelected ? '<i data-lucide="check" style="width:18px;height:18px;color:var(--primary)"></i>' : '')) + '</div>';
      }).join('');
      
      overlay.innerHTML = '<div data-select-panel style="background:var(--bg-card);border-radius:20px 20px 0 0;padding:20px;max-width:500px;width:100%;max-height:80vh;display:flex;flex-direction:column;transform:translateY(100%);transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1)"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px"><h3 style="font-size:17px;font-weight:800;color:var(--text);margin:0">' + title + '</h3><button data-select-close style="background:none;border:none;color:var(--text3);cursor:pointer;padding:4px"><i data-lucide="x" style="width:20px;height:20px"></i></button></div><div data-select-list style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:4px;margin-bottom:16px">' + renderItems() + '</div><div style="display:flex;gap:12px"><button data-select-cancel style="flex:1;padding:12px;background:var(--bg-secondary);color:var(--text2);border:none;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer">' + cancelText + '</button><button data-select-confirm style="flex:2;padding:12px;background:linear-gradient(135deg,var(--primary),var(--primary2));color:#fff;border:none;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 4px 12px rgba(255,107,74,0.3)">' + confirmText + (multiple ? ' (<span data-select-count>' + selectedSet.size + '</span>)' : '') + '</button></div></div>';
      
      document.body.appendChild(overlay);
      UniSci.ui.modalStack.push(id);
      
      requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        overlay.querySelector('[data-select-panel]').style.transform = 'translateY(0)';
        if (typeof renderIcons === 'function') renderIcons();
      });
      
      const list = overlay.querySelector('[data-select-list]');
      list.addEventListener('click', (e) => {
        const itemEl = e.target.closest('[data-select-item]');
        if (!itemEl) return;
        const index = parseInt(itemEl.getAttribute('data-select-item'));
        const item = items[index];
        const value = item.value !== undefined ? item.value : item;
        
        if (multiple) {
          if (selectedSet.has(value)) selectedSet.delete(value);
          else selectedSet.add(value);
          list.innerHTML = renderItems();
          overlay.querySelector('[data-select-count]').textContent = selectedSet.size;
          if (typeof renderIcons === 'function') renderIcons();
        } else {
          selectedSet = new Set([value]);
          close(true, value);
        }
      });
      
      const close = (result, value) => {
        overlay.style.opacity = '0';
        overlay.querySelector('[data-select-panel]').style.transform = 'translateY(100%)';
        setTimeout(() => {
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
          UniSci.ui.modalStack = UniSci.ui.modalStack.filter(m => m !== id);
        }, 300);
        if (result && onConfirm) onConfirm(multiple ? Array.from(selectedSet) : value);
        if (!result && onCancel) onCancel();
      };
      
      overlay.querySelector('[data-select-confirm]').addEventListener('click', () => close(true, multiple ? Array.from(selectedSet) : null));
      overlay.querySelector('[data-select-cancel]').addEventListener('click', () => close(false));
      overlay.querySelector('[data-select-close]').addEventListener('click', () => close(false));
      overlay.addEventListener('click', (e) => { if (e.target === overlay) close(false); });
      
      return { close: () => close(false) };
    },
    
    // 底部操作菜单
    actionSheet(options) {
      const { title = '', items = [], cancelText = '取消', onSelect } = options;
      
      const id = 'unisci-actionsheet-' + Date.now();
      const overlay = document.createElement('div');
      overlay.id = id;
      overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15,23,42,0.5);z-index:' + (++this._zIndex) + ';display:flex;align-items:flex-end;justify-content:center;opacity:0;transition:opacity 0.2s ease';
      
      const itemsHtml = items.map((item, index) => {
        if (item === 'divider') return '<div style="height:8px;background:var(--bg-secondary);margin:0 -16px"></div>';
        const color = item.danger ? '#ef4444' : 'var(--text)';
        return '<div data-action-item="' + index + '" style="display:flex;align-items:center;gap:12px;padding:16px;border-radius:12px;cursor:pointer;transition:background 0.15s" onmouseover="this.style.background=\'var(--bg-secondary)\'" onmouseout="this.style.background=\'transparent\'">' + (item.icon ? '<i data-lucide="' + item.icon + '" style="width:20px;height:20px;color:' + color + '"></i>' : '') + '<span style="flex:1;font-size:15px;font-weight:600;color:' + color + '">' + item.label + '</span></div>';
      }).join('');
      
      overlay.innerHTML = '<div data-as-panel style="background:var(--bg-card);border-radius:20px 20px 0 0;padding:8px 16px 16px;max-width:500px;width:100%;transform:translateY(100%);transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1)">' + (title ? '<div style="text-align:center;padding:12px 0 8px;font-size:13px;color:var(--text3);font-weight:600;border-bottom:1px solid var(--border-light);margin-bottom:4px">' + title + '</div>' : '') + itemsHtml + '<div style="height:8px"></div><button data-as-cancel style="width:100%;padding:14px;background:var(--bg-secondary);color:var(--text2);border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer">' + cancelText + '</button></div>';
      
      document.body.appendChild(overlay);
      UniSci.ui.modalStack.push(id);
      
      requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        overlay.querySelector('[data-as-panel]').style.transform = 'translateY(0)';
        if (typeof renderIcons === 'function') renderIcons();
      });
      
      const close = (index) => {
        overlay.style.opacity = '0';
        overlay.querySelector('[data-as-panel]').style.transform = 'translateY(100%)';
        setTimeout(() => {
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
          UniSci.ui.modalStack = UniSci.ui.modalStack.filter(m => m !== id);
        }, 300);
        if (index !== undefined && index !== null && items[index] && items[index] !== 'divider' && onSelect) {
          onSelect(items[index], index);
        }
      };
      
      overlay.querySelector('[data-as-panel]').addEventListener('click', (e) => {
        const itemEl = e.target.closest('[data-action-item]');
        if (itemEl) close(parseInt(itemEl.getAttribute('data-action-item')));
      });
      overlay.querySelector('[data-as-cancel]').addEventListener('click', () => close(null));
      overlay.addEventListener('click', (e) => { if (e.target === overlay) close(null); });
      
      return { close: () => close(null) };
    },
    
    // 分享面板
    share(options) {
      const { title = '分享', url = '', text = '', onShare } = options;
      
      const channels = [
        { id: 'wechat', label: '微信', icon: 'message-circle', color: '#5ccf8e' },
        { id: 'weibo', label: '微博', icon: 'radio', color: '#ef4444' },
        { id: 'qq', label: 'QQ', icon: 'message-square', color: '#5ba3d9' },
        { id: 'link', label: '复制链接', icon: 'link', color: '#64748b' },
        { id: 'qrcode', label: '二维码', icon: 'qr-code', color: '#9b7ed8' },
        { id: 'more', label: '更多', icon: 'share-2', color: '#ff9f43' }
      ];
      
      return this.actionSheet({
        title: title,
        items: [
          { label: '分享到', disabled: true },
          'divider',
          ...channels.map(c => ({ label: c.label, icon: c.icon, onClick: () => { if (onShare) onShare(c); } }))
        ],
        onSelect: (item) => { if (item.onClick) item.onClick(); }
      });
    },
    
    // 关闭最上层弹窗
    closeTop() {
      if (UniSci.ui.modalStack.length > 0) {
        const id = UniSci.ui.modalStack[UniSci.ui.modalStack.length - 1];
        const el = document.getElementById(id);
        if (el) {
          el.style.opacity = '0';
          setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 200);
        }
        UniSci.ui.modalStack.pop();
      }
    },
    
    // 关闭所有弹窗
    closeAll() {
      UniSci.ui.modalStack.forEach(id => {
        const el = document.getElementById(id);
        if (el && el.parentNode) el.parentNode.removeChild(el);
      });
      UniSci.ui.modalStack = [];
    }
  },
  
  // ===== 图片查看器 =====
  imageViewer: {
    show(images, index = 0) {
      if (typeof images === 'string') images = [images];
      
      const id = 'unisci-imageviewer-' + Date.now();
      const overlay = document.createElement('div');
      overlay.id = id;
      overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.95);z-index:10001;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.2s ease';
      
      overlay.innerHTML = '<button data-iv-close style="position:absolute;top:20px;right:20px;background:rgba(255,255,255,0.1);border:none;color:#fff;width:40px;height:40px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:2"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button><img data-iv-img src="' + images[index] + '" style="max-width:90vw;max-height:85vh;object-fit:contain;border-radius:8px;transition:transform 0.2s ease;cursor:grab" draggable="false"><div data-iv-counter style="position:absolute;bottom:24px;left:50%;transform:translateX(-50%);color:rgba(255,255,255,0.7);font-size:14px;font-weight:600">' + (index + 1) + ' / ' + images.length + '</div>';
      
      document.body.appendChild(overlay);
      requestAnimationFrame(() => { overlay.style.opacity = '1'; });
      
      let currentIndex = index;
      let scale = 1;
      const img = overlay.querySelector('[data-iv-img]');
      
      const updateImg = () => {
        img.src = images[currentIndex];
        scale = 1;
        img.style.transform = 'scale(1)';
        overlay.querySelector('[data-iv-counter]').textContent = (currentIndex + 1) + ' / ' + images.length;
      };
      
      overlay.querySelector('[data-iv-close]').addEventListener('click', () => {
        overlay.style.opacity = '0';
        setTimeout(() => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 200);
      });
      
      overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.querySelector('[data-iv-close]').click(); });
      
      // 缩放
      img.addEventListener('wheel', (e) => {
        e.preventDefault();
        scale = Math.max(0.5, Math.min(5, scale + (e.deltaY > 0 ? -0.1 : 0.1)));
        img.style.transform = 'scale(' + scale + ')';
      });
      
      // 键盘导航
      document.addEventListener('keydown', function ivKey(e) {
        if (e.key === 'Escape') { overlay.querySelector('[data-iv-close]').click(); document.removeEventListener('keydown', ivKey); }
        if (e.key === 'ArrowLeft' && currentIndex > 0) { currentIndex--; updateImg(); }
        if (e.key === 'ArrowRight' && currentIndex < images.length - 1) { currentIndex++; updateImg(); }
      });
      
      return { close: () => overlay.querySelector('[data-iv-close]').click() };
    }
  }
};

// 兼容旧版全局showToast
window.showToast = function(msg) { return UI.toast.show(msg); };

// 注入动画CSS
(function() {
  const style = document.createElement('style');
  style.textContent = '@keyframes unisci-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes unisci-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}@keyframes unisci-pulse{0%,80%,100%{transform:scale(0);opacity:0.5}40%{transform:scale(1);opacity:1}}';
  document.head.appendChild(style);
})();

window.UI = UI;
// ============================================================
// 第六部分: 全局搜索系统 (Global Search)
// FP-10-001
// ============================================================

const Search = {
  // 搜索数据源配置
  sources: {
    jobs: { name: '计算任务', icon: 'cpu', color: 'var(--primary)', enabled: true },
    notebooks: { name: 'Notebook', icon: 'code-2', color: 'var(--blue)', enabled: true },
    workflows: { name: '工作流', icon: 'git-branch', color: 'var(--orange)', enabled: true },
    materials: { name: '材料', icon: 'layers', color: 'var(--purple)', enabled: true },
    molecules: { name: '分子结构', icon: 'atom', color: 'var(--green)', enabled: true },
    courses: { name: '课程', icon: 'book-open', color: 'var(--teal)', enabled: true },
    articles: { name: '文章', icon: 'file-text', color: 'var(--red)', enabled: true },
    users: { name: '用户', icon: 'user', color: 'var(--text2)', enabled: true }
  },
  
  // 搜索历史
  history: [],
  maxHistory: 20,
  
  // 热门搜索
  hotSearches: [
    'MoS₂ 能带结构', 'DFT 计算教程', '拓扑绝缘体', '石墨烯', 'VASP 输入文件',
    '分子动力学', '机器学习 材料预测', '超导材料', '二维材料', '钙钛矿'
  ],
  
  // 初始化
  init() {
    this.history = Storage.local.get('search_history', []);
  },
  
  // 添加搜索历史
  addHistory(keyword) {
    if (!keyword || keyword.trim().length === 0) return;
    keyword = keyword.trim();
    this.history = this.history.filter(h => h !== keyword);
    this.history.unshift(keyword);
    if (this.history.length > this.maxHistory) this.history = this.history.slice(0, this.maxHistory);
    Storage.local.set('search_history', this.history);
  },
  
  // 清除历史
  clearHistory() {
    this.history = [];
    Storage.local.remove('search_history');
  },
  
  // 实时联想
  async suggest(keyword) {
    if (!keyword || keyword.trim().length === 0) return [];
    keyword = keyword.trim().toLowerCase();
    
    const suggestions = [];
    
    // 从历史中匹配
    this.history.forEach(h => {
      if (h.toLowerCase().includes(keyword) && suggestions.length < 5) {
        suggestions.push({ type: 'history', text: h, icon: 'clock' });
      }
    });
    
    // 从热门搜索匹配
    this.hotSearches.forEach(h => {
      if (h.toLowerCase().includes(keyword) && !suggestions.find(s => s.text === h) && suggestions.length < 10) {
        suggestions.push({ type: 'hot', text: h, icon: 'trending-up' });
      }
    });
    
    // 模拟数据源匹配 (实际应从API获取)
    const mockData = this._getMockData();
    Object.entries(mockData).forEach(([source, items]) => {
      items.forEach(item => {
        const text = item.title || item.formula || item.name || '';
        if (text.toLowerCase().includes(keyword) && !suggestions.find(s => s.text === text) && suggestions.length < 15) {
          suggestions.push({ type: source, text: text, icon: this.sources[source]?.icon || 'search', data: item });
        }
      });
    });
    
    return suggestions;
  },
  
  // 执行完整搜索
  async search(keyword, filters = {}) {
    if (!keyword || keyword.trim().length === 0) return {};
    keyword = keyword.trim();
    this.addHistory(keyword);
    
    const results = {};
    const mockData = this._getMockData();
    
    // 按数据源搜索
    Object.entries(this.sources).forEach(([source, config]) => {
      if (filters.sources && !filters.sources.includes(source)) return;
      if (!config.enabled) return;
      
      const items = mockData[source] || [];
      const matched = items.filter(item => {
        const searchFields = [item.title, item.formula, item.name, item.description, item.tag, item.content];
        return searchFields.some(f => f && f.toLowerCase().includes(keyword.toLowerCase()));
      });
      
      if (matched.length > 0) {
        results[source] = {
          name: config.name,
          icon: config.icon,
          color: config.color,
          total: matched.length,
          items: matched.slice(0, 10)
        };
      }
    });
    
    return results;
  },
  
  // 模拟数据 (实际应从各板块API获取)
  _getMockData() {
    const u = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    return {
      jobs: u ? [...(u.runningJobs || []), ...(u.completedJobs || [])] : [],
      notebooks: u ? (u.notebooks || []) : [],
      workflows: u ? (u.workflows || []) : [],
      materials: [
        { formula: 'MoS₂', name: '二硫化钼', title: 'MoS₂ 二硫化钼', description: '二维半导体材料，带隙1.8eV', tag: '二维材料' },
        { formula: 'Graphene', name: '石墨烯', title: 'Graphene 石墨烯', description: '二维半金属，零带隙', tag: '二维材料' },
        { formula: 'Bi₂Se₃', name: '硒化铋', title: 'Bi₂Se₃ 硒化铋', description: '拓扑绝缘体', tag: '拓扑材料' }
      ],
      molecules: [],
      courses: u ? (u.courses || []) : [],
      articles: u ? (u.articles || []) : [],
      users: []
    };
  },
  
  // 渲染搜索结果项
  renderResultItem(source, item) {
    const config = this.sources[source];
    if (!config) return '';
    
    const title = item.title || item.formula || item.name || '未命名';
    const desc = item.description || item.type || item.tag || item.software || '';
    const meta = item.date || item.submitted || item.completed || item.lastModified || '';
    
    return '<div onclick="Search._handleResultClick(\'' + source + '\', this)" style="display:flex;align-items:center;gap:12px;padding:12px;border-radius:12px;cursor:pointer;transition:background 0.15s" onmouseover="this.style.background=\'var(--bg-secondary)\'" onmouseout="this.style.background=\'transparent\'"><div style="width:40px;height:40px;border-radius:12px;background:' + config.color + '18;display:flex;align-items:center;justify-content:center;flex-shrink:0"><i data-lucide="' + config.icon + '" style="width:20px;height:20px;color:' + config.color + '"></i></div><div style="flex:1;min-width:0"><div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + title + '</div><div style="font-size:12px;color:var(--text3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + desc + (meta ? ' · ' + meta : '') + '</div></div><i data-lucide="chevron-right" style="width:16px;height:16px;color:var(--text3);flex-shrink:0"></i></div>';
  },
  
  _handleResultClick(source, el) {
    // 根据数据源跳转到对应页面
    const pageMap = {
      jobs: 'page-job-detail',
      notebooks: 'page-notebook-detail',
      workflows: 'page-workflow-editor',
      materials: 'page-results',
      molecules: 'page-molecules',
      courses: 'page-course-detail',
      articles: 'page-article-detail',
      users: 'page-profile'
    };
    const pageId = pageMap[source] || 'page-home';
    Router.navigateTo(pageId);
    UI.toast.info('打开搜索结果');
  }
};

Search.init();
window.Search = Search;

// ============================================================
// 第七部分: 通知中心 (Notification Center)
// FP-10-002
// ============================================================

const Notification = {
  // 通知类型配置
  types: {
    system: { name: '系统通知', icon: 'bell', color: 'var(--blue)', enabled: true },
    job: { name: '计算任务', icon: 'cpu', color: 'var(--primary)', enabled: true },
    course: { name: '课程学习', icon: 'book-open', color: 'var(--green)', enabled: true },
    community: { name: '社区互动', icon: 'message-circle', color: 'var(--purple)', enabled: true },
    resource: { name: '资源预警', icon: 'alert-triangle', color: 'var(--orange)', enabled: true },
    security: { name: '安全通知', icon: 'shield', color: 'var(--red)', enabled: true },
    achievement: { name: '成就通知', icon: 'trophy', color: 'var(--yellow)', enabled: true },
    workflow: { name: '工作流', icon: 'git-branch', color: 'var(--teal)', enabled: true }
  },
  
  // 通知列表
  list: [],
  
  // 初始化模拟数据
  init() {
    this.list = Storage.local.get('notifications', this._generateMock());
    this._updateUnreadCount();
  },
  
  // 生成模拟通知
  _generateMock() {
    const now = Date.now();
    return [
      { id: 'n1', type: 'job', title: '计算任务完成', content: '任务「MoS₂ 能带结构计算」已完成，耗时 23 分钟', time: now - 5 * 60 * 1000, read: false, action: { page: 'page-job-detail', label: '查看结果' } },
      { id: 'n2', type: 'system', title: '系统更新', content: 'UniSci Platform 已更新到 v2.0.0，新增工作流编辑器和分子建模器', time: now - 30 * 60 * 1000, read: false, action: { page: 'page-home', label: '了解更多' } },
      { id: 'n3', type: 'achievement', title: '获得新徽章', content: '恭喜！您已完成 10 次计算任务，获得「算力新星」徽章', time: now - 2 * 60 * 60 * 1000, read: true, action: { page: 'page-profile', label: '查看成就' } },
      { id: 'n4', type: 'resource', title: '算力用量提醒', content: '您本月 GPU 时长已使用 85%，剩余 15 小时', time: now - 5 * 60 * 60 * 1000, read: true, action: { page: 'page-profile', label: '查看用量' } },
      { id: 'n5', type: 'course', title: '新课程上线', content: '《AI for Science 入门》课程已上线，共 15 课时', time: now - 24 * 60 * 60 * 1000, read: true, action: { page: 'page-learn', label: '去学习' } },
      { id: 'n6', type: 'community', title: '新评论', content: '李明哲 评论了您的文章《拓扑材料计算指南》', time: now - 2 * 24 * 60 * 60 * 1000, read: true, action: { page: 'page-article-detail', label: '查看评论' } },
      { id: 'n7', type: 'security', title: '新设备登录', content: '您的账号在新设备上登录，设备：iPhone 15 Pro', time: now - 3 * 24 * 60 * 60 * 1000, read: true, action: { page: 'page-settings', label: '查看设备' } },
      { id: 'n8', type: 'workflow', title: '工作流运行完成', content: '工作流「DFT材料筛选流程」已成功运行，共处理 50 个材料', time: now - 5 * 24 * 60 * 60 * 1000, read: true, action: { page: 'page-workflow-editor', label: '查看结果' } }
    ];
  },
  
  // 获取未读数
  _updateUnreadCount() {
    UniSci.notifications.unreadCount = this.list.filter(n => !n.read).length;
    this._updateBadge();
  },
  
  // 更新角标
  _updateBadge() {
    const badge = document.getElementById('notification-badge');
    if (badge) {
      const count = UniSci.notifications.unreadCount;
      badge.textContent = count > 99 ? '99+' : count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  },
  
  // 获取通知列表
  getList(filter = {}) {
    let list = [...this.list];
    if (filter.type) list = list.filter(n => n.type === filter.type);
    if (filter.unreadOnly) list = list.filter(n => !n.read);
    return list.sort((a, b) => b.time - a.time);
  },
  
  // 标记已读
  markRead(id) {
    const n = this.list.find(n => n.id === id);
    if (n && !n.read) {
      n.read = true;
      this._updateUnreadCount();
      this._save();
    }
  },
  
  // 全部标记已读
  markAllRead() {
    this.list.forEach(n => n.read = true);
    this._updateUnreadCount();
    this._save();
    UI.toast.success('已全部标记为已读');
  },
  
  // 删除通知
  remove(id) {
    this.list = this.list.filter(n => n.id !== id);
    this._updateUnreadCount();
    this._save();
  },
  
  // 清空所有
  clearAll() {
    UI.modal.confirm({
      title: '清空通知',
      content: '确定要清空所有通知吗？此操作不可恢复。',
      confirmText: '清空',
      type: 'danger',
      onConfirm: () => {
        this.list = [];
        this._updateUnreadCount();
        this._save();
        UI.toast.success('通知已清空');
        if (typeof renderNotifications === 'function') renderNotifications();
      }
    });
  },
  
  // 推送新通知
  push(notification) {
    const n = {
      id: 'n' + Date.now(),
      time: Date.now(),
      read: false,
      ...notification
    };
    this.list.unshift(n);
    this._updateUnreadCount();
    this._save();
    
    // 显示推送横幅
    this._showBanner(n);
    return n;
  },
  
  // 推送横幅
  _showBanner(n) {
    const config = this.types[n.type] || this.types.system;
    const banner = document.createElement('div');
    banner.style.cssText = 'position:fixed;top:16px;left:16px;right:16px;max-width:400px;margin:0 auto;background:var(--bg-card);border-radius:16px;padding:14px 16px;box-shadow:0 12px 40px rgba(0,0,0,0.15);z-index:9997;display:flex;align-items:flex-start;gap:12px;transform:translateY(-120%);transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1);cursor:pointer;border-left:4px solid ' + config.color;
    banner.innerHTML = '<div style="width:36px;height:36px;border-radius:10px;background:' + config.color + '18;display:flex;align-items:center;justify-content:center;flex-shrink:0"><i data-lucide="' + config.icon + '" style="width:18px;height:18px;color:' + config.color + '"></i></div><div style="flex:1;min-width:0"><div style="font-size:14px;font-weight:800;color:var(--text);margin-bottom:2px">' + n.title + '</div><div style="font-size:12px;color:var(--text2);line-height:1.4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + n.content + '</div></div>';
    
    document.body.appendChild(banner);
    if (typeof renderIcons === 'function') renderIcons();
    
    requestAnimationFrame(() => { banner.style.transform = 'translateY(0)'; });
    
    let autoClose;
    const close = () => {
      banner.style.transform = 'translateY(-120%)';
      setTimeout(() => { if (banner.parentNode) banner.parentNode.removeChild(banner); }, 400);
    };
    
    banner.addEventListener('click', () => {
      clearTimeout(autoClose);
      this.markRead(n.id);
      if (n.action && n.action.page) Router.navigateTo(n.action.page);
      close();
    });
    
    autoClose = setTimeout(close, 5000);
  },
  
  // 格式化时间
  formatTime(timestamp) {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return minutes + ' 分钟前';
    if (hours < 24) return hours + ' 小时前';
    if (days < 7) return days + ' 天前';
    return new Date(timestamp).toLocaleDateString('zh-CN');
  },
  
  // 保存
  _save() {
    Storage.local.set('notifications', this.list);
  },
  
  // 渲染通知列表 (供页面调用)
  renderList(container, filter = {}) {
    const list = this.getList(filter);
    if (list.length === 0) {
      container.innerHTML = UI.state.empty('notification');
      if (typeof renderIcons === 'function') renderIcons();
      return;
    }
    
    container.innerHTML = list.map(n => {
      const config = this.types[n.type] || this.types.system;
      return '<div onclick="Notification.handleClick(\'' + n.id + '\')" style="display:flex;gap:12px;padding:14px 16px;border-radius:14px;cursor:pointer;transition:background 0.15s;background:' + (n.read ? 'transparent' : config.color + '08') + '" onmouseover="this.style.background=\'var(--bg-secondary)\'" onmouseout="this.style.background=\'' + (n.read ? 'transparent' : config.color + '08') + '\'"><div style="position:relative;flex-shrink:0"><div style="width:40px;height:40px;border-radius:12px;background:' + config.color + '18;display:flex;align-items:center;justify-content:center"><i data-lucide="' + config.icon + '" style="width:20px;height:20px;color:' + config.color + '"></i></div>' + (n.read ? '' : '<div style="position:absolute;top:-2px;right:-2px;width:10px;height:10px;background:var(--primary);border-radius:50%;border:2px solid var(--bg-card)"></div>') + '</div><div style="flex:1;min-width:0"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px"><span style="font-size:14px;font-weight:' + (n.read ? '600' : '800') + ';color:var(--text)">' + n.title + '</span><span style="font-size:11px;color:var(--text3);flex-shrink:0;margin-left:8px">' + this.formatTime(n.time) + '</span></div><div style="font-size:13px;color:var(--text2);line-height:1.4;margin-bottom:6px">' + n.content + '</div>' + (n.action ? '<span style="font-size:12px;font-weight:700;color:' + config.color + '">' + n.action.label + ' →</span>' : '') + '</div></div>';
    }).join('');
    
    if (typeof renderIcons === 'function') renderIcons();
  },
  
  // 处理点击
  handleClick(id) {
    const n = this.list.find(n => n.id === id);
    if (!n) return;
    this.markRead(id);
    if (n.action && n.action.page) {
      Router.navigateTo(n.action.page);
    }
    if (typeof renderNotifications === 'function') renderNotifications();
  }
};

Notification.init();
window.Notification = Notification;

// ============================================================
// 第八部分: 国际化 (i18n)
// FP-10-010
// ============================================================

const I18n = {
  current: 'zh-CN',
  supported: ['zh-CN', 'zh-TW', 'en-US', 'ja-JP'],
  
  // 词典
  dict: {
    'zh-CN': {
      'app.name': 'UniSci 科学计算平台',
      'app.tagline': '让科学计算像水和电一样触手可及',
      'nav.home': '首页',
      'nav.compute': '计算',
      'nav.learn': '学习',
      'nav.ai': 'AI',
      'nav.profile': '我的',
      'common.loading': '加载中...',
      'common.retry': '重试',
      'common.confirm': '确定',
      'common.cancel': '取消',
      'common.save': '保存',
      'common.delete': '删除',
      'common.edit': '编辑',
      'common.share': '分享',
      'common.search': '搜索',
      'common.back': '返回',
      'common.more': '更多',
      'common.empty': '暂无数据',
      'common.noResult': '未找到相关内容',
      'common.networkError': '网络连接失败',
      'common.serverError': '服务暂时不可用',
      'common.success': '操作成功',
      'common.failed': '操作失败',
      'job.running': '运行中',
      'job.queued': '排队中',
      'job.completed': '已完成',
      'job.failed': '失败',
      'job.new': '新建任务',
      'notebook.new': '新建Notebook',
      'course.continue': '继续学习',
      'ai.chat': 'AI对话',
      'notification.title': '通知中心',
      'notification.markAllRead': '全部已读',
      'notification.clear': '清空',
      'settings.title': '设置',
      'settings.theme': '主题',
      'settings.language': '语言',
      'settings.account': '账号安全',
      'settings.notification': '通知设置',
      'settings.about': '关于',
      'theme.light': '浅色',
      'theme.dark': '深色',
      'theme.system': '跟随系统',
      'user.login': '登录',
      'user.logout': '退出登录',
      'user.switch': '切换账号'
    },
    'en-US': {
      'app.name': 'UniSci Scientific Computing Platform',
      'app.tagline': 'Make scientific computing as accessible as water and electricity',
      'nav.home': 'Home',
      'nav.compute': 'Compute',
      'nav.learn': 'Learn',
      'nav.ai': 'AI',
      'nav.profile': 'Profile',
      'common.loading': 'Loading...',
      'common.retry': 'Retry',
      'common.confirm': 'Confirm',
      'common.cancel': 'Cancel',
      'common.save': 'Save',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.share': 'Share',
      'common.search': 'Search',
      'common.back': 'Back',
      'common.more': 'More',
      'common.empty': 'No data',
      'common.noResult': 'No results found',
      'common.networkError': 'Network connection failed',
      'common.serverError': 'Service temporarily unavailable',
      'common.success': 'Success',
      'common.failed': 'Failed',
      'job.running': 'Running',
      'job.queued': 'Queued',
      'job.completed': 'Completed',
      'job.failed': 'Failed',
      'job.new': 'New Job',
      'notebook.new': 'New Notebook',
      'course.continue': 'Continue',
      'ai.chat': 'AI Chat',
      'notification.title': 'Notifications',
      'notification.markAllRead': 'Mark all read',
      'notification.clear': 'Clear',
      'settings.title': 'Settings',
      'settings.theme': 'Theme',
      'settings.language': 'Language',
      'settings.account': 'Account Security',
      'settings.notification': 'Notifications',
      'settings.about': 'About',
      'theme.light': 'Light',
      'theme.dark': 'Dark',
      'theme.system': 'System',
      'user.login': 'Login',
      'user.logout': 'Logout',
      'user.switch': 'Switch Account'
    }
  },
  
  // 初始化
  init() {
    this.current = Storage.local.get('language', 'zh-CN');
    this.apply();
  },
  
  // 翻译
  t(key, params = {}) {
    const dict = this.dict[this.current] || this.dict['zh-CN'];
    let text = dict[key] || key;
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace('{' + k + '}', v);
    });
    return text;
  },
  
  // 切换语言
  setLanguage(lang) {
    if (!this.supported.includes(lang)) return;
    this.current = lang;
    Storage.local.set('language', lang);
    this.apply();
    UI.toast.success(this.t('common.success'));
    UniSci.emit('languageChange', lang);
  },
  
  // 应用语言到页面
  apply() {
    document.documentElement.setAttribute('lang', this.current);
    // 更新所有 data-i18n 元素
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = this.t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = this.t(key);
    });
  }
};

I18n.init();
window.I18n = I18n;

// ============================================================
// 第九部分: 全局错误处理完善 (Global Error Handling)
// FP-10-011
// ============================================================

const ErrorHandler = {
  // 错误统计
  stats: { total: 0, byType: {}, lastError: null },
  
  // 初始化
  init() {
    // JS运行时错误
    window.addEventListener('error', (e) => {
      this.handle({
        type: 'runtime',
        message: e.message,
        filename: e.filename,
        line: e.lineno,
        col: e.colno,
        error: e.error,
        timestamp: Date.now()
      });
    });
    
    // Promise未处理拒绝
    window.addEventListener('unhandledrejection', (e) => {
      this.handle({
        type: 'promise',
        message: e.reason && e.reason.message ? e.reason.message : String(e.reason),
        error: e.reason,
        timestamp: Date.now()
      });
    });
    
    // 资源加载失败
    window.addEventListener('error', (e) => {
      if (e.target && (e.target.tagName === 'IMG' || e.target.tagName === 'SCRIPT' || e.target.tagName === 'LINK')) {
        this.handle({
          type: 'resource',
          message: '资源加载失败: ' + (e.target.src || e.target.href),
          tagName: e.target.tagName,
          timestamp: Date.now()
        });
      }
    }, true);
    
    // Vue/React错误边界 (如果使用框架)
    if (window.addEventListener) {
      window.addEventListener('vue-error', (e) => this.handle({ type: 'vue', ...e.detail }));
    }
    
    console.log('[ErrorHandler] 全局错误处理已初始化');
  },
  
  // 处理错误
  handle(error) {
    this.stats.total++;
    this.stats.byType[error.type] = (this.stats.byType[error.type] || 0) + 1;
    this.stats.lastError = error;
    
    // 控制台输出
    console.error('[ErrorHandler][' + error.type + ']', error.message, error);
    
    // 上报到监控系统 (模拟)
    this._report(error);
    
    // 用户友好提示 (根据错误类型)
    this._showUserFriendly(error);
  },
  
  // 上报错误
  _report(error) {
    // 实际应发送到监控后端
    const report = {
      ...error,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: error.timestamp || Date.now(),
      appVersion: UniSci.version,
      sessionId: Storage.local.get('session_id', 'unknown')
    };
    
    // 本地存储最近100条错误
    const errors = Storage.local.get('error_logs', []);
    errors.unshift(report);
    if (errors.length > 100) errors.pop();
    Storage.local.set('error_logs', errors);
  },
  
  // 用户友好提示
  _showUserFriendly(error) {
    // 静默错误 (不打扰用户)
    const silentTypes = ['resource', 'analytics'];
    if (silentTypes.includes(error.type)) return;
    
    // 频繁错误抑制 (1分钟内相同错误只提示1次)
    const key = error.type + ':' + error.message;
    const lastShow = this._lastShow || {};
    if (lastShow[key] && Date.now() - lastShow[key] < 60000) return;
    lastShow[key] = Date.now();
    this._lastShow = lastShow;
    
    // 根据类型显示不同提示
    switch (error.type) {
      case 'runtime':
      case 'promise':
        UI.toast.error('操作遇到问题，请重试');
        break;
      case 'network':
        UI.toast.error('网络连接失败，请检查网络');
        break;
      case 'timeout':
        UI.toast.warning('请求超时，请重试');
        break;
      default:
        UI.toast.error('发生错误，请稍后重试');
    }
  },
  
  // 获取错误日志
  getLogs() {
    return Storage.local.get('error_logs', []);
  },
  
  // 清除错误日志
  clearLogs() {
    Storage.local.remove('error_logs');
    this.stats = { total: 0, byType: {}, lastError: null };
  },
  
  // 包装异步函数 (自动捕获错误)
  wrap(fn, context = null) {
    return async (...args) => {
      try {
        return await fn.apply(context, args);
      } catch (e) {
        this.handle({ type: 'async', message: e.message, error: e, stack: e.stack });
        throw e;
      }
    };
  },
  
  // 包装同步函数
  wrapSync(fn, context = null) {
    return (...args) => {
      try {
        return fn.apply(context, args);
      } catch (e) {
        this.handle({ type: 'sync', message: e.message, error: e, stack: e.stack });
        throw e;
      }
    };
  }
};

ErrorHandler.init();
window.ErrorHandler = ErrorHandler;

// ============================================================
// 第十部分: 性能监控 (Performance Monitoring)
// FP-10-012
// ============================================================

const PerfMonitor = {
  metrics: {
    startTime: Date.now(),
    navigationStart: 0,
    domContentLoaded: 0,
    loadComplete: 0,
    firstPaint: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    timeToInteractive: 0,
    totalBlockingTime: 0,
    cumulativeLayoutShift: 0
  },
  
  fps: { current: 60, history: [], lastFrame: 0, frameCount: 0 },
  memory: { used: 0, total: 0, limit: 0 },
  network: { requests: 0, failed: 0, totalSize: 0 },
  
  init() {
    // 页面加载性能
    if (window.performance) {
      this.metrics.navigationStart = performance.timing.navigationStart;
      
      window.addEventListener('load', () => {
        this.metrics.loadComplete = Date.now() - this.metrics.startTime;
        this._collectNavigationMetrics();
      });
      
      window.addEventListener('DOMContentLoaded', () => {
        this.metrics.domContentLoaded = Date.now() - this.metrics.startTime;
      });
      
      // First Contentful Paint
      if (PerformanceObserver) {
        try {
          const fcpObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.name === 'first-contentful-paint') {
                this.metrics.firstContentfulPaint = entry.startTime;
              }
            }
          });
          fcpObserver.observe({ type: 'paint', buffered: true });
        } catch(e) {}
        
        // Largest Contentful Paint
        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            if (entries.length > 0) {
              this.metrics.largestContentfulPaint = entries[entries.length - 1].startTime;
            }
          });
          lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        } catch(e) {}
        
        // Cumulative Layout Shift
        try {
          let cls = 0;
          const clsObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!entry.hadRecentInput) cls += entry.value;
            }
            this.metrics.cumulativeLayoutShift = cls;
          });
          clsObserver.observe({ type: 'layout-shift', buffered: true });
        } catch(e) {}
      }
    }
    
    // FPS监控
    this._startFPSMonitor();
    
    // 内存监控
    this._startMemoryMonitor();
    
    // 网络请求监控
    this._startNetworkMonitor();
    
    // 长任务监控
    this._startLongTaskMonitor();
    
    console.log('[PerfMonitor] 性能监控已初始化');
  },
  
  _collectNavigationMetrics() {
    if (!window.performance || !performance.timing) return;
    const t = performance.timing;
    this.metrics.timeToInteractive = t.domInteractive - t.navigationStart;
    this.metrics.totalBlockingTime = Math.max(0, this.metrics.timeToInteractive - this.metrics.firstContentfulPaint);
  },
  
  _startFPSMonitor() {
    const loop = () => {
      const now = performance.now();
      this.fps.frameCount++;
      if (now - this.fps.lastFrame >= 1000) {
        this.fps.current = Math.round(this.fps.frameCount * 1000 / (now - this.fps.lastFrame));
        this.fps.history.push({ time: Date.now(), fps: this.fps.current });
        if (this.fps.history.length > 60) this.fps.history.shift();
        this.fps.frameCount = 0;
        this.fps.lastFrame = now;
        
        // FPS过低告警
        if (this.fps.current < 30) {
          console.warn('[PerfMonitor] FPS过低:', this.fps.current);
        }
      }
      requestAnimationFrame(loop);
    };
    this.fps.lastFrame = performance.now();
    requestAnimationFrame(loop);
  },
  
  _startMemoryMonitor() {
    const update = () => {
      if (performance.memory) {
        this.memory.used = performance.memory.usedJSHeapSize;
        this.memory.total = performance.memory.totalJSHeapSize;
        this.memory.limit = performance.memory.jsHeapSizeLimit;
        
        // 内存过高告警
        if (this.memory.used > 500 * 1024 * 1024) {
          console.warn('[PerfMonitor] 内存使用过高:', (this.memory.used / 1024 / 1024).toFixed(1), 'MB');
        }
      }
    };
    update();
    setInterval(update, 5000);
  },
  
  _startNetworkMonitor() {
    const origFetch = window.fetch;
    window.fetch = function(...args) {
      PerfMonitor.network.requests++;
      const startTime = Date.now();
      return origFetch.apply(this, args).then(response => {
        if (!response.ok) PerfMonitor.network.failed++;
        return response;
      }).catch(error => {
        PerfMonitor.network.failed++;
        throw error;
      });
    };
    
    const origXHR = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
      PerfMonitor.network.requests++;
      this.addEventListener('error', () => PerfMonitor.network.failed++);
      return origXHR.apply(this, [method, url, ...rest]);
    };
  },
  
  _startLongTaskMonitor() {
    if (!PerformanceObserver) return;
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.warn('[PerfMonitor] 长任务:', entry.duration.toFixed(0), 'ms', entry.name);
          }
        }
      });
      observer.observe({ type: 'longtask', buffered: true });
    } catch(e) {}
  },
  
  // 获取性能报告
  getReport() {
    return {
      pageLoad: {
        domContentLoaded: this.metrics.domContentLoaded + 'ms',
        loadComplete: this.metrics.loadComplete + 'ms',
        firstContentfulPaint: this.metrics.firstContentfulPaint.toFixed(0) + 'ms',
        largestContentfulPaint: this.metrics.largestContentfulPaint.toFixed(0) + 'ms',
        timeToInteractive: this.metrics.timeToInteractive + 'ms',
        totalBlockingTime: this.metrics.totalBlockingTime.toFixed(0) + 'ms',
        cumulativeLayoutShift: this.metrics.cumulativeLayoutShift.toFixed(3)
      },
      runtime: {
        fps: this.fps.current,
        fpsAvg: this.fps.history.length > 0 ? Math.round(this.fps.history.reduce((a, b) => a + b.fps, 0) / this.fps.history.length) : 60,
        memoryUsed: this.memory.used ? (this.memory.used / 1024 / 1024).toFixed(1) + 'MB' : 'N/A',
        memoryTotal: this.memory.total ? (this.memory.total / 1024 / 1024).toFixed(1) + 'MB' : 'N/A'
      },
      network: {
        totalRequests: this.network.requests,
        failedRequests: this.network.failed,
        errorRate: this.network.requests > 0 ? (this.network.failed / this.network.requests * 100).toFixed(1) + '%' : '0%'
      },
      errors: ErrorHandler.stats
    };
  },
  
  // 性能评分 (0-100)
  getScore() {
    let score = 100;
    // LCP > 2.5s 扣分
    if (this.metrics.largestContentfulPaint > 2500) score -= 20;
    else if (this.metrics.largestContentfulPaint > 4000) score -= 40;
    // TTI > 3.8s 扣分
    if (this.metrics.timeToInteractive > 3800) score -= 15;
    // CLS > 0.1 扣分
    if (this.metrics.cumulativeLayoutShift > 0.1) score -= 15;
    // FPS < 30 扣分
    if (this.fps.current < 30) score -= 20;
    // 错误率 > 5% 扣分
    if (this.network.requests > 10 && this.network.failed / this.network.requests > 0.05) score -= 10;
    return Math.max(0, Math.min(100, score));
  }
};

PerfMonitor.init();
window.PerfMonitor = PerfMonitor;

// ============================================================
// 第十一部分: 启动引导 (Onboarding)
// FP-10-013
// ============================================================

const Onboarding = {
  // 检查是否需要显示引导
  shouldShow() {
    return !Storage.local.get('onboarding_completed', false);
  },
  
  // 标记完成
  complete() {
    Storage.local.set('onboarding_completed', true);
    Storage.local.set('onboarding_version', UniSci.version);
  },
  
  // 启动页
  showSplash() {
    const splash = document.createElement('div');
    splash.id = 'unisci-splash';
    splash.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:linear-gradient(135deg,#f0f4f8,#e2e8f0);z-index:10002;display:flex;flex-direction:column;align-items:center;justify-content:center;transition:opacity 0.5s ease';
    splash.innerHTML = '<div style="width:80px;height:80px;background:linear-gradient(135deg,#ff6b4a,#ff8c6b);border-radius:24px;display:flex;align-items:center;justify-content:center;box-shadow:0 12px 32px rgba(255,107,74,0.3);margin-bottom:24px;animation:unisci-pulse 2s infinite"><svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M12 1v6m0 10v6m11-11h-6m-10 0H1m15.5-6.5l-4.24 4.24m-4.24 4.24l-4.24 4.24m0-16.98l4.24 4.24m4.24 4.24l4.24 4.24"></path></svg></div><h1 style="font-size:24px;font-weight:900;color:#1e293b;margin:0 0 8px 0;letter-spacing:-0.5px">UniSci</h1><p style="font-size:14px;color:#64748b;margin:0 0 32px 0;text-align:center;max-width:240px;line-height:1.5">让科学计算像水和电一样<br>触手可及</p><div style="width:32px;height:32px;border:3px solid rgba(91,163,217,0.2);border-top-color:#5ba3d9;border-radius:50%;animation:unisci-spin 0.8s linear infinite"></div><p style="font-size:11px;color:#94a3b8;margin-top:16px">v' + UniSci.version + '</p>';
    
    document.body.appendChild(splash);
    
    // 2秒后淡出
    setTimeout(() => {
      splash.style.opacity = '0';
      setTimeout(() => { if (splash.parentNode) splash.parentNode.removeChild(splash); }, 500);
    }, 2000);
    
    return splash;
  },
  
  // 新手引导 (功能高亮)
  showGuide(steps) {
    let currentStep = 0;
    
    const showStep = (index) => {
      if (index >= steps.length) {
        this.complete();
        UI.toast.success('引导完成，开始探索吧！');
        return;
      }
      
      const step = steps[index];
      const target = document.querySelector(step.target);
      if (!target) { showStep(index + 1); return; }
      
      const rect = target.getBoundingClientRect();
      
      // 高亮遮罩
      let overlay = document.getElementById('unisci-guide-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'unisci-guide-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:9999;pointer-events:none';
        document.body.appendChild(overlay);
      }
      
      overlay.innerHTML = '<svg width="100%" height="100%" style="position:absolute;top:0;left:0"><defs><mask id="guide-mask"><rect width="100%" height="100%" fill="white"></rect><rect x="' + (rect.left - 8) + '" y="' + (rect.top - 8) + '" width="' + (rect.width + 16) + '" height="' + (rect.height + 16) + '" rx="16" fill="black"></rect></mask></defs><rect width="100%" height="100%" fill="rgba(15,23,42,0.7)" mask="url(#guide-mask)"></rect></svg><div style="position:absolute;top:' + (rect.bottom + 16) + 'px;left:' + Math.max(16, rect.left) + 'px;max-width:280px;background:#fff;border-radius:16px;padding:16px;box-shadow:0 12px 40px rgba(0,0,0,0.2)"><div style="font-size:12px;font-weight:700;color:#5ba3d9;margin-bottom:4px">步骤 ' + (index + 1) + ' / ' + steps.length + '</div><h4 style="font-size:16px;font-weight:800;color:#1e293b;margin:0 0 6px 0">' + step.title + '</h4><p style="font-size:13px;color:#64748b;margin:0 0 12px 0;line-height:1.5">' + step.content + '</p><div style="display:flex;gap:8px;justify-content:space-between;align-items:center"><button data-guide-skip style="background:none;border:none;color:#94a3b8;font-size:12px;font-weight:600;cursor:pointer">跳过</button><div style="display:flex;gap:8px"><button data-guide-prev style="padding:8px 16px;background:#f1f5f9;color:#64748b;border:none;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;' + (index === 0 ? 'opacity:0.5;pointer-events:none' : '') + '">上一步</button><button data-guide-next style="padding:8px 16px;background:linear-gradient(135deg,#ff6b4a,#ff8c6b);color:#fff;border:none;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;box-shadow:0 4px 12px rgba(255,107,74,0.3)">' + (index === steps.length - 1 ? '完成' : '下一步') + '</button></div></div></div>';
      
      overlay.querySelector('[data-guide-next]').addEventListener('click', () => showStep(index + 1));
      overlay.querySelector('[data-guide-prev]').addEventListener('click', () => showStep(index - 1));
      overlay.querySelector('[data-guide-skip]').addEventListener('click', () => {
        overlay.remove();
        this.complete();
      });
    };
    
    showStep(0);
  },
  
  // 默认引导步骤
  getDefaultSteps() {
    return [
      { target: '.nav-item[data-page="home"]', title: '首页', content: '这里是您的工作台，可以查看运行中的任务、GPU算力和推荐内容。' },
      { target: '.nav-item[data-page="compute"]', title: '计算任务', content: '在这里创建和管理您的科学计算任务，支持DFT、MD等多种计算类型。' },
      { target: '.nav-item[data-page="learn"]', title: '学习中心', content: '丰富的科学计算课程和虚拟实验，从入门到精通。' },
      { target: '.nav-item[data-page="ai"]', title: 'AI智能助手', content: '您的科研副驾，可以帮您写代码、分析结果、解答问题。' },
      { target: '.nav-item[data-page="profile"]', title: '个人中心', content: '管理您的资料、Notebook、工作流和成就。' }
    ];
  },
  
  // 启动
  start() {
    this.showSplash();
    if (this.shouldShow()) {
      setTimeout(() => {
        this.showGuide(this.getDefaultSteps());
      }, 2500);
    }
  }
};

window.Onboarding = Onboarding;

// ============================================================
// 第十二部分: 无障碍支持 (Accessibility)
// FP-10-014
// ============================================================

const A11y = {
  settings: {
    highContrast: false,
    reducedMotion: false,
    screenReader: false,
    fontSize: 100, // 百分比
    keyboardNavigation: true
  },
  
  init() {
    // 读取保存的设置
    const saved = Storage.local.get('a11y_settings', null);
    if (saved) this.settings = { ...this.settings, ...saved };
    
    // 检测系统设置
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.settings.reducedMotion = true;
    }
    
    // 应用设置
    this.apply();
    
    // 键盘导航
    if (this.settings.keyboardNavigation) {
      this._initKeyboardNav();
    }
    
    console.log('[A11y] 无障碍支持已初始化');
  },
  
  apply() {
    const root = document.documentElement;
    
    // 高对比度
    if (this.settings.highContrast) {
      root.setAttribute('data-high-contrast', 'true');
    } else {
      root.removeAttribute('data-high-contrast');
    }
    
    // 减少动态效果
    if (this.settings.reducedMotion) {
      root.setAttribute('data-reduced-motion', 'true');
      const style = document.getElementById('a11y-reduced-motion');
      if (!style) {
        const s = document.createElement('style');
        s.id = 'a11y-reduced-motion';
        s.textContent = '*{animation-duration:0.01ms!important;animation-iteration-count:1!important;transition-duration:0.01ms!important;scroll-behavior:auto!important}';
        document.head.appendChild(s);
      }
    }
    
    // 字体大小
    root.style.fontSize = this.settings.fontSize + '%';
    
    // 屏幕阅读器优化
    if (this.settings.screenReader) {
      root.setAttribute('data-screen-reader', 'true');
    }
  },
  
  set(key, value) {
    this.settings[key] = value;
    Storage.local.set('a11y_settings', this.settings);
    this.apply();
  },
  
  _initKeyboardNav() {
    // Tab键导航焦点可见
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-nav');
      }
    });
    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-nav');
    });
    
    // 添加焦点样式
    const style = document.createElement('style');
    style.textContent = '.keyboard-nav *:focus{outline:3px solid #5ba3d9!important;outline-offset:2px!important;border-radius:4px}';
    document.head.appendChild(style);
    
    // 快捷键
    document.addEventListener('keydown', (e) => {
      // Alt+数字 切换Tab
      if (e.altKey && e.key >= '1' && e.key <= '5') {
        e.preventDefault();
        const tabs = ['home', 'compute', 'learn', 'ai', 'profile'];
        Router.switchTab(tabs[parseInt(e.key) - 1]);
      }
      // Alt+S 搜索
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        Router.navigateTo('page-search');
      }
      // Alt+N 通知
      if (e.altKey && e.key === 'n') {
        e.preventDefault();
        Router.navigateTo('page-notifications');
      }
    });
  },
  
  // 为元素添加aria标签
  addAriaLabels() {
    document.querySelectorAll('[data-lucide]').forEach(icon => {
      const parent = icon.parentElement;
      if (parent && !parent.getAttribute('aria-label') && parent.textContent.trim()) {
        parent.setAttribute('aria-label', parent.textContent.trim());
      }
    });
  },
  
  // 屏幕阅读器公告
  announce(message, priority = 'polite') {
    let region = document.getElementById('a11y-live-region');
    if (!region) {
      region = document.createElement('div');
      region.id = 'a11y-live-region';
      region.setAttribute('aria-live', priority);
      region.setAttribute('aria-atomic', 'true');
      region.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)';
      document.body.appendChild(region);
    }
    region.textContent = message;
    setTimeout(() => { region.textContent = ''; }, 1000);
  }
};

A11y.init();
window.A11y = A11y;

// ============================================================
// Core 初始化完成
// ============================================================

UniSci.ready = true;
UniSci.emit('coreReady');
console.log('[UniSci Core] v' + UniSci.version + ' 全部模块加载完成');
