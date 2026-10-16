# 延伸功能玻璃介面草稿

這次只修改 Safari HTML 面板及共用設定介面，已將獲接納的靜態方向整理成正式介面代碼，合併至 `master`，並更新安裝到 iPhone 及 iPad。沒有變更原生 App、轉換核心、設定格式或版本號；沒有發佈公開 Release。

## 釐清支援範圍

Safari Web Extension 的 popup 使用 HTML、CSS、JavaScript，不能直接使用 SwiftUI 的 `glassEffect`。WebKit 支援 `backdrop-filter`，所以延伸功能仍可呈現背景模糊、半透明、邊緣高光與陰影。這份草稿採用這些網頁效果，不宣稱是原生 Liquid Glass，亦不依賴 Safari 會透出後方網頁。

上一版面板的操作區採實色背景，只有設定導航有透明效果；這是看不到預期質感的主要介面原因。

## 本次視覺方向

- 在延伸功能文件內加入低對比藍紫背景，給透明操作區可見的背景層次；沒有持續動畫。
- 面板操作區共用一層半透明表面，加入模糊、白色邊緣高光及內外陰影。內部按鈕使用透明填色，避免多層模糊堆疊。
- 設定入口成為獨立浮動膠囊；設定頁的頁首、側欄及底部導航共用玻璃表面。
- 保留正常字級、清楚標籤及至少 44px 的設計目標；此輪沒有量度實際渲染結果。
- 內容表單及詞庫／規則編輯器使用不透明淺色或深色背景；玻璃只保留在操作與導航層。

## 實作收尾

- 面板操作區、設定入口、設定頁首及導航共用 `glass-surface`，以同一組材質變數處理深淺色、模糊、邊緣與陰影，避免各頁獨立覆寫。
- 預設先提供不透明表面；瀏覽器支援 `backdrop-filter` 或 `-webkit-backdrop-filter` 時才啟用玻璃。
- 瀏覽器回報「減少透明度」或「提高對比」時，移除背景模糊與裝飾背景；強制色彩模式使用系統顏色，保留目前頁面的選取邊框。這些網頁媒體查詢不代表可讀取所有版本 Safari 的原生無障礙設定。
- 補齊導航與按鈕的懸停、按下及鍵盤焦點樣式，包含文字編輯欄位；停用按鈕不顯示可操作的懸停狀態。觸控面板的懸停效果只在有懸停能力的裝置啟用。
- 保留手機底部導航、寬屏側欄、設定頁關閉按鈕、安全區域與現有平台功能限制。

## 交付狀態

提供離線靜態 HTML 預覽，重用本次實際 CSS，沒有接上擴充功能 API。設定值只用作展示，不讀取或修改使用者偏好。這些畫面不是瀏覽器或真機驗證證據。

獲准推進後，本機 `npm test`（型別、lint、既有單元測試、Chromium／Firefox 建置及資源檢查）、`npm run build:safari` 及 Safari 資源檢查均通過。其後獲准合併及安裝，`master` 已包含介面 commit `cd68b82`；版本維持 `3.1.0`。

## master 與實機試用（2026-10-16）

- [`master` CI](https://github.com/makcheunghei/new-tongwentang-fixed/actions/runs/38841261681) 的一般測試與 Safari 建置均通過。
- `npm run safari:build:ios` 成功；App 與 extension 的簽章、entitlements、profile 有效期及兩部裝置的安裝資格均已核對。
- 建置檢查逐檔確認 extension 內的網頁資源與最新 Safari 產物完全一致。
- iPhone 18 Pro Max 及 iPad Pro 13 吋（M5）均已更新安裝 `3.1.0`（build `30100`）。透過 `devicectl` 確認安裝位置已更新、App 啟動成功，而且啟動後程序仍然運行。
- 使用原有 bundle identifier 更新 App，沒有解除安裝或重設偏好；沒有建立公開 Release 或上傳商店。
- 上述結果只確認安裝、資源及主 App 啟動。Safari 面板、設定頁玻璃效果、轉換功能及網站權限仍待裝置內人工試用，不能視作已通過完整實機 UI 驗證。

參考：[Apple — Safari web extensions](https://developer.apple.com/documentation/safariservices/safari-web-extensions)、[WebKit — Introducing Backdrop Filters](https://webkit.org/blog/3632/introducing-backdrop-filters/)。

## SwiftUI Expert 與 Build iOS Apps 核對

已讀取 SwiftUI Expert 的 SwiftUI／WebKit 指引，以及 Build iOS Apps 的 SwiftUI Liquid Glass 指引，僅作來源與架構檢視，沒有啟動建置、模擬器或除錯工具。

目前 Safari action 在 `manifest.js` 指向 `popup.html`，所以面板仍由 Safari 載入網頁。App 的 `ViewController.swift` 另行在 26 或以上載入 SwiftUI `WelcomeScreen`，其啟用按鈕使用 `.glassProminent`。兩者是不同介面入口；在外層 App 加上 SwiftUI 材質不會自動影響延伸功能面板。

這兩個插件可協助原生 App 的佈局、狀態管理及玻璃 API 使用，但不會改變 Safari Web Extension 的 HTML 介面入口。此次繼續只調整延伸功能的網頁介面；原生 App 的額外重構不納入本輪。
