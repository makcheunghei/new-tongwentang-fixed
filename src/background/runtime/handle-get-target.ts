import type { Pref } from '../../preference/types/lastest';
import type { MaybeTransTarget } from '../../preference/types/types';
import type { browser } from '../../service/browser';
import type { ZhType } from '../../service/tabs/tabs.constant';
import { getTargetByAutoConvert } from './handle-get-auto-convert';
import { getTargetByFilter } from './handle-get-filter-target';

export const getTarget = async (
  pref: Pref,
  sender: browser.Runtime.MessageSender,
  zhType: ZhType,
): Promise<MaybeTransTarget> => {
  const filtered = getTargetByFilter(pref, sender.url ?? '');
  if (filtered === 'disabled') return undefined;
  if (filtered != null) return filtered;
  return getTargetByAutoConvert(pref, zhType);
};
