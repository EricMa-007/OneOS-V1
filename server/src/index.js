/**
 * OneOS 服务器端入口
 * 
 * 架构定位：
 * - 慢连接社交基础设施：用户账户、好友关系、消息中转、极小圈子
 * - 不做实时推送：客户端主动拉取，零打扰
 * - 用户主权：数据可导出、可删除
 * - 本地优先：个人知识数据在客户端，服务器只存社交公开数据
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './models/database.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import messageRoutes from './routes/messages.js';
import circleRoutes from './routes/circles.js';
import qrcodeRoutes from './routes/qrcode.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://192.168.1.192:5173', 'https://women-general-hundred-hood.trycloudflare.com', 'https://processing-capabilities-soviet-schedules.trycloudflare.com'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 请求日志
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'OneOS Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    philosophy: '慢连接社交 · 零打扰 · 用户主权',
  });
});

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/circles', circleRoutes);
app.use('/api/qrcode', qrcodeRoutes);

// 静态文件托管（前端构建产物）
const distPath = path.resolve(__dirname, '../../dist');
app.use(express.static(distPath));

// 前端路由支持：所有非API路径返回index.html
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// 404处理（仅API路径）
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: '接口不存在', path: req.originalUrl });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    error: '服务器内部错误',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// 初始化数据库并启动服务器
initDatabase();

app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║          OneOS 服务器已启动                        ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║  本地地址:  http://localhost:${PORT}                   ║`);
  console.log(`║  局域网:    http://192.168.1.192:${PORT}            ║`);
  console.log('║  健康检查:  /api/health                            ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log('║  哲学: 慢连接社交 · 零打扰 · 用户主权              ║');
  console.log('║  功能: 用户账户 · 好友关系 · 静默收件箱 · 极小圈子 ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
});

export default app;
