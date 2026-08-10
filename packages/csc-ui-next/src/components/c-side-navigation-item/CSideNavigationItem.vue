<template>
  <div :class="ui.root()" part="root">
    <component
      :is="href ? 'a' : 'div'"
      ref="headerRef"
      :class="ui.header()"
      :href="href || undefined"
      :tabindex="focusable ? 0 : -1"
      :target="href ? target : undefined"
      part="header"
      role="menuitem"
    >
      <c-icon v-if="slotHasContent" :class="ui.chevron()" :path="chevronIcon" />

      <div :class="ui.slot()">
        <slot />
      </div>
    </component>

    <nav
      v-if="slotHasContent"
      :aria-expanded="!!active"
      :aria-label
      :class="ui.subNav()"
      part="sub-nav"
      role="menubar"
    >
      <slot name="sub-item" />
    </nav>

    <c-loader :size="32" :visible="loading" style="pointer-events: none" />
  </div>
</template>

<script setup lang="ts">
/**
 * @slot default - The item's label content (text and an optional c-icon)
 * @slot sub-item - Nested c-side-navigation-item components; assigned automatically to nested items
 *
 * @csspart root - The outer box wrapping the header and sub-navigation, carrying the background and state styling
 * @csspart header - The clickable header row (an `<a>` when `href` is set) holding the chevron and label
 * @csspart sub-nav - The collapsible `<nav>` container for the sub-items
 */
import { mdiChevronRight } from '@mdi/js';
import { tv } from 'tailwind-variants';
import {
  computed,
  onMounted,
  ref,
  useHost,
  useTemplateRef,
  watchEffect,
} from 'vue';

import { useHostEmit } from '../../shared/useHostEmit';

/** Events dispatched by `<c-side-navigation-item>`. */
interface CSideNavigationItemEvents {
  /**
   * Fired when the item is activated (click or Enter), carrying the
   * originating DOM event; bubbles so the parent `<c-side-navigation>` can
   * coordinate which item is active.
   */
  itemChange: Event;
}

/**
 * Styling lives in this `tailwind-variants` config: each visual
 * region is a slot, and the `expandable` / `active` / `subItem` variants replace
 * the `:host(.active)`, `--parent` and `[slot='sub-item']` selector cascades.
 * The per-component `--c-*` indirection vars are dropped in favour of the
 * semantic design tokens: items sit on the themed nav surface, so
 * their foreground is `on-nav`, hover is `nav-surface-hover`, the active pill is
 * the dedicated `nav-active`/`on-nav-active` role, and a sub-item box is
 * `surface-raised`. (The active pill was previously the `surface-sunken`
 * page-canvas role — decoupled so dark mode can style the selection independently
 * of the page background instead of receding into it. Light still maps to the
 * same steps, so its tinted pill is unchanged.)
 * Consumer customization is via `::part()`.
 *
 * The keyboard focus ring and the `::slotted(span)/(c-icon)` sizing of consumer
 * light-DOM children remain in the escape-hatch <style> below. The
 * tabindex/role/aria live on the rendered `header` element, not the host: a
 * `display:contents` host is skipped by sequential focus, so a host-level
 * `:focus-visible` ring never triggered on Tab. Hover is a `hover:` utility on
 * `root` because the `display:contents` host shares its hover region with the box.
 *
 * Hover lives in `active: { false }` (NOT the base slot): the original cascade
 * lets the active state win over hover, but a base `hover:bg-*` and the active
 * variant's `bg-*` don't conflict under tailwind-merge, so both would apply and
 * hover would wrongly override the active background. Sub-item mode (`[slot=
 * sub-item]`) is its own palette (a `surface-raised` box with `primary` text,
 * hover `primary-subtle-hover`), mirroring the original `[slot='sub-item']` var
 * remap.
 */
