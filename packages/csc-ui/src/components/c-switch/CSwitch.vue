<template>
  <label
    ref="rootRef"
    v-bind="rootAttrs"
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
        v-bind="controlAttrs"
        :aria-busy="loading ? 'true' : undefined"
        :aria-checked="internalChecked"
        :aria-disabled="loading ? 'true' : undefined"
        :aria-required="required || undefined"
        :checked="internalChecked || undefined"
        :class="ui.input()"
        :disabled
        role="switch"
        type="checkbox"
        @change="toggle"
        @click="onClick"
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

    <form-label
      v-show="!!label || hasSlotContent"
      :class="ui.label()"
      :label
      :required
      part="label"
      tag="div"
    >
      <slot />
    </form-label>
  </label>
</template>

<script setup lang="ts">
/**
 * @slot default - The visible label of the switch (fallback when the `label` prop is not set)
 *
 * @csspart root - The `<label>` element wrapping the toggle and the label text
 * @csspart slider - The toggle track (its `::before` pseudo-element is the handle)
 * @csspart label - Wrapper around the label text or slotted label content
 *
 * @cssstate checked - Present while the switch is on
 */
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
import { useControlAttrs } from '../../shared/useControlAttrs';
import { useHasSlot } from '../../shared/useHasSlot';
import { useHostStates } from '../../shared/useHostStates';
import { useIdReferences } from '../../shared/useIdReferences';
import { emitModelChange } from '../../shared/valueEvents';

// ARIA attributes on the element name and describe the native control;
// every other attribute stays on the root, as Vue's fallthrough put it.
defineOptions({ inheritAttrs: false });

const { controlAttrs, rootAttrs } = useControlAttrs();

/** Events dispatched by `<c-switch>`. */
interface CSwitchEvents {
  /**
   * Fired when the user toggles the switch, carrying the new value —
   * `trueValue` when on, `falseValue` when off.
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
 * `--_c-switch-*` indirection layer is dropped. Customization is via
 * `::part()`; there is no `override` prop.
 *
 * The track (`slider`) and the round handle (`slider::before`) make up the
 * toggle. The handle's ON position (`translateX`) and the ON/OFF/disabled
 * COLOURS are sibling-driven (`input:checked + .slider …`) — they depend on
 * the live `:checked`/`:focus-visible` of the sibling input, which `tv`
 * variants cannot observe — so they remain in the escape-hatch `<style>`
 * below. The static track/handle geometry lives here in `tv`.
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
    input: 'absolute h-0 w-0 opacity-0',
    inputWrap: 'relative h-5.5 w-11 self-start',
    label: 'self-center',
    // Track geometry: 22x44, pill radius, gap to label. The on/off colours and
    // handle position are sibling-driven in the escape-hatch below.
    root: 'relative inline-grid h-5.5 transform-gpu items-center gap-3 [backface-visibility:hidden]',
    // The track. Border drawn as an inset ring; colours flipped on state in
    // escape-hatch. Handle is the `::before` (also escape-hatch, sibling-driven
    // for its translate). The slider's `color` (set in escape-hatch) is what
    // the nested c-spinner inherits via `currentColor`.
    slider:
      'absolute inset-0 origin-center cursor-pointer rounded-full transition-[box-shadow,background-color] duration-300 ease-[cubic-bezier(0.25,0.8,0.5,1)]',
    // Spinner wrapper: hidden by default, revealed by the --loading state class.
    // These utilities sit on a wrapper <span> (not the <c-spinner> element)
    // because the nested <c-spinner> host is `display:contents` (global host
    // sheet) — a 0x0 box on which `absolute`/`opacity`/`transform` are inert.
    // The span owns the box; the c-spinner inside renders its svg and inherits
    // `color` (currentColor) from the slider (see header).
    spinner:
      'pointer-events-none absolute top-1 left-1 z-2 block opacity-0 transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.5,1)]',
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
   * Whether the switch is on: the boolean view of `value`. Setting it sets
   * `value` to `trueValue` or `falseValue`; reading it reports whether
   * `value` equals `trueValue`. As an attribute it sets the initial state when
   * no `value` is bound.
   */
  checked?: boolean;

  /**
   * If `true`, the switch is disabled and cannot be toggled
   */
  disabled?: boolean;

  /**
   * The value when the switch is off
   */
  falseValue?: boolean | number | string;

  /**
   * Label of the switch, shown beside the toggle. Falls back to the default
   * slot content when not set.
   *
   * @freeform
   */
  label?: string;

  /**
   * Show a spinner in place of the handle, such as while the change is
   * saved. The switch ignores toggles meanwhile and is announced as busy
   */
  loading?: boolean;

  /**
   * Set as required — shows the required marker on the label
   */
  required?: boolean;

  /**
   * The value when the switch is on
   */
  trueValue?: boolean | number | string;

  /**
   * The switch's state: `trueValue` while it is on, `falseValue` while it is
   * off. A bound value wins over a `checked` attribute; any other value,
   * `''` included, reads as off.
   */
  // Not sorted: Vue reads `''` as `true` for a prop whose runtime types list
  // Boolean before String, and `''` is what a plain Vue `v-model` writes for
  // an empty model.
  // oxlint-disable-next-line perfectionist/sort-union-types
  value?: string | number | boolean;
}

const props = withDefaults(defineProps<CSwitchProps>(), {
  checked: false,
  disabled: false,
  falseValue: false,
  label: '',
  loading: false,
  required: false,
  trueValue: true,
  value: undefined,
});

const host = useHost();

const rootRef = useTemplateRef<HTMLElement>('rootRef');

const hasSlotContent = useHasSlot(rootRef, '');

const ui = computed(() =>
  cSwitch({
    disabled: props.disabled,
    hasLabel: Boolean(props.label) || hasSlotContent.value,
  }),
);

const autoId = useId();

const inputId = computed(() => `c-switch-${autoId}`);

// One state, two views (decisions #34): `value` is the state, `checked` its
// boolean view. A bound `value` wins; without one, `checked` seeds. Setting
// either view updates the other on the host, without a value event — only a
// toggle emits.
type SwitchStateHost = {
  checked?: boolean;
  value?: CSwitchProps['value'];
} & HTMLElement;

const isOn = (v: unknown) => v === props.trueValue;

const internalChecked = ref(
  props.value === undefined ? props.checked : isOn(props.value),
);

// Republish the on/off state as a host custom state so consumers can write
// per-state ::part() rules: c-switch:state(checked)::part(slider).
const setState = useHostStates();

watch(internalChecked, (on) => setState('checked', on), { immediate: true });

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

    const state = host as SwitchStateHost;

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

// While loading the switch stays put, as a loading button swallows clicks:
// cancelling the click keeps the native checkbox from flipping at all.
const onClick = (event: MouseEvent) => {
  if (props.loading) event.preventDefault();
};

const toggle = () => {
  if (props.disabled) return;
  internalChecked.value = !internalChecked.value;

  const next = internalChecked.value ? props.trueValue : props.falseValue;
  // A toggle is its own commit. The value watch above is visuals-only, so the
  // host `value` mirror doesn't loop.
  emitModelChange(host, next satisfies CSwitchEvents['change']);
};

// The page's id references on the element reach the element carrying its role.
useIdReferences('input');
</script>

<!--
  Escape-hatch CSS: only constructs Tailwind utilities cannot
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
