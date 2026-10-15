/**
 * Behaviour spec for c-color-picker (CONTEXT.md "Colour picker", "Notation",
 * "Notation switch", "Channel editor", "Colour area", "Colour button",
 * "Swatch", "Swatch-only", "Bad input", "Pending value", "Done button";
 * ADR-0069, ADR-0070).
 */
import { afterEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import type { Mounted } from '../../test/harness';

import { applyDefaults, resetDefaults } from '../../shared/appDefaults';
import {
  consoleSpy,
  deepActiveElement,
  matchScreenshotInBothModes,
  mount,
  recordEvents,
  settle,
  settled,
} from '../../test/harness';

type PickerHost = { badInput: boolean; value: unknown } & HTMLElement;

const EVENTS = ['change', 'update:value', 'change:text'];

const SWATCHES = [
  { name: 'Ocean', value: '#1f6feb' },
  { name: 'Coral', value: '#e5534b' },
  { name: 'Moss', value: '#57ab5a' },
  { name: 'Sand', value: '#c69026' },
  { name: 'Plum', value: '#986ee2' },
  { name: 'Slate', value: '#768390' },
  { name: 'Ink', value: '#22272e' },
  { name: 'Snow', value: '#ffffff' },
  { name: 'Rose', value: '#e275ad' },
  { name: 'Teal', value: '#39c5cf' },
];

const mountPicker = (
  props: Record<string, unknown> = {},
  attrs: Record<string, boolean | string> = {},
) =>
  mount<PickerHost>('c-color-picker', {
    attrs: { style: 'width: 320px', ...attrs },
    props: { label: 'Colour', ...props },
  });

const textInput = (m: Mounted): HTMLInputElement =>
  m.shadow<HTMLInputElement>('input[part~="input"]');

const isOpen = (m: Mounted): boolean =>
  m.part('panel').matches(':popover-open');

const colorButton = (m: Mounted): HTMLElement =>
  m.deep('c-icon-button[aria-label="Open colour picker"]', 'button');

const open = async (m: Mounted): Promise<void> => {
  await userEvent.click(colorButton(m));
  await settled();

  expect(isOpen(m), 'the panel did not open').toBe(true);
};

const axisInput = (m: Mounted, axis: 's' | 'v'): HTMLInputElement =>
  m.shadow<HTMLInputElement>(`input[data-axis="${axis}"]`);

const channel = (m: Mounted, name: string): HTMLInputElement =>
  m.shadow<HTMLInputElement>(`input[part~="channel"][aria-label="${name}"]`);

const swatches = (m: Mounted): HTMLElement[] => m.shadowAll('[part~="swatch"]');

const notation = (m: Mounted, label: string): HTMLButtonElement =>
  m
    .shadowAll<HTMLButtonElement>('button[part~="notation"]')
    .find((b) => b.textContent?.trim() === label)!;

const type = async (input: HTMLInputElement, text: string) => {
  await userEvent.clear(input);
  await userEvent.type(input, text);
};

const commit = async (input: HTMLInputElement, text: string) => {
  await type(input, text);
  await userEvent.keyboard('{Enter}');
  await settle();
};

const pointer = (target: Element, type: string, x: number, y: number) =>
  target.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      button: 0,
      clientX: x,
      clientY: y,
      composed: true,
      pointerId: 1,
    }),
  );

// A point of the area at saturation `s` and brightness `v`, in percent.
const areaPoint = (m: Mounted, s: number, v: number): [number, number] => {
  const r = m.part('area').getBoundingClientRect();

  return [r.left + (r.width * s) / 100, r.top + (r.height * (100 - v)) / 100];
};

afterEach(() => {
  resetDefaults();
});

