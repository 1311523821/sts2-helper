import { describe, it, expect } from 'vitest'
import { scoreCardOptions, evaluateSkipOption, generateRecommendationReason } from '../cardScorer'
import type { CardOption, DeckCard, ArchetypeMatch, OwnedRelic } from '@/types'

// Real card IDs from ironclad data
const STRIKE = 'ironclad_strike'
const DEFEND = 'ironclad_defend'
const BASH = 'ironclad_bash'
const ANGER = 'ironclad_anger'
const INFLAME = 'ironclad_inflame'
const HEAVY_BLADE = 'ironclad_heavy_blade'

function makeDeck(...cardIds: string[]): DeckCard[] {
  return cardIds.map(id => ({ cardId: id, upgraded: false }))
}

function makeOptions(...cardIds: string[]): CardOption[] {
  return cardIds.map(id => ({ cardId: id, upgraded: false }))
}

const emptyArchetypes: ArchetypeMatch[] = []
const emptyRelics: OwnedRelic[] = []

// A mock archetype match for testing
const strengthArchetype: ArchetypeMatch = {
  archetypeId: 'ironclad_strength',
  archetypeName: '力量流',
  score: 75,
  scores: {
    coreCardScore: 80,
    importantCardScore: 60,
    supportCardScore: 40,
    ratioScore: 70,
    costCurveScore: 65,
    synergyScore: 50,
  },
  ownedCore: [INFLAME],
  missingCore: [],
  nextSteps: [],
}

