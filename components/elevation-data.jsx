// ============================================
// 知识升维系统模拟数据
// 四段升维论：L0 原文 → L1 卡片 → L2 摘要 → L3 图标
// ============================================

const ELEVATION_LEVELS = {
  L0: 'original',  // 原文
  L1: 'card',      // 卡片
  L2: 'summary',   // 摘要
  L3: 'icon',      // 图标/元知识
};

const ELEVATION_LEVEL_LABELS = {
  original: '原文',
  card: '卡片',
  summary: '摘要',
  icon: '元知识',
};

// ============================================
// L0 原文级（24 篇）
// ============================================
const L0_NOTES = [
  {
    id: 'n-001', title: '社交的本质是意义交换',
    content: '我们需要重新理解社交的本质。在数字时代，社交被简化为点赞和消息，但真正的社交远不止于此。真正的社交发生在两个完整的灵魂之间，它们交换各自的生命体验与深度思考，而不是信息碎片的传递。意义交换的深度决定了社交的质量。',
    topic: '社交重塑', tags: ['社交', '意义'],
    readCount: 5, wordCount: 1820,
    createdAt: '2026-03-14',
  },
  {
    id: 'n-002', title: '浅层互动的疲劳机制',
    content: '为什么现在的社交让人疲惫？因为每一次点赞和回复都消耗了我们的认知资源，但因为没有深度，无法产生意义感的回报。这就像吃了很多空热量的食物，肚子撑了但营养不良。浅层互动消耗大、回报低，长期下来必然导致社交倦怠。',
    topic: '社交重塑', tags: ['社交', '注意力'],
    readCount: 3, wordCount: 1560,
    createdAt: '2026-03-15',
  },
  {
    id: 'n-003', title: '以话题为中心的社交',
    content: '理想的社交应该以话题为中心而非以人为中心。当人们因共同的深度兴趣而相遇时，身份和标签就退居其次，话题本身成为连接的纽带。这降低了社交压力，提升了质量，也让社交从"维护关系"变成了"共同探索"。',
    topic: '社交重塑', tags: ['社交', '话题'],
    readCount: 4, wordCount: 1340,
    createdAt: '2026-03-17',
  },
  {
    id: 'n-004', title: '深度优先策略',
    content: '如何从当前的社交困境中走出来？答案是减少 80% 的浅层社交，把精力投入到少数几段深度关系中。反直觉的是，当你减少社交频率、提升每次社交的深度与意义密度，幸福感反而会提升。质量永远比数量重要，尤其是在精神层面。',
    topic: '社交重塑', tags: ['社交', '策略'],
    readCount: 3, wordCount: 1680,
    createdAt: '2026-03-20',
  },
  {
    id: 'n-005', title: '弱关系的信息价值',
    content: 'Granovetter 的弱关系强度理论告诉我们：找工作、获取新信息往往通过弱关系而非强关系。强关系提供情感支持，弱关系提供信息与机会，两者不可互相替代。我们需要的不是摒弃弱关系，而是理解不同关系的不同价值。',
    topic: '社交重塑', tags: ['社会学', '弱关系'],
    readCount: 2, wordCount: 1420,
    createdAt: '2026-04-02',
  },
  {
    id: 'n-006', title: '为什么需要个人操作系统',
    content: '工具碎片化导致注意力和知识也碎片化。我们每天在十几个应用之间切换，每一次切换都留下注意力残留。我们需要一个统一的精神栖息地——一个人每天大部分时间在此思考、阅读、写作、对话的地方，是精神生活的容器。',
    topic: 'OneOS架构', tags: ['操作系统', '注意力'],
    readCount: 6, wordCount: 2100,
    createdAt: '2026-01-10',
  },
  {
    id: 'n-007', title: '知识作为第一公民',
    content: '个人操作系统的核心应该是什么？不是任务管理，不是日程，而是知识。所有功能都服务于知识的产生、连接、升维，其他都是服务。知识是系统的第一公民，一切围绕知识展开。',
    topic: 'OneOS架构', tags: ['操作系统', '知识'],
    readCount: 4, wordCount: 1280,
    createdAt: '2026-01-12',
  },
  {
    id: 'n-008', title: '数据主权与主体性',
    content: '本地优先意味着什么？数据主权在用户手中，平台只是工具，而非数据的拥有者。本地 Markdown 是唯一真相源，所有能力都是对这份数据的不同视角。主体性是 OneOS 的基石——人永远是目的，不是产品。',
    topic: 'OneOS架构', tags: ['本地优先', '主体性'],
    readCount: 5, wordCount: 1650,
    createdAt: '2026-01-15',
  },
  {
    id: 'n-009', title: 'AI 副驾模式',
    content: 'AI 在 OneOS 中扮演什么角色？AI 是思考的副驾，是知识的放大器，而非主角。AI 永远是副驾，方向盘握在用户手中。AI 提出、用户判断、用户决策。AI 擅长加速，但不擅长掌舵。',
    topic: 'OneOS架构', tags: ['AI', '副驾'],
    readCount: 3, wordCount: 1180,
    createdAt: '2026-01-20',
  },
  {
    id: 'n-010', title: '同一数据，多个视图',
    content: '十大板块如何分工协作？每个板块是知识的一个视角，底层共享同一份 Markdown 数据。仪表盘、编辑器、图谱、日历……都是同一份知识的不同呈现角度。数据是唯一的，视图是多样的。',
    topic: 'OneOS架构', tags: ['架构', '数据'],
    readCount: 2, wordCount: 980,
    createdAt: '2026-02-01',
  },
  {
    id: 'n-011', title: '什么是知识的维度',
    content: '知识是有维度的。原始记录是一维的——信息的线性堆积。结构化是二维的——信息有了分类和框架。抽象模型是三维的——看到了模式和规律。智慧是四维的——直觉式的理解，无需思考就能做出正确判断。每一次升维都是一次跃迁。',
    topic: '知识升维', tags: ['知识', '维度'],
    readCount: 4, wordCount: 1450,
    createdAt: '2026-02-12',
  },
  {
    id: 'n-012', title: '四段跃迁模型',
    content: '如何实现知识的升维？四段论：文字记录 → 知识卡片 → 摘要提炼 → 元知识图标。每一步都是一次信息压缩和模式提取。文字是原始素材，卡片是结构化整理，摘要是核心观点的浓缩，图标是内化后的直觉符号。',
    topic: '知识升维', tags: ['升维', '方法论'],
    readCount: 5, wordCount: 1760,
    createdAt: '2026-02-15',
  },
  {
    id: 'n-013', title: '升维的目的：穿透力',
    content: '升维不是为了简洁而简洁，是为了在更高维度看清事物的本质。升维的价值在于穿透力——用更少的符号承载更多的意义。当一个概念被压缩成一个图标，它就可以像积木一样被随意组合，产生新的想法。',
    topic: '知识升维', tags: ['升维', '穿透力'],
    readCount: 3, wordCount: 1320,
    createdAt: '2026-02-20',
  },
  {
    id: 'n-014', title: '降维可追溯原则',
    content: '升维不是删除，是叠加视图。每个高维节点都能降维查看原始依据。升维是叠加而非替代——原文保留，卡片叠加在原文之上，摘要叠加在卡片之上。这样既获得了高维的穿透力，又不失低维的细节支撑。',
    topic: '知识升维', tags: ['升维', '可追溯'],
    readCount: 3, wordCount: 1120,
    createdAt: '2026-02-28',
  },
  {
    id: 'n-015', title: '密度优先原则',
    content: '知识的价值在于密度，不在于数量。1000 篇未消化的笔记不如 10 张真正内化的卡片。囤积知识是一种幻觉——你以为拥有了知识，其实只是收藏了文字。密度优先，是对抗知识焦虑的最好方式。',
    topic: '知识升维', tags: ['密度', '知识焦虑'],
    readCount: 2, wordCount: 1080,
    createdAt: '2026-03-05',
  },
  {
    id: 'n-016', title: '注意力残留效应',
    content: '切换任务后，大脑中仍有一部分注意力残留在上一个任务上。这就是注意力残留效应。频繁切换的代价被严重低估了——每一次切换都不是无缝的，它留下了认知负债。这也是为什么多任务实际上降低了效率。',
    topic: '认知科学', tags: ['注意力', '认知'],
    readCount: 4, wordCount: 1240,
    createdAt: '2026-02-10',
  },
  {
    id: 'n-017', title: '心流与专注',
    content: '心流发生在挑战与技能恰好匹配的时刻。任务太难会焦虑，太容易会无聊，只有在两者之间的狭窄通道上，心流才会出现。深度工作的本质就是主动创造心流产生的条件——清晰的目标、即时的反馈、匹配的挑战。',
    topic: '认知科学', tags: ['心流', '专注'],
    readCount: 3, wordCount: 1580,
    createdAt: '2026-02-18',
  },
  {
    id: 'n-018', title: '间隔重复的原理',
    content: '根据艾宾浩斯遗忘曲线，记忆会随时间衰减。但如果在遗忘的临界点复习，记忆的留存时间就会大幅延长。间隔重复利用了大脑的记忆规律——不是死记硬背，而是在对的时间点唤醒记忆，让记忆不断深化。',
    topic: '认知科学', tags: ['记忆', '学习'],
    readCount: 1, wordCount: 960,
    createdAt: '2026-03-08',
  },
  {
    id: 'n-019', title: '费曼技巧的本质',
    content: '费曼技巧的核心很简单：用你自己的话，把一个概念讲给一个完全不懂的人听。如果你讲不清楚，说明你还没真正理解。教是最好的学——输出是检验理解的唯一标准。',
    topic: '认知科学', tags: ['学习', '方法论'],
    readCount: 2, wordCount: 870,
    createdAt: '2026-03-12',
  },
  {
    id: 'n-020', title: '独处与孤独',
    content: '独处和孤独是两回事。孤独是被动的缺失感——你想要连接但得不到。独处是主动的丰盈——你选择与自己相处，在自我对话中获得滋养。社交让人成长，独处也让人成长，它们是两种不同的养分。',
    topic: '自我探索', tags: ['独处', '自我'],
    readCount: 3, wordCount: 1340,
    createdAt: '2026-03-22',
  },
  {
    id: 'n-021', title: '习惯的底层逻辑',
    content: '习惯不是意志力的产物，是环境的产物。你不需要更多的意志力，你需要更好的环境设计。提示 → 行为 → 奖励，这是习惯的基本回路。想养成一个习惯，不要靠毅力，要改变环境让那个行为更容易发生。',
    topic: '自我探索', tags: ['习惯', '行为设计'],
    readCount: 2, wordCount: 1150,
    createdAt: '2026-03-28',
  },
  {
    id: 'n-022', title: '意义感的三个来源',
    content: '人的意义感大致来自三个方向：连接（与他人的深度关系）、创造（做出有价值的东西）、超越（投身于比自我更大的事物）。三者不一定同时需要，但完全没有就会陷入存在的空虚。',
    topic: '自我探索', tags: ['意义', '存在'],
    readCount: 4, wordCount: 1480,
    createdAt: '2026-04-05',
  },
  {
    id: 'n-023', title: '深度工作的价值',
    content: '深度工作能力正在变得稀缺，也因此越来越有价值。在一个注意力被不断切割的时代，能够长时间专注于一件复杂的事情，本身就是一种竞争优势。深度工作不是苦行，它是一种能力，也是一种特权。',
    topic: '认知科学', tags: ['深度工作', '专注'],
    readCount: 1, wordCount: 1200,
    createdAt: '2026-04-08',
  },
  {
    id: 'n-024', title: '工具异化的警示',
    content: '工具本应服务于人，但人反而越来越被工具奴役。刷短视频不是你在娱乐，是算法在训练你。用效率工具不是你在管理时间，是模板在规训你。每用一个工具，都要问一句：谁是主人？',
    topic: '自我探索', tags: ['工具', '异化'],
    readCount: 2, wordCount: 1380,
    createdAt: '2026-04-12',
  },
];

