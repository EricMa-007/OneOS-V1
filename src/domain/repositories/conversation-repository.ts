/**
 * 对话Repository接口
 */

import { Conversation, Message, CreateConversationInput, CreateMessageInput } from '../models/conversation';

export interface IConversationRepository {
  getById(id: string): Promise<Conversation | null>;
  getAll(): Promise<Conversation[]>;
  getRecent(limit?: number): Promise<Conversation[]>;
  getPinned(): Promise<Conversation[]>;
  create(input: CreateConversationInput): Promise<Conversation>;
  update(id: string, updates: Partial<Conversation>): Promise<Conversation>;
  delete(id: string): Promise<void>;
  hardDelete(id: string): Promise<void>;
  addMessage(conversationId: string, input: CreateMessageInput): Promise<Message>;
  updateMessage(messageId: string, updates: Partial<Message>): Promise<Message>;
  deleteMessage(messageId: string): Promise<void>;
  getMessages(conversationId: string): Promise<Message[]>;
  count(): Promise<number>;
  clear(): Promise<void>;
}
