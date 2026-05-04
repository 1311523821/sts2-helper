import { useState, useMemo, useCallback, useEffect } from 'react'
import { CHARACTER_IDS, CHARACTER_INFO, getCardsByCharacter } from '@/data/cards'
import { CardDisplay } from '@/components/CardDisplay'
import type { CharacterId, CardType, Card, CardRarity } from '@/types'
import { TYPE_ICONS, TYPE_NAMES, RARITY_NAMES, RARITY_TAG_COLORS } from '@/constants'

const CARD_TYPES: { key: CardType | 'all'; label: string; icon: string }[] = [
  { key: 'all', label: '全部类型', icon: '📋' },
  { key: 'attack', label: '攻击牌', icon: '⚔️' },
  { key: 'skill', label: '技能牌', icon: '🛡️' },
  { key: 'power', label: '能力牌', icon: '⚡' },
  { key: 'status', label: '状态牌', icon: '💀' },
  { key: 'curse', label: '诅咒牌', icon: '☠️' },
]

const RARITIES: { key: CardRarity | 'all'; label: string }[] = [
  { key: 'all', label: '全部稀有度' },
  { key: 'basic', label: '基础' },
  { key: 'common', label: '普通' },
  { key: 'uncommon', label: '罕见' },
  { key: 'rare', label: '稀有' },
  { key: 'special', label: '特殊' },
]

const COST_RANGES: { key: string; label: string; min: number; max: number }[] = [
  { key: 'all', label: '全部费用', min: -1, max: 99 },
  { key: '0', label: '0费', min: 0, max: 0 },
  { key: '1', label: '1费', min: 1, max: 1 },
  { key: '2', label: '2费', min: 2, max: 2 },
  { key: '3+', label: '3+费', min: 3, max: 99 },
]

function loadFavorites(): Set<string> {
  try {
    const raw = localStorage.getItem('sts2-favorites')
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch { return new Set() }
}

function saveFavorites(favs: Set<string>) {
  localStorage.setItem('sts2-favorites', JSON.stringify([...favs]))
}

export default function EncyclopediaPage() {
  const [char, setChar] = useState<CharacterId>('ironclad')
  const [typeFilter, setTypeFilter] = useState<CardType | 'all'>('all')
  const [rarityFilter, setRarityFilter] = useState<CardRarity | 'all'>('all')
  const [costRange, setCostRange] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [compareCards, setCompareCards] = useState<Card[]>([])
  const [showCompare, setShowCompare] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(loadFavorites())
  const [showFavOnly, setShowFavOnly] = useState(false)

  useEffect(() => { saveFavorites(favorites) }, [favorites])

  const toggleFav = useCallback((id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setFavorites(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const toggleCompare = useCallback((card: Card, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setCompareCards(prev => {
      const exists = prev.find(c => c.id === card.id)
      if (exists) return prev.filter(c => c.id !== card.id)
      if (prev.length >= 3) return prev
      return [...prev, card]
    })
  }, [])

  const costRangeObj = COST_RANGES.find(c => c.key === costRange) || COST_RANGES[0]

  let cards = getCardsByCharacter(char)
  if (typeFilter !== 'all') cards = cards.filter(c => c.type === typeFilter)
  if (rarityFilter !== 'all') cards = cards.filter(c => c.rarity === rarityFilter)
  if (costRange !== 'all') cards = cards.filter(c => c.cost >= costRangeObj.min && c.cost <= costRangeObj.max)
  if (showFavOnly) cards = cards.filter(c => favorites.has(c.id))
  if (search) {
    const q = search.toLowerCase()
    cards = cards.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.nameEn.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.tags.some(t => t.includes(q))
    )
  }

  const info = CHARACTER_INFO[char]
  const charIcon = char === 'ironclad' ? '🗡️' : char === 'silent' ? '🗡️' : char === 'defect' ? '🔷' : char === 'watcher' ? '👁️' : char === 'necromancer' ? '💀' : '👑'

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">📖 卡牌图鉴</h1>
        <p className="text-text-secondary">浏览所有角色的卡牌，按类型、稀有度和费用筛选</p>
      </div>

      {/* 角色选择 */}
      <div className="flex flex-wrap gap-2 mb-5">
        {CHARACTER_IDS.map(id => (
          <button key={id} onClick={() => { setChar(id); setCompareCards([]) }}
            className={`pill-tab ${char === id ? 'active' : ''}`}>
            {id === 'ironclad' ? '🗡️ ' : id === 'silent' ? '🗡️ ' : id === 'defect' ? '🔷 ' : id === 'watcher' ? '👁️ ' : id === 'necromancer' ? '💀 ' : '👑 '}
            {CHARACTER_INFO[id].name}
          </button>
        ))}
      </div>

      {/* 搜索和筛选 */}
      <div className="xiaomi-card-static mb-6">
        <div className="flex flex-col gap-3">
          {/* 搜索框 */}
          <div className="relative">
            <input type="text" placeholder="搜索卡牌名称、描述、标签..." value={search}
              onChange={e => setSearch(e.target.value)} className="input-field pl-10" />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">🔍</span>
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary text-sm">✕</button>
            )}
          </div>

          {/* 筛选行 */}
          <div className="flex flex-wrap gap-2">
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)} className="input-field w-auto sm:w-36">
              {CARD_TYPES.map(t => <option key={t.key} value={t.key}>{t.icon} {t.label}</option>)}
            </select>
            <select value={rarityFilter} onChange={e => setRarityFilter(e.target.value as any)} className="input-field w-auto sm:w-36">
              {RARITIES.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
            </select>
            <select value={costRange} onChange={e => setCostRange(e.target.value)} className="input-field w-auto sm:w-36">
              {COST_RANGES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
            <button onClick={() => setShowFavOnly(!showFavOnly)}
              className={`pill-tab text-xs ${showFavOnly ? 'active' : ''}`}>
              ★ 收藏 ({favorites.size})
            </button>
            <button onClick={() => setShowCompare(!showCompare)}
              className={`pill-tab text-xs ${showCompare ? 'active' : ''}`}>
              ⚖ 对比 ({compareCards.length}/3)
            </button>
          </div>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-text-muted">
          {charIcon} {info.name} · 共 <strong className="text-text-secondary">{cards.length}</strong> 张卡牌
          {search && <span className="ml-2 text-xm-primary">搜索"{search}"</span>}
        </span>
      </div>

      {/* 卡牌网格 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {cards.map(card => (
          <div key={card.id} className="relative group">
            <CardDisplay
              card={card}
              highlight={search}
              showFlip
              onClick={() => setSelectedCard(card)}
              favorited={favorites.has(card.id)}
              onFavorite={(e) => toggleFav(card.id, e)}
              showCompare={showCompare}
              compared={compareCards.some(c => c.id === card.id)}
            />
            {showCompare && (
              <div className="absolute inset-0 cursor-pointer z-10" onClick={(e: React.MouseEvent) => toggleCompare(card, e)} />
            )}
          </div>
        ))}
      </div>

      {cards.length === 0 && (
        <div className="text-center py-16 text-text-muted">
          <div className="text-4xl mb-3">🔍</div>
          <p>没有找到匹配的卡牌</p>
          <button onClick={() => { setSearch(''); setTypeFilter('all'); setRarityFilter('all'); setCostRange('all'); setShowFavOnly(false) }}
            className="mt-3 text-sm text-xm-primary hover:underline">清除所有筛选</button>
        </div>
      )}

      {/* Compare panel */}
      {showCompare && compareCards.length >= 2 && (
        <ComparePanel cards={compareCards} onRemove={(id) => setCompareCards(prev => prev.filter(c => c.id !== id))} />
      )}

      {/* Card detail modal */}
      {selectedCard && (
        <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)}
          favorited={favorites.has(selectedCard.id)}
          onToggleFav={() => toggleFav(selectedCard.id)} />
      )}
    </div>
  )
}

