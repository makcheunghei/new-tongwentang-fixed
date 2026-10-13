import type { ParsedResult } from 'tongwen-core/walker';

const updateNode = (parsed: ParsedResult, text: string, beforeWrite?: (parsed: ParsedResult, text: string) => void) => {
  if (!parsed.node.isConnected || typeof text !== 'string') return;
  const current = parsed.type === 'TEXT' ? parsed.node.nodeValue : parsed.node.getAttribute(parsed.attr);
  // A background round trip must not overwrite a newer website/user edit.
  if (current !== parsed.text || current === text) return;
  beforeWrite?.(parsed, text);
  switch (parsed.type) {
    case 'TEXT':
      parsed.node.nodeValue !== text && (parsed.node.nodeValue = text);
      break;
    case 'ELEMENT':
      parsed.node.getAttribute(parsed.attr) !== text && parsed.node.setAttribute(parsed.attr, text);
  }
};

export const updateNodes = (
  parseds: ParsedResult[],
  texts: string[],
  beforeWrite?: (parsed: ParsedResult, text: string) => void,
): void => {
  parseds.forEach((parsed, index) => {
    updateNode(parsed, texts[index], beforeWrite);
  });
};
