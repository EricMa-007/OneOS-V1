/**
 * UniSci Platform V2 - 板块8: 材料数据库系统
 * 包含: 材料搜索/筛选/分类/列表/详情/图表/对比/收藏/导出
 */

'use strict';

// ============================================================
// 一、材料数据库（模拟数据）
// ============================================================
const MaterialsDB = [
  { id: 'mat_001', formula: 'MoS2', name: '二硫化钼', category: '二维材料', bandgap: 1.8, type: '半导体', crystal: '六方', spacegroup: 'P63/mmc', atoms: 9, density: 5.06, energy: -89.23, formation_energy: -1.23, elastic_modulus: 230, thermal_conductivity: 35, dielectric: 4.5, magnetic: '非磁性', tags: ['TMDC','半导体','光电'], description: '典型的过渡金属二硫化物，具有优异的光电性能，是柔性电子和光电器件的理想材料。' },
  { id: 'mat_002', formula: 'Graphene', name: '石墨烯', category: '二维材料', bandgap: 0, type: '半金属', crystal: '六方', spacegroup: 'P6/mmm', atoms: 2, density: 2.27, energy: -15.43, formation_energy: 0, elastic_modulus: 1050, thermal_conductivity: 5300, dielectric: 3.0, magnetic: '非磁性', tags: ['碳材料','半金属','高导热'], description: '单层碳原子构成的二维材料，具有极高的载流子迁移率和热导率，是下一代电子器件的核心材料。' },
  { id: 'mat_003', formula: 'Bi2Se3', name: '硒化铋', category: '拓扑材料', bandgap: 0.3, type: '拓扑绝缘体', crystal: '三方', spacegroup: 'R-3m', atoms: 5, density: 7.64, energy: -45.67, formation_energy: -0.89, elastic_modulus: 45, thermal_conductivity: 2.5, dielectric: 110, magnetic: '非磁性', tags: ['拓扑绝缘体','热电','量子'], description: '典型的三维拓扑绝缘体，表面具有受拓扑保护的金属态，在自旋电子学和量子计算领域有重要应用。' },
  { id: 'mat_004', formula: 'YBCO', name: '钇钡铜氧', category: '超导材料', bandgap: 0, type: '超导体', crystal: '正交', spacegroup: 'Pmmm', atoms: 13, density: 6.38, energy: -156.78, formation_energy: -2.34, elastic_modulus: 180, thermal_conductivity: 8, dielectric: 25, magnetic: '反铁磁', tags: ['高温超导','铜氧化物','强关联'], description: '第一个液氮温区超导体，Tc=92K，是高温超导研究的经典材料体系。' },
  { id: 'mat_005', formula: 'Pt', name: '铂', category: '催化剂', bandgap: 0, type: '金属', crystal: '立方', spacegroup: 'Fm-3m', atoms: 1, density: 21.45, energy: -6.12, formation_energy: 0, elastic_modulus: 168, thermal_conductivity: 72, dielectric: 0, magnetic: '非磁性', tags: ['贵金属','催化剂','燃料电池'], description: '优良的催化剂，广泛应用于燃料电池、汽车尾气净化和化工催化领域。' },
  { id: 'mat_006', formula: 'Si', name: '硅', category: '半导体', bandgap: 1.12, type: '半导体', crystal: '立方', spacegroup: 'Fd-3m', atoms: 2, density: 2.33, energy: -8.74, formation_energy: 0, elastic_modulus: 130, thermal_conductivity: 150, dielectric: 11.7, magnetic: '非磁性', tags: ['半导体','微电子','光伏'], description: '现代微电子工业的基础材料，具有成熟的制备工艺和优异的半导体性能。' },
  { id: 'mat_007', formula: 'GaN', name: '氮化镓', category: '半导体', bandgap: 3.4, type: '半导体', crystal: '六方', spacegroup: 'P63mc', atoms: 2, density: 6.15, energy: -12.34, formation_energy: -1.56, elastic_modulus: 210, thermal_conductivity: 130, dielectric: 9.5, magnetic: '非磁性', tags: ['宽禁带','LED','功率器件'], description: '第三代半导体材料，具有宽禁带、高击穿电场和高电子饱和速度，是蓝光LED和高频功率器件的核心材料。' },
  { id: 'mat_008', formula: 'hBN', name: '六方氮化硼', category: '二维材料', bandgap: 5.9, type: '绝缘体', crystal: '六方', spacegroup: 'P63/mmc', atoms: 2, density: 2.28, energy: -10.56, formation_energy: -1.34, elastic_modulus: 400, thermal_conductivity: 400, dielectric: 4.0, magnetic: '非磁性', tags: ['二维材料','绝缘体','衬底'], description: '白色石墨烯，具有优异的绝缘性能和化学稳定性，是二维器件的理想衬底材料。' },
  { id: 'mat_009', formula: 'FeSe', name: '硒化亚铁', category: '超导材料', bandgap: 0, type: '超导体', crystal: '四方', spacegroup: 'P4/nmm', atoms: 2, density: 6.78, energy: -23.45, formation_energy: -0.67, elastic_modulus: 90, thermal_conductivity: 15, dielectric: 0, magnetic: '反铁磁', tags: ['铁基超导','薄膜','界面超导'], description: '结构最简单的铁基超导体，在薄膜和界面状态下表现出极高的超导转变温度。' },
  { id: 'mat_010', formula: 'TiO2', name: '二氧化钛', category: '催化剂', bandgap: 3.2, type: '半导体', crystal: '四方', spacegroup: 'P42/mnm', atoms: 6, density: 4.23, energy: -34.56, formation_energy: -3.45, elastic_modulus: 230, thermal_conductivity: 12, dielectric: 86, magnetic: '非磁性', tags: ['光催化','光伏','涂料'], description: '最常用的光催化材料，在紫外光照射下具有优异的光催化活性，广泛应用于环境净化和能源转换。' },
  { id: 'mat_011', formula: 'CsPbI3', name: '碘化铅铯', category: '光伏材料', bandgap: 1.73, type: '半导体', crystal: '立方', spacegroup: 'Pm-3m', atoms: 5, density: 4.89, energy: -28.90, formation_energy: -0.45, elastic_modulus: 15, thermal_conductivity: 0.5, dielectric: 6.5, magnetic: '非磁性', tags: ['钙钛矿','光伏','LED'], description: '全无机钙钛矿材料，具有优异的光电性能和热稳定性，是新一代太阳能电池和LED的热门材料。' },
  { id: 'mat_012', formula: 'LiFePO4', name: '磷酸铁锂', category: '电池材料', bandgap: 3.8, type: '绝缘体', crystal: '正交', spacegroup: 'Pnma', atoms: 7, density: 3.60, energy: -56.78, formation_energy: -4.56, elastic_modulus: 110, thermal_conductivity: 3, dielectric: 0, magnetic: '顺磁', tags: ['锂电池','正极材料','储能'], description: '最安全的锂离子电池正极材料，具有优异的循环寿命和热稳定性，广泛应用于电动汽车和储能系统。' },
  { id: 'mat_013', formula: 'WS2', name: '二硫化钨', category: '二维材料', bandgap: 1.35, type: '半导体', crystal: '六方', spacegroup: 'P63/mmc', atoms: 9, density: 7.5, energy: -67.89, formation_energy: -1.45, elastic_modulus: 250, thermal_conductivity: 40, dielectric: 5.2, magnetic: '非磁性', tags: ['TMDC','半导体','谷电子学'], description: '过渡金属二硫化物，具有独特的谷电子学特性，在谷电子学和光电子器件领域有重要应用。' },
  { id: 'mat_014', formula: 'MoSe2', name: '二硒化钼', category: '二维材料', bandgap: 1.1, type: '半导体', crystal: '六方', spacegroup: 'P63/mmc', atoms: 9, density: 6.0, energy: -56.34, formation_energy: -1.12, elastic_modulus: 210, thermal_conductivity: 30, dielectric: 4.8, magnetic: '非磁性', tags: ['TMDC','半导体','光电'], description: '过渡金属二硒化物，具有较窄的带隙和优异的光吸收性能，在光电器件和柔性电子领域有应用前景。' },
  { id: 'mat_015', formula: 'BP', name: '黑磷', category: '二维材料', bandgap: 0.3, type: '半导体', crystal: '正交', spacegroup: 'Cmce', atoms: 4, density: 2.69, energy: -18.45, formation_energy: -0.34, elastic_modulus: 42, thermal_conductivity: 12, dielectric: 7.5, magnetic: '非磁性', tags: ['二维材料','半导体','各向异性'], description: '具有独特的褶皱层状结构和强各向异性，带隙可通过层数调控，在红外光电器件和各向异性电子学领域有重要应用。' },
  { id: 'mat_016', formula: 'Bi2Te3', name: '碲化铋', category: '拓扑材料', bandgap: 0.15, type: '拓扑绝缘体', crystal: '三方', spacegroup: 'R-3m', atoms: 5, density: 7.86, energy: -38.90, formation_energy: -0.78, elastic_modulus: 50, thermal_conductivity: 1.5, dielectric: 120, magnetic: '非磁性', tags: ['拓扑绝缘体','热电','制冷'], description: '经典的拓扑绝缘体和热电材料，在室温下具有优异的热电性能，广泛应用于热电制冷和发电领域。' },
  { id: 'mat_017', formula: 'MgB2', name: '二硼化镁', category: '超导材料', bandgap: 0, type: '超导体', crystal: '六方', spacegroup: 'P6/mmm', atoms: 3, density: 2.57, energy: -28.67, formation_energy: -1.89, elastic_modulus: 150, thermal_conductivity: 30, dielectric: 0, magnetic: '非磁性', tags: ['常规超导','轻元素','高临界场'], description: '临界温度最高的常规超导体，Tc=39K，具有简单的晶体结构和优异的超导性能，在超导磁体和电子器件领域有应用。' },
  { id: 'mat_018', formula: 'GaAs', name: '砷化镓', category: '半导体', bandgap: 1.42, type: '半导体', crystal: '立方', spacegroup: 'F-43m', atoms: 2, density: 5.32, energy: -14.56, formation_energy: -0.89, elastic_modulus: 85, thermal_conductivity: 45, dielectric: 12.9, magnetic: '非磁性', tags: ['化合物半导体','光电子','高频'], description: '第二代化合物半导体，具有高电子迁移率和直接带隙，广泛应用于光电子器件、高频电子器件和太阳能电池。' },
  { id: 'mat_019', formula: 'SiC', name: '碳化硅', category: '半导体', bandgap: 3.26, type: '半导体', crystal: '六方', spacegroup: 'P63mc', atoms: 2, density: 3.21, energy: -12.34, formation_energy: -1.56, elastic_modulus: 450, thermal_conductivity: 490, dielectric: 9.7, magnetic: '非磁性', tags: ['宽禁带','功率器件','高温'], description: '第三代宽禁带半导体材料，具有高击穿电场、高热导率和高电子饱和速度，是高温、高频、高功率电子器件的理想材料。' },
  { id: 'mat_020', formula: 'Pd', name: '钯', category: '催化剂', bandgap: 0, type: '金属', crystal: '立方', spacegroup: 'Fm-3m', atoms: 1, density: 12.02, energy: -5.34, formation_energy: 0, elastic_modulus: 120, thermal_conductivity: 72, dielectric: 0, magnetic: '顺磁', tags: ['贵金属','催化剂','储氢'], description: '优良的催化剂和储氢材料，广泛应用于催化反应、氢气存储和电子器件领域。' },
  { id: 'mat_021', formula: 'RuO2', name: '二氧化钌', category: '催化剂', bandgap: 0, type: '金属', crystal: '四方', spacegroup: 'P42/mnm', atoms: 6, density: 6.97, energy: -28.90, formation_energy: -2.34, elastic_modulus: 200, thermal_conductivity: 20, dielectric: 0, magnetic: '非磁性', tags: ['电催化','析氧反应','电极'], description: '优良的电催化剂，特别是在析氧反应（OER）中表现优异，广泛应用于电解水、燃料电池和超级电容器。' },
  { id: 'mat_022', formula: 'CH3NH3PbI3', name: '甲脒铅碘', category: '光伏材料', bandgap: 1.55, type: '半导体', crystal: '四方', spacegroup: 'I4/mcm', atoms: 12, density: 4.0, energy: -32.45, formation_energy: -0.34, elastic_modulus: 10, thermal_conductivity: 0.3, dielectric: 25, magnetic: '非磁性', tags: ['钙钛矿','光伏','杂化'], description: '有机-无机杂化钙钛矿材料，具有优异的光电性能和高吸收系数，是新一代高效率太阳能电池的明星材料。' },
  { id: 'mat_023', formula: 'NMC', name: '镍锰钴酸锂', category: '电池材料', bandgap: 0, type: '金属', crystal: '六方', spacegroup: 'R-3m', atoms: 12, density: 4.8, energy: -67.89, formation_energy: -3.45, elastic_modulus: 130, thermal_conductivity: 5, dielectric: 0, magnetic: '顺磁', tags: ['锂电池','高能量密度','正极材料'], description: '高能量密度锂离子电池正极材料，通过镍锰钴三元协同，兼具高容量、高电压和良好的循环性能，广泛应用于电动汽车。' },
  { id: 'mat_024', formula: 'Graphite', name: '石墨', category: '电池材料', bandgap: 0, type: '半金属', crystal: '六方', spacegroup: 'P63/mmc', atoms: 4, density: 2.25, energy: -30.56, formation_energy: 0, elastic_modulus: 35, thermal_conductivity: 150, dielectric: 3.0, magnetic: '非磁性', tags: ['碳材料','锂电池','负极材料'], description: '最常用的锂离子电池负极材料，具有层状结构和优异的锂离子嵌入/脱嵌性能，是商业化锂离子电池的标准负极材料。' },
  { id: 'mat_025', formula: 'Fe', name: '铁', category: '磁性材料', bandgap: 0, type: '金属', crystal: '立方', spacegroup: 'Im-3m', atoms: 2, density: 7.87, energy: -8.67, formation_energy: 0, elastic_modulus: 211, thermal_conductivity: 80, dielectric: 0, magnetic: '铁磁', tags: ['铁磁','软磁','结构材料'], description: '最常用的铁磁性材料，具有高饱和磁化强度和低矫顽力，广泛应用于变压器、电机和电磁器件。' },
  { id: 'mat_026', formula: 'NdFeB', name: '钕铁硼', category: '磁性材料', bandgap: 0, type: '金属', crystal: '四方', spacegroup: 'P42/mnm', atoms: 68, density: 7.5, energy: -89.34, formation_energy: -2.34, elastic_modulus: 160, thermal_conductivity: 9, dielectric: 0, magnetic: '铁磁', tags: ['稀土永磁','高磁能积','硬磁'], description: '目前磁能积最高的永磁材料，具有优异的磁性能和较高的居里温度，广泛应用于电机、扬声器、磁共振成像和风力发电。' },
  { id: 'mat_027', formula: 'InP', name: '磷化铟', category: '半导体', bandgap: 1.35, type: '半导体', crystal: '立方', spacegroup: 'F-43m', atoms: 2, density: 4.81, energy: -12.89, formation_energy: -0.78, elastic_modulus: 60, thermal_conductivity: 68, dielectric: 12.5, magnetic: '非磁性', tags: ['化合物半导体','光通信','高频'], description: '重要的化合物半导体材料，具有高电子迁移率和直接带隙，广泛应用于光通信器件、高频电子器件和太阳能电池。' }
];

