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
      <div
        v-if="!isMultiple"
        ref="indicatorRef"
        :class="ui.indicator()"
        aria-hidden="true"
        part="indicator"
      />

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
 * A group of buttons where activation carries a value — exclusive by
 * default, cumulative with `multiple` (ADR-0023). The standalone, form-facing
 * segmented control; for the tab strip of a `<c-tabs>` use `<c-tab-buttons>`,
 * which wraps this component.
 *
 * @slot default - Default slot for the c-button elements
 * @csspart root - The segmented-control box that frames the buttons and hosts the sliding indicator
 * @csspart indicator - The single sliding fill that highlights the active button (single-select mode only)
 * @csspart label - The group label rendered above the buttons
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

// We write to the slotted <c-button> children (props, data-index, inline
// `--_c-button-active-*` vars) below — keep fallthrough attrs on the host
// element rather than the inner `root` div, so consumer attributes/styles
// target the custom element as expected.
defineOptions({ inheritAttrs: false });

/**
 * Styling lives in this `tailwind-variants` config (ADR-0004): the inner
 * `root` div is the styled segmented-control box, customizable via
 * `::part(root)` (ADR-0006). The host stays `display:contents` (global).
 *
 * The frame and dividers are drawn entirely with the `root` background: the
 * padding shows it as the outer border and the grid gap shows it between
 * buttons. Children are plain `<c-button>`s slotted by the consumer; this
 * component imposes the transparent `text`/`no-ripple`/`fit` appearance and
 * drives each button's public `active` prop. In single-select mode the solid
 * fill is the single sliding `indicator` and the buttons' own active fill is
 * retargeted to transparent through the `--_c-button-active-*` vars (they
 * inherit across the shadow boundary); in `multiple` mode the indicator is
 * not rendered and each active button paints its own fill (ADR-0023).
 */
// Hoisted so the runtime guard below can test membership; the `satisfies`
// keeps the map complete against the public union (ADR-0015).
const sizeVariants = {
  default: {
    indicator: 'top-1 bottom-1',
    root: 'p-1 gap-1',
  },
  small: {
    indicator: 'top-0.5 bottom-0.5',
    root: 'p-0.5 gap-0.5',
  },
} satisfies Record<CButtonGroupSize, object>;

