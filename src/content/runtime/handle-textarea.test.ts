import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LangType } from 'tongwen-core/dictionaries';

const { dispatchBgAction } = vi.hoisted(() => ({
  dispatchBgAction: vi.fn(async () => '繁體'),
}));

vi.mock('../../service/runtime/background', () => ({ dispatchBgAction }));

import { handleTextarea } from './handle-textarea';

describe('handleTextarea', () => {
  beforeEach(() => {
    document.body.innerHTML = '<textarea></textarea>';
    dispatchBgAction.mockClear();
  });

  it('does not overwrite typing while conversion is pending', async () => {
    const textarea = document.querySelector('textarea')!;
    textarea.value = '简体';
    textarea.focus();
    let finish!: (value: string) => void;
    dispatchBgAction.mockImplementationOnce(
      () =>
        new Promise<string>(resolve => {
          finish = resolve;
        }),
    );
    const pending = handleTextarea(LangType.s2t);
    textarea.value = 'new typing';
    finish('繁體');
    await pending;
    expect(textarea.value).toBe('new typing');
  });

  it('converts the active text control, preserves the caret, and emits input', async () => {
    const textarea = document.querySelector('textarea')!;
    textarea.value = '简体';
    textarea.focus();
    textarea.setSelectionRange(1, 1);
    const input = vi.fn();
    textarea.addEventListener('input', input);

    await handleTextarea(LangType.s2t);

    expect(textarea.value).toBe('繁體');
    expect(textarea.selectionStart).toBe(1);
    expect(textarea.selectionEnd).toBe(1);
    expect(input).toHaveBeenCalledOnce();
  });

  it('does nothing for a read-only text control', async () => {
    const textarea = document.querySelector('textarea')!;
    textarea.value = '简体';
    textarea.readOnly = true;
    textarea.focus();

    await handleTextarea(LangType.s2t);

    expect(dispatchBgAction).not.toHaveBeenCalled();
    expect(textarea.value).toBe('简体');
  });
});
