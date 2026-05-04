/** 卡牌类型图标 */
export const TYPE_ICONS: Record<string, string> = {
  attack: '⚔️',
  skill: '🛡️',
  power: '⚡',
  status: '💀',
  curse: '☠️',
}

/** 卡牌类型中文名 */
export const TYPE_NAMES: Record<string, string> = {
  attack: '攻击',
  skill: '技能',
  power: '能力',
  status: '状态',
  curse: '诅咒',
}

/** 卡牌类型主色 */
export const TYPE_COLORS: Record<string, string> = {
  attack: '#E85D2C',
  skill: '#0EA5E9',
  power: '#A855F7',
  status: '#78716C',
  curse: '#DC2626',
}

/** 稀有度中文名 */
export const RARITY_NAMES: Record<string, string> = {
  basic: '基础',
  common: '普通',
  uncommon: '罕见',
  rare: '稀有',
  special: '特殊',
}

/** 稀有度文字颜色类名 */
export const RARITY_COLORS: Record<string, string> = {
  basic: 'text-rarity-basic',
  common: 'text-rarity-common',
  uncommon: 'text-rarity-uncommon',
  rare: 'text-rarity-rare',
  special: 'text-rarity-special',
}

/** 稀有度背景色类名 */
export const RARITY_BG_COLORS: Record<string, string> = {
  basic: 'bg-warm-300',
  common: 'bg-warm-400',
  uncommon: 'bg-amber-400',
  rare: 'bg-xm-primary',
  special: 'bg-purple-500',
}

/** 稀有度带背景的文字颜色（用于 EncyclopediaPage） */
export const RARITY_TAG_COLORS: Record<string, string> = {
  basic: 'text-rarity-basic bg-warm-100',
  common: 'text-rarity-common bg-warm-100',
  uncommon: 'text-rarity-uncommon bg-amber-50',
  rare: 'text-rarity-rare bg-orange-50',
  special: 'text-rarity-special bg-purple-50',
}

/** 稀有度边框类名 */
export const RARITY_BORDER: Record<string, string> = {
  basic: 'border-warm-300',
  common: 'border-warm-400',
  uncommon: 'border-rarity-uncommon',
  rare: 'border-rarity-rare',
  special: 'border-rarity-special',
}

/** 稀有度光效类名 */
export const RARITY_GLOW: Record<string, string> = {
  basic: '',
  common: '',
  uncommon: 'shadow-[0_0_12px_rgba(245,158,11,0.25)]',
  rare: 'shadow-[0_0_16px_rgba(255,107,53,0.35)]',
  special: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]',
}
