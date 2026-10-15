import { LangType } from 'tongwen-core/dictionaries';
import { browser } from '../../service/browser';
import { i18n } from '../../service/i18n/i18n';
import { createNoti } from '../../service/notification/create-noti';
import { IS_SAFARI } from '../../service/types';
import { getConverter } from '../converter';
import { offscreenClipboard } from './offscreen';

const convertClipboardContent = async (target: LangType): Promise<void> => {
  const useDocument = typeof navigator.clipboard?.readText === 'function';
  const source = useDocument ? await navigator.clipboard.readText() : await offscreenClipboard('read');
  const converter = await getConverter();
  const converted = converter.phrase(target, source);
  if (converted === source) return;
  if (useDocument) {
    if ((await navigator.clipboard.readText()) !== source) throw new Error('CLIPBOARD_CHANGED');
    await navigator.clipboard.writeText(converted);
  } else await offscreenClipboard('write', converted, source);
};

const requestClipboardPermission = async (): Promise<boolean> => {
  if (IS_SAFARI || !browser.permissions?.request) return true;
  return browser.permissions.request({ permissions: ['clipboardRead', 'clipboardWrite'] });
};

export const convertClipboard = async (target: LangType): Promise<void> => {
  // Keep permission requests in the original user gesture on Firefox / Chromium.
  if (IS_SAFARI) return;
  return requestClipboardPermission()
    .then(async isGet => (isGet && (await convertClipboardContent(target)), isGet))
    .then(async isGet => {
      await createNoti(
        i18n.getMessage(!isGet ? 'NT_GRT_PRM_DENIED' : target === LangType.s2t ? 'NT_CLB_TO_S2T' : 'NT_CLB_TO_T2S'),
      );
    })
    .catch(async (error: unknown) => {
      const message = String(error);
      const key = message.includes('CLIPBOARD_CHANGED')
        ? 'NT_CLIPBOARD_CHANGED'
        : message.includes('CLIPBOARD_UNAVAILABLE')
          ? 'NT_CLIPBOARD_UNAVAILABLE'
          : /user gesture|user input|user interaction/i.test(message)
            ? 'NT_GRT_PRM_ONLY_USR_INTER'
            : 'NT_CLIPBOARD_FAILED';
      await createNoti(i18n.getMessage(key)).catch(console.error);
    });
};
