// ============================================
// Dashboard — 年轻化明亮版
// 渐变卡片 + 3D 装饰 + 今日生活仪表盘
// ============================================

function DashboardView({ density, onNavChange, textColor, subTextColor }) {
  const dt = DESIGN_TOKENS;

  // 响应式：检测移动端
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 从全局状态订阅仪表盘数据
  const dashState = useAppState(state => state.dashboard);

  const statCards = [
    {
      label: '今日笔记',
      value: dashState?.todayNotes ?? 8,
      unit: '篇',
      delta: '+1',
      gradient: dt.gradients.primary,
      icon: '✎',
      tip: '今天写下的笔记数。记录思考是第一步。',
      nav: 'editor',
      bgGradient: 'linear-gradient(135deg, rgba(155,142,247,0.15), rgba(91,79,224,0.05))',
    },
    {
      label: '待整理',
      value: 5,
      unit: '篇',
      delta: '',
      gradient: dt.gradients.orange,
      icon: '◇',
      tip: '阅读次数达标的笔记，建议提炼为卡片。',
      nav: 'elevation',
      bgGradient: 'linear-gradient(135deg, rgba(255,184,148,0.2), rgba(255,140,90,0.06))',
    },
    {
      label: '今日升维',
      value: dashState?.elevatedToday ?? 1,
      unit: '次',
      delta: dashState?.elevatedToday > 0 ? '活跃中' : '',
      gradient: dt.gradients.green,
      icon: '▲',
      tip: '今日完成升维的笔记数。知识正在内化。',
      nav: 'elevation',
      bgGradient: 'linear-gradient(135deg, rgba(141,218,151,0.2), rgba(76,175,80,0.06))',
    },
    {
      label: '知识沉淀',
      value: dashState?.knowledgeCount ?? 24,
      unit: '篇',
      delta: '+1',
      gradient: dt.gradients.teal,
      icon: '◎',
      tip: 'AI对话与圈子归档沉淀的知识。',
      nav: 'graph',
      bgGradient: 'linear-gradient(135deg, rgba(107,227,220,0.2), rgba(61,184,176,0.06))',
    },
  ];

  const todayItems = [
    { time: '07:30', label: '晨间深度专注', title: '阅读《存在与时间》第一篇', type: 'focus', duration: '120分钟', color: '#7C6FF0' },
    { time: '10:00', label: '写作', title: '知识升维方法论', type: 'focus', duration: '120分钟', color: '#4ECDC4' },
    { time: '13:30', label: '深度对话', title: '与何思齐讨论人类节点系统', type: 'social', duration: '60分钟', color: '#FFA07A' },
    { time: '15:00', label: '升维', title: '提炼「注意力残留」笔记为卡片', type: 'elevation', duration: '45分钟', color: '#6BCB77' },
  ];

  const goals = [
    { title: '海德格尔存在论研读', progress: 45, gradient: dt.gradients.teal, level: 1 },
    { title: 'OneOS 产品哲学体系', progress: 70, gradient: dt.gradients.primary, level: 2 },
    { title: '书法习字 · 兰亭序', progress: 30, gradient: dt.gradients.gold, level: 1 },
  ];

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      padding: isMobile ? '16px 16px 24px' : '28px 32px 40px',
      animation: 'pageEnter 500ms cubic-bezier(0.2, 0.8, 0.2, 1) both',
      position: 'relative',
    }}>
      {/* 3D 装饰元素（背景层） */}
      <div style={{
        position: 'absolute',
        top: 40, right: 60,
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.6,
      }}>
        {/* 3D 球体 */}
        <div className="deco-3d delay-1" style={{
          width: 80, height: 80,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 25%, #fff, #B39DDB 35%, #7E57C2 100%)',
          boxShadow: '0 12px 32px rgba(126, 87, 194, 0.3), inset -6px -10px 20px rgba(0,0,0,0.12), inset 4px 6px 12px rgba(255,255,255,0.5)',
        }} />
      </div>
      <div style={{
        position: 'absolute',
        top: 120, right: 30,
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.5,
      }}>
        <div className="deco-3d delay-2" style={{
          width: 44, height: 44,
          borderRadius: '14px',
          background: dt.gradients.orange,
          boxShadow: '0 8px 20px rgba(255, 140, 90, 0.3), inset -3px -6px 12px rgba(0,0,0,0.1), inset 3px 3px 6px rgba(255,255,255,0.4)',
          transform: 'rotate(15deg)',
        }} />
      </div>

      {/* 今日起点 - 紫色渐变大卡片 */}
      <div style={{
        padding: isMobile ? '20px' : '32px 36px',
        borderRadius: isMobile ? 20 : 28,
        background: dt.gradients.primary,
        marginBottom: isMobile ? 16 : 24,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 16px 48px rgba(124, 111, 240, 0.25)',
      }}>
        {/* 装饰：3D 小机器人/光斑 */}
        <div style={{
          position: 'absolute',
          top: -60, right: -30,
          width: 260, height: 260,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: -50, left: 30,
          width: 180, height: 180,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(78,205,196,0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div className="deco-3d delay-3" style={{
          position: 'absolute',
          bottom: 20, right: 40,
          width: 70, height: 70,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 25%, #fff, #6BE3DC 35%, #3DB8B0 100%)',
          boxShadow: '0 8px 24px rgba(61, 184, 176, 0.4), inset -4px -6px 14px rgba(0,0,0,0.1), inset 3px 4px 8px rgba(255,255,255,0.5)',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 560 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 14px',
            borderRadius: '999px',
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            marginBottom: 14,
            fontSize: 11,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.95)',
            fontFamily: dt.fonts.rounded,
            letterSpacing: 0.5,
          }}>
            <span style={{
              width: 6, height: 6,
              borderRadius: '50%',
              background: '#fff',
              animation: 'breathe 2s ease-in-out infinite',
            }} />
            今日起点 · TODAY
          </div>

          <h2 style={{
            fontSize: isMobile ? 20 : 28,
            fontWeight: 800,
            fontFamily: dt.fonts.display,
            color: '#fff',
            marginBottom: 10,
            lineHeight: 1.35,
            letterSpacing: -0.5,
          }}>
            今天有 <span style={{ color: '#FFE66D' }}>{dashState?.todayNotes ?? 8}篇笔记</span> 待整理，<br />
            <span style={{ color: '#FFB894' }}>1个话题</span> 可以升维
          </h2>
          <p style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.8)',
            lineHeight: 1.7,
            marginBottom: 22,
            fontWeight: 500,
          }}>
            记录思考 → 整理知识 → 升维内化 → 连接同频的人。<br />
            选一个入口开始今天的思考吧。
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavChange('editor')}
              style={{
                padding: '12px 24px',
                borderRadius: '16px',
                border: 'none',
                background: '#fff',
                color: dt.colors.accentPrimaryDeep,
                fontSize: 14,
                fontWeight: 800,
                fontFamily: dt.fonts.rounded,
                cursor: 'pointer',
                transition: 'all 250ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.04)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
              }}
            >
              + 开始书写
            </button>
            <button
              onClick={() => onNavChange('elevation')}
              style={{
                padding: '12px 22px',
                borderRadius: '16px',
                border: '1.5px solid rgba(255,255,255,0.4)',
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 700,
                fontFamily: dt.fonts.rounded,
                cursor: 'pointer',
                transition: 'all 250ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                backdropFilter: 'blur(10px)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
              }}
            >
              整理待升维笔记
            </button>
            <button
              onClick={() => onNavChange('graph')}
              style={{
                padding: '12px 22px',
                borderRadius: '16px',
                border: '1.5px solid rgba(255,255,255,0.25)',
                background: 'rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.85)',
                fontSize: 13,
                fontWeight: 600,
                fontFamily: dt.fonts.rounded,
                cursor: 'pointer',
                transition: 'all 250ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
              }}
            >
              浏览知识图谱
            </button>
          </div>
        </div>
      </div>

      {/* 数据指标卡片 - 渐变风格 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: isMobile ? 10 : 18,
        marginBottom: isMobile ? 16 : 24,
        position: 'relative',
        zIndex: 1,
      }}>
        {statCards.map((card, i) => (
          <div
            key={card.label}
            onClick={() => onNavChange(card.nav)}
            style={{
              padding: isMobile ? '14px' : '22px',
              borderRadius: isMobile ? 16 : 24,
              background: card.bgGradient,
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              cursor: 'pointer',
              transition: 'all 350ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              position: 'relative',
              overflow: 'hidden',
              animation: `fadeInUp 500ms cubic-bezier(0.2, 0.8, 0.2, 1) both`,
              animationDelay: `${0.08 + i * 0.06}s`,
              boxShadow: '0 8px 24px rgba(45, 55, 72, 0.06)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px) scale(1.03)';
              e.currentTarget.style.boxShadow = '0 16px 40px rgba(45, 55, 72, 0.12)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(45, 55, 72, 0.06)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.8)';
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}>
              <div style={{
                width: 42, height: 42,
                borderRadius: '14px',
                background: card.gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 18,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)',
              }}>
                {card.icon}
              </div>
              {card.delta && (
                <span style={{
                  fontSize: 11,
                  padding: '3px 10px',
                  borderRadius: '999px',
                  background: 'rgba(107, 203, 119, 0.15)',
                  color: '#4CAF50',
                  fontFamily: dt.fonts.rounded,
                  fontWeight: 700,
                }}>
                  {card.delta}
                </span>
              )}
            </div>
            <div style={{
              fontSize: isMobile ? 24 : 36,
              fontWeight: 800,
              fontFamily: dt.fonts.display,
              background: card.gradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1,
              marginBottom: 6,
              letterSpacing: -1,
            }}>
              {card.value}
              <span style={{
                fontSize: 15,
                fontWeight: 700,
                color: dt.colors.textTertiary,
                marginLeft: 4,
                fontFamily: dt.fonts.rounded,
                WebkitTextFillColor: dt.colors.textTertiary,
              }}>
                {card.unit}
              </span>
            </div>
            <div style={{
              fontSize: 12,
              color: dt.colors.textSecondary,
              fontFamily: dt.fonts.rounded,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}>
              {card.label}
              <span
                className="concept-hint"
                title={card.tip}
              >
                ?
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 第二行：今日时间线 + 思考目标 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1.6fr 1fr',
        gap: isMobile ? 12 : 20,
        position: 'relative',
        zIndex: 1,
      }}>
        {/* 今日时间线 */}
        <div style={{
          padding: isMobile ? '18px' : '26px',
          borderRadius: isMobile ? 16 : 24,
          background: 'rgba(255, 255, 255, 0.72)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.9)',
          boxShadow: '0 8px 24px rgba(45, 55, 72, 0.06)',
          cursor: 'default',
          transition: 'all 300ms cubic-bezier(0.2, 0.8, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* 装饰：小气泡 */}
          <div className="deco-3d delay-1" style={{
            position: 'absolute',
            top: 20, right: 24,
            width: 32, height: 32,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9), rgba(124,111,240,0.2))',
            border: '2px solid rgba(255, 255, 255, 0.7)',
            opacity: 0.6,
          }} />

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}>
            <h3 style={{
              fontSize: 17,
              fontWeight: 800,
              fontFamily: dt.fonts.display,
              color: dt.colors.textPrimary,
              letterSpacing: -0.3,
            }}>
              今日时间线
            </h3>
            <button
              onClick={() => onNavChange('calendar')}
              style={{
                fontSize: 12,
                color: dt.colors.accentPrimary,
                background: 'rgba(124, 111, 240, 0.1)',
                padding: '6px 14px',
                borderRadius: '999px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: dt.fonts.rounded,
                fontWeight: 700,
                transition: 'all 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(3px)';
                e.currentTarget.style.background = 'rgba(124, 111, 240, 0.18)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.background = 'rgba(124, 111, 240, 0.1)';
              }}
            >
              查看日历 →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, position: 'relative' }}>
            {todayItems.map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
                padding: '10px 0',
                position: 'relative',
              }}>
                {/* 时间 */}
                <div style={{
                  width: 52,
                  flexShrink: 0,
                  fontFamily: dt.fonts.mono,
                  fontSize: 12,
                  color: dt.colors.textTertiary,
                  paddingTop: 4,
                  fontWeight: 600,
                }}>
                  {item.time}
                </div>

                {/* 节点 - 3D 风格 */}
                <div style={{
                  width: 12, height: 12,
                  borderRadius: '50%',
                  background: `radial-gradient(circle at 30% 30%, #fff, ${item.color})`,
                  marginTop: 4,
                  flexShrink: 0,
                  position: 'relative',
                  zIndex: 1,
                  boxShadow: `0 0 0 4px ${item.color}20, 0 2px 6px ${item.color}40`,
                }} />

                {/* 竖线 */}
                {i < todayItems.length - 1 && (
                  <div style={{
                    position: 'absolute',
                    left: 58,
                    top: 22,
                    bottom: -8,
                    width: 2,
                    borderRadius: 2,
                    background: 'linear-gradient(to bottom, ' + item.color + '40, rgba(45,55,72,0.08))',
                  }} />
                )}

                <div style={{ flex: 1, paddingBottom: 4 }}>
                  <div style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: dt.colors.textPrimary,
                    fontFamily: dt.fonts.rounded,
                    marginBottom: 3,
                  }}>
                    {item.title}
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: dt.colors.textTertiary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontWeight: 500,
                  }}>
                    <span style={{
                      padding: '2px 10px',
                      borderRadius: '999px',
                      background: `${item.color}15`,
                      color: item.color,
                      fontWeight: 700,
                      fontSize: 11,
                    }}>
                      {item.label}
                    </span>
                    <span>{item.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 核心思考目标 */}
        <div style={{
          padding: isMobile ? '18px' : '26px',
          borderRadius: isMobile ? 16 : 24,
          background: 'rgba(255, 255, 255, 0.72)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.9)',
          boxShadow: '0 8px 24px rgba(45, 55, 72, 0.06)',
          cursor: 'default',
          transition: 'all 300ms cubic-bezier(0.2, 0.8, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* 装饰星星 */}
          <div className="deco-3d delay-2" style={{
            position: 'absolute',
            top: 16, right: 20,
            fontSize: 24,
            color: '#FFD93D',
            textShadow: '0 4px 12px rgba(255, 201, 7, 0.4)',
            filter: 'drop-shadow(0 2px 4px rgba(255, 201, 7, 0.3))',
          }}>
            ✦
          </div>

          <div style={{
            marginBottom: 20,
          }}>
            <h3 style={{
              fontSize: 17,
              fontWeight: 800,
              fontFamily: dt.fonts.display,
              color: dt.colors.textPrimary,
              letterSpacing: -0.3,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}>
              核心思考目标
              <span
                className="concept-hint"
                title="你正在深度推进的几个思考方向。知识升维会沿着这些方向积累。"
              >
                ?
              </span>
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {goals.map((goal, i) => (
              <div key={i} style={{
                padding: '14px',
                borderRadius: '16px',
                background: 'rgba(45, 55, 72, 0.02)',
                border: '1px solid rgba(45, 55, 72, 0.04)',
                transition: 'all 250ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(4px)';
                e.currentTarget.style.background = 'rgba(45, 55, 72, 0.04)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.background = 'rgba(45, 55, 72, 0.02)';
              }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}>
                  <span style={{
                    fontSize: 13,
                    color: dt.colors.textPrimary,
                    fontFamily: dt.fonts.rounded,
                    fontWeight: 700,
                  }}>
                    {goal.title}
                  </span>
                  <span style={{
                    fontSize: 12,
                    fontFamily: dt.fonts.display,
                    fontWeight: 800,
                    background: goal.gradient,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}>
                    {goal.progress}%
                  </span>
                </div>
                <div style={{
                  height: 8,
                  borderRadius: '999px',
                  background: 'rgba(45, 55, 72, 0.06)',
                  overflow: 'hidden',
                }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${goal.progress}%`,
                      borderRadius: '999px',
                      background: goal.gradient,
                      transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                      position: 'relative',
                    }}
                  >
                    {/* 进度条光泽 */}
                    <div style={{
                      position: 'absolute',
                      top: 0, left: 0, right: 0,
                      height: '50%',
                      background: 'rgba(255,255,255,0.3)',
                      borderRadius: '999px 999px 0 0',
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 20,
            paddingTop: 16,
            borderTop: '1px solid rgba(45, 55, 72, 0.06)',
          }}>
            <button
              onClick={() => onNavChange('elevation')}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '16px',
                border: 'none',
                background: dt.gradients.green,
                color: '#fff',
                fontSize: 13,
                fontWeight: 700,
                fontFamily: dt.fonts.rounded,
                cursor: 'pointer',
                transition: 'all 250ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                boxShadow: '0 4px 16px rgba(107, 203, 119, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(107, 203, 119, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(107, 203, 119, 0.3)';
              }}
            >
              进入知识升维 →
            </button>
          </div>
        </div>
      </div>

      {/* 底部哲言 */}
      <div style={{
        marginTop: 36,
        textAlign: 'center',
        fontSize: 13,
        color: dt.colors.textTertiary,
        fontFamily: dt.fonts.display,
        lineHeight: 1.8,
        fontWeight: 500,
        opacity: 0.7,
      }}>
        <p style={{ margin: 0, fontStyle: 'italic' }}>
          "真正的学习会改变你是谁，不只是你知道什么。"
        </p>
      </div>
    </div>
  );
}

Object.assign(window, { DashboardView });
