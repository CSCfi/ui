<template>
  <div ref="rootRef" :class="ui.root()" part="root">
    <label
      v-if="labelOnTop && label"
      ref="labelTopRef"
      :class="ui.labelTop()"
      :for="inputId || undefined"
      part="label"
    >
      {{ label }}
      <span v-if="required" :class="ui.required()" aria-hidden="true">
        &nbsp;*
      </span>
    </label>

    <div :class="ui.control()">
      <div :class="ui.slot()" @click="focusInput">
        <fieldset v-if="!shadow" :class="ui.fieldset()" aria-hidden="true">
          <legend
            :class="ui.legend()"
            :data-active="
              ((isActiveResolved || filled) && !labelOnTop) || undefined
            "
            :style="{
              '--_c-input-legend-width': legendWidth + 'px',
              ...(transitionsReady ? {} : { transition: 'none' }),
            }"
          >
            <span class="notranslate" />
          </legend>
        </fieldset>

        <div
          :class="ui.field()"
          :style="{ '--_c-input-label-position': preSlotWidth + 'px' }"
        >
          <span
            v-show="hasPreSlot"
            ref="preSlotWrapperRef"
            :class="ui.pre()"
            part="pre"
          >
            <slot name="pre" />
          </span>

          <label
            v-if="!labelOnTop && label"
            ref="labelInlineRef"
            :class="ui.labelFloating()"
            :data-lifted="isActiveResolved || filled || undefined"
            :for="inputId || undefined"
            :style="transitionsReady ? undefined : { transition: 'none' }"
            part="label"
          >
            {{ label }}
            <span v-if="required" :class="ui.required()" aria-hidden="true">
              &nbsp;*
            </span>
          </label>

          <slot />

          <span v-show="hasPostSlot" :class="ui.post()" part="post">
            <slot name="post" />
          </span>
        </div>
      </div>

      <div v-if="!isHideDetails()" :class="ui.message()" part="message">
        <transition mode="out-in" name="c-input-message">
          <span
            v-if="messageVisible"
            :key="messageKey"
            :class="ui.messageLine()"
          >
            <svg
              v-if="!valid"
              :class="ui.messageIcon()"
              aria-hidden="true"
              viewBox="0 0 24 24"
            >
              <path :d="errorIconPath" />
            </svg>

            <span :class="ui.visuallyHidden()">
              {{ !valid ? 'Error: ' : 'Hint: ' }}
            </span>

            <span>{{ !valid && validation ? validation : hint }}</span>
          </span>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @slot pre - Leading content (e.g. an icon) inside the field, before the input
 * @slot default - The native `<input>` / `<textarea>` element the field wraps
 * @slot post - Trailing content (e.g. an icon or button) inside the field, after the input
 *
 * @csspart root - The outer wrapper of the whole input control
 * @csspart label - The label element — the on-top label or the floating in-field label, depending on `labelOnTop`
 * @csspart pre - Wrapper around the `pre` slot content
 * @csspart post - Wrapper around the `post` slot content
 * @csspart message - The hint / validation message area below the field
 */
import { mdiCloseCircle } from '@mdi/js';
import { tv } from 'tailwind-variants';
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  useHost,
  useShadowRoot,
  useTemplateRef,
  watch,
} from 'vue';

import { coerceBoolean } from '../../shared/coerceBoolean';
import { useHasSlot } from '../../shared/useHasSlot';

/**
 * Styling lives in this `tailwind-variants` config (ADR-0004). The old
 * `--_c-input-*` indirection layer is dropped: colours map to design-token
 * utilities. Consumer customization is via `::part()` (ADR-0006).
 *
 * The STATIC structure / layout (control, slot box, field, floating label
 * resting transform, message) is authored here as utilities. The
 * inactive→active→error colour precedence is `active`/`error` variants:
 * `active` folds in native focus via `isActiveResolved` (so the old
 * `:focus-within` selector is gone) and `error` is declared after `active` so
 * tailwind-merge lets it win the shared root-colour / fieldset-border (the old
 * `!important` is gone). Only two things stay in the escape-hatch <style> below
 * (ADR-0007): the runtime-var-driven bits — the legend "notch" width and the
 * floating-label lift transform (keyed off the internal `data-lifted` /
 * `data-active` hooks the script still sets on those elements) — and the
 * slotted `<input>`/`<textarea>` (which we don't own) via `::slotted(...)`.
 */
