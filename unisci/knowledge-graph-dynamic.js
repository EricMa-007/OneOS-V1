/**
 * UniSci Platform V2 - 动态知识图谱可视化模块
 * 提供：Canvas力导向图渲染、API数据接入、节点拖拽、缩放平移、
 *       多视图模式、搜索筛选、节点详情、知识探索
 *
 * 依赖：enhancements.js (KnowledgeGraph基础) / api-integration.js
 */

'use strict';

const KnowledgeGraphDynamic = (function() {
  // 内部状态
  let canvas = null;
  let ctx = null;
  let container = null;
  let nodes = [];
  let edges = [];
  let nodeMap = {};
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;
  let isDragging = false;
  let isPanning = false;
  let dragNode = null;
  let dragOffset = { x: 0, y: 0 };
  let panStart = { x: 0, y: 0 };
  let selectedNode = null;
  let hoveredNode = null;
  let animationId = null;
  let currentView = 'force'; // force / radial / hierarchical / category
  let currentCategory = 'all';
  let searchQuery = '';
  let centerNodeId = null;
  let apiDataLoaded = false;

  // 分类颜色
  const categoryColors = {
    'theory': '#ff6b4a',
    'method': '#5ba3d9',
    'software': '#9b59b6',
    'property': '#2ecc71',
    'material': '#f39c12',
    'application': '#e74c3c',
    'concept': '#1abc9c',
    'default': '#95a5a6',
  };

  // 模拟知识数据（API不可用时使用）
  const mockKnowledge = {
    nodes: [
      { id: 'dft', name: '密度泛函理论', category: 'theory', level: '基础', description: 'DFT是一种研究多电子体系电子结构的方法，是材料计算的核心理论基础。', x: 0, y: 0, vx: 0, vy: 0 },
      { id: 'vasp', name: 'VASP', category: 'software', level: '进阶', description: '维也纳从头算模拟软件包，是目前最流行的DFT计算软件之一。', x: 0, y: 0, vx: 0, vy: 0 },
      { id: 'bandgap', name: '能带结构', category: 'property', level: '基础', description: '能带结构描述固体中电子的能量与动量关系，决定材料的电学性质。', x: 0, y: 0, vx: 0, vy: 0 },
      { id: 'graphene', name: '石墨烯', category: 'material', level: '进阶', description: '由碳原子组成的二维蜂窝状晶格材料，具有优异的电学和力学性质。', x: 0, y: 0, vx: 0, vy: 0 },
      { id: 'scf', name: '自洽场计算', category: 'method', level: '基础', description: 'SCF是通过迭代求解Kohn-Sham方程直到收敛的计算方法。', x: 0, y: 0, vx: 0, vy: 0 },
      { id: 'dos', name: '态密度', category: 'property', level: '基础', description: '态密度描述单位能量范围内的电子态数目，是分析材料电子结构的重要工具。', x: 0, y: 0, vx: 0, vy: 0 },
      { id: 'abacus', name: 'ABACUS', category: 'software', level: '进阶', description: '原子轨道基组的从头算计算软件，国产开源DFT软件。', x: 0, y: 0, vx: 0, vy: 0 },
      { id: 'md', name: '分子动力学', category: 'method', level: '进阶', description: 'MD通过数值求解牛顿运动方程模拟原子和分子的物理运动。', x: 0, y: 0, vx: 0, vy: 0 },
      { id: 'mos2', name: '二硫化钼', category: 'material', level: '进阶', description: 'MoS2是一种层状过渡金属硫化物，具有优异的半导体性质。', x: 0, y: 0, vx: 0, vy: 0 },
      { id: 'catalyst', name: '电催化', category: 'application', level: '高级', description: '利用电催化剂加速电化学反应，在能源转换和存储中具有重要应用。', x: 0, y: 0, vx: 0, vy: 0 },
      { id: 'kpoint', name: 'K点采样', category: 'method', level: '基础', description: 'K点采样是在倒空间中选取积分点的方法，影响计算精度和效率。', x: 0, y: 0, vx: 0, vy: 0 },
      { id: 'pseudopotential', name: '赝势', category: 'theory', level: '进阶', description: '赝势是一种近似方法，用有效势代替原子核和内层电子的真实势。', x: 0, y: 0, vx: 0, vy: 0 },
    ],
    edges: [
      { source: 'dft', target: 'vasp', type: 'uses' },
      { source: 'dft', target: 'scf', type: 'includes' },
      { source: 'dft', target: 'bandgap', type: 'calculates' },
      { source: 'dft', target: 'dos', type: 'calculates' },
      { source: 'dft', target: 'pseudopotential', type: 'uses' },
      { source: 'vasp', target: 'bandgap', type: 'outputs' },
      { source: 'vasp', target: 'dos', type: 'outputs' },
      { source: 'vasp', target: 'kpoint', type: 'requires' },
      { source: 'abacus', target: 'dft', type: 'implements' },
      { source: 'graphene', target: 'bandgap', type: 'has_property' },
      { source: 'graphene', target: 'mos2', type: 'related_to' },
      { source: 'mos2', target: 'catalyst', type: 'used_for' },
      { source: 'md', target: 'graphene', type: 'simulates' },
      { source: 'scf', target: 'kpoint', type: 'requires' },
      { source: 'bandgap', target: 'dos', type: 'related_to' },
    ],
  };

  // =========================================================================
  // 初始化
  // =========================================================================
  function init() {
    container = document.getElementById('knowledge-graph-container');
    if (!container) {
      // 尝试创建容器
      const page = document.getElementById('page-knowledge-graph');
      if (page) {
        container = document.createElement('div');
        container.id = 'knowledge-graph-container';
        container.style.cssText = 'position:relative;width:100%;height:400px;background:var(--card);border-radius:16px;overflow:hidden;margin-bottom:12px';
        page.insertBefore(container, page.firstChild);
      }
    }
    if (!container) return;

    // 创建Canvas
    canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;cursor:grab';
    container.appendChild(canvas);

    // 设置Canvas尺寸
    resizeCanvas();
    ctx = canvas.getContext('2d');

    // 加载数据
    loadData();

    // 事件监听
    setupEvents();

    // 启动动画
    startAnimation();
  }

  function resizeCanvas() {
    if (!canvas || !container) return;
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    if (ctx) ctx.scale(dpr, dpr);
  }

  // =========================================================================
  // 数据加载
  // =========================================================================
  async function loadData() {
    // 尝试从API加载
    if (typeof APIIntegration !== 'undefined' && !DataSync.isMockMode()) {
      try {
        const result = await APIIntegration.knowledge.listNodes({ page_size: 50 });
        if (result.success && result.data && result.data.length > 0) {
          nodes = result.data.map(n => adaptAPINode(n));
          // 加载关系
          const relResult = await APIIntegration.knowledge.getGraph(nodes[0].id, 2);
          if (relResult.success && relResult.data) {
            edges = (relResult.data.edges || []).map(e => adaptAPIEdge(e));
          }
          apiDataLoaded = true;
          initNodePositions();
          return;
        }
      } catch (e) {
        console.warn('[KnowledgeGraph] API加载失败，使用模拟数据:', e.message);
      }
    }

    // 使用模拟数据
    nodes = mockKnowledge.nodes.map(n => ({ ...n, vx: 0, vy: 0 }));
    edges = mockKnowledge.edges.map(e => ({ ...e }));
    nodeMap = {};
    nodes.forEach(n => { nodeMap[n.id] = n; });
    initNodePositions();
  }

  function adaptAPINode(apiNode) {
    return {
      id: apiNode.id || apiNode.node_id,
      name: apiNode.name || apiNode.title || '未知',
      category: apiNode.category || 'concept',
      level: apiNode.level || '基础',
      description: apiNode.description || '',
      x: 0, y: 0, vx: 0, vy: 0,
    };
  }

  function adaptAPIEdge(apiEdge) {
    return {
      source: apiEdge.source || apiEdge.from_node_id,
      target: apiEdge.target || apiEdge.to_node_id,
      type: apiEdge.relation_type || apiEdge.type || 'related_to',
    };
  }

  function initNodePositions() {
    const centerX = (canvas.width / (window.devicePixelRatio || 1)) / 2;
    const centerY = (canvas.height / (window.devicePixelRatio || 1)) / 2;
    const radius = 120;

    nodes.forEach((node, i) => {
      if (node.x === 0 && node.y === 0) {
        const angle = (i / nodes.length) * Math.PI * 2;
        node.x = centerX + Math.cos(angle) * radius;
        node.y = centerY + Math.sin(angle) * radius;
      }
    });

    nodeMap = {};
    nodes.forEach(n => { nodeMap[n.id] = n; });
  }

  // =========================================================================
  // 力导向图算法
  // =========================================================================
  function simulate() {
    if (currentView !== 'force') return;

    const centerX = (canvas.width / (window.devicePixelRatio || 1)) / 2;
    const centerY = (canvas.height / (window.devicePixelRatio || 1)) / 2;

    // 斥力（节点之间）
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x;
        const dy = nodes[j].y - nodes[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = 2000 / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        nodes[i].vx -= fx;
        nodes[i].vy -= fy;
        nodes[j].vx += fx;
        nodes[j].vy += fy;
      }
    }

    // 引力（边连接的节点）
    edges.forEach(edge => {
      const source = nodeMap[edge.source];
      const target = nodeMap[edge.target];
      if (!source || !target) return;

      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = (dist - 100) * 0.01;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      source.vx += fx;
      source.vy += fy;
      target.vx -= fx;
      target.vy -= fy;
    });

    // 中心引力
    nodes.forEach(node => {
      node.vx += (centerX - node.x) * 0.005;
      node.vy += (centerY - node.y) * 0.005;
    });

    // 更新位置
    nodes.forEach(node => {
      if (node === dragNode) return;
      node.vx *= 0.9; // 阻尼
      node.vy *= 0.9;
      node.x += node.vx;
      node.y += node.vy;
    });
  }

  // =========================================================================
  // 渲染
  // =========================================================================
  function render() {
    if (!ctx || !canvas) return;
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);

    ctx.clearRect(0, 0, w, h);

    // 背景网格
    ctx.strokeStyle = 'rgba(0,0,0,0.03)';
    ctx.lineWidth = 1;
    const gridSize = 30;
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    // 渲染边
    edges.forEach(edge => {
      const source = nodeMap[edge.source];
      const target = nodeMap[edge.target];
      if (!source || !target) return;

      // 筛选
      if (currentCategory !== 'all' && source.category !== currentCategory && target.category !== currentCategory) return;
      if (searchQuery && !matchesSearch(source) && !matchesSearch(target)) return;

      const isHighlighted = selectedNode && (edge.source === selectedNode.id || edge.target === selectedNode.id);
      const isHovered = hoveredNode && (edge.source === hoveredNode.id || edge.target === hoveredNode.id);

      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      // 贝塞尔曲线
      const midX = (source.x + target.x) / 2;
      const midY = (source.y + target.y) / 2;
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const offset = 30;
      ctx.quadraticCurveTo(midX - dy * 0.1, midY + dx * 0.1, target.x, target.y);

      ctx.strokeStyle = isHighlighted ? '#ff6b4a' : isHovered ? '#5ba3d9' : 'rgba(0,0,0,0.15)';
      ctx.lineWidth = isHighlighted ? 2.5 : isHovered ? 2 : 1;
      ctx.stroke();

      // 箭头
      if (isHighlighted || isHovered) {
        const angle = Math.atan2(target.y - source.y, target.x - source.x);
        const arrowSize = 8;
        ctx.beginPath();
        ctx.moveTo(target.x, target.y);
        ctx.lineTo(target.x - arrowSize * Math.cos(angle - 0.3), target.y - arrowSize * Math.sin(angle - 0.3));
        ctx.lineTo(target.x - arrowSize * Math.cos(angle + 0.3), target.y - arrowSize * Math.sin(angle + 0.3));
        ctx.closePath();
        ctx.fillStyle = isHighlighted ? '#ff6b4a' : '#5ba3d9';
        ctx.fill();
      }
    });

    // 渲染节点
    nodes.forEach(node => {
      // 筛选
      if (currentCategory !== 'all' && node.category !== currentCategory) return;
      if (searchQuery && !matchesSearch(node)) return;

      const color = categoryColors[node.category] || categoryColors.default;
      const isSelected = selectedNode && selectedNode.id === node.id;
      const isHovered = hoveredNode && hoveredNode.id === node.id;
      const isConnected = selectedNode && edges.some(e =>
        (e.source === selectedNode.id && e.target === node.id) ||
        (e.target === selectedNode.id && e.source === node.id)
      );
      const isDimmed = selectedNode && !isSelected && !isConnected;

      const radius = isSelected ? 28 : isHovered ? 24 : 20;

      // 光晕
      if (isSelected || isHovered) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 8, 0, Math.PI * 2);
        ctx.fillStyle = color + '30';
        ctx.fill();
      }

      // 节点圆
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = isDimmed ? '#e0e0e0' : color;
      ctx.globalAlpha = isDimmed ? 0.3 : 1;
      ctx.fill();
      ctx.globalAlpha = 1;

      // 边框
      ctx.strokeStyle = isSelected ? '#fff' : 'rgba(255,255,255,0.8)';
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.stroke();

      // 节点文字
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${isSelected ? 11 : 9}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const displayName = node.name.length > 6 ? node.name.substring(0, 5) + '…' : node.name;
      ctx.fillText(displayName, node.x, node.y);
    });

    ctx.restore();

    // 缩放指示器
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.round(scale * 100)}%`, w - 10, h - 10);
  }

  function matchesSearch(node) {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return node.name.toLowerCase().includes(q) ||
           node.description.toLowerCase().includes(q) ||
           node.category.includes(q);
  }

  // =========================================================================
  // 动画循环
  // =========================================================================
  function startAnimation() {
    function loop() {
      simulate();
      render();
      animationId = requestAnimationFrame(loop);
    }
    loop();
  }

  function stopAnimation() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  // =========================================================================
  // 事件处理
  // =========================================================================
  function setupEvents() {
    if (!canvas) return;

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseleave', onMouseUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('dblclick', onDblClick);

    // 触摸支持
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      onMouseDown(e.touches[0]);
    }, { passive: false });
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      onMouseMove(e.touches[0]);
    }, { passive: false });
    canvas.addEventListener('touchend', onMouseUp);

    window.addEventListener('resize', () => {
      resizeCanvas();
    });
  }

  function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - offsetX) / scale,
      y: (e.clientY - rect.top - offsetY) / scale,
    };
  }

  function findNodeAt(pos) {
    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i];
      if (currentCategory !== 'all' && node.category !== currentCategory) continue;
      const dx = pos.x - node.x;
      const dy = pos.y - node.y;
      if (dx * dx + dy * dy < 400) {
        return node;
      }
    }
    return null;
  }

  function onMouseDown(e) {
    const pos = getMousePos(e);
    const node = findNodeAt(pos);

    if (node) {
      isDragging = true;
      dragNode = node;
      dragOffset.x = pos.x - node.x;
      dragOffset.y = pos.y - node.y;
      canvas.style.cursor = 'grabbing';
    } else {
      isPanning = true;
      panStart.x = e.clientX - offsetX;
      panStart.y = e.clientY - offsetY;
      canvas.style.cursor = 'grabbing';
    }
  }

  function onMouseMove(e) {
    const pos = getMousePos(e);

    if (isDragging && dragNode) {
      dragNode.x = pos.x - dragOffset.x;
      dragNode.y = pos.y - dragOffset.y;
      dragNode.vx = 0;
      dragNode.vy = 0;
    } else if (isPanning) {
      offsetX = e.clientX - panStart.x;
      offsetY = e.clientY - panStart.y;
    } else {
      // 悬停检测
      const node = findNodeAt(pos);
      hoveredNode = node;
      canvas.style.cursor = node ? 'pointer' : 'grab';
    }
  }

  function onMouseUp(e) {
    if (isDragging && dragNode) {
      // 点击（未移动）则选中
      const pos = getMousePos(e);
      const dx = pos.x - dragNode.x - dragOffset.x;
      const dy = pos.y - dragNode.y - dragOffset.y;
      if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
        selectNode(dragNode);
      }
    }

    isDragging = false;
    isPanning = false;
    dragNode = null;
    canvas.style.cursor = 'grab';
  }

  function onWheel(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.3, Math.min(3, scale * delta));

    // 以鼠标位置为中心缩放
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    offsetX = mx - (mx - offsetX) * (newScale / scale);
    offsetY = my - (my - offsetY) * (newScale / scale);

    scale = newScale;
  }

  function onDblClick(e) {
    const pos = getMousePos(e);
    const node = findNodeAt(pos);
    if (node) {
      // 以该节点为中心展开
      centerNodeId = node.id;
      expandNode(node);
    } else {
      // 重置视图
      resetView();
    }
  }

  // =========================================================================
  // 节点操作
  // =========================================================================
  function selectNode(node) {
    selectedNode = node;
    // 渲染详情面板
    renderNodeDetail(node);
  }

  function expandNode(node) {
    // 从API加载该节点的关联节点
    if (typeof APIIntegration !== 'undefined' && !DataSync.isMockMode()) {
      APIIntegration.knowledge.getGraph(node.id, 2).then(result => {
        if (result.success && result.data) {
          const newNodes = (result.data.nodes || []).map(n => adaptAPINode(n));
          const newEdges = (result.data.edges || []).map(e => adaptAPIEdge(e));
          newNodes.forEach(n => {
            if (!nodeMap[n.id]) {
              n.x = node.x + (Math.random() - 0.5) * 200;
              n.y = node.y + (Math.random() - 0.5) * 200;
              nodes.push(n);
              nodeMap[n.id] = n;
            }
          });
          newEdges.forEach(e => {
            if (!edges.some(existing => existing.source === e.source && existing.target === e.target)) {
              edges.push(e);
            }
          });
        }
      });
    }
  }

  function renderNodeDetail(node) {
    const detailContainer = document.getElementById('knowledge-node-detail');
    if (!detailContainer) {
      // 创建详情面板
      const page = document.getElementById('page-knowledge-graph');
      if (!page) return;
      detailContainer = document.createElement('div');
      detailContainer.id = 'knowledge-node-detail';
      detailContainer.style.cssText = 'margin-top:12px';
      page.appendChild(detailContainer);
    }

    const color = categoryColors[node.category] || categoryColors.default;
    const connectedNodes = edges
      .filter(e => e.source === node.id || e.target === node.id)
      .map(e => {
        const otherId = e.source === node.id ? e.target : e.source;
        return nodeMap[otherId];
      })
      .filter(n => n);

    detailContainer.innerHTML = `
      <div class="card" style="border-left:4px solid ${color}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
          <div>
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
              <span style="font-size:18px;font-weight:800;color:${color}">${node.name}</span>
              <span class="card-badge" style="background:${color}22;color:${color}">${node.category}</span>
              <span class="card-badge" style="background:var(--bg-secondary)">${node.level}</span>
            </div>
          </div>
          <button onclick="KnowledgeGraphDynamic.closeDetail()" style="background:none;border:none;cursor:pointer;padding:4px">
            <i data-lucide="x" class="lucide" style="width:18px;height:18px;color:var(--text3)"></i>
          </button>
        </div>
        <div style="font-size:13px;line-height:1.8;color:var(--text2);margin-bottom:12px">${node.description || '暂无描述'}</div>

        ${connectedNodes.length > 0 ? `
          <div style="margin-bottom:10px">
            <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:6px">
              <i data-lucide="network" class="lucide" style="width:14px;height:14px;vertical-align:middle"></i>
              关联概念 (${connectedNodes.length})
            </div>
            <div class="chip-row">
              ${connectedNodes.map(n => {
                const c = categoryColors[n.category] || '#999';
                return `<span class="chip" style="background:${c}15;color:${c};border-color:${c}30" onclick="KnowledgeGraphDynamic.focusNode('${n.id}')">${n.name}</span>`;
              }).join('')}
            </div>
          </div>
        ` : ''}

        <div style="display:flex;gap:8px;margin-top:12px">
          <button class="btn btn-secondary" style="flex:1" onclick="KnowledgeGraphDynamic.focusNode('${node.id}')">
            <i data-lucide="crosshair" class="lucide" style="width:14px;height:14px"></i> 聚焦此节点
          </button>
          <button class="btn btn-secondary" onclick="KnowledgeGraphDynamic.expandNodeById('${node.id}')">
            <i data-lucide="git-branch" class="lucide" style="width:14px;height:14px"></i> 展开
          </button>
        </div>
      </div>
    `;
    if (typeof renderIcons === 'function') renderIcons();
  }

  function closeDetail() {
    selectedNode = null;
    const detailContainer = document.getElementById('knowledge-node-detail');
    if (detailContainer) detailContainer.innerHTML = '';
  }

  function focusNode(nodeId) {
    const node = nodeMap[nodeId];
    if (!node) return;
    selectedNode = node;
    renderNodeDetail(node);
    // 居中显示
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    offsetX = w / 2 - node.x * scale;
    offsetY = h / 2 - node.y * scale;
  }

  function expandNodeById(nodeId) {
    const node = nodeMap[nodeId];
    if (node) expandNode(node);
  }

  // =========================================================================
  // 视图控制
  // =========================================================================
  function setView(view) {
    currentView = view;
    if (view === 'radial') {
      applyRadialLayout();
    } else if (view === 'hierarchical') {
      applyHierarchicalLayout();
    } else if (view === 'category') {
      applyCategoryLayout();
    }
  }

  function applyRadialLayout() {
    const centerX = (canvas.width / (window.devicePixelRatio || 1)) / 2;
    const centerY = (canvas.height / (window.devicePixelRatio || 1)) / 2;
    const centerNode = selectedNode || nodes[0];
    if (!centerNode) return;

    centerNode.x = centerX;
    centerNode.y = centerY;

    const connected = edges
      .filter(e => e.source === centerNode.id || e.target === centerNode.id)
      .map(e => {
        const otherId = e.source === centerNode.id ? e.target : e.source;
        return nodeMap[otherId];
      })
      .filter(n => n);

    connected.forEach((node, i) => {
      const angle = (i / connected.length) * Math.PI * 2;
      const radius = 150;
      node.x = centerX + Math.cos(angle) * radius;
      node.y = centerY + Math.sin(angle) * radius;
    });
  }

  function applyHierarchicalLayout() {
    const levels = {};
    const visited = new Set();

    function getLevel(nodeId, level = 0) {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      if (!levels[level]) levels[level] = [];
      levels[level].push(nodeId);

      edges.filter(e => e.source === nodeId).forEach(e => {
        getLevel(e.target, level + 1);
      });
    }

    if (nodes.length > 0) getLevel(nodes[0].id);

    const centerY = (canvas.height / (window.devicePixelRatio || 1)) / 2;
    Object.entries(levels).forEach(([level, nodeIds]) => {
      nodeIds.forEach((id, i) => {
        const node = nodeMap[id];
        if (node) {
          node.x = 80 + parseInt(level) * 180;
          node.y = 80 + i * 100;
        }
      });
    });
  }

  function applyCategoryLayout() {
    const categories = {};
    nodes.forEach(node => {
      if (!categories[node.category]) categories[node.category] = [];
      categories[node.category].push(node);
    });

    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    const cols = Math.ceil(Math.sqrt(Object.keys(categories).length));

    Object.entries(categories).forEach(([cat, catNodes], idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const centerX = (w / (cols + 1)) * (col + 1);
      const centerY = (h / (Math.ceil(Object.keys(categories).length / cols) + 1)) * (row + 1);

      catNodes.forEach((node, i) => {
        const angle = (i / catNodes.length) * Math.PI * 2;
        const radius = 60;
        node.x = centerX + Math.cos(angle) * radius;
        node.y = centerY + Math.sin(angle) * radius;
      });
    });
  }

  function setCategory(category) {
    currentCategory = category;
  }

  function setSearch(query) {
    searchQuery = query;
  }

  function resetView() {
    scale = 1;
    offsetX = 0;
    offsetY = 0;
    selectedNode = null;
    closeDetail();
  }

  function zoomIn() { scale = Math.min(3, scale * 1.2); }
  function zoomOut() { scale = Math.max(0.3, scale / 1.2); }

  // =========================================================================
  // 工具栏渲染
  // =========================================================================
  function renderToolbar() {
    const page = document.getElementById('page-knowledge-graph');
    if (!page) return;

    // 检查是否已有工具栏
    if (document.getElementById('kg-toolbar')) return;

    const toolbar = document.createElement('div');
    toolbar.id = 'kg-toolbar';
    toolbar.style.cssText = 'display:flex;gap:6px;align-items:center;padding:8px 12px;background:var(--card);border-radius:12px;margin-bottom:12px;overflow-x:auto;flex-wrap:wrap';

    const categories = [
      { id: 'all', name: '全部' },
      { id: 'theory', name: '理论' },
      { id: 'method', name: '方法' },
      { id: 'software', name: '软件' },
      { id: 'property', name: '性质' },
      { id: 'material', name: '材料' },
      { id: 'application', name: '应用' },
    ];

    const views = [
      { id: 'force', name: '力导向', icon: 'activity' },
      { id: 'radial', name: '放射', icon: 'circle-dot' },
      { id: 'hierarchical', name: '层级', icon: 'git-branch' },
      { id: 'category', name: '分类', icon: 'layout-grid' },
    ];

    toolbar.innerHTML = `
      <div style="display:flex;gap:4px;align-items:center">
        <span style="font-size:11px;color:var(--text3);white-space:nowrap">视图:</span>
        ${views.map(v => `
          <button class="btn btn-secondary" style="padding:4px 10px;font-size:11px" onclick="KnowledgeGraphDynamic.setView('${v.id}')">
            <i data-lucide="${v.icon}" class="lucide" style="width:12px;height:12px"></i> ${v.name}
          </button>
        `).join('')}
      </div>
      <div style="width:1px;height:20px;background:var(--border)"></div>
      <div style="display:flex;gap:4px;align-items:center;flex-wrap:wrap">
        ${categories.map(cat => `
          <button class="btn btn-secondary" style="padding:4px 10px;font-size:11px" onclick="KnowledgeGraphDynamic.setCategory('${cat.id}')">
            ${cat.name}
          </button>
        `).join('')}
      </div>
      <div style="width:1px;height:20px;background:var(--border)"></div>
      <div style="display:flex;gap:4px;align-items:center;margin-left:auto">
        <input type="text" id="kg-search" placeholder="搜索概念..." style="padding:6px 10px;border:1px solid var(--border);border-radius:8px;font-size:12px;width:120px" oninput="KnowledgeGraphDynamic.setSearch(this.value)">
        <button class="icon-btn" onclick="KnowledgeGraphDynamic.zoomIn()"><i data-lucide="plus" class="lucide" style="width:16px;height:16px"></i></button>
        <button class="icon-btn" onclick="KnowledgeGraphDynamic.zoomOut()"><i data-lucide="minus" class="lucide" style="width:16px;height:16px"></i></button>
        <button class="icon-btn" onclick="KnowledgeGraphDynamic.resetView()"><i data-lucide="maximize" class="lucide" style="width:16px;height:16px"></i></button>
      </div>
    `;

    page.insertBefore(toolbar, page.firstChild);
    if (typeof renderIcons === 'function') renderIcons();
  }

  // =========================================================================
  // 增强现有KnowledgeGraph
  // =========================================================================
  function enhance() {
    if (typeof KnowledgeGraph === 'undefined') {
      console.warn('[KnowledgeGraphDynamic] KnowledgeGraph未定义');
      return;
    }

    // 覆盖render方法
    const originalRender = KnowledgeGraph.render.bind(KnowledgeGraph);
    KnowledgeGraph.render = function() {
      // 渲染动态图谱
      renderToolbar();
      init();
      // 保留原始的统计信息卡片
      const page = document.getElementById('page-knowledge-graph');
      if (page && !document.getElementById('kg-stats')) {
        const stats = document.createElement('div');
        stats.id = 'kg-stats';
        stats.style.cssText = 'margin-top:12px';
        stats.innerHTML = `
          <div class="card" style="background:linear-gradient(135deg,#f0f7ff,#e8f0f8)">
            <div style="font-size:12px;color:var(--text3);line-height:1.6">
              <i data-lucide="info" class="lucide" style="width:14px;height:14px;vertical-align:middle"></i>
              知识图谱包含 <b style="color:var(--primary)">${nodes.length}</b> 个概念节点，
              <b style="color:var(--primary)">${edges.length}</b> 条关系，覆盖理论、方法、软件、性质、材料、应用六大类别。
              <br>操作提示：拖拽节点移动、滚轮缩放、点击节点查看详情、双击节点展开关联、双击空白重置视图。
            </div>
          </div>
        `;
        page.appendChild(stats);
        if (typeof renderIcons === 'function') renderIcons();
      }
    };
  }

  // 自动增强
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => enhance(), 500);
    });
  } else {
    setTimeout(() => enhance(), 500);
  }

  // =========================================================================
  // 公开API
  // =========================================================================
  return {
    init,
    render: () => { renderToolbar(); init(); },
    selectNode,
    closeDetail,
    focusNode,
    expandNodeById,
    setView,
    setCategory,
    setSearch,
    resetView,
    zoomIn,
    zoomOut,
    getNodes: () => nodes,
    getEdges: () => edges,
  };
})();

// 导出
if (typeof window !== 'undefined') {
  window.KnowledgeGraphDynamic = KnowledgeGraphDynamic;
}
