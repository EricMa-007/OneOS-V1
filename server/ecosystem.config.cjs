/**
 * OneOS 服务器 PM2 进程守护配置
 * 
 * 使用方法：
 *   npm install -g pm2
 *   pm2 start ecosystem.config.js
 *   pm2 save                    # 保存进程列表，开机自启
 *   pm2 startup                 # 设置开机自启
 *   pm2 logs oneos-server       # 查看日志
 *   pm2 monit                   # 监控面板
 *   pm2 restart oneos-server    # 重启
 *   pm2 stop oneos-server       # 停止
 */

module.exports = {
  apps: [
    {
      name: 'oneos-server',
      script: './src/index.js',
      cwd: __dirname,
      
      // 环境变量
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        JWT_SECRET: process.env.JWT_SECRET || 'oneos-slow-connection-secret-key-2026-production',
      },
      
      // 实例配置
      instances: 1,
      exec_mode: 'fork',
      
      // 自动重启
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      
      // 内存限制（超过自动重启）
      max_memory_restart: '500M',
      
      // 日志配置
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      
      // 监听文件变化重启（开发用，生产关闭）
      watch: false,
      
      // 优雅退出
      kill_timeout: 5000,
      listen_timeout: 10000,
      
      // 错误时不立即重启（避免崩溃循环）
      min_uptime: '10s',
    },
  ],
};
