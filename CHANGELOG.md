# Changelog

All notable changes to this project will be documented in this file.

## [2.8.2] - 2026-10-15

### 設定頁

- 在所有設定分頁頂部加入「關閉設定」按鈕，支援手機、平板及桌面瀏覽器。
- 按鈕只關閉設定頁所屬分頁；彈出視窗則關閉該視窗，不會查詢或關閉背後的網頁。

## [2.8.1] - 2026-10-15

### iOS／iPadOS 功能適配

- iPhone／iPad 設定頁隱藏不支援的右鍵選單及文字框右鍵轉換，背景亦停用相關選單操作。macOS Safari 保留右鍵功能。
- 優先使用 Safari 回報的作業系統識別 iPad，避免桌面版網站模式被誤判為 Mac；舊版 API 不可用時使用觸控及裝置資訊。
- Safari 使用操作面板，隱藏不會生效的「工具列按鈕功能」設定，並停用與該設定相關的 badge 及點擊監聽。
- 停用 Safari 背景服務無法執行的剪貼簿轉換，移除相應快速鍵宣告。保留 iOS／iPadOS 外接鍵盤的網頁轉換快速鍵。
- 保留自動轉換、動態轉換、網域規則、自訂詞庫及設定匯入匯出；被隱藏的桌面設定仍會保存在偏好檔，方便跨平台使用。

## [2.8.0] - 2026-10-15

### Safari 與 Apple 平台

- 加入可追蹤的 iOS／iPadOS 及 macOS Xcode 專案，主 App 與 extension 使用一致 Team、bundle identifier、版本及開發簽署。
- iOS／iPadOS 17 起支援 iPhone 與 iPad；加入繁體啟用頁、觸控操作面板、窄螢幕設定頁及安全區域。
- iOS／iPadOS 26.2 起可由主 App 直接開啟 Safari 延伸功能設定，較舊系統提供手動指引。
- 對手機 Safari 可能缺少的右鍵選單、鍵盤命令及 badge API 加入存在檢查，避免初始化中斷。
- 加入原生建置、archive、開發版及 Apple Distribution 匯出指令；每次建置核對全部 extension 資源，匯出只保存本機檔案。
- CI 加入 iPhone／iPad 模擬器及 macOS 原生建置，簽署憑證、私鑰、profile 及 IPA 排除於版本控制。

## [2.7.2] - 2026-10-13

### 修復

- 分開原始語言與目前顯示語言，修復偵測模式首次轉換後的動態內容及補掃失效。
- 寫回前比對原文，保護網站及輸入框的新內容；過濾自身 mutation，保留轉換期間的外部更新。
- 設定更新、匯入及重設由背景串行處理；規則儲存加入衝突檢查，修復排序按鈕及邊界。
- 主文件語言查詢及文字框右鍵操作指定 frame，手動操作失敗提供通知。
- Chromium MV3 剪貼簿改用 offscreen 文件，寫入前檢查內容有否更新。最低 Chrome 版本改為 109。
- 發佈加入完整驗證及 tag／版本一致檢查，兩款 ZIP 重新建立及核對檔案。
- 更新 shell-quote 及 source-map-js 安全修正版。node-forge 及其開發工具依賴鏈仍有已知高風險報告，暫未有可用修正版；不包含在插件執行依賴中。

## [2.7.1] - 2026-09-24

### Fixed

- Content scripts no longer claim replies for background messages, which closed the message channel on pages with many frames.
- Keyboard shortcuts and the toolbar button no longer crash when the active tab has no id.

## [2.7.0] - 2026-09-23

### Features

- Detective conversion now samples page text when the language tag is missing or only generic `zh`.
- Unrecognized or explicit non-Chinese pages are no longer force-converted. A new preference restores the old fallback.
- Dynamic conversion keeps updates that arrive while a conversion is writing, and rescans once at 1 second and 3 seconds after the initial automatic conversion.
- A node that is reverted to its original text twice within 10 seconds is skipped for 30 seconds, without stopping conversion of other nodes.

