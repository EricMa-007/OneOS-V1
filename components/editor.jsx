// Markdown 编辑器组件 —— 所见即所得（WYSIWYG）+ 源码模式
// 使用 contentEditable 模拟 WYSIWYG，通过解析 Markdown 渲染为 HTML

// ============================================
// Markdown 渲染器（轻量实现，支持常用语法）
// ============================================
function renderMarkdown(md, options = {}) {
  const { openLink, onHoverLink, onLeaveLink } = options;
  let html = md;

  // 转义 HTML
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // 代码块 ```language ... ```
  html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
    const lines = code.trim().split('\n');
    const lang = lines[0].trim() || '';
    const codeBody = lines.slice(1).join('\n').trim();
    return `<pre class="md-code-block" data-lang="${lang}"><code>${codeBody}</code></pre>`;
  });

  // 行内代码 `code`
  html = html.replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>');

  // 标题
  html = html.replace(/^###### (.+)$/gm, '<h6 class="md-h6">$1</h6>');
  html = html.replace(/^##### (.+)$/gm, '<h5 class="md-h5">$1</h5>');
  html = html.replace(/^#### (.+)$/gm, '<h4 class="md-h4">$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3 class="md-h3">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="md-h2">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="md-h1">$1</h1>');

  // 分割线
  html = html.replace(/^---$/gm, '<hr class="md-hr" />');

  // 引用
  html = html.replace(/^> (.+)$/gm, '<blockquote class="md-blockquote">$1</blockquote>');

  // 任务列表 - [ ] / - [x]
  html = html.replace(/^- \[ \] (.+)$/gm, (m, text) => {
    return `<div class="md-task-list"><input type="checkbox" disabled class="md-task-checkbox" />${text}</div>`;
  });
  html = html.replace(/^- \[x\] (.+)$/gm, (m, text) => {
    return `<div class="md-task-list"><input type="checkbox" checked disabled class="md-task-checkbox md-task-done" /><span class="md-task-done-text">${text}</span></div>`;
  });

  // 无序列表 - / * / +
  html = html.replace(/^[-*+] (.+)$/gm, '<li class="md-li">$1</li>');

  // 有序列表
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="md-li md-li-ol">$1</li>');

  // 粗体
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="md-strong">$1</strong>');

  // 斜体
  html = html.replace(/\*(.+?)\*/g, '<em class="md-em">$1</em>');

  // 删除线
  html = html.replace(/~~(.+?)~~/g, '<del class="md-del">$1</del>');

  // 双向链接 [[笔记名]]
  html = html.replace(/\[\[([^\]]+)\]\]/g, (match, title) => {
    const safeTitle = title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    return `<span class="md-wikilink" data-title="${safeTitle}">[[${safeTitle}]]</span>`;
  });

  // 链接 [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a class="md-link" href="$2">$1</a>');

  // 标签 #tag (不在代码块内)
  html = html.replace(/(^|\s)#([a-zA-Z\u4e00-\u9fa5][\w\u4e00-\u9fa5\/-]*)/g,
    '$1<span class="md-tag">#$2</span>');

  // 表格
  // 简单的 markdown 表格解析
  const tableRegex = /^\|(.+)\|\n\|[-:| ]+\|\n((?:\|.+\|\n?)+)$/gm;
  html = html.replace(tableRegex, (match, headerRow, bodyRows) => {
    const headers = headerRow.split('|').map(c => c.trim()).filter(c => c !== '');
    const bodyLines = bodyRows.trim().split('\n');
    const rows = bodyLines.map(line => {
      const cells = line.split('|').map(c => c.trim()).filter(c => c !== '');
      return cells;
    });

    let tableHtml = '<table class="md-table"><thead><tr>';
    headers.forEach(h => { tableHtml += `<th>${h}</th>`; });
    tableHtml += '</tr></thead><tbody>';
    rows.forEach(row => {
      tableHtml += '<tr>';
      row.forEach(cell => { tableHtml += `<td>${cell}</td>`; });
      tableHtml += '</tr>';
    });
    tableHtml += '</tbody></table>';
    return tableHtml;
  });

  // 段落（非空行、非标签开头的行）
  // 用 <br/> 连接段落内换行
  const lines = html.split('\n');
  let result = [];
  let inParagraph = false;
  let paraBuffer = [];

  const isBlockElement = (line) => {
    return /^<(h[1-6]|pre|blockquote|hr|table|div|ul|ol|li)/.test(line.trim());
  };

  for (let line of lines) {
    const trimmed = line.trim();
    if (trimmed === '') {
      if (inParagraph) {
        result.push(`<p class="md-p">${paraBuffer.join('<br/>')}</p>`);
        paraBuffer = [];
        inParagraph = false;
      }
      result.push('');
    } else if (isBlockElement(trimmed)) {
      if (inParagraph) {
        result.push(`<p class="md-p">${paraBuffer.join('<br/>')}</p>`);
        paraBuffer = [];
        inParagraph = false;
      }
      result.push(line);
    } else {
      // Frontmatter 行 (--- 和 key: value)
      if (trimmed === '---' || /^[a-zA-Z]+:/.test(trimmed)) {
        if (inParagraph) {
          result.push(`<p class="md-p">${paraBuffer.join('<br/>')}</p>`);
          paraBuffer = [];
          inParagraph = false;
        }
        result.push(`<div class="md-frontmatter-line">${line}</div>`);
      } else {
        inParagraph = true;
        paraBuffer.push(line);
      }
    }
  }
  if (inParagraph) {
    result.push(`<p class="md-p">${paraBuffer.join('<br/>')}</p>`);
  }

  return result.join('\n');
}

// ============================================
// 编辑器组件
// ============================================
function Editor({
  note,
  density,
  focusMode,
  isNight,
  onTitleChange,
  onContentChange,
  onSave,
  isSaving,
  lastSaved,
  editMode, // 'wysiwyg' | 'source'
  onToggleMode,
  onBacklinkClick,
}) {
  const editorRef = React.useRef(null);
  const sourceRef = React.useRef(null);
  const [localContent, setLocalContent] = React.useState(note?.content || '');
  const [localTitle, setLocalTitle] = React.useState(note?.title || '');

  // 当切换笔记时重置内容
  React.useEffect(() => {
    setLocalContent(note?.content || '');
    setLocalTitle(note?.title || '');
  }, [note?.id]);

  // 自动保存
  React.useEffect(() => {
    if (!note) return;
    const timer = setTimeout(() => {
      if (onContentChange && localContent !== note.content) {
        onContentChange(localContent);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [localContent, note?.id]);

  if (!note) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 0,
        position: 'relative',
        background: 'linear-gradient(160deg, #F0F7F4 0%, #E8F4F0 50%, #E0EFE8 100%)',
        overflow: 'hidden',
      }}>
        {/* 3D 装饰元素 */}
        <div className="deco-3d delay-1" style={{
          position: 'absolute',
          top: '15%', left: '10%',
          width: 60, height: 60,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 25%, #fff, #6BE3DC 35%, #3DB8B0 100%)',
          boxShadow: '0 8px 24px rgba(61, 184, 176, 0.3), inset -4px -8px 16px rgba(0,0,0,0.1), inset 4px 6px 12px rgba(255,255,255,0.5)',
        }} />
        <div className="deco-3d delay-2" style={{
          position: 'absolute',
          top: '20%', right: '12%',
          width: 52, height: 52,
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #FFB894, #FF8C5A)',
          boxShadow: '0 6px 20px rgba(255, 140, 90, 0.3), inset -3px -5px 12px rgba(0,0,0,0.1), inset 3px 3px 6px rgba(255,255,255,0.4)',
          transform: 'rotate(-10deg)',
        }} />
        <div className="deco-3d delay-3" style={{
          position: 'absolute',
          bottom: '18%', left: '15%',
          width: 40, height: 40,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9), rgba(248,187,208,0.3))',
          border: '2px solid rgba(255, 255, 255, 0.7)',
        }} />
        <div className="deco-3d delay-1" style={{
          position: 'absolute',
          bottom: '22%', right: '10%',
          width: 70, height: 70,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 25%, #fff, #B39DDB 35%, #7E57C2 100%)',
          boxShadow: '0 12px 32px rgba(126, 87, 194, 0.3), inset -5px -10px 18px rgba(0,0,0,0.12), inset 4px 6px 12px rgba(255,255,255,0.5)',
        }} />

        {/* 中央大铅笔图标 - 3D风格 */}
        <div style={{
          width: 96, height: 96,
          borderRadius: '28px',
          background: 'linear-gradient(135deg, #9B8EF7 0%, #7C6FF0 50%, #5B4FE0 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 40,
          marginBottom: 24,
          boxShadow: '0 20px 48px rgba(124, 111, 240, 0.35), 0 4px 12px rgba(0,0,0,0.1), inset 0 2px 6px rgba(255,255,255,0.4), inset 0 -4px 8px rgba(0,0,0,0.1)',
          zIndex: 1,
          animation: 'floatY 4s ease-in-out infinite',
        }}>
          ✎
        </div>

        <h2 style={{
          fontSize: 32,
          fontWeight: 800,
          fontFamily: "'Poppins', 'Nunito', sans-serif",
          color: '#2D3748',
          marginBottom: 12,
          zIndex: 1,
          letterSpacing: -0.5,
        }}>
          开始书写
        </h2>
        <p style={{
          fontSize: 15,
          color: '#5A6577',
          marginBottom: 32,
          lineHeight: 1.7,
          textAlign: 'center',
          zIndex: 1,
          maxWidth: 380,
          fontWeight: 500,
        }}>
          每一次记录，都是你与自己的对话。<br />
          从一篇笔记开始今天的思考。
        </p>

        <button
          onClick={() => {
            // 触发新建笔记（通过自定义事件）
            const event = new CustomEvent('editor-new-note');
            window.dispatchEvent(event);
          }}
          style={{
            padding: '16px 40px',
            borderRadius: '20px',
            border: 'none',
            background: 'linear-gradient(135deg, #9B8EF7 0%, #7C6FF0 50%, #5B4FE0 100%)',
            color: '#fff',
            fontSize: 16,
            fontWeight: 700,
            fontFamily: "'Nunito', sans-serif",
            cursor: 'pointer',
            boxShadow: '0 12px 32px rgba(124, 111, 240, 0.35)',
            transition: 'all 250ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
            e.currentTarget.style.boxShadow = '0 20px 48px rgba(124, 111, 240, 0.45)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(124, 111, 240, 0.35)';
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          新建笔记
        </button>

        <div style={{
          marginTop: 24,
          fontSize: 13,
          color: '#8B96A8',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 600,
        }}>
          <span>快捷键</span>
          <kbd style={{
            padding: '5px 12px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.8)',
            border: '1px solid rgba(45, 55, 72, 0.08)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            color: '#5A6577',
            fontWeight: 700,
            boxShadow: '0 2px 6px rgba(45, 55, 72, 0.04)',
          }}>⌘N</kbd>
        </div>
      </div>
    );
  }

  const textColor = isNight ? '#E8E6E0' : '#2D3748';
  const subTextColor = isNight ? '#9B998F' : '#718096';
  const bgColor = focusMode ? '#FDF8F0' : (isNight ? '#1E1D1A' : '#FFFFFF');
  const borderColor = isNight ? 'rgba(255,255,255,0.06)' : 'rgba(45, 55, 72, 0.08)';

  const editorMaxWidth = focusMode ? 680 : 'none';
  const editorPadding = focusMode
    ? '0 40px'
    : (density === 'compact' ? '0 32px' : '0 48px');

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
      background: bgColor,
      transition: 'background-color 0.3s ease',
      overflow: 'hidden',
    }}>
       {/* 编辑器工具栏 */}
       <div style={{
         flexShrink: 0,
         padding: density === 'compact' ? '10px 20px' : '12px 28px',
         borderBottom: `1px solid ${borderColor}`,
         display: 'flex',
         alignItems: 'center',
         gap: 12,
         fontSize: 12,
         color: subTextColor,
         transition: 'opacity 0.3s ease',
         opacity: focusMode ? 0 : 1,
         pointerEvents: focusMode ? 'none' : 'auto',
         background: 'rgba(255, 255, 255, 0.5)',
       }}>
         {/* 面包屑 */}
         <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
           <span style={{ opacity: 0.6, fontWeight: 600, fontFamily: "'Nunito', sans-serif" }}>{note.folder}</span>
           <span style={{ opacity: 0.3 }}>/</span>
           <span style={{ color: textColor, fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>{note.title}</span>
         </div>

         <div style={{ flex: 1 }} />

         {/* 模式切换 */}
         <div style={{
           display: 'flex',
           background: 'rgba(45, 55, 72, 0.05)',
           borderRadius: '14px',
           padding: 3,
           gap: 2,
         }}>
           <button
             onClick={() => onToggleMode('wysiwyg')}
             style={{
               padding: '6px 16px',
               borderRadius: '12px',
               fontSize: 12,
               border: 'none',
               background: editMode === 'wysiwyg' ? '#fff' : 'transparent',
               color: editMode === 'wysiwyg' ? textColor : subTextColor,
               cursor: 'pointer',
               boxShadow: editMode === 'wysiwyg' ? '0 2px 8px rgba(45, 55, 72, 0.06)' : 'none',
               transition: 'all 250ms cubic-bezier(0.34, 1.56, 0.64, 1)',
               fontWeight: editMode === 'wysiwyg' ? 700 : 600,
               fontFamily: "'Nunito', sans-serif",
             }}
           >
             所见即所得
           </button>
           <button
             onClick={() => onToggleMode('source')}
             style={{
               padding: '6px 16px',
               borderRadius: '12px',
               fontSize: 12,
               border: 'none',
               background: editMode === 'source' ? '#fff' : 'transparent',
               color: editMode === 'source' ? textColor : subTextColor,
               cursor: 'pointer',
               boxShadow: editMode === 'source' ? '0 2px 8px rgba(45, 55, 72, 0.06)' : 'none',
               transition: 'all 250ms cubic-bezier(0.34, 1.56, 0.64, 1)',
               fontWeight: editMode === 'source' ? 700 : 600,
               fontFamily: "'JetBrains Mono', monospace",
             }}
           >
             源码
           </button>
         </div>

         {/* 保存状态 */}
         <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
           {isSaving ? (
             <>
               <div style={{
                 width: 8, height: 8,
                 borderRadius: '50%',
                 background: 'linear-gradient(135deg, #FFD93D, #FFC107)',
                 animation: 'breathe 1.5s ease-in-out infinite',
                 boxShadow: '0 0 8px rgba(255, 201, 7, 0.5)',
               }} />
               保存中...
             </>
           ) : (
             <>
               <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg, #8DDA97, #4CAF50)', boxShadow: '0 0 6px rgba(107, 203, 119, 0.5)' }} />
               已保存 · {lastSaved || note.updatedAt}
             </>
           )}
         </div>
      </div>

      {/* 编辑区域 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: focusMode
          ? `${density === 'compact' ? 40 : 60}px 0`
          : `${density === 'compact' ? 24 : 32}px 0`,
        display: 'flex',
        justifyContent: 'center',
      }}>
        <div style={{
          width: '100%',
          maxWidth: editorMaxWidth,
          padding: editorPadding,
          color: textColor,
          lineHeight: 1.8,
          fontSize: focusMode ? 16 : (density === 'compact' ? 14 : 15),
        }}>
          {editMode === 'wysiwyg' ? (
            <WysiwygEditor
              ref={editorRef}
              content={localContent}
              onChange={setLocalContent}
              title={localTitle}
              onTitleChange={setLocalTitle}
              isNight={isNight}
              onBacklinkClick={onBacklinkClick}
              note={note}
            />
          ) : (
            <SourceEditor
              ref={sourceRef}
              content={localContent}
              onChange={setLocalContent}
              isNight={isNight}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// WYSIWYG 编辑器（基于 contentEditable + Markdown 渲染）
// ============================================
const WysiwygEditor = React.forwardRef(function WysiwygEditor(
  { content, onChange, title, onTitleChange, isNight, onBacklinkClick, note },
  ref
) {
  const contentRef = React.useRef(null);
  const [hoveredLink, setHoveredLink] = React.useState(null);
  const [linkPreviewPos, setLinkPreviewPos] = React.useState({ x: 0, y: 0 });

  // 找反向链接对应的笔记ID
  const findNoteByTitle = (title) => {
    const entry = Object.entries(KNOWLEDGE_BASE.notes).find(
      ([, n]) => n.title === title
    );
    return entry ? entry[0] : null;
  };

  const renderedHtml = React.useMemo(() => renderMarkdown(content), [content]);

  // 处理双链点击
  const handleContentClick = (e) => {
    const link = e.target.closest('.md-wikilink');
    if (link) {
      const title = link.getAttribute('data-title');
      const noteId = findNoteByTitle(title);
      if (noteId && onBacklinkClick) {
        onBacklinkClick(noteId);
      } else {
        // 找不到的笔记 —— 显示"未创建"提示
        alert(`「${title}」尚未创建`);
      }
      return;
    }
  };

  const handleLinkMouseEnter = (e) => {
    const link = e.target.closest('.md-wikilink');
    if (link) {
      const title = link.getAttribute('data-title');
      const noteId = findNoteByTitle(title);
      setHoveredLink({ title, noteId });
      const rect = link.getBoundingClientRect();
      setLinkPreviewPos({ x: rect.left, y: rect.bottom + 8 });
    }
  };

  const handleLinkMouseLeave = () => {
    setHoveredLink(null);
  };

  // 处理编辑 —— 使用 contentEditable，输入时转换回 markdown 很复杂
  // 简化：提供可编辑的内容区，回车换行，基础编辑
  // 用一个隐藏的 textarea 管理原始 markdown，显示渲染后的版本
  // 点击某个区域进入就地编辑

  // 简化方案：显示渲染后的内容，支持"就地编辑"
  // 点击一段文字时切换为 textarea 编辑
  const [editingSection, setEditingSection] = React.useState(null);

  return (
    <div
      ref={contentRef}
      className="md-article"
      onClick={handleContentClick}
      onMouseOver={handleLinkMouseEnter}
      onMouseOut={handleLinkMouseLeave}
      style={{
        position: 'relative',
      }}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
});

// ============================================
// 源码编辑器（基于 textarea）
// ============================================
const SourceEditor = React.forwardRef(function SourceEditor({ content, onChange, isNight }, ref) {
  const textareaRef = React.useRef(null);

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  // Tab 键插入空格
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + '  ' + content.substring(end);
      onChange(newContent);
      // 光标位置
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <textarea
      ref={(el) => {
        textareaRef.current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) ref.current = el;
      }}
      value={content}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      spellCheck={false}
      style={{
        width: '100%',
        height: 'calc(100vh - 200px)',
        background: 'transparent',
        border: 'none',
        outline: 'none',
        resize: 'none',
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontSize: 13,
        lineHeight: 1.7,
        color: isNight ? '#E8E6E0' : '#3A3935',
        whiteSpace: 'pre',
        overflowWrap: 'normal',
        overflowX: 'auto',
      }}
      placeholder="开始书写..."
    />
  );
});

// ============================================
// 双链预览弹窗
// ============================================
function LinkPreview({ hoveredLink, position, isNight, onClick }) {
  if (!hoveredLink || !hoveredLink.noteId) return null;
  const note = KNOWLEDGE_BASE.notes[hoveredLink.noteId];
  if (!note) return null;

  // 提取第一段作为预览
  const previewText = note.content
    .replace(/^---[\s\S]*?---\n*/, '') // 去掉 frontmatter
    .replace(/^# .+\n+/, '') // 去掉一级标题
    .replace(/[#*_`>\[\]|\-]/g, '') // 去掉 markdown 符号
    .replace(/\n+/g, ' ')
    .trim()
    .substring(0, 120) + '...';

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onClick && onClick(hoveredLink.noteId); }}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: 280,
        background: isNight ? '#2A2925' : '#fff',
        border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.1)'}`,
        borderRadius: 8,
        padding: '14px 16px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        zIndex: 1000,
        cursor: 'pointer',
        animation: 'fadeInUp 0.15s ease both',
      }}
    >
      <div style={{
        fontSize: 13,
        fontWeight: 500,
        fontFamily: "'Noto Serif SC', serif",
        color: isNight ? '#E8E6E0' : '#2B2A26',
        marginBottom: 6,
      }}>
        {note.title}
      </div>
      <div style={{
        fontSize: 12,
        color: isNight ? '#9B998F' : '#6B6960',
        lineHeight: 1.5,
        marginBottom: 10,
      }}>
        {previewText}
      </div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {note.tags.slice(0, 3).map((tag, i) => (
          <span key={i} style={{
            fontSize: 10,
            padding: '2px 6px',
            background: isNight ? 'rgba(255,255,255,0.06)' : 'rgba(61, 74, 107, 0.08)',
            color: '#3D4A6B',
            borderRadius: 4,
          }}>
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, {
  Editor,
  WysiwygEditor,
  SourceEditor,
  renderMarkdown,
  LinkPreview,
});
