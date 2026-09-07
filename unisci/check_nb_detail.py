#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys, re
sys.stdout.reconfigure(encoding='utf-8')

FILEPATH = r'C:\DouBaoXO\OneOS-V1\unisci\index.html'

with open(FILEPATH, 'r', encoding='utf-8') as f:
    content = f.read()

start_match = re.search(r'<div[^>]*id="page-notebook-detail"[^>]*>', content)
if start_match:
    start = start_match.start()
    end_match = re.search(r'<div[^>]*id="page-[^"]+"', content[start+20:])
    if end_match:
        end = start + 20 + end_match.start()
    else:
        end = start + 2000
    page_content = content[start:end]
    print('=== page-notebook-detail ===')
    print(page_content)
    print()
    print('notebook-cells存在:', 'id="notebook-cells"' in page_content)
    print('notebook-toolbar-detail存在:', 'id="notebook-toolbar-detail"' in page_content)
    print('notebook-toolbar存在:', 'id="notebook-toolbar"' in page_content)
    print('notebook-status存在:', 'notebook-status' in page_content)
else:
    print('未找到page-notebook-detail')
