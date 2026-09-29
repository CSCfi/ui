<template>
  <c-input
    :active="isFocused"
    :data-hide-details="String(hideDetailsResolved)"
    :disabled
    :error-message
    :filled="text !== ''"
    :hint
    :input-id
    :label
    :label-on-top="labelOnTopResolved"
    :required
    :shadow="shadowResolved"
    :size="sizeResolved"
    :valid
  >
    <!-- Consumer pre/post content (a currency, a unit), forwarded only when
         present so c-input draws no empty gap — as in c-text-field. -->
    <span v-if="hasConsumerPre" slot="pre" class="contents">
      <slot name="pre" />
    </span>

    <input
      :id="inputId"
      ref="inputRef"
      :aria-invalid="!valid || outOfRange || undefined"
      :class="ui.input()"
      :disabled
      :inputmode
      :name="name || undefined"
      :placeholder="effectivePlaceholder"
      :readonly
      :required
      :value="text"
      autocomplete="off"
      part="input"
      type="text"
      @blur="onBlur"
      @focus="onFocus"
      @input="onInput"
    />

    <span v-if="hasConsumerPost" slot="post" class="contents">
      <slot name="post" />
    </span>
  </c-input>
</template>

<script lang="ts">
export interface CNumberFieldProps {
  /**
   * The most fraction digits the field takes; `0` makes it an integer field
   *
   * @defaultable 0
   */
  decimals?: number;
  /**
   * The decimal separator. Empty follows the page's `lang` (`,` for `fi`, `.` for `en`)
   *
   * @defaultable ''
   * @freeform one character
   */
  decimalSeparator?: string;
  /**
   * Disable the field
   */
  disabled?: boolean;
  /**
   * Error message shown in place of the hint while the field is invalid
   *
   * @freeform
   */
  errorMessage?: string;
  /**
   * Pad the fraction to exactly `decimals` digits when the field is left (`12,5` → `12,50`)
   *
   * @defaultable false
   */
  fixedDecimals?: boolean;
  /**
   * The thousands separator. Empty follows the page's `lang` (a space for `fi`, `,` for `en`)
   *
   * @defaultable ''
   * @freeform one character
   */
  groupSeparator?: string;
  /**
   * Hide the hint and error messages
   *
   * @defaultable false
   */
  hideDetails?: boolean;
  /**
   * Hint text for the field
   *
   * @freeform
   */
  hint?: string;
  /**
   * Id of the input
   *
   * @freeform
   */
  hostId?: string;
  /**
   * Label of the field
   *
   * @freeform
   */
  label?: string;
  /**
   * Label on top of the field
   *
   * @defaultable false
   */
  labelOnTop?: boolean;
  /**
   * The largest number in range; a larger one is kept and reported as out of range
   */
  max?: null | number;
  /**
   * The smallest number in range; a smaller one is kept and reported as out of range. At `0` or above, the minus key is ignored
   */
  min?: null | number;
  /**
   * Name of the input
   *
   * @freeform
   */
  name?: string;
  /**
   * Placeholder of the input
   *
   * @freeform
   */
  placeholder?: string;
  /**
   * Mark as readonly
   */
  readonly?: boolean;
  /**
   * Set the field as required
   */
  required?: boolean;
  /**
   * Shadow variant of the field
   *
   * @defaultable false
   */
  shadow?: boolean;
  /**
   * Field height: the 52px default (the shared control height) or the 36px `small` box
   *
   * @defaultable 'default'
   */
  size?: CFieldSize;
  /**
   * Set the validity of the field
   */
  valid?: boolean;
  /**
   * The number, or `null` when the field is empty. A string is read as the number it spells, and `''` as empty — what an attribute, or a plain `v-model` holding `null`, writes; the field always emits a number or `null`
   */
  value?: null | number | string;
}
</script>

<script setup lang="ts">
/**
 * @slot pre - Content before the number, such as a currency sign
 * @slot post - Content after the number, such as a unit
 * @csspart input - The text input
 * @cssstate out-of-range - Present while the number is below `min` or above `max`
 */
