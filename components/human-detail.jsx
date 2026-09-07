// ============================================
// 人类节点详情面板 + 邀请码视图 + 统计视图
// ============================================

// ============================================
// 人类节点详情面板
// ============================================
function HumanDetailPanel({ human, onClose, currentTopic, isNight, textColor, subTextColor }) {
  const [viewMode, setViewMode] = React.useState('topics'); // topics | history | intro

  const currentTopicInfo = human.topics.find(t => t.topicId === currentTopic);
  const topic = currentTopicInfo ? HUMAN_TOPICS.find(t => t.id === currentTopic) : null;

  // 引荐链
  const introChain = React.useMemo(() => {
    if (human.source !== 'introduced' || !human.introducedBy) return null;
    const chain = [human];
    let currentId = human.introducedBy;
    let depth = 0;
    while (currentId && depth < 5) {
      const person = HUMAN_NODES.find(h => h.id === currentId);
      if (!person) break;
      chain.unshift(person);
      if (person.source === 'direct' || !person.introducedBy) break;
      currentId = person.introducedBy;
      depth++;
    }
    return chain;
  }, [human]);

  // 沟通历史
  const history = COMMUNICATION_HISTORY[human.id] || [];

  return (
    <div style={{
      width: 420,
      flexShrink: 0,
      borderLeft: `1px solid ${isNight ? 'rgba(255,255,255,0.08)' : 'rgba(43, 42, 38, 0.08)'}`,
      background: isNight ? '#262522' : '#FFFEFA',
      display: 'flex',
      flexDirection: 'column',
      animation: 'slideInRight 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both',
      overflow: 'hidden',
    }}>
      {/* 头部 */}
      <div style={{
        padding: '24px 24px 18px',
        textAlign: 'center',
        background: topic
          ? `linear-gradient(180deg, ${topic.color}10, transparent)`
          : 'transparent',
        position: 'relative',
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

        {/* 圆形头像（人类节点的视觉特征） */}
        <div style={{
          width: 64, height: 64,
          borderRadius: '50%',
          background: topic
            ? `linear-gradient(135deg, ${topic.color}, ${topic.color}90)`
            : 'linear-gradient(135deg, #8A8780, #A9A69E)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 26,
          fontWeight: 500,
          margin: '0 auto 14px',
          fontFamily: "'Noto Serif SC', serif",
          boxShadow: topic ? `0 4px 16px ${topic.color}30` : 'none',
        }}>
          {human.avatar}
        </div>

        <h2 style={{
          fontSize: 20,
          fontWeight: 500,
          fontFamily: "'Noto Serif SC', serif",
          color: textColor,
          marginBottom: 4,
        }}>
          {human.name}
        </h2>
        <p style={{
          fontSize: 12,
          color: subTextColor,
          marginBottom: 12,
        }}>
          {human.role}
        </p>

        {/* 标签 */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 6,
          flexWrap: 'wrap',
          marginBottom: 12,
        }}>
          {human.tags.map(tag => (
            <span key={tag} style={{
              fontSize: 10,
              padding: '3px 10px',
              borderRadius: 12,
              background: isNight ? 'rgba(255,255,255,0.05)' : 'rgba(43, 42, 38, 0.05)',
              color: subTextColor,
              fontFamily: "'Noto Serif SC', serif",
            }}>
              {tag}
            </span>
          ))}
        </div>

        {/* 音色状态 */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 12px',
          borderRadius: 12,
          background: human.toneStatus === 'open'
            ? 'rgba(90, 122, 78, 0.1)'
            : human.toneStatus === 'silent'
              ? 'rgba(181, 107, 58, 0.1)'
              : 'rgba(138, 135, 128, 0.1)',
          fontSize: 11,
          color: human.toneStatus === 'open'
            ? '#5A7A4E'
            : human.toneStatus === 'silent'
              ? '#B56B3A'
              : '#8A8780',
          fontFamily: "'Noto Serif SC', serif",
        }}>
          <div style={{
            width: 5, height: 5,
            borderRadius: '50%',
            background: human.toneStatus === 'open'
              ? '#5A7A4E'
              : human.toneStatus === 'silent'
                ? '#B56B3A'
                : '#8A8780',
          }} />
          {human.toneStatus === 'open' && '音色开放'}
          {human.toneStatus === 'silent' && '音色静默'}
          {human.toneStatus === 'blocked' && '已屏蔽'}
        </div>
      </div>

      {/* View Tabs */}
      <div style={{
        display: 'flex',
        padding: '0 16px',
        borderBottom: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
        flexShrink: 0,
      }}>
        {[
          { id: 'topics', label: '话题链接' },
          { id: 'history', label: '沟通历史' },
          { id: 'intro', label: '关系来源' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setViewMode(tab.id)}
            style={{
              padding: '10px 14px',
              border: 'none',
              background: 'transparent',
              color: viewMode === tab.id ? textColor : subTextColor,
              fontSize: 12,
              fontWeight: viewMode === tab.id ? 500 : 400,
              cursor: 'pointer',
              position: 'relative',
              fontFamily: viewMode === tab.id ? "'Noto Serif SC', serif" : 'inherit',
              transition: 'color 0.15s ease',
            }}
          >
            {tab.label}
            {viewMode === tab.id && (
              <div style={{
                position: 'absolute',
                bottom: -1,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 20,
                height: 2,
                borderRadius: 1,
                background: topic?.color || '#4F46E5',
              }} />
            )}
          </button>
        ))}
      </div>

      {/* 内容区 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 20px',
      }}>
        {viewMode === 'topics' && (
          <TopicsLinkSection human={human} isNight={isNight} textColor={textColor} subTextColor={subTextColor} />
        )}
        {viewMode === 'history' && (
          <HistorySection human={human} history={history} isNight={isNight} textColor={textColor} subTextColor={subTextColor} />
        )}
        {viewMode === 'intro' && (
          <IntroSection human={human} chain={introChain} isNight={isNight} textColor={textColor} subTextColor={subTextColor} />
        )}
      </div>

      {/* 底部操作 */}
      <div style={{
        padding: '14px 20px',
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
          断开连接
        </button>
        <button
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: 8,
            border: 'none',
            background: topic
              ? `linear-gradient(135deg, ${topic.color}, ${topic.color}CC)`
              : '#4F46E5',
            color: '#fff',
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: "'Noto Serif SC', serif",
          }}
        >
          在此话题下沟通
        </button>
      </div>
    </div>
  );
}