const input = tv({
  compoundVariants: [
    // Color the label on active field only if the 'labelOnTop' is set to 'false'
    {
      active: true,
      class: {
        root: 'text-primary',
      },
      disabled: false,
      error: false,
      labelOnTop: false,
      shadow: false,
    },
  ],
  defaultVariants: {
    active: false,
    disabled: false,
    error: false,
    labelOnTop: false,
    shadow: false,
    textarea: false,
  },
  slots: {
    control: 'flex flex-col gap-2 relative min-w-0 w-full',
    field: 'c-input__field flex flex-auto items-center gap-2 relative',
    fieldset:
      'c-input__fieldset absolute inset-0 m-0 py-0 pr-0 pl-2 rounded-csc-md border border-solid border-border-strong bg-transparent pointer-events-none [border-collapse:collapse] [transition:border-color_0.15s_cubic-bezier(0.25,0.8,0.25,1)]',
    // The resting transform (translateX preslot shift + the Noto-metric
    // vertical nudge) lives in the escape-hatch <style>: it reads the
    // underscored runtime var `--_c-input-label-position`, which a Tailwind
    // arbitrary value mangles (the leading `_` becomes a space). Only
    // transform-origin + the transition stay here as utilities.
    labelFloating:
      'c-input__label--floating absolute top-3 left-0 right-auto h-5 leading-5 text-base max-w-[90%] overflow-hidden text-ellipsis whitespace-nowrap pointer-events-none origin-top-left [transition:0.3s_var(--ease-standard)_0.08s]',
    labelTop:
      'c-input__label--top text-sm font-medium overflow-hidden text-ellipsis whitespace-nowrap max-w-full',
    legend:
      'c-input__legend float-none leading-[11px] -ml-px p-0 text-left w-0 [transition:width_0.3s_var(--ease-standard)]',
    // Outer message AREA: reserved whenever details aren't hidden (the `min-h-4`
    // holds 16px even with no hint/error) so a hint-less field keeps the same
    // height as one with a message and the layout doesn't shift when a message
    // appears — matching the original c-message, which always reserved its
    // min-height. The actual hint/error line (`messageLine`) fades in/out inside.
    message:
      'c-input__message px-3 text-xs leading-none min-h-4 text-on-surface-muted',
    messageIcon: 'fill-current size-4 shrink-0 relative -top-0.5',
    // Inner hint/error line: lays out the (optional) error icon + text.
    messageLine: 'flex items-start gap-1',
    post: 'c-input__post inline-flex items-center empty:hidden',
    pre: 'c-input__pre inline-flex items-center empty:hidden',
    required: 'text-error',
    // `c-input` is the DOM hook the escape-hatch <style> still uses for the
    // legend-notch width + the floating-label transform. The base inactive
    // colour lives here too (the slotted input + labels inherit it); the
    // active/error variants below override it, with tailwind-merge picking the
    // winner so no `!important` is needed.
    root: 'c-input flex flex-col items-stretch rounded text-base max-w-full text-left text-on-surface-muted',
    slot: 'c-input__slot relative flex items-stretch min-h-11 px-3 rounded-csc-md bg-transparent cursor-text transition-all duration-300 ease-standard',
    visuallyHidden:
      'absolute w-px h-px m-[-1px] p-0 overflow-hidden whitespace-nowrap border-0 [clip:rect(0_0_0_0)]',
  },
  variants: {
    // Active state (driven by the `active` prop OR native focus, both folded
    // into `isActiveResolved` — which replaces the old `:focus-within` selector):
    // the root recolours to primary (labels + slotted text inherit it) and the
    // fieldset border thickens. The label LIFT transform is handled separately by
    // the `data-lifted` hook in the escape-hatch <style>.
    active: {
      true: {
        fieldset: 'border-2 border-primary',
        // root: 'text-primary',
      },
    },
    disabled: {
      true: { root: 'opacity-75', slot: 'cursor-not-allowed' },
    },
    // Error state. Declared AFTER `active` so tailwind-merge resolves the
    // overlapping root colour and fieldset border-colour to the error token
    // (this replaces the original `!important` that made error beat focus). The
    // fieldset keeps active's 2px width when both apply, matching the original.
    error: {
      true: {
        fieldset: 'border-error',
        message: 'text-error',
        root: 'text-error',
      },
    },
    labelOnTop: {
      true: { message: 'px-0', root: 'gap-1' },
    },
    // Shadow style: the slot becomes a white, drop-shadowed box that draws a
    // primary outline on focus instead of the fieldset notch (the fieldset
    // isn't rendered in shadow mode — see the template `v-if="!shadow"`).
    shadow: {
      true: {
        slot: 'bg-surface-overlay [box-shadow:rgba(0,0,0,0.15)_0_5px_15px_0] focus-within:outline-2 focus-within:outline-solid focus-within:outline-primary',
      },
    },
    textarea: {
      true: { field: '-mr-3' },
    },
  },
});

