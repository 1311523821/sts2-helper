# 08 - 全栈集成分析报告：sts2-helper

> **分析者**: 全栈开发工程师  
> **日期**: 2026-05-04  
> **项目**: sts2-helper（杀戮尖塔2智能选牌助手）  
> **技术栈**: React 18 + TypeScript 5.6 + Vite 5 + TailwindCSS 3.4 + Zustand 5  
> **代码规模**: ~5300 行 TypeScript/TSX + ~25 个 JSON 数据文件  

---

## 目录

1. [模块间耦合分析](#1-模块间耦合分析)
2. [类型系统分析](#2-类型系统分析)
3. [数据流分析](#3-数据流分析)
4. [错误传播分析](#4-错误传播分析)
5. [代码重复分析](#5-代码重复分析)
6. [API一致性分析](#6-api一致性分析)
7. [内存管理分析](#7-内存管理分析)
8. [Web Worker方案](#8-web-worker方案)
9. [PWA支持方案](#9-pwa支持方案)
10. [技术债务清单](#10-技术债务清单)

---

## 1. 模块间耦合分析

### 1.1 依赖关系图

```
┌──────────────────────────────────────────────────────────────────┐
│                        UI Layer (Pages + Components)              │
│  HomePage → gameStore                                             │
│  AnalyzePage → gameStore, cards, CardDisplay, ArchetypePanel,    │
│                RecommendationPanel                                │
│  EncyclopediaPage → cards, CardDisplay                           │
│  LearnPage → archetypes, cards, CardDisplay                      │
│  SimulatorPage → cards, CardDisplay                              │
│  StatsPage → cards, archetypes                                   │
├──────────────────────────────────────────────────────────────────┤
│                        Store Layer (Zustand)                      │
│  gameStore ──→ archetypeEngine ──→ data/cards, data/archetypes,  │
│      │              │                  data/relics                │
│      └──→ cardScorer ──→ data/cards, data/archetypes,            │
│                   │          data/relics                          │
│                   └──→ archetypeEngine (analyzeDeckHealth)        │
│  recordStore ──→ recordManager ──→ data/cards (getCardById)      │
│  settingsStore ──→ localStorage (独立)                            │
│  themeStore ──→ localStorage (独立)                               │
├──────────────────────────────────────────────────────────────────┤
│                        Service Layer                               │
│  cardScorer.ts      → data/cards, data/archetypes, data/relics,  │
│                        archetypeEngine                            │
│  archetypeEngine.ts → data/cards, data/archetypes, data/relics   │
│  saveParser.ts      → 纯函数，无外部依赖 ✅                       │
│  recordManager.ts   → IndexedDB, data/cards                      │
│  dataUpdater.ts     → Remote API, localStorage                   │
├──────────────────────────────────────────────────────────────────┤
│                        Data Layer                                  │
│  cards/index.ts     → 6个JSON文件 → Map<id, Card>                │
│  archetypes/index.ts→ 6个JSON文件 → Record<CharacterId, []>      │
│  relics/index.ts    → 10个JSON文件 → Map<id, Relic>              │
│  combos/index.ts    → 1个JSON文件 → Map<id, ComboData>           │
│  events/index.ts    → 1个JSON文件 → Map<id, GameEvent>           │
│  bosses/index.ts    → 1个JSON文件 → Map<id, BossData>            │
│  keywords.ts        → 纯数据定义                                  │
├──────────────────────────────────────────────────────────────────┤
│                        Storage Layer                               │
│  IndexedDB (game-records) │ localStorage (settings, theme, cache) │
└──────────────────────────────────────────────────────────────────┘
```

### 1.2 🔴 关键耦合问题

#### 问题1：cardScorer ↔ archetypeEngine 循环关注点

`cardScorer.ts` 的 `evaluateSkipOption()` 调用了 `archetypeEngine.analyzeDeckHealth()`，而两个模块的评分逻辑高度重叠：

```typescript
// cardScorer.ts - 第1行就导入了 archetypeEngine
import { analyzeDeckHealth } from './archetypeEngine'

// evaluateSkipOption 内部调用
const healthReport = analyzeDeckHealth(deck)
if (healthReport.overall > 70) { skipValue += 10 }
```

**耦合影响**：修改 `archetypeEngine` 的 `analyzeDeckHealth` 返回结构会直接影响 `cardScorer` 的跳过分析逻辑。两个模块应该通过共享的接口定义解耦。

#### 问题2：gameStore 承担过多职责

`gameStore.ts` 是整个应用的**中心枢纽**，直接依赖了 5 个分析函数：

```typescript
import {
  identifyArchetypes,
  analyzeDeckHealth,
  analyzeCostCurve,
  analyzeCombatBalance,
  detectCombos,
} from '@/services/archetypeEngine'
import { scoreCardOptions, evaluateSkipOption } from '@/services/cardScorer'
```

每次 `addCard`、`removeCard`、`setDeck`、`setRelics`、`addRelic`、`removeRelic`、`analyzeDeck`、`analyzeReward` 都会触发级联分析。Store 不应承担业务逻辑编排的职责。

**建议**：将分析编排逻辑抽取到独立的 `AnalysisService`：

```typescript
// src/services/analysisService.ts
export class AnalysisService {
  static computeFullAnalysis(deck: DeckCard[], character: CharacterId, relics: OwnedRelic[]) {
    return {
      archetypes: identifyArchetypes(deck, character, relics),
      deckHealth: analyzeDeckHealth(deck),
      costCurve: analyzeCostCurve(deck),
      combatBalance: analyzeCombatBalance(deck),
      combos: detectCombos(deck, character),
    }
  }

  static computeRecommendation(options: CardOption[], deck: DeckCard[], ...) {
    // ...
  }
}
```

#### 问题3：recordManager 直接依赖 data/cards

```typescript
// recordManager.ts
import { getCardById } from '@/data/cards'

// reviewRecord 内部
const isMatch = d.chosen === d.recommended
// hypotheticalAnalysis 内部
const altCard = getCardById(alternativeChoice)
```

记录管理器不应直接依赖卡牌数据层。应该通过 store 或注入的方式获取卡牌信息。

### 1.3 耦合度量化

| 模块 | 出度(依赖数) | 入度(被依赖数) | 耦合评级 |
|------|:---:|:---:|:---:|
| gameStore | 7 | 2 | 🔴 高 |
| cardScorer | 4 | 1 | 🟡 中 |
| archetypeEngine | 3 | 2 | 🟡 中 |
| saveParser | 0 | 0 | 🟢 无耦合 |
| recordManager | 2 | 1 | 🟢 低 |
| dataUpdater | 2 | 1 | 🟢 低 |
| data/cards | 0 | 8 | 🟡 被广泛依赖 |
| settingsStore | 0 | 0 | 🟢 无耦合 |
| themeStore | 0 | 0 | 🟢 无耦合 |

---

## 2. 类型系统分析

### 2.1 类型覆盖度评估

**优势**：
- 核心类型定义完善：`Card`, `Archetype`, `Relic`, `GameState`, `GameRecord` 等接口字段丰富
- 使用了联合类型限制枚举值：`CardType`, `CardRarity`, `CharacterId`, `RelicRarity` 等
- `types/index.ts` 统一导出，结构清晰

**🔴 严重问题：大量 `any` 类型**

项目中有 **15+ 处 `any` 类型**，主要集中在 `AnalyzePage.tsx`：

```typescript
// AnalyzePage.tsx - 4个子组件全部用 any
function DeckManager({ filtered, deck, search, setSearch, addCard, removeCard,
  groupMode, setGroupMode, groupedDeck, dragId, handleDragStart,
  handleDragOver, handleDrop }: any) { ... }

function RewardTab({ rewardInput, setRewardInput, handleAddReward, recommendation }: any) { ... }

function StatsTab({ stats, deck }: { stats: any; deck: any[] }) { ... }
```

事件处理中的 `any`：
```typescript
onChange={(e: any) => setSearch(e.target.value)}
onChange={(e: any) => setRewardInput(e.target.value)}
```

### 2.2 类型安全漏洞

#### 漏洞1：`Record<string, string>` 替代精确类型

```typescript
// 多个文件中的常量定义
const TYPE_ICONS: Record<string, string> = { attack: '⚔️', ... }
const TYPE_NAMES: Record<string, string> = { attack: '攻击', ... }
const RARITY_NAMES: Record<string, string> = { basic: '基础', ... }
```

应该使用 `Record<CardType, string>` 和 `Record<CardRarity, string>` 来获得编译时类型检查。

#### 漏洞2：JSON 数据的 `as` 类型断言

```typescript
// cards/index.ts
const cards = data.cards as Card[]  // 没有运行时校验

// archetypes/index.ts
ironclad: ironcladArchetypes as Archetype[]  // 直接断言
```

JSON 文件的内容没有运行时校验，如果 JSON 结构与 TypeScript 接口不匹配，不会在编译时报错。

**建议**：使用 zod 或 valibot 进行运行时校验：

```typescript
import { z } from 'zod'

const CardSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['attack', 'skill', 'power', 'status', 'curse']),
  cost: z.number(),
  // ...
})

const cards = CardSchema.array().parse(data.cards)
```

#### 漏洞3：`!` 非空断言滥用

```typescript
// archetypeEngine.ts
const common = cards[i]!.tags.filter(t => cards[j]!.tags.includes(t))

// recordManager.ts
const db = (event.target as IDBOpenDBRequest).result
```

### 2.3 类型体操机会

#### 机会1：泛型化数据查询接口

当前 6 个数据模块各自实现了类似的查询模式：

```typescript
// cards/index.ts
export function getCardById(id: string): Card | undefined
export function getCardsByCharacter(characterId: CharacterId): Card[]
export function getAllCards(): Card[]
export function searchCards(query: string, characterId?: CharacterId): Card[]

// relics/index.ts
export function getRelicById(id: string): Relic | undefined
export function getRelicsByCharacter(characterId: CharacterId): Relic[]
export function getAllRelics(): Relic[]
export function searchRelics(query: string): Relic[]
```

可以抽取泛型基类：

```typescript
function createDataModule<T extends { id: string; name: string; nameEn: string }>(
  data: T[],
  indexes?: { byCharacter?: boolean; byRarity?: boolean }
) {
  const map = new Map<string, T>()
  for (const item of data) map.set(item.id, item)

  return {
    getById: (id: string): T | undefined => map.get(id),
    getAll: (): T[] => [...map.values()],
    search: (query: string): T[] => {
      const q = query.toLowerCase()
      return [...map.values()].filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.nameEn.toLowerCase().includes(q)
      )
    },
  }
}
```

#### 机会2：Discriminated Union 用于游戏状态

```typescript
// 当前 GameState 没有区分"未初始化"和"已初始化"状态
interface GameState {
  character: CharacterId | null  // null 表示未选择
  deck: DeckCard[]
  // ...
}

// 改进：使用 discriminated union
type GameState =
  | { status: 'uninitialized'; character: null; deck: [] }
  | { status: 'active'; character: CharacterId; deck: DeckCard[]; relics: OwnedRelic[]; floor: number }
```

---

## 3. 数据流分析

### 3.1 完整数据流路径

```
JSON Files (静态数据)
    ↓ import (模块加载时全量解析)
Data Layer (Map 索引, O(1) 查找)
    ↓ 函数调用 (getCardById, getArchetypeById, ...)
Service Layer (cardScorer, archetypeEngine)
    ↓ 计算结果
Zustand Store (gameStore.set())
    ↓ React 订阅
UI Components (useGameStore(selector))
    ↓ 渲染
DOM
```

### 3.2 🔴 数据流瓶颈

#### 瓶颈1：每次牌库变动触发5个分析函数

```typescript
// gameStore.ts - addCard
addCard: (cardId) => {
  const { deck, character, relics } = get()
  const newDeck = [...deck, { cardId, upgraded: false }]
  set({ deck: newDeck })  // 第1次渲染
  if (character) {
    set({
      archetypes: identifyArchetypes(newDeck, character, relics),    // O(n × m)
      deckHealth: analyzeDeckHealth(newDeck),                         // O(n²)
      costCurve: analyzeCostCurve(newDeck),                           // O(n)
      combatBalance: analyzeCombatBalance(newDeck),                   // O(n)
      combos: detectCombos(newDeck, character),                       // O(n × m)
    })  // 第2次渲染
  }
},
```

**问题**：
1. **两次 `set()`** 触发两次 React 渲染周期
2. **5个分析函数各自独立遍历牌库**，没有共享中间计算结果
3. **`analyzeDeckHealth` 内部又调用了 `calcDeckSynergyScore`**（O(n²)），与 `identifyArchetypes` 内部的协同计算重复
4. **没有防抖**，快速连续操作（如批量添加卡牌）会触发大量计算

#### 瓶颈2：数据查询无缓存

```typescript
// cardScorer.ts - calcCardSynergy
function calcCardSynergy(cardId: string, deck: DeckCard[]): number {
  const card = getCardById(cardId)  // 每次调用
  if (!card) return 0
  let synergy = 0
  for (const dc of deck) {
    const other = getCardById(dc.cardId)  // 牌库中每张牌都查一次
    // ...
  }
}
```

对于 30 张牌的牌库，单次 `calcCardSynergy` 调用需要 31 次 `getCardById`。而 `scoreCardOptions` 对每个选项都调用一次，3 个选项 = 93 次 Map 查找。

#### 瓶颈3：协同度 O(n²) 算法

```typescript
// archetypeEngine.ts - calcDeckSynergyScore
for (let i = 0; i < cards.length; i++) {
  for (let j = i + 1; j < cards.length; j++) {
    totalPairs++
    const common = cards[i]!.tags.filter(t => cards[j]!.tags.includes(t))
    if (common.length > 0) synergyPairs++
  }
}
```

30 张牌 = 435 次比较，每次比较涉及 `Array.filter` + `Array.includes`。

### 3.3 数据流优化方案

```typescript
// 方案：合并分析 + 缓存中间结果
function computeFullAnalysis(deck: DeckCard[], character: CharacterId, relics: OwnedRelic[]) {
  // 1. 共享中间数据
  const cardCache = new Map<string, Card>()
  const tagIndex = new Map<string, number>()
  const typeCount = { attack: 0, skill: 0, power: 0 }
  let totalCost = 0

  for (const dc of deck) {
    const card = getCardById(dc.cardId)
    if (!card) continue
    cardCache.set(dc.cardId, card)
    typeCount[card.type as keyof typeof typeCount]++
    totalCost += card.cost
    for (const tag of card.tags) {
      tagIndex.set(tag, (tagIndex.get(tag) || 0) + 1)
    }
  }

  // 2. 基于共享数据计算各维度
  const archetypes = identifyArchetypesWithCache(deck, character, relics, cardCache)
  const deckHealth = analyzeDeckHealthWithCache(deck, cardCache, tagIndex, typeCount)
  const costCurve = analyzeCostCurveWithCache(deck, cardCache)
  const combatBalance = analyzeCombatBalanceWithCache(deck, cardCache, typeCount)
  const combos = detectCombos(deck, character)

  return { archetypes, deckHealth, costCurve, combatBalance, combos }
}
```

---

## 4. 错误传播分析

### 4.1 错误处理模式分类

项目中存在 **3种不一致的错误处理模式**：

#### 模式A：静默吞错（dataUpdater, settingsStore）

```typescript
// settingsStore.ts
function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore - 静默失败
  }
  return {}
}

// dataUpdater.ts
try {
  localStorage.setItem(DATA_VERSION_KEY, version)
} catch {
  // localStorage 不可用 - 静默失败
}
```

**风险**：用户完全不知道操作失败了，可能导致数据丢失。

#### 模式B：错误状态上报（recordStore）

```typescript
// recordStore.ts
try {
  await recordManager.init()
  const records = await recordManager.getAllRecords()
  set({ records, isLoading: false })
} catch (e) {
  set({ error: `初始化失败: ${e instanceof Error ? e.message : '未知错误'}`, isLoading: false })
}
```

**问题**：
- `error` 字符串没有错误代码，不便搜索
- 没有自动清除机制（错误消息会一直显示）
- 没有恢复建议

#### 模式C：返回错误结果（saveParser）

```typescript
// saveParser.ts
static parse(content: string): ParsedSave {
  // 返回包含 errors 数组的结果对象
  return { ..., isValid: errors.length === 0, errors }
}
```

**评价**：这是最合理的模式，但 `errors` 只是 `string[]`，没有错误级别区分。

### 4.2 缺失的全局错误处理

项目没有：
- React Error Boundary
- 全局 unhandled promise rejection 处理
- 统一的错误日志收集
- 用户可见的错误恢复机制

**建议**：

```typescript
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
    // 可以发送到错误收集服务
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

### 4.3 错误传播链路分析

```
用户操作 → UI组件 → store action → service函数 → data查询
                                                    ↓ 错误
                                              service 捕获 → 返回默认值/空结果
                                                    ↓
                                              store 更新 → UI 渲染（可能无提示）
```

**问题**：错误在 service 层被静默吞掉后，UI 层无法知道发生了错误。例如 `getCardById` 返回 `undefined` 时，评分函数会使用默认分数 50，但用户看到的是"未知卡牌"，不知道是数据问题还是输入问题。

---

## 5. 代码重复分析

### 5.1 🔴 跨模块重复

#### 重复1：常量定义重复（5+ 文件）

| 常量 | AnalyzePage | EncyclopediaPage | StatsPage | CardDisplay | RecommendationPanel |
|------|:---:|:---:|:---:|:---:|:---:|
| `TYPE_ICONS` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `TYPE_NAMES` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `RARITY_NAMES` | ❌ | ✅ | ✅ | ✅ | ❌ |
| `RARITY_COLORS` | ❌ | ✅ | ❌ | ✅ | ❌ |

**提取方案**：

```typescript
// src/constants/cardDisplay.ts
import type { CardType, CardRarity } from '@/types'

export const TYPE_ICONS: Record<CardType, string> = {
  attack: '⚔️', skill: '🛡️', power: '⚡', status: '💀', curse: '☠️',
}
export const TYPE_NAMES: Record<CardType, string> = {
  attack: '攻击', skill: '技能', power: '能力', status: '状态', curse: '诅咒',
}
export const RARITY_NAMES: Record<CardRarity, string> = {
  basic: '基础', common: '普通', uncommon: '罕见', rare: '稀有', special: '特殊',
}
export const RARITY_COLORS: Record<CardRarity, string> = {
  basic: 'text-rarity-basic', common: 'text-rarity-common',
  uncommon: 'text-rarity-uncommon', rare: 'text-rarity-rare', special: 'text-rarity-special',
}
```

#### 重复2：协同度计算逻辑重复（2处）

```typescript
// cardScorer.ts - calcCardSynergy
function calcCardSynergy(cardId: string, deck: DeckCard[]): number {
  const card = getCardById(cardId)
  let synergy = 0
  for (const dc of deck) {
    const other = getCardById(dc.cardId)
    const common = card.tags.filter(t => other.tags.includes(t))
    synergy += common.length * 12
  }
  return Math.min(100, synergy)
}

// archetypeEngine.ts - calcDeckSynergyScore
function calcDeckSynergyScore(deck: DeckCard[]): number {
  const cards = deck.map(dc => getCardById(dc.cardId)).filter(Boolean)
  let synergyPairs = 0
  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      const common = cards[i]!.tags.filter(t => cards[j]!.tags.includes(t))
      if (common.length > 0) synergyPairs++
    }
  }
  return totalPairs > 0 ? (synergyPairs / totalPairs) * 100 : 0
}
```

**问题**：两套算法使用不同的计算方式（单卡匹配 vs 卡对匹配），会导致**评分不一致**。

#### 重复3：攻防比例计算重复（3处）

```typescript
// cardScorer.ts - calcCurrentRatio
function calcCurrentRatio(deck: DeckCard[]) {
  let atk = 0, def = 0
  for (const dc of deck) {
    const c = getCardById(dc.cardId)
    if (c?.type === 'attack') atk++
    else if (c?.type === 'skill') def++
  }
  return { attack: atk / t, defense: def / t }
}

// archetypeEngine.ts - calcDeckRatio
function calcDeckRatio(deck: DeckCard[]) {
  let atk = 0, sk = 0, pw = 0
  for (const dc of deck) {
    const card = getCardById(dc.cardId)
    if (card?.type === 'attack') atk++
    else if (card?.type === 'skill') sk++
    else if (card?.type === 'power') pw++
  }
  return { attack: atk / t, skill: sk / t, power: pw / t }
}

// archetypeEngine.ts - analyzeCombatBalance
function analyzeCombatBalance(deck: DeckCard[]) {
  let atk = 0, def = 0, pw = 0
  // 几乎相同的遍历逻辑
}
```

#### 重复4：卡牌遍历模式重复

在 `cardScorer.ts` 和 `archetypeEngine.ts` 中，`deck.map(dc => getCardById(dc.cardId)).filter(Boolean)` 这个模式出现了 **8次**。

### 5.2 可抽取的公共函数

```typescript
// src/utils/deckUtils.ts

/** 获取牌库中所有有效卡牌 */
export function resolveDeckCards(deck: DeckCard[]): Card[] {
  return deck.map(dc => getCardById(dc.cardId)).filter(Boolean) as Card[]
}

/** 计算牌库的类型比例 */
export function calcTypeRatio(deck: DeckCard[]): { attack: number; skill: number; power: number } {
  const cards = resolveDeckCards(deck)
  const total = cards.length || 1
  const counts = { attack: 0, skill: 0, power: 0 }
  for (const card of cards) {
    if (card.type in counts) counts[card.type as keyof typeof counts]++
  }
  return {
    attack: counts.attack / total,
    skill: counts.skill / total,
    power: counts.power / total,
  }
}

/** 计算牌库的费用曲线 */
export function calcCostDistribution(deck: DeckCard[]): number[] {
  const curve = [0, 0, 0, 0] // 0费, 1费, 2费, 3+费
  for (const dc of deck) {
    const card = getCardById(dc.cardId)
    if (!card) continue
    const idx = card.cost >= 3 ? 3 : Math.max(0, card.cost)
    curve[idx]++
  }
  const total = deck.length || 1
  return curve.map(v => v / total)
}

/** 计算牌库协同度（统一算法） */
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

---

## 6. API一致性分析

### 6.1 函数命名不一致

| 模块 | 查询函数 | 命名模式 |
|------|---------|---------|
| cards | `getCardById`, `getCardsByCharacter`, `getAllCards`, `searchCards` | get + By + X |
| archetypes | `getArchetypeById`, `getArchetypesByCharacter`, `getAllArchetypes` | get + By + X |
| relics | `getRelicById`, `getRelicsByCharacter`, `getAllRelics`, `searchRelics` | get + By + X |
| combos | `getComboById`, `getCombosByCharacter`, `getAllCombos`, `getCombosByPower` | get + By + X |
| events | `getEventById`, `getEventsByAct`, `getAllEvents`, `searchEvents` | get + By + X |
| bosses | `getBossById`, `getBossesByAct`, `getAllBosses`, `searchBosses` | get + By + X |

**不一致**：
- `getCombosByPower` 使用 `ByPower` 而非 `ByCharacter`
- `getEventsByAct` 和 `getBossesByAct` 使用 `ByAct` 而非 `ByCharacter`
- `getRelicsForArchetype` 使用 `For` 而非 `By`

### 6.2 返回值约定不一致

```typescript
// data 模块 - 返回 undefined
export function getCardById(id: string): Card | undefined

// service 模块 - 使用默认值
function calcBaseStrength(card: { type: string; rarity: string; cost: number }, floor: number): number {
  // 参数类型是内联对象，不是 Card
}

// store 模块 - 返回 null
export function getRecord(id: string): Promise<GameRecord | null>
```

**建议**：统一使用 `undefined` 表示"未找到"，`null` 表示"空值"。

### 6.3 参数风格不一致

```typescript
// 纯函数风格（archetypeEngine, cardScorer）
export function matchArchetype(deck: DeckCard[], archetype: Archetype, relics: OwnedRelic[]): ArchetypeMatch

// 静态类风格（saveParser）
export class SaveParser {
  static parse(content: string): ParsedSave
  static parseJSON(json: string): ParsedSave
}

// 实例类风格（recordManager, dataUpdater）
export class RecordManager {
  async init(): Promise<void>
  async createRecord(character: CharacterId): Promise<GameRecord>
}
```

**问题**：3种不同的 API 风格并存，增加了学习成本。

### 6.4 Store Action 命名不一致

```typescript
// gameStore - 动词原形
setCharacter, setDeck, addCard, removeCard, clearDeck,
setFloor, setHealth, setMaxHealth, setGold,
setRelics, addRelic, removeRelic,
analyzeDeck, analyzeReward, updateGameState

// recordStore - 动词原形
init, loadRecords, createNewRecord, setCurrentRecord,
finishCurrent, deleteRecord, getStats, reviewRecord, hypothetical

// settingsStore - set + 名词
setTheme, setLanguage, setShowAdvancedAnalysis, setAutoSaveRecords,
setDataRemoteUrl, setFontSize, setCompactMode, resetSettings

// themeStore - 动词原形
toggleTheme, setTheme
```

**不一致**：`finishCurrent` vs `deleteRecord`（一个省略了 Record，一个没有）；`loadRecords` vs `getStats`（一个用 load，一个用 get）。

---

## 7. 内存管理分析

### 7.1 🔴 潜在内存泄漏

#### 泄漏1：Zustand Store 的级联更新

```typescript
// gameStore.ts - addCard
addCard: (cardId) => {
  const newDeck = [...deck, { cardId, upgraded: false }]  // 创建新数组
  set({ deck: newDeck })  // 触发订阅者重渲染
  set({
    archetypes: identifyArchetypes(newDeck, ...),  // 创建新数组
    deckHealth: analyzeDeckHealth(newDeck),          // 创建新对象
    costCurve: analyzeCostCurve(newDeck),            // 创建新对象
    combatBalance: analyzeCombatBalance(newDeck),    // 创建新对象
    combos: detectCombos(newDeck, ...),              // 创建新数组
  })
}
```

每次 `addCard` 创建 **6个新对象/数组**。快速连续操作（如批量导入牌库）会创建大量短生命周期对象，增加 GC 压力。

#### 泄漏2：数据层的全局 Map 缓存

```typescript
// cards/index.ts
const cardMap = new Map<string, Card>()           // 模块级，永不释放
const cardsByCharacter = new Map<CharacterId, Card[]>()
```

这些 Map 在模块加载时创建，生命周期与应用相同。对于 ~427 张卡牌来说不是问题，但如果数据量增长（如添加社区数据），需要注意。

#### 泄漏3：recordStore 的全量记录加载

```typescript
// recordStore.ts
loadRecords: async () => {
  const records = await recordManager.getAllRecords()  // 加载所有记录到内存
  set({ records })
}
```

`GameRecord` 包含 `finalDeck`（牌库快照）和 `decisions`（所有决策历史），单条记录可能有数 KB。100+ 局游戏 = 数 MB 内存。

#### 泄漏4：EncyclopediaPage 的收藏数据

```typescript
// EncyclopediaPage.tsx
const [favorites, setFavorites] = useState<Set<string>>(loadFavorites())

useEffect(() => { saveFavorites(favorites) }, [favorites])
```

`Set` 对象在组件卸载时不会自动清理（但 React 的 `useState` 会在卸载时释放，所以这个不是真正的泄漏）。

### 7.2 大对象生命周期

| 对象 | 创建时机 | 销毁时机 | 大小估算 |
|------|---------|---------|---------|
| cardMap | 模块加载 | 永不 | ~50KB |
| relicMap | 模块加载 | 永不 | ~20KB |
| archetypeData | 模块加载 | 永不 | ~30KB |
| gameStore.archetypes | 每次牌库变动 | 下次变动 | ~5KB |
| gameStore.recommendation | 每次分析 | 下次分析 | ~2KB |
| recordStore.records | 应用启动 | 永不(累积) | 5-50KB/条 |

### 7.3 优化建议

```typescript
// 1. 使用 WeakMap 缓存计算结果
const synergyCache = new WeakMap<DeckCard[], number>()

// 2. 限制 recordStore 的记录数量
const MAX_RECORDS = 100
loadRecords: async () => {
  const records = await recordManager.getRecentRecords(MAX_RECORDS)
  set({ records })
}

// 3. 使用 useDeferredValue 延迟非关键计算
const deferredDeck = useDeferredValue(deck)
const archetypes = useMemo(() => identifyArchetypes(deferredDeck, ...), [deferredDeck])
```

---

## 8. Web Worker方案

### 8.1 当前计算瓶颈

以下计算在主线程执行，可能导致 UI 卡顿：

| 函数 | 复杂度 | 30张牌耗时(估) |
|------|--------|:---:|
| `identifyArchetypes` | O(n × m) | ~5ms |
| `analyzeDeckHealth` | O(n²) | ~3ms |
| `calcDeckSynergyScore` | O(n²) | ~2ms |
| `scoreCardOptions` | O(k × n) | ~2ms |
| `detectCombos` | O(n × m) | ~1ms |
| **总计** | | **~13ms** |

13ms 在 60fps 预算（16.6ms/帧）内，但加上 React 渲染开销，可能偶尔超过一帧。

### 8.2 Web Worker 实现方案

```typescript
// src/workers/analysis.worker.ts
import type { DeckCard, CharacterId, OwnedRelic } from '@/types'

interface AnalysisRequest {
  type: 'FULL_ANALYSIS'
  deck: DeckCard[]
  character: CharacterId
  relics: OwnedRelic[]
}

interface AnalysisResponse {
  type: 'FULL_ANALYSIS_RESULT'
  archetypes: ArchetypeMatch[]
  deckHealth: DeckHealthReport
  costCurve: CostCurveAnalysis
  combatBalance: CombatBalanceAnalysis
  combos: ComboDetection[]
}

self.onmessage = (e: MessageEvent<AnalysisRequest>) => {
  if (e.data.type === 'FULL_ANALYSIS') {
    const { deck, character, relics } = e.data
    // 注意：Worker 中不能直接 import 数据模块
    // 需要将数据通过 postMessage 传入，或在 Worker 中独立加载
    const result: AnalysisResponse = {
      type: 'FULL_ANALYSIS_RESULT',
      archetypes: [], // 实际计算
      deckHealth: {} as any,
      costCurve: {} as any,
      combatBalance: {} as any,
      combos: [],
    }
    self.postMessage(result)
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

  const analyze = useCallback((deck: DeckCard[], character: CharacterId, relics: OwnedRelic[]) => {
    return new Promise<AnalysisResult>((resolve) => {
      const worker = workerRef.current!
      worker.onmessage = (e) => resolve(e.data)
      worker.postMessage({ type: 'FULL_ANALYSIS', deck, character, relics })
    })
  }, [])

  return { analyze }
}
```

### 8.3 Worker 方案的限制

1. **数据传输开销**：通过 `postMessage` 传输大量数据需要序列化/反序列化
2. **数据访问**：Worker 中无法直接访问模块级的 `cardMap`、`archetypeData` 等，需要在 Worker 中重新构建索引
3. **复杂度增加**：需要处理 Worker 的生命周期管理、错误处理、消息协议
4. **收益有限**：当前计算量（~13ms）可能不值得引入 Worker 的额外复杂度

**建议**：先优化算法（减少 O(n²) 为 O(n)），如果仍有性能问题再引入 Worker。

---

## 9. PWA支持方案

### 9.1 当前离线能力

**完全无离线支持**：
- 没有 Service Worker
- 没有 Web App Manifest
- 没有离线缓存策略
- 所有数据通过 Vite 打包进 JS bundle，需要网络加载

### 9.2 PWA 实现方案

#### 9.2.1 Web App Manifest

```json
// public/manifest.json
{
  "name": "STS2 助手 - 杀戮尖塔2智能选牌助手",
  "short_name": "STS2 助手",
  "description": "分析牌库，智能推荐选牌",
  "start_url": "/sts2-helper/",
  "display": "standalone",
  "background_color": "#FFFAF5",
  "theme_color": "#FF6B35",
  "icons": [
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

#### 9.2.2 Service Worker（使用 Workbox）

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
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.json$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'data-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 7 * 24 * 60 * 60 },
            },
          },
        ],
      },
    }),
  ],
})
```

#### 9.2.3 离线数据策略

```typescript
// src/services/offlineManager.ts
const CACHE_VERSION = 'v1'
const DATA_CACHE = `sts2-data-${CACHE_VERSION}`

export async function precacheData() {
  const cache = await caches.open(DATA_CACHE)
  // 预缓存所有 JSON 数据文件
  const dataUrls = [
    '/sts2-helper/data/cards/ironclad.json',
    '/sts2-helper/data/cards/silent.json',
    // ... 所有数据文件
  ]
  await Promise.all(dataUrls.map(url => cache.add(url)))
}

export async function getCachedData<T>(url: string): Promise<T | null> {
  const cache = await caches.open(DATA_CACHE)
  const response = await cache.match(url)
  if (!response) return null
  return response.json()
}
```

### 9.3 PWA 收益评估

| 功能 | 收益 | 实现复杂度 |
|------|------|:---:|
| 离线访问 | 高 - 用户可以在无网络时使用 | 中 |
| 安装到桌面 | 中 - 提升用户粘性 | 低 |
| 推送通知 | 低 - 本应用不需要实时通知 | 高 |
| 后台同步 | 低 - 数据同步需求不强 | 高 |

**建议**：实现基础 PWA（Manifest + Service Worker 缓存），优先保证离线可用性。

---

## 10. 技术债务清单

### 10.1 按优先级排列

#### 🔴 P0 - 立即修复（影响正确性/可用性）

| # | 债务项 | 影响范围 | 修复工作量 |
|---|--------|---------|:---:|
| 1 | 流派/Combo 引用 68 处断裂卡牌ID | prince/necromancer 流派完全失效 | 2天 |
| 2 | 42%的Combo引用不存在的卡牌 | Combo检测失效 | 1天 |
| 3 | 故障机器人/储君卡牌描述包含主观评价 | 工具专业性 | 1天 |
| 4 | 双主题Store冲突（settingsStore vs themeStore） | 暗色模式异常 | 2h |
| 5 | IndexedDB 读写分离导致并发数据丢失 | 记录数据不一致 | 4h |
| 6 | X费牌(cost=-1)费用曲线计算错误 | 费用分析偏差 | 1h |

#### 🟡 P1 - 近期优化（影响性能/体验）

| # | 债务项 | 影响范围 | 修复工作量 |
|---|--------|---------|:---:|
| 7 | 无代码分割，首屏加载全部页面 | 首屏性能 | 4h |
| 8 | 大量 `any` 类型（15+处） | 类型安全 | 1天 |
| 9 | 常量定义跨5+文件重复 | 维护成本 | 2h |
| 10 | 协同度计算重复（2套不同算法） | 评分不一致 | 4h |
| 11 | gameStore 级联更新触发两次渲染 | 性能 | 4h |
| 12 | 协同度 O(n²) 算法 | 大牌库卡顿 | 4h |
| 13 | EncyclopediaPage 无列表虚拟化 | 图鉴性能 | 4h |
| 14 | 无 Error Boundary | 运行时崩溃 | 2h |
| 15 | Modal 缺少焦点管理和 ARIA | 无障碍 | 4h |
| 16 | 移动端无汉堡菜单 | 移动端体验 | 4h |
| 17 | 92%卡牌缺少升级描述 | 用户体验 | 持续 |
| 18 | 流派权重全部相同，未差异化 | 推荐准确性 | 2h |
| 19 | recordManager 全量加载所有记录 | 内存占用 | 4h |
| 20 | settingsStore 手动持久化模式冗余 | 代码质量 | 2h |

#### 🟢 P2 - 中期规划（影响可维护性/扩展性）

| # | 债务项 | 影响范围 | 修复工作量 |
|---|--------|---------|:---:|
| 21 | 无测试代码（0%覆盖率） | 回归风险 | 持续 |
| 22 | 缺少 hooks/ 和 constants/ 目录 | 代码组织 | 2h |
| 23 | 数据层 JSON 无运行时校验 | 数据安全 | 4h |
| 24 | cardScorer 硬编码遗物协同规则 | 可扩展性 | 4h |
| 25 | 缺少 404 页面 | 用户体验 | 1h |
| 26 | LearnPage 使用内部状态代替路由 | SEO/分享 | 4h |
| 27 | 拖拽排序半成品（handleDrop 为空） | 代码质量 | 4h或移除 |
| 28 | 搜索无防抖 | 搜索体验 | 1h |
| 29 | `noUnusedLocals` 和 `noUnusedParameters` 为 false | 代码质量 | 1h |
| 30 | 事件数据仅12条，覆盖率24% | 功能完整性 | 持续 |
| 31 | 缺失7个核心关键词定义 | 教学价值 | 2h |
| 32 | 遗物数据缺少 boss/shop/event 类型 | 遗物推荐 | 持续 |
| 33 | comboData 与 archetype.combos 数据源重复 | 数据一致性 | 2h |
| 34 | localStorage 缓存无 LRU 淘汰 | 存储溢出风险 | 2h |
| 35 | IndexedDB 无版本迁移框架 | 数据库升级 | 4h |

#### 🔵 P3 - 长期愿景（功能扩展）

| # | 债务项 | 影响范围 | 修复工作量 |
|---|--------|---------|:---:|
| 36 | 无 PWA/Service Worker | 离线能力 | 1天 |
| 37 | 无国际化框架 | 多语言 | 2天 |
| 38 | 无 Web Worker | 重计算性能 | 1天 |
| 39 | 无 CI/CD 流水线 | 开发效率 | 4h |
| 40 | 无数据版本管理和回滚机制 | 数据安全 | 1天 |
| 41 | 无多设备同步 | 用户体验 | 3天 |
| 42 | 无社区数据贡献机制 | 数据质量 | 5天 |
| 43 | 无 A/B 测试框架 | 算法优化 | 3天 |

### 10.2 技术债务全景图

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

### 10.3 修复路线图

```
Week 1: 数据修复 + 架构解耦
├── Day 1-2: 修复68处断裂引用，补充缺失卡牌数据
├── Day 3: 合并双主题Store，修复X费计算
├── Day 4: 抽取公共函数（deckUtils, constants），消除重复
└── Day 5: 合并 IndexedDB 读写事务，添加 Error Boundary

Week 2: 性能优化 + 类型安全
├── Day 1: 添加 React.lazy 代码分割
├── Day 2: 消除 any 类型，添加 Props 接口
├── Day 3: 优化协同度算法（O(n²) → O(n)），添加 tag 倒排索引
├── Day 4: gameStore 级联更新合并为单次 set()
└── Day 5: EncyclopediaPage 列表虚拟化，搜索防抖

Week 3: 用户体验 + 基础设施
├── Day 1: 移动端汉堡菜单，404页面
├── Day 2: Modal 焦点管理，ARIA标签
├── Day 3: Vitest 测试框架搭建 + 核心算法测试
├── Day 4: LearnPage 嵌套路由，完善拖拽或移除
└── Day 5: 数据校验脚本，补充升级描述

Week 4+: 持续改进
├── PWA 支持
├── 国际化框架
├── CI/CD 流水线
├── 数据版本管理
└── 社区数据贡献机制
```

---

## 附录A：跨模块问题交叉引用

| 问题 | 涉及模块 | 其他报告提及 |
|------|---------|-------------|
| 流派引用断裂 | data/archetypes ↔ data/cards | 03游戏设计(P0), 05数据(P0) |
| 协同度重复计算 | cardScorer ↔ archetypeEngine | 02后端(P0), 05数据(P1) |
| 双主题Store | settingsStore ↔ themeStore | 01前端(P0), 02后端(P1) |
| 无代码分割 | App.tsx, vite.config.ts | 01前端(P0), 04QA(间接) |
| 大量any类型 | AnalyzePage.tsx | 01前端(P0) |
| 无测试覆盖 | 全局 | 04QA(核心议题) |
| 描述质量参差 | data/cards JSON | 03游戏设计(P0), 05数据(P1) |
| 协同度O(n²) | archetypeEngine | 02后端(P1), 05数据(P1) |
| gameStore级联更新 | gameStore → services | 01前端(P0), 02后端(P1) |
| IndexedDB事务 | recordManager | 02后端(P1) |

## 附录B：模块间接口契约

```typescript
// data → service 的隐式契约
interface DataServiceContract {
  getCardById(id: string): Card | undefined       // 永不抛异常
  getArchetypeById(id: string): Archetype | undefined
  getRelicById(id: string): Relic | undefined
}

// service → store 的隐式契约
interface ServiceStoreContract {
  identifyArchetypes(deck, character, relics): ArchetypeMatch[]  // 返回排序后的数组
  analyzeDeckHealth(deck): DeckHealthReport                      // 总分 0-100
  scoreCardOptions(options, deck, archetypes, floor, relics): CardScore[]  // 按分数降序
}

// store → UI 的隐式契约
interface StoreUIContract {
  character: CharacterId | null    // null = 未选择
  deck: DeckCard[]                 // 可能为空
  archetypes: ArchetypeMatch[]     // 可能为空
  recommendation: Recommendation | null  // null = 未分析
  isLoading: boolean
  error: string | null
}
```

---

> **总结**：sts2-helper 项目的架构设计合理，模块职责基本清晰，类型系统框架完善。主要的全栈集成问题集中在：(1) 数据层引用断裂导致算法失效；(2) 跨模块重复逻辑增加维护成本；(3) 错误处理模式不一致；(4) 缺少离线能力和测试覆盖。建议按 P0→P1→P2 优先级分 4 周逐步修复，重点先解决数据完整性和架构解耦问题。
