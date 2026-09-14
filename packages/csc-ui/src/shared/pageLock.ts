/**
 * Page lock (ADR-0014, ADR-0050): library-owned modality for surfaces that
 * must own the page without entering the browser's modal top layer — which
 * would inert the toasts. While any holder is registered, everything outside
 * the *active* holder's host is `inert` (a `c-toasts` anywhere stays
 * interactive) and document scroll is locked.
 *
 * Holders form a stack; the most recently locked host is the active one. The
 * modal stack pushes each opening `c-modal` here, and a **fullscreen panel**
 * pushes its field's host — so a select opened inside a modal on a phone
 * inerts the modal's other content along with the page, and closing it hands
 * the page back to the modal. Consumer-set `inert` is never touched.
 */

/** Tag exempted from inerting — toasts stay interactive above any lock. */
const EXEMPT_TAG = 'c-toasts';

/** Non-rendered elements there is no point inerting. */
const SKIP_TAGS = new Set(['LINK', 'META', 'SCRIPT', 'STYLE', 'TEMPLATE']);

const holders: HTMLElement[] = [];

/** Elements THIS module set `inert` on (consumer-set inert is never touched). */
const inerted = new Set<HTMLElement>();

let scrollLocked = false;

let previousOverflow = '';

/**
 * Collect `el` (or, when it contains an exempt toaster, its non-exempt
 * descendants) into the inert target set. Descending instead of inerting the
 * whole subtree is what keeps a nested `c-toasts` interactive — an inert
 * ancestor would take the toaster down with it regardless of its own state.
 */
const collectInertTargets = (el: Element, targets: Set<HTMLElement>): void => {
  if (SKIP_TAGS.has(el.tagName)) return;

  if (el.localName === EXEMPT_TAG) return;

  if (!(el instanceof HTMLElement)) return;

  if (el.querySelector(EXEMPT_TAG)) {
    for (const child of Array.from(el.children)) {
      collectInertTargets(child, targets);
    }

    return;
  }

  targets.add(el);
};

/** Step to the parent, jumping out of a shadow root to its host if needed. */
const parentOf = (el: Element): Element | null => {
  if (el.parentElement) return el.parentElement;

  const root = el.getRootNode();

  return root instanceof ShadowRoot ? root.host : null;
};

/**
 * The classic ancestor-chain modality walk: from the active host up to
 * `document.body`, everything that is a sibling of the chain gets inert —
 * page content and lower holders alike — leaving only the active host (and
 * exempt toasters) interactive.
 */
const computeInertTargets = (activeHost: HTMLElement): Set<HTMLElement> => {
  const targets = new Set<HTMLElement>();

  let node: Element = activeHost;

  while (node && node !== document.body) {
    const parent = parentOf(node);

    if (!parent) break;

    for (const sibling of Array.from(parent.children)) {
      if (sibling !== node) collectInertTargets(sibling, targets);
    }

    node = parent;
  }

  return targets;
};

const applyInert = (): void => {
  const active = holders[holders.length - 1];

  const next = active ? computeInertTargets(active) : new Set<HTMLElement>();

  for (const el of inerted) {
    if (!next.has(el)) {
      el.inert = false;
      inerted.delete(el);
    }
  }

  for (const el of next) {
    // An element that is already inert was set by the consumer (or an outer
    // mechanism); leave it untracked so we never un-inert what isn't ours.
    if (!inerted.has(el) && !el.inert) {
      el.inert = true;
      inerted.add(el);
    }
  }
};

const applyScrollLock = (): void => {
  const root = document.documentElement;

  if (holders.length > 0 && !scrollLocked) {
    scrollLocked = true;
    previousOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
  } else if (holders.length === 0 && scrollLocked) {
    scrollLocked = false;
    root.style.overflow = previousOverflow;
  }
};

const apply = (): void => {
  applyInert();
  applyScrollLock();
};

/** True while `host` holds the lock (active or below another holder). */
export const isPageLockedBy = (host: HTMLElement): boolean =>
  holders.includes(host);

/**
 * Register `host` as the active holder: everything outside it goes inert and
 * the document stops scrolling. Idempotent for a host already holding.
 */
export const lockPage = (host: HTMLElement): void => {
  if (holders.includes(host)) return;

  holders.push(host);
  apply();
};

/**
 * Release `host` (idempotent). The next holder down, if any, becomes active
 * and the inert set is re-derived for it; with no holder left the page is
 * fully interactive and scrolls again.
 */
export const unlockPage = (host: HTMLElement): void => {
  const index = holders.indexOf(host);

  if (index === -1) return;

  holders.splice(index, 1);
  apply();
};
