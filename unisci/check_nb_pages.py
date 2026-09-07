#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

FILEPATH = r'C:\DouBaoXO\OneOS-V1\unisci\index.html'

with open(FILEPATH, 'r', encoding='utf-8') as f:
    content = f.read()

# 检查notebook相关页面
for page in ['page-notebook-list', 'page-notebook-detail']:
    idx = content.find('id="' + page + '"')
    if idx >= 0:
        start = max(0, idx - 20)
        end = min(len(content), idx + 400)
        print(f'=== {page} ===')
        print(content[start:end])
        print()
    else:
        print(f'{page}: 未找到')
        print()

# 检查renderSubPage中的notebook处理
import re
matches = list(re.finditer(r"notebook", content, re.IGNORECASE))
print(f'notebook出现次数: {len(matches)}')
for m in matches[:5]:
    start = max(0, m.start() - 30)
    end = min(len(content), m.end() + 100)
    print(f'  位置{m.start()}: ...{content[start:end]}...')
    print()
