import { i18n } from '../../../service/i18n/i18n';
import { closeOptionsPage } from '../../close-options';
export const Header = () => (
  <header className="options-header">
    <div className="wordmark">
      <span className="settings-app-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
          <path d="M3 5h11M8.5 3v2M5 8c1 4 4 6 8 7M12 5c-1 5-4 8-8 10M13 21l4-11 4 11M14.5 17h5" />
        </svg>
      </span>
      <div>
        <strong>{i18n.getMessage('MSG_EXT_NAME')}</strong>
      </div>
    </div>
    <button
      type="button"
      className="btn options-close"
      onClick={() => {
        void closeOptionsPage();
      }}
    >
      {i18n.getMessage('MSG_CLOSE_OPTIONS')} <span aria-hidden="true">×</span>
    </button>
  </header>
);
