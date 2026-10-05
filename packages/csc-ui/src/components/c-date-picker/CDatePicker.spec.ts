/**
 * Behaviour spec for c-date-picker (CONTEXT.md "Date picker", "Day grid",
 * "Pending start", "Pending value", "Bad input", "Month step", "Today button",
 * "Done button"; ADR-0057, ADR-0058, ADR-0063, ADR-0065, ADR-0066).
 *
 * Every fixture pins its month with `value` or `min`/`max` far from today,
 * so no assertion or baseline depends on the wall clock — except the Today
 * button's cases, which read the clock around each press.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import type { Mounted } from '../../test/harness';

import { applyDefaults, resetDefaults } from '../../shared/appDefaults';
import {
  deepActiveElement,
  matchScreenshotInBothModes,
  mount,
  recordEvents,
  settle,
  settled,
} from '../../test/harness';
import { addDays, todayIso } from './dates';

type PickerHost = { badInput: boolean; value: unknown } & HTMLElement;

const EVENTS = ['change', 'update:value', 'change:text', 'change:month'];

const mountPicker = (
  props: Record<string, unknown> = {},
  attrs: Record<string, boolean | string> = {},
) =>
  mount<PickerHost>('c-date-picker', {
    attrs: { style: 'width: 320px', ...attrs },
    props: { label: 'Start date', ...props },
  });

const inputs = (m: Mounted): HTMLInputElement[] =>
  m.shadowAll('input[part~="input"]');

const isOpen = (m: Mounted): boolean =>
  m.part('panel').matches(':popover-open');

const calendarButton = (m: Mounted): HTMLElement =>
  m.deep('c-icon-button[aria-label="Open calendar"]', 'button');

const open = async (m: Mounted): Promise<void> => {
  await userEvent.click(calendarButton(m));
  await settle();

  expect(isOpen(m), 'the panel did not open').toBe(true);
};

const cell = (m: Mounted, iso: string): HTMLElement =>
  m.shadow(`td[data-date="${iso}"]`);

const focusedIso = (): null | string =>
  deepActiveElement()?.getAttribute('data-date') ?? null;

/** Jump every running calendar animation to its end, then let Vue remove outgoing elements. */
const finishAnimations = async (m: Mounted): Promise<void> => {
  for (const a of m.part('panel').getAnimations({ subtree: true })) a.finish();
  await settle();
};

/** An animation's keyframes: `getKeyframes` is on `KeyframeEffect`, not the base `AnimationEffect`. */
const keyframes = (animation: Animation | undefined): ComputedKeyframe[] =>
  (animation?.effect as KeyframeEffect | null | undefined)?.getKeyframes() ??
  [];

const type = async (input: HTMLInputElement, text: string) => {
  await userEvent.clear(input);
  await userEvent.type(input, text);
};

afterEach(() => {
  resetDefaults();
  document.documentElement.removeAttribute('lang');
});

describe('typing', () => {
  it('commits on Enter, reformats, and emits once', async () => {
    const m = await mountPicker();

    const events = recordEvents(m.host, EVENTS);

    const [input] = inputs(m);

    await type(input, '1.9.2031');

    expect(events.of('change')).toHaveLength(0);

    await userEvent.keyboard('{Enter}');
    await settle();

    expect(events.of('change').map((r) => r.detail)).toEqual(['2031-09-01']);
    expect(events.of('change:text').map((r) => r.detail)).toEqual(['1.9.2031']);
    expect(m.host.value).toBe('2031-09-01');
    expect(input.value).toBe('01.09.2031');
    expect(isOpen(m), 'typing opened the panel').toBe(false);

    // Leaving the unchanged field commits nothing more.
    input.blur();
    await settle();

    expect(events.of('change')).toHaveLength(1);
  });

  it('inserts the format separators while typing (ADR-0059)', async () => {
    const m = await mountPicker({ format: 'd.M.yyyy' });

    const events = recordEvents(m.host, EVENTS);

    const [input] = inputs(m);

    await type(input, '4x92031');

    expect(input.value).toBe('4.9.2031');

    await type(input, '12/3/2031');

    expect(input.value).toBe('12.3.2031');
    expect(events.of('change')).toHaveLength(0);

    await userEvent.keyboard('{Enter}');
    await settle();

    expect(m.host.value).toBe('2031-03-12');
  });

  it('keeps pasted text for the lenient commit', async () => {
    const m = await mountPicker();

    const [input] = inputs(m);

    input.focus();
    input.value = '2031-09-01';
    input.dispatchEvent(
      new InputEvent('input', { bubbles: true, inputType: 'insertFromPaste' }),
    );
    await settle();

    expect(input.value).toBe('2031-09-01');

    await userEvent.keyboard('{Enter}');
    await settle();

    expect(m.host.value).toBeNull();
    expect(m.host.badInput).toBe(true);
  });

  it('commits on blur', async () => {
    const m = await mountPicker();

    const events = recordEvents(m.host, EVENTS);

    await type(inputs(m)[0], '28.02.2031');
    inputs(m)[0].blur();
    await settle();

    expect(events.of('change').map((r) => r.detail)).toEqual(['2031-02-28']);
  });

  it('bad input keeps the text, commits null and flags the host', async () => {
    const m = await mountPicker({ value: '2031-09-01' });

    const events = recordEvents(m.host, EVENTS);

    const [input] = inputs(m);

    await type(input, '31.02.2031');
    await userEvent.keyboard('{Enter}');
    await settle();

    expect(input.value).toBe('31.02.2031');
    expect(m.host.value).toBeNull();
    expect(events.of('change').map((r) => r.detail)).toEqual([null]);
    expect(events.of('change:text').map((r) => r.detail)).toEqual([
      '31.02.2031',
    ]);
    expect(m.host.badInput).toBe(true);
    expect(m.host.matches(':state(bad-input)')).toBe(true);

    await type(input, '1.3.2031');
    await userEvent.keyboard('{Enter}');
    await settle();

    expect(m.host.badInput).toBe(false);
    expect(m.host.matches(':state(bad-input)')).toBe(false);
    expect(m.host.value).toBe('2031-03-01');
  });

  it('a disabled or out-of-range date is bad input', async () => {
    const m = await mountPicker({
      disabledDates: ['2031-09-10'],
      max: '2031-12-31',
    });

    const [input] = inputs(m);

    await type(input, '10.09.2031');
    await userEvent.keyboard('{Enter}');
    await settle();

    expect(m.host.badInput).toBe(true);
    expect(m.host.value).toBeNull();

    await type(input, '01.01.2032');
    await userEvent.keyboard('{Enter}');
    await settle();

    expect(m.host.badInput).toBe(true);
  });

  it('follows the format pattern for display and parsing', async () => {
    const m = await mountPicker({ format: 'yyyy-MM-dd', value: '2031-09-01' });

    const [input] = inputs(m);

    expect(input.value).toBe('2031-09-01');

    await type(input, '2031/9/2');
    await userEvent.keyboard('{Enter}');
    await settle();

    expect(m.host.value).toBe('2031-09-02');
    expect(input.value).toBe('2031-09-02');
  });

  it('shows the value set programmatically without emitting', async () => {
    const m = await mountPicker();

    const events = recordEvents(m.host, EVENTS);

    m.host.value = '2031-12-24';
    await settle();

    expect(inputs(m)[0].value).toBe('24.12.2031');
    expect(events.records).toEqual([]);
  });
});