describe('typing', () => {
  it('commits any CSS colour on Enter, spelled in hex, and emits once', async () => {
    const m = await mountPicker();

    const events = recordEvents(m.host, EVENTS);

    const input = textInput(m);

    await type(input, 'rgb(31, 111, 235)');

    expect(events.of('change')).toHaveLength(0);

    await userEvent.keyboard('{Enter}');
    await settle();

    expect(events.of('change').map((r) => r.detail)).toEqual(['#1f6feb']);
    expect(events.of('change:text').map((r) => r.detail)).toEqual([
      'rgb(31, 111, 235)',
    ]);
    expect(m.host.value).toBe('#1f6feb');
    expect(input.value).toBe('#1f6feb');
    expect(isOpen(m), 'typing opened the panel').toBe(false);

    input.blur();
    await settle();

    expect(events.of('change')).toHaveLength(1);
  });

  it.each([
    ['1F6FEB', 'hex', '#1f6feb'],
    ['#fff', 'hex', '#ffffff'],
    ['red', 'rgb', 'rgb(255 0 0)'],
    ['#1f6feb', 'oklch', 'oklch(0.5686 0.202 259.7)'],
  ])('reads %s into the %s notation', async (text, format, expected) => {
    const m = await mountPicker({ format });

    await commit(textInput(m), text);

    expect(m.host.value).toBe(expected);
  });

  it('maps a colour outside sRGB into it rather than rejecting it', async () => {
    const m = await mountPicker({ format: 'oklch' });

    await commit(textInput(m), 'oklch(0.7 0.3 150)');

    expect(m.host.badInput).toBe(false);
    expect(m.host.value).toMatch(/^oklch\(0\.7\d* 0\.\d+ 1(49|50)(\.\d+)?\)$/);
  });

  it('drops typed alpha unless `alpha` is set', async () => {
    const opaque = await mountPicker();

    await commit(textInput(opaque), '#1f6feb80');

    expect(opaque.host.value).toBe('#1f6feb');

    const translucent = await mountPicker({ alpha: true, format: 'rgb' });

    await commit(textInput(translucent), '#1f6feb80');

    expect(translucent.host.value).toBe('rgb(31 111 235 / 0.5)');
  });

  it('bad input keeps the text, commits null and flags the host', async () => {
    const m = await mountPicker({ value: '#1f6feb' });

    const events = recordEvents(m.host, EVENTS);

    const input = textInput(m);

    await commit(input, 'blurple');

    expect(input.value).toBe('blurple');
    expect(m.host.value).toBeNull();
    expect(m.host.badInput).toBe(true);
    expect(m.host.matches(':state(bad-input)')).toBe(true);
    expect(events.of('change').map((r) => r.detail)).toEqual([null]);
    expect(input.getAttribute('aria-invalid')).toBe('true');

    await commit(input, '#000');

    expect(m.host.badInput).toBe(false);
    expect(m.host.matches(':state(bad-input)')).toBe(false);
  });

  it('shows a programmatic value in the notation and never emits for it', async () => {
    const m = await mountPicker({ value: 'red' });

    const events = recordEvents(m.host, EVENTS);

    expect(textInput(m).value).toBe('#ff0000');

    m.host.value = 'rgb(0 0 255)';
    await settle();

    expect(textInput(m).value).toBe('#0000ff');

    (m.host as unknown as { format: string }).format = 'rgb';
    await settle();

    expect(textInput(m).value).toBe('rgb(0 0 255)');
    expect(events.names()).toEqual([]);
  });

  it('takes its notation and alpha from app defaults', async () => {
    applyDefaults({ 'c-color-picker': { alpha: true, format: 'oklch' } });

    const m = await mountPicker();

    await commit(textInput(m), '#ffffff80');

    expect(m.host.value).toBe('oklch(1 0 0 / 0.5)');
  });
});

describe('opening', () => {
  it('opens on the colour button, never on focus or a click in the text', async () => {
    const m = await mountPicker({ value: '#1f6feb' });

    await userEvent.click(textInput(m));
    await settle();

    expect(isOpen(m)).toBe(false);

    await open(m);

    expect(deepActiveElement()).toBe(axisInput(m, 's'));
    expect(m.part('card').getAttribute('role')).toBe('dialog');
    expect(m.part('card').getAttribute('aria-label')).toBe('Colour');
  });

  it('opens on Alt+ArrowDown and closes on Escape, back to the input', async () => {
    const m = await mountPicker({ value: '#1f6feb' });

    textInput(m).focus();
    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
    await settled();

    expect(isOpen(m)).toBe(true);

    await userEvent.keyboard('{Escape}');
    await settle();

    expect(isOpen(m)).toBe(false);
    expect(deepActiveElement()).toBe(textInput(m));
  });

  it('paints the colour button with the value and an empty look without one', async () => {
    const m = await mountPicker({ value: '#1f6feb' });

    const chip = m.part('color-chip');

    expect(chip.style.getPropertyValue('--_c-color-picker-color')).toBe(
      '#1f6feb',
    );

    m.host.value = null;
    await settle();

    expect(chip.style.getPropertyValue('--_c-color-picker-color')).toBe('');
  });
});

