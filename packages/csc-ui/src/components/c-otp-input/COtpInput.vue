<template>
  <div
    :id="`announce-${resolvedId}`"
    :class="ui.visuallyHidden()"
    aria-atomic="true"
    aria-live="polite"
  >
    {{ statusText }}
  </div>

  <div
    ref="rootRef"
    :aria-labelledby="labelVisible ? labelId : undefined"
    :class="ui.root()"
    part="root"
    role="group"
  >
    <form-label
      v-show="labelVisible"
      :class="ui.label()"
      :label
      :label-id
      :required
      part="label"
    >
      <slot />
    </form-label>

    <div :class="ui.digits()" part="digits">
      <input
        v-for="i in length"
        :id="`${resolvedId}--input-${i}`"
        :key="i"
        ref="inputsRef"
        :aria-label="`Enter code - digit number - ${i} of ${length}`"
        :autofocus="hasAutofocus && i === 1 ? true : undefined"
        :class="ui.input()"
        :name="`${resolvedId}--digit-${i}`"
        autocapitalize="off"
        autocomplete="off"
        autocorrect="off"
        data-1p-ignore=""
        data-form-type="other"
        data-lpignore="true"
        inputmode="numeric"
        maxlength="1"
        part="input"
        spellcheck="false"
        type="tel"
        @focus="onFocus(i - 1)"
        @input="onInput($event as InputEvent)"
        @keydown="onKeyDown($event as KeyboardEvent)"
        @paste="i === 1 && onPaste($event as ClipboardEvent)"
      />
    </div>

    <c-message
      :class="ui.message()"
      :error-message
      :hint
      :input-id="elementId"
      :valid
    />
  </div>
</template>

<script setup lang="ts">
/**
 * @slot default - Fallback content for the group label when the `label` prop is not set
 *
 * @csspart root - The wrapper laying out the label, the digit inputs and the message
 * @csspart label - The group label rendered above the digit inputs
 * @csspart digits - The inline-grid wrapper around the digit inputs
 * @csspart input - Each single-digit `<input>` box (one per digit)
 */
import { tv } from 'tailwind-variants';
import {
  computed,
  onMounted,
  ref,
  useHost,
  useId,
  useTemplateRef,
  watch,
} from 'vue';

import FormLabel from '../../shared/FormLabel.vue';
import { useHasSlot } from '../../shared/useHasSlot';
import { useHostEmit } from '../../shared/useHostEmit';

/** Events dispatched by `<c-otp-input>`. */
interface COtpInputEvents {
  /**
   * Fired on every digit change with the complete code once all digits are
   * filled, or `null` while the code is still incomplete (legacy value-change
   * event).
   */
  changeValue: null | string;
  /** Fired when the last digit is filled, carrying the complete code. */
  completion: null | string;
  /**
   * Native bubbling input event for plain `v-model`; carries no detail — the
   * model value is mirrored onto the host's `value` property.
   */
  input: void;
  /**
   * Fired on every digit change with the currently entered digits (v-model
   * contract).
   */
  'update:value': string;
}

// Multi-root template (fragment) + we write to the host below — keep
// fallthrough attrs on the host element instead of tripping the "renders
// fragment" warning.
defineOptions({ inheritAttrs: false });

/**
 * Styling lives in this `tailwind-variants` config: the old
 * `--_c-otp-input-*` indirection vars are dropped in favour of token-mapped
 * utilities, and the `:host(.error)` border colour swap becomes the `valid`
 * variant. Consumer customization is via `::part()`.
 *
 * The digit `<input>`s live in *this* shadow root (not slotted), so the
 * box-shadow notch border is authored as an inset `ring`: `ring-1` inactive,
 * `ring-2` on focus. The `valid` variant recolours both states to error red.
 */
const otp = tv({
  defaultVariants: {
    hideDetails: false,
    valid: true,
  },
  slots: {
    // `display: inline-grid` with a column-per-digit auto track (the
    // `grid-auto-columns: minmax(auto, 42px)` original).
    digits:
      'inline-grid gap-2 grid-flow-col grid-cols-[repeat(var(--_c-otp-input-count),minmax(auto,42px))] [backface-visibility:hidden] [transform:translate3d(0,0,0)]',
    input:
      'rounded-csc-md border-0 text-center w-full min-w-6 max-w-[42px] h-14 text-2xl text-on-surface ring-1 ring-inset ring-border-strong outline-none focus:ring-2 focus:ring-inset focus:ring-primary',
    label: 'text-left',
    message: '',
    // Column layout stacking the group label, the digit grid and the message.
    root: 'inline-flex flex-col gap-1 mb-2',
    visuallyHidden:
      'absolute w-px h-px m-[-1px] p-0 overflow-hidden whitespace-nowrap border-0 [clip:rect(0_0_0_0)]',
  },
  variants: {
    hideDetails: {
      true: { root: 'mb-0' },
    },
    valid: {
      false: {
        input: 'ring-error focus:ring-error',
      },
    },
  },
});

