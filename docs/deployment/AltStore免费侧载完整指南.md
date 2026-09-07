# OneOS iOS AltStore 免费侧载完整指南

> 最后更新：2026-09-07
> 适用：iPhone / iPad（iOS 14.0 及以上）
> 费用：完全免费（无需Apple开发者账号）
> 限制：每7天需要重新签名一次（AltStore会自动处理）

---

## 📋 准备工作

### 你需要准备的东西

| 物品 | 说明 |
|------|------|
| Windows电脑 | 已安装AltServer（本指南） |
| iPhone / iPad | iOS 14.0及以上 |
| 数据线 | 原装或MFi认证的Lightning/USB-C线 |
| Apple ID | 任意免费的Apple ID（不需要开发者账号） |
| 同一WiFi | 电脑和手机必须在同一个WiFi网络下 |

### 重要提示

- **免费Apple ID签名的APP有效期为7天**，7天后需要重新签名
- AltStore会在手机和电脑同一WiFi时自动重新签名，不需要手动操作
- 每个Apple ID最多可以同时签名3个APP
- 签名后的APP只能在这台手机上使用，不能分发给其他人

---

## 🔧 第一步：安装AltServer（电脑端）

### 1.1 下载AltServer

AltServer已经下载到你的电脑：
```
C:\AltServer\setup.exe
```

如果需要重新下载，官方地址：
https://cdn.altstore.io/file/altstore/altinstaller.zip

### 1.2 安装AltServer

1. 双击运行 `C:\AltServer\setup.exe`
2. 按照安装向导提示，点击"下一步"直到完成
3. 安装完成后，AltServer会自动启动（在系统托盘里，一个菱形图标）

### 1.3 安装iTunes（必须）

AltServer需要iTunes的组件才能和iPhone通信。

**重要：必须从Apple官网下载iTunes，不能用Microsoft Store版本！**

下载地址：
https://www.apple.com/itunes/download/win64

安装完成后，打开iTunes一次，然后关闭即可。

### 1.4 安装iCloud（必须）

同样，必须从Apple官网下载iCloud，不能用Microsoft Store版本。

下载地址：
https://support.apple.com/zh-cn/HT204283

安装完成后，打开iCloud登录你的Apple ID，然后关闭即可。

### 1.5 验证AltServer运行

1. 查看Windows系统托盘（右下角），应该能看到AltServer的菱形图标
2. 如果没有，在开始菜单搜索"AltServer"，以管理员身份运行
3. 右键点击托盘图标，可以看到菜单

---

## 📱 第二步：安装AltStore（手机端）

### 2.1 连接iPhone到电脑

1. 用数据线把iPhone连接到电脑
2. 在iPhone上会弹出"是否信任此电脑"，点击"信任"
3. 输入手机密码确认

### 2.2 安装AltStore到手机

1. 在电脑上，右键点击系统托盘的AltServer图标
2. 选择 "Install AltStore" → 选择你的iPhone设备
3. 弹出对话框，输入你的Apple ID和密码
   - 注意：这里输入的是你的普通Apple ID，不需要开发者账号
   - 如果开启了双重认证，需要生成"应用专用密码"
4. 点击"安装"，等待几分钟
5. 安装完成后，iPhone桌面上会出现AltStore图标

### 2.3 信任AltStore开发者

1. 打开iPhone的 "设置" → "通用" → "VPN与设备管理"
2. 在"开发者APP"下面，找到你的Apple ID对应的条目
3. 点击进入，点击"信任 [你的Apple ID]"
4. 弹出确认框，点击"信任"

### 2.4 验证AltStore

1. 回到桌面，打开AltStore
2. 如果能正常打开，说明安装成功
3. 底部有"Browse"、"My Apps"、"Settings"三个标签

---

## 🚀 第三步：侧载OneOS IPA

### 3.1 获取OneOS IPA文件

你需要一个OneOS的IPA文件。有以下几种方式获取：

#### 方式A：用Codemagic云构建（推荐，免费）

1. 注册Codemagic账号（免费）：https://codemagic.io/signup
2. 把OneOS项目推送到GitHub
3. 在Codemagic中添加这个GitHub仓库
4. 选择 `ios-no-sign` 工作流（已配置在codemagic.yaml中）
5. 点击"Start build"，等待构建完成（约15-20分钟）
6. 构建完成后，下载生成的 `OneOS-unsigned.ipa` 文件

#### 方式B：用Mac本地构建（如果你有Mac）

1. 在Mac上安装Xcode
2. 克隆OneOS项目
3. 运行 `npm install && npm run build`
4. 运行 `npx cap add ios && npx cap sync ios`
5. 用Xcode打开 `ios/App/App.xcworkspace`
6. 选择你的Apple ID作为签名证书
7. 连接iPhone，点击运行
8. 或者用Xcode导出IPA

#### 方式C：找朋友帮忙构建

如果你有朋友用Mac，可以让他帮你构建IPA文件，然后发给你。

### 3.2 把IPA文件传到手机

