// ============================================
// OneOS V2 - 构建脚本
// 合并、压缩、生成生产版本
// ============================================

const fs = require('fs');
const path = require('path');

// 项目根目录
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

// 配置
const CONFIG = {
  // 需要合并的JS文件顺序
  jsFiles: [
    // 工具库
    'src/utils/config.js',
    'src/utils/helpers.js',
    // 数据层
    'src/db/database.js',
    'src/db/notes.js',
    'src/db/settings.js',
    'src/data-adapter.js',
    // AI层
    'src/ai/ollama-service.js',
    'src/ai/persona-manager.js',
    'src/ai/rag-service.js',
    // 编辑器
    'src/editor/markdown-parser.js',
    'src/editor/backlink-service.js',
    'src/editor/tag-service.js',
    'src/editor/performance-optimizer.js',
    // 知识图谱
    'src/graph/force-layout.js',
    'src/graph/graph-data-service.js',
    'src/graph/graph-exporter.js',
    // 语音
    'src/voice/voice-service.js',
    // 搜索
    'src/search/search-service.js',
  ],
  // CSS文件
  cssFiles: [
    'styles/design-system-v2.css',
    'styles/mobile.css',
  ],
  // 输出配置
  output: {
    js: 'oneos.bundle.js',
    css: 'oneos.bundle.css',
  },
  // 压缩选项
  minify: {
    removeComments: true,
    removeWhitespace: true,
    removeConsole: false, // 保留console用于调试
  },
};

// ============================================
// 工具函数
// ============================================

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readFile(filePath) {
  const fullPath = path.join(ROOT_DIR, filePath);
  if (fs.existsSync(fullPath)) {
    return fs.readFileSync(fullPath, 'utf-8');
  }
  console.warn(`[Build] 警告: 文件不存在 ${filePath}`);
  return '';
}

function writeFile(filePath, content) {
  const fullPath = path.join(DIST_DIR, filePath);
  ensureDir(path.dirname(fullPath));
  fs.writeFileSync(fullPath, content, 'utf-8');
  console.log(`[Build] 生成: ${filePath} (${(content.length / 1024).toFixed(1)} KB)`);
}

// 简单的JS压缩
function minifyJS(code) {
  if (!CONFIG.minify.removeComments && !CONFIG.minify.removeWhitespace) {
    return code;
  }
  let result = code;
  // 移除多行注释
  if (CONFIG.minify.removeComments) {
    result = result.replace(/\/\*[\s\S]*?\*\//g, '');
  }
  // 移除单行注释（保留URL中的//）
  if (CONFIG.minify.removeComments) {
    result = result.replace(/(?<!:)\/\/.*$/gm, '');
  }
  // 移除多余空白
  if (CONFIG.minify.removeWhitespace) {
    result = result.replace(/\n\s*\n/g, '\n');
    result = result.replace(/[ \t]+/g, ' ');
  }
  return result.trim();
}

// 简单的CSS压缩
function minifyCSS(code) {
  let result = code;
  // 移除注释
  result = result.replace(/\/\*[\s\S]*?\*\//g, '');
  // 移除多余空白
  result = result.replace(/\s+/g, ' ');
  result = result.replace(/\s*([{}:;,])\s*/g, '$1');
  result = result.replace(/;}/g, '}');
  return result.trim();
}

// 复制文件
function copyFile(src, dest) {
  const srcPath = path.join(ROOT_DIR, src);
  const destPath = path.join(DIST_DIR, dest);
  ensureDir(path.dirname(destPath));
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`[Build] 复制: ${src} -> ${dest}`);
  }
}

// ============================================
// 主构建流程
// ============================================

