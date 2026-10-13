import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LangType } from 'tongwen-core/dictionaries';
const { sendMessage } = vi.hoisted(() => ({ sendMessage: vi.fn(async () => undefined) }));
vi.mock('../browser', () => ({ browser: { tabs: { sendMessage } } }));
import { dispatchCtAction } from './content';
beforeEach(() => sendMessage.mockClear());
describe('content message frame routing', () => {
  it('queries language in the main document only', async () => {
    const action = { type: 'ZhType' as const, payload: undefined };
    await dispatchCtAction(action, 8);
    expect(sendMessage).toHaveBeenCalledWith(8, action, { frameId: 0 });
  });
  it('keeps whole-page conversion broadcast to frames', async () => {
    const action = { type: 'Webpage' as const, payload: LangType.s2t };
    await dispatchCtAction(action, 8);
    expect(sendMessage).toHaveBeenCalledWith(8, action, undefined);
  });
  it('targets a context-menu input frame', async () => {
    const action = { type: 'Textarea' as const, payload: LangType.s2t };
    await dispatchCtAction(action, 8, 3);
    expect(sendMessage).toHaveBeenCalledWith(8, action, { frameId: 3 });
  });
});
