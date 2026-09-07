# OneOS CI/CD 流水线设计文档

**文档编号**：DOC-INFRA-001
**版本**：V1.0
**日期**：2026-08-29
**作者**：A06 林克（运维主管）
**审核**：A00 尼奥（CEO）、A01 崔尼蒂（首席架构师）
**状态**：已批准

---

## 1. 概述

### 1.1 设计目标

OneOS CI/CD 流水线的设计目标是：

1. **自动化**：代码提交后自动完成检查、测试、构建、部署，减少人工干预
2. **质量保障**：在代码合并前强制执行代码检查、测试、安全扫描，确保质量
3. **快速反馈**：开发者在提交后几分钟内获得反馈，快速定位和修复问题
4. **可追溯**：每次构建、部署都有完整记录，可追溯到具体提交和开发者
5. **可扩展**：流水线设计支持未来增加更多检查项、测试类型、部署环境

### 1.2 设计原则

| 原则 | 说明 |
|------|------|
| **左移** | 尽可能早地发现问题，在开发阶段而非部署阶段 |
| **快速** | PR检查流水线控制在5分钟内完成 |
| **可靠** | 流水线本身稳定，不出现误报和随机失败 |
| **透明** | 所有检查结果公开透明，开发者可查看详细日志 |
| **安全** | 敏感信息（密钥、令牌）通过GitHub Secrets管理，不硬编码 |

### 1.3 技术选型

| 组件 | 选型 | 理由 |
|------|------|------|
| CI/CD平台 | GitHub Actions | 免费开源、与Git深度集成、生态成熟 |
| 代码检查 | ESLint + Prettier | 行业标准、可定制性强、与IDE集成好 |
| 提交规范 | Commitlint + Husky | 标准化提交信息、自动生成变更日志 |
| 单元测试 | Vitest | Vite原生支持、速度快、兼容Jest API |
| E2E测试 | Cypress | 易用性好、调试方便、社区活跃 |
| 构建工具 | Vite | 速度快、配置简单、HMR体验好 |
| 制品管理 | GitHub Artifacts + Release | 与GitHub集成、免费、版本管理方便 |

---

## 2. 流水线架构

### 2.1 三条核心流水线

OneOS CI/CD 包含三条核心流水线：

```
┌─────────────────────────────────────────────────────────────┐
│                        代码生命周期                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  开发者提交代码                                                │
│       │                                                       │
│       ▼                                                       │
│  ┌─────────────┐    PR合并    ┌─────────────┐   打Tag    ┌─────────────┐
│  │  PR检查流水线 │ ──────────▶ │ 主分支流水线  │ ─────────▶ │  发布流水线   │
│  │   (ci.yml)  │             │  (main.yml) │            │ (release.yml)│
│  └─────────────┘             └─────────────┘            └─────────────┘
│       │                            │                            │
│       ▼                            ▼                            ▼
│  • 代码质量检查               • 全量测试                   • 版本验证
│  • 单元测试                  • 生产构建                    • 发布构建
│  • 构建验证                  • 部署预览                    • 变更日志
│  • 安全检查                  • 性能基准                    • 创建Release
│  • PR总结评论                • 构建通知                    • 部署生产
│                                                         • 发布通知
└─────────────────────────────────────────────────────────────┘
```

### 2.2 流水线触发条件

| 流水线 | 触发条件 | 分支 | 目的 |
|--------|----------|------|------|
| PR检查流水线 | pull_request (opened, synchronize, reopened) | main, develop | 代码合并前的质量门禁 |
| 主分支流水线 | push | main, develop | 合并后的全量验证和预览部署 |
| 发布流水线 | push tag (v*) | - | 版本发布和生产部署 |

### 2.3 并发控制

- **PR检查流水线**：同一分支的多个PR只运行最新的（cancel-in-progress: true）
- **主分支流水线**：按顺序执行，不取消（cancel-in-progress: false），确保每次合并都完整验证
- **发布流水线**：串行执行，避免并发发布冲突

---

## 3. PR检查流水线详解

### 3.1 流水线结构

PR检查流水线包含5个Job，按依赖关系执行：

```
lint (代码质量检查)
  ├── test (单元测试)
  │     └── build (构建验证)
  └── security (安全检查)
  
summary (PR总结评论) ← 依赖所有Job
```

