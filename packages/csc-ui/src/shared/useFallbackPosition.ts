/**
 * Anchored-panel positioning for browsers without CSS anchor positioning
 * (Firefox 140 ESR; ADR-0056).
 *
 * The overlay components place their top-layer panels with native CSS anchor
 * positioning — `anchor-name` / `position-anchor` / `position-area` plus a
 * `position-try-fallbacks` chain. A browser without the feature drops those
 * declarations, so this composable computes the same placement with
 * `@floating-ui/dom` instead: the preferred placement, then the component's
 * fallback chain in the native order (first one that fits wins, the preferred
 * one when none fits), the gap as an offset. When even the chosen placement
 * overflows, the panel is shifted back inside the viewport on both axes, as a
 * native `position-area` box is kept inside its containing block — a panel
 * larger than the viewport starts at its top/left edge. The clamp applies to
 * the margin box natively, so the gap pads the viewport on the placement's
 * axis. The result is a style string the
 * component appends to its panel style — never written to `el.style` directly,
 * which Vue's next `:style` patch would wipe.
 *
 * On a browser with native support every method is a no-op and `style` stays
 * empty, so the native path is untouched — unless the panel is `scripted`, or
 * its anchor sits in a fixed or sticky box (`inFixedOrStickyBox`), decided at
 * each open: those are placed this way in every browser (ADR-0056, amended
 * 2026-11-20). The scripted style also switches the panel's own
 * `position-area` and `position-try-fallbacks` off, which would otherwise
 * still shape it. Floating UI is imported lazily, and preloaded where it will
 * be needed so the first open does not wait on it. Call `start()` right after
 * `showPopover()`: the placement then lands before the first paint, which the
 * queued `toggle` event would miss.
 *
 * Each consumer's `fallbacks` mirror its `position-try-fallbacks` rule; keep
 * the two in step.
 */

import type * as FloatingUiModule from '@floating-ui/dom';
import type {
  Middleware,
  Padding,
  Placement,
  VirtualElement,
} from '@floating-ui/dom';

import {
  type MaybeRefOrGetter,
  onBeforeUnmount,
  onMounted,
  readonly,
  ref,
  type Ref,
  toValue,
  watch,
} from 'vue';

import type { Placement as PanelPlacement } from './positionArea';

type FloatingUi = typeof FloatingUiModule;

type Side = 'bottom' | 'left' | 'right' | 'top';

/** True when the browser positions anchors without this fallback. */
export const supportsAnchorPositioning = (): boolean =>
  typeof CSS !== 'undefined' &&
  typeof CSS.supports === 'function' &&
  CSS.supports('anchor-name: --x') &&
  CSS.supports('position-anchor: --x');

/** The element's parent in the flat tree: its slot, parent or shadow host. */
const flatParent = (el: Element): Element | null =>
  el.assignedSlot ??
  el.parentElement ??
  (el.parentNode as null | ShadowRoot)?.host ??
  null;

/**
 * True when `el` or a flat-tree ancestor is `position: fixed` or `sticky`: a
 * box that does not scroll with the page, such as a pinned toolbar, or a
 * top-layer panel or modal dialog (fixed by the UA). Safari 26's native
 * positioning misplaces a panel anchored inside one by the scroll distance
 * (ADR-0056, amended 2026-11-20).
 */
export const inFixedOrStickyBox = (el: Element | null | undefined): boolean => {
  for (let node = el ?? null; node; node = flatParent(node)) {
    const { position } = getComputedStyle(node);

    if (position === 'fixed' || position === 'sticky') return true;
  }

  return false;
};

/** The elements that render `el`'s box: its slot's assignees, or its shadow or light children. */
const renderedChildren = (el: Element): Element[] =>
  el instanceof HTMLSlotElement
    ? el.assignedElements({ flatten: true })
    : [...(el.shadowRoot ?? el).children];

/** The boxes `el` renders, through any `display: contents` layers. */
const renderedBoxes = (el: Element): DOMRect[] =>
  getComputedStyle(el).display === 'contents'
    ? renderedChildren(el).flatMap(renderedBoxes)
    : [el.getBoundingClientRect()].filter((r) => r.width || r.height);

