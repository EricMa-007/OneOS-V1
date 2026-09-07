// ============================================
// OneOS V2 - 标签管理面板组件
// 标签云、标签列表、筛选、管理操作
// ============================================

function TagManagerPanel({
  onTagSelect,
  onNoteClick,
  isNight = false,
  textColor = '#2D3436',
  subTextColor = '#636E72',
}) {
  const [tags, setTags] = React.useState([]);
  const [tagCloud, setTagCloud] = React.useState([]);
  const [selectedTag, setSelectedTag] = React.useState(null);
  const [tagNotes, setTagNotes] = React.useState([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [viewMode, setViewMode] = React.useState('cloud'); // cloud | list
  const [sortBy, setSortBy] = React.useState('count'); // count | name
  const [isLoading, setIsLoading] = React.useState(true);
  const [stats, setStats] = React.useState(null);
  const [contextMenu, setContextMenu] = React.useState(null);
  const [editingTag, setEditingTag] = React.useState(null);
  const [editingName, setEditingName] = React.useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorPickerTag, setColorPickerTag] = useState(null);

  const PRESET_COLORS = [
    '#7C6FF0', '#4ECDC4', '#FF6B6B', '#FFD93D', '#6BCB77',
    '#FF9F43', '#54A0FF', '#5F27CD', '#EE5A6F', '#00D2D3',
    '#FECA57', '#FF9FF3',
  ];

  // 加载标签数据
  React.useEffect(() => {
    if (!window.TagService) {
      setIsLoading(false);
      return;
    }
    loadTags();
  }, []);

  const loadTags = async () => {
    setIsLoading(true);
    try {
      const allTags = await window.TagService.getAllTags(true);
      setTags(allTags);
      const cloud = await window.TagService.getTagCloud();
      setTagCloud(cloud);
      const tagStats = window.TagService.getTagStats();
      setStats(tagStats);
    } catch (err) {
      console.error('[TagManager] 加载失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 选择标签，显示相关笔记
  const handleTagClick = async (tagName) => {
    setSelectedTag(tagName);
    if (onTagSelect) onTagSelect(tagName);
    if (window.TagService) {
      const notes = await window.TagService.getNotesByTag(tagName);
      setTagNotes(notes);
    }
  };

  // 右键菜单
  const handleContextMenu = (e, tag) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, tag });
  };

  // 重命名标签
  const startRename = (tag) => {
    setEditingTag(tag.name);
    setEditingName(tag.name);
    setContextMenu(null);
  };

  const confirmRename = () => {
    if (editingTag && editingName.trim() && editingName !== editingTag) {
      if (window.TagService) {
        window.TagService.renameTag(editingTag, editingName.trim());
        loadTags();
      }
    }
    setEditingTag(null);
    setEditingName('');
  };

  // 删除标签
  const handleDelete = (tagName) => {
    if (confirm(`确定删除标签「${tagName}」吗？相关笔记中的标签也会被移除。`)) {
      if (window.TagService) {
        window.TagService.deleteTag(tagName);
        loadTags();
        if (selectedTag === tagName) {
          setSelectedTag(null);
          setTagNotes([]);
        }
      }
    }
    setContextMenu(null);
  };

  // 设置标签颜色
  const handleSetColor = (tagName, color) => {
    if (window.TagService) {
      window.TagService.setTagColor(tagName, color);
      loadTags();
    }
    setShowColorPicker(false);
    setColorPickerTag(null);
    setContextMenu(null);
  };

  // 过滤和排序标签
  const filteredTags = React.useMemo(() => {
    let list = [...tags];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t => t.name.toLowerCase().includes(q));
    }
    if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
    } else {
      list.sort((a, b) => b.count - a.count);
    }
    return list;
  }, [tags, searchQuery, sortBy]);

  // 关闭右键菜单
  React.useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  if (isLoading) {
    return (
      <div style={{ padding: 20, textAlign: 'center', color: subTextColor, fontSize: 13 }}>
        <div style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(124,111,240,0.3)', borderTopColor: '#7C6FF0', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginRight: 8 }} />
        正在加载标签...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 统计栏 */}
      {stats && (
        <div style={{
          padding: '10px 12px',
          margin: '0 12px 8px',
          borderRadius: 8,
          background: isNight ? 'rgba(124,111,240,0.08)' : 'rgba(124,111,240,0.05)',
          display: 'flex',
          justifyContent: 'space-around',
          fontSize: 11,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#7C6FF0' }}>{stats.totalTags}</div>
            <div style={{ color: subTextColor }}>标签</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#4ECDC4' }}>{stats.totalTaggings}</div>
            <div style={{ color: subTextColor }}>引用</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#FFD93D' }}>{stats.orphanTags?.length || 0}</div>
            <div style={{ color: subTextColor }}>孤标签</div>
          </div>
        </div>
      )}

      {/* 搜索和工具栏 */}
      <div style={{ padding: '0 12px 8px' }}>
        <div style={{ position: 'relative', marginBottom: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={subTextColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="搜索标签..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 10px 7px 32px',
              border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              borderRadius: 8,
              background: isNight ? '#222' : '#fff',
              color: textColor,
              fontSize: 12,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {/* 视图切换 */}
          <div style={{ display: 'flex', background: isNight ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', borderRadius: 6, padding: 2 }}>
            <button onClick={() => setViewMode('cloud')} style={{
              padding: '4px 10px', border: 'none', background: viewMode === 'cloud' ? (isNight ? 'rgba(255,255,255,0.15)' : '#fff') : 'transparent',
              color: viewMode === 'cloud' ? textColor : subTextColor, fontSize: 11, cursor: 'pointer', borderRadius: 4, fontWeight: viewMode === 'cloud' ? 600 : 400,
            }}>云</button>
            <button onClick={() => setViewMode('list')} style={{
              padding: '4px 10px', border: 'none', background: viewMode === 'list' ? (isNight ? 'rgba(255,255,255,0.15)' : '#fff') : 'transparent',
              color: viewMode === 'list' ? textColor : subTextColor, fontSize: 11, cursor: 'pointer', borderRadius: 4, fontWeight: viewMode === 'list' ? 600 : 400,
            }}>列表</button>
          </div>
          {/* 排序 */}
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{
            flex: 1, padding: '4px 6px', border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            borderRadius: 6, background: isNight ? '#222' : '#fff', color: subTextColor, fontSize: 11, cursor: 'pointer', outline: 'none',
          }}>
            <option value="count">按频率</option>
            <option value="name">按名称</option>
          </select>
        </div>
      </div>

      {/* 标签内容区 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 12px' }}>
        {/* 选中标签的笔记列表 */}
        {selectedTag && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: textColor }}>
                「{selectedTag}」的笔记 ({tagNotes.length})
              </span>
              <button onClick={() => { setSelectedTag(null); setTagNotes([]); }} style={{
                background: 'none', border: 'none', color: subTextColor, cursor: 'pointer', fontSize: 16,
              }}>×</button>
            </div>
            {tagNotes.length === 0 ? (
              <p style={{ fontSize: 11, color: subTextColor, textAlign: 'center', padding: 16 }}>暂无笔记</p>
            ) : (
              tagNotes.map(note => (
                <div key={note.id} onClick={() => onNoteClick && onNoteClick(note.id)} style={{
                  padding: '8px 10px', marginBottom: 4, borderRadius: 6,
                  background: isNight ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  cursor: 'pointer', fontSize: 12, color: textColor,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {note.title}
                </div>
              ))
            )}
          </div>
        )}

        {/* 标签云视图 */}
        {viewMode === 'cloud' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            {tagCloud.filter(t => !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase())).map(tag => (
              editingTag === tag.name ? (
                <input key={tag.name} autoFocus value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={confirmRename}
                  onKeyDown={(e) => { if (e.key === 'Enter') confirmRename(); if (e.key === 'Escape') { setEditingTag(null); setEditingName(''); } }}
                  style={{ fontSize: tag.fontSize, padding: '2px 8px', borderRadius: 12, border: `1px solid ${tag.color}`, outline: 'none', background: isNight ? '#222' : '#fff', color: textColor }}
                />
              ) : (
                <span key={tag.name}
                  onClick={() => handleTagClick(tag.name)}
                  onContextMenu={(e) => handleContextMenu(e, tag)}
                  style={{
                    fontSize: tag.fontSize, fontWeight: tag.weight, color: tag.color,
                    opacity: tag.opacity, cursor: 'pointer', padding: '2px 8px', borderRadius: 12,
                    background: selectedTag === tag.name ? `${tag.color}15` : 'transparent',
                    transition: 'all 0.15s ease', userSelect: 'none',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = `${tag.color}20`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = selectedTag === tag.name ? `${tag.color}15` : 'transparent'; }}
                >
                  #{tag.name}
                  <span style={{ fontSize: 10, opacity: 0.6, marginLeft: 2 }}>{tag.count}</span>
                </span>
              )
            ))}
          </div>
        )}

        {/* 标签列表视图 */}
        {viewMode === 'list' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filteredTags.map(tag => (
              editingTag === tag.name ? (
                <input key={tag.name} autoFocus value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={confirmRename}
                  onKeyDown={(e) => { if (e.key === 'Enter') confirmRename(); if (e.key === 'Escape') { setEditingTag(null); setEditingName(''); } }}
                  style={{ padding: '6px 10px', borderRadius: 6, border: `1px solid ${tag.color}`, outline: 'none', background: isNight ? '#222' : '#fff', color: textColor, fontSize: 12 }}
                />
              ) : (
                <div key={tag.name}
                  onClick={() => handleTagClick(tag.name)}
                  onContextMenu={(e) => handleContextMenu(e, tag)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
                    borderRadius: 6, cursor: 'pointer',
                    background: selectedTag === tag.name ? `${tag.color}10` : 'transparent',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = isNight ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = selectedTag === tag.name ? `${tag.color}10` : 'transparent'; }}
                >
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: tag.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 12, color: textColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    #{tag.name}
                  </span>
                  <span style={{ fontSize: 10, color: subTextColor, background: isNight ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', padding: '1px 6px', borderRadius: 8 }}>
                    {tag.count}
                  </span>
                </div>
              )
            ))}
          </div>
        )}

        {filteredTags.length === 0 && !selectedTag && (
          <div style={{ padding: 30, textAlign: 'center', color: subTextColor, fontSize: 12 }}>
            {searchQuery ? '没有匹配的标签' : '暂无标签，在笔记中使用 #标签名 添加'}
          </div>
        )}
      </div>

      {/* 右键菜单 */}
      {contextMenu && (
        <div style={{
          position: 'fixed', left: contextMenu.x, top: contextMenu.y,
          background: isNight ? '#2a2a2a' : '#fff',
          border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', padding: 4, zIndex: 10000, minWidth: 140,
        }} onClick={(e) => e.stopPropagation()}>
          <button onClick={() => handleTagClick(contextMenu.tag.name)} style={menuItemStyle(isNight)}>
            📝 查看笔记
          </button>
          <button onClick={() => startRename(contextMenu.tag)} style={menuItemStyle(isNight)}>
            ✏️ 重命名
          </button>
          <button onClick={() => { setColorPickerTag(contextMenu.tag.name); setShowColorPicker(true); setContextMenu(null); }} style={menuItemStyle(isNight)}>
            🎨 更改颜色
          </button>
          <button onClick={() => handleDelete(contextMenu.tag.name)} style={{ ...menuItemStyle(isNight), color: '#E74C3C' }}>
            🗑️ 删除标签
          </button>
        </div>
      )}

      {/* 颜色选择器 */}
      {showColorPicker && (
        <div style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          background: isNight ? '#2a2a2a' : '#fff', borderRadius: 12, padding: 16,
          boxShadow: '0 12px 40px rgba(0,0,0,0.2)', zIndex: 10001, minWidth: 240,
        }} onClick={(e) => e.stopPropagation()}>
          <h4 style={{ margin: '0 0 12px', fontSize: 14, color: textColor }}>选择标签颜色</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
            {PRESET_COLORS.map(color => (
              <button key={color} onClick={() => handleSetColor(colorPickerTag, color)} style={{
                width: 32, height: 32, borderRadius: '50%', background: color, border: '2px solid #fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)', cursor: 'pointer',
              }} />
            ))}
          </div>
          <button onClick={() => { setShowColorPicker(false); setColorPickerTag(null); }} style={{
            marginTop: 12, width: '100%', padding: '8px', border: 'none', borderRadius: 6,
            background: isNight ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', color: textColor, cursor: 'pointer', fontSize: 12,
          }}>取消</button>
        </div>
      )}
    </div>
  );
}

function menuItemStyle(isNight) {
  return {
    display: 'block', width: '100%', padding: '8px 12px', border: 'none', background: 'transparent',
    color: isNight ? '#fff' : '#333', fontSize: 12, textAlign: 'left', cursor: 'pointer', borderRadius: 4,
  };
}

if (typeof window !== 'undefined') {
  window.TagManagerPanel = TagManagerPanel;
}

console.log('[TagManagerPanel] 标签管理面板组件已加载');
