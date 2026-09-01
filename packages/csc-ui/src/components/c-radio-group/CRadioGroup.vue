<template>
  <div
    ref="rootRef"
    :aria-labelledby="labelVisible ? labelId : undefined"
    :aria-required="isRequired || undefined"
    :class="ui.root()"
    part="root"
    role="radiogroup"
  >
    <form-label
      v-show="labelVisible"
      :class="ui.label()"
      :label
      :label-id
      :required="isRequired"
      part="label"
    >
      <slot name="label" />
    </form-label>

    <div :class="ui.items()" part="items">
      <slot />
    </div>

    <field-message :error-message :hide-details :hint :valid part="message" />
  </div>
</template>

<script setup lang="ts">
/**
 * @slot default - The radios' home: `<c-radio>` children, wrappable in arbitrary layout elements at any depth
 * @slot label - Group label content, used when the `label` prop is not set
 *
 * @csspart root - The radiogroup wrapper element
 * @csspart label - The group label above the radio buttons
 * @csspart items - The container the radios are slotted into
 * @csspart message - The hint/error message area below the radios (always reserved unless `hide-details`)
 *
 * @subcomponents c-radio
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
import { emitModelValue } from '../../shared/emitModelValue';
import FieldMessage from '../../shared/FieldMessage.vue';
import FormLabel from '../../shared/FormLabel.vue';
import { useHasSlot } from '../../shared/useHasSlot';

/** Events dispatched by `<c-radio-group>`. */
interface CRadioGroupEvents {
  /**
   * Fired when a radio is selected, carrying the selected radio's value.
   */
  changeValue: string;
  /**
   * Native bubbling input event fired on selection so a plain Vue `v-model`
   * works without the `v-control` directive. No detail.
   */
  input: void;
  /**
   * v-model contract event fired on selection, carrying the selected radio's
   * value.
   */
  'update:value': string;
}

/**
 * Styling lives in this `tailwind-variants` config; the radios themselves are
 * slotted `<c-radio>` elements that carry their own styling — the group only
 * lays them out (`items`) and recolours them across the shadow boundary via
 * the inherited `--_c-radio-color` custom property (error/disabled), which
 * each radio's ring/dot/focus ring resolves with a primary-role fallback.
 * Customization is via `::part()`; there is no `override` prop.
 *
 * `inline`, `disabled`, and error (`!valid`) map to props, so the layout and
 * colour changes they drive are `tv` variants/compoundVariants here. The
 * dimming of individual radios is each radio's own concern (driven by its
 * input's live `:disabled`, which `syncRadios` sets for group-level
 * disabling) — the group deliberately adds no opacity of its own on top.
 */
const radioGroup = tv({
  compoundVariants: [
    {
      class: {
        items: 'text-error [--_c-radio-color:var(--c-error)]',
      },
      disabled: false,
      error: true,
    },
  ],
  defaultVariants: {
    disabled: false,
    error: false,
    inline: false,
  },
  slots: {
    items: 'flex flex-wrap',
    label: 'text-left',
    root: 'flex flex-col gap-1 w-fit',
  },
  variants: {
    disabled: {
      false: {},
      true: {
        items:
          'text-on-surface-muted [--_c-radio-color:var(--c-on-surface-muted)]',
        root: 'text-on-surface-muted cursor-default',
      },
    },
    error: {
      false: {},
      true: {},
    },
    inline: {
      false: { items: 'flex-col gap-0.5' },
      // Column layout: items stack with a 2px gap. Inline: row with 12px gap.
      true: { items: 'flex-row gap-3' },
    },
  },
});

interface CRadioGroupProps {
  /**
   * Disable the radio group
   */
  disabled?: boolean;
  /**
   * Error message shown in place of the hint while the group is invalid
   *
   * @freeform
   */
  errorMessage?: string;
  /**
   * Hide the hint and error messages
   */
  hideDetails?: boolean;
  /**
   * Hint text for the input
   *
   * @freeform
   */
  hint?: string;
  /**
   * Display radio buttons inline
   */
  inline?: boolean;
  /**
   * Label of the radio group
   *
   * @freeform
   */
  label?: string;
  /**
   * Set as required
   */
  required?: boolean;
  /**
   * Set the validity of the input
   */
  valid?: boolean;
  /**
   * Value of the radio group; matched against each radio's `value` by strict
   * string equality
   */
  value?: null | string;
}

