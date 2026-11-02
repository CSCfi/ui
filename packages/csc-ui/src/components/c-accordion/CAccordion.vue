<template>
  <div :class="accordion().root()" part="root">
    <slot />
  </div>
</template>

<script lang="ts">
/**
 * Value of `c-accordion`: the expanded item's `value`, an array of them in
 * `multiple` mode, or `null` when every item is collapsed.
 */
export type CAccordionValue = (number | string)[] | null | number | string;

interface CAccordionProps {
  /**
   * Keeps the last expanded item from collapsing: its header stops
   * responding until another item expands. It never expands an item
   * itself, so pair it with an initial `value`.
   */
  mandatory?: boolean;

  /**
   * Lets items expand and collapse independently; `value` is then an array
   * of the expanded items' values.
   */
  multiple?: boolean;

  /**
   * Adds a primary ring inside the outline of expanded items.
   */
  outlined?: boolean;

  /**
   * The expanded item's `value`, an array of them with `multiple`, or `null`
   * when every item is collapsed.
   */
  value?: CAccordionValue;
}
</script>

<script setup lang="ts">
/**
 * @slot default - The `c-accordion-item` elements, as direct children
 *
 * @csspart root - The column holding the items
 *
 * @subcomponents c-accordion-item
 */
import { tv } from 'tailwind-variants';
import { onBeforeUnmount, onMounted, ref, useHost, watch } from 'vue';

import { emitModelChange } from '../../shared/valueEvents';

type AccordionPrimitive = number | string;

/** Events dispatched by `<c-accordion>`. */
interface CAccordionEvents {
  /**
   * Fired when the user toggles an item, carrying the new value: the expanded
   * item's value, an array of values in `multiple` mode, or `null` when
   * everything is collapsed.
   */
  change: CAccordionValue;

  /**
   * Native bubbling input event dispatched alongside every value change so a
   * plain `v-model` stays in sync. Carries no detail.
   */
  input: void;

  /**
   * Fired alongside `change` with the same detail — the `v-model` contract.
   */
  'update:value': CAccordionValue;
}

// Styling lives in `tailwind-variants`: no `<style>` block, no
// `--c-*` override vars. The accordion is layout-only — the visual styling
// lives on c-accordion-item, whose collapsed items stack flush into one
// **accordion frame** (CONTEXT.md), so the column has no gap: an expanded
// item clears its neighbours with its own margin. Consumer customization is
// via `::part(root)`; there is no `override` prop.
const accordion = tv({
  slots: {
    root: 'flex max-w-full flex-col',
  },
});

const props = withDefaults(defineProps<CAccordionProps>(), {
  mandatory: false,
  multiple: false,
  outlined: false,
  value: null,
});

const host = useHost();

// Internal state lets the accordion work without v-model. We mirror the
// `value` prop in, then mutate this on itemchange events so the UI updates
// immediately. `update:value` is emitted so v-model consumers stay in sync.
const internalValue = ref<CAccordionValue>(props.value as CAccordionValue);

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

    // HTML-authored items upgrade after this host, so at mount their `value`
    // property is still undefined (an SSR page, `innerHTML`, a static
    // document); the attribute carries the same value.
    const itemValue =
      (item as unknown as { value?: AccordionPrimitive }).value ??
      (item.getAttribute('value') as AccordionPrimitive | null) ??
      undefined;

    if (itemValue === undefined) continue;
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

  // The item's wiring event ends here: a nested accordion's items must not
  // reach an outer one.
  event.stopPropagation();

  const { expanded, value: itemValue } = ce.detail;

  let next: CAccordionValue;

  if (props.multiple) {
    const current = internalValue.value;

    // A single value (the `value` attribute carries one) is the first
    // expanded item, not dropped.
    const arr: AccordionPrimitive[] = Array.isArray(current)
      ? [...current]
      : current == null
        ? []
        : [current];

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
  // A toggle is its own commit. The value watch is visuals-only, so the host
  // `value` mirror doesn't loop.
  emitModelChange(host, next satisfies CAccordionEvents['change']);
};

// `itemchange` is dispatched on the child c-accordion-item's host element
// (in the light DOM). It bubbles up to OUR host element, but never enters
// our shadow root — so a listener in the template would never fire. The
// listener must be attached to the host directly.
onMounted(() => {
  host?.addEventListener('itemchange', onItemChange);
  applyExpansionToItems();

  // Items added later (a v-for that grows, an async list) are set up too.
  // Attributes on Vue's <slot> element are slot props, so the native outlet
  // is wired imperatively (as in CTable).
  host?.shadowRoot
    ?.querySelector('slot')
    ?.addEventListener('slotchange', applyExpansionToItems);
});

onBeforeUnmount(() => {
  host?.removeEventListener('itemchange', onItemChange);
});

// Mirror controlled updates from props into internal state.
watch(
  () => props.value,
  (v) => {
    internalValue.value = v as CAccordionValue;
  },
);

// Whenever any input changes, re-apply expansion to children.
watch(internalValue, applyExpansionToItems, { deep: true });
watch(() => props.outlined, applyExpansionToItems);
watch(() => props.mandatory, applyExpansionToItems);
</script>
