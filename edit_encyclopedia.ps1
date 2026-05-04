$filePath = "src\pages\EncyclopediaPage.tsx"
$content = Get-Content $filePath -Raw

# Insert after "const [showFavOnly..." (line 55)
$insertion = @"
  // 搜索防抖（300ms）
  const debouncedSearch = useDebounce(search, 300)

  // 虚拟滚动状态
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(800)
  const [columnCount, setColumnCount] = useState(4)
  const CARD_HEIGHT = 195
  const OVERSCAN = 2

  // 监听容器尺寸变化计算列数
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const observer = new ResizeObserver(entries => {
      const width = entries[0].contentRect.width
      setContainerHeight(el.clientHeight)
      if (width >= 1024) setColumnCount(4)
      else if (width >= 640) setColumnCount(3)
      else setColumnCount(2)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // 滚动处理
  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      setScrollTop(scrollRef.current.scrollTop)
    }
  }, [])

"@

$newContent = $content -replace "  const \[showFavOnly, setShowFavOnly\] = useState\(false\)\s+  useEffect\(\(\) => \{ saveFavorites\(favorites\) \}, \[favorites\]\)", "  const [showFavOnly, setShowFavOnly] = useState(false)`r`n$insertion`r`n  useEffect(() => { saveFavorites(favorites) }, [favorites])"

Set-Content $filePath -Value $newContent -NoNewline
Write-Output "Done"
