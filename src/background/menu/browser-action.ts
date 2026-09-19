import { isUrlLike } from '../../preference/filter-rule';
import type { FilterTarget } from '../../preference/types/v2';
import { addFilterRule } from '../../service/storage/local';
import { getHostName, getRandomId } from '../../utilities';

export const addDomainToRules = (target: FilterTarget, url: string | undefined) => {
  if (!url || !isUrlLike(url)) return;
  return addFilterRule({
    target,
    regexp: null,
    id: getRandomId(),
    pattern: getHostName(url),
  });
};
