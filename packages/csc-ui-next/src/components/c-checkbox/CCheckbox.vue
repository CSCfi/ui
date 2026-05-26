<template>
  <div
    ref="root"
    class="c-checkbox"
    :class="{
      'c-checkbox--disabled': disabled,
      'c-checkbox--error': !valid,
    }"
  >
    <input
      :id="inputId"
      class="visuallyhidden"
      type="checkbox"
      :name="hostName || undefined"
      :checked="isChecked"
      :disabled="disabled"
      :required="required"
      :aria-checked="indeterminate ? 'mixed' : String(isChecked)"
      @change="onChange"
    >
    <label :for="inputId" class="c-checkbox__label">
      <span class="c-checkbox__ripple">
        <svg
          v-if="isChecked || indeterminate"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          <path
            v-if="indeterminate"
            class="c-checkbox__path c-checkbox__path--indeterminate"
            d="M20 56 h60 v-8 h-60 z"
          />
          <path
            v-else
            class="c-checkbox__path"
            d="M 12 52 l 24 24 l 47 -47 l -3 -3 l -44 44 l -21 -21 l -3 3"
          />
        </svg>
      </span>

      <span
        v-show="!!label || hasSlotContent"
        class="c-checkbox__label-content"
      >
        <span v-if="label">{{ label }}</span>
        <span v-show="!label" class="c-checkbox__slot-wrapper"><slot /></span>
        <span v-if="required" class="c-checkbox__required" aria-hidden="true">&nbsp;*</span>
      </span>
    </label>

    <!-- Mode `out-in` mirrors the Stencil c-message lifecycle: the
         outgoing message slides up + fades out, then 200ms later the new
         message slides down + fades in. `:key` forces a re-mount whenever
         the message identity (hint vs error, or text content) changes. -->
    <Transition name="c-checkbox-message" mode="out-in">
      <span
        v-if="!hideDetails && messageVisible"
        :key="messageKey"
        class="c-checkbox__message"
        :class="{ 'c-checkbox__message--error': !valid }"
      >
        <svg
          v-if="!valid"
          class="c-checkbox__message-icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path :d="errorIconPath" />
        </svg>
        <span class="visuallyhidden">{{ !valid ? 'Error: ' : 'Hint: ' }}</span>
        <span>{{ !valid && validation ? validation : hint }}</span>
      </span>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { mdiCloseCircle } from '@mdi/js';
import { computed, ref, useHost, useTemplateRef, watch } from 'vue';
import { useHasSlot } from '../../shared/useHasSlot';

const errorIconPath = mdiCloseCircle;

const props = defineProps({
  checked: { type: Boolean, default: false },
  value: { type: [Boolean, String, Number], default: false },
  trueValue: { type: [Boolean, String, Number], default: true },
  falseValue: { type: [Boolean, String, Number], default: false },
  disabled: { type: Boolean, default: false },
  indeterminate: { type: Boolean, default: false },
  label: { type: String, default: '' },
  required: { type: Boolean, default: false },
  valid: { type: Boolean, default: true },
  validation: { type: String, default: 'Required field' },
  hint: { type: String, default: '' },
  hideDetails: { type: Boolean, default: false },
  hostId: { type: String, default: '' },
  hostName: { type: String, default: '' },
});

// Event emissions are dispatched directly on the host as CustomEvents
// with `detail` set to the raw value. Vue's own `emit()` for
// defineCustomElement wraps every emit's args into `detail: [...args]`
// (always an array), which breaks consumers like the `v-control`
// directive that do `el.value = event.detail`. Manual dispatch keeps
// `detail` as the bare value, matching the Stencil component's behaviour.
const host = useHost();
const dispatchValue = (name: string, value: unknown) => {
  host?.dispatchEvent(new CustomEvent(name, { detail: value }));
};

const root = useTemplateRef<HTMLElement>('root');
const hasSlotContent = useHasSlot(root, '');

