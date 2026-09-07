/**
 * 社交Repository IndexedDB实现
 */

import { IndexedDBRepository } from './base-repository';
import { Person, Circle, Post, Comment, CreatePersonInput, CreateCircleInput, CreatePostInput, createPerson, createCircle } from '../../domain/models/social';
import { ISocialRepository } from '../../domain/repositories/social-repository';

export class IndexedDBSocialRepository extends IndexedDBRepository<Person> implements ISocialRepository {
  protected storeName = 'persons';
  private circleStore = 'circles';
  private postStore = 'posts';

  protected createEntity(input: CreatePersonInput): Person {
    return createPerson(input);
  }

  protected onCreateStore(db: IDBDatabase): void {
    if (!db.objectStoreNames.contains(this.storeName)) {
      const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
      store.createIndex('name', 'name', { unique: false });
      store.createIndex('status', 'status', { unique: false });
      store.createIndex('deleted', 'deleted', { unique: false });
    }
    if (!db.objectStoreNames.contains(this.circleStore)) {
      const store = db.createObjectStore(this.circleStore, { keyPath: 'id' });
      store.createIndex('name', 'name', { unique: false });
      store.createIndex('isPrivate', 'isPrivate', { unique: false });
    }
    if (!db.objectStoreNames.contains(this.postStore)) {
      const store = db.createObjectStore(this.postStore, { keyPath: 'id' });
      store.createIndex('circleId', 'circleId', { unique: false });
      store.createIndex('authorId', 'authorId', { unique: false });
      store.createIndex('createdAt', 'createdAt', { unique: false });
    }
  }

  // 联系人
  async getAllPersons(): Promise<Person[]> {
    return this.getAll();
  }

  async getPersonsByTag(tagId: string): Promise<Person[]> {
    const all = await this.getAll();
    return all.filter((p) => p.tags.includes(tagId));
  }

  async searchPersons(keyword: string): Promise<Person[]> {
    const all = await this.getAll();
    const kw = keyword.toLowerCase();
    return all.filter(
      (p) => p.name.toLowerCase().includes(kw) || p.bio?.toLowerCase().includes(kw) || p.company?.toLowerCase().includes(kw)
    );
  }

  async createPerson(input: CreatePersonInput): Promise<Person> {
    return this.create(input);
  }

  async updatePerson(id: string, updates: Partial<Person>): Promise<Person> {
    return this.update(id, updates);
  }

  async deletePerson(id: string): Promise<void> {
    return this.delete(id);
  }

  // 圈子
  async getAllCircles(): Promise<Circle[]> {
    const db = await this.getDB();
    return this.transactionStore<Circle[]>(this.circleStore, 'readonly', (store) => store.getAll());
  }

  async getMyCircles(): Promise<Circle[]> {
    const all = await this.getAllCircles();
    return all.filter((c) => c.memberIds.length > 0);
  }

  async getCircleById(id: string): Promise<Circle | null> {
    return this.transactionStore<Circle>(this.circleStore, 'readonly', (store) => store.get(id)) as Promise<Circle | null>;
  }

  async createCircle(input: CreateCircleInput): Promise<Circle> {
    const circle = createCircle(input);
    await this.transactionStore(this.circleStore, 'readwrite', (store) => store.add(circle));
    return circle;
  }

