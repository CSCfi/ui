<template>
  <label
    ref="rootRef"
    :class="[
      ui.root(),
      {
        'c-switch--disabled': disabled,
      },
    ]"
    :for="inputId"
    class="c-switch"
    part="root"
  >
    <div :class="ui.inputWrap()">
      <input
        :id="inputId"
        :aria-checked="internalChecked"
        :checked="internalChecked || undefined"
        :class="ui.input()"
        :disabled
        role="switch"
        type="checkbox"
        @change="toggle"
      />

      <span
        :class="[
          ui.slider(),
          {
            'c-switch__slider--disabled': disabled,
            'c-switch__slider--loading': loading,
          },
        ]"
        class="c-switch__slider"
        part="slider"
      >
        <span :class="ui.spinner()" class="c-switch__spinner">
          <!-- color="currentColor" so the spinner tracks the slider's colour
               (tertiary-600 off → white on); the spinner prop default is
               primary-600, which would otherwise ignore the slider colour. -->
          <c-spinner :size="14" :width="2" color="currentColor" />
        </span>
      </span>
    </div>

    <div v-show="hasSlotContent" :class="ui.label()" part="label">
      <slot />

      <span v-if="required" :class="ui.required()" aria-hidden="true">
        &nbsp;*
      </span>
    </div>
  </label>
</template>

<script setup lang="ts">
/**
 * @slot default - The visible label of the switch
 *
 * @csspart root - The `<label>` element wrapping the toggle and the label text
 * @csspart slider - The toggle track (its `::before` pseudo-element is the handle)
 * @csspart label - Wrapper around the slotted label content
 */
import { tv } from 'tailwind-variants';
import { computed, ref, useHost, useId, useTemplateRef, watch } from 'vue';

import { emitModelValue } from '../../shared/emitModelValue';
import { useHasSlot } from '../../shared/useHasSlot';
import { useHostEmit } from '../../shared/useHostEmit';

/** Events dispatched by `<c-switch>`. */
interface CSwitchEvents {
  /**
   * Standard bubbling DOM change event, re-dispatched from the host when the
   * switch is toggled (the inner input's change does not cross the shadow
   * boundary). No detail; read the new value from the host's `value` property.
   */
  change: void;
  /**
   * Fired when the switch is toggled, carrying the new value —
   * `trueValue` when on, `falseValue` when off.
   */
  changeValue: boolean | number | string;
  /**
   * Native bubbling input event fired on toggle so a plain Vue `v-model`
   * works without the `v-control` directive. No detail.
   */
  input: void;
  /**
   * v-model contract event fired on toggle, carrying the new value —
   * `trueValue` when on, `falseValue` when off.
   */
  'update:value': boolean | number | string;
}

/**
 * Styling lives in this `tailwind-variants` config (ADR-0004); the old
 * `--_c-switch-*` indirection layer is dropped. Customization is via
 * `::part()` (ADR-0006); there is no `override` prop.
 *
 * The track (`slider`) and the round handle (`slider::before`) make up the
 * toggle. The handle's ON position (`translateX`) and the ON/OFF/disabled
 * COLOURS are sibling-driven (`input:checked + .slider …`) — they depend on
 * the live `:checked`/`:focus-visible` of the sibling input, which `tv`
 * variants cannot observe — so they remain in the escape-hatch `<style>`
 * below (ADR-0007). The static track/handle geometry lives here in `tv`.
 *
 * SPINNER RECOLOUR: <c-spinner> is passed `color="currentColor"` (its prop
 * default is primary-600), so it tracks the inherited colour. The escape-hatch
 * sets `color` on `.c-switch__slider` equal to the current
 * handle colour (tertiary-600 off → white on → tertiary-500/white when
 * disabled), and the handle `::before` paints with `background:currentColor`.
 * So both the handle and the spinner inherit the same colour and stay in sync
 * across off/on/disabled states without any `--c-spinner-color` var (dead).
 */
const cSwitch = tv({
  defaultVariants: {
    disabled: false,
    hasLabel: false,
  },
  slots: {
    input: 'h-0 opacity-0 w-0 absolute',
    inputWrap: 'h-5.5 relative w-11 self-start',
    label: 'self-center',
    required: 'text-error',
    // Track geometry: 22x44, pill radius, gap to label. The on/off colours and
    // handle position are sibling-driven in the escape-hatch below.
    root: 'inline-grid h-5.5 relative items-center gap-3 transform-gpu [backface-visibility:hidden]',
    // The track. Border drawn as an inset ring; colours flipped on state in
    // escape-hatch. Handle is the `::before` (also escape-hatch, sibling-driven
    // for its translate). The slider's `color` (set in escape-hatch) is what
    // the nested c-spinner inherits via `currentColor`.
    slider:
      'absolute inset-0 rounded-full cursor-pointer origin-center transition-[box-shadow,background-color] duration-300 ease-[cubic-bezier(0.25,0.8,0.5,1)]',
    // Spinner wrapper: hidden by default, revealed by the --loading state class.
    // These utilities sit on a wrapper <span> (not the <c-spinner> element)
    // because the nested <c-spinner> host is `display:contents` (global host
    // sheet) — a 0x0 box on which `absolute`/`opacity`/`transform` are inert.
    // The span owns the box; the c-spinner inside renders its svg and inherits
    // `color` (currentColor) from the slider (see header).
    spinner:
      'block pointer-events-none z-2 absolute left-1 top-1 opacity-0 transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.5,1)]',
  },
  variants: {
    disabled: {
      false: {},
      true: {
        root: 'text-on-surface-muted',
        slider: 'cursor-default',
      },
    },
    hasLabel: {
      false: {},
      true: { root: 'grid-cols-[auto_auto]' },
    },
  },
});

