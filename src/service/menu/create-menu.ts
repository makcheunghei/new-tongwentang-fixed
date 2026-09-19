import type { LangType } from 'tongwen-core/dictionaries';
import type { Pref } from '../../preference/types/lastest';
import type { PrefMenuGroupKeys, PrefMenuOptions } from '../../preference/types/v2';
import { i18n } from '../i18n/i18n';
import { createContextMenuItem, type ContextMenuItemProperties } from './context-menu-item';
import { getSubMenuContexts, getTopMenuContexts } from './determine-context';

export type MenuId = string | number;
export type ContextMenuChildrenId = `${PrefMenuGroupKeys}_${LangType}`;

export const TOP_CONTEXT_MENU_ID = 'top_context_menu_id';

const createSubMenuItems = (
  parentId: MenuId,
  funcKey: PrefMenuGroupKeys,
  settings: PrefMenuOptions,
): ContextMenuItemProperties[] =>
  Object.entries(settings)
    .filter(([, enabled]) => enabled)
    .map(([target]) => ({
      parentId,
      id: `${funcKey}_${target}`,
      type: 'normal',
      title: i18n.getMessage(`MSG_${funcKey}_${target}`),
      contexts: getSubMenuContexts(funcKey),
    }));

export const createContextMenu = (menu: Pref['menu']): void => {
  const contexts = menu.enabled ? getTopMenuContexts(menu.group) : [];
  if (contexts.length === 0) return;

  const menuId = createContextMenuItem({
    id: TOP_CONTEXT_MENU_ID,
    type: 'normal',
    title: i18n.getMessage('MSG_EXT_NAME'),
    contexts,
  });

  for (const item of Object.entries(menu.group).flatMap(([funcKey, settings]) =>
    createSubMenuItems(menuId, funcKey as PrefMenuGroupKeys, settings),
  )) {
    createContextMenuItem(item);
  }
};
