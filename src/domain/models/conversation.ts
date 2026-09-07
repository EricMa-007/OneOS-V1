/**
 * AI对话领域模型
 */

import { BaseEntity } from './base-entity';

export type MessageRole = 'user' | 'assistant' | 'system';
export type MessageStatus = 'pending' | 'streaming' | 'completed' | 'error';
export type ConversationType = 'chat' | 'brainstorm' | 'research' | 'writing' | 'coding';

export interface Message extends BaseEntity {
  conversationId: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  personaId?: string;
  model?: string;
  tokensUsed?: number;
  references?: string[];
  thinking?: string;
  error?: string;
}

export interface Conversation extends BaseEntity {
  title: string;
  type: ConversationType;
  personaId?: string;
  messages: Message[];
  messageCount: number;
  lastMessageAt: string;
  pinned: boolean;
  tags: string[];
  summary?: string;
}

export interface CreateConversationInput {
  title?: string;
  type?: ConversationType;
  personaId?: string;
  tags?: string[];
}

export interface CreateMessageInput {
  conversationId: string;
  role: MessageRole;
  content: string;
  personaId?: string;
  model?: string;
}

export function createConversation(input: CreateConversationInput): Conversation {
  const now = new Date().toISOString();
  return {
    id: `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    title: input.title || '新对话',
    type: input.type || 'chat',
    personaId: input.personaId,
    messages: [],
    messageCount: 0,
    lastMessageAt: now,
    pinned: false,
    tags: input.tags || [],
    createdAt: now,
    updatedAt: now,
    version: 1,
    deviceId: 'web',
    syncState: 'local',
    deleted: false,
  };
}

export function createMessage(input: CreateMessageInput): Message {
  const now = new Date().toISOString();
  return {
    id: `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    conversationId: input.conversationId,
    role: input.role,
    content: input.content,
    status: input.role === 'user' ? 'completed' : 'pending',
    personaId: input.personaId,
    model: input.model,
    createdAt: now,
    updatedAt: now,
    version: 1,
    deviceId: 'web',
    syncState: 'local',
    deleted: false,
  };
}
