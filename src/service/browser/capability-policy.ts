export interface BrowserCapabilities {
  contextMenus: boolean;
  toolbarClick: boolean;
  clipboard: boolean;
  commands: boolean;
  badge: boolean;
}

export interface CapabilityEnvironment {
  safari: boolean;
  os?: string;
  userAgent: string;
  platform: string;
  maxTouchPoints: number;
  contextMenus: boolean;
  toolbarClick: boolean;
  commands: boolean;
  badge: boolean;
}

export function resolveCapabilities(environment: CapabilityEnvironment): BrowserCapabilities {
  const mobileSafari =
    environment.safari &&
    (environment.os
      ? environment.os === 'ios'
      : /iPhone|iPad|iPod/.test(environment.userAgent) ||
        (environment.platform === 'MacIntel' && environment.maxTouchPoints > 1));

  return {
    contextMenus: !mobileSafari && environment.contextMenus,
    // Safari always opens our popup, so action.onClicked and its badge preference have no effect.
    toolbarClick: !environment.safari && environment.toolbarClick,
    badge: !environment.safari && environment.badge,
    // Safari's background service worker has neither a clipboard document nor Chromium's offscreen API.
    clipboard: !environment.safari,
    // iOS / iPadOS support webpage commands with an external keyboard.
    commands: environment.commands,
  };
}
