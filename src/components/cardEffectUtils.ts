import type { Card } from '@/types'

/**
 * 根据卡牌类型和稀有度返回对应的特效 CSS 类名
 */
export function getCardEffectClass(card: Card): string {
  const classes: string[] = []

  // 类型特效
  switch (card.type) {
    case 'attack':
      classes.push('card-effect-attack')
      break
    case 'skill':
      classes.push('card-effect-skill')
      break
    case 'power':
      classes.push('card-effect-power')
      break
  }

  // 稀有度光效
  switch (card.rarity) {
    case 'common':
      classes.push('card-rarity-common')
      break
    case 'uncommon':
      classes.push('card-rarity-uncommon')
      break
    case 'rare':
      classes.push('card-rarity-rare')
      break
    case 'special':
      classes.push('card-rarity-special')
      break
  }

  return classes.join(' ')
}

/**
 * 卡牌类型颜色映射
 */
export const CARD_TYPE_COLORS: Record<string, { bg: string; border: string; glow: string }> = {
  attack: {
    bg: 'rgba(239, 68, 68, 0.05)',
    border: 'rgba(239, 68, 68, 0.2)',
    glow: 'rgba(239, 68, 68, 0.15)',
  },
  skill: {
    bg: 'rgba(59, 130, 246, 0.05)',
    border: 'rgba(59, 130, 246, 0.2)',
    glow: 'rgba(59, 130, 246, 0.15)',
  },
  power: {
    bg: 'rgba(245, 158, 11, 0.05)',
    border: 'rgba(245, 158, 11, 0.2)',
    glow: 'rgba(245, 158, 11, 0.15)',
  },
  status: {
    bg: 'rgba(107, 114, 128, 0.05)',
    border: 'rgba(107, 114, 128, 0.2)',
    glow: 'rgba(107, 114, 128, 0.15)',
  },
  curse: {
    bg: 'rgba(168, 85, 247, 0.05)',
    border: 'rgba(168, 85, 247, 0.2)',
    glow: 'rgba(168, 85, 247, 0.15)',
  },
}

/**
 * 稀有度颜色映射
 */
export const RARITY_COLORS: Record<string, string> = {
  basic: 'text-rarity-basic',
  common: 'text-rarity-common',
  uncommon: 'text-rarity-uncommon',
  rare: 'text-rarity-rare',
  special: 'text-rarity-special',
}
