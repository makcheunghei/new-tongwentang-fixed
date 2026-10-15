import { browser } from '.';
import { IS_SAFARI } from '../types';
import { resolveCapabilities } from './capability-policy';
export type { BrowserCapabilities } from './capability-policy';

export async function getBrowserCapabilities() {
  let os: string | undefined;
  if (IS_SAFARI) {
    try {
      // WebKit returns "ios" even when an iPad requests a desktop website.
      os = (await browser.runtime?.getPlatformInfo?.())?.os;
    } catch {
      // Older Safari versions can fall back to the iPad touch / navigator information.
    }
  }
  return resolveCapabilities({
    safari: IS_SAFARI,
    os,
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    maxTouchPoints: navigator.maxTouchPoints ?? 0,
    contextMenus:
      typeof browser.contextMenus?.create === 'function' &&
      typeof browser.contextMenus?.removeAll === 'function' &&
      typeof browser.contextMenus?.onClicked?.addListener === 'function',
    toolbarClick: typeof browser.action?.onClicked?.addListener === 'function',
    commands: typeof browser.commands?.onCommand?.addListener === 'function',
    badge:
      typeof browser.action?.setBadgeText === 'function' &&
      typeof browser.action?.setBadgeBackgroundColor === 'function',
  });
}
