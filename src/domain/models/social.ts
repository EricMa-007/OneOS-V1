/**
 * 社交领域模型（联系人/圈子/动态）
 */

import { BaseEntity } from './base-entity';

export type ContactStatus = 'pending' | 'accepted' | 'blocked';
export type CircleRole = 'owner' | 'admin' | 'member';
export type PostType = 'text' | 'note' | 'image' | 'link' | 'question';

export interface Person extends BaseEntity {
  name: string;
  avatar?: string;
  bio?: string;
  email?: string;
  phone?: string;
  tags: string[];
  notes?: string;
  status: ContactStatus;
  relationship?: string;
  company?: string;
  position?: string;
  location?: string;
  birthday?: string;
  website?: string;
  socialLinks?: Record<string, string>;
  customFields?: Record<string, string>;
  lastContactAt?: string;
  contactCount: number;
}

export interface Circle extends BaseEntity {
  name: string;
  description?: string;
  avatar?: string;
  cover?: string;
  memberIds: string[];
  memberCount: number;
  postCount: number;
  isPrivate: boolean;
  tags: string[];
  rules?: string;
  myRole: CircleRole;
  joinedAt: string;
  lastActivityAt: string;
}

export interface Post extends BaseEntity {
  circleId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  type: PostType;
  title?: string;
  content: string;
  images?: string[];
  linkUrl?: string;
  linkTitle?: string;
  noteId?: string;
  tags: string[];
  likes: string[]; // userIds
  likeCount: number;
  comments: Comment[];
  commentCount: number;
  shares: number;
  views: number;
  isPinned: boolean;
  isEdited: boolean;
}

export interface Comment extends BaseEntity {
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  parentId?: string;
  replies: Comment[];
  likes: string[];
  likeCount: number;
}

export interface CreatePersonInput {
  name: string;
  avatar?: string;
  bio?: string;
  email?: string;
  phone?: string;
  tags?: string[];
  notes?: string;
  relationship?: string;
  company?: string;
  position?: string;
}

export interface CreateCircleInput {
  name: string;
  description?: string;
  isPrivate?: boolean;
  tags?: string[];
}

export interface CreatePostInput {
  circleId: string;
  type?: PostType;
  title?: string;
  content: string;
  images?: string[];
  tags?: string[];
  noteId?: string;
}

export function createPerson(input: CreatePersonInput): Person {
  const now = new Date().toISOString();
  return {
    id: `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    name: input.name,
    avatar: input.avatar,
    bio: input.bio,
    email: input.email,
    phone: input.phone,
    tags: input.tags || [],
    notes: input.notes,
    status: 'accepted',
    relationship: input.relationship,
    company: input.company,
    position: input.position,
    contactCount: 0,
    createdAt: now,
    updatedAt: now,
    version: 1,
    deviceId: 'web',
    syncState: 'local',
    deleted: false,
  };
}

export function createCircle(input: CreateCircleInput): Circle {
  const now = new Date().toISOString();
  return {
    id: `circle_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    name: input.name,
    description: input.description,
    memberIds: [],
    memberCount: 1,
    postCount: 0,
    isPrivate: input.isPrivate || false,
    tags: input.tags || [],
    myRole: 'owner',
    joinedAt: now,
    lastActivityAt: now,
    createdAt: now,
    updatedAt: now,
    version: 1,
    deviceId: 'web',
    syncState: 'local',
    deleted: false,
  };
}
