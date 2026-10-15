import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LangType } from 'tongwen-core/dictionaries';
import { ZhType } from '../service/tabs/tabs.constant';
const { query, openOptionsPage, create, dispatchCtAction, getStorage } = vi.hoisted(() => ({
  query: vi.fn(),
  openOptionsPage: vi.fn(),
  create: vi.fn(),
  dispatchCtAction: vi.fn(),
  getStorage: vi.fn(),
}));
vi.mock('../service/browser', () => ({
  browser: {
    tabs: { query, create },
    runtime: { openOptionsPage, getURL: (file: string) => `safari-web-extension://test/${file}` },
  },
}));
vi.mock('../service/runtime/content', () => ({ dispatchCtAction }));
vi.mock('../service/storage/storage', () => ({ getStorage }));
beforeEach(async () => {
  vi.resetModules();
  document.body.innerHTML =
    '<div class="actions"><button id="s2t"></button><button id="t2s"></button><button id="auto"></button></div><p id="status"></p><button id="settings"></button>';
  query.mockReset().mockResolvedValue([{ id: 7 }]);
  openOptionsPage.mockReset().mockResolvedValue(undefined);
  create.mockReset().mockResolvedValue(undefined);
  dispatchCtAction.mockReset().mockResolvedValue(undefined);
  getStorage.mockReset().mockResolvedValue({ general: { defaultTarget: LangType.s2t } });
  await import('./main');
});
describe('Safari touch action popup', () => {
  it.each(['s2t', 't2s'] as const)('converts the active page to %s', async target => {
    document.querySelector<HTMLButtonElement>(`#${target}`)!.click();
    await vi.waitFor(() => expect(dispatchCtAction).toHaveBeenCalledWith({ type: 'Webpage', payload: target }, 7));
    expect(document.querySelector('#status')!.textContent).toBe('已完成轉換。');
  });
  it('queries the main frame before choosing the automatic direction', async () => {
    dispatchCtAction.mockResolvedValueOnce(ZhType.hant).mockResolvedValueOnce(undefined);
    document.querySelector<HTMLButtonElement>('#auto')!.click();
    await vi.waitFor(() => expect(dispatchCtAction).toHaveBeenCalledTimes(2));
    expect(dispatchCtAction).toHaveBeenNthCalledWith(1, { type: 'ZhType', payload: undefined }, 7, 0);
    expect(dispatchCtAction).toHaveBeenNthCalledWith(2, { type: 'Webpage', payload: LangType.t2s }, 7);
  });
  it('explains website permission failures and restores the buttons', async () => {
    dispatchCtAction.mockRejectedValueOnce(new Error('Receiving end does not exist'));
    document.querySelector<HTMLButtonElement>('#s2t')!.click();
    await vi.waitFor(() => expect(document.querySelector('#status')!.textContent).toContain('允許'));
    expect(document.querySelector<HTMLButtonElement>('#s2t')!.disabled).toBe(false);
  });
  it('opens settings in a new tab when openOptionsPage is unavailable', async () => {
    openOptionsPage.mockRejectedValueOnce(new Error('unsupported'));
    document.querySelector<HTMLButtonElement>('#settings')!.click();
    await vi.waitFor(() => expect(create).toHaveBeenCalledWith({ url: 'safari-web-extension://test/options.html' }));
  });
});
