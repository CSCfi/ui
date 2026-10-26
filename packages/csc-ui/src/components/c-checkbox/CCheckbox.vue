<template>
  <div
    ref="rootRef"
    :class="[ui.root(), { 'c-checkbox--disabled': disabled }]"
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
        <span :class="ui.rippleLayer()" aria-hidden="true">
          <span
            v-for="r in ripples"
            :key="r.id"
            :class="ui.rippleEffect()"
            :style="r.style"
          />
        </span>

        <!-- The box (`indicator` part) and its glyph (`mark` part) are the
             shared SelectionIndicator SFC, placed at (12,12) inside the 42px
             ripple surface. The literal `c-checkbox__box` class is the hook
             the sibling-input state rules in the escape-hatch key on. -->
        <selection-indicator
          :checked="isChecked"
          :disabled
          :error="!valid"
          :indeterminate
          class="c-checkbox__box absolute top-3 left-3"
          focus-halo
        />
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
 * @csspart indicator - The checkbox box itself — the bordered square that fills when checked; border, fill and the keyboard focus ring (its `::before`) all draw with `currentColor`, so `color` recolours them together
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
import {
  computed,
  nextTick,
  onMounted,
  ref,
  useHost,
  useId,
  useTemplateRef,
  watch,
} from 'vue';

import FormLabel from '../../shared/FormLabel.vue';
import SelectionIndicator from '../../shared/SelectionIndicator.vue';
import { useHasSlot } from '../../shared/useHasSlot';
import { useHostStates } from '../../shared/useHostStates';
import { useRipple } from '../../shared/useRipple';
import { emitModelChange } from '../../shared/valueEvents';

/** Events dispatched by `<c-checkbox>`. */
interface CCheckboxEvents {
  /**
   * Fired when the user toggles the checkbox, carrying the new value —
   * `trueValue` when checked, `falseValue` when unchecked.
   */
  change: boolean | number | string;

  /**
   * Native bubbling input event fired on toggle so a plain Vue `v-model`
   * stays in sync. No detail.
   */
  input: void;

  /**
   * Fired alongside `change` with the same detail — the `v-model` contract.
   */
  'update:value': boolean | number | string;
}

/**
 * Styling lives in this `tailwind-variants` config; the old
 * `--_c-checkbox-*` indirection layer is dropped in favour of direct token
 * utilities. Customization is via `::part()` against the stamped part names;
 * there is no `override` prop.
 *
 * The actual checkbox box (the `indicator` part) and the white check (the
 * `mark` part) are the shared `SelectionIndicator` SFC (ADR-0044), which owns
 * their static look and colour channels: `text-*` sets `currentColor`, and the
 * border, the checked fill and the keyboard focus ring (the `before:` halo)
 * all draw from it — so a consumer `color` on `::part(indicator)` recolours
 * the three together (ADR-0039). The fill is prop-driven there; the
 * focus-ring REVEAL depends on the live `:focus-visible` state of the sibling
 * input and therefore cannot be a `tv` variant — it lives in the escape-hatch
 * `<style>` below. The same states are republished on the host via
 * `ElementInternals` so consumers get per-state `::part()` styling
 * (`c-checkbox:state(checked)::part(indicator)`, ADR-0035).
 *
 * The `disabled` / error (`!valid`) recolouring maps to props and is passed
 * to the indicator; here it only recolours the root text and the ripple.
 */
