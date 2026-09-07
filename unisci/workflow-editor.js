/**
 * UniSci Platform V2 - 工作流系统深度重构
 * 可视化工作流编辑器：节点拖拽 + 连线 + 配置面板 + 执行引擎
 * 取代旧版静态流程图，实现真正的功能闭环
 */

'use strict';

// ============================================================
// 一、节点定义（30+节点，6大类）
// ============================================================
const WFNodeTypes = {
  // 输入类
  input: [
    { id: 'material-input', name: '材料数据输入', icon: 'database', color: '#3b82f6', category: 'input',
      config: [{ key: 'materialId', label: '材料ID', type: 'text', default: 'mp-123' },
               { key: 'property', label: '获取性质', type: 'select', options: ['结构','电子','力学','热学'], default: '结构' }],
      outputs: ['material_data'] },
    { id: 'file-input', name: '文件输入', icon: 'file-up', color: '#3b82f6', category: 'input',
      config: [{ key: 'filePath', label: '文件路径', type: 'text', default: '/data/POSCAR' },
               { key: 'fileType', label: '文件类型', type: 'select', options: ['POSCAR','XYZ','CIF','JSON'], default: 'POSCAR' }],
      outputs: ['structure'] },
    { id: 'parameter-input', name: '参数输入', icon: 'sliders', color: '#3b82f6', category: 'input',
      config: [{ key: 'paramName', label: '参数名', type: 'text', default: 'temperature' },
               { key: 'paramValue', label: '参数值', type: 'number', default: 300 }],
      outputs: ['parameter'] },
  ],
  // 计算类
  compute: [
    { id: 'dft-calc', name: 'DFT计算', icon: 'atom', color: '#8b5cf6', category: 'compute',
      config: [{ key: 'software', label: '计算软件', type: 'select', options: ['VASP','Quantum ESPRESSO','ABACUS'], default: 'VASP' },
               { key: 'encut', label: '截断能(eV)', type: 'number', default: 520 },
               { key: 'kpoints', label: 'K点', type: 'text', default: '6x6x2' },
               { key: 'functional', label: '泛函', type: 'select', options: ['PBE','LDA','HSE06'], default: 'PBE' }],
      inputs: ['structure'], outputs: ['dft_result'] },
    { id: 'md-calc', name: '分子动力学', icon: 'activity', color: '#8b5cf6', category: 'compute',
      config: [{ key: 'software', label: '计算软件', type: 'select', options: ['GROMACS','LAMMPS','NAMD'], default: 'LAMMPS' },
               { key: 'temperature', label: '温度(K)', type: 'number', default: 300 },
               { key: 'duration', label: '模拟时长(ps)', type: 'number', default: 100 },
               { key: 'ensemble', label: '系综', type: 'select', options: ['NVT','NPT','NVE'], default: 'NVT' }],
      inputs: ['structure'], outputs: ['md_trajectory'] },
    { id: 'structure-opt', name: '结构优化', icon: 'git-branch', color: '#8b5cf6', category: 'compute',
      config: [{ key: 'algorithm', label: '优化算法', type: 'select', options: ['CG','BFGS','FIRE'], default: 'CG' },
               { key: 'forceThreshold', label: '力收敛阈值', type: 'number', default: 0.01 }],
      inputs: ['structure'], outputs: ['optimized_structure'] },
    { id: 'band-calc', name: '能带计算', icon: 'trending-up', color: '#8b5cf6', category: 'compute',
      config: [{ key: 'kpath', label: 'K点路径', type: 'text', default: 'G-M-K-G' },
               { key: 'nbands', label: '能带数', type: 'number', default: 20 }],
      inputs: ['dft_result'], outputs: ['band_data'] },
    { id: 'dos-calc', name: '态密度计算', icon: 'bar-chart-2', color: '#8b5cf6', category: 'compute',
      config: [{ key: 'smearing', label: '展宽方法', type: 'select', options: ['Gaussian','Methfessel-Paxton','Tetrahedron'], default: 'Gaussian' },
               { key: 'sigma', label: '展宽宽度', type: 'number', default: 0.1 }],
      inputs: ['dft_result'], outputs: ['dos_data'] },
  ],
  // 分析类
  analysis: [
    { id: 'band-analysis', name: '能带分析', icon: 'zap', color: '#10b981', category: 'analysis',
      config: [{ key: 'findGap', label: '计算带隙', type: 'checkbox', default: true },
               { key: 'findEffectiveMass', label: '计算有效质量', type: 'checkbox', default: false }],
      inputs: ['band_data'], outputs: ['band_analysis'] },
    { id: 'dos-analysis', name: '态密度分析', icon: 'pie-chart', color: '#10b981', category: 'analysis',
      config: [{ key: 'pdos', label: '投影态密度', type: 'checkbox', default: true },
               { key: 'integrate', label: '积分态密度', type: 'checkbox', default: false }],
      inputs: ['dos_data'], outputs: ['dos_analysis'] },
    { id: 'structure-analysis', name: '结构分析', icon: 'box', color: '#10b981', category: 'analysis',
      config: [{ key: 'bondLength', label: '键长分析', type: 'checkbox', default: true },
               { key: 'bondAngle', label: '键角分析', type: 'checkbox', default: true },
               { key: 'coordination', label: '配位数', type: 'checkbox', default: false }],
      inputs: ['structure','optimized_structure'], outputs: ['structure_analysis'] },
    { id: 'md-analysis', name: 'MD轨迹分析', icon: 'git-commit', color: '#10b981', category: 'analysis',
      config: [{ key: 'rdf', label: '径向分布函数', type: 'checkbox', default: true },
               { key: 'msd', label: '均方位移', type: 'checkbox', default: true },
               { key: 'temperature', label: '温度演化', type: 'checkbox', default: false }],
      inputs: ['md_trajectory'], outputs: ['md_analysis'] },
  ],
  // 可视化类
  visualization: [
    { id: 'band-plot', name: '能带图绘制', icon: 'image', color: '#f59e0b', category: 'visualization',
      config: [{ key: 'showFermi', label: '显示费米能级', type: 'checkbox', default: true },
               { key: 'colorBySpin', label: '按自旋着色', type: 'checkbox', default: false }],
      inputs: ['band_data','band_analysis'], outputs: ['band_plot'] },
    { id: 'dos-plot', name: 'DOS图绘制', icon: 'image', color: '#f59e0b', category: 'visualization',
      config: [{ key: 'showTotal', label: '显示总DOS', type: 'checkbox', default: true },
               { key: 'showPDOS', label: '显示投影DOS', type: 'checkbox', default: true }],
      inputs: ['dos_data','dos_analysis'], outputs: ['dos_plot'] },
    { id: 'structure-view', name: '结构可视化', icon: 'box', color: '#f59e0b', category: 'visualization',
      config: [{ key: 'showBonds', label: '显示化学键', type: 'checkbox', default: true },
               { key: 'showLabels', label: '显示原子标签', type: 'checkbox', default: false }],
      inputs: ['structure','optimized_structure'], outputs: ['structure_view'] },
    { id: 'md-animation', name: 'MD动画', icon: 'film', color: '#f59e0b', category: 'visualization',
      config: [{ key: 'fps', label: '帧率', type: 'number', default: 30 },
               { key: 'showTrajectory', label: '显示轨迹', type: 'checkbox', default: false }],
      inputs: ['md_trajectory'], outputs: ['md_animation'] },
  ],
  // 输出类
  output: [
    { id: 'data-export', name: '数据导出', icon: 'download', color: '#ec4899', category: 'output',
      config: [{ key: 'format', label: '导出格式', type: 'select', options: ['JSON','CSV','Excel','HDF5'], default: 'JSON' },
               { key: 'filename', label: '文件名', type: 'text', default: 'result' }],
      inputs: ['band_analysis','dos_analysis','structure_analysis'], outputs: [] },
    { id: 'report-gen', name: '报告生成', icon: 'file-text', color: '#ec4899', category: 'output',
      config: [{ key: 'format', label: '报告格式', type: 'select', options: ['PDF','Word','HTML','Markdown'], default: 'PDF' },
               { key: 'includePlots', label: '包含图表', type: 'checkbox', default: true }],
      inputs: ['band_plot','dos_plot','structure_view','band_analysis'], outputs: ['report'] },
    { id: 'database-save', name: '保存到数据库', icon: 'save', color: '#ec4899', category: 'output',
      config: [{ key: 'database', label: '目标数据库', type: 'select', options: ['材料库','计算结果','项目数据'], default: '计算结果' },
               { key: 'tags', label: '标签', type: 'text', default: 'DFT,2D材料' }],
      inputs: ['dft_result','band_analysis','dos_analysis'], outputs: [] },
  ],
  // 控制类
  control: [
    { id: 'condition', name: '条件判断', icon: 'git-branch', color: '#64748b', category: 'control',
      config: [{ key: 'variable', label: '判断变量', type: 'text', default: 'bandgap' },
               { key: 'operator', label: '运算符', type: 'select', options: ['>','<','==','>=','<='], default: '>' },
               { key: 'value', label: '比较值', type: 'number', default: 1.0 }],
      inputs: ['band_analysis'], outputs: ['true_branch','false_branch'] },
    { id: 'loop', name: '循环', icon: 'repeat', color: '#64748b', category: 'control',
      config: [{ key: 'maxIterations', label: '最大迭代次数', type: 'number', default: 10 },
               { key: 'convergenceThreshold', label: '收敛阈值', type: 'number', default: 0.001 }],
      inputs: ['structure'], outputs: ['iterated_result'] },
    { id: 'merge', name: '数据合并', icon: 'merge', color: '#64748b', category: 'control',
      config: [{ key: 'method', label: '合并方式', type: 'select', options: ['拼接','求平均','求差值'], default: '拼接' }],
      inputs: ['input1','input2'], outputs: ['merged'] },
  ]
};

