import type { Pref } from '../../preference/types/lastest';
import type { MaybeTransTarget } from '../../preference/types/types';
import type { FilterTarget } from '../../preference/types/v2';
import type { browser } from '../../service/browser';
import type { ZhType } from '../../service/tabs/tabs.constant';
import { getTargetByAutoConvert } from './handle-get-auto-convert';
import { getTargetByFilter } from './handle-get-filter-target';

// TODO: remove type assertion after Promise.then type infer bug fixed
export const getTarget = async (
  pref: Pref,
  sender: browser.Runtime.MessageSender,
  zhType: ZhType,
): Promise<MaybeTransTarget> =>
  Promise.resolve(getTargetByFilter(pref, sender.url!))
    .then(async ft =>
      ft != null ? ft : (getTargetByAutoConvert(zhType) as Promise<FilterTarget | undefined | MaybeTransTarget>),
    )
    .then(ft => (ft === 'disabled' ? undefined : ft));
