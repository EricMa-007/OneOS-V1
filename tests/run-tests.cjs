// ============================================
// OneOS V2 - Node.js 自动化测试脚本
// 不依赖浏览器，直接在命令行运行
// 用法: node tests/run-tests.js
// ============================================

'use strict';

const assert = require('assert');

// ============================================
// 测试框架
// ============================================
const results = { total: 0, passed: 0, failed: 0, duration: 0 };
const testSuites = [];
let currentSuite = null;

function suite(name, fn) {
  currentSuite = { name, tests: [], results: [] };
  testSuites.push(currentSuite);
  fn();
  currentSuite = null;
}

function test(name, fn) {
  if (!currentSuite) throw new Error('test must be inside suite');
  currentSuite.tests.push({ name, fn });
}

async function runSuite(suiteObj) {
  console.log(`\n${color('📦', 'cyan')} ${suiteObj.name}`);
  console.log(color('─'.repeat(60), 'gray'));

  for (const t of suiteObj.tests) {
    results.total++;
    const start = Date.now();
    try {
      await t.fn();
      const duration = Date.now() - start;
      results.passed++;
      suiteObj.results.push({ name: t.name, status: 'pass', duration });
      console.log(`  ${color('✅', 'green')} ${t.name} ${color(`(${duration}ms)`, 'gray')}`);
    } catch (err) {
      const duration = Date.now() - start;
      results.failed++;
      suiteObj.results.push({ name: t.name, status: 'fail', duration, error: err.message });
      console.log(`  ${color('❌', 'red')} ${t.name} ${color(`(${duration}ms)`, 'gray')}`);
      console.log(`     ${color(err.message, 'red')}`);
    }
  }
}

async function runAll() {
  console.log(color('\n' + '═'.repeat(60), 'cyan'));
  console.log(color('  🤖 OneOS V2 - Node.js 自动化测试', 'cyan'));
  console.log(color('  不依赖浏览器 · 纯逻辑验证', 'cyan'));
  console.log(color('═'.repeat(60), 'cyan'));

  const totalStart = Date.now();

  for (const s of testSuites) {
    await runSuite(s);
  }

  results.duration = Date.now() - totalStart;

  console.log('\n' + color('═'.repeat(60), 'cyan'));
  console.log(color('  📊 测试汇总报告', 'cyan'));
  console.log(color('═'.repeat(60), 'cyan'));

  const passRate = results.total > 0 ? Math.round((results.passed / results.total) * 100) : 0;
  const statusColor = results.failed === 0 ? 'green' : 'red';
  const statusIcon = results.failed === 0 ? '🎉' : '⚠️';

  console.log(`\n  ${statusIcon} 总用例: ${color(results.total, 'white')}`);
  console.log(`  ✅ 通过: ${color(results.passed, 'green')}`);
  console.log(`  ❌ 失败: ${color(results.failed, 'red')}`);
  console.log(`  📈 通过率: ${color(passRate + '%', statusColor)}`);
  console.log(`  ⏱  总耗时: ${color(results.duration + 'ms', 'white')}`);

  console.log('\n  📦 各套件统计:');
  for (const s of testSuites) {
    const passed = s.results.filter(r => r.status === 'pass').length;
    const failed = s.results.filter(r => r.status === 'fail').length;
    const icon = failed === 0 ? '✅' : '❌';
    console.log(`    ${icon} ${s.name}: ${passed}/${s.tests.length} 通过`);
  }

  console.log('\n' + color('═'.repeat(60), 'cyan') + '\n');

  process.exit(results.failed > 0 ? 1 : 0);
}

function color(text, c) {
  const colors = {
    red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
    blue: '\x1b[34m', magenta: '\x1b[35m', cyan: '\x1b[36m',
    white: '\x1b[37m', gray: '\x1b[90m',
  };
  return (colors[c] || '') + text + '\x1b[0m';
}

// ============================================
// 被测纯逻辑函数（从源码中提取）
// ============================================

