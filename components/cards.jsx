// 图标组件 —— 简洁的线条风格
const Icon = {
  Dashboard: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  Editor: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  Graph: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="5" r="2" />
      <circle cx="5" cy="19" r="2" />
      <circle cx="19" cy="19" r="2" />
      <circle cx="19" cy="10" r="1.5" />
      <line x1="12" y1="7" x2="6.5" y2="17" />
      <line x1="12" y1="7" x2="17.5" y2="17" />
      <line x1="7" y1="19" x2="17" y2="19" />
      <line x1="17.5" y1="11.5" x2="17.5" y2="17" />
    </svg>
  ),
  Calendar: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Notes: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="13" y2="17" />
    </svg>
  ),
  Social: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  AI: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2a6 6 0 00-6 6v2a2 2 0 01-2 2v2a6 6 0 006 6 6 6 0 006-6v-2a2 2 0 01-2-2V8a6 6 0 00-6-6z" />
      <path d="M9 11h.01" />
      <path d="M15 11h.01" />
      <path d="M9 16c.8.5 1.9.8 3 .8s2.2-.3 3-.8" />
    </svg>
  ),
  Review: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 3v18h18" />
      <path d="M7 14l4-4 4 4 5-6" />
    </svg>
  ),
  Nodes: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="5" r="2.5" />
      <circle cx="5" cy="19" r="2.5" />
      <circle cx="19" cy="19" r="2.5" />
      <line x1="12" y1="7.5" x2="6.5" y2="16.5" />
      <line x1="12" y1="7.5" x2="17.5" y2="16.5" />
      <line x1="7.5" y1="19" x2="16.5" y2="19" />
    </svg>
  ),
  Space: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  ),
  Voice: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  ),
  Circles: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="7" cy="9" r="4" />
      <circle cx="17" cy="15" r="4" />
      <path d="M10.5 11 L13.5 13" />
    </svg>
  ),
  Focus: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  ),
  ArrowRight: (props) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  Plus: (props) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Check: (props) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Source: (props) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  ),
  Card: (props) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="6" width="18" height="12" rx="1.5" />
      <line x1="7" y1="10" x2="17" y2="10" />
      <line x1="7" y1="14" x2="14" y2="14" />
    </svg>
  ),
  Summary: (props) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8 6h13M8 12h13M8 18h13" />
      <circle cx="3.5" cy="6" r="1.5" fill="currentColor" />
      <circle cx="3.5" cy="12" r="1.5" fill="currentColor" />
      <circle cx="3.5" cy="18" r="1.5" fill="currentColor" />
    </svg>
  ),
  Meta: (props) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  ChevronDown: (props) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  Clock: (props) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 14" />
    </svg>
  ),
};

