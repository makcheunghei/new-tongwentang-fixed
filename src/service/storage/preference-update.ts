import type { PrefFilter, PrefGeneral, PrefMenu } from '../../preference/types/v2';
import type { Pref } from '../../preference/types/lastest';
import { dispatchBgAction } from '../runtime/background';

export type PreferenceUpdate =
  | { section: 'general'; patch: Partial<PrefGeneral> }
  | { section: 'menu'; enabled: boolean }
  | { section: 'menuItem'; group: keyof PrefMenu['group']; target: 's2t' | 't2s'; enabled: boolean }
  | { section: 'filter'; base: PrefFilter; value: PrefFilter }
  | { section: 'replace'; value: Partial<Pref> }
  | { section: 'reset'; value?: Pref };

export const updatePreference = async (update: PreferenceUpdate): Promise<boolean> =>
  dispatchBgAction({ type: 'UpdatePreference', payload: update });
