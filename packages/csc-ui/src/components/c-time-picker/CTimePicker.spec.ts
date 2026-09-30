/**
 * Behaviour spec for c-time-picker (CONTEXT.md "Time picker", "Time column",
 * "End switch", "Overnight range", "Bad input"; ADR-0061, ADR-0062).
 *
 * Fixtures carry a value, so the columns never rest on the wall clock —
 * except the one empty-open case, which reads the clock itself.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import type { Mounted } from '../../test/harness';

import { resetDefaults } from '../../shared/appDefaults';
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

const mountPicker = (
  props: Record<string, unknown> = {},
  attrs: Record<string, boolean | string> = {},
) =>
  mount<PickerHost>('c-time-picker', {
    attrs: { style: 'width: 320px', ...attrs },
    props: { label: 'Start time', ...props },
  });

const inputs = (m: Mounted): HTMLInputElement[] =>
  m.shadowAll('input[part~="input"]');

const isOpen = (m: Mounted): boolean =>
  m.part('panel').matches(':popover-open');

const clockButton = (m: Mounted): HTMLElement =>
  m.deep('c-icon-button[aria-label="Open time picker"]', 'button');

const open = async (m: Mounted): Promise<void> => {
  await userEvent.click(clockButton(m));
  await settled();

  expect(isOpen(m), 'the panel did not open').toBe(true);
};

const row = (m: Mounted, key: string): HTMLElement =>
  m.shadow(`li[data-key="${key}"]`);

const column = (m: Mounted, kind: string): HTMLElement =>
  m.shadow(`ul[data-column="${kind}"]`);

const keysOf = (m: Mounted, kind: string, which = 'li') =>
  Array.from(column(m, kind).querySelectorAll<HTMLElement>(which)).map(
    (li) => li.dataset.key,
  );

const focusedKey = (): null | string =>
  deepActiveElement()?.getAttribute('data-key') ?? null;

const type = async (input: HTMLInputElement, text: string) => {
  await userEvent.clear(input);
  await userEvent.type(input, text);
};

afterEach(() => {
  resetDefaults();
  document.documentElement.removeAttribute('lang');
});

describe('typing', () => {
  it('masks, commits on Enter, reformats, and emits once', async () => {
    const m = await mountPicker();

    const events = recordEvents(m.host, EVENTS);

    const [input] = inputs(m);

    await type(input, '930');

    expect(input.value).toBe('9.30');
    expect(events.of('change')).toHaveLength(0);

    await userEvent.keyboard('{Enter}');
    await settle();

    expect(events.of('change').map((r) => r.detail)).toEqual(['09:30']);
    expect(events.of('change:text').map((r) => r.detail)).toEqual(['9.30']);
    expect(m.host.value).toBe('09:30');
    expect(input.value).toBe('09.30');
    expect(isOpen(m), 'typing opened the panel').toBe(false);

    input.blur();
    await settle();

    expect(events.of('change')).toHaveLength(1);
  });

  it('types a 12-hour time with its period and commits on blur', async () => {
    const m = await mountPicker({ format: 'h:mm a' });

    const [input] = inputs(m);

    expect(input.inputMode).toBe('text');

    await type(input, '230p');

    expect(input.value).toBe('2:30 PM');

    input.blur();
    await settle();

    expect(m.host.value).toBe('14:30');
  });

  it('bad input keeps the text, commits null and flags the host', async () => {
    const m = await mountPicker({ value: '10:00' });

    const events = recordEvents(m.host, EVENTS);

    const [input] = inputs(m);

    await type(input, '25');
    await userEvent.keyboard('{Enter}');
    await settle();

    expect(input.value).toBe('25');
    expect(m.host.value).toBeNull();
    expect(m.host.badInput).toBe(true);
    expect(m.host.matches(':state(bad-input)')).toBe(true);
    expect(events.of('change').map((r) => r.detail)).toEqual([null]);
  });

  it('a time outside min and max is bad input; an off-step minute is not', async () => {
    const m = await mountPicker({ max: '17:00', min: '09:00', minuteStep: 15 });

    const [input] = inputs(m);

    await type(input, '8.00');
    await userEvent.keyboard('{Enter}');
    await settle();

    expect(m.host.badInput).toBe(true);

    await type(input, '14.07');
    await userEvent.keyboard('{Enter}');
    await settle();

    expect(m.host.badInput).toBe(false);
    expect(m.host.value).toBe('14:07');
  });

  it('shows the value set programmatically without emitting', async () => {
    const m = await mountPicker({ format: 'hh:mm a', value: '09:05' });

    const events = recordEvents(m.host, EVENTS);

    expect(inputs(m)[0].value).toBe('09:05 AM');

    m.host.value = '21:40';
    await settle();

    expect(inputs(m)[0].value).toBe('09:40 PM');
    expect(events.of('change')).toHaveLength(0);
  });
});

describe('opening', () => {
  it('opens from the clock button and from Alt+ArrowDown, never from a click in the text', async () => {
    const m = await mountPicker({ value: '14:30' });

    await userEvent.click(inputs(m)[0]);
    await settle();

    expect(isOpen(m)).toBe(false);

    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
    await settled();

    expect(isOpen(m)).toBe(true);

    await userEvent.keyboard('{Escape}');
    await settle();

    expect(isOpen(m)).toBe(false);
    expect(deepActiveElement()).toBe(inputs(m)[0]);

    await open(m);
  });

  it('is a dialog named by the label, focused on the value’s hour', async () => {
    const m = await mountPicker({ value: '14:30' });

    await open(m);

    expect(m.part('card').getAttribute('role')).toBe('dialog');
    expect(m.part('card').getAttribute('aria-label')).toBe('Start time');
    expect(
      m
        .shadowAll('ul[role="listbox"]')
        .map((l) => l.getAttribute('aria-label')),
    ).toEqual(['Hours', 'Minutes']);
    expect(focusedKey()).toBe('h14');
    expect(row(m, 'h14').getAttribute('aria-selected')).toBe('true');
    expect(row(m, 'm30').getAttribute('aria-selected')).toBe('true');
  });

  it('rests on the current hour when empty and commits nothing', async () => {
    const m = await mountPicker();

    const events = recordEvents(m.host, EVENTS);

    const hour = new Date().getHours();

    await open(m);

    expect(focusedKey()).toBe(`h${hour}`);
    expect(m.shadowAll('li[aria-selected="true"]')).toHaveLength(0);
    expect(events.of('change')).toHaveLength(0);
  });

  it('opens each column with its selected row at the top, ending on a peek', async () => {
    const m = await mountPicker({ value: '14:30' });

    await open(m);

    for (const [kind, key] of [
      ['hour', 'h14'],
      ['minute', 'm30'],
    ]) {
      const list = column(m, kind);

      const top = row(m, key).getBoundingClientRect().top;

      expect(top - list.getBoundingClientRect().top).toBeCloseTo(4, 0);

      // The list's bottom edge cuts a row in half (ADR-0043).
      const rows = Array.from(list.querySelectorAll('li'));

      const bottom = list.getBoundingClientRect().bottom;

      expect(
        rows.some((r) => {
          const box = r.getBoundingClientRect();

          return box.top < bottom && box.bottom > bottom;
        }),
      ).toBe(true);
    }
  });
});

describe('time columns', () => {
  it('moves and commits with the arrows, Home and End', async () => {
    const m = await mountPicker({ value: '14:30' });

    const events = recordEvents(m.host, EVENTS);

    await open(m);

    await userEvent.keyboard('{ArrowDown}');
    await settle();

    expect(focusedKey()).toBe('h15');

    await userEvent.keyboard('{ArrowUp}{ArrowUp}');
    await settle();

    expect(focusedKey()).toBe('h13');

    await userEvent.keyboard('{End}');
    await settle();

    expect(focusedKey()).toBe('h23');

    await userEvent.keyboard('{Home}');
    await settle();

    expect(focusedKey()).toBe('h0');
    expect(events.of('change').map((r) => r.detail)).toEqual([
      '15:30',
      '14:30',
      '13:30',
      '23:30',
      '00:30',
    ]);
    expect(isOpen(m)).toBe(true);
  });

  it('a click commits the row and keeps the panel open', async () => {
    const m = await mountPicker({ value: '14:30' });

    await open(m);
    await userEvent.click(row(m, 'm45'));
    await settle();

    expect(m.host.value).toBe('14:45');
    expect(isOpen(m)).toBe(true);
    expect(focusedKey()).toBe('m45');
  });

  it('Enter closes and returns focus to the input', async () => {
    const m = await mountPicker({ value: '14:30' });

    await open(m);
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await settle();

    expect(m.host.value).toBe('15:30');
    expect(isOpen(m)).toBe(false);
    expect(deepActiveElement()).toBe(inputs(m)[0]);
  });

  it('Tab cycles through the columns inside the panel', async () => {
    const m = await mountPicker({ format: 'h:mm a', value: '14:30' });

    await open(m);

    const seen: (null | string)[] = [];

    for (let i = 0; i < 4; i++) {
      await userEvent.keyboard('{Tab}');
      seen.push(focusedKey());
    }

    expect(isOpen(m)).toBe(true);
    expect(seen).toEqual(['m30', 'pm', 'h14', 'm30']);
  });

  it('thins the minutes by the step and keeps an off-step minute as a row', async () => {
    const m = await mountPicker({ minuteStep: 15, value: '14:07' });

    await open(m);

    expect(keysOf(m, 'minute')).toEqual(['m0', 'm7', 'm15', 'm30', 'm45']);
  });

  it('a pick never leaves min and max: the minute clamps to the bound', async () => {
    const m = await mountPicker({ max: '17:00', min: '09:30', value: '10:15' });

    await open(m);

    expect(row(m, 'h8').getAttribute('aria-disabled')).toBe('true');
    expect(row(m, 'h9').getAttribute('aria-disabled')).toBeNull();

    await userEvent.click(row(m, 'h9'));
    await settle();

    expect(m.host.value).toBe('09:30');
    expect(row(m, 'm15').getAttribute('aria-disabled')).toBe('true');
    expect(row(m, 'm30').getAttribute('aria-disabled')).toBeNull();

    // The arrows skip disabled rows.
    await userEvent.click(row(m, 'h10'));
    await userEvent.keyboard('{ArrowUp}{ArrowUp}');
    await settle();

    expect(focusedKey()).toBe('h9');
  });

  it('a disabled row is inked dimmer than hint text', async () => {
    const m = await mountPicker({ max: '17:00', min: '09:30', value: '10:15' });

    await open(m);

    const ink = (el: HTMLElement) => getComputedStyle(el).color;
    const probe = document.createElement('span');

    probe.style.color = 'var(--c-on-surface-muted)';
    m.stage.append(probe);

    expect(ink(row(m, 'h8'))).not.toBe(ink(row(m, 'h10')));
    expect(ink(row(m, 'h8'))).not.toBe(ink(probe));
  });

  it('a 12-hour clock lists 12, 1…11 and a period column that flips the hour', async () => {
    const m = await mountPicker({ format: 'h:mm a', value: '09:15' });

    await open(m);

    expect(
      Array.from(column(m, 'hour').querySelectorAll('li')).map((li) =>
        li.textContent?.trim(),
      ),
    ).toEqual(['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11']);

    await userEvent.click(row(m, 'pm'));
    await settle();

    expect(m.host.value).toBe('21:15');
    expect(inputs(m)[0].value).toBe('9:15 PM');
  });

  it('warns about a min after max and ignores both', async () => {
    const m = await mountPicker({ max: '06:00', min: '22:00', value: '12:00' });

    consoleSpy.expect(/min "22:00" is after max "06:00"/);

    await open(m);

    expect(m.shadowAll('li[aria-disabled="true"]')).toHaveLength(0);
  });
});

describe('range', () => {
  const mountRange = (value: unknown = null) =>
    mountPicker({ label: 'Shift', value }, { range: true });

  it('the end switch picks the end the columns commit; an overnight range stays', async () => {
    const m = await mountRange();

    const events = recordEvents(m.host, EVENTS);

    await open(m);

    const tabs = m.shadowAll('[part~="end-tab"]');

    expect(tabs.map((t) => t.getAttribute('aria-selected'))).toEqual([
      'true',
      'false',
    ]);

    await userEvent.click(row(m, 'h22'));
    await userEvent.click(tabs[1]);
    await settle();
    await userEvent.click(row(m, 'h6'));
    await settle();

    expect(events.of('change').map((r) => r.detail)).toEqual([
      { end: null, start: '22:00' },
      { end: '06:00', start: '22:00' },
    ]);
    expect(inputs(m).map((i) => i.value)).toEqual(['22.00', '06.00']);
  });

  it('opens on the end last typed in, and the arrows switch ends', async () => {
    const m = await mountRange({ end: '17:00', start: '09:00' });

    await userEvent.click(inputs(m)[1]);
    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
    await settled();

    expect(focusedKey()).toBe('h17');

    await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
    await userEvent.keyboard('{ArrowLeft}');
    await settle();

    expect(
      m.shadow('[part~="end-tab"][aria-selected="true"]').dataset.end,
    ).toBe('start');
    expect(row(m, 'h9').getAttribute('aria-selected')).toBe('true');
  });

  it('keeps a typed reversed range as typed', async () => {
    const m = await mountRange();

    const [start, end] = inputs(m);

    await type(start, '2200');
    await type(end, '0600');
    end.blur();
    await settle();

    expect(m.host.value).toEqual({ end: '06:00', start: '22:00' });
  });
});

describe('texts', () => {
  it('takes AM/PM from Intl for the page lang, under explicit texts', async () => {
    document.documentElement.lang = 'fi';

    const m = await mountPicker({
      format: 'h.mm a',
      texts: { openClock: 'Valitse aika' },
      value: '15:00',
    });

    await userEvent.click(
      m.deep('c-icon-button[aria-label="Valitse aika"]', 'button'),
    );
    await settled();

    expect(row(m, 'pm').textContent?.trim()).toBe('ip.');
    expect(inputs(m)[0].value).toBe('3.00 ip.');
  });
});

describe('fullscreen panel', () => {
  afterEach(async () => {
    await page.viewport(1280, 800);
  });

  it('covers the viewport with a heading row above the columns', async () => {
    await page.viewport(360, 740);

    const m = await mountPicker({ value: '14:30' });

    await open(m);

    const rect = m.part('panel').getBoundingClientRect();

    expect(rect.top).toBe(0);
    expect(rect.width).toBe(document.documentElement.clientWidth);
    expect(m.part('heading').textContent?.trim()).toBe('Start time');
    expect(focusedKey()).toBe('h14');

    await userEvent.click(m.part('close'));
    await settle();

    expect(isOpen(m)).toBe(false);
  });
});

describe('field', () => {
  it('keeps the control height with one input and with a range', async () => {
    const single = await mountPicker({ value: '14:30' });

    const range = await mountPicker(
      { value: { end: '17:00', start: '09:00' } },
      { range: true },
    );

    for (const m of [single, range]) {
      expect(
        m.deep('c-input', '.c-input__slot').getBoundingClientRect().height,
      ).toBe(52);
    }
  });
});

describe('visual', () => {
  it('closed field', async () => {
    const m = await mountPicker({ value: '14:30' });

    await matchScreenshotInBothModes(m.stage, 'closed-field');
  });

  it('open panel', async () => {
    const m = await mountPicker({ value: '14:30' });

    await open(m);

    await matchScreenshotInBothModes(m.part('panel'), 'open-panel');
  });

  it('12-hour panel with bounds', async () => {
    const m = await mountPicker({
      format: 'h:mm a',
      max: '17:00',
      min: '09:30',
      minuteStep: 5,
      value: '09:45',
    });

    await open(m);

    await matchScreenshotInBothModes(m.part('panel'), 'twelve-hour-panel');
  });

  it('range with the end switch', async () => {
    const m = await mountPicker(
      { label: 'Shift', value: { end: '06:00', start: '22:00' } },
      { range: true },
    );

    await open(m);

    await matchScreenshotInBothModes(m.part('panel'), 'range-panel');
  });
});
