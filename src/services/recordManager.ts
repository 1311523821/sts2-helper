import type { GameRecord, Decision, HypotheticalAnalysis, RecordStats, CharacterId } from '@/types'
import type { DeckCard } from '@/types/card'
import { getCardById } from '@/data/cards'

const DB_NAME = 'sts2-helper'
const DB_VERSION = 1
const STORE_NAME = 'game-records'

/**
 * 使用 IndexedDB 的游戏记录管理器
 */
export class RecordManager {
  private db: IDBDatabase | null = null

  /**
   * 初始化数据库
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(new Error('无法打开数据库'))

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
          store.createIndex('character', 'character', { unique: false })
          store.createIndex('result', 'result', { unique: false })
          store.createIndex('startTime', 'startTime', { unique: false })
        }
      }

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result
        resolve()
      }
    })
  }

  private getDB(): IDBDatabase {
    if (!this.db) throw new Error('数据库未初始化，请先调用 init()')
    return this.db
  }

  /**
   * 创建新游戏记录
   */
  async createRecord(character: CharacterId): Promise<GameRecord> {
    const record: GameRecord = {
      id: `run_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      character,
      startTime: new Date().toISOString(),
      result: 'abandoned',
      finalFloor: 1,
      finalDeck: [],
      relics: [],
      gold: 0,
      maxHealth: 0,
      decisions: [],
    }
    await this.saveRecord(record)
    return record
  }

  /**
   * 保存/更新游戏记录
   */
  async saveRecord(record: GameRecord): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = this.getDB().transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const request = store.put(record)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('保存记录失败'))
    })
  }

  /**
   * 添加选牌决策
   */
  async addDecision(recordId: string, decision: Decision): Promise<void> {
    const record = await this.getRecord(recordId)
    if (!record) throw new Error(`记录不存在: ${recordId}`)
    record.decisions.push(decision)
    await this.saveRecord(record)
  }

  /**
   * 更新牌库
   */
  async updateDeck(recordId: string, deck: DeckCard[]): Promise<void> {
    const record = await this.getRecord(recordId)
    if (!record) throw new Error(`记录不存在: ${recordId}`)
    record.finalDeck = deck
    await this.saveRecord(record)
  }

  /**
   * 完成游戏
   */
  async finishRecord(recordId: string, result: 'win' | 'loss', finalFloor: number): Promise<void> {
    const record = await this.getRecord(recordId)
    if (!record) throw new Error(`记录不存在: ${recordId}`)
    record.result = result
    record.finalFloor = finalFloor
    record.endTime = new Date().toISOString()
    await this.saveRecord(record)
  }

  /**
   * 获取单条记录
   */
  async getRecord(id: string): Promise<GameRecord | null> {
    return new Promise((resolve, reject) => {
      const tx = this.getDB().transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const request = store.get(id)
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(new Error('读取记录失败'))
    })
  }

  /**
   * 获取所有记录
   */
  async getAllRecords(): Promise<GameRecord[]> {
    return new Promise((resolve, reject) => {
      const tx = this.getDB().transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(new Error('读取记录失败'))
    })
  }

  /**
   * 按角色获取记录
   */
  async getRecordsByCharacter(character: CharacterId): Promise<GameRecord[]> {
    return new Promise((resolve, reject) => {
      const tx = this.getDB().transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const index = store.index('character')
      const request = index.getAll(character)
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(new Error('读取记录失败'))
    })
  }

  /**
   * 删除记录
   */
  async deleteRecord(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = this.getDB().transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const request = store.delete(id)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('删除记录失败'))
    })
  }

  /**
   * 回顾分析 - 分析一局游戏的决策质量
   */
  async reviewRecord(recordId: string): Promise<{
    totalDecisions: number
    matchedRecommendations: number
    matchRate: number
    floors: { floor: number; chosen: string; recommended?: string; matched: boolean }[]
  }> {
    const record = await this.getRecord(recordId)
    if (!record) throw new Error(`记录不存在: ${recordId}`)

    let matched = 0
    const floors = record.decisions.map(d => {
      const isMatch = d.chosen === d.recommended
      if (isMatch) matched++
      return {
        floor: d.floor,
        chosen: getCardById(d.chosen)?.name || d.chosen,
        recommended: d.recommended ? (getCardById(d.recommended)?.name || d.recommended) : undefined,
        matched: isMatch,
      }
    })

    return {
      totalDecisions: record.decisions.length,
      matchedRecommendations: matched,
      matchRate: record.decisions.length > 0 ? matched / record.decisions.length : 0,
      floors,
    }
  }

  /**
   * 假设分析 - "如果当时选了X会怎样"
   */
  async hypotheticalAnalysis(
    recordId: string,
    decisionIndex: number,
    alternativeChoice: string
  ): Promise<HypotheticalAnalysis> {
    const record = await this.getRecord(recordId)
    if (!record) throw new Error(`记录不存在: ${recordId}`)

    const decision = record.decisions[decisionIndex]
    if (!decision) throw new Error(`决策不存在: 索引${decisionIndex}`)

    // 构建假设牌库
    const hypotheticalDeck = [...record.finalDeck]
    // 移除实际选择的牌
    const removeIdx = hypotheticalDeck.findIndex(c => c.cardId === decision.chosen)
    if (removeIdx !== -1) hypotheticalDeck.splice(removeIdx, 1)
    // 添加假设选择的牌
    hypotheticalDeck.push({ cardId: alternativeChoice, upgraded: false })

    const altCard = getCardById(alternativeChoice)
    const chosenCard = getCardById(decision.chosen)

    return {
      originalDecision: decision,
      hypotheticalChoice: alternativeChoice,
      hypotheticalCard: altCard?.name || alternativeChoice,
      hypotheticalDeck,
      archetypeMatchDelta: 0, // 需要调用 archetypeEngine 计算
      deckHealthDelta: 0, // 需要调用 analyzeDeckHealth 计算
      analysis: `假设在第${decision.floor}层选择了「${altCard?.name || alternativeChoice}」而非「${chosenCard?.name || decision.chosen}」，牌库将发生变化。`,
    }
  }

  /**
   * 获取记录统计
   */
  async getStats(): Promise<RecordStats> {
    const records = await this.getAllRecords()
    if (records.length === 0) {
      return {
        totalRuns: 0,
        winRate: 0,
        averageFloor: 0,
        averageDecisions: 0,
        mostPlayedCharacter: 'ironclad',
        bestWinStreak: 0,
        currentWinStreak: 0,
      }
    }

    const wins = records.filter(r => r.result === 'win').length
    const charCount = new Map<CharacterId, number>()
    let totalFloor = 0
    let totalDecisions = 0
    let bestStreak = 0
    let currentStreak = 0
    let streak = 0

    for (const r of records) {
      charCount.set(r.character, (charCount.get(r.character) || 0) + 1)
      totalFloor += r.finalFloor
      totalDecisions += r.decisions.length
    }

    // 计算连胜（按时间排序）
    const sorted = [...records].sort((a, b) => a.startTime.localeCompare(b.startTime))
    for (const r of sorted) {
      if (r.result === 'win') {
        streak++
        bestStreak = Math.max(bestStreak, streak)
      } else {
        streak = 0
      }
    }
    currentStreak = streak

    let mostPlayed: CharacterId = 'ironclad'
    let maxCount = 0
    for (const [char, count] of charCount) {
      if (count > maxCount) {
        maxCount = count
        mostPlayed = char
      }
    }

    return {
      totalRuns: records.length,
      winRate: wins / records.length,
      averageFloor: totalFloor / records.length,
      averageDecisions: totalDecisions / records.length,
      mostPlayedCharacter: mostPlayed,
      bestWinStreak: bestStreak,
      currentWinStreak: currentStreak,
    }
  }
}

// 单例导出
export const recordManager = new RecordManager()
