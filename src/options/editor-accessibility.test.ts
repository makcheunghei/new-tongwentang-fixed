import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Modal } from './components/modal';
import { WordEntryEditor } from './pages/word/WordEntryEditor';

vi.mock('../service/i18n/i18n', () => ({ i18n: { getMessage: (key: string) => key } }));
vi.mock('./close-options', () => ({ closeOptionsPage: vi.fn() }));
let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  // jsdom has no top-layer implementation. Real focus/escape is also checked in the browser.
  if (!HTMLDialogElement.prototype.showModal)
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value() {}, writable: true });
  if (!HTMLDialogElement.prototype.close)
    Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value() {}, writable: true });
  vi.spyOn(HTMLDialogElement.prototype, 'showModal').mockImplementation(function (this: HTMLDialogElement) {
    this.open = true;
  });
  vi.spyOn(HTMLDialogElement.prototype, 'close').mockImplementation(function (this: HTMLDialogElement) {
    this.open = false;
  });
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.restoreAllMocks();
});
describe('accessible editors', () => {
  it('opens a labelled modal, routes native cancellation and closes when dismissed', async () => {
    const onCancel = vi.fn();
    const render = (isActive: boolean) =>
      createElement(
        Modal,
        { isActive, head: 'Edit rule', onCancel },
        createElement('input', { 'aria-label': 'Pattern' }),
      );
    await act(async () => root.render(render(true)));
    const dialog = container.querySelector('dialog')!;
    expect(dialog.open).toBe(true);
    expect(document.getElementById(dialog.getAttribute('aria-labelledby')!)?.textContent).toBe('Edit rule');
    const event = new Event('cancel', { bubbles: true, cancelable: true });
    await act(async () => {
      dialog.dispatchEvent(event);
    });
    expect(onCancel).toHaveBeenCalledOnce();
    expect(event.defaultPrevented).toBe(true);
    await act(async () => root.render(render(false)));
    expect(dialog.open).toBe(false);
    expect(dialog.querySelector('input')).toBeNull();
  });
  it('blocks an empty source while retaining an empty replacement for deliberate removal', async () => {
    const onSubmit = vi.fn();
    await act(async () => root.render(createElement(WordEntryEditor, { entry: ['', ''], onSubmit })));
    expect(container.querySelector('button')?.disabled).toBe(true);
    await act(async () => root.render(createElement(WordEntryEditor, { key: 'valid', entry: ['廣告', ''], onSubmit })));
    const button = container.querySelector('button')!;
    expect(button.disabled).toBe(false);
    await act(async () => button.click());
    expect(onSubmit).toHaveBeenCalledWith(['廣告', '']);
    expect(container.querySelector('label')?.htmlFor).toBe(container.querySelector('input')?.id);
  });
});
