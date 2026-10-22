/**
 * The colour helpers behind c-color-picker (ADR-0069): reading any CSS
 * colour into 8-bit sRGB, gamut mapping, the shortest round-trip spellings,
 * the panel's HSV position and the channel editor.
 */
import { converter } from 'culori';
import { describe, expect, it } from 'vitest';

import {
  channelText,
  type ColorNotation,
  fromHsv,
  isColor,
  nudgeChannel,
  oklchParts,
  readChannel,
  readColor,
  type Rgba,
  spell,
  toHsv,
  withChannel,
} from './colors';

const rgba = (r: number, g: number, b: number, a = 255): Rgba => ({
  a,
  b,
  g,
  r,
});

const BLUE = rgba(31, 111, 235);

const NOTATIONS: ColorNotation[] = ['hex', 'rgb', 'oklch'];

describe('readColor', () => {
  it.each([
    ['#1f6feb', BLUE],
    ['#1F6FEB', BLUE],
    ['1f6feb', BLUE],
    ['  #1f6feb  ', BLUE],
    ['#fff', rgba(255, 255, 255)],
    ['fff', rgba(255, 255, 255)],
    ['red', rgba(255, 0, 0)],
    ['rgb(31, 111, 235)', BLUE],
    ['rgb(31 111 235)', BLUE],
    ['rgb(12.16% 43.53% 92.16%)', BLUE],
    ['hsl(0 100% 50%)', rgba(255, 0, 0)],
    ['hwb(0 0% 0%)', rgba(255, 0, 0)],
    ['oklch(1 0 0)', rgba(255, 255, 255)],
    ['oklab(0 0 0)', rgba(0, 0, 0)],
    ['lab(100 0 0)', rgba(255, 255, 255)],
    ['rgb(none 0 0)', rgba(0, 0, 0)],
  ])('reads %s', (text, expected) => {
    expect(readColor(text, false)).toEqual(expected);
  });

  it.each([
    '',
    '   ',
    '#12',
    'blurple',
    'var(--c-primary)',
    'currentcolor',
    'color-mix(in srgb, red, blue)',
  ])('names no colour in %j', (text) => {
    expect(readColor(text, true)).toBeNull();
    expect(isColor(text)).toBe(false);
  });

  it('keeps alpha only under `alpha`', () => {
    expect(readColor('#1f6feb80', true)).toEqual(rgba(31, 111, 235, 128));
    expect(readColor('#1f6feb80', false)).toEqual(BLUE);
    expect(readColor('rgb(31 111 235 / 0.5)', true)).toEqual(
      rgba(31, 111, 235, 128),
    );
    expect(readColor('transparent', true)).toEqual(rgba(0, 0, 0, 0));
    expect(readColor('transparent', false)).toEqual(rgba(0, 0, 0));
  });

  it('maps a colour outside sRGB into it, keeping lightness and hue', () => {
    const mapped = readColor('oklch(0.7 0.3 150)', false)!;

    const p = oklchParts(mapped);

    expect(Number(p.l)).toBeCloseTo(0.7, 2);
    expect(Number(p.h)).toBeCloseTo(150, 0);
    expect(Number(p.c)).toBeLessThan(0.3);

    const source = converter('oklch')('rgb(300 0 0)')!;

    const red = oklchParts(readColor('rgb(300 0 0)', false)!);

    expect(Number(red.l)).toBeCloseTo(source.l as number, 2);
    expect(Number(red.h)).toBeCloseTo(source.h as number, 0);
    expect(readColor('color(display-p3 1 0 0)', false)).not.toBeNull();
  });

  it('falls back to clipping when not even a grey of that lightness fits', () => {
    expect(readColor('oklch(1.5 0.1 100)', false)).toEqual(rgba(255, 255, 255));
  });
});

