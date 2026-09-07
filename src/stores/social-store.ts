/**
 * 社交Store（Zustand）
 */

import { create } from 'zustand';
import { Person, Circle, Post, Comment } from '../domain/models/social';

export type SocialView = 'feed' | 'circles' | 'contacts' | 'messages' | 'discover';

interface SocialState {
  // 视图
  view: SocialView;
  setView: (view: SocialView) => void;

  // 联系人
  persons: Person[];
  currentPerson: Person | null;
  isLoadingPersons: boolean;

  // 圈子
  circles: Circle[];
  currentCircle: Circle | null;
  isLoadingCircles: boolean;

  // 动态
  posts: Post[];
  currentPost: Post | null;
  isLoadingPosts: boolean;
  feedPage: number;
  hasMorePosts: boolean;

  // 消息
  unreadCount: number;

  // 操作 - 联系人
  fetchPersons: () => Promise<void>;
  selectPerson: (id: string | null) => void;
  addPerson: (person: Person) => void;
  updatePerson: (id: string, updates: Partial<Person>) => void;
  removePerson: (id: string) => void;
  searchPersons: (keyword: string) => Person[];

  // 操作 - 圈子
  fetchCircles: () => Promise<void>;
  selectCircle: (id: string | null) => void;
  addCircle: (circle: Circle) => void;
  updateCircle: (id: string, updates: Partial<Circle>) => void;
  removeCircle: (id: string) => void;
  joinCircle: (id: string) => Promise<void>;
  leaveCircle: (id: string) => Promise<void>;

  // 操作 - 动态
  fetchPosts: (circleId?: string) => Promise<void>;
  loadMorePosts: () => Promise<void>;
  selectPost: (id: string | null) => void;
  addPost: (post: Post) => void;
  updatePost: (id: string, updates: Partial<Post>) => void;
  removePost: (id: string) => void;
  likePost: (postId: string, userId: string) => void;
  unlikePost: (postId: string, userId: string) => void;

  // 操作 - 评论
  addComment: (postId: string, comment: Comment) => void;
  removeComment: (postId: string, commentId: string) => void;
  likeComment: (postId: string, commentId: string, userId: string) => void;

  refresh: () => Promise<void>;
  clear: () => void;
}

export const useSocialStore = create<SocialState>((set, get) => ({
  view: 'feed',
  setView: (view) => set({ view }),

  persons: [],
  currentPerson: null,
  isLoadingPersons: false,

  circles: [],
  currentCircle: null,
  isLoadingCircles: false,

  posts: [],
  currentPost: null,
  isLoadingPosts: false,
  feedPage: 1,
  hasMorePosts: true,

  unreadCount: 0,

  fetchPersons: async () => {
    set({ isLoadingPersons: true });
    await new Promise((r) => setTimeout(r, 100));
    set({ isLoadingPersons: false });
  },
  selectPerson: (id) => set((state) => ({
    currentPerson: id ? state.persons.find((p) => p.id === id) || null : null,
  })),
  addPerson: (person) => set((state) => ({ persons: [...state.persons, person] })),
  updatePerson: (id, updates) => set((state) => ({
    persons: state.persons.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    currentPerson: state.currentPerson?.id === id ? { ...state.currentPerson, ...updates } : state.currentPerson,
  })),
  removePerson: (id) => set((state) => ({
    persons: state.persons.filter((p) => p.id !== id),
    currentPerson: state.currentPerson?.id === id ? null : state.currentPerson,
  })),
  searchPersons: (keyword) => {
    const kw = keyword.toLowerCase();
    return get().persons.filter(
      (p) => p.name.toLowerCase().includes(kw) || p.bio?.toLowerCase().includes(kw)
    );
  },

  fetchCircles: async () => {
    set({ isLoadingCircles: true });
    await new Promise((r) => setTimeout(r, 100));
    set({ isLoadingCircles: false });
  },
  selectCircle: (id) => set((state) => ({
    currentCircle: id ? state.circles.find((c) => c.id === id) || null : null,
  })),
  addCircle: (circle) => set((state) => ({ circles: [...state.circles, circle] })),
  updateCircle: (id, updates) => set((state) => ({
    circles: state.circles.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    currentCircle: state.currentCircle?.id === id ? { ...state.currentCircle, ...updates } : state.currentCircle,
  })),
  removeCircle: (id) => set((state) => ({
    circles: state.circles.filter((c) => c.id !== id),
    currentCircle: state.currentCircle?.id === id ? null : state.currentCircle,
  })),
  joinCircle: async (id) => {
    set((state) => ({
      circles: state.circles.map((c) => (c.id === id ? { ...c, memberCount: c.memberCount + 1 } : c)),
    }));
  },
  leaveCircle: async (id) => {
    set((state) => ({
      circles: state.circles.map((c) => (c.id === id ? { ...c, memberCount: Math.max(0, c.memberCount - 1) } : c)),
    }));
  },

  fetchPosts: async () => {
    set({ isLoadingPosts: true, feedPage: 1 });
    await new Promise((r) => setTimeout(r, 100));
    set({ isLoadingPosts: false });
  },
  loadMorePosts: async () => {
    if (!get().hasMorePosts) return;
    set((state) => ({ feedPage: state.feedPage + 1 }));
    await new Promise((r) => setTimeout(r, 100));
  },
  selectPost: (id) => set((state) => ({
    currentPost: id ? state.posts.find((p) => p.id === id) || null : null,
  })),
  addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
  updatePost: (id, updates) => set((state) => ({
    posts: state.posts.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    currentPost: state.currentPost?.id === id ? { ...state.currentPost, ...updates } : state.currentPost,
  })),
  removePost: (id) => set((state) => ({
    posts: state.posts.filter((p) => p.id !== id),
    currentPost: state.currentPost?.id === id ? null : state.currentPost,
  })),
  likePost: (postId, userId) => set((state) => ({
    posts: state.posts.map((p) => {
      if (p.id !== postId) return p;
      const likes = p.likes.includes(userId) ? p.likes : [...p.likes, userId];
      return { ...p, likes, likeCount: likes.length };
    }),
  })),
  unlikePost: (postId, userId) => set((state) => ({
    posts: state.posts.map((p) => {
      if (p.id !== postId) return p;
      const likes = p.likes.filter((id) => id !== userId);
      return { ...p, likes, likeCount: likes.length };
    }),
  })),

  addComment: (postId, comment) => set((state) => ({
    posts: state.posts.map((p) => {
      if (p.id !== postId) return p;
      return { ...p, comments: [...p.comments, comment], commentCount: p.commentCount + 1 };
    }),
  })),
  removeComment: (postId, commentId) => set((state) => ({
    posts: state.posts.map((p) => {
      if (p.id !== postId) return p;
      return { ...p, comments: p.comments.filter((c) => c.id !== commentId), commentCount: Math.max(0, p.commentCount - 1) };
    }),
  })),
  likeComment: (postId, commentId, userId) => set((state) => ({
    posts: state.posts.map((p) => {
      if (p.id !== postId) return p;
      return {
        ...p,
        comments: p.comments.map((c) => {
          if (c.id !== commentId) return c;
          const likes = c.likes.includes(userId) ? c.likes : [...c.likes, userId];
          return { ...c, likes, likeCount: likes.length };
        }),
      };
    }),
  })),

  refresh: async () => {
    await Promise.all([get().fetchPersons(), get().fetchCircles(), get().fetchPosts()]);
  },
  clear: () => set({ persons: [], circles: [], posts: [], currentPerson: null, currentCircle: null, currentPost: null }),
}));
