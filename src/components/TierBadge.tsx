import { HelpCircle } from 'lucide-react'
import type { Tier } from '../types'
import { TIER_META } from '../types'

export function TierBadge({ tier, title, size = 'sm' }: { tier: Tier; title?: string; size?: 'sm' | 'md' }) {
  const m = TIER_META[tier]
  return (
    <span
      title={title ?? m.label}
      className={`inline-flex items-center gap-0.5 rounded-md border px-1.5 font-bold tabular-nums ${size === 'md' ? 'py-0.5 text-xs' : 'text-[10px]'} ${m.cls}`}
    >
      {m.short}
    </span>
  )
}

/** 滑鼠移過問號顯示算分標準 */
export function GoldTooltip() {
  return (
    <span className="group relative inline-flex">
      <HelpCircle className="h-4 w-4 cursor-help text-slate-300 transition group-hover:text-white" aria-label="破局含金量算分說明" />
      <div className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 w-80 -translate-x-1/2 rounded-xl border border-white/15 bg-slate-900/95 p-3 text-left text-xs font-normal leading-relaxed text-slate-200 opacity-0 shadow-2xl backdrop-blur transition group-hover:opacity-100">
        <div className="mb-1.5 font-black text-orange-300">🔥 破局含金量（%）算分標準</div>
        <ol className="list-decimal space-y-1.5 pl-4">
          <li>
            <b>AI 單日任務定級</b>：依「動詞破局力、數字與產出具體度、業務推進影響力」三維度判定
            <div className="mt-0.5 flex flex-wrap gap-1">
              <TierBadge tier={100} /> 高含金-主動破局 <TierBadge tier={50} /> 中含金-日常維運 <TierBadge tier={10} /> 低含金-湊數瑣事
            </div>
          </li>
          <li>
            <b>燈號兌現交叉計算（防吹牛）</b>：實得分 = 定級分 × 兌現率（🟢 100%、🟡 50%、🔴 0%）
          </li>
          <li>
            <b>月度含金量</b> = 當月實得分加總 ÷（當月任務數 × 100）
          </li>
        </ol>
        <div className="mt-1.5 text-[11px] text-slate-400">例：🔥100 任務亮黃燈 = 50 分；💧10 任務亮綠燈 = 10 分。只做瑣事就算全綠，含金量也上不去。</div>
      </div>
    </span>
  )
}
