/**
 * NoteService - 笔记领域服务
 */

import type { Note, NoteCreateInput, NoteUpdateInput, NoteQuery, NoteStats } from '../../../domain/models/note';
import type { NoteRepository } from '../../../domain/repositories/note-repository';
import { eventBus, EVENTS } from '../../../shared/kernel/event-bus';
import { logger } from '../../../shared/kernel/logger';

export class NoteService {
  constructor(private repository: NoteRepository) {}

  async create(input: NoteCreateInput): Promise<Note> {
    const note = await this.repository.create(input);
    eventBus.emit(EVENTS.NOTE.CREATED, note);
    logger.info('笔记已创建', { id: note.id, title: note.title });
    return note;
  }

  async update(id: string, input: NoteUpdateInput): Promise<Note> {
    const note = await this.repository.update(id, input);
    eventBus.emit(EVENTS.NOTE.UPDATED, note);
    return note;
  }

  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
    eventBus.emit(EVENTS.NOTE.DELETED, { id });
    logger.info('笔记已删除', { id });
  }

  async getById(id: string): Promise<Note | null> {
    return this.repository.findById(id);
  }

  async list(query?: NoteQuery) {
    return this.repository.findAll(query);
  }

  async getStats(): Promise<NoteStats> {
    return this.repository.getStats();
  }

  async duplicate(id: string): Promise<Note> {
    const source = await this.repository.findById(id);
    if (!source) throw new Error('笔记不存在');
    const copy = await this.repository.create({
      title: `${source.title} (副本)`,
      content: source.content,
      folderId: source.folderId,
      tagIds: [...source.tagIds],
    });
    eventBus.emit(EVENTS.NOTE.CREATED, copy);
    return copy;
  }

  async moveToFolder(id: string, folderId: string | null): Promise<Note> {
    return this.repository.update(id, { folderId });
  }

  async toggleFavorite(id: string): Promise<Note> {
    const note = await this.repository.findById(id);
    if (!note) throw new Error('笔记不存在');
    return this.repository.update(id, { favorite: !note.favorite });
  }

  async addTag(id: string, tagId: string): Promise<Note> {
    const note = await this.repository.findById(id);
    if (!note) throw new Error('笔记不存在');
    if (note.tagIds.includes(tagId)) return note;
    return this.repository.update(id, { tagIds: [...note.tagIds, tagId] });
  }

  async removeTag(id: string, tagId: string): Promise<Note> {
    const note = await this.repository.findById(id);
    if (!note) throw new Error('笔记不存在');
    return this.repository.update(id, { tagIds: note.tagIds.filter((t) => t !== tagId) });
  }

  async getBacklinks(noteId: string): Promise<Note[]> {
    const all = await this.repository.findAll();
    return all.items.filter((n) => n.content.includes(`[[${noteId}]]`) || n.content.includes(`(${noteId})`));
  }
}
