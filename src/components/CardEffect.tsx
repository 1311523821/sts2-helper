import type { Card } from '@/types'
import { getCardEffectClass, CARD_TYPE_COLORS } from './cardEffectUtils'

/**
 * 卡牌特效组件 - 根据卡牌类型和稀有度包装子元素并附加视觉特效
 */
export function CardEffect({
  card,
  children,
  className = '',
}: {
  card: Card
  children: React.ReactNode
  className?: string
}) {
  const effectClass = getCardEffectClass(card)
  const typeColor = CARD_TYPE_COLORS[card.type]

  return (
    <div
      className={`relative ${effectClass} ${className}`}
      style={
        typeColor
          ? {
              '--card-bg': typeColor.bg,
              '--card-border': typeColor.border,
              '--card-glow': typeColor.glow,
            } as React.CSSProperties
          : undefined
      }
    >
      {children}
    </div>
  )
}
