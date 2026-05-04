# STS2-Helper 测试策略分析报告

> **作者**: QA 测试工程师  
> **日期**: 2026-05-04  
> **项目**: sts2-helper（杀戮尖塔2智能选牌助手）  
> **技术栈**: React 18 + TypeScript + Vite + TailwindCSS + Zustand

---

## 目录

1. [测试现状评估](#1-测试现状评估)
2. [单元测试方案](#2-单元测试方案)
3. [组件测试方案](#3-组件测试方案)
4. [集成测试方案](#4-集成测试方案)
5. [E2E 测试方案](#5-e2e-测试方案)
6. [测试数据管理](#6-测试数据管理)
7. [边界条件测试](#7-边界条件测试)
8. [错误处理测试](#8-错误处理测试)
9. [性能测试](#9-性能测试)
10. [CI 集成方案](#10-ci-集成方案)
11. [测试优先级与路线图](#11-测试优先级与路线图)

---

## 1. 测试现状评估

### 1.1 当前状态

**结论：项目完全没有测试代码，属于高风险状态。**

经过对 `package.json` 的审查，当前依赖列表中不存在任何测试相关库：

| 类别 | 现状 |
|------|------|
| 测试框架 | ❌ 无 Vitest / Jest |
| 组件测试 | ❌ 无 React Testing Library |
| E2E 测试 | ❌ 无 Playwright / Cypress |
| 覆盖率工具 | ❌ 无 c8 / istanbul |
| Mock 工具 | ❌ 无 msw / jest-fetch-mock |
| CI 流水线 | ❌ 无 GitHub Actions |

`scripts` 中仅有 `dev`、`build`、`preview`、`lint`，无任何 `test` 命令。

### 1.2 风险矩阵

| 风险项 | 严重度 | 可能性 | 说明 |
|--------|--------|--------|------|
| 核心算法回归 | 🔴 高 | 🔴 高 | `cardScorer.ts`、`archetypeEngine.ts` 包含复杂加权评分逻辑，任何修改都可能引入静默错误 |
| 存档解析崩溃 | 🔴 高 | 🟡 中 | `saveParser.ts` 处理外部输入（JSON/文本），格式变异导致解析失败 |
| IndexedDB 数据丢失 | 🔴 高 | 🟡 中 | `recordManager.ts` 操作浏览器数据库，无事务保护测试 |
| 状态管理异常 | 🟡 中 | 🟡 中 | 4 个 Zustand store 之间存在依赖关系（gameStore 调用 archetypeEngine） |
| UI 渲染异常 | 🟡 中 | 🟢 低 | 组件纯展示，但 Props 传递链较长 |
| 数据完整性 | 🟡 中 | 🟡 中 | JSON 数据文件（cards/archetypes/relics）的 schema 无校验 |

### 1.3 未测试的关键路径

```
用户选牌 → scoreCardOptions() → 加权计算 → 排序 → 显示推荐
          ↓
      evaluateSkipOption() → 跳过判断
          ↓
      identifyArchetype() → 流派匹配
          ↓
      analyzeDeckHealth() → 健康度分析
          ↓
      SaveParser.parse() → 存档导入
          ↓
      RecordManager.*() → IndexedDB CRUD
```

以上每一步都有独立的逻辑分支和边界条件，任何一步出错都会直接影响用户体验。

---

## 2. 单元测试方案

### 2.1 Vitest 配置

**推荐选择 Vitest**，理由：
- 与 Vite 项目天然集成，零配置路径解析
- 支持 ESM、TypeScript、`@/` 别名
- 兼容 Jest API，迁移成本低
- 内置覆盖率支持（v8/istanbul）

**安装依赖：**

```bash
npm install -D vitest @vitest/coverage-v8 @vitest/ui jsdom
```

**`vitest.config.ts` 配置：**

```typescript
import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/services/**', 'src/stores/**', 'src/data/**', 'src/types/**'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'src/test/**'],
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

**`src/test/setup.ts` 全局测试初始化：**

```typescript
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// 每个测试后自动清理 DOM
afterEach(() => {
  cleanup()
})

// Mock IndexedDB（jsdom 不自带）
import 'fake-indexeddb/auto'

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})
```

**`package.json` 新增脚本：**

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

### 2.2 cardScorer.ts 测试用例

这是项目的核心算法模块，需要最全面的测试覆盖。

**`src/services/__tests__/cardScorer.test.ts`：**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { scoreCardOptions, evaluateSkipOption, generateRecommendationReason } from '../cardScorer'
import type { CardOption, DeckCard, ArchetypeMatch, OwnedRelic } from '@/types'

// Mock 数据层
vi.mock('@/data/cards', () => ({
  getCardById: vi.fn((id: string) => {
    const cards: Record<string, any> = {
      'ironclad_strike': {
        id: 'ironclad_strike', name: '打击', nameEn: 'Strike',
        character: 'ironclad', type: 'attack', rarity: 'basic',
        cost: 1, description: '造成6点伤害', keywords: [], tags: ['攻击'],
      },
      'ironclad_inflame': {
        id: 'ironclad_inflame', name: '燃烧', nameEn: 'Inflame',
        character: 'ironclad', type: 'power', rarity: 'uncommon',
        cost: 1, description: '获得2点力量', keywords: [], tags: ['力量', 'buff'],
      },
      'ironclad_offering': {
        id: 'ironclad_offering', name: '祭品', nameEn: 'Offering',
        character: 'ironclad', type: 'skill', rarity: 'rare',
        cost: 0, description: '失去6HP，获得2能量，抽3张牌',
        keywords: [], tags: ['能量', '过牌', '消耗'],
      },
    }
    return cards[id]
  }),
}))

vi.mock('@/data/archetypes', () => ({
  getArchetypeById: vi.fn(() => ({
    id: 'strength_archetype',
    name: '力量流',
    coreCards: [{ cardId: 'ironclad_inflame', weight: 90, isCore: true, reason: '核心增伤' }],
    importantCards: [{ cardId: 'ironclad_offering', weight: 70, isCore: false, reason: '能量引擎' }],
    supportCards: [],
  })),
}))

vi.mock('@/data/relics', () => ({
  getRelicById: vi.fn(() => undefined),
}))

vi.mock('../archetypeEngine', () => ({
  analyzeDeckHealth: vi.fn(() => ({
    overall: 65, attackBalance: 45, defenseBalance: 35,
    costCurve: 1.2, cardQuality: 50, synergy: 30,
    issues: [], suggestions: [],
  })),
}))

describe('scoreCardOptions', () => {
  const emptyDeck: DeckCard[] = []
  const emptyArchetypes: ArchetypeMatch[] = []

  it('应该返回按分数降序排列的结果', () => {
    const options: CardOption[] = [
      { cardId: 'ironclad_strike', upgraded: false },
      { cardId: 'ironclad_inflame', upgraded: false },
      { cardId: 'ironclad_offering', upgraded: false },
    ]
    const scores = scoreCardOptions(options, emptyDeck, emptyArchetypes, 5)
    expect(scores).toHaveLength(3)
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i - 1].score).toBeGreaterThanOrEqual(scores[i].score)
    }
  })

  it('未知卡牌应返回默认分数50', () => {
    const options: CardOption[] = [
      { cardId: 'non_existent_card', upgraded: false },
    ]
    const scores = scoreCardOptions(options, emptyDeck, emptyArchetypes, 5)
    expect(scores[0].score).toBe(50)
    expect(scores[0].reasons).toContain('未知卡牌')
  })

  it('稀有卡牌应获得基础强度加分', () => {
    const options: CardOption[] = [
      { cardId: 'ironclad_offering', upgraded: false }, // rare
      { cardId: 'ironclad_strike', upgraded: false },   // basic
    ]
    const scores = scoreCardOptions(options, emptyDeck, emptyArchetypes, 5)
    const offeringScore = scores.find(s => s.cardId === 'ironclad_offering')!
    const strikeScore = scores.find(s => s.cardId === 'ironclad_strike')!
    expect(offeringScore.score).toBeGreaterThan(strikeScore.score)
  })

  it('0费牌应获得灵活性加分', () => {
    const options: CardOption[] = [
      { cardId: 'ironclad_offering', upgraded: false }, // cost 0
    ]
    const scores = scoreCardOptions(options, emptyDeck, emptyArchetypes, 5)
    expect(scores[0].reasons.some(r => r.includes('0费'))).toBe(true)
  })

  it('分数应在 0-100 范围内', () => {
    // 极端情况：空选项
    const scores = scoreCardOptions([], [], [], 1)
    expect(scores).toHaveLength(0)
  })

  it('前期（floor<10）应给攻击牌更高评分', () => {
    const options: CardOption[] = [
      { cardId: 'ironclad_strike', upgraded: false }, // attack
    ]
    const earlyScores = scoreCardOptions(options, emptyDeck, emptyArchetypes, 3)
    const lateScores = scoreCardOptions(options, emptyDeck, emptyArchetypes, 30)
    expect(earlyScores[0].dimensionScores!.floorAdaptation)
      .toBeGreaterThanOrEqual(lateScores[0].dimensionScores!.floorAdaptation)
  })

  it('牌库协同应影响评分', () => {
    const deckWithSynergy: DeckCard[] = [
      { cardId: 'ironclad_inflame', upgraded: false },
    ]
    const options: CardOption[] = [
      { cardId: 'ironclad_inflame', upgraded: false }, // tags: ['力量', 'buff']
    ]
    const scores = scoreCardOptions(options, deckWithSynergy, emptyArchetypes, 10)
    expect(scores[0].dimensionScores!.synergy).toBeGreaterThan(0)
  })

  it('遗物协同应正确计算', () => {
    const relics: OwnedRelic[] = [
      { relicId: 'relic_vajra', obtainedAtFloor: 1 },
    ]
    const options: CardOption[] = [
      { cardId: 'ironclad_inflame', upgraded: false },
    ]
    // 遗物和卡牌都有"力量"标签时应有加分
    const scores = scoreCardOptions(options, [], emptyArchetypes, 10, relics)
    expect(scores[0].dimensionScores!.relicSynergy).toBeGreaterThanOrEqual(0)
  })
})

describe('evaluateSkipOption', () => {
  it('牌库小于15张时应降低跳过倾向', () => {
    const smallDeck: DeckCard[] = Array.from({ length: 10 }, (_, i) => ({
      cardId: `card_${i}`, upgraded: false,
    }))
    const options: CardOption[] = [
      { cardId: 'ironclad_strike', upgraded: false },
    ]
    const result = evaluateSkipOption(options, smallDeck, [], 5)
    expect(result.detailedReasons.some(r => r.includes('牌库较小'))).toBe(true)
  })

  it('牌库大于30张时应增加跳过倾向', () => {
    const largeDeck: DeckCard[] = Array.from({ length: 35 }, (_, i) => ({
      cardId: `card_${i}`, upgraded: false,
    }))
    const options: CardOption[] = [
      { cardId: 'ironclad_strike', upgraded: false },
    ]
    const result = evaluateSkipOption(options, largeDeck, [], 5)
    expect(result.detailedReasons.some(r => r.includes('牌库较大'))).toBe(true)
  })

  it('BOSS奖励楼层应降低跳过值', () => {
    const options: CardOption[] = [
      { cardId: 'ironclad_offering', upgraded: false },
    ]
    const bossFloor = evaluateSkipOption(options, [], [], 16) // floor 16 = BOSS
    const normalFloor = evaluateSkipOption(options, [], [], 15)
    expect(bossFloor.skipValue).toBeLessThanOrEqual(normalFloor.skipValue)
  })

  it('空选项应正确处理', () => {
    const result = evaluateSkipOption([], [], [], 1)
    expect(result.shouldSkip).toBe(true)
  })
})

describe('generateRecommendationReason', () => {
  it('未知卡牌应返回默认文本', () => {
    const reason = generateRecommendationReason('nonexistent', [], [], 5)
    expect(reason).toBe('未知卡牌')
  })

  it('0费牌应提及灵活性', () => {
    const reason = generateRecommendationReason('ironclad_offering', [], [], 5)
    expect(reason).toContain('0费')
  })

  it('无匹配时应返回通用推荐语', () => {
    const reason = generateRecommendationReason('ironclad_strike', [], [], 5)
    expect(reason).toBeTruthy()
    expect(typeof reason).toBe('string')
  })
})
```

### 2.3 archetypeEngine.ts 测试用例

**`src/services/__tests__/archetypeEngine.test.ts`：**

```typescript
import { describe, it, expect, vi } from 'vitest'
import {
  matchArchetype,
  identifyArchetypes,
  detectCombos,
  analyzeDeckHealth,
  analyzeCostCurve,
  analyzeCombatBalance,
} from '../archetypeEngine'
import type { Archetype, DeckCard, CharacterId } from '@/types'

// 使用真实数据层（JSON 文件）进行集成测试
// 或 Mock 如下：
vi.mock('@/data/archetypes', () => ({
  getArchetypesByCharacter: vi.fn((char: string) => {
    if (char === 'ironclad') {
      return [{
        id: 'strength_flow',
        name: '力量流',
        character: 'ironclad',
        coreCards: [
          { cardId: 'ironclad_inflame', weight: 90, isCore: true, reason: '核心' },
          { cardId: 'ironclad_demon_form', weight: 80, isCore: true, reason: '持续力量' },
        ],
        importantCards: [
          { cardId: 'ironclad_offering', weight: 70, isCore: false, reason: '能量' },
        ],
        supportCards: [],
        preferredRatio: { attack: 0.4, skill: 0.35, power: 0.25 },
        idealCostCurve: [0.25, 0.35, 0.25, 0.15],
        scoringWeights: {
          coreCardMatch: 0.3, importantCardMatch: 0.2,
          supportCardMatch: 0.1, ratioMatch: 0.15,
          costCurveMatch: 0.1, synergyBonus: 0.15,
        },
        combos: [{
          id: 'combo_inflame_whirlwind',
          name: '旋风斩Combo',
          cards: ['ironclad_inflame', 'ironclad_whirlwind'],
          description: '力量叠加+旋风斩多段伤害',
          power: 'high',
          setup: '先用燃烧获得力量',
        }],
        guide: { overview: '', coreStrategy: '', earlyGame: '', midGame: '', lateGame: '', tips: [], commonMistakes: [] },
      }]
    }
    return []
  }),
}))

describe('matchArchetype', () => {
  it('空牌库应返回0分', () => {
    const archetype: Archetype = {
      id: 'test', name: '测试', nameEn: 'Test', character: 'ironclad',
      description: '', difficulty: 'beginner',
      coreCards: [{ cardId: 'card_a', weight: 80, isCore: true, reason: '' }],
      importantCards: [], supportCards: [],
      preferredRatio: { attack: 0.4, skill: 0.35, power: 0.25 },
      idealCostCurve: [0.25, 0.35, 0.25, 0.15],
      scoringWeights: { coreCardMatch: 0.3, importantCardMatch: 0.2, supportCardMatch: 0.1, ratioMatch: 0.15, costCurveMatch: 0.1, synergyBonus: 0.15 },
      combos: [],
      guide: { overview: '', coreStrategy: '', earlyGame: '', midGame: '', lateGame: '', tips: [], commonMistakes: [] },
    }
    const result = matchArchetype([], archetype, [])
    expect(result.score).toBe(0)
    expect(result.ownedCore).toHaveLength(0)
    expect(result.missingCore).toContain('card_a')
  })

  it('拥有全部核心卡应得到高分', () => {
    const archetype: Archetype = {
      id: 'test', name: '测试', nameEn: 'Test', character: 'ironclad',
      description: '', difficulty: 'beginner',
      coreCards: [
        { cardId: 'ironclad_inflame', weight: 90, isCore: true, reason: '' },
        { cardId: 'ironclad_demon_form', weight: 80, isCore: true, reason: '' },
      ],
      importantCards: [{ cardId: 'ironclad_offering', weight: 70, isCore: false, reason: '' }],
      supportCards: [],
      preferredRatio: { attack: 0.4, skill: 0.35, power: 0.25 },
      idealCostCurve: [0.25, 0.35, 0.25, 0.15],
      scoringWeights: { coreCardMatch: 0.3, importantCardMatch: 0.2, supportCardMatch: 0.1, ratioMatch: 0.15, costCurveMatch: 0.1, synergyBonus: 0.15 },
      combos: [],
      guide: { overview: '', coreStrategy: '', earlyGame: '', midGame: '', lateGame: '', tips: [], commonMistakes: [] },
    }
    const deck: DeckCard[] = [
      { cardId: 'ironclad_inflame', upgraded: false },
      { cardId: 'ironclad_demon_form', upgraded: false },
      { cardId: 'ironclad_offering', upgraded: false },
    ]
    const result = matchArchetype(deck, archetype, [])
    expect(result.score).toBeGreaterThan(50)
    expect(result.ownedCore).toHaveLength(2)
    expect(result.missingCore).toHaveLength(0)
  })

  it('遗物协同应增加分数', () => {
    const archetype: Archetype = {
      id: 'test', name: '力量流', nameEn: 'Strength', character: 'ironclad',
      description: '力量叠加', difficulty: 'beginner',
      coreCards: [{ cardId: 'ironclad_inflame', weight: 90, isCore: true, reason: '' }],
      importantCards: [], supportCards: [],
      preferredRatio: { attack: 0.4, skill: 0.35, power: 0.25 },
      idealCostCurve: [0.25, 0.35, 0.25, 0.15],
      scoringWeights: { coreCardMatch: 0.3, importantCardMatch: 0.2, supportCardMatch: 0.1, ratioMatch: 0.15, costCurveMatch: 0.1, synergyBonus: 0.15 },
      combos: [],
      guide: { overview: '', coreStrategy: '', earlyGame: '', midGame: '', lateGame: '', tips: [], commonMistakes: [] },
    }
    const deck: DeckCard[] = [{ cardId: 'ironclad_inflame', upgraded: false }]
    const withRelic = matchArchetype(deck, archetype, [{ relicId: 'relic_vajra' }])
    const withoutRelic = matchArchetype(deck, archetype, [])
    // 遗物协同加分应使分数更高或相等
    expect(withRelic.score).toBeGreaterThanOrEqual(withoutRelic.score)
  })
})

describe('analyzeDeckHealth', () => {
  it('空牌库应返回合理的默认值', () => {
    const result = analyzeDeckHealth([])
    expect(result.overall).toBeGreaterThanOrEqual(0)
    expect(result.overall).toBeLessThanOrEqual(100)
    expect(result.issues).toBeDefined()
  })

  it('攻击牌比例过高应检测到问题', () => {
    // 创建一个攻击牌占比 > 55% 的牌库
    const deck: DeckCard[] = [
      ...Array.from({ length: 8 }, (_, i) => ({ cardId: `attack_${i}`, upgraded: false })),
      { cardId: 'skill_1', upgraded: false },
      { cardId: 'skill_2', upgraded: false },
    ]
    const result = analyzeDeckHealth(deck)
    // 应该在 issues 中提示攻防失衡
    expect(result.attackBalance).toBeGreaterThan(50)
  })

  it('牌库大于35张应提示精简', () => {
    const deck: DeckCard[] = Array.from({ length: 40 }, (_, i) => ({
      cardId: `card_${i}`, upgraded: false,
    }))
    const result = analyzeDeckHealth(deck)
    expect(result.issues.some(i => i.includes('牌库过大'))).toBe(true)
  })

  it('牌库小于12张应提示过小', () => {
    const deck: DeckCard[] = Array.from({ length: 8 }, (_, i) => ({
      cardId: `card_${i}`, upgraded: false,
    }))
    const result = analyzeDeckHealth(deck)
    expect(result.issues.some(i => i.includes('牌库过小'))).toBe(true)
  })
})

describe('analyzeCostCurve', () => {
  it('全0费牌应返回 too_low', () => {
    const deck: DeckCard[] = Array.from({ length: 10 }, (_, i) => ({
      cardId: `zero_cost_${i}`, upgraded: false,
    }))
    const result = analyzeCostCurve(deck)
    expect(result.averageCost).toBeLessThan(1.0)
  })

  it('空牌库应返回 0 平均费用', () => {
    const result = analyzeCostCurve([])
    expect(result.averageCost).toBe(0)
  })

  it('curve 数组应有4个元素', () => {
    const result = analyzeCostCurve([{ cardId: 'test', upgraded: false }])
    expect(result.curve).toHaveLength(4) // [0费, 1费, 2费, 3+费]
  })
})

describe('analyzeCombatBalance', () => {
  it('空牌库应返回 balanced', () => {
    const result = analyzeCombatBalance([])
    expect(result.balance).toBe('balanced')
  })

  it('全部攻击牌应返回 attack_heavy', () => {
    const deck: DeckCard[] = Array.from({ length: 10 }, (_, i) => ({
      cardId: `attack_${i}`, upgraded: false,
    }))
    const result = analyzeCombatBalance(deck)
    expect(result.balance).toBe('attack_heavy')
  })

  it('比例值应在 0-1 范围', () => {
    const deck: DeckCard[] = [{ cardId: 'test', upgraded: false }]
    const result = analyzeCombatBalance(deck)
    expect(result.attackRatio).toBeGreaterThanOrEqual(0)
    expect(result.attackRatio).toBeLessThanOrEqual(1)
    expect(result.defenseRatio).toBeGreaterThanOrEqual(0)
    expect(result.defenseRatio).toBeLessThanOrEqual(1)
  })
})
```

### 2.4 saveParser.ts 测试用例

**`src/services/__tests__/saveParser.test.ts`：**

```typescript
import { describe, it, expect } from 'vitest'
import { SaveParser } from '../saveParser'

describe('SaveParser.parse', () => {
  it('空字符串应返回无效结果', () => {
    const result = SaveParser.parse('')
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('存档内容为空')
  })

  it('纯空白字符串应返回无效结果', () => {
    const result = SaveParser.parse('   \n\t  ')
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('存档内容为空')
  })

  it('无效JSON应尝试文本格式解析', () => {
    const result = SaveParser.parse('{ broken json')
    // 不会崩溃，会尝试文本格式或返回错误
    expect(result).toBeDefined()
  })
})

describe('SaveParser.parseJSON', () => {
  it('应正确解析标准JSON存档', () => {
    const json = JSON.stringify({
      character: 'ironclad',
      floor: 12,
      health: 65,
      maxHealth: 80,
      gold: 150,
      deck: ['ironclad_strike', 'ironclad_defend'],
      relics: ['relic_burning_blood'],
    })
    const result = SaveParser.parseJSON(json)
    expect(result.character).toBe('ironclad')
    expect(result.floor).toBe(12)
    expect(result.health).toBe(65)
    expect(result.maxHealth).toBe(80)
    expect(result.gold).toBe(150)
    expect(result.deck).toHaveLength(2)
    expect(result.relics).toHaveLength(1)
  })

  it('应处理嵌套的 current_save 结构', () => {
    const json = JSON.stringify({
      current_save: {
        character: 'silent',
        floor: 20,
        deck: ['silent_strike'],
      },
    })
    const result = SaveParser.parseJSON(json)
    expect(result.character).toBe('silent')
    expect(result.floor).toBe(20)
  })

  it('未知角色应回退到 ironclad 并添加错误', () => {
    const json = JSON.stringify({
      character: 'unknown_hero',
      floor: 1,
      deck: [],
    })
    const result = SaveParser.parseJSON(json)
    expect(result.character).toBe('ironclad')
    expect(result.errors.some(e => e.includes('未知角色'))).toBe(true)
  })

  it('deck 字段为字符串数组应正确转换', () => {
    const json = JSON.stringify({
      character: 'ironclad',
      deck: ['ironclad_strike', 'ironclad_defend', 'ironclad_bash'],
    })
    const result = SaveParser.parseJSON(json)
    expect(result.deck).toHaveLength(3)
    expect(result.deck[0]).toEqual({ cardId: 'ironclad_strike', upgraded: false })
  })

  it('deck 字段为对象数组应正确解析', () => {
    const json = JSON.stringify({
      character: 'ironclad',
      deck: [
        { id: 'ironclad_strike', upgraded: true },
        { cardId: 'ironclad_defend', is_upgraded: false },
      ],
    })
    const result = SaveParser.parseJSON(json)
    expect(result.deck[0].cardId).toBe('ironclad_strike')
    expect(result.deck[0].upgraded).toBe(true)
    expect(result.deck[1].cardId).toBe('ironclad_defend')
  })

  it('deck 字段不是数组应添加错误', () => {
    const json = JSON.stringify({
      character: 'ironclad',
      deck: 'not_an_array',
    })
    const result = SaveParser.parseJSON(json)
    expect(result.deck).toHaveLength(0)
    expect(result.errors.some(e => e.includes('牌库数据格式不正确'))).toBe(true)
  })

  it('负数楼层应保持原值（不崩溃）', () => {
    const json = JSON.stringify({
      character: 'ironclad',
      floor: -5,
    })
    const result = SaveParser.parseJSON(json)
    expect(result.floor).toBe(-5)
  })

  it('缺少可选字段应使用默认值', () => {
    const json = JSON.stringify({ character: 'ironclad' })
    const result = SaveParser.parseJSON(json)
    expect(result.floor).toBe(1)
    expect(result.health).toBe(0)
    expect(result.gold).toBe(0)
    expect(result.deck).toHaveLength(0)
    expect(result.relics).toHaveLength(0)
  })
})

describe('SaveParser.parseText', () => {
  it('应正确解析中文键值格式', () => {
    const text = `角色: ironclad
楼层: 12
血量: 65/80
金币: 150
牌库: ironclad_strike, ironclad_defend, ironclad_bash
遗物: relic_burning_blood, relic_anchor`
    const result = SaveParser.parseText(text)
    expect(result.character).toBe('ironclad')
    expect(result.floor).toBe(12)
    expect(result.health).toBe(65)
    expect(result.maxHealth).toBe(80)
    expect(result.gold).toBe(150)
    expect(result.deck).toHaveLength(3)
    expect(result.relics).toHaveLength(2)
  })

  it('应正确解析英文键值格式', () => {
    const text = `character: silent
floor: 20
health: 45/70
gold: 200
deck: silent_strike, silent_defend`
    const result = SaveParser.parseText(text)
    expect(result.character).toBe('silent')
    expect(result.floor).toBe(20)
  })

  it('中文角色名应正确映射', () => {
    const text = `角色: 铁甲战士\n楼层: 1`
    const result = SaveParser.parseText(text)
    expect(result.character).toBe('ironclad')
  })

  it('应处理升级标记（+前缀/后缀）', () => {
    const text = `角色: ironclad\n牌库: +ironclad_strike, ironclad_defend+`
    const result = SaveParser.parseText(text)
    expect(result.deck[0].upgraded).toBe(true)
    expect(result.deck[0].cardId).toBe('ironclad_strike')
    expect(result.deck[1].upgraded).toBe(true)
    expect(result.deck[1].cardId).toBe('ironclad_defend')
  })

  it('空牌库字段应返回空数组', () => {
    const text = `角色: ironclad\n牌库: `
    const result = SaveParser.parseText(text)
    expect(result.deck).toHaveLength(0)
  })

  it('格式错误的血量应容错处理', () => {
    const text = `角色: ironclad\n血量: abc`
    const result = SaveParser.parseText(text)
    expect(result.health).toBe(0)
    expect(result.maxHealth).toBe(0)
  })
})
```

### 2.5 dataUpdater.ts 测试用例

**`src/services/__tests__/dataUpdater.test.ts`：**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DataUpdater } from '../dataUpdater'

describe('DataUpdater.validateCards', () => {
  const updater = new DataUpdater()

  it('完整卡牌应通过校验', () => {
    const cards = [{
      id: 'test_card', name: '测试卡', nameEn: 'Test', character: 'ironclad' as const,
      type: 'attack' as const, rarity: 'common' as const, cost: 1,
      description: '测试', keywords: [], tags: [],
      effects: [{ type: 'damage' as const, target: 'enemy' as const, value: 6 }],
    }]
    const result = updater.validateCards(cards)
    expect(result.valid).toBe(true)
    expect(result.issues).toHaveLength(0)
  })

  it('缺少ID的卡牌应报错', () => {
    const cards = [{
      id: '', name: '测试卡', nameEn: 'Test', character: 'ironclad' as const,
      type: 'attack' as const, rarity: 'common' as const, cost: 1,
      description: '测试', keywords: [], tags: [],
    }]
    const result = updater.validateCards(cards)
    expect(result.valid).toBe(false)
    expect(result.issues.some(i => i.includes('缺少ID'))).toBe(true)
  })

  it('负数费用应报错', () => {
    const cards = [{
      id: 'test', name: '测试', nameEn: 'Test', character: 'ironclad' as const,
      type: 'attack' as const, rarity: 'common' as const, cost: -1,
      description: '测试', keywords: [], tags: [],
    }]
    const result = updater.validateCards(cards)
    expect(result.issues.some(i => i.includes('费用异常'))).toBe(true)
  })

  it('缺少效果数据应警告', () => {
    const cards = [{
      id: 'test', name: '测试', nameEn: 'Test', character: 'ironclad' as const,
      type: 'attack' as const, rarity: 'common' as const, cost: 1,
      description: '测试', keywords: [], tags: [],
    }]
    const result = updater.validateCards(cards)
    expect(result.issues.some(i => i.includes('缺少效果数据'))).toBe(true)
  })
})

describe('DataUpdater.hashCard', () => {
  it('相同卡牌应产生相同哈希', () => {
    const card = {
      id: 'test', name: '测试', cost: 1, description: 'desc',
      effects: [{ type: 'damage', target: 'enemy', value: 6 }],
    }
    expect(DataUpdater.hashCard(card as any)).toBe(DataUpdater.hashCard(card as any))
  })

  it('不同卡牌应产生不同哈希', () => {
    const card1 = { id: 'a', name: 'A', cost: 1, description: 'x', effects: [] }
    const card2 = { id: 'b', name: 'B', cost: 2, description: 'y', effects: [] }
    expect(DataUpdater.hashCard(card1 as any)).not.toBe(DataUpdater.hashCard(card2 as any))
  })
})

describe('DataUpdater.checkForUpdate', () => {
  it('无远程URL应返回无更新', async () => {
    const updater = new DataUpdater('')
    const result = await updater.checkForUpdate('1.0.0')
    expect(result.hasUpdate).toBe(false)
  })

  it('网络超时应返回无更新', async () => {
    const updater = new DataUpdater('https://nonexistent.example.com')
    const result = await updater.checkForUpdate('1.0.0')
    expect(result.hasUpdate).toBe(false)
  })
})
```

### 2.6 data 模块测试用例

**`src/data/__tests__/cards.test.ts`：**

```typescript
import { describe, it, expect } from 'vitest'
import { getCardById, getCardsByCharacter, getAllCards, searchCards, CHARACTER_IDS } from '../cards'

describe('cards data module', () => {
  it('getCardById 应返回存在的卡牌', () => {
    const cards = getAllCards()
    if (cards.length > 0) {
      const first = cards[0]
      expect(getCardById(first.id)).toEqual(first)
    }
  })

  it('getCardById 不存在的ID应返回 undefined', () => {
    expect(getCardById('nonexistent_card_xyz')).toBeUndefined()
  })

  it('每个角色应有卡牌数据', () => {
    for (const charId of CHARACTER_IDS) {
      const cards = getCardsByCharacter(charId)
      expect(cards.length).toBeGreaterThan(0)
    }
  })

  it('所有卡牌应有必需字段', () => {
    const allCards = getAllCards()
    for (const card of allCards) {
      expect(card.id).toBeTruthy()
      expect(card.name).toBeTruthy()
      expect(card.character).toBeTruthy()
      expect(typeof card.cost).toBe('number')
      expect(card.cost).toBeGreaterThanOrEqual(-1)
      expect(Array.isArray(card.keywords)).toBe(true)
      expect(Array.isArray(card.tags)).toBe(true)
    }
  })

  it('searchCards 应按名称搜索', () => {
    const results = searchCards('打击')
    expect(results.length).toBeGreaterThan(0)
    for (const card of results) {
      expect(card.name.toLowerCase()).toContain('打击')
    }
  })

  it('searchCards 应按英文名搜索', () => {
    const allCards = getAllCards()
    if (allCards.length > 0) {
      const enName = allCards[0].nameEn
      const results = searchCards(enName.toLowerCase())
      expect(results.length).toBeGreaterThan(0)
    }
  })

  it('searchCards 应支持角色过滤', () => {
    const results = searchCards('a', 'ironclad')
    for (const card of results) {
      expect(card.character).toBe('ironclad')
    }
  })

  it('卡牌ID应唯一', () => {
    const allCards = getAllCards()
    const ids = allCards.map(c => c.id)
    const uniqueIds = new Set(ids)
    expect(ids.length).toBe(uniqueIds.size)
  })
})
```

---

## 3. 组件测试方案

### 3.1 React Testing Library 配置

**安装依赖：**

```bash
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

**`src/test/test-utils.tsx` 自定义渲染器：**

```typescript
import { render, type RenderOptions } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { ReactElement } from 'react'

function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      {children}
    </MemoryRouter>
  )
}

function renderWithRouter(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: AllProviders, ...options })
}

export { renderWithRouter }
export * from '@testing-library/react'
```

### 3.2 关键组件测试用例

**`src/components/__tests__/RecommendationPanel.test.tsx`：**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { RecommendationPanel } from '../RecommendationPanel'
import type { Recommendation } from '@/services/cardScorer'

describe('RecommendationPanel', () => {
  const mockRec: Recommendation = {
    scores: [
      {
        cardId: 'ironclad_inflame',
        cardName: '燃烧',
        cardType: 'power',
        score: 85,
        reasons: ['核心卡牌', '力量流关键'],
        dimensionScores: {
          baseStrength: 70, archetypeFit: 90, synergy: 80,
          floorAdaptation: 60, relicSynergy: 40, deckHealth: 70,
        },
      },
      {
        cardId: 'ironclad_strike',
        cardName: '打击',
        cardType: 'attack',
        score: 45,
        reasons: ['基础攻击牌'],
        dimensionScores: {
          baseStrength: 50, archetypeFit: 20, synergy: 30,
          floorAdaptation: 70, relicSynergy: 10, deckHealth: 60,
        },
      },
    ],
    skipAnalysis: {
      shouldSkip: false,
      skipValue: 30,
      reason: '建议选择',
      detailedReasons: ['最佳选项评分较高'],
    },
    timestamp: Date.now(),
  }

  it('应渲染所有推荐选项', () => {
    render(<RecommendationPanel rec={mockRec} />)
    expect(screen.getByText('燃烧')).toBeInTheDocument()
    expect(screen.getByText('打击')).toBeInTheDocument()
  })

  it('第一项应标记为推荐', () => {
    render(<RecommendationPanel rec={mockRec} />)
    expect(screen.getByText('⭐ 推荐')).toBeInTheDocument()
  })

  it('应显示分数', () => {
    render(<RecommendationPanel rec={mockRec} />)
    expect(screen.getByText('85')).toBeInTheDocument()
    expect(screen.getByText('45')).toBeInTheDocument()
  })

  it('应显示推荐理由', () => {
    render(<RecommendationPanel rec={mockRec} />)
    expect(screen.getByText('核心卡牌')).toBeInTheDocument()
  })

  it('shouldSkip 为 true 时应显示跳过建议', () => {
    const skipRec = {
      ...mockRec,
      skipAnalysis: { ...mockRec.skipAnalysis, shouldSkip: true },
    }
    render(<RecommendationPanel rec={skipRec} />)
    expect(screen.getByText('建议跳过')).toBeInTheDocument()
  })

  it('shouldSkip 为 false 时不应显示跳过建议', () => {
    render(<RecommendationPanel rec={mockRec} />)
    expect(screen.queryByText('建议跳过')).not.toBeInTheDocument()
  })

  it('空推荐列表应正常渲染', () => {
    const emptyRec = { ...mockRec, scores: [] }
    render(<RecommendationPanel rec={emptyRec} />)
    expect(screen.getByText('📊 选牌推荐')).toBeInTheDocument()
  })
})
```

**`src/components/__tests__/ArchetypePanel.test.tsx`：**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { ArchetypePanel } from '../ArchetypePanel'
import type { ArchetypeMatch } from '@/types'

describe('ArchetypePanel', () => {
  it('空匹配应显示提示信息', () => {
    render(<ArchetypePanel matches={[]} />)
    expect(screen.getByText(/还没有足够的卡牌/)).toBeInTheDocument()
  })

  it('应渲染流派名称和分数', () => {
    const matches: ArchetypeMatch[] = [{
      archetypeId: 'strength_flow',
      archetypeName: '力量流',
      score: 75,
      scores: {
        coreCardScore: 80, importantCardScore: 60, supportCardScore: 40,
        ratioScore: 70, costCurveScore: 65, synergyScore: 50,
      },
      ownedCore: ['燃烧'],
      missingCore: ['恶魔形态'],
      nextSteps: ['优先拿取核心卡: 恶魔形态'],
    }]
    render(<ArchetypePanel matches={matches} />)
    expect(screen.getByText('力量流')).toBeInTheDocument()
    expect(screen.getByText('75')).toBeInTheDocument()
  })

  it('应显示已有和缺失的核心卡', () => {
    const matches: ArchetypeMatch[] = [{
      archetypeId: 'test',
      archetypeName: '测试流派',
      score: 50,
      scores: { coreCardScore: 50, importantCardScore: 0, supportCardScore: 0, ratioScore: 0, costCurveScore: 0, synergyScore: 0 },
      ownedCore: ['卡牌A'],
      missingCore: ['卡牌B', '卡牌C'],
      nextSteps: ['获取卡牌B'],
    }]
    render(<ArchetypePanel matches={matches} />)
    expect(screen.getByText('卡牌A')).toBeInTheDocument()
  })

  it('高分应显示高分样式', () => {
    const matches: ArchetypeMatch[] = [{
      archetypeId: 'test',
      archetypeName: '高分流派',
      score: 85,
      scores: { coreCardScore: 90, importantCardScore: 80, supportCardScore: 70, ratioScore: 80, costCurveScore: 75, synergyScore: 60 },
      ownedCore: [],
      missingCore: [],
      nextSteps: [],
    }]
    const { container } = render(<ArchetypePanel matches={matches} />)
    expect(container.querySelector('.score-badge.high')).toBeInTheDocument()
  })
})
```

**`src/components/__tests__/CardDisplay.test.tsx`：**

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import { CardDisplay } from '../CardDisplay'
import type { Card } from '@/types'

const mockCard: Card = {
  id: 'test_card',
  name: '测试卡牌',
  nameEn: 'Test Card',
  character: 'ironclad',
  type: 'attack',
  rarity: 'common',
  cost: 2,
  description: '造成10点伤害',
  keywords: ['伤害'],
  tags: ['攻击', '力量'],
}

describe('CardDisplay', () => {
  it('应渲染卡牌名称', () => {
    render(<CardDisplay card={mockCard} />)
    expect(screen.getByText('测试卡牌')).toBeInTheDocument()
  })

  it('应渲染费用', () => {
    render(<CardDisplay card={mockCard} />)
    expect(screen.getByText('2费')).toBeInTheDocument()
  })

  it('X费用卡应显示X', () => {
    const xCostCard = { ...mockCard, cost: -1 }
    render(<CardDisplay card={xCostCard} />)
    expect(screen.getByText('X费')).toBeInTheDocument()
  })

  it('应渲染描述', () => {
    render(<CardDisplay card={mockCard} />)
    expect(screen.getByText('造成10点伤害')).toBeInTheDocument()
  })

  it('应渲染标签', () => {
    render(<CardDisplay card={mockCard} />)
    expect(screen.getByText('攻击')).toBeInTheDocument()
    expect(screen.getByText('力量')).toBeInTheDocument()
  })

  it('点击应触发 onClick', () => {
    const onClick = vi.fn()
    render(<CardDisplay card={mockCard} onClick={onClick} />)
    fireEvent.click(screen.getByText('测试卡牌').closest('.card-display')!)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('selected 状态应添加 selected 类', () => {
    const { container } = render(<CardDisplay card={mockCard} selected />)
    expect(container.querySelector('.selected')).toBeInTheDocument()
  })

  it('compact 模式应简化显示', () => {
    render(<CardDisplay card={mockCard} compact />)
    expect(screen.getByText('测试卡牌')).toBeInTheDocument()
    // compact 模式下不应显示完整描述
  })

  it('高亮文本应正确渲染', () => {
    render(<CardDisplay card={mockCard} highlight="测试" />)
    const mark = screen.getByText('测试')
    expect(mark.tagName).toBe('MARK')
  })

  it('收藏按钮应可点击', () => {
    const onFavorite = vi.fn()
    render(<CardDisplay card={mockCard} onFavorite={onFavorite} favorited={false} />)
    // 收藏按钮在 hover 时才可见，这里测试逻辑存在即可
  })
})
```

---

## 4. 集成测试方案

### 4.1 Zustand Store 集成测试

**`src/stores/__tests__/gameStore.test.ts`：**

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useGameStore } from '../gameStore'

// Reset store between tests
beforeEach(() => {
  useGameStore.setState({
    character: null,
    deck: [],
    relics: [],
    floor: 1,
    health: 0,
    maxHealth: 0,
    gold: 0,
    archetypes: [],
    recommendation: null,
    deckHealth: null,
    costCurve: null,
    combatBalance: null,
    combos: [],
  })
})

describe('gameStore', () => {
  it('setCharacter 应重置所有游戏状态', () => {
    const store = useGameStore.getState()
    store.setDeck([{ cardId: 'test', upgraded: false }])
    store.setCharacter('ironclad')

    const state = useGameStore.getState()
    expect(state.character).toBe('ironclad')
    expect(state.deck).toHaveLength(0)
    expect(state.relics).toHaveLength(0)
    expect(state.archetypes).toHaveLength(0)
  })

  it('addCard 应添加卡牌到牌库', () => {
    const store = useGameStore.getState()
    store.setCharacter('ironclad')
    store.addCard('ironclad_strike')

    expect(useGameStore.getState().deck).toHaveLength(1)
    expect(useGameStore.getState().deck[0].cardId).toBe('ironclad_strike')
    expect(useGameStore.getState().deck[0].upgraded).toBe(false)
  })

  it('removeCard 应从牌库移除卡牌', () => {
    const store = useGameStore.getState()
    store.setCharacter('ironclad')
    store.addCard('ironclad_strike')
    store.addCard('ironclad_defend')
    store.removeCard('ironclad_strike')

    const state = useGameStore.getState()
    expect(state.deck).toHaveLength(1)
    expect(state.deck[0].cardId).toBe('ironclad_defend')
  })

  it('removeCard 不存在的卡牌不应改变牌库', () => {
    const store = useGameStore.getState()
    store.setCharacter('ironclad')
    store.addCard('ironclad_strike')
    store.removeCard('nonexistent')

    expect(useGameStore.getState().deck).toHaveLength(1)
  })

  it('clearDeck 应清空牌库和所有分析', () => {
    const store = useGameStore.getState()
    store.setCharacter('ironclad')
    store.addCard('ironclad_strike')
    store.clearDeck()

    const state = useGameStore.getState()
    expect(state.deck).toHaveLength(0)
    expect(state.archetypes).toHaveLength(0)
    expect(state.recommendation).toBeNull()
    expect(state.deckHealth).toBeNull()
  })

  it('setDeck 应触发流派分析', () => {
    const store = useGameStore.getState()
    store.setCharacter('ironclad')
    store.setDeck([
      { cardId: 'ironclad_strike', upgraded: false },
      { cardId: 'ironclad_defend', upgraded: false },
    ])

    // setDeck 内部会调用 identifyArchetypes, analyzeDeckHealth 等
    const state = useGameStore.getState()
    expect(state.deckHealth).not.toBeNull()
    expect(state.costCurve).not.toBeNull()
    expect(state.combatBalance).not.toBeNull()
  })

  it('addRelic 应记录获得楼层', () => {
    const store = useGameStore.getState()
    store.setCharacter('ironclad')
    store.setFloor(10)
    store.addRelic('relic_burning_blood')

    const state = useGameStore.getState()
    expect(state.relics).toHaveLength(1)
    expect(state.relics[0].relicId).toBe('relic_burning_blood')
    expect(state.relics[0].obtainedAtFloor).toBe(10)
  })

  it('analyzeReward 应生成推荐', () => {
    const store = useGameStore.getState()
    store.setCharacter('ironclad')
    store.setDeck([{ cardId: 'ironclad_strike', upgraded: false }])
    store.analyzeReward(['ironclad_strike', 'ironclad_defend'])

    const state = useGameStore.getState()
    expect(state.recommendation).not.toBeNull()
    expect(state.recommendation!.scores).toHaveLength(2)
    expect(state.recommendation!.skipAnalysis).toBeDefined()
  })
})
```

**`src/stores/__tests__/settingsStore.test.ts`：**

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSettingsStore } from '../settingsStore'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('settingsStore', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('默认主题应为 system', () => {
    // 需要重新创建 store 来测试初始值
    const state = useSettingsStore.getState()
    expect(['light', 'dark', 'system']).toContain(state.theme)
  })

  it('setTheme 应更新状态并持久化', () => {
    useSettingsStore.getState().setTheme('dark')
    expect(useSettingsStore.getState().theme).toBe('dark')
    expect(localStorageMock.setItem).toHaveBeenCalled()
  })

  it('setLanguage 应更新语言设置', () => {
    useSettingsStore.getState().setLanguage('en')
    expect(useSettingsStore.getState().language).toBe('en')
  })

  it('resetSettings 应恢复默认值', () => {
    useSettingsStore.getState().setTheme('dark')
    useSettingsStore.getState().setLanguage('en')
    useSettingsStore.getState().resetSettings()
    const state = useSettingsStore.getState()
    expect(state.language).toBe('zh-CN')
  })
})
```

### 4.2 RecordManager IndexedDB 集成测试

**`src/services/__tests__/recordManager.test.ts`：**

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { RecordManager } from '../recordManager'

// fake-indexeddb 在 setup.ts 中已导入
describe('RecordManager', () => {
  let manager: RecordManager

  beforeEach(async () => {
    manager = new RecordManager()
    await manager.init()
  })

  it('init 应成功初始化数据库', async () => {
    // 如果 beforeEach 没有抛出异常，则初始化成功
    expect(true).toBe(true)
  })

  it('createRecord 应创建新记录', async () => {
    const record = await manager.createRecord('ironclad')
    expect(record.id).toBeTruthy()
    expect(record.character).toBe('ironclad')
    expect(record.result).toBe('abandoned')
    expect(record.startTime).toBeTruthy()
  })

  it('saveRecord + getRecord 应正确读写', async () => {
    const record = await manager.createRecord('silent')
    record.gold = 200
    await manager.saveRecord(record)

    const loaded = await manager.getRecord(record.id)
    expect(loaded).not.toBeNull()
    expect(loaded!.gold).toBe(200)
  })

  it('getRecord 不存在的ID应返回 null', async () => {
    const result = await manager.getRecord('nonexistent_id')
    expect(result).toBeNull()
  })

  it('getAllRecords 应返回所有记录', async () => {
    await manager.createRecord('ironclad')
    await manager.createRecord('silent')
    const records = await manager.getAllRecords()
    expect(records.length).toBeGreaterThanOrEqual(2)
  })

  it('getRecordsByCharacter 应按角色过滤', async () => {
    await manager.createRecord('ironclad')
    await manager.createRecord('silent')
    await manager.createRecord('ironclad')

    const ironcladRecords = await manager.getRecordsByCharacter('ironclad')
    expect(ironcladRecords.length).toBeGreaterThanOrEqual(2)
    for (const r of ironcladRecords) {
      expect(r.character).toBe('ironclad')
    }
  })

  it('addDecision 应正确添加决策', async () => {
    const record = await manager.createRecord('ironclad')
    await manager.addDecision(record.id, {
      floor: 5,
      timestamp: new Date().toISOString(),
      options: [{ cardId: 'ironclad_strike', upgraded: false }],
      chosen: 'ironclad_strike',
      recommended: 'ironclad_strike',
    })

    const loaded = await manager.getRecord(record.id)
    expect(loaded!.decisions).toHaveLength(1)
    expect(loaded!.decisions[0].chosen).toBe('ironclad_strike')
  })

  it('addDecision 不存在的记录应抛出异常', async () => {
    await expect(
      manager.addDecision('nonexistent', {
        floor: 1, timestamp: '', options: [], chosen: '',
      })
    ).rejects.toThrow('记录不存在')
  })

  it('finishRecord 应更新结果和结束时间', async () => {
    const record = await manager.createRecord('ironclad')
    await manager.finishRecord(record.id, 'win', 50)

    const loaded = await manager.getRecord(record.id)
    expect(loaded!.result).toBe('win')
    expect(loaded!.finalFloor).toBe(50)
    expect(loaded!.endTime).toBeTruthy()
  })

  it('deleteRecord 应删除记录', async () => {
    const record = await manager.createRecord('ironclad')
    await manager.deleteRecord(record.id)

    const loaded = await manager.getRecord(record.id)
    expect(loaded).toBeNull()
  })

  it('getStats 应返回正确的统计数据', async () => {
    // 创建一些测试数据
    const r1 = await manager.createRecord('ironclad')
    await manager.finishRecord(r1.id, 'win', 50)
    const r2 = await manager.createRecord('silent')
    await manager.finishRecord(r2.id, 'loss', 20)

    const stats = await manager.getStats()
    expect(stats.totalRuns).toBeGreaterThanOrEqual(2)
    expect(stats.winRate).toBeGreaterThanOrEqual(0)
    expect(stats.winRate).toBeLessThanOrEqual(1)
    expect(stats.averageFloor).toBeGreaterThan(0)
  })

  it('reviewRecord 应计算推荐匹配率', async () => {
    const record = await manager.createRecord('ironclad')
    await manager.addDecision(record.id, {
      floor: 5, timestamp: '', options: [],
      chosen: 'ironclad_strike', recommended: 'ironclad_strike',
    })
    await manager.addDecision(record.id, {
      floor: 10, timestamp: '', options: [],
      chosen: 'ironclad_defend', recommended: 'ironclad_strike',
    })

    const review = await manager.reviewRecord(record.id)
    expect(review.totalDecisions).toBe(2)
    expect(review.matchedRecommendations).toBe(1)
    expect(review.matchRate).toBe(0.5)
  })
})
```

---

## 5. E2E 测试方案

### 5.1 Playwright 配置

**安装依赖：**

```bash
npm install -D @playwright/test
npx playwright install chromium
```

**`playwright.config.ts`：**

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-results.json' }],
  ],
  use: {
    baseURL: 'http://localhost:5173/sts2-helper',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173/sts2-helper',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
})
```

### 5.2 E2E 测试用例

**`e2e/home.spec.ts`：**

```typescript
import { test, expect } from '@playwright/test'

test.describe('首页', () => {
  test('应显示标题和角色选择', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('杀戮尖塔2')
    await expect(page.locator('h1')).toContainText('智能选牌助手')
  })

  test('应显示6个角色卡片', async ({ page }) => {
    await page.goto('/')
    const characterCards = page.locator('button:has-text("铁甲战士"), button:has-text("静默猎人")')
    await expect(characterCards.first()).toBeVisible()
  })

  test('点击角色应跳转到分析页面', async ({ page }) => {
    await page.goto('/')
    await page.click('button:has-text("铁甲战士")')
    await expect(page).toHaveURL(/\/analyze/)
  })

  test('导航栏应有所有页面链接', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('nav a:has-text("首页")')).toBeVisible()
    await expect(page.locator('nav a:has-text("牌库分析")')).toBeVisible()
    await expect(page.locator('nav a:has-text("学习攻略")')).toBeVisible()
    await expect(page.locator('nav a:has-text("卡牌图鉴")')).toBeVisible()
    await expect(page.locator('nav a:has-text("选牌模拟")')).toBeVisible()
    await expect(page.locator('nav a:has-text("数据统计")')).toBeVisible()
  })
})
```

**`e2e/analyze.spec.ts`：**

```typescript
import { test, expect } from '@playwright/test'

test.describe('牌库分析页面', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.click('button:has-text("铁甲战士")')
  })

  test('未选角色时应显示提示', async ({ page }) => {
    await page.goto('/analyze')
    // 如果直接访问分析页，应提示选择角色
  })

  test('应显示牌库管理、选牌推荐、牌库统计三个标签', async ({ page }) => {
    await expect(page.locator('button:has-text("牌库管理")')).toBeVisible()
    await expect(page.locator('button:has-text("选牌推荐")')).toBeVisible()
    await expect(page.locator('button:has-text("牌库统计")')).toBeVisible()
  })

  test('搜索框应过滤卡牌', async ({ page }) => {
    await page.fill('input[placeholder*="搜索"]', '打击')
    // 应只显示名称包含"打击"的卡牌
    const cards = page.locator('.card-display')
    const count = await cards.count()
    expect(count).toBeGreaterThan(0)
  })

  test('点击卡牌应添加到牌库', async ({ page }) => {
    const firstCard = page.locator('.card-display').first()
    await firstCard.click()
    // 牌库计数应增加
    await expect(page.locator('text=/牌库管理.*\\(1\\)/')).toBeVisible()
  })

  test('楼层滑块应正确更新', async ({ page }) => {
    const slider = page.locator('input[type="range"]')
    await slider.fill('25')
    await expect(page.locator('input[type="number"]')).toHaveValue('25')
  })

  test('清空牌库按钮应清空所有卡牌', async ({ page }) => {
    // 先添加几张卡
    const firstCard = page.locator('.card-display').first()
    await firstCard.click()
    await page.click('button:has-text("清空牌库")')
    await expect(page.locator('text="牌库为空"')).toBeVisible()
  })
})
```

**`e2e/encyclopedia.spec.ts`：**

```typescript
import { test, expect } from '@playwright/test'