// 话题链接部分
function TopicsLinkSection({ human, isNight, textColor, subTextColor }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{
        fontSize: 11,
        color: subTextColor,
        marginBottom: 4,
      }}>
        这个人出现在我的 {human.topics.length} 个话题中
      </div>
      {human.topics.map((t, i) => {
        const topicInfo = HUMAN_TOPICS.find(tp => tp.id === t.topicId);
        if (!topicInfo) return null;
        return (
          <div
            key={t.topicId}
            style={{
              padding: '14px 16px',
              borderRadius: 10,
              background: isNight ? `${topicInfo.color}08` : `${topicInfo.color}04`,
              border: `1px solid ${topicInfo.color}20`,
              borderLeft: `3px solid ${topicInfo.color}`,
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 10,
            }}>
              <div style={{
                width: 28, height: 28,
                borderRadius: 8,
                background: `linear-gradient(135deg, ${topicInfo.color}, ${topicInfo.color}90)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 13,
                flexShrink: 0,
              }}>
                {topicInfo.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: "'Noto Serif SC', serif",
                  color: textColor,
                }}>
                  {topicInfo.name}
                </div>
                <div style={{
                  fontSize: 10,
                  color: subTextColor,
                  opacity: 0.7,
                  marginTop: 1,
                }}>
                  {topicInfo.description}
                </div>
              </div>
            </div>

            {/* 关联度条 */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 10,
              color: subTextColor,
              marginBottom: 4,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              <span>关联度</span>
              <span style={{ color: topicInfo.color, fontWeight: 500 }}>{t.relevance}%</span>
            </div>
            <div style={{
              height: 4,
              borderRadius: 2,
              background: isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)',
              marginBottom: 10,
            }}>
              <div style={{
                width: `${t.relevance}%`,
                height: '100%',
                borderRadius: 2,
                background: topicInfo.color,
                transition: 'width 0.6s ease',
              }} />
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 10,
              color: subTextColor,
              opacity: 0.7,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              <span>{t.messageCount} 次沟通</span>
              <span>最近：{t.lastContact}</span>
            </div>

            <div style={{
              marginTop: 10,
              display: 'flex',
              gap: 8,
            }}>
              <button style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: 6,
                border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.1)'}`,
                background: 'transparent',
                color: subTextColor,
                fontSize: 11,
                cursor: 'pointer',
              }}>
                断开此话题
              </button>
              <button style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: 6,
                border: 'none',
                background: `${topicInfo.color}20`,
                color: topicInfo.color,
                fontSize: 11,
                cursor: 'pointer',
                fontWeight: 500,
              }}>
                进入话题沟通
              </button>
            </div>
          </div>
        );
      })}

      {/* 添加到更多话题 */}
      <button style={{
        padding: '10px 14px',
        borderRadius: 10,
        border: `1px dashed ${isNight ? 'rgba(255,255,255,0.2)' : 'rgba(43, 42, 38, 0.15)'}`,
        background: 'transparent',
        color: subTextColor,
        fontSize: 12,
        cursor: 'pointer',
        fontFamily: "'Noto Serif SC', serif",
      }}>
        + 添加到其他话题
      </button>
    </div>
  );
}

