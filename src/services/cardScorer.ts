import type { CardOption, DeckCard, ArchetypeMatch, OwnedRelic, CardScore, SkipAnalysis, Recommendation } from '@/types'
import { getCardById } from '@/data/cards'
import { getArchetypeById } from '@/data/archetypes'
import { getRelicById } from '@/data/relics'
import { analyzeDeckHealth } from './archetypeEngine'
import { calcDeckRatio } from '@/utils/deckUtils'

export type { CardScore, SkipAnalysis, Recommendation }

/**
 * 改进的多维度选牌评分
 */
export function scoreCardOptions(
  options: CardOption[],
  deck: DeckCard[],
  archetypes: ArchetypeMatch[],
  floor: number,
  relics: OwnedRelic[] = []
): CardScore[] {
  const scores = options.map(opt => {
    const card = getCardById(opt.cardId)
    if (!card) {
      return {
        cardId: opt.cardId,
        cardName: '未知',
        cardType: 'unknown',
        score: 50,
        reasons: ['未知卡牌'],
        dimensionScores: { baseStrength: 50, archetypeFit: 0, synergy: 0, floorAdaptation: 50, relicSynergy: 0, deckHealth: 50 },
      }
    }

    const reasons: string[] = []

    // 1. 基础强度 (20%)
    const baseStrength = calcBaseStrength(card, floor)
    if (card.rarity === 'rare') reasons.push('💎 稀有牌，获取机会有限')
    if (card.cost === 0) reasons.push('⚡ 0费牌，灵活不卡手')

    // 2. 流派适配 (25%)
    const archetypeFit = calcArchetypeFit(card, archetypes, reasons)

    // 3. 牌库协同 (20%)
    const synergy = calcCardSynergy(card.id, deck)
    if (synergy > 50) reasons.push('🤝 与牌库中的卡牌有良好协同')

    // 4. 楼层适配 (15%)
    const floorAdaptation = calcFloorAdaptation(card, floor)
    if (floor < 10 && card.type === 'attack') reasons.push('🗡️ 前期需要攻击牌提升输出')
    if (floor > 20 && card.type === 'power') reasons.push('🔋 中后期能力牌价值高')

    // 5. 遗物协同 (10%)
    const relicSynergy = calcRelicSynergy(card.id, relics)
    if (relicSynergy > 30) reasons.push('🔮 与已有遗物形成配合')

    // 6. 牌库健康度 (10%)
    const deckHealth = calcDeckHealthContribution(card, deck)

    // 加权总分
    const score = Math.round(
      baseStrength * 0.20 +
      archetypeFit * 0.25 +
      synergy * 0.20 +
      floorAdaptation * 0.15 +
      relicSynergy * 0.10 +
      deckHealth * 0.10
    )

    if (reasons.length === 0) reasons.push('中规中矩的选择')

    return {
      cardId: card.id,
      cardName: card.name,
      cardType: card.type,
      score: Math.min(100, Math.max(0, score)),
      reasons,
      dimensionScores: {
        baseStrength: Math.round(baseStrength),
        archetypeFit: Math.round(archetypeFit),
        synergy: Math.round(synergy),
        floorAdaptation: Math.round(floorAdaptation),
        relicSynergy: Math.round(relicSynergy),
        deckHealth: Math.round(deckHealth),
      },
    }
  })

  return scores.sort((a, b) => b.score - a.score)
}

/**
 * 增强的跳过选项分析
 */
export function evaluateSkipOption(
  options: CardOption[],
  deck: DeckCard[],
  archetypes: ArchetypeMatch[],
  floor: number,
  relics: OwnedRelic[] = []
): SkipAnalysis {
  const detailedReasons: string[] = []

  // 评分各选项
  const optionScores = scoreCardOptions(options, deck, archetypes, floor, relics)
  const bestScore = optionScores.length > 0 ? optionScores[0].score : 0

  // 跳过基础价值
  let skipValue = 30

  // 牌库大小影响
  if (deck.length < 15) {
    skipValue += 15
    detailedReasons.push('牌库较小（<15张），每张新牌对上手率影响大')
  } else if (deck.length > 30) {
    skipValue += 25
    detailedReasons.push('牌库较大（>30张），应精简而非扩充')
  }

  // 流派匹配度影响
  if (archetypes.length > 0 && archetypes[0].score > 40 && bestScore < 40) {
    skipValue += 20
    detailedReasons.push(`当前流派方向(${archetypes[0].archetypeName})明确，选项不匹配`)
  }

  // 牌库健康度影响
  const healthReport = analyzeDeckHealth(deck)
  if (healthReport.overall > 70) {
    skipValue += 10
    detailedReasons.push('牌库健康度良好，无需勉强补充')
  }

  // 前期减分（需要扩充牌库）
  if (floor < 10) {
    skipValue -= 15
    detailedReasons.push('前期需要扩充牌库应对精英和BOSS')
  }

  // BOSS奖励（通常更好的选项）
  if (floor % 16 === 0) {
    skipValue -= 10
    detailedReasons.push('BOSS奖励卡牌质量较高，值得选择')
  }

  const shouldSkip = skipValue > bestScore

  if (shouldSkip) {
    detailedReasons.unshift('最佳选项评分较低，不选更优')
  } else {
    detailedReasons.unshift(`最佳选项(${optionScores[0]?.cardName})评分${bestScore}，值得选择`)
  }

  return {
    shouldSkip,
    skipValue: Math.round(skipValue),
    reason: shouldSkip
      ? '当前选项与牌库方向不匹配，保持牌库精简更优'
      : '建议从当前选项中选择一张',
    detailedReasons,
  }
}

/**
 * 生成推荐理由
 */
