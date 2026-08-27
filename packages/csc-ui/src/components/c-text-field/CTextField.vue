<template>
  <c-input
    :active="isActiveForInput"
    :data-hide-details="String(hideDetailsResolved)"
    :disabled
    :error-message
    :filled="isFilledForInput"
    :hint
    :input-id
    :is-textarea="rows > 1"
    :label
    :label-on-top
    :required
    :shadow
    :size
    :valid
  >
    <!-- Pre slot: forwarded from the consumer's `pre` slot. We only
         render the wrapper when the consumer has actually provided pre
         content — otherwise c-input would see an always-assigned slot
         and still leave a flex gap. `display: contents` on the wrapper
         removes its box from layout so the projected icon becomes a
         direct flex item of c-input's `.c-input__pre` and centres
         vertically there (otherwise the wrapper's inline line-height
         would push the icon to the top of its line). -->
    <span v-if="hasConsumerPre" slot="pre" class="contents">
      <slot name="pre" />
    </span>

    <textarea
      v-if="rows > 1"
      :id="inputId"
      ref="inputRef"
      :aria-invalid="!valid"
      :autocapitalize="automaticCapitalize || undefined"
      :autocomplete="autocomplete || undefined"
      :autocorrect="
        autocorrect === undefined ? undefined : autocorrect ? 'on' : 'off'
      "
      :class="ui.textarea()"
      :disabled
      :name="name || undefined"
      :placeholder="effectivePlaceholder"
      :readonly
      :required
      :rows
      :value="value ?? ''"
      @blur="onBlur"
      @change="onChange"
      @focus="onFocus"
      @input="onInput"
    />

    <input
      v-else
      :id="inputId"
      ref="inputRef"
      :aria-invalid="!valid"
      :autocapitalize="automaticCapitalize || undefined"
      :autocomplete="autocomplete || undefined"
      :autocorrect="
        autocorrect === undefined ? undefined : autocorrect ? 'on' : 'off'
      "
      :class="ui.input()"
      :disabled
      :max="max ?? undefined"
      :min="min ?? undefined"
      :name="name || undefined"
      :placeholder="effectivePlaceholder"
      :readonly
      :required
      :step="step ?? undefined"
      :type="currentType"
      :value="value ?? ''"
      @blur="onBlur"
      @change="onChange"
      @focus="onFocus"
      @input="onInput"
    />

    <!-- Post slot: type-specific toggles (password / date) plus the
         consumer's `post` slot, all projected into c-input's `post`.
         Only rendered when there's something inside, for the same reason
         as the pre wrapper. `display: contents` flattens the wrapper so
         the toggle buttons + slotted content centre as direct flex
         items of c-input's `.c-input__post`. -->
    <span v-if="hasToggle || hasConsumerPost" slot="post" :class="ui.post()">
      <button
        v-if="originalType === 'password'"
        :aria-label="
          currentType === 'password' ? 'Show password' : 'Hide password'
        "
        :class="ui.toggle()"
        :disabled
        type="button"
        @click="togglePassword"
      >
        <svg :class="ui.toggleIcon()" aria-hidden="true" viewBox="0 0 24 24">
          <path :d="passwordIcon" fill="currentColor" />
        </svg>
      </button>

      <button
        v-if="originalType === 'date' && !isFirefox"
        :class="ui.toggle()"
        :disabled
        aria-label="Open date picker"
        type="button"
        @click="openPicker"
      >
        <svg :class="ui.toggleIcon()" aria-hidden="true" viewBox="0 0 24 24">
          <path :d="calendarIcon" fill="currentColor" />
        </svg>
      </button>

      <slot name="post" />
    </span>
  </c-input>
</template>

<script lang="ts">
/**
 * Native `autocapitalize` behaviour of the input.
 */
export type CTextFieldAutocapitalize =
  | 'characters'
  | 'none'
  | 'off'
  | 'on'
  | 'sentences'
  | 'words';

