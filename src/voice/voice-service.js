// ============================================
// OneOS V2 - 语音服务核心模块
// 集成语音识别（STT）和语音合成（TTS）
// 基于 Web Speech API，支持降级到模拟模式
// ============================================

(function() {
  'use strict';

  // ============================================
  // 语音识别服务（STT）
  // ============================================
  class SpeechRecognitionService {
    constructor(config = {}) {
      this.config = {
        lang: 'zh-CN',
        continuous: true,
        interimResults: true,
        maxAlternatives: 1,
        ...config,
      };
      this.recognition = null;
      this.isListening = false;
      this.isSupported = false;
      this.transcript = '';
      this.interimTranscript = '';
      this.onResult = null;
      this.onEnd = null;
      this.onError = null;
      this.onStart = null;

      this._init();
    }

    _init() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.isSupported = true;
        this.recognition = new SpeechRecognition();
        this.recognition.lang = this.config.lang;
        this.recognition.continuous = this.config.continuous;
        this.recognition.interimResults = this.config.interimResults;
        this.recognition.maxAlternatives = this.config.maxAlternatives;

        this.recognition.onresult = (event) => {
          this.interimTranscript = '';
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              this.interimTranscript += transcript;
            }
          }
          if (finalTranscript) {
            this.transcript += finalTranscript;
          }
          if (this.onResult) {
            this.onResult({
              final: finalTranscript,
              interim: this.interimTranscript,
              full: this.transcript + this.interimTranscript,
            });
          }
        };

        this.recognition.onerror = (event) => {
          console.error('[SpeechRecognition] 错误:', event.error);
          if (this.onError) this.onError(event.error);
        };

        this.recognition.onend = () => {
          this.isListening = false;
          if (this.onEnd) this.onEnd();
        };

        this.recognition.onstart = () => {
          this.isListening = true;
          if (this.onStart) this.onStart();
        };
      } else {
        this.isSupported = false;
        console.warn('[SpeechRecognition] 浏览器不支持语音识别');
      }
    }

    start() {
      if (!this.isSupported || !this.recognition) {
        if (this.onError) this.onError('not-supported');
        return false;
      }
      if (this.isListening) return true;
      this.transcript = '';
      this.interimTranscript = '';
      try {
        this.recognition.start();
        return true;
      } catch (e) {
        console.error('[SpeechRecognition] 启动失败:', e);
        if (this.onError) this.onError(e.message);
        return false;
      }
    }

    stop() {
      if (!this.recognition || !this.isListening) return;
      this.recognition.stop();
    }

    abort() {
      if (!this.recognition) return;
      this.recognition.abort();
      this.isListening = false;
    }

    setLanguage(lang) {
      this.config.lang = lang;
      if (this.recognition) this.recognition.lang = lang;
    }

    getTranscript() {
      return this.transcript;
    }

    getInterimTranscript() {
      return this.interimTranscript;
    }

    destroy() {
      this.abort();
      this.recognition = null;
      this.onResult = null;
      this.onEnd = null;
      this.onError = null;
      this.onStart = null;
    }
  }

  // ============================================
  // 语音合成服务（TTS）
  // ============================================
  class SpeechSynthesisService {
    constructor(config = {}) {
      this.config = {
        lang: 'zh-CN',
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
        voice: null,
        ...config,
      };
      this.synth = window.speechSynthesis || null;
      this.isSupported = !!this.synth;
      this.voices = [];
      this.currentUtterance = null;
      this.onEnd = null;
      this.onStart = null;
      this.onError = null;
      this.onBoundary = null;

      this._loadVoices();
      if (this.synth && this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this._loadVoices();
      }
    }

    _loadVoices() {
      if (!this.synth) return;
      this.voices = this.synth.getVoices();
      // 优先选择中文语音
      const zhVoice = this.voices.find(v => v.lang.startsWith('zh'));
      if (zhVoice && !this.config.voice) {
        this.config.voice = zhVoice;
      }
    }

    getVoices() {
      return this.voices;
    }

    getChineseVoices() {
      return this.voices.filter(v => v.lang.startsWith('zh'));
    }

    speak(text, options = {}) {
      if (!this.isSupported || !text) {
        if (this.onError) this.onError('not-supported');
        return false;
      }

      this.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options.lang || this.config.lang;
      utterance.rate = options.rate || this.config.rate;
      utterance.pitch = options.pitch || this.config.pitch;
      utterance.volume = options.volume || this.config.volume;

      const voice = options.voice || this.config.voice;
      if (voice) utterance.voice = voice;

      utterance.onstart = () => { if (this.onStart) this.onStart(); };
      utterance.onend = () => { this.currentUtterance = null; if (this.onEnd) this.onEnd(); };
      utterance.onerror = (e) => { if (this.onError) this.onError(e); };
      utterance.onboundary = (e) => { if (this.onBoundary) this.onBoundary(e); };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
      return true;
    }

    pause() {
      if (this.synth) this.synth.pause();
    }

    resume() {
      if (this.synth) this.synth.resume();
    }

    cancel() {
      if (this.synth) {
        this.synth.cancel();
        this.currentUtterance = null;
      }
    }

    isSpeaking() {
      return this.synth ? this.synth.speaking : false;
    }

    isPaused() {
      return this.synth ? this.synth.paused : false;
    }

    setConfig(config) {
      this.config = { ...this.config, ...config };
    }

    setVoice(voice) {
      this.config.voice = voice;
    }

    setRate(rate) {
      this.config.rate = Math.max(0.1, Math.min(10, rate));
    }

    setPitch(pitch) {
      this.config.pitch = Math.max(0, Math.min(2, pitch));
    }

    setVolume(volume) {
      this.config.volume = Math.max(0, Math.min(1, volume));
    }

    destroy() {
      this.cancel();
      this.synth = null;
      this.voices = [];
      this.onEnd = null;
      this.onStart = null;
      this.onError = null;
      this.onBoundary = null;
    }
  }

  // ============================================
  // 语音命令系统
  // ============================================
  class VoiceCommandSystem {
    constructor() {
      this.commands = new Map();
      this.wakeWord = null;
      this.isListeningForWakeWord = false;
      this.onWakeWord = null;
      this.onCommand = null;
      this.onUnrecognized = null;

      // 注册默认命令
      this._registerDefaultCommands();
    }

    _registerDefaultCommands() {
      // 导航命令
      this.register('打开首页', () => ({ action: 'navigate', target: 'dashboard' }));
      this.register('打开笔记', () => ({ action: 'navigate', target: 'editor' }));
      this.register('打开日历', () => ({ action: 'navigate', target: 'calendar' }));
      this.register('打开图谱', () => ({ action: 'navigate', target: 'graph' }));
      this.register('打开AI', () => ({ action: 'navigate', target: 'ai' }));
      this.register('打开社交', () => ({ action: 'navigate', target: 'social' }));

      // 编辑命令
      this.register('新建笔记', () => ({ action: 'newNote' }));
      this.register('保存', () => ({ action: 'save' }));
      this.register('撤销', () => ({ action: 'undo' }));
      this.register('重做', () => ({ action: 'redo' }));

      // 控制命令
      this.register('停止', () => ({ action: 'stop' }));
      this.register('暂停', () => ({ action: 'pause' }));
      this.register('继续', () => ({ action: 'resume' }));
      this.register('放大', () => ({ action: 'zoomIn' }));
      this.register('缩小', () => ({ action: 'zoomOut' }));
      this.register('重置', () => ({ action: 'reset' }));
    }

    register(pattern, handler) {
      this.commands.set(pattern, handler);
    }

    unregister(pattern) {
      this.commands.delete(pattern);
    }

    setWakeWord(word) {
      this.wakeWord = word;
    }

    process(transcript) {
      if (!transcript) return null;
      const text = transcript.trim().toLowerCase();

      // 检查唤醒词
      if (this.wakeWord && text.includes(this.wakeWord.toLowerCase())) {
        if (this.onWakeWord) this.onWakeWord(this.wakeWord);
        return { action: 'wakeWord', word: this.wakeWord };
      }

      // 匹配命令
      for (const [pattern, handler] of this.commands) {
        if (text.includes(pattern.toLowerCase())) {
          const result = handler(text);
          if (this.onCommand) this.onCommand(pattern, result);
          return result;
        }
      }

      // 未识别
      if (this.onUnrecognized) this.onUnrecognized(transcript);
      return null;
    }

    getCommands() {
      return Array.from(this.commands.keys());
    }

    clear() {
      this.commands.clear();
      this._registerDefaultCommands();
    }
  }

  // ============================================
  // 语音笔记服务
  // ============================================
  class VoiceNoteService {
    constructor() {
      this.recognition = null;
      this.isRecording = false;
      this.transcript = '';
      this.timestamps = [];
      this.onResult = null;
      this.onEnd = null;
      this.onError = null;
    }

    start() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        if (this.onError) this.onError('not-supported');
        return false;
      }

      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'zh-CN';
      this.recognition.continuous = true;
      this.recognition.interimResults = true;

      this.transcript = '';
      this.timestamps = [];

      this.recognition.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const text = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            this.transcript += text;
            this.timestamps.push({ text, time: Date.now() });
          } else {
            interim += text;
          }
        }
        if (this.onResult) {
          this.onResult({ final: this.transcript, interim, full: this.transcript + interim });
        }
      };

      this.recognition.onerror = (e) => {
        if (this.onError) this.onError(e.error);
      };

      this.recognition.onend = () => {
        this.isRecording = false;
        if (this.onEnd) this.onEnd(this.transcript);
      };

      try {
        this.recognition.start();
        this.isRecording = true;
        return true;
      } catch (e) {
        if (this.onError) this.onError(e.message);
        return false;
      }
    }

    stop() {
      if (this.recognition && this.isRecording) {
        this.recognition.stop();
      }
    }

    getTranscript() {
      return this.transcript;
    }

    getTimestamps() {
      return this.timestamps;
    }

    toNote() {
      return {
        title: `语音笔记 ${new Date().toLocaleString('zh-CN')}`,
        content: this.transcript,
        timestamps: this.timestamps,
        createdAt: new Date().toISOString(),
        type: 'voice-note',
      };
    }

    destroy() {
      this.stop();
      this.recognition = null;
      this.onResult = null;
      this.onEnd = null;
      this.onError = null;
    }
  }

  // ============================================
  // 统一语音服务
  // ============================================
  class VoiceService {
    constructor() {
      this.recognition = new SpeechRecognitionService();
      this.synthesis = new SpeechSynthesisService();
      this.commands = new VoiceCommandSystem();
      this.voiceNotes = new VoiceNoteService();
      this.isSupported = {
        recognition: this.recognition.isSupported,
        synthesis: this.synthesis.isSupported,
      };
    }

    destroy() {
      this.recognition.destroy();
      this.synthesis.destroy();
      this.voiceNotes.destroy();
    }
  }

  // ============================================
  // 暴露 API
  // ============================================
  const Voice = {
    VoiceService,
    SpeechRecognitionService,
    SpeechSynthesisService,
    VoiceCommandSystem,
    VoiceNoteService,
  };

  if (typeof window !== 'undefined') {
    window.Voice = Voice;
    window.VoiceService = new VoiceService();
  }

  console.log('[Voice] 语音服务核心模块已加载', {
    recognitionSupported: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
    synthesisSupported: !!window.speechSynthesis,
  });

})();
