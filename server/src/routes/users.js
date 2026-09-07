/**
 * 用户与好友路由
 * 用户资料、好友列表、好友请求、人类节点发现（基于话题）
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDB } from '../models/database.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js';

const router = express.Router();

// 获取用户公开资料
router.get('/:userId', optionalAuthMiddleware, (req, res) => {
  const { userId } = req.params;
  const db = getDB();

  const user = db.prepare('SELECT id, username, display_name, bio, avatar, topic_tags, created_at FROM users WHERE id = ?').get(userId);

  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }

  // 检查是否是好友
  let isFriend = false;
  if (req.userId) {
    const friendship = db.prepare(
      'SELECT id FROM friendships WHERE user_id = ? AND friend_id = ? AND status = ?'
    ).get(req.userId, userId, 'accepted');
    isFriend = !!friendship;
  }

  res.json({
    id: user.id,
    username: user.username,
    displayName: user.display_name,
    bio: user.bio,
    avatar: user.avatar,
    topicTags: JSON.parse(user.topic_tags || '[]'),
    createdAt: user.created_at,
    isFriend,
  });
});

// 获取好友列表
router.get('/me/friends', authMiddleware, (req, res) => {
  const db = getDB();

  const friends = db.prepare(`
    SELECT u.id, u.username, u.display_name, u.bio, u.avatar, u.topic_tags, u.last_active_at, f.created_at
    FROM friendships f
    JOIN users u ON u.id = f.friend_id
    WHERE f.user_id = ? AND f.status = 'accepted'
    ORDER BY f.created_at DESC
  `).all(req.userId);

  res.json({
    friends: friends.map(f => ({
      id: f.id,
      username: f.username,
      displayName: f.display_name,
      bio: f.bio,
      avatar: f.avatar,
      topicTags: JSON.parse(f.topic_tags || '[]'),
      lastActiveAt: f.last_active_at,
      friendshipSince: f.created_at,
    })),
    total: friends.length,
  });
});

// 发送好友请求（通过二维码或用户名）
router.post('/me/friend-requests', authMiddleware, (req, res) => {
  const { toUserId, message } = req.body;

  if (!toUserId) {
    return res.status(400).json({ error: '必须提供目标用户ID' });
  }

  if (toUserId === req.userId) {
    return res.status(400).json({ error: '不能添加自己为好友' });
  }

  const db = getDB();
  const now = new Date().toISOString();

  // 检查目标用户是否存在
  const targetUser = db.prepare('SELECT id FROM users WHERE id = ?').get(toUserId);
  if (!targetUser) {
    return res.status(404).json({ error: '目标用户不存在' });
  }

  // 检查是否已经是好友
  const existingFriendship = db.prepare(
    'SELECT id FROM friendships WHERE user_id = ? AND friend_id = ? AND status = ?'
  ).get(req.userId, toUserId, 'accepted');
  if (existingFriendship) {
    return res.status(409).json({ error: '已经是好友了' });
  }

  // 检查是否已有待处理的请求
  const existingRequest = db.prepare(
    'SELECT id, status FROM friend_requests WHERE ((from_user_id = ? AND to_user_id = ?) OR (from_user_id = ? AND to_user_id = ?))'
  ).get(req.userId, toUserId, toUserId, req.userId);
  
  if (existingRequest) {
    if (existingRequest.status === 'pending') {
      return res.status(409).json({ error: '已有待处理的好友请求' });
    }
    // 如果已有已接受或已拒绝的记录，更新为新的pending请求
    const now = new Date().toISOString();
    db.prepare('UPDATE friend_requests SET status = ?, message = ?, created_at = ?, responded_at = NULL WHERE id = ?')
      .run('pending', message || '', now, existingRequest.id);
    return res.status(201).json({
      message: '好友请求已发送',
      requestId: existingRequest.id,
    });
  }

  const requestId = uuidv4();
  db.prepare(`
    INSERT INTO friend_requests (id, from_user_id, to_user_id, message, status, created_at)
    VALUES (?, ?, ?, ?, 'pending', ?)
  `).run(requestId, req.userId, toUserId, message || '', now);

  res.status(201).json({
    message: '好友请求已发送',
    requestId,
  });
});

// 获取收到的好友请求
router.get('/me/friend-requests', authMiddleware, (req, res) => {
  const db = getDB();

  const requests = db.prepare(`
    SELECT fr.id, fr.from_user_id, fr.message, fr.created_at,
           u.username, u.display_name, u.avatar, u.bio
    FROM friend_requests fr
    JOIN users u ON u.id = fr.from_user_id
    WHERE fr.to_user_id = ? AND fr.status = 'pending'
    ORDER BY fr.created_at DESC
  `).all(req.userId);

  res.json({
    requests: requests.map(r => ({
      id: r.id,
      fromUser: {
        id: r.from_user_id,
        username: r.username,
        displayName: r.display_name,
        avatar: r.avatar,
        bio: r.bio,
      },
      message: r.message,
      createdAt: r.created_at,
    })),
    total: requests.length,
  });
});

// 接受好友请求
router.post('/me/friend-requests/:requestId/accept', authMiddleware, (req, res) => {
  const { requestId } = req.params;
  const db = getDB();
  const now = new Date().toISOString();

  const request = db.prepare('SELECT * FROM friend_requests WHERE id = ? AND to_user_id = ? AND status = ?').get(requestId, req.userId, 'pending');
  if (!request) {
    return res.status(404).json({ error: '好友请求不存在或已处理' });
  }

  // 更新请求状态
  db.prepare('UPDATE friend_requests SET status = ?, responded_at = ? WHERE id = ?').run('accepted', now, requestId);

  // 创建双向好友关系
  const friendshipId1 = uuidv4();
  const friendshipId2 = uuidv4();

  db.prepare('INSERT INTO friendships (id, user_id, friend_id, status, created_at) VALUES (?, ?, ?, ?, ?)')
    .run(friendshipId1, req.userId, request.from_user_id, 'accepted', now);
  db.prepare('INSERT INTO friendships (id, user_id, friend_id, status, created_at) VALUES (?, ?, ?, ?, ?)')
    .run(friendshipId2, request.from_user_id, req.userId, 'accepted', now);

  res.json({ message: '已接受好友请求' });
});

// 拒绝好友请求
router.post('/me/friend-requests/:requestId/reject', authMiddleware, (req, res) => {
  const { requestId } = req.params;
  const db = getDB();
  const now = new Date().toISOString();

  const request = db.prepare('SELECT id FROM friend_requests WHERE id = ? AND to_user_id = ? AND status = ?').get(requestId, req.userId, 'pending');
  if (!request) {
    return res.status(404).json({ error: '好友请求不存在或已处理' });
  }

  db.prepare('UPDATE friend_requests SET status = ?, responded_at = ? WHERE id = ?').run('rejected', now, requestId);

  res.json({ message: '已拒绝好友请求' });
});

// 删除好友
router.delete('/me/friends/:friendId', authMiddleware, (req, res) => {
  const { friendId } = req.params;
  const db = getDB();

  // 删除好友关系
  db.prepare('DELETE FROM friendships WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)')
    .run(req.userId, friendId, friendId, req.userId);

  // 同时清理对应的好友请求记录（否则唯一约束会阻止重新发送请求）
  db.prepare('DELETE FROM friend_requests WHERE (from_user_id = ? AND to_user_id = ?) OR (from_user_id = ? AND to_user_id = ?)')
    .run(req.userId, friendId, friendId, req.userId);

  res.json({ message: '已删除好友' });
});

// 人类节点发现：基于话题标签推荐可能有深度对话的人
router.get('/discover/humans', authMiddleware, (req, res) => {
  const { topic, limit = 10 } = req.query;
  const db = getDB();

  // 获取当前用户的话题标签
  const currentUser = db.prepare('SELECT topic_tags FROM users WHERE id = ?').get(req.userId);
  const myTags = JSON.parse(currentUser.topic_tags || '[]');

  // 查找有共同话题的用户（排除自己和已有好友）
  let users;
  if (topic) {
    users = db.prepare(`
      SELECT id, username, display_name, bio, avatar, topic_tags
      FROM users
      WHERE id != ?
        AND topic_tags LIKE ?
        AND id NOT IN (SELECT friend_id FROM friendships WHERE user_id = ? AND status = 'accepted')
      LIMIT ?
    `).all(req.userId, `%${topic}%`, req.userId, parseInt(limit));
  } else {
    // 基于自己的话题标签推荐
    users = db.prepare(`
      SELECT id, username, display_name, bio, avatar, topic_tags
      FROM users
      WHERE id != ?
        AND id NOT IN (SELECT friend_id FROM friendships WHERE user_id = ? AND status = 'accepted')
      LIMIT 100
    `).all(req.userId, req.userId);

    // 计算话题交集并排序
    users = users.map(u => {
      const userTags = JSON.parse(u.topic_tags || '[]');
      const commonTags = userTags.filter(t => myTags.includes(t));
      return { ...u, commonTags, commonCount: commonTags.length };
    }).filter(u => u.commonCount > 0)
      .sort((a, b) => b.commonCount - a.commonCount)
      .slice(0, parseInt(limit));
  }

  res.json({
    recommendations: users.map(u => ({
      id: u.id,
      username: u.username,
      displayName: u.display_name,
      bio: u.bio,
      avatar: u.avatar,
      topicTags: JSON.parse(u.topic_tags || '[]'),
      commonTags: u.commonTags || [],
      commonCount: u.commonCount || 0,
    })),
    total: users.length,
  });
});

export default router;
