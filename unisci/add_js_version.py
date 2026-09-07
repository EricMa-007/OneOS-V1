#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""给index.html中所有本地JS文件添加版本参数，强制浏览器刷新"""

import sys, re
sys.stdout.reconfigure(encoding='utf-8')

FILEPATH = r'C:\DouBaoXO\OneOS-V1\unisci\index.html'
VERSION = '20260827_1710'

with open(FILEPATH, 'r', encoding='utf-8') as f:
    content = f.read()

# 匹配本地JS文件（不是外部CDN）
# 格式: <script src="xxx.js"></script> 或 <script src="xxx.js?v=..."></script>
def add_version(match):
    src = match.group(1)
    # 跳过外部CDN
    if src.startswith('http') and '127.0.0.1' not in src and 'localhost' not in src:
        return match.group(0)
    # 移除已有版本参数
    src = re.sub(r'\?v=.*$', '', src)
    # 添加新版本参数
    return f'<script src="{src}?v={VERSION}"></script>'

# 匹配 <script src="..."></script>
pattern = r'<script\s+src="([^"]+)"\s*>\s*</script>'
new_content, count = re.subn(pattern, add_version, content)

with open(FILEPATH, 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"✅ 已给 {count} 个JS文件添加版本参数 ?v={VERSION}")

# 验证
with open(FILEPATH, 'r', encoding='utf-8') as f:
    verify = f.read()
js_with_version = verify.count(f'?v={VERSION}')
print(f"验证: 文件中有 {js_with_version} 处版本参数")
