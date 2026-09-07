/**
 * AI人设Repository接口
 */

import { Persona, CreatePersonaInput, UpdatePersonaInput } from '../models/persona';

export interface IPersonaRepository {
  getById(id: string): Promise<Persona | null>;
  getAll(): Promise<Persona[]>;
  getBuiltin(): Promise<Persona[]>;
  getCustom(): Promise<Persona[]>;
  getDefault(): Promise<Persona | null>;
  getPopular(limit?: number): Promise<Persona[]>;
  create(input: CreatePersonaInput): Promise<Persona>;
  update(id: string, input: UpdatePersonaInput): Promise<Persona>;
  delete(id: string): Promise<void>;
  hardDelete(id: string): Promise<void>;
  setDefault(id: string): Promise<Persona>;
  incrementUsage(id: string): Promise<Persona>;
  count(): Promise<number>;
  clear(): Promise<void>;
}
