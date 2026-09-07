// ============================================
// 「人」系统 主视图
// 在 OneOS 中，人和音乐、书法、AI 一样，是你知识网络中的一个节点。
// 人是通过话题认识的，不是通过"加好友"。
// ============================================

function HumanView({
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

  const [activeTab, setActiveTab] = React.useState('network'); // network | invites | stats
  const [activeTopic, setActiveTopic] = React.useState('t-oneos');
  const [selectedHuman, setSelectedHuman] = React.useState(null);

  const currentTopic = HUMAN_TOPICS.find(t => t.id === activeTopic);

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
      {/* 左侧话题列表 */}
      <TopicSidebar
        activeTopic={activeTopic}
        onTopicChange={setActiveTopic}
        isNight={isNight}
        textColor={textColor}
        subTextColor={subTextColor}
      />

      {/* 主内容区 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* 顶部栏 */}
        <div style={{
          flexShrink: 0,
          padding: '18px 28px',
          borderBottom: `1px solid ${isNight ? 'rgba(255,255,255,0.05)' : 'rgba(43, 42, 38, 0.05)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 36, height: 36,
              borderRadius: 10,
              background: currentTopic
                ? `linear-gradient(135deg, ${currentTopic.color}, ${currentTopic.color}90)`
                : '#8A8780',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 18,
            }}>
              {currentTopic?.icon || '?'}
            </div>
            <div>
              <div style={{
                fontSize: 17,
                fontWeight: 500,
                fontFamily: "'Noto Serif SC', serif",
                color: textColor,
                lineHeight: 1.2,
              }}>
                {currentTopic?.name || '全部话题'}
                <span style={{
                  marginLeft: 8,
                  fontSize: 12,
                  color: subTextColor,
                  fontWeight: 400,
                  opacity: 0.7,
                }}>
                  · {currentTopic?.nodeCount || 0} 人
                  <span
                    className="concept-hint"
                    title="在 OneOS 中，人和音乐、书法、AI 一样，是你知识网络中的一个节点。"
                    style={{ marginLeft: 4 }}
                  >?</span>
                </span>
              </div>
              <div style={{
                fontSize: 11,
                color: subTextColor,
                marginTop: 4,
                opacity: 0.7,
              }}>
                {currentTopic?.description}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {/* Tabs */}
            <div style={{
              display: 'flex',
              gap: 2,
              background: isNight ? 'rgba(255,255,255,0.03)' : 'rgba(43, 42, 38, 0.03)',
              borderRadius: 8,
              padding: 3,
            }}>
              {[
                { id: 'network', label: '人类网络' },
                { id: 'invites', label: '邀请码' },
                { id: 'stats', label: '节点统计' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '6px 16px',
                    borderRadius: 6,
                    border: 'none',
                    background: activeTab === tab.id
                      ? (isNight ? 'rgba(255,255,255,0.06)' : '#fff')
                      : 'transparent',
                    color: activeTab === tab.id ? textColor : subTextColor,
                    fontSize: 12,
                    fontWeight: activeTab === tab.id ? 500 : 400,
                    cursor: 'pointer',
                    fontFamily: activeTab === tab.id ? "'Noto Serif SC', serif" : 'inherit',
                    boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.04)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'network' && (
              <button
                onClick={() => {}}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: `1px solid ${currentTopic?.color || '#4F46E5'}50`,
                  background: `${currentTopic?.color || '#4F46E5'}10`,
                  color: currentTopic?.color || '#4F46E5',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: "'Noto Serif SC', serif",
                }}
              >
                + 添加人
              </button>
            )}
          </div>
        </div>

        {/* 内容 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {activeTab === 'network' && (
            <HumanNetworkView
              topicId={activeTopic}
              topic={currentTopic}
              onHumanClick={setSelectedHuman}
              isNight={isNight}
              textColor={textColor}
              subTextColor={subTextColor}
            />
          )}
          {activeTab === 'invites' && (
            <InvitesView
              topicId={activeTopic}
              isNight={isNight}
              textColor={textColor}
              subTextColor={subTextColor}
            />
          )}
          {activeTab === 'stats' && (
            <HumanStatsView
              isNight={isNight}
              textColor={textColor}
              subTextColor={subTextColor}
            />
          )}
        </div>
      </div>

      {/* 人详情面板 */}
      {selectedHuman && (
        <HumanDetailPanel
          human={selectedHuman}
          onClose={() => setSelectedHuman(null)}
          currentTopic={activeTopic}
          isNight={isNight}
          textColor={textColor}
          subTextColor={subTextColor}
        />
      )}
    </div>
  );
}

// ============================================
// 左侧话题列表
// ============================================
function TopicSidebar({ activeTopic, onTopicChange, isNight, textColor, subTextColor }) {
  return (
    <div style={{
       width: 220,
       flexShrink: 0,
       borderRight: '1px solid rgba(255, 255, 255, 0.9)',
       background: 'rgba(255, 255, 255, 0.6)',
       backdropFilter: 'blur(16px) saturate(180%)',
       WebkitBackdropFilter: 'blur(16px) saturate(180%)',
       display: 'flex',
       flexDirection: 'column',
       overflow: 'hidden',
       boxShadow: '4px 0 20px rgba(45, 55, 72, 0.03)',
     }}>
       {/* 顶部 */}
       <div style={{
         padding: '22px 20px 18px',
         borderBottom: '1px solid rgba(45, 55, 72, 0.06)',
         position: 'relative',
       }}>
         <h1 style={{
           fontSize: 20,
           fontWeight: 800,
           fontFamily: "'Poppins', 'Nunito', sans-serif",
           color: '#2D3748',
           marginBottom: 4,
           display: 'flex',
           alignItems: 'center',
           gap: 6,
           letterSpacing: -0.3,
         }}>
           人
           <span
             className="concept-hint"
             title="在 OneOS 中，人和音乐、书法、AI 一样，是你知识网络中的一个节点。人是通过话题认识的，不是通过'加好友'。"
           >?</span>
         </h1>
         <p style={{
           fontSize: 12,
           color: '#5A6577',
           lineHeight: 1.4,
           fontWeight: 600,
           fontFamily: "'Nunito', sans-serif",
         }}>
           {HUMAN_STATS.totalNodes} 位联系人 · {HUMAN_STATS.totalTopicLinks} 个话题链接
         </p>
       </div>

       {/* 统计概览 */}
       <div style={{
         padding: '14px 16px',
         display: 'grid',
         gridTemplateColumns: '1fr 1fr',
         gap: 10,
         borderBottom: '1px solid rgba(45, 55, 72, 0.06)',
       }}>
         <div style={{
           padding: '10px 12px',
           borderRadius: '14px',
           background: 'linear-gradient(135deg, rgba(255, 184, 148, 0.2), rgba(255, 140, 90, 0.08))',
         }}>
           <div style={{
             fontSize: 22,
             fontWeight: 800,
             fontFamily: "'Poppins', 'Nunito', sans-serif",
             color: '#E57A45',
             lineHeight: 1,
           }}>
             {HUMAN_STATS.activeTopics}
           </div>
           <div style={{
             fontSize: 11,
             color: '#A0522D',
             marginTop: 4,
             fontWeight: 600,
             fontFamily: "'Nunito', sans-serif",
           }}>
             活跃话题
           </div>
         </div>
         <div style={{
           padding: '10px 12px',
           borderRadius: '14px',
           background: 'linear-gradient(135deg, rgba(107, 227, 220, 0.2), rgba(61, 184, 176, 0.08))',
         }}>
           <div style={{
             fontSize: 22,
             fontWeight: 800,
             fontFamily: "'Poppins', 'Nunito', sans-serif",
             color: '#2A9D8F',
             lineHeight: 1,
           }}>
             {HUMAN_STATS.avgTopicsPerPerson}
           </div>
           <div style={{
             fontSize: 11,
             color: '#2A9D8F',
             marginTop: 4,
             fontWeight: 600,
             fontFamily: "'Nunito', sans-serif",
           }}>
             人均话题数
           </div>
         </div>
       </div>

       {/* 话题列表 */}
       <div style={{
         flex: 1,
         overflowY: 'auto',
         padding: '12px 12px',
       }}>
         <div style={{
           fontSize: 10,
           color: '#8B96A8',
           textTransform: 'uppercase',
           letterSpacing: 1.2,
           padding: '4px 8px 8px',
           fontFamily: "'Nunito', sans-serif",
           fontWeight: 700,
         }}>
           话题
         </div>
         <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
           {HUMAN_TOPICS.map(topic => (
             <div
               key={topic.id}
               onClick={() => onTopicChange(topic.id)}
               style={{
                 padding: '10px 12px',
                 borderRadius: '14px',
                 cursor: 'pointer',
                 display: 'flex',
                 alignItems: 'center',
                 gap: 10,
                 border: activeTopic === topic.id
                   ? '2px solid rgba(255,255,255,0.9)'
                   : '2px solid transparent',
                 background: activeTopic === topic.id
                   ? `linear-gradient(135deg, ${topic.color}22, ${topic.color}10)`
                   : 'transparent',
                 transition: 'all 250ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                 position: 'relative',
               }}
               onMouseEnter={(e) => {
                 if (activeTopic !== topic.id) {
                   e.currentTarget.style.background = 'rgba(255,255,255,0.6)';
                   e.currentTarget.style.transform = 'translateX(3px)';
                 }
               }}
               onMouseLeave={(e) => {
                 if (activeTopic !== topic.id) {
                   e.currentTarget.style.background = 'transparent';
                   e.currentTarget.style.transform = 'translateX(0)';
                 }
               }}
             >
               <div style={{
                 width: 32, height: 32,
                 borderRadius: '10px',
                 background: `linear-gradient(135deg, ${topic.color}dd, ${topic.color})`,
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 color: '#fff',
                 fontSize: 15,
                 flexShrink: 0,
                 boxShadow: `0 3px 10px ${topic.color}50`,
               }}>
                 {topic.icon}
               </div>
               <div style={{ flex: 1, minWidth: 0 }}>
                 <div style={{
                   fontSize: 13,
                   fontWeight: activeTopic === topic.id ? 700 : 600,
                   fontFamily: "'Nunito', sans-serif",
                   color: '#2D3748',
                 }}>
                   {topic.name}
                 </div>
               </div>
               <div style={{
                 fontSize: 11,
                 color: '#8B96A8',
                 fontWeight: 700,
                 fontFamily: "'Nunito', sans-serif",
                 padding: '2px 8px',
                 borderRadius: '999px',
                 background: activeTopic === topic.id ? 'rgba(255,255,255,0.5)' : 'transparent',
               }}>
                 {topic.nodeCount}
               </div>
             </div>
           ))}
         </div>
       </div>

      {/* 底部名言 */}
      <div style={{
        padding: '16px 20px',
        borderTop: `1px solid ${isNight ? 'rgba(255,255,255,0.05)' : 'rgba(43, 42, 38, 0.05)'}`,
        fontSize: 10,
        color: subTextColor,
        opacity: 0.6,
        textAlign: 'center',
        lineHeight: 1.6,
        fontFamily: "'Noto Serif SC', serif",
        fontStyle: 'italic',
      }}>
        "人不再是中心<br />话题才是中心"
      </div>
    </div>
  );
}

// ============================================
// 人类网络视图（话题下的节点卡片网格）
// ============================================
function HumanNetworkView({ topicId, topic, onHumanClick, isNight, textColor, subTextColor }) {
  const humans = getHumansByTopic(topicId);

  // 引荐关系可视化（小型）
  const introHumans = humans.filter(h => h.source === 'introduced');

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      {/* 节点网格 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 16,
        marginBottom: 28,
      }}>
        {humans.map(h => (
          <HumanNodeCard
            key={h.id}
            human={h}
            topicColor={topic?.color || '#8A8780'}
            onClick={() => onHumanClick(h)}
            isNight={isNight}
            textColor={textColor}
            subTextColor={subTextColor}
          />
        ))}
      </div>

      {/* 引荐关系图 */}
      {introHumans.length > 0 && (
        <div style={{
          padding: '20px 24px',
          borderRadius: 14,
          background: isNight ? 'rgba(255,255,255,0.02)' : 'rgba(43, 42, 38, 0.02)',
          border: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
        }}>
          <h3 style={{
            fontSize: 14,
            fontWeight: 500,
            fontFamily: "'Noto Serif SC', serif",
            color: textColor,
            marginBottom: 16,
          }}>
            引荐关系
          </h3>
          <IntroGraphMini
            humans={humans}
            topicId={topicId}
            isNight={isNight}
            textColor={textColor}
            subTextColor={subTextColor}
          />
        </div>
      )}
    </div>
  );
}

// ============================================
// 人类节点卡片
// ============================================
function HumanNodeCard({ human, topicColor, onClick, isNight, textColor, subTextColor }) {
  const relevance = human.currentTopic?.relevance || 50;

  // 音色状态颜色
  const toneColors = {
    open: '#5A7A4E',
    silent: '#B56B3A',
    blocked: '#8A8780',
  };
  const toneLabels = {
    open: '音色开放',
    silent: '音色静默',
    blocked: '已屏蔽',
  };

  return (
    <div
      onClick={onClick}
      style={{
        padding: '18px',
        borderRadius: 16,
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid rgba(255, 255, 255, 0.08)`,
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.25)';
        e.currentTarget.style.borderColor = `${topicColor}40`;
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
      }}
    >
      {/* 顶部色条 */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 3,
        background: `linear-gradient(90deg, ${topicColor}00, ${topicColor}, ${topicColor}00)`,
        opacity: 0.6,
      }} />

      {/* 头 + 名 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
      }}>
        <div style={{
          width: 44, height: 44,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${topicColor}, ${topicColor}90)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 18,
          fontWeight: 500,
          flexShrink: 0,
          fontFamily: "'Noto Serif SC', serif",
        }}>
          {human.avatar}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 15,
            fontWeight: 500,
            fontFamily: "'Noto Serif SC', serif",
            color: textColor,
            marginBottom: 2,
          }}>
            {human.name}
          </div>
          <div style={{
            fontSize: 11,
            color: subTextColor,
            opacity: 0.8,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {human.role}
          </div>
        </div>
      </div>

      {/* 关联度 */}
      <div style={{ marginBottom: 12 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 10,
          color: subTextColor,
          marginBottom: 4,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          <span>话题关联度</span>
          <span style={{ color: topicColor, fontWeight: 500 }}>{relevance}%</span>
        </div>
        <div style={{
          height: 4,
          borderRadius: 2,
          background: isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${relevance}%`,
            height: '100%',
            borderRadius: 2,
            background: `linear-gradient(90deg, ${topicColor}, ${topicColor}DD)`,
            transition: 'width 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
          }} />
        </div>
      </div>

      {/* 标签 */}
      <div style={{
        display: 'flex',
        gap: 4,
        flexWrap: 'wrap',
        marginBottom: 12,
      }}>
        {human.tags.slice(0, 2).map(tag => (
          <span key={tag} style={{
            fontSize: 10,
            padding: '3px 9px',
            borderRadius: 6,
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            color: subTextColor,
            fontFamily: "'Noto Serif SC', serif",
          }}>
            {tag}
          </span>
        ))}
        {human.topics.length > 1 && (
          <span
            title={`同时在 ${human.topics.length} 个话题中：${human.topics.map(t => t.name).join('、')}`}
            style={{
              fontSize: 10,
              padding: '3px 9px',
              borderRadius: 6,
              background: `${topicColor}15`,
              border: `1px solid ${topicColor}30`,
              color: topicColor,
              fontFamily: "'JetBrains Mono', monospace",
              cursor: 'help',
              fontWeight: 500,
            }}
          >
            同时在 {human.topics.length} 个话题
          </span>
        )}
      </div>

      {/* 底部信息 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
        borderTop: `1px solid ${isNight ? 'rgba(255,255,255,0.04)' : 'rgba(43, 42, 38, 0.04)'}`,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          fontSize: 10,
          color: subTextColor,
          opacity: 0.7,
        }}>
          <div style={{
            width: 5, height: 5,
            borderRadius: '50%',
            background: toneColors[human.toneStatus],
          }} />
          {toneLabels[human.toneStatus]}
        </div>
        <div style={{
          fontSize: 10,
          color: subTextColor,
          opacity: 0.5,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          {human.currentTopic?.lastContact}
        </div>
      </div>
    </div>
  );
}

// ============================================
// 小型引荐关系图
// ============================================
function IntroGraphMini({ humans, topicId, isNight, textColor, subTextColor }) {
  // 构建这个话题下的引荐关系
  const directHumans = humans.filter(h => h.source === 'direct');
  const introducedHumans = humans.filter(h => h.source === 'introduced');

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 20,
      padding: '10px 0',
    }}>
      {/* 我 */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        flexShrink: 0,
      }}>
        <div style={{
          width: 48, height: 48,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #B56B3A, #D48A5A)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 16,
          fontWeight: 500,
          fontFamily: "'Noto Serif SC', serif",
          boxShadow: '0 2px 8px rgba(181, 107, 58, 0.2)',
        }}>
          我
        </div>
        <span style={{ fontSize: 11, color: textColor, fontWeight: 500 }}>自我</span>
      </div>

      {/* 直接认识的人 */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        flexShrink: 0,
        paddingTop: 4,
      }}>
        {directHumans.slice(0, 3).map(h => (
          <div key={h.id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <div style={{
              width: 36, height: 36,
              borderRadius: '50%',
              background: `linear-gradient(135deg, #5A7A4E, #7A9A6E)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 14,
              fontWeight: 500,
              fontFamily: "'Noto Serif SC', serif",
            }}>
              {h.avatar}
            </div>
            <span style={{ fontSize: 12, color: textColor }}>{h.name}</span>
          </div>
        ))}
      </div>

      {/* 通过引荐的 */}
      {introducedHumans.length > 0 && (
        <>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            color: subTextColor,
            fontSize: 11,
            opacity: 0.5,
            paddingTop: 28,
          }}>
            ← 引荐 →
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            paddingTop: 4,
          }}>
            {introducedHumans.slice(0, 2).map(h => {
              const introducer = HUMAN_NODES.find(n => n.id === h.introducedBy);
              return (
                <div key={h.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}>
                  <div style={{
                    width: 36, height: 36,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, #9B6BA0, #BB8BC0)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 500,
                    fontFamily: "'Noto Serif SC', serif",
                  }}>
                    {h.avatar}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: textColor }}>{h.name}</div>
                    <div style={{ fontSize: 10, color: subTextColor, opacity: 0.6 }}>
                      via {introducer?.name || '?'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

Object.assign(window, {
  HumanView,
  TopicSidebar,
  HumanNetworkView,
  HumanNodeCard,
  IntroGraphMini,
});
