import { i18n } from '../../../service/i18n/i18n';
import { closeOptionsPage } from '../../close-options';
export const Header = () => (
  <header className="options-header">
    <div className="wordmark">
      <span className="brand-glyph" aria-hidden="true">
        同
      </span>
      <div>
        <strong>{i18n.getMessage('MSG_EXT_NAME')}</strong>
        <small>{i18n.getMessage('UI_READING_TOOL')}</small>
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
