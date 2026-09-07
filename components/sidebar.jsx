// ============================================
// Sidebar — 年轻化明亮版
// 白色玻璃拟态 + 圆润胶囊导航 + 三组导航
// ============================================

const Icon = window.Icon || {};

function Sidebar({ activeNav, onNavChange, onOpenSettings, density, isNight }) {
  const t = DESIGN_TOKENS;
  const [collapsedGroups, setCollapsedGroups] = React.useState({});

  const iconMap = {
    dashboard: Icon.Dashboard,
    editor: Icon.Editor,
    calendar: Icon.Calendar,
    graph: Icon.Graph,
    elevation: Icon.Notes,
    ai: Icon.AI,
    social: Icon.Social,
    nodes: Icon.Nodes,
    voice: Icon.Voice,
    circles: Icon.Circles,
    review: Icon.Review,
    settings: Icon.Settings,
  };

  // 各导航项的主题色
  const navColors = {
    dashboard: { from: '#9B8EF7', to: '#5B4FE0' },
    editor: { from: '#6BE3DC', to: '#3DB8B0' },
    calendar: { from: '#8DDA97', to: '#4CAF50' },
    graph: { from: '#D1C4E9', to: '#9575CD' },
    elevation: { from: '#FFE66D', to: '#FFC107' },
    ai: { from: '#9B8EF7', to: '#5B4FE0' },
    social: { from: '#FAD0DF', to: '#F48FB1' },
    nodes: { from: '#FFB894', to: '#FF8C5A' },
    voice: { from: '#FAD0DF', to: '#F48FB1' },
    circles: { from: '#6BE3DC', to: '#3DB8B0' },
  };

  const toggleGroup = (gid) => {
    setCollapsedGroups({ ...collapsedGroups, [gid]: !collapsedGroups[gid] });
  };

  const activeColor = navColors[activeNav] || navColors.dashboard;

  return (
    <div style={{
      width: 240,
      flexShrink: 0,
      background: 'rgba(255, 255, 255, 0.65)',
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      borderRight: '1px solid rgba(255, 255, 255, 0.9)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
      transition: t.transition.base,
      boxShadow: '4px 0 24px rgba(45, 55, 72, 0.04)',
    }}>
      {/* Logo 区 */}
      <div style={{
        padding: '24px 20px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        borderBottom: '1px solid rgba(45, 55, 72, 0.06)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* 装饰气泡 */}
        <div className="deco-3d delay-1" style={{
          top: -10, right: 10, width: 40, height: 40,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.8), rgba(124, 111, 240, 0.25))',
          border: '2px solid rgba(255, 255, 255, 0.7)',
        }} />

        <div style={{
          width: 42, height: 42,
          borderRadius: 14,
          background: t.gradients.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 20px rgba(124, 111, 240, 0.35), inset 0 1px 0 rgba(255,255,255,0.4)',
          flexShrink: 0,
          position: 'relative',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" />
          </svg>
        </div>
        <div>
          <div style={{
            fontSize: 18,
            fontWeight: 800,
            color: t.colors.textPrimary,
            fontFamily: t.fonts.display,
            marginBottom: 2,
            lineHeight: 1.2,
            letterSpacing: -0.5,
          }}>
            OneOS
          </div>
          <div style={{
            fontSize: 10,
            color: t.colors.textTertiary,
            fontFamily: t.fonts.rounded,
            fontWeight: 600,
            letterSpacing: 0.3,
          }}>
            Core · v2.0
          </div>
        </div>
      </div>

      {/* 导航列表 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '8px 0 16px',
      }}>
        {NAV_GROUPS.map(group => {
          const items = NAV_ITEMS.filter(item => group.items.includes(item.id));
          if (items.length === 0) return null;
          const collapsed = collapsedGroups[group.id];

          return (
            <div key={group.id}>
              {/* 分组标题 */}
              <button
                onClick={() => toggleGroup(group.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '14px 20px 6px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <svg
                  width="10" height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    color: t.colors.textTertiary,
                    transition: t.transition.fast,
                    transform: collapsed ? 'rotate(-90deg)' : 'rotate(0)',
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
                <span style={{
                  fontSize: 10,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: 1.5,
                  color: t.colors.textTertiary,
                  fontFamily: t.fonts.rounded,
                }}>
                  {group.label}
                </span>
                <span style={{
                  fontSize: 10,
                  color: t.colors.textTertiary,
                  opacity: 0.5,
                  marginLeft: 'auto',
                  fontFamily: t.fonts.rounded,
                  fontWeight: 600,
                }}>
                  {group.desc}
                </span>
              </button>

              {/* 分组内的导航项 */}
              {!collapsed && (
                <div style={{
                  padding: '4px 12px',
                  animation: 'fadeIn 200ms ease both',
                }}>
                  {items.map(item => {
                    const IconComp = iconMap[item.icon];
                    const isActive = activeNav === item.id;
                    const isDisabled = item.disabled;
                    const colors = navColors[item.id] || navColors.dashboard;

                    return (
                      <button
                        key={item.id}
                        data-nav-id={item.id}
                        onClick={() => !isDisabled && onNavChange(item.id)}
                        disabled={isDisabled}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '11px 14px',
                          marginBottom: 4,
                          borderRadius: '16px',
                          border: 'none',
                          background: isActive
                            ? `linear-gradient(135deg, ${colors.from}22, ${colors.to}14)`
                            : 'transparent',
                          color: isActive ? t.colors.textPrimary : t.colors.textSecondary,
                          fontSize: 13,
                          fontFamily: t.fonts.rounded,
                          fontWeight: isActive ? 700 : 600,
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                          opacity: isDisabled ? 0.4 : 1,
                          transition: 'all 250ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                          position: 'relative',
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive && !isDisabled) {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.7)';
                            e.currentTarget.style.color = t.colors.textPrimary;
                            e.currentTarget.style.transform = 'translateX(3px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive && !isDisabled) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = t.colors.textSecondary;
                            e.currentTarget.style.transform = 'translateX(0)';
                          }
                        }}
                      >
                        {/* 左侧彩色圆点（激活时） */}
                        {isActive && (
                          <div style={{
                            position: 'absolute',
                            left: 2,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: 5,
                            height: 22,
                            borderRadius: '5px',
                            background: `linear-gradient(180deg, ${colors.from}, ${colors.to})`,
                            boxShadow: `0 0 8px ${colors.to}80`,
                          }} />
                        )}

                        <div style={{
                          width: 28, height: 28,
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          background: isActive
                            ? `linear-gradient(135deg, ${colors.from}, ${colors.to})`
                            : 'rgba(45, 55, 72, 0.06)',
                          color: isActive ? '#fff' : t.colors.textSecondary,
                          boxShadow: isActive
                            ? `0 4px 12px ${colors.to}40`
                            : 'none',
                          transition: 'all 250ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                        }}>
                          {IconComp && <IconComp width="16" height="16" />}
                        </div>

                        <span style={{ flex: 1, textAlign: 'left' }}>
                          {item.label}
                        </span>

                        {/* 待建标签 */}
                        {isDisabled && (
                          <span style={{
                            fontSize: 9,
                            padding: '2px 8px',
                            borderRadius: '999px',
                            background: 'rgba(45, 55, 72, 0.08)',
                            color: t.colors.textTertiary,
                            fontFamily: t.fonts.rounded,
                            fontWeight: 700,
                          }}>
                            待建
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 底部：设置 + 用户 */}
      <div style={{
        padding: '12px 14px 14px',
        borderTop: '1px solid rgba(45, 55, 72, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        background: 'rgba(255, 255, 255, 0.5)',
      }}>
        <button
          onClick={onOpenSettings}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 12px',
            borderRadius: '14px',
            border: 'none',
            background: 'transparent',
            color: t.colors.textSecondary,
            fontSize: 13,
            fontFamily: t.fonts.rounded,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
            e.currentTarget.style.color = t.colors.textPrimary;
            e.currentTarget.style.transform = 'translateX(3px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = t.colors.textSecondary;
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          {iconMap.settings && <Icon.Settings width="18" height="18" />}
          <span>设置</span>
          <kbd style={{
            marginLeft: 'auto',
            padding: '2px 6px',
            borderRadius: '6px',
            background: 'rgba(45, 55, 72, 0.06)',
            fontFamily: t.fonts.mono,
            fontSize: 10,
            color: t.colors.textTertiary,
            fontWeight: 600,
          }}>,</kbd>
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 12px',
          borderRadius: '16px',
          background: 'rgba(255, 255, 255, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.9)',
          boxShadow: '0 2px 8px rgba(45, 55, 72, 0.04)',
        }}>
          <div style={{
            width: 34, height: 34,
            borderRadius: '50%',
            background: t.gradients.orange,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 13,
            fontWeight: 700,
            fontFamily: t.fonts.display,
            flexShrink: 0,
            boxShadow: '0 3px 8px rgba(255, 140, 90, 0.3), inset 0 1px 0 rgba(255,255,255,0.4)',
          }}>
            马
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 12,
              fontWeight: 700,
              color: t.colors.textPrimary,
              fontFamily: t.fonts.rounded,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              马行远
            </div>
            <div style={{
              fontSize: 10,
              color: t.colors.textTertiary,
              fontFamily: t.fonts.rounded,
              fontWeight: 600,
            }}>
              个人知识 · 第287天
            </div>
          </div>
          {/* 小装饰点 */}
          <div style={{
            width: 8, height: 8,
            borderRadius: '50%',
            background: t.gradients.green,
            boxShadow: '0 0 6px rgba(107, 203, 119, 0.5)',
          }} />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Sidebar });
