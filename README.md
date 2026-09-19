# New Tong Wen Tang

New Tong Wen Tang is a browser extension that converts Chinese text between Simplified and Traditional Chinese.

> Maintained fork: [`makcheunghei/tongwentang-extension`](https://github.com/makcheunghei/tongwentang-extension). Upstream project: [`tongwentang/tongwentang-extension`](https://github.com/tongwentang/tongwentang-extension).

## Main Features

- Convert automatically when a webpage loads.
- Convert dynamic and single-page application content.
- Convert open Shadow DOM content, including many modern component-based sites.
- Convert manually through the browser action, keyboard shortcuts, or context menu.
- Convert text in inputs, textareas, and editable regions while preserving the caret position for text controls.
- Convert clipboard content.
- Import and export preferences, including v1 preferences.
- Set domain and regular-expression rules.
- Use built-in and custom mapping words.
- Apply preference changes without reloading the extension.

## Upstream Published Downloads

These links point to the upstream project. Fork builds are attached to this repository's GitHub releases.

- [Firefox](https://addons.mozilla.org/firefox/addon/new_tongwentang/)
- [Chrome](https://chromewebstore.google.com/detail/new-tongwentang/ldmgbgaoglmaiblpnphffibpbfchjaeg)
- [Microsoft Edge](https://microsoftedge.microsoft.com/addons/detail/%E6%96%B0%E5%90%8C%E6%96%87%E5%A0%82/ijddgmclgedepadbikmfekambhhfjfnl)

## Development

Requirements:

- Node.js 22 or later
- npm 10 or later

Install dependencies:

```sh
npm ci
```

Run Firefox or Chromium development mode:

```sh
npm run dev:firefox
npm run dev:chromium
```

For Chromium development, create a `.env` file from `.env.example` and set `CHROMIUM_BINARY` when the browser is not detected automatically.

Run the full verification suite:

```sh
npm test
```

Build both targets:

```sh
npm run build:all
```

Package both extension archives:

```sh
npm run build:zip:firefox
npm run build:zip:chromium
```

## Project Layout

- `src/background`: service worker, context menus, storage, and conversion worker.
- `src/content`: page conversion, dynamic DOM observation, Shadow DOM support, and editable controls.
- `src/options`: React preference UI.
- `src/preference`: preference schemas, migrations, and filter rules.
- `docs`: permission, build, and preference documentation.
