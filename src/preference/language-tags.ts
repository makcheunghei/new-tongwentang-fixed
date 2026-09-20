export const DEFAULT_CHT_TAGS = ['zh-hant', 'zh-tw', 'zh-hk', 'zh-mo'] as const;
export const DEFAULT_CHS_TAGS = ['zh', 'zh-cn', 'zh-hans', 'zh-sg'] as const;

export type ChineseLanguageKind = 'hant' | 'hans';

export const normalizeLanguageTag = (tag: string | null | undefined): string =>
  tag?.trim().toLowerCase().replaceAll('_', '-').replace(/\.+$/, '') ?? '';

export const normalizeLanguageTags = (tags: readonly string[]): string[] => [
  ...new Set(tags.map(normalizeLanguageTag).filter(Boolean)),
];

export const parseLanguageTags = (value: string): string[] => normalizeLanguageTags(value.split(','));

export const matchesLanguageTag = (language: string, tag: string): boolean =>
  language === tag || language.startsWith(`${tag}-`);

export const classifyLanguageTag = (
  language: string,
  chtTags: readonly string[] = DEFAULT_CHT_TAGS,
  chsTags: readonly string[] = DEFAULT_CHS_TAGS,
): ChineseLanguageKind | null => {
  const normalizedLanguage = normalizeLanguageTag(language);
  if (!normalizedLanguage) return null;

  const normalizedChtTags = normalizeLanguageTags(chtTags);
  const normalizedChsTags = normalizeLanguageTags(chsTags);

  if (normalizedChtTags.some(tag => matchesLanguageTag(normalizedLanguage, tag))) return 'hant';
  if (normalizedChsTags.some(tag => matchesLanguageTag(normalizedLanguage, tag))) return 'hans';
  return null;
};
