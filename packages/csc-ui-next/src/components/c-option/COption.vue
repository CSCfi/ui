<template>
  <slot />
</template>

<script setup lang="ts">
import { onMounted, useHost } from 'vue';

// Faithful port of c-option (Stencil). Declarative item for <c-select>:
// the consumer writes <c-option :value="..." name="...">Label</c-option>,
// and c-select discovers these via its default slot. c-dropdown reads the
// `value` / `name` / `selected` / `disabled` properties (and `outerHTML`)
// off each option element when rendering the list, so these must be exposed
// as element properties — which Vue's defineCustomElement does for declared
// props.
// The template is a bare `<slot />`, i.e. a fragment root, so any attribute
// on the host can't be auto-inherited. We deliberately set `tabindex="-1"`
// on the host below (and consumers may add `class`/`style`); opt out of
// attr inheritance so those land on the host element — which is the styled
// box — instead of tripping the "renders fragment" warning.
defineOptions({ inheritAttrs: false });

defineProps({
  /** Set option as selected */
  selected: { type: Boolean, default: false },
  /** Set option as disabled */
  disabled: { type: Boolean, default: false },
  /** Option name (display label fallback) */
  name: { type: String, default: undefined },
  /** Option value */
  value: { type: [String, Number], default: undefined },
});

const host = useHost();

// Stencil rendered <Host tabindex="-1">. Mirror it so focus behaviour and
// any consumer styling keyed on the attribute carry over.
onMounted(() => host?.setAttribute('tabindex', '-1'));
</script>

<style>
:host {
  display: block;
  width: 100%;
  padding: 8px 0;
}
</style>
