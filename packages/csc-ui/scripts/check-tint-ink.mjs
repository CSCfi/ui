import fs from 'node:fs';
import path from 'node:path';

/**
 * Guard for text drawn in a role's own colour on that role's tint (ADR-0081).
 *
 * A role's tint (`<role>-subtle`, its `-hover`, or the role at a low alpha)
 * pairs with one ink, `on-<role>-subtle`. The role itself does not read on it:
 * primary on its tint was 3.72:1 in dark mode, error 2.56:1, warning 1.42:1 in
 * light mode. The ring or outline may stay the role; the text may not.
 *
 * Flags a class string where, under one state (`hover:`, `focus:`,
 * `data-[active]:`, … or none), the background is a role's tint and the text
 * in that state is `text-<role>`: the state's own `text-*`, or failing that the
 * nearest less specific one (`text-primary` beside `hover:bg-primary/15`).
 * Also flags a `<style>` rule that sets both `background-color` to a role's
 * tint and `color` to the role. Comments are stripped first, with newlines kept
 * so the reported line numbers stay true. Always strict.
 */

const ROOTS = [
  path.resolve(import.meta.dirname, '../src/components'),
  path.resolve(import.meta.dirname, '../src/shared'),
];

const ROLES = 'primary|secondary|accent|success|info|warning|error|link';

const TINT = new RegExp(`^bg-(${ROLES})(?:-subtle(?:-hover)?|\\/\\d+)$`);

// Text colours only: `text-sm` or `text-center` must not stand in for one.
const TEXT_COLOUR = new RegExp(
  `^text-((?:${ROLES}|on-[a-z-]+|surface[a-z-]*)(?:-[a-z]+)*|current|inherit|white|black|\\((?!length:).+\\)|\\[(?:color:|#|var\\().+\\])$`,
);

const CSS_TINT = new RegExp(
  `background(?:-color)?:\\s*var\\(--c-(${ROLES})-subtle(?:-hover)?\\)`,
);

const CSS_TEXT = new RegExp(`(?:^|[;{\\s])color:\\s*var\\(--c-(${ROLES})\\)`);

/** Blank out comments, preserving newlines so reported line numbers stay true. */
const stripComments = (src) =>
  src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(
      /(^|[^:])\/\/[^\n]*/g,
      (m, p1) => p1 + ' '.repeat(m.length - p1.length),
    );

/** `hover:data-[a:b]:bg-x` → { states: ['hover', 'data-[a:b]'], utility: 'bg-x' }. */
const split = (token) => {
  const parts = [];

  let depth = 0;

  let start = 0;

  for (let i = 0; i < token.length; i++) {
    if (token[i] === '[' || token[i] === '(') depth++;
    else if (token[i] === ']' || token[i] === ')') depth--;
    else if (token[i] === ':' && depth === 0) {
      parts.push(token.slice(start, i));
      start = i + 1;
    }
  }

  return { states: parts, utility: token.slice(start) };
};

/** The text colour a state paints: its own, or the nearest less specific one. */
const textIn = (states, texts) => {
  const own = texts.filter((t) => t.states.every((s) => states.includes(s)));

  own.sort((a, b) => b.states.length - a.states.length);

  return own[0];
};

const vueFiles = ROOTS.flatMap((root) =>
  fs
    .readdirSync(root, { recursive: true })
    .filter((f) => typeof f === 'string' && f.endsWith('.vue'))
    .map((f) => path.join(root, f)),
).sort();

let hitCount = 0;

const report = (rel, src, index, message) => {
  const line = src.slice(0, index).split('\n').length;

  hitCount++;
  console.log(`${rel}:${line}: ${message}`);
};

for (const file of vueFiles) {
  const src = stripComments(fs.readFileSync(file, 'utf8'));

  const rel = path.relative(path.resolve(import.meta.dirname, '..'), file);

  // Class strings: tv slots in single quotes, template attributes in double.
  for (const match of src.matchAll(/'[^'\n]*'|"[^"]*"/g)) {
    const tokens = match[0]
      .slice(1, -1)
      .split(/\s+/)
      .filter(Boolean)
      .map(split);

    const texts = tokens
      .map((t) => ({ ...t, role: TEXT_COLOUR.exec(t.utility)?.[1] }))
      .filter((t) => t.role);

    for (const t of tokens) {
      const role = TINT.exec(t.utility)?.[1];

      if (!role) continue;

      const text = textIn(t.states, texts);

      if (text?.role !== role) continue;

      const state = t.states.map((s) => `${s}:`).join('');

      report(
        rel,
        src,
        match.index,
        `${state}${t.utility} under ${[...text.states, text.utility].join(':')}; ink the tint with ${state}text-on-${role}-subtle`,
      );
    }
  }

  // Escape-hatch <style> rules.
  for (const match of src.matchAll(/\{[^{}]*\}/g)) {
    const tint = CSS_TINT.exec(match[0])?.[1];

    if (tint && CSS_TEXT.exec(match[0])?.[1] === tint) {
      report(
        rel,
        src,
        match.index,
        `color: var(--c-${tint}) on its tint; use var(--c-on-${tint}-subtle)`,
      );
    }
  }
}

if (hitCount === 0) {
  console.log(
    `✓ text on a role's tint takes the tint's ink in ${vueFiles.length} SFCs.`,
  );
} else {
  console.error(
    `✗ ${hitCount} place${hitCount === 1 ? '' : 's'} draw a role's colour as text on its own tint (ADR-0081).`,
  );
  process.exit(1);
}
