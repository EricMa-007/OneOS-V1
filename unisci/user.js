/**
 * UniSci Platform V2 - 板块9: 用户体系核心模块
 * 包含: 用户管理/登录注册/成就系统/设置管理/文章互动/动态时间线
 */

'use strict';

// ============================================================
// 一、用户管理器 (UserManager)
// ============================================================
const UserManager = {
  currentUserIndex: 0,
  users: [],
  
  init() {
    // 从mock-data.js加载用户数据
    if (typeof window.getAllUsers === 'function') {
      this.users = window.getAllUsers();
    }
    // 从localStorage恢复当前用户
    const saved = Storage.local.get('unisci_current_user_index');
    if (saved !== null && saved >= 0 && saved < this.users.length) {
      this.currentUserIndex = saved;
    }
  },
  
  getCurrentUser() {
    return this.users[this.currentUserIndex] || this.users[0] || {};
  },
  
  getAllUsers() {
    return this.users;
  },
  
  switchUser(index) {
    if (index < 0 || index >= this.users.length) return false;
    this.currentUserIndex = index;
    Storage.local.set('unisci_current_user_index', index);
    // 触发用户切换事件
    UniSci.emit('user:switched', this.getCurrentUser());
    return true;
  },
  
  // 登录验证
  login(username, password) {
    const user = this.users.find(u => 
      u.username === username || u.email === username
    );
    if (!user) return { success: false, message: '用户不存在' };
    if (user.password !== password) return { success: false, message: '密码错误' };
    const index = this.users.indexOf(user);
    this.switchUser(index);
    Storage.local.set('unisci_logged_in', 'true');
    Storage.local.set('unisci_login_time', new Date().toISOString());
    return { success: true, user };
  },
  
  logout() {
    Storage.local.remove('unisci_logged_in');
    UniSci.emit('user:loggedOut');
  },
  
  isLoggedIn() {
    return Storage.local.get('unisci_logged_in') === 'true';
  },
  
  // 注册新用户
  register(userData) {
    // 检查用户名唯一性
    if (this.users.find(u => u.username === userData.username)) {
      return { success: false, message: '用户名已被使用' };
    }
    const newUser = {
      id: 'user_' + Date.now(),
      username: userData.username,
      password: userData.password,
      name: userData.displayName || userData.username,
      avatar: userData.avatar || '👤',
      email: userData.email || '',
      phone: userData.phone || '',
      level: '免费版',
      levelColor: 'blue',
      role: userData.academicIdentity || '本科生',
      university: userData.institution || '',
      department: '',
      major: '',
      grade: '',
      bio: userData.bio || '',
      researchAreas: userData.researchAreas || [],
      stats: {
        totalJobs: 0, gpuHours: 0, courses: 0,
        notebooks: 0, articles: 0, workflows: 0,
        learningHours: 0, points: 0, followers: 0, following: 0
      },
      runningJobs: [], completedJobs: [],
      courses: [], notebooks: [], articles: [], workflows: [],
      favorites: [], achievements: [],
      settings: this.getDefaultSettings(),
      createdAt: new Date().toISOString()
    };
    this.users.push(newUser);
    this.switchUser(this.users.length - 1);
    Storage.local.set('unisci_logged_in', 'true');
    return { success: true, user: newUser };
  },
  
  getDefaultSettings() {
    return {
      theme: 'light',
      language: 'zh-CN',
      defaultSoftware: 'VASP',
      defaultKernel: 'Python 3.12',
      displayDensity: 'normal',
      autoSave: true,
      autoSaveInterval: 30,
      notifications: {
        system: true, job: true, course: true,
        community: true, resource: true, security: true, marketing: false
      },
      notificationChannels: { inApp: true, email: true, sms: false, wechat: false },
      doNotDisturb: { enabled: false, start: '22:00', end: '08:00' },
      privacy: {
        profileVisibility: 'public',
        activityVisibility: 'public',
        defaultJobVisibility: 'private',
        defaultNotebookVisibility: 'private',
        onlineStatus: true,
        searchable: true,
        dataAuthorization: false,
        personalizedRecommend: true
      },
      security: {
        twoFactorEnabled: false,
        twoFactorMethod: null,
        emailVerified: true,
        phoneVerified: false
      },
      editor: {
        fontFamily: 'monospace',
        fontSize: 14,
        theme: 'default',
        keybindings: 'default'
      },
      viewer3d: { defaultMode: 'ball-stick' },
      startupPage: 'home',
      animations: true,
      units: 'metric'
    };
  },
  
  // 更新用户资料
  updateProfile(updates) {
    const user = this.getCurrentUser();
    Object.assign(user, updates);
    user.updatedAt = new Date().toISOString();
    UniSci.emit('user:profileUpdated', user);
    return user;
  },
  
  // 获取用户统计
  getStats() {
    const u = this.getCurrentUser();
    return u.stats || {};
  }
};

// ============================================================
// 二、成就系统 (AchievementSystem)
// ============================================================
const AchievementSystem = {
  // 等级定义
  levels: [
    { level: 1, name: '探索者', minExp: 0, privileges: ['基础计算', '免费课程'] },
    { level: 2, name: '学习者', minExp: 100, privileges: ['基础计算', '免费课程', 'Notebook'] },
    { level: 3, name: '实践者', minExp: 500, privileges: ['基础计算', '免费课程', 'Notebook', '工作流'] },
    { level: 4, name: '研究者', minExp: 1000, privileges: ['全部基础功能', 'GPU加速(限时)'] },
    { level: 5, name: '专家', minExp: 3000, privileges: ['全部基础功能', 'GPU加速', 'API访问'] },
    { level: 6, name: '学者', minExp: 6000, privileges: ['全部功能', '优先算力', 'API访问'] },
    { level: 7, name: '大师', minExp: 10000, privileges: ['全部功能', '专属客服', '优先算力'] },
    { level: 8, name: '宗师', minExp: 20000, privileges: ['全部功能', '专属客服', '定制功能'] },
    { level: 9, name: '传奇', minExp: 50000, privileges: ['全部功能', '终身免费', '定制功能'] },
    { level: 10, name: '科学大师', minExp: 100000, privileges: ['全部功能', '终身免费', '定制功能', '荣誉顾问'] }
  ],
  
  // 徽章定义
  badges: [
    // 计算类
    { id: 'first_job', name: '初次计算', desc: '完成第一次计算任务', icon: 'cpu', category: 'compute', condition: { totalJobs: 1 } },
    { id: 'job_10', name: '计算新手', desc: '完成10次计算任务', icon: 'cpu', category: 'compute', condition: { totalJobs: 10 } },
    { id: 'job_100', name: '算力达人', desc: '完成100次计算任务', icon: 'zap', category: 'compute', condition: { totalJobs: 100 } },
    { id: 'gpu_master', name: 'GPU征服者', desc: '使用GPU计算超过100小时', icon: 'gauge', category: 'compute', condition: { gpuHours: 100 } },
    // 学习类
    { id: 'first_course', name: '勤奋学子', desc: '完成第一门课程', icon: 'book-open', category: 'learn', condition: { courses: 1 } },
    { id: 'course_10', name: '课程达人', desc: '完成10门课程', icon: 'graduation-cap', category: 'learn', condition: { courses: 10 } },
    { id: 'learning_100h', name: '知识渊博', desc: '累计学习超过100小时', icon: 'brain', category: 'learn', condition: { learningHours: 100 } },
    // 创作类
    { id: 'first_article', name: '初出茅庐', desc: '发布第一篇文章', icon: 'file-text', category: 'create', condition: { articles: 1 } },
    { id: 'article_10', name: '文笔生辉', desc: '发布10篇文章', icon: 'pen-tool', category: 'create', condition: { articles: 10 } },
    { id: 'likes_100', name: '社区之星', desc: '文章获赞超过100', icon: 'heart', category: 'create', condition: { likesReceived: 100 } },
    // 探索类
    { id: 'first_notebook', name: '笔记达人', desc: '创建第一个Notebook', icon: 'notebook-pen', category: 'explore', condition: { notebooks: 1 } },
    { id: 'first_workflow', name: '工作流工匠', desc: '创建第一个工作流', icon: 'workflow', category: 'explore', condition: { workflows: 1 } },
    { id: 'material_hunter', name: '材料猎人', desc: '收藏超过50种材料', icon: 'flask-conical', category: 'explore', condition: { favorites: 50 } },
    // 社区类
    { id: 'first_comment', name: '热心助人', desc: '发表第一条评论', icon: 'message-circle', category: 'community', condition: { comments: 1 } },
    { id: 'followers_100', name: '关注者破百', desc: '粉丝数超过100', icon: 'users', category: 'community', condition: { followers: 100 } },
    // 特殊类
    { id: 'early_user', name: '早期用户', desc: '注册于平台早期', icon: 'star', category: 'special', condition: { earlyUser: true } },
    { id: 'perfect_week', name: '全勤一周', desc: '连续7天登录', icon: 'calendar-check', category: 'special', condition: { consecutiveDays: 7 } }
  ],
  
  // 获取用户当前等级
  getLevel(exp) {
    let current = this.levels[0];
    for (const lvl of this.levels) {
      if (exp >= lvl.minExp) current = lvl;
    }
    const next = this.levels.find(l => l.level === current.level + 1);
    return {
      ...current,
      nextLevel: next || null,
      progress: next ? ((exp - current.minExp) / (next.minExp - current.minExp)) * 100 : 100
    };
  },
  
  // 检查并授予徽章
  checkBadges(user) {
    const earned = user.achievements || [];
    const earnedIds = earned.map(b => b.id);
    const newlyEarned = [];
    
    for (const badge of this.badges) {
      if (earnedIds.includes(badge.id)) continue;
      let matched = true;
      for (const [key, value] of Object.entries(badge.condition)) {
        if (key === 'earlyUser') {
          matched = matched && (user.createdAt < '2026-09-01');
        } else if (key === 'consecutiveDays') {
          matched = matched && (user.consecutiveLoginDays >= value);
        } else if (key === 'comments') {
          matched = matched && (user.totalComments >= value);
        } else if (key === 'likesReceived') {
          matched = matched && (user.stats.likesReceived >= value);
        } else if (key === 'favorites') {
          matched = matched && (user.favorites.length >= value);
        } else {
          matched = matched && (user.stats[key] >= value);
        }
      }
      if (matched) {
        const earnedBadge = { ...badge, earnedAt: new Date().toISOString() };
        earned.push(earnedBadge);
        newlyEarned.push(earnedBadge);
      }
    }
    
    user.achievements = earned;
    return newlyEarned;
  },
  
  // 获取徽章墙数据
  getBadgeWall(user) {
    const earnedIds = (user.achievements || []).map(b => b.id);
    return this.badges.map(badge => ({
      ...badge,
      earned: earnedIds.includes(badge.id),
      earnedAt: (user.achievements || []).find(b => b.id === badge.id)?.earnedAt
    }));
  },
  
  // 按分类获取徽章
  getBadgesByCategory(category) {
    return this.badges.filter(b => b.category === category);
  },
  
  // 积分操作
  addPoints(user, amount, reason) {
    user.stats.points = (user.stats.points || 0) + amount;
    user.stats.totalPoints = (user.stats.totalPoints || 0) + amount;
    if (!user.pointsHistory) user.pointsHistory = [];
    user.pointsHistory.unshift({
      amount, reason, time: new Date().toISOString(), type: 'earn'
    });
    // 检查徽章
    this.checkBadges(user);
    return user.stats.points;
  },
  
  consumePoints(user, amount, reason) {
    if ((user.stats.points || 0) < amount) return false;
    user.stats.points -= amount;
    if (!user.pointsHistory) user.pointsHistory = [];
    user.pointsHistory.unshift({
      amount, reason, time: new Date().toISOString(), type: 'consume'
    });
    return true;
  },
  
  // 获取积分排行榜（模拟）
  getLeaderboard(period = 'weekly') {
    const mockData = [
      { rank: 1, name: '张教授', avatar: '👨‍🔬', points: 12580, level: '科学大师' },
      { rank: 2, name: '李博士', avatar: '👩‍🔬', points: 9840, level: '宗师' },
      { rank: 3, name: '王研究员', avatar: '🧑‍🔬', points: 7620, level: '大师' },
      { rank: 4, name: '赵同学', avatar: '👨‍🎓', points: 5430, level: '学者' },
      { rank: 5, name: '陈工程师', avatar: '👩‍💻', points: 4210, level: '专家' }
    ];
    return mockData;
  }
};

