#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys, re
sys.stdout.reconfigure(encoding='utf-8')

FILEPATH = r'C:\DouBaoXO\OneOS-V1\unisci\index.html'

with open(FILEPATH, 'r', encoding='utf-8') as f:
    content = f.read()

# 搜索所有page-
pages = re.findall(r'id="(page-[^"]+)"', content)
print('所有页面:', pages)
print()

# 检查是否有page-experiments页面（不是导航入口）
exp_page = re.search(r'<div[^>]*id="page-experiments"[^>]*class="sub-page"', content)
print('有page-experiments子页面:', bool(exp_page))

# 检查renderSubPage中是否有page-experiments
render_exp = 'page-experiments' in content and 'renderSubPage' in content
print('renderSubPage中有page-experiments处理:', render_exp)
