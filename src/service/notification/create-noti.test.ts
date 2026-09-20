import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { create } = vi.hoisted(() => ({ create: vi.fn() }));

vi.mock('../browser', () => ({ browser: { notifications: { clear: vi.fn(), create } } }));
vi.mock('../i18n/i18n', () => ({ i18n: { getMessage: () => '通知標題' } }));
vi.mock('../types', () => ({ IS_SAFARI: true }));

import { createNoti } from './create-noti';

describe('createNoti Safari fallback', () => {
  beforeEach(() => {
    create.mockClear();
    vi.spyOn(window, 'alert').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses a browser alert when notifications are unavailable', async () => {
    await createNoti('剪貼簿已轉換');

    expect(window.alert).toHaveBeenCalledWith('剪貼簿已轉換');
    expect(create).not.toHaveBeenCalled();
  });
});
