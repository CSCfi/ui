import type { Flavor } from '~/composables/useFlavor';

/**
 * Upgrade-guide content for consumers moving an app from the Stencil-based
 * @cscfi/csc-ui 3.x line to the rewritten 4.x (same package name, ADR-0027).
 * Same data shape as the getting-started page: one block set per flavor so
 * the page can prerender-highlight every flavor and swap client-side.
 *
 * Note the vocabulary split (see CONTEXT.md): the maintainers "migrate"
 * components from Stencil to Vue; a consumer "upgrades" their dependency. The
 * page is titled "Migration guide" only because that is what consumers search
 * for — the body copy talks about upgrading.
 */
export interface MigrationBlock {
  code: string;
  filename?: string;
  lang: string;
}

export interface MigrationSection {
  blocks: Record<Flavor, MigrationBlock[]>;
  id: string;
  intro: Partial<Record<Flavor | 'all', string>>;
  /** Optional trailing cross-page link (intros are plain text). */
  link?: { label: string; to: string };
  title: string;
}

const forAll = (
  blocks: MigrationBlock[],
): Record<Flavor, MigrationBlock[]> => ({
  angular: blocks,
  react: blocks,
  typescript: blocks,
  vue: blocks,
});

export const MIGRATION_SECTIONS: MigrationSection[] = [
  {
    id: 'before-you-start',
    title: 'Before you start',
    intro: {
      all: `Version 4 is a complete rewrite of the library under the same package name: the tag names are stable — every <c-*> element keeps its name, so your existing markup mostly stays put. What changes is everything around the tags — how you register the library, how two-way binding and events work, how you customize and theme components.

This is an all-at-once upgrade. You cannot run 3.x and 4.x side by side: both register the same custom-element tags, and the second defineCustomElements() call throws a "already defined" error. Bump the whole dependency in one change rather than component by component.

@cscfi/csc-ui 4.x is ESM-only, so a bundler (Vite, webpack, etc.) is assumed.`,
    },
    blocks: forAll([]),
  },
  {
    id: 'packages',
    title: 'Update the packages',
    intro: {
      vue: 'Bump the core package to 4.x and remove the v-control directive package (@cscfi/csc-ui-vue, or @cscfi/csc-ui-vue2 on Vue 2) — the 4.x elements support plain v-model natively, so the directive is gone.',
      react:
        'Bump both packages to 4.x. The names are unchanged, but @cscfi/csc-ui-react is reimplemented (typed React components generated from the custom-elements manifest) and is now always released with the exact same version number as the core.',
      angular:
        'Bump the core package to 4.x. Angular consumes the custom elements natively — no wrapper package.',
      typescript:
        'Bump the core package to 4.x. TypeScript consumes the custom elements natively — no wrapper package.',
    },
    blocks: {
      vue: [
        {
          lang: 'bash',
          code: `pnpm remove @cscfi/csc-ui-vue
pnpm add @cscfi/csc-ui@^4`,
        },
      ],
      react: [
        {
          lang: 'bash',
          code: `pnpm add @cscfi/csc-ui@^4 @cscfi/csc-ui-react@^4`,
        },
      ],
      angular: [
        {
          lang: 'bash',
          code: `pnpm add @cscfi/csc-ui@^4`,
        },
      ],
      typescript: [
        {
          lang: 'bash',
          code: `pnpm add @cscfi/csc-ui@^4`,
        },
      ],
    },
  },
  {
    id: 'registration',
    title: 'Update registration & imports',
    intro: {
      vue: 'Drop applyPolyfills and the /loader subpath — 4.x exports defineCustomElements() directly and registers every element eagerly. Remove the v-control directive registration. Switch the CSS import to css/tokens.css.',
      react:
        'Drop applyPolyfills and the /loader subpath. With the React wrapper you no longer call defineCustomElements() yourself — importing anything from @cscfi/csc-ui-react registers the elements as a side effect. Switch the CSS import to css/tokens.css.',
      angular:
        'Drop applyPolyfills and the /loader subpath — 4.x exports defineCustomElements() directly. Switch the CSS import to css/tokens.css.',
      typescript:
        'Drop applyPolyfills and the /loader subpath — 4.x exports defineCustomElements() directly. Switch the CSS import to css/tokens.css.',
    },
    blocks: {
      vue: [
        {
          filename: 'Before — 3.x',
          lang: 'ts',
          code: `import '@cscfi/csc-ui/css/theme.css';

import { createApp } from 'vue';
import { applyPolyfills, defineCustomElements } from '@cscfi/csc-ui/loader';
import { vControl } from '@cscfi/csc-ui-vue';

import App from './App.vue';

const app = createApp(App);
app.directive('control', vControl);

applyPolyfills().then(() => defineCustomElements());

app.mount('#app');`,
        },
        {
          filename: 'After — 4.x',
          lang: 'ts',
          code: `import '@cscfi/csc-ui/css/tokens.css';

import { createApp } from 'vue';
import { defineCustomElements } from '@cscfi/csc-ui';

import App from './App.vue';

defineCustomElements();

createApp(App).mount('#app');`,
        },
      ],
      react: [
        {
          filename: 'Before — 3.x',
          lang: 'tsx',
          code: `import '@cscfi/csc-ui-react/css/theme.css';

import { createRoot } from 'react-dom/client';
import { applyPolyfills, defineCustomElements } from '@cscfi/csc-ui/loader';

import { App } from './App';

applyPolyfills().then(() => defineCustomElements());

createRoot(document.getElementById('root')!).render(<App />);`,
        },
        {
          filename: 'After — 4.x',
          lang: 'tsx',
          code: `import '@cscfi/csc-ui/css/tokens.css';

import { createRoot } from 'react-dom/client';

// Importing the wrapper registers the elements as a side effect.
import { App } from './App';

createRoot(document.getElementById('root')!).render(<App />);`,
        },
      ],
      angular: [
        {
          filename: 'Before — 3.x',
          lang: 'ts',
          code: `import '@cscfi/csc-ui/css/theme.css';

import { bootstrapApplication } from '@angular/platform-browser';
import { applyPolyfills, defineCustomElements } from '@cscfi/csc-ui/loader';

import { AppComponent } from './app/app.component';

applyPolyfills().then(() => defineCustomElements());

bootstrapApplication(AppComponent);`,
        },
        {
          filename: 'After — 4.x',
          lang: 'ts',
          code: `import '@cscfi/csc-ui/css/tokens.css';

import { bootstrapApplication } from '@angular/platform-browser';
import { defineCustomElements } from '@cscfi/csc-ui';

import { AppComponent } from './app/app.component';

defineCustomElements();

bootstrapApplication(AppComponent);`,
        },
      ],
      typescript: [
        {
          filename: 'Before — 3.x',
          lang: 'ts',
          code: `import '@cscfi/csc-ui/css/theme.css';
import { applyPolyfills, defineCustomElements } from '@cscfi/csc-ui/loader';

applyPolyfills().then(() => defineCustomElements());`,
        },
        {
          filename: 'After — 4.x',
          lang: 'ts',
          code: `import '@cscfi/csc-ui/css/tokens.css';
import { defineCustomElements } from '@cscfi/csc-ui';

defineCustomElements();`,
        },
      ],
    },
  },
  {
    id: 'binding-events',
    title: 'Two-way binding & events',
    intro: {
      vue: `The headline change for Vue. The v-control directive is gone — value components support plain v-model directly.

Use plain v-model (no argument): the elements ride the native input event, so v-model:value does not compile on a custom element and must not be used. For other two-way state, bind :prop and listen to the lowercase kebab-case @change:<prop> event (e.g. @change:open, @change:sort) — the old update:<prop> events were renamed because Vue silently drops update:*-prefixed listeners on custom elements.`,
      react: `The legacy changeValue event still fires, so existing onChangeValue handlers keep working. Prefer the typed on* props from @cscfi/csc-ui-react going forward. State-change events were renamed from update:<prop> to change:<prop>.`,
      angular: `The legacy changeValue event still fires, so existing (changeValue) handlers keep working. State-change events were renamed from update:<prop> to change:<prop> (e.g. (change:sort)).`,
      typescript: `The legacy changeValue event still fires, so existing addEventListener('changeValue', …) handlers keep working; the elements also dispatch a native input event. State-change events were renamed from update:<prop> to change:<prop>.`,
    },
    blocks: {
      vue: [
        {
          filename: 'Before — 3.x',
          lang: 'vue',
          code: `<template>
  <!-- v-control bridged Stencil's changeValue to v-model -->
  <c-text-field v-model="name" v-control label="Name" />
  <c-switch v-model="enabled" v-control>Notifications</c-switch>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const name = ref('');
const enabled = ref(false);
</script>`,
        },
        {
          filename: 'After — 4.x',
          lang: 'vue',
          code: `<template>
  <!-- plain v-model, no directive -->
  <c-text-field v-model="name" label="Name" />
  <c-switch v-model="enabled">Notifications</c-switch>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const name = ref('');
const enabled = ref(false);
</script>`,
        },
        {
          filename: 'Other two-way state — :prop + @change:prop',
          lang: 'vue',
          code: `<template>
  <!-- NOT v-model:open — bind the prop and listen to change:open -->
  <c-menu :open.prop="open" @change:open="open = $event.detail">
    <c-button slot="trigger">Menu</c-button>
    <c-menu-item>Profile</c-menu-item>
  </c-menu>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const open = ref(false);
</script>`,
        },
      ],
      react: [
        {
          filename: 'After — 4.x',
          lang: 'tsx',
          code: `import { useState } from 'react';
import { CTextField, CSwitch } from '@cscfi/csc-ui-react';

export const Form = () => {
  const [name, setName] = useState('');
  const [enabled, setEnabled] = useState(false);

  return (
    <>
      <CTextField
        label="Name"
        value={name}
        onChangeValue={(event) => setName(event.detail as string)}
      />
      <CSwitch
        value={enabled}
        onChangeValue={(event) => setEnabled(event.detail as boolean)}
      >
        Notifications
      </CSwitch>
    </>
  );
};`,
        },
      ],
      angular: [
        {
          filename: 'After — 4.x',
          lang: 'html',
          code: `<c-text-field
  label="Name"
  [value]="name()"
  (changeValue)="name.set($any($event).detail)"
></c-text-field>

<c-switch
  [value]="enabled()"
  (changeValue)="enabled.set($any($event).detail)"
>
  Notifications
</c-switch>`,
        },
      ],
      typescript: [
        {
          filename: 'After — 4.x',
          lang: 'ts',
          code: `const field = document.querySelector('c-text-field')!;

// changeValue still fires; a native input event fires too.
field.addEventListener('changeValue', (event) => {
  console.log('value:', event.detail);
});`,
        },
      ],
    },
  },
  {
    id: 'styling',
    title: 'Styling & customization',
    intro: {
      all: `Per-component CSS custom properties are gone. Variables like --c-button-background-color or --c-button-border-radius no longer exist; ::part() is now the sole customization API, and a component's curated part set is its customization contract.`,
    },
    link: {
      label: 'How ::part() restyling works',
      to: '/customization#parts',
    },
    blocks: forAll([
      {
        filename: 'Before — 3.x',
        lang: 'css',
        code: `c-button {
  --c-button-background-color: #006efd;
  --c-button-border-radius: 4px;
}`,
      },
      {
        filename: 'After — 4.x',
        lang: 'css',
        code: `c-button::part(root) {
  background: var(--c-primary);
  border-radius: 4px;
}`,
      },
    ]),
  },
  {
    id: 'theming',
    title: 'Theming & dark mode',
    intro: {
      all: `The flat, light-only ramp is replaced by a semantic-token layer with real dark-mode support. Components now follow the OS light/dark preference by default; set data-theme="light" or "dark" on <html> to pin a mode.

To re-brand, stop overriding individual --c-* ramp variables. Instead hand applyTheme one step-500 seed colour per family you want to override — the whole 50–950 ramp and both light and dark modes regenerate from it.`,
    },
    link: {
      label: 'Full theming & dark-mode guide',
      to: '/customization',
    },
    blocks: forAll([
      {
        filename: 'Before — 3.x',
        lang: 'css',
        code: `:root {
  /* Override individual ramp steps; light mode only. */
  --c-primary-500: #006efd;
  --c-primary-600: #005fd6;
}`,
      },
      {
        filename: 'After — 4.x',
        lang: 'ts',
        code: `import { applyTheme } from '@cscfi/csc-ui';

// One step-500 seed per family; ramps and dark mode derive from it.
applyTheme({ primary: '#006efd' });`,
      },
    ]),
  },
  {
    id: 'components',
    title: 'Component-specific changes',
    intro: {
      all: `Most components keep their old props and events. The ones below changed enough to need attention when you upgrade.`,
    },
    blocks: forAll([
      {
        filename: 'c-data-table — headers → columns',
        lang: 'ts',
        code: `// Before: headers[] describe columns; data cells are wrapped objects.
// After:  columns[] describe columns; data is plain domain objects and
//         custom cells are render functions (h is re-exported by the package).
import { h, type CDataTableColumn } from '@cscfi/csc-ui';

interface User { id: number; name: string; }

const columns: CDataTableColumn<User>[] = [
  { key: 'name', value: 'Name' },
  { key: 'id', value: 'ID', cell: (ctx) => h('code', String(ctx.value)) },
];

// The columns prop holds functions — bind it as a DOM property (:columns.prop
// in Vue, [columns] in Angular), never as an attribute.`,
      },
      {
        filename: 'c-data-table — pinned / hidden → expansion policy',
        lang: 'ts',
        code: `// Old two-boolean shape collapses into one tri-state axis:
//   pinned: true  (exempt from autohide)  -> policy: 'never'
//   hidden: true                          -> policy: 'always'
//   (default)                             -> policy: 'auto'
// "pinned" now means TanStack-style edge-sticky during horizontal scroll.`,
      },
      {
        filename: 'c-tab-buttons — standalone use moves to c-button-group',
        lang: 'html',
        code: `<!-- Before: c-tab-buttons doubled as a standalone segmented value picker. -->
<c-tab-buttons value="week" mandatory>
  <c-button value="day">Day</c-button>
  <c-button value="week">Week</c-button>
</c-tab-buttons>

<!-- After: same markup on the new c-button-group tag. c-tab-buttons now
     exists only as the tab-strip adapter inside <c-tabs> (where nothing
     changes for you). Differences on the new tag:
     - events are change / update:value / native input — there is no
       changeValue; deselecting emits null (was '')
     - new: label + required, and a multiple mode (array value) -->
<c-button-group value="week" mandatory>
  <c-button value="day">Day</c-button>
  <c-button value="week">Week</c-button>
</c-button-group>`,
      },
      {
        filename: 'Form controls — validation → error-message',
        lang: 'html',
        code: `<!-- Before: every form control had validation (default 'Required field')
     shown while valid was false, plus inert validate / validate-on-blur. -->
<c-text-field label="Email" validation="Email is required"></c-text-field>

<!-- After: the prop is error-message (errorMessage in React / as a DOM
     property) on c-text-field, c-select, c-autocomplete, c-checkbox,
     c-radio-group, c-otp-input and c-message. There is NO default text:
     an invalid control without an error-message keeps showing its hint,
     styled as a hint. validate and validate-on-blur are removed — they
     were never wired to anything; validation logic stays in your app. -->
<c-text-field label="Email" error-message="Email is required"></c-text-field>`,
      },
      {
        filename: 'Other components',
        lang: 'md',
        code: `- c-autocomplete: no longer built on c-dropdown; it renders its own popover
  panel with an internal search input. Option/value events are unchanged, but
  the 3.x query API is not: the query prop, the changeQuery event and the
  minimum-query-length / minimum-query-length-message props are removed. For
  an async data source, set external and listen to change:query (detail: the
  query string) — see the c-autocomplete external example. A custom match is
  the filter prop; no-matching-items-message is now no-results-text.
- c-modal: no native top layer / ::backdrop. New vocabulary — the scrim token
  and a dismissable prop (governs both backdrop-click and Escape).
- c-menu: authored declaratively with slotted c-menu-item / c-menu-label
  instead of a programmatic items array; leaf activation fires a select event.
- c-swiper / c-swiper-tab: removed, no replacement.
- c-row: removed — use your own flex container (display: flex plus gap).
- c-spacer: removed — use margin-inline-start: auto on the element you want
  pushed to the far edge, or your own flex-grow filler.
  c-backdrop / c-ripple were internal-only and are not part of the public API.`,
      },
    ]),
  },
  {
    id: 'tooling',
    title: 'Types & IDE tooling',
    intro: {
      all: `Public TypeScript types are now exported from the package root using the C<Component><Concept> convention — e.g. CButtonSize, CAlertType, CSelectItem. Import them from @cscfi/csc-ui instead of deep paths.

IDE integration data changed too: the library now ships a Custom Elements Manifest (custom-elements.json) plus web-types.json and VS Code custom-data files, replacing the old docs.json / vscode-data.json.`,
    },
    blocks: forAll([
      {
        lang: 'ts',
        code: `import type { CButtonSize, CSelectItem } from '@cscfi/csc-ui';`,
      },
    ]),
  },
];
