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
 * one when none fits), the gap as an offset. The result is a style string the
 * component appends to its panel style — never written to `el.style` directly,
 * which Vue's next `:style` patch would wipe.
 *
 * On a browser with native support every method is a no-op and `style` stays
 * empty, so the native path is untouched. Floating UI is imported lazily, and
 * preloaded at setup where it will be needed so the first open does not wait
 * on it.
 *
 * Each consumer's `fallbacks` mirror its `position-try-fallbacks` rule; keep
 * the two in step.
 */

import type * as FloatingUiModule from '@floating-ui/dom';

import { onBeforeUnmount, readonly, ref, type Ref, watch } from 'vue';

import type { CPlacement } from '../types';

type FloatingUi = typeof FloatingUiModule;

type Side = 'bottom' | 'left' | 'right' | 'top';

/** True when the browser positions anchors without this fallback. */
export const supportsAnchorPositioning = (): boolean =>
  typeof CSS !== 'undefined' &&
  typeof CSS.supports === 'function' &&
  CSS.supports('anchor-name: --x') &&
  CSS.supports('position-anchor: --x');

let floatingUi: null | Promise<FloatingUi> = null;

const loadFloatingUi = (): Promise<FloatingUi> =>
  (floatingUi ??= import('@floating-ui/dom'));

const OPPOSITE: Record<Side, Side> = {
  bottom: 'top',
  left: 'right',
  right: 'left',
  top: 'bottom',
};

const sideOf = (placement: CPlacement): Side => placement.split('-')[0] as Side;

const isBlockSide = (side: Side): boolean =>
  side === 'top' || side === 'bottom';

const swapAlignment = (placement: CPlacement): CPlacement =>
  (placement.endsWith('-start')
    ? placement.replace('-start', '-end')
    : placement.replace('-end', '-start')) as CPlacement;

const swapSide = (placement: CPlacement): CPlacement =>
  placement.replace(
    sideOf(placement),
    OPPOSITE[sideOf(placement)],
  ) as CPlacement;

/** The `flip-block` try-tactic: mirror across the block axis. */
export const flipBlock = (placement: CPlacement): CPlacement =>
  isBlockSide(sideOf(placement))
    ? swapSide(placement)
    : swapAlignment(placement);

/** The `flip-inline` try-tactic: mirror across the inline axis. */
export const flipInline = (placement: CPlacement): CPlacement =>
  isBlockSide(sideOf(placement))
    ? swapAlignment(placement)
    : swapSide(placement);

/**
 * `position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline`
 * — the chain of `c-menu`, `c-tooltip` and `c-popover` — from `placement`.
 */
export const flipChain = (placement: CPlacement): CPlacement[] => [
  flipBlock(placement),
  flipInline(placement),
  flipInline(flipBlock(placement)),
];

export interface FallbackPosition {
  /** Start positioning — call once the panel is open. */
  start(): void;
  /** Stop tracking — call when the panel closes. */
  stop(): void;
  /** Declarations to append to the panel's inline style; empty with native support. */
  style: Readonly<Ref<string>>;
}

export interface UseFallbackPositionOptions {
  /** Ordered fallback placements, mirroring the panel's `position-try-fallbacks`. */
  fallbacks: (placement: CPlacement) => CPlacement[];
  /** The `popover` panel. */
  floating: Readonly<Ref<HTMLElement | null>>;
  /** The trigger→panel gap in px on the resolved placement's side (negative pulls the panel in). */
  gap: (side: Side) => number;
  /** The preferred placement (the inline `position-area`). */
  placement: () => CPlacement;
  /** The element the panel sits against. */
  reference: () => Element | null | undefined;
}

export const useFallbackPosition = (
  options: UseFallbackPositionOptions,
): FallbackPosition => {
  const style = ref('');

  const native = supportsAnchorPositioning();

  if (!native) void loadFloatingUi().catch(() => {});

  let cleanup: (() => void) | null = null;

  let update: (() => void) | null = null;

  // Bumped by every start/stop so a late import or computation of an earlier
  // open never lands.
  let generation = 0;

  const stop = (): void => {
    generation++;
    cleanup?.();
    cleanup = null;
    update = null;
  };

  const start = (): void => {
    if (native) return;

    stop();

    const current = generation;

    loadFloatingUi()
      .then(({ autoUpdate, computePosition, flip, offset }) => {
        const reference = options.reference();

        const floating = options.floating.value;

        if (current !== generation || !reference || !floating) return;

        update = () => {
          const placement = options.placement();

          void computePosition(reference, floating, {
            middleware: [
              offset(({ placement: resolved }) =>
                options.gap(sideOf(resolved as CPlacement)),
              ),
              flip({
                crossAxis: 'alignment',
                fallbackPlacements: options.fallbacks(placement),
                fallbackStrategy: 'initialPlacement',
              }),
            ],
            placement,
            strategy: 'fixed',
          }).then(({ x, y }) => {
            if (current !== generation) return;

            style.value = `position:fixed;inset:auto;margin:0;left:${x}px;top:${y}px;`;
          });
        };

        cleanup = autoUpdate(reference, floating, update);
      })
      .catch(() => {
        // A failed import must not break the overlay; the panel falls back
        // to its unanchored default position.
      });
  };

  if (!native) watch(options.placement, () => update?.());

  onBeforeUnmount(stop);

  return { start, stop, style: readonly(style) };
};
