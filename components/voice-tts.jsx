// ============================================
// 语音朗读（TTS）+ 音色管理 + 沟通闭环演示 + 设置
// ============================================

// ============================================
// 语音朗读视图
// ============================================
function VoiceListenView({ isNight, textColor, subTextColor }) {
  const [selectedVoice, setSelectedVoice] = React.useState('v-system-female');
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [waveHeights, setWaveHeights] = React.useState(Array(50).fill(5));
  const [speed, setSpeed] = React.useState(1.0);

  const currentVoice = VOICE_LIBRARY.find(v => v.id === selectedVoice) || VOICE_LIBRARY[1];
  const sampleText = `知识不是拥有的东西，而是你存在的方式。

当我们说一个人"有知识"，我们到底在说什么？
是说他脑子里装了很多信息吗？还是说他能够用一种不同的方式来看待世界？

我越来越相信是后者。

知识改变的不是你知道什么，而是你是谁。
它重塑你的认知结构，重塑你和世界的关系。
从这个意义上说，知识升维，就是人的升维。`;

  const paragraphs = sampleText.split('\n\n');
  const currentParaIndex = Math.floor((progress / 100) * paragraphs.length);

  // 波形动画
  React.useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setWaveHeights(prev => prev.map(() => 3 + Math.random() * 18));
        setProgress(prev => {
          const next = prev + (0.3 * speed);
          return next >= 100 ? 0 : next;
        });
      }, 100);
    } else {
      setWaveHeights(Array(50).fill(5));
    }
    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 28px' }}>
      {/* 朗读书写区域 */}
      <div style={{
        padding: '28px 32px',
        borderRadius: 16,
        background: isNight ? '#262522' : '#FFFEFA',
        border: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
        marginBottom: 24,
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
      }}>
        {/* 标题 + 音色选择 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}>
          <div>
            <div style={{
              fontSize: 16,
              fontWeight: 500,
              fontFamily: "'Noto Serif SC', serif",
              color: textColor,
              marginBottom: 4,
            }}>
              朗读示例 · 《知识与存在》
            </div>
            <div style={{
              fontSize: 11,
              color: subTextColor,
              opacity: 0.7,
            }}>
              节选自升维笔记
            </div>
          </div>

          {/* 音色选择器 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <span style={{ fontSize: 11, color: subTextColor }}>音色</span>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.1)'}`,
                background: isNight ? '#2A2925' : '#FFFEFA',
                color: textColor,
                fontSize: 12,
                fontFamily: "'Noto Serif SC', serif",
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {VOICE_LIBRARY.map(v => (
                <option key={v.id} value={v.id}>{v.name} · {v.style}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 朗读文本（同步高亮） */}
        <div style={{
          fontSize: 14,
          lineHeight: 2.2,
          color: textColor,
          fontFamily: "'Noto Serif SC', serif",
          marginBottom: 24,
          minHeight: 180,
        }}>
          {paragraphs.map((p, i) => (
            <p
              key={i}
              style={{
                margin: '0 0 16px',
                padding: '6px 12px',
                borderRadius: 8,
                background: isPlaying && i === currentParaIndex
                  ? `${currentVoice.color}10`
                  : 'transparent',
                borderLeft: isPlaying && i === currentParaIndex
                  ? `3px solid ${currentVoice.color}`
                  : '3px solid transparent',
                color: isPlaying && i === currentParaIndex
                  ? currentVoice.color
                  : textColor,
                transition: 'all 0.4s ease',
                cursor: 'pointer',
              }}
              onClick={() => {
                setIsPlaying(true);
                setProgress((i / paragraphs.length) * 100);
              }}
            >
              {p}
            </p>
          ))}
        </div>

        {/* 播放控制条 */}
        <div style={{
          padding: '16px 20px',
          borderRadius: 12,
          background: isNight
            ? `${currentVoice.color}08`
            : `${currentVoice.color}05`,
          border: `1px solid ${currentVoice.color}20`,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 12,
          }}>
            {/* 后退 */}
            <button
              onClick={() => setProgress(Math.max(0, progress - 10))}
              style={{
                width: 32, height: 32,
                borderRadius: '50%',
                border: 'none',
                background: 'transparent',
                color: currentVoice.color,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
              }}
            >
              ←
            </button>

            {/* 播放/暂停 */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                width: 48, height: 48,
                borderRadius: '50%',
                border: 'none',
                background: `linear-gradient(135deg, ${currentVoice.color}, ${currentVoice.color}DD)`,
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 16px ${currentVoice.color}40`,
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              {isPlaying ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="8,5 20,12 8,19" />
                </svg>
              )}
            </button>

            {/* 前进 */}
            <button
              onClick={() => setProgress(Math.min(100, progress + 10))}
              style={{
                width: 32, height: 32,
                borderRadius: '50%',
                border: 'none',
                background: 'transparent',
                color: currentVoice.color,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
              }}
            >
              →
            </button>

            {/* 波形 + 进度 */}
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                height: 28,
                marginBottom: 4,
              }}>
                {waveHeights.map((h, i) => {
                  const isPast = (i / waveHeights.length) * 100 <= progress;
                  return (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        minWidth: 1,
                        height: `${Math.max(h, 3)}px`,
                        borderRadius: 1,
                        background: isPast ? currentVoice.color : (isNight ? 'rgba(255,255,255,0.15)' : 'rgba(43, 42, 38, 0.12)'),
                        transition: 'height 0.1s ease, background 0.3s ease',
                      }}
                    />
                  );
                })}
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 10,
                color: subTextColor,
                fontFamily: "'JetBrains Mono', monospace",
                opacity: 0.6,
              }}>
                <span>{Math.floor(progress * 2.4)}s</span>
                <span>2:40</span>
              </div>
            </div>

            {/* 语速调节 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}>
              {[0.75, 1.0, 1.25, 1.5].map(s => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 6,
                    border: 'none',
                    background: speed === s ? `${currentVoice.color}20` : 'transparent',
                    color: speed === s ? currentVoice.color : subTextColor,
                    fontSize: 10,
                    fontFamily: "'JetBrains Mono', monospace",
                    cursor: 'pointer',
                    fontWeight: speed === s ? 600 : 400,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* 音色信息 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            paddingTop: 12,
            borderTop: `1px solid ${currentVoice.color}15`,
          }}>
            <div style={{
              width: 24, height: 24,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${currentVoice.color}, ${currentVoice.color}90)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 11,
              fontWeight: 500,
              fontFamily: "'Noto Serif SC', serif",
            }}>
              {currentVoice.name[0]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 12,
                fontWeight: 500,
                color: currentVoice.color,
                fontFamily: "'Noto Serif SC', serif",
              }}>
                {currentVoice.name}
              </div>
              <div style={{
                fontSize: 10,
                color: subTextColor,
                opacity: 0.7,
              }}>
                {currentVoice.style}
              </div>
            </div>
            <span style={{
              fontSize: 10,
              padding: '2px 8px',
              borderRadius: 10,
              background: `${currentVoice.color}15`,
              color: currentVoice.color,
            }}>
              {currentVoice.type === 'system' ? '系统音色' : '个人音色'}
            </span>
          </div>
        </div>
      </div>

      {/* 语音 vs 文字 对比 */}
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
          语音 → 文字 → 知识的转化
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr auto 1fr',
          alignItems: 'center',
          gap: 12,
        }}>
          <FlowStage
            icon="♪"
            title="语音"
            desc="最自然的输入"
            color="#B56B3A"
            isNight={isNight}
            textColor={textColor}
            subTextColor={subTextColor}
          />
          <ArrowChar isNight={isNight} subTextColor={subTextColor} />
          <FlowStage
            icon="文"
            title="文字"
            desc="可检索可阅读"
            color="#4F46E5"
            isNight={isNight}
            textColor={textColor}
            subTextColor={subTextColor}
          />
          <ArrowChar isNight={isNight} subTextColor={subTextColor} />
          <FlowStage
            icon="◈"
            title="知识"
            desc="升维内化沉淀"
            color="#5A7A4E"
            isNight={isNight}
            textColor={textColor}
            subTextColor={subTextColor}
          />
        </div>
        <div style={{
          marginTop: 16,
          padding: '12px 16px',
          borderRadius: 8,
          fontSize: 11,
          color: subTextColor,
          lineHeight: 1.7,
          background: isNight ? 'rgba(255,255,255,0.02)' : 'rgba(43, 42, 38, 0.02)',
          fontFamily: "'Noto Serif SC', serif",
        }}>
          <span style={{ color: '#B56B3A', fontWeight: 500 }}>音频</span>人类几乎不会再听第二遍，
          但 <span style={{ color: '#4F46E5', fontWeight: 500 }}>文字</span> 可以反复读。
          所以文字才是知识的终极存储形态。语音只是最自然的输入/输出接口，最终一切落地为
          <span style={{ color: '#5A7A4E', fontWeight: 500 }}> 可沉淀、可检索、可升维的文字</span>。
        </div>
      </div>
    </div>
  );
}

function FlowStage({ icon, title, desc, color, isNight, textColor, subTextColor }) {
  return (
    <div style={{
      padding: '16px 12px',
      borderRadius: 12,
      background: `${color}08`,
      border: `1px solid ${color}20`,
      textAlign: 'center',
    }}>
      <div style={{
        fontSize: 28,
        color: color,
        marginBottom: 6,
      }}>
        {icon}
      </div>
      <div style={{
        fontSize: 14,
        fontWeight: 500,
        color: color,
        fontFamily: "'Noto Serif SC', serif",
        marginBottom: 2,
      }}>
        {title}
      </div>
      <div style={{
        fontSize: 10,
        color: subTextColor,
        opacity: 0.7,
      }}>
        {desc}
      </div>
    </div>
  );
}

function ArrowChar({ isNight, subTextColor }) {
  return (
    <div style={{
      fontSize: 20,
      color: subTextColor,
      opacity: 0.4,
      fontWeight: 300,
    }}>
      →
    </div>
  );
}

// ============================================
// 音色管理视图
// ============================================
function VoiceLibraryView({ isNight, textColor, subTextColor }) {
  const [activeSection, setActiveSection] = React.useState('all'); // all | system | personal | clone
  const [showCloneFlow, setShowCloneFlow] = React.useState(false);
  const [previewVoice, setPreviewVoice] = React.useState(null);

  const filteredVoices = React.useMemo(() => {
    if (activeSection === 'system') return VOICE_LIBRARY.filter(v => v.type === 'system');
    if (activeSection === 'personal') return VOICE_LIBRARY.filter(v => v.type === 'personal');
    return VOICE_LIBRARY;
  }, [activeSection]);

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 28px' }}>
      {/* 分段切换 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
      }}>
        <div style={{
          display: 'flex',
          gap: 4,
          background: isNight ? 'rgba(255,255,255,0.03)' : 'rgba(43, 42, 38, 0.03)',
          borderRadius: 8,
          padding: 3,
        }}>
          {[
            { id: 'all', label: '全部音色' },
            { id: 'system', label: '系统音色' },
            { id: 'personal', label: '个人音色' },
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              style={{
                padding: '6px 16px',
                borderRadius: 6,
                border: 'none',
                background: activeSection === s.id
                  ? (isNight ? 'rgba(255,255,255,0.06)' : '#fff')
                  : 'transparent',
                color: activeSection === s.id ? textColor : subTextColor,
                fontSize: 12,
                fontWeight: activeSection === s.id ? 500 : 400,
                cursor: 'pointer',
                fontFamily: activeSection === s.id ? "'Noto Serif SC', serif" : 'inherit',
                boxShadow: activeSection === s.id ? '0 1px 3px rgba(0,0,0,0.04)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowCloneFlow(true)}
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
          + 录制我的声音
        </button>
      </div>

      {/* 音色卡片网格 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 16,
        marginBottom: 32,
      }}>
        {filteredVoices.map(voice => (
          <VoiceCard
            key={voice.id}
            voice={voice}
            onPreview={() => setPreviewVoice(voice)}
            isNight={isNight}
            textColor={textColor}
            subTextColor={subTextColor}
          />
        ))}
      </div>

      {/* 音色开放范围 */}
      <div style={{
        padding: '20px 24px',
        borderRadius: 14,
        background: isNight ? 'rgba(255,255,255,0.03)' : '#FFFEFA',
        border: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
      }}>
        <h3 style={{
          fontSize: 14,
          fontWeight: 500,
          fontFamily: "'Noto Serif SC', serif",
          color: textColor,
          marginBottom: 16,
        }}>
          我的音色开放范围
        </h3>
        <p style={{
          fontSize: 12,
          color: subTextColor,
          marginBottom: 14,
          lineHeight: 1.6,
        }}>
          控制谁可以用你的声音来朗读文字。音色是你身份的一部分，谨慎开放。
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { id: 'all', label: '开放给所有人', desc: '任何 OneOS 用户都可以用你的声音朗读他们收到的你的消息', recommended: false },
            { id: 'core', label: '仅核心圈', desc: '只有核心圈联系人可以用你的声音朗读你发出的文字', recommended: true, current: true },
            { id: 'none', label: '不开放', desc: '所有人听到的都是系统默认音色，你的声音仅自己可见', recommended: false },
          ].map(option => (
            <div
              key={option.id}
              style={{
                padding: '14px 18px',
                borderRadius: 10,
                border: `1px solid ${option.current
                  ? '#5A7A4E40'
                  : (isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)')}`,
                background: option.current
                  ? (isNight ? 'rgba(90, 122, 78, 0.08)' : 'rgba(90, 122, 78, 0.05)')
                  : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{
                width: 20, height: 20,
                borderRadius: '50%',
                border: `2px solid ${option.current ? '#5A7A4E' : (isNight ? 'rgba(255,255,255,0.2)' : 'rgba(43, 42, 38, 0.2)')}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {option.current && (
                  <div style={{
                    width: 10, height: 10,
                    borderRadius: '50%',
                    background: '#5A7A4E',
                  }} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: textColor,
                  marginBottom: 3,
                  fontFamily: "'Noto Serif SC', serif",
                }}>
                  {option.label}
                  {option.recommended && (
                    <span style={{
                      marginLeft: 8,
                      fontSize: 10,
                      padding: '1px 8px',
                      borderRadius: 8,
                      background: 'rgba(90, 122, 78, 0.15)',
                      color: '#5A7A4E',
                    }}>
                      推荐
                    </span>
                  )}
                </div>
                <div style={{
                  fontSize: 11,
                  color: subTextColor,
                  opacity: 0.7,
                }}>
                  {option.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 音色克隆流程弹窗 */}
      {showCloneFlow && (
        <CloneVoiceDialog
          onClose={() => setShowCloneFlow(false)}
          isNight={isNight}
          textColor={textColor}
          subTextColor={subTextColor}
        />
      )}

      {/* 音色预览弹窗 */}
      {previewVoice && (
        <VoicePreviewDialog
          voice={previewVoice}
          onClose={() => setPreviewVoice(null)}
          isNight={isNight}
          textColor={textColor}
          subTextColor={subTextColor}
        />
      )}
    </div>
  );
}

function VoiceCard({ voice, onPreview, isNight, textColor, subTextColor }) {
  return (
    <div
      style={{
        padding: '18px',
        borderRadius: 12,
        background: isNight ? '#262522' : '#FFFEFA',
        border: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${voice.color}30`;
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.04)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
      }}>
        <div style={{
          width: 44, height: 44,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${voice.color}, ${voice.color}90)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 18,
          fontWeight: 500,
          flexShrink: 0,
          fontFamily: "'Noto Serif SC', serif",
        }}>
          {voice.name[0]}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 15,
            fontWeight: 500,
            fontFamily: "'Noto Serif SC', serif",
            color: textColor,
            marginBottom: 2,
          }}>
            {voice.name}
          </div>
          <div style={{
            fontSize: 11,
            color: subTextColor,
            opacity: 0.7,
          }}>
            {voice.style}
          </div>
        </div>
      </div>

      <div style={{
        fontSize: 12,
        color: subTextColor,
        lineHeight: 1.5,
        marginBottom: 14,
        minHeight: 32,
      }}>
        {voice.description}
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 12,
        borderTop: `1px solid ${isNight ? 'rgba(255,255,255,0.04)' : 'rgba(43, 42, 38, 0.04)'}`,
      }}>
        <span style={{
          fontSize: 10,
          padding: '2px 10px',
          borderRadius: 10,
          background: voice.type === 'system'
            ? (isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)')
            : `${voice.color}15`,
          color: voice.type === 'system' ? subTextColor : voice.color,
          fontFamily: "'Noto Serif SC', serif",
        }}>
          {voice.type === 'system' ? '系统音色' : '个人音色'}
        </span>

        <button
          onClick={onPreview}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 12px',
            borderRadius: 16,
            border: `1px solid ${voice.color}30`,
            background: `${voice.color}10`,
            color: voice.color,
            fontSize: 11,
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="6,4 20,12 6,20" />
          </svg>
          试听
        </button>
      </div>
    </div>
  );
}

