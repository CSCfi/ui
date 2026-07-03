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

<script lang="ts">
/**
 * The alert types that render a status icon and carry that status's accent
 * colour.
 */
export type CAlertIconType = 'error' | 'info' | 'success' | 'warning';

export interface CAlertProps {
  /**
   * Type of the alert
   *
   * @seeded from csc-ui — verify
   */
  type?: CAlertType;
}

/**
 * Type of the alert. `default` — equivalently, omitting the attribute —
 * renders the neutral box without a status icon.
 */
export type CAlertType = 'default' | CAlertIconType;
</script>

<script setup lang="ts">
/**
 * @slot title - Title slot
 * @slot default - Default slot
 *
 * @csspart root - The outer bordered box carrying the type's accent color
 * @csspart icon - The status icon svg shown for the error/info/success/warning types
 * @csspart content - The wrapper around the slotted title and message content
 *
 * @seeded from csc-ui — verify
 */
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
 * indirection var is dropped — each type maps straight to its semantic status
 * role (info / error / …, ADR-0010) and the border/icon inherit it via
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
    content: 'grid items-center gap-2 text-on-surface',
    icon: 'fill-current size-6 self-start shrink-0',
    root: 'grid gap-4 border-2 border-current border-l-[12px] rounded-csc-md p-3 text-primary',
  },
  variants: {
    type: {
      default: {},
      error: { root: 'grid-cols-[auto_1fr] text-error' },
      info: { root: 'grid-cols-[auto_1fr] text-info' },
      success: { root: 'grid-cols-[auto_1fr] text-success' },
      warning: { root: 'grid-cols-[auto_1fr] text-warning' },
    } satisfies Record<CAlertType, object>,
  },
});

const props = withDefaults(defineProps<CAlertProps>(), {
  type: 'default',
});

const icons: Record<CAlertIconType, string> = {
  error: mdiCloseCircle,
  info: mdiInformation,
  success: mdiCheckCircle,
  warning: mdiAlert,
};

// Only a real icon type shows the icon and switches to the two-column grid.
// Attributes can deliver any string at runtime (including the legacy `''`),
// so unknown values fall back to the default look (ADR-0015) — rendering an
// empty icon would leave a stray icon row that reads as odd padding-top.
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
