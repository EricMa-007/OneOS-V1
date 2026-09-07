// ============================================
// 可控零打扰社交系统 模拟数据
// ============================================

// 分组
const SOCIAL_GROUPS = [
  {
    id: 'g-core',
    name: '核心圈',
    description: '最亲近的家人与挚友',
    color: '#5A7A4E',
    priority: 1,
    window: {
      type: 'daily',
      time: '19:00-20:00',
      days: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    },
    allowEmergency: true,
    contentPermissions: ['text', 'image', 'file', 'voice'],
  },
  {
    id: 'g-coop',
    name: '合作圈',
    description: '工作与合作伙伴',
    color: '#4F46E5',
    priority: 2,
    window: {
      type: 'weekly',
      time: '18:00-19:00',
      days: ['周二', '周四'],
    },
    allowEmergency: true,
    contentPermissions: ['text', 'image', 'file'],
  },
  {
    id: 'g-interest',
    name: '兴趣圈',
    description: '因共同兴趣相识的朋友',
    color: '#B56B3A',
    priority: 3,
    window: {
      type: 'weekly',
      time: '20:00-21:00',
      days: ['周六'],
    },
    allowEmergency: false,
    contentPermissions: ['text', 'image'],
  },
];

// 联系人
const SOCIAL_CONTACTS = [
  {
    id: 'u-001', name: '苏晚晴', avatar: '苏',
    groups: ['g-core'],
    role: '妻子 · 人生同路人',
    customRule: false,
    effectiveRule: { source: '分组（核心圈）', window: '每日 19:00-20:00' },
    hasEmergencyAccess: true,
    lastContact: '昨天',
    messageCount: 24,
  },
  {
    id: 'u-002', name: '马行远', avatar: '行',
    groups: ['g-core'],
    role: '弟弟 · 创业伙伴',
    customRule: false,
    effectiveRule: { source: '分组（核心圈）', window: '每日 19:00-20:00' },
    hasEmergencyAccess: true,
    lastContact: '3天前',
    messageCount: 18,
  },
  {
    id: 'u-003', name: '林知秋', avatar: '林',
    groups: ['g-core', 'g-interest'],
    role: '挚友 · 哲学同好',
    customRule: true,
    effectiveRule: { source: '个体规则', window: '每周日 20:00-22:00' },
    customWindow: {
      type: 'weekly',
      time: '20:00-22:00',
      days: ['周日'],
    },
    hasEmergencyAccess: true,
    lastContact: '上周',
    messageCount: 31,
  },
  {
    id: 'u-004', name: '陈屿白', avatar: '陈',
    groups: ['g-coop'],
    role: '投资人 · OneOS 天使轮',
    customRule: false,
    effectiveRule: { source: '分组（合作圈）', window: '周二、四 18:00-19:00' },
    hasEmergencyAccess: true,
    lastContact: '5天前',
    messageCount: 12,
  },
  {
    id: 'u-005', name: '何思齐', avatar: '何',
    groups: ['g-coop'],
    role: '合伙人 · 产品负责',
    customRule: false,
    effectiveRule: { source: '分组（合作圈）', window: '周二、四 18:00-19:00' },
    hasEmergencyAccess: false,
    lastContact: '今天',
    messageCount: 45,
  },
  {
    id: 'u-006', name: '方墨言', avatar: '方',
    groups: ['g-coop', 'g-interest'],
    role: '设计师 · 视觉合作',
    customRule: true,
    effectiveRule: { source: '个体规则', window: '每周三 15:00-16:00' },
    customWindow: {
      type: 'weekly',
      time: '15:00-16:00',
      days: ['周三'],
    },
    hasEmergencyAccess: false,
    lastContact: '上周',
    messageCount: 16,
  },
  {
    id: 'u-007', name: '沈听澜', avatar: '沈',
    groups: ['g-interest'],
    role: '书友 · 读书会成员',
    customRule: false,
    effectiveRule: { source: '分组（兴趣圈）', window: '每周六 20:00-21:00' },
    hasEmergencyAccess: false,
    lastContact: '2周前',
    messageCount: 8,
  },
  {
    id: 'u-008', name: '顾野松', avatar: '顾',
    groups: ['g-interest'],
    role: '登山同好 · 摄友',
    customRule: false,
    effectiveRule: { source: '分组（兴趣圈）', window: '每周六 20:00-21:00' },
    hasEmergencyAccess: false,
    lastContact: '上个月',
    messageCount: 5,
  },
  {
    id: 'u-009', name: '周予安', avatar: '周',
    groups: [],
    role: '陌生人',
    isStranger: true,
    customRule: false,
    effectiveRule: { source: '全局规则', window: '每周日 20:00-21:00' },
    hasEmergencyAccess: false,
    lastContact: '今天',
    messageCount: 1,
  },
  {
    id: 'u-010', name: '谢微明', avatar: '谢',
    groups: [],
    role: '陌生人 · 公众号读者',
    isStranger: true,
    customRule: false,
    effectiveRule: { source: '全局规则', window: '每周日 20:00-21:00' },
    hasEmergencyAccess: false,
    lastContact: '3天前',
    messageCount: 2,
  },
];

