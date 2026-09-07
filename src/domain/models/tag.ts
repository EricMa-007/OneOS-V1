/**
 * 标签领域模型
 */

import { BaseEntity } from './base-entity';

export interface Tag extends BaseEntity {
  name: string;
  color: string;
  icon?: string;
  description?: string;
  noteCount?: number;
  usageCount: number;
}

export interface CreateTagInput {
  name: string;
  color?: string;
  icon?: string;
  description?: string;
}

export interface UpdateTagInput {
  name?: string;
  color?: string;
  icon?: string;
  description?: string;
}

export const TAG_COLORS = [
  '#8B5CF6', '#00CEC9', '#FD79A8', '#FDCB6E', '#00B894',
  '#FF6B6B', '#74B9FF', '#A29BFE', '#55EFC4', '#FFEAA7',
];

export function createTag(input: CreateTagInput): Tag {
  const now = new Date().toISOString();
  return {
    id: `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    name: input.name,
    color: input.color || TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)],
    icon: input.icon,
    description: input.description,
    usageCount: 0,
    createdAt: now,
    updatedAt: now,
    version: 1,
    deviceId: 'web',
    syncState: 'local',
    deleted: false,
  };
}