function build() {
  console.log('\n========================================');
  console.log('OneOS V2 - 生产构建');
  console.log('========================================\n');

  const startTime = Date.now();

  // 1. 清理dist目录
  console.log('[1/5] 清理输出目录...');
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  }
  ensureDir(DIST_DIR);

  // 2. 合并并压缩JS
  console.log('[2/5] 合并并压缩JS文件...');
  let jsBundle = '';
  let jsTotalSize = 0;
  CONFIG.jsFiles.forEach(file => {
    const content = readFile(file);
    if (content) {
      jsBundle += `\n// ===== ${file} =====\n${content}\n`;
      jsTotalSize += content.length;
    }
  });
  const minifiedJS = minifyJS(jsBundle);
  writeFile(CONFIG.output.js, minifiedJS);
  console.log(`  原始: ${(jsTotalSize / 1024).toFixed(1)} KB -> 压缩后: ${(minifiedJS.length / 1024).toFixed(1)} KB`);

  // 3. 合并并压缩CSS
  console.log('[3/5] 合并并压缩CSS文件...');
  let cssBundle = '';
  let cssTotalSize = 0;
  CONFIG.cssFiles.forEach(file => {
    const content = readFile(file);
    if (content) {
      cssBundle += `\n/* ===== ${file} ===== */\n${content}\n`;
      cssTotalSize += content.length;
    }
  });
  const minifiedCSS = minifyCSS(cssBundle);
  writeFile(CONFIG.output.css, minifiedCSS);
  console.log(`  原始: ${(cssTotalSize / 1024).toFixed(1)} KB -> 压缩后: ${(minifiedCSS.length / 1024).toFixed(1)} KB`);

  // 4. 复制HTML文件
  console.log('[4/5] 复制HTML文件...');
  copyFile('index.html', 'index.html');
  copyFile('mobile.html', 'mobile.html');

  // 5. 复制静态资源
  console.log('[5/5] 复制静态资源...');
  const assetsDir = path.join(ROOT_DIR, 'assets');
  if (fs.existsSync(assetsDir)) {
    copyDir('assets', 'assets');
  }

  // 生成构建信息
  const buildInfo = {
    version: '1.0.0',
    buildTime: new Date().toISOString(),
    files: {
      js: CONFIG.output.js,
      css: CONFIG.output.css,
    },
    sizes: {
      js: `${(minifiedJS.length / 1024).toFixed(1)} KB`,
      css: `${(minifiedCSS.length / 1024).toFixed(1)} KB`,
    },
  };
  writeFile('build-info.json', JSON.stringify(buildInfo, null, 2));

  const endTime = Date.now();
  console.log('\n========================================');
  console.log(`构建完成! 耗时: ${endTime - startTime}ms`);
  console.log(`输出目录: ${DIST_DIR}`);
  console.log('========================================\n');
}

// 复制目录
function copyDir(src, dest) {
  const srcPath = path.join(ROOT_DIR, src);
  const destPath = path.join(DIST_DIR, dest);
  ensureDir(destPath);
  const entries = fs.readdirSync(srcPath, { withFileTypes: true });
  entries.forEach(entry => {
    const srcEntry = path.join(src, entry.name);
    const destEntry = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcEntry, destEntry);
    } else {
      copyFile(srcEntry, destEntry);
    }
  });
}

// 开发模式（不压缩，仅合并）
function buildDev() {
  CONFIG.minify.removeComments = false;
  CONFIG.minify.removeWhitespace = false;
  console.log('[Build] 开发模式（不压缩）');
  build();
}

// 监听模式
function watch() {
  console.log('[Build] 监听模式启动...');
  const allFiles = [...CONFIG.jsFiles, ...CONFIG.cssFiles, 'index.html', 'mobile.html'];
  allFiles.forEach(file => {
    const filePath = path.join(ROOT_DIR, file);
    if (fs.existsSync(filePath)) {
      fs.watch(filePath, (eventType) => {
        console.log(`[Watch] ${file} 变更 (${eventType})，重新构建...`);
        build();
      });
    }
  });
  console.log('[Watch] 正在监听文件变更...');
}

// 命令行参数
const args = process.argv.slice(2);
if (args.includes('--dev')) {
  buildDev();
} else if (args.includes('--watch')) {
  build();
  watch();
} else {
  build();
}

module.exports = { build, buildDev, watch, CONFIG };
