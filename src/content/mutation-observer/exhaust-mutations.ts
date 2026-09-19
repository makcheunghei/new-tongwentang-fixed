import { convertNode } from '../convert';
import { getTarget } from '../services';
import type { CtState } from '../state';
import { parseMutation } from './parse-mutation';

export type ExhaustMutations = (s: CtState, m: MutationRecord[]) => void;
export const exhaustMutations: ExhaustMutations = (state, mutations) => {
  getTarget(state.zhType)
    .then(async target => {
      if (target != null) {
        await convertNode(state, target, mutations.flatMap(parseMutation));
      }
    })
    .catch(console.error);
};
