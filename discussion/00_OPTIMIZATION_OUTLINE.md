# STS2-Helper 项目优化大纲

> **汇总人**: 技术总监  
> **日期**: 2026-05-04  
> **输入**: 8份部门分析报告（前端/后端/游戏设计/QA测试/数据分析/产品/DevOps/全栈）  
> **技术栈**: React 18 + TypeScript 5 + TailwindCSS 3.4 + Zustand 5 + Vite 5  
> **代码规模**: ~5300 行 TypeScript/TSX + 25 个 JSON 数据文件  

---

## 第一部分：项目现状评估

### 1.1 项目概述

STS2-Helper（杀戮尖塔2智能选牌助手）是一款面向《杀戮尖塔2》玩家的 Web 端智能选牌辅助工具。核心价值主张是"让每一次选牌决策都有据可依"。

**产品定位**：
- **品类**: 游戏辅助工具 / 策略参考工具
- **载体**: Web 应用（GitHub Pages 静态部署）
- **核心场景**: 游戏中实时选牌辅助 + 离线学习攻略
- **差异化**: 数据驱动的智能推荐 + 流派识别 + 游戏记录复盘

**目标用户画像**：

| 用户类型 | 占比 | 痛点 | 核心需求 |
|----------|:----:|------|----------|
| 新手小白 | 50% | 面对3张可选卡牌完全不知道选哪个 | 告诉我选哪张，为什么 |
| 进阶玩家 | 30% | 了解基本流派，但想尝试新思路 | 深度流派分析、Combo发现 |
| 回归玩家 | 15% | STS2新角色、新机制不熟悉 | 快速了解STS2新角色和新机制 |
| 内容创作者 | 5% | 需要数据支撑攻略内容 | 准确的数据、可分享的图表 |

**功能模块概览**：

| 页面 | 功能 | 完成度 | 质量评级 |
|------|------|:------:|:--------:|
| 首页 (HomePage) | Hero展示 + 角色选择 + 功能入口 | 90% | ⭐⭐⭐⭐ |
| 牌库分析 (AnalyzePage) | 牌库管理 + 选牌推荐 + 统计 | 70% | ⭐⭐ |
| 学习攻略 (LearnPage) | 角色流派攻略 + Combo展示 | 60% | ⭐⭐ |
| 卡牌图鉴 (EncyclopediaPage) | 浏览/筛选/搜索卡牌 | 85% | ⭐⭐⭐⭐ |
| 选牌模拟 (SimulatorPage) | 模拟选牌场景训练 | 80% | ⭐⭐⭐ |
| 数据统计 (StatsPage) | 卡牌/流派/Combo统计 | 75% | ⭐⭐⭐ |

**关键数据统计**：

| 数据类型 | 数量 | 数据质量 |
|----------|:----:|:--------:|
| 卡牌总数 | 427张 | ⭐⭐⭐ |
| 流派定义 | 21个 | ⭐⭐（68处引用断裂） |
| Combo组合 | 19条 | ⭐⭐（42%引用断裂） |
| 遗物数据 | 59个 | ⭐⭐⭐ |
| 事件数据 | 12条 | ⭐（覆盖率24%） |
| Boss数据 | 11条 | ⭐⭐⭐⭐ |
| 关键词定义 | 21个 | ⭐⭐（缺少7个核心关键词） |

---

### 1.2 技术架构现状

**整体架构**：

```
┌─────────────────────────────────────────────────────────┐
│                    UI Layer (Pages + Components)          │
│  6个页面组件 + 4个共享组件 + 1个布局组件                    │
├─────────────────────────────────────────────────────────┤
│                    Store Layer (Zustand)                  │
│  gameStore │ recordStore │ settingsStore │ themeStore     │
├─────────────────────────────────────────────────────────┤
│                    Service Layer (业务逻辑)               │
│  cardScorer │ archetypeEngine │ saveParser               │
│  recordManager │ dataUpdater                             │
├─────────────────────────────────────────────────────────┤
│                    Data Layer (静态数据)                   │
│  cards/ │ archetypes/ │ relics/ │ combos/ │ events/      │
│  bosses/ │ keywords.ts                                    │
├─────────────────────────────────────────────────────────┤
│                    Storage Layer (持久化)                  │
│  IndexedDB (game-records) │ localStorage (settings)      │
└─────────────────────────────────────────────────────────┘
```

**技术栈详情**：

| 技术 | 版本 | 用途 | 评价 |
|------|------|------|------|
| React | 18.3.1 | UI框架 | ✅ 稳定 |
| TypeScript | 5.6.3 | 类型系统 | ⚠️ 大量any类型 |
| Vite | 5.4.11 | 构建工具 | ⚠️ 配置过于简单 |
| TailwindCSS | 3.4.16 | CSS框架 | ✅ 配置合理 |
| Zustand | 5.0.0 | 状态管理 | ⚠️ Store职责过重 |
| React Router | 6.28.0 | 路由 | ⚠️ 无代码分割 |
| Lucide React | 0.460.0 | 图标库 | ✅ Tree-shaking |

**代码规模统计**：

| 目录 | 文件数 | 代码行数 | 说明 |
|------|:------:|:--------:|------|
| pages/ | 6 | ~1898行 | 页面组件 |
| components/ | 4 | ~454行 | 共享组件 |
| stores/ | 4 | ~452行 | Zustand状态管理 |
| services/ | 5 | ~1200行 | 业务逻辑层 |
| data/ | 25 | ~1500行 | 数据层+JSON |
| types/ | 6 | ~300行 | TypeScript类型 |
| **总计** | ~50 | **~5800行** | |

---

### 1.3 代码质量评估

**代码质量评分**：

| 维度 | 评分 | 说明 |
|------|:----:|------|
| 类型安全 | 6/10 | 有良好的类型定义，但15+处any类型削弱了价值 |
| 命名规范 | 8/10 | 组件、变量命名清晰，职责描述准确 |
| 文件组织 | 7/10 | 基础结构好，缺少hooks/constants目录 |
| 代码复用 | 6/10 | 常量重复定义（5+文件），缺少通用组件 |
| 错误处理 | 5/10 | 三种不一致的错误处理模式并存 |
| 注释质量 | 8/10 | 关键逻辑有中文注释 |
| 测试覆盖 | 0/10 | 完全没有测试代码 |
| 文档完整性 | 3/10 | 无README、无CHANGELOG、无API文档 |

**主要代码质量问题**：

1. **大量any类型**：AnalyzePage.tsx中4个子组件（DeckManager、RewardTab、StatsTab等）全部使用any类型props，完全丧失TypeScript类型安全优势
2. **常量重复定义**：TYPE_ICONS、TYPE_NAMES、RARITY_NAMES等映射在5+个文件中重复定义
3. **内联子组件**：AnalyzePage.tsx内部定义了4个子组件作为内联函数，无法单独做React.memo优化
4. **内联样式过多**：大量使用`style={{ color: 'var(--text-primary)' }}`而非Tailwind类
5. **无Error Boundary**：项目没有React Error Boundary，运行时错误会导致白屏

---

### 1.4 数据完整性评估

**数据完整性是项目最严重的问题**。

**流派引用完整性**：

| 角色 | 断裂引用数 | 受影响流派 | 严重程度 |
|------|:----------:|-----------|:--------:|
| 储君 (prince) | 24处 | 全部3个流派 | 🔴 完全失效 |
| 亡灵法师 (necromancer) | 22处 | 全部3个流派 | 🔴 完全失效 |
| 观察者 (watcher) | 7处 | 3个流派 | 🟡 部分失效 |
| 静默猎人 (silent) | 6处 | 2个流派 | 🟡 部分失效 |
| 铁甲战士 (ironclad) | 5处 | 3个流派 | 🟡 部分失效 |
| 故障机器人 (defect) | 4处 | 3个流派 | 🟡 部分失效 |
| **总计** | **68处** | | |

**缺失卡牌ID清单**：

```
# prince 缺失 (8个唯一ID)
prince_succession, prince_crown_slash, prince_kingmaker,
prince_throne_room, prince_royal_guard, prince_royal_decree,
prince_tax, prince_knights_charge

# necromancer 缺失 (10个唯一ID)
necromancer_raise_dead, necromancer_undead_legion, necromancer_bone_armor,
necromancer_bone_storm, necromancer_soul_drain, necromancer_dark_pact,
necromancer_graveyard_shift, necromancer_death_coil, necromancer_phylactery

# watcher 缺失 (7个唯一ID)
watcher_indignation, watcher_prostrate, watcher_simulate_dao,
watcher_conclude, watcher_judgement, watcher_well_laid_plans,
watcher_just_lucky

# silent 缺失 (6个唯一ID)
silent_poison_cloud, silent_catalyst_power, silent_bouncing_flask,
silent_sneaky_strike, silent_expertise, silent_bullet_time

# ironclad 缺失 (5个唯一ID)
ironclad_metallicize_power, ironclad_burning_pact, ironclad_dark_pact,
ironclad_fearless_pain

# defect 缺失 (4个唯一ID)
defect_auto_shields, defect_darkness, defect_recursion, defect_core_memory
```

**Combo引用完整性**：

19条Combo中有8条（42%）引用了不存在的卡牌ID，导致`detectCombos()`函数对这些Combo永远返回`isComplete: false`。

**升级描述完整性**：

| 角色 | 总卡牌数 | 有升级描述 | 缺失率 |
|------|:--------:|:---------:|:------:|
| defect | 94 | 2 | 97.9% |
| ironclad | 80 | 3 | 96.3% |
| silent | 55 | 2 | 96.4% |
| watcher | 53 | 2 | 96.2% |
| prince | 66 | 8 | 87.9% |
| necromancer | 79 | 17 | 78.5% |
| **总计** | **427** | **34** | **92.0%** |

**卡牌描述质量问题**：

故障机器人和储君的大量卡牌`description`字段不是客观效果描述，而是社区玩家的主观评价：
- `defect_core_acceleration`: "超模爆了，前期来上一张真的美滋滋。"
- `defect_shatter`: "神中神，黑暗体系必带。"
- `prince_flow_light`: "两费跌15，垃圾。"
- `prince_charge`: "神中神，喜欢塞状态牌是吧？"

**遗物数据缺失**：

`relics/index.ts`引入了`boss.json`、`shop.json`、`event.json`，但这些文件不存在：
```typescript
import bossRelics from './boss.json'   // ENOENT
import shopRelics from './shop.json'   // ENOENT
import eventRelics from './event.json' // ENOENT
```

---

### 1.5 用户体验评估

**信息架构评估**：

当前信息架构过于扁平，6个一级导航项对新用户来说选择过多。核心功能"选牌推荐"藏在"牌库分析"页面的Tab中，路径不够突出。

**可用性问题汇总**：

| 问题 | 严重度 | 位置 | 描述 |
|------|:------:|------|------|
| 选牌输入需要卡牌ID | 🔴 高 | AnalyzePage | 新手不知道ironclad_inflame是什么 |
| 推荐理由过于笼统 | 🔴 高 | RecommendationPanel | "核心卡"不说为什么 |
| 流派数据引用断裂 | 🔴 高 | 全局 | prince/necromancer流派完全失效 |
| Modal无焦点管理 | 🟡 中 | EncyclopediaPage | Tab键会跳出弹窗 |
| 移动端无汉堡菜单 | 🟡 中 | App.tsx | 小屏导航体验差 |
| 暗色主题Modal白色 | 🟡 中 | EncyclopediaPage | 刺眼的白色背景 |
| 搜索没有防抖 | 🟡 中 | EncyclopediaPage | 每次按键都重渲染 |
| 拖拽排序未完成 | 🟢 低 | AnalyzePage | handleDrop是空函数 |
| 没有404页面 | 🟢 低 | App.tsx | 错误路径显示空白 |

**响应式设计评估**：

- 移动端导航使用`overflow-x-auto`横向滚动，没有汉堡菜单
- AnalyzePage的`lg:grid-cols-3`左右分栏在中小屏堆叠，造成大量滚动
- 卡牌网格在320px屏幕上2列可能太挤

**暗色主题评估**：

- 两个主题Store冲突（settingsStore vs themeStore）
- CardDetailModal使用硬编码`bg-white`，暗色模式下刺眼
- ComparePanel同样使用硬编码白色背景

