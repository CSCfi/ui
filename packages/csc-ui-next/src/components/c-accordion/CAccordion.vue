<template>
  <div class="c-accordion">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useHost, watch } from 'vue';

type AccordionPrimitive = number | string;
type AccordionValue = AccordionPrimitive | AccordionPrimitive[] | null;

const props = defineProps({
  value: { type: [Number, String, Array], default: null },
  mandatory: { type: Boolean, default: false },
  multiple: { type: Boolean, default: false },
  outlined: { type: Boolean, default: false },
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
    value: AccordionPrimitive;
    expanded: boolean;
  }>;
  const { value: itemValue, expanded } = ce.detail;
  let next: AccordionValue;
  if (props.multiple) {
    const current = internalValue.value;
    const arr: AccordionPrimitive[] = Array.isArray(current) ? [...current] : [];
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
  dispatchValue('update:value', next);
  dispatchValue('change', next);
  // Transitional bridge for legacy `v-control` directive (Stencil-era
  // `changeValue` event). ADR 0003 drops this at v1.
  dispatchValue('changeValue', next);
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

<style>
:host {
  display: block;
}

.c-accordion {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
