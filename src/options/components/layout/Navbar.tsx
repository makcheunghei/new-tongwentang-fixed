import type { Dispatch, FC } from 'react';
import { i18n } from '../../../service/i18n/i18n';
import type { BrowserCapabilities } from '../../../service/browser/capabilities';
import type { PageAction, PageState } from '../../hooks/page';
import { PageType } from '../../hooks/page';
const items = [
  [PageType.general, 'MSG_GENERAL', 'M4 6h16M4 12h16M4 18h16M9 3v6M15 9v6M8 15v6'],
  [PageType.menu, 'MSG_MENU', 'M5 4h14v16H5zM8 8h8M8 12h8M8 16h5'],
  [PageType.filter, 'MSG_DOMAIN_RULE', 'M3 5h18l-7 8v6l-4 2v-8z'],
  [PageType.word, 'MSG_WORD', 'M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1m0-15c3-2 6-2 9-1v15c-3-1-6-1-9 1V5z'],
  [PageType.about, 'MSG_ABOUT', 'M12 11v6M12 7v.1M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0'],
] as const;
export const Navbar: FC<{ page: PageState; setPage: Dispatch<PageAction>; capabilities: BrowserCapabilities }> = ({
  page,
  setPage,
  capabilities,
}) => (
  <nav className="settings-nav" aria-label={i18n.getMessage('UI_NAVIGATION')}>
    <ul>
      {items
        .filter(([type]) => type !== PageType.menu || capabilities.contextMenus)
        .map(([type, label, path]) => (
          <li key={type}>
            <button
              type="button"
              aria-current={page.type === type ? 'page' : undefined}
              onClick={() => setPage({ type })}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d={path} />
              </svg>
              <span>{i18n.getMessage(label)}</span>
            </button>
          </li>
        ))}
    </ul>
  </nav>
);
