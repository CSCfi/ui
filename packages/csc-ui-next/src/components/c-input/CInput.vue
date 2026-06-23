<template>
  <div
    ref="root"
    class="c-input"
    :class="{
      'c-input--disabled': disabled,
      'c-input--shadow': shadow,
      'c-input--label-on-top': labelOnTop,
      'c-input--textarea': isTextarea,
      'c-input--error': !valid,
      'c-input--active': isActiveResolved,
      'c-input--filled': filled,
    }"
  >
    <label
      v-if="labelOnTop && label"
      ref="labelTopRef"
      :for="inputId || undefined"
      class="c-input__label c-input__label--top"
    >
      {{ label
      }}<span v-if="required" class="c-input__required" aria-hidden="true"
        >&nbsp;*</span
      >
    </label>

    <div class="c-input__control">
      <div class="c-input__slot" @click="focusInput">
        <fieldset v-if="!shadow" class="c-input__fieldset" aria-hidden="true">
          <legend
            class="c-input__legend"
            :class="{
              'c-input__legend--active': (isActiveResolved || filled) && !labelOnTop,
            }"
            :style="{ '--_c-input-legend-width': legendWidth + 'px' }"
          >
            <span class="notranslate"></span>
          </legend>
        </fieldset>

        <div
          class="c-input__field"
          :style="{ '--_c-input-label-position': preSlotWidth + 'px' }"
        >
          <span
            v-show="hasPreSlot"
            ref="preSlotWrapper"
            class="c-input__pre"
            ><slot name="pre"
          /></span>

          <label
            v-if="!labelOnTop && label"
            ref="labelInlineRef"
            :for="inputId || undefined"
            class="c-input__label c-input__label--floating"
            :class="{
              'c-input__label--lifted': isActiveResolved || filled,
            }"
          >
            {{ label
            }}<span v-if="required" class="c-input__required" aria-hidden="true"
              >&nbsp;*</span
            >
          </label>

          <slot />

          <span v-show="hasPostSlot" class="c-input__post"><slot name="post" /></span>
        </div>
      </div>

      <Transition name="c-input-message" mode="out-in">
        <span
          v-if="!hideDetails && messageVisible"
          :key="messageKey"
          class="c-input__message"
          :class="{ 'c-input__message--error': !valid }"
        >
          <svg
            v-if="!valid"
            class="c-input__message-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path :d="errorIconPath" />
          </svg>
          <span class="visuallyhidden">{{
            !valid ? "Error: " : "Hint: "
          }}</span>
          <span>{{ !valid && validation ? validation : hint }}</span>
        </span>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { mdiCloseCircle } from "@mdi/js";
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  useHost,
  useShadowRoot,
  useTemplateRef,
  watch,
} from "vue";
import { useHasSlot } from "../../shared/useHasSlot";

const props = defineProps({
  label: { type: String, default: "" },
  labelOnTop: { type: Boolean, default: false },
  hint: { type: String, default: "" },
  validation: { type: String, default: "Required field" },
  hideDetails: { type: Boolean, default: false },
  valid: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  shadow: { type: Boolean, default: false },
  /** Set by the wrapping form component when its input has focus or holds a value. */
  active: { type: Boolean, default: false },
  /** Set by the wrapping form component when its input holds a value. */
  filled: { type: Boolean, default: false },
  /** Renders textarea-specific spacing tweaks. */
  isTextarea: { type: Boolean, default: false },
  /** id of the inner input element (for the label's htmlFor). */
  inputId: { type: String, default: "" },
});

const errorIconPath = mdiCloseCircle;

const host = useHost();
const shadowRoot = useShadowRoot();
const root = useTemplateRef<HTMLElement>("root");
const labelInlineRef = useTemplateRef<HTMLLabelElement>("labelInlineRef");
const labelTopRef = useTemplateRef<HTMLLabelElement>("labelTopRef");
const preSlotWrapper = useTemplateRef<HTMLElement>("preSlotWrapper");

const isFocused = ref(false);
const isActiveResolved = computed(() => props.active || isFocused.value);

// Detect whether the pre/post slots have any projected content.
// Without this, the always-rendered wrapper spans would still consume a
// flex `gap` from the parent layout (the `:empty` CSS selector doesn't
// fire because the wrapper contains a <slot> child node).
const hasPreSlot = useHasSlot(root, "pre");
const hasPostSlot = useHasSlot(root, "post");

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

// preSlotWidth shifts the floating label rightwards to align with the
// input's text start when the consumer has projected pre-slot content.
const preSlotWidth = ref(0);
const measurePreSlot = () => {
  preSlotWidth.value = preSlotWrapper.value?.offsetWidth ?? 0;
};

