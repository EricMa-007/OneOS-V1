/**
 * UniSci Platform V2 - 知识图谱动态化
 * 二维力导向图 + 三维视图切换
 * 接入真实知识数据：概念/材料/方法/软件/人物
 */

'use strict';

// ============================================================
// 一、知识图谱数据模型
// ============================================================
const KnowledgeGraphData = {
  // 节点分类及颜色
  categories: {
    concept: { name: '物理概念', color: '#3b82f6', icon: 'lightbulb' },
    material: { name: '材料', color: '#10b981', icon: 'box' },
    method: { name: '计算方法', color: '#8b5cf6', icon: 'cpu' },
    software: { name: '软件工具', color: '#f59e0b', icon: 'terminal' },
    person: { name: '科学家', color: '#ec4899', icon: 'user' },
    application: { name: '应用领域', color: '#06b6d4', icon: 'target' },
    theory: { name: '理论基础', color: '#ef4444', icon: 'book-open' }
  },

  // 节点定义
  nodes: [
    // 理论基础
    { id: 'quantum_mechanics', label: '量子力学', category: 'theory', desc: '描述微观粒子运动规律的物理理论，是所有计算的基础', size: 25 },
    { id: 'density_functional', label: '密度泛函理论', category: 'theory', desc: '通过电子密度描述多电子系统基态性质的理论', size: 28 },
    { id: 'statistical_mechanics', label: '统计力学', category: 'theory', desc: '用统计方法研究大量粒子系统的宏观性质', size: 22 },
    
    // 计算方法
    { id: 'dft', label: 'DFT计算', category: 'method', desc: '基于密度泛函理论的第一性原理计算方法', size: 30 },
    { id: 'md', label: '分子动力学', category: 'method', desc: '模拟原子和分子随时间的运动', size: 26 },
    { id: 'mc', label: '蒙特卡洛', category: 'method', desc: '基于随机抽样的数值计算方法', size: 20 },
    { id: 'tight_binding', label: '紧束缚近似', category: 'method', desc: '用原子轨道线性组合描述电子结构的近似方法', size: 18 },
    { id: 'gw', label: 'GW近似', category: 'method', desc: '超越DFT的准粒子计算方法，更精确计算带隙', size: 18 },
    
    // 软件工具
    { id: 'vasp', label: 'VASP', category: 'software', desc: '维也纳原子模拟软件包，最流行的DFT商业软件', size: 24 },
    { id: 'quantum_espresso', label: 'Quantum ESPRESSO', category: 'software', desc: '开源的第一性原理计算软件', size: 20 },
    { id: 'abacus', label: 'ABACUS', category: 'software', desc: '中科大开发的国产原子模拟软件', size: 18 },
    { id: 'gromacs', label: 'GROMACS', category: 'software', desc: '最流行的分子动力学模拟软件', size: 22 },
    { id: 'lammps', label: 'LAMMPS', category: 'software', desc: '大规模原子/分子并行模拟器', size: 20 },
    
    // 物理概念
    { id: 'band_structure', label: '能带结构', category: 'concept', desc: '晶体中电子能量与动量的关系', size: 26 },
    { id: 'bandgap', label: '带隙', category: 'concept', desc: '导带底与价带顶之间的能量差', size: 24 },
    { id: 'fermi_level', label: '费米能级', category: 'concept', desc: '绝对零度时电子占据的最高能级', size: 22 },
    { id: 'dos', label: '态密度', category: 'concept', desc: '单位能量范围内的电子状态数', size: 20 },
    { id: 'effective_mass', label: '有效质量', category: 'concept', desc: '晶体中电子的等效惯性质量', size: 18 },
    { id: 'phonon', label: '声子', category: 'concept', desc: '晶格振动的能量量子', size: 18 },
    { id: 'exchange_correlation', label: '交换关联泛函', category: 'concept', desc: '描述电子间量子相互作用的泛函', size: 20 },
    { id: 'pseudopotential', label: '赝势', category: 'concept', desc: '简化内层电子影响的等效势', size: 18 },
    { id: 'kpoint', label: 'K点网格', category: 'concept', desc: '布里渊区中的采样点', size: 18 },
    
    // 材料
    { id: 'mos2', label: 'MoS₂', category: 'material', desc: '二硫化钼，典型的过渡金属二硫化物二维材料', size: 24 },
    { id: 'graphene', label: '石墨烯', category: 'material', desc: '单层碳原子构成的二维材料，具有超高迁移率', size: 28 },
    { id: 'silicon', label: '硅', category: 'material', desc: '最经典的半导体材料，芯片工业基础', size: 22 },
    { id: 'bn', label: 'h-BN', category: 'material', desc: '六方氮化硼，白色石墨烯，二维绝缘体', size: 18 },
    { id: 'topological_insulator', label: '拓扑绝缘体', category: 'material', desc: '内部绝缘表面导电的量子材料', size: 22 },
    { id: 'superconductor', label: '超导体', category: 'material', desc: '低温下电阻为零的材料', size: 20 },
    { id: 'perovskite', label: '钙钛矿', category: 'material', desc: 'ABX₃型结构材料，光伏领域热点', size: 18 },
    { id: 'water', label: '水', category: 'material', desc: 'H₂O，生命之源，分子动力学经典研究对象', size: 16 },
    
    // 应用领域
    { id: 'semiconductor_device', label: '半导体器件', category: 'application', desc: '基于半导体材料的电子器件', size: 20 },
    { id: 'solar_cell', label: '太阳能电池', category: 'application', desc: '将光能转化为电能的器件', size: 18 },
    { id: 'catalyst', label: '催化', category: 'application', desc: '加速化学反应而不被消耗的物质', size: 18 },
    { id: 'battery', label: '电池', category: 'application', desc: '储能器件，锂离子电池等', size: 18 },
    { id: 'drug_discovery', label: '药物发现', category: 'application', desc: '用计算方法筛选和设计药物分子', size: 16 },
    
    // 科学家
    { id: 'hohenberg', label: 'Hohenberg', category: 'person', desc: 'Hohenberg-Kohn定理提出者之一', size: 16 },
    { id: 'kohn', label: 'Kohn', category: 'person', desc: '密度泛函理论奠基人，1998年诺贝尔化学奖', size: 20 },
    { id: 'sham', label: 'Sham', category: 'person', desc: 'Kohn-Sham方程提出者之一', size: 16 },
    { id: 'einstein', label: '爱因斯坦', category: 'person', desc: '相对论和光量子理论提出者，布朗运动研究', size: 22 },
    { id: 'fermi', label: '费米', category: 'person', desc: '费米统计和费米能级命名来源', size: 18 },
    { id: 'landau', label: '朗道', category: 'person', desc: '相变理论和拓扑相变先驱', size: 18 },
  ],

  // 关系定义
  edges: [
    // 理论-方法
    { source: 'density_functional', target: 'dft', relation: '基础理论', type: 'foundation' },
    { source: 'quantum_mechanics', target: 'density_functional', relation: '基础', type: 'foundation' },
    { source: 'quantum_mechanics', target: 'tight_binding', relation: '基础', type: 'foundation' },
    { source: 'statistical_mechanics', target: 'md', relation: '基础', type: 'foundation' },
    { source: 'statistical_mechanics', target: 'mc', relation: '基础', type: 'foundation' },
    
    // 方法-软件
    { source: 'dft', target: 'vasp', relation: '实现', type: 'implement' },
    { source: 'dft', target: 'quantum_espresso', relation: '实现', type: 'implement' },
    { source: 'dft', target: 'abacus', relation: '实现', type: 'implement' },
    { source: 'md', target: 'gromacs', relation: '实现', type: 'implement' },
    { source: 'md', target: 'lammps', relation: '实现', type: 'implement' },
    
    // 方法-概念
    { source: 'dft', target: 'exchange_correlation', relation: '核心概念', type: 'concept' },
    { source: 'dft', target: 'pseudopotential', relation: '使用', type: 'uses' },
    { source: 'dft', target: 'kpoint', relation: '使用', type: 'uses' },
    { source: 'dft', target: 'band_structure', relation: '计算', type: 'computes' },
    { source: 'dft', target: 'dos', relation: '计算', type: 'computes' },
    { source: 'gw', target: 'bandgap', relation: '精确计算', type: 'computes' },
    { source: 'md', target: 'phonon', relation: '研究', type: 'studies' },
    
    // 概念-概念
    { source: 'band_structure', target: 'bandgap', relation: '包含', type: 'contains' },
    { source: 'band_structure', target: 'fermi_level', relation: '参考', type: 'reference' },
    { source: 'band_structure', target: 'effective_mass', relation: '导出', type: 'derives' },
    { source: 'dos', target: 'fermi_level', relation: '参考', type: 'reference' },
    
    // 方法-材料
    { source: 'dft', target: 'mos2', relation: '研究', type: 'studies' },
    { source: 'dft', target: 'graphene', relation: '研究', type: 'studies' },
    { source: 'dft', target: 'silicon', relation: '研究', type: 'studies' },
    { source: 'dft', target: 'topological_insulator', relation: '研究', type: 'studies' },
    { source: 'md', target: 'water', relation: '研究', type: 'studies' },
    { source: 'md', target: 'perovskite', relation: '研究', type: 'studies' },
    
    // 材料-材料
    { source: 'mos2', target: 'graphene', relation: '同类二维材料', type: 'related' },
    { source: 'mos2', target: 'bn', relation: '异质结', type: 'related' },
    { source: 'graphene', target: 'bn', relation: '异质结', type: 'related' },
    { source: 'topological_insulator', target: 'superconductor', relation: '近邻效应', type: 'related' },
    
    // 材料-概念
    { source: 'mos2', target: 'bandgap', relation: '具有', type: 'has' },
    { source: 'silicon', target: 'bandgap', relation: '具有', type: 'has' },
    { source: 'graphene', target: 'effective_mass', relation: '零有效质量', type: 'has' },
    { source: 'superconductor', target: 'phonon', relation: '电声耦合', type: 'has' },
    { source: 'perovskite', target: 'bandgap', relation: '可调带隙', type: 'has' },
    
    // 材料-应用
    { source: 'silicon', target: 'semiconductor_device', relation: '应用', type: 'applies' },
    { source: 'mos2', target: 'semiconductor_device', relation: '应用', type: 'applies' },
    { source: 'graphene', target: 'semiconductor_device', relation: '应用', type: 'applies' },
    { source: 'perovskite', target: 'solar_cell', relation: '应用', type: 'applies' },
    { source: 'mos2', target: 'catalyst', relation: '应用', type: 'applies' },
    { source: 'water', target: 'catalyst', relation: '裂解', type: 'applies' },
    { source: 'perovskite', target: 'battery', relation: '应用', type: 'applies' },
    { source: 'water', target: 'drug_discovery', relation: '溶剂', type: 'applies' },
    
    // 人物-理论/方法
    { source: 'hohenberg', target: 'density_functional', relation: '提出', type: 'proposed' },
    { source: 'kohn', target: 'density_functional', relation: '提出', type: 'proposed' },
    { source: 'kohn', target: 'dft', relation: 'Kohn-Sham方程', type: 'proposed' },
    { source: 'sham', target: 'dft', relation: 'Kohn-Sham方程', type: 'proposed' },
    { source: 'einstein', target: 'md', relation: '布朗运动', type: 'pioneer' },
    { source: 'einstein', target: 'statistical_mechanics', relation: '贡献', type: 'pioneer' },
    { source: 'fermi', target: 'fermi_level', relation: '命名', type: 'namesake' },
    { source: 'landau', target: 'topological_insulator', relation: '相变理论', type: 'pioneer' },
  ],

  // 获取节点
  getNode(id) {
    return this.nodes.find(n => n.id === id);
  },

  // 获取节点的邻居
  getNeighbors(nodeId) {
    const neighbors = [];
    for (const edge of this.edges) {
      if (edge.source === nodeId) {
        neighbors.push({ node: this.getNode(edge.target), relation: edge.relation, direction: 'out' });
      } else if (edge.target === nodeId) {
        neighbors.push({ node: this.getNode(edge.source), relation: edge.relation, direction: 'in' });
      }
    }
    return neighbors;
  },

  // 搜索节点
  search(keyword) {
    const kw = keyword.toLowerCase();
    return this.nodes.filter(n => 
      n.label.toLowerCase().includes(kw) || 
      n.desc.toLowerCase().includes(kw)
    );
  }
};

