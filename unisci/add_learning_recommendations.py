#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""第二纵队：计算即学习 - 在结果页添加课程推荐/文章推荐/知识图谱节点"""

import sys
sys.stdout.reconfigure(encoding='utf-8')

FILEPATH = r'C:\DouBaoXO\OneOS-V1\unisci\compute.js'

with open(FILEPATH, 'r', encoding='utf-8') as f:
    content = f.read()

# 在renderResults方法中，AI解释卡片之后、关键结果卡片之前添加学习推荐区域
# 找到关键结果卡片的开头
old_key_results = """      <div class="card" style="background:linear-gradient(135deg,#f0f7ff,#e8f0f8);margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div class="card-title" style="margin:0"><i data-lucide="bar-chart-3" class="lucide" style="width:16px;height:16px;color"""

# 学习推荐区域HTML
learning_section = """      <!-- 📚 学习推荐区域 - 第二纵队：计算即学习 -->
      <div class="card" style="margin-bottom:16px;padding:16px;background:linear-gradient(135deg,#fefce8,#fef9c3);border:1px solid #fde68a;border-radius:16px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
          <div style="width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,#f59e0b,#d97706);display:flex;align-items:center;justify-content:center">
            <i data-lucide="graduation-cap" class="lucide icon-white" style="width:16px;height:16px"></i>
          </div>
          <div style="font-size:14px;font-weight:700;color:#92400e">基于本次计算，为你推荐</div>
        </div>
        
        <!-- 推荐课程 -->
        <div style="margin-bottom:14px">
          <div style="font-size:12px;font-weight:600;color:#a16207;margin-bottom:8px">📖 相关课程</div>
          <div id="recommended-courses" style="display:flex;flex-direction:column;gap:8px"></div>
        </div>
        
        <!-- 推荐文章 -->
        <div style="margin-bottom:14px">
          <div style="font-size:12px;font-weight:600;color:#a16207;margin-bottom:8px">📝 相关文章</div>
          <div id="recommended-articles" style="display:flex;flex-direction:column;gap:8px"></div>
        </div>
        
        <!-- 知识图谱节点 -->
        <div>
          <div style="font-size:12px;font-weight:600;color:#a16207;margin-bottom:8px">🕸️ 知识图谱关联</div>
          <div id="knowledge-nodes" style="display:flex;flex-wrap:wrap;gap:6px"></div>
        </div>
      </div>

      <div class="card" style="background:linear-gradient(135deg,#f0f7ff,#e8f0f8);margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div class="card-title" style="margin:0"><i data-lucide="bar-chart-3" class="lucide" style="width:16px;height:16px;color"""

if old_key_results in content:
    content = content.replace(old_key_results, learning_section, 1)
    print("✅ 1. 学习推荐区域已添加")
else:
    print("❌ 1. 未找到关键结果卡片的匹配字符串")
    # 调试
    idx = content.find('background:linear-gradient(135deg,#f0f7ff')
    if idx >= 0:
        print("附近内容:", content[idx:idx+200])

# 2. 在renderResults方法末尾，添加渲染推荐内容的JS代码
# 找到renderResults方法的结束位置（content.innerHTML = `...`; 之后）
old_render_end = """    `;
  },


  // 下载文件（真实功能 - 生成模拟内容下载）"""

