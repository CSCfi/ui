import type { Flavor } from '~/composables/useFlavor';

/**
 * Customization page content, one block set per flavor. Kept as
 * data so the page can prerender-highlight every flavor and swap client-side.
 *
 * This page is the single source of truth for the four consumer customization
 * surfaces: seed theming, dark mode / semantic tokens, ::part() restyling,
 * and the Tailwind theme export.
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
  intro: Partial<Record<Flavor | 'all', string>>;
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

export const CUSTOMIZATION_SECTIONS: CustomizationSection[] = [
  {
    id: 'overview',
    title: 'Two axes of customization',
    intro: {
      all: `Customization splits along two independent axes.

Colours flow through the design tokens: you hand the library one seed colour per family, it regenerates the full palette ramp, and every semantic token — in both light and dark mode — follows automatically. You never restyle a component's colours directly.

Structure flows through named parts: each component exposes a curated set of ::part() regions (root, content, …), and that part set is the component's customization contract.

Per-component CSS custom properties like --c-button-background-color do not exist in this library — if you are upgrading from @cscfi/csc-ui, see the migration guide.`,
    },
    blocks: forAll([]),
  },
  {
    id: 'brand-theming',
    title: 'Re-brand with theme seeds',
    intro: {
      all: `applyTheme takes one step-500 seed colour per family and regenerates that family's whole 50–950 ramp (an OKLCH perceptual curve, anchored so step 500 reproduces your seed exactly). Because the semantic tokens resolve through the ramp, a single seed re-brands every component in both theme modes.

The eight chromatic families are themable: primary, secondary, accent, success, info, warning, error, and link. The neutrals and the semantic role→step mappings are hand-tuned for WCAG AA contrast and deliberately not overridable.

Validation is fail-loud: an unknown family name or an unparseable colour throws, so a typo cannot silently ship the default brand. Try it live below — the playground re-seeds this whole site.`,
      react: `applyTheme takes one step-500 seed colour per family and regenerates that family's whole 50–950 ramp (an OKLCH perceptual curve, anchored so step 500 reproduces your seed exactly). Because the semantic tokens resolve through the ramp, a single seed re-brands every component in both theme modes. The theming functions are re-exported from @cscfi/csc-ui-react, so one import source covers components and theming alike.

The eight chromatic families are themable: primary, secondary, accent, success, info, warning, error, and link. The neutrals and the semantic role→step mappings are hand-tuned for WCAG AA contrast and deliberately not overridable.

Validation is fail-loud: an unknown family name or an unparseable colour throws, so a typo cannot silently ship the default brand. Try it live below — the playground re-seeds this whole site.`,
    },
    blocks: {
      vue: [{ lang: 'ts', code: themingCode('@cscfi/csc-ui') }],
      react: [{ lang: 'ts', code: themingCode('@cscfi/csc-ui-react') }],
      angular: [{ lang: 'ts', code: themingCode('@cscfi/csc-ui') }],
      typescript: [{ lang: 'ts', code: themingCode('@cscfi/csc-ui') }],
    },
  },
  {
    id: 'ssr-fouc',
    title: 'Server rendering & first paint',
    intro: {
      vue: `applyTheme needs a DOM, so on the server — and to avoid a flash of the default brand before your first client-side call — use themeToCss instead. It is a pure function that returns a :root { … } rule as a string, safe to render into <head> during SSR. In Nuxt, inject it with useHead.`,
      react: `applyTheme needs a DOM, so on the server — and to avoid a flash of the default brand before your first client-side call — use themeToCss instead. It is a pure function that returns a :root { … } rule as a string, safe to render into <head> during SSR. In Next.js, render it as a <style> in the root layout.`,
      angular: `applyTheme needs a DOM, so to avoid a flash of the default brand make the theme apply before the app bootstraps. themeToCss is a pure function that returns a :root { … } rule as a string — append it as a <style> in main.ts before bootstrapApplication.`,
      typescript: `To avoid a flash of the default brand, apply the theme before anything renders — call applyTheme at the top of your entry module, before defineCustomElements. For a fully static page, themeToCss returns the same override as a :root { … } CSS string you can paste into a <style> in your HTML.`,
    },
    blocks: {
      vue: [
        {
          filename: 'app.vue',
          lang: 'ts',
          code: `import { themeToCss } from '@cscfi/csc-ui';

// Rendered into <head> at SSR time — the brand is right on first paint.
useHead({
  style: [{ innerHTML: themeToCss({ primary: '#006efd' }) }],
});`,
        },
      ],
      react: [
        {
          filename: 'app/layout.tsx',
          lang: 'tsx',
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
        },
      ],
      angular: [
        {
          filename: 'main.ts',
          lang: 'ts',
          code: `import { bootstrapApplication } from '@angular/platform-browser';
import { themeToCss } from '@cscfi/csc-ui';

import { AppComponent } from './app/app.component';

// Applied before bootstrap — the brand is right on first paint.
const style = document.createElement('style');
style.textContent = themeToCss({ primary: '#006efd' });
document.head.append(style);

bootstrapApplication(AppComponent);`,
        },
      ],
      typescript: [
        {
          filename: 'main.ts',
          lang: 'ts',
          code: `import { applyTheme, defineCustomElements } from '@cscfi/csc-ui';

// Before the elements register and render — no flash of the default brand.
applyTheme({ primary: '#006efd' });

defineCustomElements();`,
        },
      ],
    },
  },
  {
    id: 'dark-mode',
    title: 'Dark mode',
    intro: {
      all: `Components follow the OS light/dark preference by default. To pin a mode explicitly, set data-theme="light" or "dark" on <html> — the explicit attribute always wins over the OS preference; removing it goes back to following the OS.

The switching happens in the semantic-token layer: every role token (surface, on-surface, border, …) resolves to a different palette step per mode, so components and any UI you build on the tokens flip together. Seeds and modes compose — a re-branded ramp feeds both modes, so applyTheme needs no dark-mode variant.`,
    },
    blocks: forAll([
      {
        lang: 'html',
        code: `<!-- Pin a mode for the whole app; unset = follow the OS preference. -->
<html data-theme="dark">`,
      },
      {
        filename: 'Runtime toggle with a stored choice',
        lang: 'ts',
        code: `const setMode = (mode: 'light' | 'dark' | 'system') => {
  if (mode === 'system') {
    document.documentElement.removeAttribute('data-theme');
    localStorage.removeItem('theme');
  } else {
    document.documentElement.dataset.theme = mode;
    localStorage.setItem('theme', mode);
  }
};`,
      },
      {
        filename: 'index.html — restore the choice before first paint',
        lang: 'html',
        code: `<script>
  // Inline in <head>, so a stored mode applies before anything renders.
  const theme = localStorage.getItem('theme');
  if (theme === 'light' || theme === 'dark') {
    document.documentElement.dataset.theme = theme;
  }
</script>`,
      },
    ]),
  },
  {
    id: 'tokens',
    title: 'Semantic token reference',
    intro: {
      all: `The semantic tokens are the palette every component authors against — and the vocabulary your own UI can share. In CSS they are custom properties with a --c- prefix (var(--c-surface)); through the Tailwind theme export the same roles appear as unprefixed colour utilities.

Each token resolves to a different palette step per theme mode, and the steps themselves regenerate when you seed a family — so anything built on these tokens follows both the mode and the brand automatically. The swatches below are live: flip the theme toggle or use the playground above and watch them move.`,
    },
    blocks: forAll([]),
  },
  {
    id: 'parts',
    title: 'Restyle with ::part()',
    intro: {
      all: `For anything beyond colours — spacing, radii, typography, layout — target a component's named parts with the CSS ::part() selector. The parts a component exposes are a curated contract: each component page lists them in its "CSS parts" table, and those names are stable API.

Parts reach through the shadow boundary, so ordinary stylesheet rules work; there is nothing to configure. Keep colours inside part rules on the design tokens so your overrides still follow theme mode and brand seeds. Parts nested in inner components are forwarded on demand under a <child>-<part> naming convention — if a region you need is missing, request a part rather than working around the shadow root.`,
    },
    blocks: forAll([
      {
        lang: 'css',
        code: `/* Restyle via named parts; keep colours on the tokens. */
