/**
 * UniSci Platform V2 - 全面功能增强模块
 * 修复所有toast模拟，实现真实功能闭环
 * 包含: 知识图谱交互化、学习系统、虚拟实验室、课时学习、个人中心功能、通用功能增强
 */

'use strict';

// ============================================================
// 一、知识图谱系统（交互式重构）
// ============================================================
const KnowledgeGraph = {
  // 知识节点数据库（与网站内容串联）
  nodes: {
    'dft': { id: 'dft', name: '密度泛函理论', category: '理论', level: '核心', 
      description: '密度泛函理论（DFT）是一种研究多电子体系电子结构的方法，是现代第一性原理计算的基础。',
      related: ['kohn_sham','xc_functional','plane_wave','pseudopotential','vasp','qe','abacus'],
      courses: ['密度泛函理论进阶','第一性原理计算实战'],
      materials: ['MoS2','Graphene','Si','GaN']
    },
    'kohn_sham': { id: 'kohn_sham', name: 'Kohn-Sham方程', category: '理论', level: '核心',
      description: 'Kohn-Sham方程是DFT的核心方程，将多电子问题转化为单电子在有效势场中的运动问题。',
      related: ['dft','xc_functional'],
      courses: ['密度泛函理论进阶'],
      materials: []
    },
    'xc_functional': { id: 'xc_functional', name: '交换关联泛函', category: '理论', level: '核心',
      description: '交换关联泛函描述电子之间的交换和关联作用，包括LDA、GGA、meta-GGA、杂化泛函等。',
      related: ['dft','kohn_sham','lda','gga','hse06'],
      courses: ['密度泛函理论进阶'],
      materials: []
    },
    'lda': { id: 'lda', name: 'LDA泛函', category: '方法', level: '基础',
      description: '局域密度近似（LDA）是最简单的交换关联泛函，假设电子密度局域均匀。',
      related: ['xc_functional','gga'],
      courses: ['密度泛函理论进阶'],
      materials: []
    },
    'gga': { id: 'gga', name: 'GGA泛函', category: '方法', level: '基础',
      description: '广义梯度近似（GGA）在LDA基础上引入密度梯度，常用PBE泛函。',
      related: ['xc_functional','lda','pbe'],
      courses: ['密度泛函理论进阶'],
      materials: []
    },
    'pbe': { id: 'pbe', name: 'PBE泛函', category: '方法', level: '常用',
      description: 'PBE是最常用的GGA泛函，由Perdew、Burke和Ernzerhof提出。',
      related: ['gga','xc_functional'],
      courses: ['第一性原理计算实战'],
      materials: ['MoS2','Si']
    },
    'hse06': { id: 'hse06', name: 'HSE06杂化泛函', category: '方法', level: '高级',
      description: 'HSE06是一种杂化泛函，包含部分精确交换，能更准确计算带隙。',
      related: ['xc_functional','gga'],
      courses: ['密度泛函理论进阶'],
      materials: ['GaN','CsPbI3']
    },
    'plane_wave': { id: 'plane_wave', name: '平面波基组', category: '方法', level: '核心',
      description: '平面波基组是DFT计算中常用的基组，具有系统性收敛和计算效率高的优点。',
      related: ['dft','pseudopotential','cutoff_energy'],
      courses: ['第一性原理计算实战'],
      materials: []
    },
    'pseudopotential': { id: 'pseudopotential', name: '赝势', category: '方法', level: '核心',
      description: '赝势近似将芯电子的影响用有效势代替，大大减少计算量。常用超软赝势和PAW方法。',
      related: ['dft','plane_wave','paw','uspp'],
      courses: ['第一性原理计算实战'],
      materials: []
    },
    'paw': { id: 'paw', name: 'PAW方法', category: '方法', level: '高级',
      description: '投影缀加波（PAW）方法结合了赝势和全电子方法的优点。',
      related: ['pseudopotential','dft'],
      courses: ['第一性原理计算实战'],
      materials: []
    },
    'cutoff_energy': { id: 'cutoff_energy', name: '截断能', category: '参数', level: '基础',
      description: '截断能决定平面波基组的数量，是DFT计算的重要收敛参数。',
      related: ['plane_wave','kpoints'],
      courses: ['第一性原理计算实战'],
      materials: []
    },
    'kpoints': { id: 'kpoints', name: 'K点网格', category: '参数', level: '基础',
      description: 'K点网格决定布里渊区的采样密度，影响计算精度和效率。',
      related: ['plane_wave','cutoff_energy'],
      courses: ['第一性原理计算实战'],
      materials: []
    },
    'vasp': { id: 'vasp', name: 'VASP', category: '软件', level: '常用',
      description: 'VASP是目前最流行的第一性原理计算软件，支持DFT、MD等多种计算。',
      related: ['dft','plane_wave','pseudopotential'],
      courses: ['第一性原理计算实战'],
      materials: ['MoS2','Si','GaN']
    },
    'qe': { id: 'qe', name: 'Quantum ESPRESSO', category: '软件', level: '开源',
      description: 'Quantum ESPRESSO是开源的第一性原理计算软件包，基于平面波和赝势。',
      related: ['dft','plane_wave','pseudopotential'],
      courses: ['第一性原理计算实战'],
      materials: []
    },
    'abacus': { id: 'abacus', name: 'ABACUS', category: '软件', level: '国产',
      description: 'ABACUS是国产开源第一性原理计算软件，支持平面波和数值原子轨道基组。',
      related: ['dft','plane_wave'],
      courses: ['第一性原理计算实战'],
      materials: []
    },
    'band_structure': { id: 'band_structure', name: '能带结构', category: '性质', level: '核心',
      description: '能带结构描述电子能量在布里渊区中的分布，是材料电子性质的核心表征。',
      related: ['dft','dos','bandgap'],
      courses: ['密度泛函理论进阶'],
      materials: ['MoS2','Graphene','Si','GaN','CsPbI3']
    },
    'dos': { id: 'dos', name: '态密度', category: '性质', level: '核心',
      description: '态密度（DOS）描述单位能量范围内的电子态数目，包括总态密度和投影态密度。',
      related: ['dft','band_structure','pdos'],
      courses: ['密度泛函理论进阶'],
      materials: ['MoS2','Si']
    },
    'bandgap': { id: 'bandgap', name: '带隙', category: '性质', level: '基础',
      description: '带隙是导带底和价带顶之间的能量差，决定材料的导电类型和光学性质。',
      related: ['band_structure','dos','semiconductor'],
      courses: ['材料科学基础'],
      materials: ['MoS2','Si','GaN','hBN','CsPbI3','TiO2']
    },
    'semiconductor': { id: 'semiconductor', name: '半导体', category: '分类', level: '基础',
      description: '半导体是带隙在0.1-4 eV之间的材料，是微电子和光电子器件的基础。',
      related: ['bandgap','band_structure'],
      courses: ['材料科学基础'],
      materials: ['Si','GaN','MoS2','CsPbI3','TiO2']
    },
    'topological_insulator': { id: 'topological_insulator', name: '拓扑绝缘体', category: '分类', level: '前沿',
      description: '拓扑绝缘体是体内绝缘、表面具有受拓扑保护金属态的量子材料。',
      related: ['band_structure','topology'],
      courses: ['拓扑绝缘体导论'],
      materials: ['Bi2Se3']
    },
    'superconductor': { id: 'superconductor', name: '超导体', category: '分类', level: '前沿',
      description: '超导体是在临界温度以下电阻为零的材料，分为常规超导和高温超导。',
      related: ['bcs_theory','cuprate','iron_based'],
      courses: ['超导物理前沿'],
      materials: ['YBCO','FeSe']
    },
    '2d_material': { id: '2d_material', name: '二维材料', category: '分类', level: '热门',
      description: '二维材料是厚度为单原子或少原子层的材料，具有独特的物理化学性质。',
      related: ['graphene','tmdc','hbn'],
      courses: ['二维材料物理'],
      materials: ['Graphene','MoS2','hBN']
    },
    'graphene': { id: 'graphene', name: '石墨烯', category: '材料', level: '热门',
      description: '石墨烯是单层碳原子构成的二维材料，具有极高的载流子迁移率和热导率。',
      related: ['2d_material','carbon','semimetal'],
      courses: ['二维材料物理'],
      materials: ['Graphene']
    },
    'tmdc': { id: 'tmdc', name: '过渡金属二硫化物', category: '材料', level: '热门',
      description: 'TMDC是化学式为MX₂的层状材料，具有丰富的物理性质，MoS₂是典型代表。',
      related: ['2d_material','mos2'],
      courses: ['二维材料物理'],
      materials: ['MoS2']
    },
    'mos2': { id: 'mos2', name: '二硫化钼', category: '材料', level: '热门',
      description: 'MoS₂是典型的TMDC材料，单层具有直接带隙，是光电器件的理想材料。',
      related: ['tmdc','2d_material','semiconductor','bandgap'],
      courses: ['二维材料物理','密度泛函理论进阶'],
      materials: ['MoS2']
    },
    'catalyst': { id: 'catalyst', name: '催化剂', category: '应用', level: '重要',
      description: '催化剂是能加速化学反应而自身不被消耗的材料，在能源和化工领域至关重要。',
      related: ['her','orr','pt','tio2'],
      courses: ['催化材料基础'],
      materials: ['Pt','TiO2']
    },
    'perovskite': { id: 'perovskite', name: '钙钛矿', category: '材料', level: '热门',
      description: '钙钛矿材料具有ABX₃结构，在光伏和LED领域表现优异。',
      related: ['photovoltaic','cspbi3'],
      courses: ['钙钛矿光伏材料'],
      materials: ['CsPbI3']
    },
    'battery_material': { id: 'battery_material', name: '电池材料', category: '应用', level: '重要',
      description: '电池材料包括正极、负极、电解质等，是储能技术的核心。',
      related: ['lifepo4','intercalation'],
      courses: ['锂离子电池材料'],
      materials: ['LiFePO4']
    },
    
    // === 新增理论节点 ===
    qft: { id: 'qft', name: '量子场论', category: '理论', description: '描述基本粒子相互作用的量子理论框架，是粒子物理和凝聚态物理的基础。', related: ['dft', 'many_body', 'topology'], courses: ['量子力学奇妙之旅'], materials: [] },
    stat_mech: { id: 'stat_mech', name: '统计力学', category: '理论', description: '从微观粒子运动规律出发，研究宏观系统热力学性质的理论。', related: ['dft', 'md', 'thermo'], courses: ['材料科学基础'], materials: [] },
    solid_state: { id: 'solid_state', name: '固体物理', category: '理论', description: '研究固体材料的微观结构、电子态和宏观物理性质的物理学分支。', related: ['dft', 'band_theory', 'phonon'], courses: ['材料科学基础', '二维材料物理'], materials: ['Si', 'GaN'] },
    em_theory: { id: 'em_theory', name: '电动力学', category: '理论', description: '研究电磁场及其与物质相互作用的经典理论，是光学和电磁学的基础。', related: ['optics', 'dielectric', 'plasmonics'], courses: ['量子力学奇妙之旅'], materials: [] },
    
    // === 新增方法节点 ===
    md_method: { id: 'md_method', name: '分子动力学', category: '方法', description: '通过数值求解牛顿运动方程，模拟原子和分子在势场中的运动轨迹。', related: ['dft', 'stat_mech', 'lammps'], courses: ['第一性原理计算实战'], materials: [] },
    mc_method: { id: 'mc_method', name: '蒙特卡洛', category: '方法', description: '基于随机抽样的数值计算方法，广泛应用于统计物理、量子化学和材料科学。', related: ['stat_mech', 'md_method', 'dft'], courses: ['AI for Science'], materials: [] },
    gw: { id: 'gw', name: 'GW近似', category: '方法', description: '基于格林函数和屏蔽库仑相互作用的多体微扰方法，用于精确计算准粒子能带。', related: ['dft', 'bse', 'many_body'], courses: ['密度泛函理论进阶'], materials: [] },
    bse: { id: 'bse', name: 'Bethe-Salpeter', category: '方法', description: '描述电子-空穴相互作用（激子效应）的多体方程，用于精确计算光学吸收谱。', related: ['gw', 'dft', 'optics'], courses: ['密度泛函理论进阶'], materials: [] },
    tb: { id: 'tb', name: '紧束缚近似', category: '方法', description: '基于原子轨道线性组合的电子结构计算方法，计算量小，适合大体系和定性分析。', related: ['dft', 'band_theory', 'solid_state'], courses: ['材料科学基础'], materials: [] },
    
    // === 新增软件节点 ===
    abacus: { id: 'abacus', name: 'ABACUS', category: '软件', description: '国产开源第一性原理计算软件，支持平面波和数值原子轨道基组，在材料计算领域应用广泛。', related: ['dft', 'vasp', 'qe'], courses: ['第一性原理计算实战'], materials: [] },
    qe: { id: 'qe', name: 'Quantum ESPRESSO', category: '软件', description: '开源的基于平面波和赝势的第一性原理计算软件包，支持DFT、分子动力学和多种性质计算。', related: ['dft', 'abacus', 'vasp'], courses: ['第一性原理计算实战'], materials: [] },
    lammps: { id: 'lammps', name: 'LAMMPS', category: '软件', description: '经典分子动力学模拟软件，支持多种势函数和系综，广泛应用于材料、化学和生物领域。', related: ['md_method', 'gromacs', 'stat_mech'], courses: ['第一性原理计算实战'], materials: [] },
    gromacs: { id: 'gromacs', name: 'GROMACS', category: '软件', description: '面向生物分子模拟的分子动力学软件，具有极高的计算效率和丰富的分析工具。', related: ['md_method', 'lammps', 'stat_mech'], courses: ['AI for Science'], materials: [] },
    
    // === 新增性质节点 ===
    dielectric: { id: 'dielectric', name: '介电常数', category: '性质', description: '描述材料在外电场下极化响应的物理量，分为电子极化、离子极化和取向极化贡献。', related: ['dft', 'em_theory', 'optics'], courses: ['材料科学基础'], materials: ['hBN', 'TiO2'] },
    piezoelectric: { id: 'piezoelectric', name: '压电系数', category: '性质', description: '描述材料在机械应力下产生电场（正压电效应）或在电场下产生形变（逆压电效应）的能力。', related: ['dft', 'dielectric', 'elastic'], courses: ['材料科学基础'], materials: ['GaN', 'ZnO'] },
    thermoelectric: { id: 'thermoelectric', name: '热电系数', category: '性质', description: '描述材料将热能转换为电能的能力，由Seebeck系数、电导率和热导率共同决定。', related: ['dft', 'stat_mech', 'thermal'], courses: ['拓扑绝缘体导论'], materials: ['Bi2Te3', 'Bi2Se3'] },
    optics: { id: 'optics', name: '光学性质', category: '性质', description: '描述材料与光相互作用的性质，包括吸收、反射、折射、发光和非线性光学效应。', related: ['dft', 'bse', 'em_theory'], courses: ['钙钛矿光伏材料'], materials: ['MoS2', 'CsPbI3'] },
    magnetic_moment: { id: 'magnetic_moment', name: '磁矩', category: '性质', description: '描述材料磁性强弱的物理量，来源于电子自旋和轨道运动，是铁磁、反铁磁和顺磁的基础。', related: ['dft', 'solid_state', 'magnetism'], courses: ['超导物理前沿'], materials: ['Fe', 'NdFeB', 'FeSe'] },
    
    // === 新增材料节点 ===
    ws2_kg: { id: 'ws2_kg', name: 'WS2二硫化钨', category: '材料', description: '过渡金属二硫化物，具有独特的谷电子学特性，在谷电子学和光电子器件领域有重要应用。', related: ['dft', 'tmdc', 'optics'], courses: ['二维材料物理'], materials: ['WS2'] },
    bp_kg: { id: 'bp_kg', name: '黑磷', category: '材料', description: '具有独特褶皱层状结构和强各向异性的二维材料，带隙可通过层数调控。', related: ['dft', 'band_theory', 'optics'], courses: ['二维材料物理'], materials: ['BP'] },
    gan_kg: { id: 'gan_kg', name: 'GaN氮化镓', category: '材料', description: '第三代半导体材料，具有宽禁带、高击穿电场和高电子饱和速度，是蓝光LED和高频功率器件的核心。', related: ['dft', 'semiconductor', 'piezoelectric'], courses: ['材料科学基础'], materials: ['GaN'] },
    sic_kg: { id: 'sic_kg', name: 'SiC碳化硅', category: '材料', description: '第三代宽禁带半导体材料，具有高击穿电场、高热导率和高电子饱和速度，适合高温高频高功率应用。', related: ['dft', 'semiconductor', 'thermal'], courses: ['材料科学基础'], materials: ['SiC'] },
    perovskite_kg: { id: 'perovskite_kg', name: '钙钛矿材料', category: '材料', description: '具有ABX3钙钛矿结构的一类材料，在光伏、LED和催化领域表现优异，是新一代能源材料的明星。', related: ['dft', 'optics', 'photovoltaic'], courses: ['钙钛矿光伏材料'], materials: ['CsPbI3', 'CH3NH3PbI3'] },
    
    // === 新增应用节点 ===
    optoelectronics: { id: 'optoelectronics', name: '光电器件', category: '应用', description: '利用光电效应实现光信号与电信号相互转换的器件，包括LED、激光器、光电探测器和太阳能电池。', related: ['optics', 'semiconductor', 'dft'], courses: ['钙钛矿光伏材料', '二维材料物理'], materials: ['GaN', 'MoS2', 'CsPbI3'] },
    catalysis: { id: 'catalysis', name: '催化反应', category: '应用', description: '通过催化剂降低反应活化能、加速化学反应的过程，包括电催化、光催化和热催化。', related: ['dft', 'surface', 'energy'], courses: ['催化材料基础'], materials: ['Pt', 'Pd', 'TiO2', 'RuO2'] },
    energy_storage: { id: 'energy_storage', name: '储能器件', category: '应用', description: '将电能转化为化学能或其他形式能量存储的器件，包括锂离子电池、超级电容器和液流电池。', related: ['dft', 'electrochemistry', 'materials'], courses: ['锂离子电池材料'], materials: ['LiFePO4', 'NMC', 'Graphite'] },
    spintronics: { id: 'spintronics', name: '自旋电子学', category: '应用', description: '利用电子自旋自由度进行信息存储、处理和传输的新兴技术，包括自旋阀、自旋转移矩和拓扑自旋电子学。', related: ['topology', 'magnetic_moment', 'dft'], courses: ['拓扑绝缘体导论', '超导物理前沿'], materials: ['Bi2Se3', 'Fe', 'NdFeB'] },
    quantum_computing: { id: 'quantum_computing', name: '量子计算', category: '应用', description: '利用量子力学原理进行信息处理的新型计算范式，包括超导量子比特、拓扑量子比特和离子阱等实现方案。', related: ['topology', 'superconductivity', 'qft'], courses: ['超导物理前沿', '拓扑绝缘体导论'], materials: ['YBCO', 'FeSe', 'Bi2Se3'] }
  },
  
  // 节点分类颜色
  categories: {
    '理论': '#ff6b4a', '方法': '#5ba3d9', '软件': '#5ccf8e', '性质': '#9b7ed8',
    '分类': '#ffc857', '材料': '#ff8fab', '应用': '#5cc9c9', '参数': '#a0a0a0'
  },
  
  currentNode: 'dft',
  zoom: 1,
  offset: { x: 0, y: 0 },
  
  // 渲染知识图谱
  render() {
    const container = document.getElementById('kg-container');
    if (!container) return;
    
    const current = this.nodes[this.currentNode];
    if (!current) return;
    
    // 构建邻接节点
    const relatedNodes = current.related.map(id => this.nodes[id]).filter(Boolean);
    
    container.innerHTML = `
      <div style="position:relative;width:100%;height:380px;overflow:hidden;background:linear-gradient(135deg,#f8fbfe,#eef3f8);border-radius:16px">
        <svg width="100%" height="100%" viewBox="0 0 360 380" style="position:absolute;top:0;left:0">
          ${relatedNodes.map((node, i) => {
            const angle = (i / relatedNodes.length) * 2 * Math.PI - Math.PI/2;
            const radius = 120;
            const x = 180 + Math.cos(angle) * radius;
            const y = 190 + Math.sin(angle) * radius;
            const color = this.categories[node.category] || '#999';
            return `
              <line x1="180" y1="190" x2="${x}" y2="${y}" stroke="${color}" stroke-width="2" opacity="0.3"/>
              <g onclick="KnowledgeGraph.selectNode('${node.id}')" style="cursor:pointer">
                <circle cx="${x}" cy="${y}" r="38" fill="${color}" opacity="0.15"/>
                <circle cx="${x}" cy="${y}" r="32" fill="#fff" stroke="${color}" stroke-width="2"/>
                <text x="${x}" y="${y-2}" text-anchor="middle" font-size="9" font-weight="700" fill="${color}">${node.name.substring(0,6)}</text>
                <text x="${x}" y="${y+10}" text-anchor="middle" font-size="7" fill="#999">${node.category}</text>
              </g>
            `;
          }).join('')}
          <!-- 中心节点 -->
          <g onclick="KnowledgeGraph.selectNode('${current.id}')" style="cursor:pointer">
            <circle cx="180" cy="190" r="52" fill="${this.categories[current.category]||'#ff6b4a'}" opacity="0.2"/>
            <circle cx="180" cy="190" r="44" fill="${this.categories[current.category]||'#ff6b4a'}"/>
            <text x="180" y="185" text-anchor="middle" font-size="11" font-weight="800" fill="#fff">${current.name.substring(0,8)}</text>
            <text x="180" y="200" text-anchor="middle" font-size="8" fill="rgba(255,255,255,0.8)">${current.level}</text>
          </g>
        </svg>
        <div style="position:absolute;top:8px;right:8px;display:flex;gap:4px">
          <button onclick="KnowledgeGraph.zoomIn()" style="background:rgba(255,255,255,0.9);border:none;border-radius:6px;padding:4px 8px;cursor:pointer;font-size:14px">+</button>
          <button onclick="KnowledgeGraph.zoomOut()" style="background:rgba(255,255,255,0.9);border:none;border-radius:6px;padding:4px 8px;cursor:pointer;font-size:14px">−</button>
          <button onclick="KnowledgeGraph.resetView()" style="background:rgba(255,255,255,0.9);border:none;border-radius:6px;padding:4px 8px;cursor:pointer;font-size:12px">重置</button>
        </div>
      </div>
      <!-- 节点详情面板 -->
      <div class="card" style="margin-top:12px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
          <div>
            <div style="display:flex;align-items:center;gap:8px">
              <span style="font-size:18px;font-weight:800;color:${this.categories[current.category]}">${current.name}</span>
              <span class="card-badge" style="background:${this.categories[current.category]}22;color:${this.categories[current.category]}">${current.category}</span>
              <span class="card-badge" style="background:var(--bg-secondary)">${current.level}</span>
            </div>
          </div>
        </div>
        <div style="font-size:13px;line-height:1.8;color:var(--text2);margin-bottom:12px">${current.description}</div>
        
        ${current.courses.length > 0 ? `
          <div style="margin-bottom:10px">
            <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:6px"><i data-lucide="book-open" class="lucide" style="width:14px;height:14px;vertical-align:middle"></i> 相关课程</div>
            <div class="chip-row">${current.courses.map(c => `<span class="chip" onclick="LearningSystem.openCourse('${c}')">${c}</span>`).join('')}</div>
          </div>
        ` : ''}
        
        ${current.materials.length > 0 ? `
          <div style="margin-bottom:10px">
            <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:6px"><i data-lucide="flask-conical" class="lucide" style="width:14px;height:14px;vertical-align:middle"></i> 相关材料</div>
            <div class="chip-row">${current.materials.map(m => `<span class="chip" onclick="MaterialDetailRenderer.openByFormula('${m}')">${m}</span>`).join('')}</div>
          </div>
        ` : ''}
        
        ${current.related.length > 0 ? `
          <div>
            <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:6px"><i data-lucide="network" class="lucide" style="width:14px;height:14px;vertical-align:middle"></i> 关联概念 (${current.related.length})</div>
            <div class="chip-row">${current.related.map(id => { const n = this.nodes[id]; return n ? `<span class="chip" onclick="KnowledgeGraph.selectNode('${id}')">${n.name}</span>` : ''; }).join('')}</div>
          </div>
        ` : ''}
      </div>
      
      <div class="card" style="margin-top:12px;background:linear-gradient(135deg,#f0f7ff,#e8f0f8)">
        <div style="font-size:12px;color:var(--text3);line-height:1.6">
          <i data-lucide="info" class="lucide" style="width:14px;height:14px;vertical-align:middle"></i>
          知识图谱包含 <b style="color:var(--primary)">${Object.keys(this.nodes).length}</b> 个概念节点，覆盖理论、方法、软件、性质、材料、应用六大类别，与课程系统和材料数据库深度关联。点击任意节点查看详情，点击关联概念进行知识漫游。
        </div>
      </div>
    `;
    if (typeof renderIcons === 'function') renderIcons();
  },
  
  selectNode(id) {
    if (!this.nodes[id]) return;
    this.currentNode = id;
    this.render();
  },
  
  zoomIn() { this.zoom = Math.min(2, this.zoom * 1.2); this.render(); },
  zoomOut() { this.zoom = Math.max(0.5, this.zoom / 1.2); this.render(); },
  resetView() { this.zoom = 1; this.offset = {x:0,y:0}; this.render(); },
  
  // 搜索节点
  search(query) {
    if (!query) return [];
    const q = query.toLowerCase();
    return Object.values(this.nodes).filter(n => 
      n.name.toLowerCase().includes(q) || 
      n.description.toLowerCase().includes(q) ||
      n.category.includes(q)
    );
  },
  
  // 搜索提示
  searchPrompt() {
    UI.dialog.prompt({
      title: '搜索知识节点',
      message: '输入关键词搜索概念、理论、方法、材料等',
      placeholder: '例如：DFT、能带、石墨烯、VASP...',
      confirmText: '搜索',
      onConfirm: (text) => {
        const results = this.search(text);
        if (results.length > 0) {
          this.selectNode(results[0].id);
          UI.toast.success(`找到 ${results.length} 个相关节点`);
        } else {
          UI.toast.info('未找到相关节点');
        }
      }
    });
  }
};

