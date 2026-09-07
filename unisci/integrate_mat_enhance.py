#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

FILEPATH = r'C:\DouBaoXO\OneOS-V1\unisci\index.html'

with open(FILEPATH, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. 引入materials-enhancements.js
if 'materials-enhancements.js' not in content:
    content = content.replace(
        '<script src="notebook-v2.js',
        '<script src="materials-enhancements.js?v=20260827_1730"></script>\n<script src="notebook-v2.js'
    )
    print('✅ materials-enhancements.js已引入')
else:
    print('⚠️ 已存在')

# 2. 在材料详情页header中添加增强按钮
# 找到material-detail-header容器，在其后面添加增强功能栏
old_header = '<div id="material-detail-header"></div>\n  <div id="material-detail-tabs"></div>'
new_header = '''<div id="material-detail-header"></div>
  <!-- 增强功能栏 -->
  <div id="material-enhance-bar" style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">
    <button onclick="MaterialsEnhancements.toggleFavorite(MaterialDetailRenderer.currentMaterialId); MaterialDetailRenderer.refresh();" id="mat-fav-btn" style="padding:8px 12px;background:#fffef0;color:#f59e0b;border:1px solid #fde68a;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:4px">
      <i data-lucide="star" class="lucide" style="width:14px;height:14px"></i>收藏
    </button>
    <button onclick="MaterialsEnhancements.addToCompare(MaterialDetailRenderer.currentMaterialId); alert('已添加到对比')" style="padding:8px 12px;background:#eff6ff;color:#2563eb;border:1px solid #bfdbfe;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:4px">
      <i data-lucide="git-compare" class="lucide" style="width:14px;height:14px"></i>对比
    </button>
    <button onclick="var r=MaterialsEnhancements.exportMaterial(MaterialDetailRenderer.currentMaterialId,'cif'); alert('已导出: '+r.filename)" style="padding:8px 12px;background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:4px">
      <i data-lucide="download" class="lucide" style="width:14px;height:14px"></i>导出CIF
    </button>
    <button onclick="var r=MaterialsEnhancements.submitCalculation(MaterialDetailRenderer.currentMaterialId,'DFT'); alert('计算任务已提交: '+r.jobId)" style="padding:8px 12px;background:linear-gradient(135deg,#8b5cf6,#7c3aed);color:#fff;border:none;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:4px">
      <i data-lucide="zap" class="lucide" style="width:14px;height:14px"></i>提交计算
    </button>
  </div>
  <!-- 晶体结构可视化 -->
  <div id="material-crystal-viewer" class="card" style="margin-bottom:12px;padding:16px"></div>
  <div id="material-detail-tabs"></div>'''

if old_header in content:
    content = content.replace(old_header, new_header)
    print('✅ 材料详情增强功能栏已添加')
else:
    print('⚠️ 未找到material-detail-header容器')

with open(FILEPATH, 'w', encoding='utf-8') as f:
    f.write(content)

print('\n✅ 集成完成')