// 沟通历史部分
function HistorySection({ human, history, isNight, textColor, subTextColor }) {
  if (history.length === 0) {
    return (
      <div style={{
        padding: '40px 20px',
        textAlign: 'center',
        color: subTextColor,
        fontSize: 12,
        opacity: 0.6,
      }}>
        暂无沟通历史
      </div>
    );
  }

  // 按话题分组
  const byTopic = {};
  history.forEach(h => {
    if (!byTopic[h.topicId]) byTopic[h.topicId] = [];
    byTopic[h.topicId].push(h);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {Object.entries(byTopic).map(([topicId, docs]) => {
        const topic = HUMAN_TOPICS.find(t => t.id === topicId);
        return (
          <div key={topicId}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 8,
            }}>
              <span style={{ fontSize: 13, color: topic?.color, fontWeight: 500 }}>
                {topic?.icon}
              </span>
              <span style={{ fontSize: 12, color: textColor, fontFamily: "'Noto Serif SC', serif" }}>
                {topic?.name}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {docs.map(doc => (
                <div
                  key={doc.id}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: isNight ? 'rgba(255,255,255,0.03)' : 'rgba(43, 42, 38, 0.02)',
                    border: `1px solid ${isNight ? 'rgba(255,255,255,0.05)' : 'rgba(43, 42, 38, 0.05)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isNight
                      ? `${topic?.color}08`
                      : `${topic?.color}04`;
                    e.currentTarget.style.borderColor = `${topic?.color}25`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isNight ? 'rgba(255,255,255,0.03)' : 'rgba(43, 42, 38, 0.02)';
                    e.currentTarget.style.borderColor = isNight ? 'rgba(255,255,255,0.05)' : 'rgba(43, 42, 38, 0.05)';
                  }}
                >
                  <div style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: textColor,
                    marginBottom: 3,
                    fontFamily: "'Noto Serif SC', serif",
                  }}>
                    {doc.title}
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 10,
                    color: subTextColor,
                    opacity: 0.6,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    <span>{doc.date}</span>
                    <span>{doc.messages} 条消息</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 关系来源部分
function IntroSection({ human, chain, isNight, textColor, subTextColor }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {human.source === 'direct' && (
        <div style={{
          padding: '14px 16px',
          borderRadius: 10,
          background: isNight ? 'rgba(90, 122, 78, 0.08)' : 'rgba(90, 122, 78, 0.05)',
          border: `1px solid ${isNight ? 'rgba(90, 122, 78, 0.2)' : 'rgba(90, 122, 78, 0.15)'}`,
        }}>
          <div style={{
            fontSize: 12,
            color: '#5A7A4E',
            fontWeight: 500,
            marginBottom: 4,
            fontFamily: "'Noto Serif SC', serif",
          }}>
            直接添加
          </div>
          <div style={{ fontSize: 12, color: textColor, lineHeight: 1.6 }}>
            由你主动邀请加入话题，是你直接认识的人。
          </div>
        </div>
      )}

      {human.source === 'introduced' && chain && (
        <>
          <div style={{
            fontSize: 11,
            color: subTextColor,
          }}>
            引荐关系链：从你到 {human.name}
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 4,
            padding: '10px 0',
          }}>
            {/* 我 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <div style={{
                width: 32, height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #B56B3A, #D48A5A)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 13,
                fontWeight: 500,
                fontFamily: "'Noto Serif SC', serif",
              }}>
                我
              </div>
              <div style={{ fontSize: 13, color: textColor, fontWeight: 500 }}>我</div>
            </div>

            {/* 引荐链 */}
            {chain.map((person, idx) => {
              const isLast = idx === chain.length - 1;
              const topicColor = '#9B6BA0';
              return (
                <React.Fragment key={person.id}>
                  {/* 连接线 */}
                  <div style={{
                    marginLeft: 15,
                    width: 2,
                    height: 12,
                    background: `linear-gradient(180deg, #B56B3A, ${topicColor})`,
                    opacity: 0.5,
                  }} />
                  {/* 引荐文字 */}
                  <div style={{
                    marginLeft: 22,
                    fontSize: 10,
                    color: '#9B6BA0',
                    fontFamily: "'Noto Serif SC', serif",
                    marginBottom: 2,
                  }}>
                    {idx === 0 ? '直接认识' : '引荐'}
                  </div>
                  {/* 人 */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}>
                    <div style={{
                      width: isLast ? 36 : 32,
                      height: isLast ? 36 : 32,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${topicColor}, ${topicColor}90)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: isLast ? 14 : 13,
                      fontWeight: 500,
                      fontFamily: "'Noto Serif SC', serif",
                    }}>
                      {person.avatar}
                    </div>
                    <div>
                      <div style={{
                        fontSize: isLast ? 14 : 13,
                        fontWeight: isLast ? 600 : 500,
                        color: textColor,
                        fontFamily: "'Noto Serif SC', serif",
                      }}>
                        {person.name}
                      </div>
                      <div style={{
                        fontSize: 10,
                        color: subTextColor,
                        opacity: 0.7,
                      }}>
                        {person.role}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </>
      )}

      {human.source === 'stranger' && (
        <div style={{
          padding: '14px 16px',
          borderRadius: 10,
          background: isNight ? 'rgba(138, 135, 128, 0.1)' : 'rgba(138, 135, 128, 0.06)',
          border: `1px dashed ${isNight ? 'rgba(138, 135, 128, 0.3)' : 'rgba(138, 135, 128, 0.25)'}`,
        }}>
          <div style={{
            fontSize: 12,
            color: '#8A8780',
            fontWeight: 500,
            marginBottom: 4,
            fontFamily: "'Noto Serif SC', serif",
          }}>
            陌生人
          </div>
          <div style={{ fontSize: 12, color: textColor, lineHeight: 1.6 }}>
            还没有建立正式的话题连接。遵循全局陌生人规则。
          </div>
        </div>
      )}

      {/* 引荐深度信息 */}
      <div style={{
        padding: '12px 14px',
        borderRadius: 8,
        background: isNight ? 'rgba(255,255,255,0.03)' : 'rgba(43, 42, 38, 0.02)',
        fontSize: 11,
        color: subTextColor,
        lineHeight: 1.6,
      }}>
        <span style={{ fontFamily: "'Noto Serif SC', serif" }}>
          引荐深度：{chain ? chain.length : 0} 层
        </span>
        <br />
        关系越深的引荐，信任度越高，话题关联度通常也更准确。
      </div>
    </div>
  );
}

// ============================================
// 邀请码视图
// ============================================
function InvitesView({ topicId, isNight, textColor, subTextColor }) {
  const [showNewInvite, setShowNewInvite] = React.useState(false);
  const [selectedInvite, setSelectedInvite] = React.useState(null);
  const [activeFilter, setActiveFilter] = React.useState('all');

  const filteredCodes = React.useMemo(() => {
    let codes = INVITE_CODES;
    if (activeFilter === 'active') codes = codes.filter(c => c.status === 'active');
    else if (activeFilter === 'used') codes = codes.filter(c => c.status === 'used');
    else if (activeFilter === 'revoked') codes = codes.filter(c => c.status === 'revoked');
    return codes;
  }, [activeFilter]);

  const statusLabels = {
    active: { label: '有效', color: '#5A7A4E' },
    used: { label: '已使用', color: '#4F46E5' },
    revoked: { label: '已作废', color: '#8A8780' },
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* 顶部操作栏 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
      }}>
        <div style={{
          display: 'flex',
          gap: 4,
          background: isNight ? 'rgba(255,255,255,0.03)' : 'rgba(43, 42, 38, 0.03)',
          borderRadius: 8,
          padding: 3,
        }}>
          {[
            { id: 'all', label: '全部' },
            { id: 'active', label: '有效' },
            { id: 'used', label: '已使用' },
            { id: 'revoked', label: '已作废' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                border: 'none',
                background: activeFilter === f.id
                  ? (isNight ? 'rgba(255,255,255,0.06)' : '#fff')
                  : 'transparent',
                color: activeFilter === f.id ? textColor : subTextColor,
                fontSize: 12,
                fontWeight: activeFilter === f.id ? 500 : 400,
                cursor: 'pointer',
                fontFamily: activeFilter === f.id ? "'Noto Serif SC', serif" : 'inherit',
                boxShadow: activeFilter === f.id ? '0 1px 3px rgba(0,0,0,0.04)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowNewInvite(true)}
          style={{
            padding: '8px 18px',
            borderRadius: 8,
            border: `1px solid #4F46E540`,
            background: '#4F46E510',
            color: '#4F46E5',
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: "'Noto Serif SC', serif",
          }}
        >
          + 生成邀请码
        </button>
      </div>

      {/* 邀请码列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filteredCodes.map(code => {
          const topic = HUMAN_TOPICS.find(t => t.id === code.topicId);
          const status = statusLabels[code.status];
          return (
            <div
              key={code.id}
              onClick={() => setSelectedInvite(code)}
              style={{
                padding: '16px 20px',
                borderRadius: 12,
                background: isNight ? '#262522' : '#FFFEFA',
                border: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${topic?.color || '#4F46E5'}30`;
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.04)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* 二维码占位 */}
              <div style={{
                width: 52, height: 52,
                borderRadius: 8,
                background: isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                fontFamily: "'JetBrains Mono', monospace",
                color: topic?.color || '#4F46E5',
                flexShrink: 0,
                border: `1px dashed ${topic?.color || '#4F46E5'}30`,
              }}>
                {code.qrCode}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 4,
                }}>
                  <span style={{
                    fontSize: 14,
                    fontWeight: 500,
                    fontFamily: "'JetBrains Mono', monospace",
                    color: textColor,
                    fontSize: 13,
                  }}>
                    {code.code}
                  </span>
                  <span style={{
                    fontSize: 10,
                    padding: '2px 8px',
                    borderRadius: 10,
                    background: `${status.color}15`,
                    color: status.color,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    {status.label}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 11,
                  color: subTextColor,
                  opacity: 0.8,
                }}>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}>
                    <span style={{ color: topic?.color }}>{topic?.icon}</span>
                    {code.topicName}
                  </span>
                  <span>·</span>
                  <span>{code.permissionLevel}</span>
                  <span>·</span>
                  <span>{code.usedCount}/{code.usageLimit === '多次' ? '∞' : code.usageLimit}</span>
                </div>
              </div>

              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{
                  fontSize: 10,
                  color: subTextColor,
                  marginBottom: 3,
                  fontFamily: "'JetBrains Mono', monospace",
                  opacity: 0.7,
                }}>
                  有效期至
                </div>
                <div style={{
                  fontSize: 12,
                  color: textColor,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  {code.expiresAt}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 生成邀请码弹窗 */}
      {showNewInvite && (
        <NewInviteDialog
          topicId={topicId}
          onClose={() => setShowNewInvite(false)}
          isNight={isNight}
          textColor={textColor}
          subTextColor={subTextColor}
        />
      )}

      {/* 邀请码详情弹窗 */}
      {selectedInvite && (
        <InviteDetailDialog
          invite={selectedInvite}
          onClose={() => setSelectedInvite(null)}
          isNight={isNight}
          textColor={textColor}
          subTextColor={subTextColor}
        />
      )}
    </div>
  );
}

