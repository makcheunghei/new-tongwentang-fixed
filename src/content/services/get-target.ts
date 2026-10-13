import type { MaybeTransTarget } from '../../preference/types/types';
import { dispatchBgAction } from '../../service/runtime/background';
import { ZhType } from '../../service/tabs/tabs.constant';
import type { CtState } from '../state';
import { getDetectLanguage } from './get-detect-lang';

type GetTarget = (zhType: ZhType) => Promise<MaybeTransTarget>;
export const getTarget: GetTarget = async zhType => {
  return dispatchBgAction({ type: 'GetTarget', payload: { zhType } });
};

export const getAutomaticTarget = async (state: CtState): Promise<MaybeTransTarget> => {
  // Keep the source language separate from the displayed (converted) language.
  if (state.detectedZhType === ZhType.und) state.detectedZhType = await getDetectLanguage();
  return getTarget(state.detectedZhType);
};
