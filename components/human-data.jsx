// ============================================
// 人类节点系统 模拟数据
// ============================================

// 话题列表
const HUMAN_TOPICS = [
  {
    id: 't-music',
    name: '音乐',
    color: '#B56B3A',
    icon: '♪',
    description: '一切与音乐有关的人和讨论',
    nodeCount: 4,
  },
  {
    id: 't-oneos',
    name: 'OneOS架构',
    color: '#4F46E5',
    icon: '◈',
    description: '产品设计与技术架构的合作者们',
    nodeCount: 5,
  },
  {
    id: 't-social',
    name: '社交重塑',
    color: '#9B6BA0',
    icon: '◎',
    description: '探索新型社交模式的同路人',
    nodeCount: 4,
  },
  {
    id: 't-video',
    name: '短视频',
    color: '#C83232',
    icon: '▶',
    description: '内容创作与传播实践',
    nodeCount: 3,
  },
  {
    id: 't-calligraphy',
    name: '书法',
    color: '#5A4A3A',
    icon: '書',
    description: '笔墨之间的修行同好',
    nodeCount: 2,
  },
  {
    id: 't-cognitive',
    name: '认知科学',
    color: '#5A7A4E',
    icon: 'Ψ',
    description: '心智与认知的探索者',
    nodeCount: 4,
  },
];

