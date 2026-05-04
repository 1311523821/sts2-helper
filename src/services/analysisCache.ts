/**
 * 分析结果缓存
 *
 * 基于 deck signature 缓存分析结果，避免重复计算。
 * 当牌库内容未变化时直接返回缓存结果。
 */
import type { ArchetypeMatch, DeckHealthReport, CostCurveAnalysis, CombatBalanceAnalysis, DeckCard, CharacterId, OwnedRelic } from '@/types'
import type { ComboDetection } from './archetypeEngine'

// ============================================================
// Deck signature
// ============================================================

/**
 * 生成牌库签名。
 * 签名基于排序后的 (cardId, upgraded) 对列表，使用 JSON 序列化。
 * 只要牌库内容完全一致，签名就相同。
 */
export function makeDeckSignature(deck: DeckCard[]): string {
  const sorted = [...deck].sort((a, b) => {
    if (a.cardId !== b.cardId) return a.cardId.localeCompare(b.cardId)
    return Number(a.upgraded) - Number(b.upgraded)
  })
  return JSON.stringify(sorted)
}

// ============================================================
// Cache entry
// ============================================================

export interface CachedAnalysis {
  signature: string
  archetypes: ArchetypeMatch[]
  deckHealth: DeckHealthReport
  costCurve: CostCurveAnalysis
  combatBalance: CombatBalanceAnalysis
  combos: ComboDetection[]
  timestamp: number
}

// ============================================================
// Cache storage (in-memory LRU-like map)
// ============================================================

const MAX_CACHE_SIZE = 50

const cache = new Map<string, CachedAnalysis>()

/**
 * 从缓存中获取分析结果。
 * 签名不一致或不存在时返回 undefined。
 */
export function getCachedAnalysis(
  deck: DeckCard[],
  _character?: CharacterId, // eslint-disable-line @typescript-eslint/no-unused-vars
  _relics?: OwnedRelic[] // eslint-disable-line @typescript-eslint/no-unused-vars
): CachedAnalysis | undefined {
  const sig = makeDeckSignature(deck)
  const entry = cache.get(sig)
  if (!entry) return undefined

  // 检查缓存是否过期（5分钟）
  if (Date.now() - entry.timestamp > 5 * 60 * 1000) {
    cache.delete(sig)
    return undefined
  }

  return entry
}

/**
 * 将分析结果存入缓存。
 */
export function setCachedAnalysis(
  deck: DeckCard[],
  data: Omit<CachedAnalysis, 'signature' | 'timestamp'>
): void {
  // 淘汰最旧的条目（LRU 策略）
  if (cache.size >= MAX_CACHE_SIZE) {
    const oldestKey = cache.keys().next().value
    if (oldestKey) cache.delete(oldestKey)
  }

  const sig = makeDeckSignature(deck)
  cache.set(sig, {
    ...data,
    signature: sig,
    timestamp: Date.now(),
  })
}

/**
 * 清除所有缓存。
 */
export function clearAnalysisCache(): void {
  cache.clear()
}

/**
 * 获取当前缓存大小。
 */
export function getCacheSize(): number {
  return cache.size
}
