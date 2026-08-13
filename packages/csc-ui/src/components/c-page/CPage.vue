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
 * @csspart scroll-indicator - The fixed progress bar at the top of the viewport tracking scroll position
 * @csspart container - The max-width content wrapper around the default slot
 *
 * @seeded from csc-ui — verify
 */
import { tv } from 'tailwind-variants';
import {
  computed,
  onBeforeUnmount,
  onMounted,
  useHost,
  useTemplateRef,
} from 'vue';

// Multi-root template (fragment) — keep consumer fallthrough attrs
// (class/style) on the host element instead of tripping the "renders
// fragment" warning.
defineOptions({ inheritAttrs: false });

/**
 * Styling lives in this `tailwind-variants` config: the inner
 * `scrollIndicator` and `container` regions are tv slots/parts. The host
 * itself must be the scrollable CSS grid (its slotted children are direct grid
 * items), so the host layout stays in the escape-hatch `<style>` below.
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

const host = useHost();

const scrollRef = useTemplateRef<HTMLElement>('scrollRef');

// Replicates Stencil's onscroll handler: paints a 4px progress bar at
// the top of the viewport whose width tracks how far down the page is
// scrolled. The host element is the scrollable container itself
// (overflow-y: auto in :host).
const onScroll = () => {
  if (!props.scrollIndicator || !host || !scrollRef.value) return;

  const scrolled =
    (host.scrollTop / (host.scrollHeight - host.clientHeight)) * 100;
  scrollRef.value.style.width = `${scrolled}%`;
};

onMounted(() => {
  host?.addEventListener('scroll', onScroll);
});
onBeforeUnmount(() => {
  host?.removeEventListener('scroll', onScroll);
});
</script>

<!--
  Escape-hatch CSS: this component has no inner `root` element — the
  slotted children are the host's direct grid items, so the host itself MUST be
  the scrollable CSS grid container. Utilities cannot target a shadow host, so
  the host layout lives here. This `:host` deliberately overrides the global
  `:host{display:contents}` (the per-type sheet wins).
-->
<style>
:host {
  display: grid;
  height: calc(100lvh - 60px);
  grid-template-rows: 1fr auto;
  grid-template-columns: 1fr;
  width: 100%;
  overflow-y: auto;
  scroll-behavior: smooth;
  position: relative;
  place-items: start start;
}
</style>
