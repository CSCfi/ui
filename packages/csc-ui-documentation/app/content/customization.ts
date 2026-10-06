import type { Flavor } from '~/composables/useFlavor';

/**
 * Customization page content, one block set per flavor. Kept as
 * data so the page can prerender-highlight every flavor and swap client-side.
 *
 * This page is the single source of truth for the five consumer customization
 * surfaces: seed theming, dark mode / semantic tokens, ::part() restyling,
 * app-wide prop defaults, and the Tailwind theme export.
 * The getting-started and migration guides keep only teasers that link here.
 */
export interface CustomizationBlock {
  code: string;
  filename?: string;
  lang: string;
}

export interface CustomizationSection {
  blocks: Record<Flavor, CustomizationBlock[]>;
  id: string;
  intro: Partial<Record<'all' | Flavor, string>>;
  title: string;
}

const forAll = (
  blocks: CustomizationBlock[],
): Record<Flavor, CustomizationBlock[]> => ({
  angular: blocks,
  react: blocks,
  typescript: blocks,
  vue: blocks,
});

/* The applyTheme/resetTheme walkthrough is identical in every flavor except
   for the import source, so build the shared body once. */
const themingCode = (importSource: string) => `import {
  applyTheme,
  resetTheme,
} from '${importSource}';

// One step-500 seed per family; the full 50–950 ramp and both
// light and dark modes regenerate from it at runtime.
applyTheme({ primary: '#006efd', accent: '#7c3aed' });

// Later calls merge with earlier ones — primary and accent stay overridden.
applyTheme({ error: '#d61f26' });

// Restore selected families to the defaults — or everything: resetTheme().
resetTheme(['accent']);`;

/* The applyDefaults/resetDefaults walkthrough is likewise identical in every
   flavor except for the import source. */
const appDefaultsCode = (importSource: string) => `import {
  applyDefaults,
  resetDefaults,
} from '${importSource}';

// Every text field labels on top; every select shows five rows before the peek.
applyDefaults({
  'c-text-field': { labelOnTop: true },
  'c-select': { itemsPerPage: 5 },
});

// Later calls merge with earlier ones — the text-field default stays. One
// texts object translates every select; a per-instance texts still wins key by key.
applyDefaults({
  'c-select': {
    texts: { clearSelection: 'Tyhjennä valinta', toggleOptions: 'Näytä vaihtoehdot' },
  },
});

// An instance overrides its app default the usual way:
//   <c-text-field label-on-top="false">   or   field.labelOnTop = false

// Clear one key (undefined), one tag, or everything.
applyDefaults({ 'c-select': { itemsPerPage: undefined } });
resetDefaults(['c-select']);
resetDefaults();`;

