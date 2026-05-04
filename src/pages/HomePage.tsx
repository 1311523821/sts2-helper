import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { CHARACTER_IDS, CHARACTER_INFO } from '@/data/cards'
import { useGameStore } from '@/stores/gameStore'
import type { CharacterId } from '@/types'

const CHAR_ICONS: Record<string, string> = {
  ironclad: '🗡️',
  silent: '🗡️',
  defect: '🔷',
  watcher: '👁️',
  necromancer: '💀',
  prince: '👑',
}

/* ---- 粒子组件 ---- */
function Particles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: `${Math.random() * 100}%`,
        duration: `${15 + Math.random() * 15}s`,
        delay: `${-Math.random() * 20}s`,
        size: 2 + Math.random() * 4,
      })),
    []
  )

  return (
    <div className="particles-container">
      {particles.map(p => (
        <span
          key={p.id}
          className="particle"
          style={{
            left: p.x,
            width: p.size,
            height: p.size,
            '--duration': p.duration,
            '--delay': p.delay,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

/* ---- 统计数据组件 ---- */
function StatsBar() {
  const stats = [
    { label: '卡牌总数', value: '300+', icon: '🃏' },
    { label: '可选角色', value: '6', icon: '👥' },
    { label: '流派分析', value: '20+', icon: '🎯' },
    { label: '攻略文章', value: '50+', icon: '📚' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className="stat-item opacity-0 xiaomi-card text-center py-5"
          style={{ animationDelay: `${0.1 + i * 0.1}s` }}
        >
          <div className="text-2xl mb-2">{stat.icon}</div>
          <div className="text-2xl font-bold text-gradient-primary">{stat.value}</div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
        </div>
      ))}
    </div>
  )
}

/* ---- 功能卡片数据 ---- */
const FEATURES = [
  {
    icon: '🎯',
    title: '选牌推荐',
    desc: '输入当前牌库和可选卡牌，智能评分系统为你推荐最佳选择，附带详细理由',
    delay: '0.1s',
    link: '/analyze',
  },
  {
    icon: '📚',
    title: '学习攻略',
    desc: '各角色流派详解、核心卡牌、Combo组合，帮助新手快速上手',
    delay: '0.2s',
    link: '/learn',
  },
  {
    icon: '📖',
    title: '卡牌图鉴',
    desc: '浏览所有角色的卡牌数据库，按类型、稀有度筛选，快速查找',
    delay: '0.3s',
    link: '/encyclopedia',
  },
  {
    icon: '🎮',
    title: '选牌模拟',
    desc: '模拟选牌场景，训练你的选牌直觉，查看历史成绩和正确率',
    delay: '0.4s',
    link: '/simulator',
  },
  {
    icon: '📈',
    title: '数据统计',
    desc: '卡牌数据库分析、流派统计、热门Combo一览',
    delay: '0.5s',
    link: '/stats',
  },
]

export default function HomePage() {
  const navigate = useNavigate()
  const setCharacter = useGameStore(s => s.setCharacter)

  const handleSelect = (id: CharacterId) => {
    setCharacter(id)
    navigate('/analyze')
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* 主视觉 Hero */}
      <div className="relative text-center mb-16 pt-8 overflow-hidden rounded-3xl">
        <Particles />

        {/* 渐变背景装饰 */}
        <div
          className="absolute inset-0 -z-10 opacity-30"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(255,107,53,0.15) 0%, transparent 60%)',
          }}
        />

        <div className="relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-xm-light mb-6 animate-float">
            <span className="text-4xl">🗡️</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight" style={{ color: 'var(--text-primary)' }}>
            杀戮尖塔2
            <span className="ml-3 text-gradient-primary">智能选牌助手</span>
          </h1>

          <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            分析你的牌库，识别最佳流派方向，为每一次选牌提供智能推荐
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={() => navigate('/analyze')}
              className="btn-primary text-base px-8 py-3"
            >
              开始分析
            </button>
            <button
              onClick={() => navigate('/learn')}
              className="btn-secondary text-base px-8 py-3"
            >
              学习攻略
            </button>
          </div>
        </div>
      </div>

      {/* 统计数据 */}
      <StatsBar />

      {/* 角色选择区 */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>选择角色</h2>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>选择一个角色开始分析你的牌库</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CHARACTER_IDS.map((id, i) => {
            const info = CHARACTER_INFO[id]
            return (
              <button
                key={id}
                onClick={() => handleSelect(id)}
                className="xiaomi-card card-3d-tilt flex flex-col items-center text-center py-8 px-4 group cursor-pointer animate-fade-in-up opacity-0"
                style={{ animationDelay: `${0.05 + i * 0.08}s`, animationFillMode: 'forwards' }}
              >
                <div className="text-4xl mb-3 group-hover:scale-110 group-hover:animate-bounce-subtle transition-transform duration-300">
                  {CHAR_ICONS[id]}
                </div>
                <div className="font-bold group-hover:text-xm-primary transition-colors" style={{ color: 'var(--text-primary)' }}>
                  {info.name}
                  {info.isNew && (
                    <span className="ml-2 text-[10px] bg-xm-primary text-white px-2 py-0.5 rounded-full align-middle">
                      NEW
                    </span>
                  )}
                </div>
                <div className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{info.description}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 功能介绍 */}
      <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-5">
        {FEATURES.map((feat) => (
          <div
            key={feat.title}
            className="xiaomi-card cursor-pointer card-3d-tilt animate-fade-in-up opacity-0"
            style={{ animationDelay: feat.delay, animationFillMode: 'forwards' }}
            onClick={() => navigate(feat.link)}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-xm-light flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                {feat.icon}
              </div>
              <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{feat.title}</h3>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
