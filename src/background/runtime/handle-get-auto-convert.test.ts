import { LangType } from 'tongwen-core/dictionaries';
import { describe, expect, it } from 'vitest';
import { getDefaultPref } from '../../preference/default';
import { ZhType } from '../../service/tabs/tabs.constant';
import { getTargetByAutoConvert } from './handle-get-auto-convert';

describe('getTargetByAutoConvert', () => {
  it('does not convert an unrecognized page in detective mode unless fallback is enabled', () => {
    const pref = getDefaultPref();
    pref.general.autoConvert = 'ds2t';
    pref.general.detectFallback = 'skip';

    expect(getTargetByAutoConvert(pref, ZhType.und)).toBeUndefined();

    pref.general.detectFallback = 'convert';
    expect(getTargetByAutoConvert(pref, ZhType.hans)).toBe(LangType.s2t);
    expect(getTargetByAutoConvert(pref, ZhType.und)).toBe(LangType.s2t);
  });

  it('keeps fixed conversion independent of detection', () => {
    const pref = getDefaultPref();
    pref.general.autoConvert = LangType.s2t;
    pref.general.detectFallback = 'skip';

    expect(getTargetByAutoConvert(pref, ZhType.und)).toBe(LangType.s2t);
    expect(getTargetByAutoConvert(pref, ZhType.hant)).toBe(LangType.s2t);
  });

  it('converts only the opposite detected Chinese variant', () => {
    const pref = getDefaultPref();
    pref.general.autoConvert = 'dt2s';
    pref.general.detectFallback = 'skip';

    expect(getTargetByAutoConvert(pref, ZhType.hant)).toBe(LangType.t2s);
    expect(getTargetByAutoConvert(pref, ZhType.hans)).toBeUndefined();
  });
});
