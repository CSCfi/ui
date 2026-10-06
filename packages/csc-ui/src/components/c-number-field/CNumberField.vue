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

    <!-- An editable spinbutton (ADR-0064): the arrow and page keys step, the
         step buttons stay out of the tab order. -->
    <input
      :id="inputId"
      ref="inputRef"
      :aria-invalid="!valid || outOfRange || undefined"
      :aria-valuemax="maxNumber ?? undefined"
      :aria-valuemin="minNumber ?? undefined"
      :aria-valuenow="current ?? undefined"
      :aria-valuetext="text || undefined"
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
      role="spinbutton"
      type="text"
      @blur="onBlur"
      @focus="onFocus"
      @input="onInput"
      @keydown="onKeydown"
    />

    <!-- The consumer's post content (a unit), then the step buttons. A press
         never moves focus, so a tap on a phone opens no keyboard; `.stop`
         keeps c-input's click-to-focus off them. -->
    <span slot="post" :class="ui.post()">
      <slot name="post" />

      <span :class="ui.steps()" @mousedown.prevent>
        <button
          :aria-label="t.increase"
          :class="ui.stepButton()"
          :disabled="!canUp"
          part="step-up"
          tabindex="-1"
          type="button"
          @click.stop="onStepClick(1)"
          @contextmenu.prevent
          @pointercancel="releaseStep"
          @pointerdown="onStepPress($event, 1)"
          @pointerleave="releaseStep"
          @pointerup="releaseStep"
        >
          <svg :class="ui.stepIcon()" aria-hidden="true" viewBox="0 0 24 24">
            <path :d="mdiChevronUp" />
          </svg>
        </button>

        <button
          :aria-label="t.decrease"
          :class="ui.stepButton()"
          :disabled="!canDown"
          part="step-down"
          tabindex="-1"
          type="button"
          @click.stop="onStepClick(-1)"
          @contextmenu.prevent
          @pointercancel="releaseStep"
          @pointerdown="onStepPress($event, -1)"
          @pointerleave="releaseStep"
          @pointerup="releaseStep"
        >
          <svg :class="ui.stepIcon()" aria-hidden="true" viewBox="0 0 24 24">
            <path :d="mdiChevronDown" />
          </svg>
        </button>
      </span>
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
   * The spacing of the grid the step buttons and arrow keys move along, counted from `min` (or `0`)
   *
   * @defaultable 1
   */
  step?: number;
  /**
   * UI text overrides (i18n), merged over the English defaults. Objects have no attribute form — bind as a DOM property
   *
   * @defaultable {}
   */
  texts?: CNumberFieldTexts;
  /**
   * Set the validity of the field
   */
  valid?: boolean;
  /**
   * The number, or `null` when the field is empty. A string is read as the number it spells, and `''` as empty — what an attribute, or a plain `v-model` holding `null`, writes; the field always emits a number or `null`
   */
  value?: null | number | string;
}

/** UI texts of `c-number-field`, merged key by key over the English defaults. */
export interface CNumberFieldTexts {
  /** Accessible label of the step-down button. */
  decrease?: string;
  /** Accessible label of the step-up button. */
  increase?: string;
}
</script>

<script setup lang="ts">
/**
 * @slot pre - Content before the number, such as a currency sign
 * @slot post - Content after the number, such as a unit; the step buttons follow it
 * @csspart input - The text input
 * @csspart step-up - The button that steps the number up
 * @csspart step-down - The button that steps the number down
 * @cssstate out-of-range - Present while the number is below `min` or above `max`
 */
import { mdiChevronDown, mdiChevronUp } from '@mdi/js';
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
  stepNumber,
} from './numbers';

/**
 * Events dispatched by `<c-number-field>` — all three at once, through
 * `emitModelChange`.
 */
