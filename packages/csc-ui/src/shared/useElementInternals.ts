import { useHost } from 'vue';

/**
 * The host's `ElementInternals`, keyed by element: `attachInternals()` may be
 * called only once per element, and an element taken off the page and put
 * back (KeepAlive, a moved list item) mounts a new component instance, whose
 * own call would throw. `null` is kept too, so a platform without internals is
 * asked once.
 */
const internalsOf = new WeakMap<HTMLElement, ElementInternals | null>();

/**
 * The single path to the host's internals — custom states (`useHostStates`,
 * ADR-0035) and form association (`useFormAssociation`, ADR-0084) both go
 * through it. `null` where internals are unavailable (SSR, an ancient
 * browser): callers degrade to a silent no-op.
 */
export const useElementInternals = (): ElementInternals | null => {
  const host = useHost();

  if (!host) return null;

  if (!internalsOf.has(host)) {
    let internals: ElementInternals | null;

    try {
      internals = host.attachInternals();
    } catch {
      internals = null;
    }

    internalsOf.set(host, internals);
  }

  return internalsOf.get(host) ?? null;
};
