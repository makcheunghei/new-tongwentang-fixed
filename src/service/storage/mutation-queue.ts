let pending: Promise<unknown> = Promise.resolve();

// All background preference read/modify/write operations share one queue.
export const serializeStorageMutation = <T>(operation: () => Promise<T>): Promise<T> => {
  const task = pending.catch(() => undefined).then(operation);
  pending = task;
  return task;
};
