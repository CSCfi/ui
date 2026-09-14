/**
 * Light dismiss (CONTEXT.md "Light dismiss", ADR-0050): a press alone never
 * dismisses; the press-release pair does, and a cancelled press (a touch
 * scroll) is forgotten. Seeded from the phone report that scrolling a page
 * closed the open tree-select panel.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';

import {
  attachLightDismiss,
  attachPointerPair,
  type Detach,
} from './lightDismiss';

interface Fixture {
  inside: HTMLButtonElement;
  outside: HTMLButtonElement;
  surface: HTMLDivElement;
}

const build = (): Fixture => {
  const surface = document.createElement('div');

  surface.style.cssText = 'display:inline-block;padding:20px;background:#ccc';

  const inside = document.createElement('button');

  inside.textContent = 'inside';
  surface.append(inside);

  const outside = document.createElement('button');

  outside.textContent = 'outside';

  document.body.append(surface, outside);

  return { inside, outside, surface };
};

const pointer = (
  target: EventTarget,
  type: 'pointercancel' | 'pointerdown' | 'pointerup',
  init: PointerEventInit = {},
): void => {
  target.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      composed: true,
      isPrimary: true,
      pointerId: 1,
      pointerType: 'touch',
      ...init,
    }),
  );
};

let detach: Detach | null = null;

afterEach(() => {
  detach?.();
  detach = null;
});

describe('attachLightDismiss', () => {
  it('dismisses on a real click outside, not on one inside', async () => {
    const f = build();

    const onDismiss = vi.fn();

    detach = attachLightDismiss({
      isInside: (path) => path.includes(f.surface),
      onDismiss,
    });

    await userEvent.click(f.inside);

    expect(onDismiss).not.toHaveBeenCalled();

    await userEvent.click(f.outside);

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('a press outside that turns into a scroll (pointercancel) never dismisses', () => {
    const f = build();

    const onDismiss = vi.fn();

    detach = attachLightDismiss({
      isInside: (path) => path.includes(f.surface),
      onDismiss,
    });

    pointer(f.outside, 'pointerdown');

    expect(onDismiss, 'a press alone dismissed').not.toHaveBeenCalled();

    pointer(f.outside, 'pointercancel');
    // The stray release some engines still deliver after a cancel.
    pointer(f.outside, 'pointerup');

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('a press that starts or ends inside is not a dismissal', () => {
    const f = build();

    const onDismiss = vi.fn();

    detach = attachLightDismiss({
      isInside: (path) => path.includes(f.surface),
      onDismiss,
    });

    // Drag out of the surface.
    pointer(f.inside, 'pointerdown');
    pointer(f.outside, 'pointerup');

    // Drag into the surface.
    pointer(f.outside, 'pointerdown');
    pointer(f.inside, 'pointerup');

    expect(onDismiss).not.toHaveBeenCalled();

    pointer(f.outside, 'pointerdown');
    pointer(f.outside, 'pointerup');

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('ignores a release with no press since attach (the opening gesture)', () => {
    const f = build();

    const onDismiss = vi.fn();

    pointer(f.outside, 'pointerdown');

    detach = attachLightDismiss({
      isInside: (path) => path.includes(f.surface),
      onDismiss,
    });

    pointer(f.outside, 'pointerup');

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('ignores non-primary pointers and stops after detach', () => {
    const f = build();

    const onDismiss = vi.fn();

    detach = attachLightDismiss({
      isInside: (path) => path.includes(f.surface),
      onDismiss,
    });

    pointer(f.outside, 'pointerdown', { isPrimary: false, pointerId: 2 });
    pointer(f.outside, 'pointerup', { isPrimary: false, pointerId: 2 });

    expect(onDismiss).not.toHaveBeenCalled();

    detach();
    detach = null;

    pointer(f.outside, 'pointerdown');
    pointer(f.outside, 'pointerup');

    expect(onDismiss).not.toHaveBeenCalled();
  });
});

describe('attachPointerPair', () => {
  it('hands both composed paths to the caller once per completed pair', () => {
    const f = build();

    const onPair = vi.fn();

    detach = attachPointerPair(onPair);

    pointer(f.inside, 'pointerdown');
    pointer(f.outside, 'pointerup');

    expect(onPair).toHaveBeenCalledTimes(1);

    const [down, up] = onPair.mock.calls[0] as [EventTarget[], EventTarget[]];

    expect(down).toContain(f.inside);
    expect(down).toContain(f.surface);
    expect(up).toContain(f.outside);
    expect(up).not.toContain(f.surface);
  });
});
