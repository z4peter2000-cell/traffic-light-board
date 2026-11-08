import type { Light, Member, Task } from './types'
import { gradeByRules } from './grading'
import { addDays, today, uid } from './utils'


export const DEPTS = ['業務部', '行銷部', '研發部', '客服部', '財務部', '人資部', '產品部', '營運部']

const PALETTE = ['#38bdf8', '#f472b6', '#a78bfa', '#fb923c', '#34d399', '#facc15', '#f87171', '#60a5fa', '#2dd4bf', '#c084fc', '#fbbf24', '#4ade80']

/** 5 位主要示範員工（有完整客製任務內容） */
const CORE_MEMBERS: Member[] = [
  { id: 'm1', name: '王小明', dept: '業務部', role: '資深業務', color: '#38bdf8' },
  { id: 'm2', name: '李美玲', dept: '行銷部', role: '行銷企劃', color: '#f472b6' },
  { id: 'm3', name: '張大衛', dept: '研發部', role: '後端工程師', color: '#a78bfa' },
  { id: 'm4', name: '陳冠宇', dept: '客服部', role: '客服主管', color: '#fb923c' },
  { id: 'm5', name: '林欣怡', dept: '財務部', role: '會計專員', color: '#34d399' },
]

/** 其餘 55 位示範員工（8 個部門，共 60 人） */
const ROSTER: Record<string, { names: string[]; titles: string[] }> = {
  業務部: { names: ['周建宏', '吳佩珊', '鄭志豪', '許雅婷', '黃俊傑', '蔡宜君', '劉家豪'], titles: ['業務專員', '資深業務', '業務主任', '客戶經理'] },
  行銷部: { names: ['謝佳穎', '郭承翰', '洪詩涵', '曾柏翰', '邱于庭', '賴冠霖'], titles: ['行銷專員', '數位行銷', '社群經理', '行銷企劃'] },
  研發部: { names: ['楊景翔', '江雨萱', '蕭文傑', '簡婉婷', '潘士傑', '葉子恩', '呂庭瑜', '游博文', '高語謙'], titles: ['前端工程師', '後端工程師', 'QA 工程師', 'DevOps 工程師', '資深工程師'] },
  客服部: { names: ['徐嘉玲', '蘇柏宇', '盧欣妍', '馮意涵', '戴宏毅', '彭芷瑄', '梁哲瑋'], titles: ['客服專員', '資深客服', '客服組長'] },
  財務部: { names: ['施雅雯', '沈冠廷', '范姜怡', '宋承恩', '唐若瑄'], titles: ['財務分析師', '出納', '資深會計', '會計專員'] },
  人資部: { names: ['莊雅筑', '顏志明', '鍾宜樺', '石家瑜', '卓佑誠', '翁心怡'], titles: ['人資專員', '招募專員', '訓練發展專員', '薪酬專員'] },
  產品部: { names: ['魏廷育', '杜嘉欣', '柯昀哲', '阮思妤', '龔柏毅', '嚴婕妮', '童國豪'], titles: ['產品經理', '產品設計師', 'UI/UX 設計師', '產品分析師'] },
  營運部: { names: ['侯志偉', '詹淑芬', '方彥廷', '白佳儀', '殷書瑋', '紀筠婷', '傅凱文', '藍雅琪'], titles: ['營運專員', '供應鏈專員', '採購專員', '倉儲管理', '營運分析師'] },
}

const EXTRA_MEMBERS: Member[] = DEPTS.flatMap((dept, di) =>
  ROSTER[dept].names.map((name, i) => ({
    id: `d${di + 1}-${i + 1}`,
    name,
    dept,
    role: ROSTER[dept].titles[i % ROSTER[dept].titles.length],
    color: PALETTE[(di * 3 + i) % PALETTE.length],
  })),
)

export const DEMO_MEMBERS: Member[] = [...CORE_MEMBERS, ...EXTRA_MEMBERS]

type Seed = { plan: string; dod: string; result: string; progress: number }
type Pool = { green: Seed[]; yellow: Seed[]; red: Seed[] }

