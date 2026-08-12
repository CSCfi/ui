<template>
  <div
    :class="ui.backdrop()"
    :style="{ zIndex: String(layerZ - 1) }"
    part="backdrop"
    @click="onBackdropClick"
  />

  <dialog
    ref="dialogRef"
    :aria-label="dialogLabel || undefined"
    :class="ui.root()"
    :style="{ zIndex: String(layerZ) }"
    aria-modal="true"
    class="c-modal"
    part="root"
    tabindex="-1"
    @close="onNativeClose"
  >
    <slot />
  </dialog>
</template>

<script setup lang="ts">
/**
 * @slot default - The modal contents (typically a c-card)
 *
 * @csspart backdrop - The dimming overlay under the dialog; visible only while this modal is the active (topmost) one
 * @csspart root - The native dialog element forming the modal box
 */
import { tv } from 'tailwind-variants';
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  useHost,
  useTemplateRef,
  watch,
} from 'vue';

import { emitModelValue } from '../../shared/emitModelValue';
import {
  closeModal,
  focusInitialElement,
  MODAL_BAND_BASE,
  type ModalStackEntry,
  openModal,
} from '../../shared/modalStack';

/** Events dispatched by `<c-modal>`. */
interface CModalEvents {
  /**
   * Fired when the modal dismisses itself — a backdrop click or the Escape
   * key on a `dismissable` modal, or a platform-initiated close (e.g. a
   * slotted `<form method="dialog">`). The detail is the new open state,
   * always `false`.
   */
  changeValue: boolean;
  /**
   * Native bubbling input event dispatched alongside every value change so a
   * plain `v-model` stays in sync. Carries no detail.
   */
  input: void;
  /**
   * Fired alongside `changeValue` with the same detail — the `v-model`
   * contract.
   */
  'update:value': boolean;
}

// The template is a fragment (backdrop + dialog): host attribute fallthrough
// would land on BOTH roots, duplicating e.g. the consumer's aria-label onto
// the backdrop div. The dialog mirrors what it needs explicitly.
defineOptions({ inheritAttrs: false });

/**
 * Styling lives in this `tailwind-variants` config; consumer
 * customization is via `::part()`.
 *
 * The dialog is NOT in the browser top layer: it is opened with `.show()` and
 * modality (inert, focus, Escape, scroll lock, paint order) is implemented by
 * the shared modal stack controller — see `src/shared/modalStack.ts`. That
 * is what lets toasts paint above any modal and stay interactive.
 *
 * The backdrop is this modal's own element (the retired shared `c-backdrop` /
 * native `::backdrop` are gone); the controller keeps exactly one backdrop —
 * the active modal's — visible, so its `visible`/`instant` variants are
 * controller-driven state.
 *
 * The static `.c-modal` class and the `.opening` / `.closing` / `.nudging`
 * hooks are RETAINED: they are toggled imperatively by the script and targeted
 * by the escape-hatch `<style>` below, which owns the things utilities can't
 * express — the `:not([open])` closed state and the open/close/nudge
 * `@keyframes`.
 *
 * `--_c-modal-width` is still set imperatively on the host from the `width`
 * prop; the `root` utility reads it (with a 600px fallback) via `w-[…]`.
 */
const modal = tv({
  slots: {
    // Dimming overlay painting the `scrim` colour role. Fades via the opacity
    // transition for the first-in / last-out modal; switches within a stack
    // are instant (see `instant` variant) so the dim level stays flat.
    backdrop:
      'fixed inset-0 bg-scrim/50 opacity-0 pointer-events-none transition-opacity duration-300 motion-reduce:transition-none',
    // The native <dialog> is the positioned overlay box. It must not be
    // `display:contents`, so the box lives on this element (not the host).
    root: 'block fixed inset-0 m-auto p-0 border-0 bg-transparent overflow-visible max-w-[calc(100%-32px)] w-[var(--_c-modal-width,600px)] text-on-surface-muted',
  },
  variants: {
    blur: {
      true: { backdrop: 'backdrop-blur-[4px]' },
    },
    instant: {
      true: { backdrop: 'transition-none' },
    },
    visible: {
      true: { backdrop: 'opacity-100 pointer-events-auto' },
    },
  },
});

