/**
 * 日历Repository IndexedDB实现
 */

import { IndexedDBRepository } from './base-repository';
import { CalendarEntry, CreateCalendarEntryInput, createCalendarEntry, DayStats, calculateIntensity } from '../../domain/models/calendar-entry';
import { ICalendarRepository } from '../../domain/repositories/calendar-repository';

export class IndexedDBCalendarRepository extends IndexedDBRepository<CalendarEntry> implements ICalendarRepository {
  protected storeName = 'calendar_entries';

  protected createEntity(input: CreateCalendarEntryInput): CalendarEntry {
    return createCalendarEntry(input);
  }

  protected onCreateStore(db: IDBDatabase): void {
    if (!db.objectStoreNames.contains(this.storeName)) {
      const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
      store.createIndex('date', 'date', { unique: false });
      store.createIndex('type', 'type', { unique: false });
      store.createIndex('noteId', 'noteId', { unique: false });
      store.createIndex('deleted', 'deleted', { unique: false });
    }
  }

  async getByDate(date: string): Promise<CalendarEntry[]> {
    const all = await this.getAll();
    return all.filter((e) => e.date === date).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async getByDateRange(startDate: string, endDate: string): Promise<CalendarEntry[]> {
    const all = await this.getAll();
    return all.filter((e) => e.date >= startDate && e.date <= endDate);
  }

  async getByMonth(year: number, month: number): Promise<CalendarEntry[]> {
    const start = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endDate = new Date(year, month + 1, 0);
    const end = `${year}-${String(month + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
    return this.getByDateRange(start, end);
  }

  async getDayStats(date: string): Promise<DayStats> {
    const entries = await this.getByDate(date);
    const wordCount = entries.reduce((sum, e) => sum + (e.content?.length || 0), 0);
    const moods = entries.filter((e) => e.mood).map((e) => e.mood!);
    return {
      date,
      entryCount: entries.length,
      wordCount,
      mood: moods.length > 0 ? moods[moods.length - 1] : undefined,
      hasNote: entries.some((e) => e.type === 'note' || e.noteId),
      hasMilestone: entries.some((e) => e.type === 'milestone'),
      intensity: calculateIntensity(entries.length, wordCount),
    };
  }

  async getMonthStats(year: number, month: number): Promise<DayStats[]> {
    const entries = await this.getByMonth(year, month);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const stats: DayStats[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEntries = entries.filter((e) => e.date === date);
      const wordCount = dayEntries.reduce((sum, e) => sum + (e.content?.length || 0), 0);
      stats.push({
        date,
        entryCount: dayEntries.length,
        wordCount,
        hasNote: dayEntries.some((e) => e.type === 'note' || e.noteId),
        hasMilestone: dayEntries.some((e) => e.type === 'milestone'),
        intensity: calculateIntensity(dayEntries.length, wordCount),
      });
    }
    return stats;
  }

  async getStreak(): Promise<number> {
    const all = await this.getAll();
    const dates = new Set(all.map((e) => e.date));
    let streak = 0;
    let current = new Date().toISOString().slice(0, 10);
    while (dates.has(current)) {
      streak++;
      const d = new Date(current);
      d.setDate(d.getDate() - 1);
      current = d.toISOString().slice(0, 10);
    }
    return streak;
  }
}