new_render_end = """    \`;
    
    // 渲染学习推荐内容
    this.renderLearningRecommendations(job, r);
  },

  // 渲染学习推荐 - 第二纵队
  renderLearningRecommendations(job, r) {
    const bg = parseFloat(r.bandgap) || 0;
    const jobType = job.type || 'DFT';
    const software = job.software || 'VASP';
    const title = job.title || '';
    
    // 课程推荐库
    const courseLib = [
      { id: 'c001', title: '密度泛函理论进阶', icon: 'atom', color: 'blue', match: ['DFT', 'VASP', '能带', '态密度'] },
      { id: 'c002', title: '第一性原理计算实战', icon: 'flask-conical', color: 'green', match: ['DFT', 'VASP', '结构优化', '自洽'] },
      { id: 'c003', title: '拓扑绝缘体导论', icon: 'magnet', color: 'purple', match: ['拓扑', '能带', '表面态'] },
      { id: 'c010', title: '分子动力学模拟入门', icon: 'dna', color: 'green', match: ['MD', 'GROMACS', 'LAMMPS', '分子动力学'] },
      { id: 'c020', title: '量子力学奇妙之旅', icon: 'orbit', color: 'blue', match: ['量子', 'DFT', '电子结构'] },
      { id: 'c023', title: '材料科学基础', icon: 'flask-conical', color: 'orange', match: ['材料', '晶体', '能带', '半导体'] }
    ];
    
    // 文章推荐库
    const articleLib = [
      { id: 'a001', title: 'MoS₂莫尔超晶格中的平带与强关联效应', tag: '拓扑材料', match: ['MoS₂', '二维', '能带', '莫尔'] },
      { id: 'a002', title: 'VASP计算中k点网格收敛性的系统研究', tag: '计算方法', match: ['VASP', 'k点', '收敛', 'DFT'] },
      { id: 'a003', title: '二维铁电材料In₂Se₃的极化翻转机制', tag: '铁电材料', match: ['二维', '铁电', '极化'] },
      { id: 'a004', title: '石墨烯纳米带的能带工程与输运性质', tag: '低维材料', match: ['石墨烯', '纳米带', '输运', '能带'] },
      { id: 'a005', title: '水分子的氢键网络与相变机制', tag: '计算化学', match: ['水', '分子', '氢键', 'MD'] }
    ];
    
    // 知识图谱节点库
    const nodeLib = {
      'semiconductor': ['半导体物理', '能带理论', '费米能级', '载流子浓度', 'p-n结', '光电器件'],
      'metal': ['金属键', '自由电子气', '费米面', '电导率', '超导', '等离子体'],
      'insulator': ['禁带宽度', '介电常数', '击穿电压', '铁电体', '压电效应'],
      '2d': ['二维材料', '范德华异质结', '莫尔超晶格', '量子限制效应', '表面态'],
      'dft': ['密度泛函理论', 'Kohn-Sham方程', '交换关联泛函', '赝势', '平面波基组', '自洽场迭代'],
      'md': ['分子动力学', '牛顿运动方程', '势函数', '系综', '采样方法', '自由能计算']
    };
    
    // 匹配课程
    const matchedCourses = courseLib.filter(c => 
      c.match.some(k => title.includes(k) || jobType.includes(k) || software.includes(k))
    ).slice(0, 2);
    if (matchedCourses.length === 0) matchedCourses.push(courseLib[0], courseLib[1]);
    
    // 匹配文章
    const matchedArticles = articleLib.filter(a =>
      a.match.some(k => title.includes(k) || jobType.includes(k))
    ).slice(0, 2);
    if (matchedArticles.length === 0) matchedArticles.push(articleLib[0], articleLib[1]);
    
    // 匹配知识节点
    let nodeKey = 'dft';
    if (jobType.includes('MD')) nodeKey = 'md';
    else if (title.includes('MoS₂') || title.includes('石墨烯') || title.includes('二维')) nodeKey = '2d';
    else if (bg === 0) nodeKey = 'metal';
    else if (bg > 4) nodeKey = 'insulator';
    else if (bg > 0) nodeKey = 'semiconductor';
    const nodes = nodeLib[nodeKey] || nodeLib['dft'];
    
    // 渲染课程
    const courseContainer = document.getElementById('recommended-courses');
    if (courseContainer) {
      courseContainer.innerHTML = matchedCourses.map(c => \`
        <div onclick="navigateTo('page-courses')" style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:#fff;border-radius:10px;cursor:pointer;border:1px solid #fde68a">
          <div style="width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,var(--\${c.color}),var(--\${c.color}2));display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <i data-lucide="\${c.icon}" class="lucide icon-white" style="width:16px;height:16px"></i>
          </div>
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:600;color:#1f2937;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">\${c.title}</div>
            <div style="font-size:11px;color:#92400e;margin-top:2px">点击继续学习 →</div>
          </div>
        </div>
      \`).join('');
    }
    
    // 渲染文章
    const articleContainer = document.getElementById('recommended-articles');
    if (articleContainer) {
      articleContainer.innerHTML = matchedArticles.map(a => \`
        <div onclick="navigateTo('page-article-detail','\${a.id}')" style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:#fff;border-radius:10px;cursor:pointer;border:1px solid #fde68a">
          <div style="width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#f59e0b,#d97706);display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <i data-lucide="file-text" class="lucide icon-white" style="width:16px;height:16px"></i>
          </div>
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:600;color:#1f2937;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">\${a.title}</div>
            <div style="font-size:11px;color:#92400e;margin-top:2px">\${a.tag} · 点击阅读 →</div>
          </div>
        </div>
      \`).join('');
    }
    
    // 渲染知识图谱节点
    const nodeContainer = document.getElementById('knowledge-nodes');
    if (nodeContainer) {
      nodeContainer.innerHTML = nodes.map(n => \`
        <span onclick="navigateTo('page-knowledge-graph')" style="padding:5px 10px;background:#fff;border:1px solid #fde68a;border-radius:12px;font-size:11px;color:#92400e;cursor:pointer;font-weight:500">\${n}</span>
      \`).join('');
    }
    
    if (typeof renderIcons === 'function') renderIcons();
  },


  // 下载文件（真实功能 - 生成模拟内容下载）"""

if old_render_end in content:
    content = content.replace(old_render_end, new_render_end, 1)
    print("✅ 2. renderLearningRecommendations方法已添加")
else:
    print("❌ 2. 未找到renderResults结束位置")
    # 调试
    idx = content.find('下载文件（真实功能')
    if idx >= 0:
        print("附近内容:", content[max(0,idx-100):idx+100])

with open(FILEPATH, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"\n✅ 文件已保存，大小: {len(content)} 字符")