describe('opening', () => {
  it('opens from the calendar button and from Alt+ArrowDown, never from a click in the text', async () => {
    const m = await mountPicker({ value: '2031-09-15' });

    await userEvent.click(inputs(m)[0]);
    await settle();

    expect(isOpen(m)).toBe(false);

    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
    await settle();

    expect(isOpen(m)).toBe(true);
    expect(focusedIso()).toBe('2031-09-15');

    await userEvent.keyboard('{Escape}');
    await settle();

    expect(isOpen(m)).toBe(false);
    expect(deepActiveElement()).toBe(inputs(m)[0]);

    await open(m);

    expect(focusedIso()).toBe('2031-09-15');
  });

  it('is a dialog named by the label, announcing the displayed month on open', async () => {
    const m = await mountPicker({ value: '2031-09-15' });

    const events = recordEvents(m.host, EVENTS);

    await open(m);

    const card = m.part('card');

    expect(card.getAttribute('role')).toBe('dialog');
    expect(card.getAttribute('aria-label')).toBe('Start date');
    expect(m.part('grid').getAttribute('aria-label')).toBe('September 2031');
    expect(events.of('change:month').map((r) => r.detail)).toEqual(['2031-09']);
  });

  it('focuses the nearest pickable day when nothing is selected', async () => {
    const m = await mountPicker({
      isDateDisabled: (iso: string) => iso < '2031-06-05',
      max: '2031-06-30',
      min: '2031-06-01',
    });

    await open(m);

    expect(focusedIso()).toBe('2031-06-05');
  });
});

describe('day grid', () => {
  it('moves by day, week, month and year; Home/End keep to the week', async () => {
    const m = await mountPicker({ value: '2031-09-17' });

    const months = recordEvents(m.host, ['change:month']);

    await open(m);
    months.clear();

    const press = async (keys: string, expected: string) => {
      await userEvent.keyboard(keys);
      await settle();

      expect(focusedIso(), keys).toBe(expected);
    };

    // 17 September 2031 is a Wednesday; weeks start on Monday.
    await press('{ArrowRight}', '2031-09-18');
    await press('{ArrowLeft}', '2031-09-17');
    await press('{ArrowDown}', '2031-09-24');
    await press('{ArrowUp}', '2031-09-17');
    await press('{Home}', '2031-09-15');
    await press('{End}', '2031-09-21');
    await press('{PageDown}', '2031-10-21');
    await press('{PageUp}', '2031-09-21');
    await press('{Shift>}{PageDown}{/Shift}', '2032-09-21');

    expect(months.details()).toEqual(['2031-10', '2031-09', '2032-09']);
  });

  it('honours first-day-of-week in the heads and in Home/End', async () => {
    const m = await mountPicker({ firstDayOfWeek: 0, value: '2031-09-17' });

    await open(m);

    const heads = m
      .shadowAll('th[part~="weekday"]')
      .map((th) => th.textContent?.trim());

    expect(heads).toEqual(['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']);

    await userEvent.keyboard('{Home}');
    await settle();

    expect(focusedIso()).toBe('2031-09-14');
  });

  it('lands on disabled days without picking them and stops at min/max', async () => {
    const m = await mountPicker({
      isDateDisabled: (iso: string) => iso === '2031-09-18',
      max: '2031-09-20',
      value: '2031-09-17',
    });

    const events = recordEvents(m.host, EVENTS);

    await open(m);

    await userEvent.keyboard('{ArrowRight}');
    await settle();

    expect(focusedIso()).toBe('2031-09-18');
    expect(cell(m, '2031-09-18').getAttribute('aria-disabled')).toBe('true');
    expect(cell(m, '2031-09-18').getAttribute('aria-label')).toBe(
      'Thursday 18 September 2031, unavailable',
    );

    await userEvent.keyboard('{Enter}');
    await settle();

    expect(isOpen(m)).toBe(true);
    expect(events.of('change')).toHaveLength(0);

    await userEvent.keyboard('{ArrowDown}');
    await settle();

    expect(focusedIso()).toBe('2031-09-20');
  });

  it('a disabled day is inked dimmer than hint text', async () => {
    const m = await mountPicker({ min: '2031-09-10', value: '2031-09-17' });

    await open(m);

    const ink = (iso: string) =>
      getComputedStyle(cell(m, iso).querySelector('[part~="day"]')!).color;
    const probe = document.createElement('span');

    probe.style.color = 'var(--c-on-surface-muted)';
    m.stage.append(probe);

    expect(ink('2031-09-09')).not.toBe(ink('2031-09-16'));
    expect(ink('2031-09-09')).not.toBe(getComputedStyle(probe).color);
  });

  it('picks with Enter, closes and returns focus to the input', async () => {
    const m = await mountPicker({ value: '2031-09-17' });

    const events = recordEvents(m.host, EVENTS);

    await open(m);
    await userEvent.keyboard('{ArrowRight}{Enter}');
    await settle();

    expect(events.of('change').map((r) => r.detail)).toEqual(['2031-09-18']);
    expect(isOpen(m)).toBe(false);
    expect(inputs(m)[0].value).toBe('18.09.2031');
    expect(deepActiveElement()).toBe(inputs(m)[0]);
  });

  it('traps Tab inside the panel', async () => {
    const m = await mountPicker({ value: '2031-09-17' });

    await open(m);

    const seen: (null | string)[] = [];

    for (let i = 0; i < 8; i++) {
      await userEvent.keyboard('{Tab}');
      seen.push(
        deepActiveElement()?.getAttribute('part') ??
          deepActiveElement()?.localName ??
          null,
      );
    }

    expect(isOpen(m)).toBe(true);
    expect(seen).toEqual([
      'previous-month',
      'month-button',
      'next-month',
      'previous-year',
      'year-button',
      'next-year',
      'cell',
      'previous-month',
    ]);
  });

  it('shows ISO week numbers on request', async () => {
    const m = await mountPicker({ showWeekNumbers: true, value: '2031-09-17' });

    await open(m);

    const weeks = m
      .shadowAll('th[part~="week-number"]')
      .map((th) => th.textContent?.trim())
      .filter(Boolean);

    expect(weeks).toEqual(['36', '37', '38', '39', '40']);
  });
});

describe('month and year lists', () => {
  it('swaps the grid for a month list and back', async () => {
    const m = await mountPicker({ value: '2031-09-17' });

    await open(m);
    await userEvent.click(m.part('month-button'));
    await finishAnimations(m);

    const options = m.shadowAll('li[part~="option"]');

    expect(options).toHaveLength(12);
    expect(m.shadowAll('table[part~="grid"]')).toHaveLength(0);
    expect(deepActiveElement()).toBe(options[8]);
    expect(options[8].getAttribute('aria-selected')).toBe('true');

    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    await settle();

    expect(m.part('grid').getAttribute('aria-label')).toBe('November 2031');
    expect(focusedIso()).toBe('2031-11-17');
  });

  it('bounds the year list by min and max', async () => {
    const m = await mountPicker({
      max: '2033-12-31',
      min: '2029-01-01',
      value: '2031-09-17',
    });

    await open(m);
    await userEvent.click(m.part('year-button'));
    await settle();

    const years = m
      .shadowAll('li[part~="option"]')
      .map((li) => li.textContent?.trim());

    expect(years).toEqual(['2029', '2030', '2031', '2032', '2033']);

    await userEvent.click(m.shadowAll('li[part~="option"]')[0]);
    await settle();

    expect(m.part('grid').getAttribute('aria-label')).toBe('September 2029');
  });

  it('the year list ends on a peek', async () => {
    const m = await mountPicker({ value: '2031-09-17' });

    await open(m);
    await userEvent.click(m.part('year-button'));
    await settle();

    const list = m.part('list');

    expect(list.scrollHeight).toBeGreaterThan(list.clientHeight);

    const rows = m.shadowAll('li[part~="option"]');

    const bottom = list.getBoundingClientRect().bottom;

    // Some row straddles the bottom edge (the peek), none ends exactly on it.
    expect(
      rows.some((row) => {
        const r = row.getBoundingClientRect();

        return r.top < bottom && r.bottom > bottom;
      }),
    ).toBe(true);
  });
});

