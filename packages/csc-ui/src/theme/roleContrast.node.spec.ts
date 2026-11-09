/**
 * Every role's text reads at WCAG AA where the token maps pair it, in both
 * modes: its label on its fill, at rest and hovered (ADR-0081), and its tint's
 * ink on its tint. `scripts/audit-contrast.mjs` prints these pairs and more,
 * but only as a report; this fails the build.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

const read = <T>(path: string): T =>
  JSON.parse(
    readFileSync(fileURLToPath(new URL(path, import.meta.url)), 'utf8'),
  ) as T;

type Step = { value: string };

const palette = read<{ theme: Record<string, Record<string, Step> | Step> }>(
  '../../tokens/theme/base.json',
).theme;

const invariant = read<Record<string, string>>(
  '../../tokens/semantic/invariant.json',
);

const MODES = {
  dark: read<Record<string, string>>('../../tokens/semantic/dark.json'),
  light: read<Record<string, string>>('../../tokens/semantic/light.json'),
};

const ROLES = [
  'primary',
  'secondary',
  'accent',
  'success',
  'info',
  'warning',
  'error',
  'link',
];

/** A palette step key (`primary-600`, `white`) as `#rrggbb`. */
const hex = (key: string): string => {
  const [family, step] = key.split('-') as [string, string?];

  const entry = palette[family]!;

  return (
    step ? (entry as Record<string, Step>)[step]! : (entry as Step)
  ).value.slice(0, 7);
};

const luminance = (colour: string): number => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(colour.slice(i, i + 2), 16) / 255;

    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
};

const ratio = (a: string, b: string): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);

  return (hi! + 0.05) / (lo! + 0.05);
};

it('pairs every role’s text with its ground at AA in both modes', () => {
  const failures: string[] = [];

  for (const [mode, map] of Object.entries(MODES)) {
    const role = (name: string) => hex({ ...invariant, ...map }[name]!);

    for (const r of ROLES) {
      for (const [ink, ground] of [
        [`on-${r}`, r],
        [`on-${r}`, `${r}-hover`],
        [`on-${r}-subtle`, `${r}-subtle`],
        [`on-${r}-subtle`, `${r}-subtle-hover`],
      ] as const) {
        const value = ratio(role(ink), role(ground));

        if (value < 4.5) {
          failures.push(`${mode} ${ink} / ${ground}: ${value.toFixed(2)}:1`);
        }
      }
    }
  }

  expect(failures).toEqual([]);
});

// A text or outlined button draws its label in the tint's ink straight on
// whatever surface rung it sits on (ADR-0082): a popover's overlay in dark
// mode, the page canvas (sunken) in light. Dark secondary read 4.35:1 on the
// overlay.
const BUTTON_ROLES = [
  'primary',
  'secondary',
  'success',
  'info',
  'warning',
  'error',
];

const RUNGS = [
  'surface',
  'surface-raised',
  'surface-overlay',
  'surface-muted',
  'surface-sunken',
];

it('reads every button colour’s tint ink on every surface rung in both modes', () => {
  const failures: string[] = [];

  for (const [mode, map] of Object.entries(MODES)) {
    const role = (name: string) => hex({ ...invariant, ...map }[name]!);

    for (const r of BUTTON_ROLES) {
      for (const rung of RUNGS) {
        const value = ratio(role(`on-${r}-subtle`), role(rung));

        if (value < 4.5) {
          failures.push(
            `${mode} on-${r}-subtle / ${rung}: ${value.toFixed(2)}:1`,
          );
        }
      }
    }
  }

  expect(failures).toEqual([]);
});
