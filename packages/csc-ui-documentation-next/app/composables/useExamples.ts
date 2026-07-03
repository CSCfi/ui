import type { Component } from 'vue';

/**
 * Examples live in app/examples/<tag>/<name>.vue — plain Vue SFCs that are
 * both rendered live (imported as components) and shown as code (raw import).
 * Vue is the canonical authoring format (ADR-0012).
 *
 * A parent page aggregates the whole family's examples: its own plus those of
 * its composed children (ADR-0013). Exact-duplicate code (the composite an
 * agent copied into both parent and child dirs) is shown once.
 *
 * Framework tabs come from sibling override files named
 * <name>.<framework>.<ext> (e.g. basic.react.tsx) — hand-written for now; a
 * source-to-source transformer from the Vue canon slots in here later.
 */
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

const FRAMEWORK_LABELS: Record<string, string> = {
  angular: 'Angular',
  html: 'HTML',
  react: 'React',
  vanilla: 'JavaScript',
};

const EXT_LANG: Record<string, string> = {
  html: 'html',
  js: 'js',
  jsx: 'jsx',
  ts: 'ts',
  tsx: 'tsx',
};

export interface ExampleTab {
  code: string;
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
      .map(([overridePath, raw]) => {
        const parts = (overridePath.split('/').at(-1) ?? '').split('.');

        const framework = parts[1] ?? '';

        const ext = parts.at(-1) ?? '';

        return {
          code: stripTsNocheck(raw),
          label: FRAMEWORK_LABELS[framework] ?? titleFromName(framework),
          lang: EXT_LANG[ext] ?? 'text',
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));

    const friendly = titleFromName(file);

    examples.push({
      demo: defineAsyncComponent(demoModules[path] as () => Promise<Component>),
      name: `${owner}/${file}`,
      tabs: [{ code, label: 'Vue', lang: 'vue' }, ...overrides],
      // Mark which component a folded child's example focuses on.
      title: owner === parent ? friendly : `${friendly} · ${owner}`,
    });
  }

  return examples;
};
