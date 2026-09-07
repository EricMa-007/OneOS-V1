/**
 * UniSci Platform V2 - 板块5: Notebook系统
 * 包含: 笔记本管理/列表渲染/编辑器/单元格/代码运行/输出/版本/变量/AI/导出
 */

'use strict';

// ============================================================
// 一、内核定义
// ============================================================
const NotebookKernels = {
  python: { id: 'python', name: 'Python 3.12', icon: 'code-2', color: '#3776ab', version: '3.12.0', libraries: ['numpy','scipy','pandas','matplotlib','ase','pymatgen'] },
  julia: { id: 'julia', name: 'Julia 1.10', icon: 'hexagon', color: '#9558b2', version: '1.10.0', libraries: ['Plots','DataFrames','DifferentialEquations'] },
  r: { id: 'r', name: 'R 4.3', icon: 'ruler', color: '#276dc3', version: '4.3.0', libraries: ['ggplot2','dplyr','tidyr'] },
  shell: { id: 'shell', name: 'Shell', icon: 'terminal', color: '#4a5568', version: 'bash 5.2', libraries: [] },
  matlab: { id: 'matlab', name: 'MATLAB', icon: 'square-function', color: '#e16737', version: 'R2024a', libraries: [] },
  fortran: { id: 'fortran', name: 'Fortran', icon: 'binary', color: '#4c1d95', version: 'gfortran 13', libraries: [] },
  cpp: { id: 'cpp', name: 'C++', icon: 'braces', color: '#00599c', version: 'g++ 13', libraries: ['Eigen','Boost'] }
};

// ============================================================
// 二、笔记本模板
// ============================================================
const NotebookTemplates = {
  blank: {
    name: '空白Notebook',
    cells: [
      { type: 'markdown', content: '# 新建 Notebook\n\n在此开始你的科学计算之旅。' },
      { type: 'code', content: 'print("Hello, UniSci!")', output: null, status: 'idle' }
    ]
  },
  dft: {
    name: 'DFT 分析模板',
    cells: [
      { type: 'markdown', content: '# DFT 计算结果分析\n\n本Notebook用于分析第一性原理计算结果，包括能带结构、态密度、电荷密度等。' },
      { type: 'code', content: 'import numpy as np\nimport matplotlib.pyplot as plt\nfrom pymatgen.io.vasp import Vasprun\n\nprint("库导入完成")', output: { type: 'text', data: '库导入完成' }, status: 'completed' },
      { type: 'code', content: '# 读取计算结果\n# vr = Vasprun("vasprun.xml")\n# band = vr.get_band_structure()\nprint("结果读取完成（示例）")', output: null, status: 'idle' },
      { type: 'markdown', content: '## 能带结构可视化' },
      { type: 'code', content: '# band.plot()\nprint("能带图已生成（示例）")', output: { type: 'text', data: '能带图已生成（示例）' }, status: 'completed' }
    ]
  },
  md: {
    name: 'MD 后处理模板',
    cells: [
      { type: 'markdown', content: '# 分子动力学后处理\n\n分析MD轨迹，计算RDF、MSD、温度压力演化等。' },
      { type: 'code', content: 'import MDAnalysis as mda\nimport numpy as np\nprint("MDAnalysis 已加载")', output: { type: 'text', data: 'MDAnalysis 已加载' }, status: 'completed' }
    ]
  },
  dataviz: {
    name: '数据可视化模板',
    cells: [
      { type: 'markdown', content: '# 数据可视化\n\n使用matplotlib进行科学数据可视化。' },
      { type: 'code', content: 'import numpy as np\nimport matplotlib.pyplot as plt\n\nx = np.linspace(0, 2*np.pi, 100)\ny = np.sin(x)\nplt.plot(x, y)\nplt.title("Sine Wave")\nplt.show()', output: { type: 'plot', data: 'sine_wave' }, status: 'completed' }
    ]
  },
  ml: {
    name: '机器学习模板',
    cells: [
      { type: 'markdown', content: '# 机器学习 for Science\n\n使用scikit-learn和PyTorch进行材料性质预测。' },
      { type: 'code', content: 'from sklearn.ensemble import RandomForestRegressor\nfrom sklearn.model_selection import train_test_split\nimport numpy as np\n\nprint("ML库导入完成")', output: { type: 'text', data: 'ML库导入完成' }, status: 'completed' }
    ]
  },
  topology: {
    name: '拓扑分析模板',
    cells: [
      { type: 'markdown', content: '# 拓扑绝缘体分析\n\n分析能带结构、计算Z₂拓扑不变量、识别表面态。' },
      { type: 'code', content: 'import numpy as np\nimport matplotlib.pyplot as plt\n\n# 读取能带数据\n# band_data = np.load("band_structure.npy")\nprint("拓扑分析模板加载完成")', output: { type: 'text', data: '拓扑分析模板加载完成' }, status: 'completed' },
      { type: 'markdown', content: '## 能带结构与表面态' },
      { type: 'code', content: '# 绘制能带结构\n# 识别Dirac点和表面态\n# 计算Z₂不变量\nprint("拓扑性质分析中...")', output: null, status: 'idle' }
    ]
  },
  catalysis: {
    name: '催化反应模板',
    cells: [
      { type: 'markdown', content: '# 催化反应能垒计算\n\n计算催化反应路径、过渡态、反应能垒和选择性。' },
      { type: 'code', content: 'import numpy as np\nfrom scipy.optimize import minimize\n\n# 反应路径：反应物 → 过渡态 → 产物\nprint("催化反应模板加载完成")', output: { type: 'text', data: '催化反应模板加载完成' }, status: 'completed' },
      { type: 'markdown', content: '## 反应能垒与自由能图' },
      { type: 'code', content: '# 计算各中间体能量\n# 绘制自由能图\n# 分析决速步和选择性\nprint("反应能垒分析中...")', output: null, status: 'idle' }
    ]
  },
  battery: {
    name: '电池材料模板',
    cells: [
      { type: 'markdown', content: '# 电池材料性质分析\n\n计算电压平台、理论容量、离子扩散能垒和循环稳定性。' },
      { type: 'code', content: 'import numpy as np\n\n# 正极材料：LiFePO4 / NMC / LCO\n# 计算平均电压 = (E_脱锂 - E_嵌锂) / nF\nprint("电池材料模板加载完成")', output: { type: 'text', data: '电池材料模板加载完成' }, status: 'completed' },
      { type: 'markdown', content: '## 电压曲线与扩散系数' },
      { type: 'code', content: '# 计算不同嵌锂浓度下的电压\n# NEB计算离子扩散能垒\n# 评估循环稳定性\nprint("电池性能分析中...")', output: null, status: 'idle' }
    ]
  },
  spectroscopy: {
    name: '光谱分析模板',
    cells: [
      { type: 'markdown', content: '# 光谱计算与分析\n\n计算拉曼光谱、红外光谱、吸收光谱和光电子能谱。' },
      { type: 'code', content: 'import numpy as np\nimport matplotlib.pyplot as plt\nfrom scipy.signal import find_peaks\n\nprint("光谱分析模板加载完成")', output: { type: 'text', data: '光谱分析模板加载完成' }, status: 'completed' },
      { type: 'markdown', content: '## 拉曼光谱与振动模式' },
      { type: 'code', content: '# 读取振动频率\n# 计算拉曼活性\n# 绘制光谱并标注特征峰\nprint("光谱分析中...")', output: null, status: 'idle' }
    ]
  },
  highthroughput: {
    name: '高通量筛选模板',
    cells: [
      { type: 'markdown', content: '# 高通量材料筛选\n\n批量提交计算任务、自动收集结果、多目标优化筛选。' },
      { type: 'code', content: 'import numpy as np\nimport pandas as pd\nfrom itertools import product\n\n# 候选材料库\n# candidates = pd.read_csv("candidates.csv")\nprint("高通量筛选模板加载完成")', output: { type: 'text', data: '高通量筛选模板加载完成' }, status: 'completed' },
      { type: 'markdown', content: '## 多目标优化与排序' },
      { type: 'code', content: '# 批量提交计算任务\n# 自动收集结果\n# 帕累托最优筛选\n# 生成候选材料排名\nprint("高通量筛选中...")', output: null, status: 'idle' }
    ]
  }
};

