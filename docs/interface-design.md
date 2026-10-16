# 新同文堂介面重設

產品定位：安靜、可靠的中文閱讀工具。主要任務是轉換目前網頁，其次才是管理自動轉換、網站規則及詞庫。原有資料格式與平台能力限制維持。

## 設計決定（實作前）

移除舊版橫向桌面分頁及表格式編輯介面。寬屏採側欄，窄屏採底部導航；同一份設定資料，不另建手機版。唯一的識別元素是可操作的「简／繁」字形配對，避免裝飾性儀表板、漸層或仿製系統玻璃。

六個語意色角色（淺／深）：背景 #F3F5F3／#101A16；面板 #FFFFFF／#19251F；主文字 #182722／#F0F4F1；次文字 #57665E／#AFBDB5；強調 #146852／#8AD6B8；刪除 #B83237／#FFB4B6。

WCAG 對比計算：主文字在面板 15.53／14.27:1；次文字 6.06／8.12:1；強調按鈕文字 6.71／10.49:1；刪除文字 5.92／9.40:1。系統字體、相對字級，正文 1rem、輔助 .85rem、頁標題 2rem；字形識別可使用本機中文字體。觸控目標至少 44px，文字可換行，無固定內容高度。

```
窄屏設定                 寬屏設定
品牌             關閉     品牌                         關閉
頁面標題                  側欄 │ 頁面標題
說明                           │ 說明
設定群組                       │ 設定群組（最大閱讀寬度）
設定群組                       │ 設定群組
底部：一般 規則 詞庫 關於       │

Safari 面板              App 啟用頁
新同文堂                  简 ⇄ 繁    閱讀熟悉的中文
轉換目前網頁                         平台啟用步驟
[ 繁 簡轉繁 ][ 简 繁轉簡 ]             開啟 Safari 設定
自動判斷方向                         網站權限說明
結果狀態
轉換設定與詞庫 →
```

只用短暫按下／懸停反饋；尊重減少動態效果及系統深淺色。編輯器使用原生 dialog 的焦點限制、Escape 取消與焦點還原。刪除與重設降低視覺優先度；儲存結果在頁內顯示。移除重複圖示與空白標籤，避免為每一行添加裝飾卡片。

## 採用的 Apple 指引

來源：使用者指定的 apple-design Skill；以下是其 references 中實際讀取的章節，套用到 HTML/CSS/React，不宣稱是原生 SwiftUI 控件。

- `hig/layout.md › Visual hierarchy`：相關功能分組；`Adaptability`：文字放大時允許重排。
- `hig/sidebars.md › Best practices / Mobile`：清楚顯示選取位置，窄屏優先底部導航。
- `hig/settings.md › Best practices`：減少設定，沿用系統外觀；不增加多餘外觀開關。
- `hig/accessibility.md › Vision / Mobility`：文字對比、200% 文字放大、足夠觸控範圍。
- `hig/buttons.md › Best practices / Style`：明確按下狀態，每個畫面避免過多突出按鈕。
- `hig/typography.md › Conveying hierarchy`：以字級、粗幼及顏色表達層級。
- `hig/dark-mode.md › Best practices / Dark Mode colors`：跟隨系統外觀，測試兩種模式。
- `hig/color.md › Best practices`：語意色、不要只用顏色傳達狀態。
- `hig/designing-for-ios.md`、`hig/designing-for-macos.md`、`cross-platform.md`：按可用空間及輸入方式調整。

## 驗證目標

手機／平板／桌面、淺深色、200% 字級均無橫向溢出；鍵盤可操作導航與編輯器；手機不顯示右鍵功能；設定匯入匯出及轉換通訊保持相容。WebKit 預覽只能證明網頁布局，真機 Safari 彈出宿主仍需裝置實測。

## 已執行的檢查

- Chromium 實際 React 頁面：390px 手機、744px 平板、1280px 桌面，無橫向溢出；200% 字級時頁首會分行。
- 實際鍵盤 Escape 關閉 dialog 後，焦點返回開啟按鈕；新增規則、驗證無效規則、儲存，以及新增詞組均完成操作測試。測試頁使用本機模擬 WebExtension API，並非真機 Safari 網站轉換測試。
- 本機 WebKit：120px 初始面板量度恢復至 320px；深色面板及 App 啟用頁完成截圖檢視。深色設定預覽另外以語意色覆寫檢查；系統深色 media query 由 WebKit 面板驗證。
- `npm test` 通過 110 項測試、型別、lint、兩種瀏覽器建置及封裝資源檢查。新增對話框取消／關閉、空白詞組來源的行為測試。
- Apple iOS archive、iOS simulator、macOS build 成功；驗證程式逐檔比對 Safari 擴充功能資源與版本。

### 最後的取捨

唔加入額外外觀開關、裝飾統計或動態背景。深淺色跟隨系統；保留既有轉換核心及資料格式。右鍵功能只在支援平台出現。這次範圍不包括 App Store 上架，也不宣稱已完成 VoiceOver 真機審核。
