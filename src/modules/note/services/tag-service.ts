import type { Tag, TagCreateInput } from '../../../domain/models/tag';
import type { TagRepository } from '../../../domain/repositories/tag-repository';
import { eventBus, EVENTS } from '../../../shared/kernel/event-bus';
import { logger } from '../../../shared/kernel/logger';

export class TagService {
  constructor(private repository: TagRepository) {}

  async create(input: TagCreateInput): Promise<Tag> {
    const existing = await this.repository.findByName(input.name);
    if (existing) return existing;
    const tag = await this.repository.create(input);
    eventBus.emit(EVENTS.TAG.CREATED, tag);
    logger.info('标签已创建', { id: tag.id, name: tag.name });
    return tag;
  }

  async getOrCreate(name: string): Promise<Tag> {
    const existing = await this.repository.findByName(name);
    if (existing) return existing;
    return this.repository.create({ name, color: '#8B5CF6' });
  }

  async getOrCreateMany(names: string[]): Promise<Tag[]> {
    return Promise.all(names.map((name) => this.getOrCreate(name)));
  }

  async list() {
    return this.repository.findAll();
  }

  async getPopular(limit = 20) {
    return this.repository.findPopular(limit);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
