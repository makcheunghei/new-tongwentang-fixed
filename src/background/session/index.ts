import { browser } from '../../service/browser';
import type { SessionState } from './type';

export const getSessionState = async (): Promise<SessionState> => {
  return browser.storage.session.get();
};

export const setSessionState = async (state: Partial<SessionState>) => {
  const entries = Object.entries(state);
  const values = Object.fromEntries(entries.filter(([, value]) => value !== undefined));
  const removals = entries.filter(([, value]) => value === undefined).map(([key]) => key);

  if (Object.keys(values).length > 0) await browser.storage.session.set(values);
  if (removals.length > 0) await browser.storage.session.remove(removals);
};
