import { i18n } from '../service/i18n/i18n';
import { createNoti } from '../service/notification/create-noti';

export const reportActionError = async (error: unknown): Promise<void> => {
  const message = error instanceof Error ? error.message : String(error);
  const unavailable =
    /receiving end|could not establish connection|message (?:port|channel) closed|context invalidated/i.test(message);
  console.warn('[conversion]', message);
  await createNoti(i18n.getMessage(unavailable ? 'NT_PAGE_UNAVAILABLE' : 'NT_CONVERSION_FAILED')).catch(console.error);
};
