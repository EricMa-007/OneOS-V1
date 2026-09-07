/**
 * 文件夹Repository IndexedDB实现
 */

import { IndexedDBRepository } from './base-repository';
import { Folder, CreateFolderInput, createFolder, FolderTreeItem } from '../../domain/models/folder';
import { IFolderRepository } from '../../domain/repositories/folder-repository';

export class IndexedDBFolderRepository extends IndexedDBRepository<Folder> implements IFolderRepository {
  protected storeName = 'folders';

  protected createEntity(input: CreateFolderInput): Folder {
    return createFolder(input);
  }

  protected onCreateStore(db: IDBDatabase): void {
    if (!db.objectStoreNames.contains(this.storeName)) {
      const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
      store.createIndex('parentId', 'parentId', { unique: false });
      store.createIndex('name', 'name', { unique: false });
      store.createIndex('deleted', 'deleted', { unique: false });
    }
  }

  async getByParent(parentId: string | null): Promise<Folder[]> {
    const all = await this.getAll();
    return all.filter((f) => f.parentId === parentId).sort((a, b) => a.order - b.order);
  }

  async getTree(): Promise<FolderTreeItem[]> {
    const all = await this.getAll();
    const map = new Map<string, FolderTreeItem>();
    const roots: FolderTreeItem[] = [];

    for (const folder of all) {
      map.set(folder.id, { ...folder, children: [] });
    }

    for (const item of map.values()) {
      if (item.parentId && map.has(item.parentId)) {
        map.get(item.parentId)!.children.push(item);
      } else {
        roots.push(item);
      }
    }

    const sortTree = (items: FolderTreeItem[]): FolderTreeItem[] => {
      items.sort((a, b) => a.order - b.order);
      for (const item of items) {
        if (item.children.length > 0) {
          sortTree(item.children);
        }
      }
      return items;
    };

    return sortTree(roots);
  }

  async move(id: string, newParentId: string | null): Promise<Folder> {
    return this.update(id, { parentId: newParentId });
  }
}
