// ============================================
// OneOS V2 - IndexedDB 数据层核心封装
// 提供统一的数据库访问API，支持CRUD、查询、事务、版本迁移
// ============================================

(function() {
  'use strict';

  // 数据库配置
  const DB_NAME = 'OneOS';
  const DB_VERSION = 1;

  // 数据仓库（表）定义
  const STORES = {
    notes: {
      name: 'notes',
      keyPath: 'id',
      indexes: [
        { name: 'folder', keyPath: 'folder', unique: false },
        { name: 'updatedAt', keyPath: 'updatedAt', unique: false },
        { name: 'createdAt', keyPath: 'createdAt', unique: false },
      ]
    },
    folders: {
      name: 'folders',
      keyPath: 'id',
      indexes: [
        { name: 'parentId', keyPath: 'parentId', unique: false },
        { name: 'order', keyPath: 'order', unique: false },
      ]
    },
    tags: {
      name: 'tags',
      keyPath: 'name',
      indexes: [
        { name: 'count', keyPath: 'count', unique: false },
      ]
    },
    conversations: {
      name: 'conversations',
      keyPath: 'id',
      indexes: [
        { name: 'updatedAt', keyPath: 'updatedAt', unique: false },
        { name: 'model', keyPath: 'model', unique: false },
        { name: 'personaId', keyPath: 'personaId', unique: false },
      ]
    },
    messages: {
      name: 'messages',
      keyPath: 'id',
      indexes: [
        { name: 'conversationId', keyPath: 'conversationId', unique: false },
        { name: 'createdAt', keyPath: 'createdAt', unique: false },
        { name: 'role', keyPath: 'role', unique: false },
      ]
    },
    calendar: {
      name: 'calendar',
      keyPath: 'date',
      indexes: [
        { name: 'intensity', keyPath: 'intensity', unique: false },
      ]
    },
    settings: {
      name: 'settings',
      keyPath: 'key',
    },
    graph: {
      name: 'graph',
      keyPath: 'id',
      indexes: [
        { name: 'type', keyPath: 'type', unique: false },
        { name: 'topic', keyPath: 'topic', unique: false },
      ]
    },
    social: {
      name: 'social',
      keyPath: 'id',
      indexes: [
        { name: 'personId', keyPath: 'personId', unique: false },
        { name: 'date', keyPath: 'date', unique: false },
      ]
    },
    circles: {
      name: 'circles',
      keyPath: 'id',
      indexes: [
        { name: 'topic', keyPath: 'topic', unique: false },
      ]
    },
  };

  // 数据库实例
  let dbInstance = null;
  let initPromise = null;

  // ============================================
  // 数据库初始化与版本管理
  // ============================================

  /**
   * 打开数据库连接
   * @returns {Promise<IDBDatabase>}
   */
  function openDatabase() {
    if (initPromise) return initPromise;

    initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        console.error('[OneOSDB] 数据库打开失败:', event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = (event) => {
        dbInstance = event.target.result;
        console.log('[OneOSDB] 数据库打开成功，版本:', dbInstance.version);

        // 监听数据库版本变更
        dbInstance.onversionchange = () => {
          dbInstance.close();
          console.log('[OneOSDB] 数据库版本变更，连接已关闭');
        };

        resolve(dbInstance);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        const oldVersion = event.oldVersion;
        console.log(`[OneOSDB] 数据库升级: ${oldVersion} -> ${DB_VERSION}`);

        // 创建所有数据仓库
        Object.values(STORES).forEach(storeDef => {
          if (!db.objectStoreNames.contains(storeDef.name)) {
            const store = db.createObjectStore(storeDef.name, {
              keyPath: storeDef.keyPath,
              autoIncrement: storeDef.autoIncrement || false,
            });

            // 创建索引
            if (storeDef.indexes) {
              storeDef.indexes.forEach(indexDef => {
                store.createIndex(indexDef.name, indexDef.keyPath, {
                  unique: indexDef.unique || false,
                });
              });
            }

            console.log(`[OneOSDB] 创建数据仓库: ${storeDef.name}`);
          }
        });
      };
    });

    return initPromise;
  }

  /**
   * 获取数据库实例（确保已初始化）
   * @returns {Promise<IDBDatabase>}
   */
  async function getDB() {
    if (!dbInstance) {
      await openDatabase();
    }
    return dbInstance;
  }

  /**
   * 关闭数据库连接
   */
  function closeDatabase() {
    if (dbInstance) {
      dbInstance.close();
      dbInstance = null;
      initPromise = null;
      console.log('[OneOSDB] 数据库连接已关闭');
    }
  }

  /**
   * 删除整个数据库（慎用）
   * @returns {Promise<void>}
   */
  function deleteDatabase() {
    return new Promise((resolve, reject) => {
      closeDatabase();
      const request = indexedDB.deleteDatabase(DB_NAME);
      request.onsuccess = () => {
        console.log('[OneOSDB] 数据库已删除');
        resolve();
      };
      request.onerror = (event) => {
        console.error('[OneOSDB] 数据库删除失败:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  // ============================================
  // 通用CRUD操作
  // ============================================

  /**
   * 执行事务操作
   * @param {string|string[]} storeNames - 数据仓库名称
   * @param {string} mode - 事务模式：readonly | readwrite
   * @param {Function} callback - 事务回调，接收store参数
   * @returns {Promise<any>}
   */
  async function transaction(storeNames, mode, callback) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeNames, mode);
      const stores = Array.isArray(storeNames)
        ? storeNames.map(name => tx.objectStore(name))
        : tx.objectStore(storeNames);

      let result;
      try {
        result = callback(stores, tx);
      } catch (err) {
        reject(err);
        return;
      }

      tx.oncomplete = () => resolve(result);
      tx.onerror = (event) => {
        console.error('[OneOSDB] 事务失败:', event.target.error);
        reject(event.target.error);
      };
      tx.onabort = (event) => {
        console.error('[OneOSDB] 事务中止:', event.target.error);
        reject(event.target.error || new Error('Transaction aborted'));
      };
    });
  }

  /**
   * 添加一条记录
   * @param {string} storeName - 数据仓库名称
   * @param {object} data - 要添加的数据
   * @returns {Promise<IDBValidKey>} 新增记录的key
   */
  async function add(storeName, data) {
    return transaction(storeName, 'readwrite', (store) => {
      return new Promise((resolve, reject) => {
        const request = store.add(data);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    });
  }

  /**
   * 添加或更新一条记录（如果key已存在则更新）
   * @param {string} storeName - 数据仓库名称
   * @param {object} data - 要添加或更新的数据
   * @returns {Promise<IDBValidKey>}
   */
  async function put(storeName, data) {
    return transaction(storeName, 'readwrite', (store) => {
      return new Promise((resolve, reject) => {
        const request = store.put(data);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    });
  }

  /**
   * 根据key获取一条记录
   * @param {string} storeName - 数据仓库名称
   * @param {IDBValidKey} key - 记录的key
   * @returns {Promise<object|undefined>}
   */
  async function get(storeName, key) {
    return transaction(storeName, 'readonly', (store) => {
      return new Promise((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    });
  }

  /**
   * 根据key删除一条记录
   * @param {string} storeName - 数据仓库名称
   * @param {IDBValidKey} key - 记录的key
   * @returns {Promise<void>}
   */
  async function remove(storeName, key) {
    return transaction(storeName, 'readwrite', (store) => {
      return new Promise((resolve, reject) => {
        const request = store.delete(key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  }

  /**
   * 清空数据仓库的所有记录
   * @param {string} storeName - 数据仓库名称
   * @returns {Promise<void>}
   */
  async function clear(storeName) {
    return transaction(storeName, 'readwrite', (store) => {
      return new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  }

  /**
   * 获取数据仓库的记录数量
   * @param {string} storeName - 数据仓库名称
   * @returns {Promise<number>}
   */
  async function count(storeName) {
    return transaction(storeName, 'readonly', (store) => {
      return new Promise((resolve, reject) => {
        const request = store.count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    });
  }

  // ============================================
  // 查询操作
  // ============================================

  /**
   * 获取数据仓库的所有记录
   * @param {string} storeName - 数据仓库名称
   * @param {object} [options] - 查询选项
   * @param {string} [options.index] - 索引名称
   * @param {IDBKeyRange} [options.range] - key范围
   * @param {string} [options.direction] - 排序方向：next | prev | nextunique | prevunique
   * @param {number} [options.limit] - 返回数量限制
   * @returns {Promise<object[]>}
   */
  async function getAll(storeName, options = {}) {
    const { index, range, direction = 'next', limit } = options;

    return transaction(storeName, 'readonly', (store) => {
      return new Promise((resolve, reject) => {
        const target = index ? store.index(index) : store;
        const request = target.openCursor(range, direction);
        const results = [];

        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            results.push(cursor.value);
            if (limit && results.length >= limit) {
              resolve(results);
              return;
            }
            cursor.continue();
          } else {
            resolve(results);
          }
        };

        request.onerror = () => reject(request.error);
      });
    });
  }

  /**
   * 根据索引查询记录
   * @param {string} storeName - 数据仓库名称
   * @param {string} indexName - 索引名称
   * @param {IDBValidKey} value - 索引值
   * @returns {Promise<object[]>}
   */
  async function getByIndex(storeName, indexName, value) {
    const range = IDBKeyRange.only(value);
    return getAll(storeName, { index: indexName, range });
  }

  /**
   * 全文搜索（简单实现，遍历所有记录匹配关键词）
   * @param {string} storeName - 数据仓库名称
   * @param {string} keyword - 搜索关键词
   * @param {string[]} fields - 要搜索的字段
   * @param {object} [options] - 查询选项
   * @returns {Promise<Array<{item: object, score: number}>>}
   */
  async function search(storeName, keyword, fields, options = {}) {
    const allItems = await getAll(storeName, options);
    const lowerKeyword = keyword.toLowerCase();

    const results = allItems
      .map(item => {
        let score = 0;
        fields.forEach(field => {
          const value = item[field];
          if (typeof value === 'string') {
            const lowerValue = value.toLowerCase();
            if (lowerValue === lowerKeyword) score += 10;
            else if (lowerValue.startsWith(lowerKeyword)) score += 5;
            else if (lowerValue.includes(lowerKeyword)) score += 2;
          }
        });
        return { item, score };
      })
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score);

    return results;
  }

  // ============================================
  // 批量操作
  // ============================================

  /**
   * 批量添加记录
   * @param {string} storeName - 数据仓库名称
   * @param {object[]} items - 要添加的数据数组
   * @returns {Promise<IDBValidKey[]>}
   */
  async function bulkAdd(storeName, items) {
    return transaction(storeName, 'readwrite', (store) => {
      return Promise.all(items.map(item =>
        new Promise((resolve, reject) => {
          const request = store.add(item);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        })
      ));
    });
  }

  /**
   * 批量添加或更新记录
   * @param {string} storeName - 数据仓库名称
   * @param {object[]} items - 要添加或更新的数据数组
   * @returns {Promise<IDBValidKey[]>}
   */
  async function bulkPut(storeName, items) {
    return transaction(storeName, 'readwrite', (store) => {
      return Promise.all(items.map(item =>
        new Promise((resolve, reject) => {
          const request = store.put(item);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        })
      ));
    });
  }

  /**
   * 批量删除记录
   * @param {string} storeName - 数据仓库名称
   * @param {IDBValidKey[]} keys - 要删除的key数组
   * @returns {Promise<void>}
   */
  async function bulkRemove(storeName, keys) {
    return transaction(storeName, 'readwrite', (store) => {
      return Promise.all(keys.map(key =>
        new Promise((resolve, reject) => {
          const request = store.delete(key);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        })
      ));
    });
  }

  // ============================================
  // 导出/导入
  // ============================================

  /**
   * 导出整个数据库为JSON
   * @returns {Promise<object>} 包含所有数据仓库记录的对象
   */
  async function exportAll() {
    const result = {};
    for (const storeName of Object.keys(STORES)) {
      result[storeName] = await getAll(storeName);
    }
    return {
      version: DB_VERSION,
      exportedAt: new Date().toISOString(),
      data: result,
    };
  }

  /**
   * 从JSON导入数据
   * @param {object} exportData - exportAll()返回的数据对象
   * @param {boolean} [merge=false] - 是否合并（true: 追加，false: 清空后导入）
   * @returns {Promise<void>}
   */
  async function importAll(exportData, merge = false) {
    if (!exportData || !exportData.data) {
      throw new Error('无效的导出数据格式');
    }

    for (const [storeName, items] of Object.entries(exportData.data)) {
      if (!STORES[storeName]) continue;
      if (!merge) {
        await clear(storeName);
      }
      if (items.length > 0) {
        await bulkPut(storeName, items);
      }
    }
  }

  // ============================================
  // 数据库状态与诊断
  // ============================================

  /**
   * 获取数据库状态信息
   * @returns {Promise<object>}
   */
  async function getStatus() {
    const db = await getDB();
    const storeNames = Array.from(db.objectStoreNames);
    const stats = {};

    for (const storeName of storeNames) {
      stats[storeName] = await count(storeName);
    }

    return {
      name: DB_NAME,
      version: db.version,
      stores: storeNames,
      recordCounts: stats,
      totalRecords: Object.values(stats).reduce((a, b) => a + b, 0),
    };
  }

  /**
   * 检查IndexedDB是否可用
   * @returns {boolean}
   */
  function isAvailable() {
    return 'indexedDB' in window;
  }

  // ============================================
  // 暴露API
  // ============================================

  const OneOSDB = {
    // 常量
    DB_NAME,
    DB_VERSION,
    STORES,

    // 初始化与管理
    openDatabase,
    getDB,
    closeDatabase,
    deleteDatabase,
    isAvailable,

    // 事务
    transaction,

    // CRUD
    add,
    put,
    get,
    remove,
    clear,
    count,

    // 查询
    getAll,
    getByIndex,
    search,

    // 批量操作
    bulkAdd,
    bulkPut,
    bulkRemove,

    // 导出导入
    exportAll,
    importAll,

    // 状态
    getStatus,
  };

  // 挂载到全局
  if (typeof window !== 'undefined') {
    window.OneOSDB = OneOSDB;
  }

  console.log('[OneOSDB] 数据层模块已加载');

})();
