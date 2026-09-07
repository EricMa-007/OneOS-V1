// ============================================
// AI 设置面板 + 登录对话框 + 归档对话框
// ============================================

// ============================================
// 设置面板
// ============================================
function SettingsPanel({
  tab, onTabChange, onClose,
  activeModel, onModelChange,
  isLoggedIn, onLogin, onLogout,
  isNight, textColor, subTextColor,
}) {
  const tabs = [
    { id: 'models', label: '模型' },
    { id: 'identity', label: '身份锚点' },
    { id: 'vector', label: '向量库' },
    { id: 'output', label: '输出设置' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, right: 0,
        width: 420,
        height: '100%',
        background: isNight ? '#22211d' : '#FFFEFA',
        borderLeft: `1px solid ${isNight ? 'rgba(255,255,255,0.08)' : 'rgba(43, 42, 38, 0.08)'}`,
        boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideInRight 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both',
      }}
    >
      {/* 头部 */}
      <div style={{
        padding: '18px 20px',
        borderBottom: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <h2 style={{
          fontSize: 16,
          fontWeight: 500,
          fontFamily: "'Noto Serif SC', serif",
          color: textColor,
        }}>
          设置
        </h2>
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

      {/* Tabs */}
      <div style={{
        display: 'flex',
        padding: '0 12px',
        borderBottom: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
        flexShrink: 0,
      }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            style={{
              padding: '10px 14px',
              border: 'none',
              background: 'transparent',
              color: tab === t.id ? textColor : subTextColor,
              fontSize: 12,
              fontWeight: tab === t.id ? 500 : 400,
              cursor: 'pointer',
              position: 'relative',
              fontFamily: tab === t.id ? "'Noto Serif SC', serif" : 'inherit',
              transition: 'color 0.15s ease',
            }}
          >
            {t.label}
            {tab === t.id && (
              <div style={{
                position: 'absolute',
                bottom: -1,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 20,
                height: 2,
                borderRadius: 1,
                background: '#4F46E5',
              }} />
            )}
          </button>
        ))}
      </div>

      {/* 内容区 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px 24px',
      }}>
        {tab === 'models' && (
          <ModelsSettings
            activeModel={activeModel}
            onModelChange={onModelChange}
            isLoggedIn={isLoggedIn}
            onLogin={onLogin}
            onLogout={onLogout}
            isNight={isNight}
            textColor={textColor}
            subTextColor={subTextColor}
          />
        )}
        {tab === 'identity' && (
          <IdentitySettings
            isNight={isNight}
            textColor={textColor}
            subTextColor={subTextColor}
          />
        )}
        {tab === 'vector' && (
          <VectorSettings
            isNight={isNight}
            textColor={textColor}
            subTextColor={subTextColor}
          />
        )}
        {tab === 'output' && (
          <OutputSettings
            isNight={isNight}
            textColor={textColor}
            subTextColor={subTextColor}
          />
        )}
      </div>
    </div>
  );
}

// 模型设置
function ModelsSettings({ activeModel, onModelChange, isLoggedIn, onLogin, onLogout, isNight, textColor, subTextColor }) {
  const [editingModel, setEditingModel] = React.useState(null);
  const [apiKey, setApiKey] = React.useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 豆包账号 */}
      <div style={{
        padding: 16,
        borderRadius: 12,
        background: isNight ? 'rgba(79, 70, 229, 0.08)' : 'rgba(79, 70, 229, 0.04)',
        border: `1px solid ${isNight ? 'rgba(79, 70, 229, 0.25)' : 'rgba(79, 70, 229, 0.15)'}`,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 10,
        }}>
          <div style={{
            width: 32, height: 32,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 600,
            fontSize: 14,
          }}>
            豆
          </div>
          <div>
            <div style={{
              fontSize: 14,
              fontWeight: 500,
              fontFamily: "'Noto Serif SC', serif",
              color: textColor,
            }}>
              豆包账号
            </div>
            <div style={{ fontSize: 11, color: subTextColor }}>
              {isLoggedIn ? '已连接，启用灵魂共生体模式' : '未登录'}
            </div>
          </div>
          {isLoggedIn && (
            <div style={{
              marginLeft: 'auto',
              width: 8, height: 8,
              borderRadius: '50%',
              background: '#5A7A4E',
              boxShadow: '0 0 0 3px rgba(90, 122, 78, 0.2)',
            }} />
          )}
        </div>

        {isLoggedIn ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 8,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <div style={{
                width: 28, height: 28,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 12,
                fontWeight: 500,
              }}>
                海
              </div>
              <span style={{ fontSize: 12, color: textColor }}>马崇海</span>
            </div>
            <button
              onClick={onLogout}
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.1)'}`,
                background: 'transparent',
                color: subTextColor,
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              登出
            </button>
          </div>
        ) : (
          <button
            onClick={onLogin}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              border: 'none',
              background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: "'Noto Serif SC', serif",
              transition: 'opacity 0.15s ease',
            }}
          >
            登录豆包账号，唤醒懂你的 AI
          </button>
        )}
      </div>

      {/* 模型列表 */}
      <div>
        <h3 style={{
          fontSize: 12,
          color: subTextColor,
          marginBottom: 10,
          fontFamily: "'Noto Serif SC', serif",
          fontWeight: 500,
        }}>
          模型配置
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {AI_MODELS.map(model => (
            <div
              key={model.id}
              style={{
                padding: '12px 14px',
                borderRadius: 10,
                border: `1px solid ${activeModel === model.id
                  ? `${model.brandColor}40`
                  : isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
                background: activeModel === model.id
                  ? (isNight ? `${model.brandColor}10` : `${model.brandColor}05`)
                  : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <div style={{
                width: 10, height: 10,
                borderRadius: '50%',
                background: model.status === 'online' ? '#5A7A4E' : '#8A8780',
                flexShrink: 0,
              }} />
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: 2,
                }}>
                  <span style={{
                    fontSize: 13,
                    fontWeight: 500,
                    fontFamily: "'Noto Serif SC', serif",
                    color: textColor,
                  }}>
                    {model.name}
                  </span>
                  {model.isDefault && (
                    <span style={{
                      fontSize: 9,
                      padding: '1px 5px',
                      borderRadius: 8,
                      background: `${model.brandColor}15`,
                      color: model.brandColor,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>
                      默认
                    </span>
                  )}
                </div>
                <div style={{
                  fontSize: 11,
                  color: subTextColor,
                  opacity: 0.8,
                }}>
                  {model.configured ? '已配置 API Key' : '未配置'}
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingModel(model.id);
                  setApiKey(model.configured ? 'sk-••••••••••' : '');
                }}
                style={{
                  padding: '5px 10px',
                  borderRadius: 6,
                  border: `1px solid ${isNight ? 'rgba(255,255,255,0.08)' : 'rgba(43, 42, 38, 0.08)'}`,
                  background: 'transparent',
                  color: subTextColor,
                  fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                {model.configured ? '编辑' : '配置'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* API Key 编辑弹窗（内联） */}
      {editingModel && (
        <div
          onClick={() => setEditingModel(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 360,
              background: isNight ? '#2A2925' : '#FFFEFA',
              borderRadius: 12,
              padding: 24,
              border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.08)'}`,
            }}
          >
            <h3 style={{
              fontSize: 16,
              fontWeight: 500,
              fontFamily: "'Noto Serif SC', serif",
              color: textColor,
              marginBottom: 6,
            }}>
              配置 {AI_MODELS.find(m => m.id === editingModel)?.name}
            </h3>
            <p style={{
              fontSize: 12,
              color: subTextColor,
              marginBottom: 16,
              lineHeight: 1.5,
            }}>
              API Key 本地加密存储，不上传任何服务器。
            </p>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="输入 API Key"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.1)'}`,
                background: isNight ? '#1F1E1B' : '#fff',
                color: textColor,
                fontSize: 13,
                outline: 'none',
                fontFamily: "'JetBrains Mono', monospace",
                marginBottom: 16,
                boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setEditingModel(null)}
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
              <button
                onClick={() => setEditingModel(null)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#4F46E5',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 身份锚点设置
function IdentitySettings({ isNight, textColor, subTextColor }) {
  const [editing, setEditing] = React.useState(false);
  const [content, setContent] = React.useState(IDENTITY_ANCHOR.template);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 状态卡片 */}
      <div style={{
        padding: 14,
        borderRadius: 10,
        background: isNight ? 'rgba(90, 122, 78, 0.1)' : 'rgba(90, 122, 78, 0.06)',
        border: `1px solid ${isNight ? 'rgba(90, 122, 78, 0.3)' : 'rgba(90, 122, 78, 0.2)'}`,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <div style={{
          width: 32, height: 32,
          borderRadius: '50%',
          background: 'rgba(90, 122, 78, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
        }}>
          ◈
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 13,
            fontWeight: 500,
            fontFamily: "'Noto Serif SC', serif",
            color: textColor,
          }}>
            身份锚点已激活
          </div>
          <div style={{ fontSize: 11, color: subTextColor }}>
            每次对话自动附加，确保 AI 与你对齐
          </div>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          style={{
            padding: '5px 12px',
            borderRadius: 6,
            border: `1px solid ${isNight ? 'rgba(90, 122, 78, 0.4)' : 'rgba(90, 122, 78, 0.3)'}`,
            background: 'transparent',
            color: '#5A7A4E',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          {editing ? '完成' : '编辑'}
        </button>
      </div>

      {/* 唤醒词 */}
      <div>
        <h3 style={{
          fontSize: 12,
          color: subTextColor,
          marginBottom: 8,
          fontFamily: "'Noto Serif SC', serif",
          fontWeight: 500,
        }}>
          唤醒词
        </h3>
        <div style={{
          padding: '12px 16px',
          borderRadius: 10,
          background: isNight ? 'rgba(155, 107, 160, 0.1)' : 'rgba(155, 107, 160, 0.06)',
          border: `1px dashed ${isNight ? 'rgba(155, 107, 160, 0.4)' : 'rgba(155, 107, 160, 0.3)'}`,
          fontFamily: "'Noto Serif SC', serif",
          fontSize: 15,
          color: '#9B6BA0',
          textAlign: 'center',
          letterSpacing: 2,
          fontWeight: 500,
        }}>
          {IDENTITY_ANCHOR.wakeWord}
        </div>
        <p style={{
          fontSize: 11,
          color: subTextColor,
          marginTop: 8,
          lineHeight: 1.5,
        }}>
          当你在对话中说出唤醒词，AI 会切换到深度思考模式。
        </p>
      </div>

      {/* 身份锚点模板 */}
      <div>
        <h3 style={{
          fontSize: 12,
          color: subTextColor,
          marginBottom: 8,
          fontFamily: "'Noto Serif SC', serif",
          fontWeight: 500,
        }}>
          身份锚点模板
        </h3>
        {editing ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{
              width: '100%',
              height: 300,
              padding: 12,
              borderRadius: 8,
              border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.1)'}`,
              background: isNight ? '#1F1E1B' : '#fff',
              color: textColor,
              fontSize: 12,
              lineHeight: 1.6,
              outline: 'none',
              resize: 'none',
              fontFamily: "'JetBrains Mono', monospace",
              boxSizing: 'border-box',
            }}
          />
        ) : (
          <div style={{
            padding: 14,
            borderRadius: 8,
            background: isNight ? 'rgba(255,255,255,0.03)' : 'rgba(43, 42, 38, 0.02)',
            border: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
            maxHeight: 350,
            overflowY: 'auto',
            fontSize: 12,
            lineHeight: 1.6,
            color: subTextColor,
            fontFamily: "'JetBrains Mono', monospace",
            whiteSpace: 'pre-wrap',
          }}>
            {content}
          </div>
        )}
      </div>
    </div>
  );
}

