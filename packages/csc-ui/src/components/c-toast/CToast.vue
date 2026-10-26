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

interface CToastProps {
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
  ref,
  useHost,
  watch,
  watchEffect,
} from 'vue';

import { prefersReducedMotion } from '../../shared/reducedMotion';
import { useHostEmit } from '../../shared/useHostEmit';
import {
  type CToastSwipeSample,
  SWIPE_VELOCITY_WINDOW_MS,
  swipeIntent,
  swipeOpacity,
  swipeOutcome,
  swipeVelocity,
} from './swipe';

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
    box: 'box-border grid min-h-[52px] w-full items-center rounded-csc-lg bg-surface-inverted p-2 pl-3 text-on-surface-inverted',
    content: 'text-on-surface-inverted-muted',
    custom: '',
    dismiss:
      'grid size-8 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-transparent p-0 text-on-surface-inverted-muted transition-colors duration-150 hover:bg-on-surface-inverted/10 hover:text-on-surface-inverted focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-on-surface-inverted',
    icon: 'size-5 shrink-0',
    item: 'grid auto-cols-auto grid-flow-col grid-cols-[32px_1fr] items-center gap-3',
    progress:
      'mt-2 h-1.5 [transform:translateZ(0)] overflow-hidden rounded-lg bg-on-surface-inverted/15',
    // The animation (keyframes + hold-driven play-state) lives in the
    // escape-hatch sheet keyed off the static `.c-toast__progress__bar` class.
    // Neutral on purpose: the badge carries the status colour.
    progressBar: 'h-1.5 w-full rounded-lg bg-on-surface-inverted',
    title: 'm-0 font-semibold text-on-surface-inverted',
    visuallyHidden:
      'absolute h-px w-px overflow-hidden border-0 p-0 [clip:rect(1px,1px,1px,1px)]',
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

/** A press on a swipeable toast, from `pointerdown` until it ends. */
interface CToastDrag {
  /** The offset the toast already had when pressed (caught springing back). */
  base: number;

  claimed: boolean;

  /** The offset last painted. */
  dx: number;
  id: number;
  samples: CToastSwipeSample[];
  startX: number;
  startY: number;
  width: number;
}

/**
 * The c-toasts stack a toast renders in, reached through the shadow root it
 * sits in. `_toastLeaving` pins the leaving toast and glides the rest.
 */
type CToastStackHost = {
  _toastLeaving?: (toast: HTMLElement) => void;
} & Element;

const SWIPE_MOTION_MS = 250;

// Longer than the slowest exit (the 0.5s slide), for an exit that never
// transitions: a hidden ancestor, a cancelled transition.
const EXIT_FALLBACK_MS = 700;

// The exit has begun, whichever path started it.
const leaving = ref(false);

// CONTEXT.md "Swipe dismiss": only a toast with a dismiss button takes it.
const swipeable = computed(
  () =>
    !leaving.value &&
    Boolean(props.message) &&
    !props.message?.custom &&
    !props.message?.indeterminate,
);

const timed = () =>
  Boolean(props.message) &&
  !props.message?.persistent &&
  !props.message?.indeterminate;

let started = false;

let startTime = 0;

let remainingTime = 0;

let timeoutId: null | ReturnType<typeof setTimeout> = null;

let exitFallback: null | ReturnType<typeof setTimeout> = null;

let closeEmitted = false;

// Hover and press each hold the timer (ADR-0073): it waits while either lasts
// and resumes with the time it had left once both have ended.
const holds = new Set<'hover' | 'press'>();

let pressId: null | number = null;

let drag: CToastDrag | null = null;

let springBack: Animation | null = null;

const stopTimer = () => {
  if (timeoutId !== null) clearTimeout(timeoutId);
  timeoutId = null;
};

const stackHost = (): CToastStackHost | null => {
  const root = host?.getRootNode();

  return root instanceof ShadowRoot ? (root.host as CToastStackHost) : null;
};

const clearDragStyles = () => {
  host?.style.removeProperty('transform');
  host?.style.removeProperty('opacity');
  host?.style.removeProperty('transition');
};