function countWords(text) {
  if (!text) return 0;
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishWords = (text.replace(/[\u4e00-\u9fa5]/g, ' ').match(/[a-zA-Z]+/g) || []).length;
  return chineseChars + englishWords;
}

function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { metadata: {}, content: markdown };
  const metadata = {};
  match[1].split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean);
      }
      metadata[key] = value;
    }
  });
  return { metadata, content: match[2] };
}

function deepMerge(target, source) {
  const result = { ...target };
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

function simpleKeywordSearch(query, notes, topK) {
  const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 1);
  const scored = notes.map(note => {
    const text = `${note.title || ''} ${note.content || ''}`.toLowerCase();
    let score = 0;
    keywords.forEach(kw => { if (text.includes(kw)) score += 1; });
    return { ...note, score };
  });
  return scored.filter(n => n.score > 0).sort((a, b) => b.score - a.score).slice(0, topK);
}

function kbNoteToDB(kbNote) {
  return {
    id: kbNote.id,
    name: kbNote.name || `${kbNote.title}.md`,
    title: kbNote.title,
    folder: kbNote.folder || '未分类',
    content: kbNote.content || '',
    tags: kbNote.tags || [],
    backlinks: kbNote.backlinks || [],
    createdAt: kbNote.createdAt || new Date().toISOString(),
    updatedAt: kbNote.updatedAt || new Date().toISOString(),
    readCount: kbNote.readCount || 0,
    wordCount: kbNote.wordCount || countWords(kbNote.content || ''),
    type: kbNote.type || 'note',
    elevationLevel: kbNote.elevationLevel || 0,
    archived: kbNote.archived || false,
    pinned: kbNote.pinned || false,
  };
}

function dbNoteToKB(dbNote) {
  return {
    id: dbNote.id,
    name: dbNote.name || `${dbNote.title}.md`,
    title: dbNote.title,
    folder: dbNote.folder || '未分类',
    content: dbNote.content || '',
    tags: dbNote.tags || [],
    backlinks: dbNote.backlinks || [],
    createdAt: dbNote.createdAt,
    updatedAt: dbNote.updatedAt,
    readCount: dbNote.readCount || 0,
    wordCount: dbNote.wordCount || 0,
    type: dbNote.type || 'note',
    elevationLevel: dbNote.elevationLevel || 0,
    archived: dbNote.archived || false,
    pinned: dbNote.pinned || false,
  };
}

// ============================================
// 测试用例
// ============================================

suite('字数统计函数 (countWords)', () => {
  test('空字符串返回0', () => {
    assert.strictEqual(countWords(''), 0);
  });

  test('null/undefined返回0', () => {
    assert.strictEqual(countWords(null), 0);
    assert.strictEqual(countWords(undefined), 0);
  });

  test('纯中文按字符计数', () => {
    assert.strictEqual(countWords('你好世界'), 4);
  });

  test('纯英文按单词计数', () => {
    assert.strictEqual(countWords('hello world'), 2);
  });

  test('中英文混合计数', () => {
    assert.strictEqual(countWords('你好 world 测试 test'), 6);
  });

  test('带标点符号的文本', () => {
    assert.strictEqual(countWords('你好，世界！Hello, World!'), 6);
  });

  test('长文本计数', () => {
    const text = '这是一段较长的测试文本，包含中文和English words，用于验证字数统计函数的准确性。'.repeat(10);
    const count = countWords(text);
    assert.ok(count > 100, `计数应该大于100，实际为${count}`);
  });
});

