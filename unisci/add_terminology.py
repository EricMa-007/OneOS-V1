#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

FILEPATH = r'C:\DouBaoXO\OneOS-V1\unisci\index.html'

with open(FILEPATH, 'r', encoding='utf-8') as f:
    content = f.read()

if 'terminology.js' not in content:
    # 在core.js之前插入terminology.js
    content = content.replace(
        '<script src="core.js',
        '<script src="terminology.js?v=20260827_1720"></script>\n<script src="core.js'
    )
    with open(FILEPATH, 'w', encoding='utf-8') as f:
        f.write(content)
    print('✅ terminology.js已引入到index.html')
else:
    print('⚠️ terminology.js已存在')

# 验证
with open(FILEPATH, 'r', encoding='utf-8') as f:
    verify = f.read()
print('terminology.js在文件中:', 'terminology.js' in verify)
