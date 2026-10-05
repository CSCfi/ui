/**
 * Behaviour spec for c-time-picker (CONTEXT.md "Time picker", "Time column",
 * "End switch", "Overnight range", "Bad input", "Now button", "Pending value",
 * "Done button"; ADR-0061, ADR-0062, ADR-0065, ADR-0066).
 *
 * Fixtures carry a value, so the columns never rest on the wall clock —
 * except the one empty-open case and the Now button's cases, which read the
 * clock themselves.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
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
import { nowTime, toMinutes } from './times';

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

// How far a row's top sits below its column's top edge.
const restOffset = (m: Mounted, kind: string, key: string): number =>
  row(m, key).getBoundingClientRect().top -
  column(m, kind).getBoundingClientRect().top;

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

  it('opens each column with its selected row at its resting place, ending on a peek', async () => {
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
  it('rests a late row at the top: the room is padding, not rows', async () => {
    const m = await mountPicker({ minuteStep: 5, value: '23:55' });

    await open(m);

    for (const [kind, key] of [
      ['hour', 'h23'],
      ['minute', 'm55'],
    ]) {
      const list = column(m, kind);

      const top = row(m, key).getBoundingClientRect().top;

      expect(top - list.getBoundingClientRect().top).toBeCloseTo(4, 0);
    }

    expect(column(m, 'hour').querySelectorAll('li')).toHaveLength(24);
    expect(column(m, 'minute').querySelectorAll('li')).toHaveLength(12);
    expect(
      Array.from(m.shadowAll('ul[data-column] > *')).every(
        (li) => li.getAttribute('role') === 'option',
      ),
    ).toBe(true);
  });

  it('a column that fits the anchored panel gets no room and never scrolls', async () => {
    const m = await mountPicker({
      format: 'h:mm a',
      minuteStep: 15,
      value: '21:45',
    });

    await open(m);

    for (const kind of ['minute', 'period']) {
      const list = column(m, kind);

      expect(list.style.paddingBlock, kind).toBe('');
      expect(list.scrollTop, kind).toBe(0);
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

  it('a 12-hour clock lists 1…11, 12 and a period column that flips the hour', async () => {
    const m = await mountPicker({ format: 'h:mm a', value: '09:15' });

    await open(m);

    expect(
      Array.from(column(m, 'hour').querySelectorAll('li')).map((li) =>
        li.textContent?.trim(),
      ),
    ).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']);

    await userEvent.click(row(m, 'pm'));
    await settle();

    expect(m.host.value).toBe('21:15');
    expect(inputs(m)[0].value).toBe('9:15 PM');
  });

  it('the 12-hour keys follow the list, so 12 comes after 11', async () => {
    const m = await mountPicker({ format: 'h:mm a', value: '11:15' });

    await open(m);
    await userEvent.keyboard('{ArrowDown}');
    await settle();

    expect(focusedKey()).toBe('h0');
    expect(m.host.value).toBe('00:15');

    await userEvent.keyboard('{Home}');
    await settle();

    expect(focusedKey()).toBe('h1');
    expect(m.host.value).toBe('01:15');
  });

  it('warns about a min after max and ignores both', async () => {
    const m = await mountPicker({ max: '06:00', min: '22:00', value: '12:00' });

    consoleSpy.expect(/min "22:00" is after max "06:00"/);

    await open(m);

    expect(m.shadowAll('li[aria-disabled="true"]')).toHaveLength(0);
  });
  describe('resting after a pick', () => {
    it('a click rests the picked row at the top', async () => {
      const m = await mountPicker({ value: '14:30' });

      await open(m);
      await userEvent.click(row(m, 'm33'));
      await settle();

      expect(m.host.value).toBe('14:33');
      expect(restOffset(m, 'minute', 'm33')).toBeCloseTo(4, 0);
    });

    it('the arrow keys keep the selected row at the top', async () => {
      const m = await mountPicker({ value: '09:00' });

      await open(m);
      await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
      await settle();

      expect(m.host.value).toBe('12:00');
      expect(focusedKey()).toBe('h12');
      expect(restOffset(m, 'hour', 'h12')).toBeCloseTo(4, 0);

      await userEvent.keyboard('{End}');
      await settle();

      expect(restOffset(m, 'hour', 'h23')).toBeCloseTo(4, 0);
    });

    it('a minute filled in or clamped rests too', async () => {
      const empty = await mountPicker();

      await open(empty);
      column(empty, 'minute').scrollTop = 400;
      await userEvent.click(row(empty, 'h9'));
      await settle();

      expect(empty.host.value).toBe('09:00');
      expect(restOffset(empty, 'minute', 'm0')).toBeCloseTo(4, 0);
      empty.unmount();

      const bounded = await mountPicker({
        max: '17:00',
        min: '09:30',
        value: '10:15',
      });

      await open(bounded);
      await userEvent.click(row(bounded, 'h9'));
      await settle();

      expect(bounded.host.value).toBe('09:30');
      expect(restOffset(bounded, 'minute', 'm30')).toBeCloseTo(4, 0);
    });

    it('a column whose selection did not change keeps its scroll', async () => {
      const m = await mountPicker({ value: '14:30' });

      await open(m);

      const minutes = column(m, 'minute');

      minutes.scrollTop = 120;
      await settle();
      await userEvent.click(row(m, 'h16'));
      await settle();

      expect(m.host.value).toBe('16:30');
      expect(minutes.scrollTop).toBe(120);
    });

    it('a column that fits stays still on a pick', async () => {
      const m = await mountPicker({
        format: 'h:mm a',
        minuteStep: 15,
        value: '09:00',
      });

      await open(m);
      await userEvent.click(row(m, 'pm'));
      await userEvent.click(row(m, 'm45'));
      await settle();

      expect(m.host.value).toBe('21:45');
      expect(column(m, 'period').scrollTop).toBe(0);
      expect(column(m, 'minute').scrollTop).toBe(0);
    });

    it('scrolls smoothly unless motion is reduced', async () => {
      const real = window.matchMedia.bind(window);

      vi.spyOn(window, 'matchMedia').mockImplementation((query) =>
        query.includes('prefers-reduced-motion')
          ? ({ ...real(query), matches: false } as MediaQueryList)
          : real(query),
      );

      try {
        const m = await mountPicker({ value: '14:30' });

        await open(m);

        const scrollTo = vi.spyOn(column(m, 'minute'), 'scrollTo');

        await userEvent.click(row(m, 'm33'));
        await settle();

        expect(scrollTo).toHaveBeenCalledWith(
          expect.objectContaining({ behavior: 'smooth' }),
        );
      } finally {
        vi.restoreAllMocks();
      }
    });
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

  it('a pick rests the new row in the middle', async () => {
    await page.viewport(360, 740);

    const m = await mountPicker({ value: '14:30' });

    await open(m);
    await userEvent.keyboard('{ArrowDown}');
    await settle();

    const list = column(m, 'hour').getBoundingClientRect();

    const box = row(m, 'h15').getBoundingClientRect();

    expect(
      Math.abs(box.top + box.height / 2 - (list.top + list.height / 2)),
    ).toBeLessThanOrEqual(1);
  });

  it('rests again when the viewport resizes the panel', async () => {
    await page.viewport(360, 740);

    const m = await mountPicker({ value: '14:30' });

    await open(m);
    await page.viewport(360, 560);
    await settle();
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );

    const list = column(m, 'hour').getBoundingClientRect();

    const box = row(m, 'h14').getBoundingClientRect();

    expect(list.height).toBeLessThan(500);
    expect(
      Math.abs(box.top + box.height / 2 - (list.top + list.height / 2)),
    ).toBeLessThanOrEqual(1);
  });

  it('rests the selected rows in the middle, the first and last rows too', async () => {
    await page.viewport(360, 740);

    for (const [value, keys] of [
      ['14:30', ['h14', 'm30']],
      ['00:00', ['h0', 'm0']],
      ['23:59', ['h23', 'm59']],
    ] as const) {
      const m = await mountPicker({ value });

      await open(m);

      keys.forEach((key, i) => {
        const list = column(m, i ? 'minute' : 'hour').getBoundingClientRect();

        const box = row(m, key).getBoundingClientRect();

        expect(
          Math.abs(box.top + box.height / 2 - (list.top + list.height / 2)),
          key,
        ).toBeLessThanOrEqual(1);
      });

      await userEvent.keyboard('{Escape}');
      await settle();
      m.unmount();
    }
  });

  it('a column that fits a tall panel rests in the middle too, so the selections line up', async () => {
    // Tall enough that the hours and AM/PM fit; the minutes overflow.
    await page.viewport(500, 1200);

    const m = await mountPicker({ format: 'h:mm a', value: '14:30' });

    await open(m);

    const offCentre = (kind: string, key: string) => {
      const list = column(m, kind).getBoundingClientRect();

      const box = row(m, key).getBoundingClientRect();

      return Math.abs(box.top + box.height / 2 - (list.top + list.height / 2));
    };

    expect(column(m, 'hour').clientHeight).toBeGreaterThan(12 * 40);

    for (const [kind, key] of [
      ['hour', 'h14'],
      ['minute', 'm30'],
      ['period', 'pm'],
    ])
      expect(offCentre(kind, key), key).toBeLessThanOrEqual(1);

    await userEvent.click(row(m, 'h16'));
    await settle();

    expect(row(m, 'h16').getAttribute('aria-selected')).toBe('true');
    expect(offCentre('hour', 'h16')).toBeLessThanOrEqual(1);

    await userEvent.click(m.part('done'));
    await settle();

    expect(m.host.value).toBe('16:30');
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

  it('sizes the clock button by the field, its icon on the same edge', async () => {
    const regular = await mountPicker({ clearable: true, value: '14:30' });

    const small = await mountPicker({
      clearable: true,
      size: 'small',
      value: '14:30',
    });

    for (const [m, button, icon] of [
      [regular, 40, 24],
      [small, 28, 20],
    ] as const) {
      const border = m
        .deep('c-input', '.c-input__fieldset')
        .getBoundingClientRect();

      const glyph = m
        .deep('c-icon-button[aria-label="Open time picker"] > c-icon', 'svg')
        .getBoundingClientRect();

      expect(clockButton(m).getBoundingClientRect().width).toBe(button);
      expect(glyph.width).toBe(icon);
      expect(border.right - glyph.right).toBe(10);
      expect(
        m
          .deep('c-icon-button[aria-label="Clear selection"]', 'button')
          .getBoundingClientRect().width,
      ).toBe(28);
    }
  });
});

describe('focus ring', () => {
  afterEach(async () => {
    await page.viewport(1280, 800);
  });

  /** The outline a control paints, and the ink it sits beside. */
  const ringOf = (el: Element) => {
    const style = getComputedStyle(el);

    return {
      color: style.outlineColor,
      ink: style.color,
      ring: `${style.outlineStyle} ${style.outlineWidth}`,
    };
  };

  /** One Tab round of the panel's focus trap: each stop's name and ring. */
  const tabRound = async (ringed: (el: Element) => Element = (el) => el) => {
    const first = deepActiveElement()!;

    const stops: ({ name: string; selected: boolean } & ReturnType<
      typeof ringOf
    >)[] = [];

    let el: Element = first;

    do {
      expect(el.matches(':focus-visible'), el.outerHTML.slice(0, 80)).toBe(
        true,
      );
      stops.push({
        name: el.getAttribute('part') ?? el.localName,
        selected: el.getAttribute('aria-selected') === 'true',
        ...ringOf(ringed(el)),
      });
      await userEvent.keyboard('{Tab}');
      await settle();
      el = deepActiveElement()!;
    } while (el !== first && stops.length < 16);

    return stops;
  };

  // A mouse-focused field, then the Alt chord alone: the browsers' own
  // heuristics see no keyboard there (Chrome ignores the chord, Firefox keeps
  // the mouse), so the panel rings only under keyboard modality.
  const openFromKeyboard = async (m: Mounted) => {
    await userEvent.click(inputs(m)[0]);
    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
  };

  it('rings the hour column after a mouse-focused field and Alt+ArrowDown', async () => {
    const m = await mountPicker({ value: '14:30' });

    await openFromKeyboard(m);
    await settled();

    const row = deepActiveElement()!;

    expect(row.getAttribute('part')).toBe('option');
    expect(row.matches(':focus-visible')).toBe(true);
    expect(ringOf(row).ring).toBe('solid 2px');
  });

  it('paints a 2px ring on every stop reached from the keyboard', async () => {
    const m = await mountPicker(
      { value: { end: '17:00', start: '09:30' } },
      { range: true, 'show-now': true },
    );

    await openFromKeyboard(m);
    await settle();
    await userEvent.keyboard('{ArrowDown}');
    await settle();

    const stops = await tabRound();

    expect(new Set(stops.map((s) => s.name))).toEqual(
      new Set(['end-tab', 'now', 'option']),
    );

    for (const stop of stops) expect(stop.ring, stop.name).toBe('solid 2px');
  });

  it('rings the selected end tab in its own ink, inside the fill', async () => {
    const m = await mountPicker(
      { value: { end: '17:00', start: '09:30' } },
      { range: true },
    );

    await openFromKeyboard(m);
    await settle();

    const tabs = (await tabRound()).filter((s) => s.name === 'end-tab');

    const selected = tabs.find((s) => s.selected)!;

    const other = tabs.find((s) => !s.selected)!;

    expect(selected.color).toBe(selected.ink);
    expect(other.color).not.toBe(selected.color);
  });

  it('rings the close button and Done in the fullscreen panel', async () => {
    await page.viewport(360, 740);

    const m = await mountPicker({ value: '14:30' }, { 'show-now': true });

    await openFromKeyboard(m);
    await settled();
    await userEvent.keyboard('{ArrowDown}');
    await settle();

    const stops = await tabRound();

    expect(stops.map((s) => s.name)).toEqual(
      expect.arrayContaining(['close', 'done', 'now', 'option']),
    );

    for (const stop of stops) expect(stop.ring, stop.name).toBe('solid 2px');
  });
});

