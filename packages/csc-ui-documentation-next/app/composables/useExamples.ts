import type { Component } from 'vue';

/**
 * Examples live in app/examples/<tag>/<name>.vue — plain Vue SFCs that are
 * both rendered live (imported as components) and shown as code (raw import).
 * Vue is the canonical authoring format (ADR-0012).
 *
 * Other framework tabs come from sibling override files named
 * <name>.<framework>.<ext> (e.g. basic.react.tsx, basic.vanilla.ts) — these
 * are hand-written for now; a source-to-source transformer generating them
 * from the Vue canon is the planned next step and will slot in here as a
 * fallback when no override file exists.
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

export interface ExampleTab {
  code: string;
  label: string;
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
// dependencies, e.g. react, are deliberately not installed here); the header
// is tooling noise, not part of the sample.
const stripTsNocheck = (code: string) =>
  code.replace(/^\/\/ @ts-nocheck[^\n]*\n/, '');

export const useExamples = (tag: string): DocExample[] =>
  Object.keys(vueSources)
    .filter((path) => path.includes(`/examples/${tag}/`))
    .sort()
    .map((path) => {
      const name = path.replace(/^.*\//, '').replace(/\.vue$/, '');

      const overrides = Object.entries(overrideSources)
        .filter(([overridePath]) =>
          overridePath.includes(`/examples/${tag}/${name}.`),
        )
        .map(([overridePath, code]) => {
          const framework = overridePath
            .replace(/^.*\//, '')
            .split('.')[1] as string;

          return {
            code: stripTsNocheck(code),
            label: FRAMEWORK_LABELS[framework] ?? titleFromName(framework),
          };
        })
        .sort((a, b) => a.label.localeCompare(b.label));

      return {
        demo: defineAsyncComponent(
          demoModules[path] as () => Promise<Component>,
        ),
        name,
        tabs: [{ code: vueSources[path] ?? '', label: 'Vue' }, ...overrides],
        title: titleFromName(name),
      };
    });
