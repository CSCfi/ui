<template>
  <div :class="ui.content()" part="root">
    <div v-if="mobile" :class="ui.burger()">
      <c-icon-button inverted text @click="closeMenu">
        <span :class="ui.srOnly()">Close sidemenu</span>

        <c-icon :path="arrowRight" />
      </c-icon-button>
    </div>

    <nav ref="containerRef" :class="ui.nav()" part="nav" role="menubar">
      <div :class="ui.wrapper()">
        <slot />
      </div>
    </nav>

    <div v-show="hasBottom" ref="bottomRef" :class="ui.bottom()">
      <slot name="bottom" />
    </div>
  </div>

  <div
    v-if="menuVisibleInternal && mobile"
    class="c-overlay c-fade-in"
    @click="closeMenu"
  />
</template>

<script setup lang="ts">
/**
 * @slot default - The navigation items: titles, items and their sub-items
 * @slot bottom - Trailing content below the items, such as a sign-out button; it stays at the drawer's bottom edge while the items scroll
 *
 * @csspart root - The outer drawer container: the item list above the bottom slot's region
 * @csspart nav - The scrollable `<nav>` element holding the navigation items
 *
 * @seeded from csc-ui — verify
 *
 * @subcomponents c-side-navigation-item, c-side-navigation-title, c-sub-navigation-item
 */
import { mdiArrowRight } from '@mdi/js';
import { tv } from 'tailwind-variants';
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  useHost,
  useTemplateRef,
  watch,
  watchEffect,
} from 'vue';

import { useHasSlot } from '../../shared/useHasSlot';
import { useHostEmit } from '../../shared/useHostEmit';

/** Events dispatched by `<c-side-navigation>`. */
interface CSideNavigationEvents {
  /**
   * Fired when the drawer is closed from within (the mobile close button or
   * the backdrop overlay), carrying the new visibility (`false`).
   * Named `change:menu-visible`, not `update:menuVisible`: Vue's runtime
   * silently drops `onUpdate:*` listeners on custom elements
   * (`isModelListener`), so a template `@update:menu-visible` would never be
   * attached.
   */
  'change:menu-visible': boolean;
}

// Multi-root template (fragment) + we write to the host below — keep
// fallthrough attrs on the host element instead of tripping the "renders
// fragment" warning.
defineOptions({ inheritAttrs: false });

/**
 * Styling lives in this `tailwind-variants` config: each visual region is a
 * slot and the `mobile` variant swaps the desktop column for the fixed
 * slide-in panel. The drawer is the themed `nav-surface` role (brand primary
 * in light, a dark neutral panel in dark). Consumer customization is via
 * `::part()`.
 *
 * The drawer (`content`, `part="root"`) is a column: the mobile close row,
 * the item list and the bottom slot's region. The **item list** (`nav`,
 * `part="nav"`) is the drawer's only scroll container — it shrinks to the
 * space left (`flex-1 min-h-0`) and scrolls a long menu on its own, containing
 * its overscroll so a wheel that reaches its end does not chain to the
 * document (Chromium latches the rest of the gesture to whichever scroller
 * took it). The **bottom slot's region** sits outside the `menubar` nav, so a
 * sign-out button is not a menu item, and is `sticky bottom-0`: inside c-main
 * the drawer is sized to its pinned height but sits below the banner and
 * toolbar rows until the page has scrolled past them, and the sticky region
 * rides up to the viewport's bottom edge in the meantime (CONTEXT.md "Bottom
 * slot"). It is opaque so it covers the tail of a long list while shifted.
 * The region renders only while the slot is populated, so drawers without a
 * bottom slot keep their box.
 *
 * The host box itself (the `[data-desktop]` / `.autoheight` host states, which
 * carry background/flex/min-width and can't be expressed as utilities on the
 * host), the `.c-overlay` backdrop + its fade-in `@keyframes`, and the
 * `::slotted(...)` `display:contents` rule remain in the escape-hatch <style>
 * below.
 */
