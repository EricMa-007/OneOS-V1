/**
 * OneOS 知识库分类和标签管理
 * 从KnowledgeBasePage提取
 * 
 * 作者：A09 珀耳塞福涅（文档主管）
 */

import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Tag } from '../ui/Tag';
import { Icon } from '../ui/Icon';
import { Modal } from '../ui/Modal';
import { useToast } from '../ui/Toast';
import { KnowledgeCategory, KnowledgeTag, CATEGORY_COLORS, TAG_COLORS } from '../../shared/kernel/knowledge/knowledge-types';

// ==================== 分类管理 ====================

interface KBCategoryManagerProps {
  categories: KnowledgeCategory[];
  onCreate: (name: string, parentId: string | null) => void;
  onUpdate: (id: string, updates: Partial<KnowledgeCategory>) => void;
  onDelete: (id: string) => boolean;
}

export const KBCategoryManager: React.FC<KBCategoryManagerProps> = ({
  categories,
  onCreate,
  onUpdate,
  onDelete,
}) => {
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<KnowledgeCategory | null>(null);
  const [form, setForm] = useState({ name: '', description: '', color: CATEGORY_COLORS[0], icon: '📁' });

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast.error('请输入分类名称');
      return;
    }

    if (editingCategory) {
      onUpdate(editingCategory.id, form);
      toast.success('分类已更新');
    } else {
      onCreate(form.name, null);
      toast.success('分类已创建');
    }

    setShowModal(false);
    setEditingCategory(null);
    setForm({ name: '', description: '', color: CATEGORY_COLORS[0], icon: '📁' });
  };

  const handleEdit = (category: KnowledgeCategory) => {
    setEditingCategory(category);
    setForm({
      name: category.name,
      description: category.description,
      color: category.color,
      icon: category.icon,
    });
    setShowModal(true);
  };

  const handleDelete = (category: KnowledgeCategory) => {
    if (category.noteCount > 0) {
      toast.error('该分类下还有笔记，无法删除');
      return;
    }
    if (onDelete(category.id)) {
      toast.success('分类已删除');
    } else {
      toast.error('删除失败');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text-primary)' }}>分类管理</h3>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setEditingCategory(null);
            setForm({ name: '', description: '', color: CATEGORY_COLORS[0], icon: '📁' });
            setShowModal(true);
          }}
        >
          <Icon name="plus" size={14} style={{ marginRight: 6 }} />
          新建分类
        </Button>
      </div>

      {categories.length === 0 ? (
        <Card>
          <CardBody style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
            <Icon name="folder" size={48} style={{ marginBottom: 12, opacity: 0.5 }} />
            <div>暂无分类，点击上方按钮创建</div>
          </CardBody>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
          {categories.map((category) => (
            <Card key={category.id} style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: `${category.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                  }}
                >
                  {category.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {category.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                    {category.noteCount} 篇笔记
                  </div>
                </div>
              </div>
              {category.description && (
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                  {category.description}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="ghost" size="sm" onClick={() => handleEdit(category)}>
                  <Icon name="edit" size={12} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(category)}>
                  <Icon name="trash" size={12} style={{ color: '#EF4444' }} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 分类编辑弹窗 */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingCategory ? '编辑分类' : '新建分类'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 6, display: 'block' }}>
              分类名称
            </label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="请输入分类名称"
            />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 6, display: 'block' }}>
              描述
            </label>
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="分类描述（可选）"
            />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 6, display: 'block' }}>
              颜色
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {CATEGORY_COLORS.map((color) => (
                <div
                  key={color}
                  onClick={() => setForm({ ...form, color })}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: color,
                    cursor: 'pointer',
                    border: form.color === color ? '3px solid var(--color-text-primary)' : '2px solid transparent',
                    transition: 'all 0.2s',
                  }}
                />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button variant="ghost" onClick={() => setShowModal(false)}>取消</Button>
            <Button variant="primary" onClick={handleSubmit}>
              {editingCategory ? '保存' : '创建'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ==================== 标签管理 ====================

interface KBTagManagerProps {
  tags: KnowledgeTag[];
  onCreate: (name: string) => void;
  onUpdate: (id: string, updates: Partial<KnowledgeTag>) => void;
  onDelete: (id: string) => boolean;
  onMerge: (sourceId: string, targetId: string) => boolean;
}

export const KBTagManager: React.FC<KBTagManagerProps> = ({
  tags,
  onCreate,
  onUpdate,
  onDelete,
  onMerge,
}) => {
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editingTag, setEditingTag] = useState<KnowledgeTag | null>(null);
  const [form, setForm] = useState({ name: '', color: TAG_COLORS[0], description: '' });
  const [newTagName, setNewTagName] = useState('');

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast.error('请输入标签名称');
      return;
    }

    if (editingTag) {
      onUpdate(editingTag.id, form);
      toast.success('标签已更新');
    } else {
      onCreate(form.name);
      toast.success('标签已创建');
    }

    setShowModal(false);
    setEditingTag(null);
    setForm({ name: '', color: TAG_COLORS[0], description: '' });
  };

  const handleQuickCreate = () => {
    if (!newTagName.trim()) {
      toast.error('请输入标签名称');
      return;
    }
    onCreate(newTagName);
    setNewTagName('');
    toast.success('标签已创建');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text-primary)' }}>标签管理</h3>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setEditingTag(null);
            setForm({ name: '', color: TAG_COLORS[0], description: '' });
            setShowModal(true);
          }}
        >
          <Icon name="plus" size={14} style={{ marginRight: 6 }} />
          新建标签
        </Button>
      </div>

      {/* 快速创建 */}
      <Card style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <Input
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="快速创建标签，按回车确认"
            onKeyDown={(e) => e.key === 'Enter' && handleQuickCreate()}
            style={{ flex: 1 }}
          />
          <Button variant="primary" onClick={handleQuickCreate}>创建</Button>
        </div>
      </Card>

      {tags.length === 0 ? (
        <Card>
          <CardBody style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
            <Icon name="tag" size={48} style={{ marginBottom: 12, opacity: 0.5 }} />
            <div>暂无标签</div>
          </CardBody>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {tags.map((tag) => (
            <div
              key={tag.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                background: `${tag.color}15`,
                border: `1px solid ${tag.color}40`,
                borderRadius: 20,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onClick={() => {
                setEditingTag(tag);
                setForm({ name: tag.name, color: tag.color, description: tag.description });
                setShowModal(true);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${tag.color}30`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = `${tag.color}15`;
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: tag.color }} />
              <span style={{ fontSize: 13, color: 'var(--color-text-primary)', fontWeight: 500 }}>
                {tag.name}
              </span>
              <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                {tag.usageCount}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 标签编辑弹窗 */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingTag ? '编辑标签' : '新建标签'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 6, display: 'block' }}>
              标签名称
            </label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="请输入标签名称"
            />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 6, display: 'block' }}>
              颜色
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {TAG_COLORS.map((color) => (
                <div
                  key={color}
                  onClick={() => setForm({ ...form, color })}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: color,
                    cursor: 'pointer',
                    border: form.color === color ? '3px solid var(--color-text-primary)' : '2px solid transparent',
                  }}
                />
              ))}
            </div>
          </div>
          {editingTag && (
            <div style={{ display: 'flex', gap: 12, padding: 12, background: 'var(--color-bg-tertiary)', borderRadius: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>使用次数</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)' }}>{editingTag.usageCount}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>关联笔记</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)' }}>{editingTag.noteCount}</div>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', marginTop: 8 }}>
            {editingTag && (
              <Button
                variant="danger"
                onClick={() => {
                  if (onDelete(editingTag.id)) {
                    toast.success('标签已删除');
                    setShowModal(false);
                  }
                }}
              >
                删除标签
              </Button>
            )}
            <div style={{ display: 'flex', gap: 12 }}>
              <Button variant="ghost" onClick={() => setShowModal(false)}>取消</Button>
              <Button variant="primary" onClick={handleSubmit}>
                {editingTag ? '保存' : '创建'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default { KBCategoryManager, KBTagManager };
