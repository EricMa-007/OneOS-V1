// ============================================
// 知识图谱模拟数据 v2
// 更丰富的节点、连线、人类节点、知识节点
// ============================================

// 节点类型
const NODE_TYPES = {
  TOPIC: 'topic',
  QUESTION: 'question',
  ANSWER: 'answer',
  CARD: 'card',
  SUMMARY: 'summary',
  ICON: 'icon',
  HUMAN: 'human',
  KNOWLEDGE: 'knowledge',
};

const NODE_TYPE_LABELS = {
  topic: '话题',
  question: '问题',
  answer: '回答',
  card: '卡片',
  summary: '摘要',
  icon: '元知识',
  human: '人类',
  knowledge: '知识',
};

// 连线类型
const EDGE_TYPES = {
  CAUSAL: 'causal',
  HIERARCHY: 'hierarchy',
  ASSOCIATION: 'association',
  COMPARISON: 'comparison',
  SEQUENCE: 'sequence',
};

const EDGE_TYPE_LABELS = {
  causal: '因果',
  hierarchy: '从属',
  association: '关联',
  comparison: '对比',
  sequence: '时序',
};

// ============================================
// 话题 1：社交重塑
// ============================================
const SOCIAL_RESHAPE_TOPIC = {
  id: 'topic-social',
  type: NODE_TYPES.TOPIC,
  title: '社交重塑',
  subtitle: '重新定义人与人的连接方式',
  x: 60, y: 280,
  width: 180, height: 90,
  icon: 'network',
  color: '#B56B3A',
  createdAt: '2026-03-12',
  children: [
    // ===== 问题节点（瀑布流，6个） =====
    { id: 'q-s1', type: NODE_TYPES.QUESTION, title: '问题 1：社交的本质是什么？',
      content: '我们需要重新理解社交的本质——不是点赞和消息，而是深度的意义交换。',
      x: 300, y: 60, width: 230, height: 72, order: 1, createdAt: '2026-03-14' },
    { id: 'q-s2', type: NODE_TYPES.QUESTION, title: '问题 2：为什么现在的社交让人疲惫？',
      content: '浅层互动消耗大量精力却不产生意义感，社交变成了义务而非滋养。',
      x: 300, y: 190, width: 240, height: 72, order: 2, createdAt: '2026-03-15' },
    { id: 'q-s3', type: NODE_TYPES.QUESTION, title: '问题 3：理想的社交应该是什么样？',
      content: '以话题为中心而非以人为中心，人们因共同的深度兴趣而相遇。',
      x: 300, y: 320, width: 240, height: 72, order: 3, createdAt: '2026-03-17' },
    { id: 'q-s4', type: NODE_TYPES.QUESTION, title: '问题 4：如何从当前的社交困境中走出来？',
      content: '不是增加社交频率，而是提升每次社交的深度与意义密度。',
      x: 300, y: 450, width: 250, height: 72, order: 4, createdAt: '2026-03-20' },
    { id: 'q-s5', type: NODE_TYPES.QUESTION, title: '问题 5：弱关系还有价值吗？',
      content: '强关系提供情感支持，弱关系提供信息与机会，两者不可互相替代。',
      x: 300, y: 580, width: 230, height: 72, order: 5, createdAt: '2026-04-02' },
    { id: 'q-s6', type: NODE_TYPES.QUESTION, title: '问题 6：社交中的真诚如何可能？',
      content: '真诚不是毫无保留，而是在合适的深度上做真实的表达。',
      x: 300, y: 710, width: 240, height: 72, order: 6, createdAt: '2026-04-10' },

    // ===== 回答节点（侧栏） =====
    { id: 'a-s1', type: NODE_TYPES.ANSWER, title: '社交的本质是意义交换',
      content: '真正的社交发生在两个完整的灵魂之间交换各自的生命体验与思考，而非信息碎片的传递。',
      x: 600, y: 45, width: 260, height: 100, parentQ: 'q-s1', createdAt: '2026-03-14' },
    { id: 'a-s2', type: NODE_TYPES.ANSWER, title: '浅层互动的疲劳机制',
      content: '每一次点赞和回复都消耗了认知资源，但因为没有深度，无法产生意义感的回报。',
      x: 600, y: 175, width: 260, height: 100, parentQ: 'q-s2', createdAt: '2026-03-15' },
    { id: 'a-s3', type: NODE_TYPES.ANSWER, title: '以话题为中心的社交',
      content: '围绕共同兴趣组织社交，人因话题相遇，而非相反。这降低了社交压力，提升了质量。',
      x: 600, y: 305, width: 260, height: 100, parentQ: 'q-s3', createdAt: '2026-03-17' },
    { id: 'a-s4', type: NODE_TYPES.ANSWER, title: '深度优先策略',
      content: '减少 80% 的浅层社交，把精力投入到少数几段深度关系中，幸福感反而提升。',
      x: 600, y: 435, width: 260, height: 100, parentQ: 'q-s4', createdAt: '2026-03-20' },
    { id: 'a-s5', type: NODE_TYPES.ANSWER, title: '弱关系的信息价值',
      content: 'Granovetter 的弱关系强度理论：找工作、获取新信息往往通过弱关系而非强关系。',
      x: 600, y: 565, width: 260, height: 100, parentQ: 'q-s5', createdAt: '2026-04-02' },

    // ===== 知识节点（概念/观点） =====
    { id: 'k-s1', type: NODE_TYPES.KNOWLEDGE, title: '意义感',
      content: '意义感 = 深度 × 真实度 × 共鸣',
      x: 920, y: 40, width: 180, height: 70, createdAt: '2026-03-15' },
    { id: 'k-s2', type: NODE_TYPES.KNOWLEDGE, title: '注意力残留',
      content: '浅层社交切换带来的注意力损耗，每次切换都留下认知残留。',
      x: 920, y: 140, width: 180, height: 70, createdAt: '2026-03-16' },
    { id: 'k-s3', type: NODE_TYPES.KNOWLEDGE, title: '邓巴数',
      content: '人类稳定社交关系的上限约为 150 人。',
      x: 920, y: 240, width: 170, height: 60, createdAt: '2026-03-18' },
    { id: 'k-s4', type: NODE_TYPES.KNOWLEDGE, title: '弱关系强度',
      content: 'Granovetter: 弱关系在信息传播中比强关系更有效。',
      x: 920, y: 330, width: 180, height: 70, createdAt: '2026-04-03' },
    { id: 'k-s5', type: NODE_TYPES.KNOWLEDGE, title: '话题共同体',
      content: '因共同话题而非身份标签形成的社群，连接更深。',
      x: 920, y: 430, width: 180, height: 70, createdAt: '2026-03-19' },
    { id: 'k-s6', type: NODE_TYPES.KNOWLEDGE, title: '社交能量',
      content: '社交是有能量预算的，深度社交消耗大但回报也大。',
      x: 920, y: 530, width: 180, height: 65, createdAt: '2026-03-22' },

    // ===== 卡片节点（升维后） =====
    { id: 'c-s1', type: NODE_TYPES.CARD, title: '意义交换模型',
      content: '社交价值 = 深度 × 真实度 × 稀缺性\n三个维度同时提升才有质变',
      x: 1160, y: 60, width: 200, height: 100, source: 'a-s1', createdAt: '2026-03-18' },
    { id: 'c-s2', type: NODE_TYPES.CARD, title: '深度优先策略',
      content: '减少 80% 浅层关系\n聚焦 5-10 段深度关系\n反而获得更多意义感',
      x: 1160, y: 200, width: 200, height: 100, source: 'a-s4', createdAt: '2026-03-25' },

    // ===== 摘要节点 =====
    { id: 's-s1', type: NODE_TYPES.SUMMARY, title: '以话题为中心',
      content: '人不再是社交的中心，话题才是。',
      x: 1160, y: 340, width: 180, height: 70, source: 'c-s1', createdAt: '2026-04-01' },

    // ===== 元知识/图标节点 =====
    { id: 'i-s1', type: NODE_TYPES.ICON, title: '连接',
      x: 1180, y: 470, width: 130, height: 110, source: 's-s1', iconName: '连接', createdAt: '2026-04-10' },

    // ===== 人类节点 =====
    { id: 'h-yjf', type: NODE_TYPES.HUMAN, title: '于建飞',
      subtitle: '音乐家 · 深度思考者',
      content: '独立音乐人，对社交与艺术的关系有深刻洞见。发起过多场话题式聚会实验。',
      x: 1420, y: 80, width: 210, height: 130,
      topics: ['社交重塑', '音乐哲学', '艺术与生活'],
      toneStatus: '开放',
      connectionCount: 12,
      createdAt: '2026-03-15',
      lastTalk: '昨天' },
    { id: 'h-mch', type: NODE_TYPES.HUMAN, title: '马崇海',
      subtitle: '产品人 · 知识构建者',
      content: '长期探索知识管理与个人操作系统。社交重塑话题的共同思考者。',
      x: 1420, y: 260, width: 210, height: 130,
      topics: ['OneOS架构', '知识升维', '社交重塑'],
      toneStatus: '开放',
      connectionCount: 28,
      createdAt: '2026-03-01',
      lastTalk: '今天' },
    { id: 'h-lw', type: NODE_TYPES.HUMAN, title: '林薇',
      subtitle: '社会学研究者',
      content: '研究城市社会学与现代社交模式，关注数字时代的人际疏离。',
      x: 1420, y: 440, width: 210, height: 130,
      topics: ['社交重塑', '城市研究'],
      toneStatus: '静默',
      connectionCount: 7,
      createdAt: '2026-03-20',
      lastTalk: '两周前' },
  ],
  edges: [
    // 话题 → 问题（从属）
    { from: 'topic-social', to: 'q-s1', type: EDGE_TYPES.HIERARCHY, label: '追问' },
    { from: 'topic-social', to: 'q-s2', type: EDGE_TYPES.HIERARCHY, label: '追问' },
    { from: 'topic-social', to: 'q-s3', type: EDGE_TYPES.HIERARCHY, label: '追问' },
    { from: 'topic-social', to: 'q-s4', type: EDGE_TYPES.HIERARCHY, label: '追问' },
    { from: 'topic-social', to: 'q-s5', type: EDGE_TYPES.HIERARCHY, label: '追问' },
    { from: 'topic-social', to: 'q-s6', type: EDGE_TYPES.HIERARCHY, label: '追问' },
    // 问题之间（时序瀑布流）
    { from: 'q-s1', to: 'q-s2', type: EDGE_TYPES.SEQUENCE, label: '追问' },
    { from: 'q-s2', to: 'q-s3', type: EDGE_TYPES.SEQUENCE, label: '追问' },
    { from: 'q-s3', to: 'q-s4', type: EDGE_TYPES.SEQUENCE, label: '追问' },
    { from: 'q-s4', to: 'q-s5', type: EDGE_TYPES.SEQUENCE, label: '延伸' },
    { from: 'q-s5', to: 'q-s6', type: EDGE_TYPES.SEQUENCE, label: '延伸' },
    // 问题 → 回答（因果）
    { from: 'q-s1', to: 'a-s1', type: EDGE_TYPES.CAUSAL, label: '回答' },
    { from: 'q-s2', to: 'a-s2', type: EDGE_TYPES.CAUSAL, label: '回答' },
    { from: 'q-s3', to: 'a-s3', type: EDGE_TYPES.CAUSAL, label: '回答' },
    { from: 'q-s4', to: 'a-s4', type: EDGE_TYPES.CAUSAL, label: '回答' },
    { from: 'q-s5', to: 'a-s5', type: EDGE_TYPES.CAUSAL, label: '回答' },
    // 回答 → 知识节点
    { from: 'a-s1', to: 'k-s1', type: EDGE_TYPES.HIERARCHY },
    { from: 'a-s2', to: 'k-s2', type: EDGE_TYPES.HIERARCHY },
    { from: 'a-s3', to: 'k-s5', type: EDGE_TYPES.HIERARCHY },
    { from: 'a-s4', to: 'k-s6', type: EDGE_TYPES.HIERARCHY },
    { from: 'a-s5', to: 'k-s4', type: EDGE_TYPES.HIERARCHY },
    // 知识节点间关联
    { from: 'k-s1', to: 'k-s5', type: EDGE_TYPES.ASSOCIATION, label: '相关' },
    { from: 'k-s3', to: 'k-s4', type: EDGE_TYPES.ASSOCIATION, label: '理论' },
    { from: 'k-s2', to: 'k-s6', type: EDGE_TYPES.CAUSAL, label: '导致' },
    // 知识 → 卡片（升维）
    { from: 'k-s1', to: 'c-s1', type: EDGE_TYPES.HIERARCHY, label: '升维' },
    { from: 'k-s6', to: 'c-s2', type: EDGE_TYPES.HIERARCHY, label: '升维' },
    // 卡片 → 摘要
    { from: 'c-s1', to: 's-s1', type: EDGE_TYPES.HIERARCHY, label: '升维' },
    // 摘要 → 元知识
    { from: 's-s1', to: 'i-s1', type: EDGE_TYPES.HIERARCHY, label: '升维' },
    // 人类节点关联
    { from: 'h-yjf', to: 'topic-social', type: EDGE_TYPES.ASSOCIATION, label: '参与' },
    { from: 'h-yjf', to: 'q-s1', type: EDGE_TYPES.ASSOCIATION, label: '启发' },
    { from: 'h-mch', to: 'topic-social', type: EDGE_TYPES.ASSOCIATION, label: '共建' },
    { from: 'h-mch', to: 'c-s2', type: EDGE_TYPES.ASSOCIATION, label: '提出' },
    { from: 'h-lw', to: 'k-s3', type: EDGE_TYPES.ASSOCIATION, label: '参考' },
    { from: 'h-lw', to: 'k-s4', type: EDGE_TYPES.ASSOCIATION, label: '研究' },
    { from: 'h-yjf', to: 'h-mch', type: EDGE_TYPES.COMPARISON, label: '讨论' },
    { from: 'h-mch', to: 'h-lw', type: EDGE_TYPES.ASSOCIATION, label: '相识' },
  ],
};

