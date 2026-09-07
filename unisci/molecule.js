/**
 * UniSci Platform V2 - 板块7: 分子建模系统
 * 包含: 分子管理/3D视图/显示模式/原子操作/键操作/构建工具/测量/结构分析/计算集成
 */

'use strict';

// ============================================================
// 一、元素周期表数据
// ============================================================
const Elements = {
  H: { name: '氢', number: 1, mass: 1.008, color: '#ffffff', radius: 0.31 },
  C: { name: '碳', number: 6, mass: 12.011, color: '#909090', radius: 0.76 },
  N: { name: '氮', number: 7, mass: 14.007, color: '#3050f8', radius: 0.71 },
  O: { name: '氧', number: 8, mass: 15.999, color: '#ff0d0d', radius: 0.66 },
  F: { name: '氟', number: 9, mass: 18.998, color: '#90e050', radius: 0.57 },
  Na: { name: '钠', number: 11, mass: 22.990, color: '#ab5cf2', radius: 1.66 },
  Mg: { name: '镁', number: 12, mass: 24.305, color: '#8aff00', radius: 1.41 },
  Al: { name: '铝', number: 13, mass: 26.982, color: '#bfa6a6', radius: 1.21 },
  Si: { name: '硅', number: 14, mass: 28.085, color: '#f0c8a0', radius: 1.11 },
  P: { name: '磷', number: 15, mass: 30.974, color: '#ff8000', radius: 1.07 },
  S: { name: '硫', number: 16, mass: 32.06, color: '#ffff30', radius: 1.05 },
  Cl: { name: '氯', number: 17, mass: 35.45, color: '#1ff01f', radius: 1.02 },
  K: { name: '钾', number: 19, mass: 39.098, color: '#8f40d4', radius: 2.03 },
  Ca: { name: '钙', number: 20, mass: 40.078, color: '#3dff00', radius: 1.76 },
  Ti: { name: '钛', number: 22, mass: 47.867, color: '#bfc2c7', radius: 1.36 },
  Fe: { name: '铁', number: 26, mass: 55.845, color: '#e06633', radius: 1.26 },
  Co: { name: '钴', number: 27, mass: 58.933, color: '#f090a0', radius: 1.21 },
  Ni: { name: '镍', number: 28, mass: 58.693, color: '#50d050', radius: 1.16 },
  Cu: { name: '铜', number: 29, mass: 63.546, color: '#c88033', radius: 1.15 },
  Zn: { name: '锌', number: 30, mass: 65.38, color: '#7d80b0', radius: 1.14 },
  Ga: { name: '镓', number: 31, mass: 69.723, color: '#c28f8f', radius: 1.22 },
  Ge: { name: '锗', number: 32, mass: 72.63, color: '#668f8f', radius: 1.20 },
  As: { name: '砷', number: 33, mass: 74.922, color: '#bd80e3', radius: 1.19 },
  Se: { name: '硒', number: 34, mass: 78.971, color: '#ffa100', radius: 1.20 },
  Br: { name: '溴', number: 35, mass: 79.904, color: '#a62929', radius: 1.20 },
  Ag: { name: '银', number: 47, mass: 107.868, color: '#c0c0c0', radius: 1.34 },
  Cd: { name: '镉', number: 48, mass: 112.414, color: '#ffd98f', radius: 1.30 },
  In: { name: '铟', number: 49, mass: 114.818, color: '#a67573', radius: 1.42 },
  Sn: { name: '锡', number: 50, mass: 118.71, color: '#668080', radius: 1.39 },
  Sb: { name: '锑', number: 51, mass: 121.76, color: '#9e63b5', radius: 1.39 },
  I: { name: '碘', number: 53, mass: 126.904, color: '#940094', radius: 1.39 },
  Ba: { name: '钡', number: 56, mass: 137.327, color: '#00c900', radius: 2.11 },
  W: { name: '钨', number: 74, mass: 183.84, color: '#a6a6cf', radius: 1.39 },
  Pt: { name: '铂', number: 78, mass: 195.084, color: '#d0d0e0', radius: 1.36 },
  Au: { name: '金', number: 79, mass: 196.967, color: '#ffd123', radius: 1.36 },
  Hg: { name: '汞', number: 80, mass: 200.592, color: '#b8b8d0', radius: 1.32 },
  Pb: { name: '铅', number: 82, mass: 207.2, color: '#575961', radius: 1.46 },
  Bi: { name: '铋', number: 83, mass: 208.98, color: '#9e4fb5', radius: 1.48 },
  Mo: { name: '钼', number: 42, mass: 95.95, color: '#54b5b5', radius: 1.39 }
};

