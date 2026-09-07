#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

FILEPATH = r'C:\DouBaoXO\OneOS-V1\unisci\compute.js'

with open(FILEPATH, 'r', encoding='utf-8') as f:
    content = f.read()

# 检查是否已经有renderLearningRecommendations
if 'renderLearningRecommendations' in content:
    print("⚠️ renderLearningRecommendations已存在，跳过")
    sys.exit(0)

# 找到下载文件注释的位置
marker = '// 下载文件（真实功能 - 生成模拟内容下载）'
idx = content.find(marker)
if idx < 0:
    print('❌ 未找到marker')
    sys.exit(1)

# 从idx往前找'},'
end_idx = content.rfind('},', 0, idx)
if end_idx < 0:
    print('❌ 未找到结束括号')
    sys.exit(1)

insert_pos = end_idx + 2

# 方法代码 - 用简单的字符串拼接避免转义问题
method_lines = [
    '',
    '    // 渲染学习推荐内容',
    '    this.renderLearningRecommendations(job, r);',
    '  },',
    '',
    '  // 渲染学习推荐 - 第二纵队',
    '  renderLearningRecommendations(job, r) {',
    '    const bg = parseFloat(r.bandgap) || 0;',
    "    const jobType = job.type || 'DFT';",
    "    const title = job.title || '';",
    '    const courseLib = [',
    "      { id: 'c001', title: '密度泛函理论进阶', icon: 'atom', match: ['DFT','VASP','能带'] },",
    "      { id: 'c002', title: '第一性原理计算实战', icon: 'flask-conical', match: ['DFT','VASP','结构优化'] },",
    "      { id: 'c003', title: '拓扑绝缘体导论', icon: 'magnet', match: ['拓扑','能带'] },",
    "      { id: 'c010', title: '分子动力学模拟入门', icon: 'dna', match: ['MD','GROMACS'] }",
    '    ];',
    '    const articleLib = [',
    "      { id: 'a001', title: 'MoS₂莫尔超晶格中的平带与强关联效应', tag: '拓扑材料', match: ['MoS₂','二维','能带'] },",
    "      { id: 'a002', title: 'VASP计算中k点网格收敛性的系统研究', tag: '计算方法', match: ['VASP','k点','收敛'] },",
    "      { id: 'a004', title: '石墨烯纳米带的能带工程与输运性质', tag: '低维材料', match: ['石墨烯','纳米带'] }",
    '    ];',
    '    const nodeLib = {',
    "      semiconductor: ['半导体物理','能带理论','费米能级','载流子浓度','光电器件'],",
    "      metal: ['金属键','自由电子气','费米面','电导率','超导'],",
    "      dft: ['密度泛函理论','Kohn-Sham方程','交换关联泛函','赝势','自洽场迭代'],",
    "      md: ['分子动力学','势函数','系综','采样方法','自由能计算']",
    '    };',
    '    const matchedCourses = courseLib.filter(c => c.match.some(k => title.includes(k) || jobType.includes(k))).slice(0,2);',
    '    if (matchedCourses.length === 0) matchedCourses.push(courseLib[0], courseLib[1]);',
    '    const matchedArticles = articleLib.filter(a => a.match.some(k => title.includes(k) || jobType.includes(k))).slice(0,2);',
    '    if (matchedArticles.length === 0) matchedArticles.push(articleLib[0], articleLib[1]);',
    "    let nodeKey = 'dft';",
    "    if (jobType.includes('MD')) nodeKey = 'md';",
    '    else if (bg === 0) nodeKey = \'metal\';',
    '    else if (bg > 0) nodeKey = \'semiconductor\';',
    '    const nodes = nodeLib[nodeKey] || nodeLib[\'dft\'];',
    '',
    "    const cc = document.getElementById('recommended-courses');",
    '    if (cc) {',
    "      cc.innerHTML = matchedCourses.map(c => '<div onclick=\"navigateTo(' + \"'\" + 'page-courses' + \"'\" + ')\" style=\"display:flex;align-items:center;gap:10px;padding:10px 12px;background:#fff;border-radius:10px;cursor:pointer;border:1px solid #fde68a\"><div style=\"width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#3b82f6,#2563eb);display:flex;align-items:center;justify-content:center;flex-shrink:0\"><i data-lucide=\"' + c.icon + '\" class=\"lucide icon-white\" style=\"width:16px;height:16px\"></i></div><div style=\"flex:1;min-width:0\"><div style=\"font-size:13px;font-weight:600;color:#1f2937;white-space:nowrap;overflow:hidden;text-overflow:ellipsis\">' + c.title + '</div><div style=\"font-size:11px;color:#92400e;margin-top:2px\">点击继续学习 →</div></div></div>').join('');",
    '    }',
    '',
    "    const ac = document.getElementById('recommended-articles');",
    '    if (ac) {',
    "      ac.innerHTML = matchedArticles.map(a => '<div onclick=\"navigateTo(' + \"'\" + 'page-article-detail' + \"'\" + ',' + \"'\" + a.id + \"'\" + ')\" style=\"display:flex;align-items:center;gap:10px;padding:10px 12px;background:#fff;border-radius:10px;cursor:pointer;border:1px solid #fde68a\"><div style=\"width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#f59e0b,#d97706);display:flex;align-items:center;justify-content:center;flex-shrink:0\"><i data-lucide=\"file-text\" class=\"lucide icon-white\" style=\"width:16px;height:16px\"></i></div><div style=\"flex:1;min-width:0\"><div style=\"font-size:13px;font-weight:600;color:#1f2937;white-space:nowrap;overflow:hidden;text-overflow:ellipsis\">' + a.title + '</div><div style=\"font-size:11px;color:#92400e;margin-top:2px\">' + a.tag + ' · 点击阅读 →</div></div></div>').join('');",
    '    }',
    '',
    "    const nc = document.getElementById('knowledge-nodes');",
    '    if (nc) {',
    "      nc.innerHTML = nodes.map(n => '<span onclick=\"navigateTo(' + \"'\" + 'page-knowledge-graph' + \"'\" + ')\" style=\"padding:5px 10px;background:#fff;border:1px solid #fde68a;border-radius:12px;font-size:11px;color:#92400e;cursor:pointer;font-weight:500\">' + n + '</span>').join('');",
    '    }',
    '',
    "    if (typeof renderIcons === 'function') renderIcons();",
    '  },',
]

method_code = '\n'.join(method_lines)

new_content = content[:insert_pos] + method_code + content[insert_pos:]

with open(FILEPATH, 'w', encoding='utf-8') as f:
    f.write(new_content)

print('✅ 方法已插入，文件大小:', len(new_content))
