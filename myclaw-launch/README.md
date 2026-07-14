# myClaw 產品發表會 — Every Call Matters

自包含的 3 分鐘產品發表會舞台(單一 HTML 檔,無外部相依),
以第一線客服的視角講述 myClaw(AI Sales Copilot)的品牌時刻。

## 兩個版本

| 檔案 | 版本 | 視覺 |
|---|---|---|
| `v2.html` | **v2「The Signal」(推薦)** | 深空黑 + 電光青主色、紅色只留給高潮;玻璃態 UI;GSAP 180s 母時間軸(流體轉場、可 scrub);Canvas 粒子場 8 種形態隨劇情變形(星塵漣漪 → 亂流 → 球體聚合 → 資料流 → 紅色爆發 → 管線流 → 塵埃 → 餘燼);Tailwind 編譯後內嵌 |
| `index.html` | v1 | 深海軍藍 + 蝦紅主色,CSS 轉場節拍引擎 |

v2 額外支援:進度條點擊跳轉、`prefers-reduced-motion` 靜態退化。

## 使用方式

直接用瀏覽器開啟 `v2.html`(或 `index.html`)。

- **自動播放整場(3:00)**:依 run of show 自動演完全場,含 90 秒影片段落。
- **手動簡報模式**:`←` / `→` 逐段控制,適合現場搭配講者。
- `Space` 播放/暫停 · `C` 講稿字幕 · `M` 音效(電話鈴聲/提示音)· `F` 全螢幕。

## Run of Show

| 時間 | 段落 |
|---|---|
| 00:00–00:35 | 簡報 · Every Call Matters(建立共鳴) |
| 00:35–00:55 | 簡報 · 四個挑戰(商機流失) |
| 00:55–02:25 | 影片 90 秒 · myClaw 改變一通電話的命運(6 幕) |
| 02:25–02:50 | 簡報 · 四大價值 + Business Impact |
| 02:50–03:00 | Ending · Every Conversation Creates Revenue. |

影片六幕:Logo/來電 → 分割畫面 AI 即時分析 → 🔥 High Opportunity 94% →
客服接手(手機+Web 同步 prototype)→ CRM/Ticket/Sales 自動接續 → 成果 Dashboard。

吉祥物與徽章為內嵌 SVG,依品牌參考圖重繪;講稿字幕即簡報台詞,可關閉。
