<template>
  <div
    :aria-labelledby="label ? labelId : undefined"
    :class="ui.wrapper()"
    :role="label ? 'group' : undefined"
  >
    <form-label
      v-if="label"
      :class="ui.label()"
      :label
      :label-id
      :required
      part="label"
    />

    <div ref="rootRef" :class="ui.root()" part="root">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
export interface CButtonGroupProps {
  /** Disable the whole group — every slotted c-button is disabled and the selection can no longer be changed. */
  disabled?: boolean;
  /**
   * Label of the button group, shown above the buttons
   *
   * @freeform
   */
  label?: string;
  /**
   * The selection can never become empty: the active button (or, with
   * `multiple`, the last active button) cannot be toggled off. Distinct from
   * `required`: mandatory is a selection-behavior rule on the control, not a
   * form-level demand for an answer.
   */
  mandatory?: boolean;
  /**
   * Allow several buttons to be active at once. The value becomes an array
   * of the active buttons' values (in DOM order). Arrays have no attribute
   * form — bind `value` as a DOM property (`:value.prop` in Vue).
   */
  multiple?: boolean;
  /**
   * Set as required — shows the required marker on the label
   */
  required?: boolean;
  /**
   * Size of the buttons
   */
  size?: CButtonGroupSize;
  /**
   * Value of the group: the active button's `value` (or its index when no
   * button declares one). `null` when nothing is selected. With `multiple`,
   * an array of the active buttons' values.
   */
  value?: CButtonGroupValue;
}

/**
 * Size of the button group. `small` renders a more compact control; the size
 * is also propagated to every slotted `<c-button>`. Omitting the attribute
 * renders the default size.
 */
export type CButtonGroupSize = 'default' | 'small';

/**
 * Selection value of the group: a single button value (or index) — `null`
 * when nothing is selected — or, in `multiple` mode, an array of them.
 */
export type CButtonGroupValue = (number | string)[] | null | number | string;
</script>

<script setup lang="ts">
/**
 * @slot default - Default slot for the c-button elements
 * @csspart root - The track: the framed segmented-control box the buttons sit in
 * @csspart label - The group label rendered above the buttons
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

import { coerceBoolean } from '../../shared/coerceBoolean';
import { emitModelChange } from '../../shared/emitModelValue';
import FormLabel from '../../shared/FormLabel.vue';

/** Events dispatched by `<c-button-group>`. */
interface CButtonGroupEvents {
  /**
   * Fired when the user changes the selection, carrying the new value:
   * the activated button's value (or index), `null` when the active button
   * is toggled off, or the array of active values in `multiple` mode.
   */
  change: CButtonGroupValue;
  /** Native bubbling input event dispatched for plain `v-model` support; carries no detail. */
  input: void;
  /**
   * Fired alongside `change` with the new selection; fulfills the `v-model`
   * contract.
   */
  'update:value': CButtonGroupValue;
}

// We write to the slotted <c-button> children (props, data-index) below —
// keep fallthrough attrs on the host element rather than the inner `root`
// div, so consumer attributes/styles target the custom element as expected.
defineOptions({ inheritAttrs: false });

/**
 * Styling lives in this `tailwind-variants` config: the inner `root` div is
 * the track — the framed segmented-control box the buttons sit in,
 * customizable via `::part(root)`. The host stays `display:contents` (global).
 *
 * The track is an opaque fill plus a load-bearing hairline (ADR-0042). The
 * fill stays opaque on purpose: the unselected labels are `primary` text
 * sitting directly on it, and an opaque fill keeps their ground constant
 * (AA on every surface) wherever the control is placed; the padding and the
 * grid gap show the fill around an active button's own fill. The fill alone
 * is invisible on nearby surface rungs (it *is* the `c-main` canvas colour),
 * so the boundary is a 1px `divider` border clipped out of the background
 * (padding-box clip) — the translucent ink composites over the parent, not
 * the fill, which is what makes it read on every rung in both modes.
 * Children are plain `<c-button>`s slotted by the consumer; this component
 * imposes the transparent `text`/`no-ripple`/`fit` appearance and drives
 * each button's public `active` prop. Every active button paints its own
 * active fill — the sliding indicator is a tab-strip affordance and belongs
 * to `c-tab-buttons`, never to this component.
 */
// Hoisted so the runtime guard below can test membership; the `satisfies`
// keeps the map complete against the public union.
const sizeVariants = {
  default: {
    // 1px hairline + 3px padding + 36px buttons = 44px, the same height as a
    // c-text-field field, so a group sits level beside one (the hairline
    // replaces 1px of the former 4px padding). The button height is driven
    // through c-button's internal `--_c-button-min-height` hook, inherited
    // by the slotted buttons from this frame.
    root: 'p-0.75 gap-1 [--_c-button-min-height:2.25rem]',
  },
  small: {
    // 1px hairline + 1px padding: the former 2px frame.
    root: 'p-0.25 gap-0.5',
  },
} satisfies Record<CButtonGroupSize, object>;

