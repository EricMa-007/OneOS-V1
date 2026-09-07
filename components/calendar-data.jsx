// ============================================
// 日历板块模拟数据
// 每日生命强度 + 当日文档 + 年度热力图
// ============================================

// 生命强度因子权重
const INTENSITY_FACTORS = {
  knowledge: 0.4,   // 知识沉淀
  dialogue: 0.25,   // 深度对话
  elevation: 0.2,   // 知识升维
  connection: 0.15, // 新增连接
};

// 颜色方案
const COLOR_SCHEMES = {
  mint: {
    name: '薄荷',
    levels: [
      '#FFFFFF',       // 0 - 无活动
      '#E8F5F1',       // 1 - 极轻
      '#C2E9DF',       // 2 - 轻
      '#8DD9C9',       // 3 - 中
      '#4ECDC4',       // 4 - 高
      '#2A9D8F',       // 5 - 极高
      '#1A7F75',       // 6 - 更深
      '#0F5F58',       // 7 - 最深
    ],
  },
  purple: {
    name: '紫霞',
    levels: [
      '#FFFFFF',
      '#EDE9FE',
      '#DDD6FE',
      '#C4B5FD',
      '#A78BFA',
      '#7C6FF0',
      '#5B4FE0',
      '#4338CA',
    ],
  },
  peach: {
    name: '蜜桃',
    levels: [
      '#FFFFFF',
      '#FFF1E6',
      '#FFD8BE',
      '#FFBE94',
      '#FFA07A',
      '#FF8C5A',
      '#E07040',
      '#C25A2E',
    ],
  },
  green: {
    name: '青草',
    levels: [
      '#FFFFFF',
      '#E8F8EC',
      '#C6E9CE',
      '#98D9A6',
      '#6BCB77',
      '#4CAF50',
      '#388E3C',
      '#2E7D32',
    ],
  },
};