describe('colour area', () => {
  it('arrow keys move saturation and brightness, one commit per key', async () => {
    const m = await mountPicker({ value: '#ff0000' });

    const events = recordEvents(m.host, EVENTS);

    await open(m);
    await userEvent.keyboard('{ArrowLeft}');
    await settle();

    expect(events.of('change').map((r) => r.detail)).toEqual(['#ff0303']);
    expect(axisInput(m, 's').getAttribute('aria-valuetext')).toBe('99%');

    await userEvent.keyboard('{ArrowDown}');
    await settle();

    expect(events.of('change')).toHaveLength(2);
    expect(deepActiveElement(), 'the brightness range takes focus').toBe(
      axisInput(m, 'v'),
    );
    expect(axisInput(m, 'v').tabIndex).toBe(0);
    expect(axisInput(m, 's').tabIndex).toBe(-1);
    expect(isOpen(m), 'a pick keeps the panel open').toBe(true);
  });

  it('a step the bytes cannot show moves the thumb and emits nothing', async () => {
    const m = await mountPicker({ value: '#000000' });

    const events = recordEvents(m.host, EVENTS);

    await open(m);

    const thumb = m.part('area-thumb');

    const before = thumb.style.left;

    await userEvent.keyboard('{ArrowRight}');
    await settle();

    expect(thumb.style.left).not.toBe(before);
    expect(events.names()).toEqual([]);
  });

  it('a drag reports each move and one change on release', async () => {
    const m = await mountPicker({ value: '#ffffff' });

    await open(m);

    const events = recordEvents(m.host, EVENTS);

    const inputs = recordEvents(document.body, ['input']);

    const area = m.part('area');

    pointer(area, 'pointerdown', ...areaPoint(m, 50, 50));
    pointer(area, 'pointermove', ...areaPoint(m, 60, 60));
    pointer(area, 'pointermove', ...areaPoint(m, 70, 70));
    await settle();

    expect(events.of('update:value')).toHaveLength(3);
    expect(inputs.of('input', (r) => !r.composed)).toHaveLength(3);
    expect(events.of('change')).toHaveLength(0);

    pointer(area, 'pointerup', ...areaPoint(m, 70, 70));
    await settle();

    expect(events.of('change')).toHaveLength(1);
    expect(events.of('change')[0].detail).toBe(m.host.value);
    expect(isOpen(m), 'a release inside keeps the panel open').toBe(true);
  });

  it('an empty open lands on white and commits nothing', async () => {
    const m = await mountPicker();

    const events = recordEvents(m.host, EVENTS);

    await open(m);

    expect(m.part('area-thumb').style.left).toBe('0%');
    expect(m.part('area-thumb').style.top).toBe('0%');
    expect(events.names()).toEqual([]);
  });

  it('keeps the hue through a grey', async () => {
    const m = await mountPicker({ value: '#3366cc' });

    await open(m);

    const hue = m.part('hue-slider') as HTMLInputElement;

    const before = hue.value;

    await userEvent.keyboard('{Home}');
    await settle();

    expect(m.host.value).toBe('#cccccc');
    expect(hue.value).toBe(before);
  });
});