const buttonGroup = tv({
  defaultVariants: {
    disabled: false,
  },
  slots: {
    // The single sliding active fill (single-select mode). JS sets width +
    // translateX to the active button's measured box; `top-1 bottom-1`
    // matches the root's `p-1` so it covers the button vertically. Radius
    // matches c-button's `rounded-csc-md`.
    indicator:
      'pointer-events-none absolute left-0 -z-10 w-0 origin-left rounded-csc-md bg-primary opacity-0 transition-[transform,width,opacity] duration-300 ease-out',
    label: 'text-left',
    // `relative isolate` so the `-z-10` indicator is contained in this box's
    // stacking context and paints above the root background but below the
    // (transparent) buttons.
    //
    // A real GRID with equal `auto-cols-fr` columns — not flex: each slotted
    // c-button host is `display:contents`, so the native button it wraps is
    // promoted into this grid and sized by the *track*. In a shrink-to-fit
    // context (e.g. a flex row) fr tracks all size to the longest label;
    // flex + w-full instead squeezed every button to an equal share smaller
    // than that, and the nowrap content overflowed the fill's right edge —
    // visibly unbalanced horizontal padding on active buttons. The absolute
    // indicator is out of flow and creates no track.
    root: 'relative isolate grid grid-flow-col auto-cols-fr rounded-csc-lg bg-surface-sunken',
    // Stacks the group label above the segmented-control frame.
    wrapper: 'flex flex-col gap-1',
  },
  variants: {
    disabled: {
      true: {
        indicator: 'bg-border-strong',
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
// the default size (ADR-0015).
const ui = computed(() =>
  buttonGroup({
    disabled: coerceBoolean(props.disabled),
    size: props.size in sizeVariants ? props.size : 'default',
  }),
);

const rootRef = useTemplateRef<HTMLElement>('rootRef');

const indicatorRef = useTemplateRef<HTMLElement>('indicatorRef');

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
// for roving focus and for measuring the exact box the indicator must cover
// (the c-button host itself is display:contents and has no box).
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

/* --- indicator geometry (single-select mode) --- */

// Slide the single active-fill indicator over the currently-active button.
// `animate=false` (initial mount, resize) snaps without a transition so the
// pill doesn't fly in from the left.
const moveIndicator = (animate = true) => {
  const root = rootRef.value;

  const ind = indicatorRef.value;

  if (!root || !ind) return;

  const active = buttons().find((b) => b.hasAttribute('active'));

  if (!active) {
    ind.style.opacity = '0';

    return;
  }

  const box =
    nativeControlOf(active)?.getBoundingClientRect() ??
    active.getBoundingClientRect();

  if (!box || box.width === 0) return;

  const rootBox = root.getBoundingClientRect();

  // A hidden indicator (no prior selection) must snap to its first position,
  // not animate from left-0/width-0.
  const wasHidden = ind.style.opacity === '' || ind.style.opacity === '0';

  const snap = !animate || wasHidden;

  if (snap) ind.style.transition = 'none';
  ind.style.width = `${box.width}px`;
  ind.style.transform = `translateX(${box.left - rootBox.left}px)`;
  ind.style.opacity = '1';

  if (snap) {
    // Force a reflow so the snapped geometry commits before transitions resume.
    void ind.offsetWidth;
    ind.style.transition = '';
  }
};

// Re-snap the indicator (no animation) whenever geometry changes that the
// `props.value` watch can't see: the viewport resizing, the panel that holds
// us expanding from display:none, fonts loading, or a sibling button
// appearing — which reflows the equal-width columns and shrinks the active
// button.
//
// We observe the root AND each button's native control box: when a sibling
// appears the root width is unchanged (it's the full container), only the
// per-button column width shifts, so a root-only observer would miss it.
let resizeObserver: null | ResizeObserver = null;

const observeGeometry = () => {
  if (!resizeObserver) return;
  resizeObserver.disconnect();

  if (rootRef.value) resizeObserver.observe(rootRef.value);
  buttons().forEach((b) => {
    const ctrl = nativeControlOf(b);

    if (ctrl) resizeObserver!.observe(ctrl);
  });
};

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

// Reflect the selection by flipping each button's public `active` prop (the
// buttons stay transparent in single-select mode; the solid fill is the
// sliding indicator). Touch both prop and attribute on every iteration
// because Vue defineCustomElement reflects Boolean prop changes back to the
// attribute; the empty attribute also drives consumers' `c-button[active]`
// selectors.
const applyActive = (value: CButtonGroupValue) => {
  buttons().forEach((b) => {
    const isActive = !b.disabled && isSelected(value, b);
    b.active = isActive;

    if (isActive) b.setAttribute('active', '');
    else b.removeAttribute('active');
  });
  applyTabbable();
  // Animate the indicator to the new selection (after the attribute change
  // has flipped the buttons' transparent/text state and layout is current).
  requestAnimationFrame(() => moveIndicator(true));
};

// Impose the group appearance and wiring on every slotted button. Runs on
// mount and on every slotchange (late-appearing buttons).
const setupButtons = () => {
  const btns = buttons();
  isIndexBased = btns.every((b) => typeof b.value === 'undefined');

  btns.forEach((button, index) => {
    button.setAttribute('data-index', String(index));
    // The group owns the buttons' appearance: transparent text variant on the
    // sunken track, no per-button ripple (the moving fill is the feedback),
    // equal-width columns via `fit`.
    button.text = true;
    button.noRipple = true;
    button.fit = true;
    button.size = props.size in sizeVariants ? props.size : 'default';

    if (coerceBoolean(props.disabled)) button.disabled = true;

    // Retarget c-button's own active fill per selection mode: in single-select
    // the sliding indicator paints the fill, so the button keeps only its
    // text flip (the vars inherit across the shadow boundary); in `multiple`
    // the button's own active look stands.
    const vars = [
      '--_c-button-active-bg',
      '--_c-button-active-hover-bg',
      '--_c-button-active-fg',
    ] as const;

    if (isMultiple.value) {
      vars.forEach((v) => button.style.removeProperty(v));
    } else {
      button.style.setProperty('--_c-button-active-bg', 'transparent');
      button.style.setProperty('--_c-button-active-hover-bg', 'transparent');
      button.style.setProperty('--_c-button-active-fg', 'var(--c-on-primary)');
    }
  });

  applyActive(internalValue.value);
  observeGeometry();
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

  resizeObserver = new ResizeObserver(() => moveIndicator(false));

  // Late-appearing buttons (v-if'd/async children) re-run the driving pass.
  slotEl()?.addEventListener('slotchange', () => setupButtons());

  // Place the indicator under the initial selection without animating it in.
  // Double rAF so the buttons' shadow roots have laid out and report real
  // boxes before we measure.
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      setupButtons();
      moveIndicator(false);
    }),
  );
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
});
</script>
