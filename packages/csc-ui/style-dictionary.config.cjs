const { readdirSync } = require('node:fs');
const path = require('node:path');
const StyleDictionaryPackage = require('style-dictionary');
const createTheme = require('./utils/createTheme.cjs');
const createSemanticTheme = require('./utils/createSemanticTheme.cjs');
const semanticLight = require('./tokens/semantic/light.json');
const semanticDark = require('./tokens/semantic/dark.json');
const semanticInvariant = require('./tokens/semantic/invariant.json');

/**
 * Token pipeline for `@cscfi/csc-ui`.
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
 * Pre-upgrade placeholders (see CONTEXT.md: pre-upgrade window / placeholder /
 * fail-open reveal).
 *
 * In server-rendered / static HTML the custom elements exist as plain unknown
 * elements until the library's JS runs: no shadow content renders, so slotted
 * light DOM paints raw — bare text for most components, UA input chrome for
 * the form fields. On upgrade the styled component mounts — a visible flash.
 *
 * These `:not(:defined)` rules ship in `tokens.css` (the only document-level
 * stylesheet we own) and hide every component tag for the pre-upgrade window.
 * Hide-only, not skeletons: the light DOM stays in the HTML (crawlers and the
 * accessibility tree get it back the moment the element upgrades), it just
 * doesn't paint. No `display` is forced — the catalog mixes inline (c-icon,
 * c-tag, c-link) and block-ish components, so the UA inline default is the
 * least-wrong generic box and any forced value would worsen the upgrade shift
 * for half of them.
 *
 * Fail-open reveal: if the bundle never runs (network failure, blocked
 * script, misconfigured build), hidden-forever would be strictly worse than
 * the flash — so a zero-duration, 3s-delayed animation flips visibility back
 * and the page degrades to readable unstyled content. CSS-only on purpose:
 * it must work precisely when JS is what's missing. The delay is a constant,
 * not a `--c-*` token — degradation tuning is not public API; a consumer with
 * strong opinions can override the rule wholesale.
 *
 * The tag list is derived from `src/components/` directory names (the same
 * dir-name-is-tag-name convention the docs analyzer trusts), so new
 * components get a placeholder automatically and the list cannot drift.
 *
 * Rejected alternative: declarative-shadow-DOM SSR would style the first
 * paint for real, but Vue's `defineCustomElement` has no server-rendering
 * story, so pre-upgrade is inherently unstyled.
 *
 * Components with a fixed, knowable resting height additionally reserve
 * their resting geometry as explicit exceptions, so upgrade does not shift
 * the layout: the form-field shells (44px field row + 8px gap + 16px
 * details row = 68px, or just the field row when `hide-details` is set)
 * and c-radio (its 42px indicator row).
 */
const componentTags = readdirSync(path.join(__dirname, 'src/components'), {
  withFileTypes: true,
})
  .filter((entry) => entry.isDirectory() && entry.name.startsWith('c-'))
  .map((entry) => entry.name)
  .sort();

const preUpgradePlaceholders = `
/* Pre-upgrade placeholders: hide raw slotted content until the custom element
   upgrades, failing open after 3s if it never does. */
${componentTags.map((tag) => `${tag}:not(:defined)`).join(',\n')} {
  visibility: hidden;
  animation-name: c-pre-upgrade-reveal;
  animation-duration: 0s;
  animation-delay: 3s;
  animation-fill-mode: forwards;
}

@keyframes c-pre-upgrade-reveal {
  to {
    visibility: visible;
  }
}

/* Geometry exceptions: form-field shells reserve their resting height so
   upgrade does not shift the layout. */
c-autocomplete:not(:defined),
c-input:not(:defined),
c-select:not(:defined),
c-text-field:not(:defined) {
  display: block;
  min-height: 68px;
}

c-autocomplete[hide-details]:not(:defined),
c-input[hide-details]:not(:defined),
c-select[hide-details]:not(:defined),
c-text-field[hide-details]:not(:defined) {
  min-height: 44px;
}

/* Each radio row has a fixed resting height (the 42px indicator), so the
   reservation is exact per row; the group itself stays generic (its height
   depends on item count/label/hint). */
c-radio:not(:defined) {
  display: block;
  min-height: 42px;
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