c-button::part(root) {
  border-radius: 4px;
  background: var(--c-primary);
}

c-button::part(root):hover {
  background: var(--c-primary-hover);
}`,
      },
    ]),
  },
  {
    id: 'tailwind',
    title: 'Tailwind theme export',
    intro: {
      all: `If your app uses Tailwind v4, the library ships its semantic roles as a Tailwind theme export: @cscfi/csc-ui/css/tailwind-theme.css. It is a Tailwind v4 @theme mapping, not a standalone stylesheet — it maps utility names onto the --c-* custom properties, so it must be paired with tokens.css (which you are already loading for the components).

Only the semantic roles are exported, by design: raw palette-step utilities would resolve to the same colour in both modes and silently break dark mode. If you genuinely need a raw step, reference its custom property (var(--c-primary-600)) directly — it reads as the escape hatch it is. To drop Tailwind's own default palette and keep the design-system roles only, reset it with --color-*: initial in your own @theme block.`,
    },
    blocks: forAll([
      {
        filename: 'app.css',
        lang: 'css',
        code: `@import 'tailwindcss';

/* Token definitions (required) + the @theme mapping onto them. */
@import '@cscfi/csc-ui/css/tokens.css';
@import '@cscfi/csc-ui/css/tailwind-theme.css';`,
      },
      {
        lang: 'html',
        code: `<!-- Semantic utilities follow theme mode and brand seeds automatically. -->
<div class="rounded-lg border border-border bg-surface-raised p-4 text-on-surface">
  <h2 class="text-on-surface">Card title</h2>
  <p class="text-on-surface-muted">Body copy.</p>
</div>`,
      },
    ]),
  },
];

