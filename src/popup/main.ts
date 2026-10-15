import { LangType } from 'tongwen-core/dictionaries';
import { browser } from '../service/browser';
import { dispatchCtAction } from '../service/runtime/content';
import { getStorage } from '../service/storage/storage';
import { ZhType } from '../service/tabs/tabs.constant';

const status = document.querySelector<HTMLElement>('#status')!;
const buttons = document.querySelectorAll<HTMLButtonElement>('.actions button');
const run = async (target: LangType | 'auto'): Promise<void> => {
  buttons.forEach(button => {
    button.disabled = true;
  });
  status.textContent = '正在轉換…';
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (tab?.id == null) throw new Error('NO_ACTIVE_TAB');
    let direction: LangType;
    if (target === 'auto') {
      const kind = await dispatchCtAction({ type: 'ZhType', payload: undefined }, tab.id, 0);
      const { general } = await getStorage('general');
      direction = kind === ZhType.hans ? LangType.s2t : kind === ZhType.hant ? LangType.t2s : general.defaultTarget;
    } else direction = target;
    await dispatchCtAction({ type: 'Webpage', payload: direction }, tab.id);
    status.textContent = '已完成轉換。';
  } catch {
    status.textContent = '無法轉換。請先允許此擴充功能存取目前網站，再重新整理網頁。Safari 系統頁面不支援轉換。';
  } finally {
    buttons.forEach(button => {
      button.disabled = false;
    });
  }
};

document.querySelector('#s2t')!.addEventListener('click', () => {
  void run(LangType.s2t);
});
document.querySelector('#t2s')!.addEventListener('click', () => {
  void run(LangType.t2s);
});
document.querySelector('#auto')!.addEventListener('click', () => {
  void run('auto');
});
document.querySelector('#settings')!.addEventListener('click', () => {
  void browser.runtime
    .openOptionsPage()
    .catch(async () => {
      await browser.tabs.create({ url: browser.runtime.getURL('options.html') });
    })
    .catch(() => {
      status.textContent = '暫時無法開啟設定，請在 Safari 重新開啟擴充功能。';
    });
});
