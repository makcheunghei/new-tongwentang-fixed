import type { Tabs } from 'webextension-polyfill';
import { isUrlLike } from '../../preference/filter-rule';
import type { FilterTarget } from '../../preference/types/v2';
import { addFilterRule } from '../../service/storage/local';
import { getHostName, getRandomId } from '../../utilities';

export const addDomainToRules = (target: FilterTarget, tab: Tabs.Tab) => {
  if (!tab.url || !isUrlLike(tab.url)) return;
  return addFilterRule({
    target,
    regexp: null,
    id: getRandomId(),
    pattern: getHostName(tab.url),
  });
};
