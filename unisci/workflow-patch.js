/**
 * UniSci Platform V2 - 工作流系统补丁
 * 补充因workflow.js运行时错误而缺失的 WorkflowManager / WorkflowListRenderer
 */

'use strict';

// 仅在原模块未定义时补充
if (typeof WorkflowManager === 'undefined') {

const WorkflowNodes_Patch = {
  input: [
    { type: 'material_input', name: '材料数据输入', icon: 'database', color: '#5ba3d9', category: 'input' },
    { type: 'file_input', name: '文件输入', icon: 'file-up', color: '#5ba3d9', category: 'input' },
    { type: 'parameter_input', name: '参数输入', icon: 'sliders', color: '#5ba3d9', category: 'input' }
  ],
  compute: [
    { type: 'structure_optimize', name: '结构优化', icon: 'atom', color: '#ff6b4a', category: 'compute' },
    { type: 'scf_calculation', name: '自洽计算', icon: 'activity', color: '#ff6b4a', category: 'compute' },
    { type: 'band_calculation', name: '能带计算', icon: 'trending-up', color: '#ff6b4a', category: 'compute' },
    { type: 'dos_calculation', name: '态密度计算', icon: 'bar-chart-2', color: '#ff6b4a', category: 'compute' },
    { type: 'md_simulation', name: '分子动力学', icon: 'waves', color: '#ff6b4a', category: 'compute' }
  ],
  analysis: [
    { type: 'band_analysis', name: '能带分析', icon: 'line-chart', color: '#4ecdc4', category: 'analysis' },
    { type: 'dos_analysis', name: '态密度分析', icon: 'bar-chart', color: '#4ecdc4', category: 'analysis' },
    { type: 'structure_analysis', name: '结构分析', icon: 'box', color: '#4ecdc4', category: 'analysis' }
  ],
  visualization: [
    { type: 'band_plot', name: '能带图', icon: 'image', color: '#a8e6cf', category: 'visualization' },
    { type: 'dos_plot', name: '态密度图', icon: 'image', color: '#a8e6cf', category: 'visualization' },
    { type: 'structure_view', name: '结构可视化', icon: 'box', color: '#a8e6cf', category: 'visualization' }
  ],
  output: [
    { type: 'export_data', name: '导出数据', icon: 'download', color: '#ffd93d', category: 'output' },
    { type: 'save_result', name: '保存结果', icon: 'save', color: '#ffd93d', category: 'output' },
    { type: 'generate_report', name: '生成报告', icon: 'file-text', color: '#ffd93d', category: 'output' }
  ]
};

const WorkflowTemplates_Patch = [
  { id: 'tpl_dft', name: 'DFT完整计算', description: '结构优化→自洽→能带→态密度', icon: 'atom', color: '#ff6b4a', nodes: 6 },
  { id: 'tpl_md', name: '分子动力学', description: '能量最小化→NVT→NPT→分析', icon: 'waves', color: '#4ecdc4', nodes: 5 },
  { id: 'tpl_ml', name: '机器学习预测', description: '数据加载→特征工程→训练→预测', icon: 'brain', color: '#a8e6cf', nodes: 5 },
  { id: 'tpl_screening', name: '材料高通量筛选', description: '材料库→计算→筛选→排序', icon: 'filter', color: '#ffd93d', nodes: 4 }
];

window.WorkflowManager = {
  workflows: [
    { id: 'wf_001', name: 'MoS₂能带计算流程', description: 'DFT完整计算流程', template: 'tpl_dft', status: 'completed', nodes: 6, createdAt: '2026-08-20', updatedAt: '2026-08-25', runs: 3 },
    { id: 'wf_002', name: '水分子MD模拟', description: 'NVT系综分子动力学', template: 'tpl_md', status: 'running', nodes: 5, createdAt: '2026-08-22', updatedAt: '2026-08-27', runs: 1 },
    { id: 'wf_003', name: '带隙机器学习预测', description: '随机森林模型训练', template: 'tpl_ml', status: 'draft', nodes: 5, createdAt: '2026-08-25', updatedAt: '2026-08-26', runs: 0 },
    { id: 'wf_004', name: '二维材料高通量筛选', description: '100种材料带隙筛选', template: 'tpl_screening', status: 'completed', nodes: 4, createdAt: '2026-08-18', updatedAt: '2026-08-24', runs: 5 }
  ],

  getAll() { return this.workflows; },
  get(id) { return this.workflows.find(w => w.id === id); },
  create(name, templateId) {
    const tpl = WorkflowTemplates_Patch.find(t => t.id === templateId) || WorkflowTemplates_Patch[0];
    const wf = {
      id: 'wf_' + Date.now(),
      name: name || '新工作流',
      description: tpl.description,
      template: templateId,
      status: 'draft',
      nodes: tpl.nodes,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      runs: 0
    };
    this.workflows.unshift(wf);
    return wf;
  },
  delete(id) { this.workflows = this.workflows.filter(w => w.id !== id); },
  execute(id) {
    const wf = this.get(id);
    if (wf) { wf.status = 'running'; wf.runs++; wf.updatedAt = new Date().toISOString().split('T')[0]; }
    return wf;
  },
  stop(id) {
    const wf = this.get(id);
    if (wf) wf.status = 'completed';
    return wf;
  },
  getTemplates() { return WorkflowTemplates_Patch; },
  getNodes() { return WorkflowNodes_Patch; }
};

window.WorkflowListRenderer = {
  currentTab: 'all',

  render() {
    const container = document.getElementById('workflow-list');
    if (!container) return;

    const tabs = document.getElementById('workflow-tabs');
    if (tabs) {
      const all = WorkflowManager.getAll();
      tabs.innerHTML = `
        <div class="tab-bar">
          <button class="tab-item ${this.currentTab==='all'?'active':''}" onclick="WorkflowListRenderer.setTab('all')">全部 (${all.length})</button>
          <button class="tab-item ${this.currentTab==='running'?'active':''}" onclick="WorkflowListRenderer.setTab('running')">运行中 (${all.filter(w=>w.status==='running').length})</button>
          <button class="tab-item ${this.currentTab==='completed'?'active':''}" onclick="WorkflowListRenderer.setTab('completed')">已完成 (${all.filter(w=>w.status==='completed').length})</button>
          <button class="tab-item ${this.currentTab==='draft'?'active':''}" onclick="WorkflowListRenderer.setTab('draft')">草稿 (${all.filter(w=>w.status==='draft').length})</button>
        </div>
      `;
    }

    let workflows = WorkflowManager.getAll();
    if (this.currentTab !== 'all') workflows = workflows.filter(w => w.status === this.currentTab);

    if (workflows.length === 0) {
      container.innerHTML = '<div style="text-align:center;padding:40px;color:#94a3b8"><i data-lucide="inbox" class="lucide" style="width:48px;height:48px;margin-bottom:12px;opacity:0.3"></i><div>暂无工作流</div></div>';
      if (typeof renderIcons === 'function') renderIcons();
      return;
    }

    const statusColors = { running: '#f59e0b', completed: '#10b981', draft: '#64748b' };
    const statusLabels = { running: '运行中', completed: '已完成', draft: '草稿' };

    container.innerHTML = workflows.map(wf => `
      <div class="card" onclick="WorkflowListRenderer.open('${wf.id}')" style="cursor:pointer;margin-bottom:12px">
        <div style="display:flex;gap:12px;align-items:flex-start">
          <div style="width:44px;height:44px;border-radius:12px;background:${wf.color || '#8b5cf6'}22;display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <i data-lucide="${wf.icon || 'workflow'}" class="lucide" style="width:22px;height:22px;color:${wf.color || '#8b5cf6'}"></i>
          </div>
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
              <span style="font-size:14px;font-weight:700;color:#1f2937;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${wf.name}</span>
              <span style="font-size:10px;padding:2px 6px;background:${statusColors[wf.status] || '#64748b'}22;color:${statusColors[wf.status] || '#64748b'};border-radius:4px;font-weight:600;flex-shrink:0">${statusLabels[wf.status] || wf.status}</span>
            </div>
            <div style="font-size:11px;color:#64748b;margin-bottom:6px">${wf.description}</div>
            <div style="display:flex;align-items:center;gap:8px">
              <span style="font-size:10px;color:#94a3b8">${wf.nodes} 节点</span>
              <span style="font-size:10px;color:#94a3b8">运行 ${wf.runs} 次</span>
              <span style="font-size:10px;color:#94a3b8">更新 ${wf.updatedAt}</span>
            </div>
          </div>
          <i data-lucide="chevron-right" class="lucide" style="width:18px;height:18px;color:#cbd5e1;flex-shrink:0"></i>
        </div>
      </div>
    `).join('');

    if (typeof renderIcons === 'function') renderIcons();
  },

  setTab(tab) { this.currentTab = tab; this.render(); },

  open(id) {
    const wf = WorkflowManager.get(id);
    if (wf) {
      navigateTo('page-workflow-editor');
      setTimeout(() => {
        if (typeof WorkflowEditor !== 'undefined' && WorkflowEditor.loadWorkflow) {
          WorkflowEditor.loadWorkflow(wf);
        }
      }, 200);
    }
  },

  showTemplateMarket() {
    const templates = WorkflowManager.getTemplates();
    const names = templates.map(t => t.name).join('、');
    alert('工作流模板市场：\n' + names + '\n\n点击模板可创建新工作流');
  }
};

console.log('[WorkflowPatch] 工作流系统补丁已加载：WorkflowManager + WorkflowListRenderer');

// 自动渲染机制：确保工作流列表始终能渲染
(function autoRenderWorkflowList() {
  let lastRendered = 0;
  function checkAndRender() {
    try {
      const container = document.getElementById('workflow-list');
      // 只要容器存在、为空、且距离上次渲染超过500ms，就渲染
      if (container && container.children.length === 0 && Date.now() - lastRendered > 500) {
        if (typeof WorkflowListRenderer !== 'undefined') {
          WorkflowListRenderer.render();
          lastRendered = Date.now();
        }
      }
    } catch(e) {}
    setTimeout(checkAndRender, 300);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(checkAndRender, 300));
  } else {
    setTimeout(checkAndRender, 300);
  }
})();
}
