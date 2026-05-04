import { useState } from 'react'
import { CHARACTER_IDS, CHARACTER_INFO, getCardById } from '@/data/cards'
import { getArchetypesByCharacter } from '@/data/archetypes'
import type { CharacterId, Archetype, Combo } from '@/types'

const DIFFICULTY_CONFIG = {
  beginner: { stars: '⭐', label: '新手友好', color: 'text-green-600 bg-green-50' },
  intermediate: { stars: '⭐⭐', label: '进阶', color: 'text-amber-600 bg-amber-50' },
  advanced: { stars: '⭐⭐⭐', label: '高级', color: 'text-red-600 bg-red-50' },
}

const POWER_COLORS = {
  low: { bg: 'bg-warm-100', text: 'text-text-muted', border: 'border-warm-200' },
  medium: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  high: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  game_winning: { bg: 'bg-xm-light', text: 'text-xm-primary', border: 'border-xm-primary/30' },
}

export default function LearnPage() {
  const [selectedChar, setSelectedChar] = useState<CharacterId | null>(null)
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype | null>(null)

  if (selectedArchetype) {
    return <ArchetypeDetail archetype={selectedArchetype} onBack={() => setSelectedArchetype(null)} />
  }

  if (selectedChar) {
    const archetypes = getArchetypesByCharacter(selectedChar)
    const info = CHARACTER_INFO[selectedChar]
    return (
      <div className="max-w-4xl mx-auto">
        <button onClick={() => setSelectedChar(null)} className="btn-secondary mb-6 text-sm">
          ← 返回角色选择
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">{info.name} 攻略</h1>
          <p className="text-text-secondary">{info.description}</p>
        </div>

        <h2 className="text-xl font-bold text-text-primary mb-4">流派一览</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {archetypes.map((a, i) => (
            <ArchetypeCard key={a.id} archetype={a} index={i} onClick={() => setSelectedArchetype(a)} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">📚 学习攻略</h1>
        <p className="text-text-secondary">选择角色，查看各流派攻略和核心卡牌</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {CHARACTER_IDS.map((id, i) => {
          const info = CHARACTER_INFO[id]
          const archetypes = getArchetypesByCharacter(id)
          return (
            <button key={id} onClick={() => setSelectedChar(id)}
              className="xiaomi-card flex flex-col items-center text-center py-8 px-4 group cursor-pointer animate-fade-in"
              style={{ animationDelay: `${i * 80}ms` }}>
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                {id === 'ironclad' ? '🗡️' : id === 'silent' ? '🗡️' : id === 'defect' ? '🔷' : id === 'watcher' ? '👁️' : id === 'necromancer' ? '💀' : '👑'}
              </div>
              <div className="font-bold text-text-primary group-hover:text-xm-primary transition-colors">
                {info.name}
                {info.isNew && (
                  <span className="ml-2 text-[10px] bg-xm-primary text-white px-2 py-0.5 rounded-full">NEW</span>
                )}
              </div>
              <div className="text-xs text-text-muted mt-1.5">{info.description}</div>
              <div className="text-[10px] text-text-muted mt-2 bg-warm-100 px-2 py-0.5 rounded-full">
                {archetypes.length} 个流派
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ArchetypeCard({ archetype, index, onClick }: { archetype: Archetype; index: number; onClick: () => void }) {
  const diff = DIFFICULTY_CONFIG[archetype.difficulty]
  const coreCount = archetype.coreCards.length
  const comboCount = archetype.combos.length

  return (
    <div onClick={onClick}
      className="xiaomi-card cursor-pointer group animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}>
      {/* Header with difficulty badge */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-bold text-lg text-text-primary group-hover:text-xm-primary transition-colors">
          {archetype.name}
        </h3>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${diff.color}`}>
          {diff.label}
        </span>
      </div>

      <p className="text-sm text-text-secondary mb-4 leading-relaxed line-clamp-2">
        {archetype.description}
      </p>

      {/* Stats row */}
      <div className="flex items-center gap-3 text-xs text-text-muted">
        <span className="flex items-center gap-1">🗡️ {coreCount}核心卡</span>
        <span className="flex items-center gap-1">🔗 {comboCount}Combo</span>
        <span className="flex items-center gap-1">{diff.stars}</span>
      </div>

      {/* Preferred ratio mini bar */}
      <div className="mt-3 flex h-2 rounded-full overflow-hidden bg-warm-100">
        <div className="bg-xm-primary" style={{ width: `${archetype.preferredRatio.attack * 100}%` }} />
        <div className="bg-sky-400" style={{ width: `${archetype.preferredRatio.skill * 100}%` }} />
        <div className="bg-purple-400" style={{ width: `${archetype.preferredRatio.power * 100}%` }} />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[9px] text-text-muted">⚔️ {Math.round(archetype.preferredRatio.attack * 100)}%</span>
        <span className="text-[9px] text-text-muted">🛡️ {Math.round(archetype.preferredRatio.skill * 100)}%</span>
        <span className="text-[9px] text-text-muted">⚡ {Math.round(archetype.preferredRatio.power * 100)}%</span>
      </div>
    </div>
  )
}

function ArchetypeDetail({ archetype, onBack }: { archetype: Archetype; onBack: () => void }) {
  const guide = archetype.guide
  const [activeSection, setActiveSection] = useState<string>('strategy')

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={onBack} className="btn-secondary mb-6 text-sm">← 返回</button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-text-primary">{archetype.name}</h1>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${DIFFICULTY_CONFIG[archetype.difficulty].color}`}>
            {DIFFICULTY_CONFIG[archetype.difficulty].label}
          </span>
        </div>
        <p className="text-text-secondary leading-relaxed">{archetype.description}</p>
      </div>

      {/* Quick nav tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { key: 'strategy', label: '🎯 核心策略' },
          { key: 'cards', label: '🗡️ 核心卡牌' },
          { key: 'progression', label: '📈 阶段攻略' },
          { key: 'combos', label: '🔗 Combo' },
          { key: 'tips', label: '💡 小贴士' },
        ].map(s => (
          <button key={s.key} onClick={() => setActiveSection(s.key)}
            className={`pill-tab text-xs whitespace-nowrap ${activeSection === s.key ? 'active' : ''}`}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        {activeSection === 'strategy' && (
          <>
            <Section title="🎯 核心策略" content={guide.coreStrategy} />
            <Section title="📖 总览" content={guide.overview} />
            {/* Type ratio visualization */}
            <div className="xiaomi-card-static">
              <h3 className="font-bold text-text-primary mb-4">📊 推荐卡牌比例</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex h-8 rounded-xl overflow-hidden bg-warm-100">
                    <div className="flex items-center justify-center text-white text-xs font-bold bg-xm-primary"
                      style={{ width: `${archetype.preferredRatio.attack * 100}%` }}>
                      ⚔️ {Math.round(archetype.preferredRatio.attack * 100)}%
                    </div>
                    <div className="flex items-center justify-center text-white text-xs font-bold bg-sky-400"
                      style={{ width: `${archetype.preferredRatio.skill * 100}%` }}>
                      🛡️ {Math.round(archetype.preferredRatio.skill * 100)}%
                    </div>
                    <div className="flex items-center justify-center text-white text-xs font-bold bg-purple-400"
                      style={{ width: `${archetype.preferredRatio.power * 100}%` }}>
                      ⚡ {Math.round(archetype.preferredRatio.power * 100)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeSection === 'cards' && (
          <div className="xiaomi-card-static">
            <h3 className="font-bold text-text-primary mb-4">🗡️ 核心卡牌</h3>
            <div className="space-y-3">
              {archetype.coreCards.map(cw => {
                const card = getCardById(cw.cardId)
                return (
                  <div key={cw.cardId} className="flex items-start justify-between gap-4 p-3 bg-warm-50 rounded-xl">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-text-primary">{card?.name || cw.cardId}</span>
                        <span className="tag-pill text-[10px] bg-xm-light text-xm-primary">权重 {cw.weight}</span>
                        {cw.isCore && <span className="text-[10px] px-1.5 py-0.5 rounded bg-xm-primary text-white">核心</span>}
                      </div>
                      <div className="text-xs text-text-muted mt-1">{cw.reason}</div>
                      {card && <div className="text-xs text-text-secondary mt-1">{card.description}</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeSection === 'progression' && (
          <div className="grid md:grid-cols-2 gap-5">
            <Section title="🌱 前期" content={guide.earlyGame} />
            <Section title="⚔️ 中期" content={guide.midGame} />
            <Section title="🏆 后期" content={guide.lateGame} />
          </div>
        )}

        {activeSection === 'combos' && (
          <ComboSection combos={archetype.combos} />
        )}

        {activeSection === 'tips' && (
          <>
            {guide.tips.length > 0 && (
              <div className="xiaomi-card-static">
                <h3 className="font-bold text-text-primary mb-4">💡 小贴士</h3>
                <ul className="space-y-2">
                  {guide.tips.map((tip, i) => (
                    <li key={i} className="text-sm text-text-secondary pl-4 relative">
                      <span className="absolute left-0 top-0 text-xm-primary">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {guide.commonMistakes.length > 0 && (
              <div className="xiaomi-card-static border-score-low/20">
                <h3 className="font-bold text-score-low mb-4">❌ 常见错误</h3>
                <ul className="space-y-2">
                  {guide.commonMistakes.map((m, i) => (
                    <li key={i} className="text-sm text-text-secondary pl-4 relative">
                      <span className="absolute left-0 top-0 text-score-low">•</span>
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function ComboSection({ combos }: { combos: Combo[] }) {
  if (combos.length === 0) return (
    <div className="xiaomi-card-static text-center py-8 text-text-muted">暂无Combo数据</div>
  )

  return (
    <div className="xiaomi-card-static">
      <h3 className="font-bold text-text-primary mb-4">🔗 Combo 组合</h3>
      <div className="space-y-4">
        {combos.map((combo, i) => {
          const powerConfig = POWER_COLORS[combo.power]
          return (
            <div key={combo.id} className={`p-4 rounded-xl border ${powerConfig.border} ${powerConfig.bg} animate-fade-in`}
              style={{ animationDelay: `${i * 100}ms` }}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-text-primary">{combo.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${powerConfig.text} ${powerConfig.bg}`}>
                  {combo.power === 'game_winning' ? '🏆 致胜' : combo.power === 'high' ? '💪 强力' : combo.power === 'medium' ? '⚡ 中等' : '🔹 辅助'}
                </span>
              </div>
              <p className="text-xs text-text-secondary mb-3 leading-relaxed">{combo.description}</p>

              {/* Combo flow diagram */}
              <div className="flex items-center gap-1 flex-wrap">
                {combo.cards.map((cardId, j) => {
                  const card = getCardById(cardId)
                  return (
                    <span key={cardId} className="flex items-center gap-1">
                      <span className="text-xs px-2 py-1 rounded-lg bg-white border border-warm-200 font-medium text-text-primary">
                        {card?.name || cardId}
                      </span>
                      {j < combo.cards.length - 1 && (
                        <span className="text-xm-primary font-bold text-sm">→</span>
                      )}
                    </span>
                  )
                })}
              </div>

              <div className="mt-2 text-xs text-xm-primary font-medium">📋 Setup: {combo.setup}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <div className="xiaomi-card-static">
      <h3 className="font-bold text-text-primary mb-3">{title}</h3>
      <p className="text-sm text-text-secondary leading-relaxed">{content}</p>
    </div>
  )
}