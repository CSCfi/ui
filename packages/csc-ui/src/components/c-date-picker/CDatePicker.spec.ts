/**
 * Behaviour spec for c-date-picker (CONTEXT.md "Date picker", "Day grid",
 * "Pending start", "Bad input"; ADR-0057, ADR-0058).
 *
 * Every fixture pins its month with `value` or `min`/`max` far from today,
 * so no assertion or baseline depends on the wall clock.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import type { Mounted } from '../../test/harness';

import { resetDefaults } from '../../shared/appDefaults';
import {
  deepActiveElement,
  matchScreenshotInBothModes,
  mount,
  recordEvents,
  settle,
  settled,
} from '../../test/harness';

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
});
