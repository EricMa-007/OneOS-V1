# OneOS iOS APP打包与分发指南

## 重要说明

**Windows 无法直接编译 iOS APP**。iOS APP 编译必须使用 macOS + Xcode。但有以下几种可行方案：

| 方案 | 是否需要Mac | 成本 | 难度 | 推荐度 |
|------|------------|------|------|--------|
| **EAS Build（Expo云构建）** | ❌ 不需要 | 免费额度足够测试 | 中等 | ⭐⭐⭐⭐⭐ |
| **Codemagic 云构建** | ❌ 不需要 | 免费500分钟/月 | 简单 | ⭐⭐⭐⭐ |
| **Appcircle 云构建** | ❌ 不需要 | 免费额度 | 简单 | ⭐⭐⭐⭐ |
| **Mac本地编译** | ✅ 需要 | 免费（有Mac的话） | 中等 | ⭐⭐⭐⭐ |
| **租Mac云主机** | ❌ 不需要 | 约$1/小时 | 中等 | ⭐⭐⭐ |
| **找朋友Mac编译** | ✅ 需要 | 免费 | 简单 | ⭐⭐⭐ |

---

## 推荐方案：EAS Build（Expo云构建，零Mac依赖）

### 优势
- ✅ 完全在云端构建，不需要Mac
- ✅ 免费额度：每月30个构建，足够测试使用
- ✅ 自动处理证书和配置
- ✅ 支持一键提交到 TestFlight
- ✅ 支持 iOS 和 Android 双平台

### 前置要求
1. **Apple 开发者账号**（$99/年，必须）
   - 注册地址：https://developer.apple.com/programs/
   - 审核通常需要1-3天
   - **没有开发者账号只能用模拟器测试，无法安装到真机**

2. **Expo 账号**（免费）
   - 注册地址：https://expo.dev/signup

### 步骤1：安装 EAS CLI

```powershell
npm install -g eas-cli
```

### 步骤2：登录 Expo

```powershell
eas login
# 输入你的 Expo 账号和密码
```

### 步骤3：初始化 EAS 配置

```powershell
cd C:\DouBaoXO\OneOS-V1
eas build:configure
```

这会生成 `eas.json`：

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

### 步骤4：配置 app.json

在项目根目录创建或更新 `app.json`：

```json
{
  "expo": {
    "name": "OneOS",
    "slug": "oneos-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#6C5CE7"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.oneos.app",
      "buildNumber": "1",
      "infoPlist": {
        "NSCameraUsageDescription": "需要使用摄像头进行二维码扫描",
        "NSPhotoLibraryUsageDescription": "需要访问相册选择图片"
      }
    },
    "android": {
      "package": "com.oneos.app",
      "versionCode": 1,
      "permissions": ["CAMERA", "INTERNET"]
    },
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "允许OneOS使用摄像头进行扫码"
        }
      ]
    ],
    "extra": {
      "apiBaseUrl": "https://your-domain.com/api"
    }
  }
}
```

### 步骤5：准备图标和启动页

```powershell
# 创建 assets 目录
mkdir assets

# 准备 1024x1024 的图标 PNG，命名为 icon.png
# 准备 1242x2436 的启动页 PNG，命名为 splash.png
# 放入 assets 目录
```

### 步骤6：构建 iOS APP（模拟器版，快速测试）

```powershell
# 构建模拟器版本（不需要Apple开发者账号）
eas build --platform ios --profile preview
```

构建完成后，会下载一个 `.tar.gz` 文件，解压后得到 `.app` 文件，可以在 Mac 的 Xcode 模拟器中运行。

### 步骤7：构建 iOS APP（真机版，可安装到iPhone）

```powershell
# 构建真机版本（需要Apple开发者账号）
eas build --platform ios --profile development
```

第一次构建时，EAS 会引导你：
1. 登录 Apple 开发者账号
2. 自动生成证书（Distribution Certificate）
3. 自动生成描述文件（Provisioning Profile）
4. 注册测试设备（UDID）

**如何获取iPhone的UDID：**
1. iPhone连接电脑
2. 访问 https://get.udid.io/ （用iPhone Safari打开）
3. 按照提示安装描述文件，获取UDID

### 步骤8：安装到iPhone测试

构建完成后，EAS 会提供：
- **直接安装链接**：用iPhone Safari打开，一键安装
- **QR二维码**：用iPhone相机扫描安装
- **IPA文件下载**：可通过其他工具安装

### 步骤9：提交到 TestFlight（推荐，10人测试最佳方案）

```powershell
# 构建生产版本
eas build --platform ios --profile production

# 提交到 TestFlight
eas submit --platform ios
```

**TestFlight 优势：**
- ✅ 最多支持10000名测试用户
- ✅ 用户不需要UDID，直接通过TestFlight APP安装
- ✅ 支持分组管理测试用户
- ✅ 自动更新，用户始终使用最新版
- ✅ 收集崩溃报告和用户反馈

