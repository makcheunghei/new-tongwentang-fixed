import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const { sendMessage } = vi.hoisted(() => ({ sendMessage: vi.fn() }));
vi.mock('../../service/browser', () => ({ browser: { runtime: { sendMessage } } }));
import { offscreenClipboard } from './offscreen';
const createDocument = vi.fn();
beforeEach(() => {
  createDocument.mockReset().mockResolvedValue(undefined);
  sendMessage.mockReset().mockResolvedValue({ ok: true, text: '原文' });
  vi.stubGlobal('chrome', { offscreen: { createDocument } });
});
afterEach(() => vi.unstubAllGlobals());
describe('MV3 clipboard document', () => {
  it('shares creation while requests are concurrent', async () => {
    await Promise.all([offscreenClipboard('read'), offscreenClipboard('read')]);
    expect(createDocument).toHaveBeenCalledOnce();
    expect(createDocument).toHaveBeenCalledWith(
      expect.objectContaining({ url: 'clipboard.html', reasons: ['CLIPBOARD'] }),
    );
  });
  it('reuses a surviving document after the service worker restarts', async () => {
    createDocument.mockRejectedValueOnce(new Error('Only a single offscreen document may be created.'));
    await expect(offscreenClipboard('read')).resolves.toBe('原文');
  });
  it('surfaces document creation failures and allows another attempt', async () => {
    createDocument.mockRejectedValueOnce(new Error('permission denied'));
    await expect(offscreenClipboard('read')).rejects.toThrow('permission denied');
    await expect(offscreenClipboard('read')).resolves.toBe('原文');
  });
  it('passes expected clipboard contents and propagates conflicts', async () => {
    sendMessage.mockResolvedValueOnce({ ok: false, error: 'CLIPBOARD_CHANGED' });
    await expect(offscreenClipboard('write', '轉換', '原文')).rejects.toThrow('CLIPBOARD_CHANGED');
    expect(sendMessage).toHaveBeenCalledWith({
      type: 'OffscreenClipboard',
      operation: 'write',
      text: '轉換',
      expected: '原文',
    });
  });
  it('reports unavailable browsers', async () => {
    vi.stubGlobal('chrome', undefined);
    await expect(offscreenClipboard('read')).rejects.toThrow('CLIPBOARD_UNAVAILABLE');
  });
});
