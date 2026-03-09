/**
 * SaintSal Labs — Global State (Zustand)
 */
import { create } from 'zustand';
import type { User, Conversation, ChatMessage, SALModelTier, VerticalId, BuilderProject } from '@/types';

interface AppState {
  // Auth
  user: User | null;
  authToken: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setAuthToken: (token: string | null) => void;

  // Chat
  conversations: Conversation[];
  activeConversationId: string | null;
  selectedModel: SALModelTier;
  activeVertical: VerticalId | null;
  setSelectedModel: (model: SALModelTier) => void;
  setActiveVertical: (vertical: VerticalId | null) => void;
  createConversation: (vertical?: VerticalId) => string;
  addMessage: (conversationId: string, message: ChatMessage) => void;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<ChatMessage>) => void;
  setActiveConversation: (id: string | null) => void;

  // Builder
  builderProjects: BuilderProject[];
  activeProjectId: string | null;
  setActiveProject: (id: string | null) => void;
  addBuilderProject: (project: BuilderProject) => void;

  // UI
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Auth
  user: null,
  authToken: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setAuthToken: (authToken) => set({ authToken }),

  // Chat
  conversations: [],
  activeConversationId: null,
  selectedModel: 'pro',
  activeVertical: null,
  setSelectedModel: (selectedModel) => set({ selectedModel }),
  setActiveVertical: (activeVertical) => set({ activeVertical }),

  createConversation: (vertical) => {
    const id = `conv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const conversation: Conversation = {
      id,
      title: 'New Chat',
      messages: [],
      model: get().selectedModel,
      vertical,
      created_at: Date.now(),
      updated_at: Date.now(),
    };
    set((state) => ({
      conversations: [conversation, ...state.conversations],
      activeConversationId: id,
    }));
    return id;
  },

  addMessage: (conversationId, message) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              messages: [...c.messages, message],
              title: c.messages.length === 0 && message.role === 'user'
                ? message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
                : c.title,
              updated_at: Date.now(),
            }
          : c
      ),
    }));
  },

  updateMessage: (conversationId, messageId, updates) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              messages: c.messages.map((m) =>
                m.id === messageId ? { ...m, ...updates } : m
              ),
            }
          : c
      ),
    }));
  },

  setActiveConversation: (activeConversationId) => set({ activeConversationId }),

  // Builder
  builderProjects: [],
  activeProjectId: null,
  setActiveProject: (activeProjectId) => set({ activeProjectId }),
  addBuilderProject: (project) =>
    set((state) => ({ builderProjects: [project, ...state.builderProjects] })),

  // UI
  isLoading: false,
  setLoading: (isLoading) => set({ isLoading }),
}));