把 `OneOS.ipa` 文件传到你的iPhone上，可以用以下方式：
- AirDrop（如果是Mac）
- 微信/QQ文件传输
- iCloud云盘
- 邮件附件

确保文件保存在iPhone的"文件"APP中，你能找到它。

### 3.3 用AltStore安装IPA

1. 打开iPhone上的AltStore
2. 点击底部的 "My Apps" 标签
3. 点击左上角的 "+" 号按钮
4. 在文件浏览器中，找到并选择 `OneOS.ipa` 文件
5. AltStore会开始签名和安装，进度条会显示
6. 安装完成后，OneOS会出现在"My Apps"列表中
7. 同时，iPhone桌面上也会出现OneOS图标

### 3.4 信任OneOS开发者

1. 打开iPhone的 "设置" → "通用" → "VPN与设备管理"
2. 在"开发者APP"下面，找到你的Apple ID对应的条目
3. 点击进入，点击"信任 [你的Apple ID]"（如果还没信任的话）
4. 弹出确认框，点击"信任"

### 3.5 启动OneOS

1. 回到桌面，点击OneOS图标
2. APP应该能正常启动
3. 第一次启动可能需要几秒钟加载

---

## 🔄 第四步：自动重新签名（7天有效期）

### 4.1 为什么需要重新签名

免费Apple ID签名的APP有效期只有7天。7天后，APP会闪退，无法打开。

### 4.2 自动重新签名（推荐）

AltStore可以自动重新签名，不需要手动操作：

1. 确保电脑和手机在同一个WiFi网络下
2. 确保电脑上的AltServer正在运行（系统托盘里有图标）
3. 确保手机上的AltStore在后台运行（不要完全关闭）
4. AltStore会在APP到期前自动重新签名

### 4.3 手动重新签名

如果自动签名失败，可以手动操作：

1. 打开AltStore
2. 点击 "My Apps"
3. 找到OneOS，点击右侧的 "X Days" 按钮
4. 点击 "Refresh" 开始重新签名
5. 等待完成

### 4.4 注意事项

- 重新签名时，电脑和手机必须在同一个WiFi
- AltServer必须在电脑上运行
- 如果7天内没有重新签名，APP会闪退，需要重新安装
- 重新安装不会丢失APP内的数据（除非你删除了APP）

---

## ❌ 常见问题排查

### Q1: AltServer里看不到我的iPhone

**解决方案：**
1. 确认数据线是原装或MFi认证的
2. 确认iPhone上已经点击了"信任此电脑"
3. 确认iTunes已经安装（从Apple官网下载的版本）
4. 打开iTunes，看能否识别到iPhone
5. 重启AltServer（右键托盘图标 → Quit，然后重新打开）
6. 重启iPhone和电脑

### Q2: 安装AltStore时提示"Apple ID或密码错误"

**解决方案：**
1. 确认Apple ID和密码正确
2. 如果开启了双重认证，需要生成"应用专用密码"：
   - 登录 https://appleid.apple.com
   - 进入"登录与安全" → "应用专用密码"
   - 生成一个新密码，用这个密码代替原来的密码
3. 确认Apple ID没有被锁定

### Q3: 安装后点击APP提示"不受信任的开发者"

**解决方案：**
1. 打开 "设置" → "通用" → "VPN与设备管理"
2. 找到你的Apple ID，点击"信任"
3. 如果没有看到，说明安装没有成功，重新安装一次

### Q4: 7天后APP闪退了

**解决方案：**
1. 确保电脑和手机在同一个WiFi
2. 确保AltServer在电脑上运行
3. 打开AltStore → My Apps → 点击OneOS的"Refresh"
4. 等待重新签名完成
5. 如果还是不行，删除APP，重新用AltStore安装

### Q5: AltStore提示"已达到最大APP数量"

**解决方案：**
- 每个免费Apple ID最多同时签名3个APP
- 在AltStore的My Apps里删除不需要的APP
- 或者用另一个Apple ID签名

### Q6: 构建IPA时Codemagic报错

**解决方案：**
1. 查看构建日志，找到具体错误
2. 确认项目代码没有问题
3. 确认codemagic.yaml配置正确
4. 可以尝试在本地用Mac构建，排除环境问题

---

## 📞 获取帮助

如果遇到本指南没有覆盖的问题：

1. 查看AltStore官方FAQ：https://faq.altstore.io/
2. 查看AltStore Reddit社区：https://www.reddit.com/r/AltStore/
3. 查看Codemagic文档：https://docs.codemagic.io/

---

## 📝 附录：相关文件位置

| 文件 | 位置 |
|------|------|
| AltServer安装包 | C:\AltServer\setup.exe |
| Codemagic配置 | C:\DouBaoXO\OneOS-V1\codemagic.yaml |
| 安卓APK | C:\DouBaoXO\OneOS-V1\OneOS-v1.0-debug.apk |
| 项目根目录 | C:\DouBaoXO\OneOS-V1 |

---

**祝你使用愉快！有问题随时找我。**
