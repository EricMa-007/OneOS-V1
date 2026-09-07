/**
 * 极小圈子路由
 * 最多10人，话题驱动，无消息流，所有讨论自动沉淀为共享文档
 * 每人最多3个圈子——少即是多
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDB } from '../models/database.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js';

const MAX_CIRCLE_MEMBERS = 10;
const MAX_USER_CIRCLES = 3;

const router = express.Router();

// 创建圈子
router.post('/', authMiddleware, (req, res) => {
  const { name, description, topic, isPrivate = false } = req.body;

  if (!name || !topic) {
    return res.status(400).json({ error: '圈子名称和话题不能为空' });
  }

  const db = getDB();
  const now = new Date().toISOString();

  // 检查用户加入的圈子数量
  const userCircleCount = db.prepare(
    'SELECT COUNT(*) as count FROM circle_members WHERE user_id = ?'
  ).get(req.userId).count;

  if (userCircleCount >= MAX_USER_CIRCLES) {
    return res.status(403).json({ error: `每人最多加入${MAX_USER_CIRCLES}个圈子` });
  }

  const circleId = uuidv4();
  db.prepare(`
    INSERT INTO circles (id, name, description, topic, owner_id, max_members, is_private, created_at, updated_at, last_activity_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(circleId, name, description || '', topic, req.userId, MAX_CIRCLE_MEMBERS, isPrivate ? 1 : 0, now, now, now);

  // 创建者自动加入圈子
  const memberId = uuidv4();
  db.prepare(`
    INSERT INTO circle_members (id, circle_id, user_id, role, joined_at, last_active_at)
    VALUES (?, ?, ?, 'owner', ?, ?)
  `).run(memberId, circleId, req.userId, now, now);

  res.status(201).json({
    message: '圈子创建成功',
    circle: {
      id: circleId,
      name,
      description: description || '',
      topic,
      ownerId: req.userId,
      maxMembers: MAX_CIRCLE_MEMBERS,
      memberCount: 1,
      isPrivate,
      createdAt: now,
    },
  });
});

// 获取圈子列表（公开圈子 + 我加入的圈子）
router.get('/', optionalAuthMiddleware, (req, res) => {
  const { topic, limit = 20, offset = 0 } = req.query;
  const db = getDB();

  let query = `
    SELECT c.*, 
           (SELECT COUNT(*) FROM circle_members cm WHERE cm.circle_id = c.id) as member_count
    FROM circles c
    WHERE c.is_private = 0
  `;
  const params = [];

  if (topic) {
    query += ' AND c.topic LIKE ?';
    params.push(`%${topic}%`);
  }

  // 如果已登录，也包含我加入的私有圈子
  if (req.userId) {
    query += ` OR c.id IN (SELECT circle_id FROM circle_members WHERE user_id = ?)`;
    params.push(req.userId);
  }

  query += ' ORDER BY c.last_activity_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  const circles = db.prepare(query).all(...params);

  res.json({
    circles: circles.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      topic: c.topic,
      ownerId: c.owner_id,
      maxMembers: c.max_members,
      memberCount: c.member_count,
      isPrivate: c.is_private === 1,
      createdAt: c.created_at,
      lastActivityAt: c.last_activity_at,
    })),
    total: circles.length,
  });
});

// 获取我加入的圈子
router.get('/me/mine', authMiddleware, (req, res) => {
  const db = getDB();

  const circles = db.prepare(`
    SELECT c.*, cm.role, cm.joined_at,
           (SELECT COUNT(*) FROM circle_members cm2 WHERE cm2.circle_id = c.id) as member_count
    FROM circles c
    JOIN circle_members cm ON cm.circle_id = c.id
    WHERE cm.user_id = ?
    ORDER BY cm.joined_at DESC
  `).all(req.userId);

  res.json({
    circles: circles.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      topic: c.topic,
      ownerId: c.owner_id,
      maxMembers: c.max_members,
      memberCount: c.member_count,
      myRole: c.role,
      joinedAt: c.joined_at,
      isPrivate: c.is_private === 1,
    })),
    total: circles.length,
  });
});

// 获取圈子详情
router.get('/:circleId', optionalAuthMiddleware, (req, res) => {
  const { circleId } = req.params;
  const db = getDB();

  const circle = db.prepare(`
    SELECT c.*, 
           (SELECT COUNT(*) FROM circle_members cm WHERE cm.circle_id = c.id) as member_count
    FROM circles c WHERE c.id = ?
  `).get(circleId);

  if (!circle) {
    return res.status(404).json({ error: '圈子不存在' });
  }

  // 检查是否是成员
  let isMember = false;
  let myRole = null;
  if (req.userId) {
    const membership = db.prepare('SELECT role FROM circle_members WHERE circle_id = ? AND user_id = ?').get(circleId, req.userId);
    if (membership) {
      isMember = true;
      myRole = membership.role;
    }
  }

  // 私有圈子只有成员能看详情
  if (circle.is_private === 1 && !isMember) {
    return res.status(403).json({ error: '这是私有圈子，只有成员能查看' });
  }

  // 获取成员列表
  const members = db.prepare(`
    SELECT u.id, u.username, u.display_name, u.avatar, u.bio, cm.role, cm.joined_at
    FROM circle_members cm
    JOIN users u ON u.id = cm.user_id
    WHERE cm.circle_id = ?
    ORDER BY cm.joined_at ASC
  `).all(circleId);

  res.json({
    circle: {
      id: circle.id,
      name: circle.name,
      description: circle.description,
      topic: circle.topic,
      ownerId: circle.owner_id,
      maxMembers: circle.max_members,
      memberCount: circle.member_count,
      isPrivate: circle.is_private === 1,
      createdAt: circle.created_at,
      lastActivityAt: circle.last_activity_at,
    },
    isMember,
    myRole,
    members: members.map(m => ({
      id: m.id,
      username: m.username,
      displayName: m.display_name,
      avatar: m.avatar,
      bio: m.bio,
      role: m.role,
      joinedAt: m.joined_at,
    })),
  });
});

// 加入圈子
router.post('/:circleId/join', authMiddleware, (req, res) => {
  const { circleId } = req.params;
  const db = getDB();
  const now = new Date().toISOString();

  const circle = db.prepare('SELECT * FROM circles WHERE id = ?').get(circleId);
  if (!circle) {
    return res.status(404).json({ error: '圈子不存在' });
  }

  // 检查是否已是成员
  const existingMember = db.prepare('SELECT id FROM circle_members WHERE circle_id = ? AND user_id = ?').get(circleId, req.userId);
  if (existingMember) {
    return res.status(409).json({ error: '已经是圈子成员了' });
  }

  // 检查成员数量
  const memberCount = db.prepare('SELECT COUNT(*) as count FROM circle_members WHERE circle_id = ?').get(circleId).count;
  if (memberCount >= circle.max_members) {
    return res.status(403).json({ error: '圈子成员已满' });
  }

  // 检查用户加入的圈子数量
  const userCircleCount = db.prepare('SELECT COUNT(*) as count FROM circle_members WHERE user_id = ?').get(req.userId).count;
  if (userCircleCount >= MAX_USER_CIRCLES) {
    return res.status(403).json({ error: `每人最多加入${MAX_USER_CIRCLES}个圈子` });
  }

  const memberId = uuidv4();
  db.prepare(`
    INSERT INTO circle_members (id, circle_id, user_id, role, joined_at, last_active_at)
    VALUES (?, ?, ?, 'member', ?, ?)
  `).run(memberId, circleId, req.userId, now, now);

  // 更新圈子最后活动时间
  db.prepare('UPDATE circles SET last_activity_at = ? WHERE id = ?').run(now, circleId);

  res.json({ message: '已加入圈子' });
});

// 退出圈子
router.post('/:circleId/leave', authMiddleware, (req, res) => {
  const { circleId } = req.params;
  const db = getDB();

  const membership = db.prepare('SELECT role FROM circle_members WHERE circle_id = ? AND user_id = ?').get(circleId, req.userId);
  if (!membership) {
    return res.status(404).json({ error: '你不是圈子成员' });
  }

  if (membership.role === 'owner') {
    return res.status(403).json({ error: '圈主不能退出圈子，请先转让圈主或解散圈子' });
  }

  db.prepare('DELETE FROM circle_members WHERE circle_id = ? AND user_id = ?').run(circleId, req.userId);

  res.json({ message: '已退出圈子' });
});

// 获取圈子共享文档列表（讨论自动沉淀为知识）
router.get('/:circleId/documents', authMiddleware, (req, res) => {
  const { circleId } = req.params;
  const db = getDB();

  // 检查是否是成员
  const membership = db.prepare('SELECT id FROM circle_members WHERE circle_id = ? AND user_id = ?').get(circleId, req.userId);
  if (!membership) {
    return res.status(403).json({ error: '只有圈子成员能查看文档' });
  }

  const documents = db.prepare(`
    SELECT d.*, u.username, u.display_name, u.avatar
    FROM circle_documents d
    JOIN users u ON u.id = d.author_id
    WHERE d.circle_id = ?
    ORDER BY d.is_pinned DESC, d.updated_at DESC
  `).all(circleId);

  res.json({
    documents: documents.map(d => ({
      id: d.id,
      title: d.title,
      content: d.content,
      contentType: d.content_type,
      isPinned: d.is_pinned === 1,
      author: {
        id: d.author_id,
        username: d.username,
        displayName: d.display_name,
        avatar: d.avatar,
      },
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    })),
    total: documents.length,
  });
});

// 创建圈子共享文档（讨论自动沉淀为知识）
router.post('/:circleId/documents', authMiddleware, (req, res) => {
  const { circleId } = req.params;
  const { title, content, contentType = 'markdown' } = req.body;
  const db = getDB();
  const now = new Date().toISOString();

  if (!title) {
    return res.status(400).json({ error: '文档标题不能为空' });
  }

  // 检查是否是成员
  const membership = db.prepare('SELECT id FROM circle_members WHERE circle_id = ? AND user_id = ?').get(circleId, req.userId);
  if (!membership) {
    return res.status(403).json({ error: '只有圈子成员能创建文档' });
  }

  const documentId = uuidv4();
  db.prepare(`
    INSERT INTO circle_documents (id, circle_id, author_id, title, content, content_type, is_pinned, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)
  `).run(documentId, circleId, req.userId, title, content || '', contentType, now, now);

  // 更新圈子最后活动时间
  db.prepare('UPDATE circles SET last_activity_at = ? WHERE id = ?').run(now, circleId);

  res.status(201).json({
    message: '文档创建成功（讨论已沉淀为知识）',
    documentId,
  });
});

export default router;