export const CUSTOMIZATION_SECTIONS: CustomizationSection[] = [
  {
    blocks: forAll([]),
    id: 'overview',
    intro: {
      all: `Customization splits along three independent axes.

Colours flow through the design tokens: you hand the library one seed colour per family, it regenerates the full palette ramp, and every semantic token — in both light and dark mode — follows automatically. You never restyle a component's colours directly.

Structure flows through named parts: each component exposes a curated set of ::part() regions (root, content, …), and that part set is the component's customization contract.

Behaviour presets flow through app-wide prop defaults: applyDefaults sets a preference prop — labels on top, hidden hint rows, the texts a component speaks — for every instance of a tag, and any instance can still override it.

Per-component CSS custom properties like --c-button-background-color do not exist in this library — if you are upgrading from @cscfi/csc-ui, see the migration guide.`,
    },
    title: 'Three axes of customization',
  },
  {
    blocks: {
      angular: [{ code: themingCode('@cscfi/csc-ui'), lang: 'ts' }],
      react: [{ code: themingCode('@cscfi/csc-ui-react'), lang: 'ts' }],
      typescript: [{ code: themingCode('@cscfi/csc-ui'), lang: 'ts' }],
      vue: [{ code: themingCode('@cscfi/csc-ui'), lang: 'ts' }],
    },
    id: 'brand-theming',
    intro: {
      all: `applyTheme takes one step-500 seed colour per family and regenerates that family's whole 50–950 ramp (an OKLCH perceptual curve, anchored so step 500 reproduces your seed exactly). Because the semantic tokens resolve through the ramp, a single seed re-brands every component in both theme modes.

The eight chromatic families are themable: primary, secondary, accent, success, info, warning, error, and link. The neutrals and the semantic role→step mappings are hand-tuned for WCAG AA contrast and deliberately not overridable.

Validation is fail-loud: an unknown family name or an unparseable colour throws, so a typo cannot silently ship the default brand. Try it live below — the playground re-seeds this whole site.`,
      react: `applyTheme takes one step-500 seed colour per family and regenerates that family's whole 50–950 ramp (an OKLCH perceptual curve, anchored so step 500 reproduces your seed exactly). Because the semantic tokens resolve through the ramp, a single seed re-brands every component in both theme modes. The theming functions are re-exported from @cscfi/csc-ui-react, so one import source covers components and theming alike.

The eight chromatic families are themable: primary, secondary, accent, success, info, warning, error, and link. The neutrals and the semantic role→step mappings are hand-tuned for WCAG AA contrast and deliberately not overridable.

Validation is fail-loud: an unknown family name or an unparseable colour throws, so a typo cannot silently ship the default brand. Try it live below — the playground re-seeds this whole site.`,
    },
    title: 'Re-brand with theme seeds',
  },
  {
    blocks: {
      angular: [
        {
          code: `import { bootstrapApplication } from '@angular/platform-browser';
import { themeToCss } from '@cscfi/csc-ui';

import { AppComponent } from './app/app.component';

// Applied before bootstrap — the brand is right on first paint.
const style = document.createElement('style');
style.textContent = themeToCss({ primary: '#006efd' });
document.head.append(style);

bootstrapApplication(AppComponent);`,
          filename: 'main.ts',
          lang: 'ts',
        },
      ],
      react: [
        {
          code: `import { themeToCss } from '@cscfi/csc-ui-react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Rendered on the server — the brand is right on first paint. */}
        <style>{themeToCss({ primary: '#006efd' })}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}`,
          filename: 'app/layout.tsx',
          lang: 'tsx',
        },
      ],
      typescript: [
        {
          code: `import { applyTheme, defineCustomElements } from '@cscfi/csc-ui';

// Before the elements register and render — no flash of the default brand.
applyTheme({ primary: '#006efd' });

defineCustomElements();`,
          filename: 'main.ts',
          lang: 'ts',
        },
      ],
      vue: [
        {
          code: `import { themeToCss } from '@cscfi/csc-ui';

// Rendered into <head> at SSR time — the brand is right on first paint.
useHead({
  style: [{ innerHTML: themeToCss({ primary: '#006efd' }) }],
});`,
          filename: 'app.vue',
          lang: 'ts',
        },
      ],
    },
    id: 'ssr-fouc',
    intro: {
      angular: `applyTheme needs a DOM, so to avoid a flash of the default brand make the theme apply before the app bootstraps. themeToCss is a pure function that returns a :root { … } rule as a string — append it as a <style> in main.ts before bootstrapApplication.`,
      react: `applyTheme needs a DOM, so on the server — and to avoid a flash of the default brand before your first client-side call — use themeToCss instead. It is a pure function that returns a :root { … } rule as a string, safe to render into <head> during SSR. In Next.js, render it as a <style> in the root layout.`,
      typescript: `To avoid a flash of the default brand, apply the theme before anything renders — call applyTheme at the top of your entry module, before defineCustomElements. For a fully static page, themeToCss returns the same override as a :root { … } CSS string you can paste into a <style> in your HTML.`,
      vue: `applyTheme needs a DOM, so on the server — and to avoid a flash of the default brand before your first client-side call — use themeToCss instead. It is a pure function that returns a :root { … } rule as a string, safe to render into <head> during SSR. In Nuxt, inject it with useHead.`,
    },
    title: 'Server rendering & first paint',
  },
  {
    blocks: forAll([
      {
        code: `<!-- Pin a mode for the whole app; unset = follow the OS preference. -->
<html data-theme="dark">`,
        lang: 'html',
      },
      {
        code: `<!-- A permanently dark panel on a light page. The scope re-points the
     tokens; bg-surface/text-on-surface make the panel paint them. -->
<section data-theme="dark" class="bg-surface text-on-surface">
  <c-card>
    <c-card-content>Always dark, whatever the user picked.</c-card-content>
  </c-card>

  <!-- Scopes nest: the nearest one wins. -->
  <aside data-theme="light" class="bg-surface text-on-surface">Always light.</aside>
</section>

<!-- A single component works too — the host is a scope like any element. -->
<c-button data-theme="dark">Dark button</c-button>`,
        filename: 'Pin a mode for part of the page',
        lang: 'html',
      },
      {
        code: `<!-- Opposite of whatever the page is: dark when the page is light, light
     when it is dark. Paint opt-in is the same as for a pinned scope. -->
<section data-theme-invert class="bg-surface text-on-surface">
  <c-card>
    <c-card-content>Always the opposite of the page.</c-card-content>
  </c-card>

  <!-- Inverting twice is back in the page's mode. -->
  <aside data-theme-invert class="bg-surface text-on-surface">Back to the page's mode.</aside>
</section>

<!-- At the root it means the opposite of the OS preference. -->
<html data-theme-invert>`,
        filename: 'Invert the surrounding mode',
        lang: 'html',
      },
      {
        code: `const setMode = (mode: 'light' | 'dark' | 'system') => {
  if (mode === 'system') {
    document.documentElement.removeAttribute('data-theme');
    localStorage.removeItem('theme');
  } else {
    document.documentElement.dataset.theme = mode;
    localStorage.setItem('theme', mode);
  }
};`,
        filename: 'Runtime toggle with a stored choice',
        lang: 'ts',
      },
      {
        code: `<script>
  // Inline in <head>, so a stored mode applies before anything renders.
  const theme = localStorage.getItem('theme');
  if (theme === 'light' || theme === 'dark') {
    document.documentElement.dataset.theme = theme;
  }
</script>`,
        filename: 'index.html — restore the choice before first paint',
        lang: 'html',
      },
      {
        code: `import { chartSlotsHex, observeThemeMode } from '@cscfi/csc-ui';

// Resolves the mode in effect where the element sits — a pinned or inverting
// scope, else the OS preference — then follows it: a data-theme flip on any
// ancestor, or the OS preference changing while no scope pins a mode. Fires
// once immediately, so this is the whole wiring.
const stop = observeThemeMode(chartEl, (mode) => {
  chart.setOption({ color: chartSlotsHex[mode] });
});`,
        filename: 'Follow the mode in effect for an element',
        lang: 'ts',
      },
      {
        code: `/* A mode scope — pinned or inverting — re-declares every role on
   itself, and an element's own declaration beats an inherited one, so a
   :root-only override stops applying inside a scope. Cover all three. */
:root,
[data-theme],
[data-theme-invert] {
  --c-surface: #101418;
}

/* Seed overrides (applyTheme) need no such care: they set palette tokens
   that the roles still point at, so they reach every scope. */`,
        filename: 'Overriding a role token? Scope it too',
        lang: 'css',
      },
    ]),
    id: 'dark-mode',
    intro: {
      all: `Components follow the OS light/dark preference by default. To pin a mode explicitly, set data-theme="light" or "dark" on <html> — the explicit attribute always wins over the OS preference; removing it goes back to following the OS.

The same attribute works on any element, not just <html>. An element carrying data-theme opens a mode scope: it and everything inside it resolve in that mode, whatever the rest of the page is doing. Scopes nest, and the nearest one wins. Only light and dark pin a mode — any other value is ignored, so a data-theme your own theming system already sets will not pull components out of the surrounding mode.

The switching happens in the semantic-token layer: every role token (surface, on-surface, border, …) resolves to a different palette step per mode, so components and any UI you build on the tokens flip together. Seeds and modes compose — a re-branded ramp feeds both modes, so applyTheme needs no dark-mode variant, and a seeded ramp feeds every scope.

A scope can also be relative. An element carrying data-theme-invert resolves every role in the opposite mode to the one it sits in — dark inside a light page, light inside a dark one — so a region that must always stand apart from its surroundings needs no per-page variant. Inverting scopes nest like pinned ones, so inverting twice is back in the surrounding mode, and a data-theme on the same element wins over the inversion. On <html> it means the opposite of the OS preference. The attribute is presence-only, like hidden: data-theme-invert="false" still inverts, so remove it to stop.

A mode scope re-points colours; it paints nothing. Give a container bg-surface and text-on-surface (or the var(--c-…) equivalents) to make it draw the mode it pins — otherwise a colour inherited from outside the scope keeps the outer mode's ink.

Every scope publishes the mode it resolved as --c-mode (light or dark). Read it from JS, or style-query it from your own CSS with @container style(--c-mode: dark) { … }, instead of duplicating the data-theme selectors.`,
    },
    title: 'Dark mode',
  },
  {
    blocks: forAll([]),
    id: 'tokens',
    intro: {
      all: `The semantic tokens are the palette every component authors against — and the vocabulary your own UI can share. In CSS they are custom properties with a --c- prefix (var(--c-surface)); through the Tailwind theme export the same roles appear as unprefixed colour utilities.

Each token resolves to a different palette step per theme mode, and the steps themselves regenerate when you seed a family — so anything built on these tokens follows both the mode and the brand automatically. The swatches below are live: flip the theme toggle or use the playground above and watch them move.`,
    },
    title: 'Semantic token reference',
  },
  {
    blocks: forAll([
      {
        code: `/* Restyle via named parts; keep colours on the tokens. */
c-button::part(root) {
  border-radius: 4px;
  background: var(--c-primary);
}

c-button::part(root):hover {
  background: var(--c-primary-hover);
}`,
        lang: 'css',
      },
    ]),
    id: 'parts',
    intro: {
      all: `For anything beyond colours — spacing, radii, typography, layout — target a component's named parts with the CSS ::part() selector. The parts a component exposes are a curated contract: each component page lists them in its "CSS parts" table, and those names are stable API.

Parts reach through the shadow boundary, so ordinary stylesheet rules work; there is nothing to configure. Keep colours inside part rules on the design tokens so your overrides still follow theme mode and brand seeds. Parts nested in inner components are forwarded on demand under a <child>-<part> naming convention — if a region you need is missing, request a part rather than working around the shadow root.`,
    },
    title: 'Restyle with ::part()',
  },
  {
    blocks: {
      angular: [
        { code: appDefaultsCode('@cscfi/csc-ui'), lang: 'ts' },
        {
          code: `import { bootstrapApplication } from '@angular/platform-browser';
import { applyDefaults, defineCustomElements } from '@cscfi/csc-ui';

import { AppComponent } from './app/app.component';

// Before the first element upgrades — or at any later point: the registry is live.
applyDefaults({ 'c-text-field': { labelOnTop: true } });
defineCustomElements();

bootstrapApplication(AppComponent);`,
          filename: 'main.ts',
          lang: 'ts',
        },
      ],
      react: [
        { code: appDefaultsCode('@cscfi/csc-ui-react'), lang: 'ts' },
        {
          code: `import { useEffect } from 'react';
import { applyDefaults } from '@cscfi/csc-ui-react';

import { messages, useLocale } from './i18n';

export function App() {
  const locale = useLocale();

  // Runs on mount and on every locale change; mounted fields follow.
  useEffect(() => {
    applyDefaults({ 'c-select': { texts: messages[locale].select } });
  }, [locale]);

  return <Routes />;
}`,
          filename: 'App.tsx',
          lang: 'tsx',
        },
      ],
      typescript: [
        { code: appDefaultsCode('@cscfi/csc-ui'), lang: 'ts' },
        {
          code: `import { applyDefaults, defineCustomElements } from '@cscfi/csc-ui';

// Before the first element upgrades — or at any later point: the registry is live.
applyDefaults({ 'c-text-field': { labelOnTop: true } });
defineCustomElements();`,
          filename: 'main.ts',
          lang: 'ts',
        },
      ],
      vue: [
        { code: appDefaultsCode('@cscfi/csc-ui'), lang: 'ts' },
        {
          code: `import { watch } from 'vue';
import { applyDefaults, defineCustomElements } from '@cscfi/csc-ui';

import { locale, messages } from './i18n';

defineCustomElements();

// The registry is live, so a locale change re-translates every mounted field.
watch(
  locale,
  (code) => applyDefaults({ 'c-select': { texts: messages[code].select } }),
  { immediate: true },
);`,
          filename: 'main.ts',
          lang: 'ts',
        },
      ],
    },
    id: 'app-defaults',
    intro: {
      all: `Some props are preferences rather than per-instance data: whether labels sit on top of fields, whether the hint row is hidden, the field size, how many rows a list shows, the texts a component speaks. applyDefaults sets such a prop once for every instance of a tag, so an app decides them in one place instead of on every element.

Only defaultable props take part — each component page marks them with an "app default" badge in its Properties table, and TypeScript accepts nothing else. A prop resolves instance value → app default → built-in default, so an explicit attribute or property on an element always wins, and later calls merge with earlier ones. The registry is live: mounted elements re-render when the defaults change, which makes runtime language switching a single texts call. An object prop such as texts is stored whole and merged key by key with the built-in strings, so a partial translation keeps the English fallbacks.

Validation is fail-loud: an unknown tag or a prop that is not defaultable throws. The inner c-input the fields compose is not covered in this release — set the defaults on the field component you use. Try it live below: the demo fields follow the toggles, and the defaults are cleared again when you leave the page.`,
      react: `Some props are preferences rather than per-instance data: whether labels sit on top of fields, whether the hint row is hidden, the field size, how many rows a list shows, the texts a component speaks. applyDefaults sets such a prop once for every instance of a tag, so an app decides them in one place instead of on every element. Like the theming functions it is re-exported from @cscfi/csc-ui-react.

Only defaultable props take part — each component page marks them with an "app default" badge in its Properties table, and TypeScript accepts nothing else. A prop resolves instance value → app default → built-in default, so an explicit attribute or property on an element always wins (an omitted or undefined React prop counts as unset), and later calls merge with earlier ones. The registry is live: mounted elements re-render when the defaults change, which makes runtime language switching a single texts call. An object prop such as texts is stored whole and merged key by key with the built-in strings, so a partial translation keeps the English fallbacks.

Validation is fail-loud: an unknown tag or a prop that is not defaultable throws. The inner c-input the fields compose is not covered in this release — set the defaults on the field component you use. Try it live below: the demo fields follow the toggles, and the defaults are cleared again when you leave the page.`,
    },
    title: 'App-wide prop defaults',
  },
  {
    blocks: forAll([
      {
        code: `@import 'tailwindcss';

/* Token definitions (required) + the @theme mapping onto them. */
@import '@cscfi/csc-ui/css/tokens.css';
@import '@cscfi/csc-ui/css/tailwind-theme.css';`,
        filename: 'app.css',
        lang: 'css',
      },
      {
        code: `<!-- Semantic utilities follow theme mode and brand seeds automatically. -->
<div class="rounded-lg border border-border bg-surface-raised p-4 text-on-surface">
  <h2 class="text-on-surface">Card title</h2>
  <p class="text-on-surface-muted">Body copy.</p>
</div>`,
        lang: 'html',
      },
    ]),
    id: 'tailwind',
    intro: {
      all: `If your app uses Tailwind v4, the library ships its semantic roles as a Tailwind theme export: @cscfi/csc-ui/css/tailwind-theme.css. It is a Tailwind v4 @theme mapping, not a standalone stylesheet — it maps utility names onto the --c-* custom properties, so it must be paired with tokens.css (which you are already loading for the components).

Only the semantic roles are exported, by design: raw palette-step utilities would resolve to the same colour in both modes and silently break dark mode. If you genuinely need a raw step, reference its custom property (var(--c-primary-600)) directly — it reads as the escape hatch it is. To drop Tailwind's own default palette and keep the design-system roles only, reset it with --color-*: initial in your own @theme block.`,
    },
    title: 'Tailwind theme export',
  },
];

