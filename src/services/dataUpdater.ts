import type { Card } from '@/types/card'
import type { Relic } from '@/types/relic'

const DATA_VERSION_KEY = 'sts2-data-version'
const DATA_CACHE_KEY = 'sts2-data-cache'

export interface UpdateManifest {
  version: string
  updatedAt: string
  cards: { id: string; hash: string }[]
  relics: { id: string; hash: string }[]
}

export interface UpdateResult {
  success: boolean
  updatedCards: number
  updatedRelics: number
  newVersion: string
  errors: string[]
}

/**
 * 数据更新器
 * 支持从远程获取最新卡牌数据、本地校验、增量更新
 */
export class DataUpdater {
  private remoteBaseUrl: string

  constructor(remoteBaseUrl: string = '') {
    this.remoteBaseUrl = remoteBaseUrl
  }

  /**
   * 检查是否有更新
   */
  async checkForUpdate(currentVersion: string): Promise<{ hasUpdate: boolean; latestVersion?: string }> {
    if (!this.remoteBaseUrl) {
      return { hasUpdate: false }
    }

    try {
      const response = await fetch(`${this.remoteBaseUrl}/manifest.json`, {
        signal: AbortSignal.timeout(5000),
      })
      if (!response.ok) return { hasUpdate: false }

      const manifest: UpdateManifest = await response.json()
      return {
        hasUpdate: manifest.version !== currentVersion,
        latestVersion: manifest.version,
      }
    } catch {
      return { hasUpdate: false }
    }
  }

  /**
   * 获取远程更新清单
   */
  async fetchManifest(): Promise<UpdateManifest | null> {
    if (!this.remoteBaseUrl) return null

    try {
      const response = await fetch(`${this.remoteBaseUrl}/manifest.json`, {
        signal: AbortSignal.timeout(5000),
      })
      if (!response.ok) return null
      return await response.json()
    } catch {
      return null
    }
  }

  /**
   * 增量更新卡牌数据
   */
  async updateCards(
    currentCards: Map<string, Card>,
    manifest: UpdateManifest
  ): Promise<{ updated: Card[]; errors: string[] }> {
    const updated: Card[] = []
    const errors: string[] = []

    // 找出需要更新的卡牌
    const toUpdate: string[] = []
    for (const entry of manifest.cards) {
      const local = currentCards.get(entry.id)
      const localHash = local ? DataUpdater.hashCard(local) : ''
      if (localHash !== entry.hash) {
        toUpdate.push(entry.id)
      }
    }

    if (toUpdate.length === 0) return { updated: [], errors: [] }

    // 批量获取更新（分批避免过载）
    const batchSize = 20
    for (let i = 0; i < toUpdate.length; i += batchSize) {
      const batch = toUpdate.slice(i, i + batchSize)
      try {
        const response = await fetch(`${this.remoteBaseUrl}/cards/batch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: batch }),
          signal: AbortSignal.timeout(10000),
        })
        if (!response.ok) {
          errors.push(`批次请求失败: ${response.status}`)
          continue
        }
        const data: Card[] = await response.json()
        updated.push(...data)
      } catch (e) {
        errors.push(`网络错误: ${e instanceof Error ? e.message : '未知'}`)
      }
    }

    return { updated, errors }
  }

  /**
   * 校验本地数据完整性
   */
  validateCards(cards: Card[]): { valid: boolean; issues: string[] } {
    const issues: string[] = []

    for (const card of cards) {
      if (!card.id) issues.push(`卡牌缺少ID: ${card.name}`)
      if (!card.name) issues.push(`卡牌缺少名称: ${card.id}`)
      if (!card.character) issues.push(`卡牌 ${card.name} 缺少角色`)
      if (card.cost < 0) issues.push(`卡牌 ${card.name} 费用异常: ${card.cost}`)
      if (!card.effects || card.effects.length === 0) {
        issues.push(`卡牌 ${card.name} 缺少效果数据`)
      }
    }

    return { valid: issues.length === 0, issues }
  }

  /**
   * 校验遗物数据完整性
   */
  validateRelics(relics: Relic[]): { valid: boolean; issues: string[] } {
    const issues: string[] = []

    for (const relic of relics) {
      if (!relic.id) issues.push(`遗物缺少ID: ${relic.name}`)
      if (!relic.name) issues.push(`遗物缺少名称: ${relic.id}`)
      if (!relic.character) issues.push(`遗物 ${relic.name} 缺少角色`)
      if (!relic.effects || relic.effects.length === 0) {
        issues.push(`遗物 ${relic.name} 缺少效果数据`)
      }
    }

    return { valid: issues.length === 0, issues }
  }

  /**
   * 保存数据版本到本地
   */
  saveVersion(version: string): void {
    try {
      localStorage.setItem(DATA_VERSION_KEY, version)
    } catch {
      // localStorage 不可用
    }
  }

  /**
   * 获取本地数据版本
   */
  getLocalVersion(): string {
    try {
      return localStorage.getItem(DATA_VERSION_KEY) || '0.0.0'
    } catch {
      return '0.0.0'
    }
  }

  /**
   * 缓存数据到本地
   */
  cacheData(key: string, data: unknown): void {
    try {
      const cache = JSON.parse(localStorage.getItem(DATA_CACHE_KEY) || '{}')
      cache[key] = { data, timestamp: Date.now() }
      localStorage.setItem(DATA_CACHE_KEY, JSON.stringify(cache))
    } catch {
      // 缓存失败不影响主流程
    }
  }

  /**
   * 读取缓存
   */
  getCachedData<T>(key: string, maxAge: number = 3600000): T | null {
    try {
      const cache = JSON.parse(localStorage.getItem(DATA_CACHE_KEY) || '{}')
      const entry = cache[key]
      if (!entry) return null
      if (Date.now() - entry.timestamp > maxAge) return null
      return entry.data as T
    } catch {
      return null
    }
  }

  /**
   * 卡牌数据哈希（简单哈希用于变更检测）
   */
  static hashCard(card: Card): string {
    const str = `${card.id}:${card.name}:${card.cost}:${card.description}:${card.effects?.length || 0}`
    return DataUpdater.simpleHash(str)
  }

  private static simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash |= 0
    }
    return hash.toString(36)
  }
}

export const dataUpdater = new DataUpdater()
