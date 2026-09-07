// ============================================
// 语音交互系统 主视图 + ASR 语音输入
// ============================================

function VoiceView({
  density, isNight, textColor, subTextColor, themeBg, focusMode,
}) {
  const [activeTab, setActiveTab] = React.useState('record'); // record | listen | voices | demo | settings
  const [selectedTranscript, setSelectedTranscript] = React.useState(null);

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
        padding: '18px 28px',
        borderBottom: `1px solid ${isNight ? 'rgba(255,255,255,0.05)' : 'rgba(43, 42, 38, 0.05)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <h1 style={{
            fontSize: 18,
            fontWeight: 500,
            fontFamily: "'Noto Serif SC', serif",
            color: textColor,
            marginBottom: 4,
          }}>
            语音
          </h1>
          <p style={{
            fontSize: 11,
            color: subTextColor,
            lineHeight: 1.4,
          }}>
            语音是入口，文字是永恒，Markdown 是肉身
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: 2,
          background: isNight ? 'rgba(255,255,255,0.03)' : 'rgba(43, 42, 38, 0.03)',
          borderRadius: 8,
          padding: 3,
        }}>
          {[
            { id: 'record', label: '语音输入' },
            { id: 'listen', label: '语音朗读' },
            { id: 'voices', label: '音色管理' },
            { id: 'demo', label: '沟通闭环' },
            { id: 'settings', label: '设置' },
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
      </div>

      {/* 内容 */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'record' && (
          <VoiceRecordView
            onViewTranscript={setSelectedTranscript}
            isNight={isNight}
            textColor={textColor}
            subTextColor={subTextColor}
          />
        )}
        {activeTab === 'listen' && (
          <VoiceListenView
            isNight={isNight}
            textColor={textColor}
            subTextColor={subTextColor}
          />
        )}
        {activeTab === 'voices' && (
          <VoiceLibraryView
            isNight={isNight}
            textColor={textColor}
            subTextColor={subTextColor}
          />
        )}
        {activeTab === 'demo' && (
          <VoiceDemoView
            isNight={isNight}
            textColor={textColor}
            subTextColor={subTextColor}
          />
        )}
        {activeTab === 'settings' && (
          <VoiceSettingsView
            isNight={isNight}
            textColor={textColor}
            subTextColor={subTextColor}
          />
        )}
      </div>

      {/* 转写详情面板 */}
      {selectedTranscript && (
        <TranscriptDetailPanel
          transcript={selectedTranscript}
          onClose={() => setSelectedTranscript(null)}
          isNight={isNight}
          textColor={textColor}
          subTextColor={subTextColor}
        />
      )}
    </div>
  );
}

// ============================================
// 语音输入（ASR）视图
// ============================================
function VoiceRecordView({ onViewTranscript, isNight, textColor, subTextColor }) {
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordDuration, setRecordDuration] = React.useState(0);
  const [liveText, setLiveText] = React.useState('');
  const [showResult, setShowResult] = React.useState(false);
  const [resultText, setResultText] = React.useState('');
  const [waveHeights, setWaveHeights] = React.useState(Array(30).fill(4));
  const [isEditing, setIsEditing] = React.useState(false);
  const [editText, setEditText] = React.useState('');
  const [selectedTopic, setSelectedTopic] = React.useState('日常思考');
  const [selectedTags, setSelectedTags] = React.useState([]);
  const [showConfirmStep, setShowConfirmStep] = React.useState(false);

  const timerRef = React.useRef(null);
  const waveRef = React.useRef(null);
  const textStreamRef = React.useRef(null);

  // 波形动画
  React.useEffect(() => {
    if (isRecording) {
      waveRef.current = setInterval(() => {
        setWaveHeights(prev => prev.map(() => 4 + Math.random() * 20));
      }, 100);
    } else {
      if (waveRef.current) clearInterval(waveRef.current);
      setWaveHeights(Array(30).fill(4));
    }
    return () => {
      if (waveRef.current) clearInterval(waveRef.current);
    };
  }, [isRecording]);

  // 录音计时
  React.useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // 实时转写（模拟）
  React.useEffect(() => {
    if (isRecording) {
      const sampleText = TRANSCRIPT_EXAMPLES[0].text;
      let charIndex = 0;
      textStreamRef.current = setInterval(() => {
        if (charIndex < sampleText.length) {
          const addChars = 1 + Math.floor(Math.random() * 3);
          charIndex = Math.min(charIndex + addChars, sampleText.length);
          setLiveText(sampleText.slice(0, charIndex));
        }
      }, 150);
    } else {
      if (textStreamRef.current) clearInterval(textStreamRef.current);
    }
    return () => {
      if (textStreamRef.current) clearInterval(textStreamRef.current);
    };
  }, [isRecording]);

  const handleStartRecord = () => {
    setIsRecording(true);
    setRecordDuration(0);
    setLiveText('');
    setShowResult(false);
  };

  const handleStopRecord = () => {
    setIsRecording(false);
    if (liveText.length > 20) {
      setResultText(liveText);
      setEditText(liveText);
      setShowResult(true);
      setIsEditing(false);
      setShowConfirmStep(false);
      setSelectedTags([]);
    }
  };

  // 不确定字词标记（模拟：将一些词标记为低置信度）
  const renderUncertainText = (text) => {
    const uncertainWords = ['方法论', '主体性', '升维', '内驱力', '底层逻辑'];
    let result = text;
    uncertainWords.forEach(word => {
      result = result.replace(word, `<span style="text-decoration: underline wavy #B56B3A; text-underline-offset: 3px; opacity: 0.8;" title="识别可能不准确，建议检查">${word}</span>`);
    });
    return result;
  };

  const topics = ['日常思考', '产品思考', '哲学读书笔记', '沟通记录'];
  const suggestTags = ['语音输入', '思考碎片', '待整理', '灵感', '复盘'];

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 28px' }}>
      {/* 录音区域 */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: 40,
      }}>
        {/* 大录音按钮 */}
         <div style={{
           position: 'relative',
           width: 180,
           height: 180,
           marginBottom: 24,
         }}>
           {/* 多层脉冲波纹（录音中） */}
           {isRecording && (
             <>
               <div style={{
                 position: 'absolute',
                 inset: -30,
                 borderRadius: '50%',
                 background: 'radial-gradient(circle, rgba(124, 111, 240, 0.2), transparent 70%)',
                 animation: 'breathe 2s ease-in-out infinite',
               }} />
               <div style={{
                 position: 'absolute',
                 inset: -20,
                 borderRadius: '50%',
                 border: '2px solid rgba(124, 111, 240, 0.3)',
                 animation: 'pulseRing 1.5s ease-out infinite',
               }} />
               <div style={{
                 position: 'absolute',
                 inset: -10,
                 borderRadius: '50%',
                 border: '2px solid rgba(155, 142, 247, 0.5)',
                 animation: 'pulseRing 1.5s ease-out infinite',
                 animationDelay: '0.5s',
               }} />
             </>
           )}
           {/* 3D底座阴影 */}
           <div style={{
             position: 'absolute',
             bottom: -10,
             left: '10%',
             width: '80%',
             height: 20,
             borderRadius: '50%',
             background: 'rgba(124, 111, 240, 0.2)',
             filter: 'blur(10px)',
             zIndex: 0,
           }} />

           <button
             onMouseDown={handleStartRecord}
             onMouseUp={handleStopRecord}
             onMouseLeave={(e) => {
               if (isRecording) handleStopRecord();
               else e.currentTarget.style.transform = 'scale(1)';
             }}
             onTouchStart={handleStartRecord}
             onTouchEnd={handleStopRecord}
             style={{
               position: 'relative',
               width: 180,
               height: 180,
               borderRadius: '50%',
               border: 'none',
               background: isRecording
                 ? 'linear-gradient(145deg, #FF8A80 0%, #FF5252 50%, #E53935 100%)'
                 : 'linear-gradient(145deg, #B39DDB 0%, #7C6FF0 40%, #5B4FE0 100%)',
               color: '#fff',
               cursor: 'pointer',
               display: 'flex',
               flexDirection: 'column',
               alignItems: 'center',
               justifyContent: 'center',
               gap: 10,
               boxShadow: isRecording
                 ? '0 12px 40px rgba(255, 82, 82, 0.4), inset 0 4px 12px rgba(255,255,255,0.3), inset 0 -8px 20px rgba(0,0,0,0.15)'
                 : '0 16px 48px rgba(124, 111, 240, 0.35), inset 0 4px 12px rgba(255,255,255,0.35), inset 0 -8px 20px rgba(0,0,0,0.1)',
               transition: 'all 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
               transform: isRecording ? 'scale(0.92)' : 'scale(1)',
               zIndex: 1,
             }}
             onMouseEnter={(e) => {
               if (!isRecording) e.currentTarget.style.transform = 'scale(1.05)';
             }}
           >
             {/* 麦克风图标 */}
             <div style={{
               width: 64, height: 64,
               borderRadius: '50%',
               background: 'rgba(255, 255, 255, 0.2)',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3), 0 2px 8px rgba(0,0,0,0.1)',
             }}>
               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                 <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                 <line x1="12" y1="19" x2="12" y2="23" />
                 <line x1="8" y1="23" x2="16" y2="23" />
               </svg>
             </div>
             <div style={{
               fontSize: 16,
               fontWeight: 700,
               fontFamily: "'Nunito', sans-serif",
               letterSpacing: 0.5,
             }}>
               {isRecording ? '正在录音' : '按住说话'}
             </div>
             {isRecording && (
               <div style={{
                 fontSize: 24,
                 fontWeight: 800,
                 fontFamily: "'Poppins', 'JetBrains Mono', monospace",
               }}>
                 {formatTime(recordDuration)}
               </div>
             )}
           </button>
         </div>

        {/* 波形可视化 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          height: 40,
          marginBottom: 16,
          opacity: isRecording ? 1 : 0.3,
          transition: 'opacity 0.3s ease',
        }}>
          {waveHeights.map((h, i) => (
            <div
              key={i}
              style={{
                width: 3,
                height: `${h * 1.5}px`,
                minHeight: 3,
                borderRadius: 2,
                background: isRecording
                  ? `linear-gradient(180deg, #5A7A4E, #7A9A6E)`
                  : subTextColor,
                transition: 'height 0.1s ease',
              }}
            />
          ))}
        </div>

        <div style={{
          fontSize: 12,
          color: subTextColor,
          textAlign: 'center',
          opacity: 0.7,
          lineHeight: 1.6,
        }}>
          {isRecording ? '松开发送 · 上滑取消' : '按住按钮开始录音，松开自动转写为文字'}
        </div>
      </div>

      {/* 转写确认区域 */}
      {(isRecording || showResult) && (
        <div style={{
          padding: '24px',
          borderRadius: 16,
          background: 'rgba(255, 255, 255, 0.04)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: `1px solid ${isRecording ? 'rgba(200, 50, 50, 0.3)' : 'rgba(90, 122, 78, 0.2)'}`,
          marginBottom: 32,
          animation: 'fadeInUp 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) both',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 14,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              {isRecording && (
                <div style={{
                  width: 8, height: 8,
                  borderRadius: '50%',
                  background: '#C83232',
                  animation: 'blink 1s ease-in-out infinite',
                }} />
              )}
              <span style={{
                fontSize: 13,
                fontWeight: 500,
                color: isRecording ? '#C83232' : '#5A7A4E',
                fontFamily: "'Noto Serif SC', serif",
              }}>
                {isRecording ? '实时转写中...' : '转写结果确认'}
              </span>
              {!isRecording && showResult && (
                <span className="concept-hint" title="系统识别不确定的字词用波浪下划线标记，建议检查后再归档。">?</span>
              )}
            </div>
            {showResult && !isRecording && !showConfirmStep && (
              <button
                onClick={() => { setIsEditing(!isEditing); if (!isEditing) setEditText(resultText); }}
                style={{
                  fontSize: 11,
                  color: subTextColor,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: 6,
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.color = textColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = subTextColor;
                }}
              >
                {isEditing ? '完成编辑' : '编辑修正'}
              </button>
            )}
          </div>

          {/* 转写文本区 */}
          <div style={{
            minHeight: 100,
            marginBottom: 16,
          }}>
            {isRecording ? (
              <div style={{
                fontSize: 14,
                lineHeight: 1.8,
                color: textColor,
                whiteSpace: 'pre-wrap',
                fontFamily: "'Noto Serif SC', serif",
                maxHeight: 240,
                overflowY: 'auto',
              }}>
                {liveText}
                <span style={{
                  display: 'inline-block',
                  width: 2,
                  height: 16,
                  background: '#5A7A4E',
                  marginLeft: 2,
                  verticalAlign: 'middle',
                  animation: 'blink 0.8s ease-in-out infinite',
                }} />
              </div>
            ) : isEditing ? (
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  minHeight: 120,
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: `1px solid rgba(124, 111, 240, 0.3)`,
                  background: 'rgba(124, 111, 240, 0.05)',
                  color: textColor,
                  fontSize: 14,
                  lineHeight: 1.7,
                  fontFamily: "'Noto Serif SC', serif",
                  resize: 'vertical',
                  outline: 'none',
                }}
              />
            ) : (
              <div
                style={{
                  fontSize: 14,
                  lineHeight: 1.9,
                  color: textColor,
                  whiteSpace: 'pre-wrap',
                  fontFamily: "'Noto Serif SC', serif",
                  maxHeight: 200,
                  overflowY: 'auto',
                }}
                dangerouslySetInnerHTML={{ __html: renderUncertainText(resultText) }}
              />
            )}
          </div>

          {/* 归档选项（showResult 且不在录音时显示） */}
          {showResult && !isRecording && (
            <div style={{
              paddingTop: 16,
              borderTop: `1px solid rgba(255, 255, 255, 0.06)`,
              animation: 'fadeInUp 0.3s ease both',
            }}>
              {/* 话题选择 */}
              <div style={{ marginBottom: 14 }}>
                <label style={{
                  fontSize: 11,
                  color: subTextColor,
                  marginBottom: 6,
                  display: 'block',
                }}>
                  归档到哪个话题
                </label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {topics.map(t => (
                    <button
                      key={t}
                      onClick={() => setSelectedTopic(t)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 8,
                        border: `1px solid ${selectedTopic === t ? 'rgba(124, 111, 240, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
                        background: selectedTopic === t ? 'rgba(124, 111, 240, 0.12)' : 'transparent',
                        color: selectedTopic === t ? '#7C6FF0' : subTextColor,
                        fontSize: 11.5,
                        cursor: 'pointer',
                        fontFamily: selectedTopic === t ? "'Noto Serif SC', serif" : 'inherit',
                        fontWeight: selectedTopic === t ? 500 : 400,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* 标签选择 */}
              <div style={{ marginBottom: 18 }}>
                <label style={{
                  fontSize: 11,
                  color: subTextColor,
                  marginBottom: 6,
                  display: 'block',
                }}>
                  添加标签
                </label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {suggestTags.map(tag => {
                    const selected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => {
                          setSelectedTags(prev =>
                            selected ? prev.filter(t => t !== tag) : [...prev, tag]
                          );
                        }}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 6,
                          border: `1px solid ${selected ? 'rgba(90, 122, 78, 0.4)' : 'rgba(255, 255, 255, 0.06)'}`,
                          background: selected ? 'rgba(90, 122, 78, 0.12)' : 'transparent',
                          color: selected ? '#5A7A4E' : subTextColor,
                          fontSize: 10.5,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {selected ? '✓ ' : ''}#{tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 操作按钮 */}
              <div style={{
                display: 'flex',
                gap: 10,
                justifyContent: 'flex-end',
              }}>
                <button
                  onClick={() => {
                    setShowResult(false);
                    setResultText('');
                    setLiveText('');
                    setRecordDuration(0);
                    setSelectedTags([]);
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 10,
                    border: `1px solid rgba(255, 255, 255, 0.08)`,
                    background: 'transparent',
                    color: subTextColor,
                    fontSize: 12,
                    cursor: 'pointer',
                    fontFamily: "'Noto Serif SC', serif",
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                    e.currentTarget.style.color = textColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = subTextColor;
                  }}
                >
                  重新录制
                </button>
                <button
                  onClick={() => {
                    setResultText(editText || resultText);
                    setIsEditing(false);
                    setShowConfirmStep(true);
                    setTimeout(() => setShowConfirmStep(false), 1500);
                  }}
                  style={{
                    padding: '8px 22px',
                    borderRadius: 10,
                    border: 'none',
                    background: 'linear-gradient(135deg, #7C6FF0, #9B8EF7)',
                    color: '#fff',
                    fontSize: 12.5,
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: "'Noto Serif SC', serif",
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 16px rgba(124, 111, 240, 0.3)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(124, 111, 240, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(124, 111, 240, 0.3)';
                  }}
                >
                  {showConfirmStep ? '✓ 已归档到知识库' : '确认归档'}
                </button>
              </div>

              {/* 归档成功提示 */}
              {showConfirmStep && (
                <div style={{
                  marginTop: 12,
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: 'rgba(90, 122, 78, 0.1)',
                  border: '1px solid rgba(90, 122, 78, 0.3)',
                  fontSize: 11.5,
                  color: '#5A7A4E',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  animation: 'fadeInUp 0.3s ease both',
                  fontFamily: "'Noto Serif SC', serif",
                }}>
                  <span>✓</span>
                  <span>已作为新笔记归档到「{selectedTopic}」话题</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 历史转写 */}
      <div>
        <h3 style={{
          fontSize: 14,
          fontWeight: 500,
          fontFamily: "'Noto Serif SC', serif",
          color: textColor,
          marginBottom: 14,
        }}>
          最近转写
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {TRANSCRIPT_EXAMPLES.map(item => (
            <div
              key={item.id}
              onClick={() => onViewTranscript(item)}
              style={{
                padding: '14px 18px',
                borderRadius: 10,
                background: isNight ? '#262522' : '#FFFEFA',
                border: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(90, 122, 78, 0.3)';
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
                justifyContent: 'space-between',
                marginBottom: 6,
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}>
                  <span style={{
                    fontSize: 14,
                    color: '#5A7A4E',
                  }}>
                    ♪
                  </span>
                  <span style={{
                    fontSize: 14,
                    fontWeight: 500,
                    fontFamily: "'Noto Serif SC', serif",
                    color: textColor,
                  }}>
                    {item.title}
                  </span>
                  <span style={{
                    fontSize: 10,
                    padding: '2px 8px',
                    borderRadius: 10,
                    background: isNight ? 'rgba(255,255,255,0.05)' : 'rgba(43, 42, 38, 0.05)',
                    color: subTextColor,
                  }}>
                    {item.scene}
                  </span>
                </div>
                <div style={{
                  fontSize: 10,
                  color: subTextColor,
                  fontFamily: "'JetBrains Mono', monospace",
                  opacity: 0.6,
                }}>
                  {item.timestamp}
                </div>
              </div>
              <div style={{
                fontSize: 12,
                color: subTextColor,
                opacity: 0.8,
                lineHeight: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
                {item.text.slice(0, 80)}...
              </div>
              <div style={{
                marginTop: 8,
                display: 'flex',
                gap: 16,
                fontSize: 10,
                color: subTextColor,
                opacity: 0.6,
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                <span>{item.duration}</span>
                <span>·</span>
                <span>{item.speaker}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// 转写详情面板
// ============================================
function TranscriptDetailPanel({ transcript, onClose, isNight, textColor, subTextColor }) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [waveHeights, setWaveHeights] = React.useState(Array(40).fill(6));

  // 波形动画
  React.useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setWaveHeights(prev => prev.map(() => 4 + Math.random() * 16));
        setProgress(prev => Math.min(prev + 0.5, 100));
      }, 100);
    } else {
      setWaveHeights(Array(40).fill(6));
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const totalSeconds = 105; // 1:45
  const currentSeconds = Math.floor((progress / 100) * totalSeconds);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // 计算当前高亮段落
  const paragraphs = transcript.text.split('\n\n');
  const currentParaIndex = Math.floor((progress / 100) * paragraphs.length);

  return (
    <div style={{
      position: 'fixed',
      right: 0, top: 0, bottom: 0,
      width: 480,
      background: isNight ? '#262522' : '#FFFEFA',
      borderLeft: `1px solid ${isNight ? 'rgba(255,255,255,0.08)' : 'rgba(43, 42, 38, 0.08)'}`,
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1500,
      animation: 'slideInRight 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both',
      boxShadow: '-10px 0 40px rgba(0,0,0,0.1)',
    }}>
      {/* 顶部 */}
      <div style={{
        padding: '20px 24px 16px',
        borderBottom: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}>
          <div>
            <div style={{
              fontSize: 18,
              fontWeight: 500,
              fontFamily: "'Noto Serif SC', serif",
              color: textColor,
              marginBottom: 4,
            }}>
              {transcript.title}
            </div>
            <div style={{
              fontSize: 11,
              color: subTextColor,
              opacity: 0.7,
              display: 'flex',
              gap: 10,
            }}>
              <span>{transcript.timestamp}</span>
              <span>·</span>
              <span>{transcript.duration}</span>
              <span>·</span>
              <span>{transcript.scene}</span>
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
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* 播放器 */}
        <div style={{
          padding: '14px 16px',
          borderRadius: 12,
          background: isNight ? 'rgba(90, 122, 78, 0.08)' : 'rgba(90, 122, 78, 0.05)',
          border: `1px solid ${isNight ? 'rgba(90, 122, 78, 0.2)' : 'rgba(90, 122, 78, 0.15)'}`,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginBottom: 10,
          }}>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                width: 40, height: 40,
                borderRadius: '50%',
                border: 'none',
                background: 'linear-gradient(135deg, #5A7A4E, #7A9A6E)',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 12px rgba(90, 122, 78, 0.3)',
              }}
            >
              {isPlaying ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="8,5 19,12 8,19" />
                </svg>
              )}
            </button>

            <div style={{ flex: 1 }}>
              {/* 波形 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                height: 24,
                marginBottom: 6,
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
                        borderRadius: 1,
                        background: isPast ? '#5A7A4E' : (isNight ? 'rgba(255,255,255,0.2)' : 'rgba(43, 42, 38, 0.15)'),
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
                opacity: 0.7,
              }}>
                <span>{formatTime(currentSeconds)}</span>
                <span>{transcript.duration}</span>
              </div>
            </div>
          </div>

          {/* 音色信息 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 11,
            color: subTextColor,
            borderTop: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'}`,
            paddingTop: 10,
          }}>
            <span>朗读音色：<span style={{ color: '#5A7A4E', fontWeight: 500 }}>我的声音</span></span>
            <span>1.0x 语速</span>
          </div>
        </div>
      </div>

      {/* 文本内容 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px 24px',
      }}>
        <div style={{
          fontSize: 13,
          lineHeight: 2,
          color: textColor,
          fontFamily: "'Noto Serif SC', serif",
        }}>
          {paragraphs.map((p, i) => (
            <p
              key={i}
              style={{
                margin: '0 0 14px',
                padding: '4px 8px',
                borderRadius: 6,
                background: isPlaying && i === currentParaIndex
                  ? (isNight ? 'rgba(90, 122, 78, 0.1)' : 'rgba(90, 122, 78, 0.08)')
                  : 'transparent',
                color: isPlaying && i === currentParaIndex ? '#5A7A4E' : textColor,
                transition: 'all 0.3s ease',
              }}
            >
              {p}
            </p>
          ))}
        </div>
      </div>

      {/* 底部操作 */}
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
          编辑文本
        </button>
        <button style={{
          flex: 1,
          padding: '10px',
          borderRadius: 8,
          border: 'none',
          background: 'linear-gradient(135deg, #5A7A4E, #7A9A6E)',
          color: '#fff',
          fontSize: 12,
          fontWeight: 500,
          cursor: 'pointer',
          fontFamily: "'Noto Serif SC', serif",
        }}>
          归档到知识库
        </button>
      </div>
    </div>
  );
}

Object.assign(window, {
  VoiceView,
  VoiceRecordView,
  TranscriptDetailPanel,
});
