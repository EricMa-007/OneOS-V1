/**
 * UniSci Platform V2 - 第三纵队：全民可及
 * 术语解释系统 - 专业术语 → 人话解释
 * 让中学生也能看懂科学计算
 */

'use strict';

// ============================================================
// 一、术语词典（专业术语 → 人话解释）
// ============================================================
const TerminologyDict = {
  // 计算方法类
  'DFT': {
    simple: '密度泛函理论',
    explain: '一种用计算机模拟材料性质的方法。就像天气预报用方程模拟天气一样，DFT用方程模拟电子的行为，从而算出材料的导电性、磁性、稳定性等性质。',
    category: '计算方法'
  },
  '密度泛函理论': {
    simple: 'DFT',
    explain: '一种用计算机模拟材料性质的方法。就像天气预报用方程模拟天气一样，DFT用方程模拟电子的行为，从而算出材料的导电性、磁性、稳定性等性质。是目前材料计算中最常用的方法。',
    category: '计算方法'
  },
  '第一性原理': {
    simple: '从头算',
    explain: '不依赖任何实验数据，只从最基本的物理定律（量子力学）出发，直接计算材料性质。就像用数学公式直接算出1+1=2，而不是靠记忆答案。',
    category: '计算方法'
  },
  '分子动力学': {
    simple: 'MD模拟',
    explain: '用计算机模拟原子和分子的运动过程。就像给原子拍"高速电影"，看它们在不同温度、压力下怎么运动、怎么碰撞、怎么形成新结构。常用于研究材料的力学性能、相变、化学反应等。',
    category: '计算方法'
  },
  '蒙特卡洛': {
    simple: '随机抽样方法',
    explain: '一种用随机数来解决数学问题的方法。就像扔硬币很多次来估算正面朝上的概率一样，蒙特卡洛方法通过大量随机抽样来估算复杂系统的性质。',
    category: '计算方法'
  },
  '自洽场迭代': {
    simple: 'SCF循环',
    explain: '计算电子结构时的一种迭代方法。因为电子的运动互相影响，需要先假设一个初始状态，算出结果后再用结果修正假设，反复迭代直到结果稳定不变。就像调收音机，反复微调直到声音最清晰。',
    category: '计算方法'
  },
  '赝势': {
    simple: '简化的原子模型',
    explain: '计算时为了节省时间，把原子内层电子的影响用一个简化的"等效势"来代替，只详细计算外层电子。就像看地球绕太阳转时，不需要考虑地球上每个人的位置，只需要知道地球的总质量。',
    category: '计算方法'
  },
  '平面波基组': {
    simple: '用波的叠加表示电子',
    explain: '用很多不同频率的平面波叠加来表示电子的波函数。就像用不同频率的声波叠加可以组成任何音乐一样，用足够多的平面波可以精确表示电子在材料中的分布。',
    category: '计算方法'
  },
  'K点网格': {
    simple: '采样点',
    explain: '计算晶体材料时，需要在"动量空间"中选取一些采样点来计算电子性质。K点网格越密，计算越精确，但也越慢。就像画曲线时取的点越多，曲线越平滑，但画的时间也越长。',
    category: '计算方法'
  },
  '收敛性': {
    simple: '结果稳定',
    explain: '指计算结果随着计算精度提高逐渐趋于稳定，不再变化。就像用越来越精确的尺子量桌子长度，量到一定精度后，结果就稳定在1.23米，不会再变了。收敛性好说明计算结果可靠。',
    category: '计算方法'
  },

  // 电子结构类
  '能带': {
    simple: '电子的能量等级',
    explain: '描述晶体中电子允许具有的能量范围。就像楼梯的台阶，电子只能站在某些"台阶"（允许的能量）上，不能站在台阶之间（禁带）。能带结构决定了材料是导体、半导体还是绝缘体。',
    category: '电子结构'
  },
  '带隙': {
    simple: '能量间隔',
    explain: '导带和价带之间的能量间隔，电子需要获得至少这么多能量才能从价带跳到导带参与导电。带隙为0是金属，0.1-3eV是半导体，大于3eV是绝缘体。就像跨栏，栏越低越容易跳过去。',
    category: '电子结构'
  },
  '态密度': {
    simple: 'DOS',
    explain: '单位能量范围内电子状态的数量。就像统计每个楼层有多少个房间一样，态密度告诉我们每个能量等级有多少个电子可以占据的"位置"。态密度高的地方，电子聚集得多。',
    category: '电子结构'
  },
  '费米能级': {
    simple: '电子的"海平面"',
    explain: '绝对零度时电子占据的最高能量等级。就像海平面，海平面以下的地方都被水（电子）填满，海平面以上是空的。费米能级是判断材料导电性的重要参考点。',
    category: '电子结构'
  },
  '价带': {
    simple: '电子的"家"',
    explain: '被电子填满的能量最高的能带。价带中的电子被原子束缚，不能自由移动。就像停在停车场的车，虽然有能量但不能跑。当电子获得足够能量跳出价带，就能参与导电。',
    category: '电子结构'
  },
  '导带': {
    simple: '电子的"高速公路"',
    explain: '未被电子填满的能量最低的能带。导带中的电子可以自由移动，参与导电。就像高速公路上的车，可以自由行驶。半导体中导带通常是空的，需要激发电子才能导电。',
    category: '电子结构'
  },
  '有效质量': {
    simple: '电子的"等效重量"',
    explain: '晶体中电子受到晶格周期性势场的影响，其运动行为相当于具有一个"等效质量"的自由粒子。有效质量小的电子跑得快（导电性好），有效质量大的电子跑得慢。就像在不同地形上跑步，平地跑得快（等效质量小），沼泽里跑得慢（等效质量大）。',
    category: '电子结构'
  },
  '迁移率': {
    simple: '电子的"奔跑速度"',
    explain: '单位电场下电子的平均漂移速度。迁移率越高，电子跑得越快，材料导电性越好。就像汽车的最高时速，时速越高跑得越快。迁移率受材料纯度、温度、缺陷等因素影响。',
    category: '电子结构'
  },

  // 材料类
  '半导体': {
    simple: '半导电材料',
    explain: '导电性介于导体和绝缘体之间的材料。常温下导电性不好，但通过加热、光照或掺杂可以显著提高导电性。硅、锗、砷化镓都是半导体，是芯片和太阳能电池的核心材料。就像半开的门，既不是完全打开也不是完全关闭。',
    category: '材料'
  },
  '绝缘体': {
    simple: '不导电材料',
    explain: '带隙很宽（通常大于3eV），电子很难获得足够能量跳到导带，因此几乎不导电。橡胶、玻璃、陶瓷都是绝缘体。就像关死的门，电子很难过去。',
    category: '材料'
  },
  '金属': {
    simple: '导电材料',
    explain: '带隙为0，价带和导带重叠，电子可以自由移动，因此导电性很好。铁、铜、铝都是金属。就像完全打开的门，电子可以自由通过。',
    category: '材料'
  },
  '拓扑绝缘体': {
    simple: '表面导电的绝缘体',
    explain: '一种奇特的量子材料：内部是绝缘体（不导电），但表面是金属（导电）。而且表面导电通道非常稳定，不受杂质和缺陷影响。就像一个绝缘的管子，但管子内壁镀了一层导电金属。这是2016年诺贝尔物理学奖的研究领域。',
    category: '材料'
  },
  '二维材料': {
    simple: '只有一层原子的材料',
    explain: '厚度只有一个或几个原子层的材料，电子只能在二维平面内运动。石墨烯（单层碳原子）是最著名的二维材料。二维材料具有许多奇特的物理性质，在电子器件、光电器件领域有巨大应用潜力。就像一张纸，只有面，没有厚度。',
    category: '材料'
  },
  '莫尔超晶格': {
    simple: '两层材料叠加的花纹',
    explain: '当两层二维材料以微小角度叠加时，会形成类似摩尔纹的周期性超结构。这种超结构会显著改变电子的行为，产生超导、关联绝缘态等新奇物理现象。就像两张纱窗叠在一起会看到新的花纹一样。',
    category: '材料'
  },
  '铁电材料': {
    simple: '可翻转的电极化',
    explain: '具有自发电极化，且极化方向可以通过外加电场翻转的材料。就像磁铁有N极和S极可以翻转一样，铁电材料有正电极和负电极可以翻转。用于存储器、传感器、电容器等。',
    category: '材料'
  },
  '超导': {
    simple: '零电阻导电',
    explain: '某些材料在低温下电阻突然降为零的现象。超导体还具有完全抗磁性（迈斯纳效应），可以让磁铁悬浮。就像一条没有任何摩擦的高速公路，电子可以永远跑下去不会减速。高温超导是凝聚态物理的重大研究方向。',
    category: '材料'
  },

  // 软件工具类
  'VASP': {
    simple: '维也纳模拟软件包',
    explain: '目前最流行的第一性原理计算软件之一，由维也纳大学开发。用密度泛函理论计算材料的电子结构、原子结构、力学性质等。就像材料科学领域的"Photoshop"，功能强大但需要学习成本。',
    category: '软件工具'
  },
  'Quantum ESPRESSO': {
    simple: '开源量子计算软件',
    explain: '一款开源免费的第一性原理计算软件，基于密度泛函理论。与VASP功能类似，但完全免费开源，适合学习和预算有限的课题组。就像GIMP之于Photoshop，功能齐全且免费。',
    category: '软件工具'
  },
  'ABACUS': {
    simple: '国产原子模拟软件',
    explain: '由中国科学技术大学等单位开发的开源第一性原理计算软件，支持平面波和数值原子轨道两种基组。在国内科研团队中广泛使用，是国产科学计算软件的代表。',
    category: '软件工具'
  },
  'GROMACS': {
    simple: '分子动力学模拟软件',
    explain: '最流行的分子动力学模拟软件之一，特别适合模拟生物分子（蛋白质、DNA、脂质膜等）。计算速度快，支持GPU加速。就像分子模拟领域的"高速摄像机"，可以记录原子的每一步运动。',
    category: '软件工具'
  },
  'LAMMPS': {
    simple: '大规模原子模拟软件',
    explain: '一款开源的分子动力学模拟软件，特别适合大规模材料模拟（金属、陶瓷、聚合物等）。支持多种势函数和系综，可在超级计算机上并行计算百万甚至上亿原子。就像材料模拟领域的"超级计算机"，能处理超大规模系统。',
    category: '软件工具'
  },
  'OUTCAR': {
    simple: 'VASP输出文件',
    explain: 'VASP计算的主要输出文件，包含计算过程的详细信息：能量、力、应力、电子结构、收敛过程等。是分析计算结果最重要的文件。就像实验报告，记录了计算的每一个细节和最终结果。',
    category: '软件工具'
  },
  'POSCAR': {
    simple: '晶体结构输入文件',
    explain: 'VASP的输入文件之一，描述晶体的结构信息：晶格常数、原子种类、原子坐标等。是告诉VASP"算什么材料"的文件。就像菜谱，告诉软件用什么原子、怎么排列来计算。',
    category: '软件工具'
  },
  'INCAR': {
    simple: '计算参数输入文件',
    explain: 'VASP的输入文件之一，设置计算的参数：计算类型（自洽/结构优化/能带）、截断能、k点、收敛标准等。是告诉VASP"怎么算"的文件。就像相机的设置菜单，决定用什么模式、什么参数来拍照。',
    category: '软件工具'
  },
  'KPOINTS': {
    simple: 'k点设置文件',
    explain: 'VASP的输入文件之一，设置k点网格的密度。k点越密，计算越精确，但也越慢。就像扫描分辨率，分辨率越高图像越清晰，但扫描时间也越长。',
    category: '软件工具'
  },

  // 物理概念类
  '晶格常数': {
    simple: '晶胞的边长',
    explain: '晶体中最小重复单元（晶胞）的边长。不同材料有不同的晶格常数。就像积木的尺寸，不同大小的积木搭出来的建筑大小不同。晶格常数决定了材料的密度和原子间距。',
    category: '物理概念'
  },
  '晶胞': {
    simple: '晶体的最小积木',
    explain: '晶体结构中最小的重复单元，整个晶体就是由晶胞在三维空间周期性重复排列而成。就像马赛克瓷砖的最小图案块，整个墙面就是这个图案的重复。晶胞的大小和形状决定了晶体的结构类型。',
    category: '物理概念'
  },
  '布里渊区': {
    simple: '动量空间的晶胞',
    explain: '在"动量空间"（倒空间）中，晶体的最小重复单元。能带结构就是在布里渊区中计算的。就像真实空间有晶胞一样，动量空间有布里渊区。第一布里渊区是最重要的，所有电子态都可以在其中表示。',
    category: '物理概念'
  },
  '倒空间': {
    simple: '动量的世界',
    explain: '与真实空间相对应的抽象空间，其中的"位置"对应动量。晶体的周期性在倒空间中也表现为周期性。就像音乐的频率空间与时间空间的关系一样，倒空间是理解晶体电子结构的关键。',
    category: '物理概念'
  },
  '声子': {
    simple: '晶格振动的量子',
    explain: '晶体中原子振动的能量量子。就像光子是电磁波的量子一样，声子是晶格振动波的量子。声子决定了材料的热导率、比热、红外吸收等性质。就像原子们集体跳舞产生的"能量包"。',
    category: '物理概念'
  },
  '交换关联泛函': {
    simple: '电子相互作用的近似',
    explain: '密度泛函理论中描述电子之间量子相互作用（交换和关联效应）的数学函数。不同的泛函（如LDA、GGA、杂化泛函）精度和计算量不同。就像描述人与人之间复杂关系的简化模型，模型越精确越复杂，但也越耗时。',
    category: '物理概念'
  },
  '杂化泛函': {
    simple: '混合的交换关联模型',
    explain: '将精确的Hartree-Fock交换与密度泛函的交换关联混合的泛函，如HSE06、PBE0。比普通泛函更精确，尤其在计算带隙方面，但计算量也大得多。就像混合了两种调料的酱汁，味道更好但调配更麻烦。',
    category: '物理概念'
  },
  '范德华力': {
    simple: '分子间的弱吸引力',
    explain: '分子或原子之间的弱相互作用力，比化学键弱得多。包括色散力、诱导力、取向力。壁虎能爬墙就是靠范德华力。在二维材料中，层与层之间就是靠范德华力结合的。就像人与人之间的微弱吸引力，虽然不强但在近距离时很重要。',
    category: '物理概念'
  },
  '形成能': {
    simple: '材料的稳定性指标',
    explain: '形成一种材料所需的能量。形成能越低，材料越稳定，越容易合成。就像建房子，需要的材料和工时越少（形成能低），房子越容易建（越稳定）。形成能为负表示材料比组成元素的单质更稳定。',
    category: '物理概念'
  },
  '结合能': {
    simple: '原子结合的强度',
    explain: '将晶体中的原子全部分离成自由原子所需的能量。结合能越大，原子结合越牢固，材料越稳定、熔点越高。就像积木之间的连接强度，连接越牢固，积木越不容易散架。',
    category: '物理概念'
  },
  '内聚能': {
    simple: '材料的内聚强度',
    explain: '单位原子或单位体积的结合能，衡量材料内部原子之间的结合强度。内聚能高的材料通常硬度高、熔点高。就像团队的凝聚力，凝聚力越强团队越稳定。',
    category: '物理概念'
  },
  '弹性模量': {
    simple: '材料的硬度指标',
    explain: '衡量材料抵抗弹性变形能力的物理量。弹性模量越大，材料越硬，越不容易变形。金刚石的弹性模量非常大，所以很硬；橡胶的弹性模量很小，所以很软。就像弹簧的劲度系数，系数越大弹簧越硬。',
    category: '物理概念'
  },
  '泊松比': {
    simple: '横向变形比例',
    explain: '材料受到纵向压缩时，横向会膨胀，泊松比就是横向膨胀量与纵向压缩量的比值。大多数材料泊松比为正（压缩时变胖），但有些特殊材料泊松比为负（压缩时变瘦），称为拉胀材料。就像捏橡皮泥，纵向压扁时横向会变胖。',
    category: '物理概念'
  }
};