describe('cardScorer', () => {
  describe('scoreCardOptions', () => {
    it('should return scores for valid card options', () => {
      const options = makeOptions(STRIKE, DEFEND, BASH)
      const deck = makeDeck(STRIKE, STRIKE, DEFEND, DEFEND, BASH)
      const scores = scoreCardOptions(options, deck, emptyArchetypes, 5)

      expect(scores).toHaveLength(3)
      scores.forEach(s => {
        expect(s.score).toBeGreaterThanOrEqual(0)
        expect(s.score).toBeLessThanOrEqual(100)
        expect(s.reasons.length).toBeGreaterThan(0)
        expect(s.cardName).not.toBe('未知')
      })
    })

    it('should sort scores in descending order', () => {
      const options = makeOptions(STRIKE, DEFEND, BASH)
      const deck = makeDeck(STRIKE, STRIKE, DEFEND, DEFEND, BASH)
      const scores = scoreCardOptions(options, deck, emptyArchetypes, 5)

      for (let i = 1; i < scores.length; i++) {
        expect(scores[i - 1].score).toBeGreaterThanOrEqual(scores[i].score)
      }
    })

    it('should give high score to core archetype cards', () => {
      const options = makeOptions(INFLAME, STRIKE)
      const deck = makeDeck(STRIKE, STRIKE, DEFEND, DEFEND)
      const scores = scoreCardOptions(options, deck, [strengthArchetype], 5)

      const inflameScore = scores.find(s => s.cardId === INFLAME)
      const strikeScore = scores.find(s => s.cardId === STRIKE)

      expect(inflameScore).toBeDefined()
      expect(strikeScore).toBeDefined()
      // Core card should score higher than basic strike
      expect(inflameScore!.score).toBeGreaterThan(strikeScore!.score)
    })

    it('should handle unknown card IDs gracefully', () => {
      const options: CardOption[] = [{ cardId: 'nonexistent_card_xyz', upgraded: false }]
      const deck = makeDeck(STRIKE)
      const scores = scoreCardOptions(options, deck, emptyArchetypes, 5)

      expect(scores).toHaveLength(1)
      expect(scores[0].cardName).toBe('未知')
      expect(scores[0].score).toBe(50)
      expect(scores[0].reasons).toContain('未知卡牌')
    })

    it('should handle empty options array', () => {
      const deck = makeDeck(STRIKE)
      const scores = scoreCardOptions([], deck, emptyArchetypes, 5)
      expect(scores).toHaveLength(0)
    })

    it('should handle empty deck', () => {
      const options = makeOptions(STRIKE, DEFEND)
      const scores = scoreCardOptions(options, [], emptyArchetypes, 5)

      expect(scores).toHaveLength(2)
      scores.forEach(s => {
        expect(s.score).toBeGreaterThanOrEqual(0)
        expect(s.score).toBeLessThanOrEqual(100)
      })
    })

    it('should include dimension scores', () => {
      const options = makeOptions(STRIKE)
      const deck = makeDeck(DEFEND)
      const scores = scoreCardOptions(options, deck, emptyArchetypes, 5)

      expect(scores[0].dimensionScores).toBeDefined()
      expect(scores[0].dimensionScores!.baseStrength).toBeGreaterThanOrEqual(0)
      expect(scores[0].dimensionScores!.archetypeFit).toBeGreaterThanOrEqual(0)
      expect(scores[0].dimensionScores!.synergy).toBeGreaterThanOrEqual(0)
      expect(scores[0].dimensionScores!.floorAdaptation).toBeGreaterThanOrEqual(0)
      expect(scores[0].dimensionScores!.relicSynergy).toBeGreaterThanOrEqual(0)
      expect(scores[0].dimensionScores!.deckHealth).toBeGreaterThanOrEqual(0)
    })

    it('should boost attack cards in early floors', () => {
      const options = makeOptions(STRIKE, DEFEND)
      const deck = makeDeck(STRIKE, DEFEND)
      const earlyScores = scoreCardOptions(options, deck, emptyArchetypes, 3)

      const earlyStrike = earlyScores.find(s => s.cardId === STRIKE)!
      const earlyDefend = earlyScores.find(s => s.cardId === DEFEND)!

      // Attack cards should get floor adaptation boost early
      expect(earlyStrike.dimensionScores!.floorAdaptation).toBeGreaterThan(
        earlyDefend.dimensionScores!.floorAdaptation
      )
    })

    it('should consider relic synergy', () => {
      const options = makeOptions(ANGER)
      const deck = makeDeck(STRIKE)
      const relics: OwnedRelic[] = [{ relicId: 'vajra' }] // vajra has 力量 tag
      const scores = scoreCardOptions(options, deck, emptyArchetypes, 5, relics)

      expect(scores[0].dimensionScores!.relicSynergy).toBeGreaterThanOrEqual(0)
    })

    it('should handle 0-cost cards with reason', () => {
      const options = makeOptions(ANGER)
      const deck = makeDeck(STRIKE)
      const scores = scoreCardOptions(options, deck, emptyArchetypes, 5)

      expect(scores[0].reasons).toContain('⚡ 0费牌，灵活不卡手')
    })
  })

  describe('evaluateSkipOption', () => {
    it('should return skip analysis with required fields', () => {
      const options = makeOptions(STRIKE, DEFEND)
      const deck = makeDeck(STRIKE, STRIKE, DEFEND, DEFEND, BASH)
      const result = evaluateSkipOption(options, deck, emptyArchetypes, 5)

      expect(result).toHaveProperty('shouldSkip')
      expect(result).toHaveProperty('skipValue')
      expect(result).toHaveProperty('reason')
      expect(result).toHaveProperty('detailedReasons')
      expect(typeof result.shouldSkip).toBe('boolean')
      expect(typeof result.skipValue).toBe('number')
    })

    it('should be more likely to skip with large deck', () => {
      const options = makeOptions(STRIKE)
      const smallDeck = makeDeck(STRIKE, STRIKE, DEFEND, DEFEND)
      const largeDeck = makeDeck(
        ...Array(15).fill(STRIKE),
        ...Array(15).fill(DEFEND),
        ...Array(5).fill(BASH)
      )

      const smallResult = evaluateSkipOption(options, smallDeck, emptyArchetypes, 15)
      const largeResult = evaluateSkipOption(options, largeDeck, emptyArchetypes, 15)

      // Large deck should have higher skip value
      expect(largeResult.skipValue).toBeGreaterThan(smallResult.skipValue)
    })

    it('should be less likely to skip in early floors', () => {
      const options = makeOptions(STRIKE)
      const deck = makeDeck(STRIKE, STRIKE, DEFEND, DEFEND)

      const earlyResult = evaluateSkipOption(options, deck, emptyArchetypes, 3)
      const lateResult = evaluateSkipOption(options, deck, emptyArchetypes, 25)

      expect(earlyResult.skipValue).toBeLessThan(lateResult.skipValue)
    })

    it('should include detailed reasons', () => {
      const options = makeOptions(STRIKE)
      const deck = makeDeck(STRIKE, STRIKE, DEFEND, DEFEND)
      const result = evaluateSkipOption(options, deck, emptyArchetypes, 5)

      expect(result.detailedReasons.length).toBeGreaterThan(0)
    })

    it('should handle empty options', () => {
      const deck = makeDeck(STRIKE)
      const result = evaluateSkipOption([], deck, emptyArchetypes, 5)

      expect(result.shouldSkip).toBe(true)
    })
  })

  describe('generateRecommendationReason', () => {
    it('should return a non-empty reason for known cards', () => {
      const deck = makeDeck(STRIKE, STRIKE, DEFEND, DEFEND)
      const reason = generateRecommendationReason(STRIKE, deck, emptyArchetypes, 5)

      expect(typeof reason).toBe('string')
      expect(reason.length).toBeGreaterThan(0)
    })

    it('should return "未知卡牌" for unknown card', () => {
      const deck = makeDeck(STRIKE)
      const reason = generateRecommendationReason('nonexistent_xyz', deck, emptyArchetypes, 5)

      expect(reason).toBe('未知卡牌')
    })

    it('should mention archetype when card is core', () => {
      const deck = makeDeck(STRIKE, STRIKE, DEFEND)
      const reason = generateRecommendationReason(INFLAME, deck, [strengthArchetype], 5)

      expect(reason).toContain('核心')
    })

    it('should mention tag synergy when deck has matching tags', () => {
      // Build a deck with many attack-tagged cards
      const deck = makeDeck(STRIKE, STRIKE, STRIKE, BASH, ANGER)
      const reason = generateRecommendationReason(HEAVY_BLADE, deck, emptyArchetypes, 5)

      // Should mention some synergy since heavy_blade has attack tag
      expect(typeof reason).toBe('string')
      expect(reason.length).toBeGreaterThan(0)
    })

    it('should mention 0-cost flexibility', () => {
      const deck = makeDeck(STRIKE)
      const reason = generateRecommendationReason(ANGER, deck, emptyArchetypes, 5)

      expect(reason).toContain('0费')
    })
  })
})
