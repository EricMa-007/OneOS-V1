// ============================================
// 成员管理 + 知识库 + 圈子统计 + 隐私
// ============================================

// ============================================
// 成员管理
// ============================================
function CircleMembersView({ circle, isNight, textColor, subTextColor }) {
  const members = CIRCLE_MEMBERS[circle.id] || [];
  const [showInvite, setShowInvite] = React.useState(false);
  const canInviteMore = circle.memberCount < circle.maxMembers;

  const roleLabels = {
    creator: '创建者',
    admin: '管理者',
    member: '成员',
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '28px' }}>
      {/* 成员概览 */}
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
        <div>
          <div style={{
            fontSize: 14,
            fontWeight: 500,
            fontFamily: "'Noto Serif SC', serif",
            color: textColor,
            marginBottom: 6,
          }}>
            成员 {circle.memberCount} / {circle.maxMembers} 人
          </div>
          <div style={{
            fontSize: 12,
            color: subTextColor,
            lineHeight: 1.5,
          }}>
            每个圈子最多 10 人。小而美，深而精。
          </div>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          disabled={!canInviteMore}
          style={{
            padding: '10px 20px',
            borderRadius: 10,
            border: canInviteMore ? 'none' : `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.1)'}`,
            background: canInviteMore
              ? `linear-gradient(135deg, ${circle.color}, ${circle.color}CC)`
              : 'transparent',
            color: canInviteMore ? '#fff' : subTextColor,
            fontSize: 13,
            fontWeight: 500,
            cursor: canInviteMore ? 'pointer' : 'not-allowed',
            fontFamily: "'Noto Serif SC', serif",
            opacity: canInviteMore ? 1 : 0.5,
            boxShadow: canInviteMore ? `0 2px 12px ${circle.color}30` : 'none',
          }}
        >
          {canInviteMore ? '+ 邀请成员' : '成员已满'}
        </button>
      </div>

      {/* 成员列表 */}
      <div style={{
        borderRadius: 14,
        background: isNight ? '#262522' : '#FFFEFA',
        border: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
        overflow: 'hidden',
        marginBottom: 24,
      }}>
        {members.map((member, i) => (
          <div
            key={member.id}
            style={{
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              borderBottom: i < members.length - 1
                ? `1px solid ${isNight ? 'rgba(255,255,255,0.04)' : 'rgba(43, 42, 38, 0.04)'}`
                : 'none',
            }}
          >
            <div style={{
              width: 40, height: 40,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${circle.color}, ${circle.color}AA)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 16,
              fontWeight: 500,
              fontFamily: "'Noto Serif SC', serif",
              flexShrink: 0,
            }}>
              {member.avatar}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 3,
              }}>
                <span style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: textColor,
                  fontFamily: "'Noto Serif SC', serif",
                }}>
                  {member.name}
                </span>
                <span style={{
                  fontSize: 10,
                  padding: '2px 10px',
                  borderRadius: 10,
                  background: member.role === 'creator'
                    ? `${circle.color}15`
                    : member.role === 'admin'
                    ? 'rgba(90, 122, 78, 0.12)'
                    : (isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'),
                  color: member.role === 'creator'
                    ? circle.color
                    : member.role === 'admin'
                    ? '#5A7A4E'
                    : subTextColor,
                  fontFamily: "'Noto Serif SC', serif",
                }}>
                  {roleLabels[member.role]}
                </span>
              </div>
              <div style={{
                fontSize: 11,
                color: subTextColor,
                opacity: 0.6,
              }}>
                加入于 {member.joinedAt}
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: 8,
            }}>
              {member.role === 'member' && (
                <>
                  <button style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.1)'}`,
                    background: 'transparent',
                    color: subTextColor,
                    fontSize: 11,
                    cursor: 'pointer',
                  }}>
                    设为管理
                  </button>
                  <button style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    border: `1px solid rgba(200, 50, 50, 0.2)`,
                    background: 'transparent',
                    color: '#C83232',
                    fontSize: 11,
                    cursor: 'pointer',
                  }}>
                    移除
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 成员上限提示 */}
      <div style={{
        padding: '14px 20px',
        borderRadius: 10,
        background: isNight ? 'rgba(255,255,255,0.02)' : 'rgba(43, 42, 38, 0.02)',
        border: `1px solid ${isNight ? 'rgba(255,255,255,0.04)' : 'rgba(43, 42, 38, 0.04)'}`,
        fontSize: 12,
        color: subTextColor,
        lineHeight: 1.7,
        fontFamily: "'Noto Serif SC', serif",
      }}>
        <p style={{ margin: '0 0 4px', color: textColor, fontWeight: 500 }}>
          为什么最多 10 人？
        </p>
        <p style={{ margin: 0, fontSize: 11, opacity: 0.8 }}>
          邓巴数字是 150，但那是所有人际关系总量。
          真正能深度讨论、彼此理解、共同成长的核心圈子，10 个人差不多是极限了。
          再多就会变成灌水群，质量必然下降。
          所以我们硬限制 10 人——不是技术限制，是产品哲学。
        </p>
      </div>

      {/* 邀请成员弹窗 */}
      {showInvite && (
        <InviteMemberDialog
          circle={circle}
          onClose={() => setShowInvite(false)}
          isNight={isNight}
          textColor={textColor}
          subTextColor={subTextColor}
        />
      )}
    </div>
  );
}

