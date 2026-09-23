import type { CtState } from '../state';
import { noteReversion, type ContestRecord } from './contest';

export interface ConversionMemory {
  source: string;
  contest?: ContestRecord;
}

export const rememberConversion = (state: CtState, node: Node, slot: string, source: string): void => {
  const slots = state.conversionSlots.get(node) ?? new Map<string, ConversionMemory>();
  const existing = slots.get(slot);
  slots.set(slot, { source, contest: existing?.contest });
  state.conversionSlots.set(node, slots);
};

export const noteMutationReversions = (state: CtState, mutations: MutationRecord[], now = Date.now()): void => {
  for (const mutation of mutations) {
    if (mutation.type === 'characterData' && mutation.target.nodeType === Node.TEXT_NODE) {
      const memory = state.conversionSlots.get(mutation.target)?.get('TEXT');
      if (memory && mutation.target.nodeValue === memory.source) memory.contest = noteReversion(memory.contest, now);
      continue;
    }

    if (mutation.type === 'attributes' && mutation.target instanceof Element && mutation.attributeName) {
      const memory = state.conversionSlots.get(mutation.target)?.get(mutation.attributeName);
      if (memory && mutation.target.getAttribute(mutation.attributeName) === memory.source) {
        memory.contest = noteReversion(memory.contest, now);
      }
    }
  }
};
