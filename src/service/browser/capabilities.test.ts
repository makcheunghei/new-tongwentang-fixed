import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resolveCapabilities, type CapabilityEnvironment } from './capability-policy';

const { browser } = vi.hoisted(() => ({
  browser: {
    runtime: { getPlatformInfo: vi.fn() },
    contextMenus: { create: vi.fn(), removeAll: vi.fn(), onClicked: { addListener: vi.fn() } },
    commands: { onCommand: { addListener: vi.fn() } },
    action: { onClicked: { addListener: vi.fn() }, setBadgeText: vi.fn(), setBadgeBackgroundColor: vi.fn() },
  },
}));
vi.mock('.', () => ({ browser }));
vi.mock('../types', () => ({ IS_SAFARI: true }));
import { getBrowserCapabilities } from './capabilities';

const desktop: CapabilityEnvironment = {
  safari: false,
  userAgent: 'Desktop browser',
  platform: 'MacIntel',
  maxTouchPoints: 0,
  contextMenus: true,
  toolbarClick: true,
  commands: true,
  badge: true,
};

describe('browser capability policy', () => {
  it('keeps desktop Chromium and Firefox features', () => {
    expect(resolveCapabilities(desktop)).toEqual({
      contextMenus: true,
      toolbarClick: true,
      clipboard: true,
      commands: true,
      badge: true,
    });
  });
  it('keeps macOS Safari menus and webpage commands while using the popup', () => {
    expect(resolveCapabilities({ ...desktop, safari: true, os: 'mac' })).toEqual({
      contextMenus: true,
      toolbarClick: false,
      clipboard: false,
      commands: true,
      badge: false,
    });
  });
  it('disables unavailable desktop controls on iOS even if API stubs exist', () => {
    expect(resolveCapabilities({ ...desktop, safari: true, os: 'ios' })).toEqual({
      contextMenus: false,
      toolbarClick: false,
      clipboard: false,
      commands: true,
      badge: false,
    });
  });
  it('falls back to iPad touch detection when its user agent looks like a Mac', () => {
    expect(resolveCapabilities({ ...desktop, safari: true, maxTouchPoints: 5 }).contextMenus).toBe(false);
  });
  it('falls back to the iPhone user agent without an OS API', () => {
    expect(resolveCapabilities({ ...desktop, safari: true, userAgent: 'iPhone' }).contextMenus).toBe(false);
  });
  it('does not hide a real Mac menu just because its user agent was changed', () => {
    expect(resolveCapabilities({ ...desktop, safari: true, os: 'mac', userAgent: 'iPad' }).contextMenus).toBe(true);
  });
  it('does not offer APIs missing from the current browser', () => {
    expect(resolveCapabilities({ ...desktop, contextMenus: false, commands: false }).contextMenus).toBe(false);
    expect(resolveCapabilities({ ...desktop, commands: false }).commands).toBe(false);
  });
});

describe('Safari platform detection', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', { userAgent: 'Macintosh Safari', platform: 'MacIntel', maxTouchPoints: 0 });
    browser.runtime.getPlatformInfo.mockReset();
  });
  afterEach(() => vi.unstubAllGlobals());
  it('uses WebKit platform info for an iPad with a desktop user agent', async () => {
    browser.runtime.getPlatformInfo.mockResolvedValue({ os: 'ios' });
    expect((await getBrowserCapabilities()).contextMenus).toBe(false);
    expect(browser.runtime.getPlatformInfo).toHaveBeenCalledOnce();
  });
  it('uses navigator information when the runtime API rejects', async () => {
    browser.runtime.getPlatformInfo.mockRejectedValue(new Error('unsupported'));
    vi.stubGlobal('navigator', { userAgent: 'Macintosh Safari', platform: 'MacIntel', maxTouchPoints: 5 });
    expect((await getBrowserCapabilities()).contextMenus).toBe(false);
  });
  it('preserves menus on macOS Safari', async () => {
    browser.runtime.getPlatformInfo.mockResolvedValue({ os: 'mac' });
    expect((await getBrowserCapabilities()).contextMenus).toBe(true);
  });
});
