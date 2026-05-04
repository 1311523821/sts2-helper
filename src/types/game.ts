import type { CardOption, CharacterId, DeckCard } from './card'
import type { OwnedRelic } from './relic'

export interface GameState {
  character: CharacterId
  floor: number
  act: number
  health: number
  maxHealth: number
  gold: number
  deck: DeckCard[]
  relics: OwnedRelic[]
  cardReward?: CardReward
  timestamp: number
}

export interface CardReward {
  options: CardOption[]
  isUpgrade: boolean
  source: 'combat' | 'event' | 'shop' | 'boss'
}

export interface Recommendation {
  scores: CardScore[]
  skipAnalysis: SkipAnalysis
  timestamp: number
}

export interface CardScore {
  cardId: string
  cardName: string
  cardType: string
  score: number
  reasons: string[]
  /** 各维度评分详情 */
  dimensionScores?: ScoreDimensions
}

export interface ScoreDimensions {
  baseStrength: number
  archetypeFit: number
  synergy: number
  floorAdaptation: number
  relicSynergy: number
  deckHealth: number
}

export interface SkipAnalysis {
  shouldSkip: boolean
  skipValue: number
  reason: string
  /** 不选的具体理由 */
  detailedReasons: string[]
}

/** 牌库健康度分析 */
export interface DeckHealthReport {
  overall: number
  attackBalance: number
  defenseBalance: number
  costCurve: number
  cardQuality: number
  synergy: number
  issues: string[]
  suggestions: string[]
}

/** 费用曲线分析 */
export interface CostCurveAnalysis {
  curve: number[]
  averageCost: number
  oneDropRatio: number
  highCostRatio: number
  xCardCount: number
  rating: 'too_low' | 'good' | 'too_high'
  suggestion: string
}

/** 攻防平衡分析 */
export interface CombatBalanceAnalysis {
  attackRatio: number
  defenseRatio: number
  powerRatio: number
  balance: 'attack_heavy' | 'balanced' | 'defense_heavy'
  rating: number
  suggestion: string
}
