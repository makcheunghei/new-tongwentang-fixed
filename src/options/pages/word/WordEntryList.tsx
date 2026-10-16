import type { FC } from 'react';
import type { DicObj } from 'tongwen-core/dictionaries';
import { i18n } from '../../../service/i18n/i18n';
import { Button } from '../../components';
export const WordEntryList: FC<{
  words: DicObj;
  onEdit: (entry: [string, string]) => void;
  onRemove: (key: string) => void;
}> = ({ words, onEdit, onRemove }) => (
  <ul className="record-list">
    {Object.keys(words).length === 0 && <li className="empty-state">{i18n.getMessage('UI_NO_WORDS')}</li>}
    {Object.entries(words).map(entry => (
      <li className="record-row" key={entry[0]}>
        <div className="record-copy">
          <strong>
            {entry[0]} <span aria-hidden="true">→</span> {entry[1]}
          </strong>
        </div>
        <div className="record-actions">
          <Button onClick={() => onEdit(entry)}>{i18n.getMessage('MSG_EDIT')}</Button>
          <Button type="error" onClick={() => onRemove(entry[0])}>
            {i18n.getMessage('MSG_DELETE')}
          </Button>
        </div>
      </li>
    ))}
  </ul>
);
