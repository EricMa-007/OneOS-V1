#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

FILEPATH = r'C:\DouBaoXO\OneOS-V1\unisci\index.html'

with open(FILEPATH, 'r', encoding='utf-8') as f:
    content = f.read()

# 修复WorkflowEditor.init调用
old = "if (pageId === 'page-workflow-editor') { if (typeof WorkflowEditor !== 'undefined') WorkflowEditor.init(data); }"
new = "if (pageId === 'page-workflow-editor') { setTimeout(() => { if (typeof WorkflowEditor !== 'undefined') WorkflowEditor.init('workflow-editor-container'); }, 100); }"

if old in content:
    content = content.replace(old, new)
    with open(FILEPATH, 'w', encoding='utf-8') as f:
        f.write(content)
    print('✅ WorkflowEditor.init调用已修复')
else:
    print('⚠️ 未找到旧的调用，检查是否已修复')
    # 搜索当前的调用
    import re
    match = re.search(r"page-workflow-editor.*?WorkflowEditor\.init\([^)]+\)", content)
    if match:
        print('当前调用:', match.group())