// 音色克隆对话框
function CloneVoiceDialog({ onClose, isNight, textColor, subTextColor }) {
  const [step, setStep] = React.useState(1); // 1: 引导  2: 录制中  3: 训练中  4: 完成
  const [recordProgress, setRecordProgress] = React.useState(0);
  const [waveHeights, setWaveHeights] = React.useState(Array(30).fill(5));
  const [privacyAgreed, setPrivacyAgreed] = React.useState(false);

  const sampleText = `古老的琴弦上，流淌着时间的河。
每一个音符，都是一次呼吸。
我听见风穿过山林，
也听见自己心里的声音。
知识不是拥有，而是存在的方式。`;

  React.useEffect(() => {
    if (step === 2) {
      const interval = setInterval(() => {
        setRecordProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setStep(3), 500);
            return 100;
          }
          return prev + 2;
        });
        setWaveHeights(prev => prev.map(() => 3 + Math.random() * 18));
      }, 100);
      return () => clearInterval(interval);
    }
    if (step === 3) {
      const timer = setTimeout(() => setStep(4), 3000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(6px)',
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
          animation: 'fadeInUp 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) both',
        }}
      >
        {/* 顶部进度条 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '16px 24px',
          borderBottom: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
        }}>
          {[1, 2, 3, 4].map(s => (
            <React.Fragment key={s}>
              <div style={{
                width: 28, height: 28,
                borderRadius: '50%',
                background: step >= s
                  ? 'linear-gradient(135deg, #B56B3A, #D48A5A)'
                  : (isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.08)'),
                color: step >= s ? '#fff' : subTextColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 600,
                transition: 'all 0.3s ease',
              }}>
                {step > s ? '✓' : s}
              </div>
              {s < 4 && (
                <div style={{
                  flex: 1,
                  height: 2,
                  borderRadius: 1,
                  background: step > s
                    ? 'linear-gradient(90deg, #B56B3A, #D48A5A)'
                    : (isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'),
                  transition: 'all 0.3s ease',
                }} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div style={{ padding: '28px 32px 32px' }}>
          {/* Step 1: 引导 */}
          {step === 1 && (
            <>
              <h3 style={{
                fontSize: 20,
                fontWeight: 600,
                fontFamily: "'Noto Serif SC', serif",
                color: textColor,
                marginBottom: 10,
              }}>
                录制你的声音模型
              </h3>
              <p style={{
                fontSize: 13,
                color: subTextColor,
                lineHeight: 1.7,
                marginBottom: 18,
              }}>
                朗读一段约 45 秒的标准文本，系统将生成你的专属声音模型。
              </p>

              {/* 隐私说明卡片 */}
              <div style={{
                padding: '16px 18px',
                borderRadius: 12,
                background: 'rgba(181, 107, 58, 0.06)',
                border: '1px solid rgba(181, 107, 58, 0.2)',
                marginBottom: 16,
              }}>
                <div style={{
                  fontSize: 12,
                  fontWeight: 500,
                  fontFamily: "'Noto Serif SC', serif",
                  color: '#B56B3A',
                  marginBottom: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}>
                  <span>🔒</span>
                  <span>你的声音数据</span>
                </div>
                <div style={{
                  fontSize: 11.5,
                  color: subTextColor,
                  lineHeight: 1.9,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}>
                  <span>· 声音样本仅用于生成你的个人声音模型</span>
                  <span>· 原始录音在模型生成后自动删除</span>
                  <span>· 模型只保存在你的设备上，不会上传到任何服务器</span>
                  <span>· 你可以随时删除声音模型，且删除后不可恢复</span>
                  <span>· 你的声音仅在你授权的范围内被使用</span>
                </div>
              </div>

              {/* 同意勾选 */}
              <label
                onClick={() => setPrivacyAgreed(!privacyAgreed)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  marginBottom: 20,
                  cursor: 'pointer',
                  padding: '8px 4px',
                  borderRadius: 8,
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: 18, height: 18,
                  borderRadius: 4,
                  border: `2px solid ${privacyAgreed ? '#5A7A4E' : subTextColor}`,
                  background: privacyAgreed ? '#5A7A4E' : 'transparent',
                  flexShrink: 0,
                  marginTop: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 11,
                  transition: 'all 0.15s ease',
                }}>
                  {privacyAgreed && '✓'}
                </div>
                <span style={{
                  fontSize: 12,
                  color: privacyAgreed ? textColor : subTextColor,
                  lineHeight: 1.5,
                  fontFamily: privacyAgreed ? "'Noto Serif SC', serif" : 'inherit',
                  fontWeight: privacyAgreed ? 500 : 400,
                }}>
                  我已了解并同意以上隐私说明，开始录制我的声音
                </span>
              </label>

              <div style={{
                padding: '14px 16px',
                borderRadius: 10,
                background: isNight ? 'rgba(255,255,255,0.03)' : 'rgba(43, 42, 38, 0.02)',
                border: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
                marginBottom: 20,
              }}>
                <div style={{
                  fontSize: 10.5,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  color: subTextColor,
                  marginBottom: 8,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  请朗读以下文字
                </div>
                <div style={{
                  fontSize: 13,
                  lineHeight: 2,
                  color: textColor,
                  fontStyle: 'italic',
                  fontFamily: "'Noto Serif SC', serif",
                }}>
                  {sampleText.split('\n').map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => { if (privacyAgreed) setStep(2); }}
                disabled={!privacyAgreed}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 12,
                  border: 'none',
                  background: privacyAgreed
                    ? 'linear-gradient(135deg, #B56B3A, #D48A5A)'
                    : 'rgba(255,255,255,0.06)',
                  color: privacyAgreed ? '#fff' : subTextColor,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: privacyAgreed ? 'pointer' : 'not-allowed',
                  fontFamily: "'Noto Serif SC', serif",
                  boxShadow: privacyAgreed ? '0 4px 16px rgba(181, 107, 58, 0.3)' : 'none',
                  opacity: privacyAgreed ? 1 : 0.5,
                  transition: 'all 0.2s ease',
                }}>
                开始录制 · 约 45 秒
              </button>
            </>
          )}

          {/* Step 2: 录制中 */}
          {step === 2 && (
            <div style={{ textAlign: 'center' }}>
              <h3 style={{
                fontSize: 20,
                fontWeight: 500,
                fontFamily: "'Noto Serif SC', serif",
                color: textColor,
                marginBottom: 6,
              }}>
                正在录制...
              </h3>
              <p style={{
                fontSize: 12,
                color: subTextColor,
                marginBottom: 24,
              }}>
                请自然地朗读屏幕上的文字
              </p>

              {/* 波形 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                height: 60,
                marginBottom: 20,
              }}>
                {waveHeights.map((h, i) => (
                  <div
                    key={i}
                    style={{
                      width: 4,
                      height: `${h * 2.5}px`,
                      minHeight: 4,
                      borderRadius: 2,
                      background: `linear-gradient(180deg, #B56B3A, #D48A5A)`,
                      transition: 'height 0.1s ease',
                    }}
                  />
                ))}
              </div>

              {/* 进度 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 20,
              }}>
                <div style={{
                  flex: 1,
                  height: 6,
                  borderRadius: 3,
                  background: isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${recordProgress}%`,
                    height: '100%',
                    borderRadius: 3,
                    background: 'linear-gradient(90deg, #B56B3A, #D48A5A)',
                    transition: 'width 0.1s linear',
                  }} />
                </div>
                <span style={{
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: textColor,
                  minWidth: 40,
                  textAlign: 'right',
                }}>
                  {Math.floor(recordProgress * 0.45)}s
                </span>
              </div>

              {/* 实时显示的文本（模拟跟读进度） */}
              <div style={{
                padding: '14px 16px',
                borderRadius: 10,
                background: isNight ? 'rgba(181, 107, 58, 0.08)' : 'rgba(181, 107, 58, 0.05)',
                border: `1px solid rgba(181, 107, 58, 0.2)`,
                textAlign: 'left',
                fontSize: 13,
                lineHeight: 1.8,
                color: textColor,
                fontFamily: "'Noto Serif SC', serif",
              }}>
                {sampleText.split('\n').map((line, i) => {
                  const linesTotal = sampleText.split('\n').length;
                  const currentLine = Math.floor((recordProgress / 100) * linesTotal);
                  return (
                    <div key={i} style={{
                      opacity: i < currentLine ? 1 : i === currentLine ? 1 : 0.4,
                      color: i < currentLine ? '#B56B3A' : textColor,
                      transition: 'all 0.3s ease',
                    }}>
                      {i < currentLine && '✓ '}{line}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: 训练中 */}
          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                width: 80, height: 80,
                margin: '0 auto 24px',
                borderRadius: '50%',
                border: '3px solid rgba(181, 107, 58, 0.15)',
                borderTopColor: '#B56B3A',
                animation: 'spin 1s linear infinite',
              }} />
              <h3 style={{
                fontSize: 20,
                fontWeight: 500,
                fontFamily: "'Noto Serif SC', serif",
                color: textColor,
                marginBottom: 10,
              }}>
                正在训练你的声音模型
              </h3>
              <p style={{
                fontSize: 13,
                color: subTextColor,
                lineHeight: 1.7,
              }}>
                系统正在学习你声音的特征<br />
                包括音色、语调、停顿、情绪表达<br />
                这个过程大约需要 30 秒
              </p>
            </div>
          )}

          {/* Step 4: 完成 */}
          {step === 4 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 64, height: 64,
                margin: '0 auto 20px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #5A7A4E, #7A9A6E)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 32,
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
                你的声音模型已生成
              </h3>
              <p style={{
                fontSize: 13,
                color: subTextColor,
                lineHeight: 1.7,
                marginBottom: 24,
              }}>
                现在你的朋友们可以用你的声音<br />
                来朗读你发送的文字了
              </p>

              <div style={{
                padding: '14px 18px',
                borderRadius: 10,
                background: 'rgba(90, 122, 78, 0.08)',
                border: '1px solid rgba(90, 122, 78, 0.2)',
                marginBottom: 20,
                textAlign: 'left',
                fontSize: 11.5,
                color: '#5A7A4E',
                lineHeight: 1.8,
              }}>
                <div style={{
                  fontWeight: 500,
                  fontFamily: "'Noto Serif SC', serif",
                  marginBottom: 4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}>
                  <span>✓</span>
                  <span>原始录音已自动删除</span>
                </div>
                <div style={{ color: subTextColor, fontSize: 11 }}>
                  声音模型仅保留你声音的特征参数，不包含任何原始录音片段。
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
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
                  完成
                </button>
                <button
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 10,
                    border: 'none',
                    background: 'linear-gradient(135deg, #B56B3A, #D48A5A)',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: "'Noto Serif SC', serif",
                  }}
                >
                  试听效果
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 音色预览弹窗
function VoicePreviewDialog({ voice, onClose, isNight, textColor, subTextColor }) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.8;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

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
          width: 380,
          background: isNight ? '#2A2925' : '#FFFEFA',
          borderRadius: 16,
          border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.08)'}`,
          boxShadow: '0 30px 80px rgba(0,0,0,0.25)',
          overflow: 'hidden',
          animation: 'fadeInUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both',
        }}
      >
        <div style={{
          padding: '28px 24px',
          textAlign: 'center',
          background: `linear-gradient(180deg, ${voice.color}12, transparent)`,
        }}>
          <div style={{
            width: 64, height: 64,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${voice.color}, ${voice.color}90)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 24,
            fontWeight: 500,
            margin: '0 auto 16px',
            fontFamily: "'Noto Serif SC', serif",
            boxShadow: `0 4px 20px ${voice.color}30`,
          }}>
            {voice.name[0]}
          </div>
          <h3 style={{
            fontSize: 18,
            fontWeight: 500,
            fontFamily: "'Noto Serif SC', serif",
            color: textColor,
            marginBottom: 4,
          }}>
            {voice.name}
          </h3>
          <p style={{
            fontSize: 12,
            color: subTextColor,
            marginBottom: 16,
          }}>
            {voice.style}
          </p>

          {/* 试听文本 */}
          <div style={{
            padding: '14px 18px',
            borderRadius: 10,
            background: isNight ? 'rgba(255,255,255,0.04)' : 'rgba(43, 42, 38, 0.03)',
            fontSize: 13,
            lineHeight: 1.8,
            color: textColor,
            fontFamily: "'Noto Serif SC', serif",
            fontStyle: 'italic',
            marginBottom: 20,
            textAlign: 'left',
          }}>
            "知识不是拥有的东西，而是你存在的方式。"
          </div>

          {/* 播放控制 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            justifyContent: 'center',
          }}>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                width: 52, height: 52,
                borderRadius: '50%',
                border: 'none',
                background: `linear-gradient(135deg, ${voice.color}, ${voice.color}DD)`,
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 20px ${voice.color}40`,
              }}
            >
              {isPlaying ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="8,5 20,12 8,19" />
                </svg>
              )}
            </button>
          </div>

          {/* 进度条 */}
          <div style={{
            height: 4,
            borderRadius: 2,
            background: isNight ? 'rgba(255,255,255,0.08)' : 'rgba(43, 42, 38, 0.08)',
            marginTop: 16,
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              borderRadius: 2,
              background: voice.color,
              transition: 'width 0.1s linear',
            }} />
          </div>
        </div>

        <div style={{
          padding: '14px 24px',
          borderTop: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{
            fontSize: 11,
            color: subTextColor,
          }}>
            {voice.type === 'system' ? '系统音色' : `来自：${voice.owner}`}
          </span>
          <button
            onClick={onClose}
            style={{
              padding: '6px 16px',
              borderRadius: 6,
              border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.1)'}`,
              background: 'transparent',
              color: subTextColor,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  VoiceListenView,
  FlowStage,
  VoiceLibraryView,
  VoiceCard,
  CloneVoiceDialog,
  VoicePreviewDialog,
});
