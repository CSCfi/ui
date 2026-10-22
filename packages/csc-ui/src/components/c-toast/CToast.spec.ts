/**
 * c-toast behaviour: swipe dismiss (CONTEXT.md "Swipe dismiss", ADR-0073) and
 * the press that holds the timer. Specs run under reduced motion unless a test
 * opts back in with `withMotion()`. The rules themselves are pinned in
 * `swipe.node.spec.ts`; here a 300px toast (threshold 100px) is driven with
 * synthetic pointer events.
 */
import { describe, expect, it } from 'vitest';

import type { CToastMessage } from '../../types';

import {
  mount,
  type Mounted,
  recordEvents,
  settle,
  withMotion,
} from '../../test/harness';

type CToastEl = { closeToast(): void; message: CToastMessage } & HTMLElement;

const WIDTH = 300;

const mountToast = (message: Partial<CToastMessage> = {}) =>
  mount<CToastEl>('c-toast', {
    attrs: { style: `width: ${WIDTH}px` },
    props: {
      // Persistent unless a test runs the timer: a bare c-toast has no
      // default duration, so a timed one would close at once.
      message: {
        id: 'saved',
        message: 'Changes saved',
        persistent: true,
        type: 'success',
        ...message,
      },
    },
  });

const pointer = (target: Element, type: string, x: number, y: number) =>
  target.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      button: 0,
      buttons: type === 'pointerup' ? 0 : 1,
      clientX: x,
      clientY: y,
      composed: true,
      isPrimary: true,
      pointerId: 1,
      pointerType: 'mouse',
    }),
  );

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Slow steps leave the velocity window behind; quick ones make a flick.
const SLOW = () => settle(120);

const QUICK = () => wait(10);

/** Press the toast's centre, move through `steps` (x, or [x, y]) and release at the last. */
async function drag(
  m: Mounted<CToastEl>,
  steps: ([number, number] | number)[],
  gap: () => Promise<unknown> = SLOW,
  release = true,
): Promise<void> {
  const r = m.host.getBoundingClientRect();

  const x0 = r.left + r.width / 2;

  const y0 = r.top + r.height / 2;

  const target = m.part('content');

  let last: [number, number] = [0, 0];

  pointer(target, 'pointerdown', x0, y0);

  for (const step of steps) {
    await gap();
    last = typeof step === 'number' ? [step, 0] : step;
    pointer(target, 'pointermove', x0 + last[0], y0 + last[1]);
  }

  if (!release) return;
  await gap();
  pointer(target, 'pointerup', x0 + last[0], y0 + last[1]);
}

const closes = (m: Mounted<CToastEl>) => recordEvents(m.host, ['close']);

