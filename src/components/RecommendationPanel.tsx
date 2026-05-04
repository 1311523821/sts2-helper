import type { Recommendation } from '@/services/cardScorer'

const TYPE_NAMES: Record<string, string> = {
  attack: '攻击牌', skill: '技能牌', power: '能力牌', status: '状态牌', curse: '诅咒牌', unknown: '未知',
}

function ScoreLevel(score: number) {
  if (score >= 60) return 'high'
  if (score >= 30) return 'medium'
  return 'low'
}

export function RecommendationPanel({ rec }: { rec: Recommendation }) {
  return (
    <div className="xiaomi-card-static">
      <h3 className="text-lg font-bold text-text-primary mb-4">📊 选牌推荐</h3>
      <div className="space-y-3">
        {rec.scores.map((s, i) => {
          const level = ScoreLevel(s.score)
          return (
            <div
              key={s.cardId}
              className={`p-4 rounded-xl border transition-all ${
                i === 0
                  ? 'border-xm-primary/30 bg-xm-light'
                  : 'border-warm-200 bg-white'
              }`}
            >
              {/* 头部：排名 + 名称 + 分数 */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`text-xs font-bold min-w-[3rem] ${
                      i === 0 ? 'text-xm-primary' : 'text-text-muted'
                    }`}
                  >
                    {i === 0 ? '⭐ 推荐' : `#${i + 1}`}
                  </span>
                  <span className="font-medium text-text-primary text-sm truncate">{s.cardName}</span>
                  <span className="text-xs text-text-muted shrink-0">{TYPE_NAMES[s.cardType] || s.cardType}</span>
                </div>
                <span className={`score-badge ${level}`}>{s.score}</span>
              </div>

              {/* 推荐理由 */}
              <div className="space-y-1 ml-[3rem]">
                {s.reasons.map((r, j) => (
                  <div key={j} className="text-xs text-text-secondary leading-relaxed">{r}</div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* 跳过选项 */}
      {rec.skipAnalysis.shouldSkip && (
        <div className="mt-4 p-4 rounded-xl border border-score-low/20 bg-red-50/50">
          <div className="flex items-center gap-2 mb-1">
            <span>🚫</span>
            <span className="font-medium text-score-low">建议跳过</span>
          </div>
          <p className="text-xs text-text-secondary mt-1">{rec.skipAnalysis.reason}</p>
        </div>
      )}
    </div>
  )
}
