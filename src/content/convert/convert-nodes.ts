import { LangType } from 'tongwen-core/dictionaries';
import { walkNode, type ParsedResult } from 'tongwen-core/walker';
import { dispatchBgAction } from '../../service/runtime/background';
import { ZhType } from '../../service/tabs/tabs.constant';
import { findOpenShadowRoots } from '../mutation-observer/shadow-roots';
import type { CtState } from '../state';
import { observeRoot } from '../state';
import { updateLangAttr } from './update-lang-attr';
import { updateNodes } from './update-nodes';

type SConvertNode = (state: CtState, target: LangType, nodes: Node[]) => Promise<void>;

const uniqueParsedNodes = (nodes: ParsedResult[]): ParsedResult[] => {
  const seen = new WeakMap<Node, Set<string>>();

  return nodes.filter(node => {
    const keys = seen.get(node.node) ?? new Set<string>();
    const key = node.type === 'TEXT' ? 'TEXT' : node.attr;
    if (keys.has(key)) return false;
    keys.add(key);
    seen.set(node.node, keys);
    return true;
  });
};

const collectConversionRoots = (state: CtState, nodes: Node[]): Node[] => {
  const roots = new Set<Node>(nodes);

  for (const node of nodes) {
    for (const shadowRoot of findOpenShadowRoots(node)) {
      observeRoot(state, shadowRoot);
      roots.add(shadowRoot);
    }
  }

  return [...roots];
};

export const convertNode: SConvertNode = async (state, target, nodes) => {
  return (state.converting = state.converting
    .catch(() => undefined)
    .then(async () => {
      const parsedNodes = uniqueParsedNodes(collectConversionRoots(state, nodes).flatMap(node => walkNode(node)));

      if (parsedNodes.length === 0) return;

      const texts = await dispatchBgAction({
        type: 'NodesText',
        payload: { target, texts: parsedNodes.map(node => node.text) },
      });

      state.isUpdating = true;
      try {
        updateNodes(parsedNodes, texts);
        state.updateLangAttr &&
          document.querySelectorAll<HTMLElement>('[lang|="zh"]').forEach(element => {
            updateLangAttr(element, target);
          });

        switch (target) {
          case LangType.s2t:
            state.zhType = ZhType.hant;
            break;
          case LangType.t2s:
            state.zhType = ZhType.hans;
            break;
          default:
            state.zhType = ZhType.und;
        }
      } finally {
        state.isUpdating = false;
      }
    }));
};
