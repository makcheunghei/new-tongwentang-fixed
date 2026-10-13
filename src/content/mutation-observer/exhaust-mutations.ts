import { convertNode } from '../convert';
import { getAutomaticTarget } from '../services';
import type { CtState } from '../state';
import { parseMutation } from './parse-mutation';

export type ExhaustMutations = (s: CtState, m: MutationRecord[]) => void;
export const exhaustMutations: ExhaustMutations = (state, mutations) => {
  getAutomaticTarget(state)
    .then(async target => {
      if (target != null) {
        await convertNode(state, target, mutations.flatMap(parseMutation));
      }
    })
    .catch(console.error);
};