interface CInputProps {
  /** Set by the wrapping form component when its input has focus or holds a value. */
  active?: boolean;
  /**
   * Disable the input
   *
   * @seeded from csc-ui — verify
   */
  disabled?: boolean;
  /** Set by the wrapping form component when its input holds a value. */
  filled?: boolean;
  /**
   * Hide the hint and error messages
   *
   * @seeded from csc-ui — verify
   */
  hideDetails?: boolean;
  /**
   * Hint text for the input
   *
   * @seeded from csc-ui — verify
   * @freeform
   */
  hint?: string;
  /**
   * id of the inner input element (for the label's htmlFor).
   *
   * @freeform
   */
  inputId?: string;
  /** Renders textarea-specific spacing tweaks. */
  isTextarea?: boolean;
  /**
   * Label of the input
   *
   * @seeded from csc-ui — verify
   * @freeform
   */
  label?: string;
  /**
   * Label on top of the input
   *
   * @seeded from csc-ui — verify
   */
  labelOnTop?: boolean;
  /**
   * Set the input as required
   *
   * @seeded from csc-ui — verify
   */
  required?: boolean;
  /**
   * Shadow variant of the input
   *
   * @seeded from csc-ui — verify
   */
  shadow?: boolean;
  /**
   * Set the validíty of the input
   *
   * @seeded from csc-ui — verify
   */
  valid?: boolean;
  /**
   * Custom validation message
   *
   * @seeded from csc-ui — verify
   * @freeform
   */
  validation?: string;
}

const props = withDefaults(defineProps<CInputProps>(), {
  active: false,
  disabled: false,
  filled: false,
  hideDetails: false,
  hint: '',
  inputId: '',
  isTextarea: false,
  label: '',
  labelOnTop: false,
  required: false,
  shadow: false,
  valid: true,
  validation: 'Required field',
});

const errorIconPath = mdiCloseCircle;

const host = useHost();

const shadowRoot = useShadowRoot();

// Resolve `hideDetails` at render time, robust to Vue's `defineCustomElement`
// resetting the inner Boolean prop to false on re-render. Order:
//   1. `data-hide-details` — the channel wrapper components (c-select, …)
//      forward through. A plain `data-*` attr doesn't collide with the declared
//      `hideDetails` prop, so Vue patches it reliably across the wrapper's
//      re-renders (a direct `hide-details` binding gets mangled/removed).
//   2. the host `hide-details` attribute — direct attribute usage.
//   3. the `hideDetails` prop — property usage.
// Called as a function in the template so it re-reads every render rather than
// caching like a computed.
const isHideDetails = (): boolean => {
  const data = host?.getAttribute('data-hide-details');

  if (data != null) return coerceBoolean(data);

  if (host?.hasAttribute('hide-details'))
    return coerceBoolean(host.getAttribute('hide-details'));

  return coerceBoolean(props.hideDetails);
};

const rootRef = useTemplateRef<HTMLElement>('rootRef');

