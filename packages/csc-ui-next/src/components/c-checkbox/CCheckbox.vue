<template>
  <div
    ref="rootRef"
    :class="[
      ui.root(),
      { 'c-checkbox--disabled': disabled, 'c-checkbox--error': !valid },
    ]"
    class="c-checkbox"
    part="root"
  >
    <input
      :id="inputId"
      :aria-checked="indeterminate ? 'mixed' : isChecked"
      :checked="isChecked"
      :class="ui.input()"
      :disabled
      :name="hostName || undefined"
      :required
      type="checkbox"
      @change="onChange"
    />

    <label :class="ui.label()" :for="inputId" part="label">
      <span
        ref="rippleContainerRef"
        :class="ui.ripple()"
        class="c-checkbox__ripple"
        part="indicator"
      >
        <span
          v-for="r in ripples"
          :key="r.id"
          :class="ui.rippleEffect()"
          :style="r.style"
          aria-hidden="true"
        />

        <svg
          v-if="isChecked || indeterminate"
          :class="ui.svg()"
          aria-hidden="true"
          viewBox="0 0 100 100"
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

      <form-label
        v-show="!!label || hasSlotContent"
        :class="ui.labelContent()"
        :label
        :required
        part="content"
        tag="span"
      >
        <slot />
      </form-label>
    </label>

    <!-- Mode `out-in` mirrors the Stencil c-message lifecycle: the
         outgoing message slides up + fades out, then 200ms later the new
         message slides down + fades in. `:key` forces a re-mount whenever
         the message identity (hint vs error, or text content) changes. -->
    <transition mode="out-in" name="c-checkbox-message">
      <span
        v-if="!hideDetails && messageVisible"
        :key="messageKey"
        :class="ui.message()"
        part="message"
      >
        <svg
          v-if="showError"
          :class="ui.messageIcon()"
          aria-hidden="true"
          viewBox="0 0 24 24"
        >
          <path :d="errorIconPath" />
        </svg>

        <span :class="ui.visuallyHidden()">
          {{ showError ? 'Error: ' : 'Hint: ' }}
        </span>

        <span>{{ showError ? errorMessage : hint }}</span>
      </span>
    </transition>
  </div>
</template>

<script setup lang="ts">
/**
 * @slot default - Default slot for the label
 *
 * @csspart root - The outer wrapper containing the checkbox, label and message
 * @csspart label - The `<label>` element wrapping the indicator and the label content
 * @csspart indicator - The circular ripple surface holding the checkbox box and checkmark
 * @csspart content - Wrapper around the label text or slotted label content
 * @csspart message - The hint / error message line below the checkbox
 *
 * @seeded from csc-ui — verify
 */
import { mdiCloseCircle } from '@mdi/js';
import { tv } from 'tailwind-variants';
import { computed, ref, useHost, useId, useTemplateRef, watch } from 'vue';

import { emitModelValue } from '../../shared/emitModelValue';
import FormLabel from '../../shared/FormLabel.vue';
import { useHasSlot } from '../../shared/useHasSlot';
import { useHostEmit } from '../../shared/useHostEmit';
import { useRipple } from '../../shared/useRipple';

/** Events dispatched by `<c-checkbox>`. */
interface CCheckboxEvents {
  /**
   * Standard bubbling DOM change event, re-dispatched from the host when the
   * checkbox is toggled (the inner input's change does not cross the shadow
   * boundary). No detail; read the new value from the host's `value` property.
   */
  change: void;
  /**
   * Fired when the checkbox is toggled, carrying the new value —
   * `trueValue` when checked, `falseValue` when unchecked.
   */
  changeValue: boolean | number | string;
  /**
   * Native bubbling input event fired on toggle so a plain Vue `v-model`
   * works without the `v-control` directive. No detail.
   */
  input: void;
  /**
   * v-model contract event fired on toggle, carrying the new value —
   * `trueValue` when checked, `falseValue` when unchecked.
   */
  'update:value': boolean | number | string;
}

