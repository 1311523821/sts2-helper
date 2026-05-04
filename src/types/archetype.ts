import type { CharacterId } from './card'

export interface CardWeight {
  cardId: string
  weight: number
  isCore: boolean
  reason: string
  alternative?: string
}

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'
export type ComboPowerLevel = 'low' | 'medium' | 'high' | 'game_winning'

export interface Combo {
  id: string
  name: string
  cards: string[]
  description: string
  power: ComboPowerLevel
  setup: string
}

export interface ArchetypeGuide {
  overview: string
  coreStrategy: string
  earlyGame: string
  midGame: string
  lateGame: string
  tips: string[]
  commonMistakes: string[]
}

export interface Archetype {
  id: string
  name: string
  nameEn: string
  character: CharacterId
  description: string
  difficulty: DifficultyLevel
  coreCards: CardWeight[]
  importantCards: CardWeight[]
  supportCards: CardWeight[]
  preferredRatio: {
    attack: number
    skill: number
    power: number
  }
  idealCostCurve: number[]
  scoringWeights: {
    coreCardMatch: number
    importantCardMatch: number
    supportCardMatch: number
    ratioMatch: number
    costCurveMatch: number
    synergyBonus: number
  }
  cardScorerWeights: {
    baseStrength: number
    archetypeFit: number
    synergy: number
    floorAdaptation: number
    relicSynergy: number
    deckHealth: number
  }
  combos: Combo[]
  guide: ArchetypeGuide
}

export interface ArchetypeMatch {
  archetypeId: string
  archetypeName: string
  score: number
  scores: {
    coreCardScore: number
    importantCardScore: number
    supportCardScore: number
    ratioScore: number
    costCurveScore: number
    synergyScore: number
  }
  ownedCore: string[]
  missingCore: string[]
  nextSteps: string[]
}