// 材料分类
const MaterialCategories = [
  { id: 'all', name: '全部', icon: 'layers' },
  { id: '二维材料', name: '二维材料', icon: 'layout-grid' },
  { id: '拓扑材料', name: '拓扑材料', icon: 'infinity' },
  { id: '超导材料', name: '超导材料', icon: 'zap' },
  { id: '半导体', name: '半导体', icon: 'cpu' },
  { id: '催化剂', name: '催化剂', icon: 'flask-conical' },
  { id: '光伏材料', name: '光伏材料', icon: 'sun' },
  { id: '电池材料', name: '电池材料', icon: 'battery-charging' },
  { id: '磁性材料', name: '磁性材料', icon: 'magnet' }
];

// ============================================================
// 二、材料管理器
// ============================================================
const MaterialManager = {
  // 搜索材料
  search(query) {
    if (!query) return MaterialsDB;
    const q = query.toLowerCase();
    return MaterialsDB.filter(m => 
      m.formula.toLowerCase().includes(q) ||
      m.name.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q) ||
      m.tags.some(t => t.toLowerCase().includes(q))
    );
  },
  
  // 按分类筛选
  filterByCategory(category) {
    if (category === 'all') return MaterialsDB;
    return MaterialsDB.filter(m => m.category === category);
  },
  
  // 高级筛选
  advancedFilter(filters) {
    return MaterialsDB.filter(m => {
      if (filters.type && m.type !== filters.type) return false;
      if (filters.crystal && m.crystal !== filters.crystal) return false;
      if (filters.magnetic && m.magnetic !== filters.magnetic) return false;
      if (filters.bandgapMin !== undefined && m.bandgap < filters.bandgapMin) return false;
      if (filters.bandgapMax !== undefined && m.bandgap > filters.bandgapMax) return false;
      return true;
    });
  },
  
  // 获取材料详情
  get(id) {
    return MaterialsDB.find(m => m.id === id) || null;
  },
  
  // 获取收藏
  getFavorites() {
    const user = UserManager.getCurrentUser();
    return user.favoriteMaterials || [];
  },
  
  // 切换收藏
  toggleFavorite(id) {
    const user = UserManager.getCurrentUser();
    if (!user.favoriteMaterials) user.favoriteMaterials = [];
    const idx = user.favoriteMaterials.indexOf(id);
    if (idx >= 0) {
      user.favoriteMaterials.splice(idx, 1);
      return false;
    } else {
      user.favoriteMaterials.push(id);
      return true;
    }
  },
  
  // 是否收藏
  isFavorite(id) {
    return this.getFavorites().includes(id);
  },
  
  // 获取相关推荐
  getRelated(id, count = 4) {
    const mat = this.get(id);
    if (!mat) return [];
    return MaterialsDB.filter(m => m.id !== id && (m.category === mat.category || m.type === mat.type)).slice(0, count);
  },
  
  // 对比材料
  compare(ids) {
    return ids.map(id => this.get(id)).filter(Boolean);
  },
  
  // 导出材料数据
  exportData(ids, format) {
    const materials = ids.map(id => this.get(id)).filter(Boolean);
    if (format === 'csv') {
      const headers = ['formula','name','category','bandgap','type','crystal','density','energy'];
      let csv = headers.join(',') + '\n';
      materials.forEach(m => { csv += headers.map(h => m[h]).join(',') + '\n'; });
      return csv;
    }
    if (format === 'json') return JSON.stringify(materials, null, 2);
    return materials;
  }
};