function CardDetailModal({ card, onClose, favorited, onToggleFav }: {
  card: Card; onClose: () => void; favorited: boolean; onToggleFav: () => void
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-warm-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{TYPE_ICONS[card.type] || '📋'}</span>
              <div>
                <h2 className="text-xl font-bold text-text-primary">{card.name}</h2>
                <span className="text-sm text-text-muted">{card.nameEn}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={onToggleFav} className={`w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all ${
                favorited ? 'bg-xm-primary text-white' : 'bg-warm-100 text-text-muted hover:text-xm-primary'
              }`}>{favorited ? '★' : '☆'}</button>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-warm-100 text-text-muted hover:bg-warm-200 flex items-center justify-center">✕</button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Meta info */}
          <div className="flex flex-wrap gap-2">
            <span className={`tag-pill ${RARITY_TAG_COLORS[card.rarity]}`}>{RARITY_NAMES[card.rarity]}</span>
            <span className="tag-pill">{TYPE_NAMES[card.type]}</span>
            <span className="tag-pill bg-warm-100">{card.cost === -1 ? 'X' : card.cost}费</span>
          </div>

          {/* Description */}
          <div className="xiaomi-card-static">
            <h4 className="text-sm font-bold text-text-primary mb-2">📜 效果描述</h4>
            <p className="text-sm text-text-secondary leading-relaxed">{card.description}</p>
          </div>

          {/* Upgraded description */}
          {card.upgradedDescription && (
            <div className="xiaomi-card-static border-xm-primary/20 bg-xm-light/30">
              <h4 className="text-sm font-bold text-xm-primary mb-2">⬆ 升级后</h4>
              <p className="text-sm text-text-secondary leading-relaxed">{card.upgradedDescription}</p>
            </div>
          )}

          {/* Keywords */}
          {card.keywords.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-text-primary mb-2">🏷 关键词</h4>
              <div className="flex flex-wrap gap-1.5">
                {card.keywords.map(kw => (
                  <span key={kw} className="text-xs px-2.5 py-1 rounded-lg bg-xm-light text-xm-primary font-medium">{kw}</span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {card.tags.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-text-primary mb-2">🔖 标签</h4>
              <div className="flex flex-wrap gap-1.5">
                {card.tags.map(tag => (
                  <span key={tag} className="tag-pill">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ComparePanel({ cards, onRemove }: { cards: Card[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-warm-200 shadow-2xl p-4">
      <div className="max-w-6xl mx-auto">
        <h3 className="text-sm font-bold text-text-primary mb-3">⚖ 卡牌对比</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {cards.map(card => (
            <div key={card.id} className="p-3 bg-warm-50 rounded-xl border border-warm-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-text-primary">{card.name}</span>
                <button onClick={() => onRemove(card.id)} className="text-text-muted hover:text-red-500 text-xs">✕</button>
              </div>
              <div className="space-y-1 text-xs text-text-secondary">
                <div className="flex justify-between"><span>类型</span><span>{TYPE_ICONS[card.type]} {TYPE_NAMES[card.type]}</span></div>
                <div className="flex justify-between"><span>费用</span><span>{card.cost === -1 ? 'X' : card.cost}</span></div>
                <div className="flex justify-between"><span>稀有度</span><span>{RARITY_NAMES[card.rarity]}</span></div>
                <div className="flex justify-between"><span>关键词</span><span>{card.keywords.length}</span></div>
                <div className="flex justify-between"><span>标签</span><span>{card.tags.length}</span></div>
                <p className="mt-2 pt-2 border-t border-warm-200 line-clamp-3">{card.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