describe('Now button (ADR-0065)', () => {
  // Each case accepts now read before or after the press, so a minute that
  // turns mid-test cannot flake it.
  const nowButton = (m: Mounted) => m.part('now') as HTMLButtonElement;

  it('is opt-in, and an app default turns it on', async () => {
    const off = await mountPicker({ value: '14:30' });

    expect(off.shadowAll('[part~="actions"]')).toHaveLength(0);

    applyDefaults({ 'c-time-picker': { showNow: true } });

    const on = await mountPicker({ value: '14:30' });

    expect(nowButton(on).textContent?.trim()).toBe('Now');
  });

  it('commits the exact minute whatever the step, closes and returns focus to the input', async () => {
    const m = await mountPicker({ minuteStep: 15, showNow: true });

    const events = recordEvents(m.host, EVENTS);

    await open(m);

    const before = nowTime();

    await userEvent.click(nowButton(m));
    await settle();

    expect([before, nowTime()]).toContain(m.host.value);
    expect(events.of('change').map((r) => r.detail)).toEqual([m.host.value]);
    expect(events.of('change:text')).toHaveLength(0);
    expect(isOpen(m)).toBe(false);
    expect(deepActiveElement()).toBe(inputs(m)[0]);
  });

  it('under range sets the end being edited', async () => {
    const m = await mountPicker(
      {
        label: 'Shift',
        showNow: true,
        value: { end: '06:00', start: '22:00' },
      },
      { range: true },
    );

    await open(m);
    await userEvent.click(m.shadowAll('[part~="end-tab"]')[1]);
    await settle();

    const before = nowTime();

    await userEvent.click(nowButton(m));
    await settle();

    const { end, start } = m.host.value as { end: string; start: string };

    expect(start).toBe('22:00');
    expect([before, nowTime()]).toContain(end);
    expect(isOpen(m)).toBe(false);
  });

  it('is the last Tab stop', async () => {
    const m = await mountPicker({ showNow: true, value: '14:30' });

    await open(m);

    const seen: (null | string)[] = [];

    for (let i = 0; i < 3; i++) {
      await userEvent.keyboard('{Tab}');
      seen.push(
        focusedKey() ?? deepActiveElement()?.getAttribute('part') ?? null,
      );
    }

    expect(seen).toEqual(['m30', 'now', 'h14']);
  });

  it('is disabled while now is outside min and max, and a press emits nothing', async () => {
    // A half-hour window that holds neither now nor the next minute.
    const window =
      toMinutes(nowTime()) < 60
        ? { max: '23:30', min: '23:00', value: '23:15' }
        : { max: '00:30', min: '00:00', value: '00:15' };

    const m = await mountPicker({ showNow: true, ...window });

    const events = recordEvents(m.host, EVENTS);

    await open(m);

    expect(nowButton(m).disabled).toBe(true);

    nowButton(m).click();
    await settle();

    expect(events.of('change')).toHaveLength(0);
    expect(isOpen(m)).toBe(true);
  });

  it('takes its label from texts', async () => {
    const m = await mountPicker({ showNow: true, texts: { now: 'Nyt' } });

    expect(nowButton(m).textContent?.trim()).toBe('Nyt');
  });

  it('sits at the bottom edge of the fullscreen panel', async () => {
    await page.viewport(360, 740);

    try {
      const m = await mountPicker({ showNow: true, value: '14:30' });

      await open(m);

      expect(m.part('actions').getBoundingClientRect().bottom).toBe(
        m.part('panel').getBoundingClientRect().bottom,
      );
    } finally {
      await page.viewport(1280, 800);
    }
  });
});

