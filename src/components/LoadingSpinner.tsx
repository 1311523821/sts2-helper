export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-warm-200" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-xm-primary animate-spin" />
        </div>
        <p className="text-sm text-text-muted">加载中...</p>
      </div>
    </div>
  )
}