describe('sliders', () => {
  it('the hue slider commits a key step and moves the area hue', async () => {
    const m = await mountPicker({ value: '#ff0000' });

    const events = recordEvents(m.host, EVENTS);

    await open(m);

    const hue = m.part('hue-slider') as HTMLInputElement;

    hue.focus();
    await userEvent.keyboard('{ArrowRight}');
    await settle();

    expect(hue.getAttribute('aria-valuetext')).toBe('1°');
    expect(events.of('change')).toHaveLength(1);
    expect(m.part('area').style.getPropertyValue('--_c-color-picker-hue')).toBe(
      '1',
    );
  });

  it('the alpha slider exists under `alpha` only and sets alpha', async () => {
    const opaque = await mountPicker({ value: '#1f6feb' });

    await open(opaque);

    expect(opaque.shadowAll('[part~="alpha-slider"]')).toHaveLength(0);

    const m = await mountPicker({ alpha: true, value: '#1f6feb' });

    await open(m);

    const alpha = m.part('alpha-slider') as HTMLInputElement;

    expect(alpha.getAttribute('aria-valuetext')).toBe('100%');

    alpha.focus();
    await userEvent.keyboard('{ArrowLeft}');
    await settle();

    expect(m.host.value).toBe('#1f6febfc');
  });
});

describe('channel editor', () => {
  it('opens on the value notation; the switch changes the view and never emits', async () => {
    const m = await mountPicker({ format: 'rgb', value: '#1f6feb' });

    const events = recordEvents(m.host, EVENTS);

    await open(m);

    expect(notation(m, 'RGB').getAttribute('aria-pressed')).toBe('true');
    expect(channel(m, 'Red').value).toBe('31');

    await userEvent.click(notation(m, 'OKLCH'));
    await settle();

    expect(channel(m, 'Lightness').value).toBe('0.5686');
    expect(m.shadowAll('input[aria-label="Red"]')).toHaveLength(0);

    await userEvent.click(notation(m, 'HEX'));
    await settle();

    expect(channel(m, 'Hex').value).toBe('#1f6feb');
    expect(events.names()).toEqual([]);
  });

  it('a typed channel commits on Enter, clamped to its range', async () => {
    const m = await mountPicker({ format: 'rgb', value: '#1f6feb' });

    await open(m);

    const red = channel(m, 'Red');

    await commit(red, '300');

    expect(m.host.value).toBe('rgb(255 111 235)');
    expect(red.value).toBe('255');
    expect(isOpen(m)).toBe(true);
  });

  it('text that is no number reverts', async () => {
    const m = await mountPicker({ format: 'rgb', value: '#1f6feb' });

    const events = recordEvents(m.host, EVENTS);

    await open(m);

    const green = channel(m, 'Green');

    await commit(green, 'x');

    expect(green.value).toBe('111');
    expect(events.names()).toEqual([]);
  });

  it('Up and Down nudge a channel and commit', async () => {
    const m = await mountPicker({ format: 'rgb', value: '#1f6feb' });

    await open(m);

    channel(m, 'Blue').focus();
    await userEvent.keyboard('{ArrowDown}');
    await settle();

    expect(m.host.value).toBe('rgb(31 111 234)');

    await userEvent.keyboard('{Shift>}{ArrowUp}{/Shift}');
    await settle();

    expect(m.host.value).toBe('rgb(31 111 244)');
    expect(channel(m, 'Blue').value).toBe('244');
  });

  it('the hex box takes any colour', async () => {
    const m = await mountPicker({ value: '#1f6feb' });

    await open(m);
    await commit(channel(m, 'Hex'), 'red');

    expect(m.host.value).toBe('#ff0000');
  });
});

describe('swatches', () => {
  it('arrows move focus without committing; Enter picks and keeps the panel open', async () => {
    const m = await mountPicker({ swatches: SWATCHES });

    const events = recordEvents(m.host, EVENTS);

    await open(m);

    swatches(m)[0].focus();
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    await settle();

    expect(deepActiveElement()).toBe(swatches(m)[2]);
    expect(events.names()).toEqual([]);

    await userEvent.keyboard('{Enter}');
    await settle();

    expect(m.host.value).toBe('#57ab5a');
    expect(swatches(m)[2].getAttribute('aria-selected')).toBe('true');
    expect(isOpen(m)).toBe(true);
  });

  it('ArrowDown moves a row; a click picks', async () => {
    const m = await mountPicker({ swatches: SWATCHES });

    await open(m);

    const els = swatches(m);

    const columns = els.filter(
      (el) => el.offsetTop === els[0].offsetTop,
    ).length;

    els[0].focus();
    await userEvent.keyboard('{ArrowDown}');
    await settle();

    expect(deepActiveElement()).toBe(els[columns]);

    await userEvent.click(els[1]);
    await settle();

    expect(m.host.value).toBe('#e5534b');
  });

  it('names each swatch for assistive technology', async () => {
    const m = await mountPicker({ swatches: ['#ff8800', ...SWATCHES] });

    await open(m);

    expect(m.part('swatches').getAttribute('role')).toBe('listbox');
    expect(swatches(m)[0].getAttribute('aria-label')).toBe('#ff8800');
    expect(swatches(m)[1].getAttribute('aria-label')).toBe('Ocean');
  });

  it('skips a swatch that names no colour, warning once', async () => {
    const m = await mountPicker({ swatches: ['nope', '#ff0000'] });

    consoleSpy.expect(/swatch "nope" names no colour/);

    await open(m);

    expect(swatches(m)).toHaveLength(1);
  });
});

