# Python-Data-Analysis

Python數據分析練習，包括數據讀取、評估、清洗、分析、可視化等。

## 黃金兌美金交易技術分析平台

此專案新增一個可直接執行的 **Streamlit 技術分析平台**，針對黃金兌美金（XAU/USD）提供：

- K線圖（資料源：Yahoo Finance 的 `GC=F`）
- 可調整參數的 SMA（短中期均線）
- RSI 指標
- MACD 指標與柱狀圖
- 布林通道
- 簡易多空訊號判斷（偏多 / 偏空 / 中性）
- 最近資料表格檢視

## Agent Office：看著你的 AI agent 上班

`agent_office/` 是一間像素風虛擬辦公室，即時顯示各個 AI agent 正在工作、思考、等待、出錯或休息，
agent 之間交接成果時還會拿著文件走到對方座位。零依賴，一行指令啟動：

```bash
python agent_office/server.py --demo
```

詳細用法（如何讓你的 agent 回報狀態、接上 Claude Code）見 [agent_office/README.md](agent_office/README.md)。

## 遊戲開發：回聲病棟 ＆ 第七次葬禮

`games/` 是兩款 Steam 恐怖遊戲的規劃總部：可玩的網頁原型、遊戲設計文件、里程碑、待辦清單與開發日誌。
從 [games/README.md](games/README.md) 開始看。

## 快速開始

```bash
pip install -r requirements.txt
streamlit run app.py
```

執行後可在瀏覽器中開啟本地網址（預設 `http://localhost:8501`）操作平台。

## 注意事項

- 此平台為教學與研究用途，不構成任何投資建議。
- 金融市場有風險，請自行做好風險管理。