// ============================================
// L1 卡片级（14 张）
// ============================================
const L1_CARDS = [
  {
    id: 'c-001', title: '意义交换模型',
    content: '社交价值 = 深度 × 真实度 × 稀缺性\n三个维度同时提升才有质变',
    keyPoints: ['深度决定质量', '真实是前提', '稀缺性放大价值'],
    sourceId: 'n-001', topic: '社交重塑', tags: ['社交', '模型'],
    readCount: 8,
    elevatedAt: '2026-03-22',
  },
  {
    id: 'c-002', title: '注意力残留效应',
    content: '任务切换后，部分注意力仍停留在上一个任务\n频繁切换 = 认知负债',
    keyPoints: ['切换不是无缝的', '残留随难度增加', '批量处理更高效'],
    sourceId: 'n-016', topic: '认知科学', tags: ['注意力', '认知'],
    readCount: 6,
    elevatedAt: '2026-02-25',
  },
  {
    id: 'c-003', title: '深度优先策略',
    content: '减少 80% 浅层关系\n聚焦 5-10 段深度关系\n反而获得更多意义感',
    keyPoints: ['质量 > 数量', '做减法', '深度即滋养'],
    sourceId: 'n-004', topic: '社交重塑', tags: ['社交', '策略'],
    readCount: 5,
    elevatedAt: '2026-03-28',
  },
  {
    id: 'c-004', title: '本地优先五原则',
    content: '本地存储 · 加密可选\n格式开放 · 导出自由\n永不锁定',
    keyPoints: ['数据主权', '格式可控', '可迁移'],
    sourceId: 'n-008', topic: 'OneOS架构', tags: ['本地优先', '原则'],
    readCount: 7,
    elevatedAt: '2026-02-10',
  },
  {
    id: 'c-005', title: 'AI 副驾原则',
    content: 'AI 提出 · 用户判断\nAI 提速 · 用户掌舵\nAI 永远是副驾',
    keyPoints: ['人是决策者', 'AI 是工具', '方向盘在人手'],
    sourceId: 'n-009', topic: 'OneOS架构', tags: ['AI', '原则'],
    readCount: 5,
    elevatedAt: '2026-02-15',
  },
  {
    id: 'c-006', title: '四段升维模型',
    content: '原文 → 卡片 → 摘要 → 图标\n每层密度翻倍，体积减半',
    keyPoints: ['信息压缩', '模式提取', '穿透力提升'],
    sourceId: 'n-012', topic: '知识升维', tags: ['升维', '方法论'],
    readCount: 9,
    elevatedAt: '2026-02-25',
  },
  {
    id: 'c-007', title: '降维可追溯',
    content: '升维是叠加视图，不是删除\n每层都能回溯到原始依据',
    keyPoints: ['叠加而非替代', '可追溯性', '不失细节'],
    sourceId: 'n-014', topic: '知识升维', tags: ['升维', '可追溯'],
    readCount: 4,
    elevatedAt: '2026-03-05',
  },
  {
    id: 'c-008', title: '弱关系强度',
    content: 'Granovetter：弱关系在信息传播中比强关系更有效\n强关系给支持，弱关系给机会',
    keyPoints: ['信息桥接', '机会来源', '不可替代'],
    sourceId: 'n-005', topic: '社交重塑', tags: ['社会学', '弱关系'],
    readCount: 3,
    elevatedAt: '2026-04-08',
  },
  {
    id: 'c-009', title: '心流通道',
    content: '挑战与技能恰好匹配时产生心流\n太难则焦虑，太易则无聊',
    keyPoints: ['匹配是关键', '清晰目标', '即时反馈'],
    sourceId: 'n-017', topic: '认知科学', tags: ['心流', '专注'],
    readCount: 5,
    elevatedAt: '2026-03-05',
  },
  {
    id: 'c-010', title: '密度优先',
    content: '知识价值在于密度，不在于数量\n1000 篇笔记不如 10 张内化的卡片',
    keyPoints: ['对抗囤积', '质量优先', '内化是核心'],
    sourceId: 'n-015', topic: '知识升维', tags: ['密度', '原则'],
    readCount: 6,
    elevatedAt: '2026-03-15',
  },
  {
    id: 'c-011', title: '意义感三源',
    content: '连接 · 创造 · 超越\n三者有一，便不致虚无',
    keyPoints: ['深度关系', '创造价值', '投身大我'],
    sourceId: 'n-022', topic: '自我探索', tags: ['意义', '存在'],
    readCount: 4,
    elevatedAt: '2026-04-12',
  },
  {
    id: 'c-012', title: '工具异化警惕',
    content: '工具本应服务于人\n但人反而被工具规训\n每用一个工具，先问谁是主人',
    keyPoints: ['主体性', '警惕', '反向规训'],
    sourceId: 'n-024', topic: '自我探索', tags: ['工具', '异化'],
    readCount: 3,
    elevatedAt: '2026-04-18',
  },
  {
    id: 'c-013', title: '习惯的环境设计',
    content: '习惯不是意志力的产物，是环境的产物\n想养成习惯，先改环境',
    keyPoints: ['提示-行为-奖励', '环境优于意志', '降低摩擦力'],
    sourceId: 'n-021', topic: '自我探索', tags: ['习惯', '行为设计'],
    readCount: 3,
    elevatedAt: '2026-04-10',
  },
  {
    id: 'c-014', title: '知识作为第一公民',
    content: '一切功能围绕知识展开\n其他都是服务',
    keyPoints: ['知识为核心', '功能服务知识', '统一数据结构'],
    sourceId: 'n-007', topic: 'OneOS架构', tags: ['架构', '知识'],
    readCount: 4,
    elevatedAt: '2026-02-20',
  },
];