// 生成指定月份的每日数据
// 使用确定性伪随机（基于日期种子），保证每次刷新结果一致
function seededRandom(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateDayData(year, month, day) {
  const seed = year * 10000 + month * 100 + day;
  const rand = seededRandom(seed);
  const rand2 = seededRandom(seed + 999);
  const rand3 = seededRandom(seed + 7777);

  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const isFuture = dateStr > todayStr;
  const isToday = dateStr === todayStr;

  // 周末强度稍低（概率更低/休息）
  const dayOfWeek = new Date(year, month - 1, day).getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // 强度计算 0-5
  let intensity = 0;
  if (!isFuture) {
    const baseProb = isWeekend ? 0.55 : 0.75;
    if (rand < baseProb) {
      // 有活动
      const activityLevel = rand2;
      if (activityLevel < 0.15) intensity = 1;
      else if (activityLevel < 0.4) intensity = 2;
      else if (activityLevel < 0.7) intensity = 3;
      else if (activityLevel < 0.9) intensity = 4;
      else intensity = 5;
    }
  }

  // 今日特殊：中等强度
  if (isToday) {
    intensity = 4;
  }

  // 强度构成因子
  const factors = {
    knowledge: 0,
    dialogue: 0,
    elevation: 0,
    connection: 0,
  };

  if (intensity > 0) {
    // 各因子占比，用随机分配
    const k = 0.3 + rand2 * 0.4;       // 知识 30-70%
    const d = 0.1 + rand3 * 0.3;       // 对话 10-40%
    const e = 0.05 + (1 - rand) * 0.2; // 升维 5-25%
    const c = 0.05 + (1 - rand2) * 0.15; // 连接 5-20%
    const total = k + d + e + c;
    factors.knowledge = Math.round((k / total) * 100);
    factors.dialogue = Math.round((d / total) * 100);
    factors.elevation = Math.round((e / total) * 100);
    factors.connection = 100 - factors.knowledge - factors.dialogue - factors.elevation;
  }

  // 当日文档
  const docs = [];
  if (intensity > 0) {
    const docCount = Math.min(8, Math.max(1, Math.ceil(intensity * 1.5 + rand2 * 2)));

    // 文档类型池
    const docTypes = [
      { type: '思考', label: '思考笔记', pool: THINKING_DOC_POOL },
      { type: '知识', label: '知识卡片', pool: KNOWLEDGE_DOC_POOL },
      { type: '对话', label: '深度对话', pool: DIALOGUE_DOC_POOL },
      { type: '升维', label: '升维记录', pool: ELEVATION_DOC_POOL },
      { type: '日记', label: '日常记录', pool: DAILY_DOC_POOL },
    ];

    for (let i = 0; i < docCount; i++) {
      const typeIdx = Math.floor(seededRandom(seed + i * 37) * docTypes.length);
      const docType = docTypes[typeIdx];
      const pool = docType.pool;
      const poolIdx = Math.floor(seededRandom(seed + i * 101) * pool.length);
      const template = pool[poolIdx % pool.length];

      // 时间：从早上7点到晚上22点分布
      const hour = 7 + Math.floor(seededRandom(seed + i * 53) * 15);
      const minute = Math.floor(seededRandom(seed + i * 79) * 60);
      const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

      docs.push({
        id: `doc-${dateStr}-${i}`,
        title: template.title,
        type: docType.type,
        typeLabel: docType.label,
        time: time,
        excerpt: template.excerpt,
        wordCount: Math.floor(200 + seededRandom(seed + i * 137) * 1500),
        tags: template.tags || [],
      });
    }

    // 按时间排序
    docs.sort((a, b) => a.time.localeCompare(b.time));
  }

  return {
    date: dateStr,
    day: day,
    month: month,
    year: year,
    intensity: intensity,
    isToday: isToday,
    isFuture: isFuture,
    isWeekend: isWeekend,
    factors: factors,
    docs: docs,
    noteCount: docs.length,
    totalWords: docs.reduce((sum, d) => sum + d.wordCount, 0),
  };
}

// 文档模板池
const THINKING_DOC_POOL = [
  { title: '关于时间感知的思考', excerpt: '时间不是河流，是一系列的"此刻"的堆叠。', tags: ['时间', '哲学'] },
  { title: '孤独与独处的区别', excerpt: '孤独是被动的缺失感，独处是主动的丰盈。', tags: ['孤独', '自我'] },
  { title: '深度工作的状态进入', excerpt: '进入心流的关键不是意志力，是减少切换成本。', tags: ['深度工作', '专注'] },
  { title: '知识焦虑的根源', excerpt: '焦虑不是因为知道得少，是因为知道自己不知道的太多。', tags: ['焦虑', '知识'] },
  { title: '消费与创造的平衡', excerpt: '创造一小时，抵得上消费一整天的满足感。', tags: ['创造', '消费'] },
  { title: '习惯的本质', excerpt: '习惯不是意志力的产物，是环境的产物。', tags: ['习惯', '行为设计'] },
  { title: '为什么我们害怕无聊', excerpt: '无聊迫使我们面对自己，而大多数人不想面对。', tags: ['无聊', '存在'] },
  { title: '阅读的两种速度', excerpt: '快读获取信息，慢读获取智慧。两者不可或缺。', tags: ['阅读', '方法论'] },
];

const KNOWLEDGE_DOC_POOL = [
  { title: '卡片拆解：注意力残留', excerpt: '切换任务后，大脑中仍有一部分注意力残留在上一个任务上。', tags: ['注意力', '认知科学'] },
  { title: '概念卡片：间隔重复', excerpt: '根据艾宾浩斯遗忘曲线，在临界点复习效率最高。', tags: ['记忆', '学习'] },
  { title: '摘要整理：存在主义核心命题', excerpt: '存在先于本质、自由与责任、畏与本真……', tags: ['哲学', '存在主义'] },
  { title: '知识卡片：费曼技巧', excerpt: '用简单的语言解释复杂概念，是检验理解的最好方式。', tags: ['学习', '方法论'] },
  { title: '笔记：《深度工作》核心观点', excerpt: '深度工作能力正在变得稀缺，也因此越来越有价值。', tags: ['深度工作', '读书'] },
  { title: '概念：认知负荷', excerpt: '工作记忆容量有限，信息组块化是应对之道。', tags: ['认知科学', '心理学'] },
  { title: '读书摘录：《心流》', excerpt: '心流发生在挑战与技能恰好匹配的时刻。', tags: ['心流', '积极心理学'] },
];

const DIALOGUE_DOC_POOL = [
  { title: '与 A 君讨论：知识管理的本质', excerpt: '工具是次要的，关键是你想成为什么样的人。持续一个半小时。', tags: ['对话', '知识管理'] },
  { title: '深度对话：关于选择的哲学', excerpt: '选择的自由不是越多越好，过多的选择反而消耗心力。', tags: ['对话', '选择'] },
  { title: '与好友谈：中年危机的本质', excerpt: '不是年龄问题，是意义感的重新校准。', tags: ['对话', '意义'] },
  { title: '对话记录：技术与人文的关系', excerpt: '技术不中立，它塑造我们思考的方式。', tags: ['对话', '技术'] },
  { title: '茶叙：关于慢生活', excerpt: '慢不是低效，慢是一种主体性的选择。', tags: ['对话', '慢生活'] },
];

const ELEVATION_DOC_POOL = [
  { title: '升维记录：稀缺性模型', excerpt: '从注意力稀缺、时间稀缺、资源稀缺中提炼出统一的稀缺性思维模型。', tags: ['升维', '思维模型'] },
  { title: '元知识：反馈回路', excerpt: '正反馈、负反馈、延迟反馈——所有系统行为的底层逻辑。', tags: ['升维', '系统思维'] },
  { title: '摘要：注意力专题九卡合一', excerpt: '将九张注意力相关卡片整合为注意力管理的系统框架。', tags: ['升维', '注意力'] },
  { title: '思维模型：权衡与取舍', excerpt: '所有决策本质上都是在多个维度间权衡，不存在最优解。', tags: ['升维', '决策'] },
];

const DAILY_DOC_POOL = [
  { title: '晨间笔记：醒来的第一个念头', excerpt: '今天醒来想到的第一件事是……', tags: ['日记'] },
  { title: '散步随想', excerpt: '傍晚散步时的几个想法碎片。', tags: ['日记', '散步'] },
  { title: '冥想日记', excerpt: '第二十三天。念头明显减少了。', tags: ['日记', '冥想'] },
  { title: '读诗：里尔克', excerpt: '重读《给青年诗人的信》，依然震撼。', tags: ['日记', '诗歌'] },
  { title: '本周回顾', excerpt: '这一周做了什么、想了什么、感受到了什么。', tags: ['回顾'] },
];

// 生成指定月份的完整数据
function generateMonthData(year, month) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const days = [];
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(generateDayData(year, month, d));
  }
  return { year, month, days };
}

