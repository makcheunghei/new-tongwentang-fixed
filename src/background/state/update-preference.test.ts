import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDefaultPref } from '../../preference/default';
import type { Pref } from '../../preference/types/lastest';
import { LangType } from 'tongwen-core/dictionaries';
const { getStorage, writeStorage } = vi.hoisted(() => ({ getStorage: vi.fn(), writeStorage: vi.fn() }));
vi.mock('../../service/storage/storage', () => ({ getStorage, writeStorage }));
vi.mock('../../service/browser', () => ({ browser: { storage: { local: { clear: vi.fn() } } } }));
import { updatePreference } from './update-preference';
import { addFilterRule } from '../../service/storage/local';
let pref: Pref;
beforeEach(() => {
  pref = getDefaultPref();
  getStorage.mockImplementation(async () => structuredClone(pref));
  writeStorage.mockReset();
  writeStorage.mockImplementation(async (patch: Partial<Pref>) => {
    Object.assign(pref, patch);
  });
});

describe('serialized preference writes', () => {
  it('preserves concurrent changes to different general fields', async () => {
    await Promise.all([
      updatePreference({ section: 'general', patch: { debugMode: true } }),
      updatePreference({ section: 'general', patch: { updateLangAttr: true } }),
    ]);
    expect(pref.general).toMatchObject({ debugMode: true, updateLangAttr: true });
  });
  it('preserves concurrent menu item changes', async () => {
    await Promise.all([
      updatePreference({ section: 'menuItem', group: 'webpage', target: 's2t', enabled: false }),
      updatePreference({ section: 'menuItem', group: 'textarea', target: 't2s', enabled: false }),
    ]);
    expect(pref.menu.group.webpage.s2t).toBe(false);
    expect(pref.menu.group.textarea.t2s).toBe(false);
  });
  it('rejects a stale filter save after a context-menu rule was added', async () => {
    const base = structuredClone(pref.filter);
    const rule = { id: 'new', pattern: 'example.com', target: LangType.s2t, regexp: null };
    const [, saved] = await Promise.all([
      addFilterRule(rule),
      updatePreference({ section: 'filter', base, value: { ...base, enabled: false } }),
    ]);
    expect(saved).toBe(false);
    expect(pref.filter.rules).toEqual([rule]);
  });
  it('saves a filter against an unchanged baseline', async () => {
    const base = structuredClone(pref.filter);
    expect(await updatePreference({ section: 'filter', base, value: { ...base, enabled: false } })).toBe(true);
    expect(pref.filter.enabled).toBe(false);
  });
  it('continues accepting writes after a failed write', async () => {
    writeStorage.mockRejectedValueOnce(new Error('quota'));
    await expect(updatePreference({ section: 'general', patch: { debugMode: true } })).rejects.toThrow('quota');
    await expect(updatePreference({ section: 'general', patch: { updateLangAttr: true } })).resolves.toBe(true);
  });
});
