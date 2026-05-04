# 🗡️ 杀戮尖塔2 智能选牌助手

一个专业的杀戮尖塔2卡牌分析工具，帮助新手玩家选牌、学习流派、回顾记录。

## ✨ 特性

- 📊 **牌库分析** - 分析当前牌库，识别匹配的流派方向
- 🎯 **选牌推荐** - 输入可选卡牌，获取智能评分和推荐理由
- 📚 **学习攻略** - 各角色流派详解、核心卡牌、Combo 组合
- 📖 **卡牌图鉴** - 浏览所有角色的卡牌数据库
- 🌙 **暗色主题** - 匹配游戏风格的深色界面

## 🚀 快速开始

### 在线使用
**GitHub Pages:** https://1311523821.github.io/sts2-helper/

### 本地开发
```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 运行测试
pnpm test

# 代码格式化
pnpm format
pnpm format:check

# 数据引用验证
pnpm validate:data

# ESLint 检查
pnpm lint
```

## 🛠️ 技术栈

- **前端框架:** React 18 + TypeScript
- **构建工具:** Vite 5
- **样式方案:** TailwindCSS 3
- **状态管理:** Zustand
- **路由:** React Router 6
- **测试框架:** Vitest + Testing Library
- **代码格式:** Prettier
- **CI/CD:** GitHub Actions

## 🔄 CI/CD

项目使用 GitHub Actions 进行持续集成，每次 PR 和推送到 `main` 会自动运行：

- **Lint** — ESLint 代码检查
- **Test** — Vitest 单元测试（Node 18/20 矩阵）
- **Validate Data** — 卡牌/流派/Combo 数据引用完整性验证
- **Build** — TypeScript 编译 + Vite 构建
- **Audit** — 依赖安全审计

修改 `src/data/` 目录的 PR 会额外触发数据验证流水线。

## 📁 项目结构

```
src/
├── components/     # 通用组件
├── data/           # 卡牌和流派数据
├── pages/          # 页面组件
├── services/       # 分析引擎
├── stores/         # 状态管理
├── types/          # TypeScript 类型
└── utils/          # 工具函数
```

## 📄 开发文档

详见 [DEV.md](./DEV.md) 获取完整的架构设计和开发计划。

## 📜 License

MIT