// ============================================
// L2 摘要级（7 个）
// ============================================
const L2_SUMMARIES = [
  {
    id: 's-001', title: '以话题为中心',
    content: '人不再是社交的中心，话题才是。',
    sourceId: 'c-001', topic: '社交重塑',
    readCount: 11,
    elevatedAt: '2026-04-02',
  },
  {
    id: 's-002', title: '工具服务于人',
    content: '人是目的，工具是手段。',
    sourceId: 'c-004', topic: 'OneOS架构',
    readCount: 8,
    elevatedAt: '2026-03-01',
  },
  {
    id: 's-003', title: '密度优先',
    content: '知识的价值在于密度，不在于数量。',
    sourceId: 'c-010', topic: '知识升维',
    readCount: 10,
    elevatedAt: '2026-03-25',
  },
  {
    id: 's-004', title: '升维即穿透力',
    content: '升维的价值在于穿透力，用更少的符号承载更多的意义。',
    sourceId: 'c-006', topic: '知识升维',
    readCount: 7,
    elevatedAt: '2026-04-05',
  },
  {
    id: 's-005', title: '深度即滋养',
    content: '减少数量，提升深度，意义感反而增加。',
    sourceId: 'c-003', topic: '社交重塑',
    readCount: 6,
    elevatedAt: '2026-04-10',
  },
  {
    id: 's-006', title: '注意力是最稀缺的资源',
    content: '注意力在哪里，生命就在哪里。',
    sourceId: 'c-002', topic: '认知科学',
    readCount: 9,
    elevatedAt: '2026-03-15',
  },
  {
    id: 's-007', title: '主体性至上',
    content: '人永远是目的，不是工具，不是数据，不是产品。',
    sourceId: 'c-005', topic: 'OneOS架构',
    readCount: 12,
    elevatedAt: '2026-03-20',
  },
];

