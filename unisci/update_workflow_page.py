#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys, re
sys.stdout.reconfigure(encoding='utf-8')

FILEPATH = r'C:\DouBaoXO\OneOS-V1\unisci\index.html'

with open(FILEPATH, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. 引入workflow-editor.js
if 'workflow-editor.js' not in content:
    content = content.replace(
        '<script src="labs.js',
        '<script src="workflow-editor.js?v=20260827_1720"></script>\n<script src="labs.js'
    )
    print('✅ workflow-editor.js已引入')
else:
    print('⚠️ workflow-editor.js已存在')

# 2. 找到page-workflow-editor页面并替换内容
# 找到页面开始
start_match = re.search(r'<div[^>]*id="page-workflow-editor"[^>]*>', content)
if start_match:
    start = start_match.start()
    # 找到下一个page-或</div>结束
    end_match = re.search(r'<div[^>]*id="page-[^"]+"', content[start+20:])
    if end_match:
        end = start + 20 + end_match.start()
    else:
        end = start + 3000
    
    old_page = content[start:end]
    print(f'找到page-workflow-editor，长度: {len(old_page)}')
    
    # 新页面内容
    new_page = '''<div class="page sub-page" id="page-workflow-editor">
<div class="sub-header"><button class="back-btn" onclick="goBack()"><i data-lucide="arrow-left" class="lucide"></i></button><div class="sub-title">工作流编辑器</div></div>
<div id="workflow-editor-container" style="height:calc(100vh - 120px);padding:0"></div>
</div>

'''
    
    content = content[:start] + new_page + content[end:]
    print('✅ page-workflow-editor已替换为新编辑器容器')
else:
    print('❌ 未找到page-workflow-editor')

# 3. 在renderSubPage中添加workflow-editor初始化
# 找到renderSubPage函数
render_match = re.search(r'function renderSubPage\(pageId\)', content)
if render_match:
    render_start = render_match.start()
    # 找到函数中的switch或if块
    # 检查是否已有workflow-editor初始化
    if 'WorkflowEditor.init' not in content:
        # 在renderSubPage中添加
        # 找到一个合适的位置插入
        insert_point = content.find('page-workflow-editor', render_start)
        if insert_point > 0:
            # 找到这一行的结束
            line_end = content.find('\n', insert_point)
            # 在这一行后面添加初始化
            init_code = '''
    // 初始化工作流编辑器
    setTimeout(() => { if (typeof WorkflowEditor !== 'undefined') WorkflowEditor.init('workflow-editor-container'); }, 100);
'''
            content = content[:line_end+1] + init_code + content[line_end+1:]
            print('✅ WorkflowEditor.init已添加到renderSubPage')
        else:
            print('⚠️ 未在renderSubPage中找到page-workflow-editor')
    else:
        print('⚠️ WorkflowEditor.init已存在')
else:
    print('❌ 未找到renderSubPage函数')

with open(FILEPATH, 'w', encoding='utf-8') as f:
    f.write(content)

print('\n✅ index.html修改完成')
