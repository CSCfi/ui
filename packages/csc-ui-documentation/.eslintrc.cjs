module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
  },
  extends: [
    '@nuxtjs/eslint-config-typescript',
    'plugin:prettier/recommended',
    'plugin:import/typescript',
  ],
  plugins: [],
  rules: {
    'no-restricted-syntax': 'off',
    'eol-last': 'error',
    'no-console': 'off',
    'newline-before-return': 'error',
    'import/no-unresolved': 'error',
    'import/prefer-default-export': 'off',
    'vue/no-deprecated-slot-attribute': 'off',
    'vue/padding-line-between-blocks': 'error',
    'vue/prefer-true-attribute-shorthand': ['error', 'always'],
    'vue/new-line-between-multi-line-property': [
      'error',
      {
        minLineOfMultilineProperty: 2,
      },
    ],
    'vue/padding-line-between-tags': [
      'error',
      [{ blankLine: 'always', prev: '*', next: '*' }],
    ],
    'vue/multi-word-component-names': 'off',
    'vue/html-self-closing': [
      'error',
      {
        html: {
          void: 'any',
        },
      },
    ],
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/padding-line-between-statements': [
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
    'vue/component-tags-order': [
      'error',
      {
        order: ['template', 'script[setup]', 'script:not([setup])', 'style'],
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
    'vue/component-name-in-template-casing': [
      'error',
      'kebab-case',
      { registeredComponentsOnly: false },
    ],
    'tailwindcss/no-custom-classname': 'off',
    'no-param-reassign': 'off',
    'prettier/prettier': 'error',
  },
  settings: {
    'import/resolver': {
      typescript: true,
    },
    'import/core-modules': ['vue3-code-block'],
  },
};
