// 右侧面板 —— 反向链接 + 标签
function RightPanel({
  note,
  kb,
  density,
  isNight,
  focusMode,
  activeTab,
  onTabChange,
  onNoteClick,
  onTagClick,
  activeTag,
  onClose,
  showClose = false,
}) {
   const panelWidth = density === 'compact' ? 240 : 280;
   const textColor = '#2D3748';
   const subTextColor = '#5A6577';
   const bgColor = 'rgba(255, 255, 255, 0.6)';
   const borderColor = 'rgba(45, 55, 72, 0.06)';

  // 当前笔记的反向链接
  const backlinks = React.useMemo(() => {
    if (!note) return [];
    return (note.backlinks || [])
      .map(id => kb.notes[id])
      .filter(Boolean);
  }, [note?.id, kb]);

  // 标签列表按分类分组
  const tagCategories = React.useMemo(() => {
    const cats = {};
    kb.tags.forEach(tag => {
      // 简单按颜色分组（同色系为一类）
      const color = tag.color;
      if (!cats[color]) cats[color] = [];
      cats[color].push(tag);
    });
    return cats;
  }, [kb.tags]);

  const categoryNames = {
    '#3D4A6B': 'OneOS · 方法论',
    '#B56B3A': '哲学 · 存在主义',
    '#5A7A4E': '技术 · 工程',
    '#C9A23F': '社会 · 文化',
    '#9B6BA0': '艺术 · 音乐',
    '#6B6960': '日常 · 笔记',
    '#9B998F': '归档',
  };

  return (
    <aside style={{
      width: panelWidth,
      height: '100vh',
      background: bgColor,
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderLeft: '1px solid rgba(255, 255, 255, 0.9)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
      opacity: focusMode ? 0 : 1,
      pointerEvents: focusMode ? 'none' : 'auto',
      boxShadow: '-4px 0 20px rgba(45, 55, 72, 0.04)',
    }}>
        {/* Tab 切换 */}
        <div style={{
          flexShrink: 0,
          padding: density === 'compact' ? '10px 10px' : '12px 12px',
          borderBottom: '1px solid rgba(45, 55, 72, 0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}>
          {[
            { id: 'backlinks', label: '被引用', count: backlinks.length },
            { id: 'tags', label: '标签', count: kb.tags.length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                flex: 1,
                padding: density === 'compact' ? '8px 12px' : '10px 14px',
                borderRadius: '14px',
                border: 'none',
                background: activeTab === tab.id
                  ? 'linear-gradient(135deg, #9B8EF7, #7C6FF0)'
                  : 'transparent',
                color: activeTab === tab.id ? '#fff' : subTextColor,
                fontSize: 12,
                fontWeight: activeTab === tab.id ? 700 : 600,
                fontFamily: "'Nunito', sans-serif",
                cursor: 'pointer',
                transition: 'all 250ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: activeTab === tab.id ? '0 4px 12px rgba(124, 111, 240, 0.25)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) e.currentTarget.style.background = 'rgba(255,255,255,0.6)';
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) e.currentTarget.style.background = 'transparent';
              }}
            >
              {tab.label}
              <span style={{
                fontSize: 10,
                padding: '2px 8px',
                borderRadius: '999px',
                background: activeTab === tab.id
                  ? 'rgba(255,255,255,0.25)'
                  : 'rgba(45, 55, 72, 0.06)',
                color: activeTab === tab.id ? '#fff' : subTextColor,
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 700,
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        {showClose && (
          <button
            onClick={onClose}
            title="收起面板"
            style={{
              width: 28, height: 28,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 4,
              color: subTextColor,
              cursor: 'pointer',
              border: 'none',
              background: 'transparent',
              marginLeft: 4,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}
      </div>

      {/* 内容区 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: density === 'compact' ? '8px 0' : '12px 0',
      }}>
        {activeTab === 'backlinks' ? (
          window.BacklinkPanel ? (
            <BacklinkPanel
              noteId={note?.id}
              noteTitle={note?.title}
              onNoteClick={onNoteClick}
              isNight={isNight}
              textColor="#2D3748"
              subTextColor="#5A6577"
            />
          ) : (
            <BacklinksPanel
              backlinks={backlinks}
              note={note}
              density={density}
              isNight={isNight}
              onNoteClick={onNoteClick}
            />
          )
        ) : (
          window.TagManagerPanel ? (
            <TagManagerPanel
              onTagClick={onTagClick}
              onNoteClick={onNoteClick}
              isNight={isNight}
              textColor="#2D3748"
              subTextColor="#5A6577"
            />
          ) : (
            <TagsPanel
              tags={kb.tags}
              tagCategories={tagCategories}
              categoryNames={categoryNames}
              density={density}
              isNight={isNight}
              activeTag={activeTag}
              onTagClick={onTagClick}
            />
          )
        )}
      </div>
    </aside>
  );
}

function BacklinksPanel({ backlinks, note, density, isNight, onNoteClick }) {
  const subTextColor = isNight ? '#9B998F' : '#6B6960';

  if (!note) {
    return (
      <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: 12, color: subTextColor }}>
        选择一篇笔记查看被引用情况
      </div>
    );
  }

  if (backlinks.length === 0) {
    return (
      <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: 12, color: subTextColor }}>
        <p style={{ marginBottom: 6 }}>还没有被其他笔记引用</p>
        <p style={{ fontSize: 11, opacity: 0.7 }}>
          在其他笔记中使用 <code style={{
            fontSize: 10,
            padding: '1px 4px',
            background: isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.05)',
            borderRadius: 3,
            fontFamily: "'JetBrains Mono', monospace",
          }}>[[笔记名]]</code> 可以添加链接
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '0 8px' }}>
      <div style={{
        fontSize: 10.5,
        textTransform: 'uppercase',
        letterSpacing: 1,
        color: subTextColor,
        padding: '4px 8px 8px',
        fontFamily: "'JetBrains Mono', monospace",
        opacity: 0.6,
      }}>
        被以下笔记引用
      </div>
      {backlinks.map(bl => {
        // 找到引用片段
        const snippet = extractBacklinkSnippet(bl.content, note.title);
        return (
          <div
            key={bl.id}
            onClick={() => onNoteClick && onNoteClick(bl.id)}
            style={{
              padding: density === 'compact' ? '8px 10px' : '10px 12px',
              borderRadius: 6,
              cursor: 'pointer',
              transition: 'background 0.15s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = isNight
              ? 'rgba(255,255,255,0.03)'
              : 'rgba(43, 42, 38, 0.03)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{
              fontSize: 12,
              fontWeight: 500,
              color: isNight ? '#E8E6E0' : '#2B2A26',
              fontFamily: "'Noto Serif SC', serif",
            }}>
              {bl.title}
            </div>
            {snippet && (
              <div style={{
                fontSize: 11,
                color: subTextColor,
                lineHeight: 1.5,
                opacity: 0.8,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}>
                {snippet}
              </div>
            )}
            <div style={{ fontSize: 10, color: '#9B998F', fontFamily: "'JetBrains Mono', monospace" }}>
              {bl.folder}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function extractBacklinkSnippet(content, title) {
  const lines = content.split('\n');
  for (let line of lines) {
    if (line.includes(`[[${title}]]`)) {
      // 清理 markdown 符号
      let clean = line.replace(/^[#>*\-+\s]+/, '').trim();
      clean = clean.replace(/\[\[([^\]]+)\]\]/g, '「$1」');
      clean = clean.replace(/[`*_~]/g, '');
      if (clean.length > 60) clean = clean.substring(0, 60) + '...';
      return clean;
    }
  }
  return null;
}

function TagsPanel({ tags, tagCategories, categoryNames, density, isNight, activeTag, onTagClick }) {
  const textColor = isNight ? '#E8E6E0' : '#2B2A26';
  const subTextColor = isNight ? '#9B998F' : '#6B6960';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: density === 'compact' ? 8 : 12, padding: '0 12px' }}>
      {activeTag && (
        <div style={{
          padding: '8px 10px',
          background: isNight ? 'rgba(255,255,255,0.04)' : 'rgba(61, 74, 107, 0.06)',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 12,
        }}>
          <span style={{ color: '#3D4A6B' }}>#{activeTag}</span>
          <button
            onClick={() => onTagClick && onTagClick(null)}
            style={{
              fontSize: 10,
              color: subTextColor,
              cursor: 'pointer',
              border: 'none',
              background: 'transparent',
              padding: '2px 6px',
              borderRadius: 4,
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = textColor}
            onMouseLeave={(e) => e.currentTarget.style.color = subTextColor}
          >
            清除
          </button>
        </div>
      )}

      {Object.entries(tagCategories).map(([color, tagList]) => (
        <div key={color} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{
            fontSize: 10,
            color: subTextColor,
            padding: '0 4px',
            textTransform: 'uppercase',
            letterSpacing: 1,
            opacity: 0.7,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
            {categoryNames[color] || '其他'}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '0 2px' }}>
            {tagList.map(tag => {
              const isActive = activeTag === tag.name;
              return (
                <button
                  key={tag.name}
                  onClick={() => onTagClick && onTagClick(tag.name)}
                  style={{
                    padding: '4px 8px',
                    fontSize: 11,
                    borderRadius: 4,
                    border: isActive ? `1px solid ${tag.color}` : '1px solid transparent',
                    background: isActive
                      ? (isNight ? 'rgba(255,255,255,0.06)' : `${tag.color}12`)
                      : (isNight ? 'rgba(255,255,255,0.03)' : 'rgba(43, 42, 38, 0.03)'),
                    color: isActive ? tag.color : subTextColor,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontWeight: isActive ? 500 : 400,
                  }}
                >
                  <span>#{tag.name}</span>
                  <span style={{
                    fontSize: 9,
                    opacity: 0.7,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    {tag.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { RightPanel });
