const StyleDictionaryPackage = require('style-dictionary');
const createTheme = require('./utils/createTheme.cjs');
const createSemanticTheme = require('./utils/createSemanticTheme.cjs');
const semanticLight = require('./tokens/semantic/light.json');
const semanticDark = require('./tokens/semantic/dark.json');
const semanticInvariant = require('./tokens/semantic/invariant.json');

/**
 * Token pipeline for `@cscfi/csc-ui-next` (ADR-0010).
 *
 * Duplicated from `@cscfi/csc-ui` so `next` owns its tokens ahead of the
 * eventual removal of the Stencil package. Emits a single document-level
 * `tokens.css` the consumer imports, containing:
 *
 *   1. the `--c-*` palette (mode-independent brand ramp), and
 *   2. the semantic-token layer (role → palette step, switched per theme mode).
 *
 * Both are declared on the document root and inherit across shadow boundaries,
 * where the `@theme inline` map in `src/tailwind.css` resolves the utilities
 * (`bg-primary-600`, `bg-surface`, …) against them.
 *
 * `source` is narrowed to `tokens/theme` (the palette) so style-dictionary does
 * not try to parse the semantic maps as design tokens — those are plain
 * role→step lookup tables consumed directly by `createSemanticTheme`.
 */

// Emit the palette `--c-*` properties followed by the semantic-token layer.
StyleDictionaryPackage.registerFormat({
  name: 'css/tokens',
  formatter({ dictionary }) {
    const palette = createTheme(dictionary, 'css');
    const semantic = createSemanticTheme(
      semanticLight,
      semanticDark,
      semanticInvariant,
    );

    return `${palette}\n${semantic}`;
  },
});

module.exports = {
  source: ['tokens/theme/**/*.json'],

  platforms: {
    // Palette + semantic tokens → src/styles/css/tokens.css
    // (copied into dist/styles/css by `scripts/copy-styles.js` post-build).
    'css/tokens': {
      transformGroup: 'css',
      buildPath: 'src/styles/css/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/tokens',
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