// ============================================================
// 二、力导向布局引擎
// ============================================================
class ForceLayout {
  constructor(nodes, edges, width, height) {
    this.nodes = nodes.map(n => ({
      ...n,
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 200 - 100,  // 3D z坐标
      vx: 0, vy: 0, vz: 0
    }));
    this.edges = edges;
    this.width = width;
    this.height = height;
    this.nodeMap = {};
    for (const n of this.nodes) this.nodeMap[n.id] = n;
  }

  // 一次迭代
  step() {
    const repulsion = 8000;
    const attraction = 0.005;
    const damping = 0.85;
    const centerGravity = 0.01;

    // 斥力
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const a = this.nodes[i], b = this.nodes[j];
        let dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
        let dist = Math.sqrt(dx*dx + dy*dy + dz*dz) || 1;
        const force = repulsion / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        const fz = (dz / dist) * force;
        a.vx -= fx; a.vy -= fy; a.vz -= fz;
        b.vx += fx; b.vy += fy; b.vz += fz;
      }
    }

    // 引力（连线）
    for (const edge of this.edges) {
      const a = this.nodeMap[edge.source];
      const b = this.nodeMap[edge.target];
      if (!a || !b) continue;
      let dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
      let dist = Math.sqrt(dx*dx + dy*dy + dz*dz) || 1;
      const force = (dist - 120) * attraction;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      const fz = (dz / dist) * force;
      a.vx += fx; a.vy += fy; a.vz += fz;
      b.vx -= fx; b.vy -= fy; b.vz -= fz;
    }

    // 中心引力 + 更新位置
    const cx = this.width / 2, cy = this.height / 2;
    for (const n of this.nodes) {
      n.vx += (cx - n.x) * centerGravity;
      n.vy += (cy - n.y) * centerGravity;
      n.vz += (0 - n.z) * centerGravity * 0.5;
      n.vx *= damping; n.vy *= damping; n.vz *= damping;
      n.x += n.vx; n.y += n.vy; n.z += n.vz;
      // 边界
      n.x = Math.max(50, Math.min(this.width - 50, n.x));
      n.y = Math.max(50, Math.min(this.height - 50, n.y));
      n.z = Math.max(-200, Math.min(200, n.z));
    }
  }
}

