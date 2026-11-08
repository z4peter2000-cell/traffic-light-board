export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

export const toDateStr = (d: Date) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const today = () => toDateStr(new Date())

export const addDays = (base: string, n: number) => {
  const d = new Date(base + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return toDateStr(d)
}

export const tomorrow = () => addDays(today(), 1)

/** YYYY-MM */
export const monthOf = (date: string) => date.slice(0, 7)
export const currentMonth = () => monthOf(today())

export const formatMonth = (ym: string) => {
  const [y, m] = ym.split('-')
  return `${y} 年 ${Number(m)} 月`
}

export const weekdayZh = (date: string) =>
  ['日', '一', '二', '三', '四', '五', '六'][new Date(date + 'T00:00:00').getDay()]