interface CModalProps {
  /**
   * Disable backdrop blur effect
   */
  disableBackdropBlur?: boolean;
  /**
   * Dismissed when touching/clicking outside the content or pressing Escape.
   * A non-dismissable modal responds to either gesture with a nudge animation
   * instead of closing.
   */
  dismissable?: boolean;
  /**
   * Is the modal visible
   */
  value?: boolean;
  /**
   * Width of the dialog. Numeric value is considered as pixel value (400 -> 400px)
   */
  width?: number | string;
}

const props = withDefaults(defineProps<CModalProps>(), {
  disableBackdropBlur: false,
  dismissable: false,
  value: false,
  width: 600,
});

const host = useHost();

// changeValue/update:value + native `input` (plain v-model) + host `value`
// mirror. The value watch is visuals-only (open/close), so no loop.
const dispatchValue = (value: CModalEvents['changeValue']) =>
  emitModelValue(host, value);

const dialogRef = useTemplateRef<HTMLDialogElement>('dialogRef');

// Controller-assigned paint order within the modal stacking band;
// the backdrop sits directly beneath the dialog at `layerZ - 1`.
const layerZ = ref(MODAL_BAND_BASE + 1);

const backdropVisible = ref(false);

const backdropInstant = ref(false);

const dialogLabel = ref<null | string>(null);

const ui = computed(() =>
  modal({
    blur: !props.disableBackdropBlur,
    instant: backdropInstant.value,
    visible: backdropVisible.value,
  }),
);

let animationsDisabled = false;

let nudgeTimer: null | ReturnType<typeof setTimeout> = null;

// True while `finalizeClose` runs `dialog.close()`, so the native `close`
// listener can tell our own teardown apart from a platform-initiated close.
let internalClose = false;

const nudge = () => {
  dialogRef.value?.classList.add('nudging');

  if (nudgeTimer !== null) clearTimeout(nudgeTimer);
  nudgeTimer = setTimeout(() => {
    dialogRef.value?.classList.remove('nudging');
    nudgeTimer = null;
  }, 150);
};

const entry: ModalStackEntry = {
  get host() {
    return host as HTMLElement;
  },
  onEscape: () => {
    if (!props.dismissable) {
      nudge();

      return;
    }

    closeDialog();
    dispatchValue(false);
  },
  setBackdropVisible: (visible, animate) => {
    backdropInstant.value = !animate;
    backdropVisible.value = visible;
  },
  setLayer: (zIndex) => {
    layerZ.value = zIndex;
  },
};

const openDialog = () => {
  if (!dialogRef.value || dialogRef.value.open || !host) return;

  // Register first: the controller captures the currently focused element
  // (for restore on close) before focus moves into the dialog, then applies
  // layers, backdrop, inert, scroll lock and Escape routing.
  openModal(entry);

  // Accessible name: mirrored from the host, since `aria-labelledby` cannot
  // reference the slotted (light DOM) title across the shadow boundary.
  dialogLabel.value = host.getAttribute('aria-label');

  if (!dialogLabel.value) {
    console.warn(
      '<c-modal> opened without an accessible name. Set aria-label on the c-modal element.',
    );
  }

  if (!animationsDisabled) {
    const onAnimEnd = () => {
      dialogRef.value?.removeEventListener('animationend', onAnimEnd);
      dialogRef.value?.classList.remove('opening');
    };

    dialogRef.value.addEventListener('animationend', onAnimEnd);
    dialogRef.value.classList.add('opening');
  }

  // `.show()`, NOT `.showModal()` — modality without the top layer,
  // so toasts can paint above the modal and stay interactive.
  dialogRef.value.show();

  focusInitialElement(host, dialogRef.value);
};