// ============================================================
// 三、笔记本管理器
// ============================================================
const NotebookManager = {
  // 标准化notebook数据（兼容mock-data.js中的不完整数据）
  normalizeNotebook(nb) {
    if (!nb) return null;
    // 内核标准化："Python 3.12" → "python"
    let kernel = nb.kernel || 'python';
    if (typeof kernel === 'string') {
      const kl = kernel.toLowerCase();
      if (kl.includes('python')) kernel = 'python';
      else if (kl.includes('julia')) kernel = 'julia';
      else if (kl.includes('r ') || kl === 'r') kernel = 'r';
      else if (kl.includes('shell') || kl.includes('bash')) kernel = 'shell';
      else if (kl.includes('matlab')) kernel = 'matlab';
      else if (kl.includes('fortran')) kernel = 'fortran';
      else if (kl.includes('c++') || kl.includes('cpp')) kernel = 'cpp';
    }
    // 单元格数量标准化
    let cellCount = nb.cellCount;
    if (cellCount === undefined && typeof nb.cells === 'number') cellCount = nb.cells;
    if (cellCount === undefined && Array.isArray(nb.cells)) cellCount = nb.cells.length;
    if (cellCount === undefined) cellCount = 0;
    // 时间标准化
    const updatedAt = nb.updatedAt || nb.lastModified || nb.createdAt || '未知';
    const createdAt = nb.createdAt || updatedAt;
    // 返回标准化后的完整对象
    return {
      id: nb.id || ('nb_' + Date.now()),
      title: nb.title || '未命名 Notebook',
      kernel: kernel,
      createdAt: createdAt,
      updatedAt: updatedAt,
      cells: Array.isArray(nb.cells) ? nb.cells : [{ type: 'code', content: '# 开始编写代码', output: null, status: 'idle' }],
      cellCount: cellCount,
      status: nb.status || 'idle',
      starred: nb.starred || false,
      tags: Array.isArray(nb.tags) ? nb.tags : [],
      versions: Array.isArray(nb.versions) ? nb.versions : [{ version: 1, time: createdAt, note: '初始版本' }],
      icon: nb.icon || 'file-code'
    };
  },
  
  // 获取用户所有笔记本
  getAll() {
    const user = UserManager.getCurrentUser();
    if (!user) return [];
    let notebooks = user.notebooks;
    if (!notebooks || !Array.isArray(notebooks) || notebooks.length === 0) {
      notebooks = this.initDefaultNotebooks(user);
    }
    // 标准化每个notebook数据
    return notebooks.map(nb => this.normalizeNotebook(nb)).filter(nb => nb !== null);
  },
  
  // 初始化默认笔记本
  initDefaultNotebooks(user) {
    user.notebooks = [
      {
        id: 'nb_001',
        title: 'MoS₂ 能带结构分析',
        kernel: 'python',
        createdAt: '2026-08-15',
        updatedAt: '2026-08-20 14:30',
        cells: NotebookTemplates.dft.cells,
        cellCount: 5,
        status: 'idle',
        starred: true,
        tags: ['DFT','二维材料'],
        versions: [{ version: 1, time: '2026-08-15', note: '初始版本' }]
      },
      {
        id: 'nb_002',
        title: '数据可视化练习',
        kernel: 'python',
        createdAt: '2026-08-18',
        updatedAt: '2026-08-19 10:15',
        cells: NotebookTemplates.dataviz.cells,
        cellCount: 3,
        status: 'idle',
        starred: false,
        tags: ['可视化'],
        versions: [{ version: 1, time: '2026-08-18', note: '初始版本' }]
      },
      {
        id: 'nb_003',
        title: '机器学习：材料带隙预测',
        kernel: 'python',
        createdAt: '2026-08-10',
        updatedAt: '2026-08-17 16:45',
        cells: NotebookTemplates.ml.cells,
        cellCount: 4,
        status: 'idle',
        starred: true,
        tags: ['ML','材料'],
        versions: [{ version: 1, time: '2026-08-10', note: '初始版本' }, { version: 2, time: '2026-08-15', note: '添加特征工程' }]
      }
    ];
    return user.notebooks;
  },
  
  // 获取笔记本
  get(id) {
    return this.getAll().find(nb => nb.id === id) || null;
  },
  
  // 创建笔记本
  create(kernel = 'python', template = 'blank') {
    const user = UserManager.getCurrentUser();
    const tmpl = NotebookTemplates[template] || NotebookTemplates.blank;
    const nb = {
      id: 'nb_' + Date.now(),
      title: '未命名 Notebook',
      kernel: kernel,
      createdAt: new Date().toLocaleDateString('zh-CN'),
      updatedAt: new Date().toLocaleString('zh-CN'),
      cells: JSON.parse(JSON.stringify(tmpl.cells)),
      cellCount: tmpl.cells.length,
      status: 'idle',
      starred: false,
      tags: [],
      versions: [{ version: 1, time: new Date().toLocaleString('zh-CN'), note: '初始版本' }]
    };
    user.notebooks.unshift(nb);
    return nb;
  },
  
  // 保存笔记本
  save(id) {
    const nb = this.get(id);
    if (!nb) return false;
    nb.updatedAt = new Date().toLocaleString('zh-CN');
    nb.cellCount = nb.cells.length;
    return true;
  },
  
  // 删除笔记本
  delete(id) {
    const user = UserManager.getCurrentUser();
    user.notebooks = user.notebooks.filter(nb => nb.id !== id);
  },
  
  // 复制笔记本
  duplicate(id) {
    const nb = this.get(id);
    if (!nb) return null;
    const user = UserManager.getCurrentUser();
    const copy = JSON.parse(JSON.stringify(nb));
    copy.id = 'nb_' + Date.now();
    copy.title = nb.title + ' (副本)';
    copy.createdAt = new Date().toLocaleDateString('zh-CN');
    copy.updatedAt = new Date().toLocaleString('zh-CN');
    user.notebooks.unshift(copy);
    return copy;
  },
  
  // 切换收藏
  toggleStar(id) {
    const nb = this.get(id);
    if (nb) nb.starred = !nb.starred;
    return nb?.starred;
  },
  
  // 添加单元格
  addCell(nbId, type = 'code', index = -1) {
    const nb = this.get(nbId);
    if (!nb) return null;
    const cell = {
      id: 'cell_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      type: type,
      content: type === 'markdown' ? '## 新标题' : '# 新代码单元格\n',
      output: null,
      status: 'idle',
      executionCount: null
    };
    if (index < 0 || index >= nb.cells.length) {
      nb.cells.push(cell);
    } else {
      nb.cells.splice(index + 1, 0, cell);
    }
    nb.cellCount = nb.cells.length;
    return cell;
  },
  
  // 删除单元格
  deleteCell(nbId, cellId) {
    const nb = this.get(nbId);
    if (!nb) return false;
    nb.cells = nb.cells.filter(c => c.id !== cellId);
    nb.cellCount = nb.cells.length;
    return true;
  },
  
  // 移动单元格
  moveCell(nbId, cellId, direction) {
    const nb = this.get(nbId);
    if (!nb) return false;
    const idx = nb.cells.findIndex(c => c.id === cellId);
    if (idx < 0) return false;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= nb.cells.length) return false;
    [nb.cells[idx], nb.cells[newIdx]] = [nb.cells[newIdx], nb.cells[idx]];
    return true;
  },
  
  // 运行单元格（模拟）
  runCell(nbId, cellId) {
    const nb = this.get(nbId);
    if (!nb) return null;
    const cell = nb.cells.find(c => c.id === cellId);
    if (!cell || cell.type !== 'code') return null;
    
    cell.status = 'running';
    cell.executionCount = (cell.executionCount || 0) + 1;
    
    // 模拟运行延迟
    setTimeout(() => {
      cell.status = 'completed';
      // 生成模拟输出
      const content = cell.content.toLowerCase();
      if (content.includes('print') || content.includes('plt') || content.includes('show')) {
        if (content.includes('plt') || content.includes('plot') || content.includes('show')) {
          cell.output = { type: 'plot', data: 'simulated_plot' };
        } else {
          // 提取print内容
          const match = cell.content.match(/print\(["'](.+?)["']\)/);
          cell.output = { type: 'text', data: match ? match[1] : '运行完成' };
        }
      } else if (content.includes('import')) {
        cell.output = { type: 'text', data: '库导入成功' };
      } else {
        cell.output = { type: 'text', data: '执行完成' };
      }
      this.save(nbId);
      // 触发UI更新
      if (typeof NotebookEditor !== 'undefined' && NotebookEditor.currentNotebook?.id === nbId) {
        NotebookEditor.renderCell(cellId);
      }
    }, 800 + Math.random() * 1200);
    
    return cell;
  },
  
  // 运行所有单元格
  runAll(nbId) {
    const nb = this.get(nbId);
    if (!nb) return;
    nb.cells.forEach((cell, i) => {
      if (cell.type === 'code') {
        setTimeout(() => this.runCell(nbId, cell.id), i * 300);
      }
    });
  },
  
  // 获取变量（模拟）
  getVariables(nbId) {
    return [
      { name: 'x', type: 'ndarray', shape: '(100,)', value: 'array([0., 0.063, ...])' },
      { name: 'y', type: 'ndarray', shape: '(100,)', value: 'array([0., 0.063, ...])' },
      { name: 'model', type: 'RandomForestRegressor', shape: '-', value: 'RandomForestRegressor(n_estimators=100)' },
      { name: 'df', type: 'DataFrame', shape: '(1000, 12)', value: '1000 rows × 12 columns' },
      { name: 'energy', type: 'float', shape: '-', value: '-89.234 eV' }
    ];
  }
};

// ============================================================
// 四、列表渲染器
// ============================================================
const NotebookListRenderer = {
  currentTab: 'all',
  viewMode: 'list',
  searchQuery: '',
  
  render() {
    this.renderTabs();
    this.renderToolbar();
    this.renderList();
  },
  
  renderTabs() {
    const container = document.getElementById('notebook-tabs');
    if (!container) return;
    const all = NotebookManager.getAll();
    const counts = {
      all: all.length,
      recent: all.filter(nb => nb.updatedAt.includes('2026-08')).length,
      starred: all.filter(nb => nb.starred).length,
      shared: 0,
      trash: 0
    };
    container.innerHTML = `
      <div class="tab-bar">
        ${[
          {id:'all',name:'全部'},
          {id:'recent',name:'最近编辑'},
          {id:'starred',name:'收藏'},
          {id:'shared',name:'共享给我'},
          {id:'trash',name:'回收站'}
        ].map(tab => `<button class="tab-item ${this.currentTab===tab.id?'active':''}" onclick="NotebookListRenderer.setTab('${tab.id}')">${tab.name}${counts[tab.id]>0?` (${counts[tab.id]})`:''}</button>`).join('')}
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
        <input class="form-input" style="flex:1;padding:8px 12px;font-size:13px" placeholder="搜索Notebook..." value="${this.searchQuery}" oninput="NotebookListRenderer.search(this.value)">
        <button class="btn btn-primary" style="padding:8px 14px;font-size:13px" onclick="NotebookListRenderer.showNewMenu()"><i data-lucide="plus" class="lucide icon-white" style="width:16px;height:16px"></i>新建</button>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div class="chip-row">
          <span class="chip ${this.viewMode==='list'?'selected':''}" onclick="NotebookListRenderer.setView('list')"><i data-lucide="list" class="lucide" style="width:14px;height:14px"></i>列表</span>
          <span class="chip ${this.viewMode==='grid'?'selected':''}" onclick="NotebookListRenderer.setView('grid')"><i data-lucide="grid-3x3" class="lucide" style="width:14px;height:14px"></i>网格</span>
        </div>
        <select class="form-select" style="width:auto;padding:6px 10px;font-size:12px" onchange="NotebookListRenderer.sort(this.value)">
          <option value="updated">最近修改</option>
          <option value="created">创建时间</option>
          <option value="title">标题</option>
        </select>
      </div>
    `;
  },
  
  search(query) {
    this.searchQuery = query;
    this.renderList();
  },
  
  setView(mode) {
    this.viewMode = mode;
    this.render();
  },
  
  sort(method) {
    UI.toast.info('已按' + (method==='updated'?'最近修改':method==='created'?'创建时间':'标题') + '排序');
  },
  
  renderList() {
    const container = document.getElementById('notebook-list-content');
    if (!container) return;
    let notebooks = NotebookManager.getAll() || [];
    
    // 筛选
    if (this.currentTab === 'starred') notebooks = notebooks.filter(nb => nb.starred);
    if (this.currentTab === 'recent') notebooks = notebooks.filter(nb => (nb.updatedAt||'').includes('2026-08'));
    
    // 搜索
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      notebooks = notebooks.filter(nb => (nb.title||'').toLowerCase().includes(q) || (nb.tags||[]).some(t => (t||'').toLowerCase().includes(q)));
    }
    
    if (!notebooks || notebooks.length === 0) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">📓</div><div class="empty-text">暂无Notebook，点击上方"新建"开始</div></div>`;
      return;
    }
    
    if (this.viewMode === 'grid') {
      container.innerHTML = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">${notebooks.map(nb => this.renderGridCard(nb)).join('')}</div>`;
    } else {
      container.innerHTML = notebooks.map(nb => this.renderListItem(nb)).join('');
    }
    if (typeof renderIcons === 'function') renderIcons();
  },
  
  renderListItem(nb) {
    const kernel = NotebookKernels[nb.kernel] || NotebookKernels.python;
    const tags = nb.tags || [];
    return `
      <div class="card" onclick="navigateTo('page-notebook-detail','${_store(nb)}')">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div style="flex:1">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
              <div style="width:28px;height:28px;background:${kernel.color}22;border-radius:8px;display:flex;align-items:center;justify-content:center">
                <i data-lucide="${kernel.icon}" class="lucide" style="width:14px;height:14px;color:${kernel.color}"></i>
              </div>
              <span style="font-size:15px;font-weight:700">${nb.title||'未命名'}</span>
              ${nb.starred?'<i data-lucide="star" class="lucide" style="width:14px;height:14px;color:var(--yellow);fill:var(--yellow)"></i>':''}
            </div>
            <div style="font-size:12px;color:var(--text3);display:flex;gap:12px;flex-wrap:wrap">
              <span><i data-lucide="code" class="lucide" style="width:11px;height:11px"></i>${kernel.name}</span>
              <span><i data-lucide="layers" class="lucide" style="width:11px;height:11px"></i>${nb.cellCount||0} 单元格</span>
              <span><i data-lucide="clock" class="lucide" style="width:11px;height:11px"></i>${nb.updatedAt||''}</span>
            </div>
            ${tags.length>0?`<div class="chip-row" style="margin-top:8px">${tags.map(t=>`<span class="chip" style="font-size:10px;padding:2px 8px">${t}</span>`).join('')}</div>`:''}
          </div>
          <button onclick="event.stopPropagation();NotebookListRenderer.showMenu('${nb.id}')" style="background:none;border:none;cursor:pointer;padding:4px"><i data-lucide="more-vertical" class="lucide" style="width:18px;height:18px;color:var(--text3)"></i></button>
        </div>
      </div>
    `;
  },
  
  renderGridCard(nb) {
    const kernel = NotebookKernels[nb.kernel] || NotebookKernels.python;
    return `
      <div class="card" onclick="navigateTo('page-notebook-detail','${_store(nb)}')" style="padding:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div style="width:36px;height:36px;background:${kernel.color}22;border-radius:10px;display:flex;align-items:center;justify-content:center">
            <i data-lucide="${kernel.icon}" class="lucide" style="width:18px;height:18px;color:${kernel.color}"></i>
          </div>
          ${nb.starred?'<i data-lucide="star" class="lucide" style="width:16px;height:16px;color:var(--yellow);fill:var(--yellow)"></i>':'<i data-lucide="star" class="lucide" style="width:16px;height:16px;color:var(--border)"></i>'}
        </div>
        <div style="font-size:14px;font-weight:700;margin-bottom:6px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${nb.title||'未命名'}</div>
        <div style="font-size:11px;color:var(--text3)">${nb.cellCount||0} 单元格 · ${(nb.updatedAt||'').substring(5,10)}</div>
      </div>
    `;
  },
  
  showNewMenu() {
    UI.dialog.actionSheet({
      title: '新建 Notebook',
      actions: [
        { label: '空白 Notebook', icon: 'file-plus', onClick: () => this.createAndOpen('python', 'blank') },
        { label: 'DFT 分析模板', icon: 'atom', onClick: () => this.createAndOpen('python', 'dft') },
        { label: 'MD 后处理模板', icon: 'dna', onClick: () => this.createAndOpen('python', 'md') },
        { label: '数据可视化模板', icon: 'bar-chart-3', onClick: () => this.createAndOpen('python', 'dataviz') },
        { label: '机器学习模板', icon: 'brain', onClick: () => this.createAndOpen('python', 'ml') },
        { label: '从文件导入 (.ipynb)', icon: 'upload', onClick: () => UI.toast.info('选择文件导入') }
      ]
    });
  },
  
  createAndOpen(kernel, template) {
    const nb = NotebookManager.create(kernel, template);
    UI.toast.success('已创建新 Notebook');
    navigateTo('page-notebook-detail', _store(nb));
  },
  
  showMenu(nbId) {
    const nb = NotebookManager.get(nbId);
    if (!nb) return;
    UI.dialog.actionSheet({
      title: nb.title,
      actions: [
        { label: nb.starred?'取消收藏':'收藏', icon: 'star', onClick: () => { NotebookManager.toggleStar(nbId); this.render(); UI.toast.success(nb.starred?'已取消收藏':'已收藏'); } },
        { label: '重命名', icon: 'edit-3', onClick: () => UI.toast.info('重命名功能') },
        { label: '复制', icon: 'copy', onClick: () => { NotebookManager.duplicate(nbId); this.render(); UI.toast.success('已复制'); } },
        { label: '导出', icon: 'download', onClick: () => UI.toast.success('已导出 .ipynb') },
        { label: '分享', icon: 'share-2', onClick: () => UI.toast.info('生成分享链接') },
        { label: '删除', icon: 'trash-2', danger: true, onClick: () => { NotebookManager.delete(nbId); this.render(); UI.toast.success('已删除'); } }
      ]
    });
  }
};

