<template>
  <!-- Anchor wrapper: a shadow-DOM box around the slotted trigger. CSS anchor
       names are tree-scoped, so the anchor must live in the same shadow root
       as the panel — we cannot anchor to the light-DOM trigger directly.
The wrapper carries `anchor-name`; the panel references it. -->
  <span
    ref="anchorRef"
    :class="ui.trigger()"
    part="trigger"
    style="anchor-name: --c-menu-anchor"
  >
    <slot name="trigger" />
  </span>

  <!-- Proxy anchor for a designated trigger (ADR-0038): anchor names are
       tree-scoped, so the panel cannot anchor to an outer-tree element
       directly. This inert box is pinned over the designated trigger's rect
       while the panel is open; the panel's position-anchor switches to it. -->
  <span
    ref="proxyRef"
    :class="ui.proxy()"
    aria-hidden="true"
    style="anchor-name: --c-menu-designated"
  />

  <!-- Manual popover in the top layer: never clipped by overflow, no teleport,
       no z-index war. Light-dismiss + submenu coordination are handled by this
       controller (manual, not auto, so cross-shadow submenu popovers don't
       auto-close the root). Positioned with CSS anchor positioning. -->
  <div
    ref="panelRef"
    :class="ui.panel()"
    :style="panelStyle"
    part="panel"
    popover="manual"
    @toggle="onToggle"
  >
    <div
      ref="listRef"
      :class="ui.list()"
      aria-orientation="vertical"
      part="list"
      role="menu"
      tabindex="-1"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @slot default - Menu title / activator element (simple variant)
 * @slot trigger - The element that opens the menu (e.g. a c-button)
 *
 * @csspart trigger - The inline wrapper around the slotted trigger, serving as the panel's anchor
 * @csspart panel - The floating popover positioned against the trigger
 * @csspart list - The menu list surface inside the panel
 *
 * @seeded from csc-ui — verify
 *
 * @subcomponents c-menu-item, c-menu-label
 */
import { tv } from 'tailwind-variants';
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  useHost,
  useTemplateRef,
  watch,
} from 'vue';

import type { CPlacement } from '../../types';

import { ensureAnchorPositioning } from '../../shared/anchorPolyfill';
import { coerceBoolean } from '../../shared/coerceBoolean';
import { placementAxis, POSITION_AREA } from '../../shared/positionArea';
import { useDesignatedTrigger } from '../../shared/useDesignatedTrigger';
import { useHostEmit } from '../../shared/useHostEmit';

/** Events dispatched by `<c-menu>`. */
interface CMenuEvents {
  /**
   * Fired whenever the menu opens or closes, carrying the new open state.
   * Named `change:open`, not `update:open`: Vue's runtime silently drops
   * `onUpdate:*` listeners on custom elements (`isModelListener`), so a
   * template `@update:open` would never be attached.
   */
  'change:open': boolean;
  /**
   * Fired when a leaf menu item is selected, carrying the item's `value`;
   * bubbles out of the menu so a single listener can handle the whole tree.
   */
  select: { value: unknown };
}

/**
 * Declarative, slot-based command menu (the WAI-ARIA menu-button pattern).
 * A trigger goes in the `trigger` slot; `c-menu-item` / `c-menu-label` /
 * `c-divider` go in the default slot. Selecting a leaf item emits a bubbling
 * `select` CustomEvent `{ value }` and closes the menu.
 *
 * `c-menu` is the SOLE controller for the whole menu tree. `provide/inject`
 * does not cross `defineCustomElement` boundaries, so coordination is via the
 * DOM: every interactive part (the slotted trigger, the light-DOM items, and
 * each submenu popover in a descendant item's shadow root) sits inside this
 * host's flattened subtree, so delegated `click`/`keydown`/`pointerover`
 * listeners on the host see them all, and `composedPath().includes(host)`
 * cleanly separates inside from outside for light-dismiss. Submenus are opened
 * and closed by calling the `openSubmenu`/`closeSubmenu` methods that
 * `c-menu-item` exposes.
 *
 * Styling is in this `tailwind-variants` config; `::part()` is the
 * customization surface. The `<style>` block is the escape
 * hatch for the un-Tailwind-able anchor-positioning fallbacks and the
 * popover open animation.
 */