// ============================================
// L3 图标级 / 元知识（4 个）
// ============================================
const L3_ICONS = [
  {
    id: 'i-001', title: '连接',
    symbol: '◎',
    meaning: '万物相互连接。人与人的连接、知识与知识的连接、过去与未来的连接。连接的质量决定生命的密度。',
    sourceId: 's-001',
    topic: '社交重塑',
    readCount: 15,
    elevatedAt: '2026-04-20',
    relatedIcons: ['i-003', 'i-004'],
  },
  {
    id: 'i-002', title: '主体性',
    symbol: '◈',
    meaning: '人是自己的主人。工具服务于人，数据属于人，AI 辅助人。任何时候，方向盘都在人的手中。',
    sourceId: 's-007',
    topic: 'OneOS架构',
    readCount: 18,
    elevatedAt: '2026-04-15',
    relatedIcons: ['i-004', 'i-003'],
  },
  {
    id: 'i-003', title: '升维',
    symbol: '△',
    meaning: '知识不是数量的积累，是维度的跃迁。从原文到卡片到摘要到图标，每一步都是一次浓缩与穿透。',
    sourceId: 's-003',
    topic: '知识升维',
    readCount: 20,
    elevatedAt: '2026-04-10',
    relatedIcons: ['i-002', 'i-001'],
  },
  {
    id: 'i-004', title: '深度',
    symbol: '◐',
    meaning: '浅尝辄止是这个时代的通病。深度才是稀缺品——深度工作、深度阅读、深度关系、深度思考。',
    sourceId: 's-005',
    topic: '认知科学',
    readCount: 14,
    elevatedAt: '2026-04-22',
    relatedIcons: ['i-001', 'i-003'],
  },
];

