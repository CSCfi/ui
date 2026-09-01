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
    <!-- `indeterminate` is a DOM property only (no attribute), so it needs the
         `.prop` binding — without it the `input:indeterminate` state rules in
         the escape-hatch never match. -->
    <input
      :id="inputId"
      :aria-checked="indeterminate ? 'mixed' : isChecked"
      :checked="isChecked"
      :class="ui.input()"
      :disabled
      :indeterminate.prop
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
      >
        <span
          v-for="r in ripples"
          :key="r.id"
          :class="ui.rippleEffect()"
          :style="r.style"
          aria-hidden="true"
        />

        <span
          :class="ui.indicator()"
          class="c-checkbox__box"
          part="indicator"
        />

        <svg
          v-if="isChecked || indeterminate"
          :class="ui.svg()"
          aria-hidden="true"
          part="mark"
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

    <!-- The message AREA is always in the flow (unless `hide-details`), the
         same as c-input: it reserves its min-height so a validation error
         appearing at runtime doesn't push the content below it down. Only the
         inner line mounts/unmounts. Mode `out-in` mirrors the Stencil
         c-message lifecycle: the outgoing message slides up + fades out, then
         200ms later the new message slides down + fades in. `:key` forces a
         re-mount whenever the message identity (hint vs error, or text
         content) changes. -->
    <div v-if="!hideDetails" :class="ui.message()" part="message">
      <transition mode="out-in" name="c-checkbox-message">
        <span v-if="messageVisible" :key="messageKey" :class="ui.messageLine()">
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
  </div>
</template>

