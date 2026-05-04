import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16">
      <div className="text-center max-w-md mx-auto px-4">
        {/* 装饰性背景 */}
        <div className="relative mb-8">
          {/* 大号 404 背景文字 */}
          <div
            className="text-[10rem] font-extrabold leading-none select-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255,107,53,0.08) 0%, rgba(245,158,11,0.08) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: '0.8',
            }}
          >
            404
          </div>

          {/* 叠加的图标 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* 剑盾交叉动画 */}
              <div className="flex items-center justify-center gap-3 animate-bounce-subtle">
                <span
                  className="text-5xl inline-block animate-float"
                  style={{ animationDelay: '0s' }}
                >
                  ⚔️
                </span>
                <span
                  className="text-5xl inline-block animate-float"
                  style={{ animationDelay: '1s' }}
                >
                  🛡️
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 标题 */}
        <h1 className="text-2xl font-bold text-text-primary mb-3">
          啊哦！页面走丢了 🗺️
        </h1>

        {/* 游戏风格描述 */}
        <div className="xiaomi-card-static mb-8 text-left">
          <div className="flex items-start gap-3">
            <span className="text-xl mt-0.5">💀</span>
            <div>
              <p className="text-sm text-text-secondary leading-relaxed">
                你似乎闯入了未知的领域……
              </p>
              <p className="text-sm text-text-secondary leading-relaxed mt-1">
                前方没有敌人，没有宝箱，只有一片虚空。
              </p>
              <p className="text-sm text-text-secondary leading-relaxed mt-1">
                或许该使用<span className="text-xm-primary font-semibold">「返回首页」</span>
                卷轴安全撤离。
              </p>
            </div>
          </div>

          {/* 状态条 - 游戏风格 */}
          <div className="mt-4 pt-4 border-t border-warm-200 dark:border-dark-300">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>HP: <span className="text-red-500 font-bold">???</span></span>
              <span>金币: <span className="text-xm-secondary font-bold">0</span></span>
              <span>楼层: <span className="text-text-primary font-bold">??</span></span>
            </div>
          </div>
        </div>

        {/* 返回首页按钮 */}
        <button
          onClick={() => navigate('/')}
          className="btn-primary text-base px-8 py-3 inline-flex items-center gap-2"
        >
          <span>🏠</span>
          <span>返回首页</span>
        </button>

        {/* 小提示 */}
        <p className="mt-6 text-xs text-text-muted">
          💡 提示：检查网址是否正确，或点击上方导航栏探索
        </p>
      </div>
    </div>
  )
}
