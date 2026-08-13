import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// The site is a pure consumer of the csc-ui build output: the Custom
// Elements Manifest (dist/custom-elements.json) for the API reference and
// dist/docs/<tag>/usage.md for the hand-written usage prose.
// Pages are prerendered (SSG); the custom elements themselves upgrade on the
// client via the csc-ui plugin.

// Composed children have no page of their own: redirect their old
// route to the parent page anchor. Derived from the manifest so the mapping has
// a single source of truth (the @subcomponents docblock tags).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let manifest: any;

try {
  manifest = JSON.parse(
    readFileSync(
      fileURLToPath(
        new URL('../csc-ui/dist/custom-elements.json', import.meta.url),
      ),
      'utf8',
    ),
  );
} catch {
  // The manifest is a csc-ui build artifact (dist/ is gitignored), so it
  // is absent on a fresh clone and until the sibling package is built. Config
  // load runs during `pnpm install` (postinstall: nuxt prepare) and on a cold
  // `nuxt dev`, both of which may precede that build — so fall back to an empty
  // manifest instead of crashing. Child redirects are skipped until the build
  // runs (the root `pnpm dev` regenerates the manifest before serving).
  console.warn(
    '[nuxt.config] csc-ui has not been built yet — skipping child-component route redirects. Run `pnpm --filter @cscfi/csc-ui docs:manifest` to populate them.',
  );
  manifest = { modules: [] };
}

// @vue/compiler-ssr cannot compile `v-model` on a custom element: once
// `isCustomElement` (below) classifies a c-* tag as an element, the SSR
// compiler throws "v-model can only be used on <input>, <textarea> and <select>
// elements." (the client compiler-dom handles it fine via vModelText). The
// interactive demos under app/examples are client-only anyway — ExampleBlock
// wraps them in <ClientOnly>, and the csc-ui elements upgrade only on the
// client — so resolve their SFCs to an empty module in the SSR build. The
// server never renders them, `isCustomElement` stays intact for the real c-*
// usage on pages, and the `?raw` source imports (code tabs, which DO render
// server-side) are left untouched because they carry a query string.
const stubExampleDemosInSsr: import('vite').Plugin = {
  enforce: 'pre',
  load(id) {
    if (id === '\0csc-example-demo-stub') return 'export default {}';

    return null;
  },
  name: 'csc-docs:stub-example-demos-in-ssr',
  resolveId(source, _importer, options) {
    if (options?.ssr && /\/examples\/[^?]+\.vue$/.test(source)) {
      return '\0csc-example-demo-stub';
    }

    return null;
  },
};

const childRedirects: Record<string, { redirect: string }> = {};

for (const module of manifest.modules ?? []) {
  for (const declaration of module.declarations ?? []) {
    const parent = declaration.tagName;

    for (const child of declaration.csc?.subcomponents ?? []) {
      childRedirects[`/components/${child}`] ??= {
        redirect: `/components/${parent}#${child}`,
      };
    }
  }
}

export default defineNuxtConfig({
  devServer: {
    port: 3500,
  },

  app: {
    head: {
      script: [
        {
          // Apply the stored theme before first paint (prerendered pages
          // default to the OS preference otherwise) — must stay in sync with
          // THEME_STORAGE_KEY in composables/useTheme.ts ('csc-ui-docs-theme';
          // this key drifted once and silently disabled theme restore on
          // reload, so initThemeFromStorage() now also re-applies as backup).
          innerHTML:
            "try{var t=localStorage.getItem('csc-ui-docs-theme');if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t)}catch(e){}",
          tagPriority: 'critical',
        },
      ],
      title: 'CSC Design System',
    },
  },
  compatibilityDate: '2026-07-01',
  css: [
    '@cscfi/csc-ui/css/tokens.css',
    '~/assets/tailwind.css',
    '~/assets/site.css',
  ],
  modules: ['@nuxt/eslint'],
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/'],
    },
  },
  routeRules: childRedirects,
  ssr: true,
  vite: {
    plugins: [stubExampleDemosInSsr, tailwindcss()],
    resolve: {
      alias: {
        // usage.md files are read from the sibling workspace package's build
        // output (import.meta.glob cannot traverse package "exports").
        '#library-docs': fileURLToPath(
          new URL('../csc-ui/dist/docs', import.meta.url),
        ),
      },
    },
  },
  vue: {
    compilerOptions: {
      // Every c-* tag is a csc-ui custom element, never a Vue component.
      isCustomElement: (tag) => tag.startsWith('c-'),
    },
  },
});
