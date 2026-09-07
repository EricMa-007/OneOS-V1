/**
 * OneOS 数据库自动备份脚本
 * 
 * 功能：
 * - 备份 SQLite 数据库
 * - 自动清理过期备份
 * - 记录备份日志
 * 
 * 使用方法：
 *   node scripts/backup.js                  # 手动执行一次备份
 *   node scripts/backup.js --schedule       # 持续运行，每日定时备份
 * 
 * 配合 PM2 使用：
 *   pm2 start scripts/backup.js --name oneos-backup -- --schedule
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '..', 'data', 'oneos.db');
const BACKUP_DIR = path.join(__dirname, '..', 'backups');
const LOG_DIR = path.join(__dirname, '..', 'logs');
const RETENTION_DAYS = 30;

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  
  ensureDir(LOG_DIR);
  const logFile = path.join(LOG_DIR, 'backup.log');
  fs.appendFileSync(logFile, logMessage + '\n');
}

function backupDatabase() {
  ensureDir(BACKUP_DIR);
  
  if (!fs.existsSync(DB_PATH)) {
    log('ERROR: 数据库文件不存在: ' + DB_PATH);
    return false;
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `oneos-backup-${timestamp}.db`;
  const backupPath = path.join(BACKUP_DIR, backupFileName);
  
  try {
    // 复制数据库文件（SQLite支持热备份）
    fs.copyFileSync(DB_PATH, backupPath);
    
    const stats = fs.statSync(backupPath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    log(`✅ 备份成功: ${backupFileName} (${sizeMB} MB)`);
    
    // 清理过期备份
    cleanupOldBackups();
    
    return true;
  } catch (error) {
    log(`❌ 备份失败: ${error.message}`);
    return false;
  }
}

function cleanupOldBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR);
    const now = Date.now();
    const cutoff = now - RETENTION_DAYS * 24 * 60 * 60 * 1000;
    let deletedCount = 0;
    
    for (const file of files) {
      if (!file.startsWith('oneos-backup-') || !file.endsWith('.db')) continue;
      
      const filePath = path.join(BACKUP_DIR, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtimeMs < cutoff) {
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    }
    
    if (deletedCount > 0) {
      log(`🧹 清理过期备份: 删除 ${deletedCount} 个文件（保留 ${RETENTION_DAYS} 天）`);
    }
  } catch (error) {
    log(`❌ 清理过期备份失败: ${error.message}`);
  }
}

function getNextBackupTime() {
  const now = new Date();
  const next = new Date(now);
  next.setHours(3, 0, 0, 0); // 每天凌晨3点备份
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  return next;
}

function scheduleBackup() {
  const nextTime = getNextBackupTime();
  const delay = nextTime - new Date();
  
  log(`⏰ 下次备份时间: ${nextTime.toLocaleString('zh-CN')} (${Math.round(delay / 1000 / 60)} 分钟后)`);
  
  setTimeout(() => {
    backupDatabase();
    scheduleBackup(); // 递归调度下一次
  }, delay);
}

// 主程序
const args = process.argv.slice(2);

if (args.includes('--schedule')) {
  log('🚀 OneOS 数据库备份服务启动（定时模式）');
  log(`📁 数据库路径: ${DB_PATH}`);
  log(`📦 备份目录: ${BACKUP_DIR}`);
  log(`📅 保留天数: ${RETENTION_DAYS} 天`);
  
  // 启动时先备份一次
  backupDatabase();
  
  // 然后定时备份
  scheduleBackup();
} else {
  // 手动执行一次
  log('🔄 执行手动备份...');
  const success = backupDatabase();
  process.exit(success ? 0 : 1);
}
