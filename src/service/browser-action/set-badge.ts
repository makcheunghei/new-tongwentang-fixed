import { LangType } from 'tongwen-core/dictionaries';
import type { Pref } from '../../preference/types/lastest';
import type { BrowserActionOpt } from '../../preference/types/v2';
import { browser } from '../browser';
import { getBrowserCapabilities } from '../browser/capabilities';

const browserActionToBadge = (ba: BrowserActionOpt) => (ba === 'auto' ? 'A' : ba === LangType.s2t ? 'T' : 'S');

const color = '#C0C0C0';

export const setBadge = async (general: Pref['general']) => {
  if (!(await getBrowserCapabilities()).badge) return [undefined, undefined];
  const text = browserActionToBadge(general.browserAction);
  const setText = browser.action?.setBadgeText?.({ text });
  const setBg = browser.action?.setBadgeBackgroundColor?.({ color });

  return Promise.all([setText, setBg]);
};
