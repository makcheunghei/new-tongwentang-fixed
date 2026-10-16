import type { FC, ReactNode } from 'react';
import { useEffect, useId, useRef } from 'react';
import { i18n } from '../../../service/i18n/i18n';
export const Modal: FC<{
  isActive: boolean;
  head?: string;
  footer?: ReactNode;
  children: ReactNode;
  onOk?: () => void;
  onCancel: () => void;
}> = ({ head, footer, isActive, onCancel, children }) => {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (isActive && !dialog.open) dialog.showModal();
    if (!isActive && dialog.open) dialog.close();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [isActive]);
  return (
    <dialog
      ref={ref}
      className="editor-dialog"
      aria-labelledby={titleId}
      onCancel={event => {
        event.preventDefault();
        onCancel();
      }}
    >
      <header className="dialog-header">
        <h2 id={titleId}>{head || i18n.getMessage('MSG_EDIT')}</h2>
        <button type="button" className="btn" aria-label={i18n.getMessage('MSG_CANCEL')} onClick={onCancel}>
          ×
        </button>
      </header>
      <div className="dialog-body">{isActive && children}</div>
      {footer && <footer>{footer}</footer>}
    </dialog>
  );
};
