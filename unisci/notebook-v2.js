/**
 * UniSci Platform V2 - Notebook系统深度重构
 * 完整6大闭环：列表→编辑器、单元格操作、代码执行、内核切换、计算联动、导出分享
 */

'use strict';

// ============================================================
// 一、内核定义
// ============================================================
const NotebookKernelsV2 = {
  python: { id: 'python', name: 'Python 3', icon: 'code-2', color: '#3776ab', version: '3.11' },
  julia: { id: 'julia', name: 'Julia', icon: 'circle-dot', color: '#9558b2', version: '1.9' },
  r: { id: 'r', name: 'R', icon: 'r', color: '#276dc3', version: '4.3' },
  octave: { id: 'octave', name: 'Octave', icon: 'sigma', color: '#0079c1', version: '8.2' },
  nodejs: { id: 'nodejs', name: 'Node.js', icon: 'hexagon', color: '#68a063', version: '20' },
  bash: { id: 'bash', name: 'Bash', icon: 'terminal', color: '#4eaa25', version: '5.2' },
  sql: { id: 'sql', name: 'SQL', icon: 'database', color: '#e38c00', version: 'PostgreSQL 15' }
};

// ============================================================
// 二、示例笔记本数据
// ============================================================
const SampleNotebooks = [
  {
    id: 'nb_dft_analysis',
    title: 'MoS₂ 能带分析与可视化',
    kernel: 'python',
    icon: 'atom',
    color: '#3b82f6',
    starred: true,
    createdAt: '2026-08-20',
    updatedAt: '2026-08-27',
    tags: ['DFT', 'MoS₂', '能带结构', '可视化'],
    description: '使用pymatgen分析MoS₂的能带结构和态密度',
    cells: [
      { id: 'cell_001', type: 'markdown', content: '# MoS₂ 能带结构分析\n\n本Notebook演示如何使用pymatgen分析二维材料MoS₂的电子结构。', output: null, executionCount: null, status: 'idle' },
      { id: 'cell_002', type: 'code', content: '# 导入必要的库\nimport numpy as np\nimport matplotlib.pyplot as plt\nfrom pymatgen.electronic_structure.plotter import BSPlotter\n\nprint("库导入成功")', output: { type: 'text', content: '库导入成功' }, executionCount: 1, status: 'completed' },
      { id: 'cell_003', type: 'code', content: '# 加载能带结构数据\nfrom pymatgen.electronic_structure.bandstructure import BandStructure\n\n# 模拟加载数据\nbs_data = np.loadtxt("/data/MoS2_band.dat")\nprint(f"能带数据形状: {bs_data.shape}")\nprint(f"带隙: 1.71 eV")', output: { type: 'text', content: '能带数据形状: (100, 20)\n带隙: 1.71 eV' }, executionCount: 2, status: 'completed' },
      { id: 'cell_004', type: 'code', content: '# 绘制能带图\nfig, ax = plt.subplots(figsize=(8, 5))\nax.plot(bs_data[:, 0], bs_data[:, 1:], color="#3b82f6", alpha=0.7)\nax.axhline(y=0, color="red", linestyle="--", label="费米能级")\nax.set_xlabel("k-path")\nax.set_ylabel("Energy (eV)")\nax.set_title("MoS₂ Band Structure")\nax.legend()\nplt.tight_layout()\nplt.show()', output: { type: 'image', content: '[能带图 - 已生成]' }, executionCount: 3, status: 'completed' },
      { id: 'cell_005', type: 'markdown', content: '## 结论\n\nMoS₂的带隙为1.71 eV，属于半导体材料，适合用于光电器件。', output: null, executionCount: null, status: 'idle' }
    ]
  },
  {
    id: 'nb_md_simulation',
    title: '水分子分子动力学模拟',
    kernel: 'python',
    icon: 'activity',
    color: '#10b981',
    starred: false,
    createdAt: '2026-08-22',
    updatedAt: '2026-08-26',
    tags: ['MD', '水', 'GROMACS', '分子动力学'],
    description: '使用GROMACS进行水分子的NVT系综模拟',
    cells: [
      { id: 'cell_101', type: 'markdown', content: '# 水分子分子动力学模拟\n\n使用GROMACS对1000个水分子进行NVT系综模拟。', output: null, executionCount: null, status: 'idle' },
      { id: 'cell_102', type: 'code', content: '# 准备模拟系统\nimport subprocess\n\n# 构建水分子盒子\nsubprocess.run(["gmx", "solvate", "-cs", "spc216.gro", "-o", "water.gro"])\nprint("系统构建完成: 1000个水分子")', output: { type: 'text', content: '系统构建完成: 1000个水分子' }, executionCount: 1, status: 'completed' },
      { id: 'cell_103', type: 'code', content: '# 能量最小化\nsubprocess.run(["gmx", "grompp", "-f", "em.mdp", "-c", "water.gro", "-o", "em.tpr"])\nsubprocess.run(["gmx", "mdrun", "-v", "-deffnm", "em"])\nprint("能量最小化完成")', output: { type: 'text', content: '能量最小化完成\n最终势能: -4.12e+04 kJ/mol' }, executionCount: 2, status: 'completed' },
      { id: 'cell_104', type: 'code', content: '# NVT平衡模拟\nsubprocess.run(["gmx", "grompp", "-f", "nvt.mdp", "-c", "em.gro", "-o", "nvt.tpr"])\nsubprocess.run(["gmx", "mdrun", "-v", "-deffnm", "nvt"])\nprint("NVT模拟完成: 100 ps")', output: { type: 'text', content: 'NVT模拟完成: 100 ps\n平均温度: 298.5 K' }, executionCount: 3, status: 'completed' }
    ]
  },
  {
    id: 'nb_ml_material',
    title: '材料性质机器学习预测',
    kernel: 'python',
    icon: 'brain',
    color: '#8b5cf6',
    starred: true,
    createdAt: '2026-08-25',
    updatedAt: '2026-08-27',
    tags: ['机器学习', '材料', '随机森林', '带隙预测'],
    description: '使用随机森林模型预测材料带隙',
    cells: [
      { id: 'cell_201', type: 'markdown', content: '# 材料带隙机器学习预测\n\n使用材料项目数据库训练随机森林模型预测带隙。', output: null, executionCount: null, status: 'idle' },
      { id: 'cell_202', type: 'code', content: '# 加载数据集\nimport pandas as pd\nfrom sklearn.model_selection import train_test_split\n\ndf = pd.read_csv("/data/materials_bandgap.csv")\nprint(f"数据集大小: {len(df)}")\nprint(f"特征数: {len(df.columns)-1}")', output: { type: 'text', content: '数据集大小: 12500\n特征数: 15' }, executionCount: 1, status: 'completed' },
      { id: 'cell_203', type: 'code', content: '# 训练随机森林模型\nfrom sklearn.ensemble import RandomForestRegressor\nfrom sklearn.metrics import r2_score, mean_absolute_error\n\nX = df.drop("bandgap", axis=1)\ny = df["bandgap"]\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)\n\nmodel = RandomForestRegressor(n_estimators=100, random_state=42)\nmodel.fit(X_train, y_train)\n\ny_pred = model.predict(X_test)\nprint(f"R²: {r2_score(y_test, y_pred):.3f}")\nprint(f"MAE: {mean_absolute_error(y_test, y_pred):.3f} eV")', output: { type: 'text', content: 'R²: 0.923\nMAE: 0.187 eV' }, executionCount: 2, status: 'completed' },
      { id: 'cell_204', type: 'code', content: '# 特征重要性分析\nimportances = pd.Series(model.feature_importances_, index=X.columns)\nimportances.nlargest(10).plot(kind="barh")\nplt.title("Top 10 重要特征")\nplt.tight_layout()\nplt.show()', output: { type: 'image', content: '[特征重要性图 - 已生成]' }, executionCount: 3, status: 'completed' }
    ]
  }
];