**无障碍评估**：

- 导航链接缺少`aria-label`
- Modal缺少`role="dialog"`和`aria-modal="true"`
- 卡牌网格不支持方向键导航
- 颜色对比度部分不达标（text-text-muted在bg-warm-50上约2.8:1，低于AA标准4.5:1）

---

### 1.6 工程化评估

**构建系统**：

当前`vite.config.ts`极其精简（仅12行），没有代码分割配置、没有压缩配置、没有sourcemap配置。

**CI/CD流水线**：

当前只有部署流水线（deploy.yml），没有：
- 依赖缓存
- Lint检查
- 自动化测试
- PR检查流水线
- 安全扫描

**代码质量工具**：

| 工具 | 状态 | 说明 |
|------|:----:|------|
| ESLint | ⚠️ | 有配置但`no-explicit-any`仅warn |
| Prettier | ⚠️ | 有依赖但无.prettierrc配置文件 |
| Husky | ❌ | 无Git hooks |
| lint-staged | ❌ | 无提交前检查 |
| Commitlint | ❌ | 无commit规范 |
| TypeScript严格模式 | ⚠️ | `noUnusedLocals`和`noUnusedParameters`为false |

**依赖管理**：

项目同时存在`pnpm-lock.yaml`和`package-lock.json`，说明曾混合使用pnpm和npm。CI中使用`pnpm install`而非`pnpm install --frozen-lockfile`。

**安全防护**：

- 完全没有CSP（Content Security Policy）配置
- 没有依赖漏洞扫描
- 没有安全Headers

---

## 第二部分：问题清单（按严重程度分类）

### 2.1 P0 - 致命问题（必须立即修复）

| # | 问题 | 影响范围 | 来源报告 | 修复工作量 |
|---|------|---------|---------|:---------:|
| P0-01 | 流派引用68处断裂卡牌ID | prince/necromancer流派完全失效，其他角色部分失效 | 游戏设计/数据/全栈 | 2天 |
| P0-02 | 42%的Combo引用不存在的卡牌 | Combo检测对8个Combo永远返回false | 游戏设计/数据 | 1天 |
| P0-03 | 故障机器人/储君卡牌描述包含主观评价 | 工具专业性受损，新玩家困惑 | 游戏设计/数据 | 1天 |
| P0-04 | 遗物数据文件缺失（boss.json/shop.json/event.json） | 遗物池不完整，影响遗物推荐准确性 | 游戏设计/后端 | 1天 |
| P0-05 | 双主题Store冲突（settingsStore vs themeStore） | 暗色模式状态不一致 | 前端/后端/全栈 | 2小时 |
| P0-06 | IndexedDB读写分离导致并发数据丢失 | 记录数据不一致 | 后端/全栈 | 4小时 |
| P0-07 | X费牌(cost=-1)费用曲线计算错误 | 费用分析偏差 | 数据/后端 | 1小时 |
| P0-08 | 92%卡牌缺少升级描述 | 用户无法了解升级后效果变化 | 游戏设计/数据 | 持续 |

**P0问题详细分析**：

**P0-01 流派引用断裂**：这是整个项目最严重的数据完整性问题。储君和亡灵法师的所有流派定义引用了在卡牌数据中完全不存在的卡牌ID。这导致：
- `matchArchetype()`函数对这两个角色完全失效
- `identifyArchetypes()`返回空结果
- 选牌推荐中25%权重的"流派适配"维度恒为0
- Combo检测对这些角色完全失效

**P0-05 双主题Store冲突**：`settingsStore`和`themeStore`都管理主题状态，但：
- `settingsStore`支持`'system'`选项但`themeStore`不支持
- 两处状态不同步
- 代码中没有实际使用`useSettingsStore`的主题功能

**P0-06 IndexedDB并发问题**：`addDecision`方法的读取和写入是两个独立事务：
```typescript
async addDecision(recordId, decision) {
  const record = await this.getRecord(recordId)  // 事务1: 读
  record.decisions.push(decision)
  await this.saveRecord(record)  // 事务2: 写
}
```
并发场景下后写入的会覆盖先写入的。

---

### 2.2 P1 - 严重问题（近期修复）

| # | 问题 | 影响范围 | 来源报告 | 修复工作量 |
|---|------|---------|---------|:---------:|
| P1-01 | 无代码分割，首屏加载全部页面 | 首屏加载减少40-60% | 前端/DevOps/全栈 | 4小时 |
| P1-02 | 大量any类型（15+处） | 类型安全丧失 | 前端/全栈 | 1天 |
| P1-03 | 常量定义跨5+文件重复 | 维护成本高 | 前端/全栈 | 2小时 |
| P1-04 | 协同度计算重复（2套不同算法） | 评分不一致 | 后端/数据/全栈 | 4小时 |
| P1-05 | gameStore级联更新触发两次渲染 | 性能问题 | 前端/后端/全栈 | 4小时 |
| P1-06 | 协同度O(n²)算法 | 大牌库卡顿 | 后端/数据/全栈 | 4小时 |
| P1-07 | EncyclopediaPage无列表虚拟化 | 图鉴页面渲染性能差 | 前端/全栈 | 4小时 |
| P1-08 | 无Error Boundary | 运行时错误白屏 | 全栈 | 2小时 |
| P1-09 | Modal缺少焦点管理和ARIA | 无障碍不达标 | 前端 | 4小时 |
| P1-10 | 移动端无汉堡菜单 | 移动端体验差 | 前端/产品 | 4小时 |
| P1-11 | 流派权重全部相同（21个流派） | 推荐准确性 | 数据/游戏设计 | 2小时 |
| P1-12 | recordManager全量加载所有记录 | 内存占用增长 | 后端/全栈 | 4小时 |
| P1-13 | 推荐理由过于笼统 | 用户体验差 | 产品/游戏设计 | 1周 |
| P1-14 | 搜索无防抖 | 搜索体验差 | 前端/全栈 | 1小时 |
| P1-15 | 拖拽排序半成品 | 代码质量 | 前端 | 4小时 |

**P1问题详细分析**：

**P1-01 无代码分割**：所有6个页面组件在首次加载时全部打包进一个chunk。用户只访问首页时，其他5个页面的代码也被下载和解析。优化后首屏传输量可减少约62%。

**P1-04 协同度计算重复**：`cardScorer.ts`的`calcCardSynergy`和`archetypeEngine.ts`的`calcDeckSynergyScore`使用完全不同的算法：
- `calcCardSynergy`：单卡vs牌库，按tag匹配数×12累加
- `calcDeckSynergyScore`：牌库内所有卡对，按"有共同tag的卡对比例"

这会导致同一牌库在不同上下文中得到不同的协同度评分。

**P1-06 协同度O(n²)算法**：对于30张牌的牌库，需要435次比较，每次比较涉及`Array.filter`+`Array.includes`。建议使用tag倒排索引将复杂度降为O(n×t)。

**P1-11 流派权重相同**：所有21个流派使用完全相同的评分权重（coreCardMatch: 0.35, importantCardMatch: 0.25等），丧失了流派差异化。例如"无限流"应该极度重视costCurveMatch，但只分配了5%。

---

### 2.3 P2 - 中等问题（中期优化）

| # | 问题 | 影响范围 | 来源报告 | 修复工作量 |
|---|------|---------|---------|:---------:|
| P2-01 | 无测试代码（0%覆盖率） | 回归风险高 | QA/DevOps | 持续 |
| P2-02 | 缺少hooks/和constants/目录 | 代码组织 | 前端/全栈 | 2小时 |
| P2-03 | 数据层JSON无运行时校验 | 数据安全 | 全栈 | 4小时 |
| P2-04 | cardScorer硬编码遗物协同规则 | 可扩展性差 | 后端/数据 | 4小时 |
| P2-05 | 缺少404页面 | 用户体验 | 前端 | 1小时 |
| P2-06 | LearnPage使用内部状态代替路由 | SEO/分享 | 前端 | 4小时 |
| P2-07 | `noUnusedLocals`和`noUnusedParameters`为false | 代码质量 | DevOps | 1小时 |
| P2-08 | 事件数据仅12条，覆盖率24% | 功能完整性 | 游戏设计/数据 | 持续 |
| P2-09 | 缺失7个核心关键词定义 | 教学价值 | 游戏设计 | 2小时 |
| P2-10 | 遗物数据缺少boss/shop/event类型 | 遗物推荐 | 游戏设计/数据 | 持续 |
| P2-11 | comboData与archetype.combos数据源重复 | 数据一致性 | 全栈 | 2小时 |
| P2-12 | localStorage缓存无LRU淘汰 | 存储溢出风险 | 后端 | 2小时 |
| P2-13 | IndexedDB无版本迁移框架 | 数据库升级困难 | 后端 | 4小时 |
| P2-14 | settingsStore手动持久化模式冗余 | 代码质量 | 前端/后端 | 2小时 |
| P2-15 | 卡牌重名（4组） | 用户体验 | 数据 | 2小时 |
| P2-16 | 颜色对比度不足 | 无障碍 | 前端 | 2小时 |
| P2-17 | 粒子动画低端设备性能 | 性能 | 前端 | 2小时 |

---

### 2.4 P3 - 低优先级（长期改进）

| # | 问题 | 影响范围 | 来源报告 | 修复工作量 |
|---|------|---------|---------|:---------:|
| P3-01 | 无PWA/Service Worker | 离线能力 | 全栈/DevOps | 1天 |
| P3-02 | 无国际化框架 | 多语言支持 | 前端/产品 | 2天 |
| P3-03 | 无Web Worker | 重计算性能 | 后端/全栈 | 1天 |
| P3-04 | 无CI/CD流水线 | 开发效率 | DevOps | 4小时 |
| P3-05 | 无数据版本管理和回滚机制 | 数据安全 | 数据/DevOps | 1天 |
| P3-06 | 无多设备同步 | 用户体验 | 后端 | 3天 |
| P3-07 | 无社区数据贡献机制 | 数据质量 | 产品 | 5天 |
| P3-08 | 无A/B测试框架 | 算法优化 | 数据 | 3天 |
| P3-09 | 无README/CHANGELOG/CONTRIBUTING | 项目文档 | DevOps | 2小时 |
| P3-10 | 无CSP和安全Headers | 安全 | DevOps | 2小时 |
| P3-11 | 无Lighthouse CI | 性能监控 | DevOps | 2小时 |
| P3-12 | 无CHANGELOG自动生成 | 发布管理 | DevOps | 2小时 |
| P3-13 | 搜索快捷键(/) | 无障碍 | 前端 | 1小时 |
| P3-14 | 统计图表组件抽象 | 代码复用 | 前端 | 4小时 |
| P3-15 | 性能监控集成 | 持续优化 | DevOps | 4小时 |

---

## 第三部分：详细优化方案

### 3.1 数据层优化

#### 3.1.1 修复断裂引用（68处）

**问题描述**：流派定义中的卡牌ID在卡牌数据中不存在，导致流派匹配算法完全失效。

**修复方案**：

**方案A：补充缺失卡牌数据（推荐）**

为每个缺失的卡牌ID创建完整的卡牌数据条目。需要从游戏Wiki或社区数据源获取准确的卡牌信息。

```typescript
// 示例：补充 prince_succession 卡牌数据
// 文件：src/data/cards/prince.json
{
  "id": "prince_succession",
  "name": "继承",
  "nameEn": "Succession",
  "character": "prince",
  "type": "power",
  "rarity": "uncommon",
  "cost": 2,
  "description": "获得1点辉星。每回合开始时获得1点辉星。",
  "keywords": ["star"],
  "tags": ["辉星", "能力", "王权"],
  "upgradedDescription": "获得2点辉星。每回合开始时获得1点辉星。"
}
```

**方案B：修复流派定义引用（降级方案）**

如果无法获取准确的卡牌数据，将流派中的引用修改为实际存在的卡牌ID。

```typescript
// 示例：修复 ironclad_exhaust 流派
// 文件：src/data/archetypes/ironclad.json
{
  "id": "ironclad_exhaust",
  "coreCards": [
    // 原引用 ironclad_burning_pact（不存在）
    // 修改为实际存在的卡牌
    { "cardId": "ironclad_dark_embrace", "weight": 90, "isCore": true, "reason": "消耗引擎核心" },
    { "cardId": "ironclad_feel_no_pain", "weight": 85, "isCore": true, "reason": "消耗触发防御" },
    { "cardId": "ironclad_corruption", "weight": 80, "isCore": true, "reason": "技能牌消耗化" }
  ]
}
```

