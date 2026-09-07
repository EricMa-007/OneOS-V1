// ============================================
// AI 共生体对话面板视图
// ============================================

function AIView({
  density, isNight, textColor, subTextColor, themeBg, focusMode,
}) {
  const [conversations, setConversations] = React.useState(AI_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = React.useState('conv-001');
  const [activeModel, setActiveModel] = React.useState('doubao');
  const [activeTopic, setActiveTopic] = React.useState('全部话题');
  const [showSettings, setShowSettings] = React.useState(false);
  const [settingsTab, setSettingsTab] = React.useState('models');
  const [showLoginDialog, setShowLoginDialog] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showArchiveDialog, setShowArchiveDialog] = React.useState(false);
  const [archiveSourceConv, setArchiveSourceConv] = React.useState(null);
  // V2: 人设系统
  const [activePersona, setActivePersona] = React.useState(null);
  const [showPersonaSelector, setShowPersonaSelector] = React.useState(false);

  // 初始化人设
  React.useEffect(() => {
    if (window.PersonaManager) {
      const persona = window.PersonaManager.getActivePersona();
      setActivePersona(persona);
      console.log('[AIView] 当前人设:', persona.name);
    }
  }, []);

  const activeConv = conversations.find(c => c.id === activeConvId);

  // 切换人设
  const switchPersona = (personaId) => {
    if (window.PersonaManager) {
      const persona = window.PersonaManager.getPersona(personaId);
      if (persona) {
        window.PersonaManager.setActivePersona(personaId);
        setActivePersona(persona);
        setShowPersonaSelector(false);
        // 切换人设时新建一个对话
        const newConv = {
          id: `conv-${Date.now()}`,
          title: `与${persona.name}的对话`,
          topic: persona.name,
          model: activeModel,
          personaId: personaId,
          createdAt: '今天',
          lastActive: '刚刚',
          archived: false,
          messages: [{
            id: `m-welcome-${Date.now()}`,
            role: 'assistant',
            content: persona.welcomeMessage,
            time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          }],
        };
        setConversations(prev => [newConv, ...prev]);
        setActiveConvId(newConv.id);
      }
    }
  };

  // 监听 AI 消息回复完成事件
  React.useEffect(() => {
    const handleAddAIMessage = (e) => {
      const msg = e.detail;
      setConversations(prev => prev.map(c =>
        c.id === activeConvId
          ? { ...c, messages: [...c.messages, msg], lastActive: '刚刚' }
          : c
      ));
    };
    window.addEventListener('add-ai-message', handleAddAIMessage);
    return () => window.removeEventListener('add-ai-message', handleAddAIMessage);
  }, [activeConvId]);

  // 发送消息
  const sendMessage = (text) => {
    if (!text.trim() || !activeConv) return;
    const newMsg = {
      id: `m-u-${Date.now()}`,
      role: 'user',
      content: text,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };
    setConversations(prev => prev.map(c =>
      c.id === activeConvId
        ? { ...c, messages: [...c.messages, newMsg], lastActive: '刚刚' }
        : c
    ));
  };

  // 切换对话
  const switchConversation = (convId) => {
    setActiveConvId(convId);
  };

  // 新建对话
  const newConversation = () => {
    const newConv = {
      id: `conv-${Date.now()}`,
      title: '新对话',
      topic: '未分类',
      model: activeModel,
      createdAt: '今天',
      lastActive: '刚刚',
      archived: false,
      messages: [],
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveConvId(newConv.id);
  };

  // 过滤后的对话列表
  const filteredConversations = React.useMemo(() => {
    let list = conversations;
    if (activeTopic !== '全部话题') {
      list = list.filter(c => c.topic === activeTopic);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c => c.title.toLowerCase().includes(q));
    }
    return list;
  }, [conversations, activeTopic, searchQuery]);

  // 切换模型
  const switchModel = (modelId) => {
    setActiveModel(modelId);
    if (activeConv) {
      setConversations(prev => prev.map(c =>
        c.id === activeConvId ? { ...c, model: modelId } : c
      ));
    }
  };

  // 归档对话
  const openArchive = (conv) => {
    setArchiveSourceConv(conv);
    setShowArchiveDialog(true);
  };

  const currentModel = AI_MODELS.find(m => m.id === activeModel);

  // 响应式
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );
  const [showSidebar, setShowSidebar] = React.useState(false);
  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setShowSidebar(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      minWidth: 0,
      background: themeBg,
      transition: 'background-color 0.3s ease',
      overflow: 'hidden',
      opacity: focusMode ? 0.1 : 1,
      pointerEvents: focusMode ? 'none' : 'auto',
    }}>
      {/* 左侧对话列表 - 移动端抽屉式 */}
      {(!isMobile || showSidebar) && (
        <>
          {isMobile && showSidebar && (
            <div
              onClick={() => setShowSidebar(false)}
              style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.4)',
                zIndex: 999,
              }}
            />
          )}
          <div style={{
            position: isMobile ? 'fixed' : 'relative',
            top: isMobile ? 0 : 'auto',
            left: isMobile ? 0 : 'auto',
            bottom: isMobile ? 0 : 'auto',
            zIndex: isMobile ? 1000 : 'auto',
            height: isMobile ? '100%' : 'auto',
          }}>
            <ConversationSidebar
              conversations={filteredConversations}
              activeConvId={activeConvId}
              onConvClick={(id) => { switchConversation(id); if (isMobile) setShowSidebar(false); }}
              onNewChat={() => { newConversation(); if (isMobile) setShowSidebar(false); }}
              activeTopic={activeTopic}
              onTopicChange={setActiveTopic}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              isNight={isNight}
              textColor={textColor}
              subTextColor={subTextColor}
            />
          </div>
        </>
      )}

      {/* 中间主对话区 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* 顶部栏 */}
        <div style={{
          flexShrink: 0,
          padding: isMobile ? '10px 12px' : '12px 20px',
          borderBottom: `1px solid ${isNight ? 'rgba(255,255,255,0.05)' : 'rgba(43, 42, 38, 0.05)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: isMobile ? 8 : 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {isMobile && (
              <button
                onClick={() => setShowSidebar(true)}
                style={{
                  width: 32, height: 32,
                  borderRadius: 8,
                  border: `1px solid ${isNight ? 'rgba(255,255,255,0.08)' : 'rgba(43, 42, 38, 0.08)'}`,
                  background: 'transparent',
                  color: '#6B6960',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            )}
            <div>
              <div style={{
                fontSize: 15,
                fontWeight: 500,
                fontFamily: "'Noto Serif SC', serif",
                color: textColor,
                lineHeight: 1.2,
              }}>
                {activeConv?.title || '新对话'}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginTop: 3,
              }}>
                <span style={{
                  fontSize: 11,
                  color: subTextColor,
                }}>
                  {activeConv?.topic}
                </span>
                {activeConv?.archived && (
                  <span style={{
                    fontSize: 10,
                    padding: '1px 6px',
                    borderRadius: 8,
                    background: isNight ? 'rgba(90, 122, 78, 0.15)' : 'rgba(90, 122, 78, 0.1)',
                    color: '#5A7A4E',
                  }}>
                    已归档
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* V2: 人设选择按钮 */}
            <button
              onClick={() => setShowPersonaSelector(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 999,
                border: `1px solid ${activePersona?.color || '#7C6FF0'}40`,
                background: `${activePersona?.color || '#7C6FF0'}10`,
                color: activePersona?.color || '#7C6FF0',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: "'Noto Serif SC', serif",
                transition: 'all 0.2s ease',
              }}
              title="切换AI人设"
            >
              <span style={{ fontSize: 14 }}>{activePersona?.icon || '✦'}</span>
              <span>{activePersona?.name || '默认助手'}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {/* 模型选择 */}
            <ModelSelector
              currentModel={currentModel}
              onSelect={switchModel}
              isNight={isNight}
              textColor={textColor}
              subTextColor={subTextColor}
            />

            {/* 归档按钮 */}
            {activeConv && !activeConv.archived && activeConv.messages.length > 0 && (
              <button
                onClick={() => openArchive(activeConv)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: `1px solid ${isNight ? 'rgba(181, 107, 58, 0.3)' : 'rgba(181, 107, 58, 0.2)'}`,
                  background: isNight ? 'rgba(181, 107, 58, 0.1)' : 'rgba(181, 107, 58, 0.05)',
                  color: '#B56B3A',
                  fontSize: 12,
                  cursor: 'pointer',
                  fontFamily: "'Noto Serif SC', serif",
                  transition: 'all 0.15s ease',
                }}
              >
                归档到知识库
              </button>
            )}

            {/* 设置按钮 */}
            <button
              onClick={() => setShowSettings(true)}
              style={{
                width: 34, height: 34,
                borderRadius: 8,
                border: `1px solid ${isNight ? 'rgba(255,255,255,0.08)' : 'rgba(43, 42, 38, 0.08)'}`,
                background: 'transparent',
                color: '#6B6960',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="设置"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </div>
        </div>

        {/* 对话区域 */}
        <ChatArea
          conversation={activeConv}
          currentModel={currentModel}
          persona={activePersona}
          onSend={sendMessage}
          isNight={isNight}
          textColor={textColor}
          subTextColor={subTextColor}
          themeBg={themeBg}
          isMobile={isMobile}
        />
      </div>

      {/* 设置面板 */}
      {showSettings && (
        <SettingsPanel
          tab={settingsTab}
          onTabChange={setSettingsTab}
          onClose={() => setShowSettings(false)}
          activeModel={activeModel}
          onModelChange={switchModel}
          isLoggedIn={isLoggedIn}
          onLogin={() => setShowLoginDialog(true)}
          onLogout={() => setIsLoggedIn(false)}
          isNight={isNight}
          textColor={textColor}
          subTextColor={subTextColor}
        />
      )}

      {/* V2: 人设选择器 */}
      <PersonaSelector
        isOpen={showPersonaSelector}
        onClose={() => setShowPersonaSelector(false)}
        onSelect={switchPersona}
        activePersonaId={activePersona?.id}
        isNight={isNight}
        textColor={textColor}
        subTextColor={subTextColor}
      />

      {/* 登录对话框 */}
      {showLoginDialog && (
        <LoginDialog
          onClose={() => setShowLoginDialog(false)}
          onSuccess={() => { setIsLoggedIn(true); setShowLoginDialog(false); }}
          isNight={isNight}
          textColor={textColor}
          subTextColor={subTextColor}
        />
      )}

      {/* 归档对话框 */}
      {showArchiveDialog && archiveSourceConv && (
        <ArchiveDialog
          conversation={archiveSourceConv}
          onClose={() => setShowArchiveDialog(false)}
          onDone={() => {
            setConversations(prev => prev.map(c =>
              c.id === archiveSourceConv.id
                ? { ...c, archived: true, archivePath: `${c.topic}/${c.title}.md` }
                : c
            ));
            setShowArchiveDialog(false);
          }}
          isNight={isNight}
          textColor={textColor}
          subTextColor={subTextColor}
        />
      )}
    </div>
  );
}

// ============================================
// 左侧对话列表面板
// ============================================
function ConversationSidebar({
  conversations, activeConvId, onConvClick, onNewChat,
  activeTopic, onTopicChange,
  searchQuery, onSearchChange,
  isNight, textColor, subTextColor,
}) {
  // 按话题分组
  const grouped = {};
  AI_TOPICS.forEach(t => { grouped[t] = []; });
  conversations.forEach(c => {
    if (!grouped[c.topic]) grouped[c.topic] = [];
    grouped[c.topic].push(c);
  });

  return (
    <div style={{
      width: 260,
      flexShrink: 0,
      borderRight: `1px solid ${isNight ? 'rgba(255,255,255,0.05)' : 'rgba(43, 42, 38, 0.05)'}`,
      background: isNight ? 'rgba(255,255,255,0.015)' : 'rgba(43, 42, 38, 0.015)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* 顶部：新对话按钮 */}
      <div style={{ padding: '14px 14px 10px' }}>
        <button
          onClick={onNewChat}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: 8,
            border: `1px solid ${isNight ? 'rgba(79, 70, 229, 0.3)' : 'rgba(79, 70, 229, 0.2)'}`,
            background: isNight ? 'rgba(79, 70, 229, 0.1)' : 'rgba(79, 70, 229, 0.06)',
            color: '#4F46E5',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: "'Noto Serif SC', serif",
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            transition: 'all 0.15s ease',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          新对话
        </button>
      </div>

      {/* 搜索 */}
      <div style={{ padding: '0 14px 10px' }}>
        <div style={{ position: 'relative' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{
            position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: subTextColor,
          }}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text" placeholder="搜索对话…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 12px 7px 28px',
              borderRadius: 6,
              border: `1px solid ${isNight ? 'rgba(255,255,255,0.08)' : 'rgba(43, 42, 38, 0.08)'}`,
              background: isNight ? 'rgba(255,255,255,0.04)' : '#fff',
              color: textColor,
              fontSize: 12,
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
        </div>
      </div>

      {/* 对话列表 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0 10px 10px',
      }}>
        {activeTopic === '全部话题' ? (
          AI_TOPICS.map(topic => {
            const items = grouped[topic] || [];
            if (items.length === 0) return null;
            return (
              <div key={topic} style={{ marginBottom: 16 }}>
                <div style={{
                  fontSize: 10,
                  color: subTextColor,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  padding: '8px 6px 6px',
                  fontFamily: "'JetBrains Mono', monospace",
                  opacity: 0.7,
                }}>
                  {topic}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {items.map(conv => (
                    <ConversationItem
                      key={conv.id}
                      conv={conv}
                      isActive={conv.id === activeConvId}
                      onClick={() => onConvClick(conv.id)}
                      isNight={isNight}
                      textColor={textColor}
                      subTextColor={subTextColor}
                    />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 8 }}>
            {(grouped[activeTopic] || []).map(conv => (
              <ConversationItem
                key={conv.id}
                conv={conv}
                isActive={conv.id === activeConvId}
                onClick={() => onConvClick(conv.id)}
                isNight={isNight}
                textColor={textColor}
                subTextColor={subTextColor}
              />
            ))}
          </div>
        )}
      </div>

      {/* 底部话题筛选 */}
      <div style={{
        padding: '10px 14px',
        borderTop: `1px solid ${isNight ? 'rgba(255,255,255,0.05)' : 'rgba(43, 42, 38, 0.05)'}`,
      }}>
        <select
          value={activeTopic}
          onChange={(e) => onTopicChange(e.target.value)}
          style={{
            width: '100%',
            padding: '6px 10px',
            borderRadius: 6,
            border: `1px solid ${isNight ? 'rgba(255,255,255,0.08)' : 'rgba(43, 42, 38, 0.08)'}`,
            background: isNight ? '#2A2925' : '#fff',
            color: textColor,
            fontSize: 12,
            outline: 'none',
            fontFamily: 'inherit',
            cursor: 'pointer',
          }}
        >
          <option value="全部话题">全部话题</option>
          {AI_TOPICS.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

function ConversationItem({ conv, isActive, onClick, isNight, textColor, subTextColor }) {
  const model = AI_MODELS.find(m => m.id === conv.model);
  return (
    <div
      onClick={onClick}
      style={{
        padding: '10px 12px',
        borderRadius: 8,
        cursor: 'pointer',
        border: isActive
          ? `1px solid ${model?.brandColor || '#4F46E5'}30`
          : '1px solid transparent',
        background: isActive
          ? (isNight ? `${model?.brandColor || '#4F46E5'}10` : `${model?.brandColor || '#4F46E5'}08`)
          : 'transparent',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.background = isNight ? 'rgba(255,255,255,0.04)' : 'rgba(43, 42, 38, 0.03)';
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.background = 'transparent';
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
      }}>
        <span style={{
          fontSize: 13,
          fontWeight: 500,
          fontFamily: "'Noto Serif SC', serif",
          color: textColor,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
        }}>
          {conv.title}
        </span>
        {conv.archived && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#5A7A4E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 10,
        color: subTextColor,
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        <span style={{ opacity: 0.8 }}>
          {conv.messages.length} 条消息
        </span>
        <span style={{ opacity: 0.6 }}>
          {conv.lastActive}
        </span>
      </div>
    </div>
  );
}

// ============================================
// 模型选择器
// ============================================
function ModelSelector({ currentModel, onSelect, isNight, textColor, subTextColor }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!currentModel) return null;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
       <button
         onClick={() => setOpen(!open)}
         style={{
           display: 'flex',
           alignItems: 'center',
           gap: 10,
           padding: '8px 16px',
           borderRadius: '999px',
           border: '1px solid rgba(45, 55, 72, 0.08)',
           background: '#fff',
           color: '#2D3748',
           fontSize: 12,
           cursor: 'pointer',
           fontFamily: "'Nunito', sans-serif",
           fontWeight: 700,
           transition: 'all 250ms cubic-bezier(0.34, 1.56, 0.64, 1)',
           boxShadow: '0 2px 8px rgba(45, 55, 72, 0.04)',
         }}
         onMouseEnter={(e) => {
           e.currentTarget.style.transform = 'translateY(-2px)';
           e.currentTarget.style.boxShadow = '0 6px 16px rgba(45, 55, 72, 0.08)';
         }}
         onMouseLeave={(e) => {
           e.currentTarget.style.transform = 'translateY(0)';
           e.currentTarget.style.boxShadow = '0 2px 8px rgba(45, 55, 72, 0.04)';
         }}
       >
         <div style={{
           width: 10, height: 10,
           borderRadius: '50%',
           background: currentModel.status === 'online'
             ? 'linear-gradient(135deg, #8DDA97, #4CAF50)'
             : '#CBD5E0',
           boxShadow: currentModel.status === 'online'
             ? '0 0 8px rgba(107, 203, 119, 0.5)'
             : 'none',
         }} />
        <span style={{ fontWeight: 500 }}>{currentModel.name}</span>
        {currentModel.hasSoulBound && (
          <span style={{
            fontSize: 9,
            padding: '1px 5px',
            borderRadius: 8,
            background: `${currentModel.brandColor}15`,
            color: currentModel.brandColor,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            灵魂绑定
          </span>
        )}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{
          transition: 'transform 0.2s',
          transform: open ? 'rotate(180deg)' : 'rotate(0)',
        }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: 6,
          width: 280,
          background: isNight ? '#2A2925' : '#FFFEFA',
          borderRadius: 10,
          border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.08)'}`,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          zIndex: 100,
          padding: 6,
          animation: 'fadeIn 0.15s ease both',
        }}>
          {AI_MODELS.map(m => (
            <div
              key={m.id}
              onClick={() => { if (m.configured) { onSelect(m.id); setOpen(false); } }}
              style={{
                padding: '10px 12px',
                borderRadius: 6,
                cursor: m.configured ? 'pointer' : 'not-allowed',
                opacity: m.configured ? 1 : 0.5,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                transition: 'background 0.15s ease',
                background: currentModel.id === m.id
                  ? (isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.04)')
                  : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (m.configured && currentModel.id !== m.id) {
                  e.currentTarget.style.background = isNight ? 'rgba(255,255,255,0.04)' : 'rgba(43, 42, 38, 0.03)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentModel.id !== m.id) e.currentTarget.style.background = 'transparent';
              }}
            >
              <div style={{
                width: 8, height: 8,
                borderRadius: '50%',
                background: m.status === 'online' ? '#5A7A4E' : '#8A8780',
                marginTop: 5,
                flexShrink: 0,
              }} />
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: 2,
                }}>
                  <span style={{
                    fontSize: 13,
                    fontWeight: 500,
                    fontFamily: "'Noto Serif SC', serif",
                    color: textColor,
                  }}>
                    {m.name}
                  </span>
                  {m.isDefault && (
                    <span style={{
                      fontSize: 9,
                      padding: '1px 5px',
                      borderRadius: 8,
                      background: `${m.brandColor}15`,
                      color: m.brandColor,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>
                      默认
                    </span>
                  )}
                </div>
                <div style={{
                  fontSize: 11,
                  color: subTextColor,
                  lineHeight: 1.4,
                }}>
                  {m.tag}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// 对话区域
// ============================================
function ChatArea({ conversation, currentModel, persona, onSend, isNight, textColor, subTextColor, themeBg, isMobile }) {
  const [inputText, setInputText] = React.useState('');
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [streamingMsg, setStreamingMsg] = React.useState(null);
  const [streamError, setStreamError] = React.useState(null);
  const [ollamaAvailable, setOllamaAvailable] = React.useState(null); // null=未检测, true/false
  const abortControllerRef = React.useRef(null);
  const messagesEndRef = React.useRef(null);
  // V2: RAG 状态
  const [ragEnabled, setRagEnabled] = React.useState(true);
  const [ragSources, setRagSources] = React.useState([]);
  const [isRetrieving, setIsRetrieving] = React.useState(false);

  const messages = conversation?.messages || [];

  // 检测 Ollama 服务是否可用
  React.useEffect(() => {
    if (window.OllamaService) {
      window.OllamaService.checkConnection().then(result => {
        setOllamaAvailable(result.available);
        console.log('[AI] Ollama 连接状态:', result.available, result.message);
      }).catch(() => setOllamaAvailable(false));
    } else {
      setOllamaAvailable(false);
    }
  }, []);

  // 自动滚动到底部
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, streamingMsg]);

  // V2: 切换对话时清空 RAG 来源
  React.useEffect(() => {
    setRagSources([]);
  }, [conversation?.id]);

  // 发送消息
  const handleSend = () => {
    if (!inputText.trim() || isStreaming) return;
    const userText = inputText.trim();
    onSend(userText);
    setInputText('');
    setStreamError(null);

    // 开始 AI 回复（延迟一小段时间模拟思考）
    setTimeout(() => {
      startStreamReply(userText);
    }, 300);
  };

  // 取消流式输出
  const cancelStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setStreamingMsg(null);
  };

  // 真实流式回复（使用 OllamaService）
  const startStreamReply = async (userQuestion) => {
    setIsStreaming(true);

    const streamMsg = {
      id: `m-a-${Date.now()}`,
      role: 'assistant',
      content: '',
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };
    setStreamingMsg(streamMsg);

    // 构建对话历史（用于 API 上下文）
    const historyMessages = messages.map(m => ({
      role: m.role,
      content: m.content,
    }));
    historyMessages.push({ role: 'user', content: userQuestion });

    // V2: 使用人设的系统提示词和参数
    const personaSystemPrompt = persona?.systemPrompt || `你是 OneOS 的 AI 共生体，基于用户的价值观与思维方式对齐。回答要：
1. 深度思考，不要泛泛而谈
2. 结构清晰，善用标题、列表、引用
3. 适当使用 [[概念]] 双链格式标记核心概念
4. 保持对话感，像一个有智慧的朋友而不是搜索引擎
5. 中文回答，语言简洁有力`;

    const apiMessages = [
      { role: 'system', content: personaSystemPrompt },
      ...historyMessages,
    ];

    // 使用人设的温度参数
    const personaTemperature = persona?.temperature ?? 0.7;
    const personaMaxTokens = persona?.maxTokens ?? 2048;

    // V2: RAG 知识库检索
    let ragContext = '';
    let currentRagSources = [];
    if (ragEnabled && window.RAGService) {
      setIsRetrieving(true);
      try {
        const { context, sources } = await window.RAGService.buildContext(userQuestion, 5);
        ragContext = context;
        currentRagSources = sources;
        setRagSources(sources);
        if (sources.length > 0) {
          console.log(`[RAG] 检索到 ${sources.length} 篇相关笔记`);
          // 将RAG上下文追加到最后一条用户消息
          const lastUserMsg = apiMessages[apiMessages.length - 1];
          lastUserMsg.content = lastUserMsg.content + ragContext;
        }
      } catch (err) {
        console.warn('[RAG] 检索失败:', err);
      } finally {
        setIsRetrieving(false);
      }
    }

    try {
      if (window.OllamaService && ollamaAvailable) {
        // 使用真实 Ollama 流式 API
        abortControllerRef.current = new AbortController();

        const result = await window.OllamaService.chatStream(
          apiMessages,
          (token, fullContent) => {
            // 逐字更新（打字机效果）
            setStreamingMsg(prev => prev ? { ...prev, content: fullContent } : null);
          },
          { signal: abortControllerRef.current?.signal }
        );

        // 流式完成
        const finalMsg = { ...streamMsg, content: result.content };
        setStreamingMsg(null);
        setIsStreaming(false);
        abortControllerRef.current = null;

        // 通知父组件添加消息
        const event = new CustomEvent('ai-reply-done', { detail: finalMsg });
        window.dispatchEvent(event);

      } else {
        // Ollama 不可用，使用模拟回复
        console.log('[AI] Ollama 不可用，使用模拟回复');
        await simulateStreamReply(streamMsg, userQuestion);
      }
    } catch (err) {
      console.error('[AI] 流式回复失败:', err);
      if (err.name === 'AbortError') {
        // 用户取消，不显示错误
        return;
      }
      setStreamError(err.message || '请求失败');
      setIsStreaming(false);
      setStreamingMsg(null);

      // 失败后尝试模拟回复
      setTimeout(() => {
        setStreamError(null);
        simulateStreamReply(streamMsg, userQuestion);
      }, 1000);
    }
  };

  // 模拟流式回复（降级方案）
  const simulateStreamReply = async (streamMsg, userQuestion) => {
    setIsStreaming(true);
    setStreamingMsg(streamMsg);

    const fullReply = generateReply(userQuestion, currentModel);
    let displayed = '';
    let idx = 0;

    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (idx >= fullReply.length) {
          clearInterval(interval);
          const finalMsg = { ...streamMsg, content: fullReply };
          setStreamingMsg(null);
          setIsStreaming(false);
          const event = new CustomEvent('ai-reply-done', { detail: finalMsg });
          window.dispatchEvent(event);
          resolve();
          return;
        }
        const chunkSize = Math.floor(Math.random() * 4) + 2;
        displayed = fullReply.slice(0, Math.min(idx + chunkSize, fullReply.length));
        idx += chunkSize;
        setStreamingMsg(prev => prev ? { ...prev, content: displayed } : null);
      }, 30);
    });
  };

  // 监听回复完成事件
  React.useEffect(() => {
    const handleReplyDone = (e) => {
      const msg = e.detail;
      const event = new CustomEvent('add-ai-message', { detail: msg });
      window.dispatchEvent(event);
    };
    window.addEventListener('ai-reply-done', handleReplyDone);
    return () => window.removeEventListener('ai-reply-done', handleReplyDone);
  }, []);

  const allMessages = streamingMsg ? [...messages, streamingMsg] : messages;

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* 消息列表 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: isMobile ? '16px 12px' : '24px 20%',
        WebkitOverflowScrolling: 'touch',
      }}>
        {allMessages.length === 0 ? (
          <EmptyChatState
            model={currentModel}
            isNight={isNight}
            textColor={textColor}
            subTextColor={subTextColor}
            isMobile={isMobile}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {allMessages.map(msg => (
              <ChatMessage
                key={msg.id}
                message={msg}
                model={currentModel}
                isStreaming={isStreaming && msg.id === streamingMsg?.id}
                isNight={isNight}
                textColor={textColor}
                subTextColor={subTextColor}
              />
            ))}
            {/* V2: RAG 检索来源显示 */}
            {ragSources.length > 0 && !isStreaming && (
              <div style={{
                padding: '12px 16px',
                borderRadius: 12,
                background: isNight ? 'rgba(79,70,229,0.08)' : 'rgba(79,70,229,0.04)',
                border: `1px solid ${isNight ? 'rgba(79,70,229,0.15)' : 'rgba(79,70,229,0.1)'}`,
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: 8,
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#4F46E5',
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                  参考了 {ragSources.length} 篇知识库笔记
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {ragSources.map((source, idx) => (
                    <div key={source.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 11,
                      color: subTextColor,
                    }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 16, height: 16,
                        borderRadius: 4,
                        background: '#4F46E5',
                        color: '#fff',
                        fontSize: 9,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}>
                        {idx + 1}
                      </span>
                      <span style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                      }}>
                        {source.title}
                      </span>
                      <span style={{
                        fontSize: 9,
                        padding: '1px 4px',
                        borderRadius: 3,
                        background: isNight ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                        flexShrink: 0,
                      }}>
                        {source.searchType}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 输入区域 */}
      <div style={{
        flexShrink: 0,
        padding: isMobile ? '10px 12px 16px' : '16px 20% 24px',
      }}>
        {/* 错误提示 */}
        {streamError && (
          <div style={{
            padding: '8px 12px',
            marginBottom: 8,
            borderRadius: 8,
            background: 'rgba(255,100,100,0.1)',
            border: '1px solid rgba(255,100,100,0.2)',
            color: '#E53E3E',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span>⚠️ Ollama 请求失败，正在使用模拟回复... ({streamError})</span>
            <button onClick={() => setStreamError(null)} style={{color:'#E53E3E',cursor:'pointer',background:'none',border:'none',fontSize:14}}>×</button>
          </div>
        )}

        {/* Ollama 连接状态 */}
        {ollamaAvailable === false && !streamError && (
          <div style={{
            padding: '6px 12px',
            marginBottom: 8,
            borderRadius: 8,
            background: 'rgba(255,180,50,0.1)',
            border: '1px solid rgba(255,180,50,0.2)',
            color: '#B7791F',
            fontSize: 11,
          }}>
            💡 Ollama 未连接，当前使用模拟回复。安装并运行 `ollama serve` 后可使用真实 AI。
          </div>
        )}

        <div style={{
          background: isNight ? '#2A2925' : '#FFFEFA',
          borderRadius: 12,
          border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.08)'}`,
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`与 ${currentModel?.name || 'AI'} 对话… (Enter 发送，Shift+Enter 换行)`}
            style={{
              width: '100%',
              minHeight: 60,
              maxHeight: 200,
              padding: '12px 16px',
              border: 'none',
              background: 'transparent',
              color: textColor,
              fontSize: 14,
              lineHeight: 1.6,
              outline: 'none',
              resize: 'none',
              fontFamily: 'inherit',
            }}
            rows={1}
          />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            borderTop: `1px solid ${isNight ? 'rgba(255,255,255,0.05)' : 'rgba(43, 42, 38, 0.05)'}`,
          }}>
            <div style={{
              display: 'flex',
              gap: 6,
              fontSize: 11,
              color: subTextColor,
              opacity: 0.7,
              alignItems: 'center',
            }}>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}>
                <div style={{
                  width: 6, height: 6,
                  borderRadius: '50%',
                  background: ollamaAvailable ? '#5A7A4E' : '#B7791F',
                  boxShadow: ollamaAvailable ? '0 0 4px rgba(90,122,78,0.5)' : 'none',
                }} />
                {ollamaAvailable ? 'Ollama 已连接' : '模拟模式'}
              </span>
              <span>·</span>
              <span>Markdown 输出</span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {isStreaming && (
                <button
                  onClick={cancelStream}
                  style={{
                    padding: '7px 12px',
                    borderRadius: 6,
                    border: '1px solid rgba(229,62,62,0.3)',
                    background: 'rgba(229,62,62,0.1)',
                    color: '#E53E3E',
                    fontSize: 12,
                    cursor: 'pointer',
                    fontFamily: "'Noto Serif SC', serif",
                  }}
                >
                  停止生成
                </button>
              )}
              {/* V2: RAG 知识库检索开关 */}
              <button
                onClick={() => setRagEnabled(!ragEnabled)}
                title={ragEnabled ? 'RAG已启用：回答将参考你的知识库' : 'RAG已禁用：仅使用AI自身知识'}
                style={{
                  padding: '7px 10px',
                  borderRadius: 6,
                  border: `1px solid ${ragEnabled ? 'rgba(79,70,229,0.3)' : (isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43,42,38,0.1)')}`,
                  background: ragEnabled ? 'rgba(79,70,229,0.1)' : 'transparent',
                  color: ragEnabled ? '#4F46E5' : subTextColor,
                  fontSize: 12,
                  cursor: 'pointer',
                  fontFamily: "'Noto Serif SC', serif",
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'all 0.15s ease',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                {ragEnabled ? '知识库' : '关闭'}
                {isRetrieving && (
                  <span style={{
                    display: 'inline-block',
                    width: 8, height: 8,
                    border: `1.5px solid ${ragEnabled ? '#4F46E5' : subTextColor}`,
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                )}
              </button>
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || isStreaming}
                style={{
                  padding: '7px 16px',
                  borderRadius: 6,
                  border: 'none',
                  background: inputText.trim() && !isStreaming
                    ? `linear-gradient(135deg, ${currentModel?.brandColor || '#4F46E5'}, #4F46E5)`
                    : (isNight ? 'rgba(255,255,255,0.06)' : 'rgba(43, 42, 38, 0.06)'),
                  color: inputText.trim() && !isStreaming ? '#fff' : subTextColor,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: inputText.trim() && !isStreaming ? 'pointer' : 'not-allowed',
                  fontFamily: "'Noto Serif SC', serif",
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {isStreaming ? (
                  <>
                    <span style={{
                      display: 'inline-block',
                      width: 10, height: 10,
                      border: `2px solid ${isNight ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.4)'}`,
                      borderTopColor: '#fff',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }} />
                    生成中
                  </>
                ) : (
                  <>
                    发送
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 空对话状态
// ============================================
function EmptyChatState({ model, isNight, textColor, subTextColor, isMobile }) {
  const suggestions = [
    '帮我梳理一下最近的思考',
    '分析一下「社交重塑」这个话题',
    '把这段想法整理成结构化内容',
    '我想聊聊关于知识升维的机制',
  ];

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 24,
      padding: '40px 0',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 56, height: 56,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${model?.brandColor || '#4F46E5'}40, ${model?.brandColor || '#4F46E5'}20)`,
          border: `2px solid ${model?.brandColor || '#4F46E5'}40`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          fontSize: 24,
        }}>
          ◈
        </div>
        <h3 style={{
          fontSize: 18,
          fontWeight: 500,
          fontFamily: "'Noto Serif SC', serif",
          color: textColor,
          marginBottom: 6,
        }}>
          {model?.name}
        </h3>
        <p style={{
          fontSize: 13,
          color: subTextColor,
          lineHeight: 1.6,
          maxWidth: 380,
          margin: '0 auto',
        }}>
          {model?.description || '你的 AI 共生体，基于你的价值观与思维方式对齐。'}
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: 10,
        maxWidth: isMobile ? '100%' : 480,
        width: '100%',
      }}>
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => {}}
            style={{
              padding: '12px 16px',
              borderRadius: 10,
              border: `1px solid ${isNight ? 'rgba(255,255,255,0.08)' : 'rgba(43, 42, 38, 0.06)'}`,
              background: isNight ? 'rgba(255,255,255,0.02)' : 'rgba(43, 42, 38, 0.02)',
              color: textColor,
              fontSize: 12,
              textAlign: 'left',
              cursor: 'pointer',
              fontFamily: "'Noto Serif SC', serif",
              transition: 'all 0.15s ease',
              lineHeight: 1.4,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = `${model?.brandColor || '#4F46E5'}40`;
              e.currentTarget.style.background = isNight
                ? `${model?.brandColor || '#4F46E5'}10`
                : `${model?.brandColor || '#4F46E5'}08`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = isNight ? 'rgba(255,255,255,0.08)' : 'rgba(43, 42, 38, 0.06)';
              e.currentTarget.style.background = isNight ? 'rgba(255,255,255,0.02)' : 'rgba(43, 42, 38, 0.02)';
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================
// 单条消息
// ============================================
function ChatMessage({ message, model, isStreaming, isNight, textColor, subTextColor }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
      }}>
        <div style={{
          maxWidth: '80%',
          padding: '12px 18px',
          borderRadius: '18px 18px 6px 18px',
          background: 'linear-gradient(135deg, #9B8EF7 0%, #7C6FF0 100%)',
          color: '#fff',
          fontSize: 14,
          lineHeight: 1.7,
          wordBreak: 'break-word',
          fontWeight: 500,
          boxShadow: '0 4px 16px rgba(124, 111, 240, 0.25)',
        }}>
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      gap: 12,
    }}>
      {/* AI 头像 */}
       <div style={{
         width: 36, height: 36,
         borderRadius: '50%',
         background: `linear-gradient(135deg, #B39DDB 0%, ${model?.brandColor || '#7C6FF0'} 50%, #5B4FE0 100%)`,
         display: 'flex',
         alignItems: 'center',
         justifyContent: 'center',
         color: '#fff',
         fontSize: 16,
         flexShrink: 0,
         marginTop: 2,
         boxShadow: `0 4px 12px ${model?.brandColor || '#7C6FF0'}40, inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -2px 6px rgba(0,0,0,0.1)`,
         animation: 'floatY 4s ease-in-out infinite',
       }}>
         ◈
       </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 6,
        }}>
          <span style={{
            fontSize: 12,
            fontWeight: 500,
            fontFamily: "'Noto Serif SC', serif",
            color: textColor,
          }}>
            {model?.name || 'AI'}
          </span>
          {model?.hasSoulBound && (
            <span style={{
              fontSize: 9,
              padding: '1px 6px',
              borderRadius: 8,
              background: `${model.brandColor}15`,
              color: model.brandColor,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              灵魂共生
            </span>
          )}
          <span style={{
            fontSize: 10,
            color: subTextColor,
            opacity: 0.6,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {message.time}
          </span>
        </div>
        <div style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px) saturate(180%)',
          WebkitBackdropFilter: 'blur(12px) saturate(180%)',
          borderRadius: '8px 20px 20px 20px',
          border: '1px solid rgba(255, 255, 255, 0.9)',
          padding: '14px 18px',
          fontSize: 14,
          lineHeight: 1.75,
          color: '#2D3748',
          boxShadow: '0 4px 16px rgba(45, 55, 72, 0.06)',
          color: textColor,
        }}>
          <MarkdownRenderer content={message.content} isNight={isNight} textColor={textColor} />
          {isStreaming && (
            <span style={{
              display: 'inline-block',
              width: 2,
              height: 16,
              background: model?.brandColor || '#4F46E5',
              marginLeft: 2,
              verticalAlign: 'text-bottom',
              animation: 'blink 1s infinite',
            }} />
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Markdown 简易渲染
// ============================================
function MarkdownRenderer({ content, isNight, textColor }) {
  // 简单的 Markdown 渲染
  const lines = content.split('\n');
  const elements = [];
  let inList = false;
  let inTable = false;
  let tableHeaders = [];

  lines.forEach((line, i) => {
    // 标题
    if (line.startsWith('### ')) {
      if (inList) { inList = false; }
      elements.push(
        <h4 key={i} style={{
          fontSize: 15,
          fontWeight: 600,
          fontFamily: "'Noto Serif SC', serif",
          marginTop: 16,
          marginBottom: 8,
          color: textColor,
        }}>{line.slice(4)}</h4>
      );
      return;
    }
    if (line.startsWith('## ')) {
      if (inList) { inList = false; }
      elements.push(
        <h3 key={i} style={{
          fontSize: 17,
          fontWeight: 600,
          fontFamily: "'Noto Serif SC', serif",
          marginTop: 18,
          marginBottom: 10,
          color: textColor,
        }}>{line.slice(3)}</h3>
      );
      return;
    }
    if (line.startsWith('# ')) {
      if (inList) { inList = false; }
      elements.push(
        <h2 key={i} style={{
          fontSize: 19,
          fontWeight: 600,
          fontFamily: "'Noto Serif SC', serif",
          marginTop: 20,
          marginBottom: 12,
          color: textColor,
        }}>{line.slice(2)}</h2>
      );
      return;
    }

    // 分割线
    if (line.startsWith('---')) {
      elements.push(
        <hr key={i} style={{
          border: 'none',
          borderTop: `1px dashed ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.1)'}`,
          margin: '16px 0',
        }} />
      );
      return;
    }

    // 引用
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={i} style={{
          margin: '10px 0',
          padding: '8px 14px',
          borderLeft: `3px solid ${isNight ? '#6B6960' : '#B5B2A8'}`,
          background: isNight ? 'rgba(255,255,255,0.03)' : 'rgba(43, 42, 38, 0.03)',
          color: isNight ? '#B8B5AD' : '#5A5850',
          fontStyle: 'italic',
          fontFamily: "'Noto Serif SC', serif",
          lineHeight: 1.7,
        }}>
          {renderInlineMarkdown(line.slice(2), isNight)}
        </blockquote>
      );
      return;
    }

    // 表格（简化处理）
    if (line.startsWith('|') && line.endsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableHeaders = line.split('|').filter(Boolean).map(s => s.trim());
        elements.push(
          <table key={i} style={{
            width: '100%',
            borderCollapse: 'collapse',
            margin: '12px 0',
            fontSize: 13,
          }}>
            <thead>
              <tr>
                {tableHeaders.map((h, hi) => (
                  <th key={hi} style={{
                    padding: '8px 12px',
                    textAlign: 'left',
                    borderBottom: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(43, 42, 38, 0.1)'}`,
                    fontWeight: 500,
                    fontSize: 12,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody id={`tb-${i}`} />
          </table>
        );
      } else {
        const cells = line.split('|').filter(Boolean).map(s => s.trim());
        // 跳过分隔行
        if (cells.every(c => /^[-:]+$/.test(c))) return;
        const lastTable = elements[elements.length - 1];
        // 找到 tbody 添加行
        if (lastTable && lastTable.type === 'table') {
          const newRow = (
            <tr key={`r-${i}`}>
              {cells.map((c, ci) => (
                <td key={ci} style={{
                  padding: '8px 12px',
                  borderBottom: `1px solid ${isNight ? 'rgba(255,255,255,0.05)' : 'rgba(43, 42, 38, 0.05)'}`,
                }}>{renderInlineMarkdown(c, isNight)}</td>
              ))}
            </tr>
          );
          // 简化：直接替换整表
          // 这里用一个更简单的方式
        }
      }
      return;
    }

    // 列表项
    if (/^[-*] /.test(line)) {
      if (!inList) {
        inList = true;
      }
      elements.push(
        <div key={i} style={{
          display: 'flex',
          gap: 8,
          paddingLeft: 8,
          margin: '4px 0',
          lineHeight: 1.7,
        }}>
          <span style={{ color: '#B56B3A', flexShrink: 0 }}>•</span>
          <span>{renderInlineMarkdown(line.slice(2), isNight)}</span>
        </div>
      );
      return;
    }

    // 有序列表
    if (/^\d+\. /.test(line)) {
      const match = line.match(/^(\d+)\. (.*)/);
      elements.push(
        <div key={i} style={{
          display: 'flex',
          gap: 8,
          paddingLeft: 8,
          margin: '4px 0',
          lineHeight: 1.7,
        }}>
          <span style={{ color: '#6B6960', flexShrink: 0, fontFamily: "'JetBrains Mono', monospace" }}>
            {match[1]}.
          </span>
          <span>{renderInlineMarkdown(match[2], isNight)}</span>
        </div>
      );
      return;
    }

    // 空行
    if (line.trim() === '') {
      if (inList) inList = false;
      if (inTable) inTable = false;
      elements.push(<div key={i} style={{ height: 8 }} />);
      return;
    }

    // 普通段落
    if (inList) inList = false;
    elements.push(
      <p key={i} style={{
        margin: '6px 0',
        lineHeight: 1.7,
      }}>
        {renderInlineMarkdown(line, isNight)}
      </p>
    );
  });

  return <div>{elements}</div>;
}

// 行内 Markdown 渲染（加粗、代码、双链）
function renderInlineMarkdown(text, isNight) {
  const parts = [];
  let remaining = text;
  let key = 0;

  // 匹配 [[双链]]
  const linkRegex = /\[\[([^\]]+)\]\]/g;
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={`t-${key++}`}>
          {renderInlineStyles(text.slice(lastIndex, match.index), isNight)}
        </span>
      );
    }
    parts.push(
      <span key={`l-${key++}`} style={{
        color: '#4F46E5',
        borderBottom: `1px dashed ${isNight ? 'rgba(79, 70, 229, 0.5)' : 'rgba(79, 70, 229, 0.4)'}`,
        cursor: 'pointer',
        padding: '0 1px',
      }}>
        [[{match[1]}]]
      </span>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(
      <span key={`t-${key++}`}>
        {renderInlineStyles(text.slice(lastIndex), isNight)}
      </span>
    );
  }

  return parts;
}

function renderInlineStyles(text, isNight) {
  // 处理 **加粗** 和 `code`
  const parts = [];
  let remaining = text;
  let key = 0;

  // 简单的状态机
  let i = 0;
  let buffer = '';
  while (i < text.length) {
    if (text.substr(i, 2) === '**') {
      if (buffer) {
        parts.push(<span key={`b-${key++}`}>{buffer}</span>);
        buffer = '';
      }
      // 找结束
      const end = text.indexOf('**', i + 2);
      if (end === -1) {
        buffer += text.substr(i);
        i = text.length;
      } else {
        parts.push(
          <strong key={`s-${key++}`} style={{ fontWeight: 600 }}>
            {text.slice(i + 2, end)}
          </strong>
        );
        i = end + 2;
      }
    } else if (text[i] === '`') {
      if (buffer) {
        parts.push(<span key={`c-${key++}`}>{buffer}</span>);
        buffer = '';
      }
      const end = text.indexOf('`', i + 1);
      if (end === -1) {
        buffer += text.substr(i);
        i = text.length;
      } else {
        parts.push(
          <code key={`code-${key++}`} style={{
            padding: '1px 5px',
            borderRadius: 4,
            background: isNight ? 'rgba(255,255,255,0.08)' : 'rgba(43, 42, 38, 0.06)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.9em',
            color: isNight ? '#C97B3A' : '#B56B3A',
          }}>
            {text.slice(i + 1, end)}
          </code>
        );
        i = end + 1;
      }
    } else {
      buffer += text[i];
      i++;
    }
  }
  if (buffer) parts.push(<span key={`e-${key++}`}>{buffer}</span>);

  return parts;
}

// 模拟生成 AI 回复
function generateReply(question, model) {
  const replies = [
    `这是一个很好的问题。让我从几个角度来思考：

## 核心观点

你提的这个问题，本质上触及了[[主体性]]和[[工具异化]]之间的张力。

> 当你开始思考一个工具是否在服务你的时候，你已经在重新夺回主动权了。

## 可以展开的几个方向

1. **从第一性原理出发** — 回到你最根本的需求是什么
2. **从机制设计反推** — 需要什么样的系统来支撑这个需求
3. **从已有认知外推** — 你已经知道的东西能推导出什么

## 下一步

要不要我深入展开其中某一个方向？或者你先说说你自己的想法，我来挑战和补充。`,

    `好的，我来帮你梳理一下。

## 初步结构

**核心问题：** ${question.slice(0, 20)}…

### 一、本质拆解

这个问题可以拆成几个子问题：

- 问题的定义是否清晰
- 有哪些已知的答案
- 哪些是你已经想明白的
- 哪些还是盲区

### 二、相关概念

[[知识升维]] · [[深度思考]] · [[认知边界]]

---

先从哪个角度开始深入？`,

    `嗯，这个想法很有意思。

让我先复述一遍，确保我理解对了：

> 你在探索一种新的可能性，这种可能性挑战了我们习以为常的假设。

## 为什么这个想法有价值

1. 它触及了问题的本质层面，而不是停留在表层
2. 它和你一直以来的[[主体性至上]]理念是一致的
3. 它有机会产生新的认知框架，而不只是解决方案

## 需要警惕的盲区

- 不要因为想法漂亮就忽略了落地的难度
- 别忘了考虑[[反面]]：如果这样做了，代价是什么？

要我继续展开哪个部分？`,
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}

// ============================================
// V2: 人设选择器弹窗
// ============================================
function PersonaSelector({ isOpen, onClose, onSelect, activePersonaId, isNight, textColor, subTextColor }) {
  const [personas, setPersonas] = React.useState([]);

  React.useEffect(() => {
    if (window.PersonaManager) {
      setPersonas(window.PersonaManager.getAllPersonas());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(8px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 480,
          maxHeight: '80vh',
          background: isNight ? '#1a1a1a' : '#ffffff',
          borderRadius: 20,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* 头部 */}
        <div style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${isNight ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: textColor }}>
              选择 AI 人设
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: subTextColor }}>
              不同人设拥有不同的性格、专长和对话风格
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32,
              borderRadius: '50%',
              border: 'none',
              background: isNight ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
              color: subTextColor,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
            }}
          >
            ×
          </button>
        </div>

        {/* 人设列表 */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: 16,
        }}>
          {personas.map(persona => {
            const isActive = persona.id === activePersonaId;
            return (
              <div
                key={persona.id}
                onClick={() => onSelect(persona.id)}
                style={{
                  padding: 16,
                  marginBottom: 12,
                  borderRadius: 14,
                  border: `2px solid ${isActive ? persona.color : (isNight ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)')}`,
                  background: isActive ? `${persona.color}08` : (isNight ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  gap: 14,
                  alignItems: 'flex-start',
                }}
              >
                {/* 图标 */}
                <div style={{
                  width: 48, height: 48,
                  borderRadius: 12,
                  background: `${persona.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  flexShrink: 0,
                }}>
                  {persona.icon}
                </div>

                {/* 信息 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: textColor }}>
                      {persona.name}
                    </span>
                    {persona.isDefault && (
                      <span style={{
                        fontSize: 10,
                        padding: '2px 6px',
                        borderRadius: 4,
                        background: `${persona.color}20`,
                        color: persona.color,
                        fontWeight: 600,
                      }}>
                        默认
                      </span>
                    )}
                    {isActive && (
                      <span style={{
                        fontSize: 10,
                        padding: '2px 6px',
                        borderRadius: 4,
                        background: persona.color,
                        color: '#fff',
                        fontWeight: 600,
                      }}>
                        当前
                      </span>
                    )}
                  </div>
                  <p style={{
                    margin: 0,
                    fontSize: 12,
                    color: subTextColor,
                    lineHeight: 1.5,
                  }}>
                    {persona.description}
                  </p>
                  {/* 参数标签 */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <span style={{
                      fontSize: 10,
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: isNight ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                      color: subTextColor,
                    }}>
                      温度 {persona.temperature}
                    </span>
                    <span style={{
                      fontSize: 10,
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: isNight ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                      color: subTextColor,
                    }}>
                      {persona.maxTokens} tokens
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 底部提示 */}
        <div style={{
          padding: '12px 24px',
          borderTop: `1px solid ${isNight ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
          textAlign: 'center',
        }}>
          <p style={{ margin: 0, fontSize: 11, color: subTextColor }}>
            切换人设将开启新对话，每个人设拥有独立的对话历史
          </p>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  AIView,
  ConversationSidebar,
  ConversationItem,
  ModelSelector,
  ChatArea,
  EmptyChatState,
  ChatMessage,
  MarkdownRenderer,
  renderInlineMarkdown,
  renderInlineStyles,
  generateReply,
  PersonaSelector,
});
