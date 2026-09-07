/**
 * AI人设Repository IndexedDB实现
 */

import { IndexedDBRepository } from './base-repository';
import { Persona, CreatePersonaInput, createPersona, BUILTIN_PERSONAS } from '../../domain/models/persona';
import { IPersonaRepository } from '../../domain/repositories/persona-repository';

export class IndexedDBPersonaRepository extends IndexedDBRepository<Persona> implements IPersonaRepository {
  protected storeName = 'personas';

  protected createEntity(input: CreatePersonaInput): Persona {
    return createPersona(input);
  }

  protected onCreateStore(db: IDBDatabase): void {
    if (!db.objectStoreNames.contains(this.storeName)) {
      const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
      store.createIndex('name', 'name', { unique: false });
      store.createIndex('type', 'type', { unique: false });
      store.createIndex('isDefault', 'isDefault', { unique: false });
      store.createIndex('isBuiltin', 'isBuiltin', { unique: false });
      store.createIndex('usageCount', 'usageCount', { unique: false });
      store.createIndex('deleted', 'deleted', { unique: false });
    }
  }

  /**
   * 初始化内置人设（首次使用时调用）
   */
  async ensureBuiltinPersonas(): Promise<void> {
    const existing = await this.getAll();
    if (existing.length > 0) return;

    const now = new Date().toISOString();
    for (const builtin of BUILTIN_PERSONAS) {
      const persona: Persona = {
        ...builtin,
        id: `persona_builtin_${builtin.name}`,
        createdAt: now,
        updatedAt: now,
        version: 1,
        deviceId: 'web',
        syncState: 'local',
        deleted: false,
      };
      await this.transaction('readwrite', (store) => store.add(persona));
    }
  }

  async getBuiltin(): Promise<Persona[]> {
    const all = await this.getAll();
    return all.filter((p) => p.isBuiltin);
  }

  async getCustom(): Promise<Persona[]> {
    const all = await this.getAll();
    return all.filter((p) => !p.isBuiltin);
  }

  async getDefault(): Promise<Persona | null> {
    const all = await this.getAll();
    return all.find((p) => p.isDefault) || all[0] || null;
  }

  async getPopular(limit = 10): Promise<Persona[]> {
    const all = await this.getAll();
    return all.sort((a, b) => b.usageCount - a.usageCount).slice(0, limit);
  }

  async setDefault(id: string): Promise<Persona> {
    const all = await this.getAll();
    // 取消其他人设的默认状态
    for (const persona of all) {
      if (persona.id !== id && persona.isDefault) {
        await this.update(persona.id, { isDefault: false });
      }
    }
    return this.update(id, { isDefault: true });
  }

  async incrementUsage(id: string): Promise<Persona> {
    const persona = await this.getById(id);
    if (!persona) throw new Error(`人设不存在: ${id}`);
    return this.update(id, { usageCount: persona.usageCount + 1 });
  }
}
