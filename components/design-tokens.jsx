// ============================================
// 全局设计系统 token（JS 端）
// OneOS Core · 年轻化明亮版
// 明亮渐变 + 玻璃拟态 + 3D 立体
// ============================================

const DESIGN_TOKENS = {
  colors: {
    // 背景：明亮薄荷绿渐变
    bgPrimary: '#F0F7F4',
    bgSecondary: '#E0EFE8',
    bgTertiary: '#D0E4DA',
    bgGlass: 'rgba(255, 255, 255, 0.72)',
    bgGlassHover: 'rgba(255, 255, 255, 0.88)',
    bgGlassStrong: 'rgba(255, 255, 255, 0.92)',
    bgGlassDeep: 'rgba(255, 255, 255, 0.55)',

    // 边框
    borderGlass: 'rgba(255, 255, 255, 0.9)',
    borderGlassStrong: 'rgba(124, 111, 240, 0.25)',
    borderSubtle: 'rgba(45, 55, 72, 0.08)',
    borderMedium: 'rgba(45, 55, 72, 0.12)',

    // 文字（深灰蓝色系）
    textPrimary: '#2D3748',
    textSecondary: '#5A6577',
    textTertiary: '#8B96A8',
    textInverse: '#FFFFFF',

    // 主强调色：明亮紫色渐变
    accentPrimary: '#7C6FF0',
    accentPrimaryDeep: '#5B4FE0',
    accentPrimarySoft: 'rgba(124, 111, 240, 0.12)',
    accentPrimaryGlow: 'rgba(124, 111, 240, 0.35)',
    gradientPrimary: 'linear-gradient(135deg, #9B8EF7 0%, #7C6FF0 50%, #5B4FE0 100%)',

    // 辅助渐变色
    accentTeal: '#4ECDC4',
    accentTealDeep: '#3DB8B0',
    accentTealSoft: 'rgba(78, 205, 196, 0.15)',
    gradientTeal: 'linear-gradient(135deg, #6BE3DC 0%, #4ECDC4 50%, #3DB8B0 100%)',

    accentOrange: '#FFA07A',
    accentOrangeDeep: '#FF8C5A',
    accentOrangeSoft: 'rgba(255, 160, 122, 0.18)',
    gradientOrange: 'linear-gradient(135deg, #FFB894 0%, #FFA07A 50%, #FF8C5A 100%)',

    accentGreen: '#6BCB77',
    accentGreenDeep: '#4CAF50',
    accentGreenSoft: 'rgba(107, 203, 119, 0.15)',
    gradientGreen: 'linear-gradient(135deg, #8DDA97 0%, #6BCB77 50%, #4CAF50 100%)',

    accentPink: '#F8BBD0',
    accentPinkDeep: '#F48FB1',
    accentPinkSoft: 'rgba(248, 187, 208, 0.25)',
    gradientPink: 'linear-gradient(135deg, #FAD0DF 0%, #F8BBD0 50%, #F48FB1 100%)',

    accentGold: '#FFD93D',
    accentGoldDeep: '#FFC107',
    accentGoldSoft: 'rgba(255, 217, 61, 0.25)',
    gradientGold: 'linear-gradient(135deg, #FFE66D 0%, #FFD93D 50%, #FFC107 100%)',

    accentRed: '#FF8A80',
    accentRedSoft: 'rgba(255, 138, 128, 0.15)',

    accentLavender: '#B39DDB',
    accentLavenderSoft: 'rgba(179, 157, 219, 0.2)',
    gradientLavender: 'linear-gradient(135deg, #D1C4E9 0%, #B39DDB 50%, #9575CD 100%)',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #9B8EF7 0%, #7C6FF0 50%, #5B4FE0 100%)',
    teal: 'linear-gradient(135deg, #6BE3DC 0%, #4ECDC4 50%, #3DB8B0 100%)',
    orange: 'linear-gradient(135deg, #FFB894 0%, #FFA07A 50%, #FF8C5A 100%)',
    green: 'linear-gradient(135deg, #8DDA97 0%, #6BCB77 50%, #4CAF50 100%)',
    pink: 'linear-gradient(135deg, #FAD0DF 0%, #F8BBD0 50%, #F48FB1 100%)',
    gold: 'linear-gradient(135deg, #FFE66D 0%, #FFD93D 50%, #FFC107 100%)',
    lavender: 'linear-gradient(135deg, #D1C4E9 0%, #B39DDB 50%, #9575CD 100%)',
    mint: 'linear-gradient(135deg, #E8F5F1 0%, #D0EBE2 100%)',
    sky: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
    bg: 'linear-gradient(160deg, #F0F7F4 0%, #E0EFE8 40%, #D4E8E0 100%)',
  },
  shadows: {
    sm: '0 2px 8px rgba(45, 55, 72, 0.06)',
    md: '0 8px 24px rgba(45, 55, 72, 0.08)',
    lg: '0 16px 48px rgba(45, 55, 72, 0.12)',
    xl: '0 24px 64px rgba(45, 55, 72, 0.15)',
    glow: '0 0 24px rgba(124, 111, 240, 0.25)',
    soft: '0 4px 16px rgba(45, 55, 72, 0.05)',
    // 3D 立体阴影（多层叠加）
    '3d': '0 4px 8px rgba(45, 55, 72, 0.08), 0 16px 32px rgba(45, 55, 72, 0.08), 0 2px 4px rgba(255, 255, 255, 0.6) inset',
  },
  radius: {
    sm: '10px',
    md: '14px',
    lg: '20px',
    xl: '24px',
    xxl: '32px',
    pill: '9999px',
    full: '9999px',
  },
  fonts: {
    rounded: "'Nunito', 'Quicksand', 'PingFang SC', 'Microsoft YaHei', sans-serif",
    sans: "'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif",
    mono: "'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace",
    display: "'Poppins', 'Nunito', 'PingFang SC', sans-serif",
  },
  transition: {
    base: '300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    fast: '180ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    slow: '500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    ease: '300ms cubic-bezier(0.2, 0.8, 0.2, 1)',
  },
  space: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
    '4xl': '40px',
  },
};

