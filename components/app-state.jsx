// ============================================
// OneOS 全局状态管理
// 简单的发布订阅模式，用于板块间数据联动
// ============================================

const createAppState = () => {
  let state = {
    // 仪表盘统计
    dashboard: {
      todayNotes: 8,
      knowledgeCount: 24,
      totalNotes: 156,
      elevationLevels: { core: 5, surface: 12, data: 24, raw: 85 },
      todayDepth: 3.2,
      avgDepth: 2.4,
      deepConversations: 2,
      elevatedToday: 1,
      connections: 12,
    },
    // 日历强度（按日期存储，key为 YYYY-MM-DD）
    calendar: {},
    // 笔记列表（供全局搜索与文件树共享）
    notes: [],
    // 图谱节点变化
    graph: {
      nodes: [],
      edges: [],
    },
    // 社交沟通历史
    social: {
      messages: [],
    },
    // 圈子知识库
    circles: {
      knowledge: [],
    },
  };

  const listeners = new Set();

  const getState = () => state;

  const setState = (updater) => {
    const newState = typeof updater === 'function' ? updater(state) : { ...state, ...updater };
    state = newState;
    // 通知所有订阅者
    listeners.forEach(fn => {
      try { fn(state); } catch (e) { console.error('[appState] listener error', e); }
    });
  };

  const subscribe = (fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  };

  // ---------- 操作方法 ----------

  // 1. 新建笔记
  const addNote = (note) => {
    const today = new Date().toISOString().split('T')[0];
    setState(prev => {
      const next = { ...prev };
      next.dashboard = { ...prev.dashboard };
      next.dashboard.todayNotes = prev.dashboard.todayNotes + 1;
      next.dashboard.totalNotes = prev.dashboard.totalNotes + 1;
      // 日历当日强度 +1
      const dayKey = today;
      next.calendar = { ...prev.calendar };
      const prevDay = prev.calendar[dayKey] || { notes: 0, depth: 0, conversations: 0, elevate: 0 };
      next.calendar[dayKey] = { ...prevDay, notes: prevDay.notes + 1 };
      // 笔记加入列表
      next.notes = [note, ...prev.notes];
      // 深度计数：新笔记算 raw 层
      next.dashboard.elevationLevels = { ...prev.dashboard.elevationLevels };
      next.dashboard.elevationLevels.raw = prev.dashboard.elevationLevels.raw + 1;
      return next;
    });
  };

  // 2. AI 对话归档为笔记
  const archiveAIConversation = ({ title, content, topic, category }) => {
    const today = new Date().toISOString().split('T')[0];
    setState(prev => {
      const next = { ...prev };
      next.dashboard = { ...prev.dashboard };
      next.dashboard.knowledgeCount = prev.dashboard.knowledgeCount + 1;
      next.dashboard.totalNotes = prev.dashboard.totalNotes + 1;
      // 日历当日强度 +1
      next.calendar = { ...prev.calendar };
      const prevDay = prev.calendar[today] || { notes: 0, depth: 0, conversations: 0, elevate: 0 };
      next.calendar[today] = { ...prevDay, notes: prevDay.notes + 1 };
      // 加入笔记列表
      const note = {
        id: 'ai-' + Date.now(),
        title,
        content,
        topic,
        category: category || 'ai',
        type: 'note',
        date: today,
      };
      next.notes = [note, ...prev.notes];
      // 图谱增加节点
      next.graph = { ...prev.graph };
      const qNode = { id: 'q-' + Date.now(), label: title, type: 'question', topic };
      const aNode = { id: 'a-' + Date.now(), label: 'AI 回答', type: 'answer', topic };
      const edge = { source: qNode.id, target: aNode.id, label: '回答' };
      next.graph.nodes = [...(prev.graph.nodes || []), qNode, aNode];
      next.graph.edges = [...(prev.graph.edges || []), edge];
      // raw 层 +1
      next.dashboard.elevationLevels = { ...prev.dashboard.elevationLevels };
      next.dashboard.elevationLevels.raw = prev.dashboard.elevationLevels.raw + 1;
      return next;
    });
  };

  // 3. 社交消息归档为沟通记录
  const archiveSocialMessage = ({ personId, personName, content, topic }) => {
    const today = new Date().toISOString().split('T')[0];
    setState(prev => {
      const next = { ...prev };
      next.dashboard = { ...prev.dashboard };
      next.dashboard.deepConversations = prev.dashboard.deepConversations + 1;
      next.dashboard.totalNotes = prev.dashboard.totalNotes + 1;
      // 日历当日深度对话因子 +1
      next.calendar = { ...prev.calendar };
      const prevDay = prev.calendar[today] || { notes: 0, depth: 0, conversations: 0, elevate: 0 };
      next.calendar[today] = { ...prevDay, conversations: prevDay.conversations + 1 };
      // 加入笔记列表（沟通记录）
      const note = {
        id: 'msg-' + Date.now(),
        title: `与 ${personName} 的对话记录`,
        content,
        topic,
        category: 'social',
        type: 'note',
        date: today,
      };
      next.notes = [note, ...prev.notes];
      // 社交记录
      next.social = { ...prev.social };
      next.social.messages = [
        { id: note.id, personId, personName, content, topic, date: today },
        ...prev.social.messages,
      ];
      return next;
    });
  };

  // 4. 知识升维操作
  const elevateNote = ({ noteId, level, newType }) => {
    const today = new Date().toISOString().split('T')[0];
    setState(prev => {
      const next = { ...prev };
      // 升维统计更新
      next.dashboard = { ...prev.dashboard };
      const levels = { ...prev.dashboard.elevationLevels };
      // 减少原来的 raw/surface，增加对应层级
      const levelMap = { core: 'core', surface: 'surface', data: 'data', card: 'data', summary: 'surface', icon: 'core' };
      const targetLevel = levelMap[newType] || levelMap[level] || 'surface';
      levels.raw = Math.max(0, levels.raw - 1);
      levels[targetLevel] = (levels[targetLevel] || 0) + 1;
      next.dashboard.elevationLevels = levels;
      next.dashboard.elevatedToday = prev.dashboard.elevatedToday + 1;
      // 日历当日升维因子 +1
      next.calendar = { ...prev.calendar };
      const prevDay = prev.calendar[today] || { notes: 0, depth: 0, conversations: 0, elevate: 0 };
      next.calendar[today] = { ...prevDay, elevate: prevDay.elevate + 1 };
      // 图谱节点类型变化
      if (noteId && prev.graph.nodes?.length) {
        next.graph = { ...prev.graph };
        next.graph.nodes = prev.graph.nodes.map(n =>
          n.id === noteId ? { ...n, type: newType || 'elevated' } : n
        );
      }
      return next;
    });
  };

  // 5. 圈子话题归档
  const archiveCircleTopic = ({ circleId, circleName, topicTitle, content }) => {
    const today = new Date().toISOString().split('T')[0];
    setState(prev => {
      const next = { ...prev };
      next.dashboard = { ...prev.dashboard };
      next.dashboard.totalNotes = prev.dashboard.totalNotes + 1;
      next.dashboard.knowledgeCount = prev.dashboard.knowledgeCount + 1;
      // 日历当日笔记数 +1
      next.calendar = { ...prev.calendar };
      const prevDay = prev.calendar[today] || { notes: 0, depth: 0, conversations: 0, elevate: 0 };
      next.calendar[today] = { ...prevDay, notes: prevDay.notes + 1 };
      // 加入笔记列表
      const note = {
        id: 'circle-' + Date.now(),
        title: topicTitle,
        content,
        topic: circleName,
        category: 'circle',
        type: 'note',
        date: today,
      };
      next.notes = [note, ...prev.notes];
      // 圈子知识库
      next.circles = { ...prev.circles };
      next.circles.knowledge = [
        { id: note.id, circleId, circleName, title: topicTitle, date: today },
        ...prev.circles.knowledge,
      ];
      return next;
    });
  };

  // 初始加载种子笔记
  const initSeedNotes = (seedNotes) => {
    setState(prev => ({ ...prev, notes: seedNotes || [] }));
  };

  return {
    getState,
    setState,
    subscribe,
    addNote,
    archiveAIConversation,
    archiveSocialMessage,
    elevateNote,
    archiveCircleTopic,
    initSeedNotes,
  };
};

// 全局单例
window.OneOSAppState = createAppState();

// React Hook: useAppState(selector)
// 各板块通过这个 hook 订阅相关数据
function useAppState(selector) {
  const [snapshot, setSnapshot] = React.useState(() => {
    const state = window.OneOSAppState.getState();
    return selector ? selector(state) : state;
  });

  React.useEffect(() => {
    return window.OneOSAppState.subscribe((newState) => {
      const next = selector ? selector(newState) : newState;
      // 浅比较，避免不必要的重渲染
      setSnapshot(prev => {
        if (prev === next) return prev;
        // 简单的浅层相等检查
        if (typeof prev === 'object' && typeof next === 'object' && prev && next) {
          const prevKeys = Object.keys(prev);
          const nextKeys = Object.keys(next);
          if (prevKeys.length !== nextKeys.length) return next;
          for (const k of prevKeys) {
            if (prev[k] !== next[k]) return next;
          }
          return prev;
        }
        return next;
      });
    });
  }, [selector ? 's' : 'a']); // 依赖稳定即可

  return snapshot;
}

// 暴露到全局供其他文件使用
Object.assign(window, {
  OneOSAppState: window.OneOSAppState,
  useAppState,
});
