import { describe, expect, it } from 'vitest';
import {
  classifyLanguageTag,
  matchesLanguageTag,
  normalizeLanguageTag,
  normalizeLanguageTags,
  parseLanguageTags,
} from './language-tags';

describe('language tags', () => {
  it('normalizes tags and comma-separated values', () => {
    expect(normalizeLanguageTag(' ZH_Hant_TW. ')).toBe('zh-hant-tw');
    expect(normalizeLanguageTags([' ZH-TW ', 'zh-tw', '', 'JA_jp'])).toEqual(['zh-tw', 'ja-jp']);
    expect(parseLanguageTags(' zh-TW, zh-HK, zh-tw ')).toEqual(['zh-tw', 'zh-hk']);
  });

  it('matches exact and extended language tags', () => {
    expect(matchesLanguageTag('zh-hant-tw', 'zh-hant')).toBe(true);
    expect(matchesLanguageTag('zh-tw', 'zh-hant')).toBe(false);
  });

  it('supports custom Traditional and Simplified tag lists', () => {
    expect(classifyLanguageTag('ja-JP', ['ja'], [])).toBe('hant');
    expect(classifyLanguageTag('en-US', ['zh-hant'], ['en'])).toBe('hans');
    expect(classifyLanguageTag('fr-FR', ['ja'], ['en'])).toBeNull();
  });
});
