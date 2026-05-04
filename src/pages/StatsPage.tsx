import { useState, useMemo } from 'react'
import { CHARACTER_IDS, CHARACTER_INFO, getAllCards, getCardsByCharacter, getCardById } from '@/data/cards'
import { getAllArchetypes, getArchetypesByCharacter } from '@/data/archetypes'
import type { CharacterId } from '@/types'
import { TYPE_ICONS, TYPE_NAMES, RARITY_NAMES } from '@/constants'

export default function StatsPage() {
  const [charFilter, setCharFilter] = useState<CharacterId | 'all'>('all')
  const [activeTab, setActiveTab] = useState<'cards' | 'archetypes' | 'combos'>('cards')

  const allCards = getAllCards()
  const allArchetypes = getAllArchetypes()

  const filteredCards = charFilter === 'all' ? allCards : getCardsByCharacter(charFilter)
  const filteredArchetypes = charFilter === 'all' ? allArchetypes : getArchetypesByCharacter(charFilter)

  // Card stats
  const cardStats = useMemo(() => {
    const typeCount: Record<string, number> = {}
    const rarityCount: Record<string, number> = {}
    const costDist: Record<number, number> = {}
    const keywordCount: Record<string, number> = {}
    const tagCount: Record<string, number> = {}

    for (const card of filteredCards) {
      typeCount[card.type] = (typeCount[card.type] || 0) + 1
      rarityCount[card.rarity] = (rarityCount[card.rarity] || 0) + 1
      const c = Math.max(0, card.cost)
      costDist[c] = (costDist[c] || 0) + 1
      for (const kw of card.keywords) keywordCount[kw] = (keywordCount[kw] || 0) + 1
      for (const tag of card.tags) tagCount[tag] = (tagCount[tag] || 0) + 1
    }

    return { typeCount, rarityCount, costDist, keywordCount, tagCount, total: filteredCards.length }
  }, [filteredCards])

  // Archetype stats
  const archetypeStats = useMemo(() => {
    const diffCount: Record<string, number> = {}
    const comboPower: Record<string, number> = {}
    let totalCombos = 0

    for (const a of filteredArchetypes) {
      diffCount[a.difficulty] = (diffCount[a.difficulty] || 0) + 1
      totalCombos += a.combos.length
      for (const combo of a.combos) {
        comboPower[combo.power] = (comboPower[combo.power] || 0) + 1
      }
    }

    return { diffCount, comboPower, totalCombos, totalArchetypes: filteredArchetypes.length }
  }, [filteredArchetypes])

  // Top keywords/tags
  const topKeywords = useMemo(() =>
    Object.entries(cardStats.keywordCount).sort((a, b) => b[1] - a[1]).slice(0, 12),
    [cardStats.keywordCount]
  )
  const topTags = useMemo(() =>
    Object.entries(cardStats.tagCount).sort((a, b) => b[1] - a[1]).slice(0, 15),
    [cardStats.tagCount]
  )

  const maxType = Math.max(1, ...Object.values(cardStats.typeCount).map(Number))
  const maxCost = Math.max(1, ...Object.values(cardStats.costDist).map(Number))

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">📈 数据统计</h1>
        <p className="text-text-secondary">卡牌数据库分析、流派统计和热门Combo</p>
      </div>

      {/* Character filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setCharFilter('all')}
          className={`pill-tab ${charFilter === 'all' ? 'active' : ''}`}>全部角色</button>
        {CHARACTER_IDS.map(id => (
          <button key={id} onClick={() => setCharFilter(id)}
            className={`pill-tab ${charFilter === id ? 'active' : ''}`}>
            {CHARACTER_INFO[id].name}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'cards', label: '🃏 卡牌统计' },
          { key: 'archetypes', label: '🎯 流派统计' },
          { key: 'combos', label: '🔗 热门Combo' },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key as 'cards' | 'archetypes' | 'combos')}
            className={`pill-tab ${activeTab === t.key ? 'active' : ''}`}>{t.label}</button>
        ))}
      </div>

      {activeTab === 'cards' && (
        <div className="space-y-6">
          {/* Overview cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="xiaomi-card-static text-center">
              <div className="text-3xl font-bold text-xm-primary">{cardStats.total}</div>
              <div className="text-xs text-text-muted mt-1">总卡牌数</div>
            </div>
            <div className="xiaomi-card-static text-center">
              <div className="text-3xl font-bold text-xm-secondary">{Object.keys(cardStats.typeCount).length}</div>
              <div className="text-xs text-text-muted mt-1">卡牌类型</div>
            </div>
            <div className="xiaomi-card-static text-center">
              <div className="text-3xl font-bold text-purple-500">{topKeywords.length}</div>
              <div className="text-xs text-text-muted mt-1">关键词种类</div>
            </div>
            <div className="xiaomi-card-static text-center">
              <div className="text-3xl font-bold text-text-primary">{topTags.length}</div>
              <div className="text-xs text-text-muted mt-1">标签种类</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Type distribution */}
            <div className="xiaomi-card-static">
              <h4 className="font-bold text-text-primary mb-4">🎯 类型分布</h4>
              <div className="space-y-3">
                {Object.entries(cardStats.typeCount).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-text-primary">{TYPE_ICONS[type]} {TYPE_NAMES[type] || type}</span>
                      <span className="text-xs text-text-muted">{count}张 ({Math.round(count / cardStats.total * 100)}%)</span>
                    </div>
                    <div className="h-3 bg-warm-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${(count / maxType) * 100}%`,
                          background: type === 'attack' ? '#E85D2C' : type === 'skill' ? '#0EA5E9' : type === 'power' ? '#A855F7' : '#78716C',
                        }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost distribution */}
            <div className="xiaomi-card-static">
              <h4 className="font-bold text-text-primary mb-4">💰 费用分布</h4>
              <div className="flex items-end gap-2 h-36">
                {Object.entries(cardStats.costDist).sort(([a], [b]) => Number(a) - Number(b)).map(([cost, count]) => (
                  <div key={cost} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-bold text-text-primary">{count}</span>
                    <div className="w-full rounded-t-lg transition-all duration-500"
                      style={{
                        height: `${(count / maxCost) * 100}%`,
                        minHeight: '8px',
                        background: 'linear-gradient(to top, #FF6B35, #F59E0B)',
                      }} />
                    <span className="text-xs text-text-muted">{cost}费</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rarity distribution */}
            <div className="xiaomi-card-static">
              <h4 className="font-bold text-text-primary mb-4">💎 稀有度分布</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(cardStats.rarityCount).sort((a, b) => b[1] - a[1]).map(([rarity, count]) => {
                  const colors: Record<string, string> = { basic: 'bg-warm-300', common: 'bg-warm-400', uncommon: 'bg-amber-400', rare: 'bg-xm-primary', special: 'bg-purple-500' }
                  return (
                    <div key={rarity} className="flex items-center gap-2 p-2 bg-warm-50 rounded-lg">
                      <div className={`w-3 h-3 rounded-full ${colors[rarity] || 'bg-warm-300'}`} />
                      <span className="text-sm text-text-primary flex-1">{RARITY_NAMES[rarity] || rarity}</span>
                      <span className="text-sm font-bold text-text-primary">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Top keywords */}
            <div className="xiaomi-card-static">
              <h4 className="font-bold text-text-primary mb-4">🏷 热门关键词</h4>
              <div className="space-y-2">
                {topKeywords.map(([kw, count]) => (
                  <div key={kw} className="flex items-center gap-2">
                    <span className="text-xs text-xm-primary bg-xm-light px-2 py-0.5 rounded font-medium w-16 text-center">{kw}</span>
                    <div className="flex-1 h-2 bg-warm-100 rounded-full overflow-hidden">
                      <div className="h-full bg-xm-primary/60 rounded-full"
                        style={{ width: `${(count / topKeywords[0][1]) * 100}%` }} />
                    </div>
                    <span className="text-xs text-text-muted w-8 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top tags */}
          <div className="xiaomi-card-static">
            <h4 className="font-bold text-text-primary mb-4">🔖 热门标签</h4>
            <div className="flex flex-wrap gap-2">
              {topTags.map(([tag, count]) => (
                <span key={tag} className="tag-pill text-sm">
                  {tag} <span className="text-xm-primary font-bold ml-1">{count}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Per-character breakdown */}
          {charFilter === 'all' && (
            <div className="xiaomi-card-static">
              <h4 className="font-bold text-text-primary mb-4">👥 各角色卡牌数量</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {CHARACTER_IDS.map(id => {
                  const cards = getCardsByCharacter(id)
                  return (
                    <div key={id} className="p-3 bg-warm-50 rounded-xl">
                      <div className="font-bold text-sm text-text-primary mb-1">{CHARACTER_INFO[id].name}</div>
                      <div className="text-2xl font-bold text-xm-primary">{cards.length}</div>
                      <div className="text-xs text-text-muted mt-1">
                        {Object.entries(
                          cards.reduce((acc: Record<string, number>, c) => { acc[c.type] = (acc[c.type] || 0) + 1; return acc }, {})
                        ).map(([t, n]) => `${TYPE_ICONS[t]}${n}`).join(' ')}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'archetypes' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="xiaomi-card-static text-center">
              <div className="text-3xl font-bold text-xm-primary">{archetypeStats.totalArchetypes}</div>
              <div className="text-xs text-text-muted mt-1">流派总数</div>
            </div>
            <div className="xiaomi-card-static text-center">
              <div className="text-3xl font-bold text-xm-secondary">{archetypeStats.totalCombos}</div>
              <div className="text-xs text-text-muted mt-1">Combo总数</div>
            </div>
            <div className="xiaomi-card-static text-center">
              <div className="text-3xl font-bold text-purple-500">
                {archetypeStats.totalArchetypes > 0 ? (archetypeStats.totalCombos / archetypeStats.totalArchetypes).toFixed(1) : 0}
              </div>
              <div className="text-xs text-text-muted mt-1">平均Combo/流派</div>
            </div>
          </div>

          {/* Difficulty distribution */}
          <div className="xiaomi-card-static">
            <h4 className="font-bold text-text-primary mb-4">📊 难度分布</h4>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(archetypeStats.diffCount).map(([diff, count]) => {
                const config: Record<string, { label: string; icon: string; color: string }> = {
                  beginner: { label: '新手', icon: '⭐', color: 'text-green-600 bg-green-50 border-green-200' },
                  intermediate: { label: '进阶', icon: '⭐⭐', color: 'text-amber-600 bg-amber-50 border-amber-200' },
                  advanced: { label: '高级', icon: '⭐⭐⭐', color: 'text-red-600 bg-red-50 border-red-200' },
                }
                const c = config[diff] || { label: diff, icon: '?', color: 'text-text-muted' }
                return (
                  <div key={diff} className={`p-4 rounded-xl border text-center ${c.color}`}>
                    <div className="text-2xl mb-1">{c.icon}</div>
                    <div className="text-lg font-bold">{count}</div>
                    <div className="text-xs">{c.label}流派</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Archetype list */}
          <div className="xiaomi-card-static">
            <h4 className="font-bold text-text-primary mb-4">🎯 流派一览</h4>
            <div className="space-y-2">
              {filteredArchetypes.map(a => (
                <div key={a.id} className="flex items-center justify-between p-3 bg-warm-50 rounded-xl">
                  <div>
                    <span className="font-medium text-sm text-text-primary">{a.name}</span>
                    <span className="text-xs text-text-muted ml-2">({CHARACTER_INFO[a.character]?.name})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-warm-200 text-text-muted px-2 py-0.5 rounded">
                      {a.coreCards.length}核心
                    </span>
                    <span className="text-xs bg-xm-light text-xm-primary px-2 py-0.5 rounded">
                      {a.combos.length}Combo
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'combos' && (
        <div className="space-y-6">
          {/* Combo power distribution */}
          <div className="xiaomi-card-static">
            <h4 className="font-bold text-text-primary mb-4">💪 Combo强度分布</h4>
            <div className="grid grid-cols-4 gap-3">
              {Object.entries(archetypeStats.comboPower).map(([power, count]) => {
                const config: Record<string, { label: string; color: string }> = {
                  low: { label: '辅助', color: 'bg-warm-100 text-text-muted' },
                  medium: { label: '中等', color: 'bg-amber-50 text-amber-700' },
                  high: { label: '强力', color: 'bg-orange-50 text-orange-700' },
                  game_winning: { label: '致胜', color: 'bg-xm-light text-xm-primary' },
                }
                const c = config[power] || { label: power, color: '' }
                return (
                  <div key={power} className={`p-3 rounded-xl text-center ${c.color}`}>
                    <div className="text-xl font-bold">{count}</div>
                    <div className="text-xs">{c.label}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* All combos */}
          <div className="xiaomi-card-static">
            <h4 className="font-bold text-text-primary mb-4">🔗 所有Combo</h4>
            <div className="space-y-3">
              {filteredArchetypes.flatMap(a => a.combos.map(c => ({ ...c, archetypeName: a.name, character: a.character })))
                .sort((a, b) => {
                  const order = { game_winning: 0, high: 1, medium: 2, low: 3 }
                  return (order[a.power as keyof typeof order] ?? 4) - (order[b.power as keyof typeof order] ?? 4)
                })
                .map((combo, i) => {
                  const powerConfig: Record<string, { bg: string; text: string; label: string }> = {
                    low: { bg: 'bg-warm-100', text: 'text-text-muted', label: '🔹 辅助' },
                    medium: { bg: 'bg-amber-50', text: 'text-amber-700', label: '⚡ 中等' },
                    high: { bg: 'bg-orange-50', text: 'text-orange-700', label: '💪 强力' },
                    game_winning: { bg: 'bg-xm-light', text: 'text-xm-primary', label: '🏆 致胜' },
                  }
                  const pc = powerConfig[combo.power] || powerConfig.low

                  return (
                    <div key={`${combo.id}-${i}`} className={`p-4 rounded-xl ${pc.bg} animate-fade-in`}
                      style={{ animationDelay: `${i * 50}ms` }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-text-primary">{combo.name}</span>
                          <span className="text-xs text-text-muted">({combo.archetypeName})</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${pc.text} ${pc.bg}`}>{pc.label}</span>
                      </div>
                      <p className="text-xs text-text-secondary mb-2">{combo.description}</p>
                      <div className="flex items-center gap-1 flex-wrap">
                        {combo.cards.map((cardId, j) => {
                          const card = getCardById(cardId)
                          return (
                            <span key={cardId} className="flex items-center gap-1">
                              <span className="text-xs px-2 py-1 rounded-lg bg-white border border-warm-200 font-medium text-text-primary">
                                {card?.name || cardId}
                              </span>
                              {j < combo.cards.length - 1 && <span className="text-xm-primary font-bold">→</span>}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
