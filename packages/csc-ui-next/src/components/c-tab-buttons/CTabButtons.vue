<template>
  <slot />
</template>

<script setup lang="ts">
import { onMounted, ref, useHost, watch } from 'vue';
import { coerceBoolean } from '../../shared/coerceBoolean';

// `<slot />` root (fragment) + we write to the host below — keep fallthrough
// attrs on the host element instead of tripping the "renders fragment" warning.
defineOptions({ inheritAttrs: false });

const props = defineProps({
  value: { type: [Number, String], default: 0 },
  mandatory: { type: Boolean, default: false },
  // Set by c-tabs when this acts as its tab controller.
  tabs: { type: Boolean, default: false },
  size: { type: String, default: 'default' },
  disabled: { type: Boolean, default: false },
});

const host = useHost();
const dispatchValue = (value: unknown) => {
  host?.dispatchEvent(new CustomEvent('changeValue', { detail: value }));
  host?.dispatchEvent(new CustomEvent('update:value', { detail: value }));
};

// Internal value mirror. Vue props are read-only, so we cannot do
// `this.value = next` like Stencil did inside the tabChange handler —
// without an internal state, clicking a button can update only the
// outlined visuals while `props.value` stays at its initial default,
// breaking subsequent click logic (e.g. clicking the originally-default
// index toggles the deselect branch every time). Drive every isActive
// check off `internalValue` and keep it in sync with `props.value`.
const internalValue = ref<number | string | null>(props.value);
let isIndexBased = false;
let focusedTabValue: number | string = props.value;

// c-tabs uses setAttribute('tabs', 'true'), which Vue's Boolean prop
// validator warns about. Tolerate both — read the host attribute too.
const isInTabsMode = (): boolean => {
  if (coerceBoolean(props.tabs)) return true;
  if (!host) return false;
  return host.hasAttribute('tabs') && host.getAttribute('tabs') !== 'false';
};

type CButtonEl = HTMLElement & {
  value?: number | string;
  disabled?: boolean;
  outlined?: boolean;
  size?: string;
};

const buttons = () =>
  Array.from(host?.querySelectorAll(':scope > c-button') ?? []) as CButtonEl[];

const availableValues = () =>
  buttons().map((b) => b.value ?? b.dataset.index);

const getTabIndex = (value: string | number) =>
  availableValues().findIndex((v) => v === value);

// Reflect the active button: every enabled button is outlined except the
// active one (solid). Touch both prop and attribute on every iteration
// (rather than "set all then unset one") because Vue defineCustomElement
// reflects Boolean prop changes back to the attribute — leaving stale
// `outlined` props can re-add the attribute on the active button after
// removeAttribute runs.
const applyActive = (value: number | string | null) => {
  const btns = buttons();
  const active =
    value === null || value === undefined
      ? undefined
      : btns.find((b) => b.value === value) ?? btns[value as number];
  btns.forEach((b) => {
    if (b.disabled) return;
    const shouldOutline = b !== active;
    b.outlined = shouldOutline;
    // Mirror the boolean prop to the attribute the way Vue's
    // defineCustomElement reflects it: present-and-empty for true. A literal
    // `'true'` string would fail c-button's Boolean prop validator.
    if (shouldOutline) b.setAttribute('outlined', '');
    else b.removeAttribute('outlined');
  });
};

watch(
  () => props.value,
  (value) => {
    internalValue.value = value;
    applyActive(value);
    dispatchValue(buttons()[value as number]?.value ?? value);
  },
);