// ============================================================
// 三、设置管理器 (SettingsManager)
// ============================================================
const SettingsManager = {
  // 9个设置分组定义
  groups: [
    { id: 'profile', name: '个人信息', icon: 'user', color: '#5ba3d9' },
    { id: 'security', name: '账号安全', icon: 'shield', color: '#5ccf8e' },
    { id: 'notifications', name: '通知设置', icon: 'bell', color: '#ffc857' },
    { id: 'preferences', name: '偏好设置', icon: 'settings', color: '#9b7ed8' },
    { id: 'subscription', name: '算力与套餐', icon: 'credit-card', color: '#ff6b4a' },
    { id: 'api', name: 'API与开发者', icon: 'key', color: '#00bcd4' },
    { id: 'privacy', name: '隐私设置', icon: 'lock', color: '#e91e63' },
    { id: 'help', name: '帮助与反馈', icon: 'help-circle', color: '#607d8b' },
    { id: 'about', name: '关于', icon: 'info', color: '#9e9e9e' }
  ],
  
  getSettings() {
    const user = UserManager.getCurrentUser();
    return user.settings || UserManager.getDefaultSettings();
  },
  
  updateSetting(path, value) {
    const user = UserManager.getCurrentUser();
    if (!user.settings) user.settings = UserManager.getDefaultSettings();
    
    const keys = path.split('.');
    let obj = user.settings;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    
    UniSci.emit('settings:changed', { path, value });
    return value;
  },
  
  getSetting(path) {
    const settings = this.getSettings();
    const keys = path.split('.');
    let obj = settings;
    for (const key of keys) {
      if (obj == null) return undefined;
      obj = obj[key];
    }
    return obj;
  },
  
  // API Key管理
  apiKeys: [],
  
  createApiKey(name, permissions, expiresAt) {
    const key = {
      id: 'key_' + Date.now(),
      name,
      key: 'usk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      permissions: permissions || ['read'],
      status: 'active',
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt || null,
      lastUsed: null,
      callCount: 0
    };
    this.apiKeys.unshift(key);
    Storage.local.set('unisci_api_keys', JSON.stringify(this.apiKeys));
    return key;
  },
  
  getApiKeys() {
    if (this.apiKeys.length === 0) {
      const saved = Storage.local.get('unisci_api_keys');
      if (saved) {
        try { this.apiKeys = JSON.parse(saved); } catch(e) { this.apiKeys = []; }
      }
      // 添加示例key
      if (this.apiKeys.length === 0) {
        this.apiKeys = [
          { id: 'key_demo1', name: '默认开发Key', key: 'usk_xxxxxxxxxxxxxxxx', permissions: ['read','compute'], status: 'active', createdAt: '2026-08-01T00:00:00Z', expiresAt: null, lastUsed: '2026-08-20T10:30:00Z', callCount: 156 },
          { id: 'key_demo2', name: '只读Key', key: 'usk_yyyyyyyyyyyyyyyy', permissions: ['read'], status: 'active', createdAt: '2026-08-15T00:00:00Z', expiresAt: '2026-12-31T00:00:00Z', lastUsed: null, callCount: 0 }
        ];
      }
    }
    return this.apiKeys;
  },
  
  toggleApiKey(id) {
    const key = this.apiKeys.find(k => k.id === id);
    if (key) {
      key.status = key.status === 'active' ? 'disabled' : 'active';
      Storage.local.set('unisci_api_keys', JSON.stringify(this.apiKeys));
    }
    return key;
  },
  
  deleteApiKey(id) {
    this.apiKeys = this.apiKeys.filter(k => k.id !== id);
    Storage.local.set('unisci_api_keys', JSON.stringify(this.apiKeys));
  },
  
  // Webhook管理
  webhooks: [],
  
  getWebhooks() {
    if (this.webhooks.length === 0) {
      this.webhooks = [
        { id: 'wh_1', url: 'https://example.com/webhook/job-complete', events: ['job.completed'], status: 'active', createdAt: '2026-08-10T00:00:00Z', lastCalled: '2026-08-20T08:00:00Z', callCount: 23 }
      ];
    }
    return this.webhooks;
  },
  
  createWebhook(url, events) {
    const wh = {
      id: 'wh_' + Date.now(),
      url, events: events || ['job.completed'],
      status: 'active',
      secret: 'whsec_' + Math.random().toString(36).substring(2, 20),
      createdAt: new Date().toISOString(),
      lastCalled: null, callCount: 0
    };
    this.webhooks.unshift(wh);
    return wh;
  },
  
  // 登录设备
  getLoginDevices() {
    return [
      { id: 'dev1', name: 'Windows PC · Chrome', location: '陕西西安', ip: '192.168.1.100', lastActive: '当前设备', isCurrent: true },
      { id: 'dev2', name: 'iPhone 15 · Safari', location: '陕西西安', ip: '192.168.1.101', lastActive: '2小时前', isCurrent: false },
      { id: 'dev3', name: 'MacBook Pro · Chrome', location: '北京海淀', ip: '10.0.0.50', lastActive: '3天前', isCurrent: false }
    ];
  },
  
  // 登录日志
  getLoginLogs() {
    return [
      { time: '2026-08-23 09:15', device: 'Windows PC · Chrome', location: '陕西西安', ip: '192.168.1.100', status: 'success' },
      { time: '2026-08-22 20:30', device: 'iPhone 15 · Safari', location: '陕西西安', ip: '192.168.1.101', status: 'success' },
      { time: '2026-08-22 14:20', device: 'Unknown · Firefox', location: '广东深圳', ip: '113.xx.xx.xx', status: 'blocked' },
      { time: '2026-08-21 10:00', device: 'MacBook Pro · Chrome', location: '北京海淀', ip: '10.0.0.50', status: 'success' }
    ];
  },
  
  // 账单数据
  getBills() {
    return [
      { id: 'bill_202608', month: '2026年8月', amount: 299.00, status: 'paid', date: '2026-08-01', items: [{name:'专业版订阅', amount:299}, {name:'GPU超额', amount:0}] },
      { id: 'bill_202607', month: '2026年7月', amount: 299.00, status: 'paid', date: '2026-07-01', items: [{name:'专业版订阅', amount:299}] },
      { id: 'bill_202606', month: '2026年6月', amount: 0.00, status: 'paid', date: '2026-06-01', items: [{name:'免费版', amount:0}] }
    ];
  },
  
  // 套餐对比
  getPlans() {
    return [
      { id: 'free', name: '免费版', price: 0, period: '永久', features: ['CPU 4核时/月', '存储空间 5GB', '基础课程', '社区支持'], popular: false },
      { id: 'basic', name: '入门版', price: 49, period: '月', features: ['CPU 100核时/月', 'GPU 10卡时/月', '存储空间 50GB', '全部课程', '优先支持'], popular: false },
      { id: 'pro', name: '专业版', price: 299, period: '月', features: ['CPU 1000核时/月', 'GPU 100卡时/月', '存储空间 500GB', '全部功能', 'API访问', '专属客服'], popular: true },
      { id: 'team', name: '团队版', price: 999, period: '月', features: ['5人团队', 'CPU 5000核时/月', 'GPU 500卡时/月', '团队协作', '管理员面板'], popular: false },
      { id: 'custom', name: '定制版', price: '联系销售', period: '定制', features: ['无限团队', '专属算力', '定制功能', '私有化部署', '7x24支持'], popular: false }
    ];
  }
};

// ============================================================
// 四、文章管理器 (ArticleManager)
// ============================================================
const ArticleManager = {
  // 获取文章列表（含mock数据）
  getArticles() {
    const user = UserManager.getCurrentUser();
    return user.articles || [];
  },
  
  // 获取文章详情
  getArticle(id) {
    const user = UserManager.getCurrentUser();
    return (user.articles || []).find(a => a.id === id) || null;
  },
  
  // 点赞
  toggleLike(articleId) {
    const article = this.getArticle(articleId);
    if (!article) return null;
    article.liked = !article.liked;
    article.likes += article.liked ? 1 : -1;
    return article;
  },
  
  // 收藏
  toggleFavorite(articleId) {
    const article = this.getArticle(articleId);
    if (!article) return null;
    article.favorited = !article.favorited;
    return article;
  },
  
  // 评论
  comments: {},
  
  getComments(articleId) {
    if (!this.comments[articleId]) {
      this.comments[articleId] = [
        { id: 'c1', user: { name: '张教授', avatar: '👨‍🔬' }, content: '写得非常详细，对k点收敛性的分析很到位！', time: '2小时前', likes: 12, replies: [] },
        { id: 'c2', user: { name: '李博士', avatar: '👩‍🔬' }, content: '请问截断能500eV是经过收敛测试的吗？我一般用400eV就够了。', time: '5小时前', likes: 5, replies: [
          { id: 'c2r1', user: { name: '作者', avatar: '🧑‍💻' }, content: '是的，经过了300/400/500/600eV的收敛测试，500eV时能量差已小于1meV/atom。', time: '4小时前', likes: 8 }
        ]},
        { id: 'c3', user: { name: '王同学', avatar: '👨‍🎓' }, content: '收藏了，正在学习VASP计算，这篇文章太及时了！', time: '昨天', likes: 3, replies: [] }
      ];
    }
    return this.comments[articleId];
  },
  
  addComment(articleId, content) {
    if (!this.comments[articleId]) this.comments[articleId] = [];
    const user = UserManager.getCurrentUser();
    const comment = {
      id: 'c_' + Date.now(),
      user: { name: user.name, avatar: user.avatar },
      content, time: '刚刚', likes: 0, replies: []
    };
    this.comments[articleId].unshift(comment);
    return comment;
  },
  
  // 发布文章
  publishArticle(data) {
    const user = UserManager.getCurrentUser();
    const article = {
      id: 'article_' + Date.now(),
      title: data.title,
      content: data.content,
      tag: data.tag || '学习笔记',
      category: data.category || '科研笔记',
      summary: data.summary || data.content.substring(0, 100),
      cover: data.cover || null,
      visibility: data.visibility || 'public',
      status: 'published',
      author: user.name,
      authorAvatar: user.avatar,
      date: new Date().toISOString().split('T')[0],
      views: 0, likes: 0, comments: 0,
      liked: false, favorited: false
    };
    if (!user.articles) user.articles = [];
    user.articles.unshift(article);
    user.stats.articles = (user.stats.articles || 0) + 1;
    AchievementSystem.checkBadges(user);
    AchievementSystem.addPoints(user, 50, '发布文章');
    return article;
  },
  
  // 保存草稿
  saveDraft(data) {
    const drafts = Storage.local.get('unisci_article_drafts');
    let draftList = [];
    if (drafts) { try { draftList = JSON.parse(drafts); } catch(e) {} }
    const draft = { ...data, id: 'draft_' + Date.now(), savedAt: new Date().toISOString() };
    draftList.unshift(draft);
    Storage.local.set('unisci_article_drafts', JSON.stringify(draftList));
    return draft;
  },
  
  getDrafts() {
    const drafts = Storage.local.get('unisci_article_drafts');
    if (drafts) { try { return JSON.parse(drafts); } catch(e) { return []; } }
    return [];
  },
  
  // 删除文章
  deleteArticle(id) {
    const user = UserManager.getCurrentUser();
    if (user.articles) {
      user.articles = user.articles.filter(a => a.id !== id);
      user.stats.articles = Math.max(0, (user.stats.articles || 1) - 1);
    }
  }
};

// ============================================================
// 五、动态时间线 (ActivityTracker)
// ============================================================
const ActivityTracker = {
  // 活动类型定义
  types: {
    article: { icon: 'file-text', color: '#9b7ed8', label: '发布文章' },
    job_complete: { icon: 'check-circle', color: '#5ccf8e', label: '完成计算' },
    notebook: { icon: 'notebook-pen', color: '#5ba3d9', label: '创建Notebook' },
    workflow: { icon: 'workflow', color: '#ff6b4a', label: '运行工作流' },
    course: { icon: 'book-open', color: '#ffc857', label: '完成课程' },
    badge: { icon: 'award', color: '#e91e63', label: '获得徽章' },
    favorite: { icon: 'heart', color: '#ff6b4a', label: '收藏' },
    follow: { icon: 'user-plus', color: '#00bcd4', label: '关注' },
    comment: { icon: 'message-circle', color: '#5ba3d9', label: '评论' },
    points: { icon: 'star', color: '#ffc857', label: '积分变动' },
    login: { icon: 'log-in', color: '#607d8b', label: '登录' }
  },
  
  // 获取用户动态（mock数据）
  getActivities(user) {
    return [
      { id: 'a1', type: 'article', title: '发布了文章《VASP计算中k点网格收敛性研究》', time: '今天 14:30', link: 'article', data: { id: 'art1' } },
      { id: 'a2', type: 'job_complete', title: '完成计算任务：WTe₂ 拓扑表面态计算', time: '今天 10:15', link: 'job', data: { id: 'job1' } },
      { id: 'a3', type: 'badge', title: '获得徽章「计算新手」', time: '今天 09:00', link: 'achievement', data: { id: 'job_10' } },
      { id: 'a4', type: 'notebook', title: '创建了Notebook「MoS₂能带结构分析」', time: '昨天 16:45', link: 'notebook', data: { id: 'nb1' } },
      { id: 'a5', type: 'course', title: '完成了课程《第一性原理计算实战》第8课', time: '昨天 11:20', link: 'course', data: { id: 'c1' } },
      { id: 'a6', type: 'workflow', title: '运行了工作流「材料筛选流水线」', time: '昨天 09:30', link: 'workflow', data: { id: 'wf1' } },
      { id: 'a7', type: 'points', title: '获得50积分（发布文章奖励）', time: '前天 15:00', link: 'points', data: {} },
      { id: 'a8', type: 'favorite', title: '收藏了材料 Bi₂Se₃', time: '前天 10:30', link: 'material', data: { id: 'm1' } },
      { id: 'a9', type: 'comment', title: '评论了文章《DFT泛函选择指南》', time: '3天前', link: 'article', data: { id: 'art2' } },
      { id: 'a10', type: 'login', title: '连续登录7天，获得「全勤一周」徽章', time: '3天前', link: 'achievement', data: { id: 'perfect_week' } }
    ];
  },
  
  // 按日期分组
  groupByDate(activities) {
    const groups = {};
    for (const act of activities) {
      const date = act.time.split(' ')[0];
      if (!groups[date]) groups[date] = [];
      groups[date].push(act);
    }
    return groups;
  },
  
  // 记录活动
  record(type, title, data) {
    const user = UserManager.getCurrentUser();
    if (!user.activities) user.activities = [];
    const activity = {
      id: 'act_' + Date.now(),
      type, title, data: data || {},
      time: new Date().toLocaleString('zh-CN')
    };
    user.activities.unshift(activity);
    return activity;
  }
};

