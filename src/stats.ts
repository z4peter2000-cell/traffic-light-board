import type { Light, Member, Task } from './types'
import { deptOf } from './types'
import { addDays, monthOf, today } from './utils'
import { earnedGold } from './grading'

export type Range = 'month' | 'last30'

export const inRange = (date: string, month: string, range: Range) =>
  range === 'month' ? monthOf(date) === month : date >= addDays(today(), -29) && date <= today()

export interface Row {
  member: Member
  dept: string
  green: number
  yellow: number
  red: number
  total: number
  /** 綠燈達成率 % */
  rate: number
  /** 最近連續紅燈天數（不限區間，依最新已評審紀錄往前算） */
  redStreak: number
  /** 今日是否已結案回報 */
  reportedToday: boolean
  /** 實得含金分加總 */
  gold: number
  /** 🔥 月度破局含金量 % = 實得含金分加總 ÷（任務數 × 100） */
  goldRate: number
}

export function buildRows(members: Member[], tasks: Task[], month: string, range: Range = 'month'): Row[] {
  const t = today()
  const byMember = new Map<string, Task[]>()
  for (const task of tasks) {
    const arr = byMember.get(task.memberId)
    if (arr) arr.push(task)
    else byMember.set(task.memberId, [task])
  }
  return members.map((member) => {
    const all = byMember.get(member.id) ?? []
    const mine = all.filter((x) => x.light && inRange(x.date, month, range))
    const green = mine.filter((x) => x.light === 'green').length
    const yellow = mine.filter((x) => x.light === 'yellow').length
    const red = mine.filter((x) => x.light === 'red').length
    const total = green + yellow + red
    const gold = mine.reduce((n, x) => n + earnedGold(x), 0)
    const graded = all.filter((x) => x.light).sort((a, b) => b.date.localeCompare(a.date))
    let redStreak = 0
    for (const g of graded) {
      if (g.light === 'red') redStreak++
      else break
    }
    return {
      member,
      dept: deptOf(member),
      green,
      yellow,
      red,
      total,
      rate: total ? Math.round((green / total) * 100) : 0,
      redStreak,
      reportedToday: all.some((x) => x.date === t && !!x.light),
      gold,
      goldRate: total ? Math.round((gold / (total * 100)) * 100) : 0,
    }
  })
}

export type SortMode = 'gold' | 'green' | 'red' | 'rate' | 'streak'

export const SORT_LABEL: Record<SortMode, string> = {
  gold: '破局含金量',
  green: '綠燈最多',
  red: '紅燈警示榜',
  rate: '綠燈達成率',
  streak: '連續紅燈',
}

export function sortRows(rows: Row[], mode: SortMode): Row[] {
  const r = [...rows]
  switch (mode) {
    case 'gold':
      return r.sort((a, b) => b.goldRate - a.goldRate || b.gold - a.gold || b.green - a.green || a.member.name.localeCompare(b.member.name, 'zh-Hant'))
    case 'green':
      return r.sort((a, b) => b.green - a.green || b.rate - a.rate || a.red - b.red || a.member.name.localeCompare(b.member.name, 'zh-Hant'))
    case 'red':
      return r.sort((a, b) => b.red - a.red || b.redStreak - a.redStreak || a.green - b.green || a.member.name.localeCompare(b.member.name, 'zh-Hant'))
    case 'rate':
      return r.sort((a, b) => b.rate - a.rate || b.green - a.green || a.member.name.localeCompare(b.member.name, 'zh-Hant'))
    case 'streak':
      return r.sort((a, b) => b.redStreak - a.redStreak || b.red - a.red || a.member.name.localeCompare(b.member.name, 'zh-Hant'))
  }
}

export interface DeptRow {
  dept: string
  headcount: number
  green: number
  yellow: number
  red: number
  total: number
  rate: number
  reportedToday: number
  gold: number
  goldRate: number
}

export function buildDeptRows(rows: Row[]): DeptRow[] {
  const map = new Map<string, DeptRow>()
  for (const r of rows) {
    const d = map.get(r.dept) ?? { dept: r.dept, headcount: 0, green: 0, yellow: 0, red: 0, total: 0, rate: 0, reportedToday: 0, gold: 0, goldRate: 0 }
    d.headcount++
    d.green += r.green
    d.yellow += r.yellow
    d.red += r.red
    d.total += r.total
    d.gold += r.gold
    if (r.reportedToday) d.reportedToday++
    map.set(r.dept, d)
  }
  return [...map.values()]
    .map((d) => ({ ...d, rate: d.total ? Math.round((d.green / d.total) * 100) : 0, goldRate: d.total ? Math.round((d.gold / (d.total * 100)) * 100) : 0 }))
    .sort((a, b) => b.rate - a.rate || b.green - a.green)
}

export const sumLights = (rows: { green: number; yellow: number; red: number }[]): Record<Light, number> =>
  rows.reduce((acc, r) => ({ green: acc.green + r.green, yellow: acc.yellow + r.yellow, red: acc.red + r.red }), { green: 0, yellow: 0, red: 0 })
