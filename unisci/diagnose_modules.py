#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys, os
sys.stdout.reconfigure(encoding='utf-8')

def check_module(name, path, checks):
    if not os.path.exists(path):
        print(f'{name}: 文件不存在')
        return
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    print(f'=== {name} ===')
    print(f'大小: {len(content)} bytes ({len(content)/1024:.1f}KB)')
    print(f'行数: {len(content.splitlines())}')
    for k, v in checks.items():
        status = 'OK' if v else 'MISSING'
        print(f'  [{status}] {k}')
    print()

# Notebook检查
check_module('notebook.js', r'C:\DouBaoXO\OneOS-V1\unisci\notebook.js', {
    'NotebookManager': 'NotebookManager' in open(r'C:\DouBaoXO\OneOS-V1\unisci\notebook.js', encoding='utf-8').read(),
    'NotebookEditor': 'NotebookEditor' in open(r'C:\DouBaoXO\OneOS-V1\unisci\notebook.js', encoding='utf-8').read(),
    '单元格管理(addCell)': 'addCell' in open(r'C:\DouBaoXO\OneOS-V1\unisci\notebook.js', encoding='utf-8').read(),
    '代码运行(runCell)': 'runCell' in open(r'C:\DouBaoXO\OneOS-V1\unisci\notebook.js', encoding='utf-8').read(),
    '输出展示': 'output' in open(r'C:\DouBaoXO\OneOS-V1\unisci\notebook.js', encoding='utf-8').read().lower(),
    '变量查看器': 'variable' in open(r'C:\DouBaoXO\OneOS-V1\unisci\notebook.js', encoding='utf-8').read().lower(),
    'AI辅助': 'ai' in open(r'C:\DouBaoXO\OneOS-V1\unisci\notebook.js', encoding='utf-8').read().lower(),
    '版本管理': 'version' in open(r'C:\DouBaoXO\OneOS-V1\unisci\notebook.js', encoding='utf-8').read().lower(),
    '导出功能': 'export' in open(r'C:\DouBaoXO\OneOS-V1\unisci\notebook.js', encoding='utf-8').read().lower(),
    '内核定义': 'kernel' in open(r'C:\DouBaoXO\OneOS-V1\unisci\notebook.js', encoding='utf-8').read().lower(),
    '模板': 'template' in open(r'C:\DouBaoXO\OneOS-V1\unisci\notebook.js', encoding='utf-8').read().lower(),
})

# Materials检查
check_module('materials.js', r'C:\DouBaoXO\OneOS-V1\unisci\materials.js', {
    'MaterialsDB': 'MaterialsDB' in open(r'C:\DouBaoXO\OneOS-V1\unisci\materials.js', encoding='utf-8').read(),
    'MaterialManager': 'MaterialManager' in open(r'C:\DouBaoXO\OneOS-V1\unisci\materials.js', encoding='utf-8').read(),
    'MaterialListRenderer': 'MaterialListRenderer' in open(r'C:\DouBaoXO\OneOS-V1\unisci\materials.js', encoding='utf-8').read(),
    'MaterialDetailRenderer': 'MaterialDetailRenderer' in open(r'C:\DouBaoXO\OneOS-V1\unisci\materials.js', encoding='utf-8').read(),
    '搜索功能': 'search' in open(r'C:\DouBaoXO\OneOS-V1\unisci\materials.js', encoding='utf-8').read().lower(),
    '筛选功能': 'filter' in open(r'C:\DouBaoXO\OneOS-V1\unisci\materials.js', encoding='utf-8').read().lower(),
    '收藏功能': 'favorite' in open(r'C:\DouBaoXO\OneOS-V1\unisci\materials.js', encoding='utf-8').read().lower(),
    '对比功能': 'compare' in open(r'C:\DouBaoXO\OneOS-V1\unisci\materials.js', encoding='utf-8').read().lower(),
    '导出功能': 'export' in open(r'C:\DouBaoXO\OneOS-V1\unisci\materials.js', encoding='utf-8').read().lower(),
    '分类': 'categor' in open(r'C:\DouBaoXO\OneOS-V1\unisci\materials.js', encoding='utf-8').read().lower(),
    '性质Tab(电子/力学)': 'electronic' in open(r'C:\DouBaoXO\OneOS-V1\unisci\materials.js', encoding='utf-8').read().lower() or 'mechanical' in open(r'C:\DouBaoXO\OneOS-V1\unisci\materials.js', encoding='utf-8').read().lower(),
})
