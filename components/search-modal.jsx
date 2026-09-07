// 全局搜索弹窗
function SearchModal({ isOpen, onClose, kb, onSelectNote, density, isNight }) {
  const [query, setQuery] = React.useState('');
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef(null);

  const textColor = isNight ? '#E8E6E0' : '#2B2A26';
  const subTextColor = isNight ? '#9B998F' : '#6B6960';
  const bgColor = isNight ? '#2A2925' : '#fff';
  const borderColor = isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.1)';

  // 搜索结果
  const results = React.useMemo(() => {
    if (!query.trim()) {
      // 默认显示最近编辑的 5 篇
      return Object.values(kb.notes)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .slice(0, 5)
        .map(n => ({ note: n, matches: [] }));
    }
    const q = query.toLowerCase();
    const results = [];

    Object.values(kb.notes).forEach(note => {
      const matches = [];
      // 标题匹配
      const titleMatch = note.title.toLowerCase().includes(q);
      if (titleMatch) {
        matches.push({ type: 'title' });
      }
      // 内容匹配
      const lines = note.content.split('\n');
      lines.forEach((line, idx) => {
        if (line.toLowerCase().includes(q) && matches.length < 3) {
          matches.push({ type: 'content', line: idx, snippet: line.trim() });
        }
      });

      if (matches.length > 0) {
        results.push({ note, matches });
      }
    });

    // 标题匹配优先
    results.sort((a, b) => {
      const aTitle = a.matches.some(m => m.type === 'title');
      const bTitle = b.matches.some(m => m.type === 'title');
      if (aTitle && !bTitle) return -1;
      if (!aTitle && bTitle) return 1;
      return b.matches.length - a.matches.length;
    });

    return results;
  }, [query, kb]);

  // 键盘导航
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(Math.min(selectedIndex + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(Math.max(selectedIndex - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        onSelectNote(results[selectedIndex].note.id);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  React.useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 高亮匹配文本
  const highlight = (text, query) => {
    if (!query.trim()) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.substring(0, idx)}
        <mark style={{
          background: 'rgba(201, 162, 63, 0.3)',
          color: 'inherit',
          borderRadius: 2,
          padding: '0 2px',
        }}>
          {text.substring(idx, idx + query.length)}
        </mark>
        {text.substring(idx + query.length)}
      </>
    );
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.2)',
        backdropFilter: 'blur(4px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh',
        animation: 'fadeInUp 0.2s ease both',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 560,
          maxWidth: '90vw',
          maxHeight: '60vh',
          background: bgColor,
          borderRadius: 12,
          border: `1px solid ${borderColor}`,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* 搜索输入框 */}
        <div style={{
          padding: '16px 20px',
          borderBottom: `1px solid ${borderColor}`,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9B998F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="搜索笔记标题与内容..."
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: 15,
              color: textColor,
              fontFamily: 'inherit',
            }}
          />
          <span style={{
            fontSize: 10,
            padding: '2px 6px',
            background: isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.05)',
            borderRadius: 4,
            color: subTextColor,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            Esc
          </span>
        </div>

        {/* 搜索结果 */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px',
        }}>
          {results.length === 0 ? (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: subTextColor,
              fontSize: 13,
            }}>
              没有找到匹配的笔记
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {results.map((r, i) => (
                <div
                  key={r.note.id}
                  onClick={() => { onSelectNote(r.note.id); onClose(); }}
                  onMouseEnter={() => setSelectedIndex(i)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    background: selectedIndex === i
                      ? (isNight ? 'rgba(255,255,255,0.05)' : 'rgba(61, 74, 107, 0.06)')
                      : 'transparent',
                    transition: 'background 0.15s ease',
                    border: selectedIndex === i
                      ? `1px solid ${isNight ? 'rgba(255,255,255,0.08)' : 'rgba(61, 74, 107, 0.15)'}`
                      : '1px solid transparent',
                  }}
                >
                  <div style={{
                    fontSize: 14,
                    fontWeight: 500,
                    fontFamily: "'Noto Serif SC', serif",
                    color: textColor,
                    marginBottom: 4,
                  }}>
                    {highlight(r.note.title, query)}
                  </div>
                  <div style={{ fontSize: 11, color: subTextColor, marginBottom: 6 }}>
                    {r.note.folder}
                  </div>
                  {/* 内容匹配片段 */}
                  {r.matches.filter(m => m.type === 'content').map((m, mi) => (
                    <div key={mi} style={{
                      fontSize: 12,
                      color: subTextColor,
                      lineHeight: 1.5,
                      opacity: 0.8,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      paddingLeft: 8,
                      borderLeft: `2px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.1)'}`,
                      marginLeft: 4,
                    }}>
                      {highlight(m.snippet.substring(0, 80), query)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部快捷键提示 */}
        <div style={{
          padding: '10px 16px',
          borderTop: `1px solid ${borderColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 11,
          color: subTextColor,
        }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <span>
              <kbd style={{
                padding: '2px 5px',
                background: isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.05)',
                borderRadius: 3,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                marginRight: 4,
              }}>↑↓</kbd>
              选择
            </span>
            <span>
              <kbd style={{
                padding: '2px 5px',
                background: isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.05)',
                borderRadius: 3,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                marginRight: 4,
              }}>↵</kbd>
              打开
            </span>
          </div>
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {results.length} 条结果
          </span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SearchModal });
