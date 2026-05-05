import { lazy, Suspense } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorBoundary } from './components/ErrorBoundary';
import MobileNav from './components/MobileNav';
import NotFoundPage from './pages/NotFoundPage';
import STSBackground from './components/STSBackground';
import { useSettingsStore } from './stores/themeStore';
import { NAV_ITEMS } from './constants';

const HomePage = lazy(() => import('./pages/HomePage'));
const AnalyzePage = lazy(() => import('./pages/AnalyzePage'));
const LearnPage = lazy(() => import('./pages/LearnPage'));
const EncyclopediaPage = lazy(() => import('./pages/EncyclopediaPage'));
const SimulatorPage = lazy(() => import('./pages/SimulatorPage'));
const StatsPage = lazy(() => import('./pages/StatsPage'));

export default function App() {
  const location = useLocation();
  const theme = useSettingsStore((s) => s.theme);
  const isStsTheme = theme === 'sts';

  return (
    <div className="min-h-screen bg-warm-50">
      {/* STS 主题背景 */}
      {isStsTheme && <STSBackground />}

      {/* 主导航 - 小米风格 / STS 暗色风格 */}
      <header>
        <nav
          className={`sticky top-0 z-50 backdrop-blur-lg border-b ${
            isStsTheme
              ? 'sts-nav bg-[rgba(13,13,26,0.95)] border-[#2a2a3e]'
              : 'bg-white/80 border-warm-200'
          }`}
          role="navigation"
          aria-label="主导航"
        >
          <div className="max-w-6xl mx-auto px-6 flex items-center h-16 justify-between">
            <Link
              to="/"
              className={`flex items-center gap-2 font-bold text-xl transition-colors ${
                isStsTheme
                  ? 'text-[#e8e4dc] hover:text-[#c9a227]'
                  : 'text-text-primary hover:text-xm-primary'
              }`}
            >
              <span className="text-2xl">🗡️</span>
              <span className={isStsTheme ? 'sts-title-font-small' : ''}>STS2 助手</span>
            </Link>

            {/* 桌面端导航 - md 及以上显示 */}
            <div className="hidden md:flex items-center gap-1.5 overflow-x-auto">
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      isStsTheme
                        ? isActive
                          ? 'sts-nav-link active bg-[rgba(201,162,39,0.15)] text-[#c9a227] shadow-[0_2px_8px_rgba(201,162,39,0.2)]'
                          : 'sts-nav-link text-[#a8a0b4] hover:text-[#c9a227] hover:bg-[rgba(201,162,39,0.08)]'
                        : isActive
                          ? 'bg-xm-primary text-white shadow-lg shadow-xm-primary/25'
                          : 'text-text-secondary hover:bg-warm-100 hover:text-xm-primary'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="mr-1.5">{item.icon}</span>
                    {item.label}
                  </Link>
                );
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
      <footer
        className={`py-8 mt-12 border-t ${
          isStsTheme ? 'sts-footer bg-[#0d0d1a] border-[#2a2a3e]' : 'border-warm-200'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 text-center text-sm">
          <p className={isStsTheme ? 'text-[#6b6b85]' : 'text-text-muted'}>
            🗡️ STS2 助手 — 杀戮尖塔2 智能选牌助手
          </p>
          <p className={`mt-1 ${isStsTheme ? 'text-[#5a5a6e]' : 'text-text-muted'}`}>
            非官方工具 · 仅供学习参考
          </p>
        </div>
      </footer>
    </div>
  );
}
