import { describe, expect, it } from 'vitest';
import { BrowserType } from '../../service/types';
import { getDefaultPref } from '../default';
import type { PrefGeneral } from '../types/v2';
import { safeUpgradePref } from './upgrade-pref';

describe('detectFallback preference', () => {
  it('fills skip when an old preference has no detectFallback field', () => {
    const legacy = getDefaultPref();
    delete (legacy.general as Partial<PrefGeneral>).detectFallback;

    expect(safeUpgradePref(BrowserType.GC, legacy).general.detectFallback).toBe('skip');
  });

  it('preserves detectFallback across export and import', () => {
    const pref = getDefaultPref();
    pref.general.detectFallback = 'convert';
    const exported = JSON.parse(JSON.stringify(pref)) as typeof pref;

    expect(safeUpgradePref(BrowserType.GC, exported).general.detectFallback).toBe('convert');
  });
});