/* ---------------------------------------------------------------------------
 * Semantic token reference data (rendered as tables by the page template).
 * Source of truth: csc-ui src/styles/css/tokens.css — the light/dark
 * columns name the palette step each token resolves to per mode.
 * The nav-* and logo-* roles are library chrome, intentionally not listed.
 * ------------------------------------------------------------------------ */

export interface TokenRow {
  /** Token name without the --c- prefix (the template prepends it). */
  token: string;
  light: string;
  dark: string;
  purpose: string;
}

export interface TokenGroup {
  heading: string;
  note?: string;
  rows: TokenRow[];
}

export const TOKEN_GROUPS: TokenGroup[] = [
  {
    heading: 'Surface ladder',
    rows: [
      {
        token: 'surface',
        light: 'white',
        dark: 'slate-900',
        purpose: 'Default page and app background.',
      },
      {
        token: 'surface-raised',
        light: 'white',
        dark: 'slate-900',
        purpose: 'Cards and other blocks lifted off the page.',
      },
      {
        token: 'surface-overlay',
        light: 'white',
        dark: 'slate-800',
        purpose: 'Floating layers: menus, popovers, modals.',
      },
      {
        token: 'surface-muted',
        light: 'tertiary-100',
        dark: 'slate-800',
        purpose: 'Subdued fills: wells, code captions, table stripes.',
      },
      {
        token: 'surface-sunken',
        light: 'primary-100',
        dark: 'slate-950',
        purpose: 'Recessed areas set below the page.',
      },
    ],
  },
  {
    heading: 'Foregrounds',
    rows: [
      {
        token: 'on-surface',
        light: 'primary-900',
        dark: 'white',
        purpose: 'Default body text and icons.',
      },
      {
        token: 'on-surface-muted',
        light: 'tertiary-500',
        dark: 'slate-100',
        purpose: 'Secondary text.',
      },
      {
        token: 'on-surface-faint',
        light: 'tertiary-500',
        dark: 'slate-400',
        purpose: 'Hints, captions, and de-emphasized labels.',
      },
      {
        token: 'on-surface-sunken',
        light: 'primary-700',
        dark: 'primary-200',
        purpose: 'Text on the sunken surface.',
      },
    ],
  },
  {
    heading: 'Border & focus',
    rows: [
      {
        token: 'border',
        light: 'tertiary-200',
        dark: 'slate-700',
        purpose: 'Default hairline borders and dividers.',
      },
      {
        token: 'border-strong',
        light: 'tertiary-600',
        dark: 'slate-400',
        purpose: 'Emphasized borders, e.g. resting form-field outlines.',
      },
      {
        token: 'ring',
        light: 'primary-500',
        dark: 'primary-400',
        purpose: 'Keyboard focus ring.',
      },
    ],
  },
  {
    heading: 'Inverse & scrim',
    note: 'Mode-invariant: these resolve to the same value in light and dark.',
    rows: [
      {
        token: 'inverse-surface',
        light: 'white',
        dark: 'white',
        purpose: 'Surface for inverted component variants.',
      },
      {
        token: 'inverse-on',
        light: 'white',
        dark: 'white',
        purpose: 'Foreground on inverted variants.',
      },
      {
        token: 'inverse-primary',
        light: 'primary-600',
        dark: 'primary-600',
        purpose: 'Primary role inside inverted variants.',
      },
      {
        token: 'inverse-error',
        light: 'error-600',
        dark: 'error-600',
        purpose: 'Error role inside inverted variants.',
      },
      {
        token: 'scrim',
        light: 'black',
        dark: 'black',
        purpose: 'Backdrop behind modal layers (applied with opacity).',
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
