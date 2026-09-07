import type { Folder, FolderCreateInput, FolderUpdateInput } from '../../../domain/models/folder';
import type { FolderRepository } from '../../../domain/repositories/folder-repository';
import { eventBus, EVENTS } from '../../../shared/kernel/event-bus';
import { logger } from '../../../shared/kernel/logger';

export class FolderService {
  constructor(private repository: FolderRepository) {}

  async create(input: FolderCreateInput): Promise<Folder> {
    const folder = await this.repository.create(input);
    eventBus.emit(EVENTS.FOLDER.CREATED, folder);
    logger.info('文件夹已创建', { id: folder.id, name: folder.name });
    return folder;
  }

  async update(id: string, input: FolderUpdateInput): Promise<Folder> {
    return this.repository.update(id, input);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
    eventBus.emit(EVENTS.FOLDER.DELETED, { id });
  }

  async getTree() {
    return this.repository.findTree();
  }

  async move(id: string, parentId: string | null): Promise<Folder> {
    return this.repository.update(id, { parentId });
  }
}