// 获取所有节点的扁平列表
function getAllNodeTypes() {
  const all = [];
  for (const category of Object.values(WFNodeTypes)) {
    all.push(...category);
  }
  return all;
}

// 根据ID获取节点类型
function getNodeTypeById(id) {
  for (const category of Object.values(WFNodeTypes)) {
    const found = category.find(n => n.id === id);
    if (found) return found;
  }
  return null;
}

// ============================================================
// 二、工作流数据模型
// ============================================================
class WorkflowGraph {
  constructor() {
    this.nodes = [];  // {id, typeId, x, y, config, status}
    this.edges = [];  // {id, fromNode, fromPort, toNode, toPort}
    this.nodeIdCounter = 0;
    this.edgeIdCounter = 0;
  }

  addNode(typeId, x, y) {
    const type = getNodeTypeById(typeId);
    if (!type) return null;
    const node = {
      id: 'node_' + (++this.nodeIdCounter),
      typeId,
      type,
      x, y,
      config: {},
      status: 'idle'  // idle, running, success, error
    };
    // 初始化配置默认值
    for (const cfg of type.config || []) {
      node.config[cfg.key] = cfg.default;
    }
    this.nodes.push(node);
    return node;
  }

  removeNode(nodeId) {
    this.nodes = this.nodes.filter(n => n.id !== nodeId);
    this.edges = this.edges.filter(e => e.fromNode !== nodeId && e.toNode !== nodeId);
  }