/* ---------------------------------------------------------------------------
 * Semantic token reference data (rendered as tables by the page template).
 * Source of truth: csc-ui src/styles/css/tokens.css — the light/dark
 * columns name the palette step each token resolves to per mode.
 * The nav-* and logo-* roles are library chrome, intentionally not listed.
 * ------------------------------------------------------------------------ */

export interface TokenGroup {
  heading: string;
  note?: string;
  rows: TokenRow[];
}

export interface TokenRow {
  dark: string;
  light: string;
  purpose: string;
  /** Token name without the --c- prefix (the template prepends it). */
  token: string;
}

export const TOKEN_GROUPS: TokenGroup[] = [
  {
    heading: 'Surface ladder',
    rows: [
      {
        dark: 'slate-800',
        light: 'white',
        purpose: 'Default page and app background.',
        token: 'surface',
      },
      {
        dark: 'slate-800',
        light: 'white',
        purpose: 'Cards and other blocks lifted off the page.',
        token: 'surface-raised',
      },
      {
        dark: 'slate-700',
        light: 'white',
        purpose: 'Floating layers: menus, popovers, modals.',
        token: 'surface-overlay',
      },
      {
        dark: 'slate-850',
        light: 'tertiary-100',
        purpose: 'Subdued fills: wells, code captions, table stripes.',
        token: 'surface-muted',
      },
      {
        dark: 'slate-900',
        light: 'primary-100',
        purpose: 'Recessed areas set below the page.',
        token: 'surface-sunken',
      },
    ],
  },
  {
    heading: 'Foregrounds',
    rows: [
      {
        dark: 'slate-100',
        light: 'primary-900',
        purpose: 'Default body text and icons.',
        token: 'on-surface',
      },
      {
        dark: 'slate-300',
        light: 'tertiary-500',
        purpose: 'Secondary text.',
        token: 'on-surface-muted',
      },
      {
        dark: 'slate-400',
        light: 'tertiary-500',
        purpose: 'Hints, captions, and de-emphasized labels.',
        token: 'on-surface-faint',
      },
      {
        dark: 'slate-500',
        light: 'tertiary-300',
        purpose: 'Text of disabled options and days.',
        token: 'on-surface-disabled',
      },
      {
        dark: 'slate-100',
        light: 'primary-700',
        purpose: 'Text on the sunken surface.',
        token: 'on-surface-sunken',
      },
    ],
  },
  {
    heading: 'Border & focus',
    rows: [
      {
        dark: 'slate-700',
        light: 'tertiary-200',
        purpose:
          'Opaque edges for frames that have another cue: card frames, toolbar edge, table grid lines.',
        token: 'border',
      },
      {
        dark: 'white @ 12%',
        light: 'black @ 12%',
        purpose:
          'Translucent hairline ink: separators and load-bearing control frames; reads on every surface.',
        token: 'divider',
      },
      {
        dark: 'slate-400',
        light: 'tertiary-600',
        purpose: 'Emphasized borders, e.g. resting form-field outlines.',
        token: 'border-strong',
      },
      {
        dark: 'accent-400',
        light: 'primary-500',
        purpose: 'Keyboard focus ring.',
        token: 'ring',
      },
    ],
  },
  {
    heading: 'Inverse & scrim',
    note: 'Mode-invariant: these resolve to the same value in light and dark.',
    rows: [
      {
        dark: 'white',
        light: 'white',
        purpose: 'Surface for inverted component variants.',
        token: 'inverse-surface',
      },
      {
        dark: 'white',
        light: 'white',
        purpose: 'Foreground on inverted variants.',
        token: 'inverse-on',
      },
      {
        dark: 'primary-600',
        light: 'primary-600',
        purpose: 'Primary role inside inverted variants.',
        token: 'inverse-primary',
      },
      {
        dark: 'error-600',
        light: 'error-600',
        purpose: 'Error role inside inverted variants.',
        token: 'inverse-error',
      },
      {
        dark: 'black',
        light: 'black',
        purpose: 'Backdrop behind modal layers (applied with opacity).',
        token: 'scrim',
      },
    ],
  },
];

