# Permissions Required by 新同文堂（修復）

The extension requests only the permissions required for its current features.

## Required Permissions

- `contextMenus`
  - Creates browser action and webpage context menus.
- `notifications`
  - Displays clipboard conversion results and error messages.
- `storage`
  - Stores preferences, domain rules, and custom mapping words.

Host access to `<all_urls>` is declared by the content script because webpage conversion must run on pages selected by the user.

## Optional Permissions

- `clipboardWrite`
  - Writes converted content back to the clipboard.
- `clipboardRead`
  - Reads clipboard content for conversion.

The optional clipboard permissions are requested only after the user selects a clipboard conversion command.