const messageKey = computed(() =>
  !props.valid ? `error:${props.validation}` : `hint:${props.hint}`,
);
const messageVisible = computed(() =>
  Boolean(props.hint || (!props.valid && props.validation)),
);

let labelObserver: ResizeObserver | null = null;
let preSlotObserver: ResizeObserver | null = null;

const focusInput = () => {
  // Click on the slot area (not directly on the input) should still focus
  // the projected input. The default slot lives in our shadow root, so we
  // walk its assignedElements and focus the first focusable native input.
  const slot = shadowRoot?.querySelector(
    "slot:not([name])",
  ) as HTMLSlotElement | null;
  if (!slot) return;
  for (const el of slot.assignedElements({ flatten: true })) {
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      el.focus();
      return;
    }
    const inner = (el as HTMLElement).querySelector?.("input, textarea");
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
  if (typeof ResizeObserver !== "undefined") {
    const el = labelInlineRef.value || labelTopRef.value;
    if (el) {
      labelObserver = new ResizeObserver(measureLabel);
      labelObserver.observe(el);
    }
    if (preSlotWrapper.value) {
      preSlotObserver = new ResizeObserver(measurePreSlot);
      preSlotObserver.observe(preSlotWrapper.value);
    }
  }
  // focusin/focusout bubble across shadow boundaries when the slotted
  // input gains/loses focus, so listening on the host catches them.
  host?.addEventListener("focusin", onFocusIn);
  host?.addEventListener("focusout", onFocusOut);
});

onBeforeUnmount(() => {
  labelObserver?.disconnect();
  preSlotObserver?.disconnect();
  host?.removeEventListener("focusin", onFocusIn);
  host?.removeEventListener("focusout", onFocusOut);
});

watch(
  () => props.label,
  () => requestAnimationFrame(measureLabel),
);
</script>

<style>
/* Ported from packages/csc-ui/src/components/c-input/c-input.scss with
 * the structure adapted for shadow-DOM custom-element usage:
 *   - The original c-input was Stencil light-DOM (`shadow: false`) so its
 *     CSS targeted slotted `input`/`textarea` directly. In shadow DOM we
 *     use `::slotted(...)` for the projected input + a small set of
 *     custom-property bridges so the consumer's input picks up our text /
 *     placeholder colours.
 *   - The outlined Material-style border is rendered via <fieldset> +
 *     <legend>; the legend grows from width:0 to the cached
 *     `--_c-input-legend-width` on focus/fill, producing the "notch"
 *     cutout for the floating label.
 *   - Floating label transforms: idle = translateX(preSlotWidth) at
 *     scale(1); active/filled = translateX(0) translateY(-18px) scale(0.75)
 *     sitting in the legend notch. Same easing/timing as the original. */

:host {
  --_c-input-inactive-color: var(
    --c-input-inactive-color,
    var(--c-tertiary-600)
  );
  --_c-input-active-color: var(--c-input-active-color, var(--c-primary-600));
  --_c-input-background-color: var(
    --c-input-background-color,
    var(--c-transparent)
  );
  --_c-input-text-color: var(--c-input-text-color, var(--c-text-body));
  --_c-input-placeholder-color: var(
    --c-input-placeholder-color,
    var(--c-tertiary-400)
  );
  --_c-input-label-color: var(
    --c-input-label-color,
    var(--_c-input-inactive-color)
  );
  --_c-input-error-color: var(--c-error-600);
  --_c-input-shadow-active-color: var(
    --c-input-shadow-active-color,
    var(--_c-input-active-color)
  );
  --_c-input-shadow-background-color: var(
    --c-input-shadow-background-color,
    var(--c-white)
  );

  display: block;
  font-family: var(--c-font-family);
  color: var(--_c-input-text-color);
}

/* Expose the inactive / active / error colour to slotted inputs via
 * inheritable custom properties — the input itself just uses
 * `color: inherit` and `caret-color: var(--_c-input-active-color)`. */

