// ============================================
// 知识图谱视图 — 年轻化明亮版
// 明亮薄荷绿画布 + 玻璃拟态节点 + 彩色连线
// ============================================

function GraphView({ density, isNight, textColor, subTextColor, themeBg }) {
  const dt = DESIGN_TOKENS;
  // 响应式
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [activeNode, setActiveNode] = React.useState(null);
  const [viewMode, setViewMode] = React.useState('overview'); // overview | topic | human | search

  // 模拟图谱数据
  const topics = [
    { id: 't1', label: '知识升维', count: 12, color: dt.gradients.primary },
    { id: 't2', label: '存在主义', count: 8, color: dt.gradients.teal },
    { id: 't3', label: '注意力', count: 6, color: dt.gradients.orange },
    { id: 't4', label: 'OneOS产品哲学', count: 15, color: dt.gradients.green },
    { id: 't5', label: '书法美学', count: 5, color: dt.gradients.gold },
    { id: 't6', label: '人类节点', count: 7, color: dt.gradients.pink },
  ];

  const nodes = React.useMemo(() => {
    const arr = [];
    for (let i = 0; i < 40; i++) {
      const angle = (i / 40) * Math.PI * 2 + Math.random() * 0.5;
      const radius = 80 + Math.random() * 200;
      arr.push({
        id: `n${i}`,
        x: 400 + Math.cos(angle) * radius,
        y: 350 + Math.sin(angle) * radius,
        size: 8 + Math.random() * 16,
        type: ['note', 'card', 'summary'][Math.floor(Math.random() * 3)],
      });
    }
    return arr;
  }, []);

  const humanNodes = [
    { id: 'h1', name: '何思齐', role: '产品合伙人', topics: 5, x: 150, y: 200, color: dt.gradients.orange },
    { id: 'h2', name: '林知秋', role: '哲学研究员', topics: 4, x: 650, y: 180, color: dt.gradients.teal },
    { id: 'h3', name: '苏晚晴', role: '心理咨询师', topics: 3, x: 120, y: 450, color: dt.gradients.pink },
    { id: 'h4', name: '沈听澜', role: '作家', topics: 2, x: 680, y: 480, color: dt.gradients.lavender },
  ];

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
      background: themeBg,
      position: 'relative',
      overflow: 'hidden',
      animation: 'pageEnter 400ms cubic-bezier(0.2, 0.8, 0.2, 1) both',
    }}>
      {/* 工具栏 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: isMobile ? '10px 12px' : '12px 20px',
        borderBottom: '1px solid rgba(45, 55, 72, 0.06)',
        background: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(12px) saturate(180%)',
        WebkitBackdropFilter: 'blur(12px) saturate(180%)',
        zIndex: 10,
        flexWrap: isMobile ? 'wrap' : 'nowrap',
      }}>
        <div style={{
          display: 'flex',
          background: 'rgba(45, 55, 72, 0.05)',
          borderRadius: '14px',
          padding: 4,
          gap: 2,
        }}>
          {[
            { id: 'overview', label: '总览' },
            { id: 'topic', label: '话题' },
            { id: 'human', label: '人' },
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setViewMode(m.id)}
              style={{
                padding: '6px 16px',
                borderRadius: '12px',
                border: 'none',
                background: viewMode === m.id ? '#fff' : 'transparent',
                color: viewMode === m.id ? dt.colors.textPrimary : dt.colors.textSecondary,
                fontSize: 12,
                fontWeight: viewMode === m.id ? 700 : 600,
                fontFamily: dt.fonts.rounded,
                cursor: 'pointer',
                transition: 'all 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                boxShadow: viewMode === m.id ? '0 2px 8px rgba(45, 55, 72, 0.06)' : 'none',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <button style={{
          width: 34, height: 34,
          borderRadius: '12px',
          border: '1px solid rgba(45, 55, 72, 0.08)',
          background: '#fff',
          color: dt.colors.textSecondary,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}>+</button>
        <button style={{
          width: 34, height: 34,
          borderRadius: '12px',
          border: '1px solid rgba(45, 55, 72, 0.08)',
          background: '#fff',
          color: dt.colors.textSecondary,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}>−</button>
        <span
          className="concept-hint"
          title={CONCEPT_HINTS['knowledge-graph']}
        >?</span>
      </div>

      {/* 图谱画布 */}
      <div style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at 30% 20%, rgba(124,111,240,0.08), transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(78,205,196,0.08), transparent 60%)',
      }}>
        {/* V2: 增强版 Canvas 力导向图谱（优先使用） */}
        {window.GraphViewer ? (
          <GraphViewer
            isNight={isNight}
            onNodeClick={(node) => setActiveNode(node)}
          />
        ) : window.GraphCanvas && window.ForceLayout ? (
          <GraphCanvas
            nodes={[
              ...topics.map(t => ({ id: t.id, label: t.label, color: t.color, radius: 30 })),
              ...humanNodes.map(h => ({ id: h.id, label: h.name, color: h.color, radius: 25 })),
            ]}
            edges={[
              // 话题之间的连接
              ...topics.slice(0, -1).map((t, i) => ({ source: t.id, target: topics[i + 1].id, weight: 1 })),
              // 人类节点之间的连接
              ...humanNodes.slice(0, -1).map((h, i) => ({ source: h.id, target: humanNodes[i + 1].id, weight: 1 })),
              // 话题和人类的连接
              { source: 't1', target: 'h1' },
              { source: 't2', target: 'h2' },
              { source: 't3', target: 'h3' },
              { source: 't4', target: 'h4' },
            ]}
            isNight={isNight}
            showLabels={true}
            onNodeClick={(node) => setActiveNode(node)}
          />
        ) : (
          <>
            {/* 网格点背景 */}
            <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.4 }}>
              <defs>
                <pattern id="grid-dots" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="1.5" fill="rgba(45, 55, 72, 0.08)" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-dots)" />
            </svg>

        {/* 连线（SVG） */}
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
          {humanNodes.map((h, i) => (
            humanNodes.slice(i + 1).map((h2, j) => (
              <line
                key={`${h.id}-${h2.id}`}
                x1={h.x} y1={h.y} x2={h2.x} y2={h2.y}
                stroke="rgba(124, 111, 240, 0.2)"
                strokeWidth="2"
                strokeDasharray="6 4"
              />
            ))
          ))}
        </svg>

        {/* 话题节点（大圆） */}
        {viewMode !== 'human' && topics.map((topic, i) => {
          const angle = (i / topics.length) * Math.PI * 2;
          const scale = isMobile ? 0.55 : 1;
          const cx = (isMobile ? 180 : 400) + Math.cos(angle) * (isMobile ? 100 : 180);
          const cy = (isMobile ? 280 : 350) + Math.sin(angle) * (isMobile ? 120 : 140);
          const nodeSize = isMobile ? 72 : 100;
          return (
            <div
              key={topic.id}
              onClick={() => setActiveNode(topic)}
              style={{
                position: 'absolute',
                left: cx - nodeSize / 2,
                top: cy - nodeSize / 2,
                width: nodeSize, height: nodeSize,
                borderRadius: '50%',
                background: topic.color,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: isMobile ? 10 : 12,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: `0 8px 24px rgba(45, 55, 72, 0.15), 0 2px 6px rgba(0,0,0,0.05), inset 0 2px 6px rgba(255,255,255,0.4), inset 0 -4px 10px rgba(0,0,0,0.1)`,
                transition: 'all 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                animation: `fadeInUp 600ms cubic-bezier(0.2, 0.8, 0.2, 1) both`,
                animationDelay: `${i * 0.08}s`,
                touchAction: 'manipulation',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = '0 16px 40px rgba(45, 55, 72, 0.2), inset 0 2px 6px rgba(255,255,255,0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(45, 55, 72, 0.15), inset 0 2px 6px rgba(255,255,255,0.4), inset 0 -4px 10px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 800, fontFamily: dt.fonts.display, lineHeight: 1 }}>
                {topic.count}
              </div>
              <div style={{ fontSize: 11, opacity: 0.9, marginTop: 4 }}>{topic.label}</div>
            </div>
          );
        })}

        {/* 人类节点（头像） */}
        {viewMode !== 'topic' && humanNodes.map((h, i) => {
          const hx = isMobile ? h.x * 0.55 : h.x;
          const hy = isMobile ? h.y * 0.55 + 40 : h.y;
          const hSize = isMobile ? 52 : 72;
          return (
          <div
            key={h.id}
            style={{
              position: 'absolute',
              left: hx - hSize / 2,
              top: hy - hSize / 2,
              width: hSize, height: hSize,
              borderRadius: '50%',
              background: h.color,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(45, 55, 72, 0.18), inset 0 2px 6px rgba(255,255,255,0.4), inset 0 -4px 10px rgba(0,0,0,0.1)',
              transition: 'all 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              animation: `fadeInUp 600ms cubic-bezier(0.2, 0.8, 0.2, 1) both`,
              animationDelay: `${0.1 + i * 0.06}s`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <div style={{ fontSize: isMobile ? 14 : 18, fontWeight: 800, fontFamily: dt.fonts.display }}>
              {h.name[0]}
            </div>
          </div>
          );
        })}

        {/* 中心节点 */}
        <div style={{
          position: 'absolute',
          left: isMobile ? 135 : 355,
          top: isMobile ? 235 : 305,
          width: isMobile ? 64 : 90, height: isMobile ? 64 : 90,
          borderRadius: '50%',
          background: dt.gradients.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 800,
          fontSize: isMobile ? 14 : 20,
          fontFamily: dt.fonts.display,
          boxShadow: '0 12px 36px rgba(124, 111, 240, 0.4), inset 0 2px 8px rgba(255,255,255,0.5), inset 0 -6px 14px rgba(0,0,0,0.12)',
          animation: 'pulseGlow 3s ease-in-out infinite',
        }}>
          你
        </div>
        </>
        )}
      </div>

      {/* 小地图 */}
      <div style={{
        position: 'absolute',
        bottom: 16,
        right: 16,
        width: 140,
        height: 100,
        borderRadius: '16px',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.9)',
        boxShadow: '0 8px 20px rgba(45, 55, 72, 0.1)',
        overflow: 'hidden',
      }}>
        <div style={{ padding: 6, display: 'flex', gap: 2 }}>
          {topics.map((t, i) => (
            <div key={t.id} style={{
              width: 6, height: 6,
              borderRadius: '50%',
              background: t.color,
            }} />
          ))}
        </div>
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 60, height: 40,
          border: '2px solid rgba(124, 111, 240, 0.5)',
          borderRadius: 8,
        }} />
      </div>

      {/* 右侧统计卡（桌面端显示） */}
      {!isMobile && (<div style={{
        position: 'absolute',
        top: 70,
        right: 16,
        width: 180,
        padding: '16px',
        borderRadius: '20px',
        background: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.9)',
        boxShadow: '0 8px 24px rgba(45, 55, 72, 0.08)',
      }}>
        <div style={{
          fontSize: 12,
          color: dt.colors.textSecondary,
          fontWeight: 700,
          fontFamily: dt.fonts.rounded,
          marginBottom: 12,
        }}>
          网络概览
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: '节点总数', value: '247', gradient: dt.gradients.primary },
            { label: '话题数', value: '18', gradient: dt.gradients.teal },
            { label: '连接数', value: '892', gradient: dt.gradients.green },
            { label: '人节点', value: '12', gradient: dt.gradients.orange },
          ].map((s, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: 12, color: dt.colors.textTertiary, fontWeight: 600 }}>
                {s.label}
              </span>
              <span style={{
                fontSize: 16,
                fontWeight: 800,
                fontFamily: dt.fonts.display,
                background: s.gradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {s.value}
              </span>
            </div>
          ))}
        </div>
      </div>
      )}
    </div>
  );
}

Object.assign(window, { GraphView });
