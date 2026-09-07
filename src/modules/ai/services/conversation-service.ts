import type { Conversation, Message, ConversationCreateInput, MessageCreateInput } from '../../../domain/models/conversation';
import type { ConversationRepository } from '../../../domain/repositories/conversation-repository';
import { eventBus, EVENTS } from '../../../shared/kernel/event-bus';
import { logger } from '../../../shared/kernel/logger';

export class ConversationService {
  constructor(private repository: ConversationRepository) {}

  async create(input: ConversationCreateInput): Promise<Conversation> {
    const conv = await this.repository.createConversation(input);
    eventBus.emit(EVENTS.AI.CONVERSATION_CREATED, conv);
    logger.info('对话已创建', { id: conv.id });
    return conv;
  }

  async list() {
    return this.repository.findConversations();
  }

  async getMessages(conversationId: string) {
    return this.repository.findMessages(conversationId);
  }

  async addMessage(conversationId: string, input: MessageCreateInput): Promise<Message> {
    const msg = await this.repository.createMessage(conversationId, input);
    eventBus.emit(EVENTS.AI.MESSAGE_CREATED, msg);
    return msg;
  }

  async delete(id: string): Promise<void> {
    await this.repository.deleteConversation(id);
    eventBus.emit(EVENTS.AI.CONVERSATION_DELETED, { id });
  }

  async updateTitle(id: string, title: string): Promise<Conversation> {
    return this.repository.updateConversation(id, { title });
  }

  async exportToMarkdown(conversationId: string): Promise<string> {
    const messages = await this.repository.findMessages(conversationId);
    return messages.map((m) => `**${m.role === 'user' ? '用户' : 'AI'}**: ${m.content}`).join('\n\n');
  }
}
