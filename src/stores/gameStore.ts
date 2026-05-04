import { create } from 'zustand'
import type { CharacterId, DeckCard, ArchetypeMatch, OwnedRelic, DeckHealthReport, CostCurveAnalysis, CombatBalanceAnalysis } from '@/types'
import type { Recommendation } from '@/services/cardScorer'
import type { ComboDetection } from '@/services/archetypeEngine'
import {
  identifyArchetypes,
  analyzeDeckHealth,
  analyzeCostCurve,
  analyzeCombatBalance,
  detectCombos,
} from '@/services/archetypeEngine'
import { scoreCardOptions, evaluateSkipOption } from '@/services/cardScorer'

interface GameState {
  character: CharacterId | null
  deck: DeckCard[]
  relics: OwnedRelic[]
  floor: number
  health: number
  maxHealth: number
  gold: number
  archetypes: ArchetypeMatch[]
  recommendation: Recommendation | null
  deckHealth: DeckHealthReport | null
  costCurve: CostCurveAnalysis | null
  combatBalance: CombatBalanceAnalysis | null
  combos: ComboDetection[]

  setCharacter: (c: CharacterId) => void
  setDeck: (d: DeckCard[]) => void
  addCard: (cardId: string) => void
  removeCard: (cardId: string) => void
  clearDeck: () => void
  setFloor: (f: number) => void
  setHealth: (h: number) => void
  setMaxHealth: (mh: number) => void
  setGold: (g: number) => void
  setRelics: (r: OwnedRelic[]) => void
  addRelic: (relicId: string) => void
  removeRelic: (relicId: string) => void
  analyzeDeck: () => void
  analyzeReward: (optionIds: string[]) => void
  updateGameState: (state: Partial<Pick<GameState, 'floor' | 'health' | 'maxHealth' | 'gold'>>) => void
}

/** 统一计算牌库全量分析，避免多次 set() */
function computeFullAnalysis(deck: DeckCard[], character: CharacterId, relics: OwnedRelic[]) {
  return {
    archetypes: identifyArchetypes(deck, character, relics),
    deckHealth: analyzeDeckHealth(deck),
    costCurve: analyzeCostCurve(deck),
    combatBalance: analyzeCombatBalance(deck),
    combos: detectCombos(deck, character),
  }
}

export const useGameStore = create<GameState>((set, get) => ({
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

  setCharacter: (c) => {
    set({ character: c, deck: [], relics: [], archetypes: [], recommendation: null, deckHealth: null, costCurve: null, combatBalance: null, combos: [] })
  },

  setDeck: (d) => {
    const { character, relics } = get()
    if (character) {
      set({ deck: d, ...computeFullAnalysis(d, character, relics) })
    } else {
      set({ deck: d })
    }
  },

  addCard: (cardId) => {
    const { deck, character, relics } = get()
    const newDeck = [...deck, { cardId, upgraded: false }]
    if (character) {
      set({ deck: newDeck, ...computeFullAnalysis(newDeck, character, relics) })
    } else {
      set({ deck: newDeck })
    }
  },

  removeCard: (cardId) => {
    const { deck, character, relics } = get()
    const idx = deck.findIndex(d => d.cardId === cardId)
    if (idx === -1) return
    const newDeck = [...deck.slice(0, idx), ...deck.slice(idx + 1)]
    if (character) {
      set({ deck: newDeck, ...computeFullAnalysis(newDeck, character, relics) })
    } else {
      set({ deck: newDeck })
    }
  },

  clearDeck: () => set({ deck: [], archetypes: [], recommendation: null, deckHealth: null, costCurve: null, combatBalance: null, combos: [] }),

  setFloor: (f) => set({ floor: f }),
  setHealth: (h) => set({ health: h }),
  setMaxHealth: (mh) => set({ maxHealth: mh }),
  setGold: (g) => set({ gold: g }),

  setRelics: (r) => {
    const { deck, character } = get()
    if (character) {
      set({ relics: r, archetypes: identifyArchetypes(deck, character, r) })
    } else {
      set({ relics: r })
    }
  },

  addRelic: (relicId) => {
    const { relics, deck, character, floor } = get()
    const newRelics = [...relics, { relicId, obtainedAtFloor: floor }]
    if (character) {
      set({ relics: newRelics, archetypes: identifyArchetypes(deck, character, newRelics) })
    } else {
      set({ relics: newRelics })
    }
  },

  removeRelic: (relicId) => {
    const { relics, deck, character } = get()
    const newRelics = relics.filter(r => r.relicId !== relicId)
    if (character) {
      set({ relics: newRelics, archetypes: identifyArchetypes(deck, character, newRelics) })
    } else {
      set({ relics: newRelics })
    }
  },

  analyzeDeck: () => {
    const { deck, character, relics } = get()
    if (!character) return
    set(computeFullAnalysis(deck, character, relics))
  },

  analyzeReward: (optionIds) => {
    const { deck, character, floor, archetypes, relics } = get()
    if (!character) return
    const options = optionIds.map(id => ({ cardId: id, upgraded: false }))
    const scores = scoreCardOptions(options, deck, archetypes, floor, relics)
    const skipAnalysis = evaluateSkipOption(options, deck, archetypes, floor, relics)
    set({ recommendation: { scores, skipAnalysis, timestamp: Date.now() } })
  },

  updateGameState: (partial) => {
    set(partial)
  },
}))