const props = withDefaults(defineProps<CRadioGroupProps>(), {
  disabled: false,
  errorMessage: '',
  hideDetails: false,
  hint: '',
  inline: false,
  label: '',
  required: false,
  valid: true,
  value: null,
});

// Boolean attribute presence can reach a declared Boolean prop as the raw
// string "" (falsy) — coerce before any conditional logic or tv lookup.
const isGroupDisabled = computed(() => coerceBoolean(props.disabled));

const isRequired = computed(() => coerceBoolean(props.required));

const ui = computed(() =>
  radioGroup({
    disabled: isGroupDisabled.value,
    error: !coerceBoolean(props.valid),
    inline: coerceBoolean(props.inline),
  }),
);

const host = useHost();

const rootRef = useTemplateRef<HTMLElement>('rootRef');

// Group-label slot fallback. The FormLabel is v-show'n — not v-if'd — so the
// label <slot> always exists and slot detection isn't circular with the
// label's own visibility (c-otp-input precedent).
const hasLabelSlot = useHasSlot(rootRef, 'label');

const labelVisible = computed(() => Boolean(props.label) || hasLabelSlot.value);

const autoId = useId();

const labelId = `${autoId}-label`;

// Internal value mirror: `props.value` is only updated by the parent
// asynchronously (after the native `input` round trip), so the sync pass
// reads this mirror. Selection is matched by strict string equality.
const internalValue = ref<null | string>(
  props.value == null ? null : String(props.value),
);

type CRadioEl = {
  _syncGroupState?: (state: {
    checked: boolean;
    disabled: boolean;
    tabIndex: number;
  }) => void;
  disabled?: boolean;
  value?: string;
} & HTMLElement;

// Slotted radios at ANY depth — consumers may wrap <c-radio> in arbitrary
// layout elements — in document order, scoped to this group so nested groups
// each own only their descendants. Read as live elements: `value`/`disabled`
// are DOM properties (the React wrapper sets properties, never attributes).
const radios = (): CRadioEl[] =>
  host
    ? (Array.from(host.querySelectorAll('c-radio')) as CRadioEl[]).filter(
        (r) => r.closest('c-radio-group') === host,
      )
    : [];

// The focusable native control lives in the slotted c-radio's shadow root —
// native radio `name` grouping never crosses shadow boundaries, so checked
// state, disabling and the roving tabindex are all coordinated here. State
// writes go through the radio's internal `_syncGroupState` hook (so the radio
// also mirrors them onto its host custom states, ADR-0035); direct input
// access remains only for focus/click interaction plumbing.
const inputOf = (r: CRadioEl): HTMLInputElement | null =>
  r.shadowRoot?.querySelector('input') ?? null;

const isSelected = (r: CRadioEl): boolean =>
  internalValue.value !== null && String(r.value ?? '') === internalValue.value;

const isEnabled = (r: CRadioEl): boolean =>
  !isGroupDisabled.value && !coerceBoolean(r.disabled);

// Drive the slotted radios: exclusivity (checked), combined group/per-radio
// disabling, and the WAI-ARIA roving tabindex — the checked radio is the
// group's single tab stop, else the first enabled one. NEVER emits: model
// events fire only from user interaction (the host `change` listener below).
const syncRadios = () => {
  const rs = radios();

  const tabStop =
    rs.find((r) => isSelected(r) && isEnabled(r)) ?? rs.find(isEnabled);

  for (const r of rs) {
    // Pre-upgrade child not mounted yet (no exposed hook); the mount
    // double-rAF or the MutationObserver re-runs this pass once it exists.
    r._syncGroupState?.({
      checked: isSelected(r),
      disabled: !isEnabled(r),
      tabIndex: r === tabStop ? 0 : -1,
    });
  }
};

