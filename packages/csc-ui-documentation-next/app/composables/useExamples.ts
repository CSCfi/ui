import type { Component } from 'vue';

import { FLAVORS, isFlavor, type Flavor } from './useFlavor';

/**
 * Examples live in app/examples/<tag>/<name>.vue — plain Vue SFCs that are
 * both rendered live (imported as components) and shown as code (raw import).
 * Vue is the canonical authoring format (ADR-0012).
 *
 * A parent page aggregates the whole family's examples: its own plus those of
 * its composed children (ADR-0013). Exact-duplicate code (the composite an
 * agent copied into both parent and child dirs) is shown once.
 *
 * Flavor tabs come from checked-in sibling variant files named
 * <name>.<flavor>.<ext> (basic.react.tsx, basic.angular.ts,
 * basic.typescript.ts) — generated from the Vue canon and kept complete by
 * scripts/check-example-parity.mjs (ADR-0020). The live demo is always the
 * Vue canon regardless of the selected flavor.
 */
// Live demo components. They are client-only (rendered inside <ClientOnly> in
// ExampleBlock, and the csc-ui elements only upgrade on the client). In the
// server build these SFCs are stubbed to an empty module by the
// `stub-example-demos-in-ssr` Vite plugin (nuxt.config.ts), because
// @vue/compiler-ssr cannot compile `v-model` on a custom element.
const demoModules = import.meta.glob('../examples/*/*.vue');

const vueSources = import.meta.glob('../examples/*/*.vue', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>;

const overrideSources = import.meta.glob(
  '../examples/*/*.*.{ts,tsx,js,jsx,html}',
  {
    eager: true,
    import: 'default',
    query: '?raw',
  },
) as Record<string, string>;

const EXT_LANG: Record<string, string> = {
  html: 'html',
  js: 'js',
  jsx: 'jsx',
  ts: 'ts',
  tsx: 'tsx',
};

const FLAVOR_ORDER = new Map(FLAVORS.map((flavor, index) => [flavor.id, index]));

const FLAVOR_LABEL = new Map(FLAVORS.map((flavor) => [flavor.id, flavor.label]));

export interface ExampleTab {
  code: string;
  flavor: Flavor;
  icon: string;
  label: string;
  lang: string;
}

export interface DocExample {
  demo: Component;
  name: string;
  tabs: ExampleTab[];
  title: string;
}

const titleFromName = (name: string) =>
  name.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase());

// Override samples carry a @ts-nocheck header so vue-tsc skips them (their
// deps, e.g. react, are deliberately not installed here); strip it for display.
const stripTsNocheck = (code: string) =>
  code.replace(/^\/\/ @ts-nocheck[^\n]*\n/, '');

const dirOf = (path: string) => path.split('/').at(-2) ?? '';

/**
 * Examples for a page group. Pass the resolved group tags (parent first, then
 * composed children); a standalone leaf passes just its own tag.
 */
export const useExamples = (tags: string[]): DocExample[] => {
  const [parent] = tags;

  const wanted = new Set(tags);

  const seenCode = new Set<string>();

  const examples: DocExample[] = [];

  const paths = Object.keys(vueSources)
    .filter((path) => wanted.has(dirOf(path)))
    // parent's own examples first, then children in group order, then by name
    .sort((a, b) => {
      const rank = (p: string) => tags.indexOf(dirOf(p));

      return rank(a) - rank(b) || a.localeCompare(b);
    });

  for (const path of paths) {
    const code = vueSources[path] ?? '';

    if (seenCode.has(code)) continue;
    seenCode.add(code);

    const owner = dirOf(path);

    const file = (path.split('/').at(-1) ?? '').replace(/\.vue$/, '');

    const overrides = Object.entries(overrideSources)
      .filter(([overridePath]) =>
        overridePath.startsWith(path.replace(/\.vue$/, '.')),
      )
      .flatMap(([overridePath, raw]) => {
        const parts = (overridePath.split('/').at(-1) ?? '').split('.');

        const flavor = parts[1] ?? '';

        // A sibling file outside the flavor set is a naming mistake, not a
        // tab — surface it in dev rather than rendering a bogus label.
        if (!isFlavor(flavor)) {
          if (import.meta.dev) {
            console.warn(`useExamples: unknown flavor variant ${overridePath}`);
          }

          return [];
        }

        const ext = parts.at(-1) ?? '';

        return [
          {
            code: stripTsNocheck(raw),
            flavor,
            label: FLAVOR_LABEL.get(flavor) ?? flavor,
            lang: EXT_LANG[ext] ?? 'text',
          },
        ];
      })
      .sort(
        (a, b) =>
          (FLAVOR_ORDER.get(a.flavor) ?? 99) - (FLAVOR_ORDER.get(b.flavor) ?? 99),
      );

    const friendly = titleFromName(file);

    examples.push({
      demo: defineAsyncComponent(demoModules[path] as () => Promise<Component>),
      name: `${owner}/${file}`,
      tabs: [
        { code, flavor: 'vue' as const, label: 'Vue', lang: 'vue' },
        ...overrides,
        ].map(tab => ({ ...tab, icon: ICONS[tab.flavor] })),
      // Mark which component a folded child's example focuses on.
      title: owner === parent ? friendly : `${friendly} · ${owner}`,
    });
  }

  return examples;
};
