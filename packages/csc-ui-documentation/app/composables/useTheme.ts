/**
 * Light/dark theme state for the docs shell.
 *
 * Dark mode is a `csc-ui-next` feature (ADR-0010): the semantic-token layer in
 * `@cscfi/csc-ui-next/css/tokens.css` re-points its roles under
 * `:root[data-theme='dark']`, with a `prefers-color-scheme` fallback when no
 * attribute is set. So switching themes is just writing `data-theme` onto the
 * document root; this composable owns that attribute plus localStorage
 * persistence. It is a no-op in `stencil` mode (the Stencil theme is light-only
 * and ignores the attribute).
 */
export type ThemeMode = 'dark' | 'light';

const STORAGE_KEY = 'csc-docs-theme';

export function useTheme() {
  // useState gives a single shared instance across the app (the toolbar toggle
  // and any page reading the mode see the same ref).
  const mode = useState<ThemeMode>('csc-docs-theme', () => 'light');

  const apply = (next: ThemeMode) => {
    mode.value = next;

    if (import.meta.client) {
      document.documentElement.dataset.theme = next;
      localStorage.setItem(STORAGE_KEY, next);
    }
  };

  const toggle = () => apply(mode.value === 'dark' ? 'light' : 'dark');

  // Resolve the initial mode once on the client: a previously-stored choice
  // wins, otherwise fall back to the OS preference. We then write the attribute
  // explicitly so the choice is stable across navigations.
  const init = () => {
    if (!import.meta.client) return;

    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;

    const initial: ThemeMode =
      stored ??
      (window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light');

    apply(initial);
  };

  return { apply, init, mode, toggle };
}
