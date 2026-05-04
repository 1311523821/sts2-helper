# 05 - 数据分析报告：sts2-helper 项目数据质量与算法优化

> 分析日期: 2026-05-04
> 分析师: Data Analyst Subagent
> 项目版本: v1.0.0 (数据版本 v0.3.0)

---

## 目录

1. [执行摘要](#1-执行摘要)
2. [数据完整性审计](#2-数据完整性审计)
3. [数据质量检查](#3-数据质量检查)
4. [评分算法分析](#4-评分算法分析)
5. [流派匹配算法分析](#5-流派匹配算法分析)
6. [协同度计算分析](#6-协同度计算分析)
7. [数据标准化分析](#7-数据标准化分析)
8. [数据采集方案](#8-数据采集方案)
9. [算法优化建议](#9-算法优化建议)
10. [数据可视化方案](#10-数据可视化方案)
11. [数据版本管理](#11-数据版本管理)
12. [附录：详细统计数据](#12-附录详细统计数据)

---

## 1. 执行摘要

### 1.1 关键发现

| 维度 | 状态 | 严重程度 |
|------|------|----------|
| 卡牌数据引用完整性 | **68处断裂引用** | 🔴 严重 |
| 升级描述缺失 | **393/427张牌缺失** (92%) | 🔴 严重 |
| 重名卡牌 | 4组重名 (3个角色) | 🟡 中等 |
| 流派评分权重 | 全部相同，未差异化 | 🟡 中等 |
| Combos/Events/Bosses | 数据量极少 | 🟡 中等 |
| 评分算法协同计算 | O(n²) 复杂度，tag粒度粗糙 | 🟡 中等 |
| 遗物数据来源 | 新角色为 community 手动标注 | 🟢 低 |

### 1.2 总体评估

项目数据框架设计合理，JSON Schema 统一，但**数据填充严重不足**。核心问题集中在：

1. **亡灵契约师(prince)** 和 **亡灵契约师(necromancer)** 的流派定义引用了大量不存在的卡牌，导致流派匹配完全失效
2. 92% 的卡牌缺少升级描述，用户体验不完整
3. Combos 仅 19 条，Events 仅 12 条，远不能覆盖游戏实际内容
4. 所有 21 个流派使用完全相同的评分权重，丧失了流派差异化

---

## 2. 数据完整性审计

### 2.1 各角色卡牌数量统计

| 角色 | 英文ID | 卡牌总数 | attack | skill | power | basic | common | uncommon | rare | special |
|------|--------|----------|--------|-------|-------|-------|--------|----------|------|---------|
| 铁甲战士 | ironclad | 80 | 29 | 27 | 24 | 3 | 22 | 38 | 17 | 0 |
| 静默猎人 | silent | 55 | 19 | 27 | 9 | 4 | 17 | 20 | 14 | 0 |
| 故障机器人 | defect | 94 | 35 | 36 | 23 | 4 | 24 | 47 | 19 | 0 |
| 观者 | watcher | 53 | 19 | 26 | 8 | 4 | 21 | 16 | 12 | 0 |
| 亡灵契约师 | necromancer | 79 | 34 | 29 | 16 | 4 | 17 | 33 | 23 | 2 |
| 储君 | prince | 66 | 30 | 25 | 11 | 3 | 11 | 35 | 17 | 0 |
| **总计** | - | **427** | 166 | 170 | 91 | 22 | 112 | 189 | 102 | 2 |

### 2.2 卡牌分布分析

**稀有度分布异常：**

- **prince** 的 common 牌仅 11 张（占比 17%），远低于其他角色的平均水平（~28%）
- **defect** 的 uncommon 牌 47 张（占比 50%），占比过高
- **necromancer** 拥有 2 张 `special` 稀有度卡牌，是唯一使用此稀有度的角色

**类型分布：**

- **watcher** 的 power 牌仅 8 张（占比 15%），能力牌偏少
- **ironclad** 的类型分布最均衡（attack 36%, skill 34%, power 30%）
- **defect** 的 attack 和 skill 牌数量接近（35 vs 36），但 power 牌有 23 张

### 2.3 流派引用完整性 - 🔴 严重问题

**总共有 68 处断裂引用**（流派定义中的卡牌 ID 在卡牌数据中不存在）：

| 角色 | 断裂引用数 | 受影响流派 |
|------|-----------|-----------|
| prince | 24 | 全部 3 个流派 |
| necromancer | 22 | 全部 3 个流派 |
| watcher | 7 | 3 个流派 |
| silent | 6 | 2 个流派 |
| ironclad | 5 | 3 个流派 |
| defect | 4 | 3 个流派 |

**严重程度分析：**

- **prince** 的所有 3 个流派的核心卡、重要卡、辅助卡全部引用了不存在的卡牌 ID，**流派匹配系统对 prince 完全失效**
- **necromancer** 同样严重，3 个流派共 22 处断裂引用
- 这意味着当玩家选择 prince 或 necromancer 时，`matchArchetype()` 函数将无法匹配到任何核心卡，`coreCardScore` 恒为 0

**缺失卡牌 ID 清单（需要补充到卡牌数据中）：**

```
# prince 缺失 (8 个唯一 ID)
prince_succession, prince_crown_slash, prince_kingmaker,
prince_throne_room, prince_royal_guard, prince_royal_decree,
prince_tax, prince_knights_charge

# necromancer 缺失 (10 个唯一 ID)
necromancer_raise_dead, necromancer_undead_legion, necromancer_bone_armor,
necromancer_bone_storm, necromancer_soul_drain, necromancer_dark_pact,
necromancer_graveyard_shift, necromancer_death_coil, necromancer_phylactery

# watcher 缺失 (5 个唯一 ID)
watcher_indignation, watcher_prostrate, watcher_simulate_dao,
watcher_conclude, watcher_judgement, watcher_well_laid_plans,
watcher_just_lucky

# silent 缺失 (5 个唯一 ID)
silent_poison_cloud, silent_catalyst_power, silent_bouncing_flask,
silent_sneaky_strike, silent_expertise, silent_bullet_time

# ironclad 缺失 (2 个唯一 ID)
ironclad_metallicize_power, ironclad_burning_pact, ironclad_dark_pact

# defect 缺失 (4 个唯一 ID)
defect_auto_shields, defect_darkness, defect_recursion, defect_core_memory
```

### 2.4 Combos 数据引用完整性

19 条 Combo 中，有多条引用了不存在的卡牌：

| Combo 名称 | 角色 | 缺失卡牌 |
|-----------|------|---------|
| 黑暗循环 | defect | defect_darkness, defect_recursion |
| 亡灵大军 | necromancer | necromancer_undead_legion, necromancer_bone_storm |
| 契约循环 | necromancer | necromancer_dark_pact, necromancer_graveyard_shift |
| 王者之力 | prince | prince_succession, prince_kingmaker, prince_crown_slash |
| 攻击爆发 | prince | prince_kingmaker, prince_crown_slash, prince_throne_room |
| 弃牌能量循环 | silent | silent_sneaky_strike |
| 神格爆发 | watcher | watcher_conclude, watcher_judgement |
| 保留灵盾 | watcher | watcher_well_laid_plans |

**共 16 处 Combo 断裂引用**，导致 `detectCombos()` 函数对这些 Combo 永远返回 `isComplete: false`。

---

## 3. 数据质量检查

### 3.1 字段完整性

所有 427 张卡牌均包含以下必要字段：
- `id` ✅
- `name` ✅
- `nameEn` ✅
- `type` ✅
- `rarity` ✅
- `cost` ✅
- `description` ✅
- `keywords` ✅
- `tags` ✅
- `character` ✅

**缺失字段：`upgradedDescription`**

| 角色 | 总卡牌数 | 有升级描述 | 缺失数 | 缺失率 |
|------|---------|-----------|--------|--------|
| defect | 94 | 2 | 92 | 97.9% |
| ironclad | 80 | 3 | 77 | 96.3% |
| necromancer | 79 | 17 | 62 | 78.5% |
| prince | 66 | 8 | 58 | 87.9% |
| silent | 55 | 2 | 53 | 96.4% |
| watcher | 53 | 2 | 51 | 96.2% |
| **总计** | **427** | **34** | **393** | **92.0%** |

### 3.2 数据类型一致性

| 字段 | 期望类型 | 实际情况 | 状态 |
|------|---------|---------|------|
| cost | number (int) | 全部为 int，包含 -1 (X费) | ✅ |
| type | enum string | attack/skill/power 三种 | ✅ |
| rarity | enum string | basic/common/uncommon/rare/special | ✅ |
| keywords | string[] | 全部为数组 | ✅ |
| tags | string[] | 全部为数组 | ✅ |
| id | string | 格式统一: `{char}_{name}` | ✅ |

**cost 特殊值说明：**
- `-1` 表示 X 费牌（如 defect 的 `Reinforced Body`、`Tempest`、`Multicast`）
- `0` 表示零费牌
- 范围：-1 到 4

### 3.3 重名卡牌检测 - 🟡 中等风险

| 角色 | 重名 | 卡牌1 | 卡牌2 |
|------|------|-------|-------|
| ironclad | 燃烧 | `ironclad_inflame` (power, common) | `ironclad_combust` (power, uncommon) |
| ironclad | 无惧疼痛 | `ironclad_feel_no_pain` (power, uncommon) | `ironclad_fearless_pain` (power, uncommon) |
| necromancer | 收割 | `necromancer_reap` (attack, rare) | `necromancer_harvest` (attack, common) |
| silent | 准备 | `silent_prepared` (skill, common) | `silent_setup` (skill, uncommon) |

**影响分析：**
- 代码中使用 `id` 作为唯一标识符，因此重名不会导致程序错误
- 但会影响用户体验（搜索"燃烧"会返回两张牌）
- 建议：确认是否为翻译问题，若是不同卡牌应使用不同中文名

### 3.4 遗物数据质量

| 分类 | 数量 | dataSource |
|------|------|-----------|
| common | 13 | 全部 manual |
| uncommon | 10 | 全部 manual |
| rare | 8 | 全部 manual |
| starter | 6 | 4 manual + 2 community |
| defect | 4 | 全部 manual |
| ironclad | 5 | 全部 manual |
| necromancer | 3 | 全部 community |
| prince | 3 | 全部 community |
| silent | 4 | 全部 manual |
| watcher | 3 | 全部 manual |

**问题：** 新角色（necromancer, prince）的遗物数据来源为 `community`，可靠性较低。部分 starter 遗物与角色专属遗物存在 ID 冲突（如 `burning_blood` vs `ironclad_burning_blood`）。

### 3.5 Events 和 Bosses 数据

- **Events**: 仅 12 条（Act 1: 8, Act 2: 3, Act 3: 1）
- **Bosses**: 11 条（Act 1: 5, Act 2: 3, Act 3: 3）

数据量严重不足。STS2 实际有数十个事件和多个 Boss，当前数据仅覆盖一小部分。

---

## 4. 评分算法分析

### 4.1 选牌评分权重结构

`cardScorer.ts` 中的 `scoreCardOptions()` 使用 6 个维度加权求和：

| 维度 | 权重 | 计算函数 | 分析 |
|------|------|---------|------|
| baseStrength 基础强度 | 20% | `calcBaseStrength` | 基于 type/rarity/cost/楼层 |
| archetypeFit 流派适配 | 25% | `calcArchetypeFit` | 基于流派核心/重要/辅助卡匹配 |
| synergy 牌库协同 | 20% | `calcCardSynergy` | 基于 tag 重叠数量 |
| floorAdaptation 楼层适配 | 15% | `calcFloorAdaptation` | 前期偏好攻击，后期偏好能力 |
| relicSynergy 遗物协同 | 10% | `calcRelicSynergy` | 基于遗物 tag 与卡牌 tag 匹配 |
| deckHealth 牌库健康度 | 10% | `calcDeckHealthContribution` | 基于攻防比例平衡 |

**权重总和 = 100%** ✅

### 4.2 各维度评分分布分析

#### 4.2.1 baseStrength 分析

```typescript
function calcBaseStrength(card, floor): number {
  let s = 50  // 基础分 50
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
- 基础分 50 过高，导致所有卡牌得分都在 50-100 之间，区分度不足
- `floor` 参数参与了 baseStrength 计算，但 baseStrength 语义上应该是"卡牌本身的强度"，与楼层无关
- cost 判断有重叠：`cost <= 1` 和 `cost === 0` 会叠加（0费牌得 +10），但 1费牌只得 +5

**评分范围：**
- 最低：50（普通 common，高费，floor 中期）
- 最高：100（rare 0费攻击牌，floor 前期）
- 实际范围：50-95

#### 4.2.2 archetypeFit 分析

```typescript
if (isCore) fit = Math.max(fit, 60 + isCore.weight * 0.4)      // 60-100
if (isImportant) fit = Math.max(fit, 40 + isImportant.weight * 0.3)  // 40-70
if (isSupport) fit = Math.max(fit, 20)                           // 固定 20
```

**问题：**
- 核心卡得分 60-100，重要卡 40-70，辅助卡固定 20 —— 梯度合理
- 但如果卡牌不在任何流派中，fit = 0，且会添加"与当前流派方向不太匹配"的原因
- `weight * 0.4` 和 `weight * 0.3` 的缩放系数是硬编码的，不同流派无法差异化

#### 4.2.3 synergy 协同度分析

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
- 每个匹配 tag 贡献 12 分，但 tag 粒度不一致（"攻击"太泛，"电球"很精确）
- 大牌库（30+张）很容易达到 100 分上限，小牌库则区分度不足
- 没有考虑 tag 的权重差异（"攻击"tag 和"电球"tag 的协同价值完全不同）
- 时间复杂度 O(n)，n 为牌库大小，可接受

#### 4.2.4 floorAdaptation 分析

```
floor < 10:  attack +15, cost<=1 +10, rare +5
floor 10-20: rare/uncommon +10
floor > 20:  power +15, rare +10, cost>=2 +5
```

**问题：**
- 楼层分界过于粗糙（只有 3 档），实际游戏中每个楼层的策略需求不同
- `cost >= 2` 在后期加分的逻辑存疑——高费牌在后期也不一定好

#### 4.2.5 relicSynergy 分析

```typescript
// 标签匹配
const commonTags = card.tags.filter(t => relic.tags.includes(t))
synergy += commonTags.length * 20
// 特殊协同检测（硬编码）
if (relic.tags.includes('力量') && card.tags.includes('力量')) synergy += 15
```

**问题：**
- 特殊协同检测是硬编码的，只有 3 种特殊规则（力量、过牌、消耗）
- 没有覆盖其他重要协同（如"消耗"+"死灵之枝"、"弃牌"+"铜钹"等）
- 遗物数量通常很少（0-5个），导致此维度大部分时候为 0

#### 4.2.6 deckHealthContribution 分析

```typescript
if (ratio.attack > 0.5 && card.type === 'skill') score += 20
if (ratio.defense > 0.5 && card.type === 'attack') score += 20
if (card.type === 'power') score += 10
if (card.cost <= 1) score += 5
```

**问题：**
- 只考虑 attack/skill 比例，没有考虑 power 比例
- 阈值 0.5 过于简单，没有考虑流派的 preferredRatio
- `calcCurrentRatio` 函数中，`def` 只统计 `type === 'skill'`，但实际上"防御"不等于"skill"

### 4.3 跳过分析（evaluateSkipOption）

```typescript
let skipValue = 30  // 基础跳过值
// 牌库 < 15: +15
// 牌库 > 30: +25
// 流派匹配度 > 40 且最佳选项 < 40: +20
// 牌库健康度 > 70: +10
// floor < 10: -15
// floor % 16 === 0: -10
```

**问题：**
- `floor % 16 === 0` 用于检测 BOSS 奖励，但 STS2 的 BOSS 楼层可能不是 16 的倍数
- 跳过值的计算与最佳选项评分的比较缺乏校准（skipValue 范围 10-75，optionScore 范围 50-100）

---

## 5. 流派匹配算法分析

### 5.1 匹配机制

`matchArchetype()` 使用多维度加权评分：

| 维度 | 权重来源 | 权重值 |
|------|---------|--------|
| coreCardMatch | archetype.scoringWeights | 0.35 |
| importantCardMatch | archetype.scoringWeights | 0.25 |
| supportCardMatch | archetype.scoringWeights | 0.10 |
| ratioMatch | archetype.scoringWeights | 0.10 |
| costCurveMatch | archetype.scoringWeights | 0.05 |
| synergyBonus | archetype.scoringWeights | 0.15 |

### 5.2 🔴 核心问题：所有流派权重完全相同

**所有 21 个流派（6 角色 × 3-5 流派）使用完全相同的评分权重：**

```
coreCardMatch: 0.35
importantCardMatch: 0.25
supportCardMatch: 0.10
ratioMatch: 0.10
costCurveMatch: 0.05
synergyBonus: 0.15
```

这意味着：
- **力量流**和**防战流**使用相同的权重，但它们的策略完全不同
- **消耗流**应该更重视 synergyBonus（消耗协同），但权重与其他流派相同
- **无限流**应该极度重视 costCurveMatch（需要低费牌），但只分配了 5%

**建议：** 每个流派应有独立的权重配置，反映其独特的策略需求。

### 5.3 评分计算问题

```typescript
const totalScore = Math.round(
  coreCardScore * w.coreCardMatch +      // 0-100 * 0.35 = 0-35
  importantCardScore * w.importantCardMatch +  // 0-100 * 0.25 = 0-25
  supportCardScore * w.supportCardMatch +      // 0-100 * 0.10 = 0-10
  ratioScore * w.ratioMatch +                  // 0-100 * 0.10 = 0-10
  costCurveScore * w.costCurveMatch +          // 0-100 * 0.05 = 0-5
  synergyScore * w.synergyBonus +              // 0-100 * 0.15 = 0-15
  relicBonus                                   // 0-?? (无上限!)
)
```

**问题：**
- `relicBonus` 没有上限，可能超过合理的 0-100 范围
- `relicBonus` 的计算方式：每个 tag 匹配 +5，每个核心卡 tag 匹配 +3，理论上可以无限累加
- `Math.min(100, ...)` 在最后做了截断，但 relicBonus 可能导致总分偏高

### 5.4 identifyArchetypes 过滤阈值

```typescript
return matches.filter(m => m.score > 15).sort(...)
```

阈值 15 过低。当牌库为空时，一个流派的核心卡匹配为 0，但 synergyScore 可能因为空牌库也为 0，ratioScore 可能因为恰好匹配 preferredRatio 而得到分数。15 的阈值可能导致误匹配。

### 5.5 边界情况

1. **空牌库**：所有 score 为 0，ratio 计算中 `deck.length || 1` 防止除零 ✅
2. **单张牌库**：ratio 只基于 1 张牌，波动大
3. **重复卡牌**：`deckIds.includes(cw.cardId)` 只检查存在性，不计算数量
4. **cost = -1 (X费)**：`calcCostCurve` 中 `card.cost >= 3 ? 3 : card.cost` 会将 -1 映射到 curve[0]（0费位置），这是错误的

---

## 6. 协同度计算分析

### 6.1 当前实现

```typescript
function calcDeckSynergyScore(deck: DeckCard[]): number {
  const cards = deck.map(dc => getCardById(dc.cardId)).filter(Boolean)
  if (cards.length < 2) return 0
  let synergyPairs = 0
  let totalPairs = 0
  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      totalPairs++
      const common = cards[i].tags.filter(t => cards[j].tags.includes(t))
      if (common.length > 0) synergyPairs++
    }
  }
  return totalPairs > 0 ? (synergyPairs / totalPairs) * 100 : 0
}
```

### 6.2 问题分析

1. **时间复杂度 O(n²)**：对于 30 张牌的牌库，需要 435 次比较。虽然可接受，但效率不高。

2. **Tag 粒度问题**：
   - "攻击" tag 出现在 171 张牌中（40%），几乎所有攻击牌都有这个 tag
   - 两张攻击牌共享"攻击" tag 就算"有协同"，这过于宽泛
   - 真正的协同应该基于更精确的 tag（如"电球"+"充能球"、"中毒"+"催化剂"）

3. **二值化问题**：只计算"有共同 tag 的 pair 数量"，不考虑共同 tag 的数量和质量

4. **没有正向协同矩阵**：当前只是被动地检查 tag 重叠，没有定义卡牌之间的主动协同关系

### 6.3 协同度分布估算

假设牌库 20 张牌，tag 分布如下：
- "攻击" tag: ~8 张牌 → C(8,2) = 28 对
- "能力" tag: ~6 张牌 → C(6,2) = 15 对
- "消耗" tag: ~5 张牌 → C(5,2) = 10 对
- 其他 tag 重叠: ~10 对

总 pair 数 = C(20,2) = 190
有共同 tag 的 pair ≈ 50-60
协同度 ≈ 26-32%

这意味着即使是随机组牌，协同度也有 25-30%，区分度不足。

---

## 7. 数据标准化分析

### 7.1 JSON Schema 一致性

**卡牌数据 Schema：**
```json
{
  "character": "string",
  "version": "string",
  "cards": [{
    "id": "string",
    "name": "string",
    "nameEn": "string",
    "character": "string",
    "type": "attack|skill|power",
    "rarity": "basic|common|uncommon|rare|special",
    "cost": "number (-1 to 4)",
    "description": "string",
    "keywords": "string[]",
    "tags": "string[]",
    "upgradedDescription": "string (optional)"
  }]
}
```

**流派数据 Schema：**
```json
{
  "id": "string",
  "name": "string",
  "nameEn": "string",
  "character": "string",
  "difficulty": "beginner|intermediate|advanced",
  "description": "string",
  "guide": "string",
  "coreCards": [{ "cardId": "string", "weight": "number" }],
  "importantCards": [{ "cardId": "string", "weight": "number" }],
  "supportCards": [{ "cardId": "string", "weight": "number" }],
  "combos": [{ "id": "string", "name": "string", "cards": "string[]", ... }],
  "scoringWeights": { ... },
  "preferredRatio": { "attack": "number", "skill": "number", "power": "number" },
  "idealCostCurve": "number[]"
}
```

### 7.2 命名规范

**卡牌 ID 命名：** `{character}_{english_name}` 格式统一 ✅
- 示例：`ironclad_inflame`, `defect_ball_lightning`, `silent_catalyst`

**流派 ID 命名：** `{character}_{archetype_name}` 格式统一 ✅
- 示例：`ironclad_strength`, `defect_lightning`, `silent_poison`

**遗物 ID 命名：** 存在不一致 ⚠️
- 通用遗物：直接使用英文名（如 `vajra`, `anchor`）
- 角色遗物：`{character}_{name}`（如 `ironclad_burning_blood`）
- starter.json 中的遗物与角色文件中的遗物 ID 不一致（如 `burning_blood` vs `ironclad_burning_blood`）

### 7.3 Tag 命名规范

**中英文混用问题：**
- 大部分 tag 使用中文（"攻击"、"防御"、"消耗"）
- 部分 tag 使用英文（"AOE"、"X费"）
- 专有名词使用角色特定名称（"奥斯提"、"辉星"、"灾厄"）

**Tag 粒度不一致：**
- 粗粒度："攻击"（171张牌）、"防御"（67张牌）
- 细粒度："电球"（10张牌）、"中毒"（7张牌）
- 建议建立 tag 层级体系

---

## 8. 数据采集方案

### 8.1 自动化采集建议

#### 8.1.1 数据源优先级

| 优先级 | 数据源 | 可靠性 | 覆盖率 |
|--------|--------|--------|--------|
| 1 | 游戏官方 Wiki | 高 | 高 |
| 2 | SpireLogs 数据库 | 高 | 中 |
| 3 | 社区贡献 (Reddit/贴吧) | 中 | 中 |
| 4 | 游戏数据文件解析 | 高 | 高 |
| 5 | 手动测试验证 | 高 | 低 |

#### 8.1.2 采集脚本设计

```typescript
// scripts/dataCollector.ts
interface DataSource {
  name: string
  url: string
  parser: (html: string) => Card[]
  validator: (card: Card) => ValidationResult
}

// 验证流程
interface ValidationResult {
  isValid: boolean
  errors: string[]    // 致命错误
  warnings: string[]  // 警告
}

function validateCard(card: Card): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // 必填字段检查
  if (!card.id) errors.push('Missing id')
  if (!card.name) errors.push('Missing name')
  if (card.cost === undefined) errors.push('Missing cost')

  // ID 格式检查
  if (!card.id.startsWith(card.character + '_')) {
    errors.push(`ID ${card.id} doesn't match character ${card.character}`)
  }

  // 升级描述检查
  if (!card.upgradedDescription) {
    warnings.push(`Missing upgradedDescription for ${card.name}`)
  }

  return { isValid: errors.length === 0, errors, warnings }
}
```

#### 8.1.3 数据验证 Pipeline

```
数据源 → 采集脚本 → 格式校验 → 引用完整性检查 → 去重检查 → 合并 → 人工审核 → 提交
```

### 8.2 数据验证流程

建议添加 CI/CD 数据验证步骤：

```json
// scripts/validate-data.ts
{
  "checks": [
    "所有流派引用的 cardId 必须存在于 cards 数据中",
    "所有 Combo 引用的 cardId 必须存在于 cards 数据中",
    "卡牌 ID 不允许重复",
    "cost 值必须在 [-1, 5] 范围内",
    "type 必须为 attack/skill/power 之一",
    "rarity 必须为 basic/common/uncommon/rare/special 之一",
    "tags 和 keywords 必须为非空数组",
    "每个角色至少有 basic 牌（Strike, Defend 等）",
    "升级描述建议填写率 > 80%"
  ]
}
```

---

## 9. 算法优化建议

### 9.1 评分算法优化

#### 9.1.1 差异化流派权重

```typescript
// 建议：为每个流派定义独立权重
const ARCHETYPE_WEIGHTS: Record<string, ScoringWeights> = {
  ironclad_strength: {
    coreCardMatch: 0.30,     // 力量流核心卡重要但不是唯一
    importantCardMatch: 0.20,
    supportCardMatch: 0.10,
    ratioMatch: 0.15,        // 攻击比例很重要
    costCurveMatch: 0.05,
    synergyBonus: 0.20,      // 力量协同很重要
  },
  ironclad_infinite: {
    coreCardMatch: 0.40,     // 无限流核心卡极度重要
    importantCardMatch: 0.25,
    supportCardMatch: 0.05,
    ratioMatch: 0.05,
    costCurveMatch: 0.20,    // 费用曲线极其关键
    synergyBonus: 0.05,
  },
  // ...
}
```

#### 9.1.2 引入 Tag 权重体系

```typescript
// 建议：为 tag 定义协同权重
const TAG_SYNERGY_WEIGHTS: Record<string, number> = {
  '攻击': 0.3,    // 粗粒度 tag，低权重
  '电球': 1.5,    // 精确 tag，高权重
  '中毒': 1.5,
  '消耗': 1.2,
  '力量': 1.3,
  '过牌': 0.8,
  '防御': 0.3,
  // ...
}

function calcWeightedSynergy(cardA: Card, cardB: Card): number {
  const commonTags = cardA.tags.filter(t => cardB.tags.includes(t))
  return commonTags.reduce((sum, tag) => sum + (TAG_SYNERGY_WEIGHTS[tag] || 1.0), 0)
}
```

#### 9.1.3 改进 baseStrength 计算

```typescript
function calcBaseStrength(card: Card): number {
  // 不依赖 floor，纯粹评估卡牌本身强度
  let s = 40  // 降低基础分，增加区分度

  // 稀有度加成
  const rarityBonus = { basic: 0, common: 5, uncommon: 15, rare: 25, special: 30 }
  s += rarityBonus[card.rarity] || 0

  // 费用效率（越低越好，但不是线性）
  if (card.cost === 0) s += 15
  else if (card.cost === 1) s += 10
  else if (card.cost === 2) s += 5
  // 3+ 费不加分

  // 关键词丰富度
  s += Math.min(card.keywords.length * 3, 15)

  return Math.min(100, s)
}
```

### 9.2 流派匹配优化

#### 9.2.1 修复 X 费牌的费用曲线计算

```typescript
function calcCostCurve(deck: DeckCard[]): number[] {
  const curve = [0, 0, 0, 0, 0]  // 增加第 5 位：X 费
  for (const dc of deck) {
    const card = getCardById(dc.cardId)
    if (!card) continue
    if (card.cost === -1) curve[4]++  // X 费单独统计
    else if (card.cost >= 3) curve[3]++
    else curve[card.cost]++
  }
  const total = deck.length || 1
  return curve.map(v => v / total)
}
```

#### 9.2.2 引入卡牌数量权重

```typescript
// 当前问题：deckIds.includes() 只检查存在性
// 优化：计算卡牌数量
function matchArchetype(deck: DeckCard[], archetype: Archetype): ArchetypeMatch {
  const deckIdCounts = new Map<string, number>()
  for (const dc of deck) {
    deckIdCounts.set(dc.cardId, (deckIdCounts.get(dc.cardId) || 0) + 1)
  }

  let coreScore = 0
  for (const cw of archetype.coreCards) {
    const count = deckIdCounts.get(cw.cardId) || 0
    if (count > 0) {
      // 多张相同核心卡给予递减加分
      coreScore += cw.weight * Math.min(count, 2) * 0.75
    }
  }
  // ...
}
```

### 9.3 机器学习引入方案

#### 9.3.1 特征工程

```typescript
interface CardFeature {
  // 卡牌特征
  cost: number
  type: 'attack' | 'skill' | 'power'
  rarity: number  // 0-4
  keywordCount: number
  tagCount: number

  // 牌库上下文特征
  deckSize: number
  attackRatio: number
  skillRatio: number
  powerRatio: number
  avgCost: number
  synergyWithDeck: number

  // 游戏状态特征
  floor: number
  act: number
  relicCount: number
}
```

#### 9.3.2 推荐模型

| 模型 | 适用场景 | 优势 | 劣势 |
|------|---------|------|------|
| Logistic Regression | 选/不选二分类 | 简单可解释 | 表达能力有限 |
| XGBoost | 多维特征融合 | 效果好，可解释 | 需要大量数据 |
| Neural Collaborative Filtering | 卡牌协同建模 | 能捕获非线性关系 | 黑盒 |
| Bandit (MAB) | 在线学习最优选牌 | 适应玩家风格 | 冷启动问题 |

**推荐方案：** XGBoost + 在线学习

#### 9.3.3 数据收集方案

```typescript
// 匿名化游戏数据收集
interface GameRecord {
  character: string
  deck: string[]          // 最终牌库
  relics: string[]        // 遗物
  floor: number           // 到达楼层
  victory: boolean        // 是否胜利
  cardChoices: Array<{    // 选牌决策
    floor: number
    options: string[]
    chosen: string | null  // null = 跳过
  }>
}
```

### 9.4 A/B 测试方案

#### 9.4.1 测试框架

```typescript
interface ABTest {
  id: string
  name: string
  variants: {
    control: ScoringAlgorithm
    treatment: ScoringAlgorithm
  }
  metrics: {
    primary: 'win_rate'       // 主指标：胜率
    secondary: 'user_satisfaction'  // 副指标：用户满意度
  }
  sampleSize: number
  duration: string
}
```

#### 9.4.2 测试用例

| 测试 ID | 假设 | 控制组 | 实验组 | 预期提升 |
|---------|------|--------|--------|---------|
| AB-001 | 差异化权重提升选牌准确度 | 统一权重 | 流派独立权重 | +5% 胜率 |
| AB-002 | Tag 权重提升协同识别 | 等权 tag | 加权 tag | +3% 协同度 |
| AB-003 | 楼层细分提升适配度 | 3 档楼层 | 5 档楼层 | +2% 推荐准确度 |

---

## 10. 数据可视化方案

### 10.1 推荐图表

#### 10.1.1 卡牌分布热力图

```
X轴: 角色 (ironclad, silent, defect, watcher, necromancer, prince)
Y轴: 稀有度 (basic, common, uncommon, rare, special)
值: 卡牌数量
```

#### 10.1.2 费用曲线分布

```
X轴: 费用 (0, 1, 2, 3, 4+)
Y轴: 卡牌数量
分组: 按角色着色
```

当前数据：
- 0费: 44张 (10%)
- 1费: 260张 (61%)
- 2费: 77张 (18%)
- 3费: 30张 (7%)
- 4费: 1张 (0.2%)
- X费(-1): 8张 (2%)

#### 10.1.3 流派匹配雷达图

每个流派显示 6 个维度的得分：
- 核心卡匹配
- 重要卡匹配
- 辅助卡匹配
- 比例匹配
- 费用曲线匹配
- 协同度

#### 10.1.4 Tag 关系网络图

节点: tag 名称
边: 两个 tag 共同出现在同一张卡牌中的频率
节点大小: tag 出现频率
边粗细: 共现频率

#### 10.1.5 卡牌协同矩阵

```
热力图:
X轴: 卡牌 ID (前 20 张高频卡)
Y轴: 卡牌 ID
值: tag 重叠数量
```

### 10.2 报告模板

```markdown
## 周报 - 数据质量报告

### 数据更新摘要
- 新增卡牌: X 张
- 修改卡牌: Y 张
- 新增流派: Z 个

### 质量指标
| 指标 | 本周 | 上周 | 变化 |
|------|------|------|------|
| 引用完整性 | 95% | 92% | +3% |
| 升级描述覆盖率 | 15% | 10% | +5% |
| 重名卡牌数 | 4 | 4 | 0 |

### 问题清单
1. [严重] prince 流派引用断裂 24 处
2. [中等] 升级描述缺失 92%
```

---

## 11. 数据版本管理

### 11.1 版本号规范

建议采用语义化版本号：

```
MAJOR.MINOR.PATCH

MAJOR: 游戏大版本更新（新角色、新机制）
MINOR: 数据内容更新（新卡牌、新流派、平衡调整）
PATCH: 数据修复（错误修正、缺失补充）
```

当前版本: `v0.3.0` — 处于早期开发阶段，合理。

### 11.2 变更日志格式

```json
// CHANGELOG.json
{
  "versions": [
    {
      "version": "0.3.0",
      "date": "2026-05-04",
      "changes": {
        "cards": {
          "added": ["defect_new_card_1", "defect_new_card_2"],
          "modified": ["ironclad_inflame"],
          "removed": []
        },
        "archetypes": {
          "added": [],
          "modified": ["defect_lightning"],
          "removed": []
        },
        "combos": {
          "added": ["combo_1"],
          "modified": [],
          "removed": []
        }
      },
      "stats": {
        "totalCards": 427,
        "totalArchetypes": 21,
        "totalCombos": 19,
        "brokenReferences": 68
      }
    }
  ]
}
```

### 11.3 回滚机制

```typescript
// 建议：Git 分支策略
// main: 稳定版本
// develop: 开发版本
// data/v0.3.0: 数据版本标签

// 回滚流程：
// 1. git checkout data/v0.2.0 -- src/data/
// 2. npm run validate-data  // 验证数据完整性
// 3. npm run build          // 验证构建通过
// 4. git commit -m "rollback: data to v0.2.0"
```

### 11.4 数据文件拆分建议

当前所有数据在一个版本号下管理。建议：

```
src/data/
├── cards/
│   ├── ironclad.json      (version: "0.3.0")
│   ├── silent.json        (version: "0.3.0")
│   └── ...
├── archetypes/
│   ├── ironclad.json      (version: "0.2.0")  ← 独立版本
│   └── ...
├── combos/
│   └── all.json           (version: "0.1.0")  ← 严重滞后
├── relics/
│   └── ...
└── meta.json              ← 总版本号 + 各子模块版本
```

---

## 12. 附录：详细统计数据

### 12.1 各角色卡牌完整统计

#### Ironclad (铁甲战士) - 80 张
- attack: 29 (36.3%), skill: 27 (33.8%), power: 24 (30.0%)
- basic: 3, common: 22, uncommon: 38, rare: 17
- 费用范围: 0-3, 平均: 1.2
- Top keywords: block(22), exhaust(16), draw(11), strength(8)
- Top tags: 攻击(29), 能力(24), 消耗(16), 防御(13)
- 升级描述: 3/80 (3.8%)

#### Silent (静默猎人) - 55 张
- attack: 19 (34.5%), skill: 27 (49.1%), power: 9 (16.4%)
- basic: 4, common: 17, uncommon: 20, rare: 14
- 费用范围: -1 到 3, 平均: 0.9
- Top keywords: exhaust(10), block(9), draw(9), poison(7)
- Top tags: 攻击(20), 弃牌(11), 消耗(10), 防御(9)
- 升级描述: 2/55 (3.6%)

#### Defect (故障机器人) - 94 张
- attack: 35 (37.2%), skill: 36 (38.3%), power: 23 (24.5%)
- basic: 4, common: 24, uncommon: 47, rare: 19
- 费用范围: -1 到 4, 平均: 1.2
- Top keywords: channel(18), block(12), draw(10), exhaust(10), focus(5)
- Top tags: 攻击(35), 能力(24), 防御(14), 电球(10), 过牌(10)
- 升级描述: 2/94 (2.1%)

#### Watcher (观者) - 53 张
- attack: 19 (35.8%), skill: 26 (49.1%), power: 8 (15.1%)
- basic: 4, common: 21, uncommon: 16, rare: 12
- 费用范围: 0 到 4, 平均: 1.3
- Top keywords: block(13), exhaust(10), calm(6), wrath(5), draw(4)
- Top tags: 攻击(20), 防御(11), 消耗(10), 能力(8), 过牌(7)
- 升级描述: 2/53 (3.8%)

#### Necromancer (亡灵契约师) - 79 张
- attack: 34 (43.0%), skill: 29 (36.7%), power: 16 (20.3%)
- basic: 4, common: 17, uncommon: 33, rare: 23, special: 2
- 费用范围: -1 到 3, 平均: 1.2
- Top keywords: exhaust(13), ethereal(12), block(11), doom(11), summon(10)
- Top tags: 攻击(36), 能力(16), 奥斯提(13), 消耗(13), 虚无(11)
- 升级描述: 17/79 (21.5%)

#### Prince (储君) - 66 张
- attack: 30 (45.5%), skill: 25 (37.9%), power: 11 (16.7%)
- basic: 3, common: 11, uncommon: 35, rare: 17
- 费用范围: 0 到 3, 平均: 1.3
- Top keywords: block(11), star(9), forge(8), draw(3)
- Top tags: 攻击(31), 防御(11), 能力(11), 辉星(9), 铸造(8)
- 升级描述: 8/66 (12.1%)

### 12.2 流派数据统计

| 角色 | 流派名称 | 核心卡数 | 重要卡数 | 辅助卡数 | Combo数 | 难度 |
|------|---------|---------|---------|---------|---------|------|
| defect | 电球流 | 3 | 3 | 2 | 2 | beginner |
| defect | 冰球流 | 3 | 3 | 2 | 1 | intermediate |
| defect | 黑暗球流 | 3 | 3 | 3 | 2 | advanced |
| defect | 专注流 | 3 | 3 | 3 | 2 | intermediate |
| ironclad | 力量流 | 3 | 4 | 3 | 2 | beginner |
| ironclad | 防战流 | 3 | 3 | 3 | 1 | intermediate |
| ironclad | 消耗流 | 3 | 3 | 2 | 1 | advanced |
| ironclad | 放血流 | 3 | 3 | 3 | 2 | advanced |
| ironclad | 无限流 | 3 | 4 | 3 | 1 | advanced |
| necromancer | 亡灵流 | 3 | 3 | 2 | 2 | intermediate |
| necromancer | 契约流 | 3 | 3 | 2 | 1 | advanced |
| necromancer | 骨灰流 | 3 | 3 | 3 | 2 | advanced |
| prince | 王权流 | 3 | 3 | 2 | 2 | intermediate |
| prince | 攻击流 | 3 | 3 | 2 | 1 | beginner |
| prince | 连胜流 | 3 | 3 | 2 | 1 | advanced |
| silent | 毒流 | 3 | 3 | 3 | 2 | beginner |
| silent | 小刀流 | 3 | 3 | 3 | 2 | intermediate |
| silent | 弃牌流 | 3 | 4 | 3 | 2 | intermediate |
| watcher | 姿态切换流 | 3 | 3 | 3 | 2 | intermediate |
| watcher | 神格流 | 3 | 3 | 3 | 2 | advanced |
| watcher | 保留流 | 3 | 4 | 3 | 2 | intermediate |

### 12.3 遗物数据统计

| 分类 | 数量 | 角色 |
|------|------|------|
| 通用 common | 13 | - |
| 通用 uncommon | 10 | - |
| 通用 rare | 8 | - |
| starter | 6 | ironclad, silent, defect, watcher, necromancer, prince |
| ironclad 专属 | 5 | ironclad |
| defect 专属 | 4 | defect |
| silent 专属 | 4 | silent |
| watcher 专属 | 3 | watcher |
| necromancer 专属 | 3 | necromancer |
| prince 专属 | 3 | prince |
| **总计** | **59** | - |

---

## 总结与优先级建议

### 🔴 P0 - 立即修复

1. **补充缺失卡牌数据**：68 处断裂引用中，prince 和 necromancer 各有 20+ 处，必须补充对应的卡牌 JSON 数据
2. **修复 Combo 断裂引用**：16 处 Combo 引用了不存在的卡牌
3. **修复 X 费牌的费用曲线计算**：`cost = -1` 被错误映射到 curve[0]

### 🟡 P1 - 近期优化

4. **差异化流派权重**：为 21 个流派定义独立的 `scoringWeights`
5. **补充升级描述**：当前 92% 缺失，严重影响用户体验
6. **修复卡牌重名**：4 组重名需要确认并修正
7. **改进协同度计算**：引入 tag 权重体系，提升区分度

### 🟢 P2 - 中长期规划

8. **补充 Events/Bosses 数据**：当前数据量远不足
9. **建立数据验证 CI/CD Pipeline**
10. **引入机器学习模型**：XGBoost 选牌推荐
11. **建立数据版本管理和回滚机制**
12. **设计 A/B 测试框架**验证算法改进效果

---

*报告结束。本分析基于 2026-05-04 的项目快照，数据版本 v0.3.0。*
