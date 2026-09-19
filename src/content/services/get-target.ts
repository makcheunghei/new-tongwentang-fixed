import type { MaybeTransTarget } from '../../preference/types/types';
import { dispatchBgAction } from '../../service/runtime/background';
import type { ZhType } from '../../service/tabs/tabs.constant';

type GetTarget = (zhType: ZhType) => Promise<MaybeTransTarget>;
export const getTarget: GetTarget = async zhType => {
  return dispatchBgAction({ type: 'GetTarget', payload: { zhType } });
};
