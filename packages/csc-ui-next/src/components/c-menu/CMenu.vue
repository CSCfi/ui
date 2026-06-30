<template>
  <!-- Anchor wrapper: a shadow-DOM box around the slotted trigger. CSS anchor
       names are tree-scoped, so the anchor must live in the same shadow root
       as the panel — we cannot anchor to the light-DOM trigger directly
       (ADR-0008). The wrapper carries `anchor-name`; the panel references it. -->
  <span
    ref="anchorRef"
    :class="ui.trigger()"
    part="trigger"
    style="anchor-name: --c-menu-anchor"
  >
    <slot name="trigger" />
  </span>

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

import { ensureAnchorPositioning } from '../../shared/anchorPolyfill';
import { coerceBoolean } from '../../shared/coerceBoolean';

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
 * Styling is in this `tailwind-variants` config (ADR-0004); `::part()` is the
 * customization surface (ADR-0006). The `<style>` block is the ADR-0007 escape
 * hatch for the un-Tailwind-able anchor-positioning fallbacks and the
 * popover open animation.
 */
const menu = tv({
  slots: {
    list: 'list-none m-0 p-1 min-w-[180px] w-max max-h-[80vh] overflow-y-auto rounded-csc-md bg-surface-overlay shadow-[2px_4px_10px_#00000029] outline-none',
    panel:
      'fixed m-0 p-0 border-0 bg-transparent overflow-visible [inset:auto]',
    trigger: 'inline-flex w-max max-w-full',
  },
});

const ui = menu();

interface CMenuProps {
  /** Whether the menu is open. Two-way: emits `update:open` (v-model:open). */
  open?: boolean;
  /** Preferred placement of the panel relative to the trigger. */
  position?: Placement;
}

type Placement =
  | 'bottom-end'
  | 'bottom-start'
  | 'bottom'
  | 'left-end'
  | 'left-start'
  | 'left'
  | 'right-end'
  | 'right-start'
  | 'right'
  | 'top-end'
  | 'top-start'
  | 'top';

const props = withDefaults(defineProps<CMenuProps>(), {
  open: false,
  position: 'bottom-start',
});

// Anchor wrapper + panel are two root nodes; opt out of attr fallthrough.
defineOptions({ inheritAttrs: false });

// Placement → CSS `position-area`. Native flip/shift comes from the
// `position-try-fallbacks` declared in the escape-hatch <style>.
const POSITION_AREA: Record<Placement, string> = {
  bottom: 'bottom',
  'bottom-end': 'bottom span-left',
  'bottom-start': 'bottom span-right',
  left: 'left',
  'left-end': 'left span-top',
  'left-start': 'left span-bottom',
  right: 'right',
  'right-end': 'right span-top',
  'right-start': 'right span-bottom',
  top: 'top',
  'top-end': 'top span-left',
  'top-start': 'top span-right',
};

const host = useHost();

const anchorRef = useTemplateRef<HTMLElement>('anchorRef');

const panelRef = useTemplateRef<HTMLElement>('panelRef');

const listRef = useTemplateRef<HTMLElement>('listRef');

const isOpen = ref(false);

const currentItem = ref<HTMLElement | null>(null);

const panelStyle = computed(
  () =>
    `position-anchor:--c-menu-anchor;position-area:${
      POSITION_AREA[props.position] ?? POSITION_AREA['bottom-start']
    };inset:auto;`,
);

// Tracks open submenu items (across nested levels) so we can coordinate
// dismissal — the browser does not auto-chain manual popovers across the
// separate shadow roots each c-menu-item owns (ADR-0008 risk note).
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

const getTriggerEl = (): HTMLElement | null => {
  const slot = anchorRef.value?.querySelector('slot');

  const assigned = (slot as HTMLSlotElement | null)?.assignedElements?.() ?? [];

  return (assigned[0] as HTMLElement) ?? null;
};

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

const dispatch = (name: string, detail?: unknown, bubbles = true) =>
  host?.dispatchEvent(
    new CustomEvent(name, { bubbles, composed: bubbles, detail }),
  );

const openMenu = (focus: 'first' | 'last' | 'none' = 'first') => {
  pendingOpenFocus = focus;

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

  dispatch('select', { value });
  closeMenu(true);
};

const onToggle = (event: Event) => {
  const nowOpen = (event as ToggleEvent).newState === 'open';

  isOpen.value = nowOpen;
  getTriggerEl()?.setAttribute('aria-expanded', String(nowOpen));
  dispatch('update:open', nowOpen, false);

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
    closeAllSubmenus();
    clearActive();

    if (pendingReturnFocus) getTriggerEl()?.focus?.();

    pendingReturnFocus = false;
  }
};

// ---- delegated event handlers (on host) ----------------------------------

const onClick = (event: MouseEvent) => {
  const path = event.composedPath();

  if (anchorRef.value && path.includes(anchorRef.value)) {
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

  const onTrigger = !!anchorRef.value && path.includes(anchorRef.value);

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

  // Everything interactive lives inside the host's flattened subtree.
  if (!event.composedPath().includes(host)) closeMenu(false);
};

const addDismissListeners = () => {
  document.addEventListener('pointerdown', onDocPointerDown, true);
};

const removeDismissListeners = () => {
  document.removeEventListener('pointerdown', onDocPointerDown, true);
};

// ---- lifecycle -----------------------------------------------------------

const onSlotChange = () => {
  const el = getTriggerEl();

  if (!el) return;

  el.setAttribute('aria-haspopup', 'menu');
  el.setAttribute('aria-expanded', String(isOpen.value));
};

watch(
  () => coerceBoolean(props.open),
  (value) => (value ? openMenu('first') : closeMenu(false)),
);

onMounted(() => {
  if (!host) return;

  host.addEventListener('click', onClick);
  host.addEventListener('keydown', onKeydown);
  host.addEventListener('pointerover', onPointerOver as EventListener);

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
  ADR-0007 escape-hatch CSS — constructs utilities cannot express:
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