import { tv } from 'tailwind-variants';
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  useHost,
  useId,
  useTemplateRef,
  watch,
} from 'vue';

import type { CFieldSize } from '../../types';
import type { CNumberFieldFormat } from './numbers';

import { useAppDefault } from '../../shared/appDefaults';
import { emitModelChange } from '../../shared/emitModelValue';
import { applyConform } from '../../shared/inputMask';
import { useHostStates } from '../../shared/useHostStates';
import {
  conformNumber,
  formatNumber,
  numberSeparators,
  readNumber,
} from './numbers';

/**
 * Events dispatched by `<c-number-field>` — all three at once, through
 * `emitModelChange`.
 */
interface CNumberFieldEvents {
  /**
   * Fired whenever typing changes the number, carrying it — `null` once the
   * field holds no digit. Not fired when only the text changes (a group
   * separator, a trailing decimal separator) or when `value` is set.
   */
  change: null | number;
  /**
   * Native bubbling input event fired alongside every value change so a
   * plain Vue `v-model` works. No detail.
   */
  input: void;
  /**
   * v-model contract event, fired with `change`.
   */
  'update:value': null | number;
}

const numberField = tv({
  slots: {
    // The input typography of c-text-field's input, so the two line up in
    // a form.
    input:
      'c-number-field__input bg-transparent border-0 outline-none m-0 [font:inherit] text-base leading-5 text-on-surface disabled:text-on-surface-muted [caret-color:var(--c-primary)] flex-auto min-w-0 w-full max-w-full py-2 max-h-8 [font-variant-numeric:tabular-nums]',
  },
});

const props = withDefaults(defineProps<CNumberFieldProps>(), {
  decimals: undefined,
  decimalSeparator: undefined,
  disabled: false,
  errorMessage: '',
  fixedDecimals: undefined,
  groupSeparator: undefined,
  hideDetails: undefined,
  hint: '',
  hostId: '',
  label: '',
  labelOnTop: undefined,
  max: null,
  min: null,
  name: '',
  placeholder: '',
  readonly: false,
  required: false,
  shadow: undefined,
  size: undefined,
  valid: true,
  value: null,
});

const ui = computed(() => numberField());

const host = useHost();

const appDefault = useAppDefault('c-number-field', props);

const decimalsResolved = appDefault('decimals', 0);

const decimalSeparatorResolved = appDefault('decimalSeparator', '');

const fixedDecimalsResolved = appDefault('fixedDecimals', false);

const groupSeparatorResolved = appDefault('groupSeparator', '');

const hideDetailsResolved = appDefault('hideDetails', false);

const labelOnTopResolved = appDefault('labelOnTop', false);

const shadowResolved = appDefault('shadow', false);

const sizeResolved = appDefault('size', 'default');

const setState = useHostStates();

const inputRef = useTemplateRef<HTMLInputElement>('inputRef');

const autoId = useId();

const inputId = computed(() => props.hostId || autoId);

const isFocused = ref(false);

// The page's language, re-read on focus (a `lang` change re-reads).
const pageLang = ref(
  typeof document === 'undefined' ? '' : document.documentElement.lang,
);

const toNumber = (v: unknown): null | number => {
  if (v === null || v === undefined || v === '') return null;

  const n = typeof v === 'number' ? v : Number(v);

  return Number.isFinite(n) ? n : null;
};

const format = computed<CNumberFieldFormat>(() => {
  const intl = numberSeparators(pageLang.value);

  const min = toNumber(props.min);

  return {
    allowNegative: min === null || min < 0,
    decimal: decimalSeparatorResolved.value || intl.decimal,
    decimals: Math.max(0, Math.floor(Number(decimalsResolved.value) || 0)),
    group: groupSeparatorResolved.value || intl.group,
  };
});

