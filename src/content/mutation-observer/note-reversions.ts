import type { CtState } from '../state';
import { noteReversion, type ContestRecord } from './contest';

export interface ConversionMemory {
  source: string;
  converted: string;
  contest?: ContestRecord;
}

export const rememberConversion = (
  state: CtState,
  node: Node,
  slot: string,
  source: string,
  converted: string,
): void => {
  const slots = state.conversionSlots.get(node) ?? new Map<string, ConversionMemory>();
  const existing = slots.get(slot);
  slots.set(slot, { source, converted, contest: existing?.contest });
  state.conversionSlots.set(node, slots);
};

export const isConversionMutation = (state: CtState, mutation: MutationRecord): boolean => {
  const slot = mutation.type === 'characterData' ? 'TEXT' : mutation.attributeName;
  if (mutation.type === 'childList' || !slot) return false;
  const memory = state.conversionSlots.get(mutation.target)?.get(slot);
  const value = slot === 'TEXT' ? mutation.target.nodeValue : (mutation.target as Element).getAttribute(slot);
  return memory != null && value === memory.converted;
};

export const noteMutationReversions = (state: CtState, mutations: MutationRecord[], now = Date.now()): void => {
  const seen = new WeakMap<Node, Set<string>>();
  for (const mutation of mutations) {
    const slot = mutation.type === 'characterData' ? 'TEXT' : mutation.attributeName;
    if (!slot || mutation.type === 'childList') continue;
    const slots = seen.get(mutation.target) ?? new Set<string>();
    if (slots.has(slot)) continue;
    slots.add(slot);
    seen.set(mutation.target, slots);
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
