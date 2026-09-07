// ============================================
// 可控零打扰社交 — 权限规则 + 统计视图
// ============================================

// ============================================
// 权限与规则视图
// ============================================
function RulesView({ isNight, textColor, subTextColor }) {
  const [activeLevel, setActiveLevel] = React.useState('global'); // global | group | individual
  const [activePreset, setActivePreset] = React.useState('balance');
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const presets = [
    {
      id: 'quiet',
      name: '极静模式',
      desc: '仅周日晚接收所有消息',
      detail: '一周一次，深度沉浸。核心圈例外。',
      color: '#5A7A4E',
    },
    {
      id: 'balance',
      name: '平衡模式',
      desc: '每天晚8-9点接收，核心圈随时',
      detail: '既不错过重要的人，也不被打扰。',
      color: '#B56B3A',
    },
    {
      id: 'open',
      name: '开放模式',
      desc: '工作时间接收，休息时间静默',
      detail: '白天敞开，夜晚回归生活。',
      color: '#3D4A6B',
    },
  ];

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      {/* 快速预设方案 */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{
          fontSize: 14,
          fontWeight: 500,
          fontFamily: "'Noto Serif SC', serif",
          color: textColor,
          marginBottom: 6,
        }}>
          选择你的节奏
          <span style={{
            marginLeft: 6,
            fontSize: 11,
            color: subTextColor,
            fontWeight: 400,
            fontFamily: 'inherit',
          }}>
            · 一键切换，也可以自定义
          </span>
        </h3>
        <p style={{
          fontSize: 12,
          color: subTextColor,
          marginBottom: 14,
          lineHeight: 1.5,
        }}>
          社交是生活的一部分，不是生活的全部。选一个让你舒服的节奏。
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
        }}>
          {presets.map(preset => (
            <button
              key={preset.id}
              onClick={() => setActivePreset(preset.id)}
              style={{
                padding: '16px',
                borderRadius: 12,
                background: activePreset === preset.id
                  ? `${preset.color}12`
                  : (isNight ? 'rgba(255,255,255,0.03)' : 'rgba(43, 42, 38, 0.02)'),
                border: `1px solid ${activePreset === preset.id
                  ? `${preset.color}40`
                  : (isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)')}`,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={(e) => {
                if (activePreset !== preset.id) {
                  e.currentTarget.style.borderColor = preset.color + '30';
                }
              }}
              onMouseLeave={(e) => {
                if (activePreset !== preset.id) {
                  e.currentTarget.style.borderColor = isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)';
                }
              }}
            >
              <div style={{
                fontSize: 14,
                fontWeight: 500,
                fontFamily: "'Noto Serif SC', serif",
                color: activePreset === preset.id ? preset.color : textColor,
                marginBottom: 4,
              }}>
                {preset.name}
                {activePreset === preset.id && (
                  <span style={{ marginLeft: 6, fontSize: 10 }}>✓</span>
                )}
              </div>
              <div style={{
                fontSize: 11.5,
                color: subTextColor,
                marginBottom: 6,
              }}>
                {preset.desc}
              </div>
              <div style={{
                fontSize: 10.5,
                color: subTextColor,
                opacity: 0.6,
                lineHeight: 1.4,
              }}>
                {preset.detail}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 高级设置折叠入口 */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        style={{
          width: '100%',
          padding: '12px 16px',
          borderRadius: 10,
          background: 'transparent',
          border: `1px dashed ${isNight ? 'rgba(255,255,255,0.08)' : 'rgba(43, 42, 38, 0.08)'}`,
          color: subTextColor,
          fontSize: 12,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          marginBottom: 28,
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = isNight ? 'rgba(255,255,255,0.15)' : 'rgba(43, 42, 38, 0.15)';
          e.currentTarget.style.color = textColor;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = isNight ? 'rgba(255,255,255,0.08)' : 'rgba(43, 42, 38, 0.08)';
          e.currentTarget.style.color = subTextColor;
        }}
      >
        <svg
          width="14" height="14" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
          style={{
            transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
        {showAdvanced ? '收起高级设置' : '自定义高级设置（三层权限 + 精细时间窗口）'}
      </button>

      {showAdvanced && (
        <div style={{ animation: 'fadeInUp 0.3s ease both' }}>
      <div style={{
        padding: '20px 24px',
        borderRadius: 14,
        background: isNight ? 'rgba(255,255,255,0.02)' : 'rgba(43, 42, 38, 0.02)',
        border: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
        marginBottom: 28,
      }}>
        <h3 style={{
          fontSize: 14,
          fontWeight: 500,
          fontFamily: "'Noto Serif SC', serif",
          color: textColor,
          marginBottom: 16,
        }}>
          三层权限管控体系
        </h3>

        {/* 三层金字塔结构 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}>
          {/* 个体规则（最顶层，最窄） */}
          <RuleLevelBadge
            label="个体规则"
            sub="优先级最高 · 针对单个人"
            width="35%"
            color="#9B6BA0"
            active={activeLevel === 'individual'}
            onClick={() => setActiveLevel('individual')}
            isNight={isNight}
            textColor={textColor}
          />

          {/* 箭头 */}
          <div style={{ fontSize: 12, color: subTextColor, opacity: 0.5 }}>
            ↓ 向下覆盖
          </div>

          {/* 分组规则 */}
          <RuleLevelBadge
            label="分组规则"
            sub="按圈子批量管理"
            width="60%"
            color="#4F46E5"
            active={activeLevel === 'group'}
            onClick={() => setActiveLevel('group')}
            isNight={isNight}
            textColor={textColor}
          />

          <div style={{ fontSize: 12, color: subTextColor, opacity: 0.5 }}>
            ↓ 向下覆盖
          </div>

          {/* 全局规则（最底层，最宽） */}
          <RuleLevelBadge
            label="全局通行规则"
            sub="默认规则 · 陌生人与所有人"
            width="100%"
            color="#8A8780"
            active={activeLevel === 'global'}
            onClick={() => setActiveLevel('global')}
            isNight={isNight}
            textColor={textColor}
          />
        </div>
      </div>

      {/* 详细设置 */}
      {activeLevel === 'global' && (
        <GlobalRules isNight={isNight} textColor={textColor} subTextColor={subTextColor} />
      )}
      {activeLevel === 'group' && (
        <GroupRules isNight={isNight} textColor={textColor} subTextColor={subTextColor} />
      )}
      {activeLevel === 'individual' && (
        <IndividualRules isNight={isNight} textColor={textColor} subTextColor={subTextColor} />
      )}
        </div>
      )}
    </div>
  );
}

function RuleLevelBadge({ label, sub, width, color, active, onClick, isNight, textColor }) {
  return (
    <div
      onClick={onClick}
      style={{
        width,
        padding: '12px 20px',
        borderRadius: 10,
        background: active
          ? (isNight ? `${color}15` : `${color}10`)
          : (isNight ? 'rgba(255,255,255,0.03)' : '#fff'),
        border: `1px solid ${active ? `${color}40` : (isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)')}`,
        cursor: 'pointer',
        textAlign: 'center',
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{
        fontSize: 14,
        fontWeight: 600,
        fontFamily: "'Noto Serif SC', serif",
        color: active ? color : textColor,
        marginBottom: 2,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 11,
        color: subTextColor,
        opacity: 0.7,
      }}>
        {sub}
      </div>
    </div>
  );
}

// 全局规则
function GlobalRules({ isNight, textColor, subTextColor }) {
  const [strangerEnabled, setStrangerEnabled] = React.useState(GLOBAL_SOCIAL_RULE.receiveFromStrangers);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h3 style={{
        fontSize: 15,
        fontWeight: 500,
        fontFamily: "'Noto Serif SC', serif",
        color: textColor,
      }}>
        全局通行规则
      </h3>

      {/* 陌生人消息开关 */}
      <div style={{
        padding: '16px 20px',
        borderRadius: 12,
        background: isNight ? 'rgba(255,255,255,0.03)' : '#FFFEFA',
        border: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}>
          <div>
            <div style={{
              fontSize: 14,
              fontWeight: 500,
              fontFamily: "'Noto Serif SC', serif",
              color: textColor,
              marginBottom: 4,
            }}>
              接收陌生人消息
            </div>
            <div style={{
              fontSize: 12,
              color: subTextColor,
              lineHeight: 1.5,
            }}>
              关闭后，非白名单联系人的消息将被静默拒收，对方不会收到任何提示。
            </div>
          </div>
          <div
            onClick={() => setStrangerEnabled(!strangerEnabled)}
            style={{
              width: 44, height: 24,
              borderRadius: 12,
              background: strangerEnabled
                ? 'linear-gradient(135deg, #5A7A4E, #7A9A6E)'
                : (isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.1)'),
              position: 'relative',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'background 0.2s ease',
            }}
          >
            <div style={{
              position: 'absolute',
              top: 2,
              left: strangerEnabled ? 20 : 2,
              width: 20, height: 20,
              borderRadius: '50%',
              background: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              transition: 'left 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }} />
          </div>
        </div>

        {!strangerEnabled && (
          <div style={{
            marginTop: 12,
            padding: '10px 14px',
            borderRadius: 8,
            background: 'rgba(90, 122, 78, 0.08)',
            borderLeft: `3px solid #5A7A4E`,
            fontSize: 11,
            color: '#5A7A4E',
            lineHeight: 1.5,
            fontFamily: "'Noto Serif SC', serif",
          }}>
            陌生人消息已关闭。世界彻底安静，只有你允许的人才能联系你。
          </div>
        )}
      </div>

      {/* 全局时间窗口 */}
      <TimeWindowCard
        title="全局读取时间窗口"
        description="所有未设置专属窗口的联系人，遵循此时间窗口"
        window={GLOBAL_SOCIAL_RULE.window}
        color="#8A8780"
        isNight={isNight}
        textColor={textColor}
        subTextColor={subTextColor}
      />

      {/* 内容权限 */}
      <div style={{
        padding: '16px 20px',
        borderRadius: 12,
        background: isNight ? 'rgba(255,255,255,0.03)' : '#FFFEFA',
        border: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
      }}>
        <div style={{
          fontSize: 14,
          fontWeight: 500,
          fontFamily: "'Noto Serif SC', serif",
          color: textColor,
          marginBottom: 12,
        }}>
          允许接收的内容类型
        </div>
        <div style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
        }}>
          {[
            { id: 'text', label: '纯文字', allowed: true },
            { id: 'image', label: '图片', allowed: false },
            { id: 'file', label: '文件', allowed: false },
            { id: 'voice', label: '语音', allowed: false },
            { id: 'video', label: '视频', allowed: false },
          ].map(item => (
            <div
              key={item.id}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: 12,
                border: `1px solid ${item.allowed
                  ? 'rgba(90, 122, 78, 0.3)'
                  : (isNight ? 'rgba(255,255,255,0.08)' : 'rgba(43, 42, 38, 0.08)')}`,
                background: item.allowed
                  ? 'rgba(90, 122, 78, 0.1)'
                  : 'transparent',
                color: item.allowed ? '#5A7A4E' : subTextColor,
                opacity: item.allowed ? 1 : 0.5,
                cursor: 'pointer',
                fontFamily: "'Noto Serif SC', serif",
              }}
            >
              {item.allowed ? '✓ ' : ''}{item.label}
            </div>
          ))}
        </div>
      </div>

      {/* 对方可见提示 */}
      <div style={{
        padding: '16px 20px',
        borderRadius: 12,
        background: isNight ? 'rgba(155, 107, 160, 0.06)' : 'rgba(155, 107, 160, 0.04)',
        border: `1px dashed ${isNight ? 'rgba(155, 107, 160, 0.25)' : 'rgba(155, 107, 160, 0.2)'}`,
      }}>
        <div style={{
          fontSize: 12,
          color: '#9B6BA0',
          marginBottom: 8,
          fontWeight: 500,
          fontFamily: "'Noto Serif SC', serif",
        }}>
          对方能看到什么？
        </div>
        <div style={{
          fontSize: 12,
          color: '#9B6BA0',
          fontStyle: 'italic',
          lineHeight: 1.6,
          fontFamily: "'Noto Serif SC', serif",
          paddingLeft: 10,
          borderLeft: `2px solid rgba(155, 107, 160, 0.3)`,
        }}>
          "该用户的消息读取窗口为【每周日 20:00-21:00】，你的消息将在该窗口内被接收。"
        </div>
        <div style={{
          marginTop: 10,
          fontSize: 11,
          color: subTextColor,
          lineHeight: 1.5,
        }}>
          对方看不到：在线状态、已读状态、最后活跃时间、是否在使用应用、输入状态。
        </div>
      </div>
    </div>
  );
}

// 分组规则
function GroupRules({ isNight, textColor, subTextColor }) {
  const [activeGroup, setActiveGroup] = React.useState('g-core');
  const group = SOCIAL_GROUPS.find(g => g.id === activeGroup);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h3 style={{
        fontSize: 15,
        fontWeight: 500,
        fontFamily: "'Noto Serif SC', serif",
        color: textColor,
      }}>
        分组规则
      </h3>

      {/* 分组选择 */}
      <div style={{
        display: 'flex',
        gap: 10,
        flexWrap: 'wrap',
      }}>
        {SOCIAL_GROUPS.map(g => (
          <button
            key={g.id}
            onClick={() => setActiveGroup(g.id)}
            style={{
              padding: '8px 18px',
              borderRadius: 20,
              border: `1px solid ${activeGroup === g.id
                ? `${g.color}50`
                : (isNight ? 'rgba(255,255,255,0.08)' : 'rgba(43, 42, 38, 0.08)')}`,
              background: activeGroup === g.id
                ? `${g.color}12`
                : 'transparent',
              color: activeGroup === g.id ? g.color : textColor,
              fontSize: 12,
              fontWeight: activeGroup === g.id ? 500 : 400,
              cursor: 'pointer',
              fontFamily: activeGroup === g.id ? "'Noto Serif SC', serif" : 'inherit',
              transition: 'all 0.15s ease',
            }}
          >
            {g.name}
          </button>
        ))}
      </div>

      {group && (
        <>
          <div style={{
            padding: '14px 18px',
            borderRadius: 10,
            background: isNight ? `${group.color}08` : `${group.color}04`,
            borderLeft: `3px solid ${group.color}`,
          }}>
            <div style={{
              fontSize: 12,
              color: group.color,
              marginBottom: 4,
              fontWeight: 500,
              fontFamily: "'Noto Serif SC', serif",
            }}>
              {group.name}
            </div>
            <div style={{
              fontSize: 13,
              color: textColor,
            }}>
              {group.description}
            </div>
          </div>

          {/* 时间窗口 */}
          <TimeWindowCard
            title="分组读取时间窗口"
            description={`${group.name}成员的消息在此时段内可被接收`}
            window={group.window}
            color={group.color}
            isNight={isNight}
            textColor={textColor}
            subTextColor={subTextColor}
          />

          {/* 紧急通道 */}
          <div style={{
            padding: '16px 20px',
            borderRadius: 12,
            background: isNight ? 'rgba(255,255,255,0.03)' : '#FFFEFA',
            border: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
          }}>
            <div style={{
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
                  marginBottom: 4,
                }}>
                  允许紧急消息突破窗口
                </div>
                <div style={{
                  fontSize: 12,
                  color: subTextColor,
                  lineHeight: 1.5,
                }}>
                  紧急消息会标记为紧急，但仍然不会弹窗提醒。
                </div>
              </div>
              <div
                style={{
                  width: 44, height: 24,
                  borderRadius: 12,
                  background: group.allowEmergency
                    ? 'linear-gradient(135deg, #C83232, #E85050)'
                    : (isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.1)'),
                  position: 'relative',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 2,
                  left: group.allowEmergency ? 20 : 2,
                  width: 20, height: 20,
                  borderRadius: '50%',
                  background: '#fff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  transition: 'left 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
                }} />
              </div>
            </div>
          </div>

          {/* 内容权限 */}
          <div style={{
            padding: '16px 20px',
            borderRadius: 12,
            background: isNight ? 'rgba(255,255,255,0.03)' : '#FFFEFA',
            border: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
          }}>
            <div style={{
              fontSize: 14,
              fontWeight: 500,
              fontFamily: "'Noto Serif SC', serif",
              color: textColor,
              marginBottom: 12,
            }}>
              内容权限
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['text', 'image', 'file', 'voice'].map((t, i) => {
                const labels = { text: '纯文字', image: '图片', file: '文件', voice: '语音' };
                const allowed = i < group.contentPermissions.length;
                return (
                  <div
                    key={t}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 20,
                      fontSize: 12,
                      border: `1px solid ${allowed
                        ? `${group.color}40`
                        : (isNight ? 'rgba(255,255,255,0.08)' : 'rgba(43, 42, 38, 0.08)')}`,
                      background: allowed ? `${group.color}10` : 'transparent',
                      color: allowed ? group.color : subTextColor,
                      opacity: allowed ? 1 : 0.5,
                      cursor: 'pointer',
                    }}
                  >
                    {allowed ? '✓ ' : ''}{labels[t]}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// 个体规则
function IndividualRules({ isNight, textColor, subTextColor }) {
  const customRuleContacts = SOCIAL_CONTACTS.filter(c => c.customRule);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h3 style={{
        fontSize: 15,
        fontWeight: 500,
        fontFamily: "'Noto Serif SC', serif",
        color: textColor,
      }}>
        个体规则
      </h3>

      <div style={{
        padding: '14px 18px',
        borderRadius: 10,
        background: isNight ? 'rgba(155, 107, 160, 0.08)' : 'rgba(155, 107, 160, 0.04)',
        borderLeft: '3px solid #9B6BA0',
      }}>
        <div style={{
          fontSize: 12,
          color: '#9B6BA0',
          marginBottom: 4,
          fontWeight: 500,
          fontFamily: "'Noto Serif SC', serif",
        }}>
          优先级最高
        </div>
        <div style={{
          fontSize: 13,
          color: textColor,
          lineHeight: 1.6,
        }}>
          个体规则可以覆盖分组规则和全局规则。为重要的人设置专属时间窗口，体现关系的独特性。
        </div>
      </div>

      <div>
        <div style={{
          fontSize: 12,
          color: subTextColor,
          marginBottom: 10,
          fontFamily: "'Noto Serif SC', serif",
        }}>
          已设置个体规则的联系人
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {customRuleContacts.map(c => {
            const group = SOCIAL_GROUPS.find(g => c.groups.includes(g.id));
            return (
              <div
                key={c.id}
                style={{
                  padding: '14px 18px',
                  borderRadius: 10,
                  background: isNight ? 'rgba(255,255,255,0.03)' : '#FFFEFA',
                  border: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                <div style={{
                  width: 36, height: 36,
                  borderRadius: '50%',
                  background: group
                    ? `linear-gradient(135deg, ${group.color}, ${group.color}90)`
                    : '#9B6BA0',
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
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 14,
                    fontWeight: 500,
                    fontFamily: "'Noto Serif SC', serif",
                    color: textColor,
                    marginBottom: 2,
                  }}>
                    {c.name}
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: subTextColor,
                  }}>
                    {c.role}
                  </div>
                </div>
                <div style={{
                  textAlign: 'right',
                }}>
                  <div style={{
                    fontSize: 11,
                    color: '#9B6BA0',
                    fontWeight: 500,
                    fontFamily: "'Noto Serif SC', serif",
                  }}>
                    专属窗口
                  </div>
                  <div style={{
                    fontSize: 10,
                    color: subTextColor,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    {c.effectiveRule.window}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button style={{
        padding: '12px 20px',
        borderRadius: 10,
        border: `1px dashed ${isNight ? 'rgba(255,255,255,0.2)' : 'rgba(43, 42, 38, 0.15)'}`,
        background: 'transparent',
        color: subTextColor,
        fontSize: 12,
        cursor: 'pointer',
        fontFamily: "'Noto Serif SC', serif",
      }}>
        + 为某个联系人设置专属规则
      </button>
    </div>
  );
}

// ============================================
// 时间窗口卡片组件
// ============================================
function TimeWindowCard({ title, description, window, color, isNight, textColor, subTextColor }) {
  const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

  return (
    <div style={{
      padding: '16px 20px',
      borderRadius: 12,
      background: isNight ? 'rgba(255,255,255,0.03)' : '#FFFEFA',
      border: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
      }}>
        <div>
          <div style={{
            fontSize: 14,
            fontWeight: 500,
            fontFamily: "'Noto Serif SC', serif",
            color: textColor,
            marginBottom: 4,
          }}>
            {title}
          </div>
          <div style={{
            fontSize: 12,
            color: subTextColor,
            opacity: 0.7,
          }}>
            {description}
          </div>
        </div>
        <div style={{
          fontSize: 18,
          fontWeight: 600,
          fontFamily: "'JetBrains Mono', monospace",
          color: color,
        }}>
          {window.time}
        </div>
      </div>

      {/* 星期可视化 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 6,
        marginBottom: 4,
      }}>
        {weekDays.map(day => {
          const isActive = window.days.includes(day);
          return (
            <div
              key={day}
              style={{
                padding: '8px 0',
                borderRadius: 6,
                textAlign: 'center',
                fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
                background: isActive
                  ? `${color}18`
                  : 'transparent',
                color: isActive ? color : subTextColor,
                opacity: isActive ? 1 : 0.4,
                border: `1px solid ${isActive ? `${color}30` : 'transparent'}`,
                fontWeight: isActive ? 500 : 400,
              }}
            >
              {day.slice(1)}
            </div>
          );
        })}
      </div>

      {/* 一天时间轴可视化 */}
      <div style={{
        marginTop: 10,
        padding: '10px 0',
        position: 'relative',
      }}>
        <div style={{
          height: 6,
          borderRadius: 3,
          background: isNight ? 'rgba(255,255,255,0.05)' : 'rgba(43, 42, 38, 0.05)',
          position: 'relative',
        }}>
          {/* 窗口时间条 */}
          {(() => {
            const [start, end] = window.time.split('-');
            const [sh, sm] = start.split(':').map(Number);
            const [eh, em] = end.split(':').map(Number);
            const startPct = ((sh + sm / 60) / 24) * 100;
            const endPct = ((eh + em / 60) / 24) * 100;
            const widthPct = endPct - startPct;
            return (
              <div style={{
                position: 'absolute',
                top: 0,
                left: `${startPct}%`,
                width: `${widthPct}%`,
                height: '100%',
                borderRadius: 3,
                background: `linear-gradient(90deg, ${color}60, ${color})`,
                boxShadow: `0 0 8px ${color}40`,
              }} />
            );
          })()}
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 4,
          fontSize: 9,
          color: subTextColor,
          opacity: 0.5,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>24:00</span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 社交统计视图
// ============================================
function SocialStatsView({ isNight, textColor, subTextColor }) {
  const stats = SOCIAL_STATS;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* 核心数据 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12,
        marginBottom: 28,
      }}>
        <StatCard label="本周社交时间" value={`${stats.thisWeek.totalMinutes}`} unit="分钟"
          isNight={isNight} textColor={textColor} subTextColor={subTextColor} />
        <StatCard label="消息数" value={stats.thisWeek.messageCount} unit="条"
          isNight={isNight} textColor={textColor} subTextColor={subTextColor} />
        <StatCard label="联系人数" value={stats.thisWeek.contactCount} unit="人"
          isNight={isNight} textColor={textColor} subTextColor={subTextColor} />
        <StatCard label="深度对话" value={stats.thisWeek.deepConversations} unit="次"
          isNight={isNight} textColor={textColor} subTextColor={subTextColor} />
      </div>

      {/* 分组分布 */}
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
          时间分布
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {stats.groupBreakdown.map(item => {
            const g = SOCIAL_GROUPS.find(x => x.name === item.group);
            const color = g?.color || '#8A8780';
            return (
              <div key={item.group}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 12,
                  color: textColor,
                  marginBottom: 6,
                }}>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
                    {item.group}
                  </span>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: subTextColor,
                    fontSize: 11,
                  }}>
                    {item.minutes} 分钟 · {item.percentage}%
                  </span>
                </div>
                <div style={{
                  height: 8,
                  borderRadius: 4,
                  background: isNight ? 'rgba(255,255,255,0.04)' : 'rgba(43, 42, 38, 0.04)',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${item.percentage}%`,
                    height: '100%',
                    borderRadius: 4,
                    background: color,
                    transition: 'width 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 时间窗口遵守情况 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12,
        marginBottom: 20,
      }}>
        <div style={{
          padding: '18px 20px',
          borderRadius: 12,
          background: isNight ? 'rgba(90, 122, 78, 0.08)' : 'rgba(90, 122, 78, 0.05)',
          border: `1px solid ${isNight ? 'rgba(90, 122, 78, 0.2)' : 'rgba(90, 122, 78, 0.15)'}`,
        }}>
          <div style={{
            fontSize: 11,
            color: '#5A7A4E',
            marginBottom: 8,
            fontFamily: "'Noto Serif SC', serif",
          }}>
            时间窗口遵守率
          </div>
          <div style={{
            fontSize: 32,
            fontWeight: 600,
            fontFamily: "'Noto Serif SC', serif",
            color: '#5A7A4E',
            marginBottom: 4,
          }}>
            {stats.windowCompliance}%
          </div>
          <div style={{
            fontSize: 11,
            color: subTextColor,
            opacity: 0.7,
          }}>
            大部分时候选择在窗口内处理消息
          </div>
        </div>
        <div style={{
          padding: '18px 20px',
          borderRadius: 12,
          background: isNight ? 'rgba(79, 70, 229, 0.08)' : 'rgba(79, 70, 229, 0.05)',
          border: `1px solid ${isNight ? 'rgba(79, 70, 229, 0.2)' : 'rgba(79, 70, 229, 0.15)'}`,
        }}>
          <div style={{
            fontSize: 11,
            color: '#4F46E5',
            marginBottom: 8,
            fontFamily: "'Noto Serif SC', serif",
          }}>
            平均响应时间
          </div>
          <div style={{
            fontSize: 32,
            fontWeight: 600,
            fontFamily: "'Noto Serif SC', serif",
            color: '#4F46E5',
            marginBottom: 4,
          }}>
            {stats.avgResponseTime}
          </div>
          <div style={{
            fontSize: 11,
            color: subTextColor,
            opacity: 0.7,
          }}>
            从容回复，不被消息绑架
          </div>
        </div>
      </div>

      {/* 说明文字 */}
      <div style={{
        padding: '16px 20px',
        borderRadius: 12,
        background: isNight ? 'rgba(255,255,255,0.02)' : 'rgba(43, 42, 38, 0.02)',
        border: `1px solid ${isNight ? 'rgba(255,255,255,0.04)' : 'rgba(43, 42, 38, 0.04)'}`,
        fontSize: 12,
        color: subTextColor,
        lineHeight: 1.7,
        fontFamily: "'Noto Serif SC', serif",
      }}>
        <p style={{ margin: '0 0 8px' }}>
          这些数据只是**记录**，不是目标。
        </p>
        <p style={{ margin: 0, opacity: 0.8 }}>
          社交时间多不代表更好，少也不代表更好。重要的是每一次社交是否给你带来了意义感和滋养。
          数据让你看见自己的状态，但不评判你的选择。
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value, unit, isNight, textColor, subTextColor }) {
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
        fontSize: 22,
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
  RulesView,
  RuleLevelBadge,
  GlobalRules,
  GroupRules,
  IndividualRules,
  TimeWindowCard,
  SocialStatsView,
  StatCard,
});
