/**
 * OneOS ESLint 配置
 * 维护者：A03 史密斯（代码审查官）+ A06 林克（运维主管）
 * 
 * 规则分级：
 * - error: 必须修复，否则CI失败
 * - warn: 建议修复，CI警告
 * - off: 关闭
 */

module.exports = {
  root: true,
  
  env: {
    browser: true,
    es2022: true,
    node: true,
    jest: true,
  },
  
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier',
  ],
  
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  
  settings: {
    react: {
      version: 'detect',
    },
  },
  
  plugins: ['react', 'react-hooks', 'jsx-a11y', 'import'],
  
  rules: {
    // ===== React 规则 =====
    'react/prop-types': 'off', // 未来迁移TypeScript后不需要
    'react/display-name': 'warn',
    'react/no-array-index-key': 'warn',
    'react/no-danger': 'error', // 禁止dangerouslySetInnerHTML，防止XSS
    'react/no-unused-state': 'warn',
    'react/self-closing-comp': 'error',
    'react/jsx-key': 'error',
    'react/jsx-no-comment-textnodes': 'warn',
    'react/jsx-no-duplicate-props': 'error',
    'react/jsx-no-target-blank': 'error',
    'react/jsx-no-undef': 'error',
    'react/jsx-uses-react': 'off', // React 17+ 不需要导入React
    'react/jsx-uses-vars': 'error',
    'react/react-in-jsx-scope': 'off', // React 17+ 新JSX转换
    
    // ===== React Hooks 规则 =====
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // ===== 导入规则 =====
    'import/no-unresolved': 'off', // 暂不启用，避免路径别名问题
    'import/named': 'error',
    'import/default': 'error',
    'import/no-duplicates': 'error',
    'import/no-mutable-exports': 'error',
    'import/first': 'error',
    'import/no-useless-path-segments': 'warn',
    
    // ===== 代码质量规则 =====
    'no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_',
    }],
    'no-console': ['warn', { allow: ['warn', 'error'] }], // 生产环境应移除console.log
    'no-debugger': 'error',
    'no-alert': 'warn',
    'no-eval': 'error', // 禁止eval，防止安全风险
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
    'no-shadow': 'warn',
    'no-use-before-define': ['error', { functions: false, classes: false }],
    'no-useless-escape': 'warn',
    'no-useless-return': 'warn',
    'no-return-await': 'warn',
    'no-async-promise-executor': 'error',
    'no-promise-executor-return': 'error',
    'require-await': 'warn',
    
    // ===== 代码风格规则 =====
    'prefer-const': 'error',
    'prefer-arrow-callback': 'warn',
    'prefer-template': 'warn',
    'prefer-spread': 'warn',
    'prefer-destructuring': ['warn', {
      array: true,
      object: true,
    }],
    'eqeqeq': ['error', 'always'], // 强制使用===
    'curly': ['error', 'all'],
    'default-case': 'warn',
    'default-case-last': 'error',
    'no-else-return': 'warn',
    'no-lonely-if': 'warn',
    'no-nested-ternary': 'warn',
    'no-unneeded-ternary': 'warn',
    'one-var': ['error', 'never'], // 每个变量单独声明
    
    // ===== 复杂度规则 =====
    'complexity': ['warn', { max: 20 }], // 函数复杂度上限
    'max-depth': ['warn', { max: 4 }], // 嵌套深度上限
    'max-lines-per-function': ['warn', { max: 100, skipBlankLines: true, skipComments: true }],
    'max-params': ['warn', { max: 5 }], // 函数参数上限
    'max-nested-callbacks': ['warn', { max: 3 }],
    
    // ===== 可访问性规则 =====
    'jsx-a11y/anchor-is-valid': 'warn',
    'jsx-a11y/alt-text': 'warn',
    'jsx-a11y/aria-props': 'warn',
    'jsx-a11y/role-has-required-aria-props': 'warn',
  },
  
  // 特定文件覆盖规则
  overrides: [
    {
      files: ['tests/**/*.js', 'tests/**/*.jsx', '**/*.test.js', '**/*.spec.js'],
      env: {
        jest: true,
      },
      rules: {
        'no-console': 'off',
        'max-lines-per-function': 'off',
        'complexity': 'off',
      },
    },
    {
      files: ['scripts/**/*.js', '*.config.js', '*.config.cjs'],
      env: {
        node: true,
      },
      rules: {
        'no-console': 'off',
      },
    },
    {
      files: ['vendor/**/*.js', 'dist/**/*.js'],
      rules: {
        'no-unused-vars': 'off',
        'no-console': 'off',
        'no-eval': 'off',
      },
    },
  ],
  
  // 全局变量
  globals: {
    // 浏览器API
    indexedDB: 'readonly',
    localStorage: 'readonly',
    sessionStorage: 'readonly',
    requestAnimationFrame: 'readonly',
    cancelAnimationFrame: 'readonly',
    matchMedia: 'readonly',
    ResizeObserver: 'readonly',
    IntersectionObserver: 'readonly',
    MutationObserver: 'readonly',
    // Web Speech API
    SpeechRecognition: 'readonly',
    webkitSpeechRecognition: 'readonly',
    speechSynthesis: 'readonly',
    SpeechSynthesisUtterance: 'readonly',
    // 构建时注入
    VITE_APP_VERSION: 'readonly',
    VITE_BUILD_HASH: 'readonly',
    VITE_BUILD_TIME: 'readonly',
  },
  
  ignorePatterns: [
    'dist/',
    'node_modules/',
    'coverage/',
    'vendor/',
    '*.min.js',
    'service-worker.js',
  ],
};
