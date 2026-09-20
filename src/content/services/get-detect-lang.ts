import {
  classifyLanguageTag,
  DEFAULT_CHS_TAGS,
  DEFAULT_CHT_TAGS,
  normalizeLanguageTag,
} from '../../preference/language-tags';
import type { PrefFilter } from '../../preference/types/v2';
import { getStorage } from '../../service/storage/storage';
import { ZhType } from '../../service/tabs/tabs.constant';

type GetDetectLanguage = (filter?: PrefFilter) => Promise<ZhType>;

const getMetaContentLanguage = (): string => {
  const meta = document.querySelector<HTMLMetaElement>('meta[http-equiv="content-language" i]');
  return meta?.content ?? '';
};

export const getDocumentLanguageTag = (): string =>
  normalizeLanguageTag(document.documentElement.lang) || normalizeLanguageTag(getMetaContentLanguage());

export const getDetectLanguage: GetDetectLanguage = async filter => {
  const tags = filter ?? (await getStorage('filter').then(({ filter }) => filter));
  const kind = classifyLanguageTag(
    getDocumentLanguageTag(),
    tags?.chtTags ?? DEFAULT_CHT_TAGS,
    tags?.chsTags ?? DEFAULT_CHS_TAGS,
  );

  if (kind === 'hant') return ZhType.hant;
  if (kind === 'hans') return ZhType.hans;
  return ZhType.und;
};
