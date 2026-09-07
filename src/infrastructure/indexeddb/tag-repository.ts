/**
 * 标签Repository IndexedDB实现
 */

import { IndexedDBRepository } from './base-repository';
import { Tag, CreateTagInput, createTag } from '../../domain/models/tag';
import { ITagRepository } from '../../domain/repositories/tag-repository';

export class IndexedDBTagRepository extends IndexedDBRepository<Tag> implements ITagRepository {
  protected storeName = 'tags';

  protected createEntity(input: CreateTagInput): Tag {
    return createTag(input);
  }

  protected onCreateStore(db: IDBDatabase): void {
    if (!db.objectStoreNames.contains(this.storeName)) {
      const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
      store.createIndex('name', 'name', { unique: true });
      store.createIndex('usageCount', 'usageCount', { unique: false });
      store.createIndex('deleted', 'deleted', { unique: false });
    }
  }

  async getByName(name: string): Promise<Tag | null> {
    const all = await this.getAll();
    return all.find((t) => t.name.toLowerCase() === name.toLowerCase()) || null;
  }

  async getPopular(limit = 10): Promise<Tag[]> {
    const all = await this.getAll();
    return all.sort((a, b) => b.usageCount - a.usageCount).slice(0, limit);
  }

  async incrementUsage(id: string): Promise<Tag> {
    const tag = await this.getById(id);
    if (!tag) throw new Error(`标签不存在: ${id}`);
    return this.update(id, { usageCount: tag.usageCount + 1 });
  }

  async decrementUsage(id: string): Promise<Tag> {
    const tag = await this.getById(id);
    if (!tag) throw new Error(`标签不存在: ${id}`);
    return this.update(id, { usageCount: Math.max(0, tag.usageCount - 1) });
  }
}