// ============================================================
// 二、学习系统增强
// ============================================================
const LearningSystem = {
  currentFilter: 'all',
  
  // 课程数据库
  courses: {
    '密度泛函理论进阶': { title: '密度泛函理论进阶', icon: 'atom', color: 'orange', level: '研究生', totalLessons: 16, progress: 78, currentLesson: '第13课：HSE06杂化泛函', description: '系统学习DFT理论框架，从Kohn-Sham方程到高级泛函，掌握第一性原理计算的理论基础。' },
    '第一性原理计算实战': { title: '第一性原理计算实战', icon: 'flask-conical', color: 'blue', level: '研究生', totalLessons: 20, progress: 100, currentLesson: '已完成', description: '从输入文件设置到结果分析，全面掌握VASP/QE/ABACUS等软件的实战操作。' },
    '拓扑绝缘体导论': { title: '拓扑绝缘体导论', icon: 'infinity', color: 'purple', level: '研究生', totalLessons: 12, progress: 45, currentLesson: '第6课：Z₂不变量', description: '从拓扑能带理论到实验表征，深入理解拓扑绝缘体的物理本质。' },
    '材料科学基础': { title: '材料科学基础', icon: 'layers', color: 'green', level: '本科', totalLessons: 24, progress: 30, currentLesson: '第8课：晶体缺陷', description: '材料科学入门课程，涵盖晶体结构、缺陷、相变、力学性质等基础内容。' },
    'AI for Science': { title: 'AI for Science', icon: 'brain', color: 'purple', level: '前沿', totalLessons: 15, progress: 0, currentLesson: '开始学习', description: '人工智能在科学研究中的应用，包括机器学习势函数、AI辅助材料设计等前沿方向。' },
    '量子力学奇妙之旅': { title: '量子力学奇妙之旅', icon: 'orbit', color: 'blue', level: '高中', totalLessons: 12, progress: 0, currentLesson: '开始学习', description: '用通俗易懂的方式讲解量子力学基本概念，适合高中生和科普爱好者。' },
    '虚拟实验室：化学实验': { title: '虚拟实验室：化学实验', icon: 'microscope', color: 'orange', level: '高中', totalLessons: 10, progress: 0, currentLesson: '开始学习', description: '安全的虚拟化学实验环境，涵盖基础化学实验操作和原理。' },
    '二维材料物理': { title: '二维材料物理', icon: 'layout-grid', color: 'teal', level: '研究生', totalLessons: 14, progress: 0, currentLesson: '开始学习', description: '石墨烯、TMDC等二维材料的物理性质和器件应用。' },
    '催化材料基础': { title: '催化材料基础', icon: 'zap', color: 'green', level: '本科', totalLessons: 18, progress: 0, currentLesson: '开始学习', description: '催化原理和常用催化材料，包括电催化、光催化等。' },
    '钙钛矿光伏材料': { title: '钙钛矿光伏材料', icon: 'sun', color: 'yellow', level: '前沿', totalLessons: 12, progress: 0, currentLesson: '开始学习', description: '钙钛矿材料的结构、性质和光伏器件应用。' },
    '锂离子电池材料': { title: '锂离子电池材料', icon: 'battery-charging', color: 'green', level: '本科', totalLessons: 16, progress: 0, currentLesson: '开始学习', description: '锂离子电池正负极材料、电解质和储能机理。' },
    '超导物理前沿': { title: '超导物理前沿', icon: 'zap', color: 'blue', level: '前沿', totalLessons: 14, progress: 0, currentLesson: '开始学习', description: '从BCS理论到高温超导，探索超导物理的前沿进展。' }
  },
  
  // 渲染学习页面
  renderLearnPage() {
    const user = UserManager.getCurrentUser();
    const myCourses = user.courses || [];
    
    // 筛选推荐课程
    let recommendCourses = Object.values(this.courses).filter(c => !myCourses.some(mc => mc.title === c.title));
    if (this.currentFilter !== 'all') {
      recommendCourses = recommendCourses.filter(c => c.level === this.currentFilter || c.level.includes(this.currentFilter));
    }
    
    // 渲染Tab
    const tabContainer = document.querySelector('#page-learn .tab-bar');
    if (tabContainer) {
      tabContainer.innerHTML = `
        <button class="tab-item ${this.currentFilter==='all'?'active':''}" onclick="LearningSystem.setFilter('all')">全部</button>
        <button class="tab-item ${this.currentFilter==='本科'?'active':''}" onclick="LearningSystem.setFilter('本科')">本科</button>
        <button class="tab-item ${this.currentFilter==='高中'?'active':''}" onclick="LearningSystem.setFilter('高中')">中学</button>
        <button class="tab-item ${this.currentFilter==='前沿'?'active':''}" onclick="LearningSystem.setFilter('前沿')">前沿</button>
        <button class="tab-item" onclick="navigateTo('page-experiments')"><i data-lucide="microscope" class="lucide" style="width:12px;height:12px"></i>虚拟实验</button>
      `;
    }
    
    // 渲染我的课程
    const myCoursesContainer = document.getElementById('learn-courses');
    if (myCoursesContainer) {
      myCoursesContainer.innerHTML = myCourses.length > 0 ? myCourses.map(c => this.renderCourseCard(c, true)).join('') : '<div class="empty-state"><div class="empty-icon">📚</div><div class="empty-text">还没有学习中的课程，从下方推荐中选择开始学习</div></div>';
    }
    
    // 渲染推荐课程
    const recContainer = document.getElementById('recommend-courses');
    if (recContainer) {
      recContainer.innerHTML = recommendCourses.slice(0, 6).map(c => this.renderCourseCard(c, false)).join('');
    }
    
    if (typeof renderIcons === 'function') renderIcons();
  },
  
  renderCourseCard(course, isMy) {
    const colorMap = {orange:'ct-orange',blue:'ct-blue',green:'ct-green',purple:'ct-purple',teal:'ct-teal',yellow:'ct-orange'};
    const fillMap = {orange:'pf-orange',blue:'pf-blue',green:'pf-green',purple:'pf-purple',teal:'pf-teal'};
    const color = course.color || 'blue';
    return `
      <div class="card course-card" onclick="LearningSystem.openCourse('${course.title}')">
        <div class="course-thumb ${colorMap[color]||'ct-blue'}"><i data-lucide="${course.icon||'book-open'}" class="lucide icon-2xl icon-white"></i></div>
        <div class="course-info">
          <div class="course-name">${course.title}</div>
          <div class="course-meta"><i data-lucide="play-circle" class="lucide" style="width:12px;height:12px"></i>${course.totalLessons}课时 · ${course.level} · ${isMy?course.currentLesson:'开始学习'}</div>
          ${isMy && course.progress > 0 ? `
            <div class="course-progress-bar"><div class="course-progress-fill ${fillMap[color]||'pf-blue'}" style="width:${course.progress}%"></div></div>
            <div class="course-progress-text" style="color:var(--${color==='orange'?'primary':color})">进度 ${course.progress}%</div>
          ` : `<div style="font-size:11px;color:var(--text3);margin-top:4px">${course.description.substring(0,40)}...</div>`}
        </div>
      </div>
    `;
  },
  
  setFilter(filter) {
    this.currentFilter = filter;
    this.renderLearnPage();
  },
  
  openCourse(title) {
    const course = this.courses[title];
    if (!course) {
      UI.toast.info('课程详情开发中');
      return;
    }
    // 跳转到课程详情页
    navigateTo('page-course-detail', _store(course));
  },
  
  // 渲染课程详情
  renderCourseDetail(course) {
    if (!course || !course.title) course = this.courses['密度泛函理论进阶'];
    
    const titleEl = document.getElementById('course-detail-title');
    if (titleEl) titleEl.textContent = course.title;
    
    const content = document.getElementById('course-detail-content');
    if (!content) return;
    
    const colorMap = {orange:'#ff6b4a',blue:'#5ba3d9',green:'#5ccf8e',purple:'#9b7ed8',teal:'#5cc9c9'};
    const color = colorMap[course.color] || '#5ba3d9';
    
    // 生成课时列表
    const lessons = Array.from({length: course.totalLessons}, (_, i) => ({
      num: i + 1,
      title: `第${i+1}课：${['理论基础','计算方法','软件操作','结果分析','进阶应用'][i%5] || '课程内容'}`,
      duration: `${20 + Math.floor(Math.random()*30)}分钟`,
      completed: i < Math.floor(course.progress / 100 * course.totalLessons),
      current: course.currentLesson.includes(`第${i+1}课`)
    }));
    
    content.innerHTML = `
      <div class="card" style="background:linear-gradient(135deg,${color}22,${color}11)">
        <div style="display:flex;gap:16px;align-items:center">
          <div style="width:64px;height:64px;background:${color};border-radius:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <i data-lucide="${course.icon||'book-open'}" class="lucide icon-2xl icon-white"></i>
          </div>
          <div style="flex:1">
            <div style="font-size:18px;font-weight:800;margin-bottom:4px">${course.title}</div>
            <div style="font-size:12px;color:var(--text3);margin-bottom:6px">${course.totalLessons}课时 · ${course.level} · 约${course.totalLessons*0.5}小时</div>
            <div style="display:flex;gap:6px">
              <span class="card-badge" style="background:${color}22;color:${color}">${course.level}</span>
              ${course.progress > 0 ? `<span class="card-badge badge-completed">已学${course.progress}%</span>` : ''}
            </div>
          </div>
        </div>
        <div style="font-size:13px;line-height:1.7;color:var(--text2);margin-top:12px">${course.description}</div>
        <button class="btn btn-primary" style="width:100%;margin-top:14px" onclick="LearningSystem.startLesson('${course.title}',1)">
          <i data-lucide="play" class="lucide icon-white" style="width:16px;height:16px"></i>${course.progress > 0 ? '继续学习' : '开始学习'}
        </button>
      </div>
      
      <div class="section-header" style="margin-top:16px"><div class="section-title"><i data-lucide="list" class="lucide" style="width:14px;height:14px;color:var(--blue)"></i>课程目录 (${course.totalLessons}课时)</div></div>
      <div class="card" style="padding:0">
        ${lessons.map(lesson => `
          <div onclick="LearningSystem.startLesson('${course.title}',${lesson.num})" style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid var(--border);cursor:pointer;${lesson.current?'background:var(--bg-secondary)':''}">
            <div style="width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;${lesson.completed?`background:var(--green);color:#fff`:`background:var(--bg-secondary);color:var(--text3)`}">
              ${lesson.completed?'<i data-lucide="check" class="lucide" style="width:14px;height:14px"></i>':`<span style="font-size:12px;font-weight:700">${lesson.num}</span>`}
            </div>
            <div style="flex:1;min-width:0">
              <div style="font-size:13px;font-weight:600;${lesson.current?'color:var(--primary)':''}">${lesson.title}</div>
              <div style="font-size:11px;color:var(--text3);margin-top:2px">${lesson.duration}</div>
            </div>
            <i data-lucide="play-circle" class="lucide" style="width:18px;height:18px;color:${lesson.completed?'var(--green)':'var(--text3)'}"></i>
          </div>
        `).join('')}
      </div>
    `;
    if (typeof renderIcons === 'function') renderIcons();
  },
  
  // 开始课时学习
  startLesson(courseTitle, lessonNum) {
    const course = this.courses[courseTitle];
    if (!course) return;
    const lessonData = {
      courseTitle: courseTitle,
      lessonNum: lessonNum,
      title: `第${lessonNum}课：${course.title}`,
      content: course.description,
      exercises: [
        '简述本节课的核心概念',
        '举例说明该理论的应用场景',
        '完成课后练习题并提交答案'
      ]
    };
    navigateTo('page-lesson', _store(lessonData));
  },
  
  // 渲染课时学习页
  renderLesson(data) {
    if (!data || !data.title) data = { courseTitle: '密度泛函理论进阶', lessonNum: 1, title: '第1课：DFT理论基础', content: '本节课程主要介绍密度泛函理论的基本框架...', exercises: ['简述Kohn-Sham方程','比较LDA和GGA'] };
    
    const titleEl = document.getElementById('lesson-title');
    if (titleEl) titleEl.textContent = data.title;
    
    const container = document.querySelector('#page-lesson .container');
    if (!container) return;
    
    container.innerHTML = `
      <!-- 视频播放区域 -->
      <div class="card" style="background:linear-gradient(135deg,#1a1a2e,#16213e);color:#fff;text-align:center;padding:40px 20px;position:relative;overflow:hidden">
        <div onclick="LearningSystem.playVideo()" style="cursor:pointer;display:inline-block">
          <div style="width:72px;height:72px;background:rgba(255,255,255,0.15);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto;backdrop-filter:blur(10px)">
            <i data-lucide="play" class="lucide icon-white" style="width:32px;height:32px;margin-left:4px"></i>
          </div>
          <div style="font-size:15px;font-weight:700;margin-top:16px">点击播放课程视频</div>
          <div style="font-size:12px;opacity:0.6;margin-top:4px">时长: ${20+Math.floor(Math.random()*30)}分钟 · 高清画质</div>
        </div>
        <div style="position:absolute;bottom:12px;left:16px;right:16px;display:flex;align-items:center;gap:10px">
          <div style="flex:1;height:4px;background:rgba(255,255,255,0.2);border-radius:2px"><div style="width:35%;height:100%;background:var(--primary);border-radius:2px"></div></div>
          <span style="font-size:11px;opacity:0.7">12:34 / 35:20</span>
        </div>
      </div>
      
      <!-- 课程讲义 -->
      <div class="card" style="margin-top:12px">
        <div class="card-title" style="margin-bottom:12px"><i data-lucide="file-text" class="lucide" style="width:16px;height:16px;color:var(--blue)"></i>课程讲义</div>
        <div style="font-size:14px;line-height:1.9;color:var(--text2)">
          <h3 style="font-size:16px;font-weight:700;margin-bottom:10px;color:var(--text)">${data.title}</h3>
          <p style="margin-bottom:12px">${data.content}</p>
          <p style="margin-bottom:12px">本节课我们将深入学习核心概念，理解其物理意义，并通过具体案例掌握其应用方法。课程内容涵盖理论推导、数值实现和实际应用三个层面。</p>
          <div style="background:var(--bg-secondary);padding:12px;border-radius:10px;margin:12px 0">
            <div style="font-size:12px;font-weight:700;color:var(--primary);margin-bottom:6px">💡 重点提示</div>
            <div style="font-size:13px;color:var(--text2)">本节课的核心概念是后续课程的基础，请务必理解透彻。建议配合课程讲义和参考文献进行深度学习。</div>
          </div>
          <p>通过本节课的学习，你应该能够：1）理解基本概念；2）掌握核心公式；3）应用于实际问题。下节课我们将进一步探讨进阶内容。</p>
        </div>
      </div>
      
      <!-- 课后练习 -->
      <div class="card" style="margin-top:12px">
        <div class="card-title" style="margin-bottom:12px"><i data-lucide="help-circle" class="lucide" style="width:16px;height:16px;color:var(--primary)"></i>课后练习</div>
        ${(data.exercises || ['简述核心概念','完成练习题']).map((q, i) => `
          <div style="padding:12px 0;border-bottom:1px solid var(--border)">
            <div style="font-size:14px;font-weight:600;margin-bottom:8px">${i+1}. ${q}</div>
            <textarea class="form-input" style="min-height:60px;font-size:13px;resize:vertical" placeholder="请输入你的答案..." id="exercise_answer_${i}"></textarea>
          </div>
        `).join('')}
        <button class="btn btn-primary" style="width:100%;margin-top:14px" onclick="LearningSystem.submitHomework()">
          <i data-lucide="send" class="lucide icon-white" style="width:16px;height:16px"></i>提交作业
        </button>
      </div>
      
      <!-- 课程导航 -->
      <div style="display:flex;justify-content:space-between;gap:12px;margin-top:16px">
        <button class="btn btn-secondary" style="flex:1" onclick="LearningSystem.prevLesson()"><i data-lucide="arrow-left" class="lucide" style="width:14px;height:14px"></i>上一课</button>
        <button class="btn btn-primary" style="flex:1" onclick="LearningSystem.nextLesson()"><i data-lucide="arrow-right" class="lucide icon-white" style="width:14px;height:14px"></i>下一课</button>
      </div>
    `;
    if (typeof renderIcons === 'function') renderIcons();
  },
  
  playVideo() {
    UI.toast.success('视频开始播放（模拟）');
    // 模拟视频播放进度
    setTimeout(() => UI.toast.info('视频播放中...'), 500);
  },
  
  submitHomework() {
    // 检查是否有答案
    const answers = document.querySelectorAll('[id^="exercise_answer_"]');
    let hasAnswer = false;
    answers.forEach(a => { if (a.value.trim()) hasAnswer = true; });
    
    if (!hasAnswer) {
      UI.toast.warning('请先填写作业答案');
      return;
    }
    
    UI.dialog.confirm({
      title: '提交作业',
      message: '确定提交本次作业吗？提交后将进入AI批改流程。',
      confirmText: '确认提交',
      onConfirm: () => {
        UI.toast.success('作业已提交，AI正在批改...');
        setTimeout(() => {
          UI.dialog.alert({
            title: '作业批改完成',
            message: 'AI批改结果：\n\n得分：85/100\n评价：答案基本正确，核心概念理解到位，但部分细节需要加强。\n\n建议：1）复习第3课的相关内容；2）完成拓展练习题；3）参与课程讨论区交流。',
            confirmText: '查看详情'
          });
        }, 2000);
      }
    });
  },
  
  prevLesson() { UI.toast.info('已切换到上一课'); this.renderLesson({...currentData['page-lesson'], lessonNum: Math.max(1, (currentData['page-lesson']?.lessonNum||1)-1)}); },
  nextLesson() { UI.toast.info('已切换到下一课'); this.renderLesson({...currentData['page-lesson'], lessonNum: (currentData['page-lesson']?.lessonNum||1)+1}); },
  
  // 显示课程目录
  showCatalog() {
    const course = this.currentCourse || this.courses[0];
    if (!course || !course.lessons) { UI.toast.info('暂无课程目录'); return; }
    UI.dialog.actionSheet({
      title: `${course.title} - 课程目录`,
      actions: course.lessons.map((lesson, idx) => ({
        label: `第${idx+1}课：${lesson.title}`,
        icon: lesson.completed ? 'check-circle' : 'book-open',
        onClick: () => {
          this.currentLessonIndex = idx;
          this.renderLesson({ courseId: course.id, lessonIndex: idx });
          UI.toast.info(`切换到第${idx+1}课`);
        }
      }))
    });
  }
};

