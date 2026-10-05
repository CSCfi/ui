import fs from 'node:fs';
import path from 'node:path';

/**
 * Guard for focus rings that never paint (Tailwind v4).
 *
 * `outline-none` (and `outline-hidden`) set `--tw-outline-style: none` as well
 * as `outline-style: none`, and the width utilities (`outline`, `outline-2`)
 * take their style from that variable. So `outline-none
 * focus-visible:outline-2` computes a 2px ring of style `none`: the selector
 * matches, the colour and width are there, and nothing is drawn. The ring
 * needs its style restated under the same variant:
 * `focus-visible:outline-2 focus-visible:outline-solid`.
 *
 * Flags a class string holding `outline-none`/`outline-hidden` (bare or under
 * a variant) and a `<variant>:outline[-<width>]` with no
 * `<variant>:outline-<style>` beside it. Comments are stripped first, with
 * newlines kept so the reported line numbers stay true. Always strict.
 */

const ROOTS = [
  path.resolve(import.meta.dirname, '../src/components'),
  path.resolve(import.meta.dirname, '../src/shared'),
];

const SUPPRESSES = /(?:^|:)outline-(?:none|hidden)$/;

const WIDTH = /^(.+:)outline(?:-\d+)?$/;

const STYLE = /^(.+:)outline-(?:solid|dashed|dotted|double)$/;

/** Blank out comments, preserving newlines so reported line numbers stay true. */
const stripComments = (src) =>
  src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(
      /(^|[^:])\/\/[^\n]*/g,
      (m, p1) => p1 + ' '.repeat(m.length - p1.length),
    );

const vueFiles = ROOTS.flatMap((root) =>
  fs
    .readdirSync(root, { recursive: true })
    .filter((f) => typeof f === 'string' && f.endsWith('.vue'))
    .map((f) => path.join(root, f)),
).sort();

let hitCount = 0;

for (const file of vueFiles) {
  const src = stripComments(fs.readFileSync(file, 'utf8'));

  const rel = path.relative(path.resolve(import.meta.dirname, '..'), file);

  // Class strings: tv slots in single quotes, template attributes in double.
  for (const match of src.matchAll(/'[^'\n]*'|"[^"]*"/g)) {
    const tokens = match[0].slice(1, -1).split(/\s+/);

    if (!tokens.some((t) => SUPPRESSES.test(t))) continue;

    const styled = new Set(
      tokens.map((t) => STYLE.exec(t)?.[1]).filter(Boolean),
    );

    const unpainted = tokens.filter((t) => {
      const variant = WIDTH.exec(t)?.[1];

      return variant && !styled.has(variant);
    });

    if (unpainted.length === 0) continue;

    const line = src.slice(0, match.index).split('\n').length;

    hitCount += unpainted.length;
    console.log(
      `${rel}:${line}: ${unpainted.join(' ')} without ${unpainted
        .map((t) => `${WIDTH.exec(t)[1]}outline-solid`)
        .join(' ')}`,
    );
  }
}

if (hitCount === 0) {
  console.log(
    `✓ every focus ring in ${vueFiles.length} SFCs restates its outline style.`,
  );
} else {
  console.error(
    `✗ ${hitCount} focus ring${hitCount === 1 ? '' : 's'} would never paint: outline-none zeroes the style the width utility reads.`,
  );
  process.exit(1);
}
