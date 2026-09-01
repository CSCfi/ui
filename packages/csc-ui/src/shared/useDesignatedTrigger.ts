/**
 * Designated trigger (CONTEXT.md "Trigger", ADR-0038): the `trigger` prop
 * route of supplying an overlay component's trigger — an element elsewhere in
 * the document, designated by ID or by reference, instead of projected into
 * the `trigger` slot. The two routes are the same concept: the component
 * wires its usual opening interaction and ARIA onto the designated element,
 * exactly as it does for a slotted one.
 *
 * Positioning: CSS anchor names are tree-scoped, so the shadow-DOM panel
 * cannot reference an `anchor-name` on an outer-tree element. Instead the
 * component keeps a *proxy anchor* — an inert, fixed-position box in its own
 * shadow root carrying the anchor name — and this composable pins it over
 * the designated trigger's rect while the panel is open (a rAF loop, the
 * same tracking strategy the OddBird polyfill uses). `position-area`
 * placement and the `position-try-fallbacks` flip/shift keep working
 * unchanged; only the measurement is JS.
 */

import { onBeforeUnmount, ref, type Ref, watch } from 'vue';

export interface DesignatedTriggerHandle {
  /** The resolved designated trigger; null when the prop is unset/unresolved. */
  element: Readonly<Ref<HTMLElement | null>>;
  /** Re-resolve the prop (an ID may match only after later DOM insertion). */
  resolve(): HTMLElement | null;
  /** Pin the proxy over the trigger every frame until `stopTracking`. */
  startTracking(): void;
  stopTracking(): void;
}

export interface UseDesignatedTriggerOptions {
  /** Tag name for console warnings (e.g. `c-popover`). */
  componentName: string;
  /** Interaction listeners kept installed on the designated element. */
  listeners: Record<string, EventListener>;
  /** Resolved element changed — mirror/clean ARIA here. */
  onElementChange?: (el: HTMLElement | null, prev: HTMLElement | null) => void;
  /** The in-shadow proxy anchor to pin over the designated trigger. */
  proxy: Ref<HTMLElement | null>;
  /** The raw `trigger` prop: a document ID or an element reference. */
  source: () => HTMLElement | string | undefined;
}

export const useDesignatedTrigger = (
  options: UseDesignatedTriggerOptions,
): DesignatedTriggerHandle => {
  const element = ref<HTMLElement | null>(null);

  let warnedForId: null | string = null;

  const setElement = (el: HTMLElement | null): void => {
    const prev = element.value;

    if (el === prev) return;

    for (const [type, fn] of Object.entries(options.listeners)) {
      prev?.removeEventListener(type, fn);
      el?.addEventListener(type, fn);
    }

    element.value = el;
    options.onElementChange?.(el, prev);
  };

  const resolve = (): HTMLElement | null => {
    const raw = options.source();

    let el: HTMLElement | null = null;

    if (raw instanceof HTMLElement) {
      el = raw;
    } else if (
      raw &&
      typeof raw === 'string' &&
      typeof document !== 'undefined'
    ) {
      el = document.getElementById(raw);

      if (!el && warnedForId !== raw) {
        warnedForId = raw;
        console.warn(
          `<${options.componentName}> trigger="${raw}" matches no element in the document.`,
        );
      }
    }

    setElement(el);

    return el;
  };

  watch(options.source, resolve);

  // ---- proxy-anchor tracking ----------------------------------------------

  let rafId = 0;

  let lastRect = '';

  const track = (): void => {
    const el = element.value;

    const proxy = options.proxy.value;

    if (el && proxy) {
      const rect = el.getBoundingClientRect();

      const key = `${rect.left},${rect.top},${rect.width},${rect.height}`;

      if (key !== lastRect) {
        lastRect = key;
        proxy.style.left = `${rect.left}px`;
        proxy.style.top = `${rect.top}px`;
        proxy.style.width = `${rect.width}px`;
        proxy.style.height = `${rect.height}px`;
      }
    }

    rafId = requestAnimationFrame(track);
  };

  const startTracking = (): void => {
    if (rafId || !element.value) return;

    lastRect = '';
    track();
  };

  const stopTracking = (): void => {
    if (!rafId) return;

    cancelAnimationFrame(rafId);
    rafId = 0;
  };

  onBeforeUnmount(() => {
    stopTracking();
    setElement(null);
  });

  return { element, resolve, startTracking, stopTracking };
};