describe('range', () => {
  const mountRange = (props: Record<string, unknown> = {}) =>
    mountPicker({ label: 'Leave', ...props }, { range: true });

  it('two picks commit one complete range; the first is only pending', async () => {
    const m = await mountRange({ max: '2031-09-30', min: '2031-09-01' });

    const events = recordEvents(m.host, EVENTS);

    await open(m);
    await userEvent.click(cell(m, '2031-09-10'));
    await settle();

    expect(events.of('change')).toHaveLength(0);
    expect(isOpen(m)).toBe(true);
    expect(cell(m, '2031-09-10').getAttribute('aria-selected')).toBe('true');

    await userEvent.hover(cell(m, '2031-09-12'));
    await settle();

    expect(
      cell(m, '2031-09-11').querySelector('[part~="range-band"]'),
      'preview band',
    ).not.toBeNull();

    await userEvent.click(cell(m, '2031-09-05'));
    await settle();

    expect(events.of('change').map((r) => r.detail)).toEqual([
      { end: '2031-09-10', start: '2031-09-05' },
    ]);
    expect(isOpen(m)).toBe(false);
    expect(inputs(m).map((i) => i.value)).toEqual(['05.09.2031', '10.09.2031']);
  });

  it('a dismissed gesture discards the pending start', async () => {
    const m = await mountRange({ max: '2031-09-30', min: '2031-09-01' });

    const events = recordEvents(m.host, EVENTS);

    await open(m);
    await userEvent.click(cell(m, '2031-09-10'));
    await userEvent.keyboard('{Escape}');
    await settle();
    await open(m);

    expect(cell(m, '2031-09-10').getAttribute('aria-selected')).toBe('false');
    expect(events.of('change')).toHaveLength(0);
  });

  it('hides the separator on an empty field under its floating label', async () => {
    const shown = (m: Mounted) =>
      getComputedStyle(m.part('separator')).visibility === 'visible';

    const m = await mountPicker({ label: 'Leave' }, { range: true });

    expect(shown(m), 'empty and unfocused').toBe(false);

    inputs(m)[0].focus();
    await settle();

    expect(shown(m), 'focused').toBe(true);

    inputs(m)[0].blur();
    await settle();

    expect(shown(m), 'blurred again').toBe(false);

    m.host.value = { end: '2031-09-15', start: null };
    await settle();

    expect(shown(m), 'with an end').toBe(true);

    // Placeholders show beside a label on top, and the separator with them.
    const top = await mountPicker(
      { label: 'Leave', labelOnTop: true },
      { range: true },
    );

    expect(shown(top), 'label on top').toBe(true);
  });

  it('the separator sits evenly between the start and end text', async () => {
    const m = await mountPicker(
      { label: 'Leave', value: { end: '2031-09-15', start: '2031-09-01' } },
      { range: true, style: 'width: 360px' },
    );

    await settled();

    const [startInput, endInput] = inputs(m);

    // Where the start text ends: an input's text width is not in its box
    // metrics, so measure it in the input's own font.
    const context = document.createElement('canvas').getContext('2d')!;

    context.font = getComputedStyle(startInput).font;

    const startTextRight =
      startInput.getBoundingClientRect().left +
      parseFloat(getComputedStyle(startInput).paddingLeft) +
      context.measureText(startInput.value).width;

    const endTextLeft =
      endInput.getBoundingClientRect().left +
      parseFloat(getComputedStyle(endInput).paddingLeft);

    const dash = m.part('separator').getBoundingClientRect();

    const before = dash.left - startTextRight;

    const after = endTextLeft - dash.right;

    expect(Math.abs(before - after), `${before} vs ${after}`).toBeLessThan(1);
    expect(after).toBeGreaterThanOrEqual(6);
  });

  it('commits typed ends one at a time and swaps a reversed range', async () => {
    const m = await mountRange();

    const events = recordEvents(m.host, EVENTS);

    const [start, end] = inputs(m);

    expect(start.getAttribute('aria-label')).toBe('Leave, Start date');
    expect(end.getAttribute('aria-label')).toBe('Leave, End date');

    await type(start, '20.9.2031');
    await userEvent.keyboard('{Enter}');
    await settle();

    expect(events.of('change').map((r) => r.detail)).toEqual([
      { end: null, start: '2031-09-20' },
    ]);

    await type(end, '1.9.2031');
    await userEvent.keyboard('{Enter}');
    await settle();

    expect(events.last()?.type).toBe('update:value');
    expect(m.host.value).toEqual({ end: '2031-09-20', start: '2031-09-01' });
    expect([start.value, end.value]).toEqual(['01.09.2031', '20.09.2031']);
  });

  it('a click in the end input keeps focus there', async () => {
    const m = await mountRange();

    const [, end] = inputs(m);

    await userEvent.click(end);

    expect(deepActiveElement()).toBe(end);
  });

  it('paints the band between the committed ends, across disabled days', async () => {
    const m = await mountRange({
      disabledDates: ['2031-09-12'],
      value: { end: '2031-09-14', start: '2031-09-10' },
    });

    await open(m);

    const banded = m
      .shadowAll('td[part~="cell"]')
      .filter((td) => td.querySelector('[part~="range-band"]'))
      .map((td) => td.dataset.date);

    expect(banded).toEqual([
      '2031-09-10',
      '2031-09-11',
      '2031-09-12',
      '2031-09-13',
      '2031-09-14',
    ]);
  });
});

describe('texts', () => {
  it('takes names from Intl for the page lang, under explicit texts', async () => {
    document.documentElement.lang = 'fi';

    const m = await mountPicker({
      texts: { openCalendar: 'Avaa kalenteri' },
      value: '2031-09-17',
    });

    await userEvent.click(
      m.deep('c-icon-button[aria-label="Avaa kalenteri"]', 'button'),
    );
    await settle();

    expect(m.part('grid').getAttribute('aria-label')).toBe('syyskuu 2031');
  });
});

describe('clearing', () => {
  it('the clear button empties the field and emits null once', async () => {
    const m = await mountPicker({ clearable: true, value: '2031-09-17' });

    const events = recordEvents(m.host, EVENTS);

    await userEvent.click(
      m.deep('c-icon-button[aria-label="Clear selection"]', 'button'),
    );
    await settle();

    expect(events.of('change').map((r) => r.detail)).toEqual([null]);
    expect(inputs(m)[0].value).toBe('');
    expect(isOpen(m)).toBe(false);
  });
});

describe('fullscreen panel', () => {
  afterEach(async () => {
    await page.viewport(1280, 800);
  });

  it('covers the viewport with a heading row above the calendar', async () => {
    await page.viewport(360, 740);

    const m = await mountPicker({ value: '2031-09-17' });

    await open(m);
    await settled();

    const rect = m.part('panel').getBoundingClientRect();

    expect(rect.top).toBe(0);
    expect(rect.width).toBe(document.documentElement.clientWidth);
    expect(m.part('heading').textContent?.trim()).toBe('Start date');
    expect(focusedIso()).toBe('2031-09-17');

    await userEvent.click(m.part('close'));
    await settle();

    expect(isOpen(m)).toBe(false);
  });
});

