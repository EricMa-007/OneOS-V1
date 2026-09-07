/**
 * OneOS PWA Service Worker
 * 离线缓存、资源预缓存、运行时缓存
 * 
 * 作者：A06 林克（DevOps工程师）
 */

const CACHE_NAME = 'oneos-v1-cache';
const STATIC_CACHE = 'oneos-static-v1';
const RUNTIME_CACHE = 'oneos-runtime-v1';

// 预缓存的静态资源
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// 安装事件：预缓存静态资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// 激活事件：清理旧缓存
self.addEventListener('activate', (event) => {
  const currentCaches = [STATIC_CACHE, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
      })
      .then((cachesToDelete) => {
        return Promise.all(cachesToDelete.map((cacheToDelete) => caches.delete(cacheToDelete)));
      })
      .then(() => self.clients.claim())
  );
});

//  fetch事件：缓存策略
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // 只缓存GET请求
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // 跳过非http请求
  if (!url.protocol.startsWith('http')) return;

  // HTML文档：网络优先，失败时回退到缓存
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // 静态资源（JS/CSS/图片/字体）：缓存优先，失败时网络请求
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, responseClone));
          }
          return response;
        });
      })
    );
    return;
  }

  // API请求：网络优先，失败时回退到缓存（如果有）
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // 其他请求：默认网络优先
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// 消息事件：支持手动更新缓存
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => caches.delete(cacheName));
    });
  }
});
