module.exports = {
  overrides: [
    {
      files: ['*.tsx'],
      parserOptions: {
        project: './tsconfig.json',
      },
      extends: ['plugin:@stencil/recommended'],
      rules: {
        '@stencil/class-pattern': [
          'error',
          { pattern: '^C[A-Z]{1}', ignoreCase: false },
        ],
        '@stencil/strict-boolean-conditions': 'off',
        '@stencil/decorators-style': [
          'error',
          { prop: 'inline', method: 'multiline' },
        ],
        'react/jsx-no-bind': 'off',
      },
    },
  ],
};
