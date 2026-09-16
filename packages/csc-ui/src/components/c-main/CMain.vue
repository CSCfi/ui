<template>
  <main :class="ui.root()" part="root">
    <slot :class="ui.banner()" name="banner" />

    <slot ref="slotRef" @slotchange="syncToolbar" />
  </main>
</template>

<script setup lang="ts">
/**
 * @slot default - Contents of the page: the toolbar, side navigation and page
 * @slot banner - A full-width message strip above the toolbar; it scrolls away with the page
 *
 * @csspart root - The main element carrying the page canvas and the dashboard grid layout
 *
 * @cssprop --c-main-viewport-height - Height of the scroll viewport the layout pins against (default `100dvh`); a bounded shell with its own scrollbar sets it to its box height
 *
 * @seeded from csc-ui — verify
 */
import { tv } from 'tailwind-variants';
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue';

import { coerceBoolean } from '../../shared/coerceBoolean';

/**
 * Styling lives entirely in this `tailwind-variants` config. The host stays
 * `display:contents` (global); the inner `main` element is the styled `root`
 * box and carries the canvas background, text colour and the layout. It is at
 * least a viewport tall and grows with its content, so the document is the
 * scroll container (ADR-0051): the toolbar pins itself, and this component pins
 * the desktop side navigation (escape-hatch CSS below).
 *
 * `disableLayout` is a variant that swaps the dashboard grid — banner row,
 * toolbar row, then side navigation beside the page — for a plain flex column.
 * The banner `<slot>` is styled as a block so it is the grid item (slotted
 * hosts have no box); the toolbar's root claims its own area (see c-toolbar).
 * The grid's `::before` is a pseudo grid item behind the side navigation: the
 * pinned drawer is one pinned height tall and moves with the scroll, so this
 * paints the drawer surface for the full column height. It has no intrinsic
 * width, so without a desktop drawer the `auto` column stays empty and nothing
 * shows.
 *
 * `staticToolbar` mirrors the slotted toolbar's mode (see the observer below)
 * into the private `--_nav-offset` custom property: the side navigation sticks
 * one toolbar height down beneath a pinned toolbar, or at the viewport top once
 * a `static` toolbar has scrolled away.
 *
 * The tinted page background and body text author against semantic tokens
 * (`surface-sunken` / `on-surface`) so they theme in dark mode.
 * `surface-sunken` is the recessed page-canvas role (the backdrop that raised
 * surfaces sit on); it is shared with the active root-level side-nav item so the
 * selection reads as contiguous with the page. Customization is via
 * `::part(root)`.
 */
const main = tv({
  defaultVariants: {
    disableLayout: false,
    staticToolbar: false,
  },
  slots: {
    // The slot element itself is the banner's box: slotted csc-ui hosts are
    // `display:contents`, so a grid area on them would be ignored.
    banner: 'block [grid-area:banner]',
    root: 'flex flex-col min-h-screen bg-surface-sunken text-on-surface',
  },
  variants: {
    disableLayout: {
      // Dashboard grid: banner and toolbar span the top rows, sidenav + page below.
      false: {
        root: "grid gap-0 [grid-template:'banner_banner'_auto_'toolbar_toolbar'_auto_'sidenav_page'_1fr_/_auto_1fr] before:content-[''] before:[grid-area:sidenav] before:bg-nav-surface",
      },
    },
    staticToolbar: {
      false: { root: '[--_nav-offset:var(--spacing-toolbar)]' },
      true: { root: '[--_nav-offset:0px]' },
    },
  },
});

interface CMainProps {
  /**
   * Disable the default dashboard layout
   *
   * @seeded from csc-ui — verify
   */
  disableLayout?: boolean;
}

const props = withDefaults(defineProps<CMainProps>(), {
  disableLayout: false,
});

const slotRef = useTemplateRef<HTMLSlotElement>('slotRef');

