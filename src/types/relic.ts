import type { CharacterId } from './card'

export type RelicRarity = 'starter' | 'common' | 'uncommon' | 'rare' | 'boss' | 'shop' | 'event'

export type RelicTrigger =
  | 'on_combat_start'
  | 'on_turn_start'
  | 'on_turn_end'
  | 'on_play_attack'
  | 'on_play_skill'
  | 'on_play_power'
  | 'on_take_damage'
  | 'on_kill'
  | 'on_exhaust'
  | 'on_discard'
  | 'on_draw'
  | 'on_enter_rest'
  | 'on_pick_reward'
  | 'passive'

export interface RelicEffect {
  trigger: RelicTrigger
  description: string
  /** 效果强度（数值化） */
  power: number
}

export interface Relic {
  id: string
  name: string
  nameEn: string
  character: CharacterId | 'common'
  rarity: RelicRarity
  description: string
  effects: RelicEffect[]
  /** 遗物图片URL */
  imageUrl?: string
  /** 数据来源 */
  dataSource: 'manual' | 'wiki' | 'game_data' | 'community' | 'ai_generated'
  /** 数据版本 */
  dataVersion?: string
  /** 协同标签 */
  tags: string[]
}

export interface OwnedRelic {
  relicId: string
  /** 获得遗物的楼层 */
  obtainedAtFloor?: number
}
