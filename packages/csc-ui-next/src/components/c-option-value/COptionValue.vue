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

<style>
:host {
  display: block;
}
</style>
