import type { Settings, SettingsUpdateInput } from '../../../domain/models/setting';
import type { SettingsRepository } from '../../../domain/repositories/settings-repository';
import { eventBus, EVENTS } from '../../../shared/kernel/event-bus';
import { logger } from '../../../shared/kernel/logger';

export class SettingsService {
  constructor(private repository: SettingsRepository) {}

  async get(): Promise<Settings> {
    return this.repository.find();
  }

  async update(input: SettingsUpdateInput): Promise<Settings> {
    const settings = await this.repository.update(input);
    eventBus.emit(EVENTS.SETTINGS.UPDATED, settings);
    logger.info('设置已更新', Object.keys(input));
    return settings;
  }

  applyToDOM(settings: Settings): void {
    if (settings.theme) {
      document.documentElement.setAttribute('data-theme', settings.theme);
    }
    if (settings.accentColor) {
      document.documentElement.style.setProperty('--color-primary-500', settings.accentColor);
    }
    if (settings.fontSize) {
      const sizes: Record<string, string> = { small: '13px', medium: '15px', large: '17px' };
      document.documentElement.style.fontSize = sizes[settings.fontSize] || '15px';
    }
  }

  async export(): Promise<string> {
    const settings = await this.repository.find();
    return JSON.stringify(settings, null, 2);
  }

  async import(data: Record<string, unknown>): Promise<Settings> {
    return this.repository.update(data as SettingsUpdateInput);
  }

  async reset(): Promise<Settings> {
    return this.repository.reset();
  }
}
