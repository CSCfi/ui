/**
 * Designated trigger (CONTEXT.md "Trigger", ADR-0038): the `trigger` prop
 * route of supplying an overlay component's trigger — an element elsewhere in
 * the document, designated by ID or by reference, instead of projected into
 * the `trigger` slot. The two routes are the same concept: the component
 * wires its usual opening interaction and ARIA onto the designated element,
 * exactly as it does for a slotted one.
 *
 * Positioning: CSS anchor names are tree-scoped, so the shadow-DOM panel
 * cannot reference an `anchor-name` on an outer-tree element. Floating UI
 * places the panel against the designated element in every browser
 * (`useFallbackPosition` with `scripted`, ADR-0056 amended 2026-11-20); the
 * fixed-position proxy anchor it replaced was misplaced by Safari 26 once
 * the page scrolled.
 */

import { onBeforeUnmount, ref, type Ref, watch } from 'vue';

export interface DesignatedTriggerHandle {
  /** The resolved designated trigger; null when the prop is unset/unresolved. */
  element: Readonly<Ref<HTMLElement | null>>;

  /** Re-resolve the prop (an ID may match only after later DOM insertion). */
  resolve(): HTMLElement | null;
}

export interface UseDesignatedTriggerOptions {
  /** Tag name for console warnings (e.g. `c-popover`). */
  componentName: string;

  /** Interaction listeners kept installed on the designated element. */
  listeners: Record<string, EventListener>;

  /** Resolved element changed — mirror/clean ARIA here. */
  onElementChange?: (el: HTMLElement | null, prev: HTMLElement | null) => void;

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

  onBeforeUnmount(() => setElement(null));

  return { element, resolve };
};
