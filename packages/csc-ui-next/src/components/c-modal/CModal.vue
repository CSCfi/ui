<template>
  <dialog
    ref="dialogEl"
    class="c-modal"
    :class="{
      'c-modal--standalone': standaloneMode,
      'c-modal--backdrop-blur': !disableBackdropBlur,
    }"
    :style="{ zIndex: String(zIndex) }"
    @keydown="onKeyDown"
    @click="onClick"
  >
    <slot />
  </dialog>
</template>

<script setup lang="ts">
import { onMounted, ref, useHost, useTemplateRef, watch } from 'vue';

const props = defineProps({
  value: { type: Boolean, default: false },
  dismissable: { type: Boolean, default: false },
  width: { type: [String, Number], default: 600 },
  zIndex: { type: Number, default: 10 },
  disableBackdropBlur: { type: Boolean, default: false },
});

const host = useHost();
const dispatchValue = (name: string, value: unknown) => {
  host?.dispatchEvent(new CustomEvent(name, { detail: value }));
};

const dialogEl = useTemplateRef<HTMLDialogElement>('dialogEl');
const standaloneMode = ref(false);

let animationsDisabled = false;
let backdropEl: HTMLElement | null = null;
let nudgeTimer: ReturnType<typeof setTimeout> | null = null;

// `c-main` renders a shared `<c-backdrop>` in its shadow root so all
// modals in the page share one dimmer. If the page isn't wrapped in
// `<c-main>` (standalone usage), fall through to the dialog's native
// ::backdrop pseudo-element which we style in CSS.
const resolveBackdrop = () => {
  const cMain = document.body.querySelector('c-main');
  if (!cMain) {
    standaloneMode.value = true;
    return null;
  }
  standaloneMode.value = false;
  if (!backdropEl) {
    backdropEl =
      (cMain.shadowRoot?.querySelector('c-backdrop') as HTMLElement | null) ||
      null;
  }
  backdropEl?.setAttribute(
    'disable-backdrop-blur',
    String(props.disableBackdropBlur),
  );
  const inner = backdropEl?.shadowRoot?.querySelector('.c-backdrop');
  inner?.classList.remove('closing');
  return backdropEl;
};

const openDialog = () => {
  requestAnimationFrame(() => {
    resolveBackdrop();
    if (!animationsDisabled) {
      const onAnimEnd = () => {
        dialogEl.value?.removeEventListener('animationend', onAnimEnd);
        dialogEl.value?.classList.remove('opening');
      };
      dialogEl.value?.addEventListener('animationend', onAnimEnd);
      dialogEl.value?.classList.add('opening');
      backdropEl?.shadowRoot
        ?.querySelector('.c-backdrop')
        ?.classList.add('opening');
    }
    dialogEl.value?.showModal();
  });
};

const closeDialog = () => {
  if (animationsDisabled) {
    finalizeClose();
    return;
  }
  const onAnimEnd = () => {
    dialogEl.value?.removeEventListener('animationend', onAnimEnd);
    finalizeClose();
  };
  dialogEl.value?.addEventListener('animationend', onAnimEnd);
  dialogEl.value?.classList.add('closing');

  requestAnimationFrame(() => {
    // Count modals still open across the page; only remove backdrop
    // when this is the last one closing.
    const customs = document.querySelectorAll('c-modal');
    let openCount = 0;
    customs.forEach((el) => {
      const dialogs = el.shadowRoot?.querySelectorAll('dialog');
      dialogs?.forEach((d) => {
        if ((d as HTMLDialogElement).open) openCount += 1;
      });
    });
    if (openCount <= 1) {
      const inner = backdropEl?.shadowRoot?.querySelector('.c-backdrop');
      inner?.classList.remove('opening');
      inner?.classList.add('closing');
    }
  });
};

const finalizeClose = () => {
  dialogEl.value?.classList.remove('closing');
  backdropEl?.shadowRoot
    ?.querySelector('.c-backdrop')
    ?.classList.remove('closing');
  dialogEl.value?.close();
  if (document.fullscreenElement) document.exitFullscreen();
};

// Backdrop click detection. The native <dialog> swallows clicks on its
// ::backdrop pseudo as clicks on the dialog itself, so we get the
// dialog rect and compare against pointer coords.
const onClick = (e: MouseEvent) => {
  if (e.clientX === 0 && e.clientY === 0) return;
  if (!dialogEl.value) return;
  const rect = dialogEl.value.getBoundingClientRect();
  const outside =
    e.clientX < rect.left ||
    e.clientX > rect.right ||
    e.clientY < rect.top ||
    e.clientY > rect.bottom;
  if (!outside) return;
  if (!props.dismissable) {
    // Non-dismissable: nudge animation to signal "you can't close
    // this", then revert.
    dialogEl.value.classList.add('nudging');
    if (nudgeTimer !== null) clearTimeout(nudgeTimer);
    nudgeTimer = setTimeout(() => {
      dialogEl.value?.classList.remove('nudging');
      nudgeTimer = null;
    }, 150);
    return;
  }
  closeDialog();
  dispatchValue('changeValue', false);
  dispatchValue('update:value', false);
};

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    e.preventDefault();
    closeDialog();
    dispatchValue('changeValue', false);
    dispatchValue('update:value', false);
  }
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
</script>

<style>
dialog.c-modal {
  background-color: transparent;
  border: none;
  color: var(--c-text-body);
  inset: 0;
  margin: auto;
  max-width: calc(100% - 32px);
  overflow: visible;
  padding: 0;
  width: var(--_c-modal-width, 600px);
}

dialog.c-modal:not([open]) {
  pointer-events: none;
  opacity: 0;
}

dialog.c-modal::backdrop {
  background-color: transparent;
}

/* Standalone (no <c-main>): rely on native ::backdrop for the dimmer
 * instead of the shared c-backdrop element. */
dialog.c-modal--standalone::backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

dialog.c-modal--standalone.c-modal--backdrop-blur::backdrop {
  backdrop-filter: blur(4px);
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
  0% { transform: scale(1); }
  50% { transform: scale(1.03); }
  100% { transform: scale(1); }
}

@keyframes c-modal-open {
  from { transform: scale(0); }
  to { transform: scale(1); }
}

@keyframes c-modal-close {
  to { transform: scale(0); }
}
</style>
