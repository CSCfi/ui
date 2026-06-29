<template>
  <slot />
</template>

<script setup lang="ts">
// Faithful port of c-option-value (Stencil). A presentational wrapper the
// consumer places inside a <c-option> to mark the displayed text; c-dropdown
// targets it (`c-option-value`) when highlighting matched query text in
// autocomplete mode.

// Template is a bare `<slot />` (fragment root), so attrs can't be
// auto-inherited; keep any consumer `class`/`style` on the host element
// rather than tripping the "renders fragment" warning.
defineOptions({ inheritAttrs: false });
</script>

<!--
  Escape-hatch CSS (ADR-0007): this component renders a bare `<slot />` with no
  element to hang a utility class on, and its only style is the host box itself.
  `:host{display:block}` overrides the global `:host{display:contents}` so the
  wrapper is a real block box (c-dropdown's autocomplete code targets the
  `c-option-value` element and writes its innerHTML) — utilities can't target
  the host. No tv config: there is no inner region to style.
-->
<style>
:host {
  display: block;
}
</style>
