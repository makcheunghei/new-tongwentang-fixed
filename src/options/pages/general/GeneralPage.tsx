import type { FC } from 'react';
import type { BrowserCapabilities } from '../../../service/browser/capabilities';
import { i18n } from '../../../service/i18n/i18n';
import { Divider, Page } from '../../components';
import { GeneralSettings } from './GeneralSettings';
import { Preferences } from './Preferences';

export const GeneralPage: FC<{ capabilities: BrowserCapabilities }> = ({ capabilities }) => {
  return (
    <Page title={i18n.getMessage('MSG_GENERAL')}>
      <GeneralSettings capabilities={capabilities} />

      <Divider content={i18n.getMessage('MSG_MAINTAIN_PREF')} />

      <Preferences />
    </Page>
  );
};
