import type { LangType } from 'tongwen-core/dictionaries';
import { dispatchBgAction } from '../../service/runtime/background';

type TextControl = HTMLInputElement | HTMLTextAreaElement;

const NON_TEXT_INPUT_TYPES = new Set([
  'button',
  'checkbox',
  'color',
  'date',
  'datetime-local',
  'file',
  'hidden',
  'image',
  'month',
  'number',
  'radio',
  'range',
  'reset',
  'submit',
  'time',
  'week',
]);

const getDeepActiveElement = (): Element | null => {
  let element = document.activeElement;

  while (element?.shadowRoot?.activeElement) {
    element = element.shadowRoot.activeElement;
  }

  return element;
};

const isTextControl = (element: Element | null): element is TextControl =>
  element instanceof HTMLTextAreaElement ||
  (element instanceof HTMLInputElement && !NON_TEXT_INPUT_TYPES.has(element.type));

const setNativeValue = (element: TextControl, value: string) => {
  const prototype = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
  setter ? setter.call(element, value) : (element.value = value);
};

const dispatchInput = (element: Element, value: string) => {
  const event =
    typeof InputEvent === 'function'
      ? new InputEvent('input', {
          bubbles: true,
          composed: true,
          data: value,
          inputType: 'insertReplacementText',
        })
      : new Event('input', { bubbles: true, composed: true });
  element.dispatchEvent(event);
};

const convertTextControl = async (element: TextControl, target: LangType): Promise<void> => {
  if (element.disabled || element.readOnly || element.value.length === 0) return;

  const source = element.value;
  const converted = await dispatchBgAction({ type: 'Convert', payload: { target, text: source } });
  if (!element.isConnected || element.value !== source || converted === source) return;

  const selectionStart = element.selectionStart;
  const selectionEnd = element.selectionEnd;
  const selectionDirection = element.selectionDirection;

  setNativeValue(element, converted);

  if (selectionStart != null && selectionEnd != null) {
    try {
      element.setSelectionRange(
        Math.min(selectionStart, converted.length),
        Math.min(selectionEnd, converted.length),
        selectionDirection ?? undefined,
      );
    } catch {
      // Some input types do not expose a text selection range.
    }
  }

  dispatchInput(element, converted);
};

const convertContentEditable = async (element: HTMLElement, target: LangType): Promise<void> => {
  const selection = window.getSelection();
  const range =
    selection && selection.rangeCount > 0 && element.contains(selection.getRangeAt(0).commonAncestorContainer)
      ? selection.getRangeAt(0)
      : null;
  const selectedText = range?.toString() ?? '';

  if (selectedText.length > 0) {
    const originalHtml = element.innerHTML;
    const converted = await dispatchBgAction({ type: 'Convert', payload: { target, text: selectedText } });
    if (
      !element.isConnected ||
      element.innerHTML !== originalHtml ||
      range?.toString() !== selectedText ||
      converted === selectedText
    )
      return;

    const textNode = document.createTextNode(converted);
    range!.deleteContents();
    range!.insertNode(textNode);
    range!.setStartAfter(textNode);
    range!.collapse(true);
    selection!.removeAllRanges();
    selection!.addRange(range!);
    dispatchInput(element, converted);
    return;
  }

  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode: node => (node.nodeValue?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
  });
  const textNodes: Text[] = [];
  let current = walker.nextNode();

  while (current) {
    textNodes.push(current as Text);
    current = walker.nextNode();
  }

  if (textNodes.length === 0) return;

  const sources = textNodes.map(node => node.nodeValue ?? '');
  const texts = await dispatchBgAction({
    type: 'NodesText',
    payload: { target, texts: sources },
  });

  textNodes.forEach((node, index) => {
    if (node.isConnected && node.nodeValue === sources[index] && node.nodeValue !== texts[index])
      node.nodeValue = texts[index];
  });

  dispatchInput(element, texts.join(''));
};

export const handleTextarea = async (target: LangType): Promise<void> => {
  const element = getDeepActiveElement();

  if (isTextControl(element)) {
    return convertTextControl(element, target);
  }

  if (element instanceof HTMLElement && element.isContentEditable) {
    return convertContentEditable(element, target);
  }
};