// 人类节点
const HUMAN_NODES = [
  {
    id: 'h-001', name: '于建飞', avatar: '于',
    role: '音乐家 · 古琴演奏者',
    bio: '青年古琴演奏家，致力于传统琴学与当代审美的对话。相信音乐不是表演，而是修身的方式。',
    toneStatus: 'open', // open / silent / blocked
    source: 'direct', // direct / introduced
    introducedBy: null,
    topics: [
      { topicId: 't-music', relevance: 95, lastContact: '2天前', messageCount: 28 },
      { topicId: 't-calligraphy', relevance: 60, lastContact: '上周', messageCount: 5 },
    ],
    tags: ['音乐家', '导师', '同频伙伴'],
  },
  {
    id: 'h-002', name: '林知秋', avatar: '林',
    role: '同频伙伴 · 哲学研究者',
    bio: '哲学博士，研究现象学与存在主义。深度阅读者，慢思考者。我们因一本《存在与时间》相识。',
    toneStatus: 'open',
    source: 'direct',
    introducedBy: null,
    topics: [
      { topicId: 't-social', relevance: 90, lastContact: '昨天', messageCount: 31 },
      { topicId: 't-cognitive', relevance: 85, lastContact: '3天前', messageCount: 18 },
      { topicId: 't-music', relevance: 70, lastContact: '2周前', messageCount: 8 },
    ],
    tags: ['同频伙伴', '研究者', '深度对话者'],
  },
  {
    id: 'h-003', name: '方墨言', avatar: '方',
    role: '合作者 · 独立设计师',
    bio: '独立视觉设计师，专注于产品的气质构建。相信好的设计是看不见的设计。',
    toneStatus: 'open',
    source: 'introduced',
    introducedBy: 'h-005', // 何思齐
    topics: [
      { topicId: 't-oneos', relevance: 88, lastContact: '3天前', messageCount: 42 },
      { topicId: 't-video', relevance: 72, lastContact: '上周', messageCount: 12 },
    ],
    tags: ['合作者', '设计师', '审美同频'],
  },
  {
    id: 'h-004', name: '陈屿白', avatar: '陈',
    role: '投资人 · 天使轮',
    bio: 'OneOS 天使投资人。前产品经理，相信工具应该服务于人的精神生活，而非绑架注意力。',
    toneStatus: 'silent',
    source: 'direct',
    introducedBy: null,
    topics: [
      { topicId: 't-oneos', relevance: 82, lastContact: '5天前', messageCount: 15 },
    ],
    tags: ['投资人', '战略伙伴'],
  },
  {
    id: 'h-005', name: '何思齐', avatar: '何',
    role: '合伙人 · 产品负责人',
    bio: 'OneOS 产品合伙人。前字节产品经理，厌倦了增长黑客那一套，想做真正服务于人的产品。',
    toneStatus: 'open',
    source: 'direct',
    introducedBy: null,
    topics: [
      { topicId: 't-oneos', relevance: 95, lastContact: '今天', messageCount: 67 },
      { topicId: 't-social', relevance: 75, lastContact: '上周', messageCount: 9 },
    ],
    tags: ['合伙人', '核心团队', '产品思考'],
  },
  {
    id: 'h-006', name: '沈听澜', avatar: '沈',
    role: '书友 · 读书会组织者',
    bio: '独立书店「听澜书房」主理人。每月组织一次深度读书会，每次只讨论一本书。',
    toneStatus: 'open',
    source: 'introduced',
    introducedBy: 'h-002', // 林知秋
    topics: [
      { topicId: 't-cognitive', relevance: 80, lastContact: '2周前', messageCount: 11 },
      { topicId: 't-social', relevance: 65, lastContact: '上个月', messageCount: 4 },
    ],
    tags: ['书友', '同频伙伴'],
  },
  {
    id: 'h-007', name: '顾野松', avatar: '顾',
    role: '摄友 · 户外向导',
    bio: '自由摄影师，登山爱好者。每年有一半时间在山里。用大画幅相机拍风景，用眼睛记录人。',
    toneStatus: 'silent',
    source: 'direct',
    introducedBy: null,
    topics: [
      { topicId: 't-video', relevance: 70, lastContact: '上个月', messageCount: 6 },
      { topicId: 't-calligraphy', relevance: 55, lastContact: '2个月前', messageCount: 3 },
    ],
    tags: ['摄友', '户外伙伴'],
  },
  {
    id: 'h-008', name: '苏晚晴', avatar: '苏',
    role: '妻子 · 人生同路人',
    bio: '我的妻子。精神分析师，最懂我的人。我们在各自的领域深耕，在交汇的地方彼此照亮。',
    toneStatus: 'open',
    source: 'direct',
    introducedBy: null,
    topics: [
      { topicId: 't-cognitive', relevance: 98, lastContact: '今天', messageCount: 52 },
      { topicId: 't-social', relevance: 85, lastContact: '昨天', messageCount: 24 },
      { topicId: 't-music', relevance: 75, lastContact: '上周', messageCount: 10 },
    ],
    tags: ['家人', '同路人', '精神伴侣'],
  },
  {
    id: 'h-009', name: '马行远', avatar: '行',
    role: '弟弟 · 技术合伙人',
    bio: '我弟弟。全栈工程师，OneOS 技术架构的设计者。比我冷静，比我理性，是我最好的技术搭档。',
    toneStatus: 'open',
    source: 'direct',
    introducedBy: null,
    topics: [
      { topicId: 't-oneos', relevance: 96, lastContact: '2天前', messageCount: 89 },
      { topicId: 't-video', relevance: 50, lastContact: '上个月', messageCount: 5 },
    ],
    tags: ['家人', '核心团队', '技术合伙人'],
  },
  {
    id: 'h-010', name: '张衡之', avatar: '张',
    role: '导师 · 前美院教授',
    bio: '退休美术学院教授，书法与国画方向。七十岁了还每天临帖。是我书法道路上的引路人。',
    toneStatus: 'silent',
    source: 'direct',
    introducedBy: null,
    topics: [
      { topicId: 't-calligraphy', relevance: 92, lastContact: '3周前', messageCount: 14 },
    ],
    tags: ['导师', '书法家', '前辈'],
  },
  {
    id: 'h-011', name: '唐予之', avatar: '唐',
    role: '短视频创作者',
    bio: '独立视频创作者，专注于知识类短视频。我们在探讨如何用短视频传递深度内容。',
    toneStatus: 'silent',
    source: 'introduced',
    introducedBy: 'h-007', // 顾野松
    topics: [
      { topicId: 't-video', relevance: 78, lastContact: '1周前', messageCount: 8 },
    ],
    tags: ['创作者', '内容伙伴'],
  },
  {
    id: 'h-012', name: '周予安', avatar: '周',
    role: '读者 · 陌生人',
    bio: '公众号读者。发过几封很有质量的读者来信，对 OneOS 的理解很深。还没深入交流过。',
    toneStatus: 'blocked',
    source: 'stranger',
    introducedBy: null,
    topics: [
      { topicId: 't-oneos', relevance: 40, lastContact: '今天', messageCount: 2 },
    ],
    tags: ['读者', '陌生人'],
  },
];

// 沟通历史（Markdown 文档列表）
const COMMUNICATION_HISTORY = {
  'h-001': [
    { id: 'comm-001', topicId: 't-music', title: '关于古琴「山林气」的讨论', date: '2026-03-10', messages: 12 },
    { id: 'comm-002', topicId: 't-music', title: '《平沙落雁》版本对比', date: '2026-02-28', messages: 8 },
    { id: 'comm-003', topicId: 't-calligraphy', title: '书法与音乐的节奏共鸣', date: '2026-02-15', messages: 5 },
  ],
  'h-002': [
    { id: 'comm-004', topicId: 't-social', title: '社交重塑的本质讨论', date: '2026-03-15', messages: 15 },
    { id: 'comm-005', topicId: 't-cognitive', title: '《存在与时间》读书笔记', date: '2026-03-08', messages: 18 },
    { id: 'comm-006', topicId: 't-cognitive', title: '注意力残留与深度工作', date: '2026-02-20', messages: 9 },
    { id: 'comm-007', topicId: 't-music', title: '音乐的形而上学意义', date: '2026-01-12', messages: 6 },
  ],
  'h-003': [
    { id: 'comm-008', topicId: 't-oneos', title: '升维页面视觉方案', date: '2026-03-12', messages: 14 },
    { id: 'comm-009', topicId: 't-oneos', title: '图谱节点动效设计', date: '2026-03-05', messages: 10 },
    { id: 'comm-010', topicId: 't-video', title: '知识短视频视觉风格', date: '2026-02-18', messages: 8 },
  ],
};

