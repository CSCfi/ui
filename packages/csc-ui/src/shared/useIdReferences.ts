import { onBeforeUnmount, onMounted, onUpdated, useHost } from 'vue';

/**
 * The ARIA attributes that hold element ids, and the property that holds the
 * elements themselves (ARIA element reflection).
 */
export const ID_REFERENCES = {
  'aria-activedescendant': 'ariaActiveDescendantElement',
  'aria-controls': 'ariaControlsElements',
  'aria-describedby': 'ariaDescribedByElements',
  'aria-details': 'ariaDetailsElements',
  'aria-errormessage': 'ariaErrorMessageElements',
  'aria-flowto': 'ariaFlowToElements',
  'aria-labelledby': 'ariaLabelledByElements',
  'aria-owns': 'ariaOwnsElements',
} as const;

type IdReference = keyof typeof ID_REFERENCES;

type Reflected = (typeof ID_REFERENCES)[IdReference];

// The DOM types each property apart; one shape covers them all here.
type Reflecting = Record<Reflected, Element | null | readonly Element[]>;

const NAMES = Object.keys(ID_REFERENCES) as IdReference[];

/** The only one that names a single element: the component's own wins. */
const SINGLE: IdReference = 'aria-activedescendant';

/** The elements an id list names in one tree; an id naming nothing drops out. */
const resolve = (root: Node, ids: null | string): Element[] => {
  if (!ids || !(root instanceof Document || root instanceof ShadowRoot)) {
    return [];
  }

  return ids.split(/\s+/).flatMap((id) => {
    const element = id ? root.getElementById(id) : null;

    return element ? [element] : [];
  });
};

const same = (
  now: Element | null | readonly Element[] | undefined,
  next: Element | null | readonly Element[],
): boolean =>
  Array.isArray(now) && Array.isArray(next)
    ? now.length === next.length && now.every((el, i) => el === next[i])
    : now === next;

/**
 * Hand the host's ARIA id references (`aria-labelledby`, `aria-describedby`,
 * `aria-controls`, …) to the element that carries the component's role.
 *
 * An id resolves only in its own tree, so the host's ids, written in the page,
 * name nothing inside the shadow root (defineElement keeps them on the host).
 * An element in a shadow root may still reference elements of the trees
 * around it through ARIA element reflection, so the ids are resolved here, in
 * the host's tree, and the target gets the elements. The component's own ids
 * on the target (a group's label, a combobox's listbox) resolve in the
 * target's tree and come first.
 *
 * Setting a reflected property blanks the content attribute to `''`, and an
 * attribute write — Vue patching the component's own ids — clears the
 * elements again, so the references are re-applied after every render, with
 * the component's raw ids remembered per target. They are also re-applied
 * one frame after mount, for a referenced element parsed after the host, on
 * a host attribute change (defineElement re-renders), and on focus, for one
 * rendered later. When the host's attribute goes, the target gets its own
 * ids back.
 *
 * @param target The element that carries the component's role, or a selector
 *   for it in the shadow root.
 */
export const useIdReferences = (
  target: (() => Element | null | undefined) | string,
): void => {
  const host = useHost();

  if (!host) return;

  const find =
    typeof target === 'string'
      ? () => host.shadowRoot?.querySelector(target)
      : target;

  // Per target: the component's own value of each attribute that now holds
  // reflected elements (the content attribute reads '').
  const own = new WeakMap<Element, Map<IdReference, null | string>>();

  let current: Element | null = null;

  const giveBack = (el: Element, name: IdReference, ids: null | string) => {
    if (ids === null) el.removeAttribute(name);
    else el.setAttribute(name, ids);
  };

  const release = (el: Element) => {
    for (const [name, ids] of own.get(el) ?? []) {
      // A non-blank value is the component's own, written since.
      if (el.getAttribute(name) === '') giveBack(el, name, ids);
    }

    own.delete(el);
  };

  const apply = () => {
    const el = find() ?? null;

    if (current && current !== el) release(current);

    current = el;

    if (!el) return;

    const record = own.get(el) ?? new Map<IdReference, null | string>();

    for (const name of NAMES) {
      const external = host.getAttribute(name);

      const reflected = record.has(name);

      if (external === null && !reflected) continue;

      const value = el.getAttribute(name);

      // '' is the blank reflecting left; anything else Vue wrote since.
      const ids = reflected && value === '' ? record.get(name)! : value;

      if (external === null) {
        giveBack(el, name, ids);
        record.delete(name);
        continue;
      }

      record.set(name, ids);

      const elements = [
        ...resolve(el.getRootNode(), ids),
        ...resolve(host.getRootNode(), external),
      ];

      const next = name === SINGLE ? (elements[0] ?? null) : elements;

      const property = ID_REFERENCES[name];

      if (
        value !== '' ||
        !same((el as unknown as Reflecting)[property], next)
      ) {
        (el as unknown as Reflecting)[property] = next;
      }
    }

    if (record.size) own.set(el, record);
    else own.delete(el);
  };

  let frame = 0;

  onMounted(() => {
    apply();
    frame = requestAnimationFrame(apply);
    host.addEventListener('focusin', apply);
  });

  onUpdated(apply);

  onBeforeUnmount(() => {
    cancelAnimationFrame(frame);
    host.removeEventListener('focusin', apply);
  });
};
