/**
 * UniSci Platform V2 - API 对接层
 * 封装所有后端API调用，支持真实后端和本地模拟数据双模式
 * 
 * 使用方式:
 *   const api = new UniSciAPI({ baseURL: 'http://localhost:8080/api/v1' });
 *   const { data } = await api.auth.login({ email, password });
 * 
 * 后端服务端口:
 *   API网关: 8080
 *   用户服务: 8081
 *   调度服务: 8082
 *   计费服务: 8083
 *   存储服务: 8084
 *   教育服务: 8085
 *   Notebook服务: 8086
 *   工作流引擎: 8087
 */

'use strict';

class UniSciAPI {
  constructor(options = {}) {
    this.baseURL = options.baseURL || '/api/v1';
    this.timeout = options.timeout || 30000;
    this.token = options.token || localStorage.getItem('unisci_token') || null;
    this.mockMode = options.mockMode !== undefined ? options.mockMode : true; // 默认模拟模式
    this.autoFallback = options.autoFallback !== undefined ? options.autoFallback : true; // 自动降级到模拟模式
    this.mockData = options.mockData || null;
    this.listeners = [];
    this.cache = new Map(); // 响应缓存
    this.cacheTTL = options.cacheTTL || 60000; // 缓存有效期1分钟
    this.retryCount = options.retryCount || 1; // 失败重试次数
    this.retryDelay = options.retryDelay || 500; // 重试延迟ms
    this.loadingCount = 0; // 全局加载计数
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

    // 监听在线/离线状态
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => { this.isOnline = true; this._emit('online', {}); });
      window.addEventListener('offline', () => { this.isOnline = false; this._emit('offline', {}); });
    }
  }

  // =========================================================================
  // 核心请求方法
  // =========================================================================

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('unisci_token', token);
    } else {
      localStorage.removeItem('unisci_token');
    }
  }

  getToken() {
    return this.token;
  }

  setMockMode(enabled) {
    this.mockMode = enabled;
  }

  async request(method, path, data = null, config = {}) {
    const url = `${this.baseURL}${path}`;
    const cacheKey = `${method}:${path}:${JSON.stringify(data || {})}`;
    const useCache = config.cache !== false && method === 'GET';

    // 检查缓存
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.time < this.cacheTTL) {
        this._emit('cache-hit', { path });
        return cached.data;
      }
      this.cache.delete(cacheKey);
    }

    // 模拟模式：直接返回模拟数据
    if (this.mockMode) {
      return this._mockResponse(method, path, data);
    }

    // 离线检测：自动降级到模拟模式
    if (!this.isOnline && this.autoFallback) {
      this._emit('offline-fallback', { path });
      return this._mockResponse(method, path, data);
    }

    // 开始加载
    this._startLoading();

    try {
      const result = await this._requestWithRetry(method, url, data, config);

      // 写入缓存
      if (useCache) {
        this.cache.set(cacheKey, { data: result, time: Date.now() });
      }

      this._emit('response', { method, path, status: result.status, data: result.data });
      return result;
    } catch (error) {
      // 自动降级到模拟模式
      if (this.autoFallback && (error.status >= 500 || error.name === 'AbortError' || error.message.includes('Failed to fetch'))) {
        this._emit('auto-fallback', { path, error: error.message });
        return this._mockResponse(method, path, data);
      }
      this._emit('error', { method, path, error });
      throw error;
    } finally {
      this._endLoading();
    }
  }

  // 带重试的请求
  async _requestWithRetry(method, url, data, config) {
    let lastError;
    for (let attempt = 0; attempt <= this.retryCount; attempt++) {
      try {
        return await this._doRequest(method, url, data, config);
      } catch (error) {
        lastError = error;
        // 只对网络错误和5xx重试，不对4xx重试
        if (attempt < this.retryCount && (error.name === 'AbortError' || error.status >= 500 || error.message.includes('Failed to fetch'))) {
          await this._sleep(this.retryDelay * (attempt + 1));
          continue;
        }
        throw error;
      }
    }
    throw lastError;
  }

  // 实际请求
  async _doRequest(method, url, data, config) {
    const headers = {
      'Content-Type': 'application/json',
      ...(config.headers || {})
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const fetchConfig = {
        method,
        headers,
        signal: controller.signal
      };

      if (data && method !== 'GET') {
        fetchConfig.body = JSON.stringify(data);
      }

      const response = await fetch(url, fetchConfig);
      clearTimeout(timeoutId);

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new APIError(response.status, result.error || result.message || '请求失败', result);
      }

      return { data: result, status: response.status, headers: response.headers };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new APIError(408, '请求超时', null);
      }
      throw error;
    }
  }

  // 加载状态管理
  _startLoading() {
    this.loadingCount++;
    if (this.loadingCount === 1) {
      this._emit('loading-start', {});
    }
  }

  _endLoading() {
    this.loadingCount = Math.max(0, this.loadingCount - 1);
    if (this.loadingCount === 0) {
      this._emit('loading-end', {});
    }
  }

  isLoading() {
    return this.loadingCount > 0;
  }

  // 清空缓存
  clearCache() {
    this.cache.clear();
  }

  // 健康检查
  async checkHealth() {
    try {
      const result = await this.get('/health');
      return { online: true, data: result.data };
    } catch (error) {
      return { online: false, error: error.message };
    }
  }

  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  get(path, config) { return this.request('GET', path, null, config); }
  post(path, data, config) { return this.request('POST', path, data, config); }
  put(path, data, config) { return this.request('PUT', path, data, config); }
  patch(path, data, config) { return this.request('PATCH', path, data, config); }
  delete(path, config) { return this.request('DELETE', path, null, config); }

  // 文件上传
  async upload(path, file, onProgress) {
    if (this.mockMode) {
      return this._mockResponse('POST', path, { file: file.name });
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${this.baseURL}${path}`, {
      method: 'POST',
      headers: this.token ? { 'Authorization': `Bearer ${this.token}` } : {},
      body: formData
    });
    
    return response.json();
  }

  // =========================================================================
  // 事件系统
  // =========================================================================

  on(event, callback) {
    this.listeners.push({ event, callback });
    return () => {
      this.listeners = this.listeners.filter(l => l.callback !== callback);
    };
  }

  _emit(event, data) {
    this.listeners
      .filter(l => l.event === event)
      .forEach(l => l.callback(data));
  }

  // =========================================================================
  // 模拟响应（开发阶段使用）
  // =========================================================================

  _mockResponse(method, path, data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockResult = this._generateMockData(method, path, data);
        resolve({ data: mockResult, status: 200, headers: new Headers() });
      }, 200 + Math.random() * 300);
    });
  }

  _generateMockData(method, path, data) {
    // 认证相关
    if (path.includes('/auth/login')) {
      return {
        token: 'mock_jwt_token_' + Date.now(),
        user: {
          id: '11111111-1111-1111-1111-111111111111',
          email: data?.email || 'demo@unisci.cn',
          username: 'demo',
          display_name: '演示用户',
          education_stage: 'undergrad',
          avatar_url: null,
          created_at: new Date().toISOString()
        },
        expires_in: 86400
      };
    }
    
    if (path.includes('/auth/register')) {
      return {
        message: '注册成功',
        user: { id: uuid(), email: data?.email, username: data?.username }
      };
    }
    
    if (path.includes('/auth/me') || path.includes('/users/me')) {
      return {
        id: '11111111-1111-1111-1111-111111111111',
        email: 'demo@unisci.cn',
        username: 'demo',
        display_name: '演示用户',
        bio: '热爱科学计算的学生',
        education_stage: 'undergrad',
        avatar_url: null,
        status: 'active',
        email_verified: true,
        created_at: '2026-01-01T00:00:00Z'
      };
    }

    // 计算任务相关
    if (path.includes('/jobs') && method === 'GET') {
      if (path.includes('/jobs/')) {
        const jobId = path.split('/').pop();
        return {
          id: jobId,
          name: 'MoS2能带结构计算',
          job_type: 'dft',
          software: 'vasp',
          status: 'completed',
          cpu_cores: 16,
          gpu_count: 0,
          memory_gb: 32,
          created_at: '2026-08-20T10:00:00Z',
          started_at: '2026-08-20T10:05:00Z',
          completed_at: '2026-08-20T11:30:00Z',
          cost_credits: 15.5
        };
      }
      return {
        items: [
          { id: uuid(), name: 'MoS2能带计算', job_type: 'dft', software: 'vasp', status: 'completed', created_at: '2026-08-20T10:00:00Z' },
          { id: uuid(), name: '石墨烯结构优化', job_type: 'optimization', software: 'qe', status: 'running', created_at: '2026-08-24T08:00:00Z' },
          { id: uuid(), name: '水分子MD模拟', job_type: 'md', software: 'lammps', status: 'queued', created_at: '2026-08-24T09:00:00Z' }
        ],
        total: 3,
        page: 1,
        page_size: 20
      };
    }
    
    if (path.includes('/jobs') && method === 'POST') {
      return {
        id: uuid(),
        name: data?.name || '新建计算任务',
        status: 'pending',
        message: '任务已提交，正在排队'
      };
    }

    // Notebook相关
    if (path.includes('/notebooks') && method === 'GET') {
      return {
        items: [
          { id: uuid(), title: 'DFT结果分析', kernel: 'python', status: 'idle', cell_count: 12, updated_at: '2026-08-23T15:00:00Z' },
          { id: uuid(), title: '分子动力学后处理', kernel: 'python', status: 'running', cell_count: 8, updated_at: '2026-08-24T10:00:00Z' }
        ],
        total: 2
      };
    }

    // 材料数据库相关
    if (path.includes('/materials') && method === 'GET') {
      return {
        items: [
          { id: uuid(), formula: 'MoS2', name: '二硫化钼', category: '二维材料', bandgap: 1.8, type: '半导体' },
          { id: uuid(), formula: 'Graphene', name: '石墨烯', category: '二维材料', bandgap: 0, type: '半金属' },
          { id: uuid(), formula: 'Si', name: '硅', category: '半导体', bandgap: 1.12, type: '半导体' }
        ],
        total: 27,
        page: 1
      };
    }

    // 课程相关
    if (path.includes('/courses') && method === 'GET') {
      return {
        items: [
          { id: uuid(), title: '密度泛函理论进阶', difficulty: 'advanced', category: 'physics', total_lessons: 16 },
          { id: uuid(), title: '材料科学基础', difficulty: 'beginner', category: 'materials', total_lessons: 24 }
        ],
        total: 12
      };
    }

    // 默认返回
    return { success: true, message: '操作成功', data: data || {} };
  }

  // =========================================================================
  // API 模块 - 认证
  // =========================================================================

  get auth() {
    return {
      register: (data) => this.post('/auth/register', data),
      login: (data) => this.post('/auth/login', data),
      logout: () => this.post('/auth/logout'),
      refreshToken: (refreshToken) => this.post('/auth/refresh', { refresh_token: refreshToken }),
      getCurrentUser: () => this.get('/auth/me'),
      updateProfile: (data) => this.patch('/auth/me', data),
      changePassword: (data) => this.post('/auth/change-password', data),
      verifyEmail: (token) => this.post('/auth/verify-email', { token }),
      requestPasswordReset: (email) => this.post('/auth/password-reset/request', { email }),
      resetPassword: (data) => this.post('/auth/password-reset/confirm', data)
    };
  }

  // =========================================================================
  // API 模块 - 用户
  // =========================================================================

  get users() {
    return {
      getById: (id) => this.get(`/users/${id}`),
      getByUsername: (username) => this.get(`/users/username/${username}`),
      search: (query) => this.get(`/users/search?q=${encodeURIComponent(query)}`),
      
      // 组织
      listOrganizations: () => this.get('/users/me/organizations'),
      createOrganization: (data) => this.post('/organizations', data),
      getOrganization: (id) => this.get(`/organizations/${id}`),
      updateOrganization: (id, data) => this.patch(`/organizations/${id}`, data),
      deleteOrganization: (id) => this.delete(`/organizations/${id}`),
      addOrgMember: (orgId, data) => this.post(`/organizations/${orgId}/members`, data),
      removeOrgMember: (orgId, userId) => this.delete(`/organizations/${orgId}/members/${userId}`),
      
      // API密钥
      listAPIKeys: () => this.get('/users/me/api-keys'),
      createAPIKey: (data) => this.post('/users/me/api-keys', data),
      revokeAPIKey: (id) => this.delete(`/users/me/api-keys/${id}`)
    };
  }

  // =========================================================================
  // API 模块 - 计算任务
  // =========================================================================

  get jobs() {
    return {
      list: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return this.get(`/jobs${query ? '?' + query : ''}`);
      },
      get: (id) => this.get(`/jobs/${id}`),
      create: (data) => this.post('/jobs', data),
      cancel: (id) => this.post(`/jobs/${id}/cancel`),
      retry: (id) => this.post(`/jobs/${id}/retry`),
      delete: (id) => this.delete(`/jobs/${id}`),
      
      // 日志
      getLogs: (id, params = {}) => {
        const query = new URLSearchParams(params).toString();
        return this.get(`/jobs/${id}/logs${query ? '?' + query : ''}`);
      },
      
      // 结果
      getResults: (id) => this.get(`/jobs/${id}/results`),
      getResultDetail: (jobId, resultId) => this.get(`/jobs/${jobId}/results/${resultId}`),
      
      // 文件
      getFiles: (id) => this.get(`/jobs/${id}/files`),
      downloadFile: (jobId, fileId) => `${this.baseURL}/jobs/${jobId}/files/${fileId}/download`,
      
      // 统计
      getStats: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return this.get(`/jobs/stats${query ? '?' + query : ''}`);
      }
    };
  }

  // =========================================================================
  // API 模块 - Notebook
  // =========================================================================

  get notebooks() {
    return {
      list: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return this.get(`/notebooks${query ? '?' + query : ''}`);
      },
      get: (id) => this.get(`/notebooks/${id}`),
      create: (data) => this.post('/notebooks', data),
      update: (id, data) => this.patch(`/notebooks/${id}`, data),
      delete: (id) => this.delete(`/notebooks/${id}`),
      fork: (id) => this.post(`/notebooks/${id}/fork`),
      
      // 运行
      start: (id) => this.post(`/notebooks/${id}/start`),
      stop: (id) => this.post(`/notebooks/${id}/stop`),
      executeCell: (id, cellIndex, code) => this.post(`/notebooks/${id}/execute`, { cell_index: cellIndex, code }),
      executeAll: (id) => this.post(`/notebooks/${id}/execute-all`),
      
      // 模板
      listTemplates: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return this.get(`/notebooks/templates${query ? '?' + query : ''}`);
      },
      createFromTemplate: (templateId) => this.post(`/notebooks/templates/${templateId}/use`),
      
      // 分享
      share: (id, data) => this.post(`/notebooks/${id}/share`, data),
      getShared: (token) => this.get(`/notebooks/shared/${token}`)
    };
  }

  // =========================================================================
  // API 模块 - 工作流
  // =========================================================================

  get workflows() {
    return {
      list: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return this.get(`/workflows${query ? '?' + query : ''}`);
      },
      get: (id) => this.get(`/workflows/${id}`),
      create: (data) => this.post('/workflows', data),
      update: (id, data) => this.patch(`/workflows/${id}`, data),
      delete: (id) => this.delete(`/workflows/${id}`),
      fork: (id) => this.post(`/workflows/${id}/fork`),
      
      // 运行
      run: (id, inputs = {}) => this.post(`/workflows/${id}/run`, { inputs }),
      stop: (runId) => this.post(`/workflows/runs/${runId}/stop`),
      getRuns: (workflowId) => this.get(`/workflows/${workflowId}/runs`),
      getRun: (runId) => this.get(`/workflows/runs/${runId}`),
      getRunLogs: (runId) => this.get(`/workflows/runs/${runId}/logs`),
      
      // 模板
      listTemplates: () => this.get('/workflows/templates'),
      createFromTemplate: (templateId) => this.post(`/workflows/templates/${templateId}/use`)
    };
  }

  // =========================================================================
  // API 模块 - 材料数据库
  // =========================================================================

  get materials() {
    return {
      list: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return this.get(`/materials${query ? '?' + query : ''}`);
      },
      get: (id) => this.get(`/materials/${id}`),
      getByFormula: (formula) => this.get(`/materials/formula/${encodeURIComponent(formula)}`),
      search: (query) => this.get(`/materials/search?q=${encodeURIComponent(query)}`),
      advancedSearch: (filters) => this.post('/materials/advanced-search', filters),
      
      // 收藏
      getFavorites: () => this.get('/materials/favorites'),
      addFavorite: (id) => this.post(`/materials/${id}/favorite`),
      removeFavorite: (id) => this.delete(`/materials/${id}/favorite`),
      
      // 对比
      compare: (ids) => this.post('/materials/compare', { ids }),
      
      // 导出
      export: (id, format) => this.get(`/materials/${id}/export?format=${format}`),
      
      // 分类
      getCategories: () => this.get('/materials/categories')
    };
  }

  // =========================================================================
  // API 模块 - 教育
  // =========================================================================

  get education() {
    return {
      // 课程
      listCourses: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return this.get(`/courses${query ? '?' + query : ''}`);
      },
      getCourse: (id) => this.get(`/courses/${id}`),
      getCourseBySlug: (slug) => this.get(`/courses/slug/${slug}`),
      enrollCourse: (id) => this.post(`/courses/${id}/enroll`),
      unenrollCourse: (id) => this.delete(`/courses/${id}/enroll`),
      getMyCourses: () => this.get('/courses/my'),
      
      // 课时
      getLessons: (courseId) => this.get(`/courses/${courseId}/lessons`),
      getLesson: (lessonId) => this.get(`/lessons/${lessonId}`),
      updateProgress: (lessonId, data) => this.post(`/lessons/${lessonId}/progress`, data),
      completeLesson: (lessonId) => this.post(`/lessons/${lessonId}/complete`),
      
      // 学习进度
      getCourseProgress: (courseId) => this.get(`/courses/${courseId}/progress`),
      
      // 实验
      listExperiments: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return this.get(`/experiments${query ? '?' + query : ''}`);
      },
      getExperiment: (id) => this.get(`/experiments/${id}`),
      runExperiment: (id, params = {}) => this.post(`/experiments/${id}/run`, params)
    };
  }

  // =========================================================================
  // API 模块 - 知识图谱
  // =========================================================================

  get knowledge() {
    return {
      listNodes: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return this.get(`/knowledge/nodes${query ? '?' + query : ''}`);
      },
      getNode: (id) => this.get(`/knowledge/nodes/${id}`),
      getNodeBySlug: (slug) => this.get(`/knowledge/nodes/slug/${slug}`),
      searchNodes: (query) => this.get(`/knowledge/search?q=${encodeURIComponent(query)}`),
      getRelations: (nodeId) => this.get(`/knowledge/nodes/${nodeId}/relations`),
      getGraph: (centerId, depth = 2) => this.get(`/knowledge/graph?center=${centerId}&depth=${depth}`),
      getCategories: () => this.get('/knowledge/categories'),
      getRelatedCourses: (nodeId) => this.get(`/knowledge/nodes/${nodeId}/courses`),
      getRelatedMaterials: (nodeId) => this.get(`/knowledge/nodes/${nodeId}/materials`)
    };
  }

  // =========================================================================
  // API 模块 - 社区
  // =========================================================================

  get community() {
    return {
      // 文章
      listArticles: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return this.get(`/articles${query ? '?' + query : ''}`);
      },
      getArticle: (id) => this.get(`/articles/${id}`),
      getArticleBySlug: (slug) => this.get(`/articles/slug/${slug}`),
      createArticle: (data) => this.post('/articles', data),
      updateArticle: (id, data) => this.patch(`/articles/${id}`, data),
      deleteArticle: (id) => this.delete(`/articles/${id}`),
      
      // 评论
      listComments: (articleId) => this.get(`/articles/${articleId}/comments`),
      createComment: (articleId, data) => this.post(`/articles/${articleId}/comments`, data),
      deleteComment: (commentId) => this.delete(`/comments/${commentId}`),
      
      // 点赞
      like: (targetType, targetId) => this.post('/likes', { target_type: targetType, target_id: targetId }),
      unlike: (targetType, targetId) => this.delete(`/likes/${targetType}/${targetId}`),
      
      // 用户内容
      getMyArticles: () => this.get('/articles/my'),
      getUserArticles: (userId) => this.get(`/users/${userId}/articles`)
    };
  }

  // =========================================================================
  // API 模块 - 文件存储
  // =========================================================================

  get storage() {
    return {
      // 文件夹
      listFolders: (parentId = null) => this.get(`/folders${parentId ? `?parent_id=${parentId}` : ''}`),
      createFolder: (data) => this.post('/folders', data),
      deleteFolder: (id) => this.delete(`/folders/${id}`),
      
      // 文件
      listFiles: (folderId = null) => this.get(`/files${folderId ? `?folder_id=${folderId}` : ''}`),
      getFile: (id) => this.get(`/files/${id}`),
      uploadFile: (file, folderId, onProgress) => this.upload(`/files${folderId ? `?folder_id=${folderId}` : ''}`, file, onProgress),
      deleteFile: (id) => this.delete(`/files/${id}`),
      downloadFile: (id) => `${this.baseURL}/files/${id}/download`,
      getFileUrl: (id) => `${this.baseURL}/files/${id}/url`,
      
      // 分享
      shareFile: (id, data) => this.post(`/files/${id}/share`, data),
      getSharedFile: (token) => this.get(`/files/shared/${token}`),
      
      // 统计
      getUsage: () => this.get('/storage/usage')
    };
  }

  // =========================================================================
  // API 模块 - 计费
  // =========================================================================

  get billing() {
    return {
      getAccount: () => this.get('/billing/account'),
      getTransactions: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return this.get(`/billing/transactions${query ? '?' + query : ''}`);
      },
      getInvoices: () => this.get('/billing/invoices'),
      getInvoice: (id) => this.get(`/billing/invoices/${id}`),
      
      // 套餐
      listPlans: () => this.get('/billing/plans'),
      getCurrentPlan: () => this.get('/billing/plan/current'),
      subscribe: (planId, data) => this.post('/billing/subscribe', { plan_id: planId, ...data }),
      cancelSubscription: () => this.post('/billing/subscription/cancel'),
      
      // 充值
      recharge: (amount) => this.post('/billing/recharge', { amount }),
      
      // 配额
      getQuota: () => this.get('/billing/quota'),
      getUsage: () => this.get('/billing/usage')
    };
  }

  // =========================================================================
  // API 模块 - 通知
  // =========================================================================

  get notifications() {
    return {
      list: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return this.get(`/notifications${query ? '?' + query : ''}`);
      },
      getUnreadCount: () => this.get('/notifications/unread-count'),
      markAsRead: (id) => this.post(`/notifications/${id}/read`),
      markAllAsRead: () => this.post('/notifications/read-all'),
      delete: (id) => this.delete(`/notifications/${id}`),
      clearAll: () => this.delete('/notifications')
    };
  }

  // =========================================================================
  // API 模块 - 系统
  // =========================================================================

  get system() {
    return {
      health: () => this.get('/health'),
      status: () => this.get('/system/status'),
      getCapabilities: () => this.get('/system/capabilities'),
      getSoftwareList: () => this.get('/system/software'),
      getClusterStatus: () => this.get('/system/clusters'),
      getAnnouncements: () => this.get('/system/announcements')
    };
  }
}

// =========================================================================
// 工具函数
// =========================================================================

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

class APIError extends Error {
  constructor(status, message, data = null) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { UniSciAPI, APIError };
}
if (typeof window !== 'undefined') {
  window.UniSciAPI = UniSciAPI;
  window.APIError = APIError;
}
