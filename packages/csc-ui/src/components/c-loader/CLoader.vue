<template>
  <div ref="rootRef" :class="ui.root({ active })" part="root">
    <div :class="ui.inner({ active })">
      <!-- color="currentColor" so the spinner inherits the loader's text
           colour (text-primary-600 / any override) rather than the spinner's
           own primary-600 prop default. -->
      <c-spinner :size :width color="currentColor" />
      <!-- The content-reveal animation (max-height grow, delayed by
           `content-delay`) is gated on `active` so it (re)starts each time the
           loader is shown. Without this it would run once when the element
           first renders — which, now the loader stays mounted and is toggled
           via `hide`, means at page load, leaving `content-delay` with no
           visible effect. -->
      <div
        v-show="hasSlotContent"
        :class="[ui.content(), { 'c-loader-fadein': active }]"
        :style="{
          animationDelay: `${contentDelay}ms`,
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
/**
 * @slot default - Message text revealed below the spinner after `content-delay`
 *
 * @csspart root - The overlay element covering the containing element (scrim, fade transition)
 * @csspart content - The message wrapper anchored below the spinner
 *
 * @seeded from csc-ui — verify
 */
import { tv } from 'tailwind-variants';
import { computed, onMounted, ref, useTemplateRef, watchEffect } from 'vue';

import { useHasSlot } from '../../shared/useHasSlot';

/**
 * Styling lives in this `tailwind-variants` config; the old
 * `--_c-loader-*` indirection layer is dropped and authored directly against
 * the design tokens. Customization is via `::part()`.
 *
 * The box lives on an inner `root` element (host stays `display:contents`),
 * positioned `absolute inset-0` over the parent container it overlays. The
 * `active` variant replaces the JS-toggled `:host(.c-loader--active)` state;
 * JS still defers activation by one frame so the opacity/scale transition
 * plays on first appearance.
 *
 * COLOUR CONTRACT (child primitive): the child `<c-spinner>` is given
 * `color="currentColor"` so the loader's primary text colour (or any inherited
 * colour) cascades into it. (The spinner's own prop default is the primary role,
 * so passing currentColor is what re-opens inheritance here.) The removed
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
    // is the muted on-surface role.
    content:
      'absolute inset-x-0 block text-center text-sm leading-6 font-medium text-on-surface-muted opacity-0',
    // `relative` so the absolutely-positioned content anchors to it.
    inner:
      'relative flex h-full w-full scale-50 flex-col items-center justify-center py-4 transition-transform duration-300 ease-in-out',
    // Background is the surface role at 80% (a theme-aware scrim over the
    // overlaid container; was an opaque-ish white veil).
    // `visibility` is in the transition list (alongside opacity/transform) so
    // the LEAVE is smooth: CSS `visibility` uses its special interpolation —
    // when either endpoint is `visible` it stays visible for the whole duration
    // and only flips to `hidden` at the end. Without it, `invisible` applied
    // instantly on leave and cut off the opacity/scale fade-out.
    root: 'invisible absolute inset-0 z-[6] w-full rounded-[inherit] bg-surface/80 text-primary opacity-0 transition-[opacity,transform,visibility] duration-300 ease-in-out',
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
  /**
   * Delay, in milliseconds, before the slotted message fades in once the
   * loader shows.
   */
  contentDelay?: number;

  /**
   * Hide the loader. Toggling it fades the loader in and out, so keep the
   * element mounted and bind `hide` rather than using `v-if`, which would
   * unmount it and skip the fade-out.
   */
  hide?: boolean;

  /**
   * Size of the loader
   *
   * @seeded from csc-ui — verify
   */
  size?: number;

  /**
   * Width of the loader
   *
   * @seeded from csc-ui — verify
   */
  width?: number;
}

const props = withDefaults(defineProps<CLoaderProps>(), {
  contentDelay: 0,
  hide: false,
  size: 48,
  width: 4,
});

const rootRef = useTemplateRef<HTMLElement>('rootRef');

const hasSlotContent = useHasSlot(rootRef, '');

// Match Stencil's deferred activation: start hidden, then flip `active` on the
// next frame so the opacity/scale/visibility transition plays on appearance and
// on every toggle instead of the loader snapping in/out.
const active = ref(false);
onMounted(() => {
  watchEffect(() => {
    const wantActive = !props.hide;
    requestAnimationFrame(() => {
      active.value = wantActive;
    });
  });
});

const ui = computed(() => loader());
</script>

<!--
  Escape-hatch CSS: the message appear @keyframes + the rule that
  applies it. Keyframes (vs a transition) are used so the reveal is a one-shot
  that restarts each time the `c-loader-fadein` class is (re)added on show, and
  so it honours the `animation-delay` set inline from `content-delay`. A gentle
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

/* Reduced motion (ADR-0057): the message keeps its `content-delay` and fade,
   but no longer rises into place. */
@media (prefers-reduced-motion: reduce) {
  .c-loader-fadein {
    animation-name: c-loader-fadein-still;
  }
}

@keyframes c-loader-fadein-still {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
