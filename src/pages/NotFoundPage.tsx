import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-xm-light mb-6">
        <span className="text-5xl">🗡️</span>
      </div>
      <h1 className="text-5xl font-bold text-text-primary mb-4">404</h1>
      <p className="text-xl text-text-secondary mb-2">你走入了虚空迷雾...</p>
      <p className="text-text-muted mb-8">页面不存在，可能已被尖塔回收</p>
      <Link
        to="/"
        className="px-6 py-3 bg-xm-primary text-white rounded-xl font-medium shadow-lg shadow-xm-primary/25 hover:shadow-xl hover:shadow-xm-primary/30 transition-all"
      >
        🏠 返回首页
      </Link>
    </div>
  )
}
