# 🚀 WebRTC 实时聊天应用

一个基于 Next.js 的现代化实时聊天应用，采用 WebRTC P2P 技术实现去中心化通信，支持端到端加密和多种房间类型。

## ✨ 核心特性

### 🌐 WebRTC 实时通信
- **P2P 连接** - 基于 Trystero 的点对点实时通信，无需中央服务器
- **端到端加密** - 消息在传输过程中自动加密，保护隐私安全
- **多用户支持** - 支持多人同时在线聊天，实时显示在线状态
- **网络适应** - 自动适应不同网络环境，支持 NAT 穿透

### 🏠 智能房间系统
- **双重房间类型** - 公开房间（6位数字）和加密房间（4位数字）
- **自动识别** - 根据房间号位数自动判断房间类型
- **密码保护** - 加密房间支持密码保护，增强安全性
- **实时状态** - 显示连接状态和在线用户数量

### 🎨 现代化界面
- **Bento Grid 设计** - 现代化的圆角卡片设计风格
- **深色模式** - 完整的深色/浅色主题系统，支持手动切换和系统跟随
- **流畅动画** - 使用 Framer Motion 实现丰富的交互动画
- **响应式设计** - 完美适配移动端和桌面端

### ⚡ 技术亮点
- **现代技术栈** - Next.js 15 + React 19 + TailwindCSS 4
- **TypeScript** - 完整的类型安全支持
- **无服务器架构** - 去中心化通信，保护用户隐私
- **Material Icons** - 使用 Material Design 图标系统

## 🛠️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **Next.js** | 15.3.3 | React 全栈框架 |
| **React** | 19.1.0 | UI 组件库 |
| **TypeScript** | 5.8.3 | 类型安全的 JavaScript |
| **TailwindCSS** | 4.1.8 | 原子化 CSS 框架 |
| **Framer Motion** | 12.16.0 | 动画和交互效果 |
| **Material Icons** | 7.1.1 | 图标系统 |
| **Trystero** | 0.21.5 | WebRTC P2P 通信库 |

## 🚀 快速开始

### 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 启动开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

### 访问应用

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 开始使用。

### 使用方法

1. **创建房间**：点击"创建房间"选择房间类型
   - 公开房间：生成6位数字房间号，任何人都可加入
   - 加密房间：生成4位数字房间号，需要设置密码

2. **加入房间**：点击"加入房间"输入房间号
   - 系统会自动识别房间类型
   - 加密房间需要输入正确密码

3. **开始聊天**：成功加入房间后即可开始实时聊天

## 📱 功能详解

### 🏠 房间系统

#### 房间类型
- **公开房间**：6位数字房间号（如：123456）
  - 任何知道房间号的人都可以直接加入
  - 适合朋友间的临时聊天

- **加密房间**：4位数字房间号（如：1234）
  - 需要密码保护，增强隐私安全
  - 适合私密对话和敏感信息交流

#### 智能识别
- 系统根据房间号位数自动判断房间类型
- 加入房间时自动显示相应的输入界面
- 支持房间号格式验证和错误提示

### 🎨 界面设计

#### 欢迎界面
- **Bento Grid 布局**：现代化的卡片式设计
- **主题切换**：右上角支持深色/浅色模式切换
- **动画效果**：使用 Framer Motion 实现流畅过渡

#### 聊天界面
- **实时状态**：显示连接状态和在线用户数量
- **消息气泡**：区分不同用户的消息样式
- **自动滚动**：新消息自动滚动到底部

### 🌙 主题系统

#### 主题模式
- **浅色模式**：经典的白色背景主题
- **深色模式**：护眼的深色背景主题
- **系统跟随**：自动跟随操作系统主题设置

#### 切换方式
- **手动切换**：点击右上角主题切换按钮
- **状态持久化**：用户选择会保存到本地存储
- **平滑过渡**：300ms 的颜色过渡动画效果

### 🔒 安全特性

