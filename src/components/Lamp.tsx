import type { Light } from '../types'

const sizeMap = { sm: 'h-3 w-3', md: 'h-4 w-4', lg: 'h-6 w-6', xl: 'h-10 w-10' }

export function Lamp({ light, size = 'md', pulse = false }: { light?: Light | null; size?: keyof typeof sizeMap; pulse?: boolean }) {
  const cls = light ? `lamp-${light}` : 'lamp-off'
  return <span className={`lamp ${sizeMap[size]} ${cls} ${pulse ? 'animate-pulseGlow' : ''}`} />
}

export function TrafficLight({ active, size = 'md' }: { active?: Light | null; size?: 'md' | 'lg' }) {
  const s = size === 'lg' ? 'h-5 w-5' : 'h-3.5 w-3.5'
  const pad = size === 'lg' ? 'p-2 gap-2' : 'p-1.5 gap-1.5'
  return (
    <span className={`inline-flex flex-col items-center rounded-full bg-slate-900 ${pad} shadow-inner ring-1 ring-black/40 dark:bg-black/70`}>
      {(['red', 'yellow', 'green'] as Light[]).map((l) => (
        <span key={l} className={`lamp ${s} ${active === l ? `lamp-${l}` : 'bg-slate-700/70'}`} />
      ))}
    </span>
  )
}

export const lightText: Record<Light, string> = {
  green: 'text-emerald-500 dark:text-emerald-400 text-glow-green',
  yellow: 'text-yellow-500 dark:text-yellow-300 text-glow-yellow',
  red: 'text-red-500 dark:text-red-400 text-glow-red',
}

export const lightBg: Record<Light, string> = {
  green: 'bg-emerald-500/15 border-emerald-500/40',
  yellow: 'bg-yellow-400/15 border-yellow-400/40',
  red: 'bg-red-500/15 border-red-500/40',
}
