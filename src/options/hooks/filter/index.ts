import type { Reducer } from 'react';
import { useEffect, useReducer, useState } from 'react';
import { getDefaultPref } from '../../../preference/default';
import type { PrefFilterRule } from '../../../preference/types/v2';
import { getStorage } from '../../../service/storage/storage';

export type UseFilterRuleAction =
  | { type: 'DELETE'; payload: PrefFilterRule }
  | { type: 'ADD' | 'UPDATE'; payload: PrefFilterRule }
  | { type: 'UP' | 'DOWN'; payload: number }
  | { type: 'RESET'; payload: PrefFilterRule[] };

const reducer: Reducer<PrefFilterRule[], UseFilterRuleAction> = (rules, action) => {
  switch (action.type) {
    case 'ADD':
      return [action.payload, ...rules];
    case 'UPDATE':
      return Object.assign([...rules], { [rules.findIndex(r => r.id === action.payload.id)]: action.payload });
    case 'DELETE':
      return rules.filter(r => r.id !== action.payload.id);
    case 'UP':
      return Object.assign([...rules], {
        [action.payload - 1]: rules[action.payload],
        [action.payload]: rules[action.payload - 1],
      });
    case 'DOWN':
      return Object.assign([...rules], {
        [action.payload]: rules[action.payload + 1],
        [action.payload + 1]: rules[action.payload],
      });
    case 'RESET':
      return action.payload;
  }
};

const useFilterRules = (org: PrefFilterRule[]) => {
  const [rules, setRules] = useReducer(reducer, org);

  return { rules, setRules };
};

export const useFilter = () => {
  const defaults = getDefaultPref().filter;
  const [enabled, setEnabled] = useState(() => defaults.enabled);
  const [chtTagsText, setChtTagsText] = useState(() => defaults.chtTags.join(', '));
  const [chsTagsText, setChsTagsText] = useState(() => defaults.chsTags.join(', '));
  const { rules, setRules } = useFilterRules(defaults.rules);

  useEffect(() => {
    getStorage('filter').then(({ filter: { enabled, rules, chtTags, chsTags } }) => {
      setEnabled(enabled);
      setRules({ type: 'RESET', payload: rules });
      setChtTagsText(chtTags.join(', '));
      setChsTagsText(chsTags.join(', '));
    });
  }, [setRules]);

  return { enabled, setEnabled, rules, setRules, chtTagsText, setChtTagsText, chsTagsText, setChsTagsText };
};