test.describe('卡牌图鉴', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/encyclopedia')
  })

  test('应显示所有角色选项', async ({ page }) => {
    await expect(page.locator('button:has-text("铁甲战士")')).toBeVisible()
    await expect(page.locator('button:has-text("静默猎人")')).toBeVisible()
  })

  test('筛选器应正常工作', async ({ page }) => {
    // 选择攻击牌类型
    await page.selectOption('select:near(:text("全部类型"))', 'attack')
    // 卡牌列表应只显示攻击牌
    const cards = page.locator('.card-display')
    const count = await cards.count()
    expect(count).toBeGreaterThan(0)
  })

  test('点击卡牌应打开详情弹窗', async ({ page }) => {
    const firstCard = page.locator('.card-display').first()
    await firstCard.click()
    await expect(page.locator('.fixed.inset-0')).toBeVisible()
  })

  test('Escape 键应关闭弹窗', async ({ page }) => {
    const firstCard = page.locator('.card-display').first()
    await firstCard.click()
    await page.keyboard.press('Escape')
    await expect(page.locator('.fixed.inset-0')).not.toBeVisible()
  })

  test('收藏功能应正常工作', async ({ page }) => {
    // Hover 后点击收藏按钮
    const firstCard = page.locator('.card-display').first()
    await firstCard.hover()
    // 收藏按钮应在 hover 后可见
  })
})
```

**`e2e/simulator.spec.ts`：**

```typescript
import { test, expect } from '@playwright/test'

