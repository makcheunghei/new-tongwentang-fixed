import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getMessage, getUILanguage } = vi.hoisted(() => ({
  getMessage: vi.fn<(name: string) => string>(),
  getUILanguage: vi.fn(() => 'zh-HK'),
}));

vi.mock('webextension-polyfill', () => ({
  default: {
    i18n: { getMessage, getUILanguage },
  },
}));

import { i18n } from './i18n';

describe('i18n fallback', () => {
  beforeEach(() => {
    getMessage.mockReset();
    getUILanguage.mockReturnValue('zh-HK');
  });

  it('uses browser.i18n when a message is available', () => {
    getMessage.mockReturnValue('瀏覽器訊息');
    expect(i18n.getMessage('MSG_LANG_RULE')).toBe('瀏覽器訊息');
  });

  it('falls back to bundled locale messages when browser.i18n returns empty', () => {
    getMessage.mockReturnValue('');
    expect(i18n.getMessage('MSG_LANG_RULE')).toBe('語言規則');
  });

  it('falls back to bundled locale messages when browser.i18n throws', () => {
    getMessage.mockImplementation(() => {
      throw new Error('unsupported');
    });
    expect(i18n.getMessage('MSG_LANG_RULE')).toBe('語言規則');
  });
});