/**
 * What Floating UI measures for `el`. A `display: contents` element, such as
 * a component host like `c-button` designated as a trigger, has no box of its
 * own (an empty rect at 0,0), so it is measured by the union of the boxes it
 * renders.
 */
const measurable = (el: Element): Element | VirtualElement =>
  getComputedStyle(el).display === 'contents'
    ? {
        contextElement: el,
        getBoundingClientRect: () => {
          const boxes = renderedBoxes(el);

          if (!boxes.length) return el.getBoundingClientRect();

          const left = Math.min(...boxes.map((r) => r.left));

          const top = Math.min(...boxes.map((r) => r.top));

          const right = Math.max(...boxes.map((r) => r.right));

          const bottom = Math.max(...boxes.map((r) => r.bottom));

          return new DOMRect(left, top, right - left, bottom - top);
        },
      }
    : el;

let floatingUi: null | Promise<FloatingUi> = null;

const loadFloatingUi = (): Promise<FloatingUi> =>
  (floatingUi ??= import('@floating-ui/dom'));

const OPPOSITE: Record<Side, Side> = {
  bottom: 'top',
  left: 'right',
  right: 'left',
  top: 'bottom',
};

const sideOf = (placement: PanelPlacement): Side =>
  placement.split('-')[0] as Side;

const isBlockSide = (side: Side): boolean =>
  side === 'top' || side === 'bottom';

const swapAlignment = (placement: PanelPlacement): PanelPlacement =>
  (placement.endsWith('-start')
    ? placement.replace('-start', '-end')
    : placement.replace('-end', '-start')) as PanelPlacement;

const swapSide = (placement: PanelPlacement): PanelPlacement =>
  placement.replace(
    sideOf(placement),
    OPPOSITE[sideOf(placement)],
  ) as PanelPlacement;

/** The `flip-block` try-tactic: mirror across the block axis. */
export const flipBlock = (placement: PanelPlacement): PanelPlacement =>
  isBlockSide(sideOf(placement))
    ? swapSide(placement)
    : swapAlignment(placement);

/** The `flip-inline` try-tactic: mirror across the inline axis. */
export const flipInline = (placement: PanelPlacement): PanelPlacement =>
  isBlockSide(sideOf(placement))
    ? swapAlignment(placement)
    : swapSide(placement);

/**
 * `position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline`
 * — the chain of `c-menu`, `c-tooltip` and `c-popover` — from `placement`.
 */
export const flipChain = (placement: PanelPlacement): PanelPlacement[] => [
  flipBlock(placement),
  flipInline(placement),
  flipInline(flipBlock(placement)),
];

export interface FallbackPosition {
  /**
   * Start positioning — call right after `showPopover()`. A second call
   * while this open is already placed does nothing.
   */
  start(): void;

  /** Stop tracking — call when the panel closes. */
  stop(): void;

  /** Declarations to append to the panel's inline style; empty while native. */
  style: Readonly<Ref<string>>;
}

export interface UseFallbackPositionOptions {
  /** Ordered fallback placements, mirroring the panel's `position-try-fallbacks`. */
  fallbacks: (placement: PanelPlacement) => PanelPlacement[];

  /** The `popover` panel. */
  floating: Readonly<Ref<HTMLElement | null>>;

  /** The trigger→panel gap in px on the resolved placement's side (negative pulls the panel in). */
  gap: (side: Side) => number;

  /** The preferred placement (the inline `position-area`). */
  placement: () => PanelPlacement;

  /** The element the panel sits against. */
  reference: () => Element | null | undefined;

  /**
   * Place the panel with Floating UI in every browser, even where anchors are
   * positioned natively: a submenu, anchored inside the menu's own top-layer
   * panel, is left behind by Safari's native positioning once the page
   * scrolls, and a designated trigger has no native anchor at all.
   */
  scripted?: MaybeRefOrGetter<boolean>;
}

