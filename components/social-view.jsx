// ============================================
// 可控零打扰社交系统 主视图
// ============================================

function SocialView({
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

  const [activeTab, setActiveTab] = React.useState('inbox'); // inbox | contacts | rules | stats
  const [selectedMessage, setSelectedMessage] = React.useState(null);
  const [selectedContact, setSelectedContact] = React.useState(null);
  const [inboxFilter, setInboxFilter] = React.useState('all'); // all | urgent | unread | archived

  // 过滤后的消息
  const filteredMessages = React.useMemo(() => {
    let msgs = [...INBOX_MESSAGES];
    if (inboxFilter === 'urgent') msgs = msgs.filter(m => m.isUrgent);
    else if (inboxFilter === 'unread') msgs = msgs.filter(m => m.status === 'unread');
    else if (inboxFilter === 'archived') msgs = msgs.filter(m => m.status === 'archived');
    return msgs;
  }, [inboxFilter]);

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
      {/* 左侧导航 Tabs */}
       <div style={{
         width: isMobile ? '100%' : 200,
         flexShrink: 0,
         borderRight: isMobile ? 'none' : '1px solid rgba(255, 255, 255, 0.9)',
         borderBottom: isMobile ? '1px solid rgba(45,55,72,0.06)' : 'none',
         background: 'rgba(255, 255, 255, 0.6)',
         backdropFilter: 'blur(16px) saturate(180%)',
         WebkitBackdropFilter: 'blur(16px) saturate(180%)',
         display: 'flex',
         flexDirection: isMobile ? 'row' : 'column',
         overflowX: isMobile ? 'auto' : 'visible',
         overflowY: isMobile ? 'hidden' : 'visible',
         boxShadow: isMobile ? 'none' : '4px 0 20px rgba(45, 55, 72, 0.03)',
         WebkitOverflowScrolling: 'touch',
       }}>
         {/* 顶部标题 - 移动端隐藏 */}
         {!isMobile && (<div style={{
           padding: '22px 20px 18px',
           borderBottom: '1px solid rgba(45, 55, 72, 0.06)',
           position: 'relative',
           overflow: 'hidden',
         }}>
           {/* 小装饰 */}
           <div className="deco-3d delay-2" style={{
             position: 'absolute',
             top: 10, right: 12,
             width: 32, height: 32,
             borderRadius: '50%',
             background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9), rgba(248,187,208,0.3))',
             border: '2px solid rgba(255, 255, 255, 0.7)',
             opacity: 0.7,
           }} />
           <h1 style={{
             fontSize: 20,
             fontWeight: 800,
             fontFamily: "'Poppins', 'Nunito', sans-serif",
             color: '#2D3748',
             marginBottom: 4,
             letterSpacing: -0.3,
             position: 'relative',
           }}>
             社交
           </h1>
           <p style={{
             fontSize: 12,
             color: '#5A6577',
             lineHeight: 1.4,
             fontWeight: 600,
             fontFamily: "'Nunito', sans-serif",
             position: 'relative',
           }}>
             静默收件箱 · 零打扰
           </p>
         </div>)}

         {/* 当前状态指示 - 移动端隐藏 */}
         {!isMobile && (<div style={{
           margin: '16px 14px',
           padding: '14px 14px',
           borderRadius: '18px',
           background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
           border: '1px solid rgba(107, 203, 119, 0.3)',
           fontSize: 12,
           color: '#2E7D32',
           lineHeight: 1.6,
           position: 'relative',
           overflow: 'hidden',
           boxShadow: '0 4px 12px rgba(107, 203, 119, 0.15)',
         }}>
           {/* 3D月亮/睡眠装饰 */}
           <div style={{
             position: 'absolute',
             top: -15, right: -10,
             width: 50, height: 50,
             borderRadius: '50%',
             background: 'radial-gradient(circle at 35% 35%, #fff, #FFE082 50%, #FFB300 100%)',
             boxShadow: '0 0 20px rgba(255, 201, 7, 0.4), inset -3px -5px 10px rgba(0,0,0,0.08)',
             opacity: 0.8,
             animation: 'breathe 3s ease-in-out infinite',
           }} />
           <div style={{
             display: 'flex',
             alignItems: 'center',
             gap: 8,
             marginBottom: 6,
             position: 'relative',
           }}>
             <div style={{
               width: 10, height: 10,
               borderRadius: '50%',
               background: 'linear-gradient(135deg, #8DDA97, #4CAF50)',
               boxShadow: '0 0 8px rgba(107, 203, 119, 0.6)',
               animation: 'breathe 2s ease-in-out infinite',
             }} />
             <span style={{ fontWeight: 800, fontFamily: "'Nunito', sans-serif" }}>
               世界安静中
             </span>
           </div>
           <div style={{ position: 'relative', fontSize: 11, fontWeight: 600, opacity: 0.8 }}>
             消息全部进入收件箱
           </div>
           <div style={{
             marginTop: 8,
             padding: '4px 10px',
             borderRadius: '999px',
             background: 'rgba(255, 255, 255, 0.6)',
             display: 'inline-block',
             fontSize: 10,
             fontWeight: 700,
             color: '#388E3C',
             fontFamily: "'Nunito', sans-serif",
             position: 'relative',
           }}>
             下一个窗口：周日 20:00
           </div>
         </div>)}

         {/* Tabs */}
         <nav style={{
           padding: isMobile ? '8px 12px' : '4px 12px',
           display: 'flex',
           flexDirection: isMobile ? 'row' : 'column',
           gap: isMobile ? 6 : 2,
           flexShrink: 0,
           alignItems: 'center',
         }}>
           {[
             { id: 'inbox', label: '静默收件箱', icon: '✉' },
             { id: 'contacts', label: '联系人', icon: '◐' },
             { id: 'rules', label: '权限与规则', icon: '⌘' },
             { id: 'stats', label: '社交记录', icon: '◫' },
           ].map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               style={{
                 padding: isMobile ? '8px 14px' : '10px 14px',
                 borderRadius: '14px',
                 border: 'none',
                 background: activeTab === tab.id
                   ? 'linear-gradient(135deg, rgba(248, 187, 208, 0.25), rgba(244, 143, 177, 0.15))'
                   : 'transparent',
                 color: activeTab === tab.id ? '#C2185B' : '#5A6577',
                 fontSize: isMobile ? 12 : 13,
                 textAlign: 'left',
                 cursor: 'pointer',
                 fontWeight: activeTab === tab.id ? 700 : 600,
                 fontFamily: "'Nunito', sans-serif",
                 transition: 'all 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                 display: 'flex',
                 alignItems: 'center',
                 gap: isMobile ? 6 : 10,
                 whiteSpace: 'nowrap',
                 flexShrink: 0,
               }}
               onMouseEnter={(e) => {
                 if (activeTab !== tab.id) {
                   e.currentTarget.style.background = 'rgba(255,255,255,0.6)';
                   e.currentTarget.style.transform = 'translateX(3px)';
                 }
               }}
               onMouseLeave={(e) => {
                 if (activeTab !== tab.id) {
                   e.currentTarget.style.background = 'transparent';
                   e.currentTarget.style.transform = 'translateX(0)';
                 }
               }}
             >
               <span style={{ fontSize: 14, width: 18, textAlign: 'center' }}>{tab.icon}</span>
               {tab.label}
             </button>
           ))}
         </nav>

        {!isMobile && (<div style={{ marginTop: 'auto', padding: '16px 20px' }}>
          <div style={{
            fontSize: 10,
            color: subTextColor,
            opacity: 0.6,
            textAlign: 'center',
            lineHeight: 1.5,
            fontFamily: "'Noto Serif SC', serif",
          }}>
            社交是生活的一部分<br />
            不是生活的全部
          </div>
        </div>)}
      </div>

      {/* 主内容区 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* 顶部栏 */}
        <div style={{
          flexShrink: 0,
          padding: '16px 28px',
          borderBottom: `1px solid ${isNight ? 'rgba(255,255,255,0.05)' : 'rgba(43, 42, 38, 0.05)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{
              fontSize: 16,
              fontWeight: 500,
              fontFamily: "'Noto Serif SC', serif",
              color: textColor,
            }}>
              {activeTab === 'inbox' && '静默收件箱'}
              {activeTab === 'contacts' && '联系人'}
              {activeTab === 'rules' && '权限与规则'}
              {activeTab === 'stats' && '社交记录'}
            </div>
          </div>

          {/* 窗口内状态指示（极简） */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <button style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: `1px solid ${isNight ? 'rgba(255,255,255,0.08)' : 'rgba(43, 42, 38, 0.08)'}`,
              background: 'transparent',
              color: subTextColor,
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: "'Noto Serif SC', serif",
            }}>
              临时开启接收
            </button>
          </div>
        </div>

        {/* 内容 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? 12 : 20, WebkitOverflowScrolling: 'touch' }}>
          {activeTab === 'inbox' && (
            <InboxView
              messages={filteredMessages}
              filter={inboxFilter}
              onFilterChange={setInboxFilter}
              onMessageClick={setSelectedMessage}
              isNight={isNight}
              textColor={textColor}
              subTextColor={subTextColor}
            />
          )}
          {activeTab === 'contacts' && (
            <ContactsView
              contacts={SOCIAL_CONTACTS}
              groups={SOCIAL_GROUPS}
              onContactClick={setSelectedContact}
              isNight={isNight}
              textColor={textColor}
              subTextColor={subTextColor}
            />
          )}
          {activeTab === 'rules' && (
            <RulesView
              isNight={isNight}
              textColor={textColor}
              subTextColor={subTextColor}
            />
          )}
          {activeTab === 'stats' && (
            <SocialStatsView
              isNight={isNight}
              textColor={textColor}
              subTextColor={subTextColor}
            />
          )}
        </div>
      </div>

      {/* 消息详情侧栏 */}
      {selectedMessage && (
        <MessageDetailPanel
          message={selectedMessage}
          onClose={() => setSelectedMessage(null)}
          isNight={isNight}
          textColor={textColor}
          subTextColor={subTextColor}
        />
      )}

      {/* 联系人详情侧栏 */}
      {selectedContact && (
        <ContactDetailPanel
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
          isNight={isNight}
          textColor={textColor}
          subTextColor={subTextColor}
        />
      )}
    </div>
  );
}

// ============================================
// 静默收件箱
// ============================================
function InboxView({ messages, filter, onFilterChange, onMessageClick, isNight, textColor, subTextColor }) {
  const filterTabs = [
    { id: 'all', label: '全部' },
    { id: 'unread', label: '未读' },
    { id: 'urgent', label: '紧急' },
    { id: 'archived', label: '已归档' },
  ];
  const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : false;

  // 统计未读和紧急数量（纯展示用，不显示红点）
  const unreadCount = INBOX_MESSAGES.filter(m => m.status === 'unread').length;
  const urgentCount = INBOX_MESSAGES.filter(m => m.isUrgent).length;

  return (
    <div style={{ maxWidth: isMobile ? '100%' : 720, margin: '0 auto' }}>
      {/* 静默收件箱说明 */}
      <div style={{
        padding: '16px 18px',
        borderRadius: 12,
        background: isNight ? 'rgba(90, 122, 78, 0.06)' : 'rgba(90, 122, 78, 0.04)',
        border: `1px solid ${isNight ? 'rgba(90, 122, 78, 0.15)' : 'rgba(90, 122, 78, 0.1)'}`,
        marginBottom: 20,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
      }}>
        <div style={{
          fontSize: 18,
          flexShrink: 0,
          marginTop: 1,
        }}>🔕</div>
        <div>
          <div style={{
            fontSize: 13,
            fontWeight: 500,
            fontFamily: "'Noto Serif SC', serif",
            color: textColor,
            marginBottom: 4,
          }}>
            静默收件箱
          </div>
          <p style={{
            fontSize: 12,
            color: subTextColor,
            lineHeight: 1.6,
            margin: 0,
          }}>
            这里是所有消息的安静归宿。没有红点，没有提醒，只有你主动查看时它们才出现。<br />
            <span style={{ opacity: 0.7 }}>下一个接收窗口：周日 20:00 · 窗口外的消息标记为「待到达」</span>
          </p>
        </div>
      </div>

      {/* 筛选 tabs */}
      <div style={{
        display: 'flex',
        gap: 4,
        marginBottom: 20,
        background: isNight ? 'rgba(255,255,255,0.03)' : 'rgba(43, 42, 38, 0.03)',
        borderRadius: 8,
        padding: 3,
        width: 'fit-content',
      }}>
        {filterTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onFilterChange(tab.id)}
            style={{
              padding: '6px 16px',
              borderRadius: 6,
              border: 'none',
              background: filter === tab.id
                ? (isNight ? 'rgba(255,255,255,0.06)' : '#fff')
                : 'transparent',
              color: filter === tab.id ? textColor : subTextColor,
              fontSize: 12,
              fontWeight: filter === tab.id ? 500 : 400,
              cursor: 'pointer',
              boxShadow: filter === tab.id ? '0 1px 3px rgba(0,0,0,0.04)' : 'none',
              transition: 'all 0.15s ease',
              fontFamily: filter === tab.id ? "'Noto Serif SC', serif" : 'inherit',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 消息列表 */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}>
        {messages.map(msg => {
          const from = SOCIAL_CONTACTS.find(c => c.id === msg.from);
          const group = msg.group ? SOCIAL_GROUPS.find(g => g.id === msg.group) : null;
          return (
            <div
              key={msg.id}
              onClick={() => onMessageClick(msg)}
              style={{
                padding: '14px 18px',
                borderRadius: 10,
                cursor: 'pointer',
                border: `1px solid ${isNight ? 'rgba(255,255,255,0.04)' : 'rgba(43, 42, 38, 0.04)'}`,
                background: isNight ? '#262522' : '#FFFEFA',
                display: 'flex',
                gap: 14,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = isNight ? 'rgba(255,255,255,0.08)' : 'rgba(43, 42, 38, 0.08)';
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = isNight ? 'rgba(255,255,255,0.04)' : 'rgba(43, 42, 38, 0.04)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* 头像 */}
              <div style={{
                width: 36, height: 36,
                borderRadius: '50%',
                background: group
                  ? `linear-gradient(135deg, ${group.color}, ${group.color}90)`
                  : (isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.08)'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 13,
                fontWeight: 500,
                flexShrink: 0,
                fontFamily: "'Noto Serif SC', serif",
              }}>
                {from?.avatar || '?'}
              </div>

              {/* 内容 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 4,
                }}>
                  <span style={{
                    fontSize: 13,
                    fontWeight: msg.status === 'unread' ? 600 : 500,
                    fontFamily: "'Noto Serif SC', serif",
                    color: textColor,
                  }}>
                    {from?.name || '未知'}
                  </span>
                  {msg.isUrgent && (
                    <span style={{
                      fontSize: 9,
                      padding: '1px 6px',
                      borderRadius: 8,
                      background: 'rgba(200, 50, 50, 0.12)',
                      color: '#C83232',
                      fontFamily: "'JetBrains Mono', monospace",
                      letterSpacing: 0.5,
                    }}>
                      紧急
                    </span>
                  )}
                  {group && (
                    <span style={{
                      fontSize: 10,
                      color: group.color,
                      opacity: 0.7,
                    }}>
                      · {group.name}
                    </span>
                  )}
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: 10,
                    color: subTextColor,
                    opacity: 0.6,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    {msg.time}
                  </span>
                </div>
                <div style={{
                  fontSize: 12,
                  fontWeight: msg.status === 'unread' ? 500 : 400,
                  color: textColor,
                  marginBottom: 4,
                }}>
                  {msg.topic}
                </div>
                <div style={{
                  fontSize: 11,
                  color: subTextColor,
                  opacity: 0.7,
                  lineHeight: 1.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {msg.content.replace(/[#>*`\[\]]/g, '').slice(0, 100)}…
                </div>

                {/* 窗口状态 */}
                <div style={{
                  marginTop: 6,
                  fontSize: 10,
                  color: subTextColor,
                  opacity: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  读取窗口：{msg.windowLabel}
                  {msg.inWindow && (
                    <span style={{
                      color: '#5A7A4E',
                      opacity: 1,
                      marginLeft: 4,
                    }}>
                      · 窗口内
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {messages.length === 0 && (
        <div style={{
          padding: '60px 20px',
          textAlign: 'center',
          color: subTextColor,
          fontSize: 13,
        }}>
          没有消息
        </div>
      )}
    </div>
  );
}

// ============================================
// 消息详情面板
// ============================================
function MessageDetailPanel({ message, onClose, isNight, textColor, subTextColor }) {
  const from = SOCIAL_CONTACTS.find(c => c.id === message.from);
  const group = message.group ? SOCIAL_GROUPS.find(g => g.id === message.group) : null;
  const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : false;

  const [status, setStatus] = React.useState(message.status);

  const handleArchive = () => {
    setStatus('archived');
    // 全局联动：社交消息归档
    window.OneOSAppState.archiveSocialMessage({
      personId: message.from,
      personName: from?.name || '联系人',
      content: message.content || message.preview || '',
      topic: from?.topics?.[0]?.name || '沟通记录',
    });
  };

  return (
    <div style={{
      width: isMobile ? '100%' : 400,
      flexShrink: 0,
      borderLeft: isMobile ? 'none' : `1px solid ${isNight ? 'rgba(255,255,255,0.08)' : 'rgba(43, 42, 38, 0.08)'}`,
      background: isNight ? '#262522' : '#FFFEFA',
      display: 'flex',
      flexDirection: 'column',
      animation: 'slideInRight 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both',
      overflow: 'hidden',
      position: isMobile ? 'fixed' : 'relative',
      top: isMobile ? 0 : 'auto',
      left: isMobile ? 0 : 'auto',
      right: isMobile ? 0 : 'auto',
      bottom: isMobile ? 0 : 'auto',
      zIndex: isMobile ? 1000 : 'auto',
    }}>
      {/* 头部 */}
      <div style={{
        padding: '18px 20px',
        borderBottom: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36,
            borderRadius: '50%',
            background: group
              ? `linear-gradient(135deg, ${group.color}, ${group.color}90)`
              : (isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.08)'),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 14,
            fontWeight: 500,
            fontFamily: "'Noto Serif SC', serif",
          }}>
            {from?.avatar || '?'}
          </div>
          <div>
            <div style={{
              fontSize: 14,
              fontWeight: 500,
              fontFamily: "'Noto Serif SC', serif",
              color: textColor,
            }}>
              {from?.name || '未知'}
            </div>
            <div style={{
              fontSize: 10,
              color: subTextColor,
              opacity: 0.7,
            }}>
              {from?.role}
            </div>
          </div>
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
      </div>

      {/* 消息内容 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px 24px',
      }}>
        <div style={{
          fontSize: 15,
          fontWeight: 600,
          fontFamily: "'Noto Serif SC', serif",
          color: textColor,
          marginBottom: 8,
          lineHeight: 1.4,
        }}>
          {message.topic}
        </div>
        <div style={{
          fontSize: 11,
          color: subTextColor,
          opacity: 0.6,
          marginBottom: 16,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          {message.time}
        </div>

        {/* 消息正文 Markdown */}
        <div style={{
          fontSize: 13,
          lineHeight: 1.7,
          color: textColor,
          whiteSpace: 'pre-wrap',
        }}>
          <MarkdownLite content={message.content} isNight={isNight} textColor={textColor} />
        </div>
      </div>

      {/* 底部操作 */}
      <div style={{
        padding: '14px 20px',
        borderTop: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
        display: 'flex',
        gap: 10,
        flexShrink: 0,
      }}>
        {status !== 'archived' && (
          <button
            onClick={handleArchive}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 8,
              border: `1px solid ${isNight ? 'rgba(90, 122, 78, 0.3)' : 'rgba(90, 122, 78, 0.2)'}`,
              background: isNight ? 'rgba(90, 122, 78, 0.1)' : 'rgba(90, 122, 78, 0.06)',
              color: '#5A7A4E',
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: "'Noto Serif SC', serif",
              fontWeight: 500,
            }}
          >
            归档到知识库
          </button>
        )}
        {status === 'archived' && (
          <div style={{
            flex: 1,
            padding: '10px 14px',
            textAlign: 'center',
            fontSize: 12,
            color: '#5A7A4E',
          }}>
            ✓ 已归档
          </div>
        )}
        <button style={{
          padding: '10px 14px',
          borderRadius: 8,
          border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.1)'}`,
          background: 'transparent',
          color: subTextColor,
          fontSize: 12,
          cursor: 'pointer',
        }}>
          回复
        </button>
      </div>
    </div>
  );
}