interface CNumberFieldEvents {
  /**
   * Fired whenever typing or a step changes the number, carrying it — `null`
   * once the field holds no digit. Not fired when only the text changes (a group
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
      'c-number-field__input m-0 max-h-8 w-full max-w-full min-w-0 flex-auto border-0 bg-transparent py-2 text-base leading-5 text-on-surface [font-variant-numeric:tabular-nums] [caret-color:var(--c-primary)] outline-none [font:inherit] disabled:text-on-surface-muted',
    post: 'inline-flex items-center gap-1',
    stepButton:
      'inline-flex h-6 w-8 cursor-pointer [touch-action:manipulation] items-center justify-center rounded-csc-sm border-none bg-transparent p-0 text-[inherit] transition-colors duration-200 ease-in-out select-none [-webkit-tap-highlight-color:transparent] hover:not-disabled:bg-primary-subtle-hover disabled:cursor-not-allowed disabled:opacity-50',
    stepIcon: 'size-5 fill-current',
    // Stacked halves of a 48px column at the default size (24px targets,
    // WCAG 2.5.8); side by side at `small`, where halves of 36px would fall
    // under it — down first, as on a number line. Pulled into the slot's
    // right padding so the column sits near the edge, as a spinner does.
    steps: '-mr-2 inline-flex flex-col',
  },
  variants: {
    size: {
      default: {},
      small: { stepButton: 'h-8 w-7', steps: '-mr-1.5 flex-row-reverse' },
    },
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
  step: undefined,
  texts: undefined,
  valid: true,
  value: null,
});

const ui = computed(() => numberField({ size: sizeResolved.value }));

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

const stepResolved = appDefault('step', 1);

const ownTexts = appDefault('texts', {} as Required<CNumberFieldTexts>);

const DEFAULT_TEXTS: Required<CNumberFieldTexts> = {
  decrease: 'Decrease',
  increase: 'Increase',
};

const t = computed<Required<CNumberFieldTexts>>(() => ({
  ...DEFAULT_TEXTS,
  ...Object.fromEntries(
    Object.entries(ownTexts.value).filter(([, v]) => v !== undefined),
  ),
}));

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

const minNumber = computed(() => toNumber(props.min));

const maxNumber = computed(() => toNumber(props.max));

const format = computed<CNumberFieldFormat>(() => {
  const intl = numberSeparators(pageLang.value);

  const min = minNumber.value;

  return {
    allowNegative: min === null || min < 0,
    decimal: decimalSeparatorResolved.value || intl.decimal,
    decimals: Math.max(0, Math.floor(Number(decimalsResolved.value) || 0)),
    group: groupSeparatorResolved.value || intl.group,
  };
});

// Always a numeric keyboard (ADR-0064). The iOS ones have no minus key: a
// negative is reached there by stepping below zero.
const inputmode = computed(() =>
  format.value.decimals > 0 ? 'decimal' : 'numeric',
);

/** The number the field holds, as last typed or set. */
const current = ref<null | number>(toNumber(props.value));

const text = ref(formatNumber(current.value, format.value));

const same = (a: null | number, b: null | number) =>
  a === b || (a !== null && b !== null && Object.is(a + 0, b + 0));

/** Whether the number is below `min` or above `max` (CONTEXT.md "Out of range") */
const outOfRange = computed<boolean>(() => {
  const n = current.value;

  if (n === null) return false;

  const min = minNumber.value;

  const max = maxNumber.value;

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

// ---- stepping (CONTEXT.md "Step"; ADR-0064) ----------------------------

const stepOptions = computed(() => ({
  decimals: format.value.decimals,
  max: maxNumber.value,
  min: minNumber.value,
  step: Number(stepResolved.value),
}));

/** The number `count` steps away, or `null` when a step would not change it. */
const stepped = (direction: -1 | 1, count = 1): null | number => {
  if (props.disabled || props.readonly) return null;

  const next = stepNumber(current.value, direction, stepOptions.value, count);

  return next === null || same(next, current.value) ? null : next;
};

/** Take a step; `false` when there is none to take (at a bound). */
const stepBy = (direction: -1 | 1, count = 1): boolean => {
  const next = stepped(direction, count);

  if (next === null) return false;

  current.value = next;
  text.value = formatNumber(
    next,
    format.value,
    fixedDecimalsResolved.value && !isFocused.value,
  );
  emitModelChange(host, next satisfies CNumberFieldEvents['change']);

  return true;
};

const canUp = computed(() => stepped(1) !== null);

const canDown = computed(() => stepped(-1) !== null);

const STEP_KEYS: Record<string, [-1 | 1, number]> = {
  ArrowDown: [-1, 1],
  ArrowUp: [1, 1],
  PageDown: [-1, 10],
  PageUp: [1, 10],
};

const onKeydown = (event: KeyboardEvent) => {
  const key = STEP_KEYS[event.key];

  if (
    !key ||
    event.isComposing ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    props.disabled ||
    props.readonly
  )
    return;

  event.preventDefault();
  stepBy(...key);
};

// Holding a step button repeats: one step on the press, then after a pause
// a step per tick until the release or a bound.
const REPEAT_DELAY = 400;

const REPEAT_INTERVAL = 75;

let repeatTimer: ReturnType<typeof setTimeout> | undefined;

// A press already stepped: the click that follows it must not step again.
// A click with no press before it (a screen reader's activation) steps.
let pressed = false;

const stopRepeat = () => {
  clearTimeout(repeatTimer);
  repeatTimer = undefined;
};

// The click, if any, follows the release in the same task.
const releaseStep = () => {
  stopRepeat();

  if (pressed) setTimeout(() => (pressed = false));
};

const onStepPress = (event: PointerEvent, direction: -1 | 1) => {
  if (event.button !== 0) return;

  // No focus move: a tap must not open the phone keyboard, and a focused
  // input keeps its focus and caret.
  event.preventDefault();
  stopRepeat();
  pressed = true;

  if (!stepBy(direction)) return;

  // At a bound the button turns disabled and may see no release.
  const repeat = () => {
    if (stepBy(direction)) repeatTimer = setTimeout(repeat, REPEAT_INTERVAL);
    else releaseStep();
  };

  repeatTimer = setTimeout(repeat, REPEAT_DELAY);
};

const onStepClick = (direction: -1 | 1) => {
  if (pressed) {
    pressed = false;

    return;
  }

  stepBy(direction);
};

// Pre slot detection, as in c-text-field: c-input would otherwise see our
// wrapper span as always assigned and draw an empty gap. The post wrapper
// always holds the step buttons.
const hasConsumerPre = ref(false);

const refreshConsumerSlots = () => {
  if (!host) return;
  hasConsumerPre.value = !!host.querySelector(':scope > [slot="pre"]');
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
  clearTimeout(repeatTimer);
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
