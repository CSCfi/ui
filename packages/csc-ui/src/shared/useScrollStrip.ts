/**
 * Scroll strip: a single-row list that scrolls sideways when it is wider
 * than its box — the tab strip of `c-tab-buttons` (CONTEXT.md "Tab
 * buttons"). Built on a native horizontal scroll container with its
 * scrollbar hidden, so touch panning, momentum and keyboard focus
 * scrolling come from the browser; this composable adds what a bare
 * scroller lacks: overflow state for edge arrows, an arrow step, mouse
 * drag, a vertical-wheel translation and a `reveal` that brings one child
 * into view without scrolling the page.
 */
import type { Ref } from 'vue';

import { onBeforeUnmount, onMounted, ref } from 'vue';

export interface ScrollStrip {
  /** Scroll back by half the visible width. */
  back(): void;
  /** True while the strip can scroll back (its start is out of view). */
  canBack: Ref<boolean>;
  /** True while the strip can scroll forward (its end is out of view). */
  canForward: Ref<boolean>;
  /** Scroll forward by half the visible width. */
  forward(): void;
  /**
   * Mouse drag scrolling: bind to the scroller's `pointerdown`. Touch and
   * pen pan natively and are ignored here. A drag that moved swallows the
   * `click` it would otherwise end in.
   */
  onPointerDown(event: PointerEvent): void;
  /**
   * Translate a vertical wheel into horizontal scrolling while the strip
   * overflows: bind to the scroller's `wheel`.
   */
  onWheel(event: WheelEvent): void;
  /** True while the content is wider than the scroller. */
  overflowing: Ref<boolean>;
  /** Scroll the strip just enough to bring `el` fully into view. */
  reveal(el: Element | null | undefined): void;
  /** Re-read the overflow state (after content changed size). */
  update(): void;
}

/** Pointer travel before a press counts as a drag rather than a click. */
const DRAG_THRESHOLD = 4;

/** Breathing room kept between a revealed child and the scroller's edge. */
const REVEAL_MARGIN = 4;

export const useScrollStrip = (
  scroller: Ref<HTMLElement | null>,
): ScrollStrip => {
  const overflowing = ref(false);

  const canBack = ref(false);

  const canForward = ref(false);

  const update = (): void => {
    const el = scroller.value;

    if (!el) return;

    const max = el.scrollWidth - el.clientWidth;

    overflowing.value = max > 1;
    canBack.value = el.scrollLeft > 1;
    canForward.value = el.scrollLeft < max - 1;
  };

  const scrollBy = (left: number): void => {
    scroller.value?.scrollBy({ behavior: 'smooth', left });
  };

  const back = (): void => scrollBy(-(scroller.value?.clientWidth ?? 0) / 2);

  const forward = (): void => scrollBy((scroller.value?.clientWidth ?? 0) / 2);

  const reveal = (el: Element | null | undefined): void => {
    const box = scroller.value;

    if (!box || !el) return;

    const outer = box.getBoundingClientRect();

    const inner = el.getBoundingClientRect();

    if (inner.left < outer.left) {
      scrollBy(inner.left - outer.left - REVEAL_MARGIN);
    } else if (inner.right > outer.right) {
      scrollBy(inner.right - outer.right + REVEAL_MARGIN);
    }
  };

  const onWheel = (event: WheelEvent): void => {
    const el = scroller.value;

    if (!el || !overflowing.value) return;

    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

    const before = el.scrollLeft;

    el.scrollLeft += event.deltaY;

    if (el.scrollLeft !== before) event.preventDefault();
  };

  const onPointerDown = (event: PointerEvent): void => {
    const el = scroller.value;

    if (!el || event.pointerType !== 'mouse' || event.button !== 0) return;

    if (!overflowing.value) return;

    const startX = event.clientX;

    const startLeft = el.scrollLeft;

    let dragged = false;

    const onMove = (move: PointerEvent): void => {
      const dx = move.clientX - startX;

      if (!dragged && Math.abs(dx) < DRAG_THRESHOLD) return;

      dragged = true;
      el.scrollLeft = startLeft - dx;
    };

    const swallowClick = (click: Event): void => {
      click.stopPropagation();
      click.preventDefault();
    };

    const onUp = (): void => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);

      if (!dragged) return;

      // The release lands on a button: the click it fires is the end of a
      // drag, not an activation.
      el.addEventListener('click', swallowClick, { capture: true, once: true });
      requestAnimationFrame(() =>
        el.removeEventListener('click', swallowClick, { capture: true }),
      );
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
  };

  let resizeObserver: null | ResizeObserver = null;

  onMounted(() => {
    const el = scroller.value;

    if (!el) return;

    // Deferred a frame: the state this sets can show or hide the edge
    // arrows, which resizes the scroller again inside the same layout pass
    // — the "ResizeObserver loop" the browser reports as an error.
    resizeObserver = new ResizeObserver(() => requestAnimationFrame(update));
    resizeObserver.observe(el);

    for (const child of Array.from(el.children)) resizeObserver.observe(child);

    el.addEventListener('scroll', update, { passive: true });
    update();
  });

  onBeforeUnmount(() => {
    resizeObserver?.disconnect();
    resizeObserver = null;
    scroller.value?.removeEventListener('scroll', update);
  });

  return {
    back,
    canBack,
    canForward,
    forward,
    onPointerDown,
    onWheel,
    overflowing,
    reveal,
    update,
  };
};
