import { useHost } from 'vue';

/**
 * Typed host-event dispatch — the single dispatch path for component events
 * (ADR-0012).
 *
 * Each component declares an **event map** interface (event name → `detail`
 * type, `void` for detail-less events) with JSDoc per member, and dispatches
 * only through this helper:
 *
 *   /** Events dispatched by `<c-tag>`. *\/
 *   interface CTagEvents {
 *     /** Fired when the close button is activated. *\/
 *     close: void;
 *   }
 *
 *   const emit = useHostEmit<CTagEvents>();
 *   emit('close');
 *
 * The event map is simultaneously the runtime contract (names and detail
 * types are compile-checked here) and the source the docs analyzer reads for
 * the manifest's events section — an event missing from the map cannot be
 * dispatched, so the docs cannot drift.
 *
 * Events are dispatched as raw `CustomEvent`s, NOT via Vue's `emit()`: the
 * `defineCustomElement` emit wraps every payload into `detail: [...args]`
 * (always an array), which breaks the historical `event.detail` contract
 * consumers rely on.
 *
 * Events do not bubble by default; pass `{ bubbles: true, composed: true }`
 * per call where the Stencil-era event bubbled.
 *
 * v-model components: `emitModelValue` remains the dispatch path for the
 * `changeValue` / `update:value` / `input` triple (it also mirrors `host.value`
 * for native v-model). Declare those three events in the component's event map
 * anyway — the docs analyzer enforces this for every `emitModelValue` caller.
 */
export const useHostEmit = <EventMap extends object>() => {
  const host = useHost();

  return <Name extends Extract<keyof EventMap, string>>(
    name: Name,
    ...rest: EventMap[Name] extends void
      ? [detail?: undefined, options?: EventInit]
      : [detail: EventMap[Name], options?: EventInit]
  ): void => {
    const [detail, options] = rest;

    host?.dispatchEvent(new CustomEvent(name, { detail, ...options }));
  };
};
