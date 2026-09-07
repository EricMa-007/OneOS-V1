/**
 * 用户认证路由
 * 注册、登录、获取当前用户信息
 */

import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getDB } from '../models/database.js';
import { generateToken, authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// 注册
router.post('/register', (req, res) => {
  const { username, password, displayName, bio, topicTags } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }

  if (username.length < 3) {
    return res.status(400).json({ error: '用户名至少3个字符' });
  }

  if (username.length > 50) {
    return res.status(400).json({ error: '用户名最多50个字符' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: '密码至少6个字符' });
  }

  if (password.length > 100) {
    return res.status(400).json({ error: '密码最多100个字符' });
  }

  if (displayName && displayName.length > 100) {
    return res.status(400).json({ error: '昵称最多100个字符' });
  }

  if (bio && bio.length > 500) {
    return res.status(400).json({ error: '个人简介最多500个字符' });
  }

  const db = getDB();
  const now = new Date().toISOString();

  // 检查用户名是否已存在
  const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existingUser) {
    return res.status(409).json({ error: '用户名已被使用' });
  }

  const userId = uuidv4();
  const passwordHash = bcrypt.hashSync(password, 10);
  const userBio = bio || '';
  const userTopicTags = JSON.stringify(topicTags || []);

  db.prepare(`
    INSERT INTO users (id, username, password_hash, display_name, bio, avatar, topic_tags, created_at, updated_at, last_active_at)
    VALUES (?, ?, ?, ?, ?, '', ?, ?, ?, ?)
  `).run(userId, username, passwordHash, displayName || username, userBio, userTopicTags, now, now, now);

  const token = generateToken(userId);

  res.status(201).json({
    message: '注册成功',
    token,
    user: {
      id: userId,
      username,
      displayName: displayName || username,
      bio: userBio,
      avatar: '',
      topicTags: topicTags || [],
      createdAt: now,
    },
  });
});

// 登录
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }

  const db = getDB();
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

  if (!user) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  const isValidPassword = bcrypt.compareSync(password, user.password_hash);
  if (!isValidPassword) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  const now = new Date().toISOString();
  db.prepare('UPDATE users SET last_active_at = ? WHERE id = ?').run(now, user.id);

  const token = generateToken(user.id);

  res.json({
    message: '登录成功',
    token,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      bio: user.bio,
      avatar: user.avatar,
      topicTags: JSON.parse(user.topic_tags || '[]'),
      createdAt: user.created_at,
    },
  });
});

// 获取当前用户信息
router.get('/me', authMiddleware, (req, res) => {
  const db = getDB();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);

  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }

  res.json({
    id: user.id,
    username: user.username,
    displayName: user.display_name,
    bio: user.bio,
    avatar: user.avatar,
    topicTags: JSON.parse(user.topic_tags || '[]'),
    createdAt: user.created_at,
    lastActiveAt: user.last_active_at,
  });
});

// 更新当前用户信息
router.put('/me', authMiddleware, (req, res) => {
  const { displayName, bio, avatar, topicTags } = req.body;
  const db = getDB();
  const now = new Date().toISOString();

  const updates = [];
  const values = [];

  if (displayName !== undefined) {
    updates.push('display_name = ?');
    values.push(displayName);
  }
  if (bio !== undefined) {
    updates.push('bio = ?');
    values.push(bio);
  }
  if (avatar !== undefined) {
    updates.push('avatar = ?');
    values.push(avatar);
  }
  if (topicTags !== undefined) {
    updates.push('topic_tags = ?');
    values.push(JSON.stringify(topicTags));
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: '没有提供要更新的字段' });
  }

  updates.push('updated_at = ?');
  values.push(now, req.userId);

  db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);

  res.json({
    message: '更新成功',
    user: {
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      bio: user.bio,
      avatar: user.avatar,
      topicTags: JSON.parse(user.topic_tags || '[]'),
    },
  });
});

export default router;
