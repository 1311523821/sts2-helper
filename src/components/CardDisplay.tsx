import { useState, useEffect, useMemo } from 'react';
import type { Card } from '@/types';
import { TYPE_ICONS, TYPE_NAMES, RARITY_NAMES } from '@/constants';
import { getKeywordById } from '@/data/keywords';

function highlightText(text: string, query?: string) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-xm-secondary/30 text-text-primary rounded px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

interface CardDisplayProps {
  card: Card;
  selected?: boolean;
  onClick?: () => void;
  highlight?: string;
  showFlip?: boolean;
  compact?: boolean;
  favorited?: boolean;
  onFavorite?: (e: React.MouseEvent) => void;
  showCompare?: boolean;
  compared?: boolean;
}

function resolveKeyword(kw: string): { icon: string; name: string } {
  const data = getKeywordById(kw);
  return data ? { icon: data.icon, name: data.name } : { icon: '', name: kw };
}

/**
 * 获取费用宝石颜色
 * 0费金色，1-2费蓝色，3+费深蓝/紫色
 */
function getCostGemColors(cost: number): { primary: string; secondary: string; glow: string } {
  if (cost === 0) {
    return {
      primary: '#fbbf24',
      secondary: '#f59e0b',
      glow: 'rgba(251, 191, 36, 0.5)',
    };
  }
  if (cost <= 2) {
    return {
      primary: '#60a5fa',
      secondary: '#3b82f6',
      glow: 'rgba(96, 165, 250, 0.4)',
    };
  }
  // 3+ 费用深蓝/紫色
  return {
    primary: '#8b5cf6',
    secondary: '#7c3aed',
    glow: 'rgba(139, 92, 246, 0.5)',
  };
}

/**
 * 六边形费用宝石组件
 */
