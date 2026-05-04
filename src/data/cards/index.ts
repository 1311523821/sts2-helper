import type { Card, CharacterId } from '@/types'
import ironcladData from './ironclad.json'
import silentData from './silent.json'
import defectData from './defect.json'
import watcherData from './watcher.json'
import necromancerData from './necromancer.json'
import princeData from './prince.json'

const allCardData = [
  ironcladData,
  silentData,
  defectData,
  watcherData,
  necromancerData,
  princeData,
]

// Build card map
const cardMap = new Map<string, Card>()
const cardsByCharacter = new Map<CharacterId, Card[]>()

for (const data of allCardData) {
  const cards = data.cards as Card[]
  cardsByCharacter.set(data.character as CharacterId, cards)
  for (const card of cards) {
    cardMap.set(card.id, card)
  }
}

export function getCardById(id: string): Card | undefined {
  return cardMap.get(id)
}

export function getCardsByCharacter(characterId: CharacterId): Card[] {
  return cardsByCharacter.get(characterId) || []
}

export function getAllCards(): Card[] {
  return Array.from(cardMap.values())
}

export function searchCards(query: string, characterId?: CharacterId): Card[] {
  const q = query.toLowerCase()
  const cards = characterId ? getCardsByCharacter(characterId) : getAllCards()
  return cards.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.nameEn.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.tags.some((t) => t.includes(q))
  )
}

export const CHARACTER_IDS: CharacterId[] = [
  'ironclad',
  'silent',
  'defect',
  'watcher',
  'necromancer',
  'prince',
]

export const CHARACTER_INFO: Record<
  CharacterId,
  { name: string; nameEn: string; isNew: boolean; description: string }
> = {
  ironclad: {
    name: '铁甲战士',
    nameEn: 'Ironclad',
    isNew: false,
    description: '经典角色，高生命值，擅长力量叠加和护甲',
  },
  silent: {
    name: '静默猎人',
    nameEn: 'Silent',
    isNew: false,
    description: '经典角色，擅长毒、小刀、弃牌',
  },
  defect: {
    name: '故障机器人',
    nameEn: 'Defect',
    isNew: false,
    description: '经典角色，利用各种球进行战斗',
  },
  watcher: {
    name: '观者',
    nameEn: 'Watcher',
    isNew: false,
    description: '经典角色，擅长姿态切换和神格',
  },
  necromancer: {
    name: '亡灵契约师',
    nameEn: 'Necromancer',
    isNew: true,
    description: 'STS2新角色，擅长契约和亡灵机制',
  },
  prince: {
    name: '储君',
    nameEn: 'Prince',
    isNew: true,
    description: 'STS2新角色，擅长王权和资源管理',
  },
}
