import { browser } from '../../service/browser';
import { getDefaultPref } from '../../preference/default';
import type { PreferenceUpdate } from '../../service/storage/preference-update';
import { serializeStorageMutation } from '../../service/storage/mutation-queue';
import { getStorage, writeStorage as setStorage } from '../../service/storage/storage';

export const updatePreference = (update: PreferenceUpdate): Promise<boolean> =>
  serializeStorageMutation(async () => {
    const pref = await getStorage();
    switch (update.section) {
      case 'replace':
        await setStorage(update.value);
        break;
      case 'reset':
        await browser.storage.local.clear();
        await setStorage(update.value ?? getDefaultPref());
        break;
      case 'general':
        await setStorage({ general: { ...pref.general, ...update.patch } });
        break;
      case 'menu':
        await setStorage({ menu: { ...pref.menu, enabled: update.enabled } });
        break;
      case 'menuItem': {
        const group = pref.menu.group;
        await setStorage({
          menu: {
            ...pref.menu,
            group: { ...group, [update.group]: { ...group[update.group], [update.target]: update.enabled } },
          },
        });
        break;
      }
      case 'filter':
        if (JSON.stringify(pref.filter) !== JSON.stringify(update.base)) return false;
        await setStorage({ filter: update.value });
        break;
    }
    return true;
  });
