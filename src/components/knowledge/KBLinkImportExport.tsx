/**
 * OneOS 知识库关联和导入导出
 * 从KnowledgeBasePage提取
 * 
 * 作者：A09 珀耳塞福涅（文档主管）
 */

import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { Tag } from '../ui/Tag';
import { Icon } from '../ui/Icon';
import { useToast } from '../ui/Toast';
import { KnowledgeNote, KnowledgeLink } from '../../shared/kernel/knowledge/knowledge-types';

// ==================== 知识关联 ====================

interface KBLinkManagerProps {
  notes: KnowledgeNote[];
  links: KnowledgeLink[];
  onCreateLink: (sourceId: string, targetId: string) => void;
}

export const KBLinkManager: React.FC<KBLinkManagerProps> = ({ notes, links, onCreateLink }) => {
  const [selectedNote, setSelectedNote] = useState<string | null>(null);

  const selectedNoteData = notes.find((n) => n.id === selectedNote);
  const backlinks = selectedNoteData ? selectedNoteData.backlinkNoteIds : [];
  const outgoingLinks = selectedNoteData ? selectedNoteData.linkedNoteIds : [];

  // 孤立笔记（没有任何关联）
  const isolatedNotes = notes.filter((n) => n.linkedNoteIds.length === 0 && n.backlinkNoteIds.length === 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text-primary)' }}>知识关联</h3>

      {/* 笔记选择器 */}
      <Card>
        <CardHeader title="选择笔记查看关联" icon="file-text" />
        <CardBody>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {notes.slice(0, 20).map((note) => (
              <div
                key={note.id}
                onClick={() => setSelectedNote(note.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  background: selectedNote === note.id ? 'var(--color-primary-100)' : 'var(--color-bg-tertiary)',
                  color: selectedNote === note.id ? 'var(--color-primary-500)' : 'var(--color-text-secondary)',
                  fontSize: 12,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  maxWidth: 200,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {note.title}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* 关联详情 */}
      {selectedNoteData && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* 反向链接 */}
          <Card>
            <CardHeader title={`反向链接 (${backlinks.length})`} icon="arrow-left" />
            <CardBody>
              {backlinks.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: 13 }}>
                  暂无反向链接
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {backlinks.map((noteId) => {
                    const note = notes.find((n) => n.id === noteId);
                    return note ? (
                      <div key={noteId} style={{ padding: 8, background: 'var(--color-bg-tertiary)', borderRadius: 6, fontSize: 13 }}>
                        {note.title}
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </CardBody>
          </Card>

          {/* 出站链接 */}
          <Card>
            <CardHeader title={`出站链接 (${outgoingLinks.length})`} icon="arrow-right" />
            <CardBody>
              {outgoingLinks.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: 13 }}>
                  暂无出站链接
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {outgoingLinks.map((noteId) => {
                    const note = notes.find((n) => n.id === noteId);
                    return note ? (
                      <div key={noteId} style={{ padding: 8, background: 'var(--color-bg-tertiary)', borderRadius: 6, fontSize: 13 }}>
                        {note.title}
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {/* 孤立笔记 */}
      <Card>
        <CardHeader title={`孤立笔记 (${isolatedNotes.length})`} icon="alert-triangle" />
        <CardBody>
          {isolatedNotes.length === 0 ? (
            <div style={{ padding: 16, textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: 13 }}>
              所有笔记都有关联，知识网络很健康！
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {isolatedNotes.slice(0, 10).map((note) => (
                <Tag key={note.id} color="warning" style={{ fontSize: 12 }}>
                  {note.title}
                </Tag>
              ))}
              {isolatedNotes.length > 10 && (
                <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)', alignSelf: 'center' }}>
                  还有 {isolatedNotes.length - 10} 篇...
                </span>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {/* 关联统计 */}
      <Card>
        <CardHeader title="关联统计" icon="bar-chart" />
        <CardBody>
          <div style={{ display: 'flex', gap: 48 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>总关联数</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#8B5CF6' }}>{links.length}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>平均关联/笔记</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#00CEC9' }}>
                {notes.length > 0 ? (links.length / notes.length).toFixed(1) : 0}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>孤立笔记占比</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#FD79A8' }}>
                {notes.length > 0 ? ((isolatedNotes.length / notes.length) * 100).toFixed(1) : 0}%
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

// ==================== 导入导出 ====================

interface KBImportExportProps {
  onExportJSON: () => void;
  onExportMarkdown: () => void;
  onImportJSON: (json: string) => void;
}

export const KBImportExport: React.FC<KBImportExportProps> = ({
  onExportJSON,
  onExportMarkdown,
  onImportJSON,
}) => {
  const toast = useToast();
  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);

  const handleExportJSON = () => {
    onExportJSON();
    toast.success('JSON文件已导出');
  };

  const handleExportMarkdown = () => {
    onExportMarkdown();
    toast.success('Markdown文件已导出');
  };

  const handleImport = () => {
    if (!importText.trim()) {
      toast.error('请粘贴JSON数据');
      return;
    }
    try {
      onImportJSON(importText);
      toast.success('导入成功');
      setImportText('');
      setShowImport(false);
    } catch (error) {
      toast.error('导入失败：JSON格式错误');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text-primary)' }}>导入导出</h3>

      {/* 导出 */}
      <Card>
        <CardHeader title="导出数据" icon="download" />
        <CardBody>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200, padding: 16, background: 'var(--color-bg-tertiary)', borderRadius: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Icon name="file-text" size={20} style={{ color: '#8B5CF6' }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>JSON格式</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
                完整导出所有笔记、分类、标签、关联数据，包含元数据
              </p>
              <Button variant="primary" size="sm" onClick={handleExportJSON} fullWidth>
                <Icon name="download" size={14} style={{ marginRight: 6 }} />
                导出JSON
              </Button>
            </div>

            <div style={{ flex: 1, minWidth: 200, padding: 16, background: 'var(--color-bg-tertiary)', borderRadius: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Icon name="file" size={20} style={{ color: '#00B894' }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>Markdown格式</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
                导出为Markdown文档，方便在其他笔记软件中使用
              </p>
              <Button variant="success" size="sm" onClick={handleExportMarkdown} fullWidth>
                <Icon name="download" size={14} style={{ marginRight: 6 }} />
                导出Markdown
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 导入 */}
      <Card>
        <CardHeader title="导入数据" icon="upload" />
        <CardBody>
          {!showImport ? (
            <div style={{ textAlign: 'center', padding: 24 }}>
              <Icon name="upload" size={48} style={{ color: 'var(--color-text-tertiary)', marginBottom: 12 }} />
              <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 16 }}>
                从JSON文件导入知识库数据
              </p>
              <Button variant="primary" onClick={() => setShowImport(true)}>
                <Icon name="plus" size={14} style={{ marginRight: 6 }} />
                开始导入
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                粘贴JSON数据
              </label>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder='{"notes": [...], "categories": [...], ...}'
                style={{
                  width: '100%',
                  minHeight: 200,
                  padding: 12,
                  borderRadius: 8,
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-bg-primary)',
                  color: 'var(--color-text-primary)',
                  fontSize: 13,
                  fontFamily: 'monospace',
                  resize: 'vertical',
                }}
              />
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <Button variant="ghost" onClick={() => setShowImport(false)}>取消</Button>
                <Button variant="primary" onClick={handleImport}>
                  <Icon name="check" size={14} style={{ marginRight: 6 }} />
                  确认导入
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* 数据备份提示 */}
      <Card style={{ borderLeft: '4px solid #FDCB6E' }}>
        <CardBody>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <Icon name="info" size={20} style={{ color: '#FDCB6E', flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                定期备份建议
              </div>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                建议每周导出一次JSON备份，防止数据丢失。导出的文件可以存储在云盘或其他安全位置。
                导入功能会覆盖现有数据，请谨慎操作。
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default { KBLinkManager, KBImportExport };
