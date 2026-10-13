import { browser } from '../../service/browser';

interface OffscreenApi {
  createDocument(options: { url: string; reasons: string[]; justification: string }): Promise<void>;
}

const api = (): OffscreenApi | undefined =>
  (globalThis as typeof globalThis & { chrome?: { offscreen?: OffscreenApi } }).chrome?.offscreen;

let creating: Promise<void> | undefined;
const ensureDocument = async (): Promise<void> => {
  const offscreen = api();
  if (!offscreen) throw new Error('CLIPBOARD_UNAVAILABLE');
  if (!creating) {
    creating = offscreen
      .createDocument({
        url: 'clipboard.html',
        reasons: ['CLIPBOARD'],
        justification: 'Read and convert clipboard text on explicit user request.',
      })
      .catch((error: unknown) => {
        // The document can survive a service-worker restart.
        if (!/only a single offscreen document/i.test(String(error))) throw error;
      })
      .finally(() => {
        creating = undefined;
      });
  }
  await creating;
};

type Reply = { ok: true; text: string } | { ok: false; error: string };
export const offscreenClipboard = async (
  operation: 'read' | 'write',
  text?: string,
  expected?: string,
): Promise<string> => {
  await ensureDocument();
  const reply: Reply | undefined = await browser.runtime.sendMessage({
    type: 'OffscreenClipboard',
    operation,
    text,
    expected,
  });
  if (!reply?.ok) throw new Error(reply?.error ?? 'CLIPBOARD_UNAVAILABLE');
  return reply.text;
};
