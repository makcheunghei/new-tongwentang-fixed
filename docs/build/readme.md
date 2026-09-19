# Build Instruction

## Repository

[makcheunghei/tongwentang-extension](https://github.com/makcheunghei/tongwentang-extension)

## Environment

- Node.js: 22 or later
- npm: 10 or later

## Build Step

- Run `npm ci` to install packages.
- Run `npm run build:firefox` or `npm run build:chromium` to build one target.
- Run `npm run build:all` to build both targets.
- Build results are located in `dist/firefox` and `dist/chromium`.
- Run `npm test` for type checking, linting, unit tests, production builds, and WebExtension manifest validation.