**执行步骤**：

1. 运行数据验证脚本，生成完整的断裂引用清单
2. 对每个缺失ID，确认其是否为游戏中的真实卡牌
3. 如果是真实卡牌：从Wiki采集数据，补充到对应角色的JSON文件
4. 如果是错误引用：修改流派/Combo定义，使用正确的卡牌ID
5. 运行数据验证脚本确认修复完成

**验证脚本**：

```typescript
// scripts/validate-references.ts
import { getAllCards } from '../src/data/cards'
import { getAllArchetypes } from '../src/data/archetypes'
import { getAllCombos } from '../src/data/combos'

function validateReferences() {
  const cardIds = new Set(getAllCards().map(c => c.id))
  const issues: string[] = []

  // 检查流派引用
  for (const archetype of getAllArchetypes()) {
    for (const cw of [...archetype.coreCards, ...archetype.importantCards, ...archetype.supportCards]) {
      if (!cardIds.has(cw.cardId)) {
        issues.push(`流派 ${archetype.name} 引用了不存在的卡牌: ${cw.cardId}`)
      }
    }
  }

  // 检查Combo引用
  for (const combo of getAllCombos()) {
    for (const cardId of combo.cards) {
      if (!cardIds.has(cardId)) {
        issues.push(`Combo ${combo.name} 引用了不存在的卡牌: ${cardId}`)
      }
    }
  }

  return issues
}
```

**工时估算**：2天（数据采集1天 + 验证修复1天）

---

#### 3.1.2 补充缺失卡牌数据

**问题描述**：6个角色的卡牌数据存在缺失，需要从官方Wiki或游戏数据文件补充。

**需要补充的数据**：

| 角色 | 缺失卡牌数 | 数据来源 | 优先级 |
|------|:----------:|---------|:------:|
| prince | 8张 | 官方Wiki | P0 |
| necromancer | 10张 | 官方Wiki | P0 |
| watcher | 7张 | 官方Wiki | P0 |
| silent | 6张 | 官方Wiki | P0 |
| ironclad | 5张 | 官方Wiki | P0 |
| defect | 4张 | 官方Wiki | P0 |

**数据采集流程**：

```
1. 从官方Wiki获取卡牌列表
2. 提取卡牌属性（名称、费用、类型、稀有度、描述）
3. 转换为项目JSON格式
4. 补充tags和keywords字段
5. 运行数据验证脚本
6. 人工审核确认
```

**数据验证规则**：

```typescript
function validateCard(card: Card): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // 必填字段检查
  if (!card.id) errors.push('缺少ID')
  if (!card.name) errors.push('缺少名称')
  if (card.cost === undefined) errors.push('缺少费用')

  // ID格式检查
  if (!card.id.startsWith(card.character + '_')) {
    errors.push(`ID ${card.id} 不匹配角色 ${card.character}`)
  }

  // 费用范围检查
  if (card.cost < -1 || card.cost > 5) {
    warnings.push(`费用 ${card.cost} 可能异常`)
  }

  // 升级描述检查
  if (!card.upgradedDescription) {
    warnings.push(`缺少升级描述`)
  }

  return { isValid: errors.length === 0, errors, warnings }
}
```

**工时估算**：1天

---

#### 3.1.3 修复卡牌描述质量

**问题描述**：故障机器人和储君的大量卡牌description字段包含主观评价而非客观效果描述。

**需要修复的卡牌**：

| 角色 | 受影响卡牌数 | 示例 |
|------|:----------:|------|
| defect | ~15张 | "超模爆了"、"神中神"、"感觉这个比一代要拉了" |
| prince | ~10张 | "两费跌15，垃圾"、"神中神" |

**修复方案**：

```typescript
// 修复前
{
  "id": "defect_core_acceleration",
  "description": "超模爆了，前期来上一张真的美滋滋。"
}

// 修复后
{
  "id": "defect_core_acceleration",
  "description": "将手牌中所有技能牌的费用降低1点，持续到回合结束。"
}
```

**执行步骤**：

1. 筛选所有description包含主观评价词汇的卡牌
2. 从Wiki获取客观的卡牌效果描述
3. 替换description字段
4. 验证修复结果

**工时估算**：1天

---

#### 3.1.4 补充升级描述

**问题描述**：92%的卡牌缺少upgradedDescription字段，用户无法了解升级后的效果变化。

**当前状态**：

| 角色 | 总卡牌数 | 有升级描述 | 缺失率 |
|------|:--------:|:---------:|:------:|
| defect | 94 | 2 | 97.9% |
| ironclad | 80 | 3 | 96.3% |
| silent | 55 | 2 | 96.4% |
| watcher | 53 | 2 | 96.2% |
| prince | 66 | 8 | 87.9% |
| necromancer | 79 | 17 | 78.5% |

**补充策略**：

1. **优先补充高使用率卡牌**：核心卡、重要卡优先补充
2. **批量采集**：从Wiki批量获取升级描述数据
3. **格式统一**：确保升级描述与基础描述格式一致

**目标**：第一阶段达到50%覆盖率（214张），第二阶段达到80%覆盖率（342张）。

**工时估算**：持续进行，每周补充一批

---

#### 3.1.5 补充事件数据

**问题描述**：事件数据仅12条，覆盖率约24%，远不能覆盖游戏实际内容。

**当前事件数据**：

| 章节 | 事件数量 | 数据质量 | 评价 |
|------|:--------:|---------|------|
| 第一章 | 8 | ⭐⭐⭐⭐ | 覆盖主要事件 |
| 第二章 | 3 | ⭐⭐ | 严重不足 |
| 第三章 | 1 | ⭐ | 几乎空白 |

**补充方案**：

```json
// 补充后的事件数据结构
{
  "id": "forgotten_altar",
  "name": "被遗忘的祭坛",
  "act": 2,
  "description": "你发现了一座被遗忘的祭坛，上面刻满了古老的符文。",
  "options": [
    {
      "id": "pray",
      "text": "祈祷",
      "results": [
        { "type": "max_hp", "value": 10 },
        { "type": "gold", "value": -50 }
      ],
      "advice": "如果你的生命值充足，这是值得的选择"
    },
    {
      "id": "desecrate",
      "text": "亵渎",
      "results": [
        { "type": "remove_card", "value": 1 },
        { "type": "curse", "value": 1 }
      ],
      "advice": "移除一张牌但获得诅咒，需要权衡"
    }
  ]
}
```

**目标**：补充到50+事件，覆盖三个章节的主要事件。

**工时估算**：持续进行，每周补充一批

---

#### 3.1.6 建立数据验证CI/CD

**问题描述**：当前没有自动化的数据验证机制，数据质量问题难以及时发现。

**验证脚本设计**：

```typescript
// scripts/validate-data.ts
interface ValidationReport {
  timestamp: string
  totalChecks: number
  passed: number
  failed: number
  warnings: number
  issues: ValidationIssue[]
}

interface ValidationIssue {
  severity: 'error' | 'warning'
  category: 'reference' | 'format' | 'completeness' | 'consistency'
  message: string
  file?: string
  line?: number
}

const CHECKS = [
  // 引用完整性
  '所有流派引用的cardId必须存在于cards数据中',
  '所有Combo引用的cardId必须存在于cards数据中',
  '遗物引用的characterId必须有效',

  // 格式校验
  '卡牌ID格式: {character}_{name}',
  'cost值必须在[-1, 5]范围内',
  'type必须为attack/skill/power之一',
  'rarity必须为basic/common/uncommon/rare/special之一',
  'tags和keywords必须为非空数组',

  // 完整性检查
  '每个角色至少有basic牌（Strike, Defend等）',
  '升级描述建议填写率 > 50%',

  // 一致性检查
  '卡牌ID不允许重复',
  '流派ID不允许重复',
  '遗物ID不允许重复',
]
```

**CI集成**：

```yaml
# .github/workflows/data-validation.yml
name: Data Validation

on:
  push:
    paths:
      - 'src/data/**'
  pull_request:
    paths:
      - 'src/data/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm validate-data
```

**工时估算**：4小时

---

### 3.2 算法层优化

#### 3.2.1 评分算法改进

**问题描述**：当前评分算法存在多个问题：基础强度区分度不足、流派适配权重相同、协同度算法过于简单。

**改进方案1：差异化流派权重**

```typescript
// 当前：所有流派使用相同权重
const weights = {
  coreCardMatch: 0.35,
  importantCardMatch: 0.25,
  supportCardMatch: 0.10,
  ratioMatch: 0.10,
  costCurveMatch: 0.05,
  synergyBonus: 0.15,
}

// 改进：每个流派定义独立权重
// ironclad_strength.json
{
  "scoringWeights": {
    "coreCardMatch": 0.30,     // 力量流核心卡重要但不是唯一
    "importantCardMatch": 0.20,
    "supportCardMatch": 0.10,
    "ratioMatch": 0.15,        // 攻击比例很重要
    "costCurveMatch": 0.05,
    "synergyBonus": 0.20       // 力量协同很重要
  }
}

// ironclad_infinite.json
{
  "scoringWeights": {
    "coreCardMatch": 0.40,     // 无限流核心卡极度重要
    "importantCardMatch": 0.25,
    "supportCardMatch": 0.05,
    "ratioMatch": 0.05,
    "costCurveMatch": 0.20,    // 费用曲线极其关键
    "synergyBonus": 0.05
  }
}
```

**改进方案2：改进baseStrength计算**

```typescript
// 当前：基础分50过高，区分度不足
function calcBaseStrength(card, floor): number {
  let s = 50  // 基础分50
  // ...
  return Math.min(100, s)
}

// 改进：降低基础分，增加区分度
function calcBaseStrength(card: Card): number {
  let s = 30  // 降低基础分

  // 稀有度加成（更精细的梯度）
  const rarityBonus = { basic: 0, common: 5, uncommon: 15, rare: 25, special: 30 }
  s += rarityBonus[card.rarity] || 0

  // 费用效率（非线性递减）
  if (card.cost === 0) s += 15
  else if (card.cost === 1) s += 10
  else if (card.cost === 2) s += 5
  // 3+费不加分

  // 关键词丰富度（最多+15）
  s += Math.min(card.keywords.length * 3, 15)

  // Tag丰富度（最多+10）
  s += Math.min(card.tags.length * 2, 10)

  return Math.min(100, s)
}
```

**改进方案3：引入Tag权重体系**

```typescript
// 为tag定义协同权重
const TAG_SYNERGY_WEIGHTS: Record<string, number> = {
  '攻击': 0.3,    // 粗粒度tag，低权重
  '防御': 0.3,
  '电球': 1.5,    // 精确tag，高权重
  '中毒': 1.5,
  '消耗': 1.2,
  '力量': 1.3,
  '过牌': 0.8,
  '辉星': 1.5,
  '灾厄': 1.5,
  '铸造': 1.3,
}

function calcWeightedSynergy(cardA: Card, cardB: Card): number {
  const commonTags = cardA.tags.filter(t => cardB.tags.includes(t))
  return commonTags.reduce((sum, tag) => sum + (TAG_SYNERGY_WEIGHTS[tag] || 1.0), 0)
}
```

**工时估算**：1天

---

#### 3.2.2 流派匹配算法改进

**问题描述**：当前流派匹配算法存在遗物加分游离于权重体系之外、牌型比例计算分母问题、X费牌费用曲线计算错误等问题。

**修复1：遗物加分纳入权重体系**

```typescript
// 当前：relicBonus直接加到总分，不受权重控制
const totalScore = Math.round(
  coreCardScore * w.coreCardMatch +
  // ...
  relicBonus  // 游离于权重体系之外
)

// 改进：遗物加分纳入权重体系
const totalScore = Math.round(
  coreCardScore * w.coreCardMatch +
  importantCardScore * w.importantCardMatch +
  supportCardScore * w.supportCardMatch +
  ratioScore * w.ratioMatch +
  costCurveScore * w.costCurveMatch +
  synergyScore * w.synergyBonus +
  relicScore * (w.relicBonus || 0.10)  // 纳入权重体系
)
```

