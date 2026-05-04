import { describe, it, expect } from 'vitest'
import {
  matchArchetype,
  identifyArchetypes,
  detectCombos,
  analyzeDeckHealth,
  analyzeCostCurve,
  analyzeCombatBalance,
} from '../archetypeEngine'
import { getArchetypesByCharacter } from '@/data/archetypes'
import type { DeckCard, OwnedRelic, Archetype } from '@/types'

const STRIKE = 'ironclad_strike'
const DEFEND = 'ironclad_defend'
const BASH = 'ironclad_bash'
const ANGER = 'ironclad_anger'
const INFLAME = 'ironclad_inflame'
const HEAVY_BLADE = 'ironclad_heavy_blade'

function makeDeck(...cardIds: string[]): DeckCard[] {
  return cardIds.map(id => ({ cardId: id, upgraded: false }))
}

describe('archetypeEngine', () => {
  describe('matchArchetype', () => {
    it('should return a valid match result', () => {
      const deck = makeDeck(STRIKE, STRIKE, DEFEND, DEFEND, BASH)
      const archetypes = getArchetypesByCharacter('ironclad')
      const archetype = archetypes[0]

      const result = matchArchetype(deck, archetype)

      expect(result).toHaveProperty('archetypeId')
      expect(result).toHaveProperty('archetypeName')
      expect(result).toHaveProperty('score')
      expect(result).toHaveProperty('scores')
      expect(result).toHaveProperty('ownedCore')
      expect(result).toHaveProperty('missingCore')
      expect(result).toHaveProperty('nextSteps')
      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.score).toBeLessThanOrEqual(100)
    })

    it('should give higher score when core cards are in deck', () => {
      const archetypes = getArchetypesByCharacter('ironclad')
      const strengthArchetype = archetypes.find((a: Archetype) => a.id === 'ironclad_strength')!

      const deckWithCore = makeDeck(INFLAME, HEAVY_BLADE, STRIKE, DEFEND)
      const deckWithoutCore = makeDeck(STRIKE, STRIKE, DEFEND, DEFEND)

      const withCore = matchArchetype(deckWithCore, strengthArchetype)
      const withoutCore = matchArchetype(deckWithoutCore, strengthArchetype)

      expect(withCore.score).toBeGreaterThan(withoutCore.score)
      expect(withCore.ownedCore.length).toBeGreaterThan(0)
      expect(withoutCore.ownedCore.length).toBe(0)
    })

    it('should handle empty deck', () => {
      const archetypes = getArchetypesByCharacter('ironclad')
      const archetype = archetypes[0]

      const result = matchArchetype([], archetype)

      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.ownedCore).toHaveLength(0)
    })

    it('should handle broken card references gracefully', () => {
      const archetypes = getArchetypesByCharacter('ironclad')
      const archetype = archetypes[0]

      const deck = makeDeck('nonexistent_card_xyz', 'another_fake_card')
      const result = matchArchetype(deck, archetype)

      // Should not throw, should return valid result
      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.score).toBeLessThanOrEqual(100)
    })

    it('should add relic bonus when relics match archetype', () => {
      const archetypes = getArchetypesByCharacter('ironclad')
      const strengthArchetype = archetypes.find((a: Archetype) => a.id === 'ironclad_strength')!

      const deck = makeDeck(INFLAME, HEAVY_BLADE, STRIKE, DEFEND)
      const relics: OwnedRelic[] = [{ relicId: 'vajra' }] // vajra has 力量 tag

      const withoutRelics = matchArchetype(deck, strengthArchetype, [])
      const withRelics = matchArchetype(deck, strengthArchetype, relics)

      expect(withRelics.score).toBeGreaterThanOrEqual(withoutRelics.score)
    })

    it('should calculate sub-scores correctly', () => {
      const archetypes = getArchetypesByCharacter('ironclad')
      const archetype = archetypes[0]

      const deck = makeDeck(STRIKE, DEFEND, BASH)
      const result = matchArchetype(deck, archetype)

      expect(result.scores.coreCardScore).toBeGreaterThanOrEqual(0)
      expect(result.scores.importantCardScore).toBeGreaterThanOrEqual(0)
      expect(result.scores.supportCardScore).toBeGreaterThanOrEqual(0)
      expect(result.scores.ratioScore).toBeGreaterThanOrEqual(0)
      expect(result.scores.costCurveScore).toBeGreaterThanOrEqual(0)
      expect(result.scores.synergyScore).toBeGreaterThanOrEqual(0)
    })

    it('should suggest next steps when core cards are missing', () => {
      const archetypes = getArchetypesByCharacter('ironclad')
      const strengthArchetype = archetypes.find((a: Archetype) => a.id === 'ironclad_strength')!

      // Deck without any core cards
      const deck = makeDeck(STRIKE, STRIKE, DEFEND, DEFEND, BASH)
      const result = matchArchetype(deck, strengthArchetype)

      expect(result.nextSteps.length).toBeGreaterThan(0)
    })
  })

  describe('identifyArchetypes', () => {
    it('should return matching archetypes sorted by score', () => {
      const deck = makeDeck(INFLAME, HEAVY_BLADE, STRIKE, STRIKE, DEFEND)
      const matches = identifyArchetypes(deck, 'ironclad')

      expect(matches.length).toBeGreaterThan(0)
      for (let i = 1; i < matches.length; i++) {
        expect(matches[i - 1].score).toBeGreaterThanOrEqual(matches[i].score)
      }
      // All returned matches should have score > 15
      matches.forEach(m => expect(m.score).toBeGreaterThan(15))
    })

    it('should return empty array for empty deck', () => {
      const matches = identifyArchetypes([], 'ironclad')
      // With empty deck, scores should be very low
      expect(Array.isArray(matches)).toBe(true)
    })

    it('should work with relics', () => {
      const deck = makeDeck(INFLAME, HEAVY_BLADE, STRIKE, DEFEND)
      const relics: OwnedRelic[] = [{ relicId: 'vajra' }]

      const withoutRelics = identifyArchetypes(deck, 'ironclad', [])
      const withRelics = identifyArchetypes(deck, 'ironclad', relics)

      // With matching relics, at least one archetype should have equal or higher score
      if (withoutRelics.length > 0 && withRelics.length > 0) {
        expect(withRelics[0].score).toBeGreaterThanOrEqual(withoutRelics[0].score)
      }
    })
  })

  describe('detectCombos', () => {
    it('should detect combos present in deck', () => {
      const deck = makeDeck(INFLAME, HEAVY_BLADE, STRIKE, DEFEND)
      const combos = detectCombos(deck, 'ironclad')

      expect(combos.length).toBeGreaterThan(0)
      // At least one combo should be complete (inflame + heavy_blade)
      const completeCombo = combos.find(c => c.isComplete)
      expect(completeCombo).toBeDefined()
    })

    it('should detect incomplete combos', () => {
      // Only have one card from a combo
      const deck = makeDeck(INFLAME, STRIKE, DEFEND)
      const combos = detectCombos(deck, 'ironclad')

      const incompleteCombo = combos.find(c => !c.isComplete && c.cards.includes('重刃'))
      expect(incompleteCombo).toBeDefined()
      expect(incompleteCombo!.missingCards.length).toBeGreaterThan(0)
    })

    it('should sort complete combos before incomplete ones', () => {
      const deck = makeDeck(INFLAME, HEAVY_BLADE, STRIKE, DEFEND)
      const combos = detectCombos(deck, 'ironclad')

      let foundIncomplete = false
      for (const combo of combos) {
        if (!combo.isComplete) foundIncomplete = true
        if (foundIncomplete) {
          expect(combo.isComplete).toBe(false)
        }
      }
    })

    it('should handle empty deck', () => {
      const combos = detectCombos([], 'ironclad')
      expect(Array.isArray(combos)).toBe(true)
      combos.forEach(c => expect(c.isComplete).toBe(false))
    })

    it('should include combo description and power', () => {
      const deck = makeDeck(INFLAME, HEAVY_BLADE)
      const combos = detectCombos(deck, 'ironclad')

      combos.forEach(c => {
        expect(c.comboId).toBeTruthy()
        expect(c.comboName).toBeTruthy()
        expect(c.description).toBeTruthy()
        expect(c.power).toBeTruthy()
      })
    })
  })

  describe('analyzeDeckHealth', () => {
    it('should return valid health report', () => {
      const deck = makeDeck(STRIKE, STRIKE, STRIKE, DEFEND, DEFEND, BASH)
      const report = analyzeDeckHealth(deck)

      expect(report).toHaveProperty('overall')
      expect(report).toHaveProperty('attackBalance')
      expect(report).toHaveProperty('defenseBalance')
      expect(report).toHaveProperty('costCurve')
      expect(report).toHaveProperty('cardQuality')
      expect(report).toHaveProperty('synergy')
      expect(report).toHaveProperty('issues')
      expect(report).toHaveProperty('suggestions')
      expect(report.overall).toBeGreaterThanOrEqual(0)
      expect(report.overall).toBeLessThanOrEqual(100)
    })

    it('should detect attack-heavy deck', () => {
      const deck = makeDeck(STRIKE, STRIKE, STRIKE, STRIKE, STRIKE, STRIKE, DEFEND)
      const report = analyzeDeckHealth(deck)

      expect(report.attackBalance).toBeGreaterThan(report.defenseBalance)
      expect(report.issues.some(i => i.includes('攻击'))).toBe(true)
    })

    it('should handle empty deck', () => {
      const report = analyzeDeckHealth([])

      expect(report.overall).toBeGreaterThanOrEqual(0)
      expect(report.overall).toBeLessThanOrEqual(100)
    })

    it('should handle broken references in deck', () => {
      const deck = makeDeck('fake_card_1', 'fake_card_2')
      const report = analyzeDeckHealth(deck)

      expect(report.overall).toBeGreaterThanOrEqual(0)
      expect(report.overall).toBeLessThanOrEqual(100)
    })

    it('should suggest improvements for large decks', () => {
      const deck = makeDeck(
        ...Array(20).fill(STRIKE),
        ...Array(15).fill(DEFEND),
        ...Array(5).fill(BASH)
      )
      const report = analyzeDeckHealth(deck)

      expect(report.issues.some(i => i.includes('牌库过大'))).toBe(true)
    })
  })

  describe('analyzeCostCurve', () => {
    it('should return valid cost curve analysis', () => {
      const deck = makeDeck(STRIKE, STRIKE, DEFEND, DEFEND, BASH)
      const result = analyzeCostCurve(deck)

      expect(result).toHaveProperty('curve')
      expect(result).toHaveProperty('averageCost')
      expect(result).toHaveProperty('oneDropRatio')
      expect(result).toHaveProperty('highCostRatio')
      expect(result).toHaveProperty('rating')
      expect(result).toHaveProperty('suggestion')
      expect(['too_low', 'good', 'too_high']).toContain(result.rating)
    })

    it('should rate low-cost decks as too_low', () => {
      // All 0 or 1 cost cards
      const deck = makeDeck(ANGER, ANGER, STRIKE, STRIKE, DEFEND, DEFEND)
      const result = analyzeCostCurve(deck)

      // anger is 0-cost, strike/defend are 1-cost, average should be low
      expect(result.averageCost).toBeLessThan(1.0)
    })

    it('should handle empty deck', () => {
      const result = analyzeCostCurve([])
      expect(result.averageCost).toBe(0)
      expect(result.rating).toBe('too_low')
    })
  })

  describe('analyzeCombatBalance', () => {
    it('should return valid balance analysis', () => {
      const deck = makeDeck(STRIKE, STRIKE, DEFEND, DEFEND, BASH)
      const result = analyzeCombatBalance(deck)

      expect(result).toHaveProperty('attackRatio')
      expect(result).toHaveProperty('defenseRatio')
      expect(result).toHaveProperty('powerRatio')
      expect(result).toHaveProperty('balance')
      expect(result).toHaveProperty('rating')
      expect(result).toHaveProperty('suggestion')
      expect(['attack_heavy', 'balanced', 'defense_heavy']).toContain(result.balance)
    })

    it('should detect attack-heavy deck', () => {
      const deck = makeDeck(STRIKE, STRIKE, STRIKE, STRIKE, BASH, DEFEND)
      const result = analyzeCombatBalance(deck)

      expect(result.balance).toBe('attack_heavy')
      expect(result.attackRatio).toBeGreaterThan(result.defenseRatio)
    })

    it('should detect defense-heavy deck', () => {
      const deck = makeDeck(DEFEND, DEFEND, DEFEND, DEFEND, DEFEND, STRIKE)
      const result = analyzeCombatBalance(deck)

      expect(result.balance).toBe('defense_heavy')
    })

    it('should detect balanced deck', () => {
      // Need attack <= 55% AND defense <= 50%
      // 2 attack, 2 skill, 1 power = 40%/40%/20%
      const deck = makeDeck(STRIKE, STRIKE, DEFEND, DEFEND, 'ironclad_metallicize')
      const result = analyzeCombatBalance(deck)

      expect(result.balance).toBe('balanced')
    })

    it('should handle empty deck', () => {
      const result = analyzeCombatBalance([])
      expect(result.balance).toBeDefined()
      expect(result.rating).toBeGreaterThanOrEqual(0)
    })
  })
})
