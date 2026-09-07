// ============================================
// OneOS V2 - 增强版知识图谱查看器
// 集成样式定制、导出、性能优化
// ============================================

function GraphViewer({
  notes = [],
  isNight = false,
  onNodeClick,
}) {
  const canvasRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const layoutRef = React.useRef(null);
  const [graphData, setGraphData] = React.useState({ nodes: [], edges: [] });
  const [hoveredNode, setHoveredNode] = React.useState(null);
  const [selectedNode, setSelectedNode] = React.useState(null);
  const [stats, setStats] = React.useState(null);
  const [showStylePanel, setShowStylePanel] = React.useState(false);
  const [showExportMenu, setShowExportMenu] = React.useState(false);

  // 样式配置
  const [styleConfig, setStyleConfig] = React.useState({
    nodeColor: '#7C6FF0',
    nodeSize: 20,
    edgeColor: 'rgba(124,111,240,0.3)',
    edgeWidth: 1,
    backgroundColor: isNight ? '#1a1a1a' : '#fafafa',
    showLabels: true,
    layoutType: 'force', // force | circular | grid
  });

  // 视图状态
  const viewRef = React.useRef({
    scale: 1, offsetX: 0, offsetY: 0,
    isDragging: false, isPanning: false, dragNode: null,
    lastX: 0, lastY: 0,
  });

  // 从笔记构建图谱数据
  React.useEffect(() => {
    if (!window.GraphDataService || notes.length === 0) {
      // 使用模拟数据
      const mockData = generateMockGraphData();
      setGraphData(mockData);
      return;
    }
    const data = window.GraphDataService.buildGraphFromNotes(notes, {
      includeTags: true,
      includeBacklinks: true,
      maxNodes: 100,
    });
    setGraphData(data);
  }, [notes]);

  // 初始化力导向布局
  React.useEffect(() => {
    if (!window.ForceLayout || graphData.nodes.length === 0) return;

    const layout = new window.ForceLayout.ForceDirectedLayout(
      graphData.nodes, graphData.edges,
      { width: 800, height: 600, repulsion: 150, attraction: 0.008, centerGravity: 0.02, damping: 0.85, maxVelocity: 8 }
    );

    layout.onUpdate = (nodes, edges) => renderGraph(nodes, edges);
    layout.onComplete = () => console.log('[GraphViewer] 布局收敛');
    layoutRef.current = layout;
    layout.start();

    if (window.GraphDataService) {
      setStats(window.GraphDataService.getGraphStats(graphData.nodes, graphData.edges));
    }

    return () => layout.destroy();
  }, [graphData]);

  // 渲染图谱
  const renderGraph = React.useCallback((layoutNodes, layoutEdges) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const view = viewRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = styleConfig.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(view.offsetX, view.offsetY);
    ctx.scale(view.scale, view.scale);

    // 绘制边
    layoutEdges.forEach(edge => {
      const { source, target } = edge;
      const isHighlighted = hoveredNode && (source.id === hoveredNode.id || target.id === hoveredNode.id);
      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.strokeStyle = isHighlighted ? styleConfig.nodeColor : styleConfig.edgeColor;
      ctx.lineWidth = isHighlighted ? styleConfig.edgeWidth * 2 : styleConfig.edgeWidth;
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

      if (isHovered || isSelected) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 6, 0, Math.PI * 2);
        ctx.fillStyle = `${node.color}30`;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = isDimmed ? `${node.color}40` : node.color;
      ctx.fill();
      ctx.strokeStyle = isSelected ? '#fff' : 'rgba(255,255,255,0.8)';
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.stroke();

      if (styleConfig.showLabels && (isHovered || isSelected || view.scale > 0.8)) {
        ctx.font = `${isHovered || isSelected ? 'bold ' : ''}12px 'Inter', sans-serif`;
        ctx.fillStyle = isDimmed ? 'rgba(0,0,0,0.3)' : (isNight ? '#fff' : '#2D3436');
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        const label = node.label.length > 12 ? node.label.slice(0, 12) + '...' : node.label;
        ctx.fillText(label, node.x, node.y + node.radius + 4);
      }
    });

    ctx.restore();

    // 保存图谱数据用于导出
    canvas.__graphData = { nodes: layoutNodes, edges: layoutEdges };
  }, [isNight, hoveredNode, selectedNode, styleConfig]);

  // 坐标转换
  const screenToCanvas = React.useCallback((screenX, screenY) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const view = viewRef.current;
    return { x: (screenX - rect.left - view.offsetX) / view.scale, y: (screenY - rect.top - view.offsetY) / view.scale };
  }, []);

  const findNodeAt = React.useCallback((x, y) => {
    if (!layoutRef.current) return null;
    return layoutRef.current.nodes.find(node => {
      const dx = x - node.x; const dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) <= node.radius;
    });
  }, []);

  // 鼠标事件
  const handleMouseDown = (e) => {
    const pos = screenToCanvas(e.clientX, e.clientY);
    const node = findNodeAt(pos.x, pos.y);
    const view = viewRef.current;
    if (node) { view.isDragging = true; view.dragNode = node; layoutRef.current?.fixNode(node.id, pos.x, pos.y); }
    else { view.isPanning = true; }
    view.lastX = e.clientX; view.lastY = e.clientY;
  };

  const handleMouseMove = (e) => {
    const view = viewRef.current;
    const dx = e.clientX - view.lastX; const dy = e.clientY - view.lastY;
    if (view.isDragging && view.dragNode) {
      const pos = screenToCanvas(e.clientX, e.clientY);
      layoutRef.current?.fixNode(view.dragNode.id, pos.x, pos.y);
    } else if (view.isPanning) { view.offsetX += dx; view.offsetY += dy; }
    else {
      const pos = screenToCanvas(e.clientX, e.clientY);
      const node = findNodeAt(pos.x, pos.y);
      setHoveredNode(node || null);
      canvasRef.current.style.cursor = node ? 'pointer' : 'grab';
    }
    view.lastX = e.clientX; view.lastY = e.clientY;
  };

  const handleMouseUp = (e) => {
    const view = viewRef.current;
    if (view.isDragging && view.dragNode) {
      layoutRef.current?.releaseNode(view.dragNode.id);
      if (Math.abs(e.clientX - view.lastX) < 3 && Math.abs(e.clientY - view.lastY) < 3) {
        setSelectedNode(view.dragNode);
        if (onNodeClick) onNodeClick(view.dragNode);
      }
    }
    view.isDragging = false; view.isPanning = false; view.dragNode = null;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const view = viewRef.current;
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.2, Math.min(5, view.scale * zoomFactor));
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left; const mouseY = e.clientY - rect.top;
    view.offsetX = mouseX - (mouseX - view.offsetX) * (newScale / view.scale);
    view.offsetY = mouseY - (mouseY - view.offsetY) * (newScale / view.scale);
    view.scale = newScale;
  };

  // 导出功能
  const handleExport = (type) => {
    if (!window.GraphExporter || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const graphData = canvas.__graphData || { nodes: [], edges: [] };
    if (type === 'png') window.GraphExporter.exportPNG(canvas, { backgroundColor: styleConfig.backgroundColor });
    else if (type === 'svg') window.GraphExporter.exportSVG(graphData.nodes, graphData.edges, { backgroundColor: styleConfig.backgroundColor });
    else if (type === 'json') window.GraphExporter.exportJSON(graphData.nodes, graphData.edges);
    setShowExportMenu(false);
  };

  // 重置视图
  const resetView = () => {
    const view = viewRef.current;
    view.scale = 1; view.offsetX = 0; view.offsetY = 0;
    setSelectedNode(null);
  };

  const relayout = () => {
    if (layoutRef.current) { layoutRef.current.reset(); layoutRef.current.start(); }
  };

  // 适配容器大小
  React.useEffect(() => {
    const canvas = canvasRef.current; const container = containerRef.current;
    if (!canvas || !container) return;
    const resize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width; canvas.height = rect.height;
      if (layoutRef.current) layoutRef.current.updateConfig({ width: rect.width, height: rect.height });
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const btnStyle = {
    width: 32, height: 32, border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
    borderRadius: 6, background: isNight ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)',
    color: isNight ? '#fff' : '#333', fontSize: 14, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600,
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <canvas ref={canvasRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onWheel={handleWheel}
        style={{ display: 'block', cursor: 'grab' }} />

      {/* 控制按钮 */}
      <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button onClick={() => { viewRef.current.scale = Math.min(5, viewRef.current.scale * 1.2); }} style={btnStyle} title="放大">+</button>
        <button onClick={() => { viewRef.current.scale = Math.max(0.2, viewRef.current.scale * 0.8); }} style={btnStyle} title="缩小">−</button>
        <button onClick={resetView} style={btnStyle} title="重置视图">⌂</button>
        <button onClick={relayout} style={btnStyle} title="重新布局">↻</button>
        <button onClick={() => setShowStylePanel(!showStylePanel)} style={{ ...btnStyle, background: showStylePanel ? styleConfig.nodeColor : btnStyle.background, color: showStylePanel ? '#fff' : btnStyle.color }} title="样式设置">⚙</button>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowExportMenu(!showExportMenu)} style={btnStyle} title="导出">⬇</button>
          {showExportMenu && (
            <div style={{ position: 'absolute', right: 40, top: 0, background: isNight ? '#222' : '#fff', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', overflow: 'hidden', minWidth: 100 }}>
              {[['png', 'PNG 图片'], ['svg', 'SVG 矢量'], ['json', 'JSON 数据']].map(([type, label]) => (
                <button key={type} onClick={() => handleExport(type)} style={{ display: 'block', width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', color: isNight ? '#fff' : '#333', cursor: 'pointer', textAlign: 'left', fontSize: 12 }}>{label}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 样式设置面板 */}
      {showStylePanel && (
        <div style={{ position: 'absolute', top: 12, right: 56, background: isNight ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)', borderRadius: 12, padding: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', width: 220, zIndex: 100 }}>
          <div style={{ fontWeight: 700, marginBottom: 12, color: isNight ? '#fff' : '#333', fontSize: 13 }}>图谱样式</div>
          {[
            ['nodeColor', '节点颜色', 'color'],
            ['edgeColor', '连线颜色', 'color'],
            ['backgroundColor', '背景颜色', 'color'],
            ['nodeSize', '节点大小', 'range'],
            ['edgeWidth', '连线粗细', 'range'],
          ].map(([key, label, type]) => (
            <div key={key} style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', fontSize: 11, color: isNight ? '#aaa' : '#666', marginBottom: 4 }}>{label}</label>
              {type === 'color' ? (
                <input type="color" value={styleConfig[key]} onChange={(e) => setStyleConfig({ ...styleConfig, [key]: e.target.value })} style={{ width: '100%', height: 28, border: 'none', borderRadius: 4, cursor: 'pointer' }} />
              ) : (
                <input type="range" min="1" max="50" value={styleConfig[key]} onChange={(e) => setStyleConfig({ ...styleConfig, [key]: Number(e.target.value) })} style={{ width: '100%' }} />
              )}
            </div>
          ))}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: isNight ? '#fff' : '#333', cursor: 'pointer' }}>
            <input type="checkbox" checked={styleConfig.showLabels} onChange={(e) => setStyleConfig({ ...styleConfig, showLabels: e.target.checked })} />
            显示标签
          </label>
        </div>
      )}

      {/* 统计信息 */}
      {stats && (
        <div style={{ position: 'absolute', bottom: 12, left: 12, background: isNight ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)', padding: '8px 12px', borderRadius: 8, fontSize: 11, color: isNight ? '#fff' : '#333', fontFamily: "'JetBrains Mono', monospace", display: 'flex', gap: 16 }}>
          <span>节点: {stats.nodeCount}</span>
          <span>边: {stats.edgeCount}</span>
          <span>连通: {stats.components}</span>
        </div>
      )}

      {/* 悬停提示 */}
      {hoveredNode && (
        <div style={{ position: 'absolute', top: 12, left: 12, background: isNight ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.95)', padding: '8px 12px', borderRadius: 8, fontSize: 12, color: isNight ? '#fff' : '#333', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', maxWidth: 200 }}>
          <div style={{ fontWeight: 600, marginBottom: 2 }}>{hoveredNode.label}</div>
          <div style={{ fontSize: 10, opacity: 0.7 }}>{hoveredNode.type || 'note'} · 点击查看</div>
        </div>
      )}
    </div>
  );
}

// 生成模拟图谱数据
function generateMockGraphData() {
  const topics = [
    { id: 't1', label: '知识升维', color: '#7C6FF0' },
    { id: 't2', label: '存在主义', color: '#4ECDC4' },
    { id: 't3', label: '注意力', color: '#FFA07A' },
    { id: 't4', label: 'OneOS哲学', color: '#6BCB77' },
    { id: 't5', label: '书法美学', color: '#FFD93D' },
    { id: 't6', label: '人类节点', color: '#FD79A8' },
  ];
  const nodes = topics.map(t => ({ ...t, radius: 25, type: 'topic' }));
  const edges = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (Math.random() > 0.5) edges.push({ source: nodes[i].id, target: nodes[j].id, weight: 1 });
    }
  }
  return { nodes, edges };
}

if (typeof window !== 'undefined') {
  window.GraphViewer = GraphViewer;
}

console.log('[GraphViewer] 增强版知识图谱查看器已加载');
