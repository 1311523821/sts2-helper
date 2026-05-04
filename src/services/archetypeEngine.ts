import type {
  Archetype,
  ArchetypeMatch,
  CharacterId,
  DeckCard,
  OwnedRelic,
  DeckHealthReport,
  CostCurveAnalysis,
  CombatBalanceAnalysis,
} from '@/types'
import { getArchetypesByCharacter } from '@/data/archetypes'
import { getCardById } from '@/data/cards'
import { getRelicById } from '@/data/relics'

/** Combo 检测结果 */
export interface ComboDetection {
  comboId: string
  comboName: string
  cards: string[]
  description: string
  power: string
  isComplete: boolean
  missingCards: string[]
}

/**
 * 改进的流派匹配算法，考虑遗物协同
 */
export function matchArchetype(deck: DeckCard[], archetype: Archetype, relics: OwnedRelic[] = []): ArchetypeMatch {
  const deckIds = deck.map(c => c.cardId)
  const relicIds = relics.map(r => r.relicId)

  // 核心卡匹配
  let coreScore = 0
  let coreTotal = 0
  const ownedCore: string[] = []
  const missingCore: string[] = []

  for (const cw of archetype.coreCards) {
    coreTotal += cw.weight
    if (deckIds.includes(cw.cardId)) {
      coreScore += cw.weight
      ownedCore.push(cw.cardId)
    } else {
      missingCore.push(cw.cardId)
    }
  }
  const coreCardScore = coreTotal > 0 ? (coreScore / coreTotal) * 100 : 0

  // 重要卡匹配
  let impScore = 0
  let impTotal = 0
  for (const cw of archetype.importantCards) {
    impTotal += cw.weight
    if (deckIds.includes(cw.cardId)) impScore += cw.weight
  }
  const importantCardScore = impTotal > 0 ? (impScore / impTotal) * 100 : 0

  // 辅助卡匹配
  let supScore = 0
  let supTotal = 0
  for (const cw of archetype.supportCards) {
    supTotal += cw.weight
    if (deckIds.includes(cw.cardId)) supScore += cw.weight
  }
  const supportCardScore = supTotal > 0 ? (supScore / supTotal) * 100 : 0

  // 牌型比例
  const ratio = calcDeckRatio(deck)
  const ideal = archetype.preferredRatio
  const ratioDiff = Math.abs(ratio.attack - ideal.attack) + Math.abs(ratio.skill - ideal.skill) + Math.abs(ratio.power - ideal.power)
  const ratioScore = Math.max(0, (1 - ratioDiff / 2) * 100)

  // 费用曲线
  const costCurve = calcCostCurve(deck)
  let costDiff = 0
  for (let i = 0; i < 4; i++) {
    costDiff += Math.abs((costCurve[i] || 0) - (archetype.idealCostCurve[i] || 0))
  }
  const costCurveScore = Math.max(0, (1 - costDiff) * 100)

  // 协同度
  const synergyScore = calcDeckSynergyScore(deck)

  // 遗物协同加分
  let relicBonus = 0
  for (const relicId of relicIds) {
    const relic = getRelicById(relicId)
    if (!relic) continue
    // 检查遗物标签是否与流派相关
    for (const tag of relic.tags) {
      if (archetype.description.includes(tag) || archetype.name.includes(tag)) {
        relicBonus += 5
      }
    }
    // 检查遗物与核心卡的协同
    for (const cw of archetype.coreCards) {
      const card = getCardById(cw.cardId)
      if (!card) continue
      const commonTags = relic.tags.filter(t => card.tags.includes(t))
      relicBonus += commonTags.length * 3
    }
  }

  const w = archetype.scoringWeights
  const totalScore = Math.round(
    coreCardScore * w.coreCardMatch +
    importantCardScore * w.importantCardMatch +
    supportCardScore * w.supportCardMatch +
    ratioScore * w.ratioMatch +
    costCurveScore * w.costCurveMatch +
    synergyScore * w.synergyBonus +
    relicBonus
  )

  const nextSteps: string[] = []
  if (missingCore.length > 0) {
    const mc = missingCore[0]
    const card = getCardById(mc)
    nextSteps.push(`优先拿取核心卡: ${card?.name || mc}`)
  }

  return {
    archetypeId: archetype.id,
    archetypeName: archetype.name,
    score: Math.min(100, Math.max(0, totalScore)),
    scores: {
      coreCardScore: Math.round(coreCardScore),
      importantCardScore: Math.round(importantCardScore),
      supportCardScore: Math.round(supportCardScore),
      ratioScore: Math.round(ratioScore),
      costCurveScore: Math.round(costCurveScore),
      synergyScore: Math.round(synergyScore),
    },
    ownedCore: ownedCore.map(id => getCardById(id)?.name || id),
    missingCore: missingCore.map(id => getCardById(id)?.name || id),
    nextSteps,
  }
}