// ============================================================
// 二、术语解释渲染系统
// ============================================================
const Terminology = {
  // 初始化：给页面中的术语添加可点击样式
  init(container) {
    if (!container) container = document.body;
    this.enhanceTerms(container);
  },

  // 在指定容器中增强术语
  enhanceTerms(container) {
    if (!container) return;
    
    // 获取所有文本节点
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // 跳过已经在术语span中的文本
          if (node.parentElement && node.parentElement.classList.contains('term-explain')) {
            return NodeFilter.FILTER_REJECT;
          }
          // 跳过script和style标签
          if (node.parentElement && (node.parentElement.tagName === 'SCRIPT' || node.parentElement.tagName === 'STYLE')) {
            return NodeFilter.FILTER_REJECT;
          }
          // 只处理有内容的文本节点
          if (node.nodeValue && node.nodeValue.trim().length > 0) {
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_REJECT;
        }
      }
    );

    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }

    // 处理每个文本节点
    textNodes.forEach(textNode => {
      this.processTextNode(textNode);
    });
  },

  // 处理单个文本节点，替换术语为可点击span
  processTextNode(textNode) {
    const text = textNode.nodeValue;
    if (!text || text.length < 2) return;

    // 按长度降序排列术语，避免短词匹配破坏长词
    const terms = Object.keys(TerminologyDict).sort((a, b) => b.length - a.length);
    
    let modified = false;
    let resultHTML = text;
    
    for (const term of terms) {
      if (resultHTML.includes(term)) {
        const info = TerminologyDict[term];
        // 替换术语为可点击span（用占位符避免重复替换）
        const placeholder = `__TERM_${term.length}_${Math.random().toString(36).substr(2,9)}__`;
        const span = `<span class="term-explain" data-term="${term}" onclick="Terminology.showExplain('${term}', this)" title="点击查看解释">${term}</span>`;
        resultHTML = resultHTML.split(term).join(placeholder);
        resultHTML = resultHTML.split(placeholder).join(span);
        modified = true;
      }
    }

    if (modified) {
      const span = document.createElement('span');
      span.innerHTML = resultHTML;
      textNode.parentNode.replaceChild(span, textNode);
    }
  },

  // 显示术语解释
  showExplain(term, element) {
    const info = TerminologyDict[term];
    if (!info) return;

    // 移除已存在的tooltip
    document.querySelectorAll('.term-tooltip').forEach(t => t.remove());

    // 创建tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'term-tooltip';
    tooltip.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <div style="font-size:15px;font-weight:700;color:#1e40af">${term}</div>
        <span style="font-size:10px;background:#dbeafe;color:#1e40af;padding:2px 8px;border-radius:6px">${info.category}</span>
      </div>
      <div style="font-size:12px;color:#64748b;margin-bottom:6px">俗称：${info.simple}</div>
      <div style="font-size:13px;line-height:1.6;color:#334155">${info.explain}</div>
      <div style="text-align:right;margin-top:8px">
        <span onclick="Terminology.closeExplain()" style="font-size:11px;color:#3b82f6;cursor:pointer">知道了 ✓</span>
      </div>
    `;
    
    // 样式
    tooltip.style.cssText = `
      position:fixed;
      z-index:10000;
      max-width:320px;
      background:#fff;
      border:1px solid #e2e8f0;
      border-radius:12px;
      padding:14px;
      box-shadow:0 10px 40px rgba(0,0,0,0.15);
      font-family:system-ui,-apple-system,sans-serif;
    `;
    
    document.body.appendChild(tooltip);
    
    // 定位tooltip在元素上方
    const rect = element.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    let top = rect.top - tooltipRect.height - 10;
    let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
    
    // 边界检测
    if (top < 10) top = rect.bottom + 10;
    if (left < 10) left = 10;
    if (left + tooltipRect.width > window.innerWidth - 10) left = window.innerWidth - tooltipRect.width - 10;
    
    tooltip.style.top = top + 'px';
    tooltip.style.left = left + 'px';
    
    // 点击其他地方关闭
    setTimeout(() => {
      document.addEventListener('click', this.closeExplain, { once: true });
    }, 100);
  },

  // 关闭解释
  closeExplain() {
    document.querySelectorAll('.term-tooltip').forEach(t => t.remove());
  },

  // 获取术语解释（供其他模块调用）
  getExplain(term) {
    return TerminologyDict[term] || null;
  },

  // 搜索术语
  search(keyword) {
    const results = [];
    for (const [term, info] of Object.entries(TerminologyDict)) {
      if (term.includes(keyword) || info.simple.includes(keyword) || info.explain.includes(keyword)) {
        results.push({ term, ...info });
      }
    }
    return results;
  },

  // 获取所有分类
  getCategories() {
    const categories = new Set();
    for (const info of Object.values(TerminologyDict)) {
      categories.add(info.category);
    }
    return Array.from(categories);
  },

  // 按分类获取术语
  getByCategory(category) {
    const results = [];
    for (const [term, info] of Object.entries(TerminologyDict)) {
      if (info.category === category) {
        results.push({ term, ...info });
      }
    }
    return results;
  },

  // 术语数量
  get count() {
    return Object.keys(TerminologyDict).length;
  }
};

// 添加术语解释的CSS样式
(function() {
  const style = document.createElement('style');
  style.textContent = `
    .term-explain {
      color: #2563eb;
      border-bottom: 1px dashed #93c5fd;
      cursor: help;
      font-weight: 500;
      transition: all 0.2s;
    }
    .term-explain:hover {
      color: #1d4ed8;
      background: #eff6ff;
      border-bottom-color: #2563eb;
    }
    .term-tooltip {
      animation: termFadeIn 0.2s ease-out;
    }
    @keyframes termFadeIn {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
})();

console.log(`[Terminology] 术语解释系统已加载，共 ${Terminology.count} 个术语`);