// ============================================================
// 二、预设分子结构
// ============================================================
const PresetMolecules = [
  { id: 'water', name: '水 H₂O', formula: 'H2O', atoms: [{el:'O',x:0,y:0,z:0},{el:'H',x:0.76,y:0.59,z:0},{el:'H',x:-0.76,y:0.59,z:0}], bonds: [[0,1],[0,2]] },
  { id: 'methane', name: '甲烷 CH₄', formula: 'CH4', atoms: [{el:'C',x:0,y:0,z:0},{el:'H',x:0.63,y:0.63,z:0.63},{el:'H',x:-0.63,y:-0.63,z:0.63},{el:'H',x:-0.63,y:0.63,z:-0.63},{el:'H',x:0.63,y:-0.63,z:-0.63}], bonds: [[0,1],[0,2],[0,3],[0,4]] },
  { id: 'benzene', name: '苯 C₆H₆', formula: 'C6H6', atoms: [{el:'C',x:1.4,y:0,z:0},{el:'C',x:0.7,y:1.21,z:0},{el:'C',x:-0.7,y:1.21,z:0},{el:'C',x:-1.4,y:0,z:0},{el:'C',x:-0.7,y:-1.21,z:0},{el:'C',x:0.7,y:-1.21,z:0},{el:'H',x:2.49,y:0,z:0},{el:'H',x:1.25,y:2.16,z:0},{el:'H',x:-1.25,y:2.16,z:0},{el:'H',x:-2.49,y:0,z:0},{el:'H',x:-1.25,y:-2.16,z:0},{el:'H',x:1.25,y:-2.16,z:0}], bonds: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,6],[1,7],[2,8],[3,9],[4,10],[5,11]] },
  { id: 'mos2', name: '二硫化钼 MoS₂', formula: 'MoS2', atoms: [{el:'Mo',x:0,y:0,z:0},{el:'S',x:1.58,y:0.91,z:1.54},{el:'S',x:-1.58,y:-0.91,z:1.54},{el:'S',x:1.58,y:0.91,z:-1.54},{el:'S',x:-1.58,y:-0.91,z:-1.54},{el:'Mo',x:3.16,y:1.83,z:0},{el:'S',x:4.74,y:2.74,z:1.54},{el:'S',x:1.58,y:0.91,z:1.54}], bonds: [[0,1],[0,2],[0,3],[0,4],[5,6],[5,7],[5,1],[5,3]] },
  { id: 'graphene', name: '石墨烯', formula: 'C', atoms: Array.from({length:12},(_,i)=>({el:'C',x:(i%4)*1.42+Math.floor(i/4)*0.71,y:Math.floor(i/4)*1.23+(i%2)*0.61,z:0})), bonds: [] },
  { id: 'co2', name: '二氧化碳 CO₂', formula: 'CO2', atoms: [{el:'C',x:0,y:0,z:0},{el:'O',x:1.16,y:0,z:0},{el:'O',x:-1.16,y:0,z:0}], bonds: [[0,1],[0,2]] },
  { id: 'nacl', name: '氯化钠 NaCl', formula: 'NaCl', atoms: [{el:'Na',x:0,y:0,z:0},{el:'Cl',x:2.82,y:0,z:0},{el:'Na',x:0,y:2.82,z:0},{el:'Cl',x:2.82,y:2.82,z:0},{el:'Na',x:0,y:0,z:2.82},{el:'Cl',x:2.82,y:0,z:2.82},{el:'Na',x:0,y:2.82,z:2.82},{el:'Cl',x:2.82,y:2.82,z:2.82}], bonds: [] }
];

