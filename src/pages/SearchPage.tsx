import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useSearchStore } from '../stores/search-store';
import { useNoteStore } from '../stores/note-store';
import { useAppStore } from '../stores/app-store';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Tag } from '../components/ui/Tag';
import { Icon, IconName } from '../components/ui/Icon';
import { EmptyState } from '../components/ui/EmptyState';
import { searchAlgorithmEngine, SearchSuggestion } from '../shared/kernel/search-algorithm-engine';

interface SearchResult { id: string; type: 'note' | 'tag' | 'setting'; title: string; description: string; icon: IconName; color: string; score: number; matchedFields: string[]; explanation: string; metadata?: Record<string, any>; }

export const SearchPage: React.FC = () => {
  const { query, setQuery, history, addToHistory, clearHistory } = useSearchStore();
  const { notes, selectNote } = useNoteStore();
  const { setCurrentNav } = useAppStore();
  const [activeCategory, setActiveCategory] = useState<'all' | 'notes' | 'tags' | 'settings'>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [fuzzySearch, setFuzzySearch] = useState(true);
  const [searchTime, setSearchTime] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // 索引笔记到搜索算法引擎
  useEffect(() => {
    const searchableItems = notes.filter((n) => !n.deleted).map((note) => ({
      id: note.id,
      type: 'note' as const,
      title: note.title || '无标题',
      content: note.content,
      tags: note.tagIds,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    }));
    searchAlgorithmEngine.clear();
    searchAlgorithmEngine.indexItems(searchableItems);
  }, [notes]);

  // 搜索建议
  useEffect(() => {
    if (query.trim().length > 0) {
      const suggs = searchAlgorithmEngine.getSuggestions(query, 6);
      setSuggestions(suggs);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  /**
   * 高亮匹配文本
   */
  const highlightText = (text: string, keyword: string): React.ReactNode => {
    if (!keyword.trim()) return text;
    const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} style={{ background: 'linear-gradient(120deg, #FEF3C7 0%, #FDE68A 100%)', padding: '1px 3px', borderRadius: 3, fontWeight: 600 }}>{part}</mark>
      ) : (
        <React.Fragment key={index}>{part}</React.Fragment>
      )
    );
  };

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];
    const startTime = performance.now();
    const kw = query.toLowerCase();
    const allResults: SearchResult[] = [];

    // 使用搜索算法引擎进行笔记搜索
    const algorithmResults = searchAlgorithmEngine.search({
      text: query,
      options: {
        fuzzy: fuzzySearch,
        fuzzyThreshold: 0.5,
        limit: 50,
        sortBy: 'relevance',
      },
    });

    const algorithmNoteIds = new Set(algorithmResults.map((r) => r.item.id));

    // 算法引擎搜索结果（优先）
    for (const result of algorithmResults) {
      const note = notes.find((n) => n.id === result.item.id && !n.deleted);
      if (!note) continue;
      allResults.push({
        id: `note_${note.id}`,
        type: 'note',
        title: note.title || '无标题',
        description: note.content.replace(/[#*`>\[\]()!-]/g, '').slice(0, 150),
        icon: 'file',
        color: '#8B5CF6',
        score: result.score,
        matchedFields: result.matchedFields,
        explanation: result.explanation,
        metadata: { noteId: note.id, wordCount: note.meta.wordCount },
      });
    }

    // 补充搜索（算法引擎未覆盖的笔记）
    const additionalNotes = notes.filter((n) => !n.deleted && !algorithmNoteIds.has(n.id)).filter((n) => n.title.toLowerCase().includes(kw) || n.content.toLowerCase().includes(kw));
    for (const note of additionalNotes) {
      const titleMatch = note.title.toLowerCase().includes(kw);
      const contentMatch = note.content.toLowerCase().includes(kw);
      const matchedFields: string[] = [];
      if (titleMatch) matchedFields.push('title');
      if (contentMatch) matchedFields.push('content');

      const score = titleMatch ? 0.8 : 0.5;
      allResults.push({
        id: `note_${note.id}`,
        type: 'note',
        title: note.title || '无标题',
        description: note.content.replace(/[#*`>\[\]()!-]/g, '').slice(0, 150),
        icon: 'file',
        color: '#8B5CF6',
        score,
        matchedFields,
        explanation: `标题${titleMatch ? '匹配' : '不匹配'}，内容${contentMatch ? '匹配' : '不匹配'}`,
        metadata: { noteId: note.id, wordCount: note.meta.wordCount },
      });
    }

    // 标签搜索
    const allTags = new Set<string>();
    notes.forEach((n) => n.tagIds.forEach((t) => allTags.add(t)));
    const tagResults = Array.from(allTags).filter((t) => t.toLowerCase().includes(kw)).map((t) => ({
      id: `tag_${t}`,
      type: 'tag' as const,
      title: `#${t}`,
      description: `${notes.filter((n) => n.tagIds.includes(t)).length} 篇笔记使用此标签`,
      icon: 'tag' as IconName,
      color: '#00CEC9',
      score: 0.7,
      matchedFields: ['title'],
      explanation: '标签名称匹配',
    }));
    allResults.push(...tagResults);

    // 设置搜索
    const settings = [
      { key: 'theme', title: '主题设置', desc: '切换深色/浅色模式，自定义主题色' },
      { key: 'ai', title: 'AI设置', desc: '配置AI模型、API密钥、人设' },
      { key: 'storage', title: '存储设置', desc: '管理本地存储，数据导入导出' },
      { key: 'shortcut', title: '快捷键', desc: '查看和自定义键盘快捷键' },
    ];
    const settingResults = settings.filter((s) => s.title.toLowerCase().includes(kw) || s.desc.toLowerCase().includes(kw)).map((s) => ({
      id: `setting_${s.key}`,
      type: 'setting' as const,
      title: s.title,
      description: s.desc,
      icon: 'settings' as IconName,
      color: '#737373',
      score: 0.6,
      matchedFields: ['title', 'content'],
      explanation: '设置项匹配',
    }));
    allResults.push(...settingResults);

    // 按相关度排序
    allResults.sort((a, b) => b.score - a.score);

    setSearchTime(performance.now() - startTime);
    return allResults;
  }, [query, notes, fuzzySearch]);

  const filteredResults = useMemo(() => {
    if (activeCategory === 'all') return results;
    return results.filter((r) => r.type === activeCategory.slice(0, -1));
  }, [results, activeCategory]);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    setSelectedIndex(0);
    if (value.trim()) addToHistory(value);
  }, [setQuery, addToHistory]);

  const handleResultClick = (result: SearchResult) => {
    addToHistory(query);
    if (result.type === 'note') { selectNote(result.metadata.noteId); setCurrentNav('editor'); }
    else if (result.type === 'setting') { setCurrentNav('settings'); }
    else if (result.type === 'tag') { setCurrentNav('notes'); }
  };

  const categoryConfig = [
    { key: 'all' as const, label: '全部', count: results.length },
    { key: 'notes' as const, label: '笔记', count: results.filter((r) => r.type === 'note').length },
    { key: 'tags' as const, label: '标签', count: results.filter((r) => r.type === 'tag').length },
    { key: 'settings' as const, label: '设置', count: results.filter((r) => r.type === 'setting').length },
  ];

  const hotSearches = ['产品需求', '架构设计', 'TypeScript', '知识图谱', 'AI对话', '语音转文字'];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ maxWidth: 700, margin: '0 auto 24px', width: '100%', position: 'relative' }}>
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query.trim() && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="搜索笔记、标签、设置..."
          size="lg"
          prefix={<Icon name="search" size="md" color="var(--text-tertiary)" />}
          clearable
          onClear={() => setQuery('')}
          autoFocus
        />

        {/* 搜索建议下拉框 */}
        {showSuggestions && suggestions.length > 0 && (
          <Card style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 8, padding: 8, zIndex: 100, boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5, padding: '4px 8px 8px' }}>搜索建议</div>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => { handleSearch(suggestion.text); setShowSuggestions(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 10px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-primary-50)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon
                  name={suggestion.type === 'history' ? 'clock' : suggestion.type === 'popular' ? 'trending-up' : suggestion.type === 'correction' ? 'edit' : 'search'}
                  size="xs"
                  color={suggestion.type === 'history' ? 'var(--text-tertiary)' : suggestion.type === 'popular' ? 'var(--color-warning-600)' : suggestion.type === 'correction' ? 'var(--color-error-600)' : 'var(--color-primary-600)'}
                />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', flex: 1 }}>{highlightText(suggestion.text, query)}</span>
                {suggestion.type === 'correction' && <Tag size="sm" variant="warning">拼写建议</Tag>}
                {suggestion.count && <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{suggestion.count}次</span>}
              </button>
            ))}
          </Card>
        )}
      </div>

      {/* 搜索选项栏 */}
      {query && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, maxWidth: 700, marginLeft: 'auto', marginRight: 'auto', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {categoryConfig.map((cat) => (
              <button key={cat.key} onClick={() => { setActiveCategory(cat.key); setSelectedIndex(0); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', fontSize: 13, fontWeight: 500, borderRadius: 20, border: '1px solid', borderColor: activeCategory === cat.key ? 'var(--color-primary-400)' : 'var(--border-default)', background: activeCategory === cat.key ? 'var(--color-primary-50)' : '#FFFFFF', color: activeCategory === cat.key ? 'var(--color-primary-600)' : 'var(--text-secondary)', cursor: 'pointer' }}>
                {cat.label}
                <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 10, background: activeCategory === cat.key ? 'var(--color-primary-100)' : 'var(--color-neutral-100)', color: activeCategory === cat.key ? 'var(--color-primary-600)' : 'var(--text-tertiary)' }}>{cat.count}</span>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{searchTime.toFixed(0)}ms</span>
            <button
              onClick={() => setFuzzySearch(!fuzzySearch)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', fontSize: 12, borderRadius: 6, border: '1px solid', borderColor: fuzzySearch ? 'var(--color-primary-300)' : 'var(--border-default)', background: fuzzySearch ? 'var(--color-primary-50)' : '#FFFFFF', color: fuzzySearch ? 'var(--color-primary-600)' : 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <Icon name="sparkles" size="xs" />
              模糊搜索 {fuzzySearch ? '开' : '关'}
            </button>
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflow: 'auto' }}>
        {!query ? (
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            {history.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>搜索历史</h3>
                  <button onClick={clearHistory} style={{ fontSize: 12, color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}>清除历史</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {history.slice(0, 10).map((item, index) => (
                    <button key={index} onClick={() => handleSearch(item)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: 13, borderRadius: 20, border: '1px solid var(--border-default)', background: '#FFFFFF', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                      <Icon name="clock" size="xs" />{item}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0, marginBottom: 12 }}>热门搜索</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {hotSearches.map((item, index) => (
                  <button key={item} onClick={() => handleSearch(item)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: 13, borderRadius: 20, border: '1px solid var(--border-default)', background: index < 3 ? 'var(--color-primary-50)' : '#FFFFFF', color: index < 3 ? 'var(--color-primary-600)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: index < 3 ? 600 : 400 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: index < 3 ? 'var(--color-primary-500)' : 'var(--text-tertiary)' }}>{index + 1}</span>{item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : filteredResults.length === 0 ? (
          <EmptyState icon="search" title="没有找到结果" description={`没有找到与"${query}"相关的内容`} actionLabel="清除搜索" onAction={() => setQuery('')} size="lg" />
        ) : (
          <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredResults.map((result, index) => (
              <div key={result.id} onClick={() => handleResultClick(result)} onMouseEnter={() => setSelectedIndex(index)} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 20px', borderRadius: 12, cursor: 'pointer', background: selectedIndex === index ? 'var(--color-primary-50)' : '#FFFFFF', border: '1px solid', borderColor: selectedIndex === index ? 'var(--color-primary-200)' : 'var(--border-light)', transition: 'all 0.15s' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: `${result.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={result.icon} size="md" color={result.color} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <h4 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{highlightText(result.title, query)}</h4>
                    <Tag size="sm" variant={result.type === 'note' ? 'primary' : result.type === 'tag' ? 'success' : 'default'}>{result.type === 'note' ? '笔记' : result.type === 'tag' ? '标签' : '设置'}</Tag>
                    {/* 相关度评分 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--color-neutral-100)', overflow: 'hidden' }}>
                        <div style={{ width: `${result.score * 100}%`, height: '100%', background: result.score > 0.7 ? 'var(--color-success-500)' : result.score > 0.5 ? 'var(--color-warning-500)' : 'var(--color-error-500)', borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{Math.round(result.score * 100)}%</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{highlightText(result.description, query)}</p>
                  {/* 搜索解释和匹配字段 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{result.explanation}</span>
                    {result.matchedFields.length > 0 && (
                      <div style={{ display: 'flex', gap: 4 }}>
                        {result.matchedFields.map((field) => (
                          <span key={field} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'var(--color-neutral-100)', color: 'var(--text-tertiary)' }}>{field === 'title' ? '标题' : field === 'content' ? '内容' : field === 'tags' ? '标签' : field}</span>
                        ))}
                      </div>
                    )}
                    {result.metadata?.wordCount && <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>· {result.metadata.wordCount} 字</span>}
                  </div>
                </div>
                <Icon name="chevron-right" size="sm" color="var(--text-tertiary)" style={{ flexShrink: 0, marginTop: 8 }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
