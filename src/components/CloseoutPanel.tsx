import { useEffect, useState } from 'react'
import { TierBadge } from './TierBadge'
import { activeLLM, classifyTierAsync, earnedGold, tierOf } from '../grading'
import { LIGHT_RATE } from '../types'
import { BrainCircuit, CheckCircle2, ClipboardCheck, Loader2, Trash2 } from 'lucide-react'
import type { ApiSettings, Task } from '../types'
import { LIGHT_META } from '../types'
import { gradeTask } from '../grading'
import { Lamp, TrafficLight, lightBg, lightText } from './Lamp'
import { today, weekdayZh } from '../utils'

export function CloseoutPanel({
  tasks,
  settings,
  onUpdate,
  onRemove,
  onGraded,
}: {
  tasks: Task[]
  settings: ApiSettings
  onUpdate: (id: string, patch: Partial<Task>) => void
  onRemove: (id: string) => void
  onGraded?: (t: Task) => void
}) {
  const pending = tasks.filter((t) => !t.light).sort((a, b) => a.date.localeCompare(b.date))
  const [selectedId, setSelectedId] = useState<string>('')
  const [result, setResult] = useState('')
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastGraded, setLastGraded] = useState<Task | null>(null)

  useEffect(() => {
    if (!pending.find((t) => t.id === selectedId)) setSelectedId(pending[0]?.id ?? '')
  }, [pending, selectedId])

  const selected = pending.find((t) => t.id === selectedId)

  const submit = async () => {
    if (!selected) return
    setLoading(true)
    setError('')
    try {
      const llm = activeLLM(settings)
      const needTier = !selected.tier || (llm && selected.tierBy !== llm)
      const [g, tierInfo] = await Promise.all([
        gradeTask(selected, result, progress, settings),
        needTier ? classifyTierAsync(selected.plan, selected.dod, settings) : Promise.resolve({ tier: selected.tier!, reason: selected.tierReason ?? '', tierBy: selected.tierBy ?? ('rules' as const) }),
      ])
      const patch: Partial<Task> = {
        tier: tierInfo.tier,
        tierReason: tierInfo.reason,
        tierBy: tierInfo.tierBy,
        result,
        progress: g.light === 'green' ? 100 : progress,
        submittedAt: new Date().toISOString(),
        light: g.light,
        comment: g.comment,
        gradedBy: g.gradedBy,
      }
      onUpdate(selected.id, patch)
      const graded = { ...selected, ...patch }
      setLastGraded(graded)
      onGraded?.(graded)
      setResult('')
      setProgress(0)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  const providerLabel = settings.provider === 'openai' && settings.openaiKey ? `OpenAI ${settings.openaiModel}` : settings.provider === 'gemini' && settings.geminiKey ? `Gemini ${settings.geminiModel}` : '內建智慧規則引擎'

  return (
    <section className="card p-4">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-bold">
          <ClipboardCheck className="h-4 w-4 text-yellow-500" /> 今日結案 ‧ 送交 AI 審核
        </h2>
        <span className="flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-600 dark:text-emerald-300">
          <BrainCircuit className="h-3 w-3" /> {providerLabel}
        </span>
      </div>
      <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">選擇待結案任務，填寫實際執行成果與完成度，AI 將比對目標並亮燈。</p>

      {pending.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-white/10">
          目前沒有待結案的任務，請先於左側建立明日計畫。
        </div>
      ) : (
        <>
          <div className="mb-3 max-h-40 space-y-1.5 overflow-y-auto pr-1">
            {pending.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                className={`group flex cursor-pointer items-start gap-2 rounded-xl border p-2.5 text-sm transition ${
                  t.id === selectedId ? 'border-yellow-400 bg-yellow-400/10' : 'border-slate-200 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5'
                }`}
              >
                <Lamp light={null} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span>{t.date}（{weekdayZh(t.date)}）</span>
                    {t.date < today() && <span className="rounded bg-red-500/20 px-1 text-red-500">逾期</span>}
                  </div>
                  <div className="truncate font-medium">{t.plan}</div>
                  {t.dod && <div className="truncate text-xs text-slate-500 dark:text-slate-400">完成標準：{t.dod}</div>}
                </div>
                <button
                  className="hidden shrink-0 rounded p-1 text-slate-400 hover:text-red-500 group-hover:block"
                  onClick={(e) => { e.stopPropagation(); if (confirm('刪除此任務？')) onRemove(t.id) }}
                  title="刪除任務"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          {selected && (
            <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3 dark:border-white/10 dark:bg-black/20">
              <div className="text-xs text-slate-500">
                目標：<b className="text-slate-800 dark:text-slate-200">{selected.plan}</b>
                {selected.dod && <> ｜ 標準：<b className="text-slate-800 dark:text-slate-200">{selected.dod}</b></>}
              </div>
              <textarea
                className="input min-h-[88px]"
                placeholder="實際執行進度說明、交付成果摘要、具體數據或連結（例：PR #482 已合併，P95 降至 420ms）"
                value={result}
                onChange={(e) => setResult(e.target.value)}
                disabled={loading}
              />
              <div>
                <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>完成百分比</span>
                  <span className={`text-base font-black ${progress >= 100 ? lightText.green : progress > 5 ? lightText.yellow : lightText.red}`}>{progress}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                  disabled={loading}
                />
              </div>
              {error && <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-2 text-xs text-red-500">{error}</div>}
              <button className="btn-primary w-full" onClick={submit} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
                {loading ? 'AI 審核中…' : '送交 AI 審核'}
              </button>
            </div>
          )}
        </>
      )}

      {lastGraded && lastGraded.light && (
        <div className={`mt-3 flex items-center gap-4 rounded-xl border p-3 ${lightBg[lastGraded.light]}`}>
          <TrafficLight active={lastGraded.light} size="lg" />
          <div className="min-w-0 flex-1">
            <div className={`text-xl font-black ${lightText[lastGraded.light]}`}>
              {LIGHT_META[lastGraded.light].emoji} {LIGHT_META[lastGraded.light].label}
              <span className="ml-2 text-xs font-normal opacity-80">{LIGHT_META[lastGraded.light].desc}</span>
            </div>
            <div className="mt-1 text-sm text-slate-700 dark:text-slate-200">{lastGraded.comment}</div>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px]">
              <TierBadge tier={tierOf(lastGraded)} size="md" title={lastGraded.tierReason} />
              <span className="text-slate-600 dark:text-slate-300">{lastGraded.tierReason}</span>
              <span className="rounded bg-slate-500/15 px-1 text-[10px] text-slate-500">
                定級：{lastGraded.tierBy === 'openai' ? 'OpenAI' : lastGraded.tierBy === 'gemini' ? 'Gemini' : '規則引擎'}
              </span>
              <span className="font-bold text-orange-500 dark:text-orange-300">
                實得含金 {earnedGold(lastGraded)} 分（{tierOf(lastGraded)} × {Math.round(LIGHT_RATE[lastGraded.light] * 100)}%）
              </span>
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
              <CheckCircle2 className="h-3 w-3" /> 已計入本月排行榜 ‧ {lastGraded.plan}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