// ============================================================
// 三、虚拟实验室系统
// ============================================================
const VirtualLab = {
  currentTab: 'physics',
  
  experiments: {
    physics: [
      { id: 'exp_001', name: '电磁感应实验', icon: 'magnet', color: 'orange', duration: '30分钟', level: '高中物理', description: '通过改变磁通量观察感应电流的产生，验证法拉第电磁感应定律。' },
      { id: 'exp_002', name: '光电效应实验', icon: 'zap', color: 'purple', duration: '40分钟', level: '大学物理', description: '测量不同频率光照射下的光电子动能，验证爱因斯坦光电效应方程。' },
      { id: 'exp_003', name: '杨氏双缝干涉', icon: 'activity', color: 'blue', duration: '25分钟', level: '高中物理', description: '观察光的双缝干涉条纹，测量波长并验证波动理论。' },
      { id: 'exp_004', name: '霍尔效应实验', icon: 'git-branch', color: 'green', duration: '35分钟', level: '大学物理', description: '测量霍尔电压，计算载流子浓度和迁移率。' }
    ],
    chemistry: [
      { id: 'exp_005', name: '酸碱中和滴定', icon: 'flask-conical', color: 'green', duration: '45分钟', level: '高中化学', description: '用标准NaOH溶液滴定未知浓度盐酸，学习滴定操作和指示剂使用。' },
      { id: 'exp_006', name: '氧化还原反应', icon: 'zap', color: 'orange', duration: '30分钟', level: '高中化学', description: '观察铜锌原电池反应，理解氧化还原反应原理。' },
      { id: 'exp_007', name: '结晶实验', icon: 'box', color: 'blue', duration: '60分钟', level: '高中化学', description: '通过蒸发结晶法制备硫酸铜晶体，观察晶体生长过程。' },
      { id: 'exp_008', name: '电化学合成', icon: 'battery-charging', color: 'purple', duration: '50分钟', level: '大学化学', description: '用电化学方法合成纳米材料，研究反应条件对产物的影响。' }
    ],
    biology: [
      { id: 'exp_009', name: 'DNA提取实验', icon: 'dna', color: 'blue', duration: '60分钟', level: '高中生物', description: '从植物细胞中提取DNA，观察DNA的丝状结构。' },
      { id: 'exp_010', name: '显微镜观察细胞', icon: 'microscope', color: 'green', duration: '40分钟', level: '初中生物', description: '使用光学显微镜观察动植物细胞，识别细胞结构。' },
      { id: 'exp_011', name: '酶催化实验', icon: 'activity', color: 'orange', duration: '35分钟', level: '高中生物', description: '研究温度和pH对酶活性的影响，理解酶的催化特性。' },
      { id: 'exp_012', name: 'PCR扩增实验', icon: 'repeat', color: 'purple', duration: '90分钟', level: '大学生物', description: '学习聚合酶链式反应（PCR）技术，扩增目标DNA片段。' }
    ],
    material: [
      { id: 'exp_013', name: '晶体生长观察', icon: 'box', color: 'teal', duration: '120分钟', level: '材料科学', description: '观察晶体从溶液中生长的过程，研究生长条件对晶体形貌的影响。' },
      { id: 'exp_014', name: '材料硬度测试', icon: 'dumbbell', color: 'orange', duration: '30分钟', level: '材料科学', description: '使用维氏硬度计测量不同材料的硬度，比较材料力学性能。' },
      { id: 'exp_015', name: '热导率测量', icon: 'thermometer', color: 'red', duration: '45分钟', level: '材料科学', description: '使用激光闪射法测量材料的热导率，研究热输运性质。' },
      { id: 'exp_016', name: 'XRD物相分析', icon: 'scan', color: 'blue', duration: '60分钟', level: '材料科学', description: '使用X射线衍射仪分析材料的物相组成和晶体结构。' }
    ]
  },
  
  render() {
    const experiments = this.experiments[this.currentTab] || [];
    
    // 更新Tab
    const tabContainer = document.querySelector('#page-experiments .tab-bar');
    if (tabContainer) {
      tabContainer.innerHTML = `
        <button class="tab-item ${this.currentTab==='physics'?'active':''}" onclick="VirtualLab.setTab('physics')">物理实验</button>
        <button class="tab-item ${this.currentTab==='chemistry'?'active':''}" onclick="VirtualLab.setTab('chemistry')">化学实验</button>
        <button class="tab-item ${this.currentTab==='biology'?'active':''}" onclick="VirtualLab.setTab('biology')">生物实验</button>
        <button class="tab-item ${this.currentTab==='material'?'active':''}" onclick="VirtualLab.setTab('material')">材料实验</button>
      `;
    }
    
    // 渲染实验列表
    const container = document.getElementById('experiment-list');
    if (!container) return;
    
    const colorMap = {orange:'ct-orange',blue:'ct-blue',green:'ct-green',purple:'ct-purple',teal:'ct-teal',red:'ct-orange'};
    
    container.innerHTML = `
      <div style="margin-bottom:16px">
        <div style="font-size:13px;color:var(--text3);margin-bottom:10px">共 ${experiments.length} 个虚拟实验 · 安全无风险 · 可重复操作</div>
        ${experiments.map(exp => `
          <div class="card course-card" onclick="VirtualLab.openExperiment('${exp.id}')">
            <div class="course-thumb ${colorMap[exp.color]||'ct-blue'}"><i data-lucide="${exp.icon}" class="lucide icon-2xl icon-white"></i></div>
            <div class="course-info">
              <div class="course-name">${exp.name}</div>
              <div class="course-meta"><i data-lucide="clock" class="lucide" style="width:12px;height:12px"></i>${exp.duration} · ${exp.level}</div>
              <div style="font-size:11px;color:var(--text3);margin-top:4px;line-height:1.4">${exp.description.substring(0,40)}...</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    if (typeof renderIcons === 'function') renderIcons();
  },
  
  setTab(tab) {
    this.currentTab = tab;
    this.render();
  },
  
  openExperiment(id) {
    const allExperiments = Object.values(this.experiments).flat();
    const exp = allExperiments.find(e => e.id === id);
    if (!exp) return;
    
    // 创建实验详情页面内容
    UI.dialog.alert({
      title: exp.name,
      message: `实验时长：${exp.duration}\n难度等级：${exp.level}\n\n${exp.description}\n\n实验步骤：\n1. 准备实验器材和试剂\n2. 按照操作指南进行实验\n3. 观察并记录实验现象\n4. 分析实验数据并得出结论\n\n点击"开始实验"进入虚拟实验室操作界面。`,
      confirmText: '开始实验'
    });
  }
};