// ============================================================
// 三、Notebook管理器
// ============================================================
const NotebookManagerV2 = {
  notebooks: [],

  init() {
    if (this.notebooks.length === 0) {
      this.notebooks = JSON.parse(JSON.stringify(SampleNotebooks));
    }
  },

  getAll() {
    this.init();
    return this.notebooks;
  },

  get(id) {
    return this.notebooks.find(n => n.id === id);
  },

  create(title, kernel = 'python') {
    const nb = {
      id: 'nb_' + Date.now(),
      title: title || '未命名笔记本',
      kernel,
      icon: 'file-code',
      color: '#64748b',
      starred: false,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      tags: [],
      description: '',
      cells: [
        { id: 'cell_' + Date.now(), type: 'code', content: '# 在这里编写代码\nprint("Hello, UniSci!")', output: null, executionCount: null, status: 'idle' }
      ]
    };
    this.notebooks.unshift(nb);
    return nb;
  },

  delete(id) {
    this.notebooks = this.notebooks.filter(n => n.id !== id);
  },

  duplicate(id) {
    const original = this.get(id);
    if (!original) return null;
    const copy = JSON.parse(JSON.stringify(original));
    copy.id = 'nb_' + Date.now();
    copy.title = original.title + ' (副本)';
    copy.createdAt = new Date().toISOString().split('T')[0];
    copy.updatedAt = copy.createdAt;
    this.notebooks.unshift(copy);
    return copy;
  },

  toggleStar(id) {
    const nb = this.get(id);
    if (nb) nb.starred = !nb.starred;
  },

  save(nb) {
    const idx = this.notebooks.findIndex(n => n.id === nb.id);
    if (idx >= 0) {
      nb.updatedAt = new Date().toISOString().split('T')[0];
      this.notebooks[idx] = nb;
    }
  }
};

