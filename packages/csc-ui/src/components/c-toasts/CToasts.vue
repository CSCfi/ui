<template>
  <div ref="containerRef" :class="ui.root()" part="root">
    <c-toast
      v-for="msg in messages"
      :key="msg.id"
      ref="toastRefs"
      :message="msg"
      @close="onChildClose"
    >
      <slot v-if="msg.custom" />
    </c-toast>
  </div>
</template>

<script lang="ts">
/**
 * Horizontal placement of the toast stack.
 */
export type CToastsHorizontal = 'center' | 'left' | 'right';

export interface CToastsProps {
  /**
   * Use absolute positioning
   *
   * @seeded from csc-ui — verify
   */
  absolute?: boolean;

  /**
   * Horizontal position
   *
   * @seeded from csc-ui — verify
   */
  horizontal?: CToastsHorizontal;

  /**
   * Vertical position
   *
   * @seeded from csc-ui — verify
   */
  vertical?: CToastsVertical;
}

/**
 * Vertical placement of the toast stack.
 */
export type CToastsVertical = 'bottom' | 'top';
</script>

<script setup lang="ts">
/**
 * @slot default - Content of a custom toast message, projected into the single `custom`-flagged c-toast
 * @csspart root - The grid container the toast items stack in
 *
 * @subcomponents c-toast
 */
import { tv } from 'tailwind-variants';
import {
  computed,
  nextTick,
  onMounted,
  ref,
  useHost,
  useTemplateRef,
  watchEffect,
} from 'vue';

import type { CToastMessage } from '../../types';

import { TOAST_BAND } from '../../shared/modalStack';
import { prefersReducedMotion } from '../../shared/reducedMotion';

// Placement state (`absolute`/`top`/`bottom`/`left`/`right`/`center`) is toggled
// imperatively as classes on the HOST so the `:host(.absolute)` etc. rules below
// can match it. Without this, Vue mirrors the host's `class` onto the single
// template root (`[part="root"]`) via attribute fallthrough — and because
// `absolute` is also a Tailwind utility, the inner grid would inherit
// `position: absolute`, collapse out of the host's flow, shrink-wrap to its
// content and spill out of the container. Keep host classes on the host only.
defineOptions({ inheritAttrs: false });

/**
 * Styling lives in this `tailwind-variants` config. Only the inner
 * container grid is a utility region (`root`); the host itself is the fixed
 * positioned overlay whose placement is driven by the `absolute` / `vertical`
 * / `horizontal` props. Those `:host(.absolute|.top|.bottom|.left|.right
 * |.center)` rules are positional host state toggled imperatively as classes,
 * so they stay in the escape-hatch sheet below. Consumer
 * customization is via `::part()`.
 */
const toasts = tv({
  slots: {
    root: 'relative grid grid-cols-[1fr] gap-3 p-3',
  },
});

const props = withDefaults(defineProps<CToastsProps>(), {
  absolute: false,
  horizontal: 'center',
  vertical: 'bottom',
});

const host = useHost();

const containerRef = useTemplateRef<HTMLElement>('containerRef');

const messages = ref<CToastMessage[]>([]);

const ui = computed(() => toasts());

let nextId = 0;

// The stack glide (ADR-0073): when a toast arrives or leaves, the toasts that
// change place move there from where they were.
const GLIDE_ID = 'c-toasts-glide';

const GLIDE_MS = 250;

// The toasts still in the stack's flow, in order; a leaving one is pinned out
// of it.
const toastsInFlow = (): HTMLElement[] =>
  Array.from(
    containerRef.value?.querySelectorAll<HTMLElement>('c-toast') ?? [],
  ).filter((el) => !el.classList.contains('leaving'));

const snapshot = (except?: HTMLElement): Map<HTMLElement, number> =>
  new Map(
    toastsInFlow()
      .filter((el) => el !== except)
      .map((el) => [el, el.getBoundingClientRect().top]),
  );

// Call after the layout change. A glide still running is cancelled before the
// new places are measured, so a toast caught mid-glide carries on from where
// it is instead of jumping by the old offset.
const glide = (before: Map<HTMLElement, number>) => {
  for (const el of before.keys()) {
    for (const animation of el.getAnimations()) {
      if (animation.id === GLIDE_ID) animation.cancel();
    }
  }

  if (prefersReducedMotion()) return;

  for (const [el, top] of before) {
    if (!el.isConnected) continue;

    const dy = top - el.getBoundingClientRect().top;

    if (Math.abs(dy) < 0.5) continue;

    // The independent `translate` property, so the glide never fights a
    // toast's own enter, exit or swipe `transform`.
    el.animate([{ translate: `0 ${dy}px` }, { translate: '0 0' }], {
      duration: GLIDE_MS,
      easing: 'ease-out',
      id: GLIDE_ID,
    });
  }
};

