import { fileURLToPath } from 'node:url';

// The site is a pure consumer of the csc-ui-next build output: the Custom
// Elements Manifest (dist/custom-elements.json) for the API reference and
// dist/docs/<tag>/usage.md for the hand-written usage prose (ADR-0012).
// Pages are prerendered (SSG); the custom elements themselves upgrade on the
// client via the csc-ui plugin.
export default defineNuxtConfig({
  app: {
    head: {
      script: [
        {
          // Apply the stored theme before first paint (prerendered pages
          // default to the OS preference otherwise) — must stay in sync with
          // THEME_STORAGE_KEY in composables/useTheme.ts.
          innerHTML:
            "try{var t=localStorage.getItem('csc-docs-theme');if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t)}catch(e){}",
          tagPriority: 'critical',
        },
      ],
      title: 'CSC Design System',
    },
  },
  compatibilityDate: '2026-07-01',
  css: ['@cscfi/csc-ui-next/css/tokens.css', '~/assets/site.css'],
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/'],
    },
  },
  ssr: true,
  vite: {
    resolve: {
      alias: {
        // usage.md files are read from the sibling workspace package's build
        // output (import.meta.glob cannot traverse package "exports").
        '#library-docs': fileURLToPath(
          new URL('../csc-ui-next/dist/docs', import.meta.url),
        ),
      },
    },
  },
  vue: {
    compilerOptions: {
      // Every c-* tag is a csc-ui-next custom element, never a Vue component.
      isCustomElement: (tag) => tag.startsWith('c-'),
    },
  },
});