let uid = 0;
const inputId = computed(() => props.hostId || `c-checkbox-${++uid}`);

// The Transition's `:key` swaps the element when message identity
// changes (hint↔error or text changes), triggering the slide animation.
const messageKey = computed(() =>
  !props.valid ? `error:${props.validation}` : `hint:${props.hint}`,
);
const messageVisible = computed(() =>
  Boolean(props.hint || (!props.valid && props.validation)),
);

const internalChecked = ref(props.checked || props.value === props.trueValue);
const isChecked = computed(() => internalChecked.value);

watch(
  () => props.value,
  (v) => {
    internalChecked.value = v === props.trueValue;
  },
);

watch(
  () => props.checked,
  (c) => {
    internalChecked.value = c;
  },
);

const onChange = (_event: Event) => {
  if (props.disabled) return;
  internalChecked.value = !internalChecked.value;
  const nextValue = internalChecked.value ? props.trueValue : props.falseValue;
  // Modern Vue v-model contract.
  dispatchValue('update:value', nextValue);
  // Transitional bridge for legacy `v-control` directive — ADR 0003 plans
  // to drop this at v1 once consumers have migrated to v-model:value.
  dispatchValue('changeValue', nextValue);
  // Standard DOM change for non-Vue consumers; re-dispatched from the
  // host because the inner <input>'s native change event doesn't escape
  // the shadow root (composed: false by default).
  host?.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
};
</script>

<style>
/* Ported from packages/csc-ui/src/components/c-checkbox/c-checkbox.scss.
 *
 * Structure: hidden <input> + visible <label>. The label contains a 42×42
 * circular "ripple" wrapper (the surface that picks up the hover
 * background colour) and a 18×18 ::before square (the actual checkbox
 * visual, with 2px border-radius — squarish, not pill). The SVG check
 * mark is 14×14 absolutely positioned inside the ripple. Text content
 * sits next to the ripple with `padding-top: 10px` to vertically align
 * with the checkbox centre inside the 42-tall ripple area. */

:host {
  --_c-checkbox-background-color-hover: var(
    --c-checkbox-background-color-hover,
    rgba(var(--c-primary-rgb), 0.1)
  );
  --_c-checkbox-color: var(--c-checkbox-color, var(--c-primary-600));
  --_c-checkbox-color-active: var(
    --c-checkbox-color-active,
    var(--_c-checkbox-color)
  );
  --_c-checkbox-color-disabled: var(
    --c-checkbox-color-disabled,
    var(--c-tertiary-500)
  );
  --_c-checkbox-color-error: var(--c-error-600);

  display: inline-block;
  /* Host does NOT set a color — the label text inherits document text
   * colour (`--c-text-body` via the Tailwind theme on the consumer page).
   * Only the disabled / error states override the colour explicitly. */
}

.c-checkbox {
  position: relative;
  width: fit-content;
}

.c-checkbox__label {
  cursor: pointer;
  display: flex;
  gap: 4px;
  position: relative;
  user-select: none;
}

.c-checkbox__ripple {
  border-radius: 50%;
  color: var(--_c-checkbox-color-active);
  display: grid;
  height: 42px;
  min-width: 42px;
  width: 42px;
  overflow: hidden;
  place-content: center;
  position: relative;
  transform: translateZ(0);
  transition: background-color 0.2s ease;
}

/* The actual checkbox visual — a 18×18 square with 2px-radius corners. */
.c-checkbox__ripple::before {
  content: '';
  position: absolute;
  top: 12px;
  left: 12px;
  width: 18px;
  height: 18px;
  border: 2px solid var(--_c-checkbox-color);
  border-radius: 2px;
  background-color: transparent;
  transition: background-color 0.25s ease-out, border-color 0.25s ease-out;
}

.c-checkbox__ripple svg {
  position: absolute;
  top: 14px;
  left: 14px;
  width: 14px;
  height: 14px;
  z-index: 1;
}