export const useFallbackPosition = (
  options: UseFallbackPositionOptions,
): FallbackPosition => {
  const style = ref('');

  const supported = supportsAnchorPositioning();

  const preload = (): void => void loadFloatingUi().catch(() => {});

  // Decided at each open: the anchor's surroundings can change between opens.
  const placedByScript = (): boolean =>
    !supported ||
    toValue(options.scripted) === true ||
    inFixedOrStickyBox(options.reference());

  if (!supported || options.scripted === true) preload();

  onMounted(() => {
    // Watched from mount, not setup: the getter may read component state
    // declared after this call. A designated trigger can resolve later still.
    watch(
      () => toValue(options.scripted),
      (scripted) => {
        if (scripted) preload();
      },
      { immediate: true },
    );

    // An anchor in a fixed or sticky box, looked for a task after mount: by
    // then the surrounding elements have upgraded and slotted this one into
    // their shadow trees, where a pinned toolbar keeps its sticky box.
    if (supported) {
      setTimeout(() => {
        if (inFixedOrStickyBox(options.reference())) preload();
      });
    }
  });

  let cleanup: (() => void) | null = null;

  let update: (() => void) | null = null;

  let started = false;

  // Bumped by every start/stop so a late import or computation of an earlier
  // open never lands.
  let generation = 0;

  const stop = (): void => {
    generation++;
    cleanup?.();
    cleanup = null;
    update = null;
    started = false;
  };

  const start = (): void => {
    if (started) return;

    if (!placedByScript()) {
      style.value = '';

      return;
    }

    stop();
    started = true;

    const current = generation;

    loadFloatingUi()
      .then(
        ({ autoUpdate, computePosition, detectOverflow, offset, shift }) => {
          const element = options.reference();

          const reference = element && measurable(element);

          const floating = options.floating.value;

          if (current !== generation || !reference || !floating) return;

          // Natively the panel's margin box — the gap on both sides of the
          // placement's axis — is what must fit, and what is kept inside.
          const padding = (placement: Placement): Padding => {
            const side = sideOf(placement as PanelPlacement);

            const gap = options.gap(side);

            return isBlockSide(side)
              ? { bottom: gap, left: 0, right: 0, top: gap }
              : { bottom: 0, left: gap, right: gap, top: 0 };
          };

          // The last placement that fitted while this panel is open — native
          // keeps it when no option fits any more ("last successful position
          // option") — and the preferred placement it was tried from.
          let lastFit: { from: PanelPlacement; placement: Placement } | null =
            null;

          // The native try chain: the first placement that fits entirely wins;
          // when none does, the last one that fitted, else the preferred one.
          // Not Floating UI's `flip`, which prefers any candidate that fits on
          // the side axis, however far it overflows along the other.
          const tryChain = (candidates: PanelPlacement[]): Middleware => ({
            async fn(state) {
              const tried: number = state.middlewareData.tryChain?.index ?? 0;

              const overflow = await detectOverflow(state, {
                padding: padding(state.placement),
              });

              if (Object.values(overflow).every((v) => v <= 0)) {
                return { data: { fit: state.placement, index: tried } };
              }

              const settled =
                lastFit?.from === candidates[0]
                  ? lastFit.placement
                  : candidates[0];

              const next = candidates[tried + 1] ?? settled;

              return next === state.placement
                ? {}
                : { data: { index: tried + 1 }, reset: { placement: next } };
            },
            name: 'tryChain',
          });

          update = () => {
            const placement = options.placement();

            void computePosition(reference, floating, {
              middleware: [
                offset(({ placement: resolved }) =>
                  options.gap(sideOf(resolved as PanelPlacement)),
                ),
                tryChain([placement, ...options.fallbacks(placement)]),
                shift(({ placement: resolved }) => ({
                  crossAxis: true,
                  padding: padding(resolved),
                })),
              ],
              placement,
              strategy: 'fixed',
            }).then(({ middlewareData, placement: resolved, x, y }) => {
              if (current !== generation) return;

              if (middlewareData.tryChain?.fit === resolved) {
                lastFit = { from: placement, placement: resolved };
              }

              style.value = `position:fixed;inset:auto;margin:0;position-area:none;position-try-fallbacks:none;left:${x}px;top:${y}px;`;
            });
          };

          cleanup = autoUpdate(reference, floating, update);
        },
      )
      .catch(() => {
        // A failed import must not break the overlay; the panel falls back
        // to its unanchored default position.
      });
  };

  watch(options.placement, () => update?.());

  onBeforeUnmount(stop);

  return { start, stop, style: readonly(style) };
};