const menu = tv({
  slots: {
    list: 'list-none m-0 p-1 min-w-[180px] w-max max-h-[80vh] overflow-y-auto rounded-csc-md bg-surface-overlay shadow-[2px_4px_10px_#00000029] outline-none',
    panel:
      'fixed m-0 p-0 border-0 bg-transparent overflow-visible [inset:auto]',
    proxy: 'pointer-events-none fixed',
    trigger: 'inline-flex w-max max-w-full',
  },
});

const ui = menu();

interface CMenuProps {
  /** Distance from the trigger to the panel, in pixels. Defaults to `0`. */
  distance?: number | string;
  /** Whether the menu is open. Two-way: emits `change:open`. */
  open?: boolean;
  /** Preferred placement of the panel relative to the trigger. */
  position?: CPlacement;
  /**
   * Designated trigger: an element elsewhere in the document that opens the
   * menu — its document ID, or the element itself. The same trigger concept
   * as the `trigger` slot, supplied by reference: the menu wires
   * click-to-toggle, arrow-key opening, ARIA and focus return onto it and
   * anchors the panel to it. When both routes are supplied, this prop wins
   * over the slot.
   */
  trigger?: HTMLElement | string;
}

const props = withDefaults(defineProps<CMenuProps>(), {
  distance: 0,
  open: false,
  position: 'bottom-start',
  trigger: undefined,
});

// Anchor wrapper + panel are two root nodes; opt out of attr fallthrough.
defineOptions({ inheritAttrs: false });

const host = useHost();

const anchorRef = useTemplateRef<HTMLElement>('anchorRef');

const panelRef = useTemplateRef<HTMLElement>('panelRef');

const listRef = useTemplateRef<HTMLElement>('listRef');

const proxyRef = useTemplateRef<HTMLElement>('proxyRef');

const isOpen = ref(false);

const currentItem = ref<HTMLElement | null>(null);

// The trigger→panel gap. Applied on the placement's axis (both sides, so the
// gap survives the position-try flip fallbacks) and published as an inherited
// custom property so every (nested) submenu panel leaves the identical gap
// from its parent — provide/inject cannot cross the custom-element boundary,
// but an inherited property can.
const distancePx = computed(() => `${Number(props.distance) || 0}px`);

// With a designated trigger the panel anchors to the tracked proxy instead
// of the trigger-slot wrapper (ADR-0038).
const panelStyle = computed(
  () =>
    `position-anchor:${
      designated.element.value ? '--c-menu-designated' : '--c-menu-anchor'
    };position-area:${
      POSITION_AREA[props.position] ?? POSITION_AREA['bottom-start']
    };inset:auto;margin-${placementAxis(props.position)}:var(--_c-menu-distance,0px);`,
);

watch(distancePx, (px) => {
  host?.style.setProperty('--_c-menu-distance', px);
});

// Tracks open submenu items (across nested levels) so we can coordinate
// dismissal — the browser does not auto-chain manual popovers across the
// separate shadow roots each c-menu-item owns.
const openSubmenus = new Set<HTMLElement>();

const submenuTimers = new Map<HTMLElement, { close?: number; open?: number }>();

const OPEN_DELAY = 120;

const CLOSE_DELAY = 200;

let typeBuffer = '';

let typeTimer: null | number = null;

let pendingOpenFocus: 'first' | 'last' | 'none' = 'first';

let pendingReturnFocus = false;

// ---- DOM helpers --------------------------------------------------------

const isMenuItem = (el: unknown): el is HTMLElement =>
  el instanceof HTMLElement && el.tagName === 'C-MENU-ITEM';

const isSubmenuChild = (el: HTMLElement) =>
  el.getAttribute('slot') === 'submenu';

const isItemDisabled = (el: HTMLElement): boolean => {
  const prop = (el as { disabled?: unknown }).disabled;

  if (typeof prop === 'boolean') return prop;

  return el.hasAttribute('disabled') && el.getAttribute('disabled') !== 'false';
};

