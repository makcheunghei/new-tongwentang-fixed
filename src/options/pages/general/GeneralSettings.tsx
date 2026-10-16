import type { FC } from 'react';
import type { BrowserCapabilities } from '../../../service/browser/capabilities';
import { i18n } from '../../../service/i18n/i18n';
import { Checkbox, Select } from '../../components';
import { autoConvertOptions, browserActionOptions, defaultTargetOptions } from '../../hooks/general/options';
import { useGeneralOpt } from '../../hooks/general/use-general-opt';

export const GeneralSettings: FC<{ capabilities: BrowserCapabilities }> = ({ capabilities }) => {
  const {
    general,
    setAutoConvert,
    setBrowserAction,
    setDefaultTarget,
    setDetectFallback,
    setSpaMode,
    setUpdateLangAttr,
    setDebugMode,
  } = useGeneralOpt();

  return (
    <>
      <p className="help">{i18n.getMessage('UI_GENERAL_HELP')}</p>
      <h2 className="group-heading">{i18n.getMessage('UI_AUTOMATION')}</h2>
      <form>
        <Select
          id="AutoConvert"
          label={i18n.getMessage('MSG_AUTO_CONVERT')}
          value={general.autoConvert}
          onChange={setAutoConvert}
        >
          {autoConvertOptions()}
        </Select>
        <Checkbox
          isSwitch={true}
          label={i18n.getMessage('MSG_DETECT_FALLBACK')}
          checked={general.detectFallback === 'convert'}
          onChange={setDetectFallback}
        />
      </form>
      <h2 className="group-heading">{i18n.getMessage('UI_PAGE_BEHAVIOR')}</h2>
      <form>
        {capabilities.toolbarClick && (
          <Select
            id="BrowserAction"
            label={i18n.getMessage('MSG_BROWSER_ACTION')}
            value={general.browserAction}
            onChange={setBrowserAction}
          >
            {browserActionOptions()}
          </Select>
        )}
        <Select
          id="DefaultLanguage"
          label={i18n.getMessage('MSG_DEFAULT_CONVERT')}
          value={general.defaultTarget}
          onChange={setDefaultTarget}
        >
          {defaultTargetOptions()}
        </Select>
        <Checkbox
          isSwitch={true}
          label={i18n.getMessage('MSG_DYNAMIC_CONVERT')}
          checked={general.spaMode}
          onChange={setSpaMode}
        />
        <Checkbox
          isSwitch={true}
          label={i18n.getMessage('MSG_UPDATE_LANG')}
          checked={general.updateLangAttr}
          onChange={setUpdateLangAttr}
        />
      </form>
      <details>
        <summary>{i18n.getMessage('UI_ADVANCED')}</summary>
        <form>
          <Checkbox
            isSwitch={true}
            label={i18n.getMessage('MSG_DEBUG_MODE')}
            checked={general.debugMode}
            onChange={setDebugMode}
          />
        </form>
      </details>
    </>
  );
};