function CostGem({ cost, size = 36 }: { cost: number; size?: number }) {
  const colors = getCostGemColors(cost);
  const displayCost = cost === -1 ? 'X' : cost;

  // 六边形路径 (正六边形)
  const hexPoints = useMemo(() => {
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 2;
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  }, [size]);

  return (
    <div
      className="cost-gem"
      style={{
        width: size,
        height: size,
        filter: `drop-shadow(0 2px 4px ${colors.glow})`,
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={`gem-gradient-${cost}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.primary} />
            <stop offset="100%" stopColor={colors.secondary} />
          </linearGradient>
          <linearGradient id="gem-highlight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.5" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <filter id="gem-inner-shadow">
            <feOffset dx="0" dy="1" />
            <feGaussianBlur stdDeviation="1" result="offset-blur" />
            <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
            <feFlood floodColor="rgba(0,0,0,0.3)" result="color" />
            <feComposite operator="in" in="color" in2="inverse" result="shadow" />
            <feComposite operator="over" in="shadow" in2="SourceGraphic" />
          </filter>
        </defs>
        {/* 六边形背景 */}
        <polygon
          points={hexPoints}
          fill={`url(#gem-gradient-${cost})`}
          filter="url(#gem-inner-shadow)"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1"
        />
        {/* 高光效果 */}
        <polygon points={hexPoints} fill="url(#gem-highlight)" opacity="0.3" />
      </svg>
      {/* 费用数字 */}
      <span
        className="absolute inset-0 flex items-center justify-center font-bold text-white text-sm"
        style={{
          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
        }}
      >
        {displayCost}
      </span>
    </div>
  );
}

/**
 * 获取卡牌类型边框颜色
 */
function getTypeBorderColor(type: string): string {
  switch (type) {
    case 'attack':
      return 'var(--card-attack, #d94437)';
    case 'skill':
      return 'var(--card-skill, #2b7db5)';
    case 'power':
      return 'var(--card-power, #c9a227)';
    default:
      return 'var(--border-color, #5a5a6e)';
  }
}

/**
 * 获取稀有度边框颜色
 */
function getRarityBorderColor(rarity: string): string {
  switch (rarity) {
    case 'basic':
      return 'var(--rarity-basic, #5a5a6e)';
    case 'common':
      return 'var(--rarity-common, #c8c8c8)';
    case 'uncommon':
      return 'var(--rarity-uncommon, #2e8b57)';
    case 'rare':
      return 'var(--rarity-rare, #4169e1)';
    case 'special':
      return 'var(--rarity-special, #9932cc)';
    default:
      return 'var(--border-color, #5a5a6e)';
  }
}

/**
 * 获取稀有度光效类名
 */
function getRarityGlowClass(rarity: string): string {
  switch (rarity) {
    case 'uncommon':
      return 'card-glow-uncommon';
    case 'rare':
      return 'card-glow-rare';
    case 'special':
      return 'card-glow-special';
    default:
      return '';
  }
}

/**
 * 获取卡牌类型特效类名
 */
function getTypeEffectClass(type: string): string {
  switch (type) {
    case 'attack':
      return 'card-type-attack';
    case 'skill':
      return 'card-type-skill';
    case 'power':
      return 'card-type-power';
    default:
      return '';
  }
}

export function CardDisplay({
  card,
  selected,
  onClick,
  highlight,
  showFlip,
  compact,
  favorited,
  onFavorite,
  showCompare,
  compared,
}: CardDisplayProps) {
  const [flipped, setFlipped] = useState(false);
  const [hovered, setHovered] = useState(false);

  const typeBorderColor = getTypeBorderColor(card.type);
  const rarityBorderColor = getRarityBorderColor(card.rarity);
  const rarityGlowClass = getRarityGlowClass(card.rarity);
  const typeEffectClass = getTypeEffectClass(card.type);

  useEffect(() => {
    setFlipped(false);
  }, [card.id]);

  // 紧凑模式
  if (compact) {
    return (
      <div
        className={`card-display card-compact ${selected ? 'selected' : ''} ${rarityGlowClass}`}
        onClick={onClick}
        style={{
          borderColor: rarityBorderColor,
          borderWidth: '2px',
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-text-primary truncate">
            {highlightText(card.name, highlight)}
          </span>
          <span className="text-xs bg-warm-100 text-text-secondary px-2 py-0.5 rounded-lg shrink-0 ml-2">
            {card.cost === -1 ? 'X' : card.cost}费
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-xs">{TYPE_ICONS[card.type]}</span>
          <span className="text-xs" style={{ color: rarityBorderColor }}>
            {RARITY_NAMES[card.rarity]}
          </span>
        </div>
      </div>
    );
  }

  const kw0 = card.keywords[0] ? resolveKeyword(card.keywords[0]) : null;
  const kw1 = card.keywords[1] ? resolveKeyword(card.keywords[1]) : null;

  return (
    <div
      className="relative perspective-[800px]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* 收藏按钮 */}
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

      {/* 比较复选框 */}
      {showCompare && (
        <div
          className={`absolute -top-1.5 -left-1.5 z-20 ${hovered ? 'opacity-100' : 'opacity-0'} transition-opacity`}
        >
          <div
            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center text-xs transition-all ${
              compared ? 'bg-xm-primary border-xm-primary text-white' : 'border-warm-300 bg-white'
            }`}
          >
            {compared && '✓'}
          </div>
        </div>
      )}

      {/* 卡牌翻转容器 */}
      <div
        className={`transition-transform duration-500 [transform-style:preserve-3d] ${flipped ? '[transform:rotateY(180deg)]' : ''}`}
      >
        {/* 正面 */}
        <div
          className={`card-display card-sts-style ${selected ? 'selected' : ''} ${typeEffectClass} ${rarityGlowClass} [backface-visibility:hidden]`}
          onClick={onClick}
          style={{
            borderColor: typeBorderColor,
            borderWidth: '3px',
          }}
        >
          {/* 六边形费用宝石 - 左上角部分伸出 */}
          <div className="absolute -top-2 -left-2 z-10">
            <CostGem cost={card.cost} size={40} />
          </div>

          {/* 卡牌内容区域 */}
          <div className="pt-4">
            {/* 头部：名称 + 翻转按钮 */}
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-text-primary truncate mr-2 pl-6">
                {highlightText(card.name, highlight)}
              </span>
              {showFlip && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFlipped(true);
                  }}
                  className="w-5 h-5 rounded-full bg-warm-100 text-text-muted text-[10px] flex items-center justify-center hover:bg-warm-200 transition-colors shrink-0"
                  title="翻转查看详情"
                >
                  ↻
                </button>
              )}
            </div>

            {/* 艺术区域 */}
            <div
              className="relative rounded-lg mb-2.5 flex items-center justify-center overflow-hidden card-art-area"
              style={{
                height: '72px',
                background: `linear-gradient(135deg, ${typeBorderColor}15, ${typeBorderColor}30)`,
                border: `1px solid ${typeBorderColor}40`,
              }}
            >
              {/* 类型图标作为卡牌艺术 */}
              <div className="flex items-center gap-3">
                <span
                  className="text-3xl drop-shadow-lg"
                  style={{ filter: `drop-shadow(0 0 8px ${typeBorderColor}60)` }}
                >
                  {TYPE_ICONS[card.type] || '📋'}
                </span>
                {kw0 && <span className="text-2xl opacity-70 drop-shadow">{kw0.icon}</span>}
                {kw1 && <span className="text-2xl opacity-40 drop-shadow">{kw1.icon}</span>}
              </div>

              {/* 稀有度徽章 - 右上角 */}
              <span
                className="absolute top-1 right-1 text-[9px] px-1.5 py-0.5 rounded font-medium"
                style={{
                  background: `${rarityBorderColor}cc`,
                  color: '#fff',
                  boxShadow: `0 0 6px ${rarityBorderColor}60`,
                }}
              >
                {RARITY_NAMES[card.rarity] || card.rarity}
              </span>

              {/* 类型标签 - 左下角 */}
              <span
                className="absolute bottom-1 left-1 text-[9px] px-1.5 py-0.5 rounded"
                style={{
                  background: 'rgba(0,0,0,0.25)',
                  color: '#fff',
                }}
              >
                {TYPE_NAMES[card.type] || card.type}
              </span>
            </div>

            {/* 描述区域 */}
            <p className="text-xs text-text-secondary leading-relaxed line-clamp-3 min-h-[2.5rem]">
              {highlightText(card.description, highlight)}
            </p>

            {/* 标签 */}
            {card.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {card.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="tag-pill">
                    {tag}
                  </span>
                ))}
                {card.tags.length > 3 && (
                  <span className="tag-pill text-text-muted">+{card.tags.length - 3}</span>
                )}
              </div>
            )}

            {/* 关键词徽章 - 金色高亮 */}
            {card.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {card.keywords.map((kw) => {
                  const kwData = getKeywordById(kw);
                  return (
                    <span
                      key={kw}
                      className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded font-medium keyword-badge"
                    >
                      {kwData && <span>{kwData.icon}</span>}
                      {kwData?.name || kw}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 背面（升级信息） */}
        {showFlip && (
          <div
            className={`card-display card-sts-style [backface-visibility:hidden] [transform:rotateY(180deg)] cursor-pointer absolute inset-0`}
            onClick={(e) => {
              e.stopPropagation();
              setFlipped(false);
            }}
            style={{
              borderColor: typeBorderColor,
              borderWidth: '3px',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-sm text-xm-primary">⬆ 升级后</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFlipped(false);
                }}
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
  );
}
