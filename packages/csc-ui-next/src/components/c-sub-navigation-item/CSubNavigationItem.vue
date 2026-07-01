<template>
  <div :class="ui.root()">
    <div
      :class="ui.item()"
      part="root"
      role="menuitem"
      :tabindex="focusable ? 0 : -1"
      :aria-current="active ? 'page' : undefined"
    >
      <div :class="ui.content()" part="content">
        <div :class="ui.slot()">
          <slot />
        </div>

        <span v-if="active" :class="ui.srOnly()">, Current page</span>
      </div>

      <c-loader :size="32" :visible="loading" style="pointer-events: none" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { tv } from 'tailwind-variants';
import { computed, onMounted, ref, useHost, watchEffect } from 'vue';

/**
 * Styling lives in this `tailwind-variants` config (ADR-0004): each visual
 * region is a slot, and the `active` / `subLevel` variants replace the
 * `:host(.active)` and `:host(.c-sub-navigation-item--sub-level)` selector
 * cascades. The per-component `--c-*` indirection vars are dropped in favour of
 * the global design tokens. Consumer customization is via `::part()` (ADR-0006);
 * there is no `override` prop.
 *
 * The keyboard focus ring and the `::slotted(span)` rule (consumer light-DOM
 * children) remain in the escape-hatch <style> below (ADR-0007). tabindex/role/
 * aria live on the rendered `[part=root]` box, not the host: a `display:contents`
 * host is unfocusable, so a host-level `:focus-visible` ring never fired.
 */
const subNavigationItem = tv({
  compoundVariants: [
    // active: slide the ::before indicator into place.
    {
      active: true,
      class: { item: 'before:[transform:translateZ(0)_translateX(0)]' },
    },
    // 3rd-level active background is primary-subtle-hover (not the raised
    // surface) so it reads as a distinct level against the surface-raised
    // sub-item parent. Declared after the `active` variant's `bg-surface-raised`
    // so tailwind-merge lets it win.
    {
      active: true,
      class: { item: 'bg-primary-subtle-hover' },
      subLevel: true,
    },
  ],
  defaultVariants: {
    active: false,
    subLevel: false,
  },
  slots: {
    content:
      'flex items-center overflow-hidden whitespace-nowrap text-ellipsis',
    // `hover:bg-*` lives in `active: { false }`, not here: the original cascade
    // lets the active background (the raised surface) win over hover, but a base
    // `hover:bg-*` and the active variant's `bg-surface-raised` don't conflict
    // under tailwind-merge, so both would apply and hover would wrongly override
    // the active bg. `hover:text-primary` stays unguarded (the original recolours
    // the text on hover regardless of active state). Resting text is
    // `on-primary-subtle` — the foreground for the active parent's primary-subtle
    // region these items sit in.
    item: 'flex items-center cursor-pointer font-normal leading-[46px] rounded-csc-md mx-2 px-0 pl-[34px] relative overflow-hidden select-none outline-none transition-colors duration-200 ease-in bg-transparent text-on-primary-subtle hover:text-primary before:content-[""] before:absolute before:top-0 before:left-0 before:h-full before:w-2 before:bg-primary before:[transform:translateZ(0)_translateX(-8px)] before:transition-transform before:duration-200 before:ease-in-out',
    root: 'py-0.5',
    slot: 'overflow-hidden whitespace-nowrap text-ellipsis',
    srOnly:
      'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0 [clip:rect(0_0_0_0)]',
  },
  variants: {
    active: {
      // Only a non-active item reacts to hover (active bg must win).
      false: { item: 'hover:bg-primary-subtle-hover' },
      true: {
        item: 'bg-surface-raised',
        // reveal the leading indicator bar
      },
    },
    // The sub-level palette (a 3rd-level item nested inside another
    // sub-navigation-item) differs from the 2nd-level base in ONE place: it
    // remaps its *active* background to `primary-subtle-hover` (vs the base's
    // `surface-raised`). Non-active bg stays transparent and hover stays
    // `primary-subtle-hover`, so the active-state override below is the whole
    // story. Without it an active 3rd-level item renders as the raised surface —
    // indistinguishable from its surface-raised parent box.
    subLevel: { true: { item: '' } },
  },
});

interface CSubNavigationItemProps {
  active?: boolean;
  focusable?: boolean;
  href?: string;
  loading?: boolean;
  target?: string;
}

const props = withDefaults(defineProps<CSubNavigationItemProps>(), {
  active: false,
  focusable: false,
  href: '',
  loading: false,
  target: '',
});

const host = useHost();

const subLevel = ref(false);

const ui = computed(() =>
  subNavigationItem({ active: props.active, subLevel: subLevel.value }),
);

const redirect = (event: Event) => {
  if (event instanceof KeyboardEvent && event.key !== 'Enter') return;
  event.stopPropagation();

  // Closing the side menu is a side-effect of any sub-item navigation —
  // matches the Stencil behaviour of dismissing the drawer on click.
  const sidenav = document.querySelector('c-side-navigation') as
    | ({ menuVisible: boolean } & HTMLElement)
    | null;

  if (sidenav) sidenav.menuVisible = false;

  if (props.href) {
    if (props.target) window.open(props.href, props.target);
    else window.location.href = props.href;
  }
};

onMounted(() => {
  if (!host) return;
  // role/tabindex/aria-current + the focus ring live on the rendered
  // [part=root] box (see template), not the `display:contents` host — a
  // display:contents element is focusable by neither Tab nor .focus().
  // Listeners stay on the host; events bubble through it normally.
  host.addEventListener('click', redirect);
  host.addEventListener('keydown', redirect);
  watchEffect(() => {
    host.classList.toggle('active', props.active);
  });

  // The `sub-level` palette is toggled by the parent c-side-navigation-item
  // adding `c-sub-navigation-item--sub-level` to nested children. Reflect that
  // class into the `subLevel` tv variant reactively.
  subLevel.value = host.classList.contains('c-sub-navigation-item--sub-level');

  const observer = new MutationObserver(() => {
    subLevel.value = host.classList.contains(
      'c-sub-navigation-item--sub-level',
    );
  });
  observer.observe(host, { attributeFilter: ['class'], attributes: true });
});
</script>

<!--
  Escape-hatch CSS (ADR-0007): only constructs Tailwind utilities cannot
  express. The item box, hover/active states and the leading indicator
  (`::before`) live in the `tv` config above. What remains here:
    - The keyboard focus ring: `[part='root']:focus-visible` with a negative
      outline-offset (inset), so it isn't clipped by the parent row's overflow.
    - `::slotted(span)` sizing of consumer light-DOM children.
    - Layout of the projected `<slot>` element (a shadow-tree node Vue renders
      without a class hook).
  Authored against global design tokens only.
-->
<style>
slot {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* Keyboard focus ring. tabindex/role live on the rendered [part=root] box (the
   `:host` is display:contents and is unfocusable). Negative outline-offset
   draws the ring inside the box so it isn't clipped by the parent row's
   `overflow:hidden`. */
[part='root']:focus-visible {
  outline: 2px var(--c-primary) solid;
  outline-offset: -2px;
}

::slotted(span) {
  margin-right: 8px;
  font-size: 20px;
  line-height: 1;
}
</style>
