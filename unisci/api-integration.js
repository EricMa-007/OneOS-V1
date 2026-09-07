/**
 * UniSci Platform V2 - API 集成层
 * 统一管理API调用、数据适配、加载状态、错误处理
 * 作为前端各模块与api.js之间的桥梁
 *
 * 使用方式:
 *   const data = await APIIntegration.jobs.list();
 *   APIIntegration.onLoadingChange((isLoading) => { ... });
 */

'use strict';

const APIIntegration = (function() {
  // 全局API实例
  let api = null;
  let loadingListeners = [];
  let errorListeners = [];

  // 初始化
  function init(options = {}) {
    if (api) return api;

    api = new UniSciAPI({
      baseURL: options.baseURL || localStorage.getItem('unisci_api_base') || '/api/v1',
      mockMode: options.mockMode !== undefined ? options.mockMode : localStorage.getItem('unisci_mock_mode') !== 'false',
      autoFallback: options.autoFallback !== undefined ? options.autoFallback : true,
      timeout: options.timeout || 30000,
      retryCount: options.retryCount || 1,
    });

    // 监听加载状态
    api.on('loading-start', () => {
      loadingListeners.forEach(fn => fn(true));
    });
    api.on('loading-end', () => {
      loadingListeners.forEach(fn => fn(false));
    });

    // 监听错误
    api.on('error', (data) => {
      errorListeners.forEach(fn => fn(data));
    });

    // 监听自动降级
    api.on('auto-fallback', (data) => {
      console.warn('[API] 自动降级到模拟模式:', data.path, data.error);
    });

    return api;
  }

  // 获取API实例
  function getAPI() {
    if (!api) init();
    return api;
  }

  // 切换模式
  function setMockMode(enabled) {
    getAPI().setMockMode(enabled);
    localStorage.setItem('unisci_mock_mode', enabled ? 'true' : 'false');
    getAPI().clearCache();
  }

  function isMockMode() {
    return getAPI().mockMode;
  }

  // 设置API基础URL
  function setBaseURL(url) {
    getAPI().baseURL = url;
    localStorage.setItem('unisci_api_base', url);
    getAPI().clearCache();
  }

  // 加载状态监听
  function onLoadingChange(callback) {
    loadingListeners.push(callback);
    return () => {
      loadingListeners = loadingListeners.filter(fn => fn !== callback);
    };
  }

  // 错误监听
  function onError(callback) {
    errorListeners.push(callback);
    return () => {
      errorListeners = errorListeners.filter(fn => fn !== callback);
    };
  }

  // 统一错误处理
  function handleError(error, context = '') {
    console.error(`[API Error] ${context}:`, error);
    const message = error.data?.error || error.message || '请求失败';
    if (typeof UI !== 'undefined' && UI.toast) {
      UI.toast(message, 'error');
    }
    return { error: true, message, status: error.status };
  }

  // 统一数据包装
  function wrapResult(promise, context = '') {
    return promise
      .then(result => ({ success: true, data: result.data, status: result.status }))
      .catch(error => {
        handleError(error, context);
        return { success: false, error: true, message: error.message, status: error.status };
      });
  }

  // =========================================================================
  // 数据模块 - 计算任务
  // =========================================================================
  const jobs = {
    list: (params = {}) => wrapResult(getAPI().jobs.list(params), 'jobs.list'),
    get: (id) => wrapResult(getAPI().jobs.get(id), 'jobs.get'),
    create: (data) => wrapResult(getAPI().jobs.create(data), 'jobs.create'),
    cancel: (id) => wrapResult(getAPI().jobs.cancel(id), 'jobs.cancel'),
    retry: (id) => wrapResult(getAPI().jobs.retry(id), 'jobs.retry'),
    getResults: (id) => wrapResult(getAPI().jobs.getResults(id), 'jobs.getResults'),
    getFiles: (id) => wrapResult(getAPI().jobs.getFiles(id), 'jobs.getFiles'),
    getStats: (params = {}) => wrapResult(getAPI().jobs.getStats(params), 'jobs.getStats'),
  };

  // =========================================================================
  // 数据模块 - Notebook
  // =========================================================================
  const notebooks = {
    list: (params = {}) => wrapResult(getAPI().notebooks.list(params), 'notebooks.list'),
    get: (id) => wrapResult(getAPI().notebooks.get(id), 'notebooks.get'),
    create: (data) => wrapResult(getAPI().notebooks.create(data), 'notebooks.create'),
    delete: (id) => wrapResult(getAPI().notebooks.delete(id), 'notebooks.delete'),
    start: (id) => wrapResult(getAPI().notebooks.start(id), 'notebooks.start'),
    stop: (id) => wrapResult(getAPI().notebooks.stop(id), 'notebooks.stop'),
    listTemplates: (params = {}) => wrapResult(getAPI().notebooks.listTemplates(params), 'notebooks.listTemplates'),
  };

  // =========================================================================
  // 数据模块 - 工作流
  // =========================================================================
  const workflows = {
    list: (params = {}) => wrapResult(getAPI().workflows.list(params), 'workflows.list'),
    get: (id) => wrapResult(getAPI().workflows.get(id), 'workflows.get'),
    create: (data) => wrapResult(getAPI().workflows.create(data), 'workflows.create'),
    update: (id, data) => wrapResult(getAPI().workflows.update(id, data), 'workflows.update'),
    delete: (id) => wrapResult(getAPI().workflows.delete(id), 'workflows.delete'),
    run: (id, inputs = {}) => wrapResult(getAPI().workflows.run(id, inputs), 'workflows.run'),
    getRuns: (workflowId) => wrapResult(getAPI().workflows.getRuns(workflowId), 'workflows.getRuns'),
    getRun: (runId) => wrapResult(getAPI().workflows.getRun(runId), 'workflows.getRun'),
  };

  // =========================================================================
  // 数据模块 - 材料数据库
  // =========================================================================
  const materials = {
    list: (params = {}) => wrapResult(getAPI().materials.list(params), 'materials.list'),
    get: (id) => wrapResult(getAPI().materials.get(id), 'materials.get'),
    search: (query) => wrapResult(getAPI().materials.search(query), 'materials.search'),
    getFavorites: () => wrapResult(getAPI().materials.getFavorites(), 'materials.getFavorites'),
    addFavorite: (id) => wrapResult(getAPI().materials.addFavorite(id), 'materials.addFavorite'),
    removeFavorite: (id) => wrapResult(getAPI().materials.removeFavorite(id), 'materials.removeFavorite'),
    compare: (ids) => wrapResult(getAPI().materials.compare(ids), 'materials.compare'),
    getCategories: () => wrapResult(getAPI().materials.getCategories(), 'materials.getCategories'),
  };

  // =========================================================================
  // 数据模块 - 知识图谱
  // =========================================================================
  const knowledge = {
    listNodes: (params = {}) => wrapResult(getAPI().knowledge.listNodes(params), 'knowledge.listNodes'),
    getNode: (id) => wrapResult(getAPI().knowledge.getNode(id), 'knowledge.getNode'),
    getNodeBySlug: (slug) => wrapResult(getAPI().knowledge.getNodeBySlug(slug), 'knowledge.getNodeBySlug'),
    searchNodes: (query) => wrapResult(getAPI().knowledge.searchNodes(query), 'knowledge.searchNodes'),
    getRelations: (nodeId) => wrapResult(getAPI().knowledge.getRelations(nodeId), 'knowledge.getRelations'),
    getGraph: (centerId, depth = 2) => wrapResult(getAPI().knowledge.getGraph(centerId, depth), 'knowledge.getGraph'),
    getCategories: () => wrapResult(getAPI().knowledge.getCategories(), 'knowledge.getCategories'),
    getStats: () => wrapResult(getAPI().system.status(), 'knowledge.getStats'),
  };

  // =========================================================================
  // 数据模块 - 教育
  // =========================================================================
  const education = {
    listCourses: (params = {}) => wrapResult(getAPI().education.listCourses(params), 'education.listCourses'),
    getCourse: (id) => wrapResult(getAPI().education.getCourse(id), 'education.getCourse'),
    enrollCourse: (id) => wrapResult(getAPI().education.enrollCourse(id), 'education.enrollCourse'),
    getMyCourses: () => wrapResult(getAPI().education.getMyCourses(), 'education.getMyCourses'),
    getLessons: (courseId) => wrapResult(getAPI().education.getLessons(courseId), 'education.getLessons'),
    listExperiments: (params = {}) => wrapResult(getAPI().education.listExperiments(params), 'education.listExperiments'),
    getExperiment: (id) => wrapResult(getAPI().education.getExperiment(id), 'education.getExperiment'),
  };

  // =========================================================================
  // 数据模块 - 认证与用户
  // =========================================================================
  const auth = {
    login: (data) => wrapResult(getAPI().auth.login(data), 'auth.login'),
    register: (data) => wrapResult(getAPI().auth.register(data), 'auth.register'),
    logout: () => {
      getAPI().setToken(null);
      return Promise.resolve({ success: true });
    },
    getCurrentUser: () => wrapResult(getAPI().auth.getCurrentUser(), 'auth.getCurrentUser'),
    updateProfile: (data) => wrapResult(getAPI().auth.updateProfile(data), 'auth.updateProfile'),
    setToken: (token) => getAPI().setToken(token),
    getToken: () => getAPI().getToken(),
  };

  // =========================================================================
  // 数据模块 - 计费
  // =========================================================================
  const billing = {
    getAccount: () => wrapResult(getAPI().billing.getAccount(), 'billing.getAccount'),
    getTransactions: (params = {}) => wrapResult(getAPI().billing.getTransactions(params), 'billing.getTransactions'),
    listPlans: () => wrapResult(getAPI().billing.listPlans(), 'billing.listPlans'),
    getCurrentPlan: () => wrapResult(getAPI().billing.getCurrentPlan(), 'billing.getCurrentPlan'),
    getQuota: () => wrapResult(getAPI().billing.getQuota(), 'billing.getQuota'),
    getUsage: () => wrapResult(getAPI().billing.getUsage(), 'billing.getUsage'),
  };

  // =========================================================================
  // 数据模块 - 通知
  // =========================================================================
  const notifications = {
    list: (params = {}) => wrapResult(getAPI().notifications.list(params), 'notifications.list'),
    getUnreadCount: () => wrapResult(getAPI().notifications.getUnreadCount(), 'notifications.getUnreadCount'),
    markAsRead: (id) => wrapResult(getAPI().notifications.markAsRead(id), 'notifications.markAsRead'),
    markAllAsRead: () => wrapResult(getAPI().notifications.markAllAsRead(), 'notifications.markAllAsRead'),
  };

  // =========================================================================
  // 数据模块 - 系统
  // =========================================================================
  const system = {
    health: () => wrapResult(getAPI().system.health(), 'system.health'),
    status: () => wrapResult(getAPI().system.status(), 'system.status'),
    getCapabilities: () => wrapResult(getAPI().system.getCapabilities(), 'system.getCapabilities'),
    getSoftwareList: () => wrapResult(getAPI().system.getSoftwareList(), 'system.getSoftwareList'),
    getClusterStatus: () => wrapResult(getAPI().system.getClusterStatus(), 'system.getClusterStatus'),
  };

  // 公开API
  return {
    init,
    getAPI,
    setMockMode,
    isMockMode,
    setBaseURL,
    onLoadingChange,
    onError,
    handleError,
    jobs,
    notebooks,
    workflows,
    materials,
    knowledge,
    education,
    auth,
    billing,
    notifications,
    system,
  };
})();

// 导出
if (typeof window !== 'undefined') {
  window.APIIntegration = APIIntegration;
}
