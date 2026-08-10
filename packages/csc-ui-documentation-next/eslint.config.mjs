import withNuxt from './.nuxt/eslint.config.mjs';
import prettierConfig from 'eslint-config-prettier';
import stylistic from '@stylistic/eslint-plugin';

export default withNuxt(
  {
    ignores: [
      'node_modules/',
      '.nuxt/',
      '.output/',
      'dist/',
      '--port/',
      // Hand-written React/Angular/TypeScript flavor variants of the Vue
      // examples — shown as text in code tabs, never compiled or executed
      // here, so this project's Vue-flavored rules (and TS type-checking,
      // hence their `@ts-nocheck`) don't apply.
      'app/examples/**/*.angular.ts',
      'app/examples/**/*.react.tsx',
      'app/examples/**/*.typescript.ts',
    ],
  },
  {
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      'no-restricted-syntax': 'off',
      'no-console': 'off',
      'no-param-reassign': 'off',
      'newline-before-return': 'error',
      'import/no-unresolved': 'off',
      'vue/no-deprecated-slot-attribute': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/padding-line-between-blocks': 'error',
      'vue/prefer-true-attribute-shorthand': ['error', 'always'],
      'vue/new-line-between-multi-line-property': [
        'error',
        { minLineOfMultilineProperty: 2 },
      ],
      'vue/padding-line-between-tags': [
        'error',
        [{ blankLine: 'always', prev: '*', next: '*' }],
      ],
      'vue/html-self-closing': ['error', { html: { void: 'any' } }],
      'vue/block-order': [
        'error',
        {
          order: ['template', 'script[setup]', 'script:not([setup])', 'style'],
        },
      ],
      'vue/component-name-in-template-casing': [
        'error',
        'kebab-case',
        { registeredComponentsOnly: false },
      ],
      '@typescript-eslint/no-use-before-define': 'off',
      '@stylistic/padding-line-between-statements': [
        'warn',
        {
          blankLine: 'always',
          prev: '*',
          next: ['interface', 'type', 'if', 'for'],
        },
        {
          blankLine: 'always',
          prev: ['block-like', 'block'],
          next: '*',
        },
      ],
    },
  },
  prettierConfig,
);