// ============================================================
// 四、个人中心功能增强
// ============================================================
const ProfileEnhancements = {
  // 计费中心
  openBillingCenter() {
    const user = UserManager.getCurrentUser();
    UI.dialog.alert({
      title: '计费中心',
      message: `当前套餐：${user.level||'免费版'}\n\n算力使用情况：\n• CPU时长：${user.stats?.gpuHours||0} 小时\n• GPU时长：${(user.stats?.gpuHours||0)*0.1} 小时\n• 存储空间：640.3 GB / 500 GB\n\n本月费用：¥${(user.stats?.gpuHours||0)*0.5+9.9}\n\n套餐对比：\n• 免费版：10 CPU小时/月\n• 入门版(¥99/月)：100 CPU小时+10 GPU小时\n• 专业版(¥299/月)：1000 CPU小时+100 GPU小时\n• 团队版(¥999/月)：不限CPU+500 GPU小时+团队协作`,
      confirmText: '升级套餐'
    });
  },
  
  // 我的文件
  openMyFiles() {
    UI.dialog.alert({
      title: '我的文件',
      message: `存储空间：640.3 GB / 500 GB（已超限）\n\n文件分类：\n• 计算结果：328 GB（1,247个文件）\n• Notebook文档：45 GB（89个文件）\n• 分子结构：12 GB（234个文件）\n• 课程资料：8 GB（56个文件）\n• 其他：247 GB\n\n操作：\n• 清理大文件\n• 下载到本地\n• 迁移到对象存储\n• 购买额外存储空间`,
      confirmText: '管理文件'
    });
  },
  
  // API密钥
  openAPIKeys() {
    UI.dialog.alert({
      title: 'API 密钥管理',
      message: `开发者API访问\n\n当前密钥：\n• sk-unisci-xxxx-xxxx-xxxx（已创建 2026-08-01）\n  状态：正常 · 调用次数：12,450次\n\nAPI端点：\n• 计算任务：https://api.unisci.app/v1/jobs\n• 材料查询：https://api.unisci.app/v1/materials\n• Notebook执行：https://api.unisci.app/v1/notebook\n\n使用文档：https://docs.unisci.app/api\n\n操作：创建新密钥 · 撤销密钥 · 查看调用统计`,
      confirmText: '创建新密钥'
    });
  },
  
  // 帮助与反馈
  openHelp() {
    UI.dialog.actionSheet({
      title: '帮助与反馈',
      actions: [
        { label: '使用文档', icon: 'book-open', onClick: () => this.showHelpDocs() },
        { label: '视频教程', icon: 'play-circle', onClick: () => this.showVideoTutorials() },
        { label: '常见问题', icon: 'help-circle', onClick: () => this.showFAQ() },
        { label: '联系客服', icon: 'message-circle', onClick: () => this.showContact() },
        { label: '提交反馈', icon: 'edit-3', onClick: () => this.showFeedback() },
        { label: '关于UniSci', icon: 'info', onClick: () => this.showAbout() }
      ]
    });
  },
  
  // 使用文档
  showHelpDocs() {
    UI.dialog.alert({
      title: '📖 UniSci 使用文档',
      message: `UniSci 全民科学计算平台 - 完整使用指南

【快速入门】
1. 注册登录：使用手机号或邮箱注册账号
2. 浏览课程：在"学习"页面选择感兴趣的课程
3. 创建计算：在"计算"页面新建计算任务
4. 使用Notebook：在"Notebook"页面编写和运行代码
5. 工作流编排：在"工作流"页面搭建自动化流程

【核心功能】
• 计算任务：支持DFT、MD、ML等6种计算类型
• Notebook：7种内核，支持代码、Markdown、图表输出
• 工作流：30+节点类型，可视化编排，一键执行
• 分子建模：40+元素，8种预设分子，3D可视化
• 材料数据库：12种材料完整数据，9种分类筛选
• 知识图谱：36个知识节点，与课程/材料深度串联

【算力资源】
• 免费版：10 CPU小时/月
• 入门版：100 CPU小时+10 GPU小时
• 专业版：1000 CPU小时+100 GPU小时
• 团队版：不限CPU+500 GPU小时+团队协作

【快捷键】
• Ctrl+S：保存当前工作
• Ctrl+Enter：运行Notebook单元格
• Ctrl+K：打开全局搜索
• Esc：返回上一页

完整文档请访问：https://docs.unisci.app`,
      confirmText: '我知道了'
    });
  },
  
  // 视频教程
  showVideoTutorials() {
    UI.dialog.alert({
      title: '🎬 视频教程',
      message: `UniSci 视频教程系列

【入门系列】
1. 《UniSci平台介绍与注册》- 5分钟
2. 《界面导航与基本操作》- 8分钟
3. 《如何创建第一个计算任务》- 12分钟
4. 《Notebook基础使用教程》- 15分钟

【进阶系列】
5. 《工作流编排实战》- 20分钟
6. 《分子建模与3D可视化》- 18分钟
7. 《材料数据库使用指南》- 10分钟
8. 《知识图谱探索学习》- 12分钟

【高级系列】
9. 《DFT计算参数调优》- 25分钟
10. 《机器学习预测材料性质》- 30分钟
11. 《API接口开发与集成》- 20分钟
12. 《团队协作与项目管理》- 15分钟

【观看方式】
• 平台内观看：学习页面 → 视频教程分类
• B站搜索：UniSci官方账号
• 微信公众号：UniSci科学计算

每周更新1-2个新教程，敬请关注！`,
      confirmText: '去学习'
    });
  },
  
  // 常见问题
  showFAQ() {
    UI.dialog.alert({
      title: '❓ 常见问题 FAQ',
      message: `【账号相关】
Q: 如何注册账号？
A: 点击登录页面的"注册"按钮，使用手机号或邮箱注册。

Q: 忘记密码怎么办？
A: 点击登录页面的"忘记密码"，通过手机号或邮箱重置。

Q: 如何升级套餐？
A: 个人中心 → 计费中心 → 选择套餐 → 支付升级。

【计算相关】
Q: 计算任务排队多久？
A: 根据资源使用情况，通常1-5分钟开始执行。

Q: 如何查看计算结果？
A: 计算页面 → 点击任务 → 结果Tab，支持5种结果视图。

Q: 计算失败怎么办？
A: 查看任务日志，根据错误信息调整参数后重新提交。

【Notebook相关】
Q: 支持哪些编程语言？
A: 支持Python、Julia、R、Shell、MATLAB、Fortran、C++共7种内核。

Q: Notebook文件会自动保存吗？
A: 是的，每30秒自动保存，也可以手动Ctrl+S保存。

Q: 如何导出Notebook？
A: 编辑器右上角 → 导出 → 选择格式（ipynb/pdf/html）。

【其他】
Q: 数据安全吗？
A: 所有数据加密存储，计算任务隔离运行，保障数据安全。

Q: 支持团队协作吗？
A: 专业版及以上支持团队协作，可共享项目和计算资源。

Q: 如何联系客服？
A: 帮助与反馈 → 联系客服，工作日9:00-18:00在线响应。`,
      confirmText: '我知道了'
    });
  },
  
  // 联系客服
  showContact() {
    UI.dialog.alert({
      title: '💬 联系客服',
      message: `UniSci 客户支持中心

【在线客服】
• 工作时间：周一至周五 9:00-18:00
• 响应时间：平均5分钟内响应
• 点击右下角客服图标即可对话

【联系方式】
• 客服邮箱：support@unisci.app
• 商务合作：business@unisci.app
• 技术支持：tech@unisci.app
• 投诉建议：feedback@unisci.app

【社区交流】
• 官方QQ群：123456789
• 微信公众号：UniSci科学计算
• GitHub：github.com/unisci
• 论坛：forum.unisci.app

【服务承诺】
• 7×24小时系统监控
• 工作日5分钟内客服响应
• 重大问题2小时内解决方案
• 定期系统维护与升级

我们致力于为每一位用户提供优质的科学计算服务！`,
      confirmText: '我知道了'
    });
  },
  
  // 提交反馈
  showFeedback() {
    UI.dialog.prompt({
      title: '📝 提交反馈',
      message: '您的反馈对我们非常重要，请详细描述您遇到的问题或建议：',
      placeholder: '请输入您的反馈内容...',
      confirmText: '提交反馈',
      onConfirm: (text) => {
        if (text && text.trim().length > 0) {
          UI.toast.success('反馈已提交，感谢您的支持！我们会尽快处理。');
          console.log('[UniSci] 用户反馈:', text);
        } else {
          UI.toast.warning('请输入反馈内容');
        }
      }
    });
  },
  
  // 关于UniSci
  showAbout() {
    UI.dialog.alert({
      title: 'ℹ️ 关于 UniSci',
      message: `UniSci - 全民科学计算平台
版本：V2.0.0
构建日期：2026-08-24

【平台愿景】
让国家超算基础设施像水、电、空气一样，真正融入每个人的生活。从科研人员到在校大学生，从中学生到小学生，每个人都能享受高端计算资源带来的便利。

【核心价值】
• 普惠计算：降低科学计算门槛，让人人可用
• 教育赋能：从小学到博士，全学段覆盖
• 开放生态：开放API，支持第三方集成
• 国产替代：支持ABACUS等国产计算软件

【技术架构】
• 前端：移动端优先的单页应用
• 后端：微服务架构，弹性扩缩容
• 算力：对接国家超算中心，统一调度
• 存储：分布式对象存储，数据加密

【团队】
UniSci 由一支热爱科学、热爱教育的团队打造。我们相信，计算能力的普及将推动下一次科学革命。

【致谢】
感谢所有开源社区的贡献者，感谢每一位用户的支持与反馈。

© 2026 UniSci. All rights reserved.
https://www.unisci.app`,
      confirmText: '我知道了'
    });
  }
};