.c-checkbox__path {
  fill: transparent;
  stroke: transparent;
  stroke-width: 13;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-miterlimit: 10;
}

.c-checkbox__path--indeterminate {
  stroke: transparent;
}

/* Checked / indeterminate: fill the box and reveal the white check.
 * Uses the sibling-input selector — input precedes label in the DOM. */
input:checked + .c-checkbox__label .c-checkbox__ripple::before,
input:indeterminate + .c-checkbox__label .c-checkbox__ripple::before {
  background-color: var(--_c-checkbox-color-active);
  border-color: var(--_c-checkbox-color-active);
}

input:checked + .c-checkbox__label .c-checkbox__path,
input:indeterminate + .c-checkbox__label .c-checkbox__path {
  stroke: #ffffff;
  fill: #ffffff;
}

input:indeterminate + .c-checkbox__label .c-checkbox__path--indeterminate {
  fill: #ffffff;
  stroke: transparent;
}

/* Hover: tint only the circular ripple, never the checkbox itself. */
.c-checkbox:not(.c-checkbox--disabled) .c-checkbox__label:hover .c-checkbox__ripple {
  background-color: var(--_c-checkbox-background-color-hover);
}

/* Focus-visible: 2px ring around the ripple circle. */
input:focus-visible + .c-checkbox__label .c-checkbox__ripple {
  outline: 2px solid var(--_c-checkbox-color-active);
  outline-offset: -1px;
}

.c-checkbox--disabled {
  --_c-checkbox-color: var(--_c-checkbox-color-disabled);
  --_c-checkbox-color-active: var(--_c-checkbox-color-disabled);

  color: var(--_c-checkbox-color);
  opacity: 0.75;
}

.c-checkbox--disabled .c-checkbox__label {
  cursor: default;
}

.c-checkbox--error {
  --_c-checkbox-color: var(--c-error-600);
  --_c-checkbox-color-active: var(--_c-checkbox-color-error);

  color: var(--_c-checkbox-color-error);
}

.c-checkbox__label-content {
  padding-top: 10px;
  text-align: left;
  user-select: none;
}

.c-checkbox__required {
  color: var(--c-error-600);
}

/* Message line under the checkbox.
 * Ported from packages/csc-ui/src/components/c-message/c-message.scss:
 *   - 12px left/right padding so the text aligns with the start of the
 *     checkbox box (which sits at left:12 inside the 42px ripple).
 *   - 12px font-size, 16px min-height for the icon row.
 *   - Hint colour = `--c-text-system`, error colour = `--c-error-600`.
 *   - Error state shows `mdiCloseCircle` (16x16, top:-2 offset to align
 *     with text baseline). */
.c-checkbox__message {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  padding: 0 12px;
  font-size: 12px;
  line-height: 1;
  min-height: 16px;
  color: var(--c-message-hint-color, var(--c-text-system));
}

.c-checkbox__message--error {
  color: var(--c-message-error-color, var(--c-error-600));
}

.c-checkbox__message-icon {
  fill: currentColor;
  height: 16px;
  width: 16px;
  position: relative;
  top: -2px;
  flex-shrink: 0;
}

/* Vertical slide + fade between hint and error messages. Mirrors the
 * c-message.scss `.c-message--active` / `.c-message-item` rules:
 * 200ms cubic-bezier with translateY(-4px) and opacity 0 as the
 * inactive endpoints. */
.c-checkbox-message-enter-active,
.c-checkbox-message-leave-active {
  transition: opacity 0.2s cubic-bezier(0.25, 0.8, 0.5, 1),
    transform 0.2s cubic-bezier(0.25, 0.8, 0.5, 1);
}

.c-checkbox-message-enter-from,
.c-checkbox-message-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Visually hidden but keyboard/screen-reader accessible — standard
 * pattern for hiding the underlying native checkbox. */
.visuallyhidden {
  border: 0;
  clip: rect(1px, 1px, 1px, 1px);
  height: 1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  width: 1px;
}
</style>
