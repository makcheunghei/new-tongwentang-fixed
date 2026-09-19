import type { LangType } from 'tongwen-core/dictionaries';
import type { Menus } from 'webextension-polyfill';
import type { Pref } from '../../preference/types/lastest';
import type { PrefMenuGroupKeys, PrefMenuOptions } from '../../preference/types/v2';
import { browser } from '../browser';
import { i18n } from '../i18n/i18n';
import { getSubMenuContexts, getTopMenuContexts } from './determine-context';

export type MenuId = string | number;
export type ContextMenuChildrenId = `${PrefMenuGroupKeys}_${LangType}`;

export const TOP_CONTEXT_MENU_ID = 'top_context_menu_id';

function createSubMenu(parentId: MenuId, funcKey: PrefMenuGroupKeys, settings: PrefMenuOptions): MenuId[] {
  return Object.entries(settings)
    .filter(([, enabled]) => enabled)
    .map(([target]) => {
      const menuProps: Menus.CreateCreatePropertiesType = {
        parentId,
        id: `${funcKey}_${target}`,
        type: 'normal',
        title: i18n.getMessage(`MSG_${funcKey}_${target}`),
        contexts: getSubMenuContexts(funcKey),
      };

      return browser.contextMenus.create(menuProps);
    });
}

export async function createMenu(menu: Pref['menu']): Promise<unknown> {
  await browser.contextMenus.remove(TOP_CONTEXT_MENU_ID).catch(() => undefined);

  const contexts = menu.enabled ? getTopMenuContexts(menu.group) : [];
  if (contexts.length === 0) return undefined;

  const menuId = browser.contextMenus.create({
    id: TOP_CONTEXT_MENU_ID,
    type: 'normal',
    title: i18n.getMessage('MSG_EXT_NAME'),
    contexts,
  });

  await Promise.all(
    Object.entries(menu.group).flatMap(([funcKey, settings]) =>
      createSubMenu(menuId, funcKey as PrefMenuGroupKeys, settings),
    ),
  );

  return menuId;
}
