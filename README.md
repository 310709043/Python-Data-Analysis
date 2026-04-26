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

## 快速開始

```bash
pip install -r requirements.txt
streamlit run app.py
```

執行後可在瀏覽器中開啟本地網址（預設 `http://localhost:8501`）操作平台。

## 注意事項

- 此平台為教學與研究用途，不構成任何投資建議。
- 金融市場有風險，請自行做好風險管理。
