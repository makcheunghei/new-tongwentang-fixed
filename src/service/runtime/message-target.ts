const CONTENT_ACTIONS = new Set(['Webpage', 'Textarea', 'ZhType']);
const BACKGROUND_ACTIONS = new Set([
  'Convert',
  'NodesText',
  'FilterTarget',
  'ConvertClipboard',
  'GetTarget',
  'SpaMode',
  'Log',
]);

export const messageType = (message: unknown): string | undefined => {
  if (typeof message !== 'object' || message === null || !('type' in message)) return undefined;
  const { type } = message as { type?: unknown };
  return typeof type === 'string' ? type : undefined;
};

export const isContentMessage = (message: unknown): boolean => {
  const type = messageType(message);
  return type != null && CONTENT_ACTIONS.has(type);
};

export const isBackgroundMessage = (message: unknown): boolean => {
  const type = messageType(message);
  return type != null && BACKGROUND_ACTIONS.has(type);
};