export interface CTextFieldProps {
  /**
   * HTML input autocomplete
   *
   * @seeded from csc-ui — verify
   * @freeform any HTML autocomplete token list
   */
  autocomplete?: string;
  /**
   * Enable native input autocorrection (Safari). Maps to the input's
   * `autocorrect="on"`/`"off"` attribute; left unset (browser default per
   * input type) when not specified. Mirrors the platform
   * `HTMLElement.autocorrect` boolean.
   */
  autocorrect?: boolean;
  /**
   * HTML input autocapitalize
   *
   * @seeded from csc-ui — verify
   */
  automaticCapitalize?: CTextFieldAutocapitalize;
  /**
   * Disable the input
   *
   * @seeded from csc-ui — verify
   */
  disabled?: boolean;
  /**
   * Error message shown in place of the hint while the input is invalid
   *
   * @freeform
   */
  errorMessage?: string;
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
   * Id of the input
   *
   * @seeded from csc-ui — verify
   * @freeform
   */
  hostId?: string;
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
   * Maximum value on a numeric input
   *
   * @seeded from csc-ui — verify
   */
  max?: null | number;
  /**
   * Minimum value on a numeric input
   *
   * @seeded from csc-ui — verify
   */
  min?: null | number;
  /**
   * Name of the input
   *
   * @seeded from csc-ui — verify
   * @freeform
   */
  name?: string;
  /**
   * Placeholder of the input
   *
   * @seeded from csc-ui — verify
   * @freeform
   */
  placeholder?: string;
  /**
   * Mark as readonly
   *
   * @seeded from csc-ui — verify
   */
  readonly?: boolean;
  /**
   * Set the input as required
   *
   * @seeded from csc-ui — verify
   */
  required?: boolean;
  /**
   * Rows on the input
   *
   * @seeded from csc-ui — verify
   */
  rows?: number;
  /**
   * Shadow variant of the input
   *
   * @seeded from csc-ui — verify
   */
  shadow?: boolean;
  /** Field height: the 44px default or the 36px `small` box (single-line fields) */
  size?: CFieldSize;
  /**
   * Step size on a numeric input
   *
   * @seeded from csc-ui — verify
   */
  step?: null | number;
  /**
   * Trim whitespace from the return value
   *
   * @seeded from csc-ui — verify
   */
  trimWhitespace?: boolean;
  /**
   * Type of the input
   *
   * @seeded from csc-ui — verify
   */
  type?: CTextFieldType;
  /**
   * Set the validity of the input
   *
   * @seeded from csc-ui — verify
   */
  valid?: boolean;
  /**
   * Value of the input
   *
   * @seeded from csc-ui — verify
   * @freeform
   */
  value?: string;
}

/**
 * Type of the input. `password` gets a reveal toggle, `date` a picker button,
 * `number` honours `min`/`max`/`step`; the rest map straight to the native
 * input type.
 */
export type CTextFieldType =
  | 'date'
  | 'email'
  | 'number'
  | 'password'
  | 'search'
  | 'tel'
  | 'text'
  | 'url';
</script>

<script setup lang="ts">
/**
 * @slot pre - Content added before the input
 * @slot post - Content added after the input
 *
 * @seeded from csc-ui — verify
 */
import { mdiCalendar, mdiEye, mdiEyeOff } from '@mdi/js';
import { tv } from 'tailwind-variants';
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  useHost,
  useId,
  useTemplateRef,
} from 'vue';

import type { CFieldSize } from '../../types';

import { coerceBoolean } from '../../shared/coerceBoolean';
import { emitModelValue } from '../../shared/emitModelValue';
import { useHostEmit } from '../../shared/useHostEmit';

