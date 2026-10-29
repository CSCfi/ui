<template>
  <div :class="ui.root()" part="root">
    <svg v-if="icon" :class="ui.icon()" part="icon" viewBox="0 0 24 24">
      <path :d="icon" />
    </svg>

    <div :class="ui.content()" part="content">
      <slot name="heading">
        <p v-if="heading" :class="ui.heading()" part="heading">
          {{ heading }}
        </p>
      </slot>

      <slot />
    </div>

    <button
      v-if="isCloseable"
      :class="ui.close()"
      aria-label="Close"
      part="close"
      type="button"
      @click="onClose"
    >
      <svg class="size-4 fill-current" viewBox="0 0 24 24">
        <path :d="mdiClose" />
      </svg>
    </button>
  </div>
</template>

<script lang="ts">
/**
 * Type of the alert: the four status types carry their status family's
 * colours and icon. Omitting it renders the neutral look, in the brand primary
 * colour (unlike `c-status`, whose neutral pill is grey) and without an icon.
 */
export type CAlertType = 'error' | 'info' | 'success' | 'warning';

interface CAlertProps {
  /**
   * Show a close button. The alert only fires `close` — removing it from the
   * page stays the consumer's job.
   */
  closeable?: boolean;

  /**
   * Heading rendered above the message. The `heading` slot overrides it for
   * rich content.
   *
   * @freeform
   */
  heading?: string;

  /**
   * The status type, setting the colours, the icon and how urgently the
   * alert is announced (`warning` and `error` interrupt). Without it the
   * alert has the neutral, brand-primary look and no icon.
   */
  type?: CAlertType;
}
</script>

<script setup lang="ts">
/**
 * @slot heading - Rich heading content; overrides the `heading` prop
 * @slot default - The message
 *
 * @csspart root - The tinted box carrying the type's wash, hairline border and accent edge
 * @csspart icon - The status icon, rendered only when a `type` is set
 * @csspart content - The wrapper around the heading and message content
 * @csspart heading - The heading paragraph rendered from the `heading` prop
 * @csspart close - The close button rendered when `closeable` is set
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

/**
 * Styling lives entirely in this `tailwind-variants` config, per the MyCSC
 * alert spec: a wash of the type's role colour (10%) as the box tint with a
 * 40% hairline border and a solid 4px accent edge on the left; the icon and
 * the heading wear the role's `on-*-subtle` ink while body copy stays
 * high-contrast `on-surface`, so severity is carried by icon + label + edge,
 * never body-text colour. The neutral look has no icon. `--_c-alert-ink` is a private per-type hook that
 * colours the heading on both paths: the `heading` tv slot (the prop-rendered
 * fallback) and the escape-hatch `::slotted()` rule for light-DOM heading
 * content (a utility cannot reach slotted content).
 * Consumer customization is via `::part()`.
 */
/** The type's look, `neutral` when no type is set. */
type AlertLook = 'neutral' | CAlertType;

/** Events dispatched by `<c-alert>`. */
interface CAlertEvents {
  /**
   * Fired when the close button is pressed. The alert does not hide
   * itself — the consumer owns removal.
   */
  close: void;
}

const alert = tv({
  defaultVariants: {
    type: 'neutral',
  },
  slots: {
    close:
      '-my-0.5 -mr-1 grid size-7 shrink-0 cursor-pointer place-items-center rounded-csc-sm border-0 bg-transparent p-0 text-on-surface-muted transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary',
    content: 'flex min-w-0 flex-1 flex-col gap-0.5 pt-px text-on-surface',
    heading:
      'm-0 text-[length:inherit] leading-[1.4] font-semibold text-(--_c-alert-ink)',
    icon: 'mt-px size-5 shrink-0 fill-current',
    root: 'flex items-start gap-3 rounded-csc-md border border-l-4 p-3.5 text-sm leading-normal',
  },
  variants: {
    type: {
      error: {
        close: 'hover:bg-error/10 hover:text-on-error-subtle',
        icon: 'text-on-error-subtle',
        root: 'border-error/40 border-l-error bg-error/10 [--_c-alert-ink:var(--c-on-error-subtle)]',
      },
      info: {
        close: 'hover:bg-info/10 hover:text-on-info-subtle',
        icon: 'text-on-info-subtle',
        root: 'border-info/40 border-l-info bg-info/10 [--_c-alert-ink:var(--c-on-info-subtle)]',
      },
      neutral: {
        close: 'hover:bg-primary/10 hover:text-on-primary-subtle',
        root: 'border-primary/40 border-l-primary bg-primary/10 [--_c-alert-ink:var(--c-on-primary-subtle)]',
      },
      success: {
        close: 'hover:bg-success/10 hover:text-on-success-subtle',
        icon: 'text-on-success-subtle',
        root: 'border-success/40 border-l-success bg-success/10 [--_c-alert-ink:var(--c-on-success-subtle)]',
      },
      warning: {
        close: 'hover:bg-warning/10 hover:text-on-warning-subtle',
        icon: 'text-on-warning-subtle',
        root: 'border-warning/40 border-l-warning bg-warning/10 [--_c-alert-ink:var(--c-on-warning-subtle)]',
      },
    } satisfies Record<AlertLook, object>,
  },
});

const props = withDefaults(defineProps<CAlertProps>(), {
  closeable: false,
  type: undefined,
});

// The host carries the imperative `role`; without this, Vue mirrors it (and
// any consumer aria-*) into $attrs and onto [part=root], duplicating the
// live-region role (`pnpm lint:a11y`).
defineOptions({ inheritAttrs: false });

const icons: Record<CAlertType, string> = {
  error: mdiCloseCircle,
  info: mdiInformation,
  success: mdiCheckCircle,
  warning: mdiAlert,
};

// Attributes can deliver any string at runtime (including the legacy `''`),
// so unknown values fall back to the neutral look.
const normalizedType = computed((): AlertLook =>
  props.type && props.type in icons ? props.type : 'neutral',
);

const isCloseable = computed(() => coerceBoolean(props.closeable));

const ui = computed(() => alert({ type: normalizedType.value }));

// Only a status type has an icon; the neutral look has none.
const icon = computed(() =>
  normalizedType.value === 'neutral' ? undefined : icons[normalizedType.value],
);

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

const onClose = () => emit('close');
</script>

<!--
  Escape-hatch CSS: only constructs Tailwind utilities cannot
  express. The visible box lives in the `tv` config above; here remains the
  `::slotted([slot="heading"])` rule, which styles consumer-provided light-DOM
  heading content and cannot be reached by a utility class on a shadow-DOM
  node. It must stay visually identical to the `heading` tv slot (the
  prop-rendered fallback): the type's ink (`--_c-alert-ink`, set per type
  variant) at the body size — severity label and accent edge carry the hue,
  body copy stays neutral.
-->
<style>
::slotted(*[slot='heading']) {
  margin: 0 !important;
  font-size: inherit;
  font-weight: 600;
  line-height: 1.4;
  color: var(--_c-alert-ink);
}
</style>
