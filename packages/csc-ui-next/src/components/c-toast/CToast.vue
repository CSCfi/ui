<template>
  <div :class="ui.box()" part="root">
    <span :class="ui.visuallyHidden()">
      {{ message?.type || '' }} notification
    </span>

    <div v-if="message?.custom" :class="ui.custom()" part="custom">
      <div :class="ui.content()" part="content">
        <slot />
      </div>
    </div>

    <div v-else :class="ui.item()" part="item">
      <svg :class="ui.icon()" viewBox="0 0 24 24">
        <path :d="icons[toastType]" />
      </svg>

      <div :class="ui.content()" part="content">
        <p v-if="message?.title" :class="ui.title()">{{ message.title }}</p>
        {{ message?.message }}
      </div>

      <c-icon-button
        v-if="!message?.indeterminate && !message?.closeText"
        aria-label="close"
        size="small"
        text
        @click="close"
      >
        <c-icon :color="accentColor" :path="icons.close" />
      </c-icon-button>

      <c-button
        v-if="!message?.indeterminate && message?.closeText"
        aria-label="close"
        size="small"
        text
        @click="close"
      >
        <c-icon slot="icon" :color="accentColor" :path="icons.close" />
        {{ message.closeText }}
      </c-button>
    </div>

    <div v-if="showProgress" :class="ui.progress()" part="progress">
      <div
        :class="[ui.progressBar(), { indeterminate: message?.indeterminate }]"
        :style="progressStyle"
        class="c-toast__progress__bar"
      />
    </div>
  </div>
</template>

<script lang="ts">
import type { CToastMessage, CToastType } from '../../types';

export interface CToastProps {
  /**
   * Messages
   *
   * @seeded from csc-ui — verify
   */
  message?: CToastMessage | null;
}
</script>

<script setup lang="ts">
/**
 * A single toast notification, rendered and managed by c-toasts
 *
 * @slot default - Custom toast content, shown when the message is flagged `custom`
 * @csspart root - The toast's outer box carrying the accent border and shadow
 * @csspart custom - Wrapper shown for custom messages in place of the standard item layout
 * @csspart content - The message body holding the title and text, or the slotted custom content
 * @csspart item - Row layout of a standard toast: type icon, message body and close button
 * @csspart progress - The track of the auto-close progress bar
 */
import {
  mdiAlert,
  mdiCheckCircle,
  mdiClose,
  mdiCloseCircle,
  mdiInformation,
} from '@mdi/js';
import { tv } from 'tailwind-variants';
import {
  computed,
  onBeforeUnmount,
  onMounted,
  useHost,
  watch,
  watchEffect,
} from 'vue';

import { useHostEmit } from '../../shared/useHostEmit';

/** Events dispatched by `<c-toast>`. */
interface CToastEvents {
  /**
   * Fired once the toast's leave transition has finished (after a manual
   * dismiss or the auto-close timer), carrying the dismissed toast's message
   * object.
   */
  close: CToastMessage | null;
}

/**
 * Styling lives in this `tailwind-variants` config (ADR-0004). The old
 * `--_c-toast-*` indirection vars are dropped: the accent (`type`) maps
 * straight to a design token (`border-info-600`, `text-error-600`, …) selected
 * by the `type` variant, and the white background / system text are token
 * utilities. Consumer customization is via `::part()` (ADR-0006).
 *
 * Why the box (border/padding/bg/shadow) is on the `root` element and NOT the
 * host: this sheet ships Tailwind's preflight, whose `*` reset is injected into
 * every shadow root. A <c-toast> renders inside <c-toasts>'s shadow root, so
 * c-toasts' own `*` rule matches the c-toast host; a `:host` border/padding
 * would lose to that outer-tree `*` reset. A class-selected inner element lives
 * in c-toast's OWN shadow root (invisible to the parent's `*`) and a class
 * outranks the same-tree `*`, so the box paints correctly there.
 *
 * The body text stays the system-text token; the accent (`type`) paints the
 * box border, the leading icon's fill and the progress bar only — matching the
 * original split where `--_c-toast-text-color` was the body text and
 * `--_c-toast-color` (the accent) was used solely for border/icon/progress.
 */
