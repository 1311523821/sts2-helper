export interface BossSkill {
  name: string
  description: string
  intent: 'attack' | 'defend' | 'buff' | 'debuff' | 'special' | 'summon' | 'sleep'
}

export interface BossData {
  id: string
  name: string
  nameEn: string
  act: number
  hp: { min: number; max: number }
  description: string
  skills: BossSkill[]
  strategy: string[]
  weaknesses: string[]
  threats: string[]
}

import bossData from './all.json'

const allBosses: BossData[] = bossData.bosses as BossData[]
const bossMap = new Map<string, BossData>()
const bossesByAct = new Map<number, BossData[]>()

for (const boss of allBosses) {
  bossMap.set(boss.id, boss)
  if (!bossesByAct.has(boss.act)) {
    bossesByAct.set(boss.act, [])
  }
  bossesByAct.get(boss.act)!.push(boss)
}

export function getBossById(id: string): BossData | undefined {
  return bossMap.get(id)
}

export function getBossesByAct(act: number): BossData[] {
  return bossesByAct.get(act) || []
}

export function getAllBosses(): BossData[] {
  return allBosses
}

export function searchBosses(query: string): BossData[] {
  const q = query.toLowerCase()
  return allBosses.filter(
    (b) =>
      b.name.toLowerCase().includes(q) ||
      b.nameEn.toLowerCase().includes(q) ||
      b.description.toLowerCase().includes(q)
  )
}