// ============================================================
// 三、知识图谱渲染器
// ============================================================
const KnowledgeGraphRenderer = {
  canvas: null,
  ctx: null,
  layout: null,
  mode: '2d',  // '2d' or '3d'
  animationId: null,
  selectedNode: null,
  hoveredNode: null,
  draggedNode: null,
  isDragging: false,
  scale: 1,
  offset: { x: 0, y: 0 },
  isPanning: false,
  panStart: { x: 0, y: 0 },
  rotation: { x: 0.3, y: 0 },
  autoRotate: true,
  searchKeyword: '',
  highlightedNodes: new Set(),

  // 初始化
  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = this.canvas.offsetWidth || 600;
    this.canvas.height = this.canvas.offsetHeight || 500;
    
    // 初始化布局
    this.layout = new ForceLayout(
      KnowledgeGraphData.nodes,
      KnowledgeGraphData.edges,
      this.canvas.width,
      this.canvas.height
    );
    
    // 预运行若干次让布局稳定
    for (let i = 0; i < 100; i++) this.layout.step();
    
    this.bindEvents();
    this.animate();
  },

  // 绑定事件
  bindEvents() {
    const canvas = this.canvas;
    
    canvas.addEventListener('mousedown', (e) => {
      const pos = this.getMousePos(e);
      const node = this.getNodeAt(pos.x, pos.y);
      if (node) {
        this.selectedNode = node;
        this.draggedNode = node;
        this.isDragging = true;
        this.showNodeDetail(node);
      } else {
        this.isPanning = true;
        this.panStart = { x: e.clientX - this.offset.x, y: e.clientY - this.offset.y };
        this.selectedNode = null;
        this.showNodeDetail(null);
      }
    });
    
    canvas.addEventListener('mousemove', (e) => {
      const pos = this.getMousePos(e);
      
      if (this.isDragging && this.draggedNode) {
        this.draggedNode.x = pos.x;
        this.draggedNode.y = pos.y;
        this.draggedNode.vx = 0;
        this.draggedNode.vy = 0;
      } else if (this.isPanning) {
        this.offset = { x: e.clientX - this.panStart.x, y: e.clientY - this.panStart.y };
      } else {
        // hover检测
        const node = this.getNodeAt(pos.x, pos.y);
        this.hoveredNode = node;
        canvas.style.cursor = node ? 'pointer' : 'grab';
      }
      
      // 3D模式下鼠标移动控制旋转
      if (this.mode === '3d' && !this.isDragging && !this.isPanning) {
        const rect = canvas.getBoundingClientRect();
        this.rotation.y = ((e.clientX - rect.left) / rect.width - 0.5) * Math.PI;
      }
    });
    
    canvas.addEventListener('mouseup', () => {
      this.isDragging = false;
      this.draggedNode = null;
      this.isPanning = false;
    });
    
    canvas.addEventListener('mouseleave', () => {
      this.isDragging = false;
      this.draggedNode = null;
      this.isPanning = false;
      this.hoveredNode = null;
    });
    
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      this.scale = Math.max(0.3, Math.min(3, this.scale * delta));
    });
    
    // 触摸支持
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const pos = this.getTouchPos(touch);
      const node = this.getNodeAt(pos.x, pos.y);
      if (node) {
        this.selectedNode = node;
        this.draggedNode = node;
        this.isDragging = true;
        this.showNodeDetail(node);
      }
    });
    
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (this.isDragging && this.draggedNode) {
        const touch = e.touches[0];
        const pos = this.getTouchPos(touch);
        this.draggedNode.x = pos.x;
        this.draggedNode.y = pos.y;
      }
    });
    
    canvas.addEventListener('touchend', () => {
      this.isDragging = false;
      this.draggedNode = null;
    });
  },

  getMousePos(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - this.offset.x) / this.scale,
      y: (e.clientY - rect.top - this.offset.y) / this.scale
    };
  },

  getTouchPos(touch) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (touch.clientX - rect.left - this.offset.x) / this.scale,
      y: (touch.clientY - rect.top - this.offset.y) / this.scale
    };
  },

  // 获取点击位置的节点
  getNodeAt(x, y) {
    // 从后往前遍历（上层节点优先）
    for (let i = this.layout.nodes.length - 1; i >= 0; i--) {
      const n = this.layout.nodes[i];
      const projected = this.projectNode(n);
      const dx = x - projected.x;
      const dy = y - projected.y;
      const r = (n.size || 15) * this.scale * 0.8;
      if (dx*dx + dy*dy < r*r) return n;
    }
    return null;
  },

  // 3D投影
  projectNode(node) {
    if (this.mode === '2d') {
      return { x: node.x, y: node.y, z: 0, scale: 1 };
    }
    // 3D旋转
    const cosX = Math.cos(this.rotation.x), sinX = Math.sin(this.rotation.x);
    const cosY = Math.cos(this.rotation.y), sinY = Math.sin(this.rotation.y);
    
    let x = node.x - this.canvas.width / 2;
    let y = node.y - this.canvas.height / 2;
    let z = node.z;
    
    // 绕Y轴旋转
    let x1 = x * cosY + z * sinY;
    let z1 = -x * sinY + z * cosY;
    // 绕X轴旋转
    let y1 = y * cosX - z1 * sinX;
    let z2 = y * sinX + z1 * cosX;
    
    // 透视投影
    const perspective = 600;
    const scale = perspective / (perspective + z2);
    
    return {
      x: x1 * scale + this.canvas.width / 2,
      y: y1 * scale + this.canvas.height / 2,
      z: z2,
      scale: scale
    };
  },

  // 动画循环
  animate() {
    this.layout.step();
    if (this.mode === '3d' && this.autoRotate && !this.isDragging) {
      this.rotation.y += 0.003;
    }
    this.render();
    this.animationId = requestAnimationFrame(() => this.animate());
  },

  // 渲染
  render() {
    const ctx = this.ctx;
    const w = this.canvas.width, h = this.canvas.height;
    
    // 背景
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);
    
    // 网格背景
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    
    ctx.save();
    ctx.translate(this.offset.x, this.offset.y);
    ctx.scale(this.scale, this.scale);
    
    // 投影所有节点
    const projected = this.layout.nodes.map(n => ({ node: n, proj: this.projectNode(n) }));
    // 按z排序（3D模式下远的先画）
    if (this.mode === '3d') {
      projected.sort((a, b) => a.proj.z - b.proj.z);
    }
    
    // 绘制连线
    for (const edge of this.layout.edges) {
      const a = projected.find(p => p.node.id === edge.source);
      const b = projected.find(p => p.node.id === edge.target);
      if (!a || !b) continue;
      
      const isHighlighted = this.highlightedNodes.size > 0 && 
        (this.highlightedNodes.has(edge.source) || this.highlightedNodes.has(edge.target));
      const isSelected = this.selectedNode && 
        (edge.source === this.selectedNode.id || edge.target === this.selectedNode.id);
      
      ctx.beginPath();
      ctx.moveTo(a.proj.x, a.proj.y);
      ctx.lineTo(b.proj.x, b.proj.y);
      
      if (isSelected || isHighlighted) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
      } else if (this.highlightedNodes.size > 0) {
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 0.5;
      } else {
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
      }
      ctx.globalAlpha = this.mode === '3d' ? Math.min(1, (a.proj.scale + b.proj.scale) / 2) : 0.6;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    
    // 绘制节点
    for (const { node, proj } of projected) {
      const cat = KnowledgeGraphData.categories[node.category] || { color: '#64748b' };
      const r = (node.size || 15) * proj.scale;
      const isSelected = this.selectedNode && this.selectedNode.id === node.id;
      const isHovered = this.hoveredNode && this.hoveredNode.id === node.id;
      const isHighlighted = this.highlightedNodes.size > 0 && this.highlightedNodes.has(node.id);
      const isDimmed = this.highlightedNodes.size > 0 && !isHighlighted && !isSelected;
      
      ctx.globalAlpha = isDimmed ? 0.2 : 1;
      
      // 发光效果
      if (isSelected || isHovered || isHighlighted) {
        ctx.shadowColor = cat.color;
        ctx.shadowBlur = 20;
      }
      
      // 节点圆
      const gradient = ctx.createRadialGradient(proj.x - r*0.3, proj.y - r*0.3, 0, proj.x, proj.y, r);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(0.3, cat.color);
      gradient.addColorStop(1, cat.color + 'aa');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, r, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.shadowBlur = 0;
      
      // 选中环
      if (isSelected) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, r + 4, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // 标签
      if (r > 8 || isSelected || isHovered) {
        ctx.fillStyle = '#e2e8f0';
        ctx.font = `${Math.max(10, 12 * proj.scale)}px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(node.label, proj.x, proj.y + r + 14);
      }
    }
    
    ctx.globalAlpha = 1;
    ctx.restore();
    
    // 模式指示器
    ctx.fillStyle = '#64748b';
    ctx.font = '11px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(`${this.mode === '2d' ? '二维视图' : '三维视图'} · ${this.layout.nodes.length}节点 · ${this.layout.edges.length}关系`, 10, h - 10);
  },

  // 切换模式
  setMode(mode) {
    this.mode = mode;
    if (mode === '3d') {
      this.autoRotate = true;
    }
  },

  // 搜索
  search(keyword) {
    this.searchKeyword = keyword;
    if (!keyword || keyword.trim() === '') {
      this.highlightedNodes.clear();
      return [];
    }
    const results = KnowledgeGraphData.search(keyword);
    this.highlightedNodes = new Set(results.map(n => n.id));
    return results;
  },

  // 显示节点详情
  showNodeDetail(node) {
    const panel = document.getElementById('kg-detail-panel');
    if (!panel) return;
    
    if (!node) {
      panel.innerHTML = `
        <div style="padding:20px;text-align:center;color:#64748b">
          <i data-lucide="mouse-pointer-click" class="lucide" style="width:32px;height:32px;margin-bottom:8px;opacity:0.5"></i>
          <div style="font-size:13px">点击节点查看详情</div>
          <div style="font-size:11px;margin-top:4px;color:#475569">拖拽节点调整位置 · 滚轮缩放</div>
        </div>`;
      if (typeof renderIcons === 'function') renderIcons();
      return;
    }
    
    const cat = KnowledgeGraphData.categories[node.category] || { name: '未知', color: '#64748b' };
    const neighbors = KnowledgeGraphData.getNeighbors(node.id);
    
    panel.innerHTML = `
      <div style="padding:16px;border-bottom:1px solid #1e293b">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
          <div style="width:36px;height:36px;border-radius:10px;background:${cat.color};display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <i data-lucide="${cat.icon}" class="lucide icon-white" style="width:20px;height:20px"></i>
          </div>
          <div>
            <div style="font-size:16px;font-weight:700;color:#f1f5f9">${node.label}</div>
            <div style="font-size:11px;color:${cat.color};font-weight:600">${cat.name}</div>
          </div>
        </div>
        <div style="font-size:12px;color:#94a3b8;line-height:1.6">${node.desc}</div>
      </div>
      <div style="padding:12px 16px">
        <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">关联知识 (${neighbors.length})</div>
        <div style="max-height:200px;overflow-y:auto">
          ${neighbors.map(n => `
            <div onclick="KnowledgeGraphRenderer.focusNode('${n.node.id}')" style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:8px;cursor:pointer;margin-bottom:2px" onmouseover="this.style.background='#1e293b'" onmouseout="this.style.background='transparent'">
              <div style="width:8px;height:8px;border-radius:50%;background:${KnowledgeGraphData.categories[n.node.category]?.color || '#64748b'};flex-shrink:0"></div>
              <div style="flex:1;min-width:0">
                <div style="font-size:12px;color:#e2e8f0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${n.node.label}</div>
                <div style="font-size:10px;color:#64748b">${n.relation}</div>
              </div>
              <i data-lucide="chevron-right" class="lucide" style="width:14px;height:14px;color:#475569;flex-shrink:0"></i>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    if (typeof renderIcons === 'function') renderIcons();
  },

  // 聚焦节点
  focusNode(nodeId) {
    const node = this.layout.nodes.find(n => n.id === nodeId);
    if (node) {
      this.selectedNode = node;
      this.showNodeDetail(node);
      // 高亮邻居
      const neighbors = KnowledgeGraphData.getNeighbors(nodeId);
      this.highlightedNodes = new Set([nodeId, ...neighbors.map(n => n.node.id)]);
    }
  },

  // 重置视图
  resetView() {
    this.scale = 1;
    this.offset = { x: 0, y: 0 };
    this.rotation = { x: 0.3, y: 0 };
    this.selectedNode = null;
    this.highlightedNodes.clear();
    this.showNodeDetail(null);
  },

  // 销毁
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
};

console.log(`[KnowledgeGraph] 动态知识图谱已加载：${KnowledgeGraphData.nodes.length}节点 / ${KnowledgeGraphData.edges.length}关系`);