### Fixed

- Oversized mutation queues now collapse into one full-page rescan instead of growing without a bound.
- Hidden documents no longer run conversion scans until they are visible again.

## [2.6.0] - 2026-09-20

### Features

- Integrated upstream PR #96 by RossWang to add configurable Traditional and Simplified Chinese language tags.
- Integrated upstream PR #111 by KaranocaVe to add Safari Web Extension development and local Xcode generation support.
- Added Safari-safe i18n, notification, clipboard, export, and action menu fallbacks.
- Added bundled English, Traditional Chinese, Hong Kong Chinese, and Simplified Chinese fallback messages.

### Fixed

- Preserved custom language tags when adding, updating, or deleting domain rules.
- Fixed rule updates deleting the rule being edited.

### Notes

- Safari support is development-only because signed distribution requires an Xcode application and Apple signing.
- Preserve-layout support from PR #97 and tongwen-core PR #14 remains excluded until the core implementation is merged.

## [2.5.0] - 2026-09-19

### Highlights

- Updated the toolchain to Node.js 22+, React 19, Rspack 2, TypeScript 5.9, ESLint 10, web-ext 10, and current supporting dependencies.
- Removed all reported npm audit vulnerabilities.
- Reduced Manifest V3 permissions to `contextMenus`, `notifications`, and `storage`; removed `tabs`, `downloads`, and `unlimitedStorage`.
- Replaced the obsolete release workflow with npm-based CI and reproducible Firefox/Chromium packaging.
- Raised the Firefox MV3 minimum version to 140 desktop / 142 Android and set Chromium's minimum supported version to 102.
- Added Simplified Chinese and Hong Kong Chinese interface locales.
- Renamed the maintained fork to 新同文堂（修復） and translated the project introduction into Traditional Chinese.

### Fixed

- Prevented unbounded mutation queues and background-tab DOM stalls by adding bounded batching, a hard flush deadline, visibility pausing, and deferred full rescans.
- Added support for converting and observing open Shadow DOM content.
- Fixed stale converter caches when custom or default dictionaries change.
- Fixed textarea and input conversion by preserving selection, invoking native value setters, and dispatching proper input events for controlled UIs.
- Added editable-region conversion and nested Shadow DOM active-element detection.
- Fixed the initial context menu not being created, serialized full menu rebuilds, cleared stale menu IDs before recreation, and handled Chrome context-menu callback errors to prevent duplicate-ID runtime errors.
- Fixed duplicate option-page storage listeners that leaked after re-renders.
- Fixed regular-expression filter state reuse and made domain matching exact or subdomain-only, preventing suffix spoofing.
- Fixed invalid regular-expression flag handling and URL validation.
- Split option pages into lazy-loaded chunks, made build manifest generation synchronous, and added unit/CI coverage.
- Fixed `web-ext` development when `.env` is absent.

This changelog follows Conventional Commits and is maintained with commit-and-tag-version.

### [2.4.0](https://github.com/tongwentang/tongwentang-extension/compare/2.2.0...2.4.0) (2024-12-29)

Manifest MV3 supported

### Bug Fixes

