import { useState } from 'react'
import { CalendarPlus, Target } from 'lucide-react'
import type { ApiSettings, Task } from '../types'
import { tomorrow, uid, weekdayZh } from '../utils'
import { activeLLM, classifyTier, classifyTierAsync } from '../grading'
import { TierBadge } from './TierBadge'

export function PlanForm({
  memberId,
  onAdd,
  onUpdate,
  settings,
  disabled,
}: {
  memberId: string
  onAdd: (t: Task) => void
  onUpdate: (id: string, patch: Partial<Task>) => void
  settings: ApiSettings
  disabled: boolean
}) {
  const llm = activeLLM(settings)
  const [plan, setPlan] = useState('')
  const [dod, setDod] = useState('')
  const [date, setDate] = useState(tomorrow())
  const [saved, setSaved] = useState(false)
  const preview = plan.trim() ? classifyTier(plan, dod) : null

  const submit = () => {
    if (!plan.trim() || !memberId) return
    const id = uid()
    const rules = classifyTier(plan, dod)
    onAdd({ id, memberId, date, plan: plan.trim(), dod: dod.trim(), tier: rules.tier, tierReason: rules.reason, tierBy: 'rules', createdAt: new Date().toISOString() })
    if (llm) {
      classifyTierAsync(plan.trim(), dod.trim(), settings).then((t) => onUpdate(id, { tier: t.tier, tierReason: t.reason, tierBy: t.tierBy }))
    }
    setPlan('')
    setDod('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <section className="card p-4">
      <h2 className="mb-1 flex items-center gap-2 font-bold">
        <CalendarPlus className="h-4 w-4 text-sky-500" /> 明日計畫
      </h2>
      <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">寫下明日預計完成事項與可驗證的完成標準，AI 將依此比對實際成果。</p>
      <div className="space-y-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">預計完成日期</label>
          <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} disabled={disabled} />
          <span className="text-[11px] text-slate-400">星期{weekdayZh(date)}</span>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">明日預計完成事項 *</label>
          <textarea className="input min-h-[64px]" placeholder="例：完成 Q4 業績回顧簡報並交付主管" value={plan} onChange={(e) => setPlan(e.target.value)} disabled={disabled} />
        </div>
        <div>
          <label className="mb-1 flex items-center gap-1 text-xs font-semibold text-slate-500">
            <Target className="h-3 w-3" /> 具體量化標準（Definition of Done）
          </label>
          <textarea className="input min-h-[52px]" placeholder="例：20 頁簡報寄出、PR 合併、3 份報價單送出" value={dod} onChange={(e) => setDod(e.target.value)} disabled={disabled} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-emerald-500">{saved && '✓ 已建立明日任務'}</span>
      {preview && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-orange-500/40 bg-orange-500/5 px-3 py-2 text-[11px]">
          <span className="text-slate-500">{llm ? '規則預判（建立後由 ' + (llm === 'openai' ? 'OpenAI' : 'Gemini') + ' 正式定級）：' : 'AI 含金定級預判：'}</span>
          <TierBadge tier={preview.tier} size="md" />
          <span className="text-slate-600 dark:text-slate-300">{preview.reason}</span>
        </div>
      )}
          <button className="btn-primary" onClick={submit} disabled={disabled || !plan.trim()}>
            <CalendarPlus className="h-4 w-4" /> 建立明日任務
          </button>
        </div>
      </div>
    </section>
  )
}
