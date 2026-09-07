// ============================================
// 设置中心 — 统一设置入口
// ============================================

function SettingsDialog({ isOpen, onClose, activeSection = 'general', isNight, textColor, subTextColor }) {
  const t = DESIGN_TOKENS;
  const [section, setSection] = React.useState(activeSection);

  const sections = [
    { id: 'general', label: '通用', icon: '⚙' },
    { id: 'knowledge', label: '知识库', icon: '◈' },
    { id: 'ai', label: 'AI 共生体', icon: '◇' },
    { id: 'social', label: '社交', icon: '◉' },
    { id: 'voice', label: '语音', icon: '🎙' },
    { id: 'data', label: '数据', icon: '⬚' },
    { id: 'about', label: '关于', icon: 'ⓘ' },
  ];

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(6px)',
        zIndex: 3000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn 200ms ease both',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 760,
          maxWidth: '90vw',
          height: '75vh',
          maxHeight: 620,
          background: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderRadius: t.radius.xxl,
          border: '1px solid rgba(255, 255, 255, 0.9)',
          boxShadow: '0 24px 64px rgba(45, 55, 72, 0.2),',
          display: 'flex',
          overflow: 'hidden',
          animation: 'fadeInUp 350ms cubic-bezier(0.2, 0.8, 0.2, 1) both',
        }}
      >
        {/* 侧边导航 */}
        <div style={{
          width: 180,
          flexShrink: 0,
          padding: '20px 12px',
          borderRight: '1px solid rgba(45, 55, 72, 0.06)',
          background: 'rgba(45, 55, 72, 0.02)',
        }}>
          <div style={{
            fontSize: 18,
            fontWeight: 600,
            fontFamily: t.fonts.serif,
            color: t.colors.textPrimary,
            marginBottom: 16,
            padding: '0 12px',
          }}>
            设置
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 12px',
                  borderRadius: t.radius.md,
                  border: 'none',
                  background: section === s.id ? t.colors.accentPrimarySoft : 'transparent',
                  color: section === s.id ? t.colors.accentPrimary : t.colors.textSecondary,
                  fontSize: 13,
                  fontWeight: section === s.id ? 500 : 400,
                  fontFamily: section === s.id ? t.fonts.serif : t.fonts.sans,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: t.transition.fast,
                }}
                onMouseEnter={(e) => {
                  if (section !== s.id) {
                    e.currentTarget.style.background = t.colors.bgGlass;
                    e.currentTarget.style.color = t.colors.textPrimary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (section !== s.id) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = t.colors.textSecondary;
                  }
                }}
              >
                <span style={{ width: 18, textAlign: 'center', fontSize: 14 }}>{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* 设置内容 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
          {section === 'general' && <SettingsGeneral />}
          {section === 'knowledge' && <SettingsKnowledge />}
          {section === 'ai' && <SettingsAI />}
          {section === 'social' && <SettingsSocial />}
          {section === 'voice' && <SettingsVoice />}
          {section === 'data' && <SettingsData />}
          {section === 'about' && <SettingsAbout />}
        </div>

        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 32, height: 32,
            borderRadius: '50%',
            border: 'none',
            background: t.colors.bgGlass,
            color: t.colors.textSecondary,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: t.transition.fast,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = t.colors.bgGlassHover;
            e.currentTarget.style.color = t.colors.textPrimary;
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function SettingRow({ label, desc, children }) {
  const t = DESIGN_TOKENS;
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 20,
      padding: '14px 0',
      borderBottom: `1px solid ${t.colors.borderSubtle}`,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 14,
          color: t.colors.textPrimary,
          marginBottom: 4,
          fontFamily: t.fonts.serif,
          fontWeight: 500,
        }}>
          {label}
        </div>
        {desc && (
          <div style={{
            fontSize: 12,
            color: t.colors.textTertiary,
            lineHeight: 1.5,
          }}>
            {desc}
          </div>
        )}
      </div>
      <div style={{ flexShrink: 0 }}>
        {children}
      </div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange, label }) {
  const t = DESIGN_TOKENS;
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        position: 'relative',
        width: 44,
        height: 26,
        borderRadius: 13,
        border: 'none',
        background: checked ? t.colors.accentPrimary : t.colors.bgGlass,
        cursor: 'pointer',
        transition: t.transition.fast,
        border: `1px solid ${checked ? t.colors.accentPrimary : t.colors.borderGlass}`,
      }}
    >
      <div style={{
        position: 'absolute',
        top: 2,
        left: checked ? 20 : 2,
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: checked ? '#fff' : t.colors.textTertiary,
        transition: t.transition.base,
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  );
}