// ============================================
// 话题 2：OneOS 架构
// ============================================
const ONEOS_TOPIC = {
  id: 'topic-oneos',
  type: NODE_TYPES.TOPIC,
  title: 'OneOS 架构',
  subtitle: '个人知识操作系统的设计哲学',
  x: 60, y: 260,
  width: 180, height: 90,
  icon: 'os',
  color: '#3D4A6B',
  createdAt: '2026-01-08',
  children: [
    // 问题节点（5个）
    { id: 'q-o1', type: NODE_TYPES.QUESTION, title: '问题 1：为什么需要个人操作系统？',
      content: '工具碎片化导致注意力和知识也碎片化，我们需要一个统一的精神栖息地。',
      x: 300, y: 60, width: 250, height: 72, order: 1, createdAt: '2026-01-10' },
    { id: 'q-o2', type: NODE_TYPES.QUESTION, title: '问题 2：操作系统的核心应该是什么？',
      content: '不是任务管理，不是日程，而是知识——所有功能都服务于知识的生长。',
      x: 300, y: 180, width: 250, height: 72, order: 2, createdAt: '2026-01-12' },
    { id: 'q-o3', type: NODE_TYPES.QUESTION, title: '问题 3：本地优先意味着什么？',
      content: '数据主权在用户手中，平台只是工具，而非数据的拥有者。',
      x: 300, y: 300, width: 240, height: 72, order: 3, createdAt: '2026-01-15' },
    { id: 'q-o4', type: NODE_TYPES.QUESTION, title: '问题 4：AI 在其中扮演什么角色？',
      content: 'AI 是思考的副驾，是知识的放大器，而非主角。',
      x: 300, y: 420, width: 240, height: 72, order: 4, createdAt: '2026-01-20' },
    { id: 'q-o5', type: NODE_TYPES.QUESTION, title: '问题 5：十大板块如何分工协作？',
      content: '每个板块是知识的一个视角，底层共享同一份 Markdown 数据。',
      x: 300, y: 540, width: 260, height: 72, order: 5, createdAt: '2026-02-01' },

    // 回答节点
    { id: 'a-o1', type: NODE_TYPES.ANSWER, title: '精神栖息地的概念',
      content: '一个人每天大部分时间在此思考、阅读、写作、对话的地方，是精神生活的容器。',
      x: 600, y: 40, width: 260, height: 100, parentQ: 'q-o1', createdAt: '2026-01-10' },
    { id: 'a-o2', type: NODE_TYPES.ANSWER, title: '知识作为第一公民',
      content: '一切功能围绕知识的产生、连接、升维展开，其他都是服务。',
      x: 600, y: 160, width: 260, height: 100, parentQ: 'q-o2', createdAt: '2026-01-12' },
    { id: 'a-o3', type: NODE_TYPES.ANSWER, title: '数据主权与主体性',
      content: '本地 Markdown 是唯一真相源，所有能力都是对这份数据的不同视角。',
      x: 600, y: 280, width: 260, height: 100, parentQ: 'q-o3', createdAt: '2026-01-15' },
    { id: 'a-o4', type: NODE_TYPES.ANSWER, title: '副驾模式',
      content: 'AI 永远是副驾，方向盘握在用户手中。AI 提出、用户判断、用户决策。',
      x: 600, y: 400, width: 260, height: 100, parentQ: 'q-o4', createdAt: '2026-01-20' },
    { id: 'a-o5', type: NODE_TYPES.ANSWER, title: '同一数据，多个视图',
      content: '仪表盘、编辑器、图谱、日历……都是同一份知识的不同呈现角度。',
      x: 600, y: 520, width: 260, height: 100, parentQ: 'q-o5', createdAt: '2026-02-01' },

    // 知识节点
    { id: 'k-o1', type: NODE_TYPES.KNOWLEDGE, title: '唯一真相源',
      content: 'SSOT：所有视图都是同一份数据的投影',
      x: 920, y: 40, width: 180, height: 65, createdAt: '2026-01-16' },
    { id: 'k-o2', type: NODE_TYPES.KNOWLEDGE, title: '本地优先原则',
      content: '数据在本地、加密可选、格式开放、导出自由',
      x: 920, y: 130, width: 190, height: 70, createdAt: '2026-01-18' },
    { id: 'k-o3', type: NODE_TYPES.KNOWLEDGE, title: '副驾模式',
      content: 'AI 建议、人决策；AI 提速、人掌舵',
      x: 920, y: 225, width: 180, height: 65, createdAt: '2026-01-22' },
    { id: 'k-o4', type: NODE_TYPES.KNOWLEDGE, title: '零打扰设计',
      content: '没有红点、没有推送、没有强制提醒',
      x: 920, y: 315, width: 180, height: 60, createdAt: '2026-01-25' },
    { id: 'k-o5', type: NODE_TYPES.KNOWLEDGE, title: '工具服务于人',
      content: '人是目的，工具是手段。一切为人的主体性服务。',
      x: 920, y: 400, width: 200, height: 70, createdAt: '2026-02-01' },
    { id: 'k-o6', type: NODE_TYPES.KNOWLEDGE, title: '十大板块架构',
      content: '仪表盘/编辑器/图谱/日历/升维/连接…',
      x: 920, y: 495, width: 180, height: 60, createdAt: '2026-02-05' },
    { id: 'k-o7', type: NODE_TYPES.KNOWLEDGE, title: 'Markdown 为结构',
      content: '纯文本、可迁移、可读、可控',
      x: 920, y: 580, width: 180, height: 60, createdAt: '2026-01-15' },

    // 卡片节点
    { id: 'c-o1', type: NODE_TYPES.CARD, title: '本地优先五原则',
      content: '本地存储 · 加密可选\n格式开放 · 导出自由\n永不锁定',
      x: 1160, y: 60, width: 200, height: 100, source: 'k-o2', createdAt: '2026-02-10' },
    { id: 'c-o2', type: NODE_TYPES.CARD, title: 'AI 副驾原则',
      content: 'AI 提出 · 用户判断\nAI 提速 · 用户掌舵\nAI 永远是副驾',
      x: 1160, y: 200, width: 200, height: 100, source: 'k-o3', createdAt: '2026-02-12' },

    // 摘要节点
    { id: 's-o1', type: NODE_TYPES.SUMMARY, title: '工具服务于人',
      content: '人是目的，工具是手段。',
      x: 1160, y: 350, width: 180, height: 70, source: 'k-o5', createdAt: '2026-02-20' },

    // 元知识节点
    { id: 'i-o1', type: NODE_TYPES.ICON, title: '主体性',
      x: 1180, y: 470, width: 130, height: 110, source: 's-o1', iconName: '主体性', createdAt: '2026-03-01' },
    { id: 'i-o2', type: NODE_TYPES.ICON, title: '本地优先',
      x: 1180, y: 620, width: 130, height: 110, source: 'c-o1', iconName: '本地', createdAt: '2026-03-05' },

    // 人类节点
    { id: 'h-mch-o', type: NODE_TYPES.HUMAN, title: '马崇海',
      subtitle: '产品人 · 设计者',
      content: 'OneOS 的设计者与核心使用者。对个人操作系统有长期的思考与实践。',
      x: 1420, y: 80, width: 210, height: 130,
      topics: ['OneOS架构', '知识升维', '社交重塑'],
      toneStatus: '开放',
      connectionCount: 28,
      createdAt: '2026-01-01',
      lastTalk: '今天' },
    { id: 'h-zhang', type: NODE_TYPES.HUMAN, title: '张老师',
      subtitle: '技术合伙人',
      content: '负责系统底层架构与本地存储方案的技术实现。',
      x: 1420, y: 260, width: 210, height: 130,
      topics: ['OneOS架构', '技术实现'],
      toneStatus: '开放',
      connectionCount: 15,
      createdAt: '2026-01-05',
      lastTalk: '前天' },
  ],
  edges: [
    { from: 'topic-oneos', to: 'q-o1', type: EDGE_TYPES.HIERARCHY, label: '追问' },
    { from: 'topic-oneos', to: 'q-o2', type: EDGE_TYPES.HIERARCHY, label: '追问' },
    { from: 'topic-oneos', to: 'q-o3', type: EDGE_TYPES.HIERARCHY, label: '追问' },
    { from: 'topic-oneos', to: 'q-o4', type: EDGE_TYPES.HIERARCHY, label: '追问' },
    { from: 'topic-oneos', to: 'q-o5', type: EDGE_TYPES.HIERARCHY, label: '追问' },
    { from: 'q-o1', to: 'q-o2', type: EDGE_TYPES.SEQUENCE, label: '追问' },
    { from: 'q-o2', to: 'q-o3', type: EDGE_TYPES.SEQUENCE, label: '追问' },
    { from: 'q-o3', to: 'q-o4', type: EDGE_TYPES.SEQUENCE, label: '追问' },
    { from: 'q-o4', to: 'q-o5', type: EDGE_TYPES.SEQUENCE, label: '延伸' },
    { from: 'q-o1', to: 'a-o1', type: EDGE_TYPES.CAUSAL, label: '回答' },
    { from: 'q-o2', to: 'a-o2', type: EDGE_TYPES.CAUSAL, label: '回答' },
    { from: 'q-o3', to: 'a-o3', type: EDGE_TYPES.CAUSAL, label: '回答' },
    { from: 'q-o4', to: 'a-o4', type: EDGE_TYPES.CAUSAL, label: '回答' },
    { from: 'q-o5', to: 'a-o5', type: EDGE_TYPES.CAUSAL, label: '回答' },
    { from: 'a-o1', to: 'k-o5', type: EDGE_TYPES.HIERARCHY },
    { from: 'a-o2', to: 'k-o1', type: EDGE_TYPES.HIERARCHY },
    { from: 'a-o3', to: 'k-o2', type: EDGE_TYPES.HIERARCHY },
    { from: 'a-o4', to: 'k-o3', type: EDGE_TYPES.HIERARCHY },
    { from: 'a-o5', to: 'k-o6', type: EDGE_TYPES.HIERARCHY },
    { from: 'k-o2', to: 'k-o7', type: EDGE_TYPES.ASSOCIATION, label: '载体' },
    { from: 'k-o5', to: 'k-o4', type: EDGE_TYPES.CAUSAL, label: '导致' },
    { from: 'k-o1', to: 'k-o6', type: EDGE_TYPES.ASSOCIATION, label: '实现' },
    { from: 'k-o2', to: 'c-o1', type: EDGE_TYPES.HIERARCHY, label: '升维' },
    { from: 'k-o3', to: 'c-o2', type: EDGE_TYPES.HIERARCHY, label: '升维' },
    { from: 'k-o5', to: 's-o1', type: EDGE_TYPES.HIERARCHY, label: '升维' },
    { from: 's-o1', to: 'i-o1', type: EDGE_TYPES.HIERARCHY, label: '升维' },
    { from: 'c-o1', to: 'i-o2', type: EDGE_TYPES.HIERARCHY, label: '升维' },
    { from: 'i-o1', to: 'i-o2', type: EDGE_TYPES.ASSOCIATION, label: '相关' },
    { from: 'h-mch-o', to: 'topic-oneos', type: EDGE_TYPES.ASSOCIATION, label: '创立' },
    { from: 'h-mch-o', to: 'i-o1', type: EDGE_TYPES.ASSOCIATION, label: '主张' },
    { from: 'h-zhang', to: 'c-o1', type: EDGE_TYPES.ASSOCIATION, label: '实现' },
    { from: 'h-zhang', to: 'k-o7', type: EDGE_TYPES.ASSOCIATION, label: '构建' },
    { from: 'h-mch-o', to: 'h-zhang', type: EDGE_TYPES.ASSOCIATION, label: '合作' },
  ],
};

