import { browser } from '../../service/browser';
import { dispatchBgAction } from '../../service/runtime/background';
import type { CtReqAction } from '../../service/runtime/content';
import { handleCtReqAction } from '../../service/runtime/content';
import { isContentMessage } from '../../service/runtime/message-target';
import { convertNode } from '../convert';
import type { CtState } from '../state';
import { handleTextarea } from './handle-textarea';

export const mountRuntimeListener = (state: CtState) => {
  browser.runtime.onMessage.addListener((message: unknown) => {
    // runtime.sendMessage reaches every frame. Only content actions may claim
    // the reply; otherwise Chrome closes the channel meant for the background.
    if (!isContentMessage(message)) return undefined;

    const action = message as CtReqAction;
    return (async () => {
      void dispatchBgAction({ type: 'Log', payload: ['[CT_RECEIVE_REQ]', action] }).catch(() => undefined);

      switch (action.type) {
        case 'Webpage':
          return handleCtReqAction(action, convertNode(state, action.payload, [document]));
        case 'Textarea':
          return handleCtReqAction(action, handleTextarea(action.payload));
        case 'ZhType':
          return handleCtReqAction(action, state.zhType);
      }
    })();
  });
};