interface CSwitchProps {
  /**
   * If `true`, the checkbox is selected.
   *
   * @seeded from csc-ui — verify
   */
  checked?: boolean;
  /**
   * If `true`, the switch is disabled and cannot be toggled
   */
  disabled?: boolean;
  /**
   * The value when the checkbox is unchecked
   *
   * @seeded from csc-ui — verify
   */
  falseValue?: boolean | number | string;
  /**
   * Id for the element
   *
   * @seeded from csc-ui — verify
   * @freeform
   */
  hostId?: string;
  /**
   * Loading state
   *
   * @seeded from csc-ui — verify
   */
  loading?: boolean;
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
   * The input value
   * - Only used when the checkbox participates in a native `<form>`
   *
   * @seeded from csc-ui — verify
   */
  value?: boolean | number | string;
}

const props = withDefaults(defineProps<CSwitchProps>(), {
  checked: false,
  disabled: false,
  falseValue: false,
  hostId: '',
  loading: false,
  required: false,
  trueValue: true,
  value: false,
});

const host = useHost();

const emit = useHostEmit<CSwitchEvents>();

const rootRef = useTemplateRef<HTMLElement>('rootRef');

const hasSlotContent = useHasSlot(rootRef, '');

const ui = computed(() =>
  cSwitch({
    disabled: props.disabled,
    hasLabel: hasSlotContent.value,
  }),
);

const autoId = useId();

const inputId = computed(() => props.hostId || `c-switch-${autoId}`);

const internalChecked = ref(props.checked || props.value === props.trueValue);

watch(
  () => props.checked,
  (c) => {
    internalChecked.value = c;
  },
);
watch(
  () => props.value,
  (v) => {
    internalChecked.value = v === props.trueValue;
  },
);

const toggle = () => {
  if (props.disabled) return;
  internalChecked.value = !internalChecked.value;

  const next = internalChecked.value ? props.trueValue : props.falseValue;
  // Emits changeValue/update:value + native `input` (for plain v-model) and
  // mirrors `value` onto the host. The value watch above is visuals-only, so no
  // loop. The native `change` is kept for @change listeners.
  emitModelValue(host, next);
  emit('change', undefined, { bubbles: true, composed: true });
};
</script>

<!--
  Escape-hatch CSS (ADR-0007): only constructs Tailwind utilities cannot
  express. Static track/handle geometry lives in the `tv` config above. What
  remains here:

  - `:host{display:inline-block}` — restores a box on the host (the global
    sheet sets `:host{display:contents}`). Targets the host, not a tv element.
  - The handle `::before` and all sibling-driven state: the OFF/ON/disabled
    track + border + handle COLOURS and the handle's `translateX` on
    `input:checked + .slider`, plus the focus-visible outline. These depend on
    the live `:checked`/`:focus-visible` of the sibling input, which tv
    variants cannot observe.
  - The slider's `color` carries the handle colour so the nested <c-spinner>
    (which reads `currentColor`) tracks the handle across states; the handle
    `::before` paints with `background:currentColor`. The loading state toggles
    spinner opacity and hides the handle.
  Geometry is kept in CSS vars so the handle size/position stay in one place.
  Tokens only (plus the spec'd transparent fallbacks).
-->
<style>
:host {
  display: inline-block;
}

.c-switch {
  --_c-switch-handle-margin: 5px;
  --_c-switch-height: 22px;
  --_c-switch-width: 44px;
  --_c-switch-handle-size: calc(
    var(--_c-switch-height) - 2 * var(--_c-switch-handle-margin)
  );
  --_c-switch-handle-position-active: calc(
    var(--_c-switch-width) - var(--_c-switch-handle-size) - 2 *
      var(--_c-switch-handle-margin)
  );
}

/* OFF state: track transparent, border tertiary-600, handle colour
 * tertiary-600 (carried via `color`, inherited by the handle + spinner). */
.c-switch__slider {
  color: var(--c-border-strong);
  background-color: transparent;
  box-shadow: inset 0 0 0 2px var(--c-border-strong);
}

.c-switch__slider::before {
  background-color: currentColor;
  border-radius: 50%;
  bottom: var(--_c-switch-handle-margin);
  content: '';
  height: var(--_c-switch-handle-size);
  left: var(--_c-switch-handle-margin);
  position: absolute;
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  width: var(--_c-switch-handle-size);
}

/* OFF + disabled: border transparent, handle tertiary-500. */
.c-switch__slider--disabled {
  color: var(--c-border-strong);
  background-color: var(--c-surface-muted);
  box-shadow: none;
}

/* Loading: hide the handle, reveal the spinner (it inherits the slider color). */
.c-switch__slider--loading::before {
  opacity: 0;
}

.c-switch__slider--loading .c-switch__spinner {
  opacity: 1;
}

/* ON state — sibling-driven. Track + border primary-600, handle white. */
input:checked + .c-switch__slider {
  color: var(--c-on-primary);
  background-color: var(--c-primary);
  box-shadow: inset 0 0 0 2px var(--c-primary);
}

input:checked + .c-switch__slider::before,
input:checked + .c-switch__slider .c-switch__spinner {
  transform: translateX(var(--_c-switch-handle-position-active));
}

/* ON + disabled. */
input:checked + .c-switch__slider--disabled {
  color: var(--c-surface);
  background-color: var(--c-border-strong);
  box-shadow: inset 0 0 0 2px var(--c-border-strong);
}

input:focus + .c-switch__slider {
  outline: none;
}

input:focus-visible + .c-switch__slider {
  outline: 2px var(--c-primary) solid;
  outline-offset: 2px;
}
</style>
