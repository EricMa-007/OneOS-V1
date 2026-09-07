/**
 * OneOS 搜索工具函数
 * 从search-algorithm-engine提取
 * 包含分词、停用词、文本预处理、相似度计算
 * 
 * 作者：A07 梅罗文加（算法工程师）
 */

// 中文停用词
const CHINESE_STOP_WORDS = new Set([
  '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个',
  '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好',
  '自己', '这', '那', '这个', '那个', '什么', '怎么', '为什么', '可以', '可能',
  '因为', '所以', '但是', '如果', '虽然', '而且', '或者', '以及', '等等',
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
  'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used',
  'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into',
  'through', 'during', 'before', 'after', 'above', 'below', 'between', 'out',
  'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there',
  'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more',
  'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same',
  'so', 'than', 'too', 'very', 'just', 'because', 'but', 'and', 'or', 'if',
]);

/**
 * 文本预处理
 * 转小写、去除特殊字符、统一空白
 */
export function preprocessText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 简单分词（支持中英文）
 * 英文按空格和标点分割，中文按字符分割（简化版）
 */
export function tokenize(text: string): string[] {
  const processed = preprocessText(text);
  const tokens: string[] = [];

  // 匹配英文单词和中文字符
  const matches = processed.match(/[a-z0-9]+|[\u4e00-\u9fa5]/g);
  if (matches) {
    for (const token of matches) {
      if (!CHINESE_STOP_WORDS.has(token) && token.length > 0) {
        tokens.push(token);
      }
    }
  }

  // 添加中文二元组（提升中文搜索效果）
  const chineseChars = processed.match(/[\u4e00-\u9fa5]/g);
  if (chineseChars && chineseChars.length > 1) {
    for (let i = 0; i < chineseChars.length - 1; i++) {
      const bigram = chineseChars[i] + chineseChars[i + 1];
      if (!CHINESE_STOP_WORDS.has(bigram)) {
        tokens.push(bigram);
      }
    }
  }

  return tokens;
}

/**
 * 计算词频
 */
export function calculateTermFrequency(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }
  return tf;
}

/**
 * 计算TF-IDF
 */
export function calculateTFIDF(
  termFrequency: number,
  documentFrequency: number,
  totalDocuments: number
): number {
  if (termFrequency === 0 || documentFrequency === 0) return 0;
  const tf = termFrequency;
  const idf = Math.log((totalDocuments + 1) / (documentFrequency + 1)) + 1;
  return tf * idf;
}

/**
 * 计算BM25分数
 */
export function calculateBM25(
  termFrequency: number,
  documentFrequency: number,
  totalDocuments: number,
  documentLength: number,
  averageDocumentLength: number,
  k1: number = 1.5,
  b: number = 0.75
): number {
  if (termFrequency === 0 || documentFrequency === 0) return 0;

  const idf = Math.log(
    (totalDocuments - documentFrequency + 0.5) / (documentFrequency + 0.5) + 1
  );

  const tfNorm =
    (termFrequency * (k1 + 1)) /
    (termFrequency + k1 * (1 - b + b * (documentLength / averageDocumentLength)));

  return idf * tfNorm;
}

/**
 * 计算编辑距离（Levenshtein距离）
 */
export function editDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;

  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1, // 删除
          dp[i][j - 1] + 1, // 插入
          dp[i - 1][j - 1] + 1 // 替换
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * 计算字符串相似度（基于编辑距离）
 */
export function stringSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;

  const distance = editDistance(s1, s2);
  const maxLength = Math.max(s1.length, s2.length);
  return 1 - distance / maxLength;
}

/**
 * n-gram相似度
 */
export function ngramSimilarity(s1: string, s2: string, n: number = 2): number {
  if (s1 === s2) return 1;
  if (s1.length < n || s2.length < n) return stringSimilarity(s1, s2);

  const getNgrams = (str: string): Set<string> => {
    const ngrams = new Set<string>();
    for (let i = 0; i <= str.length - n; i++) {
      ngrams.add(str.substring(i, i + n));
    }
    return ngrams;
  };

  const ngrams1 = getNgrams(s1);
  const ngrams2 = getNgrams(s2);

  let intersection = 0;
  for (const ng of ngrams1) {
    if (ngrams2.has(ng)) intersection++;
  }

  const union = ngrams1.size + ngrams2.size - intersection;
  return union > 0 ? intersection / union : 0;
}

/**
 * 余弦相似度
 */
export function cosineSimilarity(
  vec1: Map<string, number>,
  vec2: Map<string, number>
): number {
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (const [term, weight] of vec1) {
    norm1 += weight * weight;
    if (vec2.has(term)) {
      dotProduct += weight * vec2.get(term)!;
    }
  }

  for (const weight of vec2.values()) {
    norm2 += weight * weight;
  }

  if (norm1 === 0 || norm2 === 0) return 0;
  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

/**
 * 高亮匹配文本
 */
export function highlightMatches(
  text: string,
  query: string,
  highlightClass: string = 'search-highlight'
): string {
  if (!query || !text) return text;

  const tokens = tokenize(query);
  if (tokens.length === 0) return text;

  let result = text;
  for (const token of tokens) {
    if (token.length < 2) continue;
    const regex = new RegExp(`(${escapeRegExp(token)})`, 'gi');
    result = result.replace(regex, `<mark class="${highlightClass}">$1</mark>`);
  }

  return result;
}

/**
 * 提取匹配片段
 */
export function extractMatchSnippet(
  text: string,
  query: string,
  snippetLength: number = 150
): string {
  if (!query || !text) return text.substring(0, snippetLength);

  const tokens = tokenize(query);
  if (tokens.length === 0) return text.substring(0, snippetLength);

  // 找到第一个匹配的位置
  let firstMatch = -1;
  const lowerText = text.toLowerCase();
  for (const token of tokens) {
    const pos = lowerText.indexOf(token.toLowerCase());
    if (pos !== -1 && (firstMatch === -1 || pos < firstMatch)) {
      firstMatch = pos;
    }
  }

  if (firstMatch === -1) {
    return text.substring(0, snippetLength) + (text.length > snippetLength ? '...' : '');
  }

  // 以匹配位置为中心提取片段
  const start = Math.max(0, firstMatch - snippetLength / 3);
  const end = Math.min(text.length, start + snippetLength);
  const snippet = text.substring(start, end);

  return (start > 0 ? '...' : '') + snippet + (end < text.length ? '...' : '');
}

/**
 * 转义正则表达式特殊字符
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