/**
 * 识别牌库可能的流派方向
 */
export function identifyArchetypes(deck: DeckCard[], characterId: CharacterId, relics: OwnedRelic[] = []): ArchetypeMatch[] {
  const archetypes = getArchetypesByCharacter(characterId)
  const matches = archetypes.map(a => matchArchetype(deck, a, relics))
  return matches.filter(m => m.score > 15).sort((a, b) => b.score - a.score)
}

/**
 * Combo 检测器 - 检测牌库中的 Combo 组合
 */
export function detectCombos(deck: DeckCard[], characterId: CharacterId): ComboDetection[] {
  const archetypes = getArchetypesByCharacter(characterId)
  const deckIds = deck.map(c => c.cardId)
  const results: ComboDetection[] = []

  for (const archetype of archetypes) {
    for (const combo of archetype.combos) {
      const owned = combo.cards.filter(c => deckIds.includes(c))
      const missing = combo.cards.filter(c => !deckIds.includes(c))
      results.push({
        comboId: combo.id,
        comboName: combo.name,
        cards: combo.cards.map(id => getCardById(id)?.name || id),
        description: combo.description,
        power: combo.power,
        isComplete: missing.length === 0,
        missingCards: missing.map(id => getCardById(id)?.name || id),
      })
    }
  }

  // 按完成度和强度排序
  return results.sort((a, b) => {
    if (a.isComplete !== b.isComplete) return a.isComplete ? -1 : 1
    const powerOrder = { game_winning: 4, high: 3, medium: 2, low: 1 }
    return (powerOrder[b.power as keyof typeof powerOrder] || 0) - (powerOrder[a.power as keyof typeof powerOrder] || 0)
  })
}

/**
 * 牌库健康度分析
 */
export function analyzeDeckHealth(deck: DeckCard[]): DeckHealthReport {
  const cards = deck.map(dc => getCardById(dc.cardId)).filter(Boolean)
  const issues: string[] = []
  const suggestions: string[] = []

  // 攻防平衡
  const balance = analyzeCombatBalance(deck)

  // 费用曲线
  const costCurve = analyzeCostCurve(deck)

  // 卡牌质量（稀有度加权）
  let qualitySum = 0
  for (const card of cards) {
    if (!card) continue
    switch (card.rarity) {
      case 'rare': qualitySum += 3; break
      case 'uncommon': qualitySum += 2; break
      case 'common': qualitySum += 1; break
      default: qualitySum += 0.5
    }
  }
  const cardQuality = Math.min(100, (qualitySum / (cards.length || 1)) * 33)

  // 协同度
  const synergy = calcDeckSynergyScore(deck)

  // 问题检测
  if (balance.balance === 'attack_heavy') {
    issues.push('攻击牌比例过高，防御能力不足')
    suggestions.push('建议补充防御或护甲类卡牌')
  }
  if (balance.balance === 'defense_heavy') {
    issues.push('防御牌比例过高，输出能力不足')
    suggestions.push('建议补充攻击类卡牌提升输出')
  }
  if (costCurve.rating === 'too_high') {
    issues.push('费用曲线偏高，容易卡手')
    suggestions.push('建议补充低费牌或能量获取牌')
  }
  if (deck.length > 35) {
    issues.push('牌库过大，核心牌上手率降低')
    suggestions.push('建议通过消耗或移除精简牌库')
  }
  if (deck.length < 12) {
    issues.push('牌库过小，可能缺乏应对不同情况的能力')
  }
  if (synergy < 20) {
    issues.push('牌库协同度低，各牌之间缺乏配合')
    suggestions.push('建议围绕核心Combo补充关键牌')
  }

  const overall = Math.round(
    balance.rating * 0.3 +
    (costCurve.rating === 'good' ? 80 : costCurve.rating === 'too_low' ? 50 : 40) * 0.2 +
    cardQuality * 0.25 +
    synergy * 0.25
  )

  return {
    overall: Math.min(100, Math.max(0, overall)),
    attackBalance: Math.round(balance.attackRatio * 100),
    defenseBalance: Math.round(balance.defenseRatio * 100),
    costCurve: Math.round(costCurve.averageCost * 100) / 100,
    cardQuality: Math.round(cardQuality),
    synergy: Math.round(synergy),
    issues,
    suggestions,
  }
}