### 3.2 Job详解

#### Job 1: 代码质量检查（lint）

| 项目 | 内容 |
|------|------|
| **执行步骤** | 1. 检出代码 2. 设置Node.js 3. 安装依赖 4. ESLint检查 5. Prettier格式检查 6. 提交信息规范检查 7. 上传检查报告 |
| **通过标准** | ESLint 0 error，Prettier 0 未格式化文件 |
| **超时时间** | 5分钟 |
| **缓存策略** | npm依赖缓存（~/.npm） |

**检查项明细**：

| 检查工具 | 检查范围 | 严重程度 |
|----------|----------|----------|
| ESLint | src/, components/ 下所有 .js/.jsx | error级别阻断，warn级别警告 |
| Prettier | 所有 .js/.jsx/.css/.json/.md | 未格式化则失败 |
| Commitlint | 最近一次提交信息 | 不符合规范则警告（不阻断） |

#### Job 2: 单元测试（test）

| 项目 | 内容 |
|------|------|
| **依赖** | lint通过后执行 |
| **执行步骤** | 1. 检出代码 2. 设置Node.js 3. 安装依赖 4. 运行单元测试 5. 上传覆盖率报告 6. 检查覆盖率阈值 |
| **通过标准** | 所有测试通过，覆盖率达到阈值（V1.1.0目标60%） |
| **超时时间** | 10分钟 |

**覆盖率阈值**（V1.1.0阶段）：

| 指标 | 阈值 | 说明 |
|------|------|------|
| 语句覆盖率 | ≥60% | 核心模块≥80% |
| 分支覆盖率 | ≥50% | 核心模块≥70% |
| 函数覆盖率 | ≥60% | 核心模块≥80% |
| 行覆盖率 | ≥60% | 核心模块≥80% |

#### Job 3: 构建验证（build）

| 项目 | 内容 |
|------|------|
| **依赖** | test通过后执行 |
| **执行步骤** | 1. 检出代码 2. 设置Node.js 3. 安装依赖 4. 生产构建 5. 验证构建产物 6. 上传构建产物 |
| **通过标准** | 构建成功，构建产物完整（index.html, mobile.html, assets/） |
| **超时时间** | 10分钟 |

#### Job 4: 安全检查（security）

| 项目 | 内容 |
|------|------|
| **依赖** | lint通过后执行（与test并行） |
| **执行步骤** | 1. 检出代码 2. 设置Node.js 3. 安装依赖 4. npm依赖漏洞扫描 5. 代码安全扫描 6. 敏感信息泄露检查 |
| **通过标准** | 无高危漏洞，无硬编码敏感信息 |
| **超时时间** | 10分钟 |
| **阻断策略** | 高危漏洞阻断，中低危警告 |

**安全检查项**：

| 检查类型 | 工具 | 检查内容 |
|----------|------|----------|
| 依赖漏洞 | npm audit | 第三方依赖的已知漏洞 |
| 代码安全 | njsscan | XSS、注入、硬编码密钥等安全问题 |
| 敏感信息 | 自定义脚本 | 密码、密钥、令牌、API Key等硬编码 |

#### Job 5: PR总结评论（summary）

| 项目 | 内容 |
|------|------|
| **依赖** | 所有Job完成后执行（always） |
| **执行步骤** | 1. 收集所有Job结果 2. 生成总结评论 3. 发布到PR |
| **输出** | PR评论，包含各检查项状态、通过/失败总结 |

---

## 4. 主分支流水线详解

### 4.1 流水线结构

主分支流水线包含5个Job：

```
full-test (全量测试)
  └── production-build (生产构建)
        ├── deploy-preview (部署预览) [仅develop分支]
        └── performance-benchmark (性能基准)
        
notify (构建通知) ← 依赖所有Job
```

### 4.2 Job详解

#### Job 1: 全量测试（full-test）

与PR检查的test Job类似，但增加：
- 集成测试（test:integration）
- 完整覆盖率报告生成
- 覆盖率报告保留30天

#### Job 2: 生产构建（production-build）

与PR检查的build Job类似，但增加：
- 注入构建信息（版本号、构建哈希、构建时间）
- 构建产物分析（bundle大小、依赖分析）
- 构建产物保留90天

