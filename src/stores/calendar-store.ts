/**
 * 日历Store（Zustand）
 */

import { create } from 'zustand';
import { CalendarEntry, DayStats } from '../domain/models/calendar-entry';

export type CalendarView = 'month' | 'week' | 'day' | 'agenda';

interface CalendarState {
  // 数据
  entries: CalendarEntry[];
  dayStats: Record<string, DayStats>;
  isLoading: boolean;
  error: string | null;

  // 视图
  view: CalendarView;
  currentDate: string; // YYYY-MM-DD
  selectedDate: string | null;
  showWeekends: boolean;
  weekStart: 0 | 1; // 0=周日, 1=周一

  // 操作
  setView: (view: CalendarView) => void;
  setCurrentDate: (date: string) => void;
  setSelectedDate: (date: string | null) => void;
  nextMonth: () => void;
  prevMonth: () => void;
  nextWeek: () => void;
  prevWeek: () => void;
  goToToday: () => void;
  toggleWeekends: () => void;
  setWeekStart: (start: 0 | 1) => void;

  // 数据操作
  fetchEntries: (startDate: string, endDate: string) => Promise<void>;
  fetchDayStats: (year: number, month: number) => Promise<void>;
  addEntry: (entry: CalendarEntry) => void;
  updateEntry: (id: string, updates: Partial<CalendarEntry>) => void;
  removeEntry: (id: string) => void;
  getEntriesByDate: (date: string) => CalendarEntry[];
  getStreak: () => number;

  refresh: () => Promise<void>;
  clear: () => void;
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  entries: [],
  dayStats: {},
  isLoading: false,
  error: null,

  view: 'month',
  currentDate: getToday(),
  selectedDate: null,
  showWeekends: true,
  weekStart: 1,

  setView: (view) => set({ view }),
  setCurrentDate: (date) => set({ currentDate: date }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  nextMonth: () => set((state) => ({ currentDate: addMonths(state.currentDate, 1) })),
  prevMonth: () => set((state) => ({ currentDate: addMonths(state.currentDate, -1) })),
  nextWeek: () => set((state) => ({ currentDate: addDays(state.currentDate, 7) })),
  prevWeek: () => set((state) => ({ currentDate: addDays(state.currentDate, -7) })),
  goToToday: () => set({ currentDate: getToday(), selectedDate: getToday() }),
  toggleWeekends: () => set((state) => ({ showWeekends: !state.showWeekends })),
  setWeekStart: (start) => set({ weekStart: start }),

  fetchEntries: async (startDate, endDate) => {
    set({ isLoading: true });
    // 实际从CalendarService加载
    await new Promise((r) => setTimeout(r, 100));
    set({ isLoading: false });
  },
  fetchDayStats: async (year, month) => {
    set({ isLoading: true });
    await new Promise((r) => setTimeout(r, 100));
    set({ isLoading: false });
  },
  addEntry: (entry) => set((state) => ({ entries: [...state.entries, entry] })),
  updateEntry: (id, updates) => set((state) => ({
    entries: state.entries.map((e) => (e.id === id ? { ...e, ...updates } : e)),
  })),
  removeEntry: (id) => set((state) => ({ entries: state.entries.filter((e) => e.id !== id) })),
  getEntriesByDate: (date) => get().entries.filter((e) => e.date === date),
  getStreak: () => {
    // 计算连续记录天数
    const dates = new Set(get().entries.map((e) => e.date));
    let streak = 0;
    let current = getToday();
    while (dates.has(current)) {
      streak++;
      current = addDays(current, -1);
    }
    return streak;
  },

  refresh: async () => {
    const state = get();
    await state.fetchEntries(state.currentDate, state.currentDate);
  },
  clear: () => set({ entries: [], dayStats: {} }),
}));
