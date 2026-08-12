<template>
  <article ref="rootRef" :class="ui.root()" part="root">
    <svg v-if="!!src" height="0" width="0">
      <defs>
        <clipPath id="cLoginClipPath" clipPathUnits="objectBoundingBox">
          <path :d="path" />
        </clipPath>
      </defs>
    </svg>

    <div ref="cardRef" :class="ui.card()" part="card">
      <div v-if="!!src" :class="ui.image()" :style="imageStyle" part="image" />

      <div :class="ui.content()" part="content">
        <slot />
      </div>
    </div>
  </article>
</template>

<script lang="ts">
/**
 * CSS `mix-blend-mode` applied to the primary-coloured overlay drawn over
 * the background image when `overlay` is set.
 */
export type CLoginCardBlendMode =
  | 'color-burn'
  | 'color-dodge'
  | 'color'
  | 'darken'
  | 'difference'
  | 'exclusion'
  | 'hard-light'
  | 'hue'
  | 'lighten'
  | 'luminosity'
  | 'multiply'
  | 'normal'
  | 'overlay'
  | 'saturation'
  | 'screen'
  | 'soft-light';

export interface CLoginCardProps {
  /**
   * Background position (css background-position)
   *
   * @seeded from csc-ui — verify
   * @freeform any CSS background-position value
   */
  backgroundPosition?: string;
  /**
   * Mobile breakpoint in pixels
   *
   * @seeded from csc-ui — verify
   */
  mobileBreakpoint?: number;
  /**
   * Add colored overlay to the background image
   *
   * @seeded from csc-ui — verify
   */
  overlay?: boolean;
  /**
   * Add colored overlay to the background image
   *
   * @seeded from csc-ui — verify
   */
  overlayBlendMode?: CLoginCardBlendMode;
  /**
   * Background image
   *
   * @seeded from csc-ui — verify
   * @freeform any image URL
   */
  src?: string;
}
</script>

<script setup lang="ts">
/**
 * @slot default - Login Card contents
 *
 * @csspart root - The outer article carrying the card background and radius
 * @csspart card - The shadowed, positioned container inside the root
 * @csspart image - The clipped background-image layer of the card
 * @csspart content - The padded column wrapping the slotted contents
 *
 * @seeded from csc-ui — verify
 *
 * @subcomponents c-login-card-title, c-login-card-content, c-login-card-actions
 */
import { tv } from 'tailwind-variants';
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue';

/**
 * Styling lives entirely in this `tailwind-variants` config; the
 * stamped parts (`root`, `card`, `image`, `content`) are the public
 * customization surface. The old `--c-login-card-background-color` /
 * `--c-login-card-overlay-color` override indirection is dropped: the card
 * background comes from the `surface` role and the overlay tint from
 * the `primary` role.
 *
 * The host stays `display:contents` (global) and the box moves to the inner
 * `<article>` (`root`) which carries the background + radius; `card` is the
 * shadowed, positioned container, `image` the clipped background layer, and
 * `content` the padded text column. The `mobile` variant (driven by a
 * ResizeObserver against `mobileBreakpoint`) switches the image to a bottom
 * strip and relaxes the content padding/width.
 *
 * Two constructs can't be utilities and live in the escape-hatch <style>:
 * `clip-path: url(#cLoginClipPath)` is authored as an arbitrary
 * utility, but the mobile font-size override of the slotted
 * `c-login-card-title` is a `::slotted(...)` rule. It sets the
 * `--_c-login-card-title-font-size` contract var so the title (which reads it
 * across the shadow boundary) shrinks to 32px in mobile layout.
 */
const loginCard = tv({
  defaultVariants: {
    hasImage: true,
    mobile: false,
    overlay: false,
  },
  slots: {
    card: 'relative flex w-full rounded-csc-lg [box-shadow:rgba(0,0,0,0.15)_0_10px_20px,rgba(0,0,0,0.2)_0_5px_5px]',
    content: 'flex w-full max-w-[85%] flex-col gap-6 p-[72px] mb-8',
    image:
      "absolute top-0 left-0 h-full w-full overflow-hidden rounded-csc-lg bg-cover [clip-path:url('#cLoginClipPath')]",
    root: 'flex w-full rounded-csc-lg bg-surface',
  },
  variants: {
    hasImage: {
      false: {
        content: 'max-w-full mb-0',
      },
    },
    mobile: {
      true: {
        content: 'max-w-full p-10',
        image: 'top-auto bottom-0 w-full rounded-b-md rounded-t-none',
        // `c-login-card--mobile` is the marker the ::slotted escape-hatch rule
        // keys off (it must sit on an ancestor of the slot in this shadow root).
        root: 'c-login-card--mobile',
      },
    },
    overlay: {
      true: {
        image:
          'bg-primary [background-blend-mode:var(--_c-login-card-overlay-mode)]',
      },
    },
  },
});

const props = withDefaults(defineProps<CLoginCardProps>(), {
  backgroundPosition: 'bottom right',
  mobileBreakpoint: 600,
  overlay: false,
  overlayBlendMode: 'multiply',
  src: '',
});

const rootRef = useTemplateRef<HTMLElement>('rootRef');

const cardRef = useTemplateRef<HTMLElement>('cardRef');

// Two clip-path shapes for desktop and mobile layouts.
const PATHS = {
  desktop:
    'm0.234,0.914 C0.85,0.9 0.92,0.88 0.952,0.001 h0.048 v1 h-1 V0.919 Z',
  mobile:
    'm1,1 h-1 v-0.213 c0,0,0.209,-0.046,0.337,-0.109 c0.191,-0.096,0.413,-0.183,0.629,-0.608 c0.028,-0.055,0.034,-0.069,0.034,-0.069',
} as const;

const isMobile = ref(false);

const imageHeight = ref<string>('100%');

const path = ref<string>(PATHS.desktop);

const imageStyle = computed(() => ({
  '--_c-login-card-overlay-mode': props.overlay ? props.overlayBlendMode : '',
  backgroundImage: `url(${props.src})`,
  backgroundPosition: props.backgroundPosition,
  height: imageHeight.value,
}));

const ui = computed(() =>
  loginCard({
    hasImage: !!props.src,
    mobile: isMobile.value,
    overlay: props.overlay,
  }),
);

let resizeObserver: null | ResizeObserver = null;

const handleResize = (width: number) => {
  const mobile = width <= props.mobileBreakpoint;
  isMobile.value = mobile;
  imageHeight.value = mobile ? `${width * 0.3}px` : '100%';
  path.value = mobile ? PATHS.mobile : PATHS.desktop;
};

onMounted(() => {
  if (!cardRef.value) return;
  resizeObserver = new ResizeObserver(([entry]) => {
    handleResize(entry.contentRect.width);
  });
  resizeObserver.observe(cardRef.value);
});

onBeforeUnmount(() => resizeObserver?.disconnect());
</script>

<!--
  Escape-hatch CSS: the mobile font-size override of the slotted
  c-login-card-title is a `::slotted(...)` rule (a contextual selector targeting
  consumer light-DOM children that Tailwind utilities cannot express). It sets
  the `--_c-login-card-title-font-size` contract var (read by the title across
  its shadow boundary) so the title shrinks to 32px and hyphenates only when the
  card is in mobile layout. `--_c-login-card-mobile` is the marker the
  ::slotted rule keys off; the `mobile` tv variant stamps it onto `root`.
-->
<style>
.c-login-card--mobile ::slotted(c-login-card-title) {
  --_c-login-card-title-font-size: 32px;
  hyphens: auto;
}

:host {
  display: flex;
}
</style>