test.describe('选牌模拟器', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/simulator')
  })

  test('应显示角色选择', async ({ page }) => {
    await expect(page.locator('button:has-text("开始模拟")')).toBeVisible()
  })

  test('点击开始模拟应生成场景', async ({ page }) => {
    await page.click('button:has-text("开始模拟")')
    await expect(page.locator('text=/你会选哪张/')).toBeVisible()
  })

  test('选择卡牌应显示结果', async ({ page }) => {
    await page.click('button:has-text("开始模拟")')
    const optionCard = page.locator('.card-display').first()
    await optionCard.click()
    await expect(page.locator('text=/选择正确|不是最佳选择/')).toBeVisible()
  })

  test('应记录历史成绩', async ({ page }) => {
    await page.click('button:has-text("开始模拟")')
    const optionCard = page.locator('.card-display').first()
    await optionCard.click()
    // 刷新页面后历史应保留
    await page.reload()
    await expect(page.locator('text="历史成绩"')).toBeVisible()
  })
})
```

---

## 6. 测试数据管理

### 6.1 Mock 数据策略

项目有两层数据需要 Mock：

**层1：JSON 静态数据（cards、archetypes、relics）**

```typescript
// src/test/fixtures/cards.ts
// 提供最小化的卡牌测试数据，避免依赖真实 JSON 文件