describe('swatch-only', () => {
  const mountOnly = (props: Record<string, unknown> = {}) =>
    mountPicker({ swatches: SWATCHES, ...props }, { 'swatches-only': true });

  it('is a readonly field showing the swatch name that opens on a click', async () => {
    const m = await mountOnly({ value: '#e5534b' });

    const input = textInput(m);

    expect(input.readOnly).toBe(true);
    expect(input.getAttribute('role')).toBe('combobox');
    expect(input.value).toBe('Coral');

    await userEvent.click(input);
    await settled();

    expect(isOpen(m)).toBe(true);
    expect(deepActiveElement()).toBe(swatches(m)[1]);
    expect(m.shadowAll('[part~="area"]')).toHaveLength(0);
  });

  it('a pick commits and closes', async () => {
    const m = await mountOnly();

    const events = recordEvents(m.host, EVENTS);

    textInput(m).focus();
    await userEvent.keyboard('{Enter}');
    await settled();

    expect(isOpen(m)).toBe(true);

    await userEvent.keyboard('{ArrowRight}{Enter}');
    await settle();

    expect(events.of('change').map((r) => r.detail)).toEqual(['#e5534b']);
    expect(isOpen(m)).toBe(false);
    expect(textInput(m).value).toBe('Coral');
    expect(deepActiveElement()).toBe(textInput(m));
  });

  it('shows a value matching no swatch spelled, not as bad input', async () => {
    const m = await mountOnly({ value: '#000000' });

    expect(textInput(m).value).toBe('#000000');
    expect(m.host.badInput).toBe(false);
  });

  it('warns once about unnamed swatches', async () => {
    await mountPicker({ swatches: ['#ff0000'] }, { 'swatches-only': true });

    consoleSpy.expect(/swatches-only: name every swatch/);
  });
});

