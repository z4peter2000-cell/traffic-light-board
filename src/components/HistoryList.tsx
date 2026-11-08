import { History } from 'lucide-react'
import type { Task } from '../types'
import { LIGHT_META } from '../types'
import { Lamp, lightText } from './Lamp'
import { TierBadge } from './TierBadge'
import { earnedGold, tierOf } from '../grading'
import { weekdayZh } from '../utils'

export function HistoryList({ tasks }: { tasks: Task[] }) {
  const graded = tasks.filter((t) => t.light).sort((a, b) => b.date.localeCompare(a.date) || (b.submittedAt ?? '').localeCompare(a.submittedAt ?? ''))
  return (
    <section className="card p-4">
      <h2 className="mb-3 flex items-center gap-2 font-bold">
        <History className="h-4 w-4 text-slate-400" /> 個人歷史紀錄
        <span className="text-xs font-normal text-slate-500">共 {graded.length} 筆</span>
      </h2>
      <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
        {graded.length === 0 && <p className="text-sm text-slate-500">尚無已評審紀錄。</p>}
        {graded.map((t) => (
          <div key={t.id} className="flex gap-3 rounded-xl border border-slate-200 p-3 text-sm dark:border-white/10">
            <div className="pt-0.5">
              <Lamp light={t.light} size="lg" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500">
                <span>{t.date}（{weekdayZh(t.date)}）</span>
                <span className={`font-bold ${lightText[t.light!]}`}>{LIGHT_META[t.light!].label}</span>
                {t.progress !== undefined && <span>完成度 {t.progress}%</span>}
                <TierBadge tier={tierOf(t)} title={`${t.tierReason ?? '含金定級'} ｜ 定級：${t.tierBy === 'openai' ? 'OpenAI' : t.tierBy === 'gemini' ? 'Gemini' : '規則引擎'} ｜ 實得 ${earnedGold(t)} 分`} />
                <span className="text-orange-500 dark:text-orange-300">實得 {earnedGold(t)} 分</span>
                {t.overdue && <span className="rounded bg-red-500/20 px-1 text-red-500">{t.missedPlan ? '未填計畫' : '逾期未回報'}</span>}
                <span className="ml-auto">{t.gradedBy === 'rules' ? '規則引擎' : t.gradedBy === 'system' ? '系統' : t.gradedBy === 'openai' ? 'OpenAI' : t.gradedBy === 'gemini' ? 'Gemini' : ''}</span>
              </div>
              <div className="font-medium">{t.plan}</div>
              {t.result && <div className="mt-0.5 line-clamp-2 text-xs text-slate-600 dark:text-slate-300">成果：{t.result}</div>}
              {t.comment && <div className="mt-1 text-xs italic text-slate-500 dark:text-slate-400">AI 評語：{t.comment}</div>}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
