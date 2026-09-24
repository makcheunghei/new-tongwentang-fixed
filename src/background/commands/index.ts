import { LangType } from 'tongwen-core/dictionaries';
import { browser } from '../../service/browser';
import { CommandType } from '../../service/commands/type';
import { dispatchCtAction } from '../../service/runtime/content';
import { convertClipboard } from '../clipboard';
import { bgLog } from '../logger';

const convertActiveTab = async (target: LangType) => {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  const tabId = tab?.id;
  if (typeof tabId !== 'number') return undefined;
  return dispatchCtAction({ type: 'Webpage', payload: target }, tabId);
};

export const mountCommandListener = () => {
  browser.commands?.onCommand.addListener(async cmd => {
    bgLog('[BG_RECEIVE_COMMAND]:', cmd);

    switch (cmd) {
      case CommandType.wS2t:
        return convertActiveTab(LangType.s2t);
      case CommandType.wT2s:
        return convertActiveTab(LangType.t2s);
      case CommandType.cS2t:
        return convertClipboard(LangType.s2t);
      case CommandType.cT2s:
        return convertClipboard(LangType.t2s);
    }
  });
};
