import { useState, useMemo } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { getCardsByCharacter, searchCards, getCardById } from '@/data/cards'
import { DeckManager } from '@/components/analyze/DeckManager'
import { RewardAnalyzer } from '@/components/analyze/RewardAnalyzer'
import { DeckStats } from '@/components/analyze/DeckStats'
import { ArchetypePanel } from '@/components/ArchetypePanel'
import type { Card } from '@/types'
import { TYPE_NAMES, TYPE_COLORS } from '@/constants'

function FloorBadge({ floor }: { floor: number }) {
  const act = floor <= 17 ? 1 : floor <= 34 ? 2 : 3
  const actFloor = act === 1 ? floor : act === 2 ? floor - 17 : floor - 34
  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded-lg bg-xm-light text-xm-primary font-medium shrink-0">
      A{act}-{actFloor}
    </span>
  )
}

export default function AnalyzePage() {
  const {
    character, deck, archetypes, recommendation,
    addCard, removeCard, clearDeck, analyzeReward, setFloor, floor,
  } = useGameStore()
  const [tab, setTab] = useState<'deck' | 'reward' | 'stats'>('deck')
  const [search, setSearch] = useState('')
  const [rewardInput, setRewardInput] = useState('')
  const [groupMode, setGroupMode] = useState<'type' | 'cost' | 'rarity'>('type')
  const [dragId, setDragId] = useState<string | null>(null)

  if (!character) {
    return (
      <div className="text-center py-24">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-xm-light mb-4">
          <span className="text-2xl">📊</span>
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">请先选择角色</h2>
        <p className="text-text-muted">在首页选择一个角色后开始分析牌库</p>
      </div>
    )
  }

  const allCards = getCardsByCharacter(character)
  const filtered = search ? searchCards(search, character) : allCards
  const deckCards = deck.map(dc => ({ ...dc, card: allCards.find(c => c.id === dc.cardId) }))

  // Deck stats
  const stats = useMemo(() => {
    const typeCount: Record<string, number> = {}
    const costDist: Record<number, number> = {}
    const rarityCount: Record<string, number> = {}
    for (const dc of deck) {
      const card = getCardById(dc.cardId)
      if (!card) continue
      typeCount[card.type] = (typeCount[card.type] || 0) + 1
      const c = Math.max(0, card.cost)
      costDist[c] = (costDist[c] || 0) + 1
      rarityCount[card.rarity] = (rarityCount[card.rarity] || 0) + 1
    }
    return { typeCount, costDist, rarityCount, total: deck.length }
  }, [deck])

  // Group deck cards
  const groupedDeck = useMemo(() => {
    const groups: Record<string, typeof deckCards> = {}
    for (const dc of deckCards) {
      if (!dc.card) continue
      let key: string
      if (groupMode === 'type') key = TYPE_NAMES[dc.card.type] || dc.card.type
      else if (groupMode === 'cost') key = dc.card.cost <= 0 ? '0费' : `${dc.card.cost}费`
      else key = dc.card.rarity
      if (!groups[key]) groups[key] = []
      groups[key].push(dc)
    }
    return groups
  }, [deckCards, groupMode])

  const handleAddReward = () => {
    const ids = rewardInput.split(/[,\n\s]+/).map(s => s.trim()).filter(Boolean)
    if (ids.length > 0) analyzeReward(ids)
  }

  const handleDragStart = (cardId: string) => setDragId(cardId)
  const handleDragOver = (e: React.DragEvent) => e.preventDefault()
  const handleDrop = (_cardId: string) => {
    setDragId(null)
    // For now just visual feedback - reordering within deck is complex with zustand
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">📊 牌库分析</h1>
          <p className="text-sm text-text-muted mt-1">管理你的牌库，获取智能选牌推荐</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Floor progress bar */}
          <div className="flex items-center gap-2 bg-white rounded-xl border border-warm-200 px-3 py-2">
            <span className="text-xs text-text-muted">楼层</span>
            <input type="range" min={1} max={50} value={floor}
              onChange={e => setFloor(Number(e.target.value))}
              className="w-24 accent-xm-primary" />
            <input type="number" value={floor} min={1} max={50}
              onChange={e => setFloor(Number(e.target.value))}
              className="w-12 bg-transparent text-text-primary text-sm text-center outline-none" />
            <FloorBadge floor={floor} />
          </div>
          <button onClick={clearDeck} className="btn-secondary text-sm">清空牌库</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('deck')}
          className={`pill-tab ${tab === 'deck' ? 'active' : ''}`}>
          🃏 牌库管理 <span className="ml-1 text-xs opacity-70">({deck.length})</span>
        </button>
        <button onClick={() => setTab('reward')}
          className={`pill-tab ${tab === 'reward' ? 'active' : ''}`}>
          🎯 选牌推荐
        </button>
        <button onClick={() => setTab('stats')}
          className={`pill-tab ${tab === 'stats' ? 'active' : ''}`}>
          📈 牌库统计
        </button>
      </div>

      {/* Main content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left side */}
        <div className="lg:col-span-2">
          {tab === 'deck' && (
            <DeckManager
              filtered={filtered} deck={deck} search={search} setSearch={setSearch}
              addCard={addCard} removeCard={removeCard}
              groupMode={groupMode} setGroupMode={setGroupMode}
              groupedDeck={groupedDeck} dragId={dragId}
              handleDragStart={handleDragStart} handleDragOver={handleDragOver} handleDrop={handleDrop}
            />
          )}
          {tab === 'reward' && (
            <RewardAnalyzer
              rewardInput={rewardInput} setRewardInput={setRewardInput}
              handleAddReward={handleAddReward} recommendation={recommendation}
            />
          )}
          {tab === 'stats' && (
            <DeckStats stats={stats} deck={deck} />
          )}
        </div>

        {/* Right side */}
        <div className="space-y-4">
          <ArchetypePanel matches={archetypes} />

          {/* Current deck quick view */}
          <div className="xiaomi-card-static">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-text-primary">当前牌库 ({deck.length})</h4>
              {deck.length > 0 && (
                <div className="flex gap-1">
                  {Object.entries(stats.typeCount).map(([type, count]) => (
                    <span key={type} className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: TYPE_COLORS[type] + '20', color: TYPE_COLORS[type] }}>
                      {count}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {deckCards.length === 0 ? (
              <p className="text-sm text-text-muted">牌库为空，点击左侧卡牌添加</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {deckCards.map(dc => (
                  <span key={dc.cardId}
                    className="inline-flex items-center gap-1 text-xs bg-warm-100 text-text-secondary px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-xm-light hover:text-xm-primary transition-colors"
                    onClick={() => removeCard(dc.cardId)}>
                    {dc.card?.name || dc.cardId}
                    <span className="opacity-50 ml-0.5">✕</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
