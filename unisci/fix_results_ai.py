#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""第一纵队：在JobDetailRenderer.renderResults中添加AI解释，修复下载toast"""

import sys
sys.stdout.reconfigure(encoding='utf-8')

FILEPATH = r'C:\DouBaoXO\OneOS-V1\unisci\compute.js'

with open(FILEPATH, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. 在renderResults的关键数据卡片之前添加AI解释
# 找到关键数据卡片的开头
old_results_card = """    content.innerHTML = `
      <div class="card" style="background:linear-gradient(135deg,#f0f7ff,#e8f0f8);margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div class="card-title" style="margin:0"><i data-lucide="bar-chart-3" class="lucide" style="width:16px;height:16px;color:var(--pri"""

new_results_with_ai = """    // AI智能解释
    const bg = parseFloat(r.bandgap) || 0;
    let matType = bg === 0 ? '金属' : (bg < 0.5 ? '窄带隙半导体' : (bg < 2.5 ? '半导体' : (bg < 4 ? '宽带隙半导体' : '绝缘体')));
    let matColor = bg === 0 ? '#ff6b4a' : (bg < 0.5 ? '#ffa94d' : (bg < 2.5 ? '#4ecdc4' : (bg < 4 ? '#5ba3d9' : '#9b7ed8')));
    let matDesc = bg === 0 ? '带隙为0，电子可自由移动，具有良好导电性。' : (bg < 0.5 ? '带隙较窄，适合红外探测和热电应用。' : (bg < 2.5 ? '带隙适中，是电子器件和光电器件的理想材料。' : (bg < 4 ? '带隙较宽，适合高压、高频和高温应用。' : '带隙很宽，电子难以激发，通常用作绝缘材料。')));

    content.innerHTML = `
      <div class="card" style="margin-bottom:16px;padding:16px;background:linear-gradient(135deg,#f0f9ff,#e0f2fe);border:1px solid #bae6fd;border-radius:16px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
          <div style="width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,#0ea5e9,#0284c7);display:flex;align-items:center;justify-content:center">
            <i data-lucide="sparkles" class="lucide icon-white" style="width:16px;height:16px"></i>
          </div>
          <div style="font-size:14px;font-weight:700;color:#0369a1">AI 智能解读</div>
          <span style="margin-left:auto;font-size:10px;color:#0284c7;background:#0ea5e922;padding:3px 8px;border-radius:6px">自动生成</span>
        </div>
        <div style="font-size:13px;line-height:1.7;color:#0c4a6e">该材料带隙为 <b style="color:${matColor}">${r.bandgap} eV</b>，属于<b>${matType}</b>。${matDesc}总能量 <b>${r.totalEnergy} eV</b>，费米能级 <b>${r.fermiLevel} eV</b>。</div>
        <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
          <span style="background:#fff;color:#0284c7;border:1px solid #bae6fd;font-size:11px;padding:4px 10px;border-radius:8px;cursor:pointer" onclick="navigateTo('page-knowledge-graph')">知识图谱</span>
          <span style="background:#fff;color:#0284c7;border:1px solid #bae6fd;font-size:11px;padding:4px 10px;border-radius:8px;cursor:pointer" onclick="navigateTo('page-materials')">相关材料</span>
          <span style="background:#fff;color:#0284c7;border:1px solid #bae6fd;font-size:11px;padding:4px 10px;border-radius:8px;cursor:pointer" onclick="navigateTo('page-courses')">学习课程</span>
        </div>
      </div>
      <div class="card" style="background:linear-gradient(135deg,#f0f7ff,#e8f0f8);margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div class="card-title" style="margin:0"><i data-lucide="bar-chart-3" class="lucide" style="width:16px;height:16px;color:var(--pri"""

if old_results_card in content:
    content = content.replace(old_results_card, new_results_with_ai, 1)
    print("✅ 1. renderResults已添加AI解释")
else:
    print("❌ 1. 未找到renderResults的匹配字符串")
    # 打印附近内容帮助调试
    idx = content.find('renderResults(job)')
    if idx >= 0:
        print("附近内容:", content[idx:idx+300])

# 2. 修复下载按钮的toast模拟
old_download = """<button onclick="UI.toast.success('下载 ${f.name}')" style="background:none;border:none;cursor:pointer;color:var(--primary)"><i"""
new_download = """<button onclick="JobDetailRenderer.downloadFile('${f.name}')" style="background:none;border:none;cursor:pointer;color:var(--primary)"><i"""
if old_download in content:
    content = content.replace(old_download, new_download, 1)
    print("✅ 2. 下载按钮已修复（toast→真实方法）")
else:
    print("⚠️ 2. 未找到下载按钮匹配字符串")

# 3. 添加downloadFile方法
download_method = """
  // 下载文件（真实功能 - 生成模拟内容下载）
  downloadFile(name) {
    const content = `# UniSci 计算结果文件\\n# 文件名: ${name}\\n# 生成时间: ${new Date().toLocaleString()}\\n\\n这是模拟的计算结果文件内容。\\n在真实部署环境中，这里将下载实际的计算输出文件。\\n`;
    const blob = new Blob([content], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (typeof UI !== 'undefined') UI.toast.success('已下载: ' + name);
  },

  renderFiles(job) {"""

old_renderfiles = "  renderFiles(job) {"
if old_renderfiles in content and "downloadFile(name)" not in content:
    content = content.replace(old_renderfiles, download_method, 1)
    print("✅ 3. downloadFile方法已添加")
else:
    print("⚠️ 3. downloadFile方法可能已存在或未找到renderFiles")

with open(FILEPATH, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"\n✅ 文件已保存，大小: {len(content)} 字符")
