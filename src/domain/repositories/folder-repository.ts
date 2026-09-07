/**
 * 文件夹Repository接口
 */

import { Folder, CreateFolderInput, UpdateFolderInput, FolderTreeItem } from '../models/folder';

export interface IFolderRepository {
  getById(id: string): Promise<Folder | null>;
  getAll(): Promise<Folder[]>;
  getByParent(parentId: string | null): Promise<Folder[]>;
  getTree(): Promise<FolderTreeItem[]>;
  create(input: CreateFolderInput): Promise<Folder>;
  update(id: string, input: UpdateFolderInput): Promise<Folder>;
  delete(id: string): Promise<void>;
  hardDelete(id: string): Promise<void>;
  move(id: string, newParentId: string | null): Promise<Folder>;
  count(): Promise<number>;
  clear(): Promise<void>;
}
