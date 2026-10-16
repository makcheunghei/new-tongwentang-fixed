import type { FC } from 'react';
import { Fragment, useCallback, useState } from 'react';
import { LangType } from 'tongwen-core/dictionaries';
import type { PrefWordDefault } from '../../../preference/types/v2';
import { i18n } from '../../../service/i18n/i18n';
import { setStorage } from '../../../service/storage/storage';
import { Button, Divider, Modal } from '../../components';
import { useToggle } from '../../hooks/state/use-toggle';
import { useWord } from '../../hooks/word/use-word';
import { WordDefaultSettings } from './WordDefaultSettings';
import { WordEntryEditor } from './WordEntryEditor';
import { WordEntryList } from './WordEntryList';

export const WordSettings: FC = () => {
  const { word, setWord } = useWord();
  const setDefault = useCallback(
    (def: PrefWordDefault) => {
      setWord(word => ({ ...word, default: def }));
    },
    [setWord],
  );
  const [tab, setTab] = useState<LangType | null>(null);
  const [toEdit, setToEdit] = useState<[string, string]>(['', '']);
  const [isModal, { on, off }] = useToggle(false);

  const edit = useCallback(
    (entry?: [string, string]) => {
      setToEdit(entry || ['', '']);
      on();
    },
    [setToEdit, on],
  );

  const update = useCallback(
    ([key, value]: [string, string]) => {
      if (tab == null) return;

      setWord(pw => {
        const newPw = { ...pw, custom: { ...pw.custom } };
        const map = new Map(Object.entries(pw.custom[tab]));

        toEdit[0] !== '' && map.delete(toEdit[0]);
        map.set(key, value);
        newPw.custom[tab] = Object.fromEntries(map);
        return newPw;
      });

      off();
    },
    [tab, toEdit, setWord, off],
  );

  const remove = useCallback(
    (key: string) => {
      if (tab == null) return;

      setWord(pw => {
        const newPw = { ...pw, custom: { ...pw.custom } };
        const map = new Map(Object.entries(pw.custom[tab]));

        map.delete(key);
        newPw.custom[tab] = Object.fromEntries(map);
        return newPw;
      });
    },
    [tab, setWord],
  );

  const [status, setStatus] = useState('');
  const save = useCallback(async () => {
    try {
      await setStorage({ word });
      setStatus(i18n.getMessage('MSG_UPDATE_COMPLETED'));
    } catch {
      setStatus(i18n.getMessage('MSG_SAVE_FAILED'));
    }
  }, [word]);

  return (
    <Fragment>
      <p className="help">{i18n.getMessage('UI_WORD_HELP')}</p>
      <p className="status-line" role="status">
        {status}
      </p>
      <div className="panel">
        <div className="panel-nav">
          <div className="segmented" role="group" aria-label={i18n.getMessage('MSG_WORD')}>
            {(
              [
                [null, 'MSG_DEFAULT'],
                [LangType.s2t, 'MSG_CUSTOM_S2T'],
                [LangType.t2s, 'MSG_CUSTOM_T2S'],
              ] as const
            ).map(([value, label]) => (
              <button type="button" key={label} aria-pressed={tab === value} onClick={() => setTab(value)}>
                {i18n.getMessage(label)}
              </button>
            ))}
          </div>
        </div>

        <div className="panel-body">
          {tab === null ? (
            <WordDefaultSettings value={word.default} onChange={setDefault} onSave={save} />
          ) : (
            <Fragment>
              <div className="columns">
                <div className="column col-auto">
                  <Button
                    onClick={() => {
                      edit(['', '']);
                    }}
                  >
                    {i18n.getMessage('MSG_ADD')}
                  </Button>
                </div>
                <div className="column col-auto">
                  <Button type="primary" onClick={save}>
                    {i18n.getMessage('MSG_SAVE')}
                  </Button>
                </div>
              </div>
              <Divider />
              <WordEntryList words={word.custom[tab]} onEdit={edit} onRemove={remove} />
            </Fragment>
          )}
        </div>
      </div>
      <Modal head={i18n.getMessage(toEdit[0] ? 'MSG_EDIT' : 'MSG_ADD')} isActive={isModal} onCancel={off}>
        <WordEntryEditor key={`${toEdit[0]}:${toEdit[1]}`} entry={toEdit} onSubmit={update} />
      </Modal>
    </Fragment>
  );
};
