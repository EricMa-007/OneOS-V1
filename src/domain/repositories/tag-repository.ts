/**
 * 标签Repository接口
 */

import { Tag, CreateTagInput, UpdateTagInput } from '../models/tag';

export interface ITagRepository {
  getById(id: string): Promise<Tag | null>;
  getByName(name: string): Promise<Tag | null>;
  getAll(): Promise<Tag[]>;
  getPopular(limit?: number): Promise<Tag[]>;
  create(input: CreateTagInput): Promise<Tag>;
  update(id: string, input: UpdateTagInput): Promise<Tag>;
  delete(id: string): Promise<void>;
  hardDelete(id: string): Promise<void>;
  incrementUsage(id: string): Promise<Tag>;
  decrementUsage(id: string): Promise<Tag>;
  count(): Promise<number>;
  clear(): Promise<void>;
}
