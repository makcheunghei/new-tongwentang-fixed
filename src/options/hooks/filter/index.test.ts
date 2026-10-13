import { describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LangType } from 'tongwen-core/dictionaries';
vi.mock('../../../service/storage/storage', () => ({ getStorage: vi.fn(), listenStorage: vi.fn() }));
vi.mock('../../../service/storage/preference-update', () => ({ updatePreference: vi.fn() }));
import { reducer } from '.';
import { Button } from '../../components/button';
const rules = [{ id: 'one', pattern: 'example.com', target: LangType.s2t, regexp: null }];
describe('filter sorting boundaries', () => {
  it.each(['UP', 'DOWN'] as const)('does not corrupt a single rule when moving %s', type => {
    expect(reducer(rules, { type, payload: 0 })).toBe(rules);
    expect(reducer(rules, { type, payload: -1 })).toBe(rules);
    expect(reducer(rules, { type, payload: 1 })).toBe(rules);
  });
  it('renders a genuinely disabled, non-submit button', () => {
    const html = renderToStaticMarkup(createElement(Button, { disabled: true }, 'Up'));
    expect(html).toContain('disabled=""');
    expect(html).toContain('type="button"');
  });
});
