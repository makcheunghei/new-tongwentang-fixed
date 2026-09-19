import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDefaultPref } from '../../preference/default';

const { contextMenus, menuIds } = vi.hoisted(() => {
  const ids = new Set<string>();

  return {
    menuIds: ids,
    contextMenus: {
      create: vi.fn((properties: { id: string }) => {
        if (ids.has(properties.id)) throw new Error(`duplicate menu id: ${properties.id}`);
        ids.add(properties.id);
        return properties.id;
      }),
      removeAll: vi.fn(async () => {
        ids.clear();
      }),
    },
  };
});

vi.mock('../browser', () => ({ browser: { contextMenus, runtime: {} } }));
vi.mock('../i18n/i18n', () => ({ i18n: { getMessage: (key: string) => key } }));

import { rebuildMenus } from './rebuild-menus';

const expectedIds = new Set([
  'domain_disabled',
  'domain_s2t',
  'domain_t2s',
  'options',
  'clipboard_s2t',
  'clipboard_t2s',
  'top_context_menu_id',
  'textarea_s2t',
  'textarea_t2s',
  'webpage_s2t',
  'webpage_t2s',
]);

describe('rebuildMenus', () => {
  beforeEach(() => {
    menuIds.clear();
    contextMenus.create.mockClear();
    contextMenus.removeAll.mockClear();
  });

  it('clears stale menus before creating browser action and page menus', async () => {
    await rebuildMenus(getDefaultPref().menu);

    expect(contextMenus.removeAll).toHaveBeenCalledOnce();
    expect(menuIds).toEqual(expectedIds);
  });

  it('serializes concurrent rebuilds and never creates duplicate ids', async () => {
    const menu = getDefaultPref().menu;

    await expect(Promise.all([rebuildMenus(menu), rebuildMenus(menu)])).resolves.toEqual([undefined, undefined]);
    expect(contextMenus.removeAll).toHaveBeenCalledTimes(2);
    expect(menuIds).toEqual(expectedIds);
  });
});