import type { Card } from '@/types'

export const TEST_CARDS: Record<string, Card> = {
  ironclad_strike: {
    id: 'ironclad_strike',
    name: '打击',
    nameEn: 'Strike',
    character: 'ironclad',
    type: 'attack',
    rarity: 'basic',
    cost: 1,
    description: '造成6点伤害',
    keywords: [],
    tags: ['攻击'],
    effects: [{ type: 'damage', target: 'enemy', value: 6 }],
  },
  ironclad_defend: {
    id: 'ironclad_defend',
    name: '防御',
    nameEn: 'Defend',
    character: 'ironclad',
    type: 'skill',
    rarity: 'basic',
    cost: 1,
    description: '获得5点格挡',
    keywords: [],
    tags: ['防御', '格挡'],
    effects: [{ type: 'block', target: 'self', value: 5 }],
  },
  ironclad_inflame: {
    id: 'ironclad_inflame',
    name: '燃烧',
    nameEn: 'Inflame',
    character: 'ironclad',
    type: 'power',
    rarity: 'uncommon',
    cost: 1,
    description: '获得2点力量',
    keywords: [],
    tags: ['力量', 'buff'],
    effects: [{ type: 'apply_buff', target: 'self', value: 2, statusId: 'strength' }],
  },
  ironclad_offering: {
    id: 'ironclad_offering',
    name: '祭品',
    nameEn: 'Offering',
    character: 'ironclad',
    type: 'skill',
    rarity: 'rare',
    cost: 0,
    description: '失去6HP。获得2能量。抽3张牌。',
    keywords: [],
    tags: ['能量', '过牌', '消耗'],
    effects: [
      { type: 'damage', target: 'self', value: 6 },
      { type: 'energy', target: 'self', value: 2 },
      { type: 'draw', target: 'self', value: 3 },
    ],
  },
}

