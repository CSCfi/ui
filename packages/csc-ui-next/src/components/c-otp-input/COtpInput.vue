<template>
  <div
    :id="`announce-${resolvedId}`"
    class="visuallyhidden"
    aria-live="polite"
    aria-atomic="true"
  >
    {{ statusText }}
  </div>

  <div :class="containerClasses">
    <input
      v-for="i in length"
      :key="i"
      :ref="setInputRef(i - 1)"
      :id="`${resolvedId}--input-${i}`"
      :aria-label="`Enter code - digit number - ${i} of ${length}`"
      type="tel"
      maxlength="1"
      inputmode="numeric"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      data-form-type="other"
      data-lpignore="true"
      data-1p-ignore=""
      :name="`${resolvedId}--digit-${i}`"
      :autofocus="hasAutofocus && i === 1 ? true : undefined"
      @focus="onFocus(i - 1)"
      @input="onInput($event as InputEvent)"
      @keydown="onKeyDown($event as KeyboardEvent)"
      @paste="i === 1 && onPaste($event as ClipboardEvent)"
    />

    <c-message
      :hint="hint"
      :input-id="elementId"
      :valid="valid"
      :validation="validation"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, useHost, watch } from 'vue';

// Multi-root template (fragment) + we write to the host below — keep
// fallthrough attrs on the host element instead of tripping the "renders
// fragment" warning.
defineOptions({ inheritAttrs: false });

const props = defineProps({
  hasAutofocus: { type: Boolean, default: false },
  hideDetails: { type: Boolean, default: false },
  hint: { type: String, default: '' },
  elementId: { type: String, default: '' },
  length: { type: Number, default: 6 },
  valid: { type: Boolean, default: true },
  validation: { type: String, default: 'Required field' },
  value: { type: String, default: '' },
});

const host = useHost();
let uid = 0;
const resolvedId = computed(
  () => props.elementId || `c-otp-input--${uid}`,
);

const statusText = ref('');
const inputs: Array<HTMLInputElement | null> = [];

const setInputRef = (index: number) => (el: unknown) => {
  inputs[index] = el as HTMLInputElement | null;
};

const containerClasses = computed(() => ({
  'c-otp-input': true,
  'c-otp-input--hide-details': props.hideDetails,
}));

const dispatchChange = (val: string | null) =>
  host?.dispatchEvent(new CustomEvent('changeValue', { detail: val }));
const dispatchCompletion = (val: string | null) =>
  host?.dispatchEvent(new CustomEvent('completion', { detail: val }));
const dispatchUpdate = (val: string) =>
  host?.dispatchEvent(new CustomEvent('update:value', { detail: val }));

let backspacePressed = false;
let isPasting = false;
let statusDebounce: ReturnType<typeof setTimeout> | null = null;

const updateStatusText = () => {
  if (statusDebounce !== null) {
    clearTimeout(statusDebounce);
    statusDebounce = null;
  }
  statusDebounce = setTimeout(() => {
    const value = inputs.map((i) => i?.value ?? '').join('');
    let text = props.valid ? '' : `Error: ${props.validation} `;
    text += `Currently entered - ${
      !value.length ? 'nothing' : value.split('').join(' - ')
    }`;
    statusText.value = text.trim();
    statusDebounce = null;
  }, 1400);
};

const emitValue = () => {
  requestAnimationFrame(() => {
    const value = inputs.map((i) => i?.value ?? '').join('');
    const isFull = value.length === props.length;
    dispatchChange(isFull ? value : null);
    dispatchUpdate(value);
    if (isFull) dispatchCompletion(value || null);
    updateStatusText();
  });
};

const handleValueChange = (value: string | null, forceEmpty = false) => {
  if (!value && !forceEmpty) return;
  const digits = (value ?? '').split('');
  inputs.forEach((input, index) => {
    if (input) input.value = digits[index] || '';
  });
};

const onFocus = (index: number) => inputs[index]?.select();

