import { afterEach, describe, expect, it, vi } from 'vitest';
const { browser } = vi.hoisted(() => ({ browser: {} as Record<string, unknown> }));
vi.mock('../browser', () => ({ browser }));
vi.mock('../types', () => ({ IS_SAFARI: true }));
vi.mock('../i18n/i18n', () => ({ i18n: { getMessage: (key: string) => key } }));
import { getDefaultPref } from '../../preference/default';
import { rebuildMenus } from './rebuild-menus';
import { setBadge } from '../browser-action/set-badge';
afterEach(() => {
  delete browser.contextMenus;
  delete browser.action;
});
describe('Safari mobile optional browser APIs', () => {
  it('initializes without a context menu API', async () => {
    await expect(rebuildMenus(getDefaultPref().menu)).resolves.toBeUndefined();
  });
  it('updates preferences without badge APIs', async () => {
    browser.action = {};
    await expect(setBadge(getDefaultPref().general)).resolves.toEqual([undefined, undefined]);
  });
});
