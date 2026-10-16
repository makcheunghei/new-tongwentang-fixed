import type { FC } from 'react';
import type { BrowserCapabilities } from '../../../service/browser/capabilities';
import { i18n } from '../../../service/i18n/i18n';
import { Page } from '../../components';
import { GeneralSettings } from './GeneralSettings';
export const GeneralPage: FC<{ capabilities: BrowserCapabilities }> = ({ capabilities }) => (
  <Page title={i18n.getMessage('MSG_GENERAL')}>
    <GeneralSettings capabilities={capabilities} />
  </Page>
);
