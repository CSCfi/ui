// The light-or-dark theme mode, resolved the same way tokens.css resolves it.

/** The light-or-dark state that selects which palette the semantic tokens resolve to. */
export type ThemeMode = 'dark' | 'light';

/**
 * The selector tokens.css keys its pinned scopes on — only these two values pin
 * a mode. Used by the FALLBACK path only: an unstyled document, a detached
 * node, or server rendering, where there is no computed style to read.
 */
const MODE_SCOPE = "[data-theme='light'],[data-theme='dark']";

/**
 * Resolve the theme mode in effect for an element, mirroring the cascade in
 * `tokens.css`: the nearest enclosing **mode scope** wins (an ancestor-or-self
 * carrying `data-theme="light"` or `"dark"`, ADR-0053), an **inverting scope**
 * (`data-theme-invert`, ADR-0054) flips whatever it sits in; otherwise the OS
 * preference; light where neither is available (server rendering, no
 * `matchMedia`). Any other `data-theme` value is inert, exactly as in CSS.
 *
 * The answer comes from the cascade itself — `--c-mode`, which every mode block
 * declares — rather than from walking the DOM. That is the only way to resolve
 * an inverting scope without re-implementing the style query, it cannot drift
 * from the CSS, and unlike `closest()` it reads correctly for an element INSIDE
 * a shadow root, since custom properties inherit across the boundary. The DOM
 * walk remains as the fallback for when `tokens.css` has not been loaded: a
 * detached node, a server-rendered pass, or a consumer who ships only the
 * Tailwind theme export.
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

  if (el && typeof getComputedStyle === 'function') {
    const declared = getComputedStyle(el).getPropertyValue('--c-mode').trim();

    if (declared === 'dark' || declared === 'light') return declared;
  }

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
 * `data-theme` or `data-theme-invert` attribute mutating anywhere in the
 * document (the element's own **mode scope** or any ancestor's, which is why a
 * `documentElement`-only observer is not enough), and the OS preference
 * flipping while no scope pins a mode.
 *
 * Re-parenting `target` is not observed; re-subscribe if you move it. That
 * matters more than it used to: an **inverting scope** resolves against where
 * it sits, so moving one between a light and a dark region changes its mode,
 * where moving a pinned scope never did.
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
    attributeFilter: ['data-theme', 'data-theme-invert'],
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