const POOL: Record<string, Pool> = {
  m1: {
    green: [
      { plan: '拜訪 3 家新客戶並送出報價單', dod: '3 份報價單寄出並留存於 CRM', result: '已完成拜訪 3 家客戶（永豐、台達、聯發），3 份報價單皆已寄出並上傳 CRM，單號 Q-2311-018~020。', progress: 100 },
      { plan: '完成 Q4 業績回顧簡報', dod: '20 頁簡報交付主管', result: '簡報已完成 22 頁並交付主管簽核，含 Q4 業績數據與 5 大客戶分析，檔案已上傳共用雲端。', progress: 100 },
      { plan: '跟進 5 筆待結案訂單', dod: '5 筆訂單狀態更新至 CRM', result: '5 筆訂單皆已更新，其中 3 筆已成交（合計 128 萬），2 筆客戶確認下週簽約。', progress: 100 },
      { plan: '整理 11 月客戶名單並分級', dod: 'A/B/C 分級完成並匯出 Excel', result: '已完成 87 位客戶分級（A 級 12、B 級 31、C 級 44），Excel 已寄給主管與團隊。', progress: 100 },
      { plan: '與台達完成合約續約會議', dod: '續約條件確認並簽回', result: '續約會議已完成，合約金額 260 萬已簽回，掃描檔已上傳合約系統。', progress: 100 },
    ],
    yellow: [
      { plan: '完成大客戶聯發科提案書', dod: '提案書定稿寄出', result: '提案書初稿完成約 70%，報價頁面仍在等財務確認成本，預計明天寄出。', progress: 70 },
      { plan: '回收 10 份客戶滿意度問卷', dod: '10 份問卷回收並彙整', result: '目前回收 6 份，剩餘 4 家客戶尚未回覆，持續跟進中。', progress: 60 },
      { plan: '安排 3 場產品 Demo', dod: '3 場 Demo 時間敲定', result: '已敲定 2 場，第 3 場客戶窗口出差尚未回覆。', progress: 65 },
    ],
    red: [
      { plan: '更新 CRM 內 20 筆客戶聯絡資訊', dod: '20 筆資料更新完畢', result: '今天忙著跑客戶，還沒時間處理，明天再做。', progress: 0 },
      { plan: '完成競品價格調查表', dod: '調查表含 5 家競品價格', result: '尚未開始，資料還沒收到。', progress: 0 },
    ],
  },
  m2: {
    green: [
      { plan: '完成雙 11 活動 EDM 設計與發送', dod: 'EDM 發送給 1.2 萬名會員', result: 'EDM 已於 10:00 發送完成，共寄出 12,340 封，開信率 28.5%，報表已附連結。', progress: 100 },
      { plan: '撰寫 3 篇社群貼文並排程', dod: '3 篇貼文完成排程', result: '3 篇貼文（FB、IG、LINE）皆已完成並排程至本週三至五，截圖已附。', progress: 100 },
      { plan: '完成 11 月行銷預算表', dod: '預算表交付財務', result: '預算表已完成並寄給財務部林欣怡，總額 48 萬，含 6 個活動項目明細。', progress: 100 },
      { plan: '聯繫 5 位 KOL 詢問合作報價', dod: '5 位 KOL 報價收齊', result: '已完成 5 位 KOL 聯繫並收齊報價，整理成比較表交付主管。', progress: 100 },
    ],
    yellow: [
      { plan: '完成品牌官網改版文案', dod: '首頁+3 個產品頁文案定稿', result: '首頁文案已完成，3 個產品頁還在撰寫中，約完成一半。', progress: 50 },
      { plan: '製作年終活動企劃書', dod: '企劃書定稿', result: '企劃書架構與預算部分完成，創意部分仍需與設計討論，進度約 60%。', progress: 60 },
      { plan: '分析 10 月廣告成效報告', dod: '報告含 ROAS 與建議', result: '數據已匯出並整理完成，但建議部分還在撰寫，預計明天完成。', progress: 75 },
      { plan: '更新 Google Ads 關鍵字清單', dod: '新增 30 組關鍵字', result: '已新增 18 組關鍵字，剩餘 12 組還需與業務確認產品名稱。', progress: 60 },
    ],
    red: [
      { plan: '整理 11 月社群素材庫', dod: '素材分類上傳雲端', result: '沒時間處理，設計那邊素材還沒給我。', progress: 0 },
      { plan: '完成 11 月競品行銷活動觀察報告', dod: '報告涵蓋 3 家競品', result: '還沒開始。', progress: 0 },
    ],
  },
  m3: {
    green: [
      { plan: '修復訂單 API 逾時問題', dod: 'PR 合併且壓測通過', result: 'PR #482 已合併，壓測 P95 從 3.2s 降至 420ms，監控截圖已附。', progress: 100 },
      { plan: '完成會員登入模組單元測試', dod: '測試覆蓋率 ≥ 80%', result: '已完成 36 個測試案例，覆蓋率達 86%，CI 全綠，PR #485 已合併。', progress: 100 },
      { plan: '升級資料庫至 PostgreSQL 15', dod: 'Staging 升級完成無異常', result: 'Staging 升級完成，執行 12 項回歸測試全部通過，升級筆記已更新至 Wiki。', progress: 100 },
      { plan: '實作報表匯出功能', dod: 'CSV/Excel 匯出上線 staging', result: 'CSV 與 Excel 匯出功能已部署至 staging，QA 驗收通過，PR #490 已合併。', progress: 100 },
      { plan: '撰寫 API 文件', dod: 'Swagger 文件涵蓋 15 支 API', result: 'Swagger 文件已完成 15 支 API 並發布至內部文件站，連結已附。', progress: 100 },
      { plan: '處理 Sentry 高優先錯誤 5 則', dod: '5 則錯誤修復並關閉', result: '5 則錯誤皆已修復並部署，Sentry 已全部標記 Resolved。', progress: 100 },
    ],
    yellow: [
      { plan: '完成通知服務重構', dod: '重構 PR 送審', result: '重構完成約 80%，還有 Email 模組尚未遷移，PR 預計明天送審。', progress: 80 },
      { plan: '優化首頁載入速度', dod: 'LCP < 2.5s', result: '已完成圖片 lazy load 與程式碼分割，LCP 從 4.1s 降至 2.9s，還差一點，繼續調整快取。', progress: 70 },
    ],
    red: [
      { plan: '補齊付款模組整合測試', dod: '整合測試覆蓋 3 種付款方式', result: '昨天被拉去處理線上事故，完全沒碰到這個。', progress: 0 },
    ],
  },
  m4: {
    green: [
      { plan: '結案 20 張客訴工單', dod: '20 張工單標記已解決', result: '已結案 23 張工單，客戶滿意度平均 4.6 分，報表已匯出。', progress: 100 },
      { plan: '完成客服 SOP 更新 v2.3', dod: 'SOP 文件發布至內部知識庫', result: 'SOP v2.3 已發布至知識庫，更新 8 項流程，並通知全組 12 人閱讀。', progress: 100 },
      { plan: '完成 11 月新人教育訓練', dod: '2 位新人完成培訓測驗', result: '2 位新人培訓完成，測驗成績 92 與 88 分，簽到表已歸檔。', progress: 100 },
    ],
    yellow: [
      { plan: '分析 10 月客訴類型並產出報告', dod: '報告含前 5 大客訴分類與對策', result: '分類統計已完成，前 5 大類別出來了，但對策部分還在跟產品部門討論。', progress: 65 },
      { plan: '建置客服 FAQ 聊天機器人腳本', dod: '30 條 FAQ 腳本完成', result: '目前完成 17 條，剩餘部分需要技術部確認答案。', progress: 55 },
      { plan: '處理 VIP 客戶退款爭議案', dod: '退款方案雙方確認', result: '已與客戶通話兩次，方案初步達成共識，等財務確認退款流程。', progress: 70 },
      { plan: '盤點客服系統權限', dod: '權限清單更新', result: '清單整理一半，還有 6 位同事權限待確認。', progress: 50 },
    ],
    red: [
      { plan: '完成客服人員排班表（12 月）', dod: '排班表公告', result: '還沒排，大家休假需求還沒收齊。', progress: 0 },
      { plan: '回覆 Google 商家評論 15 則', dod: '15 則評論回覆完成', result: '今天會議太多沒時間處理。', progress: 0 },
      { plan: '更新客服話術手冊', dod: '手冊新增 10 條話術', result: '沒做。', progress: 0 },
      { plan: '整理 10 月退貨統計', dod: '統計表交付主管', result: '系統資料還沒匯出，之後再弄。', progress: 0 },
    ],
  },
  m5: {
    green: [
      { plan: '完成 10 月月結帳務', dod: '月結報表交付財務主管', result: '10 月月結已完成，損益表與資產負債表已交付主管簽核，差異 0 筆。', progress: 100 },
      { plan: '核對 45 筆廠商請款單', dod: '45 筆核對完成並入帳', result: '45 筆請款單全數核對完成並入帳，其中 2 筆金額有誤已退回廠商修正。', progress: 100 },
      { plan: '完成 11 月薪資試算', dod: '薪資表交付 HR 確認', result: '薪資表已完成 68 人試算並交付 HR，HR 已回覆確認無誤。', progress: 100 },
      { plan: '申報 9-10 月營業稅', dod: '申報完成取得收執聯', result: '營業稅已於今日完成申報，收執聯已掃描歸檔。', progress: 100 },
      { plan: '整理固定資產盤點清冊', dod: '清冊完成 120 項資產', result: '清冊已完成 124 項資產登錄，差異 2 項已註記，Excel 已上傳。', progress: 100 },
      { plan: '完成 Q4 預算執行率報告', dod: '報告交付各部門主管', result: '報告已完成並寄給 6 位部門主管，整體執行率 78%。', progress: 100 },
      { plan: '更新會計科目對照表', dod: '對照表更新上傳', result: '對照表已更新 14 項科目並上傳共用資料夾，已通知相關同事。', progress: 100 },
    ],
    yellow: [
      { plan: '完成年度稽核資料準備', dod: '稽核清單 30 項文件備齊', result: '已備齊 24 項，剩餘 6 項需等業務部提供合約影本。', progress: 80 },
      { plan: '導入新版發票系統測試', dod: '測試 10 筆開立案例', result: '已測試 7 筆正常，3 筆折讓案例遇到系統錯誤，已回報廠商處理中。', progress: 70 },
    ],
    red: [],
  },
}