const finish = () => {
  if (closeEmitted) return;
  closeEmitted = true;

  if (exitFallback !== null) clearTimeout(exitFallback);
  host?.removeEventListener('transitionend', onExitEnd);
  emit('close', props.message);
};

// Every exit fades the host out; a slotted child's own transitions bubble
// through the host too, so only the host's opacity counts.
const onExitEnd = (event: TransitionEvent) => {
  if (event.target === host && event.propertyName === 'opacity') finish();
};

// The one exit behind the dismiss button, the timer, `closeToast` and a
// swipe dismiss. A swipe carries on from where the toast was let go.
const leave = (swipe?: { dx: number; width: number }) => {
  if (!host || leaving.value) return;
  leaving.value = true;
  stopTimer();

  if (drag?.claimed && host.hasPointerCapture(drag.id)) {
    host.releasePointerCapture(drag.id);
  }

  drag = null;
  host.classList.remove('swiping');
  springBack?.cancel();
  springBack = null;

  if (!swipe) clearDragStyles();

  const shown = host.classList.contains('show');

  // Before any style changes: the stack measures the toast where it rests.
  stackHost()?._toastLeaving?.(host);
  host.classList.add('leaving');

  // Closed before its entrance: there is nothing to fade.
  if (!shown) {
    finish();

    return;
  }

  host.addEventListener('transitionend', onExitEnd);
  exitFallback = setTimeout(finish, EXIT_FALLBACK_MS);
  host.classList.remove('show');

  if (!swipe) return;

  if (prefersReducedMotion()) {
    // The sheet's cross-fade, where the toast was let go.
    host.style.removeProperty('transition');
    host.style.removeProperty('opacity');

    return;
  }

  host.style.transition = `opacity ${SWIPE_MOTION_MS}ms ease-out, transform ${SWIPE_MOTION_MS}ms ease-out`;
  host.style.transform = `translateX(${swipe.dx + Math.sign(swipe.dx) * swipe.width}px)`;
  host.style.opacity = '0';
};

// Zero-argument: the dismiss button's click handler passes its event.
const close = () => leave();

const runTimer = () => {
  if (!started || leaving.value || !timed() || holds.size > 0) return;

  if (timeoutId !== null) return;
  startTime = performance.now();
  timeoutId = setTimeout(close, Math.max(0, remainingTime));
};

const hold = (kind: 'hover' | 'press') => {
  if (holds.has(kind)) return;
  holds.add(kind);
  host?.classList.add('held');

  if (timeoutId === null) return;
  stopTimer();
  remainingTime -= performance.now() - startTime;
};

const unhold = (kind: 'hover' | 'press') => {
  if (!holds.delete(kind) || holds.size > 0) return;
  host?.classList.remove('held');
  runTimer();
};

const onMouseEnter = () => hold('hover');

const onMouseLeave = () => unhold('hover');

const place = (dx: number, width: number) => {
  if (!host || !drag) return;
  drag.dx = dx;
  host.style.transform = `translateX(${dx}px)`;
  host.style.opacity = String(swipeOpacity(dx, width));
};

const claim = (d: CToastDrag) => {
  if (!host) return;
  d.claimed = true;

  try {
    host.setPointerCapture(d.id);
  } catch {
    // A pointer the browser no longer tracks: the document listeners still
    // follow it.
  }

  host.classList.add('swiping');
  host.style.transition = 'none';
};

// Snap without the sheet's transitions: commit the rest pose with transitions
// off, then hand them back.
const snapToRest = () => {
  if (!host) return;
  host.style.transition = 'none';
  host.style.removeProperty('transform');
  host.style.removeProperty('opacity');
  void getComputedStyle(host).opacity;
  host.style.removeProperty('transition');
};