const labelInlineRef = useTemplateRef<HTMLLabelElement>('labelInlineRef');

const labelTopRef = useTemplateRef<HTMLLabelElement>('labelTopRef');

const preSlotWrapperRef = useTemplateRef<HTMLElement>('preSlotWrapperRef');

const isFocused = ref(false);

const isActiveResolved = computed(() => props.active || isFocused.value);

const ui = computed(() =>
  input({
    active: isActiveResolved.value,
    disabled: props.disabled,
    error: !props.valid,
    labelOnTop: props.labelOnTop,
    shadow: props.shadow,
    textarea: props.isTextarea,
  }),
);

// Detect whether the pre/post slots have any projected content.
// Without this, the always-rendered wrapper spans would still consume a
// flex `gap` from the parent layout (the `:empty` CSS selector doesn't
// fire because the wrapper contains a <slot> child node).
const hasPreSlot = useHasSlot(rootRef, 'pre');

const hasPostSlot = useHasSlot(rootRef, 'post');

// Label width drives the legend's "notch" cutout in the fieldset border.
// Stencil computes it as scrollWidth × 0.75 (the active label scale factor)
// plus a 6px breathing room. Re-measure on label-text change and on any
// font-load that changes the rendered size, via ResizeObserver.
const labelWidth = ref(0);

const legendWidth = computed(() =>
  isActiveResolved.value || props.filled ? labelWidth.value : 0,
);

const measureLabel = () => {
  const el = labelInlineRef.value || labelTopRef.value;

  if (el) labelWidth.value = el.scrollWidth * 0.75 + 6;
};

// The legend/label transitions are enabled one frame AFTER mount. The mount
// measurements read `scrollWidth`/`offsetWidth`, forcing a reflow that
// establishes the pre-measurement values (legend width 0) as transition start
// states — without this gate, a field that mounts already filled paints with
// the top border running through its lifted label and the notch visibly
// animating open.
const transitionsReady = ref(false);

// preSlotWidth shifts the floating label rightwards to align with the
// input's text start when the consumer has projected pre-slot content.
const preSlotWidth = ref(0);

const measurePreSlot = () => {
  const el = preSlotWrapperRef.value;

  const width = el?.offsetWidth ?? 0;

  // The pre-slot icon and the input are flex siblings separated by the field's
  // column-gap, so the input text starts one gap past the icon. Shift the
  // resting label by that same gap so it lines up with the value (and the
  // lifted label sits above it), instead of resting flush against the icon.
  // Only when pre content exists — with no icon the label rests at the field
  // origin, already aligned with the input.
  const gap =
    width && el?.parentElement
      ? parseFloat(getComputedStyle(el.parentElement).columnGap) || 0
      : 0;

  preSlotWidth.value = width ? width + gap : 0;
};

const messageKey = computed(() =>
  !props.valid ? `error:${props.validation}` : `hint:${props.hint}`,
);

const messageVisible = computed(() =>
  Boolean(props.hint || (!props.valid && props.validation)),
);

let labelObserver: null | ResizeObserver = null;

let preSlotObserver: null | ResizeObserver = null;

const focusInput = () => {
  // Click on the slot area (not directly on the input) should still focus
  // the projected input. The default slot lives in our shadow root, so we
  // walk its assignedElements and focus the first focusable native input.
  const slot = shadowRoot?.querySelector(
    'slot:not([name])',
  ) as HTMLSlotElement | null;

  if (!slot) return;

  for (const el of slot.assignedElements({ flatten: true })) {
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      el.focus();

      return;
    }

    const inner = (el as HTMLElement).querySelector?.('input, textarea');

    if (inner) {
      (inner as HTMLInputElement | HTMLTextAreaElement).focus();

      return;
    }
  }
};

const onFocusIn = () => {
  isFocused.value = true;
};

const onFocusOut = () => {
  isFocused.value = false;
};

