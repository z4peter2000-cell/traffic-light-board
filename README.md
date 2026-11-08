# AI 紅黃綠燈日清績效看板（Traffic-Light Daily Accountability Board）

團隊成員每天填寫「明日預計完成事項 + Definition of Done」，隔日提交實際成果，由 AI 評審引擎判定 🟢/🟡/🔴，
並計算「🔥 破局含金量」（任務定級 100/50/10 × 燈號兌現率），公開在月度透明排行榜（部門總覽 / Top10 雙榜 / 全員總表）。

- React 19 + TypeScript + Tailwind CSS + Lucide + Vite
- 雙模評審：內建規則引擎（免 Key）／ OpenAI、Gemini（API 設定，失敗自動退回規則）
- localStorage 持久化、CSV 匯出、深淺色模式、60 人 × 8 部門示範資料

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```
