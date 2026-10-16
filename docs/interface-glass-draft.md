# 延伸功能玻璃介面草稿

這次只修改 Safari HTML 面板及共用設定介面。沒有變更原生 App、轉換核心、設定格式或版本號；沒有實測、安裝、打包或發佈。

## 釐清支援範圍

Safari Web Extension 的 popup 使用 HTML、CSS、JavaScript，不能直接使用 SwiftUI 的 `glassEffect`。WebKit 支援 `backdrop-filter`，所以延伸功能仍可呈現背景模糊、半透明、邊緣高光與陰影。這份草稿採用這些網頁效果，不宣稱是原生 Liquid Glass，亦不依賴 Safari 會透出後方網頁。

上一版面板的操作區採實色背景，只有設定導航有透明效果；這是看不到預期質感的主要介面原因。

## 本次視覺方向

- 在延伸功能文件內加入低對比藍紫背景，給透明操作區可見的背景層次；沒有持續動畫。
- 面板操作區共用一層半透明表面，加入模糊、白色邊緣高光及內外陰影。內部按鈕使用透明填色，避免多層模糊堆疊。
- 設定入口成為獨立浮動膠囊；設定頁的頁首、側欄及底部導航共用玻璃表面。
- 保留正常字級、清楚標籤及至少 44px 的設計目標；此輪沒有量度實際渲染結果。
- 內容表單使用較實在的淺色或深色背景。減少透明度、提高對比及不支援背景模糊時提供不透明後備。

## 交付狀態

提供離線靜態 HTML 預覽，重用本次實際 CSS，沒有接上擴充功能 API。這些是畫面草稿，不是瀏覽器或真機驗證證據。依照本次要求，不執行自動測試、互動測試、真機安裝及 Release。

參考：[Apple — Safari web extensions](https://developer.apple.com/documentation/safariservices/safari-web-extensions)、[WebKit — Introducing Backdrop Filters](https://webkit.org/blog/3632/introducing-backdrop-filters/)。

## SwiftUI Expert 與 Build iOS Apps 核對

已讀取 SwiftUI Expert 的 SwiftUI／WebKit 指引，以及 Build iOS Apps 的 SwiftUI Liquid Glass 指引，僅作來源與架構檢視，沒有啟動建置、模擬器或除錯工具。

目前 Safari action 在 `manifest.js` 指向 `popup.html`，所以面板仍由 Safari 載入網頁。App 的 `ViewController.swift` 另行在 26 或以上載入 SwiftUI `WelcomeScreen`，其啟用按鈕使用 `.glassProminent`。兩者是不同介面入口；在外層 App 加上 SwiftUI 材質不會自動影響延伸功能面板。

這兩個插件可協助原生 App 的佈局、狀態管理及玻璃 API 使用，但不會改變 Safari Web Extension 的 HTML 介面入口。此次繼續只調整延伸功能的網頁介面；原生 App 的額外重構不納入本輪。
