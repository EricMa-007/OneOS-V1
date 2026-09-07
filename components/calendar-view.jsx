// ============================================
// 日历视图组件
// 月视图 / 周视图 / 年度热力图
// ============================================

function CalendarView({
  density,
  isNight,
  colorScheme,
  viewMode, // month | week | year
  currentYear,
  currentMonth,
  monthData,
  yearData,
  selectedDate,
  onSelectDate,
  onChangeMonth,
  onViewModeChange,
  onColorSchemeChange,
  textColor,
  subTextColor,
  themeBg,
  focusMode,
}) {
  const scheme = COLOR_SCHEMES[colorScheme];
  // 响应式
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
      background: themeBg,
      transition: 'background-color 0.3s ease',
      overflow: 'hidden',
      opacity: focusMode ? 0.1 : 1,
      pointerEvents: focusMode ? 'none' : 'auto',
    }}>
      {/* 顶部栏 */}
      <div style={{
        flexShrink: 0,
        padding: isMobile ? '12px 14px' : (density === 'compact' ? '16px 32px' : '24px 40px'),
        borderBottom: `1px solid ${isNight ? 'rgba(255,255,255,0.05)' : 'rgba(43, 42, 38, 0.05)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: isMobile ? 'wrap' : 'nowrap',
        gap: isMobile ? 8 : 0,
      }}>
        {/* 左侧：标题 + 月份导航 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <h1 style={{
              fontSize: isMobile ? 18 : (density === 'compact' ? 20 : 24),
              fontWeight: 500,
              fontFamily: "'Noto Serif SC', serif",
              color: textColor,
              lineHeight: 1.3,
            }}>
              {viewMode === 'year' ? `${currentYear} 年` : `${currentYear} 年 ${currentMonth} 月`}
            </h1>
            <div style={{ fontSize: 12, color: subTextColor }}>
              {viewMode === 'year' ? '年度思考热力图' : '生命强度日历'}
            </div>
          </div>

          {/* 月份切换按钮（仅月视图和周视图） */}
          {viewMode !== 'year' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                onClick={() => onChangeMonth(-1)}
                style={navBtnStyle(isNight)}
                title="上一月"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                onClick={() => onChangeMonth(0)}
                style={{
                  ...navBtnStyle(isNight),
                  fontSize: 12,
                  width: 'auto',
                  padding: '0 12px',
                  fontWeight: 500,
                }}
                title="回到今天"
              >
                今天
              </button>
              <button
                onClick={() => onChangeMonth(1)}
                style={navBtnStyle(isNight)}
                title="下一月"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* 右侧：视图切换 + 颜色方案 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* 颜色方案切换 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: subTextColor }}>色系</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {Object.entries(COLOR_SCHEMES).map(([key, scheme]) => (
                <button
                  key={key}
                  onClick={() => onColorSchemeChange(key)}
                  title={scheme.name}
                   style={{
                     width: 26,
                     height: 26,
                     borderRadius: '50%',
                     border: colorScheme === key
                       ? '2px solid #7C6FF0'
                       : '2px solid rgba(255, 255, 255, 0.8)',
                     background: `linear-gradient(135deg, ${scheme.levels[0]} 0%, ${scheme.levels[3]} 50%, ${scheme.levels[scheme.levels.length - 1]} 100%)`,
                     cursor: 'pointer',
                     transition: 'all 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                     padding: 0,
                     boxShadow: colorScheme === key ? '0 0 0 3px rgba(124, 111, 240, 0.15)' : '0 2px 6px rgba(45, 55, 72, 0.08)',
                   }}
                   onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
                   onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
              ))}
            </div>
          </div>

           {/* 视图切换 */}
           <div style={{
             display: 'flex',
             background: 'rgba(45, 55, 72, 0.05)',
             borderRadius: '14px',
             padding: 4,
             gap: 2,
           }}>
             {[
               { id: 'month', label: '月' },
               { id: 'week', label: '周' },
               { id: 'year', label: '年' },
             ].map(v => (
               <button
                 key={v.id}
                 onClick={() => onViewModeChange(v.id)}
                 style={{
                   padding: '7px 20px',
                   borderRadius: '12px',
                   border: 'none',
                   background: viewMode === v.id
                     ? 'linear-gradient(135deg, #9B8EF7, #7C6FF0)'
                     : 'transparent',
                   color: viewMode === v.id ? '#fff' : subTextColor,
                   fontSize: 12,
                   fontWeight: viewMode === v.id ? 700 : 600,
                   fontFamily: "'Nunito', sans-serif",
                   cursor: 'pointer',
                   boxShadow: viewMode === v.id ? '0 4px 12px rgba(124, 111, 240, 0.25)' : 'none',
                   transition: 'all 250ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transition: 'all 0.15s ease',
                  fontFamily: viewMode === v.id ? "'Noto Serif SC', serif" : 'inherit',
                }}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 主体：日历 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: isMobile ? 12 : (density === 'compact' ? '20px 32px' : '32px 40px'),
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 16 : (density === 'compact' ? 20 : 28),
        WebkitOverflowScrolling: 'touch',
      }}>
        {/* 日历主体 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {viewMode === 'month' && (
            <MonthView
              monthData={monthData}
              scheme={scheme}
              selectedDate={selectedDate}
              onSelectDate={onSelectDate}
              density={density}
              isNight={isNight}
              textColor={textColor}
              subTextColor={subTextColor}
            />
          )}
          {viewMode === 'week' && (
            <WeekView
              monthData={monthData}
              currentDate={selectedDate}
              scheme={scheme}
              onSelectDate={onSelectDate}
              density={density}
              isNight={isNight}
              textColor={textColor}
              subTextColor={subTextColor}
            />
          )}
          {viewMode === 'year' && (
            <YearHeatmap
              yearData={yearData}
              scheme={scheme}
              onSelectDate={onSelectDate}
              density={density}
              isNight={isNight}
              textColor={textColor}
              subTextColor={subTextColor}
            />
          )}
        </div>

        {/* 右侧统计侧栏 */}
        <CalendarSidebar
          monthData={monthData}
          yearData={yearData}
          viewMode={viewMode}
          scheme={scheme}
          density={density}
          isNight={isNight}
          textColor={textColor}
          subTextColor={subTextColor}
        />
      </div>
    </div>
  );
}

function navBtnStyle(isNight) {
  return {
    width: 32,
    height: 32,
    borderRadius: 6,
    border: `1px solid ${isNight ? 'rgba(255,255,255,0.08)' : 'rgba(43, 42, 38, 0.08)'}`,
    background: 'transparent',
    color: '#6B6960',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
  };
}

// ============================================
// 月视图
// ============================================
function MonthView({
  monthData, scheme, selectedDate, onSelectDate,
  density, isNight, textColor, subTextColor,
}) {
  // 计算月份第一天是周几，以及需要多少行
  const firstDay = new Date(monthData.year, monthData.month - 1, 1).getDay();
  const daysInMonth = monthData.days.length;
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : false;
  const cellSize = isMobile ? 48 : (density === 'compact' ? 72 : 90);

  // 构建单元格
  const cells = [];
  // 前面的空白
  for (let i = 0; i < firstDay; i++) {
    cells.push({ empty: true });
  }
  // 日期
  monthData.days.forEach(day => {
    cells.push({ day, empty: false });
  });
  // 后面的空白
  while (cells.length < totalCells) {
    cells.push({ empty: true });
  }

  // 每周一行
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <div style={{
      background: isNight ? 'rgba(255,255,255,0.02)' : '#FFFEFA',
      borderRadius: 12,
      border: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
      padding: isMobile ? 8 : (density === 'compact' ? 12 : 16),
      overflow: 'hidden',
    }}>
      {/* 星期标题 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: density === 'compact' ? 4 : 6,
        marginBottom: density === 'compact' ? 6 : 8,
      }}>
        {weekDays.map((d, i) => (
          <div key={i} style={{
            textAlign: 'center',
            fontSize: 11,
            color: subTextColor,
            padding: '6px 0',
            fontFamily: "'Noto Serif SC', serif",
            opacity: 0.7,
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* 日期网格 */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: density === 'compact' ? 4 : 6,
      }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: density === 'compact' ? 4 : 6,
          }}>
            {week.map((cell, ci) => {
              if (cell.empty) {
                return <div key={ci} />;
              }
              const day = cell.day;
              const isSelected = selectedDate === day.date;
              const bgColor = day.isFuture
                ? (isNight ? 'rgba(255,255,255,0.02)' : 'rgba(43, 42, 38, 0.02)')
                : scheme.levels[day.intensity];
              const textCol = day.isFuture
                ? (isNight ? 'rgba(255,255,255,0.2)' : 'rgba(43, 42, 38, 0.2)')
                : (day.intensity >= 4 ? '#fff' : textColor);

              return (
                <div
                  key={ci}
                  onClick={() => !day.isFuture && onSelectDate(day.date)}
                  style={{
                    height: cellSize,
                    borderRadius: isMobile ? 10 : 16,
                    background: day.isFuture
                      ? 'rgba(255, 255, 255, 0.4)'
                      : scheme.levels[day.intensity],
                    border: day.isToday
                      ? `2px solid ${scheme.levels[scheme.levels.length - 1]}`
                      : (isSelected
                        ? '2px solid #7C6FF0'
                        : '1px solid rgba(255, 255, 255, 0.6)'),
                    cursor: day.isFuture ? 'default' : 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: isMobile ? '4px 6px' : (density === 'compact' ? '6px 8px' : '8px 10px'),
                    transition: 'all 250ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                    boxSizing: 'border-box',
                    opacity: day.isFuture ? 0.5 : 1,
                    boxShadow: day.isToday
                      ? `0 0 0 4px ${scheme.levels[scheme.levels.length - 1]}25, 0 6px 16px rgba(45, 55, 72, 0.12)`
                      : (isSelected
                        ? '0 4px 12px rgba(124, 111, 240, 0.2)'
                        : '0 2px 6px rgba(45, 55, 72, 0.04)'),
                    backdropFilter: day.intensity === 0 ? 'blur(2px)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!day.isFuture) {
                      e.currentTarget.style.transform = 'translateY(-3px) scale(1.04)';
                      e.currentTarget.style.boxShadow = '0 12px 24px rgba(45, 55, 72, 0.12)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = day.isToday
                      ? `0 0 0 4px ${scheme.levels[scheme.levels.length - 1]}25, 0 6px 16px rgba(45, 55, 72, 0.12)`
                      : (isSelected
                        ? '0 4px 12px rgba(124, 111, 240, 0.2)'
                        : '0 2px 6px rgba(45, 55, 72, 0.04)');
                  }}
                >
                  {/* 日期数字 */}
                  <div style={{
                    fontSize: density === 'compact' ? 12 : 13,
                    fontWeight: day.isToday ? 800 : 600,
                    color: textCol,
                    fontFamily: "'Nunito', sans-serif",
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <span>{day.day}</span>
                    {day.isToday && (
                      <div style={{
                        width: 8, height: 8,
                        borderRadius: '50%',
                        background: textCol,
                        boxShadow: `0 0 6px ${textCol}`,
                      }} />
                    )}
                  </div>

                  {/* 文档数（仅非空日，且空间够时） */}
                  {day.intensity > 0 && !day.isFuture && density !== 'compact' && (
                    <div style={{ marginTop: 'auto' }}>
                      <div style={{
                        fontSize: 10,
                        color: day.intensity >= 4 ? 'rgba(255,255,255,0.8)' : 'rgba(43, 42, 38, 0.5)',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}>
                        {day.noteCount} 篇
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// 周视图
// ============================================
function WeekView({
  monthData, currentDate, scheme, onSelectDate,
  density, isNight, textColor, subTextColor,
}) {
  // 计算当前日期所在周
  const date = new Date(currentDate);
  const dayOfWeek = date.getDay();
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - dayOfWeek);

  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // 在当前月份数据中找到这一天
    let dayData = null;
    if (m === monthData.month && y === monthData.year) {
      dayData = monthData.days[day - 1];
    } else {
      dayData = generateDayData(y, m, day);
    }
    weekDays.push(dayData);
  }

  const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : false;

  return (
    <div style={{
      background: isNight ? 'rgba(255,255,255,0.02)' : '#FFFEFA',
      borderRadius: 12,
      border: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
      padding: isMobile ? 12 : (density === 'compact' ? 16 : 20),
      overflowX: isMobile ? 'auto' : 'visible',
      WebkitOverflowScrolling: 'touch',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: density === 'compact' ? 8 : 12,
        minWidth: isMobile ? 560 : 'auto',
      }}>
        {weekDays.map((day, i) => {
          const bgColor = day.isFuture
            ? (isNight ? 'rgba(255,255,255,0.02)' : 'rgba(43, 42, 38, 0.02)')
            : scheme.levels[day.intensity];
          const textCol = day.isFuture
            ? (isNight ? 'rgba(255,255,255,0.2)' : 'rgba(43, 42, 38, 0.2)')
            : (day.intensity >= 3 ? '#fff' : textColor);

          return (
            <div
              key={i}
              onClick={() => !day.isFuture && onSelectDate(day.date)}
              style={{
                borderRadius: 10,
                background: bgColor,
                border: day.isToday
                  ? `2px solid ${scheme.levels[5]}`
                  : '1px solid transparent',
                cursor: day.isFuture ? 'default' : 'pointer',
                padding: density === 'compact' ? '12px 10px' : '16px 12px',
                minHeight: 280,
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box',
              }}
              onMouseEnter={(e) => {
                if (!day.isFuture) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* 星期 + 日期 */}
              <div style={{
                textAlign: 'center',
                marginBottom: density === 'compact' ? 8 : 12,
              }}>
                <div style={{
                  fontSize: 11,
                  color: textCol,
                  opacity: 0.7,
                  marginBottom: 2,
                }}>
                  {dayNames[i]}
                </div>
                <div style={{
                  fontSize: 22,
                  fontWeight: day.isToday ? 600 : 500,
                  color: textCol,
                  fontFamily: "'Noto Serif SC', serif",
                }}>
                  {day.day}
                </div>
              </div>

              {/* 时间线中的文档 */}
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                overflow: 'hidden',
              }}>
                {day.docs.slice(0, 5).map(doc => (
                  <div key={doc.id} style={{
                    fontSize: 10,
                    padding: '4px 6px',
                    borderRadius: 4,
                    background: day.intensity >= 3
                      ? 'rgba(255,255,255,0.15)'
                      : 'rgba(43, 42, 38, 0.04)',
                    color: textCol,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    lineHeight: 1.3,
                  }}>
                    <span style={{
                      fontSize: 9,
                      opacity: 0.7,
                      marginRight: 4,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>
                      {doc.time}
                    </span>
                    {doc.title}
                  </div>
                ))}
                {day.docs.length > 5 && (
                  <div style={{
                    fontSize: 10,
                    color: textCol,
                    opacity: 0.6,
                    textAlign: 'center',
                    paddingTop: 4,
                  }}>
                    +{day.docs.length - 5} 更多
                  </div>
                )}
              </div>

              {/* 底部统计 */}
              {day.intensity > 0 && (
                <div style={{
                  marginTop: 'auto',
                  paddingTop: 8,
                  borderTop: `1px solid ${day.intensity >= 3 ? 'rgba(255,255,255,0.2)' : 'rgba(43, 42, 38, 0.1)'}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 10,
                  color: textCol,
                  opacity: 0.8,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  <span>{day.noteCount} 篇</span>
                  <span>{Math.round(day.totalWords / 100) / 10}k 字</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// 年度热力图
// ============================================
function YearHeatmap({
  yearData, scheme, onSelectDate,
  density, isNight, textColor, subTextColor,
}) {
  const weeks = [];
  // 从一年的第一天开始，按周排列
  const firstDay = new Date(yearData.year, 0, 1);
  const startDayOfWeek = firstDay.getDay();
  const totalDays = 365; // 简化，不处理闰年

  const allDays = [];
  // 第一周的前置空位
  for (let i = 0; i < startDayOfWeek; i++) {
    allDays.push(null);
  }
  yearData.allDays.forEach(d => allDays.push(d));
  // 末尾补全
  while (allDays.length % 7 !== 0) {
    allDays.push(null);
  }

  const totalWeeks = allDays.length / 7;
  const cellSize = density === 'compact' ? 12 : 14;
  const gap = 3;

  // 月份标签
  const monthLabels = [];
  let prevMonth = 0;
  for (let w = 0; w < totalWeeks; w++) {
    const firstCell = allDays[w * 7];
    if (firstCell && firstCell.month !== prevMonth) {
      monthLabels.push({ week: w, month: firstCell.month });
      prevMonth = firstCell.month;
    }
  }

  const weekDayLabels = ['', '一', '', '三', '', '五', ''];
  const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : false;

  return (
    <div style={{
      background: isNight ? 'rgba(255,255,255,0.02)' : '#FFFEFA',
      borderRadius: 12,
      border: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
      padding: isMobile ? 12 : (density === 'compact' ? 20 : 28),
      overflowX: 'auto',
      WebkitOverflowScrolling: 'touch',
    }}>
      {/* 月份标签行 */}
      <div style={{
        display: 'flex',
        paddingLeft: 32,
        marginBottom: 6,
        position: 'relative',
        height: 16,
      }}>
        {monthLabels.map((label, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 32 + label.week * (cellSize + gap),
              fontSize: 10,
              color: subTextColor,
              fontFamily: "'Noto Serif SC', serif",
            }}
          >
            {label.month}月
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap }}>
        {/* 星期标签 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap,
          width: 24,
          paddingTop: 0,
        }}>
          {weekDayLabels.map((d, i) => (
            <div key={i} style={{
              height: cellSize,
              fontSize: 10,
              color: subTextColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingRight: 6,
            }}>
              {d}
            </div>
          ))}
        </div>

        {/* 热力图格子 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap,
        }}>
          {[0, 1, 2, 3, 4, 5, 6].map(dayIdx => (
            <div key={dayIdx} style={{ display: 'flex', gap }}>
              {Array.from({ length: totalWeeks }, (_, w) => {
                const day = allDays[w * 7 + dayIdx];
                if (!day) {
                  return <div key={w} style={{ width: cellSize, height: cellSize }} />;
                }
                const bgColor = day.isFuture
                  ? 'rgba(43, 42, 38, 0.03)'
                  : scheme.levels[day.intensity];

                return (
                  <div
                    key={w}
                    title={`${day.date} · 强度 ${day.intensity}`}
                    onClick={() => !day.isFuture && onSelectDate && onSelectDate(day.date)}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      borderRadius: 3,
                      background: bgColor,
                      cursor: day.isFuture ? 'default' : 'pointer',
                      border: day.isToday ? `1.5px solid ${scheme.levels[5]}` : 'none',
                      transition: 'all 0.15s ease',
                      boxSizing: 'border-box',
                    }}
                    onMouseEnter={(e) => {
                      if (!day.isFuture) e.currentTarget.style.transform = 'scale(1.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* 图例 */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 6,
        marginTop: 16,
        fontSize: 11,
        color: subTextColor,
      }}>
        <span>少</span>
        {scheme.levels.map((color, i) => (
          <div key={i} style={{
            width: 14, height: 14,
            borderRadius: 3,
            background: color,
            border: `1px solid ${isNight ? 'rgba(255,255,255,0.08)' : 'rgba(43, 42, 38, 0.08)'}`,
          }} />
        ))}
        <span>多</span>
      </div>
    </div>
  );
}

