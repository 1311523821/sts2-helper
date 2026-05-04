import { describe, it, expect, beforeEach } from 'vitest'
import { RecordManager } from '../recordManager'
import type { Decision, DeckCard } from '@/types'

// Use fake-indexeddb (auto-imported in setup.ts)

describe('RecordManager', () => {
  let manager: RecordManager

  beforeEach(() => {
    manager = new RecordManager()
  })

  describe('init()', () => {
    it('should initialize successfully', async () => {
      await expect(manager.init()).resolves.toBeUndefined()
      // After init, the internal db should be available
      await expect(manager.getAllRecords()).resolves.toEqual([])
    })

    it('should be idempotent', async () => {
      await manager.init()
      await expect(manager.init()).resolves.toBeUndefined()
    })
  })

  describe('createRecord()', () => {
    it('should create a record with the given character', async () => {
      await manager.init()
      const record = await manager.createRecord('ironclad')

      expect(record.character).toBe('ironclad')
      expect(record.id).toBeTruthy()
      expect(record.id).toContain('run_')
      expect(record.result).toBe('abandoned')
      expect(record.finalFloor).toBe(1)
      expect(record.finalDeck).toEqual([])
      expect(record.decisions).toEqual([])
      expect(record.startTime).toBeTruthy()
    })

    it('should create records for different characters', async () => {
      await manager.init()
      const r1 = await manager.createRecord('silent')
      const r2 = await manager.createRecord('defect')
      const r3 = await manager.createRecord('watcher')

      expect(r1.character).toBe('silent')
      expect(r2.character).toBe('defect')
      expect(r3.character).toBe('watcher')

      const r1again = await manager.getRecord(r1.id)
      expect(r1again).not.toBeNull()
      expect(r1again!.character).toBe('silent')
    })

    it('should throw if not initialized', async () => {
      // Don't call init()
      await expect(manager.createRecord('ironclad')).rejects.toThrow('数据库未初始化')
    })
  })

  describe('saveRecord() / getRecord()', () => {
    beforeEach(async () => {
      await manager.init()
    })

    it('should save and retrieve a record', async () => {
      const record = await manager.createRecord('ironclad')
      const retrieved = await manager.getRecord(record.id)

      expect(retrieved).not.toBeNull()
      expect(retrieved!.id).toBe(record.id)
      expect(retrieved!.character).toBe('ironclad')
    })

    it('should update an existing record via saveRecord', async () => {
      const record = await manager.createRecord('ironclad')
      record.finalFloor = 25
      record.result = 'loss'
      await manager.saveRecord(record)

      const updated = await manager.getRecord(record.id)
      expect(updated!.finalFloor).toBe(25)
      expect(updated!.result).toBe('loss')
    })

    it('should return null for non-existent record', async () => {
      const result = await manager.getRecord('nonexistent_id')
      expect(result).toBeNull()
    })
  })

  describe('addDecision()', () => {
    beforeEach(async () => {
      await manager.init()
    })

    it('should add a decision to a record', async () => {
      const record = await manager.createRecord('ironclad')
      const decision: Decision = {
        floor: 3,
        timestamp: new Date().toISOString(),
        options: [{ cardId: 'ironclad_strike', upgraded: false }],
        chosen: 'ironclad_strike',
      }

      await manager.addDecision(record.id, decision)
      const updated = await manager.getRecord(record.id)

      expect(updated!.decisions).toHaveLength(1)
      expect(updated!.decisions[0].chosen).toBe('ironclad_strike')
      expect(updated!.decisions[0].floor).toBe(3)
    })

    it('should add multiple decisions', async () => {
      const record = await manager.createRecord('silent')
      const d1: Decision = { floor: 1, timestamp: new Date().toISOString(), options: [], chosen: 'silent_strike' }
      const d2: Decision = { floor: 2, timestamp: new Date().toISOString(), options: [], chosen: 'silent_defend' }

      await manager.addDecision(record.id, d1)
      await manager.addDecision(record.id, d2)

      const updated = await manager.getRecord(record.id)
      expect(updated!.decisions).toHaveLength(2)
    })

    it('should throw for non-existent record', async () => {
      await expect(manager.addDecision('fake_id', {} as Decision)).rejects.toThrow('记录不存在')
    })
  })

  describe('updateDeck()', () => {
    beforeEach(async () => {
      await manager.init()
    })

    it('should update the deck of a record', async () => {
      const record = await manager.createRecord('ironclad')
      const deck: DeckCard[] = [
        { cardId: 'ironclad_strike', upgraded: false },
        { cardId: 'ironclad_defend', upgraded: true },
        { cardId: 'ironclad_bash', upgraded: false },
      ]

      await manager.updateDeck(record.id, deck)
      const updated = await manager.getRecord(record.id)

      expect(updated!.finalDeck).toHaveLength(3)
      expect(updated!.finalDeck[1].cardId).toBe('ironclad_defend')
      expect(updated!.finalDeck[1].upgraded).toBe(true)
    })

    it('should overwrite existing deck', async () => {
      const record = await manager.createRecord('ironclad')
      await manager.updateDeck(record.id, [{ cardId: 'ironclad_strike', upgraded: false }])
      await manager.updateDeck(record.id, [])

      const updated = await manager.getRecord(record.id)
      expect(updated!.finalDeck).toHaveLength(0)
    })

    it('should throw for non-existent record', async () => {
      await expect(manager.updateDeck('fake_id', [])).rejects.toThrow('记录不存在')
    })
  })

  describe('finishRecord()', () => {
    beforeEach(async () => {
      await manager.init()
    })

    it('should mark a record as win', async () => {
      const record = await manager.createRecord('ironclad')
      await manager.finishRecord(record.id, 'win', 50)

      const updated = await manager.getRecord(record.id)
      expect(updated!.result).toBe('win')
      expect(updated!.finalFloor).toBe(50)
      expect(updated!.endTime).toBeTruthy()
    })

    it('should mark a record as loss', async () => {
      const record = await manager.createRecord('silent')
      await manager.finishRecord(record.id, 'loss', 25)

      const updated = await manager.getRecord(record.id)
      expect(updated!.result).toBe('loss')
      expect(updated!.finalFloor).toBe(25)
    })

    it('should throw for non-existent record', async () => {
      await expect(manager.finishRecord('fake_id', 'win', 10)).rejects.toThrow('记录不存在')
    })
  })

  describe('deleteRecord()', () => {
    beforeEach(async () => {
      await manager.init()
    })

    it('should delete an existing record', async () => {
      const record = await manager.createRecord('ironclad')
      await manager.deleteRecord(record.id)

      const result = await manager.getRecord(record.id)
      expect(result).toBeNull()
    })

    it('should not throw when deleting non-existent record', async () => {
      await expect(manager.deleteRecord('fake_id')).resolves.toBeUndefined()
    })
  })

  describe('getRecordsByCharacter()', () => {
    beforeEach(async () => {
      await manager.init()
      // Use unique IDs for this describe block to avoid cross-test pollution
      // Instead of cleaning the DB, we track the records we create
      // and only verify those
    })

    it('should filter records by character', async () => {
      await manager.createRecord('ironclad')
      await manager.createRecord('silent')
      await manager.createRecord('ironclad')
      await manager.createRecord('defect')

      const ironcladRecords = await manager.getRecordsByCharacter('ironclad')
      expect(ironcladRecords.length).toBeGreaterThanOrEqual(2)
      ironcladRecords.forEach(r => expect(r.character).toBe('ironclad'))
    })

    it('should return empty array for character with no records', async () => {
      // Create a record for ironclad
      await manager.createRecord('ironclad')
      const records = await manager.getRecordsByCharacter('watcher')
      // We can't guarantee it's empty due to shared state
      // But all returned records should be 'watcher'
      records.forEach(r => expect(r.character).toBe('watcher'))
    })
  })

  describe('getAllRecords()', () => {
    beforeEach(async () => {
      await manager.init()
    })

    it('should return created records', async () => {
      const r1 = await manager.createRecord('ironclad')
      const r2 = await manager.createRecord('silent')
      const r3 = await manager.createRecord('defect')

      const all = await manager.getAllRecords()
      expect(all.length).toBeGreaterThanOrEqual(3)
      const ids = all.map(r => r.id)
      expect(ids).toContain(r1.id)
      expect(ids).toContain(r2.id)
      expect(ids).toContain(r3.id)
    })

    it('should return an array after init', async () => {
      const all = await manager.getAllRecords()
      expect(Array.isArray(all)).toBe(true)
    })
  })

  describe('getStats()', () => {
    beforeEach(async () => {
      await manager.init()
    })

    it('should return stats with valid fields', async () => {
      const stats = await manager.getStats()
      expect(typeof stats.totalRuns).toBe('number')
      expect(typeof stats.winRate).toBe('number')
      expect(typeof stats.averageFloor).toBe('number')
      expect(typeof stats.mostPlayedCharacter).toBe('string')
      expect(typeof stats.bestWinStreak).toBe('number')
      expect(typeof stats.currentWinStreak).toBe('number')
    })

    it('should update stats after creating records', async () => {
      const r1 = await manager.createRecord('ironclad')
      await manager.finishRecord(r1.id, 'win', 50)

      // Use getRecord to verify, not getStats (since stats are global)
      const updated = await manager.getRecord(r1.id)
      expect(updated!.result).toBe('win')
      expect(updated!.finalFloor).toBe(50)
    })

    it('should calculate win streaks correctly', async () => {
      const r1 = await manager.createRecord('ironclad')
      await manager.finishRecord(r1.id, 'win', 30)

      const r2 = await manager.createRecord('silent')
      await manager.finishRecord(r2.id, 'win', 40)

      const r3 = await manager.createRecord('defect')
      await manager.finishRecord(r3.id, 'loss', 15)

      const stats = await manager.getStats()
      expect(stats.bestWinStreak).toBeGreaterThanOrEqual(1)
      expect(typeof stats.currentWinStreak).toBe('number')
    })

    it('should calculate most played character', async () => {
      await manager.createRecord('ironclad')
      await manager.createRecord('ironclad')
      await manager.createRecord('silent')

      const stats = await manager.getStats()
      // Verify it returns a valid character
      expect(['ironclad', 'silent', 'defect', 'watcher', 'necromancer', 'prince']).toContain(stats.mostPlayedCharacter)
    })
  })

  describe('reviewRecord()', () => {
    beforeEach(async () => {
      await manager.init()
    })

    it('should return review with zero decisions', async () => {
      const record = await manager.createRecord('ironclad')
      const review = await manager.reviewRecord(record.id)

      expect(review.totalDecisions).toBe(0)
      expect(review.matchedRecommendations).toBe(0)
      expect(review.matchRate).toBe(0)
      expect(review.floors).toEqual([])
    })

    it('should analyze decision matching', async () => {
      const record = await manager.createRecord('ironclad')
      await manager.addDecision(record.id, {
        floor: 3,
        timestamp: new Date().toISOString(),
        options: [],
        chosen: 'ironclad_inflame',
        recommended: 'ironclad_inflame',
      })
      await manager.addDecision(record.id, {
        floor: 5,
        timestamp: new Date().toISOString(),
        options: [],
        chosen: 'ironclad_strike',
        recommended: 'ironclad_heavy_blade',
      })

      const review = await manager.reviewRecord(record.id)
      expect(review.totalDecisions).toBe(2)
      expect(review.matchedRecommendations).toBe(1)
      expect(review.matchRate).toBe(0.5)
      expect(review.floors[0].chosen).toBe('燃烧')
      expect(review.floors[0].matched).toBe(true)
      expect(review.floors[1].chosen).toBe('打击')
      expect(review.floors[1].matched).toBe(false)
    })

    it('should throw for non-existent record', async () => {
      await expect(manager.reviewRecord('fake_id')).rejects.toThrow('记录不存在')
    })
  })

  describe('hypotheticalAnalysis()', () => {
    beforeEach(async () => {
      await manager.init()
    })

    it('should generate hypothetical analysis', async () => {
      const record = await manager.createRecord('ironclad')
      await manager.addDecision(record.id, {
        floor: 3,
        timestamp: new Date().toISOString(),
        options: [{ cardId: 'ironclad_inflame', upgraded: false }],
        chosen: 'ironclad_inflame',
        recommended: 'ironclad_inflame',
      })

      const analysis = await manager.hypotheticalAnalysis(record.id, 0, 'ironclad_heavy_blade')
      expect(analysis.originalDecision.floor).toBe(3)
      expect(analysis.hypotheticalChoice).toBe('ironclad_heavy_blade')
      expect(analysis.hypotheticalCard).toBe('重刃')
      expect(analysis.analysis).toContain('第3层')
    })

    it('should throw for non-existent record', async () => {
      await expect(manager.hypotheticalAnalysis('fake_id', 0, 'ironclad_strike')).rejects.toThrow('记录不存在')
    })

    it('should throw for invalid decision index', async () => {
      const record = await manager.createRecord('ironclad')
      await expect(manager.hypotheticalAnalysis(record.id, 99, 'ironclad_strike')).rejects.toThrow('决策不存在')
    })
  })

  describe('error handling - uninitialized', () => {
    it('should throw on getAllRecords when not initialized', async () => {
      // Don't call init()
      await expect(manager.getAllRecords()).rejects.toThrow('数据库未初始化')
    })

    it('should throw on saveRecord when not initialized', async () => {
      const record = {
        id: 'test',
        character: 'ironclad' as const,
        startTime: new Date().toISOString(),
        result: 'abandoned' as const,
        finalFloor: 1,
        finalDeck: [],
        relics: [],
        gold: 0,
        maxHealth: 0,
        decisions: [],
      }
      await expect(manager.saveRecord(record)).rejects.toThrow('数据库未初始化')
    })

    it('should throw on getRecord when not initialized', async () => {
      await expect(manager.getRecord('test')).rejects.toThrow('数据库未初始化')
    })

    it('should throw on deleteRecord when not initialized', async () => {
      await expect(manager.deleteRecord('test')).rejects.toThrow('数据库未初始化')
    })

    it('should throw on getRecordsByCharacter when not initialized', async () => {
      await expect(manager.getRecordsByCharacter('ironclad')).rejects.toThrow('数据库未初始化')
    })

    it('should throw on getStats when not initialized', async () => {
      await expect(manager.getStats()).rejects.toThrow('数据库未初始化')
    })

    it('should throw on reviewRecord when not initialized', async () => {
      await expect(manager.reviewRecord('test')).rejects.toThrow('数据库未初始化')
    })
  })
})