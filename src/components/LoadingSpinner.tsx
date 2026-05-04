import { useMemo } from 'react'

/**
 * LoadingSpinner - 杀戮尖塔风格加载动画
 *
 * 提供两种动画模式:
 *   "card"   - 卡牌3D翻转（默认）
 *   "sword"  - 剑盾交叉旋转
 */
interface LoadingSpinnerProps {
  /** 动画模式: "card" | "sword" */
  variant?: 'card' | 'sword'
  /** 自定义提示文字 */
  text?: string
  /** 是否全屏覆盖 */
  fullScreen?: boolean
}

export function LoadingSpinner({
  variant = 'card',
  text = '加载中...',
  fullScreen = false,
}: LoadingSpinnerProps = {}) {
  return fullScreen ? (
    <div className="sts-loader-overlay">
      {variant === 'card' ? <CardFlipAnimation /> : <SwordShieldAnimation />}
      <span className="loader-text">{text}</span>
    </div>
  ) : (
    <div className="flex items-center justify-center py-24">
      <div className="flex flex-col items-center gap-5">
        {variant === 'card' ? <CardFlipAnimation /> : <SwordShieldAnimation />}
        <p className="text-sm text-text-muted animate-pulse">{text}</p>
      </div>
    </div>
  )
}

/* ============================================================
   卡牌翻转动画
   ============================================================ */
function CardFlipAnimation() {
  const particles = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        id: i,
        x: `${30 + Math.random() * 40}%`,
        y: `${30 + Math.random() * 40}%`,
        delay: `${i * 0.3}s`,
        size: 3 + Math.random() * 3,
      })),
    []
  )

  return (
    <div className="relative w-16 h-20">
      {/* 粒子光效 */}
      {particles.map(p => (
        <span
          key={p.id}
          className="absolute rounded-full bg-xm-primary/30 pointer-events-none"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            animation: `ripple 1.5s ease-out ${p.delay} infinite`,
          }}
        />
      ))}

      {/* 卡牌容器 - 3D翻转 */}
      <div className="card-flip-container absolute inset-0">
        {/* 卡牌正面 */}
        <div className="card-face card-front">
          <span className="text-xl">🃏</span>
        </div>
        {/* 卡牌背面 */}
        <div className="card-face card-back">
          <span className="text-xl">⚔️</span>
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   剑盾交叉旋转动画
   ============================================================ */
function SwordShieldAnimation() {
  return (
    <div className="relative w-14 h-14">
      {/* 外圈光环 */}
      <div className="absolute inset-0 rounded-full border-2 border-xm-primary/20 animate-spin-slow" />

      {/* 剑 - 右上到左下 */}
      <span
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl animate-float"
        style={{ transform: 'translate(-50%, -50%) rotate(-45deg)' }}
      >
        ⚔️
      </span>

      {/* 盾 - 左下到右上 */}
      <span
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl"
        style={{
          animation: 'float 6s ease-in-out 2s infinite',
          transform: 'translate(-50%, -50%) rotate(45deg)',
        }}
      >
        🛡️
      </span>
    </div>
  )
}

/* ============================================================
   CSS 样式（通过 style 标签注入一次）
   ============================================================ */
const styleId = 'sts-loader-styles'

// Inject styles once
if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
  const style = document.createElement('style')
  style.id = styleId
  style.textContent = `
    /* 卡牌3D翻转容器 */
    .card-flip-container {
      perspective: 800px;
      animation: cardFloat 2s ease-in-out infinite;
    }

    @keyframes cardFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }

    .card-face {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      transition: transform 0.8s ease;
      box-shadow: 0 2px 12px rgba(255, 107, 53, 0.15);
    }

    .card-front {
      background: linear-gradient(135deg, #FFFAF5, #FFF0E6);
      border: 2px solid rgba(255, 107, 53, 0.3);
      transform: rotateY(0deg);
    }

    .card-back {
      background: linear-gradient(135deg, #FF6B35, #E85D2C);
      border: 2px solid rgba(255, 107, 53, 0.5);
      transform: rotateY(180deg);
    }

    .card-flip-container:hover .card-front {
      transform: rotateY(180deg);
    }

    .card-flip-container:hover .card-back {
      transform: rotateY(360deg);
    }

    /* 自动循环翻转 */
    .card-flip-container {
      animation: cardFloat 2s ease-in-out infinite,
                 cardFlip 3s ease-in-out infinite;
    }

    .card-flip-container .card-front {
      animation: frontFlip 3s ease-in-out infinite;
    }

    .card-flip-container .card-back {
      animation: backFlip 3s ease-in-out infinite;
    }

    @keyframes frontFlip {
      0%, 100% { transform: rotateY(0deg); }
      50% { transform: rotateY(180deg); }
    }

    @keyframes backFlip {
      0%, 100% { transform: rotateY(180deg); }
      50% { transform: rotateY(360deg); }
    }

    /* 暗色主题适配 */
    .dark .card-front {
      background: linear-gradient(135deg, #2D2D3F, #363649);
      border-color: rgba(255, 107, 53, 0.4);
    }

    .dark .card-back {
      background: linear-gradient(135deg, #E85D2C, #D44A1A);
    }
  `
  document.head.appendChild(style)
}
