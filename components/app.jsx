// ============================================
// App — 应用主组件（玻璃拟态重制版）
// ============================================

function App({ t, setTweak }) {
  const dt = DESIGN_TOKENS;
  const KB = window.KNOWLEDGE_BASE || { notes: {}, folders: [] };
  const DEFAULT_NOTE = window.DEFAULT_NOTE_ID || 'n-oneos-1';

  // 响应式检测
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [activeNav, setActiveNav] = React.useState('dashboard');
  const [focusMode, setFocusMode] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [settingsSection, setSettingsSection] = React.useState('general');
  const [stats, setStats] = React.useState({
    noteCount: 247,
    todayNotes: 3,
    archivedTopics: 5,
    elevationCount: 12,
  });

  // 编辑器相关状态
  const [activeNoteId, setActiveNoteId] = React.useState(DEFAULT_NOTE);
  const [editMode, setEditMode] = React.useState('wysiwyg');
  const [rightTab, setRightTab] = React.useState('backlinks');
  const [isSaving, setIsSaving] = React.useState(false);
  const [lastSaved, setLastSaved] = React.useState(null);
  const [activeTag, setActiveTag] = React.useState(null);
  const [expandedFolders, setExpandedFolders] = React.useState({});
  const [noteContent, setNoteContent] = React.useState({});

  // 日历相关状态
  const [calendarView, setCalendarView] = React.useState('month');
  const [calYear, setCalYear] = React.useState(CURRENT_YEAR);
  const [calMonth, setCalMonth] = React.useState(CURRENT_MONTH);
  const [colorScheme, setColorScheme] = React.useState('mint');
  const [selectedDate, setSelectedDate] = React.useState(null);
  const [dayDetailOpen, setDayDetailOpen] = React.useState(false);
  const [calMonthData, setCalMonthData] = React.useState(null);

  React.useEffect(() => {
    setCalMonthData(generateMonthData(calYear, calMonth));
  }, [calYear, calMonth]);

  // 订阅全局状态，当新建笔记/归档时更新今日日历强度
  React.useEffect(() => {
    const todayStr = `${CURRENT_YEAR}-${String(CURRENT_MONTH).padStart(2,'0')}-${String(CURRENT_DAY).padStart(2,'0')}`;
    const unsubscribe = window.OneOSAppState.subscribe((state) => {
      const dayState = state.calendar[todayStr];
      if (!dayState) return;
      // 计算当日总强度：notes + conversations*2 + elevate*3，最大8
      const total = dayState.notes + dayState.conversations * 2 + dayState.elevate * 3;
      const newIntensity = Math.min(8, 4 + total); // 基础强度4，随操作增加
      
      setCalMonthData(prev => {
        if (!prev) return prev;
        const newDays = prev.days.map(d => {
          if (d.isToday && d.date === todayStr) {
            return { ...d, intensity: newIntensity };
          }
          return d;
        });
        return { ...prev, days: newDays };
      });
    });
    return unsubscribe;
  }, []);

  const density = t.density;
  const fontScale = t.fontScale;
  const isNight = false; // 明亮玻璃拟态风格
  const textColor = dt.colors.textPrimary;
  const subTextColor = dt.colors.textSecondary;

  // 当前笔记
  const currentNote = React.useMemo(() => {
    const base = KB.notes[activeNoteId];
    if (!base) return null;
    if (noteContent[activeNoteId]) {
      return { ...base, content: noteContent[activeNoteId] };
    }
    return base;
  }, [activeNoteId, noteContent, KB]);

  // 切换导航
  const handleNavChange = (id) => {
    setActiveNav(id);
    setFocusMode(false);
    setDayDetailOpen(false);
  };

  // 日历月份切换
  const handleChangeMonth = (delta) => {
    if (delta === 0) {
      setCalYear(CURRENT_YEAR);
      setCalMonth(CURRENT_MONTH);
      return;
    }
    let newMonth = calMonth + delta;
    let newYear = calYear;
    if (newMonth > 12) { newMonth = 1; newYear++; }
    else if (newMonth < 1) { newMonth = 12; newYear--; }
    setCalMonth(newMonth);
    setCalYear(newYear);
  };

  const handleSelectDate = (dateStr) => {
    setSelectedDate(dateStr);
    setDayDetailOpen(true);
  };

  const getDayData = (dateStr) => {
    if (!dateStr) return null;
    const [y, m, d] = dateStr.split('-').map(Number);
    return generateDayData(y, m, d);
  };

  const handleSelectNote = (noteId) => {
    setActiveNoteId(noteId);
  };

  // 新建笔记
  const handleNewNote = () => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    const newId = `note-new-${Date.now()}`;
    const newNote = {
      id: newId,
      name: `${dateStr} 随笔.md`,
      title: `${dateStr} 随笔`,
      folder: 'daily',
      content: `# ${dateStr} 随笔\n\n在这里记录今天的思考...\n`,
      tags: ['日常思考'],
      backlinks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      readCount: 0,
    };
    // 临时加入知识库（模拟）
    KB.notes[newId] = newNote;
    // 找到日常思考文件夹并加入
    const dailyFolder = KB.folders.find(f => f.id === 'f-daily');
    if (dailyFolder) {
      dailyFolder.children.unshift({ id: newId, name: newNote.name });
    }
    // V2: 同步保存到 IndexedDB
    if (window.DataAdapter) {
      window.DataAdapter.createNote(newNote).catch(err => {
        console.error('[OneOS] 保存笔记到数据库失败:', err);
      });
    }
    setActiveNoteId(newId);
    setStats(prev => ({
      ...prev,
      noteCount: prev.noteCount + 1,
      todayNotes: prev.todayNotes + 1,
    }));
    // 全局状态联动：新增笔记 → 仪表盘+日历+搜索
    window.OneOSAppState.addNote({
      id: newId,
      title: newNote.title,
      date: dateStr,
      topic: '日常思考',
      type: 'note',
    });
    showToast('新建笔记成功');
  };

  const handleContentChange = (content) => {
    setNoteContent(prev => ({ ...prev, [activeNoteId]: content }));
    setIsSaving(true);
    // V2: 同步到 KNOWLEDGE_BASE 并标记为待保存（防抖自动保存到 IndexedDB）
    if (window.DataAdapter && KB.notes[activeNoteId]) {
      window.DataAdapter.updateNoteContent(activeNoteId, content);
    }
    setTimeout(() => {
      setIsSaving(false);
      const now = new Date();
      setLastSaved(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
    }, 800);
  };

  const handleToggleFolder = (folderId) => {
    setExpandedFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const handleTagClick = (tagName) => {
    setActiveTag(tagName);
    if (tagName) {
      setRightTab('tags');
      showToast(`筛选标签：#${tagName}`);
    }
  };

  // 键盘快捷键
  React.useEffect(() => {
    const handleKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        if (searchOpen) { setSearchOpen(false); return; }
        if (settingsOpen) { setSettingsOpen(false); return; }
        if (focusMode) { setFocusMode(false); return; }
      }
      // Cmd/Ctrl + , 设置
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        setSettingsOpen(true);
      }
      // Cmd/Ctrl + Shift + F 专注模式
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'f') {
        e.preventDefault();
        setFocusMode(!focusMode);
      }
      // Cmd/Ctrl + N 新建笔记
      if ((e.metaKey || e.ctrlKey) && e.key === 'n' && !e.shiftKey) {
        e.preventDefault();
        if (activeNav !== 'editor') setActiveNav('editor');
        setTimeout(() => handleNewNote(), 50);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [searchOpen, settingsOpen, focusMode, activeNav]);

  // 监听编辑器空状态的新建笔记事件
  React.useEffect(() => {
    const handleEditorNew = () => {
      handleNewNote();
    };
    window.addEventListener('editor-new-note', handleEditorNew);
    return () => window.removeEventListener('editor-new-note', handleEditorNew);
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const toggleFocusMode = () => {
    setFocusMode(!focusMode);
    if (!focusMode) {
      showToast('专注模式已开启 · ⌘⇧F 退出');
    } else {
      showToast('已退出专注模式');
    }
  };

  // 从搜索结果跳转
  const handleSearchNavigate = (navId) => {
    if (navId) handleNavChange(navId);
  };

  const openSettings = (section = 'general') => {
    setSettingsSection(section);
    setSettingsOpen(true);
  };

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      color: textColor,
      fontSize: `${14 * fontScale}px`,
      fontFamily: dt.fonts.sans,
      overflow: 'hidden',
      minWidth: isMobile ? '100%' : 1100,
      position: 'relative',
    }}>
      {/* 侧边栏 - 移动端通过CSS transform隐藏，抽屉打开时显示 */}
      <Sidebar
        activeNav={activeNav}
        onNavChange={handleNavChange}
        onOpenSettings={() => openSettings('general')}
        density={density}
        isNight={isNight}
      />

      {/* 主内容区 */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        position: 'relative',
        overflow: 'hidden',
        paddingBottom: isMobile ? 60 : 0,
      }}>
        {/* 顶部栏 — 所有板块共享 */}
        <header className="topbar" style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 8 : 16,
          padding: isMobile ? '10px 12px' : '12px 28px',
          borderBottom: '1px solid rgba(45, 55, 72, 0.06)',
          background: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          flexShrink: 0,
          zIndex: 50,
          opacity: focusMode && activeNav === 'editor' ? 0.1 : 1,
          transition: 'opacity 0.3s ease',
          pointerEvents: focusMode && activeNav === 'editor' ? 'none' : 'auto',
        }}>
          {/* 板块标题 - 移动端显示品牌标识 */}
          <div style={{
            minWidth: isMobile ? 0 : 120,
            flexShrink: 0,
            flex: isMobile ? 1 : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            {isMobile ? (
              <>
                <div style={{
                  width: 28, height: 28,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #9B8EF7 0%, #5B4FE0 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 800,
                  flexShrink: 0,
                }}>
                  ✦
                </div>
                <span style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: textColor,
                  letterSpacing: -0.3,
                }}>
                  OneOS
                </span>
                <span style={{
                  fontSize: 11,
                  color: subTextColor,
                  opacity: 0.6,
                  marginLeft: 2,
                }}>
                  {NAV_ITEMS.find(n => n.id === activeNav)?.label || ''}
                </span>
              </>
            ) : (
              <div>
                <h1 style={{
                  fontSize: 18,
                  fontWeight: 800,
                  fontFamily: dt.fonts.display,
                  color: textColor,
                  lineHeight: 1.2,
                  marginBottom: 2,
                  letterSpacing: -0.3,
                }}>
                  {NAV_ITEMS.find(n => n.id === activeNav)?.label || '仪表盘'}
                </h1>
                <div style={{
                  fontSize: 11,
                  color: subTextColor,
                  opacity: 0.7,
                }}>
                  {TODAY_INFO.date} · {TODAY_INFO.lunar}
                </div>
              </div>
            )}
          </div>

          {/* 全局搜索 - 移动端简化为图标按钮 */}
          {isMobile ? (
            <button
              onClick={() => setSearchOpen(true)}
              style={{
                width: 36, height: 36,
                borderRadius: dt.radius.md,
                border: `1px solid ${dt.colors.borderGlass}`,
                background: dt.colors.bgGlass,
                color: dt.colors.textTertiary,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 'auto',
                padding: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          ) : (
          <div
            onClick={() => setSearchOpen(true)}
            style={{
              flex: 1,
              maxWidth: 480,
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 16px',
              borderRadius: dt.radius.full,
              background: dt.colors.bgGlass,
              border: `1px solid ${dt.colors.borderGlass}`,
              color: dt.colors.textTertiary,
              fontSize: 13,
              cursor: 'pointer',
              transition: dt.transition.fast,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = dt.colors.bgGlassHover;
              e.currentTarget.style.borderColor = dt.colors.borderGlassStrong;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = dt.colors.bgGlass;
              e.currentTarget.style.borderColor = dt.colors.borderGlass;
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span>搜索笔记、话题、人、圈子...</span>
            <kbd style={{
              marginLeft: 'auto',
              padding: '2px 6px',
              borderRadius: 5,
              background: dt.colors.bgGlassStrong,
              fontFamily: dt.fonts.mono,
              fontSize: 10,
              color: dt.colors.textTertiary,
              border: `1px solid ${dt.colors.borderSubtle}`,
            }}>⌘K</kbd>
          </div>
          )}

          {/* 右侧按钮组 - 移动端隐藏专注模式 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {!isMobile && (<button
              onClick={toggleFocusMode}
              className="btn-glass"
              style={{
                padding: '8px 14px',
                fontFamily: dt.fonts.serif,
                fontSize: 12,
                gap: 6,
                borderColor: focusMode ? dt.colors.accentPrimary : undefined,
                background: focusMode ? dt.colors.accentPrimarySoft : undefined,
                color: focusMode ? dt.colors.accentPrimary : undefined,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
              {focusMode ? '专注中' : '专注模式'}
            </button>)}
            <button
              onClick={() => setSettingsOpen(true)}
              className="btn-glass"
              style={{
                width: 36,
                height: 36,
                padding: 0,
                borderRadius: dt.radius.md,
              }}
              title="设置 ⌘,"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </div>
        </header>

        {/* 板块内容容器 */}
        <div style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          opacity: focusMode && activeNav === 'editor' ? 0 : 1,
          transition: 'opacity 0.3s ease',
          pointerEvents: focusMode && activeNav === 'editor' ? 'none' : 'auto',
        }}>
          {/* 仪表盘 */}
          {activeNav === 'dashboard' && (
            <DashboardView
              density={density}
              onNavChange={handleNavChange}
              textColor={textColor}
              subTextColor={subTextColor}
            />
          )}

          {/* 编辑器 */}
          {activeNav === 'editor' && (
            <EditorView
              currentNote={currentNote}
              activeNoteId={activeNoteId}
              onSelectNote={handleSelectNote}
              onNewNote={handleNewNote}
              density={density}
              isNight={isNight}
              focusMode={focusMode}
              editMode={editMode}
              onToggleEditMode={setEditMode}
              rightTab={rightTab}
              onRightTabChange={setRightTab}
              isSaving={isSaving}
              lastSaved={lastSaved}
              onContentChange={handleContentChange}
              activeTag={activeTag}
              onTagClick={handleTagClick}
              expandedFolders={expandedFolders}
              onToggleFolder={handleToggleFolder}
              onSearchOpen={() => setSearchOpen(true)}
              onFocusToggle={toggleFocusMode}
              textColor={textColor}
              subTextColor={subTextColor}
              themeBg={dt.gradients.bg}
            />
          )}

          {/* 知识图谱 */}
          {activeNav === 'graph' && (
            <GraphView
              density={density}
              isNight={isNight}
              textColor={textColor}
              subTextColor={subTextColor}
              themeBg={dt.gradients.bg}
              focusMode={false}
            />
          )}

          {/* 日历 */}
          {activeNav === 'calendar' && calMonthData && (
            <CalendarView
              density={density}
              isNight={isNight}
              colorScheme={colorScheme}
              viewMode={calendarView}
              currentYear={calYear}
              currentMonth={calMonth}
              monthData={calMonthData}
              yearData={CURRENT_YEAR_DATA}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              onChangeMonth={handleChangeMonth}
              onViewModeChange={setCalendarView}
              onColorSchemeChange={setColorScheme}
              textColor={textColor}
              subTextColor={subTextColor}
              themeBg={dt.gradients.bg}
              focusMode={false}
            />
          )}

          {/* 升维 */}
          {activeNav === 'elevation' && (
            <ElevationView
              density={density}
              isNight={isNight}
              textColor={textColor}
              subTextColor={subTextColor}
              themeBg={dt.gradients.bg}
              focusMode={false}
            />
          )}

          {/* AI */}
          {activeNav === 'ai' && (
            <AIView
              density={density}
              isNight={isNight}
              textColor={textColor}
              subTextColor={subTextColor}
              themeBg={dt.gradients.bg}
              focusMode={false}
            />
          )}

          {/* 社交 */}
          {activeNav === 'social' && (
            <SocialView
              density={density}
              isNight={isNight}
              textColor={textColor}
              subTextColor={subTextColor}
              themeBg={dt.gradients.bg}
              focusMode={false}
            />
          )}

          {/* 人类节点 */}
          {activeNav === 'nodes' && (
            <HumanView
              density={density}
              isNight={isNight}
              textColor={textColor}
              subTextColor={subTextColor}
              themeBg={dt.gradients.bg}
              focusMode={false}
            />
          )}

          {/* 语音 */}
          {activeNav === 'voice' && (
            <VoiceView
              density={density}
              isNight={isNight}
              textColor={textColor}
              subTextColor={subTextColor}
              themeBg={dt.gradients.bg}
              focusMode={false}
            />
          )}

          {/* 圈子 */}
          {activeNav === 'circles' && (
            <CircleView
              density={density}
              isNight={isNight}
              textColor={textColor}
              subTextColor={subTextColor}
              themeBg={dt.gradients.bg}
              focusMode={false}
            />
          )}
        </div>
      </div>

      {/* 专注模式遮罩 */}
      {focusMode && activeNav === 'editor' && (
        <div
          onClick={toggleFocusMode}
          style={{
            position: 'fixed',
            top: 0, right: 0,
            width: 32,
            height: '100%',
            cursor: 'pointer',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.3,
            transition: 'opacity 0.3s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = 0.8}
          onMouseLeave={(e) => e.currentTarget.style.opacity = 0.3}
        >
          <div style={{
            writingMode: 'vertical-rl',
            fontSize: 11,
            color: dt.colors.textTertiary,
            fontFamily: dt.fonts.mono,
            letterSpacing: 2,
          }}>
            点击退出专注 · ⌘⇧F
          </div>
        </div>
      )}

      {/* 当日详情面板 */}
      {dayDetailOpen && selectedDate && (
        <DayDetailPanel
          dayData={getDayData(selectedDate)}
          scheme={COLOR_SCHEMES[colorScheme]}
          density={density}
          isNight={isNight}
          textColor={textColor}
          subTextColor={subTextColor}
          onClose={() => setDayDetailOpen(false)}
          onDocClick={() => setDayDetailOpen(false)}
        />
      )}

      {/* 全局搜索 */}
      <GlobalSearch
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={handleSearchNavigate}
        isNight={isNight}
        textColor={textColor}
        subTextColor={subTextColor}
      />

      {/* 设置中心 */}
      <SettingsDialog
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        activeSection={settingsSection}
        isNight={isNight}
        textColor={textColor}
        subTextColor={subTextColor}
      />

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '10px 20px',
          background: 'rgba(22, 22, 42, 0.95)',
          backdropFilter: 'blur(12px)',
          color: dt.colors.textPrimary,
          borderRadius: dt.radius.lg,
          border: `1px solid ${dt.colors.borderGlass}`,
          fontSize: 13,
          zIndex: 5000,
          animation: 'fadeInUp 300ms cubic-bezier(0.2, 0.8, 0.2, 1) both',
          boxShadow: dt.shadows.md,
          fontFamily: dt.fonts.serif,
        }}>
          {toast}
        </div>
      )}

      {/* Tweaks 面板 */}
      <TweaksPanel>
        <TweakSection label="视觉主题" />
        <TweakRadio
          label="密度"
          value={t.density}
          options={[{ label: '紧凑', value: 'compact' }, { label: '常规', value: 'regular' }, { label: '宽松', value: 'comfy' }]}
          onChange={(v) => setTweak('density', v)}
        />
        <TweakSlider
          label="字号比例"
          value={t.fontScale}
          min={0.8}
          max={1.3}
          step={0.05}
          unit="×"
          onChange={(v) => setTweak('fontScale', v)}
        />
        <TweakSection label="模式" />
        <TweakToggle
          label="专注模式"
          value={focusMode}
          onChange={(v) => setFocusMode(v)}
        />
        {activeNav === 'calendar' && (
          <>
            <TweakSection label="日历" />
            <TweakRadio
              label="颜色方案"
              value={colorScheme}
              options={[
                { label: '薄荷', value: 'mint' },
                { label: '紫霞', value: 'purple' },
                { label: '蜜桃', value: 'peach' },
                { label: '青草', value: 'green' },
              ]}
              onChange={(v) => setColorScheme(v)}
            />
            <TweakRadio
              label="视图"
              value={calendarView}
              options={[
                { label: '月视图', value: 'month' },
                { label: '周视图', value: 'week' },
                { label: '年热力图', value: 'year' },
              ]}
              onChange={(v) => setCalendarView(v)}
            />
          </>
        )}
      </TweaksPanel>
    </div>
  );
}

Object.assign(window, { App });
