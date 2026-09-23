export const CONTEST_WINDOW_MS = 10_000;
export const CONTEST_SKIP_MS = 30_000;

export interface ContestRecord {
  reversions: number[];
  skipUntil: number;
}

export const noteReversion = (record: ContestRecord | undefined, now: number): ContestRecord => {
  const reversions = (record?.reversions ?? []).filter(time => now - time <= CONTEST_WINDOW_MS);
  reversions.push(now);
  const triggered = reversions.length >= 2;
  const skipUntil = triggered ? now + CONTEST_SKIP_MS : record != null && record.skipUntil > now ? record.skipUntil : 0;

  return { reversions, skipUntil };
};

export const isNodeSkipped = (record: ContestRecord | undefined, now: number): boolean =>
  record != null && now < record.skipUntil;