// 邀请成员弹窗
function InviteMemberDialog({ circle, onClose, isNight, textColor, subTextColor }) {
  const inviteCode = 'ONEOS-8F7X2K-CT';

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
          width: 400,
          background: isNight ? '#2A2925' : '#FFFEFA',
          borderRadius: 16,
          border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.08)'}`,
          boxShadow: '0 30px 80px rgba(0,0,0,0.25)',
          overflow: 'hidden',
          animation: 'fadeInUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both',
        }}
      >
        <div style={{
          padding: '24px 28px 20px',
          textAlign: 'center',
          background: `linear-gradient(180deg, ${circle.color}10, transparent)`,
        }}>
          <div style={{
            width: 52, height: 52,
            margin: '0 auto 14px',
            borderRadius: 14,
            background: `linear-gradient(135deg, ${circle.color}, ${circle.color}CC)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 24,
          }}>
            {circle.topicIcon}
          </div>
          <h3 style={{
            fontSize: 18,
            fontWeight: 500,
            fontFamily: "'Noto Serif SC', serif",
            color: textColor,
            marginBottom: 4,
          }}>
            邀请加入「{circle.name}」
          </h3>
          <p style={{
            fontSize: 12,
            color: subTextColor,
            lineHeight: 1.6,
            marginBottom: 0,
          }}>
            分享邀请码给对方，对方加入后直接出现在这个圈子的话题图谱中
          </p>
        </div>

        <div style={{ padding: '20px 28px' }}>
          <div style={{
            padding: '16px 20px',
            borderRadius: 12,
            background: isNight ? 'rgba(255,255,255,0.04)' : 'rgba(43, 42, 38, 0.04)',
            border: `1px dashed ${isNight ? 'rgba(255,255,255,0.2)' : 'rgba(43, 42, 38, 0.2)'}`,
            textAlign: 'center',
            marginBottom: 16,
          }}>
            <div style={{
              fontSize: 10,
              color: subTextColor,
              marginBottom: 8,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}>
              邀请码
            </div>
            <div style={{
              fontSize: 20,
              fontWeight: 600,
              color: circle.color,
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: 2,
            }}>
              {inviteCode}
            </div>
          </div>

          <div style={{
            fontSize: 11,
            color: subTextColor,
            lineHeight: 1.6,
            marginBottom: 20,
          }}>
            · 邀请码绑定本圈子，不能用于其他圈子<br />
            · 邀请码 7 天内有效<br />
            · 成员达到 10 人后无法再邀请
          </div>

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
              关闭
            </button>
            <button
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: 8,
                border: 'none',
                background: `linear-gradient(135deg, ${circle.color}, ${circle.color}CC)`,
                color: '#fff',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: "'Noto Serif SC', serif",
              }}
            >
              复制邀请码
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 知识库视图
// ============================================
function CircleKnowledgeView({ circle, isNight, textColor, subTextColor }) {
  const archived = getKnowledgeBase(circle.id);
  const [filter, setFilter] = React.useState('all');

  const allTags = [...new Set(archived.flatMap(t => t.tags))];

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '28px' }}>
      {/* 说明 */}
      <div style={{
        padding: '20px 24px',
        borderRadius: 14,
        background: `linear-gradient(135deg, ${circle.color}08, transparent)`,
        border: `1px solid ${circle.color}15`,
        marginBottom: 24,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 10,
        }}>
          <div style={{
            width: 40, height: 40,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${circle.color}, ${circle.color}AA)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 18,
          }}>
            {circle.topicIcon}
          </div>
          <div>
            <div style={{
              fontSize: 16,
              fontWeight: 500,
              fontFamily: "'Noto Serif SC', serif",
              color: textColor,
            }}>
              圈子知识库
            </div>
            <div style={{
              fontSize: 12,
              color: subTextColor,
            }}>
              所有已归档的话题自动沉淀为知识文档
            </div>
          </div>
          <div style={{
            marginLeft: 'auto',
            textAlign: 'right',
          }}>
            <div style={{
              fontSize: 24,
              fontWeight: 600,
              color: circle.color,
              fontFamily: "'Noto Serif SC', serif",
            }}>
              {archived.length}
            </div>
            <div style={{
              fontSize: 10,
              color: subTextColor,
            }}>
              篇知识文档
            </div>
          </div>
        </div>
      </div>

      {/* 筛选 + 搜索 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
      }}>
        <div style={{
          display: 'flex',
          gap: 6,
          flexWrap: 'wrap',
        }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '4px 12px',
              borderRadius: 14,
              border: 'none',
              background: filter === 'all' ? `${circle.color}15` : 'transparent',
              color: filter === 'all' ? circle.color : subTextColor,
              fontSize: 11,
              cursor: 'pointer',
              fontWeight: filter === 'all' ? 500 : 400,
            }}
          >
            全部
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setFilter(tag)}
              style={{
                padding: '4px 12px',
                borderRadius: 14,
                border: 'none',
                background: filter === tag ? `${circle.color}15` : 'transparent',
                color: filter === tag ? circle.color : subTextColor,
                fontSize: 11,
                cursor: 'pointer',
                fontWeight: filter === tag ? 500 : 400,
              }}
            >
              {tag}
            </button>
          ))}
        </div>
        <button style={{
          padding: '6px 14px',
          borderRadius: 8,
          border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.1)'}`,
          background: 'transparent',
          color: subTextColor,
          fontSize: 11,
          cursor: 'pointer',
        }}>
          导出 MD 包
        </button>
      </div>

      {/* 知识文档列表 */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}>
        {archived.map(topic => (
          <div
            key={topic.id}
            style={{
              padding: '18px 22px',
              borderRadius: 12,
              background: isNight ? '#262522' : '#FFFEFA',
              border: `1px solid ${isNight ? 'rgba(255,255,255,0.05)' : 'rgba(43, 42, 38, 0.05)'}`,
              cursor: 'pointer',
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
              gap: 10,
              marginBottom: 8,
            }}>
              <span style={{
                fontSize: 10,
                padding: '2px 8px',
                borderRadius: 8,
                background: isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)',
                color: subTextColor,
              }}>
                {circle.topicIcon} 知识文档
              </span>
              {topic.tags.map(tag => (
                <span key={tag} style={{
                  fontSize: 10,
                  color: subTextColor,
                  opacity: 0.6,
                }}>
                  #{tag}
                </span>
              ))}
            </div>

            <h4 style={{
              fontSize: 15,
              fontWeight: 500,
              fontFamily: "'Noto Serif SC', serif",
              color: textColor,
              margin: '0 0 8px',
            }}>
              {topic.title}
            </h4>

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
              fontSize: 11,
              color: subTextColor,
              opacity: 0.7,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span>作者：{topic.author}</span>
                <span>·</span>
                <span>{topic.createdAt}</span>
                <span>·</span>
                <span>{topic.replyCount} 条讨论</span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <span>查看</span>
                <span>·</span>
                <span>导出</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 底部说明 */}
      <div style={{
        marginTop: 24,
        padding: '16px 20px',
        borderRadius: 12,
        background: isNight ? 'rgba(255,255,255,0.02)' : 'rgba(43, 42, 38, 0.02)',
        fontSize: 11,
        color: subTextColor,
        lineHeight: 1.7,
        fontFamily: "'Noto Serif SC', serif",
      }}>
        <p style={{ margin: '0 0 4px', color: textColor, fontWeight: 500 }}>
          每人本地自组织
        </p>
        <p style={{ margin: 0, opacity: 0.8 }}>
          知识库在每个成员的本地独立存储。每个人可以按照自己的理解重新组织、标注、升维这些知识。
          不需要和别人一样——知识的价值在于你自己的理解。
        </p>
      </div>
    </div>
  );
}

