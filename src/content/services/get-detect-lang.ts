import { chsTypes, chtTypes, ZhType } from '../../service/tabs/tabs.constant';

type GetDetectLanguage = () => Promise<ZhType>;

const normalizeLanguage = (lang: string | null | undefined): string =>
  lang?.trim().toLowerCase().replaceAll('_', '-') ?? '';

const langToZhType = (lang: string): ZhType => {
  if (!lang) return ZhType.und;
  if (chtTypes.some(tag => lang === tag || lang.startsWith(`${tag}-`))) return ZhType.hant;
  if (chsTypes.some(tag => lang === tag || lang.startsWith(`${tag}-`))) return ZhType.hans;
  return ZhType.und;
};

const getMetaContentLanguage = (): string => {
  const meta = document.querySelector<HTMLMetaElement>('meta[http-equiv="content-language" i]');
  return meta?.content ?? '';
};

export const getDetectLanguage: GetDetectLanguage = async () =>
  langToZhType(normalizeLanguage(document.documentElement.lang) || normalizeLanguage(getMetaContentLanguage()));
