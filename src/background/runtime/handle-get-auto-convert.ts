import { LangType } from 'tongwen-core/dictionaries';
import type { MaybeTransTarget } from '../../preference/types/types';
import { ZhType } from '../../service/tabs/tabs.constant';
import { bgGetPref } from '../state/storage';

type GetTargetByDetectLanguage = (zhType: ZhType, target: LangType) => MaybeTransTarget;
export const getTargetByDetectLanguage: GetTargetByDetectLanguage = (zhType, target) => {
  switch (zhType) {
    case ZhType.hans:
      return target === LangType.t2s ? undefined : LangType.s2t;
    case ZhType.hant:
      return target === LangType.s2t ? undefined : LangType.t2s;
    case ZhType.und:
      return target;
  }
};

type GetTargetByAutoConvert = (zhType: ZhType) => Promise<MaybeTransTarget>;
export const getTargetByAutoConvert: GetTargetByAutoConvert = async zhType => {
  return bgGetPref().then(async pref => {
    switch (pref.general.autoConvert) {
      case LangType.s2t:
      case LangType.t2s:
        return Promise.resolve(pref.general.autoConvert);
      case 'ds2t':
        return getTargetByDetectLanguage(zhType, LangType.s2t);
      case 'dt2s':
        return getTargetByDetectLanguage(zhType, LangType.t2s);
      case 'disabled':
        return Promise.resolve(undefined);
    }
  });
};