// 5 位主要員工 15 天的燈號序列（可控的、具真實感的分布）
const PATTERNS: Record<string, Light[]> = {
  m1: ['green', 'green', 'yellow', 'green', 'red', 'green', 'yellow', 'green', 'green', 'red', 'green', 'yellow', 'green', 'green', 'green'],
  m2: ['yellow', 'green', 'yellow', 'red', 'green', 'yellow', 'green', 'yellow', 'yellow', 'green', 'red', 'yellow', 'green', 'yellow', 'green'],
  m3: ['green', 'green', 'green', 'yellow', 'green', 'green', 'green', 'green', 'yellow', 'green', 'green', 'red', 'green', 'green', 'green'],
  m4: ['red', 'yellow', 'red', 'yellow', 'green', 'red', 'yellow', 'red', 'yellow', 'green', 'red', 'yellow', 'red', 'green', 'yellow'],
  m5: ['green', 'green', 'green', 'green', 'yellow', 'green', 'green', 'green', 'green', 'green', 'green', 'yellow', 'green', 'green', 'green'],
}

/** 各部門通用任務池（供其餘 55 位員工使用） */
const DEPT_POOL: Record<string, Pool> = {
  業務部: POOL.m1,
  行銷部: POOL.m2,
  研發部: POOL.m3,
  客服部: POOL.m4,
  財務部: { ...POOL.m5, red: [
    { plan: '完成 10 月零用金核銷', dod: '核銷單據全數入帳', result: '單據還沒收齊，還沒開始核銷。', progress: 0 },
    { plan: '更新廠商付款排程表', dod: '排程表交付主管', result: '今天都在開會，沒有時間處理。', progress: 0 },
  ] },
  人資部: {
    green: [
      { plan: '完成 3 位工程師職缺面試安排', dod: '3 位候選人面試時間確認', result: '3 位候選人面試皆已確認，排定本週三、四，面試官日曆邀請已寄出。', progress: 100 },
      { plan: '完成 11 月新人報到流程', dod: '2 位新人完成報到與帳號開通', result: '2 位新人已完成報到，門禁卡、Email、系統帳號皆已開通，報到表已歸檔。', progress: 100 },
      { plan: '彙整 Q4 員工滿意度問卷', dod: '問卷回收率 ≥ 80% 並產出報告', result: '問卷回收 52/60 份（87%），報告已完成並寄給管理層，整體滿意度 4.1 分。', progress: 100 },
      { plan: '完成 12 月教育訓練課程排程', dod: '4 門課程講師與時間確認', result: '4 門課程講師與教室皆已確認，課表已公告至內部公告欄。', progress: 100 },
    ],
    yellow: [
      { plan: '更新員工手冊 v3.0', dod: '手冊定稿送法務審核', result: '手冊已更新 6 章，剩餘 2 章請假制度仍在與主管確認，進度約 70%。', progress: 70 },
      { plan: '完成年度績效考核表單設計', dod: '表單定稿並上線系統', result: '表單架構完成，評分項目仍在收集各部門意見，約完成一半。', progress: 50 },
      { plan: '盤點員工證照與訓練時數', dod: '60 人紀錄更新完畢', result: '已更新 38 人，其餘待各部門回傳證照影本。', progress: 60 },
    ],
    red: [
      { plan: '完成 11 月出缺勤異常清單', dod: '異常清單寄送各部門主管', result: '系統報表還沒匯出，之後再弄。', progress: 0 },
      { plan: '寄送 5 位候選人 Offer Letter', dod: '5 份 Offer 寄出', result: '還在等主管簽核薪資，沒有進度。', progress: 0 },
    ],
  },
  產品部: {
    green: [
      { plan: '完成會員中心改版 PRD', dod: 'PRD 定稿並交付研發', result: 'PRD 已完成 18 頁並於需求評審會通過，研發已排入下個 Sprint，文件連結已附。', progress: 100 },
      { plan: '完成結帳流程 UI 設計稿', dod: '8 張設計稿交付 Figma', result: '8 張設計稿已完成並交付至 Figma，研發與 QA 已確認無疑問。', progress: 100 },
      { plan: '完成 10 月產品數據週報', dod: '週報含 DAU/轉換率分析寄出', result: '週報已完成並寄出，DAU 達 12,800（+6%），結帳轉換率 3.4%，附儀表板連結。', progress: 100 },
      { plan: '進行 5 位用戶訪談', dod: '5 場訪談完成並產出摘要', result: '5 場訪談皆已完成，訪談摘要與 3 項洞察已整理至 Notion。', progress: 100 },
    ],
    yellow: [
      { plan: '完成 App 推播功能需求規格', dod: '規格文件送審', result: '規格主體完成約 75%，推播頻率規則仍在與行銷討論。', progress: 75 },
      { plan: '整理競品功能比較表', dod: '比較表涵蓋 4 家競品', result: '已完成 3 家競品分析，第 4 家資料還在蒐集中。', progress: 70 },
      { plan: '完成首頁改版 A/B 測試設計', dod: '測試方案定稿', result: '方案初稿完成，樣本數估算還需與數據團隊確認，進度一半。', progress: 50 },
    ],
    red: [
      { plan: '完成 Q1 產品路線圖初稿', dod: '路線圖初稿交付主管', result: '這週會議太多，完全沒時間動。', progress: 0 },
      { plan: '整理 11 月用戶回饋分類', dod: '回饋分類表更新', result: '還沒開始。', progress: 0 },
    ],
  },
  營運部: {
    green: [
      { plan: '完成 11 月上旬採購訂單審核', dod: '28 張採購單審核完畢', result: '28 張採購單全數審核完成並送出，其中 2 張因價格異常退回重報。', progress: 100 },
      { plan: '完成倉庫 A 區盤點', dod: '盤點差異率 < 1%', result: 'A 區盤點完成，1,240 項 SKU 差異 6 項（0.48%），盤點表已上傳。', progress: 100 },
      { plan: '更新 11 月物流出貨排程', dod: '排程表交付物流商', result: '排程表已更新並寄給 3 家物流商，皆已回覆確認。', progress: 100 },
      { plan: '完成 3 家新供應商評鑑', dod: '評鑑表完成並送審', result: '3 家供應商評鑑完成，2 家通過、1 家需補件，評鑑表已送主管審核。', progress: 100 },
    ],
    yellow: [
      { plan: '完成 Q4 庫存週轉率分析', dod: '分析報告寄出', result: '數據已拉出並完成 60%，滯銷品建議還在與業務討論。', progress: 60 },
      { plan: '談定包材供應商年度合約', dod: '合約條件確認', result: '價格已談到目標區間，付款條件雙方仍在協商中。', progress: 70 },
      { plan: '完成退貨流程 SOP 修訂', dod: 'SOP 文件發布', result: 'SOP 修訂一半，客服端流程待確認。', progress: 50 },
    ],
    red: [
      { plan: '完成 10 月運費對帳', dod: '對帳完成並確認差異', result: '物流商帳單還沒給，等對方。', progress: 0 },
      { plan: '更新安全庫存水位設定', dod: '120 項 SKU 設定更新', result: '沒做，先處理急單。', progress: 0 },
    ],
  },
}

