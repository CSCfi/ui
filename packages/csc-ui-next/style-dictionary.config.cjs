const StyleDictionaryPackage = require('style-dictionary');
const createTheme = require('./utils/createTheme.cjs');

/**
 * Token pipeline for `@cscfi/csc-ui-next` (ADR-0010).
 *
 * Duplicated from `@cscfi/csc-ui` so `next` owns its tokens ahead of the
 * eventual removal of the Stencil package. Trimmed to the single output `next`
 * needs today: the `--c-*` palette as document-level custom properties. The
 * semantic + dark token groups (ADR-0010) are layered on in a later phase.
 *
 * The palette ramp is mode-independent (a brand constant). It is declared on
 * `:root, :host` and inherits across shadow boundaries, where the `@theme
 * inline` map in `src/tailwind.css` resolves token utilities (`bg-primary-600`)
 * to `var(--c-primary-600)`.
 */

// Emit the `--c-*` custom properties for the CSC palette (prefix `theme` → `c`).
StyleDictionaryPackage.registerFormat({
  name: 'css/theme/variables',
  formatter({ dictionary }) {
    return createTheme(dictionary, 'css');
  },
});

module.exports = {
  source: ['tokens/**/*.json'],

  platforms: {
    // CSS palette custom properties → src/styles/css/theme.css
    // (copied into dist/styles/css by `scripts/copy-styles.js` post-build).
    'css/theme': {
      transformGroup: 'css',
      buildPath: 'src/styles/css/',
      files: [
        {
          destination: 'theme.css',
          format: 'css/theme/variables',
          filter: {
            attributes: {
              category: 'theme',
            },
          },
        },
      ],
    },
  },
};
