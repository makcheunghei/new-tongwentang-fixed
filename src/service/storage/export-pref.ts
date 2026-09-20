import { safeUpgradePref } from '../../preference/upgrade';
import { i18n } from '../i18n/i18n';
import { createNoti } from '../notification/create-noti';
import { BROWSER_TYPE } from '../types';
import { getStorage } from './storage';

const delayRevoke = (url: string) => setTimeout(() => URL.revokeObjectURL(url), 60_000);

export const exportPref = async (): Promise<void> => {
  try {
    const pref = await getStorage().then(pref => safeUpgradePref(BROWSER_TYPE, pref));
    const blob = new Blob([JSON.stringify(pref, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = 'tongwentang-pref.json';
    anchor.style.display = 'none';
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    delayRevoke(url);
  } catch {
    await createNoti(i18n.getMessage('MSG_EXPORT_FAILED'));
  }
};