const returnToRest = (from: number) => {
  if (!host) return;
  host.classList.remove('swiping');

  const opacity = Number(host.style.opacity || 1);

  if (from === 0 || prefersReducedMotion()) {
    snapToRest();

    return;
  }

  // The rest pose goes in underneath with transitions still off, so the only
  // motion is the animation from the release point.
  host.style.removeProperty('transform');
  host.style.removeProperty('opacity');

  const animation = host.animate(
    [
      { opacity, transform: `translateX(${from}px)` },
      { opacity: 1, transform: 'translateX(0)' },
    ],
    { duration: SWIPE_MOTION_MS, easing: 'ease-out' },
  );

  springBack = animation;
  animation.finished.then(
    () => {
      if (springBack !== animation) return;
      springBack = null;
      host.style.removeProperty('transition');
    },
    // Cancelled by a new press or the exit, which take over the styles.
    () => {},
  );
};

const swallowClick = (click: Event) => {
  click.stopPropagation();
  click.preventDefault();
};

const endPress = () => {
  pressId = null;
  drag = null;
  document.removeEventListener('pointermove', onPressMove, true);
  document.removeEventListener('pointerup', onPressEnd, true);
  document.removeEventListener('pointercancel', onPressEnd, true);
  unhold('press');
};

// A press holds the timer however it ends, so its release is followed on the
// document: the pointer may come up anywhere.
const onPointerDown = (event: PointerEvent) => {
  if (!host || !event.isPrimary || event.button !== 0) return;

  if (leaving.value || pressId !== null) return;
  pressId = event.pointerId;
  document.addEventListener('pointermove', onPressMove, true);
  document.addEventListener('pointerup', onPressEnd, true);
  document.addEventListener('pointercancel', onPressEnd, true);
  hold('press');

  if (!swipeable.value) return;

  // Caught springing back: the drag carries on from where the toast is.
  let base = 0;

  if (springBack) {
    springBack.commitStyles();
    springBack.cancel();
    springBack = null;
    base = new DOMMatrixReadOnly(getComputedStyle(host).transform).m41;
  }

  drag = {
    base,
    claimed: false,
    dx: base,
    id: event.pointerId,
    samples: [{ t: event.timeStamp, x: event.clientX }],
    startX: event.clientX,
    startY: event.clientY,
    width: host.getBoundingClientRect().width,
  };

  if (base !== 0) claim(drag);
};

const onPressMove = (event: PointerEvent) => {
  if (!drag || event.pointerId !== drag.id) return;

  const tx = event.clientX - drag.startX;

  drag.samples = drag.samples.filter(
    (s) => event.timeStamp - s.t <= SWIPE_VELOCITY_WINDOW_MS,
  );
  drag.samples.push({ t: event.timeStamp, x: event.clientX });

  if (!drag.claimed) {
    const intent = swipeIntent(tx, event.clientY - drag.startY);

    if (intent === 'pending') return;

    if (intent === 'release') {
      drag = null;

      return;
    }

    claim(drag);
  }

  // A mouse press on the message text began a selection before the claim.
  document.getSelection()?.removeAllRanges();
  place(drag.base + tx, drag.width);
};

const onPressEnd = (event: PointerEvent) => {
  if (event.pointerId !== pressId) return;

  const d = drag;

  endPress();

  if (!d?.claimed) return;

  if (event.type === 'pointercancel') {
    returnToRest(d.dx);

    return;
  }

  // The release may land on the dismiss button: its click ends a drag, it
  // does not activate the button.
  host?.addEventListener('click', swallowClick, { capture: true, once: true });
  requestAnimationFrame(() =>
    host?.removeEventListener('click', swallowClick, { capture: true }),
  );

  d.samples.push({ t: event.timeStamp, x: event.clientX });

  const dx = d.base + event.clientX - d.startX;

  const outcome = swipeOutcome({
    dx,
    velocity: swipeVelocity(d.samples, event.timeStamp),
    width: d.width,
  });

  if (outcome === 'dismiss') {
    host?.classList.remove('swiping');
    leave({ dx, width: d.width });
  } else {
    returnToRest(d.dx);
  }
};

// Capture is lost after every release too; only a live drag springs back.
// A touch press starts captured by the element under the finger, and the
// claim moving capture to the host fires that element's loss, which bubbles
// here: only the host's own loss counts.
const onLostCapture = (event: PointerEvent) => {
  if (event.composedPath()[0] !== host) return;

  if (!drag?.claimed || event.pointerId !== drag.id) return;

  const from = drag.dx;

  drag = null;
  returnToRest(from);
};