const sideNavigationItem = tv({
  compoundVariants: [
    // Parent (expandable) + active gets extra bottom padding (original
    // `:host(.c-side-navigation-item--parent.active) > div`).
    { active: true, class: { root: 'pb-1' }, expandable: true },
    // Sub-item hover is primary-subtle-hover (overrides the top-level
    // nav-surface-hover from `active:false`); merged after the variants so it wins.
    {
      active: false,
      class: { root: 'hover:bg-primary-subtle-hover' },
      subItem: true,
    },
  ],
  defaultVariants: {
    active: false,
    expandable: false,
    subItem: false,
  },
  slots: {
    chevron: 'self-center transition-transform duration-300 ease-[ease]',
    // The clickable header row (icon + label). It is the focusable menuitem
    // (tabindex/role bound in the template) — the `display:contents` host is
    // skipped by sequential focus, so focus must live on a rendered box. Its own
    // native outline is suppressed; the visible ring is drawn on `root`.
    header:
      'grid items-center min-h-[46px] gap-2 px-3 py-2 no-underline text-current outline-none',
    // The outer box (the original `:host(.c-side-navigation-item) > div`) that
    // wraps the header + sub-nav and carries the bg/color/state. Its `color`
    // cascades into the rendered chevron c-icon (currentColor contract).
    root: 'grid items-center relative overflow-hidden rounded-csc-md cursor-pointer font-normal select-none [backface-visibility:hidden] [transform:translate3d(0,0,0)] bg-transparent text-on-nav',
    slot: 'flex items-center gap-2 max-w-full leading-normal',
    subNav:
      'w-full overflow-y-hidden h-0 transition-all duration-500 ease-[ease]',
  },
  variants: {
    active: {
      // Only a non-active item reacts to hover (active bg must win).
      false: { root: 'hover:bg-nav-surface-hover' },
      true: {
        chevron: 'rotate-90',
        root: 'bg-nav-active text-on-nav-active ring ring-primary',
        subNav: 'h-max',
      },
    },
    expandable: {
      true: { header: 'grid-cols-[auto_1fr]' },
    },
    subItem: {
      // Sub-item palette: a surface-raised box with primary text (declared after
      // `active` so it also overrides the active bg for an active sub-item,
      // matching the original sub-item-active-bg = the raised surface).
      true: {
        root: 'rounded-csc-md m-0 mx-2 mb-1 bg-surface-raised text-primary',
      },
    },
  },
});

interface CSideNavigationItemProps {
  /**
   * Indicate active state
   *
   * @seeded from csc-ui — verify
   */
  active?: boolean;
  /** Whether the item is in the keyboard tab order — a parent item sets this to false on its collapsed sub-items so hidden items aren't Tab-reachable */
  focusable?: boolean;
  /**
   * Hyperlink url
   *
   * @seeded from csc-ui — verify
   * @freeform any URL
   */
  href?: string;
  /**
   * Loading state
   *
   * @seeded from csc-ui — verify
   */
  loading?: boolean;
  /**
   * Hyperlink target
   *
   * @seeded from csc-ui — verify
   * @freeform any browsing-context name (e.g. _blank, _self)
   */
  target?: string;
}

const props = withDefaults(defineProps<CSideNavigationItemProps>(), {
  active: false,
  focusable: true,
  href: '',
  loading: false,
  target: '',
});

const chevronIcon = mdiChevronRight;

const host = useHost();

// The rendered header element carries the tabindex/role/aria (the focusable
// menuitem); `display:contents` on the host keeps it out of the focus order.
const headerRef = useTemplateRef<HTMLElement>('headerRef');

const slotHasContent = ref(false);

const isSubItem = ref(false);

const ariaLabel = ref('');

const ui = computed(() =>
  sideNavigationItem({
    active: props.active,
    expandable: slotHasContent.value,
    subItem: isSubItem.value,
  }),
);

// Move nested c-side-navigation-item children into the "sub-item" named
// slot. Mirrors Stencil's _assignSubItemSlots — consumers write nested
// items without manually specifying the slot.
const assignSubItemSlots = () => {
  if (!host) return;
  host.querySelectorAll('c-side-navigation-item').forEach((item) => {
    item.setAttribute('slot', 'sub-item');
  });
};

// Sub-items rendered inside another sub-navigation-item get a marker
// class so the sub-item CSS variant kicks in (Stencil sets this in
// componentDidLoad via _handleChildClasses).
const handleChildClasses = () => {
  if (!isSubItem.value || !host) return;
  Array.from(host.children)
    .filter((c) => c.tagName === 'C-SUB-NAVIGATION-ITEM')
    .forEach((c) => c.classList.add('c-sub-navigation-item--sub-level'));
};

