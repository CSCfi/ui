import type { Flavor } from '~/composables/useFlavor';

/**
 * Getting-started page content, one block set per flavor. Kept as
 * data so the page can prerender-highlight every flavor and swap client-side.
 */
export interface GettingStartedBlock {
  code: string;
  filename?: string;
  lang: string;
}

export interface GettingStartedSection {
  blocks: Record<Flavor, GettingStartedBlock[]>;
  id: string;
  intro: Partial<Record<Flavor | 'all', string>>;
  /** Optional trailing cross-page link (intros are plain text). */
  link?: { label: string; to: string };
  title: string;
}

const forAll = (
  blocks: GettingStartedBlock[],
): Record<Flavor, GettingStartedBlock[]> => ({
  angular: blocks,
  react: blocks,
  typescript: blocks,
  vue: blocks,
});

export const GETTING_STARTED_SECTIONS: GettingStartedSection[] = [
  {
    id: 'install',
    title: 'Install',
    intro: {
      all: 'The core package ships the custom elements, their TypeScript types, and the design tokens.',
      react:
        'React uses the core package plus @cscfi/csc-ui-next-react — typed React components generated from the same source (one per element).',
    },
    blocks: {
      vue: [{ code: 'pnpm add @cscfi/csc-ui-next', lang: 'bash' }],
      react: [
        {
          code: 'pnpm add @cscfi/csc-ui-next @cscfi/csc-ui-next-react',
          lang: 'bash',
        },
      ],
      angular: [{ code: 'pnpm add @cscfi/csc-ui-next', lang: 'bash' }],
      typescript: [{ code: 'pnpm add @cscfi/csc-ui-next', lang: 'bash' }],
    },
  },
  {
    id: 'setup',
    title: 'Set up',
    intro: {
      vue: 'Import the design tokens, register the elements once at startup, and tell Vue that c-* tags are custom elements (not Vue components).',
      react:
        'Import the design tokens once at startup. Importing anything from @cscfi/csc-ui-next-react registers the elements as a side effect.',
      angular:
        'Import the design tokens, register the elements once at startup, and allow custom elements in the components that use them.',
      typescript:
        'Import the design tokens and register the elements once at startup — after that, c-* tags work anywhere in your markup.',
    },
    blocks: {
      vue: [
        {
          filename: 'main.ts',
          lang: 'ts',
          code: `import '@cscfi/csc-ui-next/css/tokens.css';

import { createApp } from 'vue';
import { defineCustomElements } from '@cscfi/csc-ui-next';

import App from './App.vue';

defineCustomElements();

createApp(App).mount('#app');`,
        },
        {
          filename: 'vite.config.ts',
          lang: 'ts',
          code: `import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    vue({
      template: {
        // c-* tags are custom elements, not Vue components
        compilerOptions: { isCustomElement: (tag) => tag.startsWith('c-') },
      },
    }),
  ],
});`,
        },
      ],
      react: [
        {
          filename: 'main.tsx',
          lang: 'tsx',
          code: `import '@cscfi/csc-ui-next/css/tokens.css';

import { createRoot } from 'react-dom/client';

import { App } from './App';

createRoot(document.getElementById('root')!).render(<App />);`,
        },
      ],
      angular: [
        {
          filename: 'main.ts',
          lang: 'ts',
          code: `import '@cscfi/csc-ui-next/css/tokens.css';

import { bootstrapApplication } from '@angular/platform-browser';
import { defineCustomElements } from '@cscfi/csc-ui-next';

import { AppComponent } from './app/app.component';

defineCustomElements();

bootstrapApplication(AppComponent);`,
        },
      ],
      typescript: [
        {
          filename: 'main.ts',
          lang: 'ts',
          code: `import '@cscfi/csc-ui-next/css/tokens.css';

import { defineCustomElements } from '@cscfi/csc-ui-next';

defineCustomElements();`,
        },
      ],
    },
  },
  {
    id: 'first-component',
    title: 'Use a component',
    intro: {
      vue: 'The elements support plain v-model — no directives or wrappers needed.',
      react:
        'The generated components take props and on* event callbacks like any React component; event payloads arrive in event.detail.',
      angular:
        'Bind properties with [prop] and listen to the component events with (event); payloads arrive in $event.detail.',
      typescript:
        'The package augments HTMLElementTagNameMap, so document.createElement and querySelector return fully typed elements — props, methods, and addEventListener included.',
    },
    blocks: {
      vue: [
        {
          filename: 'App.vue',
          lang: 'vue',
          code: `<template>
  <c-button @click="count++">Clicked {{ count }} times</c-button>

  <c-switch v-model="enabled">Notifications</c-switch>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const count = ref(0);

const enabled = ref(false);
</script>`,
        },
      ],
      react: [
        {
          filename: 'App.tsx',
          lang: 'tsx',
          code: `import { useState } from 'react';
import { CButton, CSwitch } from '@cscfi/csc-ui-next-react';

export const App = () => {
  const [count, setCount] = useState(0);
  const [enabled, setEnabled] = useState(false);

  return (
    <>
      <CButton onClick={() => setCount(count + 1)}>
        Clicked {count} times
      </CButton>

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
          filename: 'app.component.ts',
          lang: 'ts',
          code: `import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: \`
    <c-button (click)="count.set(count() + 1)">
      Clicked {{ count() }} times
    </c-button>

    <c-switch [value]="enabled()" (changeValue)="enabled.set($any($event).detail)">
      Notifications
    </c-switch>
  \`,
})
export class AppComponent {
  count = signal(0);

  enabled = signal(false);
}`,
        },
      ],
      typescript: [
        {
          filename: 'main.ts',
          lang: 'ts',
          code: `const button = document.createElement('c-button');
button.textContent = 'Click me';
button.addEventListener('click', () => console.log('clicked'));

const toggle = document.createElement('c-switch');
toggle.textContent = 'Notifications';
toggle.addEventListener('changeValue', (event) => {
  // event.detail is typed from the component's event map
  console.log('switch value:', event.detail);
});

document.body.append(button, toggle);`,
        },
      ],
    },
  },
  {
    id: 'theming',
    title: 'Theming & dark mode',
    intro: {
      all: `Components follow the OS light/dark preference by default; set data-theme="light" or "dark" on <html> to pin a mode explicitly. To re-brand, hand applyTheme one seed colour per family you want to override — the full ramp and both modes regenerate from it.`,
    },
    link: {
      label: 'Customization guide — theming, dark mode, parts, Tailwind',
      to: '/customization',
    },
    blocks: forAll([
      {
        lang: 'ts',
        code: `import { applyTheme } from '@cscfi/csc-ui-next';

// Step-500 seed per family; ramps and dark mode derive from it.
applyTheme({ primary: '#006efd' });`,
      },
    ]),
  },
];
