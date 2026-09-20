import type { ChangeEventHandler, FC } from 'react';
import { Fragment, useCallback, useState } from 'react';
import { createFilterRule } from '../../../preference/filter-rule';
import { parseLanguageTags } from '../../../preference/language-tags';
import type { PrefFilterRule } from '../../../preference/types/v2';
import { i18n } from '../../../service/i18n/i18n';
import { createNoti } from '../../../service/notification/create-noti';
import { setStorage } from '../../../service/storage/storage';
import { Button, Checkbox, Divider, Modal } from '../../components';
import { useFilter } from '../../hooks/filter';
import { useToggle } from '../../hooks/state/use-toggle';
import { FilterRuleEditor } from './FilterRuleEditor';
import { FilterRules } from './FilterRules';

export const FilterSettings: FC = () => {
  const { enabled, setEnabled, rules, setRules, chtTagsText, setChtTagsText, chsTagsText, setChsTagsText } =
    useFilter();

  const handleEnabledChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    e => {
      setEnabled(e.currentTarget.checked);
    },
    [setEnabled],
  );

  const handleChtTagsChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    e => {
      setChtTagsText(e.currentTarget.value);
    },
    [setChtTagsText],
  );

  const handleChsTagsChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    e => {
      setChsTagsText(e.currentTarget.value);
    },
    [setChsTagsText],
  );

  const [isModal, { on, off }] = useToggle(false);

  const [toEdit, setToEdit] = useState<{ isAdd: boolean; rule: PrefFilterRule }>(() => ({
    isAdd: true,
    rule: createFilterRule(),
  }));

  const handleAdd = useCallback(() => {
    setToEdit({ isAdd: true, rule: createFilterRule() });
    on();
  }, [setToEdit, on]);

  const handleUpdate = useCallback(
    (rule: PrefFilterRule) => {
      setToEdit({ isAdd: false, rule });
      on();
    },
    [setToEdit, on],
  );

  const handleSubmit = useCallback(
    (rule: PrefFilterRule) => {
      !toEdit.isAdd ? setRules({ type: 'UPDATE', payload: rule }) : setRules({ type: 'ADD', payload: rule });
      off();
    },
    [toEdit, setRules, off],
  );

  const save = useCallback(
    async () =>
      setStorage({
        filter: {
          enabled,
          rules,
          chtTags: parseLanguageTags(chtTagsText),
          chsTags: parseLanguageTags(chsTagsText),
        },
      }).then(async () => createNoti(i18n.getMessage('MSG_UPDATE_COMPLETED'))),
    [enabled, rules, chtTagsText, chsTagsText],
  );

  return (
    <Fragment>
      <div className="panel">
        <div className="panel-nav" style={{ padding: '1em' }}>
          <div className="columns">
            <div className="column col-auto">
              <Checkbox
                isSwitch={true}
                label={i18n.getMessage('MSG_ENABLE_DOMAIN_RULE')}
                checked={enabled}
                onChange={handleEnabledChange}
              />
            </div>
            <div className="column col-auto">
              <Button type="primary" onClick={handleAdd}>
                {i18n.getMessage('MSG_ADD')}
              </Button>
            </div>
            <div className="column col-auto">
              <Button type="primary" onClick={save}>
                {i18n.getMessage('MSG_SAVE')}
              </Button>
            </div>
          </div>
        </div>

        <div className="panel-body" style={{ maxHeight: '60vh' }}>
          <div className="columns" style={{ padding: '0 1em' }}>
            <div className="column">
              <div className="form-group">
                <label className="form-label">{i18n.getMessage('MSG_LANG_RULE')}</label>
                <label className="form-label" htmlFor="cht-tags">
                  {i18n.getMessage('MSG_LANG_CHT')}
                </label>
                <input
                  id="cht-tags"
                  className="form-input"
                  type="text"
                  value={chtTagsText}
                  onChange={handleChtTagsChange}
                />
              </div>
            </div>
            <div className="column">
              <div className="form-group">
                <label className="form-label">&nbsp;</label>
                <label className="form-label" htmlFor="chs-tags">
                  {i18n.getMessage('MSG_LANG_CHS')}
                </label>
                <input
                  id="chs-tags"
                  className="form-input"
                  type="text"
                  value={chsTagsText}
                  onChange={handleChsTagsChange}
                />
              </div>
            </div>
          </div>

          <Divider />

          <FilterRules rules={rules} setRules={setRules} onUpdate={handleUpdate} />
        </div>
      </div>

      <Modal isActive={isModal} onOk={on} onCancel={off}>
        <FilterRuleEditor
          key={`${toEdit.isAdd}:${toEdit.rule.id}`}
          value={toEdit.rule}
          onSubmit={handleSubmit}
          onCancel={off}
        />
      </Modal>
    </Fragment>
  );
};
