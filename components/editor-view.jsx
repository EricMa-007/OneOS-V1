// 编辑器视图组件 —— 三栏布局
function EditorView({
  currentNote,
  activeNoteId,
  onSelectNote,
  onNewNote,
  density,
  isNight,
  focusMode,
  editMode,
  onToggleEditMode,
  rightTab,
  onRightTabChange,
  isSaving,
  lastSaved,
  onContentChange,
  activeTag,
  onTagClick,
  expandedFolders,
  onToggleFolder,
  onSearchOpen,
  onFocusToggle,
  textColor,
  subTextColor,
  themeBg,
}) {
  const dt = DESIGN_TOKENS;
  // 响应式：移动端默认收起左右面板
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [leftOpen, setLeftOpen] = React.useState(!isMobile);
  const [rightOpen, setRightOpen] = React.useState(!isMobile);

  const showLeft = leftOpen && !focusMode;
  const showRight = rightOpen && !focusMode;

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      height: '100%',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* 左侧文件树 */}
      {showLeft && (
        <div style={isMobile ? {
          position: 'absolute',
          top: 0, left: 0, bottom: 0,
          width: '85%',
          maxWidth: 320,
          zIndex: 30,
          boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
        } : { width: 280, flexShrink: 0, borderRight: `1px solid ${isNight ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}` }}>
          {/* V2: 增强版文件树管理 */}
          {window.TreeManager ? (
            <TreeManager
              notes={Object.values(KNOWLEDGE_BASE.notes || {})}
              folders={Object.keys(KNOWLEDGE_BASE.folders || {})}
              activeNoteId={activeNoteId}
              onSelectNote={(id) => { onSelectNote(id); if (isMobile) setLeftOpen(false); }}
              onNewNote={(folder) => { onNewNote(folder); }}
              onNewFolder={() => { const name = prompt('输入文件夹名称：'); if (name) console.log('[TreeManager] 新建文件夹:', name); }}
              onRenameNote={(id, newName) => {
                if (window.DataAdapter) window.DataAdapter.updateNote(id, { title: newName });
                if (KNOWLEDGE_BASE.notes[id]) KNOWLEDGE_BASE.notes[id].title = newName;
              }}
              onDeleteNote={(id) => {
                if (window.DataAdapter) window.DataAdapter.deleteNote(id);
                delete KNOWLEDGE_BASE.notes[id];
              }}
              onMoveNote={(id, newFolder) => {
                if (window.DataAdapter) window.DataAdapter.updateNote(id, { folder: newFolder });
                if (KNOWLEDGE_BASE.notes[id]) KNOWLEDGE_BASE.notes[id].folder = newFolder;
              }}
              expandedFolders={expandedFolders}
              onToggleFolder={onToggleFolder}
              isNight={isNight}
              textColor={textColor}
              subTextColor={subTextColor}
              density={density}
            />
          ) : (
            <FileSidebar
              kb={KNOWLEDGE_BASE}
              activeNoteId={activeNoteId}
              onSelectNote={(id) => { onSelectNote(id); if (isMobile) setLeftOpen(false); }}
              onNewNote={onNewNote}
              expandedFolders={expandedFolders}
              onToggleFolder={onToggleFolder}
              density={density}
              onClose={() => setLeftOpen(false)}
              showClose={true}
              focusMode={focusMode}
              isNight={isNight}
            />
          )}
        </div>
      )}
      {/* 移动端左侧遮罩 */}
      {showLeft && isMobile && (
        <div onClick={() => setLeftOpen(false)} style={{
          position: 'absolute', inset: 0, zIndex: 25,
          background: 'rgba(0,0,0,0.4)',
        }} />
      )}

      {/* 中间编辑器 */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        position: 'relative',
      }}>
        {/* 编辑器顶部栏（只有在左侧收起时显示展开按钮） */}
        {!showLeft && !focusMode && (
          <div style={{
            position: 'absolute',
            top: 12,
            left: 12,
            zIndex: 10,
          }}>
            <button
              onClick={() => setLeftOpen(true)}
              title="展开文件树"
              style={{
                width: 32, height: 32,
                borderRadius: 6,
                border: `1px solid ${isNight ? 'rgba(255,255,255,0.08)' : 'rgba(43, 42, 38, 0.08)'}`,
                background: isNight ? 'rgba(255,255,255,0.04)' : '#fff',
                color: subTextColor,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
            </button>
          </div>
        )}

        {/* 搜索按钮（左侧收起时显示） */}
        {!showLeft && !focusMode && (
          <div style={{
            position: 'absolute',
            top: 12,
            left: 52,
            zIndex: 10,
          }}>
            <button
              onClick={onSearchOpen}
              title="搜索 (⌘K)"
              style={{
                height: 32,
                padding: '0 12px',
                borderRadius: 6,
                border: `1px solid ${isNight ? 'rgba(255,255,255,0.08)' : 'rgba(43, 42, 38, 0.08)'}`,
                background: isNight ? 'rgba(255,255,255,0.04)' : '#fff',
                color: subTextColor,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                transition: 'all 0.2s ease',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              搜索
              <span style={{
                marginLeft: 4,
                fontSize: 10,
                padding: '2px 5px',
                background: isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.05)',
                borderRadius: 3,
                fontFamily: "'JetBrains Mono', monospace",
              }}>⌘K</span>
            </button>
          </div>
        )}

        {/* 右侧面板展开按钮（收起时） */}
        {!showRight && !focusMode && (
          <div style={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 10,
          }}>
            <button
              onClick={() => setRightOpen(true)}
              title="展开右侧面板"
              style={{
                width: 32, height: 32,
                borderRadius: 6,
                border: `1px solid ${isNight ? 'rgba(255,255,255,0.08)' : 'rgba(43, 42, 38, 0.08)'}`,
                background: isNight ? 'rgba(255,255,255,0.04)' : '#fff',
                color: subTextColor,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="15" y1="3" x2="15" y2="21" />
              </svg>
            </button>
          </div>
        )}

        {/* 专注模式按钮 */}
        {focusMode && (
          <button
            onClick={onFocusToggle}
            title="退出专注模式 (⌘⇧F)"
            style={{
              position: 'absolute',
              top: 20,
              right: 24,
              zIndex: 20,
              padding: '6px 14px',
              borderRadius: 6,
              border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.08)'}`,
              background: isNight ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.7)',
              color: subTextColor,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              transition: 'all 0.2s ease',
              opacity: 0.6,
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
            onMouseLeave={(e) => e.currentTarget.style.opacity = 0.6}
          >
            <Icon.Focus style={{ width: 14, height: 14 }} />
            专注中
          </button>
        )}

        {/* V2: WYSIWYG 编辑器 */}
        {window.WysiwygEditor ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <WysiwygEditor
              key={currentNote?.id || 'empty'}
              initialContent={currentNote?.content || ''}
              onChange={onContentChange}
              onSave={async (content) => { if (onContentChange) onContentChange(content); }}
              isNight={isNight}
              textColor={textColor}
              subTextColor={subTextColor}
            />
          </div>
        ) : (
          <Editor
            note={currentNote}
            density={density}
            focusMode={focusMode}
            isNight={isNight}
            onContentChange={onContentChange}
            isSaving={isSaving}
            lastSaved={lastSaved}
            editMode={editMode}
            onToggleMode={onToggleEditMode}
            onBacklinkClick={onSelectNote}
          />
        )}
      </div>

      {/* 右侧面板 */}
      {showRight && (
        <div style={isMobile ? {
          position: 'absolute',
          top: 0, right: 0, bottom: 0,
          width: '85%',
          maxWidth: 320,
          zIndex: 30,
          boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
        } : { width: 300, flexShrink: 0, borderLeft: `1px solid ${isNight ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}` }}>
          {/* V2: 反向链接面板 */}
          {window.BacklinkPanel && rightTab === 'backlinks' ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* 面板头部 */}
              <div style={{
                padding: '14px 16px',
                borderBottom: `1px solid ${isNight ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>🔗</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: textColor }}>知识关联</span>
                </div>
                {isMobile && (
                  <button onClick={() => setRightOpen(false)} style={{ background: 'none', border: 'none', color: subTextColor, fontSize: 18, cursor: 'pointer' }}>×</button>
                )}
              </div>
              {/* Tab 切换 */}
              <div style={{
                display: 'flex',
                padding: '0 12px',
                gap: 2,
                borderBottom: `1px solid ${isNight ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
              }}>
                {['backlinks', 'outgoing', 'dead', 'related'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => { /* 在 BacklinkPanel 内部切换 */ }}
                    style={{
                      flex: 1,
                      padding: '8px 4px',
                      border: 'none',
                      background: 'transparent',
                      color: subTextColor,
                      fontSize: 10,
                      cursor: 'pointer',
                    }}
                  >
                    {tab === 'backlinks' ? '反向' : tab === 'outgoing' ? '出站' : tab === 'dead' ? '死链' : '相关'}
                  </button>
                ))}
              </div>
              {/* BacklinkPanel 内容 */}
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <BacklinkPanel
                  noteId={currentNote?.id}
                  noteTitle={currentNote?.title}
                  onNoteClick={(id) => { onSelectNote(id); if (isMobile) setRightOpen(false); }}
                  onCreateNote={(name) => { if (onNewNote) onNewNote(); }}
                  isNight={isNight}
                  textColor={textColor}
                  subTextColor={subTextColor}
                />
              </div>
            </div>
          ) : (
            <RightPanel
              note={currentNote}
              kb={KNOWLEDGE_BASE}
              density={density}
              isNight={isNight}
              focusMode={focusMode}
              activeTab={rightTab}
              onTabChange={onRightTabChange}
              onNoteClick={(id) => { onSelectNote(id); if (isMobile) setRightOpen(false); }}
              onTagClick={onTagClick}
              activeTag={activeTag}
              onClose={() => setRightOpen(false)}
              showClose={true}
            />
          )}
        </div>
      )}
      {/* 移动端右侧遮罩 */}
      {showRight && isMobile && (
        <div onClick={() => setRightOpen(false)} style={{
          position: 'absolute', inset: 0, zIndex: 25,
          background: 'rgba(0,0,0,0.4)',
        }} />
      )}
    </div>
  );
}

Object.assign(window, { EditorView });
