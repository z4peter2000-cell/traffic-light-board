import { useState } from 'react'
import { Plus, Search, Trash2, UserRound, Users } from 'lucide-react'
import type { Member } from '../types'
import { deptOf, memberLabel } from '../types'
import { today, uid } from '../utils'

const COLORS = ['#38bdf8', '#f472b6', '#a78bfa', '#fb923c', '#34d399', '#facc15', '#f87171', '#60a5fa']

export function Avatar({ member, size = 'md' }: { member: Member; size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'lg' ? 'h-12 w-12 text-lg' : size === 'sm' ? 'h-7 w-7 text-xs' : 'h-9 w-9 text-sm'
  return (
    <span
      className={`inline-flex ${s} shrink-0 items-center justify-center rounded-full font-bold text-slate-900 ring-2 ring-white/30`}
      style={{ background: member.color }}
    >
      {member.name.slice(0, 1)}
    </span>
  )
}

export function MemberPanel({
  members,
  currentId,
  onSelect,
  onAdd,
  onRemove,
}: {
  members: Member[]
  currentId: string
  onSelect: (id: string) => void
  onAdd: (m: Member) => void
  onRemove: (id: string) => void
}) {
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [dept, setDept] = useState('')
  const [role, setRole] = useState('')
  const [q, setQ] = useState('')
  const depts = [...new Set(members.map(deptOf))]
  const current = members.find((m) => m.id === currentId)
  const kw = q.trim().toLowerCase()
  const shown = kw ? members.filter((m) => m.name.toLowerCase().includes(kw) || memberLabel(m).toLowerCase().includes(kw)) : members

  const submit = () => {
    if (!name.trim()) return
    onAdd({ id: uid(), name: name.trim(), dept: dept.trim() || '未分類', role: role.trim() || '團隊成員', color: COLORS[members.length % COLORS.length], joinedAt: today() })
    setName('')
    setDept('')
    setRole('')
    setAdding(false)
  }

  return (
    <section className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-bold">
          <Users className="h-4 w-4 text-emerald-500" /> 成員身分
        </h2>
        <button className="btn-ghost !px-2 !py-1 text-xs" onClick={() => setAdding((v) => !v)}>
          <Plus className="h-3.5 w-3.5" /> 新增成員
        </button>
      </div>

      {adding && (
        <div className="mb-3 space-y-2 rounded-xl border border-dashed border-emerald-500/50 p-3">
          <input className="input" placeholder="姓名（必填）" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
          <input className="input" placeholder="部門（例：研發部）" list="dept-options" value={dept} onChange={(e) => setDept(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
          <datalist id="dept-options">{depts.map((d) => <option key={d} value={d} />)}</datalist>
          <input className="input" placeholder="職稱（例：後端工程師）" value={role} onChange={(e) => setRole(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
          <div className="flex justify-end gap-2">
            <button className="btn-ghost !py-1 text-xs" onClick={() => setAdding(false)}>取消</button>
            <button className="btn-primary !py-1 text-xs" onClick={submit}>建立並切換</button>
          </div>
        </div>
      )}

      {current && (
        <div className="mb-3 flex items-center gap-3 rounded-xl border border-emerald-500 bg-emerald-500/10 px-3 py-2 shadow-[0_0_14px_rgba(16,185,129,0.35)]">
          <Avatar member={current} size="md" />
          <div className="min-w-0">
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-300"><UserRound className="h-3 w-3" /> 目前身分</div>
            <div className="truncate font-bold leading-tight">{current.name}</div>
            <div className="truncate text-[11px] text-slate-500 dark:text-slate-400">{memberLabel(current)}</div>
          </div>
        </div>
      )}

      {members.length > 8 && (
        <label className="relative mb-2 block">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input className="input !py-1.5 !pl-8 text-xs" placeholder={`搜尋 ${members.length} 位成員（姓名 / 部門）`} value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
      )}

      <div className="flex max-h-64 flex-wrap gap-2 overflow-y-auto pr-1">
        {members.length === 0 && <p className="text-sm text-slate-500">尚無成員，請新增或載入示範資料。</p>}
        {shown.length === 0 && members.length > 0 && <p className="text-sm text-slate-500">找不到符合的成員。</p>}
        {shown.map((m) => (
          <div key={m.id} className="group relative">
            <button
              onClick={() => onSelect(m.id)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                m.id === currentId
                  ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_14px_rgba(16,185,129,0.35)]'
                  : 'border-slate-200 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5'
              }`}
            >
              <Avatar member={m} size="sm" />
              <span className="text-left">
                <span className="block font-semibold leading-tight">{m.name}</span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400">{memberLabel(m)}</span>
              </span>
            </button>
            <button
              onClick={() => confirm(`確定刪除成員「${m.name}」及其所有紀錄？`) && onRemove(m.id)}
              className="absolute -right-1.5 -top-1.5 hidden rounded-full bg-red-500 p-0.5 text-white shadow group-hover:block"
              title="刪除成員"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
