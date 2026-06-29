<template>
  <div ref="rootRef" :class="ui.root({ active })" part="root">
    <div :class="ui.inner({ active })">
      <!-- color="currentColor" so the spinner inherits the loader's text
           colour (text-primary-600 / any override) rather than the spinner's
           own primary-600 prop default. -->
      <c-spinner :size :width color="currentColor" />
      <!-- The content-reveal animation (max-height grow, delayed by
           `contentdelay`) is gated on `active` so it (re)starts each time the
           loader is shown. Without this it would run once when the element
           first renders — which, now the loader stays mounted and is toggled
           via `visible`, means at page load, leaving `contentdelay` with no
           visible effect. -->
      <div
        v-show="hasSlotContent"
        :class="[ui.content(), { 'c-loader-fadein': active }]"
        :style="{
          animationDelay: `${contentdelay}s`,
          top: `calc(50% + ${size / 2 + 8}px)`,
        }"
        part="content"
      >
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { tv } from 'tailwind-variants';
import {
  computed,
  onMounted,
  ref,
  useTemplateRef,
  watch,
  watchEffect,
} from 'vue';

import { useHasSlot } from '../../shared/useHasSlot';

/**
 * Styling lives in this `tailwind-variants` config (ADR-0004); the old
 * `--_c-loader-*` indirection layer is dropped and authored directly against
 * the design tokens. Customization is via `::part()` (ADR-0006).
 *
 * The box lives on an inner `root` element (host stays `display:contents`),
 * positioned `absolute inset-0` over the parent container it overlays. The
 * `active` variant replaces the JS-toggled `:host(.c-loader--active)` state;
 * JS still defers activation by one frame so the opacity/scale transition
 * plays on first appearance.
 *
 * COLOUR CONTRACT (child primitive): the child `<c-spinner>` is given
 * `color="currentColor"` so the loader's `text-primary-600` (or any inherited
 * colour) cascades into it. (The spinner's own prop default is primary-600, so
 * passing currentColor is what re-opens inheritance here.) The removed
 * `--c-loader-color` / `--c-spinner-color` override vars are NOT reintroduced.
 */
const loader = tv({
  defaultVariants: {
    active: false,
  },
  slots: {
    // The message is taken OUT of flow (`absolute`) and anchored just below the
    // centred spinner (the inline `top` offsets it by half the spinner + gap),
    // so revealing it does NOT push the spinner up — only the spinner
    // participates in the flex centring. Hidden by default (`opacity-0`); the
    // `c-loader-fadein` animation (gated on `active`) fades it in. Text colour
    // was var(--c-text-system); no text-system utility exists.
    content:
      'block absolute inset-x-0 opacity-0 text-center text-sm leading-6 font-medium text-[var(--c-text-system)]',
    // `relative` so the absolutely-positioned content anchors to it.
    inner:
      'relative flex flex-col items-center justify-center h-full w-full scale-50 transition-transform duration-300 ease-in-out py-4',
    // Background was rgba(var(--c-white-rgb), 0.8) → bg-white/80.
    // `visibility` is in the transition list (alongside opacity/transform) so
    // the LEAVE is smooth: CSS `visibility` uses its special interpolation —
    // when either endpoint is `visible` it stays visible for the whole duration
    // and only flips to `hidden` at the end. Without it, `invisible` applied
    // instantly on leave and cut off the opacity/scale fade-out.
    root: 'absolute inset-0 z-[6] w-full bg-white/80 rounded-[inherit] invisible opacity-0 transition-[opacity,transform,visibility] duration-300 ease-in-out text-primary-600',
  },
  variants: {
    active: {
      true: {
        inner: 'scale-100',
        root: 'visible opacity-100',
      },
    },
  },
});

interface CLoaderProps {
  contentdelay?: number;
  size?: number;
  /**
   * Whether the loader is shown. Toggling this drives the fade-in / smooth
   * fade-out — keep the element mounted and bind `visible` rather than using
   * `v-if`, which would unmount it and skip the leave transition.
   *
   * For imperative control (non-Vue consumers holding an element ref) the
   * element also exposes `show()` / `hide()` methods. The prop is named
   * `visible` (not `show`) so it doesn't collide with the `show()` method —
   * mirroring native `<dialog>` (`open` property + `show()`/`close()` methods).
   *
   * NOTE: this replaces the original Stencil `hide` prop with its inverse, so
   * the default (`true` = shown) preserves the original default behaviour.
   */
  visible?: boolean;
  width?: number;
}

const props = withDefaults(defineProps<CLoaderProps>(), {
  contentdelay: 0,
  size: 48,
  visible: true,
  width: 4,
});

const rootRef = useTemplateRef<HTMLElement>('rootRef');

const hasSlotContent = useHasSlot(rootRef, '');

// Visibility source of truth: initialised from the `visible` prop and kept in
// sync with it, but also settable imperatively via the exposed show()/hide()
// methods (for non-Vue consumers holding an element ref). A later prop change
// wins, as expected for a controlled prop.
const isVisible = ref(props.visible);
watch(
  () => props.visible,
  (v) => {
    isVisible.value = v;
  },
);

// Match Stencil's deferred activation: start hidden, then flip `active` on the
// next frame so the opacity/scale/visibility transition plays on appearance and
// on every toggle instead of the loader snapping in/out.
const active = ref(false);
onMounted(() => {
  watchEffect(() => {
    const wantActive = isVisible.value;
    requestAnimationFrame(() => {
      active.value = wantActive;
    });
  });
});

/** Imperatively show the loader (plays the fade-in). */
const show = () => {
  isVisible.value = true;
};

/** Imperatively hide the loader (plays the smooth fade-out). */
const hide = () => {
  isVisible.value = false;
};

defineExpose({ hide, show });

const ui = computed(() => loader());
</script>

<!--
  Escape-hatch CSS (ADR-0007): the message appear @keyframes + the rule that
  applies it. Keyframes (vs a transition) are used so the reveal is a one-shot
  that restarts each time the `c-loader-fadein` class is (re)added on show, and
  so it honours the `animation-delay` set inline from `contentdelay`. A gentle
  opacity + rise (ease-out) reads smoother than the old linear max-height clip;
  max-height is no longer needed since the message is positioned out of flow.
  The static slot styling lives in the `tv` config above.
-->
<style>
.c-loader-fadein {
  animation: c-loader-fadein 0.45s cubic-bezier(0.25, 0.8, 0.5, 1) forwards;
}

@keyframes c-loader-fadein {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
