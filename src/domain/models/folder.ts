/**
 * 文件夹领域模型
 */

import { BaseEntity } from './base-entity';

export interface Folder extends BaseEntity {
  name: string;
  parentId: string | null;
  icon?: string;
  color?: string;
  order: number;
  isExpanded: boolean;
  noteCount?: number;
}

export interface CreateFolderInput {
  name: string;
  parentId?: string | null;
  icon?: string;
  color?: string;
  order?: number;
}

export interface UpdateFolderInput {
  name?: string;
  parentId?: string | null;
  icon?: string;
  color?: string;
  order?: number;
  isExpanded?: boolean;
}

export interface FolderTreeItem extends Folder {
  children: FolderTreeItem[];
}

export function createFolder(input: CreateFolderInput): Folder {
  const now = new Date().toISOString();
  return {
    id: `f_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    name: input.name,
    parentId: input.parentId ?? null,
    icon: input.icon,
    color: input.color,
    order: input.order ?? Date.now(),
    isExpanded: true,
    createdAt: now,
    updatedAt: now,
    version: 1,
    deviceId: 'web',
    syncState: 'local',
    deleted: false,
  };
}
