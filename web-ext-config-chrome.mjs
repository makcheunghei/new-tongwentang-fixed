import { env } from './web-ext-env.mjs';

export default {
  sourceDir: './dist/chromium',
  run: {
    target: ['chromium'],
    chromiumBinary: env.CHROMIUM_BINARY || undefined,
    startUrl: ['chrome://extensions'],
  },
};