const sideNavigation = tv({
  compoundVariants: [
    // Mobile drawer slides off-screen when hidden.
    { class: { content: 'translate-x-full' }, hidden: true, mobile: true },
    // Mobile: the close row sits above the list, so the list drops its top padding.
    { class: { nav: 'pt-0' }, mobile: true },
  ],
  defaultVariants: {
    hidden: false,
    mobile: false,
  },
  slots: {
    // The bottom slot's region; `px-6 pb-6` matches the list's `p-6` inset.
    bottom: 'shrink-0 sticky bottom-0 z-[8] bg-nav-surface px-6 pb-6 pt-2',
    burger: 'flex justify-end px-4 py-2',
    // The outer drawer container.
    content: 'flex flex-col min-h-0 flex-[1_2_260px] w-80 bg-nav-surface',
    // The item list: the drawer's scroll container.
    nav: 'relative flex flex-col flex-1 min-h-0 w-full overflow-y-auto overscroll-contain p-6 z-[8] bg-nav-surface transition-transform duration-300 ease-[ease]',
    srOnly:
      'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0 [clip:rect(0_0_0_0)]',
    wrapper: 'flex flex-col gap-1',
  },
  variants: {
    hidden: {
      true: {},
    },
    mobile: {
      true: {
        // The panel is viewport-high and clips; the list inside it scrolls.
        // `h-dvh`, not `h-screen` (`100vh`): on a phone `vh` is the viewport
        // with the browser chrome collapsed, so while the address bar is
        // shown the drawer's tail — the last items, the bottom slot — sat
        // behind it. The dynamic unit follows the visible viewport.
        content:
          'h-dvh max-w-80 overflow-hidden fixed right-0 top-0 z-[999] transition-transform duration-200 ease-standard translate-x-0',
      },
    },
  },
});

interface CSideNavigationProps {
  /**
   * Mobile version menu visibility
   *
   * @seeded from csc-ui — verify
   */
  menuVisible?: boolean;
  /**
   * Mobile version
   *
   * @seeded from csc-ui — verify
   */
  mobile?: boolean;
  /**
   * Background styles
   *
   * @seeded from csc-ui — verify
   */
  styles?: null | Record<string, string>;
}

const props = withDefaults(defineProps<CSideNavigationProps>(), {
  menuVisible: false,
  mobile: false,
  styles: null,
});

const arrowRight = mdiArrowRight;

const host = useHost();

const emit = useHostEmit<CSideNavigationEvents>();

const containerRef = useTemplateRef<HTMLElement>('containerRef');

const bottomRef = useTemplateRef<HTMLElement>('bottomRef');

// The bottom slot's region renders only while something is slotted, so a
// drawer without a bottom slot keeps its box (no empty padded strip).
const hasBottom = useHasSlot(bottomRef, 'bottom');

const menuVisibleInternal = ref(props.menuVisible);

const ui = computed(() =>
  sideNavigation({
    hidden: !menuVisibleInternal.value,
    mobile: !!props.mobile,
  }),
);

// Keep the internal render state and the reflected custom-element `menuVisible`
// property in lockstep. The nav button toggles visibility through internal
// state, but nav items close the drawer by setting the `menuVisible` *property*
// on the host (`document.querySelector('c-side-navigation').menuVisible = false`).
// If the property lagged behind internal state, that write could be a no-op
// (false -> false) and leave the drawer open — so mirror every change back to
// the host property too. The watcher below then closes the loop without
// recursing (both assignments are guarded by an equality check).
const setMenuVisible = (value: boolean) => {
  if (menuVisibleInternal.value !== value) {
    menuVisibleInternal.value = value;
  }

  const el = host as ({ menuVisible?: boolean } & HTMLElement) | null;

  if (el && el.menuVisible !== value) {
    el.menuVisible = value;
  }
};

watch(
  () => props.menuVisible,
  (v) => {
    setMenuVisible(v);
  },
);

// Expose menuVisible setter so sub-navigation-item / side-navigation-item
// can close the drawer via `document.querySelector('c-side-navigation').menuVisible = false`.
// Vue's defineCustomElement already creates the property setter for the
// prop; the watcher above keeps internal state in sync when consumers
// pass the prop reactively.
const closeMenu = () => {
  setMenuVisible(false);
  emit('change:menu-visible', false);
};

