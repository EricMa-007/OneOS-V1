/**
 * UniSci Platform V2 - 板块6: 工作流系统
 * 包含: 工作流管理/列表/模板市场/画布编辑器/节点/连线/参数配置/执行/日志
 */

'use strict';

// ============================================================
// 一、节点类型定义
// ============================================================
const WorkflowNodes = {
  // 输入类
  input: [
    { type: 'material_input', name: '材料数据输入', icon: 'database', color: '#5ba3d9', category: 'input', params: [{key:'source',label:'数据来源',type:'select',options:['材料库','上传文件','手动输入']},{key:'material_id',label:'材料ID',type:'text'}] },
    { type: 'file_input', name: '文件输入', icon: 'file-up', color: '#5ba3d9', category: 'input', params: [{key:'file_type',label:'文件类型',type:'select',options:['POSCAR','CIF','XYZ','JSON','CSV']}] },
    { type: 'parameter_input', name: '参数输入', icon: 'sliders', color: '#5ba3d9', category: 'input', params: [{key:'param_name',label:'参数名',type:'text'},{key:'param_value',label:'参数值',type:'text'}] }
  ],
  // 计算类
  compute: [
    { type: 'structure_optimize', name: '结构优化', icon: 'atom', color: '#ff6b4a', category: 'compute', params: [{key:'software',label:'计算软件',type:'select',options:['VASP','Quantum ESPRESSO','ABACUS']},{key:'encut',label:'截断能(eV)',type:'number',default:500},{key:'kpoints',label:'K点网格',type:'text',default:'12x12x1'}] },
    { type: 'scf_calculation', name: '自洽计算', icon: 'activity', color: '#ff6b4a', category: 'compute', params: [{key:'software',label:'计算软件',type:'select',options:['VASP','QE','ABACUS']},{key:'xc',label:'交换关联泛函',type:'select',options:['PBE','LDA','HSE06']}] },
    { type: 'band_calculation', name: '能带计算', icon: 'trending-up', color: '#ff6b4a', category: 'compute', params: [{key:'path',label:'高对称路径',type:'text',default:'Γ-M-K-Γ'}] },
    { type: 'dos_calculation', name: '态密度计算', icon: 'bar-chart-2', color: '#ff6b4a', category: 'compute', params: [{key:'nedos',label:'DOS点数',type:'number',default:301}] },
    { type: 'md_simulation', name: '分子动力学', icon: 'dna', color: '#ff6b4a', category: 'compute', params: [{key:'ensemble',label:'系综',type:'select',options:['NVT','NPT','NVE']},{key:'temperature',label:'温度(K)',type:'number',default:300},{key:'steps',label:'步数',type:'number',default:10000}] }
  ],
  // 分析类
  analysis: [
    { type: 'band_analysis', name: '能带分析', icon: 'zap', color: '#5ccf8e', category: 'analysis', params: [{key:'bandgap',label:'计算带隙',type:'checkbox',default:true}] },
    { type: 'dos_analysis', name: '态密度分析', icon: 'pie-chart', color: '#5ccf8e', category: 'analysis', params: [{key:'pdos',label:'投影DOS',type:'checkbox',default:true}] },
    { type: 'property_predict', name: '性质预测', icon: 'brain', color: '#5ccf8e', category: 'analysis', params: [{key:'model',label:'预测模型',type:'select',options:['ML模型','经验公式','第一性原理']}] }
  ],
  // 可视化类
  visualization: [
    { type: 'band_plot', name: '能带图绘制', icon: 'line-chart', color: '#9b7ed8', category: 'visualization', params: [{key:'format',label:'输出格式',type:'select',options:['PNG','SVG','PDF']}] },
    { type: 'dos_plot', name: 'DOS图绘制', icon: 'bar-chart-3', color: '#9b7ed8', category: 'visualization', params: [{key:'format',label:'输出格式',type:'select',options:['PNG','SVG','PDF']}] },
    { type: 'structure_view', name: '结构可视化', icon: 'box', color: '#9b7ed8', category: 'visualization', params: [{key:'style',label:'显示风格',type:'select',options:['球棍','空间填充','线框']}] }
  ],
  // 输出类
  output: [
    { type: 'result_export', name: '结果导出', icon: 'download', color: '#ffc857', category: 'output', params: [{key:'format',label:'导出格式',type:'select',options:['JSON','CSV','PDF','Excel']}] },
    { type: 'notebook_export', name: '导出Notebook', icon: 'notebook-pen', color: '#ffc857', category: 'output', params: [{key:'include_code',label:'包含代码',type:'checkbox',default:true}] },
    { type: 'report_generate', name: '生成报告', icon: 'file-text', color: '#ffc857', category: 'output', params: [{key:'template',label:'报告模板',type:'select',options:['标准报告','简洁报告','详细报告']}] }
  ],
  // 控制类
  control: [
    { type: 'condition', name: '条件判断', icon: 'git-branch', color: '#5cc9c9', category: 'control', params: [{key:'condition',label:'条件表达式',type:'text'}] },
    { type: 'loop', name: '循环', icon: 'repeat', color: '#5cc9c9', category: 'control', params: [{key:'iterations',label:'迭代次数',type:'number',default:10}] },
    { type: 'parallel', name: '并行执行', icon: 'layers', color: '#5cc9c9', category: 'control', params: [{key:'max_concurrent',label:'最大并发',type:'number',default:4}] }
  ]
};

