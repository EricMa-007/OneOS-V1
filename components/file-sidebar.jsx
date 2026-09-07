// ============================================
// 文件侧栏（玻璃拟态重制版）
// 含明显的"+ 新建笔记"按钮
// ============================================

function FileTree({ folders, activeNoteId, onSelectNote, expandedFolders, onToggleFolder, density, isNight }) {
  const dt = DESIGN_TOKENS;
  const pad = density === 'compact' ? 12 : 14;

  // 文件夹颜色映射
  const folderColors = {
    '日常思考': { color: '#7C6FF0', bg: 'rgba(124, 111, 240, 0.12)' },
    '哲学读书笔记': { color: '#4ECDC4', bg: 'rgba(78, 205, 196, 0.12)' },
    '产品思考': { color: '#FFA07A', bg: 'rgba(255, 160, 122, 0.12)' },
    '沟通记录': { color: '#F48FB1', bg: 'rgba(248, 187, 208, 0.18)' },
    '升维卡片': { color: '#6BCB77', bg: 'rgba(107, 203, 119, 0.12)' },
    '升维摘要': { color: '#FFD93D', bg: 'rgba(255, 217, 61, 0.18)' },
    '元知识': { color: '#B39DDB', bg: 'rgba(179, 157, 219, 0.18)' },
  };

  const getFolderColor = (name) => {
    return folderColors[name] || { color: '#7C6FF0', bg: 'rgba(124, 111, 240, 0.1)' };
  };

  const renderItem = (item, level = 0) => {
    if (item.children) {
      const isExpanded = expandedFolders[item.id] ?? item.expanded;
      return (
        <div key={item.id}>
          <div
            onClick={() => onToggleFolder(item.id)}
             style={{
               display: 'flex',
               alignItems: 'center',
               gap: 8,
               padding: `${density === 'compact' ? 6 : 8}px ${pad - 2}px`,
               margin: '2px 6px',
               cursor: 'pointer',
               userSelect: 'none',
               fontSize: density === 'compact' ? 12 : 13,
               color: dt.colors.textPrimary,
               fontWeight: 700,
               borderRadius: '12px',
               transition: 'all 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
               fontFamily: dt.fonts.rounded,
             }}
             onMouseEnter={(e) => {
               e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)';
               e.currentTarget.style.transform = 'translateX(3px)';
             }}
             onMouseLeave={(e) => {
               e.currentTarget.style.background = 'transparent';
               e.currentTarget.style.transform = 'translateX(0)';
             }}
          >
            <svg
              width="10" height="10" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
              style={{
                transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
                color: dt.colors.textTertiary,
                flexShrink: 0,
              }}
            >
              <polyline points="9 6 15 12 9 18" />
            </svg>
             <div style={{
               width: 20, height: 20,
               borderRadius: '6px',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               background: getFolderColor(item.name).bg,
               color: getFolderColor(item.name).color,
               flexShrink: 0,
               fontSize: 12,
             }}>
               <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                 <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
               </svg>
             </div>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.name}
            </span>
          </div>
          {isExpanded && (
            <div style={{ marginLeft: 8 }}>
              {item.children.map(child => renderItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    } else {
      const isActive = activeNoteId === item.id;
      const displayName = item.name.replace(/\.md$/, '');
      return (
         <div
           key={item.id}
           onClick={() => onSelectNote(item.id)}
           style={{
             display: 'flex',
             alignItems: 'center',
             gap: 8,
             padding: `${density === 'compact' ? 6 : 8}px ${pad - 2}px`,
             margin: '2px 6px',
             cursor: 'pointer',
             userSelect: 'none',
             fontSize: density === 'compact' ? 12 : 13,
             color: isActive ? '#5B4FE0' : dt.colors.textSecondary,
             fontWeight: isActive ? 700 : 600,
             background: isActive ? 'rgba(124, 111, 240, 0.1)' : 'transparent',
             borderRadius: '12px',
             transition: 'all 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
             fontFamily: dt.fonts.rounded,
             position: 'relative',
           }}
           onMouseEnter={(e) => {
             if (!isActive) {
               e.currentTarget.style.background = 'rgba(255, 255, 255, 0.7)';
               e.currentTarget.style.transform = 'translateX(3px)';
             }
           }}
           onMouseLeave={(e) => {
             if (!isActive) {
               e.currentTarget.style.background = 'transparent';
               e.currentTarget.style.transform = 'translateX(0)';
             }
           }}
         >
           <div style={{
             width: 18, height: 18,
             borderRadius: '5px',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             background: isActive ? 'rgba(124, 111, 240, 0.15)' : 'rgba(45, 55, 72, 0.04)',
             color: isActive ? '#7C6FF0' : dt.colors.textTertiary,
             flexShrink: 0,
             transition: 'all 200ms ease',
           }}>
             <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
               <polyline points="14 2 14 8 20 8" />
             </svg>
           </div>
          <span style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {displayName}
          </span>
        </div>
      );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {folders.map(folder => renderItem(folder))}
    </div>
  );
}

function FileSidebar({
  kb,
  activeNoteId,
  onSelectNote,
  onNewNote,
  expandedFolders,
  onToggleFolder,
  density,
  onClose,
  showClose = false,
  focusMode,
  isNight,
}) {
  const dt = DESIGN_TOKENS;
  const sidebarWidth = density === 'compact' ? 240 : 280;
  const [filter, setFilter] = React.useState('');

  const filteredFolders = React.useMemo(() => {
    if (!filter.trim()) return kb.folders;
    const q = filter.toLowerCase();
    return kb.folders.map(folder => {
      const files = folder.children.filter(c =>
        !c.children && c.name.toLowerCase().includes(q)
      );
      const subfolders = folder.children.filter(c => c.children).map(sub => {
        const subFiles = sub.children.filter(sc => sc.name.toLowerCase().includes(q));
        if (subFiles.length === 0) return null;
        return { ...sub, children: subFiles, expanded: true };
      }).filter(Boolean);
      if (files.length === 0 && subfolders.length === 0) return null;
      return { ...folder, children: [...files, ...subfolders], expanded: true };
    }).filter(Boolean);
  }, [kb.folders, filter]);

  return (
    <aside style={{
      width: sidebarWidth,
      height: '100%',
      background: 'rgba(255, 255, 255, 0.65)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderRight: '1px solid rgba(255, 255, 255, 0.9)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
      opacity: focusMode ? 0 : 1,
      pointerEvents: focusMode ? 'none' : 'auto',
      boxShadow: '4px 0 20px rgba(45, 55, 72, 0.04)',
    }}>
      {/* 顶部：新建笔记按钮 */}
      <div style={{
        padding: density === 'compact' ? '14px 14px 10px' : '18px 16px 12px',
        borderBottom: `1px solid ${dt.colors.borderSubtle}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{
            fontSize: 15,
            fontWeight: 800,
            fontFamily: dt.fonts.display,
            color: dt.colors.textPrimary,
            letterSpacing: -0.3,
          }}>
            知识库
          </h3>
          {showClose && (
            <button
              onClick={onClose}
              title="收起侧边栏"
              style={{
                width: 24, height: 24,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 6,
                color: dt.colors.textTertiary,
                cursor: 'pointer',
                background: 'transparent',
                border: 'none',
                transition: dt.transition.fast,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = dt.colors.bgGlass; e.currentTarget.style.color = dt.colors.textSecondary; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = dt.colors.textTertiary; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
        </div>

        {/* 显眼的新建笔记按钮 */}
         <button
           onClick={onNewNote}
           style={{
             width: '100%',
             padding: '11px 16px',
             borderRadius: '16px',
             background: 'linear-gradient(135deg, #9B8EF7 0%, #7C6FF0 50%, #5B4FE0 100%)',
             border: 'none',
             color: '#fff',
             fontSize: 13,
             fontWeight: 700,
             fontFamily: dt.fonts.rounded,
             cursor: 'pointer',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             gap: 8,
             transition: 'all 250ms cubic-bezier(0.34, 1.56, 0.64, 1)',
             boxShadow: '0 6px 20px rgba(124, 111, 240, 0.3)',
           }}
         onMouseEnter={(e) => {
           e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
           e.currentTarget.style.boxShadow = '0 10px 28px rgba(124, 111, 240, 0.4)';
         }}
         onMouseLeave={(e) => {
           e.currentTarget.style.transform = 'translateY(0) scale(1)';
           e.currentTarget.style.boxShadow = '0 6px 20px rgba(124, 111, 240, 0.3)';
         }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          新建笔记
          <span style={{
            marginLeft: 4,
            fontSize: 9.5,
            opacity: 0.7,
            fontFamily: dt.fonts.mono,
          }}>
            ⌘N
          </span>
        </button>

        {/* 搜索过滤 */}
        <div style={{
          padding: '9px 14px',
          background: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '14px',
          border: '1px solid rgba(45, 55, 72, 0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 12,
          color: dt.colors.textTertiary,
          transition: 'all 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="搜索笔记..."
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: 12,
              color: dt.colors.textPrimary,
              fontFamily: 'inherit',
            }}
          />
        </div>
      </div>

      {/* 文件树 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: density === 'compact' ? '6px 0' : '8px 0',
      }}>
        <FileTree
          folders={filteredFolders}
          activeNoteId={activeNoteId}
          onSelectNote={onSelectNote}
          expandedFolders={expandedFolders}
          onToggleFolder={onToggleFolder}
          density={density}
          isNight={isNight}
        />
      </div>

      {/* 底部统计 */}
      <div style={{
        padding: density === 'compact' ? '8px 14px' : '10px 16px',
        borderTop: `1px solid ${dt.colors.borderSubtle}`,
        fontSize: 10.5,
        color: dt.colors.textTertiary,
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: dt.fonts.mono,
      }}>
        <span>{Object.keys(kb.notes).length} 篇笔记</span>
        <span>{kb.tags.length} 个标签</span>
      </div>
    </aside>
  );
}

Object.assign(window, { FileTree, FileSidebar });
