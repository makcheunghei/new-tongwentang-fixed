import type { Pref } from '../../preference/types/lastest';
import { browser } from '../browser';
import { createBrowserActionMenuItems } from './browser-action';
import { createContextMenuItem } from './context-menu-item';
import { createContextMenu } from './create-menu';

let menuQueue: Promise<unknown> = Promise.resolve();

async function rebuildMenusNow(menu: Pref['menu']): Promise<void> {
  await browser.contextMenus.removeAll();

  for (const item of createBrowserActionMenuItems()) {
    createContextMenuItem(item);
  }

  createContextMenu(menu);
}

export function rebuildMenus(menu: Pref['menu']): Promise<unknown> {
  const task = menuQueue.catch(() => undefined).then(() => rebuildMenusNow(menu));
  menuQueue = task.catch(() => undefined);
  return task;
}
