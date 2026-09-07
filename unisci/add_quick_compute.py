#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""第一纵队：在首页添加一键计算区域"""

import sys
sys.stdout.reconfigure(encoding='utf-8')

FILEPATH = r'C:\DouBaoXO\OneOS-V1\unisci\index.html'

with open(FILEPATH, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 找到gpu-card行（行373）
insert_idx = None
for i, line in enumerate(lines):
    if 'id="gpu-card"' in line:
        insert_idx = i + 1  # 在这行后面插入
        break

if insert_idx is None:
    print("❌ 未找到gpu-card")
    sys.exit(1)

print(f"在第{insert_idx+1}行后插入一键计算区域")

# 一键计算区域HTML
quick_compute_html = '''
  <!-- 🚀 一键计算区域 - 第一纵队 -->
  <div class="section-header" style="margin-top:20px">
    <div class="section-title">
      <span class="section-title-icon sti-red" style="background:linear-gradient(135deg,#ff6b6b,#ee5a5a)">
        <i data-lucide="rocket" class="lucide" style="width:14px;height:14px"></i>
      </span>
      一键计算
      <span style="font-size:11px;color:var(--text3);font-weight:400;margin-left:8px">点一下，跑起来</span>
    </div>
    <div class="section-more" onclick="switchTab('compute')" style="cursor:pointer">全部模板</div>
  </div>
  <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:16px">
    <!-- 模板1：MoS₂能带结构 -->
    <div class="card" onclick="quickCompute('mos2_band')" style="cursor:pointer;padding:16px;display:flex;align-items:center;gap:14px;border-left:4px solid #ff6b6b">
      <div style="width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#ff6b6b,#ee5a5a);display:flex;align-items:center;justify-content:center;flex-shrink:0">
        <i data-lucide="layers" class="lucide icon-white" style="width:24px;height:24px"></i>
      </div>
      <div style="flex:1;min-width:0">
        <div style="font-size:15px;font-weight:700;color:var(--text)">MoS₂ 能带结构计算</div>
        <div style="font-size:12px;color:var(--text3);margin-top:2px">VASP · DFT · 预计8分钟 · 含能带图+态密度</div>
      </div>
      <div style="flex-shrink:0">
        <span class="badge" style="background:#ff6b6b22;color:#ff6b6b;font-size:11px;padding:4px 10px">热门</span>
      </div>
    </div>
    <!-- 模板2：石墨烯输运 -->
    <div class="card" onclick="quickCompute('graphene_transport')" style="cursor:pointer;padding:16px;display:flex;align-items:center;gap:14px;border-left:4px solid #4ecdc4">
      <div style="width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#4ecdc4,#44a08d);display:flex;align-items:center;justify-content:center;flex-shrink:0">
        <i data-lucide="zap" class="lucide icon-white" style="width:24px;height:24px"></i>
      </div>
      <div style="flex:1;min-width:0">
        <div style="font-size:15px;font-weight:700;color:var(--text)">石墨烯纳米带 输运性质</div>
        <div style="font-size:12px;color:var(--text3);margin-top:2px">VASP · DFT+NEGF · 预计12分钟 · 含透射系数</div>
      </div>
      <div style="flex-shrink:0">
        <span class="badge" style="background:#4ecdc422;color:#4ecdc4;font-size:11px;padding:4px 10px">进阶</span>
      </div>
    </div>
    <!-- 模板3：水分子优化 -->
    <div class="card" onclick="quickCompute('water_opt')" style="cursor:pointer;padding:16px;display:flex;align-items:center;gap:14px;border-left:4px solid #a8e6cf">
      <div style="width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#a8e6cf,#88d8b0);display:flex;align-items:center;justify-content:center;flex-shrink:0">
        <i data-lucide="droplets" class="lucide icon-white" style="width:24px;height:24px"></i>
      </div>
      <div style="flex:1;min-width:0">
        <div style="font-size:15px;font-weight:700;color:var(--text)">水分子 结构优化</div>
        <div style="font-size:12px;color:var(--text3);margin-top:2px">VASP · DFT · 预计3分钟 · 新手入门首选</div>
      </div>
      <div style="flex-shrink:0">
        <span class="badge" style="background:#a8e6cf33;color:#5cb85c;font-size:11px;padding:4px 10px">入门</span>
      </div>
    </div>
  </div>
'''

# 插入
lines.insert(insert_idx, quick_compute_html)

with open(FILEPATH, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print(f"✅ 一键计算区域已插入，文件现在有 {len(lines)} 行")
