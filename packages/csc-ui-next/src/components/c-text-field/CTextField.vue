<template>
  <c-input
    :label="label"
    :label-on-top="labelOnTop"
    :hint="hint"
    :validation="validation"
    :hide-details="hideDetails"
    :valid="valid"
    :disabled="disabled"
    :required="required"
    :shadow="shadow"
    :active="isActiveForInput"
    :filled="isFilledForInput"
    :is-textarea="rows > 1"
    :input-id="inputId"
  >
    <!-- Pre slot: forwarded from the consumer's `pre` slot. We only
         render the wrapper when the consumer has actually provided pre
         content — otherwise c-input would see an always-assigned slot
         and still leave a flex gap. `display: contents` on the wrapper
         removes its box from layout so the projected icon becomes a
         direct flex item of c-input's `.c-input__pre` and centres
         vertically there (otherwise the wrapper's inline line-height
         would push the icon to the top of its line). -->
    <span
      v-if="hasConsumerPre"
      slot="pre"
      style="display: contents"
    ><slot name="pre" /></span>

    <textarea
      v-if="rows > 1"
      :id="inputId"
      ref="inputEl"
      class="c-text-field__input"
      :name="name || undefined"
      :placeholder="effectivePlaceholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :rows="rows"
      :autocomplete="autocomplete || undefined"
      :autocapitalize="automaticCapitalize || undefined"
      :autocorrect="autocorrect || undefined"
      :value="value ?? ''"
      :aria-invalid="!valid"
      @input="onInput"
      @change="onChange"
      @focus="onFocus"
      @blur="onBlur"
    />
    <input
      v-else
      :id="inputId"
      ref="inputEl"
      class="c-text-field__input"
      :type="currentType"
      :name="name || undefined"
      :placeholder="effectivePlaceholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :min="min ?? undefined"
      :max="max ?? undefined"
      :step="step ?? undefined"
      :autocomplete="autocomplete || undefined"
      :autocapitalize="automaticCapitalize || undefined"
      :autocorrect="autocorrect || undefined"
      :value="value ?? ''"
      :aria-invalid="!valid"
      @input="onInput"
      @change="onChange"
      @focus="onFocus"
      @blur="onBlur"
    >

    <!-- Post slot: type-specific toggles (password / date) plus the
         consumer's `post` slot, all projected into c-input's `post`.
         Only rendered when there's something inside, for the same reason
         as the pre wrapper. `display: contents` flattens the wrapper so
         the toggle buttons + slotted content centre as direct flex
         items of c-input's `.c-input__post`. -->
    <span
      v-if="hasToggle || hasConsumerPost"
      slot="post"
      class="c-text-field__post"
      style="display: contents"
    >
      <button
        v-if="originalType === 'password'"
        type="button"
        class="c-text-field__toggle"
        :disabled="disabled"
        :aria-label="currentType === 'password' ? 'Show password' : 'Hide password'"
        @click="togglePassword"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path :d="passwordIcon" fill="currentColor" />
        </svg>
      </button>

      <button
        v-if="originalType === 'date' && !isFirefox"
        type="button"
        class="c-text-field__toggle"
        :disabled="disabled"
        aria-label="Open date picker"
        @click="openPicker"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path :d="calendarIcon" fill="currentColor" />
        </svg>
      </button>

      <slot name="post" />
    </span>
  </c-input>
</template>

<script setup lang="ts">
import { mdiCalendar, mdiEye, mdiEyeOff } from '@mdi/js';
import { computed, onBeforeUnmount, onMounted, ref, useHost } from 'vue';

const props = defineProps({
  value: { type: String, default: '' },
  type: { type: String, default: 'text' },
  label: { type: String, default: '' },
  labelOnTop: { type: Boolean, default: false },
  placeholder: { type: String, default: '' },
  hint: { type: String, default: '' },
  hideDetails: { type: Boolean, default: false },
  hostId: { type: String, default: '' },
  name: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  rows: { type: Number, default: 1 },
  min: { type: Number, default: null },
  max: { type: Number, default: null },
  step: { type: Number, default: null },
  shadow: { type: Boolean, default: false },
  valid: { type: Boolean, default: true },
  validate: { type: Boolean, default: false },
  validateOnBlur: { type: Boolean, default: false },
  validation: { type: String, default: 'Required field' },
  trimWhitespace: { type: Boolean, default: false },
  autocomplete: { type: String, default: '' },
  automaticCapitalize: { type: String, default: '' },
  autocorrect: { type: String, default: '' },
});

const host = useHost();
const dispatchValue = (name: string, value: string) => {
  host?.dispatchEvent(new CustomEvent(name, { detail: value }));
};

const inputEl = ref<HTMLInputElement | HTMLTextAreaElement | null>(null);

let uid = 0;
const inputId = computed(() => props.hostId || `c-text-field-${++uid}`);

const isFocused = ref(false);

const originalType = props.type;
const currentType = ref(props.type);

// Date inputs render a permanent "mm/dd/yyyy" format hint inside the
// field, so the floating label has to stay lifted from the start —
// otherwise it overlaps the format hint. Treat date as always-filled.
const isDateType = originalType === 'date';
const isActiveForInput = computed(
  () => isFocused.value || !!props.value || isDateType,
);
const isFilledForInput = computed(() => !!props.value || isDateType);

