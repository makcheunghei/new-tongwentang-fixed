import { env } from './web-ext-env.mjs';

export default {
  sourceDir: './dist/firefox',
  run: {
    firefox: env.FIREFOX || 'firefox',
    target: ['firefox-desktop'],
    startUrl: ['about:debugging'],
  },
  sign: {
    apiKey: env.API_KEY,
    apiSecret: env.API_SECRET,
  },
};
