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
    'vue/no-deprecated-slot-attribute': 'off',
  },
  settings: {
    'import/resolver': {
      typescript: true,
    },
    'import/core-modules': ['vue3-code-block'],
  },
};
