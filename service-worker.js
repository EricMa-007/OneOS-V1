// ============================================
// OneOS V2 - Service Worker
// 离线缓存、资源预加载、后台同步
// ============================================

const CACHE_NAME = 'oneos-v1-cache';
const CACHE_VERSION = 'v1.0.0';
const FULL_CACHE_NAME = `${CACHE_NAME}-${CACHE_VERSION}`;

// 预缓存资源列表
const PRECACHE_URLS = [
  './',
  './index.html',
  './mobile.html',
  './manifest.json',
  // 核心JS
  './src/utils/config.js',
  './src/utils/helpers.js',
  './src/db/database.js',
  './src/db/notes.js',
  './src/db/settings.js',
  './src/data-adapter.js',
  './src/ai/ollama-service.js',
  './src/ai/persona-manager.js',
  './src/ai/rag-service.js',
  './src/editor/markdown-parser.js',
  './src/editor/backlink-service.js',
  './src/editor/tag-service.js',
  './src/editor/performance-optimizer.js',
  './src/graph/force-layout.js',
  './src/graph/graph-data-service.js',
  './src/graph/graph-exporter.js',
  './src/voice/voice-service.js',
  './src/search/search-service.js',
  // CSS
  './styles/design-system-v2.css',
  './styles/mobile.css',
  // 外部资源（CDN）
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
];

// 缓存策略配置
const CACHE_STRATEGIES = {
  // 网络优先（需要实时更新的资源）
  networkFirst: [
    '/api/',
    '/data/',
  ],
  // 缓存优先（静态资源）
  cacheFirst: [
    '.js',
    '.css',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.svg',
    '.woff',
    '.woff2',
    '.ttf',
    '.eot',
  ],
  // Stale-While-Revalidate（HTML页面）
  staleWhileRevalidate: [
    '.html',
  ],
};

// ============================================
// 安装事件
// ============================================
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] 安装中...');
  event.waitUntil(
    caches.open(FULL_CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] 预缓存资源...');
        return cache.addAll(PRECACHE_URLS.map(url => new Request(url, { cache: 'reload' })));
      })
      .then(() => {
        console.log('[ServiceWorker] 预缓存完成');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[ServiceWorker] 预缓存失败:', error);
      })
  );
});

// ============================================
// 激活事件
// ============================================
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] 激活中...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith(CACHE_NAME) && name !== FULL_CACHE_NAME)
            .map((name) => {
              console.log('[ServiceWorker] 删除旧缓存:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[ServiceWorker] 激活完成');
        return self.clients.claim();
      })
  );
});

// ============================================
// 请求拦截
// ============================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 只处理GET请求
  if (request.method !== 'GET') return;

  // 跳过非HTTP请求
  if (!url.protocol.startsWith('http')) return;

  // 跳过Ollama API请求（需要实时连接）
  if (url.hostname === 'localhost' && url.port === '11434') return;

  // 根据URL选择缓存策略
  const strategy = getCacheStrategy(url);

  switch (strategy) {
    case 'networkFirst':
      event.respondWith(networkFirst(request));
      break;
    case 'cacheFirst':
      event.respondWith(cacheFirst(request));
      break;
    case 'staleWhileRevalidate':
      event.respondWith(staleWhileRevalidate(request));
      break;
    default:
      event.respondWith(staleWhileRevalidate(request));
  }
});

// ============================================
// 缓存策略实现
// ============================================

// 网络优先：先尝试网络，失败则使用缓存
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(FULL_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;
    // 返回离线页面
    return new Response('离线模式 - 请检查网络连接', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

// 缓存优先：先使用缓存，缓存不存在则网络请求
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) return cachedResponse;
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(FULL_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response('资源加载失败', { status: 404 });
  }
}

// Stale-While-Revalidate：返回缓存，同时后台更新
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  const networkPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        caches.open(FULL_CACHE_NAME).then((cache) => {
          cache.put(request, networkResponse.clone());
        });
      }
      return networkResponse;
    })
    .catch(() => cachedResponse);

  return cachedResponse || networkPromise;
}

// ============================================
// 工具函数
// ============================================

function getCacheStrategy(url) {
  const path = url.pathname;
  // 网络优先
  for (const pattern of CACHE_STRATEGIES.networkFirst) {
    if (path.includes(pattern)) return 'networkFirst';
  }
  // 缓存优先
  for (const ext of CACHE_STRATEGIES.cacheFirst) {
    if (path.endsWith(ext)) return 'cacheFirst';
  }
  // Stale-While-Revalidate
  for (const ext of CACHE_STRATEGIES.staleWhileRevalidate) {
    if (path.endsWith(ext)) return 'staleWhileRevalidate';
  }
  return 'staleWhileRevalidate';
}

// ============================================
// 消息处理
// ============================================
self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'CLEAR_CACHE':
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
      break;
    case 'GET_CACHE_SIZE':
      caches.open(FULL_CACHE_NAME).then((cache) => {
        cache.keys().then((keys) => {
          event.source.postMessage({
            type: 'CACHE_SIZE',
            payload: { count: keys.length },
          });
        });
      });
      break;
  }
});

// ============================================
// 后台同步
// ============================================
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-notes') {
    event.waitUntil(syncNotes());
  }
});

async function syncNotes() {
  console.log('[ServiceWorker] 后台同步笔记...');
  // 这里可以实现数据同步逻辑
  // 例如：将本地IndexedDB中的笔记同步到服务器
}

// ============================================
// 推送通知
// ============================================
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const title = data.title || 'OneOS 通知';
  const options = {
    body: data.body || '',
    icon: './assets/icons/icon-192.png',
    badge: './assets/icons/icon-192.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: data.actions || [],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || './mobile.html';
  event.waitUntil(
    clients.openWindow(url)
  );
});

console.log('[ServiceWorker] OneOS Service Worker 已加载');
