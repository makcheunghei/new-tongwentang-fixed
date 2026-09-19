import { i18n } from '../service/i18n/i18n';
import { rebuildMenus } from '../service/menu/rebuild-menus';
import { mountBrowserActionListener } from './browser-action';
import { mountCommandListener } from './commands';
import { listenMenusEvent } from './menu/listen';
import { mountRuntimeListener } from './runtime';
import { mountPrefListener } from './state/mount-pref-listener';
import { bgInitialPref } from './state/storage';

mountPrefListener();
mountRuntimeListener();
mountBrowserActionListener();
mountCommandListener();
listenMenusEvent();
bgInitialPref()
  .then(({ menu }) => rebuildMenus(menu))
  .catch(console.error);

console.info(`${i18n.getMessage('MSG_EXT_NAME')} 👌`);
