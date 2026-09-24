import { describe, expect, it } from 'vitest';
import { isBackgroundMessage, isContentMessage } from './message-target';

describe('extension message targets', () => {
  it('claims only content actions for the content script', () => {
    expect(isContentMessage({ type: 'Webpage', payload: 's2t' })).toBe(true);
    expect(isContentMessage({ type: 'Textarea', payload: 't2s' })).toBe(true);
    expect(isContentMessage({ type: 'ZhType', payload: undefined })).toBe(true);
    expect(isContentMessage({ type: 'GetTarget', payload: { zhType: 'und' } })).toBe(false);
    expect(isContentMessage({ type: 'NodesText', payload: { target: 's2t', texts: [] } })).toBe(false);
    expect(isContentMessage({ type: 'Log', payload: [] })).toBe(false);
    expect(isContentMessage(undefined)).toBe(false);
    expect(isContentMessage({ type: 1 })).toBe(false);
  });

  it('claims only background actions for the service worker', () => {
    expect(isBackgroundMessage({ type: 'GetTarget', payload: { zhType: 'und' } })).toBe(true);
    expect(isBackgroundMessage({ type: 'SpaMode', payload: undefined })).toBe(true);
    expect(isBackgroundMessage({ type: 'Webpage', payload: 's2t' })).toBe(false);
    expect(isBackgroundMessage(null)).toBe(false);
  });
});
