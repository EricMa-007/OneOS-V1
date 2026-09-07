import React, { useEffect, useState, useRef } from 'react';
import { useNoteStore } from '../stores/note-store';
import { useAppStore } from '../stores/app-store';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Icon, IconName } from '../components/ui/Icon';
import { EmptyState } from '../components/ui/EmptyState';
import { useToast } from '../components/ui/Toast';

interface VoiceNote { id: string; title: string; content: string; duration: number; createdAt: string; }

export const VoicePage: React.FC = () => {
  const { createNote } = useNoteStore();
  const { setCurrentNav } = useAppStore();
  const toast = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [transcribedText, setTranscribedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'record' | 'history'>('record');
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (isRecording) { timerRef.current = setInterval(() => { setRecordingTime((t) => t + 1); }, 1000); }
    else { if (timerRef.current) clearInterval(timerRef.current); }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setIsRecording(true);
      setRecordingTime(0);
      toast.info('开始录音');
    } catch { toast.error('无法访问麦克风，请检查权限'); }
  };

  const stopRecording = () => {
    if (!isRecording) return;
    setIsRecording(false);
    setIsProcessing(true);
    setTimeout(() => {
      const mockTexts = [
        '今天的会议讨论了产品的下一阶段发展方向。我们决定优先推进用户体验优化，同时加强数据分析能力。团队成员对新功能的设计方案表示认可，预计下周可以开始开发。',
        '读书笔记：《思考，快与慢》第一章。系统1是快速、直觉性的思考，系统2是缓慢、理性的思考。大多数时候我们依赖系统1，但在重要决策时需要主动调用系统2。',
        '灵感记录：可以将知识图谱与AI对话结合，用户在浏览图谱时可以直接与节点对话，获取相关笔记的摘要和延伸阅读建议。这个功能可以成为OneOS的差异化特性。',
      ];
      const text = mockTexts[Math.floor(Math.random() * mockTexts.length)];
      setTranscribedText(text);
      setIsProcessing(false);
      const newNote: VoiceNote = { id: `voice_${Date.now()}`, title: `语音笔记 ${new Date().toLocaleString('zh-CN')}`, content: text, duration: recordingTime, createdAt: new Date().toISOString() };
      setVoiceNotes((prev) => [newNote, ...prev]);
      toast.success('转文字完成');
    }, 2000);
  };

  const saveAsNote = (voiceNote: VoiceNote) => {
    createNote({ title: voiceNote.title, content: voiceNote.content }).then((note) => { useNoteStore.getState().selectNote(note.id); setCurrentNav('editor'); toast.success('已保存为笔记'); });
  };

  const waveformBars = Array.from({ length: 40 }, (_, i) => i);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <div><h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>语音记录</h2><p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>用声音捕捉灵感，自动转文字</p></div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', background: 'var(--color-neutral-100)', padding: 4, borderRadius: 10 }}>
          {(['record', 'history'] as const).map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '8px 20px', fontSize: 14, fontWeight: 500, borderRadius: 8, border: 'none', cursor: 'pointer', background: activeTab === tab ? '#FFFFFF' : 'transparent', color: activeTab === tab ? 'var(--color-primary-600)' : 'var(--text-secondary)', boxShadow: activeTab === tab ? 'var(--shadow-xs)' : 'none' }}>{tab === 'record' ? '录音' : '历史'}</button>)}
        </div>
      </div>

      {activeTab === 'record' ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Card style={{ width: '100%', maxWidth: 600, padding: 40, textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 32 }}>
              {isRecording && <><div style={{ position: 'absolute', inset: -20, borderRadius: '50%', background: 'rgba(255,107,107,0.2)', animation: 'oneos-pulse 1.5s ease-out infinite' }} /></>}
              <button onClick={isRecording ? stopRecording : startRecording} style={{ width: 96, height: 96, borderRadius: '50%', border: 'none', cursor: 'pointer', background: isRecording ? '#FF6B6B' : 'linear-gradient(135deg, #8B5CF6, #00CEC9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isRecording ? '0 8px 24px rgba(255,107,107,0.4)' : '0 8px 24px rgba(139,92,246,0.3)', position: 'relative', zIndex: 1 }}>
                {isRecording ? <div style={{ width: 32, height: 32, borderRadius: 6, background: '#FFFFFF' }} /> : <Icon name="mic" size="xl" color="#FFFFFF" />}
              </button>
            </div>
            <div style={{ fontSize: 48, fontWeight: 800, marginBottom: 8, fontVariantNumeric: 'tabular-nums' }}>{formatTime(recordingTime)}</div>
            <div style={{ fontSize: 14, color: isRecording ? '#FF6B6B' : 'var(--text-tertiary)', marginBottom: 32, fontWeight: 500 }}>{isRecording ? '正在录音...' : '点击按钮开始录音'}</div>
            {isRecording && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, height: 40, marginBottom: 24 }}>{waveformBars.map((i) => <div key={i} style={{ width: 4, height: `${Math.random() * 30 + 10}px`, background: 'linear-gradient(to top, #8B5CF6, #00CEC9)', borderRadius: 2 }} />)}</div>}
            {isProcessing && <div style={{ textAlign: 'left', padding: 20, background: 'var(--color-neutral-50)', borderRadius: 12, marginBottom: 16 }}><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 20, height: 20, border: '2px solid var(--color-primary-300)', borderTopColor: 'var(--color-primary-600)', borderRadius: '50%', animation: 'oneos-spin 0.8s linear infinite' }} /><span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>正在转文字...</span></div></div>}
            {transcribedText && !isProcessing && (
              <div style={{ textAlign: 'left', padding: 20, background: 'var(--color-neutral-50)', borderRadius: 12, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}><span style={{ fontSize: 13, fontWeight: 600 }}>转文字结果</span><div style={{ display: 'flex', gap: 8 }}><Button variant="ghost" size="sm" onClick={() => setTranscribedText('')}>清除</Button><Button variant="primary" size="sm" onClick={() => { createNote({ title: `语音笔记 ${new Date().toLocaleString('zh-CN')}`, content: transcribedText }).then((note) => { useNoteStore.getState().selectNote(note.id); setCurrentNav('editor'); }); }}><Icon name="save" size="sm" /> 保存为笔记</Button></div></div>
                <p style={{ fontSize: 14, lineHeight: 1.8, margin: 0 }}>{transcribedText}</p>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, fontSize: 12, color: 'var(--text-tertiary)' }}><span><Icon name="check" size="xs" /> 自动转文字</span><span><Icon name="check" size="xs" /> 保存为笔记</span><span><Icon name="check" size="xs" /> 本地处理</span></div>
          </Card>
        </div>
      ) : (
        <div style={{ flex: 1, overflow: 'auto' }}>
          {voiceNotes.length === 0 ? <EmptyState icon="mic" title="还没有语音记录" description="开始录音，你的语音笔记会显示在这里" actionLabel="开始录音" onAction={() => setActiveTab('record')} size="lg" /> : (
            <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {voiceNotes.map((note) => (
                <Card key={note.id} style={{ padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0, background: 'linear-gradient(135deg, #8B5CF6, #00CEC9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="mic" size="md" color="#FFFFFF" /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{note.title}</h3>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button onClick={() => saveAsNote(note)} style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="保存为笔记"><Icon name="save" size="sm" /></button>
                          <button onClick={() => setVoiceNotes((prev) => prev.filter((n) => n.id !== note.id))} style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="删除"><Icon name="trash" size="sm" /></button>
                        </div>
                      </div>
                      <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)', margin: 0, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{note.content}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--text-tertiary)' }}><span><Icon name="clock" size="xs" /> {formatTime(note.duration)}</span><span>·</span><span>{new Date(note.createdAt).toLocaleString('zh-CN')}</span><span>·</span><span>{note.content.length} 字</span></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
