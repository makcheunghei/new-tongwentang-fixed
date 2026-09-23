export const MAX_QUEUED_MUTATIONS = 5000;

export interface MutationQueue<T> {
  items: T[];
  pendingFullRescan: boolean;
  missedDuringUpdate: boolean;
}

export type QueueAction = 'none' | 'flush' | 'rescan';

export interface QueueResult<T> {
  queue: MutationQueue<T>;
  action: QueueAction;
}

export const enqueueMutations = <T>(
  queue: MutationQueue<T>,
  incoming: readonly T[],
  options: { hidden: boolean; updating: boolean },
): QueueResult<T> => {
  if (options.hidden) {
    return {
      queue: { items: [], pendingFullRescan: true, missedDuringUpdate: false },
      action: 'none',
    };
  }

  const items = queue.items.concat(incoming);
  if (items.length > MAX_QUEUED_MUTATIONS) {
    return {
      queue: { items: [], pendingFullRescan: true, missedDuringUpdate: options.updating },
      action: options.updating ? 'none' : 'rescan',
    };
  }

  if (options.updating) {
    return {
      queue: { items, pendingFullRescan: queue.pendingFullRescan, missedDuringUpdate: true },
      action: 'none',
    };
  }

  return {
    queue: { items, pendingFullRescan: false, missedDuringUpdate: false },
    action: items.length > 0 ? 'flush' : 'none',
  };
};

export const finishConversion = <T>(queue: MutationQueue<T>): QueueResult<T> => {
  if (queue.pendingFullRescan) {
    return {
      queue: { items: [], pendingFullRescan: true, missedDuringUpdate: false },
      action: 'rescan',
    };
  }

  if (!queue.missedDuringUpdate) return { queue, action: 'none' };

  return {
    queue: { ...queue, missedDuringUpdate: false },
    action: queue.items.length > 0 ? 'flush' : 'none',
  };
};
