import type { Member, Task } from './types'
import { LIGHT_META, deptOf, titleOf } from './types'
import { monthOf } from './utils'
import { earnedGold, tierOf } from './grading'

const esc = (v: string | number | undefined) => {
  const s = String(v ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function exportMonthCsv(members: Member[], tasks: Task[], month: string) {
  const byId = new Map(members.map((m) => [m.id, m]))
  const rows: string[][] = []
  rows.push(['=== 月度紅黃綠燈統計 ===', month])
  rows.push(['成員', '部門', '職稱', '綠燈', '黃燈', '紅燈', '總回報數', '綠燈達成率(%)', '實得含金分', '破局含金量(%)'])
  for (const m of members) {
    const mine = tasks.filter((t) => t.memberId === m.id && monthOf(t.date) === month && t.light)
    const g = mine.filter((t) => t.light === 'green').length
    const y = mine.filter((t) => t.light === 'yellow').length
    const r = mine.filter((t) => t.light === 'red').length
    const total = g + y + r
    const gold = mine.reduce((n, t) => n + earnedGold(t), 0)
    rows.push([m.name, deptOf(m), titleOf(m), String(g), String(y), String(r), String(total), total ? (Math.round((g / total) * 1000) / 10).toString() : '0', String(gold), total ? (Math.round((gold / (total * 100)) * 1000) / 10).toString() : '0'])
  }
  rows.push([])
  rows.push(['=== 任務明細 ==='])
  rows.push(['日期', '成員', '部門', '預計完成事項', '具體完成標準', '含金定級', '實得含金分', '實際執行成果', '完成度(%)', '燈號', 'AI 評語', '評審來源', '提交時間'])
  const detail = tasks
    .filter((t) => monthOf(t.date) === month && t.light)
    .sort((a, b) => (a.date === b.date ? a.memberId.localeCompare(b.memberId) : a.date.localeCompare(b.date)))
  for (const t of detail) {
    rows.push([
      t.date,
      byId.get(t.memberId)?.name ?? t.memberId,
      byId.get(t.memberId) ? deptOf(byId.get(t.memberId)!) : '',
      t.plan,
      t.dod,
      String(tierOf(t)),
      String(earnedGold(t)),
      t.result ?? '',
      t.progress === undefined ? '' : String(t.progress),
      t.light ? LIGHT_META[t.light].label : '',
      t.comment ?? '',
      t.gradedBy === 'rules' ? '內建規則引擎' : t.gradedBy === 'system' ? '系統(逾期)' : t.gradedBy === 'openai' ? 'OpenAI' : t.gradedBy === 'gemini' ? 'Gemini' : '',
      t.submittedAt ?? '',
    ])
  }
  const csv = '\uFEFF' + rows.map((r) => r.map(esc).join(',')).join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `紅黃綠燈報表_${month}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
