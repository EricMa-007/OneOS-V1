#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys, os, re
sys.stdout.reconfigure(encoding='utf-8')

wf_path = r'C:\DouBaoXO\OneOS-V1\unisci\workflow.js'
if os.path.exists(wf_path):
    size = os.path.getsize(wf_path)
    with open(wf_path, 'r', encoding='utf-8') as f:
        content = f.read()
    has_canvas = 'canvas' in content.lower() or 'svg' in content.lower()
    has_drag = 'drag' in content.lower() or 'draggable' in content.lower()
    has_node_config = 'config' in content.lower() and 'panel' in content.lower()
    has_execution = 'execute' in content.lower() or 'run' in content.lower()
    has_nodes = 'WorkflowNodes' in content or 'nodes' in content.lower()
    lines = content.split('\n')
    objects = re.findall(r'const (\w+) = \{', content)
    print(f'workflow.js 大小: {size} bytes ({size/1024:.1f}KB)')
    print(f'总行数: {len(lines)}')
    print(f'有画布(canvas/svg): {has_canvas}')
    print(f'有拖拽: {has_drag}')
    print(f'有节点配置面板: {has_node_config}')
    print(f'有执行引擎: {has_execution}')
    print(f'有节点定义: {has_nodes}')
    print(f'定义的对象: {objects}')
else:
    print('workflow.js不存在')

# 检查workflow-canvas.js
wc_path = r'C:\DouBaoXO\OneOS-V1\unisci\workflow-canvas.js'
if os.path.exists(wc_path):
    size = os.path.getsize(wc_path)
    print(f'\nworkflow-canvas.js 存在: {size} bytes')
else:
    print('\nworkflow-canvas.js 不存在')