const hasSubmenu = (el: HTMLElement): boolean =>
  !!el.querySelector(':scope > [slot="submenu"]');

const getSlottedTriggerEl = (): HTMLElement | null => {
  const slot = anchorRef.value?.querySelector('slot');

  const assigned = (slot as HTMLSlotElement | null)?.assignedElements?.() ?? [];

  return (assigned[0] as HTMLElement) ?? null;
};

// ---- designated trigger (ADR-0038) ----------------------------------------

let warnedBothRoutes = false;

const warnIfBothRoutes = () => {
  if (warnedBothRoutes) return;

  warnedBothRoutes = true;
  console.warn(
    '<c-menu> received both a slotted trigger and the trigger prop; the prop wins and the slotted element gets no wiring.',
  );
};

const setTriggerWiring = (el: HTMLElement | null, expanded: boolean) => {
  if (!el) return;

  el.setAttribute('aria-haspopup', 'menu');
  el.setAttribute('aria-expanded', String(expanded));
};

const clearTriggerWiring = (el: HTMLElement | null) => {
  el?.removeAttribute('aria-haspopup');
  el?.removeAttribute('aria-expanded');
};

// Arrow keys on the designated trigger open the menu, mirroring the slotted
// route's keyboard contract; once open, focus is on the items and the host's
// delegated keydown takes over.
const onDesignatedKeydown = (event: Event) => {
  const { key } = event as KeyboardEvent;

  if (!isOpen.value && (key === 'ArrowDown' || key === 'ArrowUp')) {
    event.preventDefault();
    openMenu(key === 'ArrowUp' ? 'last' : 'first');
  }
};

const designated = useDesignatedTrigger({
  componentName: 'c-menu',
  listeners: {
    click: () => toggle(),
    keydown: onDesignatedKeydown,
  },
  onElementChange: (el, prev) => {
    clearTriggerWiring(prev);
    setTriggerWiring(el, isOpen.value);

    const slotted = getSlottedTriggerEl();

    if (el && slotted) {
      // Prop wins: the slotted element renders but gets no wiring.
      clearTriggerWiring(slotted);
      warnIfBothRoutes();
    } else if (!el) {
      setTriggerWiring(slotted, isOpen.value);
    }
  },
  proxy: proxyRef,
  source: () => props.trigger,
});

/** The trigger, whichever route supplied it — the prop wins over the slot. */
const getTriggerEl = (): HTMLElement | null =>
  designated.element.value ?? getSlottedTriggerEl();

/** The c-menu-item that owns the submenu `item` belongs to, else null. */
const parentItemOf = (item: HTMLElement): HTMLElement | null => {
  if (!isSubmenuChild(item)) return null;

  let p = item.parentElement;

  // Walk up with a direct tag check (not `!isMenuItem(p)`): negating the
  // `el is HTMLElement` predicate narrows `p` to `never` in the loop body.
  while (p && p !== host && p.tagName !== 'C-MENU-ITEM') p = p.parentElement;

  return isMenuItem(p) ? p : null;
};

/** Navigable items at the same level as `item` (root list or one submenu). */
const getLevelItems = (item: HTMLElement | null): HTMLElement[] => {
  const parent = item ? parentItemOf(item) : null;

  const container: null | ParentNode = parent ?? host;

  if (!container) return [];

  return Array.from(container.children).filter(
    (c): c is HTMLElement =>
      isMenuItem(c) && (parent ? isSubmenuChild(c) : !isSubmenuChild(c)),
  );
};

const getRootItems = (): HTMLElement[] => getLevelItems(null);

const itemFromPath = (path: EventTarget[]): HTMLElement | null => {
  for (const el of path) {
    if (el === host) break;

    if (isMenuItem(el)) return el;
  }

  return null;
};

const itemText = (el: HTMLElement) =>
  (el.textContent ?? '').trim().toLowerCase();

// ---- active item / roving tabindex --------------------------------------

