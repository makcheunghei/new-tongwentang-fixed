import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const { getCurrent, remove, query } = vi.hoisted(() => ({
  getCurrent: vi.fn(),
  remove: vi.fn(),
  query: vi.fn(),
}));
vi.mock('../service/browser', () => ({ browser: { tabs: { getCurrent, remove, query } } }));
import { closeOptionsPage } from './close-options';

describe('close settings', () => {
  beforeEach(() => {
    getCurrent.mockReset().mockResolvedValue({ id: 7 });
    remove.mockReset().mockResolvedValue(undefined);
    query.mockReset();
    vi.spyOn(window, 'close').mockImplementation(() => undefined);
  });
  afterEach(() => vi.restoreAllMocks());
  it('closes only the tab containing the settings page', async () => {
    await closeOptionsPage();
    expect(remove).toHaveBeenCalledExactlyOnceWith(7);
    expect(query).not.toHaveBeenCalled();
    expect(window.close).not.toHaveBeenCalled();
  });
  it('closes the settings popup when it has no associated tab', async () => {
    getCurrent.mockResolvedValue(undefined);
    await closeOptionsPage();
    expect(remove).not.toHaveBeenCalled();
    expect(query).not.toHaveBeenCalled();
    expect(window.close).toHaveBeenCalledOnce();
  });
  it('falls back to closing the view when the tabs API is unavailable', async () => {
    getCurrent.mockRejectedValue(new Error('unsupported'));
    await closeOptionsPage();
    expect(remove).not.toHaveBeenCalled();
    expect(query).not.toHaveBeenCalled();
    expect(window.close).toHaveBeenCalledOnce();
  });
  it('falls back when the browser cannot remove the settings tab', async () => {
    remove.mockRejectedValue(new Error('cannot remove'));
    await closeOptionsPage();
    expect(query).not.toHaveBeenCalled();
    expect(window.close).toHaveBeenCalledOnce();
  });
});