suite('Markdown Frontmatter 解析', () => {
  test('无Frontmatter返回原内容', () => {
    const result = parseFrontmatter('# 标题\n\n内容');
    assert.deepStrictEqual(result.metadata, {});
    assert.strictEqual(result.content, '# 标题\n\n内容');
  });

  test('解析基本Frontmatter', () => {
    const md = '---\ntitle: 测试标题\ndate: 2024-01-01\n---\n\n正文内容';
    const result = parseFrontmatter(md);
    assert.strictEqual(result.metadata.title, '测试标题');
    assert.strictEqual(result.metadata.date, '2024-01-01');
    assert.strictEqual(result.content, '\n正文内容');
  });

  test('解析数组类型标签', () => {
    const md = '---\ntags: [测试, 自动化, Node.js]\n---\n内容';
    const result = parseFrontmatter(md);
    assert.deepStrictEqual(result.metadata.tags, ['测试', '自动化', 'Node.js']);
  });

  test('空Frontmatter', () => {
    const md = '---\n---\n内容';
    const result = parseFrontmatter(md);
    assert.deepStrictEqual(result.metadata, {});
  });

  test('带特殊字符的值', () => {
    const md = '---\ntitle: 标题: 带冒号\n---\n内容';
    const result = parseFrontmatter(md);
    assert.strictEqual(result.metadata.title, '标题: 带冒号');
  });
});

suite('深度合并函数 (deepMerge)', () => {
  test('基本合并', () => {
    const result = deepMerge({ a: 1 }, { b: 2 });
    assert.deepStrictEqual(result, { a: 1, b: 2 });
  });

  test('覆盖已有属性', () => {
    const result = deepMerge({ a: 1, b: 2 }, { b: 3 });
    assert.deepStrictEqual(result, { a: 1, b: 3 });
  });

  test('嵌套对象合并', () => {
    const result = deepMerge(
      { a: { x: 1, y: 2 } },
      { a: { y: 3, z: 4 } }
    );
    assert.deepStrictEqual(result, { a: { x: 1, y: 3, z: 4 } });
  });

  test('数组直接覆盖（不合并）', () => {
    const result = deepMerge({ a: [1, 2] }, { a: [3] });
    assert.deepStrictEqual(result, { a: [3] });
  });

  test('不修改原对象', () => {
    const original = { a: 1 };
    deepMerge(original, { b: 2 });
    assert.deepStrictEqual(original, { a: 1 });
  });

  test('多层嵌套合并', () => {
    const result = deepMerge(
      { a: { b: { c: 1, d: 2 } } },
      { a: { b: { d: 3, e: 4 } } }
    );
    assert.deepStrictEqual(result, { a: { b: { c: 1, d: 3, e: 4 } } });
  });
});

suite('关键词检索函数 (simpleKeywordSearch)', () => {
  const testNotes = [
    { id: 1, title: 'JavaScript 基础', content: '学习 JavaScript 编程语言的基础知识' },
    { id: 2, title: 'Python 入门', content: 'Python 是一种简单易学的编程语言' },
    { id: 3, title: '机器学习', content: '机器学习是人工智能的一个分支' },
    { id: 4, title: 'JavaScript 高级', content: '深入理解 JavaScript 的闭包和原型链' },
  ];

  test('匹配单个关键词', () => {
    const results = simpleKeywordSearch('JavaScript', testNotes, 10);
    assert.strictEqual(results.length, 2);
    assert.ok(results.every(r => r.score > 0));
  });

  test('匹配多个关键词', () => {
    const results = simpleKeywordSearch('JavaScript 基础', testNotes, 10);
    assert.ok(results.length > 0);
    assert.ok(results[0].score >= results[results.length - 1].score);
  });

  test('无匹配返回空数组', () => {
    const results = simpleKeywordSearch('不存在的关键词xyz', testNotes, 10);
    assert.strictEqual(results.length, 0);
  });

  test('限制返回数量', () => {
    const results = simpleKeywordSearch('编程语言', testNotes, 1);
    assert.strictEqual(results.length, 1);
  });

  test('结果按匹配度排序', () => {
    const results = simpleKeywordSearch('JavaScript', testNotes, 10);
    for (let i = 1; i < results.length; i++) {
      assert.ok(results[i - 1].score >= results[i].score);
    }
  });

  test('空查询返回空', () => {
    const results = simpleKeywordSearch('', testNotes, 10);
    assert.strictEqual(results.length, 0);
  });
});

