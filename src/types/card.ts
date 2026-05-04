export type CardType = 'attack' | 'skill' | 'power' | 'status' | 'curse'
export type CardRarity = 'basic' | 'common' | 'uncommon' | 'rare' | 'special'
export type CharacterId = 'ironclad' | 'silent' | 'defect' | 'watcher' | 'necromancer' | 'prince'

/** 效果类型枚举 */
export type EffectType =
  | 'damage'
  | 'block'
  | 'heal'
  | 'draw'
  | 'energy'
  | 'apply_buff'
  | 'apply_debuff'
  | 'exhaust'
  | 'discard'
  | 'add_to_deck'
  | 'special'

/** 效果目标 */
export type EffectTarget = 'enemy' | 'all_enemies' | 'self' | 'random_enemy' | 'hand' | 'deck' | 'discard'

/** 结构化卡牌效果 */
export interface CardEffect {
  type: EffectType
  target: EffectTarget
  value: number
  /** 用于 apply_buff / apply_debuff 的状态名称，如 'vulnerable', 'weak', 'strength' */
  statusId?: string
  /** 效果描述（本地化） */
  description?: string
}

/** 数据来源标记 */
export type DataSource = 'manual' | 'wiki' | 'game_data' | 'community' | 'ai_generated'

export interface Card {
  id: string
  name: string
  nameEn: string
  character: CharacterId
  type: CardType
  rarity: CardRarity
  cost: number
  description: string
  upgradedDescription?: string
  keywords: string[]
  tags: string[]
  /** 结构化效果列表 */
  effects?: CardEffect[]
  /** 升级后的效果列表 */
  upgradedEffects?: CardEffect[]
  /** 升级后费用变化 */
  upgradedCost?: number
  /** 卡牌图片URL */
  imageUrl?: string
  /** 升级后卡牌图片URL */
  upgradedImageUrl?: string
  /** 数据来源 */
  dataSource?: DataSource
  /** 数据版本 */
  dataVersion?: string
}

export interface DeckCard {
  cardId: string
  upgraded: boolean
}

export interface CardOption {
  cardId: string
  upgraded: boolean
}

export interface Character {
  id: CharacterId
  name: string
  nameEn: string
  isNew: boolean
  description: string
  archetypes: string[]
}
