import React, { useEffect, useState, useMemo } from 'react';
import { useNoteStore } from '../stores/note-store';
import { useAppStore } from '../stores/app-store';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Tag } from '../components/ui/Tag';
import { Icon, IconName } from '../components/ui/Icon';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Loading';
import { dataVisualizationEngine } from '../shared/kernel/data-visualization-engine';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: IconName;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <Card hoverable style={{ padding: 20 }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
      </div>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size="lg" color={color} />
      </div>
    </div>
  </Card>
);

export const DashboardPage: React.FC = () => {
  const { notes, stats, isLoading, fetchNotes, fetchStats, createNote } = useNoteStore();
  const { setCurrentNav } = useAppStore();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    fetchNotes();
    fetchStats();
    const hour = new Date().getHours();
    if (hour < 6) setGreeting('夜深了');
    else if (hour < 12) setGreeting('早上好');
    else if (hour < 14) setGreeting('中午好');
    else if (hour < 18) setGreeting('下午好');
    else setGreeting('晚上好');
  }, [fetchNotes, fetchStats]);

  const recentNotes = notes.slice(0, 5);
  const today = new Date().toISOString().slice(0, 10);
  const todayNotes = notes.filter((n) => n.createdAt.slice(0, 10) === today || n.updatedAt.slice(0, 10) === today);

  // 数据可视化统计
  const writingStats = useMemo(() => {
    if (notes.length === 0) return null;

    const wordCounts = notes.map((n) => n.meta.wordCount || 0);
    const stats = dataVisualizationEngine.calculateStatistics(wordCounts);

    // 最近7天笔记增长
    const last7Days: Array<{ date: string; count: number; words: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().slice(0, 10);
      const dayNotes = notes.filter((n) => n.createdAt.slice(0, 10) === dateStr);
      last7Days.push({
        date: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
        count: dayNotes.length,
        words: dayNotes.reduce((sum, n) => sum + (n.meta.wordCount || 0), 0),
      });
    }

    // 标签分布
    const tagCounts = new Map<string, number>();
    notes.forEach((n) => n.tagIds.forEach((t) => tagCounts.set(t, (tagCounts.get(t) || 0) + 1)));
    const topTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    // 最长笔记
    const longestNote = notes.reduce((max, n) => (n.meta.wordCount > (max?.meta.wordCount || 0) ? n : max), notes[0]);

    return {
      stats,
      last7Days,
      topTags,
      longestNote,
      maxDayCount: Math.max(...last7Days.map((d) => d.count), 1),
      maxDayWords: Math.max(...last7Days.map((d) => d.words), 1),
    };
  }, [notes]);

  const quickActions = [
    { label: '新建笔记', icon: 'plus' as IconName, color: '#8B5CF6', action: () => createNote({ title: '新笔记' }) },
    { label: 'AI 对话', icon: 'sparkles' as IconName, color: '#74B9FF', action: () => setCurrentNav('ai') },
    { label: '知识图谱', icon: 'network' as IconName, color: '#FDCB6E', action: () => setCurrentNav('graph') },
    { label: '语音记录', icon: 'mic' as IconName, color: '#FF6B6B', action: () => setCurrentNav('voice') },
  ];

  if (isLoading) {
    return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>{[1,2,3,4].map((i) => <Skeleton key={i} variant="card" height={120} />)}</div>;
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0, marginBottom: 4 }}>{greeting}，欢迎回来</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>{new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard title="笔记总数" value={stats?.total || 0} icon="file" color="#8B5CF6" />
        <StatCard title="总字数" value={stats?.totalWords ? `${(stats.totalWords / 1000).toFixed(1)}k` : '0'} icon="edit" color="#00CEC9" />
        <StatCard title="今日更新" value={todayNotes.length} icon="calendar" color="#FDCB6E" />
        <StatCard title="收藏笔记" value={stats?.favorites || 0} icon="star" color="#FD79A8" />
      </div>

      <Card style={{ marginBottom: 24 }}>
        <CardHeader title="快捷操作" subtitle="一键开始你的创作" />
        <CardBody>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
            {quickActions.map((action) => (
              <button key={action.label} onClick={action.action} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '20px 16px', background: 'var(--color-neutral-50)', border: '1px solid var(--border-light)', borderRadius: 12, cursor: 'pointer' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${action.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={action.icon} size="md" color={action.color} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{action.label}</span>
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* 数据可视化区域 */}
      {writingStats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 24 }}>
          {/* 最近7天创作趋势 */}
          <Card>
            <CardHeader
              title="最近7天创作趋势"
              subtitle={`共创作 ${writingStats.last7Days.reduce((sum, d) => sum + d.count, 0)} 篇笔记，${writingStats.last7Days.reduce((sum, d) => sum + d.words, 0)} 字`}
            />
            <CardBody>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 140, gap: 8, paddingTop: 16 }}>
                {writingStats.last7Days.map((day, index) => (
                  <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 600 }}>{day.count > 0 ? day.count : ''}</div>
                    <div
                      style={{
                        width: '100%',
                        maxWidth: 32,
                        height: `${Math.max((day.count / writingStats.maxDayCount) * 100, 4)}%`,
                        background: day.count > 0 ? 'linear-gradient(180deg, #8B5CF6, #6C5CE7)' : 'var(--color-neutral-100)',
                        borderRadius: '4px 4px 0 0',
                        transition: 'all 0.3s',
                        minHeight: 4,
                      }}
                    />
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{day.date}</div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* 写作统计 */}
          <Card>
            <CardHeader title="写作统计" subtitle="基于你的所有笔记计算" />
            <CardBody>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                <div style={{ padding: 12, background: 'var(--color-neutral-50)', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>平均字数</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-primary-600)' }}>{Math.round(writingStats.stats.mean)}</div>
                </div>
                <div style={{ padding: 12, background: 'var(--color-neutral-50)', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>中位数</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-success-600)' }}>{Math.round(writingStats.stats.median)}</div>
                </div>
                <div style={{ padding: 12, background: 'var(--color-neutral-50)', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>最长笔记</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-warning-600)' }}>{writingStats.stats.max}</div>
                </div>
                <div style={{ padding: 12, background: 'var(--color-neutral-50)', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>标准差</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-error-600)' }}>{Math.round(writingStats.stats.standardDeviation)}</div>
                </div>
              </div>
              {writingStats.longestNote && (
                <div style={{ marginTop: 12, padding: 10, background: 'linear-gradient(135deg, #8B5CF610, #00CEC910)', borderRadius: 8, border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>最长笔记</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{writingStats.longestNote.title || '无标题'}</div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {/* 标签分布 */}
      {writingStats && writingStats.topTags.length > 0 && (
        <Card style={{ marginBottom: 24 }}>
          <CardHeader title="标签分布" subtitle={`共使用 ${writingStats.topTags.length} 个标签`} />
          <CardBody>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              {writingStats.topTags.map(([tag, count], index) => {
                const maxCount = writingStats.topTags[0][1];
                const size = 12 + (count / maxCount) * 10;
                const colors = ['#8B5CF6', '#00CEC9', '#FD79A8', '#FDCB6E', '#6C5CE7', '#00B894', '#E17055', '#0984E3'];
                return (
                  <div
                    key={tag}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 14px',
                      background: `${colors[index % colors.length]}10`,
                      border: `1px solid ${colors[index % colors.length]}30`,
                      borderRadius: 20,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = `${colors[index % colors.length]}20`; e.currentTarget.style.transform = 'scale(1.05)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = `${colors[index % colors.length]}10`; e.currentTarget.style.transform = 'scale(1)'; }}
                  >
                    <span style={{ fontSize: size, fontWeight: 600, color: colors[index % colors.length] }}>#{tag}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)', background: 'rgba(255,255,255,0.8)', padding: '1px 6px', borderRadius: 10 }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        <Card>
          <CardHeader title="最近笔记" subtitle={`共 ${notes.length} 篇笔记`} action={<Button variant="ghost" size="sm" onClick={() => setCurrentNav('notes')}>查看全部</Button>} />
          <CardBody>
            {recentNotes.length === 0 ? (
              <EmptyState icon="file" title="还没有笔记" description="创建你的第一篇笔记" actionLabel="新建笔记" onAction={() => createNote({ title: '新笔记' })} size="sm" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recentNotes.map((note) => (
                  <div key={note.id} onClick={() => { useAppStore.getState().setCurrentNav('editor'); useNoteStore.getState().selectNote(note.id); }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 8, cursor: 'pointer' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--color-primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon name="file" size="sm" color="#8B5CF6" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{note.title || '无标题'}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{note.meta.wordCount} 字 · {new Date(note.updatedAt).toLocaleDateString('zh-CN')}</div>
                    </div>
                    {note.favorite && <Icon name="star" size="sm" color="#FDCB6E" />}
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="今日动态" subtitle={`${todayNotes.length} 条更新`} />
          <CardBody>
            {todayNotes.length === 0 ? (
              <EmptyState icon="calendar" title="今天还没有记录" description="写一篇笔记，记录今天的思考" actionLabel="写点什么" onAction={() => createNote({ title: '新笔记' })} size="sm" />
            ) : (
              <div style={{ position: 'relative', paddingLeft: 20 }}>
                <div style={{ position: 'absolute', left: 5, top: 8, bottom: 8, width: 2, background: 'var(--color-primary-100)', borderRadius: 1 }} />
                {todayNotes.map((note, index) => (
                  <div key={note.id} style={{ position: 'relative', marginBottom: index < todayNotes.length - 1 ? 16 : 0 }}>
                    <div style={{ position: 'absolute', left: -20, top: 4, width: 12, height: 12, borderRadius: '50%', background: '#8B5CF6', border: '2px solid #FFFFFF', boxShadow: '0 0 0 2px var(--color-primary-200)' }} />
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{note.title || '无标题'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{new Date(note.updatedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })} · 更新</div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