describe('colour comparison', () => {
  afterEach(async () => {
    await page.viewport(1280, 800);
  });

  const paint = (m: Mounted, half: 'new-color' | 'original-color'): string =>
    m.part(half).style.getPropertyValue('--_c-color-picker-color');

  it('is absent when the panel opens empty, and under swatch-only', async () => {
    const empty = await mountPicker({ swatches: SWATCHES });

    await open(empty);

    expect(empty.shadowAll('[part~="comparison"]')).toHaveLength(0);

    const only = await mountPicker(
      { swatches: SWATCHES, value: '#e5534b' },
      { 'swatches-only': true },
    );

    await userEvent.click(textInput(only));
    await settled();

    expect(isOpen(only)).toBe(true);
    expect(only.shadowAll('[part~="comparison"]')).toHaveLength(0);
  });

  it('shows the colour the panel opened on beside the one it holds', async () => {
    const m = await mountPicker({ value: '#1f6feb' });

    await open(m);

    expect(paint(m, 'original-color')).toBe('#1f6feb');
    expect(paint(m, 'new-color')).toBe('#1f6feb');
    expect(m.part('new-color').getAttribute('aria-hidden')).toBe('true');

    await userEvent.keyboard('{Shift>}{ArrowDown}{/Shift}');
    await settle();

    expect(m.host.value).not.toBe('#1f6feb');
    expect(paint(m, 'new-color')).toBe(m.host.value);
    expect(paint(m, 'original-color')).toBe('#1f6feb');
  });

  it('the original restores the colour with one commit', async () => {
    const m = await mountPicker({ value: '#1f6feb' });

    await open(m);
    await userEvent.keyboard('{Shift>}{ArrowDown}{/Shift}');
    await settle();

    const events = recordEvents(m.host, EVENTS);

    const inputs = recordEvents(document.body, ['input']);

    await userEvent.click(m.part('original-color'));
    await settle();

    expect(events.of('change').map((r) => r.detail)).toEqual(['#1f6feb']);
    expect(events.of('update:value').map((r) => r.detail)).toEqual(['#1f6feb']);
    expect(inputs.of('input', (r) => !r.composed)).toHaveLength(1);
    expect(paint(m, 'new-color')).toBe('#1f6feb');
    expect(isOpen(m), 'a restore keeps the panel open').toBe(true);

    events.clear();

    await userEvent.click(m.part('original-color'));
    await settle();

    expect(events.names(), 'the colour is already the original').toEqual([]);
  });

  it('takes the original on every open, typed text included', async () => {
    const m = await mountPicker({ value: '#1f6feb' });

    await open(m);
    await userEvent.keyboard('{ArrowLeft}');
    await settle();

    const picked = m.host.value;

    await userEvent.keyboard('{Escape}');
    await settle();
    await open(m);

    expect(paint(m, 'original-color')).toBe(picked);

    await userEvent.keyboard('{Escape}');
    await settle();
    await type(textInput(m), 'red');
    await open(m);

    expect(paint(m, 'original-color')).toBe('#ff0000');
  });

  it('keeps the original alpha under `alpha`', async () => {
    const m = await mountPicker({ alpha: true, value: '#1f6feb80' });

    await open(m);

    expect(paint(m, 'original-color')).toBe('#1f6feb80');
  });

  it('in the fullscreen panel the original becomes the pending colour', async () => {
    await page.viewport(360, 740);

    const m = await mountPicker({ value: '#1f6feb' });

    const events = recordEvents(m.host, EVENTS);

    await open(m);
    await userEvent.keyboard('{Shift>}{ArrowDown}{/Shift}');
    await settle();

    expect(paint(m, 'new-color')).not.toBe('#1f6feb');

    await userEvent.click(m.part('original-color'));
    await settle();

    expect(paint(m, 'new-color')).toBe('#1f6feb');

    await userEvent.click(m.part('done'));
    await settle();

    expect(events.names(), 'Done on the original changes nothing').toEqual([]);
    expect(m.host.value).toBe('#1f6feb');

    await open(m);
    await userEvent.click(m.part('original-color'));
    await userEvent.click(m.part('area'));
    await settle();

    const picked = paint(m, 'new-color');

    await userEvent.click(m.part('done'));
    await settle();

    expect(events.of('change').map((r) => r.detail)).toEqual([picked]);
  });
});

describe('focus trap', () => {
  it('Tab cycles through the panel', async () => {
    const m = await mountPicker({ swatches: SWATCHES, value: '#1f6feb' });

    await open(m);

    const stops: (null | string)[] = [];

    for (let i = 0; i < 9; i++) {
      const el = deepActiveElement();

      stops.push(
        el?.getAttribute('data-axis') ??
          el?.getAttribute('part') ??
          el?.textContent?.trim() ??
          null,
      );
      await userEvent.keyboard('{Tab}');
    }

    expect(stops).toEqual([
      's',
      'hue-slider',
      'original-color',
      'notation',
      'notation',
      'notation',
      'channel',
      'swatch',
      's',
    ]);
  });
});

