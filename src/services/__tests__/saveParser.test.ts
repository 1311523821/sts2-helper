import { describe, it, expect } from 'vitest'
import { SaveParser } from '../saveParser'

describe('saveParser', () => {
  describe('SaveParser.parse', () => {
    it('should auto-detect JSON format', () => {
      const json = JSON.stringify({
        character: 'ironclad',
        floor: 12,
        health: 65,
        maxHealth: 80,
        gold: 150,
        deck: ['ironclad_strike', 'ironclad_defend'],
        relics: ['burning_blood'],
      })

      const result = SaveParser.parse(json)

      expect(result.isValid).toBe(true)
      expect(result.character).toBe('ironclad')
      expect(result.floor).toBe(12)
      expect(result.health).toBe(65)
      expect(result.maxHealth).toBe(80)
      expect(result.gold).toBe(150)
      expect(result.deck.length).toBe(2)
      expect(result.relics.length).toBe(1)
    })

    it('should auto-detect text format', () => {
      const text = `角色: ironclad
楼层: 12
血量: 65/80
金币: 150
牌库: ironclad_strike, ironclad_defend, ironclad_bash
遗物: burning_blood`

      const result = SaveParser.parse(text)

      expect(result.character).toBe('ironclad')
      expect(result.floor).toBe(12)
      expect(result.health).toBe(65)
      expect(result.maxHealth).toBe(80)
      expect(result.gold).toBe(150)
      expect(result.deck.length).toBe(3)
      expect(result.relics.length).toBe(1)
    })
  })

  describe('SaveParser.parseJSON', () => {
    it('should parse standard JSON save', () => {
      const json = JSON.stringify({
        character: 'silent',
        floor: 8,
        act: 1,
        health: 50,
        maxHealth: 70,
        gold: 100,
        deck: ['ironclad_strike', 'ironclad_defend'],
        relics: ['burning_blood'],
      })

      const result = SaveParser.parseJSON(json)

      expect(result.isValid).toBe(true)
      expect(result.character).toBe('silent')
      expect(result.floor).toBe(8)
      expect(result.act).toBe(1)
    })

    it('should handle nested save structure (current_save)', () => {
      const json = JSON.stringify({
        current_save: {
          character: 'defect',
          floor: 20,
          health: 40,
          maxHealth: 75,
          gold: 200,
          deck: ['ironclad_strike'],
          relics: [],
        },
      })

      const result = SaveParser.parseJSON(json)

      expect(result.isValid).toBe(true)
      expect(result.character).toBe('defect')
      expect(result.floor).toBe(20)
    })

    it('should handle nested save structure (save)', () => {
      const json = JSON.stringify({
        save: {
          character: 'watcher',
          floor: 15,
          health: 60,
          maxHealth: 72,
          gold: 120,
          deck: [],
          relics: [],
        },
      })

      const result = SaveParser.parseJSON(json)

      expect(result.character).toBe('watcher')
      expect(result.floor).toBe(15)
    })

    it('should handle deck as array of strings', () => {
      const json = JSON.stringify({
        character: 'ironclad',
        floor: 5,
        deck: ['ironclad_strike', 'ironclad_defend', 'ironclad_bash'],
      })

      const result = SaveParser.parseJSON(json)

      expect(result.deck).toHaveLength(3)
      expect(result.deck[0].cardId).toBe('ironclad_strike')
      expect(result.deck[0].upgraded).toBe(false)
    })

    it('should handle deck as array of objects', () => {
      const json = JSON.stringify({
        character: 'ironclad',
        floor: 5,
        deck: [
          { id: 'ironclad_strike', upgraded: true },
          { cardId: 'ironclad_defend', is_upgraded: false },
        ],
      })

      const result = SaveParser.parseJSON(json)

      expect(result.deck).toHaveLength(2)
      expect(result.deck[0].cardId).toBe('ironclad_strike')
      expect(result.deck[0].upgraded).toBe(true)
      expect(result.deck[1].cardId).toBe('ironclad_defend')
      expect(result.deck[1].upgraded).toBe(false)
    })

    it('should handle relics as array of strings', () => {
      const json = JSON.stringify({
        character: 'ironclad',
        floor: 5,
        relics: ['burning_blood', 'vajra'],
      })

      const result = SaveParser.parseJSON(json)

      expect(result.relics).toHaveLength(2)
      expect(result.relics[0].relicId).toBe('burning_blood')
    })

    it('should handle relics as array of objects', () => {
      const json = JSON.stringify({
        character: 'ironclad',
        floor: 5,
        relics: [
          { id: 'burning_blood', floor: 1 },
          { relicId: 'vajra', floor: 5 },
        ],
      })

      const result = SaveParser.parseJSON(json)

      expect(result.relics).toHaveLength(2)
      expect(result.relics[0].relicId).toBe('burning_blood')
      expect(result.relics[0].obtainedAtFloor).toBe(1)
    })

    it('should default act to ceil(floor/16) when not provided', () => {
      const json = JSON.stringify({
        character: 'ironclad',
        floor: 33,
        health: 50,
        maxHealth: 80,
      })

      const result = SaveParser.parseJSON(json)

      expect(result.act).toBe(3) // ceil(33/16) = 3
    })

    it('should handle unknown character gracefully', () => {
      const json = JSON.stringify({
        character: 'unknown_hero',
        floor: 5,
      })

      const result = SaveParser.parseJSON(json)

      expect(result.character).toBe('ironclad') // fallback
      expect(result.errors.some(e => e.includes('未知角色'))).toBe(true)
    })

    it('should handle missing fields with defaults', () => {
      const json = JSON.stringify({})

      const result = SaveParser.parseJSON(json)

      expect(result.character).toBe('ironclad')
      expect(result.floor).toBe(1)
      expect(result.deck).toEqual([])
      expect(result.relics).toEqual([])
    })

    it('should handle invalid JSON gracefully', () => {
      const result = SaveParser.parseJSON('not valid json {{{')

      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should handle max_health alias', () => {
      const json = JSON.stringify({
        character: 'ironclad',
        floor: 5,
        health: 50,
        max_health: 80,
      })

      const result = SaveParser.parseJSON(json)

      expect(result.maxHealth).toBe(80)
    })

    it('should handle coins alias for gold', () => {
      const json = JSON.stringify({
        character: 'ironclad',
        floor: 5,
        coins: 250,
      })

      const result = SaveParser.parseJSON(json)

      expect(result.gold).toBe(250)
    })
  })

  describe('SaveParser.parseText', () => {
    it('should parse Chinese format', () => {
      const text = `角色: 铁甲战士
楼层: 12
血量: 65/80
金币: 150
牌库: ironclad_strike, ironclad_defend, ironclad_bash
遗物: burning_blood, vajra`

      const result = SaveParser.parseText(text)

      expect(result.character).toBe('ironclad')
      expect(result.floor).toBe(12)
      expect(result.health).toBe(65)
      expect(result.maxHealth).toBe(80)
      expect(result.gold).toBe(150)
      expect(result.deck).toHaveLength(3)
      expect(result.relics).toHaveLength(2)
    })

    it('should parse English format', () => {
      const text = `character: silent
floor: 8
health: 50/70
gold: 100
deck: ironclad_strike, ironclad_defend
relics: burning_blood`

      const result = SaveParser.parseText(text)

      expect(result.character).toBe('silent')
      expect(result.floor).toBe(8)
    })

    it('should handle Chinese character names', () => {
      const testCases = [
        { input: '战士', expected: 'ironclad' },
        { input: '猎人', expected: 'silent' },
        { input: '机器人', expected: 'defect' },
        { input: '观者', expected: 'watcher' },
        { input: '亡灵', expected: 'necromancer' },
        { input: '储君', expected: 'prince' },
      ]

      for (const { input, expected } of testCases) {
        const text = `角色: ${input}\n楼层: 5`
        const result = SaveParser.parseText(text)
        expect(result.character).toBe(expected)
      }
    })

    it('should detect upgraded cards with + prefix', () => {
      const text = `角色: ironclad
楼层: 5
牌库: +ironclad_strike, ironclad_defend+`

      const result = SaveParser.parseText(text)

      expect(result.deck[0].upgraded).toBe(true)
      expect(result.deck[0].cardId).toBe('ironclad_strike')
      expect(result.deck[1].upgraded).toBe(true)
      expect(result.deck[1].cardId).toBe('ironclad_defend')
    })

    it('should handle missing fields gracefully', () => {
      const text = `角色: ironclad`

      const result = SaveParser.parseText(text)

      expect(result.character).toBe('ironclad')
      expect(result.floor).toBe(1)
      expect(result.deck).toEqual([])
      expect(result.relics).toEqual([])
    })

    it('should handle unknown character in text format', () => {
      const text = `角色: unknown_hero
楼层: 5`

      const result = SaveParser.parseText(text)

      expect(result.character).toBe('ironclad')
      expect(result.errors.some(e => e.includes('未知角色'))).toBe(true)
    })

    it('should handle empty lines and whitespace', () => {
      const text = `
      角色: ironclad

      楼层: 5

      牌库: ironclad_strike
      `

      const result = SaveParser.parseText(text)

      expect(result.character).toBe('ironclad')
      expect(result.floor).toBe(5)
      expect(result.deck).toHaveLength(1)
    })
  })

  describe('SaveParser.parse - edge cases', () => {
    it('should return invalid for empty string', () => {
      const result = SaveParser.parse('')

      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toContain('空')
    })

    it('should return invalid for whitespace-only string', () => {
      const result = SaveParser.parse('   \n\t  ')

      expect(result.isValid).toBe(false)
    })

    it('should try JSON first for { prefixed input', () => {
      const json = JSON.stringify({
        character: 'ironclad',
        floor: 5,
        deck: ['ironclad_strike'],
      })

      const result = SaveParser.parse(json)

      expect(result.character).toBe('ironclad')
      expect(result.deck).toHaveLength(1)
    })

    it('should fall back to text if JSON-like but invalid', () => {
      // Starts with { but isn't valid JSON - should fall back to text
      const text = `{ broken json
角色: ironclad
楼层: 5`

      const result = SaveParser.parse(text)

      // Should parse as text
      expect(result.character).toBe('ironclad')
    })

    it('should handle [ prefix for JSON arrays', () => {
      // This should try JSON parsing
      const result = SaveParser.parse('[invalid json')

      // Should fall back to text, which won't find much
      expect(result).toHaveProperty('character')
    })
  })
})
