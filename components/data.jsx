// 模拟数据层 —— 一个深度思考者的真实使用场景

// 今日时间块数据
const TIME_BLOCKS = [
  {
    id: 'focus-1',
    type: 'focus',
    label: '深度专注',
    startTime: '07:30',
    endTime: '09:30',
    duration: 120, // 分钟
    status: 'completed',
    title: '阅读《存在与时间》第一篇',
    notes: 3,
  },
  {
    id: 'rest-1',
    type: 'rest',
    label: '休息恢复',
    startTime: '09:30',
    endTime: '10:00',
    duration: 30,
    status: 'completed',
    title: '晨间散步 + 沏茶',
  },
  {
    id: 'focus-2',
    type: 'focus',
    label: '深度专注',
    startTime: '10:00',
    endTime: '12:00',
    duration: 120,
    status: 'completed',
    title: '写作：知识升维方法论',
    notes: 5,
  },
  {
    id: 'life-1',
    type: 'life',
    label: '生活体验',
    startTime: '12:00',
    endTime: '13:30',
    duration: 90,
    status: 'completed',
    title: '午餐 + 午休',
  },
  {
    id: 'social-1',
    type: 'social',
    label: '社交连接',
    startTime: '13:30',
    endTime: '14:30',
    duration: 60,
    status: 'completed',
    title: '与好友讨论《悉达多》',
  },
  {
    id: 'focus-3',
    type: 'focus',
    label: '深度专注',
    startTime: '14:30',
    endTime: '17:00',
    duration: 150,
    status: 'in-progress',
    title: '构建个人知识图谱 v2.0',
    notes: 4,
  },
  {
    id: 'life-2',
    type: 'life',
    label: '生活体验',
    startTime: '17:00',
    endTime: '18:30',
    duration: 90,
    status: 'pending',
    title: '准备晚餐 + 听播客',
  },
  {
    id: 'focus-4',
    type: 'focus',
    label: '深度专注',
    startTime: '19:00',
    endTime: '21:00',
    duration: 120,
    status: 'pending',
    title: '晚间写作',
  },
  {
    id: 'rest-2',
    type: 'rest',
    label: '休息恢复',
    startTime: '21:00',
    endTime: '22:00',
    duration: 60,
    status: 'pending',
    title: '冥想 + 阅读散文',
  },
];

// 时间块配色（纸感暖调）
const TIME_BLOCK_COLORS = {
  focus: {
    bg: '#3D4A6B',      // 深靛蓝
    light: '#E8EAF0',
    soft: 'rgba(61, 74, 107, 0.08)',
    text: '#3D4A6B',
  },
  social: {
    bg: '#B56B3A',      // 赭石色
    light: '#F3E6DA',
    soft: 'rgba(181, 107, 58, 0.08)',
    text: '#B56B3A',
  },
  life: {
    bg: '#5A7A4E',      // 苔绿
    light: '#E4EBDE',
    soft: 'rgba(90, 122, 78, 0.08)',
    text: '#5A7A4E',
  },
  rest: {
    bg: '#C9A23F',      // 砂金
    light: '#F5ECD2',
    soft: 'rgba(201, 162, 63, 0.08)',
    text: '#9C7B2A',
  },
};

// 笔记数据
const NOTES_STATS = {
  todayNew: 3,
  todayEdited: 5,
  totalNotes: 1247,
  totalCards: 386,
  streakDays: 23, // 连续写作天数
  weeklyActivity: [
    { day: '周一', count: 8, new: 2 },
    { day: '周二', count: 12, new: 4 },
    { day: '周三', count: 6, new: 1 },
    { day: '周四', count: 15, new: 5 },
    { day: '周五', count: 9, new: 3 },
    { day: '周六', count: 18, new: 6 },
    { day: '周日', count: 8, new: 3 }, // 今天
  ],
  recentNotes: [
    { id: 1, title: '知识升维的四层结构', time: '14:22', type: 'edit', tags: ['方法论', '知识管理'] },
    { id: 2, title: '《存在与时间》读后：烦与畏', time: '09:15', type: 'new', tags: ['哲学', '海德格尔'] },
    { id: 3, title: '注意力经济下的主体性守护', time: '08:40', type: 'new', tags: ['思考', '数字极简'] },
    { id: 4, title: '个人知识图谱 v2.0 架构', time: '15:30', type: 'edit', tags: ['技术', '知识图谱'] },
    { id: 5, title: '冥想日记 · 第二十三天', time: '07:00', type: 'new', tags: ['日记', '冥想'] },
  ],
};

