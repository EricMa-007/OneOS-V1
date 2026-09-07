// ============================================
// OneOS V2 - Markdown 解析与渲染工具
// 轻量级 Markdown 解析器，支持标准语法 + 双链扩展
// ============================================

(function() {
  'use strict';

  // ============================================
  // 行内元素解析
  // ============================================

  function parseInline(text) {
    if (!text) return '';
    let html = text;

    // 1. 行内代码
    html = html.replace(/`([^`]+)`/g, (m, code) => {
      return `<code class="md-inline-code">${escapeHtml(code)}</code>`;
    });

    // 2. 图片
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (m, alt, url) => {
      return `<img src="${url}" alt="${escapeHtml(alt)}" class="md-image" loading="lazy" />`;
    });

    // 3. 双链 [[note]] 或 [[note|text]]
    html = html.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (m, noteName, displayText) => {
      const t = displayText || noteName;
      return `<a href="#" class="md-wikilink" data-note="${escapeHtml(noteName.trim())}">${escapeHtml(t)}</a>`;
    });

    // 4. 链接
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, linkText, url) => {
      const isExternal = url.startsWith('http');
      return `<a href="${url}" class="md-link" ${isExternal ? 'target="_blank" rel="noopener noreferrer"' : ''}>${escapeHtml(linkText)}</a>`;
    });

    // 5. 加粗
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="md-bold">$1</strong>');
    html = html.replace(/__([^_]+)__/g, '<strong class="md-bold">$1</strong>');

    // 6. 斜体
    html = html.replace(/(?!\*)\*([^*\n]+)\*(?!\*)/g, '<em class="md-italic">$1</em>');

    // 7. 删除线
    html = html.replace(/~~([^~]+)~~/g, '<del class="md-strikethrough">$1</del>');

    // 8. 高亮
    html = html.replace(/==([^=]+)==/g, '<mark class="md-highlight">$1</mark>');

    return html;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ============================================
  // 块级元素解析
  // ============================================

  function parse(markdown) {
    if (!markdown) return '';
    const lines = markdown.split('\n');
    let html = '';
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      if (!line.trim()) { i++; continue; }

      // 代码块
      if (line.trim().startsWith('```')) {
        const lang = line.trim().slice(3).trim();
        let code = '';
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          code += lines[i] + '\n';
          i++;
        }
        i++;
        html += `<pre class="md-codeblock" data-lang="${lang}"><code class="language-${lang}">${escapeHtml(code)}</code></pre>\n`;
        continue;
      }

      // 标题
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        html += `<h${level} class="md-heading md-h${level}">${parseInline(headingMatch[2])}</h${level}>\n`;
        i++;
        continue;
      }

      // 引用
      if (line.trim().startsWith('>')) {
        let quote = '';
        while (i < lines.length && lines[i].trim().startsWith('>')) {
          quote += lines[i].trim().slice(1).trim() + '\n';
          i++;
        }
        html += `<blockquote class="md-blockquote">${parseInline(quote.trim())}</blockquote>\n`;
        continue;
      }

      // 无序列表
      if (/^[-*+]\s+/.test(line)) {
        let items = '';
        while (i < lines.length && /^[-*+]\s+/.test(lines[i])) {
          const text = lines[i].replace(/^[-*+]\s+/, '');
          items += `<li class="md-list-item">${parseInline(text)}</li>\n`;
          i++;
        }
        html += `<ul class="md-list md-unordered">\n${items}</ul>\n`;
        continue;
      }

      // 有序列表
      if (/^\d+\.\s+/.test(line)) {
        let items = '';
        while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
          const text = lines[i].replace(/^\d+\.\s+/, '');
          items += `<li class="md-list-item">${parseInline(text)}</li>\n`;
          i++;
        }
        html += `<ol class="md-list md-ordered">\n${items}</ol>\n`;
        continue;
      }

      // 分割线
      if (/^[-*_]{3,}\s*$/.test(line.trim())) {
        html += '<hr class="md-hr" />\n';
        i++;
        continue;
      }

      // 表格
      if (line.includes('|') && i + 1 < lines.length && /^\s*\|?[\s:-]+\|?\s*$/.test(lines[i + 1])) {
        const headerCells = line.split('|').map(c => c.trim()).filter(Boolean);
        i += 2;
        let rows = '';
        while (i < lines.length && lines[i].includes('|') && lines[i].trim()) {
          const cells = lines[i].split('|').map(c => c.trim()).filter(Boolean);
          rows += '<tr>' + cells.map(c => `<td class="md-table-cell">${parseInline(c)}</td>`).join('') + '</tr>\n';
          i++;
        }
        const headerRow = '<tr>' + headerCells.map(c => `<th class="md-table-header">${parseInline(c)}</th>`).join('') + '</tr>\n';
        html += `<div class="md-table-wrapper"><table class="md-table">\n<thead>${headerRow}</thead>\n<tbody>${rows}</tbody>\n</table></div>\n`;
        continue;
      }

      // 任务列表
      if (/^[-*+]\s+\[[ xX]\]\s+/.test(line)) {
        let items = '';
        while (i < lines.length && /^[-*+]\s+\[[ xX]\]\s+/.test(lines[i])) {
          const checked = /\[x\]/i.test(lines[i]);
          const text = lines[i].replace(/^[-*+]\s+\[[ xX]\]\s+/, '');
          items += `<li class="md-task-item ${checked ? 'md-task-checked' : ''}">
            <input type="checkbox" ${checked ? 'checked' : ''} class="md-task-checkbox" disabled />
            <span class="md-task-text">${parseInline(text)}</span>
          </li>\n`;
          i++;
        }
        html += `<ul class="md-task-list">\n${items}</ul>\n`;
        continue;
      }

      // 普通段落
      let paragraph = line;
      i++;
      while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) {
        paragraph += ' ' + lines[i];
        i++;
      }
      html += `<p class="md-paragraph">${parseInline(paragraph)}</p>\n`;
    }

    return html;
  }

  function isBlockStart(line) {
    return (
      line.trim().startsWith('#') ||
      line.trim().startsWith('>') ||
      line.trim().startsWith('```') ||
      /^[-*+]\s+/.test(line) ||
      /^\d+\.\s+/.test(line) ||
      /^[-*_]{3,}\s*$/.test(line.trim()) ||
      line.includes('|')
    );
  }

  // ============================================
  // 统计工具
  // ============================================

  function getStats(markdown) {
    if (!markdown) return { chars: 0, words: 0, lines: 0, headings: 0, readTime: 0 };
    const chars = markdown.length;
    const words = countWords(markdown);
    const lines = markdown.split('\n').length;
    const headings = (markdown.match(/^#{1,6}\s/gm) || []).length;
    const readTime = Math.ceil(words / 300);
    return { chars, words, lines, headings, readTime };
  }

  function countWords(text) {
    if (!text) return 0;
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (text.replace(/[\u4e00-\u9fa5]/g, ' ').match(/[a-zA-Z]+/g) || []).length;
    return chineseChars + englishWords;
  }

  // ============================================
  // 提取双链和标签
  // ============================================

  function extractWikilinks(markdown) {
    if (!markdown) return [];
    const regex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
    const links = [];
    let match;
    while ((match = regex.exec(markdown)) !== null) {
      links.push({ name: match[1].trim(), displayText: match[2] ? match[2].trim() : match[1].trim(), full: match[0] });
    }
    return links;
  }

  function extractTags(markdown) {
    if (!markdown) return [];
    const regex = /(?:^|\s)#([^\s#]+)/g;
    const tags = [];
    let match;
    while ((match = regex.exec(markdown)) !== null) {
      tags.push(match[1]);
    }
    return [...new Set(tags)];
  }

  // ============================================
  // 暴露 API
  // ============================================

  const MarkdownParser = {
    parse, parseInline, escapeHtml,
    getStats, countWords,
    extractWikilinks, extractTags,
  };

  if (typeof window !== 'undefined') {
    window.MarkdownParser = MarkdownParser;
  }

  console.log('[MarkdownParser] Markdown解析渲染工具已加载');

})();