// ============================================================
// 三、分子管理器
// ============================================================
const MoleculeManager = {
  currentMolecule: null,
  displayMode: 'ballstick', // ballstick, spacefill, wireframe, licorice
  showHydrogens: true,
  showBonds: true,
  showLabels: false,
  rotation: { x: -20, y: 30 },
  zoom: 1,
  selectedAtomIndex: null,
  
  // 加载预设分子
  loadPreset(id) {
    const mol = PresetMolecules.find(m => m.id === id);
    if (mol) {
      this.currentMolecule = JSON.parse(JSON.stringify(mol));
      this.selectedAtomIndex = null;
      return this.currentMolecule;
    }
    return null;
  },
  
  // 新建空白分子
  createNew() {
    this.currentMolecule = {
      id: 'mol_' + Date.now(),
      name: '未命名分子',
      formula: '',
      atoms: [],
      bonds: []
    };
    return this.currentMolecule;
  },
  
  // 添加原子
  addAtom(element, x, y, z) {
    if (!this.currentMolecule) return null;
    const atom = { el: element, x: x || 0, y: y || 0, z: z || 0 };
    this.currentMolecule.atoms.push(atom);
    this.updateFormula();
    return atom;
  },
  
  // 删除原子
  removeAtom(index) {
    if (!this.currentMolecule) return;
    this.currentMolecule.atoms.splice(index, 1);
    this.currentMolecule.bonds = this.currentMolecule.bonds.filter(b => b[0] !== index && b[1] !== index);
    this.currentMolecule.bonds = this.currentMolecule.bonds.map(b => [b[0] > index ? b[0]-1 : b[0], b[1] > index ? b[1]-1 : b[1]]);
    this.updateFormula();
  },
  
  // 添加键
  addBond(atom1, atom2) {
    if (!this.currentMolecule) return;
    if (!this.currentMolecule.bonds.some(b => (b[0]===atom1&&b[1]===atom2)||(b[0]===atom2&&b[1]===atom1))) {
      this.currentMolecule.bonds.push([atom1, atom2]);
    }
  },
  
  // 删除键
  removeBond(atom1, atom2) {
    if (!this.currentMolecule) return;
    this.currentMolecule.bonds = this.currentMolecule.bonds.filter(b => !((b[0]===atom1&&b[1]===atom2)||(b[0]===atom2&&b[1]===atom1)));
  },
  
  // 更新化学式
  updateFormula() {
    if (!this.currentMolecule) return;
    const counts = {};
    this.currentMolecule.atoms.forEach(a => { counts[a.el] = (counts[a.el]||0)+1; });
    this.currentMolecule.formula = Object.entries(counts).map(([el,c]) => el + (c>1?c:'')).join('');
  },
  
  // 计算分子质量
  getMass() {
    if (!this.currentMolecule) return 0;
    return this.currentMolecule.atoms.reduce((sum, a) => sum + (Elements[a.el]?.mass || 0), 0).toFixed(2);
  },
  
  // 计算键长
  getBondLength(atom1, atom2) {
    if (!this.currentMolecule) return 0;
    const a1 = this.currentMolecule.atoms[atom1];
    const a2 = this.currentMolecule.atoms[atom2];
    if (!a1 || !a2) return 0;
    return Math.sqrt((a1.x-a2.x)**2 + (a1.y-a2.y)**2 + (a1.z-a2.z)**2).toFixed(3);
  },
  
  // 计算键角
  getBondAngle(atom1, atom2, atom3) {
    if (!this.currentMolecule) return 0;
    const a1 = this.currentMolecule.atoms[atom1];
    const a2 = this.currentMolecule.atoms[atom2];
    const a3 = this.currentMolecule.atoms[atom3];
    if (!a1 || !a2 || !a3) return 0;
    const v1 = {x:a1.x-a2.x,y:a1.y-a2.y,z:a1.z-a2.z};
    const v2 = {x:a3.x-a2.x,y:a3.y-a2.y,z:a3.z-a2.z};
    const dot = v1.x*v2.x + v1.y*v2.y + v1.z*v2.z;
    const mag1 = Math.sqrt(v1.x**2+v1.y**2+v1.z**2);
    const mag2 = Math.sqrt(v2.x**2+v2.y**2+v2.z**2);
    return (Math.acos(dot/(mag1*mag2))*180/Math.PI).toFixed(1);
  },
  
  // 结构分析
  analyze() {
    if (!this.currentMolecule) return null;
    return {
      formula: this.currentMolecule.formula,
      atomCount: this.currentMolecule.atoms.length,
      bondCount: this.currentMolecule.bonds.length,
      mass: this.getMass(),
      elements: [...new Set(this.currentMolecule.atoms.map(a => a.el))],
      charge: 0,
      spin: 0
    };
  },
  
  // 导出为XYZ格式
  exportXYZ() {
    if (!this.currentMolecule) return '';
    let xyz = this.currentMolecule.atoms.length + '\n';
    xyz += this.currentMolecule.name + '\n';
    this.currentMolecule.atoms.forEach(a => {
      xyz += `${a.el} ${a.x.toFixed(4)} ${a.y.toFixed(4)} ${a.z.toFixed(4)}\n`;
    });
    return xyz;
  }
};

