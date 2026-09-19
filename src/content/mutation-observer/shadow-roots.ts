const pushShadowRoot = (roots: ShadowRoot[], seen: Set<ShadowRoot>, root: ShadowRoot) => {
  if (seen.has(root)) return;
  seen.add(root);
  roots.push(root);
};

/**
 * Finds open shadow roots in the supplied DOM subtree.
 *
 * `TreeWalker` does not enter shadow roots automatically, so each discovered
 * root is processed as a separate traversal boundary.
 */
export const findOpenShadowRoots = (node: Node): ShadowRoot[] => {
  const roots: ShadowRoot[] = [];
  const seen = new Set<ShadowRoot>();
  const queue: Array<Document | ShadowRoot | Element> = [];

  if (node instanceof Document || node instanceof ShadowRoot) {
    queue.push(node);
  } else if (node instanceof Element) {
    if (node.shadowRoot) pushShadowRoot(roots, seen, node.shadowRoot);
    queue.push(node);
  }

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current instanceof Element && current.shadowRoot) {
      pushShadowRoot(roots, seen, current.shadowRoot);
      queue.push(current.shadowRoot);
    }

    const walker = document.createTreeWalker(current, NodeFilter.SHOW_ELEMENT);
    let element = walker.nextNode();
    while (element) {
      if (element instanceof Element && element.shadowRoot) {
        pushShadowRoot(roots, seen, element.shadowRoot);
        queue.push(element.shadowRoot);
      }
      element = walker.nextNode();
    }
  }

  return roots;
};
