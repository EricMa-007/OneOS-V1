import type { Persona, PersonaCreateInput } from '../../../domain/models/persona';
import type { PersonaRepository } from '../../../domain/repositories/persona-repository';
import { eventBus, EVENTS } from '../../../shared/kernel/event-bus';
import { logger } from '../../../shared/kernel/logger';

export class PersonaService {
  constructor(private repository: PersonaRepository) {}

  async create(input: PersonaCreateInput): Promise<Persona> {
    const persona = await this.repository.create(input);
    eventBus.emit(EVENTS.AI.PERSONA_CREATED, persona);
    logger.info('人设已创建', { id: persona.id, name: persona.name });
    return persona;
  }

  async list() {
    return this.repository.findAll();
  }

  async getDefault(): Promise<Persona | null> {
    return this.repository.findDefault();
  }

  async setDefault(id: string): Promise<void> {
    await this.repository.setDefault(id);
  }

  async buildSystemPrompt(persona: Persona, context?: string): string {
    let prompt = `你是${persona.name}，${persona.description}。\n\n`;
    if (persona.systemPrompt) prompt += persona.systemPrompt + '\n\n';
    if (context) prompt += `上下文信息：\n${context}\n\n`;
    prompt += '请以专业、友好的方式回答用户的问题。';
    return prompt;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
