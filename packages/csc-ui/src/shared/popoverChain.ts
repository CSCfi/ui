/**
 * Popover chain controller (CONTEXT.md "Popover chain", ADR-0038).
 *
 * The ordered set of currently open `c-popover`s, each logically nested in
 * the one before it. This module is the single owner of popover dismissal:
 *
 * - **Escape** peels the innermost popover only, one per press. The listener
 *   is capture-phase and calls `preventDefault()`, so an enclosing
 *   `c-modal`'s bubble-phase controller sees the claimed key and does not
 *   close itself (ADR-0014). Known pre-existing limitation: a `c-menu` open
 *   inside a popover listens on its own host (bubble), i.e. *after* this
 *   capture listener — that Escape closes both, exactly as it did when each
 *   popover owned its own capture listener.
 * - **Pointerdown** closes every popover that does not *logically* contain
 *   the event: from the innermost down, everything above the deepest member
 *   whose own inside (host subtree, panel, designated trigger) contains the
 *   composed path is closed. Containment is logical, not DOM ancestry — a
 *   popover whose host lives elsewhere still shields its ancestors, because
 *   ancestry is recorded in the chain itself, not re-derived from the DOM.
 * - **Opening** a popover whose trigger sits inside an open member joins the
 *   chain below it; one whose trigger is elsewhere replaces the chain.
 *   Siblings therefore never coexist.
 * - **Closing** any member (Escape, light dismiss, `open` prop, unmount)
 *   closes its descendants — no orphaned floating panels.
 *
 * Why a shared module: each popover's Escape listener is capture-phase on
 * `document`, and `preventDefault()` does not stop other listeners — two
 * independent popovers cannot see each other's claim, so one press closed
 * them all. Coordination needs a single owner, mirroring `modalStack.ts`.
 */

export interface PopoverChainEntry {
  /** Close this popover with no focus return (light dismiss / chain cleanup). */
  close(): void;
  /** True when `node` is inside this popover's own logical inside. */
  containsNode(node: Node): boolean;
  /** True when a composed event path passes through this popover's own inside. */
  containsPath(path: EventTarget[]): boolean;
  /**
   * The node that chains this popover under an open ancestor: its designated
   * trigger, else its slotted trigger, else its host.
   */
  getAnchorNode(): Node | null;
  /** Escape routed here — this popover is the innermost. Decides focus return. */
  onEscape(): void;
}

const chain: PopoverChainEntry[] = [];

/**
 * Shadow-piercing containment: like `Node.contains` but hopping from a shadow
 * root to its host, so content inside a descendant component's shadow root
 * (and slotted light DOM) counts as inside.
 */
export const composedContains = (
  ancestor: Node,
  node: Node | null,
): boolean => {
  let current: Node | null = node;

  while (current) {
    if (ancestor === current || ancestor.contains(current)) return true;

    const root = current.getRootNode();

    current = root instanceof ShadowRoot ? root.host : null;
  }

  return false;
};

/** Close every member above `index`, innermost first (splice before close: a
 * closing member's async `toggle` re-enters via `leaveChain`, which must
 * already find it gone). */
const closeAbove = (index: number): void => {
  const orphans = chain.splice(index + 1);

  applyListeners();

  for (let i = orphans.length - 1; i >= 0; i--) orphans[i].close();
};

const onDocPointerDown = (event: Event): void => {
  const path = event.composedPath();

  let keep = -1;

  for (let i = chain.length - 1; i >= 0; i--) {
    if (chain[i].containsPath(path)) {
      keep = i;
      break;
    }
  }

  closeAbove(keep);
};

const onDocKeydown = (event: KeyboardEvent): void => {
  if (event.key !== 'Escape' || event.defaultPrevented) return;

  const innermost = chain[chain.length - 1];

  if (!innermost) return;

  event.preventDefault();
  innermost.onEscape();
};

let listenersAttached = false;

const applyListeners = (): void => {
  if (chain.length > 0 && !listenersAttached) {
    listenersAttached = true;
    document.addEventListener('pointerdown', onDocPointerDown, true);
    document.addEventListener('keydown', onDocKeydown, true);
  } else if (chain.length === 0 && listenersAttached) {
    listenersAttached = false;
    document.removeEventListener('pointerdown', onDocPointerDown, true);
    document.removeEventListener('keydown', onDocKeydown, true);
  }
};

/**
 * Register an opening popover. Resolves its chain parent from where its
 * anchor node sits; members that would become siblings are closed first.
 * Idempotent.
 */
export const enterChain = (entry: PopoverChainEntry): void => {
  if (chain.includes(entry)) return;

  const node = entry.getAnchorNode();

  let parent = -1;

  if (node) {
    for (let i = chain.length - 1; i >= 0; i--) {
      if (chain[i].containsNode(node)) {
        parent = i;
        break;
      }
    }
  }

  closeAbove(parent);
  chain.push(entry);
  applyListeners();
};

/**
 * Unregister a closing popover (idempotent) and close its descendants —
 * whatever closed it, nothing may stay floating above it.
 */
export const leaveChain = (entry: PopoverChainEntry): void => {
  const index = chain.indexOf(entry);

  if (index === -1) return;

  const removed = chain.splice(index);

  applyListeners();

  for (let i = removed.length - 1; i >= 1; i--) removed[i].close();
};
