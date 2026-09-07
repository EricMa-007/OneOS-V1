#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

FILEPATH = r'C:\DouBaoXO\OneOS-V1\unisci\index.html'

with open(FILEPATH, 'r', encoding='utf-8') as f:
    content = f.read()

if 'labs.js' not in content:
    content = content.replace(
        '<script src="terminology.js',
        '<script src="labs.js?v=20260827_1720"></script>\n<script src="terminology.js'
    )
    with open(FILEPATH, 'w', encoding='utf-8') as f:
        f.write(content)
    print('✅ labs.js已引入到index.html')
else:
    print('⚠️ labs.js已存在')

with open(FILEPATH, 'r', encoding='utf-8') as f:
    verify = f.read()
print('labs.js在文件中:', 'labs.js' in verify)
