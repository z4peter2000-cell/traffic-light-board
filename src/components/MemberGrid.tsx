import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, LayoutGrid, Search } from 'lucide-react'
import type { Row, SortMode } from '../stats'
import { SORT_LABEL, sortRows } from '../stats'
import { titleOf } from '../types'
import { Avatar } from './MemberPanel'
import { Lamp, lightText } from './Lamp'
import { StackBar } from './StackBar'

const PAGE_SIZES = [20, 50, 0] as const

function MemberCard({ r, highlight, flash }: { r: Row; highlight: boolean; flash: boolean }) {
  const alert = r.redStreak >= 3
  return (
    <div
      className={`relative rounded-2xl border p-3 transition ${
        flash
          ? 'scale-[1.03] border-emerald-400 bg-emerald-500/15 shadow-glow-green'
          : alert
            ? 'border-red-500/70 bg-red-500/[0.06] shadow-[0_0_18px_rgba(239,68,68,0.35)] animate-pulseGlow'
            : highlight
              ? 'border-emerald-500/60 bg-emerald-500/5'
              : 'border-slate-200 bg-white/60 hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20'
      }`}
    >
      {alert && (
        <span className="absolute -top-2 right-2 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-glow-red">連續 {r.redStreak} 天紅燈</span>
      )}
      {!r.reportedToday && !alert && (
        <span className="absolute -top-2 right-2 rounded-full bg-slate-500/80 px-1.5 py-0.5 text-[10px] font-semibold text-white">今日未回報</span>
      )}
      <div className="flex items-center gap-2">
        <Avatar member={r.member} size="md" />
        <div className="min-w-0">
          <div className="truncate text-sm font-bold">{r.member.name}</div>
          <div className="truncate text-[10px] text-slate-500">{r.dept} ‧ {titleOf(r.member)}</div>
        </div>
        <span className={`ml-auto text-xl font-black tabular-nums ${r.total === 0 ? 'text-slate-400' : r.rate >= 70 ? lightText.green : r.rate >= 40 ? lightText.yellow : lightText.red}`}>
          {r.total === 0 ? '—' : `${r.rate}%`}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1 text-center">
        {(['green', 'yellow', 'red'] as const).map((l) => (
          <div key={l} className="flex items-center justify-center gap-1 rounded-lg bg-slate-100/70 py-1 dark:bg-white/5">
            <Lamp light={l} size="sm" />
            <span className={`text-base font-black tabular-nums ${lightText[l]}`}>{r[l]}</span>
          </div>
        ))}
      </div>
      <div className="mt-2">
        <StackBar green={r.green} yellow={r.yellow} red={r.red} height="h-1.5" />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500">
        <span>綠燈達成率</span>
        <span className="font-semibold tabular-nums text-orange-500 dark:text-orange-300">🔥 含金量 {r.goldRate}%</span>
      </div>
    </div>
  )
}

export function MemberGrid({ rows, depts, highlightId, flashId }: { rows: Row[]; depts: string[]; highlightId?: string; flashId?: string | null }) {
  const [q, setQ] = useState('')
  const [dept, setDept] = useState('')
  const [sort, setSort] = useState<SortMode>('green')
  const [size, setSize] = useState<(typeof PAGE_SIZES)[number]>(20)
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase()
    const list = rows.filter((r) => (!dept || r.dept === dept) && (!kw || r.member.name.toLowerCase().includes(kw) || r.dept.toLowerCase().includes(kw) || r.member.role.toLowerCase().includes(kw)))
    return sortRows(list, sort)
  }, [rows, q, dept, sort])

  const pageCount = size === 0 ? 1 : Math.max(1, Math.ceil(filtered.length / size))
  const cur = Math.min(page, pageCount)
  const slice = size === 0 ? filtered : filtered.slice((cur - 1) * size, cur * size)
  const reset = () => setPage(1)

  return (
    <div className="card p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h3 className="flex items-center gap-2 font-black">
          <LayoutGrid className="h-4 w-4 text-slate-400" /> 全員總表
          <span className="text-xs font-normal text-slate-500">共 {filtered.length} 人</span>
        </h3>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <label className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input className="input !w-44 !py-1.5 !pl-8 text-xs" placeholder="搜尋姓名 / 部門" value={q} onChange={(e) => { setQ(e.target.value); reset() }} />
          </label>
          <select className="input !w-auto !py-1.5 text-xs" value={dept} onChange={(e) => { setDept(e.target.value); reset() }} aria-label="部門篩選">
            <option value="">全部部門</option>
            {depts.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="input !w-auto !py-1.5 text-xs" value={sort} onChange={(e) => { setSort(e.target.value as SortMode); reset() }} aria-label="排序">
            {(Object.keys(SORT_LABEL) as SortMode[]).map((k) => <option key={k} value={k}>排序：{SORT_LABEL[k]}</option>)}
          </select>
          <select className="input !w-auto !py-1.5 text-xs" value={size} onChange={(e) => { setSize(Number(e.target.value) as (typeof PAGE_SIZES)[number]); reset() }} aria-label="每頁人數">
            {PAGE_SIZES.map((n) => <option key={n} value={n}>{n === 0 ? '全部顯示' : `每頁 ${n} 人`}</option>)}
          </select>
        </div>
      </div>

      {slice.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">找不到符合條件的成員</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {slice.map((r) => <MemberCard key={r.member.id} r={r} highlight={r.member.id === highlightId} flash={r.member.id === flashId} />)}
        </div>
      )}

      {pageCount > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3 text-sm">
          <button className="btn-ghost !px-2 !py-1" disabled={cur <= 1} onClick={() => setPage(cur - 1)} aria-label="上一頁"><ChevronLeft className="h-4 w-4" /></button>
          <span className="tabular-nums text-slate-500">第 {cur} / {pageCount} 頁</span>
          <button className="btn-ghost !px-2 !py-1" disabled={cur >= pageCount} onClick={() => setPage(cur + 1)} aria-label="下一頁"><ChevronRight className="h-4 w-4" /></button>
        </div>
      )}
    </div>
  )
}