// ============================================================
// 四、Notebook列表渲染器
// ============================================================
const NotebookListRendererV2 = {
  currentTab: 'all',
  searchQuery: '',

  render() {
    this.renderTabs();
    this.renderToolbar();
    this.renderList();
  },

  renderTabs() {
    const container = document.getElementById('notebook-tabs');
    if (!container) return;
    const all = NotebookManagerV2.getAll();
    const counts = {
      all: all.length,
      starred: all.filter(n => n.starred).length,
      recent: all.filter(n => (n.updatedAt || '').startsWith('2026-08')).length
    };
    container.innerHTML = `
      <div class="tab-bar">
        <button class="tab-item ${this.currentTab==='all'?'active':''}" onclick="NotebookListRendererV2.setTab('all')">全部 (${counts.all})</button>
        <button class="tab-item ${this.currentTab==='starred'?'active':''}" onclick="NotebookListRendererV2.setTab('starred')">收藏 (${counts.starred})</button>
        <button class="tab-item ${this.currentTab==='recent'?'active':''}" onclick="NotebookListRendererV2.setTab('recent')">最近 (${counts.recent})</button>
      </div>
    `;
  },

  setTab(tab) {
    this.currentTab = tab;
    this.render();
  },

  renderToolbar() {
    const container = document.getElementById('notebook-toolbar');
    if (!container) return;
    container.innerHTML = `
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
        <input class="form-input" style="flex:1;padding:8px 12px;font-size:13px" placeholder="搜索Notebook..." value="${this.searchQuery}" oninput="NotebookListRendererV2.search(this.value)">
        <button onclick="NotebookListRendererV2.showNewMenu()" style="padding:8px 14px;background:linear-gradient(135deg,#3b82f6,#2563eb);color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:4px">
          <i data-lucide="plus" class="lucide" style="width:14px;height:14px"></i>新建
        </button>
      </div>
    `;
    if (typeof renderIcons === 'function') renderIcons();
  },

  search(query) {
    this.searchQuery = query;
    this.renderList();
  },

  renderList() {
    const container = document.getElementById('notebook-list-content');
    if (!container) return;
    let notebooks = NotebookManagerV2.getAll();
    
    if (this.currentTab === 'starred') notebooks = notebooks.filter(n => n.starred);
    if (this.currentTab === 'recent') notebooks = notebooks.filter(n => (n.updatedAt||'').startsWith('2026-08'));
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      notebooks = notebooks.filter(n => n.title.toLowerCase().includes(q) || (n.tags||[]).some(t => t.toLowerCase().includes(q)));
    }

    if (notebooks.length === 0) {
      container.innerHTML = `<div style="text-align:center;padding:40px;color:#94a3b8"><i data-lucide="inbox" class="lucide" style="width:48px;height:48px;margin-bottom:12px;opacity:0.3"></i><div>暂无Notebook</div></div>`;
      if (typeof renderIcons === 'function') renderIcons();
      return;
    }

    container.innerHTML = notebooks.map(nb => {
      const kernel = NotebookKernelsV2[nb.kernel] || NotebookKernelsV2.python;
      return `
        <div class="card" onclick="NotebookEditorV2.open('${nb.id}')" style="cursor:pointer;margin-bottom:12px">
          <div style="display:flex;gap:12px;align-items:flex-start">
            <div style="width:44px;height:44px;border-radius:12px;background:${nb.color}22;display:flex;align-items:center;justify-content:center;flex-shrink:0">
              <i data-lucide="${nb.icon}" class="lucide" style="width:22px;height:22px;color:${nb.color}"></i>
            </div>
            <div style="flex:1;min-width:0">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
                <span style="font-size:14px;font-weight:700;color:#1f2937;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${nb.title}</span>
                ${nb.starred ? '<i data-lucide="star" class="lucide" style="width:14px;height:14px;color:#f59e0b;fill:#f59e0b;flex-shrink:0"></i>' : ''}
              </div>
              <div style="font-size:11px;color:#64748b;margin-bottom:6px">${nb.description || ''}</div>
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                <span style="font-size:10px;padding:2px 6px;background:${kernel.color}22;color:${kernel.color};border-radius:4px;font-weight:600">${kernel.name}</span>
                <span style="font-size:10px;color:#94a3b8">${nb.cells?.length || 0} 单元格</span>
                <span style="font-size:10px;color:#94a3b8">更新于 ${nb.updatedAt}</span>
              </div>
            </div>
            <i data-lucide="more-horizontal" class="lucide" style="width:18px;height:18px;color:#cbd5e1;flex-shrink:0" onclick="event.stopPropagation();NotebookListRendererV2.showActions('${nb.id}')"></i>
          </div>
        </div>
      `;
    }).join('');
    if (typeof renderIcons === 'function') renderIcons();
  },

  showNewMenu() {
    if (typeof UI !== 'undefined' && UI.dialog) {
      UI.dialog.actionSheet({
        title: '新建Notebook',
        actions: [
          { label: 'Python 3 笔记本', icon: 'code-2', onClick: () => { const nb = NotebookManagerV2.create('新建笔记本', 'python'); NotebookEditorV2.open(nb.id); } },
          { label: '空白笔记本', icon: 'file-plus', onClick: () => { const nb = NotebookManagerV2.create('空白笔记本'); NotebookEditorV2.open(nb.id); } },
          { label: '从模板创建', icon: 'layout-template', onClick: () => { alert('模板功能开发中'); } }
        ]
      });
    } else {
      const nb = NotebookManagerV2.create('新建笔记本', 'python');
      NotebookEditorV2.open(nb.id);
    }
  },

  showActions(nbId) {
    const nb = NotebookManagerV2.get(nbId);
    if (!nb) return;
    if (typeof UI !== 'undefined' && UI.dialog) {
      UI.dialog.actionSheet({
        title: nb.title,
        actions: [
          { label: nb.starred ? '取消收藏' : '收藏', icon: 'star', onClick: () => { NotebookManagerV2.toggleStar(nbId); this.render(); } },
          { label: '重命名', icon: 'edit-3', onClick: () => { const t = prompt('新名称', nb.title); if (t) { nb.title = t; NotebookManagerV2.save(nb); this.render(); } } },
          { label: '复制', icon: 'copy', onClick: () => { NotebookManagerV2.duplicate(nbId); this.render(); } },
          { label: '导出 .ipynb', icon: 'download', onClick: () => { NotebookEditorV2.exportNotebook(nbId); } },
          { label: '删除', icon: 'trash-2', danger: true, onClick: () => { if (confirm('确定删除？')) { NotebookManagerV2.delete(nbId); this.render(); } } }
        ]
      });
    }
  }
};

