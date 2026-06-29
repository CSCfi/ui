<template>
  <dialog
    ref="dialogRef"
    :class="[
      ui.root(),
      {
        'c-modal--standalone': standaloneMode,
        'c-modal--backdrop-blur': !disableBackdropBlur,
      },
    ]"
    :style="{ zIndex: String(zIndex) }"
    class="c-modal"
    part="root"
    @click="onClick"
    @keydown="onKeyDown"
  >
    <slot />
  </dialog>
</template>

<script setup lang="ts">
import { tv } from 'tailwind-variants';
import { computed, onMounted, ref, useHost, useTemplateRef, watch } from 'vue';

import { emitModelValue } from '../../shared/emitModelValue';

/**
 * Styling lives in this `tailwind-variants` config (ADR-0004); consumer
 * customization is via `::part()` (ADR-0006).
 *
 * The dialog box look (centred, transparent, dynamic width) is authored as
 * utilities here. The static `.c-modal` (plus `.c-modal--standalone` /
 * `.c-modal--backdrop-blur`) class and the `.opening` / `.closing` / `.nudging`
 * hooks are RETAINED: they are toggled imperatively by the script and targeted
 * by the escape-hatch `<style>` below, which owns the things utilities can't
 * express — the native `::backdrop` pseudo-element, the `:not([open])` closed
 * state, and the open/close/nudge `@keyframes`.
 *
 * `--_c-modal-width` is still set imperatively on the host from the `width`
 * prop; the `root` utility reads it (with a 600px fallback) via `w-[…]`.
 */
const modal = tv({
  slots: {
    // The native <dialog> is the positioned overlay box. It must not be
    // `display:contents`, so the box lives on this element (not the host).
    root: 'block fixed inset-0 m-auto p-0 border-0 bg-transparent overflow-visible max-w-[calc(100%-32px)] w-[var(--_c-modal-width,600px)] text-[var(--c-text-body)]',
  },
});

const ui = computed(() => modal());

interface CModalProps {
  disableBackdropBlur?: boolean;
  dismissable?: boolean;
  value?: boolean;
  width?: number | string;
  zIndex?: number;
}

const props = withDefaults(defineProps<CModalProps>(), {
  disableBackdropBlur: false,
  dismissable: false,
  value: false,
  width: 600,
  zIndex: 10,
});

const host = useHost();

const dialogRef = useTemplateRef<HTMLDialogElement>('dialogRef');

const standaloneMode = ref(false);

let animationsDisabled = false;

let backdropEl: HTMLElement | null = null;

let nudgeTimer: null | ReturnType<typeof setTimeout> = null;

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

  // Set the PROPERTY, not an attribute: c-backdrop's `disableBackdropBlur` is a
  // Boolean custom-element prop, and Vue coerces the attribute string "false"
  // to truthy `true` — which would silently disable the blur. Assigning the
  // real boolean drives the reactive prop correctly.
  if (backdropEl) {
    (
      backdropEl as unknown as { disableBackdropBlur: boolean }
    ).disableBackdropBlur = props.disableBackdropBlur;
  }

  const inner = backdropEl?.shadowRoot?.querySelector('.c-backdrop');
  inner?.classList.remove('closing');

  return backdropEl;
};

const openDialog = () => {
  requestAnimationFrame(() => {
    resolveBackdrop();

    if (!animationsDisabled) {
      const onAnimEnd = () => {
        dialogRef.value?.removeEventListener('animationend', onAnimEnd);
        dialogRef.value?.classList.remove('opening');
      };

      dialogRef.value?.addEventListener('animationend', onAnimEnd);
      dialogRef.value?.classList.add('opening');
      backdropEl?.shadowRoot
        ?.querySelector('.c-backdrop')
        ?.classList.add('opening');
    }

    dialogRef.value?.showModal();
  });
};

const closeDialog = () => {
  if (animationsDisabled) {
    finalizeClose();

    return;
  }

  const onAnimEnd = () => {
    dialogRef.value?.removeEventListener('animationend', onAnimEnd);
    finalizeClose();
  };

  dialogRef.value?.addEventListener('animationend', onAnimEnd);
  dialogRef.value?.classList.add('closing');

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
  dialogRef.value?.classList.remove('closing');
  backdropEl?.shadowRoot
    ?.querySelector('.c-backdrop')
    ?.classList.remove('closing');
  dialogRef.value?.close();

  if (document.fullscreenElement) document.exitFullscreen();
};

// Backdrop click detection. The native <dialog> swallows clicks on its
// ::backdrop pseudo as clicks on the dialog itself, so we get the
// dialog rect and compare against pointer coords.
const onClick = (e: MouseEvent) => {
  if (e.clientX === 0 && e.clientY === 0) return;

  if (!dialogRef.value) return;

  const rect = dialogRef.value.getBoundingClientRect();

  const outside =
    e.clientX < rect.left ||
    e.clientX > rect.right ||
    e.clientY < rect.top ||
    e.clientY > rect.bottom;

  if (!outside) return;

  if (!props.dismissable) {
    // Non-dismissable: nudge animation to signal "you can't close
    // this", then revert.
    dialogRef.value.classList.add('nudging');

    if (nudgeTimer !== null) clearTimeout(nudgeTimer);
    nudgeTimer = setTimeout(() => {
      dialogRef.value?.classList.remove('nudging');
      nudgeTimer = null;
    }, 150);

    return;
  }

  closeDialog();
  // changeValue/update:value + native `input` (plain v-model) + host `value`
  // mirror. The value watch is visuals-only (open/close), so no loop.
  emitModelValue(host, false);
};

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    e.preventDefault();
    closeDialog();
    emitModelValue(host, false);
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

<!--
  Escape-hatch CSS (ADR-0007): constructs Tailwind utilities cannot express —
  the native `::backdrop` pseudo-element (standalone dimmer / blur), the
  `:not([open])` closed state of the native <dialog>, and the open / close /
  nudge `@keyframes` toggled imperatively via the `.opening` / `.closing` /
  `.nudging` class hooks. The dialog box look lives in the `tv` config above.
-->
<style>
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
