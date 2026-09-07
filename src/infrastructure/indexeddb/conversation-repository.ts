/**
 * AI对话Repository IndexedDB实现
 */

import { IndexedDBRepository } from './base-repository';
import { Conversation, Message, CreateConversationInput, CreateMessageInput, createConversation, createMessage } from '../../domain/models/conversation';
import { IConversationRepository } from '../../domain/repositories/conversation-repository';

export class IndexedDBConversationRepository extends IndexedDBRepository<Conversation> implements IConversationRepository {
  protected storeName = 'conversations';
  private messageStore = 'messages';

  protected createEntity(input: CreateConversationInput): Conversation {
    return createConversation(input);
  }

  protected onCreateStore(db: IDBDatabase): void {
    if (!db.objectStoreNames.contains(this.storeName)) {
      const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
      store.createIndex('lastMessageAt', 'lastMessageAt', { unique: false });
      store.createIndex('pinned', 'pinned', { unique: false });
      store.createIndex('deleted', 'deleted', { unique: false });
    }
    if (!db.objectStoreNames.contains(this.messageStore)) {
      const msgStore = db.createObjectStore(this.messageStore, { keyPath: 'id' });
      msgStore.createIndex('conversationId', 'conversationId', { unique: false });
      msgStore.createIndex('createdAt', 'createdAt', { unique: false });
    }
  }

  async getRecent(limit = 20): Promise<Conversation[]> {
    const all = await this.getAll();
    return all.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()).slice(0, limit);
  }

  async getPinned(): Promise<Conversation[]> {
    const all = await this.getAll();
    return all.filter((c) => c.pinned).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  }

  async addMessage(conversationId: string, input: CreateMessageInput): Promise<Message> {
    const message = createMessage({ ...input, conversationId });
    const db = await this.getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(this.messageStore, 'readwrite');
      tx.objectStore(this.messageStore).add(message);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    // 更新对话的最后消息时间和消息数
    const conv = await this.getById(conversationId);
    if (conv) {
      await this.update(conversationId, {
        lastMessageAt: new Date().toISOString(),
        messageCount: conv.messageCount + 1,
      } as Partial<Conversation>);
    }
    return message;
  }

  async updateMessage(messageId: string, updates: Partial<Message>): Promise<Message> {
    const db = await this.getDB();
    const tx = db.transaction(this.messageStore, 'readwrite');
    const store = tx.objectStore(this.messageStore);
    const existing = await new Promise<Message | undefined>((resolve, reject) => {
      const req = store.get(messageId);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    if (!existing) throw new Error(`消息不存在: ${messageId}`);
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    store.put(updated);
    return updated;
  }

  async deleteMessage(messageId: string): Promise<void> {
    const db = await this.getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(this.messageStore, 'readwrite');
      tx.objectStore(this.messageStore).delete(messageId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    const db = await this.getDB();
    return new Promise<Message[]>((resolve, reject) => {
      const tx = db.transaction(this.messageStore, 'readonly');
      const store = tx.objectStore(this.messageStore);
      const index = store.index('conversationId');
      const req = index.getAll(conversationId);
      req.onsuccess = () => {
        const messages = req.result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        resolve(messages);
      };
      req.onerror = () => reject(req.error);
    });
  }
}
