import { useState, useEffect } from 'react'
import type { Card } from '@/types'
import { getCardEffectClass } from './CardEffect'
import { TYPE_ICONS, TYPE_NAMES, RARITY_NAMES, RARITY_COLORS, RARITY_BORDER, RARITY_GLOW } from '@/constants'

function highlightText(text: string, query?: string) {
  if (!query) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-xm-secondary/30 text-text-primary rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  )
}

interface CardDisplayProps {
  card: Card
  selected?: boolean
  onClick?: () => void
  highlight?: string
  showFlip?: boolean
  compact?: boolean
  favorited?: boolean
  onFavorite?: (e: React.MouseEvent) => void
  showCompare?: boolean
  compared?: boolean
}

export function CardDisplay({
  card, selected, onClick, highlight, showFlip, compact, favorited, onFavorite, showCompare, compared,
}: CardDisplayProps) {
  const [flipped, setFlipped] = useState(false)
  const [hovered, setHovered] = useState(false)
  const effectClass = getCardEffectClass(card)

  useEffect(() => { setFlipped(false) }, [card.id])

  if (compact) {
    return (
      <div
        className={`card-display ${selected ? 'selected' : ''} ${effectClass} ${RARITY_BORDER[card.rarity] || ''}`}
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-text-primary truncate">{highlightText(card.name, highlight)}</span>
          <span className="text-xs bg-warm-100 text-text-secondary px-2 py-0.5 rounded-lg shrink-0 ml-2">
            {card.cost === -1 ? 'X' : card.cost}费
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-xs">{TYPE_ICONS[card.type]}</span>
          <span className={`text-xs ${RARITY_COLORS[card.rarity]}`}>{RARITY_NAMES[card.rarity]}</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className="relative perspective-[800px]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Favorite button */}
      {onFavorite && (
        <button
          onClick={onFavorite}
          className={`absolute -top-1.5 -right-1.5 z-20 w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all duration-200 ${
            favorited
              ? 'bg-xm-primary text-white shadow-lg scale-110'
              : 'bg-white border border-warm-200 text-text-muted hover:text-xm-primary hover:border-xm-primary/30'
          } ${hovered || favorited ? 'opacity-100' : 'opacity-0'}`}
          title={favorited ? '取消收藏' : '收藏'}
        >
          {favorited ? '★' : '☆'}
        </button>
      )}

      {/* Compare checkbox */}
      {showCompare && (
        <div className={`absolute -top-1.5 -left-1.5 z-20 ${hovered ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center text-xs transition-all ${
            compared ? 'bg-xm-primary border-xm-primary text-white' : 'border-warm-300 bg-white'
          }`}>
            {compared && '✓'}
          </div>
        </div>
      )}

      {/* Card flip container */}
      <div className={`transition-transform duration-500 [transform-style:preserve-3d] ${flipped ? '[transform:rotateY(180deg)]' : ''}`}>
        {/* Front face */}
        <div
          className={`card-display card-3d-tilt ${selected ? 'selected' : ''} ${effectClass} ${RARITY_BORDER[card.rarity] || 'border-warm-200'} ${RARITY_GLOW[card.rarity] || ''} [backface-visibility:hidden]`}
          onClick={onClick}
        >
          {/* Header: name + cost */}
          <div className="flex items-center justify-between mb-2.5">
            <span className="font-bold text-sm text-text-primary truncate mr-2">
              {highlightText(card.name, highlight)}
            </span>
            <div className="flex items-center gap-1.5">
              {showFlip && (
                <button
                  onClick={(e) => { e.stopPropagation(); setFlipped(true) }}
                  className="w-5 h-5 rounded-full bg-warm-100 text-text-muted text-[10px] flex items-center justify-center hover:bg-warm-200 transition-colors"
                  title="翻转查看详情"
                >
                  ↻
                </button>
              )}
              <span className="inline-flex items-center justify-center w-7 h-6 rounded-lg bg-warm-100 text-text-secondary text-xs font-medium shrink-0">
                {card.cost === -1 ? 'X' : card.cost}费
              </span>
            </div>
          </div>

          {/* Type + rarity */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">{TYPE_ICONS[card.type] || '📋'}</span>
            <span className="text-xs text-text-muted">{TYPE_NAMES[card.type] || card.type}</span>
            <span className={`text-xs font-medium ${RARITY_COLORS[card.rarity] || 'text-text-muted'}`}>
              · {RARITY_NAMES[card.rarity] || card.rarity}
            </span>
          </div>

          {/* Description */}
          <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
            {highlightText(card.description, highlight)}
          </p>

          {/* Tags */}
          {card.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2.5">
              {card.tags.slice(0, 3).map(tag => (
                <span key={tag} className="tag-pill">{tag}</span>
              ))}
              {card.tags.length > 3 && (
                <span className="tag-pill text-text-muted">+{card.tags.length - 3}</span>
              )}
            </div>
          )}

          {/* Keywords badges */}
          {card.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {card.keywords.map(kw => (
                <span key={kw} className="text-[10px] px-1.5 py-0.5 rounded bg-xm-light text-xm-primary font-medium">
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Back face (upgrade info) */}
        {showFlip && (
          <div
            className={`card-display absolute inset-0 ${RARITY_BORDER[card.rarity] || 'border-warm-200'} [backface-visibility:hidden] [transform:rotateY(180deg)] cursor-pointer`}
            onClick={(e) => { e.stopPropagation(); setFlipped(false) }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-sm text-xm-primary">⬆ 升级后</span>
              <button
                onClick={(e) => { e.stopPropagation(); setFlipped(false) }}
                className="w-5 h-5 rounded-full bg-warm-100 text-text-muted text-[10px] flex items-center justify-center hover:bg-warm-200"
              >
                ↻
              </button>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              {card.upgradedDescription || '暂无升级信息'}
            </p>
            <div className="mt-3 pt-2 border-t border-warm-200">
              <span className="text-[10px] text-text-muted">点击翻回正面</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
