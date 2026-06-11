<template>
  <div class="c-toast__box">
    <span class="visuallyhidden">{{ message?.type || "" }} notification</span>

    <div v-if="message?.custom" class="c-toast__custom-item">
      <div class="c-toast__content">
        <slot />
      </div>
    </div>
    <div v-else class="c-toast__item">
      <svg viewBox="0 0 24 24">
        <path :d="icons[message?.type || 'info']" />
      </svg>
      <div class="c-toast__content">
        <p v-if="message?.title">{{ message.title }}</p>
        {{ message?.message }}
      </div>
      <c-icon-button
        v-if="!message?.indeterminate && !message?.closeText"
        text
        size="small"
        aria-label="close"
        @click="close"
      >
        <c-icon :color="'var(--_c-toast-color)'" :path="icons.close" />
      </c-icon-button>
      <c-button
        v-if="!message?.indeterminate && message?.closeText"
        text
        size="small"
        aria-label="close"
        @click="close"
      >
        <c-icon
          slot="icon"
          :color="'var(--_c-toast-color)'"
          :path="icons.close"
        />
        {{ message.closeText }}
      </c-button>
    </div>

    <div
      v-if="showProgress"
      class="c-toast__progress"
      :style="{ '--_c-toast-duration': `${message?.duration}ms` }"
    >
      <div
        class="c-toast__progress__bar"
        :class="{ indeterminate: message?.indeterminate }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  mdiAlert,
  mdiCheckCircle,
  mdiClose,
  mdiCloseCircle,
  mdiInformation,
} from "@mdi/js";
import {
  computed,
  onBeforeUnmount,
  onMounted,
  useHost,
  watch,
  watchEffect,
} from "vue";

interface ToastMessage {
  message: string;
  title?: string;
  type?: "info" | "warning" | "error" | "success";
  duration?: number;
  persistent?: boolean;
  id?: string;
  closeText?: string;
  indeterminate?: boolean;
  progress?: boolean;
  custom?: boolean;
}

const props = defineProps({
  message: { type: Object as () => ToastMessage, default: null },
});

const host = useHost();

const icons: Record<string, string> = {
  close: mdiClose,
  warning: mdiAlert,
  error: mdiCloseCircle,
  success: mdiCheckCircle,
  info: mdiInformation,
};

const showProgress = computed(
  () => !props.message?.persistent && props.message?.progress,
);

let closed = false;
let startTime = 0;
let remainingTime = 0;
let timeoutId: ReturnType<typeof setTimeout> | null = null;