// Expose `closeToast` so the parent c-toasts container can dismiss a
// specific toast by querying its host and calling the method — matches
// the @Method() decorator on the original Stencil component.
defineExpose({ closeToast: close });

// Show animation + auto-close timer. Runs exactly once, the first time
// `message` is available.
const start = () => {
  if (started || !host || !props.message) return;
  started = true;
  requestAnimationFrame(() => {
    if (!leaving.value) host.classList.add('show');
  });

  if (!timed()) return;
  remainingTime = Number(props.message.duration || 0);
  runTimer();
};

onMounted(() => {
  if (!host) return;
  host.setAttribute('role', 'alert');
  host.setAttribute('aria-atomic', 'true');
  host.setAttribute('aria-live', 'assertive');
  host.addEventListener('mouseenter', onMouseEnter);
  host.addEventListener('mouseleave', onMouseLeave);
  host.addEventListener('pointerdown', onPointerDown);
  host.addEventListener('lostpointercapture', onLostCapture);

  // The `message` object prop is set across the custom-element boundary and
  // can arrive after mount, so reflect the id, the swipeable state and the
  // type classes reactively. (The visible accent comes from the `type` tv
  // variant; the host classes drive the escape-hatch sheet's host states and
  // the id used by the parent container.)
  watchEffect(() => {
    host.classList.toggle('swipeable', swipeable.value);

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
  stopTimer();

  if (exitFallback !== null) clearTimeout(exitFallback);
  springBack?.cancel();
  document.removeEventListener('pointermove', onPressMove, true);
  document.removeEventListener('pointerup', onPressEnd, true);
  document.removeEventListener('pointercancel', onPressEnd, true);
  host?.removeEventListener('mouseenter', onMouseEnter);
  host?.removeEventListener('mouseleave', onMouseLeave);
  host?.removeEventListener('pointerdown', onPointerDown);
  host?.removeEventListener('lostpointercapture', onLostCapture);
  host?.removeEventListener('transitionend', onExitEnd);
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
  - the swipe dismiss host states (ADR-0073), toggled by JS: `.swipeable`
    leaves vertical pans and pinch-zoom to the page, `.swiping` stops text
    selection while a drag holds the press, and `.leaving` lets the pointer
    through to the toasts gliding in under a fading one. The drag itself
    writes inline `transform`/`opacity` on the host.
  - `:host(.held)` pausing the progress animation via the
    `--_c-toast-animation-state` custom property while a hover or a press
    holds the timer (a host state that must reach a descendant's animation —
    not expressible as a utility).
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
 * remain (only the transform goes); `!important` restores it over the shared
 * sheet's zero duration (ADR-0057). A fade is not movement. */
@media (prefers-reduced-motion: reduce) {
  :host {
    transform: none;
    transition: opacity 0.2s ease;
    transition-duration: 0.2s !important;
    will-change: opacity;
  }
}

/* Horizontal travel is the swipe's; a vertical pan or a pinch that starts on
 * the toast stays the page's. */
:host(.swipeable) {
  touch-action: pan-y pinch-zoom;
}

:host(.swiping) {
  cursor: grabbing;
  user-select: none;
}

:host(.leaving) {
  pointer-events: none;
}

[part='root'] {
  box-shadow:
    rgba(0, 0, 0, 0.07) 0 1px 1px,
    rgba(0, 0, 0, 0.07) 0 2px 2px,
    rgba(0, 0, 0, 0.07) 0 4px 4px,
    rgba(0, 0, 0, 0.07) 0 8px 8px,
    rgba(0, 0, 0, 0.07) 0 16px 16px;
}

:host(.held) {
  --_c-toast-animation-state: paused;
}

/* Progress bar animation. Static size/colour live in the `tv` `progressBar`
 * slot; the animation references the `@keyframes` below and reads its
 * play-state from the hold-driven `--_c-toast-animation-state` custom
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