// 生成邀请码对话框
function NewInviteDialog({ topicId, onClose, isNight, textColor, subTextColor }) {
  const topic = HUMAN_TOPICS.find(t => t.id === topicId);
  const [permission, setPermission] = React.useState('兴趣圈');
  const [validity, setValidity] = React.useState('7天');
  const [usageLimit, setUsageLimit] = React.useState('多次');
  const [generated, setGenerated] = React.useState(false);
  const [newCode, setNewCode] = React.useState('');
  const [bindTopic, setBindTopic] = React.useState(true); // true=绑定话题，false=通用邀请

  const handleGenerate = () => {
    const prefix = bindTopic ? (topic?.name?.slice(0, 3).toUpperCase() || 'INV') : 'ONEOS';
    const code = `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    setNewCode(code);
    setGenerated(true);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(4px)',
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
          width: 440,
          background: isNight ? '#2A2925' : '#FFFEFA',
          borderRadius: 16,
          border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.08)'}`,
          boxShadow: '0 30px 80px rgba(0,0,0,0.2)',
          overflow: 'hidden',
          animation: 'fadeInUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both',
        }}
      >
        <div style={{
          padding: '20px 24px 16px',
          background: topic ? `linear-gradient(135deg, ${topic.color}10, transparent)` : 'transparent',
        }}>
          <h3 style={{
            fontSize: 17,
            fontWeight: 600,
            fontFamily: "'Noto Serif SC', serif",
            color: textColor,
            marginBottom: 6,
          }}>
            邀请一个人加入
          </h3>
          <p style={{
            fontSize: 12,
            color: subTextColor,
            lineHeight: 1.6,
            margin: 0,
          }}>
            OneOS 不使用「加好友」模式。你是在某个话题下邀请一个人，<br />
            你们的所有沟通都会围绕这个话题展开，自动归档。
          </p>
        </div>

        <div style={{ padding: '0 24px 20px' }}>
          {/* 是否绑定话题 */}
          <div style={{ marginBottom: 16 }}>
            <label style={{
              fontSize: 11,
              color: subTextColor,
              marginBottom: 8,
              display: 'block',
            }}>
              邀请方式
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label
                onClick={() => setBindTopic(true)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: `1px solid ${bindTopic
                    ? (topic?.color ? topic.color + '40' : '#4F46E540')
                    : (isNight ? 'rgba(255,255,255,0.08)' : 'rgba(43, 42, 38, 0.08)')}`,
                  background: bindTopic
                    ? (topic?.color ? topic.color + '10' : '#4F46E510')
                    : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{
                  width: 16, height: 16,
                  borderRadius: '50%',
                  border: `2px solid ${bindTopic ? (topic?.color || '#4F46E5') : subTextColor}`,
                  flexShrink: 0,
                  marginTop: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {bindTopic && <div style={{
                    width: 8, height: 8,
                    borderRadius: '50%',
                    background: topic?.color || '#4F46E5',
                  }} />}
                </div>
                <div>
                  <div style={{
                    fontSize: 12.5,
                    fontWeight: 500,
                    fontFamily: "'Noto Serif SC', serif",
                    color: bindTopic ? textColor : subTextColor,
                    marginBottom: 2,
                  }}>
                    绑定话题邀请
                    {topic && (
                      <span style={{
                        marginLeft: 6,
                        fontSize: 11,
                        color: topic.color,
                        fontWeight: 400,
                      }}>
                        · {topic.name}
                      </span>
                    )}
                  </div>
                  <div style={{
                    fontSize: 10.5,
                    color: subTextColor,
                    opacity: 0.7,
                    lineHeight: 1.4,
                  }}>
                    对方通过后直接出现在这个话题的人脉中，你们的沟通自动归档到该话题下。
                  </div>
                </div>
              </label>

              <label
                onClick={() => setBindTopic(false)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: `1px solid ${!bindTopic
                    ? '#4F46E540'
                    : (isNight ? 'rgba(255,255,255,0.08)' : 'rgba(43, 42, 38, 0.08)')}`,
                  background: !bindTopic ? '#4F46E510' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{
                  width: 16, height: 16,
                  borderRadius: '50%',
                  border: `2px solid ${!bindTopic ? '#4F46E5' : subTextColor}`,
                  flexShrink: 0,
                  marginTop: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {!bindTopic && <div style={{
                    width: 8, height: 8,
                    borderRadius: '50%',
                    background: '#4F46E5',
                  }} />}
                </div>
                <div>
                  <div style={{
                    fontSize: 12.5,
                    fontWeight: 500,
                    fontFamily: "'Noto Serif SC', serif",
                    color: !bindTopic ? textColor : subTextColor,
                    marginBottom: 2,
                  }}>
                    通用邀请
                  </div>
                  <div style={{
                    fontSize: 10.5,
                    color: subTextColor,
                    opacity: 0.7,
                    lineHeight: 1.4,
                  }}>
                    不绑定具体话题，对方接受后由对方选择从哪个话题开始连接。
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* 权限层级 */}
          <div style={{ marginBottom: 16 }}>
            <label style={{
              fontSize: 11,
              color: subTextColor,
              marginBottom: 6,
              display: 'block',
            }}>
              权限层级
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['核心圈', '合作圈', '兴趣圈'].map(p => (
                <button
                  key={p}
                  onClick={() => setPermission(p)}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    borderRadius: 8,
                    border: `1px solid ${permission === p
                      ? (p === '核心圈' ? '#5A7A4E40' : p === '合作圈' ? '#4F46E540' : '#B56B3A40')
                      : (isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.1)')}`,
                    background: permission === p
                      ? (p === '核心圈' ? '#5A7A4E15' : p === '合作圈' ? '#4F46E515' : '#B56B3A15')
                      : 'transparent',
                    color: permission === p
                      ? (p === '核心圈' ? '#5A7A4E' : p === '合作圈' ? '#4F46E5' : '#B56B3A')
                      : subTextColor,
                    fontSize: 12,
                    cursor: 'pointer',
                    fontFamily: "'Noto Serif SC', serif",
                    fontWeight: permission === p ? 500 : 400,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* 有效期 */}
          <div style={{ marginBottom: 16 }}>
            <label style={{
              fontSize: 11,
              color: subTextColor,
              marginBottom: 6,
              display: 'block',
            }}>
              有效期
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['1天', '7天', '30天', '永久'].map(v => (
                <button
                  key={v}
                  onClick={() => setValidity(v)}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    borderRadius: 8,
                    border: `1px solid ${validity === v
                      ? '#4F46E540'
                      : (isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.1)')}`,
                    background: validity === v ? '#4F46E515' : 'transparent',
                    color: validity === v ? '#4F46E5' : subTextColor,
                    fontSize: 12,
                    cursor: 'pointer',
                    fontWeight: validity === v ? 500 : 400,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* 使用次数 */}
          <div style={{ marginBottom: 20 }}>
            <label style={{
              fontSize: 11,
              color: subTextColor,
              marginBottom: 6,
              display: 'block',
            }}>
              使用限制
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['单次', '多次'].map(u => (
                <button
                  key={u}
                  onClick={() => setUsageLimit(u)}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    borderRadius: 8,
                    border: `1px solid ${usageLimit === u
                      ? '#4F46E540'
                      : (isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.1)')}`,
                    background: usageLimit === u ? '#4F46E515' : 'transparent',
                    color: usageLimit === u ? '#4F46E5' : subTextColor,
                    fontSize: 12,
                    cursor: 'pointer',
                    fontWeight: usageLimit === u ? 500 : 400,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          {/* 生成结果 */}
          {generated && (
            <div style={{
              padding: '16px',
              borderRadius: 12,
              background: isNight ? 'rgba(90, 122, 78, 0.08)' : 'rgba(90, 122, 78, 0.05)',
              border: `1px solid ${isNight ? 'rgba(90, 122, 78, 0.25)' : 'rgba(90, 122, 78, 0.15)'}`,
              marginBottom: 16,
              animation: 'fadeIn 0.3s ease both',
            }}>
              <div style={{
                fontSize: 11,
                color: '#5A7A4E',
                marginBottom: 12,
                fontFamily: "'Noto Serif SC', serif",
                fontWeight: 500,
              }}>
                ✓ 邀请码已生成 · {validity}有效
              </div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                {/* 二维码 */}
                <div style={{
                  width: 96, height: 96,
                  borderRadius: 10,
                  background: '#fff',
                  padding: 8,
                  flexShrink: 0,
                }}>
                  {/* 模拟二维码图案 */}
                  <svg width="100%" height="100%" viewBox="0 0 100 100">
                    <rect width="100" height="100" fill="#fff" />
                    {/* 三个定位角 */}
                    <rect x="5" y="5" width="25" height="25" fill="#1a1a2e" rx="2" />
                    <rect x="10" y="10" width="15" height="15" fill="#fff" />
                    <rect x="14" y="14" width="7" height="7" fill="#1a1a2e" />
                    <rect x="70" y="5" width="25" height="25" fill="#1a1a2e" rx="2" />
                    <rect x="75" y="10" width="15" height="15" fill="#fff" />
                    <rect x="79" y="14" width="7" height="7" fill="#1a1a2e" />
                    <rect x="5" y="70" width="25" height="25" fill="#1a1a2e" rx="2" />
                    <rect x="10" y="75" width="15" height="15" fill="#fff" />
                    <rect x="14" y="79" width="7" height="7" fill="#1a1a2e" />
                    {/* 数据点（伪） */}
                    {Array.from({ length: 20 }).map((_, i) => (
                      <rect
                        key={i}
                        x={35 + (i % 7) * 5}
                        y={35 + Math.floor(i / 7) * 10}
                        width="3" height="3"
                        fill="#1a1a2e"
                        opacity={0.7 + Math.random() * 0.3}
                      />
                    ))}
                    {Array.from({ length: 15 }).map((_, i) => (
                      <rect
                        key={'b'+i}
                        x={35 + (i * 3) % 30}
                        y={65 + Math.floor(i / 6) * 5}
                        width="3" height="3"
                        fill="#1a1a2e"
                        opacity={0.6 + Math.random() * 0.4}
                      />
                    ))}
                    {Array.from({ length: 12 }).map((_, i) => (
                      <rect
                        key={'c'+i}
                        x={65 + (i % 4) * 5}
                        y={40 + Math.floor(i / 4) * 5}
                        width="3" height="3"
                        fill="#1a1a2e"
                        opacity={0.5 + Math.random() * 0.5}
                      />
                    ))}
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 10.5,
                    color: subTextColor,
                    marginBottom: 4,
                  }}>
                    邀请码
                  </div>
                  <div style={{
                    fontSize: 15,
                    fontWeight: 600,
                    fontFamily: "'JetBrains Mono', monospace",
                    color: textColor,
                    letterSpacing: 1,
                    marginBottom: 8,
                  }}>
                    {newCode}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => { navigator.clipboard?.writeText(newCode); }}
                      style={{
                        padding: '5px 10px',
                        borderRadius: 6,
                        border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.1)'}`,
                        background: isNight ? 'rgba(255,255,255,0.06)' : '#fff',
                        color: subTextColor,
                        fontSize: 10.5,
                        cursor: 'pointer',
                      }}
                    >
                      复制邀请码
                    </button>
                    <button
                      style={{
                        padding: '5px 10px',
                        borderRadius: 6,
                        border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.1)'}`,
                        background: isNight ? 'rgba(255,255,255,0.06)' : '#fff',
                        color: subTextColor,
                        fontSize: 10.5,
                        cursor: 'pointer',
                      }}
                    >
                      下载二维码
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: 8,
                border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.1)'}`,
                background: 'transparent',
                color: subTextColor,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              取消
            </button>
            {!generated ? (
              <button
                onClick={handleGenerate}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 8,
                  border: 'none',
                  background: topic
                    ? `linear-gradient(135deg, ${topic.color}, ${topic.color}CC)`
                    : '#4F46E5',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: "'Noto Serif SC', serif",
                }}
              >
                生成邀请码
              </button>
            ) : (
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#5A7A4E',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: "'Noto Serif SC', serif",
                }}
              >
                完成
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 邀请码详情对话框
function InviteDetailDialog({ invite, onClose, isNight, textColor, subTextColor }) {
  const topic = HUMAN_TOPICS.find(t => t.id === invite.topicId);
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const statusLabels = {
    active: { label: '有效', color: '#5A7A4E' },
    used: { label: '已使用', color: '#4F46E5' },
    revoked: { label: '已作废', color: '#8A8780' },
  };
  const status = statusLabels[invite.status];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(4px)',
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
          width: 380,
          background: isNight ? '#2A2925' : '#FFFEFA',
          borderRadius: 16,
          border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.08)'}`,
          boxShadow: '0 30px 80px rgba(0,0,0,0.2)',
          overflow: 'hidden',
          animation: 'fadeInUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both',
        }}
      >
        <div style={{
          padding: '28px',
          textAlign: 'center',
        }}>
          {/* 二维码 */}
          <div style={{
            width: 140, height: 140,
            margin: '0 auto 16px',
            borderRadius: 12,
            background: isNight ? '#fff' : '#fff',
            border: `1px solid ${topic?.color || '#4F46E5'}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 48,
            fontFamily: "'JetBrains Mono', monospace",
            color: topic?.color || '#4F46E5',
            letterSpacing: 8,
            padding: 16,
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          }}>
            {invite.qrCode}
          </div>

          {/* 邀请码 */}
          <div style={{
            fontSize: 18,
            fontWeight: 600,
            fontFamily: "'JetBrains Mono', monospace",
            color: textColor,
            letterSpacing: 2,
            marginBottom: 8,
          }}>
            {invite.code}
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 10,
            marginBottom: 16,
          }}>
            <span style={{
              fontSize: 10,
              padding: '3px 10px',
              borderRadius: 10,
              background: `${status.color}15`,
              color: status.color,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {status.label}
            </span>
            <span style={{
              fontSize: 11,
              color: topic?.color,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}>
              {topic?.icon} {invite.topicName}
            </span>
          </div>

          {/* 详细信息 */}
          <div style={{
            textAlign: 'left',
            padding: '14px 16px',
            borderRadius: 10,
            background: isNight ? 'rgba(255,255,255,0.03)' : 'rgba(43, 42, 38, 0.02)',
            marginBottom: 16,
          }}>
            {[
              { label: '权限层级', value: invite.permissionLevel },
              { label: '使用限制', value: `${invite.usedCount} / ${invite.usageLimit === '多次' ? '无限次' : invite.usageLimit}` },
              { label: '创建时间', value: invite.createdAt },
              { label: '过期时间', value: invite.expiresAt },
            ].map(item => (
              <div key={item.label} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '4px 0',
                fontSize: 12,
              }}>
                <span style={{ color: subTextColor }}>{item.label}</span>
                <span style={{ color: textColor, fontFamily: "'Noto Serif SC', serif" }}>{item.value}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleCopy}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: 8,
                border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.1)'}`,
                background: 'transparent',
                color: copied ? '#5A7A4E' : subTextColor,
                fontSize: 12,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {copied ? '✓ 已复制' : '复制邀请码'}
            </button>
            {invite.status === 'active' && (
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 8,
                  border: '1px solid #C8323230',
                  background: '#C8323210',
                  color: '#C83232',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                作废邀请码
              </button>
            )}
            {invite.status !== 'active' && (
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 8,
                  border: 'none',
                  background: topic
                    ? `linear-gradient(135deg, ${topic.color}, ${topic.color}CC)`
                    : '#4F46E5',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                关闭
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 人类节点统计视图
// ============================================
function HumanStatsView({ isNight, textColor, subTextColor }) {
  const stats = HUMAN_STATS;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* 核心指标 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12,
        marginBottom: 24,
      }}>
        <StatBlock label="人类节点总数" value={stats.totalNodes} unit="位"
          isNight={isNight} textColor={textColor} subTextColor={subTextColor} />
        <StatBlock label="话题链接总数" value={stats.totalTopicLinks} unit="个"
          isNight={isNight} textColor={textColor} subTextColor={subTextColor} />
        <StatBlock label="人均话题数" value={stats.avgTopicsPerPerson} unit="个"
          isNight={isNight} textColor={textColor} subTextColor={subTextColor} />
        <StatBlock label="引荐最大深度" value={stats.introDepth} unit="层"
          isNight={isNight} textColor={textColor} subTextColor={subTextColor} />
      </div>

      {/* 话题分布 */}
      <div style={{
        padding: '20px 24px',
        borderRadius: 14,
        background: isNight ? 'rgba(255,255,255,0.03)' : '#FFFEFA',
        border: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
        marginBottom: 20,
      }}>
        <h3 style={{
          fontSize: 14,
          fontWeight: 500,
          fontFamily: "'Noto Serif SC', serif",
          color: textColor,
          marginBottom: 16,
        }}>
          各话题节点分布
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {stats.breakdownByTopic.map(item => {
            const topic = HUMAN_TOPICS.find(t => t.name === item.topic);
            const color = topic?.color || '#8A8780';
            const maxCount = Math.max(...stats.breakdownByTopic.map(b => b.count));
            const pct = (item.count / maxCount) * 100;
            return (
              <div key={item.topic}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 5,
                }}>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 12,
                    color: textColor,
                  }}>
                    <span style={{ color, fontSize: 14 }}>{topic?.icon || '•'}</span>
                    {item.topic}
                  </span>
                  <span style={{
                    fontSize: 11,
                    color: subTextColor,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    {item.count} 位
                  </span>
                </div>
                <div style={{
                  height: 6,
                  borderRadius: 3,
                  background: isNight ? 'rgba(255,255,255,0.04)' : 'rgba(43, 42, 38, 0.04)',
                }}>
                  <div style={{
                    width: `${pct}%`,
                    height: '100%',
                    borderRadius: 3,
                    background: `linear-gradient(90deg, ${color}, ${color}DD)`,
                    transition: 'width 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 音色状态分布 + 引荐关系图 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12,
      }}>
        {/* 音色状态 */}
        <div style={{
          padding: '18px 20px',
          borderRadius: 12,
          background: isNight ? 'rgba(255,255,255,0.03)' : '#FFFEFA',
          border: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
        }}>
          <h3 style={{
            fontSize: 13,
            fontWeight: 500,
            fontFamily: "'Noto Serif SC', serif",
            color: textColor,
            marginBottom: 14,
          }}>
            音色状态分布
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: '音色开放', count: stats.toneStatus.open, color: '#5A7A4E', desc: '可以接收语音消息' },
              { label: '音色静默', count: stats.toneStatus.silent, color: '#B56B3A', desc: '仅文字沟通' },
              { label: '已屏蔽', count: stats.toneStatus.blocked, color: '#8A8780', desc: '暂停或已断开' },
            ].map(item => (
              <div key={item.label} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}>
                <div style={{
                  width: 8, height: 8,
                  borderRadius: '50%',
                  background: item.color,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 12,
                    color: textColor,
                  }}>
                    <span>{item.label}</span>
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: subTextColor,
                      fontSize: 11,
                    }}>
                      {item.count}
                    </span>
                  </div>
                  <div style={{
                    fontSize: 10,
                    color: subTextColor,
                    opacity: 0.6,
                  }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 引荐关系总览 */}
        <div style={{
          padding: '18px 20px',
          borderRadius: 12,
          background: isNight ? 'rgba(255,255,255,0.03)' : '#FFFEFA',
          border: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
        }}>
          <h3 style={{
            fontSize: 13,
            fontWeight: 500,
            fontFamily: "'Noto Serif SC', serif",
            color: textColor,
            marginBottom: 14,
          }}>
            引荐关系网络
          </h3>
          <div style={{
            fontSize: 11,
            color: subTextColor,
            lineHeight: 1.7,
            marginBottom: 12,
          }}>
            {HUMAN_NODES.filter(h => h.source === 'direct').length} 位直接认识 · {HUMAN_NODES.filter(h => h.source === 'introduced').length} 位通过引荐
          </div>
          {/* 简化的关系图 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '10px 0',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 36, height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #B56B3A, #D48A5A)',
                margin: '0 auto 4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 14,
                fontWeight: 500,
                fontFamily: "'Noto Serif SC', serif",
              }}>
                我
              </div>
              <div style={{ fontSize: 10, color: subTextColor }}>自我</div>
            </div>
            <div style={{
              fontSize: 14,
              color: '#5A7A4E',
              fontWeight: 600,
            }}>
              ──
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 36, height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #5A7A4E, #7A9A6E)',
                margin: '0 auto 4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 12,
              }}>
                直
              </div>
              <div style={{ fontSize: 10, color: subTextColor }}>直接</div>
            </div>
            <div style={{
              fontSize: 14,
              color: '#9B6BA0',
              fontWeight: 600,
            }}>
              ~~
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 36, height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #9B6BA0, #BB8BC0)',
                margin: '0 auto 4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 12,
              }}>
                引
              </div>
              <div style={{ fontSize: 10, color: subTextColor }}>引荐</div>
            </div>
          </div>
          <div style={{
            fontSize: 10,
            color: subTextColor,
            textAlign: 'center',
            fontStyle: 'italic',
            opacity: 0.7,
            fontFamily: "'Noto Serif SC', serif",
            marginTop: 4,
          }}>
            最深 {stats.introDepth} 层引荐关系
          </div>
        </div>
      </div>

      {/* 底部说明 */}
      <div style={{
        marginTop: 20,
        padding: '16px 20px',
        borderRadius: 12,
        background: isNight ? 'rgba(255,255,255,0.02)' : 'rgba(43, 42, 38, 0.02)',
        border: `1px solid ${isNight ? 'rgba(255,255,255,0.04)' : 'rgba(43, 42, 38, 0.04)'}`,
        fontSize: 12,
        color: subTextColor,
        lineHeight: 1.7,
        fontFamily: "'Noto Serif SC', serif",
      }}>
        <p style={{ margin: '0 0 8px', color: textColor, fontWeight: 500 }}>
          关于这些数据
        </p>
        <p style={{ margin: 0, opacity: 0.8 }}>
          这些数字只是对你社交网络的一个客观描述，不代表好坏。
          关系的质量远比数量重要。一个深度同频的人，胜过一百个点头之交。
        </p>
      </div>
    </div>
  );
}

function StatBlock({ label, value, unit, isNight, textColor, subTextColor }) {
  return (
    <div style={{
      padding: '14px 16px',
      borderRadius: 10,
      background: isNight ? 'rgba(255,255,255,0.03)' : '#FFFEFA',
      border: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
    }}>
      <div style={{
        fontSize: 10,
        color: subTextColor,
        marginBottom: 6,
        fontFamily: "'Noto Serif SC', serif",
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 24,
        fontWeight: 600,
        fontFamily: "'Noto Serif SC', serif",
        color: textColor,
        lineHeight: 1.2,
      }}>
        {value}
        <span style={{
          fontSize: 12,
          fontWeight: 400,
          color: subTextColor,
          marginLeft: 2,
        }}>
          {unit}
        </span>
      </div>
    </div>
  );
}

Object.assign(window, {
  HumanDetailPanel,
  TopicsLinkSection,
  HistorySection,
  IntroSection,
  InvitesView,
  NewInviteDialog,
  InviteDetailDialog,
  HumanStatsView,
  StatBlock,
});
