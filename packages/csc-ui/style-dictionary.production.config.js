module.exports = {
  source: ['tokens/**/*.json'],
  platforms: {
    scss: {
      transformGroup: 'scss',
      buildPath: 'dist/styles/',
      prefix: 'csc',
      files: [
        {
          destination: 'variables.scss',
          format: 'scss/variables',
        },
      ],
    },
    css: {
      transformGroup: 'css',
      buildPath: 'dist/styles/',
      prefix: 'csc',
      files: [
        {
          format: 'css/variables',
          destination: 'variables.css',
          options: {
            selector: ':root',
          },
        },
      ],
    },
  },
};