- should escape regex keyword before convert ([898c30e](https://github.com/tongwentang/tongwentang-extension/commit/898c30e78ab4d72aa8f532037c469a27c0e95cb0))
- try to fix the blank page on mobile [#48](https://github.com/tongwentang/tongwentang-extension/issues/48) ([712ca2d](https://github.com/tongwentang/tongwentang-extension/commit/712ca2d56507c664461c09f58c5fc301155d916f))
- unable to add filter rule from browser action menu ([349e897](https://github.com/tongwentang/tongwentang-extension/commit/349e897c253713a5aaf1db6569de7d00bb2c94b5)), closes [#41](https://github.com/tongwentang/tongwentang-extension/issues/41) [#65](https://github.com/tongwentang/tongwentang-extension/issues/65)
- Update `lang` attribute of every element ([#64](https://github.com/tongwentang/tongwentang-extension/issues/64)) ([196606d](https://github.com/tongwentang/tongwentang-extension/commit/196606db2912d122a1b06b78f44142839e737bb3))

## [2.2.0](https://github.com/tongwentang/tongwentang-extension/compare/2.1.6...2.2.0) (2022-11-12)

### Features

- update HTML lang attr on convert ([#60](https://github.com/tongwentang/tongwentang-extension/issues/60)) ([907dd94](https://github.com/tongwentang/tongwentang-extension/commit/907dd9462585c9f0c39d6e451b660ae7ad0bae0a))

### [2.1.6](https://github.com/tongwentang/tongwentang-extension/compare/2.1.5...2.1.6) (2022-08-27)

### Bug Fixes

- avoid to update node content if the converted content is same as original ([36270a0](https://github.com/tongwentang/tongwentang-extension/commit/36270a00a4d6f5992b555a1353ac3827667c550d)), closes [#39](https://github.com/tongwentang/tongwentang-extension/issues/39)

### [2.1.5](https://github.com/tongwentang/tongwentang-extension/compare/2.1.4...2.1.5) (2022-08-21)

### Bug Fixes

- fix types errors ([c9ff4f4](https://github.com/tongwentang/tongwentang-extension/commit/c9ff4f4e89557cc0cd83decb90e71702495dda0a))

## [2.1.4](https://github.com/tongwentang/tongwentang-extension/compare/2.1.3...2.1.4) (2021-05-29)

### Bug Fixes

- custom t2s mapping words do not merge into converter. ([96bff08](https://github.com/tongwentang/tongwentang-extension/commit/96bff081e95d05098cc39e506118b795e929fb1c)), closes [#33](https://github.com/tongwentang/tongwentang-extension/issues/33)

## [2.1.3] - 2021-04-28

### Fixed

- Cursor jump to line start in input area. (#31)
- Can not save with "detective simplified to Traditional" as auto convert option. (#22 #30)

## [2.1.2] - 2021-04-24

### Fixed

- Grant permission for clipboard failed message now show properly.
- Switching default word now work properly (#23).
- Cursor now do not jump to line start when typing on input area (#10).
- All relating punctuations now collect and send to converter (#11).
- Prevent detect language API failed (#12).
- v1 preference for Google Chromium is now handle properly on importing (#15).

## [2.1.1] - 2021-04-11

### Changed

- Remove `activeTab` permission due no using.

### Fixed

- Remove trailing bracket in context menu.

## [2.1.0] - 2021-04-01

### Changed

- Change default shortcut due to Chrome disallow combination of `ctrl` and `alt`.
- Update i18n messages.

### Fixed

- Replace plain text in UI by i18n messages.

## [2.0.0] - 2021-03-28

Compare to v[1.5.1](https://github.com/tongwentang/New-Tongwentang-for-Firefox/releases/tag/1.5)

### Added

- New [convert core](https://github.com/tongwentang/tongwen-core) with completely new algorithm, convert speed is significantly increase 🚀.
- New settings page UI design.
- Import preferences is now checking with schema, provide an option to fix imported preferences if broken.
- Reset preference is now support `Reset` and `Reset All`, latter wipe out everthing including custom mapping words.
- New Detective Auto Convert Mode which detect page content first, do nothing if page content not Chinese.
- New Default Convert Target, if page content is unknown, then extension will convert to default target.
- New Dynamic Mode which reponsively convert on page content changed (SPA web page is now supported).
- New Debug Mode which logging infomation to debug console.
- Domain rule is now support both plain text and regular expression.
- New BrowserAction Context Menu, including direct set domain rule and emit clipboard convert.

### Changed

- Clipboard convert menu is moved to browser action (icon) context menu.
- Clipboard permissions is now optional.
