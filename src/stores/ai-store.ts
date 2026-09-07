/**
 * AI对话Store（Zustand）
 */

import { create } from 'zustand';
import { Conversation, Message, Persona } from '../domain/models/conversation';

export type AIStatus = 'idle' | 'thinking' | 'streaming' | 'error';

interface AIState {
  // 对话
  conversations: Conversation[];
  currentConversationId: string | null;
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;

  // AI状态
  aiStatus: AIStatus;
  streamingContent: string;
  currentPersona: Persona | null;
  personas: Persona[];

  // 输入
  inputText: string;
  isInputFocused: boolean;

  // 操作
  setInputText: (text: string) => void;
  setInputFocused: (focused: boolean) => void;
  selectConversation: (id: string | null) => void;
  createConversation: (title?: string, personaId?: string) => Promise<Conversation>;
  deleteConversation: (id: string) => Promise<void>;
  renameConversation: (id: string, title: string) => Promise<void>;
  pinConversation: (id: string) => Promise<void>;

  sendMessage: (content: string) => Promise<void>;
  stopStreaming: () => void;
  regenerateMessage: (messageId: string) => Promise<void>;
  editMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;

  setPersona: (persona: Persona | null) => void;
  selectPersona: (personaId: string) => void;

  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  fetchPersonas: () => Promise<void>;

  clearChat: () => void;
  exportConversation: (id: string) => string;
}

export const useAIStore = create<AIState>((set, get) => ({
  conversations: [],
  currentConversationId: null,
  currentConversation: null,
  messages: [],
  isLoading: false,
  error: null,

  aiStatus: 'idle',
  streamingContent: '',
  currentPersona: null,
  personas: [],

  inputText: '',
  isInputFocused: false,

  setInputText: (text) => set({ inputText: text }),
  setInputFocused: (focused) => set({ isInputFocused: focused }),

  selectConversation: (id) => {
    set({ currentConversationId: id });
    if (id) {
      const conv = get().conversations.find((c) => c.id === id);
      set({ currentConversation: conv || null, messages: conv?.messages || [] });
    } else {
      set({ currentConversation: null, messages: [] });
    }
  },

  createConversation: async (title, personaId) => {
    set({ isLoading: true });
    // 实际调用ConversationService
    await new Promise((r) => setTimeout(r, 100));
    const now = new Date().toISOString();
    const conv: Conversation = {
      id: `c_${Date.now().toString(36)}`,
      title: title || '新对话',
      type: 'chat',
      personaId,
      messages: [],
      messageCount: 0,
      lastMessageAt: now,
      pinned: false,
      tags: [],
      createdAt: now,
      updatedAt: now,
      version: 1,
      deviceId: 'web',
      syncState: 'local',
      deleted: false,
    };
    set((state) => ({
      conversations: [conv, ...state.conversations],
      currentConversationId: conv.id,
      currentConversation: conv,
      messages: [],
      isLoading: false,
    }));
    return conv;
  },

  deleteConversation: async (id) => {
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
      currentConversationId: state.currentConversationId === id ? null : state.currentConversationId,
      currentConversation: state.currentConversationId === id ? null : state.currentConversation,
      messages: state.currentConversationId === id ? [] : state.messages,
    }));
  },

  renameConversation: async (id, title) => {
    set((state) => ({
      conversations: state.conversations.map((c) => (c.id === id ? { ...c, title } : c)),
      currentConversation: state.currentConversationId === id
        ? { ...state.currentConversation!, title }
        : state.currentConversation,
    }));
  },

  pinConversation: async (id) => {
    set((state) => ({
      conversations: state.conversations.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c)),
    }));
  },

  sendMessage: async (content) => {
    if (!content.trim()) return;
    const state = get();
    let convId = state.currentConversationId;
    if (!convId) {
      const conv = await get().createConversation();
      convId = conv.id;
    }

    const now = new Date().toISOString();
    const userMessage: Message = {
      id: `m_${Date.now().toString(36)}`,
      conversationId: convId,
      role: 'user',
      content,
      status: 'completed',
      createdAt: now,
      updatedAt: now,
      version: 1,
      deviceId: 'web',
      syncState: 'local',
      deleted: false,
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      inputText: '',
      aiStatus: 'thinking',
      streamingContent: '',
    }));

    // 模拟AI流式响应
    set({ aiStatus: 'streaming' });
    const response = '这是一个模拟的AI回复。在实际实现中，这里会调用AI服务的流式接口。';
    for (let i = 0; i < response.length; i++) {
      await new Promise((r) => setTimeout(r, 20));
      set({ streamingContent: response.slice(0, i + 1) });
    }

    const aiMessage: Message = {
      id: `m_${Date.now().toString(36)}_ai`,
      conversationId: convId,
      role: 'assistant',
      content: response,
      status: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      deviceId: 'web',
      syncState: 'local',
      deleted: false,
    };

    set((state) => ({
      messages: [...state.messages, aiMessage],
      aiStatus: 'idle',
      streamingContent: '',
    }));
  },

  stopStreaming: () => set({ aiStatus: 'idle', streamingContent: '' }),
  regenerateMessage: async () => { /* 重新生成最后一条AI消息 */ },
  editMessage: async (messageId, content) => {
    set((state) => ({
      messages: state.messages.map((m) => (m.id === messageId ? { ...m, content } : m)),
    }));
  },
  deleteMessage: async (messageId) => {
    set((state) => ({ messages: state.messages.filter((m) => m.id !== messageId) }));
  },

  setPersona: (persona) => set({ currentPersona: persona }),
  selectPersona: (personaId) => {
    const persona = get().personas.find((p) => p.id === personaId);
    set({ currentPersona: persona || null });
  },

  fetchConversations: async () => {
    set({ isLoading: true });
    await new Promise((r) => setTimeout(r, 100));
    set({ isLoading: false });
  },
  fetchMessages: async () => {
    set({ isLoading: true });
    await new Promise((r) => setTimeout(r, 100));
    set({ isLoading: false });
  },
  fetchPersonas: async () => {
    set({ isLoading: true });
    await new Promise((r) => setTimeout(r, 100));
    set({ isLoading: false });
  },

  clearChat: () => set({ messages: [], currentConversationId: null, currentConversation: null }),
  exportConversation: (id) => {
    const conv = get().conversations.find((c) => c.id === id);
    return conv ? JSON.stringify(conv, null, 2) : '';
  },
}));
