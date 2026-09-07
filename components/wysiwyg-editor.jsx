// ============================================
// OneOS V2 - WYSIWYG 编辑器组件
// 真实所见即所得编辑器，支持 Markdown 语法、工具栏、快捷键
// ============================================

function WysiwygEditor({
  initialContent = '',
  onChange,
  onSave,
  isNight = false,
  textColor = '#2D3436',
  subTextColor = '#636E72',
  readOnly = false,
}) {
  const [content, setContent] = React.useState(initialContent);
  const [mode, setMode] = React.useState('wysiwyg'); // wysiwyg | preview | source
  const [isSaving, setIsSaving] = React.useState(false);
  const [lastSaved, setLastSaved] = React.useState(null);
  const editorRef = React.useRef(null);
  const saveTimerRef = React.useRef(null);
  const contentRef = React.useRef(initialContent); // V2: 使用ref保存最新content，避免闭包陷阱
  // V2: 性能优化状态
  const [perfStats, setPerfStats] = React.useState(null);
  const [largeFileMode, setLargeFileMode] = React.useState(false);
  const [showPerfIndicator, setShowPerfIndicator] = React.useState(false);
  const idleTaskIdRef = React.useRef(null);

  // 同步content到ref
  React.useEffect(() => {
    contentRef.current = content;
  }, [content]);

  // V2: 启动性能监控（监听initialContent变化，切换笔记时重新检测大文件）
  React.useEffect(() => {
    if (window.PerformanceOptimizer) {
      window.PerformanceOptimizer.startPerformanceMonitor();
      // 定期更新性能统计
      const perfInterval = setInterval(() => {
        const stats = window.PerformanceOptimizer.getPerformanceStats();
        setPerfStats(stats);
      }, 1000);

      // 大文件检测
      const fileInfo = window.PerformanceOptimizer.detectFileSize(initialContent);
      if (fileInfo.shouldOptimize) {
        setLargeFileMode(true);
        console.log('[Editor] 大文件模式已启用:', fileInfo);
      } else {
        setLargeFileMode(false);
      }

      return () => {
        clearInterval(perfInterval);
        window.PerformanceOptimizer.stopPerformanceMonitor();
        if (idleTaskIdRef.current) {
          window.PerformanceOptimizer.cancelIdleTask(idleTaskIdRef.current);
        }
      };
    }
  }, [initialContent]);

  // 初始化编辑器内容（监听initialContent变化，切换笔记时更新）
  React.useEffect(() => {
    if (editorRef.current && mode === 'wysiwyg') {
      const renderStart = performance.now();
      editorRef.current.innerHTML = window.MarkdownParser
        ? window.MarkdownParser.parse(initialContent)
        : initialContent;
      const renderTime = performance.now() - renderStart;
      if (window.PerformanceOptimizer) {
        window.PerformanceOptimizer.getPerformanceStats().renderTime = Math.round(renderTime);
      }
      if (renderTime > 100) {
        console.warn(`[Editor] 渲染耗时较长: ${renderTime.toFixed(0)}ms`);
      }
    }
    // 同步content状态
    setContent(initialContent);
  }, [initialContent, mode]);

  // 内容变化时自动保存（防抖 + 性能优化）
  const handleContentChange = React.useCallback(() => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    // 简单的 HTML 转 Markdown（用于保存）
    const md = htmlToMarkdown(html);
    setContent(md);
    if (onChange) onChange(md);

    // V2: 性能优化的防抖保存
    const saveDelay = largeFileMode ? 3000 : 1500;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      // 使用 requestIdleCallback 在浏览器空闲时保存
      if (window.PerformanceOptimizer) {
        idleTaskIdRef.current = window.PerformanceOptimizer.scheduleIdleTask(() => {
          handleSave();
        }, 2000);
      } else {
        handleSave();
      }
    }, saveDelay);
  }, [onChange, largeFileMode]);

  // 保存（性能优化，使用ref避免闭包陷阱）
  const handleSave = React.useCallback(async () => {
    if (!onSave) return;
    setIsSaving(true);
    const saveStart = performance.now();
    try {
      await onSave(contentRef.current); // V2: 使用ref获取最新content
      setLastSaved(new Date());
      const saveTime = performance.now() - saveStart;
      if (window.PerformanceOptimizer) {
        window.PerformanceOptimizer.getPerformanceStats().saveTime = Math.round(saveTime);
      }
      if (saveTime > 200) {
        console.warn(`[Editor] 保存耗时较长: ${saveTime.toFixed(0)}ms`);
      }
    } catch (err) {
      console.error('[Editor] 保存失败:', err);
    } finally {
      setIsSaving(false);
    }
  }, [onSave]);

  // 执行编辑命令
  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleContentChange();
  };

  // 插入 Markdown 语法
  const insertMarkdown = (prefix, suffix = '') => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    const newText = prefix + selectedText + suffix;
    document.execCommand('insertText', false, newText);
    handleContentChange();
  };

  // 快捷键
  const handleKeyDown = (e) => {
    // Cmd/Ctrl + S 保存
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
      return;
    }
    // Cmd/Ctrl + B 加粗
    if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
      e.preventDefault();
      execCommand('bold');
      return;
    }
    // Cmd/Ctrl + I 斜体
    if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
      e.preventDefault();
      execCommand('italic');
      return;
    }
    // Cmd/Ctrl + K 链接
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      const url = prompt('输入链接地址：', 'https://');
      if (url) execCommand('createLink', url);
      return;
    }
    // Tab 缩进
    if (e.key === 'Tab') {
      e.preventDefault();
      execCommand('insertUnorderedList');
      return;
    }
  };

  // HTML 转 Markdown（健壮版，支持多行内容）
  const htmlToMarkdown = (html) => {
    if (!html) return '';
    let md = html;

    // 代码块（优先处理，避免内部标签被转换）
    md = md.replace(/<pre[^>]*>[\s\S]*?<\/pre>/gi, (match) => {
      const codeMatch = match.match(/<code[^>]*>([\s\S]*?)<\/code>/i);
      const code = codeMatch ? codeMatch[1] : match.replace(/<[^>]+>/g, '');
      return '```\n' + code.trim() + '\n```\n\n';
    });

    // 标题（使用[\s\S]*?支持多行）
    md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '# $1\n\n');
    md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '## $1\n\n');
    md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '### $1\n\n');
    md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '#### $1\n\n');
    md = md.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, '##### $1\n\n');
    md = md.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, '###### $1\n\n');

    // 加粗
    md = md.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**');
    md = md.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**');

    // 斜体
    md = md.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*');
    md = md.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*');

    // 删除线
    md = md.replace(/<del[^>]*>([\s\S]*?)<\/del>/gi, '~~$1~~');
    md = md.replace(/<s[^>]*>([\s\S]*?)<\/s>/gi, '~~$1~~');

    // 行内代码
    md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`');

    // 引用（支持多行）
    md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (match, content) => {
      return content.split('\n').map(line => '> ' + line).join('\n') + '\n\n';
    });

    // 链接（支持单引号和无引号href）
    md = md.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');

    // 图片（支持alt在src之前或之后，支持无alt）
    md = md.replace(/<img[^>]*>/gi, (match) => {
      const srcMatch = match.match(/src=["']([^"']*)["']/i);
      const altMatch = match.match(/alt=["']([^"']*)["']/i);
      const src = srcMatch ? srcMatch[1] : '';
      const alt = altMatch ? altMatch[1] : '';
      return src ? `![${alt}](${src})` : '';
    });

    // 列表项（支持多行内容）
    md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');
    md = md.replace(/<\/?[uo]l[^>]*>/gi, '');

    // 分割线
    md = md.replace(/<hr[^>]*>/gi, '---\n\n');

    // 段落（支持多行）
    md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n\n');

    // 换行
    md = md.replace(/<br[^>]*>/gi, '\n');

    // 清理剩余标签
    md = md.replace(/<[^>]+>/g, '');

    // HTML 实体解码
    const textarea = document.createElement('textarea');
    textarea.innerHTML = md;
    md = textarea.value;

    // 清理多余空行
    md = md.replace(/\n{3,}/g, '\n\n');

    return md.trim();
  };

  // 工具栏按钮配置
  const toolbarGroups = [
    {
      name: '标题',
      items: [
        { icon: 'H1', title: '标题1', action: () => execCommand('formatBlock', 'h1') },
        { icon: 'H2', title: '标题2', action: () => execCommand('formatBlock', 'h2') },
        { icon: 'H3', title: '标题3', action: () => execCommand('formatBlock', 'h3') },
      ],
    },
    {
      name: '格式',
      items: [
        { icon: 'B', title: '加粗 (Ctrl+B)', action: () => execCommand('bold'), style: { fontWeight: 700 } },
        { icon: 'I', title: '斜体 (Ctrl+I)', action: () => execCommand('italic'), style: { fontStyle: 'italic' } },
        { icon: 'S', title: '删除线', action: () => execCommand('strikeThrough'), style: { textDecoration: 'line-through' } },
        { icon: '</>', title: '行内代码', action: () => insertMarkdown('`', '`') },
      ],
    },
    {
      name: '列表',
      items: [
        { icon: '•', title: '无序列表', action: () => execCommand('insertUnorderedList') },
        { icon: '1.', title: '有序列表', action: () => execCommand('insertOrderedList') },
        { icon: '❝', title: '引用', action: () => execCommand('formatBlock', 'blockquote') },
        { icon: '☐', title: '任务列表', action: () => insertMarkdown('- [ ] ') },
      ],
    },
    {
      name: '插入',
      items: [
        { icon: '🔗', title: '链接 (Ctrl+K)', action: () => { const url = prompt('链接地址：'); if (url) execCommand('createLink', url); } },
        { icon: '🖼️', title: '图片', action: () => { const url = prompt('图片地址：'); if (url) execCommand('insertImage', url); } },
        { icon: '[[]]', title: '双链', action: () => insertMarkdown('[[', ']]') },
        { icon: '—', title: '分割线', action: () => execCommand('insertHorizontalRule') },
      ],
    },
    {
      name: '代码块',
      items: [
        { icon: '{ }', title: '代码块', action: () => insertMarkdown('\n```\n', '\n```\n') },
      ],
    },
  ];

  // 渲染工具栏按钮
  const renderToolbarButton = (item, idx) => (
    <button
      key={idx}
      onClick={item.action}
      title={item.title}
      disabled={readOnly}
      style={{
        width: 32,
        height: 32,
        border: 'none',
        background: 'transparent',
        color: subTextColor,
        cursor: readOnly ? 'not-allowed' : 'pointer',
        borderRadius: 6,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 13,
        transition: 'all 0.15s ease',
        ...item.style,
      }}
      onMouseEnter={(e) => { if (!readOnly) e.currentTarget.style.background = isNight ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      {item.icon}
    </button>
  );

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: isNight ? '#1a1a1a' : '#fff',
    }}>
      {/* 工具栏 */}
      {!readOnly && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '8px 12px',
          borderBottom: `1px solid ${isNight ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
          background: isNight ? '#222' : '#fafafa',
          overflowX: 'auto',
          flexWrap: 'wrap',
        }}>
          {toolbarGroups.map((group, gIdx) => (
            <div key={gIdx} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {group.items.map((item, idx) => renderToolbarButton(item, idx))}
              {gIdx < toolbarGroups.length - 1 && (
                <div style={{
                  width: 1,
                  height: 20,
                  background: isNight ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  margin: '0 4px',
                }} />
              )}
            </div>
          ))}

          {/* 右侧：模式切换 + 保存状态 + 性能 */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* V2: 大文件模式提示 */}
            {largeFileMode && (
              <span style={{
                fontSize: 10,
                padding: '2px 6px',
                borderRadius: 4,
                background: 'rgba(255, 217, 61, 0.15)',
                color: '#B8860B',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 3,
              }} title="大文件优化模式已启用">
                ⚡ 优化模式
              </span>
            )}

            {/* V2: 性能监控按钮 */}
            {perfStats && (
              <button
                onClick={() => setShowPerfIndicator(!showPerfIndicator)}
                title={`FPS: ${perfStats.fps} | 内存: ${perfStats.memoryUsage}MB`}
                style={{
                  padding: '3px 8px',
                  border: `1px solid ${perfStats.fps >= 50 ? 'rgba(107,203,119,0.3)' : 'rgba(255,107,107,0.3)'}`,
                  borderRadius: 4,
                  background: 'transparent',
                  color: perfStats.fps >= 50 ? '#6BCB77' : '#FF6B6B',
                  fontSize: 10,
                  cursor: 'pointer',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 600,
                }}
              >
                {perfStats.fps} FPS
              </button>
            )}

            {/* 保存状态 */}
            <span style={{ fontSize: 11, color: subTextColor, opacity: 0.7 }}>
              {isSaving ? '保存中...' : lastSaved ? `已保存 ${lastSaved.toLocaleTimeString('zh-CN', {hour:'2-digit',minute:'2-digit'})}` : ''}
            </span>

            {/* 模式切换 */}
            <div style={{
              display: 'flex',
              background: isNight ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
              borderRadius: 6,
              padding: 2,
            }}>
              {['wysiwyg', 'preview', 'source'].map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  style={{
                    padding: '4px 10px',
                    border: 'none',
                    background: mode === m ? (isNight ? 'rgba(255,255,255,0.15)' : '#fff') : 'transparent',
                    color: mode === m ? textColor : subTextColor,
                    fontSize: 11,
                    cursor: 'pointer',
                    borderRadius: 4,
                    fontWeight: mode === m ? 600 : 400,
                  }}
                >
                  {m === 'wysiwyg' ? '编辑' : m === 'preview' ? '预览' : '源码'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 编辑区域 */}
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 20%' }}>
        {mode === 'wysiwyg' && (
          <div
            ref={editorRef}
            contentEditable={!readOnly}
            onInput={handleContentChange}
            onKeyDown={handleKeyDown}
            suppressContentEditableWarning
            style={{
              outline: 'none',
              minHeight: '100%',
              color: textColor,
              fontSize: 15,
              lineHeight: 1.8,
              fontFamily: "'Noto Serif SC', 'Source Han Serif', serif",
            }}
            className="wysiwyg-editor"
          />
        )}

        {mode === 'preview' && (
          <div
            style={{
              color: textColor,
              fontSize: 15,
              lineHeight: 1.8,
              fontFamily: "'Noto Serif SC', 'Source Han Serif', serif",
            }}
            dangerouslySetInnerHTML={{
              __html: window.MarkdownParser ? window.MarkdownParser.parse(content) : content,
            }}
          />
        )}

        {mode === 'source' && (
          <textarea
            value={content}
            onChange={(e) => { setContent(e.target.value); if (onChange) onChange(e.target.value); }}
            style={{
              width: '100%',
              minHeight: '100%',
              border: 'none',
              outline: 'none',
              resize: 'none',
              background: 'transparent',
              color: textColor,
              fontSize: 14,
              lineHeight: 1.7,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            }}
            spellCheck={false}
          />
        )}
      </div>

      {/* V2: 性能指示器浮层 */}
      {showPerfIndicator && perfStats && (
        <div style={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          background: 'rgba(0,0,0,0.85)',
          color: '#fff',
          padding: '12px 16px',
          borderRadius: 10,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          zIndex: 1000,
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          minWidth: 180,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontWeight: 700 }}>
            <span>⚡ 性能监控</span>
            <button onClick={() => setShowPerfIndicator(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 14 }}>×</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ opacity: 0.7 }}>FPS</span>
              <span style={{ color: perfStats.fps >= 50 ? '#6BCB77' : perfStats.fps >= 30 ? '#FFD93D' : '#FF6B6B', fontWeight: 700 }}>{perfStats.fps}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ opacity: 0.7 }}>内存</span>
              <span style={{ color: perfStats.memoryUsage < 100 ? '#6BCB77' : perfStats.memoryUsage < 300 ? '#FFD93D' : '#FF6B6B', fontWeight: 700 }}>{perfStats.memoryUsage} MB</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ opacity: 0.7 }}>渲染</span>
              <span style={{ fontWeight: 700 }}>{perfStats.renderTime} ms</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ opacity: 0.7 }}>保存</span>
              <span style={{ fontWeight: 700 }}>{perfStats.saveTime} ms</span>
            </div>
            {largeFileMode && (
              <div style={{ marginTop: 4, padding: '4px 8px', background: 'rgba(255,217,61,0.2)', borderRadius: 4, color: '#FFD93D', textAlign: 'center', fontSize: 10 }}>
                ⚡ 大文件优化模式
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// 暴露到全局
if (typeof window !== 'undefined') {
  window.WysiwygEditor = WysiwygEditor;
}

console.log('[WysiwygEditor] WYSIWYG编辑器组件已加载');