// Detect consumer-provided slotted content. We need this at the
// c-text-field level (rather than c-input via `useHasSlot`) because
// c-input sees our wrapper span as always-assigned. By only rendering
// the wrapper when there's real consumer content, c-input's hasPreSlot
// stays false and no flex gap is drawn before the input.
const hasConsumerPre = ref(false);
const hasConsumerPost = ref(false);
const hasToggle = computed(
  () =>
    originalType === 'password' || (originalType === 'date' && !isFirefox),
);

const refreshConsumerSlots = () => {
  if (!host) return;
  hasConsumerPre.value = !!host.querySelector(':scope > [slot="pre"]');
  hasConsumerPost.value = !!host.querySelector(':scope > [slot="post"]');
};

let childObserver: MutationObserver | null = null;
onMounted(() => {
  refreshConsumerSlots();
  if (host && typeof MutationObserver !== 'undefined') {
    childObserver = new MutationObserver(refreshConsumerSlots);
    childObserver.observe(host, { childList: true });
  }
});
onBeforeUnmount(() => {
  childObserver?.disconnect();
});

// Suppress the placeholder when a floating label exists and the input
// isn't focused — otherwise the placeholder and the (unlifted) label
// stack on top of each other. label-on-top mode keeps the placeholder
// always visible since the label is above the field there.
const effectivePlaceholder = computed(() => {
  if (!props.placeholder) return undefined;
  if (props.labelOnTop) return props.placeholder;
  if (props.label && !isFocused.value && !props.value) return undefined;
  return props.placeholder;
});
const passwordIcon = computed(() =>
  currentType.value === 'password' ? mdiEye : mdiEyeOff,
);
const calendarIcon = mdiCalendar;
const isFirefox = /firefox|fxios/i.test(
  typeof navigator !== 'undefined' ? navigator.userAgent : '',
);

const togglePassword = () => {
  if (props.disabled) return;
  currentType.value = currentType.value === 'password' ? 'text' : 'password';
};

const openPicker = () => {
  const el = inputEl.value as HTMLInputElement | null;
  if (el && typeof el.showPicker === 'function') el.showPicker();
};

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement;
  const next = props.trimWhitespace ? target.value.trim() : target.value;
  dispatchValue('update:value', next);
  dispatchValue('changeValue', next);
  host?.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  void event;
};

const onChange = (event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement;
  const next = props.trimWhitespace ? target.value.trim() : target.value;
  dispatchValue('update:value', next);
  dispatchValue('changeValue', next);
  host?.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  void event;
};

const onFocus = () => {
  isFocused.value = true;
};

const onBlur = (event: Event) => {
  isFocused.value = false;
  if (props.trimWhitespace) {
    const target = event.target as HTMLInputElement;
    target.value = target.value.trim();
  }
};
</script>

<style>
/* c-text-field is a thin orchestrator around <c-input>. It owns the
 * <input>/<textarea> element (so type-specific behaviour like password-
 * toggle and date-picker live here), and passes through the label /
 * validation / state props to c-input which renders the outlined Material
 * border + floating-label visuals. */

:host {
  display: block;
}

/* Tailwind's preflight resets `input, textarea { padding: 0 }` with a
 * universal selector, and that reset is injected into our shadow root
 * alongside c-text-field's own styles. We re-apply the input/textarea
 * padding here (and explicitly, not via `::slotted()`, because the
 * input lives in *this* shadow root — only the c-input's shadow root
 * sees it as a slotted element). */

.c-text-field__input {
  background: transparent;
  border: 0;
  outline: 0;
  margin: 0;
  font: inherit;
  font-size: 16px;
  line-height: 20px;
  color: inherit;
  caret-color: var(--c-primary-600);
  flex: 1 1 auto;
  min-width: 0;
  width: 100%;
  max-width: 100%;
}

input.c-text-field__input {
  padding: 8px 0;
  max-height: 32px;
}

textarea.c-text-field__input {
  /* Vertical padding above the cursor matches Stencil's
   * `padding: 8px 12px 8px 0` plus `margin-top: 4px`, totalling 12px
   * from the slot's top edge — the same spot where the lifted label
   * once sat, so the cursor lines up where the label used to be. */
  padding: 12px 12px 8px 0;
  margin: 0;
  min-height: 44px;
  resize: vertical;
  white-space: pre-wrap;
}

.c-text-field__input::placeholder {
  color: var(--c-tertiary-400);
  opacity: 1;
}

/* Date type: hide the native browser calendar picker indicator + inner
 * spin button. We render our own calendar toggle button in the post slot
 * (a c-icon-button style). Also flatten the WebKit datetime-edit padding
 * so the date text starts at the same x-position as a regular text input. */

input[type='date'].c-text-field__input::-webkit-calendar-picker-indicator,
input[type='date'].c-text-field__input::-webkit-inner-spin-button,
input[type='date'].c-text-field__input::-webkit-clear-button {
  display: none;
  -webkit-appearance: none;
  appearance: none;
}

input[type='date'].c-text-field__input::-webkit-datetime-edit {
  padding: 0;
}

input[type='date'].c-text-field__input::-webkit-datetime-edit-fields-wrapper {
  padding: 0;
}

input[type='date'].c-text-field__input {
  padding-left: 0;
  text-indent: 0;
}

.c-text-field__post {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.c-text-field__toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.c-text-field__toggle:hover:not(:disabled) {
  background-color: var(--c-primary-100);
}

.c-text-field__toggle:focus {
  outline: none;
}

.c-text-field__toggle:focus-visible {
  outline: 2px solid var(--c-primary-600);
  outline-offset: 2px;
}

.c-text-field__toggle:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
