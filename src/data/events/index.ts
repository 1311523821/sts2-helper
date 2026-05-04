export interface EventResult {
  type: 'gold' | 'heal' | 'damage' | 'upgrade' | 'remove_card' | 'transform_card' | 'curse' | 'potion' | 'relic' | 'card' | 'combat' | 'max_hp' | 'heal_percent'
  value: number
  description: string
}

export interface EventOption {
  id: string
  text: string
  results: EventResult[]
}

export interface GameEvent {
  id: string
  name: string
  nameEn: string
  act: number
  description: string
  options: EventOption[]
}

import eventData from './all.json'

const allEvents: GameEvent[] = eventData.events as GameEvent[]
const eventMap = new Map<string, GameEvent>()
const eventsByAct = new Map<number, GameEvent[]>()

for (const event of allEvents) {
  eventMap.set(event.id, event)
  if (!eventsByAct.has(event.act)) {
    eventsByAct.set(event.act, [])
  }
  eventsByAct.get(event.act)!.push(event)
}

export function getEventById(id: string): GameEvent | undefined {
  return eventMap.get(id)
}

export function getEventsByAct(act: number): GameEvent[] {
  return eventsByAct.get(act) || []
}

export function getAllEvents(): GameEvent[] {
  return allEvents
}

export function searchEvents(query: string): GameEvent[] {
  const q = query.toLowerCase()
  return allEvents.filter(
    (e) =>
      e.name.toLowerCase().includes(q) ||
      e.nameEn.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q)
  )
}