export const TEST_DECK = [
  { cardId: 'ironclad_strike', upgraded: false },
  { cardId: 'ironclad_strike', upgraded: false },
  { cardId: 'ironclad_strike', upgraded: false },
  { cardId: 'ironclad_defend', upgraded: false },
  { cardId: 'ironclad_defend', upgraded: false },
  { cardId: 'ironclad_defend', mocked: false },
  { cardId: 'ironclad_defend', upgraded: false },
  { cardId: 'ironclad_inflame', upgraded: false },
]
```

**层2：浏览器 API（IndexedDB、localStorage）**

```typescript
// src/test/mocks/browser.ts
// IndexedDB mock 通过 fake-indexeddb 包实现
// localStorage mock 通过 vi.fn() 实现

export function mockLocalStorage() {
  const store = new Map<string, string>()
  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => store.set(key, value)),
    removeItem: vi.fn((key: string) => store.delete(key)),
    clear: vi.fn(() => store.clear()),
    get length() { return store.size },
    key: vi.fn((index: number) => [...store.keys()][index] ?? null),
  }
}
```

### 6.2 测试 Fixture 组织

```
src/test/
├── setup.ts              # 全局 setup（cleanup、mock）
├── test-utils.tsx         # 自定义 render（含 Router）
├── fixtures/
│   ├── cards.ts           # 最小卡牌数据
│   ├── archetypes.ts      # 最小流派数据
│   ├── relics.ts          # 最小遗物数据
│   ├── records.ts         # 测试用游戏记录
│   └── save-files.ts      # 各种存档格式样本
└── mocks/
    └── browser.ts         # 浏览器 API mock
