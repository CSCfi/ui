import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import perfectionist from 'eslint-plugin-perfectionist';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintPluginVue from 'eslint-plugin-vue';
import globals from 'globals';
import typescriptEslint from 'typescript-eslint';

export default typescriptEslint.config(
  {
    ignores: ['**/build/', '**/dist/', '**/node_modules/', '**/public/'],
    name: 'app/ignored',
  },

  {
    extends: [
      eslint.configs.recommended,
      ...typescriptEslint.configs.recommended,
      ...eslintPluginVue.configs['flat/strongly-recommended'],
      eslintPluginPrettierRecommended,
      perfectionist.configs['recommended-alphabetical'],
    ],

    files: ['**/*.{cjs,mjs,js,ts,vue}'],

    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.browser,
      parserOptions: {
        parser: typescriptEslint.parser,
        tsconfigRootDir: '/',
      },

      sourceType: 'module',
    },

    name: 'app/base',

    plugins: {
      '@stylistic': stylistic,
    },

    rules: {
      '@stylistic/padding-line-between-statements': [
        'warn',
        {
          blankLine: 'always',
          next: [
            'interface',
            'type',
            'if',
            'for',
            'const',
            'let',
            'export',
          ],
          prev: '*',
        },
        {
          blankLine: 'always',
          next: '*',
          prev: ['block-like', 'block'],
        },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-redeclare': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-use-before-define': 'off',
      'eol-last': 'error',
      'newline-before-return': 'error',
      'no-console': 'off',
      'no-param-reassign': 'off',
      'no-redeclare': 'off',
      'no-restricted-syntax': 'off',
      'no-useless-constructor': 'off',
      'prefer-template': 'error',
      'prettier/prettier': 'error',
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
          order: ['template', 'script[setup]', 'script:not([setup])', 'style'],
        },
      ],
      'vue/component-name-in-template-casing': [
        'error',
        'kebab-case',
        { registeredComponentsOnly: false },
      ],
      'vue/define-emits-declaration': ['error', 'type-literal'],
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

  {
    extends: [typescriptEslint.configs.disableTypeChecked],
    files: ['**/*.js'],
    // disable type-aware linting on JS files
    name: 'app/disabled',
  },
);