// 获取所有节点类型
function getAllNodeTypes() {
  return Object.values(WorkflowNodes).flat();
}

// ============================================================
// 二、工作流模板
// ============================================================
const WorkflowTemplates = [
  {
    id: 'tpl_dft_full',
    name: 'DFT 完整计算流程',
    description: '结构优化→自洽→能带→态密度→分析→可视化',
    icon: 'atom',
    color: '#ff6b4a',
    nodes: [
      { type: 'material_input', x: 50, y: 100 },
      { type: 'structure_optimize', x: 250, y: 100 },
      { type: 'scf_calculation', x: 450, y: 100 },
      { type: 'band_calculation', x: 650, y: 50 },
      { type: 'dos_calculation', x: 650, y: 150 },
      { type: 'band_plot', x: 850, y: 50 },
      { type: 'dos_plot', x: 850, y: 150 }
    ],
    connections: [
      { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 2, to: 4 },
      { from: 3, to: 5 }, { from: 4, to: 6 }
    ]
  },
  {
    id: 'tpl_md_analysis',
    name: 'MD 模拟与分析',
    description: '分子动力学模拟→轨迹分析→性质计算',
    icon: 'dna',
    color: '#5ba3d9',
    nodes: [
      { type: 'file_input', x: 50, y: 100 },
      { type: 'md_simulation', x: 250, y: 100 },
      { type: 'property_predict', x: 450, y: 100 },
      { type: 'report_generate', x: 650, y: 100 }
    ],
    connections: [{ from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 }]
  },
  {
    id: 'tpl_ml_material',
    name: 'ML 材料性质预测',
    description: '数据输入→特征工程→模型训练→预测→可视化',
    icon: 'brain',
    color: '#9b7ed8',
    nodes: [
      { type: 'material_input', x: 50, y: 100 },
      { type: 'parameter_input', x: 50, y: 200 },
      { type: 'property_predict', x: 250, y: 150 },
      { type: 'band_plot', x: 450, y: 100 },
      { type: 'result_export', x: 450, y: 200 }
    ],
    connections: [{ from: 0, to: 2 }, { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 2, to: 4 }]
  },
  {
    id: 'tpl_band_dos',
    name: '能带与态密度计算',
    description: '快速计算能带结构和态密度',
    icon: 'trending-up',
    color: '#5ccf8e',
    nodes: [
      { type: 'material_input', x: 50, y: 100 },
      { type: 'scf_calculation', x: 250, y: 100 },
      { type: 'band_calculation', x: 450, y: 50 },
      { type: 'dos_calculation', x: 450, y: 150 },
      { type: 'band_analysis', x: 650, y: 50 },
      { type: 'dos_analysis', x: 650, y: 150 }
    ],
    connections: [{ from: 0, to: 1 }, { from: 1, to: 2 }, { from: 1, to: 3 }, { from: 2, to: 4 }, { from: 3, to: 5 }]
  }
];