const onKeyDown = (event: KeyboardEvent) => {
  backspacePressed = false;
  const target = event.target as HTMLInputElement;
  const previousElement = target.previousElementSibling as HTMLInputElement | null;
  if (event.key === 'Backspace') {
    backspacePressed = true;
    if (previousElement && !target.value) previousElement.focus();
    emitValue();
  }
};

const onInput = (event: InputEvent) => {
  const target = event.target as HTMLInputElement;
  const next = target.nextElementSibling as HTMLInputElement | null;
  const prev = target.previousElementSibling as HTMLInputElement | null;
  if (isNaN(+target.value)) {
    event.preventDefault();
    target.value = '';
    return;
  }
  if (isPasting) {
    isPasting = false;
    return;
  }
  if (backspacePressed) return;
  if (event.data) next?.focus();
  else prev?.focus();
  emitValue();
};

const onPaste = (event: ClipboardEvent) => {
  event.preventDefault();
  const paste = event.clipboardData?.getData('text') ?? '';
  if (isNaN(+paste)) return;
  isPasting = true;
  paste.split('').forEach((char, index) => {
    if (index >= inputs.length) return;
    const input = inputs[index];
    if (!input) return;
    input.value = '';
    input.value = char;
  });
  const nextIndex = Math.min(props.length, paste.length) - 1;
  requestAnimationFrame(() => {
    inputs[nextIndex]?.focus();
    emitValue();
  });
};

// Expose a public reset() like Stencil's @Method().
const reset = () => {
  inputs.forEach((i) => {
    if (i) i.value = '';
  });
  emitValue();
};

watch(() => props.validation, updateStatusText);
watch(
  () => props.value,
  (v) => {
    handleValueChange(v);
    updateStatusText();
  },
);

onMounted(() => {
  uid += 1;
  if (!host) return;
  host.id = resolvedId.value;
  host.classList.toggle('error', !props.valid);
  host.style.setProperty('--_c-otp-input-count', String(props.length));
  (host as unknown as { reset: () => void }).reset = reset;
  handleValueChange(props.value);
});

watch(
  () => props.valid,
  (v) => host?.classList.toggle('error', !v),
);
</script>

<style>
:host {
  --_c-otp-input-border-color: var(--c-otp-input-border-color, var(--c-tertiary-500));
  --_c-otp-input-border-color-active: var(--c-otp-input-border-color-active, var(--c-primary-600));
  --_c-otp-input-height: var(--c-otp-input-height, 56px);
  --_c-otp-input-width: var(--c-otp-input-width, 42px);
  --_c-otp-input-font-size: var(--c-otp-input-font-size, 24px);
  --_c-otp-input-text-color: var(--c-otp-input-text-color, var(--c-text-body));
  --_c-otp-input-border-width: 1px;

  display: block;
}

:host(.error) {
  --_c-otp-input-border-color: var(--c-error-600);
  --_c-otp-input-border-color-active: var(--c-error-600);
}

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

.c-otp-input {
  backface-visibility: hidden;
  display: inline-grid;
  gap: 8px;
  grid-auto-columns: minmax(auto, var(--_c-otp-input-width));
  grid-auto-flow: column;
  margin-bottom: 8px;
  transform: translate3d(0, 0, 0);
}

.c-otp-input--hide-details {
  margin-bottom: 0;
}

.c-otp-input input {
  border-radius: 4px;
  border: none;
  box-shadow: inset 0 0 0 var(--_c-otp-input-border-width) var(--_c-otp-input-border-color);
  color: var(--_c-otp-input-text-color);
  font-size: var(--_c-otp-input-font-size);
  height: var(--_c-otp-input-height);
  max-width: var(--_c-otp-input-width);
  min-width: 24px;
  text-align: center;
  width: 100%;
}

.c-otp-input input:focus {
  --_c-otp-input-border-width: 2px;
  --_c-otp-input-border-color: var(--_c-otp-input-border-color-active);
  outline: none;
}

.c-otp-input c-message {
  grid-column: 1 / span var(--_c-otp-input-count);
  grid-row: 2;
}
</style>