#### Job 3: 部署预览（deploy-preview）

| 项目 | 内容 |
|------|------|
| **触发条件** | 仅develop分支 |
| **执行步骤** | 1. 下载构建产物 2. 部署到预览环境 3. 健康检查 |
| **环境** | preview环境，URL: https://preview.oneos.app/{commit-sha} |
| **保留时间** | 7天 |

#### Job 4: 性能基准测试（performance-benchmark）

| 项目 | 内容 |
|------|------|
| **执行步骤** | 1. 下载构建产物 2. 运行性能基准测试 3. 性能退化检测 4. 上传性能报告 |
| **测试内容** | 首屏加载、FCP、LCP、TTI、搜索响应、图谱渲染 |
| **退化检测** | 与上一版本基准对比，退化超过10%则警告 |

#### Job 5: 构建通知（notify）

收集所有Job结果，发送通知（飞书/钉钉/Slack/Webhook）。

---

## 5. 发布流水线详解

### 5.1 流水线结构

发布流水线包含6个Job：

```
version-verify (版本验证)
  ├── release-build (发布构建)
  │     └── create-release (创建GitHub Release)
  │           └── deploy-production (部署生产) [仅正式版]
  └── changelog (生成变更日志)
        
notify (发布通知) ← 依赖所有Job
```

### 5.2 Job详解

#### Job 1: 版本验证（version-verify）

| 项目 | 内容 |
|------|------|
| **验证内容** | 1. 版本号格式（语义化版本 x.y.z） 2. package.json版本与tag一致 3. CHANGELOG存在性 |
| **预发布版本** | 包含预发布标识（如 v1.1.0-beta.1）的tag创建预发布Release，不部署生产 |

#### Job 2: 发布构建（release-build）

| 项目 | 内容 |
|------|------|
| **构建配置** | 生产环境构建，注入版本号、构建哈希、构建时间 |
| **构建信息** | 生成 build-info.json，包含版本、哈希、时间、分支、Node版本 |
| **产物保留** | 365天 |

#### Job 3: 生成变更日志（changelog）

| 项目 | 内容 |
|------|------|
| **工具** | conventional-changelog-cli |
| **规范** | Angular Conventional Commits |
| **输出** | 更新 CHANGELOG.md，提取当前版本变更日志 |

#### Job 4: 创建GitHub Release（create-release）

| 项目 | 内容 |
|------|------|
| **Release内容** | 1. 版本号 2. 变更日志 3. 构建信息 4. 校验和（SHA256） |
| **附件** | OneOS-v{version}.zip（构建产物打包） |
| **预发布** | 包含预发布标识的tag标记为prerelease |

#### Job 5: 部署生产环境（deploy-production）

| 项目 | 内容 |
|------|------|
| **触发条件** | 仅正式版（非预发布） |
| **执行步骤** | 1. 下载构建产物 2. 部署到生产环境 3. 健康检查 4. 冒烟测试 |
| **环境** | production环境，URL: https://app.oneos.app |

#### Job 6: 发布通知（notify）

发送发布通知，包含：版本号、变更摘要、Release链接、部署状态。

---

## 6. 代码质量配置

### 6.1 ESLint 配置

ESLint配置文件：`.eslintrc.cjs`

**规则分级**：
- **error（24条）**：必须修复，否则CI失败。包括React Hooks规则、JSX关键规则、eqeqeq、no-eval、no-debugger等
- **warn（30+条）**：建议修复，CI警告。包括no-unused-vars、no-console、复杂度规则等
- **off（若干）**：关闭。包括react/prop-types（未来迁移TypeScript）、react/react-in-jsx-scope（React 17+新JSX转换）

**安全相关规则**：
- `react/no-danger`: error — 禁止dangerouslySetInnerHTML，防止XSS
- `no-eval`: error — 禁止eval
- `no-implied-eval`: error — 禁止隐式eval
- `no-script-url`: error — 禁止javascript: URL

**复杂度规则**：
- `complexity`: warn, max=20 — 函数复杂度上限
- `max-depth`: warn, max=4 — 嵌套深度上限
- `max-lines-per-function`: warn, max=100 — 函数行数上限
- `max-params`: warn, max=5 — 函数参数上限