/** The eight themable chromatic families. */
export const ROLE_FAMILIES = [
  'primary',
  'secondary',
  'accent',
  'success',
  'info',
  'warning',
  'error',
  'link',
] as const;

/**
 * Every role family exposes the same six tokens. The step each one resolves
 * to is hand-tuned per family and mode (not uniform — e.g. dark primary uses
 * step 400 where the other families use 300, and link borrows accent steps
 * for its hovers), so the matrix below shows live values instead of a
 * hand-written step table.
 */
export const ROLE_SEXTET: { pattern: string; purpose: string }[] = [
  { pattern: '<role>', purpose: 'The solid role colour.' },
  { pattern: '<role>-hover', purpose: 'Hover state of the solid colour.' },
  { pattern: 'on-<role>', purpose: 'Text and icons on the solid colour.' },
  { pattern: '<role>-subtle', purpose: 'Tinted background fill.' },
  {
    pattern: '<role>-subtle-hover',
    purpose: 'Hover state of the tinted fill.',
  },
  {
    pattern: 'on-<role>-subtle',
    purpose: 'Text and icons on the tinted fill.',
  },
];

/**
 * Tokens per family for the live swatch matrix, in ROLE_SEXTET order.
 * (Kept as a helper here so the page template stays markup-only.)
 */
export const roleTokens = (family: string): string[] => [
  family,
  `${family}-hover`,
  `on-${family}`,
  `${family}-subtle`,
  `${family}-subtle-hover`,
  `on-${family}-subtle`,
];
