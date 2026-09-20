import { LangType } from 'tongwen-core/dictionaries';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDefaultPref } from '../../preference/default';
import type { Pref } from '../../preference/types/lastest';
import type { PrefFilterRule } from '../../preference/types/v2';

const { getStorage, setStorage } = vi.hoisted(() => ({
  getStorage: vi.fn<() => Promise<Pref>>(),
  setStorage: vi.fn<(pref: Partial<Pref>) => Promise<void>>(async () => undefined),
}));

vi.mock('./storage', () => ({ getStorage, setStorage }));

import { deleteFilterRule, updateFilterRule } from './local';

const createPref = (): Pref => {
  const pref = getDefaultPref();
  pref.filter.chtTags = ['ja', 'zh-hant'];
  pref.filter.chsTags = ['en', 'zh-hans'];
  pref.filter.rules = [
    { id: 'rule-one', pattern: 'example.com', target: LangType.s2t, regexp: null },
    { id: 'rule-two', pattern: 'example.org', target: LangType.t2s, regexp: null },
  ];
  return pref;
};

describe('filter rule storage updates', () => {
  beforeEach(() => {
    getStorage.mockReset();
    setStorage.mockClear();
    getStorage.mockResolvedValue(createPref());
  });

  it('preserves custom language tags when updating a rule', async () => {
    const updated: PrefFilterRule = { id: 'rule-two', pattern: 'updated.example', target: LangType.s2t, regexp: null };

    await updateFilterRule(updated, 1);

    expect(setStorage).toHaveBeenCalledWith({
      filter: {
        enabled: true,
        rules: [{ id: 'rule-one', pattern: 'example.com', target: LangType.s2t, regexp: null }, updated],
        chtTags: ['ja', 'zh-hant'],
        chsTags: ['en', 'zh-hans'],
      },
    });
  });

  it('preserves custom language tags when deleting a rule', async () => {
    await deleteFilterRule(0);

    expect(setStorage).toHaveBeenCalledWith({
      filter: {
        enabled: true,
        rules: [{ id: 'rule-two', pattern: 'example.org', target: LangType.t2s, regexp: null }],
        chtTags: ['ja', 'zh-hant'],
        chsTags: ['en', 'zh-hans'],
      },
    });
  });
});
