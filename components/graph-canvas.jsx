// ============================================
// OneOS V2 - 知识图谱 Canvas 渲染组件
// 集成力导向布局、拖拽、缩放、平移、节点交互
// ============================================

function GraphCanvas({
  nodes = [],
  edges = [],
  width = 800,
  height = 600,
  onNodeClick,
  onNodeHover,
  isNight = false,
  showLabels = true,
  backgroundColor,
}) {
  const canvasRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const layoutRef = React.useRef(null);
  const [hoveredNode, setHoveredNode] = React.useState(null);
  const [selectedNode, setSelectedNode] = React.useState(null);
  const [stats, setStats] = React.useState(null);

  // 视图状态
  const viewRef = React.useRef({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    isDragging: false,
    isPanning: false,
    dragNode: null,
    lastX: 0,
    lastY: 0,
  });

  // 初始化力导向布局
  React.useEffect(() => {
    if (!window.ForceLayout || nodes.length === 0) return;

    const layout = new window.ForceLayout.ForceDirectedLayout(nodes, edges, {
      width, height,
      repulsion: 150,
      attraction: 0.008,
      centerGravity: 0.02,
      damping: 0.85,
      maxVelocity: 8,
      animated: true,
    });

    layout.onUpdate = (layoutNodes, layoutEdges, result) => {
      renderGraph(layoutNodes, layoutEdges);
    };

    layout.onComplete = (layoutNodes, layoutEdges, result) => {
      console.log('[GraphCanvas] 布局收敛，迭代次数:', result.iteration);
    };

    layoutRef.current = layout;
    layout.start();

    // 计算统计
    const graphStats = window.ForceLayout.getGraphStats(nodes, edges);
    setStats(graphStats);

    return () => {
      layout.destroy();
    };
  }, [nodes, edges, width, height]);

  // 渲染图谱
  const renderGraph = React.useCallback((layoutNodes, layoutEdges) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const view = viewRef.current;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 背景
    ctx.fillStyle = backgroundColor || (isNight ? '#1a1a1a' : '#fafafa');
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 保存状态并应用视图变换
    ctx.save();
    ctx.translate(view.offsetX, view.offsetY);
    ctx.scale(view.scale, view.scale);

    // 绘制边
    layoutEdges.forEach(edge => {
      const { source, target } = edge;
      const isHighlighted = hoveredNode && (source.id === hoveredNode.id || target.id === hoveredNode.id);
      const isSelected = selectedNode && (source.id === selectedNode.id || target.id === selectedNode.id);

      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.strokeStyle = isHighlighted || isSelected
        ? (isNight ? 'rgba(124,111,240,0.6)' : 'rgba(124,111,240,0.4)')
        : (isNight ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)');
      ctx.lineWidth = isHighlighted || isSelected ? 2 : 1;
      ctx.stroke();
    });

    // 绘制节点
    layoutNodes.forEach(node => {
      const isHovered = hoveredNode && node.id === hoveredNode.id;
      const isSelected = selectedNode && node.id === selectedNode.id;
      const isDimmed = hoveredNode && !isHovered && !layoutEdges.some(e =>
        (e.source.id === hoveredNode.id && e.target.id === node.id) ||
        (e.target.id === hoveredNode.id && e.source.id === node.id)
      );

      // 节点阴影
      if (isHovered || isSelected) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 4, 0, Math.PI * 2);
        ctx.fillStyle = `${node.color}30`;
        ctx.fill();
      }

      // 节点圆
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = isDimmed ? `${node.color}40` : node.color;
      ctx.fill();
      ctx.strokeStyle = isSelected ? '#fff' : (isNight ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.8)');
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.stroke();

      // 节点标签
      if (showLabels && (isHovered || isSelected || view.scale > 0.8)) {
        ctx.font = `${isHovered || isSelected ? 'bold ' : ''}12px 'Inter', sans-serif`;
        ctx.fillStyle = isDimmed
          ? (isNight ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)')
          : (isNight ? '#fff' : '#2D3436');
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        const label = node.label.length > 10 ? node.label.slice(0, 10) + '...' : node.label;
        ctx.fillText(label, node.x, node.y + node.radius + 4);
      }
    });

    ctx.restore();
  }, [isNight, showLabels, hoveredNode, selectedNode, backgroundColor]);

  // 坐标转换（屏幕坐标 -> 画布坐标）
  const screenToCanvas = React.useCallback((screenX, screenY) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const view = viewRef.current;
    return {
      x: (screenX - rect.left - view.offsetX) / view.scale,
      y: (screenY - rect.top - view.offsetY) / view.scale,
    };
  }, []);

  // 查找节点
  const findNodeAt = React.useCallback((x, y) => {
    if (!layoutRef.current) return null;
    return layoutRef.current.nodes.find(node => {
      const dx = x - node.x;
      const dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) <= node.radius;
    });
  }, []);

  // 鼠标事件
  const handleMouseDown = React.useCallback((e) => {
    const pos = screenToCanvas(e.clientX, e.clientY);
    const node = findNodeAt(pos.x, pos.y);
    const view = viewRef.current;

    if (node) {
      view.isDragging = true;
      view.dragNode = node;
      layoutRef.current?.fixNode(node.id, pos.x, pos.y);
    } else {
      view.isPanning = true;
    }
    view.lastX = e.clientX;
    view.lastY = e.clientY;
  }, [screenToCanvas, findNodeAt]);

  const handleMouseMove = React.useCallback((e) => {
    const view = viewRef.current;
    const dx = e.clientX - view.lastX;
    const dy = e.clientY - view.lastY;

    if (view.isDragging && view.dragNode) {
      const pos = screenToCanvas(e.clientX, e.clientY);
      layoutRef.current?.fixNode(view.dragNode.id, pos.x, pos.y);
    } else if (view.isPanning) {
      view.offsetX += dx;
      view.offsetY += dy;
    } else {
      // 悬停检测
      const pos = screenToCanvas(e.clientX, e.clientY);
      const node = findNodeAt(pos.x, pos.y);
      setHoveredNode(node || null);
      if (onNodeHover) onNodeHover(node || null);
      canvasRef.current.style.cursor = node ? 'pointer' : 'grab';
    }

    view.lastX = e.clientX;
    view.lastY = e.clientY;
  }, [screenToCanvas, findNodeAt, onNodeHover]);

  const handleMouseUp = React.useCallback((e) => {
    const view = viewRef.current;
    if (view.isDragging && view.dragNode) {
      layoutRef.current?.releaseNode(view.dragNode.id);
      // 如果没有移动，视为点击
      if (Math.abs(e.clientX - view.lastX) < 3 && Math.abs(e.clientY - view.lastY) < 3) {
        setSelectedNode(view.dragNode);
        if (onNodeClick) onNodeClick(view.dragNode);
      }
    }
    view.isDragging = false;
    view.isPanning = false;
    view.dragNode = null;
  }, [onNodeClick]);

  const handleWheel = React.useCallback((e) => {
    e.preventDefault();
    const view = viewRef.current;
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.2, Math.min(5, view.scale * zoomFactor));

    // 以鼠标位置为中心缩放
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    view.offsetX = mouseX - (mouseX - view.offsetX) * (newScale / view.scale);
    view.offsetY = mouseY - (mouseY - view.offsetY) * (newScale / view.scale);
    view.scale = newScale;
  }, []);

  // 重置视图
  const resetView = React.useCallback(() => {
    const view = viewRef.current;
    view.scale = 1;
    view.offsetX = 0;
    view.offsetY = 0;
    setSelectedNode(null);
  }, []);

  // 重新布局
  const relayout = React.useCallback(() => {
    if (layoutRef.current) {
      layoutRef.current.reset();
      layoutRef.current.start();
    }
  }, []);

  // 适配容器大小
  React.useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      if (layoutRef.current) {
        layoutRef.current.updateConfig({ width: rect.width, height: rect.height });
      }
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ display: 'block', cursor: 'grab' }}
      />

      {/* 控制按钮 */}
      <div style={{
        position: 'absolute',
        top: 12,
        right: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}>
        <button
          onClick={() => { viewRef.current.scale = Math.min(5, viewRef.current.scale * 1.2); }}
          style={controlButtonStyle(isNight)}
          title="放大"
        >+</button>
        <button
          onClick={() => { viewRef.current.scale = Math.max(0.2, viewRef.current.scale * 0.8); }}
          style={controlButtonStyle(isNight)}
          title="缩小"
        >−</button>
        <button
          onClick={resetView}
          style={controlButtonStyle(isNight)}
          title="重置视图"
        >⌂</button>
        <button
          onClick={relayout}
          style={controlButtonStyle(isNight)}
          title="重新布局"
        >↻</button>
      </div>

      {/* 统计信息 */}
      {stats && (
        <div style={{
          position: 'absolute',
          bottom: 12,
          left: 12,
          background: isNight ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)',
          padding: '8px 12px',
          borderRadius: 8,
          fontSize: 11,
          color: isNight ? '#fff' : '#333',
          fontFamily: "'JetBrains Mono', monospace",
          display: 'flex',
          gap: 16,
        }}>
          <span>节点: {stats.nodeCount}</span>
          <span>边: {stats.edgeCount}</span>
          <span>连通: {stats.components}</span>
          <span>密度: {stats.density.toFixed(3)}</span>
        </div>
      )}

      {/* 悬停提示 */}
      {hoveredNode && (
        <div style={{
          position: 'absolute',
          top: 12,
          left: 12,
          background: isNight ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.95)',
          padding: '8px 12px',
          borderRadius: 8,
          fontSize: 12,
          color: isNight ? '#fff' : '#333',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          maxWidth: 200,
        }}>
          <div style={{ fontWeight: 600, marginBottom: 2 }}>{hoveredNode.label}</div>
          <div style={{ fontSize: 10, opacity: 0.7 }}>点击查看详情 · 拖拽移动</div>
        </div>
      )}
    </div>
  );
}

function controlButtonStyle(isNight) {
  return {
    width: 32,
    height: 32,
    border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
    borderRadius: 6,
    background: isNight ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)',
    color: isNight ? '#fff' : '#333',
    fontSize: 16,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
  };
}

if (typeof window !== 'undefined') {
  window.GraphCanvas = GraphCanvas;
}

console.log('[GraphCanvas] 知识图谱 Canvas 渲染组件已加载');
