import type { Archetype, CharacterId } from '@/types'
import ironcladArchetypes from './ironclad.json'
import silentArchetypes from './silent.json'
import defectArchetypes from './defect.json'
import watcherArchetypes from './watcher.json'
import necromancerArchetypes from './necromancer.json'
import princeArchetypes from './prince.json'

const allArchetypes: Record<CharacterId, Archetype[]> = {
  ironclad: ironcladArchetypes as Archetype[],
  silent: silentArchetypes as Archetype[],
  defect: defectArchetypes as Archetype[],
  watcher: watcherArchetypes as Archetype[],
  necromancer: necromancerArchetypes as Archetype[],
  prince: princeArchetypes as Archetype[],
}

export function getArchetypesByCharacter(characterId: CharacterId): Archetype[] {
  return allArchetypes[characterId] || []
}

export function getArchetypeById(id: string): Archetype | undefined {
  for (const archetypes of Object.values(allArchetypes)) {
    const found = archetypes.find((a) => a.id === id)
    if (found) return found
  }
  return undefined
}

export function getAllArchetypes(): Archetype[] {
  return Object.values(allArchetypes).flat()
}
