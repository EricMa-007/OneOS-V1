/**
 * OneOS Service Worker
 * 离线支持、缓存策略、后台同步
 */

const CACHE_NAME = 'oneos-cache-v1';
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
];

// 缓存策略：Stale-While-Revalidate
const SWR_PATTERNS = [
  /^https?:\/\/[^/]+\/assets\//,
  /\.(?:js|css|png|jpg|jpeg|gif|svg|woff2?|ttf|eot)$/,
];

// 缓存策略：Network-First
const NETWORK_FIRST_PATTERNS = [
  /^https?:\/\/[^/]+\/api\//,
];

// 安装事件
self.addEventListener('install', (event) => {
  console.log('[OneOS SW] 安装中...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[OneOS SW] 缓存应用外壳');
        return cache.addAll(APP_SHELL);
      })
      .then(() => self.skipWaiting())
  );
});

// 激活事件
self.addEventListener('activate', (event) => {
  console.log('[OneOS SW] 激活中...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[OneOS SW] 删除旧缓存:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

//  fetch事件
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // 只处理GET请求
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // 导航请求：Network-First，回退到缓存的index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // API请求：Network-First
  if (NETWORK_FIRST_PATTERNS.some((pattern) => pattern.test(url.href))) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // 静态资源：Stale-While-Revalidate
  if (SWR_PATTERNS.some((pattern) => pattern.test(url.href))) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          const fetchPromise = fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                const responseClone = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
              }
              return networkResponse;
            })
            .catch(() => cachedResponse);

          return cachedResponse || fetchPromise;
        })
    );
    return;
  }

  // 默认：Cache-First
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request)
          .then((response) => {
            if (response && response.status === 200 && response.type === 'basic') {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
            }
            return response;
          });
      })
  );
});

// 后台同步事件
self.addEventListener('sync', (event) => {
  console.log('[OneOS SW] 后台同步:', event.tag);

  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// 后台同步数据
async function syncData() {
  console.log('[OneOS SW] 执行数据同步');
  // 实际实现需要与后端API交互
  // 这里模拟同步
  return Promise.resolve();
}

// 推送通知事件
self.addEventListener('push', (event) => {
  console.log('[OneOS SW] 收到推送');
  if (event.data) {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        data: data.data,
        actions: data.actions,
      })
    );
  }
});

// 通知点击事件
self.addEventListener('notificationclick', (event) => {
  console.log('[OneOS SW] 通知点击');
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      self.clients.openWindow(event.notification.data?.url || '/')
    );
  } else {
    event.waitUntil(
      self.clients.matchAll({ type: 'window' })
        .then((clients) => {
          if (clients.length > 0) {
            clients[0].focus();
          } else {
            self.clients.openWindow('/');
          }
        })
    );
  }
});

// 消息事件
self.addEventListener('message', (event) => {
  const { type } = event.data;

  if (type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (type === 'GET_VERSION') {
    event.source.postMessage({
      type: 'VERSION',
      version: CACHE_NAME,
    });
  }

  if (type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((name) => caches.delete(name));
    });
  }
});

// 定期同步（如果支持）
if ('periodicSync' in self.registration) {
  self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'content-sync') {
      event.waitUntil(syncData());
    }
  });
}