**TestFlight 使用流程：**
1. 构建提交到 App Store Connect
2. 等待苹果审核（通常1-2天，首次可能更长）
3. 审核通过后，创建测试组
4. 添加测试用户的Apple ID邮箱
5. 用户收到邮件邀请，下载TestFlight APP
6. 用户在TestFlight中安装OneOS

---

## 备选方案：Codemagic 云构建

### 优势
- 免费500分钟/月
- 支持iOS和Android
- 界面友好，配置简单
- 不需要Mac

### 步骤
1. 注册 https://codemagic.io/
2. 连接GitHub仓库（或直接上传代码）
3. 选择iOS构建
4. 配置证书（上传Apple开发者证书）
5. 点击构建
6. 下载IPA或直接发布到TestFlight

---

## 备选方案：Mac本地编译（如果你有Mac）

### 前置要求
- Mac电脑（macOS 13+）
- Xcode 15+
- Apple开发者账号

### 步骤

```bash
# 1. 在Mac上安装Capacitor
cd /path/to/OneOS-V1
npm install @capacitor/core @capacitor/cli @capacitor/ios
npx cap init "OneOS" "com.oneos.app" --web-dir=dist

# 2. 构建前端
npm run build

# 3. 添加iOS平台
npx cap add ios

# 4. 同步
npx cap sync ios

# 5. 用Xcode打开
npx cap open ios

# 6. 在Xcode中：
#    - 选择签名团队（Signing & Capabilities → Team）
#    - 配置Bundle Identifier
#    - 连接iPhone，选择设备
#    - 点击运行（⌘R）安装到手机

# 7. 打包IPA
#    - Product → Archive
#    - 完成后点击 Distribute App
#    - 选择 TestFlight & App Store
#    - 上传到 App Store Connect
```

---

## 10人测试最佳方案推荐

### 方案组合

```
┌─────────────────────────────────────────────────┐
│              10人测试方案                          │
├─────────────────────────────────────────────────┤
│                                                   │
│  服务器：你的电脑（PM2守护 + Cloudflare隧道）     │
│           ↓ 公网域名 HTTPS                        │
│                                                   │
│  iOS用户（5人）：TestFlight分发                   │
│    - 提交到App Store Connect                      │
│    - 创建测试组，添加5个Apple ID                  │
│    - 用户通过TestFlight APP安装                   │
│                                                   │
│  安卓用户（5人）：直接分发APK                     │
│    - 构建Release APK                              │
│    - 发送APK文件或下载链接                        │
│    - 用户直接安装（允许未知来源）                  │
│                                                   │
│  测试反馈：飞书群/问卷星/Trello                   │
│                                                   │
└─────────────────────────────────────────────────┘
```

### 时间估算

| 任务 | 时间 |
|------|------|
| Apple开发者账号注册审核 | 1-3天 |
| Cloudflare隧道配置 | 30分钟 |
| EAS Build配置与首次构建 | 1-2小时 |
| TestFlight提交与审核 | 1-2天 |
| 安卓APK构建 | 30分钟 |
| 测试用户邀请与安装 | 1天 |
| **合计** | **约3-5天** |

---

## 成本估算

| 项目 | 费用 | 说明 |
|------|------|------|
| Apple开发者账号 | $99/年 | 必须，iOS APP分发必备 |
| EAS Build | 免费 | 每月30个构建，足够测试 |
| Cloudflare Tunnel | 免费 | 无限流量 |
| 域名（可选） | $10/年 | 用自定义域名更专业 |
| 安卓 | 免费 | 一次性签名密钥 |
| **合计首年** | **约$109** | 约¥780 |

---

## 常见问题

### Q: 没有Apple开发者账号能测试iOS吗？
A: 只能用Xcode模拟器测试，无法安装到真机。TestFlight和App Store都必须有开发者账号。

### Q: 可以用企业证书分发吗？
A: 可以，但企业证书（$299/年）需要企业资质，且苹果严格限制企业证书的使用，滥用会被封号。个人测试推荐$99的个人开发者账号。

### Q: TestFlight审核严格吗？
A: TestFlight的审核比App Store宽松，但仍需遵守基本规则。测试版APP通常1-2天审核通过。

### Q: 可以用AltStore等侧载工具吗？
A: 可以，但需要每7天重新签名，且用户需要安装AltStore，体验较差。不推荐用于10人测试。

### Q: 安卓和iOS可以共用一套代码吗？
A: 可以，Capacitor就是为此设计的。同一套React代码可以同时构建iOS和Android APP，只需少量平台特定配置。

---

## 快速开始命令

```powershell
# 1. 安装工具
npm install -g eas-cli @capacitor/cli

# 2. 登录
eas login

# 3. 初始化（项目根目录）
cd C:\DouBaoXO\OneOS-V1
eas build:configure

# 4. 构建iOS模拟器版（快速验证，不需要开发者账号）
eas build --platform ios --profile preview

# 5. 构建iOS真机版（需要开发者账号）
eas build --platform ios --profile development

# 6. 构建安卓APK
eas build --platform android --profile preview

# 7. 提交到TestFlight
eas submit --platform ios
```