onMounted(() => {
  if (!host) return;
  host.classList.add('c-tab-buttons');
  host.classList.toggle('disabled', props.disabled);

  const btns = buttons();
  isIndexBased = btns.every((b) => typeof b.value === 'undefined');

  btns.forEach((button, index) => {
    button.setAttribute('data-index', String(index));
    // Set the property (boolean) rather than the attribute (string) —
    // Vue defineCustomElement's boolean prop coercion warns about
    // string "true" coming in via setAttribute.
    (button as unknown as { tabs: boolean }).tabs = true;
    button.disabled = props.disabled || button.disabled;
    button.size = props.size;

    const isActive =
      props.value !== null &&
      (isIndexBased ? index === +props.value : button.value === props.value);

    // Set outlined PER button (active=false, inactive=true). Doing the
    // common "set all, then unset active" pattern fails here: Vue's
    // defineCustomElement reflects Boolean prop changes back to the
    // attribute, so a later `button.outlined = true` (or the lingering
    // prop value) can re-add `outlined=""` to the active button. The
    // active button would then visually appear outlined, the user
    // clicks it expecting "select", we detect isActive=true and
    // deselect — so the first click does nothing visible and the
    // second click "finally works".
    if (!button.disabled) {
      const shouldOutline = !isActive;
      button.outlined = shouldOutline;
      // Empty attribute (not the string 'true') so c-button's Boolean prop
      // validator doesn't reject it — see applyActive above.
      if (shouldOutline) button.setAttribute('outlined', '');
      else button.removeAttribute('outlined');
    }

    button.shadowRoot
      ?.querySelector('button, a')
      ?.setAttribute('tabindex', isActive && !props.disabled ? '0' : '-1');
  });

  // Selection toggling on click. Two modes:
  //  - Tabs mode (acting as c-tabs's controller): let the tabChange event
  //    bubble up to c-tabs and let c-tabs push the new value back via
  //    `tb.value = ...`. Don't touch local state — c-tabs owns the value
  //    and forbids deselection, so handling it here would just race.
  //  - Standalone mode: own the value via internalValue. Update outlines
  //    immediately and emit changeValue so v-control / v-model consumers
  //    sync their state. Clicking the active button toggles it off
  //    (unless `mandatory`).
  host.addEventListener('tabChange', (e) => {
    const ev = e as CustomEvent<{ value: number | string }>;
    if (isInTabsMode()) return;
    ev.stopPropagation();
    const current = internalValue.value;
    const isActive =
      current !== null &&
      (isIndexBased
        ? +ev.detail.value === +(current as number)
        : ev.detail.value === current);
    if (props.mandatory && isActive) return;
    const nullValue = isIndexBased ? null : '';
    const next = isIndexBased ? +ev.detail.value : ev.detail.value;
    const resolved = (isActive ? nullValue : next) as number | string;
    internalValue.value = resolved;
    applyActive(resolved);
    dispatchValue(resolved);
  });

  host.addEventListener('tabFocus', (e) => {
    const ev = e as CustomEvent<number | string>;
    ev.stopPropagation();
    focusedTabValue = ev.detail;
  });

  // Arrow-key navigation between buttons.
  host.addEventListener(
    'keyup',
    (e) => {
      const ev = e as KeyboardEvent;
      ev.stopPropagation();
      const isLeft = ev.key === 'ArrowLeft';
      const isRight = ev.key === 'ArrowRight';
      if (!isLeft && !isRight) return;

      const values = availableValues();
      const tabIndex =
        getTabIndex(focusedTabValue) ??
        +(buttons()[focusedTabValue as number]?.dataset.index ?? 0);
      const first = values.at(0);
      const last = values.at(-1);
      const isBeginning = focusedTabValue === first;
      const isEnd = focusedTabValue === last;
      const nextValue = isEnd ? first : values[tabIndex + 1];
      const prevValue = isBeginning ? last : values[tabIndex - 1];
      const target = isLeft ? prevValue : nextValue;

      const item = buttons()
        .find((b) => b.value === target || b.dataset.index === target)
        ?.shadowRoot?.querySelector('button, a') as HTMLElement | undefined;
      requestAnimationFrame(() => item?.focus());
    },
    true,
  );
});
</script>

<style>
:host {
  --_c-tab-buttons-background-color-active-hover: var(--c-tab-buttons-background-color-active-hover, var(--c-primary-400));
  --_c-tab-buttons-background-color-active: var(--c-tab-buttons-background-color-active, var(--c-primary-600));
  --_c-tab-buttons-text-color-active: var(--c-tab-buttons-text-color-active, var(--c-white));
  --_c-tab-buttons-background-color-hover: var(--c-tab-buttons-background-color-hover, var(--c-primary-200));
  --_c-tab-buttons-background-color: var(--c-tab-buttons-background-color, var(--c-white));
  --_c-tab-buttons-border-color: var(--c-tab-buttons-border-color, var(--c-primary-600));
  --_c-tab-buttons-text-color: var(--c-tab-buttons-text-color, var(--c-primary-600));
  --_c-tab-buttons-border-color-disabled: var(--c-tab-buttons-border-color-disabled, var(--c-tertiary-400));
  --_c-tab-buttons-border-radius: var(--c-tab-buttons-border-radius, 4px);

  background-color: var(--_c-tab-buttons-border-color);
  border-radius: var(--_c-tab-buttons-border-radius);
  box-shadow: 0 0 0 2px var(--_c-tab-buttons-border-color);
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  margin: 2px;
}

::slotted(c-button) {
  --c-button-background-color-hover: var(--_c-tab-buttons-background-color-active-hover);
  --c-button-background-color: var(--_c-tab-buttons-background-color-active);
  --c-button-text-color: var(--_c-tab-buttons-text-color-active);
  --_c-button-border-radius: 0;
  --_c-button-min-width: auto;
  --_c-button-padding: 0 8px;
  --_c-button-outline-offset: 4px;

  flex-grow: 1;
}

::slotted(c-button[outlined]) {
  --c-button-outlined-background-color-hover: var(--_c-tab-buttons-background-color-hover);
  --c-button-outlined-background-color: var(--_c-tab-buttons-background-color);
  --c-button-outlined-border-color: var(--_c-tab-buttons-border-color);
  --c-button-outlined-text-color: var(--_c-tab-buttons-text-color);

  box-shadow: none;
}

::slotted(c-button:first-child) {
  --_c-button-border-radius: var(--_c-tab-buttons-border-radius) 0 0 var(--_c-tab-buttons-border-radius);
}

::slotted(c-button:last-child) {
  --_c-button-border-radius: 0 var(--_c-tab-buttons-border-radius) var(--_c-tab-buttons-border-radius) 0;
}

::slotted(*) {
  flex-grow: 1;
}

:host(.disabled) {
  --_c-tab-buttons-border-color: var(--_c-tab-buttons-border-color-disabled) !important;
  pointer-events: none;
}

::slotted(c-button:focus-visible) {
  outline: 2px var(--_c-tab-buttons-border-color) solid;
  outline-offset: 4px;
  z-index: 1;
}
</style>
