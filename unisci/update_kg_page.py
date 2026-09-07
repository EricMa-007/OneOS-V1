#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys, re
sys.stdout.reconfigure(encoding='utf-8')

FILEPATH = r'C:\DouBaoXO\OneOS-V1\unisci\index.html'

with open(FILEPATH, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. 引入knowledge-graph-v2.js
if 'knowledge-graph-v2.js' not in content:
    content = content.replace(
        '<script src="workflow-editor.js',
        '<script src="knowledge-graph-v2.js?v=20260827_1720"></script>\n<script src="workflow-editor.js'
    )
    print('✅ knowledge-graph-v2.js已引入')
else:
    print('⚠️ knowledge-graph-v2.js已存在')

# 2. 替换page-knowledge-graph页面
start_match = re.search(r'<div[^>]*id="page-knowledge-graph"[^>]*>', content)
if start_match:
    start = start_match.start()
    end_match = re.search(r'<div[^>]*id="page-[^"]+"', content[start+20:])
    if end_match:
        end = start + 20 + end_match.start()
    else:
        end = start + 3000
    
    old_page = content[start:end]
    print(f'找到page-knowledge-graph，长度: {len(old_page)}')
    
    new_page = '''<div class="page sub-page" id="page-knowledge-graph">
<div class="sub-header"><button class="back-btn" onclick="goBack()"><i data-lucide="arrow-left" class="lucide"></i></button><div class="sub-title">知识图谱</div></div>
<div style="padding:12px">
  <!-- 工具栏 -->
  <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">
    <input type="text" id="kg-search" placeholder="搜索知识节点..." oninput="KnowledgeGraphRenderer.search(this.value)" style="flex:1;min-width:150px;padding:8px 12px;border:1px solid #e2e8f0;border-radius:10px;font-size:13px;background:#fff">
    <button onclick="KnowledgeGraphRenderer.setMode('2d')" id="kg-btn-2d" style="padding:8px 14px;background:#3b82f6;color:#fff;border:none;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer">二维</button>
    <button onclick="KnowledgeGraphRenderer.setMode('3d')" id="kg-btn-3d" style="padding:8px 14px;background:#f1f5f9;color:#475569;border:none;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer">三维</button>
    <button onclick="KnowledgeGraphRenderer.resetView()" style="padding:8px 12px;background:#f1f5f9;color:#475569;border:none;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer"><i data-lucide="rotate-ccw" class="lucide" style="width:14px;height:14px;vertical-align:middle"></i></button>
  </div>
  <!-- 主区域 -->
  <div style="display:flex;gap:12px;height:calc(100vh - 200px)">
    <!-- 图谱画布 -->
    <div style="flex:1;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);position:relative;min-width:0">
      <canvas id="kg-canvas" style="width:100%;height:100%;display:block;touch-action:none"></canvas>
    </div>
    <!-- 详情面板 -->
    <div id="kg-detail-panel" style="width:220px;background:#0f172a;border-radius:16px;overflow-y:auto;flex-shrink:0;box-shadow:0 4px 20px rgba(0,0,0,0.1)">
      <div style="padding:20px;text-align:center;color:#64748b">
        <i data-lucide="mouse-pointer-click" class="lucide" style="width:32px;height:32px;margin-bottom:8px;opacity:0.5"></i>
        <div style="font-size:13px">点击节点查看详情</div>
        <div style="font-size:11px;margin-top:4px;color:#475569">拖拽节点 · 滚轮缩放</div>
      </div>
    </div>
  </div>
  <!-- 图例 -->
  <div style="display:flex;gap:12px;margin-top:12px;flex-wrap:wrap;justify-content:center">
    <div style="display:flex;align-items:center;gap:4px"><div style="width:10px;height:10px;border-radius:50%;background:#ef4444"></div><span style="font-size:10px;color:#64748b">理论</span></div>
    <div style="display:flex;align-items:center;gap:4px"><div style="width:10px;height:10px;border-radius:50%;background:#8b5cf6"></div><span style="font-size:10px;color:#64748b">方法</span></div>
    <div style="display:flex;align-items:center;gap:4px"><div style="width:10px;height:10px;border-radius:50%;background:#f59e0b"></div><span style="font-size:10px;color:#64748b">软件</span></div>
    <div style="display:flex;align-items:center;gap:4px"><div style="width:10px;height:10px;border-radius:50%;background:#3b82f6"></div><span style="font-size:10px;color:#64748b">概念</span></div>
    <div style="display:flex;align-items:center;gap:4px"><div style="width:10px;height:10px;border-radius:50%;background:#10b981"></div><span style="font-size:10px;color:#64748b">材料</span></div>
    <div style="display:flex;align-items:center;gap:4px"><div style="width:10px;height:10px;border-radius:50%;background:#06b6d4"></div><span style="font-size:10px;color:#64748b">应用</span></div>
    <div style="display:flex;align-items:center;gap:4px"><div style="width:10px;height:10px;border-radius:50%;background:#ec4899"></div><span style="font-size:10px;color:#64748b">科学家</span></div>
  </div>
</div>
</div>

'''
    
    content = content[:start] + new_page + content[end:]
    print('✅ page-knowledge-graph已替换')
else:
    print('❌ 未找到page-knowledge-graph')

# 3. 在renderSubPage中添加知识图谱初始化
if 'KnowledgeGraphRenderer.init' not in content:
    # 找到page-knowledge-graph在renderSubPage中的处理
    kg_render = re.search(r"pageId === 'page-knowledge-graph'[^}]*\}", content)
    if kg_render:
        old_render = kg_render.group()
        new_render = old_render + "\n    setTimeout(() => { if (typeof KnowledgeGraphRenderer !== 'undefined') KnowledgeGraphRenderer.init('kg-canvas'); }, 150);"
        content = content.replace(old_render, new_render)
        print('✅ KnowledgeGraphRenderer.init已添加')
    else:
        print('⚠️ 未在renderSubPage中找到page-knowledge-graph处理')
else:
    print('⚠️ KnowledgeGraphRenderer.init已存在')

with open(FILEPATH, 'w', encoding='utf-8') as f:
    f.write(content)

print('\n✅ index.html修改完成')
