<template>
  <div :class="accordion().root()" part="root">
    <slot />
  </div>
</template>

<script setup lang="ts">
/**
 * @slot default - Default slot for the c-accordion-item components
 *
 * @csspart root - The outer wrapper stacking the accordion items vertically
 *
 * @seeded from csc-ui — verify
 */
import { tv } from 'tailwind-variants';
import { onBeforeUnmount, onMounted, ref, useHost, watch } from 'vue';

import { emitModelValue } from '../../shared/emitModelValue';
import { useHostEmit } from '../../shared/useHostEmit';

type AccordionPrimitive = number | string;

type AccordionValue = AccordionPrimitive | AccordionPrimitive[] | null;

/** Events dispatched by `<c-accordion>`. */
interface CAccordionEvents {
  /**
   * Fired when the expansion state changes, carrying the new value as a bare
   * `detail`: the expanded item's value, an array of values in `multiple`
   * mode, or `null` when everything is collapsed.
   */
  change: AccordionValue;
  /**
   * Legacy value-change event carrying the new expansion value (kept for
   * existing `@changeValue` listeners and the `v-control` directive).
   */
  changeValue: AccordionValue;
  /**
   * Native bubbling input event dispatched alongside `changeValue` so a plain
   * `v-model` works without `v-control`; carries no detail.
   */
  input: void;
  /**
   * Fired with the new expansion value whenever an item is toggled — the
   * `v-model` contract.
   */
  'update:value': AccordionValue;
}

// Styling lives in `tailwind-variants` (ADR-0004): no `<style>` block, no
// `--c-*` override vars. The accordion is layout-only — the visual styling
// lives on c-accordion-item. Consumer customization is via `::part(root)`
// (ADR-0006); there is no `override` prop.
const accordion = tv({
  slots: {
    root: 'flex flex-col gap-2 max-w-full',
  },
});

interface CAccordionProps {
  /**
   * Disallow collapsing all the items
   *
   * @seeded from csc-ui — verify
   */
  mandatory?: boolean;
  /**
   * Allow expanding multiple items
   *
   * @seeded from csc-ui — verify
   */
  multiple?: boolean;
  /**
   * Show an outline around expanded items
   *
   * @seeded from csc-ui — verify
   */
  outlined?: boolean;
  /**
   * Value of the accordion
   *
   * @seeded from csc-ui — verify
   */
  value?: AccordionValue;
}

const props = withDefaults(defineProps<CAccordionProps>(), {
  mandatory: false,
  multiple: false,
  outlined: false,
  value: null,
});

const host = useHost();

// Events go through useHostEmit (not Vue's `emit()`) so `detail` stays the
// bare value — Vue's defineCustomElement emit wraps args into
// `detail: [...args]` (always an array), which breaks consumers like the
// legacy `v-control` directive that do `el.value = event.detail`.
const emit = useHostEmit<CAccordionEvents>();

// Internal state lets the accordion work without v-model. We mirror the
// `value` prop in, then mutate this on item-change events so the UI updates
// immediately. `update:value` is emitted so v-model consumers stay in sync.
const internalValue = ref<AccordionValue>(props.value as AccordionValue);

const isExpanded = (itemValue: AccordionPrimitive) => {
  const v = internalValue.value;

  if (Array.isArray(v)) return v.includes(itemValue);

  return v === itemValue;
};

const isLastExpanded = (itemValue: AccordionPrimitive) => {
  const v = internalValue.value;

  if (Array.isArray(v)) return v.length === 1 && v[0] === itemValue;

  return v === itemValue;
};

const applyExpansionToItems = () => {
  if (!host) return;

  // c-accordion-item children live in the LIGHT DOM (children of host),
  // not in the shadow root — the slot just projects them.
  const items = Array.from(host.children) as HTMLElement[];

  for (const item of items) {
    if (item.tagName?.toLowerCase() !== 'c-accordion-item') continue;

    const itemValue = (item as unknown as { value: AccordionPrimitive }).value;
    (item as unknown as { collapsable: boolean }).collapsable =
      !props.mandatory || !isLastExpanded(itemValue);
    (item as unknown as { outlined: boolean }).outlined = props.outlined;
    (item as unknown as { expanded: boolean }).expanded = isExpanded(itemValue);
  }
};

const onItemChange = (event: Event) => {
  const ce = event as CustomEvent<{
    expanded: boolean;
    value: AccordionPrimitive;
  }>;

  const { expanded, value: itemValue } = ce.detail;

  let next: AccordionValue;

  if (props.multiple) {
    const current = internalValue.value;

    const arr: AccordionPrimitive[] = Array.isArray(current)
      ? [...current]
      : [];

    if (expanded) {
      if (!arr.includes(itemValue)) arr.push(itemValue);
    } else {
      const i = arr.indexOf(itemValue);

      if (i >= 0) arr.splice(i, 1);
    }

    next = arr;
  } else {
    next = expanded ? itemValue : null;
  }

  internalValue.value = next;
  // changeValue/update:value + native `input` (so a plain `v-model` works
  // without `v-control`) + host `value` mirror. The value watch is
  // visuals-only, so writing the property doesn't loop.
  emitModelValue(host, next);
  // Domain `change` event (bare value) for non-v-model consumers.
  emit('change', next);
};

// `item-change` is dispatched on the child c-accordion-item's host element
// (in the light DOM). It bubbles up to OUR host element, but never enters
// our shadow root — so listening via `@item-change` in the template would
// never fire. The listener must be attached to the host directly.
onMounted(() => {
  host?.addEventListener('item-change', onItemChange);
  applyExpansionToItems();
});

onBeforeUnmount(() => {
  host?.removeEventListener('item-change', onItemChange);
});

// Mirror controlled updates from props into internal state.
watch(
  () => props.value,
  (v) => {
    internalValue.value = v as AccordionValue;
  },
);

// Whenever any input changes, re-apply expansion to children.
watch(internalValue, applyExpansionToItems, { deep: true });
watch(() => props.outlined, applyExpansionToItems);
watch(() => props.mandatory, applyExpansionToItems);
</script>