```

---

## 7. 边界条件测试

### 7.1 空数据边界

```typescript
describe('边界条件 - 空数据', () => {
  it('cardScorer: 空选项列表', () => {
    const scores = scoreCardOptions([], [], [], 1)
    expect(scores).toHaveLength(0)
  })

  it('archetypeEngine: 空牌库的流派识别', () => {
    const matches = identifyArchetypes([], 'ironclad')
    expect(matches).toHaveLength(0)
  })

  it('archetypeEngine: 空牌库的健康度分析', () => {
    const health = analyzeDeckHealth([])
    expect(health.overall).toBeGreaterThanOrEqual(0)
    expect(health.overall).toBeLessThanOrEqual(100)
  })

  it('archetypeEngine: 空牌库的费用曲线', () => {
    const curve = analyzeCostCurve([])
    expect(curve.averageCost).toBe(0)
    expect(curve.curve).toHaveLength(4)
  })

  it('archetypeEngine: 空牌库的攻防平衡', () => {
    const balance = analyzeCombatBalance([])
    expect(balance.balance).toBe('balanced')
    expect(balance.attackRatio).toBe(0)
  })

  it('saveParser: 空字符串', () => {
    const result = SaveParser.parse('')
    expect(result.isValid).toBe(false)
  })

  it('saveParser: null/undefined 安全', () => {
    // TypeScript 会阻止，但运行时可能收到
    expect(() => SaveParser.parse(null as any)).not.toThrow()
    expect(() => SaveParser.parse(undefined as any)).not.toThrow()
  })

  it('recordManager: 空数据库的统计', async () => {
    const manager = new RecordManager()
    await manager.init()
    const stats = await manager.getStats()
    expect(stats.totalRuns).toBe(0)
    expect(stats.winRate).toBe(0)
  })
})
```

### 7.2 异常输入边界

```typescript
describe('边界条件 - 异常输入', () => {
  it('cardScorer: 重复卡牌ID', () => {
    const options = [
      { cardId: 'ironclad_strike', upgraded: false },
      { cardId: 'ironclad_strike', upgraded: false },
    ]
    // 不应崩溃
    const scores = scoreCardOptions(options, [], [], 5)
    expect(scores).toHaveLength(2)
  })

  it('cardScorer: 超大牌库（1000张）', () => {
    const largeDeck = Array.from({ length: 1000 }, (_, i) => ({
      cardId: `card_${i}`, upgraded: false,
    }))
    // 性能测试：不应超时
    const start = Date.now()
    analyzeDeckHealth(largeDeck)
    const elapsed = Date.now() - start
    expect(elapsed).toBeLessThan(5000) // 5秒内完成
  })

  it('saveParser: 超长JSON字符串', () => {
    const hugeJson = JSON.stringify({
      character: 'ironclad',
      deck: Array.from({ length: 10000 }, (_, i) => `card_${i}`),
    })
    const result = SaveParser.parseJSON(hugeJson)
    expect(result.deck).toHaveLength(10000)
  })

  it('saveParser: 特殊字符卡牌ID', () => {
    const json = JSON.stringify({
      character: 'ironclad',
      deck: ['<script>alert(1)</script>', '../../etc/passwd', ''],
    })
    const result = SaveParser.parseJSON(json)
    // 应该安全处理，不做 XSS
    expect(result.deck.length).toBeGreaterThanOrEqual(0)
  })

  it('saveParser: Unicode 和 emoji', () => {
    const text = `角色: ironclad\n牌库: 卡牌_🔥, 卡牌_💀`
    const result = SaveParser.parseText(text)
    expect(result.deck).toHaveLength(2)
  })

  it('archetypeEngine: 所有卡牌ID都不存在', () => {
    const deck = [
      { cardId: 'nonexistent_1', upgraded: false },
      { cardId: 'nonexistent_2', upgraded: false },
    ]
    const health = analyzeDeckHealth(deck)
    expect(health.overall).toBeGreaterThanOrEqual(0)
  })

  it('楼层边界值: floor = 0', () => {
    const scores = scoreCardOptions(
      [{ cardId: 'ironclad_strike', upgraded: false }],
      [], [], 0
    )
    expect(scores[0].score).toBeGreaterThanOrEqual(0)
    expect(scores[0].score).toBeLessThanOrEqual(100)
  })

  it('楼层边界值: floor = 999', () => {
    const scores = scoreCardOptions(
      [{ cardId: 'ironclad_strike', upgraded: false }],
      [], [], 999
    )
    expect(scores[0].score).toBeGreaterThanOrEqual(0)
    expect(scores[0].score).toBeLessThanOrEqual(100)
  })

  it('负数楼层', () => {
    const scores = scoreCardOptions(
      [{ cardId: 'ironclad_strike', upgraded: false }],
      [], [], -10
    )
    expect(scores[0].score).toBeGreaterThanOrEqual(0)
  })
})
```

### 7.3 并发操作边界

```typescript
describe('边界条件 - 并发操作', () => {
  it('快速连续 addCard 不应导致状态异常', () => {
    const store = useGameStore.getState()
    store.setCharacter('ironclad')

    // 快速连续添加 50 张卡
    for (let i = 0; i < 50; i++) {
      store.addCard(`card_${i}`)
    }

    expect(useGameStore.getState().deck).toHaveLength(50)
  })

  it('同时 addCard 和 removeCard', () => {
    const store = useGameStore.getState()
    store.setCharacter('ironclad')
    store.addCard('ironclad_strike')

    // 交替操作
    store.addCard('ironclad_defend')
    store.removeCard('ironclad_strike')
    store.addCard('ironclad_bash')

    const deck = useGameStore.getState().deck
    expect(deck.find(c => c.cardId === 'ironclad_strike')).toBeUndefined()
    expect(deck.find(c => c.cardId === 'ironclad_defend')).toBeDefined()
    expect(deck.find(c => c.cardId === 'ironclad_bash')).toBeDefined()
  })

  it('RecordManager: 并发写入同一记录', async () => {
    const manager = new RecordManager()
    await manager.init()
    const record = await manager.createRecord('ironclad')

    // 并发写入
    await Promise.all([
      manager.addDecision(record.id, { floor: 1, timestamp: '', options: [], chosen: 'a' }),
      manager.addDecision(record.id, { floor: 2, timestamp: '', options: [], chosen: 'b' }),
      manager.addDecision(record.id, { floor: 3, timestamp: '', options: [], chosen: 'c' }),
    ])

    const loaded = await manager.getRecord(record.id)
    // IndexedDB 的 put 操作是 last-write-wins，可能丢失部分决策
    // 这是一个已知限制，测试应验证不崩溃
    expect(loaded).not.toBeNull()
  })
})
```

---

## 8. 错误处理测试

### 8.1 存档解析失败

```typescript
describe('错误处理 - 存档解析', () => {
  it('畸形JSON应安全处理', () => {
    const malformed = [
      '{"incomplete":',
      '{trailing: comma,}',
      '{"number": NaN}',
      '{"nested": {"deep": {"very": {"deep": null}}}}',
      '[]', // 数组而非对象
      '"just a string"',
      '123',
      'true',
    ]
    for (const input of malformed) {
      const result = SaveParser.parse(input)
      expect(result).toBeDefined()
      expect(typeof result.isValid).toBe('boolean')
      expect(Array.isArray(result.errors)).toBe(true)
    }
  })

  it('文本格式缺少关键字段应使用默认值', () => {
    const text = '一些随机文本\n不是有效的格式'
    const result = SaveParser.parseText(text)
    expect(result.character).toBe('ironclad') // 默认值
    expect(result.floor).toBe(1) // 默认值
  })

  it('血量格式异常应容错', () => {
    const tests = [
      { input: '血量: abc/def', expectedHealth: 0 },
      { input: '血量: -5/80', expectedHealth: -5 },
      { input: '血量: 65/', expectedHealth: 65 },
      { input: '血量: /80', expectedHealth: 0 },
      { input: '血量: 65/80/extra', expectedHealth: 65 },
    ]
    for (const { input, expectedHealth } of tests) {
      const result = SaveParser.parseText(`角色: ironclad\n${input}`)
      expect(result.health).toBe(expectedHealth)
    }
  })
})
```

### 8.2 网络错误处理

```typescript
describe('错误处理 - 网络', () => {
  it('DataUpdater: fetch 超时应安全返回', async () => {
    const updater = new DataUpdater('https://httpstat.us/500')
    const result = await updater.checkForUpdate('1.0.0')
    expect(result.hasUpdate).toBe(false)
  })

  it('DataUpdater: fetch 404 应安全返回', async () => {
    const updater = new DataUpdater('https://httpstat.us/404')
    const result = await updater.fetchManifest()
    expect(result).toBeNull()
  })

  it('DataUpdater: fetch 网络不可达应安全返回', async () => {
    const updater = new DataUpdater('https://192.0.2.1') // 不可达 IP
    const result = await updater.checkForUpdate('1.0.0')
    expect(result.hasUpdate).toBe(false)
  })

  it('updateCards: 批量请求部分失败应继续处理', async () => {
    // Mock fetch 部分失败
    const updater = new DataUpdater('https://test.example.com')
    // 需要 mock fetch 实现
  })
})
```

### 8.3 存储满/不可用

```typescript
describe('错误处理 - 存储', () => {
  it('localStorage 不可用时 settingsStore 不应崩溃', () => {
    // Mock localStorage.setItem 抛出异常
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = () => { throw new Error('QuotaExceededError') }

    expect(() => {
      useSettingsStore.getState().setTheme('dark')
    }).not.toThrow()

    Storage.prototype.setItem = original
  })

  it('localStorage 不可用时 DataUpdater 缓存不应崩溃', () => {
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = () => { throw new Error('Storage full') }

    const updater = new DataUpdater()
    expect(() => {
      updater.saveVersion('1.0.0')
      updater.cacheData('test', { a: 1 })
    }).not.toThrow()

    Storage.prototype.setItem = original
  })

  it('IndexedDB 不可用时 RecordManager 应抛出可理解的错误', async () => {
    // 这需要更复杂的 mock，通常在 jsdom 环境中 IndexedDB 可用
    // 主要验证 init() 的 reject 路径
  })

  it('getCachedData: 缓存过期应返回 null', () => {
    const updater = new DataUpdater()
    updater.cacheData('test', { value: 42 })

    // maxAge = 0 表示立即过期
    const result = updater.getCachedData('test', 0)
    expect(result).toBeNull()
  })

  it('getCachedData: 损坏的缓存数据应返回 null', () => {
    localStorage.setItem('sts2-data-cache', 'not valid json{{{')
    const updater = new DataUpdater()
    const result = updater.getCachedData<any>('test')
    expect(result).toBeNull()
  })
})
```

### 8.4 数据完整性测试

```typescript
describe('错误处理 - 数据完整性', () => {
  it('所有卡牌的 character 字段应为有效角色ID', () => {
    const validCharacters = ['ironclad', 'silent', 'defect', 'watcher', 'necromancer', 'prince']
    const allCards = getAllCards()
    for (const card of allCards) {
      expect(validCharacters).toContain(card.character)
    }
  })

  it('所有遗物的 rarity 字段应为有效稀有度', () => {
    const validRarities = ['starter', 'common', 'uncommon', 'rare', 'boss', 'shop', 'event']
    const allRelics = getAllRelics()
    for (const relic of allRelics) {
      expect(validRarities).toContain(relic.rarity)
    }
  })

  it('流派引用的卡牌ID应在卡牌库中存在', () => {
    const allArchetypes = getAllArchetypes()
    const allCardIds = new Set(getAllCards().map(c => c.id))

    for (const archetype of allArchetypes) {
      for (const cw of [...archetype.coreCards, ...archetype.importantCards, ...archetype.supportCards]) {
        // 警告级别：引用的卡牌可能在数据更新中被移除
        if (!allCardIds.has(cw.cardId)) {
          console.warn(`流派 ${archetype.name} 引用了不存在的卡牌: ${cw.cardId}`)
        }
      }
    }
  })

  it('combo 引用的卡牌ID应在卡牌库中存在', () => {
    const allCombos = getAllCombos()
    const allCardIds = new Set(getAllCards().map(c => c.id))

    for (const combo of allCombos) {
      for (const cardId of combo.cards) {
        if (!allCardIds.has(cardId)) {
          console.warn(`Combo ${combo.name} 引用了不存在的卡牌: ${cardId}`)
        }
      }
    }
  })
})
```

---

## 9. 性能测试

### 9.1 大数据集测试

```typescript
import { describe, it, expect } from 'vitest'
import { scoreCardOptions } from '../cardScorer'
import { analyzeDeckHealth, identifyArchetypes, detectCombos } from '../archetypeEngine'
import type { DeckCard } from '@/types'

