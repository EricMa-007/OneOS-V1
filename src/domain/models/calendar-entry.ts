/**
 * 日历/日记领域模型
 */

import { BaseEntity } from './base-entity';

export type EntryType = 'note' | 'mood' | 'habit' | 'event' | 'milestone';
export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export interface CalendarEntry extends BaseEntity {
  date: string; // YYYY-MM-DD
  type: EntryType;
  title: string;
  content?: string;
  noteId?: string;
  mood?: MoodLevel;
  tags: string[];
  metadata?: Record<string, unknown>;
}

export interface DayStats {
  date: string;
  entryCount: number;
  wordCount: number;
  mood?: MoodLevel;
  hasNote: boolean;
  hasMilestone: boolean;
  intensity: number; // 0-4，用于日历热力图
}

export interface CreateCalendarEntryInput {
  date: string;
  type?: EntryType;
  title: string;
  content?: string;
  noteId?: string;
  mood?: MoodLevel;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdateCalendarEntryInput {
  title?: string;
  content?: string;
  type?: EntryType;
  mood?: MoodLevel;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export function createCalendarEntry(input: CreateCalendarEntryInput): CalendarEntry {
  const now = new Date().toISOString();
  return {
    id: `ce_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    date: input.date,
    type: input.type || 'note',
    title: input.title,
    content: input.content,
    noteId: input.noteId,
    mood: input.mood,
    tags: input.tags || [],
    metadata: input.metadata,
    createdAt: now,
    updatedAt: now,
    version: 1,
    deviceId: 'web',
    syncState: 'local',
    deleted: false,
  };
}

export function calculateIntensity(entryCount: number, wordCount: number): number {
  if (entryCount === 0 && wordCount === 0) return 0;
  if (wordCount < 100) return 1;
  if (wordCount < 500) return 2;
  if (wordCount < 1500) return 3;
  return 4;
}