onMounted(() => {
  measureLabel();
  measurePreSlot();

  requestAnimationFrame(() => {
    transitionsReady.value = true;
  });

  if (typeof ResizeObserver !== 'undefined') {
    const el = labelInlineRef.value || labelTopRef.value;

    if (el) {
      labelObserver = new ResizeObserver(measureLabel);
      labelObserver.observe(el);
    }

    if (preSlotWrapperRef.value) {
      preSlotObserver = new ResizeObserver(measurePreSlot);
      preSlotObserver.observe(preSlotWrapperRef.value);
    }
  }

  // focusin/focusout bubble across shadow boundaries when the slotted
  // input gains/loses focus, so listening on the host catches them.
  host?.addEventListener('focusin', onFocusIn);
  host?.addEventListener('focusout', onFocusOut);
});

onBeforeUnmount(() => {
  labelObserver?.disconnect();
  preSlotObserver?.disconnect();
  host?.removeEventListener('focusin', onFocusIn);
  host?.removeEventListener('focusout', onFocusOut);
});

watch(
  () => props.label,
  () => requestAnimationFrame(measureLabel),
);
</script>

<!--
  Escape-hatch CSS (ADR-0007): only constructs Tailwind utilities cannot
  express. The static structure/layout lives in the `tv` config above. What
  remains here, tokens-only:
    - `:host` — the host must be a real box (overriding the global
      `:host{display:contents}`), and it sets the inheritable `font-family`
      + base text colour the slotted `<input>`/`<textarea>` pick up via
      `color: inherit`.
    - `::slotted(input|textarea)` + their `::placeholder` — we don't own the
      projected control, so it can only be reached via `::slotted(...)`.
    - The two runtime-var-driven transforms keyed on internal `data-*` hooks the
      script sets directly on the legend/label: the legend "notch" width
      (`--_c-input-legend-width`) and the floating-label resting/lifted transform
      (`--_c-input-label-position`, `data-lifted`). These read underscored runtime
      vars a Tailwind arbitrary value would mangle. The active/error colour states
      moved to `active`/`error` tv variants (see the config above).
-->
<style>
:host {
  display: block;
  font-family: var(--c-font-family);
  color: var(--c-on-surface);
}

/* ---- slotted input / textarea (we don't own the element) -------------- */
::slotted(input),
::slotted(textarea) {
  background: transparent;
  border: 0;
  outline: 0;
  padding: 8px 0;
  margin: 0;
  font: inherit;
  font-size: 16px;
  line-height: 20px;
  color: inherit;
  caret-color: var(--c-primary);
  flex: 1 1 auto;
  min-width: 0;
  width: 100%;
  max-width: 100%;
}

::slotted(textarea) {
  margin-top: 4px;
  min-height: 44px;
  padding: 8px 12px 8px 0;
  resize: vertical;
  white-space: pre-wrap;
}

::slotted(input)::placeholder,
::slotted(textarea)::placeholder {
  color: var(--c-on-surface-muted);
  opacity: 0.5;
}

/* ---- legend notch width (runtime var) --------------------------------- */
.c-input__legend[data-active] {
  width: var(--_c-input-legend-width);
}

/* Resting (unfocused, empty) label. translateX shifts it past any pre-slot
 * content (the runtime var); translateY(-2px) raises it ~2px so the default
 * Noto Sans glyphs — which sit low in the line-box — centre vertically in the
 * field instead of hanging below centre. Lifted rules below override this. */
.c-input__label--floating {
  transform: translateX(var(--_c-input-label-position, 0px)) translateY(-2px)
    scale(1);
}

/* The lifted label straddles the top border. translateY centres the label's
 * glyphs on the border line; -20px (not the geometric -18px) compensates for
 * the default Noto Sans metrics, whose glyphs sit low in the line-box and would
 * otherwise leave the text hanging below the border. */
.c-input__label--floating[data-lifted] {
  transform: translateX(0) translateY(-20px) scale(0.75);
}

/* Same 200ms slide+fade transition the c-checkbox uses, so hint↔error
 * swaps animate consistently across form components. */
.c-input-message-enter-active,
.c-input-message-leave-active {
  transition:
    opacity 0.2s var(--ease-standard),
    transform 0.2s var(--ease-standard);
}

.c-input-message-enter-from,
.c-input-message-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
