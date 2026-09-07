#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

FILEPATH = r'C:\DouBaoXO\OneOS-V1\unisci\compute.js'

with open(FILEPATH, 'r', encoding='utf-8') as f:
    content = f.read()

if 'Terminology.enhanceTerms' not in content:
    old = "if (typeof renderIcons === 'function') renderIcons();"
    new = """if (typeof renderIcons === 'function') renderIcons();
    // 增强术语解释 - 第三纵队全民可及
    if (typeof Terminology !== 'undefined') {
      const jtc = document.getElementById('job-tab-content');
      if (jtc) Terminology.enhanceTerms(jtc);
    }"""
    content = content.replace(old, new, 1)
    with open(FILEPATH, 'w', encoding='utf-8') as f:
        f.write(content)
    print('✅ 术语增强已添加到compute.js')
else:
    print('⚠️ 术语增强已存在')
