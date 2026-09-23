import { dispatchBgAction } from '../../service/runtime/background';
import { rescanDocument } from '../convert/rescan-document';
import type { CtState } from '../state';
import { observeRoot } from '../state';
import { exhaustMutations } from './exhaust-mutations';
import { noteMutationReversions } from './note-reversions';
import { enqueueMutations, finishConversion, type MutationQueue, type QueueAction } from './queue-policy';
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

const queueSnapshot = (state: CtState): MutationQueue<MutationRecord> => ({
  items: state.mutations,
  pendingFullRescan: state.pendingFullRescan,
  missedDuringUpdate: state.missedDuringUpdate,
});

const applyQueue = (state: CtState, queue: MutationQueue<MutationRecord>) => {
  state.mutations = queue.items;
  state.pendingFullRescan = queue.pendingFullRescan;
  state.missedDuringUpdate = queue.missedDuringUpdate;
};

const runQueueAction = (state: CtState, action: QueueAction) => {
  if (action === 'none') return;

  if (document.hidden) {
    state.pendingFullRescan = true;
    state.mutations = [];
    state.firstMutationAt = undefined;
    clearScheduledFlush(state);
    return;
  }

  if (action === 'rescan') {
    state.pendingFullRescan = false;
    state.mutations = [];
    state.firstMutationAt = undefined;
    clearScheduledFlush(state);
    rescanDocument(state);
    return;
  }

  scheduleFlush(state);
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
  noteMutationReversions(state, mutations);
  const result = enqueueMutations(queueSnapshot(state), mutations, {
    hidden: document.hidden,
    updating: state.isUpdating,
  });
  applyQueue(state, result.queue);
  runQueueAction(state, result.action);
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
      rescanDocument(state);
    }
  });
};

export const mountMutationObserver = async (state: CtState): Promise<void> => {
  const isSpa = await dispatchBgAction({ type: 'SpaMode', payload: undefined });
  if (!isSpa) return;

  state.afterDomUpdate = () => {
    const result = finishConversion(queueSnapshot(state));
    applyQueue(state, result.queue);
    runQueueAction(state, result.action);
  };
  state.mutationObserver = new MutationObserver(observerFn(state));
  observeRoot(state, document);
  findOpenShadowRoots(document).forEach(root => observeRoot(state, root));
  mountVisibilityListener(state);
};
