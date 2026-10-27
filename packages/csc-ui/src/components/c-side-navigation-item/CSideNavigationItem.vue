<template>
  <div :class="ui.root()" part="root">
    <!-- A link with an `href`, else a button; a parent is a disclosure button
         for its sub-items (aria-expanded is set below). -->
    <component
      :is="href ? 'a' : 'button'"
      ref="headerRef"
      :aria-controls="slotHasContent ? subNavId : undefined"
      :class="ui.header()"
      :href="href || undefined"
      :tabindex="collapsed ? -1 : undefined"
      :target="href ? target : undefined"
      :type="href ? undefined : 'button'"
      part="header"
    >
      <c-icon v-if="slotHasContent" :class="ui.chevron()" :path="chevronIcon" />

      <span :class="ui.slot()">
        <slot />
      </span>
    </component>

    <div
      v-if="slotHasContent"
      :id="subNavId"
      :aria-label
      :class="ui.subNav()"
      part="sub-nav"
      role="group"
    >
      <slot name="sub-item" />
    </div>

    <c-loader :hide="!loading" :size="32" style="pointer-events: none" />
  </div>
</template>

<script setup lang="ts">
/**
 * @slot default - The item's label content (text and an optional c-icon)
 * @internalslot sub-item - Assigned by the item to its nested items
 *
 * @csspart root - The outer box wrapping the header and sub-navigation, carrying the background and state styling
 * @csspart header - The clickable header row (an `<a>` when `href` is set) holding the chevron and label
 * @csspart sub-nav - The collapsible group holding the sub-items
 */
import { mdiChevronRight } from '@mdi/js';
import { tv } from 'tailwind-variants';
import {
  computed,
  onMounted,
  ref,
  useHost,
  useId,
  useTemplateRef,
  watchEffect,
} from 'vue';

import { useHostEmit } from '../../shared/useHostEmit';

/** Events dispatched by `<c-side-navigation-item>`. */
interface CSideNavigationItemEvents {
  /**
   * Fired when the item is activated (click or Enter), carrying its `value`;
   * bubbles out of the navigation, as `c-menu`'s does, so one listener on
   * `c-side-navigation` can handle every item.
   */
  select: { value: string | undefined };
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
    // Sub-item states are the nav family's own (ADR-0052): the sub-items sit
    // inside the active parent's `nav-active` pill, so hover is a translucent
    // `on-nav-active` wash over it and active the `nav-sub-active` fill (an
    // opaque white pill in light mode, a wash in dark) — never page roles.
    // Merged after the variants so they win over the top-level
    // `nav-surface-hover` / `nav-active` + ring.
    {
      active: false,
      class: { root: 'hover:bg-on-nav-active/10' },
      subItem: true,
    },
    {
      active: true,
      class: { root: 'bg-nav-sub-active ring-0' },
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
      'grid min-h-[46px] w-full items-center gap-2 px-3 py-2 text-left text-current no-underline outline-none',
    // The outer box (the original `:host(.c-side-navigation-item) > div`) that
    // wraps the header + sub-nav and carries the bg/color/state. Its `color`
    // cascades into the rendered chevron c-icon (currentColor contract).
    root: 'relative grid [transform:translate3d(0,0,0)] cursor-pointer items-center overflow-hidden rounded-csc-md bg-transparent font-normal text-on-nav select-none [backface-visibility:hidden]',
    slot: 'flex max-w-full items-center gap-2 leading-normal',
    subNav:
      'h-0 w-full overflow-y-hidden transition-all duration-500 ease-[ease]',
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
      // Sub-item palette: transparent on the parent's `nav-active` pill, in
      // that pill's ink; its hover/active washes are the compounds above.
      true: {
        root: 'm-0 mx-2 mb-1 rounded-csc-md text-on-nav-active',
      },
    },
  },
});

interface CSideNavigationItemProps {
  /**
   * On an item without sub-items, mark the current page
   * (`aria-current="page"`); on a parent, expand its sub-items.
   */
  active?: boolean;

  /**
   * Whether the item sits under a collapsed parent item, which sets it so
   * hidden items are not Tab-reachable.
   *
   * @internal
   */
  collapsed?: boolean;

  /**
   * URL that makes the item a real link; without it the item is a button.
   *
   * @freeform any URL
   */
  href?: string;

  /**
   * Cover the item with a loading overlay: a translucent scrim and a spinner.
   */
  loading?: boolean;

