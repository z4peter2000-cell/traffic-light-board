import type { Member, Task } from './types'
import { addDays, today, uid } from './utils'

/** 最多回溯補登「未填計畫」紅燈的天數 */
const MAX_LOOKBACK_DAYS = 62

const isWeekend = (date: string) => {
  const d = new Date(date + 'T00:00:00').getDay()
  return d === 0 || d === 6
}

/**
 * 逾期自動處罰（每日 24:00 後生效）：
 * 1. 預計日期已過仍未送審的任務 → 🔴 逾期未回報
 * 2. 成員某日完全沒有填寫計畫 → 補登一筆 🔴 未填計畫
 * 回傳 null 表示無需變更。
 */
export function sweepOverdue(tasks: Task[], members: Member[], skipWeekends: boolean, now = new Date()): Task[] | null {
  const t = today()
  const stamp = now.toISOString()
  let changed = false

  const kept = skipWeekends ? tasks.filter((task) => !(task.missedPlan && isWeekend(task.date))) : tasks
  if (kept.length !== tasks.length) changed = true

  const next = kept.map((task) => {
    if (task.light || task.date >= t) return task
    changed = true
    return {
      ...task,
      light: 'red' as const,
      comment: '逾期未回報（預計日 24:00 前未送審），系統自動計入紅燈。',
      gradedBy: 'system' as const,
      overdue: true,
      submittedAt: stamp,
    }
  })

  const datesByMember = new Map<string, Set<string>>()
  for (const task of next) {
    let s = datesByMember.get(task.memberId)
    if (!s) datesByMember.set(task.memberId, (s = new Set()))
    s.add(task.date)
  }

  const earliestAllowed = addDays(t, -MAX_LOOKBACK_DAYS)
  for (const m of members) {
    const dates = datesByMember.get(m.id) ?? new Set<string>()
    const firstTask = [...dates].sort()[0]
    let start = m.joinedAt ? addDays(m.joinedAt.slice(0, 10), 1) : firstTask
    if (!start) continue
    if (start < earliestAllowed) start = earliestAllowed
    for (let d = start; d < t; d = addDays(d, 1)) {
      if (dates.has(d) || (skipWeekends && isWeekend(d))) continue
      changed = true
      next.push({
        id: uid(),
        memberId: m.id,
        date: d,
        plan: '（未填寫計畫）',
        dod: '',
        createdAt: stamp,
        submittedAt: stamp,
        progress: 0,
        light: 'red',
        comment: '前一日 24:00 前未填寫計畫，系統自動計入紅燈。',
        gradedBy: 'system',
        overdue: true,
        missedPlan: true,
        tier: 10,
        tierReason: '未填寫計畫',
        tierBy: 'rules',
      })
    }
  }

  return changed ? next : null
}