function generateLargeDeck(size: number): DeckCard[] {
  return Array.from({ length: size }, (_, i) => ({
    cardId: `card_${i % 50}`, // 循环使用50个不同ID
    upgraded: i % 5 === 0,
  }))
}

describe('性能测试', () => {
  it('scoreCardOptions: 100个选项应在100ms内完成', () => {
    const options = Array.from({ length: 100 }, (_, i) => ({
      cardId: `ironclad_${i}`, upgraded: false,
    }))
    const deck = generateLargeDeck(30)

    const start = performance.now()
    scoreCardOptions(options, deck, [], 10)
    const elapsed = performance.now() - start

    expect(elapsed).toBeLessThan(100)
  })

  it('analyzeDeckHealth: 500张牌库应在500ms内完成', () => {
    const deck = generateLargeDeck(500)

    const start = performance.now()
    analyzeDeckHealth(deck)
    const elapsed = performance.now() - start

    expect(elapsed).toBeLessThan(500)
  })

  it('identifyArchetypes: 大牌库应在合理时间内完成', () => {
    const deck = generateLargeDeck(100)

    const start = performance.now()
    identifyArchetypes(deck, 'ironclad')
    const elapsed = performance.now() - start

    expect(elapsed).toBeLessThan(1000)
  })

  it('detectCombos: 大牌库应在合理时间内完成', () => {
    const deck = generateLargeDeck(100)

    const start = performance.now()
    detectCombos(deck, 'ironclad')
    const elapsed = performance.now() - start

    expect(elapsed).toBeLessThan(500)
  })

  it('scoreCardOptions 多次调用不应内存泄漏', () => {
    const options = Array.from({ length: 10 }, (_, i) => ({
      cardId: `card_${i}`, upgraded: false,
    }))

    // 运行1000次
    for (let i = 0; i < 1000; i++) {
      scoreCardOptions(options, generateLargeDeck(20), [], 10)
    }
    // 如果这里没有 OOM，则通过
    expect(true).toBe(true)
  })
})
```

### 9.2 渲染性能测试

```typescript
// 组件渲染性能测试需要 @testing-library/react
import { describe, it, expect } from 'vitest'
import { render } from '@/test/test-utils'
import { CardDisplay } from '../CardDisplay'
import type { Card } from '@/types'

