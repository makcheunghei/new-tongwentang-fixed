import { browser } from '../service/browser';

export async function closeOptionsPage(): Promise<void> {
  try {
    // getCurrent identifies this extension page, never the website behind a popup.
    const tab = await browser.tabs.getCurrent();
    if (typeof tab?.id === 'number') {
      await browser.tabs.remove(tab.id);
      return;
    }
  } catch {
    // Safari can present extension settings without a normal tab.
  }
  window.close();
}
