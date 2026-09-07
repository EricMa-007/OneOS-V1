/**
 * 知识图谱Store（Zustand）
 */

import { create } from 'zustand';
import { GraphNode, GraphEdge, GraphData, GraphViewState, DEFAULT_GRAPH_VIEW } from '../domain/models/graph';

interface GraphState {
  // 数据
  nodes: GraphNode[];
  edges: GraphEdge[];
  isLoading: boolean;
  error: string | null;

  // 视图状态
  view: GraphViewState;

  // 布局
  isLayoutRunning: boolean;
  layoutIterations: number;

  // 操作
  setGraphData: (data: GraphData) => void;
  addNode: (node: GraphNode) => void;
  updateNode: (id: string, updates: Partial<GraphNode>) => void;
  removeNode: (id: string) => void;
  addEdge: (edge: GraphEdge) => void;
  updateEdge: (id: string, updates: Partial<GraphEdge>) => void;
  removeEdge: (id: string) => void;

  // 视图操作
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  setPan: (x: number, y: number) => void;
  selectNode: (id: string | null) => void;
  hoverNode: (id: string | null) => void;
  toggleLabels: () => void;
  setColorBy: (colorBy: GraphViewState['colorBy']) => void;
  toggleFilterType: (type: GraphViewState['filterTypes'][number]) => void;

  // 布局操作
  startLayout: () => void;
  stopLayout: () => void;
  stepLayout: () => void;
  resetLayout: () => void;

  // 数据操作
  refresh: () => Promise<void>;
  rebuild: () => Promise<void>;
  exportGraph: () => string;
  importGraph: (json: string) => void;
  clear: () => void;
}

export const useGraphStore = create<GraphState>((set, get) => ({
  nodes: [],
  edges: [],
  isLoading: false,
  error: null,
  view: { ...DEFAULT_GRAPH_VIEW },
  isLayoutRunning: false,
  layoutIterations: 0,

  setGraphData: (data) => set({ nodes: data.nodes, edges: data.edges }),
  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
  updateNode: (id, updates) => set((state) => ({
    nodes: state.nodes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
  })),
  removeNode: (id) => set((state) => ({
    nodes: state.nodes.filter((n) => n.id !== id),
    edges: state.edges.filter((e) => e.source !== id && e.target !== id),
  })),
  addEdge: (edge) => set((state) => ({ edges: [...state.edges, edge] })),
  updateEdge: (id, updates) => set((state) => ({
    edges: state.edges.map((e) => (e.id === id ? { ...e, ...updates } : e)),
  })),
  removeEdge: (id) => set((state) => ({ edges: state.edges.filter((e) => e.id !== id) })),

  setZoom: (zoom) => set((state) => ({ view: { ...state.view, zoom: Math.max(0.1, Math.min(5, zoom)) } })),
  zoomIn: () => get().setZoom(get().view.zoom * 1.2),
  zoomOut: () => get().setZoom(get().view.zoom / 1.2),
  resetZoom: () => set((state) => ({ view: { ...state.view, zoom: 1, panX: 0, panY: 0 } })),
  setPan: (x, y) => set((state) => ({ view: { ...state.view, panX: x, panY: y } })),
  selectNode: (id) => set((state) => ({ view: { ...state.view, selectedNodeId: id } })),
  hoverNode: (id) => set((state) => ({ view: { ...state.view, hoveredNodeId: id } })),
  toggleLabels: () => set((state) => ({ view: { ...state.view, showLabels: !state.view.showLabels } })),
  setColorBy: (colorBy) => set((state) => ({ view: { ...state.view, colorBy } })),
  toggleFilterType: (type) => set((state) => {
    const filterTypes = state.view.filterTypes.includes(type)
      ? state.view.filterTypes.filter((t) => t !== type)
      : [...state.view.filterTypes, type];
    return { view: { ...state.view, filterTypes } };
  }),

  startLayout: () => set({ isLayoutRunning: true }),
  stopLayout: () => set({ isLayoutRunning: false }),
  stepLayout: () => set((state) => ({ layoutIterations: state.layoutIterations + 1 })),
  resetLayout: () => set({ layoutIterations: 0, isLayoutRunning: false }),

  refresh: async () => {
    set({ isLoading: true });
    // 实际从GraphService加载
    await new Promise((r) => setTimeout(r, 100));
    set({ isLoading: false });
  },
  rebuild: async () => {
    set({ isLoading: true });
    // 从笔记数据重建图谱
    await new Promise((r) => setTimeout(r, 500));
    set({ isLoading: false });
  },
  exportGraph: () => JSON.stringify({ nodes: get().nodes, edges: get().edges }, null, 2),
  importGraph: (json) => {
    try {
      const data = JSON.parse(json);
      get().setGraphData(data);
    } catch (err) {
      set({ error: '导入失败：无效的JSON格式' });
    }
  },
  clear: () => set({ nodes: [], edges: [], layoutIterations: 0 }),
}));