const buttonGroup = tv({
  defaultVariants: {
    disabled: false,
  },
  slots: {
    label: 'text-left',
    // A real GRID with equal `auto-cols-fr` columns — not flex: each slotted
    // c-button host is `display:contents`, so the native button it wraps is
    // promoted into this grid and sized by the *track*. In a shrink-to-fit
    // context (e.g. a flex row) fr tracks all size to the longest label;
    // flex + w-full instead squeezed every button to an equal share smaller
    // than that, and the nowrap content overflowed the fill's right edge —
    // visibly unbalanced horizontal padding on active buttons.
    root: 'grid grid-flow-col auto-cols-fr rounded-csc-lg border border-solid border-divider bg-clip-padding bg-surface-sunken',
    // Stacks the group label above the segmented-control frame.
    wrapper: 'flex flex-col gap-1',
  },
  variants: {
    disabled: {
      true: {
        root: 'bg-surface-muted pointer-events-none',
      },
    },
    size: sizeVariants,
  },
});

const props = withDefaults(defineProps<CButtonGroupProps>(), {
  disabled: false,
  label: '',
  mandatory: false,
  multiple: false,
  required: false,
  size: 'default',
  value: null,
});

const host = useHost();

const autoId = useId();

const labelId = `${autoId}-label`;

const isMultiple = computed(() => coerceBoolean(props.multiple));

// Attributes can deliver any string at runtime; unknown values fall back to
// the default size.
const ui = computed(() =>
  buttonGroup({
    disabled: coerceBoolean(props.disabled),
    size: props.size in sizeVariants ? props.size : 'default',
  }),
);

const rootRef = useTemplateRef<HTMLElement>('rootRef');

// The native slot outlet inside `root` (attributes on Vue's `<slot>` element
// are slot props, so the element itself is looked up from the DOM instead).
const slotEl = (): HTMLSlotElement | null =>
  rootRef.value?.querySelector('slot') ?? null;

// Internal value mirror. `props.value` is read-only inside the component and
// is only updated by the parent asynchronously (after the native `input`
// round trip), so click logic that needs the *just-selected* value
// synchronously (e.g. the deselect toggle) must read this mirror, not
// `props.value`. We also push the committed value onto the host's own `value`
// property (see `commitValue`) so native v-model can read it; that write
// re-enters the `props.value` watch, which keeps this mirror in sync.
const internalValue = ref<CButtonGroupValue>(props.value ?? null);

let isIndexBased = false;

let focusedValue: number | string | undefined;

type CButtonEl = {
  active?: boolean;
  disabled?: boolean;
  fit?: boolean;
  noRipple?: boolean;
  size?: string;
  text?: boolean;
  value?: number | string;
} & HTMLElement;

// Children are discovered through the slot's assigned elements, NOT a
// `:scope > c-button` query: when this component is composed inside
// c-tab-buttons' shadow root the consumer's buttons stay light-DOM children
// of <c-tab-buttons> and reach us only through slot forwarding —
// `{ flatten: true }` follows that chain.
const buttons = (): CButtonEl[] =>
  (slotEl()?.assignedElements({ flatten: true }) ?? []).filter(
    (el): el is CButtonEl => el.tagName === 'C-BUTTON',
  );

// The focusable native control lives in the slotted c-button's shadow — used
// for roving focus (the c-button host itself is display:contents and has no
// box).
const nativeControlOf = (btn: CButtonEl): HTMLElement | null =>
  (btn.shadowRoot?.querySelector('button, a') as HTMLElement | null) ?? null;

// The value a button contributes to the group: its `value` prop, else its
// DOM index (index-based mode, when no button declares a value).
const valueOf = (btn: CButtonEl): number | string =>
  isIndexBased ? +(btn.dataset.index ?? 0) : (btn.value as number | string);

const valuesEqual = (a: number | string, b: number | string): boolean =>
  isIndexBased ? +a === +b : a === b;

const selectedValues = (value: CButtonGroupValue): (number | string)[] => {
  if (value === null || value === undefined || value === '') return [];

  return Array.isArray(value) ? value : [value];
};

const isSelected = (value: CButtonGroupValue, btn: CButtonEl): boolean =>
  selectedValues(value).some((v) => valuesEqual(v, valueOf(btn)));

/* --- child driving --- */

// Roving tabindex (single-select): only the active button — or the first
// enabled one when nothing is selected — sits in the tab order; arrow keys
// focus the rest. In `multiple` mode every button is an independent toggle
// and stays naturally tabbable.
const applyTabbable = () => {
  const btns = buttons();

  const activeBtn = btns.find((b) => b.hasAttribute('active'));

  const firstEnabled = btns.find((b) => !b.disabled);

  btns.forEach((b) => {
    const ctrl = nativeControlOf(b);

    if (!ctrl) return;
    ctrl.tabIndex =
      isMultiple.value || b === (activeBtn ?? firstEnabled) ? 0 : -1;
  });
};

