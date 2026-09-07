// ============================================
// 知识升维系统视图
// 漏斗总览 + 卡片墙 + 图标库 + 升维操作 + 谱系回溯
// ============================================

function ElevationView({
  density, isNight, textColor, subTextColor, themeBg, focusMode,
}) {
  // 响应式
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [activeView, setActiveView] = React.useState('funnel'); // funnel | cards | icons
  const [filterLevel, setFilterLevel] = React.useState('all');
  const [filterTopic, setFilterTopic] = React.useState('全部话题');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedItem, setSelectedItem] = React.useState(null);
  const [detailPanel, setDetailPanel] = React.useState(null);
  const [showElevationDialog, setShowElevationDialog] = React.useState(false);
  const [elevatingSource, setElevatingSource] = React.useState(null);
  const [animatingLevel, setAnimatingLevel] = React.useState(null);

  const stats = getElevationStats();

  // 打开升维弹窗
  const openElevation = (item, fromLevel) => {
    setElevatingSource({ item, fromLevel });
    setShowElevationDialog(true);
  };

  // 过滤后的卡片数据
  const filteredCards = React.useMemo(() => {
    let items = [];
    if (filterLevel === 'all' || filterLevel === 'original') {
      items = items.concat(L0_NOTES.map(n => ({ ...n, level: 'original' })));
    }
    if (filterLevel === 'all' || filterLevel === 'card') {
      items = items.concat(L1_CARDS.map(n => ({ ...n, level: 'card' })));
    }
    if (filterLevel === 'all' || filterLevel === 'summary') {
      items = items.concat(L2_SUMMARIES.map(n => ({ ...n, level: 'summary' })));
    }
    if (filterLevel === 'all' || filterLevel === 'icon') {
      items = items.concat(L3_ICONS.map(n => ({ ...n, level: 'icon' })));
    }
    if (filterTopic !== '全部话题') {
      items = items.filter(i => i.topic === filterTopic);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(i =>
        i.title.toLowerCase().includes(q) ||
        (i.content && i.content.toLowerCase().includes(q))
      );
    }
    return items;
  }, [filterLevel, filterTopic, searchQuery]);

  // 点击漏斗某层
  const handleFunnelClick = (levelKey) => {
    setFilterLevel(levelKey);
    setActiveView('cards');
  };

  // 打开详情
  const openDetail = (item, level) => {
    setDetailPanel({ item, level });
  };

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      minWidth: 0,
      background: themeBg,
      transition: 'background-color 0.3s ease',
      overflow: 'hidden',
      opacity: focusMode ? 0.1 : 1,
      pointerEvents: focusMode ? 'none' : 'auto',
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* 顶部栏 */}
        <div style={{
          flexShrink: 0,
          padding: isMobile ? '12px 14px' : '16px 32px',
          borderBottom: `1px solid ${isNight ? 'rgba(255,255,255,0.05)' : 'rgba(43, 42, 38, 0.05)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          gap: isMobile ? 8 : 0,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{
              fontSize: 20,
              fontWeight: 500,
              fontFamily: "'Noto Serif SC', serif",
              color: textColor,
              lineHeight: 1.3,
            }}>
              知识升维
            </h1>
            <div style={{ fontSize: 12, color: subTextColor }}>
              四段跃迁：原文 → 卡片 → 摘要 → 元知识
            </div>
          </div>

          {/* 视图切换 */}
          <div style={{
            display: 'flex',
            background: isNight ? 'rgba(255,255,255,0.04)' : 'rgba(43, 42, 38, 0.04)',
            borderRadius: 8,
            padding: 3,
            gap: 2,
          }}>
            {[
              { id: 'funnel', label: '漏斗' },
              { id: 'cards', label: '卡片墙' },
              { id: 'icons', label: '图标库' },
            ].map(v => (
              <button
                key={v.id}
                onClick={() => setActiveView(v.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 6,
                  border: 'none',
                  background: activeView === v.id
                    ? (isNight ? 'rgba(255,255,255,0.08)' : '#fff')
                    : 'transparent',
                  color: activeView === v.id ? textColor : subTextColor,
                  fontSize: 12,
                  fontWeight: activeView === v.id ? 500 : 400,
                  cursor: 'pointer',
                  boxShadow: activeView === v.id ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.15s ease',
                  fontFamily: activeView === v.id ? "'Noto Serif SC', serif" : 'inherit',
                }}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* 主体内容 */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 32px',
        }}>
          {activeView === 'funnel' && (
            <FunnelView
              stats={stats}
              onLevelClick={handleFunnelClick}
              isNight={isNight}
              textColor={textColor}
              subTextColor={subTextColor}
            />
          )}
          {activeView === 'cards' && (
            <CardWallView
              items={filteredCards}
              filterLevel={filterLevel}
              onLevelChange={setFilterLevel}
              filterTopic={filterTopic}
              onTopicChange={setFilterTopic}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onItemClick={openDetail}
              onElevate={openElevation}
              isNight={isNight}
              textColor={textColor}
              subTextColor={subTextColor}
            />
          )}
          {activeView === 'icons' && (
            <IconLibraryView
              icons={L3_ICONS}
              onItemClick={openDetail}
              isNight={isNight}
              textColor={textColor}
              subTextColor={subTextColor}
            />
          )}
        </div>
      </div>

      {/* 右侧：统计 + 近期活动 */}
      <ElevationSidebar
        stats={stats}
        isNight={isNight}
        textColor={textColor}
        subTextColor={subTextColor}
      />

      {/* 详情面板 */}
      {detailPanel && (
        <ElevationDetailPanel
          item={detailPanel.item}
          level={detailPanel.level}
          onClose={() => setDetailPanel(null)}
          onElevate={openElevation}
          isNight={isNight}
          textColor={textColor}
          subTextColor={subTextColor}
        />
      )}

      {/* 升维对话框 */}
      {showElevationDialog && elevatingSource && (
        <ElevationDialog
          source={elevatingSource}
          onClose={() => setShowElevationDialog(false)}
          isNight={isNight}
          textColor={textColor}
          subTextColor={subTextColor}
        />
      )}
    </div>
  );
}

// ============================================
// 升维漏斗视图
// ============================================
function FunnelView({ stats, onLevelClick, isNight, textColor, subTextColor }) {
  const levels = stats.levels;
  const maxCount = levels[0].count;

  // 漏斗宽度百分比
  const widths = levels.map(l => {
    // 从 100% 开始，逐级递减到 30%
    const idx = levels.indexOf(l);
    return 100 - idx * 22;
  });

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* 漏斗标题 + 四段论通俗解释 */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h2 style={{
          fontSize: 18,
          fontWeight: 500,
          fontFamily: "'Noto Serif SC', serif",
          color: textColor,
          marginBottom: 6,
        }}>
          知识升维是什么？
        </h2>
        <p style={{
          fontSize: 13,
          color: subTextColor,
          lineHeight: 1.7,
          maxWidth: 480,
          margin: '0 auto 20px',
        }}>
          知识不是越堆越多，而是越提炼越精。<br />
          像蒸馏一样，每一次升维都是一次浓缩与抽象。
        </p>

        {/* 四段论通俗图示 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          maxWidth: 640,
          margin: '0 auto',
          flexWrap: 'wrap',
        }}>
          {[
            { label: '原文', sub: '你写下的完整思考', icon: '▤', color: '#9B998F' },
            { label: '卡片', sub: '提炼出的核心要点', icon: '▢', color: '#B56B3A' },
            { label: '摘要', sub: '浓缩成的几句话', icon: '▫', color: '#5A7A4E' },
            { label: '元知识', sub: '成为你直觉的一部分', icon: '·', color: '#3D4A6B' },
          ].map((stage, i) => (
            <React.Fragment key={stage.label}>
              <div style={{
                padding: '12px 14px',
                borderRadius: 12,
                background: isNight ? 'rgba(255,255,255,0.04)' : '#FFFEFA',
                border: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
                minWidth: 120,
              }}>
                <div style={{ fontSize: 20, color: stage.color, marginBottom: 4, lineHeight: 1 }}>
                  {stage.icon}
                </div>
                <div style={{
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: "'Noto Serif SC', serif",
                  color: textColor,
                  marginBottom: 2,
                }}>
                  {stage.label}
                </div>
                <div style={{
                  fontSize: 10.5,
                  color: subTextColor,
                  lineHeight: 1.4,
                }}>
                  {stage.sub}
                </div>
              </div>
              {i < 3 && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={subTextColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.4 }}>
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 漏斗图形 */}
      <div style={{
        position: 'relative',
        height: 360,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 0',
      }}>
        {levels.map((level, i) => {
          const widthPct = widths[i];
          const height = 70 - i * 8;
          return (
            <div key={level.key} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              width: '100%',
              justifyContent: 'center',
              position: 'relative',
            }}>
              {/* 左侧：层级标签 */}
              <div style={{
                width: 80,
                textAlign: 'right',
                fontSize: 12,
                color: subTextColor,
              }}>
                <div style={{
                  fontFamily: "'Noto Serif SC', serif",
                  color: textColor,
                  fontSize: 14,
                  fontWeight: 500,
                  marginBottom: 2,
                }}>
                  {level.label}
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
                  L{3 - i}
                </div>
              </div>

              {/* 漏斗块 */}
              <div
                onClick={() => onLevelClick(level.key)}
                style={{
                  width: `${widthPct}%`,
                  maxWidth: 520,
                  height: height,
                  borderRadius: i === 0 ? '12px 12px 4px 4px'
                    : i === levels.length - 1 ? '4px 4px 12px 12px'
                    : '4px',
                  background: `linear-gradient(90deg, ${level.color}10, ${level.color}30 50%, ${level.color}10)`,
                  border: `1px solid ${level.color}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  boxShadow: `0 4px 20px ${level.color}10`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = `0 6px 28px ${level.color}25`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = `0 4px 20px ${level.color}10`;
                }}
              >
                <span style={{
                  fontSize: 22,
                  fontWeight: 600,
                  fontFamily: "'Noto Serif SC', serif",
                  color: level.color,
                  letterSpacing: 2,
                }}>
                  {level.count}
                </span>
                <span style={{
                  fontSize: 12,
                  color: level.color,
                  opacity: 0.7,
                  marginLeft: 8,
                }}>
                  篇
                </span>
              </div>

              {/* 右侧：转化率 */}
              <div style={{ width: 100 }}>
                {i < levels.length - 1 && (
                  <div style={{
                    fontSize: 11,
                    color: subTextColor,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <polyline points="19 12 12 19 5 12" />
                    </svg>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", color: level.color, fontWeight: 500 }}>
                      {stats.rates[`${levels[i].label}→${levels[i+1].label}`]}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 下方：核心数据指标 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16,
        marginTop: 40,
        paddingTop: 32,
        borderTop: `1px dashed ${isNight ? 'rgba(255,255,255,0.08)' : 'rgba(43, 42, 38, 0.08)'}`,
      }}>
        <StatCard
          label="知识总字数"
          value={`${Math.round(stats.totalWords / 1000)}k`}
          sub="原文总字数"
          isNight={isNight} textColor={textColor} subTextColor={subTextColor}
        />
        <StatCard
          label="总阅读次数"
          value={stats.totalReads}
          sub="含各层级累计"
          isNight={isNight} textColor={textColor} subTextColor={subTextColor}
        />
        <StatCard
          label="内化率"
          value={`${Math.round((L3_ICONS.length / L0_NOTES.length) * 100)}%`}
          sub="原文到元知识的转化率"
          isNight={isNight} textColor={textColor} subTextColor={subTextColor}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, isNight, textColor, subTextColor }) {
  return (
    <div style={{
      padding: '16px 20px',
      borderRadius: 12,
      background: isNight ? 'rgba(255,255,255,0.03)' : '#FFFEFA',
      border: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
      textAlign: 'center',
    }}>
      <div style={{
        fontSize: 11, color: subTextColor, marginBottom: 6,
        fontFamily: "'Noto Serif SC', serif",
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 26,
        fontWeight: 600,
        fontFamily: "'Noto Serif SC', serif",
        color: textColor,
        lineHeight: 1.2,
        marginBottom: 4,
      }}>
        {value}
      </div>
      <div style={{
        fontSize: 10,
        color: subTextColor,
        opacity: 0.7,
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        {sub}
      </div>
    </div>
  );
}

// ============================================
// 卡片墙视图
// ============================================
function CardWallView({
  items, filterLevel, onLevelChange,
  filterTopic, onTopicChange,
  searchQuery, onSearchChange,
  onItemClick, onElevate,
  isNight, textColor, subTextColor,
}) {
  const levelTabs = [
    { key: 'all', label: '全部', color: '#6B6960' },
    { key: 'original', label: '原文', color: '#8A8780' },
    { key: 'card', label: '卡片', color: '#B56B3A' },
    { key: 'summary', label: '摘要', color: '#5A7A4E' },
    { key: 'icon', label: '元知识', color: '#9B6BA0' },
  ];

  return (
    <div>
      {/* 筛选工具栏 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        gap: 16,
        flexWrap: 'wrap',
      }}>
        {/* 层级筛选 Tabs */}
        <div style={{
          display: 'flex',
          gap: 4,
          background: isNight ? 'rgba(255,255,255,0.03)' : 'rgba(43, 42, 38, 0.03)',
          borderRadius: 8,
          padding: 3,
        }}>
          {levelTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => onLevelChange(tab.key)}
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                border: 'none',
                background: filterLevel === tab.key
                  ? (isNight ? 'rgba(255,255,255,0.06)' : '#fff')
                  : 'transparent',
                color: filterLevel === tab.key ? textColor : subTextColor,
                fontSize: 12,
                fontWeight: filterLevel === tab.key ? 500 : 400,
                cursor: 'pointer',
                boxShadow: filterLevel === tab.key ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{
                display: 'inline-block',
                width: 6, height: 6,
                borderRadius: '50%',
                background: tab.color,
                marginRight: 6,
                verticalAlign: 'middle',
              }} />
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* 话题筛选 */}
          <select
            value={filterTopic}
            onChange={(e) => onTopicChange(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              border: `1px solid ${isNight ? 'rgba(255,255,255,0.08)' : 'rgba(43, 42, 38, 0.08)'}`,
              background: isNight ? '#2A2925' : '#fff',
              color: textColor,
              fontSize: 12,
              cursor: 'pointer',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          >
            {ELEVATION_TOPICS.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* 搜索 */}
          <div style={{ position: 'relative' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{
              position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: subTextColor,
            }}>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="搜索…"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{
                padding: '6px 10px 6px 30px',
                borderRadius: 6,
                border: `1px solid ${isNight ? 'rgba(255,255,255,0.08)' : 'rgba(43, 42, 38, 0.08)'}`,
                background: isNight ? '#2A2925' : '#fff',
                color: textColor,
                fontSize: 12,
                outline: 'none',
                fontFamily: 'inherit',
                width: 160,
              }}
            />
          </div>
        </div>
      </div>

      {/* 卡片数量 */}
      <div style={{
        fontSize: 11,
        color: subTextColor,
        marginBottom: 14,
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        共 {items.length} 项
      </div>

      {/* 卡片网格 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 16,
      }}>
        {items.map(item => (
          <ElevationCard
            key={item.id}
            item={item}
            level={item.level}
            onClick={() => onItemClick(item, item.level)}
            onElevate={() => onElevate(item, item.level)}
            isNight={isNight}
            textColor={textColor}
            subTextColor={subTextColor}
          />
        ))}
      </div>

      {items.length === 0 && (
        <div style={{
          padding: '60px 20px',
          textAlign: 'center',
          color: subTextColor,
          fontSize: 13,
        }}>
          没有找到匹配的内容
        </div>
      )}
    </div>
  );
}

// ============================================
// 升维卡片组件
// ============================================
function ElevationCard({ item, level, onClick, onElevate, isNight, textColor, subTextColor }) {
  const levelColors = {
    original: '#8B96A8',
    card: '#7C6FF0',
    summary: '#4ECDC4',
    icon: '#FFC107',
  };
  const color = levelColors[level] || '#8A8780';

  // 升维提示阈值：原文 >=3 次未升维的显示提示
  const showElevateHint = level === 'original' && item.readCount >= 3;

  const cardBg = {
    original: isNight ? '#262522' : '#FFFEFA',
    card: isNight ? '#2D2A24' : '#FBF7EF',
    summary: isNight ? '#282623' : '#F5F0E8',
    icon: isNight ? '#1F1E1B' : '#FFFEFA',
  };

  return (
    <div
      onClick={onClick}
      style={{
        background: cardBg[level] || '#fff',
        borderRadius: level === 'summary' ? 16 : 10,
        border: `1px solid ${isNight ? `rgba(255,255,255,0.08)` : 'rgba(43, 42, 38, 0.08)'}`,
        padding: level === 'icon' ? '20px 16px' : '14px 16px',
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = `0 8px 24px ${color}15`;
        e.currentTarget.style.borderColor = `${color}40`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
        e.currentTarget.style.borderColor = isNight ? 'rgba(255,255,255,0.08)' : 'rgba(43, 42, 38, 0.08)';
      }}
    >
      {/* 层级标签 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{
          fontSize: 10,
          padding: '2px 8px',
          borderRadius: 10,
          background: `${color}15`,
          color: color,
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 500,
        }}>
          {ELEVATION_LEVEL_LABELS[level]}
        </span>
        {level === 'icon' && item.symbol && (
          <span style={{
            fontSize: 20,
            color: color,
            lineHeight: 1,
          }}>
            {item.symbol}
          </span>
        )}
      </div>

      {/* 图标级：居中显示符号 */}
      {level === 'icon' ? (
        <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
          <div style={{
            fontSize: 36,
            color: color,
            marginBottom: 8,
            lineHeight: 1,
          }}>
            {item.symbol}
          </div>
          <div style={{
            fontSize: 15,
            fontWeight: 600,
            fontFamily: "'Noto Serif SC', serif",
            color: textColor,
          }}>
            {item.title}
          </div>
        </div>
      ) : (
        <>
          {/* 标题 */}
          <div style={{
            fontSize: level === 'summary' ? 15 : 14,
            fontWeight: 600,
            fontFamily: "'Noto Serif SC', serif",
            color: textColor,
            lineHeight: 1.4,
          }}>
            {item.title}
          </div>

          {/* 内容 */}
          <div style={{
            fontSize: 12,
            color: subTextColor,
            lineHeight: 1.55,
            display: '-webkit-box',
            WebkitLineClamp: level === 'original' ? 3 : level === 'card' ? 4 : 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            whiteSpace: 'pre-wrap',
            opacity: 0.75,
          }}>
            {item.content}
          </div>

          {/* 卡片要点 */}
          {level === 'card' && item.keyPoints && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 4,
              marginTop: 2,
            }}>
              {item.keyPoints.slice(0, 3).map((p, i) => (
                <span key={i} style={{
                  fontSize: 10,
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: isNight ? 'rgba(255,255,255,0.05)' : 'rgba(43, 42, 38, 0.04)',
                  color: subTextColor,
                }}>
                  {p}
                </span>
              ))}
            </div>
          )}
        </>
      )}

      {/* 底部：话题 + 阅读次数 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 'auto',
        paddingTop: 8,
        borderTop: `1px dashed ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
        fontSize: 10,
        color: subTextColor,
        fontFamily: "'JetBrains Mono', monospace",
        opacity: 0.8,
      }}>
        <span>{item.topic}</span>
        <span>阅读 {item.readCount} 次</span>
      </div>

      {/* 升维提示 */}
      {showElevateHint && (
        <button
          onClick={(e) => { e.stopPropagation(); onElevate(); }}
          style={{
            position: 'absolute',
            top: 10, right: 10,
            padding: '4px 10px',
            borderRadius: 12,
            border: `1px solid ${color}40`,
            background: `${color}10`,
            color: color,
            fontSize: 10,
            cursor: 'pointer',
            fontFamily: "'Noto Serif SC', serif",
            fontWeight: 500,
            transition: 'all 0.15s ease',
            opacity: 0,
            animation: 'fadeIn 0.3s ease forwards',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `${color}20`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = `${color}10`;
          }}
        >
          ↑ 转卡片
        </button>
      )}
    </div>
  );
}

// ============================================
// 图标库视图
// ============================================
function IconLibraryView({ icons, onItemClick, isNight, textColor, subTextColor }) {
  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h2 style={{
          fontSize: 18,
          fontWeight: 500,
          fontFamily: "'Noto Serif SC', serif",
          color: textColor,
          marginBottom: 6,
        }}>
          元知识图标库
        </h2>
        <p style={{
          fontSize: 13,
          color: subTextColor,
          lineHeight: 1.6,
        }}>
          思维的元素周期表 — 每一个符号都是内化的直觉
        </p>
      </div>

      {/* 图标网格 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: 20,
      }}>
        {icons.map(icon => (
          <div
            key={icon.id}
            onClick={() => onItemClick(icon, 'icon')}
            style={{
              background: isNight ? '#1F1E1B' : '#FFFEFA',
              borderRadius: 16,
              border: `1px solid ${isNight ? 'rgba(155, 107, 160, 0.2)' : 'rgba(155, 107, 160, 0.15)'}`,
              padding: '28px 16px 20px',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
              textAlign: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.03)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(155, 107, 160, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              fontSize: 48,
              color: '#9B6BA0',
              marginBottom: 12,
              lineHeight: 1,
              fontFamily: 'serif',
            }}>
              {icon.symbol}
            </div>
            <div style={{
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "'Noto Serif SC', serif",
              color: textColor,
              marginBottom: 4,
            }}>
              {icon.title}
            </div>
            <div style={{
              fontSize: 10,
              color: subTextColor,
              opacity: 0.7,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              阅读 {icon.readCount} 次
            </div>
          </div>
        ))}

        {/* 占位空槽 */}
        {[0, 1, 2, 3].map(i => (
          <div
            key={`empty-${i}`}
            style={{
              borderRadius: 16,
              border: `1px dashed ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.08)'}`,
              padding: '28px 16px 20px',
              textAlign: 'center',
              opacity: 0.5,
            }}
          >
            <div style={{
              fontSize: 36,
              color: subTextColor,
              marginBottom: 12,
              opacity: 0.4,
            }}>
              ◇
            </div>
            <div style={{
              fontSize: 11,
              color: subTextColor,
              opacity: 0.6,
              fontFamily: "'Noto Serif SC', serif",
            }}>
              待内化
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// 右侧统计面板
// ============================================
function ElevationSidebar({ stats, isNight, textColor, subTextColor }) {
  const recent = getRecentElevations(8);

  return (
    <div style={{
      width: 280,
      flexShrink: 0,
      borderLeft: `1px solid ${isNight ? 'rgba(255,255,255,0.05)' : 'rgba(43, 42, 38, 0.05)'}`,
      padding: '24px 20px',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
    }}>
      {/* 转化率卡片 */}
      <div style={{
        background: isNight ? 'rgba(255,255,255,0.03)' : '#FFFEFA',
        borderRadius: 12,
        border: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
        padding: 16,
      }}>
        <h3 style={{
          fontSize: 13,
          fontWeight: 600,
          fontFamily: "'Noto Serif SC', serif",
          color: textColor,
          marginBottom: 14,
        }}>
          升维转化率
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Object.entries(stats.rates).map(([label, rate]) => (
            <div key={label}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 11,
                color: subTextColor,
                marginBottom: 4,
              }}>
                <span>{label}</span>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 500,
                  color: textColor,
                }}>
                  {rate}%
                </span>
              </div>
              <div style={{
                height: 6,
                borderRadius: 3,
                background: isNight ? 'rgba(255,255,255,0.04)' : 'rgba(43, 42, 38, 0.04)',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${rate}%`,
                  height: '100%',
                  borderRadius: 3,
                  background: `linear-gradient(90deg, #B56B3A, #9B6BA0)`,
                  transition: 'width 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 近期升维活动 */}
      <div style={{
        background: isNight ? 'rgba(255,255,255,0.03)' : '#FFFEFA',
        borderRadius: 12,
        border: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
        padding: 16,
      }}>
        <h3 style={{
          fontSize: 13,
          fontWeight: 600,
          fontFamily: "'Noto Serif SC', serif",
          color: textColor,
          marginBottom: 14,
        }}>
          近期升维
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {recent.map((event, i) => {
            const colorMap = { '卡片': '#B56B3A', '摘要': '#5A7A4E', '元知识': '#9B6BA0' };
            const color = colorMap[event.to] || '#8A8780';
            return (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                paddingBottom: i < recent.length - 1 ? 10 : 0,
                borderBottom: i < recent.length - 1
                  ? `1px dashed ${isNight ? 'rgba(255,255,255,0.05)' : 'rgba(43, 42, 38, 0.05)'}`
                  : 'none',
              }}>
                <div style={{
                  width: 6, height: 6,
                  borderRadius: '50%',
                  background: color,
                  marginTop: 5,
                  flexShrink: 0,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 12,
                    color: textColor,
                    lineHeight: 1.3,
                    marginBottom: 2,
                    fontFamily: "'Noto Serif SC', serif",
                  }}>
                    {event.title}
                  </div>
                  <div style={{
                    fontSize: 10,
                    color: subTextColor,
                    fontFamily: "'JetBrains Mono', monospace",
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}>
                    <span style={{ opacity: 0.7 }}>{event.from}</span>
                    <span style={{ color }}>→ {event.to}</span>
                    <span style={{ opacity: 0.5, marginLeft: 'auto' }}>{event.date}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 引言 */}
      <div style={{
        padding: '20px 16px',
        borderRadius: 12,
        background: 'linear-gradient(135deg, rgba(155, 107, 160, 0.08), rgba(90, 122, 78, 0.06))',
        borderLeft: `3px solid #9B6BA0`,
        fontStyle: 'italic',
        fontFamily: "'Noto Serif SC', serif",
        fontSize: 12,
        color: '#9B6BA0',
        lineHeight: 1.7,
      }}>
        学而不思则罔，思而不学则殆。
        <div style={{
          marginTop: 6,
          fontSize: 10,
          fontStyle: 'normal',
          textAlign: 'right',
          opacity: 0.7,
        }}>
          — 《论语》
        </div>
      </div>
    </div>
  );
}

// ============================================
// 详情面板
// ============================================
function ElevationDetailPanel({ item, level, onClose, onElevate, isNight, textColor, subTextColor }) {
  const lineage = getElevationLineage(item.id, level);

  const levelColors = {
    original: '#8A8780',
    card: '#B56B3A',
    summary: '#5A7A4E',
    icon: '#9B6BA0',
  };
  const color = levelColors[level] || '#8A8780';

  // 是否还能继续升维
  const elevateOrder = ['original', 'card', 'summary', 'icon'];
  const currentIdx = elevateOrder.indexOf(level);
  const canElevate = currentIdx >= 0 && currentIdx < elevateOrder.length - 1;
  const nextLevel = canElevate ? ELEVATION_LEVEL_LABELS[elevateOrder[currentIdx + 1]] : null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: isNight ? 'rgba(0,0,0,0.4)' : 'rgba(43, 42, 38, 0.25)',
        backdropFilter: 'blur(4px)',
        zIndex: 1500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn 0.2s ease both',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 520,
          maxWidth: '90vw',
          maxHeight: '85vh',
          background: isNight ? '#2A2925' : '#FFFEFA',
          borderRadius: 16,
          border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.08)'}`,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeInUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both',
        }}
      >
        {/* 头部 */}
        <div style={{
          padding: '28px 32px 20px',
          borderBottom: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
          position: 'relative',
          background: `${color}08`,
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 20, right: 20,
              width: 28, height: 28,
              borderRadius: '50%',
              border: 'none',
              background: isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)',
              color: subTextColor,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 10,
          }}>
            <span style={{
              fontSize: 11,
              padding: '3px 10px',
              borderRadius: 12,
              background: `${color}20`,
              color: color,
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 500,
            }}>
              {ELEVATION_LEVEL_LABELS[level]}
            </span>
            {level === 'icon' && (
              <span style={{ fontSize: 18, color: color }}>{item.symbol}</span>
            )}
            <span style={{ fontSize: 11, color: subTextColor }}>
              {item.topic}
            </span>
          </div>
          <h2 style={{
            fontSize: 22,
            fontWeight: 600,
            fontFamily: "'Noto Serif SC', serif",
            color: textColor,
            lineHeight: 1.3,
          }}>
            {item.title}
          </h2>
        </div>

        {/* 内容 */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 32px',
        }}>
          {/* 正文内容 */}
          <div style={{
            fontSize: 14,
            color: textColor,
            lineHeight: 1.8,
            marginBottom: 24,
            whiteSpace: 'pre-wrap',
            fontFamily: level === 'original' ? "'Noto Serif SC', serif" : 'inherit',
          }}>
            {item.content}
          </div>

          {/* 卡片要点 */}
          {level === 'card' && item.keyPoints && (
            <div style={{
              padding: '14px 18px',
              borderRadius: 10,
              background: isNight ? 'rgba(181, 107, 58, 0.08)' : 'rgba(181, 107, 58, 0.06)',
              marginBottom: 24,
              borderLeft: `3px solid #B56B3A`,
            }}>
              <div style={{
                fontSize: 11,
                color: '#B56B3A',
                marginBottom: 8,
                fontWeight: 500,
                fontFamily: "'Noto Serif SC', serif",
              }}>
                核心要点
              </div>
              <ul style={{
                margin: 0,
                padding: '0 0 0 18px',
                color: textColor,
                fontSize: 13,
                lineHeight: 1.8,
              }}>
                {item.keyPoints.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 元数据 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 12,
            padding: '16px 0',
            borderTop: `1px dashed ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
            borderBottom: `1px dashed ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
            marginBottom: 20,
          }}>
            <div>
              <div style={{ fontSize: 10, color: subTextColor, marginBottom: 4 }}>阅读次数</div>
              <div style={{ fontSize: 16, fontWeight: 500, fontFamily: "'JetBrains Mono', monospace", color: textColor }}>
                {item.readCount} <span style={{ fontSize: 10, color: subTextColor, fontWeight: 400 }}>次</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: subTextColor, marginBottom: 4 }}>累计阅读</div>
              <div style={{ fontSize: 16, fontWeight: 500, fontFamily: "'JetBrains Mono', monospace", color: textColor }}>
                {item.readMinutes || Math.round(item.wordCount / 200 * (item.readCount || 1) * 1.5)} <span style={{ fontSize: 10, color: subTextColor, fontWeight: 400 }}>分钟</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: subTextColor, marginBottom: 4 }}>字数</div>
              <div style={{ fontSize: 16, fontWeight: 500, fontFamily: "'JetBrains Mono', monospace", color: textColor }}>
                {item.wordCount || '—'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: subTextColor, marginBottom: 4 }}>
                {level === 'original' ? '创建' : '升维'}时间
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: textColor, fontFamily: "'JetBrains Mono', monospace" }}>
                {item.createdAt || item.elevatedAt}
              </div>
            </div>
          </div>

          {/* 升维谱系 */}
          <div>
            <h4 style={{
              fontSize: 11,
              color: subTextColor,
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: 12,
              fontFamily: "'Noto Serif SC', serif",
            }}>
              升维谱系
            </h4>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}>
              {lineage.map((l, i) => {
                const lc = levelColors[l.level] || '#8A8780';
                const isCurrent = l.id === item.id;
                return (
                  <div key={l.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: isCurrent
                      ? (isNight ? `${lc}15` : `${lc}08`)
                      : 'transparent',
                    border: isCurrent ? `1px solid ${lc}30` : '1px solid transparent',
                  }}>
                    <div style={{
                      width: 8, height: 8,
                      borderRadius: '50%',
                      background: lc,
                      flexShrink: 0,
                    }} />
                    <span style={{
                      fontSize: 10,
                      color: lc,
                      width: 48,
                      flexShrink: 0,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>
                      {ELEVATION_LEVEL_LABELS[l.level]}
                    </span>
                    <span style={{
                      fontSize: 12,
                      color: textColor,
                      fontWeight: isCurrent ? 500 : 400,
                    }}>
                      {l.title}
                    </span>
                    {isCurrent && (
                      <span style={{
                        marginLeft: 'auto',
                        fontSize: 10,
                        color: lc,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}>
                        当前
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 底部操作 */}
        <div style={{
          padding: '16px 32px',
          borderTop: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
          display: 'flex',
          gap: 10,
        }}>
          {canElevate && (
            <button
              onClick={() => { onClose(); onElevate(item, level); }}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: 8,
                border: 'none',
                background: `linear-gradient(135deg, ${color}, ${levelColors[elevateOrder[currentIdx + 1]]})`,
                color: '#fff',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: "'Noto Serif SC', serif",
                transition: 'opacity 0.15s ease',
              }}
            >
              ↑ 升格为{nextLevel}
            </button>
          )}
          <button style={{
            padding: '10px 16px',
            borderRadius: 8,
            border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.1)'}`,
            background: 'transparent',
            color: subTextColor,
            fontSize: 12,
            cursor: 'pointer',
          }}>
            在编辑器中查看
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 升维对话框
// ============================================
function ElevationDialog({ source, onClose, isNight, textColor, subTextColor }) {
  const [stage, setStage] = React.useState('before'); // before | animating | after
  const [aiSuggestion, setAiSuggestion] = React.useState('');

  const { item, fromLevel } = source;
  const nextLevel = fromLevel === 'original' ? 'card'
    : fromLevel === 'card' ? 'summary' : 'icon';

  const levelColors = {
    original: '#8A8780',
    card: '#B56B3A',
    summary: '#5A7A4E',
    icon: '#9B6BA0',
  };

  // AI 建议内容（模拟）
  const suggestedContent = React.useMemo(() => {
    if (nextLevel === 'card') {
      return `核心观点：${item.title}\n\n关键要点：\n1. 核心提炼一\n2. 核心提炼二\n3. 核心提炼三\n\n一句话总结：知识的价值在于密度，不在于数量。`;
    }
    if (nextLevel === 'summary') {
      return `${item.title}的核心：用更少的符号承载更多的意义。`;
    }
    return item.title;
  }, [item, nextLevel]);

  React.useEffect(() => {
    // 模拟 AI 生成延迟
    const timer = setTimeout(() => {
      setAiSuggestion(suggestedContent);
    }, 600);
    return () => clearTimeout(timer);
  }, [suggestedContent]);

  const handleElevate = () => {
    setStage('animating');
    // 全局联动：知识升维
    window.OneOSAppState.elevateNote({
      noteId: item?.id,
      level: fromLevel,
      newType: nextLevel,
    });
    setTimeout(() => {
      setStage('after');
    }, 1000);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: isNight ? 'rgba(0,0,0,0.5)' : 'rgba(43, 42, 38, 0.3)',
        backdropFilter: 'blur(6px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn 0.2s ease both',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 560,
          maxWidth: '90vw',
          background: isNight ? '#2A2925' : '#FFFEFA',
          borderRadius: 16,
          border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.08)'}`,
          boxShadow: '0 30px 80px rgba(0,0,0,0.2)',
          overflow: 'hidden',
          animation: 'fadeInUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both',
        }}
      >
        {/* 标题栏 */}
        <div style={{
          padding: '20px 28px',
          borderBottom: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{
              fontSize: 11,
              color: subTextColor,
              marginBottom: 4,
              textTransform: 'uppercase',
              letterSpacing: 1,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              知识升维
            </div>
            <h3 style={{
              fontSize: 16,
              fontWeight: 500,
              fontFamily: "'Noto Serif SC', serif",
              color: textColor,
            }}>
              从「{ELEVATION_LEVEL_LABELS[fromLevel]}」升格为「{ELEVATION_LEVEL_LABELS[nextLevel]}」
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28,
              borderRadius: '50%',
              border: 'none',
              background: isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)',
              color: subTextColor,
              cursor: 'pointer',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {stage !== 'after' && (
          <div style={{ padding: '24px 28px' }}>
            {/* 升维前后对比 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 40px 1fr',
              gap: 0,
              alignItems: 'stretch',
            }}>
              {/* 原文 */}
              <div style={{
                padding: 16,
                borderRadius: 10,
                background: isNight ? 'rgba(255,255,255,0.03)' : 'rgba(43, 42, 38, 0.02)',
                border: `1px solid ${levelColors[fromLevel]}30`,
                opacity: stage === 'animating' ? 0.4 : 1,
                transition: 'opacity 0.5s ease',
              }}>
                <div style={{
                  fontSize: 10,
                  color: levelColors[fromLevel],
                  marginBottom: 8,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  {ELEVATION_LEVEL_LABELS[fromLevel]}
                </div>
                <div style={{
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: "'Noto Serif SC', serif",
                  color: textColor,
                  marginBottom: 8,
                }}>
                  {item.title}
                </div>
                <div style={{
                  fontSize: 12,
                  color: subTextColor,
                  lineHeight: 1.6,
                  display: '-webkit-box',
                  WebkitLineClamp: 6,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {item.content}
                </div>
              </div>

              {/* 箭头 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}>
                {stage === 'animating' ? (
                  <div style={{
                    animation: 'spin 1s linear infinite',
                    fontSize: 18,
                    color: '#9B6BA0',
                  }}>
                    ⟳
                  </div>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9B6BA0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                )}
              </div>

              {/* AI 升维结果 */}
              <div style={{
                padding: 16,
                borderRadius: 10,
                background: `linear-gradient(135deg, ${levelColors[nextLevel]}10, ${levelColors[nextLevel]}05)`,
                border: `1px solid ${levelColors[nextLevel]}40`,
                opacity: stage === 'before' && !aiSuggestion ? 0.5 : 1,
                transition: 'opacity 0.5s ease',
              }}>
                <div style={{
                  fontSize: 10,
                  color: levelColors[nextLevel],
                  marginBottom: 8,
                  fontFamily: "'JetBrains Mono', monospace",
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a10 10 0 1 0 10 10" />
                    <polyline points="22 4 12 14 9 11" />
                  </svg>
                  AI 建议 · {ELEVATION_LEVEL_LABELS[nextLevel]}
                </div>
                {aiSuggestion ? (
                  <div style={{
                    fontSize: nextLevel === 'icon' ? 24 : 13,
                    fontWeight: nextLevel === 'icon' ? 600 : 500,
                    fontFamily: "'Noto Serif SC', serif",
                    color: textColor,
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                    textAlign: nextLevel === 'icon' ? 'center' : 'left',
                  }}>
                    {nextLevel === 'icon' ? (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 36, color: levelColors[nextLevel], marginBottom: 4 }}>△</div>
                        {item.title}
                      </div>
                    ) : aiSuggestion}
                  </div>
                ) : (
                  <div style={{
                    fontSize: 12,
                    color: subTextColor,
                    opacity: 0.5,
                  }}>
                    AI 正在提炼…
                  </div>
                )}
              </div>
            </div>

            {/* 提示文字 */}
            <div style={{
              marginTop: 16,
              fontSize: 11,
              color: subTextColor,
              textAlign: 'center',
              lineHeight: 1.6,
            }}>
              AI 生成升维初稿，你可以编辑调整后确认。<br />
              原内容保留，可随时回溯。
            </div>
          </div>
        )}

        {/* 完成状态 */}
        {stage === 'after' && (
          <div style={{
            padding: '48px 28px',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: 48,
              marginBottom: 16,
              animation: 'bounceIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}>
              ✧
            </div>
              <h3 style={{
                fontSize: 18,
                fontWeight: 600,
                fontFamily: "'Noto Serif SC', serif",
                color: textColor,
                marginBottom: 8,
              }}>
                知识已内化
              </h3>
              <p style={{
                fontSize: 13,
                color: subTextColor,
                lineHeight: 1.7,
                maxWidth: 360,
                margin: '0 auto',
              }}>
                「{item.title}」<br />
                已从「{ELEVATION_LEVEL_LABELS[fromLevel]}」提炼为「{ELEVATION_LEVEL_LABELS[nextLevel]}」<br />
                <span style={{ opacity: 0.7 }}>又一点知识成为了你的一部分</span>
              </p>
          </div>
        )}

        {/* 底部按钮 */}
        <div style={{
          padding: '16px 28px',
          borderTop: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
          display: 'flex',
          gap: 10,
          justifyContent: stage === 'after' ? 'center' : 'flex-end',
        }}>
          {stage === 'after' ? (
            <button
              onClick={onClose}
              style={{
                padding: '10px 28px',
                borderRadius: 8,
                border: 'none',
                background: `linear-gradient(135deg, ${levelColors[fromLevel]}, ${levelColors[nextLevel]})`,
                color: '#fff',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: "'Noto Serif SC', serif",
              }}
            >
              完成
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                style={{
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.1)'}`,
                  background: 'transparent',
                  color: subTextColor,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                取消
              </button>
              <button
                onClick={handleElevate}
                disabled={stage === 'animating' || !aiSuggestion}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  border: 'none',
                  background: `linear-gradient(135deg, ${levelColors[fromLevel]}, ${levelColors[nextLevel]})`,
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: stage === 'animating' || !aiSuggestion ? 'not-allowed' : 'pointer',
                  opacity: stage === 'animating' || !aiSuggestion ? 0.6 : 1,
                  fontFamily: "'Noto Serif SC', serif",
                  transition: 'opacity 0.15s ease',
                }}
              >
                {stage === 'animating' ? '提炼中…' : '确认提炼'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  ElevationView,
  FunnelView,
  CardWallView,
  ElevationCard,
  IconLibraryView,
  ElevationSidebar,
  ElevationDetailPanel,
  ElevationDialog,
});
