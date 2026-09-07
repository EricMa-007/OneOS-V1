/**
 * UniSci Platform V2 - 工作流交互式画布增强模块
 * 提供：节点拖拽、端口连线、画布缩放平移、工作流验证、执行状态机
 *
 * 依赖：workflow.js (WorkflowEditor / WorkflowManager / WorkflowNodes)
 * 使用：在WorkflowEditor.init后自动增强画布交互
 */

'use strict';

const WorkflowCanvas = (function() {
  // 内部状态
  let canvasEl = null;
  let svgEl = null;
  let nodesLayer = null;
  let scale = 1;
  let panX = 0;
  let panY = 0;
  let isDragging = false;
  let isPanning = false;
  let isConnecting = false;
  let dragNode = null;
  let dragOffset = { x: 0, y: 0 };
  let connectStart = null;
  let tempLine = null;
  let gridSize = 20;

  // =========================================================================
  // 初始化增强
  // =========================================================================
  function enhance() {
    if (typeof WorkflowEditor === 'undefined') {
      console.warn('[WorkflowCanvas] WorkflowEditor未定义，跳过增强');
      return;
    }

    // 保存原始renderCanvas
    const originalRenderCanvas = WorkflowEditor.renderCanvas.bind(WorkflowEditor);

    // 覆盖renderCanvas，添加交互事件
    WorkflowEditor.renderCanvas = function() {
      originalRenderCanvas();
      setupInteractions();
    };

    // 增强addNode，自动布局
    const originalAddNode = WorkflowEditor.addNode.bind(WorkflowEditor);
    WorkflowEditor.addNode = function(type) {
      originalAddNode(type);
      // 自动连接到最后一个节点
      const wf = this.currentWorkflow;
      if (wf.nodes.length >= 2) {
        const lastIdx = wf.nodes.length - 2;
        const newIdx = wf.nodes.length - 1;
        const exists = wf.connections.some(c => c.from === lastIdx && c.to === newIdx);
        if (!exists) {
          wf.connections.push({ from: lastIdx, to: newIdx });
        }
      }
    };

    // 增强execute，添加验证步骤
    const originalExecute = WorkflowEditor.execute ? WorkflowEditor.execute.bind(WorkflowEditor) : null;
    WorkflowEditor.execute = function() {
      const wf = this.currentWorkflow;
      if (!wf) return;

      // 验证工作流
      const result = validateWorkflow(wf);
      if (!result.valid) {
        if (typeof UI !== 'undefined' && UI.toast) {
          UI.toast.error('工作流验证失败: ' + result.errors[0]);
        }
        return;
      }
      if (result.warnings.length > 0) {
        if (typeof UI !== 'undefined' && UI.toast) {
          UI.toast(result.warnings.length + ' 个警告，开始执行');
        }
      }

      // 自动布局
      autoLayout(wf);
      this.renderCanvas();

      // 执行原始逻辑
      if (originalExecute) {
        originalExecute();
      } else if (typeof WorkflowManager !== 'undefined') {
        WorkflowManager.run(wf.id);
      }
    };

    // 增强renderToolbar，添加验证/布局/缩放按钮
    const originalRenderToolbar = WorkflowEditor.renderToolbar.bind(WorkflowEditor);
    WorkflowEditor.renderToolbar = function() {
      originalRenderToolbar();
      const container = document.getElementById('workflow-toolbar');
      if (!container) return;

      // 在工具栏添加缩放控制
      const toolbarInner = container.querySelector('div');
      if (toolbarInner && !toolbarInner.querySelector('.wf-zoom-controls')) {
        const zoomDiv = document.createElement('div');
        zoomDiv.className = 'wf-zoom-controls';
        zoomDiv.style.cssText = 'display:flex;gap:4px;align-items:center;margin-left:8px';
        zoomDiv.innerHTML = `
          <button class="icon-btn" onclick="WorkflowCanvas.zoomOut()" title="缩小" style="padding:4px 8px"><i data-lucide="minus" class="lucide" style="width:14px;height:14px"></i></button>
          <span style="font-size:11px;color:var(--text3);min-width:36px;text-align:center" id="wf-zoom-level">100%</span>
          <button class="icon-btn" onclick="WorkflowCanvas.zoomIn()" title="放大" style="padding:4px 8px"><i data-lucide="plus" class="lucide" style="width:14px;height:14px"></i></button>
          <button class="icon-btn" onclick="WorkflowCanvas.resetView()" title="重置视图" style="padding:4px 8px"><i data-lucide="maximize" class="lucide" style="width:14px;height:14px"></i></button>
          <div style="width:1px;height:20px;background:var(--border);margin:0 4px"></div>
          <button class="icon-btn" onclick="WorkflowEditor.validateAndShow()" title="验证工作流" style="padding:4px 8px"><i data-lucide="check-circle" class="lucide" style="width:14px;height:14px"></i></button>
          <button class="icon-btn" onclick="WorkflowEditor.autoLayoutAndRender()" title="自动布局" style="padding:4px 8px"><i data-lucide="layout" class="lucide" style="width:14px;height:14px"></i></button>
        `;
        toolbarInner.appendChild(zoomDiv);
        if (typeof renderIcons === 'function') renderIcons();
      }
    };

    // 添加验证并显示结果
    WorkflowEditor.validateAndShow = function() {
      const wf = this.currentWorkflow;
      if (!wf) return;
      const result = validateWorkflow(wf);
      if (result.valid && result.warnings.length === 0) {
        if (typeof UI !== 'undefined' && UI.toast) UI.toast.success('工作流验证通过');
      } else {
        const msg = result.valid ? `${result.warnings.length} 个警告` : `验证失败: ${result.errors[0]}`;
        if (typeof UI !== 'undefined' && UI.toast) UI.toast(msg);
      }
    };

    // 添加自动布局
    WorkflowEditor.autoLayoutAndRender = function() {
      const wf = this.currentWorkflow;
      if (!wf) return;
      autoLayout(wf);
      this.renderCanvas();
      if (typeof UI !== 'undefined' && UI.toast) UI.toast.success('已自动布局');
    };

    // 添加新方法
    WorkflowCanvas.validateWorkflow = validateWorkflow;
    WorkflowCanvas.autoLayout = autoLayout;
    WorkflowCanvas.zoomIn = () => setScale(scale + 0.1);
    WorkflowCanvas.zoomOut = () => setScale(scale - 0.1);
    WorkflowCanvas.resetView = () => { scale = 1; panX = 0; panY = 0; applyTransform(); };
    WorkflowCanvas.getScale = () => scale;

    console.log('[WorkflowCanvas] 工作流画布增强已加载');
  }

  // =========================================================================
  // 设置交互事件
  // =========================================================================
  function setupInteractions() {
    canvasEl = document.getElementById('workflow-canvas');
    if (!canvasEl) return;

    const innerDiv = canvasEl.querySelector('div > div') || canvasEl.querySelector('div');
    if (!innerDiv) return;

    svgEl = innerDiv.querySelector('svg');
    nodesLayer = innerDiv;

    // 确保画布可滚动
    canvasEl.style.overflow = 'auto';
    canvasEl.style.touchAction = 'none';

    // 节点拖拽
    const nodes = innerDiv.querySelectorAll('[onclick*="selectNode"]');
    nodes.forEach((nodeEl, idx) => {
      const wf = WorkflowEditor.currentWorkflow;
      if (!wf || !wf.nodes[idx]) return;

      nodeEl.style.cursor = 'grab';
      nodeEl.addEventListener('mousedown', (e) => startDragNode(e, idx, nodeEl));
      nodeEl.addEventListener('touchstart', (e) => startDragNode(e.touches[0], idx, nodeEl), { passive: false });

      // 添加输出端口
      addOutputPort(nodeEl, idx);
      // 添加输入端口
      if (idx > 0) addInputPort(nodeEl, idx);
    });

    // 画布平移（空白区域拖拽）
    canvasEl.addEventListener('mousedown', (e) => {
      if (e.target === canvasEl || e.target === innerDiv || e.target.tagName === 'svg') {
        startPan(e);
      }
    });

    // 滚轮缩放
    canvasEl.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      setScale(scale + delta);
    }, { passive: false });

    // 全局鼠标移动/释放
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('touchmove', (e) => onMouseMove(e.touches[0]), { passive: false });
    document.addEventListener('touchend', onMouseUp);

    // 双击空白添加节点
    canvasEl.addEventListener('dblclick', (e) => {
      if (e.target === canvasEl || e.target.tagName === 'svg') {
        if (typeof WorkflowEditor !== 'undefined') {
          WorkflowEditor.showAddNode();
        }
      }
    });
  }

  // =========================================================================
  // 节点拖拽
  // =========================================================================
  function startDragNode(e, nodeIdx, nodeEl) {
    e.stopPropagation();
    e.preventDefault();

    const wf = WorkflowEditor.currentWorkflow;
    if (!wf) return;

    isDragging = true;
    dragNode = nodeIdx;
    const node = wf.nodes[nodeIdx];
    const rect = nodeEl.getBoundingClientRect();
    const canvasRect = canvasEl.getBoundingClientRect();
    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;
    nodeEl.style.cursor = 'grabbing';
    nodeEl.style.zIndex = '100';
  }

  function onMouseMove(e) {
    if (isDragging && dragNode !== null) {
      const wf = WorkflowEditor.currentWorkflow;
      if (!wf) return;

      const canvasRect = canvasEl.getBoundingClientRect();
      let x = (e.clientX - canvasRect.left - dragOffset.x + canvasEl.scrollLeft) / scale;
      let y = (e.clientY - canvasRect.top - dragOffset.y + canvasEl.scrollTop) / scale;

      // 网格吸附
      x = Math.round(x / gridSize) * gridSize;
      y = Math.round(y / gridSize) * gridSize;

      wf.nodes[dragNode].x = Math.max(0, x);
      wf.nodes[dragNode].y = Math.max(0, y);

      updateConnections();
      updateNodePosition(dragNode);
    }

    if (isPanning) {
      // 平移通过scroll实现
    }

    if (isConnecting && tempLine) {
      const canvasRect = canvasEl.getBoundingClientRect();
      const x = e.clientX - canvasRect.left + canvasEl.scrollLeft;
      const y = e.clientY - canvasRect.top + canvasEl.scrollTop;
      updateTempLine(x, y);
    }
  }

  function onMouseUp() {
    if (isDragging) {
      isDragging = false;
      dragNode = null;
      // 重新渲染以更新连线
      if (typeof WorkflowEditor !== 'undefined') {
        WorkflowEditor.renderCanvas();
      }
    }
    if (isPanning) {
      isPanning = false;
    }
    if (isConnecting) {
      isConnecting = false;
      if (tempLine) {
        tempLine.remove();
        tempLine = null;
      }
      connectStart = null;
    }
  }

  function updateNodePosition(idx) {
    const wf = WorkflowEditor.currentWorkflow;
    if (!wf) return;
    const nodes = nodesLayer.querySelectorAll('[onclick*="selectNode"]');
    if (nodes[idx]) {
      nodes[idx].style.left = wf.nodes[idx].x + 'px';
      nodes[idx].style.top = wf.nodes[idx].y + 'px';
    }
  }

  // =========================================================================
  // 连线系统
  // =========================================================================
  function addOutputPort(nodeEl, nodeIdx) {
    const port = document.createElement('div');
    port.style.cssText = `
      position:absolute;right:-6px;top:50%;transform:translateY(-50%);
      width:12px;height:12px;border-radius:50%;background:#5ba3d9;
      border:2px solid white;cursor:crosshair;z-index:10;
      box-shadow:0 0 4px rgba(91,163,217,0.5);
    `;
    port.title = '拖拽连线';
    port.addEventListener('mousedown', (e) => startConnection(e, nodeIdx, 'output'));
    port.addEventListener('touchstart', (e) => startConnection(e.touches[0], nodeIdx, 'output'), { passive: false });
    nodeEl.appendChild(port);
  }

  function addInputPort(nodeEl, nodeIdx) {
    const port = document.createElement('div');
    port.style.cssText = `
      position:absolute;left:-6px;top:50%;transform:translateY(-50%);
      width:12px;height:12px;border-radius:50%;background:#ff6b4a;
      border:2px solid white;cursor:pointer;z-index:10;
      box-shadow:0 0 4px rgba(255,107,74,0.5);
    `;
    port.title = '输入端口';
    port.addEventListener('mouseup', (e) => endConnection(e, nodeIdx));
    port.addEventListener('touchend', (e) => endConnection(e, nodeIdx));
    nodeEl.appendChild(port);
  }

  function startConnection(e, nodeIdx, type) {
    e.stopPropagation();
    e.preventDefault();
    isConnecting = true;
    connectStart = { nodeIdx, type };

    // 创建临时连线
    if (svgEl) {
      tempLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      tempLine.setAttribute('stroke', '#5ba3d9');
      tempLine.setAttribute('stroke-width', '2');
      tempLine.setAttribute('stroke-dasharray', '5,5');
      tempLine.setAttribute('fill', 'none');
      svgEl.appendChild(tempLine);
    }
  }

  function endConnection(e, targetIdx) {
    if (!isConnecting || !connectStart) return;
    e.stopPropagation();

    const wf = WorkflowEditor.currentWorkflow;
    if (!wf) return;

    const fromIdx = connectStart.nodeIdx;
    if (fromIdx === targetIdx) return;

    // 检查是否已存在
    const exists = wf.connections.some(c => c.from === fromIdx && c.to === targetIdx);
    if (!exists) {
      wf.connections.push({ from: fromIdx, to: targetIdx });
      if (typeof UI !== 'undefined' && UI.toast) UI.toast.success('已连接节点');
    }

    // 清理
    if (tempLine) { tempLine.remove(); tempLine = null; }
    isConnecting = false;
    connectStart = null;

    // 重新渲染
    if (typeof WorkflowEditor !== 'undefined') WorkflowEditor.renderCanvas();
  }

  function updateTempLine(x, y) {
    if (!tempLine || !connectStart) return;
    const wf = WorkflowEditor.currentWorkflow;
    if (!wf) return;

    const fromNode = wf.nodes[connectStart.nodeIdx];
    if (!fromNode) return;

    const x1 = (fromNode.x || 0) + 160;
    const y1 = (fromNode.y || 0) + 40;
    const midX = (x1 + x) / 2;

    tempLine.setAttribute('d', `M${x1},${y1} C${midX},${y1} ${midX},${y} ${x},${y}`);
  }

  function updateConnections() {
    if (!svgEl) return;
    const wf = WorkflowEditor.currentWorkflow;
    if (!wf) return;

    const paths = svgEl.querySelectorAll('path');
    wf.connections.forEach((conn, idx) => {
      if (!paths[idx]) return;
      const from = wf.nodes[conn.from];
      const to = wf.nodes[conn.to];
      if (!from || !to) return;

      const x1 = (from.x || 0) + 160;
      const y1 = (from.y || 0) + 40;
      const x2 = (to.x || 0);
      const y2 = (to.y || 0) + 40;
      const midX = (x1 + x2) / 2;

      paths[idx].setAttribute('d', `M${x1},${y1} C${midX},${y1} ${midX},${y2} ${x2},${y2}`);
    });
  }

  // =========================================================================
  // 画布缩放/平移
  // =========================================================================
  function setScale(newScale) {
    scale = Math.max(0.3, Math.min(2, newScale));
    applyTransform();
  }

  function applyTransform() {
    if (!nodesLayer) return;
    nodesLayer.style.transform = `scale(${scale}) translate(${panX}px, ${panY}px)`;
    nodesLayer.style.transformOrigin = '0 0';
  }

  function startPan(e) {
    isPanning = true;
    canvasEl.style.cursor = 'grabbing';
  }

  // =========================================================================
  // 工作流验证
  // =========================================================================
  function validateWorkflow(wf) {
    const errors = [];
    const warnings = [];

    if (!wf || !wf.nodes || wf.nodes.length === 0) {
      errors.push('工作流为空，请添加至少一个节点');
      return { valid: false, errors, warnings };
    }

    // 检查输入节点
    const hasInput = wf.nodes.some(n => {
      const type = getAllNodeTypesSafe().find(t => t.type === n.type);
      return type?.category === 'input';
    });
    if (!hasInput) warnings.push('建议添加输入节点');

    // 检查输出节点
    const hasOutput = wf.nodes.some(n => {
      const type = getAllNodeTypesSafe().find(t => t.type === n.type);
      return type?.category === 'output';
    });
    if (!hasOutput) warnings.push('建议添加输出节点');

    // DAG环检测
    if (hasCycle(wf)) {
      errors.push('工作流存在循环依赖，无法执行');
    }

    // 检查孤立节点
    const connectedNodes = new Set();
    wf.connections.forEach(c => {
      connectedNodes.add(c.from);
      connectedNodes.add(c.to);
    });
    wf.nodes.forEach((n, idx) => {
      if (!connectedNodes.has(idx) && wf.nodes.length > 1) {
        warnings.push(`节点 "${getAllNodeTypesSafe().find(t => t.type === n.type)?.name || n.type}" 未连接`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  function hasCycle(wf) {
    const adj = {};
    wf.connections.forEach(c => {
      if (!adj[c.from]) adj[c.from] = [];
      adj[c.from].push(c.to);
    });

    const visited = new Set();
    const recStack = new Set();

    function dfs(node) {
      visited.add(node);
      recStack.add(node);
      for (const neighbor of (adj[node] || [])) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) return true;
        } else if (recStack.has(neighbor)) {
          return true;
        }
      }
      recStack.delete(node);
      return false;
    }

    for (let i = 0; i < wf.nodes.length; i++) {
      if (!visited.has(i)) {
        if (dfs(i)) return true;
      }
    }
    return false;
  }

  // =========================================================================
  // 自动布局
  // =========================================================================
  function autoLayout(wf) {
    if (!wf || !wf.nodes) return;

    // 简单的层级布局
    const levels = {};
    const visited = new Set();

    function getLevel(nodeIdx, level = 0) {
      if (visited.has(nodeIdx)) return levels[nodeIdx] || 0;
      visited.add(nodeIdx);
      levels[nodeIdx] = level;

      const outgoing = wf.connections.filter(c => c.from === nodeIdx);
      outgoing.forEach(c => getLevel(c.to, level + 1));
    }

    for (let i = 0; i < wf.nodes.length; i++) {
      if (!visited.has(i)) getLevel(i);
    }

    // 按层级排列
    const levelNodes = {};
    Object.entries(levels).forEach(([idx, level]) => {
      if (!levelNodes[level]) levelNodes[level] = [];
      levelNodes[level].push(parseInt(idx));
    });

    Object.entries(levelNodes).forEach(([level, indices]) => {
      indices.forEach((idx, i) => {
        wf.nodes[idx].x = parseInt(level) * 220 + 50;
        wf.nodes[idx].y = i * 120 + 50;
      });
    });
  }

  // =========================================================================
  // 工具函数
  // =========================================================================
  function getAllNodeTypesSafe() {
    if (typeof getAllNodeTypes === 'function') return getAllNodeTypes();
    if (typeof WorkflowNodes !== 'undefined') {
      return Object.values(WorkflowNodes).flat();
    }
    return [];
  }

  // =========================================================================
  // 公开API
  // =========================================================================
  return {
    enhance,
    validateWorkflow,
    autoLayout,
    zoomIn: () => setScale(scale + 0.1),
    zoomOut: () => setScale(scale - 0.1),
    resetView: () => { scale = 1; panX = 0; panY = 0; applyTransform(); },
    getScale: () => scale,
  };
})();

// 自动增强
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => WorkflowCanvas.enhance(), 500);
  });
} else {
  setTimeout(() => WorkflowCanvas.enhance(), 500);
}

// 导出
if (typeof window !== 'undefined') {
  window.WorkflowCanvas = WorkflowCanvas;
}
