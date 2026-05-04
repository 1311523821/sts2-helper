# STS2-Helper 杀戮尖塔2 智能选牌助手 — 开发文档

> **版本**: v1.0.0-draft  
> **日期**: 2026-05-03  
> **作者**: STS2-Helper Team  
> **状态**: 规划阶段

---

## 目录

1. [项目概述](#1-项目概述)
2. [需求分析](#2-需求分析)
3. [用户画像与使用场景](#3-用户画像与使用场景)
4. [系统架构设计](#4-系统架构设计)
5. [技术选型](#5-技术选型)
6. [数据模型设计](#6-数据模型设计)
7. [卡牌数据库建设](#7-卡牌数据库建设)
8. [存档解析模块](#8-存档解析模块)
9. [智能分析引擎](#9-智能分析引擎)
10. [选牌推荐算法](#10-选牌推荐算法)
11. [流派识别系统](#11-流派识别系统)
12. [实时辅助模式](#12-实时辅助模式)
13. [学习攻略模式](#13-学习攻略模式)
14. [游戏记录回看](#14-游戏记录回看)
15. [UI/UX 设计规范](#15-uiux-设计规范)
16. [前端实现方案](#16-前端实现方案)
17. [后端服务设计](#17-后端服务设计)
18. [本地文件监控](#18-本地文件监控)
19. [数据采集与更新](#19-数据采集与更新)
20. [测试策略](#20-测试策略)
21. [部署方案](#21-部署方案)
22. [开发里程碑](#22-开发里程碑)
23. [风险评估](#23-风险评估)
24. [附录](#24-附录)

---

## 1. 项目概述

### 1.1 项目背景

《杀戮尖塔2》(Slay the Spire 2) 是一款 Roguelike 卡牌构筑游戏，于 2026 年初进入 Early Access 阶段。游戏继承了前作的核心玩法，同时引入了新角色、新机制和大量新卡牌。

对于新手玩家而言，面临的核心痛点是：

- **卡牌数量庞大**：每个角色拥有 60-100+ 张不同卡牌，组合方式千变万化
- **选牌决策困难**：每局游戏中会遇到多次选牌机会，新手难以判断哪张牌与当前牌库形成协同
- **流派认知不足**：不了解各角色的核心流派及其关键卡牌，导致拿牌毫无章法
- **缺乏实时辅助**：游戏内没有选牌建议功能，外部资料需要反复查阅

### 1.2 项目目标

构建一个 **杀戮尖塔2 智能选牌助手**，具备以下核心能力：

1. **实时选牌辅助**：在游戏过程中，实时读取存档数据，分析当前牌库，为每次选牌提供智能推荐
2. **流派识别与匹配**：根据已有卡牌，自动识别当前牌库最匹配的流派方向，推荐关键卡牌
3. **新手学习模式**：不在游戏中时，提供各角色流派攻略、核心卡牌讲解、卡牌组合推荐
4. **游戏记录回看**：记录每局游戏的选牌历史，支持复盘分析，帮助玩家提升

### 1.3 核心价值

| 维度 | 价值 |
|------|------|
| 新手友好 | 降低学习曲线，快速理解卡牌协同 |
| 实时性 | 游戏中即时获取选牌建议 |
| 准确性 | 基于数据驱动的选牌推荐 |
| 学习性 | 不仅给答案，还解释为什么 |
| 持续性 | 随游戏版本更新持续维护 |

### 1.4 项目范围

**包含**：
- 杀戮尖塔2 全角色卡牌数据库
- 存档文件实时读取与解析
- 智能选牌推荐引擎
- Web 前端界面 (主要载体)
- 本地桌面应用 (Electron 包装，可选)
- 流派攻略与学习内容
- 游戏记录存储与回看

**不包含**：
- 游戏修改/作弊功能
- 自动打牌/AI 代打
- 联机对战功能
- 移动端 App (初期)

---

## 2. 需求分析

### 2.1 功能需求

#### FR-001: 卡牌数据库管理
- **描述**: 维护完整的杀戮尖塔2卡牌数据库，包含所有角色的所有卡牌
- **数据字段**: 卡牌ID、名称、类型、稀有度、费用、效果描述、关键词、升级后效果
- **数据来源**: 官方Wiki、社区数据、游戏文件提取
- **更新频率**: 每次游戏版本更新后 48 小时内

#### FR-002: 存档文件解析
- **描述**: 自动检测并解析杀戮尖塔2的存档文件，提取当前牌库信息
- **存档路径**: `%APPDATA%\SlayTheSpire2\steam\{SteamUID}\profile{1-3}\`
- **解析内容**: 当前牌库、遗物、金币、血量、楼层、事件历史
- **容错机制**: 存档格式变更时优雅降级，支持手动输入牌库

#### FR-003: 实时选牌推荐
- **描述**: 在游戏选牌界面出现时，实时展示推荐结果
- **触发方式**: 监听存档文件变化 → 解析当前选牌选项 → 展示推荐
- **推荐内容**: 
  - 每张可选卡牌的评分 (0-100)
  - 推荐选牌及理由
  - 该卡牌与当前牌库的协同度
  - 该卡牌所属流派的匹配度

#### FR-004: 流派识别与分析
- **描述**: 根据当前牌库，识别最匹配的流派方向
- **分析维度**:
  - 攻击牌/技能牌/能力牌的比例
  - 关键卡牌的拥有情况
  - 流派核心 combo 的完整度
  - 牌库的平均费用曲线
- **输出**: 流派匹配度排名 + 缺失关键卡牌提示

#### FR-005: 学习攻略模式
- **描述**: 提供离线学习内容，帮助新手理解各角色流派
- **内容**:
  - 各角色流派介绍与核心思路
  - 关键卡牌详解 (为什么重要、什么时候拿)
  - 卡牌组合推荐 (combo 说明)
  - 新手常见误区提醒

#### FR-006: 游戏记录回看
- **描述**: 记录每局游戏的完整选牌过程，支持复盘
- **记录内容**:
  - 每次选牌的时间、楼层、选项、最终选择
  - 牌库变化时间线
  - 战斗结果 (胜利/失败及楼层)
- **回看功能**:
  - 时间线回放
  - 关键决策点标注
  - "如果当时选了X" 的假设分析

#### FR-007: 牌库手动输入
- **描述**: 当存档无法读取时，支持手动选择当前拥有的卡牌
- **交互**: 搜索 + 分类浏览 + 快速选择
- **用途**: 学习模式下模拟选牌场景

### 2.2 非功能需求

#### NFR-001: 性能
- 存档文件变化检测延迟 < 500ms
- 选牌推荐计算时间 < 200ms
- 页面首次加载时间 < 2s
- 存档解析时间 < 1s

#### NFR-002: 可用性
- 支持 Windows 10/11
- 主要浏览器兼容 (Chrome, Edge, Firefox)
- 响应式设计 (1920x1080 优先，支持笔记本 1366x768)
- 深色主题为主 (匹配游戏风格)

#### NFR-003: 可靠性
- 存档解析失败时不影响游戏
- 只读取存档，不修改任何游戏文件
- 网络断开时本地功能仍可用

#### NFR-004: 可维护性
- 卡牌数据与代码分离，便于更新
- 模块化架构，各组件可独立更新
- 完善的日志和错误处理

#### NFR-005: 安全性
- 不读取 Steam 凭证或其他敏感信息
- 不修改游戏文件
- 不联网上传用户数据

---

## 3. 用户画像与使用场景

### 3.1 主要用户画像

#### 新手玩家 (核心用户)
- **特征**: 游戏时长 < 50 小时，对卡牌协同不熟悉
- **痛点**: 不知道拿什么牌，经常构筑出没有核心思路的牌组
- **需求**: 实时选牌建议 + 流派引导
- **使用频率**: 每次游戏都使用

#### 进阶玩家
- **特征**: 游戏时长 50-200 小时，了解基本流派但想提升
- **需求**: 复杂 combo 推荐 + 游戏记录复盘
- **使用频率**: 偶尔使用，主要用于学习新思路

#### 回归玩家
- **特征**: 玩过 STS1，对 STS2 新内容不熟悉
- **需求**: 快速了解新角色、新卡牌、新机制
- **使用频率**: 初期高频，熟悉后降低

### 3.2 使用场景

#### 场景 1: 游戏中实时选牌辅助

```
玩家在游戏中 → 到达选牌事件 → 面前有 3 张可选卡牌
→ 助手自动检测存档变化 → 解析选牌选项
→ 显示每张卡牌的评分和推荐理由
→ 玩家做出选择 → 助手记录本次决策
```

**交互方式**：
- 助手以侧边栏/悬浮窗形式显示
- 不遮挡游戏画面
- 自动高亮推荐卡牌
- 可快速查看详细分析

#### 场景 2: 学习模式

```
玩家不在游戏中 → 打开助手学习页面
→ 选择角色 → 查看该角色各流派介绍
→ 点击流派 → 查看核心卡牌、combo 说明
→ 模拟选牌练习 → 检验学习成果
```

#### 场景 3: 游戏记录回看

```
一局游戏结束 → 玩家打开助手的历史记录
→ 查看本局选牌时间线
→ 重点关注标红的关键决策点
→ 查看"如果当时选了X"的分析
→ 总结经验教训
```

#### 场景 4: 牌库分析 (非实时)

```
玩家游戏中途 → 想了解当前牌库的方向
→ 手动输入/自动读取当前牌库
→ 助手分析牌库匹配的流派
→ 推荐后续应该拿的关键卡牌
→ 提示当前牌库的短板
```

---

## 4. 系统架构设计

### 4.1 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                      用户界面层                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ 实时辅助  │  │ 学习模式  │  │ 记录回看  │  │ 牌库分析 │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘ │
│       │             │             │             │       │
│  ┌────┴─────────────┴─────────────┴─────────────┴────┐  │
│  │              前端核心框架 (React)                   │  │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌─────────┐ │  │
│  │  │状态管理│ │路由  │ │UI组件 │ │主题  │ │国际化   │ │  │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └─────────┘ │  │
│  └───────────────────────┬───────────────────────────┘  │
└──────────────────────────┼──────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────┐
│                    业务逻辑层                            │
│  ┌───────────────────────┴───────────────────────────┐  │
│  │              分析引擎 (TypeScript)                  │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐          │  │
│  │  │流派识别器 │ │选牌评分器 │ │协同度计算│          │  │
│  │  └──────────┘ └──────────┘ └──────────┘          │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐          │  │
│  │  │combo检测 │ │费用分析  │ │稀有度评估│          │  │
│  │  └──────────┘ └──────────┘ └──────────┘          │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │              数据层                                │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐          │  │
│  │  │卡牌数据库 │ │流派规则库 │ │用户数据  │          │  │
│  │  └──────────┘ └──────────┘ └──────────┘          │  │
│  └───────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────┐
│                   系统交互层                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │存档文件   │  │本地存储   │  │网络API   │              │
│  │监控器     │  │(IndexedDB)│  │(可选)    │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└──────────────────────────────────────────────────────────┘
```

### 4.2 模块划分

| 模块 | 职责 | 技术 |
|------|------|------|
| `@sts2/core` | 卡牌数据模型、类型定义 | TypeScript |
| `@sts2/database` | 卡牌数据库 CRUD | TypeScript + IndexedDB |
| `@sts2/parser` | 存档文件解析 | TypeScript + File API |
| `@sts2/analyzer` | 流派识别、选牌评分 | TypeScript |
| `@sts2/ui` | 前端界面组件 | React + TailwindCSS |
| `@sts2/storage` | 本地数据持久化 | IndexedDB + localStorage |
| `@sts2/electron` | 桌面应用包装 | Electron (可选) |

### 4.3 数据流

```
存档文件变化
    │
    ▼
[文件监控器] ──检测到变化──→ [存档解析器]
    │                           │
    │                           ▼
    │                    [解析结果: 牌库、遗物、状态]
    │                           │
    │                           ▼
    │                    [分析引擎]
    │                    ├── 流派识别
    │                    ├── 选牌评分
    │                    └── 协同度计算
    │                           │
    │                           ▼
    │                    [推荐结果]
    │                           │
    │                           ▼
    └──────────────────→ [UI 更新渲染]
```

---

## 5. 技术选型

### 5.1 前端技术栈

| 技术 | 版本 | 用途 | 选型理由 |
|------|------|------|---------|
| React | 18.x | UI 框架 | 生态成熟，组件化开发 |
| TypeScript | 5.x | 类型安全 | 减少运行时错误，提升代码质量 |
| TailwindCSS | 3.x | 样式方案 | 快速开发，深色主题支持好 |
| Zustand | 4.x | 状态管理 | 轻量，适合中小型应用 |
| React Router | 6.x | 路由 | 标准方案 |
| Vite | 5.x | 构建工具 | 快速 HMR，ESM 优先 |
| Lucide React | 最新 | 图标库 | 轻量美观 |

### 5.2 桌面应用 (可选)

| 技术 | 版本 | 用途 | 选型理由 |
|------|------|------|---------|
| Electron | 28.x | 桌面包装 | 支持文件系统访问，跨平台 |
| electron-builder | 最新 | 打包分发 | 成熟的打包方案 |

**替代方案**: 如果不需要桌面应用，可以使用浏览器扩展 (Chrome Extension) 来实现文件监控功能。

### 5.3 数据存储

| 技术 | 用途 | 选型理由 |
|------|------|---------|
| IndexedDB | 本地结构化数据 | 容量大，支持索引 |
| localStorage | 轻量配置项 | 简单键值对 |
| JSON 文件 | 卡牌数据库 | 易于维护和更新 |

### 5.4 开发工具

| 工具 | 用途 |
|------|------|
| pnpm | 包管理 |
| ESLint | 代码规范 |
| Prettier | 代码格式化 |
| Vitest | 单元测试 |
| Playwright | E2E 测试 |

### 5.5 部署与 CI/CD

| 工具 | 用途 |
|------|------|
| GitHub Actions | CI/CD 流水线 |
| GitHub Pages | 静态站点托管 |
| Vercel (备选) | 前端部署 |
| Electron Builder | 桌面应用打包 |

---

## 6. 数据模型设计

### 6.1 卡牌模型

```typescript
// 基础卡牌模型
interface Card {
  id: string;                    // 唯一标识，如 "ironclad_strike"
  name: string;                  // 中文名称，如 "打击"
  nameEn: string;                // 英文名称，如 "Strike"
  character: CharacterId;        // 所属角色
  type: CardType;                // 卡牌类型
  rarity: CardRarity;            // 稀有度
  cost: number;                  // 费用 (-1 表示 X 费)
  description: string;           // 效果描述
  upgradedDescription?: string;  // 升级后描述
  keywords: Keyword[];           // 关键词列表
  effects: CardEffect[];         // 结构化效果
  upgradeBonus?: UpgradeBonus;   // 升级增益
  tags: string[];                // 标签，用于分类和搜索
  imageUrl?: string;             // 卡牌图片 URL
  source: DataSource;            // 数据来源
  lastUpdated: string;           // 最后更新时间
}

// 卡牌类型枚举
enum CardType {
  ATTACK = 'attack',   // 攻击牌
  SKILL = 'skill',     // 技能牌
  POWER = 'power',     // 能力牌
  STATUS = 'status',   // 状态牌
  CURSE = 'curse'      // 诅咒牌
}

// 稀有度枚举
enum CardRarity {
  BASIC = 'basic',       // 基础牌
  COMMON = 'common',     // 普通
  UNCOMMON = 'uncommon', // 罕见
  RARE = 'rare',         // 稀有
  SPECIAL = 'special'    // 特殊
}

// 角色ID枚举
enum CharacterId {
  IRONCLAD = 'ironclad',
  SILENT = 'silent',
  DEFECT = 'defect',
  WATCHER = 'watcher',
  NECROMANCER = 'necromancer',
  PRINCE = 'prince'
}

// 关键词枚举
enum Keyword {
  ETHEREAL = 'ethereal',       // 虚无
  EXHAUST = 'exhaust',         // 消耗
  INNATE = 'innate',           // 固有
  RETAIN = 'retain',           // 保留
  UNPLAYABLE = 'unplayable',   // 无法使用
  INNATE = 'innate',           // 固有
  // ... 更多关键词
}

// 结构化效果
interface CardEffect {
  type: EffectType;       // 效果类型
  target: EffectTarget;   // 目标
  value: number;          // 数值
  condition?: string;     // 触发条件
}

enum EffectType {
  DAMAGE = 'damage',
  BLOCK = 'block',
  DRAW = 'draw',
  ENERGY = 'energy',
  STRENGTH = 'strength',
  DEXTERITY = 'dexterity',
  VULNERABLE = 'vulnerable',
  WEAK = 'weak',
  POISON = 'poison',
  // ... 更多效果类型
}
```

### 6.2 流派模型

```typescript
// 流派/Archetype 定义
interface Archetype {
  id: string;                    // 唯一标识
  name: string;                  // 流派名称
  nameEn: string;                // 英文名
  character: CharacterId;        // 所属角色
  description: string;           // 流派描述
  difficulty: DifficultyLevel;   // 难度等级
  
  // 核心卡牌
  coreCards: CardWeight[];       // 核心卡牌及其权重
  importantCards: CardWeight[];  // 重要卡牌
  supportCards: CardWeight[];    // 辅助卡牌
  
  // 流派特征
  preferredRatio: {              // 理想牌型比例
    attack: number;              // 攻击牌占比 (0-1)
    skill: number;               // 技能牌占比
    power: number;               // 能力牌占比
  };
  idealCostCurve: number[];      // 理想费用曲线 [0费, 1费, 2费, 3费+]
  
  // 评分权重
  scoringWeights: {
    coreCardMatch: number;       // 核心卡匹配权重
    importantCardMatch: number;  // 重要卡匹配权重
    supportCardMatch: number;    // 辅助卡匹配权重
    ratioMatch: number;          // 牌型比例匹配权重
    costCurveMatch: number;      // 费用曲线匹配权重
    synergyBonus: number;        // 协同加成权重
  };
  
  // combo 列表
  combos: Combo[];
  
  // 攻略内容
  guide: ArchetypeGuide;
}

// 卡牌权重
interface CardWeight {
  cardId: string;                // 卡牌ID
  weight: number;                // 权重 (0-100)
  isCore: boolean;               // 是否核心
  reason: string;                // 为什么重要
  alternative?: string;          // 替代卡牌ID
}

// Combo 定义
interface Combo {
  id: string;
  name: string;
  cards: string[];               // 组成卡牌ID列表
  description: string;           // combo 说明
  power: ComboPowerLevel;        // 威力等级
  setup: string;                 // setup 说明
}

enum ComboPowerLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  GAME_WINNING = 'game_winning'
}

// 流派攻略
interface ArchetypeGuide {
  overview: string;              // 总览
  coreStrategy: string;          // 核心策略
  earlyGame: string;             // 前期策略
  midGame: string;               // 中期策略
  lateGame: string;              // 后期策略
  tips: string[];                // 小贴士
  commonMistakes: string[];      // 常见错误
  videoLinks?: string[];         // 攻略视频链接
}
```

### 6.3 游戏存档模型

```typescript
// 解析后的游戏状态
interface GameState {
  character: CharacterId;        // 当前角色
  floor: number;                 // 当前楼层
  act: number;                   // 当前章节
  health: number;                // 当前血量
  maxHealth: number;             // 最大血量
  gold: number;                  // 金币
  deck: DeckCard[];              // 当前牌库
  relics: Relic[];               // 遗物
  potions: Potion[];             // 药水
  
  // 选牌相关
  cardReward?: CardReward;       // 当前选牌奖励 (如果在选牌界面)
  
  // 事件历史
  eventHistory: GameEvent[];     // 事件记录
  
  // 元数据
  seed: string;                  // 随机种子
  timestamp: number;             // 解析时间戳
  profileSlot: number;           // 存档栏位
}

// 牌库中的卡牌
interface DeckCard {
  cardId: string;                // 卡牌ID
  upgraded: boolean;             // 是否已升级
  timesUpgraded: number;         // 升级次数
  innate: boolean;               // 是否为固有
  bottled: boolean;              // 是否被瓶装
}

// 遗物
interface Relic {
  id: string;
  name: string;
  description: string;
  rarity: CardRarity;
  counter?: number;              // 计数器 (部分遗物)
}

// 选牌奖励
interface CardReward {
  options: CardOption[];         // 可选卡牌
  isUpgrade: boolean;            // 是否为升级选牌
  source: RewardSource;          // 来源
}

interface CardOption {
  cardId: string;
  upgraded: boolean;
}

enum RewardSource {
  COMBAT = 'combat',
  EVENT = 'event',
  SHOP = 'shop',
  BOSS = 'boss'
}

// 游戏事件
interface GameEvent {
  type: EventType;
  floor: number;
  timestamp: number;
  data: any;
}

enum EventType {
  CARD_OFFERED = 'card_offered',
  CARD_CHOSEN = 'card_chosen',
  CARD_REMOVED = 'card_removed',
  CARD_UPGRADED = 'card_upgraded',
  RELIC_GAINED = 'relic_gained',
  RELIC_LOST = 'relic_lost',
  BOSS_DEFEATED = 'boss_defeated',
  RUN_ENDED = 'run_ended'
}
```

### 6.4 用户数据模型

```typescript
// 用户本地数据
interface UserProfile {
  id: string;
  createdAt: string;
  preferences: UserPreferences;
  statistics: UserStatistics;
}

// 用户偏好
interface UserPreferences {
  theme: 'dark' | 'light';
  language: 'zh-CN' | 'en';
  defaultCharacter: CharacterId;
  overlayPosition: 'left' | 'right';
  autoDetect: boolean;           // 自动检测存档
  savePath?: string;             // 自定义存档路径
  notifications: boolean;
}

// 用户统计
interface UserStatistics {
  totalRuns: number;
  winsByCharacter: Record<CharacterId, number>;
  mostPickedCards: Record<CharacterId, string[]>;
  averageFloor: number;
  favoriteArchetypes: string[];
}

// 游戏记录
interface GameRecord {
  id: string;
  character: CharacterId;
  startTime: string;
  endTime?: string;
  result: 'win' | 'loss' | 'abandoned';
  finalFloor: number;
  finalDeck: DeckCard[];
  finalRelics: Relic[];
  decisions: Decision[];         // 选牌决策记录
  analysis?: RunAnalysis;        // 回顾分析
}

// 选牌决策
interface Decision {
  floor: number;
  timestamp: string;
  options: CardOption[];         // 可选项
  chosen: string;                // 实际选择
  recommended?: string;          // 助手推荐
  recommendationScore?: number;  // 推荐置信度
  reason?: string;               // 推荐理由
  wasCorrect?: boolean;          // 事后评估是否正确
}

// 单局分析
interface RunAnalysis {
  keyDecisions: Decision[];      // 关键决策点
  missedCards: string[];         // 错过的关键卡
  deckSynergyScore: number;      // 牌库协同度 (0-100)
  archetypeMatch: ArchetypeMatch[];
  overallRating: number;         // 总体评分 (0-100)
  improvements: string[];        // 改进建议
}
```

---

## 7. 卡牌数据库建设

### 7.1 数据来源

#### 主要来源
1. **官方 Wiki**: https://slay-the-spire.fandom.com/wiki/Slay_the_Spire_2_Wiki
2. **游戏文件提取**: 从游戏资源文件中提取卡牌数据
3. **社区数据**: GitHub 上的社区维护数据库
4. **B站攻略视频**: 攻略作者整理的卡牌信息

#### 数据采集流程
```
1. 从游戏文件提取基础数据 (ID、名称、类型、费用)
2. 从 Wiki 补充详细描述和效果
3. 从社区数据交叉验证准确性
4. 人工审核和补充 (流派标签、combo 关系)
5. 格式化为标准 JSON 格式
```

### 7.2 数据文件结构

```
data/
├── cards/
│   ├── index.json              # 卡牌索引
│   ├── ironclad.json           # 铁甲战士卡牌
│   ├── silent.json             # 静默猎人卡牌
│   ├── defect.json             # 故障机器人卡牌
│   ├── watcher.json            # 观者卡牌
│   ├── necromancer.json        # 亡灵契约师卡牌
│   └── prince.json             # 储君卡牌
├── archetypes/
│   ├── index.json              # 流派索引
│   ├── ironclad.json           # 铁甲战 streams
│   ├── silent.json
│   ├── defect.json
│   ├── watcher.json
│   ├── necromancer.json
│   └── prince.json
├── combos/
│   └── all.json                # 所有 combo 数据
├── relics/
│   └── all.json                # 遗物数据
└── metadata/
    ├── version.json            # 数据版本
    └── changelog.json          # 变更日志
```

### 7.3 数据格式示例

```json
{
  "character": "ironclad",
  "version": "0.2.0",
  "cards": [
    {
      "id": "ironclad_strike",
      "name": "打击",
      "nameEn": "Strike",
      "character": "ironclad",
      "type": "attack",
      "rarity": "basic",
      "cost": 1,
      "description": "造成6点伤害。",
      "upgradedDescription": "造成9点伤害。",
      "keywords": [],
      "effects": [
        {
          "type": "damage",
          "target": "enemy",
          "value": 6
        }
      ],
      "upgradeBonus": {
        "damage": 3
      },
      "tags": ["基础", "攻击"],
      "source": "game_files",
      "lastUpdated": "2026-05-03"
    }
  ]
}
```

### 7.4 数据更新机制

1. **版本检测**: 定期检查游戏版本，与本地数据版本对比
2. **增量更新**: 只更新变化的卡牌数据
3. **社区贡献**: 支持通过 Pull Request 贡献数据
4. **自动验证**: 数据格式校验 + 交叉验证

---

## 8. 存档解析模块

### 8.1 存档位置

杀戮尖塔2的存档位于：
```
Windows: %APPDATA%\SlayTheSpire2\steam\{SteamUID}\profile{1-3}\
```

存档目录结构：
```
profile1/
├── run                    # 当前运行数据
├── run.备份               # 运行备份
├── settings               # 游戏设置
└── stats                  # 统计数据
```

### 8.2 存档格式分析

杀戮尖塔2的存档文件可能是以下格式之一：

1. **JSON 格式**: 直接解析
2. **自定义文本格式**: 需要编写解析器
3. **二进制格式**: 需要逆向工程

**解析策略**:
```
1. 尝试 JSON.parse()
2. 如果失败，尝试按行解析 (key=value 格式)
3. 如果失败，尝试 protobuf 解码
4. 如果都失败，回退到手动输入模式
```

### 8.3 文件监控实现

```typescript
// 方案 1: Electron + fs.watch (桌面应用)
import { watch } from 'fs';
import { readFile } from 'fs/promises';

class SaveFileWatcher {
  private watcher: FSWatcher | null = null;
  private savePath: string;
  private lastModified: number = 0;
  
  constructor(savePath: string) {
    this.savePath = savePath;
  }
  
  start(callback: (state: GameState) => void) {
    this.watcher = watch(this.savePath, { recursive: true }, 
      async (eventType, filename) => {
        if (!filename) return;
        
        const stats = await stat(join(this.savePath, filename));
        if (stats.mtimeMs <= this.lastModified) return;
        this.lastModified = stats.mtimeMs;
        
        try {
          const content = await readFile(join(this.savePath, filename), 'utf-8');
          const state = this.parseSaveFile(content);
          if (state) callback(state);
        } catch (err) {
          console.error('Failed to parse save file:', err);
        }
      }
    );
  }
  
  stop() {
    this.watcher?.close();
    this.watcher = null;
  }
  
  private parseSaveFile(content: string): GameState | null {
    // 多种格式尝试解析
    try {
      return JSON.parse(content);
    } catch {
      return this.parseCustomFormat(content);
    }
  }
}
```

```typescript
// 方案 2: 浏览器 File System Access API
class BrowserFileWatcher {
  private handle: FileSystemFileHandle | null = null;
  private pollInterval: number = 1000; // 1秒轮询
  
  async selectSaveDirectory(): Promise<boolean> {
    try {
      const dirHandle = await window.showDirectoryPicker({
        mode: 'read',
        startIn: 'appdata'
      });
      this.handle = await dirHandle.getFileHandle('run');
      return true;
    } catch {
      return false;
    }
  }
  
  async startPolling(callback: (state: GameState) => void) {
    if (!this.handle) return;
    
    let lastModified = 0;
    setInterval(async () => {
      try {
        const file = await this.handle!.getFile();
        if (file.lastModified <= lastModified) return;
        lastModified = file.lastModified;
        
        const content = await file.text();
        const state = parseSaveFile(content);
        if (state) callback(state);
      } catch (err) {
        // 文件可能正在写入中，忽略错误
      }
    }, this.pollInterval);
  }
}
```

### 8.4 解析容错机制

```typescript
class SaveParser {
  // 解析存档，带容错
  parse(content: string): ParseResult {
    const strategies = [
      this.parseJSON.bind(this),
      this.parseKeyValue.bind(this),
      this.parseProtobuf.bind(this)
    ];
    
    for (const strategy of strategies) {
      try {
        const result = strategy(content);
        if (result.success) {
          return { success: true, data: result.data, method: strategy.name };
        }
      } catch (err) {
        continue;
      }
    }
    
    return { 
      success: false, 
      error: 'All parsing strategies failed',
      fallback: this.extractPartialData(content)
    };
  }
  
  // 从损坏/未知格式中提取部分数据
  private extractPartialData(content: string): Partial<GameState> {
    // 尝试通过正则表达式提取关键信息
    const deckMatch = content.match(/deck[":=]+\[([^\]]+)\]/i);
    const floorMatch = content.match(/floor[":=]+(\d+)/i);
    
    return {
      deck: deckMatch ? this.parseDeckString(deckMatch[1]) : [],
      floor: floorMatch ? parseInt(floorMatch[1]) : 0
    };
  }
}
```

---

## 9. 智能分析引擎

### 9.1 分析引擎架构

```
分析引擎
├── 流派匹配器 (ArchetypeMatcher)
│   ├── 核心卡匹配度计算
│   ├── 牌型比例分析
│   ├── 费用曲线分析
│   └── 综合评分
├── 选牌评分器 (CardScorer)
│   ├── 单卡强度评估
│   ├── 牌库协同度计算
│   ├── 流派适配度计算
│   └── 综合推荐分
├── Combo 检测器 (ComboDetector)
│   ├── 已有 combo 识别
│   ├── 潜在 combo 识别
│   └── combo 完成度评估
└── 牌库健康度分析器 (DeckHealthAnalyzer)
    ├── 攻防平衡分析
    ├── 费用曲线分析
    ├── 过牌能力分析
    └── 综合健康度评分
```

### 9.2 流派匹配算法

```typescript
class ArchetypeMatcher {
  // 计算牌库与流派的匹配度
  match(deck: DeckCard[], archetype: Archetype): ArchetypeMatch {
    const scores = {
      coreCardScore: this.matchCoreCards(deck, archetype),
      importantCardScore: this.matchImportantCards(deck, archetype),
      supportCardScore: this.matchSupportCards(deck, archetype),
      ratioScore: this.matchRatio(deck, archetype),
      costCurveScore: this.matchCostCurve(deck, archetype),
      synergyScore: this.calculateSynergy(deck, archetype)
    };
    
    const weights = archetype.scoringWeights;
    const totalScore = 
      scores.coreCardScore * weights.coreCardMatch +
      scores.importantCardScore * weights.importantCardMatch +
      scores.supportCardScore * weights.supportCardMatch +
      scores.ratioScore * weights.ratioMatch +
      scores.costCurveScore * weights.costCurveMatch +
      scores.synergyScore * weights.synergyBonus;
    
    return {
      archetypeId: archetype.id,
      score: Math.round(totalScore),
      scores,
      missingCore: this.findMissingCore(deck, archetype),
      nextSteps: this.suggestNextSteps(deck, archetype)
    };
  }
  
  // 核心卡匹配度
  private matchCoreCards(deck: DeckCard[], archetype: Archetype): number {
    const deckIds = deck.map(c => c.cardId);
    const coreCards = archetype.coreCards;
    
    let matched = 0;
    let totalWeight = 0;
    
    for (const card of coreCards) {
      totalWeight += card.weight;
      if (deckIds.includes(card.cardId)) {
        matched += card.weight;
      }
    }
    
    return totalWeight > 0 ? (matched / totalWeight) * 100 : 0;
  }
  
  // 牌型比例匹配
  private matchRatio(deck: DeckCard[], archetype: Archetype): number {
    const total = deck.length;
    if (total === 0) return 0;
    
    // 需要卡牌数据库来获取每张牌的类型
    const ratio = this.calculateDeckRatio(deck);
    const ideal = archetype.preferredRatio;
    
    const attackDiff = Math.abs(ratio.attack - ideal.attack);
    const skillDiff = Math.abs(ratio.skill - ideal.skill);
    const powerDiff = Math.abs(ratio.power - ideal.power);
    
    const totalDiff = attackDiff + skillDiff + powerDiff;
    return Math.max(0, (1 - totalDiff / 2) * 100);
  }
}
```

### 9.3 选牌评分算法

```typescript
class CardScorer {
  // 为选牌选项评分
  scoreCardOptions(
    options: CardOption[],
    currentDeck: DeckCard[],
    currentArchetypes: ArchetypeMatch[],
    relics: Relic[],
    floor: number
  ): CardScore[] {
    return options.map(option => ({
      cardId: option.cardId,
      score: this.scoreSingleCard(
        option, currentDeck, currentArchetypes, relics, floor
      ),
      breakdown: this.getScoreBreakdown(
        option, currentDeck, currentArchetypes, relics, floor
      )
    }));
  }
  
  private scoreSingleCard(
    option: CardOption,
    deck: DeckCard[],
    archetypes: ArchetypeMatch[],
    relics: Relic[],
    floor: number
  ): number {
    const card = this.getCardData(option.cardId);
    if (!card) return 50; // 未知卡牌给中间分
    
    let score = 0;
    
    // 1. 基础强度 (30%)
    const baseStrength = this.evaluateBaseStrength(card, floor);
    score += baseStrength * 0.3;
    
    // 2. 流派适配度 (35%)
    const archetypeFit = this.evaluateArchetypeFit(card, archetypes);
    score += archetypeFit * 0.35;
    
    // 3. 牌库协同度 (25%)
    const synergy = this.evaluateSynergy(card, deck, relics);
    score += synergy * 0.25;
    
    // 4. 稀有度加成 (10%)
    const rarityBonus = this.evaluateRarity(card, floor);
    score += rarityBonus * 0.1;
    
    return Math.round(Math.min(100, Math.max(0, score)));
  }
  
  // 基础强度评估
  private evaluateBaseStrength(card: Card, floor: number): number {
    let strength = 50; // 基准分
    
    // 费用效率
    const costEfficiency = this.calculateCostEfficiency(card);
    strength += (costEfficiency - 1) * 20;
    
    // 楼层适配 (前期需要攻击牌，后期需要能力牌)
    if (floor < 15) {
      if (card.type === CardType.ATTACK) strength += 10;
    } else {
      if (card.type === CardType.POWER) strength += 10;
    }
    
    return strength;
  }
  
  // 流派适配度评估
  private evaluateArchetypeFit(
    card: Card, 
    archetypes: ArchetypeMatch[]
  ): number {
    if (archetypes.length === 0) return 50;
    
    let maxFit = 0;
    
    for (const archetype of archetypes.slice(0, 3)) { // 取前3个最匹配的流派
      const archetypeDef = this.getArchetype(archetype.archetypeId);
      
      // 检查是否为核心卡
      const isCore = archetypeDef.coreCards.some(c => c.cardId === card.id);
      if (isCore) {
        const weight = archetypeDef.coreCards.find(c => c.cardId === card.id)!.weight;
        maxFit = Math.max(maxFit, 60 + weight * 0.4);
        continue;
      }
      
      // 检查是否为重要卡
      const isImportant = archetypeDef.importantCards.some(c => c.cardId === card.id);
      if (isImportant) {
        const weight = archetypeDef.importantCards.find(c => c.cardId === card.id)!.weight;
        maxFit = Math.max(maxFit, 40 + weight * 0.3);
        continue;
      }
      
      // 检查是否为辅助卡
      const isSupport = archetypeDef.supportCards.some(c => c.cardId === card.id);
      if (isSupport) {
        const weight = archetypeDef.supportCards.find(c => c.cardId === card.id)!.weight;
        maxFit = Math.max(maxFit, 20 + weight * 0.2);
      }
    }
    
    return maxFit;
  }
  
  // 牌库协同度评估
  private evaluateSynergy(
    card: Card, 
    deck: DeckCard[], 
    relics: Relic[]
  ): number {
    let synergy = 0;
    
    // 与现有 combo 的协同
    const comboSynergy = this.evaluateComboSynergy(card, deck);
    synergy += comboSynergy;
    
    // 与遗物的协同
    const relicSynergy = this.evaluateRelicSynergy(card, relics);
    synergy += relicSynergy;
    
    // 与牌库主题的协同
    const themeSynergy = this.evaluateThemeSynergy(card, deck);
    synergy += themeSynergy;
    
    return Math.min(100, synergy);
  }
}
```

### 9.4 协同度计算

```typescript
// 计算两张牌之间的协同度
function calculateCardSynergy(cardA: Card, cardB: Card): number {
  let synergy = 0;
  
  // 1. 关键词协同
  if (cardA.keywords.includes(Keyword.EXHAUST) && 
      cardB.effects.some(e => e.type === 'on_exhaust')) {
    synergy += 30;
  }
  
  // 2. 效果类型协同
  if (cardA.effects.some(e => e.type === 'apply_vulnerable') &&
      cardB.effects.some(e => e.type === 'damage')) {
    synergy += 20;
  }
  
  // 3. 费用协同
  if (cardA.cost === 0 && cardB.effects.some(e => e.type === 'draw')) {
    synergy += 15;
  }
  
  // 4. 标签协同
  const commonTags = cardA.tags.filter(t => cardB.tags.includes(t));
  synergy += commonTags.length * 5;
  
  return Math.min(100, synergy);
}

// 计算牌库整体协同度
function calculateDeckSynergy(deck: DeckCard[], cardDb: CardDatabase): number {
  const cards = deck.map(dc => cardDb.getCard(dc.cardId)).filter(Boolean);
  
  if (cards.length < 2) return 0;
  
  let totalSynergy = 0;
  let pairs = 0;
  
  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      totalSynergy += calculateCardSynergy(cards[i], cards[j]);
      pairs++;
    }
  }
  
  return pairs > 0 ? totalSynergy / pairs : 0;
}
```

---

## 10. 选牌推荐算法

### 10.1 推荐流程

```
输入: 3张可选卡牌 + 当前牌库 + 遗物 + 楼层 + 流派匹配结果
  │
  ▼
[Step 1] 获取卡牌详细数据
  │
  ▼
[Step 2] 对每张卡牌计算多维评分
  │  ├── 基础强度 (30%)
  │  ├── 流派适配 (35%)
  │  ├── 牌库协同 (25%)
  │  └── 稀有度/楼层 (10%)
  │
  ▼
[Step 3] 生成推荐理由
  │  ├── 为什么推荐这张牌
  │  ├── 与哪些牌形成协同
  │  └── 对流派方向的影响
  │
  ▼
[Step 4] 输出推荐结果
  │  ├── 推荐排序 (最佳 → 最差)
  │  ├── 每张牌的评分和理由
  │  └── "不选"选项的利弊分析
  │
  ▼
输出: 推荐结果
```

### 10.2 "不选"选项分析

在杀戮尖塔中，选牌奖励还有一个重要选项是"跳过"。推荐算法也需要考虑跳过的价值：

```typescript
function evaluateSkipOption(
  options: CardOption[],
  currentDeck: DeckCard[],
  archetypes: ArchetypeMatch[],
  floor: number
): SkipAnalysis {
  // 牌库是否已经很精简？
  const isDeckLean = currentDeck.length < 15;
  
  // 牌库是否有明确方向？
  const hasDirection = archetypes.length > 0 && archetypes[0].score > 40;
  
  // 当前最佳选项的评分
  const bestOptionScore = Math.max(...options.map(o => 
    scoreSingleCard(o, currentDeck, archetypes, [], floor)
  ));
  
  // 跳过的价值
  let skipValue = 30; // 基准分
  
  // 牌库精简时，跳过价值更高
  if (isDeckLean) skipValue += 20;
  
  // 有明确方向时，拿无关牌的代价更大
  if (hasDirection && bestOptionScore < 40) skipValue += 25;
  
  // 前期需要扩充牌库
  if (floor < 10) skipValue -= 15;
  
  // 最终判断
  const shouldSkip = skipValue > bestOptionScore;
  
  return {
    shouldSkip,
    skipValue: Math.round(skipValue),
    reason: shouldSkip 
      ? '当前选项与牌库方向不匹配，保持牌库精简更优'
      : '建议从当前选项中选择一张',
    bestAlternative: shouldSkip ? null : options[0].cardId
  };
}
```

### 10.3 推荐理由生成

```typescript
function generateRecommendationReason(
  card: Card,
  score: number,
  deck: DeckCard[],
  archetypes: ArchetypeMatch[],
  combos: Combo[]
): string[] {
  const reasons: string[] = [];
  
  // 流派相关理由
  for (const archetype of archetypes.slice(0, 2)) {
    const archetypeDef = getArchetype(archetype.archetypeId);
    
    if (archetypeDef.coreCards.some(c => c.cardId === card.id)) {
      reasons.push(`🗡️ 这是${archetypeDef.name}的核心卡牌，拿它可以大幅提升流派完成度`);
    } else if (archetypeDef.importantCards.some(c => c.cardId === card.id)) {
      reasons.push(`⚔️ 这是${archetypeDef.name}的重要卡牌，能显著增强流派强度`);
    }
  }
  
  // combo 相关理由
  for (const combo of combos) {
    if (combo.cards.includes(card.id)) {
      const ownedCards = combo.cards.filter(c => 
        deck.some(dc => dc.cardId === c)
      );
      if (ownedCards.length > 0) {
        reasons.push(`🔗 拿到这张牌可以触发 [${combo.name}] combo，与 ${ownedCards.join(', ')} 形成强力组合`);
      }
    }
  }
  
  // 协同相关理由
  const synergies = findSynergies(card, deck);
  if (synergies.length > 0) {
    reasons.push(`🤝 与牌库中的 ${synergies[0].name} 有良好协同`);
  }
  
  // 基础强度理由
  if (score > 70) {
    reasons.push(`💪 这张牌本身强度很高，即使不配合流派也值得拿`);
  }
  
  // 费用曲线理由
  if (card.cost === 0) {
    reasons.push(`⚡ 0 费牌可以灵活使用，不会影响回合节奏`);
  }
  
  return reasons;
}
```

---

## 11. 流派识别系统

### 11.1 流派定义来源

流派定义基于以下来源：
1. **社区共识**: 杀戮尖塔2社区广泛认可的流派
2. **攻略视频**: B站/YouTube攻略作者总结的流派
3. **游戏设计**: 游戏开发者设计的角色机制
4. **数据分析**: 大量胜率数据中的高胜率牌组模式

### 11.2 铁甲战 streams 流派示例

```json
{
  "id": "ironclad_strength",
  "name": "力量流",
  "nameEn": "Strength Build",
  "character": "ironclad",
  "description": "通过叠加力量层数，使每一张攻击牌都能造成大量伤害。力量流是铁甲战士最经典也最容易上手的流派。",
  "difficulty": "beginner",
  
  "coreCards": [
    { "cardId": "inflame", "weight": 90, "isCore": true, "reason": "永久增加力量，是力量流的基石" },
    { "cardId": "demon_form", "weight": 85, "isCore": true, "reason": "每回合自动叠加力量，后期伤害爆炸" },
    { "cardId": "spot_weakness", "weight": 70, "isCore": true, "reason": "条件性叠加大量力量" }
  ],
  
  "importantCards": [
    { "cardId": "heavy_blade", "weight": 80, "isCore": false, "reason": "力量加成 x3，是力量流的核心输出手段" },
    { "cardId": "sword_boomerang", "weight": 75, "isCore": false, "reason": "多次攻击，每次都能享受力量加成" },
    { "cardId": "pummel", "weight": 70, "isCore": false, "reason": "多次攻击，力量加成收益高" },
    { "cardId": "twin_strike", "weight": 65, "isCore": false, "reason": "两次攻击 + 过牌" }
  ],
  
  "supportCards": [
    { "cardId": "flex", "weight": 50, "isCore": false, "reason": "临时力量，配合重刃效果好" },
    { "cardId": "bash", "weight": 45, "isCore": false, "reason": "易伤使伤害翻倍" },
    { "cardId": "battle_trance", "weight": 40, "isCore": false, "reason": "过牌，找核心卡" }
  ],
  
  "preferredRatio": { "attack": 0.5, "skill": 0.3, "power": 0.2 },
  "idealCostCurve": [0.15, 0.45, 0.30, 0.10],
  
  "scoringWeights": {
    "coreCardMatch": 0.35,
    "importantCardMatch": 0.25,
    "supportCardMatch": 0.10,
    "ratioMatch": 0.10,
    "costCurveMatch": 0.05,
    "synergyBonus": 0.15
  },
  
  "combos": [
    {
      "id": "strength_heavy_blade",
      "name": "力量重刃",
      "cards": ["inflame", "heavy_blade"],
      "description": "力量叠加 + 重刃的3倍力量加成 = 恐怖单体伤害",
      "power": "high",
      "setup": "先使用燃烧增加力量，再用重刃输出"
    },
    {
      "id": "strength_multi_hit",
      "name": "力量多段",
      "cards": ["demon_form", "sword_boomerang", "pummel"],
      "description": "恶魔形态持续叠加力量，配合多段攻击打出海量伤害",
      "power": "game_winning",
      "setup": "需要2-3回合的 setup 时间，期间需要足够的防御"
    }
  ],
  
  "guide": {
    "overview": "力量流的核心思路是通过各种方式叠加力量，然后利用高力量配合攻击牌造成大量伤害。",
    "coreStrategy": "优先拿取力量来源（燃烧、恶魔形态），然后补充多段攻击牌（回旋镖、连击）来最大化力量收益。",
    "earlyGame": "前期基础牌足够应对，重点寻找燃烧和痛击。如果遇到恶魔形态，即使费用高也值得拿。",
    "midGame": "中期需要确定力量来源的优先级。如果有恶魔形态，可以走持续叠加路线；如果有燃烧，走爆发路线。",
    "lateGame": "后期力量叠加上限后，伤害会非常恐怖。此时需要注意防御，避免在 setup 阶段被秒。",
    "tips": [
      "重刃是力量流的终极武器，力量越高收益越大",
      "多段攻击牌（回旋镖、连击）比单次高伤牌更享受力量加成",
      "恶魔形态虽然费用高，但长期收益远超其他力量来源",
      "不要忽视防御，setup 阶段需要活下来"
    ],
    "commonMistakes": [
      "只拿攻击牌不拿防御牌，导致 setup 阶段暴毙",
      "拿太多力量来源但没有好的输出牌",
      "在力量不够时就拿重刃，效率很低"
    ]
  }
}
```

### 11.3 流派识别逻辑

```typescript
class ArchetypeIdentifier {
  // 识别牌库最匹配的流派
  identifyArchetypes(
    deck: DeckCard[], 
    character: CharacterId,
    relics: Relic[]
  ): ArchetypeMatch[] {
    const archetypes = this.getArchetypesForCharacter(character);
    
    const matches = archetypes.map(archetype => {
      const matcher = new ArchetypeMatcher();
      const match = matcher.match(deck, archetype);
      
      // 遗物加成
      const relicBonus = this.calculateRelicBonus(archetype, relics);
      match.score = Math.min(100, match.score + relicBonus);
      
      return match;
    });
    
    // 按分数排序
    matches.sort((a, b) => b.score - a.score);
    
    // 返回有意义的匹配 (分数 > 20)
    return matches.filter(m => m.score > 20);
  }
  
  // 计算遗物对流派的加成
  private calculateRelicBonus(archetype: Archetype, relics: Relic[]): number {
    let bonus = 0;
    
    for (const relic of relics) {
      const synergy = this.getRelicArchetypeSynergy(relic.id, archetype.id);
      bonus += synergy;
    }
    
    return bonus;
  }
}
```

---

## 12. 实时辅助模式

### 12.1 工作流程

```
游戏运行中
    │
    ▼
[文件监控器] 检测存档变化 (1秒轮询)
    │
    ▼
[存档解析器] 解析当前游戏状态
    │
    ├── 有选牌奖励？
    │   ├── 是 → [选牌分析]
    │   │       ├── 读取可选卡牌
    │   │       ├── 读取当前牌库
    │   │       ├── 计算推荐分数
    │   │       └── 生成推荐理由
    │   │           │
    │   │           ▼
    │   │       [UI 更新] 显示推荐结果
    │   │
    │   └── 否 → [状态监控]
    │           ├── 更新楼层显示
    │           ├── 更新血量显示
    │           └── 更新遗物显示
    │
    ▼
[游戏记录] 记录本次状态变化
```

### 12.2 选牌界面识别

```typescript
// 通过存档内容判断是否在选牌界面
function detectCardReward(state: GameState): CardReward | null {
  // 方式 1: 存档中有明确的选牌标志
  if (state.cardReward && state.cardReward.options.length > 0) {
    return state.cardReward;
  }
  
  // 方式 2: 通过存档时间戳判断 (存档在选牌时会被写入)
  // 方式 3: 通过游戏内存读取 (需要更深入的集成)
  
  return null;
}
```

### 12.3 界面布局方案

```
┌─────────────────────────────────────────────────────┐
│ 游戏画面 (全屏)                                       │
│                                                       │
│  ┌──────────────────────────────────┐  ┌───────────┐ │
│  │                                  │  │  助手侧边栏 │ │
│  │                                  │  │           │ │
│  │         游戏选牌界面              │  │  推荐结果  │ │
│  │                                  │  │           │ │
│  │   ┌─────┐ ┌─────┐ ┌─────┐      │  │  1. 打击  │ │
│  │   │牌1  │ │牌2  │ │牌3  │      │  │  ⭐ 85分  │ │
│  │   │     │ │     │ │     │      │  │           │ │
│  │   └─────┘ └─────┘ └─────┘      │  │  2. 防御  │ │
│  │                                  │  │  ⭐ 72分  │ │
│  │                                  │  │           │ │
│  └──────────────────────────────────┘  │  3. 跳过  │ │
│                                        │  ⭐ 45分  │ │
│                                        │           │ │
│                                        └───────────┘ │
└─────────────────────────────────────────────────────┘
```

### 12.4 悬浮窗实现 (Electron)

```typescript
// Electron 主进程
import { BrowserWindow, screen } from 'electron';

class OverlayWindow {
  private window: BrowserWindow;
  
  constructor() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    
    this.window = new BrowserWindow({
      width: 320,
      height: 600,
      x: width - 340,
      y: 50,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });
    
    this.window.loadFile('overlay.html');
    this.window.setIgnoreMouseEvents(false);
  }
  
  updateRecommendation(recommendation: Recommendation) {
    this.window.webContents.send('update-recommendation', recommendation);
  }
  
  show() { this.window.show(); }
  hide() { this.window.hide(); }
}
```

### 12.5 浏览器扩展方案 (备选)

如果不使用 Electron，可以通过浏览器扩展实现：

1. **Chrome Extension**: 使用 `chrome.fileSystem` API 访问本地文件
2. **Web 应用 + 本地服务器**: 启动一个轻量级本地服务，负责文件监控和解析

---

## 13. 学习攻略模式

### 13.1 内容结构

```
学习模式
├── 角色选择
│   ├── 铁甲战士
│   │   ├── 角色介绍
│   │   ├── 流派概览
│   │   │   ├── 力量流
│   │   │   ├── 防战流
│   │   │   ├── 消耗流
│   │   │   └── 无限流
│   │   ├── 卡牌图鉴
│   │   └── 新手指南
│   ├── 静默猎人
│   ├── 故障机器人
│   ├── 观者
│   ├── 亡灵契约师
│   └── 储君
├── 通用攻略
│   ├── 遗物图鉴
│   ├── 事件攻略
│   ├── 商店策略
│   └── Boss 攻略
└── 模拟练习
    ├── 选牌模拟
    ├── 牌库构建练习
    └── 知识测验
```

### 13.2 流派攻略页面设计

```typescript
interface ArchetypeGuidePage {
  // 头部信息
  header: {
    name: string;
    character: string;
    difficulty: string;
    rating: number;           // 社区评分
    videoLink?: string;       // 攻略视频
  };
  
  // 核心思路
  overview: {
    description: string;      // 流派描述
    coreStrategy: string;     // 核心策略
    winCondition: string;     // 胜利条件
    strengths: string[];      // 优势
    weaknesses: string[];     // 弱点
  };
  
  // 卡牌推荐
  cardRecommendations: {
    core: CardGuideItem[];    // 核心卡
    important: CardGuideItem[]; // 重要卡
    support: CardGuideItem[];   // 辅助卡
    avoid: CardGuideItem[];     // 应该避免的卡
  };
  
  // Combo 说明
  combos: ComboGuide[];
  
  // 遗物推荐
  relics: RelicGuideItem[];
  
  // 进阶技巧
  advancedTips: string[];
  
  // 常见错误
  commonMistakes: MistakeItem[];
  
  // 发展路线
  progression: {
    early: string;            // 前期 (1-2 章)
    mid: string;              // 中期 (2-3 章)
    late: string;             // 后期 (3-4 章)
    boss: string;             // Boss 战
  };
}

interface CardGuideItem {
  cardId: string;
  name: string;
  importance: 'core' | 'important' | 'support' | 'avoid';
  reason: string;             // 为什么重要/应该避免
  timing: string;             // 什么时候拿
  alternatives: string[];     // 替代选项
}
```

### 13.3 选牌模拟练习

```typescript
// 模拟选牌练习
class CardPickSimulator {
  // 生成模拟选牌场景
  generateScenario(
    character: CharacterId,
    floor: number,
    difficulty: 'easy' | 'medium' | 'hard'
  ): SimulationScenario {
    const deck = this.generateRandomDeck(character, floor);
    const options = this.generateCardOptions(character, deck, floor, difficulty);
    
    return {
      character,
      floor,
      currentDeck: deck,
      options,
      correctAnswer: this.calculateCorrectAnswer(options, deck, floor),
      explanation: this.generateExplanation(options, deck, floor)
    };
  }
  
  // 评估用户选择
  evaluateChoice(
    scenario: SimulationScenario,
    userChoice: string
  ): EvaluationResult {
    const isCorrect = userChoice === scenario.correctAnswer;
    const score = this.calculateScore(scenario, userChoice);
    
    return {
      isCorrect,
      score,
      userChoice,
      correctAnswer: scenario.correctAnswer,
      explanation: scenario.explanation,
      improvement: isCorrect ? null : this.suggestImprovement(scenario, userChoice)
    };
  }
}
```

### 13.4 知识测验

```typescript
// 卡牌知识测验
class CardQuiz {
  // 生成测验题目
  generateQuestions(
    character: CharacterId,
    count: number
  ): QuizQuestion[] {
    const questions: QuizQuestion[] = [];
    const types = ['identify_card', 'match_archetype', 'pick_best', 'combo_identify'];
    
    for (let i = 0; i < count; i++) {
      const type = types[i % types.length];
      questions.push(this.generateQuestion(character, type));
    }
    
    return questions;
  }
  
  private generateQuestion(
    character: CharacterId, 
    type: string
  ): QuizQuestion {
    switch (type) {
      case 'identify_card':
        return {
          type: 'multiple_choice',
          question: '以下哪张卡牌是力量流的核心？',
          options: ['打击', '燃烧', '防御', '痛击'],
          correctAnswer: '燃烧',
          explanation: '燃烧可以永久增加力量，是力量流的基石卡牌。'
        };
        
      case 'match_archetype':
        return {
          type: 'matching',
          question: '将以下卡牌与其所属流派匹配',
          pairs: [
            { card: '毒刃', archetype: '毒流' },
            { card: '催化剂', archetype: '毒流' },
            { card: '刀刃之舞', archetype: '小刀流' }
          ]
        };
        
      // ... 更多题型
    }
  }
}
```

---

## 14. 游戏记录回看

### 14.1 记录存储

```typescript
// 游戏记录管理器
class GameRecordManager {
  private db: IDBDatabase;
  
  // 开始新记录
  async startNewRecord(character: CharacterId): Promise<string> {
    const record: GameRecord = {
      id: generateId(),
      character,
      startTime: new Date().toISOString(),
      result: 'abandoned',
      finalFloor: 0,
      finalDeck: [],
      finalRelics: [],
      decisions: []
    };
    
    await this.db.put('records', record);
    return record.id;
  }
  
  // 记录选牌决策
  async recordDecision(
    recordId: string,
    decision: Decision
  ): Promise<void> {
    const record = await this.db.get('records', recordId);
    record.decisions.push(decision);
    await this.db.put('records', record);
  }
  
  // 结束记录
  async endRecord(
    recordId: string,
    result: 'win' | 'loss' | 'abandoned',
    finalFloor: number,
    finalDeck: DeckCard[],
    finalRelics: Relic[]
  ): Promise<void> {
    const record = await this.db.get('records', recordId);
    record.endTime = new Date().toISOString();
    record.result = result;
    record.finalFloor = finalFloor;
    record.finalDeck = finalDeck;
    record.finalRelics = finalRelics;
    
    // 生成回顾分析
    record.analysis = await this.analyzeRun(record);
    
    await this.db.put('records', record);
  }
  
  // 获取记录列表
  async getRecords(
    character?: CharacterId,
    limit: number = 20
  ): Promise<GameRecord[]> {
    const tx = this.db.transaction('records', 'readonly');
    const store = tx.objectStore('records');
    
    let query = store.index('startTime').reverse();
    if (character) {
      query = store.index('character').getAll(character);
    }
    
    return query.take(limit);
  }
}
```

### 14.2 时间线回放

```typescript
// 游戏时间线组件
interface TimelineView {
  // 时间线节点
  nodes: TimelineNode[];
  
  // 当前查看的位置
  currentIndex: number;
  
  // 交互控制
  controls: {
    play: () => void;
    pause: () => void;
    next: () => void;
    prev: () => void;
    goTo: (index: number) => void;
  };
}

interface TimelineNode {
  floor: number;
  type: EventType;
  title: string;
  description: string;
  deckSnapshot: DeckCard[];  // 该节点的牌库快照
  isKeyDecision: boolean;     // 是否为关键决策
  decision?: Decision;        // 选牌决策详情
  analysis?: string;          // 事后分析
}
```

### 14.3 回顾分析

```typescript
class RunAnalyzer {
  // 分析一局游戏
  async analyzeRun(record: GameRecord): Promise<RunAnalysis> {
    const keyDecisions = this.identifyKeyDecisions(record);
    const missedCards = this.findMissedCards(record);
    const deckSynergy = calculateDeckSynergy(
      record.finalDeck, 
      this.cardDatabase
    );
    const archetypeMatch = this.matchFinalDeck(record);
    
    return {
      keyDecisions,
      missedCards,
      deckSynergyScore: Math.round(deckSynergy),
      archetypeMatch,
      overallRating: this.calculateOverallRating(record),
      improvements: this.generateImprovements(record)
    };
  }
  
  // 识别关键决策点
  private identifyKeyDecisions(record: GameRecord): Decision[] {
    return record.decisions.filter(decision => {
      // 如果用户没有按推荐选，可能是关键决策
      if (decision.chosen !== decision.recommended) return true;
      
      // 如果推荐分数差异大，可能是关键决策
      if (decision.recommendationScore && decision.recommendationScore > 70) {
        return true;
      }
      
      return false;
    });
  }
  
  // 找出错过的卡牌
  private findMissedCards(record: GameRecord): string[] {
    const missed: string[] = [];
    
    for (const decision of record.decisions) {
      if (decision.recommended && decision.chosen !== decision.recommended) {
        // 检查推荐的卡牌是否是核心卡
        const card = this.cardDatabase.getCard(decision.recommended);
        const archetypes = this.getArchetypesForCharacter(record.character);
        
        for (const archetype of archetypes) {
          if (archetype.coreCards.some(c => c.cardId === decision.recommended)) {
            missed.push(decision.recommended);
          }
        }
      }
    }
    
    return [...new Set(missed)];
  }
  
  // 生成改进建议
  private generateImprovements(record: GameRecord): string[] {
    const improvements: string[] = [];
    const analysis = record.analysis;
    
    if (analysis) {
      if (analysis.deckSynergyScore < 40) {
        improvements.push('牌库协同度较低，下次尝试围绕一个流派方向构筑');
      }
      
      if (analysis.missedCards.length > 0) {
        improvements.push(`错过了关键卡牌: ${analysis.missedCards.join(', ')}，这些卡牌对流派构筑很重要`);
      }
      
      if (analysis.overallRating < 50) {
        improvements.push('整体选牌质量有待提高，建议多使用助手的推荐功能');
      }
    }
    
    return improvements;
  }
}
```

### 14.4 "如果当时选了X" 假设分析

```typescript
// 假设分析器
class HypotheticalAnalyzer {
  // 分析"如果当时选了X会怎样"
  analyzeHypothetical(
    record: GameRecord,
    decisionIndex: number,
    alternativeChoice: string
  ): HypotheticalResult {
    const decision = record.decisions[decisionIndex];
    
    // 重建选择替代牌后的牌库
    const alternativeDeck = this.rebuildDeckWithAlternative(
      record, decisionIndex, alternativeChoice
    );
    
    // 用替代牌库重新分析
    const alternativeArchetypes = this.matchArchetypes(
      alternativeDeck, record.character
    );
    
    // 对比原始和替代结果
    const originalScore = record.analysis?.overallRating || 0;
    const alternativeScore = this.calculateOverallRating({
      ...record,
      finalDeck: alternativeDeck,
      analysis: undefined
    });
    
    return {
      original: {
        choice: decision.chosen,
        deckScore: originalScore,
        archetypes: record.analysis?.archetypeMatch || []
      },
      alternative: {
        choice: alternativeChoice,
        deckScore: alternativeScore,
        archetypes: alternativeArchetypes
      },
      improvement: alternativeScore - originalScore,
      conclusion: alternativeScore > originalScore 
        ? `选择 ${alternativeChoice} 会更好，分数提升 ${alternativeScore - originalScore} 分`
        : `你的选择是正确的，${decision.chosen} 在当前情况下更优`
    };
  }
}
```

---

## 15. UI/UX 设计规范

### 15.1 设计原则

1. **暗色主题**: 匹配杀戮尖塔的游戏风格
2. **信息密度**: 重要信息一目了然，详细信息可展开
3. **游戏感**: 使用游戏中的视觉语言（卡牌样式、稀有度颜色）
4. **非侵入性**: 实时辅助模式下不遮挡游戏关键区域
5. **可读性**: 在各种屏幕尺寸下都清晰可读

### 15.2 颜色系统

```css
:root {
  /* 主色调 */
  --bg-primary: #0a0a0f;        /* 主背景 */
  --bg-secondary: #12121a;      /* 次背景 */
  --bg-card: #1a1a2e;           /* 卡牌背景 */
  --bg-hover: #252540;          /* 悬停背景 */
  
  /* 文字颜色 */
  --text-primary: #e8e8f0;      /* 主文字 */
  --text-secondary: #8888a0;    /* 次文字 */
  --text-muted: #55556a;        /* 弱化文字 */
  
  /* 稀有度颜色 */
  --rarity-basic: #888899;      /* 基础 */
  --rarity-common: #ccccdd;     /* 普通 */
  --rarity-uncommon: #4ecdc4;   /* 罕见 */
  --rarity-rare: #ffd93d;       /* 稀有 */
  --rarity-special: #a855f7;    /* 特殊 */
  
  /* 评分颜色 */
  --score-high: #4ecdc4;        /* 高分 (60+) */
  --score-medium: #ffd93d;      /* 中分 (30-59) */
  --score-low: #ff6b6b;         /* 低分 (<30) */
  
  /* 流派颜色 */
  --archetype-strength: #ff6b6b; /* 力量流 */
  --archetype-defense: #4ecdc4;  /* 防战流 */
  --archetype-poison: #a855f7;   /* 毒流 */
  --archetype-draw: #ffd93d;     /* 过牌流 */
  
  /* 交互颜色 */
  --accent: #6366f1;            /* 主强调色 */
  --accent-hover: #818cf8;      /* 强调色悬停 */
  --success: #4ecdc4;           /* 成功 */
  --warning: #ffd93d;           /* 警告 */
  --error: #ff6b6b;             /* 错误 */
}
```

### 15.3 卡牌展示组件

```tsx
// 卡牌展示组件
const CardDisplay: React.FC<{ card: Card; selected?: boolean }> = ({ 
  card, 
  selected = false 
}) => {
  const rarityColor = `var(--rarity-${card.rarity})`;
  
  return (
    <div className={`
      card-display 
      ${selected ? 'selected' : ''}
      card-type-${card.type}
    `}>
      {/* 卡牌边框 - 稀有度颜色 */}
      <div className="card-border" style={{ borderColor: rarityColor }} />
      
      {/* 卡牌头部: 名称 + 费用 */}
      <div className="card-header">
        <span className="card-name">{card.name}</span>
        <span className="card-cost">{card.cost === -1 ? 'X' : card.cost}</span>
      </div>
      
      {/* 卡牌图片区域 */}
      <div className="card-image">
        <span className="card-type-icon">
          {card.type === 'attack' ? '⚔️' : 
           card.type === 'skill' ? '🛡️' : '⚡'}
        </span>
      </div>
      
      {/* 卡牌效果 */}
      <div className="card-effect">
        {formatEffectText(card.description)}
      </div>
      
      {/* 卡牌底部 */}
      <div className="card-footer">
        <span className="card-type">{getTypeName(card.type)}</span>
        <span className="card-rarity" style={{ color: rarityColor }}>
          {getRarityName(card.rarity)}
        </span>
      </div>
    </div>
  );
};
```

### 15.4 推荐结果展示

```tsx
// 选牌推荐结果组件
const RecommendationPanel: React.FC<{ 
  recommendation: Recommendation 
}> = ({ recommendation }) => {
  return (
    <div className="recommendation-panel">
      <h3 className="panel-title">📊 选牌推荐</h3>
      
      {recommendation.scores.map((score, index) => (
        <div key={score.cardId} className={`
          recommendation-item 
          rank-${index + 1}
          ${index === 0 ? 'recommended' : ''}
        `}>
          {/* 排名 */}
          <div className="rank-badge">
            {index === 0 ? '⭐' : `#${index + 1}`}
          </div>
          
          {/* 卡牌信息 */}
          <div className="card-info">
            <span className="card-name">{score.cardName}</span>
            <span className="card-type">{score.cardType}</span>
          </div>
          
          {/* 评分 */}
          <div className={`score-badge score-${getScoreLevel(score.score)}`}>
            {score.score}
          </div>
          
          {/* 推荐理由 */}
          <div className="reasons">
            {score.reasons.map((reason, i) => (
              <div key={i} className="reason-item">
                {reason}
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {/* 跳过选项 */}
      {recommendation.skipAnalysis && (
        <div className={`
          skip-option 
          ${recommendation.skipAnalysis.shouldSkip ? 'recommended' : ''}
        `}>
          <span className="skip-icon">🚫</span>
          <span className="skip-text">跳过选牌</span>
          <span className="skip-reason">
            {recommendation.skipAnalysis.reason}
          </span>
        </div>
      )}
    </div>
  );
};
```

### 15.5 流派匹配展示

```tsx
// 流派匹配度展示
const ArchetypeMatchDisplay: React.FC<{
  matches: ArchetypeMatch[]
}> = ({ matches }) => {
  return (
    <div className="archetype-matches">
      <h3>🎯 流派匹配度</h3>
      
      {matches.map(match => (
        <div key={match.archetypeId} className="archetype-match-item">
          <div className="match-header">
            <span className="archetype-name">{match.archetypeName}</span>
            <span className={`match-score ${getScoreLevel(match.score)}`}>
              {match.score}%
            </span>
          </div>
          
          {/* 进度条 */}
          <div className="match-bar">
            <div 
              className={`match-fill ${getScoreLevel(match.score)}`}
              style={{ width: `${match.score}%` }}
            />
          </div>
          
          {/* 已拥有的核心卡 */}
          <div className="owned-cards">
            <span className="label">已拥有:</span>
            {match.ownedCore.map(card => (
              <span key={card} className="card-badge owned">{card}</span>
            ))}
          </div>
          
          {/* 缺失的核心卡 */}
          <div className="missing-cards">
            <span className="label">还缺:</span>
            {match.missingCore.map(card => (
              <span key={card} className="card-badge missing">{card}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
```

### 15.6 响应式布局

```css
/* 桌面布局 (>= 1200px) */
@media (min-width: 1200px) {
  .app-layout {
    display: grid;
    grid-template-columns: 1fr 360px;
    gap: 24px;
  }
  
  .main-content {
    max-width: 900px;
  }
  
  .sidebar {
    position: sticky;
    top: 24px;
    height: fit-content;
  }
}

/* 平板布局 (768px - 1199px) */
@media (min-width: 768px) and (max-width: 1199px) {
  .app-layout {
    display: grid;
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    position: fixed;
    right: 0;
    top: 0;
    width: 320px;
    height: 100vh;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  }
  
  .sidebar.open {
    transform: translateX(0);
  }
}

/* 手机布局 (< 768px) */
@media (max-width: 767px) {
  .app-layout {
    display: flex;
    flex-direction: column;
  }
  
  .sidebar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60vh;
    transform: translateY(100%);
    transition: transform 0.3s ease;
  }
  
  .sidebar.open {
    transform: translateY(0);
  }
}
```

---

## 16. 前端实现方案

### 16.1 项目结构

```
sts2-helper/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── main.tsx                # 入口
│   ├── App.tsx                 # 根组件
│   │
│   ├── components/             # 通用组件
│   │   ├── CardDisplay.tsx     # 卡牌展示
│   │   ├── ScoreBadge.tsx      # 评分徽章
│   │   ├── ProgressBar.tsx     # 进度条
│   │   ├── SearchInput.tsx     # 搜索输入
│   │   ├── TabGroup.tsx        # 标签组
│   │   └── Tooltip.tsx         # 提示框
│   │
│   ├── features/               # 功能模块
│   │   ├── real-time/          # 实时辅助
│   │   │   ├── RealTimePanel.tsx
│   │   │   ├── CardRewardView.tsx
│   │   │   └── RecommendationList.tsx
│   │   ├── learning/           # 学习模式
│   │   │   ├── CharacterGuide.tsx
│   │   │   ├── ArchetypeDetail.tsx
│   │   │   ├── CardEncyclopedia.tsx
│   │   │   └── QuizMode.tsx
│   │   ├── history/            # 历史记录
│   │   │   ├── RunList.tsx
│   │   │   ├── RunDetail.tsx
│   │   │   ├── Timeline.tsx
│   │   │   └── Hypothetical.tsx
│   │   └── deck-analysis/      # 牌库分析
│   │       ├── DeckInput.tsx
│   │       ├── DeckAnalysis.tsx
│   │       └── ArchetypeRadar.tsx
│   │
│   ├── hooks/                  # 自定义 Hooks
│   │   ├── useSaveFileWatcher.ts
│   │   ├── useGameState.ts
│   │   ├── useArchetypeMatch.ts
│   │   └── useCardScorer.ts
│   │
│   ├── services/               # 服务层
│   │   ├── saveParser.ts       # 存档解析
│   │   ├── cardDatabase.ts     # 卡牌数据库
│   │   ├── archetypeEngine.ts  # 流派分析
│   │   ├── cardScorer.ts       # 选牌评分
│   │   └── recordManager.ts    # 记录管理
│   │
│   ├── stores/                 # 状态管理
│   │   ├── appStore.ts         # 应用状态
│   │   ├── gameStore.ts        # 游戏状态
│   │   └── settingsStore.ts    # 设置状态
│   │
│   ├── types/                  # 类型定义
│   │   ├── card.ts
│   │   ├── archetype.ts
│   │   ├── game.ts
│   │   └── record.ts
│   │
│   ├── utils/                  # 工具函数
│   │   ├── format.ts
│   │   ├── calculate.ts
│   │   └── storage.ts
│   │
│   └── data/                   # 静态数据
│       ├── cards/
│       ├── archetypes/
│       └── combos/
│
├── electron/                   # Electron 主进程
│   ├── main.ts
│   ├── preload.ts
│   └── overlay.ts
│
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

### 16.2 路由设计

```tsx
// 路由配置
const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'realtime', element: <RealTimePanel /> },
      { path: 'learning', element: <LearningMode /> },
      { path: 'learning/:character', element: <CharacterGuide /> },
      { path: 'learning/:character/:archetype', element: <ArchetypeDetail /> },
      { path: 'history', element: <HistoryPage /> },
      { path: 'history/:runId', element: <RunDetail /> },
      { path: 'deck-analysis', element: <DeckAnalysisPage /> },
      { path: 'encyclopedia', element: <CardEncyclopedia /> },
      { path: 'settings', element: <SettingsPage /> },
    ]
  }
];
```

### 16.3 状态管理

```typescript
// Zustand 状态管理
import { create } from 'zustand';

// 应用全局状态
interface AppState {
  currentView: 'realtime' | 'learning' | 'history' | 'analysis';
  currentCharacter: CharacterId | null;
  isLoading: boolean;
  error: string | null;
  
  // actions
  setView: (view: AppState['currentView']) => void;
  setCharacter: (character: CharacterId) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'realtime',
  currentCharacter: null,
  isLoading: false,
  error: null,
  
  setView: (view) => set({ currentView: view }),
  setCharacter: (character) => set({ currentCharacter: character })
}));

// 游戏状态
interface GameStoreState {
  gameState: GameState | null;
  deckAnalysis: ArchetypeMatch[] | null;
  currentRecommendation: Recommendation | null;
  isMonitoring: boolean;
  
  // actions
  updateGameState: (state: GameState) => void;
  startMonitoring: () => void;
  stopMonitoring: () => void;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  gameState: null,
  deckAnalysis: null,
  currentRecommendation: null,
  isMonitoring: false,
  
  updateGameState: (state) => {
    set({ gameState: state });
    
    // 自动触发分析
    const engine = new ArchetypeEngine();
    const matches = engine.identifyArchetypes(state.deck, state.character, state.relics);
    set({ deckAnalysis: matches });
    
    // 如果有选牌选项，生成推荐
    if (state.cardReward) {
      const scorer = new CardScorer();
      const scores = scorer.scoreCardOptions(
        state.cardReward.options,
        state.deck,
        matches,
        state.relics,
        state.floor
      );
      set({ currentRecommendation: { scores, timestamp: Date.now() } });
    }
  },
  
  startMonitoring: () => set({ isMonitoring: true }),
  stopMonitoring: () => set({ isMonitoring: false })
}));
```

---

## 17. 后端服务设计

### 17.1 架构说明

本项目初期以纯前端为主，后端服务为可选增强。后端主要用于：

1. **数据同步**: 多设备间同步游戏记录
2. **社区数据**: 匿名化的选牌统计数据
3. **内容更新**: 卡牌数据库更新推送
4. **用户账号**: 可选的用户注册登录

### 17.2 API 设计 (可选后端)

```
基础路径: /api/v1

# 卡牌数据
GET  /cards                     # 获取所有卡牌
GET  /cards/:character          # 获取角色卡牌
GET  /cards/:id                 # 获取单张卡牌

# 流派数据
GET  /archetypes                # 获取所有流派
GET  /archetypes/:character     # 获取角色流派

# 用户数据 (需要认证)
POST /records                   # 上传游戏记录
GET  /records                   # 获取游戏记录
GET  /records/:id               # 获取单条记录
POST /records/:id/analysis      # 生成回顾分析

# 社区数据
GET  /stats/cards               # 卡牌选牌统计
GET  /stats/archetypes          # 流派胜率统计
GET  /stats/combos              # combo 胜率统计
```

### 17.3 本地优先策略

由于杀戮尖塔2是单机游戏，我们采用**本地优先**策略：

1. **所有核心功能离线可用**: 卡牌数据库、流派分析、选牌推荐
2. **本地存储优先**: IndexedDB 存储所有用户数据
3. **网络可选增强**: 社区统计、数据同步等需要联网
4. **无网络降级**: 网络不可用时功能不受影响

---

## 18. 本地文件监控

### 18.1 Electron 方案

```typescript
// electron/main.ts
import { app, BrowserWindow, ipcMain } from 'electron';
import { watch, readFile, stat } from 'fs/promises';
import { join } from 'path';

class SaveFileMonitor {
  private watcher: any = null;
  private savePath: string = '';
  private lastModified: number = 0;
  private mainWindow: BrowserWindow | null = null;
  
  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }
  
  async start(savePath: string) {
    this.savePath = savePath;
    this.watcher = watch(savePath, { recursive: true });
    
    for await (const event of this.watcher) {
      await this.handleFileChange(event);
    }
  }
  
  private async handleFileChange(event: any) {
    try {
      const filePath = join(this.savePath, event.filename);
      const fileStat = await stat(filePath);
      
      if (fileStat.mtimeMs <= this.lastModified) return;
      this.lastModified = fileStat.mtimeMs;
      
      const content = await readFile(filePath, 'utf-8');
      const gameState = this.parseSaveFile(content);
      
      if (gameState) {
        this.mainWindow?.webContents.send('game-state-update', gameState);
      }
    } catch (err) {
      // 文件正在写入中，忽略
    }
  }
  
  stop() {
    this.watcher?.close();
    this.watcher = null;
  }
}

// IPC 通信
ipcMain.on('start-monitoring', async (event, savePath) => {
  const monitor = new SaveFileMonitor(mainWindow);
  await monitor.start(savePath);
});

ipcMain.on('stop-monitoring', () => {
  monitor?.stop();
});
```

### 18.2 浏览器方案 (File System Access API)

```typescript
// 浏览器文件监控
class BrowserSaveMonitor {
  private dirHandle: FileSystemDirectoryHandle | null = null;
  private pollTimer: number | null = null;
  private lastModified: Map<string, number> = new Map();
  
  async selectDirectory(): Promise<boolean> {
    try {
      this.dirHandle = await window.showDirectoryPicker({
        mode: 'read'
      });
      return true;
    } catch {
      return false;
    }
  }
  
  startPolling(callback: (state: GameState) => void, interval = 1000) {
    if (!this.dirHandle) return;
    
    this.pollTimer = window.setInterval(async () => {
      await this.checkForChanges(callback);
    }, interval);
  }
  
  private async checkForChanges(callback: (state: GameState) => void) {
    if (!this.dirHandle) return;
    
    for await (const [name, handle] of this.dirHandle) {
      if (handle.kind !== 'file') continue;
      
      try {
        const file = await handle.getFile();
        const lastMod = this.lastModified.get(name) || 0;
        
        if (file.lastModified > lastMod) {
          this.lastModified.set(name, file.lastModified);
          
          const content = await file.text();
          const state = parseSaveFile(content);
          if (state) callback(state);
        }
      } catch {
        // 忽略错误
      }
    }
  }
  
  stop() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }
}
```

### 18.3 本地服务器方案 (备选)

```typescript
// 轻量级本地服务器 (Node.js)
import { watch } from 'chokidar';
import express from 'express';
import cors from 'cors';
import { readFile } from 'fs/promises';

const app = express();
app.use(cors());

let latestState: GameState | null = null;

// 文件监控
const watcher = watch(savePath, {
  persistent: true,
  ignoreInitial: true
});

watcher.on('change', async (path) => {
  try {
    const content = await readFile(path, 'utf-8');
    latestState = parseSaveFile(content);
  } catch (err) {
    console.error('Parse error:', err);
  }
});

// SSE 推送
app.get('/api/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  const interval = setInterval(() => {
    if (latestState) {
      res.write(`data: ${JSON.stringify(latestState)}\n\n`);
    }
  }, 1000);
  
  req.on('close', () => clearInterval(interval));
});

// 获取当前状态
app.get('/api/state', (req, res) => {
  res.json(latestState);
});

app.listen(28563, () => {
  console.log('STS2 Helper server running on port 28563');
});
```

---

## 19. 数据采集与更新

### 19.1 卡牌数据采集流程

```
1. 游戏文件提取
   ├── 扫描游戏安装目录
   ├── 解析资源文件 (可能需要解包)
   ├── 提取卡牌定义文件
   └── 生成基础卡牌 JSON

2. Wiki 数据补充
   ├── 爬取杀戮尖塔2 Wiki 页面
   ├── 解析卡牌详情页
   ├── 提取效果描述、关键词、升级效果
   └── 合并到基础数据

3. 社区数据交叉验证
   ├── 对比 GitHub 社区数据库
   ├── 对比 B站攻略视频中的卡牌信息
   ├── 标记不一致的数据
   └── 人工审核确认

4. 流派与 Combo 数据
   ├── 收集攻略视频中的流派定义
   ├── 分析社区帖子中的流派讨论
   ├── 整理核心卡牌、重要卡牌、辅助卡牌
   ├── 定义 combo 关系
   └── 编写流派攻略内容

5. 数据格式化
   ├── 统一 JSON 格式
   ├── 添加缺失字段
   ├── 数据校验
   └── 生成版本号
```

### 19.2 数据更新机制

```typescript
// 数据更新管理器
class DataUpdater {
  private currentVersion: string;
  private remoteUrl: string;
  
  // 检查更新
  async checkForUpdates(): Promise<UpdateInfo | null> {
    try {
      const response = await fetch(`${this.remoteUrl}/metadata/version.json`);
      const remote = await response.json();
      
      if (this.compareVersions(remote.version, this.currentVersion) > 0) {
        return {
          version: remote.version,
          changelog: remote.changelog,
          downloadUrl: remote.downloadUrl
        };
      }
      
      return null;
    } catch {
      return null; // 网络错误，忽略
    }
  }
  
  // 下载更新
  async downloadUpdate(updateInfo: UpdateInfo): Promise<void> {
    const response = await fetch(updateInfo.downloadUrl);
    const data = await response.json();
    
    // 保存到本地
    await this.saveToLocal(data);
    
    // 更新版本号
    this.currentVersion = updateInfo.version;
  }
  
  // 本地数据校验
  async validateLocalData(): Promise<ValidationResult> {
    const cards = await this.loadLocalCards();
    const issues: string[] = [];
    
    // 检查必填字段
    for (const card of cards) {
      if (!card.id) issues.push(`Card missing id: ${JSON.stringify(card)}`);
      if (!card.name) issues.push(`Card ${card.id} missing name`);
      if (card.cost === undefined) issues.push(`Card ${card.id} missing cost`);
    }
    
    // 检查重复 ID
    const ids = cards.map(c => c.id);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    if (duplicates.length > 0) {
      issues.push(`Duplicate card IDs: ${duplicates.join(', ')}`);
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      cardCount: cards.length
    };
  }
}
```

### 19.3 社区贡献指南

```markdown
## 如何贡献卡牌数据

### 1. Fork 项目
### 2. 修改数据文件 (data/cards/*.json)
### 3. 确保数据格式正确
### 4. 提交 Pull Request

### 数据格式要求
每张卡牌必须包含以下字段：
- id: 唯一标识 (格式: character_cardname)
- name: 中文名称
- nameEn: 英文名称
- character: 所属角色
- type: 卡牌类型 (attack/skill/power)
- rarity: 稀有度 (basic/common/uncommon/rare/special)
- cost: 费用 (数字，-1 表示 X 费)
- description: 效果描述

可选字段：
- keywords: 关键词数组
- effects: 结构化效果数组
- upgradeBonus: 升级增益
- tags: 标签数组
```

---

## 20. 测试策略

### 20.1 测试层次

```
测试金字塔
├── E2E 测试 (10%)
│   ├── 完整用户流程测试
│   ├── 存档加载 → 分析 → 推荐
│   └── 跨浏览器兼容性
│
├── 集成测试 (30%)
│   ├── 存档解析 + 分析引擎
│   ├── 卡牌数据库 + 评分器
│   └── 状态管理 + UI 更新
│
└── 单元测试 (60%)
    ├── 卡牌评分算法
    ├── 流派匹配算法
    ├── 协同度计算
    ├── 存档解析器
    └── 工具函数
```

### 20.2 测试用例示例

```typescript
// 选牌评分测试
describe('CardScorer', () => {
  const scorer = new CardScorer();
  
  it('should score core archetype cards highly', () => {
    const options = [
      { cardId: 'inflame', upgraded: false },
      { cardId: 'strike', upgraded: false },
      { cardId: 'defend', upgraded: false }
    ];
    
    const deck = [
      { cardId: 'bash', upgraded: false, timesUpgraded: 0 },
      { cardId: 'strike', upgraded: false, timesUpgraded: 0 }
    ];
    
    const archetypes = [{
      archetypeId: 'ironclad_strength',
      score: 50,
      // ...
    }];
    
    const scores = scorer.scoreCardOptions(options, deck, archetypes, [], 5);
    
    // 燃烧应该得分最高
    expect(scores[0].cardId).toBe('inflame');
    expect(scores[0].score).toBeGreaterThan(60);
  });
  
  it('should recommend skip when no cards fit', () => {
    const options = [
      { cardId: 'wild_strike', upgraded: false },
      { cardId: 'reckless_charge', upgraded: false },
      { cardId: 'cleave', upgraded: false }
    ];
    
    const deck = [
      // 纯防御牌库
      { cardId: 'defend', upgraded: false, timesUpgraded: 0 },
      { cardId: 'shrug_it_off', upgraded: false, timesUpgraded: 0 },
      { cardId: 'ghostly_armor', upgraded: false, timesUpgraded: 0 }
    ];
    
    const archetypes: ArchetypeMatch[] = [];
    
    const scores = scorer.scoreCardOptions(options, deck, archetypes, [], 20);
    const skipAnalysis = evaluateSkipOption(options, deck, archetypes, 20);
    
    // 分数应该都不高，且应该建议跳过
    expect(scores.every(s => s.score < 50)).toBe(true);
    expect(skipAnalysis.shouldSkip).toBe(true);
  });
});
```

### 20.3 测试数据

```typescript
// 测试用卡牌数据
export const TEST_CARDS: Record<string, Card> = {
  ironclad_strike: {
    id: 'ironclad_strike',
    name: '打击',
    nameEn: 'Strike',
    character: 'ironclad',
    type: 'attack',
    rarity: 'basic',
    cost: 1,
    description: '造成6点伤害。',
    keywords: [],
    effects: [{ type: 'damage', target: 'enemy', value: 6 }],
    tags: ['基础']
  },
  ironclad_inflame: {
    id: 'ironclad_inflame',
    name: '燃烧',
    nameEn: 'Inflame',
    character: 'ironclad',
    type: 'power',
    rarity: 'uncommon',
    cost: 1,
    description: '获得2点力量。',
    keywords: [],
    effects: [{ type: 'strength', target: 'self', value: 2 }],
    tags: ['力量', '能力']
  }
  // ... 更多测试数据
};
```

---

## 21. 部署方案

### 21.1 GitHub Pages 部署

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm build
      
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

### 21.2 Electron 打包

```json
// package.json (Electron 部分)
{
  "build": {
    "appId": "com.sts2helper.app",
    "productName": "STS2 Helper",
    "directories": {
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "electron/**/*"
    ],
    "win": {
      "target": ["nsis"],
      "icon": "public/icon.ico"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true
    }
  }
}
```

### 21.3 版本发布流程

```
1. 更新版本号 (package.json)
2. 更新 CHANGELOG.md
3. git tag v1.0.0
4. git push --tags
5. GitHub Actions 自动:
   ├── 运行测试
   ├── 构建前端
   ├── 打包 Electron
   ├── 创建 GitHub Release
   └── 上传安装包
```

---

## 22. 开发里程碑

### Phase 1: 基础框架 (Week 1-2)

| 任务 | 优先级 | 预计工时 | 状态 |
|------|--------|---------|------|
| 项目初始化 (Vite + React + TS) | P0 | 4h | ⬜ |
| 基础 UI 组件库 | P0 | 8h | ⬜ |
| 卡牌数据模型定义 | P0 | 4h | ⬜ |
| 卡牌数据库 (JSON) | P0 | 16h | ⬜ |
| 基础路由和页面框架 | P0 | 8h | ⬜ |
| 状态管理搭建 | P1 | 4h | ⬜ |

**交付物**: 可运行的项目框架，能展示卡牌列表

### Phase 2: 核心分析引擎 (Week 3-4)

| 任务 | 优先级 | 预计工时 | 状态 |
|------|--------|---------|------|
| 流派数据定义 (每角色2-3个流派) | P0 | 16h | ⬜ |
| 流派匹配算法 | P0 | 12h | ⬜ |
| 选牌评分算法 | P0 | 12h | ⬜ |
| 协同度计算 | P1 | 8h | ⬜ |
| 推荐理由生成 | P1 | 8h | ⬜ |
| 算法单元测试 | P0 | 8h | ⬜ |

**交付物**: 分析引擎可独立运行，输入牌库输出流派匹配和选牌推荐

### Phase 3: 存档解析与实时模式 (Week 5-6)

| 任务 | 优先级 | 预计工时 | 状态 |
|------|--------|---------|------|
| 存档文件格式研究 | P0 | 8h | ⬜ |
| 存档解析器实现 | P0 | 12h | ⬜ |
| 文件监控 (Electron) | P0 | 8h | ⬜ |
| 文件监控 (浏览器备选) | P1 | 8h | ⬜ |
| 实时推荐 UI | P0 | 12h | ⬜ |
| 悬浮窗模式 | P1 | 8h | ⬜ |

**交付物**: 可以读取存档并实时显示选牌推荐

### Phase 4: 学习与记录 (Week 7-8)

| 任务 | 优先级 | 预计工时 | 状态 |
|------|--------|---------|------|
| 流派攻略内容编写 | P0 | 16h | ⬜ |
| 学习模式 UI | P0 | 12h | ⬜ |
| 游戏记录存储 | P0 | 8h | ⬜ |
| 时间线回放 | P1 | 12h | ⬜ |
| 回顾分析 | P1 | 8h | ⬜ |
| 选牌模拟练习 | P2 | 8h | ⬜ |

**交付物**: 完整的学习模式和游戏记录回看

### Phase 5: 打磨与发布 (Week 9-10)

| 任务 | 优先级 | 预计工时 | 状态 |
|------|--------|---------|------|
| UI/UX 打磨 | P0 | 12h | ⬜ |
| 性能优化 | P1 | 8h | ⬜ |
| E2E 测试 | P1 | 8h | ⬜ |
| Electron 打包 | P0 | 8h | ⬜ |
| GitHub Pages 部署 | P0 | 4h | ⬜ |
| README 编写 | P0 | 4h | ⬜ |
| 数据更新机制 | P1 | 8h | ⬜ |

**交付物**: 可发布的 v1.0.0 版本

---

## 23. 风险评估

### 23.1 技术风险

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|---------|
| 存档格式无法解析 | 中 | 高 | 提供手动输入牌库作为降级方案 |
| 存档格式随版本更新变化 | 高 | 中 | 设计灵活的解析器，支持多格式 |
| 浏览器无法访问本地文件 | 中 | 高 | 提供 Electron 方案或本地服务器方案 |
| 卡牌数据不准确 | 中 | 高 | 多来源交叉验证，社区反馈机制 |
| 游戏反作弊阻止文件读取 | 低 | 高 | 只读读取，不修改文件 |

### 23.2 产品风险

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|---------|
| 推荐准确度不够 | 中 | 高 | 持续优化算法，收集用户反馈 |
| 新手看不懂推荐理由 | 中 | 中 | 提供详细的新手引导 |
| 游戏更新太快，数据跟不上 | 中 | 中 | 建立社区贡献机制 |
| 用户觉得不如看攻略视频 | 低 | 中 | 强调实时性和个性化 |

### 23.3 法律风险

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|---------|
| 侵犯游戏版权 | 低 | 高 | 不使用游戏原图，只使用文字数据 |
| 存档读取违反用户协议 | 低 | 中 | 只读取，不修改，明确声明 |
| Wiki 数据版权问题 | 低 | 低 | 注明数据来源，遵守 Wiki 协议 |

---

## 24. 附录

### 24.1 术语表

| 术语 | 说明 |
|------|------|
| Archetype | 流派，一种卡牌构筑方向 |
| Combo | 组合，多张卡牌形成的配合 |
| Deck | 牌库，玩家当前拥有的所有卡牌 |
| Relic | 遗物，提供被动效果的道具 |
| Synergy | 协同，卡牌之间的配合效果 |
| Archetype Match | 流派匹配度，牌库与流派的契合程度 |
| Card Reward | 选牌奖励，战斗胜利后的选牌机会 |
| Floor | 楼层，游戏进度 |
| Act | 章节，游戏分为多个章节 |
| Boss | Boss，每章的最终敌人 |
| Elite | 精英怪，较强的敌人 |
| Draft | 选牌，构筑牌库的过程 |

### 24.2 参考资源

- [杀戮尖塔2 Wiki](https://slay-the-spire.fandom.com/wiki/Slay_the_Spire_2_Wiki)
- [杀戮尖塔2 Steam 社区](https://steamcommunity.com/app/2868840)
- [B站攻略视频 - 全英雄基础流派攻略](https://www.bilibili.com/video/BV1tyNNzxEpK/)
- [杀戮尖塔1 流派分析参考](https://baoyu.io/blog/slay-the-spire-archetypes)

### 24.3 存档路径参考

```
Windows:
  %APPDATA%\SlayTheSpire2\steam\{SteamUID}\profile1\
  %APPDATA%\SlayTheSpire2\steam\{SteamUID}\profile2\
  %APPDATA%\SlayTheSpire2\steam\{SteamUID}\profile3\

SteamUID 为 17 位数字，可在 Steam 客户端查看。
profile1/2/3 对应三个存档栏位。
```

### 24.4 存档文件结构参考

根据社区研究，杀戮尖塔2存档目录下可能包含以下文件：

```
profile1/
├── run                 # 当前运行数据 (主要解析目标)
├── run.bak             # 运行备份
├── settings            # 游戏设置
├── stats               # 统计数据
└── preferences         # 偏好设置
```

存档文件可能是以下格式之一：
- JSON 格式 (最理想)
- 自定义文本格式 (key=value)
- 二进制格式 (需要逆向)

### 24.5 卡牌数据示例 (铁甲战士)

```json
{
  "id": "ironclad_bash",
  "name": "痛击",
  "nameEn": "Bash",
  "character": "ironclad",
  "type": "attack",
  "rarity": "basic",
  "cost": 2,
  "description": "造成8点伤害。施加2层易伤。",
  "upgradedDescription": "造成10点伤害。施加3层易伤。",
  "keywords": ["vulnerable"],
  "effects": [
    { "type": "damage", "target": "enemy", "value": 8 },
    { "type": "apply_vulnerable", "target": "enemy", "value": 2 }
  ],
  "upgradeBonus": {
    "damage": 2,
    "vulnerable": 1
  },
  "tags": ["基础", "攻击", "易伤"]
}
```

### 24.6 项目目录结构

```
sts2-helper/
├── .github/              # GitHub 配置
│   └── workflows/        # CI/CD
├── data/                 # 卡牌数据库 (JSON)
├── docs/                 # 项目文档
├── electron/             # Electron 主进程
├── public/               # 静态资源
├── src/                  # 源代码
│   ├── components/       # 通用组件
│   ├── features/         # 功能模块
│   ├── hooks/            # 自定义 Hooks
│   ├── services/         # 服务层
│   ├── stores/           # 状态管理
│   ├── types/            # 类型定义
│   ├── utils/            # 工具函数
│   └── data/             # 前端数据
├── tests/                # 测试文件
├── DEV.md                # 开发文档 (本文件)
├── CHANGELOG.md          # 变更日志
├── CONTRIBUTING.md       # 贡献指南
├── README.md             # 项目说明
├── package.json          # 项目配置
├── tsconfig.json         # TypeScript 配置
├── vite.config.ts        # Vite 配置
├── tailwind.config.js    # TailwindCSS 配置
└── .eslintrc.cjs         # ESLint 配置
```

---

## 文档版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-05-03 | 初始版本 |

---

> **注意**: 本文档为开发规划文档，实际实现时可能根据具体情况调整。
> 
> 如果你有任何问题或建议，欢迎在 GitHub Issues 中提出。
