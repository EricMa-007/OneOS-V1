/**
 * IndexedDB 笔记Repository实现
 */

import { Note, CreateNoteInput, UpdateNoteInput, NoteQuery, NoteStats, createNote, calculateNoteMeta } from '../../domain/models/note';
import { INoteRepository } from '../../domain/repositories/note-repository';
import { touchEntity, softDeleteEntity } from '../../domain/models/base-entity';

const DB_NAME = 'OneOS';
const DB_VERSION = 2;
const STORE_NAME = 'notes';

export class IndexedDBNoteRepository implements INoteRepository {
  private db: IDBDatabase | null = null;

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('folderId', 'folderId', { unique: false });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('deleted', 'deleted', { unique: false });
          store.createIndex('favorite', 'favorite', { unique: false });
        }
      };
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  private async transaction<T>(
    mode: IDBTransactionMode,
    callback: (store: IDBObjectStore) => IDBRequest<T> | Promise<T>
  ): Promise<T> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, mode);
      const store = tx.objectStore(STORE_NAME);
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

  async getById(id: string): Promise<Note | null> {
    return this.transaction('readonly', (store) => store.get(id)) as Promise<Note | null>;
  }

  async getByIds(ids: string[]): Promise<Note[]> {
    const notes = await this.getAll();
    return notes.filter((n) => ids.includes(n.id));
  }

  async create(input: CreateNoteInput): Promise<Note> {
    const note = createNote(input);
    await this.transaction('readwrite', (store) => store.add(note));
    return note;
  }

  async update(id: string, input: UpdateNoteInput): Promise<Note> {
    const existing = await this.getById(id);
    if (!existing) throw new Error(`笔记不存在: ${id}`);
    const updated: Note = {
      ...existing,
      ...input,
      ...(input.content !== undefined ? { meta: calculateNoteMeta(input.content) } : {}),
      ...touchEntity(existing),
    };
    await this.transaction('readwrite', (store) => store.put(updated));
    return updated;
  }

  async delete(id: string): Promise<void> {
    const existing = await this.getById(id);
    if (!existing) return;
    const deleted = softDeleteEntity(existing);
    await this.transaction('readwrite', (store) => store.put(deleted));
  }

  async hardDelete(id: string): Promise<void> {
    await this.transaction('readwrite', (store) => store.delete(id));
  }

  async restore(id: string): Promise<Note> {
    const existing = await this.getById(id);
    if (!existing) throw new Error(`笔记不存在: ${id}`);
    const restored: Note = {
      ...existing,
      deleted: false,
      deletedAt: undefined,
      ...touchEntity(existing),
    };
    await this.transaction('readwrite', (store) => store.put(restored));
    return restored;
  }

  async query(query: NoteQuery): Promise<Note[]> {
    let notes = await this.getAll();
    if (query.folderId !== undefined) {
      notes = notes.filter((n) => n.folderId === query.folderId);
    }
    if (query.tagId) {
      notes = notes.filter((n) => n.tagIds.includes(query.tagId!));
    }
    if (query.status) {
      notes = notes.filter((n) => n.status === query.status);
    }
    if (query.favorite !== undefined) {
      notes = notes.filter((n) => n.favorite === query.favorite);
    }
    if (query.type) {
      notes = notes.filter((n) => n.type === query.type);
    }
    if (query.deleted !== undefined) {
      notes = notes.filter((n) => n.deleted === query.deleted);
    } else {
      notes = notes.filter((n) => !n.deleted);
    }
    if (query.keyword) {
      const kw = query.keyword.toLowerCase();
      notes = notes.filter(
        (n) => n.title.toLowerCase().includes(kw) || n.content.toLowerCase().includes(kw)
      );
    }
    const sortBy = query.sortBy || 'updatedAt';
    const sortOrder = query.sortOrder || 'desc';
    notes.sort((a, b) => {
      const av = a[sortBy] as string | number;
      const bv = b[sortBy] as string | number;
      if (av < bv) return sortOrder === 'asc' ? -1 : 1;
      if (av > bv) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    if (query.offset) notes = notes.slice(query.offset);
    if (query.limit) notes = notes.slice(0, query.limit);
    return notes;
  }

  async count(query?: NoteQuery): Promise<number> {
    const notes = query ? await this.query(query) : await this.getAll();
    return notes.length;
  }

  async getStats(): Promise<NoteStats> {
    const notes = await this.getAll();
    const today = new Date().toISOString().slice(0, 10);
    const stats: NoteStats = {
      total: notes.length,
      totalWords: notes.reduce((sum, n) => sum + n.meta.wordCount, 0),
      todayCreated: notes.filter((n) => n.createdAt.slice(0, 10) === today).length,
      todayUpdated: notes.filter((n) => n.updatedAt.slice(0, 10) === today).length,
      favorites: notes.filter((n) => n.favorite).length,
      archived: notes.filter((n) => n.status === 'archived').length,
      byType: { markdown: 0, text: 0, code: 0, canvas: 0 },
      byFolder: {},
      byTag: {},
    };
    for (const note of notes) {
      stats.byType[note.type]++;
      if (note.folderId) {
        stats.byFolder[note.folderId] = (stats.byFolder[note.folderId] || 0) + 1;
      }
      for (const tagId of note.tagIds) {
        stats.byTag[tagId] = (stats.byTag[tagId] || 0) + 1;
      }
    }
    return stats;
  }

  async bulkCreate(notes: CreateNoteInput[]): Promise<Note[]> {
    const created: Note[] = [];
    for (const input of notes) {
      created.push(await this.create(input));
    }
    return created;
  }

  async bulkUpdate(updates: Array<{ id: string; input: UpdateNoteInput }>): Promise<Note[]> {
    const updated: Note[] = [];
    for (const { id, input } of updates) {
      updated.push(await this.update(id, input));
    }
    return updated;
  }

  async getAll(includeDeleted = false): Promise<Note[]> {
    const all = await this.transaction<Note[]>('readonly', (store) => store.getAll());
    return includeDeleted ? all : all.filter((n) => !n.deleted);
  }

  async clear(): Promise<void> {
    await this.transaction('readwrite', (store) => store.clear());
  }

  close(): void {
    this.db?.close();
    this.db = null;
  }
}