const toast = tv({
  defaultVariants: {
    type: 'info',
  },
  slots: {
    box: 'grid items-center min-h-[52px] w-full box-border p-2 px-3 rounded-csc-md bg-surface-raised text-on-surface-muted border-2 border-l-[12px]',
    content: '',
    custom: '',
    icon: 'size-6',
    item: 'grid items-center gap-3 grid-cols-[24px_1fr] auto-cols-auto grid-flow-col font-light',
    progress:
      'bg-surface-muted rounded-lg h-1.5 mt-2 overflow-hidden [transform:translateZ(0)]',
    // The animation (keyframes + host-hover-driven play-state) lives in the
    // escape-hatch sheet keyed off the static `.c-toast__progress__bar` class.
    progressBar: 'h-1.5 w-full rounded-lg',
    title: 'm-0 font-semibold',
    visuallyHidden:
      'absolute w-px h-px overflow-hidden p-0 border-0 [clip:rect(1px,1px,1px,1px)]',
  },
  variants: {
    // Accent only — border + leading-icon fill + progress bar. Body text stays
    // system-text. Info is the fallback for an untyped toast, matching the
    // original `var(--_c-toast-color, var(--c-info))` border fallback.
    type: {
      error: {
        box: 'border-error',
        icon: 'fill-error',
        progressBar: 'bg-error',
      },
      info: {
        box: 'border-info',
        icon: 'fill-info',
        progressBar: 'bg-info',
      },
      success: {
        box: 'border-success',
        icon: 'fill-success',
        progressBar: 'bg-success',
      },
      warning: {
        box: 'border-warning',
        icon: 'fill-warning',
        progressBar: 'bg-warning',
      },
    } satisfies Record<CToastType, object>,
  },
});

// `role`/`aria-live`/`aria-atomic` are set on the host (the live region). Vue's
// defineCustomElement mirrors non-prop host attributes into `$attrs`, which
// would otherwise fall through onto the shadow root `[part=root]` div — nesting
// a duplicate live region (role=alert + aria-live) inside the host and risking a
// double announcement. Keep the live-region attributes on the host only.
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<CToastProps>(), {
  message: null,
});

const host = useHost();

const emit = useHostEmit<CToastEvents>();

const icons: Record<string, string> = {
  close: mdiClose,
  error: mdiCloseCircle,
  info: mdiInformation,
  success: mdiCheckCircle,
  warning: mdiAlert,
};

// Accent colour for the close icon. `c-icon`'s `color` prop sets the SVG
// `fill` directly, so it can't inherit `currentColor` from the icon-button
// (which paints itself primary). Map the toast type to its semantic status
// role var (the toast's `box` border is the same role, but the close icon
// lives inside a nested custom element and so can't pick that up via the
// cascade).
const ACCENT_VAR: Record<CToastType, string> = {
  error: 'var(--c-error)',
  info: 'var(--c-info)',
  success: 'var(--c-success)',
  warning: 'var(--c-warning)',
};

// A message object can carry any string at runtime; unknown types fall back
// to `info` (ADR-0015), matching the original `var(--c-info)` fallback.
const toastType = computed<CToastType>(() => {
  const type = props.message?.type;

  return type && type in ACCENT_VAR ? type : 'info';
});

const accentColor = computed(() => ACCENT_VAR[toastType.value]);

const ui = computed(() => toast({ type: toastType.value }));

const progressStyle = computed(() => ({
  '--_c-toast-duration': `${props.message?.duration}ms`,
}));

const showProgress = computed(
  () => !props.message?.persistent && props.message?.progress,
);

let closed = false;

let startTime = 0;

let remainingTime = 0;

let timeoutId: null | ReturnType<typeof setTimeout> = null;

const close = () => {
  if (closed) return;
  closed = true;

  if (!host) return;
  host.classList.remove('show');

  const onEnd = () => {
    host.removeEventListener('transitionend', onEnd);
    emit('close', props.message);
  };

  host.addEventListener('transitionend', onEnd);
};

// Pause / resume on hover. Persistent and indeterminate toasts never
// auto-close so they ignore mouse events.
const onMouseEnter = () => {
  if (!props.message || props.message.persistent || props.message.indeterminate)
    return;
  remainingTime -= Date.now() - startTime;

  if (timeoutId !== null) clearTimeout(timeoutId);
};

const onMouseLeave = () => {
  if (!props.message || props.message.persistent || props.message.indeterminate)
    return;
  startTime = Date.now();
  timeoutId = setTimeout(close, remainingTime);
};

// Expose `closeToast` so the parent c-toasts container can dismiss a
// specific toast by querying its host and calling the method — matches
// the @Method() decorator on the original Stencil component.
defineExpose({ closeToast: close });

const TYPES: readonly CToastType[] = ['error', 'info', 'success', 'warning'];

// Show animation + auto-close timer. Runs exactly once, the first time
// `message` is available.
let started = false;