describe('field', () => {
  it('keeps the control height with one input and with a range', async () => {
    const single = await mountPicker({ value: '2031-09-17' });

    const range = await mountPicker(
      { value: { end: '2031-09-20', start: '2031-09-17' } },
      { range: true },
    );

    for (const m of [single, range]) {
      expect(
        m.deep('c-input', '.c-input__slot').getBoundingClientRect().height,
      ).toBe(52);
    }
  });

  it('sizes the calendar button by the field, its icon on the same edge', async () => {
    const regular = await mountPicker({ clearable: true, value: '2031-09-17' });

    const small = await mountPicker({
      clearable: true,
      size: 'small',
      value: '2031-09-17',
    });

    for (const [m, button, icon] of [
      [regular, 40, 24],
      [small, 28, 20],
    ] as const) {
      const border = m
        .deep('c-input', '.c-input__fieldset')
        .getBoundingClientRect();

      const glyph = m
        .deep('c-icon-button[aria-label="Open calendar"] > c-icon', 'svg')
        .getBoundingClientRect();

      expect(calendarButton(m).getBoundingClientRect().width).toBe(button);
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

  // A day cell paints its ring on the day inside it.
  const dayRing = (el: Element) =>
    el.localName === 'td' ? el.querySelector('span')! : el;

  it('rings the opening day after a mouse-focused field and Alt+ArrowDown', async () => {
    const m = await mountPicker({ value: '2031-09-15' });

    await openFromKeyboard(m);
    await settled();

    const day = deepActiveElement()!;

    expect(day.getAttribute('data-date')).toBe('2031-09-15');
    expect(day.matches(':focus-visible')).toBe(true);
    expect(ringOf(dayRing(day)).ring).toBe('solid 2px');
  });

  it('rings a selected day in its own ink, inside the fill', async () => {
    const m = await mountPicker({ value: '2031-09-15' });

    await openFromKeyboard(m);
    await settled();

    const selected = dayRing(cell(m, '2031-09-15'));

    expect(ringOf(selected).ring).toBe('solid 2px');
    expect(ringOf(selected).color).toBe(ringOf(selected).ink);
    expect(getComputedStyle(selected).outlineOffset).toBe('-4px');

    await userEvent.keyboard('{ArrowRight}');
    await settled();

    const plain = dayRing(cell(m, '2031-09-16'));

    expect(ringOf(plain).color).not.toBe(ringOf(selected).color);
    expect(getComputedStyle(plain).outlineOffset).toBe('0px');
  });

  // Chrome rings a script focus after any plain key, Firefox and Safari only
  // when asked: the keyboard moves ask, a pointer open leaves it to the
  // browser.
  it('asks for the ring on keyboard moves only', async () => {
    const m = await mountPicker({ value: '2031-09-15' });

    const focus = vi.spyOn(HTMLElement.prototype, 'focus');

    try {
      await open(m);
      await settled();

      expect(focusedIso()).toBe('2031-09-15');
      expect(cell(m, '2031-09-15').matches(':focus-visible')).toBe(false);
      expect(focus.mock.lastCall?.[0]?.focusVisible).toBeUndefined();

      await userEvent.keyboard('{ArrowRight}');
      await settle();

      expect(focusedIso()).toBe('2031-09-16');
      expect(focus.mock.lastCall?.[0]?.focusVisible).toBe(true);
    } finally {
      focus.mockRestore();
    }
  });

  it('paints a 2px ring on every stop reached from the keyboard', async () => {
    const m = await mountPicker({ showToday: true, value: '2031-09-15' });

    await openFromKeyboard(m);
    await settle();

    const stops = await tabRound(dayRing);

    expect(new Set(stops.map((s) => s.name))).toEqual(
      new Set([
        'cell',
        'month-button',
        'next-month',
        'next-year',
        'previous-month',
        'previous-year',
        'today',
        'year-button',
      ]),
    );

    for (const stop of stops) expect(stop.ring, stop.name).toBe('solid 2px');
  });

  it('rings a month list row', async () => {
    const m = await mountPicker({ value: '2031-09-15' });

    await openFromKeyboard(m);
    await settle();

    while (deepActiveElement()?.getAttribute('part') !== 'month-button') {
      await userEvent.keyboard('{Tab}');
      await settle();
    }

    await userEvent.keyboard('{Enter}');
    await settled();
    await userEvent.keyboard('{ArrowDown}');
    await settle();

    const row = deepActiveElement()!;

    expect(row.getAttribute('part')).toBe('option');
    expect(row.matches(':focus-visible')).toBe(true);
    expect(ringOf(row).ring).toBe('solid 2px');
  });

  it('rings the close button and Done in the fullscreen panel', async () => {
    await page.viewport(360, 740);

    const m = await mountPicker({ value: '2031-09-15' });

    await openFromKeyboard(m);
    await settled();

    const stops = await tabRound(dayRing);

    expect(stops.map((s) => s.name)).toEqual(
      expect.arrayContaining(['close', 'done']),
    );

    for (const stop of stops) expect(stop.ring, stop.name).toBe('solid 2px');
  });
});

describe('motion', () => {
  // The browser context emulates reduced motion; these specs opt back in.
  const allowMotion = () => {
    const real = window.matchMedia.bind(window);

    vi.spyOn(window, 'matchMedia').mockImplementation((query) =>
      query.includes('prefers-reduced-motion')
        ? ({ ...real(query), matches: false } as MediaQueryList)
        : real(query),
    );
  };

  afterEach(() => vi.restoreAllMocks());

  const grids = (m: Mounted) => m.shadowAll<HTMLElement>('table[part~="grid"]');

  // The horizontal keyframe offsets of an element's running animation.
  const slide = (el: HTMLElement) =>
    keyframes(el.getAnimations()[0]).map((k) => k.transform);

  it('› slides the old month out left and the new one in from the right; ‹ mirrors it', async () => {
    allowMotion();

    const m = await mountPicker({ value: '2031-09-17' });

    await open(m);
    m.part('next-month').click();
    await settle();

    let [outgoing, incoming] = grids(m);

    expect(outgoing.inert).toBe(true);
    expect(outgoing.getAttribute('aria-hidden')).toBe('true');
    expect(outgoing.getAttribute('aria-label')).toBe('September 2031');
    expect(incoming.inert).toBe(false);
    expect(slide(outgoing)).toEqual(['none', 'translateX(-100%)']);
    expect(slide(incoming)).toEqual(['translateX(100%)', 'none']);

    await finishAnimations(m);

    expect(grids(m)).toHaveLength(1);

    m.part('previous-month').click();
    await settle();
    [outgoing, incoming] = grids(m);

    expect(slide(outgoing)).toEqual(['none', 'translateX(100%)']);
    expect(slide(incoming)).toEqual(['translateX(-100%)', 'none']);
  });

  it('keys crossing a month edge slide; a pick from the month list does not', async () => {
    allowMotion();

    const m = await mountPicker({ value: '2031-09-30' });

    await open(m);
    await userEvent.keyboard('{ArrowRight}');
    await settle();

    expect(focusedIso()).toBe('2031-10-01');
    expect(slide(grids(m)[1])).toEqual(['translateX(100%)', 'none']);

    await finishAnimations(m);
    await userEvent.click(m.part('month-button'));
    await settle();

    // A fade-through, as in MD3: the grid fades out drifting down, then the
    // list unrolls from the header — a clip opening downward while its rows
    // drop into place.
    const [gridOut] = grids(m).map((g) => g.getAnimations()[0]);

    const listIn = m.part('list').getAnimations()[0];

    expect(slide(grids(m)[0])).toEqual(['none', 'translateY(8px)']);
    expect(slide(m.part('list'))).toEqual([
      'translateY(-10px) scaleY(0.95)',
      'none',
    ]);
    expect(keyframes(listIn).map((k) => k.clipPath)).toEqual([
      'inset(0px 0px 100%)',
      'inset(0px)',
    ]);
    expect(listIn.effect?.getTiming().delay).toBe(
      gridOut.effect?.getTiming().duration,
    );

    await finishAnimations(m);
    await userEvent.keyboard('{Home}{Enter}');
    await settle();

    const [grid] = grids(m);

    expect(grids(m)).toHaveLength(1);
    expect(grid.getAttribute('aria-label')).toBe('January 2031');
    // The list fades where it is, then the grid rises into place — never
    // sideways.
    expect(slide(m.part('list'))).toEqual(['none', 'none']);
    expect(slide(grid)).toEqual(['translateY(8px)', 'none']);
  });

  it('a step during a slide restarts from the grid on screen', async () => {
    allowMotion();

    const m = await mountPicker({ value: '2031-09-17' });

    const events = recordEvents(m.host, EVENTS);

    await open(m);
    m.part('next-month').click();
    await settle();
    m.part('next-month').click();
    await settle();

    const live = grids(m).filter((g) => !g.inert);

    expect(live).toHaveLength(1);
    expect(live[0].getAttribute('aria-label')).toBe('November 2031');
    expect(slide(live[0])).toEqual(['translateX(100%)', 'none']);
    expect(events.of('change:month').map((r) => r.detail)).toEqual([
      '2031-09',
      '2031-10',
      '2031-11',
    ]);

    await finishAnimations(m);

    expect(grids(m)).toHaveLength(1);
    // The arrows keep focus; the roving day follows into the live grid.
    expect(
      grids(m)[0].querySelector('[tabindex="0"]')?.getAttribute('data-date'),
    ).toBe('2031-11-17');
  });

  it('the month arrows stay put whatever the month name’s width', async () => {
    const m = await mountPicker({ value: '2031-01-17' });

    await open(m);
    await finishAnimations(m);

    const at = () =>
      ['previous-month', 'next-month'].map(
        (name) => m.part(name).getBoundingClientRect().x,
      );

    const first = at();

    for (let i = 0; i < 11; i++) {
      m.part('next-month').click();
      await finishAnimations(m);

      expect(at(), m.part('grid').getAttribute('aria-label')!).toEqual(first);
    }
  });

  it('an open list keeps the ▾ button in place and fades the rest of the header out', async () => {
    const m = await mountPicker({ value: '2031-09-17' });

    await open(m);
    await finishAnimations(m);

    const before = m.part('year-button').getBoundingClientRect();

    await userEvent.click(m.part('year-button'));
    await finishAnimations(m);

    const after = m.part('year-button').getBoundingClientRect();

    expect([after.x, after.y]).toEqual([before.x, before.y]);

    for (const name of [
      'previous-month',
      'month-button',
      'next-month',
      'previous-year',
      'next-year',
    ])
      expect(getComputedStyle(m.part(name)).visibility, name).toBe('hidden');

    // Tab cycles between the ▾ button and the list only.
    await userEvent.keyboard('{Tab}');
    expect(deepActiveElement()?.getAttribute('part')).toBe('year-button');
    await userEvent.keyboard('{Tab}');
    expect(deepActiveElement()?.getAttribute('part')).toBe('option');
  });

  it('the list’s peek is measured before its entrance transforms it', async () => {
    const listHeight = async () => {
      const m = await mountPicker({ value: '2031-09-17' });

      await open(m);
      await userEvent.click(m.part('year-button'));
      await finishAnimations(m);

      return m.part('list').clientHeight;
    };

    // Reduced motion has no transform to measure through.
    const still = await listHeight();

    allowMotion();

    expect(await listHeight()).toBe(still);
  });

  it('the card is as tall as the month’s weeks and resizes with the slide', async () => {
    allowMotion();

    // February 2031 spans five weeks from Monday, March 2031 six.
    const m = await mountPicker({ value: '2031-02-10' });

    await open(m);
    await finishAnimations(m);

    const card = () => m.part('card').getBoundingClientRect().height;

    const rows = () =>
      grids(m)
        .filter((g) => !g.inert)[0]
        .querySelectorAll('tbody tr').length;

    const february = card();

    expect(rows()).toBe(5);

    m.part('next-month').click();
    await settle();

    // The card grows while March slides in, rather than jumping: the body
    // goes from five weeks to six (a 36px weekday row, 40px per week).
    const body = m
      .part('card')
      .querySelector<HTMLElement>('table')!.parentElement!;

    const grow = body.getAnimations()[0];

    expect(
      keyframes(grow).map((k) => parseFloat(String(k.height))),
    ).toEqual([236, 276]);

    await finishAnimations(m);

    expect(rows()).toBe(6);
    expect(card()).toBe(february + 40);

    // An open list keeps the card's height.
    await userEvent.click(m.part('year-button'));
    await finishAnimations(m);

    expect(card()).toBe(february + 40);
  });

  it('under reduced motion the slide is a crossfade', async () => {
    const m = await mountPicker({ value: '2031-09-17' });

    await open(m);
    m.part('next-month').click();
    await settle();

    const frames = grids(m).map((g) =>
      keyframes(g.getAnimations()[0]),
    );

    expect(frames.map((f) => f?.map((k) => Number(k.opacity)))).toEqual([
      [1, 0],
      [0, 1],
    ]);
    expect(frames.flat().some((k) => k?.transform)).toBe(false);
  });
});

describe('type="month"', () => {
  const mountMonth = (
    props: Record<string, unknown> = {},
    attrs: Record<string, boolean | string> = {},
  ) => mountPicker({ label: 'Period', type: 'month', ...props }, attrs);

  /** A row of the current step's list: `m3` (March) or `y2031`. */
  const option = (m: Mounted, key: string): HTMLElement =>
    m.shadow(`ul[part~="list"] li[data-key="${key}"]`);

  const focusedKey = (): null | string =>
    deepActiveElement()?.getAttribute('data-key') ?? null;

  const stepLabel = (m: Mounted) => m.part('step-label').textContent?.trim();

  const summaries = (m: Mounted) =>
    m
      .shadowAll<HTMLElement>('[part~="step-summary"]')
      .map((b) => b.textContent?.replace(/\s+/g, ' ').trim());

  const pickRow = async (m: Mounted, key: string) => {
    await userEvent.click(option(m, key));
    await finishAnimations(m);
  };

  it('opens on the month step: no header, a Month label, the value’s month focused', async () => {
    const m = await mountMonth({ value: '2031-09' });

    const events = recordEvents(m.host, EVENTS);

    await open(m);

    expect(m.shadowAll('[part~="header"]')).toHaveLength(0);
    expect(m.shadowAll('table[part~="grid"]')).toHaveLength(0);
    expect(stepLabel(m)).toBe('Month');
    expect(m.shadow('ul[part~="list"]').getAttribute('aria-labelledby')).toBe(
      m.part('step-label').id,
    );
    expect(m.shadowAll('ul[part~="list"] li')).toHaveLength(12);
    expect(focusedKey()).toBe('m9');
    expect(option(m, 'm9').getAttribute('aria-selected')).toBe('true');
    expect(summaries(m)).toEqual([]);
    expect(events.of('change:month')).toHaveLength(0);
  });

  it('a month pick shows its summary and the year step; a year pick commits and closes', async () => {
    const m = await mountMonth({ value: '2031-09' });

    const events = recordEvents(m.host, EVENTS);

    await open(m);
    await pickRow(m, 'm3');

    expect(isOpen(m)).toBe(true);
    expect(summaries(m)).toEqual(['Month March']);
    expect(stepLabel(m)).toBe('Year');
    expect(focusedKey()).toBe('y2031');
    expect(events.of('change')).toHaveLength(0);

    await pickRow(m, 'y2033');

    expect(isOpen(m)).toBe(false);
    expect(m.host.value).toBe('2033-03');
    expect(inputs(m)[0].value).toBe('03.2033');
    expect(events.of('change').map((e) => e.detail)).toEqual(['2033-03']);
  });

  it('reopens on the month step after a pick', async () => {
    const m = await mountMonth({ value: '2031-09' });

    await open(m);

    const height = m.part('panel').getBoundingClientRect().height;

    await pickRow(m, 'm3');
    await pickRow(m, 'y2033');

    expect(isOpen(m)).toBe(false);

    await open(m);

    expect(stepLabel(m)).toBe('Month');
    expect(summaries(m)).toEqual([]);
    expect(focusedKey()).toBe('m3');
    // The step reset ran while the panel was hidden; it must not size the body.
    expect(m.part('panel').getBoundingClientRect().height).toBe(height);

    await pickRow(m, 'm5');

    expect(stepLabel(m)).toBe('Year');
  });

  it('the keyboard runs the whole flow', async () => {
    const m = await mountMonth({ value: '2031-09' });

    await open(m);
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await finishAnimations(m);

    expect(stepLabel(m)).toBe('Year');
    expect(focusedKey()).toBe('y2031');

    await userEvent.keyboard('{ArrowUp}{Enter}');
    await settle();

    expect(m.host.value).toBe('2030-10');
  });

  it('a summary row returns to its step', async () => {
    const m = await mountMonth({ value: '2031-09' });

    await open(m);
    await pickRow(m, 'm3');
    await userEvent.click(m.part('step-summary'));
    await finishAnimations(m);

    expect(stepLabel(m)).toBe('Month');
    expect(summaries(m)).toEqual([]);
    expect(focusedKey()).toBe('m9');
  });

  it('types a month in the derived format; a full date value reads by its month', async () => {
    const m = await mountMonth({ value: '2031-09-15' });

    const events = recordEvents(m.host, EVENTS);

    expect(inputs(m)[0].value).toBe('09.2031');
    expect(events.of('change')).toHaveLength(0);

    await type(inputs(m)[0], '3.2032');
    await userEvent.keyboard('{Enter}');
    await settle();

    expect(m.host.value).toBe('2032-03');
    expect(inputs(m)[0].value).toBe('03.2032');

    await type(inputs(m)[0], '13.2032');
    await userEvent.keyboard('{Enter}');
    await settle();

    expect(m.host.value).toBeNull();
    expect(m.host.badInput).toBe(true);
  });

  it('derives yyyy-MM from a yyyy-MM-dd format', async () => {
    const m = await mountMonth({ format: 'yyyy-MM-dd', value: '2031-09' });

    expect(inputs(m)[0].value).toBe('2031-09');
  });

  it('a month is out when no allowed year takes it; a year when the picked month is out there', async () => {
    const m = await mountMonth({
      max: '2032-10-05',
      min: '2031-03-15',
      value: '2031-06',
    });

    Object.assign(m.host, {
      disabledDates: [{ end: '2031-07-31', start: '2031-07-01' }],
    });
    await settle();
    await open(m);

    const disabled = (key: string) =>
      option(m, key).getAttribute('aria-disabled') === 'true';

    // 2031-03 … 2032-10: every month has some allowed year.
    expect(disabled('m1')).toBe(false);
    expect(disabled('m11')).toBe(false);

    await pickRow(m, 'm7');

    expect(m.shadowAll('ul[part~="list"] li')).toHaveLength(2);
    expect(disabled('y2031')).toBe(true);
    expect(disabled('y2032')).toBe(false);
    expect(focusedKey()).toBe('y2032');

    await userEvent.click(m.part('step-summary'));
    await finishAnimations(m);
    await pickRow(m, 'm11');

    expect(disabled('y2031')).toBe(false);
    expect(disabled('y2032')).toBe(true);
  });

  it('bounds inside one year disable the months outside them', async () => {
    const m = await mountMonth({ max: '2031-10', min: '2031-03' });

    await open(m);

    const out = m
      .shadowAll<HTMLElement>('ul[part~="list"] li[aria-disabled="true"]')
      .map((li) => li.dataset.key);

    expect(out).toEqual(['m1', 'm2', 'm11', 'm12']);
  });

  it('a range runs four labelled steps; the start is pending until the end year', async () => {
    const m = await mountMonth({ value: null }, { range: true });

    const events = recordEvents(m.host, EVENTS);

    m.host.value = { end: '2032-02', start: '2031-11' };
    await settle();
    await open(m);

    expect(stepLabel(m)).toBe('Start month');

    await pickRow(m, 'm11');

    expect(stepLabel(m)).toBe('Start year');
    expect(summaries(m)).toEqual(['Start month November']);

    await pickRow(m, 'y2031');

    expect(stepLabel(m)).toBe('End month');
    expect(summaries(m)).toEqual(['Start month November 2031']);
    expect(m.shadow('[aria-live="polite"]').textContent).toContain(
      'November 2031',
    );
    expect(focusedKey()).toBe('m2');

    await pickRow(m, 'm2');

    expect(stepLabel(m)).toBe('End year');
    expect(summaries(m)).toEqual([
      'Start month November 2031',
      'End month February',
    ]);
    expect(events.of('change')).toHaveLength(0);

    // Reversed: the end year lands before the start, so the ends swap.
    await pickRow(m, 'y2030');

    expect(isOpen(m)).toBe(false);
    expect(m.host.value).toEqual({ end: '2031-11', start: '2030-02' });
    expect(events.of('change')).toHaveLength(1);
  });

  it('dismissing a range discards the pending start', async () => {
    const m = await mountMonth({ value: null }, { range: true });

    const events = recordEvents(m.host, EVENTS);

    await open(m);
    await pickRow(m, 'm3');
    await pickRow(m, `y${new Date().getFullYear()}`);
    await userEvent.keyboard('{Escape}');
    await settle();
    await open(m);

    expect(stepLabel(m)).toBe('Start month');
    expect(summaries(m)).toEqual([]);
    expect(events.of('change')).toHaveLength(0);
  });

  it('names the range inputs by month', async () => {
    const m = await mountMonth({ value: null }, { range: true });

    expect(inputs(m).map((i) => i.getAttribute('aria-label'))).toEqual([
      'Period, Start month',
      'Period, End month',
    ]);
  });

  describe('fullscreen panel', () => {
    afterEach(async () => {
      await page.viewport(1280, 800);
    });

    it('stacks the steps and the list fills the height', async () => {
      await page.viewport(360, 740);

      const m = await mountMonth({ value: '2031-09' });

      await open(m);
      await pickRow(m, 'm3');

      const list = m.shadow('ul[part~="list"]').getBoundingClientRect();

      expect(
        m.part('step-summary').getBoundingClientRect().bottom,
      ).toBeLessThanOrEqual(
        m.part('step-label').getBoundingClientRect().top + 1,
      );
      expect(list.bottom).toBeGreaterThan(600);
    });
  });
});

describe('Today button (ADR-0065)', () => {
  // Each case accepts today read before or after the press, so a midnight
  // mid-test cannot flake it.
  const todayButton = (m: Mounted) => m.part('today') as HTMLButtonElement;

  const press = async (m: Mounted) => {
    await userEvent.click(todayButton(m));
    await finishAnimations(m);
  };

  const mountRange = (props: Record<string, unknown> = {}) =>
    mountPicker(
      {
        label: 'Leave',
        showToday: true,
        value: { end: '2031-09-12', start: '2031-09-10' },
        ...props,
      },
      { range: true },
    );

  it('is opt-in, and an app default turns it on', async () => {
    const off = await mountPicker({ value: '2031-09-17' });

    expect(off.shadowAll('[part~="actions"]')).toHaveLength(0);

    applyDefaults({ 'c-date-picker': { showToday: true } });

    const on = await mountPicker({ value: '2031-09-17' });

    expect(todayButton(on).textContent?.trim()).toBe('Today');
  });

  it('picks today, clears bad input, closes and returns focus to the input', async () => {
    const m = await mountPicker({ showToday: true });

    const [input] = inputs(m);

    await type(input, '31.02.2031');
    await userEvent.keyboard('{Enter}');
    await settle();

    expect(m.host.badInput).toBe(true);

    const events = recordEvents(m.host, EVENTS);

    await open(m);

    const before = todayIso();

    await press(m);

    const value = m.host.value as string;

    expect([before, todayIso()]).toContain(value);
    expect(events.of('change').map((r) => r.detail)).toEqual([value]);
    expect(events.of('change:text')).toHaveLength(0);
    expect(m.host.badInput).toBe(false);
    expect(isOpen(m)).toBe(false);
    expect(input.value).toBe(value.split('-').reverse().join('.'));
    expect(deepActiveElement()).toBe(input);
  });

  it('is the last Tab stop', async () => {
    const m = await mountPicker({ showToday: true, value: '2031-09-17' });

    await open(m);

    const seen: (null | string)[] = [];

    for (let i = 0; i < 2; i++) {
      await userEvent.keyboard('{Tab}');
      seen.push(deepActiveElement()?.getAttribute('part') ?? null);
    }

    expect(seen).toEqual(['today', 'previous-month']);
  });

  it('under range, the first press is the pending start on today’s cell', async () => {
    const m = await mountRange();

    const events = recordEvents(m.host, EVENTS);

    await open(m);

    const before = todayIso();

    await press(m);

    const today = focusedIso()!;

    expect([before, todayIso()]).toContain(today);
    expect(isOpen(m)).toBe(true);
    expect(events.of('change')).toHaveLength(0);
    expect(events.of('change:month').at(-1)?.detail).toBe(today.slice(0, 7));
    expect(cell(m, today).getAttribute('aria-current')).toBe('date');
    expect(cell(m, today).getAttribute('aria-selected')).toBe('true');
    expect(m.shadow('[aria-live="polite"]').textContent).toContain(
      'selected as the start',
    );

    // The grid takes it from there: the next day completes the range.
    await userEvent.keyboard('{ArrowRight}');
    await finishAnimations(m);
    await userEvent.keyboard('{Enter}');
    await settle();

    expect(events.of('change').map((r) => r.detail)).toEqual([
      { end: addDays(today, 1), start: today },
    ]);
    expect(isOpen(m)).toBe(false);
  });

  it('with a pending start, a press completes the range in order and closes', async () => {
    const m = await mountRange();

    const events = recordEvents(m.host, EVENTS);

    await open(m);
    await userEvent.click(cell(m, '2031-09-20'));
    await settle();

    const before = todayIso();

    await press(m);

    const { end, start } = m.host.value as { end: string; start: string };

    expect([before, todayIso()]).toContain(start);
    expect(end).toBe('2031-09-20');
    expect(events.of('change')).toHaveLength(1);
    expect(isOpen(m)).toBe(false);
  });

  it('from the year list, the first range press returns to the day grid', async () => {
    const m = await mountRange();

    await open(m);
    await userEvent.click(m.part('year-button'));
    await finishAnimations(m);
    await press(m);

    expect(m.shadowAll('table[part~="grid"]')).toHaveLength(1);
    expect(m.shadowAll('ul[part~="list"]')).toHaveLength(0);
    expect(focusedIso()).toBe(
      m.shadow('td[aria-current="date"]').getAttribute('data-date'),
    );
  });

  it('is disabled when today cannot be picked, and a press emits nothing', async () => {
    // Today and tomorrow, in case midnight falls mid-test.
    const today = todayIso();

    const tomorrow = addDays(today, 1);

    const fixtures: Record<string, unknown>[] = [
      { max: '2001-12-31', value: '2001-02-14' },
      { disabledDates: [{ end: tomorrow, start: today }], value: '2031-09-17' },
      {
        isDateDisabled: (iso: string) => iso === today || iso === tomorrow,
        value: '2031-09-17',
      },
      { max: '2001-12', type: 'month', value: '2001-06' },
    ];

    for (const props of fixtures) {
      const m = await mountPicker({ showToday: true, ...props });

      const events = recordEvents(m.host, EVENTS);

      await open(m);

      expect(todayButton(m).disabled, Object.keys(props).join()).toBe(true);

      todayButton(m).click();
      await settle();

      expect(events.of('change')).toHaveLength(0);
      expect(isOpen(m)).toBe(true);

      await userEvent.keyboard('{Escape}');
      await settle();
      m.unmount();
    }
  });

  it('type="month": This month commits the current month and closes', async () => {
    const m = await mountPicker({
      label: 'Period',
      showToday: true,
      type: 'month',
      value: '2031-09',
    });

    const events = recordEvents(m.host, EVENTS);

    await open(m);

    expect(todayButton(m).textContent?.trim()).toBe('This month');

    const before = todayIso().slice(0, 7);

    await press(m);

    expect([before, todayIso().slice(0, 7)]).toContain(m.host.value);
    expect(events.of('change')).toHaveLength(1);
    expect(isOpen(m)).toBe(false);
  });

  it('type="month" under range: the first press is the pending start, the second completes the range', async () => {
    const m = await mountPicker(
      { label: 'Period', showToday: true, type: 'month', value: null },
      { range: true },
    );

    const events = recordEvents(m.host, EVENTS);

    await open(m);
    await press(m);

    expect(m.part('step-label').textContent?.trim()).toBe('End month');
    expect(
      m
        .shadowAll('[part~="step-summary"]')
        .map((b) => b.textContent?.trim().startsWith('Start month')),
    ).toEqual([true]);
    expect(events.of('change')).toHaveLength(0);

    const before = todayIso().slice(0, 7);

    await press(m);

    const { end, start } = m.host.value as { end: string; start: string };

    expect([before, todayIso().slice(0, 7)]).toContain(start);
    expect(end).toBe(start);
    expect(events.of('change')).toHaveLength(1);
    expect(isOpen(m)).toBe(false);
  });

  it('takes its labels from texts', async () => {
    const m = await mountPicker({
      showToday: true,
      texts: { thisMonth: 'Tämä kuu', today: 'Tänään' },
    });

    expect(todayButton(m).textContent?.trim()).toBe('Tänään');

    (m.host as unknown as { type: string }).type = 'month';
    await settle();

    expect(todayButton(m).textContent?.trim()).toBe('Tämä kuu');
  });

  it('sits at the bottom edge of the fullscreen panel', async () => {
    await page.viewport(360, 740);

    try {
      const m = await mountPicker({ showToday: true, value: '2031-09-17' });

      await open(m);
      await settled();

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

  const mountNarrowRange = (props: Record<string, unknown> = {}) =>
    mountNarrow(
      {
        label: 'Leave',
        value: { end: '2031-09-12', start: '2031-09-10' },
        ...props,
      },
      { range: true },
    );

  const selected = (m: Mounted, iso: string) =>
    cell(m, iso).getAttribute('aria-selected');

  const tap = async (m: Mounted, el: HTMLElement) => {
    await userEvent.click(el);
    await finishAnimations(m);
  };

  it('is in the fullscreen panel only, at the end of the row under the calendar', async () => {
    const wide = await mountPicker({ value: '2031-09-17' });

    await open(wide);

    expect(wide.shadowAll('[part~="done"]')).toHaveLength(0);

    await userEvent.keyboard('{Escape}');
    await settle();
    wide.unmount();

    const m = await mountNarrow({ showToday: true, value: '2031-09-17' });

    await open(m);
    await settled();

    const row = m.part('actions').getBoundingClientRect();

    expect(done(m).textContent?.trim()).toBe('Done');
    expect(row.bottom).toBe(m.part('panel').getBoundingClientRect().bottom);
    expect(done(m).getBoundingClientRect().left).toBeGreaterThan(
      m.part('today').getBoundingClientRect().right,
    );
    expect(done(m).getBoundingClientRect().height).toBe(44);
  });

  it('a pick only selects; Done commits once, closes and returns focus', async () => {
    const m = await mountNarrow({ value: '2031-09-17' });

    const events = recordEvents(m.host, EVENTS);

    await open(m);
    await tap(m, cell(m, '2031-09-20'));

    expect(selected(m, '2031-09-20')).toBe('true');
    expect(selected(m, '2031-09-17')).toBe('false');
    expect(events.of('change')).toHaveLength(0);
    expect(isOpen(m)).toBe(true);
    expect(m.host.value).toBe('2031-09-17');

    await tap(m, done(m));

    expect(events.of('change').map((r) => r.detail)).toEqual(['2031-09-20']);
    expect(isOpen(m)).toBe(false);
    expect(deepActiveElement()).toBe(inputs(m)[0]);
  });

  it('the close button, Escape and leaving the narrow viewport discard the pick', async () => {
    const m = await mountNarrow({ value: '2031-09-17' });

    const events = recordEvents(m.host, EVENTS);

    const exits: [string, () => Promise<unknown>][] = [
      ['close', () => userEvent.click(m.part('close'))],
      ['Escape', () => userEvent.keyboard('{Escape}')],
      ['threshold', () => page.viewport(1280, 800)],
    ];

    for (const [name, exit] of exits) {
      await open(m);
      await tap(m, cell(m, '2031-09-20'));
      await exit();
      await settle();

      expect(isOpen(m), name).toBe(false);
      expect(m.host.value, name).toBe('2031-09-17');

      await open(m);

      expect(selected(m, '2031-09-17'), name).toBe('true');
      expect(selected(m, '2031-09-20'), name).toBe('false');

      await userEvent.keyboard('{Escape}');
      await settle();
    }

    expect(events.of('change')).toHaveLength(0);
  });

  it('Done with no pick changes nothing, and bad input stays', async () => {
    const m = await mountNarrow();

    const [input] = inputs(m);

    await type(input, '31.02.2031');
    await userEvent.keyboard('{Enter}');
    await settle();

    const events = recordEvents(m.host, EVENTS);

    await open(m);
    await tap(m, done(m));

    expect(isOpen(m)).toBe(false);
    expect(events.of('change')).toHaveLength(0);
    expect(m.host.badInput).toBe(true);
    expect(input.value).toBe('31.02.2031');
  });

  it('under range, Done waits for the end and Tab skips it until then', async () => {
    const m = await mountNarrowRange();

    const events = recordEvents(m.host, EVENTS);

    await open(m);
    await tap(m, cell(m, '2031-09-20'));

    expect(done(m).disabled).toBe(true);

    for (let i = 0; i < 9; i++) {
      await userEvent.keyboard('{Tab}');

      expect(deepActiveElement()?.getAttribute('part')).not.toBe('done');
    }

    await tap(m, cell(m, '2031-09-15'));

    expect(done(m).disabled).toBe(false);
    expect(events.of('change')).toHaveLength(0);

    await tap(m, done(m));

    expect(events.of('change').map((r) => r.detail)).toEqual([
      { end: '2031-09-20', start: '2031-09-15' },
    ]);
  });

  it('Enter on a day selects and commits; on a range’s first day it only selects', async () => {
    const single = await mountNarrow({ value: '2031-09-17' });

    await open(single);
    await userEvent.keyboard('{ArrowRight}{Enter}');
    await settle();

    expect(single.host.value).toBe('2031-09-18');
    expect(isOpen(single)).toBe(false);

    single.unmount();

    const m = await mountNarrowRange();

    const events = recordEvents(m.host, EVENTS);

    await open(m);
    await userEvent.keyboard('{Enter}');
    await settle();

    expect(isOpen(m)).toBe(true);
    expect(events.of('change')).toHaveLength(0);

    await userEvent.keyboard('{ArrowDown}');
    await finishAnimations(m);
    await userEvent.keyboard('{Enter}');
    await settle();

    expect(isOpen(m)).toBe(false);
    expect(events.of('change').map((r) => r.detail)).toEqual([
      { end: '2031-09-17', start: '2031-09-10' },
    ]);
  });

  it('Today selects today on its month and waits for Done', async () => {
    const m = await mountNarrow({ showToday: true, value: '2031-09-17' });

    const events = recordEvents(m.host, EVENTS);

    await open(m);

    const before = todayIso();

    await tap(m, m.part('today'));

    const today = [before, todayIso()].find(
      (iso) => m.shadowAll(`td[data-date="${iso}"]`).length,
    )!;

    expect(isOpen(m)).toBe(true);
    expect(events.of('change')).toHaveLength(0);
    expect(selected(m, today)).toBe('true');

    await tap(m, done(m));

    expect(events.of('change').map((r) => r.detail)).toEqual([today]);
  });

  describe('type="month"', () => {
    const option = (m: Mounted, key: string): HTMLElement =>
      m.shadow(`ul[part~="list"] li[data-key="${key}"]`);

    const summaries = (m: Mounted) =>
      m
        .shadowAll<HTMLElement>('[part~="step-summary"]')
        .map((b) => b.textContent?.replace(/\s+/g, ' ').trim());

    it('the year pick stays on the year step; Done commits the month', async () => {
      const m = await mountNarrow({
        label: 'Period',
        type: 'month',
        value: '2031-09',
      });

      const events = recordEvents(m.host, EVENTS);

      await open(m);
      await tap(m, option(m, 'm3'));

      expect(done(m).disabled).toBe(true);

      await tap(m, option(m, 'y2032'));

      expect(isOpen(m)).toBe(true);
      expect(m.part('step-label').textContent?.trim()).toBe('Year');
      expect(summaries(m)).toEqual(['Month March']);
      expect(option(m, 'y2032').getAttribute('aria-selected')).toBe('true');
      expect(done(m).disabled).toBe(false);
      expect(events.of('change')).toHaveLength(0);

      await tap(m, done(m));

      expect(events.of('change').map((r) => r.detail)).toEqual(['2032-03']);
    });

    it('a month range stays on the end’s year step until Done', async () => {
      const m = await mountNarrow(
        {
          label: 'Period',
          type: 'month',
          value: { end: '2031-02', start: '2031-01' },
        },
        { range: true },
      );

      const events = recordEvents(m.host, EVENTS);

      await open(m);
      await tap(m, option(m, 'm3'));
      await tap(m, option(m, 'y2031'));

      expect(done(m).disabled).toBe(true);

      await tap(m, option(m, 'm5'));
      await tap(m, option(m, 'y2031'));

      expect(isOpen(m)).toBe(true);
      expect(m.part('step-label').textContent?.trim()).toBe('End year');
      expect(summaries(m)).toEqual(['Start month March 2031', 'End month May']);
      expect(done(m).disabled).toBe(false);
      expect(events.of('change')).toHaveLength(0);

      await tap(m, done(m));

      expect(events.of('change').map((r) => r.detail)).toEqual([
        { end: '2031-05', start: '2031-03' },
      ]);
    });
  });
});

describe('visual', () => {
  it('closed field', async () => {
    const m = await mountPicker({ value: '2001-02-14' });

    await matchScreenshotInBothModes(m.stage, 'closed-field');
  });

  it('open panel', async () => {
    const m = await mountPicker({ value: '2001-02-14' });

    await open(m);

    await matchScreenshotInBothModes(m.part('panel'), 'open-panel');
  });

  it('Today button', async () => {
    // No bounds, so the button is enabled whatever the date.
    const m = await mountPicker({ showToday: true, value: '2001-02-14' });

    await open(m);

    await matchScreenshotInBothModes(m.part('panel'), 'today-button');
  });

  it('fullscreen panel', async () => {
    await page.viewport(360, 740);

    try {
      const m = await mountPicker({ showToday: true, value: '2001-02-14' });

      await open(m);
      await settled();

      await matchScreenshotInBothModes(m.part('panel'), 'fullscreen-panel');
    } finally {
      await page.viewport(1280, 800);
    }
  });

  it('range band', async () => {
    const m = await mountPicker(
      { label: 'Leave', value: { end: '2001-02-16', start: '2001-02-12' } },
      { range: true },
    );

    await open(m);

    await matchScreenshotInBothModes(m.part('panel'), 'range-band');
  });

  it('year list', async () => {
    const m = await mountPicker({
      max: '2010-12-31',
      min: '1990-01-01',
      value: '2001-02-14',
    });

    await open(m);
    await userEvent.click(m.part('year-button'));
    await settle();

    await matchScreenshotInBothModes(m.part('panel'), 'year-list');
  });

  it('month step', async () => {
    const m = await mountPicker({
      label: 'Billing month',
      max: '2001-11',
      min: '2001-03',
      type: 'month',
      value: '2001-06',
    });

    await open(m);

    await matchScreenshotInBothModes(m.part('panel'), 'month-step');
  });

  it('year step', async () => {
    const m = await mountPicker({
      label: 'Billing month',
      max: '2004-12',
      min: '1998-01',
      type: 'month',
      value: '2001-06',
    });

    // The keyboard, so no pointer hover lands in the image.
    await open(m);
    await userEvent.keyboard('{ArrowUp}{ArrowUp}{ArrowUp}{Enter}');
    await finishAnimations(m);

    await matchScreenshotInBothModes(m.part('panel'), 'year-step');
  });

  it('month range: the end month step', async () => {
    const m = await mountPicker(
      {
        label: 'Reporting period',
        type: 'month',
        value: { end: '2001-07', start: '2001-03' },
      },
      { range: true },
    );

    // The keyboard, so no pointer hover lands in the image: March, then 2001.
    await open(m);
    await userEvent.keyboard('{Enter}');
    await finishAnimations(m);
    await userEvent.keyboard('{Enter}');
    await finishAnimations(m);

    await matchScreenshotInBothModes(m.part('panel'), 'range-end-month');
  });
});
