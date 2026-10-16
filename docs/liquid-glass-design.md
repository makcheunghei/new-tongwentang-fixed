# 重新設計：系統工具與 Liquid Glass

使用者否定 3.0.0 玉綠色及書法字形設計。本次移除該視覺方向，改用中性色、系統字體、緊湊列式操作及藍色主動作。保留已有資料、導航可及性與功能限制。

## 介面決定（實作前）

- Safari：小型品牌列；簡轉繁／繁轉簡兩個正常字級操作列；自動方向為次要動作；設定作底部連結。沒有巨型字形、口號或裝飾卡片。
- 設定：頂部緊湊工具列、寬屏簡潔側欄、手機底部浮動膠囊導航。內容仍是不透明群組，沒有玻璃疊玻璃。
- Apple App：iOS／macOS 26 起用 SwiftUI NavigationStack 和系統 glassProminent 啟用按鈕。舊版系統保留 HTML 啟用頁。玻璃只屬於功能層，啟用說明及內容不加玻璃。
- HTML 的透明導航只是視覺呼應，並非 SwiftUI Liquid Glass，不宣稱有系統折射或跟隨系統玻璃滑桿。

```
手機設定                     Safari 面板
新同文堂                 完成  圖示 新同文堂
一般                           簡體 → 繁體       →
[設定列                    ]   繁體 → 簡體       →
[設定列                    ]   自動判斷方向     ⇄
  （浮動：一般 規則 詞庫 關於）  設定與詞庫       ⚙
```

配色角色（淺／深）：背景 #F2F2F7／#101014；內容 #FFFFFF／#1C1C1E；文字 #1C1C1E／#F5F5F7；次文字 #636366／#B8B8BE；強調 #0066CC／#71B7FF；刪除 #B32630／#FFB4B8。玻璃導航上的文字採主文字，選取另有實心底及粗體。正文 16–17px 相對字級、輔助 13–14px、標題 28px；操作目標至少 44px。

## 技能驗證清單

來源：使用者指定 `/Users/makcheunghei/.config/magpie/library/skills/liquid-glass/SKILL.md`。

- [x] 核對部署平台：iOS 17／macOS 既有最低版本；SwiftUI 新介面僅在 26 起載入。
- [x] 區分功能層（導航、啟用按鈕）與內容層（步驟、文字、群組）。
- [x] 優先使用 NavigationStack、ToolbarItem 及系統按鈕樣式。
- [x] 核對 API、編譯與模擬器啟動。
- [x] 執行 `check_glass.py`（0 error／0 warning）及 iOS／macOS 建置。
- [x] 深淺色截圖、200% 網頁字級、最大原生輔助字級及 Escape／焦點還原檢查。
- [ ] 尚未完成真機 VoiceOver、系統玻璃滑桿兩端與降低透明度的人工審核，不宣稱完整無障礙認證。

參考已讀章節：`02-hig-principles.md › Where glass belongs / No glass on glass / Legibility`；`01-api-reference.md › Button styles`；`05-accessibility.md › What the system adapts / Contrast / Dynamic Type and hit targets`；`08-system-chrome.md › Ground rules / Toolbars and the navigation bar`；`checklists/pre-ship-checklist.md`。

## 實作驗證

- `npm test`：110 項測試、型別、lint、Chromium／Firefox 建置與資源檢查通過。
- WebKit 面板由 120px 初始量度恢復至 320px；所有操作列至少 48px 高，內容約 302px。
- Chromium 設定預覽在 390px／1280px 無橫向溢出；200% 字級仍可重排；Escape 關閉編輯器後焦點還原。
- SwiftUI 在 iPhone／iPad 模擬器實際啟動；iOS 17 部署目標保留，26 API 由執行時可用性分支保護。
- 大輔助字級將操作移入捲動內容，避免長文字玻璃按鈕固定遮擋畫面；步驟數字使用 ScaledMetric。
- 玻璃 API 只出現在原生功能層。網頁導航以 CSS 透明效果呼應，降低透明度／提高對比時有不透明後備。

- WebKit 實測發現原生 select 忽略最小高度，只有 22px；移除預設外觀後仍使用原生選單行為，並核對欄位高度達到 44px。

- CI 轉換器的預設 macOS 10.14 不能編譯 Combine 狀態模型；建置腳本明確指定 macOS 13，以統一本機與 CI 的最低版本。原生玻璃仍只在 26 起載入。