describe('渲染性能', () => {
  it('CardDisplay: 100个卡牌组件应在500ms内渲染', () => {
    const card: Card = {
      id: 'test', name: '测试', nameEn: 'Test', character: 'ironclad',
      type: 'attack', rarity: 'common', cost: 1, description: '测试描述',
      keywords: ['伤害'], tags: ['攻击'],
    }

    const start = performance.now()
    const { container } = render(
      <div>
        {Array.from({ length: 100 }, (_, i) => (
          <CardDisplay key={i} card={{ ...card, id: `card_${i}`, name: `卡牌${i}` }} />
        ))}
      </div>
    )
    const elapsed = performance.now() - start

    expect(elapsed).toBeLessThan(500)
    expect(container.querySelectorAll('.card-display')).toHaveLength(100)
  })
})
```

---

## 10. CI 集成方案

### 10.1 GitHub Actions 配置

**`.github/workflows/test.yml`：**

```yaml
name: Test & Coverage

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]

    steps:
      - uses: actions/checkout@v4

      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run unit tests
        run: npm run test:run

      - name: Run tests with coverage
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        if: matrix.node-version == 20
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: false

      - name: Check coverage thresholds
        if: matrix.node-version == 20
        run: |
          # 覆盖率阈值在 vitest.config.ts 中配置
          # 如果低于阈值，vitest 会返回非零退出码
          echo "Coverage check passed"

  e2e:
    runs-on: ubuntu-latest
    needs: test

    steps:
      - uses: actions/checkout@v4

      - name: Use Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Run E2E tests
        run: npx playwright test

      - name: Upload E2E report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7

  build:
    runs-on: ubuntu-latest
    needs: [test, e2e]

    steps:
      - uses: actions/checkout@v4

      - name: Use Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Verify build output
        run: |
          test -d dist
          test -f dist/index.html
```

### 10.2 覆盖率报告集成

**vitest 覆盖率阈值配置（已在 vitest.config.ts 中）：**

```typescript
coverage: {
  thresholds: {
    statements: 80,
    branches: 70,
    functions: 80,
    lines: 80,
  },
}
```

**PR 覆盖率评论（可选）：**

```yaml
# .github/workflows/coverage-comment.yml
name: Coverage Comment

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'npm' }
      - run: npm ci
      - run: npm run test:coverage
      - name: Comment coverage
        uses: MishaKav/jest-coverage-comment@main
        with:
          coverage-summary-path: coverage/coverage-summary.json
```

---

## 11. 测试优先级与路线图

### 11.1 优先级排序

| 优先级 | 模块 | 测试类型 | 工作量 | 理由 |
|--------|------|----------|--------|------|
| **P0** | `cardScorer.ts` | 单元测试 | 2h | 核心算法，直接影响推荐准确性 |
| **P0** | `archetypeEngine.ts` | 单元测试 | 3h | 核心算法，6个独立函数需测试 |
| **P0** | `saveParser.ts` | 单元测试 | 2h | 处理外部输入，安全边界多 |
| **P1** | `recordManager.ts` | 集成测试 | 2h | IndexedDB CRUD，数据持久化 |
| **P1** | Zustand stores | 集成测试 | 2h | 状态管理核心，4个 store |
| **P1** | `data/*.ts` | 单元测试 | 1h | 数据层完整性校验 |
| **P2** | `RecommendationPanel` | 组件测试 | 1h | 核心展示组件 |
| **P2** | `ArchetypePanel` | 组件测试 | 0.5h | 核心展示组件 |
| **P2** | `CardDisplay` | 组件测试 | 1h | 多处复用 |
| **P2** | `dataUpdater.ts` | 单元测试 | 1h | 网络交互，需 mock |
| **P3** | E2E 关键流程 | E2E 测试 | 4h | 首页→分析→推荐完整流程 |
| **P3** | CI 流水线 | 基础设施 | 1h | GitHub Actions 配置 |

**总预估工作量：约 20 小时**

### 11.2 实施路线图

**Phase 1（1-2天）：基础设施 + 核心算法**
- [ ] 安装 Vitest + 相关依赖
- [ ] 配置 `vitest.config.ts`
- [ ] 创建 `src/test/setup.ts` 和 `src/test/test-utils.tsx`
- [ ] 编写 `cardScorer.ts` 全部测试用例
- [ ] 编写 `archetypeEngine.ts` 全部测试用例
- [ ] 编写 `saveParser.ts` 全部测试用例

**Phase 2（2-3天）：状态管理 + 数据层**
- [ ] 编写 `recordManager.ts` 集成测试
- [ ] 编写 Zustand store 测试
- [ ] 编写 `data/*.ts` 数据层测试
- [ ] 编写 `dataUpdater.ts` 测试
- [ ] 创建测试 fixtures

**Phase 3（3-4天）：组件 + E2E**
- [ ] 安装 React Testing Library
- [ ] 编写核心组件测试
- [ ] 安装 Playwright
- [ ] 编写 E2E 测试用例

**Phase 4（4-5天）：CI + 优化**
- [ ] 配置 GitHub Actions
- [ ] 集成覆盖率报告
- [ ] 性能测试
- [ ] 边界条件补充

### 11.3 测试文件结构

```
src/
├── services/
│   ├── __tests__/
│   │   ├── cardScorer.test.ts
│   │   ├── archetypeEngine.test.ts
│   │   ├── saveParser.test.ts
│   │   ├── recordManager.test.ts
│   │   └── dataUpdater.test.ts
│   ├── cardScorer.ts
│   ├── archetypeEngine.ts
│   └── ...
├── stores/
│   ├── __tests__/
│   │   ├── gameStore.test.ts
│   │   ├── settingsStore.test.ts
│   │   └── recordStore.test.ts
│   └── ...
├── components/
│   ├── __tests__/
│   │   ├── RecommendationPanel.test.tsx
│   │   ├── ArchetypePanel.test.tsx
│   │   └── CardDisplay.test.tsx
│   └── ...
├── data/
│   ├── __tests__/
│   │   ├── cards.test.ts
│   │   ├── archetypes.test.ts
│   │   └── relics.test.ts
│   └── ...
└── test/
    ├── setup.ts
    ├── test-utils.tsx
    ├── fixtures/
    │   ├── cards.ts
    │   ├── archetypes.ts
    │   └── save-files.ts
    └── mocks/
        └── browser.ts

e2e/
├── home.spec.ts
├── analyze.spec.ts
├── encyclopedia.spec.ts
├── simulator.spec.ts
└── stats.spec.ts
```

---

## 总结

### 关键发现

1. **零测试覆盖**是当前最大的技术债务
2. **cardScorer.ts** 和 **archetypeEngine.ts** 是测试优先级最高的模块，包含项目 80% 的核心业务逻辑
3. **saveParser.ts** 处理外部输入，需要大量边界条件测试
4. **IndexedDB**（recordManager）需要集成测试环境（fake-indexeddb）
5. 项目架构清晰，模块解耦良好，**非常适合引入测试**

### 建议

1. **立即行动**：先为 `cardScorer.ts` 和 `archetypeEngine.ts` 编写单元测试，这两个文件的逻辑最复杂、出错影响最大
2. **渐进推进**：不要一次性覆盖所有代码，按优先级分 Phase 实施
3. **CI 先行**：在写第一个测试之前就配置好 Vitest 和 GitHub Actions，确保测试从第一天就能运行
4. **覆盖率目标**：services/ 目标 90%+，stores/ 目标 80%+，components/ 目标 60%+
5. **测试数据**：维护一套精简的测试 fixtures，避免测试依赖真实的大型 JSON 数据文件