// The toolbar's mode decides where the pinned side navigation sticks: beneath
// a pinned toolbar, or at the viewport top once a `static` toolbar has scrolled
// away. `:host(:has(c-toolbar[static]))` would say that in CSS alone but does
// not match in Chromium, so the slotted toolbar's reflected `static` attribute
// is observed instead and fed to the `staticToolbar` variant. The attribute
// (not the property) is read on purpose: Vue reflects the prop to it, and a
// `"false"` string must count as pinned, exactly like `coerceBoolean`.
const staticToolbar = ref(false);

let observer: MutationObserver | null = null;

let observed: Element | null = null;

const readStatic = () => {
  const attr = observed?.getAttribute('static');

  staticToolbar.value = attr != null && coerceBoolean(attr);
};

// Re-acquire the toolbar whenever the default slot's assignment changes (a
// toolbar added, replaced or removed after mount).
const syncToolbar = () => {
  const bar =
    slotRef.value
      ?.assignedElements({ flatten: true })
      .find((el) => el.localName === 'c-toolbar') ?? null;

  if (bar !== observed) {
    observer?.disconnect();
    observed = bar;

    if (bar) {
      observer?.observe(bar, { attributeFilter: ['static'], attributes: true });
    }
  }

  readStatic();
};

onMounted(() => {
  observer = new MutationObserver(readStatic);
  syncToolbar();
});

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
  observed = null;
});

const ui = computed(() =>
  main({
    disableLayout: coerceBoolean(props.disableLayout),
    staticToolbar: staticToolbar.value,
  }),
);
</script>

<!--
  Escape-hatch CSS (ADR-0007): `::slotted(...)` styles consumer-provided
  light-DOM children, which Tailwind utilities cannot target. The inherited
  text colour, the dashboard grid-area placement of the slotted layout
  components and the pinning of the desktop side navigation live here; tokens
  and theme values only, no hardcoded sizes.
-->
<style>
::slotted(*) {
  color: var(--c-on-surface);
}

/*
 * Grid-area placement of the slotted layout components. The toolbar is absent
 * here on purpose: its host is `display:contents`, so c-toolbar's own root
 * claims the `toolbar` area; the banner slot is a box of its own (tv above).
 */
main ::slotted(c-page) {
  grid-area: page;
  /* disable-layout flex column: the page still fills the viewport so the
     footer slot sits at the bottom of a short page; inert in the grid. */
  flex: 1 1 auto;
}

main ::slotted(c-side-navigation) {
  grid-area: sidenav;
}

/*
 * The desktop drawer (c-side-navigation sets `data-desktop` itself) is pinned
 * beneath the toolbar, or at the viewport top when the toolbar is static
 * (`--_nav-offset`, set by the `staticToolbar` variant). `align-self: start`
 * stops the sticky box from stretching to the whole page row — a stretched
 * sticky item has nowhere to move. The height is exactly the pinned height, so
 * a short menu fills the column and the drawer's bottom slot sits at the
 * bottom edge; a long menu scrolls inside c-side-navigation's item list. This
 * overrides the 3.x `autoheight` host class (outer tree context wins over
 * `:host`), which is therefore inert inside the dashboard layout. The mobile
 * drawer carries no `data-desktop` and is untouched.
 */
main ::slotted(c-side-navigation[data-desktop]) {
  position: sticky;
  top: var(--_nav-offset);
  align-self: start;
  /* `--c-main-viewport-height`: the scrollport the layout pins against — the
     document by default (`dvh`, so the drawer fits the visible viewport while
     a phone's browser chrome is expanded); a bounded shell sets its own box
     height. */
  height: calc(var(--c-main-viewport-height, 100dvh) - var(--_nav-offset));
  /* Not a scroll container: the item list scrolls inside c-side-navigation,
     and the bottom slot's own sticky needs the document (or the bounded
     shell) as its nearest scrollport to reach the viewport's bottom edge
     while the banner and toolbar rows are still above the drawer. */
  overflow: visible;
}
</style>
