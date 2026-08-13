// Runtime consumer theming API.
//
// A consumer supplies just the step-500 *seed* for the chromatic families they
// want to rebrand; the full 50–950 ramp (+ rgb triple) is regenerated with the
// same core the build uses, and written as `--c-*` custom properties. Because
// tokens.css declares those at the document `:root` and the shadow-adopted
// Tailwind sheet resolves them by inheritance, overriding them re-themes every
// component in both light and dark mode — semantic tokens re-resolve for free.

import { FAMILIES, familyVars } from './ramp.js';

export type { Family } from './ramp.js';
import type { Family } from './ramp.js';

/** A partial map of chromatic family → step-500 seed color. */
export type ThemeSeeds = Partial<Record<Family, string>>;

const isFamily = (key: string): key is Family =>
  (FAMILIES as readonly string[]).includes(key);

/**
 * Compute the full ramp for each supplied brand family and return them as a
 * `:root { … }` CSS string. Pure — no DOM access — so it is safe to run on the
 * server and inject into `<head>` for zero-flash theming. Returns `''` for an
 * empty seed set.
 */
export function themeToCss(seeds: ThemeSeeds): string {
  const vars = seedVars(seeds);

  const names = Object.keys(vars);

  if (!names.length) return '';

  const body = names.map((name) => `\t${name}: ${vars[name]};`).join('\n');

  return `:root {\n${body}\n}\n`;
}

/**
 * Build the `--c-*` custom properties for the given seeds. Throws on an unknown
 * family or an unparseable color — this is a developer-facing API, so fail loud.
 */
function seedVars(seeds: ThemeSeeds): Record<string, string> {
  const vars: Record<string, string> = {};

  for (const [family, seed] of Object.entries(seeds)) {
    if (seed == null) continue;

    if (!isFamily(family)) {
      throw new Error(
        `applyTheme: unknown family "${family}". ` +
          `Overridable families: ${FAMILIES.join(', ')}.`,
      );
    }

    // familyVars → ramp throws if the seed color can't be parsed.
    Object.assign(vars, familyVars(family, seed));
  }

  return vars;
}

/** Custom-property names this module has written to `documentElement`. */
const applied = new Set<string>();

/**
 * Apply consumer brand seeds at runtime: regenerate each family's full ramp and
 * set the `--c-*` custom properties as inline styles on `<html>`, so the
 * override wins over the imported tokens.css and inherits into every component's
 * shadow root. Merges with previously applied seeds. No-op outside the browser
 * (validation still runs, so bad input throws in any environment).
 */
export function applyTheme(seeds: ThemeSeeds): void {
  const vars = seedVars(seeds); // validate before touching the DOM

  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  for (const [name, value] of Object.entries(vars)) {
    root.style.setProperty(name, value);
    applied.add(name);
  }
}

/**
 * Remove custom properties previously set by {@link applyTheme}. With no
 * argument, clears every applied property (reverting to the tokens.css
 * defaults); pass families to clear only those.
 */
export function resetTheme(families?: Family[]): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  const prefixes = families?.map((family) => `--c-${family}-`);

  for (const name of [...applied]) {
    if (prefixes && !prefixes.some((prefix) => name.startsWith(prefix))) {
      continue;
    }

    root.style.removeProperty(name);
    applied.delete(name);
  }
}
