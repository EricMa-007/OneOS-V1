# OneOS 安卓APP打包指南（Capacitor）

## 概述

使用 **Capacitor** 将 React Web 应用打包为原生安卓 APP。Capacitor 不是简单的浏览器套壳，而是提供了完整的原生桥接层，可以调用：
- 📷 摄像头（扫码功能）
- 📱 通知推送
- 💾 原生存储
- 🔗 深度链接
- 📍 地理位置
- 🎤 麦克风
- 等等

## 环境要求

- Node.js 18+
- JDK 17（Java开发工具包）
- Android Studio（含 Android SDK）
- 约 10GB 磁盘空间

---

## 第一步：安装 JDK 17

### Windows
```powershell
# 方式1：用winget安装（推荐）
winget install Microsoft.OpenJDK.17

# 方式2：手动下载
# 访问 https://learn.microsoft.com/zh-cn/java/openjdk/download
# 下载 OpenJDK 17 Windows x64 MSI 安装包
```

验证安装：
```powershell
java -version
# 应显示 openjdk version "17.x.x"
```

---

## 第二步：安装 Android Studio

1. 下载 Android Studio：https://developer.android.com/studio
2. 安装时勾选 **Android SDK**、**Android SDK Platform**、**Android Virtual Device**
3. 安装完成后打开 Android Studio，进入 **More Actions → SDK Manager**
4. 安装以下组件：
   - Android SDK Platform 34（或最新版）
   - Android SDK Build-Tools 34
   - Android SDK Platform-Tools
   - Android Emulator（可选，用于模拟器测试）

### 配置环境变量

```powershell
# 添加到系统环境变量
ANDROID_HOME = C:\Users\Administrator\AppData\Local\Android\Sdk
PATH 添加: %ANDROID_HOME%\platform-tools
PATH 添加: %ANDROID_HOME%\emulator
```

验证：
```powershell
adb --version
# 应显示 Android Debug Bridge version x.x.x
```

---

## 第三步：初始化 Capacitor

在项目根目录执行：

```powershell
cd C:\DouBaoXO\OneOS-V1

# 安装 Capacitor
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android @capacitor/ios

# 初始化 Capacitor 配置
npx cap init "OneOS" "com.oneos.app" --web-dir=dist
```

这会生成 `capacitor.config.ts`：

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.oneos.app',
  appName: 'OneOS',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true, // 开发时允许HTTP
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#6C5CE7',
      showSpinner: true,
      spinnerColor: '#ffffff',
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#6C5CE7',
    },
  },
};

export default config;
```

---

## 第四步：构建前端并添加安卓平台

```powershell
# 构建前端
npm run build

# 添加安卓平台
npx cap add android

# 同步前端代码到安卓项目
npx cap sync android
```

---

## 第五步：配置服务器地址

APP需要连接到你的服务器。有两种方式：

### 方式A：编译时固定服务器地址（推荐）

创建 `src/config.ts`：
```typescript
export const API_CONFIG = {
  // 生产环境：你的公网域名（配置内网穿透后）
  baseUrl: 'https://your-domain.com/api',
  
  // 开发环境：局域网地址
  // baseUrl: 'http://192.168.1.192:3001/api',
};
```

### 方式B：APP内可配置服务器地址（灵活）

在设置页面添加服务器地址配置项，用户可自行修改。

---

## 第六步：安装原生插件（扫码功能）

```powershell
# 二维码扫码插件
npm install @capacitor-community/barcode-scanner
npx cap sync android
```

在 `android/app/src/main/AndroidManifest.xml` 添加摄像头权限：
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.camera" android:required="false" />
```

---

## 第七步：生成 APK

### 方式A：用 Android Studio 打开（推荐，可视化）

```powershell
npx cap open android
```

Android Studio 打开后：
1. 等待 Gradle 同步完成
2. 菜单 **Build → Build Bundle(s) / APK(s) → Build APK(s)**
3. 构建完成后点击 **locate** 找到 APK 文件
4. APK 路径：`android/app/build/outputs/apk/debug/app-debug.apk`

### 方式B：命令行构建

```powershell
cd android
./gradlew assembleDebug

# 生成的APK位置
# android/app/build/outputs/apk/debug/app-debug.apk
```

### 生成发布版 APK（Release）

```powershell
# 生成签名密钥（只需一次）
keytool -genkey -v -keystore oneos-release.keystore -alias oneos -keyalg RSA -keysize 2048 -validity 10000

# 构建Release版
cd android
./gradlew assembleRelease

# APK位置：android/app/build/outputs/apk/release/app-release.apk
```

---

## 第八步：安装到手机测试

### 方式A：USB安装
```powershell
# 手机开启开发者模式和USB调试
# 连接USB后执行
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

### 方式B：直接发送APK
将 `app-debug.apk` 发送到手机，点击安装（需要允许"未知来源应用"）

### 华为手机特殊说明
华为手机需要：
1. 设置 → 安全 → 更多安全设置 → 允许"未知来源应用"
2. 安装时可能提示"风险检测"，选择"继续安装"
3. 鸿蒙系统（HarmonyOS）兼容安卓APK，直接安装即可

---

## 第九步：APP图标和启动页配置

### 替换APP图标
1. 准备 1024x1024 的图标 PNG
2. 放入 `resources/icon.png`
3. 执行：
```powershell
npm install @capacitor/assets --save-dev
npx capacitor-assets generate --android
```

### 替换启动页
1. 准备 2732x2732 的启动页 PNG
2. 放入 `resources/splash.png`
3. 执行同上命令

---

## 常见问题

### Q: 构建报错 "SDK location not found"
A: 在 `android/local.properties` 添加：
```
sdk.dir=C:\\Users\\Administrator\\AppData\\Local\\Android\\Sdk
```

### Q: APP无法连接服务器
A: 
1. 确认服务器地址配置正确
2. 安卓9+默认禁止明文HTTP，需要用HTTPS或配置`android:usesCleartextTraffic="true"`
3. 检查手机和服务器是否在同一网络，或内网穿透是否正常

### Q: 扫码功能不工作
A: 确认已添加摄像头权限，并在APP内首次使用时授权

### Q: 安装包太大
A: 启用代码压缩和资源压缩，在 `android/app/build.gradle` 中：
```gradle
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
    }
}
```

---

## 快速命令汇总

```powershell
# 完整构建流程
cd C:\DouBaoXO\OneOS-V1
npm run build
npx cap sync android
cd android
./gradlew assembleDebug

# APK位置
# android/app/build/outputs/apk/debug/app-debug.apk

# 安装到手机
adb install -r app/build/outputs/apk/debug/app-debug.apk
```