/**
 * Styling lives in this `tailwind-variants` config (ADR-0004); the old
 * `--_c-checkbox-*` indirection layer is dropped in favour of direct token
 * utilities. Customization is via `::part()` against the stamped part names
 * (ADR-0006); there is no `override` prop.
 *
 * The actual checkbox box is a `::before` pseudo-element on the `ripple` slot,
 * and the white check is an SVG `<path>`. Their CHECKED/INDETERMINATE state is
 * driven by sibling selectors (`input:checked + label .ripple::before`) which
 * depend on the live DOM `:checked` of a sibling input and therefore cannot be
 * `tv` variants — they live in the escape-hatch `<style>` below (ADR-0007).
 * The STATIC box look (size, border, radius, transition) is authored here as
 * `before:` utilities; the escape-hatch only flips colours on state change.
 *
 * The `disabled` / error (`!valid`) recolouring DOES map to props, so it is
 * expressed here as `tv` variants on the box/check colours.
 */
const checkbox = tv({
  compoundVariants: [
    // Error overrides the box border colour (and applies even alongside the
    // base text colour). Ordered after `disabled` so error wins for the box.
    {
      class: {
        ripple: 'before:border-error',
        rippleEffect: 'bg-error',
        root: 'text-error',
      },
      disabled: false,
      error: true,
    },
    {
      class: {
        label: 'cursor-default',
        root: 'text-on-surface-muted opacity-75',
      },
      disabled: true,
    },
  ],
  defaultVariants: {
    disabled: false,
    error: false,
    messageError: false,
  },
  slots: {
    // Visually hidden but keyboard/screen-reader accessible — standard pattern
    // for hiding the underlying native checkbox.
    input:
      'absolute h-px w-px overflow-hidden border-0 p-0 [clip:rect(1px,1px,1px,1px)]',
    label: 'flex gap-1 relative cursor-pointer select-none',
    labelContent: 'pt-[10px] text-left select-none',
    message:
      'flex items-start gap-1 px-3 text-xs leading-none min-h-4 text-on-surface-muted',
    messageIcon: 'fill-current h-4 w-4 relative -top-0.5 shrink-0',
    // 42px circular ripple surface. The checkbox box is the `before:` pseudo:
    // an 18x18 square at (12,12) with 2px radius + transparent fill; its
    // colours flip on :checked via the escape-hatch sibling rule below.
    ripple:
      "grid place-content-center relative h-[42px] w-[42px] min-w-[42px] overflow-hidden rounded-full transform-gpu transition-colors duration-200 ease-in-out before:content-[''] before:absolute before:top-3 before:left-3 before:h-[18px] before:w-[18px] before:rounded-csc-sm before:border-2 before:bg-transparent before:transition-[background-color,border-color] before:duration-200 before:ease-out",
    // Material click ripple: an absolutely-positioned circle, centred in the
    // 42px ripple surface (which already clips via overflow-hidden + rounded-
    // full). Like c-button, it tweens scale/opacity via the `transition` util
    // rather than a bespoke @keyframes (ADR-0004). Colour follows state.
    rippleEffect:
      'pointer-events-none absolute rounded-full bg-primary transition-[transform,opacity] duration-[600ms] ease-out',
    root: 'relative w-fit',
    svg: 'absolute top-[14px] left-[14px] h-[14px] w-[14px] z-[1]',
    visuallyHidden:
      'absolute h-px w-px overflow-hidden border-0 p-0 [clip:rect(1px,1px,1px,1px)]',
  },
  variants: {
    // Box + check colour. Default uses the primary token; disabled and error
    // override. These map cleanly to props so they are `tv` variants. The
    // CHECKED-state fill of the box/check stays sibling-driven in escape-hatch.
    disabled: {
      false: {
        ripple: 'before:border-primary',
      },
      true: {
        ripple: 'before:border-border-strong',
      },
    },
    error: {
      false: {},
      true: {},
    },
    // The message line recolours separately from the box: an invalid checkbox
    // with no `errorMessage` keeps showing its hint AS a hint (neutral).
    messageError: {
      true: { message: 'text-error' },
    },
  },
});

const errorIconPath = mdiCloseCircle;

