import { TARGET_NODE_ATTRIBUTES } from 'tongwen-core/walker';
import type { ConversionMemory } from './mutation-observer/note-reversions';
import { getStorage } from '../service/storage/storage';
import type { ZhType } from '../service/tabs/tabs.constant';
import { getDetectLanguage } from './services';

const mutationOpt: MutationObserverInit = {
  childList: true,
  attributes: true,
  characterData: true,
  subtree: true,
  attributeFilter: TARGET_NODE_ATTRIBUTES as string[],
};

export interface CtState {
  zhType: ZhType;
  updateLangAttr: boolean;
  debugMode: boolean;
  timeoutId: number | undefined;
  firstMutationAt: number | undefined;
  mutationOpt: MutationObserverInit;
  mutationObserver?: MutationObserver;
  observedRoots: Set<Node>;
  mutations: MutationRecord[];
  pendingFullRescan: boolean;
  missedDuringUpdate: boolean;
  isUpdating: boolean;
  converting: Promise<void>;
  conversionSlots: WeakMap<Node, Map<string, ConversionMemory>>;
  afterDomUpdate?: () => void;
}

const getUpdateLangAttr = async () => getStorage('general').then(({ general }) => general.updateLangAttr);
const getDebugMode = async () => getStorage('general').then(({ general }) => general.debugMode);

export const pruneObservedRoots = (state: CtState): void => {
  let changed = false;

  for (const root of state.observedRoots) {
    if (root !== document && !root.isConnected) {
      state.observedRoots.delete(root);
      changed = true;
    }
  }

  if (changed && state.mutationObserver) {
    state.mutationObserver.disconnect();
    state.observedRoots.forEach(root => state.mutationObserver?.observe(root, state.mutationOpt));
  }
};

export const observeRoot = (state: CtState, root: Node): void => {
  if (state.observedRoots.has(root)) return;
  if (state.observedRoots.size >= 128) pruneObservedRoots(state);
  state.observedRoots.add(root);
  state.mutationObserver?.observe(root, state.mutationOpt);
};

export async function createCtState(): Promise<CtState> {
  return Promise.all([getDetectLanguage(), getUpdateLangAttr(), getDebugMode()]).then(
    ([zhType, updateLangAttr, debugMode]) => ({
      zhType,
      updateLangAttr,
      debugMode,
      timeoutId: undefined,
      firstMutationAt: undefined,
      mutationOpt,
      observedRoots: new Set<Node>(),
      mutations: [],
      pendingFullRescan: false,
      missedDuringUpdate: false,
      isUpdating: false,
      converting: Promise.resolve(undefined),
      conversionSlots: new WeakMap(),
    }),
  );
}
