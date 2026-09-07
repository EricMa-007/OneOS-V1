import React, { useEffect, useState, useMemo } from 'react';
import { useNoteStore } from '../stores/note-store';
import { useAppStore } from '../stores/app-store';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Icon, IconName } from '../components/ui/Icon';
import { EmptyState } from '../components/ui/EmptyState';

export const CalendarPage: React.FC = () => {
  const { notes, fetchNotes, createNote, selectNote } = useNoteStore();
  const { setCurrentNav } = useAppStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const notesByDate = useMemo(() => {
    const map = new Map<string, typeof notes>();
    for (const note of notes) {
      if (note.deleted) continue;
      const date = note.createdAt.slice(0, 10);
      if (!map.has(date)) map.set(date, []);
      map.get(date)!.push(note);
    }
    return map;
  }, [notes]);

  const getIntensity = (date: string): number => {
    const dayNotes = notesByDate.get(date) || [];
    if (dayNotes.length === 0) return 0;
    const wordCount = dayNotes.reduce((sum, n) => sum + n.meta.wordCount, 0);
    if (wordCount < 100) return 1;
    if (wordCount < 500) return 2;
    if (wordCount < 1500) return 3;
    return 4;
  };

  const intensityColors = ['var(--color-neutral-100)', '#C4B5FD', '#A78BFA', '#8B5CF6', '#7C3AED'];

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const days: Array<{ date: string; day: number; isCurrentMonth: boolean; isToday: boolean }> = [];
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const date = new Date(year, month - 1, day).toISOString().slice(0, 10);
      days.push({ date, day, isCurrentMonth: false, isToday: false });
    }
    const today = new Date().toISOString().slice(0, 10);
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day).toISOString().slice(0, 10);
      days.push({ date, day, isCurrentMonth: true, isToday: date === today });
    }
    const remaining = 42 - days.length;
    for (let day = 1; day <= remaining; day++) {
      const date = new Date(year, month + 1, day).toISOString().slice(0, 10);
      days.push({ date, day, isCurrentMonth: false, isToday: false });
    }
    return days;
  }, [currentDate]);

  const monthStats = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    const monthNotes = notes.filter((n) => !n.deleted && n.createdAt.startsWith(monthPrefix));
    const activeDays = new Set(monthNotes.map((n) => n.createdAt.slice(0, 10))).size;
    const totalWords = monthNotes.reduce((sum, n) => sum + n.meta.wordCount, 0);
    return { totalNotes: monthNotes.length, activeDays, totalWords };
  }, [currentDate, notes]);

  const selectedDateNotes = selectedDate ? (notesByDate.get(selectedDate) || []) : [];
  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const handleCreateNote = (date: string) => {
    createNote({ title: `${date} 日记` }).then((note) => { selectNote(note.id); setCurrentNav('editor'); });
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid var(--border-default)', background: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="chevron-left" size="sm" /></button>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, minWidth: 140, textAlign: 'center' }}>{currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}</h2>
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid var(--border-default)', background: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="chevron-right" size="sm" /></button>
        </div>
        <Button variant="ghost" size="sm" onClick={() => { setCurrentDate(new Date()); setSelectedDate(new Date().toISOString().slice(0, 10)); }}>今天</Button>
        <div style={{ flex: 1 }} />
        <Button variant="primary" size="sm" onClick={() => handleCreateNote(new Date().toISOString().slice(0, 10))}><Icon name="plus" size="sm" /> 写日记</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 16 }}>
        {[
          { label: '本月笔记', value: monthStats.totalNotes, icon: 'file' as IconName, color: '#8B5CF6' },
          { label: '活跃天数', value: `${monthStats.activeDays} 天`, icon: 'calendar' as IconName, color: '#00CEC9' },
          { label: '总字数', value: monthStats.totalWords > 1000 ? `${(monthStats.totalWords / 1000).toFixed(1)}k` : monthStats.totalWords, icon: 'edit' as IconName, color: '#FDCB6E' },
        ].map((stat) => (
          <Card key={stat.label} style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={stat.icon} size="md" color={stat.color} /></div>
              <div><div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1 }}>{stat.value}</div><div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>{stat.label}</div></div>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ flex: 1, display: 'flex', gap: 16, minHeight: 0 }}>
        <Card style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
            {weekDays.map((day) => <div key={day} style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', padding: '8px 0' }}>{day}</div>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, flex: 1 }}>
            {calendarDays.map((day, index) => {
              const intensity = getIntensity(day.date);
              const dayNotes = notesByDate.get(day.date) || [];
              const isSelected = selectedDate === day.date;
              return (
                <div key={index} onClick={() => day.isCurrentMonth && setSelectedDate(day.date)} onDoubleClick={() => day.isCurrentMonth && handleCreateNote(day.date)} style={{ position: 'relative', borderRadius: 8, padding: 8, cursor: day.isCurrentMonth ? 'pointer' : 'default', background: isSelected ? 'var(--color-primary-50)' : intensity > 0 ? intensityColors[intensity] : 'transparent', border: isSelected ? '2px solid var(--color-primary-500)' : '1px solid transparent', opacity: day.isCurrentMonth ? 1 : 0.3, transition: 'all 0.15s', minHeight: 80, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: 13, fontWeight: day.isToday ? 700 : 500, color: day.isToday ? 'var(--color-primary-600)' : intensity > 0 ? '#FFFFFF' : 'var(--text-primary)', marginBottom: 4 }}>{day.day}{day.isToday && <span style={{ marginLeft: 4, fontSize: 10 }}>今天</span>}</div>
                  {dayNotes.length > 0 && <div style={{ flex: 1, overflow: 'hidden' }}>{dayNotes.slice(0, 2).map((note) => <div key={note.id} style={{ fontSize: 11, color: intensity > 0 ? 'rgba(255,255,255,0.9)' : 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>• {note.title || '无标题'}</div>)}{dayNotes.length > 2 && <div style={{ fontSize: 10, color: intensity > 0 ? 'rgba(255,255,255,0.7)' : 'var(--text-tertiary)' }}>+{dayNotes.length - 2} 更多</div>}</div>}
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>少</span>
            {intensityColors.map((color, i) => <div key={i} style={{ width: 14, height: 14, borderRadius: 4, background: color, border: i === 0 ? '1px solid var(--border-light)' : 'none' }} />)}
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>多</span>
          </div>
        </Card>

        {selectedDate && (
          <Card style={{ width: 300, flexShrink: 0, padding: 20, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div><div style={{ fontSize: 18, fontWeight: 700 }}>{new Date(selectedDate).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}</div><div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{new Date(selectedDate).toLocaleDateString('zh-CN', { weekday: 'long' })} · {selectedDateNotes.length} 篇笔记</div></div>
              <button onClick={() => setSelectedDate(null)} style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="x" size="sm" /></button>
            </div>
            <div style={{ flex: 1, overflow: 'auto' }}>
              {selectedDateNotes.length === 0 ? (
                <EmptyState icon="calendar" title="这一天没有记录" description="写一篇日记，记录这一天的思考" actionLabel="写日记" onAction={() => handleCreateNote(selectedDate)} size="sm" />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedDateNotes.map((note) => (
                    <div key={note.id} onClick={() => { selectNote(note.id); setCurrentNav('editor'); }} style={{ padding: 12, borderRadius: 8, background: 'var(--color-neutral-50)', cursor: 'pointer', border: '1px solid var(--border-light)' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{note.title || '无标题'}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 8 }}><span>{note.meta.wordCount} 字</span>{note.favorite && <Icon name="star" size="xs" color="#FDCB6E" />}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {selectedDateNotes.length > 0 && <Button variant="primary" size="sm" fullWidth style={{ marginTop: 12 }} onClick={() => handleCreateNote(selectedDate)}><Icon name="plus" size="sm" /> 再写一篇</Button>}
          </Card>
        )}
      </div>
    </div>
  );
};
