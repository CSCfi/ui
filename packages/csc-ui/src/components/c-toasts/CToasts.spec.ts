/**
 * c-toasts behaviour: the stack glide (ADR-0073). A leaving toast is pinned
 * where it is while its neighbours glide into its place; an arrival glides the
 * toasts it moves. Specs run under reduced motion, where nothing glides, unless
 * a test opts back in with `withMotion()`.
 *
 * c-toast is internal (ADR-0075), so c-toasts is the toast's whole surface:
 * `addToast` returns the id `removeToast` takes, a toast's parts are styleable
 * as `toast-*`, and `close` reaches the page from c-toasts — c-toast's own
 * stops in c-toasts' shadow root.
 */
import { describe, expect, it } from 'vitest';

import type { CToastMessage } from '../../types';

import {
  matchScreenshotInBothModes,
  mount,
  type Mounted,
  nextFrame,
  recordEvents,
  settle,
  withMotion,
} from '../../test/harness';

type CToastsEl = {
  addToast(message: CToastMessage): string | undefined;
  removeToast(id: string): void;
} & HTMLElement;

const mountStack = (vertical: 'bottom' | 'top' = 'bottom') =>
  mount<CToastsEl>('c-toasts', { attrs: { vertical }, stage: false });

async function add(stack: Mounted<CToastsEl>, ...ids: string[]) {
  for (const id of ids) {
    stack.host.addToast({ id, message: `Toast ${id}`, persistent: true });
    await settle();
  }
}

const toast = (stack: Mounted<CToastsEl>, id: string) =>
  stack.shadow<HTMLElement>(`#c-toast--${id}`);

const top = (el: HTMLElement) => el.getBoundingClientRect().top;

const glides = (el: HTMLElement) =>
  el.getAnimations().filter((a) => a.id === 'c-toasts-glide');

describe('leaving toast', () => {
  for (const vertical of ['bottom', 'top'] as const) {
    it(`stays where it was in a ${vertical} stack, above and out of the pointer's way`, async () => {
      const stack = await mountStack(vertical);

      await add(stack, 'a', 'b', 'c');
      // Let the entrances finish: an exit that reverses a running entrance
      // is cut short.
      await settle(250);

      const b = toast(stack, 'b');

      const before = top(b);

      stack.host.removeToast('b');

      expect(top(b)).toBeCloseTo(before, 0);
      expect(b.style.position).toBe('absolute');
      expect(b.style.zIndex).toBe('1');
      expect(getComputedStyle(b).pointerEvents).toBe('none');

      // An arrival during the exit moves the stack, not the leaving toast.
      stack.host.addToast({ id: 'd', message: 'Toast d', persistent: true });
      // One frame: the arrival lands while the 0.2s fade still runs.
      await nextFrame();
      await new Promise((resolve) => setTimeout(resolve));
      expect(toast(stack, 'd').isConnected).toBe(true);
      expect(top(b)).toBeCloseTo(before, 0);

      await expect.poll(() => b.isConnected).toBe(false);
    });
  }

  it('moves its neighbours in one step under reduced motion', async () => {
    const stack = await mountStack();

    await add(stack, 'a', 'b', 'c');

    const a = toast(stack, 'a');

    const before = top(a);

    stack.host.removeToast('b');

    expect(glides(a)).toEqual([]);
    expect(top(a)).toBeGreaterThan(before);
  });
});

describe('stack glide', () => {
  it('glides the toasts a leaving one makes room for, and only those', async () => {
    await withMotion(async () => {
      const stack = await mountStack();

      await add(stack, 'a', 'b', 'c');

      const a = toast(stack, 'a');

      const c = toast(stack, 'c');

      const before = top(a);

      stack.host.removeToast('b');

      // Bottom stack: the toast above the gap comes down, the one below stays.
      expect(glides(a)).toHaveLength(1);
      expect(glides(c)).toEqual([]);
      expect(top(a)).toBeCloseTo(before, 0);
    });
  });

  it('glides the toasts an arrival pushes up', async () => {
    await withMotion(async () => {
      const stack = await mountStack();

      await add(stack, 'a');

      const a = toast(stack, 'a');

      await settle(600);
      stack.host.addToast({ id: 'b', message: 'Toast b', persistent: true });
      await settle();

      expect(glides(a)).toHaveLength(1);
      expect(glides(toast(stack, 'b'))).toEqual([]);
    });
  });
});

describe('the toast surface', () => {
  it('returns the id addToast shows the message under, for removeToast', async () => {
    const stack = await mountStack();

    const given = stack.host.addToast({ id: 'mine', message: 'Saved' });

    const generated = stack.host.addToast({ message: 'Sent' });

    // Synchronously, before the toasts render.
    expect(given).toBe('mine');
    expect(generated).toMatch(/\S/);
    expect(generated).not.toBe(given);

    await settle();
    expect(toast(stack, generated!)).not.toBeNull();
  });

  it('fires close with the message once a toast has left', async () => {
    const stack = await mountStack();

    const events = recordEvents(stack.host, ['close']);

    const id = stack.host.addToast({
      heading: 'Saved',
      message: 'Your changes were saved.',
      persistent: true,
    });
    await settle();

    stack.host.removeToast(id!);

    // After the toast's exit fade.
    await expect.poll(() => events.records.length).toBe(1);
    expect(events.records[0].detail).toMatchObject({
      heading: 'Saved',
      id,
      message: 'Your changes were saved.',
    });
  });

  it('forwards a toast’s parts as toast-*', async () => {
    const stack = await mountStack();

    stack.host.addToast({ id: 'a', message: 'Saved', persistent: true });
    await settle();

    expect(
      toast(stack, 'a').getAttribute('exportparts')?.split(/,\s*/),
    ).toEqual([
      'root:toast-root',
      'custom:toast-custom',
      'content:toast-content',
      'item:toast-item',
      'badge:toast-badge',
      'close:toast-close',
      'progress:toast-progress',
    ]);

    const style = document.createElement('style');
    style.textContent =
      'c-toasts::part(toast-close) { outline: 3px solid rgb(255, 0, 0); }';
    document.head.append(style);

    try {
      const close = toast(stack, 'a').shadowRoot!.querySelector<HTMLElement>(
        '[part~="close"]',
      )!;

      expect(getComputedStyle(close).outlineColor).toBe('rgb(255, 0, 0)');
    } finally {
      style.remove();
    }
  });
});

describe('visual', () => {
  it('a resting stack', async () => {
    const stack = await mountStack();

    stack.host.addToast({
      heading: 'Saved',
      id: 'saved',
      message: 'Your changes were saved.',
      persistent: true,
      type: 'success',
    });
    stack.host.addToast({
      closeText: 'Dismiss',
      id: 'failed',
      message: 'The upload failed.',
      persistent: true,
      type: 'error',
    });
    await settle(400);

    await matchScreenshotInBothModes(stack.host, 'c-toasts-stack');
  });
});
