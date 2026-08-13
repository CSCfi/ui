import type { Component } from 'vue';

import { FLAVORS, isFlavor, type Flavor } from './useFlavor';

/**
 * Examples live in app/examples/<tag>/<name>.vue — plain Vue SFCs that are
 * both rendered live (imported as components) and shown as code (raw import).
 * Vue is the canonical authoring format.
 *
 * A parent page aggregates the whole family's examples: its own plus those of
 * its composed children. Exact-duplicate code (the composite an
 * agent copied into both parent and child dirs) is shown once.
 *
 * Flavor tabs come from checked-in sibling variant files named
 * <name>.<flavor>.<ext> (basic.react.tsx, basic.angular.ts,
 * basic.typescript.html) — generated from the Vue canon and kept complete by
 * scripts/check-example-parity.mjs. The live demo is always the
 * Vue canon regardless of the selected flavor.
 *
 * The TypeScript flavor is two-part: a required markup fragment
 * (<name>.typescript.html) plus an optional querySelector-wiring script
 * (<name>.typescript.ts), rendered as stacked panes with Template/Script
 * chips. Other flavors are single-pane.
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

const FLAVOR_ORDER = new Map(
  FLAVORS.map((flavor, index) => [flavor.id, index]),
);

const FLAVOR_LABEL = new Map(
  FLAVORS.map((flavor) => [flavor.id, flavor.label]),
);

export interface ExamplePane {
  code: string;
  /** Chip label above the pane; only multi-pane flavors set it. */
  label?: string;
  lang: string;
}

export interface ExampleTab {
  flavor: Flavor;
  icon: string;
  label: string;
  panes: ExamplePane[];
}

export interface DocExample {
  demo: Component;
  name: string;
  tabs: ExampleTab[];
  title: string;
}

/**
 * Anchor id for an example block (`name` is `<owner-tag>/<file>`), shared by
 * the rendered figure and the "On this page" rail links.
 */
export const exampleAnchor = (name: string) =>
  `example-${name.replace('/', '-')}`;

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

    // Group sibling variant files by flavor: single-pane flavors have one
    // file; the TypeScript flavor pairs html (+ optional ts) into stacked
    // panes.
    const byFlavor = new Map<Flavor, { code: string; ext: string }[]>();

    for (const [overridePath, raw] of Object.entries(overrideSources)) {
      if (!overridePath.startsWith(path.replace(/\.vue$/, '.'))) continue;

      const parts = (overridePath.split('/').at(-1) ?? '').split('.');

      const flavor = parts[1] ?? '';

      // A sibling file outside the flavor set is a naming mistake, not a
      // tab — surface it in dev rather than rendering a bogus label.
      if (!isFlavor(flavor)) {
        if (import.meta.dev) {
          console.warn(`useExamples: unknown flavor variant ${overridePath}`);
        }

        continue;
      }

      const files = byFlavor.get(flavor) ?? [];

      files.push({ code: stripTsNocheck(raw), ext: parts.at(-1) ?? '' });
      byFlavor.set(flavor, files);
    }

    const overrides = [...byFlavor.entries()]
      .flatMap(([flavor, files]) => {
        let panes: ExamplePane[];

        if (flavor === 'typescript') {
          const markup = files.find((f) => f.ext === 'html');
          const script = files.find((f) => f.ext === 'ts');

          // The markup fragment is the variant's anchor; a lone script file
          // is a leftover from before the two-part format that the parity
          // check reports — skip the tab (the block falls back to the Vue
          // canon) rather than showing a script with no markup.
          if (!markup) {
            if (import.meta.dev) {
              console.warn(
                `useExamples: ${path} typescript variant lacks its .html markup part`,
              );
            }

            return [];
          }

          panes = [
            { code: markup.code, label: 'Template', lang: 'html' },
            ...(script
              ? [{ code: script.code, label: 'Script', lang: 'ts' }]
              : []),
          ];
        } else {
          panes = files.map(({ code, ext }) => ({
            code,
            lang: EXT_LANG[ext] ?? 'text',
          }));
        }

        return [
          {
            flavor,
            label: FLAVOR_LABEL.get(flavor) ?? flavor,
            panes,
          },
        ];
      })
      .sort(
        (a, b) =>
          (FLAVOR_ORDER.get(a.flavor) ?? 99) -
          (FLAVOR_ORDER.get(b.flavor) ?? 99),
      );

    const friendly = titleFromName(file);

    examples.push({
      demo: defineAsyncComponent(demoModules[path] as () => Promise<Component>),
      name: `${owner}/${file}`,
      tabs: [
        {
          flavor: 'vue' as const,
          label: 'Vue',
          panes: [{ code, lang: 'vue' }],
        },
        ...overrides,
      ].map((tab) => ({ ...tab, icon: ICONS[tab.flavor] })),
      // Mark which component a folded child's example focuses on.
      title: owner === parent ? friendly : `${friendly} · ${owner}`,
    });
  }

  return examples;
};
