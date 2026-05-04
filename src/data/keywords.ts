export interface Keyword {
  id: string
  name: string
  nameEn: string
  description: string
  icon: string
  category: 'status' | 'buff' | 'debuff' | 'mechanic' | 'orb'
}

export const keywords: Keyword[] = [
  // 状态类
  {
    id: 'vulnerable',
    name: '易伤',
    nameEn: 'Vulnerable',
    description: '受到的攻击伤害增加50%。持续X回合。',
    icon: '🎯',
    category: 'debuff'
  },
  {
    id: 'weak',
    name: '虚弱',
    nameEn: 'Weak',
    description: '造成的攻击伤害减少25%。持续X回合。',
    icon: '😵',
    category: 'debuff'
  },
  {
    id: 'poison',
    name: '中毒',
    nameEn: 'Poison',
    description: '每回合开始时受到等同于中毒层数的伤害，然后中毒层数减1。',
    icon: '☠️',
    category: 'debuff'
  },
  {
    id: 'strength',
    name: '力量',
    nameEn: 'Strength',
    description: '每层力量使所有攻击伤害+1。永久效果。',
    icon: '💪',
    category: 'buff'
  },
  {
    id: 'dexterity',
    name: '敏捷',
    nameEn: 'Dexterity',
    description: '每层敏捷使所有护甲+1。永久效果。',
    icon: '🏃',
    category: 'buff'
  },
  {
    id: 'block',
    name: '护甲',
    nameEn: 'Block',
    description: '护甲可以抵消受到的伤害。回合开始时护甲消失（除非有堡垒）。',
    icon: '🛡️',
    category: 'mechanic'
  },
  {
    id: 'exhaust',
    name: '消耗',
    nameEn: 'Exhaust',
    description: '消耗的牌移出战斗，不再进入弃牌堆。每场战斗结束后恢复。',
    icon: '🔥',
    category: 'mechanic'
  },
  {
    id: 'ethereal',
    name: '虚无',
    nameEn: 'Ethereal',
    description: '如果虚无牌在回合结束时仍在手中，它会被消耗。',
    icon: '👻',
    category: 'mechanic'
  },
  {
    id: 'retain',
    name: '保留',
    nameEn: 'Retain',
    description: '保留的牌在回合结束时不会被弃掉。',
    icon: '📌',
    category: 'mechanic'
  },
  {
    id: 'innate',
    name: '固有',
    nameEn: 'Innate',
    description: '固有牌在每场战斗开始时必定在初始手牌中。',
    icon: '⭐',
    category: 'mechanic'
  },
  {
    id: 'draw',
    name: '抽牌',
    nameEn: 'Draw',
    description: '从抽牌堆中抽取指定数量的牌到手中。',
    icon: '🃏',
    category: 'mechanic'
  },
  {
    id: 'channel',
    name: '生成球',
    nameEn: 'Channel',
    description: '生成一个球放入球位。如果球位已满，最旧的球会被挤出并触发效果。',
    icon: '🔮',
    category: 'orb'
  },
  {
    id: 'focus',
    name: '专注',
    nameEn: 'Focus',
    description: '增强所有球的效果。每层专注使闪电球伤害+1、冰霜球护甲+1、黑暗球蓄力+1。',
    icon: '🧠',
    category: 'buff'
  },
  {
    id: 'orb_slot',
    name: '球位',
    nameEn: 'Orb Slot',
    description: '可以同时拥有的球数量。默认3个球位。',
    icon: '💫',
    category: 'orb'
  },
  {
    id: 'wrath',
    name: '愤怒姿态',
    nameEn: 'Wrath',
    description: '造成的伤害翻倍，受到的伤害也翻倍。可以通过切换姿态退出。',
    icon: '😡',
    category: 'buff'
  },
  {
    id: 'calm',
    name: '平静姿态',
    nameEn: 'Calm',
    description: '退出平静姿态时获得2点额外能量。可以通过切换姿态退出。',
    icon: '😌',
    category: 'buff'
  },
  {
    id: 'divinity',
    name: '神格',
    nameEn: 'Divinity',
    description: '神格层数满后进入神格姿态，伤害翻三倍。',
    icon: '✨',
    category: 'buff'
  },
  {
    id: 'summon',
    name: '召唤',
    nameEn: 'Summon',
    description: '召唤一个友方单位参与战斗。',
    icon: '💀',
    category: 'mechanic'
  },
  {
    id: 'wound',
    name: '伤口',
    nameEn: 'Wound',
    description: '无用的状态牌，占据手牌位置。可以通过消耗等方式移除。',
    icon: '🩸',
    category: 'status'
  },
  {
    id: 'daze',
    name: '眩晕',
    nameEn: 'Daze',
    description: '无用的状态牌，虚无。回合结束时消耗。',
    icon: '💫',
    category: 'status'
  },
  {
    id: 'burn',
    name: '灼烧',
    nameEn: 'Burn',
    description: '状态牌。回合结束时受到2点伤害，然后消耗。',
    icon: '🔥',
    category: 'status'
  },
  // 新关键词
  {
    id: 'scry',
    name: '预见',
    nameEn: 'Scry',
    description: '查看牌库顶部的指定数量牌，可以选择丢弃其中任意张数。',
    icon: '🔮',
    category: 'mechanic'
  },
  {
    id: 'intangible',
    name: '无实体',
    nameEn: 'Intangible',
    description: '拥有无实体时，下一次受到的伤害降为1点。每层无实体抵消一次伤害。',
    icon: '👻',
    category: 'buff'
  },
  {
    id: 'star',
    name: '辉星',
    nameEn: 'Star',
    description: '辉星是储君的专属资源，用于增强特定的牌效果。每层辉星提供额外加成。',
    icon: '⭐',
    category: 'buff'
  },
  {
    id: 'evoke',
    name: '激活',
    nameEn: 'Evoke',
    description: '引爆最右边的充能球，触发其效果并使其离开球位。',
    icon: '💥',
    category: 'orb'
  },
  {
    id: 'soul',
    name: '灵魂',
    nameEn: 'Soul',
    description: '灵魂牌是亡灵契约师的特殊资源牌，可以从抽牌堆或消耗堆中回收利用。',
    icon: '💜',
    category: 'status'
  },
  {
    id: 'forge',
    name: '铸造',
    nameEn: 'Forge',
    description: '铸造是储君的专属资源，用于强化君王之剑和其他卡牌的效果。每层铸造提供额外加成。',
    icon: '⚒️',
    category: 'buff'
  },
  {
    id: 'doom',
    name: '灾厄',
    nameEn: 'Doom',
    description: '灾厄是亡灵契约师的专属负面状态。敌人身上的灾厄层数达到特定阈值时会触发额外效果。',
    icon: '💀',
    category: 'debuff'
  }
]

const keywordMap = new Map<string, Keyword>()
for (const kw of keywords) {
  keywordMap.set(kw.id, kw)
}

export function getKeywordById(id: string): Keyword | undefined {
  return keywordMap.get(id)
}

export function getKeywordsByCategory(category: Keyword['category']): Keyword[] {
  return keywords.filter((kw) => kw.category === category)
}

export function getAllKeywords(): Keyword[] {
  return keywords
}

export function searchKeywords(query: string): Keyword[] {
  const q = query.toLowerCase()
  return keywords.filter(
    (kw) =>
      kw.name.includes(q) ||
      kw.nameEn.toLowerCase().includes(q) ||
      kw.description.includes(q)
  )
}