// ============================================================
// 六、我的内容管理器 (MyContentManager)
// ============================================================
const MyContentManager = {
  // 内容类型定义
  contentTypes: {
    articles: { name: '我的文章', icon: 'file-text', color: '#9b7ed8' },
    courses: { name: '我的课程', icon: 'book-open', color: '#ffc857' },
    jobs: { name: '我的计算', icon: 'cpu', color: '#5ba3d9' },
    notebooks: { name: '我的Notebook', icon: 'notebook-pen', color: '#5ccf8e' },
    workflows: { name: '我的工作流', icon: 'workflow', color: '#ff6b4a' },
    molecules: { name: '我的分子', icon: 'atom', color: '#00bcd4' },
    materials: { name: '我的材料', icon: 'flask-conical', color: '#e91e63' },
    favorites: { name: '我的收藏', icon: 'heart', color: '#ff8fab' }
  },
  
  // 获取内容列表
  getList(type) {
    const user = UserManager.getCurrentUser();
    switch(type) {
      case 'articles': return user.articles || [];
      case 'courses': return user.courses || [];
      case 'jobs': return [...(user.runningJobs || []), ...(user.completedJobs || [])];
      case 'notebooks': return user.notebooks || [];
      case 'workflows': return user.workflows || [];
      case 'molecules': return user.molecules || [
        { id: 'mol1', name: 'MoS₂', formula: 'MoS₂', atoms: 9, icon: 'layers', createdAt: '2026-08-15' },
        { id: 'mol2', name: '石墨烯', formula: 'C', atoms: 2, icon: 'hexagon', createdAt: '2026-08-10' },
        { id: 'mol3', name: 'WTe₂', formula: 'WTe₂', atoms: 6, icon: 'magnet', createdAt: '2026-08-05' }
      ];
      case 'materials': return user.materials || [
        { id: 'mat1', formula: 'MoS₂', name: '二硫化钼', bandgap: '1.8 eV', type: '半导体' },
        { id: 'mat2', formula: 'Bi₂Se₃', name: '硒化铋', bandgap: '0.3 eV', type: '拓扑绝缘体' }
      ];
      case 'favorites': return user.favorites || [];
      default: return [];
    }
  },
  
  // 搜索内容
  search(type, keyword) {
    const list = this.getList(type);
    if (!keyword) return list;
    const kw = keyword.toLowerCase();
    return list.filter(item => 
      (item.title || item.name || item.formula || '').toLowerCase().includes(kw) ||
      (item.tag || item.type || '').toLowerCase().includes(kw)
    );
  },
  
  // 筛选内容
  filter(type, filterType) {
    const list = this.getList(type);
    if (!filterType || filterType === 'all') return list;
    return list.filter(item => item.status === filterType || item.type === filterType);
  },
  
  // 排序
  sort(list, sortBy) {
    const sorted = [...list];
    switch(sortBy) {
      case 'name': sorted.sort((a,b) => (a.title||a.name||'').localeCompare(b.title||b.name||'')); break;
      case 'oldest': sorted.sort((a,b) => new Date(a.createdAt||a.date||0) - new Date(b.createdAt||b.date||0)); break;
      case 'popular': sorted.sort((a,b) => (b.likes||b.views||0) - (a.likes||a.views||0)); break;
      default: sorted.sort((a,b) => new Date(b.createdAt||b.date||0) - new Date(a.createdAt||a.date||0));
    }
    return sorted;
  },
  
  // 删除内容
  delete(type, id) {
    const user = UserManager.getCurrentUser();
    const key = type === 'jobs' ? 'completedJobs' : type;
    if (user[key]) {
      user[key] = user[key].filter(item => item.id !== id);
    }
  },
  
  // 批量操作
  batchDelete(type, ids) {
    for (const id of ids) this.delete(type, id);
  }
};

