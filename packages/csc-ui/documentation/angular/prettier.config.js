module.exports = {
  trailingComma: 'all',
  tabWidth: 2,
  semi: true,
  singleQuote: true,
  bracketSpacing: true,
  bracketSameLine: false,
  printWidth: 100,
  htmlWhitespaceSensitivity: 'ignore',
  overrides: [
    {
      files: ['*.html'],
      options: {
        parser: 'angular'
      }
    }
  ]
}