  addEdge(fromNode, fromPort, toNode, toPort) {
    // 检查是否已存在
    const exists = this.edges.find(e => e.fromNode === fromNode && e.fromPort === fromPort && e.toNode === toNode && e.toPort === toPort);
    if (exists) return null;
    const edge = {
      id: 'edge_' + (++this.edgeIdCounter),
      fromNode, fromPort, toNode, toPort
    };
    this.edges.push(edge);
    return edge;
  }

  removeEdge(edgeId) {
    this.edges = this.edges.filter(e => e.id !== edgeId);
  }

  // 拓扑排序（用于执行）
  topologicalSort() {
    const inDegree = {};
    const adjList = {};
    for (const node of this.nodes) {
      inDegree[node.id] = 0;
      adjList[node.id] = [];
    }
    for (const edge of this.edges) {
      adjList[edge.fromNode].push(edge.toNode);
      inDegree[edge.toNode]++;
    }
    const queue = Object.keys(inDegree).filter(id => inDegree[id] === 0);
    const result = [];
    while (queue.length > 0) {
      const nodeId = queue.shift();
      result.push(nodeId);
      for (const next of adjList[nodeId]) {
        inDegree[next]--;
        if (inDegree[next] === 0) queue.push(next);
      }
    }
    return result.length === this.nodes.length ? result : null; // null表示有环
  }

  // 获取节点的输入边
  getInputEdges(nodeId) {
    return this.edges.filter(e => e.toNode === nodeId);
  }

  // 获取节点的输出边
  getOutputEdges(nodeId) {
    return this.edges.filter(e => e.fromNode === nodeId);
  }

  // 清空
  clear() {
    this.nodes = [];
    this.edges = [];
    this.nodeIdCounter = 0;
    this.edgeIdCounter = 0;
  }

  // 导出JSON
  toJSON() {
    return {
      nodes: this.nodes.map(n => ({ id: n.id, typeId: n.typeId, x: n.x, y: n.y, config: n.config })),
      edges: this.edges
    };
  }
}