// ============================================
// 右侧统计侧栏
// ============================================
function CalendarSidebar({
  monthData, yearData, viewMode, scheme,
  density, isNight, textColor, subTextColor,
}) {
  const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : false;
  const stats = viewMode === 'year'
    ? yearData.stats
    : getMonthStats(monthData);

  const statItems = [
    { label: viewMode === 'year' ? '年度思考天数' : '本月思考天数', value: stats.activeDays, unit: '天', sub: `共 ${viewMode === 'year' ? 365 : stats.totalDays} 天` },
    { label: '知识沉淀', value: stats.totalNotes, unit: '篇', sub: `${Math.round(stats.totalWords / 1000)}k 字` },
    { label: '高强度日', value: stats.elevationDays || Math.floor(stats.activeDays * 0.25), unit: '天', sub: '深度思考' },
    { label: '连续思考', value: stats.currentStreak, unit: '天', sub: stats.currentStreak > 7 ? '保持得很好' : '继续保持' },
  ];

  // 强度分布
  const distribution = [0, 0, 0, 0, 0, 0];
  const days = viewMode === 'year' ? yearData.allDays : monthData.days.filter(d => !d.isFuture);
  days.forEach(d => { distribution[d.intensity]++; });

  const gradColors = ['#7C6FF0', '#4ECDC4', '#6BCB77', '#FFA07A'];
  const gradients = [
    'linear-gradient(135deg, #9B8EF7, #5B4FE0)',
    'linear-gradient(135deg, #6BE3DC, #3DB8B0)',
    'linear-gradient(135deg, #8DDA97, #4CAF50)',
    'linear-gradient(135deg, #FFB894, #FF8C5A)',
  ];

  return (
    <div style={{
      width: isMobile ? '100%' : (density === 'compact' ? 220 : 260),
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: density === 'compact' ? 12 : 16,
    }}>
      {/* 统计卡片 - 玻璃拟态 */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.72)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.9)',
        boxShadow: '0 8px 24px rgba(45, 55, 72, 0.06)',
        padding: density === 'compact' ? 16 : 20,
      }}>
        <h3 style={{
          fontSize: 15,
          fontWeight: 800,
          fontFamily: "'Poppins', 'Nunito', sans-serif",
          color: '#2D3748',
          marginBottom: density === 'compact' ? 12 : 16,
          letterSpacing: -0.3,
        }}>
          {viewMode === 'year' ? '年度概览' : '本月概览'}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: density === 'compact' ? 10 : 14 }}>
          {statItems.map((item, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderRadius: '14px',
              background: 'rgba(45, 55, 72, 0.02)',
              transition: 'all 250ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(45, 55, 72, 0.04)';
              e.currentTarget.style.transform = 'translateX(4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(45, 55, 72, 0.02)';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 28, height: 28,
                  borderRadius: '10px',
                  background: gradients[i],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 800,
                  boxShadow: `0 3px 8px ${gradColors[i]}40`,
                }}>
                  {['◎', '✎', '▲', '↯'][i]}
                </div>
                <div style={{ fontSize: 12, color: '#5A6577', fontWeight: 600, fontFamily: "'Nunito', sans-serif" }}>
                  {item.label}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: 22,
                  fontWeight: 800,
                  fontFamily: "'Poppins', 'Nunito', sans-serif",
                  background: gradients[i],
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  lineHeight: 1,
                }}>
                  {item.value}
                  <span style={{ fontSize: 12, fontWeight: 700, marginLeft: 2, WebkitTextFillColor: '#8B96A8', color: '#8B96A8' }}>
                    {item.unit}
                  </span>
                </div>
                <div style={{
                  fontSize: 10,
                  color: '#8B96A8',
                  marginTop: 3,
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 600,
                }}>
                  {item.sub}
                </div>
              </div>
            </div>
          ))}
         </div>
      </div>

      {/* 强度分布 */}
      <div style={{
        background: isNight ? 'rgba(255,255,255,0.02)' : '#FFFEFA',
        borderRadius: 12,
        border: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
        padding: density === 'compact' ? 16 : 20,
      }}>
        <h3 style={{
          fontSize: 13,
          fontWeight: 600,
          fontFamily: "'Noto Serif SC', serif",
          color: textColor,
          marginBottom: 14,
        }}>
          强度分布
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {scheme.levels.map((color, i) => {
            const count = distribution[i] || 0;
            const maxCount = Math.max(...distribution, 1);
            const percent = Math.round((count / days.length) * 100);
            return (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <div style={{
                  width: 16, height: 16,
                  borderRadius: 4,
                  background: color,
                  border: `1px solid ${isNight ? 'rgba(255,255,255,0.08)' : 'rgba(43, 42, 38, 0.08)'}`,
                  flexShrink: 0,
                }} />
                <span style={{
                  fontSize: 11,
                  color: subTextColor,
                  width: 50,
                  flexShrink: 0,
                }}>
                  {i === 0 ? '空白' : `等级 ${i}`}
                </span>
                <div style={{
                  flex: 1,
                  height: 6,
                  borderRadius: 3,
                  background: isNight ? 'rgba(255,255,255,0.04)' : 'rgba(43, 42, 38, 0.04)',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${percent}%`,
                    height: '100%',
                    background: color,
                    borderRadius: 3,
                    transition: 'width 0.5s ease',
                  }} />
                </div>
                <span style={{
                  fontSize: 10,
                  color: subTextColor,
                  width: 30,
                  textAlign: 'right',
                  fontFamily: "'JetBrains Mono', monospace",
                  flexShrink: 0,
                }}>
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 引用语 */}
      <div style={{
        padding: density === 'compact' ? '16px' : '20px',
        borderRadius: 12,
        background: `${scheme.levels[5]}0A`,
        borderLeft: `3px solid ${scheme.levels[4]}`,
        fontStyle: 'italic',
        fontFamily: "'Noto Serif SC', serif",
        fontSize: 12,
        color: scheme.levels[5],
        lineHeight: 1.7,
      }}>
        不经审视的人生不值得过。
        <div style={{
          marginTop: 8,
          fontSize: 10,
          opacity: 0.6,
          fontStyle: 'normal',
          textAlign: 'right',
        }}>
          — 苏格拉底
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  CalendarView,
  MonthView,
  WeekView,
  YearHeatmap,
  CalendarSidebar,
});
