import { convertNode } from './convert';
import { scheduleSettleRescans } from './convert/rescan-document';
import { mountMutationObserver } from './mutation-observer';
import { mountRuntimeListener } from './runtime/mount-runtime-listener';
import { getTarget } from './services';
import type { CtState } from './state';
import { createCtState } from './state';

(async function main() {
  const state: CtState = await createCtState();

  mountRuntimeListener(state);
  await mountMutationObserver(state);

  const target = await getTarget(state.zhType).catch(console.error);
  if (target == null) return;

  convertNode(state, target, [document])
    .then(() => scheduleSettleRescans(state))
    .catch(console.error);
})();
