import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDefaultPref } from '../../preference/default';

const { contextMenus } = vi.hoisted(() => ({
  contextMenus: {
    create: vi.fn((properties: { id: string }) => properties.id),
    remove: vi.fn(async () => undefined),
  },
}));

vi.mock('../browser', () => ({ browser: { contextMenus } }));
vi.mock('../i18n/i18n', () => ({ i18n: { getMessage: (key: string) => key } }));

import { createMenu, TOP_CONTEXT_MENU_ID } from './create-menu';

describe('createMenu', () => {
  beforeEach(() => {
    contextMenus.create.mockClear();
    contextMenus.remove.mockClear();
  });

  it('creates the initial webpage context menu and its enabled children', async () => {
    await createMenu(getDefaultPref().menu);

    expect(contextMenus.remove).toHaveBeenCalledWith(TOP_CONTEXT_MENU_ID);
    expect(contextMenus.create).toHaveBeenCalledWith(
      expect.objectContaining({ id: TOP_CONTEXT_MENU_ID, contexts: expect.arrayContaining(['page']) }),
    );
    expect(contextMenus.create).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'webpage_s2t', parentId: TOP_CONTEXT_MENU_ID }),
    );
    expect(contextMenus.create).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'webpage_t2s', parentId: TOP_CONTEXT_MENU_ID }),
    );
  });
});
