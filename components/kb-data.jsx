// ============================================
// 知识库模拟数据 —— 文件树 + 笔记内容 + 标签 + 双链
// ============================================

const KNOWLEDGE_BASE = {
  // 文件夹树
  folders: [
    {
      id: 'f-social',
      name: '话题 · 社交重塑',
      expanded: true,
      children: [
        { id: 'n-social-1', name: '数字时代的孤独与连接.md', type: 'file' },
        { id: 'n-social-2', name: '弱关系的价值.md', type: 'file' },
        { id: 'n-social-3', name: '深度对话的艺术.md', type: 'file' },
        { id: 'n-social-4', name: '从社交媒介到社交自觉.md', type: 'file' },
      ],
    },
    {
      id: 'f-oneos',
      name: '话题 · OneOS 架构',
      expanded: true,
      children: [
        { id: 'n-oneos-1', name: '知识升维的四层结构.md', type: 'file' },
        { id: 'n-oneos-2', name: '本地优先哲学.md', type: 'file' },
        { id: 'n-oneos-3', name: '个人知识图谱 v2.0 架构.md', type: 'file' },
        { id: 'n-oneos-4', name: '主体性至上的设计原则.md', type: 'file' },
        {
          id: 'f-oneos-core',
          name: '核心模块',
          expanded: false,
          children: [
            { id: 'n-oneos-c1', name: '编辑器内核设计.md', type: 'file' },
            { id: 'n-oneos-c2', name: '双向链接解析算法.md', type: 'file' },
          ],
        },
      ],
    },
    {
      id: 'f-philosophy',
      name: '话题 · 存在主义',
      expanded: false,
      children: [
        { id: 'n-philo-1', name: '《存在与时间》读后：烦与畏.md', type: 'file' },
        { id: 'n-philo-2', name: '萨特的自由观.md', type: 'file' },
        { id: 'n-philo-3', name: '注意力经济下的主体性守护.md', type: 'file' },
        { id: 'n-philo-4', name: '本真与沉沦：海德格尔的日常批判.md', type: 'file' },
      ],
    },
    {
      id: 'f-music',
      name: '话题 · 音乐',
      expanded: false,
      children: [
        { id: 'n-music-1', name: '巴赫的数学之美.md', type: 'file' },
        { id: 'n-music-2', name: '贝多芬晚期奏鸣曲的精神世界.md', type: 'file' },
        { id: 'n-music-3', name: '爵士乐中的对话哲学.md', type: 'file' },
      ],
    },
    {
      id: 'f-daily',
      name: '日常思考',
      expanded: true,
      children: [
        { id: 'n-daily-1', name: '冥想日记 · 第二十三天.md', type: 'file' },
        { id: 'n-daily-2', name: '晨间笔记：关于专注.md', type: 'file' },
        { id: 'n-daily-3', name: '散步随想：时间与流动.md', type: 'file' },
        { id: 'n-daily-4', name: '读诗：里尔克《秋日》.md', type: 'file' },
        { id: 'n-daily-5', name: '关于习惯的思考.md', type: 'file' },
      ],
    },
    {
      id: 'f-archive',
      name: '归档',
      expanded: false,
      children: [
        { id: 'n-arch-1', name: '2024年度回顾.md', type: 'file' },
        { id: 'n-arch-2', name: '旧版知识系统笔记.md', type: 'file' },
      ],
    },
  ],

  // 笔记内容（按ID索引）
  notes: {
    // ===== OneOS 架构 · 当前打开的主笔记（内容最丰富） =====
    'n-oneos-1': {
      id: 'n-oneos-1',
      title: '知识升维的四层结构',
      folder: '话题 · OneOS 架构',
      createdAt: '2026-07-15',
      updatedAt: '2026-08-19 14:22',
      wordCount: 1847,
      tags: ['方法论', '知识管理', 'OneOS'],
      backlinks: ['n-oneos-3', 'n-oneos-4', 'n-daily-2', 'n-social-4'],
      content: `---
title: 知识升维的四层结构
tags: [方法论, 知识管理, OneOS]
date: 2026-07-15
updated: 2026-08-19
---

# 知识升维的四层结构

知识不是简单地"记住"，而是经过大脑的加工，逐层**内化**、**抽象**、**升维**，最终成为可以迁移的思维模型。这个过程，我把它拆解为四个层次。

## 四层模型

### 第一层：原文（Source）
原始输入——书籍、文章、对话记录、播客、视频。

> 这一层是"别人的东西"。你读了一本书，书的内容是作者的，不是你的。哪怕你做了高亮、写了批注，它仍然只是**你与作者的对话记录**，还没有成为你认知结构的一部分。

**特征：**
- 信息量大，但密度低
- 依赖外部载体
- 没有经过你的思维加工
- 容易遗忘

### 第二层：卡片（Card）
将原文中的核心概念拆解为**原子化**的知识点，每张卡片只讲一件事。

这一层的关键是**用自己的话重述**。如果只是复制粘贴原文，那卡片只是"搬运工"，没有产生认知增量。

\`\`\`python
# 好的卡片结构示例
class KnowledgeCard:
    def __init__(self, concept, source, my_understanding):
        self.concept = concept           # 核心概念
        self.source = source             # 来源
        self.my_understanding = my_understanding  # 我的理解
        self.connections = []            # 关联卡片
\`\`\`

[[个人知识图谱 v2.0 架构]] 中详细讨论了卡片之间的连接方式。

### 第三层：摘要（Summary）
跨卡片的**主题归纳**与结构化总结。

当一个主题下积累了足够多的卡片，就需要主动地做一次"聚类整理"——找出它们之间的结构关系，形成一张"地图"。

| 层次 | 关键动作 | 产出物 | 认知难度 |
|------|----------|--------|----------|
| 原文 | 收集、阅读 | 笔记、高亮 | ⭐ |
| 卡片 | 拆解、重述 | 原子卡片 | ⭐⭐⭐ |
| 摘要 | 归纳、结构化 | 主题地图 | ⭐⭐⭐⭐ |
| 元知识 | 抽象、迁移 | 思维模型 | ⭐⭐⭐⭐⭐ |

### 第四层：元知识（Meta）
升维后的**思维模型**与第一性原理。

这是最高层，也是最难的一层。当你在多个不同领域都完成了"卡片→摘要"的过程，突然发现它们背后的结构是相通的——那个共通的结构，就是**元知识**。

比如：
- 从 [[注意力经济下的主体性守护]] 中提炼出的"注意力稀缺性原理"
- 从 [[深度对话的艺术]] 中提炼出的"真诚沟通模型"
- 从 [[巴赫的数学之美]] 中提炼出的"模式演化逻辑"

这些看似来自不同领域，但底层可能是同一个东西。

## 为什么要升维

### 对抗遗忘
人的工作记忆容量极其有限。如果信息都停留在"原文"层，那你拥有的只是一座**信息坟墓**——东西都在，但你用不上。

### 提升思考效率
当知识被压缩成"元知识"，你思考问题的单位就从"句子"变成了"模型"。这就像从汇编语言升到高级语言——表达同样的意思，用的代码量少了一个数量级。

### 发现跨领域连接
真正的洞见往往出现在**领域的交界处**。只有当知识被抽象到足够高的层次，你才能看到物理学和心理学的共通之处，音乐和数学的深层结构。

## 我的实践

- [x] 建立了 1247 篇原文笔记
- [x] 拆解了 386 张知识卡片
- [ ] 完成所有重要主题的摘要整理（当前约 8%）
- [ ] 提炼可迁移的元知识模型（27 个，还在增长）

## 相关笔记

- [[个人知识图谱 v2.0 架构]] —— 技术层面的实现
- [[主体性至上的设计原则]] —— 设计哲学
- [[冥想日记 · 第二十三天]] —— 实践中的体悟

---

*持续更新中。这是 OneOS 的核心方法论之一。*
`,
    },

    // ===== 其他笔记（精简内容，用于展示） =====
    'n-oneos-2': {
      id: 'n-oneos-2',
      title: '本地优先哲学',
      folder: '话题 · OneOS 架构',
      createdAt: '2026-06-20',
      updatedAt: '2026-08-15 09:30',
      wordCount: 923,
      tags: ['哲学', 'OneOS', '本地优先'],
      backlinks: ['n-oneos-4', 'n-oneos-1'],
      content: `# 本地优先哲学

## 为什么本地优先

数据是你的记忆。把记忆存在别人的服务器上，就等于把大脑的一部分租了出去。

> 如果工具停服了，你的记忆也跟着消失。这不是工具，这是**精神租赁**。

## 本地优先的三层含义

### 第一层：数据在本地
所有笔记都是纯文本 .md 文件，存在你自己的电脑上。

### 第二层：格式开放
Markdown 是通用格式，任何编辑器都能打开。没有平台锁死。

### 第三层：主权在你
要不要同步、同步到哪、和谁分享——决定权永远在你手里。

[[知识升维的四层结构]] 中讨论的知识内化过程，前提是你对这些知识拥有**完全的主权**。
`,
    },

    'n-oneos-3': {
      id: 'n-oneos-3',
      title: '个人知识图谱 v2.0 架构',
      folder: '话题 · OneOS 架构',
      createdAt: '2026-07-01',
      updatedAt: '2026-08-19 15:30',
      wordCount: 1456,
      tags: ['技术', '知识图谱', 'OneOS'],
      backlinks: ['n-oneos-1', 'n-oneos-c2'],
      content: `# 个人知识图谱 v2.0 架构

## 技术选型

- 数据层：纯 Markdown + Frontmatter
- 解析层：本地解析器，提取标题、标签、双向链接
- 渲染层：力导向图 + 层级视图

## 核心数据结构

\`\`\`javascript
interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  links: string[];     // 指向其他笔记的 [[双链]]
  backlinks: string[]; // 哪些笔记链接了它
}
\`\`\`

[[知识升维的四层结构]] 是图谱设计的理论基础。
`,
    },

    'n-oneos-4': {
      id: 'n-oneos-4',
      title: '主体性至上的设计原则',
      folder: '话题 · OneOS 架构',
      createdAt: '2026-05-28',
      updatedAt: '2026-08-10 16:45',
      wordCount: 786,
      tags: ['设计', '哲学', 'OneOS'],
      backlinks: ['n-oneos-1', 'n-oneos-2', 'n-philo-3'],
      content: `# 主体性至上的设计原则

## 核心原则

工具是为人服务的，不是反过来。

### 零打扰铁律
- 没有通知
- 没有推送
- 没有红点
- 没有弹窗

### 用户永远是主体
- 算法不替你做决定
- 不做"猜你喜欢"
- 不做无限流
- 你想看什么，自己选

[[本地优先哲学]] 是这一原则的技术基石。
[[注意力经济下的主体性守护]] 是这一原则的时代背景。
`,
    },

    'n-oneos-c1': {
      id: 'n-oneos-c1',
      title: '编辑器内核设计',
      folder: '核心模块',
      createdAt: '2026-07-20',
      updatedAt: '2026-08-12 11:00',
      wordCount: 645,
      tags: ['技术', '编辑器', 'OneOS'],
      backlinks: ['n-oneos-3'],
      content: `# 编辑器内核设计

基于 contentEditable + Markdown 解析的所见即所得编辑器。

## 核心特性
- WYSIWYG / 源码模式切换
- 双向链接实时解析
- 自动保存（30秒间隔）
- 键盘快捷键全覆盖
`,
    },

    'n-oneos-c2': {
      id: 'n-oneos-c2',
      title: '双向链接解析算法',
      folder: '核心模块',
      createdAt: '2026-07-22',
      updatedAt: '2026-08-08 14:20',
      wordCount: 534,
      tags: ['技术', '算法', 'OneOS'],
      backlinks: ['n-oneos-3'],
      content: `# 双向链接解析算法

\`\`\`regex
[[([^]]+)]]
\`\`\`

遍历所有 .md 文件，提取 [[双链]] 语法，构建反向索引。
`,
    },

    // ===== 社交重塑 =====
    'n-social-1': {
      id: 'n-social-1',
      title: '数字时代的孤独与连接',
      folder: '话题 · 社交重塑',
      createdAt: '2026-03-15',
      updatedAt: '2026-08-05 20:15',
      wordCount: 1203,
      tags: ['社会学', '孤独', '数字时代'],
      backlinks: ['n-social-4', 'n-philo-3'],
      content: `# 数字时代的孤独与连接

## 悖论

我们拥有人类历史上最发达的连接工具，却也经历着前所未有的孤独。

## 原因分析

1. **浅连接泛滥**：点赞、评论、表情包——量多质低
2. **深度对话稀缺**：真正的理解需要时间和专注
3. **表演性社交**：朋友圈里的人生，是精心策划的展示

[[深度对话的艺术]] 讨论了如何重建深度连接。
`,
    },

    'n-social-2': {
      id: 'n-social-2',
      title: '弱关系的价值',
      folder: '话题 · 社交重塑',
      createdAt: '2026-04-10',
      updatedAt: '2026-07-28 10:30',
      wordCount: 678,
      tags: ['社会学', '关系', '网络'],
      backlinks: ['n-social-1'],
      content: `# 弱关系的价值

格兰诺维特的"弱关系的力量"理论：找工作时，帮助你的往往不是密友，而是熟人。

## 在知识工作中的体现
- 新想法往往来自跨界的弱连接
- 强关系提供情感支持，弱关系提供信息增量
`,
    },

    'n-social-3': {
      id: 'n-social-3',
      title: '深度对话的艺术',
      folder: '话题 · 社交重塑',
      createdAt: '2026-05-05',
      updatedAt: '2026-08-18 21:00',
      wordCount: 892,
      tags: ['沟通', '关系', '对话'],
      backlinks: ['n-social-1', 'n-social-4'],
      content: `# 深度对话的艺术

## 什么是深度对话

不是信息交换，是**灵魂的碰撞**。

> 好的对话结束后，你不是多知道了一些事，而是变成了一个稍微不一样的人。

## 深度对话的条件
- 双方都有表达的意愿
- 有足够的时间
- 有安全感——不被评判
- 专注——手机放在一边

[[知识升维的四层结构]] 中提到，对话是知识升维的重要催化剂。
`,
    },

    'n-social-4': {
      id: 'n-social-4',
      title: '从社交媒介到社交自觉',
      folder: '话题 · 社交重塑',
      createdAt: '2026-06-01',
      updatedAt: '2026-08-14 19:30',
      wordCount: 756,
      tags: ['社交媒体', '反思', '数字极简'],
      backlinks: ['n-social-1', 'n-philo-3'],
      content: `# 从社交媒介到社交自觉

## 社交媒体的问题

算法把你困在回音室里。你以为你在社交，其实你在被喂养。

## 社交自觉

- 主动选择和谁对话
- 主动安排对话的时间和深度
- 不被算法牵着走

[[知识升维的四层结构]] 的方法论也适用于社交：从被动消费（原文）到主动建构（元知识）。
`,
    },

    // ===== 存在主义 =====
    'n-philo-1': {
      id: 'n-philo-1',
      title: '《存在与时间》读后：烦与畏',
      folder: '话题 · 存在主义',
      createdAt: '2026-02-20',
      updatedAt: '2026-08-19 09:15',
      wordCount: 1567,
      tags: ['哲学', '海德格尔', '存在主义'],
      backlinks: ['n-philo-4', 'n-daily-1', 'n-philo-3'],
      content: `# 《存在与时间》读后：烦与畏

## 烦（Sorge）

此在的存在就是烦。不是心理学意义上的烦恼，而是存在论意义上的**操心**。

> 人为什么操心？因为人必须存在——你被抛入这个世界，没得选，但你必须以某种方式度过这一生。

## 畏（Angst）

畏不是怕。怕是有具体对象的，畏没有对象——畏面对的是**存在本身**。

当你在深夜突然感到莫名的焦虑，那就是畏——它揭示了你作为"被抛的存在者"的真相。

[[本真与沉沦：海德格尔的日常批判]] 中进一步讨论了"常人"如何逃避畏。
`,
    },

    'n-philo-2': {
      id: 'n-philo-2',
      title: '萨特的自由观',
      folder: '话题 · 存在主义',
      createdAt: '2026-03-10',
      updatedAt: '2026-07-15 14:00',
      wordCount: 945,
      tags: ['哲学', '萨特', '自由'],
      backlinks: ['n-philo-1'],
      content: `# 萨特的自由观

## 核心命题

人被判定为自由。不是"你可以选择自由"，而是"你不得不自由"。

> 没有上帝，没有本质，没有宿命——你除了自由，一无所有。

## 自由的重负
- 你必须为每一个选择负责
- 没有借口
- 你选择的不仅是你自己，也是在为所有人做示范
`,
    },

    'n-philo-3': {
      id: 'n-philo-3',
      title: '注意力经济下的主体性守护',
      folder: '话题 · 存在主义',
      createdAt: '2026-04-25',
      updatedAt: '2026-08-19 08:40',
      wordCount: 1123,
      tags: ['哲学', '注意力', '数字极简'],
      backlinks: ['n-oneos-4', 'n-social-4', 'n-daily-2'],
      content: `# 注意力经济下的主体性守护

## 问题

你的注意力正在被大规模收割。每一个 App 都在争夺你最宝贵的资源——**时间和注意力**。

## 这不是"自律"问题

很多人把这当成自律问题，以为靠意志力就能解决。不对——这是**存在论层面的侵蚀**。当你的注意力被别人控制，你就不再是自己生活的主体。

## 守护路径
1. 减少入口：卸载不必要的 App
2. 增加摩擦：把手机放在另一个房间
3. 重建节奏：用深度工作代替碎片化消费

[[主体性至上的设计原则]] 是这一思考在产品设计上的体现。
[[从社交媒介到社交自觉]] 是这一思考在社交领域的延伸。
`,
    },

    'n-philo-4': {
      id: 'n-philo-4',
      title: '本真与沉沦：海德格尔的日常批判',
      folder: '话题 · 存在主义',
      createdAt: '2026-03-28',
      updatedAt: '2026-07-30 16:20',
      wordCount: 876,
      tags: ['哲学', '海德格尔', '本真性'],
      backlinks: ['n-philo-1', 'n-philo-3'],
      content: `# 本真与沉沦

## 常人（das Man）

我们日常的大多数决定，都不是自己做的——是"常人"替我们做的。

- 常人看什么剧，我们看什么剧
- 常人聊什么话题，我们聊什么话题
- 常人怎么生活，我们怎么生活

## 沉沦不是贬义词

沉沦是此在的**常态**。不是坏事，是事实。但认清这个事实，才有"本真"的可能。

[[《存在与时间》读后：烦与畏]] 中讨论了"畏"如何把人从沉沦中唤醒。
`,
    },

    // ===== 音乐 =====
    'n-music-1': {
      id: 'n-music-1',
      title: '巴赫的数学之美',
      folder: '话题 · 音乐',
      createdAt: '2026-01-20',
      updatedAt: '2026-06-10 20:00',
      wordCount: 634,
      tags: ['音乐', '巴赫', '数学'],
      backlinks: ['n-music-3'],
      content: `# 巴赫的数学之美

## 赋格的艺术

一个主题，经过倒影、逆行、增值、减值，变出无限丰富的织体。这是音乐，也是数学。

> 巴赫的音乐是上帝创世的语言——用最简单的规则，生成最复杂的美。
`,
    },

    'n-music-2': {
      id: 'n-music-2',
      title: '贝多芬晚期奏鸣曲的精神世界',
      folder: '话题 · 音乐',
      createdAt: '2026-02-14',
      updatedAt: '2026-07-22 19:45',
      wordCount: 712,
      tags: ['音乐', '贝多芬', '古典'],
      backlinks: [],
      content: `# 贝多芬晚期奏鸣曲的精神世界

## 从抗争到和解

早期的贝多芬是英雄式的——和命运抗争。晚期的贝多芬超越了抗争——他和世界和解了。

op.111 的第二乐章，是人类精神能达到的最高高度之一。
`,
    },

    'n-music-3': {
      id: 'n-music-3',
      title: '爵士乐中的对话哲学',
      folder: '话题 · 音乐',
      createdAt: '2026-03-05',
      updatedAt: '2026-07-10 21:30',
      wordCount: 543,
      tags: ['音乐', '爵士', '对话'],
      backlinks: ['n-social-3'],
      content: `# 爵士乐中的对话哲学

## 即兴是最高级的对话

你说一句，我说一句，互相回应，互相激发。没有剧本，只有当下。

[[深度对话的艺术]] 中讨论的深度对话，和爵士即兴本质上是一回事。
`,
    },

    // ===== 日常思考 =====
    'n-daily-1': {
      id: 'n-daily-1',
      title: '冥想日记 · 第二十三天',
      folder: '日常思考',
      createdAt: '2026-08-19',
      updatedAt: '2026-08-19 07:00',
      wordCount: 325,
      tags: ['日记', '冥想'],
      backlinks: ['n-oneos-1'],
      content: `# 冥想日记 · 第二十三天

## 今日体验

坐了 25 分钟。呼吸比之前平稳了。

中间有一段，念头明显少了，心很静。不是"什么都不想"的空白，而是一种**清明的觉知**——念头来了，走了，我只是看着。

## 感悟

冥想不是为了获得什么，而是为了**放下**。放下对念头的追逐，放下对"我"的执着。

[[知识升维的四层结构]] 中的"元知识"层，可能需要靠冥想才能真正触达——那是一种非语言的认知方式。
`,
    },

    'n-daily-2': {
      id: 'n-daily-2',
      title: '晨间笔记：关于专注',
      folder: '日常思考',
      createdAt: '2026-08-18',
      updatedAt: '2026-08-18 07:30',
      wordCount: 289,
      tags: ['日记', '专注', '思考'],
      backlinks: ['n-philo-3'],
      content: `# 晨间笔记：关于专注

专注不是"用力"，而是"放下"。

放下手机，放下消息，放下"还有什么事没做"的焦虑——然后，专注就自然出现了。

[[注意力经济下的主体性守护]] 中讨论过这个问题。今天的体验是：专注的门槛，比我想象的低。
`,
    },

    'n-daily-3': {
      id: 'n-daily-3',
      title: '散步随想：时间与流动',
      folder: '日常思考',
      createdAt: '2026-08-17',
      updatedAt: '2026-08-17 18:00',
      wordCount: 312,
      tags: ['日记', '散步', '时间'],
      backlinks: [],
      content: `# 散步随想：时间与流动

傍晚散步，风吹着树叶在动。

突然想：时间不是河流，时间是风——你看不见它，但你能感受到它在你身上吹过。
`,
    },

    'n-daily-4': {
      id: 'n-daily-4',
      title: '读诗：里尔克《秋日》',
      folder: '日常思考',
      createdAt: '2026-08-16',
      updatedAt: '2026-08-16 20:30',
      wordCount: 256,
      tags: ['日记', '诗歌', '里尔克'],
      backlinks: [],
      content: `# 读诗：里尔克《秋日》

> 谁这时没有房屋，就不必建筑。
> 谁这时孤独，就永远孤独。

里尔克的诗，有一种冷峻的温柔。他不安慰你，但他如实告诉你真相——而真相本身就是安慰。
`,
    },

    'n-daily-5': {
      id: 'n-daily-5',
      title: '关于习惯的思考',
      folder: '日常思考',
      createdAt: '2026-08-15',
      updatedAt: '2026-08-15 22:00',
      wordCount: 398,
      tags: ['日记', '习惯', '自我管理'],
      backlinks: ['n-oneos-1'],
      content: `# 关于习惯的思考

## 习惯不是目的

很多人把"养成习惯"当成了目标，这是本末倒置。习惯是手段——它是为了让你不必每天重新决定"做不做"，从而把意志力省下来做更重要的事。

## 好的习惯
- 不依赖意志力
- 有明确的触发条件
- 足够小，小到不可能失败

[[知识升维的四层结构]] 的实践，本身就需要习惯的支撑——每天拆解卡片，每周整理摘要。
`,
    },

    // ===== 归档 =====
    'n-arch-1': {
      id: 'n-arch-1',
      title: '2024年度回顾',
      folder: '归档',
      createdAt: '2024-12-31',
      updatedAt: '2025-01-05 15:00',
      wordCount: 2340,
      tags: ['年度回顾', '归档'],
      backlinks: [],
      content: `# 2024 年度回顾

这一年，最大的变化是开始认真地构建个人知识系统。
`,
    },

    'n-arch-2': {
      id: 'n-arch-2',
      title: '旧版知识系统笔记',
      folder: '归档',
      createdAt: '2025-06-20',
      updatedAt: '2026-03-10 09:00',
      wordCount: 1245,
      tags: ['技术', '归档', '历史'],
      backlinks: [],
      content: `# 旧版知识系统笔记

使用 Notion / Obsidian 时期的一些零散想法，已迁移至 OneOS。
`,
    },
  },

  // 标签索引
  tags: [
    { name: '方法论', count: 3, color: '#3D4A6B' },
    { name: '知识管理', count: 2, color: '#3D4A6B' },
    { name: 'OneOS', count: 6, color: '#3D4A6B' },
    { name: '哲学', count: 5, color: '#B56B3A' },
    { name: '存在主义', count: 3, color: '#B56B3A' },
    { name: '海德格尔', count: 2, color: '#B56B3A' },
    { name: '萨特', count: 1, color: '#B56B3A' },
    { name: '技术', count: 5, color: '#5A7A4E' },
    { name: '知识图谱', count: 2, color: '#5A7A4E' },
    { name: '算法', count: 1, color: '#5A7A4E' },
    { name: '编辑器', count: 1, color: '#5A7A4E' },
    { name: '社会学', count: 2, color: '#C9A23F' },
    { name: '社交', count: 4, color: '#C9A23F' },
    { name: '数字极简', count: 3, color: '#C9A23F' },
    { name: '音乐', count: 3, color: '#9B6BA0' },
    { name: '日记', count: 4, color: '#6B6960' },
    { name: '冥想', count: 1, color: '#6B6960' },
    { name: '设计', count: 1, color: '#3D4A6B' },
    { name: '注意力', count: 2, color: '#C9A23F' },
    { name: '归档', count: 2, color: '#9B998F' },
  ],
};

// 默认打开的笔记
const DEFAULT_NOTE_ID = 'n-oneos-1';

Object.assign(window, { KNOWLEDGE_BASE, DEFAULT_NOTE_ID });
