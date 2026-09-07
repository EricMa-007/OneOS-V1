/**
 * OneOS 知识库概览面板
 * 从KnowledgeBasePage提取
 * 
 * 作者：A09 珀耳塞福涅（文档主管）
 */

import React from 'react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Tag } from '../ui/Tag';
import { Icon } from '../ui/Icon';
import { KnowledgeStats } from '../../shared/kernel/knowledge/knowledge-types';

interface KBOverviewProps {
  stats: KnowledgeStats;
  onNavigateToNotes: () => void;
}

export const KBOverview: React.FC<KBOverviewProps> = ({ stats, onNavigateToNotes }) => {
  const statCards = [
    { label: '笔记总数', value: stats.totalNotes, icon: 'file-text', color: '#8B5CF6' },
    { label: '分类数量', value: stats.totalCategories, icon: 'folder', color: '#00CEC9' },
    { label: '标签数量', value: stats.totalTags, icon: 'tag', color: '#FD79A8' },
    { label: '知识关联', value: stats.totalLinks, icon: 'link', color: '#FDCB6E' },
    { label: '总字数', value: stats.totalWords.toLocaleString(), icon: 'type', color: '#0984E3' },
    { label: '平均字数', value: stats.avgWordsPerNote, icon: 'bar-chart', color: '#00B894' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 统计卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
        {statCards.map((stat) => (
          <Card key={stat.label} style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: `${stat.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name={stat.icon as any} size={20} style={{ color: stat.color }} />
              </div>
              <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{stat.label}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {stat.value}
            </div>
          </Card>
        ))}
      </div>

      {/* 最近活动 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* 最近修改 */}
        <Card>
          <CardHeader title="最近修改" icon="clock" />
          <CardBody>
            {stats.recentlyModified.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
                暂无修改记录
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {stats.recentlyModified.slice(0, 5).map((note) => (
                  <div
                    key={note.id}
                    onClick={onNavigateToNotes}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-tertiary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ fontSize: 14, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
                      {note.title}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                      {new Date(note.updatedAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* 热门标签 */}
        <Card>
          <CardHeader title="热门标签" icon="tag" />
          <CardBody>
            {stats.mostUsedTags.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
                暂无标签
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {stats.mostUsedTags.slice(0, 10).map(({ tag, count }) => (
                  <Tag key={tag.id} color="primary" style={{ fontSize: 12 }}>
                    {tag.name} ({count})
                  </Tag>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* 本周/本月统计 */}
      <Card>
        <CardHeader title="创作统计" icon="bar-chart-2" />
        <CardBody>
          <div style={{ display: 'flex', gap: 48 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>本周新增</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#00B894' }}>{stats.notesThisWeek}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>本月新增</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#0984E3' }}>{stats.notesThisMonth}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>日均字数</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#8B5CF6' }}>
                {Math.round(stats.totalWords / 30)}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default KBOverview;
