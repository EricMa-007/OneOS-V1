/**
 * AI人设领域模型
 */

import { BaseEntity } from './base-entity';

export type PersonaType = 'assistant' | 'expert' | 'creative' | 'analyst' | 'companion' | 'custom';
export type PersonaTone = 'professional' | 'friendly' | 'casual' | 'formal' | 'playful' | 'neutral';

export interface Persona extends BaseEntity {
  name: string;
  avatar?: string;
  type: PersonaType;
  description: string;
  systemPrompt: string;
  greeting?: string;
  suggestedQuestions?: string[];
  tone: PersonaTone;
  expertise: string[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  isDefault: boolean;
  isBuiltin: boolean;
  usageCount: number;
  tags: string[];
  color: string;
}

export interface CreatePersonaInput {
  name: string;
  avatar?: string;
  type?: PersonaType;
  description: string;
  systemPrompt: string;
  greeting?: string;
  suggestedQuestions?: string[];
  tone?: PersonaTone;
  expertise?: string[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  tags?: string[];
  color?: string;
}

export interface UpdatePersonaInput extends Partial<CreatePersonaInput> {
  isDefault?: boolean;
}

export const BUILTIN_PERSONAS: Omit<Persona, keyof BaseEntity>[] = [
  {
    name: '通用助手',
    type: 'assistant',
    description: '全能型AI助手，回答各种问题，协助日常工作',
    systemPrompt: '你是OneOS的通用AI助手，友好、专业、高效。帮助用户管理知识、回答问题、完成任务。',
    greeting: '你好！我是你的OneOS助手，有什么可以帮你的？',
    suggestedQuestions: ['帮我总结这篇笔记', '今天有什么待办？', '解释一下这个概念'],
    tone: 'friendly',
    expertise: ['通用问答', '写作辅助', '知识管理', '任务规划'],
    isDefault: true,
    isBuiltin: true,
    usageCount: 0,
    tags: ['通用', '助手'],
    color: '#8B5CF6',
  },
  {
    name: '学术研究员',
    type: 'expert',
    description: '深度学术分析，文献综述，研究方法指导',
    systemPrompt: '你是一位资深学术研究员，擅长文献综述、研究方法、理论分析。回答要严谨、有深度、引用规范。',
    greeting: '你好，我是学术研究员。我们来探讨什么研究问题？',
    suggestedQuestions: ['帮我做文献综述', '这个研究方法合适吗？', '分析这篇论文的贡献'],
    tone: 'professional',
    expertise: ['学术研究', '文献综述', '研究方法', '理论分析'],
    isDefault: false,
    isBuiltin: true,
    usageCount: 0,
    tags: ['学术', '研究'],
    color: '#00CEC9',
  },
  {
    name: '创意写作家',
    type: 'creative',
    description: '激发创意，故事创作，文案撰写，头脑风暴',
    systemPrompt: '你是一位充满创意的写作家，擅长故事创作、文案撰写、头脑风暴。回答要富有想象力、生动有趣。',
    greeting: '嗨！我是创意写作家，今天想创造点什么？',
    suggestedQuestions: ['帮我想一个故事开头', '这个产品文案怎么写？', '来一场头脑风暴'],
    tone: 'playful',
    expertise: ['创意写作', '文案策划', '故事创作', '头脑风暴'],
    isDefault: false,
    isBuiltin: true,
    usageCount: 0,
    tags: ['创意', '写作'],
    color: '#FD79A8',
  },
  {
    name: '数据分析师',
    type: 'analyst',
    description: '数据分析，可视化建议，统计方法，商业洞察',
    systemPrompt: '你是一位资深数据分析师，擅长数据分析、统计方法、可视化、商业洞察。回答要数据驱动、逻辑清晰。',
    greeting: '你好，我是数据分析师。有什么数据需要分析？',
    suggestedQuestions: ['这个数据说明了什么？', '用什么图表展示？', '帮我做趋势分析'],
    tone: 'professional',
    expertise: ['数据分析', '统计方法', '可视化', '商业洞察'],
    isDefault: false,
    isBuiltin: true,
    usageCount: 0,
    tags: ['数据', '分析'],
    color: '#FDCB6E',
  },
  {
    name: '编程伙伴',
    type: 'expert',
    description: '代码审查，算法设计，调试帮助，架构建议',
    systemPrompt: '你是一位资深软件工程师，擅长代码审查、算法设计、调试、架构。回答要注重代码质量、最佳实践。',
    greeting: '你好，我是编程伙伴。遇到什么技术问题？',
    suggestedQuestions: ['帮我审查这段代码', '这个算法怎么优化？', '解释这个设计模式'],
    tone: 'neutral',
    expertise: ['编程', '算法', '架构', '调试'],
    isDefault: false,
    isBuiltin: true,
    usageCount: 0,
    tags: ['编程', '技术'],
    color: '#00B894',
  },
];

export function createPersona(input: CreatePersonaInput): Persona {
  const now = new Date().toISOString();
  const colors = ['#8B5CF6', '#00CEC9', '#FD79A8', '#FDCB6E', '#00B894', '#74B9FF'];
  return {
    id: `persona_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    name: input.name,
    avatar: input.avatar,
    type: input.type || 'custom',
    description: input.description,
    systemPrompt: input.systemPrompt,
    greeting: input.greeting,
    suggestedQuestions: input.suggestedQuestions || [],
    tone: input.tone || 'friendly',
    expertise: input.expertise || [],
    model: input.model,
    temperature: input.temperature,
    maxTokens: input.maxTokens,
    isDefault: false,
    isBuiltin: false,
    usageCount: 0,
    tags: input.tags || [],
    color: input.color || colors[Math.floor(Math.random() * colors.length)],
    createdAt: now,
    updatedAt: now,
    version: 1,
    deviceId: 'web',
    syncState: 'local',
    deleted: false,
  };
}
