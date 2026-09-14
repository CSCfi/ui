/**
 * Narrow viewport (CONTEXT.md "Narrow viewport", ADR-0050): the one shared
 * predicate under which a value-selection field opens a **fullscreen panel**
 * instead of an anchored one. Measured on the window, never on a component's
 * own box — the panel fills the viewport, so only the viewport is relevant.
 * The 760px threshold is c-dropdown's Stencil-era media query, kept so
 * existing `c-select` consumers see no behaviour change.
 */
import { getCurrentScope, onScopeDispose, readonly, type Ref, ref } from 'vue';

/** The media query every fullscreen-panel switch evaluates. */
export const NARROW_VIEWPORT_QUERY = '(max-width: 760px)';

const mediaQueryList = (): MediaQueryList | null =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(NARROW_VIEWPORT_QUERY)
    : null;

/** One-off read; `false` where there is no window (SSR). */
export const isNarrowViewport = (): boolean =>
  mediaQueryList()?.matches ?? false;

/**
 * A live `Ref` that follows the media query. Registers its listener for the
 * lifetime of the current effect scope (a component's setup, or an
 * `effectScope()` in a spec); with no scope the listener stays for the page.
 */
export const useNarrowViewport = (): Readonly<Ref<boolean>> => {
  const narrow = ref(false);

  const mql = mediaQueryList();

  if (!mql) return readonly(narrow);

  narrow.value = mql.matches;

  const onChange = (event: MediaQueryListEvent): void => {
    narrow.value = event.matches;
  };

  mql.addEventListener('change', onChange);

  if (getCurrentScope()) {
    onScopeDispose(() => mql.removeEventListener('change', onChange));
  }

  return readonly(narrow);
};
