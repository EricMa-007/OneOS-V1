#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys, re
sys.stdout.reconfigure(encoding='utf-8')

FILEPATH = r'C:\DouBaoXO\OneOS-V1\unisci\materials.js'

with open(FILEPATH, 'r', encoding='utf-8') as f:
    content = f.read()

# 统计材料数量
materials = re.findall(r"id:\s*['\"]([^'\"]+)['\"]", content)
print(f'材料数量: {len(materials)}')
print(f'材料ID: {materials[:20]}')
print(f'有晶格常数: {"lattice" in content.lower() or "crystal" in content.lower()}')
print(f'有能带数据: {"bandgap" in content.lower()}')
print(f'有力学数据: {"young" in content.lower() or "modulus" in content.lower()}')
print(f'有热学数据: {"thermal" in content.lower() or "melting" in content.lower()}')
print(f'有光学数据: {"optical" in content.lower() or "refractive" in content.lower()}')