// A toast starting its exit: pin it where it is, above its neighbours, while
// they glide into its place. The pin holds the edge the stack is anchored to:
// a bottom stack shrinks from the top, which would carry a top-pinned toast
// down with it.
const _toastLeaving = (toast: HTMLElement) => {
  const root = containerRef.value;

  if (!root || toast.parentElement !== root) return;

  const before = snapshot(toast);

  const width = getComputedStyle(toast).width;

  const left = toast.offsetLeft;

  const top = toast.offsetTop;

  const bottom = root.clientHeight - toast.offsetTop - toast.offsetHeight;

  toast.style.position = 'absolute';
  toast.style.left = `${left}px`;
  toast.style.width = width;
  toast.style.zIndex = '1';

  if (vertical.value === 'top') toast.style.top = `${top}px`;
  else toast.style.bottom = `${bottom}px`;

  glide(before);
};

const defaultOptions = () => ({
  duration: 6000,
  id: `c-toast-item-${++nextId}`,
  indeterminate: false,
  persistent: false,
  progress: false,
  type: 'info' as const,
});

// Public method: append a new toast. Custom toasts are limited to 1 at
// a time because slot reflection can only project to one place.
/**
 * Add a new message
 *
 * @seeded from csc-ui — verify
 */
const addToast = (message: CToastMessage) => {
  const hasCustom = messages.value.some((m) => m.custom);

  if (message.custom && hasCustom) {
    console.warn(
      'Custom toast messages are restricted to 1 visible message due to slot reflection limitations.',
    );

    return;
  }

  requestAnimationFrame(async () => {
    const defaults = defaultOptions();

    const before = snapshot();

    messages.value = [
      ...messages.value,
      {
        ...defaults,
        ...message,
        duration:
          Number(message?.duration) > 0
            ? Number(message.duration)
            : defaults.duration,
      },
    ];

    // After the whole flush, still before this frame paints.
    await nextTick();
    glide(before);
  });
};

// Public method: imperatively close a toast by id. Reaches into the
// rendered c-toast's exposed `closeToast` method (set via defineExpose
// in CToast.vue).
/**
 * Remove a message by id (id should be specified in the addToast params)
 *
 * @seeded from csc-ui — verify
 */
const removeToast = (id: string) => {
  const toast = containerRef.value?.querySelector(`#c-toast--${id}`) as
    | ({ closeToast?: () => void } & HTMLElement)
    | null;
  toast?.closeToast?.();
};

const onChildClose = (event: CustomEvent<CToastMessage>) => {
  const id = event.detail?.id;

  if (!id) return;

  const toast = containerRef.value?.querySelector(`#c-toast--${id}`);
  toast?.remove();

  const remaining = containerRef.value?.querySelectorAll('c-toast').length || 0;

  if (remaining === 0) {
    messages.value = [];
  }
};

defineExpose({ _toastLeaving, addToast, removeToast });

// Attributes can deliver any string at runtime; unknown placements fall back
// to the default center/bottom — otherwise an invalid `vertical`
// would leave the stack with no anchor class at all.
const horizontal = computed(() =>
  props.horizontal === 'left' || props.horizontal === 'right'
    ? props.horizontal
    : 'center',
);

const vertical = computed(() => (props.vertical === 'top' ? 'top' : 'bottom'));

onMounted(() => {
  if (!host) return;

  // Toast stacking band: above the modal band, below the browser
  // top layer. Set from the shared constant so modal and toast paint order
  // have a single source of truth. The modal stack controller additionally
  // exempts c-toasts from inerting, so toasts stay interactive over modals.
  host.style.zIndex = String(TOAST_BAND);

  watchEffect(() => {
    host.classList.toggle('absolute', props.absolute);
    host.classList.toggle('top', vertical.value === 'top');
    host.classList.toggle('bottom', vertical.value === 'bottom');
    host.classList.toggle('left', horizontal.value === 'left');
    host.classList.toggle('right', horizontal.value === 'right');
    host.classList.toggle('center', horizontal.value === 'center');
  });
});
</script>

<!--
  Escape-hatch CSS: only constructs Tailwind utilities cannot
  express. The inner container grid lives in the `tv` `root` slot above; here
  remains the host itself, which must be a real fixed/absolute positioned
  overlay box (utilities can't target the host, and this host is the structural
  positioning anchor for the toast stack). `display:block` is REQUIRED to
  override the global `:host{display:contents}`: a `display:contents` host
  generates no box, so `position:fixed/absolute` is ignored and the stack falls
  into normal flow (below the page content). The per-type sheet is adopted after
  the shared sheet, so this wins. The placement variants are positional host
  state toggled imperatively as classes.
-->
<style>
:host {
  display: block;
  position: fixed;
  left: 0;
  right: 0;
  width: 640px;
  max-width: 100%;
  min-width: 30vw;
  pointer-events: none;
  /* Enter/exit offset for the child c-toasts: anchored surfaces slide in
   * from — and retreat toward — the edge they are anchored to. The custom
   * property inherits across the shadow boundary into each c-toast host,
   * whose transition reads it; `.top` flips the direction. */
  --_c-toast-enter-y: 20px;
  /* z-index is set imperatively from the shared TOAST_BAND constant. */
}

:host(.absolute) {
  position: absolute;
}
:host(.bottom) {
  bottom: 0;
}
:host(.top) {
  top: 0;
  --_c-toast-enter-y: -20px;
}
:host(.right) {
  justify-content: end;
  left: auto;
  right: 0;
}
:host(.left) {
  justify-content: start;
  left: 0;
  right: auto;
}
:host(.center) {
  justify-content: center;
  margin: 0 auto !important;
}
</style>
