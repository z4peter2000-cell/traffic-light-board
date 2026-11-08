export function StackBar({
  green,
  yellow,
  red,
  max,
  height = 'h-2.5',
  glow = false,
}: {
  green: number
  yellow: number
  red: number
  /** 以此值為 100% 寬度；未提供則以三色總和為滿 */
  max?: number
  height?: string
  glow?: boolean
}) {
  const total = green + yellow + red
  const denom = Math.max(1, max ?? total)
  const w = (n: number) => `${(n / denom) * 100}%`
  return (
    <div className={`flex ${height} w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10`}>
      {total === 0 ? null : (
        <>
          <div className={`bg-light-green transition-all duration-500 ${glow ? 'shadow-glow-green' : ''}`} style={{ width: w(green) }} />
          <div className={`bg-light-yellow transition-all duration-500 ${glow ? 'shadow-glow-yellow' : ''}`} style={{ width: w(yellow) }} />
          <div className={`bg-light-red transition-all duration-500 ${glow ? 'shadow-glow-red' : ''}`} style={{ width: w(red) }} />
        </>
      )}
    </div>
  )
}
