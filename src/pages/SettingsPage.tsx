import type { ThemeKey } from '../types/global';
import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '../stores/settings-store';
import { useAppStore } from '../stores/app-store';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Tag } from '../components/ui/Tag';
import { Icon, IconName } from '../components/ui/Icon';
import { useToast } from '../components/ui/Toast';
import { performanceMonitor } from '../shared/kernel/performance-monitor';
import { errorMonitor } from '../shared/kernel/error-monitor';

type SettingsTab = 'appearance' | 'ai' | 'data' | 'shortcuts' | 'performance' | 'about';

export const SettingsPage: React.FC = () => {
  const { settings, updateSetting, exportSettings, importSettings, resetSettings } = useSettingsStore();
  const { theme, setTheme } = useAppStore();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [apiKey, setApiKey] = useState('');

  const tabConfig: Array<{ key: SettingsTab; label: string; icon: IconName }> = [
    { key: 'appearance', label: '外观', icon: 'palette' },
    { key: 'ai', label: 'AI设置', icon: 'sparkles' },
    { key: 'data', label: '数据管理', icon: 'database' },
    { key: 'shortcuts', label: '快捷键', icon: 'keyboard' },
    { key: 'performance', label: '性能监控', icon: 'activity' },
    { key: 'about', label: '关于', icon: 'info' },
  ];

  const themeOptions = [
    { key: 'light', label: '浅色', icon: 'sun' as IconName, color: '#FDCB6E' },
    { key: 'dark', label: '深色', icon: 'moon' as IconName, color: '#636E72' },
    { key: 'system', label: '跟随系统', icon: 'monitor' as IconName, color: '#74B9FF' },
  ];

  const accentColors = [
    { key: '#8B5CF6', name: '紫罗兰' },
    { key: '#00CEC9', name: '青色' },
    { key: '#FD79A8', name: '粉色' },
    { key: '#FDCB6E', name: '橙色' },
    { key: '#00B894', name: '绿色' },
    { key: '#74B9FF', name: '蓝色' },
  ];

  const shortcuts = [
    { keys: ['⌘', 'K'], action: '打开命令面板' },
    { keys: ['⌘', 'N'], action: '新建笔记' },
    { keys: ['⌘', 'S'], action: '保存笔记' },
    { keys: ['⌘', 'B'], action: '加粗' },
    { keys: ['⌘', 'I'], action: '斜体' },
    { keys: ['⌘', 'Z'], action: '撤销' },
    { keys: ['⌘', 'Shift', 'Z'], action: '重做' },
    { keys: ['⌘', '1-9'], action: '切换板块' },
    { keys: ['Esc'], action: '关闭弹窗/退出' },
  ];

  const handleExport = () => { exportSettings(); toast.success('设置已导出'); };
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try { importSettings(JSON.parse(event.target?.result as string)); toast.success('设置已导入'); }
        catch { toast.error('导入失败，文件格式不正确'); }
      };
      reader.readAsText(file);
    }
  };
  const handleReset = () => { resetSettings(); setShowResetConfirm(false); toast.success('已恢复默认设置'); };

  return (
    <div style={{ height: '100%', display: 'flex', gap: 24 }}>
      <div style={{ width: 200, flexShrink: 0 }}>
        <Card style={{ padding: 8 }}>
          {tabConfig.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', borderRadius: 8, border: 'none', background: activeTab === tab.key ? 'var(--color-primary-50)' : 'transparent', color: activeTab === tab.key ? 'var(--color-primary-600)' : 'var(--text-secondary)', fontSize: 14, fontWeight: activeTab === tab.key ? 600 : 500, cursor: 'pointer', textAlign: 'left', marginBottom: 2 }}>
              <Icon name={tab.icon} size="sm" />{tab.label}
            </button>
          ))}
        </Card>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {activeTab === 'appearance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Card>
              <CardHeader title="主题模式" subtitle="选择你喜欢的界面主题" />
              <CardBody>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {themeOptions.map((option) => (
                    <button key={option.key} onClick={() => { setTheme(option.key as ThemeKey); updateSetting('theme', option.key); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: 20, borderRadius: 12, border: '2px solid', borderColor: theme === option.key ? option.color : 'var(--border-light)', background: theme === option.key ? `${option.color}08` : '#FFFFFF', cursor: 'pointer' }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: `${option.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={option.icon} size="lg" color={option.color} /></div>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{option.label}</span>
                    </button>
                  ))}
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="强调色" subtitle="选择界面的主色调" />
              <CardBody>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  {accentColors.map((color) => (
                    <button key={color.key} onClick={() => { document.documentElement.style.setProperty('--color-primary-500', color.key); updateSetting('accentColor', color.key); toast.success(`已切换为${color.name}`); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 12, borderRadius: 10, border: '2px solid', borderColor: settings.accentColor === color.key ? color.key : 'transparent', background: 'transparent', cursor: 'pointer' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: color.key, boxShadow: settings.accentColor === color.key ? `0 0 0 3px ${color.key}40` : 'none' }} />
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{color.name}</span>
                    </button>
                  ))}
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="字体大小" subtitle="调整界面文字大小" />
              <CardBody>
                <div style={{ display: 'flex', gap: 12 }}>
                  {[{ key: 'small', label: '小', value: '13px' }, { key: 'medium', label: '中', value: '15px' }, { key: 'large', label: '大', value: '17px' }].map((size) => (
                    <button key={size.key} onClick={() => { document.documentElement.style.fontSize = size.value; updateSetting('fontSize', size.key); }} style={{ flex: 1, padding: 16, borderRadius: 10, border: '2px solid', borderColor: settings.fontSize === size.key ? 'var(--color-primary-400)' : 'var(--border-light)', background: settings.fontSize === size.key ? 'var(--color-primary-50)' : '#FFFFFF', cursor: 'pointer', fontSize: parseInt(size.value), fontWeight: settings.fontSize === size.key ? 600 : 400 }}>
                      {size.label}
                    </button>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {activeTab === 'ai' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Card>
              <CardHeader title="AI模型配置" subtitle="配置AI对话的模型和API" />
              <CardBody>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>API 密钥</label>
                    <Input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="输入你的API密钥" suffix={<Button variant="ghost" size="sm" onClick={() => { updateSetting('apiKey', apiKey); toast.success('API密钥已保存'); }}>保存</Button>} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>默认模型</label>
                    <select value={settings.aiModel || 'default'} onChange={(e) => updateSetting('aiModel', e.target.value)} style={{ width: '100%', height: 40, padding: '0 12px', borderRadius: 8, border: '1px solid var(--border-default)', fontSize: 14, cursor: 'pointer', outline: 'none' }}>
                      <option value="default">默认模型（推荐）</option>
                      <option value="fast">快速模型</option>
                      <option value="creative">创意模型</option>
                      <option value="code">代码模型</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>温度（创造性）</label>
                    <input type="range" min="0" max="100" value={(settings.aiTemperature || 0.7) * 100} onChange={(e) => updateSetting('aiTemperature', parseInt(e.target.value) / 100)} style={{ width: '100%' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}><span>精确（0）</span><span>当前: {settings.aiTemperature || 0.7}</span><span>创意（1）</span></div>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="AI功能开关" subtitle="控制AI相关功能的启用状态" />
              <CardBody>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[{ key: 'aiAutoComplete', label: 'AI自动补全', desc: '在编辑器中提供AI写作建议' }, { key: 'aiSummary', label: 'AI摘要', desc: '自动生成长笔记的摘要' }, { key: 'aiTitle', label: 'AI标题生成', desc: '根据内容自动推荐标题' }, { key: 'streamingResponse', label: '流式响应', desc: 'AI回复逐字显示，减少等待感' }].map((item) => (
                    <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
                      <div><div style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</div><div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{item.desc}</div></div>
                      <button onClick={() => updateSetting(item.key, !settings[item.key as keyof typeof settings])} style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', background: settings[item.key as keyof typeof settings] ? 'var(--color-primary-500)' : 'var(--color-neutral-300)', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: 2, left: settings[item.key as keyof typeof settings] ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
                      </button>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {activeTab === 'data' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Card>
              <CardHeader title="数据导入导出" subtitle="备份和迁移你的数据" />
              <CardBody>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                  <Button variant="secondary" size="md" onClick={handleExport}><Icon name="download" size="sm" /> 导出所有数据</Button>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 16px', borderRadius: 8, border: '1px solid var(--border-default)', background: '#FFFFFF', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
                    <Icon name="upload" size="sm" /> 导入数据
                    <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
                  </label>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="存储信息" subtitle="本地存储使用情况" />
              <CardBody>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}><span style={{ color: 'var(--text-secondary)' }}>已使用</span><span style={{ fontWeight: 600 }}>约 2.3 MB</span></div>
                  <div style={{ height: 8, background: 'var(--color-neutral-100)', borderRadius: 4, overflow: 'hidden' }}><div style={{ width: '23%', height: '100%', background: 'linear-gradient(90deg, #8B5CF6, #00CEC9)', borderRadius: 4 }} /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  <div style={{ textAlign: 'center', padding: 12, background: 'var(--color-neutral-50)', borderRadius: 8 }}><div style={{ fontSize: 20, fontWeight: 800 }}>{useNoteStore.getState().notes.length}</div><div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>笔记</div></div>
                  <div style={{ textAlign: 'center', padding: 12, background: 'var(--color-neutral-50)', borderRadius: 8 }}><div style={{ fontSize: 20, fontWeight: 800 }}>{useAIStore.getState().conversations.length}</div><div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>对话</div></div>
                  <div style={{ textAlign: 'center', padding: 12, background: 'var(--color-neutral-50)', borderRadius: 8 }}><div style={{ fontSize: 20, fontWeight: 800 }}>{useSocialStore.getState().persons.length}</div><div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>联系人</div></div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="危险操作" subtitle="这些操作不可逆，请谨慎操作" />
              <CardBody>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
                  <div><div style={{ fontSize: 14, fontWeight: 500 }}>恢复默认设置</div><div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>将所有设置恢复为出厂默认值，不影响你的数据</div></div>
                  <Button variant="danger" size="sm" onClick={() => setShowResetConfirm(true)}>恢复默认</Button>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {activeTab === 'shortcuts' && (
          <Card>
            <CardHeader title="键盘快捷键" subtitle="使用快捷键提高操作效率" />
            <CardBody>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {shortcuts.map((shortcut, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: index < shortcuts.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                    <span style={{ fontSize: 14 }}>{shortcut.action}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {shortcut.keys.map((key, i) => (
                        <kbd key={i} style={{ minWidth: 28, height: 28, padding: '0 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-neutral-100)', border: '1px solid var(--border-default)', borderRadius: 6, fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{key}</kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {activeTab === 'performance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <PerformancePanel />
          </div>
        )}

        {activeTab === 'about' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Card style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ width: 80, height: 80, borderRadius: 20, background: 'linear-gradient(135deg, #8B5CF6, #00CEC9)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 12px 32px rgba(139,92,246,0.3)' }}><Icon name="zap" size="xl" color="#FFFFFF" /></div>
              <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, marginBottom: 8 }}>OneOS</h1>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: 0, marginBottom: 4 }}>个人知识操作系统</p>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)', margin: 0 }}>版本 1.1.0 (V12 20260824)</p>
            </Card>
            <Card>
              <CardHeader title="关于 OneOS" />
              <CardBody><p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-secondary)', margin: 0 }}>OneOS 是一个融合笔记管理、知识图谱、AI对话、社交和语音交互的个人知识操作系统。我们相信知识应该是流动的、连接的、可被探索的。OneOS 帮助你将碎片化的思考整合为结构化的知识网络，让每一个想法都能找到它的位置，让每一次记录都能产生价值。</p></CardBody>
            </Card>
            <Card>
              <CardHeader title="技术栈" />
              <CardBody>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {['React 18', 'TypeScript', 'Zustand', 'IndexedDB', 'Vite', 'DDD架构', '设计系统V3'].map((tech) => <Tag key={tech} variant="primary" size="md">{tech}</Tag>)}
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>

      {showResetConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowResetConfirm(false)}>
          <div style={{ background: '#FFFFFF', borderRadius: 16, padding: 24, maxWidth: 400, width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, marginBottom: 12 }}>恢复默认设置</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0, marginBottom: 20 }}>确定要将所有设置恢复为默认值吗？此操作不会影响你的笔记和数据。</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <Button variant="ghost" size="sm" onClick={() => setShowResetConfirm(false)}>取消</Button>
              <Button variant="danger" size="sm" onClick={handleReset}>恢复默认</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 性能监控面板组件
const PerformancePanel: React.FC = () => {
  const [metrics, setMetrics] = useState(performanceMonitor.getMetrics());
  const [evaluation, setEvaluation] = useState(performanceMonitor.evaluatePerformance());
  const [errorStats, setErrorStats] = useState(errorMonitor.getErrorStats());
  const [errors, setErrors] = useState(errorMonitor.getErrors().slice(-10).reverse());

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(performanceMonitor.getMetrics());
      setEvaluation(performanceMonitor.evaluatePerformance());
      setErrorStats(errorMonitor.getErrorStats());
      setErrors(errorMonitor.getErrors().slice(-10).reverse());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const gradeColors: Record<string, string> = {
    A: '#10B981',
    B: '#3B82F6',
    C: '#F59E0B',
    D: '#EF4444',
  };

  const formatMetric = (value: number | undefined, unit: string = 'ms'): string => {
    if (value === undefined || value === 0) return '—';
    return `${value.toFixed(0)}${unit}`;
  };

  const webVitals = [
    { name: 'LCP', label: '最大内容绘制', value: metrics.LCP, target: '< 2500ms', color: metrics.LCP && metrics.LCP < 2500 ? '#10B981' : metrics.LCP && metrics.LCP < 4000 ? '#F59E0B' : '#EF4444' },
    { name: 'FID', label: '首次输入延迟', value: metrics.FID, target: '< 100ms', color: metrics.FID && metrics.FID < 100 ? '#10B981' : metrics.FID && metrics.FID < 300 ? '#F59E0B' : '#EF4444' },
    { name: 'CLS', label: '累积布局偏移', value: metrics.CLS, target: '< 0.1', color: metrics.CLS && metrics.CLS < 0.1 ? '#10B981' : metrics.CLS && metrics.CLS < 0.25 ? '#F59E0B' : '#EF4444' },
    { name: 'FCP', label: '首次内容绘制', value: metrics.FCP, target: '< 1800ms', color: metrics.FCP && metrics.FCP < 1800 ? '#10B981' : metrics.FCP && metrics.FCP < 3000 ? '#F59E0B' : '#EF4444' },
  ];

  return (
    <>
      {/* 性能评级 */}
      <Card style={{ background: `linear-gradient(135deg, ${gradeColors[evaluation.grade]}10, ${gradeColors[evaluation.grade]}05)` }}>
        <CardBody>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ width: 80, height: 80, borderRadius: 20, background: gradeColors[evaluation.grade], display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 24px ${gradeColors[evaluation.grade]}40` }}>
              <span style={{ fontSize: 36, fontWeight: 800, color: '#FFFFFF' }}>{evaluation.grade}</span>
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0, marginBottom: 4 }}>性能评级</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0, marginBottom: 8 }}>综合得分: {evaluation.score} / 100</p>
              {evaluation.issues.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {evaluation.issues.slice(0, 3).map((issue, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                      <Icon name="warning" size="xs" color="#F59E0B" />
                      {issue}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 13, color: '#10B981', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon name="check" size="sm" /> 性能表现优秀，无明显问题
                </p>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Web Vitals */}
      <Card>
        <CardHeader title="Core Web Vitals" subtitle="核心网页性能指标" />
        <CardBody>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {webVitals.map((metric) => (
              <div key={metric.name} style={{ padding: 16, background: 'var(--color-neutral-50)', borderRadius: 10, border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)' }}>{metric.name}</span>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: metric.color }} />
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: metric.color, marginBottom: 4 }}>
                  {metric.name === 'CLS' ? (metric.value ? metric.value.toFixed(3) : '—') : formatMetric(metric.value)}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{metric.label} · 目标 {metric.target}</div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* 应用性能 */}
      <Card>
        <CardHeader title="应用性能" subtitle="应用加载和运行时性能" />
        <CardBody>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <div style={{ padding: 14, background: 'var(--color-neutral-50)', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>应用加载时间</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-primary-600)' }}>{formatMetric(metrics.appLoadTime)}</div>
            </div>
            <div style={{ padding: 14, background: 'var(--color-neutral-50)', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>首次渲染时间</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-success-600)' }}>{formatMetric(metrics.firstRenderTime)}</div>
            </div>
            <div style={{ padding: 14, background: 'var(--color-neutral-50)', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>TTFB</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-warning-600)' }}>{formatMetric(metrics.TTFB)}</div>
            </div>
            <div style={{ padding: 14, background: 'var(--color-neutral-50)', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>包体积</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-error-600)' }}>{metrics.bundleSize ? `${metrics.bundleSize}KB` : '—'}</div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 错误监控 */}
      <Card>
        <CardHeader
          title="错误监控"
          subtitle={`共 ${errorStats.total} 个错误`}
          action={
            <Button variant="ghost" size="sm" onClick={() => { errorMonitor.clearErrors(); setErrorStats(errorMonitor.getErrorStats()); setErrors([]); }}>
              <Icon name="trash" size="sm" /> 清除
            </Button>
          }
        />
        <CardBody>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
            <div style={{ padding: 12, background: '#FEF2F2', borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#EF4444' }}>{errorStats.criticalCount + errorStats.errorCount}</div>
              <div style={{ fontSize: 11, color: '#991B1B' }}>错误</div>
            </div>
            <div style={{ padding: 12, background: '#FFFBEB', borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#F59E0B' }}>{errorStats.warningCount}</div>
              <div style={{ fontSize: 11, color: '#92400E' }}>警告</div>
            </div>
            <div style={{ padding: 12, background: '#F0FDF4', borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#10B981' }}>{errorStats.total === 0 ? '100' : Math.max(0, 100 - errorStats.total * 5)}%</div>
              <div style={{ fontSize: 11, color: '#065F46' }}>健康度</div>
            </div>
          </div>

          {errors.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflow: 'auto' }}>
              {errors.map((error) => (
                <div key={error.id} style={{ padding: 10, background: 'var(--color-neutral-50)', borderRadius: 8, border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{
                      fontSize: 10,
                      padding: '2px 6px',
                      borderRadius: 4,
                      fontWeight: 600,
                      background: error.level === 'critical' || error.level === 'error' ? '#FEF2F2' : '#FFFBEB',
                      color: error.level === 'critical' || error.level === 'error' ? '#EF4444' : '#F59E0B',
                    }}>
                      {error.level.toUpperCase()}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{error.type}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginLeft: 'auto' }}>{new Date(error.timestamp).toLocaleTimeString('zh-CN')}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{error.message}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-tertiary)' }}>
              <Icon name="check-circle" size="xl" color="#10B981" style={{ marginBottom: 8 }} />
              <p style={{ fontSize: 14, margin: 0 }}>暂无错误记录，应用运行良好</p>
            </div>
          )}
        </CardBody>
      </Card>
    </>
  );
};

import { useNoteStore } from '../stores/note-store';
import { useAIStore } from '../stores/ai-store';
import { useSocialStore } from '../stores/social-store';
