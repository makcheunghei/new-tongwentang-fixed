import { useEffect, useRef, type FC, type ReactNode } from 'react';
export const Page: FC<{ title: string; children: ReactNode }> = ({ title, children }) => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [title]);
  return (
    <section className="settings-page" aria-labelledby="page-title">
      <div className="page-heading">
        <h1 id="page-title" ref={headingRef} tabIndex={-1}>
          {title}
        </h1>
      </div>
      {children}
    </section>
  );
};
