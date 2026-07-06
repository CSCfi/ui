<template>
  <div :class="ui.content()" part="root">
    <nav ref="containerRef" :class="ui.nav()" part="nav" role="menubar">
      <div v-if="mobile" :class="ui.burger()">
        <c-icon-button inverted text @click="closeMenu">
          <span :class="ui.srOnly()">Close sidemenu</span>

          <c-icon :path="arrowRight" />
        </c-icon-button>
      </div>

      <div :class="ui.wrapper()">
        <slot />

        <div :class="ui.spacer()" />

        <slot name="bottom" />
      </div>
    </nav>
  </div>

  <div
    v-if="menuVisibleInternal && mobile"
    class="c-overlay c-fade-in"
    @click="closeMenu"
  />
</template>

<script setup lang="ts">
/**
 * @slot default - Default slot
 * @slot bottom - Place items at the bottom
 *
 * @csspart root - The outer drawer container
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

import { useHostEmit } from '../../shared/useHostEmit';

/** Events dispatched by `<c-side-navigation>`. */
interface CSideNavigationEvents {
  /**
   * Fired when the drawer is closed from within (the mobile close button or
   * the backdrop overlay), carrying the new visibility (`false`).
   * Named `change:menu-visible`, not `update:menuVisible`: Vue's runtime
   * silently drops `onUpdate:*` listeners on custom elements
   * (`isModelListener`), so a template `@update:menu-visible` would never be
   * attached (ADR-0017).
   */
  'change:menu-visible': boolean;
}

// Multi-root template (fragment) + we write to the host below — keep
// fallthrough attrs on the host element instead of tripping the "renders
// fragment" warning.
defineOptions({ inheritAttrs: false });

/**
 * Styling lives in this `tailwind-variants` config (ADR-0004): each visual
 * region is a slot and the `mobile` variant replaces the
 * `.c-side-navigation__content--mobile/--desktop` and `--mobile` wrapper
 * cascades. The per-component `--c-*` indirection vars are dropped in favour of
 * the semantic design tokens (ADR-0010): the drawer is the themed `nav-surface`
 * role (brand primary in light, a dark neutral panel in dark, so it adapts to
 * the theme). Consumer customization is via `::part()` (ADR-0006).
 *
 * The host box itself (the `.desktop` / `.autoheight` host states, which carry
 * background/flex/min-width and can't be expressed as utilities on the host),
 * the `.c-overlay` backdrop + its fade-in `@keyframes`, and the
 * `::slotted(...)` `display:contents` rule remain in the escape-hatch <style>
 * below (ADR-0007).
 */
const sideNavigation = tv({
  compoundVariants: [
    // Mobile drawer slides off-screen when hidden.
    { class: { content: 'translate-x-full' }, hidden: true, mobile: true },
    // Mobile nav drops the top padding / min-height (original
    // `.c-side-navigation__content--mobile > nav`).
    { class: { nav: 'min-h-[auto] pt-0' }, mobile: true },
  ],
  defaultVariants: {
    hidden: false,
    mobile: false,
  },
  slots: {
    burger: 'flex justify-end px-4 py-2',
    // The outer drawer container.
    content: 'flex flex-col flex-[1_2_260px] w-80',
    nav: 'relative flex flex-col flex-nowrap flex-1 gap-1 min-h-fit max-h-full w-full overflow-y-auto p-6 z-[8] bg-nav-surface transition-transform duration-300 ease-[ease]',
    spacer: 'flex-1 mb-2',
    srOnly:
      'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0 [clip:rect(0_0_0_0)]',
    wrapper: 'flex flex-col shrink-0 min-h-full gap-px',
  },
  variants: {
    hidden: {
      true: {},
    },
    mobile: {
      true: {
        content:
          'h-screen max-w-80 overflow-y-scroll fixed right-0 top-0 z-[999] transition-transform duration-200 ease-standard translate-x-0',
        wrapper: 'min-h-[calc(100%-60px)]',
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

  host.classList.toggle('desktop', !props.mobile);

  document.body.addEventListener('click', onDocEvent);
  document.body.addEventListener('keyup', onDocEvent);

  watchEffect(() => {
    host.classList.toggle('desktop', !props.mobile);
  });
});

onBeforeUnmount(() => {
  document.body.removeEventListener('click', onDocEvent);
  document.body.removeEventListener('keyup', onDocEvent);
});
</script>

<!--
  Escape-hatch CSS (ADR-0007): only constructs Tailwind utilities cannot
  express. The drawer layout (content/nav/wrapper/burger) lives in the `tv`
  config above. What remains here:
    - The host box and its `.desktop` / `.autoheight` host states — utilities
      can't target `:host`, and these carry the desktop background/flex/min-width
      and the autoheight scroll container. The global `:host{display:contents}`
      is overridden per state (the per-type sheet is adopted after the shared
      sheet, so it wins).
    - The `.c-overlay` mobile backdrop and its fade-in `@keyframes`.
    - `::slotted(...)` `display:contents` for projected nav items.
  Authored against global design tokens only.
-->
<style>
:host(.autoheight) {
  height: calc(100vh - 60px);
  overflow-y: auto;
  overflow-x: hidden;
}

:host(.desktop) {
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
