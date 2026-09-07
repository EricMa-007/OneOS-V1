/**
 * OneOS AI助手页面
 * 主页面组件，负责状态管理和布局
 * 具体渲染和交互委托给ChatPanel和AISidebar
 * 
 * 作者：A09 珀耳塞福涅（AI工程师）
 */

import React, { useState, useCallback, useRef } from 'react';
import { useAIStore } from '../stores/ai-store';
import { ChatPanel, Message } from '../components/ai/ChatPanel';
import { AISidebar, Conversation, Persona } from '../components/ai/AISidebar';
import { useToast } from '../components/ui/Toast';

// 预设人设
const DEFAULT_PERSONAS: Persona[] = [
  {
    id: 'default',
    name: '通用助手',
    description: '全能型AI助手，擅长回答各种问题',
    avatar: '🤖',
    systemPrompt: '你是一个有帮助的AI助手。',
  },
  {
    id: 'writer',
    name: '写作专家',
    description: '擅长文章写作、文案创作、内容润色',
    avatar: '✍️',
    systemPrompt: '你是一个专业的写作专家，擅长各种文体的创作。',
  },
  {
    id: 'coder',
    name: '编程助手',
    description: '擅长代码编写、调试、技术问题解答',
    avatar: '💻',
    systemPrompt: '你是一个资深的软件工程师，擅长编程和技术问题。',
  },
  {
    id: 'analyst',
    name: '数据分析',
    description: '擅长数据分析、统计、可视化建议',
    avatar: '📊',
    systemPrompt: '你是一个数据分析师，擅长数据分析和统计。',
  },
  {
    id: 'teacher',
    name: '知识导师',
    description: '擅长知识讲解、概念解释、学习指导',
    avatar: '🎓',
    systemPrompt: '你是一个耐心的老师，擅长用简单的语言解释复杂概念。',
  },
];

export const AIPage: React.FC = () => {
  const toast = useToast();
  const { conversations, currentConversation, sendMessage, streaming, stopStreaming, createConversation, deleteConversation, selectConversation } = useAIStore();

  // UI状态
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentPersonaId, setCurrentPersonaId] = useState('default');
  const [knowledgeBaseEnabled, setKnowledgeBaseEnabled] = useState(true);

  // 转换为UI需要的格式
  const uiConversations: Conversation[] = conversations.map((conv) => ({
    id: conv.id,
    title: conv.title || '新对话',
    lastMessage: conv.messages[conv.messages.length - 1]?.content || '',
    timestamp: conv.updatedAt || conv.createdAt,
    messageCount: conv.messages.length,
  }));

  const uiMessages: Message[] = (currentConversation?.messages || []).map((msg) => ({
    id: msg.id,
    role: msg.role as 'user' | 'assistant' | 'system',
    content: msg.content,
    timestamp: msg.createdAt,
    streaming: msg.streaming,
    references: msg.references,
  }));

  // 发送消息
  const handleSendMessage = useCallback(
    async (content: string) => {
      try {
        await sendMessage(content);
      } catch (error) {
        console.error('发送消息失败:', error);
        toast.error('发送失败，请重试');
      }
    },
    [sendMessage, toast]
  );

  // 新建对话
  const handleNewConversation = useCallback(() => {
    createConversation();
    toast.success('已创建新对话');
  }, [createConversation, toast]);

  // 删除对话
  const handleDeleteConversation = useCallback(
    (id: string) => {
      deleteConversation(id);
      toast.info('对话已删除');
    },
    [deleteConversation, toast]
  );

  // 选择人设
  const handleSelectPersona = useCallback(
    (id: string) => {
      setCurrentPersonaId(id);
      const persona = DEFAULT_PERSONAS.find((p) => p.id === id);
      if (persona) {
        toast.success(`已切换到「${persona.name}」`);
      }
    },
    [toast]
  );

  const currentPersona = DEFAULT_PERSONAS.find((p) => p.id === currentPersonaId);

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      {/* 侧边栏 */}
      <AISidebar
        conversations={uiConversations}
        currentConversationId={currentConversation?.id || null}
        onSelectConversation={selectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        personas={DEFAULT_PERSONAS}
        currentPersonaId={currentPersonaId}
        onSelectPersona={handleSelectPersona}
        knowledgeBaseEnabled={knowledgeBaseEnabled}
        onToggleKnowledgeBase={setKnowledgeBaseEnabled}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* 对话面板 */}
      <div style={{ flex: 1, height: '100%', overflow: 'hidden' }}>
        <ChatPanel
          messages={uiMessages}
          isStreaming={streaming}
          onSendMessage={handleSendMessage}
          onStopStreaming={stopStreaming}
          onClearChat={() => {
            if (currentConversation) {
              // 清空当前对话（新建一个）
              handleNewConversation();
            }
          }}
          personaName={currentPersona?.name || 'AI助手'}
          placeholder={`向${currentPersona?.name || 'AI助手'}提问...`}
        />
      </div>
    </div>
  );
};

export default AIPage;
