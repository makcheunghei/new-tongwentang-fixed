import { browser } from '../service/browser';

const read = (): string => {
  const textarea = document.createElement('textarea');
  document.body.append(textarea);
  try {
    textarea.focus();
    if (!document.execCommand('paste')) throw new Error('CLIPBOARD_READ_FAILED');
    return textarea.value;
  } finally {
    textarea.remove();
  }
};

browser.runtime.onMessage.addListener((message: unknown, sender: browser.Runtime.MessageSender) => {
  if (
    sender.id !== browser.runtime.id ||
    typeof message !== 'object' ||
    message === null ||
    !('type' in message) ||
    message.type !== 'OffscreenClipboard'
  )
    return undefined;
  const request = message as { operation?: string; text?: unknown; expected?: unknown };
  try {
    const current = read();
    if (request.operation === 'read') return Promise.resolve({ ok: true, text: current });
    if (request.operation !== 'write' || typeof request.text !== 'string' || typeof request.expected !== 'string')
      throw new Error('CLIPBOARD_INVALID_REQUEST');
    if (current !== request.expected) throw new Error('CLIPBOARD_CHANGED');
    const textarea = document.createElement('textarea');
    document.body.append(textarea);
    try {
      textarea.value = request.text;
      textarea.select();
      if (!document.execCommand('copy')) throw new Error('CLIPBOARD_WRITE_FAILED');
    } finally {
      textarea.remove();
    }
    return Promise.resolve({ ok: true, text: '' });
  } catch (error) {
    return Promise.resolve({ ok: false, error: error instanceof Error ? error.message : 'CLIPBOARD_FAILED' });
  }
});