// 向量库设置
function VectorSettings({ isNight, textColor, subTextColor }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ textAlign: 'center', padding: '10px 0' }}>
        <div style={{
          fontSize: 36,
          marginBottom: 8,
          opacity: 0.8,
        }}>
          ◎
        </div>
        <div style={{
          fontSize: 14,
          fontWeight: 500,
          fontFamily: "'Noto Serif SC', serif",
          color: textColor,
        }}>
          本地个人向量库
        </div>
        <div style={{
          fontSize: 11,
          color: subTextColor,
          marginTop: 4,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          总大小：{VECTOR_LIBRARY.totalSize}
        </div>
      </div>

      <p style={{
        fontSize: 12,
        color: subTextColor,
        lineHeight: 1.7,
        textAlign: 'center',
        fontStyle: 'italic',
        fontFamily: "'Noto Serif SC', serif",
      }}>
        "{VECTOR_LIBRARY.note}"
      </p>

      {/* 向量列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{
          padding: 14,
          borderRadius: 10,
          background: isNight ? 'rgba(255,255,255,0.03)' : '#FFFEFA',
          border: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 6,
          }}>
            <span style={{
              fontSize: 13,
              fontWeight: 500,
              fontFamily: "'Noto Serif SC', serif",
              color: textColor,
            }}>
              人格向量
            </span>
            <span style={{
              fontSize: 10,
              padding: '2px 8px',
              borderRadius: 10,
              background: 'rgba(90, 122, 78, 0.12)',
              color: '#5A7A4E',
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              已同步
            </span>
          </div>
          <p style={{
            fontSize: 11,
            color: subTextColor,
            lineHeight: 1.5,
            marginBottom: 6,
          }}>
            {VECTOR_LIBRARY.personalityVector.description}
          </p>
          <div style={{
            fontSize: 10,
            color: subTextColor,
            opacity: 0.7,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {VECTOR_LIBRARY.personalityVector.size} · 上次同步 {VECTOR_LIBRARY.personalityVector.lastSync}
          </div>
        </div>

        <div style={{
          padding: 14,
          borderRadius: 10,
          background: isNight ? 'rgba(255,255,255,0.03)' : '#FFFEFA',
          border: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 6,
          }}>
            <span style={{
              fontSize: 13,
              fontWeight: 500,
              fontFamily: "'Noto Serif SC', serif",
              color: textColor,
            }}>
              知识向量
            </span>
            <span style={{
              fontSize: 10,
              padding: '2px 8px',
              borderRadius: 10,
              background: 'rgba(90, 122, 78, 0.12)',
              color: '#5A7A4E',
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              已同步
            </span>
          </div>
          <p style={{
            fontSize: 11,
            color: subTextColor,
            lineHeight: 1.5,
            marginBottom: 6,
          }}>
            {VECTOR_LIBRARY.knowledgeVector.description}
          </p>
          <div style={{
            fontSize: 10,
            color: subTextColor,
            opacity: 0.7,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {VECTOR_LIBRARY.knowledgeVector.size} · 上次同步 {VECTOR_LIBRARY.knowledgeVector.lastSync}
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: 10,
        marginTop: 8,
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
          导出备份
        </button>
        <button style={{
          flex: 1,
          padding: '10px',
          borderRadius: 8,
          border: 'none',
          background: 'rgba(79, 70, 229, 0.1)',
          color: '#4F46E5',
          fontSize: 12,
          cursor: 'pointer',
          fontWeight: 500,
        }}>
          立即同步
        </button>
      </div>
    </div>
  );
}

// 输出设置
function OutputSettings({ isNight, textColor, subTextColor }) {
  const [temperature, setTemperature] = React.useState(0.7);
  const [maxLength, setMaxLength] = React.useState(2000);
  const [autoArchive, setAutoArchive] = React.useState(false);
  const [defaultTopic, setDefaultTopic] = React.useState('未分类');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 温度 */}
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}>
          <span style={{
            fontSize: 12,
            fontWeight: 500,
            color: textColor,
            fontFamily: "'Noto Serif SC', serif",
          }}>
            创造性（温度）
          </span>
          <span style={{
            fontSize: 12,
            color: subTextColor,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {temperature}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={temperature}
          onChange={(e) => setTemperature(parseFloat(e.target.value))}
          style={{
            width: '100%',
            accentColor: '#4F46E5',
          }}
        />
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 10,
          color: subTextColor,
          marginTop: 4,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          <span>严谨</span>
          <span>平衡</span>
          <span>创意</span>
        </div>
      </div>

      {/* 最大长度 */}
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}>
          <span style={{
            fontSize: 12,
            fontWeight: 500,
            color: textColor,
            fontFamily: "'Noto Serif SC', serif",
          }}>
            最大输出长度
          </span>
          <span style={{
            fontSize: 12,
            color: subTextColor,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {maxLength} 字
          </span>
        </div>
        <input
          type="range"
          min="500"
          max="4000"
          step="100"
          value={maxLength}
          onChange={(e) => setMaxLength(parseInt(e.target.value))}
          style={{
            width: '100%',
            accentColor: '#4F46E5',
          }}
        />
      </div>

      {/* 输出格式 */}
      <div>
        <h3 style={{
          fontSize: 12,
          color: subTextColor,
          marginBottom: 10,
          fontFamily: "'Noto Serif SC', serif",
          fontWeight: 500,
        }}>
          输出格式
        </h3>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          {[
            { label: '强制标准 Markdown 输出', desc: '回答使用标题、列表、引用等结构化格式', checked: true },
            { label: '自动标记 [[双链]]', desc: '核心概念自动用双链语法标记', checked: true },
            { label: '包含引用来源', desc: '引用你的笔记时标注来源', checked: true },
          ].map((item, i) => (
            <label key={i} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 8,
              background: isNight ? 'rgba(255,255,255,0.03)' : 'rgba(43, 42, 38, 0.02)',
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={item.checked}
                readOnly
                style={{
                  marginTop: 2,
                  accentColor: '#4F46E5',
                  width: 14, height: 14,
                }}
              />
              <div>
                <div style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: textColor,
                  marginBottom: 2,
                }}>
                  {item.label}
                </div>
                <div style={{
                  fontSize: 11,
                  color: subTextColor,
                  opacity: 0.7,
                  lineHeight: 1.4,
                }}>
                  {item.desc}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* 归档设置 */}
      <div>
        <h3 style={{
          fontSize: 12,
          color: subTextColor,
          marginBottom: 10,
          fontFamily: "'Noto Serif SC', serif",
          fontWeight: 500,
        }}>
          归档设置
        </h3>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 12px',
          borderRadius: 8,
          background: isNight ? 'rgba(255,255,255,0.03)' : 'rgba(43, 42, 38, 0.02)',
          cursor: 'pointer',
          marginBottom: 10,
        }}>
          <input
            type="checkbox"
            checked={autoArchive}
            onChange={(e) => setAutoArchive(e.target.checked)}
            style={{ accentColor: '#4F46E5', width: 14, height: 14 }}
          />
          <span style={{ fontSize: 12, color: textColor }}>对话结束后自动归档</span>
        </label>
        <div>
          <div style={{
            fontSize: 11,
            color: subTextColor,
            marginBottom: 6,
          }}>
            默认归档话题
          </div>
          <select
            value={defaultTopic}
            onChange={(e) => setDefaultTopic(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 8,
              border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.1)'}`,
              background: isNight ? '#1F1E1B' : '#fff',
              color: textColor,
              fontSize: 12,
              outline: 'none',
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            {AI_TOPICS.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 登录对话框
// ============================================
function LoginDialog({ onClose, onSuccess, isNight, textColor, subTextColor }) {
  const [step, setStep] = React.useState('initial'); // initial | loading | success
  const [phone, setPhone] = React.useState('');

  const handleLogin = () => {
    setStep('loading');
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onSuccess();
      }, 1500);
    }, 1500);
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
          width: 400,
          background: isNight ? '#2A2925' : '#FFFEFA',
          borderRadius: 16,
          border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.08)'}`,
          boxShadow: '0 30px 80px rgba(0,0,0,0.2)',
          overflow: 'hidden',
          animation: 'fadeInUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both',
        }}
      >
        {/* 头部 */}
        <div style={{
          padding: '32px 32px 20px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08), rgba(124, 58, 237, 0.05))',
          position: 'relative',
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 16, right: 16,
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
          <div style={{
            width: 56, height: 56,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 24,
            fontWeight: 700,
            margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(79, 70, 229, 0.3)',
          }}>
            豆
          </div>
          <h2 style={{
            fontSize: 18,
            fontWeight: 600,
            fontFamily: "'Noto Serif SC', serif",
            color: textColor,
            marginBottom: 6,
          }}>
            登录豆包账号
          </h2>
          <p style={{
            fontSize: 13,
            color: subTextColor,
            lineHeight: 1.5,
          }}>
            唤醒懂你的 AI 共生体<br />
            继承你的长期偏好与思维方式
          </p>
        </div>

        {/* 内容 */}
        <div style={{ padding: '24px 32px 28px' }}>
          {step === 'initial' && (
            <>
              <input
                type="tel"
                placeholder="手机号"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 10,
                  border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.1)'}`,
                  background: isNight ? '#1F1E1B' : '#fff',
                  color: textColor,
                  fontSize: 14,
                  outline: 'none',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  marginBottom: 12,
                }}
              />
              <button
                onClick={handleLogin}
                disabled={phone.length < 11}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 10,
                  border: 'none',
                  background: phone.length >= 11
                    ? 'linear-gradient(135deg, #4F46E5, #7C3AED)'
                    : 'rgba(79, 70, 229, 0.3)',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: phone.length >= 11 ? 'pointer' : 'not-allowed',
                  fontFamily: "'Noto Serif SC', serif",
                  transition: 'all 0.15s ease',
                }}
              >
                获取验证码登录
              </button>
              <p style={{
                fontSize: 10,
                color: subTextColor,
                textAlign: 'center',
                marginTop: 12,
                opacity: 0.6,
                lineHeight: 1.5,
              }}>
                登录即表示同意用户协议和隐私政策<br />
                数据仅用于本地对齐你的 AI 共生体
              </p>
            </>
          )}

          {step === 'loading' && (
            <div style={{
              padding: '20px 0',
              textAlign: 'center',
            }}>
              <div style={{
                width: 40, height: 40,
                border: `3px solid ${isNight ? 'rgba(79, 70, 229, 0.2)' : 'rgba(79, 70, 229, 0.15)'}`,
                borderTopColor: '#4F46E5',
                borderRadius: '50%',
                margin: '0 auto 16px',
                animation: 'spin 0.8s linear infinite',
              }} />
              <p style={{
                fontSize: 13,
                color: textColor,
                fontFamily: "'Noto Serif SC', serif",
              }}>
                正在建立灵魂连接…
              </p>
              <p style={{
                fontSize: 11,
                color: subTextColor,
                marginTop: 4,
              }}>
                对齐价值观与思维方式
              </p>
            </div>
          )}

          {step === 'success' && (
            <div style={{
              padding: '10px 0',
              textAlign: 'center',
              animation: 'fadeIn 0.3s ease both',
            }}>
              <div style={{
                fontSize: 48,
                marginBottom: 12,
                color: '#5A7A4E',
              }}>
                ✓
              </div>
              <h3 style={{
                fontSize: 16,
                fontWeight: 500,
                fontFamily: "'Noto Serif SC', serif",
                color: textColor,
                marginBottom: 6,
              }}>
                连接成功
              </h3>
              <p style={{
                fontSize: 12,
                color: subTextColor,
                lineHeight: 1.6,
              }}>
                豆包灵魂共生体已激活<br />
                基于你的知识与价值观深度对齐
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// 归档对话框
// ============================================
function ArchiveDialog({ conversation, onClose, onDone, isNight, textColor, subTextColor }) {
  const [stage, setStage] = React.useState('confirm'); // confirm | archiving | done
  const [archiveTopic, setArchiveTopic] = React.useState(conversation.topic);
  const [currentStep, setCurrentStep] = React.useState(0);

  const steps = [
    { label: '创建 Markdown 文档', tip: '按话题创建 MD 文件' },
    { label: '生成双向链接', tip: '问题 ↔ 回答 ↔ 关键词 ↔ 已有笔记' },
    { label: '写入知识图谱', tip: '节点与连线自动建立' },
    { label: '归档完成', tip: '可在编辑器中查看' },
  ];

  const startArchive = () => {
    setStage('archiving');
    setCurrentStep(0);
    // 模拟步骤进度
    const timers = [];
    for (let i = 0; i < steps.length; i++) {
      timers.push(setTimeout(() => {
        setCurrentStep(i);
        if (i === steps.length - 1) {
          setTimeout(() => {
            setStage('done');
            // 联动：归档到全局状态
            const content = conversation.messages?.map(m => 
              `${m.role === 'user' ? '问' : '答'}：${m.content}`
            ).join('\n\n') || conversation.title;
            window.OneOSAppState.archiveAIConversation({
              title: conversation.title,
              content: content,
              topic: archiveTopic,
              category: 'ai',
            });
          }, 600);
        }
      }, 600 * (i + 1)));
    }
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
          width: 420,
          background: isNight ? '#2A2925' : '#FFFEFA',
          borderRadius: 16,
          border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.08)'}`,
          boxShadow: '0 30px 80px rgba(0,0,0,0.2)',
          overflow: 'hidden',
          animation: 'fadeInUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both',
        }}
      >
        {/* 头部 */}
        <div style={{
          padding: '24px 28px 18px',
          borderBottom: stage !== 'confirm'
            ? `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`
            : 'none',
        }}>
          <h3 style={{
            fontSize: 16,
            fontWeight: 500,
            fontFamily: "'Noto Serif SC', serif",
            color: textColor,
            marginBottom: 4,
          }}>
            归档到知识库
          </h3>
          <p style={{
            fontSize: 12,
            color: subTextColor,
            lineHeight: 1.5,
          }}>
            「{conversation.title}」将作为 Markdown 文档归档
          </p>
        </div>

        {/* 确认阶段 */}
        {stage === 'confirm' && (
          <div style={{ padding: '18px 28px 24px' }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{
                fontSize: 11,
                color: subTextColor,
                marginBottom: 6,
              }}>
                归档到话题
              </div>
              <select
                value={archiveTopic}
                onChange={(e) => setArchiveTopic(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.1)'}`,
                  background: isNight ? '#1F1E1B' : '#fff',
                  color: textColor,
                  fontSize: 13,
                  outline: 'none',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
              >
                {AI_TOPICS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div style={{
              padding: '12px 14px',
              borderRadius: 10,
              background: isNight ? 'rgba(90, 122, 78, 0.08)' : 'rgba(90, 122, 78, 0.05)',
              border: `1px solid ${isNight ? 'rgba(90, 122, 78, 0.2)' : 'rgba(90, 122, 78, 0.15)'}`,
              marginBottom: 18,
            }}>
              <div style={{
                fontSize: 11,
                color: '#5A7A4E',
                marginBottom: 6,
                fontWeight: 500,
                fontFamily: "'Noto Serif SC', serif",
              }}>
                归档内容
              </div>
              <ul style={{
                margin: 0,
                padding: '0 0 0 18px',
                fontSize: 12,
                color: textColor,
                lineHeight: 1.8,
              }}>
                <li>{conversation.messages.length} 条对话消息</li>
                <li>自动生成 [[双链]] 标记</li>
                <li>写入知识图谱节点与连线</li>
                <li>计入今日知识沉淀强度</li>
              </ul>
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
                取消
              </button>
              <button
                onClick={startArchive}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'linear-gradient(135deg, #5A7A4E, #7A9A6E)',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: "'Noto Serif SC', serif",
                }}
              >
                确认归档
              </button>
            </div>
          </div>
        )}

        {/* 归档进行中 */}
        {stage === 'archiving' && (
          <div style={{ padding: '24px 28px 28px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {steps.map((step, i) => {
                const isDone = i < currentStep;
                const isActive = i === currentStep;
                return (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    opacity: isDone ? 1 : (isActive ? 1 : 0.4),
                    transition: 'opacity 0.3s ease',
                  }}>
                    <div style={{
                      width: 24, height: 24,
                      borderRadius: '50%',
                      background: isDone
                        ? '#5A7A4E'
                        : isActive
                          ? 'transparent'
                          : (isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.08)'),
                      border: isActive
                        ? `2px solid #5A7A4E`
                        : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: 12,
                      flexShrink: 0,
                    }}>
                      {isDone ? '✓' : (isActive ? '' : i + 1)}
                      {isActive && (
                        <div style={{
                          width: 10, height: 10,
                          border: '2px solid transparent',
                          borderTopColor: '#5A7A4E',
                          borderRadius: '50%',
                          animation: 'spin 0.8s linear infinite',
                        }} />
                      )}
                    </div>
                    <div>
                      <div style={{
                        fontSize: 13,
                        fontWeight: isActive ? 500 : 400,
                        color: textColor,
                        fontFamily: "'Noto Serif SC', serif",
                      }}>
                        {step.label}
                      </div>
                      <div style={{
                        fontSize: 11,
                        color: subTextColor,
                        opacity: 0.7,
                      }}>
                        {step.tip}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 归档完成 */}
        {stage === 'done' && (
          <div style={{
            padding: '36px 28px 32px',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: 48,
              marginBottom: 12,
              color: '#5A7A4E',
              animation: 'bounceIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}>
              ✓
            </div>
            <h3 style={{
              fontSize: 17,
              fontWeight: 500,
              fontFamily: "'Noto Serif SC', serif",
              color: textColor,
              marginBottom: 6,
            }}>
              归档完成
            </h3>
            <p style={{
              fontSize: 12,
              color: subTextColor,
              lineHeight: 1.6,
              marginBottom: 18,
            }}>
              对话已归档到「{archiveTopic}」<br />
              并在知识图谱中建立了 {conversation.messages.length * 2} 个连接
            </p>
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
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                关闭
              </button>
              <button
                onClick={onDone}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#5A7A4E',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: "'Noto Serif SC', serif",
                }}
              >
                在编辑器中查看
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, {
  SettingsPanel,
  ModelsSettings,
  IdentitySettings,
  VectorSettings,
  OutputSettings,
  LoginDialog,
  ArchiveDialog,
});