describe('spell', () => {
  it('spells each notation at its shortest', () => {
    expect(spell(BLUE, 'hex')).toBe('#1f6feb');
    expect(spell(BLUE, 'rgb')).toBe('rgb(31 111 235)');
    expect(spell(rgba(31, 111, 235, 128), 'hex')).toBe('#1f6feb80');
    expect(spell(rgba(31, 111, 235, 128), 'rgb')).toBe('rgb(31 111 235 / 0.5)');
    expect(spell(rgba(31, 111, 235, 127), 'rgb')).toBe(
      'rgb(31 111 235 / 0.498)',
    );
    expect(spell(rgba(0, 0, 0, 0), 'rgb')).toBe('rgb(0 0 0 / 0)');
    expect(spell(rgba(255, 255, 255), 'oklch')).toBe('oklch(1 0 0)');
    expect(spell(rgba(0, 0, 0), 'oklch')).toBe('oklch(0 0 0)');
  });

  it('writes no alpha for an opaque colour', () => {
    for (const n of NOTATIONS) expect(spell(BLUE, n)).not.toMatch(/\//);
  });

  it('spells oklch with at most four decimals for L and C and two for H', () => {
    const p = oklchParts(BLUE);

    expect(p.l).toMatch(/^\d(\.\d{1,4})?$/);
    expect(p.c).toMatch(/^\d(\.\d{1,4})?$/);
    expect(p.h).toMatch(/^\d{1,3}(\.\d{1,2})?$/);
  });

  it('echoes a typed oklch that lands on the same bytes', () => {
    const c = readColor('oklch(0.62 0.19 259)', false)!;

    expect(spell(c, 'oklch')).toBe('oklch(0.62 0.19 259)');
  });

  it('spells a grey with hue 0', () => {
    expect(oklchParts(rgba(128, 128, 128)).c).toBe('0');
    expect(oklchParts(rgba(128, 128, 128)).h).toBe('0');
  });

  it('reads back every 12-bit colour to the same bytes in every notation', () => {
    for (let i = 0; i < 4096; i++) {
      const c = rgba(((i >> 8) & 15) * 17, ((i >> 4) & 15) * 17, (i & 15) * 17);

      for (const n of NOTATIONS) {
        const text = spell(c, n);

        expect(readColor(text, false), `${n} ${text}`).toEqual(c);
      }
    }
  });

  it('reads back every alpha byte', () => {
    for (let a = 0; a < 256; a++) {
      const c = rgba(31, 111, 235, a);

      for (const n of NOTATIONS)
        expect(readColor(spell(c, n), true)).toEqual(c);
    }
  });
});

describe('the panel position', () => {
  it('round-trips through HSV', () => {
    expect(fromHsv(toHsv(BLUE), 255)).toEqual(BLUE);
    expect(fromHsv({ h: 0, s: 100, v: 100 }, 255)).toEqual(rgba(255, 0, 0));
    expect(fromHsv({ h: 0, s: 0, v: 100 }, 128)).toEqual(
      rgba(255, 255, 255, 128),
    );
  });

  it('keeps the hue through a grey and the saturation through black', () => {
    const prev = { h: 210, s: 60, v: 80 };

    expect(toHsv(rgba(128, 128, 128), prev).h).toBe(210);
    expect(toHsv(rgba(0, 0, 0), prev)).toMatchObject({ h: 210, s: 60, v: 0 });
  });

  it('keeps a position whose bytes the colour already has', () => {
    const prev = { h: 210, s: 0.2, v: 0.1 };

    expect(toHsv(fromHsv(prev, 255), prev)).toBe(prev);
  });
});

describe('the channel editor', () => {
  it('shows what the value spells per channel', () => {
    const c = rgba(31, 111, 235, 128);

    expect(channelText(c, 'r')).toBe('31');
    expect(channelText(c, 'a')).toBe('50');
    expect(channelText(c, 'l')).toBe(oklchParts(c).l);
  });

  it('clamps a typed channel to its range and reverts on garbage', () => {
    expect(readChannel(BLUE, 'r', '300')).toEqual(rgba(255, 111, 235));
    expect(readChannel(BLUE, 'g', '-4')).toEqual(rgba(31, 0, 235));
    expect(readChannel(BLUE, 'a', '50%')).toEqual(rgba(31, 111, 235, 128));
    expect(readChannel(BLUE, 'b', 'x')).toBeNull();
    expect(readChannel(BLUE, 'b', '')).toBeNull();
  });

  it('reads a decimal comma', () => {
    const c = readChannel(BLUE, 'l', '0,5')!;

    expect(Number(oklchParts(c).l)).toBeCloseTo(0.5, 2);
  });

  it('nudges by a step, or ten under Shift', () => {
    expect(nudgeChannel(BLUE, 'r', 1)).toEqual(rgba(32, 111, 235));
    expect(nudgeChannel(BLUE, 'r', -1, true)).toEqual(rgba(21, 111, 235));
    expect(nudgeChannel(rgba(255, 0, 0), 'r', 1)).toEqual(rgba(255, 0, 0));
  });

  it('stops chroma at the gamut edge', () => {
    const red = rgba(255, 0, 0);

    expect(nudgeChannel(red, 'c', 1)).toEqual(red);
  });

  it('keeps alpha when an OKLCH channel moves', () => {
    expect(withChannel(rgba(31, 111, 235, 128), 'l', 0.5).a).toBe(128);
  });
});
