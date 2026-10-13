import { convertNode } from './convert';
import { scheduleSettleRescans } from './convert/rescan-document';
import { mountMutationObserver } from './mutation-observer';
import { mountRuntimeListener } from './runtime/mount-runtime-listener';
import { getAutomaticTarget } from './services';
import type { CtState } from './state';
import { createCtState } from './state';

(async function main() {
  const state: CtState = await createCtState();

  mountRuntimeListener(state);
  await mountMutationObserver(state).catch(console.error);

  const target = await getAutomaticTarget(state).catch(console.error);
  if (target == null) return;

  convertNode(state, target, [document])
    .then(() => scheduleSettleRescans(state))
    .catch(console.error);
})().catch(console.error);