// ============================================================
// 三、工作流管理器
// ============================================================
const WorkflowManager = {
  // 标准化workflow数据（兼容mock-data.js中的不完整数据）
  normalizeWorkflow(wf) {
    if (!wf) return null;
    // 标题标准化：name → title
    const title = wf.title || wf.name || '未命名工作流';
    // 节点标准化：确保是数组且每个节点有必要字段
    let nodes = Array.isArray(wf.nodes) ? wf.nodes : [];
    if (nodes.length === 0 && typeof wf.steps === 'number') {
      // 从steps数量生成默认节点
      const defaultTypes = ['input_material', 'compute_dft', 'analysis_band', 'analysis_dos', 'output_report'];
      nodes = [];
      for (let i = 0; i < Math.min(wf.steps, 5); i++) {
        nodes.push({
          id: 'node_' + i,
          type: defaultTypes[i % defaultTypes.length],
          x: 40 + i * 180,
          y: 60 + (i % 2) * 100,
          status: wf.status === 'running' ? (i < Math.floor((wf.progress || 0) / 20) ? 'completed' : i === Math.floor((wf.progress || 0) / 20) ? 'running' : 'pending') : wf.status === 'completed' ? 'completed' : 'pending'
        });
      }
    }
    // 确保每个节点有id和坐标
    nodes = nodes.map((n, idx) => ({
      id: n.id || ('node_' + idx),
      type: n.type || 'compute_dft',
      x: n.x !== undefined ? n.x : 40 + idx * 180,
      y: n.y !== undefined ? n.y : 60 + (idx % 2) * 100,
      status: n.status || 'pending'
    }));
    // 连线标准化
    let connections = Array.isArray(wf.connections) ? wf.connections : [];
    if (connections.length === 0 && nodes.length > 1) {
      // 生成默认连线
      connections = [];
      for (let i = 0; i < nodes.length - 1; i++) {
        connections.push({ from: i, to: i + 1 });
      }
    }
    // 日志标准化
    let logs = Array.isArray(wf.logs) ? wf.logs : [];
    if (logs.length === 0 && wf.currentStep) {
      logs = [{ time: new Date().toLocaleTimeString(), level: 'INFO', msg: '当前步骤：' + wf.currentStep }];
    }
    // 返回标准化后的完整对象
    return {
      id: wf.id || ('wf_' + Date.now()),
      title: title,
      name: title,
      description: wf.description || '',
      template: wf.template || '',
      status: wf.status || 'draft',
      progress: wf.progress || 0,
      steps: wf.steps || nodes.length,
      currentStep: wf.currentStep || '',
      icon: wf.icon || 'workflow',
      createdAt: wf.createdAt || wf.updatedAt || '未知',
      updatedAt: wf.updatedAt || wf.createdAt || '未知',
      nodes: nodes,
      connections: connections,
      logs: logs
    };
  },
  
  getAll() {
    const user = UserManager.getCurrentUser();
    if (!user) return [];
    let workflows = user.workflows;
    if (!workflows || !Array.isArray(workflows) || workflows.length === 0) {
      workflows = this.initDefaults(user);
    }
    // 标准化每个workflow数据
    return workflows.map(wf => this.normalizeWorkflow(wf)).filter(wf => wf !== null);
  },
  
  initDefaults(user) {
    user.workflows = [
      {
        id: 'wf_001',
        title: 'MoS₂ 能带结构计算工作流',
        description: '基于DFT的完整能带计算流程',
        template: 'tpl_dft_full',
        status: 'running',
        progress: 45,
        createdAt: '2026-08-18',
        updatedAt: '2026-08-20 14:30',
        nodes: WorkflowTemplates[0].nodes.map((n,i) => ({...n, id: 'node_'+i, status: i<2?'completed':i===2?'running':'pending'})),
        connections: WorkflowTemplates[0].connections,
        logs: [
          { time: '14:25:01', level: 'INFO', msg: '工作流启动' },
          { time: '14:25:05', level: 'INFO', msg: '节点[材料数据输入]执行完成' },
          { time: '14:26:30', level: 'INFO', msg: '节点[结构优化]执行完成，耗时85s' },
          { time: '14:26:35', level: 'INFO', msg: '节点[自洽计算]开始执行...' }
        ]
      },
      {
        id: 'wf_002',
        title: '分子动力学：水的扩散系数',
        description: 'NVT系综MD模拟计算扩散系数',
        template: 'tpl_md_analysis',
        status: 'completed',
        progress: 100,
        createdAt: '2026-08-15',
        updatedAt: '2026-08-16 10:20',
        nodes: WorkflowTemplates[1].nodes.map((n,i) => ({...n, id: 'node_'+i, status: 'completed'})),
        connections: WorkflowTemplates[1].connections,
        logs: [{ time: '10:00:00', level: 'INFO', msg: '工作流启动' }, { time: '10:20:15', level: 'INFO', msg: '工作流执行完成，总耗时1215s' }]
      },
      {
        id: 'wf_003',
        title: 'ML预测：二维材料带隙',
        description: '使用机器学习模型预测带隙',
        template: 'tpl_ml_material',
        status: 'draft',
        progress: 0,
        createdAt: '2026-08-19',
        updatedAt: '2026-08-19 16:45',
        nodes: WorkflowTemplates[2].nodes.map((n,i) => ({...n, id: 'node_'+i, status: 'pending'})),
        connections: WorkflowTemplates[2].connections,
        logs: []
      }
    ];
    return user.workflows;
  },
  
  get(id) {
    return this.getAll().find(wf => wf.id === id) || null;
  },
  
  create(templateId) {
    const user = UserManager.getCurrentUser();
    const tpl = WorkflowTemplates.find(t => t.id === templateId) || WorkflowTemplates[0];
    const wf = {
      id: 'wf_' + Date.now(),
      title: tpl.name + ' (副本)',
      description: tpl.description,
      template: templateId,
      status: 'draft',
      progress: 0,
      createdAt: new Date().toLocaleDateString('zh-CN'),
      updatedAt: new Date().toLocaleString('zh-CN'),
      nodes: tpl.nodes.map((n,i) => ({...n, id: 'node_'+i, status: 'pending'})),
      connections: tpl.connections,
      logs: []
    };
    user.workflows.unshift(wf);
    return wf;
  },
  
  delete(id) {
    const user = UserManager.getCurrentUser();
    user.workflows = user.workflows.filter(wf => wf.id !== id);
  },
  
  // 执行工作流（模拟）
  execute(wfId) {
    const wf = this.get(wfId);
    if (!wf) return;
    wf.status = 'running';
    wf.progress = 0;
    wf.logs.push({ time: new Date().toLocaleTimeString(), level: 'INFO', msg: '工作流启动' });
    
    let nodeIdx = 0;
    const interval = setInterval(() => {
      if (nodeIdx >= wf.nodes.length) {
        clearInterval(interval);
        wf.status = 'completed';
        wf.progress = 100;
        wf.logs.push({ time: new Date().toLocaleTimeString(), level: 'INFO', msg: '工作流执行完成' });
        if (typeof WorkflowEditor !== 'undefined') WorkflowEditor.refresh();
        return;
      }
      const node = wf.nodes[nodeIdx];
      node.status = 'running';
      wf.progress = Math.round((nodeIdx / wf.nodes.length) * 100);
      
      setTimeout(() => {
        node.status = 'completed';
        const nodeType = getAllNodeTypes().find(t => t.type === node.type);
        wf.logs.push({ time: new Date().toLocaleTimeString(), level: 'INFO', msg: `节点[${nodeType?.name || node.type}]执行完成` });
        if (typeof WorkflowEditor !== 'undefined') WorkflowEditor.refresh();
      }, 1500);
      
      nodeIdx++;
      if (typeof WorkflowEditor !== 'undefined') WorkflowEditor.refresh();
    }, 2000);
  },
  
  stop(wfId) {
    const wf = this.get(wfId);
    if (!wf) return;
    wf.status = 'stopped';
    wf.logs.push({ time: new Date().toLocaleTimeString(), level: 'WARN', msg: '工作流已停止' });
  }
};