const start = () => {
  if (started || !host || !props.message) return;
  started = true;
  requestAnimationFrame(() => host.classList.add('show'));

  if (props.message.persistent || props.message.indeterminate) return;
  startTime = Date.now();
  remainingTime = Number(props.message.duration || 0);
  timeoutId = setTimeout(close, remainingTime);
};

onMounted(() => {
  if (!host) return;
  host.setAttribute('role', 'alert');
  host.setAttribute('aria-atomic', 'true');
  host.setAttribute('aria-live', 'assertive');
  host.addEventListener('mouseenter', onMouseEnter);
  host.addEventListener('mouseleave', onMouseLeave);

  // The `message` object prop is set across the custom-element boundary and
  // can arrive after mount, so reflect the id + the hover-pause type classes
  // reactively. (The visible accent now comes from the `type` tv variant; the
  // host classes only drive the `:host(.show)`/`:host(:hover)` state in the
  // escape-hatch sheet and the id used by the parent container.)
  watchEffect(() => {
    if (!props.message) return;
    host.id = `c-toast--${props.message.id || ''}`;
    TYPES.forEach((t) => host.classList.toggle(t, toastType.value === t));
  });

  if (props.message) {
    start();
  } else {
    const stop = watch(
      () => props.message,
      (m) => {
        if (m) {
          stop();
          start();
        }
      },
    );
  }
});

onBeforeUnmount(() => {
  if (timeoutId !== null) clearTimeout(timeoutId);
  host?.removeEventListener('mouseenter', onMouseEnter);
  host?.removeEventListener('mouseleave', onMouseLeave);
});
</script>

<!--
  Escape-hatch CSS (ADR-0007): only constructs Tailwind utilities cannot
  express. The visible box, item layout, icon and progress bar live in the `tv`
  config above. What remains:
  - the `:host` enter/leave transition (opacity + translateY): JS toggles the
    `.show` class on the host and waits for `transitionend` ON THE HOST, so the
    transition must live on the host. `display:block` is required here because
    the global `:host{display:contents}` can't carry opacity/transform; the
    per-type sheet is adopted after the shared sheet, so it wins.
  - `:host(:hover)` pausing the progress animation via the
    `--_c-toast-animation-state` custom property (a contextual host state that
    must reach a descendant's animation — not expressible as a utility).
  - the `@keyframes` for the timer + indeterminate progress bar.
  - the box's multi-layer drop shadow: authored as plain CSS rather than a
    `shadow-[...]` utility because Tailwind wraps multi-layer arbitrary shadow
    values in a malformed `color-mix(in oklab, …)`, so the utility paints
    nothing. Kept on the `root` part so it stays `::part(root)`-customizable.
-->
<style>
:host {
  display: block;
  position: relative;
  width: 100%;
  text-align: left;
  pointer-events: all;
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 0.5s ease,
    transform 0.5s ease;
  will-change: opacity, transform;
}

:host(.show) {
  opacity: 1;
  transform: translateY(0);
}

[part='root'] {
  box-shadow:
    rgba(0, 0, 0, 0.07) 0 1px 1px,
    rgba(0, 0, 0, 0.07) 0 2px 2px,
    rgba(0, 0, 0, 0.07) 0 4px 4px,
    rgba(0, 0, 0, 0.07) 0 8px 8px,
    rgba(0, 0, 0, 0.07) 0 16px 16px;
}

:host(:hover) {
  --_c-toast-animation-state: paused;
}

/* Progress bar animation. Static size/colour live in the `tv` `progressBar`
 * slot; the animation references the `@keyframes` below and reads its
 * play-state from the host-hover-driven `--_c-toast-animation-state` custom
 * property, neither of which a utility can express. `--_c-toast-duration` is
 * set inline from the message `duration`. */
.c-toast__progress__bar {
  animation-name: c-toast-timer;
  animation-duration: var(--_c-toast-duration);
  animation-timing-function: linear;
  animation-iteration-count: 1;
  animation-fill-mode: forwards;
  animation-play-state: var(--_c-toast-animation-state, running);
}

.c-toast__progress__bar.indeterminate {
  width: 50%;
  position: relative;
  left: -100%;
  transform-origin: 0% 50%;
  animation: c-toast-indeterminate 2s infinite linear;
}

@keyframes c-toast-timer {
  100% {
    transform: translateX(-100%);
  }
}

@keyframes c-toast-indeterminate {
  0% {
    transform: translateX(100%) scaleX(1);
  }
  30% {
    transform: translateX(170%) scaleX(1.75);
  }
  70% {
    transform: translateX(500%) scaleX(0.1);
  }
  100% {
    transform: translateX(500%) scaleX(0.1);
  }
}
</style>