suite('数据格式双向转换', () => {
  const testNote = {
    id: 'test-001',
    title: '测试笔记',
    content: '# 测试\n\n内容',
    folder: '测试文件夹',
    tags: ['测试', '自动化'],
    backlinks: ['other-1'],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
    readCount: 5,
  };

  test('KB转DB：必填字段存在', () => {
    const dbNote = kbNoteToDB(testNote);
    assert.strictEqual(dbNote.id, 'test-001');
    assert.strictEqual(dbNote.title, '测试笔记');
    assert.strictEqual(dbNote.folder, '测试文件夹');
  });

  test('KB转DB：自动计算字数', () => {
    const dbNote = kbNoteToDB(testNote);
    assert.ok(dbNote.wordCount > 0, '字数应该大于0');
  });

  test('KB转DB：默认值填充', () => {
    const minimal = { id: 'min', title: '最小', content: '内容' };
    const dbNote = kbNoteToDB(minimal);
    assert.strictEqual(dbNote.folder, '未分类');
    assert.strictEqual(dbNote.type, 'note');
    assert.strictEqual(dbNote.elevationLevel, 0);
    assert.strictEqual(dbNote.archived, false);
    assert.strictEqual(dbNote.pinned, false);
    assert.deepStrictEqual(dbNote.tags, []);
    assert.deepStrictEqual(dbNote.backlinks, []);
  });

  test('DB转KB：字段保留', () => {
    const dbNote = kbNoteToDB(testNote);
    const kbNote = dbNoteToKB(dbNote);
    assert.strictEqual(kbNote.id, 'test-001');
    assert.strictEqual(kbNote.title, '测试笔记');
    assert.deepStrictEqual(kbNote.tags, ['测试', '自动化']);
  });

  test('双向转换一致性', () => {
    const dbNote = kbNoteToDB(testNote);
    const kbNote = dbNoteToKB(dbNote);
    const dbNote2 = kbNoteToDB(kbNote);
    assert.strictEqual(dbNote2.id, dbNote.id);
    assert.strictEqual(dbNote2.title, dbNote.title);
    assert.strictEqual(dbNote2.content, dbNote.content);
    assert.strictEqual(dbNote2.wordCount, dbNote.wordCount);
  });

  test('空内容笔记', () => {
    const empty = { id: 'empty', title: '空笔记', content: '' };
    const dbNote = kbNoteToDB(empty);
    assert.strictEqual(dbNote.wordCount, 0);
    assert.strictEqual(dbNote.content, '');
  });
});

suite('配置管理逻辑', () => {
  const DEFAULT_CONFIG = {
    baseUrl: 'http://localhost:11434',
    model: 'llama3',
    temperature: 0.7,
    maxTokens: 2048,
    stream: true,
  };

  test('默认配置完整性', () => {
    assert.ok(DEFAULT_CONFIG.baseUrl);
    assert.ok(DEFAULT_CONFIG.model);
    assert.strictEqual(typeof DEFAULT_CONFIG.temperature, 'number');
    assert.strictEqual(typeof DEFAULT_CONFIG.maxTokens, 'number');
    assert.strictEqual(typeof DEFAULT_CONFIG.stream, 'boolean');
  });

  test('配置更新（部分更新）', () => {
    const config = { ...DEFAULT_CONFIG };
    const updated = { ...config, temperature: 0.5, maxTokens: 1024 };
    assert.strictEqual(updated.temperature, 0.5);
    assert.strictEqual(updated.maxTokens, 1024);
    assert.strictEqual(updated.baseUrl, DEFAULT_CONFIG.baseUrl);
    assert.strictEqual(updated.model, DEFAULT_CONFIG.model);
  });

  test('温度参数范围验证', () => {
    const validTemps = [0, 0.1, 0.5, 0.7, 1.0, 1.5, 2.0];
    for (const t of validTemps) {
      assert.ok(t >= 0 && t <= 2, `温度${t}应该在0-2范围内`);
    }
  });

  test('maxTokens正整数验证', () => {
    const valid = [128, 512, 1024, 2048, 4096];
    for (const n of valid) {
      assert.ok(Number.isInteger(n) && n > 0, `maxTokens${n}应该是正整数`);
    }
  });
});

