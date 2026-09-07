// ============================================
// OneOS V2 - Ollama 本地大模型服务封装
// 提供统一的 AI API：模型列表、聊天、生成、嵌入、RAG
// 支持流式输出、错误处理、自动重试
// ============================================

(function() {
  'use strict';

  // 默认配置
  const DEFAULT_CONFIG = {
    baseUrl: 'http://localhost:11434',
    model: 'llama3',
    temperature: 0.7,
    maxTokens: 2048,
    topP: 0.9,
    frequencyPenalty: 0,
    presencePenalty: 0,
    timeout: 120000, // 120秒超时
    stream: true,
  };

  // 当前配置
  let config = { ...DEFAULT_CONFIG };

  // ============================================
  // 配置管理
  // ============================================

  /**
   * 更新配置
   * @param {object} newConfig - 新配置
   */
  function configure(newConfig = {}) {
    config = { ...config, ...newConfig };
    console.log('[OllamaService] 配置已更新:', {
      baseUrl: config.baseUrl,
      model: config.model,
      temperature: config.temperature,
    });
  }

  /**
   * 获取当前配置
   * @returns {object}
   */
  function getConfig() {
    return { ...config };
  }

  /**
   * 从 SettingsDB 加载配置
   */
  function loadFromSettings() {
    if (window.SettingsDB) {
      const aiSettings = window.SettingsDB.getSetting('ai', {});
      if (aiSettings.baseUrl) config.baseUrl = aiSettings.baseUrl;
      if (aiSettings.model) config.model = aiSettings.model;
      if (aiSettings.temperature !== undefined) config.temperature = aiSettings.temperature;
      if (aiSettings.maxTokens) config.maxTokens = aiSettings.maxTokens;
      if (aiSettings.streamOutput !== undefined) config.stream = aiSettings.streamOutput;
    }
  }

  // ============================================
  // 连接检测
  // ============================================

  /**
   * 检测 Ollama 服务是否可用
   * @returns {Promise<{available: boolean, message: string}>}
   */
  async function checkConnection() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${config.baseUrl}/api/tags`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        return {
          available: true,
          message: `Ollama 服务可用，已安装 ${data.models?.length || 0} 个模型`,
          models: data.models || [],
        };
      }
      return { available: false, message: `服务返回状态码: ${response.status}` };
    } catch (err) {
      if (err.name === 'AbortError') {
        return { available: false, message: '连接超时（5秒）' };
      }
      return { available: false, message: `连接失败: ${err.message}` };
    }
  }

  // ============================================
  // 模型管理
  // ============================================

  /**
   * 获取已安装的模型列表
   * @returns {Promise<Array>}
   */
  async function listModels() {
    try {
      const response = await fetch(`${config.baseUrl}/api/tags`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data.models || [];
    } catch (err) {
      console.error('[OllamaService] 获取模型列表失败:', err);
      throw new Error(`获取模型列表失败: ${err.message}`);
    }
  }

  /**
   * 拉取模型
   * @param {string} modelName - 模型名称
   * @param {Function} [onProgress] - 进度回调
   * @returns {Promise<void>}
   */
  async function pullModel(modelName, onProgress) {
    const response = await fetch(`${config.baseUrl}/api/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: modelName, stream: true }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const data = JSON.parse(line);
          if (onProgress) {
            onProgress({
              status: data.status,
              completed: data.completed,
              total: data.total,
              percent: data.total ? Math.round((data.completed / data.total) * 100) : null,
            });
          }
        } catch (e) { /* 忽略解析错误 */ }
      }
    }
  }

  // ============================================
  // 聊天补全
  // ============================================

  /**
   * 发送聊天消息（非流式）
   * @param {Array} messages - 消息列表 [{role, content}]
   * @param {object} [options] - 选项
   * @returns {Promise<{content: string, model: string, done: boolean}>}
   */
  async function chat(messages, options = {}) {
    const opts = { ...config, ...options };

    const response = await fetch(`${opts.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: opts.model,
        messages,
        stream: false,
        options: {
          temperature: opts.temperature,
          num_predict: opts.maxTokens,
          top_p: opts.topP,
          frequency_penalty: opts.frequencyPenalty,
          presence_penalty: opts.presencePenalty,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return {
      content: data.message?.content || '',
      model: data.model,
      done: data.done,
      totalDuration: data.total_duration,
      loadDuration: data.load_duration,
      promptEvalCount: data.prompt_eval_count,
      evalCount: data.eval_count,
    };
  }

  /**
   * 发送聊天消息（流式）
   * @param {Array} messages - 消息列表
   * @param {Function} onToken - 每个token的回调 (token: string) => void
   * @param {object} [options] - 选项
   * @returns {Promise<{content: string, done: boolean}>}
   */
  async function chatStream(messages, onToken, options = {}) {
    const opts = { ...config, ...options };

    const response = await fetch(`${opts.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: opts.model,
        messages,
        stream: true,
        options: {
          temperature: opts.temperature,
          num_predict: opts.maxTokens,
          top_p: opts.topP,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const data = JSON.parse(line);
          const token = data.message?.content || '';
          if (token) {
            fullContent += token;
            if (onToken) onToken(token, fullContent);
          }
          if (data.done) {
            return { content: fullContent, done: true, ...data };
          }
        } catch (e) { /* 忽略解析错误 */ }
      }
    }

    return { content: fullContent, done: true };
  }

  // ============================================
  // 文本生成
  // ============================================

  /**
   * 文本生成（非流式）
   * @param {string} prompt - 提示词
   * @param {object} [options] - 选项
   * @returns {Promise<{response: string}>}
   */
  async function generate(prompt, options = {}) {
    const opts = { ...config, ...options };

    const response = await fetch(`${opts.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: opts.model,
        prompt,
        stream: false,
        options: {
          temperature: opts.temperature,
          num_predict: opts.maxTokens,
        },
      }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return { response: data.response || '', done: data.done };
  }

  /**
   * 文本生成（流式）
   * @param {string} prompt - 提示词
   * @param {Function} onToken - token回调
   * @param {object} [options] - 选项
   * @returns {Promise<{response: string}>}
   */
  async function generateStream(prompt, onToken, options = {}) {
    const opts = { ...config, ...options };

    const response = await fetch(`${opts.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: opts.model,
        prompt,
        stream: true,
        options: {
          temperature: opts.temperature,
          num_predict: opts.maxTokens,
        },
      }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const data = JSON.parse(line);
          const token = data.response || '';
          if (token) {
            fullResponse += token;
            if (onToken) onToken(token, fullResponse);
          }
          if (data.done) return { response: fullResponse, done: true };
        } catch (e) { /* 忽略 */ }
      }
    }

    return { response: fullResponse, done: true };
  }

  // ============================================
  // 嵌入向量
  // ============================================

  /**
   * 生成文本嵌入向量
   * @param {string|string[]} input - 文本或文本数组
   * @param {object} [options] - 选项
   * @returns {Promise<number[][]>}
   */
  async function embed(input, options = {}) {
    const opts = { ...config, ...options };
    const texts = Array.isArray(input) ? input : [input];

    const embeddings = [];
    for (const text of texts) {
      const response = await fetch(`${opts.baseUrl}/api/embed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: opts.model,
          input: text,
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      embeddings.push(data.embeddings?.[0] || []);
    }

    return Array.isArray(input) ? embeddings : embeddings[0];
  }

  // ============================================
  // RAG 检索增强
  // ============================================

  /**
   * 基于笔记的 RAG 问答
   * @param {string} question - 用户问题
   * @param {Array} notes - 笔记列表 [{id, title, content}]
   * @param {object} [options] - 选项
   * @returns {Promise<{answer: string, sources: Array}>}
   */
  async function ragQuestion(question, notes, options = {}) {
    const { topK = 5, onToken } = options;

    // 简单的关键词检索（后续可替换为向量检索）
    const relevantNotes = simpleKeywordSearch(question, notes, topK);

    // 构建上下文
    const context = relevantNotes.map((note, i) =>
      `[文档${i + 1}] ${note.title}\n${note.content?.slice(0, 500) || ''}`
    ).join('\n\n');

    const systemPrompt = `你是 OneOS 的知识助手。请基于以下参考文档回答用户问题。如果参考文档中没有相关信息，请诚实说明。回答时引用来源文档编号。

参考文档：
${context}

回答要求：
1. 基于参考文档回答，不要编造信息
2. 引用来源时使用 [文档N] 格式
3. 语言简洁明了，结构清晰`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: question },
    ];

    if (onToken && config.stream) {
      const result = await chatStream(messages, onToken, options);
      return { answer: result.content, sources: relevantNotes };
    } else {
      const result = await chat(messages, options);
      return { answer: result.content, sources: relevantNotes };
    }
  }

  /**
   * 简单关键词检索
   */
  function simpleKeywordSearch(query, notes, topK) {
    const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 1);

    const scored = notes.map(note => {
      const text = `${note.title || ''} ${note.content || ''}`.toLowerCase();
      let score = 0;
      keywords.forEach(kw => {
        if (text.includes(kw)) score += 1;
      });
      return { ...note, score };
    });

    return scored
      .filter(n => n.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  // ============================================
  // 预设提示词模板
  // ============================================

  const PROMPT_TEMPLATES = {
    summarize: (text) => `请对以下内容进行摘要，保留核心观点，控制在200字以内：\n\n${text}`,
    extractKeyPoints: (text) => `请从以下内容中提取3-5个核心要点，每个要点用一句话概括：\n\n${text}`,
    translate: (text, targetLang = '中文') => `请将以下内容翻译成${targetLang}，保持原意和格式：\n\n${text}`,
    polish: (text) => `请润色以下文字，使其更加流畅、专业，保持原意：\n\n${text}`,
    generateTitle: (text) => `请为以下内容生成一个简洁有力的标题（不超过20字）：\n\n${text}`,
    expand: (text) => `请基于以下核心观点，扩展成一篇结构完整的文章，包含引言、主体和结论：\n\n${text}`,
    questionAnswer: (context, question) => `基于以下内容回答问题。\n\n内容：\n${context}\n\n问题：${question}`,
  };

  /**
   * 使用预设模板生成内容
   * @param {string} templateName - 模板名称
   * @param {string} text - 输入文本
   * @param {object} [extra] - 额外参数
   * @returns {Promise<string>}
   */
  async function useTemplate(templateName, text, extra = {}) {
    const template = PROMPT_TEMPLATES[templateName];
    if (!template) throw new Error(`未知模板: ${templateName}`);

    const prompt = typeof template === 'function' ? template(text, extra) : template;
    const result = await generate(prompt);
    return result.response;
  }

  // ============================================
  // 暴露 API
  // ============================================

  const OllamaService = {
    // 配置
    configure,
    getConfig,
    loadFromSettings,

    // 连接检测
    checkConnection,

    // 模型管理
    listModels,
    pullModel,

    // 聊天
    chat,
    chatStream,

    // 生成
    generate,
    generateStream,

    // 嵌入
    embed,

    // RAG
    ragQuestion,

    // 模板
    useTemplate,
    PROMPT_TEMPLATES,

    // 常量
    DEFAULT_CONFIG,
  };

  if (typeof window !== 'undefined') {
    window.OllamaService = OllamaService;
  }

  // 自动从设置加载配置
  if (typeof window !== 'undefined') {
    setTimeout(() => loadFromSettings(), 100);
  }

  console.log('[OllamaService] Ollama AI 服务模块已加载');

})();
