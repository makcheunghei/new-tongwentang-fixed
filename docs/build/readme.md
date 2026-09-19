# 建置說明

## 專案位置

[makcheunghei/new-tongwentang-fixed](https://github.com/makcheunghei/new-tongwentang-fixed)

## 環境需求

- Node.js 22 或以上
- npm 10 或以上

## 建置步驟

- 執行 `npm ci` 安裝依賴套件。
- 執行 `npm run build:firefox` 或 `npm run build:chromium` 建置單一目標。
- 執行 `npm run build:all` 建置全部目標。
- 建置結果位於 `dist/firefox` 及 `dist/chromium`。
- 執行 `npm test` 進行型別檢查、程式碼檢查、單元測試、正式建置及擴充功能資訊清單驗證。
