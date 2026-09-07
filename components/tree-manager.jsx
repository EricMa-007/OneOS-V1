// ============================================
// OneOS V2 - 文件树管理组件（增强版）
// 支持：新建/重命名/删除/搜索/排序/右键菜单
// ============================================

function TreeManager({
  notes = [],
  folders = [],
  activeNoteId,
  onSelectNote,
  onNewNote,
  onNewFolder,
  onRenameNote,
  onDeleteNote,
  onMoveNote,
  expandedFolders,
  onToggleFolder,
  isNight = false,
  textColor = '#2D3436',
  subTextColor = '#636E72',
  density = 'normal',
}) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortBy, setSortBy] = React.useState('updated'); // updated | created | name
  const [contextMenu, setContextMenu] = React.useState(null); // {x, y, type, item}
  const [editingId, setEditingId] = React.useState(null);
  const [editingName, setEditingName] = React.useState('');
  const [draggedItem, setDraggedItem] = React.useState(null);
  const [dragOverFolder, setDragOverFolder] = React.useState(null);

  const pad = density === 'compact' ? 10 : 12;

  // 文件夹颜色映射
  const folderColors = {
    '日常思考': '#7C6FF0',
    '哲学读书笔记': '#4ECDC4',
    '产品思考': '#FFA07A',
    '沟通记录': '#F48FB1',
    '升维卡片': '#6BCB77',
    '升维摘要': '#FFD93D',
    '元知识': '#B39DDB',
    '未分类': '#95A5A6',
  };

  const getFolderColor = (name) => folderColors[name] || '#7C6FF0';

  // 过滤和排序笔记
  const filteredNotes = React.useMemo(() => {
    let list = [...notes];
    // 搜索过滤
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(n =>
        (n.title || '').toLowerCase().includes(q) ||
        (n.content || '').toLowerCase().includes(q) ||
        (n.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }
    // 排序
    list.sort((a, b) => {
      if (sortBy === 'name') {
        return (a.title || '').localeCompare(b.title || '', 'zh-CN');
      } else if (sortBy === 'created') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      } else {
        return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
      }
    });
    return list;
  }, [notes, searchQuery, sortBy]);

  // 按文件夹分组
  const groupedNotes = React.useMemo(() => {
    const groups = {};
    filteredNotes.forEach(note => {
      const folder = note.folder || '未分类';
      if (!groups[folder]) groups[folder] = [];
      groups[folder].push(note);
    });
    return groups;
  }, [filteredNotes]);

  // 所有文件夹（包括动态生成的）
  const allFolders = React.useMemo(() => {
    const folderSet = new Set(folders.map(f => f.name || f));
    Object.keys(groupedNotes).forEach(f => folderSet.add(f));
    return Array.from(folderSet).sort();
  }, [folders, groupedNotes]);

  // 关闭右键菜单
  React.useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // 重命名
  const startRename = (item, type) => {
    setEditingId(item.id);
    setEditingName(type === 'note' ? (item.title || '') : (item.name || ''));
    setContextMenu(null);
  };

  const confirmRename = (item, type) => {
    if (editingName.trim()) {
      if (type === 'note' && onRenameNote) {
        onRenameNote(item.id, editingName.trim());
      }
    }
    setEditingId(null);
    setEditingName('');
  };

  // 删除
  const handleDelete = (item, type) => {
    if (type === 'note' && onDeleteNote) {
      if (confirm(`确定删除笔记「${item.title || item.name}」吗？`)) {
        onDeleteNote(item.id);
      }
    }
    setContextMenu(null);
  };

  // 右键菜单
  const handleContextMenu = (e, item, type) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, type, item });
  };

  // 拖拽
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, folderName) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverFolder(folderName);
  };

  const handleDrop = (e, folderName) => {
    e.preventDefault();
    if (draggedItem && onMoveNote) {
      onMoveNote(draggedItem.id, folderName);
    }
    setDraggedItem(null);
    setDragOverFolder(null);
  };

  // 渲染笔记项
  const renderNoteItem = (note, level = 0) => {
    const isActive = activeNoteId === note.id;
    const isEditing = editingId === note.id;
    const displayName = (note.title || note.name || '').replace(/\.md$/, '');

    return (
      <div
        key={note.id}
        draggable
        onDragStart={(e) => handleDragStart(e, note)}
        onContextMenu={(e) => handleContextMenu(e, note, 'note')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: `${density === 'compact' ? 5 : 7}px ${pad}px`,
          margin: '1px 8px',
          paddingLeft: pad + level * 16,
          cursor: 'pointer',
          borderRadius: 8,
          background: isActive ? 'rgba(124, 111, 240, 0.12)' : 'transparent',
          borderLeft: isActive ? '3px solid #7C6FF0' : '3px solid transparent',
          transition: 'all 0.15s ease',
          opacity: draggedItem?.id === note.id ? 0.4 : 1,
        }}
        onClick={() => !isEditing && onSelectNote(note.id)}
        onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = isNight ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'; }}
        onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isActive ? '#7C6FF0' : subTextColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        {isEditing ? (
          <input
            autoFocus
            value={editingName}
            onChange={(e) => setEditingName(e.target.value)}
            onBlur={() => confirmRename(note, 'note')}
            onKeyDown={(e) => { if (e.key === 'Enter') confirmRename(note, 'note'); if (e.key === 'Escape') { setEditingId(null); setEditingName(''); } }}
            style={{
              flex: 1,
              border: '1px solid #7C6FF0',
              borderRadius: 4,
              padding: '2px 6px',
              fontSize: 13,
              outline: 'none',
              background: isNight ? '#333' : '#fff',
              color: textColor,
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span style={{
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: density === 'compact' ? 12 : 13,
            color: isActive ? '#7C6FF0' : textColor,
            fontWeight: isActive ? 600 : 400,
          }}>
            {displayName}
          </span>
        )}
        {/* 笔记状态图标 */}
        {note.pinned && (
          <span style={{ fontSize: 10, color: '#FFD93D' }}>📌</span>
        )}
      </div>
    );
  };

  // 渲染文件夹
  const renderFolder = (folderName) => {
    const isExpanded = expandedFolders[folderName] ?? true;
    const folderNotes = groupedNotes[folderName] || [];
    const isDragOver = dragOverFolder === folderName;
    const color = getFolderColor(folderName);

    return (
      <div key={folderName}>
        <div
          onClick={() => onToggleFolder(folderName)}
          onContextMenu={(e) => handleContextMenu(e, { id: folderName, name: folderName }, 'folder')}
          onDragOver={(e) => handleDragOver(e, folderName)}
          onDragLeave={() => setDragOverFolder(null)}
          onDrop={(e) => handleDrop(e, folderName)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: `${density === 'compact' ? 6 : 8}px ${pad}px`,
            margin: '2px 6px',
            cursor: 'pointer',
            userSelect: 'none',
            borderRadius: 8,
            background: isDragOver ? `${color}20` : 'transparent',
            border: isDragOver ? `1px dashed ${color}` : '1px solid transparent',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = isNight ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'; }}
          onMouseLeave={(e) => { if (!isDragOver) e.currentTarget.style.background = 'transparent'; }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={subTextColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', flexShrink: 0 }}>
            <polyline points="9 6 15 12 9 18" />
          </svg>
          <div style={{ width: 18, height: 18, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}15`, color, flexShrink: 0 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
            </svg>
          </div>
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: density === 'compact' ? 12 : 13, color: textColor, fontWeight: 600 }}>
            {folderName}
          </span>
          <span style={{ fontSize: 11, color: subTextColor, opacity: 0.6 }}>{folderNotes.length}</span>
        </div>
        {isExpanded && folderNotes.map(note => renderNoteItem(note, 1))}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: isNight ? '#1a1a1a' : '#fafafa' }}>
      {/* 顶部工具栏 */}
      <div style={{ padding: '12px 12px 8px', borderBottom: `1px solid ${isNight ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}` }}>
        {/* 搜索框 */}
        <div style={{ position: 'relative', marginBottom: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={subTextColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="搜索笔记..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 10px 7px 32px',
              border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              borderRadius: 8,
              background: isNight ? '#222' : '#fff',
              color: textColor,
              fontSize: 13,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: subTextColor, cursor: 'pointer', fontSize: 16 }}>×</button>
          )}
        </div>

        {/* 操作按钮行 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={onNewNote}
            style={{
              flex: 1,
              padding: '7px 10px',
              border: 'none',
              borderRadius: 8,
              background: 'linear-gradient(135deg, #7C6FF0, #6C5CE7)',
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            新建笔记
          </button>
          <button
            onClick={onNewFolder}
            title="新建文件夹"
            style={{
              width: 32, height: 32,
              border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              borderRadius: 8,
              background: 'transparent',
              color: subTextColor,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              <line x1="12" y1="11" x2="12" y2="17" />
              <line x1="9" y1="14" x2="15" y2="14" />
            </svg>
          </button>
          {/* 排序选择 */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            title="排序方式"
            style={{
              height: 32,
              padding: '0 6px',
              border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              borderRadius: 8,
              background: isNight ? '#222' : '#fff',
              color: subTextColor,
              fontSize: 11,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="updated">最近更新</option>
            <option value="created">创建时间</option>
            <option value="name">名称</option>
          </select>
        </div>
      </div>

      {/* 文件树列表 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {allFolders.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: subTextColor, fontSize: 13 }}>
            暂无笔记，点击上方按钮创建
          </div>
        ) : (
          allFolders.map(folderName => renderFolder(folderName))
        )}
      </div>

      {/* 底部统计 */}
      <div style={{ padding: '8px 16px', borderTop: `1px solid ${isNight ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`, fontSize: 11, color: subTextColor, display: 'flex', justifyContent: 'space-between' }}>
        <span>{filteredNotes.length} 篇笔记</span>
        <span>{allFolders.length} 个文件夹</span>
      </div>

      {/* 右键菜单 */}
      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            background: isNight ? '#2a2a2a' : '#fff',
            border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            padding: 4,
            zIndex: 10000,
            minWidth: 140,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.type === 'note' && (
            <>
              <button onClick={() => { onSelectNote(contextMenu.item.id); setContextMenu(null); }} style={menuItemStyle(isNight)}>
                📖 打开
              </button>
              <button onClick={() => startRename(contextMenu.item, 'note')} style={menuItemStyle(isNight)}>
                ✏️ 重命名
              </button>
              <button onClick={() => handleDelete(contextMenu.item, 'note')} style={{ ...menuItemStyle(isNight), color: '#E74C3C' }}>
                🗑️ 删除
              </button>
            </>
          )}
          {contextMenu.type === 'folder' && (
            <>
              <button onClick={() => { onToggleFolder(contextMenu.item.id); setContextMenu(null); }} style={menuItemStyle(isNight)}>
                {expandedFolders[contextMenu.item.id] ? '📁 折叠' : '📂 展开'}
              </button>
              <button onClick={() => { onNewNote(contextMenu.item.id); setContextMenu(null); }} style={menuItemStyle(isNight)}>
                📝 新建笔记
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// 右键菜单项样式
function menuItemStyle(isNight) {
  return {
    display: 'block',
    width: '100%',
    padding: '8px 12px',
    border: 'none',
    background: 'transparent',
    color: isNight ? '#fff' : '#333',
    fontSize: 13,
    textAlign: 'left',
    cursor: 'pointer',
    borderRadius: 4,
  };
}

// 暴露到全局
if (typeof window !== 'undefined') {
  window.TreeManager = TreeManager;
}

console.log('[TreeManager] 文件树管理组件已加载');
