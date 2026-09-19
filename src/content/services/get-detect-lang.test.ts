import { beforeEach, describe, expect, it } from 'vitest';
import { ZhType } from '../../service/tabs/tabs.constant';
import { getDetectLanguage } from './get-detect-lang';

describe('getDetectLanguage', () => {
  beforeEach(() => {
    document.documentElement.lang = '';
    document.head.innerHTML = '';
  });

  it('detects Simplified Chinese from the document language', async () => {
    document.documentElement.lang = 'zh-CN';
    await expect(getDetectLanguage()).resolves.toBe(ZhType.hans);
  });

  it('detects Traditional Chinese from an extended language tag', async () => {
    document.documentElement.lang = 'zh-Hant-TW';
    await expect(getDetectLanguage()).resolves.toBe(ZhType.hant);
  });

  it('falls back to the content-language metadata tag', async () => {
    document.head.innerHTML = '<meta http-equiv="content-language" content="zh-HK">';
    await expect(getDetectLanguage()).resolves.toBe(ZhType.hant);
  });

  it('returns und when no reliable language hint exists', async () => {
    await expect(getDetectLanguage()).resolves.toBe(ZhType.und);
  });
});