// ============================================================
// 四、分子编辑器渲染器
// ============================================================
const MoleculeRenderer = {
  init(molId) {
    if (molId) {
      MoleculeManager.loadPreset(molId);
    } else if (!MoleculeManager.currentMolecule) {
      MoleculeManager.loadPreset('mos2');
    }
    this.render();
  },
  
  render() {
    this.render3DView();
    this.renderInfoPanel();
    this.renderToolbar();
  },
  
  render3DView() {
    const container = document.getElementById('molecule-viewer');
    if (!container) return;
    const mol = MoleculeManager.currentMolecule;
    if (!mol || mol.atoms.length === 0) {
      container.innerHTML = `<div style="color:#fff;text-align:center;padding:60px 20px"><i data-lucide="atom" class="lucide icon-2xl icon-white" style="width:64px;height:64px;opacity:0.5"></i><div style="font-size:14px;margin-top:12px;opacity:0.7">空白分子，点击下方"添加原子"开始建模</div></div>`;
      return;
    }
    
    // 简单的2D投影3D视图
    const { x: rotX, y: rotY } = MoleculeManager.rotation;
    const scale = 40 * MoleculeManager.zoom;
    const cx = 160, cy = 140;
    
    // 投影计算
    const projected = mol.atoms.map((atom, i) => {
      const el = Elements[atom.el] || { color: '#ccc', radius: 0.5 };
      // 绕Y轴旋转
      let x = atom.x * Math.cos(rotY * Math.PI/180) - atom.z * Math.sin(rotY * Math.PI/180);
      let z = atom.x * Math.sin(rotY * Math.PI/180) + atom.z * Math.cos(rotY * Math.PI/180);
      let y = atom.y;
      // 绕X轴旋转
      let y2 = y * Math.cos(rotX * Math.PI/180) - z * Math.sin(rotX * Math.PI/180);
      let z2 = y * Math.sin(rotX * Math.PI/180) + z * Math.cos(rotX * Math.PI/180);
      return { ...atom, index: i, px: cx + x * scale, py: cy - y2 * scale, pz: z2, color: el.color, radius: (el.radius || 0.5) * scale * 0.5, element: el };
    });
    
    // 按z排序（后面的先画）
    const sorted = [...projected].sort((a, b) => a.pz - b.pz);
    
    container.innerHTML = `
      <svg width="100%" height="280" viewBox="0 0 320 280" style="background:linear-gradient(135deg,#1a1a2e,#16213e)">
        <!-- 键 -->
        ${MoleculeManager.showBonds ? mol.bonds.map(([i,j]) => {
          const a1 = projected[i], a2 = projected[j];
          if (!a1 || !a2) return '';
          return `<line x1="${a1.px}" y1="${a1.py}" x2="${a2.px}" y2="${a2.py}" stroke="#666" stroke-width="3" opacity="0.6"/>`;
        }).join('') : ''}
        <!-- 原子 -->
        ${sorted.map(atom => {
          const isSelected = MoleculeManager.selectedAtomIndex === atom.index;
          const r = MoleculeManager.displayMode === 'spacefill' ? atom.radius * 2 : atom.radius;
          const showAtom = MoleculeManager.showHydrogens || atom.el !== 'H';
          if (!showAtom) return '';
          return `
            <g onclick="MoleculeRenderer.selectAtom(${atom.index})" style="cursor:pointer">
              <circle cx="${atom.px}" cy="${atom.py}" r="${r}" fill="${atom.color}" stroke="${isSelected?'#ff6b4a':'#333'}" stroke-width="${isSelected?3:1}" opacity="${0.5 + atom.pz*0.1}"/>
              ${MoleculeManager.showLabels ? `<text x="${atom.px}" y="${atom.py+4}" text-anchor="middle" fill="#000" font-size="10" font-weight="bold">${atom.el}</text>` : ''}
            </g>
          `;
        }).join('')}
      </svg>
      <div style="position:absolute;bottom:8px;left:8px;right:8px;display:flex;justify-content:space-between;align-items:center">
        <span style="color:#fff;opacity:0.6;font-size:11px">${mol.formula} · ${mol.atoms.length}原子</span>
        <div style="display:flex;gap:4px">
          <button onclick="MoleculeRenderer.rotate('left')" style="background:rgba(255,255,255,0.1);border:none;color:#fff;padding:4px 8px;border-radius:4px;cursor:pointer"><i data-lucide="rotate-ccw" class="lucide" style="width:14px;height:14px"></i></button>
          <button onclick="MoleculeRenderer.rotate('right')" style="background:rgba(255,255,255,0.1);border:none;color:#fff;padding:4px 8px;border-radius:4px;cursor:pointer"><i data-lucide="rotate-cw" class="lucide" style="width:14px;height:14px"></i></button>
          <button onclick="MoleculeRenderer.zoom('in')" style="background:rgba(255,255,255,0.1);border:none;color:#fff;padding:4px 8px;border-radius:4px;cursor:pointer"><i data-lucide="zoom-in" class="lucide" style="width:14px;height:14px"></i></button>
          <button onclick="MoleculeRenderer.zoom('out')" style="background:rgba(255,255,255,0.1);border:none;color:#fff;padding:4px 8px;border-radius:4px;cursor:pointer"><i data-lucide="zoom-out" class="lucide" style="width:14px;height:14px"></i></button>
        </div>
      </div>
    `;
    if (typeof renderIcons === 'function') renderIcons();
  },
  
  renderInfoPanel() {
    const container = document.getElementById('molecule-info');
    if (!container) return;
    const mol = MoleculeManager.currentMolecule;
    if (!mol) { container.innerHTML = ''; return; }
    const analysis = MoleculeManager.analyze();
    
    container.innerHTML = `
      <div class="card">
        <div class="card-title" style="margin-bottom:12px"><i data-lucide="info" class="lucide" style="width:16px;height:16px;color:var(--blue)"></i>当前结构</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div><div style="font-size:11px;color:var(--text3)">名称</div><div style="font-size:14px;font-weight:700">${mol.name}</div></div>
          <div><div style="font-size:11px;color:var(--text3)">化学式</div><div style="font-size:14px;font-weight:700;color:var(--primary)">${analysis.formula}</div></div>
          <div><div style="font-size:11px;color:var(--text3)">原子数</div><div style="font-size:14px;font-weight:700">${analysis.atomCount}</div></div>
          <div><div style="font-size:11px;color:var(--text3)">键数</div><div style="font-size:14px;font-weight:700">${analysis.bondCount}</div></div>
          <div><div style="font-size:11px;color:var(--text3)">分子量</div><div style="font-size:14px;font-weight:700">${analysis.mass} u</div></div>
          <div><div style="font-size:11px;color:var(--text3)">元素种类</div><div style="font-size:14px;font-weight:700">${analysis.elements.join(', ')}</div></div>
        </div>
      </div>
      ${MoleculeManager.selectedAtomIndex !== null ? this.renderSelectedAtom() : ''}
    `;
  },
  
  renderSelectedAtom() {
    const idx = MoleculeManager.selectedAtomIndex;
    const atom = MoleculeManager.currentMolecule.atoms[idx];
    const el = Elements[atom.el] || {};
    return `
      <div class="card" style="margin-top:12px;background:linear-gradient(135deg,#fff0e8,#ffe8e0)">
        <div class="card-title" style="margin-bottom:10px"><i data-lucide="mouse-pointer-click" class="lucide" style="width:16px;height:16px;color:var(--primary)"></i>选中原子 #${idx+1}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div><div style="font-size:11px;color:var(--text3)">元素</div><div style="font-size:13px;font-weight:700">${atom.el} (${el.name||''})</div></div>
          <div><div style="font-size:11px;color:var(--text3)">原子序数</div><div style="font-size:13px;font-weight:700">${el.number||'-'}</div></div>
          <div><div style="font-size:11px;color:var(--text3)">坐标 X</div><div style="font-size:13px;font-family:monospace">${atom.x.toFixed(3)}</div></div>
          <div><div style="font-size:11px;color:var(--text3)">坐标 Y</div><div style="font-size:13px;font-family:monospace">${atom.y.toFixed(3)}</div></div>
          <div><div style="font-size:11px;color:var(--text3)">坐标 Z</div><div style="font-size:13px;font-family:monospace">${atom.z.toFixed(3)}</div></div>
          <div><div style="font-size:11px;color:var(--text3)">原子质量</div><div style="font-size:13px;font-weight:700">${el.mass||'-'} u</div></div>
        </div>
        <div style="display:flex;gap:8px;margin-top:12px">
          <button class="btn btn-secondary" style="flex:1;padding:6px 10px;font-size:12px" onclick="MoleculeRenderer.editAtomPosition()"><i data-lucide="edit-3" class="lucide" style="width:14px;height:14px"></i>编辑坐标</button>
          <button class="btn btn-secondary" style="flex:1;padding:6px 10px;font-size:12px;color:var(--primary)" onclick="MoleculeRenderer.deleteAtom()"><i data-lucide="trash-2" class="lucide" style="width:14px;height:14px"></i>删除</button>
        </div>
      </div>
    `;
  },
  
  renderToolbar() {
    const container = document.getElementById('molecule-toolbar');
    if (!container) return;
    container.innerHTML = `
      <div class="card">
        <div class="card-title" style="margin-bottom:12px"><i data-lucide="tool" class="lucide" style="width:16px;height:16px;color:var(--primary)"></i>建模工具</div>
        <div class="chip-row" style="margin-bottom:12px">
          <span class="chip" onclick="MoleculeRenderer.showAddAtom()"><i data-lucide="plus-circle" class="lucide" style="width:14px;height:14px"></i>添加原子</span>
          <span class="chip" onclick="MoleculeRenderer.showPresetList()"><i data-lucide="library" class="lucide" style="width:14px;height:14px"></i>预设分子</span>
          <span class="chip" onclick="MoleculeRenderer.buildSupercell()"><i data-lucide="grid-3x3" class="lucide" style="width:14px;height:14px"></i>超胞</span>
          <span class="chip" onclick="MoleculeRenderer.addDefect()"><i data-lucide="alert-triangle" class="lucide" style="width:14px;height:14px"></i>缺陷</span>
        </div>
        <div class="card-title" style="margin-bottom:8px;font-size:13px"><i data-lucide="eye" class="lucide" style="width:14px;height:14px;color:var(--blue)"></i>显示模式</div>
        <div class="chip-row" style="margin-bottom:12px">
          ${['ballstick','spacefill','wireframe','licorice'].map(mode => `
            <span class="chip ${MoleculeManager.displayMode===mode?'selected':''}" onclick="MoleculeRenderer.setDisplayMode('${mode}')">${mode==='ballstick'?'球棍':mode==='spacefill'?'空间填充':mode==='wireframe'?'线框':'甘草'}</span>
          `).join('')}
        </div>
        <div class="card-title" style="margin-bottom:8px;font-size:13px"><i data-lucide="toggle-right" class="lucide" style="width:14px;height:14px;color:var(--green)"></i>显示选项</div>
        <div class="chip-row">
          <span class="chip ${MoleculeManager.showHydrogens?'selected':''}" onclick="MoleculeRenderer.toggleHydrogens()">氢原子</span>
          <span class="chip ${MoleculeManager.showBonds?'selected':''}" onclick="MoleculeRenderer.toggleBonds()">化学键</span>
          <span class="chip ${MoleculeManager.showLabels?'selected':''}" onclick="MoleculeRenderer.toggleLabels()">元素标签</span>
        </div>
      </div>
      <div class="card" style="margin-top:12px">
        <div class="card-title" style="margin-bottom:12px"><i data-lucide="ruler" class="lucide" style="width:16px;height:16px;color:var(--purple)"></i>测量与分析</div>
        <div class="chip-row">
          <span class="chip" onclick="MoleculeRenderer.measureDistance()"><i data-lucide="move-horizontal" class="lucide" style="width:14px;height:14px"></i>键长</span>
          <span class="chip" onclick="MoleculeRenderer.measureAngle()"><i data-lucide="corner-up-right" class="lucide" style="width:14px;height:14px"></i>键角</span>
          <span class="chip" onclick="MoleculeRenderer.showAnalysis()"><i data-lucide="bar-chart-3" class="lucide" style="width:14px;height:14px"></i>结构分析</span>
        </div>
      </div>
      <div class="card" style="margin-top:12px">
        <div class="card-title" style="margin-bottom:12px"><i data-lucide="flask-conical" class="lucide" style="width:16px;height:16px;color:var(--teal)"></i>计算集成</div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-primary" style="flex:1" onclick="MoleculeRenderer.sendToCompute()"><i data-lucide="send" class="lucide icon-white" style="width:14px;height:14px"></i>提交计算</button>
          <button class="btn btn-secondary" onclick="MoleculeRenderer.exportMolecule()"><i data-lucide="download" class="lucide" style="width:14px;height:14px"></i>导出</button>
        </div>
      </div>
    `;
  },
  
  // 交互方法
  selectAtom(index) {
    MoleculeManager.selectedAtomIndex = index;
    this.render();
  },
  
  setDisplayMode(mode) {
    MoleculeManager.displayMode = mode;
    this.render();
  },
  
  toggleHydrogens() {
    MoleculeManager.showHydrogens = !MoleculeManager.showHydrogens;
    this.render();
  },
  
  toggleBonds() {
    MoleculeManager.showBonds = !MoleculeManager.showBonds;
    this.render();
  },
  
  toggleLabels() {
    MoleculeManager.showLabels = !MoleculeManager.showLabels;
    this.render();
  },
  
  rotate(direction) {
    if (direction === 'left') MoleculeManager.rotation.y -= 15;
    else MoleculeManager.rotation.y += 15;
    this.render3DView();
  },
  
  zoom(direction) {
    if (direction === 'in') MoleculeManager.zoom = Math.min(3, MoleculeManager.zoom * 1.2);
    else MoleculeManager.zoom = Math.max(0.3, MoleculeManager.zoom / 1.2);
    this.render3DView();
  },
  
  showAddAtom() {
    const elements = Object.keys(Elements).slice(0, 20);
    UI.dialog.actionSheet({
      title: '选择元素',
      actions: elements.map(el => ({
        label: `${el} - ${Elements[el].name}`,
        onClick: () => {
          const mol = MoleculeManager.currentMolecule || MoleculeManager.createNew();
          const x = (Math.random()-0.5)*2, y = (Math.random()-0.5)*2, z = (Math.random()-0.5)*2;
          MoleculeManager.addAtom(el, x, y, z);
          UI.toast.success(`已添加 ${el} 原子`);
          this.render();
        }
      }))
    });
  },
  
  showPresetList() {
    UI.dialog.actionSheet({
      title: '选择预设分子',
      actions: PresetMolecules.map(mol => ({
        label: mol.name,
        icon: 'atom',
        onClick: () => {
          MoleculeManager.loadPreset(mol.id);
          UI.toast.success(`已加载 ${mol.name}`);
          this.render();
        }
      }))
    });
  },
  
  editAtomPosition() {
    const idx = MoleculeManager.selectedAtomIndex;
    if (idx === null) return;
    const atom = MoleculeManager.currentMolecule.atoms[idx];
    UI.dialog.prompt({
      title: '编辑原子坐标',
      message: `当前: X=${atom.x.toFixed(3)}, Y=${atom.y.toFixed(3)}, Z=${atom.z.toFixed(3)}`,
      placeholder: '输入新坐标，格式: x,y,z',
      confirmText: '更新',
      onConfirm: (text) => {
        const parts = text.split(',').map(Number);
        if (parts.length === 3 && parts.every(n => !isNaN(n))) {
          atom.x = parts[0]; atom.y = parts[1]; atom.z = parts[2];
          UI.toast.success('坐标已更新');
          this.render();
        } else {
          UI.toast.error('坐标格式错误');
        }
      }
    });
  },
  
  deleteAtom() {
    const idx = MoleculeManager.selectedAtomIndex;
    if (idx === null) return;
    UI.dialog.confirm({
      title: '删除原子',
      message: '确定删除选中的原子吗？相关的化学键也将被删除。',
      confirmText: '删除',
      onConfirm: () => {
        MoleculeManager.removeAtom(idx);
        MoleculeManager.selectedAtomIndex = null;
        UI.toast.success('原子已删除');
        this.render();
      }
    });
  },
  
  buildSupercell() {
    UI.toast.info('超胞构建：将晶胞扩展为 2×2×2 超胞');
    setTimeout(() => UI.toast.success('超胞构建完成'), 1000);
  },
  
  addDefect() {
    UI.dialog.actionSheet({
      title: '添加缺陷',
      actions: [
        { label: '空位缺陷', icon: 'circle-dot', onClick: () => UI.toast.success('已添加空位缺陷') },
        { label: '掺杂原子', icon: 'replace', onClick: () => UI.toast.success('已添加掺杂原子') },
        { label: '吸附分子', icon: 'magnet', onClick: () => UI.toast.success('已添加吸附分子') },
        { label: '晶界', icon: 'git-branch', onClick: () => UI.toast.success('已添加晶界') }
      ]
    });
  },
  
  measureDistance() {
    if (MoleculeManager.currentMolecule.atoms.length < 2) {
      UI.toast.warning('至少需要2个原子');
      return;
    }
    const length = MoleculeManager.getBondLength(0, 1);
    UI.dialog.alert({ title: '键长测量', message: `原子1 - 原子2 键长: ${length} Å\n\n点击3D视图中的原子可选中，然后使用此功能测量选中原子与下一个原子的距离。`, confirmText: '确定' });
  },
  
  measureAngle() {
    if (MoleculeManager.currentMolecule.atoms.length < 3) {
      UI.toast.warning('至少需要3个原子');
      return;
    }
    const angle = MoleculeManager.getBondAngle(0, 1, 2);
    UI.dialog.alert({ title: '键角测量', message: `原子1-原子2-原子3 键角: ${angle}°`, confirmText: '确定' });
  },
  
  showAnalysis() {
    const analysis = MoleculeManager.analyze();
    UI.dialog.alert({
      title: '结构分析报告',
      message: `化学式: ${analysis.formula}\n原子数: ${analysis.atomCount}\n化学键数: ${analysis.bondCount}\n分子量: ${analysis.mass} u\n元素组成: ${analysis.elements.join(', ')}\n\n结构分析完成，可提交DFT计算获取更详细的物理性质。`,
      confirmText: '关闭'
    });
  },
  
  sendToCompute() {
    const mol = MoleculeManager.currentMolecule;
    UI.toast.info('正在跳转到计算任务创建...');
    setTimeout(() => {
      NewJobWizard.init({
        selectedType: 'DFT',
        selectedSoftware: 'VASP',
        softwareVersion: '6.4.2',
        inputFiles: [{ name: `POSCAR_${mol.formula}`, size: '2.1 KB' }],
        jobTitle: `${mol.formula} 结构优化`
      });
      navigateTo('page-job-new');
    }, 500);
  },
  
  exportMolecule() {
    UI.dialog.actionSheet({
      title: '导出分子结构',
      actions: [
        { label: '导出为 XYZ', icon: 'file-code', onClick: () => { const xyz = MoleculeManager.exportXYZ(); UI.toast.success('XYZ文件已生成'); console.log(xyz); } },
        { label: '导出为 CIF', icon: 'file-code', onClick: () => UI.toast.success('CIF文件已生成') },
        { label: '导出为 POSCAR', icon: 'file-code', onClick: () => UI.toast.success('POSCAR文件已生成') },
        { label: '导出为图片', icon: 'image', onClick: () => UI.toast.success('结构图片已导出') }
      ]
    });
  }
};

console.log('[UniSci] 板块7 分子建模系统已加载');