// Reflect the selection by flipping each button's public `active` prop —
// every active button paints its own active fill. Touch both prop and
// attribute on every iteration because Vue defineCustomElement reflects
// Boolean prop changes back to the attribute; the empty attribute also
// drives consumers' `c-button[active]` selectors.
const applyActive = (value: CButtonGroupValue) => {
  buttons().forEach((b) => {
    const isActive = !b.disabled && isSelected(value, b);
    b.active = isActive;

    if (isActive) b.setAttribute('active', '');
    else b.removeAttribute('active');
  });
  applyTabbable();
};

// Impose the group appearance and wiring on every slotted button. Runs on
// mount and on every slotchange (late-appearing buttons).
const setupButtons = () => {
  const btns = buttons();
  isIndexBased = btns.every((b) => typeof b.value === 'undefined');

  btns.forEach((button, index) => {
    button.setAttribute('data-index', String(index));
    // The group owns the buttons' appearance: transparent text variant on the
    // sunken track (the active fill is each button's own), no per-button
    // ripple, equal-width columns via `fit`.
    button.text = true;
    button.noRipple = true;
    button.fit = true;
    button.size = props.size in sizeVariants ? props.size : 'default';

    if (coerceBoolean(props.disabled)) button.disabled = true;
  });

  applyActive(internalValue.value);
};

/* --- selection --- */

// Commit a user-driven selection: update the internal mirror and visuals
// immediately, then hand off to emitModelChange (host `value` mirror +
// `change`/`update:value`/native `input`, the new-style triple — this
// component has no grandfathered `changeValue`). Emission lives here — on
// interaction only — never in the `props.value` watch, so parent/programmatic
// value changes don't echo back as events (which would loop with v-model).
const commitValue = (resolved: CButtonGroupEvents['change']) => {
  internalValue.value = resolved;
  applyActive(resolved);
  emitModelChange(host, resolved);
};

const onActivate = (btn: CButtonEl) => {
  const btnValue = valueOf(btn);

  if (isMultiple.value) {
    const current = selectedValues(internalValue.value);

    const isActive = current.some((v) => valuesEqual(v, btnValue));

    if (isActive && coerceBoolean(props.mandatory) && current.length <= 1) {
      return;
    }

    const next = isActive
      ? current.filter((v) => !valuesEqual(v, btnValue))
      : [...current, btnValue];

    // Normalize to DOM order so the emitted array is stable regardless of
    // click order.
    const ordered = buttons()
      .map((b) => valueOf(b))
      .filter((v) => next.some((n) => valuesEqual(n, v)));
    commitValue(ordered);

    return;
  }

  const current = internalValue.value;

  const isActive =
    !Array.isArray(current) &&
    current !== null &&
    current !== undefined &&
    valuesEqual(current, btnValue);

  if (coerceBoolean(props.mandatory) && isActive) return;
  commitValue(isActive ? null : btnValue);
};

// Visuals-only: fires when the parent (or our own `commitValue` host-property
// write) changes the value. Re-sync the mirror and active buttons; never emit
// here.
watch(
  () => props.value,
  (value) => {
    internalValue.value = value ?? null;
    applyActive(internalValue.value);
  },
);

// Mode/size/disabled changes re-drive the slotted buttons.
watch(
  () => [props.multiple, props.size, props.disabled],
  () => setupButtons(),
);

onMounted(() => {
  if (!host) return;

  // Selection on click. The slotted buttons' click events bubble through the
  // host; resolve which button was pressed from the composed path (a disabled
  // c-button stops propagation itself, so no guard is needed here).
  host.addEventListener('click', (e) => {
    const btns = buttons();

    const btn = e
      .composedPath()
      .find((n): n is CButtonEl => btns.includes(n as CButtonEl));

    if (!btn || btn.disabled) return;
    onActivate(btn);
  });

  // Track the focused button for arrow-key navigation (focusin is composed,
  // so it bubbles out of the buttons' shadow roots).
  host.addEventListener('focusin', (e) => {
    const btns = buttons();

    const btn = e
      .composedPath()
      .find((n): n is CButtonEl => btns.includes(n as CButtonEl));

    if (btn) focusedValue = valueOf(btn);
  });

  // Arrow-key navigation between buttons.
  host.addEventListener(
    'keyup',
    (e) => {
      const ev = e as KeyboardEvent;

      const isLeft = ev.key === 'ArrowLeft';

      const isRight = ev.key === 'ArrowRight';

      if (!isLeft && !isRight) return;
      ev.stopPropagation();

      const btns = buttons();

      if (!btns.length) return;

      const values = btns.map((b) => valueOf(b));

      const index =
        focusedValue === undefined
          ? 0
          : values.findIndex((v) => valuesEqual(v, focusedValue!));

      const nextIndex = isLeft
        ? (index - 1 + values.length) % values.length
        : (index + 1) % values.length;

      const target = btns[nextIndex];
      requestAnimationFrame(() => nativeControlOf(target)?.focus());
    },
    true,
  );

  // Late-appearing buttons (v-if'd/async children) re-run the driving pass.
  slotEl()?.addEventListener('slotchange', () => setupButtons());

  // Drive the initial selection. Double rAF so the slotted buttons' shadow
  // roots exist before we reach into them for the roving tabindex.
  requestAnimationFrame(() => requestAnimationFrame(() => setupButtons()));
});
</script>