// ============================================
// 升维统计
// ============================================
function getElevationStats() {
  const totalL0 = L0_NOTES.length;
  const totalL1 = L1_CARDS.length;
  const totalL2 = L2_SUMMARIES.length;
  const totalL3 = L3_ICONS.length;

  return {
    levels: [
      { key: 'original', label: '原文', count: totalL0, color: '#8B96A8' },
      { key: 'card', label: '卡片', count: totalL1, color: '#7C6FF0' },
      { key: 'summary', label: '摘要', count: totalL2, color: '#4ECDC4' },
      { key: 'icon', label: '元知识', count: totalL3, color: '#FFD93D' },
    ],
    rates: {
      '原文→卡片': Math.round((totalL1 / totalL0) * 100),
      '卡片→摘要': Math.round((totalL2 / totalL1) * 100),
      '摘要→图标': Math.round((totalL3 / totalL2) * 100),
    },
    totalWords: L0_NOTES.reduce((s, n) => s + n.wordCount, 0),
    totalReads: L0_NOTES.reduce((s, n) => s + n.readCount, 0)
      + L1_CARDS.reduce((s, n) => s + n.readCount, 0)
      + L2_SUMMARIES.reduce((s, n) => s + n.readCount, 0)
      + L3_ICONS.reduce((s, n) => s + n.readCount, 0),
  };
}

