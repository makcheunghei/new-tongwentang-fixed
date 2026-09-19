import { LangType } from 'tongwen-core/dictionaries';
import { browser } from '../../service/browser';
import type { ActionMenuId } from '../../service/menu/browser-action';
import type { ContextMenuChildrenId } from '../../service/menu/create-menu';
import { dispatchCtAction } from '../../service/runtime/content';
import { convertClipboard } from '../clipboard';
import { bgLog } from '../logger';
import { addDomainToRules } from './browser-action';

export const listenMenusEvent = () => {
  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    bgLog('[BG_RECEIVED_MENU_EVENT]: ', { info, tab });

    switch (info.menuItemId as ActionMenuId | ContextMenuChildrenId) {
      case 'domain_disabled':
        return addDomainToRules('disabled', info.pageUrl);
      case 'domain_s2t':
        return addDomainToRules(LangType.s2t, info.pageUrl);
      case 'domain_t2s':
        return addDomainToRules(LangType.t2s, info.pageUrl);
      case 'options':
        return browser.runtime.openOptionsPage();
      case 'clipboard_s2t':
        return convertClipboard(LangType.s2t);
      case 'clipboard_t2s':
        return convertClipboard(LangType.t2s);
      case 'textarea_s2t':
        return typeof tab?.id === 'number' && dispatchCtAction({ type: 'Textarea', payload: LangType.s2t }, tab.id);
      case 'textarea_t2s':
        return typeof tab?.id === 'number' && dispatchCtAction({ type: 'Textarea', payload: LangType.t2s }, tab.id);
      case 'webpage_s2t':
        return typeof tab?.id === 'number' && dispatchCtAction({ type: 'Webpage', payload: LangType.s2t }, tab.id);
      case 'webpage_t2s':
        return typeof tab?.id === 'number' && dispatchCtAction({ type: 'Webpage', payload: LangType.t2s }, tab.id);
    }
  });
};
