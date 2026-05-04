import type { ArchetypeMatch } from '@/types'

function ScoreLevel(score: number) {
  if (score >= 60) return 'high'
  if (score >= 30) return 'medium'
  return 'low'
}

export function ArchetypePanel({ matches }: { matches: ArchetypeMatch[] }) {
  if (matches.length === 0) {
    return (
      <div className="xiaomi-card-static">
        <h3 className="text-lg font-bold text-text-primary mb-3">🎯 流派匹配度</h3>
        <p className="text-sm text-text-muted">牌库中还没有足够的卡牌来识别流派方向</p>
      </div>
    )
  }

  return (
    <div className="xiaomi-card-static">
      <h3 className="text-lg font-bold text-text-primary mb-4">🎯 流派匹配度</h3>
      <div className="space-y-5">
        {matches.map(m => {
          const level = ScoreLevel(m.score)
          return (
            <div key={m.archetypeId}>
              {/* 流派名称 + 评分 */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-medium text-text-primary text-sm">{m.archetypeName}</span>
                <span className={`score-badge ${level}`}>{m.score}</span>
              </div>

              {/* 进度条 */}
              <div className="progress-bar">
                <div className={`fill ${level}`} style={{ width: `${m.score}%` }} />
              </div>

              {/* 已有核心卡 */}
              {m.ownedCore.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  <span className="text-xs text-text-muted">已有：</span>
                  {m.ownedCore.map(c => (
                    <span key={c} className="tag-pill bg-xm-light text-xm-primary">{c}</span>
                  ))}
                </div>
              )}

              {/* 缺失核心卡 */}
              {m.missingCore.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  <span className="text-xs text-text-muted">缺少：</span>
                  {m.missingCore.slice(0, 3).map(c => (
                    <span key={c} className="tag-pill bg-red-50 text-score-low">{c}</span>
                  ))}
                </div>
              )}

              {/* 下一步建议 */}
              {m.nextSteps.length > 0 && (
                <div className="mt-2 text-xs text-xm-primary bg-xm-light/50 rounded-lg px-2.5 py-1.5 leading-relaxed">
                  💡 {m.nextSteps[0]}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