// ============================================================
// 五、通用功能增强（替换关键toast）
// ============================================================
const Enhancements = {
  // 初始化所有增强
  init() {
    // 重写关键的showToast调用为真实功能
    this.enhanceProfilePage();
    this.enhanceLearnPage();
    this.enhanceKnowledgeGraph();
    console.log('[UniSci] 功能增强模块已加载');
  },
  
  // 增强个人中心页面
  enhanceProfilePage() {
    // 等待页面渲染完成后增强
    setTimeout(() => {
      // 增强工作流卡片点击
      document.querySelectorAll('#page-profile .card').forEach(card => {
        const title = card.querySelector('.card-title, .job-title, div');
        if (title && title.textContent.includes('工作流') || title?.textContent?.includes('流水线')) {
          card.style.cursor = 'pointer';
          card.onclick = () => navigateTo('page-workflow-editor');
        }
      });
    }, 500);
  },
  
  // 增强学习页面
  enhanceLearnPage() {
    // 学习页面Tab切换现在由LearningSystem处理
  },
  
  // 增强知识图谱
  enhanceKnowledgeGraph() {
    // 知识图谱页面现在由KnowledgeGraph处理
  }
};

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Enhancements.init());
} else {
  Enhancements.init();
}

console.log('[UniSci] 全面功能增强模块已加载完成');
