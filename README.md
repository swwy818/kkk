# 微信聊天模拟器 v2.0

一个基于Web的微信风格聊天模拟器，支持AI角色对话。

## 📱 功能特色

- ✅ 完整的微信风格界面
- ✅ 多角色管理和对话
- ✅ AI接口集成（支持OpenAI兼容API）
- ✅ 角色人设和头像上传
- ✅ 本地数据存储
- ✅ 移动端适配

## 🚀 快速开始

### 方法一：GitHub Pages 部署
1. Fork 这个仓库
2. 在仓库设置中启用 GitHub Pages
3. 选择 `main` 分支作为源
4. 访问生成的网址即可使用

### 方法二：本地运行
1. 下载所有文件到本地
2. 用浏览器打开 `index.html`
3. 开始使用

## 📋 使用说明

1. **配置API**：点击"API设置"配置您的AI接口
2. **创建角色**：点击"微信" → "+" 创建AI角色
3. **开始聊天**：选择角色开始对话

## 📁 文件结构

```
├── index.html          # 主页面
├── styles.css          # 样式文件
├── script.js           # 脚本文件
└── README.md          # 说明文档
```

## 🔧 API配置

支持任何OpenAI兼容的API接口：
- OpenAI官方API
- Azure OpenAI
- 其他兼容接口

## 📱 移动端支持

完全适配手机浏览器，可以添加到主屏幕作为Web App使用。

## 🎯 GitHub Pages 部署步骤

1. **创建GitHub仓库**
   - 登录GitHub
   - 点击"New repository"
   - 仓库名可以是：`wechat-chat-simulator`
   - 设为Public

2. **上传文件**
   - 上传 `index.html`
   - 上传 `styles.css` 
   - 上传 `script.js`
   - 上传 `README.md`

3. **启用GitHub Pages**
   - 进入仓库设置(Settings)
   - 找到"Pages"选项
   - Source选择"Deploy from a branch"
   - Branch选择"main"
   - 点击Save

4. **访问网站**
   - 等待几分钟部署完成
   - 访问：`https://你的用户名.github.io/wechat-chat-simulator`

## 💡 提示

- 首次使用需要配置API设置
- 所有数据保存在浏览器本地
- 支持头像上传和角色管理
- 完全免费使用