// ============================================
// 获取升维谱系（从某节点向上/向下追溯）
// ============================================
function getElevationLineage(nodeId, level) {
  const lineage = [];

  // 向下追溯（找来源）
  let currentId = nodeId;
  let currentLevel = level;

  // L3 → L2
  if (currentLevel === 'icon') {
    const icon = L3_ICONS.find(i => i.id === currentId);
    if (icon) {
      lineage.push({ id: icon.id, level: 'icon', title: icon.title, node: icon });
      currentId = icon.sourceId;
      currentLevel = 'summary';
    }
  }
  // L2 → L1
  if (currentLevel === 'summary') {
    const summary = L2_SUMMARIES.find(s => s.id === currentId);
    if (summary) {
      lineage.push({ id: summary.id, level: 'summary', title: summary.title, node: summary });
      currentId = summary.sourceId;
      currentLevel = 'card';
    }
  }
  // L1 → L0
  if (currentLevel === 'card') {
    const card = L1_CARDS.find(c => c.id === currentId);
    if (card) {
      lineage.push({ id: card.id, level: 'card', title: card.title, node: card });
      currentId = card.sourceId;
      currentLevel = 'original';
    }
  }
  // L0
  if (currentLevel === 'original') {
    const note = L0_NOTES.find(n => n.id === currentId);
    if (note) {
      lineage.push({ id: note.id, level: 'original', title: note.title, node: note });
    }
  }

  return lineage;
}

// 获取最近升维活动
function getRecentElevations(count = 8) {
  const events = [];
  L1_CARDS.forEach(c => events.push({
    date: c.elevatedAt, title: c.title,
    from: '原文', to: '卡片', topic: c.topic,
  }));
  L2_SUMMARIES.forEach(s => events.push({
    date: s.elevatedAt, title: s.title,
    from: '卡片', to: '摘要', topic: s.topic,
  }));
  L3_ICONS.forEach(i => events.push({
    date: i.elevatedAt, title: i.title,
    from: '摘要', to: '元知识', topic: i.topic,
  }));
  events.sort((a, b) => b.date.localeCompare(a.date));
  return events.slice(0, count);
}

// 所有话题列表
const ELEVATION_TOPICS = [
  '全部话题', '社交重塑', 'OneOS架构', '知识升维', '认知科学', '自我探索',
];

Object.assign(window, {
  ELEVATION_LEVELS,
  ELEVATION_LEVEL_LABELS,
  L0_NOTES,
  L1_CARDS,
  L2_SUMMARIES,
  L3_ICONS,
  ELEVATION_TOPICS,
  getElevationStats,
  getElevationLineage,
  getRecentElevations,
});