// ============================================================
// 五、Notebook编辑器
// ============================================================
const NotebookEditor = {
  currentNotebook: null,
  selectedCellId: null,
  showVariables: false,
  showOutline: false,
  
  init(nb) {
    if (!nb || !nb.id) {
      const all = NotebookManager.getAll();
      nb = all[0];
    }
    this.currentNotebook = NotebookManager.get(nb.id) || nb;
    this.render();
  },
  
  render() {
    const nb = this.currentNotebook;
    if (!nb) return;
    
    // 标题
    const titleEl = document.getElementById('notebook-title');
    if (titleEl) titleEl.textContent = nb.title;
    
    // 工具栏
    this.renderToolbar();
    
    // 单元格列表
    this.renderCells();
    
    // 状态栏
    this.renderStatusBar();
  },
  
  renderToolbar() {
    const nb = this.currentNotebook;
    const kernel = NotebookKernels[nb.kernel] || NotebookKernels.python;
    const container = document.getElementById('notebook-toolbar-detail');
    if (!container) return;
    
    container.innerHTML = `
      <div style="display:flex;gap:6px;align-items:center;padding:8px 12px;background:var(--card);border-radius:12px;margin-bottom:12px;overflow-x:auto;flex-wrap:wrap">
        <select class="form-select" style="width:auto;padding:6px 10px;font-size:12px" onchange="NotebookEditor.changeKernel(this.value)">
          ${Object.values(NotebookKernels).map(k => `<option value="${k.id}" ${k.id===nb.kernel?'selected':''}>${k.name}</option>`).join('')}
        </select>
        <div style="width:1px;height:20px;background:var(--border)"></div>
        <button class="icon-btn" onclick="NotebookEditor.runAll()" title="运行全部"><i data-lucide="play" class="lucide" style="width:16px;height:16px;color:var(--green)"></i></button>
        <button class="icon-btn" onclick="NotebookEditor.interrupt()" title="中断"><i data-lucide="square" class="lucide" style="width:16px;height:16px;color:var(--primary)"></i></button>
        <button class="icon-btn" onclick="NotebookEditor.save()" title="保存"><i data-lucide="save" class="lucide" style="width:16px;height:16px"></i></button>
        <div style="width:1px;height:20px;background:var(--border)"></div>
        <button class="icon-btn" onclick="NotebookEditor.addCell('code')" title="添加代码"><i data-lucide="plus" class="lucide" style="width:16px;height:16px"></i></button>
        <button class="icon-btn" onclick="NotebookEditor.addCell('markdown')" title="添加Markdown"><i data-lucide="type" class="lucide" style="width:16px;height:16px"></i></button>
        <button class="icon-btn" onclick="NotebookEditor.moveSelected('up')" title="上移"><i data-lucide="arrow-up" class="lucide" style="width:16px;height:16px"></i></button>
        <button class="icon-btn" onclick="NotebookEditor.moveSelected('down')" title="下移"><i data-lucide="arrow-down" class="lucide" style="width:16px;height:16px"></i></button>
        <button class="icon-btn" onclick="NotebookEditor.deleteSelected()" title="删除"><i data-lucide="trash-2" class="lucide" style="width:16px;height:16px;color:var(--primary)"></i></button>
        <div style="width:1px;height:20px;background:var(--border)"></div>
        <button class="icon-btn ${this.showVariables?'active':''}" onclick="NotebookEditor.toggleVariables()" title="变量"><i data-lucide="database" class="lucide" style="width:16px;height:16px"></i></button>
        <button class="icon-btn" onclick="NotebookEditor.showAIAssistant()" title="AI助手"><i data-lucide="sparkles" class="lucide" style="width:16px;height:16px;color:var(--purple)"></i></button>
        <button class="icon-btn" onclick="NotebookEditor.exportNotebook()" title="导出"><i data-lucide="download" class="lucide" style="width:16px;height:16px"></i></button>
        <button class="icon-btn" onclick="NotebookEditor.showVersions()" title="版本"><i data-lucide="history" class="lucide" style="width:16px;height:16px"></i></button>
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
      html += this.renderCellHTML(cell, idx);
    });
    
    // 变量面板
    if (this.showVariables) {
      html += this.renderVariablesPanel();
    }
    
    container.innerHTML = html;
    if (typeof renderIcons === 'function') renderIcons();
  },
  
  renderCellHTML(cell, idx) {
    const isSelected = this.selectedCellId === cell.id;
    if (cell.type === 'markdown') {
      return `
        <div class="notebook-cell ${isSelected?'selected':''}" id="cell-${cell.id}" onclick="NotebookEditor.selectCell('${cell.id}')">
          <div class="cell-header">
            <span class="cell-type-badge md">Markdown</span>
            <div class="cell-actions">
              <button onclick="event.stopPropagation();NotebookEditor.runCell('${cell.id}')" class="cell-btn"><i data-lucide="play" class="lucide" style="width:12px;height:12px"></i></button>
              <button onclick="event.stopPropagation();NotebookEditor.moveCell('${cell.id}','up')" class="cell-btn"><i data-lucide="arrow-up" class="lucide" style="width:12px;height:12px"></i></button>
              <button onclick="event.stopPropagation();NotebookEditor.moveCell('${cell.id}','down')" class="cell-btn"><i data-lucide="arrow-down" class="lucide" style="width:12px;height:12px"></i></button>
              <button onclick="event.stopPropagation();NotebookEditor.deleteCell('${cell.id}')" class="cell-btn"><i data-lucide="trash-2" class="lucide" style="width:12px;height:12px"></i></button>
            </div>
          </div>
          <div class="cell-input markdown-cell" contenteditable="true" onblur="NotebookEditor.updateCellContent('${cell.id}', this.innerText)">${cell.content}</div>
        </div>
      `;
    }
    
    // 代码单元格
    const kernel = NotebookKernels[this.currentNotebook.kernel] || NotebookKernels.python;
    return `
      <div class="notebook-cell ${isSelected?'selected':''}" id="cell-${cell.id}" onclick="NotebookEditor.selectCell('${cell.id}')">
        <div class="cell-header">
          <span class="cell-type-badge code" style="background:${kernel.color}22;color:${kernel.color}">${kernel.name.split(' ')[0]}</span>
          <span class="cell-exec-count">${cell.executionCount?`[${cell.executionCount}]`:'[ ]'}</span>
          <div class="cell-actions">
            <button onclick="event.stopPropagation();NotebookEditor.runCell('${cell.id}')" class="cell-btn" ${cell.status==='running'?'disabled':''}>
              ${cell.status==='running'?'<span class="loading-spinner" style="width:12px;height:12px"></span>':'<i data-lucide="play" class="lucide" style="width:12px;height:12px;color:var(--green)"></i>'}
            </button>
            <button onclick="event.stopPropagation();NotebookEditor.moveCell('${cell.id}','up')" class="cell-btn"><i data-lucide="arrow-up" class="lucide" style="width:12px;height:12px"></i></button>
            <button onclick="event.stopPropagation();NotebookEditor.moveCell('${cell.id}','down')" class="cell-btn"><i data-lucide="arrow-down" class="lucide" style="width:12px;height:12px"></i></button>
            <button onclick="event.stopPropagation();NotebookEditor.deleteCell('${cell.id}')" class="cell-btn"><i data-lucide="trash-2" class="lucide" style="width:12px;height:12px;color:var(--primary)"></i></button>
          </div>
        </div>
        <textarea class="cell-input code-cell" onblur="NotebookEditor.updateCellContent('${cell.id}', this.value)" spellcheck="false">${cell.content}</textarea>
        ${cell.output?this.renderCellOutput(cell.output):''}
      </div>
    `;
  },
  
  renderCellOutput(output) {
    if (output.type === 'text') {
      return `<div class="cell-output"><pre>${output.data}</pre></div>`;
    }
    if (output.type === 'plot') {
      return `
        <div class="cell-output">
          <div style="height:200px;background:linear-gradient(180deg,#f8fafc,#f1f5f9);border-radius:8px;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center">
            <svg width="90%" height="90%" viewBox="0 0 400 180">
              <line x1="40" y1="150" x2="380" y2="150" stroke="#cbd5e1" stroke-width="1"/>
              <line x1="40" y1="30" x2="40" y2="150" stroke="#cbd5e1" stroke-width="1"/>
              <polyline points="40,120 80,100 120,80 160,90 200,60 240,70 280,50 320,65 360,45 380,55" fill="none" stroke="#ff6b4a" stroke-width="2"/>
              <polyline points="40,130 80,125 120,110 160,115 200,100 240,105 280,95 320,100 360,90 380,95" fill="none" stroke="#5ba3d9" stroke-width="2"/>
            </svg>
          </div>
          <div style="font-size:11px;color:var(--text3);margin-top:6px;text-align:center">matplotlib plot · 400×180</div>
        </div>
      `;
    }
    if (output.type === 'error') {
      return `<div class="cell-output error"><pre style="color:#dc2626">${output.data}</pre></div>`;
    }
    return `<div class="cell-output"><pre>${output.data||''}</pre></div>`;
  },
  
  renderVariablesPanel() {
    const vars = NotebookManager.getVariables(this.currentNotebook.id);
    return `
      <div class="card" style="margin-top:16px">
        <div class="card-title" style="margin-bottom:12px"><i data-lucide="database" class="lucide" style="width:16px;height:16px;color:var(--purple)"></i>变量查看器 (${vars.length})</div>
        <div style="overflow-x:auto">
          <table style="width:100%;font-size:12px;border-collapse:collapse">
            <thead><tr style="background:var(--bg-secondary)"><th style="padding:8px;text-align:left">变量名</th><th style="padding:8px;text-align:left">类型</th><th style="padding:8px;text-align:left">形状</th><th style="padding:8px;text-align:left">值</th></tr></thead>
            <tbody>
              ${vars.map(v => `<tr style="border-bottom:1px solid var(--border)"><td style="padding:8px;font-weight:600;color:var(--primary)">${v.name}</td><td style="padding:8px;color:var(--purple)">${v.type}</td><td style="padding:8px;font-family:monospace">${v.shape}</td><td style="padding:8px;color:var(--text2);font-size:11px">${v.value}</td></tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },
  
  renderStatusBar() {
    const nb = this.currentNotebook;
    const kernel = NotebookKernels[nb.kernel] || NotebookKernels.python;
    const container = document.getElementById('notebook-status');
    if (!container) return;
    container.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 16px;background:var(--card);border-radius:10px;font-size:11px;color:var(--text3)">
        <div style="display:flex;gap:16px;align-items:center">
          <span style="display:flex;align-items:center;gap:4px"><span style="width:8px;height:8px;background:var(--green);border-radius:50%"></span>${kernel.name} 已连接</span>
          <span>内存: 256MB / 2GB</span>
          <span>单元格: ${nb.cells.length}</span>
        </div>
        <div>最后保存: ${nb.updatedAt}</div>
      </div>
    `;
  },
  
  // 单元格操作
  selectCell(cellId) {
    this.selectedCellId = cellId;
    document.querySelectorAll('.notebook-cell').forEach(c => c.classList.remove('selected'));
    const el = document.getElementById('cell-' + cellId);
    if (el) el.classList.add('selected');
  },
  
  addCell(type) {
    const cell = NotebookManager.addCell(this.currentNotebook.id, type);
    if (cell) {
      this.selectedCellId = cell.id;
      this.render();
      UI.toast.success('已添加' + (type==='code'?'代码':'Markdown') + '单元格');
    }
  },
  
  deleteCell(cellId) {
    if (this.currentNotebook.cells.length <= 1) {
      UI.toast.warning('至少保留一个单元格');
      return;
    }
    NotebookManager.deleteCell(this.currentNotebook.id, cellId);
    this.render();
    UI.toast.success('已删除单元格');
  },
  
  moveCell(cellId, direction) {
    NotebookManager.moveCell(this.currentNotebook.id, cellId, direction);
    this.render();
  },
  
  moveSelected(direction) {
    if (this.selectedCellId) this.moveCell(this.selectedCellId, direction);
    else UI.toast.info('请先选择一个单元格');
  },
  
  deleteSelected() {
    if (this.selectedCellId) this.deleteCell(this.selectedCellId);
    else UI.toast.info('请先选择一个单元格');
  },
  
  updateCellContent(cellId, content) {
    const cell = this.currentNotebook.cells.find(c => c.id === cellId);
    if (cell) cell.content = content;
  },
  
  runCell(cellId) {
    NotebookManager.runCell(this.currentNotebook.id, cellId);
    this.renderCell(cellId);
  },
  
  renderCell(cellId) {
    const cell = this.currentNotebook.cells.find(c => c.id === cellId);
    if (!cell) return;
    const container = document.getElementById('cell-' + cellId);
    if (container) {
      const idx = this.currentNotebook.cells.findIndex(c => c.id === cellId);
      container.outerHTML = this.renderCellHTML(cell, idx);
    }
    if (typeof renderIcons === 'function') renderIcons();
  },
  
  runAll() {
    UI.toast.info('正在运行所有单元格...');
    NotebookManager.runAll(this.currentNotebook.id);
    setTimeout(() => this.render(), 2000);
  },
  
  interrupt() {
    UI.toast.info('已发送中断信号');
  },
  
  save() {
    NotebookManager.save(this.currentNotebook.id);
    UI.toast.success('已保存');
    this.renderStatusBar();
  },
  
  changeKernel(kernelId) {
    this.currentNotebook.kernel = kernelId;
    UI.toast.success('已切换到 ' + (NotebookKernels[kernelId]?.name || kernelId));
    this.render();
  },
  
  toggleVariables() {
    this.showVariables = !this.showVariables;
    this.render();
  },
  
  showAIAssistant() {
    UI.dialog.prompt({
      title: 'AI 编程助手',
      message: '输入你的需求，AI将生成代码或解释现有代码',
      placeholder: '例如：生成一个绘制能带结构的代码',
      confirmText: '生成',
      onConfirm: (text) => {
        UI.toast.info('AI正在生成代码...');
        setTimeout(() => {
          const cell = NotebookManager.addCell(this.currentNotebook.id, 'code');
          if (cell) {
            cell.content = `# AI生成: ${text}\nimport numpy as np\nimport matplotlib.pyplot as plt\n\n# TODO: 实现 ${text}\nprint("AI代码已生成，请根据需要修改")`;
            this.render();
            UI.toast.success('AI代码已生成');
          }
        }, 1500);
      }
    });
  },
  
  exportNotebook() {
    UI.dialog.actionSheet({
      title: '导出 Notebook',
      actions: [
        { label: '导出为 .ipynb', icon: 'file-code', onClick: () => UI.toast.success('已导出 .ipynb') },
        { label: '导出为 Python (.py)', icon: 'code-2', onClick: () => UI.toast.success('已导出 .py') },
        { label: '导出为 PDF', icon: 'file-text', onClick: () => UI.toast.success('已导出 PDF') },
        { label: '导出为 HTML', icon: 'globe', onClick: () => UI.toast.success('已导出 HTML') },
        { label: '导出为 Markdown', icon: 'type', onClick: () => UI.toast.success('已导出 Markdown') }
      ]
    });
  },
  
  showVersions() {
    const nb = this.currentNotebook;
    UI.dialog.alert({
      title: '版本历史',
      message: nb.versions.map(v => `v${v.version} · ${v.time}\n${v.note}`).join('\n\n') + '\n\n点击版本可查看对比或回滚',
      confirmText: '关闭'
    });
  }
};

console.log('[UniSci] 板块5 Notebook系统已加载');
