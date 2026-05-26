<template>
  <div
    ref="root"
    class="c-radio-group"
    :class="{
      'c-radio-group--disabled': disabled,
      'c-radio-group--inline': inline,
      'c-radio-group--error': !valid,
    }"
    role="radiogroup"
    aria-labelledby="c-radio-group__label"
  >
    <label
      v-if="label || hasSlotContent"
      class="c-radio-group__label"
      id="c-radio-group__label"
    >
      <span v-if="label">{{ label }}</span>
      <span v-show="!label"><slot /></span>
      <span v-if="required" class="c-radio-group__required" aria-hidden="true">&nbsp;*</span>
    </label>

    <div class="c-radio-group__items">
      <label
        v-for="(item, index) in resolvedItems"
        :key="String(item.value) + index"
        class="c-radio"
        :class="{
          'c-radio--disabled': item.disabled || disabled,
          'c-radio--error': !valid,
        }"
        @keydown="onKeyDown($event, item)"
      >
        <input
          type="radio"
          :name="radioName"
          :checked="isChecked(item)"
          :disabled="item.disabled || disabled"
          :aria-checked="String(isChecked(item))"
          :aria-disabled="String(item.disabled || disabled)"
          @change="select(item)"
        >
        <span class="c-radio__ripple">
          <span class="c-radio__selection" />
        </span>
        <div class="c-radio__label">{{ item.name }}</div>
      </label>
    </div>

    <Transition name="c-radio-group-message" mode="out-in">
      <span
        v-if="!hideDetails && messageVisible"
        :key="messageKey"
        class="c-radio-group__message"
        :class="{ 'c-radio-group__message--error': !valid }"
      >
        <svg
          v-if="!valid"
          class="c-radio-group__message-icon"
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
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  useHost,
  useTemplateRef,
  watch,
} from 'vue';
import { useHasSlot } from '../../shared/useHasSlot';

interface RadioItem {
  name: string;
  value: string | number;
  disabled?: boolean;
}

const props = defineProps({
  value: { type: [String, Number, Object], default: null },
  hideDetails: { type: Boolean, default: false },
  hint: { type: String, default: '' },
  inline: { type: Boolean, default: false },
  label: { type: String, default: '' },
  color: { type: String, default: '' },
  hostId: { type: String, default: '' },
  items: { type: Array as () => RadioItem[], default: () => [] },
  disabled: { type: Boolean, default: false },
  returnObject: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  valid: { type: Boolean, default: true },
  validation: { type: String, default: 'Required field' },
});

const errorIconPath = mdiCloseCircle;
const host = useHost();
const dispatchValue = (name: string, value: unknown) => {
  host?.dispatchEvent(new CustomEvent(name, { detail: value }));
};

const root = useTemplateRef<HTMLElement>('root');
const hasSlotContent = useHasSlot(root, '');

let uidCounter = 0;
const radioName = computed(() => props.hostId || `c-radio-group-${++uidCounter}`);

// Items scanned from slotted <c-radio> children. When present, these take
// precedence over the `items` prop — matches Stencil behaviour where the
// slot wins. Returning objects is forced off in slot mode because <c-radio>
// only carries a primitive `value`.
const scannedItems = ref<RadioItem[]>([]);
const slotMode = ref(false);

const resolvedItems = computed<RadioItem[]>(() =>
  slotMode.value ? scannedItems.value : props.items,
);

const internalValue = ref<string | number | RadioItem | null>(props.value);
watch(
  () => props.value,
  (v) => {
    internalValue.value = v;
  },
);

const isChecked = (item: RadioItem) => {
  if (slotMode.value || !props.returnObject) {
    return internalValue.value === item.value;
  }
  return (
    (internalValue.value as RadioItem | null)?.value === item.value
  );
};

const select = (item: RadioItem) => {
  if (item.disabled || props.disabled) return;
  const next = !slotMode.value && props.returnObject ? item : item.value;
  internalValue.value = next;
  dispatchValue('update:value', next);
  dispatchValue('changeValue', next);
};

const onKeyDown = (event: KeyboardEvent, item: RadioItem) => {
  if (event.code === 'Space' || event.code === 'Enter') {
    event.preventDefault();
    select(item);
  }
};

const messageVisible = computed(() =>
  Boolean(props.hint || (!props.valid && props.validation)),
);
const messageKey = computed(() =>
  !props.valid ? `error:${props.validation}` : `hint:${props.hint}`,
);

const scanChildren = () => {
  if (!host) return;
  const radios = Array.from(host.querySelectorAll(':scope > c-radio')) as HTMLElement[];
  if (radios.length === 0) {
    slotMode.value = false;
    return;
  }
  slotMode.value = true;
  scannedItems.value = radios.map((r) => {
    if (r.hasAttribute('checked') && internalValue.value == null) {
      const v = r.getAttribute('value') ?? '';
      internalValue.value = v;
      dispatchValue('update:value', v);
      dispatchValue('changeValue', v);
    }
    return {
      name: (r.textContent || '').trim(),
      value: r.getAttribute('value') ?? '',
      disabled: r.hasAttribute('disabled'),
    };
  });
};

