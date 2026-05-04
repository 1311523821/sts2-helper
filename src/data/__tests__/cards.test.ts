import { describe, it, expect } from 'vitest'
import {
  getAllCards,
  getCardsByCharacter,
  getCardById,
  CHARACTER_IDS,
} from '../cards/index'
import type { Card, CharacterId } from '@/types'

const REQUIRED_FIELDS: (keyof Card)[] = [
  'id',
  'name',
  'nameEn',
  'character',
  'type',
  'rarity',
  'cost',
  'description',
  'tags',
]

describe('Card Data Layer', () => {
  describe('getAllCards()', () => {
    const allCards = getAllCards()

    it('should return all cards', () => {
      expect(allCards.length).toBeGreaterThan(0)
    })

    it('should return more than 100 cards across all characters', () => {
      expect(allCards.length).toBeGreaterThan(100)
    })

    it('should return unique card IDs', () => {
      const ids = allCards.map(c => c.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })
  })

  describe('Card ID validation', () => {
    const allCards = getAllCards()

    it('should have card IDs matching {character}_{name} pattern', () => {
      for (const card of allCards) {
        // Card IDs should start with the character prefix
        expect(card.id.startsWith(`${card.character}_`)).toBe(true)
      }
    })

    it('should have character-specific card IDs', () => {
      for (const charId of CHARACTER_IDS) {
        const charCards = getCardsByCharacter(charId)
        for (const card of charCards) {
          expect(card.id.startsWith(`${charId}_`)).toBe(true)
        }
      }
    })

    it('should not have duplicate IDs', () => {
      const allCards = getAllCards()
      const ids = allCards.map(c => c.id)
      const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i)
      expect(duplicates).toHaveLength(0)
    })
  })

  describe('Required field validation', () => {
    const allCards = getAllCards()

    for (const field of REQUIRED_FIELDS) {
      it(`should have '${String(field)}' field for all cards`, () => {
        const missingCards = allCards.filter(c => {
          const value = c[field]
          return value === undefined || value === null || value === ''
        })
        if (missingCards.length > 0) {
          console.log(`Cards missing '${String(field)}':`, missingCards.map(c => `${c.id} (${c.name})`))
        }
        expect(missingCards).toHaveLength(0)
      })
    }

    it('should have valid type field', () => {
      const validTypes = ['attack', 'skill', 'power', 'status', 'curse']
      for (const card of allCards) {
        expect(validTypes).toContain(card.type)
      }
    })

    it('should have valid rarity field', () => {
      const validRarities = ['basic', 'common', 'uncommon', 'rare', 'special']
      for (const card of allCards) {
        expect(validRarities).toContain(card.rarity)
      }
    })

    it('should have cost >= -1 (X-cost cards use -1)', () => {
      const negativeCards = allCards.filter(c => c.cost < -1)
      expect(negativeCards).toHaveLength(0)
    })

    it('should have non-empty tags array', () => {
      const emptyTags = allCards.filter(c => !c.tags || c.tags.length === 0)
      expect(emptyTags).toHaveLength(0)
    })

    it('should have keywords as an array', () => {
      for (const card of allCards) {
        expect(Array.isArray(card.keywords)).toBe(true)
      }
    })
  })

  describe('Character card loading', () => {
    it('should load ironclad cards', () => {
      const cards = getCardsByCharacter('ironclad')
      expect(cards.length).toBeGreaterThan(0)
      cards.forEach(c => expect(c.character).toBe('ironclad'))
    })

    it('should load silent cards', () => {
      const cards = getCardsByCharacter('silent')
      expect(cards.length).toBeGreaterThan(0)
      cards.forEach(c => expect(c.character).toBe('silent'))
    })

    it('should load defect cards', () => {
      const cards = getCardsByCharacter('defect')
      expect(cards.length).toBeGreaterThan(0)
      cards.forEach(c => expect(c.character).toBe('defect'))
    })

    it('should load watcher cards', () => {
      const cards = getCardsByCharacter('watcher')
      expect(cards.length).toBeGreaterThan(0)
      cards.forEach(c => expect(c.character).toBe('watcher'))
    })

    it('should load necromancer cards', () => {
      const cards = getCardsByCharacter('necromancer')
      expect(cards.length).toBeGreaterThan(0)
      cards.forEach(c => expect(c.character).toBe('necromancer'))
    })

    it('should load prince cards', () => {
      const cards = getCardsByCharacter('prince')
      expect(cards.length).toBeGreaterThan(0)
      cards.forEach(c => expect(c.character).toBe('prince'))
    })

    it('should return empty array for unknown character', () => {
      const cards = getCardsByCharacter('unknown' as CharacterId)
      expect(cards).toEqual([])
    })
  })

  describe('getCardById()', () => {
    const allCards = getAllCards()

    it('should retrieve each card by its ID', () => {
      for (const card of allCards) {
        const found = getCardById(card.id)
        expect(found).toBeDefined()
        expect(found!.id).toBe(card.id)
      }
    })

    it('should return undefined for non-existent ID', () => {
      expect(getCardById('non_existent_card')).toBeUndefined()
    })

    it('should retrieve card by ID regardless of character', () => {
      const firstCard = allCards[0]
      const found = getCardById(firstCard.id)
      expect(found!.name).toBe(firstCard.name)
    })
  })

  describe('Character-specific card properties', () => {
    it('every character should have basic cards (strike and defend)', () => {
      for (const charId of CHARACTER_IDS) {
        const cards = getCardsByCharacter(charId)
        const hasStrike = cards.some(c => c.id === `${charId}_strike`)
        const hasDefend = cards.some(c => c.id === `${charId}_defend`)
        expect(hasStrike).toBe(true)
        expect(hasDefend).toBe(true)
      }
    })

    it('each character should have at least one basic, common, uncommon, and rare card', () => {
      for (const charId of CHARACTER_IDS) {
        const cards = getCardsByCharacter(charId)
        expect(cards.some(c => c.rarity === 'basic')).toBe(true)
        expect(cards.some(c => c.rarity === 'common')).toBe(true)
        expect(cards.some(c => c.rarity === 'uncommon')).toBe(true)
        expect(cards.some(c => c.rarity === 'rare')).toBe(true)
      }
    })

    it('each character should have attack, skill, and power card types', () => {
      for (const charId of CHARACTER_IDS) {
        const cards = getCardsByCharacter(charId)
        expect(cards.some(c => c.type === 'attack')).toBe(true)
        expect(cards.some(c => c.type === 'skill')).toBe(true)
        expect(cards.some(c => c.type === 'power')).toBe(true)
      }
    })
  })

  describe('Card data format consistency', () => {
    const allCards = getAllCards()

    it('should have unique nameEn values per character', () => {
      for (const charId of CHARACTER_IDS) {
        const cards = getCardsByCharacter(charId)
        const enNames = cards.map(c => c.nameEn)
        const uniqueNames = new Set(enNames)
        expect(uniqueNames.size).toBe(enNames.length)
      }
    })

    it('should have valid cost values (0-3 except X-cost and special)', () => {
      const invalid = allCards.filter(c => c.cost < -1)
      if (invalid.length > 0) {
        console.log('Cards with invalid cost:', invalid.map(c => `${c.id}: cost=${c.cost}`))
      }
      // -1 = X-cost, 0-3 = normal, 4+ = special mod cards (e.g. Force Field)
      // All should be >= -1
      expect(allCards.every(c => c.cost >= -1)).toBe(true)
    })

    it('card name should not be empty', () => {
      const emptyName = allCards.filter(c => !c.name || c.name.trim() === '')
      expect(emptyName).toHaveLength(0)
    })

    it('card nameEn should not be empty', () => {
      const emptyName = allCards.filter(c => !c.nameEn || c.nameEn.trim() === '')
      expect(emptyName).toHaveLength(0)
    })

    it('card description should not be empty', () => {
      const emptyDesc = allCards.filter(c => !c.description || c.description.trim() === '')
      expect(emptyDesc).toHaveLength(0)
    })
  })
})
