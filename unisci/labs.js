/**
 * UniSci Platform V2 - 第三纵队：全民可及
 * 虚拟实验室系统 - 3个交互式物理实验
 * 1. 双缝干涉  2. 布朗运动  3. 晶体结构
 */

'use strict';

// ============================================================
// 虚拟实验室1：双缝干涉
// ============================================================
const DoubleSlitLab = {
  canvas: null,
  ctx: null,
  animationId: null,
  params: {
    wavelength: 550,  // 波长 nm (400紫 - 700红)
    slitWidth: 20,    // 缝宽 px
    slitDistance: 80,  // 缝间距 px
    screenDistance: 300 // 屏距 px
  },

  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = this.canvas.offsetWidth || 350;
    this.canvas.height = 280;
    this.render();
  },

  setParam(name, value) {
    this.params[name] = value;
    this.render();
  },

  wavelengthToColor(wl) {
    let r, g, b;
    if (wl >= 400 && wl < 440) { r = -(wl - 440) / (440 - 400); g = 0; b = 1; }
    else if (wl >= 440 && wl < 490) { r = 0; g = (wl - 440) / (490 - 440); b = 1; }
    else if (wl >= 490 && wl < 510) { r = 0; g = 1; b = -(wl - 510) / (510 - 490); }
    else if (wl >= 510 && wl < 580) { r = (wl - 510) / (580 - 510); g = 1; b = 0; }
    else if (wl >= 580 && wl < 645) { r = 1; g = -(wl - 645) / (645 - 580); b = 0; }
    else { r = 1; g = 0; b = 0; }
    return `rgb(${Math.round(r*255)},${Math.round(g*255)},${Math.round(b*255)})`;
  },

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const p = this.params;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const centerY = h / 2;
    const slitX = 60;
    const screenX = w - 40;

    // 绘制光源
    const color = this.wavelengthToColor(p.wavelength);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(20, centerY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 绘制双缝挡板
    ctx.fillStyle = '#475569';
    ctx.fillRect(slitX - 4, 0, 8, centerY - p.slitDistance/2 - p.slitWidth/2);
    ctx.fillRect(slitX - 4, centerY - p.slitDistance/2 + p.slitWidth/2, 8, p.slitDistance - p.slitWidth);
    ctx.fillRect(slitX - 4, centerY + p.slitDistance/2 + p.slitWidth/2, 8, h - (centerY + p.slitDistance/2 + p.slitWidth/2));

    // 绘制干涉条纹（屏幕上）
    const stripeWidth = 3;
    for (let y = 0; y < h; y += stripeWidth) {
      const dy = y - centerY;
      const d = p.slitDistance;
      const L = p.screenDistance;
      const phase = (Math.PI * d * dy) / (p.wavelength * 0.01 * L);
      const intensity = Math.pow(Math.cos(phase), 2);
      
      const r = parseInt(color.match(/\d+/g)[0]) * intensity;
      const g = parseInt(color.match(/\d+/g)[1]) * intensity;
      const b = parseInt(color.match(/\d+/g)[2]) * intensity;
      
      ctx.fillStyle = `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
      ctx.fillRect(screenX, y, 30, stripeWidth);
    }

    // 绘制屏幕边框
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.strokeRect(screenX, 0, 30, h);

    // 绘制波的示意线（从缝到屏）
    ctx.strokeStyle = color + '40';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const slitY1 = centerY - p.slitDistance / 2;
      const slitY2 = centerY + p.slitDistance / 2;
      const targetY = centerY + (i - 2) * 40;
      
      ctx.beginPath();
      ctx.moveTo(slitX + 4, slitY1);
      ctx.quadraticCurveTo((slitX + screenX) / 2, (slitY1 + targetY) / 2, screenX, targetY);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(slitX + 4, slitY2);
      ctx.quadraticCurveTo((slitX + screenX) / 2, (slitY2 + targetY) / 2, screenX, targetY);
      ctx.stroke();
    }

    // 标签
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px system-ui';
    ctx.fillText('光源', 10, centerY + 25);
    ctx.fillText('双缝', slitX - 15, 15);
    ctx.fillText('干涉条纹', screenX - 5, 15);
    ctx.fillText(`波长: ${p.wavelength}nm`, 10, h - 10);
  },

  destroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
  }
};

// ============================================================
// 虚拟实验室2：布朗运动
// ============================================================
const BrownianLab = {
  canvas: null,
  ctx: null,
  animationId: null,
  particles: [],
  pollen: null,
  params: {
    temperature: 300,  // 温度 K
    particleCount: 60, // 分子数
    pollenSize: 12     // 花粉大小
  },
  trail: [],

  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = this.canvas.offsetWidth || 350;
    this.canvas.height = 280;
    this.reset();
    this.animate();
  },

  reset() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.particles = [];
    this.trail = [];
    
    // 创建水分子
    for (let i = 0; i < this.params.particleCount; i++) {
      this.particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        r: 2 + Math.random() * 2
      });
    }
    
    // 创建花粉颗粒
    this.pollen = {
      x: w / 2,
      y: h / 2,
      vx: 0,
      vy: 0
    };
  },

  setParam(name, value) {
    this.params[name] = value;
    if (name === 'particleCount') this.reset();
  },

  animate() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const p = this.params;
    const speedFactor = p.temperature / 300;

    // 背景
    ctx.fillStyle = 'rgba(15, 23, 42, 0.3)';
    ctx.fillRect(0, 0, w, h);

    // 更新和绘制水分子
    for (const particle of this.particles) {
      particle.x += particle.vx * speedFactor;
      particle.y += particle.vy * speedFactor;
      
      // 边界反弹
      if (particle.x < 0 || particle.x > w) particle.vx *= -1;
      if (particle.y < 0 || particle.y > h) particle.vy *= -1;
      particle.x = Math.max(0, Math.min(w, particle.x));
      particle.y = Math.max(0, Math.min(h, particle.y));
      
      // 绘制水分子
      ctx.fillStyle = '#60a5fa40';
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      ctx.fill();
      
      // 花粉与水分子碰撞
      const dx = particle.x - this.pollen.x;
      const dy = particle.y - this.pollen.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < p.pollenSize + particle.r) {
        // 碰撞传递动量
        const force = 0.3 * speedFactor;
        this.pollen.vx += (dx / dist) * force * (Math.random() - 0.3);
        this.pollen.vy += (dy / dist) * force * (Math.random() - 0.3);
        // 水分子反弹
        particle.vx = -particle.vx * 0.8;
        particle.vy = -particle.vy * 0.8;
      }
    }

    // 更新花粉
    this.pollen.x += this.pollen.vx;
    this.pollen.y += this.pollen.vy;
    this.pollen.vx *= 0.98;
    this.pollen.vy *= 0.98;
    
    // 花粉边界
    if (this.pollen.x < p.pollenSize || this.pollen.x > w - p.pollenSize) this.pollen.vx *= -1;
    if (this.pollen.y < p.pollenSize || this.pollen.y > h - p.pollenSize) this.pollen.vy *= -1;
    this.pollen.x = Math.max(p.pollenSize, Math.min(w - p.pollenSize, this.pollen.x));
    this.pollen.y = Math.max(p.pollenSize, Math.min(h - p.pollenSize, this.pollen.y));

    // 记录轨迹
    this.trail.push({ x: this.pollen.x, y: this.pollen.y });
    if (this.trail.length > 200) this.trail.shift();

    // 绘制轨迹
    if (this.trail.length > 1) {
      ctx.strokeStyle = '#fbbf2480';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(this.trail[0].x, this.trail[0].y);
      for (let i = 1; i < this.trail.length; i++) {
        ctx.lineTo(this.trail[i].x, this.trail[i].y);
      }
      ctx.stroke();
    }

    // 绘制花粉
    ctx.fillStyle = '#fbbf24';
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(this.pollen.x, this.pollen.y, p.pollenSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 标签
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px system-ui';
    ctx.fillText(`温度: ${p.temperature}K`, 10, h - 25);
    ctx.fillText(`分子数: ${p.particleCount}`, 10, h - 10);
    ctx.fillText('花粉颗粒', w - 70, 15);

    this.animationId = requestAnimationFrame(() => this.animate());
  },

  destroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
  }
};

// ============================================================
// 虚拟实验室3：晶体结构
// ============================================================
const CrystalLab = {
  canvas: null,
  ctx: null,
  rotation: { x: 0.5, y: 0.5 },
  isDragging: false,
  lastMouse: { x: 0, y: 0 },
  currentType: 'fcc', // sc简单立方, bcc体心立方, fcc面心立方, hcp六方密堆积
  latticeConstant: 50,

  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = this.canvas.offsetWidth || 350;
    this.canvas.height = 280;
    
    // 鼠标交互
    this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.canvas.addEventListener('mouseup', () => this.onMouseUp());
    this.canvas.addEventListener('mouseleave', () => this.onMouseUp());
    
    // 触摸交互
    this.canvas.addEventListener('touchstart', (e) => this.onTouchStart(e));
    this.canvas.addEventListener('touchmove', (e) => this.onTouchMove(e));
    this.canvas.addEventListener('touchend', () => this.onMouseUp());
    
    this.render();
  },

  onMouseDown(e) {
    this.isDragging = true;
    this.lastMouse = { x: e.clientX, y: e.clientY };
  },

  onMouseMove(e) {
    if (!this.isDragging) return;
    const dx = e.clientX - this.lastMouse.x;
    const dy = e.clientY - this.lastMouse.y;
    this.rotation.y += dx * 0.01;
    this.rotation.x += dy * 0.01;
    this.lastMouse = { x: e.clientX, y: e.clientY };
    this.render();
  },

  onMouseUp() {
    this.isDragging = false;
  },

  onTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    this.isDragging = true;
    this.lastMouse = { x: touch.clientX, y: touch.clientY };
  },

  onTouchMove(e) {
    e.preventDefault();
    if (!this.isDragging) return;
    const touch = e.touches[0];
    const dx = touch.clientX - this.lastMouse.x;
    const dy = touch.clientY - this.lastMouse.y;
    this.rotation.y += dx * 0.01;
    this.rotation.x += dy * 0.01;
    this.lastMouse = { x: touch.clientX, y: touch.clientY };
    this.render();
  },

  setType(type) {
    this.currentType = type;
    this.render();
  },

  // 3D点旋转
  rotatePoint(x, y, z) {
    // 绕X轴旋转
    let y1 = y * Math.cos(this.rotation.x) - z * Math.sin(this.rotation.x);
    let z1 = y * Math.sin(this.rotation.x) + z * Math.cos(this.rotation.x);
    // 绕Y轴旋转
    let x2 = x * Math.cos(this.rotation.y) + z1 * Math.sin(this.rotation.y);
    let z2 = -x * Math.sin(this.rotation.y) + z1 * Math.cos(this.rotation.y);
    return { x: x2, y: y1, z: z2 };
  },

  // 3D点投影到2D
  project(x, y, z) {
    const rotated = this.rotatePoint(x, y, z);
    const scale = 300 / (300 + rotated.z);
    return {
      x: this.canvas.width / 2 + rotated.x * scale,
      y: this.canvas.height / 2 + rotated.y * scale,
      z: rotated.z,
      scale: scale
    };
  },

  // 获取晶胞原子位置
  getAtoms() {
    const a = this.latticeConstant;
    const atoms = [];
    
    // 8个顶点原子（所有类型都有）
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        for (let k = 0; k < 2; k++) {
          atoms.push({
            x: (i - 0.5) * a,
            y: (j - 0.5) * a,
            z: (k - 0.5) * a,
            type: 'corner'
          });
        }
      }
    }
    
    if (this.currentType === 'bcc' || this.currentType === 'fcc') {
      // 体心原子
      atoms.push({ x: 0, y: 0, z: 0, type: 'body' });
    }
    
    if (this.currentType === 'fcc') {
      // 面心原子（6个面）
      const faces = [
        [0.5, 0, 0], [-0.5, 0, 0],
        [0, 0.5, 0], [0, -0.5, 0],
        [0, 0, 0.5], [0, 0, -0.5]
      ];
      for (const f of faces) {
        atoms.push({ x: f[0] * a, y: f[1] * a, z: f[2] * a, type: 'face' });
      }
    }
    
    return atoms;
  },

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const atoms = this.getAtoms();
    
    // 投影并按z排序
    const projected = atoms.map(atom => ({
      ...atom,
      proj: this.project(atom.x, atom.y, atom.z)
    })).sort((a, b) => a.proj.z - b.proj.z);

    // 绘制键（顶点之间的连线）
    ctx.strokeStyle = '#47556960';
    ctx.lineWidth = 1;
    const a = this.latticeConstant;
    const corners = projected.filter(a => a.type === 'corner');
    for (let i = 0; i < corners.length; i++) {
      for (let j = i + 1; j < corners.length; j++) {
        const dx = corners[i].x - corners[j].x;
        const dy = corners[i].y - corners[j].y;
        const dz = corners[i].z - corners[j].z;
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        if (dist < a * 1.1) {
          ctx.beginPath();
          ctx.moveTo(corners[i].proj.x, corners[i].proj.y);
          ctx.lineTo(corners[j].proj.x, corners[j].proj.y);
          ctx.stroke();
        }
      }
    }

    // 绘制原子
    for (const atom of projected) {
      const p = atom.proj;
      const r = 8 * p.scale;
      
      let color;
      if (atom.type === 'corner') color = '#60a5fa';
      else if (atom.type === 'body') color = '#f472b6';
      else color = '#34d399';
      
      // 发光效果
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      
      // 球体渐变
      const gradient = ctx.createRadialGradient(p.x - r*0.3, p.y - r*0.3, 0, p.x, p.y, r);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(0.3, color);
      gradient.addColorStop(1, color + '80');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // 标签
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px system-ui';
    const typeNames = { sc: '简单立方(SC)', bcc: '体心立方(BCC)', fcc: '面心立方(FCC)', hcp: '六方密堆积(HCP)' };
    ctx.fillText(typeNames[this.currentType] || this.currentType, 10, 20);
    ctx.fillText(`原子数: ${atoms.length}`, 10, h - 25);
    ctx.fillText('拖拽旋转 →', w - 80, h - 10);
    
    // 图例
    ctx.fillStyle = '#60a5fa';
    ctx.fillRect(w - 80, 10, 10, 10);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('顶点', w - 65, 19);
    if (this.currentType === 'bcc' || this.currentType === 'fcc') {
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(w - 80, 25, 10, 10);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('体心', w - 65, 34);
    }
    if (this.currentType === 'fcc') {
      ctx.fillStyle = '#34d399';
      ctx.fillRect(w - 80, 40, 10, 10);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('面心', w - 65, 49);
    }
  },

  destroy() {
    if (this.canvas) {
      this.canvas.removeEventListener('mousedown', this.onMouseDown);
      this.canvas.removeEventListener('mousemove', this.onMouseMove);
    }
  }
};

// ============================================================
// 虚拟实验室管理器
// ============================================================
const VirtualLabs = {
  currentLab: null,
  currentLabName: null,

  init(labName, canvasId) {
    this.destroy();
    switch (labName) {
      case 'double-slit':
        this.currentLab = DoubleSlitLab;
        this.currentLabName = '双缝干涉';
        break;
      case 'brownian':
        this.currentLab = BrownianLab;
        this.currentLabName = '布朗运动';
        break;
      case 'crystal':
        this.currentLab = CrystalLab;
        this.currentLabName = '晶体结构';
        break;
      default:
        return;
    }
    this.currentLab.init(canvasId);
  },

  setParam(name, value) {
    if (this.currentLab && this.currentLab.setParam) {
      this.currentLab.setParam(name, value);
    }
  },

  destroy() {
    if (this.currentLab && this.currentLab.destroy) {
      this.currentLab.destroy();
    }
    this.currentLab = null;
    this.currentLabName = null;
  }
};

console.log('[VirtualLabs] 虚拟实验室系统已加载：双缝干涉 / 布朗运动 / 晶体结构');

// ============================================================
// 虚拟实验室页面管理器（VirtualLab - 页面调用此对象）
// ============================================================
const VirtualLab = {
  currentTab: 'physics',
  currentLab: null,
  labs: {
    physics: [
      { id: 'double-slit', name: '双缝干涉', desc: '观察光的波动性，调节波长和缝距看干涉条纹变化', icon: 'waves', color: 'blue', difficulty: '入门' },
      { id: 'brownian', name: '布朗运动', desc: '观察花粉颗粒在水中的随机运动，理解分子热运动', icon: 'activity', color: 'amber', difficulty: '入门' },
      { id: 'crystal', name: '晶体结构', desc: '3D展示简单立方/体心立方/面心立方结构，可拖拽旋转', icon: 'box', color: 'pink', difficulty: '进阶' }
    ],
    chemistry: [
      { id: 'coming-soon', name: '敬请期待', desc: '化学实验正在开发中', icon: 'flask-conical', color: 'green', difficulty: '—' }
    ],
    biology: [
      { id: 'coming-soon', name: '敬请期待', desc: '生物实验正在开发中', icon: 'dna', color: 'emerald', difficulty: '—' }
    ],
    material: [
      { id: 'coming-soon', name: '敬请期待', desc: '材料实验正在开发中', icon: 'layers', color: 'purple', difficulty: '—' }
    ]
  },

  setTab(tab) {
    this.currentTab = tab;
    // 更新tab样式
    document.querySelectorAll('#page-experiments .tab-item').forEach(b => {
      b.classList.remove('active');
    });
    const tabs = document.querySelectorAll('#page-experiments .tab-item');
    const tabMap = { physics: 0, chemistry: 1, biology: 2, material: 3 };
    if (tabs[tabMap[tab]]) tabs[tabMap[tab]].classList.add('active');
    this.renderList();
  },

  renderList() {
    const container = document.getElementById('experiment-list');
    if (!container) return;
    
    const labs = this.labs[this.currentTab] || [];
    
    container.innerHTML = labs.map(lab => {
      const colorMap = {
        blue: 'linear-gradient(135deg,#3b82f6,#2563eb)',
        amber: 'linear-gradient(135deg,#f59e0b,#d97706)',
        pink: 'linear-gradient(135deg,#ec4899,#db2777)',
        green: 'linear-gradient(135deg,#10b981,#059669)',
        emerald: 'linear-gradient(135deg,#10b981,#047857)',
        purple: 'linear-gradient(135deg,#8b5cf6,#7c3aed)'
      };
      const bg = colorMap[lab.color] || colorMap.blue;
      const clickHandler = lab.id === 'coming-soon' ? '' : `onclick="VirtualLab.openLab('${lab.id}')"`;
      return `
        <div class="lab-card" ${clickHandler} style="display:flex;gap:14px;padding:16px;background:#fff;border-radius:16px;margin-bottom:12px;box-shadow:0 2px 12px rgba(0,0,0,0.06);cursor:${lab.id === 'coming-soon' ? 'default' : 'pointer'};border:1px solid #f1f5f9">
          <div style="width:52px;height:52px;border-radius:14px;background:${bg};display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <i data-lucide="${lab.icon}" class="lucide icon-white" style="width:24px;height:24px"></i>
          </div>
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
              <span style="font-size:15px;font-weight:700;color:#1f2937">${lab.name}</span>
              <span style="font-size:10px;padding:2px 6px;background:#f1f5f9;color:#64748b;border-radius:4px">${lab.difficulty}</span>
            </div>
            <div style="font-size:12px;color:#64748b;line-height:1.5">${lab.desc}</div>
          </div>
          ${lab.id !== 'coming-soon' ? '<i data-lucide="chevron-right" class="lucide" style="width:20px;height:20px;color:#cbd5e1;flex-shrink:0;align-self:center"></i>' : ''}
        </div>
      `;
    }).join('');
    
    if (typeof renderIcons === 'function') renderIcons();
  },

  openLab(labId) {
    this.currentLab = labId;
    const container = document.getElementById('experiment-list');
    if (!container) return;
    
    const labInfo = this.labs.physics.find(l => l.id === labId);
    if (!labInfo) return;
    
    // 渲染实验室详情页
    container.innerHTML = `
      <div style="margin-bottom:16px">
        <button onclick="VirtualLab.backToList()" style="display:flex;align-items:center;gap:6px;background:none;border:none;cursor:pointer;color:#3b82f6;font-size:14px;font-weight:600;padding:0">
          <i data-lucide="arrow-left" class="lucide" style="width:18px;height:18px"></i>
          返回实验列表
        </button>
      </div>
      <div style="text-align:center;margin-bottom:16px">
        <h3 style="font-size:18px;font-weight:700;color:#1f2937;margin:0 0 4px 0">${labInfo.name}</h3>
        <p style="font-size:12px;color:#64748b;margin:0">${labInfo.desc}</p>
      </div>
      <div style="background:#0f172a;border-radius:16px;overflow:hidden;margin-bottom:16px;box-shadow:0 4px 20px rgba(0,0,0,0.1)">
        <canvas id="lab-canvas" width="350" height="280" style="width:100%;display:block;touch-action:none"></canvas>
      </div>
      <div id="lab-controls"></div>
    `;
    
    if (typeof renderIcons === 'function') renderIcons();
    
    // 初始化实验室
    setTimeout(() => {
      VirtualLabs.init(labId, 'lab-canvas');
      this.renderControls(labId);
    }, 100);
  },

  renderControls(labId) {
    const container = document.getElementById('lab-controls');
    if (!container) return;
    
    let controlsHTML = '<div style="background:#fff;border-radius:16px;padding:16px;box-shadow:0 2px 12px rgba(0,0,0,0.06)">';
    
    if (labId === 'double-slit') {
      controlsHTML += `
        <div style="margin-bottom:14px">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:13px;font-weight:600;color:#374151">波长</span>
            <span style="font-size:13px;color:#3b82f6;font-weight:600" id="wl-value">550 nm</span>
          </div>
          <input type="range" min="400" max="700" value="550" style="width:100%" oninput="VirtualLab.updateParam('wavelength', this.value); document.getElementById('wl-value').textContent=this.value+' nm'">
          <div style="display:flex;justify-content:space-between;font-size:10px;color:#94a3b8"><span>紫 400nm</span><span>红 700nm</span></div>
        </div>
        <div style="margin-bottom:14px">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:13px;font-weight:600;color:#374151">缝间距</span>
            <span style="font-size:13px;color:#3b82f6;font-weight:600" id="sd-value">80 px</span>
          </div>
          <input type="range" min="40" max="150" value="80" style="width:100%" oninput="VirtualLab.updateParam('slitDistance', this.value); document.getElementById('sd-value').textContent=this.value+' px'">
        </div>
        <div style="background:#eff6ff;border-radius:10px;padding:10px;font-size:11px;color:#1e40af;line-height:1.5">
          💡 波长越长，条纹间距越大；缝间距越小，条纹间距越大。这验证了杨氏双缝干涉公式 Δy = λL/d
        </div>
      `;
    } else if (labId === 'brownian') {
      controlsHTML += `
        <div style="margin-bottom:14px">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:13px;font-weight:600;color:#374151">温度</span>
            <span style="font-size:13px;color:#f59e0b;font-weight:600" id="temp-value">300 K</span>
          </div>
          <input type="range" min="100" max="800" value="300" style="width:100%" oninput="VirtualLab.updateParam('temperature', parseInt(this.value)); document.getElementById('temp-value').textContent=this.value+' K'">
          <div style="display:flex;justify-content:space-between;font-size:10px;color:#94a3b8"><span>冷 100K</span><span>热 800K</span></div>
        </div>
        <div style="margin-bottom:14px">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:13px;font-weight:600;color:#374151">分子数</span>
            <span style="font-size:13px;color:#f59e0b;font-weight:600" id="pc-value">60</span>
          </div>
          <input type="range" min="20" max="150" value="60" style="width:100%" oninput="VirtualLab.updateParam('particleCount', parseInt(this.value)); document.getElementById('pc-value').textContent=this.value">
        </div>
        <button onclick="VirtualLab.resetBrownian()" style="width:100%;padding:10px;background:#f59e0b;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;margin-bottom:10px">🔄 重置实验</button>
        <div style="background:#fffbeb;border-radius:10px;padding:10px;font-size:11px;color:#92400e;line-height:1.5">
          💡 温度越高，分子运动越剧烈，花粉颗粒的随机运动越明显。这就是布朗运动——爱因斯坦1905年证明了分子的存在。
        </div>
      `;
    } else if (labId === 'crystal') {
      controlsHTML += `
        <div style="margin-bottom:14px">
          <div style="font-size:13px;font-weight:600;color:#374151;margin-bottom:8px">晶体结构类型</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <button onclick="VirtualLab.setCrystalType('sc')" id="btn-sc" style="padding:10px;border:2px solid #e2e8f0;border-radius:10px;background:#fff;font-size:12px;font-weight:600;color:#64748b;cursor:pointer">简单立方 SC</button>
            <button onclick="VirtualLab.setCrystalType('bcc')" id="btn-bcc" style="padding:10px;border:2px solid #e2e8f0;border-radius:10px;background:#fff;font-size:12px;font-weight:600;color:#64748b;cursor:pointer">体心立方 BCC</button>
            <button onclick="VirtualLab.setCrystalType('fcc')" id="btn-fcc" style="padding:10px;border:2px solid #3b82f6;border-radius:10px;background:#eff6ff;font-size:12px;font-weight:600;color:#3b82f6;cursor:pointer">面心立方 FCC</button>
            <button onclick="VirtualLab.setCrystalType('hcp')" id="btn-hcp" style="padding:10px;border:2px solid #e2e8f0;border-radius:10px;background:#fff;font-size:12px;font-weight:600;color:#64748b;cursor:pointer">六方密堆积 HCP</button>
          </div>
        </div>
        <div style="background:#fdf2f8;border-radius:10px;padding:10px;font-size:11px;color:#9d174d;line-height:1.5">
          💡 拖拽画布可3D旋转晶体结构。不同结构原子堆积密度不同：FCC和HCP最密(74%)，BCC次之(68%)，SC最疏(52%)。
        </div>
      `;
    }
    
    controlsHTML += '</div>';
    container.innerHTML = controlsHTML;
  },

  updateParam(name, value) {
    VirtualLabs.setParam(name, value);
  },

  resetBrownian() {
    if (VirtualLabs.currentLab === BrownianLab) {
      BrownianLab.reset();
    }
  },

  setCrystalType(type) {
    CrystalLab.setType(type);
    // 更新按钮样式
    ['sc', 'bcc', 'fcc', 'hcp'].forEach(t => {
      const btn = document.getElementById('btn-' + t);
      if (btn) {
        if (t === type) {
          btn.style.border = '2px solid #3b82f6';
          btn.style.background = '#eff6ff';
          btn.style.color = '#3b82f6';
        } else {
          btn.style.border = '2px solid #e2e8f0';
          btn.style.background = '#fff';
          btn.style.color = '#64748b';
        }
      }
    });
  },

  backToList() {
    VirtualLabs.destroy();
    this.currentLab = null;
    this.renderList();
  }
};

// 页面加载后自动渲染实验列表
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('experiment-list')) {
    VirtualLab.renderList();
  }
});

console.log('[VirtualLab] 虚拟实验室页面管理器已加载');
