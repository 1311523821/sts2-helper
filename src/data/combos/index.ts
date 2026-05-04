import type { CharacterId, ComboPowerLevel } from '@/types'

export interface ComboData {
  id: string
  name: string
  character: CharacterId
  cards: string[]
  power: ComboPowerLevel
  description: string
  setup: string
}

import comboData from './all.json'

const allCombos: ComboData[] = comboData.combos as ComboData[]
const comboMap = new Map<string, ComboData>()
const combosByCharacter = new Map<CharacterId, ComboData[]>()

for (const combo of allCombos) {
  comboMap.set(combo.id, combo)
  if (!combosByCharacter.has(combo.character)) {
    combosByCharacter.set(combo.character, [])
  }
  combosByCharacter.get(combo.character)!.push(combo)
}

export function getComboById(id: string): ComboData | undefined {
  return comboMap.get(id)
}

export function getCombosByCharacter(characterId: CharacterId): ComboData[] {
  return combosByCharacter.get(characterId) || []
}

export function getAllCombos(): ComboData[] {
  return allCombos
}

export function getCombosByPower(power: ComboPowerLevel): ComboData[] {
  return allCombos.filter((c) => c.power === power)
}

export function getCombosForCard(cardId: string): ComboData[] {
  return allCombos.filter((c) => c.cards.includes(cardId))
}
