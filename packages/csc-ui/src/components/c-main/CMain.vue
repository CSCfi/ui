<template>
  <main :class="ui.root()" part="root">
    <slot :class="ui.banner()" name="banner" />

    <slot ref="slotRef" :class="ui.layout()" @slotchange="syncToolbar" />
  </main>
</template>

<script setup lang="ts">
/**
 * @slot default - Contents of the page: the toolbar, side navigation and page
 * @slot banner - A full-width message strip above the toolbar; it scrolls away with the page
 *
 * @csspart root - The shell box: it paints the page canvas and is at least a viewport tall; the dashboard grid is laid out inside it
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
 * box: the shell, a flex column carrying the canvas background and text colour,
 * at least a viewport tall and growing with its content, so the document is
 * the scroll container (ADR-0051). The toolbar pins itself; this component pins
 * the desktop side navigation (escape-hatch CSS below).
 *
 * Both `<slot>` elements are styled as boxes of their own, because slotted
 * csc-ui hosts are `display:contents` and have no box to place: the banner
 * slot is a block at the top of the column, and the default slot (`layout`) is
 * the **dashboard grid** — toolbar row, then side navigation beside the page —
 * filling the rest of the column. The toolbar's root claims its own area (see
 * c-toolbar). `disableLayout` makes the default slot boxless again, so the
 * shell's column flows through it.
 *
 * The grid's `::before` is a pseudo grid item behind the side navigation: the
 * pinned drawer is one pinned height tall and moves with the scroll, so this
 * paints the drawer surface for the full column height. It has no intrinsic
 * width, so without a desktop drawer the `auto` column stays empty and nothing
 * shows.
 *
 * The drawer's geometry is a set of private custom properties the `::slotted`
 * rule below reads. `staticToolbar` mirrors the slotted toolbar's mode (see the
 * observer below) into `--_nav-offset`: the side navigation sticks one toolbar
 * height down beneath a pinned toolbar, or at the viewport top once a `static`
 * toolbar has scrolled away. `--_drawer-height` is the pinned height (the
 * viewport minus that offset). `--_drawer-pull`, defined by the grid only, is
 * its negative: the drawer's margin box is zero-height, so the page alone
 * sizes the grid row and a page that fits the viewport never scrolls
 * (ADR-0051, 2026-09-22 amendment). The grid clips vertically to cut the
 * drawer's overhang below the shell, which would otherwise extend the
 * document — or a bounded shell's own scroller; `overflow-x` stays visible so
 * a wide page still scrolls the document.
 *
 * The tinted page background and body text author against semantic tokens
 * (`surface-sunken` / `on-surface`) so they theme in dark mode.
 * `surface-sunken` is the recessed page-canvas role (the backdrop that raised
 * surfaces sit on); it is shared with the active root-level side-nav item so the
 * selection reads as contiguous with the page. Customization is via
 * `::part(root)`; the grid box is internal and not a part.
 */
const main = tv({
  defaultVariants: {
    disableLayout: false,
    staticToolbar: false,
  },
  slots: {
    // The slot elements are the banner's and the grid's boxes: slotted csc-ui
    // hosts are `display:contents`, so a grid area on them would be ignored.
    banner: 'block',
    layout: '',
    root: 'flex flex-col min-h-screen bg-surface-sunken text-on-surface [--_drawer-height:calc(var(--c-main-viewport-height,100dvh)_-_var(--_nav-offset))]',
  },
  variants: {
    disableLayout: {
      // Dashboard grid: the toolbar spans the top row, sidenav + page below.
      false: {
        layout:
          "grid grow gap-0 overflow-y-clip [grid-template:'toolbar_toolbar'_auto_'sidenav_page'_1fr_/_auto_1fr] before:content-[''] before:[grid-area:sidenav] before:bg-nav-surface [--_drawer-pull:calc(-1_*_var(--_drawer-height))]",
      },
      // Plain column: the slot is boxless and the shell's column flows through.
      true: { layout: 'contents' },
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
 * claims the `toolbar` area; the banner and default slots are boxes of their
 * own (tv above).
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
 * sticky item has nowhere to move. The height is exactly the pinned height
 * (`--_drawer-height`), so a short menu fills the column and the drawer's
 * bottom slot sits at the bottom edge; a long menu scrolls inside
 * c-side-navigation's item list. This overrides the 3.x `autoheight` host
 * class (outer tree context wins over `:host`), which is therefore inert
 * inside the dashboard layout. The mobile drawer carries no `data-desktop` and
 * is untouched.
 *
 * At rest the drawer sits below the banner and toolbar rows, so a box one
 * pinned height tall overhangs the shell by their height — and, as an in-flow
 * grid item, would make its row and the document that much taller, so a page
 * that fits the viewport could scroll. `--_drawer-pull` (grid mode only) makes
 * the margin box zero-height: the drawer adds nothing to its row, the page
 * alone sizes the layout, and the grid clips the overhang. The sticky position
 * box is the margin box, so the drawer still pins until its row leaves the
 * viewport.
 */
main ::slotted(c-side-navigation[data-desktop]) {
  position: sticky;
  top: var(--_nav-offset);
  align-self: start;
  height: var(--_drawer-height);
  margin-bottom: var(--_drawer-pull, 0px);
  /* Not a scroll container: the item list scrolls inside c-side-navigation,
     and the bottom slot's own sticky needs the document (or the bounded
     shell) as its nearest scrollport to reach the viewport's bottom edge
     while the banner and toolbar rows are still above the drawer. */
  overflow: visible;
}
</style>
