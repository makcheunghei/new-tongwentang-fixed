import { describe, expect, it } from 'vitest';
import { MAX_QUEUED_MUTATIONS, enqueueMutations, finishConversion, type MutationQueue } from './queue-policy';

const empty = (): MutationQueue<string> => ({ items: [], pendingFullRescan: false, missedDuringUpdate: false });

describe('enqueueMutations', () => {
  it('keeps mutations that arrive during conversion and flushes them afterwards', () => {
    const during = enqueueMutations(empty(), ['late'], { hidden: false, updating: true });

    expect(during.action).toBe('none');
    expect(during.queue.items).toEqual(['late']);
    expect(during.queue.missedDuringUpdate).toBe(true);
    expect(finishConversion(during.queue)).toEqual({
      queue: { items: ['late'], pendingFullRescan: false, missedDuringUpdate: false },
      action: 'flush',
    });
  });

  it('clears an oversized queue and requests one full rescan', () => {
    const incoming = Array.from({ length: MAX_QUEUED_MUTATIONS + 1 }, (_, index) => String(index));
    const result = enqueueMutations(empty(), incoming, { hidden: false, updating: false });

    expect(result.action).toBe('rescan');
    expect(result.queue.items).toEqual([]);
    expect(result.queue.pendingFullRescan).toBe(true);
  });

  it('does not scan while the document is hidden', () => {
    const result = enqueueMutations(empty(), ['change'], { hidden: true, updating: false });

    expect(result.action).toBe('none');
    expect(result.queue.items).toEqual([]);
    expect(result.queue.pendingFullRescan).toBe(true);
  });
});