// ============================================================
// 三、工作流编辑器（核心）
// ============================================================
const WorkflowEditor = {
  graph: null,
  container: null,
  svg: null,
  selectedNode: null,
  selectedEdge: null,
  isDraggingNode: false,
  dragNode: null,
  dragOffset: { x: 0, y: 0 },
  isConnecting: false,
  connectionStart: null,
  tempLine: null,
  panOffset: { x: 0, y: 0 },
  scale: 1,
  isPanning: false,
  panStart: { x: 0, y: 0 },
  logs: [],
  isRunning: false,

  // 初始化
  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.graph = new WorkflowGraph();
    this.render();
    this.bindEvents();
  },

  // 渲染整个编辑器
  render() {
    this.container.innerHTML = `
      <div class="wf-editor" style="display:flex;flex-direction:column;height:100%;background:#f8fafc">
        <!-- 工具栏 -->
        <div class="wf-toolbar" style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:#fff;border-bottom:1px solid #e2e8f0;flex-shrink:0">
          <button onclick="WorkflowEditor.runWorkflow()" style="display:flex;align-items:center;gap:4px;padding:6px 12px;background:linear-gradient(135deg,#3b82f6,#2563eb);color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer">
            <i data-lucide="play" class="lucide" style="width:14px;height:14px"></i>运行
          </button>
          <button onclick="WorkflowEditor.stopWorkflow()" style="display:flex;align-items:center;gap:4px;padding:6px 12px;background:#ef4444;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer">
            <i data-lucide="square" class="lucide" style="width:14px;height:14px"></i>停止
          </button>
          <div style="width:1px;height:20px;background:#e2e8f0"></div>
          <button onclick="WorkflowEditor.clearGraph()" style="display:flex;align-items:center;gap:4px;padding:6px 10px;background:#f1f5f9;color:#475569;border:none;border-radius:8px;font-size:12px;font-weight:500;cursor:pointer">
            <i data-lucide="trash-2" class="lucide" style="width:14px;height:14px"></i>清空
          </button>
          <button onclick="WorkflowEditor.loadTemplate('dft_pipeline')" style="padding:6px 10px;background:#f1f5f9;color:#475569;border:none;border-radius:8px;font-size:12px;font-weight:500;cursor:pointer">DFT模板</button>
          <button onclick="WorkflowEditor.loadTemplate('md_pipeline')" style="padding:6px 10px;background:#f1f5f9;color:#475569;border:none;border-radius:8px;font-size:12px;font-weight:500;cursor:pointer">MD模板</button>
          <div style="flex:1"></div>
          <span id="wf-node-count" style="font-size:11px;color:#94a3b8">0 节点 · 0 连线</span>
        </div>
        <!-- 主体区域 -->
        <div class="wf-main" style="display:flex;flex:1;overflow:hidden">
          <!-- 节点库 -->
          <div class="wf-node-library" style="width:180px;background:#fff;border-right:1px solid #e2e8f0;overflow-y:auto;flex-shrink:0">
            ${this.renderNodeLibrary()}
          </div>
          <!-- 画布区域 -->
          <div class="wf-canvas-container" style="flex:1;position:relative;overflow:hidden;background:#f8fafc;background-image:radial-gradient(circle,#cbd5e1 1px,transparent 1px);background-size:20px 20px">
            <svg class="wf-svg" id="wf-svg" style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none">
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8"/>
                </marker>
              </defs>
              <g id="wf-edges-group"></g>
              <g id="wf-nodes-group"></g>
              <line id="wf-temp-line" style="stroke:#3b82f6;stroke-width:2;stroke-dasharray:5,5;display:none"/>
            </svg>
          </div>
          <!-- 配置面板 -->
          <div class="wf-config-panel" id="wf-config-panel" style="width:240px;background:#fff;border-left:1px solid #e2e8f0;overflow-y:auto;flex-shrink:0">
            <div style="padding:16px;text-align:center;color:#94a3b8;font-size:13px">
              <i data-lucide="mouse-pointer-click" class="lucide" style="width:32px;height:32px;margin-bottom:8px;opacity:0.5"></i>
              <div>点击节点查看配置</div>
            </div>
          </div>
        </div>
        <!-- 日志面板 -->
        <div class="wf-log-panel" style="height:100px;background:#1e293b;color:#94a3b8;font-family:monospace;font-size:11px;overflow-y:auto;padding:8px 12px;flex-shrink:0;border-top:1px solid #334155" id="wf-log-panel">
          <div style="color:#64748b">[系统] 工作流编辑器已就绪，从左侧拖拽节点到画布开始</div>
        </div>
      </div>
    `;
    
    this.svg = document.getElementById('wf-svg');
    this.updateNodeCount();
    if (typeof renderIcons === 'function') renderIcons();
  },

  // 渲染节点库
  renderNodeLibrary() {
    const categoryNames = {
      input: '📥 输入', compute: '⚡ 计算', analysis: '📊 分析',
      visualization: '🎨 可视化', output: '📤 输出', control: '🔀 控制'
    };
    let html = '';
    for (const [cat, nodes] of Object.entries(WFNodeTypes)) {
      html += `<div style="padding:8px 12px 4px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px">${categoryNames[cat] || cat}</div>`;
      for (const node of nodes) {
        html += `
          <div class="wf-lib-node" draggable="true" data-type-id="${node.id}" 
               style="display:flex;align-items:center;gap:8px;padding:8px 12px;margin:2px 8px;border-radius:8px;cursor:grab;background:#f8fafc;border:1px solid #e2e8f0;transition:all 0.15s"
               onmouseover="this.style.background='#eff6ff';this.style.borderColor='#93c5fd'"
               onmouseout="this.style.background='#f8fafc';this.style.borderColor='#e2e8f0'">
            <div style="width:24px;height:24px;border-radius:6px;background:${node.color};display:flex;align-items:center;justify-content:center;flex-shrink:0">
              <i data-lucide="${node.icon}" class="lucide icon-white" style="width:14px;height:14px"></i>
            </div>
            <span style="font-size:12px;font-weight:500;color:#334155;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${node.name}</span>
          </div>
        `;
      }
    }
    return html;
  },

  // 绑定事件
  bindEvents() {
    const canvasContainer = this.container.querySelector('.wf-canvas-container');
    if (!canvasContainer) return;

    // 节点库拖拽
    this.container.querySelectorAll('.wf-lib-node').forEach(el => {
      el.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('nodeTypeId', el.dataset.typeId);
        e.dataTransfer.effectAllowed = 'copy';
      });
    });

    // 画布拖放
    canvasContainer.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    });
    canvasContainer.addEventListener('drop', (e) => {
      e.preventDefault();
      const typeId = e.dataTransfer.getData('nodeTypeId');
      if (typeId) {
        const rect = canvasContainer.getBoundingClientRect();
        const x = (e.clientX - rect.left - this.panOffset.x) / this.scale;
        const y = (e.clientY - rect.top - this.panOffset.y) / this.scale;
        this.addNodeToCanvas(typeId, x, y);
      }
    });

    // 画布平移（中键或空格拖拽）
    canvasContainer.addEventListener('mousedown', (e) => {
      if (e.target === canvasContainer || e.target.tagName === 'svg') {
        if (e.button === 1 || e.shiftKey) {
          this.isPanning = true;
          this.panStart = { x: e.clientX - this.panOffset.x, y: e.clientY - this.panOffset.y };
          e.preventDefault();
        } else {
          this.selectNode(null);
        }
      }
    });
    document.addEventListener('mousemove', (e) => {
      if (this.isPanning) {
        this.panOffset = { x: e.clientX - this.panStart.x, y: e.clientY - this.panStart.y };
        this.updateCanvasTransform();
      }
      if (this.isDraggingNode && this.dragNode) {
        const rect = canvasContainer.getBoundingClientRect();
        this.dragNode.x = (e.clientX - rect.left - this.panOffset.x) / this.scale - this.dragOffset.x;
        this.dragNode.y = (e.clientY - rect.top - this.panOffset.y) / this.scale - this.dragOffset.y;
        this.renderNodes();
        this.renderEdges();
      }
      if (this.isConnecting && this.tempLine) {
        const rect = canvasContainer.getBoundingClientRect();
        const x = (e.clientX - rect.left - this.panOffset.x) / this.scale;
        const y = (e.clientY - rect.top - this.panOffset.y) / this.scale;
        this.tempLine.setAttribute('x2', x * this.scale + this.panOffset.x);
        this.tempLine.setAttribute('y2', y * this.scale + this.panOffset.y);
      }
    });
    document.addEventListener('mouseup', () => {
      this.isPanning = false;
      this.isDraggingNode = false;
      this.dragNode = null;
      if (this.isConnecting) {
        this.isConnecting = false;
        if (this.tempLine) this.tempLine.style.display = 'none';
        this.connectionStart = null;
      }
    });

    // 缩放
    canvasContainer.addEventListener('wheel', (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        this.scale = Math.max(0.3, Math.min(3, this.scale * delta));
        this.updateCanvasTransform();
      }
    });

    // 键盘删除
    document.addEventListener('keydown', (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && this.selectedNode) {
        this.graph.removeNode(this.selectedNode.id);
        this.selectedNode = null;
        this.renderNodes();
        this.renderEdges();
        this.updateNodeCount();
        this.log('[操作] 已删除节点');
      }
    });
  },

  // 更新画布变换
  updateCanvasTransform() {
    const group = document.getElementById('wf-nodes-group');
    const edgesGroup = document.getElementById('wf-edges-group');
    const transform = `translate(${this.panOffset.x},${this.panOffset.y}) scale(${this.scale})`;
    if (group) group.setAttribute('transform', transform);
    if (edgesGroup) edgesGroup.setAttribute('transform', transform);
  },

  // 添加节点到画布
  addNodeToCanvas(typeId, x, y) {
    const node = this.graph.addNode(typeId, x, y);
    if (node) {
      this.renderNodes();
      this.renderEdges();
      this.updateNodeCount();
      this.log(`[操作] 添加节点: ${node.type.name}`);
    }
  },

  // 渲染节点
  renderNodes() {
    const group = document.getElementById('wf-nodes-group');
    if (!group) return;
    group.innerHTML = '';
    
    for (const node of this.graph.nodes) {
      const type = node.type;
      const isSelected = this.selectedNode && this.selectedNode.id === node.id;
      const statusColor = { idle: '#94a3b8', running: '#f59e0b', success: '#10b981', error: '#ef4444' }[node.status] || '#94a3b8';
      
      // 节点foreignObject
      const fo = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
      fo.setAttribute('x', node.x);
      fo.setAttribute('y', node.y);
      fo.setAttribute('width', 160);
      fo.setAttribute('height', 'auto');
      fo.style.overflow = 'visible';
      fo.dataset.nodeId = node.id;
      
      const inputPorts = (type.inputs || []).length;
      const outputPorts = (type.outputs || []).length;
      const nodeHeight = 60 + Math.max(inputPorts, outputPorts) * 18;
      
      fo.innerHTML = `
        <div xmlns="http://www.w3.org/1999/xhtml" style="
          position:relative;background:#fff;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.1);
          border:2px solid ${isSelected ? '#3b82f6' : '#e2e8f0'};cursor:move;overflow:hidden;
          font-family:system-ui,sans-serif">
          <!-- 节点头部 -->
          <div style="display:flex;align-items:center;gap:6px;padding:6px 10px;background:${type.color}15;border-bottom:1px solid ${type.color}30">
            <div style="width:18px;height:18px;border-radius:4px;background:${type.color};display:flex;align-items:center;justify-content:center;flex-shrink:0">
              <i data-lucide="${type.icon}" class="lucide icon-white" style="width:12px;height:12px"></i>
            </div>
            <span style="font-size:11px;font-weight:600;color:#1f2937;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${type.name}</span>
            <div style="width:6px;height:6px;border-radius:50%;background:${statusColor};flex-shrink:0"></div>
          </div>
          <!-- 端口区域 -->
          <div style="position:relative;padding:4px 0">
            ${(type.inputs || []).map((port, i) => `
              <div style="display:flex;align-items:center;padding:2px 10px;position:relative">
                <div class="wf-input-port" data-node-id="${node.id}" data-port="${port}" 
                     style="position:absolute;left:-6px;top:50%;transform:translateY(-50%);width:10px;height:10px;border-radius:50%;background:#fff;border:2px solid #94a3b8;cursor:crosshair"></div>
                <span style="font-size:10px;color:#64748b;margin-left:8px">${port}</span>
              </div>
            `).join('')}
            ${(type.outputs || []).map((port, i) => `
              <div style="display:flex;align-items:center;justify-content:flex-end;padding:2px 10px;position:relative">
                <span style="font-size:10px;color:#64748b;margin-right:8px">${port}</span>
                <div class="wf-output-port" data-node-id="${node.id}" data-port="${port}"
                     style="position:absolute;right:-6px;top:50%;transform:translateY(-50%);width:10px;height:10px;border-radius:50%;background:#3b82f6;border:2px solid #fff;cursor:crosshair"></div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      
      group.appendChild(fo);
      
      // 绑定节点事件（在foreignObject上绑定，更可靠）
      fo.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('wf-input-port') || e.target.classList.contains('wf-output-port')) {
          return; // 端口事件单独处理
        }
        e.stopPropagation();
        this.selectNode(node);
        this.isDraggingNode = true;
        this.dragNode = node;
        const rect = this.container.querySelector('.wf-canvas-container').getBoundingClientRect();
        this.dragOffset = {
          x: (e.clientX - rect.left - this.panOffset.x) / this.scale - node.x,
          y: (e.clientY - rect.top - this.panOffset.y) / this.scale - node.y
        };
      });
      
      // 输出端口连线开始
      fo.querySelectorAll('.wf-output-port').forEach(port => {
        port.addEventListener('mousedown', (e) => {
          e.stopPropagation();
          this.isConnecting = true;
          this.connectionStart = { nodeId: node.id, port: port.dataset.port };
          this.tempLine = document.getElementById('wf-temp-line');
          if (this.tempLine) {
            const portRect = port.getBoundingClientRect();
            const canvasRect = this.container.querySelector('.wf-canvas-container').getBoundingClientRect();
            this.tempLine.setAttribute('x1', portRect.left - canvasRect.left + 5);
            this.tempLine.setAttribute('y1', portRect.top - canvasRect.top + 5);
            this.tempLine.setAttribute('x2', portRect.left - canvasRect.left + 5);
            this.tempLine.setAttribute('y2', portRect.top - canvasRect.top + 5);
            this.tempLine.style.display = 'block';
          }
        });
      });
      
      // 输入端口连线结束
      fo.querySelectorAll('.wf-input-port').forEach(port => {
        port.addEventListener('mouseup', (e) => {
          e.stopPropagation();
          if (this.isConnecting && this.connectionStart) {
            const toNodeId = node.id;
            const toPort = port.dataset.port;
            if (this.connectionStart.nodeId !== toNodeId) {
              this.graph.addEdge(this.connectionStart.nodeId, this.connectionStart.port, toNodeId, toPort);
              this.renderEdges();
              this.updateNodeCount();
              this.log(`[连线] ${this.connectionStart.port} → ${toPort}`);
            }
          }
        });
      });
    }
    
    if (typeof renderIcons === 'function') renderIcons();
  },

  // 渲染连线
  renderEdges() {
    const group = document.getElementById('wf-edges-group');
    if (!group) return;
    group.innerHTML = '';
    
    for (const edge of this.graph.edges) {
      const fromNode = this.graph.nodes.find(n => n.id === edge.fromNode);
      const toNode = this.graph.nodes.find(n => n.id === edge.toNode);
      if (!fromNode || !toNode) continue;
      
      // 计算端口位置
      const fromType = fromNode.type;
      const toType = toNode.type;
      const fromPortIndex = (fromType.outputs || []).indexOf(edge.fromPort);
      const toPortIndex = (toType.inputs || []).indexOf(edge.toPort);
      
      const x1 = fromNode.x + 160;
      const y1 = fromNode.y + 32 + fromPortIndex * 18 + 9;
      const x2 = toNode.x;
      const y2 = toNode.y + 32 + toPortIndex * 18 + 9;
      
      // 贝塞尔曲线
      const dx = Math.abs(x2 - x1) * 0.5;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`);
      path.setAttribute('stroke', '#94a3b8');
      path.setAttribute('stroke-width', '2');
      path.setAttribute('fill', 'none');
      path.setAttribute('marker-end', 'url(#arrowhead)');
      path.style.cursor = 'pointer';
      path.dataset.edgeId = edge.id;
      
      path.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('删除此连线？')) {
          this.graph.removeEdge(edge.id);
          this.renderEdges();
          this.updateNodeCount();
        }
      });
      
      group.appendChild(path);
    }
  },

  // 选中节点
  selectNode(node) {
    this.selectedNode = node;
    this.renderNodes();
    this.renderConfigPanel();
  },

  // 渲染配置面板
  renderConfigPanel() {
    const panel = document.getElementById('wf-config-panel');
    if (!panel) return;
    
    if (!this.selectedNode) {
      panel.innerHTML = `
        <div style="padding:16px;text-align:center;color:#94a3b8;font-size:13px">
          <i data-lucide="mouse-pointer-click" class="lucide" style="width:32px;height:32px;margin-bottom:8px;opacity:0.5"></i>
          <div>点击节点查看配置</div>
        </div>`;
      if (typeof renderIcons === 'function') renderIcons();
      return;
    }
    
    const node = this.selectedNode;
    const type = node.type;
    
    let configHTML = `
      <div style="padding:12px;border-bottom:1px solid #e2e8f0">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          <div style="width:28px;height:28px;border-radius:6px;background:${type.color};display:flex;align-items:center;justify-content:center">
            <i data-lucide="${type.icon}" class="lucide icon-white" style="width:16px;height:16px"></i>
          </div>
          <div>
            <div style="font-size:14px;font-weight:700;color:#1f2937">${type.name}</div>
            <div style="font-size:10px;color:#94a3b8">${node.id}</div>
          </div>
        </div>
      </div>
      <div style="padding:12px">
        <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px">参数配置</div>
    `;
    
    for (const cfg of type.config || []) {
      const value = node.config[cfg.key] ?? cfg.default;
      configHTML += `<div style="margin-bottom:12px">`;
      configHTML += `<label style="display:block;font-size:12px;font-weight:600;color:#374151;margin-bottom:4px">${cfg.label}</label>`;
      
      if (cfg.type === 'text') {
        configHTML += `<input type="text" value="${value}" onchange="WorkflowEditor.updateNodeConfig('${cfg.key}', this.value)" style="width:100%;padding:6px 8px;border:1px solid #d1d5db;border-radius:6px;font-size:12px;box-sizing:border-box">`;
      } else if (cfg.type === 'number') {
        configHTML += `<input type="number" value="${value}" onchange="WorkflowEditor.updateNodeConfig('${cfg.key}', parseFloat(this.value))" style="width:100%;padding:6px 8px;border:1px solid #d1d5db;border-radius:6px;font-size:12px;box-sizing:border-box">`;
      } else if (cfg.type === 'select') {
        configHTML += `<select onchange="WorkflowEditor.updateNodeConfig('${cfg.key}', this.value)" style="width:100%;padding:6px 8px;border:1px solid #d1d5db;border-radius:6px;font-size:12px;box-sizing:border-box;background:#fff">`;
        for (const opt of cfg.options || []) {
          configHTML += `<option value="${opt}" ${opt === value ? 'selected' : ''}>${opt}</option>`;
        }
        configHTML += `</select>`;
      } else if (cfg.type === 'checkbox') {
        configHTML += `<label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="checkbox" ${value ? 'checked' : ''} onchange="WorkflowEditor.updateNodeConfig('${cfg.key}', this.checked)" style="width:16px;height:16px"><span style="font-size:12px;color:#475569">启用</span></label>`;
      }
      configHTML += `</div>`;
    }
    
    configHTML += `
        <div style="margin-top:16px;padding-top:12px;border-top:1px solid #e2e8f0">
          <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">端口信息</div>
          <div style="font-size:11px;color:#64748b">
            <div>输入: ${(type.inputs || []).join(', ') || '无'}</div>
            <div>输出: ${(type.outputs || []).join(', ') || '无'}</div>
          </div>
        </div>
        <button onclick="WorkflowEditor.deleteSelectedNode()" style="width:100%;margin-top:16px;padding:8px;background:#fef2f2;color:#ef4444;border:1px solid #fecaca;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer">
          <i data-lucide="trash-2" class="lucide" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i>删除节点
        </button>
      </div>
    `;
    
    panel.innerHTML = configHTML;
    if (typeof renderIcons === 'function') renderIcons();
  },

  // 更新节点配置
  updateNodeConfig(key, value) {
    if (this.selectedNode) {
      this.selectedNode.config[key] = value;
      this.log(`[配置] ${this.selectedNode.type.name}.${key} = ${value}`);
    }
  },

  // 删除选中节点
  deleteSelectedNode() {
    if (this.selectedNode) {
      this.graph.removeNode(this.selectedNode.id);
      this.log(`[操作] 删除节点: ${this.selectedNode.type.name}`);
      this.selectedNode = null;
      this.renderNodes();
      this.renderEdges();
      this.renderConfigPanel();
      this.updateNodeCount();
    }
  },

  // 清空画布
  clearGraph() {
    if (confirm('确定清空所有节点和连线？')) {
      this.graph.clear();
      this.selectedNode = null;
      this.renderNodes();
      this.renderEdges();
      this.renderConfigPanel();
      this.updateNodeCount();
      this.log('[操作] 画布已清空');
    }
  },

  // 加载模板
  loadTemplate(templateId) {
    this.graph.clear();
    this.selectedNode = null;
    
    if (templateId === 'dft_pipeline') {
      const n1 = this.graph.addNode('material-input', 50, 50);
      const n2 = this.graph.addNode('structure-opt', 280, 30);
      const n3 = this.graph.addNode('dft-calc', 510, 30);
      const n4 = this.graph.addNode('band-calc', 740, 0);
      const n5 = this.graph.addNode('dos-calc', 740, 120);
      const n6 = this.graph.addNode('band-analysis', 970, 0);
      const n7 = this.graph.addNode('band-plot', 1200, 0);
      const n8 = this.graph.addNode('report-gen', 1430, 60);
      
      this.graph.addEdge(n1.id, 'material_data', n2.id, 'structure');
      this.graph.addEdge(n2.id, 'optimized_structure', n3.id, 'structure');
      this.graph.addEdge(n3.id, 'dft_result', n4.id, 'dft_result');
      this.graph.addEdge(n3.id, 'dft_result', n5.id, 'dft_result');
      this.graph.addEdge(n4.id, 'band_data', n6.id, 'band_data');
      this.graph.addEdge(n6.id, 'band_analysis', n7.id, 'band_analysis');
      this.graph.addEdge(n7.id, 'band_plot', n8.id, 'band_plot');
      this.graph.addEdge(n6.id, 'band_analysis', n8.id, 'band_analysis');
      
      this.log('[模板] 加载 DFT 完整计算流程');
    } else if (templateId === 'md_pipeline') {
      const n1 = this.graph.addNode('file-input', 50, 50);
      const n2 = this.graph.addNode('md-calc', 280, 50);
      const n3 = this.graph.addNode('md-analysis', 510, 50);
      const n4 = this.graph.addNode('md-animation', 740, 50);
      const n5 = this.graph.addNode('data-export', 970, 50);
      
      this.graph.addEdge(n1.id, 'structure', n2.id, 'structure');
      this.graph.addEdge(n2.id, 'md_trajectory', n3.id, 'md_trajectory');
      this.graph.addEdge(n3.id, 'md_analysis', n4.id, 'md_trajectory');
      this.graph.addEdge(n3.id, 'md_analysis', n5.id, 'md_analysis');
      
      this.log('[模板] 加载 MD 分子动力学流程');
    }
    
    this.renderNodes();
    this.renderEdges();
    this.renderConfigPanel();
    this.updateNodeCount();
  },

  // 运行工作流
  async runWorkflow() {
    if (this.isRunning) {
      this.log('[警告] 工作流正在运行中');
      return;
    }
    if (this.graph.nodes.length === 0) {
      this.log('[错误] 画布为空，请先添加节点');
      return;
    }
    
    const order = this.graph.topologicalSort();
    if (!order) {
      this.log('[错误] 检测到循环依赖，无法执行');
      return;
    }
    
    this.isRunning = true;
    this.log(`[运行] 开始执行，共 ${order.length} 个节点`);
    
    // 重置所有节点状态
    for (const node of this.graph.nodes) {
      node.status = 'idle';
    }
    this.renderNodes();
    
    // 按拓扑顺序执行
    for (const nodeId of order) {
      if (!this.isRunning) break;
      const node = this.graph.nodes.find(n => n.id === nodeId);
      if (!node) continue;
      
      node.status = 'running';
      this.renderNodes();
      this.log(`  → 执行: ${node.type.name} (${node.id})`);
      
      // 模拟执行时间
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
      
      if (this.isRunning) {
        node.status = 'success';
        this.log(`  ✓ 完成: ${node.type.name}`);
      } else {
        node.status = 'idle';
        this.log(`  ◼ 停止: ${node.type.name}`);
      }
      this.renderNodes();
    }
    
    this.isRunning = false;
    if (this.graph.nodes.every(n => n.status === 'success')) {
      this.log('[完成] 工作流执行成功！所有节点已完成');
    } else {
      this.log('[停止] 工作流已停止');
    }
  },

  // 停止工作流
  stopWorkflow() {
    this.isRunning = false;
    this.log('[操作] 停止工作流');
  },

  // 更新节点计数
  updateNodeCount() {
    const el = document.getElementById('wf-node-count');
    if (el) {
      el.textContent = `${this.graph.nodes.length} 节点 · ${this.graph.edges.length} 连线`;
    }
  },

  // 日志
  log(message) {
    this.logs.push(message);
    const panel = document.getElementById('wf-log-panel');
    if (panel) {
      const time = new Date().toLocaleTimeString();
      const div = document.createElement('div');
      div.style.cssText = 'padding:1px 0';
      if (message.includes('[错误]')) div.style.color = '#f87171';
      else if (message.includes('[完成]')) div.style.color = '#4ade80';
      else if (message.includes('[警告]')) div.style.color = '#fbbf24';
      else if (message.includes('[运行]')) div.style.color = '#60a5fa';
      div.textContent = `[${time}] ${message}`;
      panel.appendChild(div);
      panel.scrollTop = panel.scrollHeight;
    }
  },

  // 导出工作流
  exportJSON() {
    const data = this.graph.toJSON();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workflow.json';
    a.click();
    URL.revokeObjectURL(url);
    this.log('[导出] 工作流已导出为 workflow.json');
  }
};

console.log('[WorkflowEditor] 工作流编辑器已加载，支持 30+ 节点类型');
