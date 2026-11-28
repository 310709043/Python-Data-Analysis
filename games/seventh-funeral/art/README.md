# 第七次葬禮：美術素材

在 Pixelwright 繪製的像素角色。原始專案（可以繼續編輯、重新輸出）：
https://studio.pixelwright.app/?cloud=prj_af2a1f3a011149e8

| 角色 | 尺寸 | 動畫 | 檔案 |
|---|---|---|---|
| 阿生（主角） | 48×48，面向右 | idle、walk、attack、hurt、death | `a-sheng/` |
| 殭屍 | 48×48，面向右 | idle、hop、hurt、death | `jiangshi/` |

- 檔案是 PixiJS 格式：`.png` 是一整排的精靈圖，`.json` 記錄每一格的位置和播放時間。
- 面向左時，在遊戲裡水平翻轉即可。
- 網頁原型已經把這兩張圖內嵌進去（`../prototype/seventh-funeral.html` 裡的 `SHEET_DATA`）。
- 之後換成 Godot 時，在 Pixelwright 用 `godot` 格式重新輸出，就會得到 Godot 4 的 SpriteFrames（`.tres`）。

## 調色盤（額外加的色階）

| 色階 | 用途 |
|---|---|
| shroud | 壽衣白 |
| corpse | 屍白膚色 |
| jade | 殭屍青灰膚色 |
| navy | 清朝官服藏青 |
| hair | 髮黑 |

## 還沒重畫的角色

送葬人偶、紙紮人、紙新娘、抬棺人、金童玉女、道士、娘：目前在原型裡仍是程式畫的單張像素圖。
