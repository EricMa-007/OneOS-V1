// ============================================
// 沟通闭环演示 + 语音设置面板
// ============================================

// ============================================
// 沟通语音闭环演示
// ============================================
function VoiceDemoView({ isNight, textColor, subTextColor }) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [autoPlay, setAutoPlay] = React.useState(false);

  const steps = [
    {
      id: 1,
      title: '按住说话',
      description: '用户按住录音按钮，说出一段话',
      type: 'record',
    },
    {
      id: 2,
      title: '实时转写为文字',
      description: 'ASR 语音识别，边说边转，自动标点、自动分段',
      type: 'asr',
    },
    {
      id: 3,
      title: '生成 Markdown 文档',
      description: '自动包装为 MD，自动归档到对应话题，自动生成双链',
      type: 'markdown',
    },
    {
      id: 4,
      title: '静默送达收件箱',
      description: '消息进入对方静默收件箱，不打扰，在时间窗口内可见',
      type: 'deliver',
    },
    {
      id: 5,
      title: '用你的音色朗读',
      description: '对方打开后，用你授权的声音朗读这段文字——文字有了温度',
      type: 'tts',
    },
  ];

  // 自动播放
  React.useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          setAutoPlay(false);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);
    return () => clearInterval(timer);
  }, [autoPlay, steps.length]);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 28px' }}>
      {/* 标题 */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h2 style={{
          fontSize: 22,
          fontWeight: 500,
          fontFamily: "'Noto Serif SC', serif",
          color: textColor,
          marginBottom: 8,
        }}>
          语音沟通完整闭环
        </h2>
        <p style={{
          fontSize: 13,
          color: subTextColor,
          lineHeight: 1.7,
          maxWidth: 480,
          margin: '0 auto',
        }}>
          开口说 → 变成文字 → 沉淀为 Markdown → 对方用你的声音朗读
          <br />
          语音是入口，文字是永恒，音色让文字有了温度
        </p>
      </div>

      {/* 步骤导航条 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        marginBottom: 28,
      }}>
        {steps.map((s, i) => (
          <React.Fragment key={s.id}>
            <button
              onClick={() => { setCurrentStep(i); setAutoPlay(false); }}
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                border: `1px solid ${currentStep === i
                  ? '#B56B3A40'
                  : (isNight ? 'rgba(255,255,255,0.08)' : 'rgba(43, 42, 38, 0.08)')}`,
                background: currentStep === i
                  ? '#B56B3A15'
                  : 'transparent',
                color: currentStep === i ? '#B56B3A' : subTextColor,
                fontSize: 12,
                cursor: 'pointer',
                fontWeight: currentStep === i ? 500 : 400,
                fontFamily: currentStep === i ? "'Noto Serif SC', serif" : 'inherit',
                transition: 'all 0.2s ease',
              }}
            >
              {i + 1}. {s.title}
            </button>
            {i < steps.length - 1 && (
              <div style={{
                color: subTextColor,
                opacity: currentStep > i ? 0.5 : 0.2,
                fontSize: 14,
                transition: 'opacity 0.3s ease',
              }}>
                →
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* 自动播放控制 */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 28,
      }}>
        <button
          onClick={() => {
            if (autoPlay) {
              setAutoPlay(false);
            } else {
              setCurrentStep(0);
              setAutoPlay(true);
            }
          }}
          style={{
            padding: '8px 20px',
            borderRadius: 20,
            border: 'none',
            background: 'linear-gradient(135deg, #B56B3A, #D48A5A)',
            color: '#fff',
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: "'Noto Serif SC', serif",
            boxShadow: '0 2px 12px rgba(181, 107, 58, 0.25)',
          }}
        >
          {autoPlay ? (
            <><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg> 暂停</>
          ) : (
            <><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="6,4 20,12 6,20" /></svg> 自动演示</>
          )}
        </button>
        <button
          onClick={() => { setCurrentStep(0); setAutoPlay(false); }}
          style={{
            padding: '8px 16px',
            borderRadius: 20,
            border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.1)'}`,
            background: 'transparent',
            color: subTextColor,
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          重置
        </button>
      </div>

      {/* 演示内容区 */}
      <div style={{
        padding: '32px',
        borderRadius: 16,
        background: isNight ? '#262522' : '#FFFEFA',
        border: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
        minHeight: 380,
        boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
        animation: 'fadeIn 0.4s ease both',
      }}>
        {currentStep === 0 && <StepRecord isNight={isNight} textColor={textColor} subTextColor={subTextColor} />}
        {currentStep === 1 && <StepASR isNight={isNight} textColor={textColor} subTextColor={subTextColor} />}
        {currentStep === 2 && <StepMarkdown isNight={isNight} textColor={textColor} subTextColor={subTextColor} />}
        {currentStep === 3 && <StepDeliver isNight={isNight} textColor={textColor} subTextColor={subTextColor} />}
        {currentStep === 4 && <StepTTS isNight={isNight} textColor={textColor} subTextColor={subTextColor} />}
      </div>

      {/* 底部说明 */}
      <div style={{
        marginTop: 24,
        padding: '16px 24px',
        borderRadius: 12,
        background: isNight ? 'rgba(255,255,255,0.02)' : 'rgba(43, 42, 38, 0.02)',
        border: `1px solid ${isNight ? 'rgba(255,255,255,0.04)' : 'rgba(43, 42, 38, 0.04)'}`,
        fontSize: 12,
        color: subTextColor,
        lineHeight: 1.7,
        fontFamily: "'Noto Serif SC', serif",
      }}>
        <p style={{ margin: '0 0 8px', color: textColor, fontWeight: 500 }}>
          为什么是这样的设计？
        </p>
        <p style={{ margin: '0 0 6px' }}>
          传统语音消息的问题：<strong>不能检索、不能沉淀、占空间</strong>。
          音频人类几乎不会再听第二遍，但文字可以反复读、反复琢磨。
        </p>
        <p style={{ margin: 0 }}>
          OneOS 的方式：语音是<strong style={{ color: '#B56B3A' }}>最自然的输入接口</strong>，
          文字是<strong style={{ color: '#4F46E5' }}>永恒的存储形态</strong>，
          个人音色让文字<strong style={{ color: '#5A7A4E' }}>有了温度和身份</strong>。
          三者各司其职，互不替代。
        </p>
      </div>
    </div>
  );
}