// ============================================
// 联系人视图
// ============================================
function ContactsView({ contacts, groups, onContactClick, isNight, textColor, subTextColor }) {
  // 按分组展示
  const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : false;
  return (
    <div style={{ maxWidth: isMobile ? '100%' : 720, margin: '0 auto' }}>
      {/* 概览 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12,
        marginBottom: 28,
      }}>
        {groups.map(g => {
          const count = contacts.filter(c => c.groups.includes(g.id)).length;
          return (
            <div key={g.id} style={{
              padding: '14px 16px',
              borderRadius: 10,
              background: isNight ? `${g.color}08` : `${g.color}05`,
              border: `1px solid ${g.color}20`,
            }}>
              <div style={{
                fontSize: 11,
                color: g.color,
                marginBottom: 4,
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {g.name}
              </div>
              <div style={{
                fontSize: 22,
                fontWeight: 600,
                fontFamily: "'Noto Serif SC', serif",
                color: textColor,
                marginBottom: 2,
              }}>
                {count}
              </div>
              <div style={{
                fontSize: 10,
                color: subTextColor,
                opacity: 0.7,
              }}>
                位联系人
              </div>
            </div>
          );
        })}
      </div>

      {/* 分组列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {groups.map(g => {
          const groupContacts = contacts.filter(c => c.groups.includes(g.id));
          return (
            <div key={g.id}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 10,
              }}>
                <div style={{
                  width: 4, height: 16,
                  borderRadius: 2,
                  background: g.color,
                }} />
                <h3 style={{
                  fontSize: 14,
                  fontWeight: 500,
                  fontFamily: "'Noto Serif SC', serif",
                  color: textColor,
                }}>
                  {g.name}
                </h3>
                <span style={{
                  fontSize: 11,
                  color: subTextColor,
                  opacity: 0.6,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  {g.window.time} · {g.window.days.join('、')}
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: 8,
              }}>
                {groupContacts.map(c => (
                  <div
                    key={c.id}
                    onClick={() => onContactClick(c)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 10,
                      cursor: 'pointer',
                      border: `1px solid ${isNight ? 'rgba(255,255,255,0.04)' : 'rgba(43, 42, 38, 0.04)'}`,
                      background: isNight ? '#262522' : '#FFFEFA',
                      display: 'flex',
                      gap: 12,
                      alignItems: 'center',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = `${g.color}30`;
                      e.currentTarget.style.background = isNight ? `${g.color}08` : `${g.color}04`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = isNight ? 'rgba(255,255,255,0.04)' : 'rgba(43, 42, 38, 0.04)';
                      e.currentTarget.style.background = isNight ? '#262522' : '#FFFEFA';
                    }}
                  >
                    <div style={{
                      width: 36, height: 36,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${g.color}, ${g.color}90)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: 13,
                      fontWeight: 500,
                      flexShrink: 0,
                      fontFamily: "'Noto Serif SC', serif",
                    }}>
                      {c.avatar}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13,
                        fontWeight: 500,
                        fontFamily: "'Noto Serif SC', serif",
                        color: textColor,
                        marginBottom: 2,
                      }}>
                        {c.name}
                        {c.hasEmergencyAccess && (
                          <span style={{
                            marginLeft: 6,
                            fontSize: 9,
                            color: '#C83232',
                            opacity: 0.7,
                          }}>
                            ★
                          </span>
                        )}
                      </div>
                      <div style={{
                        fontSize: 10,
                        color: subTextColor,
                        opacity: 0.7,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {c.role}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* 陌生人 */}
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 10,
          }}>
            <div style={{
              width: 4, height: 16,
              borderRadius: 2,
              background: '#8A8780',
            }} />
            <h3 style={{
              fontSize: 14,
              fontWeight: 500,
              fontFamily: "'Noto Serif SC', serif",
              color: textColor,
            }}>
              陌生人
            </h3>
            <span style={{
              fontSize: 11,
              color: subTextColor,
              opacity: 0.6,
            }}>
              遵循全局规则
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 8,
            opacity: 0.6,
          }}>
            {contacts.filter(c => c.isStranger).map(c => (
              <div
                key={c.id}
                onClick={() => onContactClick(c)}
                style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  border: `1px dashed ${isNight ? 'rgba(255,255,255,0.08)' : 'rgba(43, 42, 38, 0.08)'}`,
                  background: 'transparent',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                }}
              >
                <div style={{
                  width: 36, height: 36,
                  borderRadius: '50%',
                  background: isNight ? 'rgba(255,255,255,0.05)' : 'rgba(43, 42, 38, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: subTextColor,
                  fontSize: 13,
                  flexShrink: 0,
                  fontFamily: "'Noto Serif SC', serif",
                }}>
                  {c.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13,
                    color: textColor,
                    marginBottom: 2,
                  }}>
                    {c.name}
                  </div>
                  <div style={{
                    fontSize: 10,
                    color: subTextColor,
                    opacity: 0.7,
                  }}>
                    {c.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 联系人详情面板
// ============================================
function ContactDetailPanel({ contact, onClose, isNight, textColor, subTextColor }) {
  const groups = SOCIAL_GROUPS.filter(g => contact.groups.includes(g.id));
  const primaryGroup = groups[0];
  const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : false;

  return (
    <div style={{
      width: isMobile ? '100%' : 380,
      flexShrink: 0,
      borderLeft: isMobile ? 'none' : `1px solid ${isNight ? 'rgba(255,255,255,0.08)' : 'rgba(43, 42, 38, 0.08)'}`,
      background: isNight ? '#262522' : '#FFFEFA',
      display: 'flex',
      flexDirection: 'column',
      animation: 'slideInRight 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both',
      overflow: 'hidden',
      position: isMobile ? 'fixed' : 'relative',
      top: isMobile ? 0 : 'auto',
      left: isMobile ? 0 : 'auto',
      right: isMobile ? 0 : 'auto',
      bottom: isMobile ? 0 : 'auto',
      zIndex: isMobile ? 1000 : 'auto',
    }}>
      {/* 头部 */}
      <div style={{
        padding: '24px 24px 18px',
        textAlign: 'center',
        background: primaryGroup
          ? `linear-gradient(180deg, ${primaryGroup.color}10, transparent)`
          : 'transparent',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 14, right: 14,
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
        <div style={{
          width: 56, height: 56,
          borderRadius: '50%',
          background: primaryGroup
            ? `linear-gradient(135deg, ${primaryGroup.color}, ${primaryGroup.color}90)`
            : (isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.08)'),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 22,
          fontWeight: 500,
          margin: '0 auto 12px',
          fontFamily: "'Noto Serif SC', serif",
        }}>
          {contact.avatar}
        </div>
        <h2 style={{
          fontSize: 18,
          fontWeight: 500,
          fontFamily: "'Noto Serif SC', serif",
          color: textColor,
          marginBottom: 4,
        }}>
          {contact.name}
        </h2>
        <p style={{
          fontSize: 12,
          color: subTextColor,
          marginBottom: 12,
        }}>
          {contact.role}
        </p>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 6,
          flexWrap: 'wrap',
        }}>
          {groups.map(g => (
            <span key={g.id} style={{
              fontSize: 10,
              padding: '2px 10px',
              borderRadius: 10,
              background: `${g.color}12`,
              color: g.color,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {g.name}
            </span>
          ))}
          {contact.isStranger && (
            <span style={{
              fontSize: 10,
              padding: '2px 10px',
              borderRadius: 10,
              background: 'rgba(138, 135, 128, 0.15)',
              color: '#8A8780',
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              陌生人
            </span>
          )}
        </div>
      </div>

      {/* 内容 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 24px',
      }}>
        {/* 规则信息 */}
        <div style={{ marginBottom: 20 }}>
          <h4 style={{
            fontSize: 11,
            color: subTextColor,
            marginBottom: 10,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 400,
          }}>
            生效规则
          </h4>
          <div style={{
            padding: '12px 14px',
            borderRadius: 10,
            background: isNight ? 'rgba(255,255,255,0.03)' : 'rgba(43, 42, 38, 0.02)',
            border: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
          }}>
            <div style={{
              fontSize: 12,
              color: subTextColor,
              marginBottom: 4,
            }}>
              规则来源：<span style={{ color: textColor }}>{contact.effectiveRule.source}</span>
            </div>
            <div style={{
              fontSize: 13,
              fontWeight: 500,
              fontFamily: "'Noto Serif SC', serif",
              color: textColor,
            }}>
              {contact.effectiveRule.window}
            </div>
          </div>
        </div>

        {/* 对方可见 */}
        <div style={{ marginBottom: 20 }}>
          <h4 style={{
            fontSize: 11,
            color: subTextColor,
            marginBottom: 10,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 400,
          }}>
            对方可见
          </h4>
          <div style={{
            padding: '12px 14px',
            borderRadius: 10,
            background: isNight ? 'rgba(155, 107, 160, 0.06)' : 'rgba(155, 107, 160, 0.04)',
            border: `1px dashed ${isNight ? 'rgba(155, 107, 160, 0.25)' : 'rgba(155, 107, 160, 0.2)'}`,
            fontSize: 11,
            color: '#9B6BA0',
            lineHeight: 1.6,
            fontFamily: "'Noto Serif SC', serif",
          }}>
            "该用户的消息读取窗口为【{contact.effectiveRule.window.split(' ')[1] || contact.effectiveRule.window}】，你的消息将在该窗口内被接收。"
            <div style={{
              marginTop: 8,
              fontSize: 10,
              color: subTextColor,
              fontStyle: 'normal',
              opacity: 0.7,
            }}>
              除此之外，对方看不到任何其他信息——在线状态、已读状态、最后活跃时间均不公开。
            </div>
          </div>
        </div>

        {/* 紧急通道 */}
        <div style={{ marginBottom: 20 }}>
          <h4 style={{
            fontSize: 11,
            color: subTextColor,
            marginBottom: 10,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 400,
          }}>
            紧急通道
          </h4>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderRadius: 10,
            background: isNight ? 'rgba(255,255,255,0.03)' : 'rgba(43, 42, 38, 0.02)',
            border: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
          }}>
            <span style={{ fontSize: 12, color: textColor }}>
              允许突破时间窗口
            </span>
            <div style={{
              width: 36, height: 20,
              borderRadius: 10,
              background: contact.hasEmergencyAccess
                ? 'linear-gradient(135deg, #C83232, #E85050)'
                : (isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.1)'),
              position: 'relative',
              cursor: 'pointer',
              transition: 'background 0.2s ease',
            }}>
              <div style={{
                position: 'absolute',
                top: 2,
                right: contact.hasEmergencyAccess ? 2 : 18,
                width: 16, height: 16,
                borderRadius: '50%',
                background: '#fff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                transition: 'right 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
              }} />
            </div>
          </div>
        </div>

        {/* 沟通记录 */}
        <div>
          <h4 style={{
            fontSize: 11,
            color: subTextColor,
            marginBottom: 10,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 400,
          }}>
            沟通记录
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8,
          }}>
            <div style={{
              padding: '10px 12px',
              borderRadius: 8,
              background: isNight ? 'rgba(255,255,255,0.03)' : 'rgba(43, 42, 38, 0.02)',
            }}>
              <div style={{ fontSize: 10, color: subTextColor, marginBottom: 4 }}>消息数</div>
              <div style={{
                fontSize: 18, fontWeight: 500,
                fontFamily: "'Noto Serif SC', serif",
                color: textColor,
              }}>
                {contact.messageCount}
              </div>
            </div>
            <div style={{
              padding: '10px 12px',
              borderRadius: 8,
              background: isNight ? 'rgba(255,255,255,0.03)' : 'rgba(43, 42, 38, 0.02)',
            }}>
              <div style={{ fontSize: 10, color: subTextColor, marginBottom: 4 }}>上次联系</div>
              <div style={{
                fontSize: 14, fontWeight: 500,
                fontFamily: "'Noto Serif SC', serif",
                color: textColor,
              }}>
                {contact.lastContact}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部 */}
      <div style={{
        padding: '14px 24px',
        borderTop: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
        display: 'flex',
        gap: 10,
        flexShrink: 0,
      }}>
        <button style={{
          flex: 1,
          padding: '10px',
          borderRadius: 8,
          border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.1)'}`,
          background: 'transparent',
          color: subTextColor,
          fontSize: 12,
          cursor: 'pointer',
        }}>
          查看聊天记录
        </button>
        <button style={{
          flex: 1,
          padding: '10px',
          borderRadius: 8,
          border: 'none',
          background: primaryGroup
            ? `linear-gradient(135deg, ${primaryGroup.color}, ${primaryGroup.color}BB)`
            : '#4F46E5',
          color: '#fff',
          fontSize: 12,
          fontWeight: 500,
          cursor: 'pointer',
          fontFamily: "'Noto Serif SC', serif",
        }}>
          发送消息
        </button>
      </div>
    </div>
  );
}