// 生成全年数据（用于热力图）
function generateYearData(year) {
  const months = [];
  let totalActiveDays = 0;
  let totalNotes = 0;
  let totalWords = 0;
  let maxStreak = 0;
  let currentStreak = 0;

  const allDays = [];

  for (let m = 1; m <= 12; m++) {
    const monthData = generateMonthData(year, m);
    months.push(monthData);
    monthData.days.forEach(day => {
      if (!day.isFuture) {
        allDays.push(day);
        if (day.intensity > 0) {
          totalActiveDays++;
          totalNotes += day.noteCount;
          totalWords += day.totalWords;
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
      }
    });
  }

  // 计算当前连续思考天数
  const today = new Date();
  let streak = 0;
  for (let i = allDays.length - 1; i >= 0; i--) {
    if (allDays[i].intensity > 0) streak++;
    else break;
  }

  return {
    year,
    months,
    allDays,
    stats: {
      totalActiveDays,
      totalNotes,
      totalWords,
      maxStreak,
      currentStreak: streak,
    },
  };
}

// 月度统计
function getMonthStats(monthData) {
  const activeDays = monthData.days.filter(d => d.intensity > 0 && !d.isFuture).length;
  const totalNotes = monthData.days.reduce((sum, d) => sum + d.noteCount, 0);
  const totalWords = monthData.days.reduce((sum, d) => sum + d.totalWords, 0);
  const elevationDays = monthData.days.filter(d => d.intensity >= 4).length;

  // 计算当前 streak
  let streak = 0;
  const pastDays = monthData.days.filter(d => !d.isFuture);
  for (let i = pastDays.length - 1; i >= 0; i--) {
    if (pastDays[i].intensity > 0) streak++;
    else break;
  }

  return {
    activeDays,
    totalNotes,
    totalWords,
    elevationDays,
    currentStreak: streak,
    totalDays: pastDays.length,
  };
}

// 初始数据：当前月份
const TODAY = new Date();
const CURRENT_YEAR = TODAY.getFullYear();
const CURRENT_MONTH = TODAY.getMonth() + 1;
const CURRENT_DAY = TODAY.getDate();
const CURRENT_YEAR_DATA = generateYearData(CURRENT_YEAR);

Object.assign(window, {
  INTENSITY_FACTORS,
  COLOR_SCHEMES,
  generateDayData,
  generateMonthData,
  generateYearData,
  getMonthStats,
  CURRENT_YEAR,
  CURRENT_MONTH,
  CURRENT_DAY,
  CURRENT_YEAR_DATA,
});
