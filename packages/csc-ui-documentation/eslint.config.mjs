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
      'public/',
      'example-data/',
      'scripts/',
    ],
  },
  {
    plugins: {
      '@stylistic': stylistic,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          extensions: ['.ts', '.tsx', '.d.ts', '.js', '.jsx', '.vue', '.json'],
          project: [
            './.nuxt/tsconfig.app.json',
            './.nuxt/tsconfig.node.json',
            './.nuxt/tsconfig.server.json',
            './.nuxt/tsconfig.shared.json',
          ],
          noWarnOnMultipleProjects: true,
        },
      },
      'import/core-modules': ['vue3-code-block'],
    },
    rules: {
      'no-restricted-syntax': 'off',
      'no-console': 'off',
      'no-param-reassign': 'off',
      'newline-before-return': 'error',
      'import/no-unresolved': 'off',
      'import/prefer-default-export': 'off',
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
      'vue/v-on-event-hyphenation': [
        'error',
        'always',
        { autofix: false, ignore: ['changeValue', 'changeQuery'] },
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