### 6.2 Prettier 配置

Prettier配置文件：`.prettierrc`

**核心配置**：
- 缩进：2空格
- 行宽：100字符
- 引号：单引号（JSX双引号）
- 分号：有
- 尾逗号：es5
- 换行符：LF

### 6.3 Commitlint 配置

Commitlint配置文件：`commitlint.config.cjs`

**提交格式**：
```
<type>(<scope>): <subject>

<body>

<footer>
```

**type枚举**：
| type | 说明 |
|------|------|
| feat | 新功能 |
| fix | Bug修复 |
| docs | 文档更新 |
| style | 代码格式 |
| refactor | 代码重构 |
| perf | 性能优化 |
| test | 测试相关 |
| build | 构建系统 |
| ci | CI/CD配置 |
| chore | 杂项 |
| revert | 回滚 |
| wip | 进行中 |

### 6.4 Husky Git钩子

| 钩子 | 触发时机 | 执行内容 |
|------|----------|----------|
| pre-commit | git commit前 | lint-staged（对暂存文件ESLint+Prettier）+ 单元测试 |
| commit-msg | git commit时 | Commitlint验证提交信息规范 |

---

## 7. 环境与配置

### 7.1 Node.js版本

- **CI/CD环境**：Node.js 20 LTS
- **本地开发**：Node.js ≥18.0.0
- **包管理器**：npm ≥9.0.0

### 7.2 环境变量

| 变量名 | 说明 | 使用位置 | 敏感度 |
|--------|------|----------|--------|
| NODE_ENV | 运行环境（development/production/test） | 构建、测试 | 低 |
| VITE_APP_VERSION | 应用版本号 | 构建注入 | 低 |
| VITE_BUILD_HASH | 构建哈希 | 构建注入 | 低 |
| VITE_BUILD_TIME | 构建时间 | 构建注入 | 低 |
| NOTIFY_WEBHOOK | 通知Webhook地址 | 通知Job | 高（Secrets） |
| DEPLOY_TOKEN | 部署令牌 | 部署Job | 高（Secrets） |

### 7.3 缓存策略

| 缓存内容 | 缓存键 | 保留时间 |
|----------|--------|----------|
| npm依赖 | node-${{ hashFiles('**/package-lock.json') }} | 7天 |
| Cypress二进制 | cypress-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }} | 30天 |
| 构建产物 | 通过Artifacts管理 | 7-365天 |

---

## 8. 制品管理

### 8.1 GitHub Artifacts

| 制品名称 | 产生流水线 | 保留时间 | 内容 |
|----------|------------|----------|------|
| lint-report | PR检查 | 7天 | ESLint报告JSON |
| coverage-report | PR检查 | 7天 | 测试覆盖率报告 |
| build-preview | PR检查 | 7天 | 构建产物（dist/） |
| full-coverage-report | 主分支 | 30天 | 完整覆盖率报告 |
| production-build | 主分支 | 90天 | 生产构建产物 |
| build-analysis | 主分支 | 30天 | 构建分析报告 |
| performance-report | 主分支 | 90天 | 性能基准报告 |
| release-build-v{version} | 发布 | 365天 | 发布构建产物 |
| changelog-v{version} | 发布 | 365天 | 变更日志 |

### 8.2 GitHub Release

每个正式版本创建GitHub Release，包含：
- 版本号和发布说明
- 变更日志（从CHANGELOG提取）
- 构建信息（版本、哈希、时间、校验和）
- 附件：OneOS-v{version}.zip

---

## 9. 性能指标与SLA

### 9.1 流水线性能SLA

| 流水线 | 目标完成时间 | 最大完成时间 |
|--------|-------------|-------------|
| PR检查流水线 | ≤5分钟 | ≤10分钟 |
| 主分支流水线 | ≤15分钟 | ≤30分钟 |
| 发布流水线 | ≤20分钟 | ≤40分钟 |

### 9.2 各Job时间预算

