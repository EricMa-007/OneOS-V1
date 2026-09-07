// ============================================
// 语音交互系统 模拟数据
// ============================================

// 语音转写示例
const TRANSCRIPT_EXAMPLES = [
  {
    id: 'tr-001',
    title: '关于知识升维的思考',
    scene: '深度思考',
    duration: '2:34',
    timestamp: '今天 09:15',
    speaker: '我',
    text: `刚才散步的时候突然想到一个问题：知识升维这件事，到底升的是什么？

我之前一直以为升维就是把零散的知识点，组装成一个更大的知识结构。就像把积木拼成房子。

但是今天早上突然意识到，可能不是这样。

升维升的不是知识的量，而是**认知的颗粒度**。

什么意思呢？就是说，低维的时候，你看到的是一个个孤立的概念，它们之间是平的。你觉得A和B没关系，C和D也没关系。

升维之后呢，你看到的不是更多的概念，而是概念之间的**关系网络**突然变得清晰了。原来A和B之间有三层联系，原来C和D是同一个东西在不同维度上的投影。

就像你从二维平面走到三维空间，不是多了一个方向那么简单——是整个世界的复杂度都变了。

那升维是怎么发生的？

我觉得不是靠学更多东西。是靠**反复咀嚼**。

同一堆知识，你隔一段时间回去看，理解的深度就不一样。不是因为知识变了，是因为你变了。

嗯...这个想法值得记下来，回头可以好好写写。`,
  },
  {
    id: 'tr-002',
    title: '给晚晴的一段话',
    scene: '与家人沟通',
    duration: '1:45',
    timestamp: '昨天 21:30',
    speaker: '我',
    recipient: '苏晚晴',
    text: `晚晴，

今天去了趟径山寺，银杏真的黄了。站在那棵千年银杏下面的时候，突然特别想你。

你还记得我们第一次去径山吗？那时候你还在读博士，我们从杭州城里坐了两个小时的公交车才到。那天也是秋天，你说银杏叶落下来的时候，像金色的雨。

时间过得真快啊。

这两天我在想OneOS里的语音功能，想着如果有一天，我们老了，眼睛看不清字了，还能用声音交流。声音这个东西真的很奇妙——文字是永恒的，但声音里有温度。有停顿，有呼吸，有情绪。

晚上回来给我读一段书吧。随便什么都行。就是想听你说说话。

爱你。`,
  },
  {
    id: 'tr-003',
    title: '产品评审会议纪要',
    scene: '工作讨论',
    duration: '4:12',
    timestamp: '3天前',
    speaker: '我 + 何思齐',
    text: `## 产品评审 — 升维板块

**崇海：**
升维板块的核心交互我想再打磨一下。现在的漏斗模型视觉上没问题，但用户感知不到"升维"这个动作本身。

**何思齐：**
你的意思是，缺少仪式感？

**崇海：**
对，就是这个词。仪式感。

升维不应该是点一下按钮就完成的事情。它应该是一个过程——用户看着自己的笔记被重新组织、被提炼、被升维。这个过程本身就是价值。

**何思齐：**
明白了。那我们可以做一个渐进式的动画：从底层原始笔记开始，一层层向上浓缩，最后在顶端形成升维后的精华。

**崇海：**
嗯，而且要有停顿。不能太快。就像泡茶一样，得等。

**何思齐：**
用户可以在这个过程中做什么？

**崇海：**
什么都不用做。就看着。

现代人太着急了，什么都想要立刻有结果。升维这个功能就是要反其道而行之——让你慢下来，让你等，让你在等待中体会"提炼"这个过程本身。

**何思齐：**
有意思。那我们把升维的动画做到8秒左右？

**崇海：**
12秒。

**何思齐：**
好，12秒。`,
  },
  {
    id: 'tr-004',
    title: '灵感：时间才是王者',
    scene: '灵感记录',
    duration: '0:48',
    timestamp: '上周',
    speaker: '我',
    text: `突然想通了一件事：

在知识图谱里，话题才是中心，人只是节点。
在人生里，时间才是王者，人只是过客。

人和知识一样，都是时间河流里的岛屿。

这句话可以当书名。`,
  },
];

