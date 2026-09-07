/**
 * 慢连接消息路由
 * 静默收件箱：消息不实时推送，客户端在设定的时间窗口主动拉取
 * 零打扰：无在线状态、无已读回执的焦虑（服务器不强制已读）
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDB } from '../models/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// 发送消息（慢连接：消息会存储在服务器，对方下次拉取时收到）
router.post('/send', authMiddleware, (req, res) => {
  const { toUserId, content, type = 'text', metadata = {} } = req.body;

  if (!toUserId || !content) {
    return res.status(400).json({ error: '接收者和内容不能为空' });
  }

  const db = getDB();
  const now = new Date().toISOString();

  // 检查是否是好友（慢连接只允许好友间发消息）
  const friendship = db.prepare(
    'SELECT id FROM friendships WHERE user_id = ? AND friend_id = ? AND status = ?'
  ).get(req.userId, toUserId, 'accepted');

  if (!friendship) {
    return res.status(403).json({ error: '只能给好友发送消息' });
  }

  const messageId = uuidv4();
  db.prepare(`
    INSERT INTO messages (id, from_user_id, to_user_id, content, type, metadata, is_read, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 0, ?)
  `).run(messageId, req.userId, toUserId, content, type, JSON.stringify(metadata), now);

  res.status(201).json({
    message: '消息已发送（慢连接：对方将在下次查看收件箱时收到）',
    messageId,
    createdAt: now,
  });
});

// 拉取收件箱（静默收件箱：客户端主动拉取，不实时推送）
router.get('/inbox', authMiddleware, (req, res) => {
  const { limit = 50, offset = 0, unreadOnly = false } = req.query;
  const db = getDB();

  let query = `
    SELECT m.*, u.username as from_username, u.display_name as from_display_name, u.avatar as from_avatar
    FROM messages m
    JOIN users u ON u.id = m.from_user_id
    WHERE m.to_user_id = ?
  `;
  const params = [req.userId];

  if (unreadOnly === 'true') {
    query += ' AND m.is_read = 0';
  }

  query += ' ORDER BY m.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  const messages = db.prepare(query).all(...params);

  // 获取未读消息数
  const unreadCount = db.prepare('SELECT COUNT(*) as count FROM messages WHERE to_user_id = ? AND is_read = 0').get(req.userId).count;

  res.json({
    messages: messages.map(m => ({
      id: m.id,
      fromUser: {
        id: m.from_user_id,
        username: m.from_username,
        displayName: m.from_display_name,
        avatar: m.from_avatar,
      },
      content: m.content,
      type: m.type,
      metadata: JSON.parse(m.metadata || '{}'),
      isRead: m.is_read === 1,
      createdAt: m.created_at,
      deliveredAt: m.delivered_at,
    })),
    unreadCount,
    total: messages.length,
  });
});

// 获取与某个用户的对话历史
router.get('/conversation/:userId', authMiddleware, (req, res) => {
  const { userId } = req.params;
  const { limit = 100, offset = 0 } = req.query;
  const db = getDB();

  const messages = db.prepare(`
    SELECT m.*, u.username, u.display_name, u.avatar
    FROM messages m
    JOIN users u ON u.id = m.from_user_id
    WHERE (m.from_user_id = ? AND m.to_user_id = ?) OR (m.from_user_id = ? AND m.to_user_id = ?)
    ORDER BY m.created_at DESC
    LIMIT ? OFFSET ?
  `).all(req.userId, userId, userId, req.userId, parseInt(limit), parseInt(offset));

  // 标记对方发来的消息为已读
  db.prepare(`
    UPDATE messages SET is_read = 1, read_at = ?
    WHERE from_user_id = ? AND to_user_id = ? AND is_read = 0
  `).run(new Date().toISOString(), userId, req.userId);

  res.json({
    messages: messages.reverse().map(m => ({
      id: m.id,
      fromUser: {
        id: m.from_user_id,
        username: m.username,
        displayName: m.display_name,
        avatar: m.avatar,
      },
      content: m.content,
      type: m.type,
      metadata: JSON.parse(m.metadata || '{}'),
      isRead: m.is_read === 1,
      createdAt: m.created_at,
      isMine: m.from_user_id === req.userId,
    })),
    total: messages.length,
  });
});

// 标记消息为已读
router.post('/:messageId/read', authMiddleware, (req, res) => {
  const { messageId } = req.params;
  const db = getDB();
  const now = new Date().toISOString();

  const result = db.prepare(`
    UPDATE messages SET is_read = 1, read_at = ?
    WHERE id = ? AND to_user_id = ?
  `).run(now, messageId, req.userId);

  if (result.changes === 0) {
    return res.status(404).json({ error: '消息不存在或无权操作' });
  }

  res.json({ message: '已标记为已读' });
});

// 批量标记为已读
router.post('/read-all', authMiddleware, (req, res) => {
  const { fromUserId } = req.body;
  const db = getDB();
  const now = new Date().toISOString();

  let query = 'UPDATE messages SET is_read = 1, read_at = ? WHERE to_user_id = ? AND is_read = 0';
  const params = [now, req.userId];

  if (fromUserId) {
    query += ' AND from_user_id = ?';
    params.push(fromUserId);
  }

  const result = db.prepare(query).run(...params);

  res.json({
    message: `已标记 ${result.changes} 条消息为已读`,
    updatedCount: result.changes,
  });
});

// 删除消息
router.delete('/:messageId', authMiddleware, (req, res) => {
  const { messageId } = req.params;
  const db = getDB();

  const result = db.prepare(`
    DELETE FROM messages WHERE id = ? AND (from_user_id = ? OR to_user_id = ?)
  `).run(messageId, req.userId, req.userId);

  if (result.changes === 0) {
    return res.status(404).json({ error: '消息不存在或无权操作' });
  }

  res.json({ message: '消息已删除' });
});

export default router;
