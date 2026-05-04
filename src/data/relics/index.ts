import type { CharacterId, Relic, RelicRarity } from '@/types'

// Import all relic data
import starterRelics from './starter.json'
import commonRelics from './common.json'
import uncommonRelics from './uncommon.json'
import rareRelics from './rare.json'
import ironcladRelics from './ironclad.json'
import silentRelics from './silent.json'
import defectRelics from './defect.json'
import watcherRelics from './watcher.json'
import necromancerRelics from './necromancer.json'
import princeRelics from './prince.json'

const allRelicData = [
  starterRelics,
  commonRelics,
  uncommonRelics,
  rareRelics,
  ironcladRelics,
  silentRelics,
  defectRelics,
  watcherRelics,
  necromancerRelics,
  princeRelics,
]

// Build relic map
const relicMap = new Map<string, Relic>()
const relicsByCharacter = new Map<string, Relic[]>()
const relicsByRarity = new Map<string, Relic[]>()

for (const data of allRelicData) {
  const relics = data.relics as Relic[]
  for (const relic of relics) {
    relicMap.set(relic.id, relic)

    // By character
    const charKey = relic.character || 'common'
    if (!relicsByCharacter.has(charKey)) {
      relicsByCharacter.set(charKey, [])
    }
    relicsByCharacter.get(charKey)!.push(relic)

    // By rarity
    if (!relicsByRarity.has(relic.rarity)) {
      relicsByRarity.set(relic.rarity, [])
    }
    relicsByRarity.get(relic.rarity)!.push(relic)
  }
}

export function getRelicById(id: string): Relic | undefined {
  return relicMap.get(id)
}

export function getRelicsByCharacter(characterId: CharacterId): Relic[] {
  return [
    ...(relicsByCharacter.get(characterId) || []),
    ...(relicsByCharacter.get('common') || []),
  ]
}

export function getRelicsByRarity(rarity: RelicRarity): Relic[] {
  return relicsByRarity.get(rarity) || []
}

export function getAllRelics(): Relic[] {
  return Array.from(relicMap.values())
}

export function searchRelics(query: string): Relic[] {
  const q = query.toLowerCase()
  return getAllRelics().filter(
    (r) =>
      r.name.toLowerCase().includes(q) ||
      r.nameEn.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q)
  )
}

export function getRelicsForArchetype(archetypeId: string): Relic[] {
  return getAllRelics().filter((r) => r.tags.some((t) => archetypeId.includes(t)))
}