export function generateRecommendationReason(
  cardId: string,
  deck: DeckCard[],
  archetypes: ArchetypeMatch[],
  floor: number
): string {
  const card = getCardById(cardId)
  if (!card) return '未知卡牌'

  const reasons: string[] = []

  // 流派匹配
  for (const am of archetypes.slice(0, 2)) {
    const archetype = getArchetypeById(am.archetypeId)
    if (!archetype) continue
    if (archetype.coreCards.some(c => c.cardId === cardId)) {
      reasons.push(`是${archetype.name}的核心组件`)
    } else if (archetype.importantCards.some(c => c.cardId === cardId)) {
      reasons.push(`是${archetype.name}的关键补充`)
    }
  }

  // 协同
  const deckTags = new Map<string, number>()
  for (const dc of deck) {
    const c = getCardById(dc.cardId)
    if (!c) continue
    for (const tag of c.tags) {
      deckTags.set(tag, (deckTags.get(tag) || 0) + 1)
    }
  }
  const matchingTags = card.tags.filter(t => (deckTags.get(t) || 0) >= 2)
  if (matchingTags.length > 0) {
    reasons.push(`与牌库中的${matchingTags.join('、')}主题配合`)
  }

  // 楼层
  if (floor < 8 && card.type === 'attack') reasons.push('前期提升输出能力')
  if (floor > 20 && card.type === 'power') reasons.push('后期能力牌滚雪球')
  if (card.cost === 0) reasons.push('0费牌增强灵活性')

  return reasons.length > 0 ? reasons.join('；') : '综合评分较高的选择'
}

// ---- 内部辅助函数 ----

function calcBaseStrength(card: { type: string; rarity: string; cost: number }, floor: number): number {
  let s = 50
  if (card.type === 'attack' && floor < 15) s += 10
  if (card.type === 'power' && floor > 20) s += 10
  if (card.rarity === 'rare') s += 15
  if (card.rarity === 'uncommon') s += 5
  if (card.cost <= 1) s += 5
  if (card.cost === 0) s += 5
  return Math.min(100, s)
}

function calcArchetypeFit(
  card: { id: string },
  archetypes: ArchetypeMatch[],
  reasons: string[]
): number {
  let fit = 0
  for (const am of archetypes.slice(0, 3)) {
    const archetype = getArchetypeById(am.archetypeId)
    if (!archetype) continue

    const isCore = archetype.coreCards.find(c => c.cardId === card.id)
    const isImportant = archetype.importantCards.find(c => c.cardId === card.id)
    const isSupport = archetype.supportCards.find(c => c.cardId === card.id)

    if (isCore) {
      fit = Math.max(fit, 60 + isCore.weight * 0.4)
      reasons.push(`🗡️ ${archetype.name}的核心卡牌`)
    } else if (isImportant) {
      fit = Math.max(fit, 40 + isImportant.weight * 0.3)
      reasons.push(`⚔️ ${archetype.name}的重要卡牌`)
    } else if (isSupport) {
      fit = Math.max(fit, 20)
    }
  }
  if (fit === 0) reasons.push('与当前流派方向不太匹配')
  return fit
}

function calcCardSynergy(cardId: string, deck: DeckCard[]): number {
  const card = getCardById(cardId)
  if (!card) return 0
  let synergy = 0
  for (const dc of deck) {
    const other = getCardById(dc.cardId)
    if (!other) continue
    const common = card.tags.filter(t => other.tags.includes(t))
    synergy += common.length * 12
  }
  return Math.min(100, synergy)
}

function calcFloorAdaptation(card: { type: string; rarity: string; cost: number }, floor: number): number {
  let score = 50

  // 前期偏好攻击和低费
  if (floor < 10) {
    if (card.type === 'attack') score += 15
    if (card.cost <= 1) score += 10
    if (card.rarity === 'rare') score += 5
  }
  // 中期偏好平衡
  else if (floor < 20) {
    if (card.rarity === 'rare' || card.rarity === 'uncommon') score += 10
  }
  // 后期偏好能力和高价值牌
  else {
    if (card.type === 'power') score += 15
    if (card.rarity === 'rare') score += 10
    if (card.cost >= 2) score += 5
  }

  return Math.min(100, score)
}

function calcRelicSynergy(cardId: string, relics: OwnedRelic[]): number {
  const card = getCardById(cardId)
  if (!card || relics.length === 0) return 0

  let synergy = 0
  for (const owned of relics) {
    const relic = getRelicById(owned.relicId)
    if (!relic) continue

    // 标签匹配
    const commonTags = card.tags.filter(t => relic.tags.includes(t))
    synergy += commonTags.length * 20

    // 特殊协同检测
    // 力量遗物 + 力量相关卡
    if (relic.tags.includes('力量') && card.tags.includes('力量')) synergy += 15
    // 过牌遗物 + 过牌卡
    if (relic.tags.includes('过牌') && card.tags.includes('过牌')) synergy += 10
    // 消耗遗物 + 消耗卡
    if (relic.tags.includes('消耗') && card.tags.includes('消耗')) synergy += 15
  }

  return Math.min(100, synergy)
}

function calcDeckHealthContribution(card: { type: string; cost: number }, deck: DeckCard[]): number {
  const ratio = calcDeckRatio(deck)
  let score = 50

  // 如果牌库攻击偏多，防御牌加分
  if (ratio.attack > 0.5 && card.type === 'skill') score += 20
  // 如果牌库防御偏多，攻击牌加分
  if (ratio.skill > 0.5 && card.type === 'attack') score += 20
  // 能力牌通常都是好补充
  if (card.type === 'power') score += 10
  // 低费牌改善费用曲线
  if (card.cost <= 1) score += 5

  return Math.min(100, score)
}


