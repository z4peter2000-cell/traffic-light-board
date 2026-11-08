import { AlertTriangle, Trophy } from 'lucide-react'
import type { Row } from '../stats'
import { sortRows } from '../stats'
import { Avatar } from './MemberPanel'
import { Lamp, lightText } from './Lamp'
import { StackBar } from './StackBar'

function BoardRow({ r, rank, tone, highlight, flash }: { r: Row; rank: number; tone: 'green' | 'red'; highlight: boolean; flash: boolean }) {
  return (
    <div
      className={`grid grid-cols-[1.5rem_auto_1fr] items-center gap-2 rounded-xl px-2 py-1.5 transition md:grid-cols-[1.5rem_auto_1fr_auto] ${
        flash ? (tone === 'green' ? 'bg-emerald-500/20' : 'bg-red-500/20') : highlight ? 'bg-emerald-500/10' : 'hover:bg-slate-100 dark:hover:bg-white/5'
      }`}
    >
      <span className={`text-sm font-black tabular-nums ${rank <= 3 ? (tone === 'green' ? lightText.green : lightText.red) : 'text-slate-400'}`}>{rank}</span>
      <Avatar member={r.member} size="sm" />
      <div className="min-w-0">
        <div className="flex items-baseline gap-1.5">
          <span className="truncate text-sm font-bold">{r.member.name}</span>
          <span className="truncate text-[10px] text-slate-500">{r.dept}</span>
          {r.redStreak >= 3 && (
            <span className="rounded bg-red-500/20 px-1 text-[10px] font-semibold text-red-500 dark:text-red-300">連續 {r.redStreak} 天紅燈</span>
          )}
        </div>
        <div className="mt-1 flex items-center gap-2">
          <div className="w-24 shrink-0 md:w-28">
            <StackBar green={r.green} yellow={r.yellow} red={r.red} height="h-1.5" />
          </div>
          <span className="flex items-center gap-1 text-[11px] tabular-nums">
            <Lamp light="green" size="sm" /><b className={lightText.green}>{r.green}</b>
            <Lamp light="yellow" size="sm" /><b className={lightText.yellow}>{r.yellow}</b>
            <Lamp light="red" size="sm" /><b className={lightText.red}>{r.red}</b>
          </span>
        </div>
      </div>
      <span className="hidden flex-col items-end leading-tight md:flex">
        <span className={`text-lg font-black tabular-nums ${r.rate >= 70 ? lightText.green : r.rate >= 40 ? lightText.yellow : lightText.red}`}>{r.rate}%</span>
        <span className="text-[10px] font-semibold tabular-nums text-orange-500 dark:text-orange-300">🔥 {r.goldRate}%</span>
      </span>
    </div>
  )
}

export function TopBoards({ rows, highlightId, flashId, limit = 10 }: { rows: Row[]; highlightId?: string; flashId?: string | null; limit?: number }) {
  const top = sortRows(rows.filter((r) => r.total > 0), 'green').slice(0, limit)
  const warn = sortRows(rows.filter((r) => r.red > 0), 'red').slice(0, limit)
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="card border-emerald-500/40 p-4 shadow-[0_0_24px_rgba(34,197,94,0.15)]">
        <h3 className="mb-2 flex items-center gap-2 font-black">
          <Trophy className="h-4 w-4 text-emerald-400" /> 行動派榜 ‧ 綠燈 Top {limit}
          <span className="ml-auto text-[11px] font-normal text-slate-500">依綠燈數 → 達成率</span>
        </h3>
        <div className="space-y-0.5">
          {top.length === 0 && <p className="py-6 text-center text-sm text-slate-500">此區間尚無紀錄</p>}
          {top.map((r, i) => <BoardRow key={r.member.id} r={r} rank={i + 1} tone="green" highlight={r.member.id === highlightId} flash={r.member.id === flashId} />)}
        </div>
      </div>
      <div className="card border-red-500/50 p-4 shadow-[0_0_28px_rgba(239,68,68,0.22)]">
        <h3 className="mb-2 flex items-center gap-2 font-black">
          <AlertTriangle className="h-4 w-4 animate-pulseGlow text-red-400" /> 紅燈警示榜 ‧ Top {limit}
          <span className="ml-auto text-[11px] font-normal text-slate-500">依紅燈數 → 連續紅燈天數</span>
        </h3>
        <div className="space-y-0.5">
          {warn.length === 0 && <p className="py-6 text-center text-sm text-emerald-500">此區間無人紅燈，全員達標！</p>}
          {warn.map((r, i) => <BoardRow key={r.member.id} r={r} rank={i + 1} tone="red" highlight={r.member.id === highlightId} flash={r.member.id === flashId} />)}
        </div>
      </div>
    </div>
  )
}
