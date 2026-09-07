/**
 * OneOS 主题系统
 * 支持浅色、深色、跟随系统三种模式
 * 
 * 作者：A05 娜奥米（UI/UX设计师）
 */

import { useEffect, useState, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark' | 'auto';

// 浅色主题变量
const lightTheme = {
  '--color-bg-primary': '#F8F9FC',
  '--color-bg-secondary': '#FFFFFF',
  '--color-bg-tertiary': '#F1F2F6',
  '--color-text-primary': '#2D3436',
  '--color-text-secondary': '#636E72',
  '--color-text-tertiary': '#B2BEC3',
  '--color-border': '#E4E6EB',
  '--color-primary-500': '#8B5CF6',
  '--color-primary-100': '#EDE9FE',
  '--color-success': '#00B894',
  '--color-success-bg': '#E6FFF9',
  '--color-error': '#FF6B6B',
  '--color-error-bg': '#FFF0F0',
  '--color-warning': '#FDCB6E',
  '--color-warning-bg': '#FFF9E6',
  '--color-info': '#0984E3',
  '--color-info-bg': '#E6F4FF',
  '--color-neutral-100': '#F1F2F6',
  '--color-neutral-200': '#E4E6EB',
  '--color-neutral-300': '#DFE1E6',
  '--shadow-sm': '0 1px 2px rgba(0,0,0,0.05)',
  '--shadow-md': '0 4px 12px rgba(0,0,0,0.08)',
  '--shadow-lg': '0 8px 24px rgba(0,0,0,0.12)',
};

// 深色主题变量
const darkTheme = {
  '--color-bg-primary': '#1A1D23',
  '--color-bg-secondary': '#242830',
  '--color-bg-tertiary': '#2D323B',
  '--color-text-primary': '#F1F2F6',
  '--color-text-secondary': '#B2BEC3',
  '--color-text-tertiary': '#636E72',
  '--color-border': '#3D424C',
  '--color-primary-500': '#A78BFA',
  '--color-primary-100': '#3B2F5E',
  '--color-success': '#55EFC4',
  '--color-success-bg': '#1A3A33',
  '--color-error': '#FF7675',
  '--color-error-bg': '#3D1F1F',
  '--color-warning': '#FFEAA7',
  '--color-warning-bg': '#3D3A1F',
  '--color-info': '#74B9FF',
  '--color-info-bg': '#1F2D3D',
  '--color-neutral-100': '#2D323B',
  '--color-neutral-200': '#3D424C',
  '--color-neutral-300': '#4D525C',
  '--shadow-sm': '0 1px 2px rgba(0,0,0,0.3)',
  '--shadow-md': '0 4px 12px rgba(0,0,0,0.4)',
  '--shadow-lg': '0 8px 24px rgba(0,0,0,0.5)',
};

/**
 * 应用主题到document
 */
const applyTheme = (mode: ThemeMode) => {
  const root = document.documentElement;
  const isDark = mode === 'dark' || (mode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  const theme = isDark ? darkTheme : lightTheme;
  
  Object.entries(theme).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  
  root.setAttribute('data-theme', isDark ? 'dark' : 'light');
};

/**
 * 主题Hook
 */
export const useTheme = () => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('oneos-theme') as ThemeMode | null;
    return saved || 'auto';
  });

  const [isDark, setIsDark] = useState(false);

  // 应用主题
  useEffect(() => {
    applyTheme(mode);
    localStorage.setItem('oneos-theme', mode);
    
    const updateDark = () => {
      const dark = mode === 'dark' || (mode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      setIsDark(dark);
    };
    updateDark();

    // 监听系统主题变化（auto模式）
    if (mode === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => {
        applyTheme('auto');
        updateDark();
      };
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [mode]);

  const toggleTheme = useCallback(() => {
    setMode(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  return {
    mode,
    setMode,
    isDark,
    toggleTheme,
  };
};

/**
 * 主题切换按钮组件
 */
export const ThemeToggle: React.FC<{ mode: ThemeMode; onToggle: () => void }> = ({ mode, onToggle }) => (
  <button
    onClick={onToggle}
    style={{
      width: 36,
      height: 36,
      borderRadius: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg-tertiary)',
      border: '1px solid var(--color-border)',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }}
    title={mode === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
  >
    {mode === 'dark' ? (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>
    ) : (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>
    )}
  </button>
);

export default useTheme;
