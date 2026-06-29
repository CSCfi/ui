<template>
  <div :class="ui.root()" part="root">
    <svg v-if="isIconType" :class="ui.icon()" part="icon" viewBox="0 0 24 24">
      <path :d="icon" />
    </svg>

    <div :class="ui.content()" part="content">
      <slot name="title" />

      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  mdiAlert,
  mdiCheckCircle,
  mdiCloseCircle,
  mdiInformation,
} from '@mdi/js';
import { tv } from 'tailwind-variants';
import { computed } from 'vue';

/**
 * Styling lives entirely in this `tailwind-variants` config (ADR-0004): the
 * `slots` are the component's parts and the `type` `variants` replace the
 * original `.c-alert--<type>` colour classes. The old `--c-alert-color`
 * indirection var is dropped — each type maps straight to a design token
 * (`text-info-600`, `text-error-600`, …) and the border/icon inherit it via
 * `currentColor`. Consumer customization is via `::part()` (ADR-0006).
 *
 * The accent colour is carried by `text-*` on `root`; the box border uses
 * `border-current` and the icon `fill-current`, so a single type token paints
 * border + icon at once (matching the original `currentColor` cascade).
 */
const alert = tv({
  defaultVariants: {
    type: 'default',
  },
  slots: {
    content: 'grid items-center gap-2 text-[rgba(0,0,0,0.87)]',
    icon: 'fill-current size-6 self-start shrink-0',
    root: 'grid gap-4 border-2 border-current border-l-[12px] rounded-csc-md p-3 text-primary-600',
  },
  variants: {
    type: {
      default: {},
      error: { root: 'grid-cols-[auto_1fr] text-error-600' },
      info: { root: 'grid-cols-[auto_1fr] text-info-600' },
      success: { root: 'grid-cols-[auto_1fr] text-success-600' },
      warning: { root: 'grid-cols-[auto_1fr] text-warning-600' },
    },
  },
});

// The four icon types carry an icon + accent colour + two-column layout.
// "Default" is represented by anything else: '' (how the design system / docs
// express it — CAlertType has no `Default` member), 'default', or undefined.
type CAlertIconType = 'error' | 'info' | 'success' | 'warning';

interface CAlertProps {
  type?: CAlertType;
}

type CAlertType = '' | 'default' | CAlertIconType;

const props = withDefaults(defineProps<CAlertProps>(), {
  type: 'default',
});

const icons: Record<CAlertIconType, string> = {
  error: mdiCloseCircle,
  info: mdiInformation,
  success: mdiCheckCircle,
  warning: mdiAlert,
};

// Truthy-type check mirrors the original `!!this.type`: only a real icon type
// shows the icon and switches to the two-column grid. A falsy/unknown `type`
// (e.g. the docs' `''` Default) must NOT render an empty icon — doing so left a
// stray icon row above the content, which read as a strange padding-top.
const isIconType = computed((): boolean => props.type in icons);

const ui = computed(() =>
  alert({
    type: isIconType.value ? (props.type as CAlertIconType) : 'default',
  }),
);

const icon = computed(() =>
  isIconType.value ? icons[props.type as CAlertIconType] : '',
);
</script>

<!--
  Escape-hatch CSS (ADR-0007): only constructs Tailwind utilities cannot
  express. The visible box (border/grid/colour) lives in the `tv` config above;
  here remains the `::slotted([slot="title"])` rule, which styles
  consumer-provided light-DOM title content and cannot be reached by a utility
  class on a shadow-DOM node.
-->
<style>
::slotted(*[slot='title']) {
  margin: 0 !important;
  font-size: 18px;
  font-weight: 600;
  line-height: 24px;
}
</style>
