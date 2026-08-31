<template>
  <div :class="ui.root()" part="root">
    <svg :class="ui.icon()" part="icon" viewBox="0 0 24 24">
      <path :d="icon" />
    </svg>

    <div :class="ui.content()" part="content">
      <slot name="title" />

      <slot />
    </div>

    <button
      v-if="isDismissible"
      :class="ui.dismiss()"
      aria-label="Dismiss"
      part="dismiss"
      type="button"
      @click="onDismiss"
    >
      <svg class="size-4 fill-current" viewBox="0 0 24 24">
        <path :d="mdiClose" />
      </svg>
    </button>
  </div>
</template>

<script lang="ts">
/**
 * The alert types that carry a status family's accent colour; `default` uses
 * the brand primary. Every type renders its status icon.
 */
export type CAlertIconType = 'error' | 'info' | 'success' | 'warning';

export interface CAlertProps {
  /**
   * Show a dismiss button. The alert only emits `dismiss` — removing it from
   * the page stays the consumer's job.
   */
  dismissible?: boolean;
  /**
   * Type of the alert
   *
   * @seeded from csc-ui — verify
   */
  type?: CAlertType;
}

/**
 * Type of the alert. `default` — equivalently, omitting the attribute —
 * renders the brand-primary look; the four status types carry their status
 * family's colours.
 */
export type CAlertType = 'default' | CAlertIconType;
</script>

<script setup lang="ts">
/**
 * @slot title - Title slot
 * @slot default - Default slot
 *
 * @csspart root - The tinted box carrying the type's wash, hairline border and accent edge
 * @csspart icon - The status icon svg
 * @csspart content - The wrapper around the slotted title and message content
 * @csspart dismiss - The dismiss button rendered when `dismissible` is set
 *
 * @seeded from csc-ui — verify
 */
import {
  mdiAlert,
  mdiCheckCircle,
  mdiClose,
  mdiCloseCircle,
  mdiInformation,
} from '@mdi/js';
import { tv } from 'tailwind-variants';
import { computed, onMounted, useHost, watch } from 'vue';

import { coerceBoolean } from '../../shared/coerceBoolean';
import { useHostEmit } from '../../shared/useHostEmit';

/** Events dispatched by `<c-alert>`. */
interface CAlertEvents {
  /**
   * Fired when the dismiss button is pressed. The alert does not hide
   * itself — the consumer owns removal.
   */
  dismiss: void;
}

/**
 * Styling lives entirely in this `tailwind-variants` config, per the MyCSC
 * alert spec: a wash of the type's role colour (10%) as the box tint with a
 * 40% hairline border and a solid 4px accent edge on the left; the icon and
 * the slotted title wear the role's `on-*-subtle` ink while body copy stays
 * high-contrast `on-surface`, so severity is carried by icon + label + edge,
 * never body-text colour. `--_c-alert-ink` is a private per-type hook whose
 * only job is colouring the light-DOM title from the escape-hatch
 * `::slotted()` rule (a utility cannot reach slotted content).
 * Consumer customization is via `::part()`.
 */
const alert = tv({
  defaultVariants: {
    type: 'default',
  },
  slots: {
    content: 'flex min-w-0 flex-1 flex-col gap-0.5 pt-px text-on-surface',
    dismiss:
      'grid size-7 shrink-0 -my-0.5 -mr-1 cursor-pointer place-items-center rounded-csc-sm border-0 bg-transparent p-0 text-on-surface-muted transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary',
    icon: 'mt-px size-5 shrink-0 fill-current',
    root: 'flex items-start gap-3 rounded-csc-md border border-l-4 p-3.5 text-sm leading-normal',
  },
  variants: {
    type: {
      default: {
        dismiss: 'hover:bg-primary/10 hover:text-on-primary-subtle',
        icon: 'text-on-primary-subtle',
        root: 'bg-primary/10 border-primary/40 border-l-primary [--_c-alert-ink:var(--c-on-primary-subtle)]',
      },
      error: {
        dismiss: 'hover:bg-error/10 hover:text-on-error-subtle',
        icon: 'text-on-error-subtle',
        root: 'bg-error/10 border-error/40 border-l-error [--_c-alert-ink:var(--c-on-error-subtle)]',
      },
      info: {
        dismiss: 'hover:bg-info/10 hover:text-on-info-subtle',
        icon: 'text-on-info-subtle',
        root: 'bg-info/10 border-info/40 border-l-info [--_c-alert-ink:var(--c-on-info-subtle)]',
      },
      success: {
        dismiss: 'hover:bg-success/10 hover:text-on-success-subtle',
        icon: 'text-on-success-subtle',
        root: 'bg-success/10 border-success/40 border-l-success [--_c-alert-ink:var(--c-on-success-subtle)]',
      },
      warning: {
        dismiss: 'hover:bg-warning/10 hover:text-on-warning-subtle',
        icon: 'text-on-warning-subtle',
        root: 'bg-warning/10 border-warning/40 border-l-warning [--_c-alert-ink:var(--c-on-warning-subtle)]',
      },
    } satisfies Record<CAlertType, object>,
  },
});

const props = withDefaults(defineProps<CAlertProps>(), {
  dismissible: false,
  type: 'default',
});

// The host carries the imperative `role`; without this, Vue mirrors it (and
// any consumer aria-*) into $attrs and onto [part=root], duplicating the
// live-region role (`pnpm lint:a11y`).
defineOptions({ inheritAttrs: false });

const icons: Record<CAlertType, string> = {
  default: mdiInformation,
  error: mdiCloseCircle,
  info: mdiInformation,
  success: mdiCheckCircle,
  warning: mdiAlert,
};

// Attributes can deliver any string at runtime (including the legacy `''`),
// so unknown values fall back to the default look.
const normalizedType = computed(
  (): CAlertType => (props.type in icons ? props.type : 'default'),
);

const isDismissible = computed(() => coerceBoolean(props.dismissible));

const ui = computed(() => alert({ type: normalizedType.value }));

const icon = computed(() => icons[normalizedType.value]);

const host = useHost();

// Warning and error interrupt (assertive `role="alert"`); neutral, info and
// success announce politely (`role="status"`) — per the MyCSC alert spec.
const hostRole = computed(() =>
  normalizedType.value === 'warning' || normalizedType.value === 'error'
    ? 'alert'
    : 'status',
);

watch(hostRole, (role) => host?.setAttribute('role', role));

onMounted(() => host?.setAttribute('role', hostRole.value));

const emit = useHostEmit<CAlertEvents>();

const onDismiss = () => emit('dismiss');
</script>

<!--
  Escape-hatch CSS: only constructs Tailwind utilities cannot
  express. The visible box lives in the `tv` config above; here remains the
  `::slotted([slot="title"])` rule, which styles consumer-provided light-DOM
  title content and cannot be reached by a utility class on a shadow-DOM node.
  The title wears the type's ink (`--_c-alert-ink`, set per type variant) at
  the body size — severity label and accent edge carry the hue, body copy
  stays neutral.
-->
<style>
::slotted(*[slot='title']) {
  margin: 0 !important;
  font-size: inherit;
  font-weight: 600;
  line-height: 1.4;
  color: var(--_c-alert-ink);
}
</style>