<script setup lang="ts">
/**
 * @slot default - Default slot for the label
 *
 * @csspart root - The outer wrapper containing the checkbox, label and message
 * @csspart label - The `<label>` element wrapping the indicator and the label content
 * @csspart indicator - The checkbox box itself — the bordered square that fills when checked
 * @csspart mark - The SVG check / indeterminate glyph revealed inside the indicator; draws with `currentColor`, so `color` recolours it
 * @csspart content - Wrapper around the label text or slotted label content
 * @csspart message - The hint / error message area below the checkbox (always reserved unless `hide-details`)
 *
 * @cssstate checked - Present while the checkbox is checked
 * @cssstate indeterminate - Present while the checkbox is in the indeterminate state
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
import { useHostStates } from '../../shared/useHostStates';
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
 * Styling lives in this `tailwind-variants` config; the old
 * `--_c-checkbox-*` indirection layer is dropped in favour of direct token
 * utilities. Customization is via `::part()` against the stamped part names;
 * there is no `override` prop.
 *
 * The actual checkbox box is the `indicator` slot (the `indicator` part), and
 * the white check is an SVG `<path>` (the `mark` part). Their
 * CHECKED/INDETERMINATE state is driven by sibling selectors
 * (`input:checked + label .c-checkbox__box`) which depend on the live DOM
 * `:checked` of a sibling input and therefore cannot be `tv` variants — they
 * live in the escape-hatch `<style>` below. The STATIC box look (size, border,
 * radius, transition) is authored here; the escape-hatch only flips colours on
 * state change. The same states are republished on the host via
 * `ElementInternals` so consumers get per-state `::part()` styling
 * (`c-checkbox:state(checked)::part(indicator)`, ADR-0035).
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
        indicator: 'border-error',
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
    // The checkbox box: an 18x18 square at (12,12) inside the ripple surface,
    // 2px radius, transparent fill. Its colours flip on :checked via the
    // escape-hatch sibling rule below. A real element (not a pseudo) so it can
    // carry the `indicator` part.
    indicator:
      'absolute top-3 left-3 h-[18px] w-[18px] rounded-csc-sm border-2 bg-transparent transition-[background-color,border-color] duration-200 ease-out',
    // Visually hidden but keyboard/screen-reader accessible — standard pattern
    // for hiding the underlying native checkbox.
    input:
      'absolute h-px w-px overflow-hidden border-0 p-0 [clip:rect(1px,1px,1px,1px)]',
    label: 'flex gap-1 relative cursor-pointer select-none',
    labelContent: 'pt-[10px] text-left select-none',
    // Outer message AREA (reserved, see the template) + the inner hint/error
    // line that fades in/out inside it.
    message: 'px-3 text-xs leading-none min-h-4 text-on-surface-muted',
    messageIcon: 'fill-current h-4 w-4 relative -top-0.5 shrink-0',
    messageLine: 'flex items-start gap-1',
    // 42px circular ripple surface holding the box, the check and the click
    // ripple. Purely internal (no part).
    ripple:
      'grid place-content-center relative h-[42px] w-[42px] min-w-[42px] overflow-hidden rounded-full transform-gpu transition-colors duration-200 ease-in-out',
    // Material click ripple: an absolutely-positioned circle, centred in the
    // 42px ripple surface (which already clips via overflow-hidden + rounded-
    // full). Like c-button, it tweens scale/opacity via the `transition` util
    // rather than a bespoke @keyframes. Colour follows state.
    rippleEffect:
      'pointer-events-none absolute rounded-full bg-primary transition-[transform,opacity] duration-[600ms] ease-out',
    root: 'relative w-fit',
    // The check / indeterminate glyph (the `mark` part). Its paths draw with
    // `currentColor` (escape-hatch), so this `text-*` utility — or a consumer
    // `color` on `::part(mark)` — recolours the glyph. The svg only exists
    // while checked/indeterminate (v-if), so its colour is unconditional here;
    // the error variant overrides it below.
    svg: 'absolute top-[14px] left-[14px] h-[14px] w-[14px] z-[1] text-on-primary',
    visuallyHidden:
      'absolute h-px w-px overflow-hidden border-0 p-0 [clip:rect(1px,1px,1px,1px)]',
  },
  variants: {
    // Box + check colour. Default uses the primary token; disabled and error
    // override. These map cleanly to props so they are `tv` variants. The
    // CHECKED-state fill of the box/check stays sibling-driven in escape-hatch.
    disabled: {
      false: {
        indicator: 'border-primary',
      },
      true: {
        indicator: 'border-border-strong',
      },
    },
    error: {
      false: {},
      // The mark recolours on error even while disabled (unlike the box,
      // where disabled wins) — matches the pre-tv sibling-rule cascade.
      true: { svg: 'text-on-error' },
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

// Republish checked/indeterminate as host custom states so consumers can
// write per-state ::part() rules: c-checkbox:state(checked)::part(indicator).
const setState = useHostStates();

watch(isChecked, (on) => setState('checked', on), { immediate: true });

watch(
  () => props.indeterminate,
  (on) => setState('indeterminate', on),
  { immediate: true },
);

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
  Escape-hatch CSS: only constructs Tailwind utilities cannot
  express. Everything static lives in the `tv` config above. What remains:

  - `:host{display:inline-block}` — restores a box on the host (the global
    sheet sets `:host{display:contents}`); needed so the component lays out as
    an inline-block. Targets the host, not a `tv` element.
  - The sibling-driven indicator state: `input:checked + label .c-checkbox__box`
    (fill the box). It depends on the live `:checked`/`:indeterminate`/
    `:focus-visible` state of a SIBLING <input>, which `tv` variants cannot
    observe. The static box look is in `tv` (the `indicator` slot); here we
    only flip colours on state.
  - The `.c-checkbox__path` currentColor plumbing and SVG stroke geometry —
    stroke properties are not utilities; the colour itself is tv-driven on the
    svg (the `mark` part).
  - Hover tint and focus-visible outline on the ripple surface, both driven
    by sibling `:focus-visible` / descendant `:hover`.
  - The hint/error message slide Transition keyframes (Vue transition classes).
  Tokens only; no hardcoded colours.
-->
<style>
:host {
  display: inline-block;
}

/* The glyph draws with currentColor so ONE colour channel rules it: the tv
 * `text-on-primary` / `text-on-error` utilities on the svg internally, and a
 * consumer `color` on `::part(mark)` externally. The svg only exists while
 * checked/indeterminate (v-if), so no reveal rule is needed. */
.c-checkbox__path {
  fill: currentColor;
  stroke: currentColor;
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
input:checked + label .c-checkbox__box,
input:indeterminate + label .c-checkbox__box {
  background-color: var(--c-primary);
  border-color: var(--c-primary);
}

.c-checkbox--error input:checked + label .c-checkbox__box,
.c-checkbox--error input:indeterminate + label .c-checkbox__box {
  background-color: var(--c-error);
  border-color: var(--c-error);
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

.c-checkbox--disabled input:checked + label .c-checkbox__box,
.c-checkbox--disabled input:indeterminate + label .c-checkbox__box {
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