  async updateCircle(id: string, updates: Partial<Circle>): Promise<Circle> {
    const existing = await this.getCircleById(id);
    if (!existing) throw new Error(`圈子不存在: ${id}`);
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString(), version: existing.version + 1 };
    await this.transactionStore(this.circleStore, 'readwrite', (store) => store.put(updated));
    return updated;
  }

  async deleteCircle(id: string): Promise<void> {
    await this.transactionStore(this.circleStore, 'readwrite', (store) => store.delete(id));
  }

  async joinCircle(circleId: string): Promise<Circle> {
    const circle = await this.getCircleById(circleId);
    if (!circle) throw new Error(`圈子不存在: ${circleId}`);
    const userId = 'me';
    if (!circle.memberIds.includes(userId)) {
      circle.memberIds.push(userId);
      circle.memberCount++;
    }
    return this.updateCircle(circleId, { memberIds: circle.memberIds, memberCount: circle.memberCount });
  }

  async leaveCircle(circleId: string): Promise<void> {
    const circle = await this.getCircleById(circleId);
    if (!circle) return;
    const userId = 'me';
    circle.memberIds = circle.memberIds.filter((id) => id !== userId);
    circle.memberCount = Math.max(0, circle.memberCount - 1);
    await this.updateCircle(circleId, { memberIds: circle.memberIds, memberCount: circle.memberCount });
  }

  // 动态
  async getPostsByCircle(circleId: string, limit = 20, offset = 0): Promise<Post[]> {
    const all = await this.transactionStore<Post[]>(this.postStore, 'readonly', (store) => store.getAll());
    return all
      .filter((p) => p.circleId === circleId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(offset, offset + limit);
  }

  async getAllPosts(limit = 20, offset = 0): Promise<Post[]> {
    const all = await this.transactionStore<Post[]>(this.postStore, 'readonly', (store) => store.getAll());
    return all
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(offset, offset + limit);
  }

  async getPostById(id: string): Promise<Post | null> {
    return this.transactionStore<Post>(this.postStore, 'readonly', (store) => store.get(id)) as Promise<Post | null>;
  }

  async createPost(input: CreatePostInput): Promise<Post> {
    const now = new Date().toISOString();
    const post: Post = {
      id: `post_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      circleId: input.circleId,
      authorId: 'me',
      authorName: '我',
      type: input.type || 'text',
      title: input.title,
      content: input.content,
      images: input.images,
      tags: input.tags || [],
      noteId: input.noteId,
      likes: [],
      likeCount: 0,
      comments: [],
      commentCount: 0,
      shares: 0,
      views: 0,
      isPinned: false,
      isEdited: false,
      createdAt: now,
      updatedAt: now,
      version: 1,
      deviceId: 'web',
      syncState: 'local',
      deleted: false,
    };
    await this.transactionStore(this.postStore, 'readwrite', (store) => store.add(post));
    return post;
  }

  async updatePost(id: string, updates: Partial<Post>): Promise<Post> {
    const existing = await this.getPostById(id);
    if (!existing) throw new Error(`动态不存在: ${id}`);
    const updated = { ...existing, ...updates, isEdited: true, updatedAt: new Date().toISOString(), version: existing.version + 1 };
    await this.transactionStore(this.postStore, 'readwrite', (store) => store.put(updated));
    return updated;
  }

  async deletePost(id: string): Promise<void> {
    await this.transactionStore(this.postStore, 'readwrite', (store) => store.delete(id));
  }

  async likePost(postId: string, userId: string): Promise<Post> {
    const post = await this.getPostById(postId);
    if (!post) throw new Error(`动态不存在: ${postId}`);
    if (!post.likes.includes(userId)) {
      post.likes.push(userId);
      post.likeCount++;
    }
    return this.updatePost(postId, { likes: post.likes, likeCount: post.likeCount });
  }

  async unlikePost(postId: string, userId: string): Promise<Post> {
    const post = await this.getPostById(postId);
    if (!post) throw new Error(`动态不存在: ${postId}`);
    post.likes = post.likes.filter((id) => id !== userId);
    post.likeCount = Math.max(0, post.likeCount - 1);
    return this.updatePost(postId, { likes: post.likes, likeCount: post.likeCount });
  }

  // 评论
  async addComment(postId: string, content: string, authorId: string, authorName: string): Promise<Comment> {
    const post = await this.getPostById(postId);
    if (!post) throw new Error(`动态不存在: ${postId}`);
    const now = new Date().toISOString();
    const comment: Comment = {
      id: `comment_${Date.now().toString(36)}`,
      postId,
      authorId,
      authorName,
      content,
      replies: [],
      likes: [],
      likeCount: 0,
      createdAt: now,
      updatedAt: now,
      version: 1,
      deviceId: 'web',
      syncState: 'local',
      deleted: false,
    };
    post.comments.push(comment);
    post.commentCount++;
    await this.updatePost(postId, { comments: post.comments, commentCount: post.commentCount });
    return comment;
  }

  async deleteComment(postId: string, commentId: string): Promise<void> {
    const post = await this.getPostById(postId);
    if (!post) return;
    post.comments = post.comments.filter((c) => c.id !== commentId);
    post.commentCount = Math.max(0, post.commentCount - 1);
    await this.updatePost(postId, { comments: post.comments, commentCount: post.commentCount });
  }

  async likeComment(postId: string, commentId: string, userId: string): Promise<Comment> {
    const post = await this.getPostById(postId);
    if (!post) throw new Error(`动态不存在: ${postId}`);
    const comment = post.comments.find((c) => c.id === commentId);
    if (!comment) throw new Error(`评论不存在: ${commentId}`);
    if (!comment.likes.includes(userId)) {
      comment.likes.push(userId);
      comment.likeCount++;
    }
    await this.updatePost(postId, { comments: post.comments });
    return comment;
  }

  // 辅助方法
  private async transactionStore<R>(storeName: string, mode: IDBTransactionMode, callback: (store: IDBObjectStore) => IDBRequest<R> | Promise<R>): Promise<R> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);
      const result = callback(store);
      if (result instanceof IDBRequest) {
        result.onsuccess = () => resolve(result.result);
        result.onerror = () => reject(result.error);
      } else {
        result.then(resolve).catch(reject);
      }
      tx.onerror = () => reject(tx.error);
    });
  }
}