// ============================================
// 话题 3：知识升维
// ============================================
const ELEVATION_TOPIC = {
  id: 'topic-elevation',
  type: NODE_TYPES.TOPIC,
  title: '知识升维',
  subtitle: '从信息到智慧的四段跃迁',
  x: 60, y: 280,
  width: 180, height: 90,
  icon: 'elevation',
  color: '#5A7A4E',
  createdAt: '2026-02-10',
  children: [
    { id: 'q-e1', type: NODE_TYPES.QUESTION, title: '问题 1：什么是知识的维度？',
      content: '原始记录是一维，结构化是二维，抽象模型是三维，智慧是四维。',
      x: 300, y: 80, width: 240, height: 72, order: 1, createdAt: '2026-02-12' },
    { id: 'q-e2', type: NODE_TYPES.QUESTION, title: '问题 2：如何实现升维？',
      content: '四段论：文字记录 → 知识卡片 → 摘要提炼 → 元知识图标',
      x: 300, y: 210, width: 240, height: 72, order: 2, createdAt: '2026-02-15' },
    { id: 'q-e3', type: NODE_TYPES.QUESTION, title: '问题 3：升维的目的是什么？',
      content: '不是为了简洁而简洁，是为了在更高维度看清事物的本质。',
      x: 300, y: 340, width: 250, height: 72, order: 3, createdAt: '2026-02-20' },
    { id: 'q-e4', type: NODE_TYPES.QUESTION, title: '问题 4：升维后原始内容还重要吗？',
      content: '每一层都是叠加而非替代，降维可追溯是升维的前提。',
      x: 300, y: 470, width: 260, height: 72, order: 4, createdAt: '2026-02-28' },
    { id: 'q-e5', type: NODE_TYPES.QUESTION, title: '问题 5：AI 在升维中扮演什么角色？',
      content: 'AI 可以做升维的初稿，但最终判断必须由人完成。',
      x: 300, y: 600, width: 240, height: 72, order: 5, createdAt: '2026-03-08' },

    { id: 'a-e1', type: NODE_TYPES.ANSWER, title: '维度的定义',
      content: '每一次升维都是一次信息压缩和模式提取，失去细节但获得穿透力。',
      x: 600, y: 60, width: 260, height: 100, parentQ: 'q-e1', createdAt: '2026-02-12' },
    { id: 'a-e2', type: NODE_TYPES.ANSWER, title: '四段跃迁模型',
      content: '文字（原始）→ 卡片（结构化）→ 摘要（提炼）→ 图标（元认知）',
      x: 600, y: 190, width: 260, height: 100, parentQ: 'q-e2', createdAt: '2026-02-15' },
    { id: 'a-e3', type: NODE_TYPES.ANSWER, title: '穿透力优先',
      content: '升维的价值在于穿透力：用更少的符号承载更多的意义。',
      x: 600, y: 320, width: 260, height: 100, parentQ: 'q-e3', createdAt: '2026-02-20' },
    { id: 'a-e4', type: NODE_TYPES.ANSWER, title: '降维可追溯原则',
      content: '升维不是删除，是叠加视图。每个高维节点都能降维查看原始依据。',
      x: 600, y: 450, width: 260, height: 100, parentQ: 'q-e4', createdAt: '2026-02-28' },
    { id: 'a-e5', type: NODE_TYPES.ANSWER, title: 'AI 是升维的磨刀石',
      content: 'AI 擅长提炼但不擅长判断，所以 AI 做初稿、人做终稿。',
      x: 600, y: 580, width: 260, height: 100, parentQ: 'q-e5', createdAt: '2026-03-08' },

    // 知识节点
    { id: 'k-e1', type: NODE_TYPES.KNOWLEDGE, title: '信息压缩',
      content: '升维的本质是有意义的信息压缩',
      x: 920, y: 50, width: 170, height: 60, createdAt: '2026-02-18' },
    { id: 'k-e2', type: NODE_TYPES.KNOWLEDGE, title: '模式提取',
      content: '从大量实例中提取出反复出现的模式',
      x: 920, y: 135, width: 170, height: 60, createdAt: '2026-02-20' },
    { id: 'k-e3', type: NODE_TYPES.KNOWLEDGE, title: '密度优先',
      content: '知识的价值在于密度，不在于数量',
      x: 920, y: 220, width: 170, height: 60, createdAt: '2026-02-25' },
    { id: 'k-e4', type: NODE_TYPES.KNOWLEDGE, title: '降维可追溯',
      content: '每个高维节点都能找到原始依据',
      x: 920, y: 305, width: 170, height: 60, createdAt: '2026-03-01' },
    { id: 'k-e5', type: NODE_TYPES.KNOWLEDGE, title: '四层跃迁',
      content: '文字 → 卡片 → 摘要 → 图标',
      x: 920, y: 390, width: 170, height: 60, createdAt: '2026-02-16' },
    { id: 'k-e6', type: NODE_TYPES.KNOWLEDGE, title: '人的判断',
      content: '最终的升维判断必须由人做出',
      x: 920, y: 480, width: 170, height: 60, createdAt: '2026-03-10' },
    { id: 'k-e7', type: NODE_TYPES.KNOWLEDGE, title: '智慧层级',
      content: '数据 → 信息 → 知识 → 智慧',
      x: 920, y: 565, width: 170, height: 60, createdAt: '2026-03-05' },

    // 卡片节点
    { id: 'c-e1', type: NODE_TYPES.CARD, title: '四段升维模型',
      content: '原始 → 卡片 → 摘要 → 图标\n每层密度翻倍，体积减半',
      x: 1160, y: 70, width: 200, height: 100, source: 'a-e2', createdAt: '2026-02-25' },
    { id: 'c-e2', type: NODE_TYPES.CARD, title: '升维 ≠ 删除',
      content: '升维是叠加视图\n底层数据始终保留\n降维可追溯',
      x: 1160, y: 210, width: 200, height: 100, source: 'a-e4', createdAt: '2026-03-02' },

    // 摘要节点
    { id: 's-e1', type: NODE_TYPES.SUMMARY, title: '密度优先',
      content: '知识的价值在于密度，不在于数量。',
      x: 1160, y: 350, width: 180, height: 70, source: 'c-e1', createdAt: '2026-03-10' },

    // 元知识节点
    { id: 'i-e1', type: NODE_TYPES.ICON, title: '升维',
      x: 1180, y: 470, width: 130, height: 110, source: 's-e1', iconName: '升维', createdAt: '2026-03-20' },

    // 人类节点
    { id: 'h-lm', type: NODE_TYPES.HUMAN, title: '李明',
      subtitle: '认知科学家',
      content: '研究知识表征与认知架构多年。对知识的层级结构有深入研究。',
      x: 1420, y: 120, width: 210, height: 130,
      topics: ['知识升维', '认知科学'],
      toneStatus: '静默',
      connectionCount: 9,
      createdAt: '2026-02-20',
      lastTalk: '三周前' },
    { id: 'h-wy', type: NODE_TYPES.HUMAN, title: '王悦',
      subtitle: '独立学者',
      content: '研究信息论与知识论，著有《知识的密度》。',
      x: 1420, y: 300, width: 210, height: 130,
      topics: ['知识升维', '信息论'],
      toneStatus: '开放',
      connectionCount: 6,
      createdAt: '2026-03-01',
      lastTalk: '上周' },
  ],
  edges: [
    { from: 'topic-elevation', to: 'q-e1', type: EDGE_TYPES.HIERARCHY, label: '追问' },
    { from: 'topic-elevation', to: 'q-e2', type: EDGE_TYPES.HIERARCHY, label: '追问' },
    { from: 'topic-elevation', to: 'q-e3', type: EDGE_TYPES.HIERARCHY, label: '追问' },
    { from: 'topic-elevation', to: 'q-e4', type: EDGE_TYPES.HIERARCHY, label: '追问' },
    { from: 'topic-elevation', to: 'q-e5', type: EDGE_TYPES.HIERARCHY, label: '追问' },
    { from: 'q-e1', to: 'q-e2', type: EDGE_TYPES.SEQUENCE, label: '追问' },
    { from: 'q-e2', to: 'q-e3', type: EDGE_TYPES.SEQUENCE, label: '追问' },
    { from: 'q-e3', to: 'q-e4', type: EDGE_TYPES.SEQUENCE, label: '延伸' },
    { from: 'q-e4', to: 'q-e5', type: EDGE_TYPES.SEQUENCE, label: '延伸' },
    { from: 'q-e1', to: 'a-e1', type: EDGE_TYPES.CAUSAL, label: '回答' },
    { from: 'q-e2', to: 'a-e2', type: EDGE_TYPES.CAUSAL, label: '回答' },
    { from: 'q-e3', to: 'a-e3', type: EDGE_TYPES.CAUSAL, label: '回答' },
    { from: 'q-e4', to: 'a-e4', type: EDGE_TYPES.CAUSAL, label: '回答' },
    { from: 'q-e5', to: 'a-e5', type: EDGE_TYPES.CAUSAL, label: '回答' },
    { from: 'a-e1', to: 'k-e1', type: EDGE_TYPES.HIERARCHY },
    { from: 'a-e1', to: 'k-e2', type: EDGE_TYPES.HIERARCHY },
    { from: 'a-e2', to: 'k-e5', type: EDGE_TYPES.HIERARCHY },
    { from: 'a-e3', to: 'k-e3', type: EDGE_TYPES.HIERARCHY },
    { from: 'a-e4', to: 'k-e4', type: EDGE_TYPES.HIERARCHY },
    { from: 'a-e5', to: 'k-e6', type: EDGE_TYPES.HIERARCHY },
    { from: 'k-e1', to: 'k-e2', type: EDGE_TYPES.ASSOCIATION, label: '相关' },
    { from: 'k-e3', to: 'k-e7', type: EDGE_TYPES.ASSOCIATION, label: '对应' },
    { from: 'k-e5', to: 'k-e7', type: EDGE_TYPES.ASSOCIATION, label: '映射' },
    { from: 'k-e2', to: 'c-e1', type: EDGE_TYPES.HIERARCHY, label: '升维' },
    { from: 'k-e4', to: 'c-e2', type: EDGE_TYPES.HIERARCHY, label: '升维' },
    { from: 'c-e1', to: 's-e1', type: EDGE_TYPES.HIERARCHY, label: '升维' },
    { from: 's-e1', to: 'i-e1', type: EDGE_TYPES.HIERARCHY, label: '升维' },
    { from: 'h-lm', to: 'c-e1', type: EDGE_TYPES.ASSOCIATION, label: '启发' },
    { from: 'h-lm', to: 'i-e1', type: EDGE_TYPES.ASSOCIATION, label: '共鸣' },
    { from: 'h-wy', to: 'k-e3', type: EDGE_TYPES.ASSOCIATION, label: '提出' },
    { from: 'h-wy', to: 'k-e7', type: EDGE_TYPES.ASSOCIATION, label: '研究' },
    { from: 'h-lm', to: 'h-wy', type: EDGE_TYPES.COMPARISON, label: '讨论' },
  ],
};

