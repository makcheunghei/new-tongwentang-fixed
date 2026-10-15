# 新同文堂（修復）

本專案是新同文堂瀏覽器擴充功能的持續修復版本，主要提供簡體中文與繁體中文互相轉換。

> 本專案位於 [`makcheunghei/new-tongwentang-fixed`](https://github.com/makcheunghei/new-tongwentang-fixed)。上游專案為 [`tongwentang/tongwentang-extension`](https://github.com/tongwentang/tongwentang-extension)。

## 2.8.2：設定頁加入關閉按鈕

所有設定分頁頂部設有「關閉設定」按鈕，手機、平板及桌面版均可使用。按鈕會關閉設定分頁或設定彈出視窗。

## 2.8.1：按平台提供可用功能

- iPhone／iPad 隱藏並停用右鍵選單及文字框右鍵轉換。以 Safari 實際回報的作業系統識別 iPad，桌面版網站模式亦不會誤開桌面功能。
- Safari 由操作面板選擇轉換方向，不再顯示無效的「工具列按鈕功能」設定。
- Safari 背景剪貼簿轉換目前停用，亦不再登記相關快速鍵；網頁轉換快速鍵保留，iPhone／iPad 可配合外接鍵盤使用。
- 自動轉換、動態內容、網域規則、詞庫及設定匯入匯出繼續提供。隱藏桌面設定不會刪除其儲存值，匯入匯出亦保留。

| 功能                           | Chromium／Firefox 桌面版 | macOS Safari           | iOS／iPadOS Safari       |
| ------------------------------ | ------------------------ | ---------------------- | ------------------------ |
| 手動轉換網頁                   | 工具列／右鍵／快速鍵     | 操作面板／右鍵／快速鍵 | 操作面板／外接鍵盤快速鍵 |
| 網頁、文字框右鍵選單           | 支援                     | 支援                   | 停用並隱藏設定           |
| 自訂工具列點擊動作             | 支援                     | 使用操作面板，隱藏設定 | 使用操作面板，隱藏設定   |
| 背景剪貼簿轉換                 | 支援，使用時授權         | 停用                   | 停用                     |
| 自動／動態轉換、網域規則、詞庫 | 支援                     | 支援                   | 支援                     |
| 設定匯入及匯出                 | 支援                     | 支援                   | 支援                     |

Apple 的[相容性說明](https://developer.apple.com/documentation/safariservices/assessing-your-safari-web-extension-s-browser-compatibility)確認 iOS 不支援擴充功能右鍵選單；[iOS Safari 擴充功能介紹](https://developer.apple.com/videos/play/wwdc2021/10104/)則說明外接鍵盤快速鍵的使用方式。手機及平板的功能限制不應直接套用到桌面瀏覽器。

## 2.7.2 轉換可靠性修復

- 偵測模式保留原始語言判定，首次轉換後新增的正文仍會繼續轉換。
- 背景轉換等待期間，網站或使用者改過的文字不會被舊結果覆蓋；插件自身寫入不會再次排入動態轉換。
- 設定由背景串行儲存。網域規則若已在其他頁面修改，會保留目前編輯並提示衝突，避免覆蓋新規則。
- 工具列語言查詢固定讀取主文件；文字框右鍵操作會指定所在 iframe。
- Chromium 剪貼簿轉換使用 offscreen 文件，並保留轉換期間被更新的剪貼簿內容。需要 Chrome 109 或以上及 `offscreen` 權限；讀寫剪貼簿仍在使用功能時才要求授權。
- 發佈時核對 tag、插件版本及兩個瀏覽器的檔案引用；ZIP 每次重新建立，避免殘留舊檔案。

## 主要功能

- 網頁載入後自動轉換。偵測模式會先看語言標籤；沒有標籤或只有籠統的 `zh` 時，先抽樣頁面文字。識別不到中文就不會自動轉換，可在設定改回舊行為。固定簡轉繁或繁轉簡不受影響。
- 支援動態網頁及單頁應用程式內容。轉換期間的頁面更新會保留，載入後再於 1 秒及 3 秒各補掃一次。同一節點若被網站連續改回原文，會暫停轉換該節點。
- 支援元件化網站及開放式影子根節點內容。
- 可透過工具列操作面板、鍵盤快速鍵或桌面版右鍵選單手動轉換，詳見平台功能表。
- 桌面版右鍵支援輸入框、文字區及可直接編輯區域，文字控制項會保留游標位置。
- Chromium／Firefox 桌面版支援剪貼簿內容轉換。
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

Xcode 專案位於 `apple/TongWenTangFixed/TongWenTangFixed.xcodeproj`，包含 iOS／iPadOS、macOS 的主 App 及 Safari extension 共四個 target。支援 iOS／iPadOS 17 或以上。`safari:convert` 會更新網頁資源建置，並保留原生介面及簽署設定。

本機開發及簽署指令：

```sh
npm run safari:build:ios
npm run safari:build:simulator
npm run safari:build:macos
npm run safari:archive:ios
npm run safari:export:ios
npm run safari:export:appstore
```

`build/apple/` 保存建置、archive、開發版 IPA 及 Apple Distribution 匯出檔；這些檔案及 provisioning profile 不會提交。`safari:export:appstore` 只匯出本機檔案，不會上傳到 App Store Connect。實機開發版只可安裝於 provisioning profile 已登記的裝置。

預設 Team 為本專案持有人 `C367M6C798`，開發建置使用 Apple Development；App Store 匯出由 Xcode 使用 Apple Distribution 重新簽署。可用 `SAFARI_DEVELOPMENT_TEAM`、`SAFARI_DESTINATION` 及 `SAFARI_XCCONFIG` 覆寫本機建置設定。憑證與私鑰保留在 Keychain，程式碼不包含簽署憑證、私鑰或帳號登入資料。

iPhone／iPad 安裝主 App 後，依啟用頁前往 Safari 延伸功能設定，並允許指定網站存取。iOS／iPadOS 26.2 或以上可使用主 App 的按鈕直接開啟延伸功能設定；較舊系統會顯示手動步驟。Safari 操作面板提供兩個轉換方向、自動判斷及設定入口；設定頁支援窄螢幕、觸控及 iPad 視窗調整。

修改 Safari 建置檔案清單後，須在 Xcode 更新 extension 的 Resources 引用；原生建置及匯出前會逐檔比對產物，避免出現有簽章但漏包操作面板或詞庫的情況。

本機原生專案由 Xcode 27 產生。CI 會用 runner 已安裝的 Xcode 在 `build/apple/ci-project` 產生相容格式的臨時專案，複製相同原生介面程式碼，再驗證 macOS 及 iPhone／iPad 模擬器建置。

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
- `apple`：iOS／iPadOS、macOS 原生主 App 及 Safari extension Xcode 專案。
- `src/popup`：Safari 觸控操作面板。
- `docs`：權限、建置及偏好設定文件。