// 步骤1：按住说话
function StepRecord({ isNight, textColor, subTextColor }) {
  const [waveHeights, setWaveHeights] = React.useState(Array(30).fill(5));
  const [duration, setDuration] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setWaveHeights(prev => prev.map(() => 3 + Math.random() * 22));
      setDuration(prev => prev + 1);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: 320,
      animation: 'fadeInUp 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) both',
    }}>
      <div style={{
        fontSize: 12,
        color: subTextColor,
        marginBottom: 24,
        fontFamily: "'Noto Serif SC', serif",
      }}>
        用户按住录音按钮，说一段给家人的话
      </div>

      <div style={{ position: 'relative', marginBottom: 24 }}>
        <div style={{
          position: 'absolute',
          inset: -30,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(181, 107, 58, 0.2), transparent 70%)',
          animation: 'breathe 2s ease-in-out infinite',
        }} />
        <div style={{
          width: 120, height: 120,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #C83232, #E85050)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          position: 'relative',
          boxShadow: '0 8px 32px rgba(200, 50, 50, 0.3)',
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
          <div style={{
            fontSize: 20,
            fontWeight: 600,
            fontFamily: "'JetBrains Mono', monospace",
            marginTop: 6,
          }}>
            {formatTime(duration)}
          </div>
        </div>
      </div>

      {/* 波形 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        height: 40,
        marginBottom: 16,
      }}>
        {waveHeights.map((h, i) => (
          <div
            key={i}
            style={{
              width: 4,
              height: `${h * 1.5}px`,
              minHeight: 4,
              borderRadius: 2,
              background: `linear-gradient(180deg, #B56B3A, #D48A5A)`,
            }}
          />
        ))}
      </div>

      <div style={{
        fontSize: 14,
        fontWeight: 500,
        color: '#C83232',
        fontFamily: "'Noto Serif SC', serif",
      }}>
        正在录音...
      </div>
    </div>
  );
}

// 步骤2：实时转写
function StepASR({ isNight, textColor, subTextColor }) {
  const sampleText = `晚晴，

今天去了趟径山寺，银杏真的黄了。站在那棵千年银杏下面的时候，突然特别想你。

你还记得我们第一次去径山吗？那时候你还在读博士，我们从杭州城里坐了两个小时的公交车才到...`;

  const [displayText, setDisplayText] = React.useState('');

  React.useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < sampleText.length) {
        index = Math.min(index + 3, sampleText.length);
        setDisplayText(sampleText.slice(0, index));
      } else {
        clearInterval(interval);
      }
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ animation: 'fadeInUp 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) both' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
      }}>
        <div style={{
          width: 8, height: 8,
          borderRadius: '50%',
          background: '#5A7A4E',
          animation: 'blink 1s ease-in-out infinite',
        }} />
        <span style={{
          fontSize: 14,
          fontWeight: 500,
          color: '#5A7A4E',
          fontFamily: "'Noto Serif SC', serif",
        }}>
          实时转写中 · ASR 语音识别
        </span>
        <span style={{
          fontSize: 11,
          color: subTextColor,
          marginLeft: 'auto',
        }}>
          延迟 &lt; 500ms
        </span>
      </div>

      <div style={{
        padding: '24px 28px',
        borderRadius: 12,
        background: isNight ? 'rgba(90, 122, 78, 0.06)' : 'rgba(90, 122, 78, 0.04)',
        border: `1px solid ${isNight ? 'rgba(90, 122, 78, 0.2)' : 'rgba(90, 122, 78, 0.15)'}`,
        minHeight: 220,
      }}>
        <div style={{
          fontSize: 15,
          lineHeight: 2,
          color: textColor,
          whiteSpace: 'pre-wrap',
          fontFamily: "'Noto Serif SC', serif",
        }}>
          {displayText}
          <span style={{
            display: 'inline-block',
            width: 2,
            height: 18,
            background: '#5A7A4E',
            marginLeft: 2,
            verticalAlign: 'middle',
            animation: 'blink 0.8s ease-in-out infinite',
          }} />
        </div>
      </div>

      <div style={{
        marginTop: 16,
        display: 'flex',
        gap: 16,
        justifyContent: 'center',
        fontSize: 11,
        color: subTextColor,
      }}>
        <span>✓ 自动标点</span>
        <span>✓ 自动分段</span>
        <span>✓ 中英混合识别</span>
        <span>✓ 长语音不中断</span>
      </div>
    </div>
  );
}

// 步骤3：生成 Markdown
function StepMarkdown({ isNight, textColor, subTextColor }) {
  return (
    <div style={{ animation: 'fadeInUp 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) both' }}>
      <div style={{
        fontSize: 14,
        fontWeight: 500,
        color: textColor,
        marginBottom: 20,
        fontFamily: "'Noto Serif SC', serif",
        textAlign: 'center',
      }}>
        自动包装为 Markdown 文档 · 自动归档 · 自动生成双链
      </div>

      {/* MD 文档样式 */}
      <div style={{
        background: isNight ? '#2D2B28' : '#FFFEF5',
        borderRadius: 12,
        border: `1px solid ${isNight ? 'rgba(255,255,255,0.08)' : 'rgba(43, 42, 38, 0.08)'}`,
        padding: '24px 28px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        fontFamily: "'Noto Serif SC', serif",
        fontSize: 14,
        lineHeight: 1.9,
        color: textColor,
      }}>
        <div style={{
          fontSize: 11,
          color: '#8A8780',
          fontFamily: "'JetBrains Mono', monospace",
          marginBottom: 8,
        }}>
          voice/2026-03-18-给晚晴的一段话.md
        </div>
        <h1 style={{
          fontSize: 20,
          fontWeight: 600,
          marginBottom: 4,
          color: textColor,
          paddingBottom: 10,
          borderBottom: `1px solid ${isNight ? 'rgba(255,255,255,0.08)' : 'rgba(43, 42, 38, 0.08)'}`,
        }}>
          给晚晴的一段话
        </h1>
        <div style={{
          fontSize: 11,
          color: '#8A8780',
          marginBottom: 16,
          fontStyle: 'italic',
        }}>
          &gt; 2026年3月18日 21:30 · 语音转写 · 1分45秒
        </div>

        <p style={{ margin: '0 0 14px' }}>
          晚晴，
        </p>
        <p style={{ margin: '0 0 14px' }}>
          今天去了趟径山寺，银杏真的黄了。站在那棵千年银杏下面的时候，突然特别想你。
        </p>
        <p style={{ margin: '0 0 14px' }}>
          你还记得我们第一次去径山吗？那时候你还在读博士，我们从杭州城里坐了两个小时的公交车才到。那天也是秋天，你说银杏叶落下来的时候，像金色的雨。
        </p>
        <p style={{ margin: '0 0 14px' }}>
          时间过得真快啊。
        </p>
        <p style={{ margin: '0 0 14px' }}>
          这两天我在想 <span style={{
            color: '#4F46E5',
            borderBottom: '1px dashed rgba(79, 70, 229, 0.4)',
          }}>[[OneOS]]</span> 里的语音功能，想着如果有一天，我们老了，眼睛看不清字了，还能用声音交流...
        </p>
        <p style={{ margin: 0 }}>
          爱你。
        </p>

        <div style={{
          marginTop: 20,
          paddingTop: 12,
          borderTop: `1px solid ${isNight ? 'rgba(255,255,255,0.08)' : 'rgba(43, 42, 38, 0.08)'}`,
          fontSize: 11,
          color: '#8A8780',
          fontStyle: 'italic',
        }}>
          话题：<span style={{ color: '#B56B3A' }}>私人</span> · 发送给：<span style={{ color: '#5A7A4E' }}>苏晚晴</span>
        </div>
      </div>
    </div>
  );
}

