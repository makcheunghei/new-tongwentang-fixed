import { getRandomId } from '../../utilities';
import type { Pref } from '../types/lastest';
import type { PrefFilterRule, RegExpMaybe } from '../types/v2';

export const REGEXP_PATTERN = /^\/([\s\S]+)\/([dgimsuvy]*)$/;
export const DOMAIN_PATTERN =
  /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;

export const isUrlLike = (pattern: string): boolean => {
  try {
    const protocol = new URL(pattern).protocol;
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
};

export const isDomainLike = (pattern: string) => DOMAIN_PATTERN.test(pattern.trim());
export const isRegExpLike = (pattern: string) => REGEXP_PATTERN.test(pattern.trim());

const escapeRegex = (str: string): string => str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

const parseRegExpLike = (pattern: string): RegExp | null => {
  try {
    const match = REGEXP_PATTERN.exec(pattern.trim());
    if (!match) return null;
    const [, body = '', options = ''] = match;
    return new RegExp(body, [...new Set(options)].join(''));
  } catch {
    return null;
  }
};

const createRegExpWithDomainLike = (pattern: string): RegExpMaybe => {
  try {
    return new RegExp(`(?:^|\\.)${escapeRegex(pattern.trim())}$`, 'i');
  } catch {
    return null;
  }
};

export const isFilterPatternValid = (pattern: string) => isDomainLike(pattern) || parseRegExpLike(pattern) !== null;

export const patternRegExpify = (pattern: string): RegExpMaybe =>
  isRegExpLike(pattern) ? parseRegExpLike(pattern) : isDomainLike(pattern) ? createRegExpWithDomainLike(pattern) : null;

const testRegExp = (regexp: RegExp, value: string): boolean => {
  regexp.lastIndex = 0;
  return regexp.test(value);
};

export const matchesFilterRule = (rule: PrefFilterRule, url: URL): boolean => {
  if (isRegExpLike(rule.pattern)) {
    return rule.regexp != null && testRegExp(rule.regexp, url.href);
  }

  if (isDomainLike(rule.pattern)) {
    const pattern = rule.pattern.trim().toLowerCase();
    const host = url.hostname.toLowerCase();
    return host === pattern || host.endsWith(`.${pattern}`);
  }

  return false;
};

export const regularOldPattern = (pattern: string) => `/${pattern.replace(/(\W)/g, '\\$1').replace(/\\\*/g, '.*')}/`;

export const patchFilterRulesRegExp = (filter: Pref['filter']): Pref['filter'] => {
  return { ...filter, rules: filter.rules.map(rule => ({ ...rule, regexp: patternRegExpify(rule.pattern) })) };
};

export const createFilterRule = (): PrefFilterRule => ({
  id: getRandomId(),
  pattern: '',
  target: 'disabled',
  regexp: null,
});