// Commit a user-driven selection arriving as a slotted radio's composed
// bubbling `change` (a light-DOM event never enters this shadow root, so the
// listener sits on the host — c-accordion precedent). Emits the grandfathered
// changeValue/update:value + native `input` triple and mirrors host `value`.
const onRadioChange = (event: Event) => {
  const target = event.target as CRadioEl;

  if (!radios().includes(target)) return;

  const next = String((event as CustomEvent<string>).detail ?? '');
  internalValue.value = next;
  emitModelValue(host, next);
  syncRadios();
};

// WAI-ARIA radio group keyboard pattern: arrows move focus AND select,
// wrapping and skipping disabled radios. Selection goes through the target
// input's programmatic click() so the native change fires and reuses the
// single up-flow path (ripple + emit + sync) — no duplicated commit logic.
// Space is the input's own native behaviour; Enter is deliberately NOT
// intercepted (it belongs to form submission, as with native radios).
const onKeyDown = (event: KeyboardEvent) => {
  const prev = event.key === 'ArrowUp' || event.key === 'ArrowLeft';

  const next = event.key === 'ArrowDown' || event.key === 'ArrowRight';

  if (!prev && !next) return;

  const rs = radios();

  // Keyboard events are composed, so they bubble out of the focused radio's
  // shadow root with the radio on the composed path.
  const from = event
    .composedPath()
    .find((n): n is CRadioEl => rs.includes(n as CRadioEl));

  if (!from) return;

  const enabled = rs.filter((r) => isEnabled(r));

  if (enabled.length === 0) return;
  event.preventDefault();

  const index = enabled.indexOf(from);

  const target =
    enabled[(index + (next ? 1 : -1) + enabled.length) % enabled.length];

  const input = inputOf(target);
  input?.focus();
  input?.click();
};

// Visuals-only: re-sync when the parent (or our own emitModelValue host
// `value` mirror) changes the value; never emit here (would loop with
// v-model).
watch(
  () => props.value,
  (v) => {
    internalValue.value = v == null ? null : String(v);
    syncRadios();
  },
);

watch(
  () => props.disabled,
  () => syncRadios(),
);

let observer: MutationObserver | null = null;
onMounted(() => {
  if (!host) return;
  host.addEventListener('change', onRadioChange);
  host.addEventListener('keydown', onKeyDown);

  if (typeof MutationObserver !== 'undefined') {
    // Radios appearing/disappearing anywhere in the slotted tree, or changing
    // their `value`/`disabled` (Vue defineCustomElement reflects primitive
    // prop writes back to attributes, so property changes land here too).
    // The filter keeps consumer wrapper-element mutations (class churn etc.)
    // from re-running the pass.
    observer = new MutationObserver(() => {
      syncRadios();
      // A just-inserted <c-radio> may not have rendered its shadow input yet.
      requestAnimationFrame(() => syncRadios());
    });
    observer.observe(host, {
      attributeFilter: ['disabled', 'value'],
      attributes: true,
      childList: true,
      subtree: true,
    });
  }

  // Drive the initial state. Double rAF so the slotted radios' shadow roots
  // exist before we reach into them (c-button-group precedent).
  requestAnimationFrame(() => requestAnimationFrame(() => syncRadios()));
});
onBeforeUnmount(() => {
  observer?.disconnect();
  host?.removeEventListener('change', onRadioChange);
  host?.removeEventListener('keydown', onKeyDown);
});
</script>

<!--
  Escape-hatch CSS: only the host box rule remains — everything else moved
  into <c-radio> (which owns its own visuals now) or FieldMessage. `:host`
  restores a box (the global sheet sets `:host{display:contents}`) so the
  group lays out as a flex column with a 4px gap and fit-content width.
  Targets the host, not a `tv` element.
-->
<style>
:host {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: fit-content;
}
</style>
