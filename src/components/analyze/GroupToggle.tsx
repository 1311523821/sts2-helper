import type { Card, DeckCard } from '@/types'

export interface GroupToggleProps {
  groupMode: 'type' | 'cost' | 'rarity'
  setGroupMode: (mode: 'type' | 'cost' | 'rarity') => void
}

export function GroupToggle({ groupMode, setGroupMode }: GroupToggleProps) {
  return (
    <div className="flex bg-white border border-warm-200 rounded-xl overflow-hidden">
      {(['type', 'cost', 'rarity'] as const).map(mode => (
        <button key={mode} onClick={() => setGroupMode(mode)}
          className={`px-3 py-2 text-xs font-medium transition-colors ${
            groupMode === mode ? 'bg-xm-primary text-white' : 'text-text-muted hover:text-text-primary'
          }`}>
          {mode === 'type' ? '类型' : mode === 'cost' ? '费用' : '稀有度'}
        </button>
      ))}
    </div>
  )
}
