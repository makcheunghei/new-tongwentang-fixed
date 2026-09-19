import { lazy, Suspense, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { browser } from '../service/browser';
import { i18n } from '../service/i18n/i18n';
import { Header, Navbar } from './components';
import { PageType, usePage } from './hooks/page';

const GeneralPage = lazy(() => import('./pages/general/GeneralPage').then(module => ({ default: module.GeneralPage })));
const MenuPage = lazy(() => import('./pages/menu/MenuPage').then(module => ({ default: module.MenuPage })));
const FilterPage = lazy(() => import('./pages/filter/FilterPage').then(module => ({ default: module.FilterPage })));
const WordPage = lazy(() => import('./pages/word/WordPage').then(module => ({ default: module.WordPage })));
const AboutPage = lazy(() => import('./pages/about/AboutPage').then(module => ({ default: module.AboutPage })));

function App() {
  const [page, setPage] = usePage();
  const pageContent = useMemo(() => {
    switch (page.type) {
      case PageType.general:
        return <GeneralPage />;
      case PageType.menu:
        return <MenuPage />;
      case PageType.filter:
        return <FilterPage />;
      case PageType.word:
        return <WordPage />;
      case PageType.about:
        return <AboutPage />;
    }
  }, [page.type]);

  return (
    <main style={{ padding: '5em 10%' }}>
      <Header />
      <Navbar page={page} setPage={setPage} />
      <Suspense fallback={<p className="text-center">Loading…</p>}>{pageContent}</Suspense>
    </main>
  );
}

document.documentElement.lang = browser.i18n.getUILanguage();
document.title = i18n.getMessage('MSG_EXT_NAME');

createRoot(document.querySelector('#app')!).render(<App />);
