import type { CalendarEntry, CalendarEntryCreateInput } from '../../../domain/models/calendar-entry';
import type { CalendarRepository } from '../../../domain/repositories/calendar-repository';
import { eventBus, EVENTS } from '../../../shared/kernel/event-bus';
import { logger } from '../../../shared/kernel/logger';

export class CalendarService {
  constructor(private repository: CalendarRepository) {}

  async create(input: CalendarEntryCreateInput): Promise<CalendarEntry> {
    const entry = await this.repository.create(input);
    eventBus.emit(EVENTS.CALENDAR.CREATED, entry);
    logger.info('日历条目已创建', { id: entry.id, date: entry.date });
    return entry;
  }

  async getByDateRange(startDate: string, endDate: string) {
    return this.repository.findByDateRange(startDate, endDate);
  }

  async getByMonth(year: number, month: number) {
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const end = new Date(year, month + 1, 0);
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
    return this.repository.findByDateRange(startDate, endDate);
  }

  async getHeatmapData(year: number) {
    return this.repository.getHeatmapData(year);
  }

  async getMonthlyStats(year: number, month: number) {
    const entries = await this.getByMonth(year, month);
    const activeDays = new Set(entries.map((e) => e.date)).size;
    const totalWords = entries.reduce((sum, e) => sum + (e.wordCount || 0), 0);
    return { totalEntries: entries.length, activeDays, totalWords };
  }

  async getStreak(): Promise<number> {
    const today = new Date();
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().slice(0, 10);
      const entries = await this.repository.findByDateRange(dateStr, dateStr);
      if (entries.length > 0) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