#### 加密保护
- **WebRTC 加密**：所有消息自动端到端加密
- **密码保护**：加密房间支持密码验证
- **无服务器存储**：消息不会存储在任何服务器上

#### 隐私保护
- **匿名聊天**：无需注册账号，自动生成临时用户名
- **临时性**：房间关闭后所有数据自动清除
- **去中心化**：P2P 连接，无需中央服务器

## 📁 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css         # 全局样式和主题变量
│   ├── layout.tsx          # 根布局和主题提供者
│   └── page.tsx            # 主页面
├── components/             # React 组件
│   ├── ChatContainer.tsx   # 聊天容器（主组件）
│   ├── WelcomeScreen.tsx   # 欢迎界面
│   ├── JoinRoomModal.tsx   # 加入房间弹窗
│   ├── CreateRoomModal.tsx # 创建房间弹窗
│   ├── EncryptedRoomModal.tsx # 加密房间设置弹窗
│   ├── MessageList.tsx     # 消息列表
│   ├── Message.tsx         # 单个消息组件
│   ├── MessageInput.tsx    # 消息输入框
│   └── ThemeToggle.tsx     # 主题切换按钮
├── contexts/               # React Context
│   └── ThemeContext.tsx    # 主题上下文和状态管理
├── hooks/                  # 自定义 Hooks
│   └── useTheme.ts         # 主题相关 Hook
└── services/               # 业务逻辑
    └── webrtcChat.ts       # WebRTC 聊天服务
```

## 🔧 开发指南

### 核心组件架构

#### 主要组件
| 组件 | 功能 | 特性 |
|------|------|------|
| **ChatContainer** | 聊天主容器 | 状态管理、界面切换、WebRTC 连接 |
| **WelcomeScreen** | 欢迎界面 | 房间创建/加入入口、主题切换 |
| **CreateRoomModal** | 创建房间弹窗 | 房间类型选择、密码设置 |
| **JoinRoomModal** | 加入房间弹窗 | 房间号验证、自动类型识别 |
| **MessageList** | 消息列表 | 实时消息显示、自动滚动 |
| **ThemeToggle** | 主题切换 | 深色/浅色模式、动画效果 |

#### 服务层
- **webrtcChat.ts**：WebRTC 通信核心逻辑
- **ThemeContext.tsx**：全局主题状态管理

### 开发特性

#### 代码质量
- **TypeScript**：完整的类型安全支持
- **组件化**：模块化的 React 组件设计
- **状态管理**：使用 React Context 管理全局状态
- **响应式设计**：TailwindCSS 实现的移动端适配

#### 性能优化
- **Next.js 15**：最新的 React 框架特性
- **Turbopack**：快速的开发构建工具
- **懒加载**：按需加载组件和资源
- **WebRTC**：P2P 连接减少服务器负载

### 部署说明

#### 构建项目
```bash
npm run build
```

#### 启动生产服务器
```bash
npm run start
```

#### 部署平台
- **Vercel**：推荐的部署平台，零配置部署
- **Netlify**：支持静态站点部署
- **自托管**：支持 Docker 容器化部署

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来改进这个项目！

### 开发流程
1. Fork 本仓库
2. 创建功能分支：`git checkout -b feature/new-feature`
3. 提交更改：`git commit -am 'Add new feature'`
4. 推送分支：`git push origin feature/new-feature`
5. 提交 Pull Request

### 代码规范
- 使用 TypeScript 进行类型检查
- 遵循 ESLint 代码规范
- 组件使用 PascalCase 命名
- 文件使用 camelCase 命名

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 全栈框架
- [TailwindCSS](https://tailwindcss.com/) - 原子化 CSS 框架
- [Framer Motion](https://www.framer.com/motion/) - 动画库
- [Trystero](https://github.com/dmotz/trystero) - WebRTC P2P 通信库
- [Material Icons](https://mui.com/material-ui/material-icons/) - 图标系统

---

**🚀 开始你的实时聊天之旅吧！**