**修复2：牌型比例计算分母修正**

```typescript
// 当前：分母包含所有类型（包括status和curse）
function calcDeckRatio(deck) {
  const total = deck.length || 1
  return { attack: atk / total, skill: sk / total, power: pw / total }
}

// 改进：分母只包含attack/skill/power三种类型
function calcDeckRatio(deck: DeckCard[]): { attack: number; skill: number; power: number } {
  const cards = resolveDeckCards(deck)
  const counts = { attack: 0, skill: 0, power: 0 }
  for (const card of cards) {
    if (card.type in counts) counts[card.type as keyof typeof counts]++
  }
  const total = counts.attack + counts.skill + counts.power || 1
  return {
    attack: counts.attack / total,
    skill: counts.skill / total,
    power: counts.power / total,
  }
}
```

**修复3：X费牌费用曲线计算**

```typescript
// 当前：cost=-1被映射到curve[0]（0费位置），这是错误的
const idx = card.cost >= 3 ? 3 : card.cost  // -1 映射到 curve[-1] → undefined

// 改进：增加第5位专门处理X费
function calcCostCurve(deck: DeckCard[]): number[] {
  const curve = [0, 0, 0, 0, 0]  // [0费, 1费, 2费, 3+费, X费]
  for (const dc of deck) {
    const card = getCardById(dc.cardId)
    if (!card) continue
    if (card.cost === -1) curve[4]++  // X费单独统计
    else if (card.cost >= 3) curve[3]++
    else curve[card.cost]++
  }
  const total = deck.length || 1
  return curve.map(v => v / total)
}
```

**工时估算**：4小时

---

#### 3.2.3 协同度计算改进

**问题描述**：当前有两套不同的协同度算法，导致评分不一致。算法复杂度为O(n²)，效率不高。

**统一算法**：

```typescript
// src/utils/deckUtils.ts - 统一协同度计算
export function calcDeckSynergy(deck: DeckCard[]): number {
  const tagCount = new Map<string, number>()
  const cards = resolveDeckCards(deck)

  for (const card of cards) {
    for (const tag of card.tags) {
      tagCount.set(tag, (tagCount.get(tag) || 0) + 1)
    }
  }

  let sharedTags = 0
  for (const count of tagCount.values()) {
    if (count >= 2) sharedTags++
  }

  return tagCount.size > 0 ? (sharedTags / tagCount.size) * 100 : 0
}
```

**优化后复杂度**：O(n×t)，其中n为牌库大小，t为平均tag数量。对于30张牌的牌库，约90次操作（vs原来的435次）。

**cardScorer中的协同度计算**：

```typescript
// 统一使用calcDeckSynergy
function calcCardSynergy(cardId: string, deck: DeckCard[]): number {
  const card = getCardById(cardId)
  if (!card) return 0

  // 计算加入这张卡后的协同度
  const newDeck = [...deck, { cardId, upgraded: false }]
  const newSynergy = calcDeckSynergy(newDeck)
  const currentSynergy = calcDeckSynergy(deck)

  // 返回协同度增量
  return Math.min(100, Math.max(0, newSynergy - currentSynergy) * 5 + 50)
}
```

**工时估算**：4小时

---

#### 3.2.4 遗物协同改进

**问题描述**：当前遗物协同检测过于表面化，只检查标签匹配，没有检测真正的遗物-卡牌协同。

**改进方案**：

```typescript
// 定义遗物-卡牌协同规则
const RELIC_CARD_SYNERGIES: RelicCardSynergy[] = [
  {
    relicId: 'relic_dead_branch',
    condition: (card) => card.keywords.includes('exhaust'),
    bonus: 25,
    reason: '死灵之枝：每消耗一张牌获得随机牌'
  },
  {
    relicId: 'relic_charon_ashes',
    condition: (card) => card.keywords.includes('exhaust'),
    bonus: 20,
    reason: '卡戎之灰：每消耗一张牌AOE 3'
  },
  {
    relicId: 'relic_tungsten_rod',
    condition: (card) => card.cost === 0,
    bonus: 15,
    reason: '钨钢棒：0费牌更灵活'
  },
  {
    relicId: 'relic_shuriken',
    condition: (card) => card.type === 'attack',
    bonus: 10,
    reason: '手里剑：每3张攻击牌获得力量'
  },
]

function calcRelicSynergy(cardId: string, relics: OwnedRelic[]): number {
  const card = getCardById(cardId)
  if (!card) return 0

  let synergy = 0
  for (const owned of relics) {
    // 基础标签匹配
    const relic = getRelicById(owned.relicId)
    if (!relic) continue
    const commonTags = card.tags.filter(t => relic.tags.includes(t))
    synergy += commonTags.length * 15

    // 特殊协同检测
    for (const rule of RELIC_CARD_SYNERGIES) {
      if (rule.relicId === owned.relicId && rule.condition(card)) {
        synergy += rule.bonus
      }
    }
  }

  return Math.min(100, synergy)
}
```

**工时估算**：4小时

---

### 3.3 前端架构优化

#### 3.3.1 代码分割

**问题描述**：所有6个页面组件在首次加载时全部打包进一个chunk，首屏加载过重。

**实施方案**：

```tsx
// src/App.tsx - 添加React.lazy代码分割
import { lazy, Suspense } from 'react'

const HomePage = lazy(() => import('./pages/HomePage'))
const AnalyzePage = lazy(() => import('./pages/AnalyzePage'))
const LearnPage = lazy(() => import('./pages/LearnPage'))
const EncyclopediaPage = lazy(() => import('./pages/EncyclopediaPage'))
const SimulatorPage = lazy(() => import('./pages/SimulatorPage'))
const StatsPage = lazy(() => import('./pages/StatsPage'))

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/analyze" element={<AnalyzePage />} />
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/encyclopedia" element={<EncyclopediaPage />} />
          <Route path="/simulator" element={<SimulatorPage />} />
          <Route path="/stats" element={<StatsPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
```

```typescript
// vite.config.ts - 添加manualChunks
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-react': ['react', 'react-dom', 'react-router-dom'],
        'vendor-zustand': ['zustand'],
        'vendor-icons': ['lucide-react'],
      }
    }
  }
}
```

**预期效果**：
- 首屏加载减少40-60%
- 首屏JS从~200KB降至~73KB
- 首屏CSS从~50KB降至~12KB

**工时估算**：4小时

---

#### 3.3.2 组件拆分

**问题描述**：AnalyzePage.tsx过于臃肿（363行），内部定义了4个子组件作为内联函数。

**拆分方案**：

```
src/
├── pages/AnalyzePage.tsx          # 主页面，负责Tab切换和布局
├── components/analyze/
│   ├── DeckManager.tsx            # 牌库管理Tab
│   ├── RewardAnalyzer.tsx         # 选牌推荐Tab
│   ├── DeckStats.tsx              # 牌库统计Tab
│   ├── DeckQuickView.tsx          # 右侧牌库速览
│   ├── FloorBadge.tsx             # 楼层标签
│   └── GroupToggle.tsx            # 分组切换按钮
```

**接口定义**：

```typescript
// src/components/analyze/DeckManager.tsx
interface DeckManagerProps {
  filtered: Card[]
  deck: DeckCard[]
  search: string
  setSearch: (s: string) => void
  addCard: (id: string) => void
  removeCard: (id: string) => void
  groupMode: 'type' | 'cost' | 'rarity'
  setGroupMode: (m: 'type' | 'cost' | 'rarity') => void
  groupedDeck: Record<string, DeckCardWithInfo[]>
  dragId: string | null
  handleDragStart: (id: string) => void
  handleDragOver: (e: React.DragEvent) => void
  handleDrop: (id: string) => void
}

export function DeckManager({ filtered, deck, search, ... }: DeckManagerProps) {
  // ...
}
```

**工时估算**：4小时

---

#### 3.3.3 类型安全

**问题描述**：项目中有15+处any类型，完全丧失了TypeScript的类型安全优势。

**修复清单**：

| 文件 | 位置 | 当前类型 | 修复方案 |
|------|------|---------|---------|
| AnalyzePage.tsx | DeckManager props | `any` | 定义`DeckManagerProps`接口 |
| AnalyzePage.tsx | RewardTab props | `any` | 定义`RewardTabProps`接口 |
| AnalyzePage.tsx | StatsTab props | `{ stats: any; deck: any[] }` | 定义精确类型 |
| AnalyzePage.tsx | onChange事件 | `(e: any)` | `(e: React.ChangeEvent<HTMLInputElement>)` |
| 多个文件 | TYPE_ICONS | `Record<string, string>` | `Record<CardType, string>` |
| 多个文件 | TYPE_NAMES | `Record<string, string>` | `Record<CardType, string>` |

**工时估算**：1天

---

#### 3.3.4 状态管理优化

**问题描述**：gameStore承担过多职责，每次addCard/removeCard触发5个分析函数，两次set()调用。

**优化方案**：

```typescript
// 优化前：两次set()，5个独立分析
addCard: (cardId) => {
  const { deck, character, relics } = get()
  const newDeck = [...deck, { cardId, upgraded: false }]
  set({ deck: newDeck })  // 第1次渲染
  if (character) {
    set({
      archetypes: identifyArchetypes(newDeck, character, relics),
      deckHealth: analyzeDeckHealth(newDeck),
      costCurve: analyzeCostCurve(newDeck),
      combatBalance: analyzeCombatBalance(newDeck),
      combos: detectCombos(newDeck, character),
    })  // 第2次渲染
  }
}

// 优化后：单次set()，合并分析
addCard: (cardId) => {
  const { deck, character, relics } = get()
  const newDeck = [...deck, { cardId, upgraded: false }]

  if (character) {
    const analysis = computeFullAnalysis(newDeck, character, relics)
    set({ deck: newDeck, ...analysis })  // 单次渲染
  } else {
    set({ deck: newDeck })
  }
}
```

**computeFullAnalysis函数**：

```typescript
// src/services/analysisService.ts
export function computeFullAnalysis(
  deck: DeckCard[],
  character: CharacterId,
  relics: OwnedRelic[]
) {
  // 共享中间数据
  const cardCache = new Map<string, Card>()
  const tagIndex = new Map<string, number>()
  const typeCount = { attack: 0, skill: 0, power: 0 }
  let totalCost = 0

  for (const dc of deck) {
    const card = getCardById(dc.cardId)
    if (!card) continue
    cardCache.set(dc.cardId, card)
    if (card.type in typeCount) typeCount[card.type as keyof typeof typeCount]++
    totalCost += card.cost
    for (const tag of card.tags) {
      tagIndex.set(tag, (tagIndex.get(tag) || 0) + 1)
    }
  }

  return {
    archetypes: identifyArchetypesWithCache(deck, character, relics, cardCache),
    deckHealth: analyzeDeckHealthWithCache(deck, cardCache, tagIndex, typeCount),
    costCurve: analyzeCostCurveWithCache(deck, cardCache),
    combatBalance: analyzeCombatBalanceWithCache(deck, cardCache, typeCount),
    combos: detectCombos(deck, character),
  }
}
```

**工时估算**：4小时

---

#### 3.3.5 响应式设计

**问题描述**：移动端导航缺失、AnalyzePage移动端布局差、卡牌网格最小宽度不足。

**改进方案1：移动端汉堡菜单**

```tsx
// src/components/layout/MobileNav.tsx
function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2"
        aria-label="菜单"
        aria-expanded={open}
      >
        <div className={open ? 'hamburger-open' : ''}>
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </div>
      </button>

      {open && (
        <div className="absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-lg border-b border-warm-200 shadow-lg mobile-menu-enter">
          <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-2">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-xl text-base font-medium"
              >
                {item.icon} {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

**改进方案2：AnalyzePage移动端Tab布局**

```tsx
// 移动端使用Tab切换代替左右分栏
<div className="lg:grid lg:grid-cols-3 lg:gap-6">
  <div className="lg:col-span-2">
    {/* 主内容区：移动端全宽，桌面端2/3 */}
    <Tab.Group>
      <Tab.List className="flex lg:hidden mb-4">
        <Tab>牌库管理</Tab>
        <Tab>选牌推荐</Tab>
        <Tab>牌库统计</Tab>
      </Tab.List>
      <Tab.Panels>
        <Tab.Panel><DeckManager ... /></Tab.Panel>
        <Tab.Panel><RewardAnalyzer ... /></Tab.Panel>
        <Tab.Panel><DeckStats ... /></Tab.Panel>
      </Tab.Panels>
    </Tab.Group>
  </div>
  <div className="lg:col-span-1">
    {/* 侧边栏：桌面端显示，移动端折叠 */}
    <ArchetypePanel ... />
  </div>
