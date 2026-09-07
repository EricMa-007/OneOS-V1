#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

FILEPATH = r'C:\DouBaoXO\OneOS-V1\unisci\index.html'

with open(FILEPATH, 'r', encoding='utf-8') as f:
    content = f.read()

# 替换所有 MaterialDetailRenderer.currentMaterialId 为 MaterialDetailRenderer.currentMaterial?.id
count = content.count('MaterialDetailRenderer.currentMaterialId')
content = content.replace('MaterialDetailRenderer.currentMaterialId', 'MaterialDetailRenderer.currentMaterial?.id')
print(f'✅ 替换了 {count} 处 currentMaterialId')

with open(FILEPATH, 'w', encoding='utf-8') as f:
    f.write(content)

print('✅ 修复完成')