// 全局规则
const GLOBAL_SOCIAL_RULE = {
  receiveFromStrangers: false, // 陌生人消息默认关闭
  window: {
    type: 'weekly',
    time: '20:00-21:00',
    days: ['周日'],
  },
  contentPermissions: ['text'],
  allowEmergency: false,
  note: '所有非白名单联系人的消息遵循此规则',
};

// 静默收件箱消息
const INBOX_MESSAGES = [
  {
    id: 'msg-001',
    from: 'u-005', // 何思齐
    topic: '产品路线图讨论',
    content: `崇海，

关于 Q4 的产品路线图，我整理了一下思路：

## 优先级排序

1. **知识升维系统** — 核心差异化功能，必须先做
2. **AI 共生体** — 用户粘性的关键
3. **社交系统** — 先做最小可用，验证模式
4. **日历系统** — 已有基础，增量迭代

## 需要你定夺的几件事

- 升维系统的 AI 辅助是内建还是外置？
- 社交板块要不要在 v1.0 就开放？
- 定价策略是订阅还是买断？

等你有空了我们聊聊。

何思齐`,
    time: '今天 14:32',
    group: 'g-coop',
    isUrgent: false,
    status: 'unread', // unread / read / archived
    inWindow: false, // 是否在窗口内
    windowLabel: '周二、四 18:00-19:00',
  },
  {
    id: 'msg-002',
    from: 'u-001', // 苏晚晴
    topic: '周末安排',
    content: `亲爱的：

周末想和你一起去一趟径山寺。

听说秋天的银杏已经黄了，山上的茶馆也开了。我们可以上午出发，下午回来，晚上还能一起做饭。

你看这周六如何？

晚晴`,
    time: '今天 09:15',
    group: 'g-core',
    isUrgent: false,
    status: 'read',
    inWindow: false,
    windowLabel: '每日 19:00-20:00',
  },
  {
    id: 'msg-003',
    from: 'u-003', // 林知秋
    topic: '关于《存在与时间》的读书笔记',
    content: `崇海，

刚读完《存在与时间》第一篇的第二节，有些想法想和你聊聊。

## 关于"在世"的理解

海德格尔说"此在在世"，我觉得这个"在"不是空间意义上的在里面，而是一种**牵挂式的存在**。

> 人不是一个主体面对着一个客体世界，
> 而是人本身就已经在世界中了。

这点和你一直在说的 [[知识升维]] 有一个奇妙的呼应：知识不是"拥有"的东西，而是你"存在"的方式。

## 一个问题

你觉得 OneOS 中的知识图谱，最终是一个"工具"，还是一种"存在方式"？

这个问题可能有点玄，但我觉得它决定了产品最终的形态。

等你有空回复。

知秋`,
    time: '昨天 22:48',
    group: 'g-interest',
    isUrgent: false,
    status: 'unread',
    inWindow: false,
    windowLabel: '每周日 20:00-22:00',
  },
  {
    id: 'msg-004',
    from: 'u-004', // 陈屿白
    topic: '【紧急】下周二的会改期',
    content: `崇海：

紧急通知——下周二的董事会因为几个 LP 的时间冲突，需要改期。

**新的时间：下周四下午 14:00**

地点不变，还是老地方。

请尽快确认你是否可以参加。如果时间有冲突，我再协调。

陈屿白`,
    time: '昨天 16:20',
    group: 'g-coop',
    isUrgent: true,
    status: 'unread',
    inWindow: false,
    windowLabel: '周二、四 18:00-19:00',
  },
  {
    id: 'msg-005',
    from: 'u-009', // 周予安（陌生人）
    topic: '关于 OneOS 的一些想法',
    content: `马先生您好：

我是您公众号的读者，关注 OneOS 的设计思路有一段时间了。

有一个想法想分享给您：

> 既然 OneOS 的核心是知识图谱，
> 那么社交为什么不能也是图谱的一部分？

我理解的社交，不应该是单独的功能模块，而应该是知识图谱向外延伸的自然结果——人与人因为共同的知识节点而相遇。

不知道您怎么看这个思路？

冒昧来信，打扰了。

周予安`,
    time: '今天 11:05',
    group: null,
    isUrgent: false,
    status: 'unread',
    inWindow: false,
    windowLabel: '每周日 20:00-21:00',
    isFromStranger: true,
  },
  {
    id: 'msg-006',
    from: 'u-006', // 方墨言
    topic: '升维页面的视觉方案',
    content: `崇海：

升维板块的视觉方向我做了两个版本，说一下我的思路：

## 方案 A：漏斗金字塔

- 从上到下收窄，视觉上有"浓缩"的感觉
- 每层颜色递进，有仪式感
- 缺点：和常见的转化漏斗太像，缺少独特性

## 方案 B：同心圆波纹

- 从中心向外扩散，像水面涟漪
- 每一圈代表一个维度，越往外越扩散
- 缺点：数量表达不直观

我个人倾向于方案 A 的变体——用漏斗的结构，但在质感上做纸质/卡片化的处理，和整体风格更统一。

你怎么看？

方墨言`,
    time: '3天前',
    group: 'g-coop',
    isUrgent: false,
    status: 'archived',
    inWindow: true,
    windowLabel: '每周三 15:00-16:00',
  },
  {
    id: 'msg-007',
    from: 'u-002', // 马行远
    topic: '服务器迁移完成',
    content: `哥：

服务器已经全部迁移完成，数据校验通过。

几个关键指标：
- 响应延迟降低了 35%
- 存储成本降低了 20%
- 备份策略从每日改为实时增量

下周可以做一次全量压测，看看峰值表现。

行远`,
    time: '2天前',
    group: 'g-core',
    isUrgent: false,
    status: 'read',
    inWindow: true,
    windowLabel: '每日 19:00-20:00',
  },
  {
    id: 'msg-008',
    from: 'u-007', // 沈听澜
    topic: '下个月读什么',
    content: `老陈：

下个月的读书会上册你定了吗？

我推荐读**韩炳哲的《倦怠社会》**——和我们最近一直在讨论的工具异化、深度工作这些话题很搭。

篇幅不长，一周就能读完，但很有嚼头。

你觉得呢？

听澜`,
    time: '上周',
    group: 'g-interest',
    isUrgent: false,
    status: 'archived',
    inWindow: false,
    windowLabel: '每周六 20:00-21:00',
  },
];

