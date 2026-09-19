import { matchesFilterRule } from '../../preference/filter-rule';
import type { Pref } from '../../preference/types/lastest';
import type { FilterTarget } from '../../preference/types/v2';

export const getTargetByFilter = (pref: Pref, url: string): FilterTarget | undefined => {
  if (!pref.filter.enabled) return undefined;

  try {
    const parsedUrl = new URL(url);
    const rule = pref.filter.rules.find(rule => matchesFilterRule(rule, parsedUrl));
    return rule?.target;
  } catch {
    return undefined;
  }
};