const setActive = (item: HTMLElement) => {
  const prev = currentItem.value;

  if (prev && prev !== item) {
    prev.tabIndex = -1;
    prev.removeAttribute('data-active');
  }

  item.tabIndex = 0;
  item.setAttribute('data-active', '');
  item.focus();
  currentItem.value = item;
};

const clearActive = () => {
  if (currentItem.value) {
    currentItem.value.tabIndex = -1;
    currentItem.value.removeAttribute('data-active');
  }

  currentItem.value = null;
};

const move = (dir: -1 | 1) => {
  const items = getLevelItems(currentItem.value);

  if (!items.length) return;

  let idx = currentItem.value ? items.indexOf(currentItem.value) : -1;

  for (let i = 0; i < items.length; i++) {
    idx = (idx + dir + items.length) % items.length;

    if (!isItemDisabled(items[idx])) {
      setActive(items[idx]);

      return;
    }
  }
};

const focusEdge = (which: 'first' | 'last') => {
  const items = getLevelItems(currentItem.value).filter(
    (i) => !isItemDisabled(i),
  );

  if (!items.length) return;

  setActive(which === 'first' ? items[0] : items[items.length - 1]);
};

const typeahead = (char: string) => {
  if (typeTimer !== null) clearTimeout(typeTimer);

  typeBuffer += char.toLowerCase();
  typeTimer = window.setTimeout(() => {
    typeBuffer = '';
    typeTimer = null;
  }, 500);

  const items = getLevelItems(currentItem.value).filter(
    (i) => !isItemDisabled(i),
  );

  if (!items.length) return;

  const start = currentItem.value ? items.indexOf(currentItem.value) : -1;

  for (let i = 0; i < items.length; i++) {
    const candidate = items[(start + 1 + i) % items.length];

    if (itemText(candidate).startsWith(typeBuffer)) {
      setActive(candidate);

      return;
    }
  }
};

// ---- submenu coordination ------------------------------------------------

const submenuChildren = (item: HTMLElement): HTMLElement[] =>
  Array.from(item.children).filter(
    (c): c is HTMLElement => isMenuItem(c) && isSubmenuChild(c),
  );

const activePath = (item: HTMLElement): HTMLElement[] => {
  const path = [item];

  let p = parentItemOf(item);

  while (p) {
    path.push(p);
    p = parentItemOf(p);
  }

  return path;
};

const timersFor = (item: HTMLElement) => {
  let t = submenuTimers.get(item);

  if (!t) {
    t = {};
    submenuTimers.set(item, t);
  }

  return t;
};

const cancelTimers = (item: HTMLElement) => {
  const t = submenuTimers.get(item);

  if (!t) return;

  if (t.open) clearTimeout(t.open);

  if (t.close) clearTimeout(t.close);

  t.open = t.close = undefined;
};

const doOpenSubmenu = (item: HTMLElement, focusFirst: boolean) => {
  cancelTimers(item);

  // Close any open submenu that is not on this item's ancestor path.
  for (const open of [...openSubmenus]) {
    if (!activePath(item).includes(open)) scheduleCloseSubmenu(open);
  }

  (item as { openSubmenu?: () => void }).openSubmenu?.();
  openSubmenus.add(item);

  if (focusFirst) {
    requestAnimationFrame(() => {
      const child = submenuChildren(item).find((c) => !isItemDisabled(c));

      if (child) setActive(child);
    });
  }
};

const doCloseSubmenu = (item: HTMLElement) => {
  cancelTimers(item);
  (item as { closeSubmenu?: () => void }).closeSubmenu?.();
  openSubmenus.delete(item);
};

const scheduleOpenSubmenu = (item: HTMLElement) => {
  if (openSubmenus.has(item)) return;

  const t = timersFor(item);

  if (t.close) {
    clearTimeout(t.close);
    t.close = undefined;
  }

  if (t.open) return;

  t.open = window.setTimeout(() => {
    t.open = undefined;
    doOpenSubmenu(item, false);
  }, OPEN_DELAY);
};

const scheduleCloseSubmenu = (item: HTMLElement) => {
  const t = timersFor(item);

  if (t.close) return;

  t.close = window.setTimeout(() => {
    t.close = undefined;
    doCloseSubmenu(item);
  }, CLOSE_DELAY);
};