// ============================================
// 简易 Markdown 渲染（轻量版，用在消息里）
// ============================================
function MarkdownLite({ content, isNight, textColor }) {
  const lines = content.split('\n');
  const elements = [];

  lines.forEach((line, i) => {
    if (line.startsWith('## ')) {
      elements.push(
        <div key={i} style={{
          fontSize: 14,
          fontWeight: 600,
          fontFamily: "'Noto Serif SC', serif",
          marginTop: 14,
          marginBottom: 8,
          color: textColor,
        }}>
          {line.slice(3)}
        </div>
      );
      return;
    }
    if (line.startsWith('# ')) {
      elements.push(
        <div key={i} style={{
          fontSize: 16,
          fontWeight: 600,
          fontFamily: "'Noto Serif SC', serif",
          marginTop: 16,
          marginBottom: 10,
          color: textColor,
        }}>
          {line.slice(2)}
        </div>
      );
      return;
    }
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={i} style={{
          margin: '8px 0',
          padding: '6px 12px',
          borderLeft: `3px solid ${isNight ? '#8A8780' : '#B5B2A8'}`,
          background: isNight ? 'rgba(255,255,255,0.03)' : 'rgba(43, 42, 38, 0.03)',
          color: isNight ? '#B8B5AD' : '#6B6960',
          fontStyle: 'italic',
          fontFamily: "'Noto Serif SC', serif",
          lineHeight: 1.6,
          fontSize: 12,
        }}>
          {line.slice(2)}
        </blockquote>
      );
      return;
    }
    if (/^[-*] /.test(line)) {
      elements.push(
        <div key={i} style={{
          display: 'flex',
          gap: 8,
          padding: '3px 0 3px 8px',
          lineHeight: 1.6,
        }}>
          <span style={{ color: '#B56B3A', flexShrink: 0, fontSize: 12 }}>•</span>
          <span style={{ fontSize: 13 }}>{inlineFormat(line.slice(2))}</span>
        </div>
      );
      return;
    }
    if (/^\d+\. /.test(line)) {
      const m = line.match(/^(\d+)\. (.*)/);
      elements.push(
        <div key={i} style={{
          display: 'flex',
          gap: 8,
          padding: '3px 0 3px 8px',
          lineHeight: 1.6,
        }}>
          <span style={{
            color: '#6B6960',
            flexShrink: 0,
            fontSize: 12,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {m[1]}.
          </span>
          <span style={{ fontSize: 13 }}>{inlineFormat(m[2])}</span>
        </div>
      );
      return;
    }
    if (line.trim() === '') {
      elements.push(<div key={i} style={{ height: 8 }} />);
      return;
    }
    elements.push(
      <p key={i} style={{ margin: '4px 0', lineHeight: 1.7, fontSize: 13 }}>
        {inlineFormat(line)}
      </p>
    );
  });

  function inlineFormat(text) {
    // 处理 **加粗** 和 [[双链]]
    const parts = [];
    let remaining = text;
    let key = 0;

    // 先处理 [[双链]]
    const linkRe = /\[\[([^\]]+)\]\]/g;
    let last = 0;
    let match;
    while ((match = linkRe.exec(text)) !== null) {
      if (match.index > last) {
        parts.push(<span key={`t-${key++}`}>{boldFormat(text.slice(last, match.index))}</span>);
      }
      parts.push(
        <span key={`l-${key++}`} style={{
          color: '#4F46E5',
          borderBottom: `1px dashed rgba(79, 70, 229, 0.4)`,
          padding: '0 1px',
        }}>
          [[{match[1]}]]
        </span>
      );
      last = match.index + match[0].length;
    }
    if (last < text.length) {
      parts.push(<span key={`t-${key++}`}>{boldFormat(text.slice(last))}</span>);
    }

    return parts;
  }

  function boldFormat(text) {
    const parts = [];
    let i = 0;
    let buffer = '';
    let key = 0;
    while (i < text.length) {
      if (text.substr(i, 2) === '**') {
        if (buffer) {
          parts.push(<span key={`b-${key++}`}>{buffer}</span>);
          buffer = '';
        }
        const end = text.indexOf('**', i + 2);
        if (end === -1) {
          buffer += text.substr(i);
          i = text.length;
        } else {
          parts.push(<strong key={`s-${key++}`} style={{ fontWeight: 600 }}>{text.slice(i + 2, end)}</strong>);
          i = end + 2;
        }
      } else {
        buffer += text[i];
        i++;
      }
    }
    if (buffer) parts.push(<span key={`e-${key++}`}>{buffer}</span>);
    return parts;
  }

  return <span>{elements}</span>;
}

Object.assign(window, {
  SocialView,
  InboxView,
  MessageDetailPanel,
  ContactsView,
  ContactDetailPanel,
  MarkdownLite,
});
