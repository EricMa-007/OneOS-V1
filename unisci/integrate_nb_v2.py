#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys, re
sys.stdout.reconfigure(encoding='utf-8')

FILEPATH = r'C:\DouBaoXO\OneOS-V1\unisci\index.html'

with open(FILEPATH, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. 引入notebook-v2.js
if 'notebook-v2.js' not in content:
    content = content.replace(
        '<script src="knowledge-graph-v2.js',
        '<script src="notebook-v2.js?v=20260827_1720"></script>\n<script src="knowledge-graph-v2.js'
    )
    print('✅ notebook-v2.js已引入')
else:
    print('⚠️ notebook-v2.js已存在')

# 2. 修改renderSubPage中的notebook-list调用
old_list = "if (pageId === 'page-notebook-list') { if (typeof NotebookListRenderer !== 'undefined') NotebookListRenderer.render(); }"
new_list = "if (pageId === 'page-notebook-list') { setTimeout(() => { if (typeof NotebookListRendererV2 !== 'undefined') NotebookListRendererV2.render(); }, 100); }"
if old_list in content:
    content = content.replace(old_list, new_list)
    print('✅ notebook-list渲染已更新为V2')
else:
    print('⚠️ 未找到旧的notebook-list渲染调用，搜索其他形式...')
    # 搜索其他形式
    match = re.search(r"page-notebook-list[^}]*\}", content)
    if match:
        print('  找到:', match.group())

# 3. 修改renderSubPage中的notebook-detail调用
old_detail = "if (pageId === 'page-notebook-detail') { if (typeof NotebookEditor !== 'undefined') NotebookEditor.init(data); else renderNotebookDetail(data); }"
new_detail = "if (pageId === 'page-notebook-detail') { setTimeout(() => { if (typeof NotebookEditorV2 !== 'undefined') { if (data && typeof data === 'string') NotebookEditorV2.open(data); else NotebookEditorV2.open(null); } }, 100); }"
if old_detail in content:
    content = content.replace(old_detail, new_detail)
    print('✅ notebook-detail渲染已更新为V2')
else:
    print('⚠️ 未找到旧的notebook-detail渲染调用')

# 4. 修改列表中点击事件（如果有使用旧的_store方式）
content = content.replace(
    "navigateTo('page-notebook-detail','${_store(nb)}')",
    "NotebookEditorV2.open('${nb.id}')"
)

with open(FILEPATH, 'w', encoding='utf-8') as f:
    f.write(content)

print('\n✅ index.html修改完成')
