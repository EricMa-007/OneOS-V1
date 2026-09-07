/**
 * 笔记Repository接口
 * 定义笔记数据访问的抽象接口
 */

import { Note, CreateNoteInput, UpdateNoteInput, NoteQuery, NoteStats } from '../models/note';

export interface INoteRepository {
  /** 根据ID获取笔记 */
  getById(id: string): Promise<Note | null>;
  /** 根据ID列表批量获取 */
  getByIds(ids: string[]): Promise<Note[]>;
  /** 创建笔记 */
  create(input: CreateNoteInput): Promise<Note>;
  /** 更新笔记 */
  update(id: string, input: UpdateNoteInput): Promise<Note>;
  /** 删除笔记（软删除） */
  delete(id: string): Promise<void>;
  /** 永久删除 */
  hardDelete(id: string): Promise<void>;
  /** 恢复删除 */
  restore(id: string): Promise<Note>;
  /** 查询笔记列表 */
  query(query: NoteQuery): Promise<Note[]>;
  /** 统计 */
  count(query?: NoteQuery): Promise<number>;
  /** 获取统计信息 */
  getStats(): Promise<NoteStats>;
  /** 批量创建 */
  bulkCreate(notes: CreateNoteInput[]): Promise<Note[]>;
  /** 批量更新 */
  bulkUpdate(updates: Array<{ id: string; input: UpdateNoteInput }>): Promise<Note[]>;
  /** 获取所有笔记（用于导出/备份） */
  getAll(includeDeleted?: boolean): Promise<Note[]>;
  /** 清空所有笔记 */
  clear(): Promise<void>;
}