// 步骤4：静默送达
function StepDeliver({ isNight, textColor, subTextColor }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: 320,
      animation: 'fadeInUp 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) both',
    }}>
      <div style={{
        width: 80, height: 80,
        borderRadius: '50%',
        background: 'rgba(90, 122, 78, 0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        animation: 'scaleIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both',
      }}>
        <div style={{
          width: 48, height: 48,
          borderRadius: '50%',
          background: 'rgba(90, 122, 78, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            width: 28, height: 28,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #5A7A4E, #7A9A6E)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 14,
          }}>
            ✓
          </div>
        </div>
      </div>

      <div style={{
        fontSize: 18,
        fontWeight: 500,
        color: '#5A7A4E',
        marginBottom: 8,
        fontFamily: "'Noto Serif SC', serif",
      }}>
        静默送达
      </div>
      <p style={{
        fontSize: 13,
        color: subTextColor,
        textAlign: 'center',
        lineHeight: 1.7,
        marginBottom: 24,
      }}>
        消息已进入苏晚晴的静默收件箱<br />
        没有弹窗、没有声音、没有红点<br />
        在她的时间窗口内可见
      </p>

      {/* 收件箱示意 */}
      <div style={{
        padding: '14px 20px',
        borderRadius: 10,
        background: isNight ? 'rgba(255,255,255,0.03)' : 'rgba(43, 42, 38, 0.02)',
        border: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
        fontSize: 12,
        color: textColor,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: 320,
      }}>
        <div style={{
          width: 32, height: 32,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #D48A5A, #B56B3A)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 13,
          fontFamily: "'Noto Serif SC', serif",
        }}>
          马
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500, marginBottom: 2, fontFamily: "'Noto Serif SC', serif" }}>
            马崇海
          </div>
          <div style={{ fontSize: 11, color: subTextColor, opacity: 0.7 }}>
            给晚晴的一段话
          </div>
        </div>
        <div style={{
          fontSize: 10,
          color: '#5A7A4E',
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          静默
        </div>
      </div>
    </div>
  );
}