/**
 * 费用曲线分析
 */
export function analyzeCostCurve(deck: DeckCard[]): CostCurveAnalysis {
  const curve = calcCostCurve(deck)
  const cards = deck.map(dc => getCardById(dc.cardId)).filter(Boolean)

  let totalCost = 0
  let count = 0
  for (const card of cards) {
    if (!card) continue
    totalCost += card.cost
    count++
  }
  const averageCost = count > 0 ? totalCost / count : 0
  const oneDropRatio = curve[0] || 0
  const highCostRatio = (curve[2] || 0) + (curve[3] || 0)

  let rating: 'too_low' | 'good' | 'too_high'
  let suggestion: string

  if (averageCost < 1.0) {
    rating = 'too_low'
    suggestion = '费用曲线偏低，缺乏高影响力牌，建议补充中高费强力牌'
  } else if (averageCost > 1.8) {
    rating = 'too_high'
    suggestion = '费用曲线偏高，容易卡手，建议补充低费灵活牌'
  } else {
    rating = 'good'
    suggestion = '费用曲线合理，保持0-2费为主体'
  }

  return {
    curve: curve.map(v => Math.round(v * 100)),
    averageCost: Math.round(averageCost * 100) / 100,
    oneDropRatio: Math.round(oneDropRatio * 100),
    highCostRatio: Math.round(highCostRatio * 100),
    rating,
    suggestion,
  }
}

/**
 * 攻防平衡分析
 */
export function analyzeCombatBalance(deck: DeckCard[]): CombatBalanceAnalysis {
  let atk = 0, def = 0, pw = 0, total = 0
  for (const dc of deck) {
    const card = getCardById(dc.cardId)
    if (!card) continue
    total++
    if (card.type === 'attack') atk++
    else if (card.type === 'skill') def++
    else if (card.type === 'power') pw++
  }
  const t = total || 1
  const attackRatio = atk / t
  const defenseRatio = def / t
  const powerRatio = pw / t

  let balance: 'attack_heavy' | 'balanced' | 'defense_heavy'
  let rating: number

  if (attackRatio > 0.55) {
    balance = 'attack_heavy'
    rating = 40 + (1 - Math.abs(attackRatio - 0.45)) * 60
  } else if (defenseRatio > 0.5) {
    balance = 'defense_heavy'
    rating = 40 + (1 - Math.abs(defenseRatio - 0.4)) * 60
  } else {
    balance = 'balanced'
    rating = 70 + (1 - Math.abs(attackRatio - 0.4)) * 30
  }

  let suggestion: string
  switch (balance) {
    case 'attack_heavy':
      suggestion = '攻击偏多，建议补充防御牌或护甲牌'
      break
    case 'defense_heavy':
      suggestion = '防御偏多，建议补充攻击牌提升输出'
      break
    default:
      suggestion = '攻防平衡良好'
  }

  return {
    attackRatio: Math.round(attackRatio * 100) / 100,
    defenseRatio: Math.round(defenseRatio * 100) / 100,
    powerRatio: Math.round(powerRatio * 100) / 100,
    balance,
    rating: Math.round(Math.min(100, Math.max(0, rating))),
    suggestion,
  }
}

// ---- 内部辅助函数 ----

function calcDeckRatio(deck: DeckCard[]) {
  let atk = 0, sk = 0, pw = 0
  for (const dc of deck) {
    const card = getCardById(dc.cardId)
    if (!card) continue
    if (card.type === 'attack') atk++
    else if (card.type === 'skill') sk++
    else if (card.type === 'power') pw++
  }
  const total = deck.length || 1
  return { attack: atk / total, skill: sk / total, power: pw / total }
}

function calcCostCurve(deck: DeckCard[]): number[] {
  const curve = [0, 0, 0, 0]
  for (const dc of deck) {
    const card = getCardById(dc.cardId)
    if (!card) continue
    const idx = card.cost >= 3 ? 3 : card.cost
    curve[idx]++
  }
  const total = deck.length || 1
  return curve.map(v => v / total)
}

function calcDeckSynergyScore(deck: DeckCard[]): number {
  const cards = deck.map(dc => getCardById(dc.cardId)).filter(Boolean)
  if (cards.length < 2) return 0
  let synergyPairs = 0
  let totalPairs = 0
  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      totalPairs++
      const common = cards[i]!.tags.filter(t => cards[j]!.tags.includes(t))
      if (common.length > 0) synergyPairs++
    }
  }
  return totalPairs > 0 ? (synergyPairs / totalPairs) * 100 : 0
}
