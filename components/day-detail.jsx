// ============================================
// 当日详情面板
// ============================================
function DayDetailPanel({
  dayData,
  scheme,
  density,
  isNight,
  textColor,
  subTextColor,
  onClose,
  onDocClick,
}) {
  if (!dayData) return null;

  const factorLabels = {
    knowledge: '知识沉淀',
    dialogue: '深度对话',
    elevation: '知识升维',
    connection: '新增连接',
  };

  const factorColors = {
    knowledge: scheme.levels[4],
    dialogue: '#B56B3A',
    elevation: '#5A7A4E',
    connection: '#9B6BA0',
  };

  const weekdayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const dateObj = new Date(dayData.date);
  const weekday = weekdayNames[dateObj.getDay()];

  // 文档类型分组
  const docsByType = {};
  dayData.docs.forEach(doc => {
    if (!docsByType[doc.type]) docsByType[doc.type] = [];
    docsByType[doc.type].push(doc);
  });

  const typeOrder = ['思考', '知识', '对话', '升维', '日记'];
  const typeColors = {
    '思考': '#3D4A6B',
    '知识': '#5A7A4E',
    '对话': '#B56B3A',
    '升维': '#9B6BA0',
    '日记': '#6B6960',
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: isNight ? 'rgba(0,0,0,0.3)' : 'rgba(43, 42, 38, 0.2)',
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
          width: 640,
          maxWidth: '90vw',
          maxHeight: '80vh',
          background: isNight ? '#2A2925' : '#FFFEFA',
          borderRadius: 16,
          border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.08)'}`,
          boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeInUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both',
        }}
      >
        {/* 头部 */}
        <div style={{
          padding: density === 'compact' ? '20px 24px' : '28px 32px',
          background: scheme.levels[dayData.intensity],
          color: dayData.intensity >= 3 ? '#fff' : textColor,
          position: 'relative',
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              width: 28, height: 28,
              borderRadius: '50%',
              border: 'none',
              background: dayData.intensity >= 3 ? 'rgba(255,255,255,0.15)' : 'rgba(43, 42, 38, 0.06)',
              color: dayData.intensity >= 3 ? '#fff' : subTextColor,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s ease',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div style={{
            fontSize: 13,
            opacity: 0.7,
            marginBottom: 6,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {weekday}
          </div>
          <h2 style={{
            fontSize: 28,
            fontWeight: 600,
            fontFamily: "'Noto Serif SC', serif",
            marginBottom: 8,
            lineHeight: 1.2,
          }}>
            {dateObj.getMonth() + 1} 月 {dateObj.getDate()} 日
          </h2>
          <div style={{
            fontSize: 13,
            opacity: 0.85,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}>
            <span>生命强度 · 等级 {dayData.intensity}</span>
            <span>{dayData.noteCount} 篇文档</span>
            <span>{Math.round(dayData.totalWords / 100) / 10}k 字</span>
          </div>
        </div>

        {/* 内容区 */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: density === 'compact' ? '16px 24px' : '24px 32px',
        }}>
          {/* 强度构成 */}
          <div style={{ marginBottom: 24 }}>
            <h4 style={{
              fontSize: 12,
              fontWeight: 600,
              color: subTextColor,
              marginBottom: 12,
              textTransform: 'uppercase',
              letterSpacing: 1,
              fontFamily: "'Noto Serif SC', serif",
            }}>
              强度构成
            </h4>

            {/* 堆叠条 */}
            <div style={{
              height: 8,
              borderRadius: 4,
              background: isNight ? 'rgba(255,255,255,0.05)' : 'rgba(43, 42, 38, 0.05)',
              display: 'flex',
              overflow: 'hidden',
              marginBottom: 12,
            }}>
              {Object.entries(dayData.factors).map(([key, val]) => (
                <div
                  key={key}
                  style={{
                    width: `${val}%`,
                    height: '100%',
                    background: factorColors[key],
                    transition: 'width 0.5s ease',
                  }}
                  title={`${factorLabels[key]} ${val}%`}
                />
              ))}
            </div>

            {/* 因子图例 */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {Object.entries(dayData.factors).map(([key, val]) => (
                <div key={key} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 12,
                  color: textColor,
                }}>
                  <div style={{
                    width: 8, height: 8,
                    borderRadius: 2,
                    background: factorColors[key],
                  }} />
                  <span style={{ color: subTextColor }}>{factorLabels[key]}</span>
                  <span style={{ fontWeight: 500, fontFamily: "'JetBrains Mono', monospace" }}>{val}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* 当日文档 */}
          <div>
            <h4 style={{
              fontSize: 12,
              fontWeight: 600,
              color: subTextColor,
              marginBottom: 12,
              textTransform: 'uppercase',
              letterSpacing: 1,
              fontFamily: "'Noto Serif SC', serif",
            }}>
              当日文档 · {dayData.noteCount} 篇
            </h4>

            {dayData.docs.length === 0 ? (
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                fontSize: 13,
                color: subTextColor,
              }}>
                这一天没有记录
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {dayData.docs.map(doc => (
                  <div
                    key={doc.id}
                    onClick={() => onDocClick && onDocClick(doc)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 8,
                      border: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
                      background: isNight ? 'rgba(255,255,255,0.02)' : 'rgba(43, 42, 38, 0.02)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = isNight
                        ? 'rgba(255,255,255,0.05)'
                        : 'rgba(43, 42, 38, 0.04)';
                      e.currentTarget.style.transform = 'translateX(2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isNight
                        ? 'rgba(255,255,255,0.02)'
                        : 'rgba(43, 42, 38, 0.02)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      marginBottom: 4,
                    }}>
                      <span style={{
                        fontSize: 10,
                        padding: '2px 6px',
                        borderRadius: 4,
                        background: `${typeColors[doc.type] || '#6B6960'}15`,
                        color: typeColors[doc.type] || '#6B6960',
                        fontWeight: 500,
                        fontFamily: "'JetBrains Mono', monospace",
                        flexShrink: 0,
                      }}>
                        {doc.typeLabel}
                      </span>
                      <span style={{
                        fontSize: 13,
                        fontWeight: 500,
                        fontFamily: "'Noto Serif SC', serif",
                        color: textColor,
                        flex: 1,
                      }}>
                        {doc.title}
                      </span>
                      <span style={{
                        fontSize: 11,
                        color: subTextColor,
                        fontFamily: "'JetBrains Mono', monospace",
                        flexShrink: 0,
                      }}>
                        {doc.time}
                      </span>
                    </div>
                    <div style={{
                      fontSize: 12,
                      color: subTextColor,
                      lineHeight: 1.5,
                      paddingLeft: 0,
                      opacity: 0.85,
                    }}>
                      {doc.excerpt}
                    </div>
                    {doc.tags.length > 0 && (
                      <div style={{
                        display: 'flex',
                        gap: 4,
                        marginTop: 6,
                      }}>
                        {doc.tags.map((tag, i) => (
                          <span key={i} style={{
                            fontSize: 10,
                            color: subTextColor,
                            opacity: 0.7,
                          }}>
                            #{tag}
                          </span>
                        ))}
                        <span style={{
                          marginLeft: 'auto',
                          fontSize: 10,
                          color: subTextColor,
                          fontFamily: "'JetBrains Mono', monospace",
                          opacity: 0.6,
                        }}>
                          {doc.wordCount} 字
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DayDetailPanel });