</div>
```

**工时估算**：1天

---

#### 3.3.6 暗色主题

**问题描述**：双主题Store冲突、Modal暗色模式不完整、手动覆盖方式维护成本高。

**改进方案1：统一主题Store**

```typescript
// 删除themeStore.ts，在settingsStore中统一管理
// 或保留themeStore并扩展支持'system'选项

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system' as ThemeMode,
      resolvedTheme: 'light' as 'light' | 'dark',

      setTheme: (theme) => {
        set({ theme })
        const resolved = resolveTheme(theme)
        set({ resolvedTheme: resolved })
        applyTheme(resolved)
      },

      initTheme: () => {
        const { theme } = get()
        const resolved = resolveTheme(theme)
        set({ resolvedTheme: resolved })
        applyTheme(resolved)

        if (theme === 'system') {
          const mq = window.matchMedia('(prefers-color-scheme: dark)')
          mq.addEventListener('change', () => {
            if (get().theme === 'system') {
              const newResolved = mq.matches ? 'dark' : 'light'
              set({ resolvedTheme: newResolved })
              applyTheme(newResolved)
            }
          })
        }
      },
    }),
    { name: 'sts2-theme' }
  )
)
```

**改进方案2：CSS变量映射到Tailwind**

```typescript
// tailwind.config.js
colors: {
  text: {
    primary: 'var(--text-primary)',
    secondary: 'var(--text-secondary)',
    muted: 'var(--text-muted)',
  },
  bg: {
    primary: 'var(--bg-primary)',
    secondary: 'var(--bg-secondary)',
    card: 'var(--bg-card)',
  }
}
```

这样切换`.dark`类时变量值变化，无需手动覆盖每个Tailwind类。

**工时估算**：4小时

---

#### 3.3.7 无障碍

**问题描述**：Modal缺少焦点管理、导航缺少ARIA标签、颜色对比度不足。

**改进方案1：Modal焦点管理**

```tsx
// src/components/ui/Modal.tsx
function Modal({ children, onClose, title }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 打开时自动聚焦
    modalRef.current?.focus()

    // ESC关闭
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  // 焦点陷阱
  useEffect(() => {
    const modal = modalRef.current
    if (!modal) return

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus()
          e.preventDefault()
        }
      }
    }

    modal.addEventListener('keydown', handleTab)
    return () => modal.removeEventListener('keydown', handleTab)
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 ..."
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div ref={modalRef} tabIndex={-1}>
        <h2 id="modal-title">{title}</h2>
        {children}
      </div>
    </div>
  )
}
```

**改进方案2：导航ARIA标签**

```tsx
<Link
  to={item.path}
  className="..."
  aria-current={isActive ? 'page' : undefined}
  aria-label={item.label}
>
```

**改进方案3：颜色对比度提升**

```css
/* 当前 text-text-muted (#B8A08E) 在 bg-warm-50 上对比度约2.8:1，不达标 */
/* 修改为更深的颜色，确保对比度达到4.5:1 */
:root {
  --text-muted: #8B7355;  /* 对比度约4.6:1，达标 */
}
```

**工时估算**：4小时

---

#### 3.3.8 动画/交互

**问题描述**：卡牌添加/删除无视觉反馈、推荐结果无入场动画、拖拽排序半成品。

**改进方案1：卡牌操作反馈**

```tsx
function useCardAction() {
  const [lastAction, setLastAction] = useState<{
    id: string
    type: 'add' | 'remove'
  } | null>(null)

  const addWithFeedback = (id: string) => {
    addCard(id)
    setLastAction({ id, type: 'add' })
    setTimeout(() => setLastAction(null), 600)
  }

  return { lastAction, addWithFeedback }
}
```

**改进方案2：推荐结果逐项入场**

```tsx
{rec.scores.map((s, i) => (
  <div
    key={s.cardId}
    className="animate-fade-in-up"
    style={{ animationDelay: `${i * 100}ms` }}
  >
    {/* 推荐卡片内容 */}
  </div>
))}
```

**改进方案3：拖拽排序完善或移除**

```typescript
// 如果完善：
const handleDrop = (targetId: string) => {
  if (!dragId || dragId === targetId) {
    setDragId(null)
    return
  }
  const newDeck = [...deck]
  const dragIndex = newDeck.findIndex(c => c.cardId === dragId)
  const targetIndex = newDeck.findIndex(c => c.cardId === targetId)
  const [removed] = newDeck.splice(dragIndex, 1)
  newDeck.splice(targetIndex, 0, removed)
  setDeck(newDeck)
  setDragId(null)
}

// 如果移除：删除所有dragId相关代码
```

**工时估算**：4小时

---

### 3.4 服务层优化

#### 3.4.1 缓存策略

**问题描述**：每次addCard/removeCard都重新计算所有分析结果，没有缓存。

**实施方案**：

```typescript
// src/services/analysisCache.ts
let lastDeckSignature = ''
let cachedResults: AnalysisResults | null = null

export function getOrComputeAnalysis(
  deck: DeckCard[],
  character: CharacterId,
  relics: OwnedRelic[]
): AnalysisResults {
  const sig = `${character}:${deck.map(c => c.cardId).sort().join(',')}`
  if (sig === lastDeckSignature && cachedResults) return cachedResults

  lastDeckSignature = sig
  cachedResults = computeFullAnalysis(deck, character, relics)
  return cachedResults
}
```

**工时估算**：2小时

---

#### 3.4.2 错误处理统一

**问题描述**：项目中存在3种不一致的错误处理模式。

**统一错误处理框架**：

```typescript
// src/services/errorHandler.ts
interface AppError {
  code: string
  message: string
  severity: 'warning' | 'error' | 'fatal'
  recovery?: string
  timestamp: number
}

class ErrorHandler {
  private listeners: ((error: AppError) => void)[] = []

  emit(error: Omit<AppError, 'timestamp'>) {
    const fullError = { ...error, timestamp: Date.now() }
    this.listeners.forEach(l => l(fullError))
    console.error(`[${error.severity}] ${error.code}: ${error.message}`)
  }

  on(listener: (error: AppError) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }
}

export const errorHandler = new ErrorHandler()

// 使用示例
try {
  await recordManager.init()
} catch (e) {
  errorHandler.emit({
    code: 'RECORD_INIT_FAILED',
    message: `记录管理器初始化失败: ${e instanceof Error ? e.message : '未知错误'}`,
    severity: 'error',
    recovery: '请刷新页面重试',
  })
}
```

**Error Boundary**：

```tsx
// src/components/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  state = { hasError: false, error: undefined }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-8 text-center">
          <h2>😵 出现了错误</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>重试</button>
        </div>
      )
    }
    return this.props.children
  }
}
```

**工时估算**：4小时

---

#### 3.4.3 IndexedDB优化

**问题描述**：读写分离导致并发数据丢失，无版本迁移框架，全量加载所有记录。

**改进方案1：事务合并**

```typescript
// 优化前：读写分离
async addDecision(recordId: string, decision: Decision): Promise<void> {
  const record = await this.getRecord(recordId)  // 事务1
  record.decisions.push(decision)
  await this.saveRecord(record)  // 事务2
}

// 优化后：单事务
async addDecision(recordId: string, decision: Decision): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = this.getDB().transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const getReq = store.get(recordId)
    getReq.onsuccess = () => {
      const record = getReq.result
      if (!record) { reject(new Error('记录不存在')); return }
      record.decisions.push(decision)
      store.put(record)
    }
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(new Error('操作失败'))
  })
}
```

**改进方案2：版本迁移框架**

```typescript
const migrations: Record<number, (db: IDBDatabase, tx: IDBTransaction) => void> = {
  2: (db, tx) => {
    const store = tx.objectStore(STORE_NAME)
    store.createIndex('floor', 'finalFloor', { unique: false })
  },
  3: (db, tx) => {
    db.createObjectStore('deck-snapshots', { keyPath: 'id' })
  },
}

request.onupgradeneeded = (event) => {
  const db = (event.target as IDBOpenDBRequest).result
  const oldVersion = event.oldVersion
  for (let v = oldVersion + 1; v <= DB_VERSION; v++) {
    migrations[v]?.(db, tx)
  }
}
```

**改进方案3：分页查询**

```typescript
async getRecentRecords(limit: number = 50): Promise<GameRecord[]> {
  return new Promise((resolve, reject) => {
    const tx = this.getDB().transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const index = store.index('startTime')
    const request = index.openCursor(null, 'prev')
    const results: GameRecord[] = []

    request.onsuccess = () => {
      const cursor = request.result
      if (cursor && results.length < limit) {
        results.push(cursor.value)
        cursor.continue()
      } else {
        resolve(results)
      }
    }
    request.onerror = () => reject(new Error('查询失败'))
  })
}
```

**工时估算**：4小时

---

#### 3.4.4 Web Worker

**问题描述**：所有计算在主线程执行，可能造成UI卡顿。

**实施方案**：

```typescript
// src/workers/analysis.worker.ts
self.onmessage = (e: MessageEvent<AnalysisRequest>) => {
  if (e.data.type === 'FULL_ANALYSIS') {
    const { deck, character, relics } = e.data
    const result = computeFullAnalysis(deck, character, relics)
    self.postMessage({ type: 'FULL_ANALYSIS_RESULT', ...result })
  }
}

// src/hooks/useAnalysisWorker.ts
export function useAnalysisWorker() {
  const workerRef = useRef<Worker | null>(null)

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../workers/analysis.worker.ts', import.meta.url),
      { type: 'module' }
    )
    return () => workerRef.current?.terminate()
  }, [])

  const analyze = useCallback((
    deck: DeckCard[],
    character: CharacterId,
    relics: OwnedRelic[]
  ) => {
    return new Promise<AnalysisResult>((resolve) => {
      const worker = workerRef.current!
      worker.onmessage = (e) => resolve(e.data)
      worker.postMessage({ type: 'FULL_ANALYSIS', deck, character, relics })
    })
  }, [])

  return { analyze }
}
```

**注意**：Worker方案的限制包括数据传输开销、数据访问限制、复杂度增加。建议先优化算法，如果仍有性能问题再引入Worker。

**工时估算**：1天

---

### 3.5 工程化优化

#### 3.5.1 测试框架搭建

**问题描述**：项目完全没有测试代码，属于高风险状态。

**实施方案**：

```bash
# 安装依赖
pnpm add -D vitest @vitest/coverage-v8 @vitest/ui jsdom fake-indexeddb
pnpm add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

**vitest.config.ts**：

```typescript
import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/services/**', 'src/stores/**', 'src/data/**'],
      thresholds: {
        statements: 80,
        branches: 70,
        functions: 80,
        lines: 80,
      },
    },
  },
})
```

**测试优先级**：