// --- 各设置面板 ---

function SettingsGeneral() {
  const t = DESIGN_TOKENS;
  const [theme, setTheme] = React.useState('dark');
  const [fontSize, setFontSize] = React.useState('medium');
  const [autoSave, setAutoSave] = React.useState(true);

  return (
    <div>
      <h2 style={{
        fontSize: 20,
        fontWeight: 600,
        fontFamily: t.fonts.serif,
        color: t.colors.textPrimary,
        marginBottom: 6,
      }}>
        通用设置
      </h2>
      <p style={{
        fontSize: 13,
        color: t.colors.textTertiary,
        marginBottom: 24,
      }}>
        界面外观、字体与交互习惯
      </p>

      <SettingRow
        label="主题"
        desc="深色为默认主题，更适合长时间深度思考。"
      >
        <div style={{ display: 'flex', gap: 8 }}>
          {['dark', 'light', 'auto'].map(opt => (
            <button
              key={opt}
              onClick={() => setTheme(opt)}
              style={{
                padding: '6px 14px',
                borderRadius: t.radius.md,
                border: `1px solid ${theme === opt ? t.colors.accentPrimary : t.colors.borderGlass}`,
                background: theme === opt ? t.colors.accentPrimarySoft : t.colors.bgGlass,
                color: theme === opt ? t.colors.accentPrimary : t.colors.textSecondary,
                fontSize: 12,
                cursor: 'pointer',
                fontFamily: t.fonts.serif,
                fontWeight: theme === opt ? 500 : 400,
              }}
            >
              {opt === 'dark' ? '深色' : opt === 'light' ? '浅色' : '跟随系统'}
            </button>
          ))}
        </div>
      </SettingRow>

      <SettingRow
        label="基础字号"
        desc="调整界面文字的整体大小。"
      >
        <div style={{ display: 'flex', gap: 8 }}>
          {['small', 'medium', 'large'].map(opt => (
            <button
              key={opt}
              onClick={() => setFontSize(opt)}
              style={{
                padding: '6px 14px',
                borderRadius: t.radius.md,
                border: `1px solid ${fontSize === opt ? t.colors.accentPrimary : t.colors.borderGlass}`,
                background: fontSize === opt ? t.colors.accentPrimarySoft : t.colors.bgGlass,
                color: fontSize === opt ? t.colors.accentPrimary : t.colors.textSecondary,
                fontSize: 12,
                cursor: 'pointer',
                fontWeight: fontSize === opt ? 500 : 400,
              }}
            >
              {opt === 'small' ? '小' : opt === 'medium' ? '中' : '大'}
            </button>
          ))}
        </div>
      </SettingRow>

      <SettingRow
        label="自动保存"
        desc="编辑笔记时自动保存，无需手动操作。"
      >
        <ToggleSwitch checked={autoSave} onChange={setAutoSave} />
      </SettingRow>

      <SettingRow
        label="动画效果"
        desc="关闭所有动效，提升性能或减少干扰。"
      >
        <ToggleSwitch checked={true} onChange={() => {}} />
      </SettingRow>

      <SettingRow
        label="快捷键提示"
        desc="在可交互元素旁显示对应的快捷键。"
      >
        <ToggleSwitch checked={true} onChange={() => {}} />
      </SettingRow>
    </div>
  );
}