// ============================================================
// 三、材料列表渲染器
// ============================================================
const MaterialListRenderer = {
  currentCategory: 'all',
  currentView: 'list', // list, grid, compact
  searchQuery: '',
  showFilter: false,
  filters: {},
  
  render() {
    this.renderCategories();
    this.renderToolbar();
    this.renderList();
  },
  
  renderCategories() {
    const container = document.getElementById('material-categories');
    if (!container) return;
    container.innerHTML = `
      <div class="tab-bar" style="overflow-x:auto;flex-wrap:nowrap">
        ${MaterialCategories.map(cat => `
          <button class="tab-item ${this.currentCategory===cat.id?'active':''}" onclick="MaterialListRenderer.setCategory('${cat.id}')" style="white-space:nowrap">
            <i data-lucide="${cat.icon}" class="lucide" style="width:12px;height:12px"></i>${cat.name}
          </button>
        `).join('')}
      </div>
    `;
  },
  
  setCategory(cat) {
    this.currentCategory = cat;
    this.render();
  },
  
  renderToolbar() {
    const container = document.getElementById('material-toolbar');
    if (!container) return;
    const results = this.getFilteredMaterials();
    container.innerHTML = `
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
        <div style="flex:1;position:relative">
          <i data-lucide="search" class="lucide" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);width:16px;height:16px;color:var(--text3)"></i>
          <input class="form-input" style="padding-left:36px" placeholder="搜索材料名称、化学式、标签..." value="${this.searchQuery}" oninput="MaterialListRenderer.search(this.value)">
        </div>
        <button class="icon-btn ${this.showFilter?'active':''}" onclick="MaterialListRenderer.toggleFilter()" style="background:${this.showFilter?'var(--primary)':'var(--card)'};color:${this.showFilter?'#fff':'var(--text)'}"><i data-lucide="filter" class="lucide" style="width:18px;height:18px"></i></button>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <span style="font-size:12px;color:var(--text3)">共 ${results.length} 种材料</span>
        <div class="chip-row">
          <span class="chip ${this.currentView==='list'?'selected':''}" onclick="MaterialListRenderer.setView('list')"><i data-lucide="list" class="lucide" style="width:12px;height:12px"></i>列表</span>
          <span class="chip ${this.currentView==='grid'?'selected':''}" onclick="MaterialListRenderer.setView('grid')"><i data-lucide="grid-3x3" class="lucide" style="width:12px;height:12px"></i>网格</span>
          <span class="chip" onclick="MaterialListRenderer.showCompare()"><i data-lucide="git-compare" class="lucide" style="width:12px;height:12px"></i>对比</span>
        </div>
      </div>
      ${this.showFilter ? this.renderFilterPanel() : ''}
    `;
  },
  
  renderFilterPanel() {
    return `
      <div class="card" style="margin-bottom:12px;padding:14px">
        <div style="font-size:13px;font-weight:700;margin-bottom:10px"><i data-lucide="sliders" class="lucide" style="width:14px;height:14px;color:var(--primary)"></i>高级筛选</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div><label style="font-size:11px;color:var(--text3)">材料类型</label>
            <select class="form-select" style="padding:6px 10px;font-size:12px" onchange="MaterialListRenderer.setFilter('type',this.value)">
              <option value="">全部</option><option>半导体</option><option>金属</option><option>绝缘体</option><option>超导体</option><option>半金属</option><option>拓扑绝缘体</option>
            </select>
          </div>
          <div><label style="font-size:11px;color:var(--text3)">晶系</label>
            <select class="form-select" style="padding:6px 10px;font-size:12px" onchange="MaterialListRenderer.setFilter('crystal',this.value)">
              <option value="">全部</option><option>立方</option><option>六方</option><option>四方</option><option>正交</option><option>三方</option>
            </select>
          </div>
          <div><label style="font-size:11px;color:var(--text3)">带隙最小(eV)</label>
            <input class="form-input" style="padding:6px 10px;font-size:12px" type="number" placeholder="0" onchange="MaterialListRenderer.setFilter('bandgapMin',parseFloat(this.value))">
          </div>
          <div><label style="font-size:11px;color:var(--text3)">带隙最大(eV)</label>
            <input class="form-input" style="padding:6px 10px;font-size:12px" type="number" placeholder="10" onchange="MaterialListRenderer.setFilter('bandgapMax',parseFloat(this.value))">
          </div>
        </div>
        <button class="btn btn-secondary" style="width:100%;margin-top:10px;padding:6px;font-size:12px" onclick="MaterialListRenderer.clearFilters()">清除筛选</button>
      </div>
    `;
  },
  
  getFilteredMaterials() {
    let results = MaterialManager.search(this.searchQuery);
    if (this.currentCategory !== 'all') {
      results = results.filter(m => m.category === this.currentCategory);
    }
    results = MaterialManager.advancedFilter({...this.filters, ...(this.filters.type?{type:this.filters.type}:{}), ...(this.filters.crystal?{crystal:this.filters.crystal}:{})});
    // 重新应用搜索和分类（advancedFilter会覆盖）
    results = MaterialManager.search(this.searchQuery);
    if (this.currentCategory !== 'all') results = results.filter(m => m.category === this.currentCategory);
    if (this.filters.type) results = results.filter(m => m.type === this.filters.type);
    if (this.filters.crystal) results = results.filter(m => m.crystal === this.filters.crystal);
    if (this.filters.bandgapMin !== undefined) results = results.filter(m => m.bandgap >= this.filters.bandgapMin);
    if (this.filters.bandgapMax !== undefined) results = results.filter(m => m.bandgap <= this.filters.bandgapMax);
    return results;
  },
  
  search(query) {
    this.searchQuery = query;
    this.renderList();
  },
  
  setView(view) {
    this.currentView = view;
    this.render();
  },
  
  toggleFilter() {
    this.showFilter = !this.showFilter;
    this.renderToolbar();
    if (typeof renderIcons === 'function') renderIcons();
  },
  
  setFilter(key, value) {
    if (value === '' || value === null) delete this.filters[key];
    else this.filters[key] = value;
    this.renderList();
  },
  
  clearFilters() {
    this.filters = {};
    this.render();
  },
  
  renderList() {
    const container = document.getElementById('material-list');
    if (!container) return;
    const materials = this.getFilteredMaterials();
    
    if (materials.length === 0) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-text">未找到匹配的材料</div></div>`;
      return;
    }
    
    if (this.currentView === 'grid') {
      container.innerHTML = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${materials.map(m => this.renderGridCard(m)).join('')}</div>`;
    } else {
      container.innerHTML = materials.map(m => this.renderListItem(m)).join('');
    }
    if (typeof renderIcons === 'function') renderIcons();
  },
  
  renderListItem(m) {
    const isFav = MaterialManager.isFavorite(m.id);
    return `
      <div class="card" onclick="navigateTo('page-material-detail','${_store(m)}')">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div style="flex:1">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
              <span style="font-size:16px;font-weight:800;color:var(--primary)">${m.formula}</span>
              <span style="font-size:13px;font-weight:600">${m.name}</span>
              <span class="card-badge" style="background:var(--bg-secondary);color:var(--text2);font-size:10px">${m.category}</span>
            </div>
            <div style="font-size:12px;color:var(--text3);display:flex;gap:12px;flex-wrap:wrap;margin-bottom:6px">
              <span>带隙: <b style="color:var(--text2)">${m.bandgap} eV</b></span>
              <span>类型: <b style="color:var(--text2)">${m.type}</b></span>
              <span>晶系: <b style="color:var(--text2)">${m.crystal}</b></span>
              <span>密度: <b style="color:var(--text2)">${m.density} g/cm³</b></span>
            </div>
            <div class="chip-row">${m.tags.slice(0,3).map(t => `<span class="chip" style="font-size:10px;padding:2px 8px">${t}</span>`).join('')}</div>
          </div>
          <button onclick="event.stopPropagation();MaterialListRenderer.toggleFav('${m.id}')" style="background:none;border:none;cursor:pointer;padding:4px">
            <i data-lucide="star" class="lucide" style="width:20px;height:20px;${isFav?'color:var(--yellow);fill:var(--yellow)':'color:var(--border)'}"></i>
          </button>
        </div>
      </div>
    `;
  },
  
  renderGridCard(m) {
    return `
      <div class="card" onclick="navigateTo('page-material-detail','${_store(m)}')" style="padding:14px">
        <div style="font-size:18px;font-weight:800;color:var(--primary);margin-bottom:2px">${m.formula}</div>
        <div style="font-size:12px;font-weight:600;margin-bottom:8px">${m.name}</div>
        <div style="font-size:11px;color:var(--text3);line-height:1.6">
          <div>带隙: <b>${m.bandgap} eV</b></div>
          <div>${m.type} · ${m.crystal}</div>
        </div>
      </div>
    `;
  },
  
  toggleFav(id) {
    const isFav = MaterialManager.toggleFavorite(id);
    UI.toast.success(isFav ? '已添加到收藏' : '已取消收藏');
    this.renderList();
  },
  
  showCompare() {
    UI.dialog.alert({
      title: '材料对比',
      message: '在材料列表中长按或点击材料卡片右上角的对比按钮，可选择最多5种材料进行对比。\n\n当前支持对比的属性：带隙、类型、晶系、密度、弹性模量、热导率、介电常数等。',
      confirmText: '知道了'
    });
  }
};

// ============================================================
// 四、材料详情渲染器
// ============================================================
const MaterialDetailRenderer = {
  currentTab: 'overview',
  
  init(material) {
    if (!material || !material.id) {
      material = MaterialsDB[0];
    }
    this.currentMaterial = MaterialManager.get(material.id) || material;
    this.render();
  },
  
  render() {
    const m = this.currentMaterial;
    if (!m) return;
    
    // 标题
    const titleEl = document.getElementById('material-detail-title');
    if (titleEl) titleEl.textContent = m.formula + ' ' + m.name;
    
    this.renderHeader();
    this.renderTabs();
    this.renderTabContent();
    this.renderRelated();
    
    // 晶体结构可视化（增强模块）
    if (typeof MaterialsEnhancements !== 'undefined') {
      const crystalContainer = document.getElementById('material-crystal-viewer');
      if (crystalContainer) {
        crystalContainer.innerHTML = '<div style="font-size:13px;font-weight:700;color:#374151;margin-bottom:10px"><i data-lucide="box" class="lucide" style="width:16px;height:16px;color:#8b5cf6;vertical-align:middle"></i> 晶体结构</div>' + MaterialsEnhancements.renderCrystalViewer(m.id);
        if (typeof renderIcons === 'function') renderIcons();
      }
    }
  },
  
  renderHeader() {
    const m = this.currentMaterial;
    const container = document.getElementById('material-detail-header');
    if (!container) return;
    const isFav = MaterialManager.isFavorite(m.id);
    
    container.innerHTML = `
      <div class="card" style="background:linear-gradient(135deg,#fff0e8,#ffe8e0)">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
          <div>
            <div style="font-size:28px;font-weight:800;color:var(--primary)">${m.formula}</div>
            <div style="font-size:16px;font-weight:600;margin-top:2px">${m.name}</div>
            <div style="display:flex;gap:6px;margin-top:8px">
              <span class="card-badge" style="background:#fff;color:var(--primary)">${m.category}</span>
              <span class="card-badge" style="background:#fff;color:var(--blue)">${m.type}</span>
            </div>
          </div>
          <button onclick="MaterialDetailRenderer.toggleFavorite()" style="background:none;border:none;cursor:pointer">
            <i data-lucide="star" class="lucide" style="width:28px;height:28px;${isFav?'color:var(--yellow);fill:var(--yellow)':'color:#fff;stroke:var(--primary)'}"></i>
          </button>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">
          <div style="background:#fff;padding:10px;border-radius:10px;text-align:center">
            <div style="font-size:10px;color:var(--text3)">带隙</div>
            <div style="font-size:16px;font-weight:800;color:var(--primary);margin-top:2px">${m.bandgap}<span style="font-size:10px"> eV</span></div>
          </div>
          <div style="background:#fff;padding:10px;border-radius:10px;text-align:center">
            <div style="font-size:10px;color:var(--text3)">密度</div>
            <div style="font-size:16px;font-weight:800;color:var(--blue);margin-top:2px">${m.density}<span style="font-size:10px"> g/cm³</span></div>
          </div>
          <div style="background:#fff;padding:10px;border-radius:10px;text-align:center">
            <div style="font-size:10px;color:var(--text3)">原子数</div>
            <div style="font-size:16px;font-weight:800;color:var(--green);margin-top:2px">${m.atoms}</div>
          </div>
        </div>
      </div>
    `;
  },
  
  renderTabs() {
    const container = document.getElementById('material-detail-tabs');
    if (!container) return;
    container.innerHTML = `
      <div class="tab-bar" style="margin:12px 0;overflow-x:auto;flex-wrap:nowrap">
        ${[
          {id:'overview',name:'概览',icon:'layout-dashboard'},
          {id:'electronic',name:'电子性质',icon:'zap'},
          {id:'structural',name:'结构性质',icon:'box'},
          {id:'mechanical',name:'力学性质',icon:'dumbbell'},
          {id:'thermal',name:'热学性质',icon:'thermometer'},
          {id:'optical',name:'光学性质',icon:'eye'},
          {id:'files',name:'数据文件',icon:'folder'}
        ].map(tab => `
          <button class="tab-item ${this.currentTab===tab.id?'active':''}" onclick="MaterialDetailRenderer.switchTab('${tab.id}')" style="white-space:nowrap">
            <i data-lucide="${tab.icon}" class="lucide" style="width:12px;height:12px"></i>${tab.name}
          </button>
        `).join('')}
      </div>
    `;
  },
  
  switchTab(tab) {
    this.currentTab = tab;
    this.renderTabs();
    this.renderTabContent();
    if (typeof renderIcons === 'function') renderIcons();
  },
  
  renderTabContent() {
    const container = document.getElementById('material-detail-content');
    if (!container) return;
    const m = this.currentMaterial;
    
    switch(this.currentTab) {
      case 'overview':
        container.innerHTML = `
          <div class="card">
            <div class="card-title" style="margin-bottom:10px"><i data-lucide="info" class="lucide" style="width:16px;height:16px;color:var(--blue)"></i>材料简介</div>
            <div style="font-size:13px;line-height:1.8;color:var(--text2)">${m.description}</div>
          </div>
          <div class="card" style="margin-top:12px">
            <div class="card-title" style="margin-bottom:10px"><i data-lucide="list" class="lucide" style="width:16px;height:16px;color:var(--green)"></i>基本信息</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
              ${[
                {label:'化学式',value:m.formula},
                {label:'材料名称',value:m.name},
                {label:'材料分类',value:m.category},
                {label:'材料类型',value:m.type},
                {label:'晶系',value:m.crystal},
                {label:'空间群',value:m.spacegroup},
                {label:'原子数',value:m.atoms},
                {label:'磁性',value:m.magnetic}
              ].map(item => `
                <div style="background:var(--bg-secondary);padding:10px;border-radius:8px">
                  <div style="font-size:11px;color:var(--text3)">${item.label}</div>
                  <div style="font-size:13px;font-weight:700;margin-top:2px">${item.value}</div>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="card" style="margin-top:12px">
            <div class="card-title" style="margin-bottom:10px"><i data-lucide="tags" class="lucide" style="width:16px;height:16px;color:var(--purple)"></i>标签</div>
            <div class="chip-row">${m.tags.map(t => `<span class="chip">${t}</span>`).join('')}</div>
          </div>
        `;
        break;
      case 'electronic':
        container.innerHTML = `
          <div class="card">
            <div class="card-title" style="margin-bottom:12px"><i data-lucide="zap" class="lucide" style="width:16px;height:16px;color:var(--primary)"></i>电子性质</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
              <div style="background:linear-gradient(135deg,#fff0e8,#ffe8e0);padding:14px;border-radius:12px">
                <div style="font-size:11px;color:var(--text3)">带隙</div>
                <div style="font-size:24px;font-weight:800;color:var(--primary);margin-top:4px">${m.bandgap}<span style="font-size:12px"> eV</span></div>
              </div>
              <div style="background:linear-gradient(135deg,#f0f7ff,#e8f0f8);padding:14px;border-radius:12px">
                <div style="font-size:11px;color:var(--text3)">总能量</div>
                <div style="font-size:24px;font-weight:800;color:var(--blue);margin-top:4px">${m.energy}<span style="font-size:12px"> eV</span></div>
              </div>
              <div style="background:var(--bg-secondary);padding:12px;border-radius:10px">
                <div style="font-size:11px;color:var(--text3)">形成能</div>
                <div style="font-size:16px;font-weight:700;margin-top:4px">${m.formation_energy} eV/atom</div>
              </div>
              <div style="background:var(--bg-secondary);padding:12px;border-radius:10px">
                <div style="font-size:11px;color:var(--text3)">介电常数</div>
                <div style="font-size:16px;font-weight:700;margin-top:4px">${m.dielectric}</div>
              </div>
            </div>
          </div>
          <div class="card" style="margin-top:12px">
            <div class="card-title" style="margin-bottom:10px"><i data-lucide="trending-up" class="lucide" style="width:16px;height:16px;color:var(--green)"></i>能带结构（示意）</div>
            <div style="height:180px;background:linear-gradient(180deg,#f0f7ff,#e8f0f8);border-radius:10px;position:relative;overflow:hidden">
              <svg width="100%" height="100%" viewBox="0 0 400 180">
                <line x1="0" y1="90" x2="400" y2="90" stroke="#ff6b4a" stroke-width="1" stroke-dasharray="6"/>
                <polyline points="0,60 50,40 100,50 150,30 200,25 250,35 300,30 350,45 400,40" fill="none" stroke="#ff6b4a" stroke-width="2"/>
                <polyline points="0,120 50,130 100,140 150,135 200,150 250,145 300,155 350,140 400,145" fill="none" stroke="#5ba3d9" stroke-width="2"/>
              </svg>
            </div>
          </div>
        `;
        break;
      case 'structural':
        container.innerHTML = `
          <div class="card">
            <div class="card-title" style="margin-bottom:12px"><i data-lucide="box" class="lucide" style="width:16px;height:16px;color:var(--teal)"></i>结构性质</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
              ${[
                {label:'晶系',value:m.crystal},
                {label:'空间群',value:m.spacegroup},
                {label:'原子数/晶胞',value:m.atoms},
                {label:'密度',value:m.density+' g/cm³'}
              ].map(item => `
                <div style="background:var(--bg-secondary);padding:12px;border-radius:10px">
                  <div style="font-size:11px;color:var(--text3)">${item.label}</div>
                  <div style="font-size:15px;font-weight:700;margin-top:4px">${item.value}</div>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="card" style="margin-top:12px">
            <div class="card-title" style="margin-bottom:10px"><i data-lucide="atom" class="lucide" style="width:16px;height:16px;color:var(--blue)"></i>晶体结构（示意）</div>
            <div style="height:200px;background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:10px;display:flex;align-items:center;justify-content:center">
              <div style="text-align:center;color:#fff;opacity:0.7"><i data-lucide="box" class="lucide icon-2xl" style="width:48px;height:48px"></i><div style="font-size:13px;margin-top:8px">${m.crystal}晶系 · ${m.spacegroup}</div></div>
            </div>
          </div>
        `;
        break;
      case 'mechanical':
        container.innerHTML = `
          <div class="card">
            <div class="card-title" style="margin-bottom:12px"><i data-lucide="dumbbell" class="lucide" style="width:16px;height:16px;color:var(--orange)"></i>力学性质</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
              <div style="background:linear-gradient(135deg,#fff0e8,#ffe8e0);padding:14px;border-radius:12px">
                <div style="font-size:11px;color:var(--text3)">弹性模量</div>
                <div style="font-size:24px;font-weight:800;color:var(--primary);margin-top:4px">${m.elastic_modulus}<span style="font-size:12px"> GPa</span></div>
              </div>
              <div style="background:var(--bg-secondary);padding:12px;border-radius:10px">
                <div style="font-size:11px;color:var(--text3)">维氏硬度（估算）</div>
                <div style="font-size:16px;font-weight:700;margin-top:4px">${(m.elastic_modulus/10).toFixed(1)} GPa</div>
              </div>
            </div>
          </div>
        `;
        break;
      case 'thermal':
        container.innerHTML = `
          <div class="card">
            <div class="card-title" style="margin-bottom:12px"><i data-lucide="thermometer" class="lucide" style="width:16px;height:16px;color:var(--red)"></i>热学性质</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
              <div style="background:linear-gradient(135deg,#fef2f2,#fee2e2);padding:14px;border-radius:12px">
                <div style="font-size:11px;color:var(--text3)">热导率</div>
                <div style="font-size:24px;font-weight:800;color:#dc2626;margin-top:4px">${m.thermal_conductivity}<span style="font-size:12px"> W/mK</span></div>
              </div>
              <div style="background:var(--bg-secondary);padding:12px;border-radius:10px">
                <div style="font-size:11px;color:var(--text3)">比热（估算）</div>
                <div style="font-size:16px;font-weight:700;margin-top:4px">${(m.atoms*25).toFixed(0)} J/molK</div>
              </div>
            </div>
          </div>
        `;
        break;
      case 'optical':
        container.innerHTML = `
          <div class="card">
            <div class="card-title" style="margin-bottom:12px"><i data-lucide="eye" class="lucide" style="width:16px;height:16px;color:var(--purple)"></i>光学性质</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
              <div style="background:linear-gradient(135deg,#faf5ff,#f3e8ff);padding:14px;border-radius:12px">
                <div style="font-size:11px;color:var(--text3)">静态介电常数</div>
                <div style="font-size:24px;font-weight:800;color:var(--purple);margin-top:4px">${m.dielectric}</div>
              </div>
              <div style="background:var(--bg-secondary);padding:12px;border-radius:10px">
                <div style="font-size:11px;color:var(--text3)">光学带隙</div>
                <div style="font-size:16px;font-weight:700;margin-top:4px">${m.bandgap} eV</div>
              </div>
            </div>
            <div style="margin-top:12px;padding:10px;background:var(--bg-secondary);border-radius:8px;font-size:12px;color:var(--text2)">
              <i data-lucide="info" class="lucide" style="width:14px;height:14px;vertical-align:middle"></i> 吸收边波长: ${(1240/m.bandgap).toFixed(0)} nm
            </div>
          </div>
        `;
        break;
      case 'files':
        container.innerHTML = `
          <div class="card" style="padding:0">
            ${[
              {name:'POSCAR',size:'2.1 KB',type:'结构'},
              {name:'INCAR',size:'1.5 KB',type:'输入'},
              {name:'KPOINTS',size:'0.3 KB',type:'输入'},
              {name:'POTCAR',size:'156 KB',type:'赝势'},
              {name:'OUTCAR',size:'5.2 MB',type:'输出'},
              {name:'vasprun.xml',size:'3.8 MB',type:'输出'},
              {name:'CHGCAR',size:'856 KB',type:'电荷密度'},
              {name:'PROCAR',size:'1.2 MB',type:'投影'}
            ].map(f => `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid var(--border)">
                <div style="display:flex;align-items:center;gap:10px">
                  <div style="width:36px;height:36px;background:linear-gradient(135deg,#a0d0f0,#80bde0);border-radius:10px;display:flex;align-items:center;justify-content:center">
                    <i data-lucide="file-text" class="lucide icon-white" style="width:18px;height:18px"></i>
                  </div>
                  <div><div style="font-size:13px;font-weight:600">${f.name}</div><div style="font-size:11px;color:var(--text3)">${f.type} · ${f.size}</div></div>
                </div>
                <button onclick="UI.toast.success('下载 ${f.name}')" style="background:none;border:none;cursor:pointer;color:var(--primary)"><i data-lucide="download" class="lucide" style="width:18px;height:18px"></i></button>
              </div>
            `).join('')}
          </div>
          <button class="btn btn-secondary" style="width:100%;margin-top:12px" onclick="MaterialDetailRenderer.exportData()"><i data-lucide="download" class="lucide"></i>打包下载全部文件</button>
        `;
        break;
    }
    if (typeof renderIcons === 'function') renderIcons();
  },
  
  renderRelated() {
    const container = document.getElementById('material-related');
    if (!container) return;
    const related = MaterialManager.getRelated(this.currentMaterial.id);
    if (related.length === 0) { container.innerHTML = ''; return; }
    
    container.innerHTML = `
      <div class="section-header" style="margin-top:16px"><div class="section-title"><i data-lucide="git-branch" class="lucide" style="width:14px;height:14px;color:var(--blue)"></i>相关材料</div></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        ${related.map(m => `
          <div class="card" onclick="navigateTo('page-material-detail','${_store(m)}')" style="padding:12px">
            <div style="font-size:16px;font-weight:800;color:var(--primary)">${m.formula}</div>
            <div style="font-size:12px;font-weight:600;margin-bottom:4px">${m.name}</div>
            <div style="font-size:11px;color:var(--text3)">带隙 ${m.bandgap}eV · ${m.type}</div>
          </div>
        `).join('')}
      </div>
    `;
  },
  
  toggleFavorite() {
    const isFav = MaterialManager.toggleFavorite(this.currentMaterial.id);
    UI.toast.success(isFav ? '已添加到收藏' : '已取消收藏');
    this.renderHeader();
    if (typeof renderIcons === 'function') renderIcons();
  },
  
  exportData() {
    UI.dialog.actionSheet({
      title: '导出材料数据',
      actions: [
        { label: '导出为 CSV', icon: 'file-spreadsheet', onClick: () => UI.toast.success('CSV文件已生成') },
        { label: '导出为 JSON', icon: 'file-code', onClick: () => UI.toast.success('JSON文件已生成') },
        { label: '导出为 Excel', icon: 'file-spreadsheet', onClick: () => UI.toast.success('Excel文件已生成') },
        { label: '导出为 CIF', icon: 'file-code', onClick: () => UI.toast.success('CIF结构文件已生成') },
        { label: '导出为 POSCAR', icon: 'file-code', onClick: () => UI.toast.success('POSCAR文件已生成') },
        { label: '导出为 PDF 报告', icon: 'file-text', onClick: () => UI.toast.success('PDF报告已生成') }
      ]
    });
  },
  
  // 通过化学式打开材料详情
  openByFormula(formula) {
    const mat = MaterialsDB.find(m => m.formula.toLowerCase() === formula.toLowerCase() || m.formula.includes(formula));
    if (mat) {
      navigateTo('page-material-detail', _store(mat));
    } else {
      UI.toast.info('未找到该材料');
    }
  }
};

console.log('[UniSci] 板块8 材料数据库系统已加载');
