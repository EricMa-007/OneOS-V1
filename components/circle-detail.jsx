// ============================================
// 话题详情 + 创建圈子 + 新话题 + 成员 + 知识库 + 统计
// ============================================

// ============================================
// 话题详情对话框
// ============================================
function TopicDetailDialog({ topic, circle, onClose, isNight, textColor, subTextColor }) {
  const detail = TOPIC_DETAILS[topic.id];
  const contentLines = detail?.content || [topic.excerpt];
  const replies = detail?.replies || [];
  const [archived, setArchived] = React.useState(topic.archived || false);

  const handleArchive = () => {
    if (archived) return;
    setArchived(true);
    // 全局联动：圈子话题归档
    window.OneOSAppState.archiveCircleTopic({
      circleId: circle?.id,
      circleName: circle?.name,
      topicTitle: topic.title,
      content: contentLines.join('\n'),
    });
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
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
          width: 720,
          maxWidth: '90vw',
          maxHeight: '85vh',
          background: isNight ? '#2A2925' : '#FFFEFA',
          borderRadius: 16,
          border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.08)'}`,
          boxShadow: '0 30px 80px rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeInUp 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) both',
        }}
      >
        {/* 头部 */}
        <div style={{
          padding: '20px 28px 16px',
          borderBottom: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 20,
        }}>
          <div style={{ flex: 1 }}>
            <h2 style={{
              fontSize: 20,
              fontWeight: 600,
              fontFamily: "'Noto Serif SC', serif",
              color: textColor,
              marginBottom: 10,
              lineHeight: 1.4,
            }}>
              {topic.title}
            </h2>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <div style={{
                  width: 24, height: 24,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${circle.color}, ${circle.color}AA)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 500,
                  fontFamily: "'Noto Serif SC', serif",
                }}>
                  {topic.authorAvatar}
                </div>
                <span style={{ fontSize: 12, color: textColor, fontFamily: "'Noto Serif SC', serif" }}>
                  {topic.author}
                </span>
              </div>
              <span style={{ fontSize: 11, color: subTextColor, opacity: 0.6 }}>
                {topic.createdAt}
              </span>
              {topic.tags.map(tag => (
                <span key={tag} style={{
                  fontSize: 10,
                  padding: '2px 10px',
                  borderRadius: 10,
                  background: `${circle.color}12`,
                  color: circle.color,
                  fontFamily: "'Noto Serif SC', serif",
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 32, height: 32,
              borderRadius: '50%',
              border: 'none',
              background: isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)',
              color: subTextColor,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* 正文 */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 28px',
        }}>
          {/* Markdown 内容 */}
          <div style={{
            fontSize: 14,
            lineHeight: 2,
            color: textColor,
            fontFamily: "'Noto Serif SC', serif",
            marginBottom: 32,
          }}>
            {contentLines.map((line, i) => {
              if (line.startsWith('# ')) {
                return <h1 key={i} style={{
                  fontSize: 22,
                  fontWeight: 600,
                  margin: '0 0 16px',
                  color: textColor,
                }}>{line.slice(2)}</h1>;
              }
              if (line.startsWith('## ')) {
                return <h2 key={i} style={{
                  fontSize: 17,
                  fontWeight: 600,
                  margin: '24px 0 12px',
                  color: circle.color,
                }}>{line.slice(3)}</h2>;
              }
              if (line.startsWith('- ')) {
                return <div key={i} style={{
                  paddingLeft: 20,
                  position: 'relative',
                  margin: '6px 0',
                }}>
                  <span style={{
                    position: 'absolute',
                    left: 6,
                    color: circle.color,
                  }}>·</span>
                  {line.slice(2)}
                </div>;
              }
              if (/^\d+\. /.test(line)) {
                return <div key={i} style={{
                  paddingLeft: 24,
                  position: 'relative',
                  margin: '6px 0',
                }}>
                  <span style={{
                    position: 'absolute',
                    left: 0,
                    color: circle.color,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 12,
                  }}>{line.match(/^\d+/)[0]}.</span>
                  {line.replace(/^\d+\. /, '')}
                </div>;
              }
              if (line.startsWith('**') && line.endsWith('**')) {
                return <p key={i} style={{ margin: '12px 0', fontWeight: 600 }}>
                  {line.slice(2, -2)}
                </p>;
              }
              if (line.startsWith('---')) {
                return <hr key={i} style={{
                  border: 'none',
                  borderTop: `1px solid ${isNight ? 'rgba(255,255,255,0.08)' : 'rgba(43, 42, 38, 0.08)'}`,
                  margin: '20px 0',
                }} />;
              }
              if (line.startsWith('*') && line.endsWith('*')) {
                return <p key={i} style={{ margin: '10px 0', fontStyle: 'italic', color: subTextColor }}>
                  {line.slice(1, -1)}
                </p>;
              }
              if (line === '') {
                return <div key={i} style={{ height: 8 }} />;
              }
              return <p key={i} style={{ margin: '10px 0' }}>{line}</p>;
            })}
          </div>

          {/* 操作栏 */}
          <div style={{
            display: 'flex',
            gap: 8,
            marginBottom: 28,
            paddingBottom: 20,
            borderBottom: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
          }}>
            <button style={{
              padding: '6px 14px',
              borderRadius: 8,
              border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.1)'}`,
              background: 'transparent',
              color: subTextColor,
              fontSize: 12,
              cursor: 'pointer',
            }}>
              置顶
            </button>
            <button
            onClick={handleArchive}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.1)'}`,
              background: archived ? 'rgba(90, 122, 78, 0.15)' : 'transparent',
              color: archived ? '#5A7A4E' : subTextColor,
              fontSize: 12,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}>
            {archived ? '✓ 已归档' : '归档'}
            </button>
            <button style={{
              padding: '6px 14px',
              borderRadius: 8,
              border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.1)'}`,
              background: 'transparent',
              color: subTextColor,
              fontSize: 12,
              cursor: 'pointer',
            }}>
              导出 MD
            </button>
            <div style={{ marginLeft: 'auto' }} />
            <button style={{
              padding: '6px 14px',
              borderRadius: 8,
              border: `1px solid ${circle.color}30`,
              background: `${circle.color}10`,
              color: circle.color,
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: "'Noto Serif SC', serif",
            }}>
              回复话题
            </button>
          </div>

          {/* 回复区 */}
          <div>
            <div style={{
              fontSize: 13,
              fontWeight: 500,
              fontFamily: "'Noto Serif SC', serif",
              color: textColor,
              marginBottom: 16,
            }}>
              回复 · {replies.length}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {replies.map(reply => (
                <div
                  key={reply.id}
                  style={{
                    padding: '16px 18px',
                    borderRadius: 10,
                    background: isNight ? 'rgba(255,255,255,0.03)' : 'rgba(43, 42, 38, 0.02)',
                    border: `1px solid ${isNight ? 'rgba(255,255,255,0.05)' : 'rgba(43, 42, 38, 0.05)'}`,
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
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${circle.color}, ${circle.color}AA)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 500,
                      fontFamily: "'Noto Serif SC', serif",
                    }}>
                      {reply.avatar}
                    </div>
                    <span style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: textColor,
                      fontFamily: "'Noto Serif SC', serif",
                    }}>
                      {reply.author}
                    </span>
                    <span style={{
                      fontSize: 11,
                      color: subTextColor,
                      opacity: 0.5,
                    }}>
                      {reply.createdAt}
                    </span>
                  </div>
                  <div style={{
                    fontSize: 13,
                    lineHeight: 1.8,
                    color: textColor,
                    fontFamily: "'Noto Serif SC', serif",
                    whiteSpace: 'pre-line',
                  }}>
                    {reply.content}
                  </div>
                </div>
              ))}

              {replies.length === 0 && (
                <div style={{
                  padding: '32px',
                  textAlign: 'center',
                  color: subTextColor,
                  fontSize: 12,
                  opacity: 0.6,
                }}>
                  还没有回复
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 创建圈子对话框
// ============================================
function CreateCircleDialog({ onClose, isNight, textColor, subTextColor }) {
  const [step, setStep] = React.useState(1);
  const [form, setForm] = React.useState({
    name: '',
    topic: '',
    description: '',
    windowType: 'weekday',
    postPermission: 'all',
  });

  const steps = [
    { id: 1, label: '基本信息' },
    { id: 2, label: '时间窗口' },
    { id: 3, label: '权限设置' },
    { id: 4, label: '完成' },
  ];

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else onClose();
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
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
          width: 480,
          background: isNight ? '#2A2925' : '#FFFEFA',
          borderRadius: 18,
          border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.08)'}`,
          boxShadow: '0 30px 80px rgba(0,0,0,0.25)',
          overflow: 'hidden',
          animation: 'fadeInUp 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) both',
        }}
      >
        {/* 步骤条 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '18px 24px',
          borderBottom: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
        }}>
          {steps.map((s, i) => (
            <React.Fragment key={s.id}>
              <div style={{
                fontSize: 11,
                color: step >= s.id ? '#B56B3A' : subTextColor,
                opacity: step >= s.id ? 1 : 0.5,
                fontFamily: step >= s.id ? "'Noto Serif SC', serif" : 'inherit',
                fontWeight: step >= s.id ? 500 : 400,
              }}>
                {s.id}. {s.label}
              </div>
              {i < steps.length - 1 && (
                <div style={{ flex: 1 }} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div style={{ padding: '28px 32px 32px' }}>
          {/* Step 1: 基本信息 */}
          {step === 1 && (
            <>
              <h3 style={{
                fontSize: 20,
                fontWeight: 500,
                fontFamily: "'Noto Serif SC', serif",
                color: textColor,
                marginBottom: 6,
              }}>
                创建新圈子
              </h3>
              <p style={{
                fontSize: 12,
                color: subTextColor,
                lineHeight: 1.6,
                marginBottom: 24,
              }}>
                圈子是围绕核心话题的深度讨论空间。最多 10 人，小而美。
              </p>

              <div style={{ marginBottom: 18 }}>
                <label style={{
                  fontSize: 12,
                  color: textColor,
                  marginBottom: 8,
                  display: 'block',
                  fontFamily: "'Noto Serif SC', serif",
                }}>
                  圈子名称
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="给你的圈子起个名字"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.1)'}`,
                    background: isNight ? '#262522' : '#FFFEFA',
                    color: textColor,
                    fontSize: 13,
                    fontFamily: "'Noto Serif SC', serif",
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{
                  fontSize: 12,
                  color: textColor,
                  marginBottom: 8,
                  display: 'block',
                  fontFamily: "'Noto Serif SC', serif",
                }}>
                  核心话题
                </label>
                <input
                  type="text"
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  placeholder="这个圈子围绕什么话题？"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.1)'}`,
                    background: isNight ? '#262522' : '#FFFEFA',
                    color: textColor,
                    fontSize: 13,
                    fontFamily: "'Noto Serif SC', serif",
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: 0 }}>
                <label style={{
                  fontSize: 12,
                  color: textColor,
                  marginBottom: 8,
                  display: 'block',
                  fontFamily: "'Noto Serif SC', serif",
                }}>
                  圈子描述
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="简单描述一下这个圈子..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.1)'}`,
                    background: isNight ? '#262522' : '#FFFEFA',
                    color: textColor,
                    fontSize: 13,
                    fontFamily: "'Noto Serif SC', serif",
                    outline: 'none',
                    resize: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </>
          )}

          {/* Step 2: 时间窗口 */}
          {step === 2 && (
            <>
              <h3 style={{
                fontSize: 20,
                fontWeight: 500,
                fontFamily: "'Noto Serif SC', serif",
                color: textColor,
                marginBottom: 6,
              }}>
                设置时间窗口
              </h3>
              <p style={{
                fontSize: 12,
                color: subTextColor,
                lineHeight: 1.6,
                marginBottom: 24,
              }}>
                圈子只在开放时间内更新和提醒。非窗口时间保持静默，不打扰生活。
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { id: 'weekday', label: '工作日', desc: '周一至周五 9:00 - 18:00', desc2: '适合工作团队' },
                  { id: 'evening', label: '晚间开放', desc: '每天 20:00 - 22:00', desc2: '适合学习讨论' },
                  { id: 'weekly', label: '每周固定时间', desc: '每周二、四晚 20:00 - 22:00', desc2: '像线下聚会的节奏' },
                  { id: 'always', label: '随时开放', desc: '没有时间限制', desc2: '不推荐，容易变成刷屏群' },
                ].map(option => (
                  <div
                    key={option.id}
                    onClick={() => setForm({ ...form, windowType: option.id })}
                    style={{
                      padding: '14px 18px',
                      borderRadius: 10,
                      border: `1px solid ${form.windowType === option.id
                        ? '#B56B3A40'
                        : (isNight ? 'rgba(255,255,255,0.08)' : 'rgba(43, 42, 38, 0.08)')}`,
                      background: form.windowType === option.id
                        ? (isNight ? 'rgba(181, 107, 58, 0.08)' : 'rgba(181, 107, 58, 0.05)')
                        : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{
                      width: 20, height: 20,
                      borderRadius: '50%',
                      border: `2px solid ${form.windowType === option.id ? '#B56B3A' : (isNight ? 'rgba(255,255,255,0.2)' : 'rgba(43, 42, 38, 0.2)')}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {form.windowType === option.id && (
                        <div style={{
                          width: 10, height: 10,
                          borderRadius: '50%',
                          background: '#B56B3A',
                        }} />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: textColor,
                        marginBottom: 2,
                        fontFamily: "'Noto Serif SC', serif",
                      }}>
                        {option.label}
                      </div>
                      <div style={{
                        fontSize: 11,
                        color: subTextColor,
                        opacity: 0.7,
                      }}>
                        {option.desc}
                      </div>
                    </div>
                    <span style={{
                      fontSize: 10,
                      color: option.id === 'always' ? '#C83232' : subTextColor,
                      opacity: option.id === 'always' ? 1 : 0.6,
                    }}>
                      {option.desc2}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Step 3: 权限 */}
          {step === 3 && (
            <>
              <h3 style={{
                fontSize: 20,
                fontWeight: 500,
                fontFamily: "'Noto Serif SC', serif",
                color: textColor,
                marginBottom: 6,
              }}>
                内容权限
              </h3>
              <p style={{
                fontSize: 12,
                color: subTextColor,
                lineHeight: 1.6,
                marginBottom: 24,
              }}>
                设置圈子内的发帖和回复权限。
              </p>

              <div style={{ marginBottom: 20 }}>
                <div style={{
                  fontSize: 13,
                  color: textColor,
                  marginBottom: 10,
                  fontFamily: "'Noto Serif SC', serif",
                }}>
                  谁可以发起话题
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[
                    { id: 'all', label: '所有成员' },
                    { id: 'admin', label: '仅管理者' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setForm({ ...form, postPermission: opt.id })}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: 10,
                        border: `1px solid ${form.postPermission === opt.id
                          ? '#B56B3A40'
                          : (isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.1)')}`,
                        background: form.postPermission === opt.id
                          ? 'rgba(181, 107, 58, 0.1)'
                          : 'transparent',
                        color: form.postPermission === opt.id ? '#B56B3A' : subTextColor,
                        fontSize: 12,
                        cursor: 'pointer',
                        fontWeight: form.postPermission === opt.id ? 500 : 400,
                        fontFamily: "'Noto Serif SC', serif",
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{
                padding: '14px 18px',
                borderRadius: 10,
                background: isNight ? 'rgba(255,255,255,0.03)' : 'rgba(43, 42, 38, 0.02)',
                fontSize: 11,
                color: subTextColor,
                lineHeight: 1.7,
              }}>
                <p style={{ margin: '0 0 4px', color: textColor, fontWeight: 500 }}>
                  关于权限的设计理念
                </p>
                <p style={{ margin: 0 }}>
                  圈子不是民主广场，是深度讨论空间。
                  管理者的职责不是"管理言论"，而是"维护知识质量"。
                  重构、归档、置顶——这些操作是为了让讨论沉淀为知识。
                </p>
              </div>
            </>
          )}

          {/* Step 4: 完成 */}
          {step === 4 && (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{
                width: 64, height: 64,
                margin: '0 auto 20px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #5A7A4E, #7A9A6E)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 28,
                animation: 'scaleIn 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both',
              }}>
                ✓
              </div>
              <h3 style={{
                fontSize: 20,
                fontWeight: 500,
                fontFamily: "'Noto Serif SC', serif",
                color: textColor,
                marginBottom: 8,
              }}>
                圈子创建成功
              </h3>
              <p style={{
                fontSize: 13,
                color: subTextColor,
                lineHeight: 1.7,
                marginBottom: 20,
              }}>
                你创建了第 {CIRCLES.length + 1} 个圈子<br />
                还可以创建 {3 - (CIRCLES.length + 1)} 个
              </p>
              <div style={{
                padding: '14px 18px',
                borderRadius: 10,
                background: isNight ? 'rgba(90, 122, 78, 0.06)' : 'rgba(90, 122, 78, 0.04)',
                border: `1px solid ${isNight ? 'rgba(90, 122, 78, 0.15)' : 'rgba(90, 122, 78, 0.1)'}`,
                fontSize: 12,
                color: '#5A7A4E',
                lineHeight: 1.7,
                textAlign: 'left',
              }}>
                <p style={{ margin: '0 0 4px', fontWeight: 500 }}>
                  一个安静的书房已经建好
                </p>
                <p style={{ margin: 0, fontSize: 11, opacity: 0.85 }}>
                  接下来，邀请真正同频的人加入。
                  不要求多，要求深。
                </p>
              </div>
            </div>
          )}

          {/* 按钮 */}
          <div style={{
            display: 'flex',
            gap: 10,
            marginTop: 28,
          }}>
            {step > 1 ? (
              <button
                onClick={handlePrev}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 10,
                  border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.1)'}`,
                  background: 'transparent',
                  color: subTextColor,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                上一步
              </button>
            ) : (
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 10,
                  border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.1)'}`,
                  background: 'transparent',
                  color: subTextColor,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                取消
              </button>
            )}
            <button
              onClick={handleNext}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: 10,
                border: 'none',
                background: step === 4
                  ? 'linear-gradient(135deg, #5A7A4E, #7A9A6E)'
                  : 'linear-gradient(135deg, #B56B3A, #D48A5A)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: "'Noto Serif SC', serif",
                boxShadow: step === 4
                  ? '0 2px 12px rgba(90, 122, 78, 0.25)'
                  : '0 2px 12px rgba(181, 107, 58, 0.25)',
              }}
            >
              {step === 4 ? '进入圈子' : step === 3 ? '创建圈子' : '下一步'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 发起话题对话框
// ============================================
function NewTopicDialog({ circle, onClose, isNight, textColor, subTextColor }) {
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [tags, setTags] = React.useState('');

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
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
          width: 600,
          maxWidth: '90vw',
          background: isNight ? '#2A2925' : '#FFFEFA',
          borderRadius: 16,
          border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.08)'}`,
          boxShadow: '0 30px 80px rgba(0,0,0,0.25)',
          overflow: 'hidden',
          animation: 'fadeInUp 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) both',
        }}
      >
        <div style={{
          padding: '20px 28px',
          borderBottom: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h3 style={{
            fontSize: 18,
            fontWeight: 500,
            fontFamily: "'Noto Serif SC', serif",
            color: textColor,
          }}>
            发起新话题
          </h3>
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30,
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

        <div style={{ padding: '24px 28px' }}>
          <div style={{ marginBottom: 16 }}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="话题标题"
              style={{
                width: '100%',
                padding: '12px 0',
                border: 'none',
                borderBottom: `2px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.1)'}`,
                background: 'transparent',
                color: textColor,
                fontSize: 18,
                fontWeight: 500,
                fontFamily: "'Noto Serif SC', serif",
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="写下你的想法...&#10;&#10;支持 Markdown 格式"
              rows={8}
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: 10,
                border: `1px solid ${isNight ? 'rgba(255,255,255,0.08)' : 'rgba(43, 42, 38, 0.08)'}`,
                background: isNight ? '#262522' : '#FFFEFA',
                color: textColor,
                fontSize: 13,
                lineHeight: 1.8,
                fontFamily: "'Noto Serif SC', serif",
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="标签，用逗号分隔"
              style={{
                width: '100%',
                padding: '8px 14px',
                borderRadius: 8,
                border: `1px solid ${isNight ? 'rgba(255,255,255,0.08)' : 'rgba(43, 42, 38, 0.08)'}`,
                background: isNight ? '#262522' : '#FFFEFA',
                color: subTextColor,
                fontSize: 12,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{
              fontSize: 11,
              color: subTextColor,
              opacity: 0.6,
            }}>
              发布到「{circle.name}」
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={onClose}
                style={{
                  padding: '10px 20px',
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
              <button
                onClick={onClose}
                style={{
                  padding: '10px 24px',
                  borderRadius: 8,
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
                发布话题
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  TopicDetailDialog,
  CreateCircleDialog,
  NewTopicDialog,
});