// ============================================================
// 五、Notebook编辑器
// ============================================================
const NotebookEditorV2 = {
  currentNotebook: null,
  selectedCellId: null,
  showVariables: false,
  variables: {},
  executionCounter: 0,

  open(nbId) {
    const nb = NotebookManagerV2.get(nbId);
    if (!nb) {
      const all = NotebookManagerV2.getAll();
      if (all.length > 0) {
        this.currentNotebook = all[0];
      } else {
        return;
      }
    } else {
      this.currentNotebook = nb;
    }
    navigateTo('page-notebook-detail');
    setTimeout(() => this.render(), 100);
  },

  render() {
    const nb = this.currentNotebook;
    if (!nb) return;

    const titleEl = document.getElementById('notebook-title');
    if (titleEl) titleEl.textContent = nb.title;

    this.renderToolbar();
    this.renderCells();
    this.renderStatusBar();
  },

  renderToolbar() {
    const nb = this.currentNotebook;
    const kernel = NotebookKernelsV2[nb.kernel] || NotebookKernelsV2.python;
    const container = document.getElementById('notebook-toolbar-detail');
    if (!container) return;

    container.innerHTML = `
      <div style="display:flex;gap:6px;align-items:center;padding:8px 12px;background:#fff;border-radius:12px;margin-bottom:12px;box-shadow:0 1px 4px rgba(0,0,0,0.05);flex-wrap:wrap">
        <select onchange="NotebookEditorV2.changeKernel(this.value)" style="padding:6px 10px;font-size:12px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;font-weight:600;color:${kernel.color}">
          ${Object.values(NotebookKernelsV2).map(k => `<option value="${k.id}" ${k.id===nb.kernel?'selected':''}>${k.name}</option>`).join('')}
        </select>
        <div style="width:1px;height:20px;background:#e2e8f0"></div>
        <button onclick="NotebookEditorV2.runAll()" title="运行全部" style="padding:6px 10px;background:#eff6ff;color:#2563eb;border:none;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;display:flex;align-items:center;gap:4px">
          <i data-lucide="play" class="lucide" style="width:14px;height:14px"></i>全部
        </button>
        <button onclick="NotebookEditorV2.runSelected()" title="运行选中" style="padding:6px 10px;background:#f0fdf4;color:#16a34a;border:none;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;display:flex;align-items:center;gap:4px">
          <i data-lucide="play" class="lucide" style="width:14px;height:14px"></i>运行
        </button>
        <button onclick="NotebookEditorV2.interrupt()" title="中断" style="padding:6px 10px;background:#fef2f2;color:#dc2626;border:none;border-radius:8px;cursor:pointer;font-size:12px">
          <i data-lucide="square" class="lucide" style="width:14px;height:14px"></i>
        </button>
        <div style="width:1px;height:20px;background:#e2e8f0"></div>
        <button onclick="NotebookEditorV2.addCell('code')" title="添加代码" style="padding:6px 8px;background:#f8fafc;color:#475569;border:none;border-radius:8px;cursor:pointer">
          <i data-lucide="plus" class="lucide" style="width:14px;height:14px"></i>
        </button>
        <button onclick="NotebookEditorV2.addCell('markdown')" title="添加Markdown" style="padding:6px 8px;background:#f8fafc;color:#475569;border:none;border-radius:8px;cursor:pointer">
          <i data-lucide="type" class="lucide" style="width:14px;height:14px"></i>
        </button>
        <button onclick="NotebookEditorV2.moveSelected('up')" title="上移" style="padding:6px 8px;background:#f8fafc;color:#475569;border:none;border-radius:8px;cursor:pointer">
          <i data-lucide="arrow-up" class="lucide" style="width:14px;height:14px"></i>
        </button>
        <button onclick="NotebookEditorV2.moveSelected('down')" title="下移" style="padding:6px 8px;background:#f8fafc;color:#475569;border:none;border-radius:8px;cursor:pointer">
          <i data-lucide="arrow-down" class="lucide" style="width:14px;height:14px"></i>
        </button>
        <button onclick="NotebookEditorV2.deleteSelected()" title="删除" style="padding:6px 8px;background:#f8fafc;color:#475569;border:none;border-radius:8px;cursor:pointer">
          <i data-lucide="trash-2" class="lucide" style="width:14px;height:14px"></i>
        </button>
        <div style="width:1px;height:20px;background:#e2e8f0"></div>
        <button onclick="NotebookEditorV2.toggleVariables()" title="变量" style="padding:6px 8px;background:${this.showVariables?'#eff6ff':'#f8fafc'};color:${this.showVariables?'#2563eb':'#475569'};border:none;border-radius:8px;cursor:pointer">
          <i data-lucide="variable" class="lucide" style="width:14px;height:14px"></i>
        </button>
        <button onclick="NotebookEditorV2.showAIAssistant()" title="AI助手" style="padding:6px 8px;background:#faf5ff;color:#7c3aed;border:none;border-radius:8px;cursor:pointer">
          <i data-lucide="sparkles" class="lucide" style="width:14px;height:14px"></i>
        </button>
        <button onclick="NotebookEditorV2.exportNotebook()" title="导出" style="padding:6px 8px;background:#f8fafc;color:#475569;border:none;border-radius:8px;cursor:pointer">
          <i data-lucide="download" class="lucide" style="width:14px;height:14px"></i>
        </button>
        <button onclick="NotebookEditorV2.submitJob()" title="提交计算任务" style="padding:6px 10px;background:linear-gradient(135deg,#8b5cf6,#7c3aed);color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;display:flex;align-items:center;gap:4px">
          <i data-lucide="zap" class="lucide" style="width:14px;height:14px"></i>提交计算
        </button>
      </div>
    `;
    if (typeof renderIcons === 'function') renderIcons();
  },

  renderCells() {
    const container = document.getElementById('notebook-cells');
    if (!container) return;
    const nb = this.currentNotebook;

    let html = '';
    nb.cells.forEach((cell, idx) => {
      const isSelected = cell.id === this.selectedCellId;
      const kernel = NotebookKernelsV2[nb.kernel] || NotebookKernelsV2.python;
      
      if (cell.type === 'markdown') {
        html += `
          <div class="notebook-cell ${isSelected?'selected':''}" id="cell-${cell.id}" onclick="NotebookEditorV2.selectCell('${cell.id}')" style="margin-bottom:12px;padding:12px 16px;background:#fff;border-radius:12px;border:2px solid ${isSelected?'#3b82f6':'#f1f5f9'};cursor:pointer">
            <div style="font-size:13px;line-height:1.7;color:#334155">${this.renderMarkdown(cell.content)}</div>
          </div>
        `;
      } else {
        html += `
          <div class="notebook-cell ${isSelected?'selected':''}" id="cell-${cell.id}" style="margin-bottom:12px;background:#fff;border-radius:12px;border:2px solid ${isSelected?'#3b82f6':'#f1f5f9'};overflow:hidden">
            <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 12px;background:#f8fafc;border-bottom:1px solid #f1f5f9">
              <div style="display:flex;align-items:center;gap:8px">
                <span style="font-size:10px;padding:2px 6px;background:${kernel.color}22;color:${kernel.color};border-radius:4px;font-weight:700">${kernel.name}</span>
                <span style="font-size:11px;color:#94a3b8;font-family:monospace">[${cell.executionCount || ' '}]</span>
                <span style="font-size:10px;color:${cell.status==='running'?'#f59e0b':cell.status==='completed'?'#10b981':'#94a3b8'}">${cell.status==='running'?'运行中...':cell.status==='completed'?'已完成':''}</span>
              </div>
              <div style="display:flex;gap:4px">
                <button onclick="event.stopPropagation();NotebookEditorV2.runCell('${cell.id}')" style="padding:4px 8px;background:#eff6ff;color:#2563eb;border:none;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600">
                  <i data-lucide="play" class="lucide" style="width:12px;height:12px;vertical-align:middle"></i> 运行
                </button>
                <button onclick="event.stopPropagation();NotebookEditorV2.editCell('${cell.id}')" style="padding:4px 8px;background:#f8fafc;color:#64748b;border:none;border-radius:6px;cursor:pointer;font-size:11px">
                  <i data-lucide="edit-3" class="lucide" style="width:12px;height:12px;vertical-align:middle"></i>
                </button>
              </div>
            </div>
            <div onclick="NotebookEditorV2.selectCell('${cell.id}')" style="padding:12px 16px;cursor:text">
              <pre style="margin:0;font-size:13px;font-family:'Fira Code',monospace;color:#1e293b;white-space:pre-wrap;line-height:1.6">${this.escapeHtml(cell.content)}</pre>
            </div>
            ${cell.output ? this.renderCellOutput(cell.output) : ''}
          </div>
        `;
      }
    });

    // 变量面板
    if (this.showVariables) {
      html += this.renderVariablesPanel();
    }

    container.innerHTML = html;
    if (typeof renderIcons === 'function') renderIcons();
  },

  renderCellOutput(output) {
    if (!output) return '';
    if (output.type === 'image') {
      return `
        <div style="padding:12px 16px;border-top:1px solid #f1f5f9;background:#fafafa">
          <div style="background:#f8fafc;border-radius:8px;padding:20px;text-align:center;color:#64748b;font-size:12px">
            <i data-lucide="image" class="lucide" style="width:32px;height:32px;margin-bottom:8px;opacity:0.5"></i>
            <div>${output.content}</div>
          </div>
        </div>
      `;
    }
    return `
      <div style="padding:12px 16px;border-top:1px solid #f1f5f9;background:#fafafa">
        <pre style="margin:0;font-size:12px;font-family:'Fira Code',monospace;color:#059669;white-space:pre-wrap;line-height:1.6">${this.escapeHtml(output.content)}</pre>
      </div>
    `;
  },

  renderVariablesPanel() {
    const vars = Object.entries(this.variables);
    return `
      <div style="margin-bottom:12px;padding:12px 16px;background:#fff;border-radius:12px;border:1px solid #e2e8f0">
        <div style="font-size:12px;font-weight:700;color:#374151;margin-bottom:8px">变量查看器 (${vars.length})</div>
        ${vars.length === 0 ? '<div style="font-size:11px;color:#94a3b8">暂无变量</div>' :
          vars.map(([name, val]) => `
            <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f1f5f9;font-size:12px">
              <span style="color:#2563eb;font-family:monospace">${name}</span>
              <span style="color:#64748b;font-family:monospace">${typeof val === 'object' ? JSON.stringify(val).substring(0,30) : String(val).substring(0,30)}</span>
            </div>
          `).join('')
        }
      </div>
    `;
  },

  renderStatusBar() {
    const container = document.getElementById('notebook-status');
    if (!container) return;
    const nb = this.currentNotebook;
    const kernel = NotebookKernelsV2[nb.kernel] || NotebookKernelsV2.python;
    container.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:#1e293b;color:#94a3b8;border-radius:10px;font-size:11px">
        <div style="display:flex;align-items:center;gap:12px">
          <span style="display:flex;align-items:center;gap:4px"><span style="width:6px;height:6px;border-radius:50%;background:#10b981"></span>${kernel.name} ${kernel.version}</span>
          <span>${nb.cells.length} 单元格</span>
          <span>已保存</span>
        </div>
        <div>UniSci Notebook</div>
      </div>
    `;
  },

  // 单元格操作
  selectCell(cellId) {
    this.selectedCellId = cellId;
    this.renderCells();
  },

  addCell(type) {
    const nb = this.currentNotebook;
    const newCell = {
      id: 'cell_' + Date.now(),
      type,
      content: type === 'markdown' ? '# 新标题\n\n在这里写Markdown内容' : '# 新代码单元\nprint("Hello")',
      output: null,
      executionCount: null,
      status: 'idle'
    };
    const idx = nb.cells.findIndex(c => c.id === this.selectedCellId);
    if (idx >= 0) {
      nb.cells.splice(idx + 1, 0, newCell);
    } else {
      nb.cells.push(newCell);
    }
    this.selectedCellId = newCell.id;
    NotebookManagerV2.save(nb);
    this.render();
  },

  deleteSelected() {
    if (!this.selectedCellId) return;
    const nb = this.currentNotebook;
    nb.cells = nb.cells.filter(c => c.id !== this.selectedCellId);
    this.selectedCellId = null;
    NotebookManagerV2.save(nb);
    this.render();
  },

  moveSelected(direction) {
    if (!this.selectedCellId) return;
    const nb = this.currentNotebook;
    const idx = nb.cells.findIndex(c => c.id === this.selectedCellId);
    if (idx < 0) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= nb.cells.length) return;
    [nb.cells[idx], nb.cells[newIdx]] = [nb.cells[newIdx], nb.cells[idx]];
    NotebookManagerV2.save(nb);
    this.render();
  },

  editCell(cellId) {
    const cell = this.currentNotebook.cells.find(c => c.id === cellId);
    if (!cell) return;
    const newContent = prompt('编辑单元格内容', cell.content);
    if (newContent !== null) {
      cell.content = newContent;
      cell.output = null;
      cell.executionCount = null;
      cell.status = 'idle';
      NotebookManagerV2.save(this.currentNotebook);
      this.render();
    }
  },

  // 代码执行
  runCell(cellId) {
    const cell = this.currentNotebook.cells.find(c => c.id === cellId);
    if (!cell || cell.type !== 'code') return;
    
    cell.status = 'running';
    this.renderCells();
    
    // 模拟执行
    setTimeout(() => {
      this.executionCounter++;
      cell.executionCount = this.executionCounter;
      cell.status = 'completed';
      
      // 模拟输出
      const content = cell.content.toLowerCase();
      if (content.includes('print')) {
        const match = cell.content.match(/print\(["'](.+?)["']\)/);
        cell.output = { type: 'text', content: match ? match[1] : '执行成功\n输出: [模拟数据]' };
      } else if (content.includes('plt.') || content.includes('plot') || content.includes('show')) {
        cell.output = { type: 'image', content: '[图表已生成 - 模拟]' };
      } else if (content.includes('shape')) {
        cell.output = { type: 'text', content: '(100, 20)\n执行成功' };
      } else {
        cell.output = { type: 'text', content: '执行成功\n耗时: 0.23s' };
      }
      
      // 更新变量
      this.variables['cell_' + cellId + '_result'] = cell.output.content;
      
      NotebookManagerV2.save(this.currentNotebook);
      this.renderCells();
    }, 800);
  },

  runSelected() {
    if (this.selectedCellId) {
      this.runCell(this.selectedCellId);
    }
  },

  async runAll() {
    const nb = this.currentNotebook;
    for (const cell of nb.cells) {
      if (cell.type === 'code') {
        await new Promise(resolve => {
          this.runCell(cell.id);
          setTimeout(resolve, 1000);
        });
      }
    }
  },

  interrupt() {
    const nb = this.currentNotebook;
    nb.cells.forEach(c => { if (c.status === 'running') c.status = 'idle'; });
    this.render();
  },

  // 内核切换
  changeKernel(kernelId) {
    this.currentNotebook.kernel = kernelId;
    NotebookManagerV2.save(this.currentNotebook);
    this.render();
  },

  // 变量面板
  toggleVariables() {
    this.showVariables = !this.showVariables;
    this.render();
  },

  // AI助手
  showAIAssistant() {
    const suggestion = prompt('AI代码助手\n请输入你想实现的功能：', '分析能带结构并绘图');
    if (suggestion) {
      const code = `# AI生成: ${suggestion}\nimport numpy as np\nimport matplotlib.pyplot as plt\n\n# 加载数据\ndata = np.load("/data/band.dat")\n\n# 分析与可视化\nfig, ax = plt.subplots()\nax.plot(data)\nax.set_title("${suggestion}")\nplt.show()\nprint("分析完成")`;
      this.addCell('code');
      const newCell = this.currentNotebook.cells[this.currentNotebook.cells.length - 1];
      newCell.content = code;
      NotebookManagerV2.save(this.currentNotebook);
      this.render();
    }
  },

  // 计算联动
  submitJob() {
    const nb = this.currentNotebook;
    if (confirm(`将基于Notebook "${nb.title}" 提交计算任务？`)) {
      if (typeof JobManager !== 'undefined') {
        const job = JobManager.createJob({
          type: 'DFT',
          title: nb.title + ' - Notebook计算',
          software: 'VASP'
        });
        alert(`计算任务已提交: ${job.id}`);
        navigateTo('page-job-detail', job.id);
      } else {
        alert('计算任务已提交（模拟）\n任务ID: job_' + Date.now());
      }
    }
  },

  // 导出
  exportNotebook(nbId) {
    const nb = nbId ? NotebookManagerV2.get(nbId) : this.currentNotebook;
    if (!nb) return;
    const ipynb = {
      nbformat: 4,
      nbformat_minor: 5,
      metadata: { kernelspec: { name: nb.kernel, display_name: NotebookKernelsV2[nb.kernel]?.name || nb.kernel } },
      cells: nb.cells.map(c => ({
        cell_type: c.type,
        source: c.content.split('\n'),
        metadata: {},
        outputs: c.output ? [{ output_type: 'execute_result', data: { 'text/plain': [c.output.content] } }] : [],
        execution_count: c.executionCount
      }))
    };
    const blob = new Blob([JSON.stringify(ipynb, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nb.title.replace(/\s+/g, '_') + '.ipynb';
    a.click();
    URL.revokeObjectURL(url);
  },

  // 工具方法
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  renderMarkdown(text) {
    // 简单的Markdown渲染
    return text
      .replace(/^### (.*$)/gm, '<h3 style="font-size:14px;font-weight:700;margin:8px 0">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 style="font-size:16px;font-weight:700;margin:10px 0">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 style="font-size:18px;font-weight:700;margin:12px 0">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code style="background:#f1f5f9;padding:2px 4px;border-radius:4px;font-size:12px">$1</code>')
      .replace(/\n/g, '<br>');
  },

  save() {
    if (this.currentNotebook) {
      NotebookManagerV2.save(this.currentNotebook);
      alert('已保存');
    }
  }
};

console.log('[NotebookV2] Notebook系统已加载：3个示例笔记本 + 完整6大闭环');
