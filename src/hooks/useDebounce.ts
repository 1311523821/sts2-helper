import { useState, useEffect } from 'react'

/**
 * 防抖 Hook - 延迟更新值
 * @param value 要防抖的值
 * @param delay 延迟毫秒数，默认 300ms
 * @returns 防抖后的值
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
