/**
 * OneOS AI侧边栏组件
 * 从AIPage提取，负责对话历史列表、人设选择、知识库配置
 * 
 * 作者：A09 珀耳塞福涅（AI工程师）
 */

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Tag } from '../ui/Tag';

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  messageCount: number;
}

export interface Persona {
  id: string;
  name: string;
  description: string;
  avatar: string;
  systemPrompt: string;
}

interface AISidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  personas: Persona[];
  currentPersonaId: string;
  onSelectPersona: (id: string) => void;
  knowledgeBaseEnabled: boolean;
  onToggleKnowledgeBase: (enabled: boolean) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const AISidebar: React.FC<AISidebarProps> = ({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  personas,
  currentPersonaId,
  onSelectPersona,
  knowledgeBaseEnabled,
  onToggleKnowledgeBase,
  collapsed = false,
  onToggleCollapse,
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'persona' | 'settings'>('history');

  if (collapsed) {
    return (
      <div
        style={{
          width: 48,
          background: 'var(--color-bg-secondary)',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '12px 0',
          gap: 8,
        }}
      >
        <Button variant="ghost" size="sm" onClick={onNewConversation} title="新对话">
          <Icon name="plus" size={18} />
        </Button>
        <Button variant="ghost" size="sm" onClick={onToggleCollapse} title="展开">
          <Icon name="chevron-right" size={18} />
        </Button>
      </div>
    );
  }

  return (
    <div
      style={{
        width: 280,
        background: 'var(--color-bg-secondary)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* 顶部：新对话按钮 */}
      <div style={{ padding: 16, borderBottom: '1px solid var(--color-border)' }}>
        <Button
          variant="primary"
          fullWidth
          onClick={onNewConversation}
          style={{ height: 40, borderRadius: 10 }}
        >
          <Icon name="plus" size={16} style={{ marginRight: 8 }} />
          新建对话
        </Button>
      </div>

      {/* Tab切换 */}
      <div
        style={{
          display: 'flex',
          padding: '8px 12px',
          gap: 4,
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        {[
          { key: 'history', label: '历史', icon: 'clock' },
          { key: 'persona', label: '人设', icon: 'user' },
          { key: 'settings', label: '设置', icon: 'settings' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            style={{
              flex: 1,
              padding: '8px 4px',
              border: 'none',
              background: activeTab === tab.key ? 'var(--color-primary-100)' : 'transparent',
              color: activeTab === tab.key ? 'var(--color-primary-500)' : 'var(--color-text-secondary)',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            <Icon name={tab.icon as any} size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* 内容区域 */}
      <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
        {/* 历史对话 */}
        {activeTab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {conversations.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: 40,
                  color: 'var(--color-text-tertiary)',
                  fontSize: 13,
                }}
              >
                暂无对话历史
              </div>
            )}
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                style={{
                  padding: 10,
                  borderRadius: 8,
                  background: currentConversationId === conv.id ? 'var(--color-primary-100)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (currentConversationId !== conv.id) {
                    e.currentTarget.style.background = 'var(--color-bg-tertiary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentConversationId !== conv.id) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    marginBottom: 2,
                  }}
                >
                  {conv.title}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--color-text-secondary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    marginBottom: 4,
                  }}
                >
                  {conv.lastMessage}
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: 10, color: 'var(--color-text-tertiary)' }}>
                    {new Date(conv.timestamp).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conv.id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--color-text-tertiary)',
                      padding: 2,
                      opacity: 0,
                      transition: 'opacity 0.2s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
                  >
                    <Icon name="trash" size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 人设选择 */}
        {activeTab === 'persona' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {personas.map((persona) => (
              <div
                key={persona.id}
                onClick={() => onSelectPersona(persona.id)}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  border: '1px solid',
                  borderColor: currentPersonaId === persona.id ? 'var(--color-primary-500)' : 'var(--color-border)',
                  background: currentPersonaId === persona.id ? 'var(--color-primary-100)' : 'var(--color-bg-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #8B5CF6, #FD79A8)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                    }}
                  >
                    {persona.avatar}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      {persona.name}
                    </div>
                    {currentPersonaId === persona.id && (
                      <Tag color="primary" style={{ fontSize: 10 }}>
                        当前
                      </Tag>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  {persona.description}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 设置 */}
        {activeTab === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* 知识库开关 */}
            <div
              style={{
                padding: 12,
                background: 'var(--color-bg-primary)',
                borderRadius: 10,
                border: '1px solid var(--color-border)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  知识库检索
                </span>
                <button
                  onClick={() => onToggleKnowledgeBase(!knowledgeBaseEnabled)}
                  style={{
                    width: 40,
                    height: 22,
                    borderRadius: 11,
                    border: 'none',
                    background: knowledgeBaseEnabled ? 'var(--color-primary-500)' : 'var(--color-neutral-300)',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: 2,
                      left: knowledgeBaseEnabled ? 20 : 2,
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      transition: 'left 0.2s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }}
                  />
                </button>
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                开启后，AI回答将参考您的知识库内容
              </div>
            </div>

            {/* 其他设置项 */}
            <div
              style={{
                padding: 12,
                background: 'var(--color-bg-primary)',
                borderRadius: 10,
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 8 }}>
                对话设置
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                更多设置项开发中...
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 底部：折叠按钮 */}
      {onToggleCollapse && (
        <div style={{ padding: 8, borderTop: '1px solid var(--color-border)' }}>
          <Button variant="ghost" size="sm" fullWidth onClick={onToggleCollapse}>
            <Icon name="chevron-left" size={14} style={{ marginRight: 6 }} />
            收起侧边栏
          </Button>
        </div>
      )}
    </div>
  );
};

export default AISidebar;
