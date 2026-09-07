/**
 * 日历Repository接口
 */

import { CalendarEntry, CreateCalendarEntryInput, UpdateCalendarEntryInput, DayStats } from '../models/calendar-entry';

export interface ICalendarRepository {
  getById(id: string): Promise<CalendarEntry | null>;
  getByDate(date: string): Promise<CalendarEntry[]>;
  getByDateRange(startDate: string, endDate: string): Promise<CalendarEntry[]>;
  getByMonth(year: number, month: number): Promise<CalendarEntry[]>;
  getAll(): Promise<CalendarEntry[]>;
  create(input: CreateCalendarEntryInput): Promise<CalendarEntry>;
  update(id: string, input: UpdateCalendarEntryInput): Promise<CalendarEntry>;
  delete(id: string): Promise<void>;
  hardDelete(id: string): Promise<void>;
  getDayStats(date: string): Promise<DayStats>;
  getMonthStats(year: number, month: number): Promise<DayStats[]>;
  getStreak(): Promise<number>;
  count(): Promise<number>;
  clear(): Promise<void>;
}