/** Events dispatched by `<c-text-field>`. */
interface CTextFieldEvents {
  /**
   * Standard bubbling DOM change event, re-dispatched from the host when the
   * inner input/textarea fires its native change (which does not cross the
   * shadow boundary). No detail; read the current text from the host's
   * `value` property.
   */
  change: void;
  /**
   * Fired on every keystroke (and on native change), carrying the current
   * text — trimmed when `trim-whitespace` is set.
   */
  changeValue: string;
  /**
   * Native bubbling input event fired alongside every value change so a
   * plain Vue `v-model` works without the `v-control` directive. No detail.
   */
  input: void;
  /**
   * v-model contract event fired on every keystroke (and on native change),
   * carrying the current text — trimmed when `trim-whitespace` is set.
   */
  'update:value': string;
}

/**
 * c-text-field is a thin orchestrator around <c-input>: it owns the
 * <input>/<textarea> element (so type-specific behaviour like password-toggle
 * and date-picker live here) and passes label / error-message / state props to
 * c-input, which renders the outlined Material border + floating-label visuals.
 *
 * Styling lives in this `tailwind-variants` config. The native
 * input/textarea and toggle buttons are real elements we render in *this*
 * shadow root, so they take utilities directly. The few native pseudo-elements
 * (`::placeholder`, the WebKit date-picker internals) can't be utilities and
 * stay in the escape-hatch <style> below. Customization via
 * `::part()`.
 */
const textField = tv({
  slots: {
    // Shared input/textarea reset + typography. `font: inherit` then an
    // explicit 16px/20px to match the original; caret colour is the active
    // token. Tailwind's preflight zeroes input padding, so padding is set
    // explicitly per element below.
    //
    // The value text colour is set EXPLICITLY to the body token (not
    // `text-[inherit]`): c-input drives an inheritable `color` on its root for
    // the inactive/active/error state cascade (border + label), and inheriting
    // it would tint the typed value — turning it primary on focus and, most
    // visibly, RED in the error state. The original gives the input/textarea
    // their own `color: var(--_c-input-text-color)` for exactly this reason.
    // `disabled:` matches the original's tertiary disabled value colour.
    input:
      'c-text-field__input bg-transparent border-0 outline-none m-0 [font:inherit] text-base leading-5 text-on-surface disabled:text-on-surface-muted [caret-color:var(--c-primary)] flex-auto min-w-0 w-full max-w-full py-2 max-h-8',
    post: 'inline-flex items-center gap-1',
    textarea:
      'c-text-field__textarea bg-transparent border-0 outline-none [font:inherit] text-base leading-5 text-on-surface disabled:text-on-surface-muted [caret-color:var(--c-primary)] flex-auto min-w-0 w-full max-w-full m-0 pt-3 pr-3 pb-2 pl-0 min-h-11 resize-y whitespace-pre-wrap',
    toggle:
      'inline-flex items-center justify-center size-7 p-0 border-none bg-transparent text-[inherit] cursor-pointer rounded-full transition-colors duration-200 ease-in-out hover:not-disabled:bg-primary-subtle-hover focus:outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-primary focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    toggleIcon: 'size-5',
  },
});

const props = withDefaults(defineProps<CTextFieldProps>(), {
  autocomplete: '',
  autocorrect: undefined,
  automaticCapitalize: undefined,
  disabled: false,
  errorMessage: '',
  hideDetails: false,
  hint: '',
  hostId: '',
  label: '',
  labelOnTop: false,
  max: null,
  min: null,
  name: '',
  placeholder: '',
  readonly: false,
  required: false,
  rows: 1,
  shadow: false,
  size: 'default',
  step: null,
  trimWhitespace: false,
  type: 'text',
  valid: true,
  value: '',
});

const ui = computed(() => textField());

const host = useHost();

const emit = useHostEmit<CTextFieldEvents>();

// Forward `hide-details` to `c-input` through a `data-*` channel (resolved from
// the stable host attribute), not a direct `:hide-details` binding: that key
// collides with c-input's declared `hideDetails` prop and Vue mangles/removes
// it on re-render (the field re-renders on every keystroke). See the matching
// note in CSelect.vue and the resolver in CInput.vue.
const hideDetailsResolved = computed(() =>
  host?.hasAttribute('hide-details')
    ? coerceBoolean(host.getAttribute('hide-details'))
    : coerceBoolean(props.hideDetails),
);

