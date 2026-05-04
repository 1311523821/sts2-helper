import { lazy, Suspense } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { LoadingSpinner } from './components/LoadingSpinner'
import { ErrorBoundary } from './components/ErrorBoundary'
import MobileNav from './components/MobileNav'
import NotFoundPage from './pages/NotFoundPage'
import { NAV_ITEMS } from './constants'

const HomePage = lazy(() => import('./pages/HomePage'))
const AnalyzePage = lazy(() => import('./pages/AnalyzePage'))
const LearnPage = lazy(() => import('./pages/LearnPage'))
const EncyclopediaPage = lazy(() => import('./pages/EncyclopediaPage'))
const SimulatorPage = lazy(() => import('./pages/SimulatorPage'))
const StatsPage = lazy(() => import('./pages/StatsPage'))

export default function App() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-warm-50">
      {/* 主导航 - 小米风格 */}
      <header>
      <nav className="bg-white/80 backdrop-blur-lg border-b border-warm-200 sticky top-0 z-50"
        role="navigation"
        aria-label="主导航"
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center h-16 justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-text-primary hover:text-xm-primary transition-colors">
            <span className="text-2xl">🗡️</span>
            <span>STS2 助手</span>
          </Link>

          {/* 桌面端导航 - md 及以上显示 */}
          <div className="hidden md:flex items-center gap-1.5 overflow-x-auto">
            {NAV_ITEMS.map(item => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'bg-xm-primary text-white shadow-lg shadow-xm-primary/25'
                      : 'text-text-secondary hover:bg-warm-100 hover:text-xm-primary'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="mr-1.5">{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* 移动端汉堡菜单按钮 */}
          <MobileNav />
        </div>
      </nav>
      </header>

      {/* 主体内容 */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            {/* 路由过渡动画：通过 key 触发重新挂载实现淡入 */}
            <div key={location.pathname} className="page-enter">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/analyze" element={<AnalyzePage />} />
                <Route path="/learn" element={<LearnPage />} />
                <Route path="/encyclopedia" element={<EncyclopediaPage />} />
                <Route path="/simulator" element={<SimulatorPage />} />
                <Route path="/stats" element={<StatsPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>
          </Suspense>
        </ErrorBoundary>
      </main>

      {/* 页脚 */}
      <footer className="border-t border-warm-200 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-text-muted">
          <p>🗡️ STS2 助手 — 杀戮尖塔2 智能选牌助手</p>
          <p className="mt-1">非官方工具 · 仅供学习参考</p>
        </div>
      </footer>
    </div>
  )
}