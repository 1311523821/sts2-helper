import type { DeckCard, CardType, CardRarity } from '@/types'
import { TYPE_NAMES, TYPE_COLORS, RARITY_BG_COLORS, RARITY_NAMES } from '@/constants'

interface DeckStatsData {
  typeCount: Record<string, number>
  costDist: Record<number, number>
  rarityCount: Record<string, number>
  total: number
}

export interface DeckStatsProps {
  stats: DeckStatsData
  deck: DeckCard[]
}

export function DeckStats({ stats, deck }: DeckStatsProps) {
  const maxCost = Math.max(1, ...Object.values(stats.costDist).map(Number))
  const maxType = Math.max(1, ...Object.values(stats.typeCount).map(Number))

  return (
    <div className="space-y-4">
      {/* Overview cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="xiaomi-card-static text-center">
          <div className="text-2xl font-bold text-xm-primary">{stats.total}</div>
          <div className="text-xs text-text-muted mt-1">总卡牌数</div>
        </div>
        <div className="xiaomi-card-static text-center">
          <div className="text-2xl font-bold text-xm-secondary">{Object.keys(stats.typeCount).length}</div>
          <div className="text-xs text-text-muted mt-1">卡牌类型</div>
        </div>
        <div className="xiaomi-card-static text-center">
          <div className="text-2xl font-bold text-text-primary">
            {stats.total > 0
              ? (Object.entries(stats.costDist).reduce((sum, [cost, count]) => sum + Number(cost) * count, 0) / stats.total).toFixed(1)
              : '0'}
          </div>
          <div className="text-xs text-text-muted mt-1">平均费用</div>
        </div>
      </div>

      {/* Cost curve bar chart */}
      <div className="xiaomi-card-static">
        <h4 className="font-bold text-text-primary mb-4">💰 费用曲线</h4>
        <div className="flex items-end gap-2 h-32">
          {Object.entries(stats.costDist).sort(([a], [b]) => Number(a) - Number(b)).map(([cost, count]) => (
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

      {/* Type distribution */}
      <div className="xiaomi-card-static">
        <h4 className="font-bold text-text-primary mb-4">🎯 类型分布</h4>
        <div className="space-y-3">
          {Object.entries(stats.typeCount).map(([type, count]) => (
            <div key={type}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-text-primary">{TYPE_NAMES[type as CardType] || type}</span>
                <span className="text-xs text-text-muted">{count}张 ({stats.total > 0 ? Math.round(count / stats.total * 100) : 0}%)</span>
              </div>
              <div className="h-3 bg-warm-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(count / maxType) * 100}%`,
                    backgroundColor: TYPE_COLORS[type as CardType] || '#B8A08E',
                  }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rarity distribution */}
      <div className="xiaomi-card-static">
        <h4 className="font-bold text-text-primary mb-4">💎 稀有度分布</h4>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(stats.rarityCount).map(([rarity, count]) => (
            <div key={rarity} className="flex items-center gap-2 p-2 bg-warm-50 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${RARITY_BG_COLORS[rarity as CardRarity] || 'bg-warm-300'}`} />
              <span className="text-sm text-text-primary flex-1">{RARITY_NAMES[rarity as CardRarity] || rarity}</span>
              <span className="text-sm font-bold text-text-primary">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
