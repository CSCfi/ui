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

/**
 * Pre-upgrade placeholders for the form-field shells.
 *
 * In server-rendered / static HTML the custom elements exist as plain unknown
 * elements until the library's JS runs: they render inline with no shadow
 * content, and `c-input`'s slotted light-DOM `<input>` paints with raw UA
 * chrome (its native border). On upgrade the styled field mounts and the page
 * reflows — a visible flash plus a layout shift.
 *
 * These `:not(:defined)` rules ship in the same `tokens.css` the consumer
 * already imports (the only document-level stylesheet we own), hiding the raw
 * content and reserving the field's resting geometry so upgrade does not
 * shift the layout: 44px field row + 8px gap + 16px details row = 68px, or
 * just the field row when `hide-details` is set.
 */
const preUpgradePlaceholders = `
/* Pre-upgrade placeholders: hide raw slotted content and reserve the field's
   resting height until the custom element upgrades. */
c-autocomplete:not(:defined),
c-input:not(:defined),
c-select:not(:defined),
c-text-field:not(:defined) {
  display: block;
  visibility: hidden;
  min-height: 68px;
}

c-autocomplete[hide-details]:not(:defined),
c-input[hide-details]:not(:defined),
c-select[hide-details]:not(:defined),
c-text-field[hide-details]:not(:defined) {
  min-height: 44px;
}
`;

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

    return `${palette}\n${semantic}\n${preUpgradePlaceholders}`;
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
