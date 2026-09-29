/**
 * Behaviour spec for c-text-field's input mask (CONTEXT.md "Input mask",
 * "Complete"; ADR-0059).
 */
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import type { Mounted } from '../../test/harness';

import {
  consoleSpy,
  matchScreenshotInBothModes,
  mount,
  recordEvents,
  settle,
} from '../../test/harness';

type FieldHost = {
  maskComplete: boolean;
  unmaskedValue: string;
  value: string;
} & HTMLElement;

const mountField = (props: Record<string, unknown> = {}) =>
  mount<FieldHost>('c-text-field', {
    attrs: { style: 'width: 320px' },
    props: { label: 'Phone', ...props },
  });

const input = (m: Mounted): HTMLInputElement => m.shadow('input');

const guide = (m: Mounted): HTMLElement | null =>
  m.host.shadowRoot!.querySelector('[part~="mask-guide"]');

/** The faint part of the guide: what the mask still asks for. */
const rest = (m: Mounted): string | undefined =>
  guide(m)?.lastElementChild?.textContent ?? undefined;

describe('input mask', () => {
  it('conforms typing and emits the masked text', async () => {
    const m = await mountField({ mask: '+358 ## ### ####' });

    const events = recordEvents(m.host, ['update:value']);

    await userEvent.type(input(m), '40a1234567');
    await settle();

    expect(input(m).value).toBe('+358 40 123 4567');
    expect(m.host.value).toBe('+358 40 123 4567');
    expect(events.details<string>().at(-1)).toBe('+358 40 123 4567');
    expect(m.host.unmaskedValue).toBe('401234567');
    expect(m.host.maskComplete).toBe(true);
  });

  it('flags a partly filled field as incomplete, not an empty one', async () => {
    const m = await mountField({ mask: '## ###' });

    expect(m.host.matches(':state(incomplete)')).toBe(false);
    expect(m.host.maskComplete).toBe(false);

    await userEvent.type(input(m), '123');
    await settle();

    expect(input(m).value).toBe('12 3');
    expect(m.host.matches(':state(incomplete)')).toBe(true);

    await userEvent.type(input(m), '45');
    await settle();

    expect(m.host.matches(':state(incomplete)')).toBe(false);
    expect(m.host.maskComplete).toBe(true);
  });

  it('Backspace never sticks on a literal', async () => {
    const m = await mountField({ mask: '## ###' });

    await userEvent.type(input(m), '123');
    await userEvent.keyboard('{Backspace}');
    await settle();

    expect(input(m).value).toBe('12');

    await userEvent.type(input(m), '345');
    input(m).setSelectionRange(3, 3);
    await userEvent.keyboard('{Backspace}');
    await settle();

    // The literal before the caret stays; the digit before it goes.
    expect(input(m).value).toBe('13 45');
    expect(input(m).selectionStart).toBe(1);
  });

  it('conforms a programmatic value without emitting', async () => {
    const m = await mountField({ mask: '## ###', value: '12345' });

    const events = recordEvents(m.host, ['update:value', 'changeValue']);

    expect(input(m).value).toBe('12 345');
    expect(m.host.unmaskedValue).toBe('12345');

    m.host.value = '9x87';
    await settle();

    expect(input(m).value).toBe('98 7');
    expect(m.host.value).toBe('9x87');
    expect(events.records).toHaveLength(0);
  });

  it('asks for a numeric keyboard under a digits-only mask', async () => {
    const digits = await mountField({ mask: '### ##' });

    const letters = await mountField({ mask: 'AA-###' });

    expect(input(digits).getAttribute('inputmode')).toBe('numeric');
    expect(input(letters).hasAttribute('inputmode')).toBe(false);
  });

  it('ignores the mask on a type with no caret', async () => {
    const m = await mountField({ mask: '###', type: 'email' });

    await userEvent.type(input(m), 'a@b.fi');
    await settle();

    expect(input(m).value).toBe('a@b.fi');
    expect(m.host.maskComplete).toBe(true);
    expect(m.host.unmaskedValue).toBe('a@b.fi');
  });
});

/** The first and last rows holding ink in the left `columns` of `el`'s screenshot. */
const inkRows = async (el: Element, columns: number): Promise<number[]> => {
  const shot = (await page.screenshot({
    base64: true,
    element: el,
    save: false,
  } as never)) as unknown;

  const img = new Image();

  img.src = `data:image/png;base64,${typeof shot === 'string' ? shot : (shot as { base64: string }).base64}`;
  await img.decode();

  const canvas = document.createElement('canvas');

  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext('2d')!;

  ctx.drawImage(img, 0, 0);

  const { data } = ctx.getImageData(0, 0, img.width, img.height);

  const rows: number[] = [];

  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < columns; x++) {
      const i = (y * img.width + x) * 4;

      if (data[i] < 100 && data[i + 1] < 100 && data[i + 2] < 100) {
        rows.push(y);
        break;
      }
    }
  }

  return [rows[0], rows.at(-1)!];
};

