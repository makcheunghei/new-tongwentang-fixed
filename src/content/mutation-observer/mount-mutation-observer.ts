import { dispatchBgAction } from '../../service/runtime/background';
import { convertNode } from '../convert';
import { getTarget } from '../services';
import type { CtState } from '../state';
import { observeRoot } from '../state';
import { exhaustMutations } from './exhaust-mutations';
import { findOpenShadowRoots } from './shadow-roots';

const DEBOUNCE_MS = 500;
const MAX_WAIT_MS = 2_000;
const MAX_MUTATIONS_PER_FLUSH = 2_500;

const clearScheduledFlush = (state: CtState) => {
  if (state.timeoutId != null) {
    clearTimeout(state.timeoutId);
    state.timeoutId = undefined;
  }
};

const fullRescan = (state: CtState) => {
  getTarget(state.zhType)
    .then(target => (target != null ? convertNode(state, target, [document]) : undefined))
    .catch(console.error);
};

const flushMutations = (state: CtState) => {
  clearScheduledFlush(state);

  if (document.hidden) {
    state.pendingFullRescan = true;
    state.mutations = [];
    state.firstMutationAt = undefined;
    return;
  }

  const mutations = state.mutations.splice(0, MAX_MUTATIONS_PER_FLUSH);
  if (state.mutations.length === 0) state.firstMutationAt = undefined;
  if (mutations.length > 0) exhaustMutations(state, mutations);
  if (state.mutations.length > 0) scheduleFlush(state);
};

const scheduleFlush = (state: CtState) => {
  const now = Date.now();
  state.firstMutationAt ??= now;
  const remainingMaxWait = Math.max(0, MAX_WAIT_MS - (now - state.firstMutationAt));
  const delay = Math.min(DEBOUNCE_MS, remainingMaxWait);

  clearScheduledFlush(state);
  state.timeoutId = window.setTimeout(() => flushMutations(state), delay);
};

const queueMutations = (state: CtState, mutations: MutationRecord[]) => {
  if (state.isUpdating) return;

  if (document.hidden) {
    state.pendingFullRescan = true;
    state.mutations = [];
    state.firstMutationAt = undefined;
    clearScheduledFlush(state);
    return;
  }

  for (const mutation of mutations) state.mutations.push(mutation);
  scheduleFlush(state);
};

const observerFn = (state: CtState) => (mutations: MutationRecord[]) => {
  queueMutations(state, mutations);
};

const observeKnownRoots = (state: CtState) => {
  const observer = state.mutationObserver;
  if (!observer) return;

  for (const root of state.observedRoots) {
    if (root === document || root.isConnected) {
      observer.observe(root, state.mutationOpt);
    } else {
      state.observedRoots.delete(root);
    }
  }
};

const mountVisibilityListener = (state: CtState) => {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      state.pendingFullRescan = true;
      state.mutations = [];
      state.firstMutationAt = undefined;
      clearScheduledFlush(state);
      state.mutationObserver?.disconnect();
      return;
    }

    observeKnownRoots(state);
    if (state.pendingFullRescan) {
      state.pendingFullRescan = false;
      fullRescan(state);
    }
  });
};

export const mountMutationObserver = async (state: CtState): Promise<void> => {
  const isSpa = await dispatchBgAction({ type: 'SpaMode', payload: undefined });
  if (!isSpa) return;

  state.mutationObserver = new MutationObserver(observerFn(state));
  observeRoot(state, document);
  findOpenShadowRoots(document).forEach(root => observeRoot(state, root));
  mountVisibilityListener(state);
};
