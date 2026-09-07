import type { GraphData, GraphNode, GraphEdge } from '../../../domain/models/graph';
import type { GraphRepository } from '../../../domain/repositories/graph-repository';
import { eventBus, EVENTS } from '../../../shared/kernel/event-bus';
import { logger } from '../../../shared/kernel/logger';

export class GraphService {
  constructor(private repository: GraphRepository) {}

  async getData(): Promise<GraphData> {
    return this.repository.find();
  }

  async save(data: GraphData): Promise<void> {
    await this.repository.save(data);
    eventBus.emit(EVENTS.GRAPH.UPDATED, data);
    logger.info('知识图谱已保存', { nodes: data.nodes.length, edges: data.edges.length });
  }

  async rebuildFromNotes(notes: Array<{ id: string; title: string; tagIds: string[] }>): Promise<GraphData> {
    const nodes: GraphNode[] = notes.map((n, i) => ({
      id: n.id,
      label: n.title,
      type: 'note',
      x: Math.cos((i / notes.length) * Math.PI * 2) * 200,
      y: Math.sin((i / notes.length) * Math.PI * 2) * 200,
      size: 15 + (n.tagIds?.length || 0) * 3,
      color: '#8B5CF6',
    }));

    const edges: GraphEdge[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const shared = notes[i].tagIds?.filter((t) => notes[j].tagIds?.includes(t)) || [];
        if (shared.length > 0) {
          edges.push({ id: `e_${i}_${j}`, source: nodes[i].id, target: nodes[j].id, weight: shared.length });
        }
      }
    }

    const data: GraphData = { nodes, edges, updatedAt: new Date().toISOString() };
    await this.save(data);
    return data;
  }

  computeLayout(data: GraphData): GraphData {
    const nodes = data.nodes.map((n) => ({ ...n }));
    for (let iter = 0; iter < 100; iter++) {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = -500 / (dist * dist);
          nodes[i].x += (dx / dist) * force;
          nodes[i].y += (dy / dist) * force;
          nodes[j].x -= (dx / dist) * force;
          nodes[j].y -= (dy / dist) * force;
        }
      }
      for (const edge of data.edges) {
        const s = nodes.find((n) => n.id === edge.source);
        const t = nodes.find((n) => n.id === edge.target);
        if (!s || !t) continue;
        const dx = t.x - s.x;
        const dy = t.y - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (dist - 150) * 0.02;
        s.x += (dx / dist) * force;
        s.y += (dy / dist) * force;
        t.x -= (dx / dist) * force;
        t.y -= (dy / dist) * force;
      }
    }
    return { ...data, nodes };
  }

  exportToJSON(data: GraphData): string {
    return JSON.stringify(data, null, 2);
  }
}
