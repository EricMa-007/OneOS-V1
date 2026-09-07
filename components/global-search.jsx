// ============================================
// OneOS V2 - 全局搜索UI组件
// 搜索框 + 结果展示 + 高亮 + 快捷键
// ============================================

function GlobalSearch({
  isOpen,
  onClose,
  onSelect,
  isNight = false,
  placeholder = '搜索笔记、标签、内容... (Ctrl+K)',
}) {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState([]);
  const [suggestions, setSuggestions] = React.useState([]);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [isSearching, setIsSearching] = React.useState(false);
  const [showHistory, setShowHistory] = React.useState(true);
  const inputRef = React.useRef(null);
  const searchTimerRef = React.useRef(null);

  // 打开时聚焦
  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
      setResults([]);
      setSuggestions([]);
      setSelectedIndex(0);
      setShowHistory(true);
    }
  }, [isOpen]);

  // ESC关闭
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && results.length > 0) {
        e.preventDefault();
        handleSelect(results[selectedIndex]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  // 搜索（防抖）
  const handleSearch = (value) => {
    setQuery(value);
    setShowHistory(false);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    if (!value.trim()) {
      setResults([]);
      setSuggestions([]);
      setShowHistory(true);
      return;
    }

    setIsSearching(true);
    searchTimerRef.current = setTimeout(() => {
      // 搜索建议
      if (window.SearchService) {
        const sugg = window.SearchService.suggest(value, 5);
        setSuggestions(sugg);
        // 执行搜索
        const res = window.SearchService.search(value, { limit: 20 });
        setResults(res);
        setSelectedIndex(0);
      }
      setIsSearching(false);
    }, 200);
  };

  // 选择结果
  const handleSelect = (result) => {
    if (onSelect) onSelect(result);
    onClose();
  };

  // 清除历史
  const clearHistory = () => {
    if (window.SearchService) {
      window.SearchService.clearHistory();
      setShowHistory(false);
    }
  };

  if (!isOpen) return null;

  const history = window.SearchService ? window.SearchService.searchHistory : [];

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: '15vh',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '90%', maxWidth: 640,
          background: isNight ? '#1a1a1a' : '#fff',
          borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          overflow: 'hidden', border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        }}
      >
        {/* 搜索框 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '16px 20px', borderBottom: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}`,
        }}>
          <span style={{ fontSize: 20, opacity: 0.5 }}>🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={placeholder}
            style={{
              flex: 1, border: 'none', outline: 'none',
              background: 'transparent', fontSize: 16,
              color: isNight ? '#fff' : '#333',
              fontFamily: 'inherit',
            }}
          />
          {isSearching && (
            <span style={{ fontSize: 14, opacity: 0.5, animation: 'spin 1s linear infinite' }}>⏳</span>
          )}
          <button
            onClick={onClose}
            style={{
              padding: '4px 10px', borderRadius: 6, border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              background: 'transparent', cursor: 'pointer', color: isNight ? '#aaa' : '#666', fontSize: 12,
            }}
          >ESC</button>
        </div>

        {/* 搜索建议 */}
        {suggestions.length > 0 && query && (
          <div style={{ padding: '8px 20px', borderBottom: `1px solid ${isNight ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}` }}>
            <div style={{ fontSize: 11, color: isNight ? '#666' : '#999', marginBottom: 6 }}>搜索建议</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSearch(s)}
                  style={{
                    padding: '4px 10px', borderRadius: 6, border: 'none',
                    background: isNight ? 'rgba(124,111,240,0.15)' : 'rgba(124,111,240,0.08)',
                    color: '#7C6FF0', cursor: 'pointer', fontSize: 12,
                  }}
                >{s}</button>
              ))}
            </div>
          </div>
        )}

        {/* 搜索历史 */}
        {showHistory && history.length > 0 && (
          <div style={{ padding: '12px 20px', maxHeight: 300, overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: isNight ? '#666' : '#999', fontWeight: 600 }}>搜索历史</span>
              <button onClick={clearHistory} style={{ background: 'none', border: 'none', color: isNight ? '#666' : '#999', fontSize: 11, cursor: 'pointer' }}>清除</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {history.slice(0, 10).map((h, i) => (
                <button
                  key={i}
                  onClick={() => handleSearch(h)}
                  style={{
                    padding: '4px 10px', borderRadius: 6, border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                    background: 'transparent', color: isNight ? '#aaa' : '#666', cursor: 'pointer', fontSize: 12,
                  }}
                >🕐 {h}</button>
              ))}
            </div>
          </div>
        )}

        {/* 搜索结果 */}
        {results.length > 0 && (
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {results.map((result, index) => (
              <div
                key={result.id}
                onClick={() => handleSelect(result)}
                onMouseEnter={() => setSelectedIndex(index)}
                style={{
                  padding: '12px 20px', cursor: 'pointer',
                  background: selectedIndex === index
                    ? (isNight ? 'rgba(124,111,240,0.15)' : 'rgba(124,111,240,0.08)')
                    : 'transparent',
                  borderLeft: selectedIndex === index ? '3px solid #7C6FF0' : '3px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 14 }}>
                    {result.matchedFields.includes('title') ? '📄' : result.matchedFields.includes('tags') ? '🏷️' : '📝'}
                  </span>
                  <span
                    style={{ fontWeight: 600, fontSize: 14, color: isNight ? '#fff' : '#333', flex: 1 }}
                    dangerouslySetInnerHTML={{ __html: result.titleHighlight || result.document.title }}
                  />
                  <span style={{ fontSize: 10, color: isNight ? '#666' : '#999', fontFamily: "'JetBrains Mono', monospace" }}>
                    {result.score}
                  </span>
                </div>
                {result.contentSnippet && (
                  <div
                    style={{ fontSize: 12, color: isNight ? '#aaa' : '#666', lineHeight: 1.5, paddingLeft: 22 }}
                    dangerouslySetInnerHTML={{ __html: result.contentSnippet }}
                  />
                )}
                <div style={{ display: 'flex', gap: 6, marginTop: 6, paddingLeft: 22 }}>
                  {result.matchedFields.map(f => (
                    <span key={f} style={{
                      fontSize: 10, padding: '1px 6px', borderRadius: 3,
                      background: isNight ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                      color: isNight ? '#888' : '#999',
                    }}>{f === 'title' ? '标题' : f === 'content' ? '内容' : '标签'}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 无结果 */}
        {query && !isSearching && results.length === 0 && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: isNight ? '#666' : '#999' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
            <div style={{ fontSize: 14 }}>未找到与 "{query}" 相关的结果</div>
            <div style={{ fontSize: 12, marginTop: 4, opacity: 0.7 }}>试试其他关键词，或检查拼写</div>
          </div>
        )}

        {/* 底部提示 */}
        <div style={{
          padding: '8px 20px', borderTop: `1px solid ${isNight ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: 11, color: isNight ? '#666' : '#999',
        }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <span>↑↓ 选择</span>
            <span>Enter 打开</span>
            <span>ESC 关闭</span>
          </div>
          <span>{results.length > 0 ? `${results.length} 个结果` : ''}</span>
        </div>
      </div>
    </div>
  );
}

// 紧凑搜索框组件
function SearchBar({ onOpen, isNight = false, style }) {
  return (
    <button
      onClick={onOpen}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 14px', borderRadius: 10,
        border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
        background: isNight ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
        cursor: 'pointer', color: isNight ? '#aaa' : '#666', fontSize: 13,
        ...style,
      }}
    >
      <span>🔍</span>
      <span>搜索...</span>
      <span style={{ marginLeft: 'auto', fontSize: 10, padding: '2px 6px', borderRadius: 4, background: isNight ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}>Ctrl+K</span>
    </button>
  );
}

if (typeof window !== 'undefined') {
  window.GlobalSearch = GlobalSearch;
  window.SearchBar = SearchBar;
}

console.log('[GlobalSearch] 全局搜索UI组件已加载');
