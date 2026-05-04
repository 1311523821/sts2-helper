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
    set({ deck: d })
    const { character, relics } = get()
    if (character) {
      const archetypes = identifyArchetypes(d, character, relics)
      const deckHealth = analyzeDeckHealth(d)
      const costCurve = analyzeCostCurve(d)
      const combatBalance = analyzeCombatBalance(d)
      const combos = detectCombos(d, character)
      set({ archetypes, deckHealth, costCurve, combatBalance, combos })
    }
  },

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

  removeCard: (cardId) => {
    const { deck, character, relics } = get()
    const idx = deck.findIndex(d => d.cardId === cardId)
    if (idx === -1) return
    const newDeck = [...deck.slice(0, idx), ...deck.slice(idx + 1)]
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

  clearDeck: () => set({ deck: [], archetypes: [], recommendation: null, deckHealth: null, costCurve: null, combatBalance: null, combos: [] }),

  setFloor: (f) => set({ floor: f }),
  setHealth: (h) => set({ health: h }),
  setMaxHealth: (mh) => set({ maxHealth: mh }),
  setGold: (g) => set({ gold: g }),

  setRelics: (r) => {
    set({ relics: r })
    const { deck, character } = get()
    if (character) {
      set({ archetypes: identifyArchetypes(deck, character, r) })
    }
  },

  addRelic: (relicId) => {
    const { relics, deck, character } = get()
    const newRelics = [...relics, { relicId, obtainedAtFloor: get().floor }]
    set({ relics: newRelics })
    if (character) {
      set({ archetypes: identifyArchetypes(deck, character, newRelics) })
    }
  },

  removeRelic: (relicId) => {
    const { relics, deck, character } = get()
    const newRelics = relics.filter(r => r.relicId !== relicId)
    set({ relics: newRelics })
    if (character) {
      set({ archetypes: identifyArchetypes(deck, character, newRelics) })
    }
  },

  analyzeDeck: () => {
    const { deck, character, relics } = get()
    if (!character) return
    set({
      archetypes: identifyArchetypes(deck, character, relics),
      deckHealth: analyzeDeckHealth(deck),
      costCurve: analyzeCostCurve(deck),
      combatBalance: analyzeCombatBalance(deck),
      combos: detectCombos(deck, character),
    })
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
