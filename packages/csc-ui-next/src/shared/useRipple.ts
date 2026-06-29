import { ref, type Ref } from 'vue';

export interface RippleInstance {
  /** Optional tag so one composable instance can drive many surfaces (e.g. the
   *  radio group's v-for items): filter `ripples` by `group` when rendering. */
  group?: number | string;
  id: number;
  style: Record<string, string>;
}

export interface SpawnRippleOptions {
  /** Force-centre the ripple in the container (default false). */
  center?: boolean;
  /** Per-spawn container override — for consumers with many surfaces (radio
   *  group) that resolve the target only at activation time. Falls back to the
   *  composable's `container` option. */
  container?: () => HTMLElement | null | undefined;
  /** Tag stamped onto the spawned ripple (see `RippleInstance.group`). */
  group?: number | string;
}

export interface UseRippleOptions {
  /** Resolve the surface ripples are measured/positioned against. Optional when
   *  the container is supplied per-spawn instead (multi-surface consumers). */
  container?: () => HTMLElement | null | undefined;
  /** Transition + cleanup duration in ms (default 600). */
  duration?: number;
  /** Peak opacity at spawn (default 0.4 — the standardized value). */
  opacity?: number;
  /** Multiplier on max(w,h) for the ripple diameter (default 2; checkbox uses 1). */
  sizeFactor?: number;
}

/**
 * Material-style click ripple, shared across the interactive components
 * (button, icon-button, tab, list-item, checkbox, swiper-tab) so the geometry
 * math, double-`requestAnimationFrame` scheduling and timeout cleanup live in
 * one place.
 *
 * Each spawn pushes a `<span>` descriptor onto the reactive `ripples` array;
 * the consumer renders them (`v-for`) with its own tv `ripple` slot, which must
 * carry the transition utilities (`scale-0 transition-[transform,opacity]
 * duration-[600ms] ease-out`). Per ADR-0004 there is no bespoke `@keyframes`:
 * the dot starts at `scale(0)`/peak opacity and is mutated to `scale(1)`/0 on
 * the next painted frame, letting the CSS transition tween it.
 *
 * Usage:
 *   const rootRef = useTemplateRef('rootRef');
 *   const { ripples, spawn } = useRipple({ container: () => rootRef.value });
 *   // on click: spawn(event)
 */
export function useRipple(options: UseRippleOptions): {
  ripples: Ref<RippleInstance[]>;
  spawn: (event?: MouseEvent | null, spawnOptions?: SpawnRippleOptions) => void;
} {
  const ripples = ref<RippleInstance[]>([]);

  let nextId = 0;

  const { duration = 600, opacity = 0.4, sizeFactor = 2 } = options;

  /**
   * Spawn a ripple. Pass `null`/no event for coordinate-less, always-centred
   * triggers (e.g. the checkbox change event). Keyboard activations (Enter /
   * Space fire with `detail === 0` and `clientX/Y === 0`) are auto-centred so
   * the ripple doesn't land off-screen and get clipped.
   */
  const spawn = (
    event?: MouseEvent | null,
    spawnOptions: SpawnRippleOptions = {},
  ) => {
    const container = (spawnOptions.container ?? options.container)?.();

    if (!container) return;

    const rect = container.getBoundingClientRect();

    const size = Math.max(rect.width, rect.height) * sizeFactor;

    const keyboard =
      !event ||
      (event.detail === 0 && event.clientX === 0 && event.clientY === 0);

    const center = spawnOptions.center || keyboard;

    const originX = center ? rect.left + rect.width / 2 : event!.clientX;

    const originY = center ? rect.top + rect.height / 2 : event!.clientY;

    const base = {
      height: `${size}px`,
      left: `${originX - rect.left - size / 2}px`,
      top: `${originY - rect.top - size / 2}px`,
      width: `${size}px`,
    };

    const id = ++nextId;
    ripples.value.push({
      group: spawnOptions.group,
      id,
      style: { ...base, opacity: String(opacity), transform: 'scale(0)' },
    });
    // Double rAF so the browser paints the initial state before the transition.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const ripple = ripples.value.find((r) => r.id === id);

        if (ripple)
          ripple.style = { ...base, opacity: '0', transform: 'scale(1)' };
      });
    });
    setTimeout(() => {
      ripples.value = ripples.value.filter((r) => r.id !== id);
    }, duration);
  };

  return { ripples, spawn };
}
