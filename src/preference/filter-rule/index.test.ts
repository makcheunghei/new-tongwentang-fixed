import { LangType } from 'tongwen-core/dictionaries';
import { describe, expect, it } from 'vitest';
import { isFilterPatternValid, isUrlLike, matchesFilterRule, patternRegExpify } from '.';
import type { PrefFilterRule } from '../types/v2';

const createRule = (pattern: string): PrefFilterRule => ({
  id: 'test-rule',
  pattern,
  target: LangType.s2t,
  regexp: patternRegExpify(pattern),
});

describe('filter rules', () => {
  it('matches an exact domain and its subdomains', () => {
    const rule = createRule('example.com');

    expect(matchesFilterRule(rule, new URL('https://example.com/article'))).toBe(true);
    expect(matchesFilterRule(rule, new URL('https://news.example.com/article'))).toBe(true);
    expect(matchesFilterRule(rule, new URL('https://example.com.evil.test/article'))).toBe(false);
  });

  it('does not reuse RegExp lastIndex between URL checks', () => {
    const rule = createRule('/example/g');

    expect(matchesFilterRule(rule, new URL('https://example.com/one'))).toBe(true);
    expect(matchesFilterRule(rule, new URL('https://example.com/two'))).toBe(true);
  });

  it('rejects invalid regular expressions and non-http URLs', () => {
    expect(isFilterPatternValid('/[/')).toBe(false);
    expect(isFilterPatternValid('/example/dgimsy')).toBe(true);
    expect(isUrlLike('https://example.com')).toBe(true);
    expect(isUrlLike('chrome://extensions')).toBe(false);
  });
});
