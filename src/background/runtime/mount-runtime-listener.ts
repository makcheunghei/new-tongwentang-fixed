import { browser } from '../../service/browser';
import type { BgReqAction } from '../../service/runtime/background';
import { handleBgReqAction } from '../../service/runtime/background';
import { isBackgroundMessage } from '../../service/runtime/message-target';
import { convertClipboard } from '../clipboard';
import { getConverter } from '../converter';
import { bgLog } from '../logger';
import { bgGetPref } from '../state/storage';
import { getTargetByFilter } from './handle-get-filter-target';
import { getTarget } from './handle-get-target';

/**
 * background message handler
 */
export function mountRuntimeListener() {
  browser.runtime.onMessage.addListener((message: unknown, sender: browser.Runtime.MessageSender) => {
    if (!isBackgroundMessage(message)) return undefined;

    const action = message as BgReqAction;
    bgLog('[BG_RECEIVE_REQ] req:', action, 'sender:', sender);

    return bgGetPref().then(async pref => {
      switch (action.type) {
        case 'FilterTarget':
          return handleBgReqAction(action, getTargetByFilter(pref, sender.url ?? ''));
        case 'GetTarget':
          return handleBgReqAction(action, getTarget(pref, sender, action.payload.zhType));
        case 'NodesText':
          return getConverter().then(async converter =>
            handleBgReqAction(
              action,
              action.payload.texts.map(text => converter.phrase(action.payload.target, text)),
            ),
          );
        case 'Convert':
          return getConverter().then(async converter =>
            handleBgReqAction(action, converter.phrase(action.payload.target, action.payload.text)),
          );
        case 'ConvertClipboard':
          return handleBgReqAction(action, convertClipboard(action.payload));
        case 'SpaMode':
          return handleBgReqAction(action, pref.general.spaMode);
        case 'Log':
          bgLog(...action.payload);
          return handleBgReqAction(action, undefined);
      }
    });
  });
}