// Reflect c-side-navigation-item's itemChange: when a top-level item is
// activated, deactivate any other parent (an "accordion"-style behaviour).
const handleItemChange = (event: Event) => {
  if (!host) return;

  const target = event.target as { active: boolean } & HTMLElement;

  const wasActive = target.active;

  const items = host.querySelectorAll('c-side-navigation-item');

  items.forEach((item) => {
    const el = item as { active: boolean } & HTMLElement;

    if (el.querySelector('c-sub-navigation-item[slot="sub-item"]')) {
      el.active = false;
    }
  });

  if (target.querySelector('[slot="sub-item"]')) {
    target.active = !wasActive;
  } else {
    target.active = true;
  }
};

// Global click/keyup listener: c-navigation-button anywhere on the page
// toggles the side navigation. Matches Stencil's componentDidLoad.
const onDocEvent = (e: Event) => {
  const t = e.target as HTMLElement;

  if (!t?.matches?.('c-navigation-button')) return;

  if (e.type === 'click') {
    setMenuVisible(!menuVisibleInternal.value);
  } else if (e instanceof KeyboardEvent && e.key === 'Enter') {
    setMenuVisible(!menuVisibleInternal.value);
  }
};

// Move c-sub-navigation-item children into the "sub-item" slot —
// consumers write them inline.
const assignSubItemSlots = () => {
  if (!host) return;
  host.querySelectorAll('c-sub-navigation-item').forEach((item) => {
    item.setAttribute('slot', 'sub-item');
  });
};

onMounted(() => {
  if (!host) return;
  assignSubItemSlots();
  host.addEventListener('itemChange', handleItemChange);

  if (props.styles && containerRef.value) {
    Object.assign(containerRef.value.style, props.styles);
  }

  document.body.addEventListener('click', onDocEvent);
  document.body.addEventListener('keyup', onDocEvent);

  // Desktop mode is reflected as a host ATTRIBUTE (`data-desktop`), not a host
  // class: Vue patches a consumer's `class` binding on the custom element
  // wholesale (including once during hydration), which silently wiped an
  // imperatively-added class and left the drawer `display:contents` on
  // desktop. An attribute the consumer never binds survives those patches.
  watchEffect(() => {
    host.toggleAttribute('data-desktop', !props.mobile);
  });
});

onBeforeUnmount(() => {
  document.body.removeEventListener('click', onDocEvent);
  document.body.removeEventListener('keyup', onDocEvent);
});
</script>

<!--
  Escape-hatch CSS: only constructs Tailwind utilities cannot
  express. The drawer layout (content/nav/wrapper/bottom/burger) lives in the
  `tv` config above. What remains here:
    - The host box and its `[data-desktop]` / `.autoheight` host states —
      utilities can't target `:host`, and these carry the desktop
      background/flex/min-width and the standalone viewport-high state. Desktop
      mode is a data attribute (not a class) so a consumer's `class` patch
      can't wipe it — see the watchEffect above. The global
      `:host{display:contents}` is overridden per state (the per-type sheet is
      adopted after the shared sheet, so it wins).
    - The `.c-overlay` mobile backdrop and its fade-in `@keyframes`.
    - `::slotted(...)` `display:contents` for projected nav items.
  Authored against global design tokens only.
-->
<style>
/* The standalone viewport-high drawer (the docs shell pins it under its own
   toolbar). The item list inside scrolls, so the host itself never overflows;
   the overflow declarations stay as a guard for content that escapes the list.
   `dvh`, not `vh`: on a phone the drawer must fit the visible viewport while
   the browser chrome is expanded. Inside c-main this height is overridden by
   the layout's own pinned height (outer tree context wins over `:host`). */
:host(.autoheight) {
  height: calc(100dvh - var(--spacing-toolbar));
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
}

:host([data-desktop]) {
  background-color: var(--c-nav-surface);
  display: flex;
  min-width: clamp(300px, 20vw, 340px);
}

.c-overlay {
  background: color-mix(in srgb, var(--c-scrim) 50%, transparent);
  backdrop-filter: blur(4px);
  inset: 0;
  position: fixed;
  z-index: 998;
}

@keyframes c-side-nav-fade-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.c-fade-in {
  animation-duration: 0.5s;
  animation-iteration-count: 1;
  animation-name: c-side-nav-fade-in;
  z-index: 997;
}

::slotted(c-side-navigation-item),
::slotted(c-sub-navigation-item) {
  display: contents;
}
</style>