// 邀请码
const INVITE_CODES = [
  {
    id: 'inv-001',
    topicId: 't-oneos',
    topicName: 'OneOS架构',
    code: 'ONEOS-2026-SPRING',
    qrCode: '◰◱◳◲',
    status: 'active', // active / used / expired
    createdAt: '2026-03-01',
    expiresAt: '2026-04-01',
    permissionLevel: '合作圈',
    usageLimit: '多次',
    usedCount: 2,
  },
  {
    id: 'inv-002',
    topicId: 't-music',
    topicName: '音乐',
    code: 'MUSIC-GUQIN-0315',
    qrCode: '◴◵◶◷',
    status: 'used',
    createdAt: '2026-02-10',
    expiresAt: '2026-02-17',
    permissionLevel: '兴趣圈',
    usageLimit: '单次',
    usedCount: 1,
  },
  {
    id: 'inv-003',
    topicId: 't-social',
    topicName: '社交重塑',
    code: 'SOCIAL-REBOOT-ALPHA',
    qrCode: '◐◑◒◓',
    status: 'active',
    createdAt: '2026-03-10',
    expiresAt: '2026-03-24',
    permissionLevel: '兴趣圈',
    usageLimit: '多次',
    usedCount: 1,
  },
  {
    id: 'inv-004',
    topicId: 't-calligraphy',
    topicName: '书法',
    code: 'CALLI-ZHANG-001',
    qrCode: '◍◎◉○',
    status: 'revoked',
    createdAt: '2026-01-05',
    expiresAt: '2026-01-12',
    permissionLevel: '兴趣圈',
    usageLimit: '单次',
    usedCount: 0,
  },
];

// 人类节点统计
const HUMAN_STATS = {
  totalNodes: 12,
  totalTopicLinks: 26,
  avgTopicsPerPerson: 2.2,
  maxTopicsPerPerson: 3,
  introDepth: 3, // 最多3层引荐
  activeTopics: 6,
  breakdownByTopic: [
    { topic: '音乐', count: 4 },
    { topic: 'OneOS架构', count: 5 },
    { topic: '社交重塑', count: 4 },
    { topic: '短视频', count: 3 },
    { topic: '书法', count: 2 },
    { topic: '认知科学', count: 4 },
  ],
  toneStatus: {
    open: 6,
    silent: 4,
    blocked: 1,
  },
};

// 引荐关系图（用于可视化）
const INTRO_GRAPH = {
  nodes: [
    { id: 'me', label: '我', isSelf: true },
    { id: 'h-002', label: '林知秋' },
    { id: 'h-005', label: '何思齐' },
    { id: 'h-006', label: '沈听澜' },
    { id: 'h-003', label: '方墨言' },
    { id: 'h-007', label: '顾野松' },
    { id: 'h-011', label: '唐予之' },
  ],
  links: [
    { from: 'me', to: 'h-002', type: 'direct' },
    { from: 'me', to: 'h-005', type: 'direct' },
    { from: 'me', to: 'h-007', type: 'direct' },
    { from: 'h-002', to: 'h-006', type: 'introduced' },
    { from: 'h-005', to: 'h-003', type: 'introduced' },
    { from: 'h-007', to: 'h-011', type: 'introduced' },
  ],
};

// 工具函数：获取某人在某话题下的信息
function getHumanInTopic(humanId, topicId) {
  const human = HUMAN_NODES.find(h => h.id === humanId);
  if (!human) return null;
  const topicInfo = human.topics.find(t => t.topicId === topicId);
  if (!topicInfo) return null;
  return { ...human, currentTopic: topicInfo };
}

// 工具函数：获取某话题下的所有人
function getHumansByTopic(topicId) {
  return HUMAN_NODES
    .filter(h => h.topics.some(t => t.topicId === topicId))
    .map(h => ({
      ...h,
      currentTopic: h.topics.find(t => t.topicId === topicId),
    }));
}

Object.assign(window, {
  HUMAN_TOPICS,
  HUMAN_NODES,
  COMMUNICATION_HISTORY,
  INVITE_CODES,
  HUMAN_STATS,
  INTRO_GRAPH,
  getHumanInTopic,
  getHumansByTopic,
});
