// ============================================
// OneOS V2 - 语音输入组件
// 集成语音识别、语音命令、TTS播放
// ============================================

function VoiceInput({
  onTranscript,
  onCommand,
  placeholder = '按住说话，或点击麦克风开始',
  isNight = false,
  compact = false,
}) {
  const [isListening, setIsListening] = React.useState(false);
  const [transcript, setTranscript] = React.useState('');
  const [interim, setInterim] = React.useState('');
  const [error, setError] = React.useState(null);
  const [isSupported, setIsSupported] = React.useState(true);
  const [showCommands, setShowCommands] = React.useState(false);
  const recognitionRef = React.useRef(null);

  React.useEffect(() => {
    const supported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    setIsSupported(supported);
    return () => {
      if (recognitionRef.current) recognitionRef.current.destroy();
    };
  }, []);

  const startListening = () => {
    if (!isSupported) {
      setError('当前浏览器不支持语音识别');
      return;
    }
    setError(null);
    setTranscript('');
    setInterim('');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interimText = '';
      let finalText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += text;
        else interimText += text;
      }
      if (finalText) {
        setTranscript(prev => prev + finalText);
        // 处理语音命令
        if (window.VoiceService) {
          const cmd = window.VoiceService.commands.process(finalText);
          if (cmd && onCommand) onCommand(cmd);
        }
        if (onTranscript) onTranscript(finalText);
      }
      setInterim(interimText);
    };

    recognition.onerror = (e) => {
      setError(`语音识别错误: ${e.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) stopListening();
    else startListening();
  };

  const clearTranscript = () => {
    setTranscript('');
    setInterim('');
  };

  // TTS 播放
  const speak = (text) => {
    if (window.VoiceService && text) {
      window.VoiceService.synthesis.speak(text);
    }
  };

  const commands = window.VoiceService ? window.VoiceService.commands.getCommands() : [];

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={toggleListening}
          disabled={!isSupported}
          style={{
            width: 40, height: 40, borderRadius: '50%',
            border: 'none', cursor: isSupported ? 'pointer' : 'not-allowed',
            background: isListening ? '#FF6B6B' : (isNight ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'),
            color: isListening ? '#fff' : (isNight ? '#fff' : '#333'),
            fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
            boxShadow: isListening ? '0 0 20px rgba(255,107,107,0.5)' : 'none',
            animation: isListening ? 'pulse 1.5s infinite' : 'none',
          }}
          title={isListening ? '停止录音' : '开始录音'}
        >
          {isListening ? '⏹' : '🎤'}
        </button>
        {isListening && interim && (
          <span style={{ fontSize: 12, color: isNight ? '#aaa' : '#666', fontStyle: 'italic' }}>
            {interim}
          </span>
        )}
      </div>
    );
  }

  return (
    <div style={{
      background: isNight ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
      borderRadius: 16, padding: 16, border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}`,
    }}>
      {/* 标题栏 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>🎙️</span>
          <span style={{ fontWeight: 700, fontSize: 14, color: isNight ? '#fff' : '#333' }}>语音输入</span>
          {isListening && (
            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: 'rgba(255,107,107,0.15)', color: '#FF6B6B', fontWeight: 600 }}>
              录音中
            </span>
          )}
        </div>
        <button
          onClick={() => setShowCommands(!showCommands)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: isNight ? '#aaa' : '#666' }}
        >
          {showCommands ? '隐藏命令' : '语音命令'}
        </button>
      </div>

      {/* 语音命令列表 */}
      {showCommands && (
        <div style={{ marginBottom: 12, padding: 12, background: isNight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.8)', borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: isNight ? '#aaa' : '#666', marginBottom: 8, fontWeight: 600 }}>支持的语音命令：</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {commands.slice(0, 12).map(cmd => (
              <span key={cmd} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, background: isNight ? 'rgba(124,111,240,0.2)' : 'rgba(124,111,240,0.1)', color: '#7C6FF0' }}>
                {cmd}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 转写显示区 */}
      <div style={{
        minHeight: 80, maxHeight: 200, overflowY: 'auto',
        background: isNight ? 'rgba(0,0,0,0.3)' : '#fff',
        borderRadius: 8, padding: 12, marginBottom: 12,
        border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}`,
      }}>
        {transcript || interim ? (
          <div>
            {transcript && (
              <span style={{ fontSize: 14, color: isNight ? '#fff' : '#333', lineHeight: 1.6 }}>{transcript}</span>
            )}
            {interim && (
              <span style={{ fontSize: 14, color: isNight ? '#888' : '#999', fontStyle: 'italic', lineHeight: 1.6 }}>{interim}</span>
            )}
          </div>
        ) : (
          <span style={{ fontSize: 13, color: isNight ? '#666' : '#aaa' }}>{placeholder}</span>
        )}
      </div>

      {/* 错误提示 */}
      {error && (
        <div style={{ marginBottom: 12, padding: '8px 12px', background: 'rgba(255,107,107,0.1)', color: '#FF6B6B', borderRadius: 6, fontSize: 12 }}>
          ⚠️ {error}
        </div>
      )}

      {/* 控制按钮 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={toggleListening}
          disabled={!isSupported}
          style={{
            flex: 1, padding: '12px 24px', borderRadius: 12, border: 'none',
            cursor: isSupported ? 'pointer' : 'not-allowed',
            background: isListening ? 'linear-gradient(135deg, #FF6B6B, #EE5A5A)' : 'linear-gradient(135deg, #7C6FF0, #6C5CE7)',
            color: '#fff', fontSize: 14, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.2s', boxShadow: isListening ? '0 4px 20px rgba(255,107,107,0.4)' : '0 4px 20px rgba(124,111,240,0.3)',
          }}
        >
          <span style={{ fontSize: 18 }}>{isListening ? '⏹' : '🎤'}</span>
          {isListening ? '停止录音' : '开始录音'}
        </button>

        {transcript && (
          <>
            <button
              onClick={() => speak(transcript)}
              style={{ padding: '12px 16px', borderRadius: 12, border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, background: 'transparent', cursor: 'pointer', color: isNight ? '#fff' : '#333', fontSize: 16 }}
              title="朗读"
            >🔊</button>
            <button
              onClick={clearTranscript}
              style={{ padding: '12px 16px', borderRadius: 12, border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, background: 'transparent', cursor: 'pointer', color: isNight ? '#fff' : '#333', fontSize: 16 }}
              title="清空"
            >🗑️</button>
          </>
        )}
      </div>

      {/* 不支持提示 */}
      {!isSupported && (
        <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(255,217,61,0.1)', color: '#B8860B', borderRadius: 6, fontSize: 11, textAlign: 'center' }}>
          ⚠️ 当前浏览器不支持语音识别，建议使用 Chrome 或 Edge 浏览器
        </div>
      )}
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.VoiceInput = VoiceInput;
}

console.log('[VoiceInput] 语音输入组件已加载');
