/**
 * 公共牌组工具函数
 *
 * 职责范围：
 * - calcDeckRatio   牌型比例（分母仅含 attack/skill/power）
 * - calcCostCurve   费用曲线（5 槽: 0,1,2,3+,X）
 * - calcDeckSynergy 协同度计算（基于 tag 倒排索引，O(n)）
 * - getDeckCardCounts 卡牌类型统计
 */
import type { DeckCard } from '@/types'
import { getCardById } from '@/data/cards'

// ============================================================
// 1. calcDeckRatio — 牌型比例
//    分母只包含 attack / skill / power 三类，过滤 status/curse。
// ============================================================

export interface DeckRatio {
  attack: number
  skill: number
  power: number
}

export function calcDeckRatio(deck: DeckCard[]): DeckRatio {
  let atk = 0
  let sk = 0
  let pw = 0
  for (const dc of deck) {
    const card = getCardById(dc.cardId)
    if (!card) continue
    if (card.type === 'attack') atk++
    else if (card.type === 'skill') sk++
    else if (card.type === 'power') pw++
  }
  // 分母只包含三种主要类型，排除 status / curse
  const total = atk + sk + pw || 1
  return { attack: atk / total, skill: sk / total, power: pw / total }
}

// ============================================================
// 2. calcCostCurve — 费用曲线
//    5 槽: [0 费, 1 费, 2 费, 3+费, X 费]
//    X 费卡 cost === -1
// ============================================================

export function calcCostCurve(deck: DeckCard[]): number[] {
  const curve = [0, 0, 0, 0, 0] // 0, 1, 2, 3+, X
  for (const dc of deck) {
    const card = getCardById(dc.cardId)
    if (!card) continue
    if (card.cost === -1) {
      curve[4]++ // X 费
    } else if (card.cost >= 3) {
      curve[3]++ // 3+ 费
    } else {
      curve[card.cost]++
    }
  }
  const total = deck.length || 1
  return curve.map(v => v / total)
}

// ============================================================
// 3. calcDeckSynergy — 协同度分数
//    使用 tag 倒排索引算法实现 O(n) 复杂度
//    sharedTags / totalTags → [0, 100]
// ============================================================

export function calcDeckSynergy(deck: DeckCard[]): number {
  const cards = deck
    .map(dc => getCardById(dc.cardId))
    .filter((c): c is NonNullable<typeof c> => c != null)

  if (cards.length < 2) return 0

  // 建立 tag → cardIds 倒排索引
  const tagToCardIds = new Map<string, Set<string>>()
  for (const card of cards) {
    for (const tag of card.tags) {
      let ids = tagToCardIds.get(tag)
      if (!ids) {
        ids = new Set()
        tagToCardIds.set(tag, ids)
      }
      ids.add(card.id)
    }
  }

  // 统计至少被 2 张卡共享的 tag 数量
  let sharedTags = 0
  for (const ids of tagToCardIds.values()) {
    if (ids.size >= 2) sharedTags++
  }

  const totalTags = tagToCardIds.size
  return totalTags > 0 ? (sharedTags / totalTags) * 100 : 0
}

// ============================================================
// 4. getDeckCardCounts — 统计各类卡牌数量
// ============================================================

export interface DeckCardCounts {
  attack: number
  skill: number
  power: number
  status: number
  curse: number
  total: number
}

export function getDeckCardCounts(deck: DeckCard[]): DeckCardCounts {
  const counts = { attack: 0, skill: 0, power: 0, status: 0, curse: 0 }
  for (const dc of deck) {
    const card = getCardById(dc.cardId)
    if (!card) continue
    if (card.type in counts) {
      counts[card.type as keyof typeof counts]++
    }
  }
  return { ...counts, total: deck.length }
}
