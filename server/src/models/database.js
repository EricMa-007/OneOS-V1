/**
 * OneOS 服务器端数据库模型
 * SQLite 数据库初始化和表结构定义
 * 
 * 设计原则：
 * - 慢连接：消息不需要实时推送，客户端主动拉取
 * - 零打扰：无在线状态、无已读回执（服务器不记录这些）
 * - 用户主权：用户数据可导出、可删除
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../../data/oneos.db');

let db = null;

export function getDB() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function initDatabase() {
  const database = getDB();

  // 用户表
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      bio TEXT DEFAULT '',
      avatar TEXT DEFAULT '',
      topic_tags TEXT DEFAULT '[]',
      public_key TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      last_active_at TEXT
    );
  `);

  // 好友关系表（慢连接好友，通过话题认识）
  database.exec(`
    CREATE TABLE IF NOT EXISTS friendships (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      friend_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'accepted',
      created_at TEXT NOT NULL,
      UNIQUE(user_id, friend_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (friend_id) REFERENCES users(id)
    );
  `);

  // 好友请求表
  database.exec(`
    CREATE TABLE IF NOT EXISTS friend_requests (
      id TEXT PRIMARY KEY,
      from_user_id TEXT NOT NULL,
      to_user_id TEXT NOT NULL,
      message TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL,
      responded_at TEXT,
      UNIQUE(from_user_id, to_user_id),
      FOREIGN KEY (from_user_id) REFERENCES users(id),
      FOREIGN KEY (to_user_id) REFERENCES users(id)
    );
  `);

  // 慢连接消息表（静默收件箱，不实时推送）
  database.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      from_user_id TEXT NOT NULL,
      to_user_id TEXT NOT NULL,
      content TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'text',
      metadata TEXT DEFAULT '{}',
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      delivered_at TEXT,
      read_at TEXT,
      FOREIGN KEY (from_user_id) REFERENCES users(id),
      FOREIGN KEY (to_user_id) REFERENCES users(id)
    );
  `);

  // 极小圈子表（最多10人，话题驱动）
  database.exec(`
    CREATE TABLE IF NOT EXISTS circles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      topic TEXT NOT NULL,
      owner_id TEXT NOT NULL,
      max_members INTEGER NOT NULL DEFAULT 10,
      is_private INTEGER NOT NULL DEFAULT 0,
      cover_image TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      last_activity_at TEXT,
      FOREIGN KEY (owner_id) REFERENCES users(id)
    );
  `);

  // 圈子成员表
  database.exec(`
    CREATE TABLE IF NOT EXISTS circle_members (
      id TEXT PRIMARY KEY,
      circle_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member',
      joined_at TEXT NOT NULL,
      last_active_at TEXT,
      UNIQUE(circle_id, user_id),
      FOREIGN KEY (circle_id) REFERENCES circles(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // 圈子共享文档（极小圈子的协作文档，讨论自动沉淀为知识）
  database.exec(`
    CREATE TABLE IF NOT EXISTS circle_documents (
      id TEXT PRIMARY KEY,
      circle_id TEXT NOT NULL,
      author_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      content_type TEXT NOT NULL DEFAULT 'markdown',
      is_pinned INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (circle_id) REFERENCES circles(id),
      FOREIGN KEY (author_id) REFERENCES users(id)
    );
  `);

  // 圈子消息表（圈子内的讨论，无消息流，按文档组织）
  database.exec(`
    CREATE TABLE IF NOT EXISTS circle_messages (
      id TEXT PRIMARY KEY,
      circle_id TEXT NOT NULL,
      document_id TEXT,
      user_id TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (circle_id) REFERENCES circles(id),
      FOREIGN KEY (document_id) REFERENCES circle_documents(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // 用户设备表（用于多设备同步）
  database.exec(`
    CREATE TABLE IF NOT EXISTS user_devices (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      device_name TEXT NOT NULL,
      device_type TEXT NOT NULL,
      last_sync_at TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // 索引
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_messages_to_user ON messages(to_user_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_friendships_user ON friendships(user_id);
    CREATE INDEX IF NOT EXISTS idx_friend_requests_to ON friend_requests(to_user_id, status);
    CREATE INDEX IF NOT EXISTS idx_circle_members_user ON circle_members(user_id);
    CREATE INDEX IF NOT EXISTS idx_circle_documents_circle ON circle_documents(circle_id);
    CREATE INDEX IF NOT EXISTS idx_users_topic ON users(topic_tags);
  `);

  console.log('✅ 数据库初始化完成:', DB_PATH);
  return database;
}

// 如果直接运行此文件，则初始化数据库
if (process.argv[1] && process.argv[1].includes('database.js')) {
  initDatabase();
  console.log('数据库表结构已创建');
}

export default { getDB, initDatabase };
