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
import { getCachedAnalysis, setCachedAnalysis } from '@/services/analysisCache'

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

/**
 * 一次计算所有分析结果（级联更新合并）。
 * 先查缓存，缓存命中直接返回，否则计算后缓存。
 */
function computeFullAnalysis(
  deck: DeckCard[],
  character: CharacterId,
  relics: OwnedRelic[]
): {
  archetypes: ArchetypeMatch[]
  deckHealth: DeckHealthReport
  costCurve: CostCurveAnalysis
  combatBalance: CombatBalanceAnalysis
  combos: ComboDetection[]
} {
  // 尝试从缓存读取
  const cached = getCachedAnalysis(deck, character, relics)
  if (cached) {
    return {
      archetypes: cached.archetypes,
      deckHealth: cached.deckHealth,
      costCurve: cached.costCurve,
      combatBalance: cached.combatBalance,
      combos: cached.combos,
    }
  }

  // 全部计算
  const archetypes = identifyArchetypes(deck, character, relics)
  const deckHealth = analyzeDeckHealth(deck)
  const costCurve = analyzeCostCurve(deck)
  const combatBalance = analyzeCombatBalance(deck)
  const combos = detectCombos(deck, character)

  // 入缓存
  setCachedAnalysis(deck, { archetypes, deckHealth, costCurve, combatBalance, combos })

  return { archetypes, deckHealth, costCurve, combatBalance, combos }
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
    set({ character: c, deck: [], relics: [], archetypes: [], recommendation: null, deckHealth: null, combos: [] })
  },

  setDeck: (d) => {
    const { character, relics } = get()
    if (character) {
      const analysis = computeFullAnalysis(d, character, relics)
      set({ deck: d, ...analysis })
    } else {
      set({ deck: d })
    }
  },

  addCard: (cardId) => {
    const { deck, character, relics } = get()
    const newDeck = [...deck, { cardId, upgraded: false }]
    if (character) {
      const analysis = computeFullAnalysis(newDeck, character, relics)
      set({ deck: newDeck, ...analysis })
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
      const analysis = computeFullAnalysis(newDeck, character, relics)
      set({ deck: newDeck, ...analysis })
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
      // 改变遗物只需重新计算 archetypes 匹配，其他不变
      const archetypes = identifyArchetypes(deck, character, r)
      set({ relics: r, archetypes })
    } else {
      set({ relics: r })
    }
  },

  addRelic: (relicId) => {
    const { relics, deck, character } = get()
    const newRelics = [...relics, { relicId, obtainedAtFloor: get().floor }]
    if (character) {
      const archetypes = identifyArchetypes(deck, character, newRelics)
      set({ relics: newRelics, archetypes })
    } else {
      set({ relics: newRelics })
    }
  },

  removeRelic: (relicId) => {
    const { relics, deck, character } = get()
    const newRelics = relics.filter(r => r.relicId !== relicId)
    if (character) {
      const archetypes = identifyArchetypes(deck, character, newRelics)
      set({ relics: newRelics, archetypes })
    } else {
      set({ relics: newRelics })
    }
  },

  analyzeDeck: () => {
    const { deck, character, relics } = get()
    if (!character) return
    const analysis = computeFullAnalysis(deck, character, relics)
    set(analysis)
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
