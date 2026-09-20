import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LangType } from 'tongwen-core/dictionaries';

const { browser, createNoti, phrase, request } = vi.hoisted(() => {
  const request = vi.fn();
  const phrase = vi.fn((_target: LangType, _text: string) => '繁體');
  return {
    browser: { permissions: { request } },
    createNoti: vi.fn(),
    phrase,
    request,
  };
});

vi.mock('../../service/browser', () => ({ browser }));
vi.mock('../../service/i18n/i18n', () => ({ i18n: { getMessage: (key: string) => key } }));
vi.mock('../../service/notification/create-noti', () => ({ createNoti }));
vi.mock('../../service/types', () => ({ IS_SAFARI: true }));
vi.mock('../converter', () => ({ getConverter: vi.fn(async () => ({ phrase })) }));

import { convertClipboard } from '.';

describe('convertClipboard Safari fallback', () => {
  const readText = vi.fn(async () => '简体');
  const writeText = vi.fn(async () => undefined);

  beforeEach(() => {
    request.mockClear();
    createNoti.mockClear();
    phrase.mockClear();
    readText.mockClear();
    writeText.mockClear();
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { readText, writeText },
    });
  });

  it('uses navigator.clipboard without requesting optional permissions', async () => {
    await convertClipboard(LangType.s2t);

    expect(request).not.toHaveBeenCalled();
    expect(readText).toHaveBeenCalledOnce();
    expect(writeText).toHaveBeenCalledWith('繁體');
    expect(createNoti).toHaveBeenCalledWith('NT_CLB_TO_S2T');
  });
});