// ==================== 时间块规划组件 ====================
function TimeBlocksCard({ colors, density }) {
  const [activeFilter, setActiveFilter] = React.useState('all');
  const [hoveredBlock, setHoveredBlock] = React.useState(null);

  const typeTotals = TIME_BLOCKS.reduce((acc, block) => {
    acc[block.type] = (acc[block.type] || 0) + block.duration;
    return acc;
  }, {});

  const totalMinutes = TIME_BLOCKS.reduce((sum, b) => sum + b.duration, 0);
  const completedMinutes = TIME_BLOCKS
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + b.duration, 0);

  const filteredBlocks = activeFilter === 'all'
    ? TIME_BLOCKS
    : TIME_BLOCKS.filter(b => b.type === activeFilter);

  // 计算时间轴位置 (07:00 - 22:00 = 15小时 = 900分钟)
  const DAY_START_MIN = 7 * 60; // 420
  const DAY_END_MIN = 22 * 60; // 1320
  const DAY_SPAN = DAY_END_MIN - DAY_START_MIN; // 900

  const timeToPercent = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    const minutes = h * 60 + m;
    return ((minutes - DAY_START_MIN) / DAY_SPAN) * 100;
  };

  const pad = (n) => n.toString().padStart(2, '0');
  const hourMarkers = [];
  for (let h = 7; h <= 22; h += 3) {
    hourMarkers.push({ label: `${pad(h)}:00`, percent: ((h * 60 - DAY_START_MIN) / DAY_SPAN) * 100 });
  }

  const cardStyle = {
    background: '#FBF9F3',
    border: '1px solid rgba(43, 42, 38, 0.06)',
    borderRadius: density === 'compact' ? 8 : 12,
    padding: density === 'compact' ? '16px 20px' : '24px 28px',
    display: 'flex',
    flexDirection: 'column',
    gap: density === 'compact' ? 12 : 18,
  };

  const filterBtns = ['all', 'focus', 'social', 'life', 'rest'];
  const filterLabels = { all: '全部', focus: '专注', social: '社交', life: '生活', rest: '休息' };

  return (
    <div className="card-hover" style={cardStyle}>
      {/* 标题行 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon.Clock style={{ color: '#2B2A26', opacity: 0.6 }} />
          <h3 style={{ fontSize: 15, fontWeight: 500, color: '#2B2A26', fontFamily: "'Noto Serif SC', serif" }}>
            今日时间块
          </h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {filterBtns.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                padding: '4px 10px',
                fontSize: 12,
                borderRadius: 6,
                border: 'none',
                background: activeFilter === f
                  ? (f === 'all' ? '#2B2A26' : TIME_BLOCK_COLORS[f].bg)
                  : 'transparent',
                color: activeFilter === f ? '#fff' : '#6B6960',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                fontWeight: activeFilter === f ? 500 : 400,
              }}
            >
              {filterLabels[f]}
            </button>
          ))}
        </div>
      </div>

      {/* 时间轴 */}
      <div style={{ position: 'relative', height: density === 'compact' ? 60 : 72 }}>
        {/* 时间刻度 */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '100%',
          display: 'flex', alignItems: 'flex-end', paddingBottom: density === 'compact' ? 44 : 52,
        }}>
          {hourMarkers.map((m, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${m.percent}%`,
              transform: 'translateX(-50%)',
              fontSize: 10,
              color: '#9B998F',
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {m.label}
            </div>
          ))}
        </div>

        {/* 时间块条 */}
        <div style={{
          position: 'absolute',
          bottom: density === 'compact' ? 0 : 6,
          left: 0, right: 0,
          height: density === 'compact' ? 36 : 44,
          display: 'flex',
          alignItems: 'center',
        }}>
          {/* 底色轨道 */}
          <div style={{
            position: 'absolute',
            left: 0, right: 0,
            height: 3,
            background: '#EDE9DD',
            borderRadius: 2,
          }} />

          {filteredBlocks.map((block) => {
            const left = timeToPercent(block.startTime);
            const width = timeToPercent(block.endTime) - left;
            const color = TIME_BLOCK_COLORS[block.type];
            const isCompleted = block.status === 'completed';
            const isInProgress = block.status === 'in-progress';
            const isHovered = hoveredBlock === block.id;

            return (
              <div
                key={block.id}
                onMouseEnter={() => setHoveredBlock(block.id)}
                onMouseLeave={() => setHoveredBlock(null)}
                style={{
                  position: 'absolute',
                  left: `${left}%`,
                  width: `${width}%`,
                  height: isHovered ? 40 : (isInProgress ? 34 : 28),
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: isCompleted ? color.bg : (isInProgress ? color.bg : 'transparent'),
                  border: isCompleted ? 'none' : `2px solid ${color.bg}`,
                  borderRadius: 6,
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  opacity: isCompleted ? 0.7 : (isInProgress ? 1 : 0.8),
                  boxShadow: isInProgress ? `0 0 0 3px ${color.soft}, 0 4px 12px ${color.soft}` : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: width > 10 ? 'center' : 'flex-start',
                  paddingLeft: width > 10 ? 0 : 4,
                  overflow: 'hidden',
                }}
                title={`${block.title} (${block.startTime} - ${block.endTime})`}
              >
                {width > 12 && (
                  <span style={{
                    fontSize: 11,
                    color: isCompleted ? 'rgba(255,255,255,0.9)' : color.bg,
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    padding: '0 6px',
                  }}>
                    {block.title}
                  </span>
                )}
                {isInProgress && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: 6, height: 6,
                    borderRadius: '50%',
                    background: '#fff',
                    animation: 'breathe 2s ease-in-out infinite',
                  }} />
                )}
              </div>
            );
          })}

          {/* 当前时间光标 —— 呼吸光标 */}
          <div style={{
            position: 'absolute',
            left: `${timeToPercent('15:45')}%`,
            top: -2,
            bottom: -2,
            width: 2,
            background: '#2B2A26',
            borderRadius: 1,
            zIndex: 10,
            animation: 'breathe 3s ease-in-out infinite',
          }}>
            <div style={{
              position: 'absolute',
              top: -4,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 8, height: 8,
              borderRadius: '50%',
              background: '#2B2A26',
            }} />
          </div>
        </div>
      </div>

      {/* 统计行 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: density === 'compact' ? 8 : 12,
        paddingTop: density === 'compact' ? 4 : 8,
        borderTop: '1px solid rgba(43, 42, 38, 0.05)',
      }}>
        {Object.entries(typeTotals).map(([type, minutes]) => {
          const color = TIME_BLOCK_COLORS[type];
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          const labelMap = { focus: '深度专注', social: '社交连接', life: '生活体验', rest: '休息恢复' };

          return (
            <div key={type} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: color.bg }} />
                <span style={{ fontSize: 11, color: '#6B6960' }}>{labelMap[type]}</span>
              </div>
              <span style={{
                fontSize: density === 'compact' ? 16 : 18,
                fontWeight: 500,
                color: '#2B2A26',
                fontFamily: "'Noto Serif SC', serif",
                fontFeatureSettings: '"tnum"',
              }}>
                {hours}<span style={{ fontSize: 12, fontWeight: 400, color: '#9B998F' }}>时</span>{mins > 0 ? `${mins}<span style="font-size:12px;font-weight:400;color:#9B998F">分</span>` : ''}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}


// ==================== 笔记更新进度组件 ====================
function NotesProgressCard({ density }) {
  const maxCount = Math.max(...NOTES_STATS.weeklyActivity.map(d => d.count));

  const cardStyle = {
    background: '#FBF9F3',
    border: '1px solid rgba(43, 42, 38, 0.06)',
    borderRadius: density === 'compact' ? 8 : 12,
    padding: density === 'compact' ? '16px 20px' : '24px 28px',
    display: 'flex',
    flexDirection: 'column',
    gap: density === 'compact' ? 12 : 18,
  };

  return (
    <div className="card-hover" style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon.Notes style={{ color: '#2B2A26', opacity: 0.6 }} />
          <h3 style={{ fontSize: 15, fontWeight: 500, color: '#2B2A26', fontFamily: "'Noto Serif SC', serif" }}>
            笔记更新
          </h3>
        </div>
        <span style={{ fontSize: 11, color: '#9B998F', fontFamily: "'JetBrains Mono', monospace" }}>
          连续 {NOTES_STATS.streakDays} 天
        </span>
      </div>

      {/* 核心数字 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: density === 'compact' ? 8 : 16,
      }}>
        <StatNumber label="今日新增" value={NOTES_STATS.todayNew} accent />
        <StatNumber label="今日编辑" value={NOTES_STATS.todayEdited} />
        <StatNumber label="知识总量" value={NOTES_STATS.totalNotes} />
      </div>

      {/* 7天活跃度趋势 */}
      <div>
        <div style={{ fontSize: 11, color: '#6B6960', marginBottom: 8 }}>近 7 天思考活跃度</div>
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 6,
          height: density === 'compact' ? 50 : 64,
        }}>
          {NOTES_STATS.weeklyActivity.map((d, i) => {
            const isToday = i === NOTES_STATS.weeklyActivity.length - 1;
            const heightPercent = (d.count / maxCount) * 100;
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: '100%',
                  height: `${heightPercent}%`,
                  minHeight: 4,
                  background: isToday ? '#3D4A6B' : '#D9D5C8',
                  borderRadius: 3,
                  transition: 'background 0.2s ease',
                  position: 'relative',
                  cursor: 'pointer',
                }}
                title={`${d.day}: ${d.count} 条`}
                />
                <span style={{ fontSize: 10, color: isToday ? '#3D4A6B' : '#9B998F', fontWeight: isToday ? 500 : 400 }}>
                  {d.day.replace('周', '')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 最近笔记 */}
      <div style={{ borderTop: '1px solid rgba(43, 42, 38, 0.05)', paddingTop: density === 'compact' ? 8 : 12 }}>
        <div style={{ fontSize: 11, color: '#6B6960', marginBottom: 8 }}>今日动态</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {NOTES_STATS.recentNotes.slice(0, density === 'compact' ? 3 : 4).map(note => (
            <div key={note.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '6px 8px',
              borderRadius: 6,
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
            className="card-hover"
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(43, 42, 38, 0.03)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{
                fontSize: 9,
                fontWeight: 500,
                padding: '2px 6px',
                borderRadius: 4,
                background: note.type === 'new' ? 'rgba(90, 122, 78, 0.12)' : 'rgba(61, 74, 107, 0.1)',
                color: note.type === 'new' ? '#5A7A4E' : '#3D4A6B',
                fontFamily: "'JetBrains Mono', monospace",
                textTransform: 'uppercase',
                flexShrink: 0,
              }}>
                {note.type === 'new' ? 'NEW' : 'EDIT'}
              </span>
              <span style={{
                fontSize: 13,
                color: '#2B2A26',
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {note.title}
              </span>
              <span style={{
                fontSize: 10,
                color: '#9B998F',
                fontFamily: "'JetBrains Mono', monospace",
                flexShrink: 0,
              }}>
                {note.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatNumber({ label, value, accent }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{
        fontSize: 28,
        fontWeight: 500,
        fontFamily: "'Noto Serif SC', serif",
        color: accent ? '#3D4A6B' : '#2B2A26',
        fontFeatureSettings: '"tnum"',
        lineHeight: 1,
      }}>
        {value}
      </span>
      <span style={{ fontSize: 11, color: '#6B6960' }}>{label}</span>
    </div>
  );
}


// ==================== 知识升维统计组件 ====================
function KnowledgeLadderCard({ density }) {
  const [hoveredLayer, setHoveredLayer] = React.useState(null);

  const cardStyle = {
    background: '#FBF9F3',
    border: '1px solid rgba(43, 42, 38, 0.06)',
    borderRadius: density === 'compact' ? 8 : 12,
    padding: density === 'compact' ? '16px 20px' : '24px 28px',
    display: 'flex',
    flexDirection: 'column',
    gap: density === 'compact' ? 12 : 18,
  };

  const iconMap = { source: Icon.Source, card: Icon.Card, summary: Icon.Summary, meta: Icon.Meta };

  // 漏斗宽度递减
  const layerWidths = [100, 72, 44, 24]; // 百分比

  return (
    <div className="card-hover" style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon.Meta style={{ color: '#2B2A26', opacity: 0.6 }} />
          <h3 style={{ fontSize: 15, fontWeight: 500, color: '#2B2A26', fontFamily: "'Noto Serif SC', serif" }}>
            知识升维
          </h3>
        </div>
        <span style={{ fontSize: 11, color: '#9B998F' }}>四层内化模型</span>
      </div>

      {/* 漏斗图 */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        padding: density === 'compact' ? '8px 0' : '12px 0',
      }}>
        {KNOWLEDGE_LAYERS.map((layer, i) => {
          const IconComp = iconMap[layer.icon];
          const isHovered = hoveredLayer === layer.id;
          const widths = ['100%', '74%', '48%', '28%'];

          return (
            <div key={layer.id} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <div
                onMouseEnter={() => setHoveredLayer(layer.id)}
                onMouseLeave={() => setHoveredLayer(null)}
                style={{
                  width: widths[i],
                  background: isHovered
                    ? `linear-gradient(135deg, ${['#3D4A6B', '#5A6B8A', '#7A8BA8', '#9BAAC4'][i]} 0%, ${['#2A3450', '#3D4A6B', '#5A6B8A', '#7A8BA8'][i]} 100%)`
                    : `linear-gradient(135deg, ${['#E8EAF0', '#DDE0E8', '#D2D6E0', '#C7CCD8'][i]} 0%, ${['#DDE0E8', '#D2D6E0', '#C7CCD8', '#BCC2D0'][i]} 100%)`,
                  borderRadius: density === 'compact' ? 6 : 8,
                  padding: density === 'compact' ? '10px 16px' : '14px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: isHovered ? '0 4px 16px rgba(61, 74, 107, 0.15)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32,
                    borderRadius: 6,
                    background: isHovered ? 'rgba(255,255,255,0.2)' : 'rgba(61, 74, 107, 0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isHovered ? '#fff' : '#3D4A6B',
                  }}>
                    <IconComp />
                  </div>
                  <div>
                    <div style={{
                      fontSize: density === 'compact' ? 13 : 14,
                      fontWeight: 500,
                      color: isHovered ? '#fff' : '#2B2A26',
                      fontFamily: "'Noto Serif SC', serif",
                    }}>
                      {layer.name}
                    </div>
                    <div style={{
                      fontSize: 11,
                      color: isHovered ? 'rgba(255,255,255,0.7)' : '#6B6960',
                    }}>
                      {layer.description}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{
                    fontSize: density === 'compact' ? 18 : 22,
                    fontWeight: 500,
                    fontFamily: "'Noto Serif SC', serif",
                    color: isHovered ? '#fff' : '#2B2A26',
                    fontFeatureSettings: '"tnum"',
                    lineHeight: 1,
                  }}>
                    {layer.count}
                  </div>
                  <div style={{
                    fontSize: 10,
                    color: isHovered ? 'rgba(255,255,255,0.6)' : '#9B998F',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    {layer.percent}%
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 升维提示 */}
      <div style={{
        padding: density === 'compact' ? '8px 12px' : '10px 14px',
        background: 'rgba(201, 162, 63, 0.08)',
        borderRadius: 8,
        borderLeft: '2px solid #C9A23F',
        fontSize: 12,
        color: '#6B6960',
        lineHeight: 1.6,
      }}>
        从原文到元知识，是大脑 <span style={{ color: '#9C7B2A', fontWeight: 500 }}>记忆—内化—抽象</span> 的过程模拟。每一层升维，都是一次认知跃迁。
      </div>
    </div>
  );
}


// ==================== 核心思考目标组件 ====================
function ThinkingGoalsCard({ density, onGoalClick }) {
  const [expandedId, setExpandedId] = React.useState(null);

  const cardStyle = {
    background: '#FBF9F3',
    border: '1px solid rgba(43, 42, 38, 0.06)',
    borderRadius: density === 'compact' ? 8 : 12,
    padding: density === 'compact' ? '16px 20px' : '24px 28px',
    display: 'flex',
    flexDirection: 'column',
    gap: density === 'compact' ? 12 : 16,
    gridColumn: '1 / -1',
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="card-hover" style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon.Focus style={{ color: '#2B2A26', opacity: 0.6 }} />
          <h3 style={{ fontSize: 15, fontWeight: 500, color: '#2B2A26', fontFamily: "'Noto Serif SC', serif" }}>
            近期核心思考
          </h3>
        </div>
        <span style={{ fontSize: 11, color: '#9B998F' }}>{THINKING_GOALS.length} 个进行中</span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: density === 'compact' ? 10 : 16,
      }}>
        {THINKING_GOALS.map(goal => {
          const isExpanded = expandedId === goal.id;
          return (
            <div
              key={goal.id}
              onClick={() => toggleExpand(goal.id)}
              style={{
                background: '#fff',
                border: isExpanded
                  ? '1px solid rgba(61, 74, 107, 0.3)'
                  : '1px solid rgba(43, 42, 38, 0.06)',
                borderRadius: density === 'compact' ? 8 : 10,
                padding: density === 'compact' ? '12px 16px' : '18px 22px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                display: 'flex',
                flexDirection: 'column',
                gap: density === 'compact' ? 8 : 12,
                boxShadow: isExpanded ? '0 8px 24px rgba(61, 74, 107, 0.08)' : 'none',
              }}
              className="card-hover"
            >
              {/* 标题行 */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <h4 style={{
                  fontSize: density === 'compact' ? 14 : 15,
                  fontWeight: 500,
                  color: '#2B2A26',
                  fontFamily: "'Noto Serif SC', serif",
                  lineHeight: 1.4,
                }}>
                  {goal.title}
                </h4>
                <Icon.ChevronDown style={{
                  color: '#9B998F',
                  flexShrink: 0,
                  marginTop: 4,
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease',
                }} />
              </div>

              {/* 描述 */}
              <p style={{
                fontSize: 12,
                color: '#6B6960',
                lineHeight: 1.6,
                display: isExpanded ? 'none' : '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
                {goal.description}
              </p>

              {/* 进度条 */}
              <div>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: 6,
                }}>
                  <span style={{ fontSize: 11, color: '#6B6960' }}>进展</span>
                  <span style={{
                    fontSize: 11, color: '#3D4A6B', fontWeight: 500,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    {goal.progress}%
                  </span>
                </div>
                <div style={{
                  height: 4,
                  background: '#EDE9DD',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${goal.progress}%`,
                    background: 'linear-gradient(90deg, #3D4A6B 0%, #5A6B8A 100%)',
                    borderRadius: 2,
                    transition: 'width 0.5s ease',
                  }} />
                </div>
              </div>

              {/* 标签 */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {goal.tags.slice(0, isExpanded ? 3 : 2).map((tag, i) => (
                  <span key={i} style={{
                    fontSize: 10,
                    padding: '2px 8px',
                    background: 'rgba(61, 74, 107, 0.06)',
                    color: '#3D4A6B',
                    borderRadius: 4,
                  }}>
                    {tag}
                  </span>
                ))}
              </div>

              {/* 展开内容 */}
              {isExpanded && (
                <div style={{
                  animation: 'fadeInUp 0.3s ease both',
                  borderTop: '1px solid rgba(43, 42, 38, 0.06)',
                  paddingTop: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}>
                  {/* 阶段列表 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {goal.details.phases.map((phase, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 16, height: 16,
                          borderRadius: '50%',
                          border: `2px solid ${phase.done ? '#5A7A4E' : '#D9D5C8'}`,
                          background: phase.done ? '#5A7A4E' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          {phase.done && <Icon.Check style={{ color: '#fff', width: 10, height: 10 }} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: 12,
                            fontWeight: phase.done ? 500 : 400,
                            color: phase.done ? '#2B2A26' : '#6B6960',
                          }}>
                            {phase.name}
                          </div>
                          <div style={{ fontSize: 11, color: '#9B998F' }}>
                            {phase.desc}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 洞察 */}
                  <div style={{
                    padding: '10px 12px',
                    background: 'rgba(201, 162, 63, 0.06)',
                    borderRadius: 6,
                    borderLeft: '2px solid #C9A23F',
                  }}>
                    <div style={{ fontSize: 11, color: '#9C7B2A', fontWeight: 500, marginBottom: 4 }}>当前洞察</div>
                    <p style={{ fontSize: 12, color: '#6B6960', lineHeight: 1.6 }}>
                      {goal.details.insight}
                    </p>
                  </div>

                  {/* 底部操作 */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: '#9B998F' }}>
                      {goal.relatedNotes} 篇关联笔记
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); onGoalClick && onGoalClick(goal); }}
                      style={{
                        fontSize: 12,
                        color: '#3D4A6B',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '4px 8px',
                        borderRadius: 4,
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(61, 74, 107, 0.08)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      进入话题 <Icon.ArrowRight />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, {
  Icon,
  TimeBlocksCard,
  NotesProgressCard,
  KnowledgeLadderCard,
  ThinkingGoalsCard,
});
