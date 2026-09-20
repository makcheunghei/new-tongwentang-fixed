import browser from 'webextension-polyfill';
import enMessages from '../../_locales/en/messages.json';
import zhCNMessages from '../../_locales/zh_CN/messages.json';
import zhHKMessages from '../../_locales/zh_HK/messages.json';
import zhTWMessages from '../../_locales/zh_TW/messages.json';

type MessageEntry = {
  message: string;
};

type MessageMap = Record<string, MessageEntry>;
type FallbackLocale = 'en' | 'zh_CN' | 'zh_HK' | 'zh_TW';

const FALLBACK_MESSAGES: Record<FallbackLocale, MessageMap> = {
  en: enMessages,
  zh_CN: zhCNMessages,
  zh_HK: zhHKMessages,
  zh_TW: zhTWMessages,
};

const DEFAULT_LOCALE: FallbackLocale = 'en';

const toArray = (substitutions?: string | string[]): string[] => {
  if (substitutions == null) return [];
  return Array.isArray(substitutions) ? substitutions : [substitutions];
};

const applySubstitutions = (message: string, substitutions?: string | string[]): string =>
  toArray(substitutions).reduce(
    (value, substitution, index) => value.replaceAll(`$${index + 1}`, substitution),
    message.replaceAll('$$', '$'),
  );

const getFallbackLocale = (): FallbackLocale => {
  const candidates = [
    browser.i18n?.getUILanguage?.(),
    ...(globalThis.navigator?.languages ?? []),
    globalThis.navigator?.language,
  ]
    .filter((locale): locale is string => Boolean(locale))
    .map(locale => locale.replace('-', '_'));

  for (const locale of candidates) {
    const normalized = locale.toLowerCase();

    if (normalized === 'zh_cn' || normalized === 'zh_sg') return 'zh_CN';
    if (normalized === 'zh_hk' || normalized === 'zh_mo') return 'zh_HK';
    if (normalized.startsWith('zh')) return 'zh_TW';
    if (normalized.startsWith('en')) return 'en';
  }

  return DEFAULT_LOCALE;
};

const getFallbackMessage = (name: string, substitutions?: string | string[]): string => {
  const locale = getFallbackLocale();
  const message = FALLBACK_MESSAGES[locale][name]?.message ?? FALLBACK_MESSAGES[DEFAULT_LOCALE][name]?.message ?? name;
  return applySubstitutions(message, substitutions);
};

const getMessage = (name: string, substitutions?: string | string[]): string => {
  try {
    const message = browser.i18n?.getMessage(name, substitutions as never);
    if (message) return message;
  } catch {
    return getFallbackMessage(name, substitutions);
  }

  return getFallbackMessage(name, substitutions);
};

export const i18n = {
  getMessage,
};
