#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""修复所有JS文件中Storage.get/set/remove/clear -> Storage.local.xxx"""

import sys, re, os
sys.stdout.reconfigure(encoding='utf-8')

JS_DIR = r'C:\DouBaoXO\OneOS-V1\unisci'

# 需要修复的文件
files_to_fix = ['user.js', 'compute.js', 'notebook.js', 'workflow.js', 'molecule.js', 
                 'materials.js', 'enhancements.js', 'knowledge-graph-dynamic.js',
                 'feature-closures.js', 'performance-optimizer.js', 'app-state.js',
                 'data-sync.js', 'api-integration.js', 'workflow-canvas.js']

total_fixes = 0

for fname in files_to_fix:
    fpath = os.path.join(JS_DIR, fname)
    if not os.path.exists(fpath):
        continue
    
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    fix_count = 0
    
    # 替换 Storage.get -> Storage.local.get (但不替换 Storage.local.get 或 Storage.session.get)
    # 使用负向回顾断言
    content = re.sub(r'(?<!\.)Storage\.(get|set|remove|clear)\(', r'Storage.local.\1(', content)
    
    if content != original:
        fix_count = original.count('Storage.get(') + original.count('Storage.set(') + original.count('Storage.remove(') + original.count('Storage.clear(')
        # 减去已经是 Storage.local.xxx 或 Storage.session.xxx 的
        fix_count -= original.count('Storage.local.get(') + original.count('Storage.local.set(') + original.count('Storage.local.remove(') + original.count('Storage.local.clear(')
        fix_count -= original.count('Storage.session.get(') + original.count('Storage.session.set(')
        
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ {fname}: 修复 {fix_count} 处")
        total_fixes += fix_count
    else:
        print(f"  {fname}: 无需修复")

print(f"\n总计修复: {total_fixes} 处")

# 验证user.js语法
import subprocess
result = subprocess.run(['node', '--check', os.path.join(JS_DIR, 'user.js')], capture_output=True, text=True)
print(f"user.js语法检查: {'✅ 通过' if result.returncode == 0 else '❌ ' + result.stderr}")

result = subprocess.run(['node', '--check', os.path.join(JS_DIR, 'compute.js')], capture_output=True, text=True)
print(f"compute.js语法检查: {'✅ 通过' if result.returncode == 0 else '❌ ' + result.stderr}")
