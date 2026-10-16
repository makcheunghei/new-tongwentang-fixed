import { useEffect, useRef, type FC, type ReactNode } from 'react';
import { i18n } from '../../../service/i18n/i18n';
export const Page: FC<{ title: string; children: ReactNode }> = ({ title, children }) => {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [title]);
  return (
    <section className="settings-page" aria-labelledby="page-title">
      <div className="page-heading">
        <p className="eyebrow">{i18n.getMessage('UI_READING_TOOL')}</p>
        <h1 id="page-title" ref={heading} tabIndex={-1}>
          {title}
        </h1>
      </div>
      {children}
    </section>
  );
};
