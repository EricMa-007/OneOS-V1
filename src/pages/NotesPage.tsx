import type { SortMode } from '../types/global';
import React, { useEffect, useState } from 'react';
import { useNoteStore } from '../stores/note-store';
import { useAppStore } from '../stores/app-store';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Tag } from '../components/ui/Tag';
import { Icon, IconName } from '../components/ui/Icon';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Loading';

export const NotesPage: React.FC = () => {
  const { notes, isLoading, fetchNotes, createNote, deleteNote, toggleFavorite, selectNote } = useNoteStore();
  const { setCurrentNav } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortMode, setSortMode] = useState<'updatedAt' | 'createdAt' | 'title'>('updatedAt');
  const [filterFavorite, setFilterFavorite] = useState(false);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const filteredNotes = notes
    .filter((n) => !n.deleted)
    .filter((n) => !filterFavorite || n.favorite)
    .filter((n) => {
      if (!searchQuery.trim()) return true;
      const kw = searchQuery.toLowerCase();
      return n.title.toLowerCase().includes(kw) || n.content.toLowerCase().includes(kw);
    })
    .sort((a, b) => {
      if (sortMode === 'title') return a.title.localeCompare(b.title);
      return new Date(b[sortMode]).getTime() - new Date(a[sortMode]).getTime();
    });

  const handleCreateNote = () => {
    createNote({ title: '新笔记' }).then((note) => { selectNote(note.id); setCurrentNav('editor'); });
  };

  const handleOpenNote = (noteId: string) => { selectNote(noteId); setCurrentNav('editor'); };

  if (isLoading) return <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{[1,2,3,4,5].map((i) => <Skeleton key={i} variant="card" height={80} />)}</div>;

  return (
    <div style={{ height: '100%', display: 'flex', gap: 16 }}>
      <div style={{ width: 220, flexShrink: 0 }}>
        <Card style={{ padding: 16 }}>
          <Button variant="primary" size="sm" fullWidth onClick={handleCreateNote}><Icon name="plus" size="sm" /> 新建笔记</Button>
          <div style={{ marginTop: 16 }}>
            <div onClick={() => setFilterFavorite(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 6, cursor: 'pointer', background: !filterFavorite ? 'var(--color-primary-50)' : 'transparent', color: !filterFavorite ? 'var(--color-primary-600)' : 'var(--text-secondary)', fontWeight: !filterFavorite ? 600 : 500, fontSize: 13 }}>
              <Icon name="file" size="sm" /> 全部笔记 <span style={{ marginLeft: 'auto' }}>{notes.length}</span>
            </div>
            <div onClick={() => setFilterFavorite(!filterFavorite)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 6, cursor: 'pointer', background: filterFavorite ? 'var(--color-orange)15' : 'transparent', color: filterFavorite ? '#B8860B' : 'var(--text-secondary)', fontWeight: filterFavorite ? 600 : 500, fontSize: 13 }}>
              <Icon name="star" size="sm" /> 收藏 <span style={{ marginLeft: 'auto' }}>{notes.filter((n) => n.favorite).length}</span>
            </div>
          </div>
        </Card>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, maxWidth: 400 }}>
            <Input placeholder="搜索笔记..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} prefix={<Icon name="search" size="sm" color="var(--text-tertiary)" />} clearable onClear={() => setSearchQuery('')} />
          </div>
          <div style={{ display: 'flex', background: 'var(--color-neutral-100)', padding: 4, borderRadius: 8 }}>
            <button onClick={() => setViewMode('list')} style={{ width: 32, height: 32, borderRadius: 6, border: 'none', cursor: 'pointer', background: viewMode === 'list' ? '#FFFFFF' : 'transparent', color: viewMode === 'list' ? 'var(--color-primary-600)' : 'var(--text-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="list" size="sm" /></button>
            <button onClick={() => setViewMode('grid')} style={{ width: 32, height: 32, borderRadius: 6, border: 'none', cursor: 'pointer', background: viewMode === 'grid' ? '#FFFFFF' : 'transparent', color: viewMode === 'grid' ? 'var(--color-primary-600)' : 'var(--text-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="grid" size="sm" /></button>
          </div>
          <select value={sortMode} onChange={(e) => setSortMode(e.target.value as SortMode)} style={{ height: 36, padding: '0 12px', borderRadius: 8, border: '1px solid var(--border-default)', fontSize: 13, cursor: 'pointer' }}>
            <option value="updatedAt">最近更新</option>
            <option value="createdAt">创建时间</option>
            <option value="title">标题排序</option>
          </select>
        </div>

        <div style={{ flex: 1, overflow: 'auto' }}>
          {filteredNotes.length === 0 ? (
            <EmptyState icon="file" title={searchQuery ? '没有找到匹配的笔记' : '还没有笔记'} description={searchQuery ? '试试其他关键词' : '创建你的第一篇笔记'} actionLabel={searchQuery ? '清除搜索' : '新建笔记'} onAction={() => searchQuery ? setSearchQuery('') : handleCreateNote()} />
          ) : viewMode === 'list' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredNotes.map((note) => (
                <Card key={note.id} hoverable style={{ padding: '16px 20px', cursor: 'pointer' }} onClick={() => handleOpenNote(note.id)}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--color-primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="file" size="md" color="#8B5CF6" /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{note.title || '无标题'}</h3>
                        {note.favorite && <Icon name="star" size="sm" color="#FDCB6E" />}
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{note.content.replace(/[#*`>\[\]()!-]/g, '').slice(0, 150) || '暂无内容'}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--text-tertiary)' }}>
                        <span>{note.meta.wordCount} 字</span><span>·</span><span>{new Date(note.updatedAt).toLocaleDateString('zh-CN')}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <button onClick={(e) => { e.stopPropagation(); toggleFavorite(note.id); }} style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-tertiary)' }}><Icon name="star" size="sm" /></button>
                      <button onClick={(e) => { e.stopPropagation(); if (confirm('确定删除？')) deleteNote(note.id); }} style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-tertiary)' }}><Icon name="trash" size="sm" /></button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {filteredNotes.map((note) => (
                <Card key={note.id} hoverable style={{ padding: 20, cursor: 'pointer' }} onClick={() => handleOpenNote(note.id)}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{note.title || '无标题'}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, marginBottom: 12, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{note.content.replace(/[#*`>\[\]()!-]/g, '').slice(0, 120) || '暂无内容'}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-tertiary)' }}><span>{note.meta.wordCount} 字</span><span>{new Date(note.updatedAt).toLocaleDateString('zh-CN')}</span></div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
