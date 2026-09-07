// ============================================
// 极小圈子 主视图 + 圈子列表 + 圈子主页
// ============================================

function CircleView({
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

  const [activeCircle, setActiveCircle] = React.useState(null);
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('topics'); // topics | members | knowledge | stats

  const circle = activeCircle
    ? CIRCLES.find(c => c.id === activeCircle)
    : null;

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
        padding: isMobile ? '12px 14px' : '18px 28px',
        borderBottom: `1px solid ${isNight ? 'rgba(255,255,255,0.05)' : 'rgba(43, 42, 38, 0.05)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {circle && (
            <button
              onClick={() => { setActiveCircle(null); setActiveTab('topics'); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 8,
                border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.1)'}`,
                background: 'transparent',
                color: subTextColor,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              ← 返回圈子列表
            </button>
          )}
          <div>
            <h1 style={{
              fontSize: 18,
              fontWeight: 500,
              fontFamily: "'Noto Serif SC', serif",
              color: textColor,
              marginBottom: 4,
            }}>
              {circle ? circle.name : '极小圈子'}
            </h1>
            <p style={{
              fontSize: 11,
              color: subTextColor,
              lineHeight: 1.4,
            }}>
              {circle ? circle.description : '小而美的深度讨论空间 · 每个圈子最多10人'}
            </p>
          </div>
        </div>

        {!circle && (
          <button
            onClick={() => setShowCreateDialog(true)}
            style={{
              padding: '8px 18px',
              borderRadius: 8,
              border: `1px solid #B56B3A40`,
              background: '#B56B3A10',
              color: '#B56B3A',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: "'Noto Serif SC', serif",
            }}
          >
            + 创建圈子
          </button>
        )}

        {circle && (
          <div style={{
            display: 'flex',
            gap: 2,
            background: isNight ? 'rgba(255,255,255,0.03)' : 'rgba(43, 42, 38, 0.03)',
            borderRadius: 8,
            padding: 3,
          }}>
            {[
              { id: 'topics', label: '话题' },
              { id: 'members', label: '成员' },
              { id: 'knowledge', label: '知识库' },
              { id: 'stats', label: '统计' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '6px 14px',
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
        )}
      </div>

      {/* 内容区 */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {!circle && (
          <CircleListView
            onEnterCircle={setActiveCircle}
            onCreateClick={() => setShowCreateDialog(true)}
            isNight={isNight}
            textColor={textColor}
            subTextColor={subTextColor}
          />
        )}

        {circle && activeTab === 'topics' && (
          <CircleTopicsView
            circle={circle}
            isNight={isNight}
            textColor={textColor}
            subTextColor={subTextColor}
          />
        )}
        {circle && activeTab === 'members' && (
          <CircleMembersView
            circle={circle}
            isNight={isNight}
            textColor={textColor}
            subTextColor={subTextColor}
          />
        )}
        {circle && activeTab === 'knowledge' && (
          <CircleKnowledgeView
            circle={circle}
            isNight={isNight}
            textColor={textColor}
            subTextColor={subTextColor}
          />
        )}
        {circle && activeTab === 'stats' && (
          <CircleStatsView
            circle={circle}
            isNight={isNight}
            textColor={textColor}
            subTextColor={subTextColor}
          />
        )}
      </div>

      {/* 创建圈子弹窗 */}
      {showCreateDialog && (
        <CreateCircleDialog
          onClose={() => setShowCreateDialog(false)}
          isNight={isNight}
          textColor={textColor}
          subTextColor={subTextColor}
        />
      )}
    </div>
  );
}

// ============================================
// 圈子列表
// ============================================
function CircleListView({ onEnterCircle, onCreateClick, isNight, textColor, subTextColor }) {
  const createdCount = CIRCLES.length;
  const maxCircles = 3;

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 28px' }}>
      {/* 圈子核心理念说明 */}
      <div style={{
        padding: '20px 24px',
        borderRadius: 14,
        background: isNight ? 'rgba(155, 107, 160, 0.06)' : 'rgba(155, 107, 160, 0.04)',
        border: `1px solid ${isNight ? 'rgba(155, 107, 160, 0.15)' : 'rgba(155, 107, 160, 0.1)'}`,
        marginBottom: 24,
      }}>
        <div style={{
          fontSize: 16,
          fontWeight: 600,
          fontFamily: "'Noto Serif SC', serif",
          color: textColor,
          marginBottom: 8,
        }}>
          OneOS 圈子不是聊天群
        </div>
        <p style={{
          fontSize: 13,
          color: subTextColor,
          lineHeight: 1.7,
          margin: '0 0 12px',
        }}>
          在这里，你发起一个话题，大家围绕这个话题进行深度讨论。<br />
          所有讨论自动沉淀为知识文档，可以反复阅读、提炼、升维。
        </p>
        <div style={{ display: 'flex', gap: 20, fontSize: 11, color: subTextColor, opacity: 0.8 }}>
          <span>✓ 话题驱动，不是消息驱动</span>
          <span>✓ 没有在线人数，没有正在输入</span>
          <span>✓ 讨论即知识，自动归档</span>
          <span>✓ 最多 10 人，极小而深</span>
        </div>
      </div>

      {/* 创建限制提示 */}
      <div style={{
        padding: '16px 20px',
        borderRadius: 12,
        background: isNight ? 'rgba(181, 107, 58, 0.08)' : 'rgba(181, 107, 58, 0.05)',
        border: `1px solid ${isNight ? 'rgba(181, 107, 58, 0.2)' : 'rgba(181, 107, 58, 0.15)'}`,
        marginBottom: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{
            fontSize: 14,
            fontWeight: 500,
            color: '#B56B3A',
            fontFamily: "'Noto Serif SC', serif",
            marginBottom: 4,
          }}>
            你已创建 {createdCount} / {maxCircles} 个圈子
          </div>
          <div style={{
            fontSize: 12,
            color: subTextColor,
            lineHeight: 1.5,
          }}>
            每人最多创建 3 个圈子，每个圈子最多 10 人。关系的质量远比数量重要。
          </div>
        </div>
        {/* 进度条 */}
        <div style={{
          width: 120,
          display: 'flex',
          gap: 6,
        }}>
          {Array.from({ length: maxCircles }).map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 32,
                borderRadius: 6,
                background: i < createdCount
                  ? 'linear-gradient(135deg, #B56B3A, #D48A5A)'
                  : (isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'),
                border: i < createdCount
                  ? 'none'
                  : `1px dashed ${isNight ? 'rgba(255,255,255,0.15)' : 'rgba(43, 42, 38, 0.15)'}`,
              }}
            />
          ))}
        </div>
      </div>

      {/* 圈子卡片网格 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 16,
        marginBottom: 16,
      }}>
        {CIRCLES.map(circle => (
          <CircleCard
            key={circle.id}
            circle={circle}
            onClick={() => onEnterCircle(circle.id)}
            isNight={isNight}
            textColor={textColor}
            subTextColor={subTextColor}
          />
        ))}

        {/* 创建空位卡片 */}
        {createdCount < maxCircles && (
          <div
            onClick={onCreateClick}
            style={{
              padding: '24px',
              borderRadius: 14,
              border: `2px dashed ${isNight ? 'rgba(255,255,255,0.15)' : 'rgba(43, 42, 38, 0.15)'}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              cursor: 'pointer',
              minHeight: 200,
              transition: 'all 0.2s ease',
              color: subTextColor,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#B56B3A50';
              e.currentTarget.style.color = '#B56B3A';
              e.currentTarget.style.background = 'rgba(181, 107, 58, 0.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = isNight ? 'rgba(255,255,255,0.15)' : 'rgba(43, 42, 38, 0.15)';
              e.currentTarget.style.color = subTextColor;
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <div style={{
              width: 48, height: 48,
              borderRadius: '50%',
              border: `2px dashed currentColor`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              opacity: 0.6,
            }}>
              +
            </div>
            <div style={{
              fontSize: 14,
              fontWeight: 500,
              fontFamily: "'Noto Serif SC', serif",
            }}>
              创建新圈子
            </div>
            <div style={{
              fontSize: 11,
              opacity: 0.7,
            }}>
              还有 {maxCircles - createdCount} 个名额
            </div>
          </div>
        )}
      </div>

      {/* 底部哲学说明 */}
      <div style={{
        marginTop: 20,
        padding: '20px 24px',
        borderRadius: 14,
        background: isNight ? 'rgba(255,255,255,0.02)' : 'rgba(43, 42, 38, 0.02)',
        border: `1px solid ${isNight ? 'rgba(255,255,255,0.04)' : 'rgba(43, 42, 38, 0.04)'}`,
        textAlign: 'center',
        fontSize: 13,
        color: subTextColor,
        lineHeight: 1.8,
        fontFamily: "'Noto Serif SC', serif",
      }}>
        <p style={{ margin: '0 0 8px', color: textColor, fontWeight: 500 }}>
          圈子不是群聊
        </p>
        <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>
          圈子是围绕一个核心话题的共享知识库。<br />
          没有消息流、没有未读计数、没有@全体、没有表情包。<br />
          一个深度同频的10人圈子，胜过一个500人的大群。
        </p>
      </div>
    </div>
  );
}

function CircleCard({ circle, onClick, isNight, textColor, subTextColor }) {
  const members = CIRCLE_MEMBERS[circle.id] || [];
  const topics = CIRCLE_TOPICS[circle.id] || [];
  const activeTopics = topics.filter(t => !t.archived).length;

  return (
    <div
       onClick={onClick}
       style={{
         padding: '20px 22px',
         borderRadius: '20px',
         background: 'rgba(255, 255, 255, 0.72)',
         backdropFilter: 'blur(16px) saturate(180%)',
         WebkitBackdropFilter: 'blur(16px) saturate(180%)',
         border: '1.5px solid rgba(255, 255, 255, 0.9)',
         cursor: 'pointer',
         transition: 'all 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
         position: 'relative',
         overflow: 'hidden',
         boxShadow: '0 4px 16px rgba(45, 55, 72, 0.04)',
       }}
       onMouseEnter={(e) => {
         e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
         e.currentTarget.style.boxShadow = `0 16px 36px ${circle.color}25, 0 8px 20px rgba(45, 55, 72, 0.08)`;
         e.currentTarget.style.borderColor = `${circle.color}50`;
       }}
       onMouseLeave={(e) => {
         e.currentTarget.style.transform = 'translateY(0) scale(1)';
         e.currentTarget.style.boxShadow = '0 4px 16px rgba(45, 55, 72, 0.04)';
         e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.9)';
       }}
     >
       {/* 顶部色带 */}
       <div style={{
         position: 'absolute',
         top: 0, left: 0, right: 0,
         height: 5,
         background: `linear-gradient(90deg, ${circle.color}00, ${circle.color}, ${circle.color}00)`,
         opacity: 0.7,
       }} />

       {/* 头 */}
       <div style={{
         display: 'flex',
         alignItems: 'center',
         gap: 14,
         marginBottom: 14,
         marginTop: 6,
       }}>
         <div style={{
           width: 50, height: 50,
           borderRadius: '16px',
           background: `linear-gradient(145deg, ${circle.color}dd, ${circle.color})`,
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center',
           color: '#fff',
           fontSize: 22,
           flexShrink: 0,
           boxShadow: `0 6px 18px ${circle.color}50, inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -3px 8px rgba(0,0,0,0.1)`,
         }}>
           {circle.topicIcon}
         </div>
         <div style={{ flex: 1, minWidth: 0 }}>
           <div style={{
             fontSize: 16,
             fontWeight: 800,
             fontFamily: "'Poppins', 'Nunito', sans-serif",
             color: '#2D3748',
             marginBottom: 3,
             letterSpacing: -0.2,
           }}>
             {circle.name}
           </div>
           <div style={{
             fontSize: 12,
             color: '#7B8794',
             fontWeight: 600,
             fontFamily: "'Nunito', sans-serif",
           }}>
             {circle.topic}
           </div>
         </div>
       </div>

      {/* 描述 */}
      <div style={{
        fontSize: 12,
        color: subTextColor,
        lineHeight: 1.6,
        marginBottom: 16,
        minHeight: 38,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {circle.description}
      </div>

      {/* 成员头像组 */}
      <div style={{
        display: 'flex',
        marginBottom: 14,
      }}>
        {members.slice(0, 6).map((m, i) => (
          <div
            key={m.id}
            style={{
              width: 28, height: 28,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${circle.color}, ${circle.color}CC)`,
              border: `2px solid ${isNight ? '#262522' : '#FFFEFA'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 10,
              fontWeight: 500,
              marginLeft: i > 0 ? -8 : 0,
              fontFamily: "'Noto Serif SC', serif",
              zIndex: 6 - i,
            }}
          >
            {m.avatar}
          </div>
        ))}
        {members.length > 6 && (
          <div style={{
            width: 28, height: 28,
            borderRadius: '50%',
            background: isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.08)',
            border: `2px solid ${isNight ? '#262522' : '#FFFEFA'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: subTextColor,
            fontSize: 10,
            marginLeft: -8,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            +{members.length - 6}
          </div>
        )}
        <div style={{
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 11,
          color: subTextColor,
          opacity: 0.7,
        }}>
          {circle.memberCount}/{circle.maxMembers}人
        </div>
      </div>

      {/* 底部信息 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTop: `1px solid ${isNight ? 'rgba(255,255,255,0.04)' : 'rgba(43, 42, 38, 0.04)'}`,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <div style={{
            width: 6, height: 6,
            borderRadius: '50%',
            background: circle.timeWindow.isOpenNow ? '#5A7A4E' : '#8A8780',
          }} />
          <span style={{
            fontSize: 10,
            color: circle.timeWindow.isOpenNow ? '#5A7A4E' : subTextColor,
            fontFamily: "'Noto Serif SC', serif",
          }}>
            {circle.timeWindow.isOpenNow ? '开放中' : '未开放'}
          </span>
        </div>
        <span style={{
          fontSize: 10,
          color: subTextColor,
          opacity: 0.6,
        }}>
          {activeTopics} 个活跃话题
        </span>
      </div>
    </div>
  );
}

// ============================================
// 圈子主页 - 话题列表
// ============================================
function CircleTopicsView({ circle, isNight, textColor, subTextColor }) {
  const [sortBy, setSortBy] = React.useState('latest');
  const [selectedTopic, setSelectedTopic] = React.useState(null);
  const [showNewTopic, setShowNewTopic] = React.useState(false);

  const topics = CIRCLE_TOPICS[circle.id] || [];
  const pinnedTopics = topics.filter(t => t.pinned && !t.archived);
  const activeTopics = topics.filter(t => !t.pinned && !t.archived);
  const archivedTopics = topics.filter(t => t.archived);

  let displayTopics = [...pinnedTopics, ...activeTopics];

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '28px' }}>
      {/* 圈子信息栏 */}
      <div style={{
        padding: '20px 24px',
        borderRadius: 14,
        background: `linear-gradient(135deg, ${circle.color}10, transparent)`,
        border: `1px solid ${circle.color}20`,
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 52, height: 52,
            borderRadius: 14,
            background: `linear-gradient(135deg, ${circle.color}, ${circle.color}CC)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 24,
            flexShrink: 0,
            boxShadow: `0 4px 16px ${circle.color}30`,
          }}>
            {circle.topicIcon}
          </div>
          <div>
            <div style={{
              fontSize: 18,
              fontWeight: 500,
              color: textColor,
              fontFamily: "'Noto Serif SC', serif",
              marginBottom: 4,
            }}>
              {circle.name}
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 12,
              color: subTextColor,
            }}>
              <span>创建者：{circle.creator}</span>
              <span>·</span>
              <span>{circle.memberCount}/{circle.maxMembers} 人</span>
              <span>·</span>
              <span>{circle.stats.topics} 个话题</span>
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{
            padding: '6px 14px',
            borderRadius: 20,
            background: circle.timeWindow.isOpenNow
              ? 'rgba(90, 122, 78, 0.12)'
              : 'rgba(138, 135, 128, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            color: circle.timeWindow.isOpenNow ? '#5A7A4E' : '#8A8780',
          }}>
            <div style={{
              width: 6, height: 6,
              borderRadius: '50%',
              background: circle.timeWindow.isOpenNow ? '#5A7A4E' : '#8A8780',
            }} />
            {circle.timeWindow.label}
          </div>

          <button
            onClick={() => setShowNewTopic(true)}
            style={{
              padding: '10px 18px',
              borderRadius: 10,
              border: 'none',
              background: `linear-gradient(135deg, ${circle.color}, ${circle.color}CC)`,
              color: '#fff',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: "'Noto Serif SC', serif",
              boxShadow: `0 2px 12px ${circle.color}30`,
            }}
          >
            + 发起话题
          </button>
        </div>
      </div>

      {/* 排序栏 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
      }}>
        <div style={{
          display: 'flex',
          gap: 4,
        }}>
          {[
            { id: 'latest', label: '最新回复' },
            { id: 'hot', label: '最热讨论' },
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setSortBy(s.id)}
              style={{
                padding: '4px 14px',
                borderRadius: 6,
                border: 'none',
                background: sortBy === s.id ? `${circle.color}15` : 'transparent',
                color: sortBy === s.id ? circle.color : subTextColor,
                fontSize: 12,
                cursor: 'pointer',
                fontWeight: sortBy === s.id ? 500 : 400,
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div style={{
          fontSize: 11,
          color: subTextColor,
          opacity: 0.6,
        }}>
          共 {activeTopics.length + pinnedTopics.length} 个活跃话题
        </div>
      </div>

      {/* 话题列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
        {displayTopics.map(topic => (
          <TopicItem
            key={topic.id}
            topic={topic}
            circle={circle}
            onClick={() => setSelectedTopic(topic)}
            isNight={isNight}
            textColor={textColor}
            subTextColor={subTextColor}
          />
        ))}
      </div>

      {/* 已归档 */}
      {archivedTopics.length > 0 && (
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}>
            <h3 style={{
              fontSize: 13,
              fontWeight: 500,
              fontFamily: "'Noto Serif SC', serif",
              color: subTextColor,
              opacity: 0.8,
            }}>
              已归档 · {archivedTopics.length} 篇
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {archivedTopics.map(topic => (
              <TopicItem
                key={topic.id}
                topic={topic}
                circle={circle}
                archived
                onClick={() => setSelectedTopic(topic)}
                isNight={isNight}
                textColor={textColor}
                subTextColor={subTextColor}
              />
            ))}
          </div>
        </div>
      )}

      {/* 话题详情弹窗 */}
      {selectedTopic && (
        <TopicDetailDialog
          topic={selectedTopic}
          circle={circle}
          onClose={() => setSelectedTopic(null)}
          isNight={isNight}
          textColor={textColor}
          subTextColor={subTextColor}
        />
      )}

      {/* 发起话题弹窗 */}
      {showNewTopic && (
        <NewTopicDialog
          circle={circle}
          onClose={() => setShowNewTopic(false)}
          isNight={isNight}
          textColor={textColor}
          subTextColor={subTextColor}
        />
      )}
    </div>
  );
}

function TopicItem({ topic, circle, archived, onClick, isNight, textColor, subTextColor }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '16px 20px',
        borderRadius: 10,
        background: isNight ? '#262522' : '#FFFEFA',
        border: `1px solid ${isNight ? 'rgba(255,255,255,0.05)' : 'rgba(43, 42, 38, 0.05)'}`,
        cursor: 'pointer',
        opacity: archived ? 0.6 : 1,
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${circle.color}30`;
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = isNight ? 'rgba(255,255,255,0.05)' : 'rgba(43, 42, 38, 0.05)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flex: 1,
          minWidth: 0,
        }}>
          {topic.pinned && (
            <span style={{
              fontSize: 10,
              padding: '2px 8px',
              borderRadius: 8,
              background: `${circle.color}15`,
              color: circle.color,
              fontFamily: "'Noto Serif SC', serif",
              flexShrink: 0,
            }}>
              置顶
            </span>
          )}
          {archived && (
            <span style={{
              fontSize: 10,
              padding: '2px 8px',
              borderRadius: 8,
              background: isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)',
              color: subTextColor,
              fontFamily: "'Noto Serif SC', serif",
              flexShrink: 0,
            }}>
              已归档
            </span>
          )}
          <span style={{
            fontSize: 15,
            fontWeight: 500,
            fontFamily: "'Noto Serif SC', serif",
            color: textColor,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {topic.title}
          </span>
        </div>
      </div>

      <p style={{
        fontSize: 12,
        color: subTextColor,
        lineHeight: 1.6,
        margin: '0 0 12px',
        opacity: 0.8,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {topic.excerpt}
      </p>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <div style={{
            width: 22, height: 22,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${circle.color}, ${circle.color}AA)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 10,
            fontWeight: 500,
            fontFamily: "'Noto Serif SC', serif",
          }}>
            {topic.authorAvatar}
          </div>
          <span style={{
            fontSize: 11,
            color: textColor,
            fontFamily: "'Noto Serif SC', serif",
          }}>
            {topic.author}
          </span>
          <span style={{
            fontSize: 10,
            color: subTextColor,
            opacity: 0.6,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {topic.createdAt}
          </span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontSize: 11,
          color: subTextColor,
          opacity: 0.7,
        }}>
          <span>{topic.replyCount} 回复</span>
          <span>·</span>
          <span>{topic.lastUpdate}</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  CircleView,
  CircleListView,
  CircleCard,
  CircleTopicsView,
  TopicItem,
});
