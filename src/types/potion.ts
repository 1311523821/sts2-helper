import type { CharacterId } from './card'

export type PotionRarity = 'common' | 'uncommon' | 'rare'

export type PotionTarget = 'self' | 'enemy' | 'all_enemies' | 'random_enemy'

export interface PotionEffect {
  description: string
  power: number
}

export interface Potion {
  id: string
  name: string
  nameEn: string
  character: CharacterId | 'common'
  rarity: PotionRarity
  description: string
  target: PotionTarget
  effects: PotionEffect[]
  /** 药水图片URL */
  imageUrl?: string
  /** 数据来源 */
  dataSource: 'manual' | 'wiki' | 'game_data' | 'community' | 'ai_generated'
  tags: string[]
}
