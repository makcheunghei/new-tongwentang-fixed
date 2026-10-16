import { lazy, Suspense, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { browser } from '../service/browser';
import { getBrowserCapabilities, type BrowserCapabilities } from '../service/browser/capabilities';
import { i18n } from '../service/i18n/i18n';
import { Header, Navbar } from './components';
import { PageType, usePage } from './hooks/page';

const GeneralPage = lazy(() => import('./pages/general/GeneralPage').then(module => ({ default: module.GeneralPage })));
const MenuPage = lazy(() => import('./pages/menu/MenuPage').then(module => ({ default: module.MenuPage })));
const FilterPage = lazy(() => import('./pages/filter/FilterPage').then(module => ({ default: module.FilterPage })));
const WordPage = lazy(() => import('./pages/word/WordPage').then(module => ({ default: module.WordPage })));
const AboutPage = lazy(() => import('./pages/about/AboutPage').then(module => ({ default: module.AboutPage })));

function App({ capabilities }: { capabilities: BrowserCapabilities }) {
  const [page, setPage] = usePage();
  const pageContent = useMemo(() => {
    switch (page.type) {
      case PageType.general:
        return <GeneralPage capabilities={capabilities} />;
      case PageType.menu:
        return capabilities.contextMenus ? <MenuPage /> : <GeneralPage capabilities={capabilities} />;
      case PageType.filter:
        return <FilterPage />;
      case PageType.word:
        return <WordPage />;
      case PageType.about:
        return <AboutPage />;
    }
  }, [page.type, capabilities]);

  return (
    <main className="options-main">
      <Header />
      <Navbar page={page} setPage={setPage} capabilities={capabilities} />
      <div className="settings-content">
        <Suspense fallback={<p role="status">{i18n.getMessage('UI_LOADING')}</p>}>{pageContent}</Suspense>
      </div>
    </main>
  );
}

document.documentElement.lang = browser.i18n.getUILanguage?.() ?? document.documentElement.lang;
document.title = i18n.getMessage('MSG_EXT_NAME');

void getBrowserCapabilities().then(capabilities => {
  createRoot(document.querySelector('#app')!).render(<App capabilities={capabilities} />);
});
