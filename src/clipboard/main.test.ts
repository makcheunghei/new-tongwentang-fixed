import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
const { addListener } = vi.hoisted(() => ({ addListener: vi.fn() }));
vi.mock('../service/browser', () => ({ browser: { runtime: { id: 'extension', onMessage: { addListener } } } }));
let handler: (
  message: unknown,
  sender: { id: string },
) => Promise<{ ok: boolean; text?: string; error?: string }> | undefined;
let clipboard = '原文';
const execCommand = vi.fn((command: string) => {
  const input = document.querySelector('textarea')!;
  if (command === 'paste') input.value = clipboard;
  if (command === 'copy') clipboard = input.value;
  return true;
});
beforeAll(async () => {
  await import('./main');
  handler = addListener.mock.calls[0][0];
});
beforeEach(() => {
  document.body.innerHTML = '';
  clipboard = '原文';
  execCommand.mockClear();
  Object.defineProperty(document, 'execCommand', { configurable: true, value: execCommand });
});
describe('clipboard message ownership and writes', () => {
  it('ignores unrelated messages synchronously', () => {
    expect(handler({ type: 'GetTarget' }, { id: 'extension' })).toBeUndefined();
    expect(handler({ type: 'OffscreenClipboard' }, { id: 'other' })).toBeUndefined();
    expect(execCommand).not.toHaveBeenCalled();
  });
  it('reads and conditionally writes clipboard text', async () => {
    await expect(handler({ type: 'OffscreenClipboard', operation: 'read' }, { id: 'extension' })).resolves.toEqual({
      ok: true,
      text: '原文',
    });
    await expect(
      handler({ type: 'OffscreenClipboard', operation: 'write', expected: '原文', text: '轉換' }, { id: 'extension' }),
    ).resolves.toMatchObject({ ok: true });
    expect(clipboard).toBe('轉換');
    expect(document.querySelector('textarea')).toBeNull();
  });
  it('rejects stale writes without modifying the clipboard', async () => {
    await expect(
      handler({ type: 'OffscreenClipboard', operation: 'write', expected: '過期', text: '轉換' }, { id: 'extension' }),
    ).resolves.toEqual({ ok: false, error: 'CLIPBOARD_CHANGED' });
    expect(clipboard).toBe('原文');
  });
});
