#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys, re
sys.stdout.reconfigure(encoding='utf-8')

FILEPATH = r'C:\DouBaoXO\OneOS-V1\unisci\index.html'

with open(FILEPATH, 'r', encoding='utf-8') as f:
    content = f.read()

# 找到page-experiments页面
idx = content.find('id="page-experiments"')
if idx >= 0:
    # 找到页面开始
    start = content.rfind('<div', 0, idx)
    # 找到页面结束（下一个page-或</div>）
    end_match = re.search(r'<div[^>]*id="page-[^"]+"', content[idx+20:])
    if end_match:
        end = idx + 20 + end_match.start()
    else:
        end = idx + 2000
    print('page-experiments内容:')
    print(content[start:end][:1500])
else:
    print('未找到page-experiments')
