import type { CharacterId, DeckCard } from '@/types/card'
import type { OwnedRelic } from '@/types/relic'

export interface ParsedSave {
  character: CharacterId
  floor: number
  act: number
  health: number
  maxHealth: number
  gold: number
  deck: DeckCard[]
  relics: OwnedRelic[]
  isValid: boolean
  errors: string[]
}

/**
 * 存档解析器
 * 支持 JSON 和自定义文本格式
 */
export class SaveParser {
  /**
   * 解析存档内容（自动检测格式）
   */
  static parse(content: string): ParsedSave {
    const trimmed = content.trim()
    if (!trimmed) {
      return SaveParser.emptyResult('存档内容为空')
    }

    // 尝试 JSON
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        return SaveParser.parseJSON(trimmed)
      } catch {
        // 不是有效JSON，尝试文本格式
      }
    }

    // 尝试自定义文本格式
    return SaveParser.parseText(trimmed)
  }

  /**
   * 解析 JSON 格式存档
   */
  static parseJSON(json: string): ParsedSave {
    const errors: string[] = []

    try {
      const data = JSON.parse(json)

      // 尝试从常见结构中提取
      const save = data.current_save || data.save || data

      const character = SaveParser.extractCharacter(save, errors)
      const floor = SaveParser.extractNumber(save, 'floor', 1)
      const act = SaveParser.extractNumber(save, 'act', Math.ceil(floor / 16))
      const health = SaveParser.extractNumber(save, 'health', 0)
      const maxHealth = SaveParser.extractNumber(save, 'maxHealth', save.max_health ?? health)
      const gold = SaveParser.extractNumber(save, 'gold', save.coins ?? 0)
      const deck = SaveParser.extractDeck(save, errors)
      const relics = SaveParser.extractRelics(save)

      return {
        character,
        floor,
        act,
        health,
        maxHealth,
        gold,
        deck,
        relics,
        isValid: errors.length === 0,
        errors,
      }
    } catch (e) {
      return SaveParser.emptyResult(`JSON解析失败: ${e instanceof Error ? e.message : '未知错误'}`)
    }
  }

  /**
   * 解析自定义文本格式
   * 支持格式示例：
   * 角色: ironclad
   * 楼层: 12
   * 血量: 65/80
   * 金币: 150
   * 牌库: ironclad_strike, ironclad_defend, ironclad_bash
   * 遗物: relic_burning_blood, relic_anchor
   */
  static parseText(text: string): ParsedSave {
    const errors: string[] = []
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
    const kv = new Map<string, string>()

    for (const line of lines) {
      const sep = line.indexOf(':')
      if (sep === -1) continue
      const key = line.slice(0, sep).trim().toLowerCase()
      const value = line.slice(sep + 1).trim()
      kv.set(key, value)
    }

    const character = SaveParser.parseCharacterText(kv.get('角色') || kv.get('character') || '', errors)
    const floor = SaveParser.parseIntText(kv.get('楼层') || kv.get('floor') || '1', 1)
    const act = SaveParser.parseIntText(kv.get('act') || String(Math.ceil(floor / 16)), Math.ceil(floor / 16))

    const healthStr = kv.get('血量') || kv.get('health') || '0/0'
    const healthParts = healthStr.split('/').map(s => parseInt(s.trim(), 10) || 0)
    const health = healthParts[0] || 0
    const maxHealth = healthParts[1] || health

    const gold = SaveParser.parseIntText(kv.get('金币') || kv.get('gold') || '0', 0)

    const deckStr = kv.get('牌库') || kv.get('deck') || ''
    const deck = SaveParser.parseCardList(deckStr)

    const relicStr = kv.get('遗物') || kv.get('relics') || ''
    const relics = SaveParser.parseRelicList(relicStr)

    return {
      character,
      floor,
      act,
      health,
      maxHealth,
      gold,
      deck,
      relics,
      isValid: errors.length === 0,
      errors,
    }
  }

  // ---- 内部方法 ----

  private static emptyResult(error: string): ParsedSave {
    return {
      character: 'ironclad',
      floor: 1,
      act: 1,
      health: 0,
      maxHealth: 0,
      gold: 0,
      deck: [],
      relics: [],
      isValid: false,
      errors: [error],
    }
  }

  private static extractCharacter(data: Record<string, unknown>, errors: string[]): CharacterId {
    const raw = String(data.character || data.chosen_character || data.class || 'ironclad').toLowerCase()
    const mapped: Record<string, CharacterId> = {
      ironclad: 'ironclad',
      silent: 'silent',
      defect: 'defect',
      watcher: 'watcher',
      necromancer: 'necromancer',
      prince: 'prince',
    }
    if (mapped[raw]) return mapped[raw]
    errors.push(`未知角色: ${raw}，使用默认 ironclad`)
    return 'ironclad'
  }

  private static extractNumber(data: Record<string, unknown>, key: string, fallback: number): number {
    const candidates = [key, `current_${key}`]
    for (const k of candidates) {
      const val = data[k]
      if (typeof val === 'number' && !isNaN(val)) return val
      if (typeof val === 'string') {
        const parsed = parseInt(val, 10)
        if (!isNaN(parsed)) return parsed
      }
    }
    return fallback
  }

  private static extractDeck(data: Record<string, unknown>, errors: string[]): DeckCard[] {
    const raw = data.deck || data.cards || data.master_deck || []
    if (!Array.isArray(raw)) {
      errors.push('牌库数据格式不正确')
      return []
    }

    return raw.map((item: unknown) => {
      if (typeof item === 'string') {
        return { cardId: item, upgraded: false }
      }
      if (typeof item === 'object' && item !== null) {
        const obj = item as Record<string, unknown>
        return {
          cardId: String(obj.id || obj.cardId || obj.card_id || ''),
          upgraded: Boolean(obj.upgraded || obj.is_upgraded),
        }
      }
      return { cardId: String(item), upgraded: false }
    }).filter(c => c.cardId)
  }

  private static extractRelics(data: Record<string, unknown>): OwnedRelic[] {
    const raw = data.relics || []
    if (!Array.isArray(raw)) return []

    return raw.map((item: unknown) => {
      if (typeof item === 'string') return { relicId: item }
      if (typeof item === 'object' && item !== null) {
        const obj = item as Record<string, unknown>
        return {
          relicId: String(obj.id || obj.relicId || obj.relic_id || ''),
          obtainedAtFloor: typeof obj.floor === 'number' ? obj.floor : undefined,
        }
      }
      return { relicId: String(item) }
    }).filter(r => r.relicId)
  }

  private static parseCharacterText(str: string, errors: string[]): CharacterId {
    const lower = str.toLowerCase()
    const cnMap: Record<string, CharacterId> = {
      '铁甲战士': 'ironclad', '战士': 'ironclad',
      '静默猎人': 'silent', '猎人': 'silent',
      '故障机器人': 'defect', '机器人': 'defect',
      '观者': 'watcher',
      '亡灵契约师': 'necromancer', '亡灵': 'necromancer',
      '储君': 'prince',
    }
    const valid: CharacterId[] = ['ironclad', 'silent', 'defect', 'watcher', 'necromancer', 'prince']
    if (cnMap[str]) return cnMap[str]
    if (valid.includes(lower as CharacterId)) return lower as CharacterId
    errors.push(`未知角色: ${str}`)
    return 'ironclad'
  }

  private static parseIntText(str: string, fallback: number): number {
    const parsed = parseInt(str.trim(), 10)
    return isNaN(parsed) ? fallback : parsed
  }

  private static parseCardList(str: string): DeckCard[] {
    if (!str) return []
    return str.split(',').map(s => s.trim()).filter(Boolean).map(id => {
      const upgraded = id.startsWith('+') || id.endsWith('+')
      const cleanId = id.replace(/^\+|\+$/g, '')
      return { cardId: cleanId, upgraded }
    })
  }

  private static parseRelicList(str: string): OwnedRelic[] {
    if (!str) return []
    return str.split(',').map(s => s.trim()).filter(Boolean).map(id => ({ relicId: id }))
  }
}
