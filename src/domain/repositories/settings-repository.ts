/**
 * 设置Repository接口
 */

import { AppSettings } from '../models/setting';

export interface ISettingsRepository {
  get(): Promise<AppSettings>;
  update(updates: Partial<AppSettings>): Promise<AppSettings>;
  reset(): Promise<AppSettings>;
  getVersion(): Promise<string>;
  exportSettings(): Promise<string>;
  importSettings(json: string): Promise<AppSettings>;
}
