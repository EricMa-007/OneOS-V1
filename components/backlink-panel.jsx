// ============================================
// OneOS V2 - 反向链接面板组件
// 显示反向链接、出站链接、死链、相关笔记
// ============================================

function BacklinkPanel({
  noteId,
  noteTitle,
  onNoteClick,
  onCreateNote,
  isNight = false,
  textColor = '#2D3436',
  subTextColor = '#636E72',
}) {
  const [backlinks, setBacklinks] = React.useState({ inLinks: [], outLinks: [], deadLinks: [], linkCount: 0 });
  const [relatedNotes, setRelatedNotes] = React.useState([]);
  const [stats, setStats] = React.useState(null);
  const [activeTab, setActiveTab] = React.useState('backlinks'); // backlinks | outgoing | dead | related
  const [isLoading, setIsLoading] = React.useState(true);

  // 加载反向链接数据
  React.useEffect(() => {
    if (!noteId || !window.BacklinkService) {
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      try {
        const result = await window.BacklinkService.getBacklinks(noteId, true);
        setBacklinks(result);
        const related = window.BacklinkService.getRelatedNotes(noteId, 5);
        setRelatedNotes(related);
        const linkStats = window.BacklinkService.getLinkStats();
        setStats(linkStats);
      } catch (err) {
        console.error('[BacklinkPanel] 加载失败:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [noteId]);

  // 渲染链接项
  const renderLinkItem = (link, type) => (
    <div
      key={`${type}-${link.sourceId || link.targetId}-${link.linkText}`}
      onClick={() => {
        if (type === 'incoming' && onNoteClick) onNoteClick(link.sourceId);
        if (type === 'outgoing' && onNoteClick) onNoteClick(link.targetId);
      }}
      style={{
        padding: '10px 12px',
        marginBottom: 6,
        borderRadius: 8,
        background: isNight ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        cursor: 'pointer',
        border: `1px solid ${isNight ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}`,
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = isNight ? 'rgba(124,111,240,0.1)' : 'rgba(124,111,240,0.06)'; e.currentTarget.style.borderColor = 'rgba(124,111,240,0.3)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = isNight ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'; e.currentTarget.style.borderColor = isNight ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7C6FF0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        <span style={{ fontSize: 13, fontWeight: 600, color: textColor }}>
          {type === 'incoming' ? link.sourceTitle : link.targetTitle}
        </span>
      </div>
      {link.context && (
        <p style={{
          margin: 0,
          fontSize: 11,
          color: subTextColor,
          lineHeight: 1.5,
          opacity: 0.8,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {link.context}
        </p>
      )}
    </div>
  );

  // 渲染死链项
  const renderDeadLinkItem = (link, idx) => (
    <div
      key={`dead-${idx}-${link.name}`}
      style={{
        padding: '10px 12px',
        marginBottom: 6,
        borderRadius: 8,
        background: 'rgba(231, 76, 60, 0.05)',
        border: '1px solid rgba(231, 76, 60, 0.15)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12 }}>⚠️</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#E74C3C' }}>
            {link.name}
          </span>
        </div>
        {onCreateNote && (
          <button
            onClick={() => onCreateNote(link.name)}
            style={{
              padding: '3px 8px',
              border: 'none',
              borderRadius: 4,
              background: '#E74C3C',
              color: '#fff',
              fontSize: 10,
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            创建
          </button>
        )}
      </div>
      {link.context && (
        <p style={{
          margin: 0,
          fontSize: 11,
          color: subTextColor,
          lineHeight: 1.5,
          opacity: 0.7,
        }}>
          来自：{link.sourceTitle || '未知'}
        </p>
      )}
    </div>
  );

  // 渲染相关笔记项
  const renderRelatedItem = (note, idx) => (
    <div
      key={`related-${note.id}`}
      onClick={() => onNoteClick && onNoteClick(note.id)}
      style={{
        padding: '8px 12px',
        marginBottom: 4,
        borderRadius: 6,
        background: isNight ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = isNight ? 'rgba(124,111,240,0.1)' : 'rgba(124,111,240,0.06)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = isNight ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'; }}
    >
      <span style={{ fontSize: 12, color: textColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {note.title}
      </span>
      <span style={{ fontSize: 10, color: '#7C6FF0', fontWeight: 600, flexShrink: 0, marginLeft: 8 }}>
        关联度 {note.relevance}
      </span>
    </div>
  );

  // Tab 配置
  const tabs = [
    { id: 'backlinks', label: '反向链接', count: backlinks.inLinks.length, icon: '↩️' },
    { id: 'outgoing', label: '出站链接', count: backlinks.outLinks.length, icon: '↪️' },
    { id: 'dead', label: '死链', count: backlinks.deadLinks.length, icon: '⚠️' },
    { id: 'related', label: '相关', count: relatedNotes.length, icon: '🔗' },
  ];

  if (isLoading) {
    return (
      <div style={{ padding: 20, textAlign: 'center', color: subTextColor, fontSize: 13 }}>
        <div style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(124,111,240,0.3)', borderTopColor: '#7C6FF0', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginRight: 8 }} />
        正在分析链接关系...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 统计卡片 */}
      {stats && (
        <div style={{
          padding: '12px',
          margin: '0 12px 12px',
          borderRadius: 10,
          background: isNight ? 'rgba(124,111,240,0.08)' : 'rgba(124,111,240,0.05)',
          border: `1px solid ${isNight ? 'rgba(124,111,240,0.15)' : 'rgba(124,111,240,0.1)'}`,
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#7C6FF0' }}>{backlinks.inLinks.length}</div>
              <div style={{ fontSize: 10, color: subTextColor }}>反向链接</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#4ECDC4' }}>{backlinks.outLinks.length}</div>
              <div style={{ fontSize: 10, color: subTextColor }}>出站链接</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#E74C3C' }}>{backlinks.deadLinks.length}</div>
              <div style={{ fontSize: 10, color: subTextColor }}>死链</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#FFD93D' }}>{relatedNotes.length}</div>
              <div style={{ fontSize: 10, color: subTextColor }}>相关笔记</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 切换 */}
      <div style={{
        display: 'flex',
        padding: '0 12px',
        gap: 4,
        borderBottom: `1px solid ${isNight ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
        marginBottom: 8,
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '8px 4px',
              border: 'none',
              background: 'transparent',
              color: activeTab === tab.id ? '#7C6FF0' : subTextColor,
              fontSize: 11,
              cursor: 'pointer',
              borderBottom: activeTab === tab.id ? '2px solid #7C6FF0' : '2px solid transparent',
              fontWeight: activeTab === tab.id ? 600 : 400,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span style={{
                fontSize: 9,
                padding: '1px 4px',
                borderRadius: 8,
                background: activeTab === tab.id ? '#7C6FF0' : (isNight ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'),
                color: activeTab === tab.id ? '#fff' : subTextColor,
                fontWeight: 600,
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 内容区域 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 12px' }}>
        {activeTab === 'backlinks' && (
          backlinks.inLinks.length === 0 ? (
            <EmptyState text="暂无反向链接" subtext="其他笔记引用这篇笔记时会显示在这里" icon="🔗" />
          ) : (
            backlinks.inLinks.map(link => renderLinkItem(link, 'incoming'))
          )
        )}

        {activeTab === 'outgoing' && (
          backlinks.outLinks.length === 0 ? (
            <EmptyState text="暂无出站链接" subtext="在笔记中使用 [[笔记名]] 添加链接" icon="↪️" />
          ) : (
            backlinks.outLinks.map(link => renderLinkItem(link, 'outgoing'))
          )
        )}

        {activeTab === 'dead' && (
          backlinks.deadLinks.length === 0 ? (
            <EmptyState text="没有死链" subtext="所有链接都指向已存在的笔记" icon="✅" />
          ) : (
            backlinks.deadLinks.map((link, idx) => renderDeadLinkItem(link, idx))
          )
        )}

        {activeTab === 'related' && (
          relatedNotes.length === 0 ? (
            <EmptyState text="暂无相关笔记" subtext="添加更多链接后会推荐相关笔记" icon="💡" />
          ) : (
            relatedNotes.map((note, idx) => renderRelatedItem(note, idx))
          )
        )}
      </div>
    </div>
  );
}

// 空状态组件
function EmptyState({ text, subtext, icon }) {
  return (
    <div style={{ padding: '30px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.5 }}>{icon}</div>
      <p style={{ margin: '0 0 4px', fontSize: 13, color: '#636E72', fontWeight: 500 }}>{text}</p>
      <p style={{ margin: 0, fontSize: 11, color: '#B2BEC3', lineHeight: 1.5 }}>{subtext}</p>
    </div>
  );
}

// 暴露到全局
if (typeof window !== 'undefined') {
  window.BacklinkPanel = BacklinkPanel;
}

console.log('[BacklinkPanel] 反向链接面板组件已加载');
