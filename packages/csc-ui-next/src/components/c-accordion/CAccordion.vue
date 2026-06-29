<template>
  <div :class="accordion().root()" part="root">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { tv } from 'tailwind-variants';
import { onBeforeUnmount, onMounted, ref, useHost, watch } from 'vue';

import { emitModelValue } from '../../shared/emitModelValue';

type AccordionPrimitive = number | string;

type AccordionValue = AccordionPrimitive | AccordionPrimitive[] | null;

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
  mandatory?: boolean;
  multiple?: boolean;
  outlined?: boolean;
  value?: AccordionValue;
}

const props = withDefaults(defineProps<CAccordionProps>(), {
  mandatory: false,
  multiple: false,
  outlined: false,
  value: null,
});

const host = useHost();

// Event emissions go through manual `host.dispatchEvent` instead of
// Vue's `emit()`. Vue's defineCustomElement emit wraps every emit's
// args into `detail: [...args]` (always an array), which breaks
// consumers like the legacy `v-control` directive that do
// `el.value = event.detail`. Manual dispatch keeps `detail` as the
// bare value. See c-checkbox for the same pattern.
const dispatchValue = (name: string, value: AccordionValue) => {
  host?.dispatchEvent(new CustomEvent(name, { detail: value }));
};

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
  dispatchValue('change', next);
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