const closeAllSubmenus = () => {
  for (const open of [...openSubmenus]) doCloseSubmenu(open);

  openSubmenus.clear();
};

// ---- open / close --------------------------------------------------------

const emit = useHostEmit<CMenuEvents>();

const openMenu = (focus: 'first' | 'last' | 'none' = 'first') => {
  pendingOpenFocus = focus;

  // Re-resolve a designated trigger ID (its element may have appeared since)
  // and pin the proxy anchor before the panel shows, so the first paint is
  // already in place.
  if (props.trigger) designated.resolve();

  designated.startTracking();

  const p = panelRef.value;

  if (p && typeof p.showPopover === 'function' && !p.matches(':popover-open')) {
    p.showPopover();
  }
};

const closeMenu = (returnFocus = false) => {
  pendingReturnFocus = returnFocus;
  closeAllSubmenus();

  const p = panelRef.value;

  if (p && typeof p.hidePopover === 'function' && p.matches(':popover-open')) {
    p.hidePopover();
  }
};

const toggle = () => (isOpen.value ? closeMenu(false) : openMenu('first'));

const activateLeaf = (item: HTMLElement) => {
  const value =
    (item as { value?: unknown }).value ??
    item.getAttribute('value') ??
    undefined;

  emit('select', { value }, { bubbles: true, composed: true });
  closeMenu(true);
};

const onToggle = (event: Event) => {
  const nowOpen = (event as ToggleEvent).newState === 'open';

  isOpen.value = nowOpen;
  getTriggerEl()?.setAttribute('aria-expanded', String(nowOpen));
  emit('change:open', nowOpen);

  if (nowOpen) {
    void ensureAnchorPositioning(host?.shadowRoot);
    addDismissListeners();

    requestAnimationFrame(() => {
      if (pendingOpenFocus === 'none') return;

      const items = getRootItems().filter((i) => !isItemDisabled(i));

      if (!items.length) return;

      setActive(
        pendingOpenFocus === 'last' ? items[items.length - 1] : items[0],
      );
      pendingOpenFocus = 'first';
    });
  } else {
    removeDismissListeners();
    designated.stopTracking();
    closeAllSubmenus();
    clearActive();

    if (pendingReturnFocus) getTriggerEl()?.focus?.();

    pendingReturnFocus = false;
  }
};

// ---- delegated event handlers (on host) ----------------------------------

const onClick = (event: MouseEvent) => {
  const path = event.composedPath();

  // Prop wins: with a designated trigger the slotted element gets no wiring.
  if (
    !designated.element.value &&
    anchorRef.value &&
    path.includes(anchorRef.value)
  ) {
    toggle();

    return;
  }

  const item = itemFromPath(path);

  if (!item || isItemDisabled(item)) return;

  setActive(item);

  if (hasSubmenu(item)) {
    if (openSubmenus.has(item)) doCloseSubmenu(item);
    else doOpenSubmenu(item, true);

    return;
  }

  activateLeaf(item);
};

const onKeydown = (event: KeyboardEvent) => {
  const path = event.composedPath();

  const onTrigger =
    !designated.element.value &&
    !!anchorRef.value &&
    path.includes(anchorRef.value);

  if (!isOpen.value) {
    if (onTrigger && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      event.preventDefault();
      openMenu(event.key === 'ArrowUp' ? 'last' : 'first');
    }

    return;
  }

  switch (event.key) {
    case ' ':
    case 'Enter': {
      const it = currentItem.value;

      if (!it) break;

      event.preventDefault();

      if (hasSubmenu(it)) doOpenSubmenu(it, true);
      else if (!isItemDisabled(it)) activateLeaf(it);

      break;
    }

    case 'ArrowDown':
      event.preventDefault();
      move(1);

      break;

    case 'ArrowLeft': {
      const parent = currentItem.value ? parentItemOf(currentItem.value) : null;

      if (parent) {
        event.preventDefault();
        doCloseSubmenu(parent);
        setActive(parent);
      }

      break;
    }

    case 'ArrowRight': {
      const it = currentItem.value;

      if (it && hasSubmenu(it)) {
        event.preventDefault();
        doOpenSubmenu(it, true);
      }

      break;
    }

    case 'ArrowUp':
      event.preventDefault();
      move(-1);

      break;

    case 'End':
      event.preventDefault();
      focusEdge('last');

      break;

    case 'Escape': {
      event.preventDefault();

      const parent = currentItem.value ? parentItemOf(currentItem.value) : null;

      if (parent) {
        doCloseSubmenu(parent);
        setActive(parent);
      } else {
        closeMenu(true);
      }

      break;
    }

    case 'Home':
      event.preventDefault();
      focusEdge('first');

      break;

    case 'Tab':
      // Standard menu behaviour: Tab closes and lets focus leave naturally.
      closeMenu(false);

      break;

    default:
      if (
        event.key.length === 1 &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
      ) {
        typeahead(event.key);
      }
  }
};

