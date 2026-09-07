#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys, re
sys.stdout.reconfigure(encoding='utf-8')

FILEPATH = r'C:\DouBaoXO\OneOS-V1\unisci\index.html'

with open(FILEPATH, 'r', encoding='utf-8') as f:
    content = f.read()

# 找到page-notebook-list页面
start_match = re.search(r'<div[^>]*id="page-notebook-list"[^>]*>', content)
if start_match:
    start = start_match.start()
    end_match = re.search(r'<div[^>]*id="page-[^"]+"', content[start+20:])
    if end_match:
        end = start + 20 + end_match.start()
    else:
        end = start + 2000
    page_content = content[start:end]
    print('=== page-notebook-list 完整内容 ===')
    print(page_content)
    print()
    
    # 检查关键容器
    print('notebook-list-content存在:', 'notebook-list-content' in page_content)
    print('notebook-list存在:', 'id="notebook-list"' in page_content)
    print('notebook-tabs存在:', 'notebook-tabs' in page_content)
    print('notebook-toolbar存在:', 'notebook-toolbar' in page_content)
else:
    print('未找到page-notebook-list')
