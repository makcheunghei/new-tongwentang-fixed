import type { ChangeEventHandler } from 'react';
import { useEffect, useState } from 'react';
import type { LangType } from 'tongwen-core/dictionaries';
import { getDefaultPref } from '../../../preference/default';
import type { Pref } from '../../../preference/types/lastest';
import type { AutoConvertOpt, BrowserActionOpt, PrefGeneral } from '../../../preference/types/v2';
import { getStorage, listenStorage, setStorage } from '../../../service/storage/storage';

export const useGeneralOpt = () => {
  const [generalState, setGeneralState] = useState<PrefGeneral>(() => getDefaultPref().general);

  const setGeneral = async <T extends keyof PrefGeneral>(key: T, value: PrefGeneral[T]) =>
    setStorage({ general: { ...generalState, [key]: value } });
  const setAutoConvert: ChangeEventHandler<HTMLSelectElement> = e =>
    void setGeneral('autoConvert', e.currentTarget.value as AutoConvertOpt);
  const setBrowserAction: ChangeEventHandler<HTMLSelectElement> = e =>
    void setGeneral('browserAction', e.currentTarget.value as BrowserActionOpt);
  const setDefaultTarget: ChangeEventHandler<HTMLSelectElement> = e =>
    void setGeneral('defaultTarget', e.currentTarget.value as LangType);
  const setDetectFallback: ChangeEventHandler<HTMLInputElement> = e =>
    void setGeneral('detectFallback', e.currentTarget.checked ? 'convert' : 'skip');
  const setSpaMode: ChangeEventHandler<HTMLInputElement> = e => void setGeneral('spaMode', e.currentTarget.checked);
  const setUpdateLangAttr: ChangeEventHandler<HTMLInputElement> = e =>
    void setGeneral('updateLangAttr', e.currentTarget.checked);
  const setDebugMode: ChangeEventHandler<HTMLInputElement> = e => void setGeneral('debugMode', e.currentTarget.checked);

  useEffect(
    () =>
      listenStorage(
        changes => changes.general?.newValue && setGeneralState(changes.general.newValue as Pref['general']),
        {
          keys: ['general'],
          areaName: ['local'],
        },
      ),
    [],
  );

  useEffect(() => {
    getStorage('general').then(({ general }) => {
      setGeneralState(general);
    });
  }, []);

  return {
    general: generalState,
    setGeneral,
    setAutoConvert,
    setBrowserAction,
    setDefaultTarget,
    setDetectFallback,
    setSpaMode,
    setUpdateLangAttr,
    setDebugMode,
  };
};