// Numeric keyboards on iOS have no minus key, so only a field that cannot
// hold a negative number asks for one.
const inputmode = computed(() => {
  if (format.value.allowNegative) return undefined;

  return format.value.decimals > 0 ? 'decimal' : 'numeric';
});

/** The number the field holds, as last typed or set. */
const current = ref<null | number>(toNumber(props.value));

const text = ref(formatNumber(current.value, format.value));

const same = (a: null | number, b: null | number) =>
  a === b || (a !== null && b !== null && Object.is(a + 0, b + 0));

/** Whether the number is below `min` or above `max` (CONTEXT.md "Out of range") */
const outOfRange = computed<boolean>(() => {
  const n = current.value;

  if (n === null) return false;

  const min = toNumber(props.min);

  const max = toNumber(props.max);

  return (min !== null && n < min) || (max !== null && n > max);
});

watch(outOfRange, (on) => setState('out-of-range', on), { immediate: true });

// A set `value` re-formats the text — unless the text already reads as that
// number, which is also what the `emitModelChange` mirror writes back while
// the user types ("12," stays "12,"). Never emits.
watch(
  () => props.value,
  (v) => {
    const next = toNumber(v);

    if (same(next, readNumber(text.value, format.value))) {
      current.value = next;

      return;
    }

    current.value = next;
    text.value = formatNumber(next, format.value);
  },
);

// New separators or decimals re-format what is shown.
watch(format, (next, prev) => {
  if (
    next.decimal === prev.decimal &&
    next.group === prev.group &&
    next.decimals === prev.decimals &&
    next.allowNegative === prev.allowNegative
  )
    return;

  text.value = formatNumber(current.value, next);
});

const effectivePlaceholder = computed(() => {
  if (!props.placeholder) return undefined;

  if (labelOnTopResolved.value) return props.placeholder;

  if (props.label && !isFocused.value && text.value === '') return undefined;

  return props.placeholder;
});

const onInput = (event: Event) => {
  const input = event.target as HTMLInputElement;

  const result = applyConform(
    input,
    event,
    (t, caret = t.length) => conformNumber(t, caret, format.value),
    text.value,
  );

  // IME composition: leave the raw text until it settles.
  if (!result) return;

  text.value = result.text;

  if (same(result.value, current.value)) return;

  current.value = result.value;
  emitModelChange(host, result.value satisfies CNumberFieldEvents['change']);
};

const onFocus = () => {
  isFocused.value = true;
  pageLang.value = document.documentElement.lang;
};

// Leaving the field tidies the text ("12," → "12", padding under
// `fixed-decimals`); the number does not change, so nothing is emitted.
const onBlur = () => {
  isFocused.value = false;
  text.value = formatNumber(
    current.value,
    format.value,
    fixedDecimalsResolved.value,
  );
};

// Pre/post slot detection, as in c-text-field: c-input would otherwise see
// our wrapper spans as always assigned and draw an empty gap.
const hasConsumerPre = ref(false);

const hasConsumerPost = ref(false);

const refreshConsumerSlots = () => {
  if (!host) return;
  hasConsumerPre.value = !!host.querySelector(':scope > [slot="pre"]');
  hasConsumerPost.value = !!host.querySelector(':scope > [slot="post"]');
};

let childObserver: MutationObserver | null = null;

onMounted(() => {
  refreshConsumerSlots();

  if (fixedDecimalsResolved.value && !isFocused.value)
    text.value = formatNumber(current.value, format.value, true);

  if (host && typeof MutationObserver !== 'undefined') {
    childObserver = new MutationObserver(refreshConsumerSlots);
    childObserver.observe(host, { childList: true });
  }
});

onBeforeUnmount(() => {
  childObserver?.disconnect();
});

defineExpose({ outOfRange });
</script>

<!--
  Escape-hatch CSS:
    - `:host { display: block }` — the field is a real box.
    - `::placeholder` — a native pseudo-element on the input we own.
-->
<style>
:host {
  display: block;
}

.c-number-field__input::placeholder {
  color: var(--c-on-surface-faint);
  opacity: 1;
}
</style>
