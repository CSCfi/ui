<template>
  <slot />
</template>

<script setup lang="ts">
/**
 * @slot default - The option's visible label content, shown in the c-select dropdown list
 */
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

interface COptionProps {
  /** Set option as disabled */
  disabled?: boolean;
  /** Option name (display label fallback) */
  name?: string;
  /** Set option as selected */
  selected?: boolean;
  /** Option value */
  value?: number | string;
}

withDefaults(defineProps<COptionProps>(), {
  disabled: false,
  name: undefined,
  selected: false,
  value: undefined,
});

const host = useHost();

// Stencil rendered <Host tabindex="-1">. Mirror it so focus behaviour and
// any consumer styling keyed on the attribute carry over.
onMounted(() => host?.setAttribute('tabindex', '-1'));
</script>

<!--
  Escape-hatch CSS (ADR-0007): this component renders a bare `<slot />` with no
  element to hang a utility class on, and its only styling is the host box
  itself. `:host{display:block;width:100%;padding:8px 0}` overrides the global
  `:host{display:contents}` so the option is a real padded block — utilities
  can't target the host, and c-select/c-dropdown read this element's outerHTML
  to render the list, so the box must live on the host. No tv config: there is
  no inner region to style. Authored against global design tokens only.
-->
<style>
:host {
  display: block;
  width: 100%;
  padding: 8px 0;
}
</style>
