# OneOS V1 · 个人知识操作系统

> 每个人的第二大脑和数字生存操作系统

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF)](https://vitejs.dev/)
[![Zustand](https://img.shields.io/badge/Zustand-4.5-orange)](https://github.com/pmndrs/zustand)
[![License](https://img.shields.io/badge/License-MIT-green)](#许可证)

---

## 项目简介

OneOS 是一个面向个人的知识操作系统，旨在整合笔记、日程、知识图谱、AI 助手、社交等功能，为用户提供一个统一的数字生存空间。

### 核心理念

- **第二大脑**：所有知识、想法、日程集中管理，形成个人知识网络
- **数字生存**：不只是工具，而是一个完整的个人操作系统
- **AI 原生**：深度集成 AI 能力，让知识管理更智能
- **本地优先**：数据存储在本地，隐私安全可控

### 目标用户

- 知识工作者、研究者、学生
- 需要管理大量笔记和想法的人
- 追求高效知识管理的极客用户
- 对隐私和数据安全有要求的用户

---

## 功能特性

### 核心模块

| 模块 | 功能 | 状态 |
|------|------|------|
| 📊 仪表盘 | 数据概览、今日任务、统计图表 | ✅ 已完成 |
| 📝 笔记 | 笔记列表、标签、分类 | ✅ 已完成 |
| ✍️ 编辑器 | Markdown 编辑器、所见即所得、反向链接 | ✅ 已完成 |
| 🕸️ 知识图谱 | 节点关系图、社区发现、中心性分析 | ✅ 已完成 |
| 📅 日历 | 日程管理、事件提醒 | ✅ 已完成 |
| 🤖 AI 助手 | 流式对话、人设系统、RAG 知识库检索 | ✅ 已完成 |
| 👥 社交 | 动态、消息、联系人 | ✅ 已完成 |
| 🎤 语音 | 语音输入、录音 | ✅ 已完成 |
| 🔍 全局搜索 | 全文搜索、模糊搜索、相关度评分 | ✅ 已完成 |
| 📚 知识库 | 知识分类、标签、关联、导入导出 | ✅ 已完成 |
| ⚙️ 设置 | 个性化配置、性能监控 | ✅ 已完成 |

### 技术亮点

- **6 大内核引擎**：图算法、搜索算法、RAG 服务、数据可视化、知识库服务、性能监控
- **路由级代码分割**：主包仅 73KB，按需加载
- **DDD 架构**：领域驱动设计，模块解耦
- **IndexedDB 持久化**：本地数据存储，支持离线使用
- **响应式设计**：桌面端 + 移动端完美适配
- **设计系统 V3**：统一的颜色、字体、间距、圆角规范

---

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0 或 pnpm >= 8.0.0

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
# 启动开发服务器（本地访问）
npm run dev

# 启动开发服务器（局域网访问，支持手机测试）
npm run dev:host
```

访问地址：
- 电脑端：http://localhost:5173
- 局域网：http://<你的IP>:5173

### 构建生产版本

```bash
npm run build
```

构建产物在 `dist/` 目录。

### 预览生产版本

```bash
npm run preview
```

### 代码检查

```bash
# TypeScript 类型检查
npm run type-check

# ESLint 检查
npm run lint

# 运行测试
npm run test
```

---

## 项目结构

```
OneOS-V1/
├── src/
│   ├── components/          # UI 组件
│   │   ├── layout/         # 布局组件（AppLayout、Sidebar、Topbar、BottomNav）
│   │   └── ui/             # 基础UI组件（Button、Card、Modal、Toast、ErrorBoundary）
│   ├── pages/              # 页面组件（12个核心页面）
│   ├── stores/             # Zustand 状态管理（9个Store）
│   ├── domain/             # 领域层（模型、仓库接口、服务）
│   ├── infrastructure/     # 基础设施层（IndexedDB实现、外部服务）
│   ├── modules/            # 业务模块（AI、社交等）
│   ├── shared/             # 共享代码
│   │   └── kernel/         # 6大内核引擎
│   ├── styles/             # 全局样式、设计令牌
│   ├── types/              # TypeScript 类型定义
│   └── utils/              # 工具函数
├── public/                 # 静态资源
├── docs/                   # 项目文档
├── tests/                  # 测试文件
├── Agent/                  # Agent 团队系统（12个专业Agent）
├── index.html              # 入口HTML
├── package.json            # 项目配置
├── tsconfig.json           # TypeScript配置
└── vite.config.ts          # Vite配置
```

---

## 技术栈

### 前端框架

- **React 18.2** - UI 库
- **TypeScript 5.0** - 类型安全
- **Vite 5.0** - 构建工具
- **Zustand 4.5** - 状态管理
- **React Router** - 路由管理（内部实现）

### 样式与设计

- **CSS Variables** - 设计令牌系统
- **设计系统 V3** - 统一的视觉规范
- **响应式设计** - 移动端 + 桌面端适配

### 数据存储

- **IndexedDB** - 本地数据持久化
- **localStorage** - 配置存储

### 核心库

- **marked** - Markdown 渲染
- **DOMPurify** - XSS 防护
- **d3-force** - 知识图谱力导向布局

### 开发工具

- **ESLint** - 代码规范
- **Prettier** - 代码格式化
- **Husky** - Git 钩子
- **Vitest** - 单元测试

---

## Agent 团队系统

OneOS 项目内置了 12 个专业 Agent，组成完整的开发团队：

| 编号 | 名字 | 角色 | 职责 |
|------|------|------|------|
| A00 | 尼奥 | CEO | 项目总协调、任务调度 |
| A01 | 崔尼蒂 | 架构师 | 架构设计、技术选型 |
| A02 | 墨菲斯 | 全栈工程师 | 核心功能开发 |
| A03 | 多泽 | 数据工程师 | 数据模型、存储设计 |
| A04 | 坦克 | 测试工程师 | 测试、质量保障 |
| A05 | 娜奥米 | UI/UX 设计师 | 界面设计、用户体验 |
| A06 | 林克 | DevOps 工程师 | CI/CD、部署运维 |
| A07 | 梅罗文加 | 算法工程师 | 算法设计、性能优化 |
| A08 | 鬼 | 安全工程师 | 安全审计、漏洞修复 |
| A09 | 珀耳塞福涅 | AI 工程师 | AI 功能、模型集成 |
| A10 | 塞拉芬 | 产品经理 | 需求分析、产品规划 |
| A11 | 史密斯 | 文档工程师 | 文档编写、知识管理 |

Agent 定义文件位于 `Agent/` 目录，每个 Agent 包含身份信息、上下文、工作流和权限边界。

---

## 文档

### 开发文档

- [产品需求文档](docs/01-产品需求文档.md)
- [架构设计文档](docs/02-架构设计文档.md)
- [API 文档](docs/03-API文档.md)
- [开发指南](docs/04-开发指南.md)

### 阶段报告

- [P8 全量测试验收报告](docs/P8-全量测试验收报告.md)
- [多维度深度审查报告](docs/19-多维度深度审查报告.md)
- [目录结构自检报告](docs/18-目录结构自检报告.md)

### 设计文档

- [设计系统 V3](docs/设计系统V3.md)
- [移动端适配方案](docs/移动端适配方案.md)

---

## 常见问题

### Q: 数据存储在哪里？

A: 所有数据存储在浏览器的 IndexedDB 中，完全本地存储，不上传任何服务器。可以在设置中导出数据备份。

### Q: 支持移动端吗？

A: 支持。应用采用响应式设计，在手机浏览器中访问会自动切换为移动端布局，包含底部导航栏。

### Q: AI 功能需要 API Key 吗？

A: 目前 AI 功能支持配置自定义 API Key，在设置页面中配置。也可以使用本地模型（如果已部署）。

### Q: 如何导出我的数据？

A: 在设置页面中找到"数据管理"，可以导出为 JSON 格式的备份文件，包含所有笔记、日程、配置等数据。

### Q: 开发服务器启动失败怎么办？

A: 
1. 确认 Node.js 版本 >= 18.0.0
2. 删除 `node_modules` 和 `package-lock.json`，重新运行 `npm install`
3. 检查端口 5173 是否被占用：`netstat -ano | findstr 5173`

---

## 贡献指南

欢迎贡献代码！请阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 了解开发流程和代码规范。

### 开发流程

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/your-feature`
3. 提交更改：`git commit -m 'Add some feature'`
4. 推送到分支：`git push origin feature/your-feature`
5. 提交 Pull Request

### 代码规范

- 使用 TypeScript，避免 `any` 类型
- 组件文件不超过 300 行，超过则拆分
- 遵循设计系统 V3 的颜色、间距、圆角规范
- 提交前运行 `npm run lint` 和 `npm run type-check`

---

## 路线图

### 已完成（V1.0）

- ✅ 12 个核心模块
- ✅ 6 大内核引擎
- ✅ AI 流式对话 + RAG 检索
- ✅ 知识图谱算法分析
- ✅ 响应式设计（桌面 + 移动）
- ✅ IndexedDB 数据持久化
- ✅ 路由级代码分割
- ✅ Agent 团队系统

### 计划中（V1.5）

- 🔄 数据同步（多设备）
- 🔄 插件系统
- 🔄 快捷键支持
- 🔄 深色模式
- 🔄 多语言支持
- 🔄 PWA 离线应用
- 🔄 数据加密

### 未来（V2.0）

- 📋 协作功能
- 📋 移动端原生应用
- 📋 桌面端应用
- 📋 AI Agent 自动化
- 📋 开放 API

---

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件。

---

## 致谢

感谢所有为 OneOS 项目做出贡献的开发者和用户。

特别感谢：
- React 团队提供优秀的 UI 库
- Vite 团队提供极速的构建工具
- Zustand 团队提供简洁的状态管理
- 所有开源社区的贡献者

---

## 联系方式

- 项目地址：[GitHub Repository]
- 问题反馈：[Issues]
- 讨论交流：[Discussions]

---

**OneOS - 让知识管理更简单，让数字生存更自由。**