/** 可重現的隨機數（讓示範資料每次載入一致） */
function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const PROFILES: { name: string; w: [number, number, number]; p: number }[] = [
  { name: 'star', w: [0.82, 0.14, 0.04], p: 0.2 },
  { name: 'solid', w: [0.62, 0.28, 0.1], p: 0.35 },
  { name: 'average', w: [0.45, 0.35, 0.2], p: 0.3 },
  { name: 'struggling', w: [0.22, 0.36, 0.42], p: 0.15 },
]

function pickLight(rng: () => number, w: [number, number, number]): Light {
  const x = rng()
  return x < w[0] ? 'green' : x < w[0] + w[1] ? 'yellow' : 'red'
}

/** 刻意安排「連續 3 天紅燈」的警示案例 */
const STREAK_IDS = new Set(['d1-3', 'd4-5', 'd8-2'])

function makeTask(member: Member, date: string, seed: Seed, submittedAt: string): Task {
  const task: Task = {
    id: uid(),
    memberId: member.id,
    date,
    plan: seed.plan,
    dod: seed.dod,
    createdAt: addDays(date, -1) + 'T18:30:00',
    result: seed.result,
    progress: seed.progress,
    submittedAt,
  }
  const graded = gradeByRules(task, seed.result, seed.progress)
  task.light = graded.light
  task.comment = graded.comment
  task.gradedBy = 'rules'
  return task
}

