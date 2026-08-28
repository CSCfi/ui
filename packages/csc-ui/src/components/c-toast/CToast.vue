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
      <span :class="ui.badge()" part="badge">
        <svg :class="ui.icon()" viewBox="0 0 24 24">
          <path :d="icons[toastType]" />
        </svg>
      </span>

      <div :class="ui.content()" part="content">
        <p v-if="message?.title" :class="ui.title()">{{ message.title }}</p>
        {{ message?.message }}
      </div>

      <button
        v-if="!message?.indeterminate"
        :aria-label="message?.closeText ? undefined : 'close'"
        :class="ui.dismiss()"
        part="dismiss"
        type="button"
        @click="close"
      >
        <svg class="size-4 fill-current" viewBox="0 0 24 24">
          <path :d="icons.close" />
        </svg>
        <span v-if="message?.closeText">{{ message.closeText }}</span>
      </button>
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
 * @slot default - Custom toast content, shown when the message is flagged `custom`
 * @csspart root - The toast's outer box: the inverted-surface pill carrying the shadow
 * @csspart custom - Wrapper shown for custom messages in place of the standard item layout
 * @csspart content - The message body holding the title and text, or the slotted custom content
 * @csspart item - Row layout of a standard toast: status badge, message body and dismiss button
 * @csspart badge - The circular tinted badge holding the status icon
 * @csspart dismiss - The dismiss button (icon-only, or labelled when the message sets `closeText`)
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
 * Styling lives in this `tailwind-variants` config, per the toast design
 * spec (ADR-0032): a borderless **inverted-surface** pill — the contrast
 * flip makes the toast stand apart from every other surface in both modes —
 * with the status (`type`) carried solely by the circular tinted badge
 * around the leading icon (the `*-inverted` status roles). Body copy wears
 * the muted inverted ink, the title the full ink; the dismiss button and the
 * progress bar are neutral. Consumer customization is via `::part()`.
 *
 * Why the box (padding/bg/shadow) is on the `root` element and NOT the
 * host: this sheet ships Tailwind's preflight, whose `*` reset is injected into
 * every shadow root. A <c-toast> renders inside <c-toasts>'s shadow root, so
 * c-toasts' own `*` rule matches the c-toast host; a `:host` background/padding
 * would lose to that outer-tree `*` reset. A class-selected inner element lives
 * in c-toast's OWN shadow root (invisible to the parent's `*`) and a class
 * outranks the same-tree `*`, so the box paints correctly there.
 */
const toast = tv({
  defaultVariants: {
    type: 'info',
  },
  slots: {
    badge: 'grid size-8 shrink-0 place-items-center rounded-full',
    box: 'grid items-center min-h-[52px] w-full box-border p-2 pl-3 rounded-csc-lg bg-surface-inverted text-on-surface-inverted',
    content: 'text-on-surface-inverted-muted',
    custom: '',
    dismiss:
      'grid size-8 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-transparent p-0 text-on-surface-inverted-muted transition-colors duration-150 hover:bg-on-surface-inverted/10 hover:text-on-surface-inverted focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-on-surface-inverted',
    icon: 'size-5 shrink-0',
    item: 'grid items-center gap-3 grid-cols-[32px_1fr] auto-cols-auto grid-flow-col',
    progress:
      'bg-on-surface-inverted/15 rounded-lg h-1.5 mt-2 overflow-hidden [transform:translateZ(0)]',
    // The animation (keyframes + host-hover-driven play-state) lives in the
    // escape-hatch sheet keyed off the static `.c-toast__progress__bar` class.
    // Neutral on purpose: the badge carries the status colour.
    progressBar: 'h-1.5 w-full rounded-lg bg-on-surface-inverted',
    title: 'm-0 font-semibold text-on-surface-inverted',
    visuallyHidden:
      'absolute w-px h-px overflow-hidden p-0 border-0 [clip:rect(1px,1px,1px,1px)]',
  },
  variants: {
    // The dismiss button grows from an icon circle into a labelled pill when
    // the message sets `closeText`.
    labelled: {
      true: {
        dismiss: 'flex w-auto items-center gap-1.5 px-2.5',
      },
    },
    // Status accent — the coloured icon plus a translucent same-colour halo
    // circle (the filled mdi glyphs knock the symbol out of the shape, so the
    // accent ink IS the badge). Info is the fallback for an untyped toast.
    type: {
      error: {
        badge: 'bg-error-inverted/20',
        icon: 'fill-error-inverted',
      },
      info: {
        badge: 'bg-info-inverted/20',
        icon: 'fill-info-inverted',
      },
      success: {
        badge: 'bg-success-inverted/20',
        icon: 'fill-success-inverted',
      },
      warning: {
        badge: 'bg-warning-inverted/20',
        icon: 'fill-warning-inverted',
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

const TYPES: readonly CToastType[] = ['error', 'info', 'success', 'warning'];

// A message object can carry any string at runtime; unknown types fall back
// to `info`, matching the original `var(--c-info)` fallback.
const toastType = computed<CToastType>(() => {
  const type = props.message?.type;

  return type && (TYPES as readonly string[]).includes(type)
    ? (type as CToastType)
    : 'info';
});

const ui = computed(() =>
  toast({ labelled: Boolean(props.message?.closeText), type: toastType.value }),
);

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
  Escape-hatch CSS: only constructs Tailwind utilities cannot
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
/* The enter/exit offset comes from the parent c-toasts stack via the
 * inherited `--_c-toast-enter-y` custom property (20px for a bottom-anchored
 * stack, -20px for a top-anchored one), so a toast always slides in from —
 * and retreats toward — the edge its stack is anchored to. The fallback
 * keeps the bottom behaviour for a bare c-toast. */
:host {
  display: block;
  position: relative;
  width: 100%;
  text-align: left;
  pointer-events: all;
  opacity: 0;
  transform: translateY(var(--_c-toast-enter-y, 20px));
  transition:
    opacity 0.5s ease,
    transform 0.5s ease;
  will-change: opacity, transform;
}

:host(.show) {
  opacity: 1;
  transform: translateY(0);
}

/* Reduced motion: a plain, quicker cross-fade — no slide. The close flow
 * waits for `transitionend` on the host, so an opacity transition must
 * remain (only the transform goes). */
@media (prefers-reduced-motion: reduce) {
  :host {
    transform: none;
    transition: opacity 0.2s ease;
    will-change: opacity;
  }
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
