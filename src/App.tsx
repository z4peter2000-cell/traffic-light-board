import { useMemo, useState } from 'react'
import { Activity, Database, Download, KeyRound, Moon, Sun, Trash2 } from 'lucide-react'
import { useStore } from './store'
import { ApiSettingsModal } from './components/ApiSettingsModal'
import { MemberPanel } from './components/MemberPanel'
import { PlanForm } from './components/PlanForm'
import { CloseoutPanel } from './components/CloseoutPanel'
import { HistoryList } from './components/HistoryList'
import { Leaderboard } from './components/Leaderboard'
import { TrafficLight } from './components/Lamp'
import { exportMonthCsv } from './csv'
import { currentMonth, today, weekdayZh } from './utils'

export default function App() {
  const store = useStore()
  const [showApi, setShowApi] = useState(false)
  const [month, setMonth] = useState(currentMonth())
  const [flashId, setFlashId] = useState<string | null>(null)

  const myTasks = useMemo(() => store.tasks.filter((t) => t.memberId === store.currentMemberId), [store.tasks, store.currentMemberId])
  const currentMember = store.members.find((m) => m.id === store.currentMemberId)

  const providerBadge =
    store.settings.provider === 'openai' && store.settings.openaiKey
      ? 'OpenAI'
      : store.settings.provider === 'gemini' && store.settings.geminiKey
        ? 'Gemini'
        : '內建引擎'

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-[#070b14]/80">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <TrafficLight active="green" />
            <div>
              <h1 className="text-lg font-black tracking-wide md:text-xl">AI 紅黃綠燈日清績效看板</h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Traffic-Light Daily Accountability Board ‧ {today()}（{weekdayZh(today())}）
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className="btn-ghost !px-3 !py-1.5 text-xs" onClick={() => exportMonthCsv(store.members, store.tasks, month)} title="匯出本月報表 CSV">
              <Download className="h-4 w-4" /> 匯出本月報表（CSV）
            </button>
            <button className="btn-ghost !px-3 !py-1.5 text-xs" onClick={() => confirm('重新載入示範資料將覆蓋目前所有資料，確定？') && store.loadDemo()} title="載入示範資料">
              <Database className="h-4 w-4" /> 載入示範資料
            </button>
            <button className="btn-ghost !px-3 !py-1.5 text-xs" onClick={() => confirm('清空所有資料？此動作無法復原。') && store.clearAll()} title="清空資料">
              <Trash2 className="h-4 w-4" />
            </button>
            <button className="btn-ghost !px-3 !py-1.5 text-xs" onClick={() => setShowApi(true)} title="API 設定">
              <KeyRound className="h-4 w-4" /> API 設定
              <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] text-emerald-600 dark:text-emerald-300">{providerBadge}</span>
            </button>
            <button className="btn-ghost !px-2.5 !py-1.5" onClick={() => store.setTheme(store.theme === 'dark' ? 'light' : 'dark')} title="切換深色/淺色模式" aria-label="切換主題">
              {store.theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-5 px-4 py-5">
        <Leaderboard
          members={store.members}
          tasks={store.tasks}
          month={month}
          onMonthChange={setMonth}
          highlightId={store.currentMemberId}
          flashId={flashId}
        />

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-5">
            <MemberPanel
              members={store.members}
              currentId={store.currentMemberId}
              onSelect={store.setCurrentMemberId}
              onAdd={store.addMember}
              onRemove={store.removeMember}
            />
            <PlanForm memberId={store.currentMemberId} onAdd={store.addTask} onUpdate={store.updateTask} settings={store.settings} disabled={!currentMember} />
          </div>
          <div className="space-y-5">
            <CloseoutPanel
              tasks={myTasks}
              settings={store.settings}
              onUpdate={store.updateTask}
              onRemove={store.removeTask}
              onGraded={(t) => {
                setMonth(t.date.slice(0, 7))
                setFlashId(t.memberId)
                setTimeout(() => setFlashId(null), 1500)
              }}
            />
          </div>
          <div>
            <HistoryList tasks={myTasks} />
          </div>
        </div>

        <footer className="flex items-center justify-center gap-2 pb-6 text-xs text-slate-400">
          <Activity className="h-3.5 w-3.5" /> 資料儲存於瀏覽器 localStorage ‧ 每日 24:00 後，未送審或未填計畫者自動計入 🔴 紅燈
        </footer>
      </main>

      {showApi && <ApiSettingsModal settings={store.settings} onSave={store.setSettings} onClose={() => setShowApi(false)} />}
    </div>
  )
}
