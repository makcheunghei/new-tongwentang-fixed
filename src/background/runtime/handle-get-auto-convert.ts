import { LangType } from 'tongwen-core/dictionaries';
import type { Pref } from '../../preference/types/lastest';
import type { DetectFallback } from '../../preference/types/v2';
import type { MaybeTransTarget } from '../../preference/types/types';
import { ZhType } from '../../service/tabs/tabs.constant';

type GetTargetByDetectLanguage = (zhType: ZhType, target: LangType, detectFallback: DetectFallback) => MaybeTransTarget;
export const getTargetByDetectLanguage: GetTargetByDetectLanguage = (zhType, target, detectFallback) => {
  switch (zhType) {
    case ZhType.hans:
      return target === LangType.t2s ? undefined : LangType.s2t;
    case ZhType.hant:
      return target === LangType.s2t ? undefined : LangType.t2s;
    case ZhType.und:
      return detectFallback === 'convert' ? target : undefined;
  }
};

type GetTargetByAutoConvert = (pref: Pref, zhType: ZhType) => MaybeTransTarget;
export const getTargetByAutoConvert: GetTargetByAutoConvert = (pref, zhType) => {
  const detectFallback = pref.general.detectFallback ?? 'skip';

  switch (pref.general.autoConvert) {
    case LangType.s2t:
    case LangType.t2s:
      return pref.general.autoConvert;
    case 'ds2t':
      return getTargetByDetectLanguage(zhType, LangType.s2t, detectFallback);
    case 'dt2s':
      return getTargetByDetectLanguage(zhType, LangType.t2s, detectFallback);
    case 'disabled':
      return undefined;
  }
};