// 音色库
const VOICE_LIBRARY = [
  {
    id: 'v-system-male',
    name: '温言',
    type: 'system',
    gender: 'male',
    style: '温和男声',
    description: '温和沉稳，适合长时间聆听',
    color: '#5A7A4E',
    isOpen: true,
    usageCount: 128,
  },
  {
    id: 'v-system-female',
    name: '清语',
    type: 'system',
    gender: 'female',
    style: '知性女声',
    description: '清澈知性，适合知识类内容',
    color: '#9B6BA0',
    isOpen: true,
    usageCount: 256,
  },
  {
    id: 'v-system-deep',
    name: '沉舟',
    type: 'system',
    gender: 'male',
    style: '沉稳男声',
    description: '低沉醇厚，适合文学与哲思',
    color: '#4F46E5',
    isOpen: true,
    usageCount: 64,
  },
  {
    id: 'v-personal-me',
    name: '我的声音',
    type: 'personal',
    owner: '自己',
    style: '本人音色',
    description: '你自己的声音克隆',
    color: '#B56B3A',
    isOpen: true,
    openScope: '核心圈', // 所有人/核心圈/不开放
    usageCount: 42,
    recordedAt: '2026-02-14',
  },
  {
    id: 'v-personal-wanqing',
    name: '晚晴的声音',
    type: 'personal',
    owner: '苏晚晴',
    style: '本人音色',
    description: '苏晚晴授权的个人音色',
    color: '#D48A5A',
    isOpen: true,
    openScope: '仅亲密关系',
    usageCount: 36,
    recordedAt: '2026-03-01',
  },
];

// 沟通闭环演示对话
const VOICE_CONVERSATION_DEMO = [
  {
    step: 1,
    title: '用户按住说话',
    description: '你对OneOS说出一段关于人生的思考',
    type: 'record',
    speaker: '我',
    avatar: '我',
    content: '晚晴，今天去了趟径山寺...',
    duration: '1:45',
  },
  {
    step: 2,
    title: '实时转写为文字',
    description: 'ASR 语音识别，边说边转，自动标点分段',
    type: 'asr',
    text: '晚晴，\n\n今天去了趟径山寺，银杏真的黄了。站在那棵千年银杏下面的时候，突然特别想你。\n\n你还记得我们第一次去径山吗？...',
  },
  {
    step: 3,
    title: '生成 Markdown 文档',
    description: '自动包装为 MD，归档到「私人」话题',
    type: 'markdown',
    title: '2026-03-18 给晚晴的一段话',
    preview: '# 给晚晴的一段话\n\n> 2026年3月18日 21:30 · 语音转写\n\n今天去了趟径山寺...',
  },
  {
    step: 4,
    title: '进入对方静默收件箱',
    description: '消息静默送达，不打扰。在对方的时间窗口内可见',
    type: 'deliver',
    recipient: '苏晚晴',
    status: '静默送达 · 等待对方查看',
  },
  {
    step: 5,
    title: '对方用你的音色朗读',
    description: '晚晴打开后，可用你的声音（如果开放音色）朗读这段文字',
    type: 'tts',
    voice: '我的声音',
    listener: '苏晚晴',
  },
];

// 默认设置
const VOICE_SETTINGS = {
  asr: {
    language: '中文普通话',
    autoPunctuation: true,
    filterSensitiveWords: false,
    audioRetention: '转写后删除', // 转写后删除 / 保留7天 / 永久保留
  },
  tts: {
    defaultVoice: '清语',
    defaultVoiceId: 'v-system-female',
    speechRate: 1.0, // 0.5 - 2.0
    pitch: 1.0,
    autoReadNewMessages: false,
  },
  privacy: {
    voiceCloneConsent: true,
    deleteAfterTranscribe: true,
    dataUsedForTraining: false,
    localProcessing: true,
  },
};

Object.assign(window, {
  TRANSCRIPT_EXAMPLES,
  VOICE_LIBRARY,
  VOICE_CONVERSATION_DEMO,
  VOICE_SETTINGS,
});
