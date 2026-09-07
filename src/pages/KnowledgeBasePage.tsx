/**
 * OneOS 知识库管理页面
 * 主页面组件，负责状态管理和布局
 * 具体面板委托给KBOverview、KBCategoryManager、KBTagManager、KBLinkManager、KBImportExport
 * 
 * 由 A10 珀耳塞福涅（文档主管）设计实现
 * 
 * 功能：
 * - 知识库统计概览
 * - 分类管理（创建/编辑/删除）
 * - 标签管理（创建/合并/删除/统计）
 * - 知识关联（反向链接/孤立笔记/相关推荐）
 * - 导入导出（JSON/Markdown）
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNoteStore } from '../stores/note-store';
import { useAppStore } from '../stores/app-store';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { useToast } from '../components/ui/Toast';
import { knowledgeBaseService, KnowledgeCategory, KnowledgeTag, KnowledgeNote } from '../shared/kernel/knowledge-base-service';
import { KBOverview } from '../components/knowledge/KBOverview';
import { KBCategoryManager, KBTagManager } from '../components/knowledge/KBCategoryTagManager';
import { KBLinkManager, KBImportExport } from '../components/knowledge/KBLinkImportExport';

type KBTab = 'overview' | 'categories' | 'tags' | 'links' | 'import-export';

const TABS: Array<{ key: KBTab; label: string; icon: string }> = [
  { key: 'overview', label: '概览', icon: 'home' },
  { key: 'categories', label: '分类', icon: 'folder' },
  { key: 'tags', label: '标签', icon: 'tag' },
  { key: 'links', label: '关联', icon: 'link' },
  { key: 'import-export', label: '导入导出', icon: 'download' },
];

export const KnowledgeBasePage: React.FC = () => {
  const { notes } = useNoteStore();
  const { setCurrentNav } = useAppStore();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<KBTab>('overview');

  // 同步笔记到知识库服务
  useEffect(() => {
    notes.forEach((note) => {
      knowledgeBaseService.addNote({
        id: note.id,
        title: note.title || '无标题',
        content: note.content,
        categoryId: note.categoryId || null,
        tagIds: note.tagIds,
        linkedNoteIds: note.linkedNoteIds || [],
        backlinkNoteIds: note.backlinkNoteIds || [],
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        metadata: {
          wordCount: note.metadata?.wordCount || 0,
          readingTime: note.metadata?.readingTime || 0,
          lastAccessed: note.metadata?.lastAccessed || Date.now(),
          accessCount: note.metadata?.accessCount || 0,
          isFavorite: note.metadata?.isFavorite || false,
          isArchived: note.metadata?.isArchived || false,
          version: note.metadata?.version || 1,
        },
      });
    });
  }, [notes]);

  // 获取统计数据
  const stats = useMemo(() => knowledgeBaseService.getStats(), [notes, activeTab]);
  const categories = useMemo(() => knowledgeBaseService.getAllCategories(), [notes, activeTab]);
  const tags = useMemo(() => knowledgeBaseService.getAllTags(), [notes, activeTab]);
  const kbNotes = useMemo(() => knowledgeBaseService.getAllNotes(), [notes]);
  const links = useMemo(() => knowledgeBaseService.getAllLinks(), [notes]);

  // 分类操作
  const handleCreateCategory = (name: string, parentId: string | null) => {
    knowledgeBaseService.createCategory(name, parentId);
  };

  const handleUpdateCategory = (id: string, updates: Partial<KnowledgeCategory>) => {
    knowledgeBaseService.updateCategory(id, updates);
  };

  const handleDeleteCategory = (id: string): boolean => {
    return knowledgeBaseService.deleteCategory(id);
  };

  // 标签操作
  const handleCreateTag = (name: string) => {
    knowledgeBaseService.getOrCreateTag(name);
  };

  const handleUpdateTag = (id: string, updates: Partial<KnowledgeTag>) => {
    knowledgeBaseService.updateTag(id, updates);
  };

  const handleDeleteTag = (id: string): boolean => {
    return knowledgeBaseService.deleteTag(id);
  };

  const handleMergeTag = (sourceId: string, targetId: string): boolean => {
    return knowledgeBaseService.mergeTags(sourceId, targetId);
  };

  // 关联操作
  const handleCreateLink = (sourceId: string, targetId: string) => {
    knowledgeBaseService.createLink(sourceId, targetId);
  };

  // 导入导出
  const handleExportJSON = () => {
    const json = knowledgeBaseService.exportToJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oneos-knowledge-base-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportMarkdown = () => {
    const markdown = knowledgeBaseService.exportToMarkdown({ includeMetadata: true, includeTags: true });
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oneos-knowledge-base-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (json: string) => {
    knowledgeBaseService.importFromJSON(json);
    toast.success('导入成功');
  };

  const handleNavigateToNotes = () => {
    setCurrentNav('notes');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* 页面标题 */}
      <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--color-border)' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
          知识库管理
        </h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
          管理你的知识分类、标签、关联和数据
        </p>
      </div>

      {/* Tab导航 */}
      <div style={{ display: 'flex', gap: 4, padding: '12px 24px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              border: 'none',
              background: activeTab === tab.key ? 'var(--color-primary-100)' : 'transparent',
              color: activeTab === tab.key ? 'var(--color-primary-500)' : 'var(--color-text-secondary)',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <Icon name={tab.icon as any} size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* 内容区域 */}
      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        {activeTab === 'overview' && (
          <KBOverview stats={stats} onNavigateToNotes={handleNavigateToNotes} />
        )}

        {activeTab === 'categories' && (
          <KBCategoryManager
            categories={categories}
            onCreate={handleCreateCategory}
            onUpdate={handleUpdateCategory}
            onDelete={handleDeleteCategory}
          />
        )}

        {activeTab === 'tags' && (
          <KBTagManager
            tags={tags}
            onCreate={handleCreateTag}
            onUpdate={handleUpdateTag}
            onDelete={handleDeleteTag}
            onMerge={handleMergeTag}
          />
        )}

        {activeTab === 'links' && (
          <KBLinkManager
            notes={kbNotes}
            links={links}
            onCreateLink={handleCreateLink}
          />
        )}

        {activeTab === 'import-export' && (
          <KBImportExport
            onExportJSON={handleExportJSON}
            onExportMarkdown={handleExportMarkdown}
            onImportJSON={handleImportJSON}
          />
        )}
      </div>
    </div>
  );
};

export default KnowledgeBasePage;