| 优先级 | 模块 | 测试类型 | 工作量 |
|--------|------|----------|:------:|
| P0 | cardScorer.ts | 单元测试 | 2h |
| P0 | archetypeEngine.ts | 单元测试 | 3h |
| P0 | saveParser.ts | 单元测试 | 2h |
| P1 | recordManager.ts | 集成测试 | 2h |
| P1 | Zustand stores | 集成测试 | 2h |
| P1 | data/*.ts | 单元测试 | 1h |
| P2 | 核心组件 | 组件测试 | 2h |
| P3 | E2E关键流程 | E2E测试 | 4h |

**总预估工作量**：约20小时

**工时估算**：3天（Phase 1核心算法 + Phase 2状态管理 + Phase 3组件）

---

#### 3.5.2 CI/CD流水线

**问题描述**：当前只有部署流水线，没有PR检查、测试、安全扫描。

**PR检查流水线**：

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  lint:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'pnpm' }
      - run: corepack enable
      - run: pnpm install --frozen-lockfile
      - run: pnpm type-check
      - run: pnpm lint

  test:
    name: Unit Tests
    runs-on: ubuntu-latest
    needs: lint
    strategy:
      matrix:
        node-version: [18, 20]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '${{ matrix.node-version }}', cache: 'pnpm' }
      - run: corepack enable
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:run
      - run: pnpm test:coverage
        if: matrix.node-version == 20

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'pnpm' }
      - run: corepack enable
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
```

**工时估算**：4小时

---

#### 3.5.3 代码质量工具

**问题描述**：ESLint配置不严格、无Prettier配置、无Git hooks。

**ESLint升级**：

```javascript
// eslint.config.js (Flat Config)
export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'coverage'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',     // 禁止any
      '@typescript-eslint/no-unused-vars': ['error', {   // 禁止未使用变量
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
    },
  },
)
```

**Prettier配置**：

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

**Git Hooks**：

```bash
pnpm add -D husky lint-staged @commitlint/cli @commitlint/config-conventional
```

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{css,json,md}": ["prettier --write"]
  }
}
```

**工时估算**：4小时

---

#### 3.5.4 安全加固

**问题描述**：完全没有CSP配置、无依赖漏洞扫描、无安全Headers。

**CSP配置**：

```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self' https:;
  frame-src 'none';
  object-src 'none';
">
```

**安全Headers**：

```html
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta http-equiv="X-Frame-Options" content="DENY">
<meta name="referrer" content="strict-origin-when-cross-origin">
```

**依赖审计**：

```yaml
# .github/workflows/security.yml
name: Security Scan
on:
  schedule:
    - cron: '0 8 * * 1'  # 每周一
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm audit --audit-level high
```

**工时估算**：2小时

---

#### 3.5.5 版本管理

**问题描述**：没有CHANGELOG、没有自动化Release、版本号管理混乱。

**CHANGELOG自动化**：

```bash
pnpm add -D conventional-changelog-cli
```

```json
{
  "scripts": {
    "changelog": "conventional-changelog -p angular -i CHANGELOG.md -s",
    "version": "pnpm changelog && git add CHANGELOG.md"
  }
}
```

**Release流水线**：

```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    tags: ['v*']
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - uses: softprops/action-gh-release@v2
        with:
          files: dist/**
```

**工时估算**：2小时

---

### 3.6 产品优化

#### 3.6.1 新手引导

**问题描述**：完全没有新手引导，新用户不知道如何使用。

**实施方案**：

```
首次使用引导（3步向导）：

Step 1: 选择角色
"选择你正在玩的角色"
[角色卡片选择]

Step 2: 了解牌库
"点击卡牌添加到你的当前牌库"
[引导用户点击几张基础牌]

Step 3: 获取推荐
"现在输入你面前的可选卡牌，获取智能推荐"
[引导用户尝试一次选牌推荐]
```

**术语解释系统**：

```typescript
const GLOSSARY = {
  '流派': '一种牌组构筑方向，如"力量流"表示以叠加力量为核心的策略',
  '核心卡': '对某个流派至关重要的卡牌，缺少它流派强度大幅下降',
  '协同': '卡牌之间的配合效果，1+1>2',
  'Combo': '多张卡牌形成的强力组合',
  '消耗': '使用后从牌库中移除的卡牌',
  '虚无': '回合结束时从手牌中移除的卡牌',
}
```

**工时估算**：1周

---

#### 3.6.2 用户留存

**问题描述**：游戏辅助工具天然留存率低，缺乏持续回访的驱动力。

**留存策略**：

1. **习惯养成**：简化路径，让"每次游戏都打开"成为习惯
2. **内容驱动**：每周更新攻略内容，让用户有回访理由
3. **数据沉淀**：游戏记录越多，复盘价值越高，增加迁移成本
4. **社交驱动**：分享功能带来新用户

**留存指标目标**：

| 指标 | 目标 | 衡量方式 |
|------|:----:|----------|
| 次日留存率 | > 30% | 新用户次日访问 |
| 7日留存率 | > 15% | 新用户7天内访问 |
| 月活跃率 | > 20% | 月内至少访问1次 |
| 平均使用时长 | > 5分钟/次 | 单次访问时长 |

---

#### 3.6.3 国际化

**问题描述**：项目完全硬编码中文，没有i18n支持。

**实施方案**：

```typescript
// src/i18n/index.ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

i18n.use(initReactI18next).init({
  resources: {
    'zh-CN': { translation: zhCN },
    en: { translation: en },
  },
  lng: 'zh-CN',
  fallbackLng: 'zh-CN',
})
```

**工作量估算**：

| 模块 | 文本量 | 工作量 |
|------|:------:|:------:|
| 导航/通用 | ~50条 | 小 |
| 页面标题/描述 | ~100条 | 中 |
| 卡牌数据（已有英文） | ~300条 | 小 |
| 提示/错误信息 | ~30条 | 小 |
| **总计** | **~480条** | **1-2天** |

---

#### 3.6.4 PWA支持

**问题描述**：完全无离线支持，没有Service Worker和Web App Manifest。

**实施方案**：

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
      },
    }),
  ],
})
```

**Web App Manifest**：

```json
{
  "name": "STS2 助手 - 杀戮尖塔2智能选牌助手",
  "short_name": "STS2 助手",
  "start_url": "/sts2-helper/",
  "display": "standalone",
  "background_color": "#FFFAF5",
  "theme_color": "#FF6B35"
}
```

**工时估算**：1天

---

## 第四部分：任务分解与执行计划

### 4.1 第一周：数据修复 + 致命问题

**目标**：修复所有P0级别问题，确保核心功能可用。

| 天数 | 任务 | 负责人 | 产出物 | 验收标准 |
|------|------|--------|--------|----------|
| Day 1 | 采集prince/necromancer缺失卡牌数据 | 数据 | 补充的JSON数据 | 数据验证脚本通过 |
| Day 1 | 修复流派引用断裂（68处） | 数据 | 修改后的archetype JSON | 引用完整率100% |
| Day 2 | 修复Combo引用断裂（16处） | 数据 | 修改后的combo JSON | 引用完整率100% |
| Day 2 | 替换故障机器人/储君主观描述 | 数据 | 修改后的card JSON | 描述全部客观化 |
| Day 2 | 补充遗物数据文件（boss.json等） | 数据 | 新增的JSON文件 | 文件存在且格式正确 |
| Day 3 | 合并双主题Store | 前端 | 修改后的themeStore | 主题切换正常 |
| Day 3 | 修复X费牌费用曲线计算 | 后端 | 修改后的archetypeEngine | X费牌正确统计 |
| Day 3 | 合并IndexedDB读写事务 | 后端 | 修改后的recordManager | 并发写入不丢失 |
| Day 4 | 补充升级描述（第一批50%） | 数据 | 修改后的card JSON | 覆盖率50% |
| Day 4 | 建立数据验证脚本 | DevOps | scripts/validate-data.ts | CI集成 |
| Day 5 | 测试验证 + Bug修复 | QA | 测试报告 | 所有P0问题已修复 |

---

### 4.2 第二周：核心功能完善

**目标**：优化选牌推荐算法，提升推荐准确性。

| 天数 | 任务 | 负责人 | 产出物 | 验收标准 |
|------|------|--------|--------|----------|
| Day 1 | 差异化流派权重 | 数据/后端 | 修改后的archetype JSON | 每个流派独立权重 |
| Day 1 | 改进baseStrength计算 | 后端 | 修改后的cardScorer | 区分度提升 |
| Day 2 | 引入Tag权重体系 | 后端 | 修改后的cardScorer | 协同度计算更精确 |
| Day 2 | 统一协同度计算 | 后端 | 新建synergy.ts | 两套算法统一 |
| Day 3 | 优化遗物协同检测 | 后端 | 修改后的cardScorer | 特殊协同规则 |
| Day 3 | 优化推荐理由 | 产品/前端 | 修改后的RecommendationPanel | 理由具体有上下文 |
| Day 4 | 添加新手引导 | 前端 | 新建Onboarding组件 | 3步引导完成 |
| Day 4 | 修复关键UI问题 | 前端 | 修改后的组件 | Modal/暗色主题修复 |
| Day 5 | 测试验证 + 调优 | QA | 测试报告 | 推荐准确率>70% |

---

### 4.3 第三周：架构优化 + 测试

**目标**：提升代码质量，建立测试体系。

| 天数 | 任务 | 负责人 | 产出物 | 验收标准 |
|------|------|--------|--------|----------|
| Day 1 | 添加React.lazy代码分割 | 前端 | 修改后的App.tsx | 首屏加载减少50% |
| Day 1 | 消除any类型 | 前端 | 修改后的组件 | 0处any类型 |
| Day 2 | 拆分AnalyzePage子组件 | 前端 | 新建的组件文件 | 单文件<200行 |
| Day 2 | 提取共享常量 | 前端 | 新建constants/ | 0处重复定义 |
| Day 3 | 搭建Vitest测试框架 | DevOps | vitest.config.ts | 测试可运行 |
| Day 3 | 编写cardScorer单元测试 | QA | cardScorer.test.ts | 覆盖率>80% |
| Day 4 | 编写archetypeEngine测试 | QA | archetypeEngine.test.ts | 覆盖率>80% |
| Day 4 | 编写saveParser测试 | QA | saveParser.test.ts | 覆盖率>90% |
| Day 5 | 配置CI流水线 | DevOps | ci.yml | PR检查通过 |

---

### 4.4 第四周：体验提升 + 发布准备

**目标**：提升用户体验，准备v1.0发布。

| 天数 | 任务 | 负责人 | 产出物 | 验收标准 |
|------|------|--------|--------|----------|
| Day 1 | 移动端汉堡菜单 | 前端 | 修改后的App.tsx | 移动端导航可用 |
| Day 1 | 搜索防抖 | 前端 | 修改后的搜索组件 | 搜索流畅 |
| Day 2 | Modal焦点管理 | 前端 | 修改后的Modal | 焦点不逃逸 |
| Day 2 | ARIA标签完善 | 前端 | 修改后的组件 | Lighthouse无障碍>80 |
| Day 3 | 404页面 | 前端 | 新建NotFoundPage | 错误路径友好 |
| Day 3 | 路由过渡动画 | 前端 | 修改后的页面 | 切换流畅 |
| Day 4 | 编写README | DevOps | README.md | 文档完整 |
| Day 4 | 配置Prettier/Husky | DevOps | 配置文件 | 代码格式统一 |
| Day 5 | 内测 + Bug修复 | 全员 | 测试报告 | 无P0/P1 Bug |
| Day 5 | 发布v1.0 | DevOps | GitHub Release | 部署成功 |

---

### 4.5 长期规划

**v1.5（发布后1个月）**：

| 任务 | 优先级 | 工作量 |
|------|:------:|:------:|
| 补充升级描述（目标80%） | P1 | 持续 |
| 补充事件数据（目标30+） | P1 | 持续 |
| 补充boss/shop/event遗物 | P1 | 持续 |
| LearnPage嵌套路由 | P2 | 4h |
| 大列表虚拟化 | P2 | 4h |
| 拖拽排序完善或移除 | P2 | 4h |
| E2E测试 | P2 | 1天 |
| Lighthouse CI | P2 | 2h |

**v2.0（发布后3个月）**：

| 任务 | 优先级 | 工作量 |
|------|:------:|:------:|
| 存档自动读取（Electron版） | P1 | 3周 |
| 游戏记录存储和复盘 | P1 | 2周 |
| 遗物推荐系统 | P1 | 1周 |
| Boss攻略集成 | P2 | 1周 |
| 推荐理由深度优化 | P1 | 1周 |
| 协同度算法优化 | P1 | 1周 |
| 流派权重差异化 | P1 | 2天 |
| Web Worker重计算 | P2 | 1天 |
| PWA支持 | P2 | 1天 |
| 国际化基础框架 | P2 | 2天 |

**v3.0（发布后6个月）**：

| 任务 | 优先级 | 工作量 |
|------|:------:|:------:|
| 基于用户历史的个性化推荐 | P1 | 3周 |
| 选牌胜率预测模型 | P1 | 4周 |
| 智能流派识别 | P2 | 2周 |
| 自动复盘分析 | P2 | 2周 |
| 社区数据贡献机制 | P2 | 3周 |
| 完整国际化 | P2 | 2周 |
| API接口 | P3 | 2周 |

---

## 第五部分：各模块详细任务清单

### 5.1 数据层任务清单

#### 5.1.1 cards/ 目录

| 任务ID | 文件路径 | 具体修改内容 | 预计工时 | 依赖关系 |
|--------|---------|-------------|:--------:|---------|
| DATA-001 | src/data/cards/prince.json | 补充8张缺失卡牌数据 | 2h | 无 |
| DATA-002 | src/data/cards/necromancer.json | 补充10张缺失卡牌数据 | 2h | 无 |
| DATA-003 | src/data/cards/watcher.json | 补充7张缺失卡牌数据 | 1h | 无 |
| DATA-004 | src/data/cards/silent.json | 补充6张缺失卡牌数据 | 1h | 无 |
| DATA-005 | src/data/cards/ironclad.json | 补充5张缺失卡牌数据 | 1h | 无 |
| DATA-006 | src/data/cards/defect.json | 补充4张缺失卡牌数据 | 1h | 无 |
| DATA-007 | src/data/cards/defect.json | 替换~15张卡牌的主观描述 | 2h | 无 |
| DATA-008 | src/data/cards/prince.json | 替换~10张卡牌的主观描述 | 1h | 无 |
| DATA-009 | src/data/cards/*.json | 补充升级描述（第一批214张） | 4h | 无 |
| DATA-010 | src/data/cards/*.json | 修复4组重名卡牌 | 1h | 无 |

#### 5.1.2 archetypes/ 目录

| 任务ID | 文件路径 | 具体修改内容 | 预计工时 | 依赖关系 |
|--------|---------|-------------|:--------:|---------|
| ARCH-001 | src/data/archetypes/prince.json | 修复全部断裂引用 | 2h | DATA-001 |
| ARCH-002 | src/data/archetypes/necromancer.json | 修复全部断裂引用 | 2h | DATA-002 |
| ARCH-003 | src/data/archetypes/watcher.json | 修复7处断裂引用 | 1h | DATA-003 |
| ARCH-004 | src/data/archetypes/silent.json | 修复6处断裂引用 | 1h | DATA-004 |
| ARCH-005 | src/data/archetypes/ironclad.json | 修复5处断裂引用 | 1h | DATA-005 |
| ARCH-006 | src/data/archetypes/defect.json | 修复4处断裂引用 | 1h | DATA-006 |
| ARCH-007 | src/data/archetypes/*.json | 为21个流派定义独立scoringWeights | 2h | 无 |

#### 5.1.3 combos/ 目录

| 任务ID | 文件路径 | 具体修改内容 | 预计工时 | 依赖关系 |
|--------|---------|-------------|:--------:|---------|
| COMBO-001 | src/data/combos/all.json | 修复8条断裂Combo引用 | 2h | DATA-001~006 |
| COMBO-002 | src/data/combos/all.json | 补充缺失的跨流派Combo | 2h | 无 |

#### 5.1.4 relics/ 目录

| 任务ID | 文件路径 | 具体修改内容 | 预计工时 | 依赖关系 |
|--------|---------|-------------|:--------:|---------|
| RELIC-001 | src/data/relics/boss.json | 新建boss遗物数据文件 | 2h | 无 |
| RELIC-002 | src/data/relics/shop.json | 新建shop遗物数据文件 | 1h | 无 |
| RELIC-003 | src/data/relics/event.json | 新建event遗物数据文件 | 1h | 无 |
| RELIC-004 | src/data/relics/starter.json | 修复与角色遗物的ID冲突 | 1h | 无 |

#### 5.1.5 events/ 目录

| 任务ID | 文件路径 | 具体修改内容 | 预计工时 | 依赖关系 |
|--------|---------|-------------|:--------:|---------|
| EVENT-001 | src/data/events/all.json | 补充第二章事件（目标15+） | 3h | 无 |
| EVENT-002 | src/data/events/all.json | 补充第三章事件（目标10+） | 2h | 无 |
| EVENT-003 | src/data/events/all.json | 为事件添加选择建议 | 2h | EVENT-001, 002 |

#### 5.1.6 keywords.ts

| 任务ID | 文件路径 | 具体修改内容 | 预计工时 | 依赖关系 |
|--------|---------|-------------|:--------:|---------|
| KW-001 | src/data/keywords.ts | 添加scry(预见)关键词定义 | 0.5h | 无 |
| KW-002 | src/data/keywords.ts | 添加intangible(无实体)关键词定义 | 0.5h | 无 |
| KW-003 | src/data/keywords.ts | 添加star(辉星)关键词定义 | 0.5h | 无 |
| KW-004 | src/data/keywords.ts | 添加evoke(激活)关键词定义 | 0.5h | 无 |
| KW-005 | src/data/keywords.ts | 添加soul(灵魂)关键词定义 | 0.5h | 无 |
| KW-006 | src/data/keywords.ts | 添加forge(铸造)关键词定义 | 0.5h | 无 |
| KW-007 | src/data/keywords.ts | 添加doom(灾厄)关键词定义 | 0.5h | 无 |

---

### 5.2 算法层任务清单

| 任务ID | 文件路径 | 具体修改内容 | 预计工时 | 依赖关系 |
|--------|---------|-------------|:--------:|---------|
| ALGO-001 | src/services/cardScorer.ts | 改进calcBaseStrength函数 | 1h | 无 |
| ALGO-002 | src/services/cardScorer.ts | 改进calcArchetypeFit函数 | 1h | ARCH-007 |
| ALGO-003 | src/services/cardScorer.ts | 统一协同度计算到synergy.ts | 2h | 无 |
| ALGO-004 | src/services/cardScorer.ts | 改进calcRelicSynergy函数 | 2h | RELIC-001~003 |
| ALGO-005 | src/services/cardScorer.ts | 改进calcFloorAdaptation函数 | 1h | 无 |
| ALGO-006 | src/services/cardScorer.ts | 改进calcDeckHealthContribution函数 | 1h | 无 |
| ALGO-007 | src/services/cardScorer.ts | 改进evaluateSkipOption函数 | 1h | 无 |
| ALGO-008 | src/services/archetypeEngine.ts | 修复遗物加分纳入权重体系 | 1h | 无 |
| ALGO-009 | src/services/archetypeEngine.ts | 修复牌型比例分母问题 | 1h | 无 |
| ALGO-010 | src/services/archetypeEngine.ts | 修复X费牌费用曲线计算 | 1h | 无 |
| ALGO-011 | src/services/archetypeEngine.ts | 优化calcDeckSynergyScore为O(n) | 2h | 无 |
| ALGO-012 | src/services/archetypeEngine.ts | 优化identifyArchetypes过滤阈值 | 1h | 无 |
| ALGO-013 | src/services/synergy.ts | 新建统一协同度计算模块 | 2h | 无 |
| ALGO-014 | src/services/analysisService.ts | 新建分析编排服务 | 2h | ALGO-001~013 |

---

### 5.3 前端层任务清单

| 任务ID | 文件路径 | 具体修改内容 | 预计工时 | 依赖关系 |
|--------|---------|-------------|:--------:|---------|
| FE-001 | src/App.tsx | 添加React.lazy代码分割 | 2h | 无 |
| FE-002 | vite.config.ts | 添加manualChunks配置 | 1h | 无 |
| FE-003 | src/pages/AnalyzePage.tsx | 拆分4个内联子组件为独立文件 | 4h | 无 |
| FE-004 | src/pages/AnalyzePage.tsx | 消除any类型，定义Props接口 | 2h | FE-003 |
| FE-005 | src/constants/cardDisplay.ts | 新建共享常量文件 | 1h | 无 |
| FE-006 | 多个文件 | 将重复常量导入改为从constants导入 | 1h | FE-005 |
| FE-007 | src/stores/themeStore.ts | 统一主题管理，支持system选项 | 2h | 无 |
| FE-008 | src/stores/settingsStore.ts | 移除冗余的主题管理代码 | 1h | FE-007 |
| FE-009 | src/components/layout/MobileNav.tsx | 新建移动端汉堡菜单组件 | 3h | 无 |
| FE-010 | src/App.tsx | 集成MobileNav组件 | 1h | FE-009 |
| FE-011 | src/components/ui/Modal.tsx | 添加焦点管理和ARIA标签 | 3h | 无 |
| FE-012 | src/pages/EncyclopediaPage.tsx | 使用虚拟化列表 | 3h | 无 |
| FE-013 | 多个文件 | 添加搜索防抖 | 1h | 无 |
| FE-014 | src/components/ErrorBoundary.tsx | 新建ErrorBoundary组件 | 1h | 无 |
| FE-015 | src/App.tsx | 集成ErrorBoundary | 0.5h | FE-014 |
| FE-016 | src/pages/NotFoundPage.tsx | 新建404页面 | 1h | 无 |
| FE-017 | src/App.tsx | 添加404路由 | 0.5h | FE-016 |
| FE-018 | 多个文件 | 修复颜色对比度 | 1h | 无 |
| FE-019 | src/pages/AnalyzePage.tsx | 完善或移除拖拽排序 | 2h | 无 |
| FE-020 | src/components/RecommendationPanel.tsx | 优化推荐理由展示 | 2h | ALGO-007 |

---

### 5.4 服务层任务清单

| 任务ID | 文件路径 | 具体修改内容 | 预计工时 | 依赖关系 |
|--------|---------|-------------|:--------:|---------|
| SVC-001 | src/services/analysisCache.ts | 新建分析结果缓存模块 | 2h | 无 |
| SVC-002 | src/services/errorHandler.ts | 新建统一错误处理框架 | 2h | 无 |
| SVC-003 | src/services/recordManager.ts | 合并IndexedDB读写事务 | 2h | 无 |
| SVC-004 | src/services/recordManager.ts | 添加版本迁移框架 | 2h | 无 |
| SVC-005 | src/services/recordManager.ts | 添加分页查询 | 2h | 无 |
| SVC-006 | src/stores/gameStore.ts | 合并级联更新为单次set() | 2h | ALGO-014 |
| SVC-007 | src/stores/recordStore.ts | 使用分页查询替代全量加载 | 1h | SVC-005 |
| SVC-008 | src/utils/deckUtils.ts | 新建公共工具函数 | 2h | 无 |

---

### 5.5 工程化任务清单

| 任务ID | 文件路径 | 具体修改内容 | 预计工时 | 依赖关系 |
|--------|---------|-------------|:--------:|---------|
| ENG-001 | vitest.config.ts | 新建Vitest配置 | 1h | 无 |
| ENG-002 | src/test/setup.ts | 新建测试初始化文件 | 1h | ENG-001 |
| ENG-003 | src/test/test-utils.tsx | 新建自定义渲染器 | 1h | ENG-001 |
| ENG-004 | src/services/__tests__/cardScorer.test.ts | 编写评分算法测试 | 2h | ENG-001 |
| ENG-005 | src/services/__tests__/archetypeEngine.test.ts | 编写流派引擎测试 | 3h | ENG-001 |
| ENG-006 | src/services/__tests__/saveParser.test.ts | 编写存档解析器测试 | 2h | ENG-001 |
| ENG-007 | src/services/__tests__/recordManager.test.ts | 编写记录管理器测试 | 2h | ENG-001 |
| ENG-008 | src/stores/__tests__/gameStore.test.ts | 编写状态管理测试 | 2h | ENG-001 |
| ENG-009 | .github/workflows/ci.yml | 新建CI检查流水线 | 2h | ENG-001 |
| ENG-010 | .github/workflows/deploy.yml | 优化部署流水线 | 1h | 无 |
| ENG-011 | eslint.config.js | 升级ESLint到Flat Config | 1h | 无 |
| ENG-012 | .prettierrc | 新建Prettier配置 | 0.5h | 无 |
| ENG-013 | .husky/pre-commit | 配置Git hooks | 1h | ENG-011, 012 |
| ENG-014 | tsconfig.json | 开启TypeScript严格检查 | 0.5h | 无 |
| ENG-015 | index.html | 添加CSP和安全Headers | 1h | 无 |
| ENG-016 | README.md | 新建项目README | 1h | 无 |
| ENG-017 | CHANGELOG.md | 新建变更日志 | 0.5h | 无 |
| ENG-018 | scripts/validate-data.ts | 新建数据验证脚本 | 2h | 无 |
| ENG-019 | .github/dependabot.yml | 配置依赖自动更新 | 0.5h | 无 |
| ENG-020 | package.json | 清理双lockfile，添加engines字段 | 0.5h | 无 |

---

### 5.6 产品层任务清单

| 任务ID | 文件路径 | 具体修改内容 | 预计工时 | 依赖关系 |
|--------|---------|-------------|:--------:|---------|
| PROD-001 | src/components/onboarding/ | 新建新手引导组件 | 4h | 无 |
| PROD-002 | src/components/onboarding/Glossary.tsx | 新建术语解释组件 | 2h | 无 |
| PROD-003 | src/i18n/ | 新建国际化框架 | 4h | 无 |
| PROD-004 | src/i18n/locales/zh-CN.json | 新建中文语言包 | 2h | PROD-003 |
| PROD-005 | src/i18n/locales/en.json | 新建英文语言包 | 2h | PROD-003 |
| PROD-006 | public/manifest.json | 新建PWA Manifest | 1h | 无 |
| PROD-007 | vite.config.ts | 添加VitePWA插件 | 1h | PROD-006 |

---

## 第六部分：质量保障

### 6.1 测试策略

**测试金字塔**：

```
         /\
        /  \        E2E测试（5%）
       /    \       - 关键用户流程
      /------\      - Playwright
     /        \     组件测试（15%）
    /          \    - 核心组件渲染
   /------------\   - React Testing Library
  /              \  单元测试（80%）
 /                \ - 核心算法
/------------------\- Vitest
```

**测试覆盖目标**：

| 模块 | 目标覆盖率 | 测试类型 | 优先级 |
|------|:----------:|---------|:------:|
| services/ | 90%+ | 单元测试 | P0 |
| stores/ | 80%+ | 集成测试 | P1 |
| data/ | 70%+ | 单元测试 | P1 |
| components/ | 60%+ | 组件测试 | P2 |
| pages/ | 40%+ | 组件测试 | P3 |

**测试数据管理**：

```
src/test/
├── setup.ts              # 全局setup（cleanup、mock）
├── test-utils.tsx         # 自定义render（含Router）
├── fixtures/
│   ├── cards.ts           # 最小卡牌数据
│   ├── archetypes.ts      # 最小流派数据
│   ├── relics.ts          # 最小遗物数据
│   └── save-files.ts      # 各种存档格式样本
└── mocks/
    └── browser.ts         # 浏览器API mock
```

**边界条件测试清单**：

| 场景 | 测试用例 | 预期结果 |
|------|---------|---------|
| 空数据 | cardScorer: 空选项列表 | 返回空数组 |
| 空数据 | archetypeEngine: 空牌库 | 返回0分 |
| 空数据 | saveParser: 空字符串 | 返回无效结果 |
| 异常输入 | 重复卡牌ID | 不崩溃 |
| 异常输入 | 超大牌库（1000张） | 5秒内完成 |
| 异常输入 | 特殊字符卡牌ID | 安全处理 |
| 边界值 | floor = 0 | 不崩溃 |
| 边界值 | floor = 999 | 不崩溃 |
| 边界值 | 负数楼层 | 不崩溃 |
| 并发 | 快速连续addCard | 状态正确 |
| 并发 | IndexedDB并发写入 | 不丢失数据 |

---

### 6.2 代码审查标准

**PR审查清单**：

```yaml
## PR审查清单

### 代码质量
- [ ] 无any类型
- [ ] 无未使用的变量
- [ ] 无console.log（仅允许console.warn/error）
- [ ] 函数有JSDoc注释
- [ ] Props有TypeScript接口定义

### 测试
- [ ] 新增功能有对应测试
- [ ] 修复Bug有回归测试
- [ ] 测试覆盖率不下降

### 性能
- [ ] 无不必要的重渲染
- [ ] 大列表使用虚拟化
- [ ] 搜索有防抖
- [ ] 计算有缓存

### 无障碍
- [ ] 交互元素有ARIA标签
- [ ] Modal有焦点管理
- [ ] 颜色对比度达标

### 安全
- [ ] 无XSS风险
- [ ] 用户输入有清理
- [ ] 无敏感信息泄露
```

**Commit规范**：

```
feat(analysis): 添加流派权重差异化
fix(parser): 修复存档解析崩溃
docs: 更新README安装说明
refactor(store): 统一主题管理
perf: 添加代码分割减少首屏加载
test(scorer): 添加评分算法单元测试
build: 升级Vite到6.x
ci: 添加PR检查流水线
```

---

### 6.3 性能基准

**Lighthouse指标目标**：

| 指标 | 目标 | 当前预估 | 说明 |
|------|:----:|:--------:|------|
| Performance | > 90 | ~70 | 代码分割后可提升 |
| Accessibility | > 80 | ~60 | ARIA标签完善后可提升 |
| Best Practices | > 90 | ~80 | 安全Headers添加后可提升 |
| SEO | > 80 | ~70 | Meta标签完善后可提升 |

**Web Vitals目标**：

| 指标 | 目标 | 说明 |
|------|:----:|------|
| FCP (First Contentful Paint) | < 1.5s | 首屏渲染 |
| LCP (Largest Contentful Paint) | < 2.5s | 最大内容渲染 |
| CLS (Cumulative Layout Shift) | < 0.1 | 布局偏移 |
| TBT (Total Blocking Time) | < 200ms | 阻塞时间 |

**Bundle大小目标**：

| Chunk | 目标(gzip) | 说明 |
|-------|:----------:|------|
| vendor-react | < 50KB | React生态 |
| vendor-zustand | < 5KB | Zustand |
| vendor-icons | < 25KB | Lucide图标 |
| index (业务) | < 30KB | 核心业务代码 |
| 各页面chunk | < 10KB | 懒加载页面 |
| CSS | < 15KB | 样式 |

**算法性能目标**：

| 函数 | 目标耗时 | 说明 |
|------|:--------:|------|
| scoreCardOptions (3选项) | < 5ms | 选牌评分 |
| identifyArchetypes | < 10ms | 流派识别 |
| analyzeDeckHealth | < 5ms | 健康度分析 |
| calcDeckSynergy | < 2ms | 协同度计算 |
| computeFullAnalysis | < 20ms | 完整分析 |

---

### 6.4 验收标准

**v1.0发布验收标准**：

```yaml
## 数据完整性
- [ ] 6个角色数据引用完整率 > 95%
- [ ] 流派引用断裂 = 0
- [ ] Combo引用断裂 = 0
- [ ] 卡牌描述全部客观化
- [ ] 升级描述覆盖率 > 50%

## 功能完整性
- [ ] 选牌推荐核心理由准确率 > 70%
- [ ] 6个角色流派匹配正常工作
- [ ] 卡牌图鉴搜索正常工作
- [ ] 选牌模拟器正常工作
- [ ] 数据统计正常工作

## 性能
- [ ] 首屏加载时间 < 2秒
- [ ] Lighthouse Performance > 90
- [ ] 代码分割正常工作
- [ ] 搜索有防抖

## 质量
- [ ] 0处any类型
- [ ] 核心算法测试覆盖率 > 80%
- [ ] ESLint无error
- [ ] TypeScript编译无error

## 体验
- [ ] 移动端汉堡菜单可用
- [ ] Modal焦点管理正常
- [ ] 暗色主题完整
- [ ] 404页面存在
- [ ] 新手引导可用

## 工程化
- [ ] CI流水线正常运行
- [ ] README存在
- [ ] CHANGELOG存在
- [ ] 数据验证脚本正常运行
```

---

## 附录

### 附录A：技术债务全景图

```
正确性债务 (P0)          性能债务 (P1)           可维护性债务 (P2)
├── 断裂引用 68处        ├── 无代码分割           ├── 0%测试覆盖
├── 双主题Store          ├── 大量any类型          ├── 缺少hooks目录
├── IndexedDB并发        ├── 协同度O(n²)          ├── JSON无运行时校验
├── X费计算错误          ├── 无列表虚拟化         ├── 硬编码规则
└── 主观描述             ├── 两次渲染             └── 半成品功能
                         ├── 全量记录加载
                         └── 无防抖
```

### 附录B：跨模块问题交叉引用

| 问题 | 涉及模块 | 报告来源 |
|------|---------|---------|
| 流派引用断裂 | data/archetypes ↔ data/cards | 游戏设计/数据/全栈 |
| 协同度重复计算 | cardScorer ↔ archetypeEngine | 后端/数据/全栈 |
| 双主题Store | settingsStore ↔ themeStore | 前端/后端/全栈 |
| 无代码分割 | App.tsx, vite.config.ts | 前端/DevOps/全栈 |
| 大量any类型 | AnalyzePage.tsx | 前端/全栈 |
| 无测试覆盖 | 全局 | QA/DevOps |
| 描述质量参差 | data/cards JSON | 游戏设计/数据 |
| 协同度O(n²) | archetypeEngine | 后端/数据/全栈 |
| gameStore级联更新 | gameStore → services | 前端/后端/全栈 |
| IndexedDB事务 | recordManager | 后端/全栈 |

### 附录C：模块间接口契约

```typescript
// data → service 的隐式契约
interface DataServiceContract {
  getCardById(id: string): Card | undefined       // 永不抛异常
  getArchetypeById(id: string): Archetype | undefined
  getRelicById(id: string): Relic | undefined
}

// service → store 的隐式契约
interface ServiceStoreContract {
  identifyArchetypes(deck, character, relics): ArchetypeMatch[]
  analyzeDeckHealth(deck): DeckHealthReport         // 总分 0-100
  scoreCardOptions(options, deck, archetypes, floor, relics): CardScore[]
}

// store → UI 的隐式契约
interface StoreUIContract {
  character: CharacterId | null                     // null = 未选择
  deck: DeckCard[]                                  // 可能为空
  archetypes: ArchetypeMatch[]                      // 可能为空
  recommendation: Recommendation | null             // null = 未分析
  isLoading: boolean
  error: string | null
}
```

### 附录D：数据统计汇总

**各角色卡牌完整统计**：

| 角色 | 总数 | attack | skill | power | basic | common | uncommon | rare | special |
|------|:----:|:------:|:-----:|:-----:|:-----:|:------:|:--------:|:----:|:-------:|
| ironclad | 80 | 29 | 27 | 24 | 3 | 22 | 38 | 17 | 0 |
| silent | 55 | 19 | 27 | 9 | 4 | 17 | 20 | 14 | 0 |
| defect | 94 | 35 | 36 | 23 | 4 | 24 | 47 | 19 | 0 |
| watcher | 53 | 19 | 26 | 8 | 4 | 21 | 16 | 12 | 0 |
| necromancer | 79 | 34 | 29 | 16 | 4 | 17 | 33 | 23 | 2 |
| prince | 66 | 30 | 25 | 11 | 3 | 11 | 35 | 17 | 0 |
| **总计** | **427** | 166 | 170 | 91 | 22 | 112 | 189 | 102 | 2 |

**费用分布**：

| 费用 | 数量 | 占比 |
|:----:|:----:|:----:|
| 0费 | 44 | 10% |
| 1费 | 260 | 61% |
| 2费 | 77 | 18% |
| 3费 | 30 | 7% |
| 4费 | 1 | 0.2% |
| X费(-1) | 8 | 2% |

**流派数据统计**：

| 角色 | 流派数量 | 核心卡总数 | 重要卡总数 | 辅助卡总数 | Combo总数 |
|------|:--------:|:---------:|:---------:|:---------:|:---------:|
| ironclad | 5 | 15 | 17 | 14 | 7 |
| silent | 3 | 9 | 10 | 9 | 6 |
| defect | 4 | 12 | 12 | 10 | 7 |
| watcher | 3 | 9 | 10 | 9 | 6 |
| necromancer | 3 | 9 | 9 | 7 | 5 |
| prince | 3 | 9 | 9 | 6 | 5 |
| **总计** | **21** | **63** | **67** | **55** | **36** |

---

> **本大纲基于8份部门分析报告汇总而成，涵盖项目现状评估、问题清单、详细优化方案、任务分解与执行计划、各模块详细任务清单、以及质量保障方案。建议按P0→P1→P2优先级分4周逐步实施，重点先解决数据完整性和架构解耦问题。**
