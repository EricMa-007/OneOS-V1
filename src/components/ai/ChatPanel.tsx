/**
 * OneOS AI对话面板组件
 * 从AIPage提取，负责消息列表、输入框、流式输出渲染
 * 
 * 作者：A09 珀耳塞福涅（AI工程师）
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Tag } from '../ui/Tag';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  streaming?: boolean;
  references?: Array<{ title: string; source: string; relevance: number }>;
}

interface ChatPanelProps {
  messages: Message[];
  isStreaming: boolean;
  onSendMessage: (content: string) => void;
  onStopStreaming: () => void;
  onClearChat: () => void;
  personaName?: string;
  placeholder?: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  isStreaming,
  onSendMessage,
  onStopStreaming,
  onClearChat,
  personaName = 'AI助手',
  placeholder = '输入消息...',
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 自动调整输入框高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  // 发送消息
  const handleSend = useCallback(() => {
    if (!input.trim() || isStreaming) return;
    onSendMessage(input.trim());
    setInput('');
  }, [input, isStreaming, onSendMessage]);

  // 键盘快捷键
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  // 渲染消息内容（支持Markdown简单渲染）
  const renderContent = (content: string) => {
    // 简单的代码块渲染
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const code = part.replace(/```\w*\n?/, '').replace(/```$/, '');
        return (
          <pre
            key={index}
            style={{
              background: 'var(--color-bg-tertiary)',
              padding: 12,
              borderRadius: 8,
              overflow: 'auto',
              fontSize: 13,
              fontFamily: 'monospace',
              margin: '8px 0',
            }}
          >
            <code>{code}</code>
          </pre>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--color-bg-primary)',
      }}
    >
      {/* 消息列表 */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '16px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-secondary)',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                background: 'linear-gradient(135deg, #8B5CF6, #00CEC9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
              }}
            >
              🤖
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {personaName}
            </div>
            <div style={{ fontSize: 14, textAlign: 'center', maxWidth: 300 }}>
              有什么可以帮助你的吗？我可以回答问题、生成内容、分析数据等。
            </div>
            {/* 快捷问题 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 8 }}>
              {['帮我写一篇文章', '总结这段文字', '解释这个概念', '生成代码'].map((q) => (
                <button
                  key={q}
                  onClick={() => onSendMessage(q)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 20,
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-bg-secondary)',
                    color: 'var(--color-text-secondary)',
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-primary-500)';
                    e.currentTarget.style.color = 'var(--color-primary-500)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              display: 'flex',
              gap: 12,
              maxWidth: '85%',
              alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
              flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
            }}
          >
            {/* 头像 */}
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                background:
                  message.role === 'user'
                    ? 'linear-gradient(135deg, #00CEC9, #0984E3)'
                    : 'linear-gradient(135deg, #8B5CF6, #FD79A8)',
                color: '#FFFFFF',
                fontWeight: 600,
              }}
            >
              {message.role === 'user' ? '我' : 'AI'}
            </div>

            {/* 消息内容 */}
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 16,
                background:
                  message.role === 'user'
                    ? 'var(--color-primary-500)'
                    : 'var(--color-bg-secondary)',
                color: message.role === 'user' ? '#FFFFFF' : 'var(--color-text-primary)',
                fontSize: 14,
                lineHeight: 1.6,
                boxShadow: 'var(--shadow-sm)',
                position: 'relative',
              }}
            >
              {renderContent(message.content)}
              {message.streaming && (
                <span
                  style={{
                    display: 'inline-block',
                    width: 8,
                    height: 16,
                    background: 'currentColor',
                    marginLeft: 2,
                    animation: 'blink 1s infinite',
                    verticalAlign: 'text-bottom',
                  }}
                />
              )}

              {/* 参考资料 */}
              {message.references && message.references.length > 0 && (
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                    参考资料:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {message.references.map((ref, idx) => (
                      <div
                        key={idx}
                        style={{
                          fontSize: 12,
                          padding: '4px 8px',
                          background: 'var(--color-bg-tertiary)',
                          borderRadius: 6,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
                          {ref.title}
                        </span>
                        <Tag color="info">{(ref.relevance * 100).toFixed(0)}%</Tag>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 时间戳 */}
              <div
                style={{
                  fontSize: 10,
                  color: message.role === 'user' ? 'rgba(255,255,255,0.7)' : 'var(--color-text-tertiary)',
                  marginTop: 4,
                  textAlign: 'right',
                }}
              >
                {new Date(message.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div
        style={{
          padding: '12px 24px 16px',
          borderTop: '1px solid var(--color-border)',
          background: 'var(--color-bg-secondary)',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'flex-end',
            maxWidth: 800,
            margin: '0 auto',
          }}
        >
          {/* 输入框 */}
          <div
            style={{
              flex: 1,
              position: 'relative',
              background: 'var(--color-bg-primary)',
              borderRadius: 16,
              border: '1px solid var(--color-border)',
              transition: 'all 0.2s ease',
            }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={1}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: 'none',
                background: 'transparent',
                fontSize: 14,
                fontFamily: 'inherit',
                resize: 'none',
                outline: 'none',
                color: 'var(--color-text-primary)',
                maxHeight: 120,
              }}
            />
          </div>

          {/* 发送/停止按钮 */}
          {isStreaming ? (
            <Button
              variant="danger"
              onClick={onStopStreaming}
              style={{ height: 44, padding: '0 16px', borderRadius: 12 }}
            >
              <Icon name="square" size={16} style={{ marginRight: 6 }} />
              停止
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSend}
              disabled={!input.trim()}
              style={{ height: 44, padding: '0 16px', borderRadius: 12 }}
            >
              <Icon name="send" size={16} style={{ marginRight: 6 }} />
              发送
            </Button>
          )}
        </div>

        {/* 底部提示 */}
        <div
          style={{
            textAlign: 'center',
            fontSize: 11,
            color: 'var(--color-text-tertiary)',
            marginTop: 8,
          }}
        >
          按 Enter 发送，Shift + Enter 换行 · AI生成内容仅供参考
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default ChatPanel;