interface COtpInputProps {
  /**
   * Id of the element
   *
   * @seeded from csc-ui — verify
   * @freeform
   */
  elementId?: string;
  /**
   * Error message shown in place of the hint while the input is invalid
   *
   * @freeform
   */
  errorMessage?: string;
  /**
   * Auto focus
   *
   * @seeded from csc-ui — verify
   */
  hasAutofocus?: boolean;
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
   * Label of the input group, shown above the digit inputs
   *
   * @freeform
   */
  label?: string;
  /**
   * Length of the OTP code
   *
   * @seeded from csc-ui — verify
   */
  length?: number;
  /**
   * Set as required — shows the required marker on the label
   */
  required?: boolean;
  /**
   * Set the validíty of the input
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

const props = withDefaults(defineProps<COtpInputProps>(), {
  elementId: '',
  errorMessage: '',
  hasAutofocus: false,
  hideDetails: false,
  hint: '',
  label: '',
  length: 6,
  required: false,
  valid: true,
  value: '',
});

const host = useHost();

const emit = useHostEmit<COtpInputEvents>();

const autoId = useId();

const resolvedId = computed(() => props.elementId || autoId);

const rootRef = useTemplateRef<HTMLElement>('rootRef');

// Group-label slot fallback (like c-radio-group). The FormLabel is v-show'n —
// not v-if'd — so the default <slot> always exists and slot detection isn't
// circular with the label's own visibility.
const hasSlotContent = useHasSlot(rootRef, '');

const labelVisible = computed(
  () => Boolean(props.label) || hasSlotContent.value,
);

const labelId = computed(() => `${resolvedId.value}-label`);

const ui = computed(() =>
  otp({ hideDetails: props.hideDetails, valid: props.valid }),
);

const statusText = ref('');

// `ref="inputsRef"` on the v-for collects the digit <input>s into an array
// in document order (Vue 3.5 useTemplateRef).
const inputsRef = useTemplateRef<HTMLInputElement[]>('inputsRef');

const inputs = (): HTMLInputElement[] => inputsRef.value ?? [];

let backspacePressed = false;

let isPasting = false;

let statusDebounce: null | ReturnType<typeof setTimeout> = null;

const updateStatusText = () => {
  if (statusDebounce !== null) {
    clearTimeout(statusDebounce);
    statusDebounce = null;
  }

  statusDebounce = setTimeout(() => {
    const value = inputs()
      .map((i) => i?.value ?? '')
      .join('');

    let text =
      !props.valid && props.errorMessage ? `Error: ${props.errorMessage} ` : '';
    text += `Currently entered - ${
      !value.length ? 'nothing' : value.split('').join(' - ')
    }`;
    statusText.value = text.trim();
    statusDebounce = null;
  }, 1400);
};

const emitValue = () => {
  requestAnimationFrame(() => {
    const value = inputs()
      .map((i) => i?.value ?? '')
      .join('');

    const isFull = value.length === props.length;

    const modelValue = isFull ? value : null;
    emit('changeValue', modelValue);
    emit('update:value', value);

    if (isFull) emit('completion', value || null);

    // Native v-model bridge (works without `v-control`): mirror the model value
    // (null until complete, matching `changeValue`) onto the host's `value` and
    // fire a native `input`. The value watch no-ops on null, so partial typing
    // is not disturbed.
    if (host) {
      (host as { value?: unknown } & HTMLElement).value = modelValue;
      emit('input', undefined, { bubbles: true });
    }

    updateStatusText();
  });
};

const handleValueChange = (value: null | string, forceEmpty = false) => {
  if (!value && !forceEmpty) return;

  const digits = (value ?? '').split('');
  inputs().forEach((input, index) => {
    if (input) input.value = digits[index] || '';
  });
};

const onFocus = (index: number) => inputs()[index]?.select();

const onKeyDown = (event: KeyboardEvent) => {
  backspacePressed = false;

  const target = event.target as HTMLInputElement;

  const previousElement =
    target.previousElementSibling as HTMLInputElement | null;

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
    if (index >= inputs().length) return;

    const input = inputs()[index];

    if (!input) return;
    input.value = '';
    input.value = char;
  });

  const nextIndex = Math.min(props.length, paste.length) - 1;
  requestAnimationFrame(() => {
    inputs()[nextIndex]?.focus();
    emitValue();
  });
};

// Expose a public reset() like Stencil's @Method().
const reset = () => {
  inputs().forEach((i) => {
    if (i) i.value = '';
  });
  emitValue();
};

watch(() => props.errorMessage, updateStatusText);
watch(
  () => props.value,
  (v) => {
    handleValueChange(v);
    updateStatusText();
  },
);

onMounted(() => {
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

<!--
  Escape-hatch CSS: only constructs Tailwind utilities cannot
  express. The static styling lives in the `tv` config above. What remains:
    - `:host { display: block }` — the host must be a real box so the
      flex-column root lays out (the global `:host{display:contents}` would
      otherwise collapse it); the per-type sheet is adopted after the shared
      sheet, so it wins.
-->
<style>
:host {
  display: block;
}
</style>
