import { useCallback, useEffect, useState } from 'react'
import type { ApiSettings, Member, Task } from './types'
import { DEMO_MEMBERS, buildDemoTasks } from './demoData'
import { today } from './utils'

const KEYS = {
  members: 'tlb.members',
  tasks: 'tlb.tasks',
  settings: 'tlb.settings',
  theme: 'tlb.theme',
  currentMember: 'tlb.currentMember',
  seeded: 'tlb.seeded',
  seedVersion: 'tlb.seedVersion',
}

const SEED_VERSION = '2'

const DEFAULT_SETTINGS: ApiSettings = {
  provider: 'rules',
  openaiKey: '',
  openaiModel: 'gpt-4o-mini',
  geminiKey: '',
  geminiModel: 'gemini-1.5-flash',
  context: '',
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
const save = (key: string, value: unknown) => localStorage.setItem(key, JSON.stringify(value))

export function useStore() {
  const [members, setMembers] = useState<Member[]>(() => load(KEYS.members, [] as Member[]))
  const [tasks, setTasks] = useState<Task[]>(() => load(KEYS.tasks, [] as Task[]))
  const [settings, setSettings] = useState<ApiSettings>(() => ({ ...DEFAULT_SETTINGS, ...load(KEYS.settings, {}) }))
  const [theme, setTheme] = useState<'dark' | 'light'>(() => load(KEYS.theme, 'dark' as 'dark' | 'light'))
  const [currentMemberId, setCurrentMemberId] = useState<string>(() => load(KEYS.currentMember, ''))

  // 首次開啟自動載入示範資料
  useEffect(() => {
    const seeded = localStorage.getItem(KEYS.seeded)
    const stale = seeded && localStorage.getItem(KEYS.seedVersion) !== SEED_VERSION
    // 未載入過，或舊版示範資料（僅含舊示範成員、無使用者自建成員）→ 載入新版示範資料
    const onlyOldDemo = members.length > 0 && members.every((m) => /^m[1-5]$/.test(m.id))
    if (!seeded || (stale && (members.length === 0 || onlyOldDemo))) {
      setMembers(DEMO_MEMBERS)
      setTasks(buildDemoTasks())
      setCurrentMemberId(DEMO_MEMBERS[0].id)
    }
    localStorage.setItem(KEYS.seeded, '1')
    localStorage.setItem(KEYS.seedVersion, SEED_VERSION)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => save(KEYS.members, members), [members])
  useEffect(() => save(KEYS.tasks, tasks), [tasks])
  useEffect(() => save(KEYS.settings, settings), [settings])
  useEffect(() => save(KEYS.currentMember, currentMemberId), [currentMemberId])
  useEffect(() => {
    save(KEYS.theme, theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // 逾期未回報自動計入紅燈：日期已過（早於今日）且未提交成果者
  useEffect(() => {
    const t = today()
    setTasks((prev) => {
      let changed = false
      const next = prev.map((task) => {
        if (!task.light && task.date < t) {
          changed = true
          return {
            ...task,
            light: 'red' as const,
            comment: '逾期未回報，系統自動計入紅燈。',
            gradedBy: 'system' as const,
            overdue: true,
            submittedAt: new Date().toISOString(),
          }
        }
        return task
      })
      return changed ? next : prev
    })
  }, [])

  const addMember = useCallback((m: Member) => {
    setMembers((prev) => [...prev, m])
    setCurrentMemberId(m.id)
  }, [])

  const removeMember = useCallback((id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id))
    setTasks((prev) => prev.filter((t) => t.memberId !== id))
    setCurrentMemberId((cur) => (cur === id ? '' : cur))
  }, [])

  const addTask = useCallback((t: Task) => setTasks((prev) => [t, ...prev]), [])
  const updateTask = useCallback(
    (id: string, patch: Partial<Task>) => setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t))),
    [],
  )
  const removeTask = useCallback((id: string) => setTasks((prev) => prev.filter((t) => t.id !== id)), [])

  const loadDemo = useCallback(() => {
    setMembers(DEMO_MEMBERS)
    setTasks(buildDemoTasks())
    setCurrentMemberId(DEMO_MEMBERS[0].id)
    localStorage.setItem(KEYS.seeded, '1')
  }, [])

  const clearAll = useCallback(() => {
    setMembers([])
    setTasks([])
    setCurrentMemberId('')
    localStorage.setItem(KEYS.seeded, '1')
  }, [])

  return {
    members,
    tasks,
    settings,
    theme,
    currentMemberId,
    setSettings,
    setTheme,
    setCurrentMemberId,
    addMember,
    removeMember,
    addTask,
    updateTask,
    removeTask,
    loadDemo,
    clearAll,
  }
}

export type Store = ReturnType<typeof useStore>
