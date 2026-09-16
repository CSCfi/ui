<template>
  <div
    v-if="scrollIndicator"
    ref="scrollRef"
    :class="ui.scrollIndicator()"
    part="scroll-indicator"
  />

  <div :class="ui.container()" part="container">
    <slot />
  </div>

  <slot name="footer" />
</template>

<script setup lang="ts">
/**
 * @slot default - Default slot
 * @slot footer - Footer slot
 *
 * @csspart scroll-indicator - The fixed progress bar at the top of the viewport tracking how far the document is scrolled
 * @csspart container - The max-width content wrapper around the default slot
 *
 * @seeded from csc-ui — verify
 */
import { tv } from 'tailwind-variants';
import { computed, onBeforeUnmount, onMounted, useTemplateRef } from 'vue';

// Multi-root template (fragment) — keep consumer fallthrough attrs
// (class/style) on the host element instead of tripping the "renders
// fragment" warning.
defineOptions({ inheritAttrs: false });

/**
 * Styling lives in this `tailwind-variants` config: the inner
 * `scrollIndicator` and `container` regions are tv slots/parts. The host
 * itself must be the CSS grid (its slotted children are direct grid items), so
 * the host layout stays in the escape-hatch `<style>` below.
 *
 * The page is a plain region of the dashboard layout: it grows with its
 * content and never scrolls on its own — the document does (ADR-0051). Inside
 * c-main it is stretched to fill the page row, so the footer slot sits at the
 * bottom of a short page.
 *
 * The per-component `--c-page-*` override vars are dropped: the
 * container authors `max-w-[1280px]` directly and the responsive padding uses
 * Tailwind's `sm:`/`md:` breakpoints (640px/768px) which match the original
 * media queries. Customization is via `::part()`.
 */
const page = tv({
  slots: {
    container: 'relative w-full h-full max-w-[1280px] p-3 sm:p-4 md:p-6',
    // Fixed 4px progress bar pinned to the top of the viewport.
    scrollIndicator: 'z-[9] fixed top-0 left-0 h-1 w-0 bg-primary',
  },
});

interface CPageProps {
  /**
   * Display scroll indicator
   *
   * @seeded from csc-ui — verify
   */
  scrollIndicator?: boolean;
}

const props = withDefaults(defineProps<CPageProps>(), {
  scrollIndicator: false,
});

const ui = computed(() => page());

const scrollRef = useTemplateRef<HTMLElement>('scrollRef');

// Paints a 4px progress bar at the top of the viewport whose width tracks how
// far the document is scrolled. The document is the scroll container (the host
// does not scroll), so the listener sits on the window.
const onScroll = () => {
  if (!props.scrollIndicator || !scrollRef.value) return;

  const scroller = document.scrollingElement;

  if (!scroller) return;

  const range = scroller.scrollHeight - scroller.clientHeight;

  const scrolled = range > 0 ? (scroller.scrollTop / range) * 100 : 0;

  scrollRef.value.style.width = `${scrolled}%`;
};

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true });
});
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll);
});
</script>

<!--
  Escape-hatch CSS: this component has no inner `root` element — the
  slotted children are the host's direct grid items, so the host itself MUST be
  the CSS grid container. Utilities cannot target a shadow host, so the host
  layout lives here. This `:host` deliberately overrides the global
  `:host{display:contents}` (the per-type sheet wins). No height and no
  overflow: the page grows with its content and the document scrolls.
-->
<style>
:host {
  display: grid;
  grid-template-rows: 1fr auto;
  grid-template-columns: 1fr;
  width: 100%;
  position: relative;
  place-items: start start;
}
</style>
