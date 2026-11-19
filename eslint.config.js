import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

/** Restringe importaciones por capa: ui → services → (domain, data, clasificador). */
const restringir = (grupos) => ({
  'no-restricted-imports': [
    'error',
    {
      patterns: [{ group: grupos, message: 'Importación no permitida entre capas (docs/02 §2).' }],
    },
  ],
});

export default defineConfig(
  {
    ignores: [
      'dist',
      'dist-single',
      'coverage',
      'playwright-report',
      'test-results',
      'evidencias',
      'reference',
    ],
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { react, 'react-hooks': reactHooks, 'jsx-a11y': jsxA11y },
    languageOptions: { globals: { ...globals.browser } },
    settings: { react: { version: 'detect' } },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...jsxA11y.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/no-danger': 'error',
      'react/prop-types': 'off',
      'no-restricted-properties': [
        'error',
        { property: 'innerHTML', message: 'Prohibido: renderiza con componentes React.' },
        { property: 'outerHTML', message: 'Prohibido: renderiza con componentes React.' },
      ],
    },
  },
  {
    files: ['src/domain/**'],
    rules: restringir([
      '**/data/**',
      '**/ui/**',
      '**/services/**',
      '**/clasificador/**',
      '**/config/**',
      'react',
      'react-dom',
      'dexie',
      'dexie-react-hooks',
    ]),
  },
  {
    files: ['src/ui/**'],
    rules: restringir(['dexie', '**/data/db', '**/data/db.ts']),
  },
  {
    files: ['src/services/**'],
    rules: restringir(['**/ui/**', 'react', 'react-dom']),
  },
  {
    files: ['src/data/**', 'src/clasificador/**', 'src/config/**'],
    rules: restringir(['**/ui/**', '**/services/**', 'react', 'react-dom']),
  },
  {
    files: ['*.config.{js,ts}', 'tests/**'],
    languageOptions: { globals: { ...globals.node } },
  },
  prettier,
);