describe('Done button (ADR-0066)', () => {
  // The fullscreen panel collects picks in a pending value; Done commits it
  // and every other way out discards it.
  afterEach(async () => {
    await page.viewport(1280, 800);
  });

  const done = (m: Mounted) => m.part('done') as HTMLButtonElement;

  const mountNarrow = async (
    props: Record<string, unknown> = {},
    attrs: Record<string, boolean | string> = {},
  ) => {
    await page.viewport(360, 740);

    return mountPicker(props, attrs);
  };

  const selected = (m: Mounted, key: string) =>
    row(m, key).getAttribute('aria-selected');

  const tap = async (el: HTMLElement) => {
    await userEvent.click(el);
    await settle();
  };

  it('is in the fullscreen panel only, at the end of the row under the columns', async () => {
    const wide = await mountPicker({ value: '14:30' });

    await open(wide);

    expect(wide.shadowAll('[part~="done"]')).toHaveLength(0);

    await userEvent.keyboard('{Escape}');
    await settle();
    wide.unmount();

    const m = await mountNarrow({ showNow: true, value: '14:30' });

    await open(m);

    expect(done(m).textContent?.trim()).toBe('Done');
    expect(m.part('actions').getBoundingClientRect().bottom).toBe(
      m.part('panel').getBoundingClientRect().bottom,
    );
    expect(done(m).getBoundingClientRect().left).toBeGreaterThan(
      m.part('now').getBoundingClientRect().right,
    );
  });

  it('picks and arrow keys only select; Done commits once, closes and returns focus', async () => {
    const m = await mountNarrow({ value: '14:30' });

    const events = recordEvents(m.host, EVENTS);

    await open(m);
    await tap(row(m, 'h16'));
    await userEvent.keyboard('{ArrowDown}');
    await settle();
    await tap(row(m, 'm45'));

    expect(selected(m, 'h17')).toBe('true');
    expect(selected(m, 'm45')).toBe('true');
    expect(events.of('change')).toHaveLength(0);
    expect(m.host.value).toBe('14:30');
    expect(inputs(m)[0].value).toBe('14.30');
    expect(isOpen(m)).toBe(true);

    await tap(done(m));

    expect(events.of('change').map((r) => r.detail)).toEqual(['17:45']);
    expect(isOpen(m)).toBe(false);
    expect(deepActiveElement()).toBe(inputs(m)[0]);
  });

  it('the close button, Escape and leaving the narrow viewport discard the picks', async () => {
    const m = await mountNarrow({ value: '14:30' });

    const events = recordEvents(m.host, EVENTS);

    const exits: [string, () => Promise<unknown>][] = [
      ['close', () => userEvent.click(m.part('close'))],
      ['Escape', () => userEvent.keyboard('{Escape}')],
      ['threshold', () => page.viewport(1280, 800)],
    ];

    for (const [name, exit] of exits) {
      await open(m);
      await tap(row(m, 'h16'));
      await exit();
      await settle();

      expect(isOpen(m), name).toBe(false);
      expect(m.host.value, name).toBe('14:30');

      await open(m);

      expect(selected(m, 'h14'), name).toBe('true');
      expect(selected(m, 'h16'), name).toBe('false');

      await userEvent.keyboard('{Escape}');
      await settle();
    }

    expect(events.of('change')).toHaveLength(0);
  });

  it('Done with no pick leaves an empty field empty', async () => {
    const m = await mountNarrow();

    const events = recordEvents(m.host, EVENTS);

    await open(m);
    await tap(done(m));

    expect(isOpen(m)).toBe(false);
    expect(m.host.value).toBe(null);
    expect(events.of('change')).toHaveLength(0);
  });

  it('under range, both ends wait across the end switch and Done commits them together', async () => {
    const m = await mountNarrow({ label: 'Shift' }, { range: true });

    const events = recordEvents(m.host, EVENTS);

    await open(m);
    await tap(row(m, 'h22'));
    await tap(m.shadowAll<HTMLElement>('[part~="end-tab"]')[1]);
    await tap(row(m, 'h6'));

    expect(events.of('change')).toHaveLength(0);

    await tap(done(m));

    expect(events.of('change').map((r) => r.detail)).toEqual([
      { end: '06:00', start: '22:00' },
    ]);
  });

  it('Enter selects the focused row and commits', async () => {
    const m = await mountNarrow({ value: '14:30' });

    const events = recordEvents(m.host, EVENTS);

    await open(m);
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await settle();

    expect(isOpen(m)).toBe(false);
    expect(events.of('change').map((r) => r.detail)).toEqual(['15:30']);
  });

  it('Now moves the columns to the current minute and waits for Done', async () => {
    const m = await mountNarrow({ showNow: true, value: '00:00' });

    const events = recordEvents(m.host, EVENTS);

    await open(m);

    const before = nowTime();

    await tap(m.part('now'));
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const now = [before, nowTime()].find(
      (time) =>
        selected(m, `m${Number(time.slice(3))}`) === 'true' &&
        selected(m, `h${Number(time.slice(0, 2))}`) === 'true',
    );

    expect(now, 'the columns do not show now').toBeDefined();
    expect(isOpen(m)).toBe(true);
    expect(events.of('change')).toHaveLength(0);

    const list = column(m, 'hour').getBoundingClientRect();

    const box = row(m, `h${Number(now!.slice(0, 2))}`).getBoundingClientRect();

    expect(
      Math.abs(box.top + box.height / 2 - (list.top + list.height / 2)),
    ).toBeLessThanOrEqual(1);

    await tap(done(m));

    expect(events.of('change').map((r) => r.detail)).toEqual([now]);
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

  it('fullscreen panel', async () => {
    await page.viewport(360, 740);

    try {
      const m = await mountPicker({ showNow: true, value: '14:30' });

      await open(m);

      await matchScreenshotInBothModes(m.part('panel'), 'fullscreen-panel');
    } finally {
      await page.viewport(1280, 800);
    }
  });

  it('Now button', async () => {
    // No bounds, so the button is enabled whatever the time.
    const m = await mountPicker({ showNow: true, value: '14:30' });

    await open(m);

    await matchScreenshotInBothModes(m.part('panel'), 'now-button');
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
