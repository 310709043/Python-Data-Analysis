# MyVoca — AI Service Intelligence Prototype

**MyClaw Enterprise AI Agent Platform · Taiwan Mobile**

MyVoca 是企業 AI 智慧客服與語音服務 Agent 平台的互動展示 Prototype —
透過 TAIPBX Telecom 通訊能力，結合 Generative AI、Voice AI 與 Customer
Intelligence，呈現「企業 AI Service Brain」的產品概念。

## Pages

| # | 頁面 | 內容 |
|---|------|------|
| 1 | **AI Command Center** | 企業 AI 客服大腦 Dashboard — AI Agents / Active Calls / Sentiment / Resolution Rate |
| 2 | **AI Voice Experience Demo** | 來電接通動畫 → 逐字 Transcript → AI 意圖/情緒分析 → AI Brain 建議與行動 |
| 3 | **AI Whisper Copilot** | 通話中即時耳語提示、推薦回答與 AI Confidence |
| 4 | **AI Service Twin** | Every Employee Has An AI Twin — 客服經驗數位分身 |
| 5 | **Customer Intelligence 360** | Customer Twin — LTV / 服務歷史 / 偏好 / 情緒趨勢 / 流失風險 |
| 6 | **AI Operation Dashboard** | 主管視角 — 今日 KPI、來電量、團隊狀態與 AI 生成洞察 |

## Tech Stack

- **React 18 + TypeScript** (Vite)
- **Tailwind CSS** — 品牌色 / glassmorphism design tokens
- **Framer Motion** — 頁面轉場、接通動畫、數據動畫、卡片浮現
- **Lucide Icons**

## Getting Started

```bash
cd myvoca-prototype
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
```

## Structure

```
src/
├── App.tsx                  # Page routing + transitions
├── components/              # Reusable UI (nav, cards, charts, typewriter, waveform…)
├── pages/                   # 6 prototype pages
└── data/mock.ts             # Central demo mock data
```

> 品牌 logo 目前為 `src/components/Logo.tsx` 中的 SVG 佔位標誌，
> 可直接替換為正式 MyClaw logo 資產。所有數據皆為 Demo 用 mock data。
