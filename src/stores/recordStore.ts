import { create } from 'zustand'
import type { GameRecord, CharacterId, RecordStats, HypotheticalAnalysis } from '@/types'
import { recordManager } from '@/services/recordManager'

interface RecordState {
  records: GameRecord[]
  currentRecord: GameRecord | null
  stats: RecordStats | null
  isLoading: boolean
  error: string | null

  init: () => Promise<void>
  loadRecords: () => Promise<void>
  createNewRecord: (character: CharacterId) => Promise<GameRecord>
  setCurrentRecord: (id: string) => Promise<void>
  finishCurrent: (result: 'win' | 'loss', finalFloor: number) => Promise<void>
  deleteRecord: (id: string) => Promise<void>
  getStats: () => Promise<void>
  reviewRecord: (id: string) => Promise<{
    totalDecisions: number
    matchedRecommendations: number
    matchRate: number
    floors: { floor: number; chosen: string; recommended?: string; matched: boolean }[]
  } | null>
  hypothetical: (recordId: string, decisionIndex: number, alternative: string) => Promise<HypotheticalAnalysis | null>
}

export const useRecordStore = create<RecordState>((set, get) => ({
  records: [],
  currentRecord: null,
  stats: null,
  isLoading: false,
  error: null,

  init: async () => {
    set({ isLoading: true, error: null })
    try {
      await recordManager.init()
      const records = await recordManager.getRecentRecords(50, 0)
      set({ records, isLoading: false })
    } catch (e) {
      set({ error: `初始化失败: ${e instanceof Error ? e.message : '未知错误'}`, isLoading: false })
    }
  },

  loadRecords: async () => {
    set({ isLoading: true, error: null })
    try {
      const records = await recordManager.getRecentRecords(50, 0)
      set({ records, isLoading: false })
    } catch (e) {
      set({ error: `加载记录失败: ${e instanceof Error ? e.message : '未知错误'}`, isLoading: false })
    }
  },

  createNewRecord: async (character) => {
    set({ isLoading: true, error: null })
    try {
      const record = await recordManager.createRecord(character)
      const records = [...get().records, record]
      set({ currentRecord: record, records, isLoading: false })
      return record
    } catch (e) {
      set({ error: `创建记录失败: ${e instanceof Error ? e.message : '未知错误'}`, isLoading: false })
      throw e
    }
  },

  setCurrentRecord: async (id) => {
    try {
      const record = await recordManager.getRecord(id)
      set({ currentRecord: record })
    } catch (e) {
      set({ error: `读取记录失败: ${e instanceof Error ? e.message : '未知错误'}` })
    }
  },

  finishCurrent: async (result, finalFloor) => {
    const { currentRecord } = get()
    if (!currentRecord) return
    try {
      await recordManager.finishRecord(currentRecord.id, result, finalFloor)
      const updated = await recordManager.getRecord(currentRecord.id)
      const records = get().records.map(r => r.id === updated?.id ? (updated || r) : r)
      set({ currentRecord: updated, records })
    } catch (e) {
      set({ error: `完成记录失败: ${e instanceof Error ? e.message : '未知错误'}` })
    }
  },

  deleteRecord: async (id) => {
    try {
      await recordManager.deleteRecord(id)
      const records = get().records.filter(r => r.id !== id)
      set({ records })
      if (get().currentRecord?.id === id) {
        set({ currentRecord: null })
      }
    } catch (e) {
      set({ error: `删除记录失败: ${e instanceof Error ? e.message : '未知错误'}` })
    }
  },

  getStats: async () => {
    try {
      const stats = await recordManager.getStats()
      set({ stats })
    } catch (e) {
      set({ error: `获取统计失败: ${e instanceof Error ? e.message : '未知错误'}` })
    }
  },

  reviewRecord: async (id) => {
    try {
      return await recordManager.reviewRecord(id)
    } catch (e) {
      set({ error: `回顾分析失败: ${e instanceof Error ? e.message : '未知错误'}` })
      return null
    }
  },

  hypothetical: async (recordId, decisionIndex, alternative) => {
    try {
      return await recordManager.hypotheticalAnalysis(recordId, decisionIndex, alternative)
    } catch (e) {
      set({ error: `假设分析失败: ${e instanceof Error ? e.message : '未知错误'}` })
      return null
    }
  },
}))