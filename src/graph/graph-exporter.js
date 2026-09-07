// ============================================
// OneOS V2 - 知识图谱导出工具
// 支持 PNG / SVG / JSON 导出
// ============================================

(function() {
  'use strict';

  /**
   * 导出图谱为PNG图片
   * @param {HTMLCanvasElement} canvas - Canvas元素
   * @param {Object} options - 导出选项
   * @returns {string} 图片数据URL
   */
  function exportPNG(canvas, options = {}) {
    const {
      filename = 'oneos-graph.png',
      backgroundColor = '#ffffff',
      scale = 2,
      padding = 40,
    } = options;

    // 创建高分辨率Canvas
    const exportCanvas = document.createElement('canvas');
    const ctx = exportCanvas.getContext('2d');

    // 计算图谱边界
    const bounds = calculateGraphBounds(canvas);
    const width = (bounds.maxX - bounds.minX + padding * 2) * scale;
    const height = (bounds.maxY - bounds.minY + padding * 2) * scale;

    exportCanvas.width = width;
    exportCanvas.height = height;

    // 背景
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // 缩放并平移
    ctx.scale(scale, scale);
    ctx.translate(padding - bounds.minX, padding - bounds.minY);

    // 绘制图谱
    drawGraphToContext(ctx, canvas);

    // 下载
    const dataUrl = exportCanvas.toDataURL('image/png');
    downloadDataUrl(dataUrl, filename);
    return dataUrl;
  }

  /**
   * 导出图谱为SVG
   * @param {Array} nodes - 节点列表
   * @param {Array} edges - 边列表
   * @param {Object} options - 导出选项
   * @returns {string} SVG字符串
   */
  function exportSVG(nodes, edges, options = {}) {
    const {
      filename = 'oneos-graph.svg',
      backgroundColor = '#ffffff',
      width = 1200,
      height = 800,
      padding = 40,
    } = options;

    // 计算边界
    const bounds = calculateNodeBounds(nodes);
    const scaleX = (width - padding * 2) / (bounds.maxX - bounds.minX || 1);
    const scaleY = (height - padding * 2) / (bounds.maxY - bounds.minY || 1);
    const scale = Math.min(scaleX, scaleY);

    const svgParts = [];
    svgParts.push(`<?xml version="1.0" encoding="UTF-8"?>`);
    svgParts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`);
    svgParts.push(`<rect width="100%" height="100%" fill="${backgroundColor}"/>`);

    // 定义箭头
    svgParts.push(`<defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#999"/></marker></defs>`);

    const transformX = (x) => padding + (x - bounds.minX) * scale;
    const transformY = (y) => padding + (y - bounds.minY) * scale;

    // 绘制边
    edges.forEach(edge => {
      const source = nodes.find(n => n.id === edge.source);
      const target = nodes.find(n => n.id === edge.target);
      if (!source || !target) return;
      const x1 = transformX(source.x);
      const y1 = transformY(source.y);
      const x2 = transformX(target.x);
      const y2 = transformY(target.y);
      svgParts.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(0,0,0,0.2)" stroke-width="${edge.weight || 1}"/>`);
    });

    // 绘制节点
    nodes.forEach(node => {
      const cx = transformX(node.x);
      const cy = transformY(node.y);
      const r = (node.radius || 20) * scale;
      svgParts.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${node.color || '#7C6FF0'}" stroke="white" stroke-width="2"/>`);
      if (node.label) {
        svgParts.push(`<text x="${cx}" y="${cy + r + 14}" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#333">${escapeXml(node.label)}</text>`);
      }
    });

    svgParts.push(`</svg>`);
    const svgString = svgParts.join('\n');

    // 下载
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    downloadDataUrl(url, filename);
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    return svgString;
  }

  /**
   * 导出图谱为JSON
   * @param {Array} nodes - 节点列表
   * @param {Array} edges - 边列表
   * @param {Object} options - 导出选项
   * @returns {Object} JSON数据
   */
  function exportJSON(nodes, edges, options = {}) {
    const { filename = 'oneos-graph.json' } = options;
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      nodes: nodes.map(n => ({
        id: n.id,
        label: n.label,
        type: n.type || 'note',
        color: n.color,
        radius: n.radius,
        x: Math.round(n.x * 100) / 100,
        y: Math.round(n.y * 100) / 100,
      })),
      edges: edges.map(e => ({
        source: e.source,
        target: e.target,
        weight: e.weight || 1,
      })),
    };

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    downloadDataUrl(url, filename);
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    return data;
  }

  // ============================================
  // 内部工具函数
  // ============================================

  function calculateGraphBounds(canvas) {
    // 从Canvas的data属性获取节点位置
    const graphData = canvas.__graphData || { nodes: [], edges: [] };
    return calculateNodeBounds(graphData.nodes);
  }

  function calculateNodeBounds(nodes) {
    if (!nodes || nodes.length === 0) {
      return { minX: 0, minY: 0, maxX: 800, maxY: 600 };
    }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach(node => {
      const r = node.radius || 20;
      minX = Math.min(minX, node.x - r);
      minY = Math.min(minY, node.y - r);
      maxX = Math.max(maxX, node.x + r);
      maxY = Math.max(maxY, node.y + r);
    });
    return { minX, minY, maxX, maxY };
  }

  function drawGraphToContext(ctx, sourceCanvas) {
    // 直接绘制源Canvas
    ctx.drawImage(sourceCanvas, 0, 0);
  }

  function downloadDataUrl(dataUrl, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function escapeXml(str) {
    return str.replace(/[<>&'"]/g, c => ({
      '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;'
    }[c]));
  }

  // ============================================
  // 暴露 API
  // ============================================

  const GraphExporter = {
    exportPNG,
    exportSVG,
    exportJSON,
  };

  if (typeof window !== 'undefined') {
    window.GraphExporter = GraphExporter;
  }

  console.log('[GraphExporter] 知识图谱导出工具已加载');

})();
