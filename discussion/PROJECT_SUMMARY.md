# STS2-Helper 项目分析摘要

## 项目概述
杀戮尖塔2智能选牌助手 - 帮助新手玩家选牌、学习流派、回顾记录的Web应用。

## 技术栈
- React 18 + TypeScript 5
- Vite 5 构建
- TailwindCSS 3 样式
- Zustand 状态管理
- React Router 6 路由
- IndexedDB 本地存储
- GitHub Pages 部署

## 项目结构
```
src/
├── components/     # CardDisplay, ArchetypePanel, RecommendationPanel, CardEffect
├── data/           # cards/, archetypes/, combos/, relics/, events/, bosses/, keywords.ts
├── pages/          # HomePage, AnalyzePage, LearnPage, EncyclopediaPage, SimulatorPage, StatsPage
├── services/       # saveParser, dataUpdater, archetypeEngine, recordManager, cardScorer
├── stores/         # gameStore, recordStore, settingsStore, themeStore
├── types/          # card, archetype, game, record, relic, potion
└── index.css       # 全局样式
```

## 核心功能现状
1. **卡牌数据库** - 6个角色(ironclad/silent/defect/watcher/necromancer/prince)的卡牌JSON数据
2. **流派系统** - 每角色2-3个流派定义，含核心卡、重要卡、辅助卡、combo
3. **选牌评分** - 多维度评分(基础强度20%+流派适配25%+牌库协同20%+楼层适配15%+遗物协同10%+牌库健康10%)
4. **存档解析** - 支持JSON和文本格式，有容错机制
5. **游戏记录** - IndexedDB存储，支持回看和假设分析
6. **6个页面** - 首页、牌库分析、学习攻略、卡牌图鉴、选牌模拟、数据统计

## 已知问题和改进方向
- 数据文件相对稀疏（每角色卡牌数据量不大）
- 没有测试代码
- 没有国际化支持
- 暗色主题实现不完整
- 存档解析依赖游戏文件格式
- 没有Electron桌面应用
- 没有后端服务
- 选牌模拟功能较简单
- 缺少用户引导/onboarding
- 性能优化空间（大数据集搜索）
