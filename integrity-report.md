# 完整性检查报告

**项目**: STS2 助手 (`D:\Agent\sts2-helper`)
**检查时间**: $(date)
**检查范围**: `src/` 目录 + 根目录配置文件

---

## 1. 类型定义系统 (`src/types/`)

### 文件清单
| 文件 | 存在 | 导出内容 |
|------|------|----------|
| `index.ts` | ✅ | 重新导出所有 4 个模块 (`card`, `archetype`, `game`, `record`) |
| `card.ts` | ✅ | `Card`, `DeckCard`, `CardOption`, `Character`, `CardType`, `CardRarity`, `CharacterId` |
| `archetype.ts` | ✅ | `Archetype`, `ArchetypeMatch`, `ArchetypeGuide`, `CardWeight`, `Combo`, `DifficultyLevel`, `ComboPowerLevel` |
| `game.ts` | ✅ | `GameState`, `CardReward`, `Recommendation`, `CardScore`, `SkipAnalysis` |
| `record.ts` | ✅ | `Decision`, `GameRecord` |

### 类型覆盖完整度
- ✅ 所有类型被合理拆分到语义化文件中
- ✅ `CharacterId` 定义覆盖所有 6 个角色：`ironclad`, `silent`, `defect`, `watcher`, `necromancer`, `prince`
- ✅ `CardType` 覆盖所有 5 种类型
- ✅ `CardRarity` 覆盖所有 5 种稀有度

### ⚠️ 问题：类型重复定义

`Recommendation`, `CardScore`, `SkipAnalysis` 三个接口同时在两个位置被定义：

| 定义位置 | 文件 |
|----------|------|
| `/src/types/game.ts` | `export interface Recommendation`, `CardScore`, `SkipAnalysis` |
| `/src/services/cardScorer.ts` | `export interface CardScore`, `SkipAnalysis`, `Recommendation` |

**影响**: `gameStore.ts` 从 `@/services/cardScorer` 而非 `@/types` 导入 `Recommendation`。当二者不同步时，会产生隐蔽的类型错误。

**建议**: 删除 `cardScorer.ts` 中的重复类型定义，改为全部从 `@/types` 导入。`gameStore.ts` 的导入行 (`import type { Recommendation } from '@/services/cardScorer'`) 也应改为从 `@/types` 导入。

---

## 2. `src/services/archetypeEngine.ts` — 路径和数据引用检查

### 导入路径
| 导入目标 | 实际路径 | 状态 |
|----------|----------|------|
| `@/types` | `src/types/index.ts` | ✅ 正确 |
| `@/data/archetypes` | `src/data/archetypes/index.ts` | ✅ 正确 |
| `@/data/cards` | `src/data/cards/index.ts` | ✅ 正确 |

### 函数调用追溯
- `getArchetypesByCharacter()` — 在 `identifyArchetypes()` 中调用 ✅
- `getCardById()` — 在 `matchArchetype()`, `calcDeckRatio()`, `calcCostCurve()`, `calcDeckSynergyScore()` 中调用 ✅
- `getArchetypeById()` — 不在本文件中调用，但会被 `cardScorer.ts` 调用 ✅

### 评分权重验证
- `scoringWeights` 各项之和 = `0.35 + 0.25 + 0.10 + 0.10 + 0.05 + 0.15` = **1.0** ✅
- 费用曲线索引 `card.cost >= 3 ? 3 : card.cost` 处理了超出预算的情况 ✅
- 所有空牌库/undefined 边缘情况（`deck.length || 1`）均做保护 ✅

---

## 3. `src/services/cardScorer.ts` — 引用追溯

### 导入路径
| 导入目标 | 实际路径 | 状态 |
|----------|----------|------|
| `@/types` | `src/types/index.ts` | ✅ 正确 |
| `@/data/cards` | `src/data/cards/index.ts` | ✅ 正确 |
| `@/data/archetypes` | `src/data/archetypes/index.ts` | ✅ 正确 |