describe('optional sections', () => {
  it('completes anywhere between the minimum and the maximum', async () => {
    const m = await mountField({ mask: '+358 #####[#######]' });

    await userEvent.type(input(m), '4012');
    await settle();

    expect(m.host.matches(':state(incomplete)')).toBe(true);
    expect(rest(m)).toBe('_');

    await userEvent.type(input(m), '3');
    await settle();

    expect(m.host.maskComplete).toBe(true);
    expect(m.host.matches(':state(incomplete)')).toBe(false);
    expect(rest(m)).toBe('');

    await userEvent.type(input(m), '45678901234');
    await settle();

    expect(input(m).value).toBe('+358 401234567890');
    expect(m.host.unmaskedValue).toBe('401234567890');
  });

  it('ignores an invalid mask and warns once', async () => {
    const m = await mountField({ mask: '[#]##' });

    const again = await mountField({ mask: '[#]##' });

    await userEvent.type(input(m), 'ab');
    await settle();

    expect(input(m).value).toBe('ab');
    expect(guide(again)).toBeNull();

    consoleSpy.expect(/\[c-text-field\] ignoring the invalid mask "\[#\]##"/);
    expect(
      consoleSpy.records().filter((r) => r.text.includes('invalid mask')),
    ).toHaveLength(0);
  });
});

describe('mask guide', () => {
  it('shows once the floating label is out of the way', async () => {
    const m = await mountField({ mask: '+358 ## ### ####' });

    const events = recordEvents(m.host, ['update:value', 'input']);

    expect(guide(m), 'the guide covered the resting label').toBeNull();

    input(m).focus();
    await settle();

    expect(guide(m)?.getAttribute('aria-hidden')).toBe('true');
    expect(rest(m)).toBe('+358 __ ___ ____');
    expect(m.host.value).toBe('');
    expect(events.records).toHaveLength(0);
  });

  it('always shows with the label on top, or with no label', async () => {
    const onTop = await mountField({ labelOnTop: true, mask: '## ###' });

    const bare = await mountField({ label: '', mask: '## ###' });

    expect(rest(onTop)).toBe('__ ___');
    expect(rest(bare)).toBe('__ ___');
  });

  it('tracks typing, character for character', async () => {
    const m = await mountField({ mask: '+358 ## ### ####' });

    await userEvent.type(input(m), '4');
    await settle();

    expect(rest(m)).toBe('_ ___ ____');

    // The ghost's typed-width run starts where the input's text does.
    const typed = guide(m)!.firstElementChild!.getBoundingClientRect();

    const box = input(m).getBoundingClientRect();

    expect(Math.abs(typed.left - box.left)).toBeLessThan(0.5);

    await userEvent.type(input(m), '01234567');
    await settle();

    expect(rest(m)).toBe('');
  });

  for (const size of ['default', 'small']) {
    it(`sits on the typed text's line (${size})`, async () => {
      const m = await mountField({
        labelOnTop: true,
        mask: '+358 ## ###',
        size,
      });

      // Paint both texts solid black and compare the rows of "+358": once
      // drawn by the guide, once by the input with the guide hidden.
      const ink = document.createElement('style');

      ink.textContent =
        '* { color: #000 !important; -webkit-text-fill-color: #000 !important; }';
      m.host.shadowRoot!.append(ink);

      const cell = guide(m)!.parentElement!;

      await settle();

      const drawnByGuide = await inkRows(cell, 30);

      input(m).value = '+358 40 123';
      guide(m)!.style.visibility = 'hidden';
      await settle();

      expect(drawnByGuide).toEqual(await inkRows(cell, 30));
    });
  }

  it('gives way to a consumer placeholder', async () => {
    const m = await mountField({
      labelOnTop: true,
      mask: '## ###',
      placeholder: '12 345',
    });

    expect(guide(m)).toBeNull();
    expect(input(m).placeholder).toBe('12 345');
  });

  it('renders no guide without a mask', async () => {
    const m = await mountField({ labelOnTop: true });

    expect(guide(m)).toBeNull();
  });
});

describe('visual', () => {
  it('mask guide, empty and partly typed', async () => {
    const empty = await mountField({
      labelOnTop: true,
      mask: '+358 ## ### ####',
    });

    await matchScreenshotInBothModes(empty.stage, 'mask-guide-empty');

    const typed = await mountField({ mask: '+358 ## ### ####' });

    await userEvent.type(input(typed), '401');
    input(typed).blur();
    await settle();

    await matchScreenshotInBothModes(typed.stage, 'mask-guide-typed');
  });
});
