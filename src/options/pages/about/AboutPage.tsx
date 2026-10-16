import { i18n } from '../../../service/i18n/i18n';
import { Page } from '../../components';
import { Preferences } from '../general/Preferences';
const repo = 'https://github.com/makcheunghei/new-tongwentang-fixed';
export const AboutPage = () => (
  <Page title={i18n.getMessage('MSG_ABOUT')}>
    <div className="panel">
      <div className="wordmark">
        <span className="brand-glyph" aria-hidden="true">
          同
        </span>
        <strong>{i18n.getMessage('MSG_EXT_NAME')}</strong>
      </div>
      <p className="help">{i18n.getMessage('UI_ABOUT_HELP')}</p>
      <ul className="link-list">
        {[
          ['MSG_REPOSITORY', ''],
          ['MSG_ISSUE_REPORT', '/issues'],
          ['MSG_CHANGELOG', '/releases'],
          ['MSG_LICENSE', '/blob/master/LICENSE'],
        ].map(([label, path]) => (
          <li key={label}>
            <a href={repo + path} target="_blank" rel="noreferrer">
              {i18n.getMessage(label)}
              <span aria-hidden="true">↗</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
    <h2 className="group-heading">{i18n.getMessage('MSG_MAINTAIN_PREF')}</h2>
    <p className="help">{i18n.getMessage('UI_DATA_HELP')}</p>
    <div className="panel">
      <Preferences />
    </div>
  </Page>
);
