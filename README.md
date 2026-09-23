# 新同文堂（修復）

本專案是新同文堂瀏覽器擴充功能的持續修復版本，主要提供簡體中文與繁體中文互相轉換。

> 本專案位於 [`makcheunghei/new-tongwentang-fixed`](https://github.com/makcheunghei/new-tongwentang-fixed)。上游專案為 [`tongwentang/tongwentang-extension`](https://github.com/tongwentang/tongwentang-extension)。

## 主要功能

- 網頁載入後自動轉換。偵測模式會先看語言標籤；沒有標籤或只有籠統的 `zh` 時，先抽樣頁面文字。識別不到中文就不會自動轉換，可在設定改回舊行為。固定簡轉繁或繁轉簡不受影響。
- 支援動態網頁及單頁應用程式內容。轉換期間的頁面更新會保留，載入後再於 1 秒及 3 秒各補掃一次。同一節點若被網站連續改回原文，會暫停轉換該節點。
- 支援元件化網站及開放式影子根節點內容。
- 可透過工具列圖示、鍵盤快速鍵或右鍵選單手動轉換。
- 支援輸入框、文字區及可直接編輯區域，文字控制項會保留游標位置。
- 支援剪貼簿內容轉換。
- 支援偏好設定匯入及匯出，包括第一版設定。
- 支援網域規則、正規表示式規則及自訂語言標籤。
- 支援內建及自訂詞庫。
- 修改偏好設定後毋須重新載入擴充功能。

## 上游已發佈版本

以下連結指向上游專案。本修復版本的建置檔案會附加於本專案的 GitHub Releases。

- [Firefox](https://addons.mozilla.org/firefox/addon/new_tongwentang/)
- [Chrome](https://chromewebstore.google.com/detail/new-tongwentang/ldmgbgaoglmaiblpnphffibpbfchjaeg)
- [Microsoft Edge](https://microsoftedge.microsoft.com/addons/detail/%E6%96%B0%E5%90%8C%E6%96%87%E5%A0%82/ijddgmclgedepadbikmfekambhhfjfnl)

## 開發環境

需要：

- Node.js 22 或以上
- npm 10 或以上

安裝依賴套件：

```sh
npm ci
```

執行 Firefox 或 Chromium 開發模式：

```sh
npm run dev:firefox
npm run dev:chromium
```

進行 Chromium 開發時，可由 `.env.example` 建立 `.env`，並在瀏覽器未被自動偵測時設定 `CHROMIUM_BINARY`。

Safari 開發需要完整安裝 Xcode：

```sh
npm run build:safari
npm run safari:convert
```

`safari:convert` 會在 `safari/` 產生本機 Xcode 專案；該目錄不會提交到版本控制。可用 `SAFARI_APP_NAME`、`SAFARI_BUNDLE_ID` 及 `SAFARI_PROJECT_LOCATION` 覆寫預設值。

執行完整驗證：

```sh
npm test
```

建置兩個目標：

```sh
npm run build:all
```

封裝兩個擴充功能壓縮檔：

```sh
npm run build:zip:firefox
npm run build:zip:chromium
```

## 專案結構

- `src/background`：背景服務、右鍵選單、儲存及轉換工作。
- `src/content`：網頁轉換、動態節點監察及可直接編輯控制項。
- `src/options`：偏好設定介面。
- `src/preference`：偏好設定結構、版本遷移及過濾規則。
- `docs`：權限、建置及偏好設定文件。
