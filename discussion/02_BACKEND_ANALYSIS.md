# 后端/服务架构深度分析报告

> **分析范围**: `src/services/*.ts`, `src/stores/*.ts`, `src/data/**/*.ts`, `src/data/**/*.json`
> **分析日期**: 2026-05-04
> **项目**: sts2-helper (杀戮尖塔2智能选牌助手)
> **技术栈**: React 18 + TypeScript + TailwindCSS + Zustand

---

## 目录

1. [服务层架构总览](#1-服务层架构总览)
2. [数据层设计分析](#2-数据层设计分析)
3. [存档解析器 (SaveParser)](#3-存档解析器-saveparser)
4. [评分算法 (CardScorer)](#4-评分算法-cardscorer)
5. [流派引擎 (ArchetypeEngine)](#5-流派引擎-archetypeengine)
6. [记录管理器 (RecordManager)](#6-记录管理器-recordmanager)
7. [数据更新机制 (DataUpdater)](#7-数据更新机制-dataupdater)
8. [状态管理 (Zustand Stores)](#8-状态管理-zustand-stores)
9. [错误处理与容错](#9-错误处理与容错)
10. [性能优化分析](#10-性能优化分析)
11. [未来扩展路径](#11-未来扩展路径)
12. [改进建议汇总](#12-改进建议汇总)

---

## 1. 服务层架构总览

### 1.1 模块划分

项目服务层由5个核心模块组成，各自承担明确职责：

```
┌─────────────────────────────────────────────────────────┐
│                    Zustand Stores (状态层)                │
│  gameStore │ recordStore │ settingsStore │ themeStore    │
├─────────────────────────────────────────────────────────┤
│                  Services (业务逻辑层)                    │
│  cardScorer │ archetypeEngine │ recordManager            │
│  saveParser │ dataUpdater                               │
├─────────────────────────────────────────────────────────┤
│                  Data Layer (数据层)                      │
│  cards/ │ archetypes/ │ relics/ │ combos/ │ events/     │
│  bosses/ │ keywords.ts                                   │
├─────────────────────────────────────────────────────────┤
│              Storage (持久化层)                           │
│  IndexedDB │ localStorage                                │
└─────────────────────────────────────────────────────────┘
```

### 1.2 依赖关系分析

**依赖图（箭头表示"依赖于"）：**

```
gameStore ──→ archetypeEngine ──→ data (cards, archetypes, relics)
    │              │
    ├──→ cardScorer ──→ data (cards, archetypes, relics)
    │              │
    │              └──→ archetypeEngine (analyzeDeckHealth)
    │
recordStore ──→ recordManager ──→ data/cards

settingsStore ──→ localStorage (独立，无服务依赖)
themeStore    ──→ localStorage (独立，无服务依赖)

dataUpdater   ──→ Remote API (独立模块)
saveParser    ──→ 纯函数，无外部依赖
```

**关键发现：**
- `cardScorer` 和 `archetypeEngine` 存在**循环关注点**：`cardScorer.evaluateSkipOption()` 调用了 `archetypeEngine.analyzeDeckHealth()`，而 `archetypeEngine` 的评分逻辑与 `cardScorer` 高度重叠。
- `saveParser` 是纯静态类，无副作用，设计良好。
- `dataUpdater` 是唯一的网络 I/O 模块，与本地数据完全解耦。

### 1.3 接口设计评价

**优点：**
- 服务层采用**纯函数 + 静态类**的混合模式，`archetypeEngine` 和 `cardScorer` 导出纯函数，便于测试和复用。
- 类型系统完善，`ParsedSave`, `ArchetypeMatch`, `CardScore` 等接口定义清晰。
- 数据模块统一通过 `index.ts` 导出，提供 `getById`, `getByCharacter`, `search` 三种查询模式。

**问题：**

```typescript
// 当前：cardScorer 和 archetypeEngine 都有协同度计算，逻辑重复
// cardScorer.ts
function calcCardSynergy(cardId: string, deck: DeckCard[]): number { ... }

// archetypeEngine.ts
function calcDeckSynergyScore(deck: DeckCard[]): number { ... }
```

两套协同度算法使用不同的计算方式：
- `calcCardSynergy`：单卡 vs 牌库，按 tag 匹配数 × 12 累加
- `calcDeckSynergyScore`：牌库内所有卡对，按"有共同 tag 的卡对比例"

这会导致**评分不一致**：同一牌库在不同上下文中得到不同的协同度评分。

---

## 2. 数据层设计分析

### 2.1 数据模型完整性

**Card 模型**（最完善）：

```typescript
interface Card {
  id: string; name: string; nameEn: string;
  character: CharacterId; type: CardType; rarity: CardRarity;
  cost: number; description: string;
  keywords: string[]; tags: string[];
  effects?: CardEffect[];           // 结构化效果
  upgradedEffects?: CardEffect[];   // 升级效果
  upgradedCost?: number;
  imageUrl?: string;
  dataSource?: DataSource;
  dataVersion?: string;
}
```

**实际 JSON 数据中的缺失：**

检查 `ironclad.json` 发现，大部分卡牌**缺少 `effects` 字段**。JSON 中只有 `description` 文本描述，没有结构化的 `effects` 数组。这意味着：

```typescript
// cardScorer.ts 中的校验
if (!card.effects || card.effects.length === 0) {
  issues.push(`卡牌 ${card.name} 缺少效果数据`)
}
```

这条校验在实际运行中会为**几乎所有卡牌**触发警告。`effects` 字段目前是可选的（`effects?: CardEffect[]`），但评分算法实际上没有使用它——评分完全基于 `tags`、`type`、`rarity`、`cost` 这些粗粒度属性。

**Relic 模型**（较完善）：

JSON 数据中遗物有 `effects` 字段，但结构较简单：
```json
{
  "effects": [{ "trigger": "on_combat_start", "description": "战斗结束恢复6HP", "power": 6 }]
}
```

`trigger` 类型丰富（15种），但 `power` 只是单个数字，无法表达复合效果。

### 2.2 索引优化

数据模块全部使用**启动时全量构建 Map 索引**的策略：

```typescript
// cards/index.ts
const cardMap = new Map<string, Card>()
const cardsByCharacter = new Map<CharacterId, Card[]>()

for (const data of allCardData) {
  const cards = data.cards as Card[]
  cardsByCharacter.set(data.character as CharacterId, cards)
  for (const card of cards) {
    cardMap.set(card.id, card)
  }
}
```

**评价：**
- ✅ `getCardById()` 是 O(1) 查找，性能优秀
- ✅ `getCardsByCharacter()` 是 O(1) 查找
- ❌ `searchCards()` 是 O(n) 全量遍历，每次调用都遍历所有卡牌
- ❌ 没有按 `tags` 建立倒排索引，tag 相关查询（协同度计算中最频繁的操作）效率低

**遗物模块**的索引设计更完善：

```typescript
// relics/index.ts - 三重索引
const relicMap = new Map<string, Relic>()
const relicsByCharacter = new Map<string, Relic[]>()
const relicsByRarity = new Map<string, Relic[]>()
```

### 2.3 查询效率瓶颈

**最大瓶颈：协同度计算的 O(n²) 复杂度**

```typescript
// archetypeEngine.ts - calcDeckSynergyScore
function calcDeckSynergyScore(deck: DeckCard[]): number {
  const cards = deck.map(dc => getCardById(dc.cardId)).filter(Boolean)
  // O(n²) 双重循环
  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      totalPairs++
      const common = cards[i]!.tags.filter(t => cards[j]!.tags.includes(t))
      if (common.length > 0) synergyPairs++
    }
  }
}
```

对于30张牌的牌库，需要 435 次比较，每次比较涉及 tag 数组的 filter+includes。这在 `addCard`/`removeCard` 每次触发重新分析时都会执行。

**建议的优化方案：**

```typescript
// 使用 tag 倒排索引，将 O(n²) 降为 O(n × t)
function calcDeckSynergyScoreOptimized(deck: DeckCard[]): number {
  const tagCount = new Map<string, number>()
  let totalCards = 0

  for (const dc of deck) {
    const card = getCardById(dc.cardId)
    if (!card) continue
    totalCards++
    for (const tag of card.tags) {
      tagCount.set(tag, (tagCount.get(tag) || 0) + 1)
    }
  }

  // 协同度 = 有2+张卡共享的tag数 / 总tag种类数
  let sharedTags = 0
  let totalTags = tagCount.size
  for (const count of tagCount.values()) {
    if (count >= 2) sharedTags++
  }

  return totalTags > 0 ? (sharedTags / totalTags) * 100 : 0
}
```

---

## 3. 存档解析器 (SaveParser)

### 3.1 解析策略

`SaveParser` 采用**双格式自动检测**策略：

```
输入 → 空检查 → JSON检测（{/[开头） → JSON解析
                                    ↓ 失败
                              文本格式解析（KV对）
```

**JSON 解析链路：**
1. 尝试 `JSON.parse()`
2. 支持嵌套结构：`data.current_save || data.save || data`
3. 字段提取使用**候选键名**策略：`[key, `current_${key}`]`
4. 数字字段有 fallback 值

**文本解析链路：**
1. 按行分割，提取 KV 对（以 `:` 分隔）
2. 支持中英文键名：`角色`/`character`, `楼层`/`floor`
3. 血量支持 `65/80` 格式
4. 牌库支持逗号分隔，`+` 前缀/后缀表示升级

### 3.2 容错机制评价

**做得好的地方：**

```typescript
// 每个解析步骤都有 try-catch 和 fallback
private static extractNumber(data, key, fallback, errors): number {
  const candidates = [key, `current_${key}`]
  for (const k of candidates) {
    const val = data[k]
    if (typeof val === 'number' && !isNaN(val)) return val
    if (typeof val === 'string') {
      const parsed = parseInt(val, 10)
      if (!isNaN(parsed)) return parsed
    }
  }
  return fallback  // 始终有兜底值
}
```

**存在的问题：**

1. **角色识别的中英文映射不完整**：

```typescript
// parseCharacterText 中的中文映射
const cnMap = {
  '铁甲战士': 'ironclad', '战士': 'ironclad',
  '静默猎人': 'silent', '猎人': 'silent',
  // 缺少: '猎手', '刺客' 等常见别称
}
```

2. **牌库解析的升级标记检测过于简单**：

```typescript
// 只支持 + 前缀或后缀
const upgraded = id.startsWith('+') || id.endsWith('+')
// 缺少: _upgraded, _plus, (升级) 等常见格式
```

3. **缺少数据验证**：解析后的 `deck` 中的 `cardId` 不会验证是否存在于卡牌数据库中。用户输入错误的卡牌ID不会被发现。

4. **错误收集但不分类**：所有错误都推入 `errors: string[]`，没有错误级别（warning/error/fatal）的区分。

### 3.3 格式兼容性

当前支持：
- ✅ 原生 JSON（游戏存档直接导出）
- ✅ 嵌套 JSON（`current_save`, `save` 包装）
- ✅ 自定义文本 KV 格式
- ✅ 中英文混合输入

**缺失：**
- ❌ 不支持 XML 格式（部分存档工具使用）
- ❌ 不支持 Steam Cloud 存档的二进制格式
- ❌ 不支持 Base64 编码的存档
- ❌ 没有存档版本号检测，无法处理不同游戏版本的格式差异

---

## 4. 评分算法 (CardScorer)

### 4.1 多维度评分体系

评分算法采用**6维度加权模型**：

```
总分 = 基础强度×0.20 + 流派适配×0.25 + 协同度×0.20
     + 楼层适配×0.15 + 遗物协同×0.10 + 牌库健康×0.10
```

**各维度分析：**

#### 4.1.1 基础强度 (20%)

```typescript
function calcBaseStrength(card, floor): number {
  let s = 50  // 基础分
  if (card.type === 'attack' && floor < 15) s += 10
  if (card.type === 'power' && floor > 20) s += 10
  if (card.rarity === 'rare') s += 15
  if (card.rarity === 'uncommon') s += 5
  if (card.cost <= 1) s += 5
  if (card.cost === 0) s += 5
  return Math.min(100, s)
}
```

**问题：**
- 基础分50对所有卡牌相同，没有区分"打击"和"恶魔形态"的实际强度差异
- 稀有度加分是固定的（rare +15），但实际稀有牌之间强度差异很大
- 没有使用 `effects` 数据来量化实际伤害/格挡数值

#### 4.1.2 流派适配 (25%)

```typescript
function calcArchetypeFit(card, archetypes, reasons): number {
  for (const am of archetypes.slice(0, 3)) {
    const archetype = getArchetypeById(am.archetypeId)
    if (isCore) fit = Math.max(fit, 60 + isCore.weight * 0.4)
    else if (isImportant) fit = Math.max(fit, 40 + isImportant.weight * 0.3)
    else if (isSupport) fit = Math.max(fit, 20)
  }
}
```

**评价：** ✅ 这是评分中最合理的维度。直接利用了 `archetype.json` 中定义的卡牌权重数据，有明确的数据支撑。

#### 4.1.3 协同度 (20%)

```typescript
function calcCardSynergy(cardId, deck): number {
  for (const dc of deck) {
    const common = card.tags.filter(t => other.tags.includes(t))
    synergy += common.length * 12
  }
  return Math.min(100, synergy)
}
```

**问题：**
- 每个共同 tag 固定加12分，没有区分 tag 的重要性（"力量"和"基础"的协同价值完全不同）
- 牌库越大，协同度越高（更多卡 = 更多匹配机会），存在**牌库大小偏差**
- 没有考虑 tag 的权重或稀有度

#### 4.1.4 楼层适配 (15%)

```typescript
function calcFloorAdaptation(card, floor): number {
  if (floor < 10) {
    if (card.type === 'attack') score += 15
    if (card.cost <= 1) score += 10
  } else if (floor < 20) {
    if (card.rarity === 'rare' || card.rarity === 'uncommon') score += 10
  } else {
    if (card.type === 'power') score += 15
    if (card.rarity === 'rare') score += 10
  }
}
```

**问题：**
- 楼层分段过于粗糙（<10, 10-20, >20），没有考虑具体 BOSS 即将到来的情况
- 没有结合当前血量、金币等状态信息
- 3费以上的卡在后期 +5 分的逻辑过于简单

#### 4.1.5 遗物协同 (10%)

```typescript
function calcRelicSynergy(cardId, relics): number {
  for (const owned of relics) {
    const commonTags = card.tags.filter(t => relic.tags.includes(t))
    synergy += commonTags.length * 20
    // 硬编码的特殊协同
    if (relic.tags.includes('力量') && card.tags.includes('力量')) synergy += 15
  }
}
```

**问题：**
- 特殊协同是**硬编码**的，只有3组（力量、过牌、消耗），不可扩展
- 遗物的 `trigger` 信息完全没用上（如 `on_play_attack` 触发的遗物应该给攻击牌加分）

#### 4.1.6 牌库健康度 (10%)

```typescript
function calcDeckHealthContribution(card, deck): number {
  if (ratio.attack > 0.5 && card.type === 'skill') score += 20
  if (ratio.defense > 0.5 && card.type === 'attack') score += 20
  if (card.type === 'power') score += 10
  if (card.cost <= 1) score += 5
}
```

**评价：** ✅ 逻辑清晰，直接弥补牌库短板。但阈值（0.5）过于固定，不同流派的理想比例不同。

### 4.2 跳过分析 (Skip Analysis)

```typescript
export function evaluateSkipOption(options, deck, archetypes, floor, relics): SkipAnalysis {
  let skipValue = 30
  if (deck.length < 15) skipValue += 15
  if (deck.length > 30) skipValue += 25
  if (archetypes[0]?.score > 40 && bestScore < 40) skipValue += 20
  if (healthReport.overall > 70) skipValue += 10
  if (floor < 10) skipValue -= 15
  if (floor % 16 === 0) skipValue -= 10
}
```

**问题：**
- 跳过价值的计算与选牌评分使用**完全不同的逻辑体系**，缺乏可比性
- `shouldSkip = skipValue > bestScore` 的比较方式不够精细——跳过价值和卡牌评分的"分"含义不同
- 没有考虑"跳过也是决策"的上下文（如已确定流派但选项全是不匹配的基础牌）

### 4.3 算法准确性总体评价

| 维度 | 评分 | 说明 |
|------|------|------|
| 数据支撑 | ⭐⭐⭐ | 流派适配有数据支撑，其他维度依赖硬编码规则 |
| 权重合理性 | ⭐⭐⭐ | 25%流派适配权重最高，合理；但遗物10%偏低 |
| 可扩展性 | ⭐⭐ | 硬编码的规则难以维护，新增角色/卡牌需要修改代码 |
| 一致性 | ⭐⭐ | cardScorer 和 archetypeEngine 有重复逻辑 |
| 准确性 | ⭐⭐⭐ | 对典型场景表现尚可，边界情况处理不足 |

---

## 5. 流派引擎 (ArchetypeEngine)

### 5.1 匹配算法

```typescript
export function matchArchetype(deck, archetype, relics): ArchetypeMatch {
  // 核心卡匹配：加权命中率
  const coreCardScore = (coreScore / coreTotal) * 100

  // 重要卡匹配
  const importantCardScore = (impScore / impTotal) * 100

  // 辅助卡匹配
  const supportCardScore = (supScore / supTotal) * 100

  // 牌型比例偏差
  const ratioScore = Math.max(0, (1 - ratioDiff / 2) * 100)

  // 费用曲线偏差
  const costCurveScore = Math.max(0, (1 - costDiff) * 100)

  // 协同度
  const synergyScore = calcDeckSynergyScore(deck)

  // 加权总分
  const totalScore = Math.round(
    coreCardScore * w.coreCardMatch +
    importantCardScore * w.importantCardMatch +
    supportCardScore * w.supportCardMatch +
    ratioScore * w.ratioMatch +
    costCurveScore * w.costCurveMatch +
    synergyScore * w.synergyBonus +
    relicBonus  // 遗物加分（不在权重体系内）
  )
}
```

**关键发现：**

1. **遗物加分游离于权重体系之外**：`relicBonus` 是直接加到总分上的，不受 `scoringWeights` 控制。这意味着遗物加分可能导致总分超过100（虽然有 `Math.min(100, ...)` 的截断）。

2. **遗物协同检测过于粗糙**：

```typescript
// 只检查标签是否出现在流派名称/描述中
for (const tag of relic.tags) {
  if (archetype.description.includes(tag) || archetype.name.includes(tag)) {
    relicBonus += 5
  }
}
```

这种"字符串包含"的检测方式不可靠。例如，描述中提到"力量"的流派会匹配所有带"力量"标签的遗物，但实际协同可能很弱。

3. **牌型比例计算的分母问题**：

```typescript
function calcDeckRatio(deck) {
  const total = deck.length || 1  // 包含了所有牌类型
  return { attack: atk / total, skill: sk / total, power: pw / total }
}
```

这里只计算了 attack/skill/power 三种类型的比例，但分母包含了所有类型（包括 status 和 curse）。如果牌库中有状态牌或诅咒牌，比例之和不等于1。

### 5.2 Combo 检测

```typescript
export function detectCombos(deck, characterId): ComboDetection[] {
  for (const archetype of archetypes) {
    for (const combo of archetype.combos) {
      const owned = combo.cards.filter(c => deckIds.includes(c))
      const missing = combo.cards.filter(c => !deckIds.includes(c))
      // ...
    }
  }
}
```

**问题：**
- Combo 数据**同时存在于两个地方**：`archetypes/*.json` 的 `combos` 字段 和 `combos/all.json`。`detectCombos` 只从 archetypes 中读取，忽略了独立的 `combos/all.json`。
- 没有检测跨流派的 Combo 组合。
- Combo 的"完成度"只看是否集齐卡牌，没有考虑打出顺序和时机。

### 5.3 牌库健康度分析

```typescript
export function analyzeDeckHealth(deck): DeckHealthReport {
  const overall = Math.round(
    balance.rating * 0.3 +
    (costCurve.rating === 'good' ? 80 : ...) * 0.2 +
    cardQuality * 0.25 +
    synergy * 0.25
  )
}
```

**问题：**
- `cardQuality` 的计算只看稀有度（rare=3, uncommon=2, common=1），完全忽略卡牌的实际效果价值
- `overall` 分数的权重是硬编码的，不同流派对"健康"的定义应该不同（力量流不需要太多防御牌）

---

## 6. 记录管理器 (RecordManager)

### 6.1 IndexedDB 使用

```typescript
const DB_NAME = 'sts2-helper'
const DB_VERSION = 1
const STORE_NAME = 'game-records'

request.onupgradeneeded = (event) => {
  const db = (event.target as IDBOpenDBRequest).result
  if (!db.objectStoreNames.contains(STORE_NAME)) {
    const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
    store.createIndex('character', 'character', { unique: false })
    store.createIndex('result', 'result', { unique: false })
    store.createIndex('startTime', 'startTime', { unique: false })
  }
}
```

**评价：**
- ✅ 使用 `keyPath: 'id'` 作为主键，合理
- ✅ 建立了 `character`, `result`, `startTime` 三个索引
- ❌ 缺少复合索引（如 `character + result` 的组合查询）
- ❌ `DB_VERSION = 1`，没有版本迁移机制

### 6.2 数据迁移风险

当前只有一个 Object Store，版本号为1。如果未来需要：
- 添加新字段到 `GameRecord`
- 添加新的 Object Store（如 `deck-snapshots`）
- 修改索引结构

需要编写 `onupgradeneeded` 的迁移逻辑。当前代码中**完全没有迁移框架**。

**建议的迁移模式：**

```typescript
// 版本迁移框架
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

### 6.3 性能问题

**全量加载问题：**

```typescript
async getAllRecords(): Promise<GameRecord[]> {
  return new Promise((resolve, reject) => {
    const request = store.getAll()  // 一次性加载所有记录
    request.onsuccess = () => resolve(request.result || [])
  })
}
```

当记录数量增长后（比如100+局游戏），`getAll()` 会加载所有数据到内存。`GameRecord` 包含 `finalDeck`（牌库快照）和 `decisions`（所有决策历史），单条记录可能很大。

**建议：**
- 使用游标分页查询代替 `getAll()`
- 列表查询时只加载摘要字段（`id`, `character`, `result`, `startTime`, `finalFloor`）
- 详情查询时才加载完整记录

### 6.4 事务管理

```typescript
async addDecision(recordId: string, decision: Decision): Promise<void> {
  const record = await this.getRecord(recordId)  // 事务1: 读
  if (!record) throw new Error(...)
  record.decisions.push(decision)
  await this.saveRecord(record)  // 事务2: 写
}
```

**问题：** 读取和写入是**两个独立事务**，在并发场景下可能丢失更新。如果两个操作同时修改同一记录，后写入的会覆盖先写入的。

**建议使用单事务：**

```typescript
async addDecision(recordId: string, decision: Decision): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = this.getDB().transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const getReq = store.get(recordId)
    getReq.onsuccess = () => {
      const record = getReq.result
      if (!record) { reject(new Error('记录不存在')); return }
      record.decisions.push(decision)
      store.put(record)  // 同一事务内写入
    }
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(new Error('操作失败'))
  })
}
```

---

## 7. 数据更新机制 (DataUpdater)

### 7.1 增量更新策略

```typescript
async updateCards(currentCards, manifest): Promise<{updated, errors}> {
  // 1. 比对 hash 找出变更卡牌
  for (const entry of manifest.cards) {
    const localHash = currentCards.get(entry.id) ? DataUpdater.hashCard(local) : ''
    if (localHash !== entry.hash) toUpdate.push(entry.id)
  }

  // 2. 分批获取（每批20张）
  const batchSize = 20
  for (let i = 0; i < toUpdate.length; i += batchSize) {
    const response = await fetch(`${remoteBaseUrl}/cards/batch`, {
      method: 'POST',
      body: JSON.stringify({ ids: batch }),
      signal: AbortSignal.timeout(10000),
    })
  }
}
```

**评价：**
- ✅ 增量更新设计合理，只拉取变更数据
- ✅ 分批请求避免单次请求过大
- ✅ 使用 `AbortSignal.timeout()` 设置超时

**问题：**

1. **Hash 算法太简单**：

```typescript
static hashCard(card: Card): string {
  const str = `${card.id}:${card.name}:${card.cost}:${card.description}:${card.effects?.length || 0}`
  return DataUpdater.simpleHash(str)
}
```

只用了5个字段计算 hash，如果卡牌的 `tags`、`keywords`、`rarity` 等字段变化，不会被检测到。

2. **没有并发控制**：多个 batch 请求是串行的，没有利用 Promise.all 并行化。

3. **没有重试机制**：batch 请求失败后直接 `continue`，不会重试。

### 7.2 版本管理

```typescript
saveVersion(version: string): void {
  localStorage.setItem(DATA_VERSION_KEY, version)
}

getLocalVersion(): string {
  return localStorage.getItem(DATA_VERSION_KEY) || '0.0.0'
}
```

**问题：**
- 版本号存储在 localStorage，与 IndexedDB 的游戏记录数据不在同一个存储系统
- 没有语义化版本比较（`'0.3.0' !== '0.3.1'` 会触发全量更新，即使差异很小）
- 没有版本回退机制

### 7.3 缓存策略

```typescript
cacheData(key: string, data: unknown): void {
  const cache = JSON.parse(localStorage.getItem(DATA_CACHE_KEY) || '{}')
  cache[key] = { data, timestamp: Date.now() }
  localStorage.setItem(DATA_CACHE_KEY, JSON.stringify(cache))
}

getCachedData<T>(key: string, maxAge: number = 3600000): T | null {
  if (Date.now() - entry.timestamp > maxAge) return null
  return entry.data as T
}
```

**问题：**
- localStorage 有 5-10MB 的大小限制，缓存大量卡牌数据可能溢出
- 没有 LRU 淘汰策略，缓存只增不减
- `maxAge` 默认1小时，但卡牌数据更新频率可能很低（天/周级别），可以更长

---

## 8. 状态管理 (Zustand Stores)

### 8.1 Store 职责分析

| Store | 状态 | 职责 | 评价 |
|-------|------|------|------|
| `gameStore` | 角色、牌库、遗物、楼层、分析结果 | 游戏状态 + 分析触发 | ⚠️ 职责过重 |
| `recordStore` | 记录列表、当前记录、统计 | 记录 CRUD | ✅ 职责清晰 |
| `settingsStore` | 主题、语言、高级选项 | 用户偏好 | ✅ 职责清晰 |
| `themeStore` | 亮/暗主题 | 主题切换 | ⚠️ 与 settingsStore 重叠 |

### 8.2 gameStore 的级联更新问题

```typescript
addCard: (cardId) => {
  const { deck, character, relics } = get()
  const newDeck = [...deck, { cardId, upgraded: false }]
  set({ deck: newDeck })
  if (character) {
    set({
      archetypes: identifyArchetypes(newDeck, character, relics),
      deckHealth: analyzeDeckHealth(newDeck),
      costCurve: analyzeCostCurve(newDeck),
      combatBalance: analyzeCombatBalance(newDeck),
      combos: detectCombos(newDeck, character),
    })
  }
},
```

**关键问题：**

1. **每次 addCard/removeCard 触发5个分析函数**：`identifyArchetypes`, `analyzeDeckHealth`, `analyzeCostCurve`, `analyzeCombatBalance`, `detectCombos`。这些函数内部都遍历牌库，造成大量重复计算。

2. **两次 `set()` 调用**：第一次设置 `deck`，第二次设置分析结果。React 会渲染两次。

3. **分析函数之间没有共享中间结果**：`analyzeDeckHealth` 内部会重新计算攻防比例，`analyzeCombatBalance` 也计算了一遍，`identifyArchetypes` 内部又计算了一遍。

**建议的优化：**

```typescript
addCard: (cardId) => {
  const { deck, character, relics } = get()
  const newDeck = [...deck, { cardId, upgraded: false }]

  if (character) {
    // 一次性计算所有分析结果
    const analysis = computeFullAnalysis(newDeck, character, relics)
    set({ deck: newDeck, ...analysis })
  } else {
    set({ deck: newDeck })
  }
},
```

### 8.3 themeStore 与 settingsStore 的重叠

`themeStore` 使用 Zustand 的 `persist` 中间件单独管理主题，而 `settingsStore` 也有 `theme` 字段。两套主题系统并存，可能导致状态不一致。

```typescript
// themeStore - 使用 persist 中间件
export const useThemeStore = create<ThemeState>()(
  persist((set) => ({
    theme: 'light',
    toggleTheme: () => set(state => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  }), { name: 'sts2-theme' })
)

// settingsStore - 手动 localStorage
setTheme: (theme) => {
  set({ theme })
  saveSettings({ ...get(), theme })
}
```

---

## 9. 错误处理与容错

### 9.1 异常捕获模式

项目中存在两种错误处理模式：

**模式A：静默吞错（dataUpdater, settingsStore）**

```typescript
// dataUpdater.ts
try {
  localStorage.setItem(DATA_VERSION_KEY, version)
} catch {
  // localStorage 不可用 - 静默失败
}

// settingsStore.ts
function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore
  }
  return {}
}
```

**模式B：错误状态上报（recordStore）**

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

**问题：**
- 模式A的风险：用户完全不知道数据操作失败了
- 模式B只设置了 `error` 字符串，但没有**清除机制**（错误消息会一直显示）
- 没有全局错误边界或统一的错误处理中间件

### 9.2 降级方案

**数据加载降级：**

```typescript
// dataUpdater.ts - 远程不可用时返回 { hasUpdate: false }
async checkForUpdate(currentVersion) {
  if (!this.remoteBaseUrl) return { hasUpdate: false }
  try {
    const response = await fetch(...)
    if (!response.ok) return { hasUpdate: false }
  } catch {
    return { hasUpdate: false }
  }
}
```

✅ 远程数据不可用时自动降级为本地数据，设计合理。

**存档解析降级：**

```typescript
// saveParser.ts - JSON失败后尝试文本格式
if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
  try {
    return SaveParser.parseJSON(trimmed)
  } catch {
    // 不是有效JSON，尝试文本格式
  }
}
return SaveParser.parseText(trimmed)
```

✅ 多格式降级策略，但缺少最终失败时的用户友好提示。

### 9.3 用户提示

`recordStore` 的错误信息使用中文，但只有 `error` 字符串，没有：
- 错误代码（便于搜索和定位）
- 恢复建议（"请刷新页面重试"等）
- 自动消失机制（错误消息会一直显示直到手动清除）

---

## 10. 性能优化分析

### 10.1 计算缓存

**当前状态：完全没有缓存。**

每次 `addCard` 或 `removeCard` 都会重新计算所有分析结果。以一个30张牌的牌库为例：

```
addCard("ironclad_inflame")
  → identifyArchetypes()     // 遍历所有流派 × 所有核心/重要/辅助卡
  → analyzeDeckHealth()      // 遍历牌库，计算比例
  → analyzeCostCurve()       // 遍历牌库，计算费用分布
  → analyzeCombatBalance()   // 遍历牌库，计算攻防比
  → detectCombos()           // 遍历所有流派的所有Combo
```

每个函数内部还会调用 `getCardById()` 多次。虽然 `getCardById` 是 O(1)，但总调用次数 = 5个函数 × 30张牌 × 平均3次查找 = ~450次 Map 查找。

**建议引入 `useMemo` 式的计算缓存：**

```typescript
import { useMemo } from 'react'

// 或者在 store 层面实现
let cachedDeckHash = ''
let cachedAnalysis: AnalysisResult | null = null

function computeAnalysis(deck, character, relics) {
  const hash = deck.map(c => c.cardId).sort().join(',')
  if (hash === cachedDeckHash && cachedAnalysis) return cachedAnalysis
  cachedDeckHash = hash
  cachedAnalysis = { /* 计算 */ }
  return cachedAnalysis
}
```

### 10.2 懒加载

**当前状态：所有数据在模块加载时全量初始化。**

```typescript
// cards/index.ts - 模块顶层执行
const cardMap = new Map<string, Card>()
for (const data of allCardData) {
  for (const card of cards) {
    cardMap.set(card.id, card)
  }
}
```

这意味着：
- 6个角色的卡牌 JSON + 10个遗物 JSON + 1个 Combo JSON + 1个 Event JSON + 1个 Boss JSON = **19个 JSON 文件**在应用启动时全部解析
- 即使用户只玩"铁甲战士"，其他5个角色的数据也会被加载

**建议：**

```typescript
// 按角色懒加载
const characterDataCache = new Map<CharacterId, Card[]>()

export async function loadCharacterCards(characterId: CharacterId): Promise<Card[]> {
  if (characterDataCache.has(characterId)) return characterDataCache.get(characterId)!
  const data = await import(`./cards/${characterId}.json`)
  const cards = data.cards as Card[]
  characterDataCache.set(characterId, cards)
  for (const card of cards) cardMap.set(card.id, card)
  return cards
}
```

### 10.3 Web Worker

**当前状态：没有使用 Web Worker。**

所有计算（协同度 O(n²)、流派匹配、评分）都在主线程执行。在以下场景可能造成 UI 卡顿：

- 牌库较大（30+张）时的协同度计算
- 同时匹配6个流派 × 每个流派检查核心/重要/辅助卡
- 5个分析函数串行执行

**建议将重计算移到 Worker：**

```typescript
// analysis.worker.ts
self.onmessage = (e) => {
  const { deck, character, relics } = e.data
  const result = {
    archetypes: identifyArchetypes(deck, character, relics),
    deckHealth: analyzeDeckHealth(deck),
    costCurve: analyzeCostCurve(deck),
    combatBalance: analyzeCombatBalance(deck),
    combos: detectCombos(deck, character),
  }
  self.postMessage(result)
}

// gameStore.ts
const analysisWorker = new Worker(new URL('./analysis.worker.ts', import.meta.url))
analysisWorker.onmessage = (e) => set(e.data)
```

---

## 11. 未来扩展路径

### 11.1 后端 API 设计

当前项目是纯前端应用，所有数据存储在浏览器本地。如果需要后端，建议：

```
API 设计（RESTful）:

GET  /api/cards?character=ironclad     # 卡牌查询
GET  /api/archetypes/:characterId      # 流派数据
GET  /api/relics?character=ironclad    # 遗物数据
POST /api/records                      # 保存游戏记录
GET  /api/records?character=ironclad   # 查询记录
GET  /api/stats                        # 统计数据
POST /api/analyze                      # 服务端分析（重计算）
POST /api/data/sync                    # 数据同步
GET  /api/data/manifest                # 数据版本清单
```

**关键设计决策：**
- 分析计算应该在**客户端还是服务端**？当前的 O(n²) 协同度计算在客户端已经够用，但如果引入更复杂的算法（如蒙特卡洛模拟），可能需要服务端
- 记录同步需要**冲突解决策略**（last-write-wins vs merge）

### 11.2 多设备同步

**当前存储架构的限制：**

```
localStorage (settings, theme, data version)
    ↕ 无法跨设备同步
IndexedDB (game records)
    ↕ 无法跨设备同步
```

**建议方案：**

```typescript
// 同步接口设计
interface SyncManager {
  // 导出本地数据为可传输格式
  exportData(): Promise<SyncPayload>

  // 导入数据（合并策略）
  importData(payload: SyncPayload, strategy: 'merge' | 'replace'): Promise<void>

  // 增量同步
  sync(lastSyncTime: string): Promise<SyncDelta>
}

interface SyncPayload {
  version: string
  records: GameRecord[]
  settings: Partial<SettingsState>
  timestamp: string
  checksum: string
}
```

### 11.3 社区数据

**数据模型已预留扩展字段：**

```typescript
// Card 已有
dataSource?: 'manual' | 'wiki' | 'game_data' | 'community' | 'ai_generated'
dataVersion?: string

// Relic 已有
dataSource: 'manual' | 'wiki' | 'game_data' | 'community' | 'ai_generated'
```

**建议的社区数据架构：**

```
社区贡献流程:
用户提交卡牌数据 → 审核队列 → 合并到主数据 → 推送更新

数据来源追踪:
每条数据记录 dataSource 和 dataVersion
支持数据回溯和审计
```

### 11.4 可扩展性改进清单

| 优先级 | 改进项 | 复杂度 | 影响 |
|--------|--------|--------|------|
| P0 | 统一协同度计算，消除重复逻辑 | 低 | 一致性 |
| P0 | tag 倒排索引，优化查询性能 | 低 | 性能 |
| P1 | 分析结果缓存，避免重复计算 | 中 | 性能 |
| P1 | IndexedDB 事务合并，避免读写分离 | 中 | 正确性 |
| P1 | 合并 themeStore 和 settingsStore | 低 | 可维护性 |
| P2 | 按角色懒加载数据 | 中 | 启动性能 |
| P2 | 记录分页查询 | 中 | 可扩展性 |
| P2 | 错误处理统一框架 | 中 | 用户体验 |
| P3 | Web Worker 重计算 | 高 | 性能 |
| P3 | 数据迁移框架 | 中 | 可维护性 |
| P3 | 后端 API + 多设备同步 | 高 | 功能 |

---

## 12. 改进建议汇总

### 12.1 高优先级（立即可做）

#### 12.1.1 统一协同度计算

```typescript
// src/services/synergy.ts - 抽取为独立模块
export function calcSynergy(deck: DeckCard[]): number {
  const tagCount = new Map<string, number>()
  for (const dc of deck) {
    const card = getCardById(dc.cardId)
    if (!card) continue
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

// cardScorer.ts 和 archetypeEngine.ts 统一调用此函数
```

#### 12.1.2 建立 tag 倒排索引

```typescript
// src/data/cards/index.ts
const tagIndex = new Map<string, Set<string>>() // tag → cardIds

for (const card of cardMap.values()) {
  for (const tag of card.tags) {
    if (!tagIndex.has(tag)) tagIndex.set(tag, new Set())
    tagIndex.get(tag)!.add(card.id)
  }
}

export function getCardsByTag(tag: string): Card[] {
  const ids = tagIndex.get(tag) || new Set()
  return Array.from(ids).map(id => cardMap.get(id)!).filter(Boolean)
}
```

#### 12.1.3 合并 themeStore

```typescript
// 删除 themeStore.ts，在 settingsStore 中统一管理
// settingsStore.ts
setTheme: (theme) => {
  set({ theme })
  applyTheme(theme)  // 直接应用
  saveSettings({ ...get(), theme })
}
```

### 12.2 中优先级（下个迭代）

#### 12.2.1 分析结果缓存

```typescript
// src/services/analysisCache.ts
let lastDeckSignature = ''
let cachedResults: AnalysisResults | null = null

export function getOrComputeAnalysis(deck, character, relics): AnalysisResults {
  const sig = `${character}:${deck.map(c=>c.cardId).sort().join(',')}`
  if (sig === lastDeckSignature && cachedResults) return cachedResults
  lastDeckSignature = sig
  cachedResults = {
    archetypes: identifyArchetypes(deck, character, relics),
    deckHealth: analyzeDeckHealth(deck),
    // ...
  }
  return cachedResults
}
```

#### 12.2.2 IndexedDB 事务优化

```typescript
// 将 addDecision 的读写合并为单事务
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

### 12.3 低优先级（长期规划）

#### 12.3.1 数据懒加载

使用动态 `import()` 按角色加载卡牌数据，减少初始加载时间。

#### 12.3.2 错误处理框架

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
  }

  on(listener: (error: AppError) => void) {
    this.listeners.push(listener)
    return () => { this.listeners = this.listeners.filter(l => l !== listener) }
  }
}

export const errorHandler = new ErrorHandler()
```

#### 12.3.3 Web Worker 分析

将 `identifyArchetypes`, `analyzeDeckHealth`, `calcDeckSynergyScore` 等重计算函数移到 Web Worker 中执行，避免阻塞主线程。

---

## 附录A：代码质量指标

| 指标 | 现状 | 目标 |
|------|------|------|
| TypeScript 严格模式 | 部分使用（`!` 非空断言较多） | 减少 `!` 使用，增加类型守卫 |
| 代码重复 | cardScorer/archetypeEngine 有重复 | 抽取公共模块 |
| 测试覆盖 | 无测试文件 | 核心算法需要单元测试 |
| 文档注释 | 中文注释较完整 | 补充 JSDoc 参数说明 |
| 错误处理 | 不一致（静默/上报混合） | 统一错误框架 |

## 附录B：数据文件统计

| 数据类型 | 文件数 | 数据量（估算） |
|----------|--------|----------------|
| 卡牌 (cards) | 6 JSON | ~300+ 卡牌 |
| 流派 (archetypes) | 6 JSON | ~20+ 流派 |
| 遗物 (relics) | 10 JSON | ~100+ 遗物 |
| Combo | 1 JSON | ~30+ Combo |
| 事件 (events) | 1 JSON | ~20+ 事件 |
| Boss | 1 JSON | ~10+ Boss |
| **总计** | **25 JSON** | **~480+ 数据条目** |

---

> **结论**：sts2-helper 的服务层架构整体设计合理，模块职责清晰，类型系统完善。主要问题集中在：(1) 算法层面的重复逻辑和硬编码规则；(2) 性能层面缺少缓存和懒加载；(3) 持久化层面的事务管理和迁移框架缺失。这些问题都不难解决，优先处理 P0 级别的统一协同度计算和 tag 索引优化，即可显著提升代码质量和运行性能。
