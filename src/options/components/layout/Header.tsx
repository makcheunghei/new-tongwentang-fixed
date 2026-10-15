import React from 'react';
import { i18n } from '../../../service/i18n/i18n';
import { closeOptionsPage } from '../../close-options';

export const Header: React.FC = () => {
  return (
    <header className="options-header">
      <h1>{i18n.getMessage('MSG_EXT_NAME')}</h1>
      <button
        type="button"
        className="btn options-close"
        onClick={() => {
          void closeOptionsPage();
        }}
      >
        {i18n.getMessage('MSG_CLOSE_OPTIONS')} <i className="icon icon-cross" aria-hidden="true" />
      </button>
    </header>
  );
};