const onPointerOver = (event: PointerEvent) => {
  if (!isOpen.value) return;

  const item = itemFromPath(event.composedPath());

  if (!item || isItemDisabled(item)) return;

  setActive(item);

  const path = activePath(item);

  for (const open of [...openSubmenus]) {
    if (!path.includes(open)) scheduleCloseSubmenu(open);
  }

  for (const p of path) cancelTimers(p);

  if (hasSubmenu(item)) scheduleOpenSubmenu(item);
};

// ---- light-dismiss -------------------------------------------------------

const onDocPointerDown = (event: Event) => {
  if (!isOpen.value || !host) return;

  // Everything interactive lives inside the host's flattened subtree — plus
  // the designated trigger, which lives elsewhere in the document.
  const path = event.composedPath();

  const dt = designated.element.value;

  if (!path.includes(host) && !(dt && path.includes(dt))) closeMenu(false);
};

const addDismissListeners = () => {
  document.addEventListener('pointerdown', onDocPointerDown, true);
};

const removeDismissListeners = () => {
  document.removeEventListener('pointerdown', onDocPointerDown, true);
};

// ---- lifecycle -----------------------------------------------------------

const onSlotChange = () => {
  const el = getSlottedTriggerEl();

  if (!el) return;

  if (designated.element.value) {
    warnIfBothRoutes();

    return;
  }

  setTriggerWiring(el, isOpen.value);
};

watch(
  () => coerceBoolean(props.open),
  (value) => (value ? openMenu('first') : closeMenu(false)),
);

onMounted(() => {
  if (!host) return;

  host.style.setProperty('--_c-menu-distance', distancePx.value);

  host.addEventListener('click', onClick);
  host.addEventListener('keydown', onKeydown);
  host.addEventListener('pointerover', onPointerOver as EventListener);

  designated.resolve();

  const slot = anchorRef.value?.querySelector('slot');

  slot?.addEventListener('slotchange', onSlotChange);
  onSlotChange();

  if (coerceBoolean(props.open)) {
    requestAnimationFrame(() => openMenu('first'));
  }
});

onBeforeUnmount(() => {
  host?.removeEventListener('click', onClick);
  host?.removeEventListener('keydown', onKeydown);
  host?.removeEventListener('pointerover', onPointerOver as EventListener);
  removeDismissListeners();

  if (typeTimer !== null) clearTimeout(typeTimer);

  for (const item of submenuTimers.keys()) cancelTimers(item);
});
</script>

<!--
  Escape-hatch CSS — constructs utilities cannot express:
   - `position-try-fallbacks` on the panel: native flip/shift when the
     preferred placement lacks room (the `position-area` itself is set inline
     from the `position` prop). Un-Tailwind-able at-rule-adjacent syntax.
   - the popover open animation (`@keyframes`).
  The host keeps the global `:host{display:contents}`; the slotted trigger is
  the visible inline box, so no host override is needed here.
-->
<style>
[part='panel'] {
  position-try-fallbacks:
    flip-block,
    flip-inline,
    flip-block flip-inline;
}

[part='panel']:popover-open {
  animation: c-menu-fade-in 0.12s ease-out;
}

@keyframes c-menu-fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>