describe('fullscreen panel', () => {
  afterEach(async () => {
    await page.viewport(1280, 800);
  });

  it('holds picks for Done', async () => {
    await page.viewport(360, 740);

    const m = await mountPicker({ swatches: SWATCHES, value: '#1f6feb' });

    const events = recordEvents(m.host, EVENTS);

    await open(m);

    expect(m.part('panel').getBoundingClientRect().top).toBe(0);
    expect(m.part('heading').textContent?.trim()).toBe('Colour');

    await userEvent.click(swatches(m)[1]);
    await settle();

    expect(swatches(m)[1].getAttribute('aria-selected')).toBe('true');
    expect(events.names()).toEqual([]);

    await userEvent.click(m.part('done'));
    await settle();

    expect(events.of('change').map((r) => r.detail)).toEqual(['#e5534b']);
    expect(isOpen(m)).toBe(false);
  });

  it('the close button discards the picks', async () => {
    await page.viewport(360, 740);

    const m = await mountPicker({ value: '#1f6feb' });

    const events = recordEvents(m.host, EVENTS);

    await open(m);
    await userEvent.keyboard('{ArrowLeft}');
    await settle();

    await userEvent.click(m.part('close'));
    await settle();

    expect(events.names()).toEqual([]);
    expect(m.host.value).toBe('#1f6feb');
  });

  it('swatch-only has no Done: a pick commits and closes', async () => {
    await page.viewport(360, 740);

    const m = await mountPicker(
      { swatches: SWATCHES },
      { 'swatches-only': true },
    );

    await userEvent.click(textInput(m));
    await settled();

    expect(m.shadowAll('[part~="done"]')).toHaveLength(0);

    await userEvent.click(swatches(m)[2]);
    await settle();

    expect(m.host.value).toBe('#57ab5a');
    expect(isOpen(m)).toBe(false);
  });
});

describe('texts', () => {
  it('overrides the UI texts', async () => {
    const m = await mountPicker({
      texts: {
        openPicker: 'Avaa värivalitsin',
        restoreOriginal: 'Palauta alkuperäinen väri',
        saturation: 'Kylläisyys',
      },
      value: '#1f6feb',
    });

    const button = m.deep(
      'c-icon-button[aria-label="Avaa värivalitsin"]',
      'button',
    );

    await userEvent.click(button);
    await settled();

    expect(axisInput(m, 's').getAttribute('aria-label')).toBe('Kylläisyys');
    expect(m.part('original-color').getAttribute('aria-label')).toBe(
      'Palauta alkuperäinen väri',
    );
  });
});

describe('visual', () => {
  it('closed field', async () => {
    const m = await mountPicker({ value: '#1f6feb' });

    await matchScreenshotInBothModes(m.stage, 'closed-field');
  });

  it('empty field', async () => {
    const m = await mountPicker();

    await matchScreenshotInBothModes(m.stage, 'empty-field');
  });

  it('translucent field', async () => {
    const m = await mountPicker({ alpha: true, value: '#1f6feb80' });

    await matchScreenshotInBothModes(m.stage, 'translucent-field');
  });

  it('open panel with swatches', async () => {
    const m = await mountPicker({ swatches: SWATCHES, value: '#1f6feb' });

    await open(m);

    await matchScreenshotInBothModes(m.part('panel'), 'open-panel');
  });

  it('open panel comparing a new colour with the original', async () => {
    const m = await mountPicker({ swatches: SWATCHES, value: '#1f6feb' });

    await open(m);
    await userEvent.click(swatches(m)[1]);
    await settle();

    await matchScreenshotInBothModes(m.part('panel'), 'open-panel-compared');
  });

  it('open panel with alpha in the RGB view', async () => {
    const m = await mountPicker({
      alpha: true,
      format: 'rgb',
      value: 'rgb(31 111 235 / 0.5)',
    });

    await open(m);

    await matchScreenshotInBothModes(m.part('panel'), 'open-panel-alpha');
  });

  it('swatch-only field and panel', async () => {
    const m = await mountPicker(
      { swatches: SWATCHES, value: '#e5534b' },
      { 'swatches-only': true },
    );

    await matchScreenshotInBothModes(m.stage, 'swatch-only-field');

    await userEvent.click(textInput(m));
    await settled();

    await matchScreenshotInBothModes(m.part('panel'), 'swatch-only-panel');
  });

  it('fullscreen panel', async () => {
    await page.viewport(360, 740);

    try {
      const m = await mountPicker({ swatches: SWATCHES, value: '#1f6feb' });

      await open(m);

      await matchScreenshotInBothModes(m.part('panel'), 'fullscreen-panel');
    } finally {
      await page.viewport(1280, 800);
    }
  });
});