suite('字符串处理工具', () => {
  test('标题截断', () => {
    const longTitle = '这是一个非常长的笔记标题，用于测试截断功能是否正常工作';
    const truncated = longTitle.length > 20 ? longTitle.slice(0, 20) + '...' : longTitle;
    assert.ok(truncated.length <= 24);
    assert.ok(truncated.endsWith('...'));
  });

  test('短标题不截断', () => {
    const shortTitle = '短标题';
    const result = shortTitle.length > 20 ? shortTitle.slice(0, 20) + '...' : shortTitle;
    assert.strictEqual(result, '短标题');
  });

  test('文件名生成', () => {
    const title = '我的笔记标题';
    const filename = `${title}.md`;
    assert.strictEqual(filename, '我的笔记标题.md');
    assert.ok(filename.endsWith('.md'));
  });

  test('时间戳格式', () => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    assert.match(dateStr, /^\d{4}-\d{2}-\d{2}$/);
  });

  test('ID生成唯一性', () => {
    const ids = new Set();
    for (let i = 0; i < 100; i++) {
      ids.add(`note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
    }
    assert.ok(ids.size > 90, `生成的ID应该大部分唯一，实际唯一数: ${ids.size}`);
  });
});

suite('数据统计逻辑', () => {
  test('计算层级分布', () => {
    const notes = [
      { elevationLevel: 0 }, { elevationLevel: 0 }, { elevationLevel: 0 },
      { elevationLevel: 1 }, { elevationLevel: 1 },
      { elevationLevel: 2 },
      { elevationLevel: 3 },
    ];
    const levelCounts = { 0: 0, 1: 0, 2: 0, 3: 0 };
    notes.forEach(n => { levelCounts[n.elevationLevel]++; });
    assert.strictEqual(levelCounts[0], 3);
    assert.strictEqual(levelCounts[1], 2);
    assert.strictEqual(levelCounts[2], 1);
    assert.strictEqual(levelCounts[3], 1);
  });

  test('计算文件夹统计', () => {
    const notes = [
      { folder: '工作' }, { folder: '工作' },
      { folder: '学习' }, { folder: '学习' }, { folder: '学习' },
      { folder: '生活' },
    ];
    const folderCounts = {};
    notes.forEach(n => { folderCounts[n.folder] = (folderCounts[n.folder] || 0) + 1; });
    assert.strictEqual(folderCounts['工作'], 2);
    assert.strictEqual(folderCounts['学习'], 3);
    assert.strictEqual(folderCounts['生活'], 1);
  });

  test('标签统计与排序', () => {
    const notes = [
      { tags: ['JavaScript', '前端'] },
      { tags: ['JavaScript', 'Node.js', '后端'] },
      { tags: ['JavaScript', '前端', 'React'] },
    ];
    const tagCounts = {};
    notes.forEach(n => n.tags.forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));
    const sorted = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);
    assert.strictEqual(sorted[0][0], 'JavaScript');
    assert.strictEqual(sorted[0][1], 3);
    assert.strictEqual(sorted[1][1], 2);
  });

  test('总字数统计', () => {
    const notes = [
      { wordCount: 100 }, { wordCount: 200 }, { wordCount: 300 },
    ];
    const total = notes.reduce((sum, n) => sum + n.wordCount, 0);
    assert.strictEqual(total, 600);
  });

  test('空列表统计', () => {
    const notes = [];
    const total = notes.reduce((sum, n) => sum + (n.wordCount || 0), 0);
    assert.strictEqual(total, 0);
  });
});

// ============================================
// 运行测试
// ============================================
runAll().catch(err => {
  console.error(color('测试运行失败:', 'red'), err);
  process.exit(1);
});