// 新概念/专有名词的解释提示
const CONCEPT_HINTS = {
  'human-node': '在 OneOS 中，人和音乐、书法、AI 一样，是你知识网络中的一个节点。人是通过话题认识的，不是通过"加好友"。',
  'elevation': '知识升维：把零散的笔记提炼、浓缩、内化，最终成为你直觉的一部分。像蒸馏一样，越往上越精华。',
  'silent-inbox': '静默收件箱：所有消息的安静归宿。没有红点，没有提醒，只有你主动查看时它们才出现。',
  'time-window': '时间窗口：只在设定的时间段内接收消息。非窗口时间，生活优先。',
  'knowledge-graph': '知识图谱：你的所有笔记、话题、人之间的关联网络，可视化你的思想结构。',
  'ai-symbiont': 'AI 共生体：不是助手，不是工具，是与你共同成长的另一个思想体。',
  'small-circles': '极小圈子：围绕核心话题的深度讨论空间。最多10人，没有消息流，所有讨论自动沉淀为知识。',
  'reverse-link': '反向链接：哪些笔记引用了当前这篇笔记。你的知识不是孤岛，它们彼此相连。',
  'identity-anchor': '身份锚点：用来定义 AI 共生体"是谁"的核心文本。它基于你的笔记生成，确保它像你。',
};

// 导航分组
const NAV_GROUPS = [
  {
    id: 'core',
    label: '核心',
    desc: '每天使用',
    items: ['dashboard', 'editor', 'calendar'],
  },
  {
    id: 'knowledge',
    label: '知识',
    desc: '深度思考',
    items: ['graph', 'elevation'],
  },
  {
    id: 'connect',
    label: '连接',
    desc: '可选扩展',
    items: ['ai', 'social', 'nodes', 'voice', 'circles'],
  },
];

// 导航项完整定义
const NAV_ITEMS = [
  { id: 'dashboard', label: '仪表盘', icon: '◎', group: 'core' },
  { id: 'editor', label: '编辑器', icon: '✎', group: 'core' },
  { id: 'calendar', label: '生命日历', icon: '◷', group: 'core' },
  { id: 'graph', label: '知识图谱', icon: '❖', group: 'knowledge' },
  { id: 'elevation', label: '知识升维', icon: '▲', group: 'knowledge' },
  { id: 'ai', label: 'AI 共生体', icon: '◇', group: 'connect' },
  { id: 'social', label: '社交', icon: '◉', group: 'connect' },
  { id: 'nodes', label: '人', icon: '◐', group: 'connect' },
  { id: 'voice', label: '语音交互', icon: '◌', group: 'connect' },
  { id: 'circles', label: '极小圈子', icon: '◯', group: 'connect' },
];

// 板块主题色映射（每个板块有自己的渐变主题）
const PANEL_THEMES = {
  dashboard: { gradient: 'primary', accent: '#7C6FF0' },
  editor: { gradient: 'teal', accent: '#4ECDC4' },
  calendar: { gradient: 'green', accent: '#6BCB77' },
  graph: { gradient: 'lavender', accent: '#B39DDB' },
  elevation: { gradient: 'gold', accent: '#FFD93D' },
  ai: { gradient: 'primary', accent: '#7C6FF0' },
  social: { gradient: 'pink', accent: '#F48FB1' },
  nodes: { gradient: 'orange', accent: '#FFA07A' },
  voice: { gradient: 'pink', accent: '#F8BBD0' },
  circles: { gradient: 'teal', accent: '#4ECDC4' },
};

Object.assign(window, {
  DESIGN_TOKENS,
  CONCEPT_HINTS,
  NAV_GROUPS,
  NAV_ITEMS,
  PANEL_THEMES,
});