// ============================================================
// 四、列表渲染器
// ============================================================
const WorkflowListRenderer = {
  currentTab: 'all',
  
  render() {
    this.renderTabs();
    this.renderList();
  },
  
  renderTabs() {
    const container = document.getElementById('workflow-tabs');
    if (!container) return;
    const all = WorkflowManager.getAll();
    const counts = {
      all: all.length,
      running: all.filter(w => w.status === 'running').length,
      completed: all.filter(w => w.status === 'completed').length,
      draft: all.filter(w => w.status === 'draft').length
    };
    container.innerHTML = `
      <div class="tab-bar">
        ${[
          {id:'all',name:'全部'},
          {id:'running',name:'运行中'},
          {id:'completed',name:'已完成'},
          {id:'draft',name:'草稿'}
        ].map(tab => `<button class="tab-item ${this.currentTab===tab.id?'active':''}" onclick="WorkflowListRenderer.setTab('${tab.id}')">${tab.name}${counts[tab.id]>0?` (${counts[tab.id]})`:''}</button>`).join('')}
      </div>
    `;
  },
  
  setTab(tab) {
    this.currentTab = tab;
    this.render();
  },
  
  renderList() {
    const container = document.getElementById('workflow-list');
    if (!container) return;
    let workflows = WorkflowManager.getAll();
    
    if (this.currentTab !== 'all') {
      workflows = workflows.filter(w => w.status === this.currentTab);
    }
    
    if (workflows.length === 0) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">🔀</div><div class="empty-text">暂无工作流，从模板创建或新建空白工作流</div></div>`;
      return;
    }
    
    container.innerHTML = workflows.map(wf => {
      const statusBadge = wf.status==='running'?'<span class="card-badge badge-running"><span class="badge-dot-icon"></span>运行中</span>':
                         wf.status==='completed'?'<span class="card-badge badge-completed">已完成</span>':
                         '<span class="card-badge" style="background:#f3f4f6;color:#6b7280">草稿</span>';
      return `
        <div class="card" onclick="navigateTo('page-workflow-editor','${_store(wf)}')">
          <div class="card-header">
            <div class="card-title"><i data-lucide="workflow" class="lucide" style="width:16px;height:16px;color:var(--purple)"></i>${wf.title}</div>
            ${statusBadge}
          </div>
          <div style="font-size:12px;color:var(--text3);margin-bottom:10px">${wf.description}</div>
          <div class="job-meta">
            <span><i data-lucide="layers" class="lucide" style="width:13px;height:13px"></i>${wf.nodes.length} 节点</span>
            <span>${wf.updatedAt}</span>
          </div>
          ${wf.status==='running'?`<div class="progress-track" style="margin-top:10px"><div class="progress-fill pf-purple" style="width:${wf.progress}%"></div></div><div style="font-size:11px;color:var(--text3);margin-top:4px">进度: ${wf.progress}%</div>`:''}
        </div>
      `;
    }).join('');
    if (typeof renderIcons === 'function') renderIcons();
  },
  
  showTemplateMarket() {
    UI.dialog.actionSheet({
      title: '从模板创建工作流',
      actions: WorkflowTemplates.map(tpl => ({
        label: tpl.name,
        icon: tpl.icon,
        onClick: () => {
          const wf = WorkflowManager.create(tpl.id);
          UI.toast.success('已从模板创建工作流');
          navigateTo('page-workflow-editor', _store(wf));
        }
      }))
    });
  }
};

