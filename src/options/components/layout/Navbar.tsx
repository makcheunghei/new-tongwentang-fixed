import type { Dispatch, FC } from 'react';
import { useCallback } from 'react';
import { i18n } from '../../../service/i18n/i18n';
import type { PageAction, PageState } from '../../hooks/page';
import { PageType } from '../../hooks/page';

export const Navbar: FC<{ page: PageState; setPage: Dispatch<PageAction> }> = ({ page, setPage }) => {
  const toGeneral = useCallback(() => setPage({ type: PageType.general }), [setPage]);
  const toMenu = useCallback(() => setPage({ type: PageType.menu }), [setPage]);
  const toFilter = useCallback(() => setPage({ type: PageType.filter }), [setPage]);
  const toWord = useCallback(() => setPage({ type: PageType.word }), [setPage]);
  const toAbout = useCallback(() => setPage({ type: PageType.about }), [setPage]);

  const isActive = useCallback((type: PageType) => (type === page.type ? 'active' : ''), [page.type]);

  return (
    <nav>
      <ul className="tab tab-block">
        <li className="tab-item">
          <a className={'c-hand ' + isActive(PageType.general)} onClick={toGeneral}>
            {i18n.getMessage('MSG_GENERAL')}
          </a>
        </li>
        <li className="tab-item">
          <a className={'c-hand ' + isActive(PageType.menu)} onClick={toMenu}>
            {i18n.getMessage('MSG_MENU')}
          </a>
        </li>
        <li className="tab-item">
          <a className={'c-hand ' + isActive(PageType.filter)} onClick={toFilter}>
            {i18n.getMessage('MSG_DOMAIN_RULE')}
          </a>
        </li>
        <li className="tab-item">
          <a className={'c-hand ' + isActive(PageType.word)} onClick={toWord}>
            {i18n.getMessage('MSG_WORD')}
          </a>
        </li>
        <li className="tab-item">
          <a className={'c-hand ' + isActive(PageType.about)} onClick={toAbout}>
            {i18n.getMessage('MSG_ABOUT')}
          </a>
        </li>
      </ul>
    </nav>
  );
};
