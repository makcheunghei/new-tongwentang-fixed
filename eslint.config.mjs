import eslint from '@eslint/js';
import eslintReact from '@eslint-react/eslint-plugin';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const scripts = ['**/rspack.config.js', '**/manifest.js', '**/web-ext-config*.{js,mjs}', '**/web-ext-env.mjs'];

/**
 * @type {import('typescript-eslint').Config}
 */
export default [
  { ignores: ['**/dist/', '**/web-ext-artifacts/'] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    name: 'scripts',
    files: scripts,
    languageOptions: { globals: globals.node, sourceType: 'commonjs' },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    ...eslintReact.configs['recommended-typescript'],
    files: ['**/src/**/*.{js,mjs,cjs,ts,jsx,tsx}'],
  },
  {
    name: 'extension',
    files: ['**/src/**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { project: true, tsconfigRootDir: import.meta.dirname },
      globals: globals.browser,
    },
    rules: {
      '@eslint-react/no-leaked-conditional-rendering': 'off',
    },
  },
];