// Propagate focusability + aria-hidden to sub-navigation-item children
// based on this item's expanded state — hidden subitems shouldn't be
// in the tab order.
const handleChildFocusableChange = (focusable: boolean) => {
  if (!slotHasContent.value || !host) return;
  host.querySelectorAll('[slot="sub-item"]').forEach((child: Element) => {
    const c = child as { focusable?: boolean } & HTMLElement;
    c.setAttribute('aria-hidden', String(!focusable));
    c.focusable = focusable;
  });
};

const emit = useHostEmit<CSideNavigationItemEvents>();

const redirect = (event: Event | KeyboardEvent) => {
  if (event instanceof KeyboardEvent && event.key !== 'Enter') return;

  if (isSubItem.value) {
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    event.preventDefault();
  }

  emit('itemChange', event, { bubbles: true, composed: true });

  if (!slotHasContent.value) {
    const sidenav = document.querySelector('c-side-navigation') as
      | ({ menuVisible: boolean } & HTMLElement)
      | null;

    if (sidenav) sidenav.menuVisible = false;
  }
};

onMounted(() => {
  if (!host) return;
  assignSubItemSlots();
  slotHasContent.value = !!host.querySelector('[slot="sub-item"]');
  isSubItem.value = !!host.getAttribute('slot');

  // Pull aria-label from the first text node (Stencil mirrors this for
  // the nested <nav>).
  for (const node of Array.from(host.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE && node.nodeValue?.trim()) {
      ariaLabel.value = node.nodeValue.trim();
      break;
    }
  }

  // role/tabindex/aria live on the rendered `header` element (see headerRef),
  // not the `display:contents` host which is skipped by sequential focus.
  host.addEventListener('click', redirect);
  host.addEventListener('keydown', redirect);
  // A nested item bubbling its own itemChange shouldn't toggle the
  // parent — instead toggle this item's active and swallow.
  host.addEventListener('itemChange', (e) => {
    if (isSubItem.value) {
      e.stopPropagation();
      e.stopImmediatePropagation?.();
      e.preventDefault();
      // Re-assign via host so Vue's prop setter runs.
      (host as { active?: boolean }).active = !props.active;
    }
  });

  handleChildClasses();
  handleChildFocusableChange(props.active);

  watchEffect(() => {
    host.classList.toggle('c-side-navigation-item', true);
    host.classList.toggle(
      'c-side-navigation-item--parent',
      slotHasContent.value,
    );
    host.classList.toggle('active', props.active);

    // aria state belongs on the menuitem (the header), not the host.
    const header = headerRef.value;

    if (header) {
      if (slotHasContent.value) {
        header.setAttribute('aria-expanded', String(!!props.active));
        header.removeAttribute('aria-current');
      } else if (props.active) {
        header.setAttribute('aria-current', 'page');
        header.removeAttribute('aria-expanded');
      } else {
        header.removeAttribute('aria-current');
        header.removeAttribute('aria-expanded');
      }
    }

    handleChildFocusableChange(props.active);
  });
});
</script>

<!--
  Escape-hatch CSS: only constructs Tailwind utilities cannot
  express. The header box, chevron, slot layout, active/expandable/sub-item
  states and the sub-nav height transition live in the `tv` config above. What
  remains here:
    - The keyboard focus ring: painted on `[part='root']` via `:has(:focus-visible)`
      (reacting to the focusable `header`), with a negative `outline-offset` so a
      nested sub-item's ring isn't clipped by its parent row's `overflow:hidden`.
    - `::slotted(span)/(c-icon)` sizing of consumer light-DOM children, and the
      layout of the projected `<slot>` element (shadow node, no class hook).
  Authored against global design tokens only.
-->
<style>
/* Keyboard focus ring. tabindex/role live on the rendered `header` (a real
   box); the `:host` is `display:contents` and is skipped by sequential focus,
   so the old `:host(:focus-visible)` ring never fired on Tab. The ring is
   painted on `[part='root']`, reacting to the header's `:focus-visible` via
   `:has`, with a NEGATIVE `outline-offset` so it draws inside the box — an
   outset ring would be clipped by the `overflow:hidden` on a nested sub-item's
   parent row. */
[part='root']:has(:focus-visible) {
  outline: 2px var(--c-on-nav) solid;
  outline-offset: -2px;
}

::slotted(span),
::slotted(c-icon) {
  font-size: 20px;
}
</style>