.visuallyhidden {
  border: 0;
  clip: rect(0 0 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}

.c-input {
  --_c-input-border-width: 1px;
  --_c-input-border-radius: 4px;

  display: flex;
  flex-direction: column;
  align-items: stretch;
  border-radius: var(--_c-input-border-radius);
  font-size: 16px;
  max-width: 100%;
  text-align: left;
  color: var(--_c-input-inactive-color);
}

.c-input--label-on-top {
  gap: 4px;
}

/* ---- top label -------------------------------------------------------- */

.c-input__label--top {
  font-size: 14px;
  font-weight: 500;
  color: var(--_c-input-label-color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

/* ---- control / slot --------------------------------------------------- */

.c-input__control {
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
  min-width: 0;
  width: 100%;
}

.c-input__slot {
  position: relative;
  display: flex;
  align-items: stretch;
  min-height: 44px;
  padding: 0 12px;
  border-radius: var(--_c-input-border-radius);
  background: transparent;
  cursor: text;
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}

.c-input--disabled .c-input__slot {
  cursor: not-allowed;
}

.c-input__field {
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  gap: 8px;
  position: relative;
}

.c-input__pre,
.c-input__post {
  display: inline-flex;
  align-items: center;
}

.c-input__pre:empty,
.c-input__post:empty {
  display: none;
}

/* ---- outlined fieldset + legend (Material notch) ---------------------- */

.c-input__fieldset {
  position: absolute;
  inset: 0;
  margin: 0;
  padding: 0 0 0 8px;
  border-collapse: collapse;
  border-color: var(--_c-input-inactive-color);
  /* Set explicitly (not `inherit`) — the inheritance chain through
   * `.c-input__control` (no border-radius set) would resolve to 0. */
  border-radius: var(--_c-input-border-radius);
  border-style: solid;
  border-width: var(--_c-input-border-width);
  background-color: var(--_c-input-background-color);
  pointer-events: none;
  transition: border-color 0.15s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.c-input__legend {
  float: none;
  line-height: 11px;
  margin-left: -1px;
  padding: 0;
  text-align: left;
  width: 0;
  transition: width 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}

.c-input__legend--active {
  width: var(--_c-input-legend-width);
}

/* ---- floating label inside the field ---------------------------------- */

.c-input__label--floating {
  position: absolute;
  top: 12px;
  left: 0;
  right: auto;
  height: 20px;
  line-height: 20px;
  font-size: 16px;
  max-width: 90%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  pointer-events: none;
  color: var(--_c-input-inactive-color);
  transform-origin: top left;
  transform: translateX(var(--_c-input-label-position, 0px)) translateY(0)
    scale(1);
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1) 0.08s;
}

.c-input__label--lifted {
  transform: translateX(0) translateY(-18px) scale(0.75);
}

.c-input__required {
  color: var(--c-error-600);
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
  caret-color: var(--_c-input-active-color);
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
  color: var(--_c-input-placeholder-color);
  opacity: 1;
}

/* ---- active state ----------------------------------------------------- */

.c-input--active,
.c-input:focus-within {
  --_c-input-border-width: 2px;
  color: var(--_c-input-active-color);
}

.c-input--active .c-input__fieldset,
.c-input:focus-within .c-input__fieldset {
  border-color: var(--_c-input-active-color);
}

.c-input--active .c-input__label--floating,
.c-input:focus-within .c-input__label--floating {
  color: var(--_c-input-active-color);
  transform: translateX(0) translateY(-18px) scale(0.75);
}

.c-input--filled .c-input__label--floating {
  transform: translateX(0) translateY(-18px) scale(0.75);
}

/* ---- error state ------------------------------------------------------ */

.c-input--error {
  color: var(--_c-input-error-color);
}

.c-input--error .c-input__fieldset {
  border-color: var(--_c-input-error-color) !important;
}

.c-input--error .c-input__label,
.c-input--error .c-input__label--floating {
  color: var(--_c-input-error-color) !important;
}

/* ---- shadow variant --------------------------------------------------- */

.c-input--shadow .c-input__slot {
  background-color: var(--_c-input-shadow-background-color);
  box-shadow: rgba(0, 0, 0, 0.15) 0 5px 15px 0;
}

.c-input--shadow .c-input__slot:focus-within {
  outline: 2px solid var(--_c-input-shadow-active-color);
}

/* ---- disabled --------------------------------------------------------- */

.c-input--disabled {
  opacity: 0.75;
}

/* ---- textarea --------------------------------------------------------- */

.c-input--textarea .c-input__field {
  margin-right: -12px;
}

/* ---- message ---------------------------------------------------------- */

.c-input__message {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  padding: 0 12px;
  font-size: 12px;
  line-height: 1;
  min-height: 16px;
  color: var(--c-message-hint-color, var(--c-text-system));
}

.c-input--label-on-top .c-input__message {
  padding: 0;
}

.c-input__message--error {
  color: var(--c-message-error-color, var(--_c-input-error-color));
}

.c-input__message-icon {
  fill: currentColor;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  position: relative;
  top: -2px;
}

/* Same 200ms slide+fade transition the c-checkbox uses, so hint↔error
 * swaps animate consistently across form components. */
.c-input-message-enter-active,
.c-input-message-leave-active {
  transition:
    opacity 0.2s cubic-bezier(0.25, 0.8, 0.5, 1),
    transform 0.2s cubic-bezier(0.25, 0.8, 0.5, 1);
}

.c-input-message-enter-from,
.c-input-message-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
