// ============================================
// OneOS V2 - 力导向布局引擎
// 基于物理模拟的图谱布局算法
// ============================================

(function() {
  'use strict';

  const DEFAULT_CONFIG = {
    repulsion: 200,
    attraction: 0.005,
    centerGravity: 0.01,
    damping: 0.9,
    maxVelocity: 10,
    maxIterations: 1000,
    convergenceThreshold: 0.01,
    nodeRadius: 20,
    width: 800,
    height: 600,
    animated: true,
    fps: 60,
  };

  class ForceDirectedLayout {
    constructor(nodes = [], edges = [], config = {}) {
      this.config = { ...DEFAULT_CONFIG, ...config };
      this.nodes = [];
      this.edges = [];
      this.nodeMap = new Map();
      this.iteration = 0;
      this.isRunning = false;
      this.animationId = null;
      this.onUpdate = null;
      this.onComplete = null;
      this.totalKineticEnergy = Infinity;
      this.setData(nodes, edges);
    }

    setData(nodes, edges) {
      this.nodes = nodes.map((node, index) => {
        const angle = (index / nodes.length) * Math.PI * 2;
        const radius = 100 + Math.random() * 100;
        return {
          id: node.id,
          label: node.label || node.title || node.name || node.id,
          x: node.x || this.config.width / 2 + Math.cos(angle) * radius,
          y: node.y || this.config.height / 2 + Math.sin(angle) * radius,
          vx: 0, vy: 0,
          fx: node.fx, fy: node.fy,
          radius: node.radius || this.config.nodeRadius,
          color: node.color || '#7C6FF0',
          data: node,
        };
      });
      this.nodeMap.clear();
      this.nodes.forEach(node => this.nodeMap.set(node.id, node));
      this.edges = edges.map(edge => ({
        source: this.nodeMap.get(edge.source),
        target: this.nodeMap.get(edge.target),
        weight: edge.weight || 1,
        data: edge,
      })).filter(edge => edge.source && edge.target);
      this.iteration = 0;
      this.totalKineticEnergy = Infinity;
    }

    updateConfig(config) {
      this.config = { ...this.config, ...config };
    }

    calculateRepulsion() {
      const { repulsion } = this.config;
      for (let i = 0; i < this.nodes.length; i++) {
        for (let j = i + 1; j < this.nodes.length; j++) {
          const nodeA = this.nodes[i];
          const nodeB = this.nodes[j];
          let dx = nodeB.x - nodeA.x;
          let dy = nodeB.y - nodeA.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 0.1) {
            dx = Math.random() - 0.5;
            dy = Math.random() - 0.5;
            distance = 0.1;
          }
          const force = repulsion / (distance * distance);
          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;
          nodeA.vx -= fx; nodeA.vy -= fy;
          nodeB.vx += fx; nodeB.vy += fy;
        }
      }
    }

    calculateAttraction() {
      const { attraction } = this.config;
      this.edges.forEach(edge => {
        const { source, target, weight } = edge;
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 0.1) return;
        const force = attraction * distance * weight;
        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;
        source.vx += fx; source.vy += fy;
        target.vx -= fx; target.vy -= fy;
      });
    }

    calculateCenterGravity() {
      const { centerGravity, width, height } = this.config;
      const centerX = width / 2;
      const centerY = height / 2;
      this.nodes.forEach(node => {
        node.vx += (centerX - node.x) * centerGravity;
        node.vy += (centerY - node.y) * centerGravity;
      });
    }

    updatePositions() {
      const { damping, maxVelocity, width, height } = this.config;
      let totalKineticEnergy = 0;
      this.nodes.forEach(node => {
        if (node.fx !== undefined && node.fy !== undefined) {
          node.x = node.fx; node.y = node.fy;
          node.vx = 0; node.vy = 0;
          return;
        }
        node.vx *= damping; node.vy *= damping;
        const velocity = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
        if (velocity > maxVelocity) {
          node.vx = (node.vx / velocity) * maxVelocity;
          node.vy = (node.vy / velocity) * maxVelocity;
        }
        node.x += node.vx; node.y += node.vy;
        const margin = 50;
        node.x = Math.max(margin, Math.min(width - margin, node.x));
        node.y = Math.max(margin, Math.min(height - margin, node.y));
        totalKineticEnergy += node.vx * node.vx + node.vy * node.vy;
      });
      this.totalKineticEnergy = totalKineticEnergy / this.nodes.length;
      return this.totalKineticEnergy;
    }

    step() {
      this.nodes.forEach(node => { node.vx = 0; node.vy = 0; });
      this.calculateRepulsion();
      this.calculateAttraction();
      this.calculateCenterGravity();
      const kineticEnergy = this.updatePositions();
      this.iteration++;
      return {
        iteration: this.iteration,
        kineticEnergy,
        converged: kineticEnergy < this.config.convergenceThreshold,
      };
    }

    start() {
      if (this.isRunning) return;
      this.isRunning = true;
      this.iteration = 0;
      const animate = () => {
        if (!this.isRunning) return;
        const result = this.step();
        if (this.onUpdate) this.onUpdate(this.nodes, this.edges, result);
        if (result.converged || this.iteration >= this.config.maxIterations) {
          this.stop();
          if (this.onComplete) this.onComplete(this.nodes, this.edges, result);
          return;
        }
        if (this.config.animated) {
          this.animationId = requestAnimationFrame(animate);
        } else {
          animate();
        }
      };
      animate();
    }

    stop() {
      this.isRunning = false;
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
    }

    run(maxIterations = this.config.maxIterations) {
      const originalMax = this.config.maxIterations;
      this.config.maxIterations = maxIterations;
      for (let i = 0; i < maxIterations; i++) {
        const result = this.step();
        if (result.converged) break;
      }
      this.config.maxIterations = originalMax;
      return { nodes: this.nodes, edges: this.edges, iterations: this.iteration };
    }

    getNodePositions() {
      return this.nodes.map(node => ({ id: node.id, x: node.x, y: node.y }));
    }

    getEdges() {
      return this.edges.map(edge => ({
        source: edge.source.id, target: edge.target.id,
        x1: edge.source.x, y1: edge.source.y,
        x2: edge.target.x, y2: edge.target.y,
      }));
    }

    fixNode(nodeId, x, y) {
      const node = this.nodeMap.get(nodeId);
      if (node) { node.fx = x; node.fy = y; node.x = x; node.y = y; }
    }

    releaseNode(nodeId) {
      const node = this.nodeMap.get(nodeId);
      if (node) { node.fx = undefined; node.fy = undefined; }
    }

    reset() {
      this.stop();
      this.nodes.forEach((node, index) => {
        const angle = (index / this.nodes.length) * Math.PI * 2;
        const radius = 100 + Math.random() * 100;
        node.x = this.config.width / 2 + Math.cos(angle) * radius;
        node.y = this.config.height / 2 + Math.sin(angle) * radius;
        node.vx = 0; node.vy = 0;
        node.fx = undefined; node.fy = undefined;
      });
      this.iteration = 0;
      this.totalKineticEnergy = Infinity;
    }

    destroy() {
      this.stop();
      this.nodes = []; this.edges = [];
      this.nodeMap.clear();
      this.onUpdate = null; this.onComplete = null;
    }
  }

  function buildGraphFromNotes(notes, backlinks) {
    const nodes = notes.map(note => ({
      id: note.id,
      label: note.title || note.name || note.id,
      color: note.color || '#7C6FF0',
      radius: note.radius || 20,
      data: note,
    }));
    const edges = [];
    const edgeSet = new Set();
    if (backlinks) {
      Object.entries(backlinks).forEach(([noteId, links]) => {
        links.forEach(link => {
          const sourceId = link.sourceId || noteId;
          const targetId = link.targetId || noteId;
          const edgeKey = `${sourceId}-${targetId}`;
          const reverseKey = `${targetId}-${sourceId}`;
          if (!edgeSet.has(edgeKey) && !edgeSet.has(reverseKey)) {
            edgeSet.add(edgeKey);
            edges.push({ source: sourceId, target: targetId, weight: 1 });
          }
        });
      });
    }
    notes.forEach(note => {
      if (note.backlinks && Array.isArray(note.backlinks)) {
        note.backlinks.forEach(linkId => {
          const edgeKey = `${note.id}-${linkId}`;
          const reverseKey = `${linkId}-${note.id}`;
          if (!edgeSet.has(edgeKey) && !edgeSet.has(reverseKey)) {
            edgeSet.add(edgeKey);
            edges.push({ source: note.id, target: linkId, weight: 1 });
          }
        });
      }
    });
    return { nodes, edges };
  }

  function getGraphStats(nodes, edges) {
    const degreeMap = new Map();
    nodes.forEach(n => degreeMap.set(n.id, 0));
    edges.forEach(e => {
      degreeMap.set(e.source, (degreeMap.get(e.source) || 0) + 1);
      degreeMap.set(e.target, (degreeMap.get(e.target) || 0) + 1);
    });
    const degrees = Array.from(degreeMap.values());
    const maxDegree = Math.max(...degrees, 0);
    const avgDegree = degrees.length > 0 ? degrees.reduce((a, b) => a + b, 0) / degrees.length : 0;
    const visited = new Set();
    let components = 0;
    const adjacency = new Map();
    nodes.forEach(n => adjacency.set(n.id, []));
    edges.forEach(e => {
      adjacency.get(e.source)?.push(e.target);
      adjacency.get(e.target)?.push(e.source);
    });
    nodes.forEach(n => {
      if (!visited.has(n.id)) {
        components++;
        const stack = [n.id];
        while (stack.length > 0) {
          const current = stack.pop();
          if (visited.has(current)) continue;
          visited.add(current);
          adjacency.get(current)?.forEach(neighbor => stack.push(neighbor));
        }
      }
    });
    return {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      maxDegree,
      avgDegree: avgDegree.toFixed(2),
      components,
      density: nodes.length > 1 ? (2 * edges.length) / (nodes.length * (nodes.length - 1)) : 0,
    };
  }

  const ForceLayout = {
    ForceDirectedLayout,
    DEFAULT_CONFIG,
    buildGraphFromNotes,
    getGraphStats,
  };

  if (typeof window !== 'undefined') {
    window.ForceLayout = ForceLayout;
  }

  console.log('[ForceLayout] 力导向布局引擎已加载');

})();
