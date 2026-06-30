import fs from 'node:fs';
import path from 'node:path';

/**
 * Guard for the semantic-only authoring rule (ADR-0010, dark mode).
 *
 * Component SFCs must author colour through semantic tokens (bg-surface,
 * bg-primary, text-on-primary, …), never through palette-step utilities
 * (bg-primary-600, text-white, bg-tertiary-100, …). A palette step doesn't
 * flip between light and dark, so any that survives is a latent dark-mode bug.
 *
 * Forbidden = a colour utility (optionally variant-prefixed, optionally with an
 * /opacity modifier) whose colour is either:
 *   - a brand/status hue WITH a numeric step  (bg-primary-600, ring-tertiary-400)
 *   - white or black                          (text-white, bg-white/20)
 * Allowed = the bare semantic tokens (bg-primary, primary-hover, primary-subtle,
 * surface, on-primary, inverse-*, …) and current/transparent/inherit.
 *
 * Comments are stripped before scanning (newlines preserved for line numbers),
 * so explanatory comments that mention palette steps don't trip the guard.
 *
 * Default: report only, exit 0 (informational — doubles as the phase-5 worklist).
 * `--strict`: exit 1 if any violation is found (wire into CI once phase 5 lands).
 */

const ROOT = path.resolve(import.meta.dirname, '../src/components');
const STRICT = process.argv.includes('--strict');

const COLOR_PREFIXES = [
  'bg',
  'text',
  'border',
  'ring',
  'ring-offset',
  'fill',
  'stroke',
  'outline',
  'caret',
  'accent',
  'decoration',
  'divide',
  'from',
  'via',
  'to',
  'shadow',
];
const HUES = [
  'primary',
  'secondary',
  'accent',
  'tertiary',
  'success',
  'info',
  'warning',
  'error',
  'link',
];

const FORBIDDEN = new RegExp(
  `\\b(?:${COLOR_PREFIXES.join('|')})-(?:(?:${HUES.join('|')})-\\d+|white|black)(?:/\\d+)?\\b`,
  'g',
);

/** Blank out comments, preserving newlines so reported line numbers stay true. */
const stripComments = (src) =>
  src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, ' '))
    // line comments to EOL, but not the // in http:// (preceded by ':')
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) => p1 + ' '.repeat(m.length - p1.length));

const vueFiles = fs
  .readdirSync(ROOT, { recursive: true })
  .filter((f) => typeof f === 'string' && f.endsWith('.vue'))
  .map((f) => path.join(ROOT, f))
  .sort();

let fileCount = 0;
let hitCount = 0;

for (const file of vueFiles) {
  const lines = stripComments(fs.readFileSync(file, 'utf8')).split('\n');
  const hits = [];

  lines.forEach((line, i) => {
    const matches = line.match(FORBIDDEN);
    if (matches) hits.push({ line: i + 1, tokens: [...new Set(matches)] });
  });

  if (hits.length) {
    fileCount += 1;
    const rel = path.relative(path.resolve(import.meta.dirname, '..'), file);
    console.log(`\n${rel}`);
    for (const { line, tokens } of hits) {
      hitCount += tokens.length;
      console.log(`  ${line}: ${tokens.join(' ')}`);
    }
  }
}

console.log(
  `\n${hitCount} palette-step utilit${hitCount === 1 ? 'y' : 'ies'} in ${fileCount} of ${vueFiles.length} SFCs.`,
);

if (hitCount === 0) {
  console.log('✓ all SFCs are semantic-only.');
} else if (STRICT) {
  console.error(
    '✗ semantic-only rule violated (ADR-0010). Replace palette-step utilities with semantic tokens.',
  );
  process.exit(1);
} else {
  console.log('(informational — run with --strict to fail the build)');
}
