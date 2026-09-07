#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys, re
sys.stdout.reconfigure(encoding='utf-8')

FILEPATH = r'C:\DouBaoXO\OneOS-V1\unisci\index.html'

with open(FILEPATH, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. 修复page-notebook-list中的新建按钮
content = content.replace(
    "onclick=\"NotebookListRenderer.showNewMenu()\"",
    "onclick=\"NotebookListRendererV2.showNewMenu()\""
)
print('✅ 新建按钮已更新为V2')

# 2. 修复page-notebook-detail中的保存按钮
content = content.replace(
    "onclick=\"NotebookEditor.save()\"",
    "onclick=\"NotebookEditorV2.save()\""
)
print('✅ 保存按钮已更新为V2')

# 3. 在renderSubPage中添加page-notebook-list的V2渲染
# 检查是否已有
if 'NotebookListRendererV2.render' not in content:
    # 在page-notebook-detail的处理之前添加
    old = "if (pageId === 'page-notebook-detail')"
    new = "if (pageId === 'page-notebook-list') { setTimeout(() => { if (typeof NotebookListRendererV2 !== 'undefined') NotebookListRendererV2.render(); }, 100); }\n  " + old
    if old in content:
        content = content.replace(old, new)
        print('✅ page-notebook-list V2渲染已添加')
    else:
        print('⚠️ 未找到page-notebook-detail处理')
else:
    print('⚠️ NotebookListRendererV2.render已存在')

with open(FILEPATH, 'w', encoding='utf-8') as f:
    f.write(content)

print('\n✅ 修复完成')