| Job | 时间预算 | 说明 |
|-----|----------|------|
| lint | ≤2分钟 | 代码检查 |
| test | ≤5分钟 | 单元测试 |
| build | ≤3分钟 | 构建验证 |
| security | ≤5分钟 | 安全检查 |
| full-test | ≤8分钟 | 全量测试 |
| production-build | ≤5分钟 | 生产构建 |
| performance-benchmark | ≤10分钟 | 性能基准 |
| version-verify | ≤1分钟 | 版本验证 |
| release-build | ≤5分钟 | 发布构建 |
| create-release | ≤2分钟 | 创建Release |
| deploy-production | ≤5分钟 | 部署生产 |

---

## 10. 监控与告警

### 10.1 流水线监控

| 监控指标 | 告警阈值 | 通知方式 |
|----------|----------|----------|
| 流水线失败率 | >5%（周统计） | 飞书/钉钉通知 |
| 流水线平均时长 | 超过SLA 20% | 飞书/钉钉通知 |
| 测试通过率 | <95% | 飞书/钉钉通知 |
| 覆盖率趋势 | 连续3次下降 | 飞书/钉钉通知 |
| 构建大小增长 | >10%（版本对比） | 飞书/钉钉通知 |

### 10.2 通知机制

| 事件 | 通知对象 | 通知内容 |
|------|----------|----------|
| PR检查失败 | PR提交者 | 失败Job、错误摘要、修复建议 |
| 主分支构建失败 | 全体开发 | 失败原因、影响范围、责任人 |
| 性能退化 | 性能负责人（A09鬼） | 退化指标、退化幅度、对比基准 |
| 安全漏洞 | 安全负责人（A04赛若芙） | 漏洞等级、影响范围、修复建议 |
| 版本发布 | 全体团队 | 版本号、变更摘要、Release链接 |

---

## 11. 未来扩展规划

### 11.1 短期扩展（V1.1.0）

- [ ] E2E测试集成（Cypress）
- [ ] 性能基准自动化（Lighthouse CI）
- [ ] 测试覆盖率徽章（README展示）
- [ ] 自动发布预览环境评论（PR中展示预览链接）
- [ ] 依赖自动更新（Dependabot）

### 11.2 中期扩展（V1.2.0）

- [ ] 多浏览器兼容性测试（BrowserStack/Sauce Labs）
- [ ] 移动端真机测试（BrowserStack App Automate）
- [ ] 可视化回归测试（Chromatic/ Percy）
- [ ] 混沌工程测试（随机故障注入）
- [ ] 蓝绿部署/金丝雀发布

### 11.3 长期扩展（V2.0.0）

- [ ] 多环境部署（开发/测试/预发布/生产）
- [ ] 自动回滚机制（部署失败自动回滚）
- [ ] 特性开关（Feature Flag）集成
- [ ] A/B测试框架
- [ ] 全链路追踪（OpenTelemetry）
- [ ] 成本监控（云资源使用成本）

---

## 12. 附录

### 12.1 相关文件清单

| 文件路径 | 说明 |
|----------|------|
| `.github/workflows/ci.yml` | PR检查流水线 |
| `.github/workflows/main.yml` | 主分支流水线 |
| `.github/workflows/release.yml` | 发布流水线 |
| `.eslintrc.cjs` | ESLint配置 |
| `.prettierrc` | Prettier配置 |
| `.editorconfig` | EditorConfig配置 |
| `commitlint.config.cjs` | Commitlint配置 |
| `.husky/pre-commit` | pre-commit钩子 |
| `.husky/commit-msg` | commit-msg钩子 |
| `.gitignore` | Git忽略文件 |
| `package.json` | 项目配置（含scripts） |

### 12.2 参考资料

- [GitHub Actions 官方文档](https://docs.github.com/en/actions)
- [ESLint 官方文档](https://eslint.org/docs/)
- [Prettier 官方文档](https://prettier.io/docs/)
- [Commitlint 官方文档](https://commitlint.js.org/)
- [Husky 官方文档](https://typicode.github.io/husky/)
- [Vitest 官方文档](https://vitest.dev/)
- [Cypress 官方文档](https://docs.cypress.io/)
- [Conventional Commits 规范](https://www.conventionalcommits.org/)

### 12.3 版本历史

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|----------|------|
| V1.0 | 2026-08-29 | 初始版本，三条核心流水线设计 | A06 林克 |

---

**文档结束**

*本文档由 OneOS Agent 团队运维主管 A06 林克编写，CEO A00 尼奥审核批准。*
