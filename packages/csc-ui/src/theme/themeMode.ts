// The light-or-dark theme mode, resolved the same way tokens.css resolves it.

/** The light-or-dark state that selects which palette the semantic tokens resolve to. */
export type ThemeMode = 'dark' | 'light';

/** The selector tokens.css keys its mode scopes on — only these two values pin a mode. */
const MODE_SCOPE = "[data-theme='light'],[data-theme='dark']";

/**
 * Resolve the theme mode in effect for an element, mirroring the cascade in
 * `tokens.css`: the nearest enclosing **mode scope** wins (an ancestor-or-self
 * carrying `data-theme="light"` or `"dark"`, ADR-0053); otherwise the OS
 * preference; light where neither is available (server rendering, no
 * `matchMedia`). Any other `data-theme` value is inert, exactly as it is in CSS.
 *
 * Pass the element whose mode you need — a chart inside a dark panel on an
 * otherwise light page resolves `dark` only if you ask about the chart.
 * `observeThemeMode()` keeps that answer current.
 *
 * @param root the element to resolve for — defaults to `<html>`
 */
export function themeMode(root?: Element | null): ThemeMode {
  const el =
    root ?? (typeof document !== 'undefined' ? document.documentElement : null);

  const scope = el?.closest(MODE_SCOPE);

  if (scope)
    return scope.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';

  if (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark';
  }

  return 'light';
}

/**
 * Watch the theme mode in effect for an element and report every change.
 *
 * Calls `onChange` once synchronously with the current mode, then again
 * whenever it actually changes — so wiring a chart up is the one call, with no
 * separate initial render. Covers both paths that can change the answer: a
 * `data-theme` attribute mutating anywhere in the document (the element's own
 * **mode scope** or any ancestor's, which is why a `documentElement`-only
 * observer is not enough), and the OS preference flipping while no scope pins
 * a mode. Re-parenting `target` is not observed; re-subscribe if you move it.
 *
 * ```ts
 * const stop = observeThemeMode(chartEl, (mode) => {
 *   chart.setOption({ color: chartSlotsHex[mode] });
 * });
 * ```
 *
 * @returns a disposer that detaches both listeners
 */
export function observeThemeMode(
  target: Element,
  onChange: (mode: ThemeMode) => void,
): () => void {
  let current = themeMode(target);

  onChange(current);

  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return () => {};
  }

  const settle = () => {
    const next = themeMode(target);

    if (next === current) return;

    current = next;
    onChange(next);
  };

  const observer = new MutationObserver(settle);

  observer.observe(document, {
    attributeFilter: ['data-theme'],
    attributes: true,
    subtree: true,
  });

  const query =
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : null;

  query?.addEventListener('change', settle);

  return () => {
    observer.disconnect();
    query?.removeEventListener('change', settle);
  };
}
