/**
 * Modal stack controller.
 *
 * `c-modal` opens its native `<dialog>` with `.show()` — NOT `showModal()` —
 * so modals never enter the browser top layer. The top layer cannot be
 * out-stacked by any z-index and inerts the whole document, which made toasts
 * paint under the backdrop and killed their interactivity. Instead, this
 * module implements modality in the library, as the single shared owner of:
 *
 * - the **modal stack**: the ordered set of open modals; only the topmost
 *   (the *active modal*) is interactive,
 * - **paint order**: each entry gets a z-index in the modal stacking band,
 *   below the toast band,
 * - **backdrop visibility**: exactly one backdrop — the active modal's — is
 *   visible at a time,
 * - **inertness** and **scroll lock**, delegated to the shared page lock
 *   (`pageLock.ts`, ADR-0050): everything outside the active modal is
 *   `inert` except `c-toasts`, and the document stops scrolling while the
 *   stack is non-empty,
 * - **Escape routing** to the active modal only, and
 * - **focus restore** to the element focused when each modal opened.
 */

import { lockPage, unlockPage } from './pageLock';

/**
 * Stacking bands (see CONTEXT.md "Stacking band"). Library-owned paint-order
 * ranges: page content < modal band < toast band < browser top layer (menus,
 * autocomplete panels). Internal constants by design; publishing
 * them would invite the interleaving that breaks "toasts always on top".
 */
export const MODAL_BAND_BASE = 1000;

export const TOAST_BAND = 2000;

export interface ModalStackEntry {
  /** The `<c-modal>` host element (its slotted content is light DOM). */
  host: HTMLElement;
  /**
   * Escape was routed to this modal (it is the active one and no inner
   * overlay consumed the press). The modal decides: close or nudge.
   */
  onEscape: () => void;
  /**
   * Backdrop visibility changed. `animate` is true only for the fade of the
   * first modal in / last modal out; switches *within* a stack are instant so
   * the dim level never dips or doubles.
   */
  setBackdropVisible: (visible: boolean, animate: boolean) => void;
  /** Paint order changed: the dialog's z-index (backdrop sits at `z - 1`). */
  setLayer: (zIndex: number) => void;
}

interface StackRecord {
  entry: ModalStackEntry;
  returnFocus: HTMLElement | null;
}

const stack: StackRecord[] = [];

/** The focused element, pierced through open shadow roots. */
export const deepActiveElement = (): HTMLElement | null => {
  let el: Element | null = document.activeElement;

  while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement;

  return el instanceof HTMLElement ? el : null;
};

/**
 * Bubble phase on purpose: the overlay components (menu, select,
 * autocomplete) handle Escape on their own elements first and call
 * `preventDefault()` when they consume it, so Escape peels overlays
 * innermost-first and only an unconsumed press reaches the active modal.
 */
const onDocumentKeydown = (event: KeyboardEvent): void => {
  if (event.key !== 'Escape' || event.defaultPrevented) return;

  const active = stack[stack.length - 1];

  if (!active) return;

  event.preventDefault();
  active.entry.onEscape();
};

let keydownAttached = false;

const applyKeydownListener = (): void => {
  if (stack.length > 0 && !keydownAttached) {
    keydownAttached = true;
    document.addEventListener('keydown', onDocumentKeydown);
  } else if (stack.length === 0 && keydownAttached) {
    keydownAttached = false;
    document.removeEventListener('keydown', onDocumentKeydown);
  }
};

/** Re-derive layers + backdrop visibility for the current stack. */
const applyLayers = (animateTop: boolean): void => {
  stack.forEach((record, index) => {
    record.entry.setLayer(MODAL_BAND_BASE + 2 * index + 1);

    const isTop = index === stack.length - 1;
    record.entry.setBackdropVisible(isTop, isTop && animateTop);
  });
};