const closeDialog = () => {
  // Nothing to close. Guards against a spurious close animation: the dialog is
  // `display:block` even when closed (only `:not([open])` opacity hides it), so
  // adding `.closing` to a never-opened dialog would play the close keyframe
  // from a visible state — a flash on load when the `value` watch fires false
  // during prop initialization.
  if (!dialogRef.value?.open) return;

  // Unregister at close *start*: inert lifts, focus restores and Escape
  // re-routes immediately; only the exit animation is still playing.
  closeModal(entry);

  if (animationsDisabled) {
    finalizeClose();

    return;
  }

  const onAnimEnd = () => {
    dialogRef.value?.removeEventListener('animationend', onAnimEnd);
    finalizeClose();
  };

  dialogRef.value.addEventListener('animationend', onAnimEnd);
  dialogRef.value.classList.add('closing');
};

const finalizeClose = () => {
  dialogRef.value?.classList.remove('closing');

  internalClose = true;
  dialogRef.value?.close();
  internalClose = false;
};

/**
 * Convergence point for platform-initiated closes — a slotted
 * `<form method="dialog">` or a direct `dialog.close()` call fires this
 * without going through `closeDialog()`. Run the same teardown so the stack,
 * inert state and the consumer's `value` never desync.
 */
const onNativeClose = () => {
  if (internalClose) return;

  closeModal(entry);
  dialogRef.value?.classList.remove('opening', 'closing');
  dispatchValue(false);
};

// The backdrop is a real element beneath the dialog box, so an outside
// click lands on it directly — no rect math against the dialog needed.
const onBackdropClick = () => {
  if (!props.dismissable) {
    // Non-dismissable: nudge animation to signal "you can't close
    // this", then revert.
    nudge();

    return;
  }

  closeDialog();
  dispatchValue(false);
};

watch(
  () => props.value,
  (next) => {
    if (next) openDialog();
    else closeDialog();
  },
);

onMounted(() => {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  animationsDisabled = query.matches;

  // Stencil set this on componentWillLoad; we set it once on mount.
  // Numeric width → "Npx", string width → as-is.
  const width =
    typeof props.width === 'number' || !isNaN(Number(props.width))
      ? `${props.width}px`
      : String(props.width);
  host?.style.setProperty('--_c-modal-width', width);

  if (props.value) openDialog();
});

onBeforeUnmount(() => {
  // A modal removed from the DOM while open must release the stack (inert,
  // scroll lock, Escape routing) or the page stays locked forever.
  closeModal(entry);

  if (nudgeTimer !== null) clearTimeout(nudgeTimer);
});
</script>

<!--
  Escape-hatch CSS: constructs Tailwind utilities cannot express —
  the `:not([open])` closed state of the native <dialog> and the open / close /
  nudge `@keyframes` toggled imperatively via the `.opening` / `.closing` /
  `.nudging` class hooks. The dialog box and backdrop looks live in the `tv`
  config above. (No `::backdrop` rules: the dialog is opened with `.show()`,
  which has no native backdrop — the backdrop is a real element.)
-->
<style>
dialog.c-modal:not([open]) {
  pointer-events: none;
  opacity: 0;
}

@media (prefers-reduced-motion: no-preference) {
  dialog.nudging {
    animation: c-modal-nudge 0.15s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
  }
  dialog.opening {
    animation: c-modal-open 0.3s cubic-bezier(0.25, 0.8, 0.5, 1) forwards;
  }
  dialog.closing {
    animation: c-modal-close 0.3s cubic-bezier(0.25, 0.8, 0.5, 1) forwards;
  }
}

@keyframes c-modal-nudge {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.03);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes c-modal-open {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

@keyframes c-modal-close {
  to {
    transform: scale(0);
  }
}
</style>
