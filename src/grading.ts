import type { ApiSettings, GradeResult, Light, Task, Tier } from './types'
import { LIGHT_RATE } from './types'

/* ------------------------------------------------------------------ */
/* 🔥 破局含金量：AI 單日任務定級（動詞破局力 × 數字具體度 × 業務推進影響力） */
/* ------------------------------------------------------------------ */

const BREAKTHROUGH_VERBS = [
  '簽約', '簽回', '成交', '談定', '談成', '拿下', '續約', '上線', '發布', '部署', '合併', '修復', '優化', '重構', '導入', '升級',
  '建置', '開發', '實作', '設計', '撰寫', '分析', '測試', '規格', '需求', '爭議', '退款', '補齊', '預測', '評鑑', '審核', '完成提案', '提案', '企劃', '規劃', '拜訪', '開發客戶', '新客戶', '招募', '面試', '談判',
  '結案', '交付', '通過', '驗收', '達成', '突破', '降低', '提升', '新增功能', '壓測', '改版', '轉換', '申報', '月結', '盤點差異',
]
const ROUTINE_VERBS = [
  '整理', '更新', '盤點', '回覆', '回復', '聯絡', '聯繫', '寄送', '寄出', '轉寄', '備份', '填寫', '填表', '登錄', '歸檔', '排班', '排程',
  '會議', '開會', '紀錄', '記錄', '清單', '名單', '資料輸入', 'key in', '核對', '檢查', '確認', '詢問', '收集', '蒐集', '報到', '評論', '問卷',
]
const IMPACT_KW = [
  '客戶', '營收', '業績', '合約', '萬', '訂單', '上線', '產品', '系統', '專案', '主管', '老闆', '董事', '客訴', '滿意度', '轉換率', 'ROAS',
  'P95', '覆蓋率', '效能', '成本', '預算', '策略', '路線圖', 'PRD', '提案書', '稽核', '營業稅', '薪資', '法務', '合作', 'KOL', '活動',
]
const CONCRETE_RE = [/\d+(\.\d+)?\s*(筆|件|份|頁|張|個|位|人|次|家|組|台|套|版|則|篇|萬|元|%|％|分|天|小時|場|款|章|項|支|門|條)/i, /https?:\/\//i, /(PR|#\d+|v\d|版本|單號|編號|Q\d|KPI)/i]

/** 依任務內容判定含金定級（100 / 50 / 10）與一句理由 */
export function classifyTier(plan: string, dod = ''): { tier: Tier; reason: string } {
  const text = `${plan} ${dod}`
  const hi = countHits(text, BREAKTHROUGH_VERBS)
  const lo = countHits(text, ROUTINE_VERBS)
  const impact = countHits(text, IMPACT_KW)
  const concrete = CONCRETE_RE.reduce((n, re) => (re.test(text) ? n + 1 : n), 0) + (dod.trim().length >= 6 ? 1 : 0)
  const verbScore = Math.min(hi, 3) * 1.5 - Math.min(lo, 3) * (hi > 0 ? 0.6 : 1.2)
  const score = verbScore + Math.min(concrete, 3) * 0.8 + Math.min(impact, 3) * 0.9
  const dims = `動詞破局力 ${hi > lo ? '強' : hi === lo ? '中' : '弱'} ‧ 數字具體度 ${concrete >= 2 ? '高' : concrete === 1 ? '中' : '低'} ‧ 業務推進影響力 ${impact >= 2 ? '高' : impact === 1 ? '中' : '低'}`
  if (score >= 4 && hi > 0) return { tier: 100, reason: `主動破局型任務（${dims}）` }
  if (score <= 1.2 || (lo > hi && concrete <= 1 && impact === 0)) return { tier: 10, reason: `例行瑣事型任務（${dims}）` }
  return { tier: 50, reason: `日常維運型任務（${dims}）` }
}

/** 取得任務含金定級（已儲存則沿用，否則即時判定） */
export const tierOf = (task: Task): Tier => task.tier ?? classifyTier(task.plan, task.dod).tier

/** 單日實得含金分 = 定級分 × 燈號兌現率（綠 100% / 黃 50% / 紅 0%） */
export const earnedGold = (task: Task): number => (task.light ? tierOf(task) * LIGHT_RATE[task.light] : 0)

/* ------------------------------------------------------------------ */
/* 模式一：免 API Key 智慧規則與語意權重分析引擎                           */
/* ------------------------------------------------------------------ */

const DONE_KW = [
  '已完成', '完成', '已交付', '交付', '上線', '已上線', '已送出', '已發布', '發布', '已提交', '已簽核',
  '已核准', '已結案', '結案', '通過', '已通過', '已修復', '修復完成', '驗收通過', '合併', '已合併',
  '達標', '超標', '100%', '全部完成', '搞定', '已確認', '已回覆', '已寄出', '已簽約', '成交',
]
const PROGRESS_KW = [
  '進行中', '處理中', '尚未完成', '未完成', '部分', '一半', '持續', '待', '卡', '阻礙', '延遲', '延後',
  '還在', '仍在', '尚在', '初稿', '草稿', '先', '預計', '剩餘', '還需', '還差', '未能', '尚未', '只完成',
  '目前', '暫時', '繼續', '明天', '下週', '下周', '需要更多時間', '進度', '遇到', '問題', '等待',
]
const NOT_STARTED_KW = [
  '沒做', '沒有做', '未開始', '沒開始', '還沒開始', '尚未開始', '未動工', '沒時間', '沒空', '忘了', '忘記',
  '沒處理', '沒有處理', '未處理', '沒進度', '無進度', '0%', '零進度', '明天再', '改天', '之後再',
  '請假', '太忙', '沒辦法', '無法開始', '還沒碰', '沒碰', '完全沒', '都沒有', '一點都沒',
]
const EXCUSE_KW = [
  '因為', '由於', '不是我', '別人', '其他部門', '沒收到', '等別人', '太忙', '沒時間', '忘', '臨時',
  '其他事', '突然', '沒空', '不方便', '被叫去', '被拉去',
]
const EVIDENCE_PATTERNS = [
  /https?:\/\/\S+/i,
  /\d+(\.\d+)?\s*(筆|件|份|頁|張|個|位|人|次|家|組|台|套|版|則|篆|篇|行|元|萬|k|%|％)/i,
  /(附件|截圖|連結|網址|報告|文件|檔案|PR|commit|版本|v\d|編號|單號|合約|簽核|截圖|Excel|PPT|簡報|Word|PDF)/i,
  /\b\d{2,}\b/,
]

const countHits = (text: string, kws: string[]) =>
  kws.reduce((n, k) => (text.includes(k) ? n + 1 : n), 0)

const extractPercent = (text: string): number | null => {
  const m = text.match(/(\d{1,3})\s*[%％]/)
  if (!m) return null
  const v = Number(m[1])
  return Number.isFinite(v) ? Math.min(100, v) : null
}

export function gradeByRules(task: Task, result: string, progress?: number): GradeResult {
  const text = (result || '').trim()
  const lower = text.toLowerCase()
  const len = text.replace(/\s/g, '').length

  // 逾期未回報 → 直接紅燈
  if (!text && (progress === undefined || progress === null)) {
    return { light: 'red', comment: '未填寫任何執行成果，進度為零，判定為紅燈。' }
  }

  let pct = progress !== undefined && progress !== null ? progress : extractPercent(text)
  const done = countHits(text, DONE_KW)
  const prog = countHits(text, PROGRESS_KW)
  const notStarted = countHits(text, NOT_STARTED_KW)
  // 完成度留在 0 但文字明確宣告完成且有一定深度 → 改以文字語意判讀
  if (pct !== null && pct <= 5 && done > 0 && notStarted === 0 && prog === 0 && len >= 15) pct = null
  const excuse = countHits(text, EXCUSE_KW)
  const evidence = EVIDENCE_PATTERNS.reduce((n, re) => (re.test(text) ? n + 1 : n), 0)
  const dodHit = task.dod
    ? task.dod
        .split(/[、,，;；\s/]+/)
        .filter((w) => w.length >= 2)
        .filter((w) => lower.includes(w.toLowerCase())).length
    : 0

  // ---- 紅燈判定：進度為零 / 明確未開始 / 內容過短或空洞 / 找藉口 ----
  if (pct !== null && pct <= 5) {
    return {
      light: 'red',
      comment: `完成度僅 ${pct}%，實質上尚未動工，判定為紅燈。`,
    }
  }
  if (notStarted > 0 && done === 0 && (pct === null || pct <= 5)) {
    return {
      light: 'red',
      comment: excuse > 0
        ? '回報內容顯示尚未開始執行，且以外部因素作為理由，缺乏具體行動，判定為紅燈。'
        : '回報內容明確表示尚未開始執行，進度為零，判定為紅燈。',
    }
  }
  if (len < 6 && done === 0 && (pct === null || pct < 100)) {
    return {
      light: 'red',
      comment: '回報內容過於簡略，無任何具體行動或產出描述，判定為紅燈。',
    }
  }
  if (excuse >= 2 && done === 0 && evidence === 0 && (pct === null || pct < 40)) {
    return {
      light: 'red',
      comment: '回報以理由說明為主，未見具體執行行動與產出，判定為紅燈。',
    }
  }

  // ---- 綠燈判定：100% / 完成關鍵字 + 佐證 ----
  const score =
    done * 2.2 +
    evidence * 1.5 +
    dodHit * 1.2 +
    Math.min(len / 40, 2.5) -
    prog * 1.8 -
    notStarted * 3 -
    excuse * 0.8

  if (pct !== null && pct >= 100 && (prog === 0 || done > 0)) {
    return {
      light: 'green',
      comment:
        evidence > 0
          ? '完成度 100%，並附有具體交付成果或數據佐證，完全達成原定目標。'
          : '完成度 100%，已達成原定目標；建議未來補充量化數據或交付連結以強化佐證。',
    }
  }
  if (pct !== null && pct < 100) {
    return {
      light: 'yellow',
      comment: `完成度 ${pct}%，已有實際進展但尚未達成最終交付標準，判定為黃燈。`,
    }
  }
  if (done > 0 && prog === 0 && (evidence > 0 || len >= 20 || dodHit > 0)) {
    return {
      light: 'green',
      comment: '明確回報完成且具備具體交付成果，完全達成原定目標。',
    }
  }
  if (score >= 4.5 && prog <= 1) {
    return {
      light: 'green',
      comment: '回報內容具體、含交付成果與量化資料，判定已完全完成。',
    }
  }

  // ---- 其餘為黃燈 ----
  if (prog > 0 || done > 0 || len >= 10) {
    return {
      light: 'yellow',
      comment:
        prog > 0
          ? '已開始執行並有部分進度，但內容顯示仍在進行中或遇到卡點，尚未完成交付。'
          : '有執行動作但缺乏明確的完成宣告與交付佐證，判定為黃燈。',
    }
  }
  return {
    light: 'red',
    comment: '無法從回報中辨識出任何實際執行行動，判定為紅燈。',
  }
}

/* ------------------------------------------------------------------ */
/* 模式二：真實 LLM（OpenAI / Gemini）嚴格審核                           */
/* ------------------------------------------------------------------ */

const SYSTEM_PROMPT = `你是一位極度嚴格、結果導向的企業績效評審官。你的任務是比對成員「昨日預計完成事項 + 具體完成標準（Definition of Done）」與「實際回報成果」，判定紅黃綠燈：
- green（綠燈）：100% 達成原定目標，且有明確交付成果或具體數據佐證。
- yellow（黃燈）：已經動工、有部分進度或遇到卡點，但尚未達成最終交付標準。
- red（紅燈）：進度為零、未填寫具體行動、只寫「進行中/處理中」等含糊字眼卻無任何產出、找藉口推託。
含糊、無佐證、無具體產出的回報一律不得給綠燈。
請只回傳 JSON：{"light":"green|yellow|red","comment":"一句繁體中文客觀評語（30 字內）"}`

const contextBlock = (s: ApiSettings) => (s.context?.trim() ? `【公司本季重點 / 評審脈絡】${s.context.trim()}\n` : '')

const buildUserPrompt = (task: Task, result: string, progress: number | undefined, s: ApiSettings) =>
  `${contextBlock(s)}【預計完成事項】${task.plan}\n【具體完成標準】${task.dod || '（未填寫）'}\n【自評完成度】${
    progress ?? '未填寫'
  }%\n【實際執行成果】${result || '（未填寫）'}`

/** 通用 LLM 呼叫：回傳模型原始文字（要求 JSON） */
async function callLLM(system: string, user: string, s: ApiSettings, provider: 'openai' | 'gemini'): Promise<string> {
  if (provider === 'openai') {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${s.openaiKey}` },
      body: JSON.stringify({
        model: s.openaiModel || 'gpt-4o-mini',
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
    })
    if (!res.ok) throw new Error(`OpenAI 錯誤 ${res.status}: ${(await res.text()).slice(0, 200)}`)
    const data = await res.json()
    return data.choices?.[0]?.message?.content ?? ''
  }
  const model = s.geminiModel || 'gemini-1.5-flash'
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(s.geminiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: { temperature: 0, responseMimeType: 'application/json' },
      }),
    },
  )
  if (!res.ok) throw new Error(`Gemini 錯誤 ${res.status}: ${(await res.text()).slice(0, 200)}`)
  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

/** 目前啟用的 LLM 供應商（有 Key 才算啟用） */
export const activeLLM = (s: ApiSettings): 'openai' | 'gemini' | null =>
  s.provider === 'openai' && s.openaiKey ? 'openai' : s.provider === 'gemini' && s.geminiKey ? 'gemini' : null

/* ---------- LLM 含金定級 ---------- */

const TIER_PROMPT = `你是企業績效評審官，負責判定「單日任務的破局含金量等級」。請依三個維度綜合判斷：
1. 動詞破局力：是否主動開創、推進、解決（簽約、上線、修復、拜訪新客戶、談判、設計、建置…），而非被動維持（整理、更新、回覆、排班、轉寄…）。
2. 數字與產出具體度：是否有可驗證的量化標準或明確交付物。
3. 業務推進影響力：對營收、客戶、產品、組織目標的實質推進程度；若提供「公司本季重點」，與重點直接相關者應加權。
等級定義：
- 100：🔥 高含金-主動破局（開創性、直接推進關鍵結果）
- 50：🌱 中含金-日常維運（必要的專業工作，但屬例行推進）
- 10：💧 低含金-湊數瑣事（行政雜務、湊數、無實質推進）
請嚴格把關，用字華麗但實質是雜務者不得給 100。只回傳 JSON：{"tier":100|50|10,"reason":"一句繁體中文理由（35 字內，點出關鍵維度）"}`

export interface TierResult {
  tier: Tier
  reason: string
  tierBy: 'rules' | 'openai' | 'gemini'
}

async function classifyTierLLM(plan: string, dod: string, s: ApiSettings, provider: 'openai' | 'gemini'): Promise<TierResult> {
  const raw = await callLLM(TIER_PROMPT, `${contextBlock(s)}【預計完成事項】${plan}\n【具體完成標準】${dod || '（未填寫）'}`, s, provider)
  const m = raw.match(/\{[\s\S]*\}/)
  if (!m) throw new Error('LLM 定級回傳格式無法解析')
  const obj = JSON.parse(m[0]) as { tier?: number | string; reason?: string }
  const t = Number(obj.tier)
  if (![100, 50, 10].includes(t)) throw new Error('LLM 定級等級無效')
  return { tier: t as Tier, reason: obj.reason || '（無理由）', tierBy: provider }
}

/** 含金定級：有 LLM Key 走 LLM，失敗或無 Key 自動退回規則引擎 */
export async function classifyTierAsync(plan: string, dod: string, s: ApiSettings): Promise<TierResult> {
  const provider = activeLLM(s)
  if (provider) {
    try {
      return await classifyTierLLM(plan, dod, s, provider)
    } catch (e) {
      console.warn('LLM 定級失敗，退回規則引擎：', e)
    }
  }
  return { ...classifyTier(plan, dod), tierBy: 'rules' }
}

const parseLLM = (raw: string): GradeResult => {
  const m = raw.match(/\{[\s\S]*\}/)
  if (!m) throw new Error('LLM 回傳格式無法解析')
  const obj = JSON.parse(m[0]) as { light?: string; comment?: string }
  const light = (obj.light || '').toLowerCase() as Light
  if (!['green', 'yellow', 'red'].includes(light)) throw new Error('LLM 回傳燈號無效')
  return { light, comment: obj.comment || '（無評語）' }
}

const gradeByLLM = async (task: Task, result: string, progress: number | undefined, s: ApiSettings, provider: 'openai' | 'gemini') =>
  parseLLM(await callLLM(SYSTEM_PROMPT, buildUserPrompt(task, result, progress, s), s, provider))

export async function gradeTask(
  task: Task,
  result: string,
  progress: number | undefined,
  settings: ApiSettings,
): Promise<GradeResult & { gradedBy: 'rules' | 'openai' | 'gemini' }> {
  const provider = activeLLM(settings)
  if (provider) {
    return { ...(await gradeByLLM(task, result, progress, settings, provider)), gradedBy: provider }
  }
  await new Promise((r) => setTimeout(r, 650)) // 模擬 AI 思考時間
  return { ...gradeByRules(task, result, progress), gradedBy: 'rules' }
}