// ============================================
// 圈子统计
// ============================================
function CircleStatsView({ circle, isNight, textColor, subTextColor }) {
  const stats = [
    { label: '话题总数', value: circle.stats.topics, unit: '篇', color: circle.color },
    { label: '回复总数', value: circle.stats.replies, unit: '条', color: '#5A7A4E' },
    { label: '已归档', value: circle.stats.archived, unit: '篇', color: '#B56B3A' },
    { label: '成员参与率', value: 85, unit: '%', color: '#4F46E5' },
  ];

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '28px' }}>
      <div style={{
        padding: '20px 24px',
        borderRadius: 14,
        background: `linear-gradient(135deg, ${circle.color}08, transparent)`,
        border: `1px solid ${circle.color}15`,
        marginBottom: 24,
      }}>
        <div style={{
          fontSize: 14,
          fontWeight: 500,
          fontFamily: "'Noto Serif SC', serif",
          color: textColor,
          marginBottom: 4,
        }}>
          圈子统计 · 纯记录，非目标
        </div>
        <div style={{
          fontSize: 12,
          color: subTextColor,
          lineHeight: 1.5,
        }}>
          这些数字只是记录。它们不是 KPI，不是目标，不做排名。
        </div>
      </div>

      {/* 核心数据 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12,
        marginBottom: 28,
      }}>
        {stats.map(stat => (
          <div
            key={stat.label}
            style={{
              padding: '20px 16px',
              borderRadius: 12,
              background: isNight ? '#262522' : '#FFFEFA',
              border: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
              textAlign: 'center',
            }}
          >
            <div style={{
              fontSize: 28,
              fontWeight: 600,
              color: stat.color,
              fontFamily: "'Noto Serif SC', serif",
              marginBottom: 4,
            }}>
              {stat.value}
              <span style={{ fontSize: 14, marginLeft: 2, opacity: 0.7 }}>{stat.unit}</span>
            </div>
            <div style={{
              fontSize: 12,
              color: subTextColor,
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* 活跃度图表（简化版，用柱状图示意） */}
      <div style={{
        padding: '20px 24px',
        borderRadius: 14,
        background: isNight ? '#262522' : '#FFFEFA',
        border: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
        marginBottom: 20,
      }}>
        <div style={{
          fontSize: 14,
          fontWeight: 500,
          fontFamily: "'Noto Serif SC', serif",
          color: textColor,
          marginBottom: 20,
        }}>
          近 7 天活跃度
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 12,
          height: 140,
          padding: '0 10px',
        }}>
          {[
            { day: '周一', v: 65 },
            { day: '周二', v: 45 },
            { day: '周三', v: 80 },
            { day: '周四', v: 55 },
            { day: '周五', v: 90 },
            { day: '周六', v: 25 },
            { day: '周日', v: 35 },
          ].map(d => (
            <div key={d.day} style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}>
              <div style={{
                width: '100%',
                height: d.v * 1.2,
                borderRadius: '6px 6px 2px 2px',
                background: `linear-gradient(180deg, ${circle.color}, ${circle.color}40)`,
                minHeight: 4,
                transition: 'height 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
              }} />
              <span style={{
                fontSize: 10,
                color: subTextColor,
                opacity: 0.7,
              }}>
                {d.day}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 时间窗口遵守率 */}
      <div style={{
        padding: '20px 24px',
        borderRadius: 14,
        background: isNight ? '#262522' : '#FFFEFA',
        border: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
        marginBottom: 20,
      }}>
        <div style={{
          fontSize: 14,
          fontWeight: 500,
          fontFamily: "'Noto Serif SC', serif",
          color: textColor,
          marginBottom: 14,
        }}>
          时间窗口遵守率
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}>
          <div style={{
            width: 80, height: 80,
            borderRadius: '50%',
            border: `6px solid #5A7A4E30`,
            borderTopColor: '#5A7A4E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            fontWeight: 600,
            color: '#5A7A4E',
            fontFamily: "'Noto Serif SC', serif",
            transform: 'rotate(45deg)',
          }}>
            <span style={{ transform: 'rotate(-45deg)' }}>92%</span>
          </div>
          <div style={{ flex: 1, fontSize: 12, color: subTextColor, lineHeight: 1.7 }}>
            <p style={{ margin: '0 0 6px', color: textColor, fontWeight: 500 }}>
              92% 的讨论发生在开放时间内
            </p>
            <p style={{ margin: 0 }}>
              时间窗口不是枷锁，是节奏。
              大家慢慢习惯了在固定时间深度交流，非窗口时间专注生活。
              这种节奏感本身就是圈子价值的一部分。
            </p>
          </div>
        </div>
      </div>

      {/* 端到端加密 */}
      <div style={{
        padding: '18px 22px',
        borderRadius: 12,
        background: isNight ? 'rgba(90, 122, 78, 0.06)' : 'rgba(90, 122, 78, 0.04)',
        border: `1px solid ${isNight ? 'rgba(90, 122, 78, 0.15)' : 'rgba(90, 122, 78, 0.1)'}`,
        fontSize: 12,
        color: '#5A7A4E',
        lineHeight: 1.7,
        fontFamily: "'Noto Serif SC', serif",
      }}>
        <p style={{ margin: '0 0 6px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          端到端加密
        </p>
        <p style={{ margin: 0, fontSize: 11, opacity: 0.85 }}>
          圈子通信与共享内容端到端加密，仅圈子成员可解密。
          没有中心化服务器存储圈子内容。成员退出后无法解密新内容。
        </p>
      </div>
    </div>
  );
}

Object.assign(window, {
  CircleMembersView,
  InviteMemberDialog,
  CircleKnowledgeView,
  CircleStatsView,
});