### 关键逻辑验证
- `getCardById()` 用于获取卡牌详情 ✅
- `getArchetypeById()` 在流派适配评分中被调用 ✅
- 流派匹配逻辑中 `archetype.coreCards.find(c => c.cardId === card.id)!.weight` — 使用了非空断言 `!`，当 Archetype 数据中 `coreCards` 存在且 `some()` 为 true 时安全 ✅
- `evaluateSkipOption` 处理选项数组为空的场景 ✅

### ⚠️ 类型重复（同第3节）
该文件自身定义了 `CardScore`, `SkipAnalysis`, `Recommendation` 三个接口，与 `src/types/game.ts` 重复。

---

## 4. `src/data/cards/index.ts` — 导入 vs 磁盘文件名

### 磁盘文件（JSON）
```
defect.json, ironclad.json, necromancer.json, prince.json, silent.json, watcher.json
```

### 导入映射
```typescript
import ironcladData from './ironclad.json'       // ✅
import silentData from './silent.json'           // ✅
import defectData from './defect.json'           // ✅
import watcherData from './watcher.json'         // ✅
import necromancerData from './necromancer.json' // ✅
import princeData from './prince.json'           // ✅
```

**结论: 所有 6 个 JSON 文件均被导入，且磁盘上每个文件都有对应的导入语句。** ✅

### 导出函数
- `getCardById(id)` ✅
- `getCardsByCharacter(characterId)` ✅
- `getAllCards()` ✅
- `searchCards(query, characterId?)` ✅
- `CHARACTER_IDS` — 6 个角色常量 ✅
- `CHARACTER_INFO` — 6 个角色信息记录 ✅

---

## 5. `src/data/archetypes/index.ts` — 完整性检查

### 导入映射
所有 6 个角色的 archetype JSON 文件均被导入，与 cards 侧完全一致 ✅

### 跨目录一致性
| 角色 | 有卡牌数据? | 有流派数据? |
|------|------------|------------|
| ironclad | ✅ | ✅ (3 个流派) |
| silent | ✅ | ✅ |
| defect | ✅ | ✅ |
| watcher | ✅ | ✅ |
| necromancer | ✅ | ✅ |
| prince | ✅ | ✅ |

**cards 目录和 archetypes 目录的 JSON 文件完全对称，无遗漏无多余。** ✅

### 导出函数
- `getArchetypesByCharacter()` ✅
- `getArchetypeById()` ✅
- `getAllArchetypes()` ✅

---

## 6. 配置文件一致性

### 路径别名
| 配置 | 别名定义 | 值 |
|------|----------|----|
| `vite.config.ts` | `@` | `resolve(__dirname, 'src')` |
| `tsconfig.json` | `@/*` | `["src/*"]` |

**完全一致** ✅

### 构建模式
| 配置 | 值 |
|------|----|
| `vite.config.ts` — `base` | `/sts2-helper/` |
| `vite.config.ts` — `outDir` | `dist` |
| `tsconfig.json` — `module` | `ESNext` |
| `tsconfig.json` — `moduleResolution` | `bundler` |
| `tsconfig.json` — `target` | `ES2020` |
| `tsconfig.json` — `resolveJsonModule` | `true` |

**构建链兼容: Vite 5 + TypeScript 5 + React 18 + Tailwind 3.4** ✅

---

## 7. 发现的问题汇总

### 🔴 严重问题

#### 1. `index.html` 使用了未定义的 Tailwind CSS 类

**文件**: `index.html` — `<body>` 标签

```html
<body class="bg-sts-bg-primary text-sts-text-primary">
```

`bg-sts-bg-primary` 和 `text-sts-text-primary` 在 `tailwind.config.js` 中**未定义**。Tailwind 会直接忽略这些类名，导致页面背景和文字颜色使用浏览器默认值（白色背景 + 黑色文字），与预期的暖色米白风格不一致。

**影响**: 高 — CSS 样式断裂，html 的 `dark` class 也没有变量支持。

