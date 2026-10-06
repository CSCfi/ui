import eslintConfigPrettier from 'eslint-config-prettier';
import oxlint from 'eslint-plugin-oxlint';
import eslintPluginVue from 'eslint-plugin-vue';
import { defineConfig } from 'eslint/config';
import typescriptEslint from 'typescript-eslint';

// ESLint only runs the eslint-plugin-vue rules oxlint cannot: oxlint lints
// every script, `.vue` script blocks included, but not templates (ADR-0068).
export default defineConfig(
  {
    ignores: [
      '**/dist/',
      '**/dist-types/',
      '**/.nuxt/',
      '**/.output/',
      'temp/',
      // Scripts are oxlint's.
      '**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}',
    ],
    name: 'app/ignored',
  },

  {
    extends: [
      ...eslintPluginVue.configs['flat/strongly-recommended'],
      // Switches off the template formatting rules oxfmt owns. It must come
      // before the rules below, or it would switch off vue/html-self-closing.
      eslintConfigPrettier,
    ],

    files: ['**/*.vue'],

    languageOptions: {
      parserOptions: {
        parser: typescriptEslint.parser,
      },
    },

    // oxlint honours `eslint-disable` comments for the rules it now owns, so
    // ESLint must not report (or `--fix` away) the ones it no longer runs.
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },

    name: 'app/vue',

    rules: {
      'vue/attributes-order': [
        'error',
        {
          alphabetical: true,
          order: [
            'DEFINITION',
            'LIST_RENDERING',
            'CONDITIONALS',
            'RENDER_MODIFIERS',
            'GLOBAL',
            ['UNIQUE', 'SLOT'],
            'TWO_WAY_BINDING',
            'OTHER_DIRECTIVES',
            'ATTR_DYNAMIC',
            'ATTR_STATIC',
            'ATTR_SHORTHAND_BOOL',
            'EVENTS',
            'CONTENT',
          ],
        },
      ],
      'vue/block-order': [
        'error',
        {
          order: ['template', 'script:not([setup])', 'script[setup]', 'style'],
        },
      ],
      'vue/component-name-in-template-casing': [
        'error',
        'kebab-case',
        { registeredComponentsOnly: false },
      ],
      'vue/html-self-closing': [
        'error',
        {
          html: {
            void: 'any',
          },
        },
      ],
      'vue/multi-word-component-names': 'off',
      'vue/new-line-between-multi-line-property': [
        'error',
        {
          minLineOfMultilineProperty: 2,
        },
      ],
      'vue/no-deprecated-slot-attribute': 'off',
      'vue/no-v-html': 'off',
      'vue/padding-line-between-blocks': 'error',
      'vue/padding-line-between-tags': [
        'error',
        [{ blankLine: 'always', next: '*', prev: '*' }],
      ],
      'vue/prefer-true-attribute-shorthand': ['error', 'always'],
      'vue/prefer-use-template-ref': 'error',
      'vue/require-default-prop': 'error',
      'vue/v-bind-style': [
        'error',
        'shorthand',
        {
          sameNameShorthand: 'always',
        },
      ],
      'vue/v-on-event-hyphenation': [
        'error',
        'always',
        {
          autofix: false,
          ignore: ['changeValue', 'changeQuery'],
        },
      ],
    },
  },

  // Last: switches off every rule `.oxlintrc.json` enables, so a `vue/*` rule
  // both tools implement reports once, from oxlint.
  ...oxlint.buildFromOxlintConfigFile('./.oxlintrc.json'),
);