interface CCheckboxProps {
  /**
   * If `true`, the checkbox is selected.
   *
   * @seeded from csc-ui — verify
   */
  checked?: boolean;
  /**
   * Disable the checkbox
   *
   * @seeded from csc-ui — verify
   */
  disabled?: boolean;
  /**
   * Error message shown in place of the hint while the checkbox is invalid
   *
   * @freeform
   */
  errorMessage?: string;
  /**
   * The value when the checkbox is unchecked
   *
   * @seeded from csc-ui — verify
   */
  falseValue?: boolean | number | string;
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
   * Id of the element
   *
   * @seeded from csc-ui — verify
   * @freeform
   */
  hostId?: string;
  /**
   * Name of the input
   * - Only used when the checkbox participates in a native `<form>`
   *
   * @seeded from csc-ui — verify
   * @freeform
   */
  hostName?: string;
  /**
   * Indeterminate state
   *
   * @seeded from csc-ui — verify
   */
  indeterminate?: boolean;
  /**
   * Element label
   *
   * @seeded from csc-ui — verify
   * @freeform
   */
  label?: string;
  /**
   * Set as required
   *
   * @seeded from csc-ui — verify
   */
  required?: boolean;
  /**
   * The value when the checkbox is checked
   *
   * @seeded from csc-ui — verify
   */
  trueValue?: boolean | number | string;
  /**
   * Set the validity of the input
   *
   * @seeded from csc-ui — verify
   */
  valid?: boolean;
  /**
   * The input value
   * - Only used when the checkbox participates in a native `<form>`
   *
   * @seeded from csc-ui — verify
   */
  value?: boolean | number | string;
}

const props = withDefaults(defineProps<CCheckboxProps>(), {
  checked: false,
  disabled: false,
  errorMessage: '',
  falseValue: false,
  hideDetails: false,
  hint: '',
  hostId: '',
  hostName: '',
  indeterminate: false,
  label: '',
  required: false,
  trueValue: true,
  valid: true,
  value: false,
});

const showError = computed(() => !props.valid && Boolean(props.errorMessage));

const ui = computed(() =>
  checkbox({
    disabled: props.disabled,
    error: !props.valid,
    messageError: showError.value,
  }),
);

// Event emissions are dispatched directly on the host as CustomEvents
// with `detail` set to the raw value. Vue's own `emit()` for
// defineCustomElement wraps every emit's args into `detail: [...args]`
// (always an array), which breaks consumers like the `v-control`
// directive that do `el.value = event.detail`. Manual dispatch keeps
// `detail` as the bare value, matching the Stencil component's behaviour.
const host = useHost();

const emit = useHostEmit<CCheckboxEvents>();

const rootRef = useTemplateRef<HTMLElement>('rootRef');

const hasSlotContent = useHasSlot(rootRef, '');

const rippleContainerRef = useTemplateRef<HTMLElement>('rippleContainerRef');

// Material-style ripple (shared logic in useRipple), always centred in the 42px
// surface (the change event carries no pointer coordinates, so centring is the
// only sensible origin). `sizeFactor: 1` keeps the dot inside the fixed circular
// surface; the `rippleEffect` slot's transition utilities tween it.
const { ripples, spawn: spawnRipple } = useRipple({
  container: () => rippleContainerRef.value,
  sizeFactor: 1,
});

const autoId = useId();

const inputId = computed(() => props.hostId || autoId);

// The Transition's `:key` swaps the element when message identity
// changes (hint↔error or text changes), triggering the slide animation.
const messageKey = computed(() =>
  showError.value ? `error:${props.errorMessage}` : `hint:${props.hint}`,
);

const messageVisible = computed(() => Boolean(props.hint || showError.value));

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
  spawnRipple();
  internalChecked.value = !internalChecked.value;

  const nextValue = internalChecked.value ? props.trueValue : props.falseValue;
  // Emits changeValue/update:value + native `input` (so a plain `v-model` works
  // without `v-control`) and mirrors `value` onto the host. The value watch
  // above is visuals-only, so writing the property doesn't loop.
  emitModelValue(host, nextValue);
  // Standard DOM change for non-Vue consumers; re-dispatched from the
  // host because the inner <input>'s native change event doesn't escape
  // the shadow root (composed: false by default).
  emit('change', undefined, { bubbles: true, composed: true });
};
</script>