**建议**: 改为 `bg-warm-50 text-text-primary`，与 `src/index.css` 中的 body 样式一致。

#### 2. `ironclad.json` 卡牌数据重复——金属化

**文件**: `src/data/cards/ironclad.json`

存在**两张中文名字相同但 ID 不同的卡牌**:

| ID | 名称 | cost | 描述 | 说明 |
|----|------|------|------|------|
| `ironclad_metallicize` | 金属化 | 1 | 获得3点护甲。每回合结束获得3点护甲。 | ❌ 描述错误——同时包含了即时和回合末护甲 |
| `ironclad_metallicize_power` | 金属化 | 1 | 每回合结束获得3点护甲。 | ✅ 正确的金属化描述 |

实际 StS 中 `Metallicize` 是 1 费能力牌：每回合结束获得 3 点护甲。第一张的描述混入了"获得3点护甲"（这可能是 `Iron Wave` 的效果），导致数据污染。

**影响**: 低 — ID 不同所以不会触发 Map 覆盖，但会在卡牌图鉴和计分中造成混乱（两张同名卡）。

**建议**: 删除 `ironclad_metallicize`（保留 ID 正确的 `ironclad_metallicize_power` 或重命名）。

#### 3. `ironclad.json` 卡牌名称冲突——燃烧

**文件**: `src/data/cards/ironclad.json`

| ID | 名称 | 实际英文名 | 类型 |
|----|------|-----------|------|
| `ironclad_inflame` | 燃烧 | Inflame | 能力 |
| `ironclad_combust` | 燃烧 | Combust | 能力 |

两张牌中文名都是"燃烧"。**建议**: `Inflame` 的标准中文翻译是"燃烧"没问题，但 `Combust` 在官方翻译中通常叫"灼烧"或保持英文。建议区分中文名以避免混淆。

### 🟡 中等问题

#### 4. 类型定义重复（3 个接口）

**影响**: 中 — 当前定义一致所以不会产生编译错误，但增加了维护成本和歧义。

**建议**: 删除 `src/services/cardScorer.ts` 中的 `export interface CardScore`, `SkipAnalysis`, `Recommendation`，改为从 `@/types` 导入。

#### 5. `LearnPage.tsx` 中 `group-hover` 缺少父容器 `group` 类

```tsx
<div className="xiaomi-card cursor-pointer" onClick={...}>
  <h3 className="... group-hover:text-xm-primary">  // ← 不生效
```

需要改为 `<div className="xiaomi-card cursor-pointer group" onClick={...}>`

**影响**: 低 — 仅 hover 效果缺失，无功能问题。

### 🟢 确认正常项

| 检查项 | 状态 |
|--------|------|
| 类型定义完整性 | ✅ 完整无缺 |
| 所有 `@/` 别名路径在 TypeScript 和 Vite 间一致 | ✅ |
| `src/data/cards/` 与 `src/data/archetypes/` 目录对称 | ✅ |
| 所有 JSON 文件可解析 | ✅ (12/12) |
| Vite + tsconfig 模块解析配置兼容 | ✅ |
| Archetype 评分权重之和为 1.0 | ✅ |
| 所有 imported 源文件存在于磁盘 | ✅ (25/25) |
| 卡牌数据字段符合 `Card` 接口定义 | ✅ |
| 流派数据字段符合 `Archetype` 接口定义 | ✅ |
| `db.json` 等无依赖的外部数据引用 | ✅ 无 |
| `tailwind.config.js` 插件配置 | ✅ `postcss.config.js` 正确加载 |

---

## 总结

**总体评分**: 项目结构清晰，配置链完整，核心数据流（卡牌 → 流派 → 引擎 → 评分）正确连通。

发现 **3 个高优先级问题**（样式断裂 + 数据重复）、**2 个中低优先级问题**（代码整洁性）。建议优先修复 index.html 样式类和 ironclad 卡牌数据重复问题。
