import type { Card, DeckCard } from '@/types'
import { CardDisplay } from '@/components/CardDisplay'
import { GroupToggle } from './GroupToggle'

interface DeckCardWithInfo extends DeckCard {
  card?: Card
}

export interface DeckManagerProps {
  filtered: Card[]
  deck: DeckCard[]
  search: string
  setSearch: (s: string) => void
  addCard: (cardId: string) => void
  removeCard: (cardId: string) => void
  groupMode: 'type' | 'cost' | 'rarity'
  setGroupMode: (mode: 'type' | 'cost' | 'rarity') => void
  groupedDeck: Record<string, DeckCardWithInfo[]>
  dragId: string | null
  handleDragStart: (cardId: string) => void
  handleDragOver: (e: React.DragEvent) => void
  handleDrop: (cardId: string) => void
}

export function DeckManager({
  filtered, deck, search, setSearch,
  addCard, removeCard,
  groupMode, setGroupMode,
  groupedDeck, dragId,
  handleDragStart, handleDragOver, handleDrop,
}: DeckManagerProps) {
  return (
    <div>
      {/* Search + Group toggle */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <input type="text" placeholder="搜索卡牌..." value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)} className="input-field pl-10" />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">🔍</span>
        </div>
        <GroupToggle groupMode={groupMode} setGroupMode={setGroupMode} />
      </div>

      {/* Grouped deck display */}
      {deck.length > 0 && (
        <div className="mb-4 space-y-2">
          {Object.entries(groupedDeck).map(([group, cards]) => (
            <div key={group} className="bg-warm-50 rounded-xl p-3 border border-warm-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-text-primary">{group}</span>
                <span className="text-[10px] bg-warm-200 text-text-muted px-1.5 py-0.5 rounded">{cards.length}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {cards.map((dc) => (
                  <span key={dc.cardId} draggable
                    onDragStart={() => handleDragStart(dc.cardId)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(dc.cardId)}
                    className={`inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg cursor-pointer transition-all ${
                      dragId === dc.cardId ? 'bg-xm-primary text-white scale-105' : 'bg-white text-text-secondary hover:bg-xm-light hover:text-xm-primary border border-warm-200'
                    }`}>
                    {dc.card?.name || dc.cardId}
                    <span className="opacity-50 ml-0.5" onClick={() => removeCard(dc.cardId)}>✕</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Card grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[50vh] overflow-y-auto pr-2">
        {filtered.map((card) => {
          const inDeck = deck.some((dc) => dc.cardId === card.id)
          return (
            <CardDisplay key={card.id} card={card} selected={inDeck}
              onClick={() => inDeck ? removeCard(card.id) : addCard(card.id)} />
          )
        })}
      </div>
    </div>
  )
}
