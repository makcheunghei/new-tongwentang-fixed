import { LangType } from 'tongwen-core/dictionaries';
import { i18n } from '../i18n/i18n';
import type { ContextMenuItemProperties } from './context-menu-item';

export type ActionMenuId = (
  ReturnType<typeof createBrowserActionProperties> | ReturnType<typeof createClipboardProperties>
)[number]['id'];

const createBrowserActionProperties = () =>
  [
    {
      id: 'domain_disabled',
      title: i18n.getMessage('MSG_ADD_DOMAIN_TO_DISABLED'),
    },
    {
      id: `domain_${LangType.s2t}`,
      title: i18n.getMessage('MSG_ADD_DOMAIN_TO_S2T'),
    },
    {
      id: `domain_${LangType.t2s}`,
      title: i18n.getMessage('MSG_ADD_DOMAIN_TO_T2S'),
    },
    {
      id: 'options',
      title: i18n.getMessage('MSG_OPTION'),
    },
  ] as const;

const createClipboardProperties = () =>
  [
    {
      id: `clipboard_${LangType.s2t}`,
      title: i18n.getMessage('MSG_CONVERT_CLIPBOARD_S2T'),
    },
    {
      id: `clipboard_${LangType.t2s}`,
      title: i18n.getMessage('MSG_CONVERT_CLIPBOARD_T2S'),
    },
  ] as const;

export const createBrowserActionMenuItems = (): ContextMenuItemProperties[] =>
  [...createBrowserActionProperties(), ...createClipboardProperties()].map(item => ({
    ...item,
    type: 'normal',
    contexts: ['action'],
  }));