// 社交统计
const SOCIAL_STATS = {
  thisWeek: {
    totalMinutes: 128,
    messageCount: 15,
    contactCount: 5,
    deepConversations: 2,
  },
  lastWeek: {
    totalMinutes: 96,
    messageCount: 12,
    contactCount: 4,
    deepConversations: 1,
  },
  groupBreakdown: [
    { group: '核心圈', minutes: 65, percentage: 51 },
    { group: '合作圈', minutes: 42, percentage: 33 },
    { group: '兴趣圈', minutes: 21, percentage: 16 },
  ],
  windowCompliance: 82, // 时间窗口遵守率
  avgResponseTime: '4.2小时', // 平均响应时间
};

// 当前是否在窗口内（模拟判断）
function isCurrentlyInWindow(window) {
  // 模拟：当前是周三下午，判断哪些窗口内
  // 核心圈（每日19-20点）：不在
  // 合作圈（周二、四18-19点）：不在
  // 兴趣圈（周六20-21点）：不在
  // 林知秋的个体窗口（周日20-22点）：不在
  // 方墨言的个体窗口（周三15-16点）：假设当前14:32不在
  return false;
}

Object.assign(window, {
  SOCIAL_GROUPS,
  SOCIAL_CONTACTS,
  GLOBAL_SOCIAL_RULE,
  INBOX_MESSAGES,
  SOCIAL_STATS,
  isCurrentlyInWindow,
});
