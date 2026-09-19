import type { FC } from 'react';
import { useCallback, useState } from 'react';
import { i18n } from '../../../service/i18n/i18n';
import { Button } from '../../components';
import type { EventCallback } from '../types';

export const WordEntryEditor: FC<{
  entry: [string, string];
  onSubmit: EventCallback<[[string, string]]>;
}> = ({ entry, onSubmit }) => {
  const [key, setKey] = useState(() => entry[0]);
  const [value, setValue] = useState(() => entry[1]);

  const submit = useCallback(() => {
    onSubmit([key, value]);
    setKey('');
    setValue('');
  }, [onSubmit, key, value]);

  return (
    <div className="columns">
      <div className="column col-4">
        <div className="form-group">
          <label className="form-label">{i18n.getMessage('MSG_CONVERT_TARGET')}</label>
          <input
            className="form-input"
            type="text"
            value={key}
            onChange={event => {
              setKey(event.currentTarget.value);
            }}
          />
        </div>
      </div>
      <div className="column col-4">
        <div className="form-group">
          <label className="form-label">{i18n.getMessage('MSG_CONVERT_VALUE')}</label>
          <input
            className="form-input"
            type="text"
            value={value}
            onChange={event => {
              setValue(event.currentTarget.value);
            }}
          />
        </div>
      </div>
      <div className="column col-4">
        <div className="form-group">
          <label className="form-label">
            <span className="d-invisible">button</span>
          </label>
          <Button onClick={submit}>{i18n.getMessage('MSG_OK')}</Button>
        </div>
      </div>
    </div>
  );
};