let observer: MutationObserver | null = null;
onMounted(() => {
  scanChildren();
  if (host && typeof MutationObserver !== 'undefined') {
    observer = new MutationObserver(scanChildren);
    observer.observe(host, { childList: true, subtree: true, attributes: true });
  }
});
onBeforeUnmount(() => {
  observer?.disconnect();
});
</script>

<style>
:host {
  --_c-radio-group-background-color-hover: var(
    --c-radio-group-background-color-hover,
    rgba(var(--c-primary-rgb), 0.1)
  );
  --_c-radio-group-color: var(--c-radio-group-color, var(--c-primary-600));
  --_c-radio-group-color-active: var(
    --c-radio-group-color-active,
    var(--_c-radio-group-color)
  );
  --_c-radio-group-color-disabled: var(
    --c-radio-group-color-disabled,
    var(--c-tertiary-500)
  );

  display: flex;
  flex-direction: column;
  gap: 4px;
  width: fit-content;
}

.c-radio-group {
  --_c-radio-group-error-color: var(--c-error-600);
  --_c-radio-flex-direction: column;
  --_c-radio-item-gap: 2px;
}

.c-radio-group__items {
  display: flex;
  flex-flow: var(--_c-radio-flex-direction) wrap;
  gap: var(--_c-radio-item-gap);
}

.c-radio-group--inline {
  --_c-radio-flex-direction: row;
  --_c-radio-item-gap: 12px;
}

.c-radio-group__required {
  color: var(--_c-radio-group-error-color);
}

.c-radio-group--disabled {
  --_c-radio-group-color: var(--_c-radio-group-color-disabled);
  --_c-radio-group-error-color: var(--_c-radio-group-color-disabled);

  color: var(--_c-radio-group-color-disabled);
  cursor: default;
  opacity: 0.75;
}

.c-radio-group--error {
  --_c-radio-group-color: var(--_c-radio-group-error-color);
  --_c-radio-group-color-active: var(--_c-radio-group-error-color);

  color: var(--_c-radio-group-error-color);
}

.c-radio {
  align-items: flex-start;
  display: flex;
  position: relative;
  cursor: pointer;
  font-size: 16px;
  user-select: none;
  gap: 4px;
  line-height: 1.2;
}

.c-radio input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.c-radio__ripple {
  position: relative;
  height: 42px;
  width: 42px;
  min-width: 42px;
  border-radius: 50%;
  overflow: hidden;
  color: var(--_c-radio-group-color);
  display: inline-block;
  transition: background-color 0.2s ease;
}

.c-radio__selection {
  position: absolute;
  top: 11px;
  left: 11px;
  height: 20px;
  width: 20px;
  background-color: transparent;
  box-shadow: inset 0 0 0 2px var(--_c-radio-group-color);
  border-radius: 50%;
  transition: box-shadow 0.15s ease-in-out;
}

.c-radio__selection::after {
  content: '';
  position: absolute;
  transform: scale(0);
  transition: transform 0.15s ease-in-out;
  top: 5px;
  left: 5px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--_c-radio-group-color-active);
}

.c-radio input:checked ~ .c-radio__ripple .c-radio__selection::after {
  transform: scale(1);
}

.c-radio__label {
  padding-top: 12px;
}

.c-radio--disabled {
  --_c-radio-group-color: var(--_c-radio-group-color-disabled);
  --_c-radio-group-color-active: var(--_c-radio-group-color-disabled);

  color: var(--_c-radio-group-color);
  cursor: default;
  opacity: 0.75;
}

.c-radio--error {
  --_c-radio-group-color: var(--_c-radio-group-error-color);
  color: var(--_c-radio-group-error-color);
}

.c-radio input:focus {
  outline: none;
}

.c-radio input:focus-visible + .c-radio__ripple {
  outline: 2px var(--_c-radio-group-color) solid;
}

.c-radio:not(.c-radio--disabled) .c-radio__ripple:hover {
  background-color: var(--_c-radio-group-background-color-hover);
}

/* Hint / error message — ported from c-checkbox pattern. */
.c-radio-group__message {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  padding: 0 12px;
  font-size: 12px;
  line-height: 1;
  min-height: 16px;
  color: var(--c-message-hint-color, var(--c-text-system));
}

.c-radio-group__message--error {
  color: var(--c-message-error-color, var(--c-error-600));
}

.c-radio-group__message-icon {
  fill: currentColor;
  height: 16px;
  width: 16px;
  position: relative;
  top: -2px;
  flex-shrink: 0;
}

.c-radio-group-message-enter-active,
.c-radio-group-message-leave-active {
  transition:
    opacity 0.2s cubic-bezier(0.25, 0.8, 0.5, 1),
    transform 0.2s cubic-bezier(0.25, 0.8, 0.5, 1);
}

.c-radio-group-message-enter-from,
.c-radio-group-message-leave-to {
  opacity: 0;
  transform: translateY(-4px);
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
</style>
