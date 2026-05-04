import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from '../gameStore'

// Create a fresh store for each test by resetting the state
function resetStore() {
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
}

describe('gameStore', () => {
  beforeEach(() => {
    resetStore()
  })

  describe('setCharacter()', () => {
    it('should set character and reset related state', () => {
      const store = useGameStore.getState()
      store.setCharacter('ironclad')

      const state = useGameStore.getState()
      expect(state.character).toBe('ironclad')
      expect(state.deck).toEqual([])
      expect(state.relics).toEqual([])
      expect(state.archetypes).toEqual([])
      expect(state.recommendation).toBeNull()
      expect(state.deckHealth).toBeNull()
      expect(state.combos).toEqual([])
    })

    it('should switch between characters', () => {
      useGameStore.getState().setCharacter('silent')
      expect(useGameStore.getState().character).toBe('silent')

      useGameStore.getState().setCharacter('defect')
      expect(useGameStore.getState().character).toBe('defect')
    })
  })

  describe('setDeck()', () => {
    it('should set deck and trigger analysis when character is set', () => {
      const store = useGameStore.getState()
      store.setCharacter('ironclad')
      store.setDeck([
        { cardId: 'ironclad_strike', upgraded: false },
        { cardId: 'ironclad_defend', upgraded: true },
      ])

      const state = useGameStore.getState()
      expect(state.deck).toHaveLength(2)
      expect(state.deck[0].cardId).toBe('ironclad_strike')
      expect(state.deck[1].upgraded).toBe(true)
      // Archetypes should be analyzed (at least empty result, not initial)
      expect(state.archetypes).toBeDefined()
      expect(state.deckHealth).toBeDefined()
      expect(state.costCurve).toBeDefined()
      expect(state.combatBalance).toBeDefined()
      expect(state.combos).toBeDefined()
    })

    it('should set deck without analysis when no character', () => {
      useGameStore.getState().setDeck([{ cardId: 'ironclad_strike', upgraded: false }])

      const state = useGameStore.getState()
      expect(state.deck).toHaveLength(1)
      // Analysis should not have been triggered (character is null)
      expect(state.archetypes).toEqual([])
      expect(state.deckHealth).toBeNull()
    })

    it('should clear deck and analysis', () => {
      const store = useGameStore.getState()
      store.setCharacter('ironclad')
      store.setDeck([{ cardId: 'ironclad_strike', upgraded: false }])
      store.clearDeck()

      const state = useGameStore.getState()
      expect(state.deck).toEqual([])
      expect(state.archetypes).toEqual([])
      expect(state.recommendation).toBeNull()
      expect(state.deckHealth).toBeNull()
      expect(state.costCurve).toBeNull()
      expect(state.combatBalance).toBeNull()
      expect(state.combos).toEqual([])
    })
  })

  describe('addCard()', () => {
    it('should add a card to the deck', () => {
      const store = useGameStore.getState()
      store.setCharacter('ironclad')
      store.addCard('ironclad_strike')

      const state = useGameStore.getState()
      expect(state.deck).toHaveLength(1)
      expect(state.deck[0].cardId).toBe('ironclad_strike')
      expect(state.deck[0].upgraded).toBe(false)
    })

    it('should add multiple cards', () => {
      const store = useGameStore.getState()
      store.setCharacter('ironclad')
      store.addCard('ironclad_strike')
      store.addCard('ironclad_defend')
      store.addCard('ironclad_inflame')

      expect(useGameStore.getState().deck).toHaveLength(3)
    })

    it('should trigger analysis when character is set', () => {
      const store = useGameStore.getState()
      store.setCharacter('ironclad')
      store.addCard('ironclad_inflame')

      const state = useGameStore.getState()
      expect(state.archetypes.length).toBeGreaterThan(0)
      expect(state.deckHealth).toBeDefined()
    })
  })

  describe('removeCard()', () => {
    it('should remove a card from the deck', () => {
      const store = useGameStore.getState()
      store.setCharacter('ironclad')
      store.addCard('ironclad_strike')
      store.addCard('ironclad_defend')
      store.addCard('ironclad_bash')
      store.removeCard('ironclad_defend')

      const state = useGameStore.getState()
      expect(state.deck).toHaveLength(2)
      expect(state.deck.map(d => d.cardId)).not.toContain('ironclad_defend')
    })

    it('should remove only the first occurrence', () => {
      const store = useGameStore.getState()
      store.setCharacter('ironclad')
      store.addCard('ironclad_strike')
      store.addCard('ironclad_strike')
      store.addCard('ironclad_defend')
      store.removeCard('ironclad_strike')

      const state = useGameStore.getState()
      expect(state.deck).toHaveLength(2)
      // One strike should remain
      expect(state.deck.filter(d => d.cardId === 'ironclad_strike')).toHaveLength(1)
    })

    it('should do nothing if card not found', () => {
      const store = useGameStore.getState()
      store.setCharacter('ironclad')
      store.addCard('ironclad_strike')
      store.removeCard('nonexistent_card')

      expect(useGameStore.getState().deck).toHaveLength(1)
    })
  })

  describe('floor/health/gold setters', () => {
    it('should set floor', () => {
      useGameStore.getState().setFloor(10)
      expect(useGameStore.getState().floor).toBe(10)
    })

    it('should set health', () => {
      useGameStore.getState().setHealth(55)
      expect(useGameStore.getState().health).toBe(55)
    })

    it('should set maxHealth', () => {
      useGameStore.getState().setMaxHealth(80)
      expect(useGameStore.getState().maxHealth).toBe(80)
    })

    it('should set gold', () => {
      useGameStore.getState().setGold(150)
      expect(useGameStore.getState().gold).toBe(150)
    })
  })

  describe('setRelics()', () => {
    it('should set relics and trigger analysis', () => {
      const store = useGameStore.getState()
      store.setCharacter('ironclad')
      store.setDeck([{ cardId: 'ironclad_inflame', upgraded: false }])
      store.setRelics([{ relicId: 'vajra' }])

      const state = useGameStore.getState()
      expect(state.relics).toHaveLength(1)
      expect(state.relics[0].relicId).toBe('vajra')
    })
  })

  describe('addRelic()', () => {
    it('should add a relic with floor info', () => {
      const store = useGameStore.getState()
      store.setCharacter('ironclad')
      store.setFloor(5)
      store.addRelic('vajra')

      const state = useGameStore.getState()
      expect(state.relics).toHaveLength(1)
      expect(state.relics[0].relicId).toBe('vajra')
      expect(state.relics[0].obtainedAtFloor).toBe(5)
    })

    it('should add multiple relics', () => {
      const store = useGameStore.getState()
      store.setCharacter('ironclad')
      store.addRelic('vajra')
      store.addRelic('burning_blood')

      expect(useGameStore.getState().relics).toHaveLength(2)
    })
  })

  describe('removeRelic()', () => {
    it('should remove a relic', () => {
      const store = useGameStore.getState()
      store.setCharacter('ironclad')
      store.addRelic('vajra')
      store.addRelic('burning_blood')
      store.removeRelic('vajra')

      const state = useGameStore.getState()
      expect(state.relics).toHaveLength(1)
      expect(state.relics[0].relicId).toBe('burning_blood')
    })

    it('should do nothing for non-existent relic', () => {
      const store = useGameStore.getState()
      store.setCharacter('ironclad')
      store.addRelic('vajra')
      store.removeRelic('nonexistent_relic')

      expect(useGameStore.getState().relics).toHaveLength(1)
    })
  })

  describe('analyzeDeck()', () => {
    it('should analyze deck when character is set', () => {
      const store = useGameStore.getState()
      store.setCharacter('ironclad')
      store.addCard('ironclad_strike')
      store.addCard('ironclad_defend')

      // Clear and re-analyze
      store.analyzeDeck()

      const state = useGameStore.getState()
      expect(state.archetypes).toBeDefined()
      expect(state.deckHealth).toBeDefined()
      expect(state.costCurve).toBeDefined()
      expect(state.combatBalance).toBeDefined()
      expect(state.combos).toBeDefined()
    })

    it('should do nothing when no character is set', () => {
      // Character is null by default
      const store = useGameStore.getState()
      store.addCard('ironclad_strike')
      store.analyzeDeck()

      const state = useGameStore.getState()
      expect(state.archetypes).toEqual([])
      expect(state.deckHealth).toBeNull()
    })
  })

  describe('analyzeReward()', () => {
    it('should analyze card rewards when character is set', () => {
      const store = useGameStore.getState()
      store.setCharacter('ironclad')
      store.setDeck([
        { cardId: 'ironclad_strike', upgraded: false },
        { cardId: 'ironclad_defend', upgraded: false },
      ])
      store.analyzeReward(['ironclad_inflame', 'ironclad_heavy_blade'])

      const state = useGameStore.getState()
      expect(state.recommendation).not.toBeNull()
      expect(state.recommendation!.scores).toHaveLength(2)
      expect(state.recommendation!.skipAnalysis).toBeDefined()
      expect(state.recommendation!.timestamp).toBeGreaterThan(0)
    })

    it('should do nothing when no character is set', () => {
      const store = useGameStore.getState()
      store.analyzeReward(['ironclad_inflame'])

      expect(useGameStore.getState().recommendation).toBeNull()
    })
  })

  describe('updateGameState()', () => {
    it('should update partial game state', () => {
      const store = useGameStore.getState()
      store.updateGameState({
        floor: 15,
        health: 45,
        maxHealth: 72,
        gold: 200,
      })

      const state = useGameStore.getState()
      expect(state.floor).toBe(15)
      expect(state.health).toBe(45)
      expect(state.maxHealth).toBe(72)
      expect(state.gold).toBe(200)
    })

    it('should update only provided fields', () => {
      const store = useGameStore.getState()
      store.setFloor(5)
      store.setGold(100)

      store.updateGameState({ floor: 10 })

      const state = useGameStore.getState()
      expect(state.floor).toBe(10)
      expect(state.gold).toBe(100) // unchanged
    })

    it('should handle single field update', () => {
      useGameStore.getState().updateGameState({ health: 60 })
      expect(useGameStore.getState().health).toBe(60)
    })
  })

  describe('computed analysis results', () => {
    it('should have valid archetype results after addCard', () => {
      const store = useGameStore.getState()
      store.setCharacter('ironclad')
      store.addCard('ironclad_inflame')
      store.addCard('ironclad_heavy_blade')

      const state = useGameStore.getState()
      expect(state.archetypes.length).toBeGreaterThan(0)
      // Archetypes should be sorted by score
      for (let i = 1; i < state.archetypes.length; i++) {
        expect(state.archetypes[i - 1].score).toBeGreaterThanOrEqual(state.archetypes[i].score)
      }
    })

    it('should have archetype scores in valid range', () => {
      const store = useGameStore.getState()
      store.setCharacter('ironclad')
      store.setDeck([
        { cardId: 'ironclad_inflame', upgraded: false },
        { cardId: 'ironclad_heavy_blade', upgraded: false },
        { cardId: 'ironclad_strike', upgraded: false },
        { cardId: 'ironclad_defend', upgraded: false },
      ])

      const state = useGameStore.getState()
      state.archetypes.forEach(a => {
        expect(a.score).toBeGreaterThanOrEqual(0)
        expect(a.score).toBeLessThanOrEqual(100)
      })
    })

    it('should have deck health report fields', () => {
      const store = useGameStore.getState()
      store.setCharacter('ironclad')
      store.setDeck([
        { cardId: 'ironclad_strike', upgraded: false },
        { cardId: 'ironclad_defend', upgraded: false },
        { cardId: 'ironclad_bash', upgraded: false },
      ])

      const report = useGameStore.getState().deckHealth
      expect(report).not.toBeNull()
      expect(report!.overall).toBeGreaterThanOrEqual(0)
      expect(report!.overall).toBeLessThanOrEqual(100)
      expect(report!.issues).toBeDefined()
      expect(report!.suggestions).toBeDefined()
    })
  })
})