/**
 * Register an opening modal. Captures the current (deep) focus for restore on
 * close — call BEFORE moving focus into the dialog. Ordering matters: capture
 * happens before `inert` is applied so we record the element the user was
 * actually on.
 */
export const openModal = (entry: ModalStackEntry): void => {
  if (stack.some((record) => record.entry === entry)) return;

  const returnFocus = deepActiveElement();

  stack.push({ entry, returnFocus });

  // Animate the backdrop fade-in only when this is the first modal; a modal
  // opening over another swaps backdrop ownership instantly.
  applyLayers(stack.length === 1);
  lockPage(entry.host);
  applyKeydownListener();
};

/**
 * Unregister a closing modal (idempotent) and restore focus. Runs at
 * close *start*, not after the exit animation: inert must be lifted before
 * the captured element can be focused again, and the page should respond
 * immediately, not 300ms later.
 */
export const closeModal = (entry: ModalStackEntry): void => {
  const index = stack.findIndex((record) => record.entry === entry);

  if (index === -1) return;

  const [record] = stack.splice(index, 1);

  const wasActive = index === stack.length;

  // Fade the closing modal's backdrop out only when it was the last one; a
  // lower modal's backdrop takes over instantly, keeping the dim level flat.
  entry.setBackdropVisible(false, stack.length === 0);

  applyLayers(false);
  unlockPage(entry.host);
  applyKeydownListener();

  // Restore focus only when the closed modal was the active one and focus
  // has not intentionally moved elsewhere (e.g. onto a toast) — never yank
  // focus from live UI.
  if (!wasActive) return;

  const current = document.activeElement;

  const focusIsLost =
    !current || current === document.body || entry.host.contains(current);

  if (!focusIsLost) return;

  const target = record.returnFocus;

  if (target?.isConnected && !target.inert) {
    target.focus({ preventScroll: true });
  }
};

/**
 * Move initial focus into an opening modal: the first `[autofocus]` in the
 * slotted content, else the first tabbable, else the dialog itself
 * (`tabindex="-1"`). Explicit rather than trusting the native dialog focusing
 * steps, which are unreliable across the slot/shadow boundary.
 *
 * Custom-element hosts (e.g. `c-button`) often aren't themselves focusable —
 * their real control lives in their shadow root — so each candidate is
 * attempted and verified, falling back to the candidate's shadow-root control.
 */
const CANDIDATE_SELECTOR = [
  '[autofocus]',
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex="-1"])',
  // csc-ui interactive hosts whose focusable lives in their shadow root.
  'c-button:not([disabled])',
  'c-icon-button:not([disabled])',
  'c-link',
  'c-input:not([disabled])',
  'c-text-field:not([disabled])',
  'c-select:not([disabled])',
  'c-autocomplete:not([disabled])',
  'c-checkbox:not([disabled])',
  'c-radio:not([disabled])',
  'c-switch:not([disabled])',
].join(', ');

const tryFocus = (el: HTMLElement): boolean => {
  el.focus({ preventScroll: true });

  const active = deepActiveElement();

  if (active && (active === el || el.contains(active))) return true;

  if (el.shadowRoot && active && el.shadowRoot.contains(active)) return true;

  // Host didn't take focus (no tabindex, no delegatesFocus): reach for the
  // first native focusable inside its shadow root.
  const inner = el.shadowRoot?.querySelector<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]',
  );

  if (inner) {
    inner.focus({ preventScroll: true });

    const now = deepActiveElement();

    if (now && el.shadowRoot?.contains(now)) return true;
  }

  return false;
};

export const focusInitialElement = (
  host: HTMLElement,
  dialog: HTMLElement,
): void => {
  const auto = host.querySelector<HTMLElement>('[autofocus]');

  const candidates = auto
    ? [auto]
    : Array.from(host.querySelectorAll<HTMLElement>(CANDIDATE_SELECTOR));

  for (const candidate of candidates) {
    if (tryFocus(candidate)) return;
  }

  dialog.focus({ preventScroll: true });
};