const inputRef = useTemplateRef<HTMLInputElement | HTMLTextAreaElement>(
  'inputRef',
);

const autoId = useId();

const inputId = computed(() => props.hostId || autoId);

const isFocused = ref(false);

const originalType = props.type;

const currentType = ref(props.type);

// Date inputs render a permanent "mm/dd/yyyy" format hint inside the
// field, so the floating label has to stay lifted from the start —
// otherwise it overlaps the format hint. Treat date as always-filled.
const isDateType = originalType === 'date';

// A field "has a value" when it holds anything but the empty string — `0`
// (a numeric property binding on a `type="number"` field) counts. A plain
// truthiness check would leave the label un-floated over a typed zero.
const hasValue = computed(
  () => props.value !== '' && props.value !== null && props.value !== undefined,
);

// `active` colours the border/label primary and must track focus ONLY — a
// filled-but-blurred field keeps the resting border colour. Lifting the label
// over an existing value is the separate `filled` flag.
const isActiveForInput = computed(() => isFocused.value);

const isFilledForInput = computed(() => hasValue.value || isDateType);

// Detect consumer-provided slotted content. We need this at the
// c-text-field level (rather than c-input via `useHasSlot`) because
// c-input sees our wrapper span as always-assigned. By only rendering
// the wrapper when there's real consumer content, c-input's hasPreSlot
// stays false and no flex gap is drawn before the input.
const hasConsumerPre = ref(false);

const hasConsumerPost = ref(false);

const hasToggle = computed(
  () => originalType === 'password' || (originalType === 'date' && !isFirefox),
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

  if (props.label && !isFocused.value && !hasValue.value) return undefined;

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
  const el = inputRef.value as HTMLInputElement | null;

  if (el && typeof el.showPicker === 'function') el.showPicker();
};

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement;

  const next = props.trimWhitespace ? target.value.trim() : target.value;
  // changeValue/update:value + native `input` (so a plain `v-model` works
  // without `v-control`) + host `value` mirror. The inner input is bound via
  // template `:value`, so mirroring the just-typed value is idempotent.
  emitModelValue(host, next);
  void event;
};

const onChange = (event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement;

  const next = props.trimWhitespace ? target.value.trim() : target.value;
  emitModelValue(host, next);
  emit('change', undefined, { bubbles: true, composed: true });
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

<!--
  Escape-hatch CSS: only constructs Tailwind utilities cannot
  express. All static styling lives in the `tv` config above. What remains:
    - `:host { display: block }` — the host must be a real box (the global
      `:host{display:contents}` would collapse the field).
    - `::placeholder` — a native pseudo-element on the input/textarea we own;
      not addressable by a utility class.
    - The WebKit date-input internals (`::-webkit-calendar-picker-indicator`
      etc.) we hide because we render our own date toggle, plus the date
      padding tweak that aligns the date text with regular text inputs —
      attribute-selector + pseudo-element rules with no utility equivalent.
  Tokens only; no hardcoded colours.
-->
<style>
:host {
  display: block;
}

.c-text-field__input::placeholder,
.c-text-field__textarea::placeholder {
  color: var(--c-on-surface-faint);
  opacity: 1;
}

/* Date type: hide the native browser calendar picker indicator + inner
 * spin button. We render our own calendar toggle button in the post slot.
 * Also flatten the WebKit datetime-edit padding so the date text starts at
 * the same x-position as a regular text input. */

input[type='date']::-webkit-calendar-picker-indicator,
input[type='date']::-webkit-inner-spin-button,
input[type='date']::-webkit-clear-button {
  display: none;
  -webkit-appearance: none;
  appearance: none;
}

input[type='date']::-webkit-datetime-edit,
input[type='date']::-webkit-datetime-edit-fields-wrapper {
  padding: 0;
}

input[type='date'] {
  padding-left: 0;
  text-indent: 0;
}
</style>
