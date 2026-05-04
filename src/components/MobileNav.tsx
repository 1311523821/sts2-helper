import { useState, useEffect, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { NAV_ITEMS } from '../constants'

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const location = useLocation()

  // Close menu on route change
  useEffect(() => {
    if (isOpen) {
      handleClose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleOpen = useCallback(() => {
    setIsAnimating(true)
    // Trigger reflow to ensure the exit animation finishes before entering
    requestAnimationFrame(() => {
      setIsOpen(true)
    })
  }, [])

  const handleClose = useCallback(() => {
    setIsAnimating(false)
    // Let exit animation play before unmounting
    setTimeout(() => {
      setIsOpen(false)
    }, 250)
  }, [])

  const toggleMenu = useCallback(() => {
    if (isAnimating) return
    if (isOpen) {
      handleClose()
    } else {
      handleOpen()
    }
  }, [isAnimating, isOpen, handleClose, handleOpen])

  const isVisible = isOpen || isAnimating

  return (
    <div className="md:hidden">
      {/* 汉堡菜单按钮 */}
      <button
        onClick={toggleMenu}
        aria-label={isOpen ? '关闭导航菜单' : '打开导航菜单'}
        aria-expanded={isOpen}
        className={`relative z-[60] p-2 rounded-xl transition-all duration-200 hover:bg-warm-100 ${
          isOpen ? 'text-xm-primary' : 'text-text-primary'
        }`}
      >
        <div className={isOpen ? 'hamburger-open' : ''}>
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </div>
      </button>

      {/* 全屏覆盖层 */}
      {isVisible && (
        <div
          className={`fixed inset-0 z-50 transition-all duration-300 ease-out ${
            isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* 半透明背景遮罩 */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* 菜单面板 - 从右滑入 */}
          <nav
            className={`absolute top-0 right-0 w-72 h-full bg-white dark:bg-dark-100 shadow-2xl
              transition-all duration-300 ease-out
              ${isOpen ? 'translate-x-0' : 'translate-x-full'}
              flex flex-col pt-20 px-6`}
            role="navigation"
            aria-label="移动端导航菜单"
          >
            {/* 菜单标题 */}
            <div className="mb-8 px-2">
              <span className="text-2xl">🗡️</span>
              <h2 className="text-lg font-bold text-text-primary mt-2">导航菜单</h2>
              <p className="text-xs text-text-muted mt-1">选择功能页面</p>
            </div>

            {/* 导航项列表 */}
            <ul className="flex flex-col gap-2">
              {NAV_ITEMS.map((item, index) => {
                const isActive = location.pathname === item.path
                return (
                  <li
                    key={item.path}
                    className={`transition-all duration-300 ${
                      isOpen
                        ? 'opacity-100 translate-x-0'
                        : 'opacity-0 translate-x-4'
                    }`}
                    style={{
                      transitionDelay: isOpen ? `${index * 50}ms` : '0ms',
                    }}
                  >
                    <Link
                      to={item.path}
                      onClick={handleClose}
                      className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium
                        transition-all duration-200
                        ${
                          isActive
                            ? 'bg-xm-primary text-white shadow-lg shadow-xm-primary/25'
                            : 'text-text-secondary hover:bg-warm-100 hover:text-xm-primary'
                        }`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>

            {/* 底部装饰 */}
            <div className="mt-auto mb-8 text-center">
              <p className="text-xs text-text-muted">🃏 杀戮尖塔2 智能选牌助手</p>
            </div>
          </nav>
        </div>
      )}
    </div>
  )
}