// 步骤5：用音色朗读
function StepTTS({ isNight, textColor, subTextColor }) {
  const [waveHeights, setWaveHeights] = React.useState(Array(40).fill(5));
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setWaveHeights(prev => prev.map(() => 3 + Math.random() * 20));
      setProgress(prev => (prev + 0.5) % 100);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ animation: 'fadeInUp 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) both' }}>
      <div style={{
        fontSize: 14,
        fontWeight: 500,
        color: textColor,
        marginBottom: 20,
        textAlign: 'center',
        fontFamily: "'Noto Serif SC', serif",
      }}>
        晚晴打开消息，用你的音色朗读——文字有了温度
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        marginBottom: 24,
        justifyContent: 'center',
      }}>
        <div style={{
          width: 56, height: 56,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #B56B3A, #D48A5A)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 22,
          fontWeight: 500,
          fontFamily: "'Noto Serif SC', serif",
          boxShadow: '0 4px 20px rgba(181, 107, 58, 0.3)',
        }}>
          马
        </div>
        <div>
          <div style={{
            fontSize: 16,
            fontWeight: 500,
            color: textColor,
            fontFamily: "'Noto Serif SC', serif",
          }}>
            马崇海的声音
          </div>
          <div style={{
            fontSize: 12,
            color: '#B56B3A',
          }}>
            个人音色 · 已授权使用
          </div>
        </div>
        <div style={{
          padding: '4px 12px',
          borderRadius: 16,
          background: 'rgba(90, 122, 78, 0.15)',
          color: '#5A7A4E',
          fontSize: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <div style={{
            width: 6, height: 6,
            borderRadius: '50%',
            background: '#5A7A4E',
            animation: 'blink 1s ease-in-out infinite',
          }} />
          正在朗读
        </div>
      </div>

      {/* 波形 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        height: 60,
        marginBottom: 20,
        padding: '0 20px',
      }}>
        {waveHeights.map((h, i) => {
          const isPast = (i / waveHeights.length) * 100 <= progress;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                minWidth: 2,
                height: `${Math.max(h, 3)}px`,
                borderRadius: 2,
                background: isPast
                  ? 'linear-gradient(180deg, #B56B3A, #D48A5A)'
                  : (isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.1)'),
                transition: 'height 0.1s ease, background 0.3s ease',
              }}
            />
          );
        })}
      </div>

      {/* 朗读文本（高亮当前段） */}
      <div style={{
        padding: '20px 24px',
        borderRadius: 12,
        background: isNight ? 'rgba(181, 107, 58, 0.06)' : 'rgba(181, 107, 58, 0.04)',
        border: `1px solid ${isNight ? 'rgba(181, 107, 58, 0.15)' : 'rgba(181, 107, 58, 0.1)'}`,
        fontSize: 14,
        lineHeight: 2,
        color: textColor,
        fontFamily: "'Noto Serif SC', serif",
      }}>
        <p style={{ margin: 0, color: '#B56B3A', fontWeight: 500 }}>
          "今天去了趟径山寺，银杏真的黄了。
          <br />
          站在那棵千年银杏下面的时候，
          <br />
          突然特别想你。"
        </p>
      </div>
    </div>
  );
}

