<template>
  <label
    ref="root"
    class="c-switch"
    :class="{
      'c-switch--disabled': disabled,
      'c-switch--label': hasSlotContent,
    }"
    :for="inputId"
  >
    <div class="c-switch__input">
      <input
        :id="inputId"
        type="checkbox"
        role="switch"
        :checked="internalChecked || undefined"
        :disabled="disabled"
        :aria-checked="String(internalChecked)"
        @change="toggle"
      >
      <span
        class="c-switch__slider"
        :class="{
          'c-switch__slider--disabled': disabled,
          'c-switch__slider--loading': loading,
        }"
      >
        <c-spinner :size="14" :width="2" />
      </span>
    </div>
    <div v-show="hasSlotContent" class="c-switch__label">
      <slot />
      <span v-if="required" class="c-switch__required" aria-hidden="true">&nbsp;*</span>
    </div>
  </label>
</template>

<script setup lang="ts">
import { computed, ref, useHost, useTemplateRef, watch } from 'vue';
import { useHasSlot } from '../../shared/useHasSlot';

const props = defineProps({
  checked: { type: Boolean, default: false },
  value: { type: [Boolean, String, Number], default: false },
  trueValue: { type: [Boolean, String, Number], default: true },
  falseValue: { type: [Boolean, String, Number], default: false },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  hostId: { type: String, default: '' },
  required: { type: Boolean, default: false },
});

const host = useHost();
const dispatchValue = (name: string, value: unknown) => {
  host?.dispatchEvent(new CustomEvent(name, { detail: value }));
};

const root = useTemplateRef<HTMLElement>('root');
const hasSlotContent = useHasSlot(root, '');

let uid = 0;
const inputId = computed(() => props.hostId || `c-switch-${++uid}`);

const internalChecked = ref(props.checked || props.value === props.trueValue);

watch(
  () => props.checked,
  (c) => {
    internalChecked.value = c;
  },
);
watch(
  () => props.value,
  (v) => {
    internalChecked.value = v === props.trueValue;
  },
);

const toggle = () => {
  if (props.disabled) return;
  internalChecked.value = !internalChecked.value;
  const next = internalChecked.value ? props.trueValue : props.falseValue;
  dispatchValue('update:value', next);
  dispatchValue('changeValue', next);
  host?.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
};
</script>

<style>
:host {
  --_c-switch-border-color: var(--c-switch-border-color, var(--c-tertiary-600));
  --_c-switch-handle-color: var(--c-switch-handle-color, var(--c-tertiary-600));
  --_c-switch-slider-color: var(--c-switch-slider-color, transparent);

  --_c-switch-border-color-disabled: var(--c-switch-border-color-disabled, transparent);
  --_c-switch-handle-color-disabled: var(--c-switch-handle-color-disabled, var(--c-tertiary-500));
  --_c-switch-slider-color-disabled: var(--c-switch-slider-color-disabled, var(--c-tertiary-200));

  --_c-switch-border-color-active: var(--c-switch-border-color-active, var(--c-primary-600));
  --_c-switch-handle-color-active: var(--c-switch-handle-color-active, var(--c-white));
  --_c-switch-slider-color-active: var(--c-switch-slider-color-active, var(--c-primary-600));

  --_c-switch-border-color-active-disabled: var(--c-switch-border-color-active-disabled, var(--c-tertiary-400));
  --_c-switch-handle-color-active-disabled: var(--c-switch-handle-color-active-disabled, var(--c-white));
  --_c-switch-slider-color-active-disabled: var(--c-switch-slider-color-active-disabled, var(--c-tertiary-400));

  display: inline-block;
}

.c-switch {
  --_c-switch-handle-margin: 5px;
  --_c-switch-pointer: pointer;
  --_c-switch-height: 22px;
  --_c-switch-width: 44px;
  --_c-switch-handle-size: calc(var(--_c-switch-height) - 2 * var(--_c-switch-handle-margin));
  --_c-switch-handle-position-active: calc(
    var(--_c-switch-width) - var(--_c-switch-handle-size) - 2 * var(--_c-switch-handle-margin)
  );

  backface-visibility: hidden;
  transform: translate3d(0, 0, 0);
  display: inline-grid;
  height: var(--_c-switch-height);
  position: relative;
  grid-template-columns: 1fr;
  gap: 12px;
  align-items: center;
}

.c-switch--label {
  grid-template-columns: var(--_c-switch-width) auto;
}

.c-switch--disabled {
  --_c-switch-pointer: default;
  --_c-switch-handle-color: var(--_c-switch-handle-color-disabled);
  --_c-switch-slider-color: var(--_c-switch-slider-color-disabled);
  --_c-switch-border-color: var(--_c-switch-border-color-disabled);

  color: var(--c-tertiary-500);
}

.c-switch__input {
  height: var(--_c-switch-height);
  position: relative;
  width: var(--_c-switch-width);
  align-self: start;
}

.c-switch__slider {
  background-color: var(--_c-switch-slider-color);
  border-radius: var(--_c-switch-height);
  box-shadow: inset 0 0 0 2px var(--_c-switch-border-color);
  inset: 0;
  cursor: var(--_c-switch-pointer);
  position: absolute;
  transform-origin: 50% 50%;
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}

.c-switch__slider::before {
  background-color: var(--_c-switch-handle-color);
  border-radius: 50%;
  bottom: var(--_c-switch-handle-margin);
  content: '';
  height: var(--_c-switch-handle-size);
  left: var(--_c-switch-handle-margin);
  position: absolute;
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  width: var(--_c-switch-handle-size);
}

.c-switch__slider c-spinner {
  /* Use the public `--c-spinner-color` override rather than `--c-color`
   * — c-spinner writes `--c-color` as an inline style on its host from
   * the `color` prop default, which would beat any cascade-set value.
   * The public override variable wins in the var-chain without needing
   * !important. Tracks the handle colour so it stays visible against
   * the slider background. */
  --c-spinner-color: var(--_c-switch-handle-color);
  pointer-events: none;
  z-index: 2;
  position: absolute;
  left: 4px;
  top: 4px;
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}

.c-switch__slider--loading c-spinner {
  opacity: 1;
}

.c-switch__slider--loading::before {
  opacity: 0;
}

input {
  height: 0;
  opacity: 0;
  width: 0;
  position: absolute;
}

input:checked + .c-switch__slider {
  --_c-switch-handle-color: var(--_c-switch-handle-color-active);
  --_c-switch-slider-color: var(--_c-switch-slider-color-active);
  --_c-switch-border-color: var(--_c-switch-border-color-active);
}

input:checked + .c-switch__slider::before {
  transform: translateX(var(--_c-switch-handle-position-active));
}

input:checked + .c-switch__slider c-spinner {
  --c-spinner-color: var(--_c-switch-handle-color-active);
  transform: translateX(var(--_c-switch-handle-position-active));
}

input:checked + .c-switch__slider--disabled {
  --_c-switch-handle-color: var(--_c-switch-handle-color-active-disabled);
  --_c-switch-slider-color: var(--_c-switch-slider-color-active-disabled);
  --_c-switch-border-color: var(--_c-switch-border-color-active-disabled);
}

input:focus + .c-switch__slider {
  outline: none;
}

input:focus-visible + .c-switch__slider {
  outline: 2px var(--c-primary-600) solid;
  outline-offset: 2px;
}

.c-switch__label {
  align-self: center;
}

.c-switch__required {
  color: var(--c-error-600);
}
</style>