function SettingsKnowledge() {
  const t = DESIGN_TOKENS;
  return (
    <div>
      <h2 style={{
        fontSize: 20,
        fontWeight: 600,
        fontFamily: t.fonts.serif,
        color: t.colors.textPrimary,
        marginBottom: 6,
      }}>
        知识库设置
      </h2>
      <p style={{
        fontSize: 13,
        color: t.colors.textTertiary,
        marginBottom: 24,
      }}>
        笔记存储、自动整理与知识结构
      </p>

      <SettingRow
        label="存储位置"
        desc="所有笔记以 Markdown 格式存储在此文件夹。"
      >
        <div style={{
          padding: '6px 12px',
          borderRadius: t.radius.sm,
          background: t.colors.bgGlass,
          border: `1px solid ${t.colors.borderGlass}`,
          fontSize: 12,
          fontFamily: t.fonts.mono,
          color: t.colors.textSecondary,
        }}>
          ~/OneOS/notes/
        </div>
      </SettingRow>

      <SettingRow
        label="自动保存间隔"
        desc="编辑器空闲多少秒后自动保存。"
      >
        <div style={{
          padding: '6px 12px',
          borderRadius: t.radius.sm,
          background: t.colors.bgGlass,
          border: `1px solid ${t.colors.borderGlass}`,
          fontSize: 12,
          fontFamily: t.fonts.mono,
          color: t.colors.textSecondary,
        }}>
          3 秒
        </div>
      </SettingRow>

      <SettingRow
        label="双向链接"
        desc="在 [[]] 中输入时自动搜索并创建链接。"
      >
        <ToggleSwitch checked={true} onChange={() => {}} />
      </SettingRow>

      <SettingRow
        label="反向链接面板"
        desc="编辑器右侧显示哪些笔记引用了当前笔记。"
      >
        <ToggleSwitch checked={true} onChange={() => {}} />
      </SettingRow>

      <SettingRow
        label="阅读次数统计规则"
        desc="打开笔记超过 30 秒计为一次有效阅读，用于升维建议。"
      >
        <ToggleSwitch checked={true} onChange={() => {}} />
      </SettingRow>

      <SettingRow
        label="自动升维建议"
        desc="当笔记阅读次数达到阈值时，建议提炼为卡片。"
      >
        <ToggleSwitch checked={true} onChange={() => {}} />
      </SettingRow>
    </div>
  );
}

