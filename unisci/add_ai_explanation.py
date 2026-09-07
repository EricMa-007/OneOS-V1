#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""第一纵队：在ResultsRenderer中添加AI自动解释功能"""

import sys
sys.stdout.reconfigure(encoding='utf-8')

FILEPATH = r'C:\DouBaoXO\OneOS-V1\unisci\compute.js'

with open(FILEPATH, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. 在render方法的container.innerHTML中添加AI解释调用
old_render = """    container.innerHTML = `
      <div class="tab-bar" style="margin-bottom:16px">"""

new_render = """    container.innerHTML = `
      ${this.renderAIExplanation()}
      <div class="tab-bar" style="margin-bottom:16px">"""

if old_render in content:
    content = content.replace(old_render, new_render, 1)
    print("✅ 1. render方法已添加AI解释调用")
else:
    print("❌ 1. 未找到render方法的匹配字符串")

# 2. 在renderTabContent方法之前添加renderAIExplanation方法
ai_explanation_method = """
  // 🤖 AI自动解释 - 让计算结果会说话（第一纵队）
  renderAIExplanation() {
    const r = this.currentJob?.results || {};
    const job = this.currentJob || {};
    const bg = parseFloat(r.bandgap) || 0;
    const energy = parseFloat(r.totalEnergy) || 0;
    const fermi = parseFloat(r.fermiLevel) || 0;

    // 根据带隙判断材料类型
    let materialType = '';
    let typeColor = '';
    let typeDesc = '';
    if (bg === 0) {
      materialType = '金属'; typeColor = '#ff6b4a';
      typeDesc = '带隙为0，电子可以自由移动，具有良好的导电性。';
    } else if (bg < 0.5) {
      materialType = '窄带隙半导体'; typeColor = '#ffa94d';
      typeDesc = '带隙较窄，适合红外探测和热电应用。';
    } else if (bg < 2.5) {
      materialType = '半导体'; typeColor = '#4ecdc4';
      typeDesc = '带隙适中，是电子器件和光电器件的理想材料。';
    } else if (bg < 4) {
      materialType = '宽带隙半导体'; typeColor = '#5ba3d9';
      typeDesc = '带隙较宽，适合高压、高频和高温应用。';
    } else {
      materialType = '绝缘体'; typeColor = '#9b7ed8';
      typeDesc = '带隙很宽，电子难以激发，通常用作绝缘材料。';
    }

    // 生成AI解释文本
    const explanation = `你的${job.title || '计算任务'}已完成。该材料的带隙为 <b style="color:${typeColor}">${bg} eV</b>，属于<b>${materialType}</b>。${typeDesc}总能量为 <b>${energy} eV</b>，费米能级为 <b>${fermi} eV</b>。`;

    return `
      <div class="card" style="margin-bottom:16px;padding:16px;background:linear-gradient(135deg,#f0f9ff,#e0f2fe);border:1px solid #bae6fd;border-radius:16px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
          <div style="width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,#0ea5e9,#0284c7);display:flex;align-items:center;justify-content:center">
            <i data-lucide="sparkles" class="lucide icon-white" style="width:16px;height:16px"></i>
          </div>
          <div style="font-size:14px;font-weight:700;color:#0369a1">AI 智能解读</div>
          <span class="badge" style="margin-left:auto;background:#0ea5e922;color:#0284c7;font-size:10px;padding:3px 8px">自动生成</span>
        </div>
        <div style="font-size:13px;line-height:1.7;color:#0c4a6e">${explanation}</div>
        <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
          <span class="chip" style="background:#fff;color:#0284c7;border:1px solid #bae6fd;font-size:11px;padding:4px 10px;cursor:pointer" onclick="navigateTo('page-knowledge-graph')"><i data-lucide="network" class="lucide" style="width:12px;height:12px"></i>查看知识图谱</span>
          <span class="chip" style="background:#fff;color:#0284c7;border:1px solid #bae6fd;font-size:11px;padding:4px 10px;cursor:pointer" onclick="navigateTo('page-materials')"><i data-lucide="flask-conical" class="lucide" style="width:12px;height:12px"></i>相关材料</span>
          <span class="chip" style="background:#fff;color:#0284c7;border:1px solid #bae6fd;font-size:11px;padding:4px 10px;cursor:pointer" onclick="navigateTo('page-courses')"><i data-lucide="graduation-cap" class="lucide" style="width:12px;height:12px"></i>学习课程</span>
        </div>
      </div>
    `;
  },

  renderTabContent() {"""

# 在renderTabContent方法之前插入
old_rendertab = "  renderTabContent() {"
if old_rendertab in content:
    content = content.replace(old_rendertab, ai_explanation_method, 1)
    print("✅ 2. renderAIExplanation方法已添加")
else:
    print("❌ 2. 未找到renderTabContent方法")

# 3. 修复"导出SVG"的toast模拟 - 改为真实下载
old_export = """<span class="chip" onclick="UI.toast.success('已导出SVG')">导出SVG</span>"""
new_export = """<span class="chip" onclick="ResultsRenderer.exportSVG(this)" style="cursor:pointer">导出SVG</span>"""
if old_export in content:
    content = content.replace(old_export, new_export, 1)
    print("✅ 3. 导出SVG按钮已修复（toast→真实下载）")
else:
    print("⚠️ 3. 未找到导出SVG按钮（可能已修复或不存在）")

# 4. 添加exportSVG方法
export_method = """
  // 导出SVG为文件（真实功能）
  exportSVG(btn) {
    const svg = btn.closest('.card')?.querySelector('svg');
    if (!svg) { if (typeof UI !== 'undefined') UI.toast.error('未找到SVG图表'); return; }
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], {type: 'image/svg+xml'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = (this.currentJob?.title || 'result') + '_' + this.currentTab + '.svg';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (typeof UI !== 'undefined') UI.toast.success('SVG已导出');
  },
"""
# 在renderAIExplanation方法之后插入
if "exportSVG(btn)" not in content:
    insert_point = "  renderTabContent() {"
    content = content.replace(insert_point, export_method + "\n" + insert_point, 1)
    print("✅ 4. exportSVG方法已添加")
else:
    print("⚠️ 4. exportSVG方法已存在")

with open(FILEPATH, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"\n✅ 文件已保存，大小: {len(content)} 字符")
