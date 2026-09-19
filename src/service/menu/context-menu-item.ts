import type { Menus } from 'webextension-polyfill';
import { browser } from '../browser';

export type ContextMenuItemProperties = Menus.CreateCreatePropertiesType & { id: string };

interface ChromeRuntime {
  lastError?: { message?: string };
}

interface ChromeApi {
  contextMenus: {
    create: (properties: Menus.CreateCreatePropertiesType, callback: () => void) => unknown;
  };
  runtime: ChromeRuntime;
}

const getChromeApi = (): ChromeApi | undefined => (globalThis as typeof globalThis & { chrome?: ChromeApi }).chrome;

const isFirefox = (): boolean =>
  typeof (browser.runtime as typeof browser.runtime & { getBrowserInfo?: () => Promise<unknown> }).getBrowserInfo ===
  'function';

const reportError = (error: unknown): void => {
  const message = error instanceof Error ? error.message : String(error);
  console.warn(`[contextMenus] ${message}`);
};

export const createContextMenuItem = (properties: ContextMenuItemProperties): string | number => {
  const chromeApi = getChromeApi();

  if (!isFirefox() && chromeApi?.contextMenus?.create) {
    try {
      chromeApi.contextMenus.create(properties, () => {
        const message = chromeApi.runtime.lastError?.message;
        if (message) console.warn(`[contextMenus] ${message}`);
      });
    } catch (error) {
      reportError(error);
    }
    return properties.id;
  }

  try {
    return browser.contextMenus.create(properties);
  } catch (error) {
    reportError(error);
    return properties.id;
  }
};
