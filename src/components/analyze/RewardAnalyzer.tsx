import type { Recommendation } from '@/services/cardScorer'
import { RecommendationPanel } from '@/components/RecommendationPanel'

export interface RewardAnalyzerProps {
  rewardInput: string
  setRewardInput: (value: string) => void
  handleAddReward: () => void
  recommendation: Recommendation | null
}

export function RewardAnalyzer({ rewardInput, setRewardInput, handleAddReward, recommendation }: RewardAnalyzerProps) {
  return (
    <div>
      <div className="xiaomi-card-static mb-4">
        <h3 className="font-bold text-text-primary mb-3">输入可选卡牌</h3>
        <p className="text-sm text-text-muted mb-3">
          输入卡牌ID（用逗号、空格或换行分隔），系统将自动分析推荐
        </p>
        <textarea value={rewardInput} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRewardInput(e.target.value)}
          placeholder="例如: ironclad_inflame, ironclad_heavy_blade, ironclad_cleave"
          className="input-field h-24 resize-none mb-3" />
        <button onClick={handleAddReward} className="btn-primary">分析选牌</button>
      </div>
      {recommendation && <RecommendationPanel rec={recommendation} />}
    </div>
  )
}
