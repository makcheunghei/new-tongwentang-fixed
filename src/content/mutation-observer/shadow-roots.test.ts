import { describe, expect, it } from 'vitest';
import { findOpenShadowRoots } from './shadow-roots';

describe('findOpenShadowRoots', () => {
  it('finds nested open shadow roots without entering closed roots', () => {
    document.body.innerHTML = '<div id="host"></div><div id="closed-host"></div>';

    const host = document.querySelector<HTMLElement>('#host')!;
    const root = host.attachShadow({ mode: 'open' });
    const nestedHost = document.createElement('section');
    root.append(nestedHost);
    const nestedRoot = nestedHost.attachShadow({ mode: 'open' });

    document.querySelector<HTMLElement>('#closed-host')!.attachShadow({ mode: 'closed' });

    expect(findOpenShadowRoots(document)).toEqual([root, nestedRoot]);
  });
});