// 所有话题
const GRAPH_TOPICS = [
  { id: 'topic-social', name: '社交重塑', nodeCount: 28, lastActive: '今天', desc: '重新定义人与人的连接方式', color: '#B56B3A' },
  { id: 'topic-oneos', name: 'OneOS 架构', nodeCount: 28, lastActive: '今天', desc: '个人知识操作系统的设计哲学', color: '#3D4A6B' },
  { id: 'topic-elevation', name: '知识升维', nodeCount: 26, lastActive: '昨天', desc: '从信息到智慧的四段跃迁', color: '#5A7A4E' },
];

// 完整话题数据映射
const TOPIC_DATA_MAP = {
  'topic-social': SOCIAL_RESHAPE_TOPIC,
  'topic-oneos': ONEOS_TOPIC,
  'topic-elevation': ELEVATION_TOPIC,
};

// 获取话题的所有节点（扁平数组）
function getTopicNodes(topicId) {
  const topic = TOPIC_DATA_MAP[topicId];
  if (!topic) return [];
  return [
    {
      id: topic.id,
      type: topic.type,
      title: topic.title,
      subtitle: topic.subtitle,
      x: topic.x,
      y: topic.y,
      width: topic.width,
      height: topic.height,
      icon: topic.icon,
      color: topic.color,
      createdAt: topic.createdAt,
    },
    ...topic.children.map(c => ({ ...c })),
  ];
}

// 获取话题的所有连线
function getTopicEdges(topicId) {
  const topic = TOPIC_DATA_MAP[topicId];
  return topic ? [...topic.edges] : [];
}

// 获取话题的元信息
function getTopicMeta(topicId) {
  return GRAPH_TOPICS.find(t => t.id === topicId);
}

// 获取节点的关联数
function getNodeConnectionCount(nodeId, edges) {
  return edges.filter(e => e.from === nodeId || e.to === nodeId).length;
}

Object.assign(window, {
  NODE_TYPES,
  NODE_TYPE_LABELS,
  EDGE_TYPES,
  EDGE_TYPE_LABELS,
  GRAPH_TOPICS,
  TOPIC_DATA_MAP,
  getTopicNodes,
  getTopicEdges,
  getTopicMeta,
  getNodeConnectionCount,
});
