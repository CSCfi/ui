import fs from 'node:fs';
import path from 'node:path';

/**
 * Guard for text on a role's tint (ADR-0081, ADR-0082).
 *
 * A role's tint (`<role>-subtle`, its `-hover`, or the role mixed into the
 * page surface, `bg-tint-<role>/<n>`) pairs with one ink, `on-<role>-subtle`.
 * The role itself does not read on it: primary on its tint was 3.72:1 in dark
 * mode, error 2.56:1, warning 1.42:1 in light mode. The ring or outline may
 * stay the role; the text may not.
 *
 * A tint is opaque, so it reads the same on any surface. A see-through role
 * background (`bg-primary/15`, `bg-(--_c-button-fill)/20`, or a `<style>` or
 * component `.css` background mixing a role with `transparent`) let the
 * ground decide: primary's ghost read 4.29:1 on a dark popover, an alert's
 * success heading 4.25:1 on the light page canvas. Those fail too, except a
 * ripple or a selection indicator's hover ring, which carry no text.
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

const TINT = new RegExp(
  `^bg-(?:tint-)?(${ROLES})(?:-subtle(?:-hover)?|\\/\\d+)$`,
);

// A role's colour, or a component's private colour variable, at an alpha.
const SEE_THROUGH = new RegExp(
  `^bg-(?:(?:${ROLES})(?:-subtle(?:-hover)?)?|\\(--_c-[a-z0-9-]+\\))\\/\\d+$`,
);

const CSS_SEE_THROUGH = new RegExp(
  `background(?:-color)?:\\s*color-mix\\([^;]*var\\(--c-(?:${ROLES})[^;]*,\\s*transparent\\s*\\)`,
);

// Decorative layers with no text on them may stay see-through: a ripple, or
// the hover ring of a selection control's indicator.
const DECORATIVE = /ripple|indicator/;

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
    .filter(
      (f) =>
        typeof f === 'string' &&
        (f.endsWith('.vue') || (f.endsWith('.css') && !f.includes('__'))),
    )
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
      if (SEE_THROUGH.test(t.utility)) {
        report(
          rel,
          src,
          match.index,
          `${t.states.map((s) => `${s}:`).join('')}${t.utility} is see-through; tint with bg-tint-…/<n>, the role mixed into the page surface (ADR-0082)`,
        );
      }

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

  // Escape-hatch <style> rules and component sheets.
  for (const match of src.matchAll(/([^{}]*)\{([^{}]*)\}/g)) {
    const [, selector, body] = match;

    if (CSS_SEE_THROUGH.test(body) && !DECORATIVE.test(selector)) {
      report(
        rel,
        src,
        match.index + selector.length,
        `a see-through role background; mix the role into var(--c-surface) instead of transparent (ADR-0082)`,
      );
    }

    const tint = CSS_TINT.exec(body)?.[1];

    if (tint && CSS_TEXT.exec(body)?.[1] === tint) {
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
    `✓ every role tint is opaque and inked with on-<role>-subtle in ${vueFiles.length} SFCs and sheets.`,
  );
} else {
  console.error(
    `✗ ${hitCount} place${hitCount === 1 ? '' : 's'} put text on a see-through role background or a role's colour on its own tint (ADR-0081, ADR-0082).`,
  );
  process.exit(1);
}