export function buildDemoTasks(): Task[] {
  const base = today()
  const tasks: Task[] = []
  const rng = mulberry32(20261108)

  for (const member of DEMO_MEMBERS) {
    const isCore = member.id in PATTERNS
    const pool = isCore ? POOL[member.id] : DEPT_POOL[member.dept ?? '營運部']
    let pattern: Light[]
    let weights: [number, number, number] = [0.6, 0.3, 0.1]
    if (isCore) {
      pattern = PATTERNS[member.id]
    } else {
      const roll = rng()
      let acc = 0
      let profile = PROFILES[PROFILES.length - 1]
      for (const p of PROFILES) {
        acc += p.p
        if (roll < acc) {
          profile = p
          break
        }
      }
      weights = profile.w
      pattern = Array.from({ length: 15 }, () => pickLight(rng, weights))
      if (STREAK_IDS.has(member.id)) pattern.splice(12, 3, 'red', 'red', 'red')
    }
    const counters: Record<Light, number> = { green: 0, yellow: 0, red: 0 }
    const take = (light: Light) => {
      const seeds = pool[light]
      const seed = seeds[counters[light] % seeds.length]
      counters[light]++
      return seed
    }
    for (let i = 0; i < 15; i++) {
      const date = addDays(base, -(15 - i))
      tasks.push(makeTask(member, date, take(pattern[i]), date + 'T18:05:00'))
    }
    // 今日任務：主要 5 位保留待結案（方便測試）；其餘約 6 成已結案、4 成待結案
    if (!isCore) {
      const closed = rng() < 0.6 && !STREAK_IDS.has(member.id)
      if (closed) {
        tasks.push(makeTask(member, base, take(pickLight(rng, weights)), base + 'T17:40:00'))
        continue
      }
      const seed = pool.green[counters.green % pool.green.length]
      tasks.push({ id: uid(), memberId: member.id, date: base, plan: seed.plan, dod: seed.dod, createdAt: addDays(base, -1) + 'T18:40:00' })
    }
  }

  // 主要 5 位今日尚待結案的任務（讓使用者可直接測試送審）
  const pendingPlans: Record<string, Seed> = {
    m1: { plan: '拜訪 2 家潛在客戶並建立 CRM 商機', dod: '2 筆商機建立於 CRM', result: '', progress: 0 },
    m2: { plan: '完成 12 月聖誕活動主視覺提案', dod: '3 款主視覺提案交付', result: '', progress: 0 },
    m3: { plan: '完成購物車服務效能優化', dod: 'P95 延遲 < 500ms 並合併 PR', result: '', progress: 0 },
    m4: { plan: '結案 15 張客訴工單', dod: '15 張工單標記已解決', result: '', progress: 0 },
    m5: { plan: '完成 11 月上半月現金流預測', dod: '預測表交付財務主管', result: '', progress: 0 },
  }
  for (const member of CORE_MEMBERS) {
    const s = pendingPlans[member.id]
    tasks.push({
      id: uid(),
      memberId: member.id,
      date: base,
      plan: s.plan,
      dod: s.dod,
      createdAt: addDays(base, -1) + 'T18:40:00',
    })
  }
  return tasks
}
