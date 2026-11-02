<template>
  <div :class="ui.root()">
    <!-- A link with an `href`, else a button. -->
    <component
      :is="href ? 'a' : 'button'"
      :aria-current="active ? 'page' : undefined"
      :class="ui.item()"
      :href="href || undefined"
      :tabindex="collapsed ? -1 : undefined"
      :target="href && target ? target : undefined"
      :type="href ? undefined : 'button'"
      part="root"
    >
      <span :class="ui.content()" part="content">
        <span :class="ui.slot()">
          <slot />
        </span>
      </span>

      <c-loader :hide="!loading" :size="32" style="pointer-events: none" />
    </component>
  </div>
</template>

<script setup lang="ts">
/**
 * @slot default - The visible content of the navigation item
 *
 * @csspart root - The focusable menu-item row carrying the hover/active styling and the leading indicator
 * @csspart content - Wrapper around the slotted content inside the row
 */
import { tv } from 'tailwind-variants';
import { computed, onMounted, ref, useHost, watchEffect } from 'vue';

import { useHostEmit } from '../../shared/useHostEmit';
import { useIdReferences } from '../../shared/useIdReferences';

/**
 * Styling lives in this `tailwind-variants` config: each visual
 * region is a slot, and the `active` / `subLevel` variants replace the
 * `:host(.active)` and `:host(.c-sub-navigation-item--sub-level)` selector
 * cascades. The per-component `--c-*` indirection vars are dropped in favour of
 * the global design tokens. Consumer customization is via `::part()`;
 * there is no `override` prop.
 *
 * The keyboard focus ring and the `::slotted(span)` rule (consumer light-DOM
 * children) remain in the escape-hatch <style> below. tabindex/role/
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
  ],
  defaultVariants: {
    active: false,
    subLevel: false,
  },
  slots: {
    content:
      'flex items-center overflow-hidden text-ellipsis whitespace-nowrap',
    // `hover:bg-*` lives in `active: { false }`, not here: the active wash
    // must win over hover, and a base `hover:bg-*` and the active variant's
    // `bg-*` don't conflict under tailwind-merge, so both would apply. The
    // row sits inside the active parent's `nav-active` pill, so its ink and
    // its states are that pill's — the text and the leading indicator bar in
    // `on-nav-active`, hover a wash of it, and the active fill the nav
    // family's own `nav-sub-active` role: an opaque white pill in light mode,
    // a translucent `on-nav-active` wash in dark (ADR-0052). Page roles
    // (`surface-raised`, the primary tint) read as a hole punched into the
    // drawer in dark mode.
    item: 'relative mx-2 flex w-[calc(100%-1rem)] cursor-pointer items-center overflow-hidden rounded-csc-md bg-transparent px-0 pl-[34px] leading-[46px] font-normal text-on-nav-active transition-colors duration-200 ease-in outline-none select-none before:absolute before:top-0 before:left-0 before:h-full before:w-2 before:[transform:translateZ(0)_translateX(-8px)] before:bg-on-nav-active before:transition-transform before:duration-200 before:ease-in-out before:content-[""]',
    root: 'py-0.5',
    slot: 'overflow-hidden text-ellipsis whitespace-nowrap',
  },
  variants: {
    active: {
      // Only a non-active item reacts to hover (active bg must win).
      false: { item: 'hover:bg-on-nav-active/10' },
      true: {
        item: 'bg-nav-sub-active',
        // reveal the leading indicator bar
      },
    },
    // A 3rd-level item (nested inside an active sub-item) paints the same
    // fill; in dark mode the translucent wash composites over the parent's
    // and reads as a distinct level by itself. The variant is kept as the
    // hook for anything that has to differ later.
    subLevel: { true: { item: '' } },
  },
});

/** Events dispatched by `<c-sub-navigation-item>`. */
interface CSubNavigationItemEvents {
  /**
   * Fired when the item is activated (click or Enter), carrying its `value`;
   * bubbles out of the navigation, as `c-side-navigation-item`'s does.
   */
  select: { value: string | undefined };
}

interface CSubNavigationItemProps {
  /**
   * Mark the sub-item as the current page (`aria-current="page"`); set `active`
   * on its parent item too, so the parent is expanded.
   */
  active?: boolean;

  /**
   * Whether the item sits under a collapsed `<c-side-navigation-item>`,
   * which sets it so hidden items are not Tab-reachable.
   *
   * @internal
   */
  collapsed?: boolean;

  /**
   * URL that makes the sub-item a real link; without it the sub-item is a
   * button.
   *
   * @freeform any URL
   */
  href?: string;

  /**
   * Cover the sub-item with a loading overlay: a translucent scrim and a
   * spinner.
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

const props = withDefaults(defineProps<CSubNavigationItemProps>(), {
  active: false,
  collapsed: false,
  href: '',
  loading: false,
  target: '',
  value: undefined,
});

const host = useHost();

const subLevel = ref(false);

const ui = computed(() =>
  subNavigationItem({ active: props.active, subLevel: subLevel.value }),
);

const emit = useHostEmit<CSubNavigationItemEvents>();

// The item is a native link or button: Enter (and Space on a button)
// activates it with a click, and a link navigates by itself.
const redirect = (event: Event) => {
  // Its parent item must not take the click for its own.
  event.stopPropagation();
  // c-side-navigation hears it and closes its drawer.
  emit('select', { value: props.value }, { bubbles: true, composed: true });
};

onMounted(() => {
  if (!host) return;
  // role/tabindex/aria-current + the focus ring live on the rendered
  // [part=root] box (see template), not the `display:contents` host — a
  // display:contents element is focusable by neither Tab nor .focus().
  // Listeners stay on the host; events bubble through it normally.
  host.addEventListener('click', redirect);
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

// The page's id references on the element reach the element carrying its role.
useIdReferences('a, button');
</script>

<!--
  Escape-hatch CSS: only constructs Tailwind utilities cannot
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
  /* The row's own ink (ADR-0052): `primary` fell to 2.3:1 on the dark
     pill. */
  outline: 2px solid currentColor;
  outline-offset: -2px;
}

::slotted(span) {
  margin-right: 8px;
  font-size: 20px;
  line-height: 1;
}
</style>
