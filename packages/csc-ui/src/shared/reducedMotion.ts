/**
 * The OS-level reduced-motion preference (CONTEXT.md "Reduced motion",
 * ADR-0057). CSS motion honours it from the shared utility sheet; this is the
 * read for motion a script drives — the ripple, smooth strip scrolling, the
 * tabs indicator, the modal keyframes. Read at the moment of use, not once at
 * mount, so a preference toggled while the page is open is picked up.
 *
 * Returns false where `matchMedia` is missing (SSR, a bare test runtime).
 */
export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