// 知识升维数据
const KNOWLEDGE_LAYERS = [
  {
    id: 'source',
    name: '原文',
    description: '原始输入：书籍、文章、对话记录',
    count: 1247,
    percent: 100,
    icon: 'source',
  },
  {
    id: 'card',
    name: '卡片',
    description: '拆解为独立知识点的原子卡片',
    count: 386,
    percent: 31,
    icon: 'card',
  },
  {
    id: 'summary',
    name: '摘要',
    description: '跨卡片的主题归纳与结构化总结',
    count: 94,
    percent: 8,
    icon: 'summary',
  },
  {
    id: 'meta',
    name: '元知识',
    description: '升维后的思维模型与第一性原理',
    count: 27,
    percent: 2.2,
    icon: 'meta',
  },
];

// 核心思考目标
const THINKING_GOALS = [
  {
    id: 'goal-1',
    title: '知识升维方法论',
    description: '探索从原始信息到元知识的内化路径，建立可复用的个人知识加工流程',
    progress: 65,
    status: 'active',
    tags: ['知识管理', '方法论', '认知科学'],
    recentActivity: '更新了「四层升维模型」摘要',
    activityTime: '2小时前',
    relatedNotes: 47,
    details: {
      phases: [
        { name: '原文收集', done: true, desc: '建立稳定的信息输入渠道' },
        { name: '卡片拆解', done: true, desc: '原子化知识点，每张卡片一个核心概念' },
        { name: '摘要归纳', done: false, desc: '跨卡片主题聚类，形成结构化总结' },
        { name: '元知识提炼', done: false, desc: '抽象出可迁移的思维模型' },
      ],
      insight: '当前瓶颈在于从"卡片"到"摘要"的跃迁——卡片数量足够，但缺少主动的主题归纳动作。需要建立每周一次的"摘要时间"。',
    },
  },
  {
    id: 'goal-2',
    title: '存在主义视角下的主体性',
    description: '从海德格尔、萨特到当代数字时代，重新思考何为"成为自己"',
    progress: 38,
    status: 'active',
    tags: ['哲学', '存在主义', '主体性'],
    recentActivity: '新增卡片：烦的两种形态',
    activityTime: '今天上午',
    relatedNotes: 23,
    details: {
      phases: [
        { name: '基础阅读', done: true, desc: '《存在与时间》《存在与虚无》核心章节' },
        { name: '概念梳理', done: false, desc: '此在、烦、畏、自由等核心概念卡片化' },
        { name: '当代延伸', done: false, desc: '数字时代的主体性危机与救赎路径' },
        { name: '实践整合', done: false, desc: '将哲学思考落实为生活准则' },
      ],
      insight: '海德格尔的"此在"概念与当代注意力经济的批判之间存在深刻共鸣——两者都在追问：人如何不被"常人"吞噬，成为本真的自己。',
    },
  },
  {
    id: 'goal-3',
    title: '个人知识图谱构建',
    description: '以 Markdown 为唯一数据结构，构建可视化的个人知识网络',
    progress: 82,
    status: 'active',
    tags: ['技术', '知识图谱', '工具'],
    recentActivity: '完成 v2.0 图谱渲染引擎重构',
    activityTime: '30分钟前',
    relatedNotes: 68,
    details: {
      phases: [
        { name: '数据结构设计', done: true, desc: 'Frontmatter + 双向链接' },
        { name: '解析引擎', done: true, desc: '本地 Markdown 解析与关系提取' },
        { name: '可视化渲染', done: true, desc: '力导向图 + 层级视图' },
        { name: '交互优化', done: false, desc: '路径探索、聚类分析、时间维度' },
      ],
      insight: '知识图谱的价值不在于"好看"，而在于发现那些被忽视的连接——当两个看似无关的领域在图谱中靠近时，往往是新想法诞生的时刻。',
    },
  },
];

// 导航菜单
const NAV_ITEMS = [
  { id: 'dashboard', label: '仪表盘', icon: 'dashboard', active: false, done: true },
  { id: 'editor', label: '编辑器', icon: 'editor', active: false, done: true },
  { id: 'graph', label: '知识图谱', icon: 'graph', active: false, done: true },
  { id: 'calendar', label: '时间日历', icon: 'calendar', active: false, done: true },
  { id: 'notes', label: '升维', icon: 'notes', active: false, done: true },
  { id: 'ai', label: '共生体', icon: 'ai', active: false, done: true },
  { id: 'social', label: '连接', icon: 'social', active: false, done: true },
  { id: 'nodes', label: '节点', icon: 'nodes', active: false, done: true },
  { id: 'voice', label: '语音', icon: 'voice', active: false, done: true },
  { id: 'circles', label: '圈子', icon: 'circles', active: true, done: true },
  { id: 'review', label: '回顾', icon: 'review', active: false, disabled: true },
];

// 日期信息
const TODAY_INFO = {
  date: new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }),
  lunar: '七月初六',
  season: '处暑',
  greeting: '下午好',
};

Object.assign(window, {
  TIME_BLOCKS,
  TIME_BLOCK_COLORS,
  NOTES_STATS,
  KNOWLEDGE_LAYERS,
  THINKING_GOALS,
  NAV_ITEMS,
  TODAY_INFO,
});
