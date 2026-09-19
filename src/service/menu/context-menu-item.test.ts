import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../browser', () => ({
  browser: {
    contextMenus: { create: vi.fn() },
    runtime: {},
  },
}));

import { createContextMenuItem } from './context-menu-item';

describe('createContextMenuItem', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('consumes Chrome runtime.lastError through the create callback', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const runtime = { lastError: { message: 'duplicate id' } };
    const create = vi.fn((_properties: unknown, callback: () => void) => callback());

    vi.stubGlobal('chrome', {
      contextMenus: { create },
      runtime,
    });

    const id = createContextMenuItem({ id: 'menu-id', title: 'Menu' });

    expect(id).toBe('menu-id');
    expect(create).toHaveBeenCalledOnce();
    expect(runtime.lastError).toEqual({ message: 'duplicate id' });
    expect(warn).toHaveBeenCalledWith('[contextMenus] duplicate id');
  });
});