// ============================================================
// 五、工作流编辑器
// ============================================================
const WorkflowEditor = {
  currentWorkflow: null,
  selectedNodeId: null,
  showLogPanel: false,
  showNodePanel: false,
  
  init(wf) {
    try {
      if (!wf || !wf.id) {
        const all = WorkflowManager.getAll();
        wf = all.length > 0 ? all[0] : null;
      }
      if (!wf) {
        console.warn('[WorkflowEditor] 无可用工作流');
        return;
      }
      this.currentWorkflow = WorkflowManager.get(wf.id) || WorkflowManager.normalizeWorkflow(wf) || wf;
      this.selectedNodeId = null;
      this.showLogPanel = false;
      this.showNodePanel = false;
      this.render();
    } catch (e) {
      console.error('[WorkflowEditor] init失败:', e);
      if (typeof UI !== 'undefined' && UI.toast) UI.toast.error('工作流编辑器初始化失败');
    }
  },
  
  render() {
    const wf = this.currentWorkflow;
    if (!wf) return;
    
    // 标题
    const titleEl = document.getElementById('workflow-title');
    if (titleEl) titleEl.textContent = wf.title;
    
    // 工具栏
    this.renderToolbar();
    
    // 画布
    this.renderCanvas();
    
    // 日志面板
    if (this.showLogPanel) this.renderLogPanel();
    
    // 节点配置面板
    if (this.showNodePanel && this.selectedNodeId) this.renderNodePanel();
  },
  
  renderToolbar() {
    const wf = this.currentWorkflow;
    const container = document.getElementById('workflow-toolbar');
    if (!container) return;
    
    const canExecute = wf.status === 'draft' || wf.status === 'stopped' || wf.status === 'completed';
    
    container.innerHTML = `
      <div style="display:flex;gap:6px;align-items:center;padding:8px 12px;background:var(--card);border-radius:12px;margin-bottom:12px;overflow-x:auto">
        ${canExecute ? 
          `<button class="btn btn-primary" style="padding:6px 14px;font-size:12px" onclick="WorkflowEditor.execute()"><i data-lucide="play" class="lucide icon-white" style="width:14px;height:14px"></i>执行</button>` :
          `<button class="btn btn-secondary" style="padding:6px 14px;font-size:12px;color:var(--primary)" onclick="WorkflowEditor.stop()"><i data-lucide="square" class="lucide" style="width:14px;height:14px"></i>停止</button>`
        }
        <button class="icon-btn" onclick="WorkflowEditor.save()" title="保存"><i data-lucide="save" class="lucide" style="width:16px;height:16px"></i></button>
        <div style="width:1px;height:20px;background:var(--border)"></div>
        <button class="icon-btn" onclick="WorkflowEditor.showAddNode()" title="添加节点"><i data-lucide="plus" class="lucide" style="width:16px;height:16px"></i></button>
        <button class="icon-btn" onclick="WorkflowEditor.toggleLogPanel()" title="日志"><i data-lucide="terminal" class="lucide" style="width:16px;height:16px"></i></button>
        <button class="icon-btn" onclick="WorkflowEditor.exportWorkflow()" title="导出"><i data-lucide="download" class="lucide" style="width:16px;height:16px"></i></button>
        <div style="margin-left:auto;display:flex;align-items:center;gap:6px">
          <span style="font-size:11px;color:var(--text3)">${wf.nodes.length} 节点</span>
          ${wf.status==='running'?`<span style="font-size:11px;color:var(--primary);font-weight:600">${wf.progress}%</span>`:''}
        </div>
      </div>
    `;
    if (typeof renderIcons === 'function') renderIcons();
  },
  
  renderCanvas() {
    const wf = this.currentWorkflow;
    const container = document.getElementById('workflow-canvas');
    if (!container) return;
    
    // 计算画布尺寸
    const maxX = Math.max(...wf.nodes.map(n => n.x || 0)) + 200;
    const maxY = Math.max(...wf.nodes.map(n => n.y || 0)) + 120;
    
    container.innerHTML = `
      <div style="position:relative;width:${maxX}px;height:${maxY}px;min-width:100%;overflow:auto">
        <!-- 连线SVG -->
        <svg style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none">
          ${wf.connections.map(conn => {
            const from = wf.nodes[conn.from];
            const to = wf.nodes[conn.to];
            if (!from || !to) return '';
            const x1 = (from.x || 0) + 160;
            const y1 = (from.y || 0) + 40;
            const x2 = (to.x || 0);
            const y2 = (to.y || 0) + 40;
            const midX = (x1 + x2) / 2;
            return `<path d="M${x1},${y1} C${midX},${y1} ${midX},${y2} ${x2},${y2}" fill="none" stroke="#c0c8d0" stroke-width="2" marker-end="url(#arrowhead)"/>`;
          }).join('')}
          <defs><marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#c0c8d0"/></marker></defs>
        </svg>
        <!-- 节点 -->
        ${wf.nodes.map((node, idx) => {
          const nodeType = getAllNodeTypes().find(t => t.type === node.type);
          const color = nodeType?.color || '#999';
          const statusColor = node.status==='completed'?'var(--green)':node.status==='running'?'var(--primary)':'var(--border)';
          return `
            <div onclick="WorkflowEditor.selectNode('${node.id}')" style="position:absolute;left:${node.x||0}px;top:${node.y||0}px;width:160px;background:var(--card);border-radius:12px;box-shadow:var(--card-shadow);border:2px solid ${this.selectedNodeId===node.id?'var(--primary)':'transparent'};cursor:pointer;overflow:hidden">
              <div style="padding:10px 12px;background:${color}15;border-bottom:1px solid ${color}30;display:flex;align-items:center;gap:8px">
                <div style="width:28px;height:28px;background:${color};border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
                  <i data-lucide="${nodeType?.icon||'box'}" class="lucide icon-white" style="width:14px;height:14px"></i>
                </div>
                <div style="font-size:12px;font-weight:700;line-height:1.3">${nodeType?.name || node.type}</div>
              </div>
              <div style="padding:8px 12px;display:flex;justify-content:space-between;align-items:center">
                <span style="font-size:10px;color:var(--text3)">节点 ${idx+1}</span>
                <span style="width:8px;height:8px;border-radius:50%;background:${statusColor};${node.status==='running'?'animation:pulse 1s infinite':''}"></span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
    if (typeof renderIcons === 'function') renderIcons();
  },
  
  renderLogPanel() {
    const wf = this.currentWorkflow;
    const container = document.getElementById('workflow-log-panel');
    if (!container) return;
    container.innerHTML = `
      <div class="card" style="margin-top:12px">
        <div class="card-title" style="margin-bottom:10px"><i data-lucide="terminal" class="lucide" style="width:16px;height:16px;color:var(--green)"></i>执行日志 (${wf.logs.length})</div>
        <div style="background:#1e293b;color:#e2e8f0;padding:12px;border-radius:10px;font-family:monospace;font-size:11px;line-height:1.8;max-height:200px;overflow-y:auto">
          ${wf.logs.length === 0 ? '<div style="color:#64748b">暂无日志</div>' : wf.logs.map(log => `
            <div><span style="color:#64748b">[${log.time}]</span> <span style="color:${log.level==='ERROR'?'#f87171':log.level==='WARN'?'#fbbf24':'#6ee7b7'}">[${log.level}]</span> <span style="color:#e2e8f0">${log.msg}</span></div>
          `).join('')}
        </div>
      </div>
    `;
  },
  
  renderNodePanel() {
    const wf = this.currentWorkflow;
    const node = wf.nodes.find(n => n.id === this.selectedNodeId);
    if (!node) return;
    const nodeType = getAllNodeTypes().find(t => t.type === node.type);
    const container = document.getElementById('workflow-node-panel');
    if (!container) return;
    
    container.innerHTML = `
      <div class="card" style="margin-top:12px">
        <div class="card-title" style="margin-bottom:12px;display:flex;justify-content:space-between;align-items:center">
          <span><i data-lucide="settings" class="lucide" style="width:16px;height:16px;color:var(--blue)"></i>节点配置: ${nodeType?.name}</span>
          <button onclick="WorkflowEditor.closeNodePanel()" style="background:none;border:none;cursor:pointer"><i data-lucide="x" class="lucide" style="width:18px;height:18px;color:var(--text3)"></i></button>
        </div>
        ${(nodeType?.params || []).map(param => `
          <div class="form-group" style="margin-bottom:12px">
            <label class="form-label">${param.label}</label>
            ${param.type === 'select' ? 
              `<select class="form-select">${param.options.map(o => `<option>${o}</option>`).join('')}</select>` :
              param.type === 'checkbox' ?
              `<label style="display:flex;align-items:center;gap:8px"><input type="checkbox" ${param.default?'checked':''}> <span style="font-size:13px">启用</span></label>` :
              `<input class="form-input" type="${param.type||'text'}" value="${param.default||''}" placeholder="${param.label}">`
            }
          </div>
        `).join('')}
        <div style="display:flex;gap:8px;margin-top:16px">
          <button class="btn btn-primary" style="flex:1" onclick="WorkflowEditor.runSingleNode('${node.id}')"><i data-lucide="play" class="lucide icon-white" style="width:14px;height:14px"></i>运行此节点</button>
          <button class="btn btn-secondary" onclick="WorkflowEditor.deleteNode('${node.id}')"><i data-lucide="trash-2" class="lucide" style="width:14px;height:14px;color:var(--primary)"></i></button>
        </div>
      </div>
    `;
    if (typeof renderIcons === 'function') renderIcons();
  },
  
  selectNode(nodeId) {
    this.selectedNodeId = nodeId;
    this.showNodePanel = true;
    this.render();
  },
  
  closeNodePanel() {
    this.showNodePanel = false;
    this.selectedNodeId = null;
    this.render();
  },
  
  showAddNode() {
    const categories = Object.entries(WorkflowNodes);
    UI.dialog.actionSheet({
      title: '添加节点',
      actions: categories.flatMap(([cat, nodes]) => 
        nodes.map(n => ({ label: n.name, icon: n.icon, onClick: () => this.addNode(n.type) }))
      )
    });
  },
  
  addNode(type) {
    const wf = this.currentWorkflow;
    const newNode = {
      id: 'node_' + Date.now(),
      type: type,
      x: 50 + wf.nodes.length * 200,
      y: 100,
      status: 'pending'
    };
    wf.nodes.push(newNode);
    UI.toast.success('已添加节点');
    this.render();
  },
  
  deleteNode(nodeId) {
    const wf = this.currentWorkflow;
    wf.nodes = wf.nodes.filter(n => n.id !== nodeId);
    wf.connections = wf.connections.filter(c => {
      const fromNode = wf.nodes[c.from];
      const toNode = wf.nodes[c.to];
      return fromNode && toNode;
    });
    this.showNodePanel = false;
    this.selectedNodeId = null;
    UI.toast.success('已删除节点');
    this.render();
  },
  
  runSingleNode(nodeId) {
    const wf = this.currentWorkflow;
    const node = wf.nodes.find(n => n.id === nodeId);
    if (!node) return;
    node.status = 'running';
    UI.toast.info('节点开始执行...');
    this.render();
    setTimeout(() => {
      node.status = 'completed';
      wf.logs.push({ time: new Date().toLocaleTimeString(), level: 'INFO', msg: `节点单独执行完成` });
      this.render();
      UI.toast.success('节点执行完成');
    }, 2000);
  },
  
  execute() {
    UI.toast.info('工作流开始执行...');
    WorkflowManager.execute(this.currentWorkflow.id);
    this.render();
  },
  
  stop() {
    WorkflowManager.stop(this.currentWorkflow.id);
    UI.toast.info('工作流已停止');
    this.render();
  },
  
  save() {
    this.currentWorkflow.updatedAt = new Date().toLocaleString('zh-CN');
    UI.toast.success('工作流已保存');
  },
  
  toggleLogPanel() {
    this.showLogPanel = !this.showLogPanel;
    this.render();
  },
  
  exportWorkflow() {
    UI.dialog.actionSheet({
      title: '导出工作流',
      actions: [
        { label: '导出为 JSON', icon: 'file-code', onClick: () => UI.toast.success('已导出 JSON') },
        { label: '导出为图片', icon: 'image', onClick: () => UI.toast.success('已导出图片') },
        { label: '分享工作流', icon: 'share-2', onClick: () => UI.toast.info('已生成分享链接') }
      ]
    });
  },
  
  refresh() {
    this.render();
  }
};

console.log('[UniSci] 板块6 工作流系统已加载');