const close = () => {
  if (closed) return;
  closed = true;
  if (!host) return;
  host.classList.remove("show");
  const onEnd = () => {
    host.removeEventListener("transitionend", onEnd);
    host.dispatchEvent(new CustomEvent("close", { detail: props.message }));
  };
  host.addEventListener("transitionend", onEnd);
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

const TYPES = ["info", "success", "warning", "error"];

// Show animation + auto-close timer. Runs exactly once, the first time
// `message` is available.
let started = false;
const start = () => {
  if (started || !host || !props.message) return;
  started = true;
  requestAnimationFrame(() => host.classList.add("show"));
  if (props.message.persistent || props.message.indeterminate) return;
  startTime = Date.now();
  remainingTime = Number(props.message.duration || 0);
  timeoutId = setTimeout(close, remainingTime);
};

onMounted(() => {
  if (!host) return;
  host.setAttribute("role", "alert");
  host.setAttribute("aria-atomic", "true");
  host.setAttribute("aria-live", "assertive");
  host.addEventListener("mouseenter", onMouseEnter);
  host.addEventListener("mouseleave", onMouseLeave);

  // The `message` object prop is set across the custom-element boundary
  // and can arrive after mount, so reflect the id + type class
  // reactively. The type class is what defines `--_c-toast-color`, which
  // the border/accent depend on — applying it one-shot in onMounted
  // missed late-arriving messages and left the toast borderless.
  watchEffect(() => {
    if (!props.message) return;
    host.id = `c-toast--${props.message.id || ""}`;
    TYPES.forEach((t) => host.classList.toggle(t, props.message.type === t));
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
  host?.removeEventListener("mouseenter", onMouseEnter);
  host?.removeEventListener("mouseleave", onMouseLeave);
});
</script>

<style>
/* IMPORTANT — why the visual box (border/padding/background/shadow) lives
 * on `.c-toast__box` and NOT on `:host`:
 *
 * This sheet ships with Tailwind's preflight, whose universal reset
 * `*, ::before, ::after, ::backdrop { border: 0 solid; padding: 0;
 * margin: 0 }` is injected into every component's shadow root. A
 * <c-toast> is rendered inside <c-toasts>'s shadow root, so c-toasts'
 * own `*` rule matches the c-toast host element. Per the shadow-DOM
 * cascade a normal declaration from the outer tree beats a `:host`
 * normal declaration, so an `:host { border; padding }` here would be
 * overwritten by the parent's `* { border:0; padding:0 }` — the toast
 * rendered borderless and flush.
 *
 * Putting the box model on an inner class-selected element sidesteps it:
 * `.c-toast__box` lives in c-toast's OWN shadow root (invisible to the
 * parent's `*`), and a class selector outranks the same-tree `*` reset. */
:host {
  --_c-toast-background-color: var(--c-toast-background-color, var(--c-white));
  --_c-toast-text-color: var(--c-toast-text-color, var(--c-text-system));
  --_c-toast-animation-state: running;

  color: var(--_c-toast-text-color);
  display: block;
  opacity: 0;
  pointer-events: all;
  position: relative;
  text-align: left;
  transform: translateY(20px);
  transition:
    opacity 0.5s ease,
    transform 0.5s ease;
  width: 100%;
  will-change: opacity, transform;
  z-index: 10001;
}

.c-toast__box {
  align-items: center;
  background-color: var(--_c-toast-background-color);
  border-radius: 6px;
  /* Fallback to the info accent so an untyped toast still renders its
   * border + 12px left bar. Without a fallback, an undefined
   * --_c-toast-color makes the whole `border` shorthand invalid at
   * computed-value time and the border disappears entirely. */
  border: 2px solid var(--_c-toast-color, var(--c-info-600));
  border-left-width: 12px;
  box-shadow:
    rgba(0, 0, 0, 0.07) 0 1px 1px,
    rgba(0, 0, 0, 0.07) 0 2px 2px,
    rgba(0, 0, 0, 0.07) 0 4px 4px,
    rgba(0, 0, 0, 0.07) 0 8px 8px,
    rgba(0, 0, 0, 0.07) 0 16px 16px;
  box-sizing: border-box;
  display: grid;
  min-height: 52px;
  padding: 8px 12px;
  width: 100%;
}

:host(.show) {
  opacity: 1;
  transform: translateY(0);
}

:host(.info) {
  --_c-toast-color: var(--c-info-600);
}
:host(.error) {
  --_c-toast-color: var(--c-error-600);
}
:host(.warning) {
  --_c-toast-color: var(--c-warning-600);
}
:host(.success) {
  --_c-toast-color: var(--c-success-600);
}

:host(:hover) {
  --_c-toast-animation-state: paused;
}

.c-toast__content p {
  margin: 0;
  font-weight: 600;
}

.c-toast__item {
  align-items: center;
  display: grid;
  gap: 12px;
  grid-auto-columns: auto;
  grid-auto-flow: column;
  grid-template-columns: 24px 1fr;
  font-weight: 300;
}

.c-toast__item > svg {
  fill: var(--_c-toast-color);
  height: 24px;
  width: 24px;
}

.c-toast__progress {
  background-color: var(--c-tertiary-200);
  border-radius: 8px;
  height: 6px;
  margin-top: 8px;
  overflow: hidden;
  transform: translateZ(0);
}

.c-toast__progress__bar {
  animation-duration: var(--_c-toast-duration);
  animation-fill-mode: forwards;
  animation-iteration-count: 1;
  animation-name: c-toast-timer;
  animation-play-state: var(--_c-toast-animation-state);
  animation-timing-function: linear;
  background-color: var(--_c-toast-color);
  border-radius: 8px;
  height: 6px;
  width: 100%;
}

.c-toast__progress__bar.indeterminate {
  animation: c-toast-indeterminate 2s infinite linear;
  left: -100%;
  width: 50%;
  position: relative;
  transform-origin: 0% 50%;
}

.visuallyhidden {
  border: 0;
  clip: rect(1px, 1px, 1px, 1px);
  height: 1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  width: 1px;
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
