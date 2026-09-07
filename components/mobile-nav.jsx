// ============================================
// MobileNav — 移动端导航（底部标签栏 + 抽屉）
// 可靠版：自动展开分组 + 重试 + 模糊匹配
// ============================================

function MobileNav() {
  const t = window.DESIGN_TOKENS || {};
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [activeNav, setActiveNav] = React.useState('dashboard');

  // 底部5个核心入口
  const bottomTabs = [
    { id: 'dashboard', label: '首页', icon: 'dashboard', color: { from: '#9B8EF7', to: '#5B4FE0' } },
    { id: 'editor', label: '笔记', icon: 'editor', color: { from: '#6BE3DC', to: '#3DB8B0' } },
    { id: 'calendar', label: '日历', icon: 'calendar', color: { from: '#8DDA97', to: '#4CAF50' } },
    { id: 'ai', label: 'AI', icon: 'ai', color: { from: '#9B8EF7', to: '#5B4FE0' } },
    { id: 'social', label: '社交', icon: 'social', color: { from: '#FAD0DF', to: '#F48FB1' } },
  ];

  const iconSvgs = {
    dashboard: '<circle cx="12" cy="12" r="3"/><path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/>',
    editor: '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    ai: '<path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v1a3 3 0 0 1-3 3h-1v1a4 4 0 0 1-8 0v-1H7a3 3 0 0 1-3-3v-1a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4z"/><circle cx="9" cy="11" r="1"/><circle cx="15" cy="11" r="1"/>',
    social: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  };

  const SvgIcon = ({ name, size = 22, color = 'currentColor' }) => (
    React.createElement('svg', {
      width: size, height: size, viewBox: '0 0 24 24',
      fill: 'none', stroke: color, strokeWidth: '2',
      strokeLinecap: 'round', strokeLinejoin: 'round',
      dangerouslySetInnerHTML: { __html: iconSvgs[name] || '' }
    })
  );

  // 可靠的导航切换 V4：data-nav-id 精确匹配
  const navigateTo = React.useCallback(async (navId) => {
    setActiveNav(navId);
    closeDrawer();

    const attempt = (retryCount) => new Promise((resolve) => {
      setTimeout(() => {
        try {
          // 1. 找到所有带 data-nav-id 的按钮（全局搜索，不依赖侧边栏结构）
          const targetBtn = document.querySelector(`button[data-nav-id="${navId}"]`);
          if (targetBtn) {
            targetBtn.click();
            resolve(true);
            return;
          }

          // 2. 没找到，尝试展开所有分组（点击有箭头的按钮）
          const allButtons = document.querySelectorAll('button');
          let clickedAny = false;
          for (const btn of allButtons) {
            const hasArrow = btn.querySelector('svg polyline') || btn.querySelector('svg line');
            if (hasArrow && !btn.dataset.navId) {
              const svgEl = btn.querySelector('svg');
              const svgStyle = svgEl ? (svgEl.getAttribute('style') || '') : '';
              const isCollapsed = svgStyle.includes('rotate(-90');
              if (isCollapsed || retryCount === 0) {
                btn.click();
                clickedAny = true;
              }
            }
          }

          // 3. 如果刚展开了分组，等待后重试
          if (clickedAny && retryCount < 3) {
            setTimeout(() => attempt(retryCount + 1).then(resolve), 200);
            return;
          }

          // 4. 再试一次找目标按钮
          const targetBtn2 = document.querySelector(`button[data-nav-id="${navId}"]`);
          if (targetBtn2) {
            targetBtn2.click();
            resolve(true);
            return;
          }

          // 5. 备选：文本模糊匹配
          const allLabels = {
            dashboard: ['仪表盘', '首页'],
            editor: ['编辑器', '笔记'],
            graph: ['知识图谱', '图谱'],
            calendar: ['时间日历', '生命日历', '日历'],
            elevation: ['知识升维', '升维'],
            ai: ['AI 共生体', '共生体', 'AI'],
            social: ['社交', '连接'],
            nodes: ['人', '节点', '人类节点'],
            voice: ['语音交互', '语音'],
            circles: ['极小圈子', '圈子'],
          };
          const labels = allLabels[navId] || [navId];
          const navBtns = document.querySelectorAll('button');
          for (const btn of navBtns) {
            const text = btn.textContent.trim();
            for (const label of labels) {
              if (text && text.length < 20 && (text === label || text.includes(label) || label.includes(text))) {
                btn.click();
                resolve(true);
                return;
              }
            }
          }

          // 6. 重试
          if (retryCount < 5) {
            attempt(retryCount + 1).then(resolve);
          } else {
            resolve(false);
          }
        } catch (e) {
          if (retryCount < 5) {
            attempt(retryCount + 1).then(resolve);
          } else {
            resolve(false);
          }
        }
      }, retryCount === 0 ? 50 : 150);
    });

    return attempt(0);
  }, []);

  const openDrawer = () => {
    setDrawerOpen(true);
    const rootEl = document.getElementById('root');
    if (rootEl) {
      const appRoot = rootEl.querySelector('div');
      if (appRoot) appRoot.classList.add('drawer-open');
    }
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    const rootEl = document.getElementById('root');
    if (rootEl) {
      const appRoot = rootEl.querySelector('div');
      if (appRoot) appRoot.classList.remove('drawer-open');
    }
  };

  // 汉堡菜单：使用 MutationObserver 确保顶部栏变化时汉堡按钮始终存在
  React.useEffect(() => {
    const injectMenuButton = () => {
      const topbar = document.querySelector('.topbar');
      if (!topbar) return false;
      if (topbar.querySelector('.mobile-menu-btn')) return true;

      const btn = document.createElement('button');
      btn.className = 'mobile-menu-btn';
      btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
      btn.onclick = (e) => { e.stopPropagation(); openDrawer(); };
      topbar.insertBefore(btn, topbar.firstChild);
      return true;
    };

    // 初始注入
    const initInterval = setInterval(() => {
      if (injectMenuButton()) clearInterval(initInterval);
    }, 300);

    // MutationObserver 监听顶部栏变化
    const observer = new MutationObserver(() => {
      injectMenuButton();
    });

    // 监听 body 变化（顶部栏可能被重新渲染）
    const bodyObserver = new MutationObserver(() => {
      const topbar = document.querySelector('.topbar');
      if (topbar) {
        observer.observe(topbar, { childList: true, subtree: true });
        injectMenuButton();
      }
    });
    bodyObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearInterval(initInterval);
      observer.disconnect();
      bodyObserver.disconnect();
    };
  }, []);

  // 轮询同步 App 内部导航状态（用户从抽屉点击导航后同步底部高亮）
  React.useEffect(() => {
    const interval = setInterval(() => {
      const rootEl = document.getElementById('root');
      if (!rootEl) return;
      const appRoot = rootEl.querySelector('div');
      if (!appRoot) return;
      const sidebar = appRoot.querySelector('div');
      if (!sidebar) return;

      // 找到激活的导航项（背景含 linear-gradient 的按钮）
      const buttons = sidebar.querySelectorAll('button');
      for (const btn of buttons) {
        const bg = btn.style.background || '';
        if (bg.includes('linear-gradient')) {
          const text = btn.textContent.trim();
          const navItems = window.NAV_ITEMS || [];
          for (const item of navItems) {
            if (text.includes(item.label) || item.label.includes(text)) {
              if (item.id !== activeNav) {
                setActiveNav(item.id);
              }
              return;
            }
          }
        }
      }
    }, 800);
    return () => clearInterval(interval);
  }, [activeNav]);

  // 抽屉遮罩
  const overlay = drawerOpen ? (
    React.createElement('div', {
      className: 'mobile-drawer-overlay visible',
      onClick: closeDrawer
    })
  ) : null;

  // 底部标签栏
  const bottomBar = React.createElement('nav', {
    style: {
      position: 'fixed', bottom: 0, left: 0, right: 0, height: 64,
      paddingBottom: 'env(safe-area-inset-bottom)',
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderTop: '1px solid rgba(255,255,255,0.9)',
      boxShadow: '0 -4px 20px rgba(45,55,72,0.06)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      zIndex: 9000,
    }
  }, bottomTabs.map(tab => {
    const isActive = activeNav === tab.id;
    return React.createElement('button', {
      key: tab.id,
      onClick: () => navigateTo(tab.id),
      style: {
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 3,
        height: '100%', border: 'none', background: 'transparent',
        cursor: 'pointer', position: 'relative',
        paddingTop: 6, paddingBottom: 4,
        WebkitTapHighlightColor: 'transparent',
      }
    },
      React.createElement('div', {
        style: {
          width: 32, height: 32, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: isActive
            ? `linear-gradient(135deg, ${tab.color.from}, ${tab.color.to})`
            : 'transparent',
          color: isActive ? '#fff' : 'rgba(45,55,72,0.5)',
          boxShadow: isActive ? `0 4px 12px ${tab.color.to}40` : 'none',
          transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
          transform: isActive ? 'scale(1.1)' : 'scale(1)',
        }
      }, React.createElement(SvgIcon, { name: tab.icon, size: 18 })),
      React.createElement('span', {
        style: {
          fontSize: 10, fontWeight: isActive ? 700 : 600,
          color: isActive ? tab.color.to : 'rgba(45,55,72,0.5)',
          letterSpacing: 0.2, transition: 'all 0.2s ease',
        }
      }, tab.label),
      isActive && React.createElement('div', {
        style: {
          position: 'absolute', top: 2, width: 4, height: 4, borderRadius: '50%',
          background: `linear-gradient(135deg, ${tab.color.from}, ${tab.color.to})`,
          boxShadow: `0 0 6px ${tab.color.to}80`,
        }
      })
    );
  }));

  return React.createElement(React.Fragment, null, overlay, bottomBar);
}

Object.assign(window, { MobileNav });
