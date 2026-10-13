import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LangType } from 'tongwen-core/dictionaries';
import { getDefaultPref } from '../../preference/default';
import { getTargetByAutoConvert } from '../../background/runtime/handle-get-auto-convert';
import type { BgReqAction } from '../../service/runtime/background';
import { ZhType } from '../../service/tabs/tabs.constant';

const { dispatchBgAction, getStorage } = vi.hoisted(() => ({ dispatchBgAction: vi.fn(), getStorage: vi.fn() }));
vi.mock('../../service/runtime/background', () => ({ dispatchBgAction }));
vi.mock('../../service/storage/storage', () => ({ getStorage }));

import { createCtState, type CtState } from '../state';
import { getAutomaticTarget } from '../services/get-target';
import { mountMutationObserver } from '../mutation-observer';
import { convertNode } from './convert-nodes';

const convert = (text: string, target: LangType) =>
  target === LangType.s2t
    ? text.replaceAll('简', '簡').replaceAll('体', '體')
    : text.replaceAll('簡', '简').replaceAll('體', '体');
let pref = getDefaultPref();
let state: CtState;
beforeEach(async () => {
  vi.useFakeTimers();
  pref = getDefaultPref();
  document.documentElement.lang = 'zh-CN';
  document.body.innerHTML = '<p title="简体">简体</p>';
  Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  getStorage.mockResolvedValue(pref);
  dispatchBgAction.mockReset();
  dispatchBgAction.mockImplementation(async (action: BgReqAction) => {
    if (action.type === 'SpaMode') return true;
    if (action.type === 'GetTarget') return getTargetByAutoConvert(pref, action.payload.zhType);
    if (action.type === 'NodesText') return action.payload.texts.map(t => convert(t, action.payload.target));
    return undefined;
  });
  state = await createCtState();
});
afterEach(() => {
  state.mutationObserver?.disconnect();
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe('conversion lifecycle', () => {
  it.each(['ds2t', 'dt2s'] as const)('keeps converting late content in %s detection mode', async mode => {
    pref.general.autoConvert = mode;
    const source = mode === 'ds2t' ? '简体' : '簡體';
    const target = mode === 'ds2t' ? LangType.s2t : LangType.t2s;
    state.detectedZhType = mode === 'ds2t' ? ZhType.hans : ZhType.hant;
    document.body.textContent = source;
    await convertNode(state, (await getAutomaticTarget(state))!, [document]);
    const late = document.createElement('p');
    late.textContent = source;
    document.body.append(late);
    expect(await getAutomaticTarget(state)).toBe(target);
    await convertNode(state, (await getAutomaticTarget(state))!, [document]);
    expect(late.textContent).toBe(convert(source, target));
  });

  it('does not overwrite newer text or attributes while a reply is pending', async () => {
    let resolve!: (texts: string[]) => void;
    dispatchBgAction.mockImplementationOnce(
      () =>
        new Promise<string[]>(r => {
          resolve = r;
        }),
    );
    const pending = convertNode(state, LangType.s2t, [document]);
    await vi.waitFor(() => expect(dispatchBgAction).toHaveBeenCalled());
    const p = document.querySelector('p')!;
    p.firstChild!.nodeValue = 'new content';
    p.title = 'new title';
    const action = dispatchBgAction.mock.calls[0][0] as Extract<BgReqAction, { type: 'NodesText' }>;
    resolve(action.payload.texts.map(t => convert(t, LangType.s2t)));
    await pending;
    expect(p.textContent).toBe('new content');
    expect(p.title).toBe('new title');
    expect(state.conversionSlots.has(p)).toBe(false);
  });

  it('keeps website updates during the background round trip and ignores its own writes', async () => {
    pref.general.autoConvert = LangType.s2t;
    await mountMutationObserver(state);
    let resolve!: (texts: string[]) => void;
    const defaultHandler = dispatchBgAction.getMockImplementation()!;
    dispatchBgAction.mockClear();
    dispatchBgAction.mockImplementationOnce(
      () =>
        new Promise<string[]>(r => {
          resolve = r;
        }),
    );
    const pending = convertNode(state, LangType.s2t, [document]);
    await vi.waitFor(() => expect(dispatchBgAction).toHaveBeenCalled());
    expect(state.isUpdating).toBe(true);
    const late = document.createElement('p');
    late.textContent = '简体';
    document.body.append(late);
    await Promise.resolve();
    expect(state.missedDuringUpdate).toBe(true);
    const action = dispatchBgAction.mock.calls[0][0] as Extract<BgReqAction, { type: 'NodesText' }>;
    dispatchBgAction.mockImplementation(defaultHandler);
    resolve(action.payload.texts.map(t => convert(t, LangType.s2t)));
    await pending;
    await vi.advanceTimersByTimeAsync(600);
    await state.converting;
    expect(late.textContent).toBe('簡體');
    expect(state.mutations).toHaveLength(0);
    const calls = dispatchBgAction.mock.calls.filter(([a]) => a.type === 'NodesText').length;
    await vi.advanceTimersByTimeAsync(2500);
    expect(dispatchBgAction.mock.calls.filter(([a]) => a.type === 'NodesText')).toHaveLength(calls);
  });

  it('leaves detached nodes untouched', async () => {
    const text = document.createTextNode('简体');
    await convertNode(state, LangType.s2t, [text]);
    expect(text.nodeValue).toBe('简体');
  });
});
