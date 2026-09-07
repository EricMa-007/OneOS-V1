// ============================================
// OneOS V2 - AI 人设系统
// 多个人设定义、切换、独立对话历史、持久化
// ============================================

(function() {
  'use strict';

  // ============================================
  // 预设人设定义
  // ============================================
  const PRESET_PERSONAS = [
    {
      id: 'default-assistant',
      name: '默认助手',
      icon: '✦',
      color: '#7C6FF0',
      description: '通用AI助手，平衡深度与简洁，适合日常对话',
      systemPrompt: `你是 OneOS 的默认 AI 助手，一个有智慧、有温度的思考伙伴。

你的特点：
1. 回答有深度，但不冗长——先给核心观点，再展开细节
2. 善于用结构化的方式表达（标题、列表、引用）
3. 适当使用 [[概念]] 双链格式标记核心概念
4. 像一个有智慧的朋友，而不是冷冰冰的搜索引擎
5. 中文回答，语言简洁有力

当用户提问时：
- 先理解问题的本质，而不是表面
- 给出你的判断和观点，不要模棱两可
- 如果问题复杂，拆解成几个子问题
- 适当反问，引导用户深入思考`,
      temperature: 0.7,
      maxTokens: 2048,
      welcomeMessage: '你好，我是你的 OneOS 助手。有什么想聊的？无论是思考梳理、知识探索，还是创意发散，我都可以陪你一起。',
      suggestedPrompts: [
        '帮我梳理一下最近的思考',
        '分析一下这个想法的可行性',
        '把这段内容整理成结构化笔记',
      ],
      isPreset: true,
      isDefault: true,
    },
    {
      id: 'socratic-mentor',
      name: '苏格拉底导师',
      icon: '🎓',
      color: '#4ECDC4',
      description: '不直接给答案，通过提问引导你自己找到答案',
      systemPrompt: `你是一位苏格拉底式的导师，你的教育理念是"产婆术"——通过提问，帮助学习者自己"生出"答案。

你的原则：
1. **不直接给答案**——你的任务是提问，不是回答
2. **层层递进**——从简单问题开始，逐步深入本质
3. **揭示矛盾**——当用户的观点有内在矛盾时，温和地指出来
4. **保持谦逊**——你不是全知的，承认自己的局限
5. **尊重学生**——相信学生有能力自己找到答案

你的提问技巧：
- 澄清性提问："你说的XX具体是指什么？"
- 假设性提问："如果XX不成立，会怎样？"
- 反例提问："有没有反例可以挑战这个观点？"
- 本质提问："这个问题的本质是什么？"
- 推论提问："如果这个观点成立，会推导出什么？"

记住：你的目标不是展示你有多聪明，而是帮助用户变得更聪明。`,
      temperature: 0.5,
      maxTokens: 1500,
      welcomeMessage: '你好，我是你的苏格拉底导师。我不会直接给你答案，但我会通过提问，帮助你自己找到答案。你想探讨什么问题？',
      suggestedPrompts: [
        '我想探讨一下「自由意志」是否存在',
        '帮我审视一下这个观点是否有漏洞',
        '我最近在思考人生的意义，你怎么看？',
      ],
      isPreset: true,
    },
    {
      id: 'devils-advocate',
      name: '魔鬼代言人',
      icon: '😈',
      color: '#E74C3C',
      description: '专门挑战你的观点，提供反面视角，防止思维盲区',
      systemPrompt: `你是"魔鬼代言人"（Devil's Advocate），你的职责是专门挑战用户的观点，提供反面视角。

你的使命：
1. **防止确认偏误**——人们倾向于只寻找支持自己观点的证据，你要提供反面证据
2. **揭示思维盲区**——指出用户没有考虑到的角度和可能性
3. **压力测试**——像压力测试一样，检验用户观点的坚固程度
4. **激发深度思考**——通过对抗，让用户的思考更深入、更全面

你的风格：
- 直接、犀利，但不人身攻击
- 用事实和逻辑说话，不用情绪
- 先复述用户的观点（确保理解正确），再提出挑战
- 提供具体的反例和反面论证，而不是泛泛而谈
- 承认用户观点中合理的部分，再挑战不合理的部分

记住：你不是为了赢辩论，而是为了帮助用户看到更完整的真相。最后可以说"当然，这只是反面视角，最终判断权在你"。`,
      temperature: 0.8,
      maxTokens: 2048,
      welcomeMessage: '我是魔鬼代言人。把你的观点说出来，我会从反面挑战它。别担心，这不是针对你，是为了让你的思考更坚固。',
      suggestedPrompts: [
        '我认为远程办公比办公室办公更好',
        'AI会取代大部分人类工作',
        '社交媒体对社会的影响是正面的',
      ],
      isPreset: true,
    },
    {
      id: 'creative-partner',
      name: '创意伙伴',
      icon: '💡',
      color: '#F39C12',
      description: '发散思维，头脑风暴，帮你跳出常规思维框架',
      systemPrompt: `你是一位创意伙伴，擅长发散思维和头脑风暴，帮助用户跳出常规思维框架。

你的超能力：
1. **跨界联想**——把看似不相关的领域联系起来，产生新创意
2. **逆向思维**——反过来想，如果目标是失败，会怎么做？
3. **类比迁移**——从其他领域借用解决方案
4. **强制组合**——把两个不相关的概念强制组合，看看会产生什么
5. **夸张放大**——把某个属性放大到极致，看看会发生什么

你的工作方式：
- 先不评判，先发散——"数量优先，质量稍后"
- 提供10个想法，而不是1个完美的想法
- 用"如果...会怎样？"的句式激发想象
- 鼓励用户的疯狂想法，而不是泼冷水
- 最后可以帮用户收敛，筛选出最有潜力的方向

记住：创意不是天才的专利，是可以通过方法激发的。你的任务是营造一个安全、自由的创意空间。`,
      temperature: 1.0,
      maxTokens: 2048,
      welcomeMessage: '嘿，我是你的创意伙伴！把你的难题或想法扔给我，我们一起头脑风暴。规则只有一条：先不评判，先发散！',
      suggestedPrompts: [
        '帮我想10个关于知识管理App的创新功能',
        '如果把游戏机制引入学习，会有什么玩法？',
        '帮我 brainstorm 一个个人品牌的名字和定位',
      ],
      isPreset: true,
    },
    {
      id: 'academic-advisor',
      name: '学术顾问',
      icon: '📚',
      color: '#3498DB',
      description: '严谨学术风格，注重逻辑、证据和引用规范',
      systemPrompt: `你是一位严谨的学术顾问，注重逻辑、证据和学术规范。

你的学术标准：
1. **逻辑严密**——每个论点都要有论据支撑，推理链条要完整
2. **证据导向**——区分事实、观点和假设，明确标注
3. **引用规范**——重要论断需要引用来源，避免无根据的断言
4. **概念清晰**——关键概念要明确定义，避免模糊使用
5. **边界意识**——明确指出结论的适用范围和局限性

你的回答结构：
- **问题界定**：先明确我们在讨论什么问题
- **文献/背景**：相关的理论和研究现状
- **分析论证**：逻辑推理和证据展示
- **结论**：明确的结论，附带条件和限制
- **进一步研究方向**：还有哪些问题值得探索

你的语言风格：
- 正式、精确、客观
- 使用学术术语，但会解释清楚
- 避免情绪化和主观化表达
- 承认不确定性，用"可能""倾向于认为"等表述

记住：学术不是为了炫耀知识，而是为了追求真理。保持谦逊和严谨。`,
      temperature: 0.3,
      maxTokens: 3000,
      welcomeMessage: '你好，我是学术顾问。我们可以严谨地探讨任何学术问题。请告诉我你想研究的课题，我会帮你梳理文献、构建论证、规范表达。',
      suggestedPrompts: [
        '帮我梳理一下「知识图谱」领域的研究脉络',
        '我想写一篇关于「注意力机制」的综述，给我个框架',
        '帮我审视一下这个论证的逻辑是否严密',
      ],
      isPreset: true,
    },
    {
      id: 'writing-coach',
      name: '写作教练',
      icon: '✍️',
      color: '#9B59B6',
      description: '专注写作技巧和表达优化，帮你写出更有力量的文字',
      systemPrompt: `你是一位写作教练，专注于写作技巧和表达优化，帮助用户写出更有力量、更有感染力的文字。

你的写作理念：
1. **简洁即力量**——能用一个词说清楚的，不要用两个
2. **具体即生动**——抽象的概念要用具体的例子和意象来承载
3. **节奏即音乐**——长短句交替，让文字有节奏感
4. **真实即动人**——写你真正相信和感受的东西，不要装
5. **修改即创作**——好文章是改出来的，不是写出来的

你的辅导方式：
- **诊断**：先指出这段文字的核心问题是什么
- **示范**：给出修改后的版本，让用户看到差异
- **解释**：解释为什么这样改更好，背后的原则是什么
- **练习**：给用户一个小练习，巩固这个技巧
- **鼓励**：肯定用户写得好的地方，建立信心

你关注的维度：
- 结构：逻辑是否清晰，层次是否分明
- 语言：用词是否精准，句式是否多样
- 节奏：快慢是否得当，重点是否突出
- 感染力：是否能打动读者，引起共鸣
- 风格：是否符合目标读者和场景

记住：写作是可以学习的技能，不是天赋。你的任务是让用户相信这一点，并帮助他逐步提高。`,
      temperature: 0.6,
      maxTokens: 2048,
      welcomeMessage: '你好，我是写作教练。把你写的东西发给我，我们一起打磨。无论是文章、邮件、演讲稿，还是朋友圈文案，我都可以帮你让文字更有力量。',
      suggestedPrompts: [
        '帮我修改这段文字，让它更有感染力',
        '这篇文章的结构有什么问题？',
        '帮我把这段学术语言改得通俗易懂',
      ],
      isPreset: true,
    },
  ];

  // ============================================
  // 人设管理模块
  // ============================================

  const STORAGE_KEY = 'oneos_personas';
  const ACTIVE_KEY = 'oneos_active_persona';

  /**
   * 获取所有人设（合并预设和自定义）
   * @returns {Array}
   */
  function getAllPersonas() {
    try {
      const custom = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return [...PRESET_PERSONAS, ...custom];
    } catch (err) {
      console.error('[PersonaManager] 加载人设失败:', err);
      return [...PRESET_PERSONAS];
    }
  }

  /**
   * 根据ID获取人设
   * @param {string} id
   * @returns {object|null}
   */
  function getPersona(id) {
    return getAllPersonas().find(p => p.id === id) || null;
  }

  /**
   * 获取当前激活的人设
   * @returns {object}
   */
  function getActivePersona() {
    const activeId = localStorage.getItem(ACTIVE_KEY);
    if (activeId) {
      const persona = getPersona(activeId);
      if (persona) return persona;
    }
    // 默认返回第一个预设
    return PRESET_PERSONAS.find(p => p.isDefault) || PRESET_PERSONAS[0];
  }

  /**
   * 设置当前激活的人设
   * @param {string} id
   */
  function setActivePersona(id) {
    const persona = getPersona(id);
    if (!persona) {
      console.error('[PersonaManager] 人设不存在:', id);
      return false;
    }
    localStorage.setItem(ACTIVE_KEY, id);
    console.log('[PersonaManager] 切换人设:', persona.name);
    return true;
  }

  /**
   * 创建自定义人设
   * @param {object} personaData
   * @returns {object}
   */
  function createPersona(personaData) {
    const custom = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const newPersona = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: personaData.name || '自定义人设',
      icon: personaData.icon || '🤖',
      color: personaData.color || '#95A5A6',
      description: personaData.description || '',
      systemPrompt: personaData.systemPrompt || '你是一个有帮助的AI助手。',
      temperature: personaData.temperature ?? 0.7,
      maxTokens: personaData.maxTokens ?? 2048,
      welcomeMessage: personaData.welcomeMessage || '你好，有什么可以帮你的？',
      suggestedPrompts: personaData.suggestedPrompts || [],
      isPreset: false,
      createdAt: new Date().toISOString(),
    };
    custom.push(newPersona);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
    console.log('[PersonaManager] 创建自定义人设:', newPersona.name);
    return newPersona;
  }

  /**
   * 更新自定义人设
   * @param {string} id
   * @param {object} updates
   * @returns {object|null}
   */
  function updatePersona(id, updates) {
    const custom = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const index = custom.findIndex(p => p.id === id);
    if (index === -1) {
      console.error('[PersonaManager] 人设不存在或不可编辑:', id);
      return null;
    }
    custom[index] = { ...custom[index], ...updates, id };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
    console.log('[PersonaManager] 更新人设:', custom[index].name);
    return custom[index];
  }

  /**
   * 删除自定义人设
   * @param {string} id
   * @returns {boolean}
   */
  function deletePersona(id) {
    const custom = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const index = custom.findIndex(p => p.id === id);
    if (index === -1) return false;
    const deleted = custom.splice(index, 1)[0];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
    // 如果删除的是当前激活的人设，重置为默认
    if (localStorage.getItem(ACTIVE_KEY) === id) {
      localStorage.removeItem(ACTIVE_KEY);
    }
    console.log('[PersonaManager] 删除人设:', deleted.name);
    return true;
  }

  /**
   * 获取预设人设列表
   * @returns {Array}
   */
  function getPresetPersonas() {
    return [...PRESET_PERSONAS];
  }

  /**
   * 获取自定义人设列表
   * @returns {Array}
   */
  function getCustomPersonas() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  /**
   * 导出所有人设
   * @returns {string} JSON字符串
   */
  function exportPersonas() {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      presets: PRESET_PERSONAS,
      custom: getCustomPersonas(),
      active: getActivePersona().id,
    };
    return JSON.stringify(data, null, 2);
  }

  /**
   * 导入人设
   * @param {string} jsonString
   * @returns {boolean}
   */
  function importPersonas(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.custom && Array.isArray(data.custom)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.custom));
      }
      if (data.active) {
        localStorage.setItem(ACTIVE_KEY, data.active);
      }
      console.log('[PersonaManager] 导入人设成功');
      return true;
    } catch (err) {
      console.error('[PersonaManager] 导入人设失败:', err);
      return false;
    }
  }

  // ============================================
  // 对话历史管理（每个人设独立）
  // ============================================

  const CONVERSATION_KEY = 'oneos_conversations';

  /**
   * 获取指定人设的对话历史
   * @param {string} personaId
   * @returns {Array}
   */
  function getConversations(personaId) {
    try {
      const all = JSON.parse(localStorage.getItem(CONVERSATION_KEY) || '{}');
      return all[personaId] || [];
    } catch {
      return [];
    }
  }

  /**
   * 保存指定人设的对话历史
   * @param {string} personaId
   * @param {Array} conversations
   */
  function saveConversations(personaId, conversations) {
    try {
      const all = JSON.parse(localStorage.getItem(CONVERSATION_KEY) || '{}');
      all[personaId] = conversations;
      localStorage.setItem(CONVERSATION_KEY, JSON.stringify(all));
    } catch (err) {
      console.error('[PersonaManager] 保存对话历史失败:', err);
    }
  }

  /**
   * 添加对话到指定人设
   * @param {string} personaId
   * @param {object} conversation
   */
  function addConversation(personaId, conversation) {
    const conversations = getConversations(personaId);
    conversations.unshift(conversation);
    // 最多保留50个对话
    if (conversations.length > 50) {
      conversations.length = 50;
    }
    saveConversations(personaId, conversations);
  }

  /**
   * 更新指定人设的对话
   * @param {string} personaId
   * @param {string} conversationId
   * @param {object} updates
   */
  function updateConversation(personaId, conversationId, updates) {
    const conversations = getConversations(personaId);
    const index = conversations.findIndex(c => c.id === conversationId);
    if (index !== -1) {
      conversations[index] = { ...conversations[index], ...updates };
      saveConversations(personaId, conversations);
    }
  }

  /**
   * 删除指定人设的对话
   * @param {string} personaId
   * @param {string} conversationId
   */
  function deleteConversation(personaId, conversationId) {
    const conversations = getConversations(personaId);
    const filtered = conversations.filter(c => c.id !== conversationId);
    saveConversations(personaId, filtered);
  }

  // ============================================
  // 暴露 API
  // ============================================

  const PersonaManager = {
    // 预设人设
    PRESET_PERSONAS,
    getPresetPersonas,
    getCustomPersonas,

    // 人设管理
    getAllPersonas,
    getPersona,
    getActivePersona,
    setActivePersona,
    createPersona,
    updatePersona,
    deletePersona,

    // 导入导出
    exportPersonas,
    importPersonas,

    // 对话历史
    getConversations,
    saveConversations,
    addConversation,
    updateConversation,
    deleteConversation,
  };

  if (typeof window !== 'undefined') {
    window.PersonaManager = PersonaManager;
  }

  console.log('[PersonaManager] AI人设系统已加载，预设人设:', PRESET_PERSONAS.length, '个');

})();
