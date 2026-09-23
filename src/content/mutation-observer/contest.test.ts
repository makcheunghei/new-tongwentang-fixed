import { describe, expect, it } from 'vitest';
import { CONTEST_SKIP_MS, CONTEST_WINDOW_MS, isNodeSkipped, noteReversion } from './contest';

describe('contested nodes', () => {
  it('skips a node for 30 seconds after two reversions within 10 seconds', () => {
    const first = noteReversion(undefined, 0);
    const second = noteReversion(first, CONTEST_WINDOW_MS);

    expect(isNodeSkipped(first, 0)).toBe(false);
    expect(isNodeSkipped(second, CONTEST_WINDOW_MS)).toBe(true);
    expect(isNodeSkipped(second, CONTEST_WINDOW_MS + CONTEST_SKIP_MS - 1)).toBe(true);
    expect(isNodeSkipped(second, CONTEST_WINDOW_MS + CONTEST_SKIP_MS)).toBe(false);
  });

  it('does not skip a different node', () => {
    const skipped = noteReversion(noteReversion(undefined, 0), 1_000);

    expect(isNodeSkipped(skipped, 1_000)).toBe(true);
    expect(isNodeSkipped(undefined, 1_000)).toBe(false);
  });

  it('does not accumulate reversions outside the 10 second window', () => {
    const second = noteReversion(noteReversion(undefined, 0), CONTEST_WINDOW_MS + 1);

    expect(isNodeSkipped(second, CONTEST_WINDOW_MS + 1)).toBe(false);
  });
});
