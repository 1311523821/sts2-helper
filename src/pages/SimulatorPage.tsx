import { useState, useMemo, useCallback, useEffect } from 'react'
import { CHARACTER_IDS, CHARACTER_INFO, getCardsByCharacter, getCardById } from '@/data/cards'
import { CardDisplay } from '@/components/CardDisplay'
import type { CharacterId, Card } from '@/types'

interface SimScenario {
  id: string
  character: CharacterId
  options: Card[]
  floor: number
  context: string
}

interface SimResult {
  scenarioId: string
  chosen: string
  recommended: string
  isCorrect: boolean
  timestamp: number
}

interface SimHistory {
  total: number
  correct: number
  streak: number
  bestStreak: number
  results: SimResult[]
}

function loadHistory(): SimHistory {
  try {
    const raw = localStorage.getItem('sts2-sim-history')
    return raw ? JSON.parse(raw) : { total: 0, correct: 0, streak: 0, bestStreak: 0, results: [] }
  } catch { return { total: 0, correct: 0, streak: 0, bestStreak: 0, results: [] } }
}

function saveHistory(h: SimHistory) {
  localStorage.setItem('sts2-sim-history', JSON.stringify(h))
}

function generateScenario(char: CharacterId): SimScenario {
  const cards = getCardsByCharacter(char)
  const shuffled = [...cards].sort(() => Math.random() - 0.5)
  const optionCount = Math.random() > 0.3 ? 3 : 2
  const options = shuffled.slice(0, optionCount)
  const floor = Math.floor(Math.random() * 40) + 1

  const contexts = [
    `第${floor}层 · 精英战斗后`,
    `第${floor}层 · 普通战斗后`,
    `第${floor}层 · 事件奖励`,
    `第${floor}层 · 商店选择`,
    `第${floor}层 · Boss掉落`,
  ]

  return {
    id: `sim-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    character: char,
    options,
    floor,
    context: contexts[Math.floor(Math.random() * contexts.length)],
  }
}

function simpleScore(card: Card, floor: number): number {
  let score = 50
  if (card.type === 'attack' && floor < 15) score += 15
  if (card.type === 'power' && floor > 20) score += 15
  if (card.rarity === 'rare') score += 20
  if (card.rarity === 'uncommon') score += 10
  if (card.cost <= 1) score += 8
  if (card.cost === 0) score += 5
  if (card.keywords.includes('draw')) score += 8
  if (card.keywords.includes('block')) score += 5
  if (card.tags.includes('消耗')) score -= 5
  return Math.min(100, Math.max(0, score + Math.floor(Math.random() * 10 - 5)))
}

export default function SimulatorPage() {
  const [character, setCharacter] = useState<CharacterId>('ironclad')
  const [scenario, setScenario] = useState<SimScenario | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [history, setHistory] = useState<SimHistory>(loadHistory())
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => { saveHistory(history) }, [history])

  const startNew = useCallback(() => {
    const s = generateScenario(character)
    setScenario(s)
    setSelected(null)
    setShowResult(false)
  }, [character])

  const handleSelect = useCallback((cardId: string) => {
    if (showResult) return
    setSelected(cardId)
    setShowResult(true)

    if (!scenario) return
    const scores = scenario.options.map(c => ({ id: c.id, score: simpleScore(c, scenario.floor) }))
    const best = scores.reduce((a, b) => a.score > b.score ? a : b)
    const isCorrect = cardId === best.id

    setHistory(prev => {
      const newStreak = isCorrect ? prev.streak + 1 : 0
      return {
        total: prev.total + 1,
        correct: prev.correct + (isCorrect ? 1 : 0),
        streak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak),
        results: [
          { scenarioId: scenario.id, chosen: cardId, recommended: best.id, isCorrect, timestamp: Date.now() },
          ...prev.results.slice(0, 49),
        ],
      }
    })
  }, [scenario, showResult])

  // Auto-start first scenario
  if (!scenario) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">🎮 选牌模拟器</h1>
          <p className="text-text-secondary">模拟选牌场景，训练你的选牌直觉</p>
        </div>

        {/* Character selection */}
        <div className="xiaomi-card-static mb-6">
          <h3 className="font-bold text-text-primary mb-4">选择角色</h3>
          <div className="flex flex-wrap gap-2">
            {CHARACTER_IDS.map(id => (
              <button key={id} onClick={() => setCharacter(id)}
                className={`pill-tab ${character === id ? 'active' : ''}`}>
                {CHARACTER_INFO[id].name}
              </button>
            ))}
          </div>
        </div>

        {/* Stats overview */}
        {history.total > 0 && (
          <div className="xiaomi-card-static mb-6">
            <h3 className="font-bold text-text-primary mb-4">📊 历史成绩</h3>
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-text-primary">{history.total}</div>
                <div className="text-xs text-text-muted">总次数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-xm-primary">{history.total > 0 ? Math.round(history.correct / history.total * 100) : 0}%</div>
                <div className="text-xs text-text-muted">正确率</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-xm-secondary">{history.streak}</div>
                <div className="text-xs text-text-muted">当前连胜</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">{history.bestStreak}</div>
                <div className="text-xs text-text-muted">最佳连胜</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={startNew} className="btn-primary text-base px-8 py-3">开始模拟</button>
          {history.results.length > 0 && (
            <button onClick={() => setShowHistory(!showHistory)} className="btn-secondary text-base px-6 py-3">
              {showHistory ? '隐藏' : '查看'}历史
            </button>
          )}
        </div>

        {/* History list */}
        {showHistory && history.results.length > 0 && (
          <div className="xiaomi-card-static mt-6">
            <h3 className="font-bold text-text-primary mb-4">最近记录</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {history.results.slice(0, 20).map((r, i) => {
                const chosenCard = getCardById(r.chosen)
                const recCard = getCardById(r.recommended)
                return (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${r.isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{r.isCorrect ? '✅' : '❌'}</span>
                      <span className="text-sm text-text-primary">选了 <strong>{chosenCard?.name || r.chosen}</strong></span>
                    </div>
                    {!r.isCorrect && (
                      <span className="text-xs text-text-muted">推荐: {recCard?.name || r.recommended}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  const scores = scenario.options.map(c => ({ card: c, score: simpleScore(c, scenario.floor) }))
  const best = scores.reduce((a, b) => a.score > b.score ? a : b)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">🎮 选牌模拟器</h1>
          <p className="text-sm text-text-muted mt-1">
            {CHARACTER_INFO[character].name} · {scenario.context}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-muted">连胜: {history.streak}</span>
          <span className="text-sm text-text-muted">正确率: {history.total > 0 ? Math.round(history.correct / history.total * 100) : 0}%</span>
        </div>
      </div>

      {/* Scenario display */}
      <div className="xiaomi-card-static mb-6 text-center">
        <div className="text-sm text-text-muted mb-2">{scenario.context}</div>
        <div className="text-lg font-bold text-text-primary">
          {showResult
            ? (selected === best.card.id ? '🎉 选择正确！' : '😅 不是最佳选择')
            : '🤔 你会选哪张？'}
        </div>
      </div>

      {/* Options */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {scores.map(({ card, score }) => {
          const isSelected = selected === card.id
          const isBest = card.id === best.card.id

          return (
            <div key={card.id}
              className={`relative transition-all duration-300 ${!showResult ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
              onClick={() => !showResult && handleSelect(card.id)}>
              <CardDisplay card={card} selected={isSelected && showResult} />

              {/* Result overlay */}
              {showResult && (
                <div className={`absolute inset-0 rounded-xl border-2 transition-all duration-500 ${
                  isBest ? 'border-green-400 bg-green-50/30' : isSelected ? 'border-red-400 bg-red-50/30' : 'border-transparent'
                }`}>
                  <div className="absolute top-2 right-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                      isBest ? 'bg-green-100 text-green-700' : isSelected ? 'bg-red-100 text-red-700' : 'bg-warm-100 text-text-muted'
                    }`}>
                      {isBest ? '⭐ 最佳' : isSelected ? '你的选择' : `${score}分`}
                    </span>
                  </div>
                  {isBest && (
                    <div className="absolute bottom-2 left-2 right-2 text-xs text-green-700 bg-green-50 rounded-lg p-2">
                      推荐理由: {card.rarity === 'rare' ? '稀有卡牌值得拿' : card.cost <= 1 ? '低费灵活' : '综合评分最高'}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Skip option */}
      {!showResult && (
        <div className="text-center mb-6">
          <button onClick={() => { setSelected('skip'); setShowResult(true) }}
            className="btn-secondary">
            ⏭ 跳过（都不选）
          </button>
        </div>
      )}

      {/* Next button */}
      {showResult && (
        <div className="text-center">
          <button onClick={startNew} className="btn-primary text-base px-8 py-3">
            下一题 →
          </button>
        </div>
      )}
    </div>
  )
}
