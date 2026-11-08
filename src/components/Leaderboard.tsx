import { useMemo, useState } from 'react'
import { Building2, ChevronLeft, ChevronRight, ClipboardCheck, Flame, Trophy, X } from 'lucide-react'
import { GoldTooltip } from './TierBadge'
import type { Light, Member, Task } from '../types'
import { LIGHT_META } from '../types'
import type { Range } from '../stats'
import { buildDeptRows, buildRows, sumLights } from '../stats'
import { Lamp, lightText } from './Lamp'
import { StackBar } from './StackBar'
import { TopBoards } from './TopBoards'
import { MemberGrid } from './MemberGrid'
import { formatMonth } from '../utils'

export function Leaderboard({
  members,
  tasks,
  month,
  onMonthChange,
  highlightId,
  flashId,
}: {
  members: Member[]
  tasks: Task[]
  month: string
  onMonthChange: (m: string) => void
  highlightId?: string
  flashId?: string | null
}) {
  const [range, setRange] = useState<Range>('month')
  const [dept, setDept] = useState<string | null>(null)

  const rows = useMemo(() => buildRows(members, tasks, month, range), [members, tasks, month, range])
  const deptRows = useMemo(() => buildDeptRows(rows), [rows])
  const visible = useMemo(() => (dept ? rows.filter((r) => r.dept === dept) : rows), [rows, dept])
  const team = sumLights(visible)
  const teamTotal = team.green + team.yellow + team.red
  const reported = visible.filter((r) => r.reportedToday).length
  const reportRate = visible.length ? Math.round((reported / visible.length) * 100) : 0
  const gold = visible.reduce((n, r) => n + r.gold, 0)
  const goldRate = teamTotal ? Math.round((gold / (teamTotal * 100)) * 100) : 0
  const maxDeptTotal = Math.max(1, ...deptRows.map((d) => d.total))

  const shiftMonth = (n: number) => {
    const [y, m] = month.split('-').map(Number)
    const d = new Date(y, m - 1 + n, 1)
    onMonthChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  return (
    <section className="space-y-4">
      {/* 標題列 + 區間切換 */}
      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-5 py-4 text-white">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-black tracking-wide">
              <Trophy className="h-5 w-5 text-yellow-400" /> 月度透明公開排行榜
              <GoldTooltip />
              {dept && (
                <button onClick={() => setDept(null)} className="ml-1 flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold hover:bg-white/25" title="清除部門篩選">
                  <Building2 className="h-3 w-3" /> {dept} <X className="h-3 w-3" />
                </button>
              )}
            </h2>
            <p className="text-xs text-slate-300">全公司公開 ‧ 每日自動累計 ‧ 數據說話，無需主管盯場 ‧ 共 {members.length} 人</p>
          </div>
          <div className="flex items-center rounded-xl bg-white/10 text-sm">
            <button className="rounded-l-xl px-2 py-1.5 hover:bg-white/10" onClick={() => { setRange('month'); shiftMonth(-1) }} aria-label="上個月"><ChevronLeft className="h-4 w-4" /></button>
            <button className={`px-2 py-1.5 font-semibold tabular-nums ${range === 'month' ? 'text-white' : 'text-slate-400'}`} onClick={() => setRange('month')}>
              {formatMonth(month)}
            </button>
            <button className="px-2 py-1.5 hover:bg-white/10" onClick={() => { setRange('month'); shiftMonth(1) }} aria-label="下個月"><ChevronRight className="h-4 w-4" /></button>
            <button
              className={`rounded-r-xl border-l border-white/10 px-2.5 py-1.5 text-xs font-semibold ${range === 'last30' ? 'bg-white/20 text-white' : 'text-slate-400 hover:bg-white/10'}`}
              onClick={() => setRange('last30')}
            >
              近 30 天
            </button>
          </div>
        </div>

        {/* 第一層：全公司總覽 */}
        <div className="grid grid-cols-2 divide-slate-200 border-b border-slate-200 md:grid-cols-5 md:divide-x dark:divide-white/10 dark:border-white/10">
          {(['green', 'yellow', 'red'] as Light[]).map((l) => (
            <div key={l} className="flex flex-col items-center gap-1 py-4">
              <div className="flex items-center gap-2">
                <Lamp light={l} size="md" pulse={l === 'red' && team.red > 0} />
                <span className="text-xs text-slate-500 dark:text-slate-400">{dept ?? '全公司'}{LIGHT_META[l].label}</span>
              </div>
              <div className={`text-4xl font-black tabular-nums ${lightText[l]}`}>{team[l]}</div>
              <div className="text-[11px] text-slate-500">{teamTotal ? Math.round((team[l] / teamTotal) * 100) : 0}%</div>
            </div>
          ))}
          <div className="flex flex-col items-center gap-1 py-4">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-sky-400" />
              <span className="text-xs text-slate-500 dark:text-slate-400">今日回報率</span>
            </div>
            <div className={`text-4xl font-black tabular-nums ${reportRate >= 80 ? 'text-sky-500 dark:text-sky-300' : reportRate >= 50 ? lightText.yellow : lightText.red}`}>{reportRate}%</div>
            <div className="text-[11px] text-slate-500">{reported} / {visible.length} 人已結案</div>
          </div>
          <div className="flex flex-col items-center gap-1 py-4">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-400" />
              <span className="text-xs text-slate-500 dark:text-slate-400">破局含金量</span>
            </div>
            <div className={`text-4xl font-black tabular-nums ${goldRate >= 60 ? 'text-orange-500 dark:text-orange-300 [text-shadow:0_0_12px_rgba(249,115,22,0.8)]' : goldRate >= 35 ? lightText.yellow : lightText.red}`}>{goldRate}%</div>
            <div className="text-[11px] text-slate-500">{Math.round(gold)} / {teamTotal * 100} 分</div>
          </div>
        </div>

        {/* 部門總覽 */}
        {deptRows.length > 1 && (
          <div className="p-4">
            <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
              <Building2 className="h-3.5 w-3.5" /> 部門總覽 ‧ 依綠燈達成率排序 ‧ 點擊部門可下鑽
            </div>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {deptRows.map((d) => {
                const active = dept === d.dept
                return (
                  <button
                    key={d.dept}
                    onClick={() => setDept(active ? null : d.dept)}
                    className={`rounded-xl border p-3 text-left transition ${
                      active
                        ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_14px_rgba(16,185,129,0.35)]'
                        : 'border-slate-200 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-bold">{d.dept}</span>
                      <span className="text-[11px] text-slate-500">{d.headcount} 人</span>
                    </div>
                    <div className="mt-1 flex items-end justify-between">
                      <span className="flex items-center gap-1 text-[11px] tabular-nums">
                        <Lamp light="green" size="sm" />{d.green}
                        <Lamp light="yellow" size="sm" />{d.yellow}
                        <Lamp light="red" size="sm" />{d.red}
                      </span>
                      <span className={`text-2xl font-black tabular-nums ${d.rate >= 70 ? lightText.green : d.rate >= 40 ? lightText.yellow : lightText.red}`}>{d.rate}%</span>
                    </div>
                    <div className="mt-1.5">
                      <StackBar green={d.green} yellow={d.yellow} red={d.red} max={maxDeptTotal} height="h-2" />
                    </div>
                    <div className="mt-1 flex justify-between text-[10px] text-slate-500">
                      <span>今日回報 {d.reportedToday}/{d.headcount}</span>
                      <span className="font-semibold text-orange-500 dark:text-orange-300">🔥 {d.goldRate}%</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* 第二層：焦點雙榜 */}
      <TopBoards rows={visible} highlightId={highlightId} flashId={flashId} />

      {/* 第三層：全員總表 */}
      <MemberGrid rows={visible} depts={deptRows.map((d) => d.dept)} highlightId={highlightId} flashId={flashId} />
    </section>
  )
}
