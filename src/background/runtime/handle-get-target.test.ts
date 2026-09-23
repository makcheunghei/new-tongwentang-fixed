import { LangType } from 'tongwen-core/dictionaries';
import { describe, expect, it } from 'vitest';
import { getDefaultPref } from '../../preference/default';
import type { browser } from '../../service/browser';
import { ZhType } from '../../service/tabs/tabs.constant';
import { getTarget } from './handle-get-target';

const sender = (url: string): browser.Runtime.MessageSender => ({ url }) as browser.Runtime.MessageSender;

describe('getTarget', () => {
  it('lets a disabled domain rule override automatic conversion', async () => {
    const pref = getDefaultPref();
    pref.general.autoConvert = LangType.s2t;
    pref.filter.enabled = true;
    pref.filter.rules = [{ id: 'rule-domain', pattern: 'example.com', target: 'disabled', regexp: null }];

    await expect(getTarget(pref, sender('https://example.com/page'), ZhType.hans)).resolves.toBeUndefined();
  });

  it('uses automatic conversion when no domain rule matches', async () => {
    const pref = getDefaultPref();
    pref.general.autoConvert = LangType.t2s;
    pref.filter.enabled = true;

    await expect(getTarget(pref, sender('https://example.com/page'), ZhType.und)).resolves.toBe(LangType.t2s);
  });
});
