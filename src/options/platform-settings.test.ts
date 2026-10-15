import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { getDefaultPref } from '../preference/default';
import { resolveCapabilities } from '../service/browser/capability-policy';
import { Navbar } from './components/layout/Navbar';
import { PageType } from './hooks/page';
import { GeneralSettings } from './pages/general/GeneralSettings';

vi.mock('../service/i18n/i18n', () => ({ i18n: { getMessage: (key: string) => key } }));
vi.mock('./hooks/general/use-general-opt', () => ({
  useGeneralOpt: () => ({ general: getDefaultPref().general }),
}));

const capabilities = (safari: boolean, os = 'mac') =>
  resolveCapabilities({
    safari,
    os,
    userAgent: 'Desktop Safari',
    platform: 'MacIntel',
    maxTouchPoints: 0,
    contextMenus: true,
    toolbarClick: true,
    commands: true,
    badge: true,
  });
const renderNavbar = (safari: boolean, os?: string) =>
  renderToStaticMarkup(
    createElement(Navbar, {
      page: { type: PageType.general },
      setPage: vi.fn(),
      capabilities: capabilities(safari, os),
    }),
  );
const renderGeneral = (safari: boolean, os?: string) =>
  renderToStaticMarkup(
    createElement(GeneralSettings, {
      capabilities: capabilities(safari, os),
    }),
  );

describe('platform-specific settings', () => {
  it('hides the menu page on iPhone and iPad while keeping rules and dictionaries', () => {
    const html = renderNavbar(true, 'ios');
    expect(html).not.toContain('MSG_MENU');
    expect(html).toContain('MSG_DOMAIN_RULE');
    expect(html).toContain('MSG_WORD');
  });
  it('keeps the menu page on desktop browsers and macOS Safari', () => {
    expect(renderNavbar(false)).toContain('MSG_MENU');
    expect(renderNavbar(true)).toContain('MSG_MENU');
  });
  it('hides the ignored toolbar-click preference on every Safari platform', () => {
    for (const os of ['ios', 'mac']) {
      const html = renderGeneral(true, os);
      expect(html).not.toContain('id="BrowserAction"');
      expect(html).toContain('id="AutoConvert"');
      expect(html).toContain('id="DefaultLanguage"');
      expect(html).toContain('MSG_DYNAMIC_CONVERT');
    }
  });
  it('keeps the toolbar-click preference on desktop Chromium and Firefox', () => {
    expect(renderGeneral(false)).toContain('id="BrowserAction"');
  });
});
