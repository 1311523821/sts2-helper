import type { CharacterId, DeckCard, CardOption } from './card'
import type { OwnedRelic } from './relic'

export interface Decision {
  floor: number
  timestamp: string
  options: CardOption[]
  chosen: string
  recommended?: string
  recommendationScore?: number
  reason?: string
}

export interface GameRecord {
  id: string
  character: CharacterId
  startTime: string
  endTime?: string
  result: 'win' | 'loss' | 'abandoned'
  finalFloor: number
  finalDeck: DeckCard[]
  relics: OwnedRelic[]
  gold: number
  maxHealth: number
  decisions: Decision[]
  deckSynergyScore?: number
  overallRating?: number
  improvements?: string[]
  /** 存档来源 */
  saveSource?: 'manual' | 'auto_parse'
}

/** 假设分析结果 */
export interface HypotheticalAnalysis {
  originalDecision: Decision
  hypotheticalChoice: string
  hypotheticalCard: string
  /** 假设选择后的牌库 */
  hypotheticalDeck: DeckCard[]
  /** 假设后的流派匹配 */
  archetypeMatchDelta: number
  /** 假设后的牌库健康度 */
  deckHealthDelta: number
  analysis: string
}

/** 记录统计 */
export interface RecordStats {
  totalRuns: number
  winRate: number
  averageFloor: number
  averageDecisions: number
  mostPlayedCharacter: CharacterId
  bestWinStreak: number
  currentWinStreak: number
}