// ============================================
// 语音设置面板
// ============================================
function VoiceSettingsView({ isNight, textColor, subTextColor }) {
  const [asrLang, setAsrLang] = React.useState('中文普通话');
  const [autoPunc, setAutoPunc] = React.useState(true);
  const [filterWords, setFilterWords] = React.useState(false);
  const [retention, setRetention] = React.useState('转写后删除');
  const [defaultVoice, setDefaultVoice] = React.useState('清语');
  const [speechRate, setSpeechRate] = React.useState(1.0);
  const [autoRead, setAutoRead] = React.useState(false);
  const [localOnly, setLocalOnly] = React.useState(true);
  const [deleteAfter, setDeleteAfter] = React.useState(true);

  const Toggle = ({ value, onChange, color = '#5A7A4E' }) => (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 42, height: 24,
        borderRadius: 12,
        background: value
          ? `linear-gradient(135deg, ${color}, ${color}CC)`
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
        left: value ? 20 : 2,
        width: 20, height: 20,
        borderRadius: '50%',
        background: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        transition: 'left 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
      }} />
    </div>
  );

  const SettingSection = ({ title, children }) => (
    <div style={{
      marginBottom: 28,
    }}>
      <h3 style={{
        fontSize: 13,
        fontWeight: 500,
        fontFamily: "'Noto Serif SC', serif",
        color: textColor,
        marginBottom: 12,
      }}>
        {title}
      </h3>
      <div style={{
        borderRadius: 12,
        background: isNight ? '#262522' : '#FFFEFA',
        border: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
        overflow: 'hidden',
      }}>
        {children}
      </div>
    </div>
  );

  const SettingRow = ({ label, desc, control, last = false }) => (
    <div style={{
      padding: '14px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: 20,
      borderBottom: last ? 'none' : `1px solid ${isNight ? 'rgba(255,255,255,0.04)' : 'rgba(43, 42, 38, 0.04)'}`,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 13,
          color: textColor,
          marginBottom: 2,
          fontFamily: "'Noto Serif SC', serif",
        }}>
          {label}
        </div>
        {desc && (
          <div style={{
            fontSize: 11,
            color: subTextColor,
            opacity: 0.7,
            lineHeight: 1.5,
          }}>
            {desc}
          </div>
        )}
      </div>
      <div>{control}</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 28px' }}>
      <SettingSection title="语音识别 (ASR)">
        <SettingRow
          label="识别语言"
          desc="选择主语言，可自动检测中英混合"
          control={
            <select
              value={asrLang}
              onChange={(e) => setAsrLang(e.target.value)}
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
              <option>中文普通话</option>
              <option>英文</option>
              <option>粤语</option>
              <option>中英混合</option>
            </select>
          }
        />
        <SettingRow
          label="自动标点"
          desc="自动添加句号、逗号、问号等标点符号"
          control={<Toggle value={autoPunc} onChange={setAutoPunc} />}
        />
        <SettingRow
          label="敏感词过滤"
          desc="对转写结果中的敏感词进行过滤"
          control={<Toggle value={filterWords} onChange={setFilterWords} color="#C83232" />}
        />
        <SettingRow
          label="原始音频保留"
          desc="转写完成后原始音频的处理方式"
          control={
            <select
              value={retention}
              onChange={(e) => setRetention(e.target.value)}
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
              <option>转写后删除</option>
              <option>保留 7 天</option>
              <option>永久保留</option>
            </select>
          }
          last
        />
      </SettingSection>

      <SettingSection title="语音合成 (TTS)">
        <SettingRow
          label="默认音色"
          desc="默认使用的朗读音色"
          control={
            <select
              value={defaultVoice}
              onChange={(e) => setDefaultVoice(e.target.value)}
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
                <option key={v.id}>{v.name}</option>
              ))}
            </select>
          }
        />
        <SettingRow
          label="朗读语速"
          desc="默认 1.0x，可调范围 0.5x - 2.0x"
          control={
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              {[0.75, 1.0, 1.25, 1.5].map(s => (
                <button
                  key={s}
                  onClick={() => setSpeechRate(s)}
                  style={{
                    width: 36,
                    padding: '4px 0',
                    borderRadius: 6,
                    border: 'none',
                    background: speechRate === s ? 'rgba(90, 122, 78, 0.15)' : 'transparent',
                    color: speechRate === s ? '#5A7A4E' : subTextColor,
                    fontSize: 11,
                    fontFamily: "'JetBrains Mono', monospace",
                    cursor: 'pointer',
                    fontWeight: speechRate === s ? 600 : 400,
                  }}
                >
                  {s}x
                </button>
              ))}
            </div>
          }
        />
        <SettingRow
          label="自动朗读新消息"
          desc="收到新消息时自动用语音朗读（默认关闭，零打扰）"
          control={<Toggle value={autoRead} onChange={setAutoRead} />}
          last
        />
      </SettingSection>

      <SettingSection title="隐私与安全">
        <SettingRow
          label="本地处理优先"
          desc="所有语音识别和合成优先在本地完成，不上传云端"
          control={<Toggle value={localOnly} onChange={setLocalOnly} />}
        />
        <SettingRow
          label="转写后删除原始音频"
          desc="语音转写为文字后，立即删除原始录音文件"
          control={<Toggle value={deleteAfter} onChange={setDeleteAfter} />}
        />
        <SettingRow
          label="音色克隆授权"
          desc="你已同意 OneOS 在本地生成你的个人音色模型"
          control={
            <span style={{
              fontSize: 11,
              padding: '2px 10px',
              borderRadius: 10,
              background: 'rgba(90, 122, 78, 0.12)',
              color: '#5A7A4E',
            }}>
              已授权
            </span>
          }
          last
        />
      </SettingSection>

      <div style={{
        padding: '16px 20px',
        borderRadius: 12,
        background: isNight ? 'rgba(90, 122, 78, 0.06)' : 'rgba(90, 122, 78, 0.04)',
        border: `1px solid ${isNight ? 'rgba(90, 122, 78, 0.15)' : 'rgba(90, 122, 78, 0.1)'}`,
        fontSize: 12,
        color: '#5A7A4E',
        lineHeight: 1.7,
        fontFamily: "'Noto Serif SC', serif",
      }}>
        <p style={{ margin: '0 0 6px', fontWeight: 500 }}>
          隐私承诺
        </p>
        <p style={{ margin: 0, fontSize: 11, lineHeight: 1.8, opacity: 0.9 }}>
          你的语音数据永远不会上传到 OneOS 的服务器。
          所有语音识别、语音合成、音色克隆都在你的设备上本地完成。
          原始音频在转写后立即删除（可配置）。
          你的声音模型只属于你自己。
        </p>
      </div>
    </div>
  );
}

Object.assign(window, {
  VoiceDemoView,
  VoiceSettingsView,
});