// ============================================================
// 七、渲染器 - 个人中心
// ============================================================
const ProfileRenderer = {
  // 渲染完整个人中心
  render() {
    const user = UserManager.getCurrentUser();
    this.renderWelcome(user);
    this.renderStats(user);
    this.renderContentGrid();
    this.renderTabs();
    this.renderUserSwitcher();
    if (typeof renderIcons === 'function') renderIcons();
  },
  
  renderWelcome(user) {
    const el = document.getElementById('profile-welcome');
    if (!el) return;
    const levelInfo = AchievementSystem.getLevel(user.stats.totalPoints || user.stats.points || 0);
    el.innerHTML = `
      <div class="welcome-row">
        <div class="avatar avatar-purple" style="cursor:pointer" onclick="ProfileRenderer.openProfileEdit()">${user.avatar}</div>
        <div class="welcome-text">
          <h2 style="font-size:18px;cursor:pointer" onclick="ProfileRenderer.openProfileEdit()">${user.name} <i data-lucide="edit-3" class="lucide" style="width:14px;height:14px;color:var(--text3);vertical-align:middle"></i></h2>
          <p>${user.university || ''} ${user.department ? '· ' + user.department : ''}</p>
          <span class="welcome-tag welcome-tag-purple"><i data-lucide="sparkles" class="lucide" style="width:12px;height:12px"></i>Lv.${levelInfo.level} ${levelInfo.name} · ${user.level}</span>
        </div>
      </div>
      <div style="margin-top:12px;padding:10px 12px;background:var(--bg-secondary);border-radius:10px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          <span style="font-size:12px;color:var(--text3)">等级进度</span>
          <span style="font-size:12px;font-weight:700;color:var(--primary)">${levelInfo.progress.toFixed(0)}%</span>
        </div>
        <div class="progress-track" style="height:6px"><div class="progress-fill pf-purple" style="width:${levelInfo.progress}%"></div></div>
        <div style="font-size:11px;color:var(--text3);margin-top:6px">${user.stats.totalPoints || user.stats.points || 0} 积分 · 距下一级还需 ${levelInfo.nextLevel ? (levelInfo.nextLevel.minExp - (user.stats.totalPoints || user.stats.points || 0)) : 0} 积分</div>
      </div>
    `;
  },
  
  renderStats(user) {
    const el = document.getElementById('profile-stats');
    if (!el) return;
    const stats = user.stats || {};
    el.innerHTML = `
      <div class="stat-card" onclick="ProfileRenderer.openMyContent('jobs')" style="cursor:pointer"><div class="stat-value">${stats.totalJobs || 0}</div><div class="stat-label">计算任务</div></div>
      <div class="stat-card blue" onclick="ProfileRenderer.openMyContent('notebooks')" style="cursor:pointer"><div class="stat-value">${stats.notebooks || (user.notebooks||[]).length}</div><div class="stat-label">Notebook</div></div>
      <div class="stat-card green" onclick="ProfileRenderer.openMyContent('articles')" style="cursor:pointer"><div class="stat-value">${stats.articles || (user.articles||[]).length}</div><div class="stat-label">文章</div></div>
      <div class="stat-card" style="background:linear-gradient(135deg,#fff0e8,#ffe0d0)" onclick="ProfileRenderer.openMyContent('courses')" style="cursor:pointer"><div class="stat-value" style="color:var(--primary)">${stats.courses || (user.courses||[]).length}</div><div class="stat-label">课程</div></div>
    `;
  },
  
  // 8个内容入口网格
  renderContentGrid() {
    const container = document.getElementById('profile-content-grid');
    if (!container) return;
    const entries = [
      { type: 'articles', icon: 'file-text', color: '#9b7ed8', label: '我的文章' },
      { type: 'courses', icon: 'book-open', color: '#ffc857', label: '我的课程' },
      { type: 'jobs', icon: 'cpu', color: '#5ba3d9', label: '我的计算' },
      { type: 'notebooks', icon: 'notebook-pen', color: '#5ccf8e', label: 'Notebook' },
      { type: 'workflows', icon: 'workflow', color: '#ff6b4a', label: '工作流' },
      { type: 'molecules', icon: 'atom', color: '#00bcd4', label: '我的分子' },
      { type: 'materials', icon: 'flask-conical', color: '#e91e63', label: '我的材料' },
      { type: 'favorites', icon: 'heart', color: '#ff8fab', label: '我的收藏' }
    ];
    container.innerHTML = entries.map(e => `
      <div class="quick-item" onclick="ProfileRenderer.openMyContent('${e.type}')">
        <div class="quick-icon" style="background:linear-gradient(135deg,${e.color},${e.color}cc)"><i data-lucide="${e.icon}" class="lucide icon-xl icon-white"></i></div>
        <div class="quick-label">${e.label}</div>
      </div>
    `).join('');
  },
  
  // Tab区域
  renderTabs() {
    const container = document.getElementById('profile-tabs-content');
    if (!container) return;
    // 默认显示动态
    this.renderActivityTab();
  },
  
  // 动态Tab
  renderActivityTab() {
    const user = UserManager.getCurrentUser();
    const activities = ActivityTracker.getActivities(user);
    const container = document.getElementById('profile-tabs-content');
    if (!container) return;
    
    let html = '<div style="margin-bottom:12px"><div class="chip-row">';
    ['全部','文章','计算','学习','成就','社区'].forEach((t,i) => {
      html += `<span class="chip ${i===0?'selected':''}" onclick="ProfileRenderer.filterActivity('${t}',this)">${t}</span>`;
    });
    html += '</div></div>';
    
    html += '<div style="display:flex;flex-direction:column;gap:10px">';
    for (const act of activities) {
      const typeInfo = ActivityTracker.types[act.type] || ActivityTracker.types.login;
      html += `
        <div onclick="ProfileRenderer.openActivity('${act.type}','${act.id}')" style="display:flex;align-items:center;gap:12px;padding:14px 16px;background:var(--card);border-radius:14px;box-shadow:0 2px 8px rgba(0,0,0,0.04);cursor:pointer;transition:transform 0.15s,box-shadow 0.15s" onmouseover="this.style.transform='translateY(-1px)';this.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.04)'">
          <div style="width:36px;height:36px;border-radius:10px;background:${typeInfo.color}15;display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <i data-lucide="${typeInfo.icon}" class="lucide" style="width:16px;height:16px;color:${typeInfo.color}"></i>
          </div>
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:600;color:var(--text);line-height:1.4">${act.title}</div>
            <div style="font-size:11px;color:var(--text3);margin-top:2px">${act.time}</div>
          </div>
          <i data-lucide="chevron-right" class="lucide" style="width:14px;height:14px;color:var(--text3);flex-shrink:0"></i>
        </div>
      `;
    }
    html += '</div>';
    container.innerHTML = html;
  },
  
  // 成就Tab
  renderAchievementTab() {
    const user = UserManager.getCurrentUser();
    const levelInfo = AchievementSystem.getLevel(user.stats.totalPoints || user.stats.points || 0);
    const badges = AchievementSystem.getBadgeWall(user);
    const container = document.getElementById('profile-tabs-content');
    if (!container) return;
    
    let html = `
      <div class="card" style="margin-bottom:16px">
        <div style="display:flex;align-items:center;gap:16px">
          <div style="width:64px;height:64px;background:linear-gradient(135deg,#9b7ed8,#b8a0e8);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:800;color:#fff">${levelInfo.level}</div>
          <div style="flex:1">
            <div style="font-size:18px;font-weight:800">${levelInfo.name}</div>
            <div style="font-size:12px;color:var(--text3);margin-top:4px">${user.stats.totalPoints || user.stats.points || 0} 总积分</div>
            <div class="progress-track" style="height:6px;margin-top:8px"><div class="progress-fill pf-purple" style="width:${levelInfo.progress}%"></div></div>
          </div>
        </div>
        <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border)">
          <div style="font-size:12px;color:var(--text3);margin-bottom:8px">等级特权</div>
          <div class="chip-row">${levelInfo.privileges.map(p => `<span class="chip">${p}</span>`).join('')}</div>
        </div>
      </div>
    `;
    
    // 徽章分类
    const categories = ['compute','learn','create','explore','community','special'];
    const catNames = { compute:'计算', learn:'学习', create:'创作', explore:'探索', community:'社区', special:'特殊' };
    
    for (const cat of categories) {
      const catBadges = badges.filter(b => b.category === cat);
      html += `<div class="section-header"><div class="section-title" style="font-size:14px">${catNames[cat]}徽章 (${catBadges.filter(b=>b.earned).length}/${catBadges.length})</div></div>`;
      html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px">';
      for (const badge of catBadges) {
        html += `
          <div onclick="ProfileRenderer.showBadgeDetail('${badge.id}')" style="text-align:center;cursor:pointer;opacity:${badge.earned?1:0.4}">
            <div style="width:52px;height:52px;margin:0 auto;background:${badge.earned?'linear-gradient(135deg,#fff0e8,#ffe0d0)':'var(--bg-secondary)'};border-radius:14px;display:flex;align-items:center;justify-content:center">
              <i data-lucide="${badge.icon}" class="lucide" style="width:24px;height:24px;color:${badge.earned?'var(--primary)':'var(--text3)'}"></i>
            </div>
            <div style="font-size:11px;font-weight:600;margin-top:6px;color:${badge.earned?'var(--text)':'var(--text3)'}">${badge.name}</div>
          </div>
        `;
      }
      html += '</div>';
    }
    
    // 积分记录
    html += `
      <div class="section-header"><div class="section-title" style="font-size:14px">积分记录</div><div class="section-more" onclick="UI.toast.info('查看完整积分记录')">全部</div></div>
      <div class="card" style="padding:0">
        ${(user.pointsHistory || [{amount:50,reason:'发布文章',time:'今天 14:30',type:'earn'},{amount:100,reason:'完成计算任务',time:'今天 10:15',type:'earn'}]).slice(0,5).map(p => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid var(--border)">
            <div><div style="font-size:13px;font-weight:600">${p.reason}</div><div style="font-size:11px;color:var(--text3)">${p.time}</div></div>
            <div style="font-size:15px;font-weight:800;color:${p.type==='earn'?'var(--green)':'var(--primary)'}">${p.type==='earn'?'+':'-'}${p.amount}</div>
          </div>
        `).join('')}
      </div>
    `;
    
    container.innerHTML = html;
  },
  
  // 资源Tab
  renderResourceTab() {
    const user = UserManager.getCurrentUser();
    const container = document.getElementById('profile-tabs-content');
    if (!container) return;
    const total = user.level==='专业版'?1000:user.level==='入门版'?100:10;
    const gpuUsed = user.stats.gpuHours || 0;
    const storageUsed = (gpuUsed * 0.5).toFixed(1);
    
    container.innerHTML = `
      <div class="card" style="margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div><div style="font-size:16px;font-weight:800">${user.level}</div><div style="font-size:12px;color:var(--text3)">到期时间：2026-12-31</div></div>
          <button class="btn btn-primary" style="padding:8px 16px;font-size:13px" onclick="SettingsRenderer.showPlanComparison()">升级套餐</button>
        </div>
        <div class="chip-row">${['GPU加速','API访问','优先算力','专属客服'].map(f => `<span class="chip selected">${f}</span>`).join('')}</div>
      </div>
      
      <div class="section-header"><div class="section-title" style="font-size:14px">本月用量</div></div>
      <div class="card" style="margin-bottom:16px">
        ${[
          {name:'GPU卡时', used:gpuUsed, total:total, unit:'h', color:'pf-orange'},
          {name:'CPU核时', used:gpuUsed*10, total:total*10, unit:'h', color:'pf-blue'},
          {name:'存储空间', used:parseFloat(storageUsed), total:500, unit:'GB', color:'pf-green'},
          {name:'API调用', used:156, total:10000, unit:'次', color:'pf-purple'}
        ].map(r => {
          const pct = Math.min(100, (r.used/r.total)*100);
          return `<div style="margin-bottom:14px"><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px"><span style="font-weight:600">${r.name}</span><span style="color:var(--text3)">${r.used.toFixed(1)} / ${r.total} ${r.unit}</span></div><div class="progress-track" style="height:8px"><div class="progress-fill ${r.color}" style="width:${pct}%"></div></div></div>`;
        }).join('')}
      </div>
      
      <div class="section-header"><div class="section-title" style="font-size:14px">账单记录</div><div class="section-more" onclick="SettingsRenderer.showBills()">全部账单</div></div>
      <div class="card" style="padding:0">
        ${SettingsManager.getBills().slice(0,3).map(b => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid var(--border)">
            <div><div style="font-size:13px;font-weight:600">${b.month}</div><div style="font-size:11px;color:var(--text3)">${b.date}</div></div>
            <div style="text-align:right"><div style="font-size:15px;font-weight:800">¥${b.amount.toFixed(2)}</div><div style="font-size:11px;color:${b.status==='paid'?'var(--green)':'var(--primary)'}">${b.status==='paid'?'已支付':'待支付'}</div></div>
          </div>
        `).join('')}
      </div>
    `;
  },
  
  // 切换Tab
  switchTab(tab) {
    document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.profile-tab[data-tab="${tab}"]`)?.classList.add('active');
    if (tab === 'activity') this.renderActivityTab();
    else if (tab === 'achievement') this.renderAchievementTab();
    else if (tab === 'resource') this.renderResourceTab();
    if (typeof renderIcons === 'function') renderIcons();
  },
  
  // 打开我的内容
  openMyContent(type) {
    const info = MyContentManager.contentTypes[type];
    if (!info) return;
    window._myContentType = type;
    navigateTo('page-my-content');
  },
  
  // 打开活动
  openActivity(type, id) {
    UI.toast.info(`打开活动: ${type}`);
  },
  
  // 显示徽章详情
  showBadgeDetail(badgeId) {
    const badge = AchievementSystem.badges.find(b => b.id === badgeId);
    if (!badge) return;
    const user = UserManager.getCurrentUser();
    const earned = (user.achievements || []).find(b => b.id === badgeId);
    UI.dialog.alert({
      title: badge.name,
      message: `${badge.desc}\n\n获取条件: ${JSON.stringify(badge.condition)}\n${earned ? `\n获得时间: ${earned.earnedAt}` : '\n状态: 未获得'}`,
      confirmText: '知道了'
    });
  },
  
  // 打开资料编辑
  openProfileEdit() {
    navigateTo('page-settings');
    setTimeout(() => SettingsRenderer.showGroup('profile'), 300);
  },
  
  // 渲染用户切换器
  renderUserSwitcher() {
    const el = document.getElementById('user-list');
    if (!el) return;
    const allUsers = UserManager.getAllUsers();
    el.innerHTML = allUsers.map((us,i) => `
      <div class="user-option ${i===UserManager.currentUserIndex?'active':''}" onclick="ProfileRenderer.switchUser(${i})">
        <div class="user-option-avatar" style="background:linear-gradient(135deg,${us.levelColor==='purple'?'#9b7ed8,#b8a0e8':us.levelColor==='green'?'#5ccf8e,#7edda8':'#5ba3d9,#7ec0e8'})">${us.avatar}</div>
        <div class="user-option-info">
          <div class="user-option-name">${us.name}</div>
          <div class="user-option-role">${us.username} · ${us.role} · ${us.level}</div>
        </div>
        <i data-lucide="check-circle-2" class="lucide user-option-check" style="width:18px;height:18px"></i>
      </div>
    `).join('');
  },
  
  switchUser(index) {
    UserManager.switchUser(index);
    UI.toast.success(`已切换到：${UserManager.getCurrentUser().name}`);
    this.render();
    // 刷新其他页面数据
    if (typeof renderAll === 'function') renderAll();
  }
};

// ============================================================
// 八、渲染器 - 设置页面
// ============================================================
const SettingsRenderer = {
  currentGroup: null,
  
  // 渲染设置主页面（9个分组列表）
  renderMain() {
    const container = document.getElementById('settings-main');
    if (!container) return;
    container.innerHTML = SettingsManager.groups.map(g => `
      <div class="list-item" onclick="SettingsRenderer.showGroup('${g.id}')">
        <div class="list-item-icon" style="background:linear-gradient(135deg,${g.color},${g.color}cc)"><i data-lucide="${g.icon}" class="lucide icon-white"></i></div>
        <div class="list-item-content"><div class="list-item-title">${g.name}</div></div>
        <i data-lucide="chevron-right" class="lucide list-item-arrow"></i>
      </div>
    `).join('') + `
      <div style="text-align:center;margin-top:24px">
        <button class="btn btn-secondary" style="color:var(--primary)" onclick="SettingsRenderer.logout()"><i data-lucide="log-out" class="lucide"></i>退出登录</button>
      </div>
      <div style="text-align:center;margin-top:12px;font-size:11px;color:var(--text3)">UniSci Platform V2.0.0 · 计算空气</div>
    `;
  },
  
  // 显示设置分组
  showGroup(groupId) {
    this.currentGroup = groupId;
    const main = document.getElementById('settings-main');
    const detail = document.getElementById('settings-detail');
    if (main) main.style.display = 'none';
    if (detail) detail.style.display = 'block';
    
    const group = SettingsManager.groups.find(g => g.id === groupId);
    document.getElementById('settings-detail-title').textContent = group?.name || '设置';
    
    const content = document.getElementById('settings-detail-content');
    if (!content) return;
    
    switch(groupId) {
      case 'profile': this.renderProfileSettings(content); break;
      case 'security': this.renderSecuritySettings(content); break;
      case 'notifications': this.renderNotificationSettings(content); break;
      case 'preferences': this.renderPreferenceSettings(content); break;
      case 'subscription': this.renderSubscriptionSettings(content); break;
      case 'api': this.renderApiSettings(content); break;
      case 'privacy': this.renderPrivacySettings(content); break;
      case 'help': this.renderHelpSettings(content); break;
      case 'about': this.renderAboutSettings(content); break;
    }
    if (typeof renderIcons === 'function') renderIcons();
  },
  
  // 返回设置主页面
  backToMain() {
    const main = document.getElementById('settings-main');
    const detail = document.getElementById('settings-detail');
    if (main) main.style.display = 'block';
    if (detail) detail.style.display = 'none';
    this.currentGroup = null;
  },
  
  // 个人信息设置
  renderProfileSettings(container) {
    const user = UserManager.getCurrentUser();
    container.innerHTML = `
      <div class="card" style="text-align:center;padding:24px">
        <div style="width:80px;height:80px;margin:0 auto;background:linear-gradient(135deg,#9b7ed8,#b8a0e8);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:36px;cursor:pointer" onclick="UI.toast.info('选择头像')">${user.avatar}</div>
        <div style="font-size:12px;color:var(--primary);margin-top:8px;cursor:pointer" onclick="UI.toast.info('更换头像')">更换头像</div>
      </div>
      <div class="card">
        <div class="form-group"><label class="form-label">用户名</label><input class="form-input" value="${user.username}" onchange="SettingsRenderer.updateProfile('username',this.value)"></div>
        <div class="form-group"><label class="form-label">显示名称</label><input class="form-input" value="${user.name}" onchange="SettingsRenderer.updateProfile('name',this.value)"></div>
        <div class="form-group"><label class="form-label">学术身份</label>
          <select class="form-select" onchange="SettingsRenderer.updateProfile('role',this.value)">
            ${['本科生','硕士生','博士生','博士后','研究员','教授','工程师','爱好者'].map(r => `<option ${user.role===r?'selected':''}>${r}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label class="form-label">所属机构</label><input class="form-input" value="${user.university||''}" placeholder="学校/研究所/公司" onchange="SettingsRenderer.updateProfile('university',this.value)"></div>
        <div class="form-group"><label class="form-label">研究方向</label>
          <div class="chip-row">
            ${['材料科学','凝聚态物理','量子化学','AI for Science','分子动力学','拓扑材料'].map(t => `<span class="chip ${(user.researchAreas||[]).includes(t)?'selected':''}" onclick="this.classList.toggle('selected')">${t}</span>`).join('')}
          </div>
        </div>
        <div class="form-group"><label class="form-label">个人简介</label><textarea class="form-textarea" onchange="SettingsRenderer.updateProfile('bio',this.value)">${user.bio||''}</textarea></div>
      </div>
      <button class="btn btn-primary" onclick="UI.toast.success('资料已保存')"><i data-lucide="save" class="lucide icon-white"></i>保存修改</button>
    `;
  },
  
  updateProfile(field, value) {
    UserManager.updateProfile({ [field]: value });
    UI.toast.success('已更新');
  },
  
  // 账号安全设置
  renderSecuritySettings(container) {
    const settings = SettingsManager.getSettings();
    container.innerHTML = `
      <div class="list-item" onclick="SettingsRenderer.showChangePassword()">
        <div class="list-item-icon" style="background:linear-gradient(135deg,#5ba3d9,#7ec0e8)"><i data-lucide="key" class="lucide icon-white"></i></div>
        <div class="list-item-content"><div class="list-item-title">修改密码</div><div class="list-item-sub">上次修改：30天前</div></div>
        <i data-lucide="chevron-right" class="lucide list-item-arrow"></i>
      </div>
      <div class="list-item" onclick="UI.toast.info('绑定手机')">
        <div class="list-item-icon" style="background:linear-gradient(135deg,#5ccf8e,#7edda8)"><i data-lucide="smartphone" class="lucide icon-white"></i></div>
        <div class="list-item-content"><div class="list-item-title">手机绑定</div><div class="list-item-sub">${settings.security.phoneVerified?'已绑定':'未绑定'}</div></div>
        <i data-lucide="chevron-right" class="lucide list-item-arrow"></i>
      </div>
      <div class="list-item" onclick="UI.toast.info('绑定邮箱')">
        <div class="list-item-icon" style="background:linear-gradient(135deg,#ffc857,#ffd870)"><i data-lucide="mail" class="lucide icon-white"></i></div>
        <div class="list-item-content"><div class="list-item-title">邮箱绑定</div><div class="list-item-sub">${settings.security.emailVerified?'已验证':'未验证'}</div></div>
        <i data-lucide="chevron-right" class="lucide list-item-arrow"></i>
      </div>
      <div class="card" style="margin-top:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0">
          <div><div style="font-size:14px;font-weight:600">两步验证</div><div style="font-size:12px;color:var(--text3)">登录时需要额外验证码</div></div>
          <label class="switch"><input type="checkbox" ${settings.security.twoFactorEnabled?'checked':''} onchange="SettingsManager.updateSetting('security.twoFactorEnabled',this.checked);UI.toast.success(this.checked?'已开启两步验证':'已关闭两步验证')"><span class="slider"></span></label>
        </div>
      </div>
      <div class="section-header"><div class="section-title" style="font-size:14px">登录设备</div></div>
      <div class="card" style="padding:0">
        ${SettingsManager.getLoginDevices().map(d => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid var(--border)">
            <div style="display:flex;align-items:center;gap:10px">
              <i data-lucide="${d.isCurrent?'monitor':'smartphone'}" class="lucide" style="width:20px;height:20px;color:var(--text3)"></i>
              <div><div style="font-size:13px;font-weight:600">${d.name} ${d.isCurrent?'<span style="color:var(--green);font-size:11px">· 当前设备</span>':''}</div><div style="font-size:11px;color:var(--text3)">${d.location} · ${d.lastActive}</div></div>
            </div>
            ${!d.isCurrent?`<button class="btn btn-secondary" style="padding:4px 10px;font-size:11px" onclick="UI.toast.success('已下线该设备')">下线</button>`:''}
          </div>
        `).join('')}
      </div>
      <div class="section-header"><div class="section-title" style="font-size:14px">登录日志</div></div>
      <div class="card" style="padding:0">
        ${SettingsManager.getLoginLogs().map(log => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 16px;border-bottom:1px solid var(--border)">
            <div><div style="font-size:12px;font-weight:600">${log.device}</div><div style="font-size:11px;color:var(--text3)">${log.location} · ${log.ip}</div></div>
            <div style="text-align:right"><div style="font-size:11px">${log.time}</div><div style="font-size:11px;color:${log.status==='success'?'var(--green)':'var(--primary)'}">${log.status==='success'?'成功':'已拦截'}</div></div>
          </div>
        `).join('')}
      </div>
    `;
  },
  
  showChangePassword() {
    UI.dialog.prompt({
      title: '修改密码',
      message: '请输入原密码和新密码',
      confirmText: '确认修改',
      onConfirm: (val) => { UI.toast.success('密码修改成功'); }
    });
  },
  
  // 通知设置
  renderNotificationSettings(container) {
    const settings = SettingsManager.getSettings();
    const notifTypes = [
      { key: 'system', name: '系统通知', desc: '平台公告、维护通知、功能更新' },
      { key: 'job', name: '计算任务', desc: '任务开始、完成、失败、排队超时' },
      { key: 'course', name: '课程更新', desc: '新课程、新课上线、学习提醒' },
      { key: 'community', name: '社区互动', desc: '评论、点赞、收藏、关注、私信' },
      { key: 'resource', name: '资源预警', desc: '算力不足、存储不足、配额即将用完' },
      { key: 'security', name: '安全通知', desc: '异常登录、密码修改、设备变更' },
      { key: 'marketing', name: '营销通知', desc: '活动、优惠、推荐' }
    ];
    container.innerHTML = `
      <div class="card">
        ${notifTypes.map(t => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--border)">
            <div><div style="font-size:14px;font-weight:600">${t.name}</div><div style="font-size:12px;color:var(--text3)">${t.desc}</div></div>
            <label class="switch"><input type="checkbox" ${settings.notifications[t.key]?'checked':''} onchange="SettingsManager.updateSetting('notifications.${t.key}',this.checked);UI.toast.success('已更新')"><span class="slider"></span></label>
          </div>
        `).join('')}
      </div>
      <div class="section-header"><div class="section-title" style="font-size:14px">通知渠道</div></div>
      <div class="card">
        ${[
          {key:'inApp',name:'应用内通知',desc:'弹窗、角标、通知中心'},
          {key:'email',name:'邮件通知',desc:'发送到绑定邮箱'},
          {key:'sms',name:'短信通知',desc:'仅重要安全通知'},
          {key:'wechat',name:'微信推送',desc:'绑定微信后接收'}
        ].map(c => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--border)">
            <div><div style="font-size:14px;font-weight:600">${c.name}</div><div style="font-size:12px;color:var(--text3)">${c.desc}</div></div>
            <label class="switch"><input type="checkbox" ${settings.notificationChannels[c.key]?'checked':''} onchange="SettingsManager.updateSetting('notificationChannels.${c.key}',this.checked);UI.toast.success('已更新')"><span class="slider"></span></label>
          </div>
        `).join('')}
      </div>
      <div class="section-header"><div class="section-title" style="font-size:14px">免打扰模式</div></div>
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0">
          <div><div style="font-size:14px;font-weight:600">开启免打扰</div><div style="font-size:12px;color:var(--text3)">免打扰期间仅接收安全通知</div></div>
          <label class="switch"><input type="checkbox" ${settings.doNotDisturb.enabled?'checked':''} onchange="SettingsManager.updateSetting('doNotDisturb.enabled',this.checked);UI.toast.success(this.checked?'已开启免打扰':'已关闭免打扰')"><span class="slider"></span></label>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px">
          <div><label class="form-label">开始时间</label><input type="time" class="form-input" value="${settings.doNotDisturb.start}" onchange="SettingsManager.updateSetting('doNotDisturb.start',this.value)"></div>
          <div><label class="form-label">结束时间</label><input type="time" class="form-input" value="${settings.doNotDisturb.end}" onchange="SettingsManager.updateSetting('doNotDisturb.end',this.value)"></div>
        </div>
      </div>
      <button class="btn btn-secondary" onclick="UI.toast.success('已发送测试通知')"><i data-lucide="send" class="lucide"></i>发送测试通知</button>
    `;
  },
  
  // 偏好设置
  renderPreferenceSettings(container) {
    const settings = SettingsManager.getSettings();
    container.innerHTML = `
      <div class="card">
        <div class="form-group"><label class="form-label">主题模式</label>
          <div class="chip-row">
            ${[['light','浅色'],['dark','深色'],['system','跟随系统']].map(([v,n]) => `<span class="chip ${settings.theme===v?'selected':''}" onclick="SettingsManager.updateSetting('theme','${v}');Theme.set('${v}');this.parentElement.querySelectorAll('.chip').forEach(c=>c.classList.remove('selected'));this.classList.add('selected')">${n}</span>`).join('')}
          </div>
        </div>
        <div class="form-group"><label class="form-label">语言</label>
          <select class="form-select" onchange="SettingsManager.updateSetting('language',this.value);I18n.set(this.value)">
            ${[['zh-CN','简体中文'],['zh-TW','繁体中文'],['en-US','English'],['ja-JP','日本語']].map(([v,n]) => `<option value="${v}" ${settings.language===v?'selected':''}>${n}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label class="form-label">默认计算软件</label>
          <select class="form-select" onchange="SettingsManager.updateSetting('defaultSoftware',this.value)">
            ${['VASP','Quantum ESPRESSO','Gaussian','LAMMPS','ABACUS','CP2K'].map(s => `<option ${settings.defaultSoftware===s?'selected':''}>${s}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label class="form-label">默认Notebook内核</label>
          <select class="form-select" onchange="SettingsManager.updateSetting('defaultKernel',this.value)">
            ${['Python 3.12','Julia 1.9','R 4.3','MATLAB','Octave'].map(s => `<option ${settings.defaultKernel===s?'selected':''}>${s}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label class="form-label">显示密度</label>
          <div class="chip-row">
            ${[['compact','紧凑'],['normal','标准'],['comfortable','宽松']].map(([v,n]) => `<span class="chip ${settings.displayDensity===v?'selected':''}" onclick="SettingsManager.updateSetting('displayDensity','${v}');this.parentElement.querySelectorAll('.chip').forEach(c=>c.classList.remove('selected'));this.classList.add('selected')">${n}</span>`).join('')}
          </div>
        </div>
      </div>
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--border)">
          <div><div style="font-size:14px;font-weight:600">自动保存</div><div style="font-size:12px;color:var(--text3)">编辑内容时自动保存草稿</div></div>
          <label class="switch"><input type="checkbox" ${settings.autoSave?'checked':''} onchange="SettingsManager.updateSetting('autoSave',this.checked)"><span class="slider"></span></label>
        </div>
        <div class="form-group" style="margin-top:12px"><label class="form-label">自动保存间隔</label>
          <select class="form-select" onchange="SettingsManager.updateSetting('autoSaveInterval',parseInt(this.value))">
            ${[[30,'30秒'],[60,'1分钟'],[300,'5分钟'],[0,'手动']].map(([v,n]) => `<option value="${v}" ${settings.autoSaveInterval===v?'selected':''}>${n}</option>`).join('')}
          </select>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--border)">
          <div><div style="font-size:14px;font-weight:600">动画效果</div><div style="font-size:12px;color:var(--text3)">页面切换和交互动画</div></div>
          <label class="switch"><input type="checkbox" ${settings.animations?'checked':''} onchange="SettingsManager.updateSetting('animations',this.checked)"><span class="slider"></span></label>
        </div>
      </div>
      <div class="card">
        <div class="form-group"><label class="form-label">启动页面</label>
          <select class="form-select" onchange="SettingsManager.updateSetting('startupPage',this.value)">
            ${[['home','首页'],['compute','计算'],['learn','学习'],['ai','AI'],['profile','我的']].map(([v,n]) => `<option value="${v}" ${settings.startupPage===v?'selected':''}>${n}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label class="form-label">数据单位</label>
          <div class="chip-row">
            ${[['metric','公制'],['imperial','英制'],['scientific','科学计数法']].map(([v,n]) => `<span class="chip ${settings.units===v?'selected':''}" onclick="SettingsManager.updateSetting('units','${v}');this.parentElement.querySelectorAll('.chip').forEach(c=>c.classList.remove('selected'));this.classList.add('selected')">${n}</span>`).join('')}
          </div>
        </div>
      </div>
    `;
  },
  
  // 算力与套餐
  renderSubscriptionSettings(container) {
    const user = UserManager.getCurrentUser();
    container.innerHTML = `
      <div class="card" style="background:linear-gradient(135deg,#fff0e8,#ffe0d0);text-align:center;padding:24px">
        <div style="font-size:24px;font-weight:800;color:var(--primary)">${user.level}</div>
        <div style="font-size:13px;color:var(--text2);margin-top:4px">到期时间：2026-12-31</div>
        <button class="btn btn-primary" style="margin-top:16px" onclick="SettingsRenderer.showPlanComparison()"><i data-lucide="arrow-up-circle" class="lucide icon-white"></i>升级套餐</button>
      </div>
      <div class="section-header"><div class="section-title" style="font-size:14px">本月用量</div></div>
      <div class="card">
        ${[
          {name:'GPU卡时', used:user.stats.gpuHours||0, total:user.level==='专业版'?1000:100, unit:'h'},
          {name:'CPU核时', used:(user.stats.gpuHours||0)*10, total:(user.level==='专业版'?1000:100)*10, unit:'h'},
          {name:'存储空间', used:((user.stats.gpuHours||0)*0.5).toFixed(1), total:500, unit:'GB'}
        ].map(r => {
          const pct = Math.min(100, (r.used/r.total)*100);
          return `<div style="margin-bottom:14px"><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px"><span style="font-weight:600">${r.name}</span><span style="color:var(--text3)">${r.used} / ${r.total} ${r.unit}</span></div><div class="progress-track" style="height:8px"><div class="progress-fill pf-orange" style="width:${pct}%"></div></div></div>`;
        }).join('')}
      </div>
      <div class="section-header"><div class="section-title" style="font-size:14px">账单记录</div></div>
      <div class="card" style="padding:0">
        ${SettingsManager.getBills().map(b => `
          <div onclick="SettingsRenderer.showBillDetail('${b.id}')" style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid var(--border);cursor:pointer">
            <div><div style="font-size:13px;font-weight:600">${b.month}</div><div style="font-size:11px;color:var(--text3)">${b.date}</div></div>
            <div style="text-align:right"><div style="font-size:15px;font-weight:800">¥${b.amount.toFixed(2)}</div><div style="font-size:11px;color:${b.status==='paid'?'var(--green)':'var(--primary)'}">${b.status==='paid'?'已支付':'待支付'}</div></div>
          </div>
        `).join('')}
      </div>
      <button class="btn btn-secondary" onclick="UI.toast.success('发票申请已提交')"><i data-lucide="file-text" class="lucide"></i>申请发票</button>
    `;
  },
  
  showPlanComparison() {
    const plans = SettingsManager.getPlans();
    UI.dialog.alert({
      title: '套餐对比',
      message: plans.map(p => `${p.name}: ¥${p.price}/${p.period} - ${p.features.join(', ')}`).join('\n\n'),
      confirmText: '知道了'
    });
  },
  
  showBillDetail(billId) {
    const bill = SettingsManager.getBills().find(b => b.id === billId);
    if (!bill) return;
    UI.dialog.alert({
      title: bill.month + ' 账单',
      message: `金额: ¥${bill.amount.toFixed(2)}\n状态: ${bill.status==='paid'?'已支付':'待支付'}\n日期: ${bill.date}\n\n明细:\n${bill.items.map(i => `  ${i.name}: ¥${i.amount.toFixed(2)}`).join('\n')}`,
      confirmText: '知道了'
    });
  },
  
  // API与开发者
  renderApiSettings(container) {
    const keys = SettingsManager.getApiKeys();
    const isMock = typeof APIIntegration !== 'undefined' ? APIIntegration.isMockMode() : true;
    const apiBase = localStorage.getItem('unisci_api_base') || '/api/v1';
    container.innerHTML = `
      <div class="section-header"><div class="section-title" style="font-size:14px">数据源设置</div></div>
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--border)">
          <div><div style="font-size:14px;font-weight:600">模拟数据模式</div><div style="font-size:12px;color:var(--text3)">开启后使用本地模拟数据，关闭后连接真实后端API</div></div>
          <label class="switch"><input type="checkbox" ${isMock?'checked':''} onchange="SettingsRenderer.toggleMockMode(this.checked)"><span class="slider"></span></label>
        </div>
        <div style="padding:12px 0">
          <div style="font-size:13px;font-weight:600;margin-bottom:8px">API 基础地址</div>
          <input class="form-input" value="${apiBase}" placeholder="http://localhost:8080/api/v1" onchange="SettingsRenderer.setApiBase(this.value)" style="font-size:13px">
          <div style="font-size:11px;color:var(--text3);margin-top:6px">当前模式：${isMock?'<span style="color:var(--yellow)">模拟数据</span>':'<span style="color:var(--green)">真实API</span>'}</div>
        </div>
        <div style="padding:12px 0;border-top:1px solid var(--border)">
          <button class="btn btn-secondary" style="width:100%;font-size:13px" onclick="SettingsRenderer.testApiConnection()"><i data-lucide="wifi" class="lucide"></i>测试API连接</button>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin:16px 0 12px">
        <div style="font-size:14px;font-weight:700">API Keys</div>
        <button class="btn btn-primary" style="padding:6px 14px;font-size:12px" onclick="SettingsRenderer.createApiKey()"><i data-lucide="plus" class="lucide icon-white"></i>创建</button>
      </div>
      <div class="card" style="padding:0">
        ${keys.map(k => `
          <div style="padding:12px 16px;border-bottom:1px solid var(--border)">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div><div style="font-size:13px;font-weight:600">${k.name}</div><div style="font-size:11px;color:var(--text3);font-family:monospace">${k.key.substring(0,12)}...${k.key.substring(k.key.length-4)}</div></div>
              <div style="display:flex;gap:6px">
                <button class="btn btn-secondary" style="padding:4px 8px;font-size:11px" onclick="SettingsManager.toggleApiKey('${k.id}');UI.toast.success('已${k.status==='active'?'禁用':'启用'}')">${k.status==='active'?'禁用':'启用'}</button>
                <button class="btn btn-secondary" style="padding:4px 8px;font-size:11px;color:var(--primary)" onclick="SettingsManager.deleteApiKey('${k.id}');UI.toast.success('已删除')">删除</button>
              </div>
            </div>
            <div style="display:flex;gap:8px;margin-top:8px">
              ${k.permissions.map(p => `<span class="chip" style="font-size:10px;padding:2px 8px">${p}</span>`).join('')}
            </div>
            <div style="font-size:11px;color:var(--text3);margin-top:6px">创建: ${k.createdAt.split('T')[0]} · 调用: ${k.callCount}次 · ${k.lastUsed?'最后使用: '+k.lastUsed.split('T')[0]:'未使用'}</div>
          </div>
        `).join('')}
      </div>
      <div class="section-header"><div class="section-title" style="font-size:14px">Webhook</div><button class="btn btn-secondary" style="padding:4px 10px;font-size:11px" onclick="UI.toast.info('创建Webhook')">添加</button></div>
      <div class="card" style="padding:0">
        ${SettingsManager.getWebhooks().map(w => `
          <div style="padding:12px 16px;border-bottom:1px solid var(--border)">
            <div style="font-size:13px;font-weight:600;word-break:break-all">${w.url}</div>
            <div style="display:flex;gap:6px;margin-top:6px">${w.events.map(e => `<span class="chip" style="font-size:10px;padding:2px 8px">${e}</span>`).join('')}</div>
            <div style="font-size:11px;color:var(--text3);margin-top:6px">调用: ${w.callCount}次 · ${w.lastCalled?'最后: '+w.lastCalled.split('T')[0]:'未调用'}</div>
          </div>
        `).join('')}
      </div>
      <div class="section-header"><div class="section-title" style="font-size:14px">开发者资源</div></div>
      <div class="card">
        <div class="list-item" onclick="UI.toast.info('打开API文档')"><div class="list-item-icon" style="background:linear-gradient(135deg,#5ba3d9,#7ec0e8)"><i data-lucide="book-open" class="lucide icon-white"></i></div><div class="list-item-content"><div class="list-item-title">API文档</div></div><i data-lucide="external-link" class="lucide list-item-arrow"></i></div>
        <div class="list-item" onclick="UI.toast.info('下载SDK')"><div class="list-item-icon" style="background:linear-gradient(135deg,#5ccf8e,#7edda8)"><i data-lucide="download" class="lucide icon-white"></i></div><div class="list-item-content"><div class="list-item-title">SDK下载</div><div class="list-item-sub">Python / JavaScript / Go / Rust</div></div><i data-lucide="chevron-right" class="lucide list-item-arrow"></i></div>
        <div class="list-item" onclick="UI.toast.info('查看调用日志')"><div class="list-item-icon" style="background:linear-gradient(135deg,#ffc857,#ffd870)"><i data-lucide="activity" class="lucide icon-white"></i></div><div class="list-item-content"><div class="list-item-title">调用日志</div><div class="list-item-sub">本月 156 次调用</div></div><i data-lucide="chevron-right" class="lucide list-item-arrow"></i></div>
      </div>
    `;
  },
  
  createApiKey() {
    UI.dialog.prompt({
      title: '创建API Key',
      message: '请输入Key名称',
      confirmText: '创建',
      onConfirm: (name) => {
        const key = SettingsManager.createApiKey(name, ['read','compute']);
        UI.dialog.alert({
          title: 'API Key创建成功',
          message: `请妥善保存此Key，只显示一次：\n\n${key.key}`,
          confirmText: '我已保存'
        });
        this.renderApiSettings(document.getElementById('settings-detail-content'));
      }
    });
  },

  // 切换模拟模式
  toggleMockMode(enabled) {
    if (typeof APIIntegration !== 'undefined') {
      APIIntegration.setMockMode(enabled);
      UI.toast.success(enabled ? '已切换到模拟数据模式' : '已切换到真实API模式');
      this.renderApiSettings(document.getElementById('settings-detail-content'));
    } else {
      UI.toast.error('API集成层未加载');
    }
  },

  // 设置API基础地址
  setApiBase(url) {
    if (typeof APIIntegration !== 'undefined') {
      APIIntegration.setBaseURL(url);
      UI.toast.success('API地址已更新');
    }
  },

  // 测试API连接
  async testApiConnection() {
    if (typeof APIIntegration === 'undefined') {
      UI.toast.error('API集成层未加载');
      return;
    }
    UI.toast.info('正在测试连接...');
    const result = await APIIntegration.system.health();
    if (result.success) {
      UI.toast.success('API连接正常');
    } else {
      UI.toast.error('API连接失败，已自动降级到模拟模式');
    }
  },
  
  // 隐私设置
  renderPrivacySettings(container) {
    const settings = SettingsManager.getSettings();
    container.innerHTML = `
      <div class="card">
        <div class="form-group"><label class="form-label">个人资料公开范围</label>
          <select class="form-select" onchange="SettingsManager.updateSetting('privacy.profileVisibility',this.value)">
            ${[['public','公开'],['followers','仅关注者'],['private','仅自己']].map(([v,n]) => `<option value="${v}" ${settings.privacy.profileVisibility===v?'selected':''}>${n}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label class="form-label">动态可见性</label>
          <select class="form-select" onchange="SettingsManager.updateSetting('privacy.activityVisibility',this.value)">
            ${[['public','公开'],['followers','仅关注者'],['private','仅自己']].map(([v,n]) => `<option value="${v}" ${settings.privacy.activityVisibility===v?'selected':''}>${n}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="card">
        ${[
          ['privacy.onlineStatus','在线状态','显示你的在线状态'],
          ['privacy.searchable','搜索可见','允许其他用户搜索到你'],
          ['privacy.dataAuthorization','数据授权','授权平台使用你的数据改进服务'],
          ['privacy.personalizedRecommend','个性化推荐','基于你的行为推荐内容']
        ].map(([key,name,desc]) => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--border)">
            <div><div style="font-size:14px;font-weight:600">${name}</div><div style="font-size:12px;color:var(--text3)">${desc}</div></div>
            <label class="switch"><input type="checkbox" ${SettingsManager.getSetting(key)?'checked':''} onchange="SettingsManager.updateSetting('${key}',this.checked);UI.toast.success('已更新')"><span class="slider"></span></label>
          </div>
        `).join('')}
      </div>
      <div class="section-header"><div class="section-title" style="font-size:14px">数据管理</div></div>
      <div class="card">
        <div class="list-item" onclick="SettingsRenderer.exportData()"><div class="list-item-icon" style="background:linear-gradient(135deg,#5ba3d9,#7ec0e8)"><i data-lucide="download" class="lucide icon-white"></i></div><div class="list-item-content"><div class="list-item-title">导出我的数据</div><div class="list-item-sub">导出所有数据为JSON格式</div></div><i data-lucide="chevron-right" class="lucide list-item-arrow"></i></div>
        <div class="list-item" onclick="SettingsRenderer.confirmDeleteAccount()"><div class="list-item-icon" style="background:linear-gradient(135deg,#ff6b4a,#ff8a6a)"><i data-lucide="trash-2" class="lucide icon-white"></i></div><div class="list-item-content"><div class="list-item-title" style="color:var(--primary)">注销账户</div><div class="list-item-sub">永久删除账户和所有数据（30天冷静期）</div></div><i data-lucide="chevron-right" class="lucide list-item-arrow"></i></div>
      </div>
    `;
  },
  
  exportData() {
    const user = UserManager.getCurrentUser();
    const data = JSON.stringify(user, null, 2);
    const blob = new Blob([data], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `unisci_data_${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
    UI.toast.success('数据导出成功');
  },
  
  confirmDeleteAccount() {
    UI.dialog.confirm({
      title: '注销账户',
      message: '确定要注销账户吗？所有数据将在30天冷静期后永久删除，此操作不可撤销。',
      confirmText: '确认注销',
      cancelText: '再想想',
      onConfirm: () => { UI.toast.success('账户注销申请已提交，30天内可恢复'); }
    });
  },
  
  // 帮助与反馈
  renderHelpSettings(container) {
    container.innerHTML = `
      <div class="card">
        <div class="list-item" onclick="SettingsRenderer.showUserGuide()"><div class="list-item-icon" style="background:linear-gradient(135deg,#5ba3d9,#7ec0e8)"><i data-lucide="book-open" class="lucide icon-white"></i></div><div class="list-item-content"><div class="list-item-title">使用指南</div><div class="list-item-sub">新手入门、功能教程</div></div><i data-lucide="chevron-right" class="lucide list-item-arrow"></i></div>
        <div class="list-item" onclick="SettingsRenderer.showFAQ()"><div class="list-item-icon" style="background:linear-gradient(135deg,#5ccf8e,#7edda8)"><i data-lucide="help-circle" class="lucide icon-white"></i></div><div class="list-item-content"><div class="list-item-title">常见问题</div><div class="list-item-sub">FAQ、问题排查</div></div><i data-lucide="chevron-right" class="lucide list-item-arrow"></i></div>
        <div class="list-item" onclick="SettingsRenderer.showFeedback()"><div class="list-item-icon" style="background:linear-gradient(135deg,#ffc857,#ffd870)"><i data-lucide="message-square" class="lucide icon-white"></i></div><div class="list-item-content"><div class="list-item-title">意见反馈</div><div class="list-item-sub">告诉我们你的想法</div></div><i data-lucide="chevron-right" class="lucide list-item-arrow"></i></div>
        <div class="list-item" onclick="SettingsRenderer.showContact()"><div class="list-item-icon" style="background:linear-gradient(135deg,#9b7ed8,#b8a0e8)"><i data-lucide="headphones" class="lucide icon-white"></i></div><div class="list-item-content"><div class="list-item-title">联系客服</div><div class="list-item-sub">在线客服 · 工作日 9:00-18:00</div></div><i data-lucide="chevron-right" class="lucide list-item-arrow"></i></div>
      </div>
      <div class="section-header"><div class="section-title" style="font-size:14px">关于应用</div></div>
      <div class="card" style="text-align:center;padding:24px">
        <div style="width:64px;height:64px;margin:0 auto;background:linear-gradient(135deg,var(--primary),var(--primary2));border-radius:18px;display:flex;align-items:center;justify-content:center"><i data-lucide="atom" class="lucide icon-2xl icon-white"></i></div>
        <div style="font-size:18px;font-weight:800;margin-top:12px">UniSci Platform</div>
        <div style="font-size:12px;color:var(--text3);margin-top:4px">Version 2.0.0 · 计算空气</div>
        <div style="font-size:11px;color:var(--text3);margin-top:8px">让科学计算像水和空气一样触手可及</div>
      </div>
      <div class="card">
        <div class="list-item" onclick="SettingsRenderer.showChangelog()"><div class="list-item-content"><div class="list-item-title">更新日志</div></div><i data-lucide="chevron-right" class="lucide list-item-arrow"></i></div>
        <div class="list-item" onclick="SettingsRenderer.showTerms()"><div class="list-item-content"><div class="list-item-title">服务条款</div></div><i data-lucide="chevron-right" class="lucide list-item-arrow"></i></div>
        <div class="list-item" onclick="SettingsRenderer.showPrivacy()"><div class="list-item-content"><div class="list-item-title">隐私政策</div></div><i data-lucide="chevron-right" class="lucide list-item-arrow"></i></div>
        <div class="list-item" onclick="SettingsRenderer.showLicense()"><div class="list-item-content"><div class="list-item-title">开源许可</div></div><i data-lucide="chevron-right" class="lucide list-item-arrow"></i></div>
      </div>
    `;
  },
  
  // 使用指南
  showUserGuide() {
    UI.dialog.alert({
      title: '📖 UniSci 使用指南',
      message: `【快速入门】

1️⃣ 首页：浏览平台动态、快捷入口、运行中任务
2️⃣ 计算：提交DFT/MD/MC等计算任务，查看结果
3️⃣ 学习：浏览课程、虚拟实验、知识图谱
4️⃣ AI：与AI助手对话、生成代码、分析结果
5️⃣ 我的：管理个人内容、设置、成就

【核心功能】

• 计算任务：5步向导新建任务，实时日志，5Tab结果查看
• Notebook：7种内核，代码/Markdown单元格，AI辅助
• 工作流：可视化拖拽，30+节点，一键执行
• 分子建模：40+元素，3D视图，测量分析
• 材料库：12种材料，7Tab性质，对比导出

【小贴士】

• 点击底部导航切换主页面
• 点击左上角返回按钮回到上一页
• 下拉刷新页面内容
• 长按任务卡片可快速操作`,
      confirmText: '我知道了'
    });
  },
  
  // 常见问题
  showFAQ() {
    UI.dialog.alert({
      title: '❓ 常见问题 FAQ',
      message: `Q1：如何提交计算任务？
A：点击"计算"Tab → 右下角"+"按钮 → 5步向导选择类型/软件/资源/文件 → 确认提交。

Q2：计算任务需要多长时间？
A：取决于计算类型和资源配置。简单结构优化约5-30分钟，复杂能带计算可能需要数小时。

Q3：如何查看计算结果？
A：计算页 → 点击已完成任务 → "查看结果"按钮 → 5Tab查看能带/态密度/关键数据/结构/文件。

Q4：Notebook支持哪些语言？
A：支持Python、Julia、R、Bash、Octave、C++、DFT专用内核共7种。

Q5：如何导出数据？
A：材料详情页点击右上角下载按钮，支持CSV/JSON/Excel/CIF/POSCAR/PDF 6种格式。

Q6：遇到问题怎么办？
A：点击"我的" → "帮助与反馈" → "意见反馈"提交问题，或"联系客服"在线咨询。`,
      confirmText: '我知道了'
    });
  },
  
  // 联系客服
  showContact() {
    UI.dialog.alert({
      title: '🎧 联系客服',
      message: `【在线客服】
工作时间：工作日 9:00 - 18:00
响应时间：平均5分钟内

【联系方式】
• 邮箱：support@unisci.cn
• 电话：400-888-0000
• 微信公众号：UniSci科学计算

【紧急问题】
计算任务异常、数据丢失等紧急问题，请直接拨打客服电话，我们将优先处理。

【商务合作】
企业版采购、高校合作、API接入，请发送邮件至 business@unisci.cn`,
      confirmText: '我知道了'
    });
  },
  
  // 更新日志
  showChangelog() {
    UI.dialog.alert({
      title: '📝 更新日志',
      message: `【v2.0.0】2026-08-20
✨ 全新UI设计：3D Claymorphism风格
✨ 知识图谱：交互式节点漫游
✨ 学习系统：12门课程+课时学习+作业批改
✨ 虚拟实验室：4类16个实验
✨ 工作流编辑器：可视化节点连线
✨ 分子建模：3D视图+测量分析
✨ 材料数据库：12种材料7Tab性质
🔧 修复大量已知bug
🔧 优化页面加载性能

【v1.5.0】2026-07-15
✨ 新增Notebook系统
✨ 新增AI助手对话
✨ 优化计算任务调度

【v1.0.0】2026-06-01
🎉 首个正式版本发布
✨ 基础计算任务功能
✨ 用户体系与个人中心
✨ 材料数据库基础版`,
      confirmText: '我知道了'
    });
  },
  
  // 服务条款
  showTerms() {
    UI.dialog.alert({
      title: '📜 服务条款',
      message: `【总则】
欢迎使用UniSci科学计算平台。使用本服务即表示您同意以下条款。

【服务内容】
1. 提供科学计算任务提交与管理服务
2. 提供Notebook在线编程环境
3. 提供材料数据库查询与分析
4. 提供学习课程与虚拟实验
5. 提供AI辅助科研工具

【用户义务】
1. 不得利用平台进行违法活动
2. 不得恶意攻击平台系统
3. 不得上传侵权或有害数据
4. 妥善保管账户密码
5. 按时支付算力费用（付费版）

【知识产权】
1. 用户上传的数据归用户所有
2. 平台代码与设计归UniSci所有
3. 计算结果可由用户自由使用

【免责声明】
1. 因不可抗力导致服务中断不承担责任
2. 用户数据建议自行备份
3. 计算结果仅供科研参考

【条款修改】
平台保留修改条款的权利，修改后将在平台公示。`,
      confirmText: '我知道了'
    });
  },
  
  // 隐私政策
  showPrivacy() {
    UI.dialog.alert({
      title: '🔒 隐私政策',
      message: `【信息收集】
我们仅收集必要的用户信息：
• 账户信息：用户名、邮箱、机构
• 使用数据：计算任务、Notebook、学习记录
• 设备信息：浏览器类型、操作系统

【信息使用】
1. 提供和改进平台服务
2. 个性化推荐内容
3. 安全防护与异常检测
4. 统计分析（匿名化）

【信息保护】
• 数据传输采用HTTPS加密
• 敏感数据存储采用AES-256加密
• 定期安全审计与漏洞扫描
• 严格的内部访问权限控制

【信息共享】
我们不会向第三方出售您的个人信息。仅在以下情况共享：
• 获得您的明确同意
• 法律法规要求
• 合作服务商（仅提供必要数据）

【用户权利】
• 查看和修改个人信息
• 导出个人数据
• 删除账户和数据
• 关闭个性化推荐

【联系我们】
隐私问题请联系：privacy@unisci.cn`,
      confirmText: '我知道了'
    });
  },
  
  // 开源许可
  showLicense() {
    UI.dialog.alert({
      title: '📄 开源许可',
      message: `UniSci Platform 使用以下开源项目：

【前端框架】
• Vue.js — MIT License
• React — MIT License
• Lucide Icons — ISC License

【科学计算库】
• NumPy — BSD License
• SciPy — BSD License
• Matplotlib — PSF License
• ASE (Atomic Simulation Environment) — LGPL-2.1

【DFT软件接口】
• VASP — 商业软件（需用户自行授权）
• Quantum ESPRESSO — GPL-2.0
• ABACUS — MIT License
• LAMMPS — GPL-2.0

【后端服务】
• Node.js — MIT License
• Python — PSF License
• FastAPI — MIT License
• PostgreSQL — PostgreSQL License

【许可证说明】
各开源项目的完整许可证文本请参考对应项目官方网站。UniSci Platform 本身采用 Apache License 2.0 开源协议。

【致谢】
感谢所有开源社区贡献者的辛勤工作！`,
      confirmText: '我知道了'
    });
  },
  
  showFeedback() {
    UI.dialog.prompt({
      title: '意见反馈',
      message: '请描述你遇到的问题或建议',
      confirmText: '提交',
      onConfirm: (text) => { UI.toast.success('反馈已提交，感谢你的建议！'); }
    });
  },
  
  renderAboutSettings(container) {
    this.renderHelpSettings(container);
  },
  
  logout() {
    UI.dialog.confirm({
      title: '退出登录',
      message: '确定要退出登录吗？',
      confirmText: '退出',
      cancelText: '取消',
      onConfirm: () => {
        UserManager.logout();
        UI.toast.success('已退出登录');
        setTimeout(() => navigateTo('page-login'), 500);
      }
    });
  }
};

// ============================================================
// 九、渲染器 - 登录注册
// ============================================================
const LoginRenderer = {
  mode: 'login', // login | register | forgot
  
  render() {
    const container = document.getElementById('login-content');
    if (!container) return;
    
    if (this.mode === 'login') {
      container.innerHTML = `
        <div style="text-align:center;margin-bottom:32px">
          <div style="width:72px;height:72px;margin:0 auto;background:linear-gradient(135deg,var(--primary),var(--primary2));border-radius:20px;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(255,107,74,0.3)"><i data-lucide="atom" class="lucide icon-2xl icon-white"></i></div>
          <h1 style="font-size:24px;font-weight:800;margin-top:16px">欢迎回来</h1>
          <p style="font-size:13px;color:var(--text3);margin-top:6px">登录 UniSci，开启科学计算之旅</p>
        </div>
        <div class="card">
          <div class="form-group"><label class="form-label">用户名 / 邮箱</label><input class="form-input" id="login-username" placeholder="请输入用户名或邮箱" value="limingzhe"></div>
          <div class="form-group"><label class="form-label">密码</label><input type="password" class="form-input" id="login-password" placeholder="请输入密码" value="lz123456"></div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
            <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text2)"><input type="checkbox" checked> 记住我</label>
            <span style="font-size:12px;color:var(--primary);cursor:pointer" onclick="LoginRenderer.mode='forgot';LoginRenderer.render()">忘记密码？</span>
          </div>
          <button class="btn btn-primary" style="width:100%" onclick="LoginRenderer.doLogin()"><i data-lucide="log-in" class="lucide icon-white"></i>登录</button>
        </div>
        <div style="text-align:center;margin:20px 0;font-size:12px;color:var(--text3)">— 其他登录方式 —</div>
        <div style="display:flex;justify-content:center;gap:20px;margin-bottom:24px">
          <div onclick="UI.toast.info('微信登录')" style="width:44px;height:44px;background:#07c160;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer"><i data-lucide="message-circle" class="lucide icon-white"></i></div>
          <div onclick="UI.toast.info('QQ登录')" style="width:44px;height:44px;background:#12b7f5;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer"><i data-lucide="message-square" class="lucide icon-white"></i></div>
          <div onclick="UI.toast.info('GitHub登录')" style="width:44px;height:44px;background:#333;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer"><i data-lucide="github" class="lucide icon-white"></i></div>
        </div>
        <div style="text-align:center;font-size:13px;color:var(--text2)">
          还没有账号？<span style="color:var(--primary);font-weight:600;cursor:pointer" onclick="LoginRenderer.mode='register';LoginRenderer.render()">立即注册</span>
        </div>
        <div style="margin-top:24px;padding:12px;background:var(--bg-secondary);border-radius:10px">
          <div style="font-size:11px;color:var(--text3);margin-bottom:8px;font-weight:600">测试账号（点击快速登录）：</div>
          ${UserManager.getAllUsers().map((u,i) => `<div onclick="LoginRenderer.quickLogin(${i})" style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;cursor:pointer"><span style="font-size:12px">${u.avatar} ${u.name} (${u.username})</span><span style="font-size:11px;color:var(--primary)">${u.level}</span></div>`).join('')}
        </div>
      `;
    } else if (this.mode === 'register') {
      container.innerHTML = `
        <div style="text-align:center;margin-bottom:24px">
          <h1 style="font-size:22px;font-weight:800">创建账号</h1>
          <p style="font-size:13px;color:var(--text3);margin-top:6px">加入 UniSci，探索科学计算的无限可能</p>
        </div>
        <div class="card">
          <div class="form-group"><label class="form-label">用户名</label><input class="form-input" id="reg-username" placeholder="2-20个字符"></div>
          <div class="form-group"><label class="form-label">邮箱</label><input type="email" class="form-input" id="reg-email" placeholder="请输入邮箱"></div>
          <div class="form-group"><label class="form-label">密码</label><input type="password" class="form-input" id="reg-password" placeholder="至少8位，包含字母和数字" oninput="LoginRenderer.checkPasswordStrength(this.value)"></div>
          <div id="password-strength" style="margin-bottom:12px"></div>
          <div class="form-group"><label class="form-label">确认密码</label><input type="password" class="form-input" id="reg-password2" placeholder="再次输入密码"></div>
          <div class="form-group"><label class="form-label">学术身份</label>
            <select class="form-select" id="reg-role">
              ${['本科生','硕士生','博士生','博士后','研究员','教授','工程师','爱好者'].map(r => `<option>${r}</option>`).join('')}
            </select>
          </div>
          <label style="display:flex;align-items:flex-start;gap:8px;font-size:12px;color:var(--text2);margin-bottom:16px">
            <input type="checkbox" id="reg-agree" style="margin-top:2px"> 我已阅读并同意 <span style="color:var(--primary)">服务条款</span> 和 <span style="color:var(--primary)">隐私政策</span>
          </label>
          <button class="btn btn-primary" style="width:100%" onclick="LoginRenderer.doRegister()"><i data-lucide="user-plus" class="lucide icon-white"></i>注册</button>
        </div>
        <div style="text-align:center;margin-top:20px;font-size:13px;color:var(--text2)">
          已有账号？<span style="color:var(--primary);font-weight:600;cursor:pointer" onclick="LoginRenderer.mode='login';LoginRenderer.render()">立即登录</span>
        </div>
      `;
    } else if (this.mode === 'forgot') {
      container.innerHTML = `
        <div style="text-align:center;margin-bottom:24px">
          <h1 style="font-size:22px;font-weight:800">找回密码</h1>
          <p style="font-size:13px;color:var(--text3);margin-top:6px">输入邮箱，我们将发送重置链接</p>
        </div>
        <div class="card">
          <div class="form-group"><label class="form-label">邮箱地址</label><input type="email" class="form-input" id="forgot-email" placeholder="请输入注册邮箱"></div>
          <button class="btn btn-primary" style="width:100%" onclick="UI.toast.success('重置链接已发送到邮箱');setTimeout(()=>{LoginRenderer.mode='login';LoginRenderer.render()},1500)"><i data-lucide="send" class="lucide icon-white"></i>发送重置链接</button>
        </div>
        <div style="text-align:center;margin-top:20px;font-size:13px;color:var(--text2)">
          想起密码了？<span style="color:var(--primary);font-weight:600;cursor:pointer" onclick="LoginRenderer.mode='login';LoginRenderer.render()">返回登录</span>
        </div>
      `;
    }
    if (typeof renderIcons === 'function') renderIcons();
  },
  
  checkPasswordStrength(pwd) {
    const el = document.getElementById('password-strength');
    if (!el) return;
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;
    const labels = ['弱','一般','中等','强','非常强'];
    const colors = ['#ff6b4a','#ffc857','#5ba3d9','#5ccf8e','#9b7ed8'];
    el.innerHTML = `<div style="display:flex;gap:4px;margin-bottom:4px">${[0,1,2,3].map(i => `<div style="flex:1;height:4px;border-radius:2px;background:${i<strength?colors[strength-1]:'var(--border)'}"></div>`).join('')}</div><div style="font-size:11px;color:${colors[Math.max(0,strength-1)]}">密码强度：${labels[Math.max(0,strength-1)]}</div>`;
  },
  
  doLogin() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    if (!username || !password) { UI.toast.error('请输入用户名和密码'); return; }
    const result = UserManager.login(username, password);
    if (result.success) {
      UI.toast.success(`欢迎回来，${result.user.name}！`);
      setTimeout(() => { switchTab('home'); renderAll(); }, 800);
    } else {
      UI.toast.error(result.message);
    }
  },
  
  quickLogin(index) {
    UserManager.switchUser(index);
    Storage.local.set('unisci_logged_in', 'true');
    UI.toast.success(`已登录：${UserManager.getCurrentUser().name}`);
    setTimeout(() => { switchTab('home'); renderAll(); }, 500);
  },
  
  doRegister() {
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const password2 = document.getElementById('reg-password2').value;
    const role = document.getElementById('reg-role').value;
    const agree = document.getElementById('reg-agree').checked;
    
    if (!username || username.length < 2) { UI.toast.error('用户名至少2个字符'); return; }
    if (!email || !email.includes('@')) { UI.toast.error('请输入有效邮箱'); return; }
    if (password.length < 8) { UI.toast.error('密码至少8位'); return; }
    if (password !== password2) { UI.toast.error('两次密码不一致'); return; }
    if (!agree) { UI.toast.error('请同意服务条款和隐私政策'); return; }
    
    const result = UserManager.register({ username, email, password, displayName: username, academicIdentity: role });
    if (result.success) {
      UI.toast.success('注册成功，欢迎加入 UniSci！');
      setTimeout(() => { switchTab('home'); renderAll(); }, 1000);
    } else {
      UI.toast.error(result.message);
    }
  }
};

// ============================================================
// 十、渲染器 - 我的内容列表
// ============================================================
const MyContentRenderer = {
  currentType: 'articles',
  currentFilter: 'all',
  currentSort: 'newest',
  searchKeyword: '',
  selectedIds: [],
  
  render() {
    const type = window._myContentType || 'articles';
    this.currentType = type;
    const info = MyContentManager.contentTypes[type];
    document.getElementById('my-content-title').textContent = info.name;
    
    this.renderFilters();
    this.renderList();
  },
  
  renderFilters() {
    const container = document.getElementById('my-content-filters');
    if (!container) return;
    const type = this.currentType;
    
    let filterOptions = [['all','全部']];
    if (type === 'jobs') filterOptions = [['all','全部'],['running','运行中'],['queued','排队中'],['completed','已完成'],['failed','失败']];
    else if (type === 'articles') filterOptions = [['all','全部'],['published','已发布'],['draft','草稿']];
    else if (type === 'courses') filterOptions = [['all','全部'],['learning','学习中'],['completed','已完成']];
    
    container.innerHTML = `
      <div class="card" style="padding:10px 12px;margin-bottom:12px">
        <div style="display:flex;gap:8px;align-items:center">
          <i data-lucide="search" class="lucide" style="width:16px;height:16px;color:var(--text3)"></i>
          <input class="form-input" style="border:none;box-shadow:none;padding:0;margin:0;flex:1;font-size:13px" placeholder="搜索..." value="${this.searchKeyword}" oninput="MyContentRenderer.search(this.value)">
        </div>
      </div>
      <div class="tab-bar" style="margin-bottom:12px">
        ${filterOptions.map(([v,n]) => `<button class="tab-item ${this.currentFilter===v?'active':''}" onclick="MyContentRenderer.setFilter('${v}')">${n}</button>`).join('')}
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div class="chip-row">
          <span class="chip ${this.currentSort==='newest'?'selected':''}" onclick="MyContentRenderer.setSort('newest')">最新</span>
          <span class="chip ${this.currentSort==='name'?'selected':''}" onclick="MyContentRenderer.setSort('name')">名称</span>
          <span class="chip ${this.currentSort==='popular'?'selected':''}" onclick="MyContentRenderer.setSort('popular')">热度</span>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-secondary" style="padding:6px 10px;font-size:12px" onclick="MyContentRenderer.toggleBatch()"><i data-lucide="check-square" class="lucide" style="width:14px;height:14px"></i></button>
          <button class="btn btn-primary" style="padding:6px 12px;font-size:12px" onclick="MyContentRenderer.createNew()"><i data-lucide="plus" class="lucide icon-white" style="width:14px;height:14px"></i>新建</button>
        </div>
      </div>
    `;
  },
  
  renderList() {
    const container = document.getElementById('my-content-list');
    if (!container) return;
    
    let list = MyContentManager.getList(this.currentType);
    list = MyContentManager.search(this.currentType, this.searchKeyword);
    list = MyContentManager.filter(this.currentType, this.currentFilter);
    list = MyContentManager.sort(list, this.currentSort);
    
    if (list.length === 0) {
      container.innerHTML = UI.state.empty(this.currentType, {desc: '还没有内容，点击新建开始创建'});
      return;
    }
    
    const info = MyContentManager.contentTypes[this.currentType];
    container.innerHTML = list.map(item => this.renderItem(item)).join('');
    if (typeof renderIcons === 'function') renderIcons();
  },
  
  renderItem(item) {
    const type = this.currentType;
    const id = item.id || '';
    const selected = this.selectedIds.includes(id);
    
    let content = '';
    if (type === 'articles') {
      content = `
        <div class="article-card" onclick="MyContentRenderer.openItem('${id}')">
          <span class="article-tag" style="background:#9b7ed822;color:#9b7ed8">${item.tag||'学习笔记'}</span>
          <div class="article-title">${item.title}</div>
          <div class="article-meta">
            <span><i data-lucide="calendar" class="lucide" style="width:11px;height:11px"></i>${item.date||item.createdAt||'今天'}</span>
            <div class="article-stats">
              <span class="article-stat"><i data-lucide="heart" class="lucide" style="width:11px;height:11px"></i>${item.likes||0}</span>
              <span class="article-stat"><i data-lucide="message-circle" class="lucide" style="width:11px;height:11px"></i>${item.comments||0}</span>
              <span class="article-stat"><i data-lucide="eye" class="lucide" style="width:11px;height:11px"></i>${item.views||0}</span>
            </div>
          </div>
        </div>`;
    } else if (type === 'notebooks') {
      content = `
        <div class="notebook-card" onclick="MyContentRenderer.openItem('${id}')">
          <div class="notebook-icon" style="background:linear-gradient(135deg,#5ba3d9,#7ec0e8)"><i data-lucide="${item.icon||'notebook-pen'}" class="lucide icon-lg icon-white"></i></div>
          <div class="notebook-info">
            <div class="notebook-title">${item.title}</div>
            <div class="notebook-meta">
              <span><i data-lucide="code-2" class="lucide" style="width:11px;height:11px"></i>${item.kernel||'Python 3.12'}</span>
              <span><i data-lucide="clock" class="lucide" style="width:11px;height:11px"></i>${item.lastModified||item.createdAt||'今天'}</span>
              <span>${item.cells||0} cells</span>
            </div>
          </div>
        </div>`;
    } else if (type === 'jobs') {
      const isRunning = item.status === 'running' || item.status === 'queued';
      content = `
        <div class="card" onclick="MyContentRenderer.openItem('${id}')">
          <div class="card-header">
            <div class="card-title"><i data-lucide="${item.icon||'cpu'}" class="lucide" style="width:16px;height:16px;color:var(--blue)"></i>${item.title}</div>
            <span class="card-badge ${isRunning?'badge-running':'badge-completed'}">${isRunning?(item.status==='running'?'运行中':'排队中'):'已完成'}</span>
          </div>
          <div class="job-meta">
            <span><i data-lucide="flask-conical" class="lucide" style="width:13px;height:13px"></i>${item.software||'VASP'} · ${item.type||'DFT'}</span>
            <span>${isRunning?(item.progress+'%'):(item.completed||'今天')}</span>
          </div>
          ${isRunning?`<div class="progress-track"><div class="progress-fill pf-blue" style="width:${item.progress||0}%"></div></div>`:''}
        </div>`;
    } else if (type === 'courses') {
      content = `
        <div class="card course-card" onclick="MyContentRenderer.openItem('${id}')">
          <div class="course-thumb ct-blue"><i data-lucide="${item.icon||'book-open'}" class="lucide icon-2xl icon-white"></i></div>
          <div class="course-info">
            <div class="course-name">${item.title}</div>
            <div class="course-meta"><i data-lucide="play-circle" class="lucide" style="width:12px;height:12px"></i>${item.totalLessons||0}课时 · ${item.currentLesson||'开始学习'}</div>
            <div class="course-progress-bar"><div class="course-progress-fill pf-blue" style="width:${item.progress||0}%"></div></div>
            <div class="course-progress-text" style="color:var(--blue)">进度 ${item.progress||0}%</div>
          </div>
        </div>`;
    } else if (type === 'workflows') {
      content = `
        <div class="workflow-card" onclick="MyContentRenderer.openItem('${id}')">
          <div class="workflow-header">
            <div class="workflow-name"><i data-lucide="${item.icon||'workflow'}" class="lucide" style="width:16px;height:16px;color:var(--primary)"></i>${item.name}</div>
            <span class="card-badge ${item.status==='running'?'badge-running':'badge-completed'}">${item.status==='running'?'运行中':'已完成'}</span>
          </div>
          <div class="workflow-steps">共 ${item.steps||0} 步</div>
          <div class="workflow-current">${item.currentStep||'已完成'}</div>
          <div class="progress-track"><div class="progress-fill pf-orange" style="width:${item.progress||0}%"></div></div>
        </div>`;
    } else if (type === 'molecules' || type === 'materials') {
      content = `
        <div class="list-item" onclick="MyContentRenderer.openItem('${id}')">
          <div class="list-item-icon" style="background:linear-gradient(135deg,#5ba3d9,#7ec0e8)"><i data-lucide="${item.icon||'atom'}" class="lucide icon-white"></i></div>
          <div class="list-item-content">
            <div class="list-item-title">${item.formula||item.name} · ${item.name||''}</div>
            <div class="list-item-sub">${item.bandgap?('带隙 '+item.bandgap+' · '):''}${item.type||item.atoms+' atoms'}</div>
          </div>
          <i data-lucide="chevron-right" class="lucide list-item-arrow"></i>
        </div>`;
    } else {
      content = `<div class="card"><div class="card-title">${item.title||item.name||'未命名'}</div></div>`;
    }
    
    if (this.selectedIds.length > 0) {
      return `<div style="position:relative;border:2px solid ${selected?'var(--primary)':'transparent'};border-radius:14px;margin-bottom:12px" onclick="event.stopPropagation();MyContentRenderer.toggleSelect('${id}')">${content}<div style="position:absolute;top:8px;right:8px;width:22px;height:22px;border-radius:50%;background:${selected?'var(--primary)':'#fff'};border:2px solid ${selected?'var(--primary)':'var(--border)'};display:flex;align-items:center;justify-content:center">${selected?'<i data-lucide="check" class="lucide icon-white" style="width:14px;height:14px"></i>':''}</div></div>`;
    }
    return `<div style="margin-bottom:12px">${content}</div>`;
  },
  
  setFilter(filter) { this.currentFilter = filter; this.renderFilters(); this.renderList(); },
  setSort(sort) { this.currentSort = sort; this.renderFilters(); this.renderList(); },
  search(kw) { this.searchKeyword = kw; this.renderList(); },
  
  openItem(id) {
    const type = this.currentType;
    if (type === 'articles') navigateTo('page-article-detail', _store({id}));
    else if (type === 'notebooks') navigateTo('page-notebook-detail', _store({id}));
    else if (type === 'jobs') navigateTo('page-job-detail', _store({id}));
    else if (type === 'courses') navigateTo('page-course-detail', _store({id}));
    else if (type === 'workflows') navigateTo('page-workflow-editor');
    else if (type === 'molecules') navigateTo('page-molecules');
    else if (type === 'materials') navigateTo('page-materials');
    else UI.toast.info('打开内容');
  },
  
  createNew() {
    const type = this.currentType;
    if (type === 'articles') navigateTo('page-article-publish');
    else if (type === 'notebooks') UI.toast.success('新建Notebook');
    else if (type === 'jobs') navigateTo('page-job-new');
    else if (type === 'workflows') navigateTo('page-workflow-editor');
    else if (type === 'molecules') navigateTo('page-molecules');
    else UI.toast.success('新建');
  },
  
  toggleBatch() {
    if (this.selectedIds.length > 0) {
      this.selectedIds = [];
    }
    this.renderList();
  },
  
  toggleSelect(id) {
    const idx = this.selectedIds.indexOf(id);
    if (idx >= 0) this.selectedIds.splice(idx, 1);
    else this.selectedIds.push(id);
    this.renderList();
  },
  
  deleteSelected() {
    if (this.selectedIds.length === 0) return;
    UI.dialog.confirm({
      title: '批量删除',
      message: `确定要删除选中的 ${this.selectedIds.length} 项吗？`,
      onConfirm: () => {
        MyContentManager.batchDelete(this.currentType, this.selectedIds);
        this.selectedIds = [];
        this.renderList();
        UI.toast.success('删除成功');
      }
    });
  }
};

// ============================================================
// 十一、渲染器 - 发布文章
// ============================================================
const ArticlePublishRenderer = {
  content: '',
  
  render() {
    const container = document.getElementById('publish-content');
    if (!container) return;
    container.innerHTML = `
      <div class="card">
        <div class="form-group"><label class="form-label">文章标题</label><input class="form-input" id="publish-title" placeholder="请输入文章标题（最多100字）" maxlength="100"></div>
        <div class="form-group"><label class="form-label">文章分类</label>
          <select class="form-select" id="publish-category">
            ${['科研笔记','教程','综述','观点','问答','资源分享'].map(c => `<option>${c}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label class="form-label">标签（最多5个）</label>
          <div class="chip-row" id="publish-tags">
            ${['材料科学','凝聚态物理','DFT计算','AI for Science','分子动力学','拓扑材料'].map(t => `<span class="chip" onclick="this.classList.toggle('selected')">${t}</span>`).join('')}
          </div>
        </div>
        <div class="form-group"><label class="form-label">封面图</label>
          <div class="card" style="background:#f5f8fb;margin-bottom:0;box-shadow:none;text-align:center;padding:24px;cursor:pointer" onclick="UI.toast.info('选择封面图')">
            <i data-lucide="image" class="lucide icon-2xl" style="color:var(--text3)"></i>
            <div style="font-size:13px;color:var(--text3);margin-top:8px">点击上传封面图（可选）</div>
          </div>
        </div>
      </div>
      <div class="card">
        <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">
          ${[['bold','bold','加粗'],['italic','italic','斜体'],['heading','heading','标题'],['list','list','列表'],['code','code','代码'],['formula','sigma','公式'],['image','image','图片'],['quote','quote','引用']].map(([icon,name,label]) => `<button class="btn btn-secondary" style="padding:6px 10px;font-size:12px" onclick="UI.toast.info('${label}')"><i data-lucide="${icon}" class="lucide" style="width:14px;height:14px"></i></button>`).join('')}
        </div>
        <div class="form-group"><label class="form-label">文章正文</label>
          <textarea class="form-textarea" id="publish-content-text" style="min-height:300px" placeholder="支持 Markdown 格式，可插入代码块、公式、图片等..."></textarea>
        </div>
      </div>
      <div class="card">
        <div class="form-group"><label class="form-label">可见性</label>
          <div class="chip-row">
            ${[['public','公开'],['followers','仅关注者'],['private','私有'],['password','密码访问']].map(([v,n]) => `<span class="chip ${v==='public'?'selected':''}" onclick="this.parentElement.querySelectorAll('.chip').forEach(c=>c.classList.remove('selected'));this.classList.add('selected')">${n}</span>`).join('')}
          </div>
        </div>
        <div class="form-group"><label class="form-label">文章摘要（可选，最多200字）</label>
          <textarea class="form-textarea" id="publish-summary" style="min-height:80px" maxlength="200" placeholder="自动生成或手动编写文章摘要"></textarea>
        </div>
      </div>
      <div style="display:flex;gap:12px">
        <button class="btn btn-secondary" style="flex:1" onclick="ArticlePublishRenderer.saveDraft()"><i data-lucide="save" class="lucide"></i>存草稿</button>
        <button class="btn btn-primary" style="flex:1" onclick="ArticlePublishRenderer.publish()"><i data-lucide="send" class="lucide icon-white"></i>发布文章</button>
      </div>
    `;
  },
  
  saveDraft() {
    const title = document.getElementById('publish-title').value;
    if (!title) { UI.toast.error('请输入文章标题'); return; }
    const content = document.getElementById('publish-content-text').value;
    ArticleManager.saveDraft({ title, content, category: document.getElementById('publish-category').value });
    UI.toast.success('草稿已保存');
  },
  
  publish() {
    const title = document.getElementById('publish-title').value;
    const content = document.getElementById('publish-content-text').value;
    if (!title) { UI.toast.error('请输入文章标题'); return; }
    if (!content || content.length < 10) { UI.toast.error('文章内容至少10个字符'); return; }
    
    const selectedTags = Array.from(document.querySelectorAll('#publish-tags .chip.selected')).map(c => c.textContent);
    const article = ArticleManager.publishArticle({
      title, content,
      tag: selectedTags[0] || '学习笔记',
      category: document.getElementById('publish-category').value,
      summary: document.getElementById('publish-summary').value
    });
    
    UI.toast.success('文章发布成功，获得50积分！');
    setTimeout(() => { goBack(); if (typeof renderAll === 'function') renderAll(); }, 1000);
  }
};

// ============================================================
// 十二、初始化
// ============================================================
function initUserSystem() {
  UserManager.init();
  
  // 兼容旧版全局函数
  window.getCurrentUser = () => UserManager.getCurrentUser();
  window.getAllUsers = () => UserManager.getAllUsers();
  window.switchUser = (index) => UserManager.switchUser(index);
  window.currentUserIndex = UserManager.currentUserIndex;
  
  // 监听用户切换事件，更新currentUserIndex
  UniSci.on('user:switched', () => {
    window.currentUserIndex = UserManager.currentUserIndex;
  });
  
  // 检查是否需要显示登录页（首次访问）
  if (!UserManager.isLoggedIn() && !Storage.local.get('unisci_skipped_login')) {
    // 不强制登录，允许游客浏览
  }
  
  console.log('[UniSci] 板块9 用户体系已加载');
}

// DOM加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initUserSystem);
} else {
  initUserSystem();
}
