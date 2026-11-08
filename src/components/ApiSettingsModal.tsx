import { useState } from 'react'
import { Bot, Building2, Cpu, KeyRound, Sparkles, X } from 'lucide-react'
import type { ApiSettings, Provider } from '../types'

export function ApiSettingsModal({ settings, onSave, onClose }: { settings: ApiSettings; onSave: (s: ApiSettings) => void; onClose: () => void }) {
  const [draft, setDraft] = useState<ApiSettings>(settings)
  const set = <K extends keyof ApiSettings>(k: K, v: ApiSettings[K]) => setDraft((d) => ({ ...d, [k]: v }))

  const options: { id: Provider; title: string; desc: string; icon: typeof Cpu }[] = [
    { id: 'rules', title: '內建智慧規則引擎', desc: '免 API Key，燈號與含金定級皆以規則與語意權重判讀', icon: Cpu },
    { id: 'openai', title: 'OpenAI（GPT）', desc: '燈號與 🔥 含金定級皆由 GPT 嚴格判定，失敗自動退回規則引擎', icon: Sparkles },
    { id: 'gemini', title: 'Google Gemini', desc: '燈號與 🔥 含金定級皆由 Gemini 嚴格判定，失敗自動退回規則引擎', icon: Bot },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="card w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <KeyRound className="h-5 w-5 text-emerald-500" /> AI 評審 API 設定
          </h2>
          <button className="rounded-lg p-1 hover:bg-slate-200 dark:hover:bg-white/10" onClick={onClose} aria-label="關閉">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-2">
          {options.map((o) => (
            <label
              key={o.id}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                draft.provider === o.id
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-slate-200 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5'
              }`}
            >
              <input type="radio" className="mt-1 accent-emerald-500" checked={draft.provider === o.id} onChange={() => set('provider', o.id)} />
              <o.icon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
              <div>
                <div className="font-semibold">{o.title}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{o.desc}</div>
              </div>
            </label>
          ))}
        </div>

        {draft.provider === 'openai' && (
          <div className="mt-4 space-y-2">
            <label className="text-xs font-semibold text-slate-500">OpenAI API Key</label>
            <input className="input" type="password" placeholder="sk-..." value={draft.openaiKey} onChange={(e) => set('openaiKey', e.target.value)} />
            <label className="text-xs font-semibold text-slate-500">模型</label>
            <input className="input" value={draft.openaiModel} onChange={(e) => set('openaiModel', e.target.value)} placeholder="gpt-4o-mini" />
          </div>
        )}
        {draft.provider === 'gemini' && (
          <div className="mt-4 space-y-2">
            <label className="text-xs font-semibold text-slate-500">Gemini API Key</label>
            <input className="input" type="password" placeholder="AIza..." value={draft.geminiKey} onChange={(e) => set('geminiKey', e.target.value)} />
            <label className="text-xs font-semibold text-slate-500">模型</label>
            <input className="input" value={draft.geminiModel} onChange={(e) => set('geminiModel', e.target.value)} placeholder="gemini-1.5-flash" />
          </div>
        )}

        <div className="mt-4 space-y-1.5 rounded-xl border border-dashed border-orange-500/40 bg-orange-500/5 p-3">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <Building2 className="h-3.5 w-3.5 text-orange-400" /> 公司本季重點（評審脈絡提示）
            <span className="font-normal text-slate-400">— LLM 模式下會依此加權含金定級</span>
          </label>
          <textarea
            className="input min-h-[72px] text-sm"
            placeholder="例：本季重點為導入 ERP 系統、拓展東南亞新客戶、客訴回覆 24 小時內結案。與重點直接相關的任務應視為高含金。"
            value={draft.context ?? ''}
            onChange={(e) => set('context', e.target.value)}
          />
          <p className="text-[11px] text-slate-500">每家輔導公司可填不同重點；內建規則引擎不使用此欄位。</p>
        </div>

        <label className="mt-4 flex cursor-pointer items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-sm">
          <input type="checkbox" className="mt-1 accent-red-500" checked={!!draft.skipWeekends} onChange={(e) => set('skipWeekends', e.target.checked)} />
          <span>
            <span className="font-semibold">週六、週日免填計畫</span>
            <span className="block text-xs text-slate-500 dark:text-slate-400">逾期處罰：每日 24:00 後，未送審的任務自動計入 🔴「逾期未回報」；當日完全沒填計畫者補登 🔴「未填計畫」。勾選後週末不補登未填計畫。</span>
          </span>
        </label>

        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          API Key 僅儲存於您瀏覽器的 localStorage，直接由瀏覽器呼叫供應商 API，不會傳送至任何第三方伺服器。若 Key 為空將自動回退至內建規則引擎。
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <button className="btn-ghost" onClick={onClose}>取消</button>
          <button className="btn-primary" onClick={() => { onSave(draft); onClose() }}>儲存設定</button>
        </div>
      </div>
    </div>
  )
}