<!--
  Escape-hatch CSS (ADR-0007): only constructs Tailwind utilities cannot
  express. Everything static lives in the `tv` config above. What remains:

  - `:host{display:inline-block}` — restores a box on the host (the global
    sheet sets `:host{display:contents}`); needed so the component lays out as
    an inline-block. Targets the host, not a `tv` element.
  - The sibling-driven indicator state: `input:checked + label .ripple::before`
    (fill the box) and the `::before`/`.c-checkbox__path` stroke/fill rules.
    These depend on the live `:checked`/`:indeterminate`/`:focus-visible` state
    of a SIBLING <input>, which `tv` variants cannot observe. The static box
    look is in `tv` (`before:` utilities); here we only flip colours on state.
  - `::before` hover tint and focus-visible outline on the ripple, both driven
    by sibling `:focus-visible` / descendant `:hover`.
  - The hint/error message slide Transition keyframes (Vue transition classes).
  Tokens only; no hardcoded colours except the spec'd white checkmark.
-->
<style>
:host {
  display: inline-block;
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

/* Checked / indeterminate: fill the box (colour set on the ripple via the tv
 * `before:border-*` variant; here we fill with the same active colour) and
 * reveal the white check. Sibling-input selector — input precedes label. */
input:checked + label .c-checkbox__ripple::before,
input:indeterminate + label .c-checkbox__ripple::before {
  background-color: var(--c-primary);
  border-color: var(--c-primary);
}

.c-checkbox--error input:checked + label .c-checkbox__ripple::before,
.c-checkbox--error input:indeterminate + label .c-checkbox__ripple::before {
  background-color: var(--c-error);
  border-color: var(--c-error);
}

input:checked + label .c-checkbox__path,
input:indeterminate + label .c-checkbox__path {
  stroke: var(--c-on-primary);
  fill: var(--c-on-primary);
}

.c-checkbox--error input:checked + label .c-checkbox__path,
.c-checkbox--error input:indeterminate + label .c-checkbox__path {
  stroke: var(--c-on-error);
  fill: var(--c-on-error);
}

input:indeterminate + label .c-checkbox__path--indeterminate {
  fill: var(--c-on-primary);
  stroke: transparent;
}

/* Hover: tint only the circular ripple, never the box itself. */
label:hover .c-checkbox__ripple {
  background-color: color-mix(in srgb, var(--c-primary) 10%, transparent);
}

/* Focus-visible: 2px ring around the ripple circle. */
input:focus-visible + label .c-checkbox__ripple {
  outline: 2px solid var(--c-primary);
  outline-offset: -1px;
}

.c-checkbox--error input:focus-visible + label .c-checkbox__ripple {
  outline-color: var(--c-error);
}

/* Disabled recolours the sibling-driven indicator and suppresses the hover
 * tint. The root carries `.c-checkbox--disabled` (set in the template) so these
 * compound sibling rules can scope to it; `tv` variants cannot reach the
 * `:checked + label ::before` sibling chain. Disabled wins over error. */
.c-checkbox--disabled label:hover .c-checkbox__ripple {
  background-color: transparent;
}

.c-checkbox--disabled input:focus-visible + label .c-checkbox__ripple {
  outline-color: var(--c-border-strong);
}

.c-checkbox--disabled input:checked + label .c-checkbox__ripple::before,
.c-checkbox--disabled input:indeterminate + label .c-checkbox__ripple::before {
  background-color: var(--c-border-strong);
  border-color: var(--c-border-strong);
}

/* Vertical slide + fade between hint and error messages. */
.c-checkbox-message-enter-active,
.c-checkbox-message-leave-active {
  transition:
    opacity 0.2s cubic-bezier(0.25, 0.8, 0.5, 1),
    transform 0.2s cubic-bezier(0.25, 0.8, 0.5, 1);
}

.c-checkbox-message-enter-from,
.c-checkbox-message-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
