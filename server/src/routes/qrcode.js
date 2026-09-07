/**
 * 二维码路由
 * 生成用户二维码，用于扫码添加好友
 * 慢连接社交：通过二维码认识，而非搜索用户名
 */

import express from 'express';
import QRCode from 'qrcode';
import { getDB } from '../models/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// 生成当前用户的二维码（用于添加好友）
router.get('/me', authMiddleware, async (req, res) => {
  const db = getDB();
  const user = db.prepare('SELECT id, username, display_name, bio, avatar FROM users WHERE id = ?').get(req.userId);

  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }

  // 二维码内容：oneos://add-friend?userId=xxx&username=xxx
  const qrData = JSON.stringify({
    type: 'oneos-add-friend',
    version: '1.0',
    userId: user.id,
    username: user.username,
    displayName: user.display_name,
    timestamp: Date.now(),
  });

  try {
    // 生成二维码为Data URL
    const qrDataUrl = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#2D3436',
        light: '#FFFFFF',
      },
    });

    res.json({
      qrCode: qrDataUrl,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.display_name,
        bio: user.bio,
        avatar: user.avatar,
      },
      qrData: JSON.parse(qrData),
    });
  } catch (err) {
    console.error('生成二维码失败:', err);
    res.status(500).json({ error: '生成二维码失败' });
  }
});

// 生成指定用户的二维码（公开访问，用于分享）
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  const db = getDB();

  const user = db.prepare('SELECT id, username, display_name, bio, avatar FROM users WHERE id = ?').get(userId);

  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }

  const qrData = JSON.stringify({
    type: 'oneos-add-friend',
    version: '1.0',
    userId: user.id,
    username: user.username,
    displayName: user.display_name,
    timestamp: Date.now(),
  });

  try {
    const qrDataUrl = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#2D3436',
        light: '#FFFFFF',
      },
    });

    res.json({
      qrCode: qrDataUrl,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.display_name,
        bio: user.bio,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error('生成二维码失败:', err);
    res.status(500).json({ error: '生成二维码失败' });
  }
});

// 解析二维码内容（扫码后调用，获取用户信息并发送好友请求）
router.post('/scan', authMiddleware, (req, res) => {
  const { qrData, message } = req.body;

  if (!qrData) {
    return res.status(400).json({ error: '二维码数据不能为空' });
  }

  let parsed;
  try {
    parsed = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
  } catch (err) {
    return res.status(400).json({ error: '无效的二维码数据' });
  }

  if (parsed.type !== 'oneos-add-friend') {
    return res.status(400).json({ error: '不是OneOS好友二维码' });
  }

  const { userId: targetUserId } = parsed;

  if (targetUserId === req.userId) {
    return res.status(400).json({ error: '不能添加自己为好友' });
  }

  const db = getDB();
  const now = new Date().toISOString();

  // 检查目标用户是否存在
  const targetUser = db.prepare('SELECT id, username, display_name, bio, avatar FROM users WHERE id = ?').get(targetUserId);
  if (!targetUser) {
    return res.status(404).json({ error: '目标用户不存在' });
  }

  // 检查是否已经是好友
  const existingFriendship = db.prepare(
    'SELECT id FROM friendships WHERE user_id = ? AND friend_id = ? AND status = ?'
  ).get(req.userId, targetUserId, 'accepted');
  if (existingFriendship) {
    return res.status(409).json({
      error: '已经是好友了',
      user: targetUser,
      alreadyFriend: true,
    });
  }

  // 检查是否已有待处理的请求
  const existingRequest = db.prepare(
    "SELECT id FROM friend_requests WHERE ((from_user_id = ? AND to_user_id = ?) OR (from_user_id = ? AND to_user_id = ?)) AND status = 'pending'"
  ).get(req.userId, targetUserId, targetUserId, req.userId);
  if (existingRequest) {
    return res.status(409).json({
      error: '已有待处理的好友请求',
      user: targetUser,
      requestPending: true,
    });
  }

  // 创建好友请求
  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  db.prepare(`
    INSERT INTO friend_requests (id, from_user_id, to_user_id, message, status, created_at)
    VALUES (?, ?, ?, ?, 'pending', ?)
  `).run(requestId, req.userId, targetUserId, message || '通过二维码添加', now);

  res.status(201).json({
    message: '好友请求已发送（慢连接：对方将在下次查看收件箱时收到）',
    requestId,
    targetUser: {
      id: targetUser.id,
      username: targetUser.username,
      displayName: targetUser.display_name,
      bio: targetUser.bio,
      avatar: targetUser.avatar,
    },
  });
});

export default router;