  /**
   * Where the `href` opens, as on a native `<a>`: the same tab unless set —
   * `_blank` for a new one.
   *
   * @freeform any browsing-context name (e.g. _blank, _self)
   */
  target?: string;

  /**
   * Value reported in the `select` event when the item is activated
   *
   * @freeform
   */
  value?: string;
}

const props = withDefaults(defineProps<CSideNavigationItemProps>(), {
  active: false,
  collapsed: false,
  href: '',
  loading: false,
  target: '',
  value: undefined,
});

const chevronIcon = mdiChevronRight;

const SUB_ITEMS = new Set(['c-side-navigation-item', 'c-sub-navigation-item']);

const host = useHost();

// The rendered header element carries the tabindex/role/aria (the focusable
// menuitem); `display:contents` on the host keeps it out of the focus order.
const headerRef = useTemplateRef<HTMLElement>('headerRef');

const slotHasContent = ref(false);

const isSubItem = ref(false);

const ariaLabel = ref('');

// The sub-items' group, which a parent's header controls.
const subNavId = `${useId()}-sub-nav`;

const ui = computed(() =>
  sideNavigationItem({
    active: props.active,
    expandable: slotHasContent.value,
    subItem: isSubItem.value,
  }),
);

// Sub-items rendered inside another sub-navigation-item get a marker
// class so the sub-item CSS variant kicks in (Stencil sets this in
// componentDidLoad via _handleChildClasses).
const handleChildClasses = () => {
  if (!isSubItem.value || !host) return;
  Array.from(host.children)
    .filter((c) => c.tagName === 'C-SUB-NAVIGATION-ITEM')
    .forEach((c) => c.classList.add('c-sub-navigation-item--sub-level'));
};

// Propagate this item's expanded state to its sub-items — hidden sub-items
// leave the tab order and the accessibility tree.
const handleChildCollapsedChange = (expanded: boolean) => {
  if (!slotHasContent.value || !host) return;
  host.querySelectorAll('[slot="sub-item"]').forEach((child: Element) => {
    const c = child as { collapsed?: boolean } & HTMLElement;
    c.setAttribute('aria-hidden', String(!expanded));
    c.collapsed = !expanded;
  });
};

// Nested items — c-sub-navigation-item and c-side-navigation-item children,
// which consumers write inline — go in the sub-item slot. Runs on mount and on
// every slotchange in the shadow root, so sub-items added or removed later
// find their place; a pass with nothing to move changes no slot.
const adoptSubItems = () => {
  if (!host) return;

  for (const child of host.children) {
    if (SUB_ITEMS.has(child.localName) && child.slot !== 'sub-item') {
      child.slot = 'sub-item';
    }
  }

  slotHasContent.value = !!host.querySelector(':scope > [slot="sub-item"]');
  handleChildClasses();
  handleChildCollapsedChange(props.active);
};

const emit = useHostEmit<CSideNavigationItemEvents>();

// The header is a native link or button, so Enter (and Space on a button)
// activates it with a click.
const redirect = (event: Event) => {
  // A nested item's activation ends here: the parent item around it must not
  // take it for its own.
  if (isSubItem.value) {
    event.stopPropagation();
    event.stopImmediatePropagation?.();
  }

  // c-side-navigation hears it, and closes its drawer for a leaf item.
  emit('select', { value: props.value }, { bubbles: true, composed: true });
};

onMounted(() => {
  if (!host) return;
  isSubItem.value = host.parentElement?.localName === 'c-side-navigation-item';
  adoptSubItems();
  host.shadowRoot?.addEventListener('slotchange', adoptSubItems);

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
  // A nested parent item (in a parent item's sub-item slot) shows and hides
  // its own sub-items on its `select`; c-side-navigation leaves a slotted
  // item's expansion alone, and the event goes on to the page.
  host.addEventListener('select', (e) => {
    // Re-assign via host so Vue's prop setter runs.
    if (isSubItem.value && slotHasContent.value && e.target === host)
      (host as { active?: boolean }).active = !props.active;
  });

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

    handleChildCollapsedChange(props.active);
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
  /* The row's own ink: `on-nav` at the top level, `on-nav-active` for a
     sub-item inside the active parent's pill (ADR-0052). */
  outline: 2px solid currentColor;
  outline-offset: -2px;
}

::slotted(span),
::slotted(c-icon) {
  font-size: 20px;
}
</style>