describe('swipe dismiss', () => {
  it('dismisses a toast let go past a third of its width, fading where it was let go', async () => {
    const m = await mountToast();

    const events = closes(m);

    await drag(m, [20, 60, 120]);

    // Reduced motion: no slide on, the cross-fade runs from the release point.
    expect(m.host.style.transform).toBe('translateX(120px)');
    expect(m.host.classList.contains('leaving')).toBe(true);
    await expect.poll(() => events.of('close').length).toBe(1);
    expect(events.details<CToastMessage>()[0]).toMatchObject({ id: 'saved' });
  });

  it('dismisses to the left as well', async () => {
    const m = await mountToast();

    const events = closes(m);

    await drag(m, [-30, -110]);
    await expect.poll(() => events.of('close').length).toBe(1);
  });

  it('springs back from a short drag, leaving no drag styles behind', async () => {
    const m = await mountToast();

    const events = closes(m);

    await drag(m, [20, 50]);
    await settle(300);

    expect(events.records).toEqual([]);
    expect(m.host.classList.contains('leaving')).toBe(false);
    expect(m.host.style.transform).toBe('');
    expect(m.host.style.opacity).toBe('');
    expect(m.host.style.transition).toBe('');
  });

  it('follows the pointer and fades with the distance', async () => {
    const m = await mountToast();

    await drag(m, [20, 100], SLOW, false);

    expect(m.host.style.transform).toBe('translateX(100px)');
    expect(Number(m.host.style.opacity)).toBeCloseTo(0.5);
    expect(m.host.classList.contains('swiping')).toBe(true);
    pointer(m.part('content'), 'pointercancel', 0, 0);
  });

  it('dismisses a short flick', async () => {
    const m = await mountToast();

    const events = closes(m);

    await drag(m, [15, 35, 60], QUICK);
    await expect.poll(() => events.of('close').length).toBe(1);
  });

  it('springs back from a flick toward rest, even past a third', async () => {
    const m = await mountToast();

    const events = closes(m);

    const r = m.host.getBoundingClientRect();

    const x0 = r.left + r.width / 2;

    const y0 = r.top + r.height / 2;

    const target = m.part('content');

    pointer(target, 'pointerdown', x0, y0);

    for (const dx of [40, 120, 250]) {
      await SLOW();
      pointer(target, 'pointermove', x0 + dx, y0);
    }

    for (const dx of [230, 210, 190]) {
      await QUICK();
      pointer(target, 'pointermove', x0 + dx, y0);
    }

    await QUICK();
    pointer(target, 'pointerup', x0 + 190, y0);
    await settle(300);

    expect(events.records).toEqual([]);
    expect(m.host.style.transform).toBe('');
  });

  it('keeps dragging when a touch hands its implicit capture to the host', async () => {
    const m = await mountToast();

    const content = m.part('content');

    await drag(m, [20, 60], SLOW, false);
    // A touch press starts captured by the element under the finger; the
    // claim moving capture to the host fires that element's loss.
    content.dispatchEvent(
      new PointerEvent('lostpointercapture', {
        bubbles: true,
        composed: true,
        isPrimary: true,
        pointerId: 1,
        pointerType: 'touch',
      }),
    );

    const r = m.host.getBoundingClientRect();

    pointer(content, 'pointermove', r.left + r.width / 2 + 40, r.top + 10);

    expect(m.host.classList.contains('swiping')).toBe(true);
    expect(m.host.style.transform).not.toBe('');
    pointer(content, 'pointercancel', 0, 0);
  });

  it('leaves a mostly vertical drag to the page', async () => {
    const m = await mountToast();

    const events = closes(m);

    await drag(m, [
      [3, 20],
      [120, 60],
    ]);
    await settle(300);

    expect(m.host.style.transform).toBe('');
    expect(events.records).toEqual([]);
  });

  it('does not swipe a custom or an indeterminate toast', async () => {
    for (const message of [{ custom: true }, { indeterminate: true }]) {
      const m = await mountToast(message);

      const events = closes(m);

      expect(m.host.classList.contains('swipeable')).toBe(false);

      // A custom toast has no content part of its own until slotted content
      // arrives; press its root instead.
      const r = m.host.getBoundingClientRect();

      const target = m.part('root');

      pointer(target, 'pointerdown', r.left + 150, r.top + 10);
      await SLOW();
      pointer(target, 'pointermove', r.left + 280, r.top + 10);
      await SLOW();
      pointer(target, 'pointerup', r.left + 280, r.top + 10);
      await settle(300);

      expect(m.host.style.transform).toBe('');
      expect(events.records).toEqual([]);
      m.unmount();
    }
  });

  it('closes normally when closeToast() interrupts a drag', async () => {
    const m = await mountToast();

    const events = closes(m);

    await drag(m, [20, 60], SLOW, false);
    m.host.closeToast();

    await expect.poll(() => events.of('close').length).toBe(1);
    expect(m.host.classList.contains('swiping')).toBe(false);
    pointer(m.part('content'), 'pointerup', 0, 0);
    expect(events.of('close')).toHaveLength(1);
  });

  it('emits close for a toast closed before its entrance', async () => {
    const el = document.createElement('c-toast') as CToastEl;

    const events = recordEvents(el, ['close']);

    el.message = { id: 'early', message: 'Gone' };
    document.body.append(el);
    el.closeToast();

    expect(events.of('close')).toHaveLength(1);
    await settle();
    expect(el.classList.contains('show')).toBe(false);
  });

  it('slides on by its own width and fades out under full motion', async () => {
    await withMotion(async () => {
      const m = await mountToast();

      const events = closes(m);

      await drag(m, [20, 60, 120]);

      expect(m.host.style.transform).toBe(`translateX(${120 + WIDTH}px)`);
      expect(m.host.style.opacity).toBe('0');
      await expect.poll(() => events.of('close').length).toBe(1);
    });
  });

  it('eases back to rest under full motion', async () => {
    await withMotion(async () => {
      const m = await mountToast();

      await drag(m, [20, 50]);

      expect(m.host.getAnimations().length).toBeGreaterThan(0);
      await settle(350);
      expect(m.host.getAnimations()).toEqual([]);
      expect(m.host.style.transform).toBe('');
      expect(m.host.style.transition).toBe('');
    });
  });
});

describe('timer', () => {
  it('waits while the toast is pressed, wherever the press is released', async () => {
    const m = await mountToast({ duration: 1000, persistent: false });

    const events = closes(m);

    const r = m.host.getBoundingClientRect();

    pointer(m.part('content'), 'pointerdown', r.left + 20, r.top + 20);
    await settle(1300);

    expect(events.records).toEqual([]);
    expect(m.host.classList.contains('held')).toBe(true);

    // Released off the toast: the hold still ends.
    pointer(document.body, 'pointerup', 5, 5);
    expect(m.host.classList.contains('held')).toBe(false);
    await expect
      .poll(() => events.of('close').length, { timeout: 2000 })
      .toBe(1);
  });

  it('a press on a custom toast holds its timer too', async () => {
    const m = await mountToast({
      custom: true,
      duration: 1000,
      persistent: false,
    });

    const events = closes(m);

    pointer(m.part('root'), 'pointerdown', 10, 10);
    await settle(1300);

    expect(events.records).toEqual([]);
    pointer(document.body, 'pointercancel', 0, 0);
    await expect
      .poll(() => events.of('close').length, { timeout: 2000 })
      .toBe(1);
  });
});