const checkbox = tv({
  compoundVariants: [
    // Error recolours the root text and the ripple alongside the indicator's
    // own error channel; only while not disabled.
    {
      class: {
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
    label: 'relative flex cursor-pointer gap-1 select-none',
    labelContent: 'pt-[10px] text-left select-none',
    // Outer message AREA (reserved, see the template) + the inner hint/error
    // line that fades in/out inside it.
    message: 'min-h-4 px-3 text-xs leading-none text-on-surface-muted',
    messageIcon: 'relative -top-0.5 h-4 w-4 shrink-0 fill-current',
    messageLine: 'flex items-start gap-1',
    // 42px circular ripple surface holding the box, the check and the click
    // ripple. Purely internal (no part). Does NOT clip: the indicator's focus
    // halo overhangs it by 2px; clipping is the `rippleLayer`'s job.
    ripple:
      'relative grid h-[42px] w-[42px] min-w-[42px] transform-gpu place-content-center rounded-full transition-colors duration-200 ease-in-out',
    // Material click ripple: an absolutely-positioned circle, centred in the
    // 42px ripple surface (clipped by the `rippleLayer`). Like c-button, it
    // tweens scale/opacity via the `transition` util rather than a bespoke
    // @keyframes. Colour follows state.
    rippleEffect:
      'pointer-events-none absolute rounded-full bg-primary transition-[transform,opacity] duration-[600ms] ease-out',
    // Clips the ripple to the circle so the indicator's focus halo (which
    // overhangs the surface by 2px) is not clipped with it.
    rippleLayer:
      'pointer-events-none absolute inset-0 overflow-hidden rounded-full',
    root: 'relative w-fit',
    visuallyHidden:
      'absolute h-px w-px overflow-hidden border-0 p-0 [clip:rect(1px,1px,1px,1px)]',
  },
  variants: {
    // `disabled` / `error` drive the compound variants above; the indicator's
    // own colour channels are handled inside SelectionIndicator.
    disabled: {
      false: {},
      true: {},
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
   * Whether the checkbox is on: the boolean view of `value`. Setting it sets
   * `value` to `trueValue` or `falseValue`; reading it reports whether
   * `value` equals `trueValue`. As an attribute it sets the initial state when
   * no `value` is bound.
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
   * The checkbox's state: `trueValue` while it is on, `falseValue` while it is
   * off. A bound value wins over a `checked` attribute; any other value,
   * `''` included, reads as off.
   */
  // Not sorted: Vue reads `''` as `true` for a prop whose runtime types list
  // Boolean before String, and `''` is what a plain Vue `v-model` writes for
  // an empty model.
  // oxlint-disable-next-line perfectionist/sort-union-types
  value?: string | number | boolean;
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
  value: undefined,
});

const showError = computed(() => !props.valid && Boolean(props.errorMessage));

const ui = computed(() =>
  checkbox({
    disabled: props.disabled,
    error: !props.valid,
    messageError: showError.value,
  }),
);

const host = useHost();

const rootRef = useTemplateRef<HTMLElement>('rootRef');

const hasSlotContent = useHasSlot(rootRef, '');

const rippleContainerRef = useTemplateRef<HTMLElement>('rippleContainerRef');

// Material-style ripple (shared logic in useRipple), always centred in the 42px
// surface (the change event carries no pointer coordinates, so centring is the
// only sensible origin). `sizeFactor: 1` keeps the dot inside the fixed circular
// surface, the `rippleLayer` clips it there, and the `rippleEffect` slot's
// transition utilities tween it.
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

// One state, two views (decisions #34): `value` is the state, `checked` its
// boolean view. A bound `value` wins; without one, `checked` seeds. Setting
// either view updates the other on the host, without a value event — only a
// toggle emits.
type CheckboxStateHost = {
  checked?: boolean;
  value?: CCheckboxProps['value'];
} & HTMLElement;

const isOn = (v: unknown) => v === props.trueValue;

const internalChecked = ref(
  props.value === undefined ? props.checked : isOn(props.value),
);

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

// The views are reconciled on the next tick, from the state the latest
// change left: a host prop set inside a watcher re-renders the element while
// it is still patching (the next prop write is then dropped), and a callback
// holding the state from before a later write would undo it — React sets
// `checked` only after the element has mounted.
let syncQueued = false;

const syncViews = () => {
  if (syncQueued) return;
  syncQueued = true;

  void nextTick(() => {
    syncQueued = false;

    if (!host) return;

    const state = host as CheckboxStateHost;

    const on = internalChecked.value;

    // The raw property, not the prop: a `checked` attribute reads back `''`.
    if (state.checked !== on) state.checked = on;

    if (props.value === undefined || isOn(props.value) !== on) {
      state.value = on ? props.trueValue : props.falseValue;
    }
  });
};

watch(
  () => props.value,
  (v) => {
    internalChecked.value = isOn(v);
    syncViews();
  },
);

watch(
  () => props.checked,
  (c) => {
    internalChecked.value = c;
    syncViews();
  },
);

// Both views agree from the start: without a bound value the seeded state
// reads back through `value`, and `checked` reports a bound one.
onMounted(syncViews);

const onChange = (_event: Event) => {
  if (props.disabled) return;
  spawnRipple();
  internalChecked.value = !internalChecked.value;

  const nextValue = internalChecked.value ? props.trueValue : props.falseValue;
  // A toggle is its own commit. The value watch above is visuals-only, so the
  // host `value` mirror doesn't loop.
  emitModelChange(host, nextValue satisfies CCheckboxEvents['change']);
};
</script>

<!--
  Escape-hatch CSS: only constructs Tailwind utilities cannot
  express. Everything static lives in the `tv` config above. What remains:

  - `:host{display:inline-block}` — restores a box on the host (the global
    sheet sets `:host{display:contents}`); needed so the component lays out as
    an inline-block. Targets the host, not a `tv` element.
  - The sibling-driven indicator state: `input:checked + label .c-checkbox__box`
    (fill the box with currentColor — redundant with the prop-driven fill the
    shared SelectionIndicator paints, kept so the box never lags the native
    input) and `input:focus-visible + label .c-checkbox__box::before` (reveal
    the focus halo). Both depend on the live `:checked`/`:indeterminate`/
    `:focus-visible` state of a SIBLING <input>, which `tv` variants cannot
    observe. The static look — box, glyph, halo geometry, colour channel — is
    the shared indicator's; here we only flip state.
  - Hover tint on the ripple surface, driven by descendant `:hover`. (The
    focus ring is NOT here: it is the indicator's `before:` halo, so it follows
    the indicator's colour — ADR-0039.)
  - The hint/error message slide Transition keyframes (Vue transition classes).
  Tokens only; no hardcoded colours.
-->
<style>
:host {
  display: inline-block;
}

/* Checked / indeterminate: fill the box with its own colour channel
 * (currentColor — primary, error or disabled grey as set by the tv `text-*`
 * utility, or a consumer `color` on `::part(indicator)`) and reveal the white
 * check. Sibling-input selector — input precedes label. */
input:checked + label .c-checkbox__box,
input:indeterminate + label .c-checkbox__box {
  background-color: currentColor;
}

/* Hover: tint only the circular ripple, never the box itself. Stays on the
 * internal primary channel (ADR-0039: hover looks remain internal). */
label:hover .c-checkbox__ripple {
  background-color: color-mix(in srgb, var(--c-primary) 10%, transparent);
}

/* Focus-visible: reveal the indicator's `before:` halo (geometry and colour
 * are tv-authored; it draws with the indicator's currentColor). */
input:focus-visible + label .c-checkbox__box::before {
  opacity: 1;
}

/* Disabled suppresses the hover tint. The root carries `.c-checkbox--disabled`
 * (set in the template) so this descendant rule can scope to it. Disabled
 * colours (border, fill, ring) ride on the indicator's tv colour channel. */
.c-checkbox--disabled label:hover .c-checkbox__ripple {
  background-color: transparent;
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
