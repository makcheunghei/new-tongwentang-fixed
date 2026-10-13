import { parseLanguageTags } from '../../../preference/language-tags';
import { updatePreference } from '../../../service/storage/preference-update';
import type { Reducer } from 'react';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { getDefaultPref } from '../../../preference/default';
import type { PrefFilter, PrefFilterRule } from '../../../preference/types/v2';
import { getStorage, listenStorage } from '../../../service/storage/storage';

export type UseFilterRuleAction =
  | { type: 'DELETE'; payload: PrefFilterRule }
  | { type: 'ADD' | 'UPDATE'; payload: PrefFilterRule }
  | { type: 'UP' | 'DOWN'; payload: number }
  | { type: 'RESET'; payload: PrefFilterRule[] };

export const reducer: Reducer<PrefFilterRule[], UseFilterRuleAction> = (rules, action) => {
  switch (action.type) {
    case 'ADD':
      return [action.payload, ...rules];
    case 'UPDATE':
      return Object.assign([...rules], { [rules.findIndex(r => r.id === action.payload.id)]: action.payload });
    case 'DELETE':
      return rules.filter(r => r.id !== action.payload.id);
    case 'UP':
      if (!Number.isInteger(action.payload) || action.payload <= 0 || action.payload >= rules.length) return rules;
      return Object.assign([...rules], {
        [action.payload - 1]: rules[action.payload],
        [action.payload]: rules[action.payload - 1],
      });
    case 'DOWN':
      if (!Number.isInteger(action.payload) || action.payload < 0 || action.payload >= rules.length - 1) return rules;
      return Object.assign([...rules], {
        [action.payload]: rules[action.payload + 1],
        [action.payload + 1]: rules[action.payload],
      });
    case 'RESET':
      return action.payload;
  }
};

export const useFilter = () => {
  const [filter, setFilter] = useState(() => getDefaultPref().filter);
  const [base, setBase] = useState<PrefFilter | null>(null);
  const [chtTagsTextState, setChtTagsTextState] = useState(() => filter.chtTags.join(', '));
  const [chsTagsTextState, setChsTagsTextState] = useState(() => filter.chsTags.join(', '));
  const [rules, dispatchRules] = useReducer(reducer, filter.rules);
  const [externalChange, setExternalChange] = useState(false);
  const dirtyRef = useRef(false);
  const generationRef = useRef(0);
  const changed = useCallback(() => {
    dirtyRef.current = true;
    generationRef.current += 1;
  }, []);
  const setEnabled = useCallback(
    (enabled: boolean) => {
      changed();
      setFilter(f => ({ ...f, enabled }));
    },
    [changed],
  );
  const setRules = useCallback(
    (action: UseFilterRuleAction) => {
      changed();
      dispatchRules(action);
    },
    [changed],
  );
  const setChtTagsText = useCallback(
    (value: string) => {
      changed();
      setChtTagsTextState(value);
    },
    [changed],
  );
  const setChsTagsText = useCallback(
    (value: string) => {
      changed();
      setChsTagsTextState(value);
    },
    [changed],
  );
  const apply = useCallback((value: PrefFilter) => {
    setFilter(value);
    setBase(value);
    dispatchRules({ type: 'RESET', payload: value.rules });
    setChtTagsTextState(value.chtTags.join(', '));
    setChsTagsTextState(value.chsTags.join(', '));
    setExternalChange(false);
    dirtyRef.current = false;
  }, []);

  useEffect(() => {
    let active = true;
    let receivedChange = false;
    const stop = listenStorage(
      changes => {
        const value = changes.filter?.newValue as PrefFilter | undefined;
        if (!value) return;
        receivedChange = true;
        if (dirtyRef.current) setExternalChange(true);
        else apply(value);
      },
      { keys: ['filter'], areaName: ['local'] },
    );
    getStorage('filter')
      .then(({ filter }) => {
        if (active && !receivedChange) apply(filter);
      })
      .catch(console.error);
    return () => {
      active = false;
      stop();
    };
  }, [apply]);

  const saveFilter = async (): Promise<boolean> => {
    if (!base) return false;
    const value = {
      enabled: filter.enabled,
      rules,
      chtTags: parseLanguageTags(chtTagsTextState),
      chsTags: parseLanguageTags(chsTagsTextState),
    };
    const revision = generationRef.current;
    const saved = await updatePreference({ section: 'filter', base, value });
    if (saved) {
      if (generationRef.current === revision) apply(value);
      else setBase(value);
    } else setExternalChange(true);
    return saved;
  };

  return {
    enabled: filter.enabled,
    setEnabled,
    rules,
    setRules,
    chtTagsText: chtTagsTextState,
    setChtTagsText,
    chsTagsText: chsTagsTextState,
    setChsTagsText,
    ready: base !== null,
    externalChange,
    saveFilter,
  };
};
