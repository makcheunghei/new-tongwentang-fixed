import { getTarget } from '../services';
import type { CtState } from '../state';
import { convertNode } from './convert-nodes';

export const SETTLE_RESCAN_DELAYS = [1_000, 3_000] as const;

export const rescanDocument = (state: CtState): void => {
  getTarget(state.zhType)
    .then(target => (target != null ? convertNode(state, target, [document]) : undefined))
    .catch(console.error);
};

const rescanWhenVisible = (state: CtState): void => {
  if (!document.hidden) {
    rescanDocument(state);
    return;
  }

  state.pendingFullRescan = true;
  const onVisible = () => {
    if (document.hidden) return;
    document.removeEventListener('visibilitychange', onVisible);
    if (!state.pendingFullRescan) return;
    state.pendingFullRescan = false;
    rescanDocument(state);
  };
  document.addEventListener('visibilitychange', onVisible);
};

export const scheduleSettleRescans = (state: CtState): void => {
  for (const delay of SETTLE_RESCAN_DELAYS) window.setTimeout(() => rescanWhenVisible(state), delay);
};
