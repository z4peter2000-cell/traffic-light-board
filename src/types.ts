export type Light = 'green' | 'yellow' | 'red'

/** 任務含金定級：🔥 高含金-主動破局 100 / 🌱 中含金-日常維運 50 / 💧 低含金-湊數瑣事 10 */
export type Tier = 100 | 50 | 10

export const TIER_META: Record<Tier, { emoji: string; label: string; short: string; cls: string }> = {
  100: { emoji: '🔥', label: '高含金 ‧ 主動破局', short: '🔥100', cls: 'bg-orange-500/15 text-orange-600 border-orange-500/40 dark:text-orange-300' },
  50: { emoji: '🌱', label: '中含金 ‧ 日常維運', short: '🌱50', cls: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/40 dark:text-emerald-300' },
  10: { emoji: '💧', label: '低含金 ‧ 湊數瑣事', short: '💧10', cls: 'bg-sky-500/15 text-sky-600 border-sky-500/40 dark:text-sky-300' },
}

/** 燈號兌現率：綠 100%、黃 50%、紅 0% */
export const LIGHT_RATE: Record<Light, number> = { green: 1, yellow: 0.5, red: 0 }

export interface Member {
  id: string
  name: string
  /** 部門（舊資料可能缺少，請用 deptOf 取得） */
  dept?: string
  /** 職稱 */
  role: string
  color: string
}

export const UNASSIGNED_DEPT = '未分類'

/** 取得成員部門；相容舊版「部門 ‧ 職稱」寫在 role 的資料 */
export const deptOf = (m: Member) => m.dept || (m.role.includes(' ‧ ') ? m.role.split(' ‧ ')[0] : UNASSIGNED_DEPT)
/** 取得成員職稱 */
export const titleOf = (m: Member) => (m.dept ? m.role : m.role.includes(' ‧ ') ? m.role.split(' ‧ ').slice(1).join(' ‧ ') : m.role)
/** 「部門 ‧ 職稱」顯示字串 */
export const memberLabel = (m: Member) => `${deptOf(m)} ‧ ${titleOf(m)}`

export interface Task {
  id: string
  memberId: string
  /** 預計完成日期 YYYY-MM-DD */
  date: string
  plan: string
  dod: string
  createdAt: string
  result?: string
  progress?: number
  submittedAt?: string
  light?: Light
  comment?: string
  gradedBy?: 'rules' | 'openai' | 'gemini' | 'system'
  overdue?: boolean
  /** AI 含金定級（未儲存時以 tierOf 即時判定） */
  tier?: Tier
  tierReason?: string
  tierBy?: 'rules' | 'openai' | 'gemini'
}

export type Provider = 'rules' | 'openai' | 'gemini'

export interface ApiSettings {
  provider: Provider
  openaiKey: string
  openaiModel: string
  geminiKey: string
  geminiModel: string
  /** 公司本季重點（脈絡提示），供 LLM 判定含金定級與燈號時加權 */
  context: string
}

export interface GradeResult {
  light: Light
  comment: string
}

export const LIGHT_META: Record<Light, { label: string; emoji: string; desc: string }> = {
  green: { label: '綠燈', emoji: '🟢', desc: '完全完成' },
  yellow: { label: '黃燈', emoji: '🟡', desc: '已開始但未完成' },
  red: { label: '紅燈', emoji: '🔴', desc: '連做都沒開始' },
}
