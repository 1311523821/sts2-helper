import { useMemo } from 'react';
import type { Card } from '@/types';
import { getCardEffectClass, CARD_TYPE_COLORS } from './cardEffectUtils';

/**
 * 卡牌特效组件属性
 */
export interface CardEffectProps {
  card: Card;
  children: React.ReactNode;
  className?: string;
  isDragging?: boolean; // 是否正在拖拽
  isSelected?: boolean; // 是否被选中
  isHovered?: boolean; // 是否悬停状态
}

/**
 * 卡牌特效组件 - 根据卡牌类型和稀有度包装子元素并附加视觉特效
 */
export function CardEffect({
  card,
  children,
  className = '',
  isDragging = false,
  isSelected = false,
  isHovered = false,
}: CardEffectProps) {
  const effectClass = getCardEffectClass(card);
  const typeColor = CARD_TYPE_COLORS[card.type];

  // 计算交互状态类名
  const interactionClasses = useMemo(() => {
    const classes: string[] = [];
    if (isDragging) classes.push('card-effect-dragging');
    if (isSelected) classes.push('card-effect-selected');
    if (isHovered) classes.push('card-effect-hovered');
    return classes.join(' ');
  }, [isDragging, isSelected, isHovered]);

  // 合并所有类名
  const combinedClassName =
    `relative transition-all duration-300 ease-out ${effectClass} ${interactionClasses} ${className}`.trim();

  return (
    <div
      className={combinedClassName}
      style={
        typeColor
          ? ({
              '--card-bg': typeColor.bg,
              '--card-border': typeColor.border,
              '--card-glow': typeColor.glow,
            } as React.CSSProperties)
          : undefined
      }
    >
      {children}
    </div>
  );
}