function SettingsAI() {
  const t = DESIGN_TOKENS;
  return (
    <div>
      <h2 style={{
        fontSize: 20,
        fontWeight: 600,
        fontFamily: t.fonts.serif,
        color: t.colors.textPrimary,
        marginBottom: 6,
      }}>
        AI 共生体设置
      </h2>
      <p style={{
        fontSize: 13,
        color: t.colors.textTertiary,
        marginBottom: 24,
      }}>
        你的共生体是谁，它如何与你共同成长
      </p>

      <SettingRow
        label="身份锚点"
        desc="定义共生体是谁的核心文本。基于你的笔记生成，确保它像你。"
      >
        <button className="btn-glass" style={{ fontSize: 12 }}>查看锚点</button>
      </SettingRow>

      <SettingRow
        label="自动学习新笔记"
        desc="每次新建笔记后，共生体自动更新身份锚点。"
      >
        <ToggleSwitch checked={true} onChange={() => {}} />
      </SettingRow>

      <SettingRow
        label="对话风格"
        desc="共生体回应你的语言风格。"
      >
        <div style={{ display: 'flex', gap: 8 }}>
          {['克制', '哲思', '温暖', '犀利'].map(opt => (
            <button
              key={opt}
              style={{
                padding: '6px 12px',
                borderRadius: t.radius.sm,
                border: `1px solid ${opt === '哲思' ? t.colors.accentPrimary : t.colors.borderGlass}`,
                background: opt === '哲思' ? t.colors.accentPrimarySoft : t.colors.bgGlass,
                color: opt === '哲思' ? t.colors.accentPrimary : t.colors.textSecondary,
                fontSize: 12,
                cursor: 'pointer',
                fontFamily: t.fonts.serif,
                fontWeight: opt === '哲思' ? 500 : 400,
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      </SettingRow>

      <SettingRow
        label="长时记忆"
        desc="共生体是否可以回忆你过去的对话内容。"
      >
        <ToggleSwitch checked={true} onChange={() => {}} />
      </SettingRow>

      <SettingRow
        label="对话归档"
        desc="每次对话结束后，自动归档为笔记。"
      >
        <ToggleSwitch checked={true} onChange={() => {}} />
      </SettingRow>
    </div>
  );
}

function SettingsSocial() {
  const t = DESIGN_TOKENS;
  return (
    <div>
      <h2 style={{
        fontSize: 20,
        fontWeight: 600,
        fontFamily: t.fonts.serif,
        color: t.colors.textPrimary,
        marginBottom: 6,
      }}>
        社交设置
      </h2>
      <p style={{
        fontSize: 13,
        color: t.colors.textTertiary,
        marginBottom: 24,
      }}>
        权限规则、时间窗口与静默模式
      </p>

      <SettingRow
        label="静默模式"
        desc="所有消息进入静默收件箱，没有红点，没有提醒。"
      >
        <ToggleSwitch checked={true} onChange={() => {}} />
      </SettingRow>

      <SettingRow
        label="时间窗口模式"
        desc="快速选择一种节奏，或自定义精细时间窗口。"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { id: 'quiet', label: '极静模式', desc: '仅周日晚接收所有消息' },
            { id: 'balance', label: '平衡模式', desc: '每天晚8-9点接收，核心圈随时' },
            { id: 'open', label: '开放模式', desc: '工作时间接收，休息时间静默' },
          ].map(opt => (
            <button
              key={opt.id}
              style={{
                padding: '8px 14px',
                borderRadius: t.radius.md,
                border: `1px solid ${opt.id === 'balance' ? t.colors.accentPrimary : t.colors.borderGlass}`,
                background: opt.id === 'balance' ? t.colors.accentPrimarySoft : t.colors.bgGlass,
                color: opt.id === 'balance' ? t.colors.accentPrimary : t.colors.textSecondary,
                fontSize: 12,
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                minWidth: 180,
              }}
            >
              <span style={{ fontWeight: opt.id === 'balance' ? 500 : 400, fontFamily: opt.id === 'balance' ? t.fonts.serif : t.fonts.sans }}>
                {opt.label}
              </span>
              <span style={{ fontSize: 10, opacity: 0.7 }}>{opt.desc}</span>
            </button>
          ))}
          <button style={{
            padding: '8px 14px',
            borderRadius: t.radius.md,
            border: `1px dashed ${t.colors.borderGlass}`,
            background: 'transparent',
            color: t.colors.textTertiary,
            fontSize: 12,
            cursor: 'pointer',
            textAlign: 'left',
          }}>
            ⚙ 自定义高级设置
          </button>
        </div>
      </SettingRow>

      <SettingRow
        label="已读标记"
        desc="消息阅读后标记为已读（仅你自己可见，对方看不到）。"
      >
        <ToggleSwitch checked={true} onChange={() => {}} />
      </SettingRow>
    </div>
  );
}

function SettingsVoice() {
  const t = DESIGN_TOKENS;
  return (
    <div>
      <h2 style={{
        fontSize: 20,
        fontWeight: 600,
        fontFamily: t.fonts.serif,
        color: t.colors.textPrimary,
        marginBottom: 6,
      }}>
        语音设置
      </h2>
      <p style={{
        fontSize: 13,
        color: t.colors.textTertiary,
        marginBottom: 24,
      }}>
        语音输入、朗读与音色管理
      </p>

      <SettingRow
        label="语音输入语言"
        desc="语音转写时使用的主要语言。"
      >
        <div style={{
          padding: '6px 12px',
          borderRadius: t.radius.sm,
          background: t.colors.bgGlass,
          border: `1px solid ${t.colors.borderGlass}`,
          fontSize: 12,
          color: t.colors.textSecondary,
          fontFamily: t.fonts.serif,
        }}>
          中文（普通话）
        </div>
      </SettingRow>

      <SettingRow
        label="转写后需确认"
        desc="松开录音后先显示转写结果，确认后再归档。方便修正识别错误。"
      >
        <ToggleSwitch checked={true} onChange={() => {}} />
      </SettingRow>

      <SettingRow
        label="不确定字词标记"
        desc="系统识别不确定的字词，用下划线标记提示检查。"
      >
        <ToggleSwitch checked={true} onChange={() => {}} />
      </SettingRow>

      <div style={{
        padding: '16px 18px',
        borderRadius: t.radius.lg,
        background: t.colors.accentGreenSoft,
        border: `1px solid ${t.colors.accentGreen}30`,
        marginTop: 20,
        marginBottom: 16,
      }}>
        <div style={{
          fontSize: 12,
          fontWeight: 500,
          color: t.colors.accentGreen,
          marginBottom: 6,
          fontFamily: t.fonts.serif,
        }}>
          🔒 你的声音数据
        </div>
        <div style={{
          fontSize: 11,
          color: t.colors.textSecondary,
          lineHeight: 1.6,
        }}>
          · 声音样本仅用于生成你的个人声音模型<br />
          · 原始录音在模型生成后自动删除<br />
          · 你可以随时删除声音模型<br />
          · 你的声音仅在你授权的范围内被使用
        </div>
      </div>

      <SettingRow
        label="我的音色"
        desc="你已录制了个人声音模型。可随时删除。"
      >
        <button className="btn-glass" style={{ fontSize: 12 }}>管理音色</button>
      </SettingRow>
    </div>
  );
}

function SettingsData() {
  const t = DESIGN_TOKENS;
  return (
    <div>
      <h2 style={{
        fontSize: 20,
        fontWeight: 600,
        fontFamily: t.fonts.serif,
        color: t.colors.textPrimary,
        marginBottom: 6,
      }}>
        数据管理
      </h2>
      <p style={{
        fontSize: 13,
        color: t.colors.textTertiary,
        marginBottom: 24,
      }}>
        本地优先，数据永远属于你
      </p>

      <SettingRow label="总笔记数" desc="所有文件夹中的 Markdown 笔记总数">
        <span style={{
          fontSize: 18,
          fontWeight: 600,
          color: t.colors.accentPrimary,
          fontFamily: t.fonts.mono,
        }}>
          247
        </span>
      </SettingRow>

      <SettingRow label="总字数" desc="所有笔记的文字总量">
        <span style={{
          fontSize: 14,
          color: t.colors.textPrimary,
          fontFamily: t.fonts.mono,
        }}>
          128,452 字
        </span>
      </SettingRow>

      <SettingRow label="存储空间" desc="本地占用空间（含附件）">
        <span style={{
          fontSize: 14,
          color: t.colors.textPrimary,
          fontFamily: t.fonts.mono,
        }}>
          42.8 MB
        </span>
      </SettingRow>

      <SettingRow label="导出所有数据" desc="导出为 Markdown 压缩包，包含所有笔记和配置。">
        <button className="btn-glass" style={{ fontSize: 12 }}>导出 MD 包</button>
      </SettingRow>

      <SettingRow label="导入数据" desc="从其他笔记软件或 Markdown 文件夹导入。">
        <button className="btn-glass" style={{ fontSize: 12 }}>选择文件夹</button>
      </SettingRow>
    </div>
  );
}

function SettingsAbout() {
  const t = DESIGN_TOKENS;
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{
        width: 64, height: 64,
        margin: '0 auto 20px',
        borderRadius: 20,
        background: `linear-gradient(135deg, ${t.colors.accentPrimary}, #9B8EF7)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 8px 32px ${t.colors.accentPrimaryGlow}`,
      }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" />
        </svg>
      </div>
      <h2 style={{
        fontSize: 24,
        fontWeight: 600,
        fontFamily: t.fonts.serif,
        color: t.colors.textPrimary,
        marginBottom: 6,
      }}>
        OneOS Core
      </h2>
      <p style={{
        fontSize: 13,
        color: t.colors.textTertiary,
        marginBottom: 8,
        fontFamily: t.fonts.mono,
      }}>
        版本 1.0.0 · 构建 2026.08.19
      </p>
      <p style={{
        fontSize: 13,
        color: t.colors.textSecondary,
        lineHeight: 1.8,
        maxWidth: 360,
        margin: '0 auto',
        fontFamily: t.fonts.serif,
      }}>
        以本地 Markdown 为唯一数据结构<br />
        以个人知识图谱为核心界面<br />
        灵魂级个人操作系统
      </p>

      <div style={{
        marginTop: 28,
        padding: '16px 20px',
        borderRadius: t.radius.lg,
        background: t.colors.bgGlass,
        border: `1px solid ${t.colors.borderGlass}`,
        fontSize: 11,
        color: t.colors.textTertiary,
        lineHeight: 1.7,
        textAlign: 'left',
        maxWidth: 360,
        margin: '28px auto 0',
      }}>
        <p style={{ margin: '0 0 6px', color: t.colors.textSecondary, fontWeight: 500 }}>
          产品哲学
        </p>
        <p style={{ margin: 0 }}>
          工具服务于人 · 本地优先 · 零打扰<br />
          主体性至上 · 界面极简 · 深度思考
        </p>
      </div>
    </div>
  );
}

Object.assign(window, {
  SettingsDialog,
  SettingRow,
  ToggleSwitch,
});
