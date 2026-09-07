/**
 * UniSci Platform V2 - 材料数据库增强模块
 * 在现有materials.js基础上补充：收藏/导出/对比/晶体可视化/计算联动
 */

'use strict';

const MaterialsEnhancements = {
  // 收藏
  toggleFavorite(materialId) {
    const mat = this.findMaterial(materialId);
    if (mat) {
      mat.starred = !mat.starred;
      this.saveState();
      return mat.starred;
    }
    return false;
  },

  getFavorites() {
    return (window.MaterialsDB || []).filter(m => m.starred);
  },

  // 导出
  exportMaterial(materialId, format = 'json') {
    const mat = this.findMaterial(materialId);
    if (!mat) return null;

    let content, filename, mimeType;
    switch (format) {
      case 'json':
        content = JSON.stringify(mat, null, 2);
        filename = `${mat.formula || mat.id}.json`;
        mimeType = 'application/json';
        break;
      case 'cif':
        content = this.generateCIF(mat);
        filename = `${mat.formula || mat.id}.cif`;
        mimeType = 'text/plain';
        break;
      case 'csv':
        content = this.generateCSV(mat);
        filename = `${mat.formula || mat.id}.csv`;
        mimeType = 'text/csv';
        break;
      case 'poscar':
        content = this.generatePOSCAR(mat);
        filename = 'POSCAR';
        mimeType = 'text/plain';
        break;
      default:
        content = JSON.stringify(mat, null, 2);
        filename = `${mat.formula || mat.id}.json`;
        mimeType = 'application/json';
    }

    // 触发下载
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return { filename, format, size: content.length };
  },

  generateCIF(mat) {
    const lattice = mat.lattice || { a: 3.16, b: 3.16, c: 12.3, alpha: 90, beta: 90, gamma: 120 };
    return `data_${mat.formula || mat.id}
_chemical_formula_sum  '${mat.formula || ''}'
_cell_length_a  ${lattice.a}
_cell_length_b  ${lattice.b}
_cell_length_c  ${lattice.c}
_cell_angle_alpha  ${lattice.alpha}
_cell_angle_beta  ${lattice.beta}
_cell_angle_gamma  ${lattice.gamma}
loop_
_atom_site_label
_atom_site_type_symbol
_atom_site_fract_x
_atom_site_fract_y
_atom_site_fract_z
Mo1 Mo 0.333 0.667 0.25
S1 S 0.333 0.667 0.12
S2 S 0.333 0.667 0.38
`;
  },

  generateCSV(mat) {
    const rows = [['属性', '值']];
    rows.push(['化学式', mat.formula || '']);
    rows.push(['材料名称', mat.name || '']);
    rows.push(['带隙(eV)', mat.bandgap || '']);
    rows.push(['晶体结构', mat.crystalSystem || '']);
    if (mat.lattice) {
      rows.push(['a(Å)', mat.lattice.a]);
      rows.push(['b(Å)', mat.lattice.b]);
      rows.push(['c(Å)', mat.lattice.c]);
    }
    if (mat.mechanical) {
      rows.push(['杨氏模量(GPa)', mat.mechanical.youngModulus || '']);
      rows.push(['泊松比', mat.mechanical.poissonRatio || '']);
    }
    return rows.map(r => r.join(',')).join('\n');
  },

  generatePOSCAR(mat) {
    const lattice = mat.lattice || { a: 3.16, b: 3.16, c: 12.3 };
    return `${mat.formula || mat.id}
1.0
${lattice.a} 0.0 0.0
0.0 ${lattice.b} 0.0
0.0 0.0 ${lattice.c}
Mo S
1 2
direct
0.333 0.667 0.25
0.333 0.667 0.12
0.333 0.667 0.38
`;
  },

  // 对比
  compareList: [],

  addToCompare(materialId) {
    if (!this.compareList.includes(materialId) && this.compareList.length < 4) {
      this.compareList.push(materialId);
      return true;
    }
    return false;
  },

  removeFromCompare(materialId) {
    this.compareList = this.compareList.filter(id => id !== materialId);
  },

  clearCompare() {
    this.compareList = [];
  },

  getCompareData() {
    return this.compareList.map(id => this.findMaterial(id)).filter(Boolean);
  },

  renderCompareView() {
    const materials = this.getCompareData();
    if (materials.length === 0) return '<div style="text-align:center;padding:40px;color:#94a3b8">请先选择要对比的材料</div>';

    const props = [
      { key: 'formula', label: '化学式' },
      { key: 'name', label: '名称' },
      { key: 'bandgap', label: '带隙(eV)' },
      { key: 'crystalSystem', label: '晶体结构' },
      { key: 'density', label: '密度(g/cm³)' }
    ];

    let html = '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px">';
    html += '<thead><tr style="background:#f1f5f9"><th style="padding:10px;text-align:left;border-bottom:2px solid #e2e8f0">属性</th>';
    materials.forEach(m => {
      html += `<th style="padding:10px;text-align:center;border-bottom:2px solid #e2e8f0;color:#3b82f6;font-weight:700">${m.formula || m.id}</th>`;
    });
    html += '</tr></thead><tbody>';

    props.forEach(prop => {
      html += `<tr><td style="padding:10px;border-bottom:1px solid #f1f5f9;font-weight:600;color:#475569">${prop.label}</td>`;
      materials.forEach(m => {
        let val = m[prop.key] || '-';
        if (prop.key === 'lattice' && m.lattice) val = `${m.lattice.a}×${m.lattice.b}×${m.lattice.c}`;
        html += `<td style="padding:10px;text-align:center;border-bottom:1px solid #f1f5f9">${val}</td>`;
      });
      html += '</tr>';
    });

    // 力学性质
    html += `<tr><td style="padding:10px;border-bottom:1px solid #f1f5f9;font-weight:600;color:#475569">杨氏模量(GPa)</td>`;
    materials.forEach(m => {
      html += `<td style="padding:10px;text-align:center;border-bottom:1px solid #f1f5f9">${m.mechanical?.youngModulus || '-'}</td>`;
    });
    html += '</tr>';

    html += '</tbody></table></div>';
    return html;
  },

  // 晶体结构可视化
  renderCrystalViewer(materialId) {
    const mat = this.findMaterial(materialId);
    if (!mat) return '<div>材料未找到</div>';

    const lattice = mat.lattice || { a: 3.16, b: 3.16, c: 12.3, alpha: 90, beta: 90, gamma: 120 };
    // mat.atoms 可能是数字（原子数）或数组（原子位置）
    let atoms = mat.atoms;
    if (!Array.isArray(atoms)) {
      // 根据化学式生成默认原子位置
      const formula = mat.formula || '';
      if (formula.includes('MoS') || formula.includes('WS')) {
        atoms = [
          { element: 'Mo', x: 0.333, y: 0.667, z: 0.25 },
          { element: 'S', x: 0.333, y: 0.667, z: 0.12 },
          { element: 'S', x: 0.333, y: 0.667, z: 0.38 }
        ];
      } else if (formula === 'Graphene' || formula === 'Graphite') {
        atoms = [
          { element: 'C', x: 0, y: 0, z: 0 },
          { element: 'C', x: 0.5, y: 0.5, z: 0 }
        ];
      } else if (formula === 'Si' || formula === 'GaAs' || formula === 'InP') {
        atoms = [
          { element: formula.substring(0, 2) || 'Si', x: 0, y: 0, z: 0 },
          { element: formula.substring(2, 4) || 'Si', x: 0.25, y: 0.25, z: 0.25 }
        ];
      } else {
        atoms = [
          { element: formula.substring(0, 2) || 'X', x: 0.5, y: 0.5, z: 0.5 }
        ];
      }
    }

    const elementColors = { Mo: '#7c7c7c', S: '#ffff30', C: '#404040', Si: '#f0c8a0', O: '#ff0d0d', N: '#3050f8', H: '#ffffff', Fe: '#e06633', Cu: '#c88033', Au: '#ffd123', Ag: '#c0c0c0', Al: '#bfa6a6', Ti: '#bfc2c7', W: '#c8d0e0', Pt: '#d0d0e0', Pd: '#c8c8c8', Ni: '#a0a0a0', Co: '#d0d0e0', Cr: '#8a99c7', Mn: '#9c7ac7', V: '#a6a6ab', Zn: '#7d80b0', Ga: '#c28f8f', Ge: '#668f8f', As: '#bd80e3', Se: '#ffa100', Br: '#a62929', P: '#ff8000', B: '#ffb5b5', Li: '#cc80ff', Na: '#ab5cf2', K: '#8f40d4', Ca: '#3dff00', Mg: '#8aff00', Ba: '#00c900', Sr: '#00ff00' };

    // 简单的SVG 3D投影
    const scale = 80;
    const centerX = 150;
    const centerY = 150;
    const rotX = 0.5;
    const rotY = 0.3;

    function project(x, y, z) {
      // 分数坐标转笛卡尔
      const cx = x * lattice.a;
      const cy = y * lattice.b * Math.cos(lattice.gamma * Math.PI / 180);
      const cz = z * lattice.c;
      // 旋转
      const rx = cx * Math.cos(rotY) - cz * Math.sin(rotY);
      const rz = cx * Math.sin(rotY) + cz * Math.cos(rotY);
      const ry = cy * Math.cos(rotX) - rz * Math.sin(rotX);
      const rz2 = cy * Math.sin(rotX) + rz * Math.cos(rotX);
      // 透视投影
      const persp = 500 / (500 + rz2 * scale);
      return {
        x: centerX + rx * scale * persp,
        y: centerY + ry * scale * persp,
        z: rz2,
        size: 12 * persp
      };
    }

    const projectedAtoms = atoms.map((a, i) => ({
      ...a,
      ...project(a.x, a.y, a.z),
      color: elementColors[a.element] || '#888',
      index: i
    })).sort((a, b) => b.z - a.z);

    let svg = `<svg viewBox="0 0 300 300" style="width:100%;max-width:300px;margin:0 auto;display:block;background:#0f172a;border-radius:12px">`;

    // 晶格框线
    const corners = [
      [0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0],
      [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]
    ];
    const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
    const projectedCorners = corners.map(c => project(c[0], c[1], c[2]));
    edges.forEach(([i, j]) => {
      svg += `<line x1="${projectedCorners[i].x}" y1="${projectedCorners[i].y}" x2="${projectedCorners[j].x}" y2="${projectedCorners[j].y}" stroke="#334155" stroke-width="1" stroke-dasharray="3,3"/>`;
    });

    // 原子
    projectedAtoms.forEach(a => {
      svg += `<circle cx="${a.x}" cy="${a.y}" r="${a.size}" fill="${a.color}" stroke="#fff" stroke-width="1" opacity="0.9"/>`;
      svg += `<text x="${a.x}" y="${a.y + 4}" text-anchor="middle" font-size="9" fill="#000" font-weight="bold">${a.element}</text>`;
    });

    svg += `</svg>`;

    return `
      <div style="text-align:center;margin-bottom:12px">
        ${svg}
        <div style="font-size:11px;color:#64748b;margin-top:8px">
          晶格常数: a=${lattice.a}Å, b=${lattice.b}Å, c=${lattice.c}Å
          ${lattice.alpha ? `, α=${lattice.alpha}°, β=${lattice.beta}°, γ=${lattice.gamma}°` : ''}
        </div>
        <div style="font-size:11px;color:#94a3b8;margin-top:4px">原子数: ${atoms.length} · 晶体系统: ${mat.crystalSystem || '未知'}</div>
      </div>
    `;
  },

  // 材料→计算联动
  submitCalculation(materialId, calcType = 'DFT') {
    const mat = this.findMaterial(materialId);
    if (!mat) return null;

    const jobConfig = {
      type: calcType,
      title: `${mat.formula || mat.id} ${calcType}计算`,
      material: mat.formula,
      materialId: mat.id,
      software: calcType === 'DFT' ? 'VASP' : calcType === 'MD' ? 'GROMACS' : 'QE',
      lattice: mat.lattice,
      atoms: mat.atoms
    };

    if (typeof JobManager !== 'undefined' && JobManager.createJob) {
      const job = JobManager.createJob(jobConfig);
      return { success: true, jobId: job.id, job };
    }

    // 模拟创建
    return {
      success: true,
      jobId: 'job_' + Date.now(),
      config: jobConfig,
      message: '计算任务已提交（模拟模式）'
    };
  },

  // 工具方法
  findMaterial(id) {
    const db = (typeof MaterialManager !== 'undefined' && MaterialManager.search) ? MaterialManager.search('') : (window.MaterialsDB || []);
    return db.find(m => m.id === id) || db.find(m => m.formula === id);
  },

  getAllMaterials() {
    return (typeof MaterialManager !== 'undefined' && MaterialManager.search) ? MaterialManager.search('') : (window.MaterialsDB || []);
  },

  saveState() {
    try {
      const favorites = this.getFavorites().map(m => m.id);
      localStorage.setItem('unisci_material_favorites', JSON.stringify(favorites));
    } catch (e) {}
  },

  loadState() {
    try {
      const favorites = JSON.parse(localStorage.getItem('unisci_material_favorites') || '[]');
      const db = this.getAllMaterials();
      favorites.forEach(id => {
        const mat = db.find(m => m.id === id);
        if (mat) mat.starred = true;
      });
    } catch (e) {}
  },

  // 初始化
  init() {
    this.loadState();
    console.log('[MaterialsEnhancements] 材料数据库增强模块已加载：收藏/导出/对比/晶体可视化/计算联动');
  }
};

// 自动初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => MaterialsEnhancements.init());
} else {
  MaterialsEnhancements.init();
